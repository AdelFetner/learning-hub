# Design: Anki Spaced Repetition for the Teach Skill

## Context

The teach skill is a set of Markdown instruction files consumed by Claude Code (`.agents/skills/teach/`, symlinked from `.claude/skills/teach`). There is no application code — the "implementation" is precise agent instructions plus repo-level configuration. The Anki integration therefore lives in three places: the skill's instructions (behavior), a per-workspace state file (memory), and repo config (connectivity).

## Goals / Non-Goals

**Goals**
- Operationalize the skill's existing storage-strength philosophy with real spaced repetition.
- Keep cards integrated with lessons: every lesson ships with its cards, and the learner can edit or remove any card on request.
- Degrade gracefully — the skill must work unchanged when Anki is closed or absent.
- Pass the "girlfriend test": a non-developer can set the whole thing up from the README.

**Non-Goals (v1)**
- In-session warm-up reviews via `present_card` / `rate_card`.
- FSRS parameter optimization.
- Media (images/audio) on cards.
- AnkiWeb sync handling beyond calling `sync` after batch adds.
- Custom styled note types (`create_model`).

## Decisions

### Deck per workspace: top-level `{Topic}`
One Anki deck per teaching workspace, named after the topic (e.g. `Rust`, `HTTP Status Codes`) at the top level of Anki's deck tree, created lazily with the first lesson's cards. Topics are never grouped under a shared parent deck — a `Teach::` prefix was tried during verification and rejected by the learner: a parent deck visually groups unrelated topics and studying it would interleave them. Per-workspace queries stay trivial via the deck name and the `teach::{workspace-slug}` tag.

### Built-in note types only
Cards use Anki's stock note types: **Basic**, **Basic (and reversed card)**, and **Cloze**. Selection rule: cloze for syntax, sequences, and fill-in-the-structure material; basic/reversed for term ↔ definition pairs (glossary promotions); plain basic for one-directional facts. No `create_model` in v1 — custom styled note types are a future enhancement.

### Tag provenance, mirrored in `ANKI.md`
Every note is tagged `teach::{workspace-slug}` plus a source tag: `lesson-NNNN` (matching the lesson file number) or `glossary`. This makes `find_notes` queries by source possible from Anki's side. The `ANKI.md` provenance table (note ID, source, date) is the human-readable mirror on the workspace side, and is what lets a lapsing card be traced back to the lesson that produced it for re-teaching.

### Cards ship with the lesson
The agent creates cards at two trigger points — lesson generation and glossary-term promotion — and adds them to Anki immediately, with no approval round; every lesson HTML ends with a "Cards from this lesson" section listing them. The learner can ask to edit or remove any card at any time. Card quality rules: minimum-information principle (one fact per card); no formatting clues in answers (extends the existing quiz rule in SKILL.md). A v1 propose→confirm flow gated on demonstrated understanding was implemented first and replaced by learner decision during verification (2026-06-12): the learner wants cards to be part of the lesson artifact from the start, accepting that an occasional misconception gets carded — the leech → re-teach loop is the corrective.

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
- **Card overload** (agent cards too much per lesson) → minimum-information principle plus deliberately small lessons keep volume low; the learner can edit or remove any card, and lapse data prunes what isn't working.
- **Stale pending queue** (learner opts out mid-stream, queue grows) → `ANKI.md` records an explicit opt-out preference; when set, the agent stops proposing cards and the queue is dropped with the learner's confirmation.
