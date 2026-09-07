import test from "node:test";
import assert from "node:assert/strict";
import { createTexasReviewerEngine } from "../config/texas/complete-course-reviewer-engine.mjs";
import { prepareTexasFinal } from "../config/texas/complete-course-exam-delivery.mjs";

const at = "2026-09-07T12:00:00.000Z";
const choices = ["Correct", "Wrong one", "Wrong two", "Wrong three"];
const q = (id, tests, extra = {}) => ({ id, tests, choices, correctChoice: 0, prompt: `Question ${id}`, rationale: "The source resolves the distinction.", ...extra });
const fixture = () => {
  const topics = [1, 2].map(i => ({ code: `T0${i}`, units: [{ code: `T0${i}U1` }] }));
  const quizzes = Object.fromEntries(topics.map(t => [t.code, [1, 2, 3].map(i => q(`${t.code}Q${i}`, t.units[0].code))]));
  const replacements = Object.fromEntries(topics.map(t => [t.code, quizzes[t.code].map(p => q(`${p.id}R`, p.tests, { replaces: p.id }))]));
  const tasks = [
    { id: "select", type: "selection", choices, correctChoice: 0, critical: true },
    { id: "compute", type: "computation", answer: 125, tolerance: 0.01 },
    { id: "explain", type: "short-answer", rubric: [{ required: true }, {}, {}] },
  ];
  const scenarios = [{ id: "SC1", afterTopic: "T01", tasks, passingScore: 0.7 }, { id: "CAP", afterTopic: "T02", courseLevel: true, tasks, passingScore: 0.7 }];
  const bank = Array.from({ length: 240 }, (_, i) => q(`F${i + 1}`, i % 2 ? "T01U1" : "T02U1"));
  const forms = Object.fromEntries(["A", "B", "C", "D"].map((version, index) => [version, bank.slice(index * 60, index * 60 + 60).map(i => i.id)]));
  const definition = { courseId: "tx-test", freeze: "TEST-FREEZE-1", topics, quizzes, replacements, scenarios, bank, forms,
    misconceptions: [{ id: "MC", topicCode: "T01", choices, correctChoice: 0 }] };
  return { definition, engine: createTexasReviewerEngine(definition) };
};
const responses = () => ({ select: 0, compute: 125, explain: { text: "A written analysis of the transaction.", reviewerId: "internal-reviewer", reviewRationale: "Each criterion is present in the response.", criteria: [true, true, true] } });
const identity = engine => engine.recordIdentityCheck(engine.openReviewer({ learnerId: "test-reviewer", at }), { method: "TEST_ONLY", evidenceRef: "fixture-identity", at });
function passQuiz(engine, record, topic) {
  let state = engine.readUnit(record, { unitCode: `${topic}U1`, at });
  for (let i = 1; i <= 3; i++) state = engine.answerQuiz(state, { primaryId: `${topic}Q${i}`, choice: 0, at });
  return state;
}
function ready(engine) {
  let state = passQuiz(engine, identity(engine), "T01");
  state = engine.reviewMisconception(state, { id: "MC", choice: 1, at });
  state = engine.gradeScenario(state, { id: "SC1", responses: responses(), at });
  state = engine.completeTopic(state, { topicCode: "T01", at });
  state = passQuiz(engine, state, "T02");
  state = engine.completeTopic(state, { topicCode: "T02", at });
  state = engine.gradeScenario(state, { id: "CAP", responses: responses(), at });
  return engine.completeCoursework(state, { at });
}
function finalAnswers(definition, state, correct = 60) {
  const version = state.finalAttempts.at(-1).version;
  const view = prepareTexasFinal({ bank: definition.bank, itemIds: definition.forms[version], version, freeze: definition.freeze });
  return Object.fromEntries(view.questions.map((item, index) => {
    const correctIndex = item.choices.indexOf("Correct");
    return [item.id, index < correct ? correctIndex : (correctIndex + 1) % 4];
  }));
}
function firstFailure(engine, definition) {
  let state = engine.openFinalAttempt(ready(engine), { at });
  return engine.submitFinal(state, { answers: finalAnswers(definition, state, 41), at });
}
function remediate(engine, definition, record) {
  let state = record;
  for (const unitCode of record.remediation.prescribedUnits) {
    const replacementAnswers = Object.fromEntries(Object.values(definition.replacements).flat().filter(item => item.tests === unitCode).map(item => [item.id, 0]));
    state = engine.completeRemediationUnit(state, { unitCode, evidenceRef: `review-${unitCode}`, replacementAnswers, at });
  }
  return state;
}

