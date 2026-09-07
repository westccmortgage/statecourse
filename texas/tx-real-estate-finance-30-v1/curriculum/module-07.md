# Module 07: Loan Types, Terms & Issues

REF-0 topic T07 suggests 200 minutes. This module connects loan structure with payment, cost, risk, and consumer protection. All rates, premiums, and fees in examples are hypothetical inputs.

## T07U1 — Interest

Interest is the charge for using principal over time. For simple interest, I = P × r × t, using compatible annual rate and year fraction. At $180,000, 6%, and 30/360, interest is $900. With actual/365 for 30 days it is about $887.67. Neither convention should be silently substituted for the one in the loan documents.

Amortization applies part of each payment to interest and the remainder to principal. On a level-payment fixed-rate loan, interest generally falls as the balance falls, allowing more of the payment to reduce principal. APR measures covered credit costs under Regulation Z and can differ from the note rate because of finance charges. One discount point is 1% of the relevant loan amount; paying a point does not guarantee a one-percentage-point rate reduction.

To construct an amortization row, begin with the opening balance, multiply it by the monthly periodic rate, subtract that interest from the scheduled P&I payment, and subtract the resulting principal reduction from the opening balance. Carry an unrounded balance in a calculator when possible, then round displayed dollars consistently. On $100,000 at 6% with a hypothetical payment of $650, first interest is $500, principal reduction is $150, and ending principal is $99,850. Next interest is $499.25. The payment did not change, but its allocation did. Taxes and insurance are not principal reduction just because the servicer collects them in the same monthly transfer.

The payment formula solves for a level payment that amortizes a balance over a stated number of periods: M = P × r ÷ [1 − (1 + r)^−n]. For a zero-rate loan, use P ÷ n instead of dividing by the formula's zero denominator. To calculate the balance after k ordinary payments, use Bk = P(1 + r)^k − M[(1 + r)^k − 1] ÷ r. These formulas assume the stated periodic rate, regular payments, no added advances or charges, and no missed payments. An actual servicing balance can differ when those assumptions fail. First reproduce one row manually before trusting a calculator's entire schedule.

A point is a percentage charge, while a basis point is one hundredth of a percentage point. A 0.25-percentage-point rate difference is 25 basis points, not 25%. A charge of 0.75 points on $200,000 is $1,500; it says nothing by itself about the rate reduction purchased. Distinguish a change measured in percentage points from a relative percentage change. Moving a rate from 5% to 6% is a one-percentage-point increase and a 20% relative increase in the rate, but the amortizing payment does not necessarily rise 20% because payment includes principal as well as interest.

### Applied exercise: A35 — Interest and points

Calculate 45 days of simple interest on $160,000 at 7.2% using actual/365, and the cost of 1.25 points on that amount. Explain why those figures cannot simply be added to obtain APR.

Feedback: interest is approximately $1,420.27; points cost $2,000. APR accounts for timing, amounts financed, and included finance charges under the rule. It is not the sum of dollar charges.

## T07U2 — Types of Loans

A fully amortizing loan pays the balance to zero by scheduled maturity if payments are made as required. A partially amortizing balloon loan leaves principal due at maturity. An interest-only period pays no scheduled principal during that period; later payments or a balloon must address the remaining balance. Negative amortization occurs when unpaid interest is added to principal under permitted terms, increasing debt despite payments.

A fixed-rate loan keeps its contractual rate fixed. An ARM uses an index plus a margin subject to adjustment terms and caps. Initial, periodic, and lifetime caps can differ. The initial discounted rate need not equal the fully indexed rate. A payment cap is not necessarily an interest-rate cap and can create unpaid interest if the permitted payment is insufficient. A temporary buydown subsidizes specified payments but does not necessarily change the note rate or the qualifying payment.

A construction loan advances funds for work under draw conditions; a bridge loan addresses a temporary funding gap; a reverse mortgage generally allows eligible borrowers to access equity with repayment deferred until specified events, while taxes, insurance, occupancy, and other obligations remain. Open-end HELOCs and closed-end home-equity loans have different structures. Texas homestead requirements apply independently of marketing labels.

