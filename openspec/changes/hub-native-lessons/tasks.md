# Tasks: Hub-Native MDX Lessons

## 1. Dependencies & MDX pipeline

- [ ] 1.1 Re-read the bundled Next 16 MDX + rendering docs (`hub/node_modules/next/dist/docs/`) per `hub/AGENTS.md`; confirm the `next-mdx-remote/rsc` `compileMDX` API and route-segment config.
- [ ] 1.2 Add deps in `hub/`: `next-mdx-remote@^6`, `remark-gfm@^4`, `gray-matter@^4`.
- [ ] 1.3 Create `hub/src/lib/mdx.ts` (`server-only`): read `.mdx` → `gray-matter` → `compileMDX({ source, components, options:{ mdxOptions:{ remarkPlugins:[remarkGfm] }, parseFrontmatter:false } })`; return `{ content, frontmatter }` or `{ error }`. No `rehype-raw`.

## 2. Component palette

- [ ] 2.1 `hub/src/components/lesson/` server components: `<Kicker>`, `<Lede>`, `<Callout tone?>`, `<Primary href source>`, `<Cards items>`, and element overrides (h1/h2/p/lists/a/code/pre/table.../blockquote/strong/em/hr) with editorial Tailwind classes. Export a `lessonComponents` map.
- [ ] 2.2 `hub/src/components/lesson/quiz.tsx` (`"use client"`): `<Quiz>` (scoring state + running score/summary via context) and `<Q answer options explain>` (locks on answer, reveals correct, shows explanation), using `--chart-2`/`--destructive` tokens.

## 3. Content layer & pages

- [ ] 3.1 Update `hub/src/lib/content.ts`: list/resolve `*.mdx`; titles from frontmatter via `gray-matter` (heading → filename fallback); keep `isSafeSegment`/`resolveWithin` unchanged; `resolveDocFile` accepts `.mdx`.
- [ ] 3.2 Rewrite `hub/src/app/topics/[topic]/lessons/[lesson]/page.tsx` and `.../references/[ref]/page.tsx` to render MDX natively in `<Shell>` + breadcrumb (`force-dynamic`, `runtime="nodejs"`).
- [ ] 3.3 Add `hub/src/app/topics/[topic]/lessons/[lesson]/error.tsx` (`"use client"`) as the render-failure backstop.
- [ ] 3.4 Delete `hub/src/app/raw/[topic]/[kind]/[file]/route.ts` and `hub/src/components/viewer.tsx`.
- [ ] 3.5 `globals.css`: add `.lesson-prose` (width/rhythm) and a `@media print` block; leave `.doc` (missions/records) untouched.

## 4. UX (#3)

- [ ] 4.1 Make the sidebar brand in `hub/src/components/sidebar.tsx` a `<Link href="/">`.
- [ ] 4.2 Add Playwright MCP locally (`claude mcp add`, not committed); drive `localhost:3000`, snapshot overview + a lesson, fix UX gaps it surfaces (record what was changed).

## 5. Skill & docs

- [ ] 5.1 `.agents/skills/teach/SKILL.md`: lessons → `./lessons/NNNN-*.mdx` and references → `./reference/*.mdx` using only the palette (no `<style>`/`<script>`/`import`); document the frontmatter schema and each component's props (including `<Q answer={index}>` and the equal-length-answers rule); `<Cards items={[…]}/>` for the cards section; view lessons at the hub URL with the dev server running; cross-links as hub/root-relative URLs.
- [ ] 5.2 Supersede `docs/adr/0001-serve-lessons-verbatim-in-iframe.md` with `docs/adr/0002-render-lessons-natively-as-mdx.md` (mark 0001 superseded); update `README.md` (hub is how you view lessons; lessons are MDX; hub required to view).

## 6. Migration & verification

- [ ] 6.1 Regenerate `topics/http-status-codes/lessons/0001-status-classes-triage.html` as `0001-status-classes-triage.mdx` (and its reference as `.mdx`) to exercise the pipeline.
- [ ] 6.2 `cd hub && npm run build` clean; `npm run dev`; load `/`, the topic, the lesson, the reference.
- [ ] 6.3 Lesson renders natively (no iframe), styled like before; `<Quiz>` scores interactively; `<Cards>` shows the table.
- [ ] 6.4 A deliberately broken `.mdx` shows the error panel (not a 500) and doesn't break sibling lessons.
- [ ] 6.5 Playwright: brand logo navigates to `/`; before/after snapshots captured.
- [ ] 6.6 Mark tasks complete and offer `openspec archive hub-native-lessons`.
