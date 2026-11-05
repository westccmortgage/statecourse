import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLORADO_ADDITIONAL_CLOSING_CASES, solveColoradoClosingCase } from '../config/colorado/closing-practical-cases.mjs';

const money = cents => (cents / 100).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
const amount = value => money(Math.round(value*100));
const target=fileURLToPath(new URL('../colorado/co-closings-24-v1/activities/additional-closing-workbook.md',import.meta.url));
let text=`# Five additional closing problems: student work and worked feedback

Original StateCourse formative coursework, November 5, 2026. Use with Closings module 05. Its existing problems 1, 5 and 8 remain intact; this workbook supplies complete numeric facts for problems 2, 3, 4, 6 and 7. These are instructional examples, not secure final-examination items. No credit, approval or observed duration is claimed.

All charges, financing terms, rates and proration conventions are supplied hypothetical facts. They do not establish current FHA/VA rules, permitted fees, insurance rates, customary compensation or a statewide proration convention. In an actual closing verify the current contract, lender instructions, law and supporting invoices. Do not disburse merely because an educational worksheet balances.

## Required student work for every problem

1. Identify the transaction price, earnest money and holder, cash loan proceeds, any noncash loan transfer, each charge and its supporting instruction, and all prorations.
2. Prepare a six-column worksheet: buyer debit/credit, seller debit/credit, and settlement cash receipts/disbursements. Show the direction of each item. Put assumed or seller-carried principal on both parties' statements, then distinguish it from money entering escrow.
3. Calculate buyer cash required and seller cash proceeds. List actual cash sources and actual cash disbursements and prove they match. Keep expenses paid outside closing separate so they are not collected twice.
4. Complete the new-fact follow-up and explain any missing legal, lender or contract evidence.
5. Submit the initial worksheet before reviewing feedback, then retain corrections and the instructor's disposition.

**Prepared-contract boundary.** No problem in this workbook is represented as a completed current Commission contract. Problems 2, 5 and 8 must still be completed against actual prepared current contracts to satisfy that distinct outline requirement. A numeric case or term sheet does not close that requirement. Student performance, independent review, a comprehensive final and duration evidence remain separate.

`;
for(const item of COLORADO_ADDITIONAL_CLOSING_CASES){
  const s=solveColoradoClosingCase(item);
  if(!s.balanced)throw new Error(`Unbalanced exercise ${item.id}`);
  text+=`## Problem ${item.number}: ${item.title}

${item.facts}

| Supplied fact | Dollars |
| --- | ---: |
| Price | ${amount(item.price)} |
| Earnest money, available to settlement | ${amount(item.earnestMoney)} |
| Cash new-loan proceeds | ${amount(item.financing.cashProceeds)} |
| Noncash assumed or seller-carried principal | ${amount(item.financing.noncashPrincipal)} |
| Annual taxes, arrears | ${amount(item.taxes.annual)} |
| Seller tax days / year-day convention | ${item.taxes.sellerDays} / ${item.taxes.yearDays} |
| Contractual seller credit | ${amount(item.sellerCredit??0)} |

| Supplied charge | Buyer pays | Seller pays |
| --- | ---: | ---: |
`;
  for(const line of item.buyerCharges)text+=`| ${line.label} | ${amount(line.amount)} | |
`;
  for(const line of item.sellerCharges)text+=`| ${line.label} | | ${amount(line.amount)} |
`;
  text+=`
**Independent follow-up.** ${item.followUp}

### Worked feedback after the student's attempt

Tax proration: $${amount(item.taxes.annual)} × ${item.taxes.sellerDays}/${item.taxes.yearDays} = **$${money(s.taxProrationCents)}**, seller debit and buyer credit because taxes are in arrears under the supplied convention.

| Item | Buyer debit | Buyer credit | Seller debit | Seller credit | Settlement receipts | Settlement disbursements |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Price | ${amount(item.price)} | | | ${amount(item.price)} | | |
| Earnest money | | ${amount(item.earnestMoney)} | | | ${amount(item.earnestMoney)} | |
`;
  if(item.financing.cashProceeds)text+=`| New-loan proceeds | | ${amount(item.financing.cashProceeds)} | | | ${amount(item.financing.cashProceeds)} | |
`;
  if(item.financing.noncashPrincipal)text+=`| Noncash financing principal | | ${amount(item.financing.noncashPrincipal)} | ${amount(item.financing.noncashPrincipal)} | | | |
`;
  text+=`| Tax proration | | ${money(s.taxProrationCents)} | ${money(s.taxProrationCents)} | | | |
`;
  if(item.sellerCredit)text+=`| Contractual seller credit | | ${amount(item.sellerCredit)} | ${amount(item.sellerCredit)} | | | |
`;
  for(const line of item.buyerCharges)text+=`| ${line.label} | ${amount(line.amount)} | | | | | ${amount(line.amount)} |
`;
  for(const line of item.sellerCharges)text+=`| ${line.label} | | | ${amount(line.amount)} | | | ${amount(line.amount)} |
`;
  text+=`| Buyer cash received | | ${money(s.buyerCashCents)} | | | ${money(s.buyerCashCents)} | |
| Seller cash disbursed | | | ${money(s.sellerCashCents)} | | | ${money(s.sellerCashCents)} |

The final two balancing rows record the cash that satisfies the party balances; they are not extra fees. Settlement receipts and disbursements form the third pair of the six-column worksheet.

Buyer debits less credits before those balancing rows: **cash required $${money(s.buyerCashCents)}**. Seller credits less debits: **cash proceeds $${money(s.sellerCashCents)}**.

Cash proof: buyer cash $${money(s.buyerCashCents)} + earnest money $${amount(item.earnestMoney)} + new-loan cash $${amount(item.financing.cashProceeds)} = **$${money(s.cashSourcesCents)}**. Seller cash plus all listed cash charges = **$${money(s.cashDisbursementsCents)}**. Noncash principal is excluded from both cash totals. Amounts already paid outside closing total $${money(s.outsideClosingCents)} and are not collected a second time.

`;
}
text+=`## Review rubric and correction record

Accept only when the learner correctly identifies each supplied item, shows the proration and its direction, distinguishes cash from noncash financing, avoids double collection, calculates both parties' cash and balances the cash proof. A balanced worksheet with an unsupported charge, missing contract instruction or wrong legal assumption is not a correct closing. Use each follow-up to assess transfer to changed facts. Retain source documents, the initial attempt, corrections and review disposition.

No learner has completed these problems merely because the workbook or calculation tests exist. No instructor has yet been assigned by the owner. The current Commission forms, three prepared-contract exercises, independent review, actual student delivery, final examination and course-hour evidence remain open. The Commission's Closings outline is the existing course authority; this file does not amend it.
`;
if(process.argv.includes('--check')){
  if(readFileSync(target,'utf8')!==text)throw new Error('Closing workbook is stale.');
}else{mkdirSync(dirname(target),{recursive:true});writeFileSync(target,text);}
console.log(`Five original formative closing problems ${process.argv.includes('--check')?'verified':'written'}; no course completion granted.`);
