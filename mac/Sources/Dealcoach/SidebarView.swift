import SwiftUI

extension CardType {
    var color: Color {
        switch self {
        case .answer: return .teal
        case .question: return .orange
        case .behavior: return .purple
        }
    }
}

func fmtTime(_ ms: Int) -> String {
    let s = max(0, ms / 1000)
    return String(format: "%02d:%02d", s / 60, s % 60)
}

// MARK: - Glas-Bausteine

/// Halbtransparente Fläche mit Unschärfe, heller Kante und weichem Schatten.
struct Glass: ViewModifier {
    var radius: CGFloat = 16
    var tint: Color? = nil

    func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)
        content
            .background {
                shape.fill(.ultraThinMaterial)
                shape.fill(.white.opacity(0.35))
                if let tint { shape.fill(tint.opacity(0.12)) }
                // Lichtreflex oben links
                shape.fill(LinearGradient(colors: [.white.opacity(0.10), .clear], startPoint: .topLeading, endPoint: .center))
            }
            .overlay(shape.strokeBorder(
                LinearGradient(colors: [.white.opacity(0.45), .white.opacity(0.08), .white.opacity(0.18)],
                               startPoint: .topLeading, endPoint: .bottomTrailing),
                lineWidth: 0.8))
            .shadow(color: .black.opacity(0.08), radius: 12, y: 6)
    }
}

extension View {
    func glass(radius: CGFloat = 16, tint: Color? = nil) -> some View { modifier(Glass(radius: radius, tint: tint)) }
}

/// Farbige, stark unscharfe Lichtflecken hinter dem Glas, damit die Transparenz sichtbar wird.
struct AmbientBackground: View {
    var live: Bool

    var body: some View {
        GeometryReader { geo in
            ZStack {
                Circle().fill(Color.teal.opacity(0.22))
                    .frame(width: geo.size.width * 0.9)
                    .offset(x: -geo.size.width * 0.35, y: -geo.size.height * 0.30)
                Circle().fill(Color.indigo.opacity(0.16))
                    .frame(width: geo.size.width * 0.8)
                    .offset(x: geo.size.width * 0.40, y: geo.size.height * 0.05)
                Circle().fill((live ? Color.red : Color.blue).opacity(0.12))
                    .frame(width: geo.size.width * 0.9)
                    .offset(x: -geo.size.width * 0.10, y: geo.size.height * 0.40)
            }
            .frame(width: geo.size.width, height: geo.size.height)
            .blur(radius: 70)
            .animation(.easeInOut(duration: 1.2), value: live)
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }
}

/// Großer Kapsel-Button aus Glas, optional farbig getönt.
struct GlassButtonStyle: ButtonStyle {
    var tint: Color = .white
    var prominent = false
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        let shape = Capsule(style: .continuous)
        configuration.label
            .font(.system(size: 14, weight: .semibold))
            .foregroundStyle(prominent ? Color.white : Color.primary)
            .padding(.vertical, 11)
            .frame(maxWidth: .infinity)
            .background {
                shape.fill(.ultraThinMaterial)
                if prominent {
                    shape.fill(LinearGradient(colors: [tint.opacity(0.85), tint.opacity(0.55)], startPoint: .top, endPoint: .bottom))
                }
                shape.fill(LinearGradient(colors: [.white.opacity(0.25), .clear], startPoint: .top, endPoint: .center))
            }
            .overlay(shape.strokeBorder(.white.opacity(0.35), lineWidth: 0.8))
            .shadow(color: (prominent ? tint : .black).opacity(0.30), radius: 10, y: 4)
            .opacity(isEnabled ? (configuration.isPressed ? 0.75 : 1) : 0.45)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

/// Kleine Glas-Pille für Bewertung und Nebenaktionen.
struct GlassChipStyle: ButtonStyle {
    var active = false

    func makeBody(configuration: Configuration) -> some View {
        let shape = Capsule(style: .continuous)
        configuration.label
            .font(.caption.weight(.medium))
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background {
                shape.fill(.ultraThinMaterial)
                if active { shape.fill(Color.accentColor.opacity(0.45)) }
            }
            .overlay(shape.strokeBorder(.white.opacity(active ? 0.5 : 0.25), lineWidth: 0.7))
            .opacity(configuration.isPressed ? 0.7 : 1)
    }
}

struct SidebarView: View {
    @EnvironmentObject var session: SessionController
    @State private var showSettings = false
    @State private var showTranscript = true

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            header
            if let error = session.error { banner(error, color: .red) }
            if let notice = session.notice { banner(notice, color: .orange) }

            if showSettings {
                SettingsPanel().environmentObject(session)
            } else if session.mode == .idle {
                idleView
            } else {
                liveView
            }
        }
        .padding(.horizontal, 14)
        .padding(.bottom, 14)
        // Die Kopfzeile sitzt in der durchsichtigen Titelleiste, rechts neben den Fensterknöpfen.
        .padding(.top, 6)
        .frame(minWidth: 320, idealWidth: 360, minHeight: 480)
        .background(AmbientBackground(live: session.mode == .live))
    }

