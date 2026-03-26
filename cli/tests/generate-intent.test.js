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
