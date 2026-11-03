// Hilfen für zweisprachige Seiten: Sprache aus Eintrags-IDs, Gegenstücke für hreflang.
import { getCollection, type CollectionEntry } from 'astro:content';
import { isLive } from '../lib/live';
import { langs, defaultLang, entryPath, hubPath, root, sections } from './sections.mjs';

export type Lang = 'de' | 'en';
export type Section = keyof typeof sections;
export type Alternates = Partial<Record<Lang, string>>;
export { langs, defaultLang, entryPath, hubPath, root, sections };

/** „de/zu-teuer“ → { lang: 'de', slug: 'zu-teuer' } */
export const splitId = (id: string) => {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
};

/** Live-Einträge einer Sammlung in einer Sprache. */
export const entriesIn = async <C extends Section>(collection: C, lang: Lang) =>
  (await getCollection(collection, isLive)).filter((e) => splitId(e.id).lang === lang) as CollectionEntry<C>[];

/** Pfade derselben Seite in allen Sprachen. Englische Einträge verweisen per `source` auf den deutschen Slug. */
export async function alternatesFor(collection: Section, entry: CollectionEntry<Section>): Promise<Alternates> {
  const all = await getCollection(collection, isLive);
  const { lang, slug } = splitId(entry.id);
  const deSlug = lang === 'de' ? slug : (entry.data as { source?: string }).source;
  const out: Alternates = {};
  if (!deSlug) return { [lang]: entryPath(collection, lang, slug) };
  for (const e of all) {
    const s = splitId(e.id);
    if ((s.lang === 'de' && s.slug === deSlug) || (s.lang !== 'de' && (e.data as { source?: string }).source === deSlug)) {
      out[s.lang] = entryPath(collection, s.lang, s.slug);
    }
  }
  return out;
}

export const otherLang = (lang: Lang): Lang => (lang === 'de' ? 'en' : 'de');
export const homePath = (lang: Lang) => root(lang) || '/';
/** Pfad innerhalb einer Sprache, z. B. at('en', '/download') → /en/download */
export const at = (lang: Lang, p: string) => `${root(lang)}${p}`;
