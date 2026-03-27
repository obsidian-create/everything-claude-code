---
name: claude-mem
description: Persistent memory system for Claude Code — preserves context across sessions via hooks, SQLite, and vector search. Use when setting up cross-session memory or understanding how session context is captured.
origin: https://github.com/thedotmack/claude-mem
---

# Claude-Mem

Persistent memory system for Claude Code. Automatically captures tool observations, generates semantic summaries, and makes them retrievable in future sessions.

## Architecture

| Component | Role |
|-----------|------|
| 5 lifecycle hooks | Capture observations at key session events |
| Worker service (HTTP) | Background processing + web UI at `localhost:37777` |
| SQLite + FTS5 | Persistent storage with full-text search |
| Chroma vector DB | Hybrid semantic + keyword search |
| MCP tools | `search`, `timeline`, `get_observations` |

## Lifecycle Hooks

| Hook | Trigger | Action |
|------|---------|--------|
| `Setup` | Plugin install | Run `setup.sh`, install dependencies |
| `SessionStart` | Session starts (startup/clear/compact) | `smart-install.js` → start worker → inject context |
| `UserPromptSubmit` | Every user message | `session-init` — initialize session tracking |
| `PostToolUse` | After every tool call | `observation` — capture and compress tool output |
| `Stop` | Agent stops | `summarize` — generate session summary |
| `SessionEnd` | Session ends | `session-complete` — finalize and persist |

## 3-Layer Memory Retrieval

See the `mem-search` skill for the full workflow. Summary:

1. **search** — get lightweight index (~50–100 tokens/result)
2. **timeline** — get chronological context around a point
3. **get_observations** — fetch full details for selected IDs only

Never skip to Step 3 without filtering in Steps 1–2.

## Privacy Controls

Wrap sensitive content in `<private>` tags — it will be excluded from memory capture:

```
<private>
API_KEY=sk-...
</private>
```

## Installation

```
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

Requirements: Node.js 18+, Claude Code with plugin support, Bun (auto-installed), SQLite 3 (bundled), uv (for Python/Chroma).

## Web UI

Memory stream viewable at `http://localhost:37777` while a session is active.

## Citation

Reference past observations in prompts using their ID:

```
Based on observation #11131, continue the authentication work...
```

## Notes

- The npm package alone does not register hooks — must install via plugin system
- Memory is project-scoped; use `project=` parameter in MCP tools to filter
- AGPL-3.0 license (ragtime directory: PolyForm Noncommercial)
