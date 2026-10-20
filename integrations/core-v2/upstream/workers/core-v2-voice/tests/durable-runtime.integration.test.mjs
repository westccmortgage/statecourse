import assert from 'node:assert/strict';
import test from 'node:test';

import { voiceRequestSignature } from '../../../supabase/functions/_shared/core-v2/voice-auth.ts';
import { createVoiceTurnHandler } from '../../../supabase/functions/core-v2-voice-turn/handler.ts';
import { VOICE_TURN_PROTOCOL } from '../contracts.ts';
import { PostgresVoiceRepository } from '../postgres-store.ts';
import { assembleVoiceRuntime } from '../runtime-assembly.ts';
import { digestTurnRequest } from '../state-store.ts';
import { TransportFault } from '../../core-v2-runtime/transport/transport.ts';

const NOW = 1_800_000_000;
const SECRET = 'offline-voice-secret-that-is-more-than-thirty-two-characters';
const AUTHORITY = { callerApp: 'walletwccm-netlify', tenantId: 'westccmortgage' };
const POLICY = {
  currency: 'USD', authorizedMaximumUsd: 1, maximumPerTurnUsd: 0.1,
  maximumProviderCallsPerTurn: 2, maximumProviderCallsPerCall: 120, maximumTurnsPerCall: 60,
  maximumInputTokensPerTurn: 8000, maximumOutputTokensPerTurn: 400,
  maximumInputTokensPerCall: 480000, maximumOutputTokensPerCall: 24000,
  maximumReasoningTokensPerCall: 24000,
  wallClockDeadlineMs: 1_200_000,
};
const OWNER_DIGEST = 'a'.repeat(64);
const ADMISSION_POLICY = {
  protocol: 'core-v2.voice-admission-policy.1', suiteId: 'owner-call-1',
  ownerIdentityDigest: OWNER_DIGEST, expiresAt: '2099-01-01T00:00:00.000Z',
  maximumCalls: 1, maximumVoiceWebhooks: 3, maximumCallSeconds: 120,
  maximumTurns: 6, maximumBrainRequests: 12, maximumTtsCharacters: 8000,
};

function environment(overrides = {}) {
  const values = {
    CORE_V2_VOICE_KEY_ID: 'netlify-wallet-voice',
    CORE_V2_VOICE_HMAC_SECRET: SECRET,
    CORE_V2_VOICE_CALLER_APP: AUTHORITY.callerApp,
    CORE_V2_VOICE_TENANT_ID: AUTHORITY.tenantId,
    CORE_V2_VOICE_PROVIDER_ID: 'anthropic',
    CORE_V2_VOICE_ALLOW_PROVIDER_NETWORK: 'true',
    CORE_V2_ALLOW_PAID_CALLS: 'true',
    CORE_V2_VOICE_BUDGET_POLICY: JSON.stringify(POLICY),
    CORE_V2_VOICE_ADMISSION_POLICY: JSON.stringify(ADMISSION_POLICY),
    CORE_V2_VOICE_PROVIDER_REGISTRY: JSON.stringify({
      providers: [{
        providerId: 'anthropic', baseUrl: 'https://provider.invalid',
        apiKeyEnvironmentVariable: 'OFFLINE_ANTHROPIC_KEY',
        models: ['offline-model'], defaultModel: 'offline-model',
        maximumOutputTokens: 400, maximumInputTokens: 8000,
        requestTimeoutMs: 2000, maximumMaterialBytes: 100000,
        maximumMaterialBytesPerItem: 100000, supportedMediaTypes: ['text/plain'],
        capabilities: { 'offline-model': { forcedToolChoice: true, strictSchema: true, images: false, thinking: 'none' } },
      }],
      pricing: [{
        providerId: 'anthropic', model: 'offline-model', effectiveFrom: '2026-01-01', currency: 'USD',
        inputPerMillionTokens: 1, outputPerMillionTokens: 2, cacheWritePerMillionTokens: 1,
      }],
    }),
    OFFLINE_ANTHROPIC_KEY: 'fixture-key-never-sent',
    ...overrides,
  };
  return (name) => values[name];
}

function input(requestId = 'request-1', turnId = 'turn-1', revision = 0, text = 'I want to buy a home', extra = {}) {
  return {
    protocol: VOICE_TURN_PROTOCOL, requestId, callIdentity: 'CA-offline-call', turnId,
    expectedStateRevision: revision, language: 'en',
    utterance: { text, final: true, sttConfidence: null }, deliveryEvidence: [], ...extra,
  };
}

