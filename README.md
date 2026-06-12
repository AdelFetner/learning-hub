# learning-hub

**Stateful learning** — augmented via [Matt Pocock's teach skill](https://www.aihero.dev/learn-anything-with-my-teach-skill) and the [Anki MCP Server](https://github.com/ankimcp/anki-mcp-server-addon).

You tell the AI what you want to learn and *why*. It finds high-trust resources, builds short interactive lessons aimed at your zone of proximal development, and remembers everything between sessions — like a real one-to-one teacher. On top of that, this repo connects the teacher to [Anki](https://apps.ankiweb.net/): when you've genuinely understood something, it proposes flashcards (you approve each one), Anki schedules the spaced repetition, and at the start of every session the teacher reads your review stats to see what's sticking and what needs re-teaching.

## Setup

You need three things: Anki, one Anki add-on, and [Claude Code](https://claude.com/claude-code).

1. **Install Anki** — version 25.07 or newer, from [apps.ankiweb.net](https://apps.ankiweb.net/). (Check yours in Anki under Help → About.)
2. **Install the Anki MCP Server add-on**: in Anki, open **Tools → Add-ons → Get Add-ons…**, paste the code **`124672614`**, click OK, then **restart Anki**. That's it — the add-on runs automatically whenever Anki is open.
3. **Clone this repository** and open Claude Code inside it:

   ```bash
   git clone <this-repo-url> learning-hub
   cd learning-hub
   claude
   ```

   The first time, Claude Code will ask to approve the project's `anki` MCP server — say yes.

## Learning something

Each topic gets its own folder (one mission per workspace):

```bash
mkdir rubiks-cube && cd rubiks-cube
claude
```

Then just say:

```
/teach me how to solve a Rubik's cube
```

The teacher will interview you about your mission, gather resources, and build your first lesson. Next session, run `/teach` again — it picks up exactly where you left off.

Keep Anki open while you learn. When you finish a lesson, the teacher proposes flashcards for what you've learned — approve, edit, or drop each one. Review them in the Anki app whenever they come due (also on your phone, if you sync with [AnkiWeb](https://ankiweb.net/)).

## Troubleshooting

- **"Anki isn't reachable" / cards are being queued** — the MCP server only runs while the Anki app is open. Open Anki and the queued cards will be added at the start of your next session.
- **The add-on doesn't appear / errors on install** — make sure Anki is 25.07 or newer; older versions can't run the add-on.
- **Don't want Anki at all?** Just say so — the teacher records the preference and the rest of the workflow works unchanged.

## How this repo is put together

- `.agents/skills/teach/` — the teach skill (installed from [mattpocock/skills](https://github.com/mattpocock/skills)), customized here with a Spaced Repetition section and an [ANKI-FORMAT.md](.agents/skills/teach/ANKI-FORMAT.md). Note: because of this customization, `SKILL.md` no longer matches the hash in `skills-lock.json` — a future `skills.sh` update may flag or overwrite it.
- `.mcp.json` — registers the Anki MCP server (`http://127.0.0.1:3141/`, the add-on's local address) for every Claude Code session in this repo.
- `openspec/` — the spec-driven change history of this repo, managed with [OpenSpec](https://github.com/Fission-AI/OpenSpec).
