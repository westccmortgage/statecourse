/**
 * Texas Law of Contracts — compliance and integrity tests.
 *
 * These assert the properties a reviewer would otherwise have to take on trust. This file grows
 * with the build; at present it covers the two artifacts that exist — the LOC-0 outline
 * transcription and the instructional time budget derived from it.
 *
 * The transcription tests are not decoration. Everything downstream of them — block maps, quiz
 * bank, exam bank, time evidence, traceability — joins on the unit codes and trusts the minute
 * figures, so a transcription error propagates silently into every artifact that follows. The
 * checks here re-derive the form's own arithmetic from the transcribed rows and compare the held
 * PDF's bytes against the hash the transcription claims to have read.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { FORM, TOPICS, ALL_UNITS } from "../config/texas/law-of-contracts-course-form.mjs";
import { RATES, BUDGET, COURSE_LEVEL, TOTALS } from "../config/texas/law-of-contracts-time-budget.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ── the outline ─────────────────────────────────────────────────────────────────────────────── */

test("LOC-0 transcription reconciles to the form's own printed arithmetic", () => {
  for (const topic of TOPICS) {
    const sum = topic.units.reduce((n, u) => n + u.minutes, 0);
    assert.equal(sum, topic.subtotalMinutes, `${topic.code} units total ${sum} against printed subtotal ${topic.subtotalMinutes}`);
  }
  const grand = TOPICS.reduce((n, t) => n + t.subtotalMinutes, 0);
  assert.equal(grand, FORM.totalMinutes, "topic subtotals must reach the form's printed TOTAL MINUTES");
  assert.equal(FORM.totalMinutes, FORM.courseHours * FORM.minutesPerCreditHour);
  assert.equal(FORM.formNumber, "LOC-0");
  assert.equal(FORM.revision, "06/20/2016");
  assert.equal(TOPICS.length, 11);
  assert.equal(ALL_UNITS.length, 80);
});

test("the transcription was read from the LOC-0 the manifest holds, not from a different file", () => {
  const pdf = path.join(root, FORM.localCopy);
  assert.ok(fs.existsSync(pdf), `${FORM.localCopy} is not on disk`);
  const bytes = fs.readFileSync(pdf);
  assert.equal(bytes.length, FORM.bytes, "held LOC-0 byte count differs from the transcription's record");
  assert.equal(
    crypto.createHash("sha256").update(bytes).digest("hex"),
    FORM.sha256,
    "held LOC-0 hashes differently from the transcription's record",
  );
});

