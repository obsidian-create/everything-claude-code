---
name: requesting-code-review
description: Request a code review via specialized subagent before merging. Use after completing tasks in subagent-driven workflows, after major features, and before merging to main.
origin: https://github.com/obra/superpowers
---

# Requesting Code Review

**Principle:** Review early, review often. Catch issues in development, not post-merge.

## When Reviews Are Required

- After task completion in subagent-driven workflows
- After any major feature implementation
- Before merging to the main branch

## When Reviews Are Optional (but encouraged)

- When stuck on a problem
- Before significant refactoring

## Process

1. Obtain the relevant git commit hashes:
   ```bash
   git log --oneline <base>..<head>
   ```

2. Dispatch the `code-reviewer` subagent with this template:

   ```
   Review the changes from <base-commit> to <head-commit>.

   Feature: <what was implemented>
   Requirements: <link to spec or inline description>
   Base commit: <hash>
   Head commit: <hash>

   Look for: correctness, spec compliance, edge cases, test coverage, code quality.
   ```

3. Receive categorized feedback:
   - **Critical** — fix immediately, do not proceed
   - **Important** — resolve before merging
   - **Minor** — address later or in a follow-up

4. Act on feedback:
   - Fix Critical and Important issues
   - Dispute with technical evidence if a suggestion is incorrect for your context

## Review Frequency by Context

| Context | Review cadence |
|---------|---------------|
| Subagent-driven development | After each task |
| Planned feature | Every 3 tasks |
| Ad-hoc development | Before merging |

## What Not to Do

- Do not skip reviews because the change "seems simple"
- Do not ignore Critical issues
- Do not proceed with Important issues unresolved without explicit discussion
- Do not accept suggestions that break tests without raising a concern
