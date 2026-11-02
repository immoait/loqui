import AVFoundation
import Foundation

/// Streaming-Transkription einer Audiospur über die OpenAI Realtime API.
///
/// Der API-Key bleibt im Backend: Die App holt sich dort ein kurzlebiges Token
/// (`POST /api/realtime-token`) und verbindet sich damit direkt per WebSocket.
/// Das Ende einer Äußerung erkennt der Server (server_vad).
final class RealtimeTranscriber {
    let speaker: Speaker
    var onPartial: ((String) -> Void)?
    var onFinal: ((String) -> Void)?
    /// Meldet Probleme, die der Nutzer sehen sollte.
    var onIssue: ((String) -> Void)?

    private let backendURL: String
    private var socket: URLSessionWebSocketTask?
    private var running = false
    private let targetFormat = AVAudioFormat(commonFormat: .pcmFormatInt16, sampleRate: 24_000, channels: 1, interleaved: true)!
    private var converter: AVAudioConverter?
    private var converterInputFormat: AVAudioFormat?
    private var partials: [String: String] = [:]
    private let audioQueue = DispatchQueue(label: "dealcoach.realtime.audio")

    // Diagnose
    private var sentChunks = 0
    private var peak: Int16 = 0
    /// ~100 ms sammeln statt jedes 10-ms-Häppchen einzeln zu senden.
    private var pending = Data()
    private var lastStatsLog = Date()

    init(speaker: Speaker, backendURL: String) {
        self.speaker = speaker
        self.backendURL = backendURL
    }

    func start() async throws {
        let token = try await fetchToken()
        var request = URLRequest(url: URL(string: "wss://api.openai.com/v1/realtime?intent=transcription")!)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let socket = URLSession.shared.webSocketTask(with: request)
        self.socket = socket
        running = true
        socket.resume()
        receive()
        DebugLog.log("[\(speaker)] realtime connected")
    }

    func stop() {
        running = false
        socket?.cancel(with: .normalClosure, reason: nil)
        socket = nil
        DebugLog.log("[\(speaker)] realtime stopped")
    }

    /// Wird von den Audio-Threads aufgerufen: auf 24 kHz Mono PCM16 wandeln und senden.
    func append(_ buffer: AVAudioPCMBuffer) {
        audioQueue.async { [weak self] in self?.convertAndSend(buffer) }
    }

    private func convertAndSend(_ buffer: AVAudioPCMBuffer) {
        guard running, let socket else { return }
        if converter == nil || converterInputFormat != buffer.format {
            converter = AVAudioConverter(from: buffer.format, to: targetFormat)
            converterInputFormat = buffer.format
            DebugLog.log("[\(speaker)] input format: \(buffer.format)")
        }
        guard let converter else { return }
        let ratio = targetFormat.sampleRate / buffer.format.sampleRate
        let capacity = AVAudioFrameCount(Double(buffer.frameLength) * ratio) + 32
        guard let out = AVAudioPCMBuffer(pcmFormat: targetFormat, frameCapacity: capacity) else { return }

        var consumed = false
        var error: NSError?
        converter.convert(to: out, error: &error) { _, status in
            if consumed {
                status.pointee = .noDataNow
                return nil
            }
            consumed = true
            status.pointee = .haveData
            return buffer
        }
        guard error == nil, out.frameLength > 0, let ch = out.int16ChannelData else { return }
        let samples = UnsafeBufferPointer(start: ch[0], count: Int(out.frameLength))
        for v in samples {
            let m = v == .min ? Int16.max : abs(v)
            if m > peak { peak = m }
        }
        pending.append(Data(buffer: samples))
        guard pending.count >= 4_800 else { return }
        let message = "{\"type\":\"input_audio_buffer.append\",\"audio\":\"\(pending.base64EncodedString())\"}"
        pending.removeAll(keepingCapacity: true)
        socket.send(.string(message)) { [weak self] err in
            if let err, self?.running == true { DebugLog.log("send error: \(err.localizedDescription)") }
        }
        sentChunks += 1
        if Date().timeIntervalSince(lastStatsLog) >= 5 {
            // Pegel in dBFS: um -90 ist Stille, Sprache liegt meist zwischen -30 und -6.
            let db = peak == 0 ? -96 : 20 * log10(Double(peak) / 32_767)
            DebugLog.log("[\(speaker)] sent \(sentChunks) chunks/5s, peak \(Int(db)) dBFS")
            sentChunks = 0
            peak = 0
            lastStatsLog = Date()
        }
    }

    private func receive() {
        socket?.receive { [weak self] result in
            guard let self, self.running else { return }
            switch result {
            case .success(.string(let text)):
                self.handle(text)
                self.receive()
            case .success:
                self.receive()
            case .failure(let error):
                DebugLog.log("[\(self.speaker)] socket closed: \(error.localizedDescription)")
                DispatchQueue.main.async { self.onIssue?("Verbindung zur Transkription getrennt: \(error.localizedDescription)") }
            }
        }
    }

    private func handle(_ text: String) {
        guard let data = text.data(using: .utf8),
              let msg = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = msg["type"] as? String else { return }
        let itemId = msg["item_id"] as? String ?? ""

        switch type {
        case "conversation.item.input_audio_transcription.delta":
            let delta = msg["delta"] as? String ?? ""
            partials[itemId, default: ""] += delta
            let current = partials[itemId] ?? ""
            DispatchQueue.main.async { self.onPartial?(current) }
        case "conversation.item.input_audio_transcription.completed":
            partials[itemId] = nil
            let transcript = (msg["transcript"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            DebugLog.log("[\(speaker)] final: \(transcript.count) Zeichen")
            DispatchQueue.main.async {
                self.onPartial?("")
                if !transcript.isEmpty { self.onFinal?(transcript) }
            }
        case "error":
            let err = msg["error"] as? [String: Any]
            let message = err?["message"] as? String ?? text
            DebugLog.log("[\(speaker)] realtime error: \(message)")
            DispatchQueue.main.async { self.onIssue?("Transkription: \(message)") }
        case "input_audio_buffer.speech_started":
            // Text kommt erst nach dem Satzende; bis dahin zeigen, dass gesprochen wird.
            DebugLog.log("[\(speaker)] \(type)")
            DispatchQueue.main.async { self.onPartial?("spricht …") }
        default:
            if type.hasPrefix("session.") || type.hasPrefix("input_audio_buffer.speech") {
                DebugLog.log("[\(speaker)] \(type)")
            }
        }
    }

    private func fetchToken() async throws -> String {
        guard let url = URL(string: backendURL)?.appendingPathComponent("api/realtime-token") else {
            throw NSError(domain: "Dealcoach", code: 3, userInfo: [NSLocalizedDescriptionKey: "Ungültige Backend-Adresse."])
        }
        var req = URLRequest(url: url, timeoutInterval: 10)
        req.httpMethod = "POST"
        let (data, _) = try await URLSession.shared.data(for: req)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        if let value = json?["value"] as? String { return value }
        let message = json?["error"] as? String ?? "Kein Token vom Backend erhalten."
        throw NSError(domain: "Dealcoach", code: 4, userInfo: [NSLocalizedDescriptionKey: message])
    }
}
