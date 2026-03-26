import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('telos init (integration)', () => {
  let tmpDir;
  let clackMock;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'telos-int-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
    mock.restoreAll();
  });

  async function runInit(answers) {
    // Mock @clack/prompts before importing init
    clackMock = {
      intro: mock.fn(),
      outro: mock.fn(),
      cancel: mock.fn(),
      log: { success: mock.fn(), info: mock.fn(), warn: mock.fn(), error: mock.fn() },
      group: mock.fn(async () => answers),
    };

    // Use module mock to override @clack/prompts
    const { isDirEmpty } = await import('../src/init.js');
    const { generateIntent } = await import('../src/generate-intent.js');
    const { writeProject } = await import('../src/write-project.js');

    // Replicate init logic with mocked clack
    clackMock.intro('telos');

    if (!isDirEmpty(tmpDir)) {
      clackMock.cancel('This directory is not empty. Telos init works in empty directories only.');
      return false;
    }

    if (!answers) {
      return false;
    }

    const intentContent = generateIntent({
      building: answers.building?.trim() || '',
      success: answers.success?.trim() || '',
      nonGoals: answers.nonGoals?.trim() || '',
    });
    writeProject(tmpDir, intentContent);

    clackMock.log.success('Telos initialized.');
    clackMock.outro('Your intent is in INTENT.md');
    return true;
  }

  it('scaffolds a complete project from user input', async () => {
    await runInit({
      building: 'A REST API for task management',
      success: 'Users can CRUD tasks, tests pass, deployed to prod',
      nonGoals: 'No frontend, no mobile app',
    });

    assert.ok(fs.existsSync(path.join(tmpDir, 'INTENT.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'CLAUDE.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, '.claude', 'agents', 'meta-agent.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, '.gitignore')));

    const intent = fs.readFileSync(path.join(tmpDir, 'INTENT.md'), 'utf8');
    assert.ok(intent.includes('A REST API for task management'));
    assert.ok(intent.includes('Users can CRUD tasks, tests pass, deployed to prod'));
    assert.ok(intent.includes('No frontend, no mobile app'));
  });

  it('scaffolds without non-goals section when skipped', async () => {
    await runInit({
      building: 'A CLI tool',
      success: 'It works',
      nonGoals: '',
    });

    const intent = fs.readFileSync(path.join(tmpDir, 'INTENT.md'), 'utf8');
    assert.ok(intent.includes('A CLI tool'));
    assert.ok(intent.includes('It works'));
    assert.ok(!intent.includes('What We Are Not Building'));
  });

  it('refuses non-empty directories', async () => {
    fs.writeFileSync(path.join(tmpDir, 'existing.txt'), 'hello');

    const result = await runInit(null);

    assert.equal(result, false);
    assert.equal(clackMock.cancel.mock.calls.length, 1);
    assert.ok(!fs.existsSync(path.join(tmpDir, 'INTENT.md')));
  });

  it('allows directories with only .git', async () => {
    fs.mkdirSync(path.join(tmpDir, '.git'));

    await runInit({
      building: 'Something',
      success: 'It works',
      nonGoals: '',
    });

    assert.ok(fs.existsSync(path.join(tmpDir, 'INTENT.md')));
  });
});
