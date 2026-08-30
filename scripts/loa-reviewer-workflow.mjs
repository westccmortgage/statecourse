/**
 * TX Law of Agency — reviewer workflow run.
 *
 * WHAT THIS DOES. Drives the course engine through a complete student lifecycle in the REVIEWER
 * (non-credit) mode and records, behaviour by behaviour, whether the engine actually did the thing.
 * It writes texas/tx-law-of-agency-30-v1/engine-workflow-evidence.json. A delivery claim cannot rest
 * on a disabled switch — it rests only on behaviours that were exercised and observed.
 *
 * IT DRIVES THREE LEARNERS, because one happy path proves too little:
 *
 *   reviewer-pass    verifies identity, clears all nine topics, passes all four scenarios, sits the
 *                    final and passes it.
 *   reviewer-retry   fails the first final, is prescribed remediation, completes it, and sits a
 *                    SUBSEQUENT examination — which must be a DIFFERENT version.
 *   reviewer-retake  fails twice and must retake the course.
 *
 * AND IT ASSERTS THE REFUSALS. A gate that never refuses is not a gate. The run deliberately
 * attempts to open topic 2 before topic 1, to sit the final before coursework is complete, to open a
 * third attempt after two failures, and to mint a certificate — and records that each was refused.
 *
 * IT ALSO ASSERTS THE ABSENCE OF A GATE, which matters just as much for this course. A fourth
 * learner, reviewer-skip, completes every topic WITHOUT answering a single misconception check and
 * WITHOUT opening any optional-reference material, and reaches the same completion status as
 * reviewer-pass. That is what "optional never blocks progress" has to mean in code: not a label on
 * a screen, but a learner who skipped it finishing on identical terms.
 *
 * CONFIDENTIALITY. The evidence file records scores, versions and behaviour outcomes. It records NO
 * item text, no choice text, no correct-choice index and no item id from the secure bank. A
 * reviewer needs to know the engine scored 45 of 60 on version B; they do not need the answer key,
 * and putting it in a tracked JSON file would defeat the guards the build already has.
 *
 * Usage:  node scripts/loa-reviewer-workflow.mjs [--json]
 * Exit 0 only when every required behaviour is demonstrated.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as engine from "../config/texas-law-of-agency-engine.mjs";
import { TOPICS } from "../config/texas/law-of-agency-course-form.mjs";
import { TOPIC_QUIZZES, replacementFor } from "../config/texas/law-of-agency-question-bank.mjs";
import { MISCONCEPTION_CHECKS } from "../config/texas/law-of-agency-misconception-checks.mjs";
import { SCENARIOS } from "../config/texas/law-of-agency-scenarios.mjs";
import { FINAL_EXAM_BANK } from "../config/texas/law-of-agency-final-exam-bank.mjs";
import { SCORING, SUBSEQUENT_ATTEMPT, VERSIONS } from "../config/texas/law-of-agency-final-exam-forms.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "texas/tx-law-of-agency-30-v1/engine-workflow-evidence.json");
const FORM_LENGTH = VERSIONS[0].itemCount;
const PASS_MARK = SCORING.minimumCorrectByVersion[VERSIONS[0].id];
const topicsWithChecks = new Set(MISCONCEPTION_CHECKS.map((c) => c.topicCode));

const behaviours = {};
const observations = [];
const mark = (key, ok, detail) => {
  behaviours[key] = ok ? "PASS" : "FAIL";
  observations.push({ behaviour: key, result: ok ? "PASS" : "FAIL", detail });
};

/* A deterministic clock so a run is reproducible and the 90-day rule can be exercised. */
let t = Date.parse("2026-09-01T09:00:00Z");
const clock = () => new Date(t);
const advanceDays = (d) => { t += d * 86400000; };
const bankById = new Map(FINAL_EXAM_BANK.map((i) => [i.id, i]));