Maturity and amortization answer different questions. Maturity is when the obligation comes due under the agreement. Amortization is the schedule used to allocate payments and reduce principal. A loan can use a 30-year amortization schedule but mature in seven years, leaving a balloon. A lower monthly payment under a long schedule can improve short-term cash flow while increasing the amount that must be refinanced or paid at the earlier maturity. Evaluate the balloon under an adverse refinance scenario, not only today's anticipated sale price. An extension option may have conditions and should not be assumed automatic.

Interest-only and negative-amortization structures also differ. If a $200,000 balance accrues $1,000 interest and the required payment is exactly $1,000, principal stays unchanged in the simplified period. If a permitted payment is $800 and the agreement adds unpaid interest to principal, the balance becomes $200,200. Future interest can then accrue on a larger balance. Neither structure is the same as an ordinary fully amortizing payment that reduces principal. A borrower may see a smaller current payment while taking on payment shock, refinance risk, or balance growth. Eligibility and consumer-law restrictions require the lender's actual analysis.

### Applied exercise: A36 — ARM reset

A hypothetical ARM begins at 5%, has a 2-percentage-point first-adjustment cap, a 1-point subsequent cap, a 10% lifetime ceiling, a 3% margin, and a 5% index at first adjustment. Calculate the fully indexed rate and the first permitted rate under these facts. Next year's index is 6%; calculate the next capped rate assuming no other floor or provision.

Feedback: fully indexed first rate is 8%, but first cap limits the move to 7%. Next fully indexed rate is 9%, but the subsequent cap permits 8%. The 10% lifetime ceiling is not yet binding. These are rate calculations, not payment calculations; remaining principal and term are also needed.

### Applied exercise: A76 — Amortization and a five-year exit

Compare two original hypothetical $300,000 fully amortizing offers with no fees, insurance, taxes, or prepayment charges in this calculation. Offer L is 30 years at 6%; offer S is 15 years at 5.75%. Use the level-payment and remaining-balance formulas above, retaining calculator precision and rounding final displayed amounts to cents. Calculate each payment, first-month interest, first-month principal reduction, and balance after 60 payments. Then calculate five years of payments using the rounded displayed monthly figures and compare the principal paid down. Write a household-budget tradeoff: the shorter loan reduces debt faster but requires a larger recurring payment. State two reasons the lower remaining balance does not alone establish suitability.

Feedback: payments are approximately $1,798.65 and $2,491.23. First interest is $1,500 and $1,437.50; first principal reductions using those displayed payments are $298.65 and $1,053.73. Using unrounded formula payments, balances after 60 payments are approximately $279,163.07 and $226,951.62. Principal reduction is $20,836.93 and $73,048.38. Sixty displayed payments total $107,919 and $149,473.80. S requires $692.58 more each month and produces substantially faster repayment under these assumptions. Qualification, cash reserves, household expenses, actual pricing, and ownership horizon still matter. Slight cent differences from a fully rounded monthly schedule should be identified rather than hidden.

## T07U3 — Private Mortgage Insurance

PMI protects a mortgage lender against specified losses on certain conventional loans. It is different from homeowners insurance protecting against property casualties and from credit-life insurance. The borrower can pay for protection benefiting the lender. Cancellation and termination depend on the applicable Homeowners Protection Act provisions, loan date/type, payment history, original value, and other conditions; FHA mortgage insurance follows different program rules.

For covered borrower-paid PMI, a borrower may request cancellation at the applicable 80% original-value point subject to conditions; automatic termination generally occurs at the scheduled 78% point when the borrower is current, with additional rules and exceptions. Appreciation does not create an unconditional statutory right to immediate cancellation on every loan. Obtain the servicer's requirements and the applicable program rule before promising a date.

Use the correct value basis and cancellation path. A request based on the original value and scheduled or actual balance is different from a request based on later appreciation under investor or servicer rules. The borrower should ask which path applies, what evidence is required, whether subordinate liens matter, and whether payment history or property condition affects the request. Do not order a valuation at the borrower's expense before confirming the servicer's acceptable process. Even when PMI ends, the principal debt, property-insurance obligation, taxes, and any association dues continue. A payment reduction from removing one component should not be advertised as cancellation of the mortgage itself.

### Applied exercise: A37 — Insurance distinction

A borrower's balance is 82% of original value but 75% of a claimed new value. Draft a request to the servicer asking about cancellation requirements. Explain why canceling homeowners insurance is not a substitute for eliminating PMI.

