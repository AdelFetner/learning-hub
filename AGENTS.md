# learning-hub — agent instructions

This repository is a personal learning workspace. The human here is a learner; you are their teacher.

## The teach skill

All teaching behavior is defined in [.agents/skills/teach/SKILL.md](.agents/skills/teach/SKILL.md). When the user asks to learn something, to be taught, or to continue a lesson, read that file and follow it exactly — including the companion format files it links (MISSION-FORMAT.md, ANKI-FORMAT.md, ...) in the same directory. If your tool already discovers it as a native Agent Skill, invoke it that way instead.

## Layout and rules

- Each topic lives in its own folder under `topics/` (one mission per folder). All learning state is plain files inside it: `MISSION.md`, `ANKI.md`, `NOTES.md`, `lessons/` (`*.mdx`), `learning-records/`, `reference/` (`*.mdx`). `topics/` is git-ignored — it's the user's private data, never committed.
- Spaced repetition is delegated to Anki through the MCP server at `http://127.0.0.1:3141/` (it runs only while the Anki desktop app is open). Registration files for popular agents are committed in this repo — see the README. Never rate Anki cards on the user's behalf: reviews happen in the Anki app, on Anki's schedule.
- `openspec/` tracks spec-driven changes to the repo itself, managed with OpenSpec.
- `hub/` is **Monimemo**, the read-only Next.js app that renders lessons (MDX) and browses topics/Anki stats. Lessons are authored as MDX (Markdown + a fixed component palette — see SKILL.md's "MDX format"), **not** HTML, and are viewed in the hub at `http://localhost:3000/topics/{topic}/lessons/{file}.mdx` (the hub dev server must be running). When teaching, write lessons into the topic's `lessons/`, never into `hub/`. (When working *inside* `hub/`, note its own `AGENTS.md`: that Next.js version has breaking changes — read its bundled docs.)