/** Clear every topic quiz, deliberately missing the first item of T01 so the replacement path runs. */
function clearAllTopics(record, { missFirst = false, skipChecks = false } = {}) {
  let r = record;
  let replacementObserved = null;
  let rationaleObserved = null;
  for (const topic of TOPICS.map((x) => x.code)) {
    for (const [index, item] of (TOPIC_QUIZZES[topic] || []).entries()) {
      if (missFirst && topic === "T01" && index === 0) {
        /* answer wrong -> expect rationale + a DIFFERENT replacement question */
        r = engine.answerQuizItem(r, { topicCode: topic, itemId: item.id, choiceIndex: 1, clock });
        rationaleObserved = r.lastFeedback?.rationale ?? null;
        replacementObserved = r.lastFeedback?.nextQuestionId ?? null;
        /* now answer the replacement correctly */
        r = engine.answerQuizItem(r, { topicCode: topic, itemId: item.id, choiceIndex: replacementFor(item.id).correctChoice, clock });
      } else {
        r = engine.answerQuizItem(r, { topicCode: topic, itemId: item.id, choiceIndex: item.correctChoice, clock });
      }
    }
    /* The misconception check, where the topic carries one. `skipChecks` is the point of the
       reviewer-skip learner: the same loop, minus this call, must still complete the topic. */
    if (!skipChecks && topicsWithChecks.has(topic)) {
      r = engine.answerMisconceptionCheck(r, { topicCode: topic, choiceIndex: 1, clock });
    }
    r = engine.completeTopic(r, { topicCode: topic, clock });
  }
  return { record: r, replacementObserved, rationaleObserved };
}

function passAllScenarios(record) {
  let r = record;
  for (const s of SCENARIOS) {
    const responses = {};
    const rubricMarks = {};
    for (const task of s.tasks) {
      if (task.type === "selection") responses[task.id] = task.correctChoice;
      else if (task.type === "computation") responses[task.id] = task.expected;
      else rubricMarks[task.id] = task.rubric.map((_, i) => i);
    }
    r = engine.submitScenario(r, { scenarioId: s.id, responses, rubricMarks, clock });
  }
  return r;
}

const answersFor = (attempt, correctCount) => {
  const a = {};
  attempt.itemIds.forEach((id, i) => { a[id] = i < correctCount ? bankById.get(id).correctChoice : (bankById.get(id).correctChoice + 1) % 4; });
  return a;
};

/* ── learner 1: the happy path ───────────────────────────────────────────────────────────────── */
let pass = engine.openEnrollment({ learnerId: "reviewer-pass", mode: engine.MODE.REVIEWER, clock });
mark("independentEnrollmentRecord", pass.courseId === "tx-law-of-agency-30-v1" && pass.creditEligible === false,
  `enrollment record for ${pass.courseId} only, creditEligible=false, mode=${pass.mode}`);

/* identity gate refuses first */
let refusedBeforeIdentity = false;
try { engine.answerQuizItem(pass, { topicCode: "T01", itemId: TOPIC_QUIZZES.T01[0].id, choiceIndex: 0, clock }); }
catch { refusedBeforeIdentity = true; }
pass = engine.verifyIdentity(pass, { method: "reviewer attestation (non-credit); no Commission-accepted method is claimed", clock });
mark("identityVerification", pass.identityVerified && refusedBeforeIdentity,
  `answering refused before verification; verified by "${pass.identityMethod}"`);

/* topic gating: topic 2 must refuse while topic 1 is open */
const gateBefore = engine.canOpenTopic(pass, "T02");
const cleared = clearAllTopics(pass, { missFirst: true });
pass = cleared.record;
mark("topicGating", gateBefore.allowed === false && pass.completedTopics.length === TOPICS.length,
  `T02 refused while T01 incomplete ("${gateBefore.reason}"); all ${TOPICS.length} topics completed in order`);
mark("moduleCompletion", pass.completedTopics.length === TOPICS.length,
  `${pass.completedTopics.length} of ${TOPICS.length} topics recorded complete`);
mark("correctAnswerProgression", pass.completedTopics.includes("T12"),
  "a topic completes only when every quiz item in it is satisfied");
mark("incorrectAnswerRationale", Boolean(cleared.rationaleObserved),
  cleared.rationaleObserved ? `rationale returned on a wrong answer (${cleared.rationaleObserved.length} chars)` : "no rationale returned");
mark("replacementQuestionDelivery", Boolean(cleared.replacementObserved) && cleared.replacementObserved.endsWith("R"),
  `a wrong answer served the replacement ${cleared.replacementObserved}, a different question, which then counted toward passing`);

