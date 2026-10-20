import { VoiceContractError } from '../../../workers/core-v2-voice/contracts.ts';
import type { VoiceOrchestrator } from '../../../workers/core-v2-voice/orchestrator.ts';
import {
  verifyVoiceServiceRequest,
  type VoiceCredentialResolver,
  type VoiceReplayStore,
} from '../_shared/core-v2/voice-auth.ts';

const MAXIMUM_BODY_BYTES = 32_000;

export function createVoiceTurnHandler(dependencies: {
  resolveCredential: VoiceCredentialResolver;
  replayStore: VoiceReplayStore;
  orchestrator: VoiceOrchestrator;
  admit: (authority: { callerApp: string; tenantId: string }, callIdentity: string,
    ownerIdentityDigest: string) => Promise<Record<string, unknown>>;
  claimStream: (authority: { callerApp: string; tenantId: string }, callIdentity: string,
    suiteId: string) => Promise<Record<string, unknown>>;
  nowSeconds?: () => number;
}) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
    const rawBody = await boundedBody(request, MAXIMUM_BODY_BYTES);
    if (rawBody === null) return json(413, { error: 'payload_too_large' });
    const auth = await verifyVoiceServiceRequest({
      request, rawBody,
      resolveCredential: dependencies.resolveCredential,
      replayStore: dependencies.replayStore,
      nowSeconds: dependencies.nowSeconds?.(),
    });
    if (!auth.ok) return json(auth.status, { error: auth.code });

    let body: unknown;
    try { body = JSON.parse(rawBody); }
    catch { return json(400, { error: 'bad_request' }); }
    try {
      if (isAdmissionRequest(body)) {
        const lease = await dependencies.admit(
          { callerApp: auth.context.callerApp, tenantId: auth.context.tenantId },
          body.callIdentity,
          body.ownerIdentityDigest,
        );
        return json(200, lease);
      }
      if (isStreamClaimRequest(body)) {
        const claim = await dependencies.claimStream(
          { callerApp: auth.context.callerApp, tenantId: auth.context.tenantId },
          body.callIdentity,
          body.suiteId,
        );
        return json(200, claim);
      }
      if (isAdmissionProtocol(body)) return json(400, { error: 'bad_request' });
      const plan = await dependencies.orchestrator.turn(
        { callerApp: auth.context.callerApp, tenantId: auth.context.tenantId },
        body,
        request.signal,
      );
      return json(200, plan);
    } catch (error) {
      if (error instanceof VoiceContractError) {
        if (error.code.startsWith('admission_')) return json(403, { error: error.code });
        const conflict = ['stale_state', 'idempotency_conflict', 'turn_in_progress', 'outcome_unknown'];
        const serverFault = ['persistence_corrupt', 'invalid_commit', 'turn_not_claimed', 'claim_fenced'];
        return json(conflict.includes(error.code) ? 409 : serverFault.includes(error.code) ? 503 : 400,
          { error: serverFault.includes(error.code) ? 'voice_persistence_unavailable' : error.code });
      }
      return json(500, { error: 'voice_turn_failed' });
    }
  };
}

function isAdmissionProtocol(value: unknown): boolean {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value)
    && typeof (value as Record<string, unknown>).protocol === 'string'
    && String((value as Record<string, unknown>).protocol).startsWith('core-v2.voice-admission'));
}

function isAdmissionRequest(value: unknown): value is {
  protocol: 'core-v2.voice-admission.1'; callIdentity: string; ownerIdentityDigest: string;
} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const body = value as Record<string, unknown>;
  return body.protocol === 'core-v2.voice-admission.1'
    && typeof body.callIdentity === 'string' && /^CA[a-f0-9]{32}$/i.test(body.callIdentity)
    && typeof body.ownerIdentityDigest === 'string' && /^[a-f0-9]{64}$/.test(body.ownerIdentityDigest)
    && Object.keys(body).every((key) => ['protocol', 'callIdentity', 'ownerIdentityDigest'].includes(key));
}

function isStreamClaimRequest(value: unknown): value is {
  protocol: 'core-v2.voice-admission-stream.1'; callIdentity: string; suiteId: string;
} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const body = value as Record<string, unknown>;
  return body.protocol === 'core-v2.voice-admission-stream.1'
    && typeof body.callIdentity === 'string' && /^CA[a-f0-9]{32}$/i.test(body.callIdentity)
    && typeof body.suiteId === 'string' && /^[A-Za-z0-9_.:-]{1,80}$/.test(body.suiteId)
    && Object.keys(body).every((key) => ['protocol', 'callIdentity', 'suiteId'].includes(key));
}

async function boundedBody(request: Request, maximum: number): Promise<string | null> {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > maximum) return null;
  const body = await request.text();
  return new TextEncoder().encode(body).byteLength <= maximum ? body : null;
}

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
