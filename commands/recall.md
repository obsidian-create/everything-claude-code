---
description: Search and display relevant entries from your persistent long-term memory. Use to quickly surface what was remembered about a topic, project, or decision.
---

# /recall

Search your persistent memory for relevant information.

## Usage

```
/recall              — Show full memory overview (all sections)
/recall postgres     — Find everything about PostgreSQL decisions
/recall auth         — Find auth-related context and decisions
/recall project X    — Find all context about a specific project
/recall preferences  — Show your working preferences
```

## Instructions

When this command is invoked:

1. Read `~/.claude/memory/CORE.md`
2. If no search query was provided:
   - Show a formatted overview of all non-empty sections
   - Summarize the count of entries per section
3. If a search query was provided:
   - Search through all memory content for relevant entries
   - Return matching entries with their section context
   - Highlight the most relevant items first
4. Present the results in a clean, scannable format
5. Offer to update or remove stale entries if they look outdated

## Output format

```
## 🧠 Memory Recall — [query]

### Matches in: Architektur-Entscheidungen
- [2025-03-15] We use PostgreSQL 15 with PgBouncer pooling for all services
- [2025-02-01] Decided against Redis Cluster, using single Redis with replication

### Matches in: Aktive Ziele & Projekte
- [2025-03-01] Project Atlas: rebuilding the payment service, targeting April launch

---
Found 3 entries matching "postgres" across 2 sections.
To update an entry: /remember [updated fact]
To remove an entry: /forget [entry text]
```

## Notes

- Memory is in `~/.claude/memory/CORE.md`
- Loaded automatically at every session start
- To add new memories: `/remember [text]`
- To remove: `/forget [text]`
