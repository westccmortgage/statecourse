# PE02 Mortgage Mathematics and Security Instruments

StateCourse | Public foundations practice | Draft adaptation September 30 2026

**Under construction · Free noncredit practice · No account or payment required**

This is one of two foundation modules adapted from a planned national 20-hour SAFE prelicensure education (PE) course. Only PE01 and PE02 are included here. This is not the full 20-hour course, is not NMLS approved, provides no credit, and awards no education hours, regulatory credit, certificate, license or SAFE test result. The full course remains in development and subject to review and approval.

The lessons, worked examples, topic quizzes and practice activities are free before, during and after paid enrollment. Paid enrollment is not required to use this practice. Practice results are formative feedback only; they do not establish scheduled-course participation or completion. This self-guided version does not provide instructor responses or peer participation. Optional reflections use a self-review checklist rather than a claim of instructor assessment. No protected final examination or private instructor guide is included.

Use only fictional facts in the exercises. Do not enter a real borrower's records, personal identifiers or confidential information. This is educational material, not legal advice, an individual licensing determination or a personal loan recommendation. Case people, firms, rates and policies are fictional unless an official source is expressly identified.

This module teaches how to calculate a mortgage figure, label its assumptions, and explain what it does and does not establish. Separate a repayment promise from property security, work with payment and equity calculations, and recognize when a lien or remedy question needs state-specific review.

## Learning objectives and working method

- Calculate principal, interest, payment allocation, points and a simple cost comparison with stated assumptions and a reasonableness check
- Calculate LTV and CLTV for a stated purchase and distinguish the note rate from APR
- Distinguish a note from a mortgage or deed of trust, explain priority, subordination and release, and identify state-dependent remedies

Have a basic calculator or one with a power function. You may use a payment calculator if you record its inputs. Dollar amounts in schedules are rounded to cents. Report practice ratios as percentages to two decimal places unless exact whole percentages result. This reporting convention is for arithmetic teaching; a program's underwriting or delivery rounding rule may differ. In particular, the cited Fannie Mae LTV guide prescribes its own truncation and rounding method for program delivery. Do not use these practice results as a delivery calculation. [S5]

Keep the inputs, intermediate values, result and limitation together. Read a worked example, attempt the new case, and then use its self-check or interactive feedback. These explanations are formative self-review, not professional approval of a real disclosure, payoff or closing record.

## Unit 2A Make the units agree

### Principal rate and time

Principal is the amount borrowed or the unpaid principal balance at a specified time. These are not always the same number. Interest is a charge for the use of credit. The note rate is normally stated annually even when payments are monthly. The term tells you the scheduled period for repayment. A 30 year monthly repayment schedule has 360 monthly periods.

Convert a percentage to a decimal before multiplying: 6 percent is 0.06, not 6. For a simple interest exercise, interest equals principal multiplied by annual rate multiplied by time in years. The units explain the formula. A half year is 0.5 years; one month under the monthly convention is 1 divided by 12 of a year. If you multiply by 12 instead of dividing by 12, you have enlarged rather than shortened the time.

Worked example: A $240,000 balance at 6 percent for one full month, using annual rate divided by 12, produces $240,000 × 0.06 ÷ 12 = $1,200 interest. An annual calculation is $14,400. The monthly result being one twelfth of the annual result is a reasonableness check. Neither calculation is a complete monthly payment until the repayment structure is supplied.

### A day count is an input

Closing and payoff calculations may use daily interest and particular counting conventions. Read the actual convention rather than assuming one. For this exercise only, the balance is $240,000, the annual rate is 6 percent, the basis is actual days divided by 365, and exactly 15 interest days are stipulated.

Interest = $240,000 × 0.06 × 15 ÷ 365 = $591.78, rounded only at the end. The unrounded daily amount is about $39.45205479. If you round it to $39.45 before multiplying, you obtain $591.75. This three cent difference demonstrates why a rounding policy must be stated. It does not establish which convention a particular creditor uses.

Do not infer a first payment date from this arithmetic. The note and closing documents identify the schedule, and a payoff statement addresses a specified payoff date. A statement's unpaid principal balance may omit accrued interest or other permitted amounts included in a payoff. Obtain and verify the relevant payoff rather than making a balance guess. [S1]

### From an interest amount to an amortizing payment

