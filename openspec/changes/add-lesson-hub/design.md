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

### Two routes in v1: overview + topic
Only two real page types exist: the overview (`/`) and the per-topic page (`/topics/{topic}`), plus the lesson/reference viewer routes under a topic. The mock's sidebar items "Lessons / References / Learning records" are not separate global index pages in v1 — the topic page already lists all three for that topic. The sidebar keeps Overview and a list of topics; the other labels are deferred (a flat cross-topic index would look sparse with a handful of items per topic).

### Optional and additive — the base experience is untouched
The hub is strictly additive. Everything it needs is confined to `hub/` (its own `package.json`, `node_modules`, build output); Node is a prerequisite *only* for running it. Nothing outside `hub/` is modified except docs: the teach skill, the `topics/` formats, `.mcp.json`/`AGENTS.md` agent configs, and the Anki setup are unchanged. A user who only wants agent CLI + HTML lessons + Anki import ignores `hub/` entirely and loses nothing; an existing clone adds the hub with a `git pull` and no migration. The README presents the hub under a clearly optional section, after the core setup is already complete.

### App in `hub/`, local-only
Latest stable Next.js (App Router, TypeScript) scaffolded into `hub/` with its own `package.json` and lockfile. Run with `npm run dev` (or `npm run build && npm start`); bound to localhost. Keeping it inside the repo means the content path is simply `../topics`, and a single clone carries content + viewer.

### Filesystem is the database
A small content layer (`hub/src/lib/content.ts`) scans `topics/` per request: topic list, mission (first paragraph as summary), numerically-ordered lessons, references, learning records, and the `ANKI.md` deck name. Pages opt out of static caching (dynamic rendering) so the hub never goes stale. Markdown (missions, records) renders server-side with a minimal renderer (e.g. `marked`).

Lesson and reference display titles come from the file's first `<h1>` (cheap regex over the head of the file), falling back to `<title>`, then to a humanized filename. Slugs stay raw filenames — stable URLs over pretty URLs.

### Only honest numbers
There is no "lesson completed" signal anywhere in the repo, and the hub is read-only, so v1 invents none. Stat tiles show: cards due now and total cards in deck (from Anki), topic count and lesson count (counted files). The "lessons" tile is a file count, not a completion count. "Recent lessons" orders by file mtime. No fabricated metrics — a learning tool must not lie about progress.

### Lessons served verbatim, framed by the hub
A route handler (e.g. `app/raw/[topic]/[kind]/[file]/route.ts`) streams the HTML file from disk with `Content-Type: text/html` — byte-identical, so lesson styling and quiz scripts work untouched. The iframe is chosen over in-page rendering (`dangerouslySetInnerHTML`, Shadow DOM) because lessons are complete documents whose CSS targets `body`/`:root`/`*` and whose scripts own the global scope; only a browsing context preserves that without rewriting each lesson. Full rationale in [docs/adr/0001-serve-lessons-verbatim-in-iframe.md](../../../docs/adr/0001-serve-lessons-verbatim-in-iframe.md). The user-facing route `/topics/{topic}/lessons/{lesson}` renders a viewer page: a slim sticky hub bar (back to topic · lesson title · open-standalone link to the raw route) above an `<iframe>` that fills the remaining viewport; the lesson scrolls inside its own document, exactly as if opened directly. No height-measuring, no script injection into the lesson. Same-origin, so quiz scripts run normally. Slugs are validated against a strict pattern and resolved paths are prefix-checked against `topics/` — no traversal.

### Topic progress bar = retention health
The thin bar on each topic card shows `(cardsInDeck − cardsDue) / cardsInDeck` — full when everything is reviewed and nothing waits, draining as cards come due. It is Anki-derived, so it is hidden (no bar) when Anki is closed or the topic has no deck. Missions have no planned lesson total, so no lesson-completion denominator is invented.

### Anki stats stream in; content never waits
Pages render immediately from the filesystem; every Anki-dependent element (stat tiles, due badges, the sidebar pill) sits behind React Suspense with a Skeleton fallback and streams in when the stats call resolves. With Anki open that's near-instant; with Anki closed the ~1.5 s timeout affects only the skeletons, never navigation.

### Read-only Anki client
A server-side MCP client (official `@modelcontextprotocol/sdk` `Client` + `StreamableHTTPClientTransport`) connects to `http://127.0.0.1:3141/`, performs the MCP `initialize` handshake, and calls only read tools (`list_decks` with stats). This is required, not optional: the add-on rejects plain HTTP (verified — a GET returns `406 Not Acceptable: Client must accept text/event-stream`), so it must be spoken to as a real MCP server. A short timeout (~1.5 s) bounds the connect; any failure is caught and surfaced as "Anki closed." Topic ↔ deck mapping comes from each workspace's `ANKI.md` `## Deck` line. Reachable → per-topic due/new badges, global "N cards due" pill; unreachable → a quiet "Anki closed" state and everything else renders normally. The hub never calls note-writing or rating tools.

### Design: dashboard structure, editorial soul
Chosen by the learner from three live mocks (see `mocks/` in this change: `editorial.html`, `modern.html`, winner `mix.html`): sidebar navigation, four stat tiles, topic cards with thin progress bars, recent-lessons list — rendered on warm paper (`#faf7f0`), Georgia serif, hairline `#e4ddcc` rules, monospace numerals, and the lessons' deep-red accent (`#8c2d19`).

### shadcn/ui, re-themed at the token level
Components come from shadcn/ui (Sidebar, Card, Badge, Progress, Separator, Skeleton, Tooltip as needed) so structure and accessibility come free — but its CSS variables are overridden once, globally, to the Mock C palette: paper `--background`, ink `--foreground`, `#8c2d19` `--primary`, small (~4px) radius, Georgia serif base font, monospace numerals. No stock-shadcn zinc/sans anywhere; the hub must read as the same publication as the lessons.

**Light only in v1**, defined entirely through CSS variables/tokens so a dark palette can be added later as a token set rather than a refactor. No dark mode is built now: the approved mock gives only a light direction, and the lessons it frames are light.

### Toolchain: npm + Node ≥ 20
The machine (and any cloner following the README) needs only Node — npm ships with it. No pnpm/bun/yarn. `hub/package.json` declares `engines.node >= 20` (developed on Node 24).

## Risks / Mitigations

- **Next.js version churn** → pin whatever `create-next-app@latest` scaffolds at implementation time; the app's surface (FS reads + one route handler) barely touches framework internals.
- **`ANKI.md` parse fragility** (deck line edited by hand) → tolerate absence: a topic without a parseable deck simply shows no Anki badge.
- **MCP handshake overhead per request** → cache the Anki client/stats for a few seconds in-process; failures never block page render (stats resolve independently of content).
- **Windows paths** (primary machine is Windows) → use `path.join`/`path.resolve` everywhere; no shell calls.
