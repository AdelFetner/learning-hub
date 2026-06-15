# 0001 — Serve lessons verbatim in an iframe

Status: **superseded by [ADR-0002](0002-render-lessons-natively-as-mdx.md) (2026-06-15)**. The "what would reverse this" clause below is exactly what happened: lessons were changed to a hub-rendered format, so the iframe boundary was removed.

## Context

Lessons are produced by the teach skill as **complete, self-contained HTML documents** under `topics/{topic}/lessons/`. Each one:

- styles the document itself with global selectors — `body`, `*`, `:root`, and bare element selectors (`h1`, `table`, `a`) — assuming it owns the page;
- ends with a `<script>` that owns the global scope and the document (`let answered = 0; const qs = document.querySelectorAll('.q')`) to drive an interactive quiz;
- is designed to also open directly from the filesystem in a browser, as a standalone artifact.

The hub must display these lessons inside its own chrome (a back bar, hub navigation) without breaking their styling or their quizzes, and without coupling the hub to the internal markup of any given lesson.

## Decision

Serve each lesson **byte-identical** from a route handler (`Content-Type: text/html`) and embed it in the viewer page via an `<iframe>`. The hub bar sits above the frame; the frame fills the remaining viewport and the lesson scrolls within its own document. Nothing is injected into the lesson; nothing is rewritten.

## Alternatives considered

- **Inline via `dangerouslySetInnerHTML` into a hub page.** Rejected: the lesson's global CSS (`body`, `*`, `:root`, …) would restyle the entire hub (CSS bleed), and React does not run injected `<script>` tags, so the quiz dies — and re-running it leaks the lesson's globals into the hub and queries the hub's DOM.
- **Shadow DOM.** Rejected: shadow roots have no `body`/`:root`, so the lesson's document-level CSS does not match and its layout collapses; injected scripts still do not execute, and the lesson's `document.querySelectorAll` cannot see into the shadow root. Making it work requires rewriting every lesson's CSS and JS.
- **Rebuild lessons as native React pages.** Rejected (earlier, by the learner): requires the teach skill to emit structured content instead of self-contained HTML — a much larger change — and breaks the standalone-file property.

## Consequences

- **Exact fidelity, zero coupling.** Any HTML the teach skill emits renders correctly; the hub never parses or depends on lesson internals.
- **Isolation for free.** The lesson's CSS and JS globals cannot bleed into the hub, and vice versa.
- **Costs accepted.** Lesson bodies are not server-rendered or hub-styled (irrelevant for a local, single-user app); the back bar lives outside the frame (by design); the frame is full-height so the lesson scrolls inside itself (no height-measuring hacks).
- **What would reverse this:** if lessons were ever authored as scoped *fragments* (no `<html>/<head>/<body>`, class-scoped CSS, no global script), in-page React rendering would become the better choice. That is a teach-skill change, explicitly out of scope.
