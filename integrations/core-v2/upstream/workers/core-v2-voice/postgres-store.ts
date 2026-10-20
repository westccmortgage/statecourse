import {
  VOICE_TURN_PROTOCOL,
  VoiceContractError,
  type DialogueState,
  type VoiceLanguage,
  type VoiceTurnPlan,
} from './contracts.ts';
import {
  VoiceBudgetRefusal,
  type VoiceBudget,
  type VoiceBudgetPolicy,
  type VoicePricingSnapshot,
  type VoiceReservation,
  type VoiceUsageAudit,
} from './budget.ts';
import {
  digestCallIdentity,
  newDialogueState,
  sessionIdFor,
  type ClaimedTurn,
  type VoiceAuthority,
  type VoiceStateStore,
} from './state-store.ts';

export type SqlValue = string | number | boolean | null | undefined;
export type VoiceQueryResult = { rows: Array<Record<string, unknown>> };
export type VoiceQueryable = {
  query(sql: string, parameters?: SqlValue[]): Promise<VoiceQueryResult>;
};

const jsonValue = (value: unknown, label: string): unknown => {
  if (typeof value === 'string') {
    try { return JSON.parse(value); }
    catch { throw new VoiceContractError('persistence_corrupt', `${label} is not valid JSON`); }
  }
  return value;
};

const plain = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function persistedError(error: unknown): never {
  const message = String((error as Error)?.message ?? error);
  const code = message.match(/voice:([a-z_]+)/)?.[1];
  if (code?.startsWith('budget_') || code?.startsWith('reservation_')
    || code === 'invalid_reservation' || code === 'settlement_exceeds_reservation'
    || code === 'release_reason_required') {
    throw new VoiceBudgetRefusal(code, message);
  }
  if (code) throw new VoiceContractError(code, message);
  throw error;
}

function parseState(value: unknown, expectedSessionId: string): DialogueState {
  const state = jsonValue(value, 'persisted voice state');
  if (!plain(state) || state.protocol !== VOICE_TURN_PROTOCOL || state.sessionId !== expectedSessionId
    || !Number.isInteger(state.revision) || !plain(state.owner) || !plain(state.facts)
    || !Array.isArray(state.recentTurns)) {
    throw new VoiceContractError('persistence_corrupt', 'persisted voice state has an invalid shape');
  }
  return state as unknown as DialogueState;
}

function parsePlan(value: unknown, expectedSessionId: string): VoiceTurnPlan {
  const plan = jsonValue(value, 'persisted voice response');
  if (!plain(plan) || plan.protocol !== VOICE_TURN_PROTOCOL || plan.sessionId !== expectedSessionId
    || typeof plan.requestId !== 'string' || !Number.isInteger(plan.stateRevision)
    || typeof plan.reply !== 'string' || !Array.isArray(plan.factPatches)
    || !Array.isArray(plan.toolReceipts) || !Array.isArray(plan.limitations)) {
    throw new VoiceContractError('persistence_corrupt', 'persisted voice response has an invalid shape');
  }
  return plan as unknown as VoiceTurnPlan;
}

export class PostgresVoiceRepository implements VoiceStateStore, VoiceBudget {
  readonly policy: VoiceBudgetPolicy;
  private readonly db: VoiceQueryable;
  private readonly leaseSeconds: number;

  constructor(db: VoiceQueryable, policy: VoiceBudgetPolicy, leaseSeconds = 45) {
    this.db = db;
    this.policy = Object.freeze({ ...policy });
    this.leaseSeconds = leaseSeconds;
  }

