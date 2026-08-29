/**
 * Texas Principles of Real Estate II — the FOUR CONFIDENTIAL FINAL EXAMINATION VERSIONS, the
 * rotation rule, and the subsequent-attempt rule.
 *
 * ── CONFIDENTIALITY ─────────────────────────────────────────────────────────────────────────────
 * This file names, by id, which secure item sits on which version. Together with
 * config/texas/principles-ii-final-exam-bank.mjs it is the examination key. It must never be
 * importable from a student-facing surface, nothing in public/ may import it, and no build may emit
 * an artifact containing a version's item list. Answer keys, rationales and version composition
 * never reach the browser: the engine is expected to serve one version's items with the choices
 * permuted deterministically and with correctChoice, rationale, teaches and source stripped.
 * 22 TAC § 535.65(h)(2) requires final examination questions to be kept confidential and to be
 * significantly different from the quiz questions and exercises used in the course.
 *
 * ── THE RULES THIS FILE IMPLEMENTS, FROM THE SOURCES READ ───────────────────────────────────────
 * Both rule files were read for this build and are held on disk with recorded hashes:
 * texas/trec-sources/trec-rules/535.62.txt and texas/trec-sources/trec-rules/535.65.txt.
 *
 *   • § 535.62(b)(7) — at least FOUR versions of a final examination; each version covers each
 *     topic required for the course; no version contains any true/false questions; no version
 *     repeats more than ONE THIRD of the questions from other versions; each version consists of at
 *     least two questions per credit course hour (60 for this 30-hour course), drawn from a bank of
 *     at least four questions per credit course hour (120).
 *   • § 535.65(h)(4) — "A provider must rotate all versions of the examination required by
 *     §535.62(b)(7) of this subchapter throughout the approval period for a course in a manner
 *     acceptable to the Commission and must require an unweighted passing score of 70%."
 *   • § 535.65(h)(1) — the final examination "must be given in the manner submitted to and approved
 *     by the Commission."
 *   • § 535.65(h)(3) — a provider shall not permit a student to view or take a final examination
 *     before completion of regular course work and any required makeup sessions.
 *   • § 535.65(h)(5) — the examination must be administered under conditions that ensure the student
 *     taking it is the student who registered for and took the course.
 *   • § 535.65(i)(1)-(2) — a subsequent final examination may be permitted only after the student
 *     has completed any additional course work the provider prescribes; it must be completed no
 *     later than the 90th day after the date the original class concludes; and it "must be a
 *     different version of the original final examination given to the student."
 *   • § 535.65(i)(3) — a student who fails to timely complete the subsequent final examination is
 *     automatically dropped from the course with no credit.
 *   • § 535.65(h)(6) and § 535.65(i)(4) — no credit to a student who fails a final examination and a
 *     subsequent final examination; a student who fails a second time must retake the course and the
 *     final course examination.
 *
 * ── WHAT IS STILL BLOCKED ───────────────────────────────────────────────────────────────────────
 * The Secretary of State's codified 22 TAC text remains unread; these two rule files are TREC's own
 * published reproduction, classified TIER 4 by config/texas/trec-rules-source-lock.mjs, and
 * TX_PROVIDER_RULE_SOURCE_LOCK still FAILS. EXAM_READY below is therefore BLOCKED: no student may
 * be served an attempt, the administration parameters that are NOT fixed by the rule text (timing,
 * proctoring mechanics, identity-validation method, rotation cadence) are PROVIDER PROPOSALS, and
 * nothing here may be described as TREC-approved. No Texas qualifying credit is available.
 *
 * ── THE VERSION DESIGN, AND WHY THE OVERLAP IS WHAT IT IS ───────────────────────────────────────
 * The bank deals its 132 topic-ordered items into 22 cells of six by cell(i) = (3i mod 22) + 1.
 * Each version is the union of ten cells — sixty items — chosen so that every PAIR of versions
 * shares exactly three cells:
 *
 *      A = 1 2 3 | 4 5 6 | 7 8 9 |             + 19
 *      B = 1 2 3 |       |       | 10 11 12 | 13 14 15        + 20
 *      C =       | 4 5 6 |       | 10 11 12 |          | 16 17 18 + 21
 *      D =       |       | 7 8 9 |          | 13 14 15 | 16 17 18 + 22
 *
 * Six pair-groups of three cells cover the six pairs exactly once each, and cells 19-22 are
 * exclusive to A, B, C and D respectively. The result: every version carries 60 items, every pair
 * of versions overlaps in exactly 18 items — 30.00% of the shorter (equal-length) version, strictly
 * under the one-third cap — 108 items appear on exactly two versions, 24 appear on exactly one, and
 * no bank item goes unused. The overlaps are RECOMPUTED below from the item lists and asserted
 * against the cap; PAIRWISE_OVERLAP records the resulting matrix as fact rather than as intention.
 */

