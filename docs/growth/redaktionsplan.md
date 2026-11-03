# Redaktionsplan

Quelle für die wöchentliche Content-Routine. Status: offen → entwurf (Pull Request) → live.
Reihenfolge = Priorität. Neue Themen unten anhängen, nicht umsortieren ohne Grund.

| Bereich | Slug | Thema | Status |
|---|---|---|---|
| vergleich | loqui-vs-cluely | Loqui vs. Cluely | entwurf |
| einwaende | zu-teuer | „Das ist zu teuer“ | entwurf |
| glossar | redeanteil | Redeanteil | entwurf |
| ratgeber | redeanteil-im-verkaufsgespraech | Redeanteil im Verkaufsgespräch senken | entwurf |
| integrationen | zoom | Gesprächscoach für Zoom | entwurf |
| vergleich | loqui-vs-granola | Loqui vs. Granola | offen |
| vergleich | loqui-vs-fireflies | Loqui vs. Fireflies | offen |
| vergleich | loqui-vs-gong | Loqui vs. Gong | offen |
| vergleich | loqui-vs-otter | Loqui vs. Otter | offen |
| einwaende | kein-budget | „Wir haben kein Budget“ | offen |
| einwaende | schicken-sie-unterlagen | „Schicken Sie mir Unterlagen“ | offen |
| einwaende | wir-arbeiten-schon-mit | „Wir arbeiten schon mit X“ | offen |
| einwaende | kein-guter-zeitpunkt | „Jetzt ist kein guter Zeitpunkt“ | offen |
| einwaende | intern-abstimmen | „Ich muss das intern abstimmen“ | offen |
| integrationen | google-meet | Gesprächscoach für Google Meet | offen |
| integrationen | teams | Gesprächscoach für Microsoft Teams | offen |
| integrationen | slack | Gesprächscoach für Slack Huddles | offen |
| glossar | discovery-call | Discovery Call | offen |
| glossar | einwandbehandlung | Einwandbehandlung | offen |
| glossar | bant | BANT | offen |
| glossar | meddic | MEDDIC | offen |
| glossar | spin-selling | SPIN Selling | offen |
| ratgeber | discovery-fragen | Die besten Discovery-Fragen im B2B-Vertrieb | offen |
| ratgeber | preisgespraech-fuehren | Preisgespräch führen | offen |
| vergleich | beste-ki-sales-coaches | Beste KI-Sales-Coaches 2026 | offen |

## Regeln für jede neue Seite
- Vorlage und Felder aus `site/src/content.config.ts`. `kurz` = 2–3 Sätze, die allein als Antwort stehen können.
- Fakten über andere Produkte nur aus deren eigener Website, mit Stand-Datum im Text.
- Keine erfundenen Zahlen, Studien oder Kundenstimmen.
- Mindestens zwei `related`-Verweise auf bestehende Seiten.
- Autor ist immer „Loqui Redaktion“. Kein Personenname.
- **Jede Seite in beiden Sprachen.** Deutsch unter `site/src/content/<bereich>/de/`, Englisch (US) unter `.../en/` mit `source: <deutscher-slug>` und englischem Slug. Englisch nach `docs/i18n/en-styleguide.md` neu schreiben, Suchbegriff nach `docs/i18n/en-keywords.md`. Details: `docs/i18n/README.md`.
- Wird eine deutsche Seite geändert, auch die englische nachziehen und `updated` in beiden setzen. Sonst warnt der Build.
