import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { getNmlsReviewCourse as get } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { startNmlsCourseReview, reduceNmlsReview, projectNmlsReview,
  compactNmlsReviewOutcome, hydrateNmlsReviewOutcome } from '../lib/nmls-review-runtime.mjs';

const course = get('nmls-2026-national-comprehensive-private-review-v2');
const practice = course.modules.flatMap(m => m.units.filter(u => u.guidedPractice));
const oldDigests = {
  'nmls-2026-f01-private-review': '0dbaac6cc8dd21ce280dad700683d9ae1f846c5d282aa47888ad584ff16c6291',
  'nmls-2026-national-core-private-review': 'd72e977204421f5c8f506174bde3ecf741589db29a0be375c7d6103bb7240515',
  'nmls-2026-national-comprehensive-private-review': '47459035937ff2187cb9f30333808cac4cf15f19a50d9630d19f171f4397ab80',
  'nmls-2026-general-1-private-review': '19cd4ad3e5e92edac9bec39ae879acc6718581d80bf081a26cda8392c77473e0',
  'nmls-2026-general-2-private-review': '567125573aa82dc02fe30b2a8085afffbf4a831495fc12cc8ba71e9d9035f66e',
  'nmls-2026-general-3-private-review': '6d7af3d28b06e9fecc990b4303c1e6c9d1370a50e1168bb395d9707fcd6976e5',
};

test('v2 is additive: every prior private grant digest remains exact', () => {
  for (const [id, digest] of Object.entries(oldDigests)) assert.equal(get(id).digest, digest, id);
  for (const type of ['core', 'comprehensive']) {
    const v1 = get(`nmls-2026-national-${type}-private-review`);
    const v2 = get(`nmls-2026-national-${type}-private-review-v2`);
    assert.notEqual(v2.digest, v1.digest);
    assert.equal(v2.editorial.unassignedFormativeMinutes, 0);
    assert.equal(v2.editorial.provisionalUnitMinutes, v2.editorial.designMinutes);
    assert.equal(v2.editorial.validatedDuration, false);
    assert.equal(v2.editorial.completeCourse, false);
    assert.equal(v2.editorial.finalExamIncluded, false);
    assert.equal(v2.approvalId, null); assert.equal(v2.salesAuthorized, false);
    for (const m of v1.modules) {
      const next = v2.modules.find(n => n.id === m.id);
      assert.deepEqual(next.units.filter(u => !u.guidedPractice), m.units);
      assert.deepEqual(next.quiz, m.quiz, 'no practiced transfer item is added to a module quiz');
    }
  }
});

test('six substantive sequential practice units fill only the provisional Ethics allocation', () => {
  assert.equal(practice.length, 6);
  assert.equal(course.modules.flatMap(m => m.units).length, 45);
  assert.equal(practice.reduce((s, u) => s + u.requiredSeconds, 0), 900);
  assert.deepEqual(practice.map(u => u.requiredSeconds / 60), [3, 3, 2, 2, 3, 2]);
  const bank = course.modules.flatMap(m => m.quiz.bank);
  assert.equal(bank.length, 117);
  assert.equal(new Set([...bank, ...practice.map(u => u.actionQuestion)].map(q => q.id)).size, 123);
  for (const u of practice) {
    const q = u.actionQuestion;
    assert.ok(u.content.length > 500, u.id);
    assert.ok(q.rationale.length > 300, q.id);
    assert.deepEqual(q.options.map(o => o.id), ['A', 'B', 'C', 'D']);
    assert.deepEqual(u.requiredActionIds, [q.id]);
    assert.ok(q.sourceUrls.length && q.sourceUrls.every(url => url.startsWith('https://www.consumerfinance.gov/')));
    assert.ok(!bank.some(item => item.id === q.id));
    assert.doesNotMatch(u.content, /correctChoice|Private review guide|answer key/);
    assert.ok(!u.content.includes(q.rationale));
    assert.doesNotMatch(q.rationale, /\b(?:first|second|third|fourth) option\b/i, 'new practice feedback is position-independent');
  }
});

