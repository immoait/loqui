import Foundation

enum Speaker: String, Codable {
    case rep, customer
}

struct Utterance: Codable, Identifiable {
    let id: String
    let speaker: Speaker
    let text: String
    /// ms seit Sitzungsbeginn, wann die Äußerung abgeschlossen war
    let t: Int
}

enum CardType: String, Codable, CaseIterable {
    case answer, question, behavior

    var label: String {
        switch self {
        case .answer: return "Antwort"
        case .question: return "Nächste Frage"
        case .behavior: return "Gesprächsverhalten"
        }
    }
}

enum CallType: String, Codable, CaseIterable {
    case discovery, demo, objection

    var label: String {
        switch self {
        case .discovery: return "Discovery"
        case .demo: return "Produktdemo"
        case .objection: return "Einwandbehandlung"
        }
    }
}

enum Rating: String, Codable {
    case up, down
}

struct CoachCard: Codable, Identifiable {
    let id: String
    let type: CardType
    let title: String
    let bullets: [String]
    /// Satz in Ich-Form, den der Verkäufer direkt sagen kann.
    var say: String? = nil
    let sources: [String]
    let missingInfo: String?
    let confidence: Double
    /// Dringend (z. B. Preisfrage) oder aktiv abgerufen: Overlay klappt von selbst auf.
    var expand = false
    let triggerT: Int
    let shownT: Int
    var latencyMs: Int { shownT - triggerT }
    let origin: String // "ai" | "local"
    var rating: Rating?
    var snoozed = false
}

/// Antwort des Coach-Backends (dealcoach/src/app/api/coach/route.ts).
struct CoachDecision: Decodable {
    let show: Bool
    let type: CardType
    let title: String
    let bullets: [String]
    let say: String?
    let sourceIds: [String]
    let missingInfo: String?
    let confidence: Double
    let urgency: Double
}

struct CoachResponse: Decodable {
    let decision: CoachDecision?
    let sources: [String]?
    let error: String?
}

struct SessionReport: Codable {
    let id: String
    let startedAt: Date
    let durationMs: Int
    let callType: CallType
    let cards: [CoachCard]
    let talkShareRep: Double
    let transcript: [Utterance]?
}