Amortization means reducing a debt through payments over time. In this module's fixed rate, fully amortizing example, each scheduled payment covers that period's interest and reduces principal. A constant principal and interest payment does not mean a constant split between them. As the balance falls, the interest component generally falls and more of the payment reduces principal. [S2]

For equal monthly payments with the first payment one full month later, use the following formula:

Monthly P and I payment = P × r ÷ [1 − (1 + r) raised to the power −n]

P is initial principal. r is the annual note rate as a decimal divided by 12. n is the number of monthly payments. This formula is for the stated level payment structure. It is not a formula for every ARM, irregular period, interest only period or balloon loan. If the rate is zero, use P divided by n instead of dividing by a zero term in this formula.

Worked example: P = $240,000; annual rate = 0.06; r = 0.005; n = 360. The unrounded payment is approximately $1,438.921260. The exercise's scheduled payment is $1,438.92. On a financial calculator, check that periods are monthly, the annual and periodic rate inputs are not confused, future balance is zero and payments are at the end of each period. Some calculators show cash received and payments with opposite signs; that is a cash flow convention rather than a negative payment obligation.

### Build the first two rows yourself

Use three operations in order. First calculate interest on the opening balance. Second subtract that interest from the scheduled P and I payment to find the principal portion. Third subtract the principal portion from the opening balance. For the following schedule, use a $1,438.92 payment and round interest to cents each month.

| Payment | Opening principal | Interest | Principal paid | Ending principal |
| --- | ---: | ---: | ---: | ---: |
| 1 | $240,000.00 | $1,200.00 | $238.92 | $239,761.08 |
| 2 | $239,761.08 | $1,198.81 | $240.11 | $239,520.97 |

The second month's interest is $239,761.08 × 0.005 = $1,198.8054, rounded to $1,198.81. Its principal amount is $1,438.92 − $1,198.81 = $240.11. Using the original balance for month two would incorrectly keep the interest at $1,200.

The schedule passes three checks: interest plus principal equals the payment; the ending balance equals the opening balance less principal; and the principal portion rises slightly as interest declines. A small rounding adjustment near maturity may be needed in a real schedule. Do not multiply a rounded payment by 360 and call the result an exact contractual payoff history.

P and I means principal and interest only. Taxes, property insurance, mortgage insurance where applicable, association dues and other housing expenses are outside this number. A fixed P and I amount does not freeze taxes or insurance. If an escrow payment changes, the total payment can change even though the fixed note rate does not. [S3]

### Practice FP-PE02-M1 Use new numbers

Calculate the monthly P and I payment for a $180,000 loan at 6 percent with 360 end of month payments. Use the same assumptions and rounding policy as the worked example. Fill the first two amortization rows. Record P, r, n, payment, opening balance, interest, principal and ending balance. Verify both row sums and explain any cent difference before checking the worked feedback.

Then calculate 12 days of interest on $180,000 at 6 percent using the expressly stipulated actual over 365 convention. Keep precision until the final result. This question is independent of the monthly payment schedule.

### Points are percentages of the loan amount

One point is one percent of the loan amount. A fee of 0.75 points is 0.0075 times the principal, so 0.75 points on $320,000 equals $2,400. It is not 75 percent of the amount, and it is not calculated from the purchase price. A charge described in points should still be identified by its actual purpose.

Discount points can exchange an upfront cost for a lower interest rate. There is no fixed law that one point always buys a quarter percentage point rate reduction. The actual offers determine the exchange. A lender credit may reduce upfront cost in exchange for a higher rate, but its terms must also be examined. [S4]

### Worked comparison with limits

Two fictional offers have the same $200,000 principal, 30 year term and fixed rate structure. All costs other than the stated discount point are assumed equal. Offer A has a 6 percent note rate, no discount point and $1,199.10 monthly P and I. Offer B has a 5.75 percent note rate, one point paid in cash at closing and $1,167.15 monthly P and I.

The point costs $2,000. The difference between the displayed payments is $31.95 per month. A simple payment savings break even is $2,000 ÷ $31.95 = about 62.60 months. Cumulative scheduled payment savings first exceed that cost at payment 63. At 36 payments the savings are $1,150.20; at 72 they are $2,300.40. Those figures help describe the tradeoff without choosing for the borrower.

This is a limited cash payment comparison. It ignores different principal balances upon payoff, the time value of money, taxes and any other fee differences. It assumes the loan remains outstanding and scheduled payments occur. It is not proof that Offer B is best after month 63 in every economic sense. Financed points, an early payoff or a different term would require a new comparison. All rates here are invented teaching inputs.

