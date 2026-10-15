import { MAX_MILESTONE_PHASES, MilestonePhase, Milestones } from '../types';

export { MAX_MILESTONE_PHASES };
export const MIN_MILESTONE_PHASES = 1;

export type AlignMilestonesOptions = {
  /** 1-based phase number that was removed; later values shift left with their labels. */
  removedPhaseIndex?: number;
};

export function buildEmptyMilestones(phaseCount: number): Milestones {
  const n = clampPhaseCount(phaseCount);
  return Object.fromEntries(
    Array.from({ length: n }, (_, i) => [`phase${i + 1}`, false])
  );
}

export function alignMilestones(
  existing: Milestones | undefined,
  phaseCount: number,
  options?: AlignMilestonesOptions
): Milestones {
  const n = clampPhaseCount(phaseCount);
  const source = existing ?? {};
  const removed = options?.removedPhaseIndex;

  if (removed != null && Number.isFinite(removed)) {
    const removedIndex = Math.floor(removed);
    if (removedIndex >= 1) {
      const aligned: Milestones = {};
      for (let newI = 1; newI <= n; newI++) {
        const oldI = newI < removedIndex ? newI : newI + 1;
        aligned[`phase${newI}`] = Boolean(source[`phase${oldI}`]);
      }
      return aligned;
    }
  }

  const aligned: Milestones = {};
  for (let i = 1; i <= n; i++) {
    aligned[`phase${i}`] = Boolean(source[`phase${i}`]);
  }
  return aligned;
}

/**
 * When exactly one phase was removed, return its 1-based index by comparing
 * label sequences. Returns undefined when the change is not a single removal.
 */
export function detectRemovedPhaseIndex(
  prev: Pick<MilestonePhase, 'label'>[],
  next: Pick<MilestonePhase, 'label'>[]
): number | undefined {
  if (prev.length !== next.length + 1) return undefined;
  for (let i = 0; i < next.length; i++) {
    if (prev[i]?.label !== next[i]?.label) {
      return i + 1;
    }
  }
  return prev.length;
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

export function milestoneKeyCount(milestones: Milestones | undefined): number {
  return Object.keys(milestones ?? {}).filter((key) => /^phase([1-9]|10)$/.test(key)).length;
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
