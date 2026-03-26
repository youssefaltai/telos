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