### Practice FP-PE02-M2 Repair a cost comparison

A worksheet compares two otherwise identical fictional offers and states an extra upfront charge of $1,500 and monthly P and I savings of $25. It says the simple break even is 6 months. Enter the corrected number of months and one excluded factor that would matter to a fuller comparison. Separately calculate 1.25 points on a $240,000 loan. Do not add these separate exercises together.

### Optional reflection FP-PE02-D4 Show the assumption

Optional self-review: Write one row from your new amortization schedule and one sentence explaining which balance earns that month's interest. Recalculate it independently, or compare two calculator outputs using the same inputs.

Self-review checklist: Use the opening balance for that month, the monthly rate 0.005, a scheduled payment rounded to cents, and interest rounded to cents each month. Check that interest plus principal equals the payment and that opening balance minus principal equals ending balance. If outputs differ, compare the intermediate value and rounding policy rather than assuming either tool is correct.

### Checks FP-PE02-K6 and FP-PE02-K7

FP-PE02-K6. A $150,000 opening balance carries a 6 percent annual note rate under the monthly convention. The stipulated P and I payment is $1,000. Enter the month's interest, principal paid and ending principal. This is a one month allocation question, not a request to calculate a loan term.

FP-PE02-K7. Two identical structure offers differ only by $2,400 upfront and $40 monthly P and I savings. Which statement is supportable? A The rate reduction must be one percentage point; B simple payment savings equal the upfront difference after 60 payments; C the lower payment offer is best for every borrower; D the simple comparison includes all tax effects.

## Unit 2B Choose the denominator before dividing

### LTV and CLTV answer different questions

Loan to value, or LTV, compares a specified loan amount with the value basis required for the transaction. Combined loan to value, or CLTV, compares the relevant combined secured debt with that value basis. A ratio is not an approval and does not establish repayment capacity.

For the following purchase examples, use the lower of purchase price or appraised value. This is an expressly supplied exercise assumption and is consistent with the ordinary purchase calculation in the cited Fannie Mae provisions. Product exceptions, refinances, property valuation methods and other programs need their own rules. Do not transform this exercise into a universal law that every loan uses the same denominator. [S5, S6]

### Worked purchase example

The purchase price is $300,000, the appraised value is $290,000, the first mortgage is $232,000 and a separate closed end second mortgage of $14,500 is fully advanced. There are no other secured debts in the exercise. The agreed value denominator is $290,000.

| Calculation | Substitution | Result |
| --- | --- | ---: |
| First loan LTV | $232,000 ÷ $290,000 | 80 percent |
| Combined debt | $232,000 + $14,500 | $246,500 |
| CLTV | $246,500 ÷ $290,000 | 85 percent |
| Price contribution before other costs | $300,000 − $246,500 | $53,500 |
| Appraised value less debt | $290,000 − $246,500 | $43,500 |

The last two amounts differ because the purchase price exceeds the value basis by $10,000. The buyer still must account for the actual price. Fifteen percent of the appraised value is not automatically the amount needed to complete the purchase. The second loan is borrowed money; do not describe it as the buyer's unborrowed funds.

The $53,500 figure is only a simplified contribution toward the price. It excludes closing costs, prepaids, deposits already paid, credits and prorations. It is not final cash to close. A deposit already paid, if properly credited, reduces remaining funds to bring rather than being paid a second time. Later modules develop a complete transaction ledger.

### A home equity line needs another question

A HELOC has both a credit limit and a drawn balance, and those figures can differ. In Fannie Mae's cited CLTV calculation the drawn portion is included, while the related HCLTV calculation uses the full HELOC amount as specified in that guide. Do not memorize “always use the entire line for CLTV.” Identify the ratio requested and the governing program first. These are investor definitions, not universal federal definitions for every purpose. [S6, S7]

For a simple contrast, suppose a worksheet shows a $20,000 line limit and $5,000 drawn. Before doing any ratio, ask whether the requested metric uses the drawn amount or the full line and whether another ratio must also be evaluated. You cannot resolve that from the abbreviation “equity” alone. Paying a line down to zero also does not necessarily close the account or release its lien.

### Practice FP-PE02-M3 A new purchase and a false approval

Use the same stated lower of price or appraisal convention. Purchase price is $250,000; appraised value is $240,000; first mortgage is $180,000; fully advanced closed end second mortgage is $12,000. No other liens are included.

