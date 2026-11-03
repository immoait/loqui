// Texte der Download-Seite in beiden Sprachen.
import type { Lang } from './index';

export const download: Record<Lang, {
  title: string; description: (v: string) => string; h1: string; lede: string; button: string; share: string;
  soon: string; meta: (v: string, version: string, size: string) => string; started: string; again: string;
  notMac: string; copied: string; shareTitle: string; shareText: string;
  stepsTitle: string; steps: { t: string; d: string }[]; faqTitle: string; faq: { q: string; a: string }[];
}> = {
  de: {
    title: 'Loqui für Mac laden – Loqui',
    description: (v) => `Loqui kostenlos für den Mac laden: in drei Schritten installiert, ab macOS ${v}. Läuft mit Zoom, Google Meet, Teams und Slack, ohne Bot im Meeting.`,
    h1: 'Loqui für den Mac.',
    lede: 'Kostenlos laden und im nächsten Call ausprobieren.',
    button: 'Für Mac laden',
    share: 'Link an mich schicken',
    soon: 'Die erste Version ist fast fertig. Der Download erscheint hier in Kürze.',
    meta: (v, version, size) => [`macOS ${v} oder neuer`, version && `Version ${version}`, size].filter(Boolean).join(', '),
    started: 'Der Download läuft. Startet nichts?',
    again: 'Hier noch einmal laden',
    notMac: 'Loqui läuft auf dem Mac. Schick dir den Link und lade die App dort.',
    copied: 'Link kopiert',
    shareTitle: 'Loqui für Mac',
    shareText: 'Loqui auf dem Mac laden:',
    stepsTitle: 'In drei Schritten startklar.',
    steps: [
      { t: 'Installieren', d: 'Öffne die geladene Datei und ziehe Loqui in den Ordner Programme.' },
      { t: 'Zuhören erlauben', d: 'Starte Loqui. macOS fragt nach dem Mikrofon und nach „Nur Systemaudioaufnahme“. Erlaube beides, damit Loqui dich und dein Gegenüber hört.' },
      { t: 'Call starten', d: 'Starte ein Gespräch in Zoom, Google Meet, Teams oder Slack. Loqui erscheint oben am Bildschirm und hilft, sobald es zählt.' },
    ],
    faqTitle: 'Fragen zur Installation.',
    faq: [
      { q: 'Kostet Loqui etwas?', a: 'Der Einstieg ist kostenlos, mit 5 Gesprächen im Monat. Pro mit unbegrenzten Gesprächen und eigener Wissensbasis kostet 19 € im Monat und lässt sich in der App freischalten.' },
      { q: 'Warum braucht Loqui Mikrofon und Systemaudio?', a: 'Über das Mikrofon hört Loqui dich, über das Systemaudio dein Gegenüber im Call. Beides zusammen ergibt das Gespräch, zu dem Loqui Vorschläge macht. Eine Bildschirmaufnahme braucht Loqui nicht.' },
      { q: 'Muss ich in Zoom oder Teams etwas installieren?', a: 'Nein. Loqui läuft als eigenes Fenster auf deinem Mac und tritt keinem Meeting bei.' },
      { q: 'Wie werde ich Loqui wieder los?', a: 'Zieh Loqui aus dem Programme-Ordner in den Papierkorb. Deine Berichte bleiben lokal auf dem Mac, unter ~/Library/Application Support. Lösch dort den Ordner der App, wenn du sie auch entfernen willst.' },
    ],
  },
  en: {
    title: 'Download Loqui: Free AI sales coach for Mac',
    description: (v) => `Install Loqui on your Mac in three steps and start free. Needs macOS ${v} or later. Works with Zoom, Google Meet, Teams, and Slack. No bot joins your call.`,
    h1: 'Loqui for Mac.',
    lede: 'Download it free and try it on your next call.',
    button: 'Download for Mac',
    share: 'Send me the link',
    soon: 'The first version is almost ready. The download will appear here soon.',
    meta: (v, version, size) => [`macOS ${v} or later`, version && `version ${version}`, size].filter(Boolean).join(', '),
    started: 'Your download has started. Nothing happening?',
    again: 'Download again',
    notMac: 'Loqui runs on Mac. Send yourself the link and download it there.',
    copied: 'Link copied',
    shareTitle: 'Loqui for Mac',
    shareText: 'Download Loqui on your Mac:',
    stepsTitle: 'Ready in three steps.',
    steps: [
      { t: 'Install', d: 'Open the downloaded file and drag Loqui into your Applications folder.' },
      { t: 'Let Loqui listen', d: 'Open Loqui. macOS asks for microphone access and for “System Audio Recording Only.” Allow both so Loqui can hear you and everyone else on the call.' },
      { t: 'Start a call', d: 'Join a call in Zoom, Google Meet, Teams, or Slack. Loqui appears at the top of your screen and steps in when it counts.' },
    ],
    faqTitle: 'Setup questions.',
    faq: [
      { q: 'Is Loqui free?', a: 'Starter is free and includes 5 calls a month. Pro adds unlimited calls and your own knowledge base for $19 a month, and you can upgrade right in the app.' },
      { q: 'Why does Loqui need the microphone and system audio?', a: 'The microphone lets Loqui hear you. System audio lets it hear everyone else on the call. Together, that gives Loqui the whole call to work with. It doesn’t need screen recording.' },
      { q: 'Do I need to install anything in Zoom or Teams?', a: 'No. Loqui runs in its own window on your Mac and never joins the call.' },
      { q: 'How do I uninstall Loqui?', a: 'Drag Loqui from your Applications folder to the Trash. Your reports stay on your Mac in ~/Library/Application Support; delete the app’s folder there to remove them too.' },
    ],
  },
};
