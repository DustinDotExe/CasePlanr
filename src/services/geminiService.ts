import { auth } from '../firebase';
import { parseSseDataLine } from '../lib/sse';

async function* streamSSE(url: string, prompt: string): AsyncGenerator<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  const token = await auth.currentUser?.getIdToken().catch(() => null);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop()!;
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const result = parseSseDataLine(line.slice(6));
        if (result.kind === 'done') return;
        if (result.kind === 'chunk') yield result.text;
        if (result.kind === 'error') throw new Error(result.message);
      }
    }
  } finally {
    clearTimeout(timeout);
  }
}

export async function* refineGoalStream(roughNotes: string) {
  yield* streamSSE('/api/refine-goal', roughNotes);
}

export async function* refineNotesStream(notes: string) {
  yield* streamSSE('/api/refine-notes', notes);
}

export async function* hearingBriefStream(prompt: string) {
  yield* streamSSE('/api/hearing-brief', prompt);
}