import {
  FINAL_EXAM_BANK,
  BANK_SIZE,
  FORM_CELLS,
  ITEM_CELLS,
  CELL_COUNT,
} from "./principles-ii-final-exam-bank.mjs";
import { TOPICS, FORM as PRINS2_FORM } from "./principles-ii-course-form.mjs";
import { ASSESSMENT_REQUIREMENTS, SUBMISSION_READINESS } from "./trec-rules-source-lock.mjs";

const byId = new Map(FINAL_EXAM_BANK.map((entry) => [entry.id, entry]));
const cellOf = new Map(ITEM_CELLS.map((row) => [row.id, row.cell]));

/* ── The four versions, assembled from the bank by id. ────────────────────────────────────── */

const buildForm = (id, label) => {
  const cells = new Set(FORM_CELLS[id]);
  const itemIds = FINAL_EXAM_BANK.filter((entry) => cells.has(cellOf.get(entry.id))).map((entry) => entry.id);
  const topicCounts = {};
  for (const itemId of itemIds) {
    const entry = byId.get(itemId);
    if (!entry) {
      throw new Error(`final exam forms: version ${id} names item ${itemId}, which is not in the bank`);
    }
    topicCounts[entry.topic] = (topicCounts[entry.topic] ?? 0) + 1;
  }
  return Object.freeze({
    id,
    label,
    cells: Object.freeze([...FORM_CELLS[id]]),
    itemIds: Object.freeze(itemIds),
    itemCount: itemIds.length,
    topicCounts: Object.freeze(topicCounts),
  });
};

export const FORMS = Object.freeze([
  buildForm("A", "Principles of Real Estate II — Final Examination, Version A"),
  buildForm("B", "Principles of Real Estate II — Final Examination, Version B"),
  buildForm("C", "Principles of Real Estate II — Final Examination, Version C"),
  buildForm("D", "Principles of Real Estate II — Final Examination, Version D"),
]);

export const FORM_IDS = Object.freeze(FORMS.map((form) => form.id));

/* ── Pairwise overlap, computed from the item lists above and recorded as fact. ───────────── */

const overlapRows = [];
for (let a = 0; a < FORMS.length; a += 1) {
  for (let b = a + 1; b < FORMS.length; b += 1) {
    const setA = new Set(FORMS[a].itemIds);
    const shared = FORMS[b].itemIds.filter((id) => setA.has(id));
    const shorter = Math.min(FORMS[a].itemCount, FORMS[b].itemCount);
    overlapRows.push(
      Object.freeze({
        pair: `${FORMS[a].id}-${FORMS[b].id}`,
        sharedItems: shared.length,
        shorterVersionItems: shorter,
        fractionOfShorter: Math.round((shared.length / shorter) * 10000) / 10000,
        percentOfShorter: Math.round((shared.length / shorter) * 10000) / 100,
        capItems: Math.floor(shorter * ASSESSMENT_REQUIREMENTS.maxCrossVersionOverlapFraction),
        withinCap: shared.length / shorter <= ASSESSMENT_REQUIREMENTS.maxCrossVersionOverlapFraction,
      }),
    );
  }
}
export const PAIRWISE_OVERLAP = Object.freeze(overlapRows.map((row) => Object.freeze({ ...row })));

