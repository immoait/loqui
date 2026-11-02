import AppKit
import Combine
import SwiftUI

/// Live-Oberfläche während des Gesprächs, angelehnt an Cluely:
/// - Eine kleine **Pille** oben in der Bildschirmmitte ist das Einzige, was dauerhaft sichtbar ist
///   (Status, Timer, Redeanteil, Vorschau des neuesten Impulses, Auf-/Zuklappen, Stopp).
/// - Darunter klappt ein **Antwortfeld** auf: sprechbarer Satz, Beleg, Abruf-Chips und Eingabe.
///   Dringende und abgerufene Impulse öffnen es von selbst, alle anderen zeigen nur die Vorschau.
/// Beide Fenster sind für Bildschirmfreigaben unsichtbar und nehmen Zoom/Meet nicht den Fokus.
@MainActor
final class OverlayController: ObservableObject {
    @Published var card: CoachCard?
    @Published var isOpen = false
    /// Neuer Impuls, der noch nicht geöffnet wurde: Vorschau in der Pille leuchtet.
    @Published var fresh = false

    private let session: SessionController
    private let pill: NSPanel
    private let sheet: NSPanel
    private var pillHost: NSHostingView<AnyView>?
    private var sheetHost: NSHostingView<AnyView>?
    private var subscriptions = Set<AnyCancellable>()
    private var shownID: String?
    private var autoOpened = false
    private var closeWork: DispatchWorkItem?
    private var freshWork: DispatchWorkItem?

    private let pillWidth: CGFloat = 320
    private let sheetWidth: CGFloat = 480

    init(session: SessionController) {
        self.session = session
        pill = Self.makePanel(width: pillWidth, height: 40)
        sheet = Self.makePanel(width: sheetWidth, height: 160)

        let pillView = AnyView(PillView().environmentObject(session).environmentObject(self))
        pillHost = Self.mount(pillView, in: pill)
        let sheetView = AnyView(SheetView().environmentObject(session).environmentObject(self))
        sheetHost = Self.mount(sheetView, in: sheet)

        session.$cards.receive(on: RunLoop.main)
            .sink { [weak self] in self?.update($0) }
            .store(in: &subscriptions)
        session.$mode.receive(on: RunLoop.main)
            .sink { [weak self] in self?.modeChanged($0) }
            .store(in: &subscriptions)
        // Höhe des Antwortfelds folgt dem Inhalt.
        $card.combineLatest($isOpen).receive(on: RunLoop.main)
            .sink { [weak self] _, _ in self?.layout() }
            .store(in: &subscriptions)
    }

    // MARK: Ereignisse

    private func modeChanged(_ mode: SessionMode) {
        switch mode {
        case .live:
            layout()
            fade(pill, in: true)
        case .idle:
            card = nil
            shownID = nil
            isOpen = false
            fresh = false
            fade(pill, in: false)
            fade(sheet, in: false)
        case .starting:
            break
        }
    }

    private func update(_ cards: [CoachCard]) {
        guard let latest = cards.first(where: { !$0.snoozed }) else { return }
        guard latest.id != shownID else { return }
        shownID = latest.id
        card = latest
        // „Overlay testen“ außerhalb eines Gesprächs: Pille nur für die Vorschau einblenden.
        if session.mode != .live { layout(); fade(pill, in: true) }
        if latest.expand {
            open(auto: true)
        } else {
            markFresh()
        }
    }

    private func markFresh() {
        fresh = true
        freshWork?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.fresh = false }
        freshWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 20, execute: work)
    }

    func toggle() {
        if isOpen { close() } else { open(auto: false) }
    }

    func open(auto: Bool) {
        fresh = false
        freshWork?.cancel()
        autoOpened = auto
        isOpen = true
        layout()
        fade(sheet, in: true)
        closeWork?.cancel()
        guard auto else { return }
        // Automatisch Geöffnetes schließt sich wieder; je mehr Text, desto später.
        let words = card.map { ([$0.say ?? $0.title] + $0.bullets).joined(separator: " ").split(separator: " ").count } ?? 10
        let work = DispatchWorkItem { [weak self] in
            guard let self, self.autoOpened else { return }
            self.close()
        }
        closeWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + min(30, max(12, Double(words) * 0.5)), execute: work)
    }

    func close() {
        closeWork?.cancel()
        isOpen = false
        fade(sheet, in: false)
        if session.mode != .live { fade(pill, in: false) }
    }

    /// Manuelle Eingabe hält das Feld offen.
    func userInteracted() {
        autoOpened = false
        closeWork?.cancel()
    }

    // MARK: Fenster

    private static func makePanel(width: CGFloat, height: CGFloat) -> NSPanel {
        let panel = KeyablePanel(
            contentRect: NSRect(x: 0, y: 0, width: width, height: height),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: true)
        panel.level = .statusBar
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = true
        panel.hidesOnDeactivate = false
        panel.isReleasedWhenClosed = false
        panel.isMovableByWindowBackground = true
        // Taucht in Zoom/Meet/Teams-Bildschirmfreigaben und Aufnahmen nicht auf.
        panel.sharingType = .none
        panel.appearance = NSAppearance(named: .darkAqua)
        panel.alphaValue = 0
        return panel
    }

    private static func mount(_ view: AnyView, in panel: NSPanel) -> NSHostingView<AnyView> {
        let host = NSHostingView(rootView: view)
        host.frame = panel.contentView!.bounds
        host.autoresizingMask = [.width, .height]
        panel.contentView = host
        return host
    }

    private func layout() {
        guard let screen = NSScreen.main ?? NSScreen.screens.first else { return }
        let top = screen.visibleFrame.maxY - 8
        let midX = screen.frame.midX

        let pillHeight: CGFloat = 40
        pill.setFrame(NSRect(x: midX - pillWidth / 2, y: top - pillHeight, width: pillWidth, height: pillHeight), display: true)

        guard let sheetHost else { return }
        sheetHost.frame.size.width = sheetWidth
        let height = ceil(sheetHost.fittingSize.height)
        let y = top - pillHeight - 8 - height
        sheet.setFrame(NSRect(x: midX - sheetWidth / 2, y: y, width: sheetWidth, height: height), display: true)
    }

    private func fade(_ panel: NSPanel, in visible: Bool) {
        if visible, !panel.isVisible { panel.orderFrontRegardless() }
        NSAnimationContext.runAnimationGroup({ ctx in
            ctx.duration = visible ? 0.22 : 0.3
            panel.animator().alphaValue = visible ? 1 : 0
        }, completionHandler: {
            Task { @MainActor in
                if !visible, panel.alphaValue == 0 { panel.orderOut(nil) }
            }
        })
    }
}

