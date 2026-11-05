/** Original formative exercises, not secure finals or completed Commission contracts.
 * All rates, charges and proration conventions are fictional givens, not program rules.
 * Cases 1, 5 and 8 already have worked examples in Closings module 05. These supply 2/3/4/6/7.
 */
export const COLORADO_ADDITIONAL_CLOSING_CASES = Object.freeze([
  {
    id: 'CO-CLOSE-02', number: 2, title: 'New conventional loan',
    price: 480000, earnestMoney: 12000,
    financing: { kind: 'new-loan', cashProceeds: 384000, noncashPrincipal: 0 },
    taxes: { annual: 3600, sellerDays: 150, yearDays: 360, treatment: 'arrears' },
    buyerCharges: [{ label: 'Origination (given 1% of loan)', amount: 3840 }, { label: 'Prepaid interest (given 6%, 30/360)', amount: 1920 }, { label: 'Recording', amount: 220 }],
    sellerCharges: [{ label: 'Existing loan payoff', amount: 210000 }, { label: 'Negotiated compensation (given 5%)', amount: 24000 }, { label: 'Title premium', amount: 1800 }, { label: 'Recording/release', amount: 60 }],
    outsideClosing: [{ label: 'Buyer appraisal already paid', amount: 650 }],
    facts: 'June 1 closing. The exercise uses 30-day months and a 360-day year; seller bears taxes through May 30 (150 days). New loan interest is charged for 30 days at 6% on $384,000. The $650 appraisal was paid separately and is not collected again in the cash settlement.',
    followUp: 'Explain why subtracting the already-paid appraisal again would underfund closing. Recompute buyer cash if the tax proration is $100 larger; identify the equal and opposite seller effect.'
  },
  {
    id: 'CO-CLOSE-03', number: 3, title: 'New FHA loan with a financed premium',
    price: 350000, earnestMoney: 7000,
    financing: { kind: 'new-loan', cashProceeds: 343660.63, noncashPrincipal: 0 },
    taxes: { annual: 2400, sellerDays: 180, yearDays: 360, treatment: 'arrears' },
    buyerCharges: [{ label: 'Financed upfront premium, given', amount: 5910.63 }, { label: 'Lender charges, given', amount: 2200 }, { label: 'Prepaid interest, given', amount: 1510 }, { label: 'Recording', amount: 200 }],
    sellerCharges: [{ label: 'Existing loan payoff', amount: 190000 }, { label: 'Negotiated compensation, given', amount: 17500 }, { label: 'Title premium', amount: 1500 }, { label: 'Recording/release', amount: 40 }],
    outsideClosing: [],
    facts: 'The lender-approved hypothetical worksheet supplies a $337,750 base loan and a $5,910.63 financed premium, for $343,660.63 total proceeds. Show both the premium charge and the full loan credit once. The supplied amounts are exercise facts and do not state current FHA eligibility, down-payment, premium or seller-contribution rules. Seller tax days are explicitly 180 on the 360-day convention.',
    followUp: 'Explain why adding the financed premium to the loan credit but omitting its charge overstates available funds. Identify the documents needed to verify actual lender-approved loan proceeds and charges.'
  },
  {
    id: 'CO-CLOSE-04', number: 4, title: 'New VA loan with a seller credit',
    price: 420000, earnestMoney: 4000,
    financing: { kind: 'new-loan', cashProceeds: 420000, noncashPrincipal: 0 },
    taxes: { annual: 4200, sellerDays: 90, yearDays: 360, treatment: 'arrears' },
    sellerCredit: 3000,
    buyerCharges: [{ label: 'Lender-approved buyer charges, given', amount: 6000 }, { label: 'Prepaid interest, given', amount: 1800 }, { label: 'Prepaid insurance, given', amount: 900 }, { label: 'Recording', amount: 250 }],
    sellerCharges: [{ label: 'Existing loan payoff', amount: 250000 }, { label: 'Negotiated compensation, given', amount: 21000 }, { label: 'Title premium', amount: 1800 }, { label: 'Recording/release', amount: 40 }],
    outsideClosing: [],
    facts: 'The hypothetical lender worksheet approves the listed charges and the $3,000 seller credit. A supplied lender determination gives a zero funding fee for this borrower; this is not a statement that all VA borrowers have no fee. Tax days are 90 on a 360-day year. Do not infer current VA fee, concession or eligibility rules from the exercise.',
    followUp: 'Distinguish the contractual seller credit from tax proration. Explain why neither is new loan proceeds and why an actual lender must verify permitted charges and concessions.'
  },
  {
    id: 'CO-CLOSE-06', number: 6, title: 'VA assumption with separately settled interest',
    price: 380000, earnestMoney: 9000,
    financing: { kind: 'assumption', cashProceeds: 0, noncashPrincipal: 275000 },
    taxes: { annual: 3000, sellerDays: 150, yearDays: 360, treatment: 'arrears' },
    buyerCharges: [{ label: 'Assumption processing charge, given', amount: 650 }, { label: 'Recording', amount: 210 }],
    sellerCharges: [{ label: 'Accrued interest remitted to lender, given', amount: 900 }, { label: 'Negotiated compensation, given', amount: 19000 }, { label: 'Title premium', amount: 1600 }, { label: 'Recording/release', amount: 40 }],
    outsideClosing: [],
    facts: 'The lender has approved the hypothetical assumption and supplied an exact $275,000 unpaid principal balance, excluding $900 accrued interest that settlement remits separately as a seller charge. No new loan funds enter escrow. The exercise does not imply automatic release of the seller or substitution of VA entitlement: inspect separate actual lender/VA determinations. Taxes use 150 seller days on a 360-day year.',
    followUp: 'Identify the noncash principal transfer on both parties’ statements. Explain why including $275,000 as cash received from a lender would corrupt the disbursement proof. List the separate assumption, release and entitlement questions.'
  },
  {
    id: 'CO-CLOSE-07', number: 7, title: 'Owner carry with an existing payoff',
    price: 300000, earnestMoney: 8000,
    financing: { kind: 'owner-carry', cashProceeds: 0, noncashPrincipal: 240000 },
    taxes: { annual: 2160, sellerDays: 150, yearDays: 360, treatment: 'arrears' },
    buyerCharges: [{ label: 'Buyer document/legal charge, given', amount: 600 }, { label: 'Recording', amount: 200 }],
    sellerCharges: [{ label: 'Existing loan payoff', amount: 20000 }, { label: 'Negotiated compensation, given', amount: 15000 }, { label: 'Title premium', amount: 1400 }, { label: 'Recording/release', amount: 60 }],
    outsideClosing: [],
    facts: 'The seller accepts a $240,000 purchase-money note under separately reviewed hypothetical documents. The seller’s $20,000 existing loan is paid from cash closing funds. The seller receives the note plus cash proceeds; the note is not a cash deposit into escrow. Use 150 seller tax days on a 360-day year. No exemption from lending, licensing or consumer-protection law is assumed.',
    followUp: 'Separate the seller’s note from cash proceeds. Identify the legal, lien-priority, servicing and consumer-lending questions requiring review before using actual owner-finance documents. Recompute the seller’s cash if the payoff rises by $5,000.'
  }
].map(item => Object.freeze({ ...item, fromPreparedCommissionContract: false, observedMinutes: null })));

