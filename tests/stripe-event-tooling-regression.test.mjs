import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { HANDLED_STRIPE_EVENTS } from "../lib/stripe-contract.mjs";

// Execute the actual CLI source in a separate, network-free VM. Only the catalog,
// process/environment and Stripe transport are synthetic. No host environment
// credentials, real courses, live API calls, approvals or payments are used.
const worker = String.raw`
import { readFileSync } from "node:fs";
import vm from "node:vm";
const input = JSON.parse(readFileSync(0, "utf8"));
const calls = [], output = [];
let exitCode = 0;
const exit = new Error("synthetic_process_exit");
const context = vm.createContext({
  URL,
  URLSearchParams,
  process: {
    argv: ["node", input.script, ...input.args],
    env: {
      STRIPE_MODE: "test",
      STATECOURSE_LIVE_PAYMENTS_ENABLED: "false",
      STRIPE_SECRET_KEY_TEST: "sk_test_" + "0".repeat(16),
      STRIPE_WEBHOOK_SECRET_TEST: "synthetic-not-a-signing-secret",
      STATECOURSE_BASE_URL: "https://statecourse.example",
      STATECOURSE_ADMIN_API_TOKEN: "synthetic-not-a-token",
      ...input.env
    },
    exit(code) { exitCode = code; throw exit; }
  },
  console: {
    log(...args) { output.push(args.join(" ")); },
    error(...args) { output.push(args.join(" ")); }
  },
  async fetch(url, options = {}) {
    const method = options.method || "GET";
    const body = options.body ? [...options.body.entries()] : [];
    calls.push({ url, method, body });
    if (!String(url).startsWith("https://api.stripe.com/v1/webhook_endpoints")) {
      throw new Error("Unexpected synthetic transport call: " + url);
    }
    let data;
    if (method === "GET") data = { data: input.endpoints };
    else if (method === "POST") data = { id: "we_synthetic", secret: "synthetic-not-a-secret" };
    else throw new Error("Unexpected method");
    return { ok: true, status: 200, text: async () => JSON.stringify(data) };
  }
});
const catalog = new vm.SourceTextModule(
  "export const getCourseCatalog = () => []; export const evaluateCheckoutEligibility = () => ({allowed:false, reason:'synthetic_catalog'});",
  { context }
);
const contract = new vm.SourceTextModule(input.contract, { context });
const script = new vm.SourceTextModule(input.source, { context, identifier: input.script });
await script.link((specifier) => {
  if (specifier === "../config/course-catalog.mjs") return catalog;
  if (specifier === "../lib/stripe-contract.mjs") return contract;
  throw new Error("Unexpected import: " + specifier);
});
try { await script.evaluate(); } catch (error) { if (error !== exit) throw error; }
process.stdout.write(JSON.stringify({ calls, output, exitCode }));
`;

const endpoint = (enabled_events = [...HANDLED_STRIPE_EVENTS]) => ({
  id: "we_existing_synthetic",
  url: "https://statecourse.example/api/stripe/webhook",
  status: "enabled",
  enabled_events
});

async function run(script, { args = [], endpoints = [endpoint()], env = {} } = {}) {
  const [source, contract] = await Promise.all([
    readFile(new URL("../scripts/" + script, import.meta.url), "utf8"),
    readFile(new URL("../lib/stripe-contract.mjs", import.meta.url), "utf8")
  ]);
  const data = execFileSync(process.execPath,
    ["--experimental-vm-modules", "--input-type=module", "--eval", worker], {
      input: JSON.stringify({ script, source, contract, args, endpoints, env }),
      encoding: "utf8",
      timeout: 15000,
      env: { NODE_NO_WARNINGS: "1" },
      maxBuffer: 1024 * 1024
    });
  return JSON.parse(data);
}

function postedEvents(result) {
  const posts = result.calls.filter(call => call.method === "POST");
  assert.equal(posts.length, 1);
  const events = posts[0].body.filter(([key]) => /^enabled_events\[\d+\]$/.test(key)).map(([, value]) => value);
  assert.deepEqual(events, [...HANDLED_STRIPE_EVENTS]);
  assert.equal(new Set(events).size, events.length);
  assert.equal(events.length, 10);
  return posts[0];
}

test("setup creates the endpoint with all ten exact shared handler events", async () => {
  const result = await run("stripe-setup.mjs", {
    args: ["--webhook", endpoint().url], endpoints: []
  });
  assert.equal(result.exitCode, 0);
  const post = postedEvents(result);
  assert.equal(post.url, "https://api.stripe.com/v1/webhook_endpoints");
  assert.equal(new Map(post.body).get("url"), endpoint().url);
});

test("setup reconciliation cannot shrink an existing endpoint to the legacy seven", async () => {
  const result = await run("stripe-setup.mjs", { args: ["--webhook", endpoint().url] });
  assert.equal(result.exitCode, 0);
  assert.equal(postedEvents(result).url,
    "https://api.stripe.com/v1/webhook_endpoints/we_existing_synthetic");
});

