/** Public formative practice only. No private instructor guide or summative bank is imported.
 * Sources: PE01/PE02 student review manuscripts and curriculum blueprint dated 2026-09-30.
 * All PEFP identifiers are newly assigned. Selection keys and numerical results support
 * transparent practice feedback, never credit, approval, course time or final assessment.
 * Short answers intentionally become self-review through the generic projection.
 */

export const PE_FOUNDATIONS = {
  "courseId": "national-safe-pe-foundations",
  "stateCode": "US",
  "stateName": "National mortgage",
  "courseTitle": "SAFE PE Foundations: PE01 and PE02",
  "curriculumDir": "nmls/pe-foundations/curriculum",
  "coverage": "two foundation modules; full 20-hour course in development",
  "recordUrl": "mortgage/pre-license/",
  "status": "Under construction; not NMLS approved; no credit",
  "access": "Free before, during and after paid enrollment; no account or payment required",
  "disclaimer": "Only PE01 and PE02 are included. This is not the full 20-hour course, is not NMLS approved and provides no credit. Optional self-review is not instructor assessment or course completion.",
  "version": "2026-09-30"
};

export const TOPIC_QUIZZES = {
  "module-01": [
    {
      "id": "PEFP-Q-01-01",
      "module": "module-01",
      "prompt": "A processor uploads complete bank statements. The fictional lender has assigned condition-clearance authority to its underwriter. What does the upload establish?",
      "choices": [
        "The asset condition is cleared",
        "The records were uploaded; the authorized review may still be pending",
        "The borrower has passed every licensing check",
        "The investor now services the loan"
      ],
      "correctChoice": 1,
      "rationale": "A receipt or portal status is evidence of an operational event. It does not show that the underwriter reviewed the documents or cleared the condition. Record the upload and obtain the documented decision from the assigned reviewer.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/ask-cfpb/whats-the-difference-between-a-mortgage-lender-and-a-mortgage-servicer-en-198/",
          "reference": "CFPB: Mortgage lender and servicer functions; fictional case decision authority is expressly stipulated"
        }
      ]
    },
    {
      "id": "PEFP-Q-01-02",
      "module": "module-01",
      "prompt": "Which statement best separates a mortgage servicer from the loan owner?",
      "choices": [
        "The servicer always owns every loan it administers",
        "The owner must collect every monthly payment directly",
        "Servicing administers the account, while ownership and servicing may be held by different firms",
        "A change of servicer necessarily creates a new loan"
      ],
      "correctChoice": 2,
      "rationale": "The servicer handles payment administration and other account responsibilities. It may or may not own the loan. A consumer should verify current servicing instructions separately from an ownership inquiry; neither a familiar logo nor the original broker proves the present owner.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/ask-cfpb/whats-the-difference-between-a-mortgage-lender-and-a-mortgage-servicer-en-198/",
          "reference": "CFPB: Mortgage lender and servicer functions; fictional case decision authority is expressly stipulated"
        },
        {
          "url": "https://www.consumerfinance.gov/ask-cfpb/how-can-i-tell-who-owns-my-mortgage-en-214/",
          "reference": "CFPB: How to identify a mortgage owner using a verified inquiry"
        }
      ]
    },
    {
      "id": "PEFP-Q-01-03",
      "module": "module-01",
      "prompt": "An individual has an NMLS identifier. What does that fact alone establish?",
      "choices": [
        "An identity associated with an NMLS record, requiring further review of current authority",
        "An active state license in every jurisdiction",
        "Approval of every loan the individual submits",
        "Completion of all education, testing and sponsorship requirements"
      ],
      "correctChoice": 0,
      "rationale": "An identifier is not universal permission to originate. The applicable pathway, current status, employer, jurisdiction and activity must still be checked. Education and testing are additional requirements, not an automatic grant of authority.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/rules-policy/regulations/1008/103/",
          "reference": "Regulation H, 12 CFR 1008.103: state licensing baseline, activity and exceptions"
        },
        {
          "url": "https://www.consumerfinance.gov/rules-policy/regulations/1008/105/",
          "reference": "Regulation H, 12 CFR 1008.105: minimum state license requirements, including approved education"
        }
      ]
    },
    {
      "id": "PEFP-Q-01-04",
      "module": "module-01",
      "prompt": "On stipulated facts, Morgan is an MLO employee of a covered financial institution. Which is the appropriate starting point?",
      "choices": [
        "Assume every bank affiliate receives the same treatment",
        "Ignore employment because an identifier never changes",
        "Treat the employer name as proof of all requirements",
        "Review the Regulation G federal registration pathway and applicable conditions"
      ],
      "correctChoice": 3,
      "rationale": "Covered-institution employment and MLO activity direct the initial review to Regulation G. Actual coverage, current registration and any exception conditions matter. A trade name or affiliation alone cannot settle the analysis, and federal registration is not itself a state license.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/rules-policy/regulations/1007/103/",
          "reference": "Regulation G, 12 CFR 1007.103: registration and maintenance requirements"
        },
        {
          "url": "https://www.consumerfinance.gov/rules-policy/regulations/1008/103/",
          "reference": "Regulation H, 12 CFR 1008.103: state licensing baseline, activity and exceptions"
        }
      ]
    },
    {
      "id": "PEFP-Q-01-05",
      "module": "module-01",
      "prompt": "A supervised assistant previously requested missing records but is now asked to recommend and negotiate particular loan terms. What should happen?",
      "choices": [
        "Nothing, because the title assistant has not changed",
        "Review the changed activity and applicable licensing authority before proceeding",
        "Assume the borrower can waive licensing requirements",
        "Treat every supervised worker as universally exempt"
      ],
      "correctChoice": 1,
      "rationale": "The actual activity has changed from document support toward offering or negotiating terms. Support-work exceptions have conditions, and independent-contractor arrangements require their own analysis. Check the person, activity, employer and jurisdiction rather than relying on the title.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/rules-policy/regulations/1008/23/",
          "reference": "Regulation H, 12 CFR 1008.23: definitions and clerical/support duties"
        },
        {
          "url": "https://www.consumerfinance.gov/rules-policy/regulations/1008/103/",
          "reference": "Regulation H, 12 CFR 1008.103: state licensing baseline, activity and exceptions"
        }
      ]
    },
    {
      "id": "PEFP-Q-01-06",
      "module": "module-01",
      "prompt": "A lender intends to retain a mortgage in its portfolio. Which conclusion is supported?",
      "choices": [
        "All federal consumer rules become optional",
        "The borrower no longer needs to repay",
        "The holding strategy does not by itself remove applicable legal requirements",
        "The loan must be insured by the government"
      ],
      "correctChoice": 2,
      "rationale": "Portfolio describes a holding strategy, not an exemption from law or underwriting. Legal, program and company requirements must be identified separately. Conventional, conforming, jumbo and qualified mortgage describe different questions and are not interchangeable approval labels.",
      "sources": [
        {
          "url": "https://www.fhfa.gov/about-fannie-mae-freddie-mac",
          "reference": "FHFA: Fannie Mae and Freddie Mac and the secondary mortgage market"
        },
        {
          "url": "https://www.consumerfinance.gov/rules-policy/regulations/1008/103/",
          "reference": "Regulation H, 12 CFR 1008.103: state licensing baseline, activity and exceptions"
        }
      ]
    },
    {
      "id": "PEFP-Q-01-07",
      "module": "module-01",
      "prompt": "A fictional internal policy expressly lets the credit manager authorize an alternative document review. Compliance has confirmed the proposed change conflicts with no law or program rule. What may the originator request?",
      "choices": [
        "A waiver of every remaining requirement",
        "Permission for any employee to approve the loan",
        "A change in state law",
        "The specified policy exception from the named decision owner"
      ],
      "correctChoice": 3,
      "rationale": "The stipulated authority is narrow: the credit manager may decide that policy alternative. It does not expand into authority to waive law, investor requirements or unrelated conditions. Name the policy, requested alternative and responsible decision maker. The example is an invented company policy, not a federal rule.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/ask-cfpb/whats-the-difference-between-a-mortgage-lender-and-a-mortgage-servicer-en-198/",
          "reference": "CFPB: Mortgage lender and servicer functions; fictional case decision authority is expressly stipulated"
        }
      ]
    },
    {
      "id": "PEFP-Q-01-08",
      "module": "module-01",
      "prompt": "What does completing this PE01/PE02 public practice establish?",
      "choices": [
        "Practice of two foundation modules, with no credit and no NMLS approval",
        "Completion of the full approved 20-hour course",
        "Permission to originate in any state after taking the quiz",
        "An instructor-approved course completion record"
      ],
      "correctChoice": 0,
      "rationale": "This under-construction slice is self-guided noncredit practice. It is not NMLS approved and is not the complete 20-hour course. Approved education, national testing and applicable state licensing requirements remain separate; a practice score is not completion or authority.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/rules-policy/regulations/1008/105/",
          "reference": "Regulation H, 12 CFR 1008.105: minimum state license requirements, including approved education"
        },
        {
          "url": "https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/ugIndState/licensing/individual/topics/licInd_PrepcompletingPreLicensureEducation.html",
          "reference": "NMLS: Completing Pre-Licensure Education; verify additional state requirements"
        }
      ]
    }
  ],
  "module-02": [
    {
      "id": "PEFP-Q-02-01",
      "module": "module-02",
      "prompt": "A $150,000 opening principal balance has a 6% annual note rate under a monthly convention. The stipulated P and I payment is $1,000. What is the allocation?",
      "choices": [
        "$1,000 interest and no principal reduction",
        "$750 interest, $250 principal and $149,750 ending principal",
        "$250 interest, $750 principal and $149,250 ending principal",
        "$9,000 interest and $8,000 additional principal"
      ],
      "correctChoice": 1,
      "rationale": "Monthly interest is $150,000 × 0.06 ÷ 12 = $750. Subtract interest from the $1,000 payment to obtain $250 principal, then subtract that principal from the opening balance. This one-period calculation does not determine the loan term, escrow amount or payoff.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/",
          "reference": "CFPB: How mortgage amortization allocates payments; calculations use the stated fictional inputs"
        }
      ]
    },
    {
      "id": "PEFP-Q-02-02",
      "module": "module-02",
      "prompt": "What does 1.25 points on a $240,000 loan equal?",
      "choices": [
        "$300",
        "$30,000",
        "$3,000",
        "$2,400"
      ],
      "correctChoice": 2,
      "rationale": "One point is 1% of the loan amount. Convert 1.25% to 0.0125 and multiply by $240,000 to obtain $3,000. Do not use the purchase price, 1.25 as the multiplier, or an assumed rate reduction. The actual offers determine what discount points buy.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/ask-cfpb/how-should-i-use-lender-credits-and-points-also-called-discount-points-en-136/",
          "reference": "CFPB: Lender credits and discount points; hypothetical savings calculations are not product offers"
        }
      ]
    },
    {
      "id": "PEFP-Q-02-03",
      "module": "module-02",
      "prompt": "Otherwise identical offers differ only by $1,500 paid upfront and $25 monthly P and I savings. What can the simple payment-savings comparison show?",
      "choices": [
        "Savings equal the upfront difference after 60 payments",
        "The lower payment is best for every borrower after six months",
        "The calculation includes taxes and opportunity cost",
        "The rate must fall by exactly one percentage point"
      ],
      "correctChoice": 0,
      "rationale": "$1,500 ÷ $25 = 60 months. The result compares cumulative scheduled payment savings with one upfront difference under the stated assumptions. It excludes payoff-balance differences, time value of money, taxes and other fees, so it is not a complete recommendation.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/ask-cfpb/how-should-i-use-lender-credits-and-points-also-called-discount-points-en-136/",
          "reference": "CFPB: Lender credits and discount points; hypothetical savings calculations are not product offers"
        }
      ]
    },
    {
      "id": "PEFP-Q-02-04",
      "module": "module-02",
      "prompt": "For this purchase only, use the lower of price or appraisal: price $250,000; appraisal $240,000; first mortgage $180,000; fully advanced closed-end second $12,000. Which pair is correct?",
      "choices": [
        "LTV 72%; CLTV 76.8%",
        "LTV 80%; CLTV 75%",
        "LTV 75%; CLTV 75%",
        "LTV 75%; CLTV 80%"
      ],
      "correctChoice": 3,
      "rationale": "The stated denominator is $240,000. LTV is $180,000 ÷ $240,000 = 75%; CLTV adds the $12,000 second, so $192,000 ÷ $240,000 = 80%. This arithmetic does not approve the borrower or financing. Other programs and transaction types may use different rules.",
      "sources": [
        {
          "url": "https://selling-guide.fanniemae.com/sel/b2-1.2-01/loan-value-ltv-ratios",
          "reference": "Fannie Mae Selling Guide B2-1.2-01, June 1 2022: LTV value basis and program rounding; practice uses stated inputs"
        },
        {
          "url": "https://selling-guide.fanniemae.com/sel/b2-1.2-02/combined-loan-value-cltv-ratios",
          "reference": "Fannie Mae Selling Guide B2-1.2-02, December 4 2018: CLTV and drawn HELOC amounts"
        }
      ]
    },
    {
      "id": "PEFP-Q-02-05",
      "module": "module-02",
      "prompt": "A HELOC shows a $20,000 limit and $5,000 drawn. Under the cited ordinary Fannie Mae definitions, which distinction matters?",
      "choices": [
        "Use the entire line for every CLTV calculation in every program",
        "CLTV includes the drawn balance; HCLTV generally uses the full line as specified in that guide",
        "Ignore the line when calculating all secured-debt ratios",
        "Treat the undrawn portion as the borrower’s unborrowed cash"
      ],
      "correctChoice": 1,
      "rationale": "The cited investor guide distinguishes CLTV from HCLTV. Identify the requested metric and governing program, including any applicable modification or exception, before selecting the numerator. These are investor-specific definitions, not a universal federal meaning of equity.",
      "sources": [
        {
          "url": "https://selling-guide.fanniemae.com/sel/b2-1.2-02/combined-loan-value-cltv-ratios",
          "reference": "Fannie Mae Selling Guide B2-1.2-02, December 4 2018: CLTV and drawn HELOC amounts"
        },
        {
          "url": "https://selling-guide.fanniemae.com/sel/b2-1.2-03/home-equity-combined-loan-value-hcltv-ratios",
          "reference": "Fannie Mae Selling Guide B2-1.2-03, February 23 2016: HCLTV and full HELOC amounts"
        }
      ]
    },
    {
      "id": "PEFP-Q-02-06",
      "module": "module-02",
      "prompt": "Why is “6% note rate plus one point equals 7% APR” not a reliable calculation?",
      "choices": [
        "APR means appreciation of the property",
        "Points cannot ever affect credit cost",
        "APR requires the applicable finance-charge and cash-flow calculation rather than simple addition",
        "APR and note rate are always identical"
      ],
      "correctChoice": 2,
      "rationale": "A point is a one-time percentage charge; the note rate is annual. APR relates the amount and timing of value received to payments under Regulation Z. Applicable finance charges matter, but some costs are excluded. This practice does not generate an APR disclosure.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/rules-policy/regulations/1026/22/",
          "reference": "Regulation Z, 12 CFR 1026.22: determination of annual percentage rate"
        },
        {
          "url": "https://www.consumerfinance.gov/rules-policy/regulations/1026/4/",
          "reference": "Regulation Z, 12 CFR 1026.4: finance charge rules and exclusions"
        }
      ]
    },
    {
      "id": "PEFP-Q-02-07",
      "module": "module-02",
      "prompt": "Which document primarily records the borrower’s promise to repay and its payment terms?",
      "choices": [
        "The promissory note",
        "The real-estate listing",
        "An appraisal photograph",
        "The conveyance deed alone"
      ],
      "correctChoice": 0,
      "rationale": "The note states the repayment promise. The mortgage or deed of trust provides property security, while the conveyance deed transfers ownership. Read the actual documents and governing law; signing a security instrument does not always mean the signer is personally liable on the note.",
      "sources": [
        {
          "url": "https://www.consumerfinance.gov/ask-cfpb/what-documents-should-i-receive-before-closing-on-a-mortgage-loan-en-181/",
          "reference": "CFPB: Closing documents, including the promissory note and mortgage/security instrument"
        }
      ]
    },
    {
      "id": "PEFP-Q-02-08",
      "module": "module-02",
      "prompt": "A retained creditor signs a subordination agreement. What does that establish by itself?",
      "choices": [
        "The retained debt is forgiven",
        "Every underwriting condition is complete",
        "Foreclosure must be judicial nationwide",
        "Relative lien priority may change under the agreement and applicable law"
      ],
      "correctChoice": 3,
      "rationale": "Subordination concerns priority. It does not by itself repay or forgive debt, release a lien, approve the borrower or determine a state’s remedies. Confirm the agreement’s scope and required title and underwriting evidence for the actual transaction.",
      "sources": [
        {
          "url": "https://selling-guide.fanniemae.com/sel/b2-1.2-04/subordinate-financing",
          "reference": "Fannie Mae Selling Guide B2-1.2-04: subordinate financing and resubordination; investor-specific requirements"
        },
        {
          "url": "https://www.consumerfinance.gov/ask-cfpb/how-does-foreclosure-work-en-287/",
          "reference": "CFPB: Foreclosure process and the importance of applicable law"
        }
      ]
    }
  ]
};