function responseBody(reply = 'I can help with your purchase questions.') {
  return JSON.stringify({
    content: [{ type: 'tool_use', name: 'core_v2_voice_turn', input: {
      disposition: 'answer', topic: 'purchase',
      speech: [{ kind: 'answer', text: reply, claimIds: [] }],
      optionalQuestion: null, factPatches: [], toolRequests: [], claims: [],
      requestedApplicationTransition: 'none',
    } }],
    usage: { input_tokens: 10, output_tokens: 10 },
  });
}

class FixtureTransport {
  name = 'offline-fixture';
  calls = 0;
  constructor({ failure = null, wait = false } = {}) {
    this.failure = failure;
    this.wait = wait;
    this.started = new Promise((resolve) => { this.didStart = resolve; });
    this.release = () => {};
    this.gate = wait ? new Promise((resolve) => { this.release = resolve; }) : Promise.resolve();
  }
  async send() {
    this.calls += 1;
    this.didStart();
    await this.gate;
    if (this.failure) throw this.failure;
    return { status: 200, headers: {}, body: responseBody() };
  }
}

class MemoryVoiceSql {
  nonces = new Set(); sessions = new Map(); turns = new Map(); reservations = new Map();
  admissions = new Map();
  failSettlement = false;
  key(sessionId, requestId) { return `${sessionId}\0${requestId}`; }
  async query(sql, p = []) {
    if (sql.includes('core_v2_voice_claim_admission_stream')) {
      const [suiteId, callDigest] = p; const admission = this.admissions.get(`${suiteId}:${callDigest}`);
      if (!admission) throw new Error('voice:admission_not_found');
      if (admission.streamClaimed) throw new Error('voice:admission_stream_already_claimed');
      admission.streamClaimed = true;
      return { rows: [{ result: { protocol: 'core-v2.voice-admission-stream.1', suiteId,
        callIdentityDigest: callDigest, claimed: true } }] };
    }
    if (sql.includes('core_v2_voice_claim_admission')) {
      const [suiteId, ownerIdentityDigest, callDigest, policyText] = p;
      const key = `${suiteId}:${callDigest}`; const prior = this.admissions.get(key);
      if (!prior) this.admissions.set(key, { ownerIdentityDigest, policy: JSON.parse(policyText), streamClaimed: false });
      return { rows: [{ result: { protocol: 'core-v2.voice-admission.1', suiteId,
        callIdentityDigest: callDigest, answeredAtMs: 1800000000000, deadlineMs: 1800000120000,
        maximumTurns: 6, maximumBrainRequests: 12, maximumTtsCharacters: 8000, repeated: Boolean(prior) } }] };
    }
    if (sql.includes('core_v2_voice_claim_replay')) {
      const key = `${p[0]}:${p[1]}`;
      const claimed = !this.nonces.has(key); this.nonces.add(key);
      return { rows: [{ claimed }] };
    }
    if (sql.includes('core_v2_voice_claim_turn')) {
      const [sessionId, callerApp, tenantId, callDigest, requestId, turnId, requestDigest, expected, language, initial] = p;
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = { callerApp, tenantId, callDigest, revision: 0, language, state: JSON.parse(initial) };
        this.sessions.set(sessionId, session);
      }
      if (session.callerApp !== callerApp || session.tenantId !== tenantId || session.callDigest !== callDigest) throw new Error('voice:session_owner_mismatch');
      const key = this.key(sessionId, requestId); const prior = this.turns.get(key);
      if (prior) {
        if (prior.turnId !== turnId || prior.requestDigest !== requestDigest || prior.expected !== expected) throw new Error('voice:idempotency_conflict');
        if (prior.status === 'completed') return { rows: [{ result: { state: session.state, repeated: prior.response, claimToken: null } }] };
        if (prior.providerState !== 'not_submitted') throw new Error('voice:outcome_unknown');
        if (prior.leaseExpired) {
          prior.claimToken = crypto.randomUUID(); prior.leaseExpired = false;
          return { rows: [{ result: { state: session.state, repeated: null, claimToken: prior.claimToken } }] };
        }
        throw new Error('voice:turn_in_progress');
      }
      if ([...this.turns.values()].some((turn) => turn.sessionId === sessionId && turn.status === 'processing')) throw new Error('voice:turn_in_progress');
      if (session.revision !== expected) throw new Error('voice:stale_state');
      const claimToken = crypto.randomUUID();
      this.turns.set(key, { sessionId, requestId, turnId, requestDigest, expected, status: 'processing', providerState: 'not_submitted', response: null, claimToken });
      return { rows: [{ result: { state: session.state, repeated: null, claimToken } }] };
    }
    if (sql.includes('core_v2_voice_commit_turn')) {
      const [sessionId, callerApp, tenantId, callDigest, requestId, claimToken, expected, nextText, responseText] = p;
      const session = this.sessions.get(sessionId); const turn = this.turns.get(this.key(sessionId, requestId));
      if (!session || !turn) throw new Error('voice:turn_not_claimed');
      if (session.callerApp !== callerApp || session.tenantId !== tenantId || session.callDigest !== callDigest) throw new Error('voice:session_owner_mismatch');
      if (turn.status === 'completed') return { rows: [{ result: turn.response }] };
      if (turn.claimToken !== claimToken) throw new Error('voice:claim_fenced');
      if (session.revision !== expected) throw new Error('voice:invalid_commit');
      session.state = JSON.parse(nextText); session.revision = session.state.revision;
      turn.response = JSON.parse(responseText); turn.status = 'completed';
      return { rows: [{ result: turn.response }] };
    }
    if (sql.includes('core_v2_voice_abort_turn')) {
      const [sessionId,,,, requestId, claimToken] = p; const key = this.key(sessionId, requestId); const turn = this.turns.get(key);
      if (turn?.status === 'processing' && turn.providerState === 'not_submitted' && turn.claimToken === claimToken) this.turns.delete(key);
      return { rows: [{ core_v2_voice_abort_turn: true }] };
    }
    if (sql.includes('core_v2_voice_reserve_budget')) {
      const [sessionId, requestId, phase, claimToken, maximumUsd] = p; const turn = this.turns.get(this.key(sessionId, requestId));
      if (!turn) throw new Error('voice:turn_not_claimed');
      if (turn.claimToken !== claimToken) throw new Error('voice:claim_fenced');
      const existing = [...this.reservations.values()].find((r) => r.sessionId === sessionId && r.requestId === requestId && r.phase === phase);
      if (existing) throw new Error('voice:reservation_already_acquired');
      const reservation = { reservationId: crypto.randomUUID(), sessionId, requestId, phase, maximumUsd, state: 'reserved', settledUsd: null };
      this.reservations.set(reservation.reservationId, reservation); turn.providerState = 'reserved';
      return { rows: [{ result: this.reservationRow(reservation) }] };
    }
    if (sql.includes('core_v2_voice_settle_budget')) {
      if (this.failSettlement) throw new Error('offline settlement failure');
      const reservation = this.reservations.get(p[0]);
      if (!reservation || reservation.state !== 'reserved') throw new Error('voice:reservation_not_open');
      reservation.state = 'settled'; reservation.settledUsd = p[1]; reservation.rawUsage = JSON.parse(p[2]); reservation.normalizedUsage = JSON.parse(p[3]);
      this.turns.get(this.key(reservation.sessionId, reservation.requestId)).providerState = 'settled';
      return { rows: [{}] };
    }
    if (sql.includes('core_v2_voice_release_budget')) {
      const reservation = this.reservations.get(p[0]); reservation.state = 'released'; reservation.settledUsd = 0;
      this.turns.get(this.key(reservation.sessionId, reservation.requestId)).providerState = 'released';
      return { rows: [{}] };
    }
    if (sql.includes('core_v2_voice_preserve_unknown')) {
      const reservation = this.reservations.get(p[0]); reservation.state = 'outcome_unknown';
      this.turns.get(this.key(reservation.sessionId, reservation.requestId)).providerState = 'outcome_unknown';
      return { rows: [{}] };
    }
    throw new Error(`unexpected SQL: ${sql}`);
  }
  reservationRow(r) {
    return { reservation_id: r.reservationId, session_id: r.sessionId, request_id: r.requestId,
      maximum_usd: r.maximumUsd, state: r.state, settled_usd: r.settledUsd };
  }
}

