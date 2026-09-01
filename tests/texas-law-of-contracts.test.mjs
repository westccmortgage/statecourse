/** Texas Law of Contracts - authoritative outline and pre-authoring budget checks. */

import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FORM, TOPICS, ALL_UNITS } from "../config/texas/law-of-contracts-course-form.mjs";
import { RATES, BUDGET, TOTALS } from "../config/texas/law-of-contracts-time-budget.mjs";
import { FORM_READS, READ_METHOD, validateFormReads } from "../config/texas/law-of-contracts-form-read-register.mjs";
import { READ_SCOPE, STATUTE_READS, validateStatuteReads } from "../config/texas/law-of-contracts-statute-read-register.mjs";
import {
  MODULE_1_SOURCES,
  MODULE_1_SOURCE_GAPS,
  MODULE_1_UNIT_SOURCE_REQUIREMENTS,
  MODULE_1_CLAIM_NEEDLES,
  MODULE_1_AUTHORED_CLAIM_CHECKS,
  validateModule1Sources,
} from "../config/texas/law-of-contracts-module-1-sources.mjs";
import {
  MODULE_2_SOURCES,
  MODULE_2_PROVIDER_METHODS,
  MODULE_2_SOURCE_GAPS,
  MODULE_2_UNIT_SOURCE_REQUIREMENTS,
  MODULE_2_CLAIM_CHECKS,
  validateModule2Sources,
} from "../config/texas/law-of-contracts-module-2-sources.mjs";
import { COURSE, MODULES, UNIT_OBJECTIVES, UNIT_TRACE } from "../config/texas/law-of-contracts-course.mjs";
import { TOPIC_1_QUIZ, TOPIC_2_QUIZ } from "../config/texas/law-of-contracts-question-bank.mjs";
import {
  AUTHORING_EVIDENCE,
  MODULE_2_AUTHORING_EVIDENCE,
  validateAuthoringEvidence,
  validateModule2AuthoringEvidence,
} from "../config/texas/law-of-contracts-authoring-evidence.mjs";
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

test("nine missing Texas chapters are now held course-locally without mutating the LOA source inventory", () => {
  const catalogPath = path.join(root, "texas/tx-law-of-contracts-30-v1/sources/statutes/catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  assert.equal(catalog.sourceCount, 9);
  assert.deepEqual(catalog.sources.map((source) => source.id), ["bc-3", "bc-322", "pr-24", "pr-81", "pr-82", "pr-221", "oc-1102", "fi-156", "fi-157"]);
  assert.match(catalog.status, /Holding a chapter is not reading a section/);
  assert.equal(catalog.totalBytes, catalog.sources.reduce((sum, source) => sum + source.bytes, 0));

  for (const source of catalog.sources) {
    assert.equal(source.publisher, "Texas Legislative Council");
    assert.equal(source.sourceLayer, "tcss.legis.texas.gov static resources");
    assert.equal(source.heldStatus, "HELD");
    assert.match(source.url, /^https:\/\/tcss\.legis\.texas\.gov\/resources\/[A-Z]+\/htm\/[A-Z]+\.\d+\.htm$/);
    const bytes = fs.readFileSync(path.join(root, source.localCopy));
    assert.match(bytes.subarray(0, 80).toString("utf8"), /<html\b/i);
    assert.equal(bytes.length, source.bytes);
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), source.sha256);
  }
});

