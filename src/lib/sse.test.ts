import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseSseDataLine } from './sse';

describe('parseSseDataLine', () => {
  it('detects DONE', () => {
    assert.deepEqual(parseSseDataLine('[DONE]'), { kind: 'done' });
    assert.deepEqual(parseSseDataLine('  [DONE]  '), { kind: 'done' });
  });

  it('yields string chunks', () => {
    assert.deepEqual(parseSseDataLine('"hello world"'), {
      kind: 'chunk',
      text: 'hello world',
    });
  });

  it('surfaces error objects', () => {
    assert.deepEqual(parseSseDataLine('{"error":"rate limited"}'), {
      kind: 'error',
      message: 'rate limited',
    });
  });

  it('skips invalid JSON and non-chunk payloads', () => {
    assert.deepEqual(parseSseDataLine('not-json'), { kind: 'skip' });
    assert.deepEqual(parseSseDataLine('{"ok":true}'), { kind: 'skip' });
    assert.deepEqual(parseSseDataLine('42'), { kind: 'skip' });
  });
});