Enter the denominator, first loan LTV, combined debt, CLTV and simplified contribution toward the price. Then select the best response to “The CLTV calculation is correct, therefore the second loan and the borrower are approved”: A agree; B correct arithmetic does not establish program acceptability, repayment analysis or approval; C the second loan is automatically a grant; D approval belongs to the calculator.

### Rate and APR are related but not interchangeable

The note rate drives the interest in this module's payment formula. Annual percentage rate, or APR, expresses credit cost as an annual rate using the amount and timing of funds and payments. Regulation Z specifies the APR calculation; Appendix J describes the actuarial method. You cannot obtain a compliant APR by adding one point to a 6 percent note rate. The point is a one time percentage charge; the note rate is an annual rate applied over time. [S8, S9]

Applicable finance charges affect APR, but not every closing cost is a finance charge. Regulation Z includes rules and exclusions that must be applied to the actual charge and transaction. A hand worksheet that ignores fees, payment dates or applicable assumptions is not an APR disclosure. This module teaches the distinction; it does not qualify a learner to approve disclosure calculations. [S10]

APR can help compare borrowing costs, but a comparison still needs similar products and an understanding of assumptions. An adjustable rate loan's APR is not a promise of its future rate. A lower APR does not decide a consumer's budget, expected holding period or preferences. Compare the disclosed terms and costs on a common basis and use the approved calculation and review process. [S11]

### Optional reflection FP-PE02-D5 Challenge the denominator

Optional reflection: Write your purchase-case denominator and explain why the contribution toward the price differs from appraised value less debt. Name one cost or credit omitted from the simplified result.

Self-review checklist: The exercise uses $240,000 because it is the lower of $250,000 price and $240,000 appraisal. Both loans are debt. The price contribution is $58,000, while appraised value less debt is $48,000; their $10,000 difference is the price-appraisal gap. Closing costs, prepaids, credited deposits and other adjustments still affect final cash to close. A correct ratio does not approve the borrower or second financing.

### Checks FP-PE02-K8 and FP-PE02-K9

FP-PE02-K8. With a stipulated $200,000 value basis, a $150,000 first mortgage and a fully advanced $10,000 closed end second, enter LTV and CLTV. No HELOC exists in this question.

FP-PE02-K9. A colleague says, “Six percent note rate plus one point means a seven percent APR.” Select the best response: A correct for all 30 year loans; B correct only if the borrower agrees; C APR requires the applicable cash flow and finance charge calculation, so addition is not the method; D APR is the property's appreciation rate.

## Unit 2C Read the promise and the property security

### Three documents with different jobs

The promissory note records the borrower's promise to repay and its terms. A mortgage or deed of trust is a security instrument associated with the obligation and property. The deed conveying ownership in a purchase is another document. Calling all three “the mortgage papers” can hide which document answers the question. [S12]

In an ordinary note, look for the borrower, lender, principal, rate, payments, maturity, default provisions and any prepayment terms. In a security instrument, look for the property description, secured obligation, parties, covenants and enforcement provisions. Do not rely only on the street address; the operative property description and recorded documents matter.

The borrower who signs the note is generally the maker of the repayment promise. A mortgagor gives mortgage security; the mortgagee receives it. A deed of trust commonly names a trustor granting security, a beneficiary for whose benefit it is given, and a trustee with duties defined by the instrument and law. Do not infer possession, title theory or foreclosure procedure solely from these names. State law determines important legal effects.

An owner might sign a security instrument without being personally obligated on a note. The actual documents and law must be examined. Conversely, an ownership transfer does not automatically release an earlier borrower from the debt. The examples in this module explain separate functions, not every possible enforceability rule.

### Worked document map

In fictional Exhibit A, Alex signs a note promising to repay Harborline $240,000 at 6 percent, with monthly P and I of $1,438.92 under a 30 year schedule. A separate mortgage identifies the secured property and states covenants to maintain insurance and pay property taxes. A conveyance deed transfers the seller's ownership interest to Alex.

Which document would you read first to check the monthly P and I promise? The note. Which identifies the property security and the stated property covenants? The mortgage. Which records the purchase's ownership transfer? The conveyance deed. None of those answers authorizes you to decide whether a disputed clause is enforceable.

