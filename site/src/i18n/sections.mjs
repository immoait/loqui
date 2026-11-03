// Sprachen und URL-Struktur. Plain JS, damit auch astro.config.mjs es lesen kann.
// Deutsch liegt ohne Präfix unter /, Englisch unter /en/. Integrationsseiten liegen direkt unter der Sprachwurzel.
export const langs = ['de', 'en'];
export const defaultLang = 'de';
export const locales = { de: 'de-DE', en: 'en-US' };
export const ogLocales = { de: 'de_DE', en: 'en_US' };

export const sections = {
  vergleich: { de: 'vergleich', en: 'compare' },
  einwaende: { de: 'einwaende', en: 'objections' },
  ratgeber: { de: 'ratgeber', en: 'guides' },
  glossar: { de: 'glossar', en: 'glossary' },
  integrationen: { de: '', en: '' },
};

export const root = (lang) => (lang === defaultLang ? '' : `/${lang}`);
export const hubPath = (collection, lang) => `${root(lang)}/${sections[collection][lang]}`.replace(/\/$/, '') || '/';
export const entryPath = (collection, lang, slug) =>
  `${root(lang)}${sections[collection][lang] ? `/${sections[collection][lang]}` : ''}/${slug}`;
