# Design: Hub-Native MDX Lessons

## Context

Lessons are authored by the teach skill (provider-agnostic) and live in `topics/` — now treated as private, git-ignored user data. The hub (Next 16, App Router, React 19, Tailwind v4, shadcn re-themed to a warm-paper editorial palette) reads `topics/` at request time. We replace the iframe viewer with native rendering. Grounded in the bundled Next 16 docs (`hub/node_modules/next/dist/docs/`), verified during design.

## Goals / Non-Goals

**Goals**
- Render lessons natively inside the hub chrome, styled by the hub; no iframe.
- Keep lessons as files the agent writes into `topics/` and the hub compiles at request time (no build-time dependency on git-ignored content).
- Move interactivity into a vetted hub component; lessons author no JS.
- Fail gracefully — a broken lesson never crashes the hub.

**Non-Goals**
- Standalone-openable lessons (consciously dropped; the hub is the viewer).
- Multi-tenant/untrusted authoring (single local user; lessons are authored by the user's own trusted agent).
- A rich plugin system — the component palette is small and fixed.

## Decisions

### Request-time MDX via `next-mdx-remote/rsc`
`@next/mdx` is build-time and imports `.mdx` from the module graph — unusable for git-ignored content compiled per request. We use `compileMDX({ source, components, options:{ mdxOptions:{ remarkPlugins:[remarkGfm] } } })` from `next-mdx-remote/rsc`: it compiles an MDX *string* in an RSC with our components map, no file-based routing, no build-tree dependency. Pages keep `export const dynamic = "force-dynamic"` (Cache Components is off) and `runtime = "nodejs"` (we use `node:fs`). Turbopack's "non-serializable plugin options" limitation does not apply (compilation runs in our Node process, not the Turbopack loader). Deps: `next-mdx-remote@^6`, `remark-gfm@^4`, `gray-matter@^4`. Exact APIs re-checked against the bundled docs before coding (`hub/AGENTS.md`).

### Fixed component palette (no arbitrary imports)
A server module exports the `components` map passed to `compileMDX`. MDX can only use names in the map, so there is no import/module-resolution surface. Palette: server components `<Kicker>`, `<Lede>`, `<Callout tone>`, `<Primary href source>`, `<Cards items>`, plus element overrides (`h1/h2/p/ul/ol/li/a/code/pre/table/thead/tbody/tr/th/td/blockquote/strong/em/hr`) carrying the editorial Tailwind classes; and a client island `quiz.tsx` (`<Quiz>` + `<Q answer options explain>`) that owns scoring state via context and renders the running score / summary using the existing theme tokens (`--chart-2` green, `--destructive` red). Element overrides (not `.doc` descendant selectors) carry styles so they don't bleed into the quiz island.

### Pipeline + integration
`hub/src/lib/mdx.ts` (`server-only`): read file → `gray-matter` (frontmatter: `title`, `kicker?`, `summary?`, `minutes?`, `primarySource?`) → `compileMDX` on the body → return `{ content, frontmatter }` or `{ error }`. `content.ts` switches listing/resolution to `*.mdx`, reads titles from frontmatter (heading/filename fallback), and **keeps `isSafeSegment`/`resolveWithin` unchanged** (the traversal boundary). Lesson/reference pages render `<Shell>` + breadcrumb + `<article class="lesson-prose">{content}</article>`. A `"use client"` `error.tsx` in the lesson segment is the backstop; `mdx.ts` also catches compile errors and returns a panel. No `rehype-raw` (raw `<script>` in MDX never executes).

### Removals
Delete `hub/src/app/raw/[topic]/[kind]/[file]/route.ts` and `hub/src/components/viewer.tsx`. Their path-safety responsibility moves to `resolveDocFile` (retained).

### Skill + docs
SKILL.md: lessons/references become MDX using only the palette; document the frontmatter schema and each component's props; lessons are viewed at the hub URL (dev server must be running); cross-links are hub/root-relative. README updated. ADR-0002 supersedes ADR-0001 with the reversal rationale; the "what would reverse this" clause in ADR-0001 (scoped fragments / skill change) is exactly what happened.

## Risks / Mitigations

- **Reversal of the "optional hub" guarantee** → made explicit in the spec (REMOVED requirement) and ADR-0002; the user confirmed at plan approval. Provider-agnostic generation is preserved.
- **MDX compile errors at runtime** → `try/catch` in `mdx.ts` + segment `error.tsx`; one broken lesson shows a panel, siblings unaffected.
- **Next 16 API drift** → re-verify `next-mdx-remote/rsc` usage and route-segment config against the bundled docs before coding.
- **Losing bespoke per-lesson design** → the palette + themed element overrides reproduce the current look; lessons gain consistency at the cost of arbitrary per-lesson CSS (accepted).
- **Teaching now needs the hub running** → SKILL.md states the prerequisite and tells the user to start it if the lesson URL is unreachable.
