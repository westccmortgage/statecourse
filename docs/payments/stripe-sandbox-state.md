# Stripe sandbox state

**Account:** StateCourse LLC sandbox (`acct_1U6HpAI5Vlt1VlIg`), **test mode**.
Everything below is a test-mode object identifier. These are not secrets — they address nothing that holds money, and a test-mode object cannot charge a real card. No key or signing secret appears here or anywhere in this repository.

**Brought up:** 2026-08-19. All nine catalogue courses have a product and a price, reconciled by `scripts/stripe-preflight.mjs --check-stripe`.

## Products and prices

| Course | Product | Price (test) | Amount |
|---|---|---|---|
| me-sales-agent | `prod_V6XaHdNYkJHjVL` | `price_1U6KVDI5Vlt1VlIgoQm3tTpS` | $199.00 |
| va-salesperson | `prod_V6XazAxRmjbAYi` | `price_1U6KVDI5Vlt1VlIgLxJacnP5` | $199.00 |
| wi-salesperson | `prod_V6XaBKek5q2MuM` | `price_1U6KVEI5Vlt1VlIgqoojqaPK` | $199.00 |
| mo-salesperson-preexam-48 | `prod_V6Xay4AD3aVtHw` | `price_1U6KVFI5Vlt1VlIgGhMzfU59` | $199.00 |
| mo-real-estate-practice-24 | `prod_V6XaF8AVGNQzKx` | `price_1U6KVGI5Vlt1VlIgSAM9vKKa` | $199.00 |
| ok-basic-prelicense-90 | `prod_V6XaF8tb9MeaUb` | `price_1U6KVGI5Vlt1VlIgM5q2nSNT` | $199.00 |
| ca-real-estate-principles-45 | `prod_V6UvqU6cvVogzu` | `price_1U6KVHI5Vlt1VlIgI94wqYJ7` | $199.00 |
| ca-real-estate-practice-45 | `prod_V6UwMrEakYzLdc` | `price_1U6KVHI5Vlt1VlIgByrC7lPi` | $199.00 |
| ca-mortgage-loan-brokering-lending-45 | `prod_V6Uw9czNINCn7M` | `price_1U6KVII5Vlt1VlIgDsO24xaO` | $199.00 |

**California is priced at $79 per course as of 2026-08-20** — see `docs/payments/california-pricing.md`. The earlier $199 placeholders were archived and replaced. **The six non-California courses still carry the $199 placeholder**, which is not a pricing decision for those states; each will be set when its own pricing is decided. Changing a price means updating `STATECOURSE_PRICE_<KEY>_TEST_CENTS` and re-running the setup script, which archives the old Stripe price and creates a new one — prices are immutable in Stripe so that every past payment keeps pointing at the amount it actually charged.

Lookup keys follow `statecourse_<course id>_test`, which is how preflight finds a price to compare against the configured amount.

## State product structure

55 products, two per state plus the California single course, created 2026-08-20 by
`scripts/stripe-setup-bundles.mjs` from `config/national-pricing.mjs`. The first 31 covered
the 15 states priced that morning; the remaining 24 were added the same day when the twelve
"In Research" states were priced.

| State | SC-*-EDU | SC-*-COMPLETE |
|---|---:|---:|
| Alaska | $299 | $399 |
| Michigan | $199 | $299 |
| Florida | $149 | $249 |
| Virginia | $199 | $299 |
| Maine | $299 | $399 |
| Vermont | $299 | $399 |
| New Hampshire | $249 | $349 |
| Massachusetts | $249 | $349 |
| Wyoming | $299 | $399 |
| Kansas | $299 | $399 |
| Mississippi | $199 | $299 |
| Wisconsin | $249 | $349 |
| Missouri | $249 | $349 |
| Oklahoma | $299 | $399 |
| Washington | $299 | $399 |
| Pennsylvania | $299 | $399 |
| North Carolina | $299 | $399 |
| Arizona | $399 | $549 |
| Montana | $249 | $349 |
| Idaho | $399 | $549 |
| Nebraska | $349 | $449 |
| New Mexico | $299 | $399 |
| Iowa | $349 | $449 |
| South Dakota | $499 | $649 |
| California | $199 | $299 |
| Colorado | $499 | $699 |
| Texas | $499 | $649 |

