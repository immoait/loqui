import AppKit
import Combine
import SwiftUI

// Reines AppKit statt SwiftUI-App: Eine leere `Settings`-Szene öffnete unter macOS 26 bei jedem Start ein leeres Fenster.
@main
enum DealcoachMain {
    @MainActor static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()
        app.delegate = delegate
        app.setActivationPolicy(.regular)
        app.mainMenu = makeMenu()
        app.run()
    }

    @MainActor private static func makeMenu() -> NSMenu {
        let main = NSMenu()
        let appItem = NSMenuItem()
        main.addItem(appItem)
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "Dealcoach beenden", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = appMenu

        let editItem = NSMenuItem()
        main.addItem(editItem)
        let edit = NSMenu(title: "Bearbeiten")
        edit.addItem(withTitle: "Ausschneiden", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        edit.addItem(withTitle: "Kopieren", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        edit.addItem(withTitle: "Einsetzen", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        edit.addItem(withTitle: "Alles auswählen", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editItem.submenu = edit
        return main
    }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private var panel: NSPanel?
    private var overlay: OverlayController?
    private var subscriptions = Set<AnyCancellable>()
    private let session = SessionController()

    func applicationDidFinishLaunching(_ notification: Notification) {
        let size = NSSize(width: 360, height: 680)
        let panel = NSPanel(
            contentRect: NSRect(origin: .zero, size: size),
            styleMask: [.titled, .closable, .resizable, .miniaturizable, .fullSizeContentView],
            backing: .buffered,
            defer: false)
        panel.title = "Dealcoach"
        // Bleibt neben Zoom/Meet sichtbar, auch über Vollbild-Meetings.
        panel.level = .floating
        panel.isFloatingPanel = true
        panel.hidesOnDeactivate = false
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        // Glas-Look: Titelleiste durchsichtig, Fensterhintergrund ist die unscharfe Umgebung.
        panel.titlebarAppearsTransparent = true
        panel.titleVisibility = .hidden
        panel.isMovableByWindowBackground = true
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.appearance = NSAppearance(named: .aqua)

        let glass = NSVisualEffectView()
        glass.material = .popover
        glass.blendingMode = .behindWindow
        glass.state = .active
        let host = NSHostingView(rootView: SidebarView().environmentObject(session))
        host.translatesAutoresizingMaskIntoConstraints = false
        glass.addSubview(host)
        NSLayoutConstraint.activate([
            host.leadingAnchor.constraint(equalTo: glass.leadingAnchor),
            host.trailingAnchor.constraint(equalTo: glass.trailingAnchor),
            host.topAnchor.constraint(equalTo: glass.topAnchor),
            host.bottomAnchor.constraint(equalTo: glass.bottomAnchor),
        ])
        panel.contentView = glass

        if let screen = NSScreen.main?.visibleFrame {
            panel.setFrameOrigin(NSPoint(x: screen.maxX - size.width - 16, y: screen.maxY - size.height - 16))
        }
        panel.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        self.panel = panel
        overlay = OverlayController(session: session)
        Hotkey.register { [weak self] in
            guard let self, self.session.mode == .live else { return }
            self.session.pull()
            self.overlay?.open(auto: false)
        }
        // Während des Gesprächs nur Pille und Antwortfeld; das Hauptfenster kommt danach zurück.
        session.$mode.receive(on: RunLoop.main).sink { [weak self] mode in
            guard let self, let panel = self.panel else { return }
            switch mode {
            case .live: panel.orderOut(nil)
            case .idle: panel.makeKeyAndOrderFront(nil)
            case .starting: break
            }
        }.store(in: &subscriptions)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { session.mode != .live }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        panel?.makeKeyAndOrderFront(nil)
        return true
    }

    func applicationWillTerminate(_ notification: Notification) {
        session.stop()
    }
}
