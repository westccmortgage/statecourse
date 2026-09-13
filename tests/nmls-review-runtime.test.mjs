import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { startNmlsCourseReview, reduceNmlsReview, projectNmlsReview } from '../lib/nmls-review-runtime.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { validateNmlsReviewInput, digestNmlsCommand, nmlsReviewPublicError } from '../netlify/functions/_lib/nmls-review-service.mjs';

const real = getNmlsReviewCourse('nmls-2026-f01-private-review');
function fixture() {
  const c = structuredClone(real); c.id = 'synthetic-runtime-test'; c.digest = 'a'.repeat(64);
  c.modules[0].units = c.modules[0].units.slice(0, 2).map((u) => ({ ...u, requiredSeconds: 20 }));
  return c;
}
function rig(course = fixture()) {
  let state = startNmlsCourseReview(course);
  return { course, get state() { return state; },
    run(kind, at, extra = {}) {
      const result = reduceNmlsReview(state, { eventId: randomUUID(), kind,
        sessionId: state.sessionId, expectedRevision: state.revision, ...extra }, course, at);
      state = result.state; return result;
    } };
}
function finishUnit(r, index, at) {
  const unit = r.course.modules[0].units[index];
  assert.equal(r.run('open_unit', at, { unitId: unit.id }).outcome.ok, true);
  r.run('interaction', at, { visible: true });
  r.run('heartbeat', at + 20000, { visible: true });
  r.run('unit_action', at + 20001, { choice: unit.actionQuestion.correctChoice });
  assert.equal(r.run('complete_unit', at + 20002).outcome.ok, true);
}

test('private manuscript loader has 57 provisional minutes, 12 keys and immutable content hash', () => {
  assert.equal(real.modules[0].units.reduce((n, u) => n + u.requiredSeconds, 0), 57 * 60);
  assert.equal(real.modules[0].quiz.bank.length, 12);
  assert.equal(real.approvalId, null); assert.equal(real.salesAuthorized, false);
  assert.match(real.digest, /^[a-f0-9]{64}$/); assert.ok(Object.isFrozen(real.modules[0].quiz.bank));
  assert.throws(() => getNmlsReviewCourse('../../secret'), /course_not_found/);
});

test('projection exposes no private keys or future unit narratives', () => {
  const r = rig(real); r.run('resume', 0);
  const before = JSON.stringify(projectNmlsReview(r.state, real));
  assert.ok(!before.includes('correctChoice')); assert.ok(!before.includes('Maya'));
  r.run('open_unit', 1, { unitId: 'F01-U01' });
  const progress = projectNmlsReview(r.state, real);
  assert.equal(progress.lessons.length, 1); assert.ok(progress.lessons[0].content.includes('Maya'));
  assert.ok(!JSON.stringify(progress).includes('correctChoice'));
  assert.ok(!progress.lessons[0].content.includes('## 7. Answer key'));
});

test('units cannot be skipped; visible time and a correct action both required', () => {
  const r = rig(); r.run('resume', 0);
  assert.equal(r.run('open_unit', 1, { unitId: 'F01-U02' }).outcome.code, 'unit_sequence_blocked');
  r.run('open_unit', 2, { unitId: 'F01-U01' });
  assert.equal(r.run('complete_unit', 3).outcome.ok, false);
  r.run('interaction', 4, { visible: true });
  r.run('heartbeat', 20004, { visible: false });
  assert.equal(r.state.current.provisionalMs, 0);
  r.run('interaction', 20005, { visible: true });
  r.run('heartbeat', 40005, { visible: true });
  assert.equal(r.run('complete_unit', 40006).outcome.ok, false);
  assert.equal(r.run('unit_action', 40007, { choice: 'A' }).outcome.code, 'review_answer_incorrect');
  r.run('unit_action', 40008, { choice: 'B' });
  assert.equal(r.run('complete_unit', 40009).outcome.ok, true);
  assert.equal(r.state.completedReviewMs, 20000);
});

test('automatic heartbeats and repeated verified answers do not refresh inactivity', () => {
  const r = rig(); r.run('resume', 0); r.run('open_unit', 0, { unitId: 'F01-U01' });
  r.run('interaction', 0, { visible: true }); r.run('unit_action', 1, { choice: 'B' });
  for (let at = 20000; at < 360000; at += 20000) r.run('heartbeat', at, { visible: true });
  r.run('unit_action', 359999, { choice: 'B' });
  assert.equal(r.state.lastActivityMs, 1);
  const expired = r.run('complete_unit', 360001);
  assert.equal(expired.outcome.status, 401); assert.equal(r.state.current, null);
  assert.equal(r.state.completedReviewMs, 0); assert.equal(expired.audit.invalidatedMs, 20000);
});