Plus `SC-CA-SINGLE` at $79.

Products are found by `metadata['statecourse_sku']` and prices by lookup key
`sc_<state>_<tier>_test`, so re-running the script reconciles rather than duplicating.
Changing a price archives the old one and creates a new one.

The nine per-course products created earlier remain alongside these — they are the
course-level objects, keyed by `metadata['statecourse_course_id']`.

## Webhook

| | |
|---|---|
| Endpoint | `we_1U6KavI5Vlt1VlIgibtThu3O` |
| URL | `https://statecourse.com/api/stripe/webhook` |
| Status | enabled |
| Events | 7, matching the handler's `case` labels exactly |

The URL is the **public API path**, not `/.netlify/functions/stripe-webhook`. Both reach the
same function — netlify.toml rewrites one to the other with status 200, which preserves the
raw body signature verification depends on — but the `/api/` path is the designed public
surface and survives the function file being renamed.

**The signing secret was issued at creation and is not recorded here.** Stripe shows it once
and will not return it on a later read; it belongs in `STRIPE_WEBHOOK_SECRET_TEST` in the
Netlify environment. If it is lost, the endpoint is deleted and recreated (which is what
happened once during bring-up), or the secret is rolled in the dashboard.

Until that variable is set in Netlify, `POST https://statecourse.com/api/stripe/webhook`
returns **503 `webhook_not_configured`** — which is exactly what it returns today, and is the
correct refusal rather than a fault.

## What still has to happen

**1. Netlify environment variables.** Nothing is set there yet. `payment-config` currently
reports `amount: null` for every course, which confirms it. The runbook lists them; at
minimum `STRIPE_MODE`, `STRIPE_SECRET_KEY_TEST`, `STRIPE_WEBHOOK_SECRET_TEST`,
`STATECOURSE_BASE_URL=https://statecourse.com`, `STATECOURSE_ADMIN_API_TOKEN`, the nine
`STATECOURSE_PRICE_*_TEST_CENTS`, and — for test-mode exercise against unapproved courses —
`STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES=true`.

**2. A real price decision** before anything is offered to anyone.

## Running the scripts from this environment

Node's `fetch` ignores `HTTPS_PROXY` unless told to use it, and this environment routes egress through a proxy. Without the flag the proxy answers in plain text, which used to surface as an unhelpful `SyntaxError` from `JSON.parse`. Both scripts now report the real response and say what to do:

```bash
NODE_USE_ENV_PROXY=1 node scripts/stripe-setup.mjs
NODE_USE_ENV_PROXY=1 node scripts/stripe-preflight.mjs --check-stripe
```

`curl` is unaffected — it honours `HTTPS_PROXY` on its own.

## Nothing here is sellable

Preflight's own summary: **0 of 9 courses would accept a payment.** Every one is blocked, and the reason is the right one — each is still `submission_draft` with enrollment off. A Stripe price is a commercial object; selling a regulated course additionally requires a regulator's approval, and the platform keeps those two facts apart deliberately.

## About the key in git history

The sandbox secret key was committed to `scripts/stripe-setup.mjs` in commit `05f079d` and pushed. It has been removed from the working tree but remains in history. **The account owner has reviewed this and decided not to roll it**, on the basis that a test-mode sandbox key cannot reach money or real customer data. That reasoning holds for this key and this account.

It does not extend to a live key. A `sk_live_` key in history is a different matter entirely, and the secret-scan test in `tests/stripe-setup-tooling.test.mjs` fails the build on any of them — test or live — so this cannot happen again by accident.
