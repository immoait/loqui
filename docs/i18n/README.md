# Zweisprachige Website (de/en)

- Deutsch unter `/`, Englisch (US) unter `/en`. Preise auf Englisch in USD.
- Inhalte: `site/src/content/<bereich>/<sprache>/<slug>.md`. Bereichsnamen bleiben deutsch (`vergleich`, `einwaende`, `ratgeber`, `glossar`, `integrationen`), die URL-Pfade sind je Sprache in `site/src/i18n/sections.mjs` festgelegt.
- Eine englische Seite verweist mit `source: <deutscher-slug>` auf ihr Original. Daraus entstehen hreflang und der Sprachschalter.
- `related:` nennt Seiten derselben Sprache als `<bereich>/<slug>`, z. B. `glossar/talk-to-listen-ratio`.
- Rahmentexte: `site/src/i18n/ui.ts`, Startseite: `home.ts`, Download: `download.ts`. Produktdaten: `site/src/data/product.json` (Feld `en` überschreibt).
- Englisch wird neu geschrieben, nicht übersetzt: `en-styleguide.md`. Suchbegriffe je Seite: `en-keywords.md`.
- Wird eine deutsche Seite aktualisiert (`updated`), warnt der Build, bis die englische nachzieht.

## Slug-Zuordnung

| Bereich | de | en | URL en |
|---|---|---|---|
| vergleich | loqui-vs-cluely | loqui-vs-cluely | /en/compare/loqui-vs-cluely |
| einwaende | zu-teuer | too-expensive | /en/objections/too-expensive |
| ratgeber | redeanteil-im-verkaufsgespraech | talk-less-on-sales-calls | /en/guides/talk-less-on-sales-calls |
| glossar | redeanteil | talk-to-listen-ratio | /en/glossary/talk-to-listen-ratio |
| integrationen | zoom | zoom | /en/zoom |
