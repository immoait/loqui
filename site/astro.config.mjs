import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import indexNow from './integrations/indexnow.mjs';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { sections, langs, entryPath } from './src/i18n/sections.mjs';

// Letzte Änderung je Inhaltsseite aus dem Feld `updated`, damit die Sitemap ein echtes lastmod trägt.
// Inhalte liegen unter src/content/<bereich>/<sprache>/<slug>.md.
const lastmod = {};
for (const dir of Object.keys(sections)) {
  for (const lang of langs) {
    const folder = new URL(`./src/content/${dir}/${lang}/`, import.meta.url);
    if (!existsSync(folder)) continue;
    for (const file of readdirSync(folder)) {
      const updated = readFileSync(new URL(file, folder), 'utf8').match(/^updated:\s*(\S+)/m)?.[1];
      if (updated) lastmod[`https://useloqui.de${entryPath(dir, lang, file.replace(/\.md$/, ''))}`] = new Date(updated).toISOString();
    }
  }
}
const product = JSON.parse(readFileSync(new URL('./src/data/product.json', import.meta.url), 'utf8'));

// Saubere URLs ohne Schrägstrich am Ende, passend zu canonical und vercel.json.
export default defineConfig({
  site: 'https://useloqui.de',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(impressum|datenschutz|404)$/.test(page),
      serialize: (item) => ({ ...item, lastmod: lastmod[item.url] ?? new Date(product.updated).toISOString() }),
    }),
    indexNow(),
  ],
});
