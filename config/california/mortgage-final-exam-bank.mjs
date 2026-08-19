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
  /* Assignment 01 — California mortgage brokerage and regulatory structure */
  { source: { assignment: "assignment-01", section: "1.3" },
    prompt: "What does a California real estate broker's mortgage authority NOT include?",
    choices: [
      "Activity that another licensing framework governs, which the broker license does not reach.",
      "Arranging loans secured by residential property for compensation.",
      "Negotiating loan terms on a borrower's behalf.",
      "Advertising the availability of mortgage brokerage services."
    ],
    correctChoice: 0,
    rationale: "Naming the authority that permits a new activity, before it begins, is the operating rule — reasoning by analogy from a familiar framework is how a brokerage gets one wrong." },
  { source: { assignment: "assignment-01", section: "2.4" },
    prompt: "How do the individual and company requirements relate under the endorsement framework?",
    choices: [
      "Both exist — the individual performing the activity and the entity through which it is performed each carry their own obligations.",
      "The company's registration covers every individual it employs.",
      "The individual's endorsement covers the company's activity.",
      "Only the entity is required to register where all originators are employees."
    ],
    correctChoice: 0,
    rationale: "The obligations are separate and neither absorbs the other, which is why a licensee confirms both before performing the activity." },
  { source: { assignment: "assignment-01", section: "4.3" },
    prompt: "How should an exemption from a licensing requirement be treated?",
    choices: [
      "As narrow and specific — the burden of establishing that it applies rests on the person relying on it.",
      "As broad, since exemptions exist to keep ordinary business out of regulation.",
      "As permanent once relied on in a prior transaction.",
      "As applying to every framework once it applies to one."
    ],
    correctChoice: 0,
    rationale: "An exemption from one requirement is not a general release, which is the error that produces unlicensed activity by people who believed they had checked." },
  { source: { assignment: "assignment-01", section: "5.3" },
    prompt: "Why is mortgage supervision harder than sales supervision?",
    choices: [
      "The obligations run on clocks started by events rather than on visible transaction milestones, so a failure leaves nothing to notice.",
      "Mortgage transactions involve more parties than sales transactions.",
      "Mortgage licensees work remotely more often than sales licensees.",
      "Mortgage files are larger and take longer to review."
    ],
    correctChoice: 0,
    rationale: "A disclosure not delivered on time looks exactly like one delivered on time until someone checks the dates, which is why review points are defined rather than triggered by problems." },
  { source: { assignment: "assignment-01", section: "6.5" },
    prompt: "A borrower sends a complaint alleging he was misled about his payment. What is the correct first step?",
    choices: [
      "Notify the broker, preserve everything, and reconstruct what the file shows before responding.",
      "Reply immediately with an explanation of what the borrower misunderstood.",
      "Forward the complaint to the lender for a response.",
      "Wait to see whether the borrower escalates it further."
    ],
    correctChoice: 0,
    rationale: "The first response sets the trajectory, and a reply written from memory is how a service problem becomes a credibility problem." },
  { source: { assignment: "assignment-01", section: "6.7" },
    prompt: "Why is the record described as the defense?",
    choices: [
      "The process is largely documentary, and recollection, sincerity, and explanation carry very little against a record that says something else — and almost none against a record that says nothing.",
      "Because a complete record prevents complaints from being filed.",
      "Because regulators accept a brokerage's own summary of its files.",
      "Because a record shifts responsibility to the party who created each document."
    ],
    correctChoice: 0,
    rationale: "The file answers the questions an investigation asks, or it does not. Nothing about a good record prevents a complaint." },
  /* Assignment 02 — Money, interest, notes, and loan mathematics */
  { source: { assignment: "assignment-02", section: "1.5" },
    prompt: "What does it mean that residential mortgage interest is generally paid in arrears?",
    choices: [
      "A payment covers interest that accrued during the preceding period rather than the coming one.",
      "The borrower is behind on the loan.",
      "Interest is added to principal each month.",
      "The lender bills interest annually rather than monthly."
    ],
    correctChoice: 0,
    rationale: "This is why a payoff includes per diem interest to the payoff date and why the first payment date falls where it does." },
  { source: { assignment: "assignment-02", section: "2.5" },
    prompt: "How does a shorter term affect an amortized loan?",
    choices: [
      "The payment rises and the total interest paid over the loan falls.",
      "The payment falls and total interest rises.",
      "The payment and total interest both fall.",
      "The payment rises and total interest rises."
    ],
    correctChoice: 0,
    rationale: "Principal is retired faster, so less interest accrues in total even though each payment is larger." },
  { source: { assignment: "assignment-02", section: "3.3" },
    prompt: "Which note provision most directly affects what a borrower can do with the property later?",
    choices: [
      "The alienation clause, which can make the balance due on transfer.",
      "The late charge provision.",
      "The interest accrual convention.",
      "The place-of-payment provision."
    ],
    correctChoice: 0,
    rationale: "It is the clause borrowers are most often surprised by, and explaining it at origination is the point of the plain-language obligation." },
  { source: { assignment: "assignment-02", section: "4.2" },
    prompt: "A borrower pays 1.5 points to reduce his payment by $92 a month. Approximately how long is the break-even on a $380,000 loan?",
    choices: [
      "About 62 months.",
      "About 41 months.",
      "About 24 months.",
      "About 96 months."
    ],
    correctChoice: 0,
    rationale: "$380,000 × 0.015 = $5,700; $5,700 ÷ $92 ≈ 62 months. The break-even is what makes points a question about the borrower's holding period." },
  { source: { assignment: "assignment-02", section: "6.3" },
    prompt: "What does PITI comprise?",
    choices: [
      "Principal, interest, taxes, and insurance.",
      "Principal, interest, term, and index.",
      "Payment, income, term, and interest.",
      "Principal, insurance, taxes, and impounds."
    ],
    correctChoice: 0,
    rationale: "It is the housing figure the qualifying ratios use, and a quote omitting taxes and insurance is a quote for a payment the borrower will not make." },
  { source: { assignment: "assignment-02", section: "6.8" },
    prompt: "What must accompany every figure a licensee states?",
    choices: [
      "Its basis — the rate, term, amount, and assumptions it rests on.",
      "A statement that the figure is not a guarantee.",
      "The name of the lender that supplied it.",
      "The date it was calculated."
    ],
    correctChoice: 0,
    rationale: "A payment stated with its five assumptions is a professional statement; the same number without them is a figure the borrower will hold the licensee to." },
  /* Assignment 03 — Security instruments and lien priority */
  { source: { assignment: "assignment-03", section: "1.4" },
    prompt: "Which clause in a deed of trust most often surprises borrowers?",
    choices: [
      "The due-on-sale provision, which can accelerate the balance on transfer of the property.",
      "The provision requiring the borrower to maintain the property.",
      "The provision naming the trustee.",
      "The provision requiring payment of property taxes."
    ],
    correctChoice: 0,
    rationale: "Maintenance, trustee designation, and tax payment are expected. Acceleration on transfer is the one borrowers plan around without knowing it exists." },
  { source: { assignment: "assignment-03", section: "1.5" },
    prompt: "What does the borrower retain under a California deed of trust?",
    choices: [
      "Possession, use, and the ownership interest for practical purposes, having conveyed an interest as security.",
      "Nothing until the loan is repaid, since title passes to the lender.",
      "A leasehold interest for the loan term.",
      "An equitable interest only, with no right to possession."
    ],
    correctChoice: 0,
    rationale: "The borrower remains the owner for practical purposes, which is the reassurance most borrowers need and rarely receive." },
  { source: { assignment: "assignment-03", section: "3.3" },
    prompt: "What is the trustee's role under a deed of trust?",
    choices: [
      "A neutral third party holding the power of sale, who reconveys on satisfaction or conducts the sale on default.",
      "The lender's agent, responsible for collecting payments.",
      "The borrower's representative in dealings with the lender.",
      "The title company that insured the transaction."
    ],
    correctChoice: 0,
    rationale: "The trustee's functions are reconveyance and the power of sale. Collection is the servicer's and insurance is the title insurer's." },
  { source: { assignment: "assignment-03", section: "4.2" },
    prompt: "Which describes inquiry notice?",
    choices: [
      "Notice arising from facts that would cause a reasonable person to investigate further.",
      "Notice imputed from the public record.",
      "Notice a person actually received.",
      "Notice published in a newspaper of general circulation."
    ],
    correctChoice: 0,
    rationale: "Constructive notice comes from the record and actual notice from having been told. Inquiry notice arises from circumstances — such as someone in possession who is not the record owner." },
  { source: { assignment: "assignment-03", section: "5.4" },
    prompt: "What does a reconveyance accomplish, and when should it be confirmed?",
    choices: [
      "It clears the deed of trust from the record on satisfaction, and it should be confirmed rather than assumed after a payoff.",
      "It transfers the property to the lender after default.",
      "It substitutes a new trustee under the instrument.",
      "It releases the borrower from personal liability while leaving the lien."
    ],
    correctChoice: 0,
    rationale: "Payment satisfies the obligation; the record is cleared by the reconveyance, and a missing one surfaces at the borrower's next transaction." },
  { source: { assignment: "assignment-03", section: "5.5" },
    prompt: "What does a partial reconveyance or release clause do?",
    choices: [
      "Releases a defined portion of the security from the lien on stated conditions, while the loan continues.",
      "Reduces the loan balance in proportion to the released property.",
      "Terminates the deed of trust as to all parcels.",
      "Subordinates the lien to a later-recorded instrument."
    ],
    correctChoice: 0,
    rationale: "It releases collateral rather than debt, which is why the conditions attached to it matter to both the borrower and the lender." },
  { source: { assignment: "assignment-04", section: "1.4" },
    prompt: "What consequence of the secondary market matters most to an originator?",
    choices: [
      "Loans must meet the standards of whoever will buy them, so the guidelines an originator works to are set outside the transaction.",
      "The originator selects which investor will purchase the loan.",
      "The borrower's rate is set by the investor at closing.",
      "The originator retains servicing on every loan sold."
    ],
    correctChoice: 0,
    rationale: "Investor and agency standards define what a file must contain, which is why 'the lender is being difficult' is usually the lender applying a standard it did not write." },
  { source: { assignment: "assignment-04", section: "2.4" },
    prompt: "Why does the funding source affect the borrower?",
    choices: [
      "It affects the products available, the pricing, the timeline, and who holds the decision — which the borrower cannot see from the outside.",
      "It determines whether the loan may be sold in the secondary market.",
      "It determines whether the borrower may escrow taxes and insurance.",
      "It has no effect, since all lenders apply the same underwriting standards."
    ],
    correctChoice: 0,
    rationale: "Channel affects availability, price, and speed. Underwriting standards are not identical across lenders even for the same program." },
  { source: { assignment: "assignment-04", section: "3.5" },
    prompt: "Which point about government-backed programs affects a seller's decision on an offer?",
    choices: [
      "Program requirements about the property's condition and the appraisal can affect what must be repaired before closing.",
      "The buyer's rate is lower, so the offer is more likely to close.",
      "The agency purchases the property if the buyer defaults.",
      "The seller must pay the buyer's closing costs on such loans."
    ],
    correctChoice: 0,
    rationale: "Property condition requirements are the practical point a seller weighs. The other statements are not accurate descriptions of the programs." },
  { source: { assignment: "assignment-04", section: "4.6" },
    prompt: "What should a borrower understand about a rate lock?",
    choices: [
      "It protects the rate for a defined period on defined terms, it can expire, and extending it may carry a cost.",
      "It guarantees the loan will be approved.",
      "It is effective when the originator quotes the rate verbally.",
      "It may be re-priced by the borrower if rates fall."
    ],
    correctChoice: 0,
    rationale: "A lock addresses price, not approval, and it is effective on the lender's terms rather than on a conversation." },
  { source: { assignment: "assignment-04", section: "4.7" },
    prompt: "What is a temporary buydown?",
    choices: [
      "Funds applied to reduce the borrower's payment for an initial period, after which the payment rises to the note rate.",
      "A permanent reduction of the note rate purchased with points.",
      "A reduction of the loan balance funded by the seller.",
      "A deferral of interest that is added to principal."
    ],
    correctChoice: 0,
    rationale: "The payment rises on schedule, which is precisely the feature requiring a plain-language explanation with its numbers." },
  { source: { assignment: "assignment-04", section: "6.5" },
    prompt: "What is the recurring failure in product presentation?",
    choices: [
      "Presenting the option the originator expects the borrower to choose, on its most favorable figure, rather than every option on a common basis.",
      "Presenting too many options, which overwhelms the borrower.",
      "Presenting products the borrower has not been approved for.",
      "Presenting written figures rather than explaining them verbally."
    ],
    correctChoice: 0,
    rationale: "The presentation that made the decision for the borrower is the failure, and the option a file omits is what later disputes are about." },
  /* Assignment 05 — Loan application, borrower qualification, and file assembly */
  { source: { assignment: "assignment-05", section: "2.3" },
    prompt: "How is variable or self-employment income generally treated in qualification?",
    choices: [
      "It is documented over a period and averaged or otherwise analyzed on the program's terms, rather than taken from the most recent month.",
      "It is excluded from qualifying income entirely.",
      "It is counted at the highest amount received in the last two years.",
      "It is counted only if the borrower also has salaried income."
    ],
    correctChoice: 0,
    rationale: "The point is stability over a period. Neither exclusion nor selecting the best month reflects how the analysis works." },
  { source: { assignment: "assignment-05", section: "2.6" },
    prompt: "Which obligation belongs in the borrower's liabilities for ratio purposes?",
    choices: [
      "A debt the borrower co-signed for another person, unless the program's conditions for excluding it are met.",
      "A utility bill paid monthly.",
      "A monthly grocery budget.",
      "A voluntary retirement contribution."
    ],
    correctChoice: 0,
    rationale: "A co-signed obligation is an obligation whether or not the borrower thinks of it as his. Living expenses and voluntary savings are not liabilities for this purpose." },
  { source: { assignment: "assignment-05", section: "3.4" },
    prompt: "What may a licensee say to a borrower about his credit?",
    choices: [
      "Explain what the report contains and direct disputes to the reporting agency and the lender — without advising how to improve a score or interpreting the file's effect on approval.",
      "Advise which accounts to pay down to raise the score before application.",
      "Tell the borrower whether his score is sufficient for approval.",
      "Offer to dispute inaccurate items on the borrower's behalf."
    ],
    correctChoice: 0,
    rationale: "Score coaching, approval predictions, and acting as the borrower's dispute agent all exceed the role." },
  { source: { assignment: "assignment-05", section: "4.3" },
    prompt: "Which pattern contradicts a stated owner-occupancy?",
    choices: [
      "A lease for the subject property signed by the borrower as landlord, dated before the application.",
      "A borrower who owns another property.",
      "A borrower whose employer is located in another county.",
      "A borrower purchasing a property larger than his current residence."
    ],
    correctChoice: 0,
    rationale: "The lease is evidence in the file contradicting a material representation. The other three are ordinary facts that raise no contradiction." },
  { source: { assignment: "assignment-05", section: "5.3" },
    prompt: "Which error most often produces a wrong debt-to-income ratio?",
    choices: [
      "Omitting the housing payment from the total obligations, or using gross and net income inconsistently between the two ratios.",
      "Including the borrower's co-signed obligations.",
      "Using the fully indexed payment on an adjustable product.",
      "Counting documented bonus income over a two-year average."
    ],
    correctChoice: 0,
    rationale: "The total ratio includes the housing payment, and the income basis must be the same in both ratios. The other three are correct practice." },
  { source: { assignment: "assignment-05", section: "6.4" },
    prompt: "A borrower discloses adverse information about his own credit history. What is the correct handling?",
    choices: [
      "Record it, transmit it, and let the lender evaluate it — never omit it, minimize it, or coach the borrower on how to present it.",
      "Omit it, since the credit report will disclose it independently.",
      "Advise the borrower on how to explain it most favorably.",
      "Decline the file, since disclosed adverse information will produce a denial."
    ],
    correctChoice: 0,
    rationale: "Omission and coaching are both ways of shaping what the lender relies on, and adverse information is frequently explainable on its own facts." },
  /* Assignment 06 — Underwriting, appraisal, title, and conditions */
  { source: { assignment: "assignment-06", section: "1.3" },
    prompt: "Which factors does the ability-to-repay determination consider?",
    choices: [
      "Income or assets, employment status, the payment on the loan and on simultaneous loans, other obligations, and credit history.",
      "The appraised value and the loan-to-value ratio alone.",
      "The borrower's credit score alone.",
      "The lender's automated decision, without further analysis."
    ],
    correctChoice: 0,
    rationale: "The determination is multi-factor and rests on verified information. Collateral and a score are inputs rather than the determination." },
  { source: { assignment: "assignment-06", section: "2.1" },
    prompt: "What does an automated underwriting decision represent?",
    choices: [
      "A recommendation produced from the data entered, which the file must then actually support with documentation.",
      "A final approval binding on the lender.",
      "A verification of the data the originator entered.",
      "A determination of the property's value."
    ],
    correctChoice: 0,
    rationale: "The recommendation is only as good as the data entered, and the conditions that follow are where the file proves it." },
  { source: { assignment: "assignment-06", section: "2.4" },
    prompt: "Why are underwriting exceptions a fair lending issue and not only a credit issue?",
    choices: [
      "Exceptions granted more readily to some applicants than others, without a documented neutral basis, are exactly the pattern an examination looks for — and each exception is itself the evidence.",
      "Because exceptions require agency approval before they may be granted.",
      "Because exceptions must be reported to the borrower in writing.",
      "Because exceptions void the ability-to-repay determination."
    ],
    correctChoice: 0,
    rationale: "Every exception was recorded, so the pattern is visible, and the rationale must be one someone else could apply to a similar file." },
  { source: { assignment: "assignment-06", section: "3.4" },
    prompt: "What is the reconsideration of value process for?",
    choices: [
      "Submitting additional data through the prescribed channel, with the appraiser free to accept or reject it.",
      "Requesting a different appraiser after an unfavorable report.",
      "Asking the lender to disregard the appraisal.",
      "Negotiating the value directly with the appraiser."
    ],
    correctChoice: 0,
    rationale: "It is a channel for data rather than for pressure, and it exists precisely so that the appraiser's independence is preserved." },
  { source: { assignment: "assignment-06", section: "5.4" },
    prompt: "What is the re-verification problem near closing?",
    choices: [
      "Employment, credit, and funds may be re-verified before funding, so a change the borrower made after approval can defeat the loan.",
      "The appraisal may expire and require a new report.",
      "The title report must be updated to the date of recording.",
      "The rate lock may expire before documents are drawn."
    ],
    correctChoice: 0,
    rationale: "The others are real scheduling risks. Re-verification is the one that turns a borrower's own ordinary act into a failed closing." },
  { source: { assignment: "assignment-06", section: "6.5" },
    prompt: "How should a file be coded where the applicant did not supply requested documentation after a proper notice?",
    choices: [
      "Incomplete, on the terms the framework defines — not withdrawn.",
      "Withdrawn by applicant, since he discontinued participation.",
      "Denied, since the file could not be approved.",
      "Approved but not accepted."
    ],
    correctChoice: 0,
    rationale: "Incompleteness has its own definition and its own notice, and coding it as a withdrawal removes the applicant from the data the framework relies on." },
  /* Assignment 07 — Federal mortgage law framework */
  { source: { assignment: "assignment-07", section: "1.4" },
    prompt: "What is the finance charge?",
    choices: [
      "The cost of consumer credit expressed as a dollar amount, comprising the charges the framework defines as finance charges.",
      "The total of all closing costs the borrower pays.",
      "The interest the borrower will pay over the full loan term.",
      "The lender's compensation on the transaction."
    ],
    correctChoice: 0,
    rationale: "It is a defined subset of costs, which is why two loans at the same note rate can carry different APRs — and why not every closing cost is a finance charge." },
  { source: { assignment: "assignment-07", section: "1.8" },
    prompt: "What does Regulation Z require when an advertisement states a specific credit term?",
    choices: [
      "Additional disclosures required by the framework accompany it, so a triggering term cannot be advertised alone.",
      "The advertisement must include the lender's license number only.",
      "The advertisement must be approved by the lender before publication.",
      "The term must be available to every consumer who applies."
    ],
    correctChoice: 0,
    rationale: "Stating a term without its accompanying disclosures is the classic mortgage advertising defect." },
  { source: { assignment: "assignment-07", section: "2.9" },
    prompt: "What are the notice of error and request for information procedures for?",
    choices: [
      "Defined channels through which a borrower raises a servicing error or seeks information, with defined response obligations.",
      "The lender's internal complaint process during origination.",
      "The mechanism for disputing a credit report entry.",
      "The process for requesting a payoff demand."
    ],
    correctChoice: 0,
    rationale: "They are defined servicing procedures with response obligations, which is why a borrower's complaint is routed into them rather than handled informally." },
  { source: { assignment: "assignment-07", section: "3.6" },
    prompt: "What must an applicant receive regarding appraisals and other written valuations?",
    choices: [
      "Copies promptly upon completion, on the terms the framework requires, whether or not the loan closes.",
      "A copy only on written request after closing.",
      "A copy only where the value supports the transaction.",
      "A summary of the value, without the report itself."
    ],
    correctChoice: 0,
    rationale: "The right does not depend on the outcome or on a request, and it is the report rather than a summary." },
  { source: { assignment: "assignment-07", section: "4.4" },
    prompt: "Why is data accuracy under HMDA an originator's problem rather than a compliance department's?",
    choices: [
      "The data is assembled from what originators record in files, so an error entered at origination becomes a reported error the firm must defend.",
      "Because originators submit the data directly to the regulator.",
      "Because inaccurate data voids the loan.",
      "Because originators are personally penalized for reporting errors."
    ],
    correctChoice: 0,
    rationale: "The reported data comes from the files, and the pricing and disposition fields are exactly where a careless entry becomes a pattern in the data." },
  { source: { assignment: "assignment-07", section: "5.4" },
    prompt: "What does risk-based pricing notice address?",
    choices: [
      "Notifying a consumer when credit is granted on terms materially less favorable than those available to a substantial proportion of consumers, based on a consumer report.",
      "Disclosing the lender's pricing model to every applicant.",
      "Notifying the consumer of the interest rate before application.",
      "Reporting pricing disparities to the regulator."
    ],
    correctChoice: 0,
    rationale: "It is a consumer notice tied to report-based pricing, distinct from adverse action and from the firm's own data reporting." },
  /* Assignment 08 — Broker mortgage activities, trust funds, and records */
  { source: { assignment: "assignment-08", section: "1.2" },
    prompt: "Which two roles must a California broker distinguish in a mortgage transaction?",
    choices: [
      "Acting as an agent arranging a loan for another, and acting as a principal making or buying the loan.",
      "Acting as a listing agent and as a selling agent.",
      "Acting as a servicer and as an escrow holder.",
      "Acting as an employer and as an independent contractor."
    ],
    correctChoice: 0,
    rationale: "The capacity determines which duties run, which disclosures are owed, and how compensation may be structured — and it follows from what actually happened." },
  { source: { assignment: "assignment-08", section: "1.5" },
    prompt: "What is threshold activity, in general terms?",
    choices: [
      "Mortgage activity exceeding defined levels, which carries additional reporting and compliance obligations.",
      "The minimum activity required to maintain a license.",
      "The point at which a broker must obtain an endorsement.",
      "The maximum number of loans a broker may arrange in a year."
    ],
    correctChoice: 0,
    rationale: "Crossing the threshold adds obligations rather than removing them, and it is measured against the framework's own definitions." },
  { source: { assignment: "assignment-08", section: "1.7" },
    prompt: "Which is outside what a California broker may do in mortgage practice?",
    choices: [
      "Perform activity that a different licensing framework governs without holding the required authority.",
      "Arrange a loan funded by a private investor with proper disclosure.",
      "Receive compensation from a lender where the arrangement permits it.",
      "Advertise mortgage services with the required identification."
    ],
    correctChoice: 0,
    rationale: "The limit is the authority the license confers, which is why a new activity begins only after naming the authority that permits it." },
  { source: { assignment: "assignment-08", section: "2.6" },
    prompt: "How must a salesperson's mortgage compensation be paid?",
    choices: [
      "Through the employing broker, not directly from a borrower, lender, or other party.",
      "Directly by the lender, since the lender funds the loan.",
      "Directly by the borrower where the borrower engaged the salesperson.",
      "By whichever party the salesperson designates in writing."
    ],
    correctChoice: 0,
    rationale: "Compensation for licensed activity flows through the employing broker, which is the same rule that governs sales practice." },
  { source: { assignment: "assignment-08", section: "3.7" },
    prompt: "Why does signatory authority on a trust account matter?",
    choices: [
      "Because the broker's control over the account is part of the accounting duty, and who may withdraw is a control rather than an administrative convenience.",
      "Because the bank requires two signatures on all trust withdrawals.",
      "Because signatories are personally liable for the account balance.",
      "Because a signatory must hold a mortgage loan originator endorsement."
    ],
    correctChoice: 0,
    rationale: "The accounting duty is the broker's, and unassigned or loosely assigned withdrawal authority is how shortages occur without anyone deciding to cause one." },
  { source: { assignment: "assignment-08", section: "6.6" },
    prompt: "What actually prevents examination findings?",
    choices: [
      "Procedures that produce the document every time, and review at defined points rather than when something goes wrong.",
      "Training sessions held after each examination.",
      "A compliance manual distributed to every originator.",
      "Retaining counsel to attend the examination."
    ],
    correctChoice: 0,
    rationale: "A finding on six of twenty files is a process that does not produce the document, and no amount of counseling one originator changes it." },
  /* Assignment 09 — Mortgage disclosures, compensation, and closing costs */
  { source: { assignment: "assignment-09", section: "1.6" },
    prompt: "What must a file show about disclosure delivery?",
    choices: [
      "What was delivered, to whom, when, by what method, and with what proof.",
      "That the consumer signed the disclosure.",
      "That the disclosure was prepared within the required period.",
      "That the consumer did not object to the disclosure."
    ],
    correctChoice: 0,
    rationale: "Delivery is where the consumer's protection attaches, and a signature establishes execution rather than receipt." },
  { source: { assignment: "assignment-09", section: "2.3" },
    prompt: "What does the dual compensation restriction address?",
    choices: [
      "Receiving compensation from both the consumer and another party on the same transaction, which the arrangement determines whether it is permitted.",
      "Compensating two originators on a single loan.",
      "Receiving compensation on two loans for the same borrower.",
      "Compensation paid partly in cash and partly in leads."
    ],
    correctChoice: 0,
    rationale: "The restriction is about who pays on a single transaction, and it is separate from the term-based compensation prohibition." },
  { source: { assignment: "assignment-09", section: "2.4" },
    prompt: "What is steering, in the compensation context?",
    choices: [
      "Directing a consumer to a transaction because it benefits the originator, rather than on the consumer's interest.",
      "Presenting more than one loan product to a consumer.",
      "Recommending a lender the brokerage works with frequently.",
      "Declining to offer a product the brokerage does not sell."
    ],
    correctChoice: 0,
    rationale: "The structural protection is compensation that does not vary with which option the consumer selects, because then the presentation has no incentive to distort." },
  { source: { assignment: "assignment-09", section: "4.5" },
    prompt: "Which is NOT a changed circumstance supporting a revised disclosure?",
    choices: [
      "Discovering that a cost was underestimated when the original disclosure was prepared.",
      "An event beyond the parties' control affecting settlement charges after the estimate.",
      "Information the consumer provided that is later found inaccurate.",
      "A change the consumer requests that affects the transaction."
    ],
    correctChoice: 0,
    rationale: "An optimistic original estimate is not a changed circumstance — it is the habit that guarantees the variance and produces most tolerance failures." },
  { source: { assignment: "assignment-09", section: "5.2" },
    prompt: "What must a borrower understand about a prepayment penalty?",
    choices: [
      "When it applies, for how long, how it is calculated, and what it would cost him in the situations where he might pay the loan off.",
      "That it exists, which the disclosure states.",
      "That it may be waived at the lender's discretion.",
      "That it does not apply if the property is sold."
    ],
    correctChoice: 0,
    rationale: "Explaining every feature with its number is the standard; the mere existence of the feature is what the disclosure already says." },
  { source: { assignment: "assignment-09", section: "6.4" },
    prompt: "What does a consumer's signature on a disclosure establish?",
    choices: [
      "That the document was presented — not that its contents were explained or understood.",
      "That the consumer understood the terms described.",
      "That the originator complied with the presentation standard.",
      "That the consumer waived any objection to the terms."
    ],
    correctChoice: 0,
    rationale: "A complaint alleging the terms were not explained is answered by what the file shows about the earlier conversation, not by the signature." },
  /* Assignment 10 — Origination, processing, and closing workflow */
  { source: { assignment: "assignment-10", section: "1.5" },
    prompt: "What is a prequalification letter, accurately described to a consumer?",
    choices: [
      "An assessment based on information the consumer stated, not verified, and not a commitment to lend.",
      "A conditional approval subject only to the appraisal.",
      "A lender's commitment to fund at the stated amount.",
      "A verification that the consumer's income and assets support the amount."
    ],
    correctChoice: 0,
    rationale: "The three levels differ by what was actually verified and by whom, and describing a prequalification as more than it is misleads both the consumer and the seller." },
  { source: { assignment: "assignment-10", section: "2.4" },
    prompt: "When must the California mortgage loan disclosure statement be delivered?",
    choices: [
      "On its own California timing, independently of the federal disclosures.",
      "With the Closing Disclosure before consummation.",
      "Only if the borrower requests it.",
      "Within the same period as the Loan Estimate, which satisfies both."
    ],
    correctChoice: 0,
    rationale: "It is a separate California requirement with its own timing, and treating the federal form as covering it is a recurring DRE examination finding." },
  { source: { assignment: "assignment-10", section: "2.6" },
    prompt: "When should the wire fraud warning be given to a borrower?",
    choices: [
      "At application, and repeated in the closing week when the attack actually arrives.",
      "At closing, when wire instructions are issued.",
      "Only if the borrower asks about the transfer process.",
      "After funds have been sent, as a confirmation step."
    ],
    correctChoice: 0,
    rationale: "The warning has to precede the moment funds move, and repeating it in the closing week is when it is most likely to be read." },
  { source: { assignment: "assignment-10", section: "3.4" },
    prompt: "A file contains three small inconsistencies, each individually explainable. What does the pattern indicate?",
    choices: [
      "It is the moment to escalate — 'it doesn't add up but nothing is clearly false' is exactly how fraud presents.",
      "Nothing, since each item has an explanation.",
      "That the borrower is disorganized and needs help assembling documents.",
      "That the file should be submitted to a different lender."
    ],
    correctChoice: 0,
    rationale: "Fraud presents as a pattern of small explainable inconsistencies, which is why the pattern rather than any single item is the signal." },
  { source: { assignment: "assignment-10", section: "4.6" },
    prompt: "Why does the rate lock belong on the transaction calendar rather than in the originator's memory?",
    choices: [
      "It expires on a date, extending it may carry a cost, and the borrower's payment changes if it lapses.",
      "Because the lender will not fund without a current lock confirmation.",
      "Because the lock date determines the disclosure timing.",
      "Because the borrower may re-lock at a lower rate on request."
    ],
    correctChoice: 0,
    rationale: "An expired lock changes the borrower's economics through nobody's decision, which is the definition of an item that belongs in a system." },
  { source: { assignment: "assignment-10", section: "5.4" },
    prompt: "How does a rescindable transaction change the closing sequence?",
    choices: [
      "Disbursement waits until the rescission period has run without the consumer exercising the right.",
      "Signing occurs after the rescission period rather than before.",
      "Recording is deferred until after disbursement.",
      "The consumer must waive rescission for the transaction to close."
    ],
    correctChoice: 0,
    rationale: "The period sits between signing and disbursement. Waiver is available only on the framework's own narrow terms and is not the ordinary path." },
  { source: { assignment: "assignment-11", section: "1.3" },
    prompt: "Who may order an appraisal and communicate with the appraiser?",
    choices: [
      "Only those the independence framework permits, through the prescribed channel — which is why ordering is separated from the sales function.",
      "Any employee of the brokerage, provided no value is discussed.",
      "The borrower, who pays for the report.",
      "The listing agent, who knows the property best."
    ],
    correctChoice: 0,
    rationale: "Separating ordering and communication from the people with an interest in the outcome is the structural protection independence relies on." },
  { source: { assignment: "assignment-11", section: "1.6" },
    prompt: "What is appraisal bias?",
    choices: [
      "Valuation influenced by the race, national origin, or other protected characteristics of the occupants or the neighborhood rather than by the property and the market.",
      "An appraiser's preference for particular comparable sales.",
      "A value that differs from the contract price.",
      "An appraiser's reliance on a single approach to value."
    ],
    correctChoice: 0,
    rationale: "It is a fair lending problem in valuation, distinct from ordinary methodological disagreement or a low value." },
  { source: { assignment: "assignment-11", section: "2.2" },
    prompt: "What should an originator look for when reading an appraisal report critically?",
    choices: [
      "Whether the comparables are genuinely comparable, the direction and size of the adjustments, and any condition findings that create loan conditions.",
      "Whether the value matches the contract price.",
      "Whether the appraiser has worked with the brokerage before.",
      "Whether the report was delivered within the expected timeframe."
    ],
    correctChoice: 0,
    rationale: "Condition findings frequently become underwriting conditions, and heavy adjustment signals a weak comparable — neither of which shows up in the value alone." },
  { source: { assignment: "assignment-11", section: "3.5" },
    prompt: "Why does the mechanic's lien question arise at intake on a refinance?",
    choices: [
      "Because recent work on the property can produce a lien whose priority relates back ahead of the new loan.",
      "Because contractors must be paid before a refinance may close.",
      "Because the appraiser will value the improvements.",
      "Because permits must be finaled before recording."
    ],
    correctChoice: 0,
    rationale: "The relation-back feature is what makes recent work a title question rather than a valuation question, and it is asked at intake because it takes time to resolve." },
  { source: { assignment: "assignment-11", section: "4.7" },
    prompt: "Which funds a brokerage receives in a mortgage transaction are trust funds?",
    choices: [
      "Any funds belonging to another that come into the brokerage's possession, whatever the arrangement is called.",
      "Only funds the borrower pays for third-party services.",
      "Only funds received from investors in private money transactions.",
      "Only funds held for more than a defined period."
    ],
    correctChoice: 0,
    rationale: "Money belonging to another is trust money regardless of source, label, or how briefly it is held." },
  { source: { assignment: "assignment-11", section: "5.4" },
    prompt: "Which settlement statement lines does an originator reconcile?",
    choices: [
      "Loan amount and terms, each cost against its tolerance category, payoffs with their good-through dates, prorations, and compensation.",
      "Only the compensation line, since the rest is escrow's responsibility.",
      "Only the lines that changed from the Loan Estimate.",
      "Only the borrower's cash to close, which summarizes everything else."
    ],
    correctChoice: 0,
    rationale: "The cash figure should be the arithmetic result rather than the thing checked, and a figure that cannot be traced is a finding whether or not it is wrong." },
  { source: { assignment: "assignment-12", section: "1.4" },
    prompt: "What must an investor be told about the collateral in a private money loan?",
    choices: [
      "Enough about the property, its value, the position of the lien, and the borrower for the investor to evaluate the risk he is taking.",
      "Only the appraised value and the loan amount.",
      "Only the borrower's credit score.",
      "Only the interest rate and the term."
    ],
    correctChoice: 0,
    rationale: "The investor is a principal making a credit decision, and the disclosure is measured by what that decision requires." },
  { source: { assignment: "assignment-12", section: "2.5" },
    prompt: "Where is the consumer-versus-business purpose line genuinely hard?",
    choices: [
      "Where an owner-occupant borrows against his residence for a mixed purpose, part of which relates to a business.",
      "Where an investor borrows against a rental property he has never occupied.",
      "Where a borrower purchases his first home with a conventional loan.",
      "Where a business entity borrows against commercial property."
    ],
    correctChoice: 0,
    rationale: "The clear cases are clear. The mixed-purpose loan against the borrower's own residence is where the determination requires care and where errors run in both directions." },
  { source: { assignment: "assignment-12", section: "3.4" },
    prompt: "Which risk does a seller carrying financing most often not consider?",
    choices: [
      "That he is now a lender — with collection, default, and foreclosure exposure — rather than a seller who has been paid.",
      "That he must record the deed at closing.",
      "That the buyer will maintain the property.",
      "That the sale price may be questioned by the assessor."
    ],
    correctChoice: 0,
    rationale: "The seller has exchanged a paid sale for a credit position, and the consequences of that are what the disclosure obligations exist to surface." },
  { source: { assignment: "assignment-12", section: "5.6" },
    prompt: "What must never appear in an investor presentation?",
    choices: [
      "A projected return presented as an expectation rather than as an assumption, or a characterization of the loan as safe.",
      "The loan-to-value ratio and the position of the lien.",
      "The borrower's documented exit strategy.",
      "The property's condition and any known issues."
    ],
    correctChoice: 0,
    rationale: "The other three are exactly what the investor needs. A projection stated as an expectation and an assurance of safety are the two statements that produce claims." },
  { source: { assignment: "assignment-12", section: "6.4" },
    prompt: "Why does the phrase 'arranged by' matter in the usury exemption structure?",
    choices: [
      "Because the exemption depends on a licensee actually performing the arranging role, which is a factual question rather than a label on a document.",
      "Because the licensee must be named as a party to the note.",
      "Because the licensee must hold the funds in trust.",
      "Because the licensee must service the loan after closing."
    ],
    correctChoice: 0,
    rationale: "Whether the requirement is satisfied on particular facts is a legal question, and a form recital does not establish that the role was performed." },
  { source: { assignment: "assignment-12", section: "6.5" },
    prompt: "What counts toward the rate for usury purposes?",
    choices: [
      "More than the stated interest — charges the framework treats as interest are included, which is why the analysis is not read off the note rate.",
      "Only the interest stated in the note.",
      "Only interest and points, excluding all other fees.",
      "Whatever the lender designates as interest in the loan documents."
    ],
    correctChoice: 0,
    rationale: "Designation does not control, which is why the question goes to counsel rather than being settled by reading the note's rate line." },
  /* Assignment 13 — Servicing, payoff, default, and foreclosure */
  { source: { assignment: "assignment-13", section: "1.5" },
    prompt: "What happens when servicing is transferred?",
    choices: [
      "The obligation is unchanged; notice is required on defined terms, and payment protections apply during the transition.",
      "The loan terms are renegotiated with the new servicer.",
      "The borrower must reapply for escrow.",
      "The lien is re-recorded in the new servicer's name."
    ],
    correctChoice: 0,
    rationale: "A transfer changes who collects, not what is owed, and the notice and transition protections exist because borrowers otherwise pay the wrong party." },
  { source: { assignment: "assignment-13", section: "1.6" },
    prompt: "A former borrower calls his originator about a servicing problem. What should the originator do?",
    choices: [
      "Direct him to the servicer's defined notice of error or request for information procedures, and not attempt to resolve it on his behalf.",
      "Contact the servicer on the borrower's behalf to resolve it.",
      "Advise the borrower to withhold payment until it is corrected.",
      "Tell the borrower the matter is not the brokerage's concern."
    ],
    correctChoice: 0,
    rationale: "The defined procedures carry response obligations that an informal call does not, and advising withholding creates a default." },
  { source: { assignment: "assignment-13", section: "2.5" },
    prompt: "What should a borrower understand about waiving an escrow account?",
    choices: [
      "He becomes responsible for paying taxes and insurance directly and on time, and a lapse can produce lender-placed coverage and a default.",
      "The lender assumes responsibility for the payments regardless.",
      "The waiver reduces the total amount owed over the loan term.",
      "The waiver may be reversed by the borrower at any time."
    ],
    correctChoice: 0,
    rationale: "The obligation moves to the borrower, and the consequences of a missed tax or insurance payment are what the explanation at origination must cover." },
  { source: { assignment: "assignment-13", section: "4.2" },
    prompt: "Which is a loss mitigation option rather than a foreclosure step?",
    choices: [
      "A repayment plan, a forbearance, a modification, a short sale, or a deed in lieu.",
      "The notice of default.",
      "The notice of trustee's sale.",
      "The trustee's deed upon sale."
    ],
    correctChoice: 0,
    rationale: "The three rejected answers are steps in the nonjudicial sequence. Each loss mitigation option carries consequences borrowers do not expect, which is why they are routed rather than recommended." },
  { source: { assignment: "assignment-13", section: "5.7" },
    prompt: "What is the position of occupants after a trustee's sale?",
    choices: [
      "Their rights depend on their status — a tenant's position differs from a former owner's — and the analysis is legal rather than something a licensee resolves.",
      "All occupants must vacate immediately upon the sale.",
      "Occupants become month-to-month tenants of the purchaser automatically.",
      "Occupants may remain until the purchaser records a new deed."
    ],
    correctChoice: 0,
    rationale: "Tenant protections after a sale are a defined area with real consequences, and this is a question routed to counsel rather than answered at the property." },
  { source: { assignment: "assignment-13", section: "6.3" },
    prompt: "How should a licensee communicate with a distressed borrower?",
    choices: [
      "Factually, with referrals in writing, making no prediction about what a servicer or lienholder will do.",
      "Optimistically, so the borrower does not give up on the property.",
      "Through the borrower's family, who can convey difficult information.",
      "Only in writing, avoiding any conversation that could be misremembered."
    ],
    correctChoice: 0,
    rationale: "Predicting a third party's decision is an assurance the licensee cannot make, and this borrower is the target of the rescue schemes the lesson identifies." },
  /* Assignment 14 — Fair lending, fraud prevention, and ethical mortgage practice */
  { source: { assignment: "assignment-14", section: "1.4" },
    prompt: "What does ECOA's reach over 'any aspect of a credit transaction' cover?",
    choices: [
      "The whole course of dealing — including the application process, information given, terms offered, and how a file is handled — not only the credit decision.",
      "The credit decision and the adverse action notice only.",
      "The advertising that produced the application.",
      "The servicing of the loan after closing."
    ],
    correctChoice: 0,
    rationale: "Breadth is why discouragement is reached at all: deterring an application is an aspect of the transaction even though no decision was made." },
  { source: { assignment: "assignment-14", section: "1.5" },
    prompt: "Which inquiry is constrained under Regulation B?",
    choices: [
      "Requiring a spouse's signature where the applicant qualifies individually.",
      "Asking the applicant to document the income he is relying on.",
      "Asking the applicant for identification the program requires.",
      "Asking the applicant to explain a gap in employment."
    ],
    correctChoice: 0,
    rationale: "Marital status inquiries are limited to defined categories in defined circumstances, and alimony or support need not be disclosed unless the applicant chooses to rely on it — and he must be told so." },
  { source: { assignment: "assignment-14", section: "2.4" },
    prompt: "Why are pricing disparities visible to an examiner before any consumer complains?",
    choices: [
      "Reported data includes a pricing measure that supports comparison across applicants, so patterns appear in data regardless of dissatisfaction.",
      "Because lenders must report every price exception to the regulator.",
      "Because consumers routinely compare their rates with neighbors'.",
      "Because pricing is published on the firm's website."
    ],
    correctChoice: 0,
    rationale: "\"Nobody has complained\" is not a defense: complaints are one route and data is another, and the second requires no dissatisfaction." },
  { source: { assignment: "assignment-14", section: "3.4" },
    prompt: "What is a straw buyer arrangement?",
    choices: [
      "An application made in one person's name for another's benefit, concealing who is actually acquiring or controlling the property.",
      "A buyer who purchases with a co-signer.",
      "A buyer who purchases in the name of an entity he owns and discloses.",
      "A buyer who intends to resell the property quickly."
    ],
    correctChoice: 0,
    rationale: "Concealment of the real party is what makes it fraud. Disclosed entity purchases and quick resales are ordinary transactions." },
  { source: { assignment: "assignment-14", section: "4.5" },
    prompt: "What is seller impersonation fraud?",
    choices: [
      "A purported owner — often of unimproved or non-owner-occupied property — attempting to sell or encumber property he does not own.",
      "A seller misrepresenting the condition of his property.",
      "A seller who lists a property he has already sold.",
      "A seller who refuses to complete a disclosure form."
    ],
    correctChoice: 0,
    rationale: "The pattern targets property where nobody is present to notice, which is why identity verification through independently obtained channels matters most there." },
  { source: { assignment: "assignment-14", section: "5.3" },
    prompt: "Which fact is NOT a fraud signal?",
    choices: [
      "An applicant whose name, appearance, or accent differs from what the originator expected.",
      "A file whose documents contradict one another on a material point.",
      "A third party who controls the conversation and directs the transaction.",
      "An applicant whose credit history begins abruptly with no earlier record."
    ],
    correctChoice: 0,
    rationale: "Scrutiny goes to the pattern in the transaction, never to characteristics. Selective scrutiny applied to characteristics is where fair lending violations begin." },
  { source: { assignment: "assignment-14", section: "6.8" },
    prompt: "An originator realizes he gave a borrower an inaccurate figure last week. What is required?",
    choices: [
      "Correct it immediately and visibly, with the original preserved, and tell the broker.",
      "Provide the correct figure at closing when the final numbers are issued.",
      "Replace the earlier document in the file with a corrected version.",
      "Wait to see whether the borrower relied on the figure."
    ],
    correctChoice: 0,
    rationale: "Corrections are made visibly with the original preserved. Silent replacement is the act that converts a correctable error into a question about integrity." },
  /* Assignment 15 — Integrated California mortgage brokerage file */
  { source: { assignment: "assignment-15", section: "1.1" },
    prompt: "Why is the integrated mortgage file taught as a chronology?",
    choices: [
      "Because the frameworks attach themselves to particular moments in one sequence of events, mostly without announcing that they have.",
      "Because the lesson summarizes the earlier lessons in order.",
      "Because lenders require files to be assembled chronologically.",
      "Because the retention period runs from the earliest document."
    ],
    correctChoice: 0,
    rationale: "A real file arrives as one sequence in time, and almost every serious defect is the right act performed after the moment at which it protected anyone." },
  { source: { assignment: "assignment-15", section: "1.4" },
    prompt: "Which statement must not be made in the first conversation with a consumer?",
    choices: [
      "\"You will be approved.\"",
      "\"The Loan Estimate must be delivered within a defined period after application.\"",
      "\"Based on what you have described, a file like this typically prices in this range.\"",
      "\"I don't know — let me find out and get back to you today.\""
    ],
    correctChoice: 0,
    rationale: "An assurance is never statable at any confidence level, because the statement is not the originator's to make and the applicant will rely on it." },
  { source: { assignment: "assignment-15", section: "3.3" },
    prompt: "What is held constant across every option in a common-basis comparison?",
    choices: [
      "Loan amount, assumed closing date, point assumption, time horizon, and treatment of financed costs.",
      "The lender, so that pricing is comparable.",
      "The loan term, so that payments can be compared directly.",
      "The borrower's down payment percentage."
    ],
    correctChoice: 0,
    rationale: "Holding these constant is what makes the options comparable, and each option is shown with its worst case where the payment can change." },
  { source: { assignment: "assignment-15", section: "4.3" },
    prompt: "A condition cannot be met because the underlying fact is not what the file assumed. What is the correct response?",
    choices: [
      "Report the fact, restructure around it, or let the transaction not proceed — a condition that cannot be met is information.",
      "Substitute a different program that does not impose the condition, without disclosing why.",
      "Add a co-borrower whose participation is nominal.",
      "Advise the borrower to move funds so the condition is not asked again."
    ],
    correctChoice: 0,
    rationale: "Treating it as an obstacle to route around is the point at which an originator's problem stops being a compliance problem." },
  { source: { assignment: "assignment-15", section: "5.3" },
    prompt: "A cost exceeds its tolerance and no valid changed circumstance is documented. What is required?",
    choices: [
      "A cure on the framework's terms, documented with what was cured, how much, and when.",
      "A revised Loan Estimate issued before closing.",
      "The borrower's written acknowledgment of the higher cost.",
      "Nothing, provided the borrower does not raise it."
    ],
    correctChoice: 0,
    rationale: "A cure performed is a compliance record; a cure omitted because the borrower did not notice is the finding." },
  { source: { assignment: "assignment-15", section: "2.3" },
    crossReferences: [{ assignment: "assignment-14", section: "2.6" }],
    prompt: "A brokerage codes denied files as withdrawn whenever the applicant stops responding. Why is that a fair lending problem and not only a data problem?",
    choices: [
      "It removes those applicants from the denial data and from the notices they were owed, producing exactly the invisible pattern discouragement creates.",
      "It overstates the brokerage's approval rate to prospective lenders.",
      "It shortens the retention period that applies to the file.",
      "It prevents the applicant from reapplying with the same brokerage."
    ],
    correctChoice: 0,
    rationale: "Where it happens more readily to some applicants than others, the practice produces a denial pattern that appears in no denial record." },
  { source: { assignment: "assignment-11", section: "4.5" },
    crossReferences: [{ assignment: "assignment-09", section: "2.6" }],
    prompt: "Which comparison, performed by the originator, catches the most common enforcement fact pattern in mortgage brokerage?",
    choices: [
      "Compensation on the Closing Disclosure against the brokerage's own expected receipt, before funding rather than after.",
      "The appraised value against the contract price.",
      "The final Closing Disclosure against the initial Loan Estimate.",
      "The borrower's cash to close against his verified assets."
    ],
    correctChoice: 0,
    rationale: "A discrepancy between disclosed and received compensation is found by comparing two documents the brokerage produced itself, on the subject the consumer cannot verify." },
  { source: { assignment: "assignment-06", section: "3.5" },
    crossReferences: [{ assignment: "assignment-04", section: "4.4" }],
    prompt: "An appraisal comes in below the contract price and the borrower asks whether he should proceed and refinance later when values recover. What may the originator say?",
    choices: [
      "Explain what the lower value does to the loan amount and the cash required, and make no prediction about future values or a future refinance.",
      "Agree that refinancing later is a reasonable plan given historical appreciation.",
      "Advise the borrower to request a second appraisal from a different appraiser.",
      "Advise the borrower to cancel, since a low value indicates the property is overpriced."
    ],
    correctChoice: 0,
    rationale: "\"You can just refinance\" is a prediction stated as a plan and the single most damaging sentence in mortgage sales, and shopping for a different appraiser is coercion in another form." },
  { source: { assignment: "assignment-08", section: "3.5" },
    crossReferences: [{ assignment: "assignment-12", section: "5.4" }],
    prompt: "A trust account holding both borrower funds and investor funds shows a shortage. What is required?",
    choices: [
      "The broker corrects it immediately from broker funds and documents it — the balances of other beneficiaries do not cover it, whatever the account total shows.",
      "The shortage is carried until the responsible party makes it good.",
      "The shortage is allocated pro rata among the beneficiaries.",
      "The account is closed and the funds redistributed."
    ],
    correctChoice: 0,
    rationale: "\"The account still has enough in it\" is exactly the reasoning the three-way reconciliation exists to defeat: one person's money is covering another's shortfall." },
  { source: { assignment: "assignment-13", section: "2.3" },
    crossReferences: [{ assignment: "assignment-09", section: "5.7" }],
    prompt: "A California buyer's payment rises sharply in year two after reassessment and a supplemental bill. What origination failure does this usually reflect?",
    choices: [
      "The escrow mechanics and the reassessment consequence were never explained with their numbers at origination.",
      "The lender under-collected escrow deliberately to make the payment appear lower.",
      "The servicer applied payments in the wrong order.",
      "The borrower waived escrow without understanding the waiver."
    ],
    correctChoice: 0,
    rationale: "The increase is entirely predictable at origination, which is why most servicing complaints are origination failures arriving late." },
  { source: { assignment: "assignment-10", section: "3.6" },
    crossReferences: [{ assignment: "assignment-14", section: "5.5" }],
    prompt: "A manager tells a processor to retype an illegible pay stub 'so underwriting can read it.' What is the correct response?",
    choices: [
      "Decline — the retyped document would be offered to the lender as the employer's — request a legible copy from the source, and escalate the instruction in writing.",
      "Retype it and note in the file that the original was illegible.",
      "Retype it and attach the illegible original alongside.",
      "Ask the borrower to retype it and sign the retyped version."
    ],
    correctChoice: 0,
    rationale: "The document says something the source did not say, whatever is attached to it, and an instruction from inside the firm does not transfer responsibility for the act." },
  { source: { assignment: "assignment-07", section: "3.5" },
    crossReferences: [{ assignment: "assignment-06", section: "6.3" }],
    prompt: "A file is denied and the notice states only 'does not meet our credit standards,' although a consumer report contributed. What is missing?",
    choices: [
      "The specific reasons or the right to obtain them, and the FCRA content identifying the agency, stating it did not make the decision, and setting out the rights to a copy and to dispute.",
      "The name of the underwriter who made the decision.",
      "A description of what the applicant must do to qualify later.",
      "The lender's internal scoring model."
    ],
    correctChoice: 0,
    rationale: "Both the ECOA content and the FCRA content are required where a report was used, and a generic reason satisfies neither." },
  { source: { assignment: "assignment-12", section: "4.5" },
    crossReferences: [{ assignment: "assignment-02", section: "2.3" }],
    prompt: "Why is a short-term interest-only hard money loan particularly dangerous for a consumer-purpose borrower on his own residence?",
    choices: [
      "No principal is retired, the balance is due in full at maturity, and the entire structure depends on an exit that may not be available.",
      "The interest rate is variable and may increase during the term.",
      "The loan cannot be recorded against owner-occupied property.",
      "The borrower cannot obtain title insurance on such a loan."
    ],
    correctChoice: 0,
    rationale: "The exit is the whole analysis, and this combination is where consumer protection frameworks apply with force and the harm is greatest." },
  { source: { assignment: "assignment-05", section: "6.6" },
    crossReferences: [{ assignment: "assignment-08", section: "4.2" }],
    prompt: "What must a mortgage file contain regardless of whether the loan funded?",
    choices: [
      "The application and its supporting documentation, the disclosures with delivery evidence, the disposition and any adverse action notice, and the retention the framework requires.",
      "Only the documents the lender requested.",
      "Only the documents relating to loans that closed.",
      "Only the disclosures, since the rest belongs to the lender."
    ],
    correctChoice: 0,
    rationale: "Denied and abandoned files are retained, and they are disproportionately the files a fair lending examination is interested in." },
  { source: { assignment: "assignment-15", section: "6.4" },
    crossReferences: [{ assignment: "assignment-01", section: "6.3" }],
    prompt: "An examination is scheduled and a file is missing a delivery record for a disclosure. Which response is survivable and which is not?",
    choices: [
      "Recording the gap and escalating is survivable; creating a delivery record now and filing it as contemporaneous is not.",
      "Both are survivable, since the underlying disclosure was in fact delivered.",
      "Neither is survivable once an examination has been scheduled.",
      "Creating the record is survivable if the licensee genuinely recalls delivering it."
    ],
    correctChoice: 0,
    rationale: "A documented gap produces a finding and a correction; a manufactured document converts a defensible examination into a question about every other file the brokerage has produced." },
];

export default {
  courseId: "ca-mortgage-loan-brokering-lending-45",
  forms: { A: formA, B: formB }
};
