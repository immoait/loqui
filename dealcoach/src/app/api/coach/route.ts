import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod/v4";
import { DEFAULT_KNOWLEDGE, DEFAULT_SETTINGS } from "@/lib/defaults";
import type { CallType, CardType, KnowledgeItem, Utterance } from "@/lib/types";

const client = new OpenAI();
const MODEL = process.env.COACH_MODEL ?? "gpt-5.4-mini";
// Latenz ist Teil des Nutzens: wenig Reasoning als Default, per Env überschreibbar.
const EFFORT = (process.env.COACH_EFFORT ?? "low") as OpenAI.ReasoningEffort;

const Decision = z.object({
  show: z.boolean(),
  type: z.enum(["answer", "question", "behavior"]),
  title: z.string(),
  bullets: z.array(z.string()),
  /** Ein Satz in Ich-Form, den der Verkäufer wörtlich sagen kann (nur bei "answer"/"question"). */
  say: z.string().nullable(),
  sourceIds: z.array(z.string()),
  missingInfo: z.string().nullable(),
  confidence: z.number(),
  urgency: z.number(),
});

const CALL_TYPE_LABEL: Record<CallType, string> = {
  discovery: "Discovery-Gespräch (Bedarf, Schmerzpunkte, Entscheidungsprozess verstehen)",
  demo: "Produktdemo (Relevanz zeigen, Fragen beantworten, nächste Schritte sichern)",
  objection: "Einwandbehandlung (Einwände verstehen, belegt entkräften, Commitment holen)",
};

const SYSTEM = `Du bist ein Echtzeit-Coach für B2B-Verkäufer. Du hörst ein laufendes Verkaufsgespräch mit und entscheidest nach jeder neuen Äußerung, ob JETZT ein kurzer Impuls für den Verkäufer hilfreich ist.

Impulstypen:
- "answer": Der Kunde hat eine konkrete Frage oder einen Einwand geäußert, und der Verkäufer braucht Stoff für eine Antwort. 1–3 Stichpunkte, die er sofort sagen kann.
- "question": Es zeigt sich eine Lücke, ein Kaufsignal oder ein ungeklärter Einwand. Gib EINE natürliche Follow-up-Frage, wörtlich formuliert, als ersten Stichpunkt.
- "behavior": Ein Hinweis zum Gesprächsverhalten des Verkäufers (z. B. Frage übergangen, vage Zusage, zu früh gepitcht). Sehr sparsam, freundlich, konkret.

Regeln:
- Weniger, bessere Impulse. Setze show=false, wenn der Nutzen gering ist, der Moment vorbei ist, ein ähnlicher Impuls kürzlich gezeigt wurde oder die Grundlage unsicher ist. Im Zweifel schweigen.
- Titel höchstens 6 Wörter. Jeder Stichpunkt höchstens 18 Wörter. Keine Einleitungen.
- say: Bei "answer" und "question" ein einzelner natürlicher Satz in Ich-Form, den der Verkäufer sofort laut sagen kann (höchstens 25 Wörter, gesprochene Sprache, keine Aufzählung). Bei "behavior" null.
- Produkt-, Preis- und Wettbewerbsaussagen NUR aus der Wissensbasis. Nenne die IDs der genutzten Einträge in sourceIds.
- Fehlt die Information in der Wissensbasis, erfinde nichts: Schreibe in missingInfo, was fehlt, und schlage vor, wie der Verkäufer ehrlich damit umgeht (z. B. nachreichen).
- confidence (0–1): wie sicher die Empfehlung inhaltlich belegt und passend ist. urgency (0–1): wie zeitkritisch der Moment ist.
- Du sprichst nicht für den Verkäufer und schlägst keine automatischen Aktionen vor. Du bist Coach, kein Autopilot.
- Antworte auf Deutsch.`;

