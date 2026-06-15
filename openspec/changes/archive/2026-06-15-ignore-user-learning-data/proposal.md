# Ignore User Learning Data

## Why

A user's learning lives under `topics/` — missions, lessons, references, learning records, Anki state. That is *personal data*, not part of the product. During the hub work a test topic (`topics/http-status-codes`) was committed, and `topics/` is not git-ignored, so a user's private lessons leak into version control and into anyone who clones. The owner wants his own learning kept out of git, and the repo to ship the *product* (skill, hub, agent configs, docs) without anyone's personal content.

Note: the committed per-tool MCP configs (`.mcp.json`, `.cursor/mcp.json`, etc.) are **not** in scope — they point at `http://127.0.0.1:3141/`, identical on every machine, and are the intentional clone-and-go feature. The only thing that leaked is learning content under `topics/`.

## What Changes

- Add `topics/` to the root `.gitignore` (all user learning data is private and untracked).
- Add common OS/editor cruft to `.gitignore` (`.DS_Store`, `Thumbs.db`, `*.log`) — the partner may be on macOS.
- Untrack the previously committed test topic: `git rm -r --cached topics/http-status-codes` (the files stay on disk).
- Confirm `.claude/settings.local.json` remains ignored (it already is and was never tracked).

## Impact

- Affected specs: `lesson-hub` (one ADDED requirement: user learning data is private and untracked).
- Affected files: `.gitignore` (root). No application code changes.
- A fresh clone ships with no topics; the hub already handles the empty state ("No topics yet"). Existing local topics are unaffected on disk — they simply stop being tracked.
- No conflict with the provider-agnostic setup: the committed agent/MCP configs stay as they are.
