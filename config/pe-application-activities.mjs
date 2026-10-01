/** Public PE03/PE04 formative activities, adapted only from the verified public
 * learner manuscripts and their fictional cases / worked examples, 2026-09-30.
 * No private instructor files, full case keys, or protected final items are used.
 * Short-answer rubrics are public process checks, not instructor acceptance keys.
 * Numeric solutions are independently checked teaching arithmetic, not approval
 * thresholds, course credit, or measured instructional time. This module performs
 * no file reads, network requests, or state changes; projection is owned by the caller.
 */

export const PE_APPLICATION_PROVENANCE = {
  "version": "2026-09-30",
  "publicFormative": true,
  "creditBearing": false,
  "durationValidated": false,
  "bundle": "StateCourse_PE03_PE04_Public_Lessons_Practice_Source_2026-09-30.zip",
  "bundleSha256": "7df828d0f9a378a2373029389625146206d6345fe1480aeb99572c4a5673fe14",
  "publicBundleMembersVerified": 6,
  "sourceFiles": [
    {
      "name": "PE03_student.md",
      "bytes": 27125,
      "sha256": "6ee07b4cc5e27ad32d3f63561bc9e4bbc3c8d02ea601f81b1f2b054cd798edcb"
    },
    {
      "name": "PE04_student.md",
      "bytes": 35583,
      "sha256": "007cc35b4b8eb5e0f041c0d132d9d4ef8a6205ce020d70465d03536246903e3b"
    },
    {
      "name": "PE03_practice.json",
      "bytes": 16637,
      "sha256": "e8d706a5a939612bd604ad0d61c733bbbd4c32ea5f7486cc4af20e3a0c6dcced"
    },
    {
      "name": "PE04_practice.json",
      "bytes": 22324,
      "sha256": "be38b3a18973f0d65e2803828833870be606165067a0da2d461ffabb153ea659"
    },
    {
      "name": "README_PUBLIC_SOURCE.md",
      "bytes": 3214,
      "sha256": "4d1a3989d3257993d5cc61ca8e3e0be18575be67a90d107a9989918276ca8953"
    },
    {
      "name": "public_manifest.json",
      "bytes": 1033,
      "sha256": "b69b7bd976e8ef4db502b6233625d4cbaf6d786159050f3ee282daddbeffa0f0"
    }
  ],
  "modules": [
    {
      "id": "PE03",
      "module": "module-03",
      "proposedElectiveMinutes": 150,
      "publicQuestionCount": 12,
      "scenarioCount": 3,
      "scenarioTaskCount": 14
    },
    {
      "id": "PE04",
      "module": "module-04",
      "proposedElectiveMinutes": 150,
      "publicQuestionCount": 12,
      "scenarioCount": 3,
      "scenarioTaskCount": 17
    }
  ],
  "interaction": "Current self-guided practice uses optional self-review. Genuine peer interaction, substantive instructor feedback, and revision remain a proposed future scheduled OIL requirement.",
  "privacy": "Only the six allowlisted public bundle members were read for adaptation. No private instructor files or protected final content were read or imported. Do not enter real borrower data."
};

