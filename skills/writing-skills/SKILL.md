---
name: writing-skills
description: Write new skill documentation using TDD — failing scenario first, minimal skill second, then refactor to close loopholes. Use when creating or significantly editing a skill.
origin: https://github.com/obra/superpowers
---

# Writing Skills

Apply TDD to skill documentation: write failing tests first, then minimal content that addresses those failures, then refactor.

**Core rule:** NO SKILL WITHOUT A FAILING TEST FIRST. Applies to new skills and edits equally.

## The Red-Green-Refactor Cycle for Skills

### RED — Document failures

Run pressure scenarios **without** the skill. Observe what goes wrong:
- What rationalizations does the agent use to skip the process?
- What shortcuts are taken?
- What is the baseline behavior without guidance?

Document each failure specifically. These become your test cases.

### GREEN — Write minimal skill

Write the minimum documentation that addresses each documented failure. No more.

- Address each failure directly and explicitly
- Counter each observed rationalization by name
- Verify: does an agent following this skill avoid the documented failures?

### REFACTOR — Close loopholes

After GREEN passes:
- Run the agent again — find new rationalizations the minimal skill didn't close
- Add explicit counters for each new loophole
- Re-verify compliance
- Repeat until no new loopholes emerge

## Description Field Rules

The description field (used for skill discovery) must state **triggering conditions only**:

```
# Good: triggering condition
"Use when tests have race conditions"
"Use when starting any new feature"

# Bad: workflow summary
"Follows red-green-refactor with test-first approach and review checkpoints"
```

Summaries in the description create shortcuts — agents read the description and skip the full skill. Triggering conditions cause agents to load the skill and read it.

## Skill Structure

```markdown
---
name: skill-name
description: <triggering conditions, not workflow summary>
origin: <source URL if external>
---

# Skill Title

<Core rule or constraint — one sentence>

## When to Use
## Process
## Rules / Constraints
## Examples (if needed)
```

Skills are **reusable reference guides**, not one-off narratives.

## File Placement

- Curated skills: `skills/<skill-name>/SKILL.md` in this repo
- Generated/imported: `~/.claude/skills/<skill-name>/SKILL.md`
- Supporting files: `skills/<skill-name>/examples.md`, `skills/<skill-name>/tools.py`, etc.
- Namespace: flat, lowercase with hyphens

## Quality Checklist

- [ ] Failing test documented before skill was written
- [ ] Every common rationalization is addressed explicitly
- [ ] Description contains triggering conditions, not workflow summary
- [ ] No placeholder content
- [ ] Skill can be followed by an agent with no additional context
