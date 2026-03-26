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
