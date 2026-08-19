/**
 * California Mortgage Loan Brokering and Lending (45 hours) — secure final exam bank.
 *
 * NOT PUBLIC. Imported by Netlify functions only; site/build.sh fails the build if any
 * file matching /final-exam-bank|answer-key/ reaches `dist`. The correct answer never
 * leaves the server: publicAssessment() strips it and scoring happens server-side.
 *
 * Structure required by RE 303 p.4 and recorded in database/004_california_prelicense.sql:
 *   two forms, 100 questions each, 60% passing, one retake on DIFFERENT questions.
 *
 * Coverage rule: six or seven items per lesson assignment plus integrative items that
 * cross assignments. Every item carries `source`, naming the assignment and the
 * subsection where the answer is found; scripts/audit-california-content.mjs resolves
 * every reference against the lesson's actual headings and fails if one does not exist.
 *
 * Course version 1.0 — not approved; no California credit is available.
 */

const formA = [
  /* Assignment 01 — California mortgage brokerage and regulatory structure */
  { source: { assignment: "assignment-01", section: "2.2" },
    prompt: "What triggers the mortgage loan originator endorsement requirement for an individual?",
    choices: [
      "Taking a residential mortgage loan application or offering or negotiating terms of a residential mortgage loan for compensation or gain.",
      "Holding a real estate broker license and arranging any loan.",
      "Receiving compensation from a lender rather than from a borrower.",
      "Handling more than a threshold number of loans in a calendar year."
    ],
    correctChoice: 0,
    rationale: "The trigger is the activity performed for compensation or the expectation of it, not the license held, the source of payment, or a volume threshold." },
  { source: { assignment: "assignment-01", section: "2.5" },
    prompt: "What does the endorsement NOT do?",
    choices: [
      "It does not enlarge the authority the underlying license confers, and it does not substitute for a license under a different framework.",
      "It does not permit an individual to take applications.",
      "It does not require annual renewal.",
      "It does not require a unique identifier."
    ],
    correctChoice: 0,
    rationale: "The endorsement authorizes the originator activity within the license already held. Application-taking is exactly what it permits, and renewal and the identifier are part of it." },
  { source: { assignment: "assignment-01", section: "4.2" },
    prompt: "Whether an activity requires licensure is determined by what?",
    choices: [
      "What was actually done and whether it was for compensation — a job title is not the test.",
      "How the person describes his role to the borrower.",
      "Whether the person's name appears on any transaction document.",
      "Whether the loan ultimately funded."
    ],
    correctChoice: 0,
    rationale: "Calling a role 'assistant', 'processor', or 'coordinator' does not determine whether the activity performed was licensed activity." },
  { source: { assignment: "assignment-01", section: "4.4" },
    prompt: "Why does the business-purpose distinction matter to a mortgage originator?",
    choices: [
      "Much of the consumer protection framework applies to loans for personal, family, or household purposes, so the characterization changes which rules apply.",
      "Business-purpose loans require a different real estate license.",
      "Business-purpose loans may not be secured by residential property.",
      "Business-purpose loans are exempt from all California regulation."
    ],
    correctChoice: 0,
    rationale: "The distinction changes the applicable framework rather than the license required, and it is not an exemption from regulation generally." },
  { source: { assignment: "assignment-01", section: "6.3" },
    prompt: "Which conduct is described as the one that ends careers?",
    choices: [
      "Falsifying a record — altering or creating a document so it says something it did not.",
      "Missing a rate lock expiration.",
      "Quoting a payment that omits taxes and insurance.",
      "Failing to deliver a disclosure within the required period."
    ],
    correctChoice: 0,
    rationale: "The others are compliance failures a brokerage can survive with findings and corrections. Falsification converts a defensible examination into a question about integrity." },
  { source: { assignment: "assignment-01", section: "3.4" },
    prompt: "A borrower asks whether a proposed arrangement is permitted under a framework the originator does not work in. What is the correct response?",
    choices: [
      "Route it — name the authority that would answer it and take it to the broker rather than reasoning by analogy to a familiar framework.",
      "Apply the rule from the framework the originator knows best.",
      "Tell the borrower the arrangement is permitted unless he is told otherwise.",
      "Decline to discuss anything outside the originator's own license."
    ],
    correctChoice: 0,
    rationale: "Reasoning by analogy across frameworks is how a brokerage answers at least one question wrong. Routing is the discipline; refusing to engage at all is not required." },
  /* Assignment 02 — Money, interest, notes, and loan mathematics */
  { source: { assignment: "assignment-02", section: "1.2" },
    prompt: "A borrower owes $412,000 at 6.25% annual simple interest. What is one month's interest?",
    choices: [
      "$2,145.83",
      "$2,575.00",
      "$25,750.00",
      "$1,716.67"
    ],
    correctChoice: 0,
    rationale: "$412,000 × 0.0625 = $25,750 per year; ÷ 12 = $2,145.83. The distractors use a wrong divisor, the annual figure, and a 5% rate." },
  { source: { assignment: "assignment-02", section: "1.4" },
    prompt: "A payoff of $412,000 at 6.25% is computed on a 365-day basis. What is the per diem interest?",
    choices: [
      "$70.55",
      "$71.53",
      "$2,145.83",
      "$25,750.00"
    ],
    correctChoice: 0,
    rationale: "$412,000 × 0.0625 ÷ 365 = $70.55. A 360-day basis produces the second figure, which is why a payoff demand states its basis and its good-through date." },
  { source: { assignment: "assignment-02", section: "2.2" },
    prompt: "How does an amortized payment split early in the loan term?",
    choices: [
      "Mostly interest, with a small portion reducing principal, and the proportion shifts toward principal over time.",
      "Evenly between interest and principal for the first half of the term.",
      "Mostly principal, since the balance is highest at the start.",
      "Entirely interest until the midpoint of the term."
    ],
    correctChoice: 0,
    rationale: "Interest is computed on the outstanding balance, which is highest at the start. This is why a borrower who sells early has retired very little principal." },
  { source: { assignment: "assignment-02", section: "2.4" },
    prompt: "What is negative amortization?",
    choices: [
      "The loan balance increases because the payment does not cover the interest accruing.",
      "The borrower pays extra principal, reducing the balance faster than scheduled.",
      "The interest rate decreases while the payment stays the same.",
      "The lender reduces the balance as part of a modification."
    ],
    correctChoice: 0,
    rationale: "Unpaid interest is added to the balance. It is a feature requiring a plain-language explanation with its numbers, not a benefit." },
  { source: { assignment: "assignment-02", section: "3.4" },
    prompt: "What distinguishes an acceleration clause from an alienation clause?",
    choices: [
      "Acceleration makes the balance due on a stated event such as default; alienation makes it due on transfer of the property.",
      "They are two names for the same provision.",
      "Acceleration applies to adjustable loans and alienation to fixed loans.",
      "Acceleration is exercised by the trustee and alienation by the beneficiary."
    ],
    correctChoice: 0,
    rationale: "Different triggers. Confusing them is why borrowers are surprised that selling or transferring can call the loan due." },
  { source: { assignment: "assignment-02", section: "4.4" },
    prompt: "Why can two loans with the same note rate carry different annual percentage rates?",
    choices: [
      "The APR reflects the cost of credit including certain fees, so differing finance charges produce differing APRs at the same note rate.",
      "The APR includes property taxes and insurance and the note rate does not.",
      "The APR is set by the lender's margin and the note rate by the index.",
      "The APR applies to adjustable loans only."
    ],
    correctChoice: 0,
    rationale: "APR is a cost measure and the note rate is the accrual rate. Taxes and insurance are not finance charges." },
  { source: { assignment: "assignment-03", section: "2.2" },
    prompt: "Why does a deed of trust involve a third party that a mortgage does not?",
    choices: [
      "The trustee holds the power of sale, which enables the nonjudicial process California practice relies on.",
      "The trustee holds the borrower's title until the loan is repaid, which a mortgagee cannot.",
      "The trustee services the loan and collects the payments.",
      "The trustee insures the lender against loss."
    ],
    correctChoice: 0,
    rationale: "The trustee's power of sale is the operative difference. Servicing and insurance are separate functions performed by other parties." },
  { source: { assignment: "assignment-03", section: "4.3" },
    prompt: "What is the general rule of lien priority?",
    choices: [
      "First in time of recording is first in right, subject to defined exceptions.",
      "The largest lien takes priority regardless of recording order.",
      "Liens rank by the date the underlying obligation was incurred.",
      "Purchase money liens always rank last."
    ],
    correctChoice: 0,
    rationale: "Recording order governs, subject to exceptions such as property tax liens and the relation-back feature of mechanic's liens." },
  { source: { assignment: "assignment-03", section: "4.5" },
    prompt: "Why is a mechanic's lien a particular problem for a lender?",
    choices: [
      "Its priority may relate back to a point earlier than its recording, so a lien recorded later can outrank an intervening deed of trust.",
      "It cannot be released without a court order.",
      "It attaches to the contractor's property rather than the owner's.",
      "It survives a foreclosure by a senior lienholder."
    ],
    correctChoice: 0,
    rationale: "The relation-back feature is the danger, which is why title work resolves whether work has commenced before a loan records." },
  { source: { assignment: "assignment-03", section: "5.1" },
    prompt: "What does a subordination agreement accomplish?",
    choices: [
      "It changes the priority the recording order would otherwise produce, moving a senior lien behind a junior one.",
      "It reduces the balance of the subordinated lien.",
      "It releases the property from the subordinated lien.",
      "It transfers the subordinated lien to a new beneficiary."
    ],
    correctChoice: 0,
    rationale: "Subordination reorders priority without reducing, releasing, or transferring the obligation." },
  { source: { assignment: "assignment-03", section: "5.6" },
    prompt: "What distinguishes taking title 'subject to' an existing loan from assuming it?",
    choices: [
      "An assumption makes the new owner personally liable on the obligation; taking subject to does not, though the lien remains against the property.",
      "Taking subject to requires lender approval and an assumption does not.",
      "An assumption removes the lien from the property and taking subject to leaves it.",
      "They are alternative names for the same arrangement."
    ],
    correctChoice: 0,
    rationale: "The difference is personal liability. In both cases the lien remains against the property and an alienation clause may be triggered." },
  { source: { assignment: "assignment-03", section: "6.3" },
    prompt: "In the nonjudicial sequence, what distinguishes reinstatement from redemption?",
    choices: [
      "Reinstatement cures the arrearage and allowable costs within the period allowed; redemption requires the full accelerated balance.",
      "Reinstatement is available only to junior lienholders.",
      "Redemption is available before the notice of default and reinstatement after it.",
      "They are alternative names for the same right."
    ],
    correctChoice: 0,
    rationale: "The amounts differ, and the distinction is the most consequential thing a borrower in default does not know." },
  { source: { assignment: "assignment-04", section: "1.2" },
    prompt: "What is the secondary market for?",
    choices: [
      "Buying closed loans from originators, which returns capital so they can lend again and connects mortgage rates to investor demand.",
      "Making loans directly to borrowers who cannot qualify in the primary market.",
      "Servicing loans after the originating lender sells them.",
      "Insuring lenders against borrower default."
    ],
    correctChoice: 0,
    rationale: "It supplies liquidity to originators. Servicing and insurance are distinct functions, and the secondary market does not originate." },
  { source: { assignment: "assignment-04", section: "2.2" },
    prompt: "What distinguishes a mortgage banker from a mortgage broker?",
    choices: [
      "A banker funds loans with its own or warehouse funds and is the lender of record; a broker arranges loans funded by others.",
      "A banker may only make government-backed loans and a broker only conventional loans.",
      "A banker services loans and a broker does not.",
      "A banker charges points and a broker charges only a commission."
    ],
    correctChoice: 0,
    rationale: "The distinction is who funds and who is the lender of record, which changes capacity, disclosure, and how compensation is structured." },
  { source: { assignment: "assignment-04", section: "3.2" },
    prompt: "What is the common structure of government-backed loan programs?",
    choices: [
      "The agency insures or guarantees the loan against loss and an approved lender makes it.",
      "The agency lends directly to the borrower at a rate it sets.",
      "The agency purchases the loan from the lender at closing.",
      "The agency appraises the property and issues the title policy."
    ],
    correctChoice: 0,
    rationale: "Insuring or guaranteeing is not lending, and the rate is set in the market between lender and borrower." },
  { source: { assignment: "assignment-04", section: "4.2" },
    prompt: "Which set of terms describes how an adjustable rate actually moves?",
    choices: [
      "Index, margin, adjustment period, and the caps on each adjustment and over the life of the loan.",
      "Note rate, annual percentage rate, and discount points.",
      "Loan-to-value, debt-to-income, and reserves.",
      "Term, amortization schedule, and payment factor."
    ],
    correctChoice: 0,
    rationale: "The index plus the margin sets the rate at each adjustment, and the caps bound how far it can move — which is what produces the worst-case payment." },
  { source: { assignment: "assignment-04", section: "4.4" },
    prompt: "What may a licensee never do with rates?",
    choices: [
      "Predict where rates are going, or tell a borrower he can simply refinance later if the payment rises.",
      "Explain what an index and a margin are.",
      "Tell a borrower the rate is not locked until the lock is confirmed in writing.",
      "Direct a borrower to the lender for a current quote."
    ],
    correctChoice: 0,
    rationale: "A prediction stated as a plan is the single most damaging sentence available in a financing conversation. The other three are accurate and within scope." },
  { source: { assignment: "assignment-04", section: "6.2" },
    prompt: "What does presenting products on a common basis require?",
    choices: [
      "The same loan amount, closing date, point assumption, and time horizon for every option, with the worst-case payment shown wherever the payment can change.",
      "Presenting only the products for which the borrower is already approved.",
      "Presenting the option with the lowest initial payment first.",
      "Presenting each product with the assumptions the lender supplied for it."
    ],
    correctChoice: 0,
    rationale: "A borrower can only compare options presented the same way, and the worst case is the figure the presentation exists to convey." },
  /* Assignment 05 — Loan application, borrower qualification, and file assembly */
  { source: { assignment: "assignment-05", section: "1.3" },
    prompt: "When does an application exist for disclosure purposes?",
    choices: [
      "When the defined items are in the originator's hands — name, income, Social Security number, property address, an estimate of value, and the loan amount sought.",
      "When the borrower signs the uniform application form.",
      "When the originator submits the file to a lender.",
      "When the borrower pays an application fee."
    ],
    correctChoice: 0,
    rationale: "It does not wait for a signature, a form, a submission, or a fee — and it does not require the borrower to supply the sixth item deliberately." },
  { source: { assignment: "assignment-05", section: "1.6" },
    prompt: "A borrower stops responding to requests for documents. How is the file coded?",
    choices: [
      "Incomplete or denied depending on what preceded it — 'he stopped answering' is not a withdrawal.",
      "Withdrawn by applicant, since the borrower discontinued participation.",
      "Approved but not accepted, since no decision was made.",
      "Left open indefinitely until the borrower responds."
    ],
    correctChoice: 0,
    rationale: "Coding a denial or an incomplete file as a withdrawal removes the applicant from the denial data and from the notice he was owed." },
  { source: { assignment: "assignment-05", section: "2.5" },
    prompt: "A large deposit appears in the borrower's account. What is the originator's role?",
    choices: [
      "Request the source documentation and the borrower's own explanation, and transmit them — never draft the explanation or advise how the funds should be characterized.",
      "Draft the letter of explanation for the borrower's signature so the file moves.",
      "Advise the borrower to wait until the deposit has seasoned.",
      "Omit the account from the file and use a different one."
    ],
    correctChoice: 0,
    rationale: "Drafting the borrower's account of his own facts is authorship, advising on seasoning is advising concealment, and substituting an account is worse than both." },
  { source: { assignment: "assignment-05", section: "3.3" },
    prompt: "What must exist before a consumer report is obtained?",
    choices: [
      "A permissible purpose, and the authorization the framework requires.",
      "A signed purchase agreement for the subject property.",
      "A completed appraisal.",
      "A lender's conditional approval."
    ],
    correctChoice: 0,
    rationale: "A report pulled without permissible purpose is a violation, and the pull date is frequently what exposes an application date recorded later than the facts support." },
  { source: { assignment: "assignment-05", section: "5.2" },
    prompt: "A borrower's monthly income is $9,400. Housing payment is $2,538 and other monthly obligations total $1,222. What are the housing and total debt ratios?",
    choices: [
      "27% and 40%",
      "27% and 13%",
      "40% and 27%",
      "24% and 36%"
    ],
    correctChoice: 0,
    rationale: "$2,538 ÷ $9,400 = 27%; ($2,538 + $1,222) ÷ $9,400 = 40%. The second option omits the housing payment from the total ratio, which is the most common error." },
  { source: { assignment: "assignment-05", section: "6.2" },
    prompt: "What must never happen to an application?",
    choices: [
      "A figure altered, a document created inside the brokerage in the borrower's voice, or a verification represented that did not occur.",
      "A correction made after the borrower identifies an error.",
      "A supplement added when the borrower produces additional documentation.",
      "A resubmission to a second lender after a denial."
    ],
    correctChoice: 0,
    rationale: "Corrections, supplements, and resubmission are ordinary. Altering, authoring, and misrepresenting a verification are not." },
  /* Assignment 06 — Underwriting, appraisal, title, and conditions */
  { source: { assignment: "assignment-06", section: "1.2" },
    prompt: "What does the ability-to-repay requirement obligate a creditor to do?",
    choices: [
      "Make a reasonable, good faith determination that the consumer has a reasonable ability to repay, based on verified information.",
      "Guarantee that the consumer will not default during the loan term.",
      "Limit the debt-to-income ratio to a fixed maximum in every case.",
      "Obtain a co-signer where the ratio exceeds a threshold."
    ],
    correctChoice: 0,
    rationale: "It requires a reasoned determination on verified facts, not a guarantee of performance or a single universal ratio." },
  { source: { assignment: "assignment-06", section: "1.4" },
    prompt: "Which payment must the ability-to-repay determination use where the payment can change?",
    choices: [
      "A payment determined on the terms the framework prescribes rather than the lowest payment the product will ever produce.",
      "The initial payment, since that is what the borrower will actually pay first.",
      "The payment at the midpoint of the loan term.",
      "Whatever payment the borrower states he can afford."
    ],
    correctChoice: 0,
    rationale: "A determination resting on a teaser payment is exactly what the requirement exists to prevent." },
  { source: { assignment: "assignment-06", section: "3.2" },
    prompt: "What does appraiser independence prohibit?",
    choices: [
      "Communicating a target value in any form, including selecting appraisers by favorable history.",
      "Supplying the appraiser with the purchase contract.",
      "Supplying a list of improvements and their dates.",
      "Requesting a reconsideration through the prescribed channel with additional data."
    ],
    correctChoice: 0,
    rationale: "Information may be supplied; a target may not. Selection by favorable history builds the pressure into the ordering pattern." },
  { source: { assignment: "assignment-06", section: "5.6" },
    prompt: "What must never happen to an underwriting condition?",
    choices: [
      "It is cleared with a document the brokerage produced on the borrower's or a third party's behalf.",
      "It is cleared with source documentation obtained from the party who holds it.",
      "It is escalated when the borrower cannot satisfy it.",
      "It is reported to the borrower in the underwriter's own words."
    ],
    correctChoice: 0,
    rationale: "Every condition is cleared with evidence obtained from its source, in the form the source produces it." },
  { source: { assignment: "assignment-06", section: "6.2" },
    prompt: "A lender declines an application. What must the notice contain?",
    choices: [
      "The specific reasons or a disclosure of the right to obtain them, the ECOA notice, and where a consumer report was used, the FCRA content.",
      "The name of the underwriter who made the decision.",
      "A statement of what the applicant must do to qualify in future.",
      "The internal credit score model used."
    ],
    correctChoice: 0,
    rationale: "The required content is specified. The identity of the decision-maker, coaching, and the scoring model are not part of it." },
  { source: { assignment: "assignment-06", section: "4.7" },
    prompt: "Why does hazard insurance availability fail transactions in some California markets?",
    choices: [
      "Coverage must be bound before closing, and in some areas it is expensive or unobtainable — which is discovered late unless someone asks early.",
      "Because the lender selects the carrier and the process is slow.",
      "Because the seller's policy must be transferred to the buyer.",
      "Because coverage cannot be bound until the appraisal is complete."
    ],
    correctChoice: 0,
    rationale: "Availability itself is now the risk in some markets, and it is the item most often assumed and least often confirmed." },
  /* Assignment 07 — Federal mortgage law framework */
  { source: { assignment: "assignment-07", section: "1.6" },
    prompt: "Which transaction generally carries a right of rescission?",
    choices: [
      "A refinance with a new lender secured by the consumer's principal dwelling, on the terms the framework defines.",
      "A purchase money loan on the consumer's principal dwelling.",
      "A loan secured by a second home.",
      "A business-purpose loan secured by a rental property."
    ],
    correctChoice: 0,
    rationale: "Rescission attaches to defined non-purchase transactions secured by the principal dwelling. A purchase money loan is the classic exclusion." },
  { source: { assignment: "assignment-07", section: "2.3" },
    prompt: "A settlement service provider offers to pay an originator for each referral. What is the analysis?",
    choices: [
      "It is a prohibited payment for the referral of settlement service business, and disclosure does not cure it.",
      "It is permissible if disclosed to the borrower before closing.",
      "It is permissible if paid to the brokerage rather than the individual.",
      "It is permissible if the borrower is free to use a different provider."
    ],
    correctChoice: 0,
    rationale: "Whether the payment may be received at all comes before whether it was disclosed, and routing it through the brokerage does not change its character." },
  { source: { assignment: "assignment-07", section: "3.2" },
    prompt: "Which basis is protected under ECOA but is not among the Fair Housing Act's list?",
    choices: [
      "Marital status.",
      "National origin.",
      "Religion.",
      "Sex."
    ],
    correctChoice: 0,
    rationale: "Marital status and receipt of public assistance income are distinctive to ECOA; familial status and disability are distinctive to the Fair Housing Act." },
  { source: { assignment: "assignment-07", section: "3.4" },
    prompt: "What is the paradox of government monitoring information?",
    choices: [
      "The information that may not be used in the credit decision is the information required to be collected — and the applicant must be told he may decline.",
      "The information is collected only where the applicant volunteers it.",
      "The information may be used to justify a denial where the file is marginal.",
      "The information is required for business-purpose loans only."
    ],
    correctChoice: 0,
    rationale: "Skipping the request because it feels invasive corrupts the data the entire fair lending framework depends on." },
  { source: { assignment: "assignment-07", section: "5.2" },
    prompt: "What does FCRA's permissible purpose requirement mean in practice?",
    choices: [
      "A consumer report may be obtained only for a purpose the statute allows, such as in connection with a credit transaction the consumer initiated.",
      "A report may be obtained whenever the consumer has signed any brokerage document.",
      "A report may be obtained for anyone whose information is in the brokerage's database.",
      "A report may be obtained provided the consumer is told afterward."
    ],
    correctChoice: 0,
    rationale: "The purpose must exist at the time of the pull. Signature on an unrelated document, database presence, and after-the-fact notice do not supply it." },
  { source: { assignment: "assignment-07", section: "6.4" },
    prompt: "What is the unique identifier and where must it appear?",
    choices: [
      "The number assigned through the registry, which must appear where the framework requires — including on defined communications and advertisements.",
      "The brokerage's DRE license number, used for all mortgage activity.",
      "A number the lender assigns to each loan file.",
      "The originator's Social Security number, used to verify identity."
    ],
    correctChoice: 0,
    rationale: "The identifier follows the individual across employers and is what allows a consumer to look up the originator's record." },
  /* Assignment 08 — California broker mortgage activities, trust funds, and records */
  { source: { assignment: "assignment-08", section: "1.3" },
    prompt: "What is the relationship between the California mortgage loan disclosure statement and the federal Loan Estimate?",
    choices: [
      "They are separate requirements with their own timing; satisfying the federal one does not satisfy the California one.",
      "The Loan Estimate replaced the California statement when the integrated disclosures took effect.",
      "The California statement is required only where the broker is also the lender.",
      "The California statement may be delivered at closing with the other documents."
    ],
    correctChoice: 0,
    rationale: "Treating the Loan Estimate as covering the California requirement is among the most common findings in a DRE examination of a mortgage brokerage." },
  { source: { assignment: "assignment-08", section: "2.4" },
    prompt: "What determines whether a fee is an advance fee?",
    choices: [
      "What the fee is for and when it is taken — renaming it does not remove it from the framework.",
      "Whether it exceeds a stated dollar amount.",
      "Whether it is described as non-refundable in the agreement.",
      "Whether it is collected by the broker or by a third-party vendor."
    ],
    correctChoice: 0,
    rationale: "The characterization follows the substance. A label, an amount, and the collecting party do not change what the fee is." },
  { source: { assignment: "assignment-08", section: "3.3" },
    prompt: "A broker deposits borrower funds into the brokerage operating account and records them on an internal ledger. What has occurred?",
    choices: [
      "Commingling, which the internal ledger does not cure; conversion would be the further step of using the funds for the broker's purposes.",
      "Nothing improper, because the ledger identifies the owner of each dollar.",
      "Conversion, which is the same violation as commingling.",
      "A permissible practice if the funds are moved to trust within a short period."
    ],
    correctChoice: 0,
    rationale: "Placement in an operating account is the violation regardless of internal records, and the two offenses are distinct." },
  { source: { assignment: "assignment-08", section: "3.5" },
    prompt: "A trust account reconciliation reveals a shortage. What is required?",
    choices: [
      "The broker corrects it immediately from broker funds and documents the correction.",
      "The shortage is carried until the responsible party makes it good.",
      "The shortage is covered from other beneficiaries' balances in the same account.",
      "The account is frozen until the source is identified."
    ],
    correctChoice: 0,
    rationale: "Carrying it or covering it from other balances uses one person's money for another's benefit, which is exactly what the account exists to prevent." },
  { source: { assignment: "assignment-08", section: "4.4" },
    prompt: "Why are denied, withdrawn, and failed mortgage files retained?",
    choices: [
      "They are disproportionately the files a fair lending examination is interested in, and the retention obligation does not depend on whether the loan funded.",
      "Because the borrower may reapply and the file can be reused.",
      "Because the lender requires the broker to keep them.",
      "Because they are needed to compute the brokerage's conversion rate."
    ],
    correctChoice: 0,
    rationale: "A pattern of applications that quietly stopped is what discouragement looks like in data, which is why these files matter most." },
  { source: { assignment: "assignment-08", section: "5.3" },
    prompt: "Which mortgage advertisement is prohibited?",
    choices: [
      "One stating a payment or rate the advertiser is not prepared to provide, or stating terms without the accompanying disclosures the framework requires.",
      "One stating a rate together with the disclosures the framework requires.",
      "One identifying the brokerage, its license, and the originator's unique identifier.",
      "One inviting consumers to request a written estimate."
    ],
    correctChoice: 0,
    rationale: "Mortgage advertising carries identification requirements and triggering-term disclosure requirements at once, and a term stated without its disclosures is the classic defect." },
  /* Assignment 09 — Mortgage disclosures, compensation, and closing costs */
  { source: { assignment: "assignment-09", section: "1.1" },
    prompt: "What is the difference in function between the Loan Estimate and the Closing Disclosure?",
    choices: [
      "The Loan Estimate states estimated terms and costs early so offers can be compared; the Closing Disclosure states actual terms and costs before consummation.",
      "The Loan Estimate is for the lender's file and the Closing Disclosure for the borrower.",
      "The Loan Estimate applies to purchases and the Closing Disclosure to refinances.",
      "The Loan Estimate is optional where the borrower waives it."
    ],
    correctChoice: 0,
    rationale: "Both are designed for comparison, which is why their layout is prescribed rather than left to the originator." },
  { source: { assignment: "assignment-09", section: "2.2" },
    prompt: "What does the prohibition on term-based compensation mean?",
    choices: [
      "Compensation may not vary based on the terms of the transaction, other than by loan amount on the terms permitted.",
      "Compensation may not exceed a stated percentage of the loan amount.",
      "Compensation may not be paid by the lender.",
      "Compensation must be the same for every loan the brokerage closes."
    ],
    correctChoice: 0,
    rationale: "The rule removes the incentive to place a borrower in a costlier loan. It is not a cap, a source restriction, or a uniformity requirement." },
  { source: { assignment: "assignment-09", section: "2.6" },
    prompt: "What is the reconciliation the lesson says nobody performs?",
    choices: [
      "Comparing compensation as disclosed against compensation actually received, and confirming the payer is the party the disclosure named.",
      "Comparing the Loan Estimate against the initial rate quote.",
      "Comparing the appraisal against the contract price.",
      "Comparing the borrower's stated income against the tax transcript."
    ],
    correctChoice: 0,
    rationale: "A discrepancy between disclosed and received compensation is the fact pattern of the most common enforcement matter in mortgage brokerage, found by comparing two documents the brokerage produced itself." },
  { source: { assignment: "assignment-09", section: "3.2" },
    prompt: "Why is 'thing of value' construed broadly under the referral prohibition?",
    choices: [
      "Because value can be delivered as marketing support, event sponsorship, discounted services, or leads — not only as cash.",
      "Because the statute lists every form value may take.",
      "Because only payments exceeding a threshold are covered.",
      "Because the term includes only payments between settlement service providers."
    ],
    correctChoice: 0,
    rationale: "Breadth is the point: an arrangement that delivers value in a non-cash form is not outside the prohibition because no money changed hands." },
  { source: { assignment: "assignment-09", section: "4.4" },
    prompt: "What makes a revised Loan Estimate supportable?",
    choices: [
      "A valid changed circumstance, documented contemporaneously with a record identifying what changed.",
      "A statement on the revised form that circumstances changed.",
      "The borrower's signature acknowledging the revision.",
      "Issuance within a short period before consummation."
    ],
    correctChoice: 0,
    rationale: "\"Changed circumstances\" is a category with contents, not a phrase. A revision whose reason cannot be traced to a document is a tolerance violation with a label on it." },
  { source: { assignment: "assignment-09", section: "5.7" },
    prompt: "What satisfies the obligation to explain a product feature such as a prepayment penalty?",
    choices: [
      "A plain-language explanation carrying the feature's actual numbers and what it does to the borrower's obligation.",
      "Delivering the disclosure that describes the feature.",
      "Obtaining the borrower's signature on an acknowledgment.",
      "Telling the borrower he may ask his attorney about it."
    ],
    correctChoice: 0,
    rationale: "\"It has a prepayment penalty\" is not an explanation. Delivery and a signature establish presentation rather than understanding." },
  { source: { assignment: "assignment-10", section: "1.6" },
    prompt: "What is 'the trigger nobody watches' in the origination workflow?",
    choices: [
      "The moment the sixth application item arrives, which starts the disclosure clocks whether or not anyone noticed.",
      "The moment the borrower signs the brokerage's engagement letter.",
      "The moment the lender issues a conditional approval.",
      "The moment the appraisal is ordered."
    ],
    correctChoice: 0,
    rationale: "The application date is the date the sixth item arrived, whatever else the file says, and the credit pull date is what most often exposes a later one." },
  { source: { assignment: "assignment-10", section: "2.5" },
    prompt: "Which written warning at application prevents the most later failures?",
    choices: [
      "That the borrower must speak to the lender before opening credit, changing employment, or moving money.",
      "That the interest rate is not guaranteed until closing.",
      "That the appraisal may come in below the contract price.",
      "That closing costs are estimates and may change."
    ],
    correctChoice: 0,
    rationale: "One sentence said at the beginning prevents most of what jeopardizes approval before funding, and buying furniture for the new house is the most natural thing a borrower does." },
  { source: { assignment: "assignment-10", section: "3.1" },
    prompt: "How should verifications and third-party orders be sequenced?",
    choices: [
      "By lead time — the items with the longest turnaround are ordered first, regardless of when they are formally needed.",
      "In the order the lender lists them on the conditions sheet.",
      "After the appraisal returns, so the file is not built on a transaction that may fail.",
      "As the borrower produces the documents that prompt them."
    ],
    correctChoice: 0,
    rationale: "Ordering by convenience compresses the last week. Association documents, payoff demands, and specialist reports do not move faster because they were ordered late." },
  { source: { assignment: "assignment-10", section: "3.6" },
    prompt: "What does an originator never do with a borrower's document?",
    choices: [
      "Retype, alter, complete, or create it — the role is to request, receive, review, and transmit.",
      "Ask the borrower to supply a missing page.",
      "Point out to the borrower that a document is illegible.",
      "Transmit it to the lender through the prescribed channel."
    ],
    correctChoice: 0,
    rationale: "Retyping a pay stub because the copy is unreadable creates a document the lender will treat as the employer's." },
  { source: { assignment: "assignment-10", section: "6.3" },
    prompt: "Which post-closing quality control finding recurs most often?",
    choices: [
      "Documentation and timing defects — a disclosure whose delivery cannot be evidenced, or a figure that does not trace to a source.",
      "Appraisals that overstated value.",
      "Borrowers who defaulted in the first year.",
      "Loans that failed to sell in the secondary market."
    ],
    correctChoice: 0,
    rationale: "A figure that cannot be traced is a finding whether or not it is wrong, and delivery evidence is the gap examinations find most." },
  { source: { assignment: "assignment-10", section: "6.6" },
    prompt: "A quality control review finds a disclosure with no evidence of delivery. What must not be done?",
    choices: [
      "Create a delivery record now and file it as though it were contemporaneous.",
      "Record the finding and escalate it.",
      "Search transmission records for evidence that legitimately exists.",
      "Add a memorandum dated today describing what the file shows."
    ],
    correctChoice: 0,
    rationale: "A documented gap is a compliance problem the brokerage survives. A manufactured document is a different proceeding about a different subject." },
  /* Assignment 11 — Appraisal, title, escrow, and settlement */
  { source: { assignment: "assignment-11", section: "1.4" },
    prompt: "Which is a softer form of appraiser coercion that is still prohibited?",
    choices: [
      "Mentioning the contract price as an expectation, or selecting appraisers by their history of favorable values.",
      "Providing the appraiser with the purchase contract.",
      "Providing a list of permitted improvements and their dates.",
      "Asking the appraiser when the report will be delivered."
    ],
    correctChoice: 0,
    rationale: "Information may be supplied; a target may not, in any phrasing. Selection by history builds coercion into the ordering pattern." },
  { source: { assignment: "assignment-11", section: "2.4" },
    prompt: "What does a value below the contract price actually mean?",
    choices: [
      "The loan amount is constrained by the lower of value and price, so either more cash or a changed structure is required.",
      "The transaction cannot proceed and must be cancelled.",
      "The appraiser made an error that the lender will correct.",
      "The seller is obligated to reduce the price to the appraised value."
    ],
    correctChoice: 0,
    rationale: "A low value is a fact that constrains the loan. It obligates nobody to reduce a price and is not presumptively an error." },
  { source: { assignment: "assignment-11", section: "3.2" },
    prompt: "What are the three categories in a preliminary report an originator must distinguish?",
    choices: [
      "Exceptions, exclusions, and requirements.",
      "Liens, easements, and restrictions.",
      "Recorded, unrecorded, and pending matters.",
      "Monetary, non-monetary, and informational items."
    ],
    correctChoice: 0,
    rationale: "Exceptions are outside coverage, exclusions are removed by the policy's terms, and requirements are conditions to issuance — and confusing them produces a file surprised at title clearance." },
  { source: { assignment: "assignment-11", section: "4.5" },
    prompt: "Which reconciliation does nobody perform unless the originator does?",
    choices: [
      "Comparing the settlement statement against the agreement, the amendments, and the lender's figures.",
      "Comparing the appraisal against comparable sales.",
      "Comparing the credit report against the borrower's disclosed liabilities.",
      "Comparing the title report against the county record."
    ],
    correctChoice: 0,
    rationale: "Escrow performs its instructions and the lender checks its own figures. Whether the statement matches what the parties agreed is checked by the people who know what was agreed." },
  { source: { assignment: "assignment-11", section: "6.1" },
    prompt: "What is the order of the four closing events?",
    choices: [
      "Signing, funding, recording, and disbursement.",
      "Funding, signing, disbursement, and recording.",
      "Recording, signing, funding, and disbursement.",
      "Signing, recording, disbursement, and funding."
    ],
    correctChoice: 0,
    rationale: "Documents are executed, funds are delivered to escrow, title transfers and priority is fixed by recording, and money is released against a completed transfer." },
  { source: { assignment: "assignment-11", section: "6.3" },
    prompt: "How does a rescindable transaction differ at closing?",
    choices: [
      "Funds are not disbursed until the rescission period has run without the consumer exercising the right.",
      "Recording occurs after disbursement rather than before.",
      "The consumer signs the note after the rescission period ends.",
      "Escrow is not used, since the lender disburses directly."
    ],
    correctChoice: 0,
    rationale: "The rescission period sits between signing and disbursement, which is why a rescindable transaction's timeline differs from a purchase." },
  /* Assignment 12 — Private money, seller financing, and nontraditional transactions */
  { source: { assignment: "assignment-12", section: "1.3" },
    prompt: "What does a broker owe an investor funding a private money loan?",
    choices: [
      "Disclosure sufficient for the investor to evaluate the collateral, the borrower, and the risk — the investor is a principal, not a source of funds.",
      "Nothing beyond the note and deed of trust, since the investor is a sophisticated party.",
      "A guarantee of the loan's performance.",
      "The same disclosures the borrower receives, and nothing further."
    ],
    correctChoice: 0,
    rationale: "The broker owes duties on the investor side as well, and no broker guarantees performance." },
  { source: { assignment: "assignment-12", section: "2.2" },
    prompt: "How is the consumer-purpose determination made for a loan secured by residential property?",
    choices: [
      "By the actual purpose of the credit, established factually — a certification does not convert a consumer loan into a business-purpose one.",
      "By the box the borrower checks on the application.",
      "By whether the property is owner-occupied at closing.",
      "By whether the loan is short-term or long-term."
    ],
    correctChoice: 0,
    rationale: "The determination is factual, and the errors run in both directions — treating a business loan as consumer, and a consumer loan as business." },
  { source: { assignment: "assignment-12", section: "3.3" },
    prompt: "What must be documented in a seller-financed transaction?",
    choices: [
      "The note and security instrument terms, the disclosures the framework requires, and how the arrangement was explained to both parties.",
      "Only the purchase agreement, since the financing is part of the sale.",
      "Only the promissory note, since the security follows from it.",
      "Nothing beyond what an ordinary sale requires."
    ],
    correctChoice: 0,
    rationale: "Seller financing carries its own documentation and disclosure obligations for both sides, and it creates risks each party frequently has not considered." },
  { source: { assignment: "assignment-12", section: "4.3" },
    prompt: "What is the suitability question in a hard money transaction?",
    choices: [
      "Whether the borrower has a realistic exit — the loan is short-term and expensive, and it fails if the exit does not occur.",
      "Whether the property appraises for more than the loan amount.",
      "Whether the borrower has held a loan before.",
      "Whether the investor is comfortable with the collateral."
    ],
    correctChoice: 0,
    rationale: "The exit is the whole analysis. Collateral coverage protects the investor rather than answering whether the loan fits the borrower." },
  { source: { assignment: "assignment-12", section: "6.1" },
    prompt: "What is usury, in general terms?",
    choices: [
      "Charging interest above the maximum rate the law permits for a given transaction, where no exemption applies.",
      "Charging any interest on a loan secured by residential property.",
      "Charging points in addition to interest.",
      "Charging a rate higher than a competitor's."
    ],
    correctChoice: 0,
    rationale: "The California framework operates through an exemption structure, and whether a particular transaction is exempt is a legal question rather than an assumption." },
  { source: { assignment: "assignment-12", section: "4.7" },
    prompt: "Which pattern should stop a hard money file rather than be worked around?",
    choices: [
      "A consumer-purpose borrower on owner-occupied property being placed in a short-term loan he has no demonstrated way to repay.",
      "A borrower who has used private money before.",
      "A property requiring repairs before it can be resold.",
      "An investor who wants a first position rather than a second."
    ],
    correctChoice: 0,
    rationale: "That combination is where consumer protection frameworks apply with force and where the harm is greatest, and it is not a structuring problem to solve." },
  /* Assignment 13 — Servicing, payoff, default, and foreclosure */
  { source: { assignment: "assignment-13", section: "2.2" },
    prompt: "Why does the payment on a fixed-rate loan change?",
    choices: [
      "The escrowed taxes and insurance change, and the escrow analysis adjusts the monthly collection.",
      "The lender may adjust the note rate annually on a fixed loan.",
      "The amortization schedule recalculates each year.",
      "The servicer adds a fee for administering the account."
    ],
    correctChoice: 0,
    rationale: "Principal and interest are fixed; the escrow portion is not. This is the explanation a borrower needs at origination rather than in year two." },
  { source: { assignment: "assignment-13", section: "2.3" },
    prompt: "Why does the escrow shortage surprise California buyers in particular?",
    choices: [
      "The property is reassessed on change of ownership, so the first year's escrow was collected against the prior owner's lower assessment.",
      "California requires escrow accounts on all loans.",
      "California prohibits escrow analysis in the first year.",
      "California taxes are billed annually rather than semiannually."
    ],
    correctChoice: 0,
    rationale: "Reassessment plus a supplemental bill produces a shortage and a higher ongoing collection, and it is entirely predictable at origination." },
  { source: { assignment: "assignment-13", section: "3.2" },
    prompt: "Why does a payoff demand exceed the balance shown on the borrower's statement?",
    choices: [
      "It includes interest to the payoff date, plus any fees, advances, and amounts the servicer is entitled to collect.",
      "It includes a prepayment penalty on every loan.",
      "It includes the remaining scheduled interest for the full term.",
      "It includes the servicer's estimate of future escrow needs."
    ],
    correctChoice: 0,
    rationale: "Per diem interest to the payoff date is the main difference, which is why the good-through date matters as much as the figure." },
  { source: { assignment: "assignment-13", section: "4.5" },
    prompt: "A distressed borrower asks what a short sale will do to his credit and his taxes. What may the licensee say?",
    choices: [
      "That those consequences are real and belong to a credit counselor, a tax advisor, and counsel — and that whether a lienholder approves anything is the lienholder's decision.",
      "A general summary of the credit and tax effects, with a caveat.",
      "That lienholders usually approve because the alternative costs them more.",
      "That the consequences are minor compared with a foreclosure."
    ],
    correctChoice: 0,
    rationale: "A general summary is still advice the borrower will act on, and predicting a third party's approval is an assurance the licensee cannot make." },
  { source: { assignment: "assignment-13", section: "4.6" },
    prompt: "Which pattern indicates foreclosure rescue fraud?",
    choices: [
      "An up-front fee for a promised loan modification, or a title transfer with a promised leaseback and repurchase.",
      "A servicer requesting updated income documentation.",
      "A borrower being offered a repayment plan for the arrearage.",
      "A trustee recording a notice of default."
    ],
    correctChoice: 0,
    rationale: "Up-front fees and title transfers with promised buybacks target exactly this borrower, and a licensee who encounters one raises it with the broker immediately." },
  { source: { assignment: "assignment-13", section: "6.8" },
    prompt: "What does origination owe servicing?",
    choices: [
      "An accurate file and a borrower who was actually told how his loan works, because most servicing complaints are origination failures arriving late.",
      "A warranty that the borrower will not default.",
      "A copy of the marketing materials used to obtain the loan.",
      "Nothing, since servicing is a separate business function."
    ],
    correctChoice: 0,
    rationale: "The escrow surprise, the adjustment surprise, and the payoff surprise all trace back to an explanation that was never given." },
  /* Assignment 14 — Fair lending, fraud prevention, and ethical mortgage practice */
  { source: { assignment: "assignment-14", section: "1.2" },
    prompt: "Which basis is protected by the Fair Housing Act but is not among ECOA's prohibited bases?",
    choices: [
      "Familial status.",
      "Marital status.",
      "Receipt of public assistance income.",
      "Age, with capacity to contract."
    ],
    correctChoice: 0,
    rationale: "Familial status and disability are distinctive to the Fair Housing Act; the other three are distinctive to ECOA. Neither list contains the other." },
  { source: { assignment: "assignment-14", section: "2.1" },
    prompt: "What is redlining?",
    choices: [
      "Denying or varying the terms of credit or insurance by area rather than by the characteristics of the applicant or the transaction.",
      "Charging a higher rate to applicants with weaker credit.",
      "Declining an application that fails the lender's stated criteria.",
      "Marketing more heavily in areas where the firm already has customers."
    ],
    correctChoice: 0,
    rationale: "Redlining operates by geography. Risk-based pricing and criteria-based denials are not redlining, though marketing reach can be one of its modern forms." },
  { source: { assignment: "assignment-14", section: "2.6" },
    prompt: "Why is discouragement the hardest fair lending violation to detect?",
    choices: [
      "It produces a denial with no record of one, because no application was ever taken.",
      "It occurs only in advertising, which is rarely reviewed.",
      "It requires proof of the originator's state of mind.",
      "It is committed by lenders rather than by originators."
    ],
    correctChoice: 0,
    rationale: "Deterring an application leaves nothing in the denial data, which is why ECOA reaches the application process itself and why inquiry records matter." },
  { source: { assignment: "assignment-14", section: "3.2" },
    prompt: "A file states owner occupancy and contains a lease for the same property signed by the borrower as landlord, dated before the application. What is the correct response?",
    choices: [
      "Escalate — the file contains evidence contradicting a material representation, which is not an ambiguity to resolve by asking.",
      "Ask the borrower to explain the discrepancy and proceed on his answer.",
      "Remove the lease from the file, since it was not requested.",
      "Note it and let underwriting decide."
    ],
    correctChoice: 0,
    rationale: "Where the file contradicts itself on a material point, the response is escalation. Affordability and the borrower's explanation are beside the point." },
  { source: { assignment: "assignment-14", section: "5.4" },
    prompt: "How should an escalation about suspected fraud be written?",
    choices: [
      "As observations with dates and sources, addressed to the responsible broker, without conclusions or legal characterizations.",
      "As a clear statement of the scheme the originator believes is occurring.",
      "As an anonymous report to avoid retaliation.",
      "Orally, so that nothing written can be produced later."
    ],
    correctChoice: 0,
    rationale: "A conclusion is the originator's opinion and exposes him if wrong; a fact is a fact. The broker draws the conclusion and determines reporting." },
  { source: { assignment: "assignment-14", section: "5.6" },
    prompt: "An originator is instructed by his own manager to submit a document he knows is inaccurate. What is the position?",
    choices: [
      "He does not perform the act, and documenting the instruction does not transfer responsibility — it documents that he knew.",
      "He performs it and records that the instruction came from the manager.",
      "He performs it if the manager puts the instruction in writing.",
      "He resigns without reporting the instruction."
    ],
    correctChoice: 0,
    rationale: "\"I told my manager and he said to keep going\" appears in enforcement matters repeatedly, and it is not a defense." },
  /* Assignment 15 — Integrated California mortgage brokerage file */
  { source: { assignment: "assignment-15", section: "1.2" },
    prompt: "Which four things does the first conversation settle, usually without anyone saying so?",
    choices: [
      "Capacity, authority, scope, and compensation.",
      "Rate, term, points, and closing date.",
      "Property, price, down payment, and loan amount.",
      "Credit, income, assets, and employment."
    ],
    correctChoice: 0,
    rationale: "None of the four is difficult to state; they go unstated because the conversation is friendly, and then the file has no record that the consumer was told any of it." },
  { source: { assignment: "assignment-15", section: "2.3" },
    prompt: "Why is disposition coding described as substantive rather than clerical?",
    choices: [
      "Coding a denial as a withdrawal removes the applicant from the denial data and from the adverse action notice he was owed.",
      "Because the code determines the brokerage's compensation for the file.",
      "Because the code sets the retention period for the file.",
      "Because the lender selects the code and the broker records it."
    ],
    correctChoice: 0,
    rationale: "Where it happens more readily to some applicants than others, it produces exactly the pattern that is invisible in the data — discouragement with no denial recorded." },
  { source: { assignment: "assignment-15", section: "2.6" },
    prompt: "Three sources disagree about a material fact in a file. When is the correct response escalation rather than inquiry?",
    choices: [
      "When the file contains evidence contradicting a material representation, as distinct from an ambiguity such as a name variant or a rounding difference.",
      "Whenever any two documents state different figures.",
      "Only after the lender raises the discrepancy as a condition.",
      "Only where the borrower declines to explain."
    ],
    correctChoice: 0,
    rationale: "Inquire on ambiguity; escalate on contradiction. Resolving a contradiction himself is how a person who was not part of a fraud becomes part of one." },
  { source: { assignment: "assignment-15", section: "4.2" },
    prompt: "What is the rule for clearing an underwriting condition?",
    choices: [
      "Evidence obtained from its source, in the form the source produces it.",
      "Any document that answers the underwriter's question.",
      "Whatever the underwriter will accept to release the condition.",
      "A written explanation from the party best able to describe the facts."
    ],
    correctChoice: 0,
    rationale: "A narrative from anyone is not the answer to a question about where money came from. The source documents are." },
  { source: { assignment: "assignment-15", section: "5.4" },
    prompt: "What must reconcile exactly at closing?",
    choices: [
      "Compensation as disclosed, compensation actually received, and the party the disclosure named as paying it.",
      "The appraised value and the contract price.",
      "The borrower's stated income and the income used in underwriting.",
      "The estimated and final closing dates."
    ],
    correctChoice: 0,
    rationale: "A discrepancy between disclosed and received compensation is discoverable by comparing two documents the brokerage produced itself, on the one subject the consumer cannot independently verify." },
  { source: { assignment: "assignment-15", section: "6.5" },
    prompt: "Which set of questions resolves a mortgage situation the course did not cover?",
    choices: [
      "What is my capacity and what does it authorize, what has already started running, does the consumer have what this decision requires, and what will the file show.",
      "What does the lender want, what will close fastest, what is customary, and what has worked before.",
      "What does the borrower prefer, what is least disruptive, what is defensible later, and what can be corrected afterward.",
      "What does the form require, what did the last file do, what will the processor accept, and what will the auditor look for."
    ],
    correctChoice: 0,
    rationale: "Almost every mortgage obligation is a clock started by an event, and if you cannot say what has started, something has and unnoticed." },
  /* Integrative items — each answer requires material from more than one assignment */
  { source: { assignment: "assignment-05", section: "1.3" },
    crossReferences: [{ assignment: "assignment-09", section: "1.2" }],
    prompt: "A consumer emails describing the property he is buying, its price, his down payment, his income, and attaches a form bearing his Social Security number. The originator sends the Loan Estimate nine days later, dated from the day the consumer signed the brokerage's intake form. What is the defect?",
    choices: [
      "The application arose when the email arrived, so the disclosure timing was measured from the wrong event — and the credit pull date will show it.",
      "None, because the disclosure clock runs from the signed intake form.",
      "None, because the consumer did not request a Loan Estimate.",
      "The email is not an application because it was not submitted through the brokerage's portal."
    ],
    correctChoice: 0,
    rationale: "All six items were in hand, and the trigger does not wait for a signature, a form, or the originator's readiness. A permissible purpose to pull credit existed by virtue of an application the file says had not occurred." },
  { source: { assignment: "assignment-09", section: "2.3" },
    crossReferences: [{ assignment: "assignment-08", section: "2.6" }],
    prompt: "A borrower pays the broker directly and the lender also pays the broker a rebate on the same transaction. What must be examined?",
    choices: [
      "The dual compensation restriction — the arrangement determines who may pay, and the brokerage does not collect from both sides where the restriction applies.",
      "Only whether both amounts appear on the Closing Disclosure.",
      "Only whether the total is reasonable for the work performed.",
      "Nothing, provided the borrower consented in writing."
    ],
    correctChoice: 0,
    rationale: "Disclosure of both amounts does not answer whether both may be received, and consent does not cure a restriction on the arrangement itself." },
  { source: { assignment: "assignment-14", section: "3.5" },
    crossReferences: [{ assignment: "assignment-11", section: "1.4" }],
    prompt: "A manager instructs an originator to send the appraiser three sales the manager selected and to use an appraiser 'whose numbers come in.' How are the two instructions assessed?",
    choices: [
      "Both communicate a target; selecting appraisers by favorable history is worse because it is systemic and appears in the brokerage's own ordering records.",
      "Only the appraiser-selection instruction is improper; supplying comparables is always permissible.",
      "Only the comparables instruction is improper; appraiser selection is a business decision.",
      "Neither is improper because the appraiser remains free to reject both."
    ],
    correctChoice: 0,
    rationale: "A set assembled by working backward from a figure is a target in another form, and the selection pattern affects every future file." },
  { source: { assignment: "assignment-06", section: "5.6" },
    crossReferences: [{ assignment: "assignment-10", section: "3.6" }],
    prompt: "A borrower is travelling and a condition requires an explanation for a large deposit. A processor drafts the letter on brokerage letterhead and signs the borrower's name with his emailed permission. How many distinct problems does this create?",
    choices: [
      "Three — the brokerage authored the borrower's account of a material fact, the condition was not cleared with source evidence, and a signature was applied that the borrower did not make.",
      "One — the signature, which the borrower's permission substantially cures.",
      "One — the delay, since the condition could have waited for the borrower's return.",
      "None, provided the substance of the explanation is true."
    ],
    correctChoice: 0,
    rationale: "The condition asks where the money came from, and the answer is source documents plus the borrower's own words. Truth of the substance does not cure authorship or the signature." },
  { source: { assignment: "assignment-13", section: "3.3" },
    crossReferences: [{ assignment: "assignment-11", section: "5.4" }],
    prompt: "Why does a payoff demand's good-through date belong on the originator's closing checklist?",
    choices: [
      "Per diem interest accrues after it, so a closing that slips past the date funds short unless the payoff is updated.",
      "Because the servicer will refuse to accept funds after the date.",
      "Because escrow cannot record without a current demand.",
      "Because the demand expires and the loan must be re-underwritten."
    ],
    correctChoice: 0,
    rationale: "The shortfall is arithmetic and entirely predictable, which is why the demand's date is reconciled along with every other figure on the statement." },
  { source: { assignment: "assignment-07", section: "2.6" },
    crossReferences: [{ assignment: "assignment-12", section: "6.6" }],
    prompt: "A brokerage proposes to refer borrowers to an escrow company it partly owns. What is the analysis?",
    choices: [
      "The affiliated business arrangement conditions are factual questions about the arrangement, and meeting them is not satisfied merely by providing a form.",
      "Ownership makes the referral permissible without further analysis.",
      "The referral is prohibited outright because of the ownership interest.",
      "Disclosure of the ownership interest cures any issue with the arrangement."
    ],
    correctChoice: 0,
    rationale: "Affiliated business arrangements have conditions; whether they are met turns on the arrangement's actual terms rather than on a disclosure being handed over." },
  { source: { assignment: "assignment-03", section: "5.4" },
    crossReferences: [{ assignment: "assignment-13", section: "3.4" }],
    prompt: "A borrower paid off a loan three years ago and no reconveyance appears of record. When does this surface?",
    choices: [
      "At his next transaction, when title work identifies the outstanding lien — which is why confirming the reconveyance is part of a payoff rather than an assumption.",
      "Immediately, because the servicer notifies the county.",
      "Never, since payment extinguishes the lien of record automatically.",
      "At the next property tax assessment."
    ],
    correctChoice: 0,
    rationale: "Payment satisfies the obligation; the record is cleared by the reconveyance, and whether it was recorded is a question with an answer." },
  { source: { assignment: "assignment-04", section: "6.4" },
    crossReferences: [{ assignment: "assignment-14", section: "6.6" }],
    prompt: "A borrower with two young children, nine years of salaried employment, and four months of reserves says he expects to stay 'probably forever.' Which presentation error is most likely?",
    choices: [
      "Presenting an adjustable product on its initial payment without the worst case, when his profile and thin reserves make payment shock the central question.",
      "Presenting a fixed-rate product without discussing points.",
      "Presenting more than one option, which confuses a borrower with a clear intention.",
      "Asking about his holding period, which is the lender's question rather than the originator's."
    ],
    correctChoice: 0,
    rationale: "The initial payment is the one figure guaranteed to be true for the shortest time, and the suitability facts are exactly what nobody else in the transaction asks about." },
  { source: { assignment: "assignment-10", section: "2.2" },
    crossReferences: [{ assignment: "assignment-15", section: "3.2" }],
    prompt: "A disclosure was emailed to an address the consumer never consented to receive documents at. What is the consequence?",
    choices: [
      "The file may not be able to establish delivery, because electronic delivery carries its own consent requirements and the consent is itself a document the file must hold.",
      "None, provided the consumer actually read the message.",
      "None, provided the address appears somewhere in the file.",
      "The disclosure must be re-sent by mail in every case."
    ],
    correctChoice: 0,
    rationale: "Delivery is where the consumer's protection attaches and the file is what proves it happened. Actual receipt is not what the file can show." },
  { source: { assignment: "assignment-01", section: "6.7" },
    crossReferences: [{ assignment: "assignment-15", section: "6.4" }],
    prompt: "An examination finds a missing California disclosure statement on six of twenty files. What does that tell the responsible broker?",
    choices: [
      "It is a procedure failure rather than one originator's carelessness, and no amount of counseling one person changes a process that does not produce the document.",
      "It is an individual performance issue to address with the originator.",
      "It is immaterial because the federal disclosures were delivered.",
      "It can be cured by producing the six statements now with application-era dates."
    ],
    correctChoice: 0,
    rationale: "Six of twenty means the process does not produce it. Producing them now with back-dates is the one response that converts a survivable finding into falsification." },
];

/* Form B is the retake form RE 303 p.4 requires: a second full examination on the same
   material with different questions. It must not repeat a Form A item. */
const formB = [
];

export default {
  courseId: "ca-mortgage-loan-brokering-lending-45",
  forms: { A: formA, B: formB }
};
