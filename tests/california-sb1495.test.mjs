/*
 * SB 1495, and the difference between saying a course complies and it complying.
 *
 * The defect these tests were written against was not a missing sentence. `course_final_eligibility`
 * had carried a column called `interactive_requirements_complete` since migration 003, and it was
 * set to `v_completed = 15` — the number of finished lesson assignments. It reported that the
 * interactive participatory requirement was satisfied whenever a student had finished fifteen
 * assignments, whether or not they had ever written a word in either role.
 *
 * Nothing stored a role-play response. The lesson text told the student the responses were
 * "recorded, reviewed, and a completion requirement for the assignment"; the platform recorded
 * nothing and required nothing. A student could have completed the Real Estate Practice course,
 * passed the examination and received a certificate saying the course was SB 1495 compliant,
 * having taken neither role.
 *
 * So most of what follows is about the enforcement rather than the curriculum: that both roles
 * are stored, that the assignment cannot complete without them, that the check lives in a trigger
 * and not only in the one code path that happens to call it, and that eligibility is computed
 * from the submissions rather than from a count of something else.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { SB1495, authority, program } from "../config/california/regulatory-manifest.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

const MIGRATION = read("database/012_sb1495_participatory_component.sql");
const STUDY_PATH = read("netlify/functions/student-course.mjs");
const CLIENT = read("public/statecourse/student/course/student-course.js");
const LESSON = read(`california/${SB1495.contentFolder}/curriculum/lesson-14.md`);
const MATRIX = read(`california/submission/${SB1495.packageDir}/07-sb1495-traceability.md`);

/* ── the requirement, as the Department states it ──────────────────────────────────────── */

test("the requirement is recorded from the Department's own FAQ, read and hashed", () => {
  const faq = authority(SB1495.authorityId);
  assert.ok(faq, "SB 1495 rests on an authority the manifest does not carry");
  assert.equal(faq.publisher, "California Department of Real Estate");
  assert.equal(faq.url, "https://www.dre.ca.gov/files/pdf/faqs/FAQ_SB1495.pdf");
  assert.ok(faq.localCopy && fs.existsSync(path.join(ROOT, faq.localCopy)), "the FAQ is cited and not held");
  assert.ok(faq.contentHash, "the FAQ is held and not hashed, so a reissue would go unnoticed");
  assert.match(faq.verifiedAsOf, /^\d{4}-\d{2}-\d{2}$/);
});

test("the FAQ's four requirements each have something relying on them", () => {
  const faq = authority(SB1495.authorityId);
  const ids = faq.materialClaims.map((claim) => claim.id);
  for (const expected of ["sb1495-implicit-bias", "sb1495-fair-housing", "sb1495-not-severable", "sb1495-evidence"]) {
    assert.ok(ids.includes(expected), `the FAQ record does not carry ${expected}`);
  }
  for (const claim of faq.materialClaims) assert.ok(claim.reliedOnBy.length > 0);
});

test("the requirement attaches to the practice course and to no other", () => {
  const practice = program(SB1495.courseId);
  assert.ok(practice, "SB 1495 names a course that is not a California program");
  assert.equal(practice.sb1495, true);
  assert.equal(practice.packageDir, SB1495.packageDir);
  assert.equal(practice.courseId, SB1495.contentFolder);
});

/* ── the curriculum ────────────────────────────────────────────────────────────────────── */

test("every element the FAQ requires appears in the practicum lesson", () => {
  const text = LESSON.toLowerCase();
  for (const element of [...SB1495.implicitBias, ...SB1495.fairHousing]) {
    for (const phrase of element.find) {
      assert.ok(text.includes(phrase.toLowerCase()), `${element.id}: the lesson never says "${phrase}"`);
    }
  }
});

test("the fair housing component covers state law and not only federal law", () => {
  /* The gap this test was written for: the course taught the federal Fair Housing Act and said
     only that "California protects those and adds further characteristics" without naming a
     single California statute. SB 1495 requires "federal and state fair housing laws". */
  assert.match(LESSON, /Fair Employment and Housing Act/);
  assert.match(LESSON, /Government Code § 12955/);
  assert.match(LESSON, /Unruh Civil Rights Act/);
  assert.match(LESSON, /Civil Code § 51/);
  /* And the characteristics that have no federal counterpart, which is the operational point. */
  assert.match(LESSON, /source of income/i);
  assert.match(LESSON, /veteran or military status/i);
});