In fictional Exhibit B, the security form is called a deed of trust and names Alex as trustor, Harborline as beneficiary and Pine Trustee Services as trustee. The note still records the repayment promise. The additional trustee role does not make Pine the borrower, loan owner or monthly payment servicer. The trustee's authority and duties must be read under the applicable instrument and jurisdiction.

### Clauses identify a question before they answer it

An acceleration clause may permit the remaining debt to become due after a specified default, subject to required procedures and law. A due on sale clause addresses specified transfers; legal exceptions and protections must be checked. A late charge provision, prepayment term or insurance covenant must be read in context. A clause's presence is not permission to ignore consumer protection law. [S13]

Do not tell a borrower “the lender can always take the property tomorrow” or “being current on principal and interest eliminates every default issue.” The record may contain other covenants, and enforcement requires the actual facts and governing law. The originator can identify a document provision and obtain the appropriate explanation without predicting a court's result.

### Priority is a legal relationship

A lien is a legal claim against property associated with an obligation. Priority addresses the order of competing interests, especially when available proceeds are insufficient. The first and second labels describe position, not whether a loan is fixed rate, adjustable or government backed. Recording provides public notice under applicable law, but recording order alone is not a complete national priority rule.

For introductory reasoning, start with the sequence of recorded interests, then ask what could alter it. Relevant state law can give particular taxes or assessments special treatment. FHFA's discussion of special assessment and homeowners association liens illustrates why priority needs a jurisdiction specific check; it does not supply a nationwide priority rule. A subordination agreement can also change the relative position of consenting interests. Recording statutes, notice, the actual instruments and transaction facts require jurisdiction specific analysis. The correct national lesson is to identify and resolve the issue, not promise that the earliest date always wins. [S16]

Worked distribution illustration: Assume a legal reviewer has already established that Creditor A is senior, Creditor B is junior, no other claims apply, and $210,000 is available after all stipulated costs. A is owed $190,000; B is owed $40,000. The simplified distribution sends $190,000 to A and $20,000 to B. It shows why rank matters. It does not determine whether B can collect any shortfall personally, whether an interest survives, or whether the assumed sale procedure is lawful. Those questions require the governing law and facts.

### Subordination and release are different events

Subordination changes relative priority. It does not by itself pay off or forgive a loan. A refinance replacing a first mortgage while retaining another lien creates a priority question. The new creditor may require a specified priority, and the retained creditor may need to consent or a relevant state law path may apply. A label such as “old second” does not prove the position after the transaction.

Fannie Mae's subordinate financing guidance illustrates a program requirement to document resubordination for specified retained financing, with a state law alternative when its conditions are met. This is an investor specific rule, not a statement that the same form must always be recorded in every state and program. [S14]

A release, satisfaction or reconveyance addresses the security interest after the relevant obligation is satisfied or as otherwise authorized. Terminology and procedures vary. Payment evidence and a cleared public record are different evidence questions. An old lien appearing in title work needs investigation even if the borrower says the loan was paid. Do not delete it from a worksheet to make the file look clear.

### State specific remedies stay separate

Foreclosure can involve judicial or nonjudicial procedures depending on state law, the instrument and circumstances. Notice, reinstatement, redemption, deficiency exposure and other protections vary. “Mortgage means court” and “deed of trust means no court” are unreliable universal statements. Federal servicing requirements can also apply. The correct next step for a live default question is qualified servicing and legal review, not a national course's simplified distribution example. [S15]

### Practice FP-PE02-I1 Read and route

A new loan will pay off an existing first loan and leave a $12,000 second loan in place. The retained creditor's email says “approved,” but does not say whether it approved subordination, a payoff, continued borrowing or anything else. An old paid loan also remains listed in the title work. The new loan's underwriting conditions are still pending.

Complete four short fields: what the note would establish; the unresolved retained lien question; evidence needed for the old paid lien; and the authorized next step before claiming the file is ready. Do not choose a foreclosure method or state a deficiency rule. Then select the action that the vague email cannot establish by itself: A receipt of an email; B completion of every priority and underwriting requirement; C that someone used the word approved; D that clarification is needed.

### Optional reflection FP-PE02-D6 Explain the limit of the record

Optional reflection: Explain in two or three sentences why correct payoff arithmetic and an email saying “approved” do not finish the retained-lien case. Name the precise question to send to each responsible reviewer.

Self-review checklist: Separate the note obligation, the retained lien's priority, evidence of release for the old paid loan, and the new lender's pending underwriting. Clarify the email's actual scope and obtain the relevant title/legal and creditor decisions. Do not assume subordination forgives debt, a zero balance releases a lien, or a national example establishes a state's foreclosure procedure.

