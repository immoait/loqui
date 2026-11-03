// Texte der Startseite in beiden Sprachen. Englisch ist eine Neufassung nach docs/i18n/en-styleguide.md, keine Wort-für-Wort-Übersetzung.
import type { Lang } from './index';

type QA = { q: string; a: string };

export const home: Record<Lang, {
  title: string;
  description: string;
  h1: [string, string];
  lede: string;
  cta: string;
  how: string;
  note: (minMacOS: string) => string;
  mock: {
    aria: string; date: string; you: string; buyer: string; colleague: string; listening: string; found: string;
    caption: string; kind: string; after: (s: string) => string; say: string; src: string;
    chips: [string, string, string]; shortcut: string;
  };
  statement: [string, string];
  featuresTitle: string;
  tiles: {
    answer: { h: string; p: string; kind: string; say: string; src: string };
    question: { h: string; kind: string; say: string };
    talk: { h: string; you: string };
    report: { h: string; p: string; rows: [string, string, string] };
  };
  about: { h: string; p: string; label: string; rows: { name: string; text: string }[] };
  privacy: { h: string; lede: string; facts: { t: string; d: string }[] };
  pricing: { h: string; per: string; free: string; pro: string };
  faqTitle: string;
  faq: (minMacOS: string) => QA[];
  closing: [string, string];
  featureList: string[];
  requirements: (minMacOS: string) => string;
}> = {
  de: {
    title: 'Loqui – KI-Gesprächscoach für Videocalls auf dem Mac',
    description: 'Loqui hört deine Videocalls in Zoom, Meet und Teams mit und zeigt dir in Echtzeit die passende Antwort, die nächste gute Frage und danach ehrliches Feedback.',
    h1: ['Immer die ', 'richtige Antwort.'],
    lede: 'Der Gesprächscoach, der live mithört und dir im richtigen Moment hilft.',
    cta: 'Kostenlos für Mac laden',
    how: 'So funktioniert Loqui',
    note: (v) => `Ab macOS ${v}. Läuft mit Zoom, Google Meet, Teams und Slack.`,
    mock: {
      aria: 'Loqui über einem laufenden Videocall: Der Kunde sagt, es sei zu teuer. Zweieinhalb Sekunden später schlägt Loqui eine Antwort vor.',
      date: 'Mo 14:32', you: 'Du', buyer: 'Thomas Meyer', colleague: 'Sandra Kühn', listening: 'Hört zu', found: 'Preis-Einwand',
      caption: '„Ehrlich gesagt ist uns das zu teuer.“',
      kind: 'Antwort', after: (s) => `nach ${s} Sek.`,
      say: '„49 € pro Nutzer, und die doppelte Pflege in Excel fällt weg. Wie viele Stunden sind das bei Ihnen pro Woche?“',
      src: 'Aus: Preise, Case Meyer GmbH',
      chips: ['Was soll ich sagen?', 'Nächste Frage', 'Einwand'], shortcut: '⌥␣',
    },
    statement: ['Loqui hört zu.', ' Und hilft genau dann, wenn es zählt.'],
    featuresTitle: 'Funktionen',
    tiles: {
      answer: { h: 'Die Antwort, bevor die Pause zu lang wird.', p: 'Aus deiner Wissensbasis, mit Quelle. Was dort fehlt, erfindet Loqui nicht.', kind: 'Antwort', say: '„Die Einführung dauert etwa zwei Wochen. Den Rollout-Plan schicke ich Ihnen heute noch.“', src: 'Aus: Onboarding-FAQ' },
      question: { h: 'Die eine Frage, die fehlt.', kind: 'Nächste Frage', say: '„Was passiert, wenn das bis Q2 nicht gelöst ist?“' },
      talk: { h: 'Redeanteil, live.', you: 'du' },
      report: { h: 'Ehrliches Feedback nach jedem Gespräch.', p: 'Was gut lief. Was du beim nächsten Mal anders machst.', rows: ['Preis-Einwand sauber in Nutzen übersetzt.', 'Frage nach dem Zeitdruck fehlte.', 'Zweieinhalb Minuten am Stück geredet.'] },
    },
    about: {
      h: 'Was Loqui ist.',
      p: 'Ein Gesprächscoach für den Mac. Er hört deine Videocalls in Zoom, Google Meet, Teams und Slack mit und zeigt dir die passende Antwort aus deinen Unterlagen, die nächste gute Frage oder einen Hinweis, wenn du zu lange redest. Danach bekommst du Feedback mit Zeitmarken.',
      label: 'Loqui im Vergleich',
      rows: [
        { name: 'Granola', text: 'Schreibt mit und fasst danach zusammen.' },
        { name: 'Fireflies', text: 'Nimmt auf, transkribiert, analysiert nach dem Gespräch.' },
        { name: 'Cluely', text: 'Hilft live mit allgemeinem KI-Wissen.' },
        { name: 'Loqui', text: 'Hilft live mit Antworten aus deinen Unterlagen. Und zeigt dir, wie du besser wirst.' },
      ],
    },
    privacy: {
      h: 'Läuft still im Hintergrund.',
      lede: 'Du merkst Loqui nur, wenn es dir hilft.',
      facts: [
        { t: 'Kein Bot im Meeting', d: 'Loqui läuft als Fenster auf deinem Mac und tritt keinem Call bei.' },
        { t: 'Nur du siehst die Vorschläge', d: 'Auch nicht, wenn du deinen Bildschirm teilst.' },
        { t: 'Keine Aufnahmen', d: 'Der Ton geht verschlüsselt zur Transkription an OpenAI. Loqui speichert ihn nicht.' },
        { t: 'Berichte bleiben bei dir', d: 'Feedback und Verlauf liegen lokal auf deinem Mac.' },
      ],
    },
    pricing: { h: 'Einfach anfangen.', per: 'im', free: 'Kostenlos laden', pro: 'Laden und in der App upgraden' },
    faqTitle: 'Fragen.',
    faq: (v) => [
      { q: 'Was unterscheidet Loqui von Granola?', a: 'Granola schreibt mit und fasst danach zusammen. Loqui hilft dir, während du sprichst.' },
      { q: 'Was unterscheidet Loqui von Cluely?', a: 'Cluely hilft live mit allgemeinem KI-Wissen. Loqui antwortet aus deiner eigenen Wissensbasis, mit Quelle, und coacht dich: Redeanteil live und Feedback nach jedem Gespräch.' },
      { q: 'Sieht mein Gegenüber die Vorschläge?', a: 'Nein. Loqui ist ein eigenes Fenster und erscheint nicht, wenn du deinen Bildschirm teilst.' },
      { q: 'Wohin geht das Gesagte?', a: 'Für Transkription und Vorschläge wird der Ton verschlüsselt an OpenAI geschickt. Loqui selbst speichert keine Aufnahmen. Berichte bleiben auf deinem Mac.' },
      { q: 'Lenkt das nicht ab?', a: 'Loqui zeigt höchstens einen Vorschlag auf einmal. Wie oft, stellst du ein.' },
      { q: 'Woher kennt Loqui unsere Preise?', a: 'Aus deiner Wissensbasis. Was dort nicht steht, erfindet Loqui nicht.' },
      { q: 'Was brauche ich?', a: `Einen Mac mit macOS ${v} oder neuer. Loqui funktioniert mit Zoom, Google Meet, Microsoft Teams und Slack, als App oder im Browser.` },
      { q: 'Gibt es Loqui für Windows?', a: 'Noch nicht. Wir starten mit dem Mac.' },
    ],
    closing: ['Dein bestes Gespräch', 'kommt noch.'],
    featureList: ['Echtzeit-Transkription', 'Antwortvorschläge aus eigener Wissensbasis', 'Nächste Frage', 'Redeanteil live', 'Feedback nach dem Gespräch'],
    requirements: (v) => `macOS ${v} oder neuer`,
  },
  en: {
    title: 'Loqui: Real-time AI sales coach for Mac video calls',
    description: 'Get the right answer mid-call. Loqui listens to Zoom, Meet, Teams, and Slack calls on your Mac and suggests replies from your own docs. No bot joins.',
    h1: ['Always know ', 'what to say.'],
    lede: 'The call coach that listens in and shows you the answer from your own docs, right when you need it.',
    cta: 'Download free for Mac',
    how: 'See how it works',
    note: (v) => `macOS ${v} or later. Works with Zoom, Google Meet, Teams, and Slack.`,
    mock: {
      aria: 'Loqui over a live video call. The prospect says it’s more than they budgeted for. Two and a half seconds later, Loqui suggests an answer.',
      date: 'Mon 2:32 PM', you: 'You', buyer: 'Mark Meyer', colleague: 'Sarah Chen', listening: 'Listening', found: 'Pricing objection',
      caption: '“Honestly, that’s more than we budgeted for.”',
      kind: 'Answer', after: (s) => `after ${s.replace(',', '.')} sec`,
      say: '“It’s $49 a seat, and no more double entry in Excel. How many hours a week does that cost your team?”',
      src: 'From: Pricing sheet, ROI case study',
      chips: ['What should I say?', 'Next question', 'Objection'], shortcut: '⌥␣',
    },
    statement: ['Loqui listens.', ' And steps in when it counts.'],
    featuresTitle: 'Features',
    tiles: {
      answer: { h: 'The answer, before the silence gets awkward.', p: 'Straight from your own docs, with the source. If it’s not in there, Loqui won’t make it up.', kind: 'Answer', say: '“Onboarding takes about two weeks. I’ll send you the rollout plan today.”', src: 'From: Onboarding FAQ' },
      question: { h: 'The question you forgot to ask.', kind: 'Next question', say: '“What happens if this isn’t fixed by Q2?”' },
      talk: { h: 'Talk ratio, live.', you: 'you' },
      report: { h: 'Honest feedback after every call.', p: 'What worked. What to do differently next time.', rows: ['Turned the pricing objection into a value conversation.', 'Never asked about their timeline.', 'Talked for two and a half minutes straight.'] },
    },
    about: {
      h: 'What Loqui is.',
      p: 'Loqui is a call coach for your Mac. It listens to your video calls in Zoom, Google Meet, Teams, and Slack and shows you the right answer from your own docs, the next question to ask, or a nudge when you’ve been talking too long. After the call, you get feedback with timestamps.',
      label: 'Loqui compared',
      rows: [
        { name: 'Granola', text: 'Takes notes and summarizes after the call.' },
        { name: 'Fireflies', text: 'Records, transcribes, and analyzes after the call.' },
        { name: 'Cluely', text: 'Helps live, using general AI knowledge.' },
        { name: 'Loqui', text: 'Helps live, using your own docs. Then shows you how to get better.' },
      ],
    },
    privacy: {
      h: 'Quiet until it helps.',
      lede: 'Loqui sits in a small window on your Mac. You’ll only notice it when it helps.',
      facts: [
        { t: 'No bot on the call', d: 'Loqui runs in its own window on your Mac and never joins the call.' },
        { t: 'Only you see the suggestions', d: 'Even when you share your screen.' },
        { t: 'No recordings', d: 'Audio goes to OpenAI, encrypted, for transcription and suggestions. Loqui doesn’t store recordings.' },
        { t: 'Reports stay on your Mac', d: 'Your feedback and call history are stored locally.' },
      ],
    },
    pricing: { h: 'Start free.', per: '/', free: 'Download free', pro: 'Download, then upgrade' },
    faqTitle: 'Questions.',
    faq: (v) => [
      { q: 'How is Loqui different from Granola?', a: 'Granola takes notes and summarizes after the call. Loqui helps you while you’re still talking.' },
      { q: 'How is Loqui different from Cluely?', a: 'Cluely gives you live help from general AI knowledge. Loqui answers from your own knowledge base, shows you the source, and coaches you with a live talk ratio and feedback after every call.' },
      { q: 'Can anyone else on the call see the suggestions?', a: 'No. Loqui runs in its own window, and it doesn’t show up when you share your screen.' },
      { q: 'Where does the audio go?', a: 'Loqui sends audio to OpenAI, encrypted, for transcription and suggestions. Loqui doesn’t store recordings. Reports stay on your Mac.' },
      { q: 'Won’t it distract me?', a: 'Loqui never shows more than one suggestion at a time, and you decide how often.' },
      { q: 'How does Loqui know our pricing?', a: 'From your knowledge base. If it’s not in there, Loqui won’t make it up.' },
      { q: 'What do I need?', a: `A Mac with macOS ${v} or later. Loqui works with Zoom, Google Meet, Microsoft Teams, and Slack, in the desktop app or in the browser.` },
      { q: 'Is there a Windows version?', a: 'Not yet. We’re starting with Mac.' },
    ],
    closing: ['Your best call', 'is still ahead.'],
    featureList: ['Real-time transcription', 'Suggested answers from your own knowledge base', 'Next question to ask', 'Live talk ratio', 'Post-call feedback'],
    requirements: (v) => `macOS ${v} or later`,
  },
};
