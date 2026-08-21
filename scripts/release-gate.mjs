#!/usr/bin/env node
/*
 * The release gate.
 *
 * Nothing may be called PRINT_READY or PRODUCTION_READY except by this script returning zero.
 * It is not a checklist a person ticks and not a test that reports "almost": every check below
 * either passes or blocks, and a blocked gate names the file and the reason.
 *
 * TWO GATES, AND WHY THEY ARE SEPARATE
 *
 *   PRINT_READY      — the filing. Documents, policy, RE forms, Terms, disclosure, signatures
 *                      and approval gates. This is what goes in an envelope to the Department
 *                      of Real Estate.
 *
 *   PRODUCTION_READY — PRINT_READY, plus everything that moves money: Stripe checkout, package
 *                      fan-out, webhooks, refund reconciliation, idempotency, and a fully green
 *                      test suite.
 *
 * They are separate because they fail for different reasons and are fixed by different work. A
 * filing can be complete while payments are not live; payments must never be live while the
 * filing is incomplete. PRODUCTION_READY therefore includes PRINT_READY and never the reverse.
 *
 * Usage:  node scripts/release-gate.mjs [--gate print|production] [--course <id>] [--json]
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRICING } from "../config/california/submission-facts.mjs";
import {
  COMPLIMENTARY_DISCLOSURE,
  getCourse,
  getPackage,
  getPackageCatalog,
  packageAllocation,
} from "../config/course-catalog.mjs";
import { REFUND_POLICY_CLAUSES, REFUND_POLICY_TEXT, REFUND_POLICY_VERSION } from "../lib/refund-policy.mjs";
import { CALENDAR_COVERED_YEARS, unresolvedHolidaysFor } from "../config/california/business-day-calendar.mjs";
import { HANDLED_STRIPE_EVENTS } from "../lib/stripe-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const GATE = flag("gate", "production");
const AS_JSON = args.includes("--json");

const read = (relative) => {
  const full = path.join(root, relative);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : null;
};

/* Markdown, HTML and a PDF's extracted text each carry the same sentence differently.
   Comparing words rather than bytes is what lets one policy be checked in four renderings. */
const words = (text) =>
  String(text)
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll(/&#8220;|&#8221;|[“”]/g, '"')
    .replaceAll(/[‘’]/g, "'")
    .replaceAll(/[*_>]/g, "")
    .replaceAll(/\s+/g, " ")
    .replaceAll(/\s+([.,;:])/g, "$1")
    .trim();

const results = [];
const check = (gate, id, title, fn) => {
  try {
    const detail = fn();
    results.push({ gate, id, title, status: "pass", detail: detail ?? null });
  } catch (error) {
    results.push({ gate, id, title, status: "block", detail: error.message });
  }
};
const require_ = (condition, message) => {
  if (!condition) throw new Error(message);
};

/*
 * The numbered directories under california/submission are not all course packets:
 * 00_administrative holds the entity, instructor and fee material that is filed once rather
 * than per course. A course packet is one that carries an RE 313 General Information Page,
 * because RE 313 is per course by definition.
 */
const SUBMISSION_DIRECTORIES = () => {
  const dir = path.join(root, "california/submission");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d\d_/.test(entry.name))
    .map((entry) => entry.name);
};

const COURSE_PACKETS = () =>
  SUBMISSION_DIRECTORIES().filter((name) =>
    fs.existsSync(path.join(root, "california/submission", name, "06-re313-general-information-page.md")),
  );

/* ═════════════════════════════════════ PRINT_READY ═════════════════════════════════════ */

check("print", 1, "policy_version is one value everywhere it appears", () => {
  require_(REFUND_POLICY_VERSION === PRICING.refundPolicy.version, "the engine and the facts file disagree on the version");
  const californiaCourses = ["ca-real-estate-principles-45", "ca-real-estate-practice-45", "ca-mortgage-loan-brokering-lending-45"];
  for (const id of californiaCourses) {
    const course = getCourse(id);
    require_(course, `${id} is not in the catalog`);
    require_(course.versions.refundPolicy === REFUND_POLICY_VERSION, `${id} refund version is ${course.versions.refundPolicy}`);
    require_(course.versions.cancellationPolicy === REFUND_POLICY_VERSION, `${id} cancellation version is ${course.versions.cancellationPolicy}`);
  }
  return `version ${REFUND_POLICY_VERSION} on ${californiaCourses.length} courses`;
});

