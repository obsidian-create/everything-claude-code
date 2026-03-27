---
name: dispatching-parallel-agents
description: Delegate independent problems to multiple agents working concurrently. Use when facing failures or tasks across separate domains with no shared context requirements.
origin: https://github.com/obra/superpowers
---

# Dispatching Parallel Agents

When independent problems exist across separate domains, dispatch one agent per domain and let them work concurrently rather than sequentially.

## When to Use

Good fit:
- Multiple failures in different areas (separate test files, subsystems)
- Independent investigations that don't share context
- Problems that won't cause agents to edit the same code

Bad fit:
- Failures that are likely related (shared root cause)
- You need a complete system understanding before acting
- Agents would conflict by editing the same files

## Process

1. **Identify independent domains** — group failures/tasks by subsystem or file area
2. **Write focused task descriptions** — one clear problem per agent
3. **Dispatch simultaneously** — launch all agents at once
4. **Review and integrate results** — collect findings, resolve conflicts if any

## Writing Effective Agent Prompts

Each agent prompt must be:
- **Focused** — one clear problem domain
- **Self-contained** — includes all context needed to understand the problem
- **Specific about deliverables** — what output is expected

Avoid:
- "Fix all the tests" — too broad
- "Look into the failing stuff" — no specific scope or context

Example of a good prompt:
```
Investigate the 3 failing tests in src/auth/session.test.ts.
The failures started after commit abc123 (added token rotation).
Find the root cause and either fix it or report the exact issue.
Return: root cause, files changed (if any), and test output showing resolution.
```

## Real-World Performance

Example: 6 test failures across 3 files → 3 parallel agents → all resolved concurrently with zero integration conflicts. Time saved: ~3× over sequential investigation.

## Integration

Works alongside `subagent-driven-development` for task execution. Use this skill for investigation and diagnosis phases; use subagent-driven-development for planned implementation tasks.
