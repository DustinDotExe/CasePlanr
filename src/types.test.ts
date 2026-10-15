import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeGoals } from './types';

describe('normalizeGoals', () => {
  it('converts string goals to GoalEntry with stable ids', () => {
    const { goals, completedGoals } = normalizeGoals(['Find housing', 'Attend counseling'], []);
    assert.equal(goals.length, 2);
    assert.equal(goals[0].text, 'Find housing');
    assert.ok(goals[0].id);
    assert.equal(goals[0].id, goals[0].id);
    assert.deepEqual(completedGoals, []);
  });

  it('preserves object goals', () => {
    const { goals } = normalizeGoals(
      [{ id: 'abc', text: 'Job search', dueDate: '2026-01-15' }],
      undefined
    );
    assert.deepEqual(goals, [{ id: 'abc', text: 'Job search', dueDate: '2026-01-15' }]);
  });

  it('migrates completedGoals from text to ids', () => {
    const { goals, completedGoals } = normalizeGoals(
      ['Goal A', 'Goal B'],
      ['Goal B']
    );
    assert.equal(completedGoals.length, 1);
    assert.equal(completedGoals[0], goals[1].id);
  });

  it('keeps completed ids that already match', () => {
    const { completedGoals } = normalizeGoals(
      [{ id: 'id1', text: 'A' }, { id: 'id2', text: 'B' }],
      ['id2']
    );
    assert.deepEqual(completedGoals, ['id2']);
  });

  it('handles undefined inputs', () => {
    assert.deepEqual(normalizeGoals(undefined, undefined), {
      goals: [],
      completedGoals: [],
    });
  });
});
