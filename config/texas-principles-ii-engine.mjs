/**
 * Texas Principles of Real Estate II — course engine.
 *
 * WHAT THIS IS FOR. Acceptance point 16 asks whether the course ENGINE works, which is a different
 * question from whether the course is safely switched off. An earlier version of the acceptance
 * report conflated the two and passed point 16 because enrollment was disabled — that proved an
 * unapproved course cannot accidentally operate, and proved nothing about delivery. This module is
 * the engine those behaviours are asserted against.
 *
 * TWO MODES, AND THE DIFFERENCE IS NOT COSMETIC.
 *
 *   PRODUCTION — refused outright. `openEnrollment` throws unless the course record says enrollment
 *   is enabled, and it is disabled and asserted disabled by the test suite. No student can be
 *   enrolled, no attempt served, no credit reported, no certificate issued.
 *
 *   REVIEWER — a named, non-credit environment for exercising the workflow. Every record it creates
 *   carries `mode: "REVIEWER"`, `creditEligible: false` and `trecApproval: "NOT_SUBMITTED_NOT_APPROVED"`,
 *   and `issueCertificate` refuses to mint anything in it. A reviewer run can demonstrate that the
 *   engine gates, scores, rotates and records correctly WITHOUT any of that becoming a claim that
 *   the course may be taken for Texas credit.
 *
 * WHY THE STATE IS PASSED IN AND RETURNED, NEVER MUTATED. Every function here takes a record and
 * returns a new one. That makes each behaviour independently assertable — a test can drive a
 * student to the exact state it wants to examine without replaying a session — and it makes the
 * audit trail append-only by construction rather than by discipline.
 *
 * WHAT THIS ENGINE DELIBERATELY DOES NOT DO. It does not decide whether the examination may be
 * administered. That belongs to EXAM_READY in the forms module, which is BLOCKED while the codified
 * 22 TAC provider rules remain unread, and `openFinalAttempt` consults it on every call. A reviewer
 * attempt is permitted only because it is explicitly non-credit and is labelled so in the record.
 */

import { COURSE } from "./texas/principles-ii-course.mjs";
import { TOPICS } from "./texas/principles-ii-course-form.mjs";
import { TOPIC_QUIZZES } from "./texas/principles-ii-question-bank.mjs";
import { SCENARIOS } from "./texas/principles-ii-scenarios.mjs";
import { FORMS, SCORING, ROTATION, SUBSEQUENT_ATTEMPT, EXAM_READY } from "./texas/principles-ii-final-exam-forms.mjs";
import { FINAL_EXAM_BANK } from "./texas/principles-ii-final-exam-bank.mjs";

export const MODE = Object.freeze({ PRODUCTION: "PRODUCTION", REVIEWER: "REVIEWER" });

const TOPIC_ORDER = TOPICS.map((t) => t.code);
const bankById = new Map(FINAL_EXAM_BANK.map((i) => [i.id, i]));
const scenarioById = new Map(SCENARIOS.map((s) => [s.id, s]));

const now = (clock) => (clock ? clock() : new Date()).toISOString();
const clone = (record) => JSON.parse(JSON.stringify(record));

/** Every state change appends here. Nothing rewrites an earlier entry. */
function audit(record, event, detail) {
  record.auditTrail.push({ at: record.clockNow, event, detail });
  return record;
}

/* ── enrollment and identity ─────────────────────────────────────────────────────────────────── */

/**
 * An enrollment record for THIS course only. Principles I and II are separate TREC courses with
 * separate approvals and separate completion records; an enrollment in one is not an enrollment in
 * the other, and nothing here may be shared between them.
 */
export function openEnrollment({ learnerId, mode = MODE.PRODUCTION, clock } = {}) {
  if (!learnerId) throw new Error("engine: an enrollment needs a learner id");
  if (mode === MODE.PRODUCTION && !COURSE.enrollmentEnabled) {
    throw new Error("engine: production enrollment is disabled for this course — StateCourse holds no TREC approval and no Texas credit is available");
  }
  if (mode !== MODE.PRODUCTION && mode !== MODE.REVIEWER) throw new Error(`engine: unknown mode ${mode}`);
  const record = {
    courseId: COURSE.courseId,
    approvalForm: COURSE.approvalForm,
    learnerId,
    mode,
    creditEligible: false,
    trecApproval: COURSE.trecApprovalStatus,
    clockNow: now(clock),
    identityVerified: false,
    identityMethod: null,
    completedTopics: [],
    quizState: {},
    scenarioResults: {},
    finalAttempts: [],
    courseworkCompletedAt: null,
    completionStatus: "IN_PROGRESS",
    certificate: null,
    evaluation: null,
    auditTrail: [],
  };
  return audit(record, "enrollment.opened", { mode, creditEligible: false });
}

