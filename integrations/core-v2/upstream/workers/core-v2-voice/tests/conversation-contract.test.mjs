import assert from 'node:assert/strict';
import test from 'node:test';

import { InMemoryVoiceBudget } from '../budget.ts';
import { VOICE_TURN_PROTOCOL } from '../contracts.ts';
import { GroundedToolRegistry } from '../grounded-tools.ts';
import { VoiceOrchestrator } from '../orchestrator.ts';
import { FixtureVoiceProvider } from '../provider-text-adapter.ts';
import { InMemoryVoiceStateStore } from '../state-store.ts';

const authority = { callerApp: 'walletwccm-netlify', tenantId: 'westccmortgage' };
const callIdentity = 'CA0123456789abcdef0123456789abcdef';
let sequence = 0;

function input(text, revision = 0, overrides = {}) {
  sequence += 1;
  return {
    protocol: VOICE_TURN_PROTOCOL,
    requestId: `request-${sequence}`,
    callIdentity,
    turnId: `turn-${sequence}`,
    expectedStateRevision: revision,
    language: 'en',
    utterance: { text, final: true, sttConfidence: null },
    deliveryEvidence: [],
    ...overrides,
  };
}

function draft(text, options = {}) {
  return {
    disposition: options.disposition ?? 'answer',
    topic: options.topic ?? 'general',
    speech: [{ kind: options.kind ?? 'answer', text, claimIds: options.claimIds ?? [] }],
    optionalQuestion: options.optionalQuestion ?? null,
    factPatches: options.factPatches ?? [],
    toolRequests: options.toolRequests ?? [],
    claims: options.claims ?? [],
    requestedApplicationTransition: options.transition ?? 'none',
  };
}

function fact(key, value, scope = 'actual', expectedFactRevision = null) {
  return {
    operation: 'set', key, entity: 'borrower_scenario', value, unit: 'USD', scope,
    sourceTurnId: 'provider-proposal', expectedFactRevision, supersedesRevision: expectedFactRevision,
    derivedFrom: [],
  };
}

function harness(answersOrProvider) {
  const store = new InMemoryVoiceStateStore();
  const provider = Array.isArray(answersOrProvider) ? new FixtureVoiceProvider(answersOrProvider) : answersOrProvider;
  const orchestrator = new VoiceOrchestrator({
    store, provider, tools: new GroundedToolRegistry(), budget: new InMemoryVoiceBudget(),
  });
  return { store, provider, orchestrator };
}

test('first greeting asks for the caller goal without starting a purchase questionnaire', async () => {
  const { orchestrator, provider } = harness([]);
  const plan = await orchestrator.turn(authority, input('Hello'));
  assert.equal(plan.reply, 'How can I help you today?');
  assert.doesNotMatch(plan.reply, /purchase price|down payment/i);
  assert.equal(provider.calls.length, 0);
});

test('caller name is retained naturally while goal discovery remains first', async () => {
  const { orchestrator, provider, store } = harness([]);
  const plan = await orchestrator.turn(authority, input('My name is Jordan.'));
  assert.equal(plan.reply, 'Nice to meet you, Jordan. How can I help you today?');
  assert.equal(store.snapshot(authority, callIdentity).facts['caller.name'].value, 'Jordan');
  assert.equal(provider.calls.length, 0);
});

test('product fields are blocked until the caller goal is classified', async () => {
  const { orchestrator } = harness([
    draft('What is the purchase price?', { kind: 'question', optionalQuestion: 'What is the purchase price?', topic: 'purchase' }),
  ]);
  const plan = await orchestrator.turn(authority, input('I need some help.'));
  assert.equal(plan.reply, 'How can I help you today?');
  assert.equal(plan.topic, 'goal_discovery');
});

test('goal guard runs before tool execution and catches product-topic paraphrases', async () => {
  const { orchestrator, provider } = harness([
    draft('How much will the home cost?', {
      kind: 'question', optionalQuestion: 'How much will the home cost?', topic: 'purchase',
      toolRequests: [{ requestId: 'premature', tool: 'knowledge.heloc_basics', input: {} }],
    }),
  ]);
  const plan = await orchestrator.turn(authority, input('I need some advice.'));
  assert.equal(plan.reply, 'How can I help you today?');
  assert.equal(plan.toolReceipts.length, 0);
  assert.equal(provider.calls.length, 1, 'guard must prevent tool finalization');
});

