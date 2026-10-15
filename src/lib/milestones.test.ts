import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  alignMilestones,
  detectRemovedPhaseIndex,
  deriveCurrentPhase,
  milestoneKeyCount,
  milestonesMatchPhaseCount,
} from './milestones';

describe('alignMilestones', () => {
  it('pads and truncates by numeric key when no removal is given', () => {
    assert.deepEqual(
      alignMilestones({ phase1: true, phase2: false }, 4),
      { phase1: true, phase2: false, phase3: false, phase4: false }
    );
    assert.deepEqual(
      alignMilestones(
        { phase1: true, phase2: true, phase3: false, phase4: true, phase5: false },
        3
      ),
      { phase1: true, phase2: true, phase3: false }
    );
  });

  it('shifts later values left when a non-final phase is removed', () => {
    const before = {
      phase1: true,
      phase2: true,
      phase3: false,
      phase4: true,
      phase5: false,
    };
    // Delete phase 2 → old 3/4/5 become new 2/3/4
    assert.deepEqual(alignMilestones(before, 4, { removedPhaseIndex: 2 }), {
      phase1: true,
      phase2: false,
      phase3: true,
      phase4: false,
    });
  });

  it('drops only the final value when the last phase is removed', () => {
    const before = {
      phase1: true,
      phase2: false,
      phase3: true,
      phase4: true,
    };
    assert.deepEqual(alignMilestones(before, 3, { removedPhaseIndex: 4 }), {
      phase1: true,
      phase2: false,
      phase3: true,
    });
  });
});

describe('detectRemovedPhaseIndex', () => {
  it('finds a middle removal by label shift', () => {
    const prev = [
      { label: 'A' },
      { label: 'B' },
      { label: 'C' },
      { label: 'D' },
    ];
    const next = [{ label: 'A' }, { label: 'C' }, { label: 'D' }];
    assert.equal(detectRemovedPhaseIndex(prev, next), 2);
  });

  it('treats a trailing drop as removing the last phase', () => {
    const prev = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
    const next = [{ label: 'A' }, { label: 'B' }];
    assert.equal(detectRemovedPhaseIndex(prev, next), 3);
  });

  it('returns undefined when more than one phase changed', () => {
    assert.equal(
      detectRemovedPhaseIndex(
        [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }],
        [{ label: 'A' }, { label: 'B' }]
      ),
      undefined
    );
  });
});

describe('deriveCurrentPhase / shape helpers', () => {
  it('derives the highest completed phase within the count', () => {
    assert.equal(
      deriveCurrentPhase({ phase1: true, phase2: true, phase3: false }, 3),
      2
    );
  });

  it('counts and validates contiguous phase keys', () => {
    const milestones = { phase1: true, phase2: false, phase3: true };
    assert.equal(milestoneKeyCount(milestones), 3);
    assert.equal(milestonesMatchPhaseCount(milestones, 3), true);
    assert.equal(milestonesMatchPhaseCount(milestones, 4), false);
  });
});