export const SCENARIOS = [
  {
    "id": "PEFP-A-01-roles",
    "title": "Separate receipt from clearance",
    "module": "module-01",
    "context": "Sam seeks a fictional home-purchase loan through Cedar Desk Mortgage. Harborline is the lender, Eli is the processor and Noor is the authorized underwriter.",
    "facts": [
      "Noor’s conditional decision requires complete asset records.",
      "Eli has uploaded the requested pages; no later review is documented.",
      "After an earlier clearance in a separate variation, Sam reports using part of the funds to buy a vehicle."
    ],
    "sources": [
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/whats-the-difference-between-a-mortgage-lender-and-a-mortgage-servicer-en-198/",
        "reference": "CFPB: Mortgage lender and servicer functions; fictional case decision authority is expressly stipulated"
      }
    ],
    "tasks": [
      {
        "id": "PEFP-T-01-receipt",
        "type": "selection",
        "prompt": "Which status is supported by the uploaded records?",
        "choices": [
          "Every condition is cleared",
          "The broker guarantees closing",
          "Records are received; the asset review remains pending",
          "The investor must collect the payments"
        ],
        "correctChoice": 2,
        "rationale": "The upload proves receipt. It does not prove review or clearance. Noor has the stipulated decision authority; the record should identify the evidence received and the unresolved condition."
      },
      {
        "id": "PEFP-T-01-changed",
        "type": "selection",
        "prompt": "In the changed-funds variation, what is the best next step?",
        "choices": [
          "Document the new asset information and route it for authorized review",
          "Ignore the change because a clearance already exists",
          "Declare proven fraud immediately",
          "Ask the settlement agent to edit the statement"
        ],
        "correctChoice": 0,
        "rationale": "The changed balance may affect the earlier decision. Preserve and route the new fact without inventing a fraud finding or altering a source record. A current decision is needed from the person with authority."
      },
      {
        "id": "PEFP-T-01-handoff",
        "type": "short-answer",
        "prompt": "Draft a two-sentence factual handoff for the original pending condition.",
        "rubric": [
          "Identify the received asset records and the actual current status",
          "Name Noor as the stipulated review owner",
          "Avoid guaranteeing approval or treating upload as clearance"
        ],
        "rationale": "A useful response says what arrived and what remains: the pages were received and the asset condition is awaiting Noor’s documented review. Self-review evaluates your reasoning; it is not an instructor grade."
      }
    ]
  },
  {
    "id": "PEFP-A-02-licensing",
    "title": "Read two licensing records",
    "module": "module-01",
    "context": "Two fictional workers have NMLS identifiers but different employment and status records.",
    "facts": [
      "Morgan is an MLO employee of a covered bank with current federal registration shown.",
      "Taylor works for a nonbank; a state license application is pending.",
      "No temporary-authority determination is supplied for Taylor."
    ],
    "sources": [
      {
        "url": "https://www.consumerfinance.gov/rules-policy/regulations/1007/103/",
        "reference": "Regulation G, 12 CFR 1007.103: registration and maintenance requirements"
      },
      {
        "url": "https://www.consumerfinance.gov/rules-policy/regulations/1008/103/",
        "reference": "Regulation H, 12 CFR 1008.103: state licensing baseline, activity and exceptions"
      }
    ],
    "tasks": [
      {
        "id": "PEFP-T-02-morgan",
        "type": "selection",
        "prompt": "Which is the appropriate starting conclusion for Morgan?",
        "choices": [
          "An identifier authorizes every activity everywhere",
          "The stipulated facts point to the federal registration pathway",
          "Morgan automatically has every state license",
          "The record approves the bank’s next loan"
        ],
        "correctChoice": 1,
        "rationale": "The stipulated covered-bank employment and registration point to Regulation G. Verify the actual activity, coverage and current conditions rather than equating registration with a universal state license."
      },
      {
        "id": "PEFP-T-02-taylor",
        "type": "selection",
        "prompt": "What must be resolved before treating Taylor as authorized to originate?",
        "choices": [
          "Whether Morgan has more experience",
          "Whether Taylor’s employer likes the property",
          "The number of employees at the bank",
          "The applicable current authority, including any actual temporary-authority determination"
        ],
        "correctChoice": 3,
        "rationale": "A filed application and identifier alone do not establish authority. Temporary authority is conditional, not permission that every applicant receives by filing. Obtain the applicable status and compliance determination."
      },
      {
        "id": "PEFP-T-02-activity",
        "type": "short-answer",
        "prompt": "Taylor is asked to move from requesting missing documents to negotiating terms. What facts should the licensing reviewer receive?",
        "rubric": [
          "Describe the proposed term recommendation or negotiation, not just the job title",
          "Identify employer, employment or contractor arrangement and jurisdiction",
          "Distinguish an unanswered authority question from a verified licensing conclusion"
        ],
        "rationale": "Activity, employment and jurisdiction change the analysis. Record those facts and obtain the appropriate licensing review before proceeding; do not infer an exemption from the title assistant."
      }
    ]
  },
  {
    "id": "PEFP-A-03-source",
    "title": "Find the applicable official checklist",
    "module": "module-01",
    "context": "Choose one jurisdiction for an optional source-navigation exercise. No application or personal information is needed.",
    "facts": [
      "Use the current NMLS State Resource Center and relevant agency checklist.",
      "This public slice is not NMLS approved and provides no credit.",
      "National education, the national test and state authority are separate checks."
    ],
    "sources": [
      {
        "url": "https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/stateresourcecenter/SitePages/Checklist-Compiler.aspx",
        "reference": "NMLS: Licensing Checklists, Requirements and Fees; use the applicable current agency checklist"
      },
      {
        "url": "https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/ugIndState/licensing/individual/topics/licInd_PrepcompletingPreLicensureEducation.html",
        "reference": "NMLS: Completing Pre-Licensure Education; verify additional state requirements"
      },
      {
        "url": "https://www.consumerfinance.gov/rules-policy/regulations/1008/105/",
        "reference": "Regulation H, 12 CFR 1008.105: minimum state license requirements, including approved education"
      }
    ],
    "tasks": [
      {
        "id": "PEFP-T-03-record",
        "type": "short-answer",
        "prompt": "Record the agency and license type, official source URL, any shown revision date, today’s access date and one requirement to verify beyond approved national PE.",
        "rubric": [
          "Identify one agency and license type rather than a generic state label",
          "Use an official agency or NMLS URL and record the access date",
          "Quote or summarize one actual additional requirement with its source",
          "Mark a missing revision date or unavailable page honestly and avoid entering personal identifiers"
        ],
        "rationale": "There is no single state answer. A useful record makes the current source and its limits traceable. If the page moved, continue through the official agency or NMLS resource center; do not invent a requirement, date or approval."
      },
      {
        "id": "PEFP-T-03-correction",
        "type": "short-answer",
        "prompt": "Correct this claim in two sentences: “Passing the national test and receiving an NMLS number lets me originate anywhere.”",
        "rubric": [
          "Separate the identifier and national test from current licensing or registration authority",
          "Identify jurisdiction, actual activity and employer as facts to check",
          "Recognize that state-specific requirements may remain"
        ],
        "rationale": "The identifier identifies a record and the national test is one requirement. Applicable state licensing or federal registration and any employer/sponsorship conditions must still be verified. This reflection does not determine anyone’s eligibility."
      }
    ]
  },
  {
    "id": "PEFP-A-04-markets",
    "title": "Resolve the Oak Street handoff",
    "module": "module-01",
    "context": "Leah applied through a broker. The lender issued conditional approval, and a sales message now claims investor acceptance means every approval is finished.",
    "facts": [
      "Requested records were uploaded but no subsequent underwriting decision is in the file.",
      "Leah received a mortgage-ownership notice and asks where to send her next payment.",
      "A new documentation condition appears, but its source is unidentified."
    ],
    "sources": [
      {
        "url": "https://www.fhfa.gov/about-fannie-mae-freddie-mac",
        "reference": "FHFA: Fannie Mae and Freddie Mac and the secondary mortgage market"
      },
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/whats-the-difference-between-a-mortgage-lender-and-a-mortgage-servicer-en-198/",
        "reference": "CFPB: Mortgage lender and servicer functions; fictional case decision authority is expressly stipulated"
      },
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/how-can-i-tell-who-owns-my-mortgage-en-214/",
        "reference": "CFPB: How to identify a mortgage owner using a verified inquiry"
      }
    ],
    "tasks": [
      {
        "id": "PEFP-T-04-condition",
        "type": "selection",
        "prompt": "What is the responsible next step for closing status?",
        "choices": [
          "Mark the file complete because the investor is interested",
          "Delete the conditional approval",
          "Ask the borrower to vote on readiness",
          "Obtain the authorized review of the outstanding condition"
        ],
        "correctChoice": 3,
        "rationale": "Investor interest, acceptance or purchase does not by itself resolve the lender’s conditions. Obtain the relevant documented review before changing the status."
      },
      {
        "id": "PEFP-T-04-payment",
        "type": "selection",
        "prompt": "What should Leah do about the payment destination?",
        "choices": [
          "Stop payments immediately",
          "Verify the notice and current servicing instructions through established channels",
          "Pay the broker because the broker originated the file",
          "Use bank details in an unverified text"
        ],
        "correctChoice": 1,
        "rationale": "Loan ownership and servicing can move together or separately. Verify the existing servicer’s official information and actual notice rather than redirecting or stopping a payment based on an unsupported inference."
      },
      {
        "id": "PEFP-T-04-policy",
        "type": "short-answer",
        "prompt": "Write the next step for identifying the new condition and any possible exception.",
        "rubric": [
          "Identify whether the condition comes from law, a program, investor requirements or company policy",
          "Name the authorized reviewer for that source rather than assuming a broker can waive it",
          "Keep the condition unresolved until its scope and decision are verified"
        ],
        "rationale": "Different sources can create overlapping requirements. An internal manager’s exception authority does not waive a statute or another program’s rule. Record the requirement, source and responsible decision owner before discussing alternatives."
      }
    ]
  },
  {
    "id": "PEFP-A-05-amortization",
    "title": "Build two amortization rows",
    "module": "module-02",
    "context": "Compute the first two payments of a fictional $180,000 fixed-rate fully amortizing loan.",
    "facts": [
      "Annual note rate 6%; monthly rate 0.005; 360 end-of-month payments.",
      "Use the standard level-payment formula and round the scheduled payment to cents.",
      "Round each month’s interest to cents, then subtract it from the rounded payment.",
      "P and I excludes taxes, insurance, mortgage insurance and association dues."
    ],
    "sources": [
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/",
        "reference": "CFPB: How mortgage amortization allocates payments; calculations use the stated fictional inputs"
      },
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/why-did-my-monthly-mortgage-payment-go-up-or-change-en-213/",
        "reference": "CFPB: Why a monthly mortgage payment may change"
      }
    ],
    "tasks": [
      {
        "id": "PEFP-T-05-payment",
        "type": "computation",
        "prompt": "What is the monthly principal-and-interest payment, rounded to cents?",
        "expected": 1079.19,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$180,000 × 0.005 ÷ [1 − (1.005)^−360] = $1,079.190945…; the schedule uses $1,079.19."
      },
      {
        "id": "PEFP-T-05-interest1",
        "type": "computation",
        "prompt": "What is month 1 interest?",
        "expected": 900,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$180,000 × 0.005 = $900.00. Interest is based on that month’s opening principal."
      },
      {
        "id": "PEFP-T-05-principal1",
        "type": "computation",
        "prompt": "How much principal does payment 1 repay?",
        "expected": 179.19,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$1,079.19 − $900.00 = $179.19 principal."
      },
      {
        "id": "PEFP-T-05-ending1",
        "type": "computation",
        "prompt": "What is the principal balance after payment 1?",
        "expected": 179820.81,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$180,000.00 − $179.19 = $179,820.81."
      },
      {
        "id": "PEFP-T-05-interest2",
        "type": "computation",
        "prompt": "Using that new opening balance, what is month 2 interest rounded to cents?",
        "expected": 899.1,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$179,820.81 × 0.005 = $899.10405, rounded to $899.10. Using the original balance would incorrectly repeat $900.00."
      },
      {
        "id": "PEFP-T-05-principal2",
        "type": "computation",
        "prompt": "How much principal does payment 2 repay?",
        "expected": 180.09,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$1,079.19 − $899.10 = $180.09."
      },
      {
        "id": "PEFP-T-05-ending2",
        "type": "computation",
        "prompt": "What is the principal balance after payment 2?",
        "expected": 179640.72,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$179,820.81 − $180.09 = $179,640.72."
      },
      {
        "id": "PEFP-T-05-check",
        "type": "short-answer",
        "prompt": "Explain one consistency check and one limitation of this payment figure.",
        "rubric": [
          "Check that interest plus principal equals the payment and principal reduces the opening balance",
          "Identify at least one cost excluded from P and I",
          "Avoid treating the schedule as an exact payoff statement or approval"
        ],
        "rationale": "The row sums must reconcile. Fixed P and I does not fix tax or insurance costs, and a real payoff can include accrued interest and other permitted amounts. These inputs are a teaching example, not a loan offer."
      }
    ]
  },
  {
    "id": "PEFP-A-06-daily",
    "title": "Compare daily-interest rounding",
    "module": "module-02",
    "context": "Calculate a separate daily-interest amount without changing the monthly amortization schedule.",
    "facts": [
      "Principal is $180,000 at 6% annual interest.",
      "Exactly 12 interest days are stipulated on an actual/365 basis.",
      "Keep full precision until rounding the final amount to cents.",
      "For the comparison only, also compute the result when the daily amount is rounded first."
    ],
    "sources": [
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/what-is-a-payoff-amount-and-is-it-the-same-as-my-current-balance-en-205/",
        "reference": "CFPB: Payoff amount versus current balance; arithmetic uses the stated fictional convention"
      }
    ],
    "tasks": [
      {
        "id": "PEFP-T-06-final",
        "type": "computation",
        "prompt": "What is 12 days of interest using full precision until the final rounding?",
        "expected": 355.07,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$180,000 × 0.06 × 12 ÷ 365 = $355.068493…; round at the end to $355.07."
      },
      {
        "id": "PEFP-T-06-earlyround",
        "type": "computation",
        "prompt": "What result would rounding the daily amount to cents before multiplying by 12 produce?",
        "expected": 355.08,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "The daily amount is $29.589041…; rounding first gives $29.59 × 12 = $355.08. The one-cent difference comes from the rounding sequence."
      },
      {
        "id": "PEFP-T-06-limit",
        "type": "short-answer",
        "prompt": "Name the supplied convention and explain why the result is not a complete payoff.",
        "rubric": [
          "State actual/365 and exactly 12 interest days",
          "Explain that the final-only rounding policy is part of this exercise",
          "Distinguish interest from the total payoff and avoid inferring payment dates"
        ],
        "rationale": "A day-count basis, number of days and rounding policy are inputs, not universal rules. An actual payoff requires the verified statement and relevant charges for its specified date."
      }
    ]
  },
  {
    "id": "PEFP-A-07-points",
    "title": "Repair a points comparison",
    "module": "module-02",
    "context": "A fictional worksheet compares otherwise identical offers and claims $1,500 upfront for $25 monthly P and I savings breaks even in six months.",
    "facts": [
      "Assume the extra upfront cost is paid in cash, not financed.",
      "All other costs, principal and loan structure are identical for this simplified comparison.",
      "A separate points exercise uses 1.25 points on a $240,000 loan; do not add it to the offer comparison."
    ],
    "sources": [
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/how-should-i-use-lender-credits-and-points-also-called-discount-points-en-136/",
        "reference": "CFPB: Lender credits and discount points; hypothetical savings calculations are not product offers"
      }
    ],
    "tasks": [
      {
        "id": "PEFP-T-07-months",
        "type": "computation",
        "prompt": "After how many payments do cumulative savings equal the $1,500 upfront difference?",
        "expected": 60,
        "tolerance": 0,
        "unit": "months",
        "rationale": "$1,500 ÷ $25 per month = 60 months, not six. This is simple payment savings only."
      },
      {
        "id": "PEFP-T-07-savings",
        "type": "computation",
        "prompt": "How much cumulative payment savings would 36 payments produce?",
        "expected": 900,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "36 × $25 = $900. This is $600 less than the stated upfront difference; it is not a complete economic comparison."
      },
      {
        "id": "PEFP-T-07-points",
        "type": "computation",
        "prompt": "Separately, what is the dollar amount of 1.25 points on a $240,000 loan?",
        "expected": 3000,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "1.25 points means 1.25% of the loan amount: $240,000 × 0.0125 = $3,000."
      },
      {
        "id": "PEFP-T-07-limits",
        "type": "short-answer",
        "prompt": "Name two factors omitted from the simple comparison and explain why the result does not choose an offer for everyone.",
        "rubric": [
          "Identify two omitted factors such as payoff-balance differences, time value, taxes or other fees",
          "State that the assumed holding period and payment pattern matter",
          "Avoid a universal recommendation or a fixed points-to-rate conversion"
        ],
        "rationale": "A payment-only comparison can describe a tradeoff under its assumptions. Financed points, a different term, early payoff or other costs require a new comparison, and actual offers determine the rate exchange."
      }
    ]
  },
  {
    "id": "PEFP-A-08-ratios",
    "title": "Reconcile price value and debt",
    "module": "module-02",
    "context": "Use the expressly stipulated lower-of-price-or-appraisal convention for this fictional purchase.",
    "facts": [
      "Purchase price $250,000; appraised value $240,000.",
      "First mortgage $180,000; fully advanced closed-end second mortgage $12,000.",
      "No other secured debt or HELOC exists.",
      "Closing costs, prepaids, deposits, credits and prorations are excluded from the price-contribution figure."
    ],
    "sources": [
      {
        "url": "https://selling-guide.fanniemae.com/sel/b2-1.2-01/loan-value-ltv-ratios",
        "reference": "Fannie Mae Selling Guide B2-1.2-01, June 1 2022: LTV value basis and program rounding; practice uses stated inputs"
      },
      {
        "url": "https://selling-guide.fanniemae.com/sel/b2-1.2-02/combined-loan-value-cltv-ratios",
        "reference": "Fannie Mae Selling Guide B2-1.2-02, December 4 2018: CLTV and drawn HELOC amounts"
      }
    ],
    "tasks": [
      {
        "id": "PEFP-T-08-denominator",
        "type": "computation",
        "prompt": "Which dollar amount is the denominator?",
        "expected": 240000,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "The lower of $250,000 and $240,000 is $240,000. This is the supplied exercise convention, not a rule for every program or transaction."
      },
      {
        "id": "PEFP-T-08-ltv",
        "type": "computation",
        "prompt": "What is first-loan LTV? Enter a percentage such as 75, not 0.75.",
        "expected": 75,
        "tolerance": 0.01,
        "unit": "percent",
        "rationale": "$180,000 ÷ $240,000 × 100 = 75%."
      },
      {
        "id": "PEFP-T-08-debt",
        "type": "computation",
        "prompt": "What is the combined secured debt?",
        "expected": 192000,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$180,000 + $12,000 = $192,000. The second mortgage is borrowed funds, not a grant or the buyer’s unborrowed cash."
      },
      {
        "id": "PEFP-T-08-cltv",
        "type": "computation",
        "prompt": "What is CLTV? Enter a percentage.",
        "expected": 80,
        "tolerance": 0.01,
        "unit": "percent",
        "rationale": "$192,000 ÷ $240,000 × 100 = 80%. The exact whole-percent result does not require a delivery-rounding adjustment in this exercise."
      },
      {
        "id": "PEFP-T-08-contribution",
        "type": "computation",
        "prompt": "What is the simplified contribution toward the $250,000 purchase price before the excluded adjustments?",
        "expected": 58000,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$250,000 − $192,000 = $58,000. Appraised value less debt is only $48,000; the $10,000 price-appraisal gap explains the difference. Neither figure is final cash to close."
      },
      {
        "id": "PEFP-T-08-approval",
        "type": "selection",
        "prompt": "Which conclusion follows from correct LTV and CLTV arithmetic?",
        "choices": [
          "The borrower and second mortgage are approved",
          "The second mortgage becomes a grant",
          "Only the stated ratios are established; program eligibility and repayment analysis still need review",
          "The calculator may clear underwriting"
        ],
        "correctChoice": 2,
        "rationale": "Correct arithmetic establishes those ratios under stated assumptions. It does not establish acceptable subordinate financing, repayment capacity, property eligibility or a creditor’s approval."
      }
    ]
  },
  {
    "id": "PEFP-A-09-documents",
    "title": "Map three closing documents",
    "module": "module-02",
    "context": "Alex’s fictional closing packet includes a note, a property-security instrument and a conveyance deed.",
    "facts": [
      "The note promises to repay Harborline $240,000 at 6% under the stated payment schedule.",
      "A mortgage identifies the secured property and insurance and tax covenants.",
      "A conveyance deed transfers the seller’s ownership interest to Alex.",
      "In a separate deed-of-trust variation, Alex is trustor, Harborline beneficiary and Pine Trustee Services trustee."
    ],
    "sources": [
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/what-documents-should-i-receive-before-closing-on-a-mortgage-loan-en-181/",
        "reference": "CFPB: Closing documents, including the promissory note and mortgage/security instrument"
      },
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/how-does-foreclosure-work-en-287/",
        "reference": "CFPB: Foreclosure process and the importance of applicable law"
      }
    ],
    "tasks": [
      {
        "id": "PEFP-T-09-promise",
        "type": "selection",
        "prompt": "Where should you first check the contractual monthly P and I promise?",
        "choices": [
          "The property listing",
          "The promissory note",
          "An appraisal photo",
          "The conveyance deed alone"
        ],
        "correctChoice": 1,
        "rationale": "The note records the repayment promise and terms. The security instrument and conveyance deed perform separate functions, even when all are signed at closing."
      },
      {
        "id": "PEFP-T-09-security",
        "type": "selection",
        "prompt": "Which statement is supportable about the deed-of-trust variation?",
        "choices": [
          "Pine automatically becomes the borrower",
          "The trustee must be the monthly payment servicer",
          "The document selects the same foreclosure method nationwide",
          "The trustee’s role and authority require the instrument and applicable state law"
        ],
        "correctChoice": 3,
        "rationale": "Naming a trustee does not by itself make that party the borrower, owner or servicer. Legal effect and remedies depend on the instrument, jurisdiction and circumstances."
      },
      {
        "id": "PEFP-T-09-map",
        "type": "short-answer",
        "prompt": "Explain the separate jobs of note, security instrument and conveyance deed, and name one conclusion that needs legal review.",
        "rubric": [
          "Separate repayment promise, property security and ownership transfer",
          "Avoid assuming every security signer is personally obligated on the note",
          "Identify enforceability, title effect or remedy as a question for qualified jurisdiction-specific review"
        ],
        "rationale": "Document names help locate the right question. They do not alone decide enforceability or personal liability. An ownership transfer also does not automatically release an earlier borrower’s debt."
      }
    ]
  },
  {
    "id": "PEFP-A-10-liens",
    "title": "Resolve retained and unreleased liens",
    "module": "module-02",
    "context": "A proposed refinance pays off an existing first loan and leaves a $12,000 second loan in place. A separate distribution illustration tests only arithmetic under expressly stipulated priority.",
    "facts": [
      "The retained creditor emailed “approved” without saying what was approved.",
      "An older loan reportedly paid off remains listed in title work.",
      "The new lender’s underwriting conditions are still pending.",
      "For the independent distribution illustration only: legal review has already established A senior to B, no other claims, $210,000 available after all costs, A owed $190,000 and B owed $40,000."
    ],
    "sources": [
      {
        "url": "https://selling-guide.fanniemae.com/sel/b2-1.2-04/subordinate-financing",
        "reference": "Fannie Mae Selling Guide B2-1.2-04: subordinate financing and resubordination; investor-specific requirements"
      },
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/what-documents-should-i-receive-before-closing-on-a-mortgage-loan-en-181/",
        "reference": "CFPB: Closing documents, including the promissory note and mortgage/security instrument"
      },
      {
        "url": "https://www.fhfa.gov/news/statement/statement-of-the-federal-housing-finance-agency-on-certain-super-priority-liens",
        "reference": "FHFA statement, December 22 2014: certain super-priority liens; illustrates the need for state-specific priority review, not a national priority rule"
      },
      {
        "url": "https://www.consumerfinance.gov/ask-cfpb/how-does-foreclosure-work-en-287/",
        "reference": "CFPB: Foreclosure process and the importance of applicable law"
      }
    ],
    "tasks": [
      {
        "id": "PEFP-T-10-email",
        "type": "selection",
        "prompt": "What cannot be established by the vague email alone?",
        "choices": [
          "Completion of all priority and underwriting requirements",
          "That an email was received",
          "That someone used the word approved",
          "That clarification is needed"
        ],
        "correctChoice": 0,
        "rationale": "The email does not identify whether it approves subordination, payoff, continued borrowing or another request. Clarify its scope and obtain the required documented decisions; a broad approval label cannot replace them."
      },
      {
        "id": "PEFP-T-10-record",
        "type": "short-answer",
        "prompt": "List the unresolved retained-lien issue, evidence needed for the older paid loan and responsible next steps before claiming readiness.",
        "rubric": [
          "Identify the retained lien’s required priority and scoped subordination or other authorized resolution",
          "Seek payoff and authorized release/satisfaction/reconveyance evidence with title review for the old lien",
          "Keep the new lender’s pending underwriting conditions separate",
          "Do not assert a foreclosure procedure or personal deficiency rule from these facts"
        ],
        "rationale": "Subordination changes relative priority under its terms; release concerns the security interest. Payment evidence, a cleared title record and underwriting clearance answer different questions. Obtain the appropriate creditor, title and legal review rather than deleting an unresolved lien."
      },
      {
        "id": "PEFP-T-10-senior",
        "type": "computation",
        "prompt": "In the independent stipulated distribution, how much goes to senior Creditor A?",
        "expected": 190000,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "With $210,000 available after all costs and no other claims, the established senior claim is paid its stated $190,000."
      },
      {
        "id": "PEFP-T-10-junior",
        "type": "computation",
        "prompt": "How much remains for junior Creditor B in that illustration?",
        "expected": 20000,
        "tolerance": 0.005,
        "unit": "dollars",
        "rationale": "$210,000 − $190,000 = $20,000 for B. The $20,000 unpaid part of B’s claim does not by itself establish personal deficiency liability, survival of a lien or any lawful sale procedure."
      }
    ]
  }
];

