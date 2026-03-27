---
description: Save something permanently to long-term memory. This memory is loaded at the start of EVERY future session across all projects.
---

# /remember

Save important information, decisions, or context to your persistent memory.
This information will be available in every future Claude Code session.

## What to save

Use `/remember` for things that should survive across sessions:

- **Decisions**: "We decided to use Postgres instead of MongoDB for the main DB"
- **Personal context**: "I work at [company], building a SaaS for logistics"
- **Project facts**: "The production server is on AWS eu-central-1"
- **Preferences**: "Always use conventional commits, always test before commit"
- **Key insights**: "The auth module has a known race condition on concurrent logins"
- **Open goals**: "We want to migrate the monolith to microservices by Q3"

## How it works

1. Reads `~/.claude/memory/CORE.md`
2. Identifies the right section for the information
3. Appends a timestamped entry
4. The updated file is loaded automatically at the start of the next session

## Usage

```
/remember We decided to use TypeScript strict mode across all new services
/remember The client's API rate limit is 100 requests per minute per key
/remember I prefer small, atomic commits — one logical change per commit
/remember Project Athena: migration from Rails to Go, target Q2 2026
```

## Instructions

When this command is invoked:

1. Read the content of `~/.claude/memory/CORE.md` (create it first with `node scripts/setup-memory.js` if it doesn't exist at `~/.claude/memory/CORE.md`)
2. Identify the best section for the information based on its nature:
   - Personal/role info → `## 👤 Persönliche Informationen`
   - Active project context → `## 🎯 Aktive Ziele & Projekte`
   - Technical decisions → `## 🏗️ Architektur-Entscheidungen`
   - Working preferences → `## ⚙️ Arbeitsweisen & Präferenzen`
   - Key learnings → `## 💡 Schlüssel-Erkenntnisse`
   - Resources/links → `## 🔗 Wichtige Ressourcen`
3. Append the entry under the appropriate section with a timestamp:
   ```
   - [YYYY-MM-DD] <the thing to remember>
   ```
4. Update the `Aktualisiert:` date in the header
5. Save the file
6. Confirm what was saved and where

If the memory file doesn't exist, run the setup first and then save.

## What NOT to save

- Temporary or session-specific context
- Code that's already in a repo (reference the file path instead)
- Things that change frequently (prefer a project CLAUDE.md for those)
- Secrets, passwords, or API keys
