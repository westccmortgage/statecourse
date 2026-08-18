/**
 * California Mortgage Loan Brokering and Lending (45 hours) — lesson question bank.
 * Format and authoring standard: see practice-question-bank.mjs.
 * Course version 1.0 — not approved; no California credit is available.
 */

const assignments = {
  "assignment-01": {
    subject: "California mortgage brokerage and regulatory structure",
    applied: {
      prompt: "A California real estate salesperson working under a licensed broker wants to originate residential mortgage loans. She plans to solicit borrowers, take applications in her own name, collect an advance fee for her services, and be paid directly by the lender. Which parts of her plan are problems?",
      choices: [
        "Acting in her own name rather than for her broker, taking direct payment from the lender, and collecting an advance fee without the required authorization — and residential mortgage origination additionally requires an MLO endorsement.",
        "Only the advance fee, since fees collected before services are rendered are the sole regulated element.",
        "Only the direct payment, since compensation routing is the only structural requirement.",
        "None of it, provided she discloses her broker relationship to each borrower."
      ],
      correctChoice: 0,
      rationale: "Four separate requirements are engaged at once: licensed activity is conducted for and under the broker, compensation flows through the broker, advance fee arrangements are specially regulated, and residential mortgage loan origination requires the endorsement. Disclosure does not substitute for any of them."
    },
    engagement: [
      {
        prompt: "What authority does a California real estate broker license confer regarding mortgage loans?",
        choices: [
          "It permits the broker to solicit borrowers or lenders for, and negotiate, loans secured by real property, as licensed activity performed under the broker's responsibility.",
          "It permits the broker to make loans only from the broker's own funds.",
          "It permits the broker to service loans but not to originate them.",
          "It permits mortgage activity only if the broker holds no other real estate listings."
        ],
        correctChoice: 0,
        rationale: "Soliciting and negotiating loans secured by real property is within the broker's licensed activity. It is not confined to the broker's own funds, not limited to servicing, and not conditioned on abstaining from other brokerage work."
      },
      {
        prompt: "What is the purpose of the mortgage loan originator endorsement on a California real estate license?",
        choices: [
          "It authorizes the licensee to engage in residential mortgage loan origination, reflecting the federal framework requiring originators to be licensed or registered and identified in the national registry.",
          "It replaces the underlying real estate license for mortgage activity.",
          "It permits the licensee to originate loans without broker supervision.",
          "It is required only for licensees who originate commercial mortgage loans."
        ],
        correctChoice: 0,
        rationale: "The endorsement adds residential origination authority to an existing license within the national licensing framework. It does not replace the license, remove supervision, and it addresses residential rather than commercial lending."
      },
      {
        prompt: "How does the broker's supervisory obligation apply to mortgage activity?",
        choices: [
          "The broker remains responsible for supervising the licensed mortgage activity of those acting under the license, including advertising, disclosures, and handling of funds.",
          "Supervision applies to sales activity but not to loan origination, which is governed federally.",
          "Supervision is satisfied by the originator's own compliance training.",
          "Supervision applies only where the broker personally participates in the transaction."
        ],
        correctChoice: 0,
        rationale: "Supervision follows the license into mortgage work. Federal overlay does not displace it, training is not supervision, and the obligation does not depend on the broker's personal involvement in each file."
      },
      {
        prompt: "A borrower complains that a mortgage broker misrepresented the loan terms. Which body has authority over the licensee's real estate license?",
        choices: [
          "The Department of Real Estate, which licenses and disciplines California real estate brokers and salespersons.",
          "The lender that funded the loan, which may bar the broker from future submissions.",
          "The national mortgage registry, which issues and revokes state licenses.",
          "The escrow company, which handled the closing."
        ],
        correctChoice: 0,
        rationale: "Licensing authority over a California real estate broker rests with the Department. A lender may end a business relationship and the registry records licensure, but neither disciplines the license."
      },
      {
        prompt: "Why does the distinction between licensed and exempt mortgage activity matter?",
        choices: [
          "Because engaging in activity that requires a license without holding one is unlawful, and the applicable exemptions are specific rather than general.",
          "Because exempt entities are held to stricter standards than licensees.",
          "Because exemption determines which lender may fund the loan.",
          "Because exempt activity may be performed by a salesperson without a broker."
        ],
        correctChoice: 0,
        rationale: "The line determines whether conduct is lawful at all, and exemptions are narrow and defined. Exemption is not a stricter standard, does not select the lender, and does not remove broker supervision for licensees."
      }
    ],
    remediation: [
      {
        prompt: "A licensee proposes to collect a fee from a borrower before performing any services in exchange for arranging a loan. What is required?",
        choices: [
          "Advance fee arrangements are specially regulated in California, including requirements about the agreement and the handling of the funds, and the licensee must satisfy those requirements before collecting anything.",
          "Nothing, provided the fee is refundable if the loan does not close.",
          "Nothing, provided the borrower signs a written acknowledgment of the fee.",
          "The fee is prohibited in all circumstances."
        ],
        correctChoice: 0,
        rationale: "Advance fees are permitted only within a specific regulatory framework, which is why neither refundability nor an acknowledgment satisfies the requirement. A blanket prohibition overstates the rule."
      },
      {
        prompt: "A mortgage broker advertises 'guaranteed approval regardless of credit.' What is the concern?",
        choices: [
          "The claim is misleading because approval depends on underwriting the borrower and the collateral, and misleading advertising is itself a violation.",
          "There is no concern if some applicants with poor credit have in fact been approved.",
          "The concern is only whether the broker's license number appears in the advertisement.",
          "The concern arises only if a specific consumer relied on the claim and was denied."
        ],
        correctChoice: 0,
        rationale: "The claim promises an outcome that no originator controls. Isolated approvals do not make a guarantee accurate, license identification is a separate requirement, and the violation does not wait for a particular consumer's reliance."
      },
      {
        prompt: "How do the Department of Real Estate and other financial regulators divide authority over mortgage activity in California?",
        choices: [
          "Different regulators license different categories of mortgage participant, so the applicable rules depend on which license the entity holds and what activity it conducts.",
          "The Department of Real Estate regulates all mortgage lending in California.",
          "Federal regulators have exclusive authority over all residential mortgage activity.",
          "Authority is determined by the size of the loan rather than by the participant's license."
        ],
        correctChoice: 0,
        rationale: "License type and activity determine the applicable regime, which is why the same conduct can sit under different regulators. Neither exclusive state nor exclusive federal authority describes it, and loan size does not allocate jurisdiction."
      },
      {
        prompt: "A salesperson with an MLO endorsement wants to be paid a bonus directly by a wholesale lender. What is the defect?",
        choices: [
          "Compensation for licensed activity must be paid through her employing broker, and separate federal rules restrict originator compensation arrangements.",
          "There is no defect, since the lender is not her client.",
          "The defect is only that the bonus was not disclosed to the borrower.",
          "The defect arises only if the bonus varies with the interest rate."
        ],
        correctChoice: 0,
        rationale: "Two frameworks apply: compensation routing under state licensing law, and the federal restrictions on how originators may be compensated. The payer's identity does not resolve either, and disclosure does not cure improper routing."
      },
      {
        prompt: "What is the practical purpose of a mortgage broker's licensing framework from the consumer's perspective?",
        choices: [
          "It provides accountability — an identifiable licensee, a supervising broker, disclosure requirements, and a regulator with authority to investigate and discipline.",
          "It guarantees that the borrower receives the lowest available interest rate.",
          "It ensures that every borrower who applies will qualify for a loan.",
          "It transfers responsibility for the loan's performance to the regulator."
        ],
        correctChoice: 0,
        rationale: "Licensing delivers accountability and a complaint path. It does not guarantee pricing, approval, or performance of the loan."
      }
    ]
  },
  "assignment-02": {
    subject: "Money, interest, notes, and loan mathematics",
    applied: {
      prompt: "A borrower is comparing two offers on a $500,000 loan. Offer A is 6.25 percent with no points and $2,000 in lender fees. Offer B is 5.875 percent with two points and $2,000 in lender fees. He expects to sell the home in about three years. How should the originator frame the comparison?",
      choices: [
        "Quantify the $10,000 cost of the points against the monthly payment savings, show roughly how long it takes for the savings to recover that cost, and note that a three-year horizon may not reach the break-even point — while also comparing the disclosed annual percentage rates.",
        "Recommend Offer B, because the lower interest rate always produces the lower total cost.",
        "Recommend Offer A, because paying points is never advantageous for a residential borrower.",
        "Recommend whichever offer shows the lower annual percentage rate, since that figure accounts for all cost differences."
      ],
      correctChoice: 0,
      rationale: "Points are prepaid interest that pay off only if the borrower holds the loan past break-even, which makes the holding period decisive. Neither absolute rule is correct, and the annual percentage rate — while useful — assumes the loan runs its term, so it can mislead a borrower who expects to sell in three years."
    },
    engagement: [
      {
        prompt: "What does the annual percentage rate express that the note rate does not?",
        choices: [
          "The cost of credit as a yearly rate including certain finance charges beyond interest, which allows comparison across offers with different fee structures.",
          "The interest rate the borrower will actually be charged each month.",
          "The rate at which the loan balance will amortize over its term.",
          "The maximum rate the loan may reach if it is an adjustable-rate loan."
        ],
        correctChoice: 0,
        rationale: "The annual percentage rate folds specified financing costs into a single comparable figure. The note rate is what accrues on the balance, and amortization and rate caps are separate concepts."
      },
      {
        prompt: "A $360,000 loan carries a 6 percent annual interest rate. What is the interest portion of the first monthly payment?",
        choices: [
          "$1,800.",
          "$2,160.",
          "$21,600.",
          "$600."
        ],
        correctChoice: 0,
        rationale: "$360,000 × 6% = $21,600 per year; divided by 12 months, the first month's interest is $1,800. The $21,600 figure is the annual amount."
      },
      {
        prompt: "What distinguishes a fully amortized loan from an interest-only loan?",
        choices: [
          "A fully amortized loan's scheduled payments retire the principal by the end of the term; an interest-only loan's payments cover interest only, leaving the principal outstanding.",
          "A fully amortized loan has a fixed rate while an interest-only loan has an adjustable rate.",
          "A fully amortized loan requires a balloon payment while an interest-only loan does not.",
          "A fully amortized loan may be prepaid while an interest-only loan may not."
        ],
        correctChoice: 0,
        rationale: "The difference is whether scheduled payments retire principal. Rate structure, balloon features, and prepayment terms vary independently — and it is the interest-only loan that leaves a balance outstanding."
      },
      {
        prompt: "A property is worth $700,000 with a first loan of $490,000 and a second loan of $70,000. What is the combined loan-to-value ratio?",
        choices: [
          "80 percent.",
          "70 percent.",
          "10 percent.",
          "125 percent."
        ],
        correctChoice: 0,
        rationale: "($490,000 + $70,000) ÷ $700,000 = 80 percent. The 70 percent figure omits the second loan and the 10 percent figure counts only it."
      },
      {
        prompt: "What is a balloon payment?",
        choices: [
          "A payment substantially larger than the regular periodic payments, due at the end of the term because the scheduled payments did not fully retire the principal.",
          "An additional payment the borrower makes voluntarily to reduce principal faster.",
          "The final regular payment of a fully amortized loan.",
          "A payment required when an adjustable rate reaches its lifetime cap."
        ],
        correctChoice: 0,
        rationale: "A balloon exists because amortization was not scheduled to complete within the term. It is neither a voluntary prepayment, the last payment of a fully amortizing loan, nor a consequence of rate caps."
      }
    ],
    remediation: [
      {
        prompt: "A borrower pays one point on a $525,000 loan. What is the cost, and how is it characterized?",
        choices: [
          "$5,250, generally treated as prepaid interest paid to obtain a lower rate.",
          "$525, treated as an administrative fee.",
          "$52,500, treated as a down payment toward principal.",
          "$5,250, treated as a reduction of the principal balance."
        ],
        correctChoice: 0,
        rationale: "A point is one percent of the loan amount, so $5,250, and discount points function as prepaid interest that buys down the rate rather than reducing principal."
      },
      {
        prompt: "How does simple interest differ from compound interest?",
        choices: [
          "Simple interest accrues only on the principal, while compound interest accrues on principal plus previously accrued interest.",
          "Simple interest is charged monthly while compound interest is charged annually.",
          "Simple interest applies to fixed-rate loans and compound interest to adjustable-rate loans.",
          "Simple interest is calculated in advance and compound interest in arrears."
        ],
        correctChoice: 0,
        rationale: "What the interest is calculated on is the distinction. Frequency, rate structure, and timing of accrual are separate variables."
      },
      {
        prompt: "Which terms would you expect a promissory note to state?",
        choices: [
          "The principal amount, the interest rate, the payment terms, the maturity date, and the consequences of default.",
          "The property's legal description and the vesting of title.",
          "The escrow instructions and the closing date.",
          "The appraised value and the loan-to-value ratio."
        ],
        correctChoice: 0,
        rationale: "The note governs the debt: amount, rate, payments, maturity, and default. Legal description belongs to the security instrument, and escrow and valuation details live elsewhere."
      },
      {
        prompt: "A borrower's monthly payment is $2,400 and the interest portion in a given month is $1,950. What happens to the balance that month?",
        choices: [
          "It decreases by $450, the portion of the payment applied to principal.",
          "It decreases by $2,400, the full payment amount.",
          "It increases by $450, because the interest exceeds the principal portion.",
          "It remains unchanged, because the payment covers only accrued interest."
        ],
        correctChoice: 0,
        rationale: "Interest is paid first and the remainder reduces principal: $2,400 − $1,950 = $450. The balance would only rise if the payment failed to cover accrued interest."
      },
      {
        prompt: "Why does a lender care about the loan-to-value ratio?",
        choices: [
          "Because it measures the equity cushion protecting the lender if the collateral must be sold, which directly affects the lender's loss exposure.",
          "Because it determines the borrower's ability to make the monthly payment.",
          "Because it establishes the interest rate the lender must charge.",
          "Because it fixes the term over which the loan must be repaid."
        ],
        correctChoice: 0,
        rationale: "Loan-to-value is a collateral risk measure. Capacity to pay is measured by income ratios, and neither the rate nor the term is fixed by it — though risk influences pricing."
      }
    ]
  },
  "assignment-03": {
    subject: "Security instruments and lien priority",
    applied: {
      prompt: "A homeowner has a first deed of trust recorded in 2019 and a home equity line recorded in 2022. She wants to refinance the first loan into a new loan at a lower rate, keeping the equity line open. The new lender insists on being in first position. What must happen, and why?",
      choices: [
        "The equity line holder must agree to subordinate, because paying off and reconveying the 2019 loan would otherwise advance the 2022 line to first position ahead of the new loan.",
        "Nothing special is required, because the new loan replaces the old one and inherits its 2019 priority.",
        "The homeowner must pay off the equity line, because two liens cannot exist on one property after a refinance.",
        "The new lender must record first, which by itself establishes its priority over the existing line."
      ],
      correctChoice: 0,
      rationale: "Priority follows recording order, and the new loan records in 2023 — behind the 2022 line — once the 2019 loan is reconveyed. Priority does not transfer to a replacement loan, multiple liens are perfectly ordinary, and recording a new instrument cannot leapfrog an earlier recorded one without the earlier holder's agreement to subordinate."
    },
    engagement: [
      {
        prompt: "What role does the trustee play under a deed of trust?",
        choices: [
          "The trustee holds bare legal title for the limited purpose of the security and can convey the property at a trustee's sale on default or reconvey it on payoff.",
          "The trustee services the loan and collects the borrower's payments.",
          "The trustee owns the property until the loan is repaid and may occupy it on default.",
          "The trustee represents the borrower's interests against the lender."
        ],
        correctChoice: 0,
        rationale: "The trustee's role is narrow and functional: hold bare legal title, sell on default, reconvey on payoff. It is neither a servicer, an owner-occupant, nor an advocate for either party."
      },
      {
        prompt: "How does a mortgage differ structurally from a deed of trust?",
        choices: [
          "A mortgage involves two parties, the mortgagor and mortgagee, while a deed of trust adds a third-party trustee holding title for the security's purpose.",
          "A mortgage secures residential loans while a deed of trust secures commercial loans.",
          "A mortgage is recorded while a deed of trust is not.",
          "A mortgage may be foreclosed nonjudicially while a deed of trust may not."
        ],
        correctChoice: 0,
        rationale: "The number of parties is the structural difference, and it is the trustee's power of sale that makes nonjudicial foreclosure available. Property type and recording do not distinguish them."
      },
      {
        prompt: "What is a subordination agreement?",
        choices: [
          "An agreement by which a lienholder consents to have its lien take a lower priority than another lien, changing the order recording would otherwise establish.",
          "An agreement by which a borrower promises not to take on additional debt.",
          "An agreement by which a junior lender agrees to release its lien on payoff.",
          "An agreement by which a lender consents to a partial reconveyance of collateral."
        ],
        correctChoice: 0,
        rationale: "Subordination reorders priority by consent. It is not a covenant against further borrowing, a release, or a partial reconveyance."
      },
      {
        prompt: "What is the effect of a full reconveyance?",
        choices: [
          "It releases the deed of trust from the record, evidencing that the secured obligation has been satisfied.",
          "It transfers ownership of the property from the trustee to the beneficiary.",
          "It converts the deed of trust into a mortgage.",
          "It extends the loan term and reinstates the borrower after default."
        ],
        correctChoice: 0,
        rationale: "Reconveyance clears the security from the record on payoff. It does not transfer ownership to the lender, change the instrument's character, or reinstate a loan."
      },
      {
        prompt: "Which lien commonly takes priority regardless of when it was recorded?",
        choices: [
          "Property tax liens, which are generally given priority over other liens by statute.",
          "The first deed of trust recorded against the property.",
          "A judgment lien obtained by a creditor after litigation.",
          "A mechanic's lien recorded by a general contractor."
        ],
        correctChoice: 0,
        rationale: "Property tax liens are the classic statutory exception to first-in-time priority. A first deed of trust takes priority by recording order rather than by statute, and judgment and mechanic's liens each follow their own rules without automatic superiority."
      }
    ],
    remediation: [
      {
        prompt: "A lender is considering a second-position loan. What does the position principally affect?",
        choices: [
          "The order of payment from foreclosure proceeds, so a junior lienholder may recover nothing if the sale does not produce enough to satisfy senior liens.",
          "Whether the loan may be recorded at all.",
          "Whether the borrower may occupy the property during the loan term.",
          "Whether the loan may be secured by the same collateral as another loan."
        ],
        correctChoice: 0,
        rationale: "Position determines who is paid first from limited proceeds, which is the entire economic significance of lien priority. Recording, occupancy, and shared collateral are unaffected."
      },
      {
        prompt: "What happens to junior liens when a senior deed of trust is foreclosed at a trustee's sale?",
        choices: [
          "Junior liens are generally eliminated from the property, though the underlying debts may survive against the borrower personally.",
          "Junior liens survive and remain attached to the property in the buyer's hands.",
          "Junior liens advance in priority to fill the position of the foreclosed lien.",
          "Junior liens must be paid in full by the foreclosing lender before the sale."
        ],
        correctChoice: 0,
        rationale: "Foreclosure by a senior lienholder clears junior liens from the property while leaving the personal obligations in place. They neither survive against the property, advance, nor must be paid before sale."
      },
      {
        prompt: "A borrower asks whether a recorded deed of trust means the lender owns his home. What is the accurate explanation?",
        choices: [
          "No — the borrower holds ownership; the deed of trust is a security interest that gives the lender rights in the property if the obligation is not performed.",
          "Yes — the lender holds title until the loan is repaid in full.",
          "Yes — but ownership returns automatically once half the principal is repaid.",
          "No — the trustee owns the property and the borrower holds a leasehold."
        ],
        correctChoice: 0,
        rationale: "The borrower owns and the security instrument encumbers. The trustee holds only bare legal title for the security's limited purpose, which is not ownership in any practical sense."
      },
      {
        prompt: "Two deeds of trust are recorded the same day against the same property. How is priority determined?",
        choices: [
          "By the recording sequence, since recording is timestamped, and by any agreement among the parties addressing priority.",
          "By the size of each loan, with the larger loan taking priority.",
          "By the date each promissory note was signed.",
          "Equally, with both lienholders sharing proceeds proportionally."
        ],
        correctChoice: 0,
        rationale: "Recording is sequenced within the day, and parties can allocate priority by agreement. Loan size, note dates, and automatic pro rata sharing do not determine it."
      },
      {
        prompt: "Why does a lender obtain title insurance in a lender's policy separate from the owner's policy?",
        choices: [
          "Because the lender's insurable interest is its lien and its priority, which is distinct from the owner's interest in the property.",
          "Because owner's policies are optional while lender's policies are mandatory by statute.",
          "Because the lender's policy also covers the property's physical condition.",
          "Because the owner's policy expires when the property is refinanced."
        ],
        correctChoice: 0,
        rationale: "The two policies insure different interests — lien and priority versus ownership. Neither insures physical condition, and the owner's policy does not lapse on refinance."
      }
    ]
  },
  "assignment-04": {
    subject: "Mortgage markets, sources, and loan products",
    applied: {
      prompt: "A borrower who owns four rental houses wants a loan to buy a fifth rental property. The originator normally works with residential owner-occupied products and tells the borrower he will 'just use the standard consumer loan process, it's simpler.' What is wrong with that approach?",
      choices: [
        "A loan for an investment purchase is generally a business-purpose loan rather than a consumer loan, so a different disclosure and compliance framework and different products apply — the classification must be determined by the loan's purpose, not by convenience.",
        "Nothing is wrong, since the borrower is an individual and the collateral is residential property.",
        "The only problem is that investment loans carry higher rates, which must be disclosed.",
        "The only problem is that the borrower already owns four properties, which disqualifies him."
      ],
      correctChoice: 0,
      rationale: "Purpose determines classification, and consumer-purpose and business-purpose loans sit under different regimes with different disclosures and products. The borrower being an individual and the collateral being residential do not make it consumer credit, and pricing and property count are separate questions."
    },
    engagement: [
      {
        prompt: "What distinguishes the primary mortgage market from the secondary market?",
        choices: [
          "The primary market is where loans are originated to borrowers; the secondary market is where those existing loans are bought and sold among investors.",
          "The primary market handles first liens and the secondary market handles second liens.",
          "The primary market serves owner-occupants and the secondary market serves investors buying property.",
          "The primary market is regulated by states and the secondary market is unregulated."
        ],
        correctChoice: 0,
        rationale: "Origination versus trading of existing loans is the distinction. It is unrelated to lien position, to who occupies the property, or to the presence of regulation."
      },
      {
        prompt: "How does a depository lender differ from a nondepository mortgage lender?",
        choices: [
          "A depository funds loans partly from customer deposits it holds; a nondepository has no deposits and funds through warehouse lines, sales into the secondary market, or investor capital.",
          "A depository lends only for owner-occupied property while a nondepository lends only for investment property.",
          "A depository originates loans while a nondepository only services them.",
          "A depository is regulated while a nondepository is not."
        ],
        correctChoice: 0,
        rationale: "The funding source is the distinction. Both types originate, both may lend on various property types, and both are subject to regulation, though by different regulators."
      },
      {
        prompt: "What generally characterizes a government-backed loan program compared to a conventional loan?",
        choices: [
          "A government agency insures or guarantees the lender against certain losses, which supports terms such as lower down payments for qualifying borrowers.",
          "The government lends the money directly to the borrower.",
          "The loan carries no interest for qualifying borrowers.",
          "The loan may be used only for newly constructed homes."
        ],
        correctChoice: 0,
        rationale: "The agency's role is insurance or guaranty to the lender, which reduces lender risk and supports more accessible terms. The government is not the lender, the loans bear interest, and they are not limited to new construction."
      },
      {
        prompt: "What is the essential feature of an adjustable-rate mortgage?",
        choices: [
          "The interest rate changes over the loan's life according to a specified index plus a margin, within any caps stated in the note.",
          "The payment amount is fixed while the term lengthens or shortens with rate changes.",
          "The rate is set by the lender's discretion at each adjustment date.",
          "The rate is fixed for the first year and then becomes permanently fixed at a market rate."
        ],
        correctChoice: 0,
        rationale: "Index plus margin, subject to caps, is the mechanism. The payment typically changes with the rate, adjustments are not discretionary, and the rate continues to adjust rather than becoming permanently fixed."
      },
      {
        prompt: "What should drive a product recommendation to a borrower?",
        choices: [
          "The borrower's financial circumstances, plans, and tolerance for payment change, evaluated against the product's terms and risks.",
          "The product that produces the highest compensation for the originator.",
          "The product the borrower's neighbor or family member used successfully.",
          "The product with the lowest initial monthly payment."
        ],
        correctChoice: 0,
        rationale: "Suitability turns on the borrower's own circumstances and the risks he would carry. Originator compensation, anecdote, and the lowest teaser payment each substitute something else for that analysis."
      }
    ],
    remediation: [
      {
        prompt: "Why does the secondary market influence what loan products a borrower can obtain?",
        choices: [
          "Because originators generally must be able to sell the loans they make, so investor requirements shape which products and borrower profiles are available.",
          "Because the secondary market sets the interest rate each borrower is charged.",
          "Because the secondary market approves each individual borrower's application.",
          "Because loans that cannot be sold are prohibited from being made."
        ],
        correctChoice: 0,
        rationale: "Salability drives product availability, which is why investor guidelines feel like rules to a borrower. The secondary market neither prices individual loans, underwrites individual borrowers, nor prohibits portfolio lending."
      },
      {
        prompt: "A borrower wants the lowest possible payment for the first five years and plans to sell in year four. What is the sound approach?",
        choices: [
          "Present the products that fit that horizon along with the risks if the plan changes, and document what was explained, since plans change more often than borrowers expect.",
          "Recommend the product with the lowest initial payment, since it matches his stated plan.",
          "Recommend a long fixed-rate loan regardless, since it is always the safest choice.",
          "Decline to advise, since product selection is the lender's decision."
        ],
        correctChoice: 0,
        rationale: "Matching the product to the stated horizon is appropriate, but the plan may not hold — so the risks and the record of the discussion matter. Neither blindly minimizing the payment nor defaulting to the most conservative product is advice, and the originator does have a role."
      },
      {
        prompt: "What characterizes a portfolio loan?",
        choices: [
          "The lender keeps the loan on its own books rather than selling it, which allows more flexible underwriting but concentrates the risk with that lender.",
          "The loan is secured by a portfolio of several properties at once.",
          "The loan is sold into the secondary market immediately after closing.",
          "The loan is originated by a broker rather than by a lender."
        ],
        correctChoice: 0,
        rationale: "A portfolio loan is defined by the lender retaining it. Multi-property collateral, immediate sale, and broker origination describe other things entirely."
      },
      {
        prompt: "Why does owner-occupancy status matter to a loan's terms and compliance treatment?",
        choices: [
          "It affects risk pricing, program eligibility, and which consumer protection requirements apply, which is why occupancy misrepresentation is treated as a serious matter.",
          "It affects only the property tax treatment of the purchase.",
          "It determines whether the loan may be secured by a deed of trust.",
          "It affects only whether the borrower may rent the property later."
        ],
        correctChoice: 0,
        rationale: "Occupancy drives pricing, eligibility, and which protections attach — which is exactly why misstating it is fraud rather than a technicality. It is not merely a tax or a security-instrument question."
      },
      {
        prompt: "A borrower asks why two lenders quoted materially different rates for the same loan. What is the accurate explanation?",
        choices: [
          "Pricing reflects each lender's cost of funds, risk appetite, investor requirements, margins, and the specific loan characteristics, so quotes legitimately differ.",
          "One lender must be quoting improperly, since rates are set uniformly.",
          "The difference reflects only the originator's compensation.",
          "The difference means one lender has not yet underwritten the file."
        ],
        correctChoice: 0,
        rationale: "Rates are set by each lender within its own economics and risk view, so differences are normal. Uniform pricing, compensation alone, and incomplete underwriting do not explain ordinary quote variation."
      }
    ]
  },
  "assignment-05": {
    subject: "Application, borrower information, and qualification",
    applied: {
      prompt: "A borrower tells the originator: 'Put down that I'll live in the property — I'll actually rent it out, but owner-occupied gets me a better rate. And leave off the car loan, I'm paying it off next month anyway.' The originator believes the borrower can afford the payment either way. What is the correct response?",
      choices: [
        "Refuse both requests, explain that occupancy and liabilities must be stated accurately because the lender relies on them, and record the loan as it actually is — misstating either is loan fraud regardless of whether the borrower could afford the payment.",
        "Record the occupancy as requested but include the car loan, since occupancy is the borrower's stated intention and intentions can change.",
        "Omit the car loan as requested but record the occupancy accurately, since a debt being paid off shortly is not a real obligation.",
        "Follow both instructions and note in the file that they came from the borrower."
      ],
      correctChoice: 0,
      rationale: "Both requests ask the originator to misstate facts the lender relies on in pricing and approving the loan, which is fraud whether or not the borrower can afford the payment. A debt that exists at application is a liability until it is actually paid and documented, and recording that the borrower asked for the misstatement does not make it permissible."
    },
    engagement: [
      {
        prompt: "What information does a loan application collect about the borrower's capacity?",
        choices: [
          "Income, employment, assets, and liabilities, which together support the analysis of whether the borrower can repay.",
          "Only the borrower's credit score, since it summarizes creditworthiness.",
          "Only the borrower's income, since the payment is made from income.",
          "The borrower's intended use of the property and nothing further."
        ],
        correctChoice: 0,
        rationale: "Capacity analysis needs the full picture: what comes in, what is owed, and what reserves exist. A credit score measures history rather than capacity, and income alone ignores existing obligations."
      },
      {
        prompt: "What does a debt-to-income ratio measure?",
        choices: [
          "The borrower's recurring monthly obligations, including the proposed housing payment, as a percentage of gross monthly income.",
          "The borrower's total debt as a percentage of the property's value.",
          "The borrower's monthly savings as a percentage of income.",
          "The proposed loan payment as a percentage of the borrower's net worth."
        ],
        correctChoice: 0,
        rationale: "The ratio compares recurring obligations to income. Debt against property value is loan-to-value, and neither savings rate nor net worth defines the ratio."
      },
      {
        prompt: "Why does the source of a borrower's down payment matter?",
        choices: [
          "Because lenders verify that funds are the borrower's own or a properly documented gift, since undisclosed borrowed funds create an unrecorded obligation and change the risk.",
          "Because the source determines the property's appraised value.",
          "Because only funds held for more than five years may be used.",
          "Because the source determines whether the loan may be sold in the secondary market."
        ],
        correctChoice: 0,
        rationale: "An undisclosed loan for the down payment is a hidden liability that undermines the capacity analysis, which is why sourcing and documenting funds is standard. Value, arbitrary seasoning rules, and salability are not the reason."
      },
      {
        prompt: "What does a credit report contribute to the qualification analysis?",
        choices: [
          "A record of the borrower's history of meeting obligations, which informs the assessment of willingness and reliability alongside capacity.",
          "A determination of whether the borrower's income is sufficient.",
          "A verification of the borrower's employment and assets.",
          "An appraisal of the collateral securing the loan."
        ],
        correctChoice: 0,
        rationale: "Credit history speaks to willingness to repay, which complements the capacity analysis drawn from income, assets, and liabilities. It verifies neither income, employment, assets, nor collateral."
      },
      {
        prompt: "How should an originator handle adverse information a borrower discloses, such as a past bankruptcy?",
        choices: [
          "Record it accurately and address it with documentation and explanation as the program requires, since concealing it would misrepresent the file.",
          "Omit it if enough time has passed that it no longer appears on the credit report.",
          "Omit it unless the lender specifically asks about it.",
          "Record it only if the borrower cannot provide a satisfactory explanation."
        ],
        correctChoice: 0,
        rationale: "Accuracy is the obligation, and adverse facts are handled with documentation rather than omission. Neither the passage of time, the absence of a direct question, nor the quality of the explanation makes concealment acceptable."
      }
    ],
    remediation: [
      {
        prompt: "A borrower is self-employed. What generally distinguishes the income analysis?",
        choices: [
          "Income is typically established from tax returns and business records over a period, with attention to stability and to the difference between gross receipts and net income.",
          "Self-employed income is disregarded and only assets may be counted.",
          "Self-employed income is verified by a letter from the borrower's accountant alone.",
          "Self-employed borrowers are evaluated only on credit history."
        ],
        correctChoice: 0,
        rationale: "Documented returns over time, with net rather than gross income, is the standard approach. Self-employment does not disqualify income, and a single letter does not substitute for the underlying records."
      },
      {
        prompt: "A borrower's application lists a monthly income figure that does not match the pay documentation. What should the originator do?",
        choices: [
          "Resolve the discrepancy with documentation before the file proceeds, and correct the application to match what is verified.",
          "Use the higher figure, since the borrower knows his own income best.",
          "Use the lower figure, which is the conservative approach.",
          "Submit the file with both figures and let the underwriter decide."
        ],
        correctChoice: 0,
        rationale: "Discrepancies are resolved with evidence, not by choosing a number. Passing an unreconciled conflict to the underwriter submits a file the originator knows to be internally inconsistent."
      },
      {
        prompt: "Why is a borrower's occupancy intent captured at application rather than assumed?",
        choices: [
          "Because occupancy affects pricing, program eligibility, and which consumer protections apply, so it is a material fact the lender relies on.",
          "Because occupancy determines who may hold title to the property.",
          "Because occupancy is required to be reported to the county assessor by the lender.",
          "Because occupancy determines the appraiser's choice of valuation approach."
        ],
        correctChoice: 0,
        rationale: "Occupancy is material to the lender's decision, which is what makes misstating it fraud. It does not determine vesting, is not reported by the lender to the assessor, and does not drive the appraisal method."
      },
      {
        prompt: "A borrower asks the originator to 'estimate' his assets on the application because he has not gathered his statements yet. What is the sound approach?",
        choices: [
          "Record what can be supported and complete the item when the documentation arrives, rather than entering figures the borrower has not verified.",
          "Enter the borrower's estimate and correct it later if the statements differ.",
          "Leave the asset section blank until closing.",
          "Enter a conservative figure below the borrower's estimate to be safe."
        ],
        correctChoice: 0,
        rationale: "An application states facts the lender relies on, so unverified estimates and invented conservative figures are both misstatements. Leaving the section blank stalls the file without resolving anything."
      },
      {
        prompt: "What is the significance of reserves in a qualification analysis?",
        choices: [
          "They measure the borrower's ability to continue paying if income is interrupted, which is a distinct risk factor from capacity at the moment of application.",
          "They determine the maximum loan amount the borrower may receive.",
          "They substitute for a down payment when the borrower lacks one.",
          "They are counted as income in the debt-to-income calculation."
        ],
        correctChoice: 0,
        rationale: "Reserves address resilience after closing rather than capacity at closing. They neither cap the loan, replace the down payment, nor convert into income."
      }
    ]
  },
  "assignment-06": {
    subject: "Underwriting, collateral, and approval conditions",
    applied: {
      prompt: "An automated underwriting system returns an approval, but the appraisal notes an unpermitted room addition contributing meaningfully to the square footage, and the borrower's employment verification shows he started his current job three weeks ago after a nine-month gap. The originator says the automated approval settles the matter. Is he right?",
      choices: [
        "No — an automated recommendation is based on the data entered, and both the unpermitted addition and the employment gap are facts the underwriter must evaluate; the collateral and the borrower's stability are exactly what conditions exist to address.",
        "Yes — an automated approval is the lender's decision and supersedes individual file issues.",
        "No — but only the employment gap matters, since appraisal issues are the appraiser's responsibility.",
        "No — but only the unpermitted addition matters, since employment history is captured in the automated analysis."
      ],
      correctChoice: 0,
      rationale: "An automated recommendation evaluates the data it was given, not facts that surface afterward in the appraisal or the verification. Unpermitted square footage affects the collateral's value and marketability, and a very short tenure after a long gap affects income stability — both are underwriting questions, not clerical ones."
    },
    engagement: [
      {
        prompt: "What does an ability-to-repay analysis require a lender to do?",
        choices: [
          "Make a reasonable, good-faith determination, based on verified information, that the borrower can repay the loan according to its terms.",
          "Confirm that the borrower's credit score exceeds a specified minimum.",
          "Verify that the property's value exceeds the loan amount.",
          "Obtain the borrower's written statement that he expects to be able to repay."
        ],
        correctChoice: 0,
        rationale: "The standard is a reasoned determination on verified information. A score threshold, a collateral cushion, and the borrower's own assurance are each insufficient substitutes."
      },
      {
        prompt: "What distinguishes automated underwriting from manual underwriting?",
        choices: [
          "Automated underwriting applies programmed rules to the submitted data and returns a recommendation; manual underwriting has an underwriter evaluate the file directly, often where the file's circumstances do not fit the automated model.",
          "Automated underwriting is used for conventional loans and manual underwriting for government loans.",
          "Automated underwriting is final while manual underwriting is advisory.",
          "Automated underwriting evaluates the collateral while manual underwriting evaluates the borrower."
        ],
        correctChoice: 0,
        rationale: "The difference is who evaluates and how, not loan type or subject matter. An automated recommendation is subject to verification and conditions rather than final."
      },
      {
        prompt: "Why does the lender review the appraisal as part of underwriting?",
        choices: [
          "Because the collateral's value, condition, and marketability determine what the lender could recover if the loan is not repaid.",
          "Because the appraisal establishes the purchase price the borrower must pay.",
          "Because the appraisal verifies the borrower's stated down payment.",
          "Because the appraisal determines the property's insurability against hazards."
        ],
        correctChoice: 0,
        rationale: "The appraisal informs the lender's collateral risk. It does not set the price the parties agreed, verify funds, or determine hazard insurability."
      },
      {
        prompt: "What is the purpose of a prior-to-funding condition?",
        choices: [
          "It identifies an item that must be satisfied before the loan may fund, so the approval is conditional until the item is delivered and accepted.",
          "It records an item the borrower must complete within the first year after closing.",
          "It documents an exception the underwriter granted to program guidelines.",
          "It lists items the borrower may satisfy at his convenience after closing."
        ],
        correctChoice: 0,
        rationale: "Prior-to-funding conditions gate the funding itself. Post-closing obligations and underwriting exceptions are different things entirely."
      },
      {
        prompt: "When a loan application is denied, what does the borrower generally receive?",
        choices: [
          "An adverse action notice stating the decision and the principal reasons for it, together with required disclosures about information relied on.",
          "A verbal explanation from the originator, which satisfies the requirement.",
          "A copy of the underwriter's internal notes on the file.",
          "Nothing, unless the borrower requests an explanation in writing."
        ],
        correctChoice: 0,
        rationale: "An adverse action notice with the principal reasons is required, which is why a verbal explanation is insufficient and why the borrower need not ask. Internal notes are not what is provided."
      }
    ],
    remediation: [
      {
        prompt: "The appraisal comes in below the contract price on a purchase. What is the immediate effect on underwriting?",
        choices: [
          "The loan amount is generally calculated against the lower of the appraised value and the purchase price, which can require more cash from the borrower or a renegotiated price.",
          "The lender must obtain a second appraisal before proceeding.",
          "The loan is automatically denied.",
          "The purchase price is adjusted to the appraised value by operation of the loan program."
        ],
        correctChoice: 0,
        rationale: "Lenders lend against the lower of value and price. A second appraisal is not automatic, the loan is not denied outright, and no loan program changes the parties' agreed price."
      },
      {
        prompt: "Why is hazard insurance a condition of the loan?",
        choices: [
          "Because the collateral secures the debt, so the lender requires the property to be insured against loss and to be named as an interested party.",
          "Because insurance premiums are counted as income in the underwriting analysis.",
          "Because insurance substitutes for title insurance on the property.",
          "Because insurance is required only when the loan-to-value ratio exceeds 80 percent."
        ],
        correctChoice: 0,
        rationale: "Insurance protects the collateral that secures the loan. It is not income, does not overlap with title insurance, and is not tied to a loan-to-value threshold — mortgage insurance is the coverage that behaves that way."
      },
      {
        prompt: "An underwriter conditions approval on a letter of explanation for recent large deposits. Why?",
        choices: [
          "Because unexplained deposits may be undisclosed borrowed funds or other liabilities, which would change the capacity analysis.",
          "Because large deposits suggest the borrower does not need the loan.",
          "Because deposits must be seasoned for a fixed period in every program.",
          "Because the underwriter must report large deposits to the tax authorities."
        ],
        correctChoice: 0,
        rationale: "The concern is a hidden obligation masquerading as assets. It is not about need, not a universal seasoning rule, and not a tax reporting duty of the underwriter."
      },
      {
        prompt: "What role does title work play in the underwriting decision?",
        choices: [
          "It establishes what interests exist against the property and what must be cleared so the lender's lien records in the required position.",
          "It establishes the property's market value for loan purposes.",
          "It verifies the borrower's identity for the lender.",
          "It determines whether the property meets the program's occupancy requirements."
        ],
        correctChoice: 0,
        rationale: "Title work addresses the lien and its priority. Value comes from the appraisal, identity from separate verification, and occupancy from the borrower's documentation."
      },
      {
        prompt: "A file is approved with conditions and the borrower asks whether he can consider the loan final. What is the accurate answer?",
        choices: [
          "No — a conditional approval depends on the outstanding items being satisfied and on the underwritten facts remaining true through funding.",
          "Yes — a conditional approval is a commitment, with the conditions being administrative formalities.",
          "Yes, provided the conditions relate to documents rather than to the borrower's finances.",
          "No — but the loan becomes final once the appraisal is received."
        ],
        correctChoice: 0,
        rationale: "Conditional means conditional, and the facts must hold through funding — which is why a job change or new debt before closing can undo it. Receipt of the appraisal is one condition among several."
      }
    ]
  },
  "assignment-07": {
    subject: "Federal consumer mortgage law",
    applied: {
      prompt: "A mortgage broker arranges a consumer-purpose residential loan. During the file, an escrow company offers her $300 for each borrower she sends to them, a lender asks her to steer borrowers into higher-rate loans in exchange for larger compensation, and a declined applicant asks why she was turned down. Which federal frameworks are engaged?",
      choices: [
        "The referral payment implicates RESPA's prohibition on fees for referrals of settlement service business, the rate-based compensation implicates the loan originator compensation restrictions, and the declined applicant's question implicates ECOA's adverse action notice requirements.",
        "All three are governed solely by the Truth in Lending Act, which covers the cost and terms of consumer credit.",
        "Only the referral payment raises a federal issue; compensation and denial explanations are matters of state licensing law.",
        "None raises a federal issue, because the broker is not the lender."
      ],
      correctChoice: 0,
      rationale: "The three situations sit under three different federal frameworks, which is why an originator has to recognize which one is in play. Being a broker rather than a lender does not remove any of them, and none of the three is a purely state-law question."
    },
    engagement: [
      {
        prompt: "What is the central purpose of the Truth in Lending Act and Regulation Z?",
        choices: [
          "To require meaningful disclosure of credit terms and costs so consumers can compare offers, expressed through measures such as the annual percentage rate.",
          "To set maximum interest rates that lenders may charge consumers.",
          "To prohibit discrimination in the extension of credit.",
          "To require lenders to report application data to federal regulators."
        ],
        correctChoice: 0,
        rationale: "Truth in Lending is a disclosure statute aimed at comparability. Rate caps are a state usury matter, discrimination is ECOA's subject, and data reporting is HMDA's."
      },
      {
        prompt: "What does RESPA's prohibition on kickbacks and unearned fees address?",
        choices: [
          "Giving or accepting a fee, kickback, or thing of value for the referral of settlement service business, and splitting fees where no services were actually performed.",
          "Charging a borrower more than the customary fee for a settlement service.",
          "Requiring a borrower to use a settlement service provider chosen by the lender.",
          "Disclosing the identity of affiliated business arrangements to the borrower."
        ],
        correctChoice: 0,
        rationale: "The prohibition targets payment for referrals and unearned fee splits. Pricing, provider selection, and affiliate disclosure are addressed by other provisions."
      },
      {
        prompt: "What does the Equal Credit Opportunity Act and Regulation B prohibit?",
        choices: [
          "Discrimination against an applicant in any aspect of a credit transaction on prohibited bases, and it requires notice of the reasons when adverse action is taken.",
          "Charging different interest rates to different borrowers.",
          "Denying credit to an applicant with insufficient income.",
          "Obtaining a credit report without the applicant's written consent."
        ],
        correctChoice: 0,
        rationale: "ECOA addresses discrimination on prohibited bases and requires adverse action notices. Risk-based pricing and denials for genuine capacity reasons are lawful, and credit report access is FCRA's domain."
      },
      {
        prompt: "What is the function of the Home Mortgage Disclosure Act and Regulation C?",
        choices: [
          "To require covered institutions to collect and report data about mortgage applications and originations, which supports analysis of lending patterns and access to credit.",
          "To require lenders to disclose loan terms to individual applicants.",
          "To require lenders to originate a minimum share of loans in underserved areas.",
          "To require lenders to disclose their financial condition to depositors."
        ],
        correctChoice: 0,
        rationale: "HMDA is a data collection and reporting statute that makes lending patterns visible. It does not itself set disclosure duties to applicants or lending quotas."
      },
      {
        prompt: "What does the SAFE Act framework establish for mortgage loan originators?",
        choices: [
          "A national system of licensing or registration with unique identifiers, so that originators can be identified and their history tracked across states and employers.",
          "A uniform national interest rate cap for residential mortgage loans.",
          "A requirement that all originators be employed by depository institutions.",
          "A federal guarantee of residential mortgage loans made by licensed originators."
        ],
        correctChoice: 0,
        rationale: "The SAFE framework is about licensure, registration, and identifiability. It sets no rate caps, no employer restrictions, and no loan guarantees."
      }
    ],
    remediation: [
      {
        prompt: "An originator obtains a consumer's credit report. Which law principally governs that use?",
        choices: [
          "The Fair Credit Reporting Act, which governs permissible purposes for obtaining reports, accuracy, and the notices required when a report is used adversely.",
          "The Truth in Lending Act, which governs all credit-related consumer information.",
          "The Real Estate Settlement Procedures Act, which governs settlement service information.",
          "The Home Mortgage Disclosure Act, which governs credit data collection."
        ],
        correctChoice: 0,
        rationale: "FCRA governs consumer reports: who may obtain them, why, and what happens when they drive an adverse decision."
      },
      {
        prompt: "A lender offers an originator a larger commission for placing borrowers in loans with higher interest rates. What is the problem?",
        choices: [
          "Originator compensation generally may not be based on the loan's terms other than the loan amount, precisely because such arrangements create an incentive against the borrower's interest.",
          "There is no problem, provided the borrower is told the originator earns more on that loan.",
          "The problem is only that the arrangement must be in writing between the lender and the originator.",
          "The problem arises only if the borrower could have qualified for a lower rate."
        ],
        correctChoice: 0,
        rationale: "The restriction targets the incentive structure itself, so disclosure does not cure it and documentation is not the issue. The violation does not depend on proving a particular borrower was harmed."
      },
      {
        prompt: "A borrower asks why she must receive the closing disclosure some days before signing. What is the purpose?",
        choices: [
          "To give the borrower time to review the final terms and costs against what was disclosed earlier, and to raise questions before she is committed.",
          "To allow the lender time to finalize underwriting conditions.",
          "To permit the title company to prepare the settlement statement.",
          "To satisfy the appraiser's independence requirements."
        ],
        correctChoice: 0,
        rationale: "The waiting period exists for the consumer's review, not for the lender's or the settlement agent's internal processing, and it is unrelated to appraiser independence."
      },
      {
        prompt: "An originator regularly declines to work with applicants from a particular area, saying the properties there are 'hard to appraise.' What is the concern?",
        choices: [
          "A geographic practice that has the effect of denying credit access to protected groups can constitute unlawful discrimination even without an explicit prohibited-basis statement.",
          "There is no concern, since appraisal difficulty is a legitimate business reason.",
          "The concern is only about the originator's productivity, which is a business matter.",
          "The concern arises only if the originator states a prohibited basis explicitly."
        ],
        correctChoice: 0,
        rationale: "Effects matter, not just stated reasons, which is why an explicit statement is not required. A vague business rationale does not immunize a practice with a discriminatory effect."
      },
      {
        prompt: "Which federal framework most directly addresses a borrower's right to receive an estimate of loan costs early in the process?",
        choices: [
          "The integrated disclosure requirements implementing the Truth in Lending Act and RESPA, which provide an early estimate and a final disclosure before consummation.",
          "The Equal Credit Opportunity Act, through its adverse action requirements.",
          "The Fair Credit Reporting Act, through its disclosure of report contents.",
          "The Home Mortgage Disclosure Act, through its public data release."
        ],
        correctChoice: 0,
        rationale: "The integrated disclosures give the borrower an early estimate and a final statement for comparison. The other three address discrimination notices, credit reports, and aggregate data respectively."
      }
    ]
  },
  "assignment-08": {
    subject: "California broker law, trust funds, and records",
    applied: {
      prompt: "A DRE audit of a mortgage brokerage finds: borrower deposits held in the broker's operating account, an advance fee collected under an agreement never submitted for review, loan files from two years ago already destroyed, and advertising that omits the broker's license identification. The broker says every borrower ultimately got their loan and no one lost money. How should the findings be assessed?",
      choices: [
        "Each finding is an independent violation that does not depend on borrower loss: trust funds may not be commingled, advance fee arrangements are specially regulated, records must be retained for the required period, and advertising must identify the licensee.",
        "Only the commingling is a violation; the others are recordkeeping and marketing practices.",
        "None is a violation, because no borrower suffered a loss and every loan closed.",
        "Only the destroyed records matter, since an audit cannot proceed without them."
      ],
      correctChoice: 0,
      rationale: "These are four separate obligations, and none of them is conditioned on a borrower being harmed. Absence of loss is what makes the violations survivable, not what makes them lawful — and destroying files inside the retention period compounds the rest by removing the evidence."
    },
    engagement: [
      {
        prompt: "What must a broker do with trust funds received in a mortgage transaction?",
        choices: [
          "Place them in a trust account or neutral depository, keep them separate from the broker's own funds, and maintain records accounting for each receipt and disbursement.",
          "Deposit them in the brokerage's operating account with a separate internal ledger entry.",
          "Hold them personally until the transaction closes.",
          "Forward them to the lender immediately upon receipt."
        ],
        correctChoice: 0,
        rationale: "Separation of funds plus a complete accounting is the requirement. Internal ledgers inside an operating account are still commingling, and neither personal custody nor immediate forwarding satisfies the obligation."
      },
      {
        prompt: "What is an advance fee in this context?",
        choices: [
          "A fee collected before the services are performed, which is specially regulated in California including requirements governing the agreement and the handling of the funds.",
          "Any fee a borrower pays before the loan closes, including third-party appraisal costs.",
          "A fee paid by the lender to the broker at funding.",
          "A fee charged for expediting a loan application."
        ],
        correctChoice: 0,
        rationale: "The regulated category is compensation collected before performance, which is why it carries agreement and fund-handling requirements. Third-party costs and lender-paid compensation at funding are different."
      },
      {
        prompt: "What must a licensee's advertising include?",
        choices: [
          "Identification of the licensee and the licensed entity, so consumers know who is responsible and can verify the license.",
          "The specific interest rate available on the day the advertisement runs.",
          "A statement that the licensee is regulated by the Department of Real Estate.",
          "The broker's trust account details for consumer verification."
        ],
        correctChoice: 0,
        rationale: "Identification exists so a consumer can tell who stands behind the advertisement and verify the license. Rate quotes, regulator statements, and account details are not the requirement."
      },
      {
        prompt: "Why must a broker retain transaction records for the required period?",
        choices: [
          "Because the Department may inspect or audit them, and the records are what demonstrate the broker's compliance with disclosure, trust fund, and supervision obligations.",
          "Because borrowers may request copies of their files at any time.",
          "Because lenders require the broker to hold the file after funding.",
          "Because the records are needed to calculate the broker's tax obligations."
        ],
        correctChoice: 0,
        rationale: "Retention exists for regulatory inspection and to evidence compliance. Borrower and lender requests and tax needs are real but are not why the retention obligation exists."
      },
      {
        prompt: "What is the broker's responsibility for the mortgage activity of licensees acting under the license?",
        choices: [
          "The broker must supervise that activity, including advertising, disclosures, compensation, and funds handling, and remains accountable for it.",
          "The broker is responsible only for activity in which the broker personally participates.",
          "Responsibility passes to the individual licensee once she holds an MLO endorsement.",
          "The broker's responsibility is limited to maintaining the office's licensing records."
        ],
        correctChoice: 0,
        rationale: "Supervision is broad and non-delegable. Personal participation, the licensee's own endorsement, and administrative recordkeeping do not narrow it."
      }
    ],
    remediation: [
      {
        prompt: "A broker's trust account reconciliation shows an overage of $500 that cannot be traced to a specific beneficiary. What is the correct handling?",
        choices: [
          "Investigate and document the source, because an untraced overage means the records do not accurately reflect whose funds are held, and the broker may not simply keep it.",
          "Transfer the overage to the operating account, since it exceeds the trust obligations.",
          "Leave it in the account indefinitely, since an overage harms no one.",
          "Distribute it proportionally among current beneficiaries."
        ],
        correctChoice: 0,
        rationale: "An overage is a records failure, not a windfall. Taking it is conversion, leaving it unexamined perpetuates the inaccuracy, and distributing it gives beneficiaries funds that are not theirs."
      },
      {
        prompt: "A broker wants to destroy files from a transaction that closed within the retention period because storage is expensive. What applies?",
        choices: [
          "The records must be retained for the required period regardless of storage cost, and early destruction is itself a violation.",
          "Files may be destroyed once the loan is paid off.",
          "Files may be destroyed if the borrower consents in writing.",
          "Files may be destroyed if a summary of each transaction is retained instead."
        ],
        correctChoice: 0,
        rationale: "The retention obligation runs to the regulator, which is why neither payoff, borrower consent, nor a summary substitutes for the records themselves."
      },
      {
        prompt: "A borrower pays a broker a fee for arranging a loan that never closes. What determines whether the broker may keep it?",
        choices: [
          "The terms of the agreement and the applicable rules on advance fees and earned compensation, not the broker's effort alone.",
          "Whether the broker spent more time on the file than the fee represents.",
          "Whether the borrower found another lender afterward.",
          "Whether the broker disclosed at the outset that fees are non-refundable."
        ],
        correctChoice: 0,
        rationale: "Entitlement comes from the agreement and the regulatory framework governing it. Effort expended, the borrower's later actions, and a unilateral non-refundable label do not determine it."
      },
      {
        prompt: "What is the significance of a California mortgage loan disclosure statement in a broker-arranged loan?",
        choices: [
          "It is a broker disclosure to the borrower covering the loan's costs and terms, which exists so the borrower understands what the broker is arranging and what it costs.",
          "It is the lender's approval of the borrower's application.",
          "It is the escrow instruction governing disbursement of loan proceeds.",
          "It replaces the federal loan disclosures for broker-arranged transactions."
        ],
        correctChoice: 0,
        rationale: "It is a state-level broker disclosure to the borrower and sits alongside the federal disclosures rather than replacing them. It is neither an approval nor an escrow instruction."
      },
      {
        prompt: "A brokerage's advertisement uses only a marketing brand name with no license identification. What is the defect?",
        choices: [
          "Consumers cannot identify the responsible licensee or verify the license, which is exactly what identification requirements exist to prevent.",
          "There is no defect if the brand is registered as a fictitious business name.",
          "The defect is only that the advertisement should list the broker's physical address.",
          "The defect arises only if a consumer is actually misled."
        ],
        correctChoice: 0,
        rationale: "The requirement is that the responsible licensee be identifiable. Registering a brand name does not identify the licensee, and the violation does not wait for a misled consumer."
      }
    ]
  },
  "assignment-09": {
    subject: "Mortgage disclosures, compensation, and closing costs",
    applied: {
      prompt: "Three days before consummation the lender discovers the title company's fee is $600 higher than estimated, the borrower has asked to switch from a 30-year to a 15-year term, and the broker wants to increase her compensation because the file took longer than expected. Which of these can be absorbed and which force a change to the disclosures?",
      choices: [
        "The term change alters the loan product and requires revised disclosures; the fee increase must be tested against the applicable tolerance and disclosed accordingly; and the broker's compensation cannot be increased at this stage because originator compensation may not be adjusted to absorb or exploit late file conditions.",
        "All three are ordinary late-stage adjustments that are reflected on the final disclosure without further consequence.",
        "Only the term change matters, since fees and compensation are settled at closing.",
        "Only the fee increase matters, since the borrower requested the term change and the broker's compensation is a private matter."
      ],
      correctChoice: 0,
      rationale: "The three items sit under different rules. A product change is a changed circumstance requiring revised disclosure; a fee increase is measured against tolerance limits; and originator compensation is restricted precisely so it cannot be flexed at the end of a file. Treating any of them as a routine end-of-file adjustment is where compliance failures happen."
    },
    engagement: [
      {
        prompt: "What is the purpose of the loan estimate a borrower receives early in the process?",
        choices: [
          "To give a good-faith estimate of the loan's terms and costs in a standardized form so the borrower can compare offers before committing.",
          "To confirm that the borrower has been approved for the loan.",
          "To record the borrower's acceptance of the loan terms.",
          "To satisfy the lender's obligation to verify the borrower's income."
        ],
        correctChoice: 0,
        rationale: "The estimate exists for comparison shopping before commitment. It is neither an approval, an acceptance, nor an income verification."
      },
      {
        prompt: "What does the closing disclosure provide that the loan estimate does not?",
        choices: [
          "The actual final terms and costs of the transaction, which the borrower can compare against the earlier estimate before consummation.",
          "The lender's underwriting conditions and how each was satisfied.",
          "The property's appraised value and the comparable sales relied on.",
          "The borrower's payment history on prior obligations."
        ],
        correctChoice: 0,
        rationale: "The closing disclosure states the final figures for comparison with the estimate. Underwriting conditions, appraisal detail, and credit history appear elsewhere."
      },
      {
        prompt: "Why do tolerance limits exist for certain estimated charges?",
        choices: [
          "So an early estimate cannot be quoted low and then raised at closing, which would defeat the purpose of comparison shopping.",
          "So lenders can recover unexpected third-party costs from the borrower.",
          "So the borrower can negotiate each fee individually before closing.",
          "So settlement service providers charge uniform fees across transactions."
        ],
        correctChoice: 0,
        rationale: "Tolerances protect the reliability of the estimate. They neither authorize cost recovery, create a negotiation right, nor standardize provider pricing."
      },
      {
        prompt: "What must be disclosed about a broker's compensation in a broker-arranged loan?",
        choices: [
          "How the broker is compensated and by whom, so the borrower can understand the broker's economic interest in the transaction.",
          "Nothing, provided the compensation is paid by the lender rather than the borrower.",
          "Only the total dollar amount, without identifying the payer.",
          "Only whether the compensation exceeds a customary percentage."
        ],
        correctChoice: 0,
        rationale: "The borrower needs to see the economics behind the broker's recommendation, which requires knowing both amount and source. Lender payment does not remove the disclosure."
      },
      {
        prompt: "What is an affiliated business arrangement?",
        choices: [
          "An arrangement in which a person referring settlement service business has an ownership or beneficial interest in the provider being referred, which triggers disclosure and other conditions.",
          "An arrangement in which two lenders jointly fund a single loan.",
          "An arrangement in which a broker submits loans to more than one wholesale lender.",
          "An arrangement in which a borrower uses the same company for title and escrow."
        ],
        correctChoice: 0,
        rationale: "The defining feature is the referrer's financial interest in the provider. Joint funding, multiple lender relationships, and a borrower's own provider choices are not affiliated business arrangements."
      }
    ],
    remediation: [
      {
        prompt: "A borrower asks why the annual percentage rate on his disclosure is higher than the interest rate in his note. What is the explanation?",
        choices: [
          "The annual percentage rate incorporates certain financing costs in addition to interest, so it exceeds the note rate whenever such costs are present.",
          "The disclosure contains an error that should be corrected before closing.",
          "The annual percentage rate includes the property taxes and insurance in the payment.",
          "The annual percentage rate reflects the rate after the first adjustment on an adjustable loan."
        ],
        correctChoice: 0,
        rationale: "The gap between the two figures is the point of the annual percentage rate. It does not include escrowed taxes and insurance and is not an adjustment-period rate."
      },
      {
        prompt: "A loan includes a prepayment charge. What must the borrower understand?",
        choices: [
          "That paying the loan off early within the specified period would trigger a charge, which affects refinancing and sale plans and must be disclosed.",
          "That the lender may refuse to accept early payoff.",
          "That the charge applies only if the loan is refinanced with a different lender.",
          "That the charge substitutes for the points otherwise payable at closing."
        ],
        correctChoice: 0,
        rationale: "A prepayment charge conditions early payoff on a cost, which is why it matters to anyone who may sell or refinance. It does not bar payoff, is not limited to competitor refinances, and is not a substitute for points."
      },
      {
        prompt: "What must an adjustable-rate disclosure convey to the borrower?",
        choices: [
          "How and when the rate and payment can change, the index and margin, and the caps that limit each adjustment and the loan's lifetime rate.",
          "The exact payment amount for every year of the loan term.",
          "A guarantee that the rate will not exceed the initial rate for a stated period.",
          "The lender's forecast of the index over the loan term."
        ],
        correctChoice: 0,
        rationale: "The disclosure explains the mechanism and its limits, since no one can state future payments or forecast the index. A guarantee beyond what the note provides would be a misrepresentation."
      },
      {
        prompt: "Which change would most clearly constitute a changed circumstance justifying revised disclosures?",
        choices: [
          "Information relied on in the estimate turns out to be inaccurate, or the borrower requests a change to the loan's terms.",
          "The lender's internal processing takes longer than expected.",
          "The originator's estimate of a third-party fee was simply too low.",
          "The lender decides its margin on the loan should be higher."
        ],
        correctChoice: 0,
        rationale: "Changed circumstances involve new or corrected information or a borrower-requested change. Internal delays, careless estimating, and margin decisions are the lender's own and do not justify revising what the borrower was told."
      },
      {
        prompt: "A borrower is given a written list of settlement service providers he may shop for. What is the effect?",
        choices: [
          "Costs for services the borrower may shop are treated differently from those he cannot, so his choices affect which tolerance applies to those charges.",
          "The borrower must select a provider from the list or the loan cannot close.",
          "The listed providers have been vetted and guaranteed by the lender.",
          "The list replaces the lender's obligation to disclose those costs."
        ],
        correctChoice: 0,
        rationale: "The list exists because shoppable and non-shoppable charges carry different tolerance treatment. It does not compel selection from the list, endorse the providers, or remove the disclosure obligation."
      }
    ]
  },
  "assignment-10": {
    subject: "Origination, processing, and closing workflow",
    applied: {
      prompt: "A file has been submitted to underwriting. The processor emails the borrower a list of eight conditions, receives four documents back, and forwards them without review. Two are for the wrong tax year and one is an unsigned form. The underwriter returns the file, the rate lock is now four days from expiry, and the borrower is angry. What went wrong and what is the correct practice?",
      choices: [
        "Documents must be reviewed for responsiveness and completeness before submission, because forwarding unreviewed items consumes underwriting cycles and, here, put the rate lock at risk — the correct practice is to check each item against the condition it answers before it goes up.",
        "Nothing went wrong; underwriting exists to identify document defects and returning files is a normal part of the process.",
        "The borrower is at fault for supplying the wrong documents, and the file should simply be resubmitted.",
        "The rate lock should have been set longer, which would have made the review failures immaterial."
      ],
      correctChoice: 0,
      rationale: "Each unreviewed submission costs a round trip, and rate locks make those round trips expensive. Underwriting is not a document-checking service, the borrower relied on the processor's instructions, and a longer lock would have masked the process failure rather than fixed it."
    },
    engagement: [
      {
        prompt: "What generally distinguishes a prequalification from a completed loan application?",
        choices: [
          "A prequalification is a preliminary assessment based largely on stated information, while an application collects the specific information that triggers disclosure obligations and begins the formal process.",
          "A prequalification is issued by an underwriter and an application is taken by an originator.",
          "A prequalification requires a credit report and an application does not.",
          "A prequalification is binding on the lender while an application is not."
        ],
        correctChoice: 0,
        rationale: "The application is the formal step that starts the process and the disclosure clock. Neither is binding on the lender, and the distinction is not about who takes it."
      },
      {
        prompt: "What is the processor's central role in the workflow?",
        choices: [
          "To assemble a complete, verified, internally consistent file so the underwriter can make a decision on accurate information.",
          "To make the credit decision on straightforward files so the underwriter can focus on complex ones.",
          "To negotiate the loan terms with the wholesale lender on the borrower's behalf.",
          "To advise the borrower on which loan product best suits his circumstances."
        ],
        correctChoice: 0,
        rationale: "Processing prepares the file for a decision; it does not make the decision, negotiate terms, or advise on product selection."
      },
      {
        prompt: "What does a rate lock accomplish?",
        choices: [
          "It fixes the quoted interest rate and points for a defined period, subject to conditions, protecting the borrower from market movement while the file is completed.",
          "It guarantees that the loan will be approved at the locked terms.",
          "It obligates the borrower to complete the loan with that lender.",
          "It fixes the borrower's monthly payment regardless of the final loan amount."
        ],
        correctChoice: 0,
        rationale: "A lock addresses rate risk for a limited period. It is not an approval, does not compel the borrower to proceed, and does not fix a payment independent of the loan amount."
      },
      {
        prompt: "What does 'clear to close' signify?",
        choices: [
          "The lender's conditions have been satisfied and the file may proceed to document preparation and closing.",
          "The loan has funded and the transaction is complete.",
          "The appraisal has been received and reviewed.",
          "The borrower has signed the closing documents."
        ],
        correctChoice: 0,
        rationale: "It marks the point where conditions are satisfied and closing can be scheduled — before signing, before funding, and after the appraisal among other items."
      },
      {
        prompt: "Why does post-closing quality control exist?",
        choices: [
          "To verify after the fact that files met requirements and that the information relied on was accurate, which detects errors and fraud and satisfies investor obligations.",
          "To determine whether the borrower has made his first payment.",
          "To calculate the originator's compensation on the closed loan.",
          "To transfer the servicing rights to another company."
        ],
        correctChoice: 0,
        rationale: "Quality control is a retrospective check on file integrity. Payment monitoring, compensation, and servicing transfers are separate functions."
      }
    ],
    remediation: [
      {
        prompt: "A borrower opens a new credit card and finances furniture two weeks before closing. What is the risk?",
        choices: [
          "The new obligations change the debt-to-income analysis the approval was based on, and lenders commonly re-check credit before funding, so the loan may be delayed or denied.",
          "There is no risk, because the approval was already issued.",
          "The risk is only that the borrower's credit score may drop slightly.",
          "The risk arises only if the new payments exceed the borrower's monthly reserves."
        ],
        correctChoice: 0,
        rationale: "The approval rests on the facts as underwritten, and a pre-funding credit re-check is standard. The issue is the changed obligations, not the score alone, and it does not turn on reserves."
      },
      {
        prompt: "A rate lock is about to expire and the loan is not ready to close. What is the sound handling?",
        choices: [
          "Tell the borrower promptly, explain the extension options and any cost, and address who bears it under the terms agreed — rather than letting the lock lapse silently.",
          "Allow the lock to expire and re-lock at whatever rate is then available.",
          "Close the loan on incomplete conditions to preserve the rate.",
          "Extend the lock without telling the borrower, since extension costs are the brokerage's concern."
        ],
        correctChoice: 0,
        rationale: "The borrower bears the consequence of a lapsed lock and must be told in time to make a decision. Closing on incomplete conditions is not available, and a silent extension conceals a cost that may be his."
      },
      {
        prompt: "Why is the sequence of disclosure delivery in the origination workflow significant?",
        choices: [
          "Because disclosure obligations are triggered by defined events and carry timing requirements, so the workflow must deliver them when required rather than when convenient.",
          "Because disclosures must all be delivered together at closing to avoid confusing the borrower.",
          "Because the order determines which lender may fund the loan.",
          "Because early delivery obligates the borrower to proceed with the loan."
        ],
        correctChoice: 0,
        rationale: "Triggers and timing are what the rules impose. Bundling everything at closing defeats the purpose, and disclosure creates no obligation on the borrower to proceed."
      },
      {
        prompt: "The borrower's employment can no longer be verified two days before funding because the employer has stopped responding. What should happen?",
        choices: [
          "The condition remains unsatisfied and the file cannot fund until employment is verified by an acceptable alternative method.",
          "Funding may proceed since the verification was obtained earlier in the process.",
          "The borrower's own written statement may substitute for the verification.",
          "The condition may be waived because the failure is the employer's rather than the borrower's."
        ],
        correctChoice: 0,
        rationale: "A pre-funding condition must actually be satisfied, and the reason it cannot be does not waive it. An earlier verification does not confirm current employment, and the borrower's statement is not independent verification."
      },
      {
        prompt: "What most reliably prevents last-minute closing failures?",
        choices: [
          "Verifying and reviewing documents as they arrive, tracking conditions against deadlines, and communicating status to the borrower throughout.",
          "Setting the closing date far enough out that delays are absorbed.",
          "Submitting the file to multiple lenders simultaneously as a backup.",
          "Waiting to submit until every possible document has been collected."
        ],
        correctChoice: 0,
        rationale: "Continuous verification and tracking is what surfaces problems early. Padding the schedule hides them, parallel submissions multiply work and disclosure obligations, and waiting for a perfect file delays the underwriting that identifies what is actually needed."
      }
    ]
  },
  "assignment-11": {
    subject: "Appraisal, title, escrow, and settlement",
    applied: {
      prompt: "An originator is frustrated that an appraisal came in low. She calls the appraiser, says the transaction will die without another $25,000 of value, forwards three additional sales she selected, and asks him to 'take another look.' The appraiser revises the value upward. What is the correct assessment?",
      choices: [
        "Pressuring an appraiser toward a target value violates appraiser independence, and the fact that the value changed after the call makes the resulting appraisal unreliable — providing genuinely relevant additional data through the proper channel is legitimate, but stating the needed number is not.",
        "There is no problem, because the originator provided factual comparable sales rather than making up a value.",
        "There is no problem, because the appraiser exercised his own independent judgment in deciding to revise.",
        "The only problem is that the originator contacted the appraiser directly rather than through the lender."
      ],
      correctChoice: 0,
      rationale: "The distinction is between supplying information and supplying a target. Naming the number the transaction needs is exactly the influence independence rules exist to prevent, and the appraiser's nominal independence does not cure a value that moved after being told what it had to be."
    },
    engagement: [
      {
        prompt: "Why is appraiser independence protected in mortgage lending?",
        choices: [
          "Because the lender and the secondary market rely on the valuation to measure collateral risk, and a value influenced by parties with an interest in closing is unreliable for that purpose.",
          "Because appraisers are prohibited from communicating with anyone involved in the transaction.",
          "Because independence determines which appraisal approach must be used.",
          "Because independence rules set the fee the appraiser may charge."
        ],
        correctChoice: 0,
        rationale: "Reliability of the collateral measure is the reason. Appropriate communication is permitted through proper channels, and independence rules govern neither methodology nor fees."
      },
      {
        prompt: "What does the lender's title policy insure?",
        choices: [
          "The validity and priority of the lender's lien, up to the policy amount and subject to its exceptions and exclusions.",
          "The borrower's ownership interest in the property.",
          "The property's physical condition at the time of closing.",
          "The accuracy of the appraised value relied on by the lender."
        ],
        correctChoice: 0,
        rationale: "A lender's policy insures the lien and its priority. Ownership is the owner's policy, and neither condition nor value is a title matter."
      },
      {
        prompt: "What is escrow's role in a mortgage transaction closing?",
        choices: [
          "To act as a neutral holder that receives funds and documents and disburses and records according to the parties' and the lender's instructions.",
          "To verify that the borrower qualifies for the loan.",
          "To approve the loan terms on the borrower's behalf.",
          "To determine which liens must be paid from the proceeds."
        ],
        correctChoice: 0,
        rationale: "Escrow implements instructions neutrally. Qualification is underwriting, term approval is the parties', and which liens are paid is determined by the title work and the instructions rather than by escrow's own judgment."
      },
      {
        prompt: "Why does the lender require a title report before funding?",
        choices: [
          "To confirm what interests exist against the property and what must be cleared so its lien records in the required position.",
          "To confirm the property's square footage and physical characteristics.",
          "To confirm the seller's asking price is reasonable.",
          "To confirm the borrower's occupancy of the property."
        ],
        correctChoice: 0,
        rationale: "Title work exists for lien position. Physical characteristics come from the appraisal, price from the contract, and occupancy from separate documentation."
      },
      {
        prompt: "What happens at funding in a typical purchase transaction?",
        choices: [
          "The lender releases the loan proceeds to escrow subject to its conditions, and after recording confirms the lien's position, escrow disburses.",
          "The borrower receives the loan proceeds directly and pays the seller.",
          "The lender records its deed of trust and then decides whether to release funds.",
          "Escrow disburses to all parties and then requests the loan proceeds from the lender."
        ],
        correctChoice: 0,
        rationale: "Funds flow to escrow under conditions, recording establishes position, and disbursement follows. Proceeds do not pass through the borrower, and escrow does not disburse before it holds the funds."
      }
    ],
    remediation: [
      {
        prompt: "The appraisal identifies significant deferred maintenance affecting habitability. What is the likely underwriting consequence?",
        choices: [
          "The lender may condition the loan on repairs being completed or on a holdback, because the collateral's condition affects its value and marketability.",
          "The appraisal is disregarded because condition is the buyer's concern rather than the lender's.",
          "The loan amount is automatically reduced by the estimated repair cost.",
          "The lender must obtain a second appraisal from a different appraiser."
        ],
        correctChoice: 0,
        rationale: "Condition affects the collateral, so the lender addresses it with conditions. It is not disregarded, not handled by an automatic reduction, and does not require a second appraisal."
      },
      {
        prompt: "The preliminary report shows an unreleased deed of trust from a loan the borrower says he paid off years ago. What must happen?",
        choices: [
          "A recorded reconveyance or other clearing document must be obtained, because the record still shows the lien regardless of whether the debt was paid.",
          "The borrower's statement that it was paid is sufficient for the lender.",
          "The new lender may record ahead of it because the underlying debt no longer exists.",
          "Title insurance will cover the item automatically without further action."
        ],
        correctChoice: 0,
        rationale: "Priority is determined by the record, so an unreleased lien must be cleared of record. The borrower's recollection does not clear it, recording later does not leapfrog it, and the insurer will except rather than silently insure it."
      },
      {
        prompt: "Who selects the appraiser in a typical residential mortgage transaction, and why?",
        choices: [
          "The lender or an independent management process makes the assignment, so that parties with an interest in the transaction closing do not choose the valuer.",
          "The borrower, since the borrower pays the appraisal fee.",
          "The originator, who knows which appraisers work efficiently.",
          "The seller's agent, who has the best knowledge of the local market."
        ],
        correctChoice: 0,
        rationale: "Separating selection from the interested parties is the structural protection for independence — which is exactly why neither the borrower's payment nor the originator's convenience determines the choice."
      },
      {
        prompt: "The settlement statement shows a payoff amount higher than the borrower expected. What is the most likely explanation?",
        choices: [
          "The payoff includes interest accrued to the payoff date and may include other amounts under the note, so it exceeds the principal balance alone.",
          "The escrow holder added a fee for processing the payoff.",
          "The lender is charging the borrower for the new loan's costs twice.",
          "The payoff figure is an error that should be recalculated by escrow."
        ],
        correctChoice: 0,
        rationale: "A payoff is the balance plus accrued interest and any other amounts owed under the note, which is why it exceeds the principal. Escrow does not compute the payoff figure and would not recalculate the lender's demand."
      },
      {
        prompt: "Why must documents be recorded in the correct order at closing?",
        choices: [
          "Because recording order establishes lien priority, so an out-of-sequence recording can place the new lender behind an interest it was to be ahead of.",
          "Because the county requires documents to be submitted alphabetically.",
          "Because the order determines the effective date of the borrower's ownership.",
          "Because the order affects the transfer tax due on the transaction."
        ],
        correctChoice: 0,
        rationale: "Sequence determines priority, which is the entire point of controlling it at closing. It does not affect submission formalities, the ownership date, or transfer tax."
      }
    ]
  },
  "assignment-12": {
    subject: "Private money, seller financing, and nontraditional transactions",
    applied: {
      prompt: "A borrower who owns a landscaping business asks a broker to arrange a $200,000 private-money loan secured by a second lien on his home, to buy equipment for the business. The private investor wants a rate above the general usury limit and a one-year term with a balloon. The broker says usury is not a concern because 'private loans are exempt.' How should the situation be analyzed?",
      choices: [
        "The exemption commonly relied on is for loans made or arranged by a licensed real estate broker, which depends on the broker's actual role and licensure rather than on the loan being private — the classification also turns on the loan's purpose, and both should be confirmed with counsel before the terms are set.",
        "The broker is correct: loans funded by private investors rather than institutions are outside the usury limits.",
        "Usury limits never apply to loans secured by real property in California.",
        "The rate is permissible because the borrower is a business owner, which exempts all of his borrowing."
      ],
      correctChoice: 0,
      rationale: "The exemption depends on the broker actually making or arranging the loan under a valid license, not on the funding source being private. Blanket statements that private loans, real-property loans, or business owners' loans are exempt each misstate the rule, and getting it wrong on a note that is already written is expensive."
    },
    engagement: [
      {
        prompt: "What characterizes private money lending?",
        choices: [
          "Loans funded by individual or non-institutional investors, often underwritten primarily on the collateral, typically at higher cost and shorter term than institutional financing.",
          "Loans made by institutions to borrowers who do not qualify for conventional financing.",
          "Loans that are exempt from all disclosure and licensing requirements.",
          "Loans made without any security instrument recorded against the property."
        ],
        correctChoice: 0,
        rationale: "Private capital, collateral-focused underwriting, and higher cost and shorter term are the hallmarks. Private funding does not remove disclosure or licensing obligations, and these loans are secured."
      },
      {
        prompt: "What is seller carryback financing?",
        choices: [
          "The seller extends credit to the buyer for part of the purchase price, taking a note secured by the property rather than receiving all cash at closing.",
          "The buyer assumes the seller's existing loan on the property.",
          "The seller pays a portion of the buyer's closing costs at settlement.",
          "The seller leases the property back from the buyer after closing."
        ],
        correctChoice: 0,
        rationale: "A carryback is seller-extended credit secured by the property. Assumption, seller credits, and sale-leasebacks are all different arrangements."
      },
      {
        prompt: "What generally distinguishes a business-purpose loan from a consumer-purpose loan?",
        choices: [
          "The purpose for which the proceeds are used, which determines which consumer protection frameworks apply — not the type of collateral or whether the borrower is an individual.",
          "Whether the borrower is a business entity rather than a natural person.",
          "Whether the collateral is commercial rather than residential property.",
          "Whether the loan amount exceeds a stated threshold."
        ],
        correctChoice: 0,
        rationale: "Purpose controls the classification. Entity status, collateral type, and loan size are common but unreliable proxies, and relying on them is how loans get misclassified."
      },
      {
        prompt: "What is the principal risk to a borrower in a short-term hard-money loan with a balloon?",
        choices: [
          "That the balloon comes due before the borrower can refinance or sell, exposing him to default and foreclosure on terms that leave little time to react.",
          "That the interest rate will adjust upward during the short term.",
          "That the lender may demand additional collateral during the term.",
          "That the loan cannot be prepaid before maturity."
        ],
        correctChoice: 0,
        rationale: "Balloon risk is refinance-or-sell risk concentrated at a single date. Short-term hard-money loans are typically fixed for the term, and additional collateral demands and prepayment bars are not the characteristic hazard."
      },
      {
        prompt: "What documentation matters most in a broker-arranged private loan?",
        choices: [
          "Clear disclosure to both the borrower and the investor of the terms, the risks, the broker's role, and the broker's compensation.",
          "A verbal understanding between the parties, since private loans are negotiated individually.",
          "Documentation of the investor's net worth only.",
          "The borrower's credit report, which substitutes for other disclosures."
        ],
        correctChoice: 0,
        rationale: "Both sides are relying on the broker, so both need the terms, risks, role, and compensation in writing. Verbal understandings, one-sided documentation, and a credit report do not discharge that."
      }
    ],
    remediation: [
      {
        prompt: "A seller carrying back a note asks how he can reduce his risk. What is the sound guidance?",
        choices: [
          "Address the buyer's creditworthiness, the lien position of the carryback, the note's terms and remedies, and the documentation — and involve counsel, since the seller is now a lender.",
          "Rely on the property's value, since the seller can foreclose if the buyer defaults.",
          "Require the buyer to pay a larger down payment and treat that as sufficient protection.",
          "Structure the carryback as an unsecured personal loan for flexibility."
        ],
        correctChoice: 0,
        rationale: "Becoming a lender means taking on credit, lien-position, and documentation risk together. Collateral value alone ignores position and cost of recovery, a down payment addresses only one dimension, and dropping the security makes matters worse."
      },
      {
        prompt: "A private investor asks the broker to guarantee the loan will perform. What should the broker say?",
        choices: [
          "That no one can guarantee borrower performance, and that the investor's protection comes from disclosed underwriting, lien position, and documentation rather than from a promise.",
          "That the loan will perform because it is secured by real property.",
          "That the broker will personally cover any shortfall to close the investment.",
          "That the investor should rely on the broker's track record with similar loans."
        ],
        correctChoice: 0,
        rationale: "A performance guarantee is one no originator can honestly give, and offering a personal backstop or a track record in its place substitutes reassurance for the actual protections."
      },
      {
        prompt: "How should a broker treat a loan the borrower says is for 'business expansion' but which will actually pay off personal credit cards?",
        choices: [
          "As a consumer-purpose loan, because the actual use of proceeds controls the classification and the broker may not rely on a label that the file contradicts.",
          "As a business-purpose loan, since the borrower stated the purpose in writing.",
          "As a business-purpose loan, since the borrower operates a business.",
          "As whichever classification the funding investor prefers."
        ],
        correctChoice: 0,
        rationale: "Actual use governs, which is why a written label the file contradicts does not protect anyone. Business ownership and investor preference are irrelevant to the classification."
      },
      {
        prompt: "What makes a balloon payment structure appropriate or inappropriate for a particular borrower?",
        choices: [
          "Whether the borrower has a realistic, evidenced path to repay or refinance by the maturity date, evaluated at origination rather than assumed.",
          "Whether the borrower is comfortable with the monthly payment amount.",
          "Whether the interest rate is lower than a fully amortizing alternative.",
          "Whether the balloon is disclosed in the loan documents."
        ],
        correctChoice: 0,
        rationale: "Suitability turns on the exit, evidenced at origination. Payment comfort, a lower rate, and disclosure are all relevant but none of them answers whether the borrower can meet the balloon."
      },
      {
        prompt: "Why do nontraditional transactions warrant heightened documentation of the broker's advice?",
        choices: [
          "Because the terms are less standardized and the risks less familiar to the parties, so the record of what was explained is what shows the parties decided with the risks in front of them.",
          "Because nontraditional loans are prohibited unless documented in detail.",
          "Because investors require the documentation before funding.",
          "Because documentation converts the broker's role into that of a lender."
        ],
        correctChoice: 0,
        rationale: "Unfamiliar, non-standard terms are where misunderstanding concentrates, which is why the advisory record matters most there. These loans are not prohibited, and documentation does not change the broker's role."
      }
    ]
  },
  "assignment-13": {
    subject: "Servicing, payoff, default, and foreclosure",
    applied: {
      prompt: "A former client calls in distress: he has missed three payments after a job loss, received a recorded notice of default, and been told by a company that for an upfront fee it can 'stop the foreclosure and force a modification.' He asks the broker what to do. What is the correct response?",
      choices: [
        "Explain the nonjudicial process and that a right to reinstate exists for a defined period, urge him to contact his servicer about loss mitigation directly and at no cost, warn that upfront-fee foreclosure rescue offers are a recognized fraud pattern and are specially restricted, and refer him to a HUD-approved counselor or attorney.",
        "Offer to negotiate the modification with the servicer for a fee, since the broker understands lending and can advocate effectively.",
        "Tell him the foreclosure cannot be stopped once a notice of default has been recorded and he should prepare to move.",
        "Tell him to stop communicating with the servicer, since anything he says can be used against him."
      ],
      correctChoice: 0,
      rationale: "The borrower needs three things: an accurate picture of where he is in the process, the free channel that actually exists, and a warning about the fee-first rescue pattern that targets exactly his situation. Charging him a fee to do it would replicate the pattern, and both the give-up answer and the stop-communicating answer are wrong and harmful."
    },
    engagement: [
      {
        prompt: "What does a loan servicer do?",
        choices: [
          "Collects payments, maintains the loan account and escrow account, provides statements and payoff figures, and handles default and loss mitigation activity.",
          "Underwrites and approves the loan before closing.",
          "Owns the loan and bears the credit risk of default.",
          "Originates new loans on behalf of the investor that holds the loan."
        ],
        correctChoice: 0,
        rationale: "Servicing is account administration after closing. It is separate from underwriting, from ownership of the loan, and from origination — a servicer may or may not own the loans it services."
      },
      {
        prompt: "What is the purpose of an escrow or impound account?",
        choices: [
          "The servicer collects a portion of taxes and insurance with each payment and pays those obligations when due, protecting both borrower and lender from a lapse.",
          "It holds the borrower's down payment until the loan is fully repaid.",
          "It holds the loan proceeds until the borrower requests disbursement.",
          "It accumulates funds to make the final balloon payment."
        ],
        correctChoice: 0,
        rationale: "The account spreads and secures tax and insurance obligations. It has nothing to do with the down payment, loan proceeds, or a balloon."
      },
      {
        prompt: "What is a payoff demand statement?",
        choices: [
          "A statement from the lender or servicer of the amount required to satisfy the loan in full as of a stated date, including accrued interest and other amounts owed.",
          "A notice to the borrower that the lender is accelerating the debt after default.",
          "The borrower's request that the lender release the security instrument.",
          "The escrow holder's calculation of the amounts due at closing."
        ],
        correctChoice: 0,
        rationale: "A payoff demand comes from the lender's side and states what satisfies the debt. Acceleration, reconveyance requests, and escrow's settlement calculations are different documents."
      },
      {
        prompt: "In a California nonjudicial foreclosure, what generally initiates the process?",
        choices: [
          "The recording of a notice of default, after which a further period must pass before a notice of sale may be recorded and the trustee's sale held.",
          "The filing of a lawsuit by the lender against the borrower.",
          "The servicer's internal decision to accelerate the loan.",
          "The trustee's sale itself, which is the first recorded step."
        ],
        correctChoice: 0,
        rationale: "Nonjudicial foreclosure runs through recorded notices — default first, then sale — without court action. A lawsuit describes judicial foreclosure, and internal decisions are not recorded steps."
      },
      {
        prompt: "What is loss mitigation?",
        choices: [
          "The servicer's process of evaluating alternatives to foreclosure, such as repayment plans, modifications, forbearance, short sales, or deeds in lieu.",
          "The lender's insurance against loss on the loan.",
          "The reduction of the loan balance automatically applied after a missed payment.",
          "The borrower's legal defense against the foreclosure action."
        ],
        correctChoice: 0,
        rationale: "Loss mitigation is the servicer's alternatives-to-foreclosure process. It is not insurance, not an automatic balance reduction, and not the borrower's litigation posture."
      }
    ],
    remediation: [
      {
        prompt: "A borrower in default asks whether he can bring the loan current and stop the sale. What is generally true in a California nonjudicial foreclosure?",
        choices: [
          "A right to reinstate by curing the default and paying the required costs generally exists for a defined period before the sale, after which the options narrow.",
          "There is no way to stop the process once a notice of default has been recorded.",
          "The borrower may reinstate at any time before the trustee delivers the deed to the purchaser.",
          "Reinstatement requires the lender's discretionary consent in every case."
        ],
        correctChoice: 0,
        rationale: "A defined reinstatement window exists and then closes, which is why timing is the critical fact for a borrower in default. It is neither impossible from the outset, nor available right up to delivery of the deed, nor purely discretionary."
      },
      {
        prompt: "What happens after the loan is paid in full and the payoff is confirmed?",
        choices: [
          "The beneficiary requests the trustee to reconvey, and a recorded reconveyance removes the deed of trust from the record.",
          "The security interest lapses automatically with no further recording.",
          "The servicer records a satisfaction of judgment.",
          "The borrower records a new deed to himself clearing the encumbrance."
        ],
        correctChoice: 0,
        rationale: "A recorded reconveyance is what clears the record. Payment alone does not clear it, no judgment is involved, and the borrower cannot clear another party's lien by deeding to himself."
      },
      {
        prompt: "A borrower complains that his servicer misapplied a payment. What is the appropriate path?",
        choices: [
          "Submit the complaint to the servicer in writing so the servicer's investigation and response obligations are engaged, and escalate to the appropriate regulator if it is not resolved.",
          "Withhold the next payment until the error is corrected.",
          "Contact the original originator, who remains responsible for the account.",
          "Wait for the annual escrow statement to see whether the error self-corrects."
        ],
        correctChoice: 0,
        rationale: "A written complaint triggers the servicer's response obligations and creates the record. Withholding payment causes a real default, the originator no longer administers the account, and waiting lets the error compound."
      },
      {
        prompt: "What is a deed in lieu of foreclosure?",
        choices: [
          "A voluntary transfer of the property from the borrower to the lender in satisfaction or partial satisfaction of the debt, avoiding the foreclosure process.",
          "A court order transferring the property to the lender after judicial foreclosure.",
          "The deed the trustee delivers to the purchaser at a trustee's sale.",
          "A document by which the borrower waives his right to reinstate."
        ],
        correctChoice: 0,
        rationale: "A deed in lieu is a negotiated voluntary conveyance replacing the foreclosure. The other three describe a judicial decree, a trustee's deed, and a waiver."
      },
      {
        prompt: "Why does servicing recordkeeping matter to a borrower's later dispute?",
        choices: [
          "Because the payment history, escrow analysis, and correspondence are the evidence of what was owed, what was paid, and what the borrower was told.",
          "Because the servicer's records determine the loan's interest rate.",
          "Because records are needed for the servicer to transfer servicing rights.",
          "Because the borrower may not obtain a payoff figure without them."
        ],
        correctChoice: 0,
        rationale: "The records are the evidentiary basis for resolving disputes about the account. The rate comes from the note, and transfers and payoff figures are routine operations rather than the reason retention matters."
      }
    ]
  },
  "assignment-14": {
    subject: "Fair lending, fraud prevention, and ethical mortgage practice",
    applied: {
      prompt: "An originator notices a pattern across her own pipeline: applicants from one neighborhood are quoted higher rates for comparable credit profiles, one file shows a borrower's stated occupancy that contradicts a lease she found in the documents, and a wire instruction arrived from an escrow email address one character different from the earlier thread. Her manager tells her to focus on closing volume. What should she do?",
      choices: [
        "Escalate all three: the pricing pattern is a fair lending concern regardless of intent, the occupancy contradiction is a documented red flag she may not ignore, and the altered email address must be verified through an independently known number before any funds move.",
        "Address only the wire issue, since it is the only one with immediate financial exposure.",
        "Follow her manager's direction and document that she raised the concerns.",
        "Address the occupancy and wire issues but treat the pricing pattern as a management analytics question rather than her concern."
      ],
      correctChoice: 0,
      rationale: "All three are live and each has its own escalation path. Disparate pricing is a fair lending matter whether or not anyone intended it, a contradicted occupancy statement in her own file is hers to resolve, and a near-miss email address is the signature of wire fraud. Recording that she raised concerns does not discharge the duty to act on them."
    },
    engagement: [
      {
        prompt: "What does fair lending law prohibit in the pricing of credit?",
        choices: [
          "Differences in pricing based on prohibited characteristics rather than on legitimate, consistently applied risk and cost factors.",
          "Any variation in pricing between borrowers.",
          "Pricing that exceeds a rate set by regulators.",
          "Pricing that differs from what a competitor would offer."
        ],
        correctChoice: 0,
        rationale: "Risk-based pricing is lawful; pricing driven by prohibited characteristics is not. Fair lending law sets neither uniform prices nor rate ceilings."
      },
      {
        prompt: "What is occupancy fraud?",
        choices: [
          "Misrepresenting whether the borrower will occupy the property, typically to obtain the better pricing and terms available for owner-occupied loans.",
          "Occupying a property before the loan has funded.",
          "Renting out a property that was financed as an investment.",
          "Failing to notify the lender of a change in occupancy after several years."
        ],
        correctChoice: 0,
        rationale: "The fraud is the misrepresentation at application to obtain better terms. Renting a property financed as an investment is the disclosed use, and early occupancy is a different issue."
      },
      {
        prompt: "Which fact pattern most suggests possible income fraud in a loan file?",
        choices: [
          "Pay documentation that is internally inconsistent, does not reconcile with tax records or bank deposits, or comes from an employer that cannot be independently verified.",
          "A borrower whose income has increased substantially over the past two years.",
          "A borrower who is paid partly in commissions that vary month to month.",
          "A borrower who is self-employed rather than a wage earner."
        ],
        correctChoice: 0,
        rationale: "Inconsistency and unverifiability are the indicators. Rising income, variable commissions, and self-employment are ordinary circumstances that require analysis, not suspicion."
      },
      {
        prompt: "What is the most reliable protection against wire fraud in a mortgage closing?",
        choices: [
          "Verifying wire instructions by voice with the settlement agent at an independently known number before funds are sent, never using contact details supplied in the email itself.",
          "Confirming the instructions by replying to the email that transmitted them.",
          "Sending a small test wire before the full amount.",
          "Requiring the settlement agent to encrypt the email containing the instructions."
        ],
        correctChoice: 0,
        rationale: "Verification must use a channel the fraudster does not control, which is why replying to the message confirms nothing. A test wire and encryption address different risks and neither validates the account details."
      },
      {
        prompt: "What is the ethical standard for presenting loan products to a borrower?",
        choices: [
          "Present options accurately, including the risks and how each fits the borrower's circumstances, without steering toward the product that pays the originator more.",
          "Present only the product the originator believes the borrower is most likely to accept.",
          "Present the product with the lowest monthly payment first, since affordability governs.",
          "Present all available products without comment, leaving the analysis entirely to the borrower."
        ],
        correctChoice: 0,
        rationale: "Accurate presentation with risks and fit, free of compensation-driven steering, is the standard. Pre-selecting for acceptance, leading with the lowest payment, and abdicating the advisory role all fall short in different directions."
      }
    ],
    remediation: [
      {
        prompt: "An originator discovers that a coworker submitted an altered bank statement to support a borrower's reserves. What should she do?",
        choices: [
          "Report it to the broker or compliance immediately, because submitting altered documents is fraud and she may not participate in it by staying silent.",
          "Ask the coworker to correct it and take no further action if he does.",
          "Withdraw from the file so she is not associated with it.",
          "Report it only if the loan closes and the borrower later defaults."
        ],
        correctChoice: 0,
        rationale: "Known fraud must be escalated. A quiet correction leaves the conduct unaddressed, withdrawal distances her without stopping it, and waiting for a default makes the outcome, not the act, the trigger."
      },
      {
        prompt: "A pattern shows applications from a particular area being denied at a much higher rate without documented underwriting reasons. What does this suggest?",
        choices: [
          "A possible fair lending problem that requires analysis and escalation, since a discriminatory effect can exist without any explicit discriminatory statement.",
          "Nothing, since each denial was decided on its own file.",
          "A data quality issue in the reporting system rather than a lending issue.",
          "A market issue, since some areas simply have weaker applicant profiles."
        ],
        correctChoice: 0,
        rationale: "Patterns are how effects-based discrimination surfaces, which is why individual-file reasoning does not answer them. Dismissing the pattern as data or market noise is precisely the response that lets it continue unexamined."
      },
      {
        prompt: "A borrower asks the originator to recommend an appraiser he knows will 'come in at value.' What is the correct response?",
        choices: [
          "Decline, explain that appraiser selection is separated from interested parties precisely to prevent this, and that the request describes influencing a valuation.",
          "Pass the name to the lender without comment, letting the lender decide.",
          "Agree, provided the appraiser is licensed and independent in fact.",
          "Agree, since the borrower is paying for the appraisal."
        ],
        correctChoice: 0,
        rationale: "The request is for a predetermined outcome, which is what independence rules exist to prevent. Passing the name along participates in it, and neither the appraiser's license nor who pays the fee changes what is being asked for."
      },
      {
        prompt: "Which practice best protects a borrower's personal information in an origination file?",
        choices: [
          "Limiting access to those who need it, using protected channels for transmission, and disposing of documents so the data cannot be reconstructed.",
          "Retaining every document indefinitely so nothing is ever lost.",
          "Emailing documents in original form and asking recipients to delete them after use.",
          "Storing files on a shared drive accessible to the whole office for coverage purposes."
        ],
        correctChoice: 0,
        rationale: "Access control, protected transmission, and secure disposal are the three controls that matter. Indefinite retention, unprotected email, and office-wide access each increase exposure."
      },
      {
        prompt: "What should an originator do when facts in a file do not add up but no single item is clearly false?",
        choices: [
          "Document the inconsistencies, resolve them with evidence, and escalate if they cannot be resolved — because fraud usually presents as a pattern of small inconsistencies rather than one obvious falsehood.",
          "Proceed, since suspicion without proof is not a basis to delay a borrower's loan.",
          "Decline the file quietly without explaining the concern to anyone.",
          "Ask the borrower to confirm in writing that everything he submitted is accurate."
        ],
        correctChoice: 0,
        rationale: "The pattern is the signal, so unresolved inconsistencies are exactly what to escalate. Proceeding ignores it, quiet declination leaves the next originator to face the same file blind, and a borrower's attestation adds nothing to facts that already conflict."
      }
    ]
  },
  "assignment-15": {
    subject: "Integrated California mortgage brokerage file",
    applied: {
      prompt: "You are auditing a closed broker-arranged California loan file. It contains: an application with the occupancy box checked owner-occupied and a lease for the same property dated a month earlier; a broker compensation disclosure showing a figure that differs from the closing disclosure; no California mortgage loan disclosure statement; a signed borrower authorization but no evidence of when the initial disclosures were delivered; and an advertisement in the marketing folder with no license identification. Which is the most serious?",
      choices: [
        "The occupancy contradiction, because a file that carries evidence the stated occupancy was false describes possible loan fraud — while the compensation discrepancy, the missing state disclosure, the undocumented delivery, and the unidentified advertisement are each independent violations that must also be recorded.",
        "The missing California disclosure statement, since it is the state-specific requirement and the file is a California file.",
        "The undocumented disclosure delivery, since timing determines the borrower's rights.",
        "None is serious in isolation; together they show a file that needs better organization."
      ],
      correctChoice: 0,
      rationale: "Ranking matters in an audit. Four of the five are compliance failures; the occupancy contradiction is different in kind because the file itself contains the evidence contradicting a material representation to the lender. Treating the set as an organizational problem misses that entirely."
    },
    engagement: [
      {
        prompt: "In a broker-arranged California loan, which disclosure obligations run in parallel?",
        choices: [
          "The federal integrated disclosures from the lender's side and the California broker disclosure to the borrower, which sit alongside each other rather than one replacing the other.",
          "Only the federal disclosures, since federal law preempts state disclosure requirements for mortgage loans.",
          "Only the California disclosures, since the broker is state licensed.",
          "Whichever set the funding lender specifies for its own program."
        ],
        correctChoice: 0,
        rationale: "Both apply. Neither preempts the other, and the funding lender's preferences do not select which legal obligations attach."
      },
      {
        prompt: "What should a complete broker file demonstrate about compensation?",
        choices: [
          "How much the broker was paid, by whom, and that the amount is consistent across the disclosures and the closing documents.",
          "That the compensation was within the range customary in the local market.",
          "That the borrower agreed the compensation was reasonable.",
          "That the compensation was approved by the funding lender."
        ],
        correctChoice: 0,
        rationale: "Amount, source, and internal consistency are what the file must show. Market customs, the borrower's opinion of reasonableness, and lender approval are not the standard."
      },
      {
        prompt: "Why does the file need evidence of when disclosures were delivered, not just that they were signed?",
        choices: [
          "Because disclosure requirements carry timing obligations and borrower rights that run from delivery, so a signature without a date proves the wrong thing.",
          "Because the lender requires delivery evidence for its own recordkeeping.",
          "Because escrow cannot close without dated disclosures.",
          "Because delivery dates determine the loan's interest rate lock period."
        ],
        correctChoice: 0,
        rationale: "Timing is what the rules impose and what the borrower's rights depend on. Lender recordkeeping, escrow's requirements, and rate locks are separate matters."
      },
      {
        prompt: "What makes a file 'regulator-ready'?",
        choices: [
          "It is complete, internally consistent, dated, retained for the required period, and able to show what was disclosed, when, by whom, and on what basis decisions were made.",
          "It contains every document the funding lender required at closing.",
          "It has been reviewed and signed off by the borrower after closing.",
          "It is stored electronically with a searchable index."
        ],
        correctChoice: 0,
        rationale: "Regulator-ready means the file answers questions about conduct and timing on its own. The lender's closing checklist, a borrower sign-off, and good indexing are useful but none of them supplies that."
      },
      {
        prompt: "Which item most directly evidences the broker's supervision of the transaction?",
        choices: [
          "A record showing the broker's review of the file's disclosures, advertising, and funds handling, and the resolution of any exceptions found.",
          "The broker's signature on the loan application.",
          "The brokerage's written policy manual.",
          "The originator's completion of continuing education."
        ],
        correctChoice: 0,
        rationale: "Supervision is shown by evidence of actual review and follow-through. A signature, a manual, and training records show intent or capability rather than that supervision occurred on this file."
      }
    ],
    remediation: [
      {
        prompt: "An audit finds the broker compensation stated differently on two documents in the same file. What is the correct response?",
        choices: [
          "Determine which figure is correct, document the discrepancy and its resolution, and correct the record going forward — without altering the executed documents.",
          "Replace the incorrect document with a corrected version bearing the original date.",
          "Remove the inconsistent document so the file is internally consistent.",
          "Leave both in place without comment, since the borrower did not object."
        ],
        correctChoice: 0,
        rationale: "A discrepancy honestly documented is survivable; backdating a replacement or removing evidence is falsification and far worse. Leaving it unexamined forfeits the chance to identify what actually happened."
      },
      {
        prompt: "A file is missing the state broker disclosure entirely. What does the audit conclude?",
        choices: [
          "That a required disclosure was not delivered, which is a violation to be recorded and escalated, and which cannot be cured by producing one now with a current date.",
          "That the disclosure was probably delivered and the copy was simply misfiled.",
          "That the federal disclosures in the file satisfy the requirement.",
          "That the omission is immaterial because the borrower received the loan he wanted."
        ],
        correctChoice: 0,
        rationale: "Absence of the document is what the record shows, and creating one now would misrepresent when it was delivered. Federal disclosures do not substitute, and the borrower's satisfaction does not cure a missing required disclosure."
      },
      {
        prompt: "Which sequence correctly orders the compliance events in a broker-arranged loan?",
        choices: [
          "Application taken, required disclosures delivered within their timing requirements, underwriting and conditions, final disclosure before consummation, closing and funding, then retention and audit.",
          "Application taken, underwriting completed, all disclosures delivered at closing, funding, retention.",
          "Disclosures delivered, application taken, underwriting, funding, closing, audit.",
          "Application taken, funding, disclosures delivered, underwriting, closing, retention."
        ],
        correctChoice: 0,
        rationale: "Disclosures follow the application on their own clocks and precede consummation, with retention afterward. Each wrong sequence delivers information after the decision it was meant to inform, or funds before the loan is underwritten."
      },
      {
        prompt: "An audit finds advertising in the file with no license identification. Why does this matter even though it did not affect this loan?",
        choices: [
          "Because advertising requirements protect consumers generally, and the violation is complete when the advertisement runs regardless of any particular transaction's outcome.",
          "Because the advertisement must be included in each borrower's file.",
          "Because the advertisement affects the broker's compensation disclosure.",
          "Because unidentified advertising invalidates the loans it generated."
        ],
        correctChoice: 0,
        rationale: "The violation is independent of the transaction, which is why 'it did not affect this loan' is not a defense. It does not belong in each borrower file, is unrelated to compensation, and does not invalidate loans."
      },
      {
        prompt: "What should the broker do with the findings of a file audit that identifies several violations?",
        choices: [
          "Record them, correct what can be corrected honestly, address the process failures that produced them, and document the whole response — since the response is itself part of what a regulator evaluates.",
          "Correct the files quietly and take no further action, since the issues are now resolved.",
          "Wait to act until a regulator raises the issues, so the response can be tailored to their concerns.",
          "Address only the findings that could produce borrower complaints."
        ],
        correctChoice: 0,
        rationale: "How a broker responds to its own findings is evidence of the supervision system working. Quiet correction, waiting for the regulator, and triaging by complaint risk each leave the process failure in place to repeat."
      }
    ]
  }
};

export default { courseId: "ca-mortgage-loan-brokering-lending-45", version: "1.0", assignments };
