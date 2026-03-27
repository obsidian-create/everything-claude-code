---
name: get-shit-done
description: Meta-prompting framework against context rot. Use when starting or managing a complex multi-step development project with planning, wave execution, and verification.
origin: https://github.com/glittercowboy/get-shit-done
---

# Get Shit Done (GSD)

Meta-prompting framework that solves "context rot" — the degradation of AI assistance quality over long sessions. Structures development into discrete, verifiable phases with specialized agents per phase.

## 6-Step Workflow

```
Initialize → Discuss → Plan → Execute → Verify → Ship
```

### 1. Initialize
- Map the codebase (`gsd-codebase-mapper`)
- Profile the user and project (`gsd-user-profiler`, `gsd-project-researcher`)
- Identify assumptions (`gsd-assumptions-analyzer`)

### 2. Discuss
- Advisor/researcher clarifies requirements (`gsd-advisor-researcher`)
- Roadmapper defines milestones (`gsd-roadmapper`)
- Phase researcher scopes current phase (`gsd-phase-researcher`)

### 3. Plan
- Planner breaks work into atomic tasks organized in waves (`gsd-planner`)
- Plan checker validates the plan before execution (`gsd-plan-checker`)
- Integration checker verifies dependency correctness (`gsd-integration-checker`)

### 4. Execute (Wave Execution)
- Executor implements one wave at a time (`gsd-executor`)
- Each wave = set of independent tasks that can run in parallel
- Atomic commits after each task
- Waves run sequentially; tasks within a wave run in parallel

```
Wave 1: [Task A] [Task B] [Task C]   ← parallel
         ↓
Wave 2: [Task D] [Task E]            ← parallel, depends on Wave 1
         ↓
Wave 3: [Task F]                     ← depends on Wave 2
```

### 5. Verify
- Verifier checks each wave against plan and requirements (`gsd-verifier`)
- UI auditor validates interface consistency (`gsd-ui-auditor`, `gsd-ui-checker`)
- Nyquist auditor checks sampling/coverage (`gsd-nyquist-auditor`)
- If failures: planner runs in gap-closure mode → re-execute

### 6. Ship
- All verifications pass
- Final integration check
- Clean commit history with atomic messages

## 19 Specialized Agents

| Agent | Role |
|-------|------|
| `gsd-advisor-researcher` | Requirements clarification |
| `gsd-assumptions-analyzer` | Surface hidden assumptions |
| `gsd-codebase-mapper` | Map existing code structure |
| `gsd-debugger` | Systematic debug with persistent state |
| `gsd-executor` | Implement atomic tasks |
| `gsd-integration-checker` | Validate dependencies and interfaces |
| `gsd-nyquist-auditor` | Coverage and sampling validation |
| `gsd-phase-researcher` | Scope current phase |
| `gsd-plan-checker` | Validate plan before execution |
| `gsd-planner` | Goal-backward task decomposition |
| `gsd-project-researcher` | Project context discovery |
| `gsd-research-synthesizer` | Synthesize research findings |
| `gsd-roadmapper` | Milestone and phase planning |
| `gsd-ui-auditor` | UI consistency audit |
| `gsd-ui-checker` | UI requirement validation |
| `gsd-ui-researcher` | UI pattern research |
| `gsd-user-profiler` | Profile user context and preferences |
| `gsd-verifier` | Verify wave completion against spec |

## Key Principles

**Context Engineering** — XML-structured prompts keep agent context clean across long sessions.

**Wave Execution** — Tasks grouped by dependency level. Independent tasks execute in parallel within a wave; waves run sequentially.

**Atomic Commits** — One commit per completed task. Never batch unrelated changes.

**Goal-Backward Planning** — Planner starts from the desired end state and works backward to determine required tasks.

**Persistent Debug State** — Debugger writes state to a debug file so sessions can be resumed if interrupted.

**Multi-Agent Orchestration** — Each agent has a single responsibility. Orchestration is explicit, not implicit.

## Debugger Protocol

The debugger (`gsd-debugger`) uses a persistent debug file to maintain state:

1. Check for active debug session files
2. Create debug file with symptom description
3. Gather reproduction steps
4. Investigation loop (4 phases: observe → hypothesize → test → conclude)
5. Human verification checkpoint before applying fix
6. Archive session after resolution

## Quick Mode

For smaller tasks that don't need the full pipeline:

```
/gsd-quick <description>
```

Skips the Discuss and full planning phases; goes directly to a minimal plan and execution.

## Installation

```bash
# Interactive
npx gsd-build/get-shit-done

# Non-interactive (Claude Code)
npx gsd-build/get-shit-done --runtime claude --non-interactive
```

## 80+ Commands

Commands follow the pattern `/gsd-<action>`. Key categories:
- Project init: `/gsd-init`, `/gsd-map`, `/gsd-profile`
- Planning: `/gsd-plan`, `/gsd-check-plan`, `/gsd-roadmap`
- Execution: `/gsd-execute`, `/gsd-wave`
- Verification: `/gsd-verify`, `/gsd-audit-ui`, `/gsd-audit-nyquist`
- Debug: `/gsd-debug`, `/gsd-debug-resume`
- Ship: `/gsd-ship`, `/gsd-commit`