check("print", 2, "the canonical policy text is identical in every rendering", () => {
  const canonical = words(REFUND_POLICY_TEXT);
  require_(canonical.length > 200, "the canonical policy text is suspiciously short");
  for (const id of ["ca-real-estate-principles-45", "ca-real-estate-practice-45", "ca-mortgage-loan-brokering-lending-45"]) {
    require_(words(getCourse(id).policyText.refund) === canonical, `${id} serves a different policy text`);
  }
  /* Every clause must be a real sentence, not an empty string that trivially matches. */
  for (const [clause, text] of Object.entries(REFUND_POLICY_CLAUSES)) {
    require_(words(text).length > 40, `the ${clause} clause is empty or truncated`);
  }
  return `${Object.keys(REFUND_POLICY_CLAUSES).length} clauses, ${canonical.length} characters`;
});

check("print", 3, "RE 313 carries the policy, its version, and no undecided field", () => {
  const packets = COURSE_PACKETS();
  require_(packets.length > 0, "no course packets have been generated");
  const canonical = words(REFUND_POLICY_TEXT);
  for (const packet of packets) {
    const relative = `california/submission/${packet}/06-re313-general-information-page.md`;
    const text = read(relative);
    require_(text, `${relative} is missing`);
    require_(words(text).includes(canonical), `${relative} does not carry the policy verbatim`);
    require_(text.includes(REFUND_POLICY_VERSION), `${relative} does not name the policy version`);
    require_(!/no policy has been decided|enter at signing/i.test(text), `${relative} still marks the refund field undecided`);
    require_(!/DRE requires seven|Department of Real Estate requires seven/i.test(text), `${relative} attributes the seven-day count to DRE`);
  }
  return `${packets.length} RE 313 sheets`;
});

check("print", 4, "the published Terms carry every clause verbatim", () => {
  const terms = read("public/statecourse/terms/index.html");
  require_(terms, "the Terms page is missing");
  const normalised = words(terms);
  for (const [clause, text] of Object.entries(REFUND_POLICY_CLAUSES)) {
    require_(normalised.includes(words(text)), `the Terms do not carry the ${clause} clause verbatim`);
  }
  require_(normalised.includes(REFUND_POLICY_VERSION), "the Terms do not name the policy version");
  return "all clauses present";
});

check("print", 5, "the policy is disclosed before checkout, not merely named", () => {
  const enrollment = read("public/statecourse/enrollment.js");
  const config = read("netlify/functions/payment-config.mjs");
  require_(enrollment && config, "the enrollment flow or the config endpoint is missing");
  require_(/policyText\?\.refund/.test(enrollment), "the refund acknowledgment does not render the policy text");
  require_(/policyText\?\.cancellation/.test(enrollment), "the cancellation acknowledgment does not render the policy text");
  require_(/ack-policy/.test(enrollment), "there is no element to display the policy in");
  require_(/policyText: course\.policyText/.test(config), "the config endpoint does not serve the policy text");
  const styles = read("public/statecourse/styles.css");
  require_(styles && /\.ack-policy/.test(styles), "the policy block has no styling and may render collapsed");
  return "policy text rendered above its acknowledgment";
});

