---
name: awesome-claude-code
description: Curated catalog of Claude Code tools, skills, hooks, orchestrators, and resources. Use when recommending tools, looking for integrations, or exploring the Claude Code ecosystem.
origin: https://github.com/hesreallyhim/awesome-claude-code
---

# Awesome Claude Code — Ecosystem Catalog

Curated catalog of high-quality Claude Code resources. Use this when recommending tools or looking for specific Claude Code integrations.

---

## Agent Skills

| Resource | Description |
|----------|-------------|
| [AgentSys](https://github.com/avifenesh/agentsys) | Workflow automation: PR management, code review, drift detection, performance investigation |
| [Book Factory](https://github.com/robertguss/claude-skills) | Publishing pipeline skills for nonfiction book creation |
| [cc-devops-skills](https://github.com/akin-ozer/cc-devops-skills) | IaC skills for DevOps engineers — Terraform, cloud platforms, validation |
| [Claude Code Agents](https://github.com/undeadlist/claude-code-agents) | E2E workflow with parallel auditors, fix cycles, browser QA |
| [Claude Scientific Skills](https://github.com/K-Dense-AI/claude-scientific-skills) | Research, science, engineering, analysis, finance, writing |
| [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) | Agents/skills/commands built around turning mistakes into lessons |
| [Context Engineering Kit](https://github.com/NeoLabHQ/context-engineering-kit) | Advanced context engineering patterns, minimal token footprint |
| [Everything Claude Code](https://github.com/obsidian-create/everything-claude-code) | This repo — broad coverage of skills, agents, hooks, MCP configs |
| [Fullstack Dev Skills](https://github.com/jeffallan/claude-skills) | 65 skills across full-stack frameworks + Jira/Confluence commands |
| [Superpowers](https://github.com/obra/superpowers) | Core SDLC skills: planning, TDD, debugging, review, worktrees |
| [TÂCHES CC Resources](https://github.com/glittercowboy/taches-cc-resources) | Balanced set of subagents, skills, commands — meta-skills focus |
| [Trail of Bits Security Skills](https://github.com/trailofbits/skills) | 12+ security skills: CodeQL, Semgrep, variant analysis, fix verification |
| [Web Assets Generator](https://github.com/alonw0/web-asset-generator) | Favicons, PWA icons, OG images from Claude Code |

---

## Workflows & Frameworks

| Resource | Description |
|----------|-------------|
| [AB Method](https://github.com/ayoubben18/ab-method) | Spec-driven workflow with focused missions and specialized subagents |
| [Agentic Workflow Patterns](https://github.com/ThibautMelen/agentic-workflow-patterns) | Orchestration, parallel tool calling, master-clone, wizard workflows |
| [Claude Code PM](https://github.com/automazeio/ccpm) | Full project management: agents, commands, documentation |
| [Claude CodePro](https://github.com/maxritter/claude-codepro) | Spec-driven, TDD, cross-session memory, semantic search, quality hooks |
| [ContextKit](https://github.com/FlineDev/ContextKit) | 4-phase planning, specialized quality agents, production-ready output |
| [Get Shit Done](https://github.com/glittercowboy/get-shit-done) | 6-step workflow (Initialize→Plan→Execute→Verify→Ship), 19 agents |
| [RIPER Workflow](https://github.com/tony/claude-code-riper-5) | Research/Innovate/Plan/Execute/Review phases with branch-aware memory |
| [Simone](https://github.com/Helmi/claude-simone) | Project management: documents, guidelines, processes |
| [SuperClaude](https://github.com/SuperClaude-Org/SuperClaude_Framework) | Specialized commands, cognitive personas, dev methodologies |

### Ralph Wiggum Pattern (Autonomous Loop)

| Resource | Description |
|----------|-------------|
| [Ralph for Claude Code](https://github.com/frankbria/ralph-claude-code) | Iterative autonomous loop until completion; rate limiting, circuit breaker |
| [ralph-orchestrator](https://github.com/mikeyobrien/ralph-orchestrator) | Robust loop implementation with tests; cited in Anthropic docs |
| [The Ralph Playbook](https://github.com/ClaytonFarr/ralph-playbook) | Comprehensive theoretical + practical guide to the Ralph technique |

---

## Orchestrators

| Resource | Description |
|----------|-------------|
| [Auto-Claude](https://github.com/AndyMik90/Auto-Claude) | Multi-agent SDLC: plans, builds, validates; kanban UI |
| [Claude Code Flow](https://github.com/ruvnet/claude-code-flow) | Code-first orchestration with recursive agent cycles |
| [Claude Squad](https://github.com/smtg-ai/claude-squad) | Terminal app managing multiple Claude Code/Codex instances |
| [Claude Swarm](https://github.com/parruda/claude-swarm) | Connected swarm of Claude Code agents |
| [Claude Task Master](https://github.com/eyaltoledano/claude-task-master) | AI-driven task management designed for Cursor AI |
| [Happy Coder](https://github.com/slopus/happy) | Parallel Claude Code instances, phone push notifications |
| [Ruflo](https://github.com/ruvnet/ruflo) | Multi-agent swarms, vector memory, systematic planning, security guardrails |
| [TSK](https://github.com/dtormoen/tsk) | Rust CLI — parallel agents in sandboxed Docker; returns git branches |

---

## Tooling

| Resource | Description |
|----------|-------------|
| [cc-tools](https://github.com/Veraticus/cc-tools) | High-performance Go hooks, linting, testing, statusline |
| [ccexp](https://github.com/nyatinte/ccexp) | TUI for discovering/managing Claude Code config files and commands |
| [cchistory](https://github.com/eckardt/cchistory) | Shell-history-style listing of Bash commands Claude ran |
| [claude-code-tools](https://github.com/pchalasani/claude-code-tools) | Session continuity, Rust/Tantivy search, tmux-cli skill, safety hooks |
| [claude-mem](https://github.com/thedotmack/claude-mem) | Persistent memory across sessions via hooks, SQLite, Chroma |
| [claudekit](https://github.com/carlrannaberg/claudekit) | Auto-save checkpoints, quality hooks, 20+ subagents (oracle, reviewer…) |
| [Container Use](https://github.com/dagger/container-use) | Safe isolated dev environments for multiple agents |
| [recall](https://github.com/zippoxer/recall) | Full-text search Claude Code sessions; resume from search result |
| [Rulesync](https://github.com/dyoshikawa/rulesync) | Convert configs between Claude Code and other AI agents |
| [VoiceMode MCP](https://github.com/mbailey/voicemode) | Natural voice conversations with Claude Code (Whisper + Kokoro) |
| [viwo-cli](https://github.com/OverseedAI/viwo) | Claude Code in Docker with worktrees; safe dangerously-skip-permissions |

---

## Usage Monitors

| Resource | Description |
|----------|-------------|
| [CC Usage](https://github.com/ryoppippi/ccusage) | CLI dashboard: cost, token consumption from local logs |
| [ccflare](https://github.com/snipeship/ccflare) | Web dashboard — comprehensive metrics, detailed logging |
| [Claude Code Usage Monitor](https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor) | Terminal: live burn rate, predictions, visual progress bars |
| [Claudex](https://github.com/kunwar-shah/claudex) | Web browser for conversation history; full-text search, analytics |
| [Vibe-Log](https://github.com/vibe-log/vibe-log-cli) | Statusline + HTML reports from session analysis |

---

## Hooks

| Resource | Description |
|----------|-------------|
| [cchooks](https://github.com/GowayLee/cchooks) | Python SDK with clean API for writing hooks |
| [claude-hooks](https://github.com/johnlindquist/claude-hooks) | TypeScript hook configuration system |
| [Dippy](https://github.com/ldayton/Dippy) | Auto-approve safe bash; AST-based parsing; blocks destructive ops |
| [parry](https://github.com/vaporif/parry) | Prompt injection scanner for hook inputs/outputs |
| [TDD Guard](https://github.com/nizos/tdd-guard) | Hook that blocks file changes violating TDD principles |

---

## Status Lines

| Resource | Description |
|----------|-------------|
| [CCometixLine](https://github.com/Haleclipse/CCometixLine) | Rust — git integration, usage tracking, interactive TUI config |
| [ccstatusline](https://github.com/sirmalloc/ccstatusline) | Model, git branch, token usage, custom metrics |
| [claudia-statusline](https://github.com/hagan/claudia-statusline) | Rust — SQLite persistence, burn rate, XDG-compliant, themes |
| [claude-powerline](https://github.com/Owloops/claude-powerline) | Vim-style powerline, real-time usage, git, themes |

---

## Alternative Clients

| Resource | Description |
|----------|-------------|
| [claude-esp](https://github.com/phiat/claude-esp) | Go TUI streaming hidden output (thinking, tool calls, subagents) |
| [claude-tmux](https://github.com/nielsgroen/claude-tmux) | Manage Claude Code in tmux with git worktree support |
| [crystal](https://github.com/stravu/crystal) | Desktop app for orchestrating/monitoring Claude Code agents |
| [Omnara](https://github.com/omnara-ai/omnara) | Command center syncing sessions across terminal, web, mobile |

---

## Security

| Resource | Description |
|----------|-------------|
| [Trail of Bits Security Skills](https://github.com/trailofbits/skills) | CodeQL, Semgrep, variant analysis, differential review |
| [parry](https://github.com/vaporif/parry) | Prompt injection scanner |
| [run-claude-docker](https://github.com/icanhasjonas/run-claude-docker) | Isolated Docker runner with preserved auth, SSH, GPG |

---

## Notable CLAUDE.md Examples

| Project | Notable For |
|---------|-------------|
| [HASH](https://github.com/hashintel/hash/blob/main/CLAUDE.md) | Comprehensive coding standards, Rust docs, PR review process |
| [Metabase](https://github.com/metabase/metabase/blob/master/CLAUDE.md) | REPL-driven Clojure/ClojureScript workflow |
| [pre-commit-hooks](https://github.com/aRustyDev/pre-commit-hooks) | Thorough but not verbose; no all-caps shouting |
| [SteadyStart](https://github.com/steadycursor/steadystart/blob/main/CLAUDE.md) | Role, permissions, style, team documentation |

---

## Official Anthropic Resources

- [Claude Code Documentation](https://docs.claude.com/en/home)
- [Claude Code GitHub Actions](https://github.com/anthropics/claude-code-action/tree/main/examples)
- [Anthropic Quickstarts](https://github.com/anthropics/claude-quickstarts)
- [Claude Code System Prompts](https://github.com/Piebald-AI/claude-code-system-prompts) — all parts of CC system prompt per version