const cents = amount => {
  if (!Number.isFinite(amount) || amount < 0 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001) throw new Error('Exercise amounts must be nonnegative finite dollars with at most two decimal places.');
  return Math.round(amount * 100);
};

export function solveColoradoClosingCase(item) {
  const price=cents(item.price), earnest=cents(item.earnestMoney);
  const cashLoan=cents(item.financing.cashProceeds), noncashLoan=cents(item.financing.noncashPrincipal);
  if (cashLoan && noncashLoan) throw new Error('These cases distinguish cash loan proceeds from a noncash loan transfer.');
  if (item.taxes.treatment !== 'arrears' || !Number.isInteger(item.taxes.sellerDays) || item.taxes.sellerDays < 0 || item.taxes.sellerDays > item.taxes.yearDays || !Number.isInteger(item.taxes.yearDays) || item.taxes.yearDays <= 0) throw new Error('A valid supplied arrears-proration convention is required.');
  const tax=Math.round(cents(item.taxes.annual)*item.taxes.sellerDays/item.taxes.yearDays);
  const credit=cents(item.sellerCredit??0);
  const buyerCharges=item.buyerCharges.reduce((sum,line)=>sum+cents(line.amount),0);
  const sellerCharges=item.sellerCharges.reduce((sum,line)=>sum+cents(line.amount),0);
  const buyerCash=price+buyerCharges-earnest-cashLoan-noncashLoan-tax-credit;
  const sellerCash=price-sellerCharges-noncashLoan-tax-credit;
  const sources=buyerCash+earnest+cashLoan;
  const disbursements=sellerCash+buyerCharges+sellerCharges;
  return Object.freeze({
    taxProrationCents:tax, buyerCashCents:buyerCash, sellerCashCents:sellerCash,
    cashSourcesCents:sources, cashDisbursementsCents:disbursements,
    noncashPrincipalCents:noncashLoan, balanced:sources===disbursements,
    outsideClosingCents:item.outsideClosing.reduce((sum,line)=>sum+cents(line.amount),0)
  });
}
