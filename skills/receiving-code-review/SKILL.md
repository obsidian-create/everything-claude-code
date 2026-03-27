---
name: receiving-code-review
description: Evaluate code review feedback through technical verification. Use when receiving review comments — before implementing any suggestion.
origin: https://github.com/obra/superpowers
---

# Receiving Code Review

**Core directive:** Verify before implementing. Ask before assuming.

## Response Pattern (5 steps)

1. Read all feedback completely before acting on any of it
2. Restate each requirement in your own words
3. Check the suggestion against your actual codebase — does it apply here?
4. Evaluate technical soundness for your specific context
5. Respond with acknowledgment or reasoned disagreement, then implement

## Critical Prohibitions

Never respond with:
- "You're absolutely right!"
- "Great point!"
- "That makes sense!"

These are **performative** responses — they skip verification and go straight to compliance. Replace them with technical acknowledgment or action.

## Handling Ambiguity

If feedback is unclear in any way:
- Stop before any partial implementation
- Multiple feedback items may be related — partial understanding = wrong implementation
- Request clarification on **all** ambiguous points at once, not one at a time

## Distinguishing Feedback Sources

**Trusted internal reviewers:** Implement after understanding, flag concerns.

**External reviewers:** Additional scrutiny required:
- Verify technical correctness for your specific context
- Check whether the suggestion breaks existing functionality
- Assess whether the reviewer has full context of your situation

## When to Push Back

Push back (with technical reasoning, not defensiveness) when:
- The suggestion breaks existing functionality
- The reviewer lacks full context
- The suggestion violates YAGNI
- The suggestion conflicts with architectural decisions already made

## What Not to Do

- Do not implement suggestions you don't understand
- Do not implement partial feedback when items may be related
- Do not accept suggestions that break tests without raising a concern
