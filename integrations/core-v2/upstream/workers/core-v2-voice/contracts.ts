export const VOICE_TURN_PROTOCOL = 'core-v2.voice-turn.1' as const;
export const SUPPORTED_LANGUAGES = ['en', 'ru', 'es', 'zh'] as const;
export type VoiceLanguage = typeof SUPPORTED_LANGUAGES[number];

export type DeliveryState = 'pending' | 'delivered' | 'interrupted' | 'failed';
export type DialogueDisposition =
  | 'answer'
  | 'clarify'
  | 'pause'
  | 'resume'
  | 'end'
  | 'human_handoff'
  | 'refuse';
export type ApplicationTransition = 'none' | 'offer' | 'continue' | 'stop';
export type ClaimRisk = 'low_risk' | 'grounded_education' | 'financial_quote' | 'eligibility' | 'current_information' | 'external_action';

export type DeliveryEvidence = {
  role: 'user' | 'assistant';
  text: string;
  turnRevision: number;
  delivery?: DeliveryState;
};

/* Tenant, caller application, policy and budget are intentionally absent.
 * The authenticated server boundary supplies them. */
export type VoiceTurnInput = {
  protocol: typeof VOICE_TURN_PROTOCOL;
  requestId: string;
  callIdentity: string;
  turnId: string;
  expectedStateRevision: number;
  language: VoiceLanguage;
  utterance: { text: string; final: true; sttConfidence: number | null };
  deliveryEvidence: DeliveryEvidence[];
};

export type VoiceFact = {
  key: string;
  entity: string;
  value: string | number | boolean;
  unit: string | null;
  scope: 'actual' | 'hypothetical';
  status: 'active' | 'superseded';
  sourceTurnId: string;
  revision: number;
  supersedesRevision: number | null;
  derivedFrom: string[];
};

export type FactPatch = Omit<VoiceFact, 'revision' | 'status'> & {
  operation: 'set' | 'supersede';
  expectedFactRevision: number | null;
};

export type ToolRequest = {
  requestId: string;
  tool: string;
  input: Record<string, unknown>;
};

export type ToolReceipt = {
  receiptId: string;
  requestId: string;
  tool: string;
  version: string;
  inputDigest: string;
  status: 'completed' | 'refused' | 'failed_known' | 'outcome_unknown';
  facts: Record<string, string | number | boolean>;
  approvedSourceIds: string[];
  currentAsOf: string | null;
  limitations: string[];
};

export type PlannedClaim = {
  claimId: string;
  risk: ClaimRisk;
  text: string;
  value: string | number | boolean | null;
  unit: string | null;
  receiptIds: string[];
  factKeys: string[];
  approvedSourceIds: string[];
};

export type SpeechAct = {
  kind: 'acknowledgement' | 'answer' | 'question' | 'disclosure' | 'refusal';
  text: string;
  claimIds: string[];
};

/* This is a provider proposal, never an authoritative assertion. Grounding,
 * review requirements and state transitions are recomputed by code. */
export type VoiceTurnDraft = {
  disposition: DialogueDisposition;
  topic: string;
  speech: SpeechAct[];
  optionalQuestion: string | null;
  factPatches: FactPatch[];
  toolRequests: ToolRequest[];
  claims: PlannedClaim[];
  requestedApplicationTransition: ApplicationTransition;
};

export type VoiceTurnPlan = {
  protocol: typeof VOICE_TURN_PROTOCOL;
  requestId: string;
  sessionId: string;
  stateRevision: number;
  disposition: DialogueDisposition;
  reply: string;
  optionalQuestion: string | null;
  topic: string;
  factPatches: FactPatch[];
  toolReceipts: ToolReceipt[];
  grounding: {
    grounded: boolean;
    validatedClaimIds: string[];
    refusedClaimIds: string[];
    approvedSourceIds: string[];
  };
  applicationTransition: ApplicationTransition;
  requiresHumanReview: boolean;
  limitations: string[];
};

export type DialogueState = {
  protocol: typeof VOICE_TURN_PROTOCOL;
  sessionId: string;
  owner: { callerApp: string; tenantId: string; callIdentityDigest: string };
  revision: number;
  language: VoiceLanguage;
  paused: boolean;
  ending: boolean;
  topic: string | null;
  pendingQuestion: string | null;
  applicationStage: 'not_started' | 'offered' | 'collecting' | 'stopped';
  facts: Record<string, VoiceFact>;
  recentTurns: Array<{ turnId: string; turnRevision: number; role: 'user' | 'assistant'; text: string; delivery?: DeliveryState }>;
};

export class VoiceContractError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'VoiceContractError';
    this.code = code;
  }
}

