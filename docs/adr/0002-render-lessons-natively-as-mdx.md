# 0002 — Render lessons natively as MDX

Status: accepted (2026-06-15). Supersedes [ADR-0001](0001-serve-lessons-verbatim-in-iframe.md).

## Context

ADR-0001 embedded self-contained lesson HTML in an iframe so lessons could stay openable without the hub. The owner has since decided the **hub is the primary way to view lessons** — lessons are private data the hub renders — which removes the constraint that justified the iframe. With that gone, the iframe is the worse boundary: the hub can't style the lesson, the two are disconnected documents, and interactivity rides on per-lesson inline `<script>`.

## Decision

Lessons (and references) are authored as **MDX** under `topics/{topic}/lessons/*.mdx` and rendered **natively** by the hub: compiled at request time with `next-mdx-remote/rsc` `compileMDX`, using a **fixed component palette** (`Kicker`, `Lede`, `Callout`, `Primary`, `Cards`/`Card`, `Quiz`/`Q`) and themed Markdown element overrides. Lessons carry no `<style>`, `<script>`, or `import`; interactivity (quizzes) is a hub-provided client component. No iframe.

Component props use **string attributes only** — MDX strips the properties of object/array literals in attribute position (`items={[{front}]}` compiles to `[{}]`), so structured data is passed via string attributes (`options="a|b|c"`) or string-prop child components (`<Card front="..." back="..." />`).

## Consequences

- **Native, hub-styled rendering**; no embedding seam; interactivity owned by the hub.
- **Lessons are no longer standalone-openable** — the hub (Node) must be running to view a lesson, including during a teaching session. This reverses the `lesson-hub` "optional" guarantee (removed in the `hub-native-lessons` spec delta).
- **Provider-agnostic generation is unaffected** — any agent still authors the MDX by following the teach skill.
- **Graceful failure**: MDX compile errors render an inline panel (HTTP 200); render-time errors are caught by a segment `error.tsx`. A broken lesson never crashes the hub or its siblings. No `rehype-raw`, so raw HTML/script in a lesson never executes.
- **Trade**: lessons lose arbitrary per-lesson HTML/CSS, gaining consistency from the shared palette and theme. Accepted.

## What would reverse this

If lessons needed to be viewable without running the hub again (e.g. shared as standalone artifacts), we would revert to self-contained HTML + the ADR-0001 iframe, or add a static export step that renders each MDX to a standalone HTML file.
