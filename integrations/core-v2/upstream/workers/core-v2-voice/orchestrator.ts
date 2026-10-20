import type { VoiceBudget, VoiceReservation } from './budget.ts';
import {
  VOICE_TURN_PROTOCOL,
  VoiceContractError,
  parseVoiceTurnInput,
  type DialogueState,
  type FactPatch,
  type VoiceTurnDraft,
  type VoiceTurnInput,
  type VoiceTurnPlan,
} from './contracts.ts';
import { validateGroundedSpeech } from './grounding.ts';
import { GroundedToolRegistry } from './grounded-tools.ts';
import type { VoiceProvider, VoiceProviderOutcome } from './provider-text-adapter.ts';
import { applyTurnState, authorizedApplicationTransition, validatedFactPatches } from './state-reducer.ts';
import { digestTurnRequest, type VoiceAuthority, type VoiceStateStore } from './state-store.ts';

const HEARING = /\b(?:can|do) you (?:hear|understand) me\b|\bare you (?:there|hearing|listening)\b|(?:вы меня слышите|ты меня слышишь|вы здесь)|(?:me escucha|me oye|est[aá] ah[ií])|(?:听得到吗|听见我吗|在吗)/i;
const PAUSE = /^\s*(?:wait|hold on|stop(?: talking)?|pause|one (?:second|moment)|give me a (?:second|moment)|подождите|стоп|пауза|секунду|espere|un momento|pausa|det[eé]ngase|等一下|停一下|暂停)\s*[.!?。！]*\s*$/i;
const RESUME = /^\s*(?:ok(?:ay)?(?:,?\s+i(?:'m| am) ready)?|go ahead|continue|i(?:'m| am) ready|продолжайте|я готов(?:а)?|contin[uú]e|adelante|estoy list[oa]|继续|我准备好了)\s*[.!?。！]*\s*$/i;
const GOODBYE = /\b(good ?bye|bye bye|that'?s all|no that'?s it|hang up)\b|^(bye)\b|пока|до свидания|adi[oó]s|hasta luego|再见|拜拜/i;

export type OrchestratorDependencies = {
  store: VoiceStateStore;
  provider: VoiceProvider;
  tools: GroundedToolRegistry;
  budget: VoiceBudget;
};

export class VoiceOrchestrator {
  private readonly dependencies: OrchestratorDependencies;
  constructor(dependencies: OrchestratorDependencies) { this.dependencies = dependencies; }

  async turn(authority: VoiceAuthority, rawInput: unknown, signal = new AbortController().signal): Promise<VoiceTurnPlan> {
    const input = parseVoiceTurnInput(rawInput);
    const claimed = await this.dependencies.store.claim(
      authority, input.callIdentity, input.requestId, input.turnId,
      input.expectedStateRevision, input.language, digestTurnRequest(input),
    );
    if (claimed.repeated) return claimed.repeated;
    if (!claimed.claimToken) throw new VoiceContractError('persistence_corrupt', 'new turn claim returned no fencing token');
    const claimToken = claimed.claimToken;

    try {
      reconcileDeliveryEvidence(claimed.state, input.deliveryEvidence);

      const control = deterministicControl(input, claimed.state);
      if (control) return this.commit(authority, input, claimToken, claimed.state, control, []);

      const inferredFacts = inferConversationFacts(input, claimed.state);
      const opening = deterministicOpening(input, claimed.state, inferredFacts);
      if (opening) return this.commit(authority, input, claimToken, claimed.state, opening, [], [], inferredFacts);

      const first = await this.providerCall(input, claimToken, claimed.state, [], 'propose', signal);
      if (first.outcome !== 'completed') return this.commitFailure(authority, input, claimToken, claimed.state, first);
      let draft = enforceConversationOrder(first.draft, claimed.state, inferredFacts, input.language);
      const allowedToolInputs = authoritativeInputValues(input, claimed.state);
      const receipts = draft.toolRequests.map((request) => this.dependencies.tools.execute(request, allowedToolInputs));
      if (draft.toolRequests.length) {
        if (this.dependencies.budget.policy.maximumProviderCallsPerTurn < 2) {
          return this.commitFailure(authority, input, claimToken, claimed.state, {
            outcome: 'failed_known', code: 'provider_call_limit', detail: 'tool finalization requires a second bounded provider call',
          });
        }
        const finalized = await this.providerCall(input, claimToken, claimed.state, receipts, 'finalize', signal);
        if (finalized.outcome !== 'completed') return this.commitFailure(authority, input, claimToken, claimed.state, finalized);
        draft = finalized.draft;
        if (draft.toolRequests.length) {
          return this.commitFailure(authority, input, claimToken, claimed.state, {
            outcome: 'failed_known', code: 'recursive_tool_request', detail: 'finalized response requested additional tools',
          });
        }
      }
      draft = enforceConversationOrder(draft, claimed.state, inferredFacts, input.language);
      return this.commit(authority, input, claimToken, claimed.state, draft, receipts, [], inferredFacts);
    } catch (error) {
      await this.dependencies.store.abort(authority, input.callIdentity, input.requestId, claimToken);
      throw error;
    }
  }

  private async providerCall(input: VoiceTurnInput, claimToken: string, state: DialogueState, receipts: ReturnType<GroundedToolRegistry['execute']>[],
    phase: 'propose' | 'finalize', signal: AbortSignal): Promise<VoiceProviderOutcome> {
    let reservation: VoiceReservation;
    try {
      reservation = await this.dependencies.budget.reserve(
        state.sessionId, input.requestId, claimToken, this.dependencies.provider.maximumCostUsd,
        this.dependencies.provider.pricingSnapshot, phase,
      );
    } catch (error) {
      return { outcome: 'failed_known', code: 'budget_not_authorized', detail: String((error as Error).message ?? error) };
    }
    let outcome: VoiceProviderOutcome;
    try {
      outcome = await this.dependencies.provider.generate({ input, state, receipts, phase }, signal);
    } catch (error) {
      // An adapter is required to classify provably pre-submission failures.
      // An unclassified throw is therefore expensive: the request may have
      // left, so its hold must survive and the provider must not be retried.
      try { await this.dependencies.budget.preserveUnknown(reservation.reservationId); } catch { /* the open hold is already conservative */ }
      return { outcome: 'outcome_unknown', code: 'provider_exception', detail: String((error as Error).message ?? error) };
    }
    if (outcome.outcome === 'completed') {
      try {
        await this.dependencies.budget.settle(reservation.reservationId, outcome.settledUsd,
          { raw: outcome.usage, normalized: outcome.normalizedUsage });
        return outcome;
      } catch (error) {
        try { await this.dependencies.budget.preserveUnknown(reservation.reservationId); } catch { /* retain the existing hold */ }
        return { outcome: 'outcome_unknown', code: 'settlement_failed', detail: String((error as Error).message ?? error) };
      }
    }
    if (outcome.outcome === 'outcome_unknown') {
      try { await this.dependencies.budget.preserveUnknown(reservation.reservationId); } catch { /* retain the existing hold */ }
      return outcome;
    }
    try { await this.dependencies.budget.release(reservation.reservationId, outcome.code); }
    catch (error) {
      return { outcome: 'failed_known', code: 'release_failed', detail: String((error as Error).message ?? error) };
    }
    return outcome;
  }

  private async commit(authority: VoiceAuthority, input: VoiceTurnInput, claimToken: string, prior: DialogueState,
    draft: VoiceTurnDraft, receipts: ReturnType<GroundedToolRegistry['execute']>[],
    extraLimitations: string[] = [], trustedFactPatches: FactPatch[] = []): Promise<VoiceTurnPlan> {
    const grounding = validateGroundedSpeech(draft.speech, draft.claims, receipts);
    const reply = grounding.reply || safeRefusal(input.language);
    const transition = authorizedApplicationTransition(prior, draft.requestedApplicationTransition, input.utterance.text);
    const factValidation = validatedFactPatches(
      input,
      grounding.grounded ? draft.factPatches : [],
      receipts.flatMap((receipt) => Object.values(receipt.facts)),
    );
    const trustedKeys = new Set(trustedFactPatches.map((patch) => patch.key));
    const safePatches = [
      ...trustedFactPatches,
      ...factValidation.accepted.filter((patch) => !trustedKeys.has(patch.key)),
    ];
    const next = applyTurnState(prior, input, {
      topic: draft.topic,
      pendingQuestion: draft.optionalQuestion,
      transition,
      factPatches: safePatches,
      assistantReply: reply,
      paused: draft.disposition === 'pause' ? true : draft.disposition === 'resume' ? false : prior.paused,
      ending: draft.disposition === 'end' ? true : prior.ending,
    });
    const plan: VoiceTurnPlan = {
      protocol: VOICE_TURN_PROTOCOL,
      requestId: input.requestId,
      sessionId: prior.sessionId,
      stateRevision: next.revision,
      disposition: grounding.reply ? draft.disposition : 'refuse',
      reply,
      optionalQuestion: grounding.reply ? draft.optionalQuestion : null,
      topic: draft.topic,
      factPatches: safePatches,
      toolReceipts: receipts,
      grounding: {
        grounded: grounding.grounded,
        validatedClaimIds: grounding.validatedClaimIds,
        refusedClaimIds: grounding.refusedClaimIds,
        approvedSourceIds: grounding.approvedSourceIds,
      },
      applicationTransition: transition,
      requiresHumanReview: grounding.requiresHumanReview,
      limitations: [
        ...grounding.limitations,
        ...(factValidation.refusedKeys.length ? [`Fact patches withheld: ${factValidation.refusedKeys.join(', ')}`] : []),
        ...extraLimitations,
      ],
    };
    return this.dependencies.store.commit(authority, input.callIdentity, input.requestId, claimToken, prior.revision, next, plan);
  }

  private commitFailure(authority: VoiceAuthority, input: VoiceTurnInput, claimToken: string, state: DialogueState,
    outcome: Exclude<VoiceProviderOutcome, { outcome: 'completed' }>): Promise<VoiceTurnPlan> {
    return this.commit(authority, input, claimToken, state, {
      disposition: 'refuse', topic: state.topic ?? 'general',
      speech: [{ kind: 'refusal', text: safeRefusal(input.language), claimIds: [] }],
      optionalQuestion: null, factPatches: [], toolRequests: [], claims: [],
      requestedApplicationTransition: 'none',
    }, [], [`${outcome.code}: ${outcome.detail}`]);
  }
}

const GREETING_ONLY = /^\s*(?:hi|hello|hey|good (?:morning|afternoon|evening)|здравствуйте|привет|hola|buenos d[ií]as|你好|您好)[.!?\s]*$/i;
const PRODUCT_FIELD_QUESTION = /\b(?:purchase price|down payment|loan balance|mortgage balance|property value|credit score|annual income)\b|(?:цена покупки|первоначальн\w+ взнос|остаток.{0,12}ипотек|стоимость недвижимост|кредитн\w+ рейтинг|годов\w+ доход)|(?:precio de compra|pago inicial|saldo (?:del )?(?:pr[eé]stamo|hipoteca)|valor de la propiedad|puntaje de cr[eé]dito|ingreso anual)|(?:购买价格|购房价格|首付|贷款余额|房屋价值|信用评分|年收入)/i;

function inferConversationFacts(input: VoiceTurnInput, state: DialogueState): FactPatch[] {
  const text = input.utterance.text;
  const patches: FactPatch[] = [];
  const set = (key: string, entity: string, value: string) => {
    const existing = state.facts[key];
    if (existing?.status === 'active' && existing.value === value) return;
    patches.push({
      operation: 'set', key, entity, value, unit: null, scope: 'actual',
      sourceTurnId: input.turnId,
      expectedFactRevision: existing?.revision ?? null,
      supersedesRevision: existing?.revision ?? null,
      derivedFrom: [],
    });
  };

  const name = text.match(/\b(?:my name is|this is)\s+([A-Za-z][A-Za-z'’-]{1,40})(?=\b|[,.!?])/i)?.[1]
    ?? text.match(/^\s*i(?:'m| am)\s+([A-Z][A-Za-z'’-]{1,40})(?:[,.!?]|\s+(?:and|calling|looking|interested)\b)/)?.[1];
  const localizedName = name
    ?? text.match(/меня зовут\s+([А-ЯЁA-Z][А-ЯЁа-яёA-Za-z'’-]{1,40})/i)?.[1]
    ?? text.match(/me llamo\s+([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’-]{1,40})/i)?.[1]
    ?? text.match(/我叫\s*([\p{Script=Han}]{1,12})/u)?.[1];
  if (localizedName) set('caller.name', 'caller', localizedName);

  const intent = /\b(?:buy|buying|purchase|purchasing|new home|first home)\b|(?:купить|покупк\w+|нов\w+ дом|перв\w+ жиль)|(?:comprar|compra|nueva casa|primera casa)|(?:买房|购房|购买房)/i.test(text) ? 'purchase'
    : /\b(?:refinance|refi|lower (?:my )?(?:rate|payment)|change (?:my )?(?:rate|term))\b|(?:рефинансир|снизить.{0,12}(?:ставк|плат[её]ж))|(?:refinanciar|refinanciaci[oó]n|bajar.{0,12}(?:tasa|pago))|(?:再融资|降低.{0,8}(?:利率|月供))/i.test(text) ? 'refinance'
      : /\b(?:heloc|home equity|cash[- ]out|equity line|second mortgage)\b|(?:капитал.{0,12}(?:дом|жиль)|кредитн\w+ лини|втор\w+ ипотек)|(?:valor acumulado|l[ií]nea de cr[eé]dito|segunda hipoteca)|(?:房屋净值|净值信贷额度|二次抵押)/i.test(text) ? 'home_equity'
        : /\b(?:general (?:question|information)|just (?:a )?question)\b|(?:общ\w+ вопрос|просто вопрос)|(?:pregunta general|solo una pregunta)|(?:一般问题|只是问问)/i.test(text) ? 'general'
          : null;
  if (intent) set('caller.goal', 'caller_intent', intent);
  return patches;
}

function deterministicOpening(input: VoiceTurnInput, state: DialogueState, patches: FactPatch[]): VoiceTurnDraft | null {
  if (state.revision !== 0 || state.facts['caller.goal'] || patches.some((patch) => patch.key === 'caller.goal')) return null;
  const name = patches.find((patch) => patch.key === 'caller.name')?.value;
  if (!GREETING_ONLY.test(input.utterance.text) && !name) return null;
  const goalQuestion = {
    en: 'How can I help you today?',
    ru: 'Чем я могу помочь вам сегодня?',
    es: '¿Cómo puedo ayudarle hoy?',
    zh: '今天我能为您做些什么？',
  }[input.language];
  const namedReply = {
    en: `Nice to meet you, ${name}. ${goalQuestion}`,
    ru: `Приятно познакомиться, ${name}. ${goalQuestion}`,
    es: `Mucho gusto, ${name}. ${goalQuestion}`,
    zh: `很高兴认识您，${name}。${goalQuestion}`,
  }[input.language];
  const reply = typeof name === 'string' ? namedReply : goalQuestion;
  return {
    disposition: 'clarify', topic: 'goal_discovery',
    speech: [{ kind: 'question', text: reply, claimIds: [] }],
    optionalQuestion: goalQuestion, factPatches: [], toolRequests: [], claims: [],
    requestedApplicationTransition: 'none',
  };
}

function enforceConversationOrder(
  draft: VoiceTurnDraft,
  state: DialogueState,
  inferredFacts: FactPatch[],
  language: VoiceTurnInput['language'],
): VoiceTurnDraft {
  const goalKnown = Boolean(state.facts['caller.goal']) || inferredFacts.some((patch) => patch.key === 'caller.goal');
  const asksAnyQuestion = draft.optionalQuestion !== null || draft.speech.some((act) => act.kind === 'question');
  const asksProductField = PRODUCT_FIELD_QUESTION.test(draft.optionalQuestion ?? '')
    || draft.speech.some((act) => act.kind === 'question' && PRODUCT_FIELD_QUESTION.test(act.text))
    || ['purchase', 'refinance', 'home_equity'].includes(draft.topic)
    || asksAnyQuestion;
  if (goalKnown || !asksProductField) return draft;
  const question = {
    en: 'How can I help you today?',
    ru: 'Чем я могу помочь вам сегодня?',
    es: '¿Cómo puedo ayudarle hoy?',
    zh: '今天我能为您做些什么？',
  }[language];
  const safePrefix = draft.toolRequests.length === 0
    ? draft.speech.filter((act) => (act.kind === 'answer' || act.kind === 'refusal') && act.claimIds.length === 0)
    : [];
  return {
    ...draft,
    disposition: 'clarify',
    topic: 'goal_discovery',
    speech: [...safePrefix, { kind: 'question', text: question, claimIds: [] }],
    optionalQuestion: question,
    factPatches: [],
    toolRequests: [],
    claims: [],
    requestedApplicationTransition: 'none',
  };
}

function deterministicControl(input: VoiceTurnInput, state: DialogueState): VoiceTurnDraft | null {
  const text = input.utterance.text;
  const make = (disposition: VoiceTurnDraft['disposition'], reply: string): VoiceTurnDraft => ({
    disposition, topic: state.topic ?? 'conversation_control',
    speech: [{ kind: 'acknowledgement', text: reply, claimIds: [] }],
    optionalQuestion: null, factPatches: [], toolRequests: [], claims: [], requestedApplicationTransition: 'none',
  });
  if (GOODBYE.test(text)) return make('end', languageReply(input.language, 'goodbye'));
  if (PAUSE.test(text)) return make('pause', languageReply(input.language, 'pause'));
  if (RESUME.test(text)) return make('resume', languageReply(input.language, 'resume'));
  if (HEARING.test(text)) return make('answer', languageReply(input.language, 'hearing'));
  return null;
}

function languageReply(language: VoiceTurnInput['language'], kind: 'goodbye' | 'pause' | 'resume' | 'hearing'): string {
  const replies = {
    en: { goodbye: 'Thank you for calling. Goodbye.', pause: "Of course. I'll pause.", resume: "I'm listening. What would you like to ask?", hearing: "Yes, I can hear you. I'm listening." },
    ru: { goodbye: 'Спасибо за звонок. До свидания.', pause: 'Конечно. Я подожду.', resume: 'Я слушаю. Что вы хотели спросить?', hearing: 'Да, я вас слышу. Я слушаю.' },
    es: { goodbye: 'Gracias por llamar. Adiós.', pause: 'Por supuesto. Haré una pausa.', resume: 'Le escucho. ¿Qué desea preguntar?', hearing: 'Sí, le escucho. Estoy atenta.' },
    zh: { goodbye: '感谢您的来电。再见。', pause: '当然，我先暂停。', resume: '我在听。请问您想问什么？', hearing: '是的，我听得到。我在听。' },
  } as const;
  return replies[language][kind];
}

function safeRefusal(language: VoiceTurnInput['language']): string {
  return {
    en: "I can't answer that safely right now. Please ask another question, or a licensed broker can help.",
    ru: 'Сейчас я не могу безопасно ответить на это. Задайте другой вопрос, или вам поможет лицензированный брокер.',
    es: 'Ahora no puedo responder eso de forma segura. Puede hacer otra pregunta o hablar con un corredor con licencia.',
    zh: '我现在无法安全地回答这个问题。您可以问另一个问题，或由持牌经纪人协助。',
  }[language];
}

export function createVoiceOrchestrator(dependencies: OrchestratorDependencies): VoiceOrchestrator {
  if (!dependencies.store || !dependencies.provider || !dependencies.tools || !dependencies.budget) {
    throw new VoiceContractError('missing_dependency', 'voice orchestrator dependencies are incomplete');
  }
  return new VoiceOrchestrator(dependencies);
}

function authoritativeInputValues(input: VoiceTurnInput, state: DialogueState): Array<string | number | boolean> {
  const values: Array<string | number | boolean> = Object.values(state.facts)
    .filter((fact) => fact.status === 'active')
    .map((fact) => fact.value);
  values.push(input.utterance.text);
  for (const match of input.utterance.text.matchAll(/\b\d+(?:[.,]\d+)?\b/g)) {
    const parsed = Number(match[0].replace(',', '.'));
    if (Number.isFinite(parsed)) values.push(parsed);
  }
  return values;
}

function reconcileDeliveryEvidence(state: DialogueState, evidence: VoiceTurnInput['deliveryEvidence']): void {
  for (const item of evidence) {
    if (item.role !== 'assistant' || !item.delivery) continue;
    const prior = state.recentTurns.find((candidate) => candidate.role === 'assistant'
      && candidate.turnRevision === item.turnRevision && candidate.text === item.text);
    // Delivery evidence may move pending output to a terminal observation. It
    // may not rewrite one terminal outcome into another or select ambiguously.
    if (prior && (prior.delivery === 'pending' || prior.delivery == null)) prior.delivery = item.delivery;
  }
}