test("unit codes are unique, well formed, and in the form's printed order", () => {
  const seen = new Set();
  for (const topic of TOPICS) {
    topic.units.forEach((unit, index) => {
      assert.match(unit.code, /^T\d\dU\d{1,2}$/, `${unit.code} is not a well-formed unit code`);
      assert.equal(unit.code, `${topic.code}U${index + 1}`, "unit codes must run 1..n within their topic, in printed order");
      assert.ok(!seen.has(unit.code), `duplicate unit code ${unit.code}`);
      seen.add(unit.code);
      assert.ok(unit.minutes > 0, `${unit.code} carries no prescribed minutes`);
      assert.ok(unit.unit.trim().length > 0, `${unit.code} has no printed title`);
    });
  }
  assert.deepEqual(TOPICS.map((t) => t.code), ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08", "T09", "T10", "T11"]);
});

/**
 * The form prints the seventh topic's name two different ways — "Addendum" where the block opens on
 * page 2, "Addenda" where it continues on page 3. Both are recorded. This test exists so that a
 * later editor who "fixes" one of them has to do it deliberately: the inconsistency belongs to
 * TREC's document, and a transcription that quietly harmonises it is no longer a transcription.
 */
test("both printed spellings of the seventh topic's name are preserved", () => {
  const t07 = TOPICS.find((t) => t.code === "T07");
  assert.equal(t07.topic, "Contingencies, Addendum and Amendments");
  assert.equal(t07.titleAsPrintedOnContinuationPage, "Contingencies, Addenda and Amendments");
  assert.notEqual(t07.topic, t07.titleAsPrintedOnContinuationPage);
});

/**
 * Likewise "statute & fraud" in the Financing Real Estate scope note. It reads as a typo for
 * "statute of frauds" and it is not this file's job to correct TREC's form.
 */
test("the Financing Real Estate scope note is transcribed as printed, not corrected", () => {
  const t08 = TOPICS.find((t) => t.code === "T08");
  assert.ok(t08.scopeNote.includes("statute & fraud"), "the printed scope note has been silently corrected");
  assert.ok(!t08.scopeNote.includes("statute of frauds"));
  /* The Sales Contract prints the phrase correctly, which is the comparison that makes it a typo
     rather than a term of art. */
  assert.ok(TOPICS.find((t) => t.code === "T06").scopeNote.includes("statute of frauds"));
});

/* ── the time budget ─────────────────────────────────────────────────────────────────────────── */

test("the time budget preserves every LOC-0 floor and explicitly records the added early scenario", () => {
  assert.equal(BUDGET.length, TOPICS.length);
  for (const row of BUDGET) {
    const topic = TOPICS.find((t) => t.code === row.topicCode);
    assert.ok(topic, `${row.topicCode} is not an LOC-0 topic`);
    assert.equal(row.prescribedMinutes, topic.subtotalMinutes);
    const added = row.topicCode === "T03" ? 20 : 0;
    assert.equal(row.activityMinutes + row.readingMinutes, topic.subtotalMinutes + added, `${row.topicCode} must preserve its own floor and disclosed overrun`);
    assert.equal(row.addedInstructionOverrunMinutes, added);
  }
  assert.equal(TOTALS.budgetedMinutes, FORM.totalMinutes);
  assert.equal(TOTALS.activityMinutes + TOTALS.readingMinutes, FORM.totalMinutes + 20);
  assert.equal(TOTALS.minimumProseWords, 111580, "Adding the early scenario must not lower original teaching-word floors");
  assert.equal(TOTALS.addedInstructionOverrunMinutes, 20);
});

/**
 * Every LOC-0 allocation is a topic-specific minimum. This test asserts the property that makes
 * that enforceable: no topic's activity load may exceed its own allocation, because a topic whose
 * activities alone overrun has no instruction time left and would have to borrow from another
 * topic's minutes to look solvent.
 */
test("no topic's activity load outruns its own LOC-0 allocation", () => {
  for (const row of BUDGET) {
    assert.ok(row.readingMinutes > 0, `${row.topicCode} has ${row.readingMinutes} reading minutes left after activities`);
    assert.equal(row.activityOverrunMinutes, 0);
  }
  assert.equal(TOTALS.activityOverrunMinutes, 0);
});

test("the capstone scenario is counted at course level and charged to no topic", () => {
  assert.equal(COURSE_LEVEL.capstoneScenarios, 1);
  assert.equal(COURSE_LEVEL.minutes, RATES.activityMinutes.scenario);
  assert.equal(TOTALS.scenarios, TOTALS.topicScenarios + COURSE_LEVEL.capstoneScenarios);
  /* The course-level minutes are deliberately absent from the topic table's arithmetic. */
  assert.equal(TOTALS.activityMinutes + TOTALS.readingMinutes, FORM.totalMinutes + TOTALS.addedInstructionOverrunMinutes);
});

test("the assessment plan covers every unit and meets the per-topic floors", () => {
  assert.ok(TOTALS.quizItems >= ALL_UNITS.length, `${TOTALS.quizItems} quiz items for ${ALL_UNITS.length} units`);
  for (const row of BUDGET) {
    assert.ok(row.quizItems >= 3, `${row.topicCode} budgets ${row.quizItems} quiz items`);
    assert.ok(row.quizItems >= row.units, `${row.topicCode} budgets fewer quiz items than it has units`);
  }
  assert.ok(TOTALS.scenarios >= 3);
});

/**
 * The rates are the provider's methodology, not a Texas rule, and they are shared with the three
 * courses already built. A divergence here would mean two StateCourse courses price a student's
 * minute differently, which is a discrepancy a reviewer would have to chase across files.
 */
test("the time rates match the model the earlier Texas courses use", async () => {
  const loa = await import("../config/texas/law-of-agency-time-budget.mjs");
  assert.equal(RATES.label, "PROVIDER_METHODOLOGY_NOT_OBSERVED_TIME");
  assert.equal(RATES.firstPassWordsPerMinute, loa.RATES.firstPassWordsPerMinute);
  assert.equal(RATES.masteryStudyWordsPerMinute, loa.RATES.masteryStudyWordsPerMinute);
  assert.equal(RATES.replacementSeenFraction, loa.RATES.replacementSeenFraction);
  assert.deepEqual({ ...RATES.activityMinutes }, { ...loa.RATES.activityMinutes });
});

/**
 * The 50-minute credit hour is derived from the form's own arithmetic and has never been confirmed
 * against the codified 22 TAC text, which remains unreachable from this environment. The status
 * flag says so, and this test keeps it saying so until a reader actually confirms it.
 */
test("the credit-hour convention is still labelled as form-derived and unconfirmed", () => {
  assert.equal(FORM.minutesPerCreditHour, 50);
  assert.equal(FORM.minutesPerCreditHourStatus, "FORM_DERIVED_PENDING_TAC_CONFIRMATION");
});