test('goal guard blocks a provider-mislabeled standalone field question', async () => {
  const { orchestrator } = harness([
    draft('How much will the home cost?', {
      kind: 'question', optionalQuestion: 'How much will the home cost?', topic: 'general',
    }),
  ]);
  const plan = await orchestrator.turn(authority, input('I need some advice.'));
  assert.equal(plan.reply, 'How can I help you today?');
  assert.equal(plan.topic, 'goal_discovery');
});

test('goal guard rewrites a mixed answer plus field question before goal discovery', async () => {
  const mixed = draft('unused', { topic: 'general' });
  mixed.speech = [
    { kind: 'answer', text: 'I can help with that.', claimIds: [] },
    { kind: 'question', text: 'How much will the home cost?', claimIds: [] },
  ];
  mixed.optionalQuestion = 'How much will the home cost?';
  const { orchestrator } = harness([mixed]);
  const plan = await orchestrator.turn(authority, input('I need some advice.'));
  assert.match(plan.reply, /I can help with that/);
  assert.match(plan.reply, /How can I help you today/);
  assert.doesNotMatch(plan.reply, /home cost/i);
});

test('Spanish name and refinance goal are retained before product-specific questions', async () => {
  const { orchestrator, store } = harness([
    draft('Gracias, Elena. ¿Qué le gustaría saber?', { topic: 'refinance' }),
  ]);
  await orchestrator.turn(authority, input('Me llamo Elena y quiero refinanciar mi hipoteca.', 0, { language: 'es' }));
  const state = store.snapshot(authority, callIdentity);
  assert.equal(state.facts['caller.name'].value, 'Elena');
  assert.equal(state.facts['caller.goal'].value, 'refinance');
});

test('name-only goal discovery responds in the selected language', async () => {
  const { orchestrator } = harness([]);
  const plan = await orchestrator.turn(authority, input('Me llamo Elena.', 0, { language: 'es' }));
  assert.equal(plan.reply, 'Mucho gusto, Elena. ¿Cómo puedo ayudarle hoy?');
});

test('delivery evidence makes an interrupted assistant turn authoritative in memory', async () => {
  const { orchestrator, store } = harness([draft('What would you like help with?', { kind: 'question' })]);
  const first = await orchestrator.turn(authority, input('Hello'));
  await orchestrator.turn(authority, input('I need some advice.', 1, {
    deliveryEvidence: [{ role: 'assistant', text: first.reply, turnRevision: 1, delivery: 'interrupted' }],
  }));
  const firstAssistant = store.snapshot(authority, callIdentity).recentTurns
    .find((turn) => turn.role === 'assistant' && turn.text === first.reply);
  assert.equal(firstAssistant.delivery, 'interrupted');
});

test('delivery evidence uses the exact revision when assistant text repeats', async () => {
  const { orchestrator, store } = harness([
    draft('Okay.', { topic: 'purchase' }),
    draft('Okay.', { topic: 'purchase' }),
    draft('I am listening.', { topic: 'purchase' }),
  ]);
  await orchestrator.turn(authority, input('I want to buy a home.'));
  await orchestrator.turn(authority, input('Tell me more.', 1));
  await orchestrator.turn(authority, input('I interrupted the first okay.', 2, {
    deliveryEvidence: [{ role: 'assistant', text: 'Okay.', turnRevision: 1, delivery: 'interrupted' }],
  }));
  const repeated = store.snapshot(authority, callIdentity).recentTurns
    .filter((turn) => turn.role === 'assistant' && turn.text === 'Okay.');
  assert.equal(repeated[0].delivery, 'interrupted');
  assert.equal(repeated[1].delivery, 'pending');
});