check("print", 6, "checkout persists a per-course allocation and refuses a stale acknowledgment", () => {
  const checkout = read("netlify/functions/create-checkout.mjs");
  require_(checkout, "create-checkout.mjs is missing");
  require_(/checkout_course_allocations/.test(checkout), "checkout does not persist an allocation");
  require_(/missing_or_stale_/.test(checkout), "checkout does not reject a stale acknowledgment version");
  require_(/checkoutMetadata\(/.test(checkout), "checkout does not build its Stripe metadata from the contract");
  const migration = read("database/008_california_refund_policy.sql");
  require_(migration && /create table if not exists checkout_course_allocations/.test(migration), "the allocation table is not created");
  return "allocation written before the student reaches Stripe";
});

check("print", 7, "the refund calculation is the policy's, and refuses rather than guesses", () => {
  const endpoint = read("netlify/functions/request-refund.mjs");
  const contract = read("lib/stripe-contract.mjs");
  require_(endpoint && contract, "the refund path is missing");
  require_(/evaluateRefund/.test(endpoint), "the endpoint does not call the policy");
  require_(/california_refund_basis/.test(endpoint), "the endpoint does not read the refund basis");
  require_(/refund_progress_unknown_for_/.test(endpoint), "the endpoint does not stop on unknown progress");
  require_(!/input\.policyReviewApproved !== true/.test(endpoint), "the superseded manual approval gate is back");
  require_(/exceeds_policy_entitlement/.test(contract), "nothing refuses to exceed the entitlement");
  require_(/no_refund_due_under_policy/.test(contract), "nothing refuses a refund the policy denies");
  require_(!/"destination"|refund_destination/.test(contract + endpoint), "a refund is sent somewhere other than the original payment method");
  /* The business-day calendar must cover the years a window can fall in. */
  require_(CALENDAR_COVERED_YEARS.length > 0, "the business-day calendar covers no year at all");
  const thisYear = new Date().getUTCFullYear();
  require_(
    CALENDAR_COVERED_YEARS.includes(thisYear),
    `the business-day calendar does not cover ${thisYear}: no recorded date for ${unresolvedHolidaysFor(thisYear).join(", ")}`,
  );
  return `calendar covers ${CALENDAR_COVERED_YEARS.join(", ")}`;
});

check("print", 8, "every package composition allocates to the cent and discloses what is free", () => {
  const packages = getPackageCatalog();
  require_(packages.length > 0, "no packages are defined");
  for (const bundle of packages) {
    const { allocated, reason } = packageAllocation(bundle.id);
    require_(allocated, `${bundle.id} cannot allocate: ${reason}`);
    const total = allocated.reduce((sum, entry) => sum + entry.allocatedAmount, 0);
    require_(total === bundle.priceCents, `${bundle.id} allocates ${total} cents against a price of ${bundle.priceCents}`);
    /* Determinism: the same package must allocate the same way on every run, or a pro-rata
       refund computed today and re-checked later would not agree. */
    const again = packageAllocation(bundle.id).allocated;
    require_(JSON.stringify(again) === JSON.stringify(allocated), `${bundle.id} does not allocate deterministically`);
    for (const component of bundle.complimentaryComponents) {
      const entry = allocated.find((item) => item.courseId === component.id);
      require_(entry, `${bundle.id} drops its complimentary component ${component.id}`);
      require_(entry.allocatedAmount === 0, `${component.id} is complimentary but carries ${entry.allocatedAmount} cents`);
      require_(COMPLIMENTARY_DISCLOSURE.includes(component.name), `${component.name} is not named in the disclosure`);
    }
  }
  return `${packages.length} packages allocate exactly`;
});

check("print", 9, "no generated document carries a forbidden claim or a placeholder", () => {
  const forbidden = [
    [/state\s+course\s+LLC/i, "the provider name is misspelled as two words"],
    [/\bDRE[- ]approved\b/i, "a document claims DRE approval"],
    [/\bState[- ]Approved\b/i, "a document claims state approval"],
    [/\bapproved (provider|instructor|school)\b/i, "a document claims an approved provider, instructor or school"],
    [/\bTBD\b|\bTODO\b|\bXXX\b|\bLorem ipsum\b|\bPLACEHOLDER\b/i, "a placeholder survives in a filing document"],
    [/\bS\d{4,}\b/, "a sponsor number appears that DRE has not assigned"],
  ];
  const offenders = [];
  for (const packet of SUBMISSION_DIRECTORIES()) {
    const dir = path.join(root, "california/submission", packet);
    for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".md"))) {
      const text = fs.readFileSync(path.join(dir, file), "utf8");
      for (const [pattern, message] of forbidden) {
        const hit = text.match(pattern);
        /* A document may state that it does NOT claim approval; the claim is what is banned. */
        if (!hit) continue;
        /* A document may quote a forbidden string in order to forbid it, and the work order
           and the QA checklist both do. A hit inside quotes or backticks is a mention; a hit
           in running prose is a use. */
        const before = text.slice(Math.max(0, hit.index - 2), hit.index);
        const after = text.slice(hit.index + hit[0].length, hit.index + hit[0].length + 2);
        if (/["'`]$/.test(before) && /^["'`]/.test(after)) continue;
        const context = text.slice(Math.max(0, hit.index - 120), hit.index + 80);
        if (/\bnot\b|\bno\b|\buntil\b|never|forbid|must not|cannot|were wrong|was wrong|superseded|reappears/i.test(context)) continue;
        offenders.push(`${packet}/${file}: ${message} ("${hit[0]}")`);
      }
    }
  }
  require_(offenders.length === 0, offenders.join("; "));
  return `${SUBMISSION_DIRECTORIES().length} directories clean`;
});