async function signedRequest(body, nonce) {
  const rawBody = JSON.stringify(body); const pathname = '/functions/v1/core-v2-voice-turn';
  const signature = await voiceRequestSignature({ secret: SECRET, method: 'POST', pathname, timestamp: NOW, nonce, rawBody });
  return new Request(`https://example.test${pathname}`, { method: 'POST', body: rawBody, headers: {
    'x-core-voice-key-id': 'netlify-wallet-voice', 'x-core-voice-timestamp': String(NOW),
    'x-core-voice-nonce': nonce, 'x-core-voice-signature': signature,
  } });
}

function harness(transport = new FixtureTransport()) {
  const db = new MemoryVoiceSql(); const env = environment();
  const runtime = assembleVoiceRuntime({ db, env, transport });
  const handler = createVoiceTurnHandler({
    resolveCredential: runtime.resolveCredential, replayStore: runtime.repository.replayStore,
    orchestrator: runtime.orchestrator, nowSeconds: () => NOW,
    admit: (authority, callIdentity, ownerIdentityDigest) => runtime.repository.claimAdmission(
      authority, callIdentity, ownerIdentityDigest, runtime.admissionPolicy),
    claimStream: (authority, callIdentity, suiteId) => runtime.repository.claimAdmissionStream(
      authority, callIdentity, suiteId),
  });
  return { db, runtime, handler, transport };
}

