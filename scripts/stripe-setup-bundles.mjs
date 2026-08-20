#!/usr/bin/env node
/**
 * Creates the state-level product structure in Stripe: two products per state.
 *
 *   SC-<STATE>-EDU        Required Education
 *   SC-<STATE>-COMPLETE   Complete Licensing Path
 *
 * Plus SC-CA-SINGLE where a single-course price is defined.
 *
 * Idempotent: products are found by metadata['statecourse_sku'] before creating, and a
 * price whose amount has changed is archived and replaced rather than edited, since Stripe
 * prices are immutable.
 *
 * Usage:
 *   NODE_USE_ENV_PROXY=1 STRIPE_SECRET_KEY_TEST=sk_test_... node scripts/stripe-setup-bundles.mjs
 *   add --live with STRIPE_SECRET_KEY_LIVE to touch live mode
 *   add --dry-run to print without calling Stripe
 */

import { STATE_PRICING } from "../config/national-pricing.mjs";

const args = process.argv.slice(2);
const live = args.includes("--live");
const dryRun = args.includes("--dry-run");
const mode = live ? "live" : "test";
const secretKey = live ? process.env.STRIPE_SECRET_KEY_LIVE : process.env.STRIPE_SECRET_KEY_TEST;

function fail(message) {
  console.error(`\n  x ${message}\n`);
  process.exit(1);
}

if (!dryRun && !secretKey) fail(`Set ${live ? "STRIPE_SECRET_KEY_LIVE" : "STRIPE_SECRET_KEY_TEST"} in the environment.`);
if (!dryRun && live && !secretKey.startsWith("sk_live_")) fail("--live passed but the key is not a live key.");
if (!dryRun && !live && secretKey.startsWith("sk_live_")) fail("A live key is set in the test variable.");

async function stripe(path, { method = "GET", params } = {}) {
  const headers = { authorization: `Bearer ${secretKey}` };
  let body;
  if (params) {
    body = new URLSearchParams();
    const append = (key, val) => {
      if (val === undefined || val === null) return;
      if (typeof val === "object") { for (const [k, v] of Object.entries(val)) append(`${key}[${k}]`, v); }
      else body.append(key, String(val));
    };
    for (const [key, val] of Object.entries(params)) append(key, val);
    headers["content-type"] = "application/x-www-form-urlencoded";
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, { method, headers, body });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); }
  catch {
    const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    const hint = proxy && process.env.NODE_USE_ENV_PROXY !== "1"
      ? "\n    HTTPS_PROXY is set but Node is not using it. Re-run with NODE_USE_ENV_PROXY=1." : "";
    fail(`Stripe ${method} ${path} returned ${res.status} but not JSON:\n    ${text.slice(0, 200)}${hint}`);
  }
  if (!res.ok) fail(`Stripe ${method} ${path}: ${data?.error?.message || res.status}`);
  return data;
}

/* Every product this script manages, flattened from the pricing table. */
const items = [];
for (const s of STATE_PRICING) {
  items.push({
    sku: s.requiredEducation.sku, cents: s.requiredEducation.cents, state: s.code, tier: "required_education",
    name: `${s.name} Real Estate Required Education — ${s.requiredHours} Hours`,
    description: `Every course ${s.name} requires for the salesperson licence. ${s.composition || ""}`.trim()
  });
  items.push({
    sku: s.completePath.sku, cents: s.completePath.cents, state: s.code, tier: "complete_path",
    name: `${s.name} Complete Licensing Path`,
    description: `${s.requiredHours} hours of required education, plus exam prep and the licensing application navigator. Exam prep and the navigator are not statutory pre-license education and carry no regulator course credit.`
  });
  if (s.singleCourse) {
    items.push({
      sku: s.singleCourse.sku, cents: s.singleCourse.cents, state: s.code, tier: "single_course",
      name: `${s.name} Individual Course`,
      description: `Any one ${s.name} statutory pre-license course.`
    });
  }
}

console.log(`\nStateCourse state product structure — ${mode} mode${dryRun ? " (dry run)" : ""}`);
console.log(`${STATE_PRICING.length} states, ${items.length} products\n`);

let created = 0;
let reused = 0;
let pricesCreated = 0;

for (const item of items) {
  const dollars = (item.cents / 100).toFixed(2);
  if (dryRun) { console.log(`  . ${item.sku.padEnd(18)} $${dollars.padStart(7)}  ${item.name}`); continue; }

  const found = await stripe(`/products/search?query=${encodeURIComponent(`metadata['statecourse_sku']:'${item.sku}'`)}`);
  let product = found.data?.[0];
  if (!product) {
    product = await stripe("/products", {
      method: "POST",
      params: {
        name: item.name,
        description: item.description,
        metadata: { statecourse_sku: item.sku, statecourse_state: item.state, statecourse_tier: item.tier }
      }
    });
    created += 1;
  } else {
    reused += 1;
  }

  const lookupKey = `${item.sku.toLowerCase().replace(/-/g, "_")}_${mode}`;
  const existing = await stripe(`/prices?lookup_keys[]=${encodeURIComponent(lookupKey)}&limit=1`);
  let price = existing.data?.[0];

  if (price && price.unit_amount !== item.cents) {
    await stripe(`/prices/${price.id}`, { method: "POST", params: { active: false, lookup_key: `${lookupKey}_archived_${price.id}` } });
    price = null;
  }
  if (!price) {
    price = await stripe("/prices", {
      method: "POST",
      params: {
        product: product.id, currency: "usd", unit_amount: item.cents,
        lookup_key: lookupKey, transfer_lookup_key: true,
        metadata: { statecourse_sku: item.sku }
      }
    });
    pricesCreated += 1;
  }

  console.log(`  ${item.sku.padEnd(18)} $${dollars.padStart(7)}  ${product.id}  ${price.id}`);
}

if (!dryRun) {
  console.log(`\n  ${created} products created, ${reused} reused, ${pricesCreated} prices created.`);
}
