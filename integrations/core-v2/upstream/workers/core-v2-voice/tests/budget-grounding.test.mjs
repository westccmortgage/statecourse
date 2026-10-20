import assert from 'node:assert/strict';
import test from 'node:test';

import { InMemoryVoiceBudget } from '../budget.ts';
import { validateDraftShape } from '../contracts.ts';
import { validateGroundedSpeech } from '../grounding.ts';
import { GroundedToolRegistry } from '../grounded-tools.ts';

const PRICING = { providerId: 'fixture', model: 'fixture', currency: 'USD', effectiveFrom: '1970-01-01',
  inputPerMillionTokens: 0, outputPerMillionTokens: 0, cachedInputPerMillionTokens: 0,
  cacheWritePerMillionTokens: 0, reasoningPerMillionTokens: 0, maximumInputTokens: 0,
  maximumOutputTokens: 0, maximumReasoningTokens: 0, ceilingRule: 'fixture' };

test('default local budget refuses every positive-cost provider call', async () => {
  const budget = new InMemoryVoiceBudget();
  await assert.rejects(budget.reserve('session', 'request', 'claim', 0.000001, PRICING), /does not authorize/);
  const free = await budget.reserve('session', 'fixture', 'claim', 0, PRICING);
  await budget.settle(free.reservationId, 0, { raw: {}, normalized: {} });
});

test('two provider phases cannot exceed the cumulative per-turn maximum', async () => {
  const budget = new InMemoryVoiceBudget({ currency: 'USD', authorizedMaximumUsd: 1, maximumPerTurnUsd: 0.1,
    maximumProviderCallsPerTurn: 2, maximumProviderCallsPerCall: 120,
    maximumTurnsPerCall: 60, maximumInputTokensPerTurn: 8000,
    maximumOutputTokensPerTurn: 400, maximumInputTokensPerCall: 480000,
    maximumOutputTokensPerCall: 24000, maximumReasoningTokensPerCall: 24000,
    wallClockDeadlineMs: 1000 });
  await budget.reserve('session', 'request', 'claim', 0.08, PRICING, 'propose');
  await assert.rejects(budget.reserve('session', 'request', 'claim', 0.08, PRICING, 'finalize'),
    (error) => error.code === 'budget_not_authorized');
});

test('whole-call provider and token ceilings reserve worst-case capacity before submission', async () => {
  const budget = new InMemoryVoiceBudget({
    currency: 'USD', authorizedMaximumUsd: 1, maximumPerTurnUsd: 1,
    maximumProviderCallsPerTurn: 2, maximumProviderCallsPerCall: 2,
    maximumTurnsPerCall: 2, maximumInputTokensPerTurn: 4,
    maximumOutputTokensPerTurn: 2, maximumInputTokensPerCall: 8,
    maximumOutputTokensPerCall: 4, maximumReasoningTokensPerCall: 3,
    wallClockDeadlineMs: 1000,
  });
  const priced = { ...PRICING, maximumInputTokens: 4, maximumOutputTokens: 2, maximumReasoningTokens: 2 };
  await budget.reserve('session', 'request-1', 'claim', 0.01, priced);
  await assert.rejects(
    budget.reserve('session', 'request-2', 'claim', 0.01, priced),
    (error) => error.code === 'budget_not_authorized',
    'reasoning capacity must bind even while provider output includes reasoning',
  );
  await budget.release([...budget.reservations.keys()][0], 'known pre-submission failure');
  await budget.reserve('session', 'request-2', 'claim', 0.01, priced);
});

test('tool inputs must come from caller-reported or committed facts', () => {
  const tools = new GroundedToolRegistry();
  const refused = tools.execute({
    requestId: 'tool-1', tool: 'mortgage.payment',
    input: { principal: 500000, annualRatePercent: 6.5, termYears: 30 },
  }, [500000, 30]);
  assert.equal(refused.status, 'refused');
  const accepted = tools.execute({
    requestId: 'tool-2', tool: 'mortgage.payment',
    input: { principal: 500000, annualRatePercent: 6.5, termYears: 30 },
  }, [500000, 6.5, 30]);
  assert.equal(accepted.status, 'completed');
  assert.equal(typeof accepted.facts.monthlyPrincipalAndInterest, 'number');
});