test('admission lease is durable and its media stream can be claimed only once', async () => {
  const { handler } = harness();
  const callIdentity = `CA${'a'.repeat(32)}`;
  const leaseRequest = { protocol: 'core-v2.voice-admission.1', callIdentity, ownerIdentityDigest: OWNER_DIGEST };
  const first = await handler(await signedRequest(leaseRequest, 'nonce-admit-000001'));
  assert.equal(first.status, 200);
  const lease = await first.json();
  assert.equal(lease.repeated, false);
  const repeated = await handler(await signedRequest(leaseRequest, 'nonce-admit-000002'));
  assert.equal((await repeated.json()).repeated, true);
  const claim = { protocol: 'core-v2.voice-admission-stream.1', callIdentity, suiteId: ADMISSION_POLICY.suiteId };
  assert.equal((await handler(await signedRequest(claim, 'nonce-stream-00001'))).status, 200);
  const duplicate = await handler(await signedRequest(claim, 'nonce-stream-00002'));
  assert.equal(duplicate.status, 403);
  assert.equal((await duplicate.json()).error, 'admission_stream_already_claimed');
});

test('fully configured synthetic turn is durable, idempotent, replay-safe, and interruption-aware', async () => {
  const { db, handler, transport } = harness();
  const first = await handler(await signedRequest(input('request-greeting', 'turn-greeting', 0, 'Hello'), 'nonce-greeting-0001'));
  assert.equal(first.status, 200);
  const greeting = await first.json();
  assert.equal(greeting.reply, 'How can I help you today?');

  const secondInput = input('request-goal', 'turn-goal', 1, 'I want to buy a home', {
    deliveryEvidence: [{ role: 'assistant', text: greeting.reply, turnRevision: 1, delivery: 'interrupted' }],
  });
  const second = await handler(await signedRequest(secondInput, 'nonce-goal-00000001'));
  assert.equal(second.status, 200);
  assert.equal(transport.calls, 1);
  const session = [...db.sessions.values()][0];
  assert.equal(session.state.recentTurns.find((turn) => turn.role === 'assistant' && turn.turnRevision === 1).delivery, 'interrupted');

  const repeated = await handler(await signedRequest(secondInput, 'nonce-goal-00000002'));
  assert.equal(repeated.status, 200);
  assert.equal(transport.calls, 1, 'completed request must not call the provider twice');
  const replay = await handler(await signedRequest(secondInput, 'nonce-goal-00000002'));
  assert.equal(replay.status, 401, 'same signed nonce is rejected before orchestration');
});

test('concurrent turns at one revision admit one provider call and reject the race', async () => {
  const transport = new FixtureTransport({ wait: true }); const { handler } = harness(transport);
  const body = input('request-race-a', 'turn-race-a');
  const firstPromise = handler(await signedRequest(body, 'nonce-race-a-00001'));
  await transport.started;
  const racing = await handler(await signedRequest(input('request-race-b', 'turn-race-b'), 'nonce-race-b-00001'));
  assert.equal(racing.status, 409);
  assert.equal((await racing.json()).error, 'turn_in_progress');
  assert.equal(transport.calls, 1);
  transport.release();
  assert.equal((await firstPromise).status, 200);
});

test('crash after reservation is preserved as unknown and cannot repeat provider work', async () => {
  const db = new MemoryVoiceSql(); const repository = new PostgresVoiceRepository(db, POLICY);
  const turn = input('request-crash', 'turn-crash');
  const claimed = await repository.claim(AUTHORITY, turn.callIdentity, turn.requestId, turn.turnId, 0, 'en', digestTurnRequest(turn));
  await repository.reserve('voice_' + (await import('node:crypto')).createHash('sha256')
    .update(`${AUTHORITY.tenantId}\0${AUTHORITY.callerApp}\0${turn.callIdentity}`).digest('hex').slice(0, 32), turn.requestId,
    claimed.claimToken, 0.01, { providerId: 'fixture', model: 'fixture', currency: 'USD', effectiveFrom: '1970-01-01',
      inputPerMillionTokens: 0, outputPerMillionTokens: 0, cachedInputPerMillionTokens: 0, cacheWritePerMillionTokens: 0,
      reasoningPerMillionTokens: 0, maximumInputTokens: 0, maximumOutputTokens: 0,
      maximumReasoningTokens: 0, ceilingRule: 'fixture' }, 'propose');
  const restarted = new PostgresVoiceRepository(db, POLICY);
  await assert.rejects(
    restarted.claim(AUTHORITY, turn.callIdentity, turn.requestId, turn.turnId, 0, 'en', digestTurnRequest(turn)),
    (error) => error.code === 'outcome_unknown',
  );
});