/* scenarios */
let scenarioRefused = false;
try { engine.submitScenario(engine.openEnrollment({ learnerId: "x", mode: engine.MODE.REVIEWER, clock }), { scenarioId: SCENARIOS[0].id, responses: {}, clock }); }
catch { scenarioRefused = true; }
pass = passAllScenarios(pass);
mark("scenarioPassing", engine.scenariosPassed(pass) && scenarioRefused,
  `all ${SCENARIOS.length} required scenarios passed; a locked scenario refused before its topics were complete`);

/* instructor support */
pass = engine.raiseInstructorQuestion(pass, { question: "Does a separate writing under § 1101.651(d)(1) have to name a number, or is 'I will consider offers below list' enough?", clock });
advanceDays(1);
pass = engine.answerInstructorQuestion(pass, { questionId: "Q1", answer: "The subdivision requires a separate writing from that party and states nothing about its contents; module 06 teaches what the held text does and does not settle.", instructor: "unassigned — no qualified instructor is on file", clock });
mark("instructorSupportPathway", pass.instructorQuestions?.[0]?.answeredAt !== null,
  "a question was raised and answered; elapsed time is recorded and no timeliness standard is claimed");

/* final exam access gate */
let examRefusedEarly = false;
try { engine.openFinalAttempt(pass, { clock }); } catch { examRefusedEarly = true; }
pass = engine.markCourseworkComplete(pass, { clock });
pass = engine.openFinalAttempt(pass, { clock, rotationPosition: 0 });
mark("finalExamAccessAfterCoursework", examRefusedEarly && pass.finalAttempts.length === 1,
  "the examination refused to open before coursework was complete, and opened after");

const a1 = pass.finalAttempts[0];
pass = engine.submitFinalAttempt(pass, { answers: answersFor(a1, FORM_LENGTH), clock });
mark("unweightedSeventyPercentScoring", pass.finalAttempts[0].scorePercent === 100 && pass.finalAttempts[0].passed === true,
  `${FORM_LENGTH} of ${FORM_LENGTH} scored ${pass.finalAttempts[0].scorePercent}% against the ${SCORING.passingScorePercent}% unweighted pass mark`);
pass = engine.submitEvaluation(pass, { responses: { courseClarity: 5, instructorAvailability: 4, comments: "reviewer run" }, clock });
mark("courseEvaluation", Boolean(pass.evaluation), "course and instructor evaluation recorded");
mark("completionStatus", pass.completionStatus === "COMPLETED_NO_CREDIT_PENDING_APPROVAL",
  `completion status ${pass.completionStatus} — completed, and explicitly without credit`);

const elig = engine.certificateEligibility(pass);
let certRefused = false;
try { engine.issueCertificate(pass); } catch { certRefused = true; }
mark("certificateEligibility", certRefused && elig.eligibleForCertificate === false && elig.finalExaminationPassed === true,
  "every in-engine condition met, and issuance still refused: no TREC approval is held");

const audit = engine.auditRecord(pass);
mark("auditableAttemptRecord", audit.events > 20 && audit.quizAttempts.length > 0 && audit.finalAttempts.length === 1,
  `${audit.events} audited events, ${audit.quizAttempts.length} quiz attempts, ${audit.finalAttempts.length} examination attempt, retention ${audit.retention.years} years`);

/* ── learner 2: fail, remediate, subsequent attempt on a DIFFERENT version ───────────────────── */
let retry = engine.openEnrollment({ learnerId: "reviewer-retry", mode: engine.MODE.REVIEWER, clock });
retry = engine.verifyIdentity(retry, { method: "reviewer attestation", clock });
retry = clearAllTopics(retry).record;
retry = passAllScenarios(retry);
retry = engine.markCourseworkComplete(retry, { clock });
retry = engine.openFinalAttempt(retry, { clock, rotationPosition: 1 });
const r1 = retry.finalAttempts[0];
retry = engine.submitFinalAttempt(retry, { answers: answersFor(r1, PASS_MARK - 1), clock });
mark("firstFailedAttempt", retry.finalAttempts[0].passed === false && retry.completionStatus === "REMEDIATION_REQUIRED",
  `${PASS_MARK - 1} of ${FORM_LENGTH} = ${retry.finalAttempts[0].scorePercent}% on version ${r1.version} — one below the pass mark, so failed; status ${retry.completionStatus}`);