test('volunteered name and purchase goal persist without being re-asked after interruption', async () => {
  const { orchestrator, store } = harness([
    draft('Thanks, Taylor. What would you like to know about buying a home?', { topic: 'purchase' }),
    draft('We can continue with your purchase questions.', { topic: 'purchase' }),
  ]);
  const first = await orchestrator.turn(authority, input("My name is Taylor and I'm looking to buy a home."));
  assert.equal(first.topic, 'purchase');
  let state = store.snapshot(authority, callIdentity);
  assert.equal(state.facts['caller.name'].value, 'Taylor');
  assert.equal(state.facts['caller.goal'].value, 'purchase');

  const second = await orchestrator.turn(authority, input('Sorry, I interrupted you.', 1, {
    deliveryEvidence: [{ role: 'assistant', text: first.reply, turnRevision: 1, delivery: 'interrupted' }],
  }));
  assert.equal(second.topic, 'purchase');
  state = store.snapshot(authority, callIdentity);
  assert.equal(state.facts['caller.name'].value, 'Taylor');
  assert.equal(state.facts['caller.goal'].value, 'purchase');
});

test('off-topic question is answered directly without forcing an application', async () => {
  const { orchestrator } = harness([draft('Paris is the capital of France. What else would you like to ask?')]);
  const plan = await orchestrator.turn(authority, input('What is the capital of France?'));
  assert.match(plan.reply, /Paris/);
  assert.equal(plan.applicationTransition, 'none');
  assert.equal(plan.requiresHumanReview, false);
});

test('HELOC detour does not overwrite an existing mortgage fact', async () => {
  const first = input('The purchase price is 500000');
  const { orchestrator, store } = harness([
    draft('Got it.', { topic: 'purchase', factPatches: [fact('purchase_price', 500000)], optionalQuestion: 'What would you like to ask?' }),
    draft('We can compare a HELOC with a cash-out refinance based on your goals.', { topic: 'home_equity' }),
  ]);
  await orchestrator.turn(authority, first);
  await orchestrator.turn(authority, input('Tell me about a HELOC instead.', 1));
  const state = store.snapshot(authority, callIdentity);
  assert.equal(state.facts.purchase_price.value, 500000);
  assert.equal(state.topic, 'home_equity');
});

test('correction supersedes the prior fact revision', async () => {
  const { orchestrator, store } = harness([
    draft('Got it.', { factPatches: [fact('purchase_price', 500000)] }),
    draft('I updated that.', { factPatches: [fact('purchase_price', 600000, 'actual', 1)] }),
  ]);
  await orchestrator.turn(authority, input('The price is 500000'));
  await orchestrator.turn(authority, input('Actually the price is 600000', 1));
  const saved = store.snapshot(authority, callIdentity).facts.purchase_price;
  assert.equal(saved.value, 600000);
  assert.equal(saved.supersedesRevision, 1);
});

test('hypothetical scenario remains separate from actual facts', async () => {
  const { orchestrator, store } = harness([
    draft('We can explore that scenario.', { factPatches: [fact('scenario_price', 700000, 'hypothetical')] }),
  ]);
  await orchestrator.turn(authority, input('What if the price were 700000?'));
  const state = store.snapshot(authority, callIdentity);
  assert.equal(state.facts.scenario_price.scope, 'hypothetical');
});

test('compound out-of-order caller facts can be captured without inventing values', async () => {
  const { orchestrator, store } = harness([
    draft('I captured both details.', { factPatches: [fact('down_payment', 100000), fact('purchase_price', 500000)] }),
  ]);
  await orchestrator.turn(authority, input('Down payment 100000 and purchase price 500000'));
  const state = store.snapshot(authority, callIdentity);
  assert.equal(state.facts.down_payment.value, 100000);
  assert.equal(state.facts.purchase_price.value, 500000);
});

test('ambiguous consequential STT value is clarified without a fact mutation', async () => {
  const { orchestrator, store } = harness([
    draft('Did you mean fifteen thousand or fifty thousand?', { disposition: 'clarify', kind: 'question' }),
  ]);
  const plan = await orchestrator.turn(authority, input('The down payment is fifteen or fifty thousand'));
  assert.equal(plan.disposition, 'clarify');
  assert.deepEqual(store.snapshot(authority, callIdentity).facts, {});
});

test('duplicate final is idempotent and does not call the provider twice', async () => {
  const turn = input('Can we talk about my goals?');
  const { orchestrator, provider } = harness([draft('Yes. What matters most to you?')]);
  const first = await orchestrator.turn(authority, turn);
  const repeated = await orchestrator.turn(authority, turn);
  assert.deepEqual(repeated, first);
  assert.equal(provider.calls.length, 1);
});

