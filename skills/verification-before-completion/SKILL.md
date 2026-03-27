---
name: verification-before-completion
description: Run fresh verification commands and read the output before claiming anything is done, fixed, or passing. Iron law — no exceptions.
origin: https://github.com/obra/superpowers
---

# Verification Before Completion

**Iron Law:** NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.

## Required Steps Before Any Completion Claim

1. Identify the command that proves the claim
2. Execute it freshly — not from memory, not from a previous run
3. Read the **complete** output
4. Check the exit code
5. Confirm the output actually supports your assertion
6. Only then make the claim

## Red Flags (you're about to skip verification)

- "This should work now"
- "I'm pretty confident the tests pass"
- "The fix looks correct"
- "I'm satisfied with the implementation"
- "It probably works"

Any hedging word ("should", "probably", "likely", "looks like") is a signal to run the verification command before speaking.

## What Counts as Verification

| Claim | Required evidence |
|-------|------------------|
| "Tests pass" | Run test suite, read output, confirm 0 failures |
| "Bug is fixed" | Run the specific failing test, confirm it passes |
| "Build succeeds" | Run build command, confirm exit code 0 |
| "Feature works" | Run the relevant tests or demonstrate behavior |
| "No regressions" | Run full test suite, not just the changed tests |

## What Does NOT Count

- Agent reports from subagents (verify independently)
- Previous run output (run fresh)
- Code inspection ("looks right")
- Reasoning about what should happen

> "Confidence ≠ evidence."

## Scope

This rule applies before:
- Marking a task complete
- Committing code
- Creating a PR
- Delegating to the next task or agent
- Telling the user something is done

No exceptions for perceived simplicity or time pressure.
