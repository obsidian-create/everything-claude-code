---
name: prompt-engineering-mastery
description: Master-level prompting techniques for maximum AI output quality. Covers chain-of-thought, few-shot learning, role prompting, structured outputs, prompt chaining, and meta-prompting. Use whenever prompt quality needs to be maximized or results are suboptimal.
origin: ECC
---

# Prompt Engineering Mastery

Extract the absolute maximum quality from any LLM through systematic prompting strategies.

## When to Activate

- Output quality is suboptimal or inconsistent
- Task requires complex multi-step reasoning
- Need structured, predictable outputs
- Working on agentic pipelines where prompts are the interface
- Optimizing existing prompts for cost or quality

## Core Principles

1. **Clarity over cleverness** — be explicit, not implicit
2. **Structure mirrors intent** — format your prompt like the answer you want
3. **Context is leverage** — the right background unlocks better reasoning
4. **Constraints produce creativity** — boundaries sharpen outputs
5. **Iteration beats perfection** — measure, adjust, repeat

## Technique Catalog

### 1. Chain-of-Thought (CoT)

Force step-by-step reasoning before the final answer.

```
Bad:  "What is 17 * 23?"
Good: "What is 17 * 23? Think through this step by step."

Bad:  "Should we use microservices here?"
Good: "Should we use microservices for this project?
       Think through: team size, deployment complexity, data consistency
       requirements, and current scale. Then give your recommendation."
```

**When to use:** Math, logic, multi-factor decisions, code debugging.

### 2. Few-Shot Prompting

Show examples of input → desired output before your actual request.

```
Convert these user descriptions to JSON:

Input: "I need a red button that says Submit"
Output: {"type": "button", "color": "red", "label": "Submit"}

Input: "A large blue header with the text Welcome"
Output: {"type": "header", "size": "large", "color": "blue", "text": "Welcome"}

Input: "A small green link to /about"
Output:
```

**Pattern:**
- Use 2–5 examples
- Cover edge cases in examples
- Keep examples concise but representative

### 3. Role / Persona Prompting

Assign a specific expert identity to unlock specialized knowledge.

```
"You are a senior security engineer at a Fortune 500 company.
 Your job is to review this authentication code for vulnerabilities.
 Focus on: injection attacks, session management, privilege escalation."
```

**Effective roles:**
- "You are a staff engineer reviewing this for production readiness"
- "You are a skeptical QA engineer trying to break this feature"
- "You are a new developer reading this code for the first time"
- "You are a performance engineer profiling this for latency"

### 4. Structured Output Forcing

Define the exact format you want returned.

```
Analyze this bug report and respond ONLY with this JSON structure:
{
  "severity": "critical|high|medium|low",
  "category": "crash|logic|performance|security|ux",
  "root_cause": "one sentence",
  "fix_steps": ["step1", "step2"],
  "estimated_effort": "hours"
}

Bug report: [...]
```

**Patterns:**
- XML tags: `<analysis>`, `<recommendation>`, `<code>`
- Markdown headers for sectioned responses
- JSON for machine-readable output
- Numbered lists for ordered steps

### 5. Prompt Chaining

Break complex tasks into a pipeline of focused prompts.

```
Step 1 (Understand): "Summarize what this codebase does in 5 bullet points."
Step 2 (Analyze):    "Given this summary, identify the 3 riskiest areas for the migration."
Step 3 (Plan):       "For each risk area, propose a mitigation strategy."
Step 4 (Execute):    "Implement the mitigation for risk area #1."
```

**Rules:**
- Each step has one clear objective
- Output of step N is input to step N+1
- Validate output quality at each checkpoint

### 6. Negative Constraints

Tell the model what NOT to do — often more effective than positive instructions.

```
"Refactor this function. Do NOT:
 - Change the public API signature
 - Add new dependencies
 - Add comments (existing ones are fine)
 - Change error handling behavior"
```

### 7. Self-Consistency

Generate multiple solutions, then synthesize the best.

```
"Generate 3 different approaches to implement this feature.
 For each: describe the approach, list pros/cons, estimate complexity.
 Then recommend which approach to use and why."
```

### 8. Meta-Prompting

Ask the model to improve its own prompt.

```
"Here is my prompt: [original prompt]
 Identify weaknesses in this prompt that would lead to poor outputs.
 Rewrite it to be clearer, more specific, and more likely to get
 a high-quality response."
```

### 9. Socratic Prompting

Use questions to guide deeper exploration.

```
"Before answering, ask me 3 clarifying questions that would
 significantly improve the quality of your response."
```

### 10. Tree of Thought

Explore multiple reasoning paths before committing.

```
"Consider this problem from 3 different angles:
 1. From a performance perspective
 2. From a maintainability perspective
 3. From a security perspective

 For each angle, explore 2-3 approaches. Then identify the approach
 that best balances all three perspectives."
```

## System Prompt Patterns

### Expert Framing
```
You are an expert [role] with 15+ years experience in [domain].
You think carefully before answering, consider edge cases, and
always flag uncertainty. Your responses are precise and actionable.
```

### Output Contract
```
For every response:
- Start with a one-sentence summary
- Follow with detailed reasoning
- End with concrete next steps
- Flag any assumptions you made
```

### Constraint Setting
```
Constraints:
- Max response: 500 words
- Code examples: TypeScript only
- No theoretical explanations — practical examples only
- If unsure, say so explicitly
```

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|---|---|---|
| Vague verbs: "analyze", "help", "improve" | Unclear success criteria | Use specific verbs: "list", "rank", "rewrite", "compare" |
| Leading questions | Confirmation bias | Ask open-ended, then evaluate |
| Overloaded prompts | Diluted focus | Split into chained prompts |
| No output format | Inconsistent structure | Always specify format |
| Missing context | Wrong assumptions | Include relevant constraints and background |
| "Be creative" without bounds | Unpredictable output | Define the creative space explicitly |

## Quality Calibration

After getting a response, ask:

```
"Rate the quality of your previous response on these dimensions (1-10):
 - Completeness: did you cover everything asked?
 - Accuracy: how confident are you in correctness?
 - Actionability: can this be immediately acted upon?

 Where you scored below 8, explain why and provide an improved version."
```

## Iterative Refinement Loop

```
1. Write initial prompt
2. Get response
3. Identify gap between response and ideal output
4. Add one targeted constraint or example to address the gap
5. Re-run
6. Repeat until output meets bar
```

Stop when: response is consistent across 3 runs with varied phrasing.

## Cost vs. Quality Trade-offs

| Technique | Quality Boost | Token Cost | Use When |
|---|---|---|---|
| Chain-of-thought | High | +30-50% | Complex reasoning |
| Few-shot (3 examples) | High | +20-40% | Formatting, classification |
| Role prompting | Medium | +5% | Domain expertise needed |
| Self-consistency (3x) | Very high | +200% | Critical decisions |
| Structured output | Medium | +10% | Machine-readable output needed |
| Negative constraints | Medium | +5% | Avoiding known failure modes |