test("reviewer model permanently refuses production enrollment, payments, credit and certificates", () => {
  const { engine } = fixture();
  for (const method of [engine.openEnrollment, engine.takePayment, engine.reportCredit, engine.issueCertificate]) assert.throws(() => method(), /no production/);
  assert.throws(() => engine.openReviewer({ learnerId: "a", at, mode: "PRODUCTION" }), /disabled/);
  assert.throws(() => engine.openReviewer({ learnerId: "a", at: "not-a-date" }), /valid event time/);
});

test("full course, scenario and final path passes only with no-credit status", () => {
  const { engine, definition } = fixture();
  let state = engine.openFinalAttempt(ready(engine), { at });
  state = engine.submitFinal(state, { answers: finalAnswers(definition, state), at });
  assert.equal(state.status, "PASSED_NON_CREDIT");
  assert.equal(state.creditEligible, false);
  assert.equal(state.certificate, null);
  assert.throws(() => engine.openFinalAttempt(state, { at }), /unavailable/);
});

test("missing identity, unread content and skipped topics are rejected without mutating the original", () => {
  const { engine } = fixture();
  const original = engine.openReviewer({ learnerId: "test", at });
  const bytes = JSON.stringify(original);
  assert.throws(() => engine.readUnit(original, { unitCode: "T01U1", at }), /identity/);
  const state = identity(engine);
  assert.throws(() => engine.readUnit(state, { unitCode: "T02U1", at }), /previous topic/);
  assert.throws(() => engine.answerQuiz(state, { primaryId: "T01Q1", choice: 0, at }), /instruction/);
  assert.equal(JSON.stringify(original), bytes);
});

test("wrong answer serves a distinct replacement, retains rationale and blocks until correct", () => {
  const { engine } = fixture();
  let state = engine.readUnit(identity(engine), { unitCode: "T01U1", at });
  state = engine.answerQuiz(state, { primaryId: "T01Q1", choice: 1, at });
  assert.equal(state.quiz.T01Q1.replacementRequired, true);
  assert.ok(state.quiz.T01Q1.rationale);
  state = engine.answerQuiz(state, { primaryId: "T01Q1", choice: 2, at });
  assert.equal(state.quiz.T01Q1.servedItemId, "T01Q1R");
  assert.equal(state.quiz.T01Q1.passed, false);
  assert.throws(() => engine.answerQuiz(state, { primaryId: "T01Q1", choice: "0", at }), /invalid/);
  state = engine.answerQuiz(state, { primaryId: "T01Q1", choice: 0, at });
  assert.equal(state.quiz.T01Q1.passed, true);
  assert.throws(() => engine.answerQuiz(state, { primaryId: "T01Q1", choice: 0, at }), /already passed/);
});

test("topic scenario and misconception review occur before the next topic unlocks", () => {
  const { engine } = fixture();
  let state = passQuiz(engine, identity(engine), "T01");
  assert.throws(() => engine.completeTopic(state, { topicCode: "T01", at }), /misconception/);
  state = engine.reviewMisconception(state, { id: "MC", choice: 2, at });
  assert.throws(() => engine.completeTopic(state, { topicCode: "T01", at }), /scenario/);
  assert.throws(() => engine.readUnit(state, { unitCode: "T02U1", at }), /previous topic/);
  state = engine.gradeScenario(state, { id: "SC1", responses: responses(), at });
  state = engine.completeTopic(state, { topicCode: "T01", at });
  assert.doesNotThrow(() => engine.readUnit(state, { unitCode: "T02U1", at }));
});

test("scenario grading rejects self-certified, duplicated/partial rubrics and invalid computations", () => {
  const { engine } = fixture();
  const state = passQuiz(engine, identity(engine), "T01");
  for (const mutate of [
    r => { r.explain = { passed: true }; },
    r => { r.explain.criteria = [true, true, true, true]; },
    r => { r.explain.criteria = [1, 1, 1]; },
    r => { r.explain.text = ""; },
    r => { r.compute = Number.NaN; },
    r => { r.compute = "125"; },
    r => { r.extra = 0; },
    r => { delete r.select; },
  ]) {
    const input = responses(); mutate(input);
    assert.throws(() => engine.gradeScenario(state, { id: "SC1", responses: input, at }));
  }
});

