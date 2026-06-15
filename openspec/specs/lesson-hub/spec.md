# lesson-hub Specification

## Purpose
TBD - created by archiving change add-lesson-hub. Update Purpose after archive.
## Requirements
### Requirement: The hub is optional and additive

The hub SHALL be confined to `hub/` and SHALL NOT be required for the original experience (agent CLI + HTML lessons + Anki). The teach skill, the `topics/` content formats, the agent MCP/instruction configs, and the Anki setup SHALL function identically whether or not the hub is installed or run. Node SHALL be a prerequisite only for running the hub.

#### Scenario: User never uses the hub

- **WHEN** a user clones the repository and uses only the agent CLI, HTML lessons, and Anki, without installing or running anything in `hub/`
- **THEN** every part of that flow SHALL work unchanged, and no instruction in the core setup SHALL require Node or the hub

#### Scenario: Existing clone pulls the change

- **WHEN** a user with an existing clone pulls this change
- **THEN** their existing topics, lessons, and Anki integration SHALL continue to work with no migration step

### Requirement: Local hub application

The repository SHALL contain a `hub/` Next.js application that runs locally (`npm run dev` inside `hub/`), binds to localhost, and reads all content from the repository's `topics/` directory at request time. Learning data SHALL NOT leave the machine.

#### Scenario: Fresh content without rebuild

- **WHEN** a new lesson, reference, learning record, or topic folder is written to `topics/` while the hub is running
- **THEN** it SHALL appear in the hub on the next page load, without restarting or rebuilding the app

#### Scenario: Clone and run

- **WHEN** a user clones the repository on a machine with Node ≥ 20 and runs `npm install && npm run dev` inside `hub/`
- **THEN** the hub SHALL serve their `topics/` content with no further configuration

### Requirement: Lessons and references served verbatim

Lesson and reference HTML files SHALL be served byte-identical to the files on disk via routes with slug parameters, and the hub SHALL present them inside a viewer that adds hub navigation without modifying the document. File access SHALL be restricted to `topics/{topic}/lessons/` and `topics/{topic}/reference/`.

#### Scenario: Lesson renders as authored

- **WHEN** the user opens a lesson through the hub
- **THEN** the lesson SHALL render with its own styling and its interactive elements (quizzes) SHALL work, identical to opening the file directly, with a hub bar available to navigate back

#### Scenario: Path traversal is blocked

- **WHEN** a request's slug or file parameter resolves outside `topics/`
- **THEN** the hub SHALL reject the request and serve no file content

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