const plain = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const boundedText = (value: unknown, maximum: number, label: string): string => {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum) {
    throw new VoiceContractError('invalid_request', `${label} must be non-empty and at most ${maximum} characters`);
  }
  return value.trim();
};
const safeId = (value: unknown, label: string): string => {
  const text = boundedText(value, 128, label);
  if (!/^[A-Za-z0-9_.:-]+$/.test(text)) throw new VoiceContractError('invalid_request', `${label} is not a safe identifier`);
  return text;
};

export function parseVoiceTurnInput(value: unknown): VoiceTurnInput {
  if (!plain(value)) throw new VoiceContractError('invalid_request', 'request body must be an object');
  if (value.protocol !== VOICE_TURN_PROTOCOL) throw new VoiceContractError('unsupported_protocol', 'voice protocol is not supported');
  if ('tenantId' in value || 'callerApp' in value || 'policy' in value || 'budget' in value) {
    throw new VoiceContractError('authority_in_body', 'tenant, caller authority, policy and budget are server-owned');
  }
  if (!Number.isInteger(value.expectedStateRevision) || Number(value.expectedStateRevision) < 0) {
    throw new VoiceContractError('invalid_request', 'expectedStateRevision must be a non-negative integer');
  }
  if (!SUPPORTED_LANGUAGES.includes(value.language as VoiceLanguage)) {
    throw new VoiceContractError('invalid_request', 'language is not supported');
  }
  if (!plain(value.utterance) || value.utterance.final !== true) {
    throw new VoiceContractError('invalid_request', 'one final utterance is required');
  }
  const confidence = value.utterance.sttConfidence;
  if (confidence != null && (typeof confidence !== 'number' || confidence < 0 || confidence > 1)) {
    throw new VoiceContractError('invalid_request', 'sttConfidence must be null or between zero and one');
  }
  const evidence = value.deliveryEvidence ?? [];
  if (!Array.isArray(evidence) || evidence.length > 12) {
    throw new VoiceContractError('invalid_request', 'delivery evidence is limited to twelve entries');
  }
  const deliveryEvidence = evidence.map((entry, index): DeliveryEvidence => {
    if (!plain(entry) || !['user', 'assistant'].includes(String(entry.role))) {
      throw new VoiceContractError('invalid_request', `delivery evidence ${index} has no valid role`);
    }
    if (!Number.isInteger(entry.turnRevision) || Number(entry.turnRevision) < 0) {
      throw new VoiceContractError('invalid_request', `delivery evidence ${index} has no valid revision`);
    }
    const delivery = entry.delivery;
    if (delivery != null && !['pending', 'delivered', 'interrupted', 'failed'].includes(String(delivery))) {
      throw new VoiceContractError('invalid_request', `delivery evidence ${index} has no valid delivery state`);
    }
    return {
      role: entry.role as DeliveryEvidence['role'],
      text: boundedText(entry.text, 1_200, `delivery evidence ${index} text`),
      turnRevision: Number(entry.turnRevision),
      ...(delivery == null ? {} : { delivery: delivery as DeliveryState }),
    };
  });
  return {
    protocol: VOICE_TURN_PROTOCOL,
    requestId: safeId(value.requestId, 'requestId'),
    callIdentity: boundedText(value.callIdentity, 256, 'callIdentity'),
    turnId: safeId(value.turnId, 'turnId'),
    expectedStateRevision: Number(value.expectedStateRevision),
    language: value.language as VoiceLanguage,
    utterance: {
      text: boundedText(value.utterance.text, 2_000, 'utterance text'),
      final: true,
      sttConfidence: confidence == null ? null : confidence,
    },
    deliveryEvidence,
  };
}

