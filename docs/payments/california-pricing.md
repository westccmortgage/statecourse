# California pricing and products

> Superseded in part by `docs/payments/national-pricing.md`, which sets pricing for all
> thirteen states. California's own numbers below are unchanged and remain correct.

**Decided:** 2026-08-20 · **Status:** prices live in the Stripe sandbox; nothing is sellable, because no course is approved.

## The three products

| Product | Price | What the student gets |
|---|---:|---|
| **Individual California Course — 45 Hours** | **$79** | Any one of the three statutory pre-license courses |
| **California Required Education — 135 Hours** | **$199** | All three courses — Principles, Practice, and Mortgage Loan Brokering and Lending |
| **California Complete Licensing Path** | **$299** | All 135 hours, plus California Exam Prep and the Licensing/Application Navigator |

Recorded once in `PRICING` in `config/california/submission-facts.mjs`, disclosed on every course's RE 313 General Information Page, and rendered into the submission by the generator.

**RE 313 wanted all three.** Its fee field asks for the total "including any shipping and handling fees, **course group package fees, discounts** etc.", so a General Information Page that stated only $79 would be incomplete. Each course's page now discloses the single-course price and both package prices.

## Two things the product names must never say

### 1. Not "DRE-approved"

The pricing table this was taken from described the $79 tier as "one DRE-approved course". **No StateCourse course is approved by DRE**, and none may be described that way — on a price page, in a product name, in a Stripe product description, or anywhere else — until DRE has approved it in writing and issued a course approval number.

This is not only the project's own rule. **RE 307, Regulation 3000(a)(5)** requires that a private vocational school "shall not use advertising or other promotional devices that are deceptive or misleading", and **Regulation 3004(b)** requires that advertising referring to approved courses "shall identify the specific course or courses that have been approved **by listing the Department's course approval number**." Advertising a course as approved without an approval number is precisely what those two provisions prohibit, and doing it before approval would be a fact a reviewer could hold against the application.

The Stripe product descriptions created by `scripts/stripe-setup.mjs` say "regulated qualifying education" and carry no approval claim. The permitted phrasing before approval is *"California statutory pre-license course — pending DRE approval"*, or simply the course title.

**After approval**, the honest and useful phrasing includes the number: *"DRE-approved · course approval number XXXX"*.

### 2. Exam Prep and the Navigator are not pre-license education

The $299 tier bundles two things that are **not** statutory pre-license education, carry **no DRE course credit**, and form no part of the course approval application:

- California Exam Prep
- Licensing/Application Navigator

Every place the $299 tier is described — including the RE 313 fee block — says so explicitly. A student must not be able to think that paying more buys more regulatory credit; it buys additional non-credit help.

**Neither product exists yet.** They are named in the pricing and are not built.

## What is live in Stripe

Sandbox account `acct_1U6HpAI5Vlt1VlIg`, test mode. Set 2026-08-20.

| Course | Price object | Amount |
|---|---|---:|
| ca-real-estate-principles-45 | `price_1U6NwcI5Vlt1VlIgvytbqQV1` | $79.00 |
| ca-real-estate-practice-45 | `price_1U6NwcI5Vlt1VlIgHdHFSnBa` | $79.00 |
| ca-mortgage-loan-brokering-lending-45 | `price_1U6NwdI5Vlt1VlIg3qSRQ5Iv` | $79.00 |

The earlier $199 placeholder prices were **archived, not deleted** — Stripe prices are immutable so that every past payment keeps pointing at the amount it actually charged. Re-running the setup script after a price change archives and replaces automatically.

The six non-California courses still have no price. They belong to states whose own pricing has not been decided.

## The bundles are not implemented, and here is exactly what they need

Only the **single-course** tier can be sold by the platform as it stands. The $199 and $299 tiers require real work, because one payment must produce **three separate enrollments**.

### Why it is not a one-line change

`finalize_paid_checkout` in `database/001_payments_enrollment.sql` creates, from one paid checkout: **one** enrollment, **one** payment row, and **one** access grant, all keyed to `checkout_attempts.course_id`, which is singular. The comment above it states the design intent — *"Payment success grants only the purchased course."*

That design is correct and must not be loosened into "a payment can grant whatever it likes". **Each course keeps its own enrollment**, because each course has its own regulatory completion record, its own 2½-week minimum, its own one-year deadline, and its own DRE completion certificate with its own approval number. A bundle is emphatically **not** one enrollment covering three courses.

### The shape of the change

1. A **bundle** concept in the catalogue: an id, a price, and the ordered list of course ids it grants.
2. `checkout_attempts` gains a nullable `bundle_id`; `course_id` stays for single-course purchases.
3. `finalize_paid_checkout` becomes: one payment row, then **one enrollment and one access grant per course in the bundle**, each with its own enrollment date, all referencing the same payment.
4. `payments.enrollment_id` can no longer be a single foreign key — either a join table, or the link is inverted so each enrollment references its payment.
5. **Refunds** need a decision the current code does not have to make: does refunding a bundle revoke access to all three courses, or only to courses not yet completed? A completion already earned is a regulatory artefact and is never erased — access can be revoked, but the completion record stands.
6. The RE 313 enrollment-pacing rules apply **per course** and must keep applying: buying three courses at once does not let a student complete two of them inside five weeks.

Point 6 is the one most likely to be got wrong by someone implementing this quickly, and it is the one a DRE audit would find.

### When

**Not urgent, and it should not be rushed.** Nothing is sellable until DRE approves at least one course, so there is no revenue waiting on this. The natural moment is after approval and before enrollment is enabled, so the bundle logic can be tested against the real completion rules rather than against placeholders.
