import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatGoalDate, formatSignedAt, isDueSoon, isOverdue } from './dates';

describe('formatGoalDate', () => {
  it('formats YYYY-MM-DD for display', () => {
    const formatted = formatGoalDate('2026-03-15');
    assert.match(formatted, /Mar/);
    assert.match(formatted, /15/);
    assert.match(formatted, /2026/);
  });
});

describe('isOverdue', () => {
  it('is true when due date is before now', () => {
    const now = new Date('2026-06-01T12:00:00');
    assert.equal(isOverdue('2026-05-31', now), true);
    assert.equal(isOverdue('2026-06-01', now), false);
  });
});

describe('isDueSoon', () => {
  it('is true within the window and not overdue', () => {
    const now = new Date('2026-06-01T12:00:00');
    assert.equal(isDueSoon('2026-06-05', 7, now), true);
    assert.equal(isDueSoon('2026-06-20', 7, now), false);
    assert.equal(isDueSoon('2026-05-30', 7, now), false);
  });
});

describe('formatSignedAt', () => {
  it('formats an ISO timestamp', () => {
    const formatted = formatSignedAt('2026-03-15T14:30:00.000Z');
    assert.match(formatted, /Mar/);
    assert.match(formatted, /15/);
    assert.match(formatted, /2026/);
  });
});
