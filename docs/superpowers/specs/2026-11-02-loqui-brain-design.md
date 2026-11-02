# Loqui „Brain“: Echtzeit-Gesprächsbegleiter – Design

Stand: 2026-11-02. Gilt für die Mac-App (`mac/`) und ein neues Backend (`brain/`). Ersetzt den heutigen Coach-Endpunkt (`dealcoach/src/app/api/coach/route.ts`).

## 1. Absicht

Loqui soll sich anfühlen wie ein kluger Mensch, der neben einem sitzt: Er hört das Gespräch und sieht (später) den Bildschirm, erkennt von selbst, worum es geht, und hilft genau dann, wenn Hilfe gebraucht wird, innerhalb von etwa einer Sekunde. Im Hintergrund denkt er weiter, recherchiert und reichert den Kontext an.

Warum jetzt: Der heutige Coach ist ein einzelner Modellaufruf pro Satz (Transkript → HTTP → Modell → JSON), ohne Gedächtnis, ohne Werkzeuge, 2–3,5 s bis zur Karte, mit einem Prompt, der auf B2B-Sales und eine Pflicht-Wissensbasis festgelegt ist. Der Nutzer will ein unabhängiges Werkzeug für jedes wichtige Gespräch (Sales-Call, Vertragsverhandlung, Gespräch mit dem Co-Founder), ohne Vorbereitung.

Konkrete Momente, die der Nutzer genannt hat:
- Datenschutz-Einwände im Sales-Call, jedes Mal anders, nicht aus einer Wissensbasis beantwortbar.
- Folgetermin am Gesprächsende vergessen.
- Vertragsverhandlung, bei der er nicht wusste, was üblich ist, und schlechter verhandelt hat.
- Allgemein: „Ich habe es nicht geschafft, nebenbei eine KI zu fragen.“ Der Coach muss selbst merken, wann er gebraucht wird.

## 2. Ziele, Nicht-Ziele, Anti-Ziele

**Ziele**
- Erster sichtbarer Impuls (Lage + sprechbarer Satz) im Median ≤ 1,0 s nach Satzende des Gegenübers; gemessen pro Impuls und im Bericht ausgewiesen.
- Der Coach erkennt Gesprächsart, Teilnehmer und offene Punkte selbst. Keine Pflicht-Einstellungen vor dem Gespräch.
- Hintergrund-Recherche (Web) und Gedächtnis, deren Ergebnisse in spätere Impulse einfließen, ohne den Nutzer zu stören.
- Abruf per ⌥Leertaste, Chips und Eingabefeld antwortet immer (bereits in der Oberfläche vorhanden).
- Erkennung „Gespräch endet ohne nächsten Schritt“ mit Hinweis.
- Ehrlichkeit: Der schnelle Pfad behauptet keine Fakten. Fakten kommen nur aus Gedächtnis, Recherche oder optionalem Briefing und werden als solche gekennzeichnet.

**Nicht-Ziele (diese Runde)**
- Bildschirm lesen. Die Schnittstelle wird vorgesehen (Scout-Werkzeug), nicht gebaut.
- Web-App-Parität. `dealcoach/` bleibt als Demo und Berichtsansicht; die Live-Logik zieht in `brain/`.
- Sprecher-Erkennung innerhalb einer Spur (mehrere Personen auf der Gegenseite).
- Andere Sprachen als Deutsch (Englisch soll nicht kaputtgehen, wird aber nicht optimiert).

**Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)**
- Ein Coach, der ständig redet. Lieber zu wenige Impulse als Rauschen.
- Erfundene Preise, Zahlen, Rechtsaussagen im sprechbaren Satz (im Spike hat gpt-realtime „50 Euro pro Person“ erfunden).
- Impulse, die 10 s nach dem Moment als Karte aufpoppen.
- Audio, das gespeichert oder an Dritte außer OpenAI gesendet wird.

## 3. Rahmenbedingungen