### Checks FP-PE02-K10 and FP-PE02-K11

FP-PE02-K10. Which document primarily records the promise to repay? A Promissory note; B property listing; C ownership conveyance deed alone; D appraisal photograph.

FP-PE02-K11. Which conclusion is supportable from “the second creditor signed a subordination agreement”? A Its debt is necessarily forgiven; B every other closing condition is cleared; C the agreement may change relative lien priority according to its terms and applicable law; D foreclosure must be judicial nationwide.

## Bring the methods forward

Before reporting a number, name the inputs, convention, result and limitation. Before describing a document, name its function and the actual question it answers. Before stating a lien result, identify the legal or title review needed. These habits will support later work on borrower qualification, product comparisons and closing decisions.

Keep your own calculations and revisions if useful. No discussion post, instructor reply or paid enrollment is needed for this practice. This foundations lesson is not a completed loan worksheet, legal form set or full 20-hour course.

## Formative self-checks

- FP-PE02-M1 payment: P = $180,000; r = 0.06 ÷ 12 = 0.005; n = 360. The unrounded level payment is approximately $1,079.190945; use $1,079.19 for the schedule.
- FP-PE02-M1 month 1: Opening $180,000.00; interest $900.00; principal $179.19; ending $179,820.81. Month 2: opening $179,820.81; unrounded interest $899.10405, rounded to $899.10; principal $180.09; ending $179,640.72.
- FP-PE02-M1 daily interest: $180,000 × 0.06 × 12 ÷ 365 = $355.07, rounded only at the end. This independent 12-day exercise does not change the monthly schedule.
- FP-PE02-M2: $1,500 ÷ $25 = 60 months. Examples of excluded factors are different payoff balances, time value of money, taxes and other fees. Separately, 1.25 points × $240,000 = 0.0125 × $240,000 = $3,000.
- FP-PE02-K6: Interest is $150,000 × 0.06 ÷ 12 = $750.00; principal is $1,000 − $750 = $250.00; ending principal is $149,750.00. No loan term was provided or calculated.
- FP-PE02-K7: Choice B. $2,400 ÷ $40 = 60 payments to equal the extra upfront cost. This limited comparison does not identify the best offer for every borrower.
- FP-PE02-M3: Denominator $240,000; first-loan LTV 75%; combined debt $192,000; CLTV 80%; simplified contribution toward the $250,000 price $58,000. Choice B rejects the false approval inference.
- FP-PE02-K8: First-loan LTV is $150,000 ÷ $200,000 = 75%; CLTV is $160,000 ÷ $200,000 = 80%. The second is a fully advanced closed-end loan; no line-of-credit rule is needed.
- FP-PE02-K9: Choice C. APR needs the applicable finance-charge and cash-flow calculation; adding a one-time point percentage to the annual note rate is not that calculation.
- FP-PE02-I1: The note establishes the repayment promise and terms. The retained lien's required priority and any authorized subordination remain unresolved. Investigate the old paid loan through payoff and authorized release/satisfaction/reconveyance evidence with title review. Obtain the scoped creditor/title decisions and remaining underwriting clearance before claiming readiness. Choice B identifies what the vague email cannot establish.
- FP-PE02-K10: Choice A, the promissory note. The conveyance deed transfers ownership, while the mortgage or deed of trust provides property security.
- FP-PE02-K11: Choice C. Subordination may change relative lien priority under its terms and applicable law; it does not necessarily forgive debt, complete underwriting or choose a nationwide foreclosure method.

## Sources and version record

Source manuscript and public adaptation dated September 30 2026. The manuscript records checks of official web versions on that date. LTV, CLTV, HCLTV, APR and subordinate-financing sources were spot-checked again for this public adaptation on the same date. Numerical examples are original hypothetical calculations with expressly stated conventions and recalculated formative answers. Current rules and program requirements control an actual transaction. Source citations do not establish approval of this practice.

