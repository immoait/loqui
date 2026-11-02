import AVFoundation
import Foundation

struct CoachSettings: Codable, Equatable {
    var backendURL = "http://localhost:3000"
    var callType: CallType = .discovery
    var enabled: [CardType: Bool] = [.answer: true, .question: true, .behavior: true]
    var minGapSec: Double = 20
    var minConfidence: Double = 0.6
    var storeTranscript = false

    static func load() -> CoachSettings {
        guard let data = UserDefaults.standard.data(forKey: "settings"),
              let s = try? JSONDecoder().decode(CoachSettings.self, from: data) else { return CoachSettings() }
        return s
    }

    func save() {
        if let data = try? JSONEncoder().encode(self) { UserDefaults.standard.set(data, forKey: "settings") }
    }
}

enum SessionMode { case idle, starting, live }

@MainActor
final class SessionController: ObservableObject {
    @Published var mode: SessionMode = .idle
    @Published var utterances: [Utterance] = []
    @Published var partial: [Speaker: String] = [:]
    @Published var cards: [CoachCard] = []
    @Published var thinking = false
    @Published var error: String?
    @Published var notice: String?
    @Published var elapsedMs = 0
    @Published var lastReport: SessionReport?
    @Published var settings = CoachSettings.load() {
        didSet { settings.save() }
    }

    /// Ein Impuls, der länger braucht, gehört nicht mehr zum Moment.
    private let staleAfterMs = 12_000
    private let localHintCooldownMs = 90_000

    private var mic = MicCapture()
    private var system = SystemAudioCapture()
    private var repTranscriber = RealtimeTranscriber(speaker: .rep, backendURL: "")
    private var customerTranscriber = RealtimeTranscriber(speaker: .customer, backendURL: "")
    private var startDate = Date()
    private var clock: Timer?
    private var lastLocalHintMs = Int.min / 2
    private var requestSeq = 0

    private func now() -> Int { Int(Date().timeIntervalSince(startDate) * 1000) }

    // MARK: Start / Stop

