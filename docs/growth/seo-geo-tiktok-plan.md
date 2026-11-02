# Loqui: Wachstumsplan SEO, GEO und TikTok

Stand: 2. November 2026 · Domain: https://useloqui.de · Markt: DACH, Deutsch zuerst

Dieses Dokument ist die Grundlage für alle Marketing-Arbeiten und für automatische Claude-Aufgaben. Wer hier etwas ändert, ändert die Richtung.

## 1. Leitlinien

1. **Das Design bleibt.** Die Startseite wird nicht umgebaut. Wachstum entsteht durch neue Unterseiten, die exakt denselben Look nutzen (Systemschrift, helles Glas, Spektrum nur als Akzent, kurze Sätze).
2. **Jede Seite beantwortet eine echte Frage besser als alle anderen.** Keine Füllseiten. Google straft massenhaft erzeugte Inhalte ohne eigenen Wert ab („scaled content abuse“), und KI-Suchen zitieren nur, was konkret und belegt ist.
3. **Ein Thema, drei Kanäle.** Jedes Thema wird einmal recherchiert und dann als Webseite (SEO), als zitierfähiger Faktenblock (GEO) und als TikTok-Video verwertet.
4. **Claude entwirft, ein Mensch gibt frei.** Automatische Aufgaben erzeugen Entwürfe und Pull Requests. Veröffentlicht wird nach Freigabe.
5. **Ehrlich wie die Marke.** Keine erfundenen Zahlen, Kundenstimmen oder Testsieger. Messwerte nur aus eigenen Daten mit Quelle und Datum.

## 2. Ausgangslage

Vorhanden (Stand heute): schnelle statische Seite (30 KB, unter 0,3 s), canonical, robots.txt mit KI-Crawlern, sitemap.xml, llms.txt, strukturierte Daten (Organization, SoftwareApplication, FAQPage), Abschnitt „Was Loqui ist“ mit Vergleich, Search Console eingerichtet.

Lücken:
- Nur eine indexierbare Seite. Für Google gibt es kaum Einstiegspunkte.
- Kein Messsystem für Besucher und Anmeldungen. Das Early-Access-Formular speichert nichts.
- Keine Erwähnungen außerhalb der eigenen Seite. KI-Suchen kennen Loqui nicht.
- Namensdopplung: Eine Mac-Diktier-App heißt ebenfalls „Loqui“. Wir müssen die Marke immer als „Loqui Gesprächscoach“ verankern.

## 3. Technisches Fundament (Woche 1–2)

| Aufgabe | Warum | Aufwand |
|---|---|---|
| Vercel mit dem GitHub-Repo verbinden (Auto-Deploy bei Merge auf `main`, Vorschau je Pull Request) | Automatische Aufgaben können dann Pull Requests öffnen, jede Änderung hat eine Vorschau | gering |
| Seite auf **Astro** umstellen, Design 1:1 übernehmen: gemeinsames Stylesheet, Komponenten für Navigation, Footer, Kacheln, FAQ | Neue Seiten entstehen aus Markdown-Dateien statt kopiertem HTML. Sitemap, Schema und llms.txt werden automatisch erzeugt | mittel |
| Seitenvorlagen: Vergleich, Einwand, Ratgeber, Glossar, Integration | Einheitlicher Aufbau, gleiche Qualität, schnell befüllbar | mittel |
| Eine Datenquelle `src/data/product.json` für Preise, Zahlen, Funktionen | Preise und Fakten stimmen überall gleichzeitig (Seite, Schema, llms.txt) | gering |
| Vercel Web Analytics (cookielos) aktivieren | Besucher und Quellen messen ohne Cookie-Banner | gering |
| Early-Access-Formular anschließen (z. B. Vercel-Funktion + Resend-Audience oder Loops) mit Double-Opt-in | Ohne gespeicherte Anmeldungen gibt es keine Erfolgsmessung | gering |
| Bing Webmaster Tools + IndexNow bei jedem Deploy | Bing speist ChatGPT-Suche und Copilot. IndexNow meldet neue Seiten sofort | gering |
| Pro Seite eigenes Vorschaubild automatisch erzeugen (gleicher Stil wie `og.png`) | Bessere Klickrate beim Teilen auf LinkedIn und WhatsApp | gering |

Designregel für alle Vorlagen: Der Kopf jeder Unterseite ist eine große Überschrift plus ein Satz, dann eine Glas-Karte mit dem Kern („Kurz gesagt“), dann Inhalt in einer ruhigen Spalte. Keine neuen Farben, keine neuen Schriften.

## 4. Seitenarchitektur

Alle Bereiche hängen unter der bestehenden Domain. Die Startseite verlinkt sie dezent im Footer und aus passenden Stellen (FAQ, „Was Loqui ist“).