/**
 * 22 TAC § 535.65(a)(1) as published requires validation of student identity acceptable to the
 * Commission. WHAT that validation must be is not stated in the text held for this build, so the
 * engine records the method used and refuses to proceed without one, rather than inventing a
 * standard and presenting it as the rule's.
 */
export function verifyIdentity(record, { method, evidenceRef, clock } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  if (!method) throw new Error("engine: identity verification needs a named method");
  next.identityVerified = true;
  next.identityMethod = method;
  return audit(next, "identity.verified", { method, evidenceRef: evidenceRef ?? null, standard: "PROVIDER_METHOD_PENDING_COMMISSION_ACCEPTANCE" });
}

/* ── topic progression ───────────────────────────────────────────────────────────────────────── */

/** The next topic a learner may open: the first not yet completed, in the form's own order. */
export function nextTopic(record) {
  return TOPIC_ORDER.find((code) => !record.completedTopics.includes(code)) ?? null;
}

/**
 * A topic opens only when identity is verified and every earlier topic is complete. This is the
 * gate 535.62(b)(7) describes for distance delivery — a student may not move to the next topic
 * until the current one's quiz questions are answered correctly.
 */
export function canOpenTopic(record, topicCode) {
  if (!TOPIC_ORDER.includes(topicCode)) return { allowed: false, reason: `unknown topic ${topicCode}` };
  if (!record.identityVerified) return { allowed: false, reason: "identity not verified" };
  const index = TOPIC_ORDER.indexOf(topicCode);
  const unmet = TOPIC_ORDER.slice(0, index).filter((c) => !record.completedTopics.includes(c));
  if (unmet.length) return { allowed: false, reason: `earlier topics incomplete: ${unmet.join(", ")}` };
  return { allowed: true, reason: null };
}

/**
 * Answer a topic-quiz item.
 *
 * Correct → the item is satisfied.
 * Incorrect → the RATIONALE is returned and the item's REPLACEMENT becomes the served question.
 * The replacement counts toward passing the topic if answered correctly; the missed primary is
 * never re-served. That is the shape § 535.62(b)(7) prescribes, and the engine returns the
 * rationale rather than expecting a surface to find it.
 */
export function answerQuizItem(record, { topicCode, itemId, choiceIndex, clock } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  const gate = canOpenTopic(next, topicCode);
  if (!gate.allowed) throw new Error(`engine: cannot answer in ${topicCode} — ${gate.reason}`);
  const items = TOPIC_QUIZZES[topicCode] || [];
  const item = items.find((i) => i.id === itemId);
  if (!item) throw new Error(`engine: ${itemId} is not an item of ${topicCode}`);

  const state = next.quizState[topicCode] || (next.quizState[topicCode] = {});
  const entry = state[itemId] || (state[itemId] = { satisfied: false, servedReplacement: false, attempts: [] });
  if (entry.satisfied) return audit(next, "quiz.alreadySatisfied", { topicCode, itemId });

  const serving = entry.servedReplacement ? item.replacement : item;
  const correct = choiceIndex === serving.correctChoice;
  entry.attempts.push({ questionId: serving.id, kind: entry.servedReplacement ? "replacement" : "primary", choiceIndex, correct, at: next.clockNow });

  if (correct) {
    entry.satisfied = true;
    audit(next, "quiz.correct", { topicCode, itemId, questionId: serving.id, kind: entry.servedReplacement ? "replacement" : "primary" });
    next.lastFeedback = { correct: true, rationale: serving.rationale, remediation: null, nextQuestionId: null };
  } else if (!entry.servedReplacement) {
    entry.servedReplacement = true;
    audit(next, "quiz.incorrect.replacementServed", { topicCode, itemId, rationaleShown: true, replacementId: item.replacement.id });
    next.lastFeedback = { correct: false, rationale: item.rationale, remediation: item.remediation, nextQuestionId: item.replacement.id };
  } else {
    /* Wrong on the replacement too: the rationale is shown again and the replacement stays served.
       The rule does not authorise re-serving the original, so the engine does not. */
    audit(next, "quiz.incorrect.replacementRetained", { topicCode, itemId, replacementId: item.replacement.id });
    next.lastFeedback = { correct: false, rationale: item.replacement.rationale, remediation: item.remediation, nextQuestionId: item.replacement.id };
  }
  return next;
}