/// Darf Tastatureingaben annehmen (Eingabefeld), ohne die App in den Vordergrund zu holen.
final class KeyablePanel: NSPanel {
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { false }
}

// MARK: - Glas-Hintergrund für die Overlays

struct OverlayGlass: ViewModifier {
    var radius: CGFloat
    var tint: Color?

    func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)
        content
            .background {
                shape.fill(.ultraThinMaterial)
                shape.fill(Color.black.opacity(0.35))
                if let tint { shape.fill(tint.opacity(0.16)) }
                shape.fill(LinearGradient(colors: [.white.opacity(0.10), .clear], startPoint: .top, endPoint: .center))
            }
            .overlay(shape.strokeBorder(
                LinearGradient(colors: [.white.opacity(0.40), .white.opacity(0.08)], startPoint: .top, endPoint: .bottom),
                lineWidth: 0.8))
            .clipShape(shape)
    }
}

extension View {
    func overlayGlass(radius: CGFloat = 20, tint: Color? = nil) -> some View { modifier(OverlayGlass(radius: radius, tint: tint)) }
}

// MARK: - Pille

struct PillView: View {
    @EnvironmentObject var session: SessionController
    @EnvironmentObject var overlay: OverlayController

    var body: some View {
        let share = session.talkShare(since: max(0, session.elapsedMs - 120_000))
        let color = overlay.card?.type.color ?? .teal
        HStack(spacing: 10) {
            Circle().fill(Color.red)
                .frame(width: 7, height: 7)
                .shadow(color: .red.opacity(0.9), radius: 4)
            Text(fmtTime(session.elapsedMs))
                .font(.system(size: 12, weight: .semibold, design: .rounded).monospacedDigit())
                .foregroundStyle(.primary)
            // Redeanteil der letzten 2 Minuten: links „Ich“, rechts „Kunde“.
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(.white.opacity(0.15))
                    Capsule().fill(share.share > 0.7 ? Color.orange : Color.teal)
                        .frame(width: g.size.width * CGFloat(share.total > 0 ? share.share : 0.5))
                }
            }
            .frame(width: 34, height: 4)
            .help("Mein Redeanteil der letzten 2 Minuten")

            Button { overlay.open(auto: false) } label: {
                Text(preview)
                    .font(.system(size: 12, weight: overlay.fresh ? .semibold : .regular))
                    .foregroundStyle(overlay.fresh ? color : .secondary)
                    .lineLimit(1)
                    .truncationMode(.tail)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .buttonStyle(.plain)

            Button { overlay.toggle() } label: {
                Image(systemName: overlay.isOpen ? "chevron.up" : "chevron.down")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(.secondary)
                    .frame(width: 22, height: 22)
            }
            .buttonStyle(.plain)
            .help(overlay.isOpen ? "Zuklappen" : "Aufklappen (⌥ Leertaste: Was soll ich sagen?)")

            Button { session.stop() } label: {
                Image(systemName: "stop.fill")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(width: 22, height: 22)
                    .background(Circle().fill(.white.opacity(0.14)))
            }
            .buttonStyle(.plain)
            .help("Coaching beenden")
        }
        .padding(.horizontal, 12)
        .frame(width: 320, height: 40)
        .overlayGlass(radius: 20, tint: overlay.fresh ? color : nil)
        .shadow(color: overlay.fresh ? color.opacity(0.55) : .black.opacity(0.25), radius: overlay.fresh ? 14 : 8, y: 4)
        .animation(.easeInOut(duration: 0.35), value: overlay.fresh)
    }

    private var preview: String {
        if let card = overlay.card {
            return overlay.fresh ? "\(card.type.label): \(card.title)" : card.title
        }
        return session.thinking ? "hört zu …" : "Dealcoach"
    }
}

