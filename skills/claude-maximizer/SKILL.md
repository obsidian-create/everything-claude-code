---
name: claude-maximizer
description: Extract the absolute maximum value from Claude Code. Covers context management, task decomposition, tool use strategies, session patterns, instruction clarity, and how to get consistently excellent results across complex multi-step engineering work.
origin: ECC
---

# Claude Maximizer

A meta-skill for getting the best possible results from Claude Code.

## When to Activate

- Starting a complex, multi-step task
- Results have been inconsistent or suboptimal
- Working on a large codebase for the first time
- Designing an agentic workflow using Claude
- Debugging why Claude keeps making the same mistake

## Core Insight

Claude is a powerful reasoning engine, but its output quality is highly sensitive to:
1. **How clearly you define success**
2. **How much relevant context you provide**
3. **How you decompose work**
4. **How you handle context limits**

## Principle 1: Define Success First

Before asking Claude to do anything complex, state what "done" looks like.

```
BAD:  "Refactor the auth module"

GOOD: "Refactor the auth module such that:
       - Each function has a single responsibility
       - No function is longer than 30 lines
       - All existing tests still pass
       - New tests cover the extracted functions
       Do NOT change the public API surface."
```

The clearer the acceptance criteria, the better the output.

## Principle 2: Front-Load Context

Claude uses all available context, but later context has less influence on earlier work.

```
Structure your prompt:
1. Role/expertise required: "You are reviewing this as a security engineer"
2. Relevant constraints: "We are using PostgreSQL 15, Node.js 20, AWS"
3. What to avoid: "Do not add new dependencies"
4. The actual task
5. Output format expected
```

**What context matters most:**
- The language/framework and its version
- Existing patterns in the codebase (paste a representative example)
- Constraints that aren't obvious from the code
- The "why" behind the request

## Principle 3: Show, Don't Just Tell

Examples in your prompt dramatically improve output quality.

```
Instead of: "Use the repository pattern for database access"

Show the pattern:
"Use the repository pattern. Example of how we already do it:

class UserRepository:
    def __init__(self, db: Database):
        self._db = db

    def find_by_id(self, user_id: str) -> Optional[User]:
        row = self._db.query('SELECT * FROM users WHERE id = ?', user_id)
        return User.from_row(row) if row else None

Follow this exact pattern for the OrderRepository."
```

## Principle 4: Decompose, Then Delegate

For complex tasks, break down before executing.

```
Workflow:
1. Ask Claude to create a plan/checklist for the task
2. Review and refine the plan
3. Execute plan step by step
4. Check output of each step before proceeding

Example:
"Before implementing, list the steps required to add OAuth2
 to this application. Don't write any code yet."

→ Review the plan → "Good, now implement step 1 only."
→ Review step 1 → "Now implement step 2."
```

This surfaces misunderstandings early before they compound.

## Principle 5: Manage Context Budget

Claude has a finite context window. As it fills up:
- Earlier content gets less attention
- Long conversations accumulate irrelevant history
- Code from earlier in the conversation may be forgotten

**Strategies:**

```
Compact aggressively:
- Start a new session for a new phase of work
- Use /compact after a milestone to summarize progress
- Avoid pasting large files unless directly needed

Reference, don't paste:
- "Look at the UserService class in src/services/user.ts"
  (Claude reads it) vs pasting 300 lines

Segment large tasks:
- Phase 1 session: design and plan
- Phase 2 session: implement core logic (reference phase 1 output)
- Phase 3 session: tests (reference implementation)
- Phase 4 session: review and cleanup
```

## Principle 6: Correct Early and Precisely

When Claude goes in the wrong direction, correct it immediately and precisely.

```
BAD correction:
"That's not right, try again"

GOOD correction:
"The function you wrote mutates the input array which violates our
 immutability convention. Rewrite it to return a new array instead.
 Here's the specific line: [paste line]"
```

The more specific the correction, the less work is lost.

## Principle 7: Use Constraints as Design

Constraints produce better results than open-ended requests.

