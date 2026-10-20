import assert from 'node:assert/strict';
import test from 'node:test';

import {
  verifyVoiceServiceRequest,
  voiceRequestSignature,
} from '../../../supabase/functions/_shared/core-v2/voice-auth.ts';

const SECRET = 'local-fixture-secret-that-is-at-least-thirty-two-characters';
const NOW = 1_800_000_000;

class ReplayStore {
  seen = new Set();
  async claim(keyId, nonce) {
    const key = `${keyId}:${nonce}`;
    if (this.seen.has(key)) return false;
    this.seen.add(key);
    return true;
  }
}

async function signed(body, overrides = {}) {
  const timestamp = overrides.timestamp ?? NOW;
  const nonce = overrides.nonce ?? 'abcdefghijklmnop';
  const pathname = '/functions/v1/core-v2-voice-turn';
  const signature = await voiceRequestSignature({
    secret: SECRET, method: 'POST', pathname, timestamp, nonce, rawBody: body,
  });
  return new Request(`https://example.test${pathname}`, {
    method: 'POST', body,
    headers: {
      'x-core-voice-key-id': 'netlify-wallet-voice',
      'x-core-voice-timestamp': String(timestamp),
      'x-core-voice-nonce': nonce,
      'x-core-voice-signature': overrides.signature ?? signature,
    },
  });
}

const resolveCredential = async (keyId) => keyId === 'netlify-wallet-voice' ? {
  keyId, secret: SECRET, callerApp: 'walletwccm-netlify', tenantId: 'westccmortgage',
} : null;

test('HMAC binds method, path, timestamp, nonce and exact body to server-owned authority', async () => {
  const body = JSON.stringify({ hello: 'voice' });
  const result = await verifyVoiceServiceRequest({
    request: await signed(body), rawBody: body, resolveCredential,
    replayStore: new ReplayStore(), nowSeconds: NOW,
  });
  assert.deepEqual(result, {
    ok: true,
    context: { keyId: 'netlify-wallet-voice', callerApp: 'walletwccm-netlify', tenantId: 'westccmortgage' },
  });
});

test('tampering, stale timestamps, missing credentials, and replay fail closed', async () => {
  const body = '{}';
  const replay = new ReplayStore();
  const request = await signed(body);
  assert.equal((await verifyVoiceServiceRequest({ request, rawBody: body, resolveCredential, replayStore: replay, nowSeconds: NOW })).ok, true);
  assert.equal((await verifyVoiceServiceRequest({ request, rawBody: body, resolveCredential, replayStore: replay, nowSeconds: NOW })).ok, false);
  assert.equal((await verifyVoiceServiceRequest({ request: await signed(body, { timestamp: NOW - 61 }), rawBody: body, resolveCredential, replayStore: new ReplayStore(), nowSeconds: NOW })).ok, false);
  assert.equal((await verifyVoiceServiceRequest({ request: await signed(body), rawBody: '{"changed":true}', resolveCredential, replayStore: new ReplayStore(), nowSeconds: NOW })).ok, false);
});
