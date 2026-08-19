#!/usr/bin/env node
/**
 * Stripe bring-up for StateCourse.
 *
 * Creates or verifies one Product and one Price per catalogue course, and registers the
 * webhook endpoint. Idempotent: re-running it finds what exists by lookup key and metadata
 * rather than creating duplicates.
 *
 * Three things this script will not do, by design:
 *
 *   1. It never writes a key, a price, or an approval status into the repository. It prints
 *      the environment variables you must set in the hosting environment, and nothing else
 *      leaves it.
 *   2. It never enables a course. Creating a Stripe price is a commercial act; enabling
 *      enrollment is a regulatory one, and the platform keeps them apart on purpose.
 *      `STATECOURSE_<COURSE>_ENROLLMENT_ENABLED` and `..._APPROVAL_STATUS` are set by a
 *      human after a regulator has actually approved something.
 *   3. It refuses live mode unless you pass --live AND the live key is present. There is no
 *      way to touch live objects by forgetting a flag.
 *
 * Usage:
 *   STRIPE_SECRET_KEY_TEST=sk_test_51U6HpAI5Vlt1VlIgUKIHtVMDVZrZiKLSrX3fA00eUCpVZdzX2zyYR8pupwEqYXhzLbBqjIGRQK7tJhl2pHIp4k1x00do3gIuIz node scripts/stripe-setup.mjs
 *   STRIPE_SECRET_KEY_TEST=sk_test_51U6HpAI5Vlt1VlIgUKIHtVMDVZrZiKLSrX3fA00eUCpVZdzX2zyYR8pupwEqYXhzLbBqjIGRQK7tJhl2pHIp4k1x00do3gIuIznode scripts/stripe-setup.mjs --webhook https://statecourse.example/.netlify/functions/stripe-webhook
 *   STRIPE_SECRET_KEY_LIVE=sk_test_51U6HpAI5Vlt1VlIgUKIHtVMDVZrZiKLSrX3fA00eUCpVZdzX2zyYR8pupwEqYXhzLbBqjIGRQK7tJhl2pHIp4k1x00do3gIuIznode scripts/stripe-setup.mjs --live --webhook https://...
 *
 * Add --dry-run to print what would be created without calling Stripe.
 */

import { getCourseCatalog } from "../config/course-catalog.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : null;
};

const live = flag("live");
const dryRun = flag("dry-run");
const mode = live ? "live" : "test";
const webhookUrl = value("webhook");

/* The event types the webhook handler actually implements. Registering more than these
   means Stripe delivers events nothing reads; registering fewer means a paid checkout is
   never finalised. Kept in one place so the two cannot drift. */
const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "refund.created",
  "refund.updated",
  "refund.failed"
];

const secretKey = live ? process.env.STRIPE_SECRET_KEY_LIVE : process.env.STRIPE_SECRET_KEY_TEST;

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

if (!dryRun && !secretKey) {
  fail(`Set ${live ? "STRIPE_SECRET_KEY_LIVE" : "STRIPE_SECRET_KEY_TEST"} in the environment. Never put it in a file.`);
}
if (!dryRun && secretKey && live && !secretKey.startsWith("sk_live_")) {
  fail("--live was passed but STRIPE_SECRET_KEY_LIVE is not a live key. Refusing to continue.");
}
if (!dryRun && secretKey && !live && secretKey.startsWith("sk_live_")) {
  fail("A live key is set in STRIPE_SECRET_KEY_TEST. Refusing to create test objects with a live key.");
}

async function stripe(path, { method = "GET", params } = {}) {
  const headers = { authorization: `Bearer ${secretKey}` };
  let body;
  if (params) {
    body = new URLSearchParams();
    const append = (key, val) => {
      if (val === undefined || val === null) return;
      if (Array.isArray(val)) {
        val.forEach((item, index) => append(`${key}[${index}]`, item));
      } else if (typeof val === "object") {
        for (const [k, v] of Object.entries(val)) append(`${key}[${k}]`, v);
      } else {
        body.append(key, String(val));
      }
    };
    for (const [key, val] of Object.entries(params)) append(key, val);
    headers["content-type"] = "application/x-www-form-urlencoded";
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, { method, headers, body });
  const data = await res.json();
  if (!res.ok) fail(`Stripe ${method} ${path}: ${data?.error?.message || res.status}`);
  return data;
}

/* The env suffix the catalogue derives price and approval variables from. Read off the
   course rather than recomputed, because recomputing it from the course id produces a
   different string — the catalogue's key for `ca-real-estate-principles-45` is
   `CA_PRINCIPLES_45` — and instructions that name a variable the runtime never reads are
   worse than no instructions. */
const envSuffix = (course) => course.envKey;

const courses = getCourseCatalog();
const lines = [];