### 4.1 Vergleiche `/vergleich/…` (höchste Kaufabsicht, stärkster GEO-Hebel)
- loqui-vs-cluely, loqui-vs-granola, loqui-vs-fireflies, loqui-vs-gong, loqui-vs-otter
- „Beste KI-Sales-Coaches 2026“ als Übersicht, fair geschrieben, mit Loqui als einer Option

Aufbau: Kurz-gesagt-Karte, Tabelle (Echtzeit ja/nein, Bot im Meeting, Datenschutz, Preis, Sprache Deutsch), „Wann X die bessere Wahl ist“ (ehrlich), FAQ mit Schema. Ehrlichkeit ist hier Ranking-Faktor: KI-Suchen zitieren ausgewogene Vergleiche lieber als Werbung.

### 4.2 Einwand-Bibliothek `/einwaende/…` (Volumen, perfekt für TikTok)
Jede Seite ein typischer B2B-Einwand mit drei Antwortmustern, Beispielsätzen, Nachfrage und typischem Fehler. Start mit 20, Ziel 50:
- „Das ist zu teuer“, „Wir haben kein Budget“, „Schicken Sie mir Unterlagen“, „Wir arbeiten schon mit X“, „Jetzt ist kein guter Zeitpunkt“, „Ich muss das intern abstimmen“, „Wir machen das selbst“, „Das brauchen wir nicht“ …

Jede Seite endet mit: „So sieht das live in Loqui aus“ plus echtem Screenshot oder Video-Link.

### 4.3 Anwendungsfälle `/fuer/…`
discovery-calls, preisverhandlung, demo-calls, investorengespraeche, mitarbeitergespraeche, kundengespraeche-gruender. Kein Bereich für Prüfungen oder Bewerbungsgespräche (Spickzettel-Image vermeiden).

### 4.4 Integrationen `/zoom`, `/google-meet`, `/teams`, `/slack`
„Echtzeit-Gesprächscoach für Zoom“ usw. Kurz, mit Einrichtungsschritten und Screenshot. Diese Seiten ranken oft schnell, weil die Suchanfrage klar ist.

### 4.5 Ratgeber `/ratgeber/…`
Tiefe Artikel zu Fragen, die Vertriebler wirklich stellen: Redeanteil im Verkaufsgespräch, Discovery-Fragen, Einwandbehandlung lernen, Gesprächsleitfaden B2B, Abschlussquote erhöhen, Preisgespräch führen. Je Artikel eine eigene Erkenntnis oder Vorlage zum Mitnehmen.

### 4.6 Glossar `/glossar/…`
Kurze Definitionen (Redeanteil, Discovery Call, BANT, MEDDIC, SPIN, Einwandbehandlung). KI-Suchen ziehen Definitionen gern direkt. Je Begriff 150–300 Wörter, sauber verlinkt.

### Keyword-Cluster (Hypothesen, mit Daten prüfen)
Suchvolumen liegt mir nicht vor. Die Liste ist eine begründete Startannahme und wird mit Search-Console-Daten und einem Keyword-Tool (z. B. Sistrix, Ahrefs oder Google Keyword Planner) geprüft.
- Produkt: KI Sales Coach, Echtzeit Gesprächscoach, KI Verkaufstraining, Sales Copilot deutsch
- Alternativen: Cluely Alternative, Granola Alternative, Gong Alternative, Fireflies Alternative deutsch
- Problem: Einwandbehandlung Beispiele, Einwand zu teuer, Discovery Call Fragen, Redeanteil Verkaufsgespräch, Gesprächsleitfaden Vertrieb
- Plattform: Zoom KI Assistent, Teams Meeting KI Hilfe

## 5. GEO: in ChatGPT, Perplexity, Gemini und Claude genannt werden

