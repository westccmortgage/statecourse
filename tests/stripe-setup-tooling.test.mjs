import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getCourseCatalog } from "../config/course-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* Run preflight in a child process with an explicit environment, because the whole point of
   the script is that it reads process.env, and importing it would read this one. */
function preflight(env = {}) {
  const clean = { PATH: process.env.PATH, HOME: process.env.HOME };
  try {
    const stdout = execFileSync(process.execPath, ["scripts/stripe-preflight.mjs"], {
      cwd: root, env: { ...clean, ...env }, encoding: "utf8"
    });
    return { code: 0, stdout };
  } catch (error) {
    return { code: error.status ?? 1, stdout: `${error.stdout || ""}${error.stderr || ""}` };
  }
}

test("every catalogue course exposes the env key its variables are actually built from", () => {
  /* The tooling prints variable names for an operator to set. If it derived them from the
     course id it would print STATECOURSE_PRICE_CA_REAL_ESTATE_PRINCIPLES_45_..., which the
     runtime never reads. One source for the suffix, asserted here. */
  for (const course of getCourseCatalog()) {
    assert.ok(course.envKey, `${course.id} has no envKey`);
    assert.match(course.envKey, /^[A-Z0-9_]+$/, `${course.id} envKey is not an env-safe token`);
  }
  const keys = getCourseCatalog().map((course) => course.envKey);
  assert.equal(new Set(keys).size, keys.length, "two courses share an env key and would share a price");
});

test("the setup script's webhook events are exactly the ones the handler implements", () => {
  const setup = fs.readFileSync(path.join(root, "scripts/stripe-setup.mjs"), "utf8");
  const handler = fs.readFileSync(path.join(root, "netlify/functions/stripe-webhook.mjs"), "utf8");

  const declared = [...setup.matchAll(/"((?:checkout|refund)\.[a-z_.]+)"/g)].map((match) => match[1]);
  const handled = [...handler.matchAll(/case "((?:checkout|refund)\.[a-z_.]+)":/g)].map((match) => match[1]);

  assert.ok(declared.length > 0 && handled.length > 0);
  assert.deepEqual([...new Set(declared)].sort(), [...new Set(handled)].sort(),
    "registering an event nothing handles wastes deliveries; failing to register one the handler needs loses payments");
});

test("preflight fails loudly on an unconfigured environment rather than looking fine", () => {
  const result = preflight({});
  assert.equal(result.code, 1);
  assert.match(result.stdout, /STRIPE_SECRET_KEY_TEST is not set/);
  assert.match(result.stdout, /STRIPE_WEBHOOK_SECRET_TEST is not set/);
  assert.match(result.stdout, /0 of \d+ courses would accept a payment/);
});

test("preflight catches a live key sitting in the test variable", () => {
  const result = preflight({
    STRIPE_SECRET_KEY_TEST: "sk_live_0000000000000000",
    STRIPE_WEBHOOK_SECRET_TEST: "whsec_x",
    STATECOURSE_BASE_URL: "https://example.test"
  });
  assert.equal(result.code, 1);
  assert.match(result.stdout, /holds a LIVE key/);
});

test("preflight refuses a live environment that also allows draft courses", () => {
  const result = preflight({
    STRIPE_MODE: "live",
    STRIPE_SECRET_KEY_LIVE: "sk_live_0000000000000000",
    STRIPE_WEBHOOK_SECRET_LIVE: "whsec_y",
    STATECOURSE_BASE_URL: "https://example.test",
    STATECOURSE_LIVE_PAYMENTS_ENABLED: "true",
    STATECOURSE_SANDBOX_ALLOW_DRAFT_COURSES: "true"
  });
  assert.equal(result.code, 1);
  assert.match(result.stdout, /SANDBOX_ALLOW_DRAFT_COURSES must never be true in a live environment/);
});

