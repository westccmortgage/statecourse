/**
 * CA-BLOCK rollout — delivery-layer retrieval banks for Mortgage assignments 2–15.
 *
 * Hand-authored after reading each frozen lesson: one primary and one replacement item per
 * substantive block (B1–B6), every proposition traceable to the lesson text, correct answer at
 * index 0 per project convention (permuted at serve). `concept` ties primary to replacement: an
 * incorrect primary routes to `remediationScreen` — an instruction screen of the same block that
 * teaches the missed proposition — and then serves the DIFFERENT replacement question on the same
 * concept, never the same question again. Formative delivery-layer items only: not DRE
 * instruments, not drawn from and never feeding the final-exam bank, and never gating anything
 * regulatory. Assignment 1's bank remains in the pilot file (mortgage-a1-blocks.mjs).
 */

export const MORTGAGE_RETRIEVAL_BANKS = Object.freeze({

  /* ── Assignment 2 — Money, interest, notes, and loan mathematics ─────────────────────── */

  "a2-b1-q1": {
    blockId: "a2-b1", concept: "interest-fundamentals", role: "primary",
    replacementId: "a2-b1-q2", remediationScreen: "a2-b1-s3",
    prompt: "A borrower closes on March 20 and asks why his first payment is due May 1 rather than April 1. What is the correct explanation?",
    choices: [
      "Mortgage interest is paid in arrears — interest for the rest of March was collected at closing, April's interest accrues during April, and the May 1 payment covers it.",
      "Lenders give every borrower a complimentary first month with no interest.",
      "The servicer needs a month to set up the account, so the first payment is waived.",
      "Interest is paid in advance, so the April payment was folded into the loan amount.",
    ],
    correctChoice: 0,
    rationale: "Residential mortgage interest is generally paid in arrears: a payment covers interest that has already accrued. Per diem interest through month end is collected at closing, the next full month accrues, and the payment after that covers it — the same principle that makes a payoff exceed the last statement balance.",
  },
  "a2-b1-q2": {
    blockId: "a2-b1", concept: "interest-fundamentals", role: "replacement",
    replacementId: null, remediationScreen: "a2-b1-s1",
    prompt: "A $320,000 loan produced $20,800 of interest in one year. Which computation finds the rate, and what is it?",
    choices: [
      "R = I ÷ (P × T): 20,800 ÷ 320,000 = 6.5%.",
      "R = P ÷ (I × T): 320,000 ÷ 20,800 = 15.4%.",
      "R = I × P: the rate cannot be found without the payment amount.",
      "R = (P − I) ÷ P = 93.5%.",
    ],
    correctChoice: 0,
    rationale: "Simple interest is I = P × R × T, solvable in all four directions. For the rate: R = I ÷ (P × T) = 20,800 ÷ (320,000 × 1) = 6.5%. No payment figure is needed — the formula manipulates principal, rate, and time only.",
  },
  "a2-b2-q1": {
    blockId: "a2-b2", concept: "amortization-pattern", role: "primary",
    replacementId: "a2-b2-q2", remediationScreen: "a2-b2-s1",
    prompt: "After five years of on-time payments on a 30-year amortized loan, a borrower is startled that his balance has barely moved. What explains it?",
    choices: [
      "Early payments are almost entirely interest — the principal portion grows each month while the interest portion shrinks, so meaningful principal reduction comes later in the term.",
      "The servicer has been misapplying his payments and an audit is required.",
      "Amortized loans retire no principal in the first ten years by design.",
      "His rate must have adjusted upward without notice.",
    ],
    correctChoice: 0,
    rationale: "Each payment covers accrued interest first; the remainder reduces principal. On a $400,000 loan at 6%, sixty payments totaling roughly $143,900 reduce the balance by only about $27,800 — the normal pattern, which also explains payoff surprises and the outsized effect of small early prepayments.",
  },
  "a2-b2-q2": {
    blockId: "a2-b2", concept: "amortization-pattern", role: "replacement",
    replacementId: null, remediationScreen: "a2-b2-s2",
    prompt: "On a loan with negative amortization, what happens to the balance while the borrower makes every scheduled payment?",
    choices: [
      "It grows — the payment does not cover accrued interest, the shortfall is added to principal, and a recast can later produce a large, sudden payment increase.",
      "It falls, only more slowly than on a fully amortized loan.",
      "It stays exactly level until the final payment.",
      "It falls whenever the index falls, because negative amortization only exists on adjustable loans.",
    ],
    correctChoice: 0,
    rationale: "Where the scheduled payment is less than accrued interest, the shortfall is added to the balance: the borrower is paying and losing ground. A recast — when the loan must begin fully amortizing the enlarged balance over the remaining term — can raise the payment sharply and suddenly, which is why the mechanism must be presented in plain terms.",
  },
  "a2-b3-q1": {
    blockId: "a2-b3", concept: "note-provisions", role: "primary",
    replacementId: "a2-b3-q2", remediationScreen: "a2-b3-s2",
    prompt: "One borrower misses three payments; another sells his property with the loan in place. Which note provisions respond, respectively?",
    choices: [
      "Acceleration responds to the default; alienation (due-on-sale) responds to the transfer — they are different clauses answering different events.",
      "Alienation responds to the default; acceleration responds to the transfer.",
      "Both events trigger the same acceleration clause.",
      "Neither — a lender may always call a loan due at its discretion.",
    ],
    correctChoice: 0,
    rationale: "Acceleration responds to default and makes the entire balance due — foreclosure depends on it. Alienation permits the lender to call the loan on transfer — why loans are generally not assumable without consent. 'A lender can always call the loan' is wrong: the lender's rights come from the clauses actually in the instrument.",
  },
  "a2-b3-q2": {
    blockId: "a2-b3", concept: "note-provisions", role: "replacement",
    replacementId: null, remediationScreen: "a2-b3-s3",
    prompt: "At an adjustable-rate loan's adjustment date, what determines the new rate?",
    choices: [
      "The index plus the margin, subject to the periodic and lifetime caps — not the lender's discretion and not the borrower's credit at that time.",
      "The lender's assessment of current market conditions.",
      "The borrower's credit score on the adjustment date.",
      "The original note rate plus one percent per year elapsed.",
    ],
    correctChoice: 0,
    rationale: "Four terms determine every adjustment: the index (the published measure), the margin (fixed at origination), the adjustment frequency, and the caps. The rate is index plus margin within the caps — a licensee who cannot explain a borrower's own index, margin, and caps should not be presenting the product.",
  },
  "a2-b4-q1": {
    blockId: "a2-b4", concept: "cost-of-credit", role: "primary",
    replacementId: "a2-b4-q2", remediationScreen: "a2-b4-s1",
    prompt: "A buyer purchases a $500,000 home with a $400,000 loan and agrees to pay 2 discount points. What do the points cost?",
    choices: [
      "$8,000 — one point is one percent of the LOAN amount, so 400,000 × 0.02.",
      "$10,000 — one point is one percent of the purchase price, so 500,000 × 0.02.",
      "$2,000 — points are computed on the down payment.",
      "$4,000 — two points means two thousand dollars per hundred thousand of price.",
    ],
    correctChoice: 0,
    rationale: "One point equals one percent of the loan amount — not of the purchase price. 400,000 × 0.02 = $8,000. Applying a rate to the wrong base is the first of the lesson's recurring calculation errors, and the price-based figure is exactly that error.",
  },
  "a2-b4-q2": {
    blockId: "a2-b4", concept: "cost-of-credit", role: "replacement",
    replacementId: null, remediationScreen: "a2-b4-s2",
    prompt: "Which statement about the annual percentage rate is correct?",
    choices: [
      "It expresses the cost of credit as a yearly rate including certain finance charges beyond interest, exists to make offers comparable — and is not the note rate; the payment is computed from the note rate.",
      "It is the rate the monthly payment is computed from.",
      "It includes every cost the borrower will pay at closing.",
      "It is the most accurate comparison for a borrower who will refinance in five years.",
    ],
    correctChoice: 0,
    rationale: "The APR captures costs the note rate omits so two loans with the same rate and different fees do not appear identical — but it is not the note rate, its contents are defined rather than exhaustive, it assumes the loan runs its full term, and it behaves oddly on adjustable loans. The payment always comes from the note rate.",
  },
  "a2-b5-q1": {
    blockId: "a2-b5", concept: "ltv-cltv", role: "primary",
    replacementId: "a2-b5-q2", remediationScreen: "a2-b5-s1",
    prompt: "A buyer contracts at $920,000 planning an 80% loan. The appraisal comes in at $900,000. What is the largest loan the 80% program now supports?",
    choices: [
      "$720,000 — lenders lend against the lower of appraised value and purchase price, so 900,000 × 0.80.",
      "$736,000 — the purchase price controls because the parties agreed to it.",
      "$728,000 — the lender splits the difference between price and appraisal.",
      "Whatever amount the borrower qualifies for on income — value no longer matters once the contract is signed.",
    ],
    correctChoice: 0,
    rationale: "LTV divides the loan by the LOWER of appraised value and purchase price: 900,000 × 0.80 = $720,000 — $16,000 less than planned. The borrower's options are to bring more funds, renegotiate, or cancel under a contingency; nothing adjusts automatically, and no one is entitled to a second appraisal as of right.",
  },
  "a2-b5-q2": {
    blockId: "a2-b5", concept: "ltv-cltv", role: "replacement",
    replacementId: null, remediationScreen: "a2-b5-s2",
    prompt: "A property is worth $920,000 with a $736,000 first loan and a $100,000 home equity line, of which the borrower has drawn only $10,000. For combined loan-to-value, what generally counts for the line?",
    choices: [
      "The full $100,000 line amount — CLTV counts total secured debt, and for a line that is generally the full amount rather than the drawn balance.",
      "Only the $10,000 actually drawn.",
      "Nothing, because a line of credit is unsecured.",
      "Half the line amount, by convention.",
    ],
    correctChoice: 0,
    rationale: "CLTV = total secured debt ÷ value, and for a home equity line the full line amount rather than the drawn balance is generally what counts — which surprises borrowers who have drawn little. Here: (736,000 + 100,000) ÷ 920,000 ≈ 91%.",
  },
  "a2-b6-q1": {
    blockId: "a2-b6", concept: "payment-yield", role: "primary",
    replacementId: "a2-b6-q2", remediationScreen: "a2-b6-s1",
    prompt: "Using a payment factor of 5.9955 per $1,000 at 6% for 30 years, what is the monthly principal-and-interest payment on a $450,000 loan?",
    choices: [
      "$2,698 — divide the loan by 1,000 first, then multiply: 450 × 5.9955.",
      "$26,980 — multiply the loan by the factor directly.",
      "$2,250 — half a percent of the loan amount per month.",
      "$5,996 — the factor times 1,000.",
    ],
    correctChoice: 0,
    rationale: "Payment = (loan ÷ 1,000) × factor: 450,000 ÷ 1,000 = 450; 450 × 5.9955 ≈ $2,698. The recurring error is forgetting to divide by 1,000 first — and the reasonableness check catches it: a five-figure monthly payment on a $450,000 loan is the wrong order of magnitude.",
  },
  "a2-b6-q2": {
    blockId: "a2-b6", concept: "payment-yield", role: "replacement",
    replacementId: null, remediationScreen: "a2-b6-s3",
    prompt: "An investor buys a $200,000 note bearing 7% interest-only for $180,000. What happens to his yield relative to the note rate?",
    choices: [
      "It rises above 7% — the note pays $14,000 a year on a $180,000 investment, about 7.78%: buying at a discount raises the yield.",
      "It stays exactly 7% — yield always equals the note rate.",
      "It falls below 7%, because discounts reduce the return.",
      "It cannot be determined without knowing the borrower's credit.",
    ],
    correctChoice: 0,
    rationale: "Yield is the return to the holder: 14,000 ÷ 180,000 ≈ 7.78%. Buying at a discount raises yield; buying at a premium lowers it — price and yield move in opposite directions for a given income, the same inverse relationship as a capitalization rate.",
  },
});
