# learning-hub

A stateful personal-learning repo: an AI agent teaches a learner over many sessions, lessons accrue as files, and Anki schedules their long-term recall. A local web hub browses it all.

## Language

**Topic**:
The unit of learning — one subject the learner is pursuing, with a single mission. Lives as one folder under `topics/`. This is the canonical, user-facing term.
_Avoid_: subject, course, workspace (as a user-facing label)

**Workspace**:
The teach skill's internal name for a topic's folder and its state files. Same thing as a topic, seen from the skill's side.
_Avoid_: using interchangeably with "topic" in user-facing UI

**Deck**:
A topic's projection into Anki — a single top-level Anki deck named after the topic, holding that topic's cards. One topic, one deck.
_Avoid_: collection (that is Anki's word for all decks together)

**Lesson**:
One MDX file under a topic's `lessons/`, teaching one tightly-scoped thing — Markdown plus a fixed component palette, rendered natively by the hub (it owns the styling). The primary unit of teaching. Numbered `NNNN`.
_Avoid_: calling lessons "HTML" — that was the pre-MDX format (see [ADR-0002](docs/adr/0002-render-lessons-natively-as-mdx.md)).

**Mission**:
The reason the learner is pursuing a topic; one per topic, in `MISSION.md`. Grounds every teaching decision.

**Learning record**:
A durable note (`learning-records/NNNN-*.md`) capturing a non-obvious insight, demonstrated understanding, or corrected misconception — the equivalent of an ADR for the learner's knowledge.

**Card**:
A single Anki note created from a lesson or glossary term. Spacing is owned by Anki, never by the agent or the hub.

**Hub**:
The local Next.js web app (`hub/`) that browses topics, lessons, references, and records, and surfaces read-only Anki stats. A reader, never a writer.
