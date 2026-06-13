# Tasks: Add Lesson Hub

## 1. Scaffold

- [ ] 1.1 Scaffold `hub/` with `create-next-app@latest` (TypeScript, App Router, Tailwind, ESLint, npm); verify `npm run dev` serves the starter on localhost; pin the scaffolded versions; set `engines.node >= 20`.
- [ ] 1.2 Init shadcn/ui and re-theme its tokens to Mock C (paper background, ink foreground, `#8c2d19` primary, ~4px radius, Georgia serif base, monospace numerals); add the components the UI tasks need (Sidebar, Card, Badge, Progress, Separator, Skeleton).

## 2. Content layer

- [ ] 2.1 `hub/src/lib/content.ts`: scan `../topics/` per request — topics (slug, title from `MISSION.md` heading, mission summary), lessons ordered by `NNNN` prefix, references, learning records, `ANKI.md` deck name. Dynamic rendering (no static caching) so new files appear on refresh.
- [ ] 2.2 Server-side markdown rendering for missions and learning records.
- [ ] 2.3 Strict slug validation + resolved-path prefix check against `topics/` (no traversal).

## 3. Serving lessons and references

- [ ] 3.1 Raw route handler streaming `topics/{topic}/(lessons|reference)/{file}.html` byte-identical with `Content-Type: text/html`.
- [ ] 3.2 Viewer pages `/topics/[topic]/lessons/[lesson]` and `/topics/[topic]/references/[ref]`: hub back-bar + same-origin iframe to the raw route (quizzes must stay interactive).

## 4. Anki stats (read-only)

- [ ] 4.1 Server-side MCP client (`@modelcontextprotocol/sdk`, streamable HTTP) for `http://127.0.0.1:3141/`: ~1.5 s timeout, in-process stats cache (~5 s), read tools only (`list_decks` with stats).
- [ ] 4.2 Topic ↔ deck mapping from `ANKI.md`; per-topic due/new badges, global due pill; graceful "Anki closed" state that never blocks page render.

## 5. UI (design per `mocks/mix.html`)

- [ ] 5.1 Design tokens + layout components: paper/serif/hairline/red-accent palette, sidebar, stat tiles, topic cards with progress bars, lesson rows.
- [ ] 5.2 Overview page: stat tiles (cards due, topics, lessons = file count, total cards in deck), topic card grid with retention-health bars, recent lessons (ordered by file mtime). No "completed" metric.
- [ ] 5.3 Topic page: mission, ordered lessons, references, learning-records timeline, deck badge.

## 6. Docs

- [ ] 6.1 `README.md`: "Browse your lessons" section — Node ≥ 20 prerequisite, `cd hub && npm install && npm run dev`.
- [ ] 6.2 `AGENTS.md`: note that `hub/` is a read-only viewer over `topics/` (agents don't write there when teaching).

## 7. Verification

- [ ] 7.1 `npm run dev` → overview shows the real `http-status-codes` topic with its lesson, reference, records, and (Anki open) an 8-due badge.
- [ ] 7.2 Drop a new lesson HTML into `topics/http-status-codes/lessons/` → it appears on refresh without restarting the dev server.
- [ ] 7.3 Open lesson 0001 through the hub: styling identical to opening the file directly, quiz fully interactive, back bar returns to the topic.
- [ ] 7.4 Close Anki → hub shows the "Anki closed" state and all pages still render; reopen → stats return.
- [ ] 7.5 Request a traversal path (e.g. `/raw/..%2F..%2FAGENTS.md`) → rejected, no file leaves `topics/`.
- [ ] 7.6 Mark tasks complete and offer `openspec archive add-lesson-hub`.
