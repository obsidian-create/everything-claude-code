---
name: test-driven-development
description: Write the test first, watch it fail, then implement. Use for new features, bug fixes, refactoring, and behavior changes.
origin: https://github.com/obra/superpowers
---

# Test-Driven Development

**Core sequence:** Write test → watch it fail → write minimal code → watch it pass → refactor.

## The Red-Green-Refactor Cycle

### RED
- Write a test that describes the desired behavior
- Run it — it must fail
- Failing proves the test actually validates something

### GREEN
- Write the **minimal** code to make the test pass
- No extras, no "while I'm here" additions
- Run the test — confirm it passes

### REFACTOR
- Clean up code and tests
- All tests must still pass after refactoring

## Non-Negotiable Rules

- Always watch the test **fail** before implementing — verification is mandatory, not optional
- Delete any production code written before its test exists — do not "keep as reference"
- Never adapt existing code while writing a test for it
- One test = one behavior

## Common Rationalizations to Reject

| Thought | Why it's wrong |
|---------|----------------|
| "I'll write tests after" | Tests written after pass immediately — they prove nothing |
| "I manually tested it" | Manual testing cannot replace systematic automated verification |
| "The code already exists, I'll keep it" | Sunk cost. Delete it and write the test first |
| "It's too simple to need a test" | Simple functions have bugs too |

## When to Apply

- New features
- Bug fixes (write a test that reproduces the bug first)
- Refactoring (tests prove behavior is preserved)
- Any behavior change

## Exceptions (require explicit human approval)

- Throwaway prototypes (must be thrown away, not shipped)
- AI-generated boilerplate with no logic

## Verification Checklist

Before marking a task complete:
- [ ] Test was written before implementation
- [ ] Test was run and failed (RED confirmed)
- [ ] Minimal implementation written
- [ ] Test passes (GREEN confirmed)
- [ ] Refactor complete, all tests still pass
