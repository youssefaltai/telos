# Agentix CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an npm package (`agentix`) that scaffolds the Agentix framework into an empty directory via `npx agentix init`.

**Architecture:** Single npm package with a `bin/agentix.js` entry point that delegates to `src/init.js`. Template files are bundled in `templates/` and copied verbatim, except INTENT.md which is generated from user input. Zero runtime dependencies — Node.js built-ins only.

**Tech Stack:** Node.js 18+, ESM, `node:readline`, `node:fs`, `node:path`

---

## File Structure

```
cli/
├── package.json              # npm package config, bin entry
├── bin/
│   └── agentix.js            # CLI entry point — parse args, route to init
├── src/
│   ├── init.js               # Main init flow: guard, prompt, write
│   ├── prompt.js             # Multiline readline prompting
│   ├── write-project.js      # Write all files to target directory
│   └── generate-intent.js    # Build INTENT.md from user answers
├── templates/
│   ├── CLAUDE.md
│   ├── CONSTITUTION.md
│   ├── PHILOSOPHY.md
│   ├── gitignore             # Named without dot (npm ignores .gitignore in packages)
│   ├── bootstrap/
│   │   └── meta-agent.md
│   └── agents/
│       └── core.md
└── tests/
    ├── init.test.js
    ├── prompt.test.js
    ├── write-project.test.js
    └── generate-intent.test.js
```

The CLI lives in a `cli/` subdirectory within the repo, keeping it separate from the framework's own files.

---

### Task 1: Package scaffolding

**Files:**
- Create: `cli/package.json`
- Create: `cli/bin/agentix.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "agentix",
  "version": "0.1.0",
  "description": "Scaffold an Agentix project — intent-driven recursive agentic development",
  "type": "module",
  "bin": {
    "agentix": "./bin/agentix.js"
  },
  "engines": {
    "node": ">=18"
  },
  "files": [
    "bin/",
    "src/",
    "templates/"
  ],
  "keywords": ["agentix", "agents", "ai", "scaffold", "cli"],
  "license": "MIT"
}
```

- [ ] **Step 2: Create bin/agentix.js**

```js
#!/usr/bin/env node

import { init } from '../src/init.js';

const command = process.argv[2];

if (command === 'init') {
  init(process.cwd());
} else {
  console.log('Usage: agentix init');
  process.exit(1);
}
```

- [ ] **Step 3: Make bin executable and verify**

Run: `chmod +x cli/bin/agentix.js && head -1 cli/bin/agentix.js`
Expected: `#!/usr/bin/env node`

- [ ] **Step 4: Commit**

```bash
git add cli/package.json cli/bin/agentix.js
git commit -m "feat: scaffold agentix cli package with bin entry point"
```

---

### Task 2: Multiline prompt utility

**Files:**
- Create: `cli/tests/prompt.test.js`
- Create: `cli/src/prompt.js`

- [ ] **Step 1: Write failing test for prompt utility**

```js
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { ask } from '../src/prompt.js';

function createMockInput(lines) {
  const input = new Readable({ read() {} });
  for (const line of lines) {
    input.push(line + '\n');
  }
  input.push(null);
  return input;
}

function createMockOutput() {
  const chunks = [];
  const output = new Writable({
    write(chunk, enc, cb) { chunks.push(chunk.toString()); cb(); }
  });
  output.chunks = chunks;
  return output;
}

describe('ask', () => {
  it('collects multiline input until empty line', async () => {
    const input = createMockInput(['line one', 'line two', '']);
    const output = createMockOutput();
    const result = await ask('Question?', { input, output });
    assert.equal(result, 'line one\nline two');
  });

  it('trims whitespace from each line', async () => {
    const input = createMockInput(['  hello  ', '']);
    const output = createMockOutput();
    const result = await ask('Q?', { input, output });
    assert.equal(result, 'hello');
  });

  it('returns empty string when user enters blank line immediately', async () => {
    const input = createMockInput(['']);
    const output = createMockOutput();
    const result = await ask('Q?', { input, output });
    assert.equal(result, '');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli && node --test tests/prompt.test.js`
