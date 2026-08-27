/**
 * Texas qualifying-education provider — financial readiness calculator.
 *
 * WHAT THIS IS FOR. TREC's provider rule states prima facie financial ratios a qualifying education
 * provider applicant is expected to meet. This computes them from a draft balance sheet so that the
 * answer is known before an accountant is paid and before an application is filed, and so that a
 * shortfall is a number rather than a surprise.
 *
 * WHAT THIS IS NOT. It is INTERNAL PLANNING EVIDENCE. It is not a financial statement, it does not
 * replace the GAAP income statement and balance sheet the application requires, and passing it is
 * not evidence of anything to TREC. Nothing it produces may be filed.
 *
 * WHERE THE THRESHOLDS COME FROM, STATED HONESTLY. The five ratios and their limits are taken from
 * the Texas work order of 2026-08-27, which states them as the current rule's prima facie ratios.
 * THIS PROJECT HAS NOT READ THE RULE. 22 TAC could not be opened from this environment — see
 * config/texas/regulatory-manifest.mjs, source sos-tac-22-535 — so each threshold below carries
 * `verified: false` and the calculator reports its own thresholds as unverified in every result it
 * returns. When the rule is read, the thresholds are confirmed against it and the flag flips; they
 * are not to be relied on before that.
 */

/* Ratio direction: "min" means the value must not fall below the limit, "max" means it must not exceed it. */
export const RATIOS = Object.freeze([
  Object.freeze({ id: "current", label: "Current ratio", direction: "min", limit: 1.75, verified: false }),
  Object.freeze({ id: "quick", label: "Quick ratio", direction: "min", limit: 1.6, verified: false }),
  Object.freeze({ id: "cash", label: "Cash ratio", direction: "min", limit: 1.4, verified: false }),
  Object.freeze({ id: "debt", label: "Debt ratio", direction: "max", limit: 0.4, verified: false }),
  Object.freeze({ id: "debtToEquity", label: "Debt-to-equity ratio", direction: "max", limit: 0.6, verified: false }),
]);

const round = (value) => Math.round(value * 1000) / 1000;

/**
 * @param {object} sheet
 * @param {number} sheet.cashAndEquivalents  cash, bank balances and equivalents
 * @param {number} [sheet.marketableSecurities=0]
 * @param {number} [sheet.receivables=0]
 * @param {number} [sheet.otherCurrentAssets=0]  inventory, prepaid and the rest
 * @param {number} sheet.totalAssets
 * @param {number} sheet.currentLiabilities
 * @param {number} sheet.totalLiabilities
 * @param {number} sheet.equity
 */
export function financialReadiness(sheet) {
  const {
    cashAndEquivalents,
    marketableSecurities = 0,
    receivables = 0,
    otherCurrentAssets = 0,
    totalAssets,
    currentLiabilities,
    totalLiabilities,
    equity,
  } = sheet;

  for (const [name, value] of Object.entries({ cashAndEquivalents, totalAssets, currentLiabilities, totalLiabilities, equity })) {
    if (typeof value !== "number" || Number.isNaN(value)) throw new TypeError(`financialReadiness: ${name} must be a number`);
  }

  const currentAssets = cashAndEquivalents + marketableSecurities + receivables + otherCurrentAssets;
  const quickAssets = cashAndEquivalents + marketableSecurities + receivables;
  const cashAssets = cashAndEquivalents + marketableSecurities;

  /* A provider with no current liabilities divides by zero. That is not "infinitely healthy" and it
     is not a pass — it is a balance sheet the ratios do not describe, and it is reported as such. */
  const ratio = (numerator, denominator) => (denominator === 0 ? null : round(numerator / denominator));

  const values = {
    current: ratio(currentAssets, currentLiabilities),
    quick: ratio(quickAssets, currentLiabilities),
    cash: ratio(cashAssets, currentLiabilities),
    debt: ratio(totalLiabilities, totalAssets),
    debtToEquity: ratio(totalLiabilities, equity),
  };

  const results = RATIOS.map((spec) => {
    const value = values[spec.id];
    const meets = value === null ? null : spec.direction === "min" ? value >= spec.limit : value <= spec.limit;
    return Object.freeze({
      ...spec,
      value,
      meets,
      shortfall:
        value === null || meets ? null : spec.direction === "min" ? round(spec.limit - value) : round(value - spec.limit),
      note: value === null ? "not computable — the denominator is zero" : null,
    });
  });

  const failing = results.filter((entry) => entry.meets === false);
  const uncomputable = results.filter((entry) => entry.meets === null);

  return Object.freeze({
    /* PLANNING_ONLY on every result, always. There is no code path that returns "READY". */
    disposition: "PLANNING_ONLY",
    thresholdsVerifiedAgainstRule: RATIOS.every((spec) => spec.verified),
    thresholdSource:
      "Texas work order 2026-08-27, stated as the current rule's prima facie ratios. NOT READ IN THE RULE — 22 TAC is unreachable from this environment.",
    currentAssets,
    quickAssets,
    cashAssets,
    ratios: Object.freeze(results),
    meetsAllStatedThresholds: failing.length === 0 && uncomputable.length === 0,
    failing: Object.freeze(failing.map((entry) => entry.id)),
    uncomputable: Object.freeze(uncomputable.map((entry) => entry.id)),
    caveat:
      "Internal planning evidence only. Does not replace the GAAP income statement, GAAP balance sheet, operating budget, enrollment market survey, bank evidence, reserve evidence or surety bond the application requires, and must not be filed.",
  });
}

export default financialReadiness;
