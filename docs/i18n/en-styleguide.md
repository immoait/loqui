# Loqui English voice and style guide

For useloqui.de/en/. We transcreate from German, not translate. Audience: B2B salespeople first, then founders and managers whose calls decide deals.

## 1. Voice rules

**1. Say "call", not "conversation".** US sellers have calls and demos.
- DE: Ehrliches Feedback nach jedem Gespräch.
- EN: Honest feedback after every call.

**2. Use the seller's own words.** If a standard sales term exists, use it over the literal one.
- DE: Die eine Frage, die fehlt.
- EN: The question you forgot to ask.

**3. Rebuild the rhythm.** Keep the short beat, but write English fragments.
- DE: Die Antwort, bevor die Pause zu lang wird.
- EN: The answer, before the silence gets awkward.

**4. Plain verbs, active voice, contractions.**
- DE: Was dort fehlt, erfindet Loqui nicht.
- EN: If it's not in your docs, Loqui won't make it up.

**5. Keep facts exact, especially privacy.** Shorten, never soften.
- DE: Für Transkription und Vorschläge wird der Ton verschlüsselt an OpenAI geschickt. Loqui selbst speichert keine Aufnahmen. Berichte bleiben auf deinem Mac.
- EN: Loqui sends audio to OpenAI, encrypted, for transcription and suggestions. Loqui doesn't store recordings. Reports stay on your Mac.

**6. Warm, not chummy.** No "Hey there", no "folks", no exclamation marks.
- DE: Wie werde ich Loqui wieder los?
- EN: How do I uninstall Loqui? (not "Want to break up with Loqui?")

**7. Rewrite sample dialogue so it sounds like a US account exec.** Localize currency and paperwork, invent no claims.
- DE: „Ehrlich gesagt ist uns das zu teuer.“ / „49 € pro Nutzer, und die doppelte Pflege in Excel fällt weg.“
- EN: “Honestly, that's more than we budgeted.” / “It's $49 a seat, and you stop maintaining everything twice in Excel.”

## 2. Terminology

| German | English | Note |
|---|---|---|
| Gesprächscoach | AI sales coach on SEO surfaces (titles, meta, entity), call coach in body copy | Avoid "conversation coach". |
| Redeanteil | talk ratio | On first mention in the glossary, also give "talk-to-listen ratio". The UI shows "58% you". |
| Einwand / Einwandbehandlung | objection / objection handling | "Preis-Einwand" becomes "Pricing objection". |
| Bedarfsanalyse | discovery / discovery call | Never "needs analysis". |
| Wissensbasis | knowledge base | In marketing copy, prefer "your docs" or "your own documents". Keep "knowledge base" for UI, plans, and FAQ. |
| Vorschlag | suggestion | In headlines, name the specific thing: answer, question, or nudge. |
| Hinweis (Redeanteil) | nudge | Not "hint" and not "alert". |
| Feedback nach dem Gespräch | post-call feedback | In headlines, write "Feedback after every call". |
| Zeitmarken | timestamps | |
| Systemaudio | system audio | |
| „Nur Systemaudioaufnahme“ | **System Audio Recording Only** | Path: System Settings > Privacy & Security > Screen & System Audio Recording. I'm fairly confident this matches macOS 15, but check it on a US-English Mac before launch. |
| Programme-Ordner / Papierkorb | Applications folder / Trash | |
| Kurz gesagt | In short | Label on the GEO summary card. |
| Zuletzt geprüft am | Last reviewed | Write "Last reviewed November 2, 2026, by Loqui Editorial". Don't use a "·" separator. |
| Loqui Redaktion | Loqui Editorial | Byline: "By Loqui Editorial". No personal names. |
| Vergleiche | Comparisons, at `/en/compare/` | Example: `/en/compare/loqui-vs-cluely` |
| Einwände | Objections, at `/en/objections/` | Example: `zu-teuer` becomes `/en/objections/too-expensive` |
| Ratgeber | Guides, at `/en/guides/` | Example: `/en/guides/talk-ratio-in-sales-calls` |
| Glossar | Glossary, at `/en/glossary/` | Example: `/en/glossary/talk-ratio` |
| Integrationen | Integrations, at `/en/integrations/` | Example: `/en/integrations/zoom` |
| Kostenlos für Mac laden | Download free for Mac | Primary CTA. |
| Laden und in der App upgraden | Download, then upgrade in the app | Pro plan button. |
| Early Access | Early access | Status text only, never a badge in caps. Write "The first version is almost ready. The download will appear here soon." |
| 5 Gespräche im Monat | 5 calls a month | |