export const OVERLAP_THRESHOLD = Object.freeze({
  rule: "22 TAC § 535.62(b)(7)(H)(iii)",
  text: "No version of the examination may repeat more than one third of the questions from other versions of the final examination.",
  maxFraction: ASSESSMENT_REQUIREMENTS.maxCrossVersionOverlapFraction,
  maxPercent: Math.round((ASSESSMENT_REQUIREMENTS.maxCrossVersionOverlapFraction * 10000)) / 100,
  maxItemsAgainstA60ItemVersion: Math.floor(60 * ASSESSMENT_REQUIREMENTS.maxCrossVersionOverlapFraction),
  observedMaxItems: Math.max(...PAIRWISE_OVERLAP.map((row) => row.sharedItems)),
  observedMaxPercent: Math.max(...PAIRWISE_OVERLAP.map((row) => row.percentOfShorter)),
});

/* ── Scoring. Fixed by § 535.65(h)(4), not proposed. ──────────────────────────────────────── */

export const SCORING = Object.freeze({
  basis: "22 TAC § 535.65(h)(4), read at texas/trec-sources/trec-rules/535.65.txt",
  weighting: "unweighted",
  passingScorePercent: ASSESSMENT_REQUIREMENTS.passingScorePercent,
  note: "Every item on a version counts equally toward the score. Scoring is unweighted: no topic, unit or item carries extra weight, and no item may be dropped from the denominator after the fact.",
  minimumCorrectByVersion: Object.freeze(
    Object.fromEntries(
      FORMS.map((form) => [
        form.id,
        Math.ceil((ASSESSMENT_REQUIREMENTS.passingScorePercent / 100) * form.itemCount),
      ]),
    ),
  ),
});

/* ── Rotation. § 535.65(h)(4) requires rotation "in a manner acceptable to the Commission"; the
      requirement is the rule's, the cadence below is the provider's proposal. ──────────────── */

export const ROTATION = Object.freeze({
  basis: "22 TAC § 535.65(h)(4) — a provider must rotate all versions throughout the approval period for the course in a manner acceptable to the Commission.",
  requirementStatus: "RULE_REQUIRED",
  cadenceStatus: "PROVIDER_PROPOSED_PENDING_COMMISSION_ACCEPTANCE",
  order: Object.freeze(["A", "B", "C", "D"]),
  method:
    "Versions are issued in the fixed cycle A, B, C, D and the cycle repeats, so that all four versions are in service throughout the four-year approval period and none falls out of use. The version a student receives on a first attempt is the next version in the cycle at the time the attempt is opened; the cycle position is recorded with the attempt.",
  everyVersionUsedThroughoutApprovalPeriod: true,
  note: "The cycle order and the per-attempt assignment method are a StateCourse LLC proposal. They are offered to the Commission for acceptance and may not be described as accepted. What is not a proposal is the obligation to rotate all four versions throughout the approval period, which is the rule's own requirement.",
});

/* ── The subsequent attempt. § 535.65(i) — the rule, stated as the rule states it. ────────── */

export const SUBSEQUENT_ATTEMPT = Object.freeze({
  basis: "22 TAC § 535.65(i), read at texas/trec-sources/trec-rules/535.65.txt",
  permittedOnlyAfterAdditionalCourseWork:
    "If a student fails a final course examination, a provider may permit the student to take a subsequent final examination only after the student has completed any additional course work prescribed by the provider.",
  deadlineDays: 90,
  deadlineRunsFrom: "the date the original class concludes",
  mustBeADifferentVersion: true,
  differentVersionRule:
    "The subsequent final examination must be a DIFFERENT VERSION of the original final examination given to the student. The engine must exclude the version already served to that student and assign the next version in the ROTATION cycle that the student has not seen.",
  failureToTimelyComplete:
    "A student who fails to timely complete the subsequent final examination is automatically dropped from the course with no credit.",
  afterASecondFailure:
    "A provider may not give credit to a student who fails a final examination and a subsequent final examination. A student who fails the final course examination a second time is required to retake the course and the final course examination.",
  maxAttemptsBeforeRetakingTheCourse: 2,
});

/* ── Administration parameters the rule text does not fix. Proposals, labelled as such. ───── */