console.log(`\nStateCourse Stripe bring-up — ${mode} mode${dryRun ? " (dry run)" : ""}`);
console.log(`${courses.length} catalogue courses\n`);

for (const course of courses) {
  const lookupKey = `statecourse_${course.id}_${mode}`;
  const priceCents = course.price[mode];

  if (dryRun) {
    console.log(`  · ${course.id} — would ensure product and price (lookup_key ${lookupKey})`);
    continue;
  }

  /* Find the product by our own metadata rather than by name, so renaming a course in the
     catalogue does not orphan its Stripe object. */
  const found = await stripe(`/products/search?query=${encodeURIComponent(`metadata['statecourse_course_id']:'${course.id}'`)}`);
  let product = found.data?.[0];

  if (!product) {
    product = await stripe("/products", {
      method: "POST",
      params: {
        name: course.name,
        description: `${course.state} regulated qualifying education — ${course.productType}`,
        metadata: { statecourse_course_id: course.id, statecourse_state: course.state }
      }
    });
    console.log(`  + product ${product.id}  ${course.id}`);
  } else {
    console.log(`  = product ${product.id}  ${course.id}`);
  }

  if (!priceCents) {
    console.log(`    · no price configured for ${mode}; skipping price. Set STATECOURSE_PRICE_${envSuffix(course)}_${mode.toUpperCase()}_CENTS first.`);
    lines.push(`# STATECOURSE_PRICE_${envSuffix(course)}_${mode.toUpperCase()}_CENTS=   # not set — no Stripe price created`);
    continue;
  }

  const existing = await stripe(`/prices?lookup_keys[]=${encodeURIComponent(lookupKey)}&limit=1`);
  let price = existing.data?.[0];

  if (price && price.unit_amount !== priceCents) {
    /* Stripe prices are immutable. A changed amount means a new price and the old one
       archived, which keeps every past payment pointing at the amount it actually charged. */
    await stripe(`/prices/${price.id}`, { method: "POST", params: { active: false, lookup_key: `${lookupKey}_archived_${price.id}` } });
    console.log(`    · archived ${price.id} (was ${price.unit_amount}, now ${priceCents})`);
    price = null;
  }

  if (!price) {
    price = await stripe("/prices", {
      method: "POST",
      params: {
        product: product.id,
        currency: course.currency,
        unit_amount: priceCents,
        lookup_key: lookupKey,
        transfer_lookup_key: true,
        metadata: { statecourse_course_id: course.id }
      }
    });
    console.log(`  + price   ${price.id}  ${(priceCents / 100).toFixed(2)} ${course.currency.toUpperCase()}`);
  } else {
    console.log(`  = price   ${price.id}  ${(priceCents / 100).toFixed(2)} ${course.currency.toUpperCase()}`);
  }
}

if (webhookUrl && !dryRun) {
  const endpoints = await stripe("/webhook_endpoints?limit=100");
  const match = endpoints.data?.find((endpoint) => endpoint.url === webhookUrl);
  if (match) {
    await stripe(`/webhook_endpoints/${match.id}`, { method: "POST", params: { enabled_events: WEBHOOK_EVENTS } });
    console.log(`\n  = webhook ${match.id}  ${webhookUrl}`);
    console.log(`    · events reconciled to the ${WEBHOOK_EVENTS.length} the handler implements`);
    console.log(`    · the signing secret is only shown at creation. If you do not have it, roll it in the dashboard.`);
  } else {
    const created = await stripe("/webhook_endpoints", {
      method: "POST",
      params: { url: webhookUrl, enabled_events: WEBHOOK_EVENTS, description: `StateCourse ${mode}` }
    });
    console.log(`\n  + webhook ${created.id}  ${webhookUrl}`);
    console.log(`    · signing secret: ${created.secret}`);
    console.log(`    · store it as STRIPE_WEBHOOK_SECRET_${mode.toUpperCase()} in the hosting environment, not in a file.`);
  }
} else if (!webhookUrl) {
  console.log("\n  · no --webhook passed; webhook endpoint not touched.");
}

console.log(`
Next, in the hosting environment only:

  STRIPE_MODE=${mode}
  ${live ? "STRIPE_SECRET_KEY_LIVE" : "STRIPE_SECRET_KEY_TEST"}=<the key you just used>
  STRIPE_WEBHOOK_SECRET_${mode.toUpperCase()}=<from above, or rolled in the dashboard>
  STATECOURSE_BASE_URL=<the site origin>
  STATECOURSE_ADMIN_API_TOKEN=<long random>
${lines.join("\n")}

Then run:  node scripts/stripe-preflight.mjs

Creating a price sells nothing. A course becomes purchasable only when a human sets its
approval status to "approved" and enables its enrollment, and — for live mode —
STATECOURSE_LIVE_PAYMENTS_ENABLED=true. That is three separate deliberate acts, and this
script performs none of them.
`);
