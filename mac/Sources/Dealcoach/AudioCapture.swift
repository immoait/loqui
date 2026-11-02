import AVFoundation
import CoreAudio

/// Eigene Stimme: Mikrofon über AVAudioEngine.
final class MicCapture {
    private let engine = AVAudioEngine()
    var onBuffer: ((AVAudioPCMBuffer) -> Void)?

    func start() throws {
        let input = engine.inputNode
        let format = input.outputFormat(forBus: 0)
        DebugLog.log("mic format: \(format)")
        input.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            self?.onBuffer?(buffer)
        }
        engine.prepare()
        try engine.start()
    }

    func stop() {
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
    }

    static func requestAccess() async -> Bool {
        await AVCaptureDevice.requestAccess(for: .audio)
    }
}

/// Gegenseite: Systemaudio (Ton aus Zoom, Meet, Teams, Slack …) über einen Core-Audio-Process-Tap
/// (macOS 14.4+). Braucht nur die Freigabe „Nur Systemaudioaufnahme“, keine Bildschirmaufnahme.
///
/// Das installierte SDK (13.3) kennt die Tap-API noch nicht, deshalb werden
/// `AudioHardwareCreateProcessTap` und `CATapDescription` zur Laufzeit geladen.
final class SystemAudioCapture {
    var onBuffer: ((AVAudioPCMBuffer) -> Void)?
    var onError: ((Error) -> Void)?

    private var tapID = AudioObjectID(kAudioObjectUnknown)
    private var aggregateID = AudioObjectID(kAudioObjectUnknown)
    private var procID: AudioDeviceIOProcID?
    private let queue = DispatchQueue(label: "dealcoach.systemaudio")

    private typealias CreateTap = @convention(c) (UnsafeRawPointer, UnsafeMutablePointer<AudioObjectID>) -> OSStatus
    private typealias DestroyTap = @convention(c) (AudioObjectID) -> OSStatus

