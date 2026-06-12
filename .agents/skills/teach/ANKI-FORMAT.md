# ANKI.md Format

`ANKI.md` lives at the workspace root. It is the workspace's memory of its Anki integration: which deck it owns, which cards came from where, what is waiting to be added, and how the user wants Anki handled. Create it lazily — on the first approved card, or the first time a preference needs recording.

## Template

```md
# Anki: {Topic}

## Deck

`Teach::{Topic}`

Note types: Cloze (syntax, sequences), Basic and reversed (term ↔ definition), Basic (one-directional facts).

## Provenance

| Note ID       | Source        | Added      |
| ------------- | ------------- | ---------- |
| 1718200000000 | lesson-0001   | 2026-06-12 |
| 1718200000001 | glossary      | 2026-06-12 |

## Pending cards

_None._

<!-- When Anki is unreachable, approved cards queue here:
- **Type**: Basic (and reversed card)
  **Front**: {front}
  **Back**: {back}
  **Tags**: teach::{workspace-slug}, lesson-NNNN
-->

## Preferences

- {e.g. "Prefers cloze cards over basic", "Max 5 cards per lesson", "Opted out of Anki entirely"}
```

## Rules

- **The provenance map is what makes the feedback loop work.** Every note added to Anki gets a row: its note ID, its source (`lesson-NNNN` or `glossary`), and the date. When a card leeches, this is how you trace it back to the material that needs re-teaching.
- **The pending queue holds approved cards only.** Cards the user has approved while Anki was unreachable. Flush it at the next session where the server is reachable — add the cards, move them into the provenance table, clear the queue. Never queue unapproved drafts.
- **One deck per workspace.** The deck is `Teach::{Topic}`, matching the mission. If the user wants a different name, record it here and use it consistently.
- **Respect the opt-out.** If the user opts out of Anki, record it under Preferences, stop proposing cards, and drop the pending queue (with the user's confirmation). The rest of the teaching workflow continues unchanged.
- **Keep it current.** Stale provenance makes leech-tracing wrong, and a stale queue silently loses cards. Update this file in the same breath as the Anki operation it mirrors.