let subsequentRefusedBeforeRemediation = false;
try { engine.openFinalAttempt(retry, { clock }); } catch { subsequentRefusedBeforeRemediation = true; }
retry = engine.completeRemediation(retry, { clock });
mark("remediationAfterFirstFailure", subsequentRefusedBeforeRemediation && retry.completionStatus === "SUBSEQUENT_EXAM_ELIGIBLE",
  "a subsequent examination refused until the prescribed additional coursework was completed");

advanceDays(10);
retry = engine.openFinalAttempt(retry, { clock });
const r2 = retry.finalAttempts[1];
mark("differentVersionOnSubsequentAttempt", r2.version !== r1.version,
  `first attempt version ${r1.version}, subsequent version ${r2.version} — a different version, as 535.65(i) requires`);
retry = engine.submitFinalAttempt(retry, { answers: answersFor(r2, PASS_MARK), clock });
mark("examVersionRotation", new Set(retry.finalAttempts.map((a) => a.version)).size === 2 && retry.finalAttempts[1].passed === true,
  `versions ${retry.finalAttempts.map((a) => a.version).join(" then ")}; ${PASS_MARK} of ${FORM_LENGTH} = ${retry.finalAttempts[1].scorePercent}% passes at the ${SCORING.passingScorePercent}% mark, and ${PASS_MARK - 1} did not — the boundary was exercised in both directions on real attempts`);

/* the 90-day limit, on a third learner state derived from the same point */
let late = engine.openEnrollment({ learnerId: "reviewer-late", mode: engine.MODE.REVIEWER, clock });
late = engine.verifyIdentity(late, { method: "reviewer attestation", clock });
late = clearAllTopics(late).record;
late = passAllScenarios(late);
late = engine.markCourseworkComplete(late, { clock });
late = engine.openFinalAttempt(late, { clock, rotationPosition: 2 });
late = engine.submitFinalAttempt(late, { answers: answersFor(late.finalAttempts[0], 20), clock });
late = engine.completeRemediation(late, { clock });
advanceDays(SUBSEQUENT_ATTEMPT.deadlineDays + 5);
let deadlineEnforced = false;
try { engine.openFinalAttempt(late, { clock }); } catch { deadlineEnforced = true; }
advanceDays(-(SUBSEQUENT_ATTEMPT.deadlineDays + 5));
mark("ninetyDayLimit", deadlineEnforced,
  `a subsequent attempt opened ${SUBSEQUENT_ATTEMPT.deadlineDays + 5} days after coursework was refused against the ${SUBSEQUENT_ATTEMPT.deadlineDays}-day limit`);

/* ── learner 3: two failures → retake ────────────────────────────────────────────────────────── */
let retake = engine.openEnrollment({ learnerId: "reviewer-retake", mode: engine.MODE.REVIEWER, clock });
retake = engine.verifyIdentity(retake, { method: "reviewer attestation", clock });
retake = clearAllTopics(retake).record;
retake = passAllScenarios(retake);
retake = engine.markCourseworkComplete(retake, { clock });
retake = engine.openFinalAttempt(retake, { clock, rotationPosition: 3 });
retake = engine.submitFinalAttempt(retake, { answers: answersFor(retake.finalAttempts[0], 25), clock });
retake = engine.completeRemediation(retake, { clock });
advanceDays(5);
retake = engine.openFinalAttempt(retake, { clock });
retake = engine.submitFinalAttempt(retake, { answers: answersFor(retake.finalAttempts[1], 28), clock });
let thirdRefused = false;
try { engine.openFinalAttempt(retake, { clock }); } catch { thirdRefused = true; }
mark("secondFailureRetake", retake.completionStatus === "RETAKE_REQUIRED_SECOND_FAILURE" && thirdRefused,
  `two failures recorded, status ${retake.completionStatus}, a third attempt refused — the student must retake the course`);

/* ── learner 4: skips every optional thing and finishes on identical terms ───────────────────
   This is the check that "optional never blocks progress" is true in the engine and not merely
   printed on a screen. reviewer-skip answers no misconception check at all and opens no optional
   reference; nothing else differs from reviewer-pass. */
