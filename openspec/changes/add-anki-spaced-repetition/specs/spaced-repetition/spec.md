# Spec Delta: spaced-repetition

## ADDED Requirements

### Requirement: Workspace Anki state

Each teaching workspace SHALL track its Anki integration state in an `ANKI.md` file at the workspace root, per `ANKI-FORMAT.md`: the workspace deck name, note-type choices, a provenance map (Anki note IDs ↔ source lesson or glossary term), a pending-cards queue, and user preferences including an Anki opt-out.

#### Scenario: First lesson's cards initialize state

- **WHEN** the first cards for a workspace are created and no `ANKI.md` exists
- **THEN** the agent SHALL create `ANKI.md` per `ANKI-FORMAT.md`, create the top-level deck `{Topic}` in Anki (never nested under a shared parent deck), and record the new note IDs and their source in the provenance map

#### Scenario: User has opted out

- **WHEN** `ANKI.md` records that the user opted out of Anki
- **THEN** the agent SHALL NOT create cards or contact the Anki MCP server, and SHALL continue the traditional teach flow

### Requirement: Cards ship with the lesson

WHEN a lesson is generated or a glossary term is promoted, the agent SHALL create the corresponding Anki cards immediately and SHALL list them in a "Cards from this lesson" section at the end of the lesson HTML. The learner MAY ask to edit or remove any card at any time, and the agent SHALL honor that immediately, mirroring the change in `ANKI.md`. Cards SHALL follow the minimum-information principle (one fact per card), use built-in note types (cloze for syntax and sequences, basic/reversed for term ↔ definition, basic otherwise), give no formatting clues to answers, and be tagged `teach::{workspace-slug}` plus `lesson-NNNN` or `glossary`.

#### Scenario: Lesson generation creates cards

- **WHEN** the agent generates a lesson
- **THEN** the agent SHALL create the lesson's cards via `add_notes` in the same step and list them at the end of the lesson HTML

#### Scenario: Glossary promotion creates a card

- **WHEN** a term is promoted to `GLOSSARY.md`
- **THEN** the agent SHALL create a basic-and-reversed card pairing the term with its glossary definition

#### Scenario: Learner removes a card

- **WHEN** the learner asks to edit or remove a card
- **THEN** the agent SHALL apply the change in Anki immediately and update the `ANKI.md` provenance map accordingly

### Requirement: Session-start feedback loop

WHEN a teach session starts and the Anki MCP server is reachable, the agent SHALL read the workspace deck's due counts, lapse counts, and FSRS memory state, and SHALL factor weak cards into the zone-of-proximal-development calculation alongside learning records.

#### Scenario: Due and weak cards inform the diagnosis

- **WHEN** a session starts and the workspace deck has due cards or cards with weak FSRS memory state
- **THEN** the agent SHALL mention this state in its session diagnosis and weigh the affected material when choosing what to teach next

#### Scenario: Leeching card triggers a re-teach

- **WHEN** a card in the workspace deck is lapsing repeatedly (leeching)
- **THEN** the agent SHALL trace the card to its source material via the provenance map, re-teach that material using a different mental model than the original lesson, and write a learning record when the misconception is resolved

### Requirement: Review boundary

Reviews SHALL happen in the Anki app. The agent SHALL read Anki state and create or edit cards, but SHALL NOT run reviews (no `rate_card`) during a teach session by default, so that Anki's scheduler remains the single source of truth for spacing.

#### Scenario: No rating during teaching

- **WHEN** the agent is teaching and the workspace deck has due cards
- **THEN** the agent SHALL direct the learner to review in the Anki app and SHALL NOT rate cards itself

### Requirement: Graceful degradation

WHEN the Anki MCP server is unreachable (Anki closed or add-on missing), the agent SHALL state this once, continue the traditional teach flow, and park new cards in the `ANKI.md` pending-cards queue. WHEN a later session finds the server reachable and the pending queue is non-empty, the agent SHALL flush the queue (add the cards, record provenance, clear the queue) before new teaching work.

#### Scenario: Anki closed during a session

- **WHEN** a lesson's cards are created while the MCP server is unreachable
- **THEN** the agent SHALL append the cards to the `ANKI.md` pending queue and mention the queueing once, without repeating the warning

#### Scenario: Queue flush on reconnect

- **WHEN** a session starts, the server is reachable, and `ANKI.md` has pending cards
- **THEN** the agent SHALL add the pending cards to Anki, record their note IDs in the provenance map, and clear the queue

### Requirement: Portable setup

The repository SHALL carry a project-scoped `.mcp.json` registering the Anki MCP server at `http://127.0.0.1:3141/`, and a root `README.md` that walks a new user through setup: install Anki ≥ 25.07, install add-on `124672614`, restart Anki, clone the repository, and run `/teach` in Claude Code.

#### Scenario: Fresh machine setup

- **WHEN** a new user clones the repository and follows the README on a machine with Anki ≥ 25.07 and the add-on installed
- **THEN** opening Claude Code in the repository SHALL expose the `anki` MCP server without further configuration

#### Scenario: Troubleshooting an unreachable server

- **WHEN** the user follows the README troubleshooting section because the agent reports Anki as unreachable
- **THEN** the README SHALL explain that the MCP server only runs while the Anki application is open