export function validateDraftShape(value: unknown): VoiceTurnDraft {
  if (!plain(value)) throw new VoiceContractError('invalid_provider_plan', 'provider plan must be an object');
  const dispositions: DialogueDisposition[] = ['answer', 'clarify', 'pause', 'resume', 'end', 'human_handoff', 'refuse'];
  if (!dispositions.includes(value.disposition as DialogueDisposition)) {
    throw new VoiceContractError('invalid_provider_plan', 'provider plan has no valid disposition');
  }
  const speech = Array.isArray(value.speech) ? value.speech : [];
  if (speech.length < 1 || speech.length > 4) throw new VoiceContractError('invalid_provider_plan', 'provider plan needs one to four speech acts');
  const acts = speech.map((act, index): SpeechAct => {
    if (!plain(act) || !['acknowledgement', 'answer', 'question', 'disclosure', 'refusal'].includes(String(act.kind))) {
      throw new VoiceContractError('invalid_provider_plan', `speech act ${index} is invalid`);
    }
    if (!Array.isArray(act.claimIds) || act.claimIds.length > 12
      || !act.claimIds.every((id) => typeof id === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(id))) {
      throw new VoiceContractError('invalid_provider_plan', `speech act ${index} claim references are invalid`);
    }
    return { kind: act.kind as SpeechAct['kind'], text: boundedText(act.text, 600, `speech act ${index}`), claimIds: [...act.claimIds] as string[] };
  });
  const requests = Array.isArray(value.toolRequests) ? value.toolRequests : [];
  if (requests.length > 3) throw new VoiceContractError('invalid_provider_plan', 'provider plan requests too many tools');
  const toolRequests = requests.map((request, index): ToolRequest => {
    if (!plain(request) || !plain(request.input)) {
      throw new VoiceContractError('invalid_provider_plan', `tool request ${index} is invalid`);
    }
    const serializedInput = JSON.stringify(request.input);
    if (serializedInput.length > 4_000) throw new VoiceContractError('invalid_provider_plan', `tool request ${index} is too large`);
    return {
      requestId: safeId(request.requestId, `tool request ${index} id`),
      tool: safeId(request.tool, `tool request ${index} tool`),
      input: structuredClone(request.input),
    };
  });
  const claims = Array.isArray(value.claims) ? value.claims : [];
  if (claims.length > 12) throw new VoiceContractError('invalid_provider_plan', 'provider plan contains too many claims');
  const risks: ClaimRisk[] = ['low_risk', 'grounded_education', 'financial_quote', 'eligibility', 'current_information', 'external_action'];
  const plannedClaims = claims.map((claim, index): PlannedClaim => {
    if (!plain(claim) || !risks.includes(claim.risk as ClaimRisk)
      || (claim.value !== null && !['string', 'number', 'boolean'].includes(typeof claim.value))
      || (typeof claim.value === 'number' && !Number.isFinite(claim.value))
      || (claim.unit !== null && (typeof claim.unit !== 'string' || claim.unit.length > 64))
      || !safeIdArray(claim.receiptIds, 6) || !safeIdArray(claim.factKeys, 1)
      || !safeIdArray(claim.approvedSourceIds, 12)) {
      throw new VoiceContractError('invalid_provider_plan', `claim ${index} is invalid`);
    }
    return {
      claimId: safeId(claim.claimId, `claim ${index} id`),
      risk: claim.risk as ClaimRisk,
      text: boundedText(claim.text, 600, `claim ${index} text`),
      value: claim.value as PlannedClaim['value'],
      unit: claim.unit as string | null,
      receiptIds: [...claim.receiptIds] as string[],
      factKeys: [...claim.factKeys] as string[],
      approvedSourceIds: [...claim.approvedSourceIds] as string[],
    };
  });
  const patches = Array.isArray(value.factPatches) ? value.factPatches : [];
  if (patches.length > 20) throw new VoiceContractError('invalid_provider_plan', 'provider plan contains too many fact patches');
  const factPatches = patches.map((patch, index): FactPatch => {
    if (!plain(patch) || !['set', 'supersede'].includes(String(patch.operation))
      || !['actual', 'hypothetical'].includes(String(patch.scope))
      || !['string', 'number', 'boolean'].includes(typeof patch.value)
      || (typeof patch.value === 'number' && !Number.isFinite(patch.value))
      || (patch.unit !== null && (typeof patch.unit !== 'string' || patch.unit.length > 64))
      || (patch.expectedFactRevision !== null && (!Number.isInteger(patch.expectedFactRevision) || Number(patch.expectedFactRevision) < 0))
      || (patch.supersedesRevision !== null && (!Number.isInteger(patch.supersedesRevision) || Number(patch.supersedesRevision) < 0))
      || !safeIdArray(patch.derivedFrom, 20)) {
      throw new VoiceContractError('invalid_provider_plan', `fact patch ${index} is invalid`);
    }
    return {
      operation: patch.operation as FactPatch['operation'],
      key: safeId(patch.key, `fact patch ${index} key`),
      entity: boundedText(patch.entity, 128, `fact patch ${index} entity`),
      value: patch.value as FactPatch['value'],
      unit: patch.unit as string | null,
      scope: patch.scope as FactPatch['scope'],
      sourceTurnId: safeId(patch.sourceTurnId, `fact patch ${index} source turn`),
      expectedFactRevision: patch.expectedFactRevision as number | null,
      supersedesRevision: patch.supersedesRevision as number | null,
      derivedFrom: [...patch.derivedFrom] as string[],
    };
  });
  const transitions: ApplicationTransition[] = ['none', 'offer', 'continue', 'stop'];
  return {
    disposition: value.disposition as DialogueDisposition,
    topic: boundedText(value.topic ?? 'general', 120, 'topic'),
    speech: acts,
    optionalQuestion: value.optionalQuestion == null ? null : boundedText(value.optionalQuestion, 300, 'optional question'),
    factPatches,
    toolRequests,
    claims: plannedClaims,
    requestedApplicationTransition: transitions.includes(value.requestedApplicationTransition as ApplicationTransition)
      ? value.requestedApplicationTransition as ApplicationTransition
      : 'none',
  };
}

function safeIdArray(value: unknown, maximum: number): value is string[] {
  return Array.isArray(value) && value.length <= maximum
    && value.every((item) => typeof item === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(item));
}