Expected: FAIL — cannot find module `../src/prompt.js`

- [ ] **Step 3: Implement prompt.js**

```js
import { createInterface } from 'node:readline';

export async function ask(question, { input = process.stdin, output = process.stdout } = {}) {
  const rl = createInterface({ input, output, terminal: false });

  output.write(`  ${question}\n`);
  output.write('  (Empty line to finish)\n\n');
  output.write('  > ');

  const lines = [];

  for await (const raw of rl) {
    const line = raw.trim();
    if (line === '') break;
    lines.push(line);
    output.write('  > ');
  }

  rl.close();
  return lines.join('\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cli && node --test tests/prompt.test.js`
Expected: 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add cli/src/prompt.js cli/tests/prompt.test.js
git commit -m "feat: add multiline prompt utility"
```

---

### Task 3: INTENT.md generator

**Files:**
- Create: `cli/tests/generate-intent.test.js`
- Create: `cli/src/generate-intent.js`

- [ ] **Step 1: Write failing test**

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateIntent } from '../src/generate-intent.js';

describe('generateIntent', () => {
  it('produces full INTENT.md with all three answers', () => {
    const result = generateIntent({
      building: 'A task management API',
      success: 'Users can create and complete tasks via REST',
      nonGoals: 'No frontend, no auth',
    });

    assert.ok(result.includes('# INTENT'));
    assert.ok(result.includes('## What We Are Building'));
    assert.ok(result.includes('A task management API'));
    assert.ok(result.includes('## What Success Looks Like'));
    assert.ok(result.includes('Users can create and complete tasks via REST'));
    assert.ok(result.includes('## What We Are Not Building'));
    assert.ok(result.includes('No frontend, no auth'));
    assert.ok(result.includes('## Values That Must Be Preserved'));
  });

  it('omits non-goals section when nonGoals is empty', () => {
    const result = generateIntent({
      building: 'Something',
      success: 'It works',
      nonGoals: '',
    });

    assert.ok(!result.includes('## What We Are Not Building'));
    assert.ok(result.includes('## Values That Must Be Preserved'));
  });

  it('preserves default values section', () => {
    const result = generateIntent({
      building: 'X',
      success: 'Y',
      nonGoals: '',
    });

    assert.ok(result.includes('Simplicity over cleverness'));
    assert.ok(result.includes('Reversibility over speed'));
    assert.ok(result.includes('Correctness over completeness'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli && node --test tests/generate-intent.test.js`
Expected: FAIL — cannot find module

- [ ] **Step 3: Implement generate-intent.js**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cli && node --test tests/generate-intent.test.js`
Expected: 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add cli/src/generate-intent.js cli/tests/generate-intent.test.js
git commit -m "feat: add INTENT.md generator"
```

---

### Task 4: Template files

**Files:**
- Create: `cli/templates/CLAUDE.md`
- Create: `cli/templates/CONSTITUTION.md`
- Create: `cli/templates/PHILOSOPHY.md`
- Create: `cli/templates/gitignore`
- Create: `cli/templates/bootstrap/meta-agent.md`
- Create: `cli/templates/agents/core.md`