export const ADMINISTRATION = Object.freeze({
  label: "PROVIDER_PROPOSED_PENDING_TAC_CONFIRMATION",
  examReady: "BLOCKED_TX_PROVIDER_RULE_SOURCE_LOCK",
  note:
    "The codified 22 TAC text has not been read and TX_PROVIDER_RULE_SOURCE_LOCK still FAILS, so no examination may be administered. The figures below are StateCourse LLC proposals for the parameters the read rule text does not itself fix; none is a TREC requirement and none may be presented as one. The parameters the rule DOES fix — four versions, at least 60 questions per version, a bank of at least 120, no true/false items, no more than one-third overlap, a 70% unweighted passing score, rotation of all versions, and a different version for the subsequent attempt — are recorded above under their own sections and are not proposals.",
  proposedTimeLimitMinutes: 120,
  proposedIdentityValidation:
    "Identity verified at the start of the attempt by the same process used at enrollment, with the verification record retained with the attempt — offered against § 535.65(a)(1)(E) and § 535.65(h)(5), whose acceptable methods are for the Commission to accept.",
  noViewingBeforeCourseworkComplete:
    "22 TAC § 535.65(h)(3) — a provider shall not permit a student to view or take a final examination before the completion of regular course work and any required makeup sessions. The engine must gate the attempt on completion of all nine topics, their quizzes and the scenario exercises.",
  separationFromFormativeInstruments:
    "22 TAC § 535.65(h)(2) — final examination questions are kept confidential and are significantly different from the quiz questions and exercises used in the course. The formative instruments are config/texas/principles-ii-question-bank.mjs.",
});

export const EXAM_READY = Object.freeze({
  status: "BLOCKED",
  blockedBy: "TX_PROVIDER_RULE_SOURCE_LOCK",
  trecApprovalHeld: SUBMISSION_READINESS.trecApprovalHeld,
  texasCreditAvailable: SUBMISSION_READINESS.texasCreditAvailable,
  note: "Assembling four compliant versions is not authority to administer one. No student may be served an attempt while this status is BLOCKED.",
});

/* ── Load-time invariants. Throw rather than export something broken. ─────────────────────── */

if (FORMS.length < ASSESSMENT_REQUIREMENTS.minExamVersions) {
  throw new Error(`final exam forms: ${FORMS.length} versions against the § 535.62(b)(7) minimum of ${ASSESSMENT_REQUIREMENTS.minExamVersions}`);
}
if (new Set(FORM_IDS).size !== FORM_IDS.length) {
  throw new Error("final exam forms: duplicate version id");
}
if (Object.keys(FORM_CELLS).length !== FORMS.length) {
  throw new Error("final exam forms: FORM_CELLS and FORMS disagree on the number of versions");
}

/* Ten of the bank's 22 cells per version: six pair-groups of three cells cover the six version
   pairs exactly once each (18 cells), plus one cell exclusive to each version (4 cells). */
export const CELLS_PER_VERSION = 10;
const SHARED_CELLS = 3 * ((FORMS.length * (FORMS.length - 1)) / 2); /* three cells per version pair */
const EXCLUSIVE_CELLS = FORMS.length; /* one cell reserved to each version */
if (SHARED_CELLS + EXCLUSIVE_CELLS !== CELL_COUNT) {
  throw new Error(`final exam forms: the cell design accounts for ${SHARED_CELLS + EXCLUSIVE_CELLS} cells against the bank's ${CELL_COUNT}`);
}
if (SHARED_CELLS * 2 + EXCLUSIVE_CELLS !== CELLS_PER_VERSION * FORMS.length) {
  throw new Error("final exam forms: the cell design does not account for every version slot");
}

const bankIds = new Set(FINAL_EXAM_BANK.map((entry) => entry.id));
const appearances = new Map();

