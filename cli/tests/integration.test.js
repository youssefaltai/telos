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

describe('telos init (integration)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'telos-int-'));
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
    assert.ok(output.text().includes('Telos initialized'));
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
    assert.ok(output.text().includes('Telos initialized'));
  });

  it('refuses when building question is empty', async () => {
    const input = createMockInput(['']);
    const output = createMockOutput();

    await init(tmpDir, { input, output });

    assert.ok(output.text().includes('No intent provided'));
    assert.ok(!fs.existsSync(path.join(tmpDir, 'INTENT.md')));
  });
});
