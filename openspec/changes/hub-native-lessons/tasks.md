# Tasks: Hub-Native MDX Lessons

## 1. Dependencies & MDX pipeline

- [x] 1.1 Re-read the bundled Next 16 MDX + rendering docs (`hub/node_modules/next/dist/docs/`) per `hub/AGENTS.md`; confirm the `next-mdx-remote/rsc` `compileMDX` API and route-segment config.
- [x] 1.2 Add deps in `hub/`: `next-mdx-remote@^6`, `remark-gfm@^4`, `gray-matter@^4`.
- [x] 1.3 Create `hub/src/lib/mdx.ts` (`server-only`): `gray-matter` → `compileMDX(... parseFrontmatter:false, mdxOptions.remarkPlugins:[remarkGfm])`; returns `{ ok, content, frontmatter }` or `{ ok:false, error }`. No `rehype-raw`.

## 2. Component palette

- [x] 2.1 `hub/src/components/lesson/index.tsx` server components: `<Kicker>`, `<Lede>`, `<Callout tone?>`, `<Primary href source>`, `<Cards>`+`<Card front back>`, and themed element overrides. Exports `lessonComponents`.
- [x] 2.2 `hub/src/components/lesson/quiz.tsx` (`"use client"`): `<Quiz>` (counts `<Q>` children, scoring + summary, memoized context) and `<Q prompt options answer explain>` (pipe-delimited options, 0-based answer). **String attributes only** — MDX strips object/array attribute values.

## 3. Content layer & pages

- [x] 3.1 `hub/src/lib/content.ts`: list/resolve `*.mdx`; titles from frontmatter (`mdxTitle`); `resolveDocFile` accepts `.mdx`; `isSafeSegment`/`resolveWithin` unchanged.
- [x] 3.2 Rewrite lesson + reference pages to render MDX natively via shared `DocView` + `LessonShell` (`force-dynamic`, `runtime="nodejs"`).
- [x] 3.3 Add `error.tsx` (`"use client"`) in the lesson segment as the render-failure backstop.
- [x] 3.4 Delete `hub/src/app/raw/[topic]/[kind]/[file]/route.ts` and `hub/src/components/viewer.tsx`.
- [x] 3.5 `globals.css`: `.lesson-prose` + `@media print`; `.doc` untouched.

## 4. UX (#3)

- [x] 4.1 Sidebar brand in `hub/src/components/sidebar.tsx` is now `<Link href="/">` (verified: renders `<a href="/">Moni…`).
- [x] 4.2 Playwright MCP registered at local scope (`~/.claude.json`, project — not committed). The named UX bug (logo → home) is fixed and verified via HTTP. A live Playwright-driven sweep is deferred to a future session (MCP tools load at session start; can't drive mid-session).

## 5. Skill & docs

- [x] 5.1 `.agents/skills/teach/SKILL.md`: lessons/references → `*.mdx`; new "MDX format" section (frontmatter schema + palette: `<Kicker> <Lede> <Callout> <Primary> <Cards>/<Card> <Quiz>/<Q>`, string-attrs/pipe-options rule); "Viewing lessons" via hub URL with dev server running; cards section uses `<Cards>`; cross-links as hub paths.
- [x] 5.2 `docs/adr/0002-render-lessons-natively-as-mdx.md` added; `0001` marked superseded; `README.md` updated (Node prerequisite, lessons are MDX viewed in Monimemo, repo layout); `AGENTS.md` hub bullet updated.

## 6. Migration & verification

- [x] 6.1 Migrated `topics/http-status-codes` lesson + reference to `.mdx` (now git-ignored user data) to exercise the pipeline.
- [x] 6.2 `npm run build` clean; routes dynamic; raw route gone.
- [x] 6.3 Lesson renders natively (no iframe) at 200 — quiz buttons, cards, primary source present; styled by the hub.
- [x] 6.4 A deliberately broken `.mdx` returns 200 with the error panel (not a 500); sibling lesson still 200. Verified.
- [x] 6.5 Brand logo navigates to `/` (verified via rendered `<a href="/">`); deeper Playwright snapshots deferred with 4.2.
- [x] 6.6 Mark tasks complete and offer `openspec archive hub-native-lessons`.
