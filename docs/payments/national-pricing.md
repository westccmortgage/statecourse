# National pricing

**Decided:** 2026-08-20 · **Encoded in:** `config/national-pricing.mjs` · **Verified by:** `tests/national-pricing.test.mjs`

## The decision

**Two Stripe products per state, not one national SKU.** Price is set per state from that state's required hours, its competitive intensity, and what students there already pay.

| State | Hours | Required Education | Complete Path | Market today |
|---|---:|---:|---:|---|
| Alaska | 40 | $299 | $399 | $385–$395 |
| Michigan | 40 | $199 | $299 | $135–$499 |
| Florida | 63 | $149 | $249 | $99–$448 |
| Virginia | 60 | $199 | $299 | $239–$519 |
| Maine | 55 | $299 | $399 | $349–$629 |
| Wisconsin | 72 | $249 | $349 | $279–$679 |
| Missouri | 72 | $249 | $349 | $298–$582 |
| Oklahoma | 90 | $299 | $399 | $299–$829 |
| Washington | 90 | $299 | $399 | $379–$785 |
| Pennsylvania | 75 | $299 | $399 | $252–$685 |
| North Carolina | 75 | $299 | $399 | $299–$549 |
| Arizona | 96 | $399 | $549 | $549–$929 |
| California | 135 | $199 | $299 | $139–$449 |
| Colorado | 168 | $499 | $699 | $429–$1,299 |
| Texas | 180 | $499 | $649 | $498–$1,000 |

SKUs follow `SC-<STATE>-EDU` and `SC-<STATE>-COMPLETE`. California additionally has `SC-CA-SINGLE` at **$79**, the only single-course price decided so far.

**Headline claim: "Real Estate Pre-Licensing from $149".** It is computed from the table by `lowestAdvertisedPrice()` rather than written down, and a test asserts it matches a price some state actually charges. A "from $X" where no state charges $X is deceptive advertising, and for a regulated school that is a licensing problem rather than a copy problem.

**Why hours alone would price this wrong:** Maine is 55 hours and priced above Virginia's 60, because Maine is a small market with few providers where approved education runs $405–$480, while Virginia is competitive and Moseley sells a strong 60-hour package at $296. A `$3 × hour` formula would get both wrong.

## Three things the pricing table surfaced

### 1. Arizona is 96 hours, and it is two products

Our registry recorded `prelicense_hours: 90`. That field is correct as far as it goes — it is the pre-license course — but Arizona requires **a 90-hour salesperson pre-license course *and* a separate 6-hour contract writing course**, which our own registry note already describes as "two separate regulatory records."

**Consequence for the bundle:** `SC-AZ-EDU` must grant **two** courses. Any implementation that assumes one course per state gets Arizona wrong.

### 2. Alaska and Michigan — priced 2026-08-20

Both were built and unpriced; both now have prices, and `PRICING_GAPS` is empty. The test that fails when a state in development has neither a price nor a gap entry stays, because the next state built lands there until someone prices it.

At the same 40 hours they are priced differently on purpose. **Alaska $299** against a market near $390 — a small market with few providers. **Michigan $199** against a $135–$499 spread — a large competitive market, priced in the middle of it. Hours alone would have made them identical and both wrong.

### 3. Florida and Texas are priced but not researched

Both carry hours from market research, not from reading the statute. Neither has had its rules read from primary sources, neither has a curriculum, and both sit at "Coming Soon" in the registry.

This is recorded rather than hidden: their `buildStatus` is `unresearched` and their `hoursSource` says where the number came from. A test asserts no unresearched state claims development status.

**The risk this guards against is real and has bitten this project four times.** Iowa, New Hampshire, Mississippi and Nebraska each had an hour figure or a delivery rule from a secondary source that the primary text contradicted — Nebraska by 30 hours. Florida's 63 and Texas's 180 are plausible and widely quoted; they are not yet verified, and no build should start on them until they are.

## What has to be built before either tier can be sold

### Both tiers are bundles, and bundles do not exist yet

`finalize_paid_checkout` creates **one** enrollment and **one** access grant from a singular `checkout_attempts.course_id`. Every state in this table except a California single-course purchase needs **one payment to produce N enrollments** — three for California, two for Arizona, six for Texas.

Each course must keep its own enrollment, because each carries its own completion record, its own pacing rules, and its own regulator certificate. A bundle is not one enrollment covering several courses. The full shape of the change is set out in `docs/payments/california-pricing.md`.

### The Complete Path needs two products that exist nowhere

**Exam Prep** and the **Licensing/Application Navigator** are the entire difference between the two tiers, and neither is built for any state. Until they exist, `SC-<STATE>-COMPLETE` is a price with nothing behind it.

Both are **non-credit**. Neither is statutory pre-license education, neither carries regulator course credit, and every description must say so — a student must never be able to think that paying more buys more regulatory credit.

## What is live in Stripe right now

Sandbox only, test mode, account `acct_1U6HpAI5Vlt1VlIg`.

**Three California course prices at $79** — the single-course tier, which is the only tier the platform can currently fulfil. The six non-California courses still carry a $199 placeholder that is not a pricing decision for those states.

**No `SC-*-EDU` or `SC-*-COMPLETE` product exists in Stripe.** Creating them before the bundle fulfilment exists would put a purchasable price in front of a checkout that cannot deliver what it sells.

## And the standing rule

**A price is a commercial fact. Selling a regulated course also requires that state's regulator to have approved it.** The two are kept apart in `evaluateCheckoutEligibility`, and every state in this table is `submission_draft` with enrollment disabled. Preflight reports 0 of 9 sellable, which is correct.
