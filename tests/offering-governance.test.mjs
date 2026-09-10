import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { representationCopy } from "../netlify/functions/_lib/offering-governance.mjs";

const sql021 = await readFile(new URL("../database/021_offering_governance.sql", import.meta.url), "utf8");
const sql022 = await readFile(new URL("../database/022_training_enrollment.sql", import.meta.url), "utf8");

/*
 * The rules that must not regress, stated as the mistakes they prevent.
 *
 * Every one of these is a way an unapproved offering could start taking money or start
 * calling itself approved. They are asserted against the schema rather than only against
 * the endpoints, because the endpoints are what a refactor changes.
 */

test("live charging is refused without a named, dated approval", { concurrency: false }, () => {
  const constraint = sql021.slice(sql021.indexOf("constraint live_requires_named_approval"));
  assert.match(constraint, /payment_mode <> 'live' or \(/);
  assert.match(constraint, /approval_status = 'approved'/);
  assert.match(constraint, /approval_authority/);
  assert.match(constraint, /approval_number/);
  assert.match(constraint, /approval_effective_date is not null/);
});

test("approved status cannot be recorded without naming who approved it", { concurrency: false }, () => {
  assert.match(sql021, /constraint approved_names_its_authority[\s\S]*?approval_status <> 'approved' or/);
});

test("approval and payment mode are separate columns, so approving cannot charge", { concurrency: false }, () => {
  /* Nothing may derive payment_mode from approval_status. If a future migration adds a
     default or a trigger that does, this fails. */
  assert.equal(/payment_mode[^;]*default\s+case/i.test(sql021), false);
  assert.equal(/set\s+payment_mode\s*=\s*'live'/i.test(sql021), false);
  assert.match(sql021, /payment_mode text not null default 'disabled'/);
});

test("the governing key separates site, state, discipline and offering", { concurrency: false }, () => {
  assert.match(sql021, /distinct on \(site, state, discipline, offering_id\)/);
  assert.match(sql021, /discipline text not null check \(discipline in \('real_estate','mortgage'\)\)/);
});

test("an expired approval stops charging and stops the approved wording by itself", { concurrency: false }, () => {
  const view = sql021.slice(sql021.indexOf("create or replace view offering_public_status"));
  assert.match(view, /approval_expires_date is null or g\.approval_expires_date > current_date/);
  assert.match(view, /live_charging_permitted/);
  assert.match(view, /then 'approved'\s*\n\s*else 'training_only'/);
});

test("the governance ledger is append-only", { concurrency: false }, () => {
  assert.match(sql021, /append_only_offering_governance_events[\s\S]*?admin_console_refuse_record_mutation/);
});

test("browser roles are granted nothing on governance", { concurrency: false }, () => {
  assert.match(sql021, /revoke all on offering_governance_events from public, anon, authenticated/);
  assert.match(sql021, /revoke all on current_offering_governance, offering_public_status from public, anon, authenticated/);
});

test("a training enrolment can never be credit-eligible", { concurrency: false }, () => {
  /* The one sentence that keeps free study from becoming a credit claim. */
  assert.match(sql022, /constraint training_enrolments_never_earn_credit check \(\s*\n?\s*enrollment_origin <> 'training' or compliance_credit_eligible = false/);
});

test("a purchase still has to carry its checkout attempt", { concurrency: false }, () => {
  assert.match(sql022, /enrollment_origin <> 'purchase' or checkout_attempt_id is not null/);
});

test("free access writes no payment row, so the ledger stays a record of money", { concurrency: false }, async () => {
  const endpoint = await readFile(new URL("../netlify/functions/enroll-training.mjs", import.meta.url), "utf8");
  for (const forbidden of ["checkout_attempts", "payments", "stripe"]) {
    assert.equal(endpoint.includes(forbidden), false, `training enrolment must not touch ${forbidden}`);
  }
  assert.match(endpoint, /compliance_credit_eligible: false/);
  assert.match(endpoint, /enrollment_origin: "training"/);
});

test("an unapproved offering describes itself as training and claims no credit", { concurrency: false }, () => {
  for (const status of [
    { representation: "training_only" },
    { approval_status: "submitted", representation: "training_only" },
    {},
  ]) {
    const copy = representationCopy(status);
    assert.equal(copy.representation, "training_only");
    assert.equal(copy.mayClaimCredit, false);
    assert.match(copy.statement, /not approved licensing or continuing education/i);
    assert.match(copy.statement, /does not earn license credit/i);
  }
});

test("an approved offering names its authority rather than asserting approval generically", { concurrency: false }, () => {
  const copy = representationCopy({
    representation: "approved",
    approval_authority: "California Department of Real Estate",
    approval_number: "S1234",
  });
  assert.equal(copy.mayClaimCredit, true);
  assert.match(copy.statement, /California Department of Real Estate/);
  assert.match(copy.statement, /S1234/);
});

test("checkout cannot bypass governance", { concurrency: false }, async () => {
  const checkout = await readFile(new URL("../netlify/functions/create-checkout.mjs", import.meta.url), "utf8");
  assert.match(checkout, /assertChargeable\(input\.courseId, mode\)/);
});

test("only the owner may set live, and the endpoint says so before the database does", { concurrency: false }, async () => {
  const lib = await readFile(new URL("../netlify/functions/_lib/offering-governance.mjs", import.meta.url), "utf8");
  assert.match(lib, /paymentMode === "live" && !isOwner/);
  assert.match(lib, /live_payments_are_owner_only/);
  /* And an unrecorded offering is closed rather than open. */
  assert.match(lib, /payment_mode: "disabled"/);
  assert.match(lib, /representation: "training_only"/);
});

test("an unreadable governance record refuses rather than breaking checkout", { concurrency: false }, async () => {
  const { governanceFor, assertChargeable } = await import("../netlify/functions/_lib/offering-governance.mjs");
  const previousFetch = globalThis.fetch;
  const previousEnv = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY, base: process.env.STATECOURSE_BASE_URL };
  process.env.SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
  process.env.STATECOURSE_BASE_URL = "https://statecourse.test";
  globalThis.fetch = async () => { throw new Error("relation offering_public_status does not exist"); };
  try {
    const status = await governanceFor("ca-real-estate-principles-45");
    /* Closed, not thrown: the deploy order of code and migration must not open a window
       in which anything is chargeable. */
    assert.equal(status.unreadable, true);
    assert.equal(status.payment_mode, "disabled");
    assert.equal(status.representation, "training_only");
    assert.equal(status.live_charging_permitted, false);
    for (const mode of ["live", "test"]) {
      await assert.rejects(assertChargeable("ca-real-estate-principles-45", mode),
        (error) => error.statusCode === 403);
    }
  } finally {
    globalThis.fetch = previousFetch;
    for (const [k, v] of [["SUPABASE_URL", previousEnv.url], ["SUPABASE_SERVICE_ROLE_KEY", previousEnv.key], ["STATECOURSE_BASE_URL", previousEnv.base]]) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
});
