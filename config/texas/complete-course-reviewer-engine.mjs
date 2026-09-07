/**
 * Internal, NON-CREDIT workflow model for the three Texas completion curricula.
 * This is not authentication, a persistence service, a proctor or observed study-time evidence.
 * It must never be imported by a public practice bundle: the definition includes protected keys.
 * Production enrollment, payment, final administration and certificates are deliberately absent.
 */
import { prepareTexasFinal } from "./complete-course-exam-delivery.mjs";
const copy = record => structuredClone(record);
const nonempty = value => typeof value === "string" && value.trim().length > 0;
const instant = value => {
  const time = new Date(value);
  if (!Number.isFinite(time.getTime())) throw new Error("A valid event time is required");
  return time.toISOString();
};
const chosen = (value, choices) => Number.isInteger(value) && value >= 0 && value < choices.length;

export function createTexasReviewerEngine(definition) {
  const { courseId, freeze, topics, quizzes, replacements, scenarios, bank, forms, misconceptions = [] } = definition;
  if (!nonempty(courseId) || !nonempty(freeze) || !topics.length) throw new Error("A frozen course definition is required");
  const topicCodes = topics.map(topic => topic.code);
  const units = new Map(topics.flatMap(topic => topic.units.map(unit => [unit.code, topic.code])));
  const finalById = new Map(bank.map(item => [item.id, item]));
  const versionIds = Object.keys(forms);
  const delivery = new Map(versionIds.map(version => [version, prepareTexasFinal({ bank, itemIds: forms[version], version, freeze })]));
  const scenarioTopic = scenario => scenario.afterTopic ?? scenario.placement?.afterTopic;
  const courseLevel = scenario => scenario.courseLevel === true || scenario.placement?.timeAttribution === "COURSE_LEVEL";
  const unitOf = item => item.tests ?? item.unitCode ?? item.unit;
  const fail = reason => { throw new Error(`Texas reviewer: ${reason}`); };
  const guard = (record, at) => {
    if (record?.courseId !== courseId || record?.freeze !== freeze || record.mode !== "REVIEWER" || record.creditEligible !== false) fail("wrong course, freeze or mode");
    const next = copy(record);
    next.at = instant(at);
    if (next.at < record.at) fail("event time cannot move backwards");
    return next;
  };
  const event = (record, type, detail = {}) => {
    record.audit.push({ at: record.at, type, detail });
    return record;
  };
  const identity = record => { if (!record.identityEvidence) fail("reviewer identity-check evidence is missing"); };
  const working = record => { if (record.status !== "IN_PROGRESS") fail("coursework is closed"); };
  const enterTopic = (record, code) => {
    identity(record); working(record);
    const index = topicCodes.indexOf(code);
    if (index < 0) fail("unknown topic");
    if (topicCodes.slice(0, index).some(previous => !record.completedTopics.includes(previous))) fail("previous topic is incomplete");
    if (record.completedTopics.includes(code)) fail("topic is already complete");
    return topics[index];
  };
  const quizPassed = (record, code) => (quizzes[code] ?? []).length >= 3 && quizzes[code].every(item => record.quiz[item.id]?.passed);
  const instructionRead = (record, code) => topics.find(topic => topic.code === code).units.every(unit => record.readUnits.includes(unit.code));
  const scenarioPassed = (record, scenario) => record.scenarios[scenario.id]?.passed === true;

  function openReviewer({ learnerId, at, mode = "REVIEWER", rotationIndex = 0 } = {}) {
    if (mode !== "REVIEWER") fail("production enrollment and final administration are disabled");
    if (!nonempty(learnerId) || !Number.isInteger(rotationIndex) || rotationIndex < 0) fail("invalid reviewer identity or rotation index");
    return event({ courseId, freeze, learnerId, mode, creditEligible: false, certificate: null, status: "IN_PROGRESS",
      identityEvidence: null, at: instant(at), readUnits: [], completedTopics: [], quiz: {}, scenarios: {}, misconceptions: [],
      courseworkCompletedAt: null, finalAttempts: [], remediation: null, rotationIndex, audit: [],
    }, "reviewer.opened", { simulation: true });
  }
  function recordIdentityCheck(record, { method, evidenceRef, at }) {
    const next = guard(record, at);
    if (!nonempty(method) || !nonempty(evidenceRef)) fail("identity-check method and evidence reference are required");
    next.identityEvidence = { method, evidenceRef, at: next.at, simulationOnly: true };
    return event(next, "identity.review-evidence-recorded");
  }
  function readUnit(record, { unitCode, at }) {
    const next = guard(record, at);
    const code = units.get(unitCode);
    if (!code) fail("unknown unit");
    enterTopic(next, code);
    if (!next.readUnits.includes(unitCode)) next.readUnits.push(unitCode);
    return event(next, "instruction.reviewed", { unitCode, observedMinutes: null });
  }
  function answerQuiz(record, { primaryId, choice, at }) {
    const next = guard(record, at);
    const primary = Object.values(quizzes).flat().find(item => item.id === primaryId);
    if (!primary) fail("unknown primary question");
    const topicCode = units.get(unitOf(primary));
    enterTopic(next, topicCode);
    if (!instructionRead(next, topicCode)) fail("review required instruction before the topic quiz");
    const previous = next.quiz[primaryId];
    if (previous?.passed) fail("primary learning objective already passed");
    const item = previous?.replacementRequired
      ? Object.values(replacements).flat().find(item => item.replaces === primaryId) : primary;
    if (!item) fail("related replacement is missing");
    if (!chosen(choice, item.choices)) fail("invalid quiz choice");
    const passed = choice === item.correctChoice;
    next.quiz[primaryId] = { passed, replacementRequired: !passed || Boolean(previous?.replacementRequired),
      servedItemId: item.id, rationale: item.rationale, attempts: (previous?.attempts ?? 0) + 1 };
    return event(next, "quiz.answered", { primaryId, servedItemId: item.id, passed });
  }
  function reviewMisconception(record, { id, choice, at }) {
    const next = guard(record, at);
    const check = misconceptions.find(item => item.id === id);
    if (!check) fail("unknown misconception check");
    enterTopic(next, check.topicCode);
    if (!chosen(choice, check.choices ?? check.options)) fail("invalid misconception choice");
    if (!next.misconceptions.includes(id)) next.misconceptions.push(id);
    return event(next, "misconception.reviewed", { id, correct: choice === check.correctChoice, gatesOnCorrectness: false });
  }
  function gradeScenario(record, { id, responses, at }) {
    const next = guard(record, at);
    identity(next); working(next);
    const scenario = scenarios.find(item => item.id === id);
    if (!scenario) fail("unknown scenario");
    const topic = scenarioTopic(scenario);
    if (courseLevel(scenario)) {
      if (topicCodes.some(code => !next.completedTopics.includes(code))) fail("capstone requires all topics");
    } else {
      enterTopic(next, topic);
      if (!quizPassed(next, topic)) fail("scenario requires the topic quiz");
    }
    if (!responses || scenario.tasks.some(task => !(task.id in responses))
      || Object.keys(responses).some(id => !scenario.tasks.some(task => task.id === id))) fail("scenario response keys must match every task exactly");
    const grades = scenario.tasks.map(task => {
      const response = responses[task.id];
      let passed = false;
      if (task.type === "selection") {
        if (!chosen(response, task.choices ?? task.options)) fail("invalid scenario choice");
        passed = response === task.correctChoice;
      } else if (task.type === "computation") {
        if (typeof response !== "number" || !Number.isFinite(response)) fail("computation requires a finite number");
        const answer = task.answer ?? task.correctValue ?? task.expected;
        const tolerance = task.tolerance ?? 0;
        if (!Number.isFinite(answer) || !Number.isFinite(tolerance) || tolerance < 0) fail("invalid authored computation rubric");
        const roundoff = tolerance === 0 ? 0 : Number.EPSILON * Math.max(1, Math.abs(response), Math.abs(answer)) * 4;
        passed = Math.abs(response - answer) <= tolerance + roundoff;
      } else if (task.type === "short-answer") {
        // A learner's text is not self-grading. This trusted internal review model requires a full
        // itemized rubric evaluation, actual response text and reviewer rationale; no bare "passed".
        const rubric = task.rubric;
        if (!Array.isArray(rubric) || !rubric.length || !nonempty(response?.text)
          || !nonempty(response?.reviewerId) || !nonempty(response?.reviewRationale)
          || !Array.isArray(response?.criteria) || response.criteria.length !== rubric.length
          || response.criteria.some(value => typeof value !== "boolean")) fail("short answer requires a complete reviewer rubric evaluation");
        const proportion = response.criteria.filter(Boolean).length / rubric.length;
        const criticalPass = rubric.every((criterion, index) => !criterion.required || response.criteria[index]);
        passed = proportion >= (task.passingScore ?? 0.7) && criticalPass;
      } else fail("unsupported scenario task type");
      return { id: task.id, passed, critical: task.critical === true };
    });
    const proportion = grades.filter(grade => grade.passed).length / grades.length;
    const passed = proportion >= (scenario.passingScore ?? 0.7) && grades.every(grade => !grade.critical || grade.passed);
    next.scenarios[id] = { passed, proportion, grades, attempts: (next.scenarios[id]?.attempts ?? 0) + 1 };
    return event(next, "scenario.reviewed", { id, passed });
  }
  function completeTopic(record, { topicCode, at }) {
    const next = guard(record, at);
    enterTopic(next, topicCode);
    if (!instructionRead(next, topicCode) || !quizPassed(next, topicCode)) fail("topic instruction or quizzes incomplete");
    if (misconceptions.some(item => item.topicCode === topicCode && !next.misconceptions.includes(item.id))) fail("required misconception review missing");
    if (scenarios.some(scenario => !courseLevel(scenario) && scenarioTopic(scenario) === topicCode && !scenarioPassed(next, scenario))) fail("required topic scenario not passed");
    next.completedTopics.push(topicCode);
    return event(next, "topic.completed", { topicCode });
  }
  function completeCoursework(record, { at }) {
    const next = guard(record, at);
    identity(next); working(next);
    if (topicCodes.some(code => !next.completedTopics.includes(code)) || scenarios.some(scenario => !scenarioPassed(next, scenario))) fail("required coursework incomplete");
    next.courseworkCompletedAt = next.at;
    next.status = "COURSEWORK_COMPLETE";
    return event(next, "coursework.completed", { creditEligible: false });
  }
  function deadlineExceeded(record) {
    return new Date(record.at).getTime() > new Date(record.courseworkCompletedAt).getTime() + 90 * 24 * 60 * 60 * 1000;
  }
  function openFinalAttempt(record, { at }) {
    const next = guard(record, at);
    identity(next);
    if (!next.courseworkCompletedAt) fail("final is unavailable before coursework completion");
    if (!["COURSEWORK_COMPLETE", "REMEDIATION_COMPLETE"].includes(next.status)) fail("final unavailable in current status");
    if (next.finalAttempts.some(attempt => !attempt.submittedAt)) fail("an examination attempt is already open");
    if (next.finalAttempts.length >= 2) fail("two failures require a new course run");
    if (next.finalAttempts.length && deadlineExceeded(next)) {
      next.status = "DROPPED_NO_CREDIT";
      return event(next, "subsequent-final.expired");
    }
    const version = versionIds[(next.rotationIndex + next.finalAttempts.length) % versionIds.length];
    if (!version || next.finalAttempts.some(attempt => attempt.version === version)) fail("a different examination version is required");
    next.finalAttempts.push({ number: next.finalAttempts.length + 1, version, openedAt: next.at, submittedAt: null });
    next.status = "FINAL_OPEN";
    return event(next, "final.opened", { number: next.finalAttempts.length, version, nonCredit: true });
  }
  function submitFinal(record, { answers, at }) {
    const next = guard(record, at);
    identity(next);
    const attempt = next.finalAttempts.at(-1);
    if (next.status !== "FINAL_OPEN" || !attempt || attempt.submittedAt) fail("no open final attempt");
    if (attempt.number > 1 && deadlineExceeded(next)) {
      attempt.submittedAt = next.at; attempt.expired = true; next.status = "DROPPED_NO_CREDIT";
      return event(next, "subsequent-final.expired");
    }
    let result;
    try { result = delivery.get(attempt.version).grade(answers); }
    catch { fail("answer every final item with a valid choice"); }
    const { missed } = result;
    attempt.submittedAt = next.at; attempt.correct = result.correct; attempt.total = result.total;
    attempt.passed = attempt.correct * 100 >= result.total * 70;
    next.status = attempt.passed ? "PASSED_NON_CREDIT" : attempt.number === 2 ? "RETAKE_REQUIRED" : "REMEDIATION_REQUIRED";
    if (!attempt.passed && attempt.number === 1) {
      next.remediation = { prescribedUnits: [...new Set(missed.map(id => unitOf(finalById.get(id))))], completedUnits: [] };
    }
    return event(next, "final.submitted", { number: attempt.number, correct: attempt.correct, total: attempt.total, passed: attempt.passed, creditEligible: false });
  }
  function getFinalQuestions(record) {
    const next = guard(record, record.at);
    identity(next);
    const attempt = next.finalAttempts.at(-1);
    if (next.status !== "FINAL_OPEN" || !attempt || attempt.submittedAt) fail("no open final attempt");
    return copy(delivery.get(attempt.version).questions);
  }
  function completeRemediationUnit(record, { unitCode, evidenceRef, replacementAnswers, at }) {
    const next = guard(record, at);
    identity(next);
    if (next.status !== "REMEDIATION_REQUIRED" || !next.remediation?.prescribedUnits.includes(unitCode)) fail("unit is not prescribed remediation");
    if (!nonempty(evidenceRef)) fail("remediation requires reviewed coursework evidence");
    const checks = Object.values(replacements).flat().filter(item => unitOf(item) === unitCode);
    if (!checks.length || !replacementAnswers || checks.some(item => replacementAnswers[item.id] !== item.correctChoice)) fail("complete the unit's additional retrieval work correctly");
    if (!next.remediation.completedUnits.includes(unitCode)) next.remediation.completedUnits.push(unitCode);
    if (next.remediation.prescribedUnits.every(unit => next.remediation.completedUnits.includes(unit))) next.status = "REMEDIATION_COMPLETE";
    return event(next, "remediation.unit-reviewed", { unitCode, evidenceRef });
  }
  const blocked = () => fail("no production enrollment, payment, qualifying credit or certificate is enabled");
  function publicAudit(record) {
    // No secure prompts, choices, keys, item identifiers, submitted answers or missed-unit hints.
    return { courseId, freeze, mode: "REVIEWER", creditEligible: false, status: record.status,
      completedTopics: record.completedTopics.length,
      finals: record.finalAttempts.map(attempt => ({ number: attempt.number, correct: attempt.correct ?? null,
        total: attempt.total ?? null, passed: attempt.passed ?? false, expired: attempt.expired ?? false })) };
  }
  return Object.freeze({ openReviewer, recordIdentityCheck, readUnit, answerQuiz, reviewMisconception, gradeScenario,
    completeTopic, completeCoursework, openFinalAttempt, getFinalQuestions, submitFinal, completeRemediationUnit, publicAudit,
    openEnrollment: blocked, takePayment: blocked, issueCertificate: blocked, reportCredit: blocked });
}
