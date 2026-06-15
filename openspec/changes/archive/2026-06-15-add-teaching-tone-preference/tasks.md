# Tasks: Add Teaching Tone Preference

## 1. Skill instructions

- [x] 1.1 In `.agents/skills/teach/SKILL.md`, add a short subsection (after "## The Mission") instructing: on the first session, once the mission is set and before the first lesson, ask the learner's preferred teaching tone/voice — offer presets (warm/casual, formal/professional, playful, concise/no-fluff, Socratic) plus free-form — and record the choice in `NOTES.md`. Honor it in every lesson. If `NOTES.md` already records a tone, skip the question.
- [x] 1.2 Add a one-line cross-reference in the "## `NOTES.md`" section noting that tone/voice is one of the preferences captured there.

## 2. Verify

- [x] 2.1 Read-through: the instruction sits before lesson creation (new "## Teaching Tone" section between Mission and ZPD), names `NOTES.md` as the store, and is skipped when a tone is already recorded.
- [ ] 2.2 (Optional, live) Start `/teach` in a fresh topic and confirm the agent asks tone before the first lesson and writes it to `NOTES.md`.
- [x] 2.3 Mark tasks complete and offer `openspec archive add-teaching-tone-preference`.
