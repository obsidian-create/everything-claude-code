---
name: using-git-worktrees
description: Create isolated git workspaces for parallel development. Use before starting any implementation to ensure a clean baseline separate from main.
origin: https://github.com/obra/superpowers
---

# Using Git Worktrees

Create isolated git workspaces so development never touches the main working tree directly.

## Directory Selection (priority order)

1. Check for existing `.worktrees/` or `worktrees/` directory in the project
2. Check CLAUDE.md for worktree directory preferences
3. Ask the user if neither is specified

## Safety Verification

Before creating a project-local worktree:

```bash
git check-ignore -v <proposed-worktree-dir>
```

If the directory is **not** git-ignored:
1. Add it to `.gitignore`
2. Commit `.gitignore` before creating the worktree

Never create a worktree without verifying it won't be accidentally tracked.

## Setup

```bash
# Create worktree on a new branch
git worktree add .worktrees/<branch-name> -b <branch-name>

# Or from an existing branch
git worktree add .worktrees/<branch-name> <branch-name>
```

## Auto-Detect and Install Dependencies

After creating the worktree, detect the project type and install:

| Signal | Command |
|--------|---------|
| `package.json` | `npm install` (or pnpm/yarn/bun) |
| `Cargo.toml` | `cargo build` |
| `requirements.txt` / `pyproject.toml` | `pip install` / `uv sync` |
| `go.mod` | `go mod download` |

## Baseline Verification

Run the test suite before reporting readiness:

```bash
cd .worktrees/<branch-name> && <test command>
```

If baseline tests fail: **stop and get explicit permission** before proceeding. Never start development on a broken baseline silently.

## Cleanup

After merging or discarding work:

```bash
git worktree remove .worktrees/<branch-name>
git branch -d <branch-name>  # if merged
```

Only clean up worktrees for merge or discard scenarios — not for PR or keep-as-is options.

## Integration

This skill is a prerequisite for:
- `subagent-driven-development`
- `executing-plans`
- `finishing-a-development-branch`