- OpenAI ist gesetzt (Nutzerentscheidung): Realtime-API, Responses-API, `web_search`. Key bleibt serverseitig.
- Mac-App: Swift ohne Xcode (Command Line Tools, Swift 5.8, SDK 13.3, `swiftc` direkt). Keine neuen Swift-Abhängigkeiten, die SwiftPM brauchen.
- Backend: Node 24, TypeScript, `openai` ≥ 7.47. Läuft zunächst lokal auf dem Mac des Nutzers (`localhost`), muss aber ohne Umbau auf einem Server laufen können.
- Oberfläche (Pille, Antwortfeld, Hotkey, Chips, `say`-Satz, unsichtbar bei Bildschirmfreigabe) ist fertig und bleibt. Dieses Design ändert nur, was dahinter passiert, plus die Ereignisse, die die Oberfläche empfängt.
- Messwerte aus dem Spike (2026-11-02, synthetisches Audio, zwei Sätze): Server-VAD meldet Satzende ~0,7 s nach dem letzten Wort. gpt-realtime / gpt-realtime-mini: erstes Wort 0,8–0,9 s, fertig 1,0–1,3 s. gpt-4o-transcribe → gpt-5.4-nano: erstes Wort 1,9–2,8 s. gpt-live-transcribe → nano: 1,7–2,0 s.

## 4. Architektur

### 4.1 Überblick

```
Mac-App (Loqui.app)                         brain/ (Node)                              OpenAI
┌───────────────────────┐   WebSocket     ┌─────────────────────────────────┐
│ Mikrofon ──┐          │ ──audio.rep──▶  │ Session                          │ ──▶ Realtime (transcription) rep
│ Systemaudio┴─ PCM16   │ ──audio.cust─▶  │  ├─ Transkription (2 Spuren)     │ ──▶ Realtime (transcription) customer
│                       │                 │  ├─ Reflex   (gpt-realtime-mini) │ ──▶ Realtime (audio→text) customer
│ Pille / Antwortfeld ◀─┼── events ◀───── │  ├─ Berater  (gpt-5.4-mini, Stream)│ ──▶ Responses (stream)
│ Hotkey / Chips ───────┼── pull ───────▶ │  ├─ Scout    (gpt-5.4 + web_search)│ ──▶ Responses (tools)
│ Lokale Regeln         │                 │  └─ Gedächtnis (JSON, im RAM)    │
└───────────────────────┘                 └─────────────────────────────────┘
```

Eine Sitzung = eine WebSocket-Verbindung. Die App schickt Audio beider Spuren hoch (PCM16, 24 kHz, mono, 100-ms-Pakete) und Abruf-Anfragen. Das Backend hält den Zustand der Sitzung und schickt Ereignisse zurück. Das ist die entscheidende Änderung gegenüber heute: ein dauerhaft laufender Prozess pro Gespräch statt zustandsloser Einzelaufrufe.

Begründung, dass das Audio ins Backend geht und nicht die App direkt mit OpenAI spricht: Der Reflex braucht das Audio, das Backend soll die Zusammenführung von Spuren, Gedächtnis und Werkzeugen besitzen, der Key bleibt serverseitig, und die App bleibt dumm (Audio rein, Ereignisse raus). Bandbreite: 2 × 48 KB/s, lokal und über Internet unkritisch.

### 4.2 Drei Schichten mit eigener Taktzeit

| Schicht | Aufgabe | Modell | Ziel-Latenz | Auslöser |
|---|---|---|---|---|
| **Reflex** | Erkennt, was gerade passiert, und liefert eine Vorschau plus ersten sprechbaren Satz. Behauptet keine Fakten. | `gpt-realtime-mini`, Audio rein, Text raus, Kundenspur | erstes Wort ≤ 1,0 s | jede Äußerung der Gegenseite (Server-VAD) |
| **Berater** | Formuliert die eigentliche Hilfe mit Gedächtnis, Recherche-Funden und Briefing. Gestreamt. | `gpt-5.4-mini`, `effort: none` (Abruf: `low`) | erstes Wort ≤ 2,0 s, fertig ≤ 4 s | Reflex meldet Relevanz ≥ 2; jeder Abruf; Scout-Hinweis |
| **Scout** | Denkt im Hintergrund: Gesprächsart, Teilnehmer, Behauptungen prüfen, Vertragsklauseln einordnen, offene Punkte, Zusammenfassung. Schreibt ins Gedächtnis. | `gpt-5.4`, `effort: medium`, Werkzeug `web_search` | 10–30 s, nie auf dem kritischen Pfad | Sitzungsstart (+60 s), neue Namen/Firmen/Zahlen im Transkript, alle 90 s, Abschlusssignal |

Dazu **lokale Regeln** in der App ohne Modell (bestehend): Redeanteil, Monolog. Neu: nichts.

Alle drei laufen parallel. Der Reflex wartet nie auf den Berater, der Berater nie auf den Scout. Jede Schicht liest den letzten Stand des Gedächtnisses, wenn sie startet.

