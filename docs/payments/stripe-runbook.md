# Stripe runbook — bringing payments up, safely

**Companion to** `docs/payments/architecture.md` (how it works) and `docs/payments/activation-checklist.md` (what must be true before live).
This document is the **operational** half: the exact commands, the exact variable names, and the order.

**Nothing in this file is a secret, and nothing that is a secret ever enters this repository.** Keys live in the hosting environment. `tests/stripe-setup-tooling.test.mjs` walks the whole tree and fails the build if a Stripe key, a webhook signing secret, or an EIN is ever committed.

---

## The one thing to understand before starting

Turning Stripe on does not make anything purchasable. Selling one regulated course requires **five independent conditions**, and Stripe is only one of them:

| # | Condition | Where it is set | Who sets it |
|---|---|---|---|
| 1 | Stripe is configured for the mode | `STRIPE_SECRET_KEY_*`, `STRIPE_WEBHOOK_SECRET_*` | Operator |
| 2 | The course has a price for that mode | `STATECOURSE_PRICE_<KEY>_<MODE>_CENTS` | Operator |
| 3 | The course's approval status is `approved` | `STATECOURSE_<KEY>_APPROVAL_STATUS` | **A human, after a regulator has actually approved it** |
| 4 | The course's enrollment is enabled | `STATECOURSE_<KEY>_ENROLLMENT_ENABLED` | **A human, after 3** |
| 5 | Live charges are permitted at all | `STATECOURSE_LIVE_PAYMENTS_ENABLED=true` | Operator |

`evaluateCheckoutEligibility()` requires **all five** for a live sale. Miss any one and checkout returns a named reason instead of a payment. `scripts/stripe-setup.mjs` deliberately performs **none** of conditions 3, 4 or 5 — a script that could approve a course would be a script that could sell an unapproved one.

**Today all nine catalogue courses are `submission_draft` with enrollment off and no price. That is correct.** Not one of them has a regulator approval yet.

---

## The environment variables, in full

Set these in the hosting environment (Netlify → Site configuration → Environment variables). Never in a file, never in the repo.

### Always

```
STRIPE_MODE=test                 # or "live"
STATECOURSE_BASE_URL=https://<your site origin>
STATECOURSE_ADMIN_API_TOKEN=<long random string>
SUPABASE_URL=...                 # already required by the platform
SUPABASE_ANON_KEY=...            # server-side; the service-role key is never exposed
```

### Test mode

```
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...
STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES=true    # test environments ONLY
```

That last one is what lets you exercise checkout against an unapproved course in test mode. **It must never be `true` in a live environment**, and preflight fails the run if it is.

### Live mode

```
STRIPE_SECRET_KEY_LIVE=sk_live_...
STRIPE_WEBHOOK_SECRET_LIVE=whsec_...
STATECOURSE_LIVE_PAYMENTS_ENABLED=true
STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES=false
```

### Per course

The suffix is the course's `envKey`, not its id. They are different, and the tooling reads the real one off the catalogue so it cannot print a name the runtime ignores.

| Course id | Env key |
|---|---|
| `me-sales-agent` | `ME_SALES_AGENT` |
| `va-salesperson` | `VA_SALESPERSON` |
| `wi-salesperson` | `WI_SALESPERSON` |
| `mo-salesperson-preexam-48` | `MO_PREEXAM_48` |
| `mo-real-estate-practice-24` | `MO_PRACTICE_24` |
| `ok-basic-prelicense-90` | `OK_BASIC_90` |
| `ca-real-estate-principles-45` | `CA_PRINCIPLES_45` |
| `ca-real-estate-practice-45` | `CA_PRACTICE_45` |
| `ca-mortgage-loan-brokering-lending-45` | `CA_MORTGAGE_45` |

For each course you intend to sell:

```
STATECOURSE_PRICE_<KEY>_TEST_CENTS=19900
STATECOURSE_PRICE_<KEY>_LIVE_CENTS=19900
STATECOURSE_<KEY>_APPROVAL_STATUS=approved        # only when it truly is
STATECOURSE_<KEY>_ENROLLMENT_ENABLED=true         # only after the line above
```

Prices are **in cents**, integer, greater than zero. Anything else reads as no price at all.

---

## Bring-up, in order

### 1. The Stripe account

Done in the Stripe dashboard, not here.

