import { MAX_MILESTONE_PHASES, Milestones } from '../types';

export { MAX_MILESTONE_PHASES };
export const MIN_MILESTONE_PHASES = 1;

export function buildEmptyMilestones(phaseCount: number): Milestones {
  const n = clampPhaseCount(phaseCount);
  return Object.fromEntries(
    Array.from({ length: n }, (_, i) => [`phase${i + 1}`, false])
  );
}

export function alignMilestones(existing: Milestones | undefined, phaseCount: number): Milestones {
  const n = clampPhaseCount(phaseCount);
  const source = existing ?? {};
  const aligned: Milestones = {};
  for (let i = 1; i <= n; i++) {
    aligned[`phase${i}`] = Boolean(source[`phase${i}`]);
  }
  return aligned;
}

/** Highest completed phase index (1-based), or 1 when none are checked. */
export function deriveCurrentPhase(milestones: Milestones, phaseCount: number): number {
  const n = clampPhaseCount(phaseCount);
  let phase = 1;
  for (let i = n; i >= 1; i--) {
    if (milestones[`phase${i}`]) {
      phase = i;
      break;
    }
  }
  return phase;
}

export function milestonesMatchPhaseCount(milestones: Milestones | undefined, phaseCount: number): boolean {
  const n = clampPhaseCount(phaseCount);
  const keys = Object.keys(milestones ?? {});
  if (keys.length !== n) return false;
  for (let i = 1; i <= n; i++) {
    const key = `phase${i}`;
    if (typeof milestones?.[key] !== 'boolean') return false;
  }
  return keys.every((key) => /^phase([1-9]|10)$/.test(key));
}

export function clampPhaseCount(phaseCount: number): number {
  if (!Number.isFinite(phaseCount)) return MIN_MILESTONE_PHASES;
  return Math.min(MAX_MILESTONE_PHASES, Math.max(MIN_MILESTONE_PHASES, Math.floor(phaseCount)));
}
