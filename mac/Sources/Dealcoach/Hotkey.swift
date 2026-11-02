import Carbon
import Foundation

/// Globale Tastenkombination ⌥ Leertaste: funktioniert auch, wenn Zoom oder Meet im Vordergrund ist.
/// Carbon-Hotkeys brauchen keine Bedienungshilfen-Freigabe.
@MainActor
enum Hotkey {
    private static var ref: EventHotKeyRef?
    private static var handler: (() -> Void)?

    static func register(_ action: @escaping () -> Void) {
        handler = action
        var spec = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))
        InstallEventHandler(GetApplicationEventTarget(), { _, _, _ in
            Task { @MainActor in Hotkey.handler?() }
            return noErr
        }, 1, &spec, nil, nil)
        let id = EventHotKeyID(signature: 0x44434F41, id: 1) // "DCOA"
        RegisterEventHotKey(UInt32(kVK_Space), UInt32(optionKey), id, GetApplicationEventTarget(), 0, &ref)
    }
}
