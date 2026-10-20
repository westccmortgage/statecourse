import { VoiceContractError, type ApplicationTransition, type DialogueState, type FactPatch, type VoiceTurnInput } from './contracts.ts';

const APPLICATION_CONSENT = /\b(?:start|continue|move (?:on|forward)|proceed)\b.{0,30}\bapplication\b|\bapply\b/i;
const APPLICATION_STOP = /\b(?:do not|don't|stop|no)\b.{0,30}\b(?:apply|application)\b/i;

export function authorizedApplicationTransition(
  state: DialogueState,
  requested: ApplicationTransition,
  utterance: string,
): ApplicationTransition {
  if (requested === 'offer') return 'offer';
  if (requested === 'continue') return APPLICATION_CONSENT.test(utterance) ? 'continue' : 'none';
  if (requested === 'stop') return APPLICATION_STOP.test(utterance) ? 'stop' : 'none';
  return 'none';
}

export function applyTurnState(
  prior: DialogueState,
  input: VoiceTurnInput,
  options: {
    topic: string;
    pendingQuestion: string | null;
    transition: ApplicationTransition;
    factPatches: FactPatch[];
    assistantReply: string;
    paused?: boolean;
    ending?: boolean;
  },
): DialogueState {
  const next = structuredClone(prior);
  next.revision += 1;
  next.language = input.language;
  next.topic = options.topic;
  next.pendingQuestion = options.pendingQuestion;
  if (options.paused != null) next.paused = options.paused;
  if (options.ending != null) next.ending = options.ending;
  if (options.transition === 'offer') next.applicationStage = 'offered';
  if (options.transition === 'continue') next.applicationStage = 'collecting';
  if (options.transition === 'stop') next.applicationStage = 'stopped';

  for (const patch of options.factPatches) {
    validatePatch(patch);
    const existing = next.facts[patch.key];
    if ((existing?.revision ?? null) !== patch.expectedFactRevision) {
      throw new VoiceContractError('stale_fact', `fact ${patch.key} changed before this patch`);
    }
    if (patch.operation === 'supersede') {
      if (!existing) throw new VoiceContractError('missing_fact', `fact ${patch.key} cannot be superseded because it is absent`);
      next.facts[patch.key] = { ...existing, status: 'superseded', revision: next.revision };
      continue;
    }
    next.facts[patch.key] = {
      key: patch.key,
      entity: patch.entity,
      value: patch.value,
      unit: patch.unit,
      scope: patch.scope,
      status: 'active',
      sourceTurnId: input.turnId,
      revision: next.revision,
      supersedesRevision: existing?.revision ?? null,
      derivedFrom: [...patch.derivedFrom],
    };
  }

  next.recentTurns.push({ turnId: input.turnId, turnRevision: next.revision, role: 'user', text: input.utterance.text });
  next.recentTurns.push({ turnId: input.turnId, turnRevision: next.revision, role: 'assistant', text: options.assistantReply, delivery: 'pending' });
  next.recentTurns = next.recentTurns.slice(-20);
  return next;
}

export function validatedFactPatches(
  input: VoiceTurnInput,
  patches: FactPatch[],
  receiptFacts: Array<string | number | boolean>,
): { accepted: FactPatch[]; refusedKeys: string[] } {
  const utterance = input.utterance.text.toLowerCase();
  const hypothetical = /\b(?:if|suppose|hypothetical|scenario|what if)\b/i.test(input.utterance.text);
  const accepted: FactPatch[] = [];
  const refusedKeys: string[] = [];
  for (const patch of patches) {
    try { validatePatch(patch); } catch { refusedKeys.push(String(patch?.key ?? '(missing)')); continue; }
    if (patch.operation === 'supersede') { accepted.push(patch); continue; }
    const valueSupported = receiptFacts.some((value) => samePrimitive(value, patch.value))
      || utterance.includes(String(patch.value).toLowerCase());
    const scopeSupported = hypothetical ? patch.scope === 'hypothetical' : patch.scope === 'actual';
    if (valueSupported && scopeSupported) accepted.push(patch);
    else refusedKeys.push(patch.key);
  }
  return { accepted, refusedKeys };
}

function validatePatch(patch: FactPatch): void {
  if (!patch || typeof patch !== 'object' || !['set', 'supersede'].includes(patch.operation)) {
    throw new VoiceContractError('invalid_fact_patch', 'fact patch has no valid operation');
  }
  if (!/^[A-Za-z0-9_.:-]{1,128}$/.test(String(patch.key ?? ''))) {
    throw new VoiceContractError('invalid_fact_patch', 'fact patch key is invalid');
  }
  if (typeof patch.entity !== 'string' || !patch.entity || patch.entity.length > 128) {
    throw new VoiceContractError('invalid_fact_patch', 'fact patch entity is invalid');
  }
  if (!['actual', 'hypothetical'].includes(patch.scope)) {
    throw new VoiceContractError('invalid_fact_patch', 'fact patch scope is invalid');
  }
  if (patch.expectedFactRevision != null && (!Number.isInteger(patch.expectedFactRevision) || patch.expectedFactRevision < 0)) {
    throw new VoiceContractError('invalid_fact_patch', 'expected fact revision is invalid');
  }
  if (!Array.isArray(patch.derivedFrom) || patch.derivedFrom.length > 20) {
    throw new VoiceContractError('invalid_fact_patch', 'fact dependencies are invalid');
  }
}

function samePrimitive(left: string | number | boolean, right: string | number | boolean): boolean {
  if (typeof left === 'number' && typeof right === 'number') return Math.abs(left - right) < 0.000001;
  return String(left).trim().toLowerCase() === String(right).trim().toLowerCase();
}
