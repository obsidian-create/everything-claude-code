---
name: subagent-driven-development
description: Delegate implementation tasks to isolated subagents with two-stage review after each task. Use for executing plans when quality and context isolation matter.
origin: https://github.com/obra/superpowers
---

# Subagent-Driven Development

Delegate each plan task to a fresh subagent with isolated context. Apply two-stage review after every task before proceeding to the next.

## Workflow

1. Extract all tasks from the plan with full context
2. Confirm branch location with the user before starting
3. For each task:
   a. Dispatch a fresh **implementer** subagent with the task + full context
   b. Implementer completes work and self-reviews
   c. **Spec compliance reviewer** validates requirements are met
   d. **Code quality reviewer** assesses implementation standards
   e. If issues found: implementer fixes → re-review loop
   f. Only proceed to next task when both reviews pass
4. Final review before invoking `finishing-a-development-branch`

## Model Selection

| Work type | Model |
|-----------|-------|
| Architecture, design decisions | Powerful (Opus, Sonnet) |
| Mechanical implementation, 1-2 file changes | Efficient (Haiku, Sonnet) |

## Subagent Prompt Structure

Each implementer subagent receives:
- The specific task from the plan
- Relevant file paths and interfaces
- The spec or design doc
- The test to write first (TDD)
- Expected output and verification command

Answer all subagent questions **before** work begins, not during.

## Two-Stage Review

**Stage 1 — Spec Compliance:**
- Does the implementation satisfy the spec requirements?
- Are all edge cases handled as specified?
- Do tests cover the specified behaviors?

**Stage 2 — Code Quality:**
- Is the code idiomatic for the language/framework?
- Are there obvious bugs or anti-patterns?
- Is test coverage sufficient?

## Critical Rules

- Never skip review stages
- Never proceed with unfixed issues (regardless of severity assessment)
- Never start without explicit user consent on branch location
- When a reviewer identifies problems: fix → re-review, do not argue past them

## Why This Approach

- Prevents context pollution from session history bleeding into new tasks
- Enables parallel-safe execution
- Catches defects early through automated review checkpoints
- Produces higher quality than single-agent sequential execution

## Prerequisites

- `using-git-worktrees` — isolated workspace must exist
- `writing-plans` — plan must exist before dispatching subagents
- `test-driven-development` — each task follows TDD

## Completion

After all tasks pass both reviews, invoke `finishing-a-development-branch`.
