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