test("four Topic 02 business-organization chapters are acquired from official Texas static resources", () => {
  const catalogPath = path.join(root, "texas/tx-law-of-contracts-30-v1/sources/business-organizations/catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  assert.equal(catalog.retrievedOn, "2026-08-31");
  assert.equal(catalog.sourceCount, 4);
  assert.equal(catalog.totalBytes, 528252);
  assert.deepEqual(catalog.sources.map((source) => source.id), ["bo-1", "bo-2", "bo-101", "bo-152"]);
  assert.deepEqual(catalog.sources.map((source) => source.bytes), [76538, 40609, 254996, 156109]);
  assert.deepEqual(catalog.sources.map((source) => source.sha256), [
    "d4e5a88dd40769581f8fb903419518a0199b25d35170667fd00f3b04f1b206c5",
    "1943f3dabe74020e5370a2b6cccd5bc6e59c42ce157243a0b20e26d6a16c2c4e",
    "e009a395de52e557f5d2c4d9a8a417ae0abc1b10d20312bbbb7a3ab75813ca01",
    "50094319ddce526a2b0dda31cd10aa3d35caa2b2facc19429f0a779d7ab9b0f2",
  ]);
  assert.match(catalog.status, /Holding a chapter is not reading a section/);
  assert.deepEqual(catalog.sources.map((source) => source.title), [
    "Definitions and Other General Provisions",
    "Purposes and Power of Domestic Entity",
    "Limited Liability Companies",
    "General Partnerships",
  ]);
  for (const source of catalog.sources) {
    assert.equal(source.publisher, "Texas Legislative Council");
    assert.equal(source.sourceLayer, "tcss.legis.texas.gov static resources");
    assert.match(source.url, /^https:\/\/tcss\.legis\.texas\.gov\/resources\/BO\/htm\/BO\.(?:1|2|101|152)\.htm$/u);
    const bytes = fs.readFileSync(path.join(root, source.localCopy));
    assert.equal(bytes.length, source.bytes);
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), source.sha256);
    assert.match(bytes.subarray(0, 80).toString("utf8"), /<html\b/i);
  }
});

test("all nine course-local chapters now have verified section-level reads", () => {
  assert.deepEqual(validateStatuteReads(), {
    status: "PASS",
    heldSources: 9,
    readSources: 9,
    verifiedFiles: 9,
    sectionsRead: 45,
    candidateUnits: 21,
    problems: [],
  });
  assert.match(READ_SCOPE.method, /complete official HTML text/i);
  assert.match(READ_SCOPE.authorityLimit, /only the proposition in its note/i);
  assert.match(READ_SCOPE.authoringStatus, /reusable register makes no curriculum-reliance claim/i);
  assert.match(READ_SCOPE.authoringStatus, /course-specific source layer may separately establish exact unit reliance/i);
});

test("statute reads identify candidate units but make no premature curriculum-reliance claim", () => {
  const unitCodes = new Set(ALL_UNITS.map((unit) => unit.code));
  assert.deepEqual(STATUTE_READS.map((source) => source.id), ["bc-3", "bc-322", "pr-24", "pr-81", "pr-82", "pr-221", "oc-1102", "fi-156", "fi-157"]);
  for (const source of STATUTE_READS) {
    assert.equal(source.status, "SECTION_TEXT_READ");
    assert.equal(Object.hasOwn(source, "reliedOnByUnits"), false, `${source.id} must not claim reliance before curriculum exists`);
    assert.ok(source.sectionsRead.length > 0);
    for (const section of source.sectionsRead) {
      assert.ok(section.note.length >= 80);
      assert.ok(section.candidateUnits.every((unit) => unitCodes.has(unit)));
    }
  }
});

test("eight priority forms have page-level reads rather than holdings-only claims", () => {
  const validation = validateFormReads();
  assert.deepEqual(validation, {
    status: "PASS",
    readForms: 8,
    verifiedFiles: 8,
    pagesRead: 25,
    heldFormsNotYetRead: 34,
    problems: [],
  });
  assert.match(READ_METHOD.textLayer, /Complete text extracted page by page/);
  assert.match(READ_METHOD.visual, /Every page rendered/);
  assert.match(READ_METHOD.authorityLimit, /may not replace governing statutes/);
});

