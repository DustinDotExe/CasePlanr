import { AuditLogEntry, MilestonePhase, Participant } from '../types';

function caseContextPreamble(participant: Participant, milestonePhases: MilestonePhase[]): string[] {
  const phaseLabel = milestonePhases[participant.currentPhase - 1]?.label ?? '';
  return [
    `Participant: ${participant.name}`,
    `Case Number: ${participant.caseNumber}`,
    `Current Phase: ${participant.currentPhase} – ${phaseLabel} (this is the phase the participant is actively working on, not a completed milestone)`,
    '',
  ];
}

export function buildRefineNotesPrompt(
  participant: Participant,
  notes: string,
  milestonePhases: MilestonePhase[]
): string {
  const lines: string[] = caseContextPreamble(participant, milestonePhases);

  if (participant.irasDomains?.length) {
    lines.push(`Treatment Areas (IRAS): ${participant.irasDomains.join(', ')}`);
    lines.push('');
  }

  if (participant.goals?.length) {
    const today = new Date().toISOString().slice(0, 10);
    const completedIds = new Set(participant.completedGoals ?? []);
    lines.push('Active Goals:');
    participant.goals.forEach(g => {
      const completed = completedIds.has(g.id);
      const dateStr = g.dueDate ? ` (Due: ${g.dueDate})` : '';
      const status = completed ? '[COMPLETED] ' : g.dueDate && g.dueDate < today ? '[OVERDUE] ' : '';
      lines.push(`- ${status}${g.text}${dateStr}`);
    });
    lines.push('');
  }

  if (participant.completedGoals?.length) {
    lines.push('Completed Goals:');
    participant.completedGoals.forEach(id => {
      const goal = participant.goals?.find(g => g.id === id);
      lines.push(`- ${goal ? goal.text : id}`);
    });
    lines.push('');
  }

  if (notes.trim()) {
    lines.push('Case Manager Observations (to be refined):');
    lines.push(notes.trim());
    lines.push('');
    lines.push('Using the case context above, rewrite the Case Manager Observations into clear, professional plain language. Output only the refined observations text.');
  } else {
    lines.push('Using the case context above, draft professional case manager observations that summarize the participant\'s current situation, progress toward goals, and any notable concerns. Output only the observations text.');
  }

  return lines.join('\n');
}

export function buildHearingBriefPrompt(
  participant: Participant,
  entries: AuditLogEntry[],
  milestonePhases: MilestonePhase[]
): string {
  const lines: string[] = caseContextPreamble(participant, milestonePhases);

  if (participant.irasDomains?.length) {
    lines.push(`Treatment Areas (IRAS): ${participant.irasDomains.join(', ')}`);
    lines.push('');
  }

  if (participant.goals?.length) {
    const today = new Date().toISOString().slice(0, 10);
    const completedIds = new Set(participant.completedGoals ?? []);
    const overdueGoals = participant.goals.filter(g => g.dueDate && g.dueDate < today && !completedIds.has(g.id));

    if (overdueGoals.length) {
      lines.push(`OVERDUE Goals (${overdueGoals.length}):`);
      overdueGoals.forEach(g => lines.push(`- [OVERDUE since ${g.dueDate}] ${g.text}`));
      lines.push('');
    }

    lines.push('Active Goals:');
    participant.goals.forEach(g => {
      const completed = completedIds.has(g.id);
      const dateStr = g.dueDate ? ` (Due: ${g.dueDate})` : '';
      const reviewStr = g.reviewedOn ? ` [Reviewed: ${g.reviewedOn}]` : '';
      const status = completed ? '[COMPLETED] ' : g.dueDate && g.dueDate < today ? '[OVERDUE] ' : '';
      lines.push(`- ${status}${g.text}${dateStr}${reviewStr}`);
    });
    lines.push('');
  }

  if (participant.completedGoals?.length) {
    lines.push('Completed Goals:');
    participant.completedGoals.forEach(id => {
      const goal = participant.goals?.find(g => g.id === id);
      lines.push(`- ${goal ? goal.text : id}`);
    });
    lines.push('');
  }

  if (participant.notes?.trim()) {
    lines.push('Case Manager Observations:');
    lines.push(participant.notes.trim());
    lines.push('');
  }

  const recent = entries.slice(0, 20);
  if (recent.length) {
    lines.push('Recent Activity (newest first):');
    recent.forEach(e => {
      const dateStr = e.timestamp?.toDate
        ? e.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent';
      const detail = e.details?.newValue ? `: ${e.details.newValue.slice(0, 120)}` : '';
      lines.push(`- [${dateStr}] ${e.description}${detail}`);
    });
    lines.push('');
  }

  lines.push('Based on the above case data, write a history summary for the judge.');
  return lines.join('\n');
}
