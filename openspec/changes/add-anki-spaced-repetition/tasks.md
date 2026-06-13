# Tasks: Add Anki Spaced Repetition

## 1. Teach skill instructions

- [x] 1.1 Modify `.agents/skills/teach/SKILL.md` — add `ANKI.md` to the workspace state-file list (alongside `MISSION.md`, `NOTES.md`, etc.), referencing `ANKI-FORMAT.md`.
- [x] 1.2 Modify `.agents/skills/teach/SKILL.md` — in "Fluency vs Storage Strength", connect the spacing/retrieval bullets to Anki ("spacing is delegated to Anki via MCP").
- [x] 1.3 Add a `## Spaced Repetition (Anki)` section to `SKILL.md` covering: session-start state read (due counts, lapses, FSRS memory state — read alongside learning records when calculating the zone of proximal development), propose → confirm card flow at lesson end and glossary promotion, card quality rules (minimum information, note-type selection, no formatting clues), leech → re-teach behavior with a new mental model plus learning record on resolution, the review boundary (no `rate_card`; Anki owns spacing), and graceful degradation (announce once, pending queue, flush when reachable).

## 2. ANKI-FORMAT.md

- [x] 2.1 Create `.agents/skills/teach/ANKI-FORMAT.md` mirroring the tone and shape of `MISSION-FORMAT.md` / `GLOSSARY-FORMAT.md` (template block + Rules): deck name (`Teach::{Topic}`), note-type choices, provenance table (Anki note ID, source lesson/term, date), pending-cards queue, user preferences (including Anki opt-out).

## 3. Repo-level setup

- [x] 3.1 Create `.mcp.json` at the repo root registering the Anki MCP server (`{"mcpServers": {"anki": {"type": "http", "url": "http://127.0.0.1:3141/"}}}`).
- [x] 3.2 Create `README.md` at the repo root: plain-language setup guide for a non-developer (install Anki ≥ 25.07 → Tools → Add-ons → Get Add-ons → `124672614` → restart Anki → clone repo → open Claude Code → `/teach`), a troubleshooting section (the MCP server only runs while Anki is open), and a note that `SKILL.md` is customized relative to `skills-lock.json` (a future skills update may flag/overwrite it).

## 4. Verification

- [ ] 4.1 With Anki open and the add-on installed: `claude mcp list` (or tool search) shows the `anki` server's tools from `http://127.0.0.1:3141/`.
- [ ] 4.2 In a fresh workspace directory, run `/teach` on a small topic, complete a mini lesson with its cards; verify in Anki that the top-level `{Topic}` deck exists and the notes carry the `teach::{workspace-slug}` and `lesson-NNNN` tags.
- [ ] 4.3 Start a second session; verify the agent reads due/lapse state at session start and mentions it in its diagnosis.
- [ ] 4.4 Close Anki and run `/teach`; verify the single degradation message and that approved cards land in the `ANKI.md` pending queue, then reopen Anki and verify the queue flushes.
- [ ] 4.5 After user testing, mark tasks complete and offer `openspec archive add-anki-spaced-repetition`.
