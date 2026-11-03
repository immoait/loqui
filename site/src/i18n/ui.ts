// Texte für Rahmen, Navigation und Übersichtsseiten in beiden Sprachen.
// Seitentexte stehen in home.ts, download.ts und den Markdown-Dateien unter content/<bereich>/<sprache>/.
import type { Lang, Section } from './index';

export const ui = {
  de: {
    nav: { label: 'Hauptnavigation', features: 'Funktionen', privacy: 'Datenschutz', pricing: 'Preise', faq: 'Fragen', cta: 'Laden' },
    anchors: { features: 'funktionen', privacy: 'datenschutz', pricing: 'preise', faq: 'fragen' },
    footer: { content: 'Inhalte', legal: 'Rechtliches', imprint: 'Impressum', privacy: 'Datenschutz' },
    switcher: { label: 'English', short: 'EN', aria: 'Diese Seite auf Englisch' },
    hint: { text: 'Diese Seite gibt es auch auf Deutsch.', action: 'Auf Deutsch lesen', close: 'Schließen' },
    crumbs: 'Brotkrumen',
    article: {
      kurz: 'Kurz gesagt',
      checked: 'Zuletzt geprüft am',
      faq: 'Fragen.',
      related: 'Passend dazu',
      ctaTitle: 'Die richtige Antwort, live im Gespräch.',
      cta: 'Kostenlos für Mac laden',
      customerSays: 'Der Kunde sagt',
      compareLabel: 'Loqui im Vergleich',
    },
    notFound: {
      title: 'Seite nicht gefunden',
      description: 'Diese Seite gibt es nicht. Hier geht es zurück zur Startseite von Loqui.',
      h1: 'Diese Seite gibt es nicht.',
      lede: 'Vielleicht hat sich die Adresse geändert. Auf der Startseite findest du alles über Loqui.',
      back: 'Zur Startseite',
    },
  },
  en: {
    nav: { label: 'Main navigation', features: 'Features', privacy: 'Privacy', pricing: 'Pricing', faq: 'FAQ', cta: 'Download' },
    anchors: { features: 'features', privacy: 'privacy', pricing: 'pricing', faq: 'faq' },
    footer: { content: 'Content', legal: 'Legal', imprint: 'Legal notice (German)', privacy: 'Privacy policy (German)' },
    switcher: { label: 'Deutsch', short: 'DE', aria: 'This page in German' },
    hint: { text: 'This page is also available in English.', action: 'Read in English', close: 'Close' },
    crumbs: 'Breadcrumbs',
    article: {
      kurz: 'In short',
      checked: 'Last reviewed',
      faq: 'Questions.',
      related: 'Related',
      ctaTitle: 'The right answer, live on the call.',
      cta: 'Download free for Mac',
      customerSays: 'The prospect says',
      compareLabel: 'Loqui compared',
    },
    notFound: {
      title: 'Page not found',
      description: 'This page doesn’t exist. Head back to the Loqui homepage.',
      h1: 'This page doesn’t exist.',
      lede: 'The address may have changed. You’ll find everything about Loqui on the homepage.',
      back: 'Back to the homepage',
    },
  },
} as const;

type Hub = { title: string; seoTitle: string; lede: string; description: string; intro: string };