Create a comparison for two possible requests: statutory cancellation based on original value, and a lender/investor process using a current value. For each, identify the value evidence, payment-history evidence, required timing, and party that makes the decision. A household proposes saving $95 monthly by dropping hazard coverage while waiting. Calculate the apparent annual saving, then explain why that is not a valid PMI-cancellation strategy.

Feedback: request the applicable cancellation path, valuation requirements, seasoning/payment-history conditions, and fees. Property insurance and PMI cover different risks. A borrower's informal value estimate does not compel cancellation.

Additional feedback: The proposed reduction is $1,140 annually, but it removes a different protection and may violate loan requirements, leading to additional costs or other consequences. Current-value cancellation cannot be assumed from the original-value statutory rules. The request should ask the servicer for the applicable path and required evidence, not announce a unilateral cancellation.

### Statute reading exercise: S18 — Three PMI endpoints

Read CFPB's [PMI cancellation and termination explanation](https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/), including borrower-requested cancellation, automatic termination, and final termination. Build a comparison showing each trigger, payment-status condition, and missing information to request from the servicer. Apply it to three hypothetical borrowers: one reaches 80% of original value with extra payments and asks to cancel; another reaches the scheduled 78% date while delinquent; another relies solely on an online estimate of appreciation. Do not assume the same result for FHA mortgage insurance or every loan outside the Act's coverage. Draft a factual servicer inquiry for each case and identify the source's stated exceptions.

Feedback: a request path has conditions; scheduled termination depends on applicable requirements including being current; an informal appreciation estimate is not an unconditional statutory cancellation trigger. Final termination is a distinct provision that also needs its conditions reviewed. The submission should identify which facts are known and which the servicer must verify. A blanket answer that PMI always ends as soon as a website shows 20% equity is not supported.

## T07U4 — Refinancing Existing Conventional Loans

Refinancing replaces an existing obligation with a new one. Compare principal, term, rate, costs, financed fees, mortgage insurance, cash-out, lien position, prepayment terms, and expected ownership horizon. A lower payment can result from extending the term rather than lower lifetime cost. Replacing 20 remaining years with a new 30-year term changes the repayment schedule even when the rate falls.

A simple break-even calculation divides incremental nonrecoverable closing costs by monthly savings, but it omits time value, balance differences, tax effects, and some exit costs. Prepaid taxes and escrow deposits are not necessarily permanent transaction costs in the same sense as origination fees; an old escrow refund can arrive separately. Compare the actual cash-flow timing rather than counting both deposits as a permanent double expense.

A horizon comparison is often more informative than “total interest over the full term.” Choose a plausible holding period and compare cash paid, balance remaining, and nonrecoverable transaction costs at that date. Keep taxes and other ownership costs separate unless they actually differ between alternatives. If costs are financed, they increase the starting debt and can accrue interest. If costs are paid in cash, the borrower loses access to that cash immediately. Do not count financed costs both as an extra cash payment and as part of the new balance. Use a reconciled ledger so that every dollar appears in the right place once.

Payment relief can still be a legitimate borrower objective even when lifetime interest rises. A household responding to reduced income may value a lower required payment. That does not justify describing a term extension as costless savings. Present the tradeoff plainly: required cash flow improves, repayment takes longer, and the later balance may be higher. Ask about alternatives such as retaining the existing loan, a different term, a smaller refinance amount, or an available servicing option, while leaving eligibility and personalized advice to the appropriate professional. Honest comparison helps a borrower make an informed choice without treating one metric as universal.

### Applied exercise: A38 — Break-even limits

Assume $4,800 incremental nonrecoverable costs and $160 monthly payment savings, with equal loan term and no balance differences for the simplified comparison. Calculate break-even and savings net of costs after 24 and 48 months. Explain why the conclusion changes if the new term is longer.

Feedback: 30 months; after 24 months the borrower is $960 short of recovering costs; after 48 months net savings are $2,880. A term extension changes principal repayment and total interest, so this simple method becomes incomplete.

### Applied exercise: A77 — Refinance payment relief versus remaining debt

The original hypothetical existing loan has $180,000 principal, 6.5% fixed interest, and 120 payments remaining. The proposed refinance is $184,000 at 5.75% for 240 payments; it finances $4,000 in nonrecoverable costs and delivers no cash to the borrower. Assume no other charges, no tax effects, no prepayments, and regular monthly amortization. Calculate both required P&I payments and both balances after 60 payments. Compute the five-year payment difference using rounded monthly payments, then compare it with the difference in remaining balances. Explain why dividing $4,000 by the payment reduction would be an incomplete claim of economic break-even here.

