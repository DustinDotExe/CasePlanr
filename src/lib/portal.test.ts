import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { buildPortalPayload, createShareToken } from './portal';
import type { Participant } from '../types';

describe('createShareToken', () => {
  it('returns crypto.randomUUID when available', () => {
    const uuid = '11111111-2222-4333-8444-555555555555';
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { randomUUID: mock.fn(() => uuid) },
    });
    try {
      assert.equal(createShareToken(), uuid);
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        configurable: true,
        value: original,
      });
    }
  });

  it('throws when secure UUID generation is unavailable', () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: undefined,
    });
    try {
      assert.throws(() => createShareToken(), /Secure random UUID/);
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        configurable: true,
        value: original,
      });
    }
  });
});

describe('buildPortalPayload', () => {
  it('preserves notes and core participant fields', () => {
    const participant = {
      id: 'p1',
      name: 'Jane Doe',
      caseNumber: 'C-100',
      currentPhase: 2,
      goals: [{ id: 'g1', text: 'Housing', dueDate: '2026-04-01' }],
      notes: 'Weekly check-in notes stay intact.',
      milestones: { phase1: true },
      irasDomains: ['Housing'],
      completedGoals: ['g1'],
      phaseUpdate: '2026-05-01',
      uid: 'cm1',
      createdAt: null,
      updatedAt: null,
    } as Participant;

    const payload = buildPortalPayload(
      participant,
      'cm1',
      'Alex Manager',
      'Case Manager',
      [{ label: 'Orientation' }, { label: 'Treatment' }]
    );

    assert.equal(payload.notes, 'Weekly check-in notes stay intact.');
    assert.equal(payload.name, 'Jane Doe');
    assert.equal(payload.caseNumber, 'C-100');
    assert.deepEqual(payload.completedGoals, ['g1']);
    assert.deepEqual(payload.milestonePhaseLabels, ['Orientation', 'Treatment']);
    assert.equal(payload.goals[0].dueDate, '2026-04-01');
  });
});
