import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { getNmlsReviewCourse as get } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { compileNationalReview, NATIONAL_REVIEW_VARIANTS } from '../netlify/functions/_lib/nmls-national-review-content.mjs';
import { startNmlsCourseReview, reduceNmlsReview, projectNmlsReview } from '../lib/nmls-review-runtime.mjs';

const legacy = get('nmls-2026-f01-private-review');
const core = get('nmls-2026-national-core-private-review');
const comprehensive = get('nmls-2026-national-comprehensive-private-review');
const allModules = [...core.modules, ...[1, 2, 3].map(n => get(`nmls-2026-general-${n}-private-review`).modules[0])];
const lessons = m => m.units.map(u => u.content).join('\n\n');
const module = id => allModules.find(m => m.id === id);

test('legacy grant digest is byte-stable; national variants are separately pinned non-credit drafts', () => {
  assert.equal(legacy.digest, '0dbaac6cc8dd21ce280dad700683d9ae1f846c5d282aa47888ad584ff16c6291');
  assert.equal(legacy.modules[0].units.reduce((s, u) => s + u.requiredSeconds, 0), 3420);
  assert.deepEqual(core.modules.map(m => m.id), ['F01', 'F02', 'F03', 'E01', 'E02', 'N01', 'N02']);
  assert.deepEqual(comprehensive.modules.map(m => m.id), [...core.modules.map(m => m.id), 'G01']);
  assert.equal(comprehensive.editorial.designMinutes, 400);
  assert.equal(comprehensive.editorial.provisionalUnitMinutes, 385);
  assert.equal(comprehensive.editorial.unassignedFormativeMinutes, 15);
  assert.equal(core.editorial.provisionalUnitMinutes, 335);
  assert.equal(core.modules.slice(0, 3).flatMap(m => m.units).reduce((s, u) => s + u.requiredSeconds, 0), 150 * 60);
  assert.deepEqual(module('F03').units.map(u => u.requiredSeconds / 60), [15, 10, 15]);
  for (const id of Object.keys(NATIONAL_REVIEW_VARIANTS)) {
    const course = get(id);
    assert.equal(course.mode, 'non_credit_review'); assert.equal(course.salesAuthorized, false);
    assert.equal(course.approvalId, null); assert.equal(course.editorial.validatedDuration, false);
    assert.equal(course.editorial.completeCourse, false); assert.equal(course.editorial.finalExamIncluded, false);
    assert.ok(Object.isFrozen(course.modules[0].units[0])); assert.match(course.digest, /^[a-f0-9]{64}$/);
    assert.notEqual(course.digest, legacy.digest);
    if (course.modules.length === 1) { assert.equal(course.editorial.provisionalUnitMinutes, 50); assert.doesNotMatch(course.editorial.timingNotice, /E01/); }
  }
});

