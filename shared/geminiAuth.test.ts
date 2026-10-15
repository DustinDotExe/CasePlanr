import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bearerTokenFromHeader, createRateLimiter } from './geminiAuth';

describe('bearerTokenFromHeader', () => {
  it('extracts the token from a Bearer header', () => {
    assert.equal(bearerTokenFromHeader('Bearer abc.def'), 'abc.def');
  });

  it('handles array headers and rejects invalid shapes', () => {
    assert.equal(bearerTokenFromHeader(['Bearer tok']), 'tok');
    assert.equal(bearerTokenFromHeader('Basic x'), null);
    assert.equal(bearerTokenFromHeader(undefined), null);
  });
});

describe('createRateLimiter', () => {
  it('allows up to max requests then blocks', () => {
    const allow = createRateLimiter(2, 60_000);
    assert.equal(allow('u1'), true);
    assert.equal(allow('u1'), true);
    assert.equal(allow('u1'), false);
    assert.equal(allow('u2'), true);
  });
});