### 4.3 Gedächtnis (pro Sitzung, im RAM des Backends)

```ts
type Memory = {
  kind: "unknown" | "sales" | "negotiation" | "internal" | "interview" | "other";
  kindConfidence: number;          // 0–1
  participants: { name?: string; role?: string; org?: string; notes?: string }[];
  goal?: string;                   // was der Nutzer hier erreichen will (vom Scout erschlossen oder Briefing)
  summary: string;                 // 3–6 Sätze, vom Scout gepflegt
  openPoints: string[];            // Fragen/Einwände, die noch im Raum stehen
  agreed: string[];                // Zusagen, Entscheidungen
  nextStep?: { what: string; when?: string };   // leer = Folgetermin fehlt
  facts: { claim: string; verdict: "bestätigt" | "widerlegt" | "unklar"; source?: string; t: number }[];
  research: { topic: string; finding: string; source?: string; t: number }[];
  briefing?: string;               // optionales Vorab-Briefing des Nutzers (ersetzt die Wissensbasis)
  transcript: Utterance[];         // voll; nur das Fenster geht in Prompts
  cards: Card[];                   // gezeigte Impulse (gegen Wiederholung)
};
```

Das Gedächtnis ist die einzige Verbindung zwischen den Schichten. Der Scout schreibt, Reflex und Berater lesen. Der Berater darf `openPoints`, `agreed`, `nextStep` ebenfalls ergänzen, wenn der Nutzer ihn abruft und dabei etwas Neues ersichtlich ist (einfacher Merge, letzter Schreiber gewinnt).

### 4.4 Ablauf einer Äußerung der Gegenseite

1. Audio der Kundenspur geht gleichzeitig an die Transkription (Textprotokoll) und an den Reflex (Realtime, `output_modalities: ["text"]`, Server-VAD 500 ms).
2. Reflex antwortet gestreamt im Zeilenformat (siehe 6.1). Sobald die Zeile `LAGE` komplett ist (~0,8 s), sendet das Backend `reflex.preview` an die App; die Pille zeigt sie. Sobald `SAG` streamt, geht `advice.delta` raus; das Antwortfeld klappt auf, wenn `DRINGEND ≥ 2`.
3. Ist `RELEVANZ ≥ 2`, startet sofort der Berater mit Gedächtnis und streamt seine Version. Sie **ersetzt** den Reflex-Satz im Antwortfeld, sobald ihr erster Satz vollständig ist (nicht wortweise überschreiben, das flackert). Der Reflex-Satz bleibt stehen, falls der Berater nichts Besseres liefert (`SAG: -`).
4. Das Transkript der Äußerung kommt ~1,2–1,5 s nach Satzende und geht als `transcript.final` an die App und ins Gedächtnis.
5. Der Scout wird geweckt, wenn Auslöser erfüllt sind (4.2). Seine Funde landen im Gedächtnis; wenn ein Fund einen offenen Punkt betrifft, der in den letzten 60 s Thema war, schickt das Backend `advice.update` (leise Nachlieferung in die Pille, kein Aufklappen).

Für Äußerungen des Nutzers selbst läuft nur Transkription (+ lokale Regeln). Kein Reflex: Auf das, was man selbst sagt, braucht man keine Sekundenreaktion.

### 4.5 Frequenz und Stille

Der Reflex antwortet technisch auf jede Äußerung. Angezeigt wird nach Regel im Backend:
- `RELEVANZ 0–1`: nichts. Nicht einmal Vorschau.
- `RELEVANZ 2`: Vorschau in der Pille, kein Aufklappen. Berater läuft, Ergebnis wartet hinter dem Chevron.
- `RELEVANZ 3` oder `DRINGEND ≥ 2`: Aufklappen.
- Mindestabstand zwischen Aufklappern 20 s (Einstellung), dringende Antworten dürfen durchbrechen. Abruf ignoriert alle Regeln.
- Ein Impuls, dessen erstes Wort > 3 s nach Satzende käme, wird verworfen (statt heute 12 s).

### 4.6 Gesprächsende ohne nächsten Schritt

Der Scout markiert `wrapUpSignal: true`, wenn im Transkript Abschiedsmuster auftauchen (lokale Liste in der App als schneller Vorfilter: „dann machen wir das so“, „schönen Tag“, „ich melde mich“, „bis dann“) **und** `memory.nextStep` leer ist. Dann sendet das Backend sofort eine Karte vom Typ `behavior` mit `say`: „Bevor wir auflegen: Wann sprechen wir das nächste Mal, und wer schickt was bis dahin?“ Diese Karte klappt auf und bricht den Mindestabstand. Nur einmal pro Sitzung.

