// Meldet nach jedem Produktions-Build alle Seiten an IndexNow (Bing, Yandex u. a.).
// Bing speist auch die ChatGPT-Suche. Läuft nur auf Vercel in der Produktion.
const KEY = '2c3c215ce0a345f2a7993b2db18193be';
const HOST = 'useloqui.de';

export default function indexNow() {
  return {
    name: 'loqui-indexnow',
    hooks: {
      'astro:build:done': async ({ pages, logger }) => {
        if (process.env.VERCEL_ENV !== 'production') return;
        const urlList = pages
          .map((p) => p.pathname.replace(/\/$/, ''))
          .filter((p) => !/^(impressum|datenschutz|404)$/.test(p) && !p.endsWith('.txt'))
          .map((p) => `https://${HOST}/${p}`);
        try {
          const res = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
          });
          logger.info(`IndexNow: ${urlList.length} URLs gemeldet, Status ${res.status}`);
        } catch (err) {
          logger.warn(`IndexNow fehlgeschlagen: ${err.message}`);
        }
      },
    },
  };
}