check("print", 10, "the human-only items are recorded as outstanding, not assumed done", () => {
  /*
   * These cannot be satisfied by code and must never be silently treated as satisfied. The
   * gate's job is to make sure the filing checklist still says they are outstanding, so that a
   * packet cannot be printed while a signature nobody has given is presumed given.
   */
  const outstanding = [
    ["professor equivalence certification", /equivalence certification|college.{0,20}certification/i],
    ["RE 306 signature", /RE 306/],
    ["RE 336 signature", /RE 336/],
    ["Certificate of Status", /Certificate of Status|Good Standing/i],
  ];
  const workOrder = read("docs/california/CLAUDE_DRE_REMEDIATION_WORK_ORDER.md");
  require_(workOrder, "the work order is missing");
  for (const [label, pattern] of outstanding) {
    require_(pattern.test(workOrder), `the filing checklist no longer tracks the ${label}`);
  }
  /* And nothing anywhere may assert that any of them is already in hand. */
  const claimed = /signature (has been|was) (obtained|received)|certification (has been|is) signed/i;
  for (const packet of SUBMISSION_DIRECTORIES()) {
    const dir = path.join(root, "california/submission", packet);
    for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".md"))) {
      require_(!claimed.test(fs.readFileSync(path.join(dir, file), "utf8")), `${packet}/${file} asserts a signature is already obtained`);
    }
  }
  return `${outstanding.length} human-only items still tracked as outstanding`;
});

/* ═══════════════════════════════ PRODUCTION_READY ═══════════════════════════════════════ */

check("production", 11, "Stripe carries the same facts the database does", () => {
  const checkout = read("netlify/functions/create-checkout.mjs");
  const contract = read("lib/stripe-contract.mjs");
  require_(/asStripeParams\(metadata\)/.test(checkout), "the Checkout Session does not carry the metadata");
  require_(/asStripeParams\(metadata, "payment_intent_data\[metadata\]"\)/.test(checkout), "the PaymentIntent does not carry the metadata");
  for (const key of ["policy_version|refund_policy_version", "package_id", "course_allocation", "amount", "checkout_attempt_id"]) {
    require_(new RegExp(key).test(contract), `the metadata contract does not carry ${key}`);
  }
  require_(/allocation totals \$\{allocated\} cents but the charge is/.test(contract), "the allocation is not checked against the charge");
  return "session and intent both carry policy, package, allocation and amount";
});

check("production", 12, "every Stripe event the system depends on is handled", () => {
  const webhook = read("netlify/functions/stripe-webhook.mjs");
  require_(webhook, "the webhook is missing");
  for (const eventName of HANDLED_STRIPE_EVENTS) {
    require_(webhook.includes(`case "${eventName}"`), `${eventName} is not handled`);
  }
  require_(/verifyStripeSignature/.test(webhook), "the webhook processes unsigned requests");
  return `${HANDLED_STRIPE_EVENTS.length} events handled`;
});

check("production", 13, "a repeated webhook cannot create a second enrollment or a second refund", () => {
  const webhook = read("netlify/functions/stripe-webhook.mjs");
  const migration = read("database/001_payments_enrollment.sql");
  require_(/claim_stripe_event/.test(webhook), "events are not claimed");
  require_(/duplicate: true/.test(webhook), "a duplicate event is not short-circuited");
  require_(/if v_enrollment_id is not null then return v_enrollment_id; end if;/.test(migration), "a repeated paid session can create a second enrollment");
  require_(/on conflict \(stripe_refund_id\) do update/.test(migration), "a repeated refund event can create a second refund row");
  require_(/raise exception 'checkout payment mismatch'/.test(migration), "the charged amount is not checked against the attempt");
  return "idempotent at the event, the enrollment and the refund";
});

check("production", 14, "Stripe and the database are reconciled, and a disagreement is recorded not raised", () => {
  const webhook = read("netlify/functions/stripe-webhook.mjs");
  const migration = read("database/009_stripe_integrity.sql");
  require_(migration, "the Stripe integrity migration is missing");
  require_(/reconcileAgainstRecord/.test(webhook), "the webhook does not reconcile");
  require_(/add column if not exists stripe_charge_id/.test(migration), "the charge is not recorded");
  require_(/create table if not exists stripe_reconciliation_events/.test(migration), "a disagreement has nowhere to go");
  require_(/create or replace view stripe_reconciliation_open/.test(migration), "open disagreements cannot be listed");
  require_(!/raise exception[^;]*mismatch/i.test(migration), "a reconciliation mismatch raises instead of being recorded");
  return "intent, charge, currency, amount and status compared";
});