1. **Faktenblöcke:** Jede Seite beginnt mit 2–3 Sätzen, die als vollständige Antwort zitierbar sind (Wer, Was, für wen, Preis, Stand-Datum).
2. **Konsistente Entität:** Überall derselbe Beschreibungssatz: „Loqui ist ein Gesprächscoach für den Mac, der Videocalls live mithört und im richtigen Moment Antworten, Fragen und Hinweise zeigt.“ Gleiche Schreibweise, gleicher Hersteller, gleiche Domain.
3. **Profile anlegen (Fremdquellen):** LinkedIn-Unternehmensseite, Product Hunt, OMR Reviews (wichtig im DACH-Raum), G2, Capterra, Crunchbase, später Wikidata. Jeder Eintrag verlinkt auf useloqui.de.
4. **Eigene Daten veröffentlichen:** Einmal im Quartal ein kurzer Report aus anonymisierten, freiwillig geteilten Nutzungsdaten, zum Beispiel „Wie viel reden Verkäufer in Discovery Calls wirklich?“. Eigene Zahlen werden am häufigsten zitiert. Nur mit Einwilligung der Nutzer und klarer Methodik.
5. **Erwähnungen verdienen:** Gastbeiträge und Podcasts im DACH-Sales-Umfeld, Antworten in Fach-Communities (LinkedIn, Reddit r/sales, Slack-Gruppen), immer hilfreich statt werblich.
6. **llms.txt pflegen** und um `llms-full.txt` mit allen Kernseiten ergänzen (automatisch beim Build).
7. **Messen:** Fester Fragenkatalog (siehe Abschnitt 8), monatlich in mehreren KI-Suchen geprüft: Wird Loqui genannt? Mit welcher Beschreibung? Welche Quelle wird zitiert?

## 6. TikTok

### Rolle
TikTok ist der Reichweiten-Kanal und selbst eine Suchmaschine. Videos werden über Untertitel, gesprochenen Text und Beschreibung gefunden. Jedes Video gehört zu einer Seite und umgekehrt.

### Formate
| Format | Inhalt | Verknüpfte Seite |
|---|---|---|
| Einwand der Woche | Kunde sagt „zu teuer“, Bildschirmaufnahme: Loqui zeigt die Antwort, Sprecher erklärt warum sie wirkt | /einwaende/zu-teuer |
| Rate my call | Echtes (eingewilligtes) oder nachgespieltes Gespräch, Loqui-Bericht danach, drei Verbesserungen | /ratgeber/… |
| Redeanteil-Challenge | „Ich habe 30 Minuten verkauft und 72 % geredet“ mit Ring-Anzeige | /ratgeber/redeanteil |
| Mythos vs. Realität | „Gute Verkäufer reden viel“ und warum nicht | /glossar/… |
| Founder-Log | Kurz und ehrlich: Was wir diese Woche gebaut haben | Startseite |

### Regeln
- Erste 1,5 Sekunden: der Satz des Kunden als großer Untertitel. Keine Logo-Intros.
- Echte App-Aufnahmen statt Grafiken. Loqui-Overlay ist das visuelle Markenzeichen.
- Suchbegriff im gesprochenen Text, im Untertitel und in der Beschreibung.
- Frequenz: 4–5 Videos pro Woche, 1 Founder-Log.
- Link in Bio mit UTM: `https://useloqui.de/?utm_source=tiktok&utm_medium=social`.
- Auf der Website keine eingebetteten TikTok-Player (Drittanbieter-Skripte, Datenschutz). Stattdessen Vorschaubild mit Link.

## 7. Messung und Ziele

| Kennzahl | Quelle | Ziel nach 90 Tagen (Annahme) |
|---|---|---|
| Indexierte Seiten | Search Console | 60+ |
| Impressionen / Klicks organisch | Search Console | 15.000 / 600 pro Monat |
| Nennungen in KI-Antworten | Fragenkatalog | in 5 von 20 Prompts |
| TikTok-Aufrufe | TikTok Analytics | 150.000 gesamt |
| Early-Access-Anmeldungen | Formular-Datenbank | 500 |
| Anteil Anmeldungen aus TikTok / Suche | UTM + Analytics | sichtbar getrennt |

Die Zielwerte sind Arbeitsannahmen ohne Vergleichsdaten und werden nach 30 Tagen anhand echter Zahlen angepasst.

## 8. Automatisierung mit Claude

Zwei Werkzeuge stehen zur Verfügung:
- **Geplante Aufgaben in der Claude-Desktop-App** (laufen auf dem Mac, wenn er an ist; gut für alles mit lokalen Dateien).
- **Cloud-Routinen über `/schedule`** (laufen in der Cloud nach Zeitplan, arbeiten direkt mit dem GitHub-Repo; gut für Pull Requests und Berichte, auch wenn der Mac aus ist).

Grundregel: Jede Routine liefert einen Entwurf, einen Pull Request oder einen Bericht. Nichts geht ohne Freigabe live.