  async claimReplay(keyId: string, nonce: string, timestamp: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        'select core_v2_voice_private.core_v2_voice_claim_replay($1,$2,to_timestamp($3),$4) as claimed',
        [keyId, nonce, timestamp, 60],
      );
      return result.rows[0]?.claimed === true || result.rows[0]?.claimed === 'true';
    } catch (error) { return persistedError(error); }
  }

  readonly replayStore = {
    claim: (keyId: string, nonce: string, timestamp: number) => this.claimReplay(keyId, nonce, timestamp),
  };

  async claimAdmission(authority: VoiceAuthority, callIdentity: string,
    ownerIdentityDigest: string, policy: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const result = await this.db.query(
        `select core_v2_voice_private.core_v2_voice_claim_admission(
          $1,$2,$3,$4::jsonb
        ) as result`,
        [String(policy.suiteId ?? ''), ownerIdentityDigest,
          digestCallIdentity(authority, callIdentity), JSON.stringify(policy)],
      );
      const value = jsonValue(result.rows[0]?.result, 'voice admission result');
      if (!plain(value) || value.protocol !== 'core-v2.voice-admission.1') {
        throw new VoiceContractError('persistence_corrupt', 'voice admission returned an invalid result');
      }
      return value;
    } catch (error) { return persistedError(error); }
  }

  async claimAdmissionStream(authority: VoiceAuthority, callIdentity: string,
    suiteId: string): Promise<Record<string, unknown>> {
    try {
      const result = await this.db.query(
        'select core_v2_voice_private.core_v2_voice_claim_admission_stream($1,$2) as result',
        [suiteId, digestCallIdentity(authority, callIdentity)],
      );
      const value = jsonValue(result.rows[0]?.result, 'voice admission stream result');
      if (!plain(value) || value.protocol !== 'core-v2.voice-admission-stream.1' || value.claimed !== true) {
        throw new VoiceContractError('persistence_corrupt', 'voice stream admission returned an invalid result');
      }
      return value;
    } catch (error) { return persistedError(error); }
  }

  async claim(authority: VoiceAuthority, callIdentity: string, requestId: string, turnId: string,
    expectedRevision: number, language: VoiceLanguage, requestDigest: string): Promise<ClaimedTurn> {
    const sessionId = sessionIdFor(authority, callIdentity);
    const initial = newDialogueState(authority, callIdentity, language);
    try {
      const result = await this.db.query(
        `select core_v2_voice_private.core_v2_voice_claim_turn(
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11
        ) as result`,
        [sessionId, authority.callerApp, authority.tenantId, digestCallIdentity(authority, callIdentity),
          requestId, turnId, requestDigest, expectedRevision, language, JSON.stringify(initial), this.leaseSeconds],
      );
      const envelope = jsonValue(result.rows[0]?.result, 'voice claim result');
      if (!plain(envelope)) throw new VoiceContractError('persistence_corrupt', 'voice claim returned no result');
      return {
        state: parseState(envelope.state, sessionId),
        repeated: envelope.repeated == null ? null : parsePlan(envelope.repeated, sessionId),
        claimToken: envelope.claimToken == null ? null : String(envelope.claimToken),
      };
    } catch (error) { return persistedError(error); }
  }

  async commit(authority: VoiceAuthority, callIdentity: string, requestId: string,
    claimToken: string, expectedRevision: number, state: DialogueState, response: VoiceTurnPlan): Promise<VoiceTurnPlan> {
    const sessionId = sessionIdFor(authority, callIdentity);
    try {
      const result = await this.db.query(
        `select core_v2_voice_private.core_v2_voice_commit_turn(
          $1,$2,$3,$4,$5,$6::uuid,$7,$8::jsonb,$9::jsonb
        ) as result`,
        [sessionId, authority.callerApp, authority.tenantId, digestCallIdentity(authority, callIdentity),
          requestId, claimToken, expectedRevision, JSON.stringify(state), JSON.stringify(response)],
      );
      return parsePlan(result.rows[0]?.result, sessionId);
    } catch (error) { return persistedError(error); }
  }

  async abort(authority: VoiceAuthority, callIdentity: string, requestId: string, claimToken: string): Promise<void> {
    try {
      await this.db.query(
        'select core_v2_voice_private.core_v2_voice_abort_turn($1,$2,$3,$4,$5,$6::uuid)',
        [sessionIdFor(authority, callIdentity), authority.callerApp, authority.tenantId,
          digestCallIdentity(authority, callIdentity), requestId, claimToken],
      );
    } catch (error) { persistedError(error); }
  }

  async reserve(sessionId: string, requestId: string, claimToken: string, maximumUsd: number, pricing: VoicePricingSnapshot,
    phase: 'propose' | 'finalize' = 'propose'): Promise<VoiceReservation> {
    try {
      const result = await this.db.query(
        'select core_v2_voice_private.core_v2_voice_reserve_budget($1,$2,$3,$4::uuid,$5,$6::jsonb,$7::jsonb) as result',
        [sessionId, requestId, phase, claimToken, maximumUsd, JSON.stringify(this.policy), JSON.stringify(pricing)],
      );
      const value = jsonValue(result.rows[0]?.result, 'voice reservation');
      if (!plain(value)) throw new VoiceBudgetRefusal('persistence_corrupt', 'voice reservation has an invalid shape');
      const state = String(value.state) as VoiceReservation['state'];
      const settled = value.settled_usd ?? value.settledUsd;
      return {
        reservationId: String(value.reservation_id ?? value.reservationId),
        sessionId: String(value.session_id ?? value.sessionId),
        requestId: String(value.request_id ?? value.requestId),
        maximumUsd: Number(value.maximum_usd ?? value.maximumUsd),
        state,
        settledUsd: settled == null ? null : Number(settled),
      };
    } catch (error) { return persistedError(error); }
  }

  async settle(reservationId: string, settledUsd: number, usage: VoiceUsageAudit): Promise<void> {
    try { await this.db.query('select core_v2_voice_private.core_v2_voice_settle_budget($1::uuid,$2,$3::jsonb,$4::jsonb)',
      [reservationId, settledUsd, JSON.stringify(usage.raw), JSON.stringify(usage.normalized)]); }
    catch (error) { persistedError(error); }
  }

  async release(reservationId: string, reason: string): Promise<void> {
    try { await this.db.query('select core_v2_voice_private.core_v2_voice_release_budget($1::uuid,$2)', [reservationId, reason]); }
    catch (error) { persistedError(error); }
  }

  async preserveUnknown(reservationId: string): Promise<void> {
    try { await this.db.query('select core_v2_voice_private.core_v2_voice_preserve_unknown($1::uuid)', [reservationId]); }
    catch (error) { persistedError(error); }
  }
}