test('same-horizon option math is spoken only from exact deterministic receipts', async () => {
  class ToolAwareProvider {
    maximumCostUsd = 0;
    pricingSnapshot = { providerId: 'fixture', model: 'fixture', currency: 'USD', effectiveFrom: '1970-01-01',
      inputPerMillionTokens: 0, outputPerMillionTokens: 0, cachedInputPerMillionTokens: 0,
      cacheWritePerMillionTokens: 0, reasoningPerMillionTokens: 0, maximumInputTokens: 0,
      maximumOutputTokens: 0, maximumReasoningTokens: 0, ceilingRule: 'fixture' };
    calls = [];
    async generate(context) {
      this.calls.push(context);
      if (context.phase === 'propose') return { outcome: 'completed', settledUsd: 0, usage: {}, normalizedUsage: {}, draft: draft('I will compare those inputs.', {
        toolRequests: [
          { requestId: 'heloc-payment', tool: 'mortgage.payment', input: { principal: 100000, annualRatePercent: 8, termYears: 10 } },
          { requestId: 'cashout-payment', tool: 'mortgage.payment', input: { principal: 500000, annualRatePercent: 6.5, termYears: 30 } },
        ],
      }) };
      const [heloc, cashout] = context.receipts;
      const h = heloc.facts.monthlyPrincipalAndInterest;
      const c = cashout.facts.monthlyPrincipalAndInterest;
      return { outcome: 'completed', settledUsd: 0, usage: {}, normalizedUsage: {}, draft: draft(
        `Using only those inputs, the first payment is ${h} dollars and the second is ${c} dollars. A broker should review fees and suitability.`,
        {
          claimIds: ['heloc_payment', 'cashout_payment'],
          claims: [
            { claimId: 'heloc_payment', risk: 'financial_quote', text: 'HELOC payment', value: h, unit: 'USD/month', receiptIds: [heloc.receiptId], factKeys: ['monthlyPrincipalAndInterest'], approvedSourceIds: [] },
            { claimId: 'cashout_payment', risk: 'financial_quote', text: 'cash-out payment', value: c, unit: 'USD/month', receiptIds: [cashout.receiptId], factKeys: ['monthlyPrincipalAndInterest'], approvedSourceIds: [] },
          ],
        },
      ) };
    }
  }
  const provider = new ToolAwareProvider();
  const { orchestrator } = harness(provider);
  const plan = await orchestrator.turn(authority, input('Compare HELOC 100000 at 8 for 10 years with cashout 500000 at 6.5 for 30 years'));
  assert.equal(plan.grounding.grounded, true);
  assert.equal(plan.toolReceipts.length, 2);
  assert.equal(plan.requiresHumanReview, true);
});

test('current rate, approval, transfer, weather, and action claims fail closed without tools', async () => {
  const risky = draft('You are approved today and I submitted the transfer.', {
    claimIds: ['approval'],
    claims: [{ claimId: 'approval', risk: 'eligibility', text: 'approved today', value: true, unit: null, receiptIds: [], factKeys: [], approvedSourceIds: [] }],
  });
  const { orchestrator } = harness([risky]);
  const plan = await orchestrator.turn(authority, input('Am I approved, and can you transfer the application?'));
  assert.equal(plan.disposition, 'refuse');
  assert.doesNotMatch(plan.reply, /approved|submitted|transfer/i);
  assert.deepEqual(plan.grounding.refusedClaimIds, ['approval']);
});

test('memory survives a detour and application continues only with explicit caller consent', async () => {
  const { orchestrator, provider, store } = harness([
    draft('Got it.', { factPatches: [fact('purchase_price', 500000)] }),
    draft('Paris is the capital of France.'),
    draft('We can continue the application.', { transition: 'continue' }),
  ]);
  await orchestrator.turn(authority, input('The purchase price is 500000'));
  await orchestrator.turn(authority, input('What is the capital of France?', 1));
  const final = await orchestrator.turn(authority, input('Continue with my application.', 2));
  assert.equal(final.applicationTransition, 'continue');
  assert.equal(store.snapshot(authority, callIdentity).facts.purchase_price.value, 500000);
  assert.equal(provider.calls[1].state.facts.purchase_price.value, 500000);
});