    func start() async throws {
        guard let handle = dlopen("/System/Library/Frameworks/CoreAudio.framework/CoreAudio", RTLD_NOW),
              let createSym = dlsym(handle, "AudioHardwareCreateProcessTap"),
              let cls = NSClassFromString("CATapDescription") as? NSObject.Type else {
            throw Self.error("Systemaudio braucht macOS 14.4 oder neuer.")
        }
        let createTap = unsafeBitCast(createSym, to: CreateTap.self)

        // Globaler Stereo-Tap über alle Prozesse, privat (taucht nicht als Gerät auf).
        let raw = cls.perform(NSSelectorFromString("alloc"))!.takeUnretainedValue() as! NSObject
        guard let desc = raw.perform(NSSelectorFromString("initStereoGlobalTapButExcludeProcesses:"), with: [NSNumber]())?
            .takeRetainedValue() as? NSObject else { throw Self.error("Tap-Beschreibung fehlgeschlagen.") }
        desc.setValue("Dealcoach", forKey: "name")
        desc.setValue(true, forKey: "privateTap")
        guard let tapUUID = desc.value(forKey: "UUID") as? UUID else { throw Self.error("Tap ohne UUID.") }

        var tap = AudioObjectID(kAudioObjectUnknown)
        try Self.check(createTap(Unmanaged.passUnretained(desc).toOpaque(), &tap), "Tap anlegen")
        tapID = tap

        // Format des Taps lesen ('tfmt').
        var asbd = AudioStreamBasicDescription()
        var size = UInt32(MemoryLayout<AudioStreamBasicDescription>.size)
        var addr = AudioObjectPropertyAddress(mSelector: 0x74666D74, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
        try Self.check(AudioObjectGetPropertyData(tap, &addr, 0, nil, &size, &asbd), "Tap-Format lesen")
        guard let format = AVAudioFormat(streamDescription: &asbd) else { throw Self.error("Unbekanntes Tap-Format.") }
        DebugLog.log("system tap format: \(format)")

        // Privates Aggregate-Gerät aus Ausgabegerät + Tap, aus dem wir lesen.
        let outputUID = try Self.defaultOutputUID()
        let description: [String: Any] = [
            "name": "Dealcoach Tap",
            "uid": UUID().uuidString,
            "master": outputUID,
            "private": true,
            "stacked": false,
            "tapautostart": true,
            "subdevices": [["uid": outputUID]],
            "taps": [["uid": tapUUID.uuidString, "drift": true] as [String: Any]],
        ]
        var agg = AudioObjectID(kAudioObjectUnknown)
        try Self.check(AudioHardwareCreateAggregateDevice(description as CFDictionary, &agg), "Aggregate-Gerät anlegen")
        aggregateID = agg

        let handler = onBuffer
        var proc: AudioDeviceIOProcID?
        try Self.check(AudioDeviceCreateIOProcIDWithBlock(&proc, agg, queue) { _, input, _, _, _ in
            guard let copy = Self.copy(input, format: format) else { return }
            handler?(copy)
        }, "Audio-Callback anlegen")
        procID = proc
        // Löst beim ersten Mal die macOS-Abfrage „Systemaudioaufnahme“ aus.
        try Self.check(AudioDeviceStart(agg, proc), "Aufnahme starten")
    }

    func stop() {
        if aggregateID != kAudioObjectUnknown {
            if let procID {
                AudioDeviceStop(aggregateID, procID)
                AudioDeviceDestroyIOProcID(aggregateID, procID)
            }
            AudioHardwareDestroyAggregateDevice(aggregateID)
        }
        if tapID != kAudioObjectUnknown,
           let handle = dlopen("/System/Library/Frameworks/CoreAudio.framework/CoreAudio", RTLD_NOW),
           let sym = dlsym(handle, "AudioHardwareDestroyProcessTap") {
            _ = unsafeBitCast(sym, to: DestroyTap.self)(tapID)
        }
        procID = nil
        aggregateID = AudioObjectID(kAudioObjectUnknown)
        tapID = AudioObjectID(kAudioObjectUnknown)
    }

    /// Der Puffer gehört Core Audio und ist nur im Callback gültig, deshalb kopieren.
    private static func copy(_ list: UnsafePointer<AudioBufferList>, format: AVAudioFormat) -> AVAudioPCMBuffer? {
        let src = UnsafeMutableAudioBufferListPointer(UnsafeMutablePointer(mutating: list))
        guard let first = src.first, first.mDataByteSize > 0 else { return nil }
        let bytesPerFrame = format.streamDescription.pointee.mBytesPerFrame
        let frames = first.mDataByteSize / max(bytesPerFrame, 1)
        guard frames > 0, let out = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frames) else { return nil }
        out.frameLength = frames
        let dst = UnsafeMutableAudioBufferListPointer(out.mutableAudioBufferList)
        for (d, s) in zip(dst, src) where s.mData != nil && d.mData != nil {
            memcpy(d.mData!, s.mData!, Int(min(d.mDataByteSize, s.mDataByteSize)))
        }
        return out
    }

    private static func defaultOutputUID() throws -> String {
        var device = AudioObjectID(kAudioObjectUnknown)
        var size = UInt32(MemoryLayout<AudioObjectID>.size)
        var addr = AudioObjectPropertyAddress(mSelector: kAudioHardwarePropertyDefaultSystemOutputDevice, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
        try check(AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &addr, 0, nil, &size, &device), "Ausgabegerät finden")
        var uid: Unmanaged<CFString>?
        size = UInt32(MemoryLayout<Unmanaged<CFString>?>.size)
        addr.mSelector = kAudioDevicePropertyDeviceUID
        try check(AudioObjectGetPropertyData(device, &addr, 0, nil, &size, &uid), "Ausgabegerät-UID lesen")
        guard let uid else { throw error("Ausgabegerät ohne UID.") }
        return uid.takeRetainedValue() as String
    }

    private static func check(_ status: OSStatus, _ step: String) throws {
        if status != noErr { throw error("\(step) fehlgeschlagen (\(status)).") }
    }

    private static func error(_ message: String) -> NSError {
        NSError(domain: "Dealcoach", code: 2, userInfo: [NSLocalizedDescriptionKey: message])
    }
}