test("critical scenario failure cannot be traded for other task points", () => {
  const { engine } = fixture();
  const state = passQuiz(engine, identity(engine), "T01");
  const input = responses(); input.select = 1;
  const result = engine.gradeScenario(state, { id: "SC1", responses: input, at });
  assert.equal(result.scenarios.SC1.passed, false);
});

test("early finals, concurrent attempts and repeated submissions are rejected", () => {
  const { engine, definition } = fixture();
  assert.throws(() => engine.openFinalAttempt(identity(engine), { at }), /before coursework/);
  let state = engine.openFinalAttempt(ready(engine), { at });
  assert.throws(() => engine.openFinalAttempt(state, { at }), /unavailable|already open/);
  assert.throws(() => engine.submitFinal(state, { answers: {}, at }), /every final item/);
  state = engine.submitFinal(state, { answers: finalAnswers(definition, state), at });
  assert.throws(() => engine.submitFinal(state, { answers: finalAnswers(definition, state), at }), /no open final/);
});

test("exact unweighted 70-percent boundary passes; one below fails", () => {
  const { engine, definition } = fixture();
  for (const [correct, expected] of [[42, "PASSED_NON_CREDIT"], [41, "REMEDIATION_REQUIRED"]]) {
    const opened = engine.openFinalAttempt(ready(engine), { at });
    assert.equal(engine.submitFinal(opened, { answers: finalAnswers(definition, opened, correct), at }).status, expected);
  }
});

test("second final requires completed prescribed work and uses a different version; two failures require retake", () => {
  const { engine, definition } = fixture();
  let state = firstFailure(engine, definition);
  assert.throws(() => engine.openFinalAttempt(state, { at }), /unavailable/);
  assert.throws(() => engine.completeRemediationUnit(state, { unitCode: state.remediation.prescribedUnits[0], evidenceRef: "checkbox", replacementAnswers: {}, at }), /additional retrieval/);
  state = remediate(engine, definition, state);
  state = engine.openFinalAttempt(state, { at });
  assert.notEqual(state.finalAttempts[0].version, state.finalAttempts[1].version);
  state = engine.submitFinal(state, { answers: finalAnswers(definition, state, 41), at });
  assert.equal(state.status, "RETAKE_REQUIRED");
  assert.throws(() => engine.openFinalAttempt(state, { at }), /unavailable/);
});

test("90-day deadline is enforced both when opening and when submitting the subsequent final", () => {
  const { engine, definition } = fixture();
  const remediated = remediate(engine, definition, firstFailure(engine, definition));
  const day90 = new Date(new Date(at).getTime() + 90 * 86400000).toISOString();
  const late = new Date(new Date(day90).getTime() + 1).toISOString();
  assert.equal(engine.openFinalAttempt(remediated, { at: late }).status, "DROPPED_NO_CREDIT");
  const opened = engine.openFinalAttempt(remediated, { at: day90 });
  assert.equal(opened.status, "FINAL_OPEN");
  assert.equal(engine.submitFinal(opened, { answers: finalAnswers(definition, opened), at: late }).status, "DROPPED_NO_CREDIT");
});

test("all four form versions can rotate in the reviewer model", () => {
  const { engine } = fixture();
  const state = ready(engine);
  const seen = new Set();
  for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) seen.add(engine.openFinalAttempt({ ...state, rotationIndex }, { at }).finalAttempts[0].version);
  assert.equal(seen.size, 4);
});

test("cross-course, stale-freeze and backward-time records are refused; audit summary contains no protected payload", () => {
  const { engine, definition } = fixture();
  const state = identity(engine);
  for (const altered of [{ ...state, courseId: "other" }, { ...state, freeze: "stale" }, { ...state, creditEligible: true }]) {
    assert.throws(() => engine.readUnit(altered, { unitCode: "T01U1", at }), /wrong course/);
  }
  assert.throws(() => engine.readUnit(state, { unitCode: "T01U1", at: "2026-09-06T12:00:00Z" }), /backwards/);
  const opened = engine.openFinalAttempt(ready(engine), { at });
  const finished = engine.submitFinal(opened, { answers: finalAnswers(definition, opened), at });
  const publicText = JSON.stringify(engine.publicAudit(finished));
  for (const forbidden of ["correctChoice", "F1\"", "Question F", "rationale", "prescribedUnits", "servedItemId"]) assert.ok(!publicText.includes(forbidden));
});