export const PE_APPLICATION_SCENARIOS = [
  {
    "id": "PEAP-A-03A-cedar",
    "title": "Repair the Cedar application record",
    "module": "module-03",
    "context": "Use public learner case C3A to create a traceable application record. All people and records are fictional. Keep a draft for self-review; this activity does not send a message or obtain an underwriting decision.",
    "facts": [
      "Mara Ortiz asks for financing to buy 18 Cedar Lane.",
      "At 10:00 she supplies her name, income, property address, estimated property value, and requested mortgage amount.",
      "At 14:00 she securely supplies the identifier needed to obtain a credit report. Assume these are the six elements for a transaction subject to the relevant integrated disclosure rule.",
      "At 16:00 she uploads an unsigned application and page 1 of a two-page pay statement.",
      "The portal still says lead; no one has reviewed income. Do not calculate a disclosure deadline or decide eligibility."
    ],
    "sources": [
      {
        "url": "https://www.consumerfinance.gov/rules-policy/regulations/1026/2/",
        "reference": "PE03 P3-01: Regulation Z 1026.2(a)(3), scoped application definition; public case C3A supplies the event times"
      },
      {
        "url": "https://www.consumerfinance.gov/rules-policy/regulations/1002/2/",
        "reference": "PE03 P3-02: Regulation B 1002.2(f), separate application and completed-application concepts"
      },
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/what-information-do-i-have-to-provide-a-lender-in-order-to-receive-a-loan-estimate-en-1987/",
        "reference": "PE03 P3-03: CFPB information needed for a Loan Estimate; recognition and routing only"
      }
    ],
    "tasks": [
      {
        "id": "PEAP-T-03A-record",
        "type": "short-answer",
        "prompt": "Write four lines identifying the event to route for the disclosure deadline check, the incomplete item received, the fact still awaiting qualified review, and one precise next request.",
        "rubric": [
          "Connect the scoped triggering event to the supplied receipt time rather than the portal label or later signature",
          "Name the incomplete record and its missing part without treating the defect as proof of wrongdoing",
          "Separate an applicant statement, document receipt, and authorized acceptance of qualifying income",
          "Identify a specific next request and a responsible review function without calculating an unsupported deadline"
        ],
        "rationale": "Review the event history before the software label. Evidence can arrive in stages, and receipt does not establish that the record is complete or accepted. A useful next step identifies the precise gap and routes the applicable review."
      },
      {
        "id": "PEAP-T-03A-status",
        "type": "short-answer",
        "prompt": "Replace “all documents verified” with a one-sentence status, then note one reason your revision is more accurate.",
        "rubric": [
          "Describe only observed receipt and review states",
          "Keep unresolved income review and incomplete evidence visible",
          "Avoid an approval promise or requesting real applicant data in this exercise"
        ],
        "rationale": "A status should let the next person tell what happened and what still needs a decision. Compare your own draft with those process checks; this is self-review, not an instructor grade."
      }
    ]
  },
  {
    "id": "PEAP-A-03B-river",
    "title": "Reconcile the River qualification worksheet",
    "module": "module-03",
    "context": "Use public learner case C3B. Calculate only from the reviewer-accepted exercise inputs. Keep full precision in monthly income for later ratios and round displayed dollars and percentages to two decimals. The arithmetic does not approve a real loan.",
    "facts": [
      "Accepted base pay is $2,800 biweekly with exactly 26 pay periods annually. A separate $900 monthly bonus remains unresolved and is excluded.",
      "Qualifying monthly housing consists of $2,250 principal and interest, $350 taxes, $125 property insurance, $75 mortgage insurance, and $100 association dues.",
      "Other included monthly obligations are $420 vehicle, $180 student loan under the supplied assumption, and $100 revolving payments; no other obligations are included.",
      "For the changed-debt calculation only, add a $160 monthly obligation with all other inputs unchanged.",
      "Eligible liquid assets are $28,000 and remaining cash required to close is $22,500 after any previously paid deposit; there are no other deductions.",
      "For this fictional practice program only, required reserves equal two months of the $2,900 housing amount. This is an invented case condition, not an agency rule or universal threshold."
    ],
    "sources": [
      {
        "url": "https://selling-guide.fanniemae.com/sel/b3-3.1-01/general-income-information",
        "reference": "PE03 P3-05: program-specific income analysis; accepted pay, period count, and arithmetic are stipulated in public case C3B"
      },
      {
        "url": "https://selling-guide.fanniemae.com/sel/b3-6-05/monthly-debt-obligations",
        "reference": "PE03 P3-09: program-specific debt treatment; the exercise stipulates its included payments and does not impose this guide universally"
      }
    ],
    "tasks": [
      {
        "id": "PEAP-T-03B-income",
        "type": "computation",
        "prompt": "What is monthly accepted base income, displayed to two decimals? Retain the unrounded value in later ratios.",
        "expected": 6066.67,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$2,800 × 26 ÷ 12 = $6,066.666666… per month, displayed as $6,066.67. The unresolved bonus is excluded; biweekly is not the same as twice monthly."
      },
      {
        "id": "PEAP-T-03B-housing",
        "type": "computation",
        "prompt": "What is the total qualifying monthly housing expense?",
        "expected": 2900,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$2,250 + $350 + $125 + $75 + $100 = $2,900. Using principal and interest alone would omit supplied qualifying components."
      },
      {
        "id": "PEAP-T-03B-housing-ratio",
        "type": "computation",
        "prompt": "What is the housing ratio? Enter a percentage, not a decimal ratio, rounded to two decimals.",
        "expected": 47.8,
        "tolerance": 0.005,
        "unit": "percent",
        "rationale": "$2,900 ÷ ($2,800 × 26 ÷ 12) × 100 = 47.802197…%, displayed as 47.80%. This is a ratio under the supplied inputs, not an approval threshold."
      },
      {
        "id": "PEAP-T-03B-total-dti",
        "type": "computation",
        "prompt": "What is total DTI before the additional debt? Enter a percentage rounded to two decimals.",
        "expected": 59.34,
        "tolerance": 0.005,
        "unit": "percent",
        "rationale": "Other included payments total $420 + $180 + $100 = $700. ($2,900 + $700) ÷ ($2,800 × 26 ÷ 12) × 100 = 59.340659…%, displayed as 59.34%."
      },
      {
        "id": "PEAP-T-03B-changed-dti",
        "type": "computation",
        "prompt": "What is total DTI after including the additional $160 monthly debt, with all other inputs unchanged?",
        "expected": 61.98,
        "tolerance": 0.005,
        "unit": "percent",
        "rationale": "The numerator becomes $3,600 + $160 = $3,760. $3,760 ÷ ($2,800 × 26 ÷ 12) × 100 = 61.978021…%, displayed as 61.98%. Changed evidence requires the affected decision to be reviewed."
      },
      {
        "id": "PEAP-T-03B-funds-left",
        "type": "computation",
        "prompt": "How much of the eligible liquid assets remains after paying the stated remaining cash to close?",
        "expected": 5500,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$28,000 − $22,500 = $5,500. The closing amount already accounts for the earlier deposit, so do not subtract it again or count spent funds as reserves."
      },
      {
        "id": "PEAP-T-03B-required-reserves",
        "type": "computation",
        "prompt": "How much is required by this fictional two-month reserve condition?",
        "expected": 5800,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "2 × $2,900 = $5,800. Two months is supplied solely for this exercise; actual requirements must come from the applicable program and authorized review."
      },
      {
        "id": "PEAP-T-03B-reserve-shortfall",
        "type": "computation",
        "prompt": "What is the reserve shortfall under the supplied fictional condition?",
        "expected": 300,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$5,800 required − $5,500 remaining = $300 short. This limited result does not establish every asset requirement or the outcome of underwriting."
      },
      {
        "id": "PEAP-T-03B-limits",
        "type": "short-answer",
        "prompt": "Write two sentences explaining why you excluded the bonus, what the ratios establish, and what still needs a decision. Name one input you would revisit if closing funds were used for a proposed debt payoff.",
        "rubric": [
          "Keep the unresolved bonus separate from reviewer-accepted base pay",
          "Identify the accepted income denominator and the included housing and debt numerator",
          "State that no approval cutoff is supplied and that arithmetic cannot clear underwriting",
          "Recognize that a proposed payoff can affect remaining assets as well as debt treatment; obtain the applicable review before changing either"
        ],
        "rationale": "Do not improve a ratio by assuming a favorable income or debt decision. Trace the evidence and the authority for each changed input, then reconcile both the payment worksheet and the remaining funds."
      }
    ]
  },
  {
    "id": "PEAP-A-03C-oak",
    "title": "Route the Oak file changes",
    "module": "module-03",
    "context": "Use public learner case C3C to prepare an internal handoff and an applicant update from fictional facts. No communication is sent by this exercise.",
    "facts": [
      "On workday 8 an authorized underwriter issues a conditional purchase approval using the then-reviewed income and assets.",
      "On workday 10 the applicant reports reduced scheduled work hours.",
      "On workday 11 a new bank statement is uploaded and the processor marks uploads complete.",
      "The appraisal may contain a room-count error.",
      "A sales partner wants an unconditional approval letter today because the contract deadline is tomorrow. Do not determine contract rights or share applicant records with the sales partner."
    ],
    "sources": [
      {
        "url": "https://selling-guide.fanniemae.com/sel/b3-2-01/general-information-du",
        "reference": "PE03 P3-11: data, findings, documentation and lender responsibility; public case C3C is a separate fictional decision record"
      },
      {
        "url": "https://www.consumerfinance.gov/rules-policy/regulations/1026/42/",
        "reference": "PE03 P3-13: valuation independence, including appropriate requests for factual correction"
      }
    ],
    "tasks": [
      {
        "id": "PEAP-T-03C-handoff",
        "type": "short-answer",
        "prompt": "Prepare three handoff lines: income, bank record, and appraisal concern. In each, give the source fact, open decision, and responsible review function.",
        "rubric": [
          "Preserve the chronology and distinguish changed facts from the earlier conditional decision",
          "Separate a document upload from review and acceptance of the relevant condition",
          "Route a possible factual appraisal error through an authorized process without seeking a target value",
          "Name the review function for each open decision rather than assuming a job title grants all authority"
        ],
        "rationale": "A useful handoff connects evidence to the decision it affects and the person authorized to address it. The pressure of a contract date does not supply missing evidence or condition clearance."
      },
      {
        "id": "PEAP-T-03C-update",
        "type": "short-answer",
        "prompt": "Choose the current status from ready to fund, all conditions cleared, or changed facts and review outstanding. Explain your choice in a two-sentence applicant update without promising an outcome.",
        "rubric": [
          "Support the status with the supplied current record rather than the strongest past label",
          "Distinguish what was received from what still awaits a decision",
          "State an executable next step without promising funding, contract relief, or a valuation result"
        ],
        "rationale": "Read the scope of the conditional decision and identify which facts have changed since it was issued. Self-review the wording for unsupported certainty and unnecessary disclosure of private records."
      },
      {
        "id": "PEAP-T-03C-priority",
        "type": "short-answer",
        "prompt": "Which review would you route first, and what could be affected if a different order were chosen? Name a status or authority assumption you would verify.",
        "rubric": [
          "Tie the chosen priority to a specific unresolved fact and consequence",
          "Acknowledge other open reviews instead of silently clearing them",
          "Identify evidence or delegated authority needed to support the next status update"
        ],
        "rationale": "More than one review may need prompt coordination. Explain the dependency and preserve all open issues; a reasoned process matters more than an unsupported universal ordering."
      }
    ]
  },
  {
    "id": "PEAP-A-04A-programs",
    "title": "Check eligibility and compare obligations",
    "module": "module-04",
    "context": "First use public learner case 4A to question an approval promise. Then practice the separate numerical comparison from public worked example 4A. Do not combine the fictional borrowers or treat the quotes as current offers.",
    "facts": [
      "Alex and Nia want a principal residence and are considering two properties. Alex has a VA Certificate of Eligibility.",
      "A seller calls one property USDA eligible, but its address and household income eligibility have not been checked.",
      "The loan officer says either government program assures approval. No credit-score, debt-ratio, fee, or loan-limit threshold is supplied.",
      "In the separate Mira comparison, both quotes are for the same $285,000 30-year fixed-rate loan; nonloan expenses are identical and no fees are financed.",
      "Alder has $8,400 net upfront loan costs and $1,925 monthly principal and interest; Birch has $6,400 upfront and $1,975 monthly principal and interest.",
      "The supplied quote amounts are arithmetic assumptions, not market pricing. The comparison excludes time value, tax effects, remaining balances, and costs not stipulated equal."
    ],
    "sources": [
      {
        "url": "https://www.va.gov/housing-assistance/home-loans/loan-types/purchase-loan/",
        "reference": "PE04 S6: VA purchase eligibility and additional credit, income, and occupancy requirements"
      },
      {
        "url": "https://www.rd.usda.gov/programs-services/single-family-housing-programs/single-family-housing-guaranteed-loan-program",
        "reference": "PE04 S8: USDA Section 502 guaranteed program, property and household eligibility"
      },
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/on-a-mortgage-whats-the-difference-between-my-principal-and-interest-payment-and-my-total-monthly-payment-en-1941/",
        "reference": "PE04 S10: principal and interest versus total payment; public worked example 4A supplies comparison amounts"
      }
    ],
    "tasks": [
      {
        "id": "PEAP-T-04A-evidence",
        "type": "short-answer",
        "prompt": "In four short bullets identify the unsupported promise, one VA verification still needed, two USDA eligibility facts to establish, and one cost comparison that remains useful.",
        "rubric": [
          "Separate the program benefit or COE from an actual loan decision",
          "Identify evidence still needed for the borrower and proposed transaction",
          "Use official property and household eligibility resources rather than a seller description",
          "Compare obligations using stated assumptions without inventing a program threshold or fee"
        ],
        "rationale": "A program label is a starting point for verification. Preserve plausible options while identifying their evidence gaps, applicable requirements, and borrower obligations."
      },
      {
        "id": "PEAP-T-04A-explanation",
        "type": "short-answer",
        "prompt": "Replace the approval promise, then answer the fictional question: “If the government guarantees it, why do you still need my documents?” Include why no down payment need not mean no cash to close.",
        "rubric": [
          "Explain the purpose of the protection without promising approval or forgiveness of repayment",
          "Keep eligibility verification, underwriting, and cost comparison separate",
          "Distinguish down payment from other closing costs and adjustments"
        ],
        "rationale": "Review your explanation for a clear boundary between a financing benefit and the evidence required to use it. An optional self-check cannot approve an application."
      },
      {
        "id": "PEAP-T-04A-payments",
        "type": "computation",
        "prompt": "For Mira only, after how many monthly payments does Birch’s extra payment total its $2,000 upfront saving?",
        "expected": 40,
        "tolerance": 0,
        "unit": "payments",
        "rationale": "Upfront difference: $8,400 − $6,400 = $2,000. Monthly difference: $1,975 − $1,925 = $50. $2,000 ÷ $50 = 40 payments. This nominal comparison does not establish suitability."
      },
      {
        "id": "PEAP-T-04A-eighteen",
        "type": "computation",
        "prompt": "How much extra principal-and-interest payment does Birch require over 18 stipulated payments?",
        "expected": 900,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "18 × $50 = $900. Compare that payment difference with the $2,000 upfront difference while keeping the exercise’s omitted factors visible."
      },
      {
        "id": "PEAP-T-04A-sixty",
        "type": "computation",
        "prompt": "How much extra principal-and-interest payment does Birch require over 60 stipulated payments?",
        "expected": 3000,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "60 × $50 = $3,000. A holding-period comparison is useful, but the supplied figures do not predict a refinance or decide eligibility."
      }
    ]
  },
  {
    "id": "PEAP-A-04B-closing",
    "title": "Separate closing decisions and reconcile funds",
    "module": "module-04",
    "context": "Use public learner case 4B for a status note and wire-verification response. The numerical tasks use the separate Luca transaction in public worked example 4B; Elena’s loan amount is not part of that worksheet.",
    "facts": [
      "Elena has conditional approval for a $250,000 loan. The underwriter still needs acceptable evidence explaining a recent deposit, and settlement reports an unreleased prior lien.",
      "An assistant marks both items complete because Elena emailed a bank statement and said the old lien was paid. Her closing appointment is tomorrow.",
      "A new email changes the wire destination and requests immediate payment. No independent confirmation has been obtained.",
      "In the separate Luca worksheet, price is $360,000, loan proceeds $324,000, and gross borrower closing charges before credits $10,800, including all stipulated loan charges, prepaids, and initial escrow funding.",
      "Luca has already paid a $9,000 earnest-money deposit. The $3,600 seller credit and $1,200 lender credit are expressly permissible, approved, and fully usable.",
      "No other prorations, payoffs, financed charges, or adjustments apply. For the changed-credit calculation only, the lender credit falls from $1,200 to $700."
    ],
    "sources": [
      {
        "url": "https://www.consumerfinance.gov/owning-a-home/close/submit-documents-and-answer-requests-from-the-lender/",
        "reference": "PE04 S11: document review and lender requests"
      },
      {
        "url": "https://www.consumerfinance.gov/owning-a-home/close/shop-for-title-insurance-and-other-closing-services/",
        "reference": "PE04 S14: title and closing services; role limits remain fact-specific"
      },
      {
        "url": "https://www.consumerfinance.gov/owning-a-home/closing-disclosure/",
        "reference": "PE04 S18: Closing Disclosure and cash-to-close components; public worked example 4B supplies arithmetic assumptions"
      },
      {
        "url": "https://www.consumerfinance.gov/archive/blog/mortgage-closing-scams-how-protect-yourself-and-your-closing-funds/",
        "reference": "PE04 S19: CFPB closing-funds scam prevention, archived educational article"
      }
    ],
    "tasks": [
      {
        "id": "PEAP-T-04B-status",
        "type": "short-answer",
        "prompt": "Write a five-line status note for Elena that describes both open issues, their decision owners, why receipt is not acceptance, and what cannot yet be promised.",
        "rubric": [
          "Keep the deposit-source condition and the unreleased-lien issue distinct",
          "Name the review function authorized to resolve each issue",
          "Identify the received record or statement without treating it as documented clearance",
          "Explain what remains before a supported readiness update; do not promise funding or decide title rights"
        ],
        "rationale": "Coordinate credit and title work through their appropriate decision owners. A scheduled appointment, uploaded record, or borrower recollection does not itself supply the remaining decisions."
      },
      {
        "id": "PEAP-T-04B-wire",
        "type": "short-answer",
        "prompt": "Draft one sentence responding to the changed wire instructions. State how you would verify the destination before any payment.",
        "rubric": [
          "Pause reliance on the unexpected email and identify a trusted contact channel established independently of it",
          "Confirm the instructions with the authorized closing contact rather than replying only to the suspicious message",
          "Do not transmit funds or include real account information in this exercise"
        ],
        "rationale": "A familiar sender name is not proof of an authentic payment instruction. Use independently established contact information to verify a change; this drafting activity sends no communication."
      },
      {
        "id": "PEAP-T-04B-cash",
        "type": "computation",
        "prompt": "For Luca only, how much remaining cash to close is required with the original $1,200 lender credit?",
        "expected": 33000,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$360,000 − $324,000 + $10,800 − $9,000 − $3,600 − $1,200 = $33,000. Each source and credit is counted once; gross closing costs alone are not cash to close."
      },
      {
        "id": "PEAP-T-04B-balance",
        "type": "computation",
        "prompt": "What is the total of price plus gross charges, which the original sources must reconcile to?",
        "expected": 370800,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "Uses are $360,000 + $10,800 = $370,800. Sources are $324,000 loan + $9,000 deposit + $33,000 remaining contribution + $4,800 credits = $370,800. Balance proves only the stipulated arithmetic."
      },
      {
        "id": "PEAP-T-04B-change",
        "type": "computation",
        "prompt": "What is the remaining cash to close when the lender credit becomes $700 and all other facts stay unchanged?",
        "expected": 33500,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "The credit falls by $500, so the remaining contribution rises from $33,000 to $33,500. Reconcile the changed terms and route any disclosure consequences; do not infer a release authorization."
      }
    ]
  },
  {
    "id": "PEAP-A-04C-servicing",
    "title": "Resolve transfer confusion and payment components",
    "module": "module-04",
    "context": "Use public learner case 4C for Sam’s servicing issue. The numeric tasks separately use Rowan’s public worked example 4C and the public payoff illustration. Do not combine their accounts.",
    "facts": [
      "Sam’s covered loan transfers servicing on October 1. The payment is due October 1 with a contractual grace period through October 15.",
      "The old servicer receives the full payment on October 8. The new statement charges a late fee for that payment.",
      "Sam expects difficulty paying November’s installment and thinks the transfer provides two months without payments. No changed payment agreement is established.",
      "Separately, Rowan’s fixed scheduled principal and interest is $1,700. Prior escrow was $400; the previous total payment was $2,100.",
      "Rowan’s independently verified exercise analysis now requires $450 ongoing monthly escrow plus an allowed $600 shortage repayment over 12 months. No mortgage insurance or other components apply.",
      "In the independent payoff illustration, principal is $180,000 and a verified quote for the intended date includes $420 accrued interest and $80 unpaid charges, with no other amounts or offsets."
    ],
    "sources": [
      {
        "url": "https://www.consumerfinance.gov/rules-policy/regulations/1024/33/",
        "reference": "PE04 S21: Regulation X 1024.33(c), scoped protection for timely payments received by the transferor servicer"
      },
      {
        "url": "https://www.consumerfinance.gov/rules-policy/regulations/1024/17/",
        "reference": "PE04 S22: escrow definitions and analysis; Rowan’s figures and allowed repayment arrangement are expressly stipulated"
      },
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/what-is-a-payoff-amount-and-is-it-the-same-as-my-current-balance-en-205/",
        "reference": "PE04 S23: payoff versus current balance; numerical amounts come from the public lesson"
      },
      {
        "url": "https://www.consumerfinance.gov/consumer-tools/mortgages/how-to-avoid-foreclosure/",
        "reference": "PE04 S24: prompt servicer contact and HUD-approved counseling"
      },
      {
        "url": "https://www.consumerfinance.gov/rules-policy/regulations/1024/41/",
        "reference": "PE04 S26: loss-mitigation procedures and limits; no entitlement to a particular option from a request alone"
      }
    ],
    "tasks": [
      {
        "id": "PEAP-T-04C-transfer",
        "type": "short-answer",
        "prompt": "Explain the protection relevant to Sam’s October payment using the supplied transfer date, receipt date, and grace period. Then correct the proposed two-month payment holiday.",
        "rubric": [
          "Check the stipulated coverage, effective transfer date, old-servicer receipt, and contractual grace period",
          "Distinguish protection for a timely misdirected payment from permission to skip payments",
          "Keep the October payment question separate from November’s anticipated hardship"
        ],
        "rationale": "Use the rule’s actual conditions rather than interpreting “60 days” as a payment pause. Match the dates and receipt evidence to the particular payment; do not turn transfer protection into a new repayment agreement."
      },
      {
        "id": "PEAP-T-04C-record",
        "type": "short-answer",
        "prompt": "Identify the records and verified contact needed to raise the late-fee question, and one fact to check before relying on future automatic payments.",
        "rubric": [
          "Retain the transfer notice, payment receipt, and statement containing the disputed fee",
          "Identify the servicer’s verified designated channel for the account question",
          "Check future payment instructions and automatic-payment arrangements instead of assuming they transferred"
        ],
        "rationale": "A usable inquiry names the payment, dates, discrepancy, and supporting evidence. It does not promise a credit-record change or rely on an unverified caller to alter account terms."
      },
      {
        "id": "PEAP-T-04C-hardship",
        "type": "short-answer",
        "prompt": "What is the next step for the separate November hardship? Explain the limits of any proposed relief in two sentences.",
        "rubric": [
          "Encourage prompt contact with the verified servicer and identify HUD-approved counseling as a possible resource",
          "Distinguish a request for evaluation from an approved modification or forbearance arrangement",
          "Avoid promising forgiveness, a specific option, or that intentional missed payments create eligibility"
        ],
        "rationale": "Early contact helps the borrower understand available processes. A hardship request is not acceptance of changed loan terms, and temporary relief does not automatically erase amounts owed."
      },
      {
        "id": "PEAP-T-04C-shortage",
        "type": "computation",
        "prompt": "For Rowan only, what is the monthly shortage-recovery component under the stated 12-month arrangement?",
        "expected": 50,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$600 ÷ 12 = $50 per month. This is the verified exercise arrangement, not a universal shortage-repayment rule."
      },
      {
        "id": "PEAP-T-04C-new-payment",
        "type": "computation",
        "prompt": "What is Rowan’s new stipulated total monthly payment?",
        "expected": 2200,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$1,700 unchanged principal and interest + $450 ongoing escrow + $50 shortage recovery = $2,200. A higher total does not establish a changed note rate."
      },
      {
        "id": "PEAP-T-04C-increase",
        "type": "computation",
        "prompt": "By how much does Rowan’s total payment rise from the prior $2,100?",
        "expected": 100,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$2,200 − $2,100 = $100: $50 higher ongoing escrow plus $50 temporary shortage recovery. Future escrow needs can change, so this is not a permanent payment guarantee."
      },
      {
        "id": "PEAP-T-04C-payoff",
        "type": "computation",
        "prompt": "In the separate dated payoff illustration, what is the amount due under the verified quote?",
        "expected": 180500,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$180,000 + $420 + $80 = $180,500 for the stated payoff date. Do not substitute principal alone or deduct a remembered escrow balance; verify updated instructions if the date changes."
      }
    ]
  }
];
