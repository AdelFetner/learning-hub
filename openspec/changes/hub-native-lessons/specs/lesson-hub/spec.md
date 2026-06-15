# Spec Delta: lesson-hub

## REMOVED Requirements

### Requirement: The hub is optional and additive

**Reason:** Reversed by deliberate decision. The hub becomes the *primary* way to view lessons: lessons are authored as MDX and rendered only by the hub, so they are no longer openable as standalone files and the hub (Node) is required to view them, including during a teaching session. Provider-agnostic *generation* is unaffected — any agent still authors lessons by following the teach skill.

### Requirement: Lessons and references served verbatim

**Reason:** Replaced by "Lessons and references rendered natively from MDX" (below). Lessons are no longer byte-identical HTML in an iframe; they are MDX compiled and rendered inside the hub.

## MODIFIED Requirements

### Requirement: Local hub application

The repository SHALL contain a `hub/` Next.js application that runs locally (`npm run dev` inside `hub/`), binds to localhost, and reads all content from the repository's `topics/` directory **at request time**. It is the primary interface for viewing lessons. Learning data SHALL NOT leave the machine, and `topics/` SHALL remain git-ignored (see "User learning data is private and untracked").

#### Scenario: Fresh content without rebuild

- **WHEN** a new lesson, reference, learning record, or topic folder is written to `topics/` while the hub is running
- **THEN** it SHALL appear in the hub on the next page load, without restarting or rebuilding the app

#### Scenario: Clone and run

- **WHEN** a user clones the repository on a machine with Node ≥ 20 and runs `npm install && npm run dev` inside `hub/`
- **THEN** the hub SHALL serve their `topics/` content with no further configuration

## ADDED Requirements

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