// MARK: - Antwortfeld

struct SheetView: View {
    @EnvironmentObject var session: SessionController
    @EnvironmentObject var overlay: OverlayController
    @State private var question = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let card = overlay.card {
                cardBody(card)
            } else {
                Text("Noch kein Impuls. Frag den Coach oder drück ⌥ Leertaste.")
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)
            }

            // Abruf-Chips: der Coach antwortet dann immer.
            HStack(spacing: 6) {
                chip("Was soll ich sagen?", icon: "sparkles", shortcut: "⌥␣") { session.pull() }
                chip("Nächste Frage", icon: "questionmark.bubble") { session.pull("Welche Frage sollte ich jetzt stellen?") }
                chip("Einwand", icon: "shield") { session.pull("Wie entkräfte ich den letzten Einwand des Kunden?") }
                chip("Zusammenfassen", icon: "list.bullet") { session.pull("Fasse kurz zusammen, was der Kunde bisher wichtig fand.") }
            }

            HStack(spacing: 8) {
                TextField("Frag zum Gespräch …", text: $question)
                    .textFieldStyle(.plain)
                    .font(.system(size: 13))
                    .onSubmit(send)
                    .onChange(of: question) { _ in overlay.userInteracted() }
                Button(action: send) {
                    Image(systemName: "arrow.up")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 24, height: 24)
                        .background(Circle().fill(question.isEmpty ? Color.white.opacity(0.15) : Color.teal))
                }
                .buttonStyle(.plain)
                .disabled(question.isEmpty)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(.white.opacity(0.08)))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(.white.opacity(0.12)))
        }
        .padding(16)
        .frame(width: 480, alignment: .leading)
        .overlayGlass(radius: 20, tint: overlay.card?.type.color)
    }

    @ViewBuilder
    private func cardBody(_ card: CoachCard) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(card.type.label.uppercased())
                    .font(.system(size: 10, weight: .bold))
                    .tracking(0.7)
                    .foregroundColor(card.type.color)
                Spacer()
                if session.thinking {
                    ProgressView().controlSize(.mini)
                }
                Button { overlay.close() } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(.secondary)
                        .frame(width: 20, height: 20)
                        .background(Circle().fill(.white.opacity(0.08)))
                }
                .buttonStyle(.plain)
            }
            // Sprechbarer Satz zuerst – das ist, was man im Gespräch braucht.
            if let say = card.say, !say.isEmpty {
                Text("„\(say)“")
                    .font(.system(size: 17, weight: .medium, design: .rounded))
                    .fixedSize(horizontal: false, vertical: true)
            } else {
                Text(card.title)
                    .font(.system(size: 17, weight: .semibold, design: .rounded))
                    .fixedSize(horizontal: false, vertical: true)
            }
            ForEach(card.bullets.prefix(card.say == nil ? 2 : 1), id: \.self) { b in
                Text(b).font(.system(size: 13)).foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            if let missing = card.missingInfo {
                Text("Nicht in der Wissensbasis: \(missing)")
                    .font(.system(size: 12)).foregroundColor(.orange)
                    .fixedSize(horizontal: false, vertical: true)
            }
            HStack(spacing: 8) {
                if !card.sources.isEmpty {
                    Label(card.sources.joined(separator: ", "), systemImage: "book")
                        .font(.system(size: 11)).foregroundStyle(.tertiary)
                }
                Spacer()
                rate(card, .up, "hand.thumbsup")
                rate(card, .down, "hand.thumbsdown")
            }
        }
    }

    private func rate(_ card: CoachCard, _ rating: Rating, _ icon: String) -> some View {
        Button {
            session.update(card.id) { $0.rating = $0.rating == rating ? nil : rating }
        } label: {
            Image(systemName: card.rating == rating ? icon + ".fill" : icon)
                .font(.system(size: 11))
                .foregroundStyle(card.rating == rating ? Color.teal : Color.secondary)
                .frame(width: 22, height: 22)
        }
        .buttonStyle(.plain)
    }

    private func chip(_ label: String, icon: String, shortcut: String? = nil, action: @escaping () -> Void) -> some View {
        Button {
            overlay.userInteracted()
            action()
        } label: {
            HStack(spacing: 4) {
                Image(systemName: icon).font(.system(size: 10))
                Text(label).font(.system(size: 11, weight: .medium))
                if let shortcut {
                    Text(shortcut).font(.system(size: 9)).foregroundStyle(.tertiary)
                }
            }
            .padding(.horizontal, 9)
            .padding(.vertical, 5)
            .background(Capsule().fill(.white.opacity(0.10)))
            .overlay(Capsule().strokeBorder(.white.opacity(0.18), lineWidth: 0.7))
        }
        .buttonStyle(.plain)
    }

    private func send() {
        let q = question.trimmingCharacters(in: .whitespaces)
        guard !q.isEmpty else { return }
        overlay.userInteracted()
        session.pull(q)
        question = ""
    }
}
