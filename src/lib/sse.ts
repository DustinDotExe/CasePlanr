/** Parse a single SSE `data:` line payload (content after the `data: ` prefix). */
export function parseSseDataLine(data: string):
  | { kind: 'done' }
  | { kind: 'chunk'; text: string }
  | { kind: 'error'; message: string }
  | { kind: 'skip' } {
  const trimmed = data.trim();
  if (trimmed === '[DONE]') return { kind: 'done' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { kind: 'skip' };
  }

  if (typeof parsed === 'string') return { kind: 'chunk', text: parsed };
  if (parsed && typeof parsed === 'object' && 'error' in parsed) {
    return { kind: 'error', message: String((parsed as { error: unknown }).error) };
  }
  return { kind: 'skip' };
}
