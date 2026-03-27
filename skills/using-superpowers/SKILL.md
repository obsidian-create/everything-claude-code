---
name: using-superpowers
description: Meta-skill — check for applicable skills before acting on any task. Mandatory workflow, not a suggestion.
origin: https://github.com/obra/superpowers
---

# Using Superpowers

**Mandatory rule:** Check for applicable skills before taking action on any task or question — even if there's only a 1% chance a skill applies.

> "IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT."

## Decision Tree

1. Does any skill apply to this task?
2. If yes → invoke the Skill tool, announce which skill and why
3. Follow the skill's instructions exactly
4. Then respond

## Instruction Hierarchy

```
User's explicit instructions (CLAUDE.md, direct requests)  ← highest priority
↓
Skills                                                      ← override defaults
↓
Default agent behavior                                      ← lowest priority
```

Skills override default behavior. User directives always override skills.

## Skill Priority Order

Apply in this order when multiple skills apply:

1. **Process skills first** — brainstorming, debugging, verification
2. **Implementation skills second** — design, building, planning

## Red Flags (you're rationalizing skipping the skill check)

If you think any of the following, that is a signal to check for skills *before* proceeding:

- "This is just a simple question"
- "I need more context first"
- "Let me explore the codebase first"
- "This doesn't seem to match any skill exactly"

These thoughts indicate a skill check is needed, not that it can be skipped.

## Announcement Format

When invoking a skill, announce it:
```
Using skill: <name> — <one-line reason why it applies>
```

Then follow the skill instructions before any other output.
