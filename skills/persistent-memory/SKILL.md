---
name: persistent-memory
description: Cross-session persistent memory system for Claude Code. Saves personal context, decisions, preferences, and key insights to ~/.claude/memory/CORE.md, which is automatically injected into every new session. Use /remember, /recall, and /forget to manage your memory.
origin: ECC
---

# Persistent Memory

A cross-session memory system that gives Claude a persistent knowledge base across every conversation.

## How It Works

```
Session N:    User runs /remember "We use PostgreSQL 15 for all services"
              → Appended to ~/.claude/memory/CORE.md

Session N+1:  SessionStart hook fires
              → session-start.js reads ~/.claude/memory/CORE.md
              → Injects full memory as additionalContext
              → Claude starts session already knowing the PostgreSQL decision
```

Every new session automatically loads the full memory. No manual loading required.

## Setup

```bash
# One-time initialization
node scripts/setup-memory.js

# This creates:
# ~/.claude/memory/CORE.md       ← main memory store
# ~/.claude/memory/projects/     ← per-project memories
# ~/.claude/memory/topics/       ← topic-specific knowledge
# ~/.claude/memory/.gitignore    ← keeps memory local (never committed)
```

## Commands

| Command | Usage |
|---------|-------|
| `/remember [text]` | Save something to long-term memory |
| `/recall [query]` | Search and display memory entries |
| `/forget [text]` | Remove an outdated or wrong memory |

## Memory Structure

```markdown
# ~/.claude/memory/CORE.md

## 👤 Persönliche Informationen
- [2025-03-27] Ich arbeite als Senior Developer, Fokus auf Backend und Infra

## 🎯 Aktive Ziele & Projekte
- [2025-03-15] Projekt Atlas: Migration von Rails zu Go, Ziel Q2 2026
- [2025-03-01] Aufbau eines internen AI-Tooling-Stacks mit Claude Code

## 🏗️ Architektur-Entscheidungen
- [2025-02-10] PostgreSQL 15 + PgBouncer für alle Services
- [2025-01-20] Event-Driven via Kafka für alle async Workflows
- [2025-01-05] TypeScript strict mode in allen neuen Services

## ⚙️ Arbeitsweisen & Präferenzen
- [2025-03-10] Immer conventional commits (feat/fix/chore/docs)
- [2025-02-15] Tests vor Implementierung (TDD)
- [2025-01-30] Kleine, atomare PRs — ein logischer Change pro PR

## 💡 Schlüssel-Erkenntnisse
- [2025-03-20] Auth-Modul hat bekannte Race Condition bei concurrent logins
- [2025-02-28] Die Batch-API spart 50% Kosten bei nicht-zeitkritischen Tasks

## 📝 Session-Verlauf
- [2025-03-27] Setup des ECC-Systems, 7 Mastery-Skills erstellt
- [2025-03-27] Persistentes Gedächtnissystem eingerichtet

## 🔗 Wichtige Ressourcen
- [2025-03-01] Skilljar Kurs: https://anthropic.skilljar.com/ (Login erforderlich)
```

## What to Save

**Save with `/remember`:**
- Technical decisions that affect future work
- Project context that would take time to re-explain
- Personal working preferences
- Key insights about your codebase
- Ongoing goals and open tasks

**Don't save:**
- Temporary session-specific context (use session files instead)
- Code (reference file paths instead)
- Secrets or credentials
- Things that change every day

## Why It's Better Than Repeating Context

Without memory: every new chat starts cold.
```
You: "We use PostgreSQL 15 with PgBouncer..."
You: "Our API rate limit is..."
You: "I prefer conventional commits..."
→ 10 minutes of context-setting every single time
```

With memory: context is automatic.
```
New session → session-start.js reads CORE.md → Claude already knows
You: Start working immediately
```

## Integration with Continuous Learning

The persistent memory system complements `continuous-learning-v2`:

| System | What it stores | How it's stored |
|--------|---------------|-----------------|
| `persistent-memory` | Explicit, user-curated facts and decisions | `~/.claude/memory/CORE.md` |
| `continuous-learning-v2` | Auto-extracted behavioral patterns (instincts) | `~/.claude/homunculus/` |
| `session-end.js` | Short-term session summaries (7-day window) | `~/.claude/sessions/` |

Together they form a complete memory system:
- **Long-term facts** → CORE.md (permanent, curated)
- **Behavioral patterns** → instincts (auto-extracted, probabilistic)
- **Short-term context** → session files (rolling 7-day window)

## File Location & Privacy

```
~/.claude/memory/        ← local only, never committed
  CORE.md                ← main memory (loaded every session)
  CORE.md.bak            ← auto-backup before each modification
  projects/              ← project-specific memories
  topics/                ← topic knowledge bases
  .gitignore             ← ensures memory stays local
```

Memory is **local only** — never synced, never committed, never shared.

## Advanced: Project-Scoped Memory

For project-specific facts, create dedicated memory files:

```bash
# Create project-specific memory
cat > ~/.claude/memory/projects/my-project.md << 'EOF'
# Project: my-project

## Architecture
- Monorepo with 3 services: api, worker, frontend
- PostgreSQL main DB, Redis cache, Kafka events

## Known Issues
- Auth service has intermittent 503s under high load (ticket #342)

## Conventions
- All APIs versioned at /api/v1/
- Error format: { error: string, code: string, details?: any }
EOF
```

Then reference it in `/remember`:
```
/remember Project my-project has its own memory file at ~/.claude/memory/projects/my-project.md
```

## Troubleshooting

**Memory not loading in new sessions:**
```bash
# Verify the file exists
ls ~/.claude/memory/CORE.md

# Verify content (should not be all-template)
cat ~/.claude/memory/CORE.md

# Re-run setup if needed
node scripts/setup-memory.js
```

**Memory file has stale entries:**
```
/recall [topic]    ← find the entries
/forget [text]     ← remove specific entries
/remember [new]    ← add updated version
```