function rig(manifest) {
  let state = startNmlsCourseReview(manifest), clock = 0;
  return { get state() { return state; }, run(kind, fields = {}, advance = 1) {
    clock += advance;
    const result = reduceNmlsReview(state, { eventId: randomUUID(), sessionId: state.sessionId,
      expectedRevision: state.revision, kind, ...fields }, manifest, clock);
    state = result.state; return result;
  } };
}

test('each guided decision withholds feedback until submission, grades every distractor and rehydrates exactly', () => {
  for (const u of practice) {
    const manifest = { ...course, modules: [{ ...course.modules.find(m => m.units.includes(u)), units: [u] }] };
    const r = rig(manifest); r.run('resume');
    const opened = r.run('open_unit', { unitId: u.id }).outcome;
    assert.equal(opened.progress.feedback, null);
    assert.doesNotMatch(JSON.stringify(opened.progress), /correctChoice|rationale|remediation/);
    assert.deepEqual(hydrateNmlsReviewOutcome(compactNmlsReviewOutcome(opened), manifest), opened);
    for (const choice of u.actionQuestion.options.filter(o => o.id !== u.actionQuestion.correctChoice)) {
      const result = r.run('unit_action', { choice: choice.id });
      assert.equal(result.outcome.code, 'review_answer_incorrect', `${u.id}/${choice.id}`);
      assert.equal(result.outcome.progress.currentUnitActionComplete, false);
      assert.equal(result.outcome.progress.feedback.rationale, u.actionQuestion.rationale);
      assert.equal(result.state.completedReviewMs, 0);
    }
    const correct = r.run('unit_action', { choice: u.actionQuestion.correctChoice });
    assert.equal(correct.outcome.progress.currentUnitActionComplete, true);
    assert.equal(r.run('complete_unit').outcome.code, 'unit_requirements_unmet', 'an answer cannot manufacture reading time');
    const receipt = r.state.lastActivityMs;
    r.run('unit_action', { choice: u.actionQuestion.correctChoice });
    assert.equal(r.state.lastActivityMs, receipt, 'repeat correct click is not new engagement');
  }
});

test('synthetic full v2 path cannot bypass guided units or module reviews', () => {
  const manifest = structuredClone(course);
  manifest.modules.forEach(m => m.units.forEach(u => { u.requiredSeconds = 20; }));
  // Shortened synthetic clocks verify logic, never 400-minute human attendance.
  const r = rig(manifest); r.run('resume');
  for (const m of manifest.modules) {
    for (const u of m.units) {
      assert.equal(r.run('quiz_start', { moduleId: m.id }).outcome.code, 'module_units_required');
      assert.equal(r.run('open_unit', { unitId: u.id }).outcome.ok, true);
      if (u.guidedPractice) {
        const next = m.units[m.units.indexOf(u) + 1];
        if (next) assert.equal(r.run('open_unit', { unitId: next.id }).outcome.code, 'unit_sequence_blocked');
      }
      r.run('interaction', { visible: true }); r.run('heartbeat', { visible: true }, 20000);
      assert.equal(r.run('complete_unit').outcome.code, 'unit_requirements_unmet');
      r.run('unit_action', { choice: u.actionQuestion.correctChoice });
      assert.equal(r.run('complete_unit').outcome.ok, true);
    }
    r.run('quiz_start', { moduleId: m.id });
    const quiz = r.state.quiz;
    assert.ok(!quiz.questionIds.some(id => practice.some(u => u.actionQuestion.id === id)));
    const answers = Object.fromEntries(quiz.questionIds.map(id => [id, m.quiz.bank.find(q => q.id === id).correctChoice]));
    assert.equal(r.run('quiz_submit', { quizId: quiz.id, answers }).outcome.code, 'module_review_passed');
  }
  assert.equal(r.state.completedUnitIds.length, 45);
  assert.equal(r.state.status, 'review_complete');
  assert.equal(projectNmlsReview(r.state, manifest).creditIssuanceAllowed, false);
});
