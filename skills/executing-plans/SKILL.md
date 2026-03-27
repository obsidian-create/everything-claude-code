---
name: executing-plans
description: Step through a written plan task-by-task with verification at each step. Use when executing a plan inline (without subagents) in a new session.
origin: https://github.com/obra/superpowers
---

# Executing Plans

Work through a written development plan sequentially, with verification at each step and hard stops on blockers.

## Steps

### 1. Load and Review

- Read the plan file in full
- Raise any concerns with your partner before starting
- Or create a TodoWrite to track progress and proceed

### 2. Execute Each Task

For each task in order:
- Mark task as in-progress
- Follow the steps **exactly as written** — do not improvise
- Run the specified verification command
- Read the full output — check exit codes
- Mark complete only after verification passes

### 3. Complete Development

After all tasks are verified:
- Announce use of `finishing-a-development-branch`
- Follow that workflow

## Hard Stop Conditions

Stop immediately (do not guess or work around) if:
- A dependency is missing
- A test is failing unexpectedly
- A step's instructions are unclear or contradictory
- The codebase state doesn't match what the plan assumed

Report the blocker and wait for guidance.

## Critical Rules

- **Never skip verifications** — even if you're confident the step worked
- **Never start on main/master** without explicit user consent
- **Never improvise** around plan steps — if a step is wrong, stop and fix the plan first

## Quality Note

Subagent-driven execution produces higher quality results when the platform supports it. Use `subagent-driven-development` instead of this skill when possible.

## Prerequisites

- `using-git-worktrees` — isolated workspace
- `writing-plans` — plan to execute

## Completion

→ `finishing-a-development-branch`
