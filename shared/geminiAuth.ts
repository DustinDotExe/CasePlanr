export const AI_RATE_LIMIT_MAX = 20;
export const AI_RATE_LIMIT_WINDOW_MS = 60_000;

export function createRateLimiter(max = AI_RATE_LIMIT_MAX, windowMs = AI_RATE_LIMIT_WINDOW_MS) {
  const hits = new Map<string, number[]>();

  return function allow(uid: string): boolean {
    const now = Date.now();
    const recent = (hits.get(uid) ?? []).filter(t => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(uid, recent);
      return false;
    }
    recent.push(now);
    hits.set(uid, recent);
    return true;
  };
}

export function bearerTokenFromHeader(authorization: string | string[] | undefined): string | null {
  const header = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export async function verifyFirebaseIdToken(
  authorization: string | string[] | undefined,
  apiKey: string | undefined
): Promise<string | null> {
  const token = bearerTokenFromHeader(authorization);
  if (!token || !apiKey) return null;

  try {
    const verify = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!verify.ok) return null;
    const body = (await verify.json()) as { users?: Array<{ localId?: string }> };
    const uid = body.users?.[0]?.localId;
    return uid || null;
  } catch {
    return null;
  }
}

export function readJsonBody(req: { on: (event: string, listener: (...args: any[]) => void) => void }): Promise<{ prompt: string }> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}
