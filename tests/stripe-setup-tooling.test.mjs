import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getCourseCatalog } from "../config/course-catalog.mjs";
import { HANDLED_STRIPE_EVENTS } from '../lib/stripe-contract.mjs';

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

  assert.match(setup,/import \{ HANDLED_STRIPE_EVENTS, stripeSecretKeyMode \} from "\.\.\/lib\/stripe-contract\.mjs"/);
  assert.match(setup,/const WEBHOOK_EVENTS = HANDLED_STRIPE_EVENTS;/);
  const declared = HANDLED_STRIPE_EVENTS;
  const handled = [...handler.matchAll(/case "((?:checkout|refund|payment_intent|charge)\.[a-z_.]+)":/g)].map((match) => match[1]);

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
    /* The EIN shape is a heuristic, not a signature, and it collides with ordinary numbering in
       third-party documents. The Texas Secretary of State's own form-304 instructions print
       "The FEIN is a 9-digit number (e.g., 12-3456789)" — the IRS's placeholder, in a government
       document archived here byte-for-byte. Archived primary sources are therefore exempt from
       THIS pattern only; every key signature below stays in force everywhere, including there.
       The exemption is safe because those trees hold nothing StateCourse authored: each file is
       pinned by sha256 in its catalog and re-verified, so our secret cannot appear in one without
       breaking a hash that a test already checks. */
    { name: "EIN", re: /\b\d{2}-\d{7}\b/, exemptArchivedSources: true }
  ];
  /* Trees holding third-party official documents retrieved verbatim, never StateCourse code. */
  const archivedSourceTrees = [
    path.join("texas", "trec-sources"),
    path.join("texas", "tx-law-of-contracts-30-v1", "sources"),
  ];
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!/\.(mjs|js|ts|json|md|sql|html|css|sh|yml|yaml|txt)$/.test(entry.name)) continue;
      if (full.endsWith(path.join("tests", "stripe-setup-tooling.test.mjs"))) continue;
      const text = fs.readFileSync(full, "utf8");
      const relative = path.relative(root, full);
      const isArchivedSource = archivedSourceTrees.some((tree) => relative.startsWith(tree + path.sep));
      for (const { name, re, exemptArchivedSources } of patterns) {
        if (exemptArchivedSources && isArchivedSource) continue;
        if (re.test(text)) offenders.push(`${relative}: ${name}`);
      }
    }
  };
  walk(root);
  assert.deepEqual(offenders, [], "secrets and tax identifiers must never be committed");
});

/**
 * A COURSE CAN ENTER THE PAYMENT CATALOGUE WITHOUT ANYTHING IN STRIPE BEHIND IT.
 *
 * The sandbox was brought up on 19-20 August and docs/payments/stripe-sandbox-state.md recorded a
 * product and a price for every catalogue course at that moment. Michigan was added to the
 * catalogue afterwards and got neither, while the document went on saying "All nine catalogue
 * courses have a product and a price" — a sentence that was true when written and had quietly
 * stopped being true.
 *
 * Nothing broke, because nothing is sellable: every course is submission_draft with no price, so
 * checkout refuses on the approval gate long before it would reach Stripe. That is exactly why it
 * went unnoticed, and exactly why it would surface at the worst moment — the first time somebody
 * priced and approved a course whose product had never been created.
 *
 * This compares the payment catalogue against the recorded Stripe inventory and names the courses
 * that have no product. It does not require every course to have one: a course with no regulator
 * approval has no business having a price. It requires the DOCUMENT to be honest about which ones
 * are missing, so the gap is a decision on the page rather than a surprise at the till.
 */
test("the recorded Stripe inventory accounts for every course in the payment catalogue", () => {
  const doc = fs.readFileSync(path.join(root, "docs/payments/stripe-sandbox-state.md"), "utf8");
  const catalogue = getCourseCatalog().map((course) => course.id);
  assert.ok(catalogue.length > 0, "the payment catalogue is empty");

  /* A course counts as accounted for if the document either records a Stripe product id for it or
     names it in the "no Stripe product" list below the table. */
  const withProduct = catalogue.filter((id) => new RegExp(`\\|\\s*${id}\\s*\\|[^\\n]*prod_[A-Za-z0-9]+`).test(doc));
  const declaredMissing = catalogue.filter((id) => new RegExp(`^\\s*[-*]\\s*\`${id}\``, "m").test(doc));

  const unaccounted = catalogue.filter((id) => !withProduct.includes(id) && !declaredMissing.includes(id));
  assert.deepEqual(
    unaccounted,
    [],
    "these catalogue courses have no Stripe product recorded and are not declared as missing in "
      + "docs/payments/stripe-sandbox-state.md:\n  " + unaccounted.join("\n  ")
      + "\nEither create the product with scripts/stripe-setup.mjs and record it, or list the course "
      + "under 'Catalogue courses with no Stripe product' so the omission is deliberate.",
  );

  /* The document must not claim a count it no longer meets. */
  const claimed = /All (nine|ten|eleven|twelve|\d+) catalogue courses have a product and a price/.exec(doc);
  if (claimed) {
    const words = { nine: 9, ten: 10, eleven: 11, twelve: 12 };
    const n = words[claimed[1]] ?? Number(claimed[1]);
    assert.equal(withProduct.length, n, `the document claims ${claimed[1]} courses have a product; ${withProduct.length} do`);
  }
});
