import { MilestonePhase, Participant } from '../types';

export function createShareToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  throw new Error('Secure random UUID generation is unavailable in this browser.');
}

export function buildPortalPayload(
  participant: Participant,
  caseManagerUid: string,
  caseManagerName: string,
  caseManagerTitle: string,
  milestonePhases: MilestonePhase[]
) {
  return {
    participantId: participant.id,
    uid: caseManagerUid,
    caseManagerName: caseManagerName || caseManagerTitle || 'Case Manager',
    caseManagerTitle: caseManagerTitle || 'Case Manager',
    name: participant.name || '',
    caseNumber: participant.caseNumber || '',
    currentPhase: participant.currentPhase || 1,
    goals: (participant.goals || []).map(goal => ({
      id: goal.id,
      text: goal.text || '',
      ...(goal.dueDate ? { dueDate: goal.dueDate } : {}),
      ...(goal.reviewedOn ? { reviewedOn: goal.reviewedOn } : {}),
    })),
    completedGoals: participant.completedGoals || [],
    notes: participant.notes || '',
    milestones: participant.milestones || {},
    irasDomains: participant.irasDomains || [],
    phaseUpdate: participant.phaseUpdate || null,
    milestonePhaseLabels: milestonePhases.map(mp => mp.label || ''),
  };
}

export function wrapSecureLinkError(action: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const wrapped = new Error(`${action}: ${message}`);
  if (typeof err === 'object' && err && 'code' in err) {
    (wrapped as Error & { code?: unknown }).code = (err as { code?: unknown }).code;
  }
  return wrapped;
}
