# Monimemo

The **hub** for [learning-hub](../README.md): a local, **read-only** Next.js app that renders your lessons and browses your topics, references, learning records, and live Anki stats. It reads the repo's `topics/` directory at request time and never writes anything — not your lessons, not your Anki cards.

> Working on this app with an AI agent? Read [AGENTS.md](AGENTS.md) first: this Next.js version has breaking changes from older releases, and the bundled docs in `node_modules/next/dist/docs/` are the source of truth.

## Run it

Needs [Node.js](https://nodejs.org/) 20+.

```bash
npm install   # first time only
npm run dev
```

Open <http://localhost:3000> and click into a topic, or go straight to a lesson at `http://localhost:3000/topics/{topic}/lessons/{file}.mdx`. The hub reads `../topics` live — new lessons appear on refresh, no rebuild. Keep Anki open to see review stats (it degrades to "Anki closed" otherwise).

## How it works

- **Stack** — Next.js (App Router, React Server Components, Node runtime), React 19, Tailwind CSS v4, and shadcn re-themed to a warm-paper editorial palette. MDX is compiled with `next-mdx-remote/rsc`.
- **Content source** — everything is read from the repo's `topics/` folder (one level up from `hub/`) at request time; see [src/lib/content.ts](src/lib/content.ts). Topics, lessons, references, learning records, missions, and each topic's Anki deck name are parsed straight from the files. Path access is sandboxed to `topics/{topic}/{lessons,reference}` against traversal.
- **Lessons are MDX, rendered natively** — each `.mdx` is compiled at request time ([src/lib/mdx.ts](src/lib/mdx.ts)) using a **fixed component palette** (`Kicker`, `Lede`, `Callout`, `Primary`, `Cards`/`Card`, `Quiz`/`Q`) plus themed Markdown element overrides ([src/components/lesson/](src/components/lesson/)). Lessons carry no `<style>`, `<script>`, or `import`; `rehype-raw` is deliberately off, so raw HTML/script in a lesson never executes. Quizzes are an interactive client component the hub provides ([quiz.tsx](src/components/lesson/quiz.tsx)) — lessons author no JS. This replaced the old iframe'd self-contained-HTML approach; see [ADR-0002](../docs/adr/0002-render-lessons-natively-as-mdx.md).
- **Graceful failure** — an MDX compile error renders an inline panel (HTTP 200) via [doc-view.tsx](src/components/doc-view.tsx); a render-time error is caught by the segment [error.tsx](src/app/topics/[topic]/lessons/[lesson]/error.tsx) boundary. A broken lesson never takes down the hub or its siblings.
- **Read-only Anki stats** — [src/lib/anki.ts](src/lib/anki.ts) connects to the AnkiMCP add-on at `http://127.0.0.1:3141/` and calls **only** `list_decks` (cached, short timeout). It maps topics to decks via each topic's `ANKI.md` and shows due/new/retention counts. It never creates, modifies, rates, or deletes anything in Anki; scheduling stays in the Anki app.

### Routes

| Route | Page |
|---|---|
| `/` | Overview — summary stats, topic cards, recent lessons |
| `/topics/{topic}` | Topic — mission, lessons (`NNNN` order), references, learning records |
| `/topics/{topic}/lessons/{file}.mdx` | Lesson viewer |
| `/topics/{topic}/references/{file}.mdx` | Reference viewer |

## Environment variables

All optional — the defaults match a normal clone.

| Variable | Default | Purpose |
|---|---|---|
| `TOPICS_DIR` | `../topics` | Where to read content from |
| `ANKI_MCP_URL` | `http://127.0.0.1:3141/` | AnkiMCP add-on address |

## UX audit

`scripts/ux-audit.mjs` drives the running hub with Playwright + axe-core to catch visual, interaction, and accessibility regressions. It screenshots every page type at desktop/tablet/mobile, exercises the empty-topic and 404 states, clicks through a lesson's quiz to the score summary, and runs WCAG 2 A/AA checks — printing a report and a screenshot directory.

Start the dev server first, then:

```bash
npm run ux-audit
```

Override targets with `HUB_BASE`, `AUDIT_TOPIC`, and `AUDIT_EMPTY_TOPIC` (the defaults assume the sample `http-status-codes` topic exists in `topics/`).
