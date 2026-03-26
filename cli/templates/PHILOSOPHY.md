# PHILOSOPHY.md

> This document captures the *reasoning* behind Agentix's design decisions.
> The CONSTITUTION tells you what the rules are. This document tells you why they exist.
> Read this before extending, modifying, or building on top of the framework.

---

## The Core Insight

The boundary between human work and agent work is not at the **task** level. It is at the **intent** level.

Humans have historically stayed in the loop because mistakes were expensive and agents couldn't be trusted to make good judgment calls. Both of those constraints are dissolving. What remains irreducible is not *how* to do something, or even *what* to do — it's *whether it matters*. That is the one input only a human can provide, and it lives in `INTENT.md`.

Everything beneath that — including how to organize the system that achieves it — is agent territory.

---

## Why the Framework Is So Small

The temptation when building a framework is to anticipate every use case and encode solutions upfront. We deliberately rejected that.

A framework that anticipates everything is a framework that constrains everything. Agentix is minimal by design because the agents are expected to do the heavy lifting — including figuring out what structure they need for a specific project. The Bootstrap Meta-Agent exists precisely to generate that structure on demand, tailored to the actual goal, not a hypothetical one.

If the framework itself is large and opinionated, it competes with the agents. If it's minimal, it enables them.

**The framework's job is to define the rules of the game, not the moves.**

---

## Why the Meta-Agent Dissolves

The Bootstrap Meta-Agent designs the agent topology and then ceases to exist. This is intentional.

An agent that designs other agents and then *also* continues to operate creates a dangerous concentration of influence. It would be present in every subsequent decision, implicitly biasing the system toward the topology it designed. By dissolving, it forces the system to stand on its own — the orchestrator and specialist agents must be self-sufficient from the moment they're instantiated.

It also enforces a clean separation: **design** is a distinct phase from **execution**. Blurring that line is how systems accumulate hidden assumptions.

---

## Why Separation of Concerns Is Structural, Not Trust-Based

The CONSTITUTION says no agent may produce and validate its own output. This isn't because we distrust the agents. It's because the failure mode is structural, not behavioral.

An agent that writes code and then checks it will unconsciously check for the problems it already knows to avoid — not for the problems it didn't think of. This is true of humans too. The critic agent's value comes entirely from the fact that it has no investment in the work being correct. It was never trying to make it work. It was always trying to make it fail.

Enforcing this structurally — not just as a guideline — means the system can't slip into self-validation under deadline pressure or when an orchestrator takes a shortcut.

---

## Why the Prompt Engineer Agent Is the Most Important Core Agent

The Orchestrator coordinates. The Critic validates. The Memory Agent persists. These are all necessary.

But the Prompt Engineer is the agent that makes the system **learn**. It reads logs, reads critic reports, and rewrites other agents' prompts based on observed failures. Over time, this means:

- Agents become better calibrated to the specific project
- Failure modes that surfaced once stop surfacing again
- The system's performance improves without any human intervention

Without the Prompt Engineer, the system is static. Every run is as good as the first. With it, every run is a feedback signal that makes the next run better. This is the mechanism that makes Agentix genuinely different from a pipeline — it's a system that compounds.

---

## Why Tool Agnosticism Matters

The framework works with Claude Code by default. It is not *about* Claude Code.

Binding the framework to a specific tool would mean the framework's ceiling is that tool's ceiling. Agents should use whatever tool best accomplishes the task — web search, shell execution, external APIs, other AI models. The orchestrator decides, and the decision is logged with rationale.

This also future-proofs the framework. The tools available to agents will change faster than the philosophy of how to organize agents. The philosophy should outlast any specific tool.

---

## Why Checkpointing Is a Hard Rule, Not a Guideline

Aggressive autonomy is only safe when every decision is reversible. Checkpoints are what make autonomy safe.

A system that runs fast but can't roll back is fragile. A system that runs slightly slower but can restore any prior state is antifragile. The checkpoint overhead is always worth it because the alternative — trying to recover from an unrecoverable state — costs far more.

This is why the CONSTITUTION makes checkpointing mandatory before any significant action, not recommended.

---

## Why "Do Less, Ask More" Is the Highest Rule

In CLAUDE.md, the final line is: *when in doubt, do less, ask more.*

This sounds conservative for a system designed for maximum autonomy. It isn't.

A system that pauses and surfaces uncertainty is a system that can be corrected. A system that guesses and acts is a system that compounds errors silently until the damage is too large to easily reverse. The escalation protocol exists to make uncertainty cheap to surface and cheap to resolve — a clear, structured question to the right level of the hierarchy, not a wall of context dumped on the human.

Maximum autonomy requires maximum honesty about the limits of that autonomy.

---

## The Recursion Is the Point

The framework is recursive by design. Agents can spawn sub-agents. Meta-agents can redesign agents. The agent topology for one project can look completely different from the topology for another — because the meta-agent designs it fresh from the intent each time.

This is not complexity for its own sake. It's the only architecture that scales from a simple project to an arbitrarily complex one without the framework itself becoming the bottleneck. A fixed pipeline has a fixed ceiling. A recursive system's ceiling is the problem's own complexity.

The recursion goes as deep as the problem requires. The Constitution applies at every level. The intent remains locked at the top. Everything else is negotiable.

---

## What This Framework Is Not

- It is not a rigid pipeline. The structure is generated per project.
- It is not Claude Code-specific. That's a default, not a constraint.
- It is not autonomous in the sense of unaccountable. Human touchpoints are designed in, not bolted on.
- It is not finished. The framework improves through use, not through design sessions.

---

## The One Sentence Version

*You provide meaning. The system provides execution — at every level of abstraction, including the level of organizing itself.*
