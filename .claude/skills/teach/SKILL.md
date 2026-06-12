---
name: teach
description: Teach the user a new skill or concept, within this workspace.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

This is a pointer, not the skill: the canonical definition lives in the provider-neutral skills directory (a real directory is used here instead of a git symlink so Windows checkouts work).

Read [.agents/skills/teach/SKILL.md](../../../.agents/skills/teach/SKILL.md) and follow it exactly. Resolve every relative link in that file (MISSION-FORMAT.md, ANKI-FORMAT.md, etc.) against `.agents/skills/teach/`, not against this directory.