export function topicQuizComplete(record, topicCode) {
  const items = TOPIC_QUIZZES[topicCode] || [];
  const state = record.quizState[topicCode] || {};
  return items.length > 0 && items.every((i) => state[i.id]?.satisfied === true);
}

/** A topic completes when its quiz is fully satisfied. Recorded, then the next topic opens. */
export function completeTopic(record, { topicCode, clock } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  if (!topicQuizComplete(next, topicCode)) {
    throw new Error(`engine: ${topicCode} quiz is not fully satisfied — the student may not move on`);
  }
  if (!next.completedTopics.includes(topicCode)) next.completedTopics.push(topicCode);
  return audit(next, "topic.completed", { topicCode });
}

/* ── scenarios ───────────────────────────────────────────────────────────────────────────────── */

/**
 * Grade a scenario. Selection tasks compare to the authored index; computation tasks compare within
 * the task's own tolerance; short-answer tasks are scored against their rubric by the number of
 * named elements the reviewer marks met. Nothing is scored on length — the scenarios module refuses
 * to load a task carrying a length requirement, and this engine has no code path that reads one.
 */
export function submitScenario(record, { scenarioId, responses, rubricMarks = {}, clock } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  const scenario = scenarioById.get(scenarioId);
  if (!scenario) throw new Error(`engine: unknown scenario ${scenarioId}`);
  const unmet = (scenario.placement?.unlockRequires || []).filter((t) => !next.completedTopics.includes(t));
  if (unmet.length) throw new Error(`engine: ${scenarioId} unlocks only after ${unmet.join(", ")}`);

  let earned = 0, possible = 0;
  const taskResults = [];
  for (const task of scenario.tasks) {
    possible += task.points;
    const response = responses?.[task.id];
    let correct = false;
    if (task.type === "selection") correct = response === task.correctChoice;
    else if (task.type === "computation") correct = typeof response === "number" && Math.abs(response - task.expected) <= task.tolerance;
    else if (task.type === "short-answer") {
      const met = rubricMarks[task.id] || [];
      correct = Array.isArray(met) && met.length >= Math.ceil(task.rubric.length * 0.7);
    }
    if (correct) earned += task.points;
    taskResults.push({ taskId: task.id, type: task.type, correct, points: correct ? task.points : 0, feedback: correct ? task.feedbackCorrect : task.feedbackIncorrect, remediation: correct ? null : task.remediation });
  }
  const fraction = possible ? earned / possible : 0;
  const passed = fraction >= scenario.passingScore;
  next.scenarioResults[scenarioId] = { earned, possible, fraction, passed, taskResults, instructorReviewRequired: Boolean(scenario.instructorReview?.required), at: next.clockNow };
  return audit(next, passed ? "scenario.passed" : "scenario.failed", { scenarioId, earned, possible, fraction: Number(fraction.toFixed(3)) });
}

export const requiredScenarioIds = () => SCENARIOS.map((s) => s.id);
export const scenariosPassed = (record) => requiredScenarioIds().every((id) => record.scenarioResults[id]?.passed === true);

/* ── instructor support ──────────────────────────────────────────────────────────────────────── */

/**
 * § 535.65 requires a qualified instructor available to answer student questions in a timely
 * manner. The engine records the request and its answer; WHAT counts as timely is not stated in the
 * held text, so the record carries the elapsed time and does not assert compliance with a deadline
 * this build has not read.
 */
export function raiseInstructorQuestion(record, { question, clock } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  const id = `Q${next.auditTrail.filter((e) => e.event === "instructor.questionRaised").length + 1}`;
  next.instructorQuestions = next.instructorQuestions || [];
  next.instructorQuestions.push({ id, question, raisedAt: next.clockNow, answeredAt: null, answer: null });
  return audit(next, "instructor.questionRaised", { id });
}

export function answerInstructorQuestion(record, { questionId, answer, instructor, clock } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  const entry = (next.instructorQuestions || []).find((q) => q.id === questionId);
  if (!entry) throw new Error(`engine: unknown instructor question ${questionId}`);
  entry.answer = answer;
  entry.answeredAt = next.clockNow;
  entry.instructor = instructor ?? "unassigned — no qualified instructor is on file for this course";
  return audit(next, "instructor.questionAnswered", { id: questionId, elapsedMs: Date.parse(entry.answeredAt) - Date.parse(entry.raisedAt) });
}

