# StateCourse payment architecture

## Boundary

Stripe is a payment processor only. StateCourse owns course eligibility, study-time accounting, engagement, assessments, remediation, final-exam eligibility and results, regulatory credit, reporting, and certificates. Payment code never updates `lms_compliance_state`.

StateCourse never collects or stores card numbers or CVV. The browser is redirected to Stripe-hosted Checkout, where cards and supported wallets are handled by Stripe.

## Enrollment flow

1. The browser requests `/api/payments/config` and displays the server-provided course status, price, and policy versions.
2. The student selects a state/course and accepts every exact version required for that product.
3. `/api/payments/checkout` rejects browser-supplied prices, stale acknowledgments, state/course mismatches, disabled enrollment, and unapproved live products.
4. The server records a checkout attempt and creates a one-time Stripe Checkout Session. Payment methods remain dynamic so Stripe can present supported cards, Apple Pay, or Google Pay.
5. The browser redirects to Stripe. A success-page redirect is informational only and never grants access.
6. Stripe calls `/api/stripe/webhook`. StateCourse verifies the signature against the unmodified raw body and claims the event idempotently.
7. Only a paid Checkout Session can atomically create the payment, enrollment, and an access grant for the exact purchased course.
8. A confirmation is placed in `notification_outbox`. The LMS compliance engine separately initializes and controls regulated activity.

## Environments and activation gates

- `STRIPE_MODE=test` uses only test keys and test objects.
- `STRIPE_MODE=live` additionally requires `STATECOURSE_LIVE_PAYMENTS_ENABLED=true`.
- Every course has independent approval status, enrollment flag, price, and policy versions.
- Live checkout requires approval status `approved`, course enrollment enabled, and a configured live price.
- Draft-course sandbox checkout requires `STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES=true`. Every test-mode enrollment is marked `qa_only`, `qa_non_credit`, and `compliance_credit_eligible=false`.

The default example configuration allows neither production payment nor draft-course sandbox checkout.

## Data model

The migration creates students, courses, versioned policies, checkout attempts, payments, Stripe event claims, refunds, enrollments, course-specific access grants, notification outbox records, and an admin audit log. Money is stored as integer minor units. Stripe mode is stored on financial records so test and live data remain distinguishable.

`admin_payment_ledger` joins the order, student, state, course, payment, enrollment, refund, and Stripe references. The admin endpoints require a server-held bearer token; they are not suitable for direct browser exposure without the StateCourse administrator session layer.

## Webhooks and idempotency

Subscribed event types:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `refund.created`
- `refund.updated`
- `refund.failed`

Event IDs are claimed before processing. Completed duplicates return success without repeating fulfillment. Failed processing is marked retryable. Checkout and refund POST requests use unique idempotency keys.

Do not log raw webhook bodies, keys, access tokens, or full customer records. The event ledger stores event/object identifiers and processing state, not the full Stripe payload.

## Refunds

The admin refund endpoint supports full or partial refunds up to the remaining paid amount. An administrator must explicitly attest that the applicable state/course refund policy was reviewed and provide a reason. Stripe remains authoritative for refund status through signed webhook events.

Refunding a payment does not automatically rewrite completion, exam, credit, or certificate records. Any resulting enrollment/access action must be a separate, audited StateCourse policy decision.

## Future products

Course IDs and `product_type` permit pre-license, broker, continuing education, exam preparation, mortgage/NMLS, bundles, and multi-state packages without changing the payment ledger. Each sellable item must receive its own approval/enrollment gate, price, disclosures, and policy versions. One-time Checkout remains the default.
