/** Format a YYYY-MM-DD goal due/reviewed date for display. */
export function formatGoalDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isOverdue(iso: string, now = new Date()): boolean {
  return new Date(iso + 'T23:59:59') < now;
}

export function isDueSoon(iso: string, withinDays = 7, now = new Date()): boolean {
  const due = new Date(iso + 'T23:59:59');
  return due > now && due <= new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
}

export function formatSignedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}