- S1 CFPB Regulation Z 12 CFR 1026 36 c 3 Payoff statements [Official source](https://www.consumerfinance.gov/rules-policy/regulations/1026/36/) and CFPB Payoff amount versus current balance [Official source](https://www.consumerfinance.gov/ask-cfpb/what-is-a-payoff-amount-and-is-it-the-same-as-my-current-balance-en-205/)
- S2 CFPB How does paying down a mortgage work reviewed May 28 2024 [Official source](https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/)
- S3 CFPB What is PITI and Why did my monthly mortgage payment change [Official source](https://www.consumerfinance.gov/ask-cfpb/what-is-piti-en-152/) and [Official source](https://www.consumerfinance.gov/ask-cfpb/why-did-my-monthly-mortgage-payment-go-up-or-change-en-213/)
- S4 CFPB How should I use lender credits and points reviewed October 19 2023 [Official source](https://www.consumerfinance.gov/ask-cfpb/how-should-i-use-lender-credits-and-points-also-called-discount-points-en-136/)
- S5 Fannie Mae Selling Guide B2 1 2 01 Loan to Value Ratios current web version [Official source](https://selling-guide.fanniemae.com/sel/b2-1.2-01/loan-value-ltv-ratios)
- S6 Fannie Mae Selling Guide B2 1 2 02 Combined Loan to Value Ratios dated December 4 2018 [Official source](https://selling-guide.fanniemae.com/sel/b2-1.2-02/combined-loan-value-cltv-ratios)
- S7 Fannie Mae Selling Guide B2 1 2 03 Home Equity Combined Loan to Value Ratios current web version [Official source](https://selling-guide.fanniemae.com/sel/b2-1.2-03/home-equity-combined-loan-value-hcltv-ratios)
- S8 CFPB Regulation Z 12 CFR 1026 22 Determination of APR [Official source](https://www.consumerfinance.gov/rules-policy/regulations/1026/22/)
- S9 CFPB Regulation Z Appendix J APR computations [Official source](https://www.consumerfinance.gov/rules-policy/regulations/1026/j/)
- S10 CFPB Regulation Z 12 CFR 1026 4 Finance charge [Official source](https://www.consumerfinance.gov/rules-policy/regulations/1026/4/)
- S11 CFPB Difference between a mortgage interest rate and APR reviewed August 28 2026 [Official source](https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-mortgage-interest-rate-and-an-apr-en-135/)
- S12 CFPB What documents should I receive before closing [Official source](https://www.consumerfinance.gov/ask-cfpb/what-documents-should-i-receive-before-closing-on-a-mortgage-loan-en-181/) and Mortgage closing process [Official source](https://www.consumerfinance.gov/ask-cfpb/im-about-to-close-on-a-real-estate-purchase-transaction-with-a-mortgage-what-can-expect-in-the-mortgage-closing-process-en-1905/)
- S13 CFPB Mortgage Closing Documents guide with illustrative sample forms including a California security instrument excerpt used here only for clause orientation [Official source](https://files.consumerfinance.gov/f/documents/cfpb_buying-a-house_closing-forms_guide.pdf)
- S14 Fannie Mae Selling Guide B2 1 2 04 Subordinate Financing resubordination section [Official source](https://selling-guide.fanniemae.com/sel/b2-1.2-04/subordinate-financing)
- S15 CFPB How does foreclosure work [Official source](https://www.consumerfinance.gov/ask-cfpb/how-does-foreclosure-work-en-287/) and Regulation Z 12 CFR 1026 38 p 3 state law deficiency disclosure [Official source](https://www.consumerfinance.gov/rules-policy/regulations/1026/38/)
- S16 FHFA Statement on Certain Super Priority Liens December 22 2014 used only to illustrate the need for state priority analysis [Official source](https://www.fhfa.gov/news/statement/statement-of-the-federal-housing-finance-agency-on-certain-super-priority-liens)

Adaptation provenance: StateCourse PE02 Mortgage Mathematics and Security Instruments student review manuscript, September 30 2026, and StateCourse National 20 Hour SAFE PE Curriculum Blueprint, September 30 2026. The public version preserves the student instruction, original worked examples and calculation assumptions, replaces scheduled discussion with optional self-review, supplies independently calculated formative feedback, and removes timing and instructor-delivery promises. Upstream concept provenance: StateCourse L02 mathematical concepts, national L03 instrument concepts, and G02 separate-obligation and retained-lien reasoning, reviewed repository snapshot 84c38a6d7cea4644cbf1cab528a75c52375d0aa7. These references identify source lessons, not original CE question IDs. California foreclosure procedures, CE requirements, source duration and approval claims do not transfer. State-specific supplements require separate authoring and review. Public formative identifiers are newly prefixed; no private instructor guide or summative final bank was used.