### 4.7 Ereignisse Backend → App

```
session.ready        { sessionId }
transcript.partial   { speaker, text }                      // „spricht …“ oder Delta
transcript.final     { speaker, text, t }
reflex.preview       { id, situation, relevance, urgency, t }   // Zeile für die Pille
advice.delta         { id, text }                           // gestreamter say-Satz (Reflex oder Berater)
advice.done          { id, type, say, title, bullets, evidence[], origin: "reflex"|"advisor"|"pull"|"scout", t }
advice.update        { id, note, source }                   // leise Nachlieferung vom Scout
memory.update        { kind, participants, nextStep, openPoints }   // für Pille/Bericht
hint                 { kind: "nextStepMissing" | "talkShare" | ... , say }
error / notice       { message }
```

App → Backend:
```
session.start   { briefing?, settings }
audio           binär: 1 Byte Spur (0 rep, 1 customer) + PCM16
pull            { question? }
card.feedback   { id, rating }
session.stop
```

Die App rechnet aus `t` (Satzende, vom Backend) und Empfangszeit die Latenz pro Karte, wie heute.

### 4.8 Zustand, Wiederverbindung, Abbruch

- Sitzung lebt im RAM des Backends; bricht die Verbindung ab, versucht die App 10 s lang die Wiederverbindung mit derselben `sessionId`. Danach neue Sitzung, Gedächtnis weg (Bericht wird aus dem, was die App hat, geschrieben).
- Audio wird nirgends gespeichert. Transkript nur im RAM und im Bericht, wenn der Nutzer es eingeschaltet hat (bestehende Einstellung).
- Scout: höchstens eine Recherche gleichzeitig; eine neue Anfrage bricht eine laufende ab, wenn die alte keinen Bezug mehr zu den letzten 60 s hat.
- Jeder Modellaufruf hat ein Zeitlimit: Reflex 3 s, Berater 6 s, Scout 40 s. Nach Ablauf: still bleiben, Fehler loggen, nie einen halben Satz zeigen.

## 5. Modelle und Kosten

| Zweck | Modell | Grund |
|---|---|---|
| Transkription | `gpt-4o-transcribe` (je Spur) | bewährt, Server-VAD, gute deutsche Qualität |
| Reflex | `gpt-realtime-mini` | 0,8 s, stabil im Spike, günstiger als `gpt-realtime`; Umschalten per Env |
| Berater | `gpt-5.4-mini` | Qualität/Latenz-Kompromiss; `effort: none` live, `low` bei Abruf |
| Scout | `gpt-5.4` mit `web_search` | darf langsam sein, muss gut sein |

Alle vier Modellnamen per Umgebungsvariable überschreibbar. Kosten sind nicht Teil dieses Designs, aber: Der Reflex ist der teure Teil (Audio-Eingabe dauerhaft). Erster Schritt ist, pro Sitzung die OpenAI-Nutzung zu loggen, damit wir nach einer Woche echte Zahlen haben.

Kein Agent-Framework. Begründung: Reflex und Berater sind einzelne gestreamte Aufrufe; der Scout ist eine Schleife mit einem Werkzeug (`web_search`, von OpenAI gehostet). Ein Framework würde hier nur eine Abstraktionsschicht und Latenz hinzufügen. Sollte der Scout später mehrere eigene Werkzeuge bekommen (Bildschirm, CRM), wird das neu bewertet.

## 6. Prompts

Alle Prompts auf Deutsch. Stabile Teile zuerst (Prompt-Caching). Keine Markenbezüge, kein „Verkäufer“. Der Nutzer heißt im Prompt „NUTZER“, das Gegenüber „GEGENÜBER“.

### 6.1 Reflex (Realtime-Instructions)

