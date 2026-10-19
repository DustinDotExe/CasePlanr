import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GOAL_BATCHES, MAX_GOALS_PER_BATCH, buildGoalEntries, sanitizeGoalBatches } from './goalBatches';

describe('GOAL_BATCHES', () => {
  it('includes the SSC treatment phase set as four finished goals', () => {
    const batch = GOAL_BATCHES.find((b) => b.id === 'ssc-treatment');
    assert.ok(batch);
    assert.equal(batch.goals.length, 4);
    assert.equal(
      batch.goals[0],
      'Successfully complete all scheduled sessions of the SSC treatment program for the duration of the program phase.',
    );
    assert.match(batch.goals[1], /three self-help meetings/);
    assert.match(batch.goals[2], /peer mentor at least twice per month/);
    assert.match(batch.goals[3], /twice-weekly random urine drug screens/);
  });

  it('gives every batch a unique label and at least two goals', () => {
    const labels = GOAL_BATCHES.map((b) => b.label);
    assert.equal(new Set(labels).size, labels.length);
    for (const batch of GOAL_BATCHES) {
      assert.ok(batch.goals.length >= 2);
      for (const goal of batch.goals) {
        assert.ok(goal.trim().endsWith('.'));
      }
    }
  });
});

describe('sanitizeGoalBatches', () => {
  it('keeps valid batches and drops blank goals', () => {
    const result = sanitizeGoalBatches([
      { id: 'a', label: '  Keep  ', goals: [' One. ', '', '  '] },
      { id: 'a', label: 'Dup', goals: ['Two.'] },
      { label: '', goals: ['Nope.'] },
      { id: 'b', label: 'Empty', goals: [] },
      null,
      { id: 'c', label: 'Ok', goals: ['Yes.'] },
    ]);
    assert.equal(result.length, 3);
    assert.equal(result[0].id, 'a');
    assert.equal(result[0].label, 'Keep');
    assert.deepEqual(result[0].goals, ['One.']);
    assert.notEqual(result[1].id, 'a');
    assert.equal(result[1].label, 'Dup');
    assert.equal(result[2].id, 'c');
  });

  it('returns an empty list for missing data and caps goals per batch', () => {
    assert.deepEqual(sanitizeGoalBatches(undefined), []);
    const goals = Array.from({ length: MAX_GOALS_PER_BATCH + 5 }, (_, i) => `Goal ${i}.`);
    const [batch] = sanitizeGoalBatches([{ id: 'big', label: 'Big', goals }]);
    assert.equal(batch.goals.length, MAX_GOALS_PER_BATCH);
  });
});

describe('buildGoalEntries', () => {
  it('applies one due date to every goal', () => {
    let n = 0;
    const entries = buildGoalEntries(['A', 'B'], '2027-02-16', () => `id-${++n}`);
    assert.deepEqual(entries, [
      { id: 'id-1', text: 'A', dueDate: '2027-02-16' },
      { id: 'id-2', text: 'B', dueDate: '2027-02-16' },
    ]);
  });

  it('omits dueDate when none is set', () => {
    const entries = buildGoalEntries(['A'], '  ', () => 'id');
    assert.deepEqual(entries, [{ id: 'id', text: 'A' }]);
  });
});
