---
name: writing-plans
description: Write detailed implementation plans with 2-5 minute atomic tasks. Use after brainstorming is approved and before any implementation begins.
origin: https://github.com/obra/superpowers
---

# Writing Plans

Generate a comprehensive implementation plan assuming the engineer has zero context. Break work into atomic tasks taking 2–5 minutes each.

## Plan Structure

Save to: `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

```markdown
# Plan: <Feature Name>

**Goal:** <One sentence>
**Architecture:** <Key components and their relationships>
**Tech Stack:** <Languages, frameworks, tools>

---

## Tasks

- [ ] 1. Write failing test for <specific behavior>
  - File: `src/foo/bar.test.ts`
  - Run: `npm test src/foo/bar.test.ts`
  - Expected: test fails with "X is not defined"

- [ ] 2. Implement <specific thing>
  - File: `src/foo/bar.ts`
  - Function: `export function bar(x: string): number`
  - Run: `npm test src/foo/bar.test.ts`
  - Expected: all tests pass

- [ ] 3. Commit
  - `git add src/foo/ && git commit -m "feat: add bar"`
```

## Task Rules

Each task must:
- Follow TDD: write failing test → verify failure → implement → verify pass → commit
- Be atomic and independently executable
- Contain **actual code**, exact commands, and expected outputs
- Reference real file paths, function names, and types

## Zero Placeholders

The following constitute plan failures:
- "TBD"
- "add validation"
- "similar to Task N"
- "implement X" without specifying exactly how
- Any function, type, or file path not defined in the plan

## Pre-Execution Checklist

Before handing off the plan:
- [ ] All spec requirements are covered by tasks
- [ ] No placeholder language anywhere
- [ ] All type/method names are consistent throughout
- [ ] No missing tasks (no gaps between current state and goal)
- [ ] Every task has a verification step

## After the Plan

Offer two execution paths:
1. **Subagent-driven** — fresh agent per task, two-stage review (invoke `subagent-driven-development`)
2. **Inline execution** — work through tasks sequentially (invoke `executing-plans`)

Both paths include review checkpoints. Do not skip them.
