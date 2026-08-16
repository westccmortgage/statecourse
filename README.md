# StateCourse

StateCourse is a regulatory-first professional education platform organized by profession, state, license path, approved course version, instructor, enrollment, and completion record.

## Current state products

### Virginia

**Virginia Real Estate Salesperson Pre-License — Principles & Practices of Real Estate (60 hours)**

- Academic course page and 60-hour digital reader
- Timed outline, curriculum, assessments, instructor/student materials, compliance procedures, and submission framework
- Status: **In Development / Preparing Submission**
- Enrollment and regulatory credit: **disabled pending written Virginia approval**

### Maine

**Maine Real Estate Sales Agent Pre-License — The Sales Agent Course (55 hours)**

- Separate Maine regulatory package and online distance-education product
- 55-hour timed curriculum, 3 quizzes / 60 items, 80-item weighted final, 2 case studies, remediation, certificate, reporting, and application materials
- Status: **In Development**
- Enrollment and regulatory credit: **disabled pending written Maine approval**

## National platform

The public site includes a controlled 50-state registry. Only Virginia and Maine have configured course implementations; the remaining states are marked Not Started until official-source research is completed. No Virginia or Maine rule is used as a national default.

## Stripe payment framework

The payment layer prepares Stripe Checkout, cards and supported wallets, promotion codes, verified webhooks, one-time payments, full/partial refunds, tax-ready records, a payment ledger, and separate test/live environments.

Production payments are disabled by default. A paid and verified webhook may create only the purchased course enrollment/access grant. Payment code cannot set study time, exam eligibility or result, regulatory credit, completion, or certificate status; those remain in the LMS compliance engine.

Before activation:

1. Apply `database/001_payments_enrollment.sql` to the production database.
2. Configure the server variables in `.env.example`.
3. Record written approval, approved policies, price, instructor, and approval number for the exact state/course.
4. Complete `docs/payments/activation-checklist.md`.
5. Activate test mode first; enable live mode only after StateCourse LLC banking and Stripe verification are complete.

## Project map

- `public/statecourse/` — national catalog, Virginia/Maine student screens, enrollment, and admin views
- `virginia/` — Virginia regulatory and curriculum package
- `maine/` — Maine regulatory and curriculum package
- `config/` — state/course payment configuration and activation gates
- `netlify/functions/` — payment, webhook, refund, status, and admin endpoints
- `database/` — payment/enrollment/access/audit schema and transactional fulfillment procedures
- `states/` — state-specific provider, course, and instructor version records
- `docs/payments/` — architecture and activation checklist
- `docs/ux/` — institutional information and visual design system

## Validation

Run:

```bash
node --test tests/*.test.mjs
bash site/build.sh
```

The public build intentionally excludes secure final-examination and answer-key files.

## Approval disclaimer

StateCourse does not represent the Virginia or Maine course as approved and does not currently offer licensing credit. Provider eligibility, qualified instructors, regulator acceptance, course approval numbers, controlled delivery, and other filing gates must be completed before enrollment opens.
