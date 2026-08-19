import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  CALIFORNIA_COURSE_IDS,
  CALIFORNIA_FINAL_EXAM_FORMS,
  californiaFinalExamForm,
  getCaliforniaFinalExam,
  publicAssessment,
  scoreCaliforniaFinalExam
} from "../config/california-course-engine.mjs";
import { explainRequirement } from "../netlify/functions/student-final-exam.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migration = fs.readFileSync(path.join(root, "database/007_california_final_examination.sql"), "utf8");
const endpoint = fs.readFileSync(path.join(root, "netlify/functions/student-final-exam.mjs"), "utf8");
const eligibilitySql = fs.readFileSync(path.join(root, "database/006_california_timing_and_certificates.sql"), "utf8");

test("an unanswered question scores as incorrect rather than voiding the submission", () => {
  const exam = getCaliforniaFinalExam(CALIFORNIA_COURSE_IDS[0], "A");
  const key = exam.items.map((item) => item.correctChoice);
  const sixtyRight = scoreCaliforniaFinalExam(exam, key.map((choice, index) => (index < 60 ? choice : null)));
  assert.equal(sixtyRight.correctCount, 60);
  assert.equal(sixtyRight.answeredCount, 60);
  assert.equal(sixtyRight.percent, 60);
  assert.equal(sixtyRight.passed, true, "60 percent is the California passing score");

  const fiftyNine = scoreCaliforniaFinalExam(exam, key.map((choice, index) => (index < 59 ? choice : null)));
  assert.equal(fiftyNine.passed, false);

  /* A submission with nothing answered is a real, scoreable attempt: the student sat it
     and it counts against their two. */
  const blank = scoreCaliforniaFinalExam(exam, key.map(() => null));
  assert.equal(blank.correctCount, 0);
  assert.equal(blank.answeredCount, 0);
  assert.equal(blank.passed, false);
});

test("a malformed answer is refused instead of being scored as wrong", () => {
  const exam = getCaliforniaFinalExam(CALIFORNIA_COURSE_IDS[0], "A");
  const key = exam.items.map((item) => item.correctChoice);
  assert.equal(scoreCaliforniaFinalExam(exam, key.map((choice, index) => (index === 0 ? 9 : choice))), null);
  assert.equal(scoreCaliforniaFinalExam(exam, key.slice(1)), null, "a short answer array is a client bug, not a zero");
});

test("a scored final exam result carries no rationale for any item", () => {
  for (const courseId of CALIFORNIA_COURSE_IDS) {
    for (const form of CALIFORNIA_FINAL_EXAM_FORMS) {
      const exam = getCaliforniaFinalExam(courseId, form);
      const score = scoreCaliforniaFinalExam(exam, exam.items.map((item) => item.correctChoice));
      for (const result of score.results) {
        assert.ok(!("rationale" in result), `${courseId} ${form}: a final exam result carries a rationale`);
      }
    }
  }
});

test("the delivered examination carries no answer key", () => {
  for (const courseId of CALIFORNIA_COURSE_IDS) {
    for (const form of CALIFORNIA_FINAL_EXAM_FORMS) {
      const delivered = publicAssessment(getCaliforniaFinalExam(courseId, form));
      /* Checked by key rather than by substring: a choice may legitimately contain the
         word "rationale" in its prose, and a substring scan would flag that as a leak
         while missing a key nested one level down. */
      const keys = new Set();
      const walk = (value) => {
        if (Array.isArray(value)) return value.forEach(walk);
        if (!value || typeof value !== "object") return;
        for (const [key, nested] of Object.entries(value)) { keys.add(key); walk(nested); }
      };
      walk(delivered);
      for (const forbidden of ["correctChoice", "rationale", "crossReferences", "source", "answer", "correct"]) {
        assert.ok(!keys.has(forbidden), `${courseId} form ${form} ships "${forbidden}" to the browser`);
      }
      assert.equal(delivered.items.length, 100);
      for (const item of delivered.items) {
        assert.deepEqual(Object.keys(item).sort(), ["choices", "id", "prompt"]);
      }
    }
  }
});

test("attempt one is form A, attempt two is form B, and there is no third", () => {
  assert.equal(californiaFinalExamForm(1), "A");
  assert.equal(californiaFinalExamForm(2), "B");
  assert.equal(californiaFinalExamForm(3), null);
  assert.match(migration, /attempt_number integer not null check\(attempt_number between 1 and 2\)/);
  assert.match(migration, /if v_attempts >= 2 then raise exception 'final_exam_attempts_exhausted'/);
  assert.match(migration, /exam_form_does_not_match_attempt/);
});