test('model self-report cannot ground a quote without an exact successful receipt', () => {
  const result = validateGroundedSpeech(
    [{ kind: 'answer', text: 'Your payment would be 3,160 dollars.', claimIds: ['payment'] }],
    [{ claimId: 'payment', risk: 'financial_quote', text: 'payment', value: 3160, unit: 'USD/month', receiptIds: [], factKeys: ['monthlyPrincipalAndInterest'], approvedSourceIds: [] }],
    [],
  );
  assert.equal(result.grounded, false);
  assert.equal(result.reply, '');
  assert.deepEqual(result.refusedClaimIds, ['payment']);
});

test('a valid unrelated claim cannot smuggle approval, rate, or external-action speech', () => {
  const receipt = {
    receiptId: 'receipt-principal', requestId: 'principal', tool: 'mortgage.payment', version: '1',
    inputDigest: 'digest', status: 'completed', facts: { principal: 100000 },
    approvedSourceIds: [], currentAsOf: null, limitations: [],
  };
  const claims = [{
    claimId: 'principal', risk: 'financial_quote', text: 'principal amount', value: 100000,
    unit: 'USD', receiptIds: [receipt.receiptId], factKeys: ['principal'], approvedSourceIds: [],
  }];
  const result = validateGroundedSpeech([{
    kind: 'answer',
    text: 'You are approved at 2 percent and I transferred the application.',
    claimIds: ['principal'],
  }], claims, [receipt]);
  assert.equal(result.grounded, false);
  assert.equal(result.reply, '');
});

test('a principal receipt cannot be relabeled as a monthly payment or interest rate', () => {
  const receipt = {
    receiptId: 'receipt-principal', requestId: 'principal', tool: 'mortgage.payment', version: '1',
    inputDigest: 'digest', status: 'completed', facts: { principal: 500000 },
    approvedSourceIds: [], currentAsOf: null, limitations: [],
  };
  const claims = [{
    claimId: 'principal', risk: 'financial_quote', text: 'principal amount', value: 500000,
    unit: 'USD', receiptIds: [receipt.receiptId], factKeys: ['principal'], approvedSourceIds: [],
  }];
  for (const text of ['Your monthly payment is 500000 dollars.', 'Your interest rate is 500000%.']) {
    const result = validateGroundedSpeech([{ kind: 'answer', text, claimIds: ['principal'] }], claims, [receipt]);
    assert.equal(result.grounded, false, text);
    assert.equal(result.reply, '', text);
  }
});

test('provider claim metadata cannot relabel a trusted principal receipt fact', () => {
  const receipt = {
    receiptId: 'receipt-principal', requestId: 'principal', tool: 'mortgage.payment', version: '1',
    inputDigest: 'digest', status: 'completed', facts: { principal: 500000 },
    approvedSourceIds: [], currentAsOf: null, limitations: [],
  };
  for (const claim of [
    { claimId: 'fake-payment', risk: 'financial_quote', text: 'monthly payment', value: 500000, unit: 'USD/month', receiptIds: [receipt.receiptId], factKeys: ['principal'], approvedSourceIds: [] },
    { claimId: 'fake-rate', risk: 'financial_quote', text: 'interest rate', value: 500000, unit: 'percent', receiptIds: [receipt.receiptId], factKeys: ['principal'], approvedSourceIds: [] },
  ]) {
    const text = claim.claimId === 'fake-rate' ? 'Your interest rate is 500000%.' : 'Your monthly payment is 500000 dollars.';
    const result = validateGroundedSpeech([{ kind: 'answer', text, claimIds: [claim.claimId] }], [claim], [receipt]);
    assert.equal(result.grounded, false, text);
    assert.equal(result.reply, '', text);
  }
});

test('one scalar claim cannot borrow semantics from a second receipt fact key', () => {
  const receipt = {
    receiptId: 'receipt-mixed', requestId: 'mixed', tool: 'mortgage.payment', version: '1',
    inputDigest: 'digest', status: 'completed', facts: { principal: 500000, termYears: 30 },
    approvedSourceIds: [], currentAsOf: null, limitations: [],
  };
  const claim = {
    claimId: 'mixed', risk: 'financial_quote', text: 'term', value: 500000, unit: 'USD',
    receiptIds: [receipt.receiptId], factKeys: ['principal', 'termYears'], approvedSourceIds: [],
  };
  assert.throws(() => validateDraftShape({
    disposition: 'answer', topic: 'general',
    speech: [{ kind: 'answer', text: 'Your term is 500000.', claimIds: ['mixed'] }],
    optionalQuestion: null, factPatches: [], toolRequests: [], claims: [claim],
    requestedApplicationTransition: 'none',
  }), /claim 0 is invalid/);
});