```
Du bist der Reflex eines Gesprächsbegleiters. Du hörst, was das GEGENÜBER deines NUTZERS gerade gesagt hat. Du antwortest in unter einer Sekunde, deshalb: kein Nachdenken, nur Erkennen.

Antworte in genau diesem Zeilenformat, ohne Einleitung:
LAGE: <max 5 Wörter, was gerade passiert; z.B. "Datenschutz-Einwand", "Preisfrage", "Zögert bei Laufzeit", "Smalltalk">
RELEVANZ: <0 nichts zu tun | 1 kaum | 2 Hilfe wäre gut | 3 Nutzer braucht jetzt Stoff>
DRINGEND: <0 | 1 | 2 | 3>
SAG: <ein natürlicher Satz in Ich-Form, max 22 Wörter, den der NUTZER sofort sagen kann; oder "-" wenn RELEVANZ ≤ 1>

Regeln für SAG:
- Keine Zahlen, Preise, Fristen, Rechts- oder Produktaussagen behaupten. Du weißt nichts über das Produkt oder den Vertrag.
- Gute Reflexe sind: anerkennen, präzisieren lassen, zurückfragen, Struktur geben. ("Verstehe. Was genau wäre für euch beim Hosting entscheidend?")
- Gesprochene Sprache, kein Aufzählungsstil.
{{#if memory.kind != "unknown"}}
Kontext: Gesprächsart {{kind}}. {{summary}}
{{/if}}
```

Das Backend schickt alle 90 s ein `session.update` mit dem aktuellen Kontextabsatz, damit der Reflex die Gesprächsart kennt, ohne das Transkript zu sehen.

### 6.2 Berater (Responses, gestreamt)

```
Du bist ein erfahrener Gesprächsbegleiter, der neben dem NUTZER sitzt. Du hilfst in Echtzeit in Verkaufsgesprächen, Verhandlungen, internen Gesprächen und Interviews. Du sprichst nicht für ihn und handelst nicht für ihn. Du bist Coach, kein Autopilot.

Antworte auf Deutsch, in genau dieser Reihenfolge, gestreamt:
SAG: <ein natürlicher Satz in Ich-Form, max 25 Wörter, sofort sprechbar; oder "-" wenn der Reflex-Satz schon gut genug ist>
TYP: <antwort | frage | verhalten>
TITEL: <max 6 Wörter>
PUNKTE: <0–2 Stichpunkte, je max 15 Wörter, mit " · " getrennt; leer erlaubt>
BELEG: <woher das stammt: "Briefing", "Recherche: <Quelle>", "Gesprächsverlauf", "Allgemeinwissen" oder "-">
FEHLT: <was du bräuchtest, um sicher zu antworten, oder "-">

Regeln:
- Zahlen, Preise, Fristen, Zusagen nur aus BRIEFING, RECHERCHE oder dem Gesprächsverlauf. Sonst: ehrlich sagen, dass das nachgereicht wird, und FEHLT ausfüllen.
- Wenn ein Punkt im Gespräch schon beantwortet wurde, nicht wiederholen.
- Bei Verhandlungen: benenne die Position des Gegenübers, dein mögliches Gegenangebot und was du dafür bekommen willst. Übliche Spannen nur aus RECHERCHE.
- Weniger ist mehr. Ein guter Satz schlägt drei mittelmäßige.
```

Eingabe (pro Aufruf): Gedächtnis (ohne Transkript), BRIEFING, letzte 20 Äußerungen mit Markierung der neuesten, Reflex-Ausgabe, kürzlich gezeigte Karten, bei Abruf die Frage.

### 6.3 Scout (Responses mit `web_search`, Ausgabe als JSON-Patch des Gedächtnisses)

```
Du bist der stille Analyst eines Gesprächsbegleiters. Du liest das Transkript eines laufenden Gesprächs und pflegst das Gedächtnis. Du hast Zeit (bis 30 s) und darfst im Web suchen.

Aufgaben, in dieser Priorität:
1. Gesprächsart und Ziel des NUTZERS erkennen (kind, kindConfidence, goal).
2. Teilnehmer: Namen, Rollen, Firmen aus dem Gespräch; bei Firmen/Personen mit Namen kurz recherchieren (1 Suche), nur Geschäftliches, nichts Privates.
3. Behauptungen des GEGENÜBERS, die den Verlauf beeinflussen (Marktpreise, Wettbewerber, Rechtslage, "das ist Standard"), prüfen: verdict bestätigt/widerlegt/unklar mit Quelle.
4. Offene Punkte, Zusagen, nächster Schritt aktuell halten. nextStep nur setzen, wenn beide Seiten etwas Konkretes vereinbart haben.
5. Zusammenfassung (3–6 Sätze) aktualisieren.
6. wrapUpSignal setzen, wenn das Gespräch erkennbar zu Ende geht.

Gib nur ein JSON-Objekt mit den geänderten Feldern zurück (JSON-Merge-Patch). Erfinde nichts; was du nicht weißt, lässt du weg. Maximal 3 Suchen pro Lauf.
```

