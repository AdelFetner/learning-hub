# Hub-Native MDX Lessons

## Why

The hub currently embeds each lesson's self-contained HTML in an `<iframe>` ([ADR-0001](../../../docs/adr/0001-serve-lessons-verbatim-in-iframe.md)). That was the right call *while lessons had to stay openable without the hub* — but the owner has decided the hub should be the **primary** way to view lessons, and that lessons are private data the hub renders (see `ignore-user-learning-data`). With that constraint relaxed, the iframe is no longer the best boundary: it can't be styled by the hub, the lesson and hub are two disconnected documents, and interactivity rides on per-lesson inline `<script>`. Rendering lessons **natively** removes that seam, lets the hub own typography and interactivity, and makes lessons first-class pages.

This is a deliberate **reversal** of ADR-0001 and of the `lesson-hub` "hub is optional / served verbatim" requirements. Provider-agnostic *generation* is unaffected — any AI agent still authors lessons by following the teach skill; only the lesson **format** (HTML → MDX) and the **viewer** (iframe → native render) change.

## What Changes

- **Lesson format → MDX.** The teach skill authors lessons as `topics/{topic}/lessons/NNNN-*.mdx` and references as `reference/*.mdx`: Markdown plus a **fixed, hub-provided component palette** (`<Kicker> <Lede> <Callout> <Primary> <Cards> <Quiz>/<Q>`). No `<style>`, no `<script>`, no `import` — the hub owns styling and interactivity.
- **Native request-time rendering.** The hub compiles each `.mdx` at request time (`next-mdx-remote/rsc`, RSC, Node runtime) with the component map and the editorial theme; no iframe. The `/raw` route and the iframe viewer are removed.
- **Interactivity as a vetted component.** Quizzes become the hub's `<Quiz>/<Q>` client component (scoring/feedback in React), not lesson-authored JS.
- **Graceful failure.** A malformed lesson renders a friendly error panel (never a 500) and never breaks sibling lessons.
- **Hub becomes a teaching prerequisite.** Lessons are viewed at `http://localhost:3000/topics/{topic}/lessons/{slug}`; the teach skill points the user there and notes the hub dev server must be running.
- **Hub UX fixes (bundled):** the sidebar "Monimemo" brand becomes a link to the hub home; Playwright MCP is used (added locally, not committed) to drive the running hub and fix further UX gaps.
- **Migration:** the existing `http-status-codes` lesson is regenerated as `.mdx` to prove the pipeline (it is git-ignored either way).

## Impact

- Affected specs: `lesson-hub` — REMOVE "hub is optional and additive"; MODIFY "served verbatim in an iframe" → "rendered natively from MDX"; MODIFY "Local hub application" (content is MDX, hub required to view lessons); ADD "graceful lesson rendering."
- Affected code: `hub/` — new `src/lib/mdx.ts`, `src/components/lesson/*` (palette + `quiz.tsx`); rewritten lesson/reference pages + `error.tsx`; updated `src/lib/content.ts`; deleted `src/app/raw/.../route.ts` and `src/components/viewer.tsx`; `globals.css` (`.lesson-prose` + print styles); `src/components/sidebar.tsx` (brand link). New deps: `next-mdx-remote`, `remark-gfm`, `gray-matter`.
- Affected skill: `.agents/skills/teach/SKILL.md` — MDX lesson/reference format, component palette + frontmatter schema, hub-URL viewing + dev-server prerequisite, cross-links as hub URLs.
- Docs: supersede ADR-0001 with ADR-0002 (the reversal + rationale); update `README.md` (the hub is now how you view lessons; lessons are MDX).
- **Breaking for the workflow:** you can no longer open a lesson as a standalone file; the hub must be running to view lessons. This is the conscious trade for native rendering.