    private var header: some View {
        HStack(spacing: 10) {
            Circle()
                .fill(session.mode == .live ? Color.red : Color.secondary.opacity(0.5))
                .frame(width: 8, height: 8)
                .shadow(color: session.mode == .live ? .red : .clear, radius: 4)
            Text(session.mode == .live ? "Live · \(fmtTime(session.elapsedMs))" : "Dealcoach")
                .font(.system(size: 15, weight: .semibold, design: .rounded))
                .monospacedDigit()
            Spacer()
            if session.thinking { Text("hört zu …").font(.caption).foregroundColor(.secondary) }
            Button { showSettings.toggle() } label: {
                Image(systemName: showSettings ? "xmark" : "gearshape")
                    .font(.system(size: 13, weight: .medium))
                    .frame(width: 30, height: 30)
                    .glass(radius: 15)
            }
            .buttonStyle(.plain)
            .help("Einstellungen")
        }
        .padding(.leading, 64)
        .frame(height: 30)
    }

    private var idleView: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button {
                Task { await session.start() }
            } label: {
                Label(session.mode == .starting ? "Startet …" : "Coaching starten", systemImage: "waveform")
            }
            .buttonStyle(GlassButtonStyle(tint: .teal, prominent: true))
            .disabled(session.mode == .starting)

            Text("Während des Gesprächs siehst du nur eine kleine Leiste oben am Bildschirm. ⌥ Leertaste fragt den Coach: „Was soll ich sagen?“")
                .font(.caption)
                .foregroundColor(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            if let r = session.lastReport { ReportSummary(report: r) }
            Spacer()
        }
    }

    private var liveView: some View {
        VStack(alignment: .leading, spacing: 10) {
            let share = session.talkShare(since: 0)
            let ai = session.cards.filter { $0.origin == "ai" }
            HStack(spacing: 8) {
                Stat(label: "Mein Redeanteil", value: share.total > 0 ? "\(Int(share.share * 100)) %" : "–")
                Stat(label: "Ø Latenz", value: ai.isEmpty ? "–" : String(format: "%.1f s", Double(ai.map(\.latencyMs).reduce(0, +)) / Double(ai.count) / 1000))
                Stat(label: "Impulse", value: "\(session.cards.filter { !$0.snoozed }.count)")
            }

            ScrollView {
                VStack(spacing: 10) {
                    let visible = session.cards.filter { !$0.snoozed }
                    if visible.isEmpty {
                        VStack(spacing: 8) {
                            Image(systemName: "sparkles").font(.title2).foregroundStyle(.secondary)
                            Text("Der Coach meldet sich nur, wenn ein Impuls wirklich hilft.")
                                .font(.callout)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 28)
                        .padding(.horizontal, 12)
                        .glass()
                    }
                    ForEach(Array(visible.prefix(3).enumerated()), id: \.element.id) { i, card in
                        CardView(card: card, faded: i > 0)
                    }
                    let older = visible.dropFirst(3) + session.cards.filter(\.snoozed)
                    if !older.isEmpty {
                        DisclosureGroup("Ältere und zurückgestellte (\(older.count))") {
                            ForEach(Array(older)) { CardView(card: $0, faded: true) }
                        }
                        .font(.caption)
                    }
                }
            }

            DisclosureGroup("Transkript", isExpanded: $showTranscript) {
                TranscriptView()
                    .frame(height: 180)
                    .padding(.top, 6)
            }
            .font(.caption.weight(.medium))
            .padding(12)
            .glass()

            Button { session.stop() } label: {
                Label("Coaching beenden", systemImage: "stop.fill")
            }
            .buttonStyle(GlassButtonStyle(tint: .red, prominent: true))
        }
    }

    private func banner(_ text: String, color: Color) -> some View {
        Label(text, systemImage: "exclamationmark.triangle.fill")
            .font(.caption)
            .foregroundColor(color)
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .fixedSize(horizontal: false, vertical: true)
            .glass(radius: 12, tint: color)
    }
}

struct CardView: View {
    @EnvironmentObject var session: SessionController
    let card: CoachCard
    var faded = false

