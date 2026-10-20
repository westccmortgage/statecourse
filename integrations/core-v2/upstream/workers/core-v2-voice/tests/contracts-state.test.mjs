import assert from 'node:assert/strict';
import test from 'node:test';

import { parseVoiceTurnInput, validateDraftShape, VOICE_TURN_PROTOCOL } from '../contracts.ts';
import { InMemoryVoiceStateStore } from '../state-store.ts';

const authority = { callerApp: 'walletwccm-netlify', tenantId: 'westccmortgage' };
const base = {
  protocol: VOICE_TURN_PROTOCOL,
  requestId: 'request-00000001',
  callIdentity: 'CA0123456789abcdef0123456789abcdef',
  turnId: 'turn-00000001',
  expectedStateRevision: 0,
  language: 'en',
  utterance: { text: 'Hello', final: true, sttConfidence: 0.95 },
  deliveryEvidence: [],
};

test('input rejects caller-supplied tenant, policy, or budget authority', () => {
  assert.throws(() => parseVoiceTurnInput({ ...base, tenantId: 'attacker' }), /server-owned/);
  assert.throws(() => parseVoiceTurnInput({ ...base, budget: { authorized: 999 } }), /server-owned/);
  assert.equal(parseVoiceTurnInput(base).utterance.text, 'Hello');
});

test('session ownership binds caller application, tenant, and signed call identity', async () => {
  const store = new InMemoryVoiceStateStore();
  await store.claim(authority, base.callIdentity, base.requestId, base.turnId, 0, 'en');
  await store.claim({ ...authority, tenantId: 'other' }, base.callIdentity, 'request-00000002', 'turn-00000002', 0, 'en');
  assert.notEqual(
    store.snapshot(authority, base.callIdentity)?.sessionId,
    store.snapshot({ ...authority, tenantId: 'other' }, base.callIdentity)?.sessionId,
  );
});

test('malformed nested provider claims and tool requests are rejected at the boundary', () => {
  assert.throws(() => validateDraftShape({
    disposition: 'answer', topic: 'general',
    speech: [{ kind: 'answer', text: 'Hello', claimIds: ['claim-1'] }],
    optionalQuestion: null, factPatches: [],
    toolRequests: [{ requestId: 'tool-1', tool: 'mortgage.payment', input: null }],
    claims: [{ claimId: 'claim-1' }], requestedApplicationTransition: 'none',
  }), /provider plan|tool request|claim/);
});

test('an aborted claim can be retried instead of remaining permanently in progress', async () => {
  const store = new InMemoryVoiceStateStore();
  const claimed = await store.claim(authority, base.callIdentity, base.requestId, base.turnId, 0, 'en', 'digest');
  await store.abort(authority, base.callIdentity, base.requestId, claimed.claimToken);
  const retried = await store.claim(authority, base.callIdentity, base.requestId, base.turnId, 0, 'en');
  assert.equal(retried.repeated, null);
});
