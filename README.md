# Telos

> You define meaning. Agents define execution.

---

## What Is This

Telos is a minimal framework for intent-driven agentic development on [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

You provide one thing: **what matters and why.**
The system designs itself around your intent — including which agents to create, how they coordinate, and when to restructure.

There is no pre-defined agent topology. No boilerplate orchestration. You state your goal, and a meta-agent designs the optimal development workflow at runtime.

---

## How It Works

```
You run `npx @youssefaltai/telos init`
    └── CLI asks what you're building, what success looks like, what's out of scope
          └── Generates 3 files: INTENT.md, CLAUDE.md, .claude/agents/meta-agent.md
                └── You open Claude Code and say "begin."
                      └── Meta-agent reads your intent
                            └── Designs the agent topology your project needs
                                  └── Writes agent definitions to .claude/agents/
                                        └── Goes dormant. Orchestrator takes over.
                                              └── Agents do the work. System self-improves.
```

---

## What Gets Generated

Telos generates exactly 3 files:

| File | Purpose |
|------|---------|
| `INTENT.md` | Your goal, success criteria, and non-goals. Written once, never modified by agents. |
| `CLAUDE.md` | Entry point for Claude Code. Tells it how to bootstrap and orchestrate. |
| `.claude/agents/meta-agent.md` | The agent that designs all other agents based on your intent. |

Everything else — the agent topology, the hooks, the coordination logic — is decided at runtime by the meta-agent.

---

## Getting Started

### 1. Initialize

```bash
npx @youssefaltai/telos init
```

Answer the prompts about your project's goal, success criteria, and boundaries.

### 2. Bootstrap

Open Claude Code in the project directory and say:

```
begin.
```

The meta-agent analyzes your intent and generates the agents your project needs — real Claude Code subagents with tool restrictions, model selection, and worktree isolation.

### 3. Build

Once bootstrapped, give tasks naturally. The orchestrator dispatches to the right agents. You only get interrupted when a decision genuinely requires you.

---

## Key Ideas

**No pre-defined topology.** The meta-agent decides what agents your project needs. A simple project might get 3 agents. A complex one might get 10. The topology fits the intent, not the other way around.

**Native Claude Code subagents.** Every agent is a real `.claude/agents/*.md` definition — not a role-played persona. Each agent has its own tool restrictions, model selection, and optional worktree isolation.

**Self-improving.** The meta-agent goes dormant after bootstrap. It reactivates when the system needs restructuring — repeated failures, scope changes, topology gaps, or major milestones.

**Mechanical enforcement.** Rules that matter are enforced through tool restrictions and hooks, not prompt instructions agents promise to follow. A critic agent that cannot edit files will never accidentally edit files.

**Locked intent.** INTENT.md is the root truth. No agent modifies it. Everything downstream serves it.

---

## The One Thing That Stays Human

In a fully recursive system, one input is irreducible: **does this matter?**

You answer that in INTENT.md.
Everything else is agent territory.
