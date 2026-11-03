// Kurzbeschreibung für KI-Crawler (llms.txt), je Sprache aus Produktdaten und allen veröffentlichten Seiten.
import { productFor } from './product';
import { entriesIn, entryPath, root, splitId, type Lang, type Section } from '../i18n';
import { hubs } from '../i18n/ui';

const words = {
  de: { maker: 'Hersteller', country: 'Deutschland', status: 'Status', asOf: 'Stand', platform: 'Plattform', apps: 'Meeting-Apps', requires: 'Voraussetzung', orNewer: 'oder neuer', download: 'Download', prices: 'Preise', free: 'kostenlos', privacy: 'Datenschutz', measured: 'Messwerte', transcript: (s: string) => `Transkript: ${s} Sekunde vom Satzende zum Text.`, suggestion: (s: string, d: string) => `Vorschlag: etwa ${s} Sekunden nach dem Satz (gemessen ${d}).`, integrations: 'Integrationen', other: 'English version' },
  en: { maker: 'Publisher', country: 'Germany', status: 'Status', asOf: 'as of', platform: 'Platform', apps: 'Meeting apps', requires: 'Requires', orNewer: 'or later', download: 'Download', prices: 'Pricing', free: 'free', privacy: 'Privacy', measured: 'Measured performance', transcript: (s: string) => `Transcript: ${s} second from end of sentence to text.`, suggestion: (s: string, d: string) => `Suggestion: about ${s.replace(',', '.')} seconds after the sentence (measured ${d}).`, integrations: 'Integrations', other: 'Deutsche Version' },
};

export async function llms(lang: Lang) {
  const p = productFor(lang);
  const w = words[lang];
  const base = `${p.url}${root(lang)}`;
  const price = (n: number, period: string | null) =>
    n === 0 ? w.free : lang === 'en' ? `$${n}/${period}` : `${n} € im ${period}`;
  const lines: string[] = [
    `# ${p.name}`, '', `> ${p.description}`, '',
    `Website: ${base || p.url}${lang === 'de' ? '/' : ''}`,
    `${w.other}: ${p.url}${lang === 'en' ? '/llms.txt' : '/en/llms.txt'}`,
    `${w.maker}: ${p.publisher.legalName}, ${p.publisher.locality}, ${w.country}`,
    `${w.status}: ${p.status} (${w.asOf} ${p.updated})`,
    `${w.platform}: ${p.platforms.join(', ')}`,
    `${w.requires}: macOS ${p.download.minMacOS} ${w.orNewer}`,
    `${w.apps}: ${p.meetingApps.join(', ')}`,
    `${w.download}: ${base}/download`,
    '', `## ${w.prices}`, '',
    ...p.plans.map((pl) => `- ${pl.name}: ${price(pl.price, pl.period)}, ${pl.features.join(', ')}.`),
    '', `## ${w.privacy}`, '', p.privacy,
    '', `## ${w.measured}`, '',
    `- ${w.transcript(p.stats.transcriptSeconds)}`,
    `- ${w.suggestion(p.stats.suggestionSeconds, p.stats.measured)}`,
  ];
  for (const s of ['vergleich', 'einwaende', 'ratgeber', 'glossar', 'integrationen'] as Section[]) {
    const entries = await entriesIn(s, lang);
    if (!entries.length) continue;
    const label = s === 'integrationen' ? w.integrations : hubs[s][lang].title;
    lines.push('', `## ${label}`, '');
    for (const e of entries) lines.push(`- [${e.data.title}](${p.url}${entryPath(s, lang, splitId(e.id).slug)}): ${e.data.kurz}`);
  }
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
