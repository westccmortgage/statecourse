#!/usr/bin/env node
/**
 * Stripe preflight for StateCourse.
 *
 * Reads the environment as the running platform reads it and reports what would actually
 * happen if someone tried to buy each course right now. It calls Stripe only when asked
 * with --check-stripe, so it is safe to run anywhere, and it never prints a key.
 *
 * The question it answers is not "is Stripe configured" but "can an unapproved regulated
 * course be sold". Those are different questions and only the second one matters.
 *
 * Usage:
 *   node scripts/stripe-preflight.mjs
 *   STRIPE_SECRET_KEY_TEST=sk_test_... node scripts/stripe-preflight.mjs --check-stripe
 */

import { evaluateCheckoutEligibility, getCourseCatalog } from "../config/course-catalog.mjs";
import { HANDLED_STRIPE_EVENTS, stripeSecretKeyMode } from "../lib/stripe-contract.mjs";

const checkStripe = process.argv.includes("--check-stripe");
const mode = process.env.STRIPE_MODE === "live" ? "live" : "test";

const problems = [];
const warnings = [];
const notes = [];

const present = (name) => Boolean(process.env[name]);
const masked = (name) => {
  const value = process.env[name];
  if (!value) return "not set";
  /* Enough to tell test from live and one key from another, never enough to use. */
  return `${value.slice(0, 8)}…${value.slice(-4)} (${value.length} chars)`;
};

console.log(`\nStateCourse Stripe preflight — STRIPE_MODE=${mode}\n`);

/* ---- 1. Keys ---------------------------------------------------------------- */
console.log("Keys and endpoints");
const keyVar = mode === "live" ? "STRIPE_SECRET_KEY_LIVE" : "STRIPE_SECRET_KEY_TEST";
const hookVar = mode === "live" ? "STRIPE_WEBHOOK_SECRET_LIVE" : "STRIPE_WEBHOOK_SECRET_TEST";

console.log(`  ${keyVar.padEnd(32)} ${masked(keyVar)}`);
console.log(`  ${hookVar.padEnd(32)} ${present(hookVar) ? "set" : "not set"}`);
console.log(`  STATECOURSE_BASE_URL             ${process.env.STATECOURSE_BASE_URL || "not set"}`);
console.log(`  STATECOURSE_ADMIN_API_TOKEN      ${present("STATECOURSE_ADMIN_API_TOKEN") ? "set" : "not set"}`);

if (!present(keyVar)) problems.push(`${keyVar} is not set; checkout will return stripe_not_configured.`);
if (!present(hookVar)) problems.push(`${hookVar} is not set; the webhook will return webhook_not_configured and no payment will ever be finalised.`);
if (!process.env.STATECOURSE_BASE_URL) problems.push("STATECOURSE_BASE_URL is not set; checkout will return base_url_not_configured.");
if (!present("STATECOURSE_ADMIN_API_TOKEN")) warnings.push("STATECOURSE_ADMIN_API_TOKEN is not set; admin payment endpoints are unavailable.");

/* A live key sitting in the test variable is the mistake that costs real money. */
if (/^(?:sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY_TEST || "")) {
  problems.push("STRIPE_SECRET_KEY_TEST holds a LIVE key. Real cards would be charged in test mode.");
}
if (process.env.STRIPE_SECRET_KEY_LIVE && stripeSecretKeyMode(process.env.STRIPE_SECRET_KEY_LIVE) !== "live") {
  warnings.push("STRIPE_SECRET_KEY_LIVE does not look like a live key.");
}
const selectedKeyMode = stripeSecretKeyMode(process.env[keyVar]);
if (present(keyVar) && selectedKeyMode !== mode) {
  problems.push(`${keyVar} is not a valid ${mode}-mode secret or restricted key. Stripe calls are blocked.`);
}
let expectedWebhookUrls = [];
if (process.env.STATECOURSE_BASE_URL) {
  try {
    const base = new URL(process.env.STATECOURSE_BASE_URL);
    if (!["https:", "http:"].includes(base.protocol) || base.username || base.password) throw new Error("invalid_base_url");
    // Both are existing routes to this handler; unrelated sites and paths do not count.
    expectedWebhookUrls = ["/api/stripe/webhook", "/.netlify/functions/stripe-webhook"]
      .map(path => new URL(path, base.origin).href);
  } catch {
    problems.push("STATECOURSE_BASE_URL is invalid; the StateCourse webhook endpoint cannot be verified.");
  }
}
if (process.env.STRIPE_SECRET_KEY_TEST && process.env.STRIPE_SECRET_KEY_LIVE
  && process.env.STRIPE_SECRET_KEY_TEST === process.env.STRIPE_SECRET_KEY_LIVE) {
  problems.push("The test and live secret keys are identical.");
}

/* ---- 2. The global gates ----------------------------------------------------- */
console.log("\nGlobal gates");
const liveEnabled = process.env.STATECOURSE_LIVE_PAYMENTS_ENABLED === "true";
const sandboxDrafts = process.env.STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES === "true";
console.log(`  STATECOURSE_LIVE_PAYMENTS_ENABLED        ${liveEnabled ? "true  ← live charges permitted" : "not true  ← live charges blocked"}`);
console.log(`  STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES  ${sandboxDrafts ? "true  ← unapproved courses purchasable IN TEST MODE" : "not true"}`);

if (mode === "live" && sandboxDrafts) {
  problems.push("STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES must never be true in a live environment.");
}
if (mode === "live" && !liveEnabled) {
  notes.push("Live mode is selected but live payments are disabled, so every checkout returns live_payments_disabled. That is the safe state, not a fault.");
}

