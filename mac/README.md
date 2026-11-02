# Dealcoach für macOS

Ein schwebendes Panel neben Zoom, Meet, Teams oder Slack. Es hört zwei Spuren:

- **Ich**: Mikrofon (AVAudioEngine)
- **Kunde**: Systemaudio der Meeting-App (ScreenCaptureKit, nur Ton)

Jede Spur wird auf dem Mac transkribiert (`SFSpeechRecognizer`, on-device für Deutsch). Abgeschlossene Äußerungen gehen an das zentrale Coach-Backend (`../dealcoach`, `POST /api/coach`), das mit Claude entscheidet, ob eine Karte erscheint.

## Bauen und starten

```bash
./scripts/build-app.sh
open build/Dealcoach.app
```

Das Backend muss laufen (`npm run dev` in `../dealcoach`, mit `ANTHROPIC_API_KEY` in `.env.local`).

Beim ersten Start fragt macOS nach **Mikrofon**, **Spracherkennung** und **Bildschirm- & Systemaudioaufnahme**. Nach der letzten Freigabe muss die App einmal neu gestartet werden. Weil die App ad hoc signiert ist, kann macOS nach jedem Neubau erneut fragen.

## Grenzen dieses Prototyps

- Gebaut mit den vorhandenen Command Line Tools (Swift 5.8, macOS-13-SDK). Mit aktuellem Xcode lassen sich zwei Upgrades nachziehen: Core Audio Taps (nur Systemaudio-Freigabe statt Bildschirmaufnahme, Ton nur aus der Meeting-App) und SpeechAnalyzer (bessere, schnellere On-Device-Transkription).
- Systemaudio ist der gesamte Mac-Ton, nicht nur die Meeting-App. Benachrichtigungstöne oder Musik werden mit transkribiert.
- Ohne Kopfhörer hört das Mikrofon die Gegenseite mit. Doppelte Sätze werden per Wortabgleich verworfen, aber nicht perfekt.
- Bei mehreren Personen auf Kundenseite gibt es keine Sprechertrennung innerhalb der Spur.
- Berichte liegen als JSON unter `~/Library/Application Support/Dealcoach/reports`. Noch keine Synchronisierung mit dem Backend.
