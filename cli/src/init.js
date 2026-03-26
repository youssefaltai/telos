import fs from 'node:fs';
import { createInterface } from 'node:readline';
import { ask, readAllLines } from './prompt.js';
import { generateIntent } from './generate-intent.js';
import { writeProject } from './write-project.js';

export function isDirEmpty(dir) {
  const entries = fs.readdirSync(dir);
  return entries.every((entry) => entry === '.git');
}

export async function init(targetDir, { input, output } = {}) {
  const inp = input || process.stdin;
  const out = output || process.stdout;

  out.write('\n  telos\n\n');

  // Guard: directory must be empty
  if (!isDirEmpty(targetDir)) {
    out.write('  This directory is not empty. Telos init works in empty directories only.\n');
    return false;
  }

  // For piped/test input: pre-buffer all lines (stream is finite)
  // For interactive input: share a single readline interface across calls
  let opts;
  if (input) {
    const lines = await readAllLines(inp);
    opts = { output: out, lines };
  } else {
    const rl = createInterface({ input: inp, output: out, terminal: false });
    opts = { output: out, rl };
  }

  // Question 1: What are you building? (required)
  const building = await ask('What are you building?', opts);
  if (!building) {
    out.write('  No intent provided. Run telos init again when you\'re ready.\n');
    return false;
  }

  // Question 2: What does success look like? (required)
  const success = await ask('What does success look like?', opts);
  if (!success) {
    out.write('  No success criteria provided. Run telos init again when you\'re ready.\n');
    return false;
  }

  // Question 3: Anything out of scope? (optional)
  const nonGoals = await ask('Anything explicitly out of scope? (press enter to skip)', opts);

  // Generate INTENT.md and write all files
  const intentContent = generateIntent({ building, success, nonGoals });
  writeProject(targetDir, intentContent);

  out.write('\n  \u2713 Telos initialized.\n\n');
  out.write('  Your intent is in INTENT.md \u2014 edit it anytime.\n');
  out.write('  Open Claude Code and say: Read CLAUDE.md and begin.\n\n');

  if (opts.rl) opts.rl.close();
}