/** Übersichtsseiten je Bereich. `intro` ist HTML. */
export const hubs: Record<Exclude<Section, 'integrationen'>, Record<Lang, Hub>> = {
  vergleich: {
    de: {
      title: 'Vergleiche',
      seoTitle: 'KI-Tools für Meetings im Vergleich',
      lede: 'Loqui neben anderen KI-Tools für Meetings. Ehrlich, mit den Fällen, in denen das andere Tool besser passt.',
      description: 'Ehrliche Vergleiche von KI-Tools für Videocalls: Loqui neben anderen Assistenten und Notiz-Apps. Echtzeit-Hilfe, Datenschutz, Preise und wann welches passt.',
      intro: '<p>Manche Tools schreiben mit und fassen danach zusammen. Andere helfen dir, während du sprichst. Jeder Vergleich zeigt beide Seiten in einer Tabelle, nennt die Quelle für jede Angabe über das andere Tool und sagt klar, für wen es die bessere Wahl ist.</p>',
    },
    en: {
      title: 'Comparisons',
      seoTitle: 'AI sales assistants compared, side by side',
      lede: 'How Loqui stacks up against other AI tools for sales calls. Honest, including when the other tool is the better pick.',
      description: 'Honest comparisons of AI tools for sales calls: live help vs. note-takers, bots vs. no bots, privacy, and pricing, plus when the other tool fits better.',
      intro: '<p>Some tools take notes and summarize after the call. Others help you while you’re still talking. Every comparison puts both tools side by side in one table, cites a source for each claim about the other tool, and says plainly who it’s the better pick for.</p>',
    },
  },
  einwaende: {
    de: {
      title: 'Einwände',
      seoTitle: 'Einwandbehandlung: Antworten auf Kundeneinwände',
      lede: 'Die häufigsten Einwände im B2B-Vertrieb, mit Antworten, die du direkt sagen kannst.',
      description: 'Einwandbehandlung im B2B-Vertrieb: typische Kundeneinwände, was meistens dahintersteckt und Antworten mit Beispielsätzen, die du direkt sagen kannst.',
      intro: '<p>Ein Einwand ist selten ein Nein. Meist fehlt dem Kunden eine Information oder ein Bezug zwischen Preis und Nutzen. Jede Seite erklärt, was hinter dem Einwand steckt, und gibt dir Sätze, die du im Gespräch sagen kannst.</p>',
    },
    en: {
      title: 'Objections',
      seoTitle: 'Sales objection handling: responses that work',
      lede: 'The objections B2B buyers raise most, with responses you can use word for word.',
      description: 'The most common B2B sales objections, what buyers usually mean by them, and word-for-word responses you can use on your next call without sounding scripted.',
      intro: '<p>An objection is rarely a no. Usually the buyer is missing a piece of information, or hasn’t connected the price to the value yet. Each page explains what’s really behind the objection and gives you lines you can say on the call.</p>',
    },
  },
  ratgeber: {
    de: {
      title: 'Ratgeber',
      seoTitle: 'Ratgeber Verkaufsgespräch: Tipps für B2B-Vertrieb',
      lede: 'Wie gute Verkaufsgespräche funktionieren. Konkret, mit Vorlagen zum Mitnehmen.',
      description: 'Ratgeber für bessere Verkaufsgespräche im B2B-Vertrieb: konkrete Techniken für Bedarfsanalyse, Fragen und Gesprächsführung, mit Beispielsätzen.',
      intro: '<p>Hier geht es um das, was im Gespräch passiert: wie du fragst, zuhörst und das Gespräch lenkst. Jede Anleitung ist so geschrieben, dass du sie im nächsten Call ausprobieren kannst.</p>',
    },
    en: {
      title: 'Guides',
      seoTitle: 'Sales call tips and guides for B2B sellers',
      lede: 'What great sales calls do differently. Concrete techniques, with lines you can borrow.',
      description: 'Practical guides for better B2B sales calls: discovery questions, talking less, and steering the call. Concrete techniques with example lines to copy.',
      intro: '<p>These guides are about what happens on the call: how you ask, how you listen, and how you steer. Each one is written so you can try it on your very next call.</p>',
    },
  },
  glossar: {
    de: {
      title: 'Glossar',
      seoTitle: 'Vertriebsglossar: Begriffe aus dem Verkauf erklärt',
      lede: 'Begriffe aus dem Vertrieb, kurz und klar erklärt.',
      description: 'Vertriebsbegriffe kurz und verständlich erklärt: was sie bedeuten, wie man sie im Verkaufsgespräch nutzt und woran du erkennst, ob es gut läuft.',
      intro: '<p>Jeder Eintrag beginnt mit einer Definition in zwei, drei Sätzen. Danach folgt, wie du den Begriff im Gespräch anwendest und woran du merkst, ob es funktioniert.</p>',
    },
    en: {
      title: 'Glossary',
      seoTitle: 'Sales glossary: key sales terms explained',
      lede: 'Sales terms, explained in plain English.',
      description: 'Sales terms in plain English: what each one means, how to use it on a real sales call, and how to tell whether it’s working for you and your team.',
      intro: '<p>Every entry starts with a two- or three-sentence definition. Then you get how to use it on a call and how to tell whether it’s working.</p>',
    },
  },
};

export const t = (lang: Lang) => ui[lang];
