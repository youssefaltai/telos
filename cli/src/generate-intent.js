export function generateIntent({ building, success, nonGoals }) {
  const sections = [
    `# INTENT

> This file is the root of the system. It is written by a human and cannot be modified by any agent.
> Every agent at every level reads this first. If anything conflicts with this, this wins.

---

## What We Are Building

${building}

## What Success Looks Like

${success}`,
  ];

  if (nonGoals) {
    sections.push(`\n## What We Are Not Building\n\n${nonGoals}`);
  }

  sections.push(`
## Values That Must Be Preserved

- Simplicity over cleverness
- Reversibility over speed
- Correctness over completeness

---

*This document defines meaning. Agents define execution.*`);

  return sections.join('\n');
}