- [ ] **Step 1: Copy framework files into templates/**

Copy the following files from the repo root into `cli/templates/`:
- `CLAUDE.md` → `cli/templates/CLAUDE.md` (verbatim)
- `CONSTITUTION.md` → `cli/templates/CONSTITUTION.md` (verbatim)
- `PHILOSOPHY.md` → `cli/templates/PHILOSOPHY.md` (verbatim)
- `.gitignore` → `cli/templates/gitignore` (renamed — npm strips `.gitignore` from published packages)
- `bootstrap/meta-agent.md` → `cli/templates/bootstrap/meta-agent.md` (verbatim)
- `agents/core.md` → `cli/templates/agents/core.md` (verbatim)

- [ ] **Step 2: Verify all files exist**

Run: `find cli/templates -type f | sort`
Expected:
```
cli/templates/CLAUDE.md
cli/templates/CONSTITUTION.md
cli/templates/PHILOSOPHY.md
cli/templates/agents/core.md
cli/templates/bootstrap/meta-agent.md
cli/templates/gitignore
```

- [ ] **Step 3: Commit**

```bash
git add cli/templates/
git commit -m "feat: add framework template files"
```

---

### Task 5: File writer

**Files:**
- Create: `cli/tests/write-project.test.js`
- Create: `cli/src/write-project.js`

- [ ] **Step 1: Write failing test**

```js
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { writeProject } from '../src/write-project.js';

describe('writeProject', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentix-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('writes all framework files to the target directory', () => {
    const intentContent = '# INTENT\n\nTest intent';
    writeProject(tmpDir, intentContent);

    assert.ok(fs.existsSync(path.join(tmpDir, 'INTENT.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'CLAUDE.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'CONSTITUTION.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'PHILOSOPHY.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, '.gitignore')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'bootstrap', 'meta-agent.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'agents', 'core.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'checkpoints', '.gitkeep')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'logs', '.gitkeep')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'memory', '.gitkeep')));
  });

  it('writes the provided intent content to INTENT.md', () => {
    const intentContent = '# INTENT\n\nMy project intent';
    writeProject(tmpDir, intentContent);

    const written = fs.readFileSync(path.join(tmpDir, 'INTENT.md'), 'utf8');
    assert.equal(written, intentContent);
  });

  it('copies template gitignore as .gitignore', () => {
    writeProject(tmpDir, '# INTENT');

    const content = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf8');
    assert.ok(content.includes('checkpoints/*.md'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli && node --test tests/write-project.test.js`
Expected: FAIL — cannot find module

- [ ] **Step 3: Implement write-project.js**

```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(__dirname, '..', 'templates');

const TEMPLATE_FILES = [
  { src: 'CLAUDE.md', dest: 'CLAUDE.md' },
  { src: 'CONSTITUTION.md', dest: 'CONSTITUTION.md' },
  { src: 'PHILOSOPHY.md', dest: 'PHILOSOPHY.md' },
  { src: 'gitignore', dest: '.gitignore' },
  { src: 'bootstrap/meta-agent.md', dest: 'bootstrap/meta-agent.md' },
  { src: 'agents/core.md', dest: 'agents/core.md' },
];

const EMPTY_DIRS = ['checkpoints', 'logs', 'memory'];

export function writeProject(targetDir, intentContent) {
  // Write INTENT.md from generated content
  fs.writeFileSync(path.join(targetDir, 'INTENT.md'), intentContent);

  // Copy template files
  for (const { src, dest } of TEMPLATE_FILES) {
    const destPath = path.join(targetDir, dest);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(path.join(TEMPLATES, src), destPath);
  }

  // Create empty directories with .gitkeep
  for (const dir of EMPTY_DIRS) {
    const dirPath = path.join(targetDir, dir);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cli && node --test tests/write-project.test.js`
Expected: 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add cli/src/write-project.js cli/tests/write-project.test.js
git commit -m "feat: add project file writer"
```

---

### Task 6: Init flow (main orchestration)

**Files:**
- Create: `cli/tests/init.test.js`
- Create: `cli/src/init.js`

- [ ] **Step 1: Write failing test for empty directory guard**

```js
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { isDirEmpty } from '../src/init.js';

describe('isDirEmpty', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentix-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns true for an empty directory', () => {
    assert.equal(isDirEmpty(tmpDir), true);
  });

  it('returns true for a directory with only .git', () => {
    fs.mkdirSync(path.join(tmpDir, '.git'));
    assert.equal(isDirEmpty(tmpDir), true);
  });

  it('returns false for a directory with files', () => {
    fs.writeFileSync(path.join(tmpDir, 'file.txt'), 'hello');
    assert.equal(isDirEmpty(tmpDir), false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli && node --test tests/init.test.js`
Expected: FAIL — cannot find module

- [ ] **Step 3: Implement init.js**

```js
import fs from 'node:fs';
import { ask } from './prompt.js';
import { generateIntent } from './generate-intent.js';
import { writeProject } from './write-project.js';

export function isDirEmpty(dir) {
  const entries = fs.readdirSync(dir);
  return entries.every((entry) => entry === '.git');
}

export async function init(targetDir, { input, output } = {}) {
  const opts = {};
  if (input) opts.input = input;
  if (output) opts.output = output;

  const out = output || process.stdout;

  out.write('\n  agentix\n\n');

  // Guard: directory must be empty
  if (!isDirEmpty(targetDir)) {
    out.write('  This directory is not empty. Agentix init works in empty directories only.\n');
    process.exitCode = 1;
    return;
  }

  // Question 1: What are you building? (required)
  const building = await ask('What are you building?', opts);
  if (!building) {
    out.write('  No intent provided. Run agentix init again when you\'re ready.\n');
    process.exitCode = 1;
    return;
  }

  // Question 2: What does success look like? (required)
  const success = await ask('What does success look like?', opts);
  if (!success) {
    out.write('  No success criteria provided. Run agentix init again when you\'re ready.\n');
    process.exitCode = 1;
    return;
  }

  // Question 3: Anything out of scope? (optional)
  const nonGoals = await ask('Anything explicitly out of scope? (press enter to skip)', opts);

  // Generate INTENT.md and write all files
  const intentContent = generateIntent({ building, success, nonGoals });
  writeProject(targetDir, intentContent);

  out.write('\n  \u2713 Agentix initialized.\n\n');
  out.write('  Your intent is in INTENT.md \u2014 edit it anytime.\n');
  out.write('  Open Claude Code and say: Read CLAUDE.md and begin.\n\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cli && node --test tests/init.test.js`
Expected: 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add cli/src/init.js cli/tests/init.test.js
git commit -m "feat: add init flow with empty directory guard"
```

---

### Task 7: Integration test

**Files:**
- Create: `cli/tests/integration.test.js`

- [ ] **Step 1: Write integration test**

```js
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Readable, Writable } from 'node:stream';
import { init } from '../src/init.js';

function createMockInput(lines) {
  const input = new Readable({ read() {} });
  for (const line of lines) {
    input.push(line + '\n');
  }
  input.push(null);
  return input;
}

function createMockOutput() {
  const chunks = [];
  const output = new Writable({
    write(chunk, enc, cb) { chunks.push(chunk.toString()); cb(); }
  });
  output.chunks = chunks;
  output.text = () => chunks.join('');
  return output;
}

describe('agentix init (integration)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentix-int-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('scaffolds a complete project from user input', async () => {
    const input = createMockInput([
      'A REST API for task management',
      '',
      'Users can CRUD tasks, tests pass, deployed to prod',
      '',
      'No frontend, no mobile app',
      '',
    ]);
    const output = createMockOutput();

    await init(tmpDir, { input, output });

    // All files exist
    assert.ok(fs.existsSync(path.join(tmpDir, 'INTENT.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'CLAUDE.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'CONSTITUTION.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'PHILOSOPHY.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, '.gitignore')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'bootstrap', 'meta-agent.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'agents', 'core.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'checkpoints', '.gitkeep')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'logs', '.gitkeep')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'memory', '.gitkeep')));

    // INTENT.md has user content
    const intent = fs.readFileSync(path.join(tmpDir, 'INTENT.md'), 'utf8');
    assert.ok(intent.includes('A REST API for task management'));
    assert.ok(intent.includes('Users can CRUD tasks, tests pass, deployed to prod'));
    assert.ok(intent.includes('No frontend, no mobile app'));

    // Success message shown
    assert.ok(output.text().includes('Agentix initialized'));
  });

  it('scaffolds without non-goals section when skipped', async () => {
    const input = createMockInput([
      'A CLI tool',
      '',
      'It works',
      '',
      '',
    ]);
    const output = createMockOutput();

    await init(tmpDir, { input, output });

    const intent = fs.readFileSync(path.join(tmpDir, 'INTENT.md'), 'utf8');
    assert.ok(intent.includes('A CLI tool'));
    assert.ok(intent.includes('It works'));
    assert.ok(!intent.includes('What We Are Not Building'));
  });

  it('refuses non-empty directories', async () => {
    fs.writeFileSync(path.join(tmpDir, 'existing.txt'), 'hello');
    const input = createMockInput([]);
    const output = createMockOutput();

    await init(tmpDir, { input, output });

    assert.ok(output.text().includes('not empty'));
    assert.ok(!fs.existsSync(path.join(tmpDir, 'INTENT.md')));
  });

  it('allows directories with only .git', async () => {
    fs.mkdirSync(path.join(tmpDir, '.git'));
    const input = createMockInput([
      'Something',
      '',
      'It works',
      '',
      '',
    ]);
    const output = createMockOutput();

    await init(tmpDir, { input, output });

    assert.ok(fs.existsSync(path.join(tmpDir, 'INTENT.md')));
    assert.ok(output.text().includes('Agentix initialized'));
  });

  it('refuses when building question is empty', async () => {
    const input = createMockInput(['']);
    const output = createMockOutput();

    await init(tmpDir, { input, output });

    assert.ok(output.text().includes('No intent provided'));
    assert.ok(!fs.existsSync(path.join(tmpDir, 'INTENT.md')));
  });
});
```

- [ ] **Step 2: Run the full test suite**

Run: `cd cli && node --test tests/*.test.js`
Expected: All tests passing (unit + integration)

- [ ] **Step 3: Commit**

```bash
git add cli/tests/integration.test.js
git commit -m "test: add integration tests for full init flow"
```

---

### Task 8: Manual end-to-end verification

- [ ] **Step 1: Link the CLI locally**

Run: `cd cli && npm link`

- [ ] **Step 2: Test in a fresh directory**

Run:
```bash
tmpdir=$(mktemp -d)
cd "$tmpdir"
agentix init
```

Type:
```
A real-time multiplayer game server
<enter>
Players can connect, play, and see each other's moves with <100ms latency
<enter>
No single-player mode, no AI opponents
<enter>
```

Expected: All files created, INTENT.md populated, success message shown.

- [ ] **Step 3: Verify file contents**

Run: `cat "$tmpdir/INTENT.md"`
Expected: Full INTENT.md with the answers above, no placeholders.

Run: `ls -la "$tmpdir"`
Expected: INTENT.md, CLAUDE.md, CONSTITUTION.md, PHILOSOPHY.md, .gitignore, agents/, bootstrap/, checkpoints/, logs/, memory/

- [ ] **Step 4: Test error cases**

Run (in a non-empty dir):
```bash
cd /tmp && mkdir notempty && echo "hi" > notempty/file.txt && cd notempty && agentix init
```
Expected: `This directory is not empty. Agentix init works in empty directories only.`

- [ ] **Step 5: Unlink**

Run: `cd cli && npm unlink`

- [ ] **Step 6: Commit any fixes found during manual testing**

Only if issues were discovered. Otherwise skip.

---

### Task 9: README and cleanup

**Files:**
- Create: `cli/README.md`

- [ ] **Step 1: Write cli/README.md**

```markdown
# agentix

Scaffold an [Agentix](https://github.com/youssefaltai/agentix) project.

## Usage

```bash
mkdir my-project && cd my-project
npx agentix init
```

The CLI asks what you're building, writes the framework files, and tells you how to start.

## Requirements

- Node.js 18+
```

- [ ] **Step 2: Commit**

```bash
git add cli/README.md
git commit -m "docs: add cli README"
```
