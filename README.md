# learning-hub

**Stateful learning** — augmented via [Matt Pocock's teach skill](https://www.aihero.dev/learn-anything-with-my-teach-skill) and the [Anki MCP Server](https://github.com/ankimcp/anki-mcp-server-addon).

You tell the AI what you want to learn and *why*. It finds high-trust resources, builds short interactive lessons aimed at your zone of proximal development, and remembers everything between sessions — like a real one-to-one teacher. On top of that, this repo connects the teacher to [Anki](https://apps.ankiweb.net/): each lesson creates flashcards for what it taught (you can edit or drop any), Anki schedules the spaced repetition, and at the start of every session the teacher reads your review stats to see what's sticking and what needs re-teaching.

## Setup

You need Anki, one Anki add-on, an AI coding agent, and [Node.js](https://nodejs.org/) 20+ (to run **Monimemo**, the hub that renders your lessons). The walkthrough below uses [Claude Code](https://claude.com/claude-code), but the repo isn't tied to it — see [Using another AI agent](#using-another-ai-agent).

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

Each topic gets its own folder under `topics/` (one mission per topic):

```bash
mkdir -p topics/rubiks-cube && cd topics/rubiks-cube
claude
```

Then just say:

```
/teach me how to solve a Rubik's cube
```

The teacher will interview you about your mission, gather resources, and build your first lesson. Next session, run `/teach` again from the same folder — it picks up exactly where you left off.

Lessons are written as MDX and **viewed in Monimemo**, the hub — so keep it running while you learn (`cd hub && npm run dev`, then open the lesson URL the teacher gives you). See [Viewing your lessons](#viewing-your-lessons-with-monimemo).

Keep Anki open too. Every lesson adds its flashcards to an Anki deck named after the topic — each topic gets its own separate deck — and lists them at the end of the lesson. Ask the teacher to edit or remove any card you don't like. Review them in the Anki app whenever they come due (also on your phone, if you sync with [AnkiWeb](https://ankiweb.net/)).

## Using another AI agent

Nothing here is tied to one AI provider. All learning state is plain files in each topic folder, the teach skill lives in the tool-neutral [`.agents/skills/`](.agents/skills/) directory (the [Agent Skills](https://agentskills.io/) convention), cross-tool instructions live in [`AGENTS.md`](AGENTS.md) (the [AGENTS.md](https://agents.md/) convention), and the Anki add-on is a standard MCP server at `http://127.0.0.1:3141/`. Registration files for the popular agents are already committed, so for most tools it's clone-and-go — different people can even use different agents against the same clone.

| Agent | Anki MCP server | How it finds the teacher |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) | [`.mcp.json`](.mcp.json) (approve once when asked) | `/teach` — skill discovered via `.claude/skills/`, plus `CLAUDE.md` → `AGENTS.md` |
| [opencode](https://opencode.ai/) | [`opencode.json`](opencode.json) | discovers the skill natively from `.agents/skills/`; reads `AGENTS.md` |
| [Codex CLI](https://developers.openai.com/codex/) | [`.codex/config.toml`](.codex/config.toml) (trusted projects only) | reads `AGENTS.md` |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | [`.gemini/settings.json`](.gemini/settings.json) | reads `AGENTS.md` |
| [Cursor](https://cursor.com/) | [`.cursor/mcp.json`](.cursor/mcp.json) | reads `AGENTS.md` |
| [VS Code / Copilot](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) | [`.vscode/mcp.json`](.vscode/mcp.json) | reads `AGENTS.md` |
| [Windsurf](https://windsurf.com/) | global config only — see below | reads `AGENTS.md` |

Most tools ask you to approve or trust a project's MCP servers the first time — say yes to `anki`.

<details>
<summary><b>Windsurf</b> (no per-project MCP file)</summary>

Windsurf only reads MCP servers from your user-level config. Open **Windsurf Settings → Cascade → MCP Servers** (or edit `~/.codeium/windsurf/mcp_config.json`) and add:

```json
{
  "mcpServers": {
    "anki": { "serverUrl": "http://127.0.0.1:3141/" }
  }
}
```

</details>

<details>
<summary><b>Any other agent</b></summary>

Two steps, whatever the tool:

1. Point its MCP configuration at `http://127.0.0.1:3141/` (HTTP / streamable-HTTP transport, no auth).
2. Make sure it reads [`AGENTS.md`](AGENTS.md) — or load [`.agents/skills/teach/SKILL.md`](.agents/skills/teach/SKILL.md) as a skill or instruction file directly.

Everything else — formats, the card-approval flow, Anki state — is described in the skill itself.

</details>

## Viewing your lessons with Monimemo

**Monimemo** is the hub (a local Next.js app) that renders your lessons. Lessons are MDX, rendered natively by the hub — so the hub is how you read them. It also shows your topics, references, learning records, and live Anki review stats.

```bash
cd hub
npm install     # first time only
npm run dev
```

Then open <http://localhost:3000> and click into a topic, or go straight to a lesson at `http://localhost:3000/topics/{topic}/lessons/{file}.mdx`. It reads `topics/` live — new lessons appear on refresh, no rebuild. Keep Anki open to see review stats (it degrades gracefully to "Anki closed" otherwise). The hub is **read-only**: it never changes your lessons or your Anki cards. A lesson that fails to render shows an error panel and never takes down the rest of the hub.

## Troubleshooting

- **"Anki isn't reachable" / cards are being queued** — the MCP server only runs while the Anki app is open. Open Anki and the queued cards will be added at the start of your next session.
- **The add-on doesn't appear / errors on install** — make sure Anki is 25.07 or newer; older versions can't run the add-on.
- **Don't want Anki at all?** Just say so — the teacher records the preference and the rest of the workflow works unchanged.

## How this repo is put together

- `topics/` — **your learning lives here.** One folder per topic, each holding its mission, lessons (`.mdx`), references, learning records, and Anki state. Created as you go (see [Learning something](#learning-something)); git-ignored and empty in a fresh clone — your lessons are private.
- `.agents/skills/teach/` — the teach skill (installed from [mattpocock/skills](https://github.com/mattpocock/skills)), customized here with a Spaced Repetition section and an [ANKI-FORMAT.md](.agents/skills/teach/ANKI-FORMAT.md). Note: because of this customization, `SKILL.md` no longer matches the hash in `skills-lock.json` — a future `skills.sh` update may flag or overwrite it.
- `.claude/skills/` — pointer skills for Claude Code. Each is a real directory whose `SKILL.md` delegates to the canonical copy in `.agents/skills/` (real files instead of git symlinks, so Windows checkouts work without Developer Mode).
- `AGENTS.md` / `CLAUDE.md` — cross-tool agent instructions; `CLAUDE.md` just imports `AGENTS.md` for Claude Code.
- `.mcp.json`, `opencode.json`, `.codex/config.toml`, `.gemini/settings.json`, `.cursor/mcp.json`, `.vscode/mcp.json` — the same Anki MCP server (`http://127.0.0.1:3141/`, the add-on's local address) registered once per agent (see [Using another AI agent](#using-another-ai-agent)).
- `hub/` — **Monimemo**, the local Next.js app that renders your lessons (MDX) and browses `topics/`; read-only. See [Viewing your lessons](#viewing-your-lessons-with-monimemo). Needs Node 20+.
- `openspec/` — the spec-driven change history of this repo, managed with [OpenSpec](https://github.com/Fission-AI/OpenSpec).
