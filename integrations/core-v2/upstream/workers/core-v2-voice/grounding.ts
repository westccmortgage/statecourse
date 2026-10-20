import type { PlannedClaim, SpeechAct, ToolReceipt } from './contracts.ts';

// "Today" is ordinary conversational language (for example, "How can I help
// you today?"). Current-information claims remain guarded by rate/APR/current
// and the other consequential terms below.
const RISKY_UNCLAIMED = /(?:\$|\d|%|\b(?:rate|apr|approved|qualified|eligible|current|transfer(?:red)?|submitted?|completed application|guarantee)\b)/i;

export type GroundingResult = {
  reply: string;
  grounded: boolean;
  validatedClaimIds: string[];
  refusedClaimIds: string[];
  approvedSourceIds: string[];
  requiresHumanReview: boolean;
  limitations: string[];
};

export function validateGroundedSpeech(
  speech: SpeechAct[],
  claims: PlannedClaim[],
  receipts: ToolReceipt[],
): GroundingResult {
  const byClaim = new Map(claims.map((claim) => [claim.claimId, claim]));
  const byReceipt = new Map(receipts.map((receipt) => [receipt.receiptId, receipt]));
  const validated = new Set<string>();
  const refused = new Set<string>();
  const sources = new Set<string>();
  let requiresHumanReview = false;

  for (const claim of claims) {
    if (!claim.claimId || validated.has(claim.claimId) || refused.has(claim.claimId)) {
      refused.add(claim.claimId || '(missing)');
      continue;
    }
    if (claim.risk === 'low_risk') {
      if (claim.value !== null || RISKY_UNCLAIMED.test(claim.text)) refused.add(claim.claimId);
      else validated.add(claim.claimId);
      continue;
    }
    const supporting = claim.receiptIds.map((id) => byReceipt.get(id)).filter((receipt): receipt is ToolReceipt => !!receipt);
    const completed = supporting.filter((receipt) => receipt.status === 'completed');
    const valueMatches = claim.value !== null && claim.factKeys.length > 0 && completed.some((receipt) =>
      claim.factKeys.some((key) => Object.hasOwn(receipt.facts, key)
        && sameValue(receipt.facts[key], claim.value!) && unitMatchesFactKey(key, claim.unit)));
    const sourceMatches = claim.approvedSourceIds.every((id) =>
      completed.some((receipt) => receipt.approvedSourceIds.includes(id)));
    const hasCurrentEvidence = claim.risk !== 'current_information'
      || completed.some((receipt) => receipt.currentAsOf !== null);
    const executable = claim.risk !== 'eligibility' && claim.risk !== 'external_action';
    if (!completed.length || !valueMatches || !sourceMatches || !hasCurrentEvidence || !executable) {
      refused.add(claim.claimId);
      continue;
    }
    validated.add(claim.claimId);
    if (claim.risk !== 'grounded_education') requiresHumanReview = true;
    for (const receipt of completed) for (const source of receipt.approvedSourceIds) sources.add(source);
  }

  const safeActs: SpeechAct[] = [];
  for (const act of speech) {
    const referenced = act.claimIds.map((id) => byClaim.get(id));
    const referencesExist = referenced.every(Boolean);
    const referencesPass = act.claimIds.every((id) => validated.has(id));
    const riskySpeechIsBound = !RISKY_UNCLAIMED.test(act.text)
      || riskySpeechCoveredByClaims(act.text, referenced.filter((claim): claim is PlannedClaim => !!claim), validated);
    if (referencesExist && referencesPass && riskySpeechIsBound) safeActs.push(act);
  }

  const limitations: string[] = [];
  if (refused.size) limitations.push('One or more proposed claims lacked an approved successful tool receipt and were withheld.');
  if (safeActs.length !== speech.length) limitations.push('Unsafe or ungrounded speech acts were withheld.');
  const reply = safeActs.map((act) => act.text.trim()).filter(Boolean).join(' ').trim();
  return {
    reply,
    grounded: refused.size === 0 && safeActs.length === speech.length,
    validatedClaimIds: [...validated].sort(),
    refusedClaimIds: [...refused].sort(),
    approvedSourceIds: [...sources].sort(),
    requiresHumanReview,
    limitations,
  };
}

function riskySpeechCoveredByClaims(text: string, claims: PlannedClaim[], validated: Set<string>): boolean {
  if (!claims.length || claims.some((claim) => !validated.has(claim.claimId))) return false;
  // Eligibility and external-action language is never made safe by attaching an
  // unrelated receipt. Those claim risks are deliberately non-executable.
  if (/\b(?:approved|qualified|eligible|transfer(?:red)?|submitted?|completed application|guarantee)\b/i.test(text)) {
    return false;
  }
  if (/\b(?:rate|apr|current)\b|%/i.test(text)
    && !claims.some((claim) => claim.risk === 'financial_quote' || claim.risk === 'current_information')) {
    return false;
  }
  const spokenNumbers = [...text.matchAll(/-?\d+(?:[.,]\d+)?/g)]
    .map((match) => Number(match[0].replace(',', '.')))
    .filter(Number.isFinite);
  if (spokenNumbers.some((spoken) => !claims.some((claim) => claimCoversSpokenNumber(claim, text, spoken)))) {
    return false;
  }
  // A dollar sign without a bound numeric value is not a grounded quotation.
  if (text.includes('$') && !spokenNumbers.length) return false;
  return true;
}

function claimCoversSpokenNumber(claim: PlannedClaim, speech: string, spoken: number): boolean {
  if (typeof claim.value !== 'number' || Math.abs(spoken - claim.value) >= 0.005) return false;
  const lowerSpeech = speech.toLowerCase();
  const unit = (claim.unit ?? '').toLowerCase();
  if (/\b(?:rate|apr|interest)\b|%/i.test(speech)
    && (!claim.factKeys.includes('annualRatePercent') || !/(?:%|percent)/.test(unit))) return false;
  if (/\b(?:monthly payment|payment)\b/i.test(speech)
    && (!claim.factKeys.includes('monthlyPrincipalAndInterest') || !/(?:\/month|monthly|per month)/.test(unit))) return false;
  const semanticTokens = claim.factKeys.flatMap((key) => factSemantics(key));
  return semanticTokens.some((token) => lowerSpeech.includes(token));
}

function unitMatchesFactKey(key: string, unit: string | null): boolean {
  const normalized = (unit ?? '').toLowerCase();
  const expected: Record<string, RegExp | null> = {
    principal: /^(?:usd|dollars?)$/,
    annualRatePercent: /^(?:%|percent)$/,
    termYears: /^years?$/,
    months: /^months?$/,
    monthlyPrincipalAndInterest: /^(?:usd\/month|usd per month|dollars?\/month|dollars? per month)$/,
    helocStructure: null,
    homeEquityLoanStructure: null,
    cashOutStructure: null,
  };
  if (!Object.hasOwn(expected, key)) return false;
  return expected[key] === null ? unit === null : expected[key]!.test(normalized);
}

function factSemantics(key: string): string[] {
  return {
    principal: ['principal'],
    annualRatePercent: ['rate', 'interest', 'apr'],
    termYears: ['term', 'year'],
    months: ['month', 'term'],
    monthlyPrincipalAndInterest: ['payment', 'monthly', 'principal', 'interest'],
  }[key] ?? [];
}

function sameValue(receipt: string | number | boolean, claim: string | number | boolean): boolean {
  if (typeof receipt === 'number' && typeof claim === 'number') return Math.abs(receipt - claim) < 0.005;
  return receipt === claim;
}
