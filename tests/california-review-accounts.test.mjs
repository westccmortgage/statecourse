/*
 * The two review accounts, and the two things neither of them can do.
 *
 * RE 303 checklist item 15 asks for "Student AND Regulator log-in and password". Two log-ins,
 * and the Department means two different things by them: one account shows the course as a
 * student takes it, gates and all, and the other reaches every part of it at once. Those are
 * opposite properties. An account that did both would demonstrate neither, which is why the
 * provisioning creates two and the walkthrough exercises the difference rather than asserting it.
 *
 * Two real defects were found while building this, both of the same shape as the SB 1495 one —
 * a document describing an enforcement that had never been built:
 *
 *   issue_california_completion_certificate accepted a completion whose status was
 *   'qa_non_credit'. Every QA and review enrollment carries that status, so the one kind of
 *   enrollment that must never produce a certificate was the kind that could.
 *
 *   15-re311-certificate-specimen.md said, in bold: "This is enforced in the platform, not in a
 *   policy document. The California course configuration holds approval_number: null; the
 *   certificate issuance path reads that field; and with it null the request is refused." The
 *   configuration held null. Nothing read it. A certificate could have been issued naming a DRE
 *   approval number that does not exist.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { PROGRAMS } from "../config/california/regulatory-manifest.mjs";
import { getCaliforniaCourse } from "../config/california-course-engine.mjs";
import { statusMap } from "../netlify/functions/student-course.mjs";
import { REVIEW_ACCOUNTS, WALKTHROUGH_STEPS } from "../scripts/provision-california-review-accounts.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

const MIGRATION = read("database/013_review_accounts.sql");
const PROVISION = read("scripts/provision-california-review-accounts.mjs");

/* ── two accounts, not one ─────────────────────────────────────────────────────────────── */

test("there are exactly two review accounts and they differ in the way that matters", () => {
  assert.equal(REVIEW_ACCOUNTS.length, 2);
  const [student, regulator] = REVIEW_ACCOUNTS;
  assert.equal(student.reviewRole, "student_reviewer");
  assert.equal(student.mode, "student");
  assert.equal(student.reviewerGrant, false, "the student reviewer holds a reviewer grant, which makes it a student reviewer in name only");
  assert.equal(regulator.reviewRole, "regulator_reviewer");
  assert.equal(regulator.mode, "reviewer");
  assert.equal(regulator.reviewerGrant, true);
  assert.notEqual(student.email, regulator.email);
});

test("the regulator browses its own enrollments rather than a student's", () => {
  /* Reviewer mode is what removes the gates. Owning its own enrollments is what makes
     contaminating a student's record structurally impossible rather than merely disallowed. */
  assert.match(MIGRATION, /create or replace function provision_california_review_enrollment/);
  assert.match(MIGRATION, /p_review_role not in \('student_reviewer','regulator_reviewer'\)/);
  assert.match(MIGRATION, /if p_review_role = 'regulator_reviewer' then\s+insert into course_review_access/);
});

test("a review enrollment is marked as one, and the mark is constrained", () => {
  assert.match(MIGRATION, /add column if not exists review_role text/);
  assert.match(MIGRATION, /check \(review_role in \('student_reviewer','regulator_reviewer'\)\)/);
});

/* ── the difference, exercised ─────────────────────────────────────────────────────────── */

const rows = (course, completedCount) =>
  course.assignments.map((assignment, index) => ({
    assignment_id: assignment.id,
    status: index < completedCount ? "completed" : "not_started",
  }));

test("the student reviewer is gated exactly as a student is", () => {
  for (const program of PROGRAMS) {
    const course = getCaliforniaCourse(program.catalogId);
    const fresh = statusMap(course, rows(course, 0), "student");
    assert.equal(fresh[0].accessible, true, `${program.title}: the first assignment is not open`);
    assert.equal(fresh[1].accessible, false, `${program.title}: the second assignment opens without the first`);
    assert.equal(fresh[1].status, "locked");
    assert.equal(fresh.filter((entry) => entry.accessible).length, 1);

    const partial = statusMap(course, rows(course, 7), "student");
    assert.equal(partial.filter((entry) => entry.accessible).length, 8, "the gate is not advancing one at a time");
    assert.equal(partial[8].status, "locked");
  }
});

