import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { stripeEnvironment } from "../netlify/functions/_lib/env.mjs";
import { stripeRequest } from "../netlify/functions/_lib/stripe.mjs";
import { legacyHandler as handler } from "../netlify/functions/stripe-webhook.mjs";

// Synthetic, process-local configuration and intercepted transport only. No account,
// live Stripe endpoint, actual database or stored host credential is used by these tests.
const defaults = {
  STRIPE_MODE: "test",
  STATECOURSE_LIVE_PAYMENTS_ENABLED: "false",
  STRIPE_SECRET_KEY_TEST: "sk_test_" + "0".repeat(16),
  STRIPE_SECRET_KEY_LIVE: "sk_live_" + "0".repeat(16),
  STRIPE_WEBHOOK_SECRET_TEST: "synthetic-test-signing-secret",
  STRIPE_WEBHOOK_SECRET_LIVE: "synthetic-live-signing-secret",
  SUPABASE_URL: "https://database.example",
  SUPABASE_SERVICE_ROLE_KEY: "synthetic-service-key"
};

function sandbox(t, overrides = {}) {
  const previous = Object.fromEntries(Object.keys(defaults).map(key => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  Object.assign(process.env, defaults, overrides);
  const calls = [];
  globalThis.fetch = async (...args) => {
    calls.push(args);
    throw new Error("Unexpected transport call in isolated Stripe safety test");
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  return calls;
}

function signedEvent(overrides = {}, { mode = "test", base64 = false, validSignature = true } = {}) {
  const body = JSON.stringify({
    id: "evt_synthetic",
    object: "event",
    type: "checkout.session.expired",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    data: { object: { id: "cs_synthetic" } },
    ...overrides
  });
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = createHmac("sha256", defaults[mode === "live" ? "STRIPE_WEBHOOK_SECRET_LIVE" : "STRIPE_WEBHOOK_SECRET_TEST"])
    .update(`${timestamp}.`).update(body).digest("hex");
  return {
    httpMethod: "POST",
    headers: { "stripe-signature": `t=${timestamp},v1=${validSignature ? digest : "invalid"}` },
    body: base64 ? Buffer.from(body).toString("base64") : body,
    isBase64Encoded: base64
  };
}

function mockRpc(calls, { claimed = true } = {}) {
  globalThis.fetch = async (url, options) => {
    assert.match(url, /^https:\/\/database\.example\/rest\/v1\/rpc\//);
    assert.equal(options.method, "POST");
    const name = url.split("/").at(-1);
    assert.ok(["claim_stripe_event", "mark_checkout_failed", "complete_stripe_event"].includes(name));
    calls.push({ name, body: JSON.parse(options.body) });
    return new Response(JSON.stringify(name === "claim_stripe_event" ? claimed : null), { status: 200 });
  };
}

for (const prefix of ["sk_live_", "rk_live_"]) {
  test("runtime rejects " + prefix + " in the test variable before POST transport", async t => {
    const calls = sandbox(t, { STRIPE_SECRET_KEY_TEST: prefix + "0000000000000000" });
    await assert.rejects(stripeRequest("/checkout/sessions", { method: "POST", params: { mode: "payment" } }),
      { message: "stripe_mode_key_mismatch", statusCode: 503 });
    assert.deepEqual(calls, []);
  });
}

test("runtime rejects test key under live mode before transport", async t => {
  const calls = sandbox(t, {
    STRIPE_MODE: "live", STATECOURSE_LIVE_PAYMENTS_ENABLED: "true",
    STRIPE_SECRET_KEY_LIVE: defaults.STRIPE_SECRET_KEY_TEST
  });
  await assert.rejects(stripeRequest("/checkout/sessions", { method: "POST" }),
    { message: "stripe_mode_key_mismatch", statusCode: 503 });
  assert.deepEqual(calls, []);
});

test("the existing live-payments-off gate remains authoritative", async t => {
  const calls = sandbox(t, { STRIPE_MODE: "live" });
  await assert.rejects(stripeRequest("/checkout/sessions", { method: "POST" }),
    { message: "live_payments_disabled", statusCode: 503 });
  assert.deepEqual(calls, []);
});

for (const key of ["pk_test_" + "0".repeat(16), "unknown", "sk_test_", "sk_test_" + "0".repeat(16) + "\n"]) {
  test("runtime rejects malformed or non-secret API key " + JSON.stringify(key.slice(0, 9)), async t => {
    const calls = sandbox(t, { STRIPE_SECRET_KEY_TEST: key });
    await assert.rejects(stripeRequest("/checkout/sessions", { method: "POST" }),
      { message: "stripe_secret_key_invalid", statusCode: 503 });
    assert.deepEqual(calls, []);
  });
}

for (const prefix of ["sk_test_", "rk_test_"]) {
  test("runtime preserves correctly scoped " + prefix + " keys and request idempotency", async t => {
    sandbox(t, { STRIPE_SECRET_KEY_TEST: prefix + "0000000000000000" });
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify({ id: "cs_synthetic" }), { status: 200 });
    };
    assert.equal(stripeEnvironment().mode, "test");
    assert.deepEqual(await stripeRequest("/checkout/sessions", {
      method: "POST", params: { mode: "payment" }, idempotencyKey: "synthetic-attempt"
    }), { id: "cs_synthetic" });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.stripe.com/v1/checkout/sessions");
    assert.equal(calls[0].options.headers["idempotency-key"], "synthetic-attempt");
    assert.equal(calls[0].options.body.get("mode"), "payment");
  });
}

test("signed live event in test mode is refused before claim or any database write", async t => {
  const calls = sandbox(t);
  const result = await handler(signedEvent({ livemode: true }));
  assert.equal(result.statusCode, 400);
  assert.deepEqual(JSON.parse(result.body), { error: "stripe_event_mode_mismatch" });
  assert.deepEqual(calls, []);
});

test("signed test event in live mode is refused before claim", async t => {
  const calls = sandbox(t, { STRIPE_MODE: "live", STATECOURSE_LIVE_PAYMENTS_ENABLED: "true" });
  const result = await handler(signedEvent({}, { mode: "live" }));
  assert.equal(result.statusCode, 400);
  assert.deepEqual(JSON.parse(result.body), { error: "stripe_event_mode_mismatch" });
  assert.deepEqual(calls, []);
});

for (const livemode of [undefined, null, "false", 0]) {
  test("webhook requires explicit boolean mode, not " + String(livemode), async t => {
    const calls = sandbox(t);
    const result = await handler(signedEvent({ livemode }));
    assert.equal(result.statusCode, 400);
    assert.deepEqual(JSON.parse(result.body), { error: "stripe_event_mode_required" });
    assert.deepEqual(calls, []);
  });
}

test("signature validation still happens before trusting the claimed mode", async t => {
  const calls = sandbox(t);
  const result = await handler(signedEvent({ livemode: true }, { validSignature: false }));
  assert.equal(result.statusCode, 400);
  assert.deepEqual(JSON.parse(result.body), { error: "invalid_signature" });
  assert.deepEqual(calls, []);
});

for (const base64 of [false, true]) {
  test("valid signed test event preserves claim, processing and completion, base64=" + base64, async t => {
    const calls = sandbox(t);
    mockRpc(calls);
    const result = await handler(signedEvent({}, { base64 }));
    assert.equal(result.statusCode, 200);
    assert.deepEqual(JSON.parse(result.body), { received: true });
    assert.deepEqual(calls.map(call => call.name), ["claim_stripe_event", "mark_checkout_failed", "complete_stripe_event"]);
    assert.equal(calls[0].body.p_mode, "test");
    assert.deepEqual(calls[1].body, { p_checkout_session_id: "cs_synthetic", p_status: "expired" });
  });
}

test("duplicate correctly scoped event still exits after the original atomic claim", async t => {
  const calls = sandbox(t);
  mockRpc(calls, { claimed: false });
  const result = await handler(signedEvent());
  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), { received: true, duplicate: true });
  assert.deepEqual(calls.map(call => call.name), ["claim_stripe_event"]);
});

test("matching signed live-mode fixture preserves existing handler compatibility without external calls", async t => {
  const calls = sandbox(t, { STRIPE_MODE: "live", STATECOURSE_LIVE_PAYMENTS_ENABLED: "true" });
  mockRpc(calls);
  const result = await handler(signedEvent({ livemode: true }, { mode: "live" }));
  assert.equal(result.statusCode, 200);
  assert.equal(calls[0].body.p_mode, "live");
  assert.deepEqual(calls.map(call => call.name), ["claim_stripe_event", "mark_checkout_failed", "complete_stripe_event"]);
});
