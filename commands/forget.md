---
description: Remove a specific entry from your persistent long-term memory. Use when something is no longer true, relevant, or needed.
---

# /forget

Remove an entry from your persistent memory when it's no longer accurate or relevant.

## Usage

```
/forget We use MySQL         — Remove a specific decision that changed
/forget project atlas        — Remove all entries about a completed project
/forget [ID from /recall]    — Remove by entry reference
```

## When to use

- A technical decision was changed (e.g., switched from MySQL to PostgreSQL)
- A project was completed or cancelled
- Personal context changed (new role, new company)
- Information is now outdated or incorrect

## Instructions

When this command is invoked:

1. Read `~/.claude/memory/CORE.md`
2. Search for entries matching the provided text
3. If one clear match is found:
   - Show the entry that will be removed
   - Ask for confirmation before removing
   - Remove it and save the file
4. If multiple matches:
   - Show all matches with their section and content
   - Ask which one(s) to remove
5. If no match:
   - Show entries most similar to the query
   - Suggest using `/recall [query]` to find the exact text

## After removing

- Confirm what was removed
- Suggest adding the updated fact if the old info was replaced:
  `/remember [new fact that replaces what was removed]`

## Safety

- Always shows what will be deleted before deleting
- Never removes entire sections, only individual entries
- The CORE.md file is always backed up to `~/.claude/memory/CORE.md.bak` before any modification