/* ── coursework completion and the final examination ─────────────────────────────────────────── */

export function courseworkComplete(record) {
  const topics = TOPIC_ORDER.every((c) => record.completedTopics.includes(c));
  return topics && scenariosPassed(record);
}

export function markCourseworkComplete(record, { clock } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  if (!courseworkComplete(next)) throw new Error("engine: regular coursework is not complete");
  next.courseworkCompletedAt = next.clockNow;
  return audit(next, "coursework.completed", { topics: TOPIC_ORDER.length, scenarios: requiredScenarioIds().length });
}

/** Which version this attempt gets. First attempt follows the rotation cycle; a subsequent attempt
    must be a version the student has not already seen — § 535.65(i). */
export function assignVersion(record) {
  const seen = record.finalAttempts.map((a) => a.version);
  const cycle = ROTATION.order;
  if (!seen.length) {
    const position = record.rotationPosition ?? 0;
    return cycle[position % cycle.length];
  }
  const unseen = cycle.filter((v) => !seen.includes(v));
  if (!unseen.length) throw new Error("engine: every version has been served to this student");
  return unseen[0];
}

export function openFinalAttempt(record, { clock, rotationPosition } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  if (rotationPosition !== undefined) next.rotationPosition = rotationPosition;
  if (!next.courseworkCompletedAt) throw new Error("engine: the final examination opens only after regular coursework is complete");
  if (next.mode === MODE.PRODUCTION) {
    throw new Error(`engine: the final examination is not administrable — EXAM_READY is ${EXAM_READY.status} (${EXAM_READY.blockedBy})`);
  }
  const priorFailures = next.finalAttempts.filter((a) => a.passed === false).length;
  if (priorFailures >= SUBSEQUENT_ATTEMPT.maxAttemptsBeforeRetakingTheCourse) {
    throw new Error("engine: a student who fails the final examination twice must retake the course");
  }
  if (priorFailures === 1) {
    const last = next.finalAttempts[next.finalAttempts.length - 1];
    if (!last.remediationCompletedAt) throw new Error("engine: a subsequent examination opens only after the prescribed additional coursework");
    const elapsedDays = (Date.parse(next.clockNow) - Date.parse(next.courseworkCompletedAt)) / 86400000;
    if (elapsedDays > SUBSEQUENT_ATTEMPT.deadlineDays) {
      next.completionStatus = "DROPPED_NO_CREDIT_SUBSEQUENT_EXAM_DEADLINE";
      audit(next, "final.subsequentDeadlineMissed", { elapsedDays: Math.round(elapsedDays), deadlineDays: SUBSEQUENT_ATTEMPT.deadlineDays });
      throw new Error(`engine: the subsequent examination deadline of ${SUBSEQUENT_ATTEMPT.deadlineDays} days has passed — the student is dropped with no credit`);
    }
  }
  const version = assignVersion(next);
  const form = FORMS.find((f) => f.id === version);
  next.finalAttempts.push({
    attemptNumber: next.finalAttempts.length + 1,
    version, itemIds: [...form.itemIds], openedAt: next.clockNow,
    submittedAt: null, correct: null, scorePercent: null, passed: null,
    remediationPrescribedAt: null, remediationCompletedAt: null,
    creditEligible: false, mode: next.mode,
  });
  return audit(next, "final.attemptOpened", { attemptNumber: next.finalAttempts.length, version, creditEligible: false });
}

/** Unweighted scoring at 70%. Every item counts equally and none is dropped from the denominator. */
export function submitFinalAttempt(record, { answers, clock } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  const attempt = next.finalAttempts[next.finalAttempts.length - 1];
  if (!attempt || attempt.submittedAt) throw new Error("engine: no open final attempt");
  let correct = 0;
  for (const id of attempt.itemIds) {
    const item = bankById.get(id);
    if (!item) throw new Error(`engine: attempt references ${id}, which is not in the bank`);
    if (answers?.[id] === item.correctChoice) correct += 1;
  }
  const scorePercent = (correct / attempt.itemIds.length) * 100;
  attempt.submittedAt = next.clockNow;
  attempt.correct = correct;
  attempt.scorePercent = Number(scorePercent.toFixed(2));
  attempt.passed = scorePercent >= SCORING.passingScorePercent;
  audit(next, attempt.passed ? "final.passed" : "final.failed", { attemptNumber: attempt.attemptNumber, version: attempt.version, correct, of: attempt.itemIds.length, scorePercent: attempt.scorePercent });

  if (attempt.passed) {
    next.completionStatus = "COMPLETED_NO_CREDIT_PENDING_APPROVAL";
  } else if (next.finalAttempts.filter((a) => a.passed === false).length >= 2) {
    next.completionStatus = "RETAKE_REQUIRED_SECOND_FAILURE";
    audit(next, "course.retakeRequired", { reason: "a provider may not give credit to a student who fails a final examination and a subsequent final examination" });
  } else {
    next.completionStatus = "REMEDIATION_REQUIRED";
    attempt.remediationPrescribedAt = next.clockNow;
    audit(next, "final.remediationPrescribed", { attemptNumber: attempt.attemptNumber });
  }
  return next;
}

