/** Texas Law of Contracts - authoritative outline and pre-authoring budget checks. */

import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FORM, TOPICS, ALL_UNITS } from "../config/texas/law-of-contracts-course-form.mjs";
import { RATES, BUDGET, TOTALS } from "../config/texas/law-of-contracts-time-budget.mjs";
import { FORMS as CURRENT_TREC_FORMS } from "../config/texas/pcf-current-forms-inventory.mjs";
import { RULES, ASSESSMENT_REQUIREMENTS, SUBMISSION_READINESS } from "../config/texas/trec-rules-source-lock.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("LOC-0 source identity is pinned to the official PDF that was visually read", () => {
  const bytes = fs.readFileSync(path.join(root, FORM.localCopy));
  assert.equal(bytes.length, FORM.bytes);
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), FORM.sha256);
  assert.equal(FORM.formNumber, "LOC-0");
  assert.equal(FORM.revision, "06/20/2016");
  assert.equal(FORM.issuer, "Texas Real Estate Commission");
  assert.equal(FORM.pages, 3);
});

test("all current TREC contract-form PDFs are held and hash to the acquisition catalog", () => {
  const catalogPath = path.join(root, "texas/tx-law-of-contracts-30-v1/sources/forms/catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  assert.equal(catalog.formCount, CURRENT_TREC_FORMS.length);
  assert.equal(catalog.forms.length, CURRENT_TREC_FORMS.length);
  assert.deepEqual(catalog.forms.map((form) => form.formId), CURRENT_TREC_FORMS.map((form) => form.formId));
  assert.match(catalog.status, /Holding a PDF is not reading it/);
  assert.equal(catalog.totalBytes, catalog.forms.reduce((sum, form) => sum + form.bytes, 0));

  for (const [index, form] of catalog.forms.entries()) {
    const inventory = CURRENT_TREC_FORMS[index];
    assert.equal(form.name, inventory.name);
    assert.equal(form.effectiveDate, inventory.effectiveDate);
    assert.match(form.formPageUrl, /^https:\/\/www\.trec\.texas\.gov\/forms\//);
    assert.match(form.pdfUrl, /^https:\/\/www\.trec\.texas\.gov\/sites\/default\/files\/pdf-forms\//);
    const bytes = fs.readFileSync(path.join(root, form.localCopy));
    assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-");
    assert.equal(bytes.length, form.bytes);
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), form.sha256);
  }
});

test("LOC-0 transcription reconciles every printed subtotal to 1,500 minutes", () => {
  assert.deepEqual(TOPICS.map((topic) => topic.subtotalMinutes), [155, 115, 75, 120, 275, 135, 105, 235, 90, 135, 60]);
  assert.deepEqual(TOPICS.map((topic) => topic.units.length), [6, 8, 5, 8, 14, 9, 3, 10, 6, 9, 2]);
  for (const topic of TOPICS) {
    assert.equal(
      topic.units.reduce((sum, unit) => sum + unit.minutes, 0),
      topic.subtotalMinutes,
      `${topic.code} must reconcile to its printed subtotal`,
    );
  }
  assert.equal(TOPICS.reduce((sum, topic) => sum + topic.subtotalMinutes, 0), 1500);
  assert.equal(ALL_UNITS.length, 80);
  assert.equal(new Set(ALL_UNITS.map((unit) => unit.code)).size, 80);
  assert.equal(FORM.totalMinutes, FORM.courseHours * FORM.minutesPerCreditHour);
});

test("the transcription keeps LOC-0's two printed wording anomalies visible", () => {
  const contingencies = TOPICS.find((topic) => topic.code === "T07");
  const financing = TOPICS.find((topic) => topic.code === "T08");
  assert.equal(contingencies.topic, "Contingencies, Addenda and Amendments");
  assert.equal(contingencies.formVariantOnPage2, "Contingencies, Addendum and Amendments");
  assert.equal(financing.scopeNote, "Owner disclosure requirements; elements of a contract; statute & fraud");
});

test("the held TREC rule reproduction adopts LOC-0 by reference but does not clear submission readiness", () => {
  const rule = RULES.find((entry) => entry.section === "22 TAC §535.64");
  assert.ok(rule, "§535.64 must be held before LOC-0 can be treated as a controlling outline");
  const adoption = rule.provisions.find((provision) => provision.id === "535-64-remaining-mandatory-courses");
  assert.ok(adoption, "the held §535.64 reproduction must name LOC-0");
  assert.match(adoption.text, /Law of Contracts \(LOC-0\).*adopted by reference/);
  assert.equal(SUBMISSION_READINESS.trecApprovalHeld, false);
  assert.equal(SUBMISSION_READINESS.enrollmentPermitted, false);
  assert.equal(SUBMISSION_READINESS.texasCreditAvailable, false);
});

test("the Law of Contracts budget partitions each topic without cross-topic offsets", () => {
  assert.equal(BUDGET.length, TOPICS.length);
  assert.deepEqual(BUDGET.map((entry) => entry.topicCode), TOPICS.map((topic) => topic.code));
  for (const [index, entry] of BUDGET.entries()) {
    assert.equal(entry.prescribedMinutes, TOPICS[index].subtotalMinutes);
    assert.equal(entry.activityMinutes + entry.readingMinutes, entry.prescribedMinutes);
    assert.equal(entry.activityOverrunMinutes, 0);
    assert.ok(entry.readingMinutes > 0, `${entry.topicCode} must retain time for substantive instruction`);
  }
  assert.equal(TOTALS.budgetedMinutes, FORM.totalMinutes);
  assert.equal(TOTALS.activityMinutes + TOTALS.readingMinutes, FORM.totalMinutes);
  assert.equal(TOTALS.activityOverrunMinutes, 0);
});

test("the budget makes all eighty units assessable and exceeds the rule's topic-quiz floor", () => {
  assert.equal(ASSESSMENT_REQUIREMENTS.minQuestionsPerTopicQuiz, 3);
  assert.equal(TOTALS.quizItems, 81, "eighty units plus a third item for T11's two-unit topic");
  assert.ok(TOTALS.quizItems >= ALL_UNITS.length);
  for (const entry of BUDGET) {
    assert.equal(entry.quizItems, Math.max(ASSESSMENT_REQUIREMENTS.minQuestionsPerTopicQuiz, entry.units));
  }
  assert.equal(TOTALS.scenarios, 5);
});

test("all time-conversion rates are labelled StateCourse methodology", () => {
  assert.equal(RATES.label, "PROVIDER_METHODOLOGY");
  assert.equal(FORM.minutesPerCreditHourStatus, "FORM_DERIVED_PENDING_TAC_CONFIRMATION");
  assert.equal(TOTALS.minimumProseWords, TOTALS.readingMinutes * RATES.firstPassWordsPerMinute);
  assert.ok(TOTALS.conditionalReplacementMinutes > 0);
});