Feedback: existing P&I is approximately $2,043.86; new P&I $1,291.83; payment relief $752.03 monthly. The five-year displayed payment reduction is $45,121.80. Using unrounded formula payments, remaining balances are approximately $104,459.17 and $155,565.75, so the new loan leaves $51,106.58 more debt. On this simplified payments-plus-balance comparison, the refinance's lower five-year payments are outweighed by its higher remaining balance by about $5,984.78. This is not a discounted-cash-flow or tax analysis, but it demonstrates why term and balance changes matter. A borrower can value cash-flow relief while understanding its cost.

## T07U5 — Subprime & Predatory Lending

Subprime describes higher-risk credit characteristics in market usage; it is not automatically synonymous with unlawful lending. Predatory practices can include deception, unaffordable structures, abusive charges, steering, equity stripping, or repeated refinancing without a sound borrower benefit. A high-cost mortgage under HOEPA and a higher-priced mortgage under Regulation Z are defined legal categories with distinct thresholds and requirements. Do not use those legal labels interchangeably.

Warning signs include pressure to sign blank documents, conceal debts, misstate occupancy, accept unexplained fees, or rely solely on expected appreciation. Ability-to-repay rules, high-cost protections, loan-originator compensation rules, fair-lending requirements, and state law can apply together. The right response is to identify the conduct and governing rule, not assume that an applicant with imperfect credit deserves fewer protections.

A sound red-flag review records conduct, evidence, and a response. “The rate is high” is not enough to identify the applicable legal category. Determine the relevant comparison rate, date, lien position, loan amount, included points and fees, prepayment features, and exclusions under the current rule. Dollar thresholds can change with annual adjustments. The real estate agent should not make a compliance certification from a rounded advertisement. Equally, a loan that falls below a particular threshold is not thereby exempt from every prohibition on fraud, discrimination, steering, or inaccurate disclosure.

### Applied exercise: A39 — Cost and conduct

A lender proposes rolling $14,000 in new fees into a refinance six months after the previous refinance, with only $40 monthly savings and no documented borrower objective. Identify the needed benefit analysis and three conduct questions. Compute the simple fee/savings ratio without treating it as the only legal test.

Feedback: $14,000 ÷ $40 = 350 months. Ask about balance growth, term extension, prepayment costs, alternatives, accurate disclosure, and repayment capacity. The calculation highlights concern but does not itself determine every legal violation.

### Statute reading exercise: S19 — High-cost is not higher-priced

