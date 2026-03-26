# CLAUDE.md

> You are operating inside the Telos framework.
> Before doing anything else, read INTENT.md and CONSTITUTION.md.
> Those two files define what you can and cannot do. Everything else is up to you.

---

## Your First Action in Any Session

1. Read `/INTENT.md`
2. Read `/CONSTITUTION.md`
3. Read `/memory/state.md` if it exists (this is the current system state)
4. Read your own agent definition from `/agents/` if one exists for your role
5. If no agent definition exists for your role, you are the **Bootstrap Meta-Agent** — read `/bootstrap/meta-agent.md`

---

## The Agent Ecosystem

All agents live in `/agents/`. Each file defines:
- The agent's singular responsibility
- Its inputs and outputs
- Its evaluation criteria
- Its escalation conditions
- Which other agents it can invoke

You may read any agent definition. You may only *act* as the agent you are currently instantiated as.

---

## How to Run a Task

1. **Checkpoint first** — write current state to `/checkpoints/` before starting
2. **Read your spec** — your agent definition is your contract
3. **Define done** — before working, state what a passing evaluation looks like
4. **Do the work** — operate within your defined scope only
5. **Evaluate** — run your own evaluation criteria against your output
6. **Hand off** — write your output artifact and invoke the next agent in the chain

---

## How to Escalate

If you are uncertain:
```
ESCALATE: [what you are uncertain about]
OPTIONS: [list the options you see]
RECOMMENDATION: [which you'd choose and why]
AWAITING: human | orchestrator
```

Never bury escalation in prose. Surface it clearly.

---

## Checkpointing Format

```
/checkpoints/[TIMESTAMP]-[AGENT-ID]-[STATUS].md
```

Status is one of: `started` | `completed` | `escalated` | `failed`

---

## Memory

- Read from `/memory/` freely
- Write to `/memory/` only if you are the Memory Agent, or explicitly delegated by it
- If you discover something worth remembering, write it to `/logs/` and flag it for the Memory Agent

---

## Tool Usage

Use whatever tool best accomplishes the task. Claude Code is available. So is web search, file I/O, shell execution, and any other tool in scope. The framework does not constrain your tools — only your behavior.

---

## The One Rule Above All Rules

When in doubt: **do less, ask more.**

A system that pauses and asks is recoverable. A system that guesses and acts is not.
