# Add a Local Lesson Hub (Next.js)

## Why

Lessons accumulate as beautiful, self-contained HTML files under `topics/*/lessons/`, but there is no front door: browsing them means opening files from a file explorer, missions and learning records are raw markdown, and the Anki state the system maintains is invisible outside the Anki app. The repo deserves a hub — one pretty, modern, local web app where the learner sees every topic, opens any lesson, and knows at a glance what Anki wants reviewed today.

## What Changes

- A new **`hub/`** Next.js app (App Router, TypeScript), run locally (`npm run dev` inside `hub/`); nothing is deployed and no learning data leaves the machine.
- The **filesystem is the database**: the hub reads `topics/` at request time, so a lesson the teach skill writes mid-session appears in the hub on the next refresh — no rebuild, no index.
- **Lessons and references are served verbatim** by a route handler with slug parameters (`/topics/{topic}/lessons/{lesson}`): the HTML files ship unmodified, so their styling and interactive quizzes keep working. A viewer page frames them with hub navigation (back bar).
- **Hub pages**: an overview (stat tiles, topic cards, recent lessons) and a per-topic page (mission, ordered lessons, reference docs, learning-records timeline).
- **Live Anki stats, read-only**: a server-side MCP client queries the AnkiMCP add-on (`http://127.0.0.1:3141/`) for per-deck due/new counts, mapped to topics via each workspace's `ANKI.md`. When Anki is closed the hub shows a graceful "Anki closed" state. The hub never writes to Anki — reviews stay in the Anki app, consistent with the `spaced-repetition` spec's review boundary.
- **Design direction**: dashboard structure with editorial soul — chosen by the learner from three live mocks (kept in `mocks/` in this change): warm paper, serif typography, hairline rules, the lessons' deep-red accent, sidebar + stat tiles + topic cards.
- `README.md` gains a "Browse your lessons" section (Node ≥ 20 prerequisite, `cd hub && npm install && npm run dev`); `AGENTS.md` notes that `hub/` is a read-only viewer over `topics/`.

## Impact

- Affected specs: `lesson-hub` (new capability).
- Affected code:
  - `hub/` — new Next.js app (the only place with application code in the repo).
  - `README.md` — modified (new section).
  - `AGENTS.md` — modified (one note).
- No changes to the teach skill, `topics/` content formats, or the `spaced-repetition` capability; the hub is a pure reader of both.
- Provider-agnostic by construction: the hub is a plain web app, independent of which AI agent generated the content.
- **Fully optional and additive.** The original experience — agent CLI + HTML lessons + Anki — keeps working unchanged for users who never touch the hub. The hub lives entirely in `hub/`, requires Node only if run, and nothing in the base flow (teach skill, `topics/`, Anki setup) references or depends on it. Existing clones gain the hub by `git pull`; nothing they already do breaks.
