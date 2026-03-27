---
name: brainstorming
description: Design before code. Hard gate — no implementation until a written spec is approved. Use when starting any new feature, task, or change regardless of size.
origin: https://github.com/obra/superpowers
---

# Brainstorming

**Hard gate:** No implementation until a written spec has been presented and approved. This applies to every project — a todo list, a single-function utility, a config change.

## Process (9 ordered steps)

1. **Explore project context** — read CLAUDE.md, recent git log, relevant code
2. **Offer visual companion** — ask if a diagram, wireframe, or sketch would help
3. **Ask clarifying questions** — one at a time, stop when you have enough
4. **Propose 2–3 approaches** — include trade-offs for each
5. **Present design in sections** — get approval on each before continuing
6. **Write design documentation** — save to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`, commit to git
7. **Self-review the spec** — check for placeholders, contradictions, ambiguity, scope creep
8. **Get user approval** of the written spec
9. **Invoke writing-plans** — the only next step after approval

## Principles

- **One question per message** — never list multiple questions at once
- **YAGNI** — ruthlessly remove anything not required right now
- **Multiple choice over open-ended** — offer options whenever possible
- **Incremental validation** — approval at each design stage, not just the end
- **Single purpose** — each design unit has one clear responsibility and interface

## Self-Review Checklist

Before presenting the spec for approval:
- [ ] No placeholder language ("TBD", "similar to X", "add validation later")
- [ ] No contradictions between sections
- [ ] No ambiguous terms without definitions
- [ ] Scope is appropriate — not over-engineered
- [ ] Every interface and type is named and defined

## What Comes After

The **only** skill invoked after brainstorming is `writing-plans`. No code, no scaffolding, no "quick prototype" — nothing until the spec is approved and the plan is written.