test('expired lease reclaim fences the old worker before any provider reservation', async () => {
  const db = new MemoryVoiceSql(); const repository = new PostgresVoiceRepository(db, POLICY);
  const turn = input('request-expired', 'turn-expired');
  const first = await repository.claim(AUTHORITY, turn.callIdentity, turn.requestId, turn.turnId, 0, 'en', digestTurnRequest(turn));
  const stored = [...db.turns.values()][0]; stored.leaseExpired = true;
  const reclaimed = await repository.claim(AUTHORITY, turn.callIdentity, turn.requestId, turn.turnId, 0, 'en', digestTurnRequest(turn));
  assert.notEqual(first.claimToken, reclaimed.claimToken);
  const pricing = { providerId: 'fixture', model: 'fixture', currency: 'USD', effectiveFrom: '1970-01-01',
    inputPerMillionTokens: 0, outputPerMillionTokens: 0, cachedInputPerMillionTokens: 0, cacheWritePerMillionTokens: 0,
    reasoningPerMillionTokens: 0, maximumInputTokens: 0, maximumOutputTokens: 0,
    maximumReasoningTokens: 0, ceilingRule: 'fixture' };
  await assert.rejects(repository.reserve(stored.sessionId, turn.requestId, first.claimToken, 0.01, pricing, 'propose'),
    (error) => error.code === 'claim_fenced');
  await repository.reserve(stored.sessionId, turn.requestId, reclaimed.claimToken, 0.01, pricing, 'propose');
});

test('unknown provider outcome keeps its hold and replays one safe refusal without a second call', async () => {
  const transport = new FixtureTransport({ failure: new TransportFault('offline ambiguous exchange', false) });
  const { db, handler } = harness(transport); const body = input('request-unknown', 'turn-unknown');
  const first = await handler(await signedRequest(body, 'nonce-unknown-0001'));
  assert.equal(first.status, 200);
  const plan = await first.json();
  assert.equal(plan.disposition, 'refuse');
  assert.match(plan.limitations.join(' '), /transport_fault/);
  assert.equal([...db.reservations.values()][0].state, 'outcome_unknown');
  const repeated = await handler(await signedRequest(body, 'nonce-unknown-0002'));
  assert.equal(repeated.status, 200);
  assert.deepEqual(await repeated.json(), plan);
  assert.equal(transport.calls, 1);
});

test('settlement failure never releases a provider charge or permits a retry', async () => {
  const transport = new FixtureTransport(); const { db, handler } = harness(transport);
  db.failSettlement = true;
  const body = input('request-settlement', 'turn-settlement');
  const first = await handler(await signedRequest(body, 'nonce-settle-00001'));
  assert.equal(first.status, 200);
  const plan = await first.json();
  assert.equal(plan.disposition, 'refuse');
  assert.match(plan.limitations.join(' '), /settlement_failed/);
  assert.equal([...db.reservations.values()][0].state, 'outcome_unknown');
  const replay = await handler(await signedRequest(body, 'nonce-settle-00002'));
  assert.equal(replay.status, 200);
  assert.equal(transport.calls, 1);
});

test('credential, provider registry, network gates, and nonzero budget are all fail-closed', () => {
  const db = new MemoryVoiceSql(); const transport = new FixtureTransport();
  for (const broken of [
    { CORE_V2_VOICE_HMAC_SECRET: '' },
    { CORE_V2_VOICE_PROVIDER_REGISTRY: '' },
    { CORE_V2_VOICE_ALLOW_PROVIDER_NETWORK: 'false' },
    { CORE_V2_ALLOW_PAID_CALLS: 'false' },
    { CORE_V2_VOICE_BUDGET_POLICY: JSON.stringify({ ...POLICY, authorizedMaximumUsd: 0, maximumPerTurnUsd: 0 }) },
  ]) assert.throws(() => assembleVoiceRuntime({ db, env: environment(broken), transport }));
});