| Routine | Rhythmus | Was Claude tut | Ergebnis |
|---|---|---|---|
| **Content-Entwürfe** | Mo 07:00 | Wählt nach Redaktionsplan zwei Themen (z. B. ein Einwand, ein Ratgeber), recherchiert, schreibt Markdown nach Vorlage, aktualisiert interne Links | Pull Request mit Vercel-Vorschau zur Freigabe |
| **TikTok-Skripte** | Mo 07:30 | Leitet aus den Seiten der Woche 5 Skripte ab: Hook, Ablauf, Bildschirmszenen, Untertitel, Beschreibung, Hashtags, Link | Datei `marketing/tiktok/JJJJ-KW.md` oder Notion-Seite |
| **Technik-Check** | täglich 06:00 | Ruft alle Seiten aus der Sitemap ab, prüft Status, Weiterleitungen, kaputte Links, Schema, canonical, Ladezeit (PageSpeed-API) | Kurzmeldung nur bei Fehlern |
| **SEO-Wochenbericht** | Fr 08:00 | Wertet Search-Console-Export aus: neue Suchbegriffe, Seiten auf Position 8–20 („fast oben“), sinkende Seiten | Bericht + konkrete Überarbeitungsvorschläge als Pull Request |
| **GEO-Monitor** | 1. des Monats | Stellt den Fragenkatalog an mehrere KI-Suchen (per API, wo verfügbar) und protokolliert Nennungen, Beschreibung, zitierte Quellen | Tabelle mit Verlauf + Empfehlungen |
| **Wettbewerbs-Wache** | Mi 08:00 | Prüft Preis- und Funktionsseiten von Cluely, Granola, Fireflies, Gong auf Änderungen | Pull Request für betroffene Vergleichsseiten |
| **Aktualität** | 1. des Quartals | Prüft Stand-Daten, Preise, Zahlen gegen `product.json`, markiert veraltete Aussagen | Pull Request |

Voraussetzungen für die Automatisierung:
1. Vercel ist mit GitHub verbunden (Vorschau je Pull Request).
2. Die Seite läuft auf Astro mit Markdown-Inhalten.
3. `docs/growth/redaktionsplan.md` enthält die Themenliste mit Status (offen, Entwurf, live).
4. Search-Console-Daten: wöchentlicher Export oder Zugriff über die Search-Console-API mit Dienstkonto.
5. Für den GEO-Monitor: API-Schlüssel der jeweiligen Dienste, die abgefragt werden sollen.

### Fragenkatalog GEO (Start)
1. Welche KI-Tools helfen live bei Verkaufsgesprächen?
2. Gibt es eine Alternative zu Cluely, die nicht heimlich arbeitet?
3. Bester Echtzeit-Coach für Zoom-Calls auf dem Mac?
4. Wie kann ich meinen Redeanteil im Verkaufsgespräch messen?
5. Granola Alternative mit Live-Hilfe?
6. KI Sales Coach auf Deutsch?
7. Was ist Loqui Gesprächscoach?
8. Wie antworte ich auf den Einwand „zu teuer“?
(bis 20 erweitern, Fragen nicht ändern, damit der Verlauf vergleichbar bleibt)

## 9. Fahrplan 12 Wochen

| Woche | Schwerpunkt | Ergebnis |
|---|---|---|
| 1–2 | Fundament | Vercel-Git-Verbindung, Astro mit identischem Design, Vorlagen, Analytics, Formular, Bing + IndexNow |
| 3–4 | Erste Inhalte | 5 Vergleichsseiten, 10 Einwand-Seiten, 4 Integrationsseiten, LinkedIn-, Product-Hunt-, OMR-Profile, TikTok-Konto mit ersten 8 Videos |
| 5–8 | Rhythmus | 2 neue Seiten pro Woche über die Content-Routine, 4–5 TikToks pro Woche, alle Routinen aktiv |
| 9–10 | Eigene Daten | Erster Report aus Nutzungsdaten (mit Einwilligung), Pressemeldung, Product-Hunt-Launch |
| 11–12 | Auswertung | Zahlen gegen Ziele, Themen mit Wirkung ausbauen, schwache Seiten überarbeiten oder zusammenlegen |

## 10. Risiken

- **Massen-Inhalte:** Zu viele ähnliche, KI-geschriebene Seiten können ganze Domains abwerten. Gegenmittel: echte Beispiele, eigene Screenshots, menschliche Freigabe, lieber 2 gute als 10 dünne Seiten pro Woche.
- **Namensdopplung „Loqui“:** Markensuche teilt sich die Ergebnisse mit einer Diktier-App. Gegenmittel: konsequent „Loqui Gesprächscoach“, Profile auf allen Plattformen, Schema mit Hersteller.
- **Datenschutz:** Keine Tracking-Cookies, keine eingebetteten Drittanbieter, Einwilligung für Nutzungsdaten-Reports, Datenschutzerklärung bei jedem neuen Dienst ergänzen.
- **TikTok-Glaubwürdigkeit:** Gespräche nur mit Einwilligung zeigen oder klar als nachgespielt kennzeichnen.
- **Abhängigkeit vom Produkt:** Echte Screenshots und Videos setzen eine stabile App voraus. Bis dahin Inhalte ohne Produktbild vorbereiten.
