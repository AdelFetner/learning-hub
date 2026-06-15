# lesson-hub Specification

## Purpose
TBD - created by archiving change add-lesson-hub. Update Purpose after archive.
## Requirements
### Requirement: Local hub application

The repository SHALL contain a `hub/` Next.js application that runs locally (`npm run dev` inside `hub/`), binds to localhost, and reads all content from the repository's `topics/` directory **at request time**. It is the primary interface for viewing lessons. Learning data SHALL NOT leave the machine, and `topics/` SHALL remain git-ignored (see "User learning data is private and untracked").

#### Scenario: Fresh content without rebuild

- **WHEN** a new lesson, reference, learning record, or topic folder is written to `topics/` while the hub is running
- **THEN** it SHALL appear in the hub on the next page load, without restarting or rebuilding the app

#### Scenario: Clone and run

- **WHEN** a user clones the repository on a machine with Node ≥ 20 and runs `npm install && npm run dev` inside `hub/`
- **THEN** the hub SHALL serve their `topics/` content with no further configuration

### Requirement: Hub navigation

The hub SHALL provide an overview page (summary stats, topic cards, recent lessons) and a per-topic page showing the topic's mission, its lessons in `NNNN` order, its reference documents, and its learning records. The sidebar SHALL link the overview and each topic; flat cross-topic index pages are out of scope for v1.

#### Scenario: Overview lists topics

- **WHEN** the user opens the hub root
- **THEN** every folder under `topics/` SHALL appear as a topic card with its mission summary and lesson count, alongside summary stats and the most recent lessons across topics

#### Scenario: Topic page shows the workspace

- **WHEN** the user opens a topic page
- **THEN** the rendered `MISSION.md`, the ordered lesson list, the reference documents, and the learning-records timeline SHALL be shown

### Requirement: Read-only Anki stats

WHEN the AnkiMCP server at `http://127.0.0.1:3141/` is reachable, the hub SHALL display per-topic due/new card counts (mapping topics to decks via each workspace's `ANKI.md`) and an overall due count. The hub SHALL call only read tools and SHALL NOT create, modify, rate, or delete anything in Anki.

#### Scenario: Anki open

- **WHEN** Anki is open with the add-on running
- **THEN** topic cards and the overview SHALL show current due/new counts for each topic that has a deck recorded in its `ANKI.md`

#### Scenario: Anki closed

- **WHEN** the AnkiMCP server is unreachable
- **THEN** the hub SHALL show a quiet "Anki closed" indicator and all pages SHALL render normally without stats

#### Scenario: Topic without a deck

- **WHEN** a topic has no `ANKI.md` or no parseable deck name
- **THEN** the topic SHALL render without an Anki badge and without errors

### Requirement: User learning data is private and untracked

A user's learning data under `topics/` — missions, lessons, references, learning records, and Anki state — SHALL be treated as private and SHALL NOT be committed to the repository. The repository SHALL git-ignore `topics/` so that a clone ships the product (teach skill, hub, agent/MCP configs, docs) without anyone's personal learning content.

#### Scenario: Generated content is not committed

- **WHEN** the teach skill (or the user) writes lessons, references, records, or Anki state under `topics/`
- **THEN** those files SHALL be git-ignored and SHALL NOT appear as tracked changes

#### Scenario: A previously committed topic is untracked

- **WHEN** the repository already tracks a topic under `topics/`
- **THEN** that topic SHALL be removed from version control (kept on disk) and thereafter ignored

#### Scenario: Fresh clone has no learning data

- **WHEN** a new user clones the repository
- **THEN** no `topics/` content SHALL be present, and the hub SHALL render its empty state until the user creates topics

### Requirement: Lessons and references rendered natively from MDX

Lessons and references SHALL be authored as MDX files (`topics/{topic}/lessons/NNNN-*.mdx`, `topics/{topic}/reference/*.mdx`) and rendered **natively** by the hub — compiled at request time and displayed inside the hub's own layout and typography, not embedded in an iframe. Lessons SHALL use only a fixed, hub-provided component palette and SHALL NOT carry their own `<style>`, `<script>`, or `import`; interactivity (e.g. quizzes) SHALL be provided by hub components. File access SHALL be restricted to `topics/{topic}/lessons/` and `topics/{topic}/reference/`.

#### Scenario: Lesson renders natively in the hub

- **WHEN** the user opens a lesson through the hub
- **THEN** the lesson SHALL render inside the hub layout with the hub's typography, and any quiz SHALL be interactive via the hub's quiz component — with no iframe

#### Scenario: Path traversal is blocked

- **WHEN** a request's slug or file parameter resolves outside `topics/`
- **THEN** the hub SHALL reject the request and serve no content

### Requirement: Graceful lesson rendering

A malformed or failing lesson/reference SHALL NOT crash the hub or affect other lessons. When MDX compilation or rendering fails, the hub SHALL show a contained error message in place of that document and continue to serve every other page normally.

#### Scenario: A broken lesson shows an error panel

- **WHEN** a lesson's MDX fails to compile or render
- **THEN** the hub SHALL display a friendly error panel for that lesson (not an HTTP 500), and all other lessons, references, and pages SHALL continue to render

#### Scenario: Raw scripts do not execute

- **WHEN** an MDX document contains a raw `<script>` or other raw HTML
- **THEN** the hub SHALL NOT execute it (no raw-HTML passthrough); only the fixed component palette provides interactivity