test("the regulator reviewer reaches everything having completed nothing", () => {
  for (const program of PROGRAMS) {
    const course = getCaliforniaCourse(program.catalogId);
    const reviewer = statusMap(course, rows(course, 0), "reviewer");
    assert.equal(reviewer.filter((entry) => entry.accessible).length, course.assignments.length);
    for (const entry of reviewer) {
      assert.equal(entry.status, "review_available", "the reviewer is shown a student status");
      assert.equal(entry.activeSeconds, 0);
      assert.equal(entry.appliedComplete, false);
    }
  }
});

test("the two modes really do differ — the test would fail if they were the same", () => {
  /* Guarding against the version of this that passes because both branches return the same
     thing. If reviewer mode ever stopped bypassing the gate, this is what would notice. */
  const course = getCaliforniaCourse(PROGRAMS[0].catalogId);
  const asStudent = statusMap(course, rows(course, 0), "student").map((entry) => entry.accessible);
  const asReviewer = statusMap(course, rows(course, 0), "reviewer").map((entry) => entry.accessible);
  assert.notDeepEqual(asStudent, asReviewer);
  assert.equal(asStudent.filter(Boolean).length, 1);
  assert.equal(asReviewer.filter(Boolean).length, 15);
});

/* ── what neither may do ───────────────────────────────────────────────────────────────── */