    var body: some View {
        HStack(spacing: 0) {
            Capsule().fill(card.type.color.gradient).frame(width: 4).padding(.vertical, 12).padding(.leading, 8)
                .shadow(color: card.type.color.opacity(0.6), radius: 4)
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(card.type.label.uppercased())
                        .font(.caption2.weight(.bold))
                        .tracking(0.6)
                        .foregroundColor(card.type.color)
                    Spacer()
                    Text("\(fmtTime(card.triggerT)) · \(String(format: "%.1f", Double(card.latencyMs) / 1000)) s")
                        .font(.caption2.monospacedDigit())
                        .foregroundColor(.secondary)
                        .help("Zeit vom Gesprächsmoment bis zur Anzeige")
                }
                Text(card.title).font(.system(size: 15, weight: .semibold, design: .rounded))
                ForEach(card.bullets, id: \.self) { b in
                    HStack(alignment: .top, spacing: 6) {
                        Text("–").foregroundColor(.secondary)
                        Text(b).fixedSize(horizontal: false, vertical: true)
                    }
                    .font(.callout)
                }
                if let missing = card.missingInfo {
                    (Text("Nicht in der Wissensbasis: ").bold() + Text(missing))
                        .font(.caption)
                        .padding(8)
                        .glass(radius: 8, tint: .orange)
                }
                if !card.sources.isEmpty {
                    Text("Quelle: \(card.sources.joined(separator: ", "))").font(.caption).foregroundColor(.secondary)
                }
                HStack(spacing: 6) {
                    rateButton("Hilfreich", .up)
                    rateButton("Nicht hilfreich", .down)
                    Spacer()
                    Button(card.snoozed ? "Zurückholen" : "Später") {
                        session.update(card.id) { $0.snoozed.toggle() }
                    }
                    .buttonStyle(GlassChipStyle())
                }
                .padding(.top, 2)
            }
            .padding(12)
        }
        .glass(tint: card.type.color)
        .opacity(faded ? 0.6 : 1)
    }

    private func rateButton(_ label: String, _ rating: Rating) -> some View {
        Button(label) {
            session.update(card.id) { $0.rating = $0.rating == rating ? nil : rating }
        }
        .buttonStyle(GlassChipStyle(active: card.rating == rating))
    }
}

struct TranscriptView: View {
    @EnvironmentObject var session: SessionController

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(session.utterances) { u in
                        line(u.speaker, u.text, time: fmtTime(u.t))
                    }
                    ForEach([Speaker.rep, .customer], id: \.self) { s in
                        if let p = session.partial[s], !p.isEmpty { line(s, p, time: "…").opacity(0.5) }
                    }
                    Color.clear.frame(height: 1).id("end")
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .onChange(of: session.utterances.count) { _ in proxy.scrollTo("end") }
        }
    }

    private func line(_ s: Speaker, _ text: String, time: String) -> some View {
        (Text("\(time) ").foregroundColor(.secondary).font(.caption2.monospacedDigit())
         + Text(s == .rep ? "Ich: " : "Kunde: ").bold()
         + Text(text))
            .font(.caption)
    }
}

struct ReportSummary: View {
    let report: SessionReport

    var body: some View {
        let rated = report.cards.filter { $0.rating != nil }
        let helpful = report.cards.filter { $0.rating == .up }.count
        let lat = report.cards.filter { $0.origin == "ai" }.map(\.latencyMs).sorted()
        VStack(alignment: .leading, spacing: 8) {
            Text("Letzte Sitzung · \(report.callType.label) · \(fmtTime(report.durationMs))").font(.subheadline.weight(.semibold))
            HStack(spacing: 8) {
                Stat(label: "Impulse", value: "\(report.cards.count)")
                Stat(label: "Hilfreich", value: rated.isEmpty ? "–" : "\(helpful * 100 / rated.count) %")
                Stat(label: "Median-Latenz", value: lat.isEmpty ? "–" : String(format: "%.1f s", Double(lat[lat.count / 2]) / 1000))
            }
            ForEach(report.cards.reversed()) { c in
                Text("\(fmtTime(c.triggerT))  \(c.type.label): \(c.title)\(c.rating == .up ? "  ✓" : c.rating == .down ? "  ✗" : "")")
                    .font(.caption)
            }
        }
        .padding(14)
        .glass()
    }
}

struct Stat: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 2) {
            Text(value).font(.system(.title3, design: .rounded).weight(.semibold)).monospacedDigit()
            Text(label).font(.caption2).foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .glass(radius: 12)
    }
}

struct SettingsPanel: View {
    @EnvironmentObject var session: SessionController

    var body: some View {
        Form {
            Picker("Gesprächstyp", selection: $session.settings.callType) {
                ForEach(CallType.allCases, id: \.self) { Text($0.label).tag($0) }
            }
            Section("Impulsarten") {
                ForEach(CardType.allCases, id: \.self) { t in
                    Toggle(t.label, isOn: Binding(
                        get: { session.settings.enabled[t] ?? false },
                        set: { session.settings.enabled[t] = $0 }))
                }
            }
            Section("Häufigkeit") {
                Slider(value: $session.settings.minGapSec, in: 0...90, step: 5) {
                    Text("Abstand \(Int(session.settings.minGapSec)) s")
                }
                Slider(value: $session.settings.minConfidence, in: 0.3...0.9, step: 0.05) {
                    Text("Sicherheit \(Int(session.settings.minConfidence * 100)) %")
                }
            }
            Section("Datenschutz") {
                Toggle("Transkript im Bericht speichern", isOn: $session.settings.storeTranscript)
                Button("Alle Berichte löschen", role: .destructive) {
                    ReportStore.deleteAll()
                    session.lastReport = nil
                }
            }
            Section("Overlay") {
                Button("Overlay testen") { session.showTestCard() }
            }
            Section("Coach-Backend") {
                TextField("Adresse", text: $session.settings.backendURL)
            }
        }
        .formStyle(.grouped)
        .scrollContentBackground(.hidden)
        .glass()
    }
}
