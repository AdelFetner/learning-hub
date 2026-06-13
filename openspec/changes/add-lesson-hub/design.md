# Design: Local Lesson Hub

## Context

The repo's content is plain files with stable conventions: `topics/{slug}/MISSION.md`, `lessons/NNNN-name.html` (self-contained HTML with inline styles and quiz scripts), `reference/*.html`, `learning-records/NNNN-*.md`, and `ANKI.md` (deck name + provenance). The AnkiMCP add-on exposes a standard MCP streamable-HTTP server at `http://127.0.0.1:3141/` while Anki is open. The hub adds a read-only presentation layer over both.

## Goals / Non-Goals

**Goals**
- One local web app to browse topics, lessons, references, and learning records.
- Lessons render exactly as authored — same files, working quizzes.
- Surface Anki due/new counts per topic while Anki is open; degrade gracefully when closed.
- Zero-rebuild freshness: new files appear on refresh.
- Clone-and-run for anyone (Node ≥ 20 + `npm install`), matching the repo's provider-agnostic constraint.

**Non-Goals (v1)**
- Deployment, auth, or any network exposure beyond localhost.
- Editing content from the UI, or starting teach sessions from the UI.
- Running Anki reviews in the hub (the review boundary stays: reviews happen in Anki).
- Search, tags, or cross-topic analytics.

## Decisions

### App in `hub/`, local-only
Latest stable Next.js (App Router, TypeScript) scaffolded into `hub/` with its own `package.json` and lockfile. Run with `npm run dev` (or `npm run build && npm start`); bound to localhost. Keeping it inside the repo means the content path is simply `../topics`, and a single clone carries content + viewer.

### Filesystem is the database
A small content layer (`hub/src/lib/content.ts`) scans `topics/` per request: topic list, mission (first paragraph as summary), numerically-ordered lessons, references, learning records, and the `ANKI.md` deck name. Pages opt out of static caching (dynamic rendering) so the hub never goes stale. Markdown (missions, records) renders server-side with a minimal renderer (e.g. `marked`).

### Lessons served verbatim, framed by the hub
A route handler (e.g. `app/raw/[topic]/[kind]/[file]/route.ts`) streams the HTML file from disk with `Content-Type: text/html` — byte-identical, so lesson styling and quiz scripts work untouched. The user-facing route `/topics/{topic}/lessons/{lesson}` renders a viewer page: a slim hub bar (back to topic, topic name) above an `<iframe>` pointing at the raw route. Same-origin, so scripts run normally. Slugs are validated against a strict pattern and resolved paths are prefix-checked against `topics/` — no traversal.

### Read-only Anki client
A server-side MCP client (official `@modelcontextprotocol/sdk`, streamable-HTTP transport) connects to `http://127.0.0.1:3141/` with a short timeout (~1.5 s) and calls only read tools (`list_decks` with stats). Topic ↔ deck mapping comes from each workspace's `ANKI.md` `## Deck` line. Reachable → per-topic due/new badges, global "N cards due" pill; unreachable → a quiet "Anki closed" state and everything else renders normally. The hub never calls note-writing or rating tools.

### Design: dashboard structure, editorial soul
Chosen by the learner from three live mocks (see `mocks/` in this change: `editorial.html`, `modern.html`, winner `mix.html`): sidebar navigation, four stat tiles, topic cards with thin progress bars, recent-lessons list — rendered on warm paper (`#faf7f0`), Georgia serif, hairline `#e4ddcc` rules, monospace numerals, and the lessons' deep-red accent (`#8c2d19`). Implemented as design tokens + a small set of components (no heavy UI kit); Tailwind for layout utility.

## Risks / Mitigations

- **Next.js version churn** → pin whatever `create-next-app@latest` scaffolds at implementation time; the app's surface (FS reads + one route handler) barely touches framework internals.
- **`ANKI.md` parse fragility** (deck line edited by hand) → tolerate absence: a topic without a parseable deck simply shows no Anki badge.
- **MCP handshake overhead per request** → cache the Anki client/stats for a few seconds in-process; failures never block page render (stats resolve independently of content).
- **Windows paths** (primary machine is Windows) → use `path.join`/`path.resolve` everywhere; no shell calls.
