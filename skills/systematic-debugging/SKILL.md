---
name: systematic-debugging
description: Investigate root causes before attempting fixes. Use when diagnosing bugs, test failures, or unexpected behavior — especially under time pressure.
origin: https://github.com/obra/superpowers
---

# Systematic Debugging

**Core rule:** Investigate root causes before attempting fixes. Never patch symptoms.

## Four Mandatory Phases

### Phase 1: Root Cause Investigation

- Read error messages in full — every line
- Reproduce the issue consistently before touching code
- Check recent changes (git log, git diff)
- Add logging at component boundaries: what enters, what exits
- Gather evidence before forming any hypothesis

### Phase 2: Pattern Analysis

- Find a working example of similar behavior
- Compare it systematically against the broken case
- Document every difference — no matter how small

### Phase 3: Hypothesis and Testing

- Form one specific, falsifiable hypothesis
- Make the minimal change to test it
- One variable at a time — never multiple changes at once
- Confirm or reject, then form the next hypothesis

### Phase 4: Implementation

- Write a **failing test** that reproduces the bug before fixing it
- Implement the single fix
- Verify the test now passes
- Verify no regressions

## Architectural Checkpoint

If **three or more fix attempts fail**, stop. Do not continue patching. Ask: is the underlying architecture sound? Continuing to fix symptoms of a broken design wastes more time than reconsidering the design.

## When This Matters Most

Apply this process especially under time pressure. "Quick fixes" during emergencies cause more rework and new bugs than disciplined investigation.
