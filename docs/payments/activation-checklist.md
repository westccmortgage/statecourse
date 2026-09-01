# Stripe production activation checklist

Production remains disabled until every item below is completed and recorded.

**For the commands and exact variable names, see `docs/payments/stripe-runbook.md`.** This
file is the sign-off list; the runbook is how you get there. Two scripts back it:

    node scripts/stripe-setup.mjs --dry-run      # what would be created, no key needed
    node scripts/stripe-preflight.mjs            # what would happen if someone bought now

Preflight exits non-zero on any problem and prints, per course, the reason a purchase would
be blocked. Run it before and after every change to a payments variable.

## Business and Stripe

- StateCourse LLC bank account and settlement details are active.
- Stripe business verification is complete.
- Live secret and webhook-signing keys are stored only in the hosting environment.
- Test keys are not reused in live variables.
- The live webhook endpoint is registered for the documented event types.
- Stripe-hosted receipts, branding, support contact, statement descriptor, and tax settings are reviewed.

## State/course approval

- Written regulator/provider approval is recorded for the specific course.
- The authoritative course config says `approved` and has enrollment enabled.
- Price, currency, refund/cancellation rules, disclosures, enrollment period, expiration, reporting, and certificate rules are approved for that course.
- Regulatory acknowledgment, terms, refund-policy, and cancellation-policy version IDs match the exact published documents.
- Instructor/provider and regulatory approval numbers are stored where required.

## Technical verification

- Apply `database/001_payments_enrollment.sql` to the production Supabase project.
- Configure `SUPABASE_ANON_KEY` server-side for authenticated student-token verification; never expose the service-role key.
- Confirm the Checkout endpoint rejects missing/mismatched `Origin` headers and live requests without a valid student bearer token.
- Seed the exact approved course records and policy versions.
- Confirm RLS is enabled and browser roles cannot read payment/admin tables or execute payment RPCs.
- Rotate and store a long random `STATECOURSE_ADMIN_API_TOKEN` behind the administrator session layer.
- Complete a test Checkout, delayed-payment success/failure test, duplicate webhook test, full refund, and partial refund.
- Confirm an invalid signature, modified body, stale acknowledgment, browser-supplied price, wrong state, disabled enrollment, and unapproved live course are rejected.
- Confirm fulfillment grants access only to the purchased course.
- Confirm test/draft enrollments are non-credit and cannot enter regulatory completion/reporting workflows.
- Confirm success-page visits without a paid verified webhook grant no access.
- Confirm payment code cannot update study time, exam eligibility/result, regulatory credit, or certificate state.
- Confirm payment/enrollment confirmation delivery and failed-payment messaging.
- Confirm backup, retention, reconciliation, and incident procedures.

## Final switch

Only after sign-off:

1. Set the course live price.
2. Set its approval status to `approved`.
3. Enable enrollment for that course.
4. Set `STRIPE_MODE=live`.
5. Set `STATECOURSE_LIVE_PAYMENTS_ENABLED=true`.
6. Keep `STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES=false` in production.
7. Run one controlled live transaction and reconcile the Stripe object, payment, enrollment, access grant, receipt, notification, and bank settlement.

Turning on Stripe globally is never sufficient to sell a regulated course; every course gate must pass independently.
