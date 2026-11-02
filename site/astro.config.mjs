import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import indexNow from './integrations/indexnow.mjs';

// Saubere URLs ohne Schrägstrich am Ende, passend zu canonical und vercel.json.
export default defineConfig({
  site: 'https://useloqui.de',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(impressum|datenschutz)$/.test(page),
    }),
    indexNow(),
  ],
});