test("preflight refuses enrollment that leads approval", () => {
  /* This is the regulatory coupling, not a payments one: a course whose enrollment is on
     while its approval status is still a draft is the exact failure the project forbids. */
  const result = preflight({
    STRIPE_SECRET_KEY_TEST: "sk_test_0000000000000000",
    STRIPE_WEBHOOK_SECRET_TEST: "whsec_x",
    STATECOURSE_BASE_URL: "https://example.test",
    STATECOURSE_CA_PRINCIPLES_45_ENROLLMENT_ENABLED: "true"
  });
  assert.equal(result.code, 1);
  assert.match(result.stdout, /has enrollment enabled but is not approved/);
});

test("a fully configured, approved, priced course reports as sellable and nothing else does", () => {
  const result = preflight({
    STRIPE_MODE: "live",
    STRIPE_SECRET_KEY_LIVE: "sk_live_0000000000000000",
    STRIPE_WEBHOOK_SECRET_LIVE: "whsec_y",
    STATECOURSE_BASE_URL: "https://example.test",
    STATECOURSE_ADMIN_API_TOKEN: "x".repeat(40),
    STATECOURSE_LIVE_PAYMENTS_ENABLED: "true",
    STATECOURSE_CA_PRINCIPLES_45_APPROVAL_STATUS: "approved",
    STATECOURSE_CA_PRINCIPLES_45_ENROLLMENT_ENABLED: "true",
    STATECOURSE_PRICE_CA_PRINCIPLES_45_LIVE_CENTS: "19900"
  });
  assert.equal(result.code, 0, result.stdout);
  assert.match(result.stdout, /ca-real-estate-principles-45.*ALLOWED — LIVE SALE/);
  assert.match(result.stdout, /1 of \d+ courses would accept a payment in live mode/);
});

test("the setup script never prints a secret key and never enables a course", () => {
  const setup = fs.readFileSync(path.join(root, "scripts/stripe-setup.mjs"), "utf8");
  /* It may read the key, and it may print the webhook signing secret Stripe returns once at
     creation — there is no other way to obtain that one. It must not echo the API key. */
  assert.doesNotMatch(setup, /console\.log\([^)]*secretKey/, "the setup script must never print the API key");
  assert.doesNotMatch(setup, /ENROLLMENT_ENABLED\s*=\s*["']true/, "the setup script must not enable enrollment");
  assert.doesNotMatch(setup, /APPROVAL_STATUS\s*=\s*["']approved/, "the setup script must not approve a course");
  assert.match(setup, /--live/, "live mode must be an explicit flag");
});

test("no Stripe key, price, or account identifier is committed anywhere in the repository", () => {
  const skip = new Set(["node_modules", ".git", "dist", ".next", ".wrangler", "coverage"]);
  const patterns = [
    { name: "live secret key", re: /sk_live_[A-Za-z0-9]{16,}/ },
    { name: "test secret key", re: /sk_test_[A-Za-z0-9]{16,}/ },
    { name: "restricted key", re: /rk_(?:live|test)_[A-Za-z0-9]{16,}/ },
    { name: "webhook signing secret", re: /whsec_[A-Za-z0-9]{16,}/ },
    { name: "EIN", re: /\b\d{2}-\d{7}\b/ }
  ];
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!/\.(mjs|js|ts|json|md|sql|html|css|sh|yml|yaml|txt)$/.test(entry.name)) continue;
      if (full.endsWith(path.join("tests", "stripe-setup-tooling.test.mjs"))) continue;
      let text = fs.readFileSync(full, "utf8");
      /* The Texas Secretary of State's official Form 304 instructions print 12-3456789 as a
         specimen format, not as StateCourse's tax identifier. Keep the held source byte-exact and
         remove only that named public specimen from this secret scan. */
      if (path.relative(root, full) === "texas/trec-sources/articles/tx-sos-form-304-instructions-2026-09-02.html") {
        text = text.replace(/\b12-3456789\b/g, "");
      }
      for (const { name, re } of patterns) {
        if (re.test(text)) offenders.push(`${path.relative(root, full)}: ${name}`);
      }
    }
  };
  walk(root);
  assert.deepEqual(offenders, [], "secrets and tax identifiers must never be committed");
});
