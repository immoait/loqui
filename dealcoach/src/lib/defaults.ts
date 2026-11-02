import type { CoachSettings, KnowledgeItem, Speaker } from "./types";

export const DEFAULT_SETTINGS: CoachSettings = {
  callType: "discovery",
  enabled: { answer: true, question: true, behavior: true },
  minGapSec: 20,
  minConfidence: 0.6,
  storeTranscript: false,
};

// Beispiel-Wissensbasis für ein fiktives Produkt. Im Tab "Wissen" editierbar.
export const DEFAULT_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: "kb-produkt",
    title: "Produktüberblick",
    content:
      "FlowDesk ist eine Ticket- und Workflow-Plattform für IT-Service-Teams im Mittelstand (50–2.000 Mitarbeitende). Kernfunktionen: Ticketing, SLA-Überwachung, Self-Service-Portal, Automatisierungen ohne Code, Reporting.",
  },
  {
    id: "kb-preise",
    title: "Preise",
    content:
      "Team: 29 € pro Agent/Monat. Business: 49 € pro Agent/Monat (inkl. SLA-Management, Automatisierungen). Enterprise: individuell, ab 100 Agents, inkl. SSO und dediziertem Customer Success. Jahresvertrag: 15 % Rabatt. Keine Einrichtungsgebühr bei Business und Enterprise.",
  },
  {
    id: "kb-integrationen",
    title: "Integrationen",
    content:
      "Native Integrationen: Microsoft 365, Teams, Slack, Jira, Azure AD/Entra ID (SSO, nur Enterprise), REST-API und Webhooks. Keine native SAP-Integration; Anbindung über REST-API oder Partner möglich.",
  },
  {
    id: "kb-datenschutz",
    title: "Datenschutz & Hosting",
    content:
      "Hosting ausschließlich in Rechenzentren in Frankfurt (ISO 27001). AV-Vertrag nach DSGVO Art. 28 verfügbar. Daten verlassen die EU nicht. Penetrationstest jährlich durch externen Dienstleister.",
  },
  {
    id: "kb-einfuehrung",
    title: "Einführung",
    content:
      "Typische Einführung: 2–4 Wochen. Datenimport aus Jira Service Management, Zendesk und CSV. Business und Enterprise enthalten ein begleitetes Onboarding mit drei Workshops.",
  },
  {
    id: "kb-case-meyer",
    title: "Fallstudie Meyer Logistik",
    content:
      "Meyer Logistik (800 Mitarbeitende, 12 IT-Agents) hat von Jira Service Management gewechselt. Ergebnis nach 6 Monaten: 38 % weniger Tickets durch Self-Service-Portal, SLA-Einhaltung von 81 % auf 96 %.",
  },
  {
    id: "kb-wettbewerb",
    title: "Positionierung ggü. Wettbewerb",
    content:
      "Gegenüber Jira Service Management: einfachere Konfiguration ohne Admin-Spezialwissen, deutscher Support, Hosting in Deutschland. Gegenüber ServiceNow: deutlich geringere Kosten und Einführungszeit, dafür weniger Tiefe im Enterprise-Asset-Management. Keine Aussagen zu Wettbewerbspreisen machen.",
  },
];

/** Übungsgespräch für den Demo-Modus (Wizard-of-Oz-Test aus dem Plan). */
export const DEMO_SCRIPT: { speaker: Speaker; text: string; pauseMs: number }[] = [
  { speaker: "rep", text: "Hallo Frau Brandt, danke, dass Sie sich Zeit nehmen. Wie läuft es aktuell bei Ihnen im IT-Service?", pauseMs: 1500 },
  { speaker: "customer", text: "Ehrlich gesagt ziemlich chaotisch. Wir sind acht Leute im Service Desk und arbeiten mit Jira Service Management, aber die Konfiguration frisst unglaublich viel Zeit.", pauseMs: 4000 },
  { speaker: "rep", text: "Verstehe. Das hören wir oft. FlowDesk ist genau dafür gebaut, wir haben Automatisierungen ohne Code, ein Self-Service-Portal, SLA-Überwachung, Reporting und sehr viele Integrationen, Microsoft 365, Teams, Slack, Jira, und außerdem ist die Einführung meistens in zwei bis vier Wochen erledigt, und wir haben deutschen Support, was viele Kunden sehr schätzen, und das Hosting ist in Frankfurt.", pauseMs: 6000 },
  { speaker: "customer", text: "Okay. Was kostet das denn ungefähr für ein Team unserer Größe?", pauseMs: 3500 },
  { speaker: "rep", text: "Das hängt ein bisschen vom Paket ab.", pauseMs: 2500 },
  { speaker: "customer", text: "Und wir müssten das an SAP anbinden, unsere Assets liegen alle dort. Geht das?", pauseMs: 4500 },
  { speaker: "rep", text: "Ja, ich denke, das sollte gehen.", pauseMs: 3000 },
  { speaker: "customer", text: "Ein Punkt noch: Unser Datenschutzbeauftragter wird fragen, wo die Daten liegen. Das war bei unserem letzten Tool ein großes Thema.", pauseMs: 4500 },
  { speaker: "rep", text: "Gute Frage, das kläre ich.", pauseMs: 3000 },
  { speaker: "customer", text: "Ehrlich gesagt ist das Budget dieses Jahr knapp. Der Wechsel müsste sich schnell rechnen, sonst bekomme ich das intern nicht durch.", pauseMs: 5000 },
  { speaker: "rep", text: "Verstehe ich gut.", pauseMs: 2500 },
  { speaker: "customer", text: "Wir schauen uns parallel auch ServiceNow an.", pauseMs: 4000 },
];
