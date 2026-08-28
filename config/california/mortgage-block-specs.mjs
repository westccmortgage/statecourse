/**
 * CA-BLOCK rollout — the HAND-AUTHORED pedagogy for Mortgage assignments 2–15.
 *
 * The generator (scripts/generate-mortgage-block-maps.mjs) derives every screen range from the
 * frozen lesson's own headings; what it must never invent lives here, written after reading the
 * lesson: each block's learning objective (blocks B1–B6 follow the lesson's six sections; the
 * seventh entry is B7, synthesis), and the mapping of the eight practice problems to the block
 * teaching their concept. Every problem 1–8 must be assigned to exactly one block — the coverage
 * invariant requires each problem's range to have exactly one owner — and a block with no mapped
 * problem is a documented inventory gap whose active learning is its retrieval check, exactly as
 * pilot block B1 was.
 */

export const MORTGAGE_BLOCK_SPECS = {
  2: {
    objectives: [
      "Compute simple interest in all four directions and per diem interest, and explain why interest paid in arrears shifts the first payment and raises a payoff.",
      "Build rows of an amortization schedule, explain the shifting interest-principal split and what it explains for borrowers, and describe negative amortization and recast in plain terms.",
      "Identify the operative provisions of a promissory note, distinguish acceleration from alienation, and state what determines an adjustable rate at adjustment.",
      "Compute points and a break-even, group closing costs by category, and state what the annual percentage rate does and does not capture.",
      "Compute loan-to-value and combined loan-to-value under the lower-of-value-or-price rule, and compute equity and cash-out availability.",
      "Compute payments with the factor method, build PITI and qualifying ratios without stating thresholds, compute yield at a discount and a premium, and apply the reasonableness check to every figure.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 interest in four directions and P2 arrears/first payment teach §1; P3 acceleration and
       alienation teaches §3; P4 the points break-even, §4; P5 the low appraisal and refinance
       exposure, §5; P6 the unreconciled payment quote, P7 the ratios, and P8 yield at three
       prices all teach §6. §2 (amortization) has no mapped problem — the documented gap; its
       retrieval check is its active learning. */
    problemMap: { 1: [1, 2], 3: [3], 4: [4], 5: [5], 6: [6, 7, 8] },
  },
  3: {
    objectives: [
      "Name the three parties to a California deed of trust, list the operative elements of the instrument, and identify defaults that do not involve missing a payment.",
      "Compare the deed of trust with the mortgage on all seven dimensions, explain what the trustee's power of sale produces, and state California's lien-theory consequence — the borrower is the owner and the lender holds a claim.",
      "State what the trustor, beneficiary, and trustee each may and may not do, explain the trustee's two functions and substitution, and distinguish the beneficiary from the servicer.",
      "Apply the recording system's three kinds of notice and the first-in-time rule with its exceptions, recognize the mechanic's lien relation-back at intake, and distinguish a preliminary-report exception from a requirement.",
      "Explain why a refinance with an existing second needs a subordination agreement, state that a recorded reconveyance — not payment — clears a paid deed of trust, and distinguish assumption, subject to, and wraparound.",
      "Compare the two foreclosure paths and their trade-off, distinguish reinstatement from redemption, state what a senior foreclosure does to junior liens, and name the security risks a broker must surface — including the automatic stay.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 covenant defaults teach §1; P2 the two instruments and the trade-off, §2; P3 servicer,
       trustee, and substitution, §3; P4 the mechanic's lien relation-back, §4; P5 subordination
       plus reconveyance and P6 assumption/subject-to/wraparound both teach §5; P7 the
       reinstatement window and P8 the security-risk sweep both teach §6. Every section owns a
       problem — no inventory gap in this assignment. */
    problemMap: { 1: [1], 2: [2], 3: [3], 4: [4], 5: [5, 6], 6: [7, 8] },
  },
  4: {
    objectives: [
      "Distinguish the primary and secondary markets, explain the liquidity the secondary market supplies and why underwriting standards flow backward from it, and distinguish conforming from non-conforming lending.",
      "Distinguish a mortgage banker from a mortgage broker and state the consequences, explain warehouse lines, correspondent lending, and table funding, and state what a licensee must not represent about the firm.",
      "State the common structure of government-backed programs, correct the recurring misstatements about them, explain whom mortgage insurance protects, and present program condition requirements as closing-probability facts.",
      "Name the four adjustable-rate terms, compute a fully indexed rate and a worst-case payment path, explain interest-only, balloon, buydown, and rate-lock exposure, and never predict rates.",
      "State why occupancy is a material fact whose misstatement is loan fraud, recognize the misrepresentation patterns, state what a business-purpose certification does and does not establish, and route genuinely close cases to compliance.",
      "Present loan products on a common basis, give the plain-language explanations each payment-changing feature requires, ask the suitability questions, and build a file that passes the reconstructability test.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the investor-driven documentation demand teaches §1; P2 the banker-broker misstatement,
       §2; P3 the program misstatements and P4 the FHA condition-versus-preference problem both
       teach §3; P5 the hybrid worst-case computation and P6 the buydown/interest-only/balloon/
       lock stack both teach §4; P7 the business-purpose instruction and the contradicting lease
       teach §5; P8 the one-product presentation teaches §6. Every section owns a problem. */
    problemMap: { 1: [1], 2: [2], 3: [3, 4], 4: [5, 6], 5: [7], 6: [8] },
  },
  5: {
    objectives: [
      "Distinguish prequalification, preapproval, and loan commitment, state what constitutes an application and what taking one triggers, and explain why structuring to avoid the trigger is a compliance problem.",
      "Collect and verify income, assets, and liabilities, explain why a large deposit requires sourcing, and state what a licensee must never suggest about deposits.",
      "State what a credit report contains and its limits, apply permissible purpose and authorization, hold the line on what a licensee may not say about credit, and surface adverse credit early.",
      "Explain why occupancy is a material fact whose misstatement is loan fraud, recognize the contradiction patterns, respond correctly to the owner-occupancy request, and distinguish a change of intent from a misrepresentation.",
      "Compute the front-end and back-end ratios, name the errors that produce wrong ones, never state a threshold as a rule, and warn the borrower in writing about the actions that change a ratio after application.",
      "Keep the application accurate: refuse alterations and omissions, handle adverse information and corrections properly, and build a file that passes the reconstructability test.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the six-items trigger and structuring, and P2 the preapproval misdescription, both teach
       §1; P3 self-employment income and deposit sourcing teaches §2; P4 the four credit questions
       teaches §3; P5 the owner-occupancy request teaches §4; P6 the ratio computation and P7 the
       post-application actions both teach §5; P8 the manager's instruction teaches §6. Every
       section owns a problem. */
    problemMap: { 1: [1, 2], 2: [3], 3: [4], 4: [5], 5: [6, 7], 6: [8] },
  },
  6: {
    objectives: [
      "State what the ability-to-repay determination requires, name the factors files most often miss, explain why a discounted start rate does not qualify a borrower, and outline qualified mortgages and the exclusions.",
      "State what an automated finding is and is not, explain why 'the system approved it' fails, and state who decides whether a compensating factor or an exception applies.",
      "Apply the lower-of-value-or-price rule, distinguish supplying information from supplying a target, describe a correct reconsideration of value, and walk a borrower through a low appraisal honestly.",
      "Distinguish title insurance from hazard insurance and exceptions from exclusions and requirements, name what the title work must resolve, and treat insurance availability as a first-week item.",
      "Name the condition types and categories, explain why a prior-to-funding condition is not a formality, manage conditions against the lock, and state what must never be done to satisfy one.",
      "Name the dispositions, state what adverse action notice requires and why a generic reason fails, communicate a denial honestly, and describe the fair-lending disciplines that constrain underwriting discretion.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the three qualification errors teach §1; P2 the optimistic automated finding, §2; P3 the
       target communication and P4 the low-appraisal conversation both teach §3; P5 the title-work
       stack and P6 the mapped-hazard insurance plan both teach §4; P7 the three remaining
       conditions, §5; P8 the four-failure denial, §6. Every section owns a problem. */
    problemMap: { 1: [1], 2: [2], 3: [3, 4], 4: [5, 6], 5: [7], 6: [8] },
  },
  7: {
    objectives: [
      "State what Truth in Lending does and covers, explain what the APR is for and does not capture, describe the two integrated disclosures and their timing consequences, and state what the rescission right is and is not.",
      "State RESPA's two purposes, apply the referral prohibition and the services-actually-performed test, explain why disclosure does not cure a referral payment, and state an affiliated business arrangement's conditions.",
      "Name ECOA's prohibited bases including the two distinctive ones, apply the ask and do-not-ask rules, explain the government monitoring paradox, and state what an adverse action notice must contain.",
      "State what HMDA does and its purposes, explain why the data matters even where nobody has complained, and identify the coding errors — above all a denial coded as a withdrawal — that distort it.",
      "Apply FCRA permissible purpose, name the additional adverse-action content a consumer report requires, describe risk-based pricing, hold the credit-advice boundaries, and safeguard consumer information.",
      "Distinguish state-licensed from federally registered originators, state what triggers the MLO requirement, explain the unique identifier and the endorsement's separate renewal cycle, and route questions to the right framework.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the APR conversation and P2 the rescission closing both teach §1; P3 the three referral
       offers and P4 the affiliated escrow company both teach §2; P5 the four application-stage
       violations teach §3; P6 the deficient notice and the withdrawn-coding teach §4 (with §3 and
       §5 threads the blocks cross-reference); P7 the casual report pulls teach §5; P8 the lapsed
       endorsement teaches §6. Every section owns a problem. */
    problemMap: { 1: [1, 2], 2: [3, 4], 3: [5], 4: [6], 5: [7], 6: [8] },
  },
  8: {
    objectives: [
      "State what the California broker license authorizes in mortgage practice, distinguish the broker's two roles, and explain the mortgage loan disclosure statement's separate California footing.",
      "Define an advance fee and why the framework exists, apply it past the labels, handle third-party pass-throughs honestly, and state where a salesperson's compensation may come from.",
      "Identify trust funds in mortgage practice, distinguish commingling from conversion, explain why a ledger does not cure commingling, reconcile three ways, and respond correctly to shortages and overages.",
      "List what a mortgage file must contain, apply the longest-period retention rule and the complaint extension, keep electronic records with version history, and state what must never happen to a record.",
      "Identify the dual identification mortgage advertising requires, the practices that make an advertisement misleading, the consent obligations of solicitation, and a working approval-and-archive process.",
      "Describe what a DRE examination reviews, name the recurring process findings and the one category that is different, respond correctly to regulator contact, and apply the reconstructability test.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the labeled advance fee and P2 the marked-up pass-through with the salesperson's direct
       payment both teach §2; P3 the two-way reconciliation and P4 the diverted investor funds
       both teach §3; P5 the retention failures teach §4; P6 the Instagram story and text
       campaign, §5; P7 the findings-and-response set and P8 the pre-examination falsification
       both teach §6. §1 (broker roles and the MLDS) has no mapped problem — the documented gap;
       its retrieval check is its active learning. */
    problemMap: { 2: [1, 2], 3: [3, 4], 4: [5], 5: [6], 6: [7, 8] },
  },
  9: {
    objectives: [
      "State the Loan Estimate's and Closing Disclosure's purposes and timing, name the changes that restart the waiting period, evidence delivery, and keep the California mortgage loan disclosure statement separate.",
      "Apply the prohibition on term-based compensation and its proxies, the dual compensation restriction, and the steering rules, and reconcile compensation disclosed against compensation received on every file.",
      "State the referral prohibition and why disclosure does not cure it, apply the services-actually-performed test to marketing agreements and other structures, state the affiliated business conditions, and decline and escalate offers.",
      "Name the three fee tolerance categories and how a consumer's shopping choice moves a charge, distinguish a changed circumstance from a discovered error, and state what a cure is.",
      "Present prepayment penalties, balloons, adjustable-rate terms, interest-only and negative amortization, and buydowns in plain terms with their numbers — the fully indexed rate above all.",
      "Present products on a common basis, name the comparisons that mislead, explain why acknowledgment is not understanding, keep the prohibited statements out, and build the file that passes reconstructability.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the disclosure-clock scenario teaches §1; P2 the four-violation compensation plan, §2;
       P3 the four referral offers and P4 the affiliated title company both teach §3; P5 the
       three-category tolerance analysis, §4; P6 the five-feature hybrid presentation, §5; P7 the
       misleading two-option comparison and P8 the acknowledgment complaint both teach §6. Every
       section owns a problem. */
    problemMap: { 1: [1], 2: [2], 3: [3, 4], 4: [5], 5: [6], 6: [7, 8] },
  },
  10: {
    objectives: [
      "Run the intake questions and record the answers, hold the line on what may be said at inquiry, distinguish the three assessment levels, write an honest prequalification letter, and recognize when an inquiry becomes an application.",
      "Take a complete application, run the disclosure clock with delivery evidence and the separate California statement, and send the two written warnings — the do-not-change-anything warning and the wire fraud warning.",
      "Order document collection by lead time, verify and source honestly, distinguish a gap from a contradiction that must be escalated, and handle documents with security and integrity.",
      "Submit complete files, manage conditions with owners and dates against the lock and disclosure calendars, state what must never be done to satisfy a condition, and explain the re-verification exposure.",
      "Sequence signing, funding, recording, and disbursement, explain the Closing Disclosure waiting period and rescindable closings, apply the wire fraud protocol at settlement, and confirm closing to the borrower accurately.",
      "Describe what post-closing quality control examines and why defects are systemic, handle findings by correcting the instance and the process, hold the falsification line, and apply the reconstructability test.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the rate-call intake and P2 the overstated prequalification letter both teach §1; P3 the
       missing written warnings and the wire email teach §2; P4 the lead-time reordering and P5
       the gap-versus-contradiction set both teach §3; P6 the three remaining conditions teach §4;
       P7 the clear-to-close conversation teaches §5; P8 the quarterly review and the backdating
       proposal teach §6. Every section owns a problem. */
    problemMap: { 1: [1, 2], 2: [3], 3: [4, 5], 4: [6], 5: [7], 6: [8] },
  },
  11: {
    objectives: [
      "State the information-versus-target distinction and the ordering channel that enforces it, recognize the softer forms of coercion, evidence the borrower's copy, and respond correctly to suspected appraisal bias.",
      "Read an appraisal for factual accuracy and internal consistency, state the adjustment-direction rule, explain what a low value produces on a purchase and a refinance, and make a correct reconsideration request.",
      "Distinguish exceptions, exclusions, and requirements on a preliminary report, route the recurring title items, ask the mechanic's lien intake question, and state what title insurance does not cover.",
      "State what makes an arrangement an escrow and what neutrality forbids, resolve instruction-agreement conflicts through the parties, perform the reconciliation nobody else performs, and hold the wire fraud protocol.",
      "Place settlement statement entries on the correct side, compute prorations in both directions, reconcile the originator's lines against the disclosures, and explain the statement to a borrower.",
      "Sequence signing, funding, recording, and disbursement, explain recording order and rescindable closings, distinguish constructive from inquiry notice, and confirm closing to the borrower completely.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the target email and P2 the ordering-desk coercion both teach §1; P3 the low-value
       cash-out conversation teaches §2; P4 the title routing stack and P5 the fence-and-policies
       set both teach §3; P6 the one-party holdback teaches §4; P7 the statement reconciliation
       teaches §5; P8 the clear-to-close rescission conversation teaches §6. Every section owns a
       problem. */
    problemMap: { 1: [1, 2], 2: [3], 3: [4, 5], 4: [6], 5: [7], 6: [8] },
  },
  12: {
    objectives: [
      "State why private money exists and how the broker's position differs, name the duties owed an investor and the collateral facts an investor must be told, and recognize what multi-lender and threshold activity trigger.",
      "Determine loan purpose on the actual facts, state what a certification does and does not establish, name both directions of classification error, and route genuinely close cases before the file is built.",
      "Name what a seller carryback must document, state the seller's and buyer's risks and the subordination clause's significance, address the California disclosure obligations, and keep the documentation with counsel.",
      "State what the file must show about hard-money product fit, examine an exit rigorously, explain why hard money does not escape the consumer framework, and recognize the patterns that stop a file.",
      "Document both sides of a broker-arranged loan, handle investor funds as trust funds with three-way reconciliation, disclose every conflict before reliance, and keep projections out of investor presentations.",
      "Recognize usury risk in private money, state what the broker-arranged exemption actually requires, know what counts toward the rate, and route every usury, structure, and securities question to counsel.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the six-failure investor presentation teaches §1; P2 the duplex classification
       instruction, §2; P3 the form-assembled carryback, §3; P4 the medical-debt hard-money file
       and P5 the builder bridge both teach §4; P6 the diverted investor funds and P7 the
       "is it safe" conversation both teach §5; P8 the exemption-by-designation request teaches
       §6. Every section owns a problem. */
    problemMap: { 1: [1], 2: [2], 3: [3], 4: [4, 5], 5: [6, 7], 6: [8] },
  },
  13: {
    objectives: [
      "Distinguish the owner, servicer, and originator, explain partial payment and extra-principal handling, keep servicing records as trust records where a broker services, and state what a transfer does and does not change.",
      "Explain why a fixed-rate payment changes, describe the California reassessment problem and the supplemental tax bill, read an escrow analysis, and deliver the four origination explanations in writing.",
      "Explain why a payoff exceeds the statement balance, compute a per diem extension past the good-through date, state what clears a satisfied lien, and distinguish payoff from assumption and subordination.",
      "Name the loss mitigation options and what each carries, state the California servicer protections in outline, hold the distressed-borrower boundaries, and recognize foreclosure rescue fraud patterns.",
      "Compare the foreclosure paths and outline the nonjudicial sequence, distinguish reinstatement from redemption, describe the trustee's sale and its aftermath for juniors and occupants, and escalate a bankruptcy filing immediately.",
      "Route borrowers to the defined error and information procedures, communicate with distressed borrowers without predictions, handle complaints and regulator contact correctly, and trace servicing complaints to their origination failures.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the four-question former-borrower call teaches §1; P2 the reassessment shortage, §2;
       P3 the payoff arithmetic and the 2016 lien, §3; P4 the distressed borrower's questions and
       P5 the rescue scheme both teach §4; P6 the trustee's-sale questions teach §5; P7 the
       defeated error procedure and P8 the complaint-log review both teach §6. Every section owns
       a problem. */
    problemMap: { 1: [1], 2: [2], 3: [3], 4: [4, 5], 5: [6], 6: [7, 8] },
  },
  14: {
    objectives: [
      "Name both federal prohibited-basis lists and what is distinctive to each, explain why California's broader list makes consistent documented criteria the only reliable practice, and state what 'any aspect' and the monitoring paradox require.",
      "Describe redlining's history, compounding, and modern forms, identify where pricing discretion and exceptions create exposure, recognize discouragement, and run the structural controls including outcome review.",
      "Define mortgage fraud and its two categories, recognize occupancy and income fraud patterns and the file that contradicts itself, identify straw-buyer and appraisal-fraud signals and transaction schemes, and hold the licensee's nevers.",
      "Describe the wire fraud pattern and the defenses in order of value, state what does not work, name the identity red flags and seller-impersonation signals, and keep information security with breach timelines.",
      "Explain why fraud presents as a pattern, separate signals from what is not suspicious, escalate with facts rather than conclusions, and refuse improper instructions from inside the firm.",
      "Sort statements into verified fact, unverified report, and opinion; keep the complaint-producing sentences out; present products on a common basis with plain-language features; and hold the falsification line.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the four application-stage violations teach §1; P2 the two-ZIP-code firm and P3 the
       gut-feel exceptions with the discouragement instruction both teach §2; P4 the
       self-contradicting occupancy file teaches §3; P6 the one-character wire email teaches §4;
       P5 the straw-buyer/elder pattern and P7 the inverted-scrutiny set both teach §5; P8 the
       one-product presentation teaches §6. Every section owns a problem. */
    problemMap: { 1: [1], 2: [2, 3], 3: [4], 4: [6], 5: [5, 7], 6: [8] },
  },
  15: {
    objectives: [
      "Place a file's events on the nine-step chronology, settle capacity, authority, scope, and compensation in the first conversation, hold the fact-estimate-assurance line at intake, and record the dated intake note.",
      "Apply the six-item application trigger without exception, run everything that starts at that moment, code dispositions as the substantive statements they are, and keep the originator's hands off document creation.",
      "Run the federal and California disclosure systems with delivery evidence, present every option on a common basis with its worst case, record the suitability facts, and support every revision with a contemporaneous reason.",
      "Assemble a file that proves the ability-to-repay determination without the originator present, clear conditions with source evidence only, treat an unmeetable condition as information, and keep targets away from the appraisal.",
      "Reconcile the closing line by line, cure tolerance variances, make disclosed, received, and payer agree exactly on compensation, handle trust funds and advance fees, and treat acknowledgment as delivery only.",
      "Audit a file against the reconstructability standard, rank defects by seriousness rather than order of discovery, distinguish an honest document created today from a manufactured one, and carry the course's four questions.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the Tuesday-email application and P3 the processor-authored deposit letter both teach
       §2; P2 the vanished oral comparison teaches §3; P4 the manager's appraisal instructions
       and P6 the denial coded as a withdrawal both teach §4 (adverse action at 4.5, valuation at
       4.4); P5 the closing-stage ranking and P7 the acknowledgment file both teach §5; P8 the
       broker's twenty-file audit teaches §6. §1 (inquiry and scope) has no mapped problem — the
       documented gap; its retrieval check is its active learning. */
    problemMap: { 2: [1, 3], 3: [2], 4: [4, 6], 5: [5, 7], 6: [8] },
  },
};