Slugs are English, lowercase, and hyphenated. Don't put dates in slugs.

## 3. Headlines

**Hero: "Immer die richtige Antwort."**

| Candidate | Rationale |
|---|---|
| Always the right answer. | Literal and clean, but reads like a slogan and overpromises a little. |
| Always know what to say. | Natural US idiom for the moment sellers fear most. The promise is about the reader. |
| The right answer, right when you need it. | Clear, but longer and softer. |
| Never stuck for an answer. | Warm, but frames the reader around the problem. |
| Know what to say next. | Covers the next question, weaker on answers from your docs. |

**Recommendation: "Always know what to say."** Subline: "The call coach that listens live and helps you at the right moment." The proof (answers from your docs, with the source) belongs in the hero mock and the first section, not in the headline.

**Closing: "Dein bestes Gespräch kommt noch."**
- Your best call is still ahead. **(Recommended.)** It's quiet, confident, and keeps the coaching idea.
- Your best call is yet to come. Slightly greeting-card.
- Your best call hasn't happened yet. Punchier, but a touch negative.

**Section: "Läuft still im Hintergrund." / "Du merkst Loqui nur, wenn es dir hilft."**
- Quiet until it helps. **(Recommended.)** It merges the headline and the subline and leads with the benefit, not with being hidden.
- Stays out of your way. / You'll only notice Loqui when it helps.
- Works quietly in the background. / You'll only notice Loqui when it helps.

## 4. US conventions

- **Dates:** November 2, 2026. Use "Nov 2, 2026" only in tight UI. Keep ISO dates in `datetime` attributes. Time: 2:32 PM. Mock header: "Mon 2:32 PM".
- **Currency:** $19/month on price cards, "$19 a month" in prose. Use $0 on the card and "Free" in CTAs. Write competitor prices exactly, e.g. $149.99/month. Never write € on /en/.
- **Numbers:** decimal point and thousands comma ("2.5 seconds", "1,000"). No space before % ("58%"). Use numerals in UI and plans. In prose, spell out one through nine unless there's a unit.
- **Quotes:** curly double quotes “ ” and the apostrophe ’. Periods and commas go inside the quotes. Never use „ “ or « ».
- **Spelling:** US spelling (analyze, color, canceled, behavior). Use the serial comma: "Zoom, Google Meet, Teams, and Slack".
- **Headlines:** sentence case. Statements end with a period, as on the German site.
- **macOS:** "macOS 14.4 or later", "System Settings", "Option-Space" (not ⌥␣ in running text).

## 5. "Sounds translated" checklist

Read each page aloud: would a US account exec say this? Then check:

- [ ] "Conversation" or "meeting" where a US seller would say "call".
- [ ] Noun stacks or passive voice carried over from German ("the transcription of audio is performed").
- [ ] Literal idioms ("apples with pears" should be "apples to oranges").
- [ ] False friends: actual/aktuell, eventually/eventuell, consequent/konsequent, become/bekommen.
- [ ] German formats: €, decimal comma, "19 € im Monat", „quotes“, dates like 2.11.2026, a space before %.
- [ ] Title Case headlines, ALL-CAPS eyebrows, "→" after links, "A · B · C" meta lines.
- [ ] Hype words: revolutionary, supercharge, unlock, game-changer, seamless.
- [ ] Positioning on being "not hidden" or "ethical" instead of on the benefit. Attacks on competitors.
- [ ] Invented numbers, testimonials, or awards. Founder names.
- [ ] Privacy wording that differs from the approved statement in §1, rule 5.
