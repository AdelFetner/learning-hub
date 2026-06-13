# Tasks: Add Lesson Hub

## 1. Scaffold

- [x] 1.1 Scaffold `hub/` with `create-next-app@latest` (TypeScript, App Router, Tailwind, ESLint, npm); verify `npm run dev` serves the starter on localhost; pin the scaffolded versions; set `engines.node >= 20`. (Next 16.2.9, React 19.2.4, Tailwind v4.)
- [x] 1.2 Init shadcn/ui and re-theme its tokens to Mock C (paper background, ink foreground, `#8c2d19` primary, ~4px radius, Georgia serif base, monospace numerals); add the components the UI tasks need (Card, Badge, Progress, Separator, Skeleton; sidebar hand-built for the editorial look).

## 2. Content layer

- [x] 2.1 `hub/src/lib/content.ts`: scan `../topics/` per request — topics (slug, title from `MISSION.md` heading, mission summary), lessons ordered by `NNNN` prefix, references, learning records, `ANKI.md` deck name. Dynamic rendering (`force-dynamic`) so new files appear on refresh.
- [x] 2.2 Server-side markdown rendering for missions and learning records (`marked`, `.doc` prose styles).
- [x] 2.3 Strict slug validation + resolved-path prefix check against `topics/` (no traversal).

## 3. Serving lessons and references

- [x] 3.1 Raw route handler streaming `topics/{topic}/(lessons|reference)/{file}.html` byte-identical with `Content-Type: text/html`.
- [x] 3.2 Viewer pages `/topics/[topic]/lessons/[lesson]` and `/topics/[topic]/references/[ref]`: sticky hub back-bar + same-origin full-height iframe to the raw route (quizzes stay interactive).

## 4. Anki stats (read-only)

- [x] 4.1 Server-side MCP client (`@modelcontextprotocol/sdk` 1.29, streamable HTTP) for `http://127.0.0.1:3141/`: 1.5 s timeout, in-process stats cache (~4 s), read tool only (`list_decks` with stats).
- [x] 4.2 Topic ↔ deck mapping from `ANKI.md`; per-topic "to study" badge + retention bar, global pill/tiles; graceful "Anki closed" state streamed via Suspense, never blocking page render.

## 5. UI (design per `mocks/mix.html`)

- [x] 5.1 Design tokens + layout components: paper/serif/hairline/red-accent palette, sidebar, stat tiles, topic cards with progress bars, lesson rows.
- [x] 5.2 Overview page: stat tiles (cards to study, topics, lessons = file count, total cards in deck), topic card grid with retention-health bars, recent lessons (ordered by file mtime). No "completed" metric.
- [x] 5.3 Topic page: mission, ordered lessons, references, learning-records timeline, deck badge.

## 6. Docs

- [x] 6.1 `README.md`: "Browse your lessons (optional)" section — Node ≥ 20 prerequisite, `cd hub && npm install && npm run dev`, clearly marked optional.
- [x] 6.2 `AGENTS.md`: note that `hub/` is a read-only viewer over `topics/` (agents don't write there when teaching).

## 7. Verification

- [x] 7.1 `npm run dev` → overview shows the real `http-status-codes` topic (title, mission summary) and, Anki open, the connected pill + "cards to study" / retention. (Verified via curl 2026-06-12.)
- [x] 7.2 Drop a new lesson HTML into `topics/http-status-codes/lessons/` → appears on refresh without restart; removed → gone on refresh. (Verified.)
- [x] 7.3 Lesson 0001 through the hub serves byte-identical HTML (own `<h1>`, quiz `<script>`, "Cards from this lesson") inside the iframe, with back bar + open-standalone. (Verified verbatim serving + wrapper; recommend a browser eyeball for click-through.)
- [x] 7.4 Graceful degradation: a dead MCP port fails in ~28 ms through the real SDK and is caught → `reachable:false` → "Anki closed" state; pages still render. (Mechanism verified; closing the live Anki app is an optional user eyeball.)
- [x] 7.5 Traversal paths (`..%2F..%2FAGENTS.md`, `..%2FANKI.md`) → 404; valid lesson → 200. No file leaves `topics/`. (Verified.)
- [x] 7.6 Base flow untouched: only `README.md` and `AGENTS.md` changed outside `hub/`; core setup needs no Node/hub step; ignoring `hub/` loses nothing. (Verified via `git status`.)
- [ ] 7.7 Mark tasks complete and offer `openspec archive add-lesson-hub`.
