# Agentix CLI — Design Spec

## Overview

An npm package (`agentix`) that scaffolds the Agentix framework into an empty directory via `npx agentix init`. It interactively collects the user's project intent and produces a fully populated, ready-to-bootstrap Agentix project.

Target audience: developers who use Claude Code.

## CLI Flow

```
$ npx agentix init
```

### Guard: empty directory only

If the current directory contains any files or directories (excluding `.git`), the CLI refuses:

```
This directory is not empty. Agentix init works in empty directories only.
```

### Interactive prompts

Three questions, asked one at a time:

1. **What are you building?** (required — refuse if empty)
2. **What does success look like?** (required — refuse if empty)
3. **Anything explicitly out of scope?** (optional — enter to skip)

Multiline input supported. Empty line to finish each answer.

### Output

On success, the CLI:

1. Writes all framework files to the current directory (see File Output below)
2. Injects the user's answers into INTENT.md (no placeholders remain)
3. If "out of scope" was skipped, that section is removed from INTENT.md entirely
4. Prints:

```
  ✓ Agentix initialized.

  Your intent is in INTENT.md — edit it anytime.
  Open Claude Code and say: Read CLAUDE.md and begin.
```

## File Output

The following files are written to the current directory:

```
./
├── INTENT.md              # Populated with user's answers
├── CONSTITUTION.md        # Verbatim from template
├── CLAUDE.md              # Verbatim from template
├── PHILOSOPHY.md          # Verbatim from template
├── .gitignore             # Verbatim from template
├── bootstrap/
│   └── meta-agent.md      # Verbatim from template
├── agents/
│   └── core.md            # Verbatim from template
├── checkpoints/
│   └── .gitkeep
├── logs/
│   └── .gitkeep
└── memory/
    └── .gitkeep
```

## INTENT.md Generation

The CLI builds INTENT.md from a template, replacing placeholder sections with the user's answers:

```markdown
# INTENT

> This file is the root of the system. It is written by a human and cannot be modified by any agent.
> Every agent at every level reads this first. If anything conflicts with this, this wins.

---

## What We Are Building

{answer to question 1}

## What Success Looks Like

{answer to question 2}

## What We Are Not Building

{answer to question 3, or section removed if skipped}

## Values That Must Be Preserved

- Simplicity over cleverness
- Reversibility over speed
- Correctness over completeness

---

*This document defines meaning. Agents define execution.*
```

## Package Structure

```
agentix/
├── package.json
├── bin/
│   └── agentix.js         # CLI entry point, parses "init" subcommand
├── src/
│   └── init.js            # Prompt logic, file writing
└── templates/             # Framework files, copied verbatim (except INTENT.md)
    ├── CLAUDE.md
    ├── CONSTITUTION.md
    ├── INTENT.md           # Template with placeholders
    ├── PHILOSOPHY.md
    ├── .gitignore
    ├── bootstrap/
    │   └── meta-agent.md
    └── agents/
        └── core.md
```

## Technical Decisions

- **Zero runtime dependencies.** Uses only Node.js built-ins: `node:readline`, `node:fs`, `node:path`.
- **ESM.** `"type": "module"` in package.json.
- **Minimum Node 18.** For stable `node:` prefix imports.
- **No build step.** Plain JS, runs directly.
- **Single command.** `npx agentix init` is the only command. Running `npx agentix` without a subcommand prints usage.

## Edge Cases

| Scenario | Behavior |
|---|---|
| Directory not empty | Refuse with message |
| No input for required question | Refuse with message |
| User hits Ctrl+C | Exit cleanly, no partial files written |
| No `init` subcommand | Print usage: `Usage: agentix init` |
| `.git` directory present | Allowed — common to `git init` before scaffolding |
