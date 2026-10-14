import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { loadEnv } from 'vite';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';
import { GOAL_SYSTEM, NOTES_SYSTEM, HEARING_BRIEF_SYSTEM, goalUserPrompt } from './shared/geminiPrompts';
import { createRateLimiter, readJsonBody, verifyFirebaseIdToken } from './shared/geminiAuth';
import { streamGemini } from './shared/geminiStream';

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const allowAiRequest = createRateLimiter();

function sendJson(res: ServerResponse, status: number, body: object) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function authorizeAi(req: IncomingMessage, res: ServerResponse, firebaseApiKey: string | undefined): Promise<boolean> {
  const uid = await verifyFirebaseIdToken(req.headers.authorization, firebaseApiKey);
  if (!uid) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return false;
  }
  if (!allowAiRequest(uid)) {
    sendJson(res, 429, { error: 'Too many requests' });
    return false;
  }
  return true;
}

function geminiProxyPlugin(apiKey: string, model: string, firebaseApiKey: string | undefined): Plugin {
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });

  return {
    name: 'gemini-proxy',
    configureServer(server) {
      server.middlewares.use('/api/refine-goal', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }
        try {
          if (!(await authorizeAi(req, res, firebaseApiKey))) return;
          const { prompt } = await readJsonBody(req);
          await streamGemini(ai, model, res, GOAL_SYSTEM, goalUserPrompt(prompt), 150, Boolean(apiKey));
        } catch { next(); }
      });

      server.middlewares.use('/api/refine-notes', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }
        try {
          if (!(await authorizeAi(req, res, firebaseApiKey))) return;
          const { prompt } = await readJsonBody(req);
          await streamGemini(ai, model, res, NOTES_SYSTEM, prompt, 300, Boolean(apiKey));
        } catch { next(); }
      });

      server.middlewares.use('/api/hearing-brief', async (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }
        try {
          if (!(await authorizeAi(req, res, firebaseApiKey))) return;
          const { prompt } = await readJsonBody(req);
          await streamGemini(ai, model, res, HEARING_BRIEF_SYSTEM, prompt, 300, Boolean(apiKey));
        } catch { next(); }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const firebaseApiKey = env.FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY;
  return {
    plugins: [react(), tailwindcss(), geminiProxyPlugin(env.GEMINI_API_KEY, env.GEMINI_MODEL || DEFAULT_MODEL, firebaseApiKey)],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    }
  };
});
