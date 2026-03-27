---
name: debugging-mastery
description: Systematic root-cause analysis and debugging across any language, framework, or stack. Covers binary search debugging, reproduction isolation, hypothesis-driven investigation, memory/performance issues, and distributed system debugging.
origin: ECC
---

# Debugging Mastery

Find and fix any bug systematically. Works across languages, stacks, and failure modes.

## When to Activate

- A bug is not immediately obvious
- An error is intermittent or hard to reproduce
- Production system is behaving unexpectedly
- Performance regression without clear cause
- Debugging distributed systems or async code

## The Core Loop

```
Observe → Hypothesize → Test → Narrow → Fix → Verify → Prevent
```

Never skip steps. Never guess twice without measuring.

## Phase 1: Observation

Before touching any code, gather maximum signal:

```
1. What is the exact error message (full stack trace, not summary)?
2. What is the expected behavior vs actual behavior?
3. When did this start? What changed around that time?
4. Is it 100% reproducible or intermittent?
5. Does it affect all users/inputs or specific ones?
6. What environment? (OS, runtime version, deps, config)
```

**Checklist:**
- [ ] Full error message copied verbatim
- [ ] Stack trace captured
- [ ] Reproduction steps documented
- [ ] Environment details noted
- [ ] Recent changes identified (git log, deploy history)

## Phase 2: Isolation

Shrink the problem space as fast as possible.

### Binary Search Debugging

For a sequence of operations A→B→C→D→E where something is wrong:

```
1. Check midpoint C: does the bug exist after C?
   - Yes → bug is in C, D, or E
   - No  → bug is in A, B, or C
2. Check midpoint of remaining half
3. Repeat until isolated to single unit
```

**Code application:**
```
// Suspect a pipeline of transforms:
const step1 = transform1(input);
console.log('After step1:', JSON.stringify(step1)); // add checkpoint
const step2 = transform2(step1);
console.log('After step2:', JSON.stringify(step2)); // add checkpoint
const step3 = transform3(step2);
// Binary search: check step1, then step2, then step3
```

### Minimal Reproduction

Reduce to the smallest possible case that still shows the bug:

```
1. Start with full failing case
2. Remove one component at a time
3. After each removal, verify bug still exists
4. Stop when removing anything more makes bug disappear
5. That minimal case IS the bug's home
```

### Environment Elimination

```
Does it fail in:
- [ ] All environments (prod, staging, local)?
- [ ] Specific runtime version?
- [ ] With specific data only?
- [ ] Under load but not at rest?
- [ ] After specific time elapsed?
- [ ] With specific user/tenant?
```

## Phase 3: Hypothesis Formation

Generate hypotheses ranked by probability:

```
Hypothesis template:
"I believe the bug is caused by [specific mechanism]
 because [evidence A] and [evidence B].
 To test this, I will [concrete action].
 If correct, I expect [observable outcome]."
```

**High-probability first:**
- Most recent change (git blame, last deploy)
- Most complex code path
- Known edge cases in the domain
- Race conditions in async code
- Off-by-one errors in loops/indexes
- Null/undefined propagation
- Encoding/type coercion issues

## Phase 4: Testing Hypotheses

Rules:
- Test one hypothesis at a time
- Make the test falsifiable (can be proven wrong)
- Don't change code AND add logging at the same time

### Logging Strategy

```javascript
// BAD: too vague
console.log('here');
console.log('data:', data);

// GOOD: precise, labeled, structured
console.log('[auth:validate] input:', { userId, token: token?.slice(0,8) });
console.log('[auth:validate] result:', { valid: isValid, reason: failureReason });
```

### Assertion-Based Debugging

```python
# Add invariant assertions to surface assumption violations early
def process_order(order):
    assert order is not None, "order cannot be None"
    assert order.status in VALID_STATUSES, f"invalid status: {order.status}"
    assert order.total >= 0, f"negative total: {order.total}"
    # ... rest of function
```

### Diff-Based Debugging

When something worked before and doesn't now:

```bash
# Find what changed
git log --oneline -20
git diff HEAD~5 HEAD -- path/to/suspect/file
git bisect start
git bisect bad HEAD
git bisect good <last-known-good-commit>
# git bisect run npm test   # automatic bisect
```