- Create the account in the name **StateCourse LLC**.
- Business type: single-member LLC. **California**, formed 18 August 2026, Secretary of State file number **B20260376786**.
- Tax ID: the EIN from the IRS CP 575 notice. Enter it in Stripe from the notice; it is not recorded in this repository.
- Bank account for settlement.
- Statement descriptor: something a student will recognise on a card statement — `STATECOURSE` — because an unrecognised descriptor is the most common cause of a chargeback.
- Support email and address, and the customer-facing branding on Stripe-hosted pages and receipts.
- Complete Stripe's business verification. Until it is done, live charges are not possible whatever this repository says.

### 2. Create products and prices

Set the price variables first, then:

```bash
# see what it would do, no network calls, no key needed
node scripts/stripe-setup.mjs --dry-run

# test mode
STRIPE_SECRET_KEY_TEST=sk_test_... \
  node scripts/stripe-setup.mjs \
  --webhook https://<your site>/.netlify/functions/stripe-webhook
```

The script is idempotent. It finds a product by `metadata['statecourse_course_id']`, so renaming a course in the catalogue does not orphan its Stripe object, and it finds a price by lookup key `statecourse_<course id>_<mode>`.

**If a configured price differs from the Stripe price**, the script archives the old one and creates a new one rather than editing it. Stripe prices are immutable by design, and that design is right: every past payment must keep pointing at the amount it actually charged.

**The webhook signing secret is printed once, at creation.** Store it immediately as `STRIPE_WEBHOOK_SECRET_TEST`. If you lose it, roll it in the dashboard — there is no way to read it back.

The script registers exactly the seven event types the handler implements:

```
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
refund.created
refund.updated
refund.failed
```

A test asserts this list matches the `case` labels in `netlify/functions/stripe-webhook.mjs`, so the two cannot drift.

### 3. Preflight

```bash
node scripts/stripe-preflight.mjs                  # configuration only
node scripts/stripe-preflight.mjs --check-stripe   # also reconciles Stripe objects
```

It prints, per course, what would actually happen if someone tried to buy it right now, and exits non-zero on any problem. It never prints a key — only a masked prefix, enough to tell test from live.

It fails on, among others: a live key in the test variable; identical test and live keys; `SANDBOX_ALLOW_DRAFT_COURSES` in a live environment; a course whose enrollment is enabled while its approval status is a draft; a Stripe price that disagrees with the configured price; and a missing or incomplete webhook endpoint.

### 4. Test-mode exercise

With `STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES=true` and a test price set, work through the technical verification list in `activation-checklist.md`. At minimum:

- a successful Checkout with `4242 4242 4242 4242`;
- a delayed-payment success and a delayed-payment failure;
- **a duplicate webhook delivery** — `claim_stripe_event` must make the second one a no-op;
- an invalid signature and a modified body, both rejected;
- a full refund and a partial refund;
- a browser-supplied price, rejected — `create-checkout.mjs` reads the amount from the catalogue and never from the request;
- fulfillment granting access to the purchased course **only**;
- a success-page visit with no verified webhook granting **no** access.

And the one that matters most for a regulated product:

- **confirm a test enrollment cannot enter a regulatory completion or reporting workflow**, and that no payment event can move study time, examination eligibility, an examination result, regulatory credit, or certificate state. Payment buys access. It does not buy completion, and the database functions are written so that it cannot.

### 5. Going live — later, per course

Only after a regulator has approved a specific course in writing:

1. Record the approval and its number where the platform reads it.
2. Set that course's live price.
3. Set that course's `APPROVAL_STATUS=approved`.
4. Set that course's `ENROLLMENT_ENABLED=true`.
5. `STRIPE_MODE=live`, `STATECOURSE_LIVE_PAYMENTS_ENABLED=true`, `STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES=false`.
6. Re-run `node scripts/stripe-setup.mjs --live --webhook https://...` and `node scripts/stripe-preflight.mjs --check-stripe`.
7. One controlled live transaction, reconciled end to end: Stripe object, payment row, enrollment, access grant, receipt, notification, bank settlement.

Repeat steps 1–4 **per course**. There is no global switch that makes the catalogue sellable, and adding one would be a mistake.

---

## Where the money stops and the regulator starts

Worth stating plainly, because it is the design decision the whole payments layer is built around.

**Stripe may grant access to a course. It may not do anything else.**

- It cannot record study time.
- It cannot make a student eligible for a final examination.
- It cannot pass or fail one.
- It cannot award regulatory credit.
- It cannot issue a certificate.
- It cannot enter a completion into a regulator report.

A refund removes access. It does not erase a completion that was earned, because a completion record is a regulatory artefact and not a receipt. Correcting one is an append-and-supersede operation with an attributed, timestamped entry — never a silent edit.

If a future change makes a payment event touch any of those, it is a defect regardless of what it makes easier.