/* ---- 3. Course by course ----------------------------------------------------- */
console.log("\nPer-course result of an attempted purchase right now\n");
const courses = getCourseCatalog();
const header = `  ${"course".padEnd(38)} ${"approval".padEnd(18)} ${"enroll".padEnd(7)} ${"price".padEnd(10)} result`;
console.log(header);
console.log(`  ${"-".repeat(header.length - 2)}`);

let sellable = 0;
for (const course of courses) {
  const eligibility = evaluateCheckoutEligibility(course, mode);
  const priceCents = course.price[mode];
  const priceText = priceCents ? `$${(priceCents / 100).toFixed(2)}` : "—";
  const result = eligibility.allowed ? (eligibility.qaOnly ? "ALLOWED (test only)" : "ALLOWED — LIVE SALE") : `blocked: ${eligibility.reason}`;
  if (eligibility.allowed) sellable += 1;
  console.log(`  ${course.id.padEnd(38)} ${course.approvalStatus.padEnd(18)} ${String(course.enrollmentEnabled).padEnd(7)} ${priceText.padEnd(10)} ${result}`);

  /* The coupling that matters: nothing unapproved may ever be sold for real money. */
  if (eligibility.allowed && !eligibility.qaOnly && course.approvalStatus !== "approved") {
    problems.push(`${course.id} would take a live payment while its approval status is "${course.approvalStatus}".`);
  }
  if (course.enrollmentEnabled && course.approvalStatus !== "approved") {
    problems.push(`${course.id} has enrollment enabled but is not approved. Enrollment must not lead approval.`);
  }
}

console.log(`\n  ${sellable} of ${courses.length} courses would accept a payment in ${mode} mode.`);

/* ---- 4. Stripe side, only if asked ------------------------------------------- */
if (checkStripe) {
  const secretKey = mode === "live" ? process.env.STRIPE_SECRET_KEY_LIVE : process.env.STRIPE_SECRET_KEY_TEST;
  if (!secretKey) {
    warnings.push("--check-stripe was passed but no secret key is set for this mode.");
  } else if (selectedKeyMode !== mode || !expectedWebhookUrls.length) {
    warnings.push("Stripe checks skipped because the selected key or StateCourse endpoint configuration is invalid.");
  } else {
    console.log("\nStripe objects");
    const call = async (path) => {
      const res = await fetch(`https://api.stripe.com/v1${path}`, { headers: { authorization: `Bearer ${secretKey}` } });
      /* Same trap as the setup script: a proxy answers in plain text and res.json() throws a
         SyntaxError that blames Stripe for a local network problem. */
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
        const hint = proxy && process.env.NODE_USE_ENV_PROXY !== "1"
          ? " HTTPS_PROXY is set but Node is not using it; re-run with NODE_USE_ENV_PROXY=1."
          : "";
        throw new Error(`${res.status}, non-JSON response: ${text.slice(0, 160)}.${hint}`);
      }
      if (!res.ok) throw new Error(data?.error?.message || String(res.status));
      return data;
    };
    try {
      for (const course of courses) {
        const lookupKey = `statecourse_${course.id}_${mode}`;
        const prices = await call(`/prices?lookup_keys[]=${encodeURIComponent(lookupKey)}&limit=1`);
        const price = prices.data?.[0];
        const configured = course.price[mode];
        if (!price) {
          console.log(`  · ${course.id.padEnd(38)} no Stripe price`);
          if (configured) problems.push(`${course.id} has a configured ${mode} price but no Stripe price with lookup key ${lookupKey}.`);
        } else if (configured && price.unit_amount !== configured) {
          console.log(`  ✗ ${course.id.padEnd(38)} Stripe ${price.unit_amount} ≠ configured ${configured}`);
          problems.push(`${course.id}: the Stripe price and the configured price disagree. Re-run scripts/stripe-setup.mjs.`);
        } else {
          console.log(`  ✓ ${course.id.padEnd(38)} ${price.id} ${price.unit_amount}`);
        }
      }
      const endpoints = await call("/webhook_endpoints?limit=100");
      const required = HANDLED_STRIPE_EVENTS;
      if (!endpoints.data?.length) {
        problems.push("No webhook endpoint is registered. Paid checkouts would never be finalised.");
      } else {
        const matching = endpoints.data.filter(endpoint => expectedWebhookUrls.includes(endpoint.url));
        const enabled = matching.filter(endpoint => endpoint.status === "enabled");
        if (!matching.length) problems.push(`No StateCourse webhook endpoint is registered at ${expectedWebhookUrls[0]} (or its existing function route).`);
        else if (!enabled.length) problems.push("The StateCourse webhook endpoint is disabled. Paid checkouts would never be finalised.");
        for (const endpoint of enabled) {
          const events = Array.isArray(endpoint.enabled_events) ? endpoint.enabled_events : [];
          const missing = required.filter((eventType) => !events.includes(eventType) && !events.includes("*"));
          console.log(`  ${missing.length ? "✗" : "✓"} webhook ${endpoint.url} (${endpoint.status})`);
          if (missing.length) problems.push(`Webhook ${endpoint.url} is missing: ${missing.join(", ")}`);
        }
      }
    } catch (error) {
      problems.push(`Stripe call failed: ${error.message}`);
    }
  }
}

/* ---- 5. Verdict -------------------------------------------------------------- */
console.log("");
for (const note of notes) console.log(`  note     ${note}`);
for (const warning of warnings) console.log(`  warning  ${warning}`);
for (const problem of problems) console.log(`  PROBLEM  ${problem}`);

if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problem${problems.length === 1 ? "" : "s"}. Do not proceed.\n`);
  process.exit(1);
}
console.log(`\n  ✓ No problems found for ${mode} mode.${warnings.length ? ` ${warnings.length} warning(s) above.` : ""}\n`);