check("production", 15, "a refund made in the Stripe Dashboard is recorded, classified and surfaced", () => {
  const webhook = read("netlify/functions/stripe-webhook.mjs");
  const migration = read("database/010_external_refunds.sql");
  require_(migration, "external refunds are not handled");
  require_(/classifyRefundOrigin/.test(webhook), "the webhook does not classify a refund's origin");
  require_(/mark_external_refund/.test(webhook), "an external refund is not marked as one");
  require_(/origin text not null default 'platform'/.test(migration), "refunds do not record where they came from");
  require_(/policy_exception/.test(migration), "a refund exceeding the entitlement is not recorded as an exception");
  require_(/create or replace view refund_policy_exceptions_open/.test(migration), "exceptions cannot be surfaced to an administrator");
  /* The money has already moved, and no code path may try to take it back. The check is for
     a CALL that would reverse it, not for the word: the migration says in prose that a paid
     refund is "not something to reverse", and banning the word would ban saying so. */
  const reversal = /\b(reverse_refund|cancel_refund|void_refund|undo_refund)\b|stripeRequest\([^)]*reverse/i;
  require_(!reversal.test(migration + (read("netlify/functions/admin-refund-exceptions.mjs") ?? "")), "a code path attempts to reverse a refund that has already been paid");
  /* The assessment is separate from the recording, and does not live in the webhook. */
  const assessor = read("netlify/functions/admin-refund-exceptions.mjs");
  require_(assessor, "nothing assesses an external refund against the entitlement");
  require_(/assess_external_refund/.test(assessor), "the assessor does not record its assessment");
  require_(/create or replace view external_refunds_unassessed/.test(migration), "unassessed external refunds cannot be listed");
  require_(!/certificate_issued|percent_complete/.test(webhook), "the webhook reads course progress; payment must stay clear of compliance state");
  const toml = read("netlify.toml");
  require_(/\/api\/admin\/refund-exceptions/.test(toml), "the exception review endpoint is not routed");
  return "recorded at Stripe's amount, assessed separately, surfaced when it exceeds the entitlement";
});

check("production", 16, "package fan-out creates one enrollment per component", () => {
  const migration = read("database/011_package_enrollments.sql");
  require_(migration, "package fan-out is not implemented: a package purchase would create one enrollment, not one per component");
  require_(/create or replace function finalize_paid_package/.test(migration), "there is no package finalisation path");
  for (const bundle of getPackageCatalog()) {
    require_(bundle.purchasable === true, `${bundle.id} is still marked not purchasable: ${bundle.notPurchasableReason}`);
  }
  return "one purchase, one allocation row per component, one enrollment per component";
});

check("production", 17, "the whole test suite passes", () => {
  const output = execFileSync("node", ["--test", ...fs.readdirSync(path.join(root, "tests")).filter((name) => name.endsWith(".test.mjs")).map((name) => `tests/${name}`)], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
  const pass = Number(output.match(/^# pass (\d+)$/m)?.[1] ?? 0);
  const fail = Number(output.match(/^# fail (\d+)$/m)?.[1] ?? -1);
  require_(fail === 0, `${fail} test(s) failing`);
  require_(pass > 0, "no tests ran");
  return `${pass} of ${pass} passing`;
});

/* ═════════════════════════════════════ report ══════════════════════════════════════════ */

const forGate = GATE === "print" ? results.filter((result) => result.gate === "print") : results;
const blocked = forGate.filter((result) => result.status === "block");
const label = GATE === "print" ? "PRINT_READY" : "PRODUCTION_READY";

if (AS_JSON) {
  console.log(JSON.stringify({ gate: label, granted: blocked.length === 0, checks: forGate }, null, 2));
} else {
  const width = Math.max(...forGate.map((result) => result.title.length));
  console.log(`\n  ${label} gate — ${forGate.length} checks\n`);
  for (const result of forGate) {
    const mark = result.status === "pass" ? "PASS " : "BLOCK";
    console.log(`  ${mark}  ${String(result.id).padStart(2)}. ${result.title.padEnd(width)}  ${result.detail ?? ""}`);
  }
  console.log("");
  if (blocked.length === 0) {
    console.log(`  ${label}: GRANTED\n`);
  } else {
    console.log(`  ${label}: BLOCKED by ${blocked.length} check(s)\n`);
    for (const result of blocked) console.log(`    ${result.id}. ${result.title}\n       ${result.detail}`);
    console.log("");
  }
}

process.exit(blocked.length === 0 ? 0 : 1);