test("the reusable form-read register stays candidate-only while course-specific trace claims reliance", () => {
  const unitCodes = new Set(ALL_UNITS.map((unit) => unit.code));
  assert.deepEqual(FORM_READS.map((record) => record.formId), ["20-19", "39-11", "40-11", "26-8", "41-3", "45-2", "55-1", "38-8"]);
  for (const record of FORM_READS) {
    assert.equal(record.status, "FORM_TEXT_READ");
    assert.deepEqual(record.pagesRead.map((entry) => entry.number), Array.from({ length: record.pageCount }, (_, index) => index + 1));
    assert.ok(record.authoringScope.length > 80);
    assert.ok(record.candidateUnits.length > 0);
    assert.ok(record.candidateUnits.every((unit) => unitCodes.has(unit)));
    assert.equal(Object.hasOwn(record, "reliedOnByUnits"), false, `${record.formId} reliance belongs in the course-specific source layer`);
  }
  const topic1Form = MODULE_1_SOURCES.find((source) => source.id === "loc-form-20-19");
  assert.deepEqual(topic1Form.reliedOnByUnits, ["T01U1", "T01U2", "T01U5"]);
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

test("Topic 01 source trace verifies exact held bytes, cited sections, form pages, and disclosed gap", () => {
  assert.deepEqual(validateModule1Sources(), {
    status: "PASS",
    sources: 4,
    verifiedFiles: 4,
    readSections: 19,
    coveredUnits: 6,
    codifiedRuleComparisonGaps: 1,
    problems: [],
  });
  assert.deepEqual(MODULE_1_SOURCES.map((source) => source.id), ["loc-oc-1101", "loc-bc-17", "loc-tac-537-11", "loc-form-20-19"]);
  assert.deepEqual(Object.keys(MODULE_1_UNIT_SOURCE_REQUIREMENTS), TOPICS[0].units.map((unit) => unit.code));
  assert.ok(Object.keys(MODULE_1_CLAIM_NEEDLES).length >= 6);
  assert.ok(MODULE_1_AUTHORED_CLAIM_CHECKS.length >= 7);
  assert.deepEqual(MODULE_1_SOURCE_GAPS.map((gap) => gap.id), ["sos-tac-22-537-11"]);
  assert.equal(MODULE_1_SOURCE_GAPS[0].status, "UNREAD_EXTERNAL_SOURCE");
  assert.match(MODULE_1_SOURCE_GAPS[0].note, /Secretary of State.*does not claim a codified-text comparison/is);

  const form = MODULE_1_SOURCES.find((source) => source.id === "loc-form-20-19");
  assert.equal(form.title, "One to Four Family Residential Contract (Resale)");
  assert.equal(form.effectiveDate, "2026-07-01");
  assert.equal(form.sectionsRead[0].section, "pages 1-12");
  assert.equal(form.sha256, "3f458518e9e01fc9c84cab420dcd0ce9793113c4b356ed5caf7a2fb1bdef2ca5");
});

test("Topic 02 source trace is bidirectional, claim-checked, and explicit about provider methodology", () => {
  assert.deepEqual(validateModule2Sources(), {
    status: "PASS",
    sources: 21,
    verifiedFiles: 21,
    readSections: 31,
    coveredOfficialSourceUnits: 7,
    providerMethodUnits: 1,
    disclosedScopeLimits: 4,
    problems: [],
  });
  assert.equal(MODULE_2_SOURCES.length, 21);
  assert.deepEqual(Object.keys(MODULE_2_UNIT_SOURCE_REQUIREMENTS), TOPICS[1].units.map((unit) => unit.code));
  assert.equal(MODULE_2_UNIT_SOURCE_REQUIREMENTS.T02U4.length, 0);
  assert.deepEqual(MODULE_2_PROVIDER_METHODS.map((method) => method.id), ["loc2-provider-property-characteristics"]);
  assert.ok(MODULE_2_CLAIM_CHECKS.length >= 8);
  assert.deepEqual(MODULE_2_SOURCE_GAPS.map((gap) => gap.id), [
    "loc2-general-fixture-case-law-not-held",
    "loc2-characteristics-provider-taxonomy",
    "loc2-cooperative-housing-regime-not-held",
    "loc2-townhouse-label-not-title-estate",
  ]);
  assert.ok(MODULE_2_SOURCE_GAPS.every((gap) => /SCOPE_NARROWED|DISCLOSED_PROVIDER_METHOD/u.test(gap.status)));

  const form = MODULE_2_SOURCES.find((source) => source.id === "loc2-form-20-19");
  assert.equal(form.sectionsRead[0].section, "page 1");
  assert.deepEqual(form.reliedOnByUnits, ["T02U2", "T02U3"]);
  const federal = MODULE_2_SOURCES.find((source) => source.id === "loc2-usc-42-3604");
  assert.equal(federal.currentThrough, "2026-07-12");
  assert.equal(federal.sha256, "1c35aca0cc53d430dcb4b100669730aff179d589b7d208593552b6c61a3fee9b");
});

test("incremental course record marks only Topics 01 and 02 authored and keeps every operational gate closed", () => {
  assert.equal(COURSE.buildStatus, "IN_REPO_AUTHORING_IN_PROGRESS");
  assert.equal(COURSE.curriculumComplete, false);
  assert.equal(COURSE.contentFreeze, null);
  assert.equal(COURSE.trecApprovalStatus, "NOT_SUBMITTED_NOT_APPROVED");
  assert.equal(COURSE.submissionReady, false);
  assert.equal(COURSE.finalExaminationExists, false);
  assert.equal(COURSE.finalExaminationAdministrable, false);
  for (const gate of ["enrollmentEnabled", "paymentEnabled", "creditReportingEnabled", "certificateIssuanceEnabled"]) {
    assert.equal(COURSE[gate], false, `${gate} must remain disabled`);
  }

  assert.equal(MODULES.length, 11);
  assert.equal(UNIT_TRACE.length, 80);
  assert.equal(Object.keys(UNIT_OBJECTIVES).length, 14);
  const topic1 = UNIT_TRACE.filter((trace) => trace.topicCode === "T01");
  const topic2 = UNIT_TRACE.filter((trace) => trace.topicCode === "T02");
  const future = UNIT_TRACE.filter((trace) => trace.topicCode !== "T01" && trace.topicCode !== "T02");
  assert.equal(topic1.length, 6);
  assert.equal(topic2.length, 8);
  assert.ok(topic1.every((trace) => trace.authored && trace.sourceReady && trace.objective && trace.sources.length));
  assert.ok(topic2.every((trace) => trace.authored && trace.sourceReady && trace.objective && (trace.sources.length || trace.providerMethods.length)));
  assert.deepEqual(topic2.find((trace) => trace.code === "T02U4").sources, []);
  assert.deepEqual(topic2.find((trace) => trace.code === "T02U4").providerMethods.map((method) => method.id), ["loc2-provider-property-characteristics"]);
  assert.ok(future.every((trace) => !trace.authored && !trace.sourceReady && trace.objective === null && trace.sources.length === 0 && trace.sourceGaps.length === 0 && trace.providerMethods.length === 0));

  const affected = new Set(MODULE_1_SOURCE_GAPS[0].affectedUnits);
  for (const trace of topic1) {
    const rule = trace.sources.find((source) => source.sourceId === "loc-tac-537-11");
    if (affected.has(trace.code)) {
      assert.equal(rule.sourceLayer, "TREC consolidated rules reproduction");
      assert.equal(rule.codifiedTextCompared, false);
      assert.deepEqual(trace.sourceGaps.map((gap) => gap.id), ["sos-tac-22-537-11"]);
    } else {
      assert.equal(trace.sourceGaps.length, 0);
    }
  }
});

test("authored Topic 01 partitions prose and activities and clears its own 155-minute allocation", () => {
  const validation = validateAuthoringEvidence();
  assert.equal(validation.status, "PASS");
  assert.equal(validation.totalWords, 11301);
  assert.equal(validation.proseWords, 9060);
  assert.equal(validation.activityWords, 2241);
  assert.equal(validation.totalWords, validation.proseWords + validation.activityWords);
  assert.ok(validation.measuredRequiredMinutes >= validation.prescribedMinutes);
  assert.equal(AUTHORING_EVIDENCE.minimumProseWords, 8540);
  assert.equal(AUTHORING_EVIDENCE.activityMinutes, 94);
  assert.deepEqual(AUTHORING_EVIDENCE.unitHeadings, TOPICS[0].units.map((unit) => unit.unit));
  assert.deepEqual(AUTHORING_EVIDENCE.unitEvidence.map((unit) => unit.code), TOPICS[0].units.map((unit) => unit.code));
  assert.ok(AUTHORING_EVIDENCE.unitEvidence.every((unit) => unit.primaryQuizItems === 1 && unit.proseWords > 0));
  assert.equal(AUTHORING_EVIDENCE.sharedActivityMinutes, 8);
  assert.deepEqual(AUTHORING_EVIDENCE.sharedActivitySegments.map((segment) => segment.type), ["misconceptionCheck", "moduleRecap"]);
  assert.match(AUTHORING_EVIDENCE.unitTimePolicy, /unit minutes are suggested and may be altered/i);
  assert.deepEqual(AUTHORING_EVIDENCE.counts, {
    statuteReadingExercises: 2,
    appliedExercises: 3,
    scenarios: 1,
    misconceptionChecks: 1,
    moduleRecaps: 1,
    quizItems: 6,
    conditionalReplacementItems: 6,
  });
  assert.match(AUTHORING_EVIDENCE.sha256, /^[a-f0-9]{64}$/u);
  assert.match(AUTHORING_EVIDENCE.conditionalReplacementPolicy, /not counted toward the required 155-minute path/i);
});

test("authored Topic 02 partitions prose and activities and clears its own 115-minute allocation", () => {
  const validation = validateModule2AuthoringEvidence();
  assert.deepEqual(validation, {
    status: "PASS",
    module: "module-02",
    totalWords: 10951,
    proseWords: 10142,
    activityWords: 809,
    measuredRequiredMinutes: 125.44285714285714,
    prescribedMinutes: 115,
    activitySegments: 4,
    problems: [],
  });
  assert.equal(MODULE_2_AUTHORING_EVIDENCE.minimumProseWords, 8680);
  assert.equal(MODULE_2_AUTHORING_EVIDENCE.activityMinutes, 53);
  assert.deepEqual(MODULE_2_AUTHORING_EVIDENCE.unitHeadings, TOPICS[1].units.map((unit) => unit.unit));
  assert.deepEqual(MODULE_2_AUTHORING_EVIDENCE.unitEvidence.map((unit) => unit.code), TOPICS[1].units.map((unit) => unit.code));
  assert.deepEqual(MODULE_2_AUTHORING_EVIDENCE.unitEvidence.map((unit) => unit.suggestedMinutes), TOPICS[1].units.map((unit) => unit.minutes));
  assert.ok(MODULE_2_AUTHORING_EVIDENCE.unitEvidence.every((unit) => unit.primaryQuizItems === 1 && unit.proseWords > 0));
  assert.equal(MODULE_2_AUTHORING_EVIDENCE.sharedActivityMinutes, 5);
  assert.match(MODULE_2_AUTHORING_EVIDENCE.unitTimePolicy, /topic subtotal is the enforced minimum/i);
  assert.deepEqual(MODULE_2_AUTHORING_EVIDENCE.counts, {
    statuteReadingExercises: 1,
    appliedExercises: 2,
    scenarios: 0,
    misconceptionChecks: 0,
    moduleRecaps: 1,
    quizItems: 8,
    conditionalReplacementItems: 8,
  });
  assert.match(MODULE_2_AUTHORING_EVIDENCE.sha256, /^[a-f0-9]{64}$/u);
  assert.match(MODULE_2_AUTHORING_EVIDENCE.conditionalReplacementPolicy, /not counted toward the required 115-minute path/i);
});

test("Topic 01 formative bank has one traced primary and one distinct successor per LOC-0 unit", () => {
  const moduleText = fs.readFileSync(path.join(root, AUTHORING_EVIDENCE.path), "utf8");
  assert.equal(TOPIC_1_QUIZ.length, 6);
  assert.deepEqual(TOPIC_1_QUIZ.map((item) => item.unit), TOPICS[0].units.map((unit) => unit.code));
  assert.equal(new Set(TOPIC_1_QUIZ.flatMap((item) => [item.id, item.replacement.id])).size, 12);
  assert.equal(new Set(TOPIC_1_QUIZ.flatMap((item) => [item.prompt, item.replacement.prompt])).size, 12);

  for (const item of TOPIC_1_QUIZ) {
    assert.equal(item.correctChoice, 0);
    assert.equal(item.replacement.correctChoice, 0);
    assert.equal(item.module, "module-01");
    assert.equal(item.replacement.module, "module-01");
    assert.equal(item.replacement.unit, item.unit);
    assert.notEqual(item.judgement, item.replacement.judgement);
    assert.ok(moduleText.includes(item.contentAnchor));
    assert.match(item.remediation, /^module-01\.md#[a-z0-9-]+$/u);
    assert.ok(item.sourceRefs.length > 0);
    assert.ok(item.replacement.sourceRefs.length > 0);
    assert.ok(moduleText.includes(item.replacement.contentAnchor));
    assert.match(item.replacement.remediation, /^module-01\.md#[a-z0-9-]+$/u);
  }

  const bankText = fs.readFileSync(path.join(root, "config/texas/law-of-contracts-question-bank.mjs"), "utf8");
  assert.doesNotMatch(bankText, /finalExaminationExists:\s*true|final examination is ready|TREC[- ]approved/iu);
});

test("Topic 02 formative bank has one traced primary and one distinct successor per LOC-0 unit", () => {
  const moduleText = fs.readFileSync(path.join(root, MODULE_2_AUTHORING_EVIDENCE.path), "utf8");
  assert.equal(TOPIC_2_QUIZ.length, 8);
  assert.deepEqual(TOPIC_2_QUIZ.map((item) => item.unit), TOPICS[1].units.map((unit) => unit.code));
  assert.equal(new Set(TOPIC_2_QUIZ.flatMap((item) => [item.id, item.replacement.id])).size, 16);
  assert.equal(new Set(TOPIC_2_QUIZ.flatMap((item) => [item.prompt, item.replacement.prompt])).size, 16);

  for (const item of TOPIC_2_QUIZ) {
    for (const candidate of [item, item.replacement]) {
      assert.equal(candidate.correctChoice, 0);
      assert.equal(candidate.module, "module-02");
      assert.equal(candidate.unit, item.unit);
      assert.ok(candidate.sourceRefs.length > 0);
      assert.ok(moduleText.includes(candidate.contentAnchor));
      assert.match(candidate.remediation, /^module-02\.md#[a-z0-9-]+$/u);
      assert.equal(candidate.choices.length, 4);
    }
    assert.notEqual(item.judgement, item.replacement.judgement);
    assert.notEqual(item.prompt, item.replacement.prompt);
  }
});

test("build status separates unfinished repository work from external submission blockers", () => {
  const status = fs.readFileSync(path.join(root, "texas/tx-law-of-contracts-30-v1/BUILD-STATUS.md"), "utf8");
  assert.match(status, /2 of 11 LOC-0 topics and 14 of 80 LOC-0 units are authored/);
  assert.match(status, new RegExp(`${AUTHORING_EVIDENCE.totalWords.toLocaleString("en-US")} total words`));
  assert.match(status, new RegExp(`${AUTHORING_EVIDENCE.proseWords.toLocaleString("en-US")} teaching-prose words`));
  assert.match(status, new RegExp(`${MODULE_2_AUTHORING_EVIDENCE.totalWords.toLocaleString("en-US")} total words`));
  assert.match(status, new RegExp(`${MODULE_2_AUTHORING_EVIDENCE.proseWords.toLocaleString("en-US")} teaching-prose words`));
  assert.match(status, /Remaining work inside the repository/);
  assert.match(status, /External submission blockers/);
  assert.match(status, /not submitted, not approved, not enrollable/i);
  assert.match(status, /remaining 9 topics and 66 units/);
  assert.doesNotMatch(status, /course is complete|TREC[- ]approved/iu);
});
