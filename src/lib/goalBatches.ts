import { GoalEntry, StoredGoalBatch } from '../types';

export type GoalBatch = StoredGoalBatch;

export const MAX_GOAL_BATCHES = 20;
export const MAX_GOALS_PER_BATCH = 20;

/**
 * Finished goal text, added as-is to Active SMART Goals.
 * The SSC set matches the standard treatment-phase starter.
 */
export const GOAL_BATCHES: StoredGoalBatch[] = [
  {
    id: 'ssc-treatment',
    label: 'SSC Treatment Phase',
    goals: [
      'Successfully complete all scheduled sessions of the SSC treatment program for the duration of the program phase.',
      'The participant will attend a minimum of three self-help meetings or other qualifying prosocial events per week throughout the current program phase.',
      'The participant will meet with their assigned peer mentor at least twice per month for the duration of the program phase.',
      'The participant will submit to twice-weekly random urine drug screens for the next 90 days.',
    ],
  },
  {
    id: 'employment',
    label: 'Employment and Education',
    goals: [
      'The participant will apply to at least three positions per week and obtain stable employment within 60 days, reporting job-search activity to the case manager.',
      'The participant will enroll in and complete an adult education or GED program within six months.',
      'The participant will follow a written monthly budget, reduce outstanding debt, and maintain consistent savings for the duration of the program phase.',
    ],
  },
  {
    id: 'compliance',
    label: 'Supervision Compliance',
    goals: [
      'The participant will attend all scheduled check-ins on time and immediately report any issues to the case manager for the duration of the program phase.',
      'The participant will complete all required community service hours by the court-ordered deadline and provide signed documentation of completion.',
      'The participant will make consistent monthly restitution payments until the full balance is paid.',
    ],
  },
  {
    id: 'mental-health',
    label: 'Mental Health Care',
    goals: [
      'The participant will attend individual mental health therapy at least twice per month with a licensed therapist and provide attendance verification for the duration of the program phase.',
      'The participant will take prescribed psychiatric medications as directed and attend all medication management appointments.',
      'The participant will complete a written crisis safety plan with their therapist identifying warning signs, coping strategies, and emergency contacts.',
    ],
  },
];

export function sanitizeGoalBatches(raw: unknown): StoredGoalBatch[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const batches: StoredGoalBatch[] = [];
  for (const item of raw) {
    if (batches.length >= MAX_GOAL_BATCHES) break;
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const label = typeof record.label === 'string' ? record.label.trim() : '';
    const goals = Array.isArray(record.goals)
      ? record.goals
          .filter((goal): goal is string => typeof goal === 'string')
          .map((goal) => goal.trim())
          .filter(Boolean)
          .slice(0, MAX_GOALS_PER_BATCH)
      : [];
    if (!label || goals.length === 0) continue;
    let id = typeof record.id === 'string' ? record.id.trim() : '';
    if (!id || seen.has(id)) id = crypto.randomUUID();
    seen.add(id);
    batches.push({ id, label, goals });
  }
  return batches;
}

export function buildGoalEntries(
  texts: string[],
  dueDate: string,
  createId: () => string = () => crypto.randomUUID(),
): GoalEntry[] {
  const trimmedDate = dueDate.trim();
  return texts.map((text) => ({
    id: createId(),
    text,
    ...(trimmedDate ? { dueDate: trimmedDate } : {}),
  }));
}