export function completeRemediation(record, { clock } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  const attempt = next.finalAttempts[next.finalAttempts.length - 1];
  if (!attempt || attempt.passed !== false) throw new Error("engine: no failed attempt awaiting remediation");
  attempt.remediationCompletedAt = next.clockNow;
  next.completionStatus = "SUBSEQUENT_EXAM_ELIGIBLE";
  return audit(next, "remediation.completed", { attemptNumber: attempt.attemptNumber });
}

/* ── completion, certificate, evaluation ─────────────────────────────────────────────────────── */

export function certificateEligibility(record) {
  const passed = record.finalAttempts.some((a) => a.passed === true);
  return {
    courseworkComplete: Boolean(record.courseworkCompletedAt),
    finalExaminationPassed: passed,
    identityVerified: record.identityVerified,
    evaluationSubmitted: Boolean(record.evaluation),
    trecApprovalHeld: false,
    creditEligible: false,
    eligibleForCertificate: false,
    reason: "StateCourse holds no TREC qualifying-education provider approval and no course approval for PRINS2-1. Every condition inside the engine may be met and no certificate may issue.",
  };
}

export function issueCertificate(record) {
  const eligibility = certificateEligibility(record);
  throw new Error(`engine: certificate issuance is disabled — ${eligibility.reason}`);
}

/** TREC requires course and instructor evaluation. The instrument is recorded; nothing is scored. */
export function submitEvaluation(record, { responses, clock } = {}) {
  const next = clone(record);
  next.clockNow = now(clock);
  next.evaluation = { responses: responses ?? {}, submittedAt: next.clockNow };
  return audit(next, "evaluation.submitted", { fields: Object.keys(responses ?? {}).length });
}

/* ── record retention ────────────────────────────────────────────────────────────────────────── */

export const RECORD_RETENTION = Object.freeze({
  years: 4,
  basis: "22 TAC § 535.65 as published by TREC requires a provider to maintain student course completion records. The four-year term is carried from the provider approval term in the fee schedule; the codified retention text has not been read and the difference is recorded in trec-rules-source-lock.mjs.",
  status: "PROVIDER_PROPOSED_PENDING_CODIFIED_TEXT",
});

export function auditRecord(record) {
  return Object.freeze({
    courseId: record.courseId,
    learnerId: record.learnerId,
    mode: record.mode,
    creditEligible: false,
    identityVerified: record.identityVerified,
    identityMethod: record.identityMethod,
    topicsCompleted: [...record.completedTopics],
    quizAttempts: Object.entries(record.quizState).flatMap(([topic, items]) =>
      Object.entries(items).flatMap(([itemId, s]) => s.attempts.map((a) => ({ topic, itemId, ...a })))),
    scenarioResults: Object.entries(record.scenarioResults).map(([id, r]) => ({ id, passed: r.passed, fraction: r.fraction })),
    finalAttempts: record.finalAttempts.map((a) => ({ attemptNumber: a.attemptNumber, version: a.version, scorePercent: a.scorePercent, passed: a.passed, creditEligible: false })),
    completionStatus: record.completionStatus,
    events: record.auditTrail.length,
    retention: RECORD_RETENTION,
  });
}

export default Object.freeze({
  MODE, openEnrollment, verifyIdentity, nextTopic, canOpenTopic, answerQuizItem, topicQuizComplete,
  completeTopic, submitScenario, requiredScenarioIds, scenariosPassed, raiseInstructorQuestion,
  answerInstructorQuestion, courseworkComplete, markCourseworkComplete, assignVersion,
  openFinalAttempt, submitFinalAttempt, completeRemediation, certificateEligibility,
  issueCertificate, submitEvaluation, auditRecord, RECORD_RETENTION,
});