```
Unconstrained: "Write a caching layer"
→ Claude might produce something complex and hard to maintain

Constrained: "Write a caching layer that:
- Wraps the existing UserService interface exactly
- Uses Redis as the backend
- Returns stale data rather than erroring if Redis is down
- Has a TTL of 5 minutes per key
- Is under 100 lines of code"
→ Claude produces something focused and appropriate
```

## Principle 8: Verify with Specificity

When reviewing Claude's output, check specific things:

```
Instead of: "Does this look good?"

Check:
□ Does it handle the null case?
□ Are the error messages user-facing or internal?
□ Is the retry logic bounded (max attempts defined)?
□ Does the test cover the unhappy path?
□ Is the SQL injection-safe (parameterized queries)?
```

Ask Claude to verify these too:
```
"Before we finalize this:
1. Does this handle the case where userId is null?
2. Are there any SQL injection risks?
3. What happens if the DB connection times out?"
```

## Principle 9: Leverage Specialization

Different tasks benefit from different framings:

```
For code review:     "You are a senior engineer reviewing this for production readiness"
For debugging:       "You are a detective. Reason step by step about what could cause this"
For architecture:    "You are an experienced architect. Consider long-term maintainability"
For security:        "You are a penetration tester looking for vulnerabilities"
For performance:     "You are a performance engineer. Identify bottlenecks and quantify impact"
For docs:            "You are a technical writer. Explain this to a developer unfamiliar with this system"
```

## Principle 10: Incremental Commits

Work in small, verifiable increments — even when it feels slower.

```
ANTIPATTERN:
"Implement the entire authentication system"
→ Gets 500 lines that may have subtle bugs throughout

BETTER:
"Implement just the password hashing function with tests"
→ Review → commit
"Now implement the JWT generation with tests"
→ Review → commit
"Now implement the login endpoint"
→ Review → commit
```

Each step is verifiable. Errors don't compound. Easier to course-correct.

## Session Patterns

### Fresh Start Pattern
Use when: beginning a new task or after context becomes stale

```
1. Provide the full problem statement
2. Reference relevant files (don't paste)
3. State constraints and non-goals
4. Ask for a plan before execution
```

### Continuation Pattern
Use when: resuming a multi-session task

```
Begin with:
"Context for this session:
 - We are implementing [feature]
 - In the last session, we completed: [list]
 - The current state is: [brief description]
 - The next step is: [specific thing to do]
 - The files changed so far: [list]"
```

### Review Pattern
Use when: you want high-quality critique

```
"Review [this code/design/plan] as if you were:
 1. A security engineer finding vulnerabilities
 2. A new engineer trying to understand it in 6 months
 3. An SRE considering what breaks in production

 For each role, list the 3 most important concerns."
```

### Rubber Duck Pattern
Use when: you're stuck and need to reason through a problem

```
"I'm trying to [goal]. I've tried [approach A] which failed because [reason].
 I've also considered [approach B] but I'm concerned about [concern].
 Walk me through the reasoning to pick the right approach."
```

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|---|---|---|
| "Fix this" with no context | Wrong assumptions, wrong fix | State expected vs actual behavior |
| Mega-prompts | Hard to verify, error-prone | Decompose into steps |
| Ignoring partial output before completing | Errors compound | Review each step |
| Pasting entire large files | Context wasted on irrelevant code | Reference files by path |
| Vague corrections ("that's wrong") | Claude can't improve | Specify exactly what's wrong |
| Asking for perfection in one shot | Unrealistic, frustrating | Iterate toward quality |
| Not stating constraints | Claude over-engineers | Front-load constraints |
| Changing scope mid-task | Disorienting | Complete or cancel current task first |

## Quality Signals: Is Claude On Track?

**Green flags:**
- Asks clarifying questions before starting
- States assumptions explicitly
- Produces incrementally verifiable output
- Catches edge cases proactively
- Flags risks or concerns without prompting

**Yellow flags (investigate before proceeding):**
- Output is much more complex than expected
- Didn't mention any tradeoffs
- Tests only cover happy path
- Output ignores stated constraints
- Doesn't match existing codebase patterns

**Red flags (stop and correct):**
- Changes public API without permission
- Adds new dependencies without noting it
- Makes breaking changes to existing tests
- Produces >300 lines in response to a simple request
- Doesn't handle error cases
