# Spec Delta: lesson-hub

## ADDED Requirements

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