test('all 147 distinct formative questions retain four complete choices and reviewed keys', () => {
  const questions = allModules.flatMap(m => m.quiz.bank);
  assert.equal(questions.length, 147); assert.equal(new Set(questions.map(q => q.id)).size, 147);
  assert.equal(comprehensive.modules.flatMap(m => m.quiz.bank).length, 117);
  for (const m of allModules) {
    assert.equal(new Set(m.units.map(u => u.id)).size, m.units.length);
    for (const u of m.units) { assert.ok(m.quiz.bank.some(q => q.id === u.actionQuestion.id)); assert.deepEqual(u.requiredActionIds, [u.actionQuestion.id]); }
    for (const q of m.quiz.bank) {
      assert.deepEqual(q.options.map(o => o.id), ['A', 'B', 'C', 'D'], q.id);
      assert.ok(q.stem && q.rationale && q.remediation, q.id);
      assert.match(q.correctChoice, /^[ABCD]$/); assert.ok(q.sourceUrls.length > 0);
      for (const option of q.options) { assert.ok(option.text.length > 0, q.id); assert.doesNotMatch(option.text, /^###|^---$|\| [A-Z]\d{2}-(?:KC|Q)\d{2} \|/m); }
    }
  }
  // Independently reconstruct the single-line option paragraphs used only by N01/N02.
  for (const id of ['N01', 'N02']) {
    const record = core.editorial.sourceRecords.find(r => r.moduleId === id);
    const text = readFileSync(record.path, 'utf8');
    for (const q of module(id).quiz.bank) {
      const start = text.indexOf(`**${q.id}.**`);
      const optionLine = text.slice(start).split('\n').find(line => line.startsWith('A. '));
      assert.equal(q.options.map(o => `${o.id}. ${o.text}`).join(' ').replace(/\s+/g, ' '), optionLine.replace(/\s+/g, ' ').trim(), q.id);
    }
  }
});

test('learner extracts retain transfer exercises, changed facts, retention and source identities without private guides', () => {
  for (const m of allModules) {
    const content = lessons(m);
    assert.doesNotMatch(content, /Scoring guide for a human reviewer|The expected response tests actual facts|Private production checklist|Review guide:|^Guide:|opening the reviewer key|### Private (?:reviewer key|review guide|teaching notes)|^\| [A-Z]?\d*-(?:KC|Q)\d+ \| [A-D] \|/im, m.id);
    for (const u of m.units) {
      for (const match of u.content.matchAll(/\[S(\d+)(?=[\s:;,\]])/g)) {
        assert.match(u.content, new RegExp(`(?:\\*\\*)?S${match[1]}(?: — |\\. )`), `${u.id}: unresolved S${match[1]}`);
      }
    }
  }
  assert.match(lessons(module('F01')), /Transfer exercise: write the handoff/);
  assert.equal((lessons(module('F01')).match(/At fictional Alder Crossing Lending/g) || []).length, 1);
  assert.match(lessons(module('F02')), /Transfer task for human review/);
  assert.match(lessons(module('F03')), /For §1026\.19\(e\)\/\(f\) compliance evidence generally/);
  assert.match(lessons(module('F03')), /S7 — CFPB Regulation Z §1026\.25/);
  assert.match(lessons(module('E01')), /A legitimate difference changes the analysis/);
  assert.match(lessons(module('E02')), /Changed fact: a real raise/);
  assert.match(lessons(module('E02')), /Replace it with a recommendation grounded in the original facts\./);
  assert.match(lessons(module('G01')), /An investor guide, not generally applicable federal law/);
  for (const id of ['N01', 'N02']) { assert.match(lessons(module(id)), /Scope and learning outcomes/); assert.doesNotMatch(lessons(module(id)), /Proposed learning segment/); }
});

test('compiler fails closed for unreviewed bytes, wrong legacy snapshot and unallowlisted keys', () => {
  assert.throws(() => compileNationalReview('nmls-2026-general-1-private-review', null, { readSource: () => 'unreviewed' }), /content_invalid/);
  assert.throws(() => compileNationalReview(core.id, { ...legacy, editorial: { sourceDigest: '0'.repeat(64) } }), /content_invalid/);
  for (const id of ['../../private', '__proto__', 'toString']) assert.throws(() => compileNationalReview(id, legacy), /course_not_found/);
});

function rig(course) {
  let state = startNmlsCourseReview(course), clock = 0;
  return { get state() { return state; }, run(kind, fields = {}, advance = 1) {
    clock += advance;
    const result = reduceNmlsReview(state, { eventId: randomUUID(), sessionId: state.sessionId, expectedRevision: state.revision, kind, ...fields }, course, clock);
    state = result.state; return result;
  } };
}

test('synthetic 8-module path enforces every unit/quiz boundary, retry and non-credit terminal state', () => {
  // Deliberately shortened TEST clocks, never representative-learner timing evidence.
  const course = structuredClone(comprehensive); course.id = 'synthetic-national-path'; course.digest = 'a'.repeat(64);
  course.modules.forEach(m => m.units.forEach(u => { u.requiredSeconds = 20; }));
  const r = rig(course); r.run('resume');
  assert.equal(projectNmlsReview(r.state, course).lessons.length, 0);
  for (let i = 0; i < course.modules.length; i++) {
    const m = course.modules[i];
    assert.equal(r.run('quiz_start', { moduleId: m.id }).outcome.code, 'module_units_required');
    for (const u of m.units) {
      assert.equal(r.run('open_unit', { unitId: u.id }).outcome.ok, true);
      const projection = projectNmlsReview(r.state, course);
      assert.ok(!JSON.stringify(projection).includes('correctChoice'));
      assert.equal(projection.lessons.at(-1).id, u.id);
      assert.equal(r.run('complete_unit').outcome.ok, false);
      r.run('interaction', { visible: true }); r.run('heartbeat', { visible: true }, 20000);
      r.run('unit_action', { choice: u.actionQuestion.correctChoice });
      assert.equal(r.run('complete_unit').outcome.ok, true);
    }
    if (course.modules[i + 1]) assert.equal(r.run('open_unit', { unitId: course.modules[i + 1].units[0].id }).outcome.code, 'module_quiz_required');
    const completedMs = r.state.completedReviewMs;
    r.run('quiz_start', { moduleId: m.id });
    const failedQuiz = r.state.quiz;
    assert.equal(failedQuiz.questionIds.length, 5);
    assert.doesNotMatch(JSON.stringify(projectNmlsReview(r.state, course).quiz), /correctChoice|rationale/);
    const wrong = Object.fromEntries(failedQuiz.questionIds.map(id => [id, m.quiz.bank.find(q => q.id === id).options.find(o => o.id !== m.quiz.bank.find(q => q.id === id).correctChoice).id]));
    assert.equal(r.run('quiz_submit', { quizId: failedQuiz.id, answers: wrong }).outcome.code, 'module_review_retry');
    assert.ok(!r.state.passedModuleIds.includes(m.id));
    r.run('quiz_start', { moduleId: m.id });
    const quiz = r.state.quiz;
    assert.notEqual(quiz.id, failedQuiz.id);
    const answers = Object.fromEntries(quiz.questionIds.map(id => [id, m.quiz.bank.find(q => q.id === id).correctChoice]));
    assert.equal(r.run('quiz_submit', { quizId: quiz.id, answers }).outcome.code, 'module_review_passed');
    assert.equal(r.state.completedReviewMs, completedMs, 'quiz never awards time');
  }
  assert.equal(r.state.status, 'review_complete'); assert.equal(r.state.creditIssuanceAllowed, false);
  assert.equal(r.state.completedUnitIds.length, course.modules.flatMap(m => m.units).length);
  assert.deepEqual(r.state.passedModuleIds, course.modules.map(m => m.id));
});

test('every one of the 147 draft keys grades correctly; a different option always fails', () => {
  for (const m of allModules) for (const q of m.quiz.bank) {
    const course = { ...comprehensive, id: 'synthetic-item-grading', digest: 'b'.repeat(64), modules: [{ ...m,
      units: [{ ...m.units[0], requiredSeconds: 20, requiredActionIds: [q.id], actionQuestion: q }] }] };
    const r = rig(course); r.run('resume'); r.run('open_unit', { unitId: m.units[0].id });
    assert.equal(r.run('unit_action', { choice: q.options.find(o => o.id !== q.correctChoice).id }).outcome.code, 'review_answer_incorrect', q.id);
    assert.equal(r.run('unit_action', { choice: q.correctChoice }).outcome.progress.currentUnitActionComplete, true, q.id);
    assert.equal(r.state.completedReviewMs, 0);
  }
});