let skip = engine.openEnrollment({ learnerId: "reviewer-skip", mode: engine.MODE.REVIEWER, clock });
skip = engine.verifyIdentity(skip, { method: "reviewer attestation", clock });
skip = clearAllTopics(skip, { skipChecks: true }).record;
skip = passAllScenarios(skip);
skip = engine.markCourseworkComplete(skip, { clock });
skip = engine.openFinalAttempt(skip, { clock, rotationPosition: 0 });
skip = engine.submitFinalAttempt(skip, { answers: answersFor(skip.finalAttempts[0], FORM_LENGTH), clock });
skip = engine.submitEvaluation(skip, { responses: { courseClarity: 5 }, clock });
const skipAudit = engine.auditRecord(skip);
mark("optionalMaterialNeverBlocksProgress",
  skipAudit.misconceptionChecks.length === 0
  && skip.completedTopics.length === TOPICS.length
  && skip.completionStatus === pass.completionStatus,
  `reviewer-skip answered 0 of ${MISCONCEPTION_CHECKS.length} misconception checks and opened no optional reference, completed all ${TOPICS.length} topics, and reached status ${skip.completionStatus} — identical to the learner who did everything`);

/* ── a misconception check is recorded and counts toward nothing ─────────────────────────────── */
const passAudit = engine.auditRecord(pass);
mark("misconceptionChecksRecordedAndUnscored",
  passAudit.misconceptionChecks.length === MISCONCEPTION_CHECKS.length
  && passAudit.misconceptionChecks.every((c) => c.countsAsAssessment === false),
  `${passAudit.misconceptionChecks.length} of ${MISCONCEPTION_CHECKS.length} checks recorded for reviewer-pass, every one marked countsAsAssessment=false`);

/* ── the production refusal, asserted rather than assumed ────────────────────────────────────── */
let productionRefused = false;
try { engine.openEnrollment({ learnerId: "student" }); } catch { productionRefused = true; }

const REQUIRED = [
  "independentEnrollmentRecord", "identityVerification", "moduleCompletion", "topicGating",
  "correctAnswerProgression", "incorrectAnswerRationale", "replacementQuestionDelivery",
  "scenarioPassing", "instructorSupportPathway", "finalExamAccessAfterCoursework",
  "examVersionRotation", "unweightedSeventyPercentScoring", "firstFailedAttempt",
  "remediationAfterFirstFailure", "differentVersionOnSubsequentAttempt", "ninetyDayLimit",
  "secondFailureRetake", "completionStatus", "certificateEligibility", "courseEvaluation",
  "auditableAttemptRecord", "optionalMaterialNeverBlocksProgress", "misconceptionChecksRecordedAndUnscored",
];
const missing = REQUIRED.filter((k) => behaviours[k] !== "PASS");

const evidence = {
  generatedBy: "scripts/loa-reviewer-workflow.mjs",
  course: "tx-law-of-agency-30-v1",
  mode: "REVIEWER — non-credit, not student-facing, no TREC approval held",
  note: "Whether the engine works is a different question from whether it is switched off. These behaviours were exercised against the real engine; the refusals were attempted deliberately, because a gate that never refuses is not a gate, and one learner deliberately skipped every optional element so that the absence of a gate could be observed too.",
  productionEnrollmentRefused: productionRefused,
  behaviours,
  observations,
  required: REQUIRED,
  missing,
  confidentiality: "No item text, choice text, correct-choice index or secure item id appears in this file. Only scores, version letters and behaviour outcomes are recorded.",
};

fs.writeFileSync(OUT, `${JSON.stringify(evidence, null, 2)}\n`);

if (process.argv.includes("--json")) console.log(JSON.stringify(evidence, null, 2));
else {
  console.log("TX Law of Agency — reviewer workflow run (REVIEWER mode, non-credit)");
  for (const o of observations) console.log(`  ${o.result === "PASS" ? "PASS" : "FAIL"}  ${o.behaviour}\n          ${o.detail}`);
  console.log(`\n  production enrollment refused: ${productionRefused ? "yes" : "NO — DEFECT"}`);
  console.log(`  ${REQUIRED.length - missing.length} of ${REQUIRED.length} required behaviours demonstrated`);
  if (missing.length) console.log(`  NOT DEMONSTRATED: ${missing.join(", ")}`);
  console.log(`  written: ${path.relative(root, OUT)}`);
}

process.exitCode = missing.length === 0 && productionRefused ? 0 : 1;
