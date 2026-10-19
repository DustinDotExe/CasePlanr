import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { GOAL_SYSTEM, NOTES_SYSTEM, HEARING_BRIEF_SYSTEM, goalUserPrompt } from './shared/geminiPrompts';
import { createRateLimiter, verifyFirebaseIdToken } from './shared/geminiAuth';
import { streamGemini } from './shared/geminiStream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
// CSP disabled: index.html uses an inline theme bootstrap script.
// same-origin-allow-popups: required for Firebase signInWithPopup (Google sign-in).
app.use(helmet({
  contentSecurityPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not configured. AI refinement endpoints will fail.');
}

const firebaseApiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
if (!firebaseApiKey) {
  console.warn('FIREBASE_API_KEY is not configured. AI endpoints will reject all requests.');
}

const allowAiRequest = createRateLimiter();
const ai = new GoogleGenAI({ apiKey: apiKey || '' });
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

async function verifyFirebaseToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const uid = await verifyFirebaseIdToken(req.headers.authorization, firebaseApiKey);
  if (!uid) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!allowAiRequest(uid)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }
  next();
}

app.post('/api/refine-goal', verifyFirebaseToken, (req, res) => {
  const { prompt } = req.body as { prompt: string };
  streamGemini(ai, MODEL, res, GOAL_SYSTEM, goalUserPrompt(prompt), 150, Boolean(apiKey));
});

app.post('/api/refine-notes', verifyFirebaseToken, (req, res) => {
  const { prompt } = req.body as { prompt: string };
  streamGemini(ai, MODEL, res, NOTES_SYSTEM, prompt, 300, Boolean(apiKey));
});

app.post('/api/hearing-brief', verifyFirebaseToken, (req, res) => {
  const { prompt } = req.body as { prompt: string };
  streamGemini(ai, MODEL, res, HEARING_BRIEF_SYSTEM, prompt, 300, Boolean(apiKey));
});

// Serve compiled frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Gemini proxy running on :${PORT}`));