for (const missing of ["payment_intent.succeeded", "payment_intent.payment_failed", "charge.refunded"]) {
  test("preflight refuses an endpoint missing " + missing, async () => {
    const result = await run("stripe-preflight.mjs", {
      args: ["--check-stripe"],
      endpoints: [endpoint(HANDLED_STRIPE_EVENTS.filter(event => event !== missing))]
    });
    assert.equal(result.exitCode, 1);
    assert.ok(result.output.some(line => line.includes("is missing: " + missing)));
    assert.ok(result.calls.every(call => call.method === "GET"), "preflight must remain read-only");
  });
}

test("preflight accepts the complete shared contract and remains read-only", async () => {
  const result = await run("stripe-preflight.mjs", { args: ["--check-stripe"] });
  assert.equal(result.exitCode, 0);
  assert.ok(result.output.some(line => line.includes("No problems found")));
  assert.ok(result.calls.every(call => call.method === "GET"));
});

test("preflight retains existing Stripe wildcard behavior", async () => {
  const result = await run("stripe-preflight.mjs", {
    args: ["--check-stripe"], endpoints: [endpoint(["*"])]
  });
  assert.equal(result.exitCode, 0);
  assert.ok(result.calls.every(call => call.method === "GET"));
});

test("setup dry-run with a webhook performs no transport calls", async () => {
  const result = await run("stripe-setup.mjs", {
    args: ["--dry-run", "--webhook", endpoint().url]
  });
  assert.equal(result.exitCode, 0);
  assert.deepEqual(result.calls, []);
});

test("preflight refuses a disabled StateCourse webhook even with all ten events", async () => {
  const result = await run("stripe-preflight.mjs", {
    args: ["--check-stripe"], endpoints: [{ ...endpoint(), status: "disabled" }]
  });
  assert.equal(result.exitCode, 1);
  assert.ok(result.output.some(line => line.includes("StateCourse webhook endpoint is disabled")));
});

for (const url of ["https://other.example/api/stripe/webhook", "https://statecourse.example/api/another-handler"]) {
  test("preflight cannot substitute unrelated endpoint " + url, async () => {
    const result = await run("stripe-preflight.mjs", {
      args: ["--check-stripe"], endpoints: [{ ...endpoint(), url }]
    });
    assert.equal(result.exitCode, 1);
    assert.ok(result.output.some(line => line.includes("No StateCourse webhook endpoint is registered")));
  });
}

test("preflight preserves the existing same-site Netlify function URL", async () => {
  const result = await run("stripe-preflight.mjs", {
    args: ["--check-stripe"],
    endpoints: [{ ...endpoint(), url: "https://statecourse.example/.netlify/functions/stripe-webhook" }]
  });
  assert.equal(result.exitCode, 0);
});

test("preflight ignores other applications' event contracts when StateCourse is valid", async () => {
  const result = await run("stripe-preflight.mjs", {
    args: ["--check-stripe"],
    endpoints: [endpoint(), { ...endpoint([]), url: "https://other.example/hook", status: "disabled" }]
  });
  assert.equal(result.exitCode, 0);
});

test("a valid unrelated endpoint cannot compensate for disabled StateCourse delivery", async () => {
  const result = await run("stripe-preflight.mjs", {
    args: ["--check-stripe"],
    endpoints: [{ ...endpoint(), status: "disabled" }, { ...endpoint(), url: "https://other.example/hook" }]
  });
  assert.equal(result.exitCode, 1);
});

for (const key of ["sk_live_", "rk_live_", "pk_test_"].map(prefix => prefix + "0".repeat(16))) {
  test("preflight never contacts Stripe with incompatible selected key " + key.slice(0, 8), async () => {
    const result = await run("stripe-preflight.mjs", {
      args: ["--check-stripe"], env: { STRIPE_SECRET_KEY_TEST: key }
    });
    assert.equal(result.exitCode, 1);
    assert.deepEqual(result.calls, []);
  });
}

test("preflight refuses invalid base URL without contacting Stripe", async () => {
  const result = await run("stripe-preflight.mjs", {
    args: ["--check-stripe"], env: { STATECOURSE_BASE_URL: "not-a-url" }
  });
  assert.equal(result.exitCode, 1);
  assert.deepEqual(result.calls, []);
});

for (const prefix of ["sk_live_", "rk_live_", "pk_test_"]) {
  test("setup blocks " + prefix + " in test mode before creating any Stripe objects", async () => {
    const result = await run("stripe-setup.mjs", {
      args: ["--webhook", endpoint().url],
      env: { STRIPE_SECRET_KEY_TEST: prefix + "0".repeat(16) }
    });
    assert.equal(result.exitCode, 1);
    assert.deepEqual(result.calls, []);
  });
}

test("setup preserves valid test restricted-key support", async () => {
  const result = await run("stripe-setup.mjs", {
    args: ["--webhook", endpoint().url],
    env: { STRIPE_SECRET_KEY_TEST: "rk_test_" + "0".repeat(16) }
  });
  assert.equal(result.exitCode, 0);
  postedEvents(result);
});

test("setup refuses --live with a test restricted key before transport", async () => {
  const result = await run("stripe-setup.mjs", {
    args: ["--live", "--webhook", endpoint().url],
    env: { STRIPE_SECRET_KEY_LIVE: "rk_test_" + "0".repeat(16) }
  });
  assert.equal(result.exitCode, 1);
  assert.deepEqual(result.calls, []);
});