test("the federal law is quoted rather than paraphrased into a rule nobody can check", () => {
  assert.match(LESSON, /42 U\.S\.C\. § 3601/);
  assert.match(LESSON, /otherwise make unavailable or deny/);
});

test("both role-play sections exist, in the order the FAQ names them", () => {
  for (const role of SB1495.roles) {
    const heading = new RegExp(`^## ${role.topic}\\. Participatory practicum`, "m");
    assert.match(LESSON, heading, `no section ${role.topic} for the ${role.label} role`);
  }
});

test("the assignment's timed sequence still totals its instructional minutes", () => {
  /* Content was added to this lesson for the state-law component. An assignment whose parts no
     longer sum to 180 would put the course's 45 hours out by however much was added. */
  const rows = [...LESSON.matchAll(/^\|\s[^|]+\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
  const total = Number(/\|\s\*\*Total\*\*\s*\|\s*\*\*(\d+)\*\*/.exec(LESSON)?.[1]);
  assert.equal(total, 180);
  assert.equal(rows.reduce((sum, value) => sum + value, 0), total);
});

/* ── the enforcement ───────────────────────────────────────────────────────────────────── */

test("a response is stored per role, with the text the student wrote", () => {
  assert.match(MIGRATION, /create table if not exists sb1495_participatory_submissions/);
  assert.match(MIGRATION, /participant_role text not null check \(participant_role in \('consumer','licensee'\)\)/);
  assert.match(MIGRATION, /response text not null/);
});

test("a submission cannot be a single character, and the two limits agree", () => {
  const constraint = /length\(btrim\(response\)\) >= (\d+)/.exec(MIGRATION);
  const application = /SB1495_MINIMUM_RESPONSE = (\d+)/.exec(STUDY_PATH);
  assert.ok(constraint && application, "the minimum length is not stated in both places");
  assert.equal(constraint[1], application[1], "the database and the study path disagree on the minimum response");
});

test("the practicum assignment cannot complete without both roles, in a trigger", () => {
  /* In a trigger rather than in the study path, because the study path is one caller. A repair
     script, a back-office correction, or a second client would each be a way around a check that
     lived only in application code. */
  assert.match(MIGRATION, /create trigger sb1495_assignment_completion_guard/);
  assert.match(MIGRATION, /before insert or update on lms_assignment_state/);
  assert.match(MIGRATION, /raise exception 'sb1495_consumer_role_not_submitted'/);
  assert.match(MIGRATION, /raise exception 'sb1495_licensee_role_not_submitted'/);
});

test("eligibility reads the submissions rather than counting assignments", () => {
  /* The defect itself. `interactive_requirements_complete` used to be `v_completed = 15`. */
  assert.match(MIGRATION, /v_interactive := \(v_participation->>'both_roles_submitted'\)::boolean/);
  const insert = /interactive_requirements_complete,[\s\S]*?values\([\s\S]*?\)/.exec(MIGRATION)?.[0] ?? "";
  assert.ok(insert.includes("v_interactive"), "the eligibility row is not written from the participation fact");
  assert.doesNotMatch(MIGRATION, /interactive_requirements_complete[^\n]*v_completed=15/);
  assert.match(MIGRATION, /v_final := v_completed=15 and v_calendar and v_cross_course and v_identity and v_interactive/);
});

test("an outstanding role is named, not merely counted", () => {
  assert.match(MIGRATION, /SB 1495 participatory component - consumer role/);
  assert.match(MIGRATION, /SB 1495 participatory component - real estate professional role/);
});

test("the components cannot be taken apart from the practice course", () => {
  /* FAQ Q7: "the fair housing and implicit bias components cannot be completed independently of
     the real estate practice course itself." */
  assert.match(MIGRATION, /raise exception 'sb1495_not_applicable_to_this_course'/);
  assert.equal(SB1495.severable, false);
});

test("the evidence of both roles travels with the completion record", () => {
  assert.match(MIGRATION, /add column if not exists sb1495_participation jsonb/);
  assert.match(MIGRATION, /create or replace function california_sb1495_completion_evidence/);
});

test("a revision is kept alongside the response it revises, not instead of it", () => {
  /* The lesson asks the licensee-role student to submit, read structured feedback, and revise. A
     record that overwrote the first response would destroy the evidence that the feedback step
     happened at all. */
  assert.match(MIGRATION, /revision integer not null default 1/);
  assert.match(MIGRATION, /unique \(enrollment_id, assignment_id, participant_role, revision\)/);
  assert.match(MIGRATION, /coalesce\(max\(revision\), 0\) \+ 1/);
});

test("the study path applies the rule too, so the student sees it rather than a database error", () => {
  assert.match(STUDY_PATH, /sb1495_role_submitted/);
  assert.match(STUDY_PATH, /both_roles_submitted/);
  assert.match(STUDY_PATH, /record_sb1495_submission/);
});

test("a reviewer cannot write a student's participatory submission", () => {
  /* Every non-student mode is routed away before the student event handlers are reached. */
  const reviewerBranch = STUDY_PATH.indexOf('if (ctx.mode !== "student")');
  const submissionHandler = STUDY_PATH.indexOf('if (eventType === "sb1495_role_submitted")');
  assert.ok(reviewerBranch > 0 && submissionHandler > 0);
  assert.ok(reviewerBranch < submissionHandler, "the reviewer branch no longer precedes the submission handler");
});

test("the student is shown two boxes and which one is outstanding", () => {
  assert.match(CLIENT, /renderParticipatory/);
  for (const role of SB1495.roles) assert.ok(CLIENT.includes("role.label") || CLIENT.includes(role.id));
  assert.match(read("public/statecourse/student/course/index.html"), /id="participatoryRoles"/);
});

test("the submitted response is never rendered back into an editable box", () => {
  /* A submission is evidence of what the student wrote at the time. Handing it back as a draft
     would make the stored text a working copy rather than a record. */
  assert.match(CLIENT, /if\(role\.submitted\)return`<div class="participatory-role complete">/);
});

/* ── the matrix ────────────────────────────────────────────────────────────────────────── */

test("the traceability matrix regenerates cleanly from the course", () => {
  /* Check mode refuses stale or untraceable output without rewriting the tracked artifact. */
  execFileSync("node", ["scripts/generate-sb1495-traceability.mjs", "--check"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
});

test("every element in the matrix resolves to a section, a page and an examination item", () => {
  assert.doesNotMatch(MATRIX, /NOT FOUND/);
  assert.doesNotMatch(MATRIX, /NOT EXAMINED/);
  assert.doesNotMatch(MATRIX, /not located in the volume/);
  assert.doesNotMatch(MATRIX, /volume not read/);
  /* Every element row carries a printed page a reviewer can turn to. */
  const pages = [...MATRIX.matchAll(/\| p\. (\d+) \|/g)];
  assert.ok(pages.length >= SB1495.implicitBias.length + SB1495.fairHousing.length, `only ${pages.length} rows carry a page number`);
});

test("every participatory property in the matrix is verified rather than asserted", () => {
  const rows = [...MATRIX.matchAll(/^\| (.+?) \| (.+?) \| \*\*(YES|NO)\*\* \|$/gm)];
  assert.ok(rows.length >= 10, `the matrix carries ${rows.length} verified properties`);
  for (const row of rows) assert.equal(row[3], "YES", `the matrix records "${row[1]}" as NOT proved`);
});

test("the compliance statement appears on the practice course's RE 313 and RE 311, and nowhere else", () => {
  const practice = program(SB1495.courseId);
  for (const file of ["06-re313-general-information-page.md", "15-re311-certificate-specimen.md"]) {
    const text = read(`california/submission/${practice.packageDir}/${file}`);
    assert.ok(text.includes(SB1495.statement), `${file} does not state "${SB1495.statement}"`);
  }
  /* A principles course that claimed SB 1495 compliance would be claiming to be a practice
     course, which is a misdescription of what the student completed. */
  for (const other of ["01_Real_Estate_Principles", "03_Mortgage_Loan_Brokering_and_Lending"]) {
    for (const file of ["06-re313-general-information-page.md", "15-re311-certificate-specimen.md"]) {
      assert.ok(!read(`california/submission/${other}/${file}`).includes(SB1495.statement), `${other}/${file} claims SB 1495 compliance`);
    }
  }
});

test("the statement is not a claim of approval", () => {
  /* "Compliant with SB 1495" describes content against a statute. It must not be readable as a
     finding by the Department, which has issued none. */
  assert.match(MATRIX, /Not asserted:\*\* that DRE has approved this course/);
  assert.match(MATRIX, /No approval of\nany kind has been issued|no DRE approval has been issued/i);
});