interface CoachRequest {
  transcript: Utterance[];
  /** Ohne Angabe gilt die zentrale Wissensbasis (z. B. für die Mac-App). */
  knowledge?: KnowledgeItem[];
  recentCards?: { type: CardType; title: string }[];
  enabled?: Record<CardType, boolean>;
  callType?: CallType;
  /** Abruf per Tastendruck: Der Verkäufer fragt aktiv – dann immer antworten. */
  pull?: { question?: string };
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Kein OPENAI_API_KEY gesetzt – siehe .env.example." }, { status: 500 });
  }
  const raw = (await req.json()) as CoachRequest;
  const body = {
    transcript: raw.transcript ?? [],
    knowledge: raw.knowledge ?? DEFAULT_KNOWLEDGE,
    recentCards: raw.recentCards ?? [],
    enabled: raw.enabled ?? DEFAULT_SETTINGS.enabled,
    callType: raw.callType ?? DEFAULT_SETTINGS.callType,
    pull: raw.pull,
  };
  const window = body.transcript.slice(-14);
  if (window.length === 0) return Response.json({ decision: null });

  const knowledgeText = body.knowledge
    .map((k) => `[${k.id}] ${k.title}\n${k.content}`)
    .join("\n\n");

  const lines = window
    .map((u, i) => {
      const who = u.speaker === "rep" ? "VERKÄUFER" : "KUNDE";
      const marker = i === window.length - 1 ? "  ← NEUESTE ÄUSSERUNG" : "";
      return `${who}: ${u.text}${marker}`;
    })
    .join("\n");

  const allowed = (Object.keys(body.enabled) as CardType[]).filter((t) => body.enabled[t]);
  const recent = body.recentCards.length
    ? body.recentCards.map((c) => `- [${c.type}] ${c.title}`).join("\n")
    : "(keine)";

  const started = Date.now();
  try {
    const response = await client.responses.parse({
      model: MODEL,
      reasoning: { effort: EFFORT },
      text: { format: zodTextFormat(Decision, "coach_decision") },
      // Stabiler Präfix (Regeln + Wissensbasis) zuerst, damit das Prompt-Caching greift.
      instructions: `${SYSTEM}\n\nWISSENSBASIS (freigegeben):\n\n${knowledgeText}`,
      input: `Gesprächstyp: ${CALL_TYPE_LABEL[body.callType]}
Erlaubte Impulstypen: ${allowed.join(", ") || "keine"}

Kürzlich gezeigte Impulse (nicht wiederholen):
${recent}

Gesprächsverlauf:
${lines}

${
        body.pull
          ? `ABRUF: Der Verkäufer hat aktiv um Hilfe gebeten${body.pull.question ? `: „${body.pull.question}“` : " (Was soll ich jetzt sagen?)"}. Antworte auf jeden Fall (show=true) mit dem passendsten Impuls und einem say-Satz.`
          : "Entscheide, ob jetzt ein Impuls angezeigt werden soll."
      }`,
    });

    // Bei Ablehnung oder unvollständiger Ausgabe: lieber schweigen.
    const decision = response.output_parsed;
    if (!decision) return Response.json({ decision: null, modelMs: Date.now() - started });
    if (body.pull) decision.show = true;
    else if (!allowed.includes(decision.type)) decision.show = false;
    // Nur Quellen zulassen, die es wirklich gibt.
    const ids = new Set(body.knowledge.map((k) => k.id));
    decision.sourceIds = decision.sourceIds.filter((id) => ids.has(id));
    const sources = decision.sourceIds.map((id) => body.knowledge.find((k) => k.id === id)!.title);
    return Response.json({ decision, sources, modelMs: Date.now() - started });
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) {
      return Response.json({ error: "OPENAI_API_KEY ist ungültig." }, { status: 500 });
    }
    if (error instanceof OpenAI.RateLimitError) {
      return Response.json({ error: "Rate-Limit erreicht – Impuls übersprungen." }, { status: 429 });
    }
    if (error instanceof OpenAI.APIError) {
      return Response.json({ error: `API-Fehler: ${error.message}` }, { status: 502 });
    }
    throw error;
  }
}