Read the coverage sections of [Regulation Z §1026.32(a)–(b)](https://www.consumerfinance.gov/rules-policy/regulations/1026/32/) and [§1026.35(a)](https://www.consumerfinance.gov/rules-policy/regulations/1026/35/), then identify the separate protections addressed in §1026.32(d) and §1026.35(b)–(c). Produce a comparison of the legal categories, the kinds of facts used for coverage, and examples of required protections or limitations. Do not quote an unverified annual dollar threshold as permanent. For a hypothetical advertisement stating only “8.2% mortgage rate, low fees,” list what is missing before either category can be determined. Finish by explaining why neither category is simply a synonym for a borrower with a low credit score.

Feedback: the categories have distinct definitions and rules; a note-rate advertisement does not provide all necessary APR, comparable-transaction, timing, points-and-fees, lien, amount, and product information. The review should identify escrow/appraisal subjects for the higher-priced rule and the different high-cost restrictions without asserting that every subsection applies to every loan. An answer that applies one threshold to both categories or ignores exclusions needs revision with the current text.

## T07U6 — Participation Agreements

Loan participation divides economic interests in a credit relationship among lenders or investors under an agreement. A lead lender may originate and administer the loan while participants share specified principal, interest, and risk. A participation is not automatically the same as making the borrower sign multiple separate notes. A participating mortgage can also refer to a lender receiving an agreed share of property income or appreciation; always determine which usage the documents adopt.

Read funding percentages, servicing authority, voting rights, default remedies, loss allocation, transfer restrictions, and reporting. A participant's return depends on the agreed waterfall and borrower performance. Shared lending does not itself guarantee repayment or eliminate conflicts between lenders with different objectives.

Voting rights can matter as much as pro rata percentages. A participant with a small economic share may have consent rights over a maturity extension, collateral release, or settlement. A lead lender may have authority for routine servicing but not for a major modification. When a property is distressed, participants may disagree because their internal objectives or capital constraints differ. A clear agreement anticipates reporting, decisions, conflicts, and enforcement. The borrower should know which party is authorized to receive notices and grant consents; the existence of several investors does not authorize the borrower to choose the most favorable informal answer.

### Applied exercise: A40 — Participation allocation

Two institutions participate 60% and 40% in a hypothetical loan. A distributable interest payment is $8,000 and a realized loss is $50,000; assume both are allocated pro rata without priority adjustments. Calculate each institution's amounts and name two provisions that could alter the result in a real agreement.

Feedback: interest is $4,800/$3,200; losses are $30,000/$20,000. Fees, seniority, loss waterfalls, reserves, or special servicing provisions can change allocation.

## T07U7 — Tax Impacts in Mortgage Lending

Borrowed principal generally is not income merely because cash is received, since a repayment obligation exists. Interest paid is not automatically deductible. Federal home-mortgage-interest treatment depends on qualified debt, use of proceeds, secured property, taxpayer circumstances, itemization, and applicable statutory limits. Refinancing and cash-out can change the analysis. A loan secured by a house but used for unrelated personal spending does not automatically produce deductible home-acquisition interest.

Points may receive different treatment from ordinary periodic interest, and refinancing points may need allocation over time. Investment and business property raise different interest, basis, depreciation, and expense questions. The latest IRS publication available may cover an earlier tax year; it should not be described as a completed 2026 return instruction if it is labeled 2025. Obtain current tax-year advice before predicting a consumer's deduction.

Trace uses of refinance proceeds with a sources-and-uses schedule. Paying off existing acquisition debt, funding a qualifying improvement, purchasing business equipment, and taking a personal vacation are distinct uses even when secured by the same residence. The tax professional may need closing statements, prior balances, invoices, dates, property use, and the applicable year's rules. An agent can help organize those records without promising a deduction. An advertised “after-tax rate” embeds assumptions about a taxpayer's bracket, deduction eligibility, and timing; it should not be presented as the borrower's actual cost without qualified analysis.

### Applied exercise: A41 — Tax evidence request

A homeowner borrows $40,000 secured by a home and uses $25,000 for a kitchen improvement and $15,000 for a vacation. Identify records the tax professional needs and explain why the real estate agent should not promise that all interest is deductible.

Separate the $40,000 loan into a proceeds-use ledger, linking invoices and disbursements to the improvement and vacation. Then suppose the borrower deposits all proceeds in a mixed account before paying vendors; identify the additional tracing records needed. Prepare a tax-professional question distinguishing deductible-use analysis, qualification of the improvement, limits on indebtedness, and the applicable tax year. Do not calculate a deduction using an assumed marginal bracket.

Feedback: tracing proceeds, debt documents, property use, acquisition/improvement facts, other debt, and tax-year requirements matter. Security alone does not establish deductible use.

Additional feedback: A complete packet connects funds to actual expenditures rather than treating collateral as proof of purpose. Mixed-account activity requires records of transfers, balances, and payments. The $25,000/$15,000 split describes supplied uses, not an automatically allowed deduction; the tax professional must apply the relevant-year rules and facts.

## T07U8 — Review of Fixed/Adjustable Rate Note

Read an ARM note in this order: initial rate, initial payment, first change date, adjustment frequency, index source and lookback, margin, rounding, rate floors/caps, payment recalculation, maturity, and prepayment/default provisions. Then compare riders and disclosures. A 5/1 label commonly signals an initial five-year period with annual adjustments afterward, but the signed terms control; labels can vary.

For a fixed note, verify that no rider or balloon clause changes the expected repayment. Fixed principal and interest do not mean fixed total housing expense. For an ARM, calculate both the fully indexed rate and the capped rate; then compute payment using the remaining balance and term. Do not apply an annual rate directly as a monthly rate.

An ARM reset worksheet should preserve the order of operations. Identify the correct observation date and index value, add the contractual margin, apply required rounding and floors, then apply the relevant adjustment and lifetime limits in accordance with the note. Determine the remaining principal and number of installments for payment recalculation. A payment cap may require a different analysis from a rate cap. Do not use the original principal and full original term after years of payments unless the contract specifically calls for that structure. A numerical rate ceiling does not by itself tell a household the highest possible total housing bill, because other ownership charges can change.

### Applied exercise: A42 — Note inconsistency

A summary says “fixed payment for 30 years,” but the note has a five-year maturity and a 30-year amortization schedule. Explain the difference, identify the missing balloon estimate, and state what must be corrected before signing.

Suppose the lender supplies a $282,000 balloon estimate and the borrower expects refinancing at 75% of a future value. Compute the minimum value needed to support that principal alone, then test a $350,000 value and calculate the additional cash required before costs. Draft an issue list distinguishing the accurate maturity disclosure, the repayment plan, and an uncommitted future lender.

Feedback: amortization schedule and maturity differ. The balance remaining after five years becomes due under the balloon provision. Correct the summary and obtain the actual balloon calculation and repayment plan; do not assume refinancing will be available.

Additional feedback: A $282,000 balance requires $376,000 of value at 75% LTV. At $350,000, the supported loan is $262,500, leaving $19,500 before costs. Even sufficient value does not guarantee credit availability, income qualification, or rate terms. Correct documents are necessary but do not remove refinancing risk.

### Applied exercise: A78 — ARM reset and household budget

At an adjustment date, an original hypothetical ARM has $230,000 principal and 300 monthly installments remaining. Its prior rate is 5.5%. The specified index is now 5%, margin 3%, periodic increase cap 2 percentage points, and lifetime ceiling 10%. Assume no rounding or floor issue and no payment cap. Calculate the fully indexed rate and permitted new rate. Recalculate P&I at both the old and new rates using the same current balance and remaining term. Add $450 monthly taxes, $190 property insurance, $85 association dues, and $95 mortgage insurance to each. Household take-home income is $5,900 and other essential spending is $3,200. Calculate the remaining budget cushion before and after reset.

Feedback: fully indexed rate is 8%; the increase cap limits the new rate to 7.5%. P&I is approximately $1,412.40 at 5.5% and $1,699.68 at 7.5%. Other stated housing charges total $820, producing housing expenses of $2,232.40 and $2,519.68. Budget cushion falls from $467.60 to $180.32. The $287.28 increase is a payment change under the supplied assumptions, not a future market forecast. The household should also consider repairs, reserve needs, and further permitted changes; the agent should not promise a refinance before the next reset.

## T07U9 — Mortgage Fraud (ie: red flags)

Fraud can involve false income, assets, debts, employment, occupancy, valuation, identity, or transaction terms. A red flag calls for investigation; it is not proof that a person committed a crime. Examples include unexplained deposits, conflicting employer information, altered statements, undisclosed side agreements, an owner-occupancy declaration inconsistent with known plans, and pressure to omit a debt.

Preserve accurate records, use authorized verification channels, and report concerns through the lender/broker's compliance process. Do not coach a consumer to make facts appear eligible. Do not circulate sensitive financial documents broadly to investigate informally. A legitimate explanation should be documented and evaluated, not assumed or invented. Incentives to complete a sale never authorize false information in a loan file.

A red flag should lead to proportionate verification, not a public accusation. An unusual deposit could be a documented asset sale, a gift, a transfer between owned accounts, or undisclosed borrowing. Each has different underwriting treatment. Request the source through the lender's authorized process and keep the explanation tied to evidence. Do not ask a buyer to move funds through another account merely to make a statement appear ordinary. If a document seems altered, preserve the version received and escalate securely; editing it to “fix” an apparent inconsistency can destroy evidence and create a new misrepresentation.

### Applied exercise: A43 — Occupancy conflict

A buyer says the property will immediately be rented but signs an owner-occupancy application to obtain different terms. Draft the correction message and identify the next decision maker. Explain why changing the mailing address does not cure the underlying representation.

Prepare a correction trail with the initial representation, the newly confirmed intended use, the document needing correction, and the lender decision still pending. The buyer offers to sign a short lease after closing and says this makes the earlier statement accurate. Explain why later paperwork does not change the intent represented at application. Identify a permissible next action if the current product does not allow the actual intended use.

Feedback: communicate the actual intended use to the lender and correct the application; the lender must evaluate an appropriate eligible product. Cosmetic edits do not change occupancy intent.

Additional feedback: Disclose the true facts and obtain review of an eligible product or other lawful transaction decision. Do not create a side document solely to disguise occupancy. Preserve necessary records securely, share them only with authorized people, and distinguish the lender's underwriting role from the agent's responsibility for truthful communication.

## T07U10 — PITI Workshop - Conventional

PITI means principal, interest, taxes, and insurance. A complete qualifying housing expense can also include mortgage insurance, association dues, assessments, and other required charges. An escrow collection estimates certain future bills; it does not freeze them. A lender's ratio calculation and the household's living budget are related but different analyses.

For a hypothetical $280,000 fixed loan at 6.5% over 360 months, principal and interest are approximately $1,769.79. Add $6,000 annual taxes ($500 monthly), $2,400 annual homeowners insurance ($200), $110 monthly PMI, and $75 association dues. PITI is $2,469.79; the broader stated housing expense is $2,654.79. With $8,200 gross monthly income and $650 other monthly debt, housing ratio is about 32.38% and total DTI about 40.30%. These ratios describe the example and do not establish a universal approval threshold.

An escrow review should separate the estimated annual bill, monthly collection, and any shortage repayment. If annual taxes increase by $1,200, the recurring monthly allowance for that increase is $100. If an additional previously accumulated shortage is repaid over an allowed schedule, that can create another temporary amount. The actual servicer analysis and applicable law govern collections. A borrower may experience a payment increase larger than the annual-bill increase divided by twelve because a shortage and a new forward estimate are addressed together. Obtain the statement rather than guessing that the fixed mortgage rate changed.

Insurance also needs precise language. Homeowners coverage, flood coverage where applicable, mortgage insurance, and a service contract do not insure the same risk. A lower premium can reflect a higher deductible or different coverage, which affects a household's emergency exposure. A loan estimate's insurance amount may be an estimate awaiting the buyer's actual policy. Do not compare full housing expense using one lender's optimistic placeholder and another lender's confirmed premium as if the difference were a credit-pricing benefit. Put both offers on the same supported assumption when doing an educational comparison.

Build a reserve target as a household planning question, not a universal lender rule. Suppose a household has $4,800 in essential monthly spending including housing and $14,400 of liquid savings after closing. That equals three months of those stated expenses, before an unexpected repair. A $6,000 repair reduces the reserve to $8,400, or 1.75 months. This arithmetic helps explain resilience without claiming that three months is required or sufficient for every loan or family. Stability of income, insurance deductibles, property condition, dependents, and access to other lawful resources can change the household's needs.

Finally, distinguish gross-income ratios from take-home budgeting. A lender's DTI can exclude food, utilities, childcare, healthcare, and savings because they are not debts under that ratio's definition. Those costs do not disappear from the household's finances. A borrower with the same DTI as another can have very different discretionary cash because taxes, dependents, transportation, or medical expenses differ. Present the qualifying ratio accurately and encourage a separate realistic budget. Do not tell the borrower to omit an obligation from the application just because it is already included in a personal spreadsheet, or to treat lender approval as a guarantee of financial comfort.

### Applied exercise: A44 — Payment stress test

Recalculate the workshop if taxes rise $1,200 annually, insurance rises $600 annually, and a previously omitted $220 monthly student-loan payment must be included under the hypothetical lender's stated policy. Calculate new housing expense and total DTI. Prepare a household-budget note identifying expenses still excluded from DTI.

Feedback: housing rises $150 to $2,804.79; other debt becomes $870; total DTI is $3,674.79 ÷ $8,200 ≈44.81%. Maintenance, utilities, food, transportation, healthcare, savings, and emergencies still affect actual affordability. A ratio below some lender ceiling does not guarantee a comfortable budget.

### Module recap

Compare note rate, APR, payment, maturity, insurance, and total borrowing cost. Complete the T07 quiz.

Sources: [CFPB PMI cancellation](https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/); [Regulation Z §1026.32](https://www.consumerfinance.gov/rules-policy/regulations/1026/32/), [§1026.35](https://www.consumerfinance.gov/rules-policy/regulations/1026/35/), [§1026.43](https://www.consumerfinance.gov/rules-policy/regulations/1026/43/); [IRS Publication 936](https://www.irs.gov/publications/p936). All numerical examples are original and hypothetical.