test("an attempt cannot start without a fresh, unused identity verification", () => {
  assert.match(migration, /consumed_at is null/);
  assert.match(migration, /identity_verification_required/);
  assert.match(migration, /update final_exam_identity_checks set consumed_at=now\(\)/);
  /* RE 303 names exactly two accepted forms of identification, and the trade
     organization credential is only good for five years. */
  assert.match(migration, /identification_type in \('government_photo_id','trade_organization_photo_id'\)/);
  assert.match(migration, /trade_identification_expired/);
  assert.match(migration, /current_date - interval '5 years'/);
});

test("no role below service_role can read the response rows", () => {
  const revoked = migration.slice(migration.indexOf("revoke all on final_exam_proctors"));
  assert.match(revoked.slice(0, 200), /final_exam_responses/);
  assert.match(revoked.slice(0, 200), /from anon,authenticated/);
  assert.doesNotMatch(migration, /grant select on[^;]*final_exam_responses/,
    "a student able to read their own response rows can read the answer key item by item");
  /* The regulator's register reports the attempt, never the paper. */
  const viewStart = migration.indexOf("create or replace view california_final_exam_register");
  const register = migration.slice(viewStart, migration.indexOf(";", viewStart));
  assert.doesNotMatch(register, /final_exam_responses/);
});

test("completion is created by a passing examination and never by a payment", () => {
  assert.match(migration, /insert into course_completion_events/);
  const submit = migration.slice(
    migration.indexOf("create or replace function submit_california_final_exam"),
    migration.indexOf("-- 6. Expiring abandoned attempts")
  );
  assert.match(submit, /if v_passed then[\s\S]*insert into course_completion_events/);
  /* Comments are stripped first: the migration's own header says payment appears
     nowhere in the file, and that sentence must not fail the test it describes. */
  const code = (source) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*(--|\/\/)[^\n]*/gm, "");
  for (const source of [migration, endpoint]) {
    assert.doesNotMatch(code(source), /payment|stripe|checkout|invoice/i,
      "the final examination path references payment");
  }
});

test("the endpoint never returns a per-item verdict, even after a pass", () => {
  assert.doesNotMatch(endpoint, /correctChoice/);
  /* score.results may go to the database, which stores the outcome; it may not go into
     a response body, which the student reads. */
  const responses = endpoint.slice(endpoint.indexOf("async function statusPayload"));
  assert.doesNotMatch(responses, /(?<!p_)results:\s*score\.results/,
    "the scored per-item results must not reach the student");
  assert.match(endpoint, /p_results: score\.results/, "the database is still given the scored results");
  assert.match(endpoint, /publicAssessment\(delivered\)/);
  /* A running correct-count during the examination is the same leak, slower. */
  const save = endpoint
    .slice(endpoint.indexOf("async function saveProgress"), endpoint.indexOf("async function submitAttempt"))
    .replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(save, /correctCount/);
});

test("a reviewer cannot sit an examination", () => {
  assert.match(endpoint, /final_exam_is_student_only/);
  assert.doesNotMatch(endpoint, /course_review_access/);
});

test("every requirement the eligibility function can emit is explained in plain language", () => {
  /* The labels are produced by refresh_california_eligibility in migration 006. If a
     label is added there without an explanation here, the student sees the regulatory
     shorthand instead of a sentence, which is the failure this test exists to catch. */
  const labels = [...eligibilitySql.matchAll(/jsonb_build_array\((?:\([^)]*\)::text\|\|)?'([^']+)'\)/g)]
    .map((match) => match[1])
    .filter((label) => !/^\s*$/.test(label));
  assert.ok(labels.length >= 5, `expected the eligibility labels, found ${labels.length}`);
  for (const label of labels) {
    const sample = label.startsWith(" ") ? `4${label}` : label;
    const explained = explainRequirement(sample, { earliest_final_exam_at: "2026-09-14T00:00:00Z" });
    assert.notEqual(explained, sample, `"${sample}" reaches the student as regulatory shorthand`);
    assert.match(explained, /California|course access|enrollment/i);
  }
});

test("the study-period explanation names the date the student becomes eligible", () => {
  const explained = explainRequirement("California 2.5-week minimum period", {
    earliest_final_exam_at: "2026-09-14T12:00:00Z"
  });
  assert.match(explained, /September 14, 2026/);
  assert.match(explained, /two and a half weeks/);
  const undated = explainRequirement("California 2.5-week minimum period", {});
  assert.doesNotMatch(undated, /Invalid Date|NaN|undefined|null/);
});

test("the time limit is carried on the session, not read from configuration at report time", () => {
  assert.match(migration, /time_limit_minutes integer not null check\(time_limit_minutes > 0\)/);
  assert.match(migration, /passing_percent integer not null check\(passing_percent between 1 and 100\)/);
  assert.match(migration, /question_count integer not null check\(question_count > 0\)/);
  /* Both provider-set values must be labelled as provider-set wherever they appear, so
     a reviewer is never shown a proposal presented as a regulation. */
  assert.match(migration, /PROVIDER-SET/);
  assert.match(endpoint, /PROVIDER-SET/);
});
