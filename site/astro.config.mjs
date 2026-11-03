import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import indexNow from './integrations/indexnow.mjs';
import { readFileSync, readdirSync } from 'node:fs';

// Letzte Änderung je Inhaltsseite aus dem Feld `updated`, damit die Sitemap ein echtes lastmod trägt.
const lastmod = {};
const bases = { vergleich: '/vergleich/', einwaende: '/einwaende/', ratgeber: '/ratgeber/', glossar: '/glossar/', integrationen: '/' };
for (const [dir, base] of Object.entries(bases)) {
  for (const file of readdirSync(new URL(`./src/content/${dir}`, import.meta.url))) {
    const updated = readFileSync(new URL(`./src/content/${dir}/${file}`, import.meta.url), 'utf8').match(/^updated:\s*(\S+)/m)?.[1];
    if (updated) lastmod[`https://useloqui.de${base}${file.replace(/\.md$/, '')}`] = new Date(updated).toISOString();
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