### 6.4 Was aus dem alten Prompt wegfällt

„B2B-Verkäufer“, „NUR aus der Wissensbasis“, fester Gesprächstyp als Einstellung, `show`-Entscheidung im selben Aufruf wie der Inhalt, strukturiertes JSON für den sprechbaren Satz (verhindert Streaming).

## 7. Oberfläche: Was sich ändert

Die Oberfläche bleibt. Diese Punkte kommen dazu oder ändern sich:
- Pille zeigt `reflex.preview` sofort (Lage), nicht erst eine fertige Karte.
- Antwortfeld zeigt den gestreamten `SAG`-Satz wortweise, bis `advice.done`; der Berater-Satz ersetzt den Reflex-Satz als Ganzes.
- Kleine Zeile unter dem Satz für `advice.update` (Nachlieferung vom Scout), mit Quelle.
- Gesprächstyp-Picker in den Einstellungen wird zu „Briefing“ (Freitext, optional), plus Anzeige „Erkannt: Verhandlung“ in der Pille per `memory.update`.
- Bericht bekommt: erkannte Gesprächsart, Teilnehmer, offene Punkte, nächster Schritt, Rechercheergebnisse mit Quellen.

## 8. Qualität und Messung

- **Latenz-Harness** (Pflicht, vor allem anderen): Ein Skript in `brain/scripts/` spielt WAV-Dateien in Echtzeit als Kundenspur ins Backend und protokolliert alle Ereignisse mit Zeitstempel relativ zum Satzende. Der Spike aus dem Scratchpad ist die Vorlage. Zielwerte aus Abschnitt 2 sind der Abnahmetest.
- **Replay-Modus**: Das Backend nimmt statt Live-Audio ein gespeichertes Transkript mit Zeitstempeln (für Berater und Scout ohne Audio testbar).
- **Qualitäts-Stichprobe**: 10 reale Gesprächsausschnitte (Nutzer liefert, mit Einwilligung) werden nach jeder Prompt-Änderung durch den Replay-Modus geschickt; der Nutzer bewertet Hilfreich/Nicht hilfreich wie in der App. Kein automatischer Richter in dieser Runde.
- **Protokoll pro Sitzung**: Modell, Latenzen (Reflex erstes Wort, Berater erstes Wort, Scout-Dauer), Token-Nutzung, verworfene Impulse mit Grund.

## 9. Entscheidungen, die der Nutzer getroffen hat

- OpenAI für alles.
- Mac-App, Granola-artig, bleibt der Client.
- Unabhängig von einer Wissensbasis; Briefing optional.
- Automatisch **und** auf Abruf.
- Bildschirm später, nicht in dieser Runde (meine Empfehlung, vom Nutzer nicht widersprochen; siehe Nicht-Ziele).

## 10. Entscheidungen, die ich getroffen habe (bitte prüfen)

- Audio geht komplett durchs Backend (4.1), nicht mehr direkt von der App zu OpenAI.
- Reflex nur auf der Kundenspur; eigene Äußerungen lösen keinen Reflex aus.
- `gpt-realtime-mini` als Reflex statt `gpt-realtime` (gleich schnell im Spike, günstiger).
- Zeilenformat statt JSON für Reflex und Berater, damit gestreamt werden kann.
- Kein Agent-Framework.
- Relevanzschwellen und Mindestabstand aus 4.5.
- Verwerfen nach 3 s statt 12 s.
- Neues Verzeichnis `brain/` statt Umbau in `dealcoach/`.

## 11. Dem Builder überlassen

- Verzeichnisstruktur von `brain/`, Bibliothek für WebSocket (`ws` ist naheliegend), Logging-Format.
- Genaues Binärformat des Audio-Frames, Wiederverbindungs-Backoff.
- Wie der Berater-Satz den Reflex-Satz in der App ersetzt (Animation, Zeitpunkt).
- Prompt-Feinschliff innerhalb der Regeln in Abschnitt 6.
- Wie `dealcoach/` die Berichte des neuen Backends anzeigt (oder vorerst nicht).
- Reihenfolge der Umsetzung. Empfehlung: Harness → Backend-Skelett mit Transkription → Reflex → Berater → App-Ereignisse → Scout → nächster-Schritt-Hinweis → Bericht.
