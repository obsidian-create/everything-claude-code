---
name: finishing-a-development-branch
description: Complete development work — verify tests, present 4 options (merge/PR/keep/discard), execute the choice, clean up. Use after all implementation tasks are done.
origin: https://github.com/obra/superpowers
---

# Finishing a Development Branch

**Core principle:** Verify tests → Present exactly 4 options → Execute choice → Clean up.

## Step 1: Verify Tests

Run the full test suite before anything else:

```bash
<project test command>
```

If tests fail: **stop here**. Fix failing tests before proceeding. Do not offer completion options with a broken test suite.

## Step 2: Determine Base Branch

Identify which branch the feature branch was created from (typically `main` or `master`):

```bash
git log --oneline main..HEAD  # verify commits since base
```

## Step 3: Present Exactly 4 Options

Always present these four options — no variations, no open-ended questions:

```
1. Merge into <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is for later
4. Discard this work permanently
```

## Step 4: Execute the Choice

**Option 1 — Merge locally:**
```bash
git checkout <base-branch>
git merge --no-ff <feature-branch>
git worktree remove .worktrees/<branch>  # clean up worktree
git branch -d <feature-branch>
```

**Option 2 — Push and PR:**
```bash
git push -u origin <feature-branch>
# create PR via gh or platform UI
# do NOT clean up worktree (branch still active)
```

**Option 3 — Keep as-is:**
```bash
# no action — leave branch and worktree intact
```

**Option 4 — Discard:**
```bash
# Require explicit typed confirmation: "discard"
git worktree remove .worktrees/<branch>
git branch -D <feature-branch>
```

## Critical Rules

- Never skip test verification before offering options
- Always present **exactly** these four options
- Require explicit typed `"discard"` confirmation before deleting any work
- Only clean up worktrees for merge (option 1) or discard (option 4)
- Options 2 and 3 leave the worktree intact