test('a wrong submitted answer is activity, never an action pass or instructional time', () => {
  const r = rig(); r.run('resume', 0); r.run('open_unit', 1, { unitId: 'F01-U01' });
  r.run('interaction', 2, { visible: true }); r.run('heartbeat', 10002, { visible: true });
  assert.equal(r.run('unit_action', 350000, { choice: 'A' }).outcome.code, 'review_answer_incorrect');
  assert.equal(r.state.lastActivityMs, 350000); assert.equal(r.state.current.lastActivityMs, 350000);
  assert.equal(r.state.current.provisionalMs, 10000); assert.deepEqual(r.state.current.completedActionIds, []);
  const response = r.run('heartbeat', 360000, { visible: true });
  assert.equal(response.outcome.ok, true); assert.equal(response.outcome.progress.currentUnitActionComplete, false);
  assert.equal(response.outcome.progress.feedback.correct, false);
  r.run('unit_action', 360001, { choice: 'B' });
  assert.equal(r.run('heartbeat', 360002, { visible: true }).outcome.progress.currentUnitActionComplete, true);
});

test('resume fences old session and restarts only incomplete unit, preserving earlier work', () => {
  const r = rig(); r.run('resume', 0); const oldSession = r.state.sessionId;
  finishUnit(r, 0, 1); r.run('open_unit', 21000, { unitId: 'F01-U02' });
  r.run('interaction', 21001, { visible: true }); r.run('heartbeat', 31001, { visible: true });
  const resumed = r.run('resume', 31002);
  assert.equal(resumed.audit.invalidatedMs, 10000); assert.notEqual(r.state.sessionId, oldSession);
  assert.deepEqual(r.state.completedUnitIds, ['F01-U01']); assert.equal(r.state.current, null);
  assert.throws(() => r.run('heartbeat', 31003, { sessionId: oldSession, visible: true }), /session_conflict/);
});

test('module quiz grades only selected questions on the server and issues no credit', () => {
  const r = rig(); r.run('resume', 0);
  assert.equal(r.run('quiz_start', 1, { moduleId: 'F01' }).outcome.code, 'module_units_required');
  finishUnit(r, 0, 2); finishUnit(r, 1, 30000);
  r.run('quiz_start', 51000, { moduleId: 'F01' });
  const quiz = r.state.quiz;
  assert.equal(new Set(quiz.questionIds).size, 5);
  assert.ok(!JSON.stringify(projectNmlsReview(r.state, r.course).quiz).includes('rationale'));
  assert.equal(r.run('quiz_submit', 51001, { quizId: quiz.id, answers: {} }).outcome.code, 'invalid_answer_set');
  const answers = Object.fromEntries(quiz.questionIds.map((id) => [id, r.course.modules[0].quiz.bank.find((q) => q.id === id).correctChoice]));
  assert.equal(r.run('quiz_submit', 51002, { quizId: quiz.id, answers }).outcome.code, 'module_review_passed');
  assert.equal(r.state.status, 'review_complete'); assert.equal(r.state.creditIssuanceAllowed, false);
  assert.equal(r.state.completedReviewMs, 40000);
});

test('course idle timeout also discards open quizzes', () => {
  const r = rig(); r.run('resume', 0); finishUnit(r, 0, 1); finishUnit(r, 1, 30000);
  r.run('quiz_start', 51000, { moduleId: 'F01' });
  const quizId = r.state.quiz.id;
  const expired = r.run('quiz_submit', 411000, { quizId, answers: {} });
  assert.equal(expired.outcome.code, 'course_logout_required'); assert.equal(r.state.quiz, null);
  assert.equal(expired.audit.abandonedQuizId, quizId); assert.equal(r.state.completedUnitIds.length, 2);
});

test('active quiz has no artificial six-minute deadline and earns no instructional time', () => {
  const r = rig(); r.run('resume', 0); finishUnit(r, 0, 1); finishUnit(r, 1, 30000);
  r.run('quiz_start', 51000, { moduleId: 'F01' });
  const quizId = r.state.quiz.id;
  r.run('interaction', 410999, { visible: true });
  assert.equal(r.run('heartbeat', 411000, { visible: true }).outcome.ok, true);
  assert.equal(r.state.quiz.id, quizId); assert.equal(r.state.completedReviewMs, 40000);
  r.run('interaction', 770998, { visible: false });
  assert.equal(r.run('heartbeat', 770999, { visible: true }).outcome.code, 'course_logout_required');
  assert.equal(r.state.quiz, null); assert.equal(r.state.completedReviewMs, 40000);
});

test('untrusted time, identity, state and grading fields are rejected; hashes canonicalize object keys', () => {
  const input = { kind: 'heartbeat', attemptId: randomUUID(), eventId: randomUUID(), expectedRevision: 1, sessionId: randomUUID(), visible: true };
  for (const field of ['studentId', 'elapsedMs', 'serverTimeMs', 'correct', 'state', 'approved']) {
    assert.throws(() => validateNmlsReviewInput({ ...input, [field]: true }), /unsupported_review_field/);
  }
  assert.throws(() => validateNmlsReviewInput(null));
  assert.throws(() => validateNmlsReviewInput({ ...input, visible: 'true' }));
  assert.throws(() => validateNmlsReviewInput({ ...input, kind: '__proto__' }));
  assert.equal(digestNmlsCommand(input), digestNmlsCommand(Object.fromEntries(Object.entries(input).reverse())));
  assert.notEqual(digestNmlsCommand(input), digestNmlsCommand({ ...input, visible: false }));
  assert.deepEqual(nmlsReviewPublicError(new Error('db password=private 10.0.0.1')), { status: 503, body: { error: 'nmls_review_unavailable' } });
});