    func start() async {
        guard mode == .idle else { return }
        mode = .starting
        error = nil
        notice = nil

        guard await MicCapture.requestAccess() else {
            fail("Mikrofonzugriff nicht erlaubt. Bitte in Systemeinstellungen › Datenschutz › Mikrofon freigeben.")
            return
        }

        mic = MicCapture()
        system = SystemAudioCapture()
        repTranscriber = RealtimeTranscriber(speaker: .rep, backendURL: settings.backendURL)
        customerTranscriber = RealtimeTranscriber(speaker: .customer, backendURL: settings.backendURL)
        utterances = []
        cards = []
        partial = [:]
        lastLocalHintMs = Int.min / 2
        startDate = Date()
        elapsedMs = 0

        for tr in [repTranscriber, customerTranscriber] {
            let speaker = tr.speaker
            tr.onPartial = { [weak self] text in self?.partial[speaker] = text }
            tr.onFinal = { [weak self] text in self?.addUtterance(speaker, text) }
            tr.onIssue = { [weak self] msg in
                let who = speaker == .rep ? "Mikrofon" : "Systemaudio"
                self?.notice = "\(who): \(msg)"
            }
        }

        do {
            try await repTranscriber.start()
            try await customerTranscriber.start()
            let rep = repTranscriber
            mic.onBuffer = { rep.append($0) }
            try mic.start()
            DebugLog.log("mic started")
        } catch {
            DebugLog.log("start failed: \(error)")
            stopCapture()
            fail(error.localizedDescription)
            return
        }

        // Systemaudio ist optional: ohne Freigabe läuft der Coach nur mit dem eigenen Mikrofon.
        let customer = customerTranscriber
        system.onBuffer = { customer.append($0) }
        system.onError = { [weak self] err in
            Task { @MainActor in self?.notice = "Systemaudio gestoppt: \(err.localizedDescription)" }
        }
        do {
            try await system.start()
            DebugLog.log("system audio capture started")
        } catch {
            DebugLog.log("system audio capture failed: \(error)")
            notice = "Kein Systemaudio – die Gegenseite wird nicht gehört. Freigabe unter Systemeinstellungen › Datenschutz & Sicherheit › Bildschirm- & Systemaudioaufnahme › „Nur Systemaudioaufnahme“, danach App neu starten."
        }

        mode = .live
        clock = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self else { return }
            Task { @MainActor in self.elapsedMs = self.now() }
        }
    }

    func stop() {
        guard mode == .live else { return }
        stopCapture()
        mode = .idle
        thinking = false
        partial = [:]
        let report = SessionReport(
            id: UUID().uuidString,
            startedAt: startDate,
            durationMs: now(),
            callType: settings.callType,
            cards: cards,
            talkShareRep: talkShare(since: 0).share,
            transcript: settings.storeTranscript ? utterances : nil)
        lastReport = report
        ReportStore.save(report)
        // Transkript nur im Speicher; verwerfen, wenn es nicht gespeichert werden soll.
        if !settings.storeTranscript { utterances = [] }
    }

    private func stopCapture() {
        clock?.invalidate()
        clock = nil
        mic.stop()
        system.stop()
        repTranscriber.stop()
        customerTranscriber.stop()
    }

    private func fail(_ message: String) {
        error = message
        mode = .idle
    }

    // MARK: Gesprächsverlauf

    private func addUtterance(_ speaker: Speaker, _ text: String) {
        guard mode == .live else { return }
        let u = Utterance(id: UUID().uuidString, speaker: speaker, text: text, t: now())
        if speaker == .rep && isEcho(u) { return }
        utterances.append(u)
        checkLocalHints(u)
        Task { await askCoach(u) }
    }

    /// Abruf per Taste oder Chip: Der Coach antwortet immer, Filter greifen nicht.
    func pull(_ question: String? = nil) {
        guard mode == .live else { return }
        let latest = utterances.last ?? Utterance(id: "pull", speaker: .rep, text: "", t: now())
        Task { await askCoach(latest, pull: question ?? "") }
    }

    /// Ohne Kopfhörer landet die Gegenseite auch im Mikrofon. Solche Echos verwerfen.
    private func isEcho(_ u: Utterance) -> Bool {
        let mine = Self.wordSet(u.text)
        guard mine.count >= 3 else { return false }
        return utterances.reversed().prefix(4).contains { other in
            guard other.speaker == .customer, u.t - other.t < 8_000 else { return false }
            let theirs = Self.wordSet(other.text)
            let overlap = Double(mine.intersection(theirs).count) / Double(mine.count)
            return overlap >= 0.6
        }
    }

    private static func wordSet(_ s: String) -> Set<String> {
        Set(s.lowercased().split { !$0.isLetter && !$0.isNumber }.map(String.init))
    }

    func talkShare(since: Int) -> (rep: Int, total: Int, share: Double) {
        var rep = 0, total = 0
        for u in utterances where u.t >= since {
            let w = u.text.split(separator: " ").count
            total += w
            if u.speaker == .rep { rep += w }
        }
        return (rep, total, total > 0 ? Double(rep) / Double(total) : 0)
    }

    // MARK: Impulse

    /// Beispielkarte, um Aussehen und Position des Overlays ohne Gespräch zu prüfen.
    func showTestCard() {
        let t = now()
        cards.insert(CoachCard(
            id: UUID().uuidString, type: .answer, title: "Preis: ab 49 € pro Nutzer und Monat",
            bullets: ["Jahresvertrag: 2 Monate geschenkt", "Ab 50 Nutzern individuelles Angebot"],
            say: "Für euer Team liegen wir bei 49 Euro pro Nutzer und Monat, mit Jahresvertrag schenken wir zwei Monate.",
            sources: ["Preise"], missingInfo: nil, confidence: 0.9, expand: true, triggerT: t, shownT: t, origin: "test"), at: 0)
    }

    /// Deterministische Verhaltenshinweise: schnell, ohne API-Aufruf.
    private func checkLocalHints(_ latest: Utterance) {
        guard settings.enabled[.behavior] == true, latest.speaker == .rep else { return }
        let t = now()
        guard t - lastLocalHintMs >= localHintCooldownMs else { return }
        let recent = talkShare(since: t - 120_000)
        var title: String?
        var bullet = ""
        if latest.text.split(separator: " ").count >= 45 {
            title = "Lass kurz Raum für eine Antwort"
            bullet = "Langer Redeanteil am Stück. Eine offene Frage gibt dem Kunden das Wort zurück."
        } else if recent.total >= 80 && recent.share > 0.7 {
            title = "Du sprichst gerade deutlich mehr"
            bullet = "Dein Redeanteil der letzten 2 Min.: \(Int(recent.share * 100)) %. Zuhören lohnt sich jetzt."
        }
        guard let title else { return }
        lastLocalHintMs = t
        cards.insert(CoachCard(
            id: UUID().uuidString, type: .behavior, title: title, bullets: [bullet], sources: [],
            missingInfo: nil, confidence: 0.7, triggerT: latest.t, shownT: t, origin: "local"), at: 0)
    }

    private func askCoach(_ latest: Utterance, pull: String? = nil) async {
        requestSeq += 1
        let seq = requestSeq
        thinking = true
        defer { if seq == requestSeq { thinking = false } }

        guard let url = URL(string: settings.backendURL)?.appendingPathComponent("api/coach") else {
            error = "Ungültige Backend-Adresse."
            return
        }
        var payload: [String: Any] = [
            "transcript": utterances.suffix(14).map { u -> [String: Any] in ["id": u.id, "speaker": u.speaker.rawValue, "text": u.text, "t": u.t] },
            "recentCards": cards.prefix(5).map { ["type": $0.type.rawValue, "title": $0.title] },
            "enabled": Dictionary(uniqueKeysWithValues: CardType.allCases.map { ($0.rawValue, settings.enabled[$0] ?? false) }),
            "callType": settings.callType.rawValue,
        ]
        if let pull { payload["pull"] = pull.isEmpty ? [:] : ["question": pull] }
        var req = URLRequest(url: url, timeoutInterval: 15)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        do {
            let (data, _) = try await URLSession.shared.data(for: req)
            let res = try JSONDecoder().decode(CoachResponse.self, from: data)
            guard mode == .live else { return }
            if let err = res.error {
                error = err
                return
            }
            error = nil
            guard let d = res.decision, d.show else { return }

            let t = now()
            let urgentAnswer = d.type == .answer && d.urgency >= 0.7
            if pull == nil {
                guard t - latest.t <= staleAfterMs else { return } // Moment vorbei – lieber schweigen.
                guard d.confidence >= settings.minConfidence else { return }
                // Frequenzgrenze; dringende Antworten auf Kundenfragen dürfen sie durchbrechen.
                let lastShown = cards.first { !$0.snoozed }?.shownT ?? Int.min / 2
                guard urgentAnswer || Double(t - lastShown) >= settings.minGapSec * 1000 else { return }
            }

            cards.insert(CoachCard(
                id: UUID().uuidString, type: d.type, title: d.title, bullets: Array(d.bullets.prefix(3)),
                say: d.say, sources: res.sources ?? [], missingInfo: d.missingInfo, confidence: d.confidence,
                expand: pull != nil || urgentAnswer, triggerT: latest.t, shownT: t, origin: pull != nil ? "pull" : "ai"), at: 0)
        } catch {
            self.error = "Coach-Backend nicht erreichbar (\(settings.backendURL))."
        }
    }

    func update(_ id: String, _ change: (inout CoachCard) -> Void) {
        guard let i = cards.firstIndex(where: { $0.id == id }) else { return }
        change(&cards[i])
    }
}

/// Berichte liegen lokal unter ~/Library/Application Support/Dealcoach/reports.
enum ReportStore {
    static var directory: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        return base.appendingPathComponent("Dealcoach/reports", isDirectory: true)
    }

    static func save(_ report: SessionReport) {
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        let enc = JSONEncoder()
        enc.outputFormatting = [.prettyPrinted]
        enc.dateEncodingStrategy = .iso8601
        try? enc.encode(report).write(to: directory.appendingPathComponent("\(report.id).json"))
    }

    static func deleteAll() {
        try? FileManager.default.removeItem(at: directory)
    }
}