## Phase 5: Common Bug Patterns

### Race Conditions

**Symptoms:** intermittent, load-dependent, timing-sensitive

```
Checklist:
- [ ] Is shared state accessed from multiple async paths?
- [ ] Are there missing locks/mutexes on shared resources?
- [ ] Is there a read-modify-write without atomicity?
- [ ] Are callbacks/promises resolving in unexpected order?
```

**Fix pattern:**
```javascript
// BAD: race condition on counter
let count = 0;
async function increment() { count = count + 1; }  // not atomic

// GOOD: atomic operation or proper locking
const counter = new AtomicCounter();
async function increment() { counter.incrementAndGet(); }
```

### Memory Issues

**Symptoms:** growing memory over time, OutOfMemory errors, GC pressure

```
Investigation:
1. Take heap snapshot at T=0
2. Perform the operation N times
3. Take heap snapshot at T=N
4. Compare: what grew?
5. Trace growing objects back to their allocation site
```

**Common causes:**
- Event listener not removed on cleanup
- Closure capturing large scope
- Global cache without eviction
- Circular references preventing GC

### Type Coercion / Nulls

```javascript
// Common JavaScript traps
undefined == null     // true  (use === always)
NaN === NaN           // false (use Number.isNaN())
"5" + 3               // "53" (string concat)
"5" - 3               // 2    (numeric)
[] == false           // true
!![] === true         // true (both true)

// Null propagation — trace the origin
function getUser(id) {
    const user = db.find(id);  // can return null?
    return user.name;           // NPE if null
}
// Fix: validate at boundary, not deep in call chain
```

### Off-By-One Errors

```
Mental model checklist:
- Is the index 0-based or 1-based?
- Is the end index inclusive or exclusive?
- Is length vs last valid index being confused?
- Are loop bounds using < or <=?
```

### Distributed System Issues

**Symptoms:** works in isolation, fails in integration; timeouts; partial failures

```
Diagnosis order:
1. Check network: latency, packet loss, DNS
2. Check service health: CPU, memory, open connections
3. Check timeouts: are they configured? too short?
4. Check retries: are they causing duplicate processing?
5. Check idempotency: is retry-on-failure safe?
6. Check ordering: are events/messages arriving out of order?
7. Check consistency: is there a split-brain scenario?
```

## Phase 6: Systematic Fix

Before changing anything:

```
1. Understand WHY the fix works (not just that it does)
2. Identify if the fix can cause regressions
3. Check if the same bug exists elsewhere in the codebase
4. Add a regression test BEFORE implementing the fix
```

**Fix implementation order:**
1. Write a failing test that reproduces the bug
2. Implement the minimal fix
3. Confirm test now passes
4. Run full test suite
5. Check for similar patterns in codebase

## Phase 7: Verification

```
Post-fix checklist:
- [ ] Original bug no longer reproduces
- [ ] Regression test passes
- [ ] No new failures in test suite
- [ ] Performance not degraded
- [ ] Fix deployed and monitored in staging before production
- [ ] Metrics/alerts confirm resolution
```

## Phase 8: Prevention

After every non-trivial bug:

```
Root Cause Analysis (5 Whys):
Why did the bug occur?      → [immediate cause]
Why did that happen?        → [contributing factor]
Why did that happen?        → [systemic issue]
Why did that happen?        → [process gap]
Why did that happen?        → [root cause]

Actions:
- Technical: [what code/architecture change prevents recurrence]
- Process: [what process catches this class of bug earlier]
- Monitoring: [what alert would have caught this faster]
```

## Debugging by Failure Mode

| Symptom | First Check | Tool |
|---|---|---|
| NullPointerException | Trace origin of null value | Stack trace, assertions |
| Infinite loop | Check loop condition and state mutations | Debugger breakpoint, logging |
| Memory leak | Profile heap over time | Heap snapshot comparison |
| Performance regression | Profile before/after change | Profiler, benchmarks |
| Intermittent failure | Race condition or network | Stress test, chaos testing |
| Wrong output, no error | Logic bug | Binary search, assertions |
| Works locally, fails in prod | Environment difference | Config diff, version check |
| Fails after deploy | Recent change regression | git bisect, diff |
| Timeout | Slow query or external call | Request tracing, query explain |
