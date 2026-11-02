# Loqui

Gesprächscoach für den Mac: hört Videocalls live mit und zeigt im richtigen Moment Antworten, Fragen und Hinweise.

## Aufbau

| Ordner | Inhalt | Läuft auf | Branch / Arbeitsordner |
|---|---|---|---|
| `site/` | Website useloqui.de (Astro) | Vercel, Deploy bei Merge auf `main` | `astro-foundation` · `~/Developer/loqui-site` |
| `brain/` | Echtzeit-Backend (Node, WebSocket): Transkription, Coach, Sitzungsgedächtnis | lokal, später eigener Server | `feat/loqui-brain` · `~/Developer/loqui-brain` |
| `mac/` | Mac-App zum Download (Swift): Audio, Overlay, Bericht | Mac des Nutzers | `feat/loqui-brain` · `~/Developer/loqui-brain` |
| `dealcoach/` | Erster Web-Prototyp mit Coach-API (Next.js). Wird durch `brain/` abgelöst und später zur Online-Version `web/` | lokal | eingefroren |
| `docs/` | Pläne und Specs (`growth/` = Marketing, `superpowers/` = Produkt) | – | je nach Thema |

## Regeln für paralleles Arbeiten

- **Jede Sitzung arbeitet in ihrem eigenen Arbeitsordner** (Git-Worktree) und nur in ihren Ordnern. Website: `site/`, `docs/growth/`. Backend: `brain/`, `mac/`, `docs/superpowers/`.
- **Nie im Hauptordner `~/Developer/loqui` Branches wechseln.** Der Hauptordner bleibt auf `main`.
- **Gemeinsame Dateien** an der Wurzel (`.gitignore`, diese README) nur in kleinen, eigenen Commits ändern.
- **Nichts in iCloud.** Repo und Arbeitsordner liegen unter `~/Developer`, nicht unter `~/Documents` oder `~/Desktop`.
- **Geheimnisse** (API-Schlüssel) nur in `.env` / `.env.local`, nie committen. Vorlagen heißen `.env.example`.
- Änderungen gehen per Pull Request auf `main`. `main` deployt die Website automatisch.

## Neue Arbeitsordner anlegen

```bash
cd ~/Developer/loqui
git fetch
git worktree add ../loqui-<thema> -b <branch> origin/main
```
