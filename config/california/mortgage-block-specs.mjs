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
};
