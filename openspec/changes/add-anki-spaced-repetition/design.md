# Design: Anki Spaced Repetition for the Teach Skill

## Context

The teach skill is a set of Markdown instruction files consumed by Claude Code (`.agents/skills/teach/`, symlinked from `.claude/skills/teach`). There is no application code — the "implementation" is precise agent instructions plus repo-level configuration. The Anki integration therefore lives in three places: the skill's instructions (behavior), a per-workspace state file (memory), and repo config (connectivity).

## Goals / Non-Goals

**Goals**
- Operationalize the skill's existing storage-strength philosophy with real spaced repetition.
- Keep the learner in control: nothing reaches Anki without explicit approval.
- Degrade gracefully — the skill must work unchanged when Anki is closed or absent.
- Pass the "girlfriend test": a non-developer can set the whole thing up from the README.

**Non-Goals (v1)**
- In-session warm-up reviews via `present_card` / `rate_card`.
- FSRS parameter optimization.
- Media (images/audio) on cards.
- AnkiWeb sync handling beyond calling `sync` after batch adds.
- Custom styled note types (`create_model`).

## Decisions

### Deck per workspace: `Teach::{Topic}`
One Anki deck per teaching workspace, named `Teach::{Topic}` (e.g. `Teach::Rust`), created lazily via `create_deck` on the first approved card. The `Teach::` prefix groups all teach decks under one parent in Anki's deck tree and makes due-count queries per workspace trivial.

### Built-in note types only
Cards use Anki's stock note types: **Basic**, **Basic (and reversed card)**, and **Cloze**. Selection rule: cloze for syntax, sequences, and fill-in-the-structure material; basic/reversed for term ↔ definition pairs (glossary promotions); plain basic for one-directional facts. No `create_model` in v1 — custom styled note types are a future enhancement.

### Tag provenance, mirrored in `ANKI.md`
Every note is tagged `teach::{workspace-slug}` plus a source tag: `lesson-NNNN` (matching the lesson file number) or `glossary`. This makes `find_notes` queries by source possible from Anki's side. The `ANKI.md` provenance table (note ID, source, date) is the human-readable mirror on the workspace side, and is what lets a lapsing card be traced back to the lesson that produced it for re-teaching.

### Propose → confirm card flow
The agent drafts cards at two trigger points — lesson completion and glossary-term promotion — and presents them as plain text for approval (edit/drop/approve per card) before calling `add_notes`. Card quality rules: minimum-information principle (one fact per card); no formatting clues in answers (extends the existing quiz rule in SKILL.md). Only material with demonstrated understanding is carded, mirroring the glossary's "add a term only when the user understands it" promotion rule.

### Review boundary: Anki owns spacing
The agent reads state (`get_due_cards`, lapse counts, `get_card_memory_state`) and writes cards, but never rates cards during a teach session. Reviews happen in the Anki app on Anki's schedule. Rationale: two schedulers fighting over the same cards corrupts FSRS's signal; the memory state the agent reads at session start is only trustworthy if Anki's scheduler is the sole writer of review history.

### Feedback loop: weak cards shape the ZPD
At session start (server reachable), the agent fetches due counts, lapses, and FSRS memory state for the workspace deck and folds them into the zone-of-proximal-development calculation alongside learning records. A leeching/lapsing card is treated as evidence of a misconception: the agent re-teaches the source material (via the provenance map) using a *different* mental model than the original lesson, and writes a learning record when the misconception is resolved — consistent with the existing learning-record rule that corrected misconceptions are high-value records.

### Graceful degradation with a pending queue
If `http://127.0.0.1:3141/` is unreachable, the agent states it once ("Anki isn't open — cards will be queued"), then proceeds with the traditional flow. Approved cards land in the `ANKI.md` **Pending cards** queue. On the next session where the server is reachable, the queue is flushed (cards added, provenance recorded, queue cleared) before new work begins.

### Portable setup
- `.mcp.json` at repo root (project scope, ships with the clone):
  ```json
  {"mcpServers": {"anki": {"type": "http", "url": "http://127.0.0.1:3141/"}}}
  ```
- Root `README.md` written for a non-developer: install Anki ≥ 25.07, Tools → Add-ons → Get Add-ons → code `124672614`, restart Anki, clone repo, open Claude Code, run `/teach`. Troubleshooting note: the MCP server only runs while Anki is open.

### Accepted trade-off: skills-lock drift
Editing `.agents/skills/teach/SKILL.md` changes its hash versus `skills-lock.json` (managed by the `mattpocock/skills` installer). Accepted for v1; the README warns that a future skills update may flag or overwrite the customization.

## Risks / Mitigations

- **Anki version churn** (add-on requires Anki ≥ 25.07, MCP tool names may evolve) → README pins the minimum version; skill instructions reference tools by intent ("read due counts") with current tool names as hints, so small renames don't break the flow.
- **Card overload** (agent proposes too many cards, learner rubber-stamps) → minimum-information principle plus the demonstrated-understanding gate keep volume low; the learner approves each card individually.
- **Stale pending queue** (learner opts out mid-stream, queue grows) → `ANKI.md` records an explicit opt-out preference; when set, the agent stops proposing cards and the queue is dropped with the learner's confirmation.
