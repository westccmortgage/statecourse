import { createHash, randomUUID } from 'node:crypto';
import { VOICE_TURN_PROTOCOL, VoiceContractError, type DialogueState, type VoiceLanguage, type VoiceTurnInput, type VoiceTurnPlan } from './contracts.ts';

export type VoiceAuthority = { callerApp: string; tenantId: string };
export type ClaimedTurn = { state: DialogueState; repeated: VoiceTurnPlan | null; claimToken: string | null };

export interface VoiceStateStore {
  claim(authority: VoiceAuthority, callIdentity: string, requestId: string, turnId: string,
    expectedRevision: number, language: VoiceLanguage, requestDigest: string): Promise<ClaimedTurn>;
  commit(authority: VoiceAuthority, callIdentity: string, requestId: string,
    claimToken: string, expectedRevision: number, state: DialogueState, response: VoiceTurnPlan): Promise<VoiceTurnPlan>;
  abort(authority: VoiceAuthority, callIdentity: string, requestId: string, claimToken: string): Promise<void>;
}

export const digestCallIdentity = (authority: VoiceAuthority, callIdentity: string): string =>
  createHash('sha256').update(`${authority.tenantId}\0${authority.callerApp}\0${callIdentity}`).digest('hex');
export const sessionIdFor = (authority: VoiceAuthority, callIdentity: string): string =>
  `voice_${digestCallIdentity(authority, callIdentity).slice(0, 32)}`;
export const digestTurnRequest = (input: VoiceTurnInput): string => createHash('sha256').update(JSON.stringify([
  input.protocol, input.requestId, input.callIdentity, input.turnId, input.expectedStateRevision,
  input.language, input.utterance, input.deliveryEvidence,
])).digest('hex');

export function newDialogueState(authority: VoiceAuthority, callIdentity: string, language: VoiceLanguage): DialogueState {
  return {
    protocol: VOICE_TURN_PROTOCOL,
    sessionId: sessionIdFor(authority, callIdentity),
    owner: { ...authority, callIdentityDigest: digestCallIdentity(authority, callIdentity) },
    revision: 0,
    language,
    paused: false,
    ending: false,
    topic: null,
    pendingQuestion: null,
    applicationStage: 'not_started',
    facts: {},
    recentTurns: [],
  };
}

type Stored = { state: DialogueState; claimed: Map<string, { turnId: string; requestDigest: string; claimToken: string; response: VoiceTurnPlan | null }> };

/* Test/local store only. Production injects PostgresVoiceRepository; this
 * class is never instantiated by the Edge entry. */
export class InMemoryVoiceStateStore implements VoiceStateStore {
  private sessions = new Map<string, Stored>();

  async claim(authority: VoiceAuthority, callIdentity: string, requestId: string, turnId: string,
    expectedRevision: number, language: VoiceLanguage, requestDigest: string): Promise<ClaimedTurn> {
    const id = sessionIdFor(authority, callIdentity);
    let stored = this.sessions.get(id);
    if (!stored) {
      stored = { state: newDialogueState(authority, callIdentity, language), claimed: new Map() };
      this.sessions.set(id, stored);
    }
    this.assertOwner(stored.state, authority, callIdentity);
    const prior = stored.claimed.get(requestId);
    if (prior) {
      if (prior.turnId !== turnId || prior.requestDigest !== requestDigest) {
        throw new VoiceContractError('idempotency_conflict', 'requestId belongs to another turn payload');
      }
      if (!prior.response) throw new VoiceContractError('turn_in_progress', 'requestId is already being processed');
      return { state: structuredClone(stored.state), repeated: structuredClone(prior.response), claimToken: null };
    }
    if (stored.state.revision !== expectedRevision) {
      throw new VoiceContractError('stale_state', `expected revision ${expectedRevision}, current revision is ${stored.state.revision}`);
    }
    const claimToken = randomUUID();
    stored.claimed.set(requestId, { turnId, requestDigest, claimToken, response: null });
    return { state: structuredClone(stored.state), repeated: null, claimToken };
  }

  async commit(authority: VoiceAuthority, callIdentity: string, requestId: string,
    claimToken: string, expectedRevision: number, state: DialogueState, response: VoiceTurnPlan): Promise<VoiceTurnPlan> {
    const stored = this.sessions.get(sessionIdFor(authority, callIdentity));
    if (!stored) throw new VoiceContractError('session_not_found', 'voice session does not exist');
    this.assertOwner(stored.state, authority, callIdentity);
    const claimed = stored.claimed.get(requestId);
    if (!claimed) throw new VoiceContractError('turn_not_claimed', 'turn was not claimed');
    if (claimed.response) return structuredClone(claimed.response);
    if (claimed.claimToken !== claimToken) throw new VoiceContractError('claim_fenced', 'turn claim is no longer current');
    if (stored.state.revision !== expectedRevision || state.revision !== expectedRevision + 1) {
      throw new VoiceContractError('stale_state', 'dialogue state changed before commit');
    }
    if (response.stateRevision !== state.revision || response.sessionId !== stored.state.sessionId) {
      throw new VoiceContractError('invalid_commit', 'response is not bound to the committed state');
    }
    stored.state = structuredClone(state);
    claimed.response = structuredClone(response);
    return structuredClone(response);
  }

  async abort(authority: VoiceAuthority, callIdentity: string, requestId: string, claimToken: string): Promise<void> {
    const stored = this.sessions.get(sessionIdFor(authority, callIdentity));
    if (!stored) return;
    this.assertOwner(stored.state, authority, callIdentity);
    const claimed = stored.claimed.get(requestId);
    if (claimed && !claimed.response && claimed.claimToken === claimToken) stored.claimed.delete(requestId);
  }

  snapshot(authority: VoiceAuthority, callIdentity: string): DialogueState | null {
    return structuredClone(this.sessions.get(sessionIdFor(authority, callIdentity))?.state ?? null);
  }

  private assertOwner(state: DialogueState, authority: VoiceAuthority, callIdentity: string): void {
    if (state.owner.callerApp !== authority.callerApp || state.owner.tenantId !== authority.tenantId
      || state.owner.callIdentityDigest !== digestCallIdentity(authority, callIdentity)) {
      throw new VoiceContractError('session_owner_mismatch', 'voice session belongs to another authenticated caller');
    }
  }
}
