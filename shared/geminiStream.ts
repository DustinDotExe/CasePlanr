import type { GoogleGenAI } from '@google/genai';

export interface SseResponse {
  setHeader(name: string, value: string): void;
  flushHeaders?: () => void;
  write(chunk: string): unknown;
  end(): unknown;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isRetryableGeminiError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();
  return ['429', '500', '502', '503', '504', 'rate', 'timeout', 'unavailable']
    .some(token => message.includes(token));
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function streamGemini(
  ai: GoogleGenAI,
  model: string,
  res: SseResponse,
  systemInstruction: string,
  contents: string,
  maxOutputTokens: number,
  apiKeyConfigured: boolean
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  if (!apiKeyConfigured) {
    res.write('data: {"error":"Gemini API key is not configured"}\n\n');
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction,
          maxOutputTokens,
          temperature: 0,
        },
      });
      for await (const chunk of stream) {
        if (chunk.text) res.write(`data: ${JSON.stringify(chunk.text)}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (error) {
      console.error(`Gemini stream failed with ${model} on attempt ${attempt}:`, error);
      if (attempt === 1 && isRetryableGeminiError(error)) {
        await wait(750);
        continue;
      }
      res.write(`data: ${JSON.stringify({ error: `Generation failed: ${getErrorMessage(error)}` })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }
  }

  res.end();
}
