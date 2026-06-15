# Add Teaching Tone Preference

## Why

How a teacher *speaks* matters as much as what they teach. Today the teach skill records tone only reactively — if the user happens to mention it, it lands in `NOTES.md` (the protein-beef-burritos workspace shows this: "enseñar en español rioplatense… evitar tono de nutricionista rígido"). A learner who never volunteers a preference gets the agent's default voice, which may not fit them. The owner wants the teacher to **ask** the preferred tone up front, once, and remember it — so every lesson is delivered in the voice the learner likes.

## What Changes

- The teach skill gains an explicit step: on the first session for a topic — after `MISSION.md` is established and **before** the first lesson — ask the learner their preferred teaching **tone/voice**, offering a few presets (e.g. warm/casual, formal/professional, playful, concise/no-fluff, Socratic) plus a free-form option.
- The chosen tone is persisted to the workspace `NOTES.md` (the existing preferences store — no new file/format), and honored when designing every subsequent lesson.
- The preference is revisable: if the learner later asks for a different tone, update `NOTES.md`.

## Impact

- Affected specs: `teaching` (new capability — one requirement: tone is asked once and persisted).
- Affected files: `.agents/skills/teach/SKILL.md` (a short new subsection after "## The Mission"; a one-line pointer in the `NOTES.md` section). `.claude/skills/teach/SKILL.md` is a pointer that delegates to this file, so no second edit is needed.
- No code, no Anki, no hub impact. Existing workspaces are unaffected (tone is asked on first session; established workspaces simply keep their current `NOTES.md`).
