# Add Anki Spaced Repetition to the Teach Skill

## Why

The `teach` skill names **storage strength** — long-term retention built through retrieval practice and spacing — as the real goal of learning (`.agents/skills/teach/SKILL.md`, "Fluency vs Storage Strength"). But nothing in the skill operationalizes spacing between sessions: lessons and reference documents sit on disk, and no mechanism schedules recall. The learner's retention is left to chance.

Anki is purpose-built for exactly this gap. The **AnkiMCP Server add-on** (AnkiWeb code `124672614`) runs an MCP server inside Anki (HTTP on `http://127.0.0.1:3141/`, requires Anki ≥ 25.07, no AnkiConnect) and exposes deck, note, tag, due-card, and FSRS memory-state tools. Connecting the teach skill to it closes the loop the skill's own philosophy already demands: the agent creates cards from demonstrated understanding, Anki schedules the spacing, and the agent reads the resulting memory state back as a signal for what to teach next.

## What Changes

- The teach skill gains a **Spaced Repetition (Anki)** workflow:
  - At session start, the agent reads Anki state (due counts, lapses, FSRS memory state) for the workspace deck and factors weak or leeching cards into the zone-of-proximal-development calculation. Leeching cards trigger a re-teach of their source material with a new mental model.
  - When a lesson is completed or a glossary term is promoted, the agent drafts cards and presents them for learner approval before anything is added to Anki (**propose → confirm**).
  - Reviews themselves stay in the Anki app — the agent reads state and creates/edits cards but does not run reviews, keeping Anki's scheduler the single source of truth for spacing.
  - When the MCP server is unreachable (Anki closed, add-on missing), the agent says so once, continues the traditional teach flow, and parks approved-but-unsent cards in a pending queue for later flush.
- Each teaching workspace gains an `ANKI.md` state file (per a new `ANKI-FORMAT.md`) tracking deck name, note-type choices, a provenance map (Anki note IDs ↔ source lesson / glossary term), the pending-cards queue, and user preferences (including opting out of Anki entirely).
- The repo becomes portable for non-developers: a project-scoped `.mcp.json` registers the Anki MCP server, and a root `README.md` walks a new user through setup (install Anki ≥ 25.07 → add-on `124672614` → restart Anki → clone repo → `/teach`).

## Impact

- Affected specs: `spaced-repetition` (new capability).
- Affected code:
  - `.agents/skills/teach/SKILL.md` — modified (workspace state-file list, philosophy section, new Spaced Repetition section). Note `.claude/skills/teach` is a symlink to this directory.
  - `.agents/skills/teach/ANKI-FORMAT.md` — new.
  - `.mcp.json` — new, repo root.
  - `README.md` — new, repo root.
- Editing `SKILL.md` changes its hash relative to `skills-lock.json` (the `mattpocock/skills` installer). This drift is accepted; a future skills update may flag or overwrite the file. The README documents this.
- No breaking changes to existing workspaces: `ANKI.md` is created lazily, and a learner can opt out of Anki entirely.