for (const form of FORMS) {
  if (form.itemCount < ASSESSMENT_REQUIREMENTS.minQuestionsPerExamVersion) {
    throw new Error(
      `final exam forms: version ${form.id} carries ${form.itemCount} items against the § 535.62(b)(7) minimum of ${ASSESSMENT_REQUIREMENTS.minQuestionsPerExamVersion}`,
    );
  }
  if (new Set(form.itemIds).size !== form.itemIds.length) {
    throw new Error(`final exam forms: version ${form.id} repeats an item`);
  }
  for (const itemId of form.itemIds) {
    if (!bankIds.has(itemId)) {
      throw new Error(`final exam forms: version ${form.id} names item ${itemId}, which is not in the bank`);
    }
    appearances.set(itemId, (appearances.get(itemId) ?? 0) + 1);
    const entry = byId.get(itemId);
    /* § 535.62(b)(7)(H)(ii) — no version may contain any true/false question. Re-checked here at
       the version level rather than relying on the bank's own check. */
    if (entry.choices.length !== 4) {
      throw new Error(`final exam forms: version ${form.id} carries ${itemId} with ${entry.choices.length} choices`);
    }
    if (entry.correctChoice !== 0) {
      throw new Error(`final exam forms: version ${form.id} carries ${itemId} whose correct answer is not authored first`);
    }
  }
  /* § 535.62(b)(7)(H)(i) — each version must cover each topic required for the course. */
  const covered = new Set(form.itemIds.map((itemId) => byId.get(itemId).topic));
  for (const topic of TOPICS) {
    if (!covered.has(topic.code)) {
      throw new Error(`final exam forms: version ${form.id} does not cover PRINS2-1 topic ${topic.code} (${topic.topic})`);
    }
  }
  if (covered.size !== TOPICS.length) {
    throw new Error(`final exam forms: version ${form.id} covers ${covered.size} topics against the form's ${TOPICS.length}`);
  }
  if (form.cells.length !== CELLS_PER_VERSION) {
    throw new Error(`final exam forms: version ${form.id} draws on ${form.cells.length} cells rather than ${CELLS_PER_VERSION}`);
  }
  if (form.cells.some((cell) => !Number.isInteger(cell) || cell < 1 || cell > CELL_COUNT)) {
    throw new Error(`final exam forms: version ${form.id} names a cell outside 1..${CELL_COUNT}`);
  }
}

/* § 535.62(b)(7)(H)(iii) — no version may repeat more than one third of the questions from other
   versions. Computed above and asserted here. */
for (const row of PAIRWISE_OVERLAP) {
  if (!row.withinCap) {
    throw new Error(
      `final exam forms: versions ${row.pair} share ${row.sharedItems} of ${row.shorterVersionItems} items (${row.percentOfShorter}%), above the one-third cap`,
    );
  }
}
if (PAIRWISE_OVERLAP.length !== (FORMS.length * (FORMS.length - 1)) / 2) {
  throw new Error("final exam forms: the pairwise overlap matrix is incomplete");
}

/* Every bank item must be reachable on some version — an unused item is a bank item that has never
   been exposed to review through an actual administration. */
for (const entry of FINAL_EXAM_BANK) {
  if (!appearances.has(entry.id)) {
    throw new Error(`final exam forms: bank item ${entry.id} appears on no version`);
  }
}
if (appearances.size !== BANK_SIZE) {
  throw new Error(`final exam forms: ${appearances.size} of ${BANK_SIZE} bank items are used`);
}

/* Scoring and rotation. */
if (SCORING.passingScorePercent !== 70 || SCORING.weighting !== "unweighted") {
  throw new Error("final exam forms: § 535.65(h)(4) requires an unweighted passing score of 70%");
}
if (ROTATION.order.length !== FORMS.length || ROTATION.order.some((id) => !FORM_IDS.includes(id))) {
  throw new Error("final exam forms: the rotation cycle must name every version exactly once");
}
if (new Set(ROTATION.order).size !== ROTATION.order.length) {
  throw new Error("final exam forms: the rotation cycle repeats a version");
}
if (!SUBSEQUENT_ATTEMPT.mustBeADifferentVersion || SUBSEQUENT_ATTEMPT.maxAttemptsBeforeRetakingTheCourse !== 2) {
  throw new Error("final exam forms: § 535.65(i) requires a different version for the subsequent attempt and no credit after a second failure");
}
if (EXAM_READY.trecApprovalHeld || EXAM_READY.texasCreditAvailable || EXAM_READY.status !== "BLOCKED") {
  throw new Error("final exam forms: approval and credit flags must remain false and EXAM_READY must remain BLOCKED until written TREC approval exists");
}
if (PRINS2_FORM.courseHours !== ASSESSMENT_REQUIREMENTS.creditHours) {
  throw new Error("final exam forms: the PRINS2-1 course hours and the assessment requirements disagree");
}

export default Object.freeze({
  FORMS,
  FORM_IDS,
  PAIRWISE_OVERLAP,
  OVERLAP_THRESHOLD,
  SCORING,
  ROTATION,
  SUBSEQUENT_ATTEMPT,
  ADMINISTRATION,
  EXAM_READY,
});