test("a completion event is refused for a review enrollment, in a trigger", () => {
  assert.match(MIGRATION, /create trigger review_enrollment_completion_guard\s+before insert or update on course_completion_events/);
  assert.match(MIGRATION, /create trigger review_enrollment_certificate_guard\s+before insert or update on course_completion_certificates/);
  assert.match(MIGRATION, /raise exception 'completion_refused_for_review_enrollment/);
});

test("a certificate is refused while the course carries no DRE approval number", () => {
  /* The specimen document has claimed this enforcement since it was written. It is now true. */
  const issuance = MIGRATION.slice(MIGRATION.indexOf("function issue_california_completion_certificate"));
  assert.match(issuance, /select regulatory_approval_number into v_approval from courses/);
  assert.match(issuance, /raise exception 'certificate_refused_no_dre_approval_number/);

  const specimen = read("california/submission/01_Real_Estate_Principles/15-re311-certificate-specimen.md");
  assert.match(specimen, /the certificate issuance path reads that field/i, "the specimen no longer makes the claim this enforces");
});

test("a qa_non_credit completion can no longer produce a certificate", () => {
  const issuance = MIGRATION.slice(MIGRATION.indexOf("function issue_california_completion_certificate"));
  assert.doesNotMatch(issuance, /completion_status not in \('complete','qa_non_credit'\)/);
  assert.match(issuance, /if v_event\.completion_status <> 'complete' then/);
});

test("issuance still reads completion and never payment", () => {
  /* Migration 013 replaces the function, so the property migration 006 established has to be
     re-asserted against the replacement or it would have been lost silently. */
  const issuance = MIGRATION.slice(
    MIGRATION.indexOf("function issue_california_completion_certificate"),
    MIGRATION.indexOf("-- 4. Provisioning the two accounts"),
  );
  assert.match(issuance, /from course_completion_events/);
  assert.match(issuance, /raise exception 'course_not_completed'/);
  for (const term of ["payments", "checkout_attempts", "stripe", "refund"]) {
    assert.ok(!issuance.includes(term), `certificate issuance reads ${term}`);
  }
});

test("the certificate carries the SB 1495 evidence it is supposed to", () => {
  const issuance = MIGRATION.slice(MIGRATION.indexOf("function issue_california_completion_certificate"));
  assert.match(issuance, /california_sb1495_completion_evidence\(p_enrollment_id\)/);
});

/* ── credentials ───────────────────────────────────────────────────────────────────────── */

test("no credential is committed, and the script refuses to write one into the repository", () => {
  assert.match(PROVISION, /Refusing to write credentials inside the repository/);
  assert.match(PROVISION, /mode: 0o600/);
  /* The password is generated, never carried. */
  assert.match(PROVISION, /crypto\.randomBytes/);
  assert.doesNotMatch(PROVISION, /password\s*[:=]\s*["'][A-Za-z0-9-]{6,}["']/);
});

test("the receipt records that the accounts exist and carries no secret", () => {
  /* A private sheet outside the repository proves nothing to the ledger. The receipt is how a
     deliverable that must be run rather than written can be checked — and it holds addresses
     and enrollment ids, which grant nothing without a password. */
  const receipt = PROVISION.slice(PROVISION.indexOf("function provisioningReceipt"), PROVISION.indexOf("function filingSheet"));
  assert.match(receipt, /A8 — DRE review accounts, provisioned/);
  assert.match(receipt, /No credential appears in this file/);
  assert.ok(!receipt.includes("entry.secret"), "the receipt would print a password");
});

test("the filing sheet promises exactly the steps the walkthrough checks", () => {
  const report = JSON.parse(
    execFileSync("node", ["scripts/reviewer-walkthrough.mjs", "--json"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }),
  );
  const promised = WALKTHROUGH_STEPS.map((step) => step.id).sort();
  const checked = report.steps.map((step) => step.id).sort();
  assert.deepEqual(checked, promised, "the sheet and the walkthrough disagree about what a reviewer can do");
});

/* ── the walkthrough ───────────────────────────────────────────────────────────────────── */

test("the walkthrough passes, and most of it is exercised rather than read", () => {
  const report = JSON.parse(
    execFileSync("node", ["scripts/reviewer-walkthrough.mjs", "--json"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }),
  );
  assert.equal(report.REVIEWER_WALKTHROUGH, "PASS", JSON.stringify(report.steps.filter((step) => step.status === "fail"), null, 2));
  assert.ok(report.exercised >= 6, `only ${report.exercised} steps run the code they check`);
  for (const step of report.steps) assert.ok(["exercised", "read"].includes(step.kind));
});

test("the plan runs without a database and asks for one before applying", () => {
  const output = execFileSync("node", ["scripts/provision-california-review-accounts.mjs", "--plan"], { cwd: ROOT, encoding: "utf8" });
  assert.match(output, /student_reviewer/);
  assert.match(output, /regulator_reviewer/);
  assert.match(output, /SUPABASE_URL/);
  /* And it must not have written anything. */
  assert.ok(!fs.existsSync(path.join(ROOT, "california/submission/00_administrative/A8-review-accounts-provisioned.md")));
});

test("importing the provisioning module does not run it", () => {
  /* The walkthrough imports the account list from here so the two cannot disagree. A module
     that printed a plan on import would put that plan in the middle of every report. */
  assert.match(PROVISION, /const INVOKED_DIRECTLY = /);
  assert.match(PROVISION, /if \(INVOKED_DIRECTLY\) \{/);
});

/* ── the instructions the Department reads ─────────────────────────────────────────────── */

test("the log-in instructions describe two accounts and what neither can do", () => {
  for (const program of PROGRAMS) {
    const sheet = read(`california/submission/${program.packageDir}/14-login-instructions.md`);
    assert.match(sheet, /DRE student review/i);
    assert.match(sheet, /DRE regulator review/i);
    assert.match(sheet, /Neither account can produce a course completion record or a course completion certificate/i);
    assert.match(sheet, /no certificate may issue for any enrollment while the course carries no DRE approval number/i);
    /* And the difference stated as a difference, not as two paragraphs that happen to differ. */
    assert.match(sheet, /Reach a later assignment without finishing the one before it \| \*\*No — locked\*\* \| ✓ \|/);
  }
});
