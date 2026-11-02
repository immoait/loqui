# Dealcoach – Echtzeit-KI-Coach für B2B-Sales (MVP)

Ein Coach, der live zuhört und im passenden Moment einen kurzen Impuls zeigt: einen Antwortvorschlag, eine nächste Frage oder einen Hinweis zum Gesprächsverhalten.

## Starten

```bash
cp .env.example .env.local   # ANTHROPIC_API_KEY eintragen
npm install
npm run dev                  # http://localhost:3000
```

Ohne Mikrofon zum Testen: **Übungsgespräch abspielen** (ein gescriptetes Discovery-Gespräch, entspricht dem Wizard-of-Oz-Test aus dem Plan).

## Gewählte MVP-Defaults (Plan, Abschnitt 10)

| Entscheidung | Default im MVP |
|---|---|
| Erster Call-Typ | Discovery (umschaltbar: Demo, Einwandbehandlung) |
| Plattform / Erfassung | Web-App im Browser, Mikrofon über die Web Speech API (Chrome/Edge). Sprecher per Klick/Leertaste, Kundensätze optional manuell |
| Datenmodus | Audio wird nur verarbeitet, nie gespeichert. Transkript-Speicherung ist opt-in. Alles liegt lokal im Browser |

## Aufbau

- `src/app/api/coach/route.ts`: Coach-Entscheidung pro Äußerung über die Claude API (Structured Output: zeigen ja/nein, Typ, Stichpunkte, Quellen-IDs, Sicherheit, Dringlichkeit). Regeln + Wissensbasis bilden den gecachten Präfix.
- `src/lib/useCoachSession.ts`: Sitzung, Spracherkennung, Relevanzfilter (Mindest-Sicherheit, Mindestabstand, veraltete Impulse verwerfen) und Latenzmessung. Redeanteil- und Monolog-Hinweise werden lokal berechnet (schnell, ohne API-Call).
- `src/components/`: Live-Ansicht, Wissensbasis, Einstellungen, Nachberichte.

## Konfiguration

- `COACH_MODEL` (Default `claude-opus-5-5`): für geringere Latenz z. B. `claude-haiku-5-5` testen.
- `COACH_EFFORT` (Default `low`).

## Bekannte Grenzen

- Die Web Speech API trennt keine Sprecher und schickt das Audio in Chrome an Google. Für echte Calls (Zoom/Teams) braucht es als Nächstes eine Erfassung von Tab- und Systemaudio plus Streaming-STT mit Diarisierung.
- Kein CRM, keine Websuche, kein Versand von Nachrichten (bewusst, siehe Plan).
