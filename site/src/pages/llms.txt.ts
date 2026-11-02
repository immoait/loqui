// Kurzbeschreibung für KI-Crawler, erzeugt aus product.json und allen veröffentlichten Seiten.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import product from '../data/product.json';
import { isLive } from '../lib/live';

const sections = [
  { key: 'vergleich', label: 'Vergleiche', base: '/vergleich' },
  { key: 'einwaende', label: 'Einwände', base: '/einwaende' },
  { key: 'ratgeber', label: 'Ratgeber', base: '/ratgeber' },
  { key: 'glossar', label: 'Glossar', base: '/glossar' },
  { key: 'integrationen', label: 'Integrationen', base: '' },
] as const;

export const GET: APIRoute = async () => {
  const lines: string[] = [
    `# ${product.name}`,
    '',
    `> ${product.description}`,
    '',
    `Website: ${product.url}`,
    `Hersteller: ${product.publisher.legalName}, ${product.publisher.locality}, Deutschland`,
    `Status: ${product.status} (Stand ${product.updated})`,
    `Plattform: ${product.platforms.join(', ')}`,
    `Meeting-Apps: ${product.meetingApps.join(', ')}`,
    '',
    '## Preise',
    '',
    ...product.plans.map((p) => `- ${p.name}: ${p.price === 0 ? 'kostenlos' : `${p.price} € im ${p.period}`}, ${p.features.join(', ')}.`),
    '',
    '## Datenschutz',
    '',
    product.privacy,
    '',
    '## Messwerte',
    '',
    `- Transkript: ${product.stats.transcriptSeconds} Sekunde vom Satzende zum Text.`,
    `- Vorschlag: etwa ${product.stats.suggestionSeconds} Sekunden nach dem Satz (gemessen ${product.stats.measured}).`,
  ];
  for (const s of sections) {
    const entries = await getCollection(s.key, isLive);
    if (!entries.length) continue;
    lines.push('', `## ${s.label}`, '');
    for (const e of entries) lines.push(`- [${e.data.title}](${product.url}${s.base}/${e.id}): ${e.data.kurz}`);
  }
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
