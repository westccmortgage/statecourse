# Stripe sandbox state

**Account:** StateCourse LLC sandbox (`acct_1U6HpAI5Vlt1VlIg`, test mode).
Connected via the Stripe connector on 2026-08-19. Object IDs below are test-mode identifiers, not secrets; no key or signing secret appears here or anywhere in this repository.

## Created so far (2 of 9 products)

| Course | Product | Created |
|---|---|---|
| ca-real-estate-principles-45 | `prod_V6UvqU6cvVogzu` | 2026-08-19 |
| ca-mortgage-loan-brokering-lending-45 | `prod_V6Uw9czNINCn7M` | 2026-08-19 |

The connector disconnected mid-run. **Resuming is safe**: both the connector path and `scripts/stripe-setup.mjs` find existing products by `metadata['statecourse_course_id']` before creating, so a re-run completes the remaining seven without duplicating these two.

## Remaining

1. Products for the other 7 catalogue courses (ca-real-estate-practice-45, va-salesperson, me-sales-agent, wi-salesperson, mo-salesperson-preexam-48, mo-real-estate-practice-24, ok-basic-prelicense-90).
2. Test prices (lookup key `statecourse_<course id>_test`) — amounts are the user's pricing decision; whatever is chosen must equal `STATECOURSE_PRICE_<KEY>_TEST_CENTS` in the hosting environment or preflight `--check-stripe` will flag the mismatch.
3. Webhook endpoint — needs the production/staging domain for `https://<domain>/.netlify/functions/stripe-webhook`; the signing secret goes straight into `STRIPE_WEBHOOK_SECRET_TEST`, never into a file.
4. `node scripts/stripe-preflight.mjs --check-stripe` to reconcile.

Either path completes this: reconnect the Stripe connector, or run `scripts/stripe-setup.mjs` with the sandbox secret key from the dashboard (`https://dashboard.stripe.com/acct_1U6HpAI5Vlt1VlIg/apikeys`) set only in the shell environment.
