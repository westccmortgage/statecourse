import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { startNmlsCourseReview, reduceNmlsReview } from '../lib/nmls-review-runtime.mjs';
import { inspectNmlsFinalCandidates, defineNmlsDraftFinal, drawNmlsDraftFinal,
  projectNmlsDraftFinal, gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';

// SYNTHETIC engineering fixture. Short clocks are never learner timing evidence.
const course = structuredClone(getNmlsReviewCourse('nmls-2026-national-comprehensive-private-review-v2'));
course.id = 'synthetic-final-review'; course.digest = 'a'.repeat(64);
course.modules = course.modules.filter(module => ['F01', 'E01'].includes(module.id));
course.modules.forEach(module => { module.units = [module.units[0]]; module.units[0].requiredSeconds = 20; });
const quotas = { F01: 13, E01: 12 };
const items = Object.entries(quotas).flatMap(([moduleId, count]) => Array.from({ length: count * 2 }, (_, index) => {
  const correctChoice = ['A', 'B', 'C', 'D'][index % 4];
  return { id: `N26-FIN-${moduleId[0]}${String(index + 1).padStart(2, '0')}`,
    category: moduleId[0] === 'F' ? 'federal' : 'ethics', moduleId,
    objective: 'Synthetic state and grading verification only.', stem: `Synthetic ${moduleId} final fixture number ${index + 1}?`,
    options: ['A', 'B', 'C', 'D'].map(id => ({ id, text: `Synthetic choice ${id}.` })), correctChoice,
    rationale: 'Private synthetic rationale.', independenceNote: 'Synthetic fixture, not legal or pedagogical validation.',
    distractorRationales: Object.fromEntries(['A', 'B', 'C', 'D'].filter(id => id !== correctChoice).map(id => [id, 'Synthetic wrong choice.'])),
    sourceRefs: [{ url: 'https://www.consumerfinance.gov/rules-policy/regulations/', locator: 'Synthetic fixture only',
      supports: 'No legal assertion is being made by this fixture.', checkedOn: '2026-09-11' }],
    remediation: { unitIds: [`${moduleId}-U01`], focus: 'Synthetic review control.' } };
}));
const define = (bank = items, moduleQuotas = quotas) => defineNmlsDraftFinal(course, { id: 'synthetic-2026-final', items: bank, moduleQuotas });
const definition = define();
function completeReview(manifest) {
  let state = startNmlsCourseReview(manifest); let clock = 0;
  const run = (kind, fields = {}, advance = 1) => {
    clock += advance;
    const result = reduceNmlsReview(state, { eventId: randomUUID(), sessionId: state.sessionId,
      expectedRevision: state.revision, kind, ...fields }, manifest, clock);
    state = result.state; assert.equal(result.outcome.ok, true, result.outcome.code); return result;
  };
  run('resume');
  for (const module of manifest.modules) {
    for (const unit of module.units) {
      run('open_unit', { unitId: unit.id }); run('interaction', { visible: true });
      run('heartbeat', { visible: true }, 20000); run('unit_action', { choice: unit.actionQuestion.correctChoice }); run('complete_unit');
    }
    run('quiz_start', { moduleId: module.id });
    const answers = Object.fromEntries(state.quiz.questionIds.map(id => [id, module.quiz.bank.find(item => item.id === id).correctChoice]));
    run('quiz_submit', { quizId: state.quiz.id, answers });
  }
  return state;
}
const reviewState = completeReview(course);
const input = () => ({ id: randomUUID(), reviewAttemptId: randomUUID(), reviewState });
function answersFor(attempt, correctCount = 25, def = definition) {
  return Object.fromEntries(attempt.questionIds.map((id, index) => {
    const item = def.items.find(item => item.id === id);
    return [id, index < correctCount ? item.correctChoice : item.options.find(option => option.id !== item.correctChoice).id];
  }));
}

test('draft definition uses exactly fifty active questions, immutable source binding and no release authority', () => {
  assert.equal(definition.items.length, 50); assert.equal(definition.questionCount, 25);
  assert.equal(definition.assignedCreditSeconds, 0); assert.equal(definition.studentDeliveryEnabled, false);
  assert.equal(definition.humanReviewed, false); assert.equal(definition.creditIssuanceAllowed, false);
  assert.equal(definition.contentDigest, course.digest); assert.ok(Object.isFrozen(definition.items[0].options));
  const changed = structuredClone(items); changed[0].options[0].text += ' changed';
  assert.notEqual(define(changed).digest, definition.digest);
  assert.throws(() => define(items.slice(1)), /bank_ratio/);
  assert.throws(() => define(items, { F01: 25 }), /invalid_blueprint/);
});

test('candidate validation rejects duplicate or formative stems, bad keys, sources and remediation', () => {
  for (const mutate of [
    bank => { bank[1].id = bank[0].id; },
    bank => { bank[1].stem = bank[0].stem; },
    bank => { bank[0].stem = course.modules[0].quiz.bank[0].stem; },
    bank => { bank[0].correctChoice = 'E'; },
    bank => { bank[0].remediation.unitIds = ['G01-U01']; },
    bank => { bank[0].options[1].text = bank[0].options[0].text; },
    bank => { bank[0].sourceRefs[0].url = 'https://user:password@example.org/'; },
    bank => { delete bank[0].distractorRationales.B; },
  ]) { const bank = structuredClone(items); mutate(bank); assert.throws(() => define(bank), /nmls_final_/); }
  const diagnostics = inspectNmlsFinalCandidates(course, items);
  assert.equal(diagnostics.semanticIndependenceVerified, false); assert.equal(diagnostics.legalAccuracyVerified, false);
});

test('final stays unavailable without all units, module quizzes and exact original content binding', () => {
  const started = startNmlsCourseReview(course);
  for (const candidate of [started, { ...reviewState, passedModuleIds: ['F01'] },
    { ...reviewState, completedUnitIds: ['F01-U01'] }, { ...reviewState, contentDigest: 'b'.repeat(64) },
    { ...reviewState, status: 'active' }, { ...reviewState, quiz: { id: 'unfinished' } },
    { ...reviewState, bookmark: { pending: true } }, { ...reviewState, quizReservation: { pending: true } },
    { ...reviewState, completedUnitIds: [...reviewState.completedUnitIds, 'F01-U01'] }]) {
    assert.throws(() => drawNmlsDraftFinal(definition, { ...input(), reviewState: candidate }), /review_prerequisites/);
  }
});

test('selected questions and answer order persist without private key or source explanations', () => {
  const attempt = drawNmlsDraftFinal(definition, input(), { draw: () => 0 });
  const projected = projectNmlsDraftFinal(definition, attempt);
  assert.equal(projected.questions.length, 25); assert.equal(new Set(attempt.questionIds).size, 25);
  assert.equal(attempt.questionIds.filter(id => id.startsWith('N26-FIN-F')).length, 13);
  assert.deepEqual(projectNmlsDraftFinal(definition, attempt), projected);
  assert.doesNotMatch(JSON.stringify(projected), /correctChoice|rationale|sourceRefs|independenceNote|Private synthetic/);
  assert.ok(projected.questions.every(item => item.options.map(option => option.id).join('') !== 'ABCD'));
  assert.throws(() => drawNmlsDraftFinal(definition, input(), { draw: size => size }), /invalid_random_draw/);
});

test('all correct-count boundaries grade exactly; seventeen of twenty-five never rounds into a pass', () => {
  const attempt = drawNmlsDraftFinal(definition, input());
  for (let score = 0; score <= 25; score++) {
    const outcome = gradeNmlsDraftFinal(definition, attempt, answersFor(attempt, score));
    assert.equal(outcome.correct, score); assert.equal(outcome.percent, score * 4); assert.equal(outcome.requiredCorrect, 18);
    assert.equal(outcome.passed, score >= 18); assert.equal(outcome.creditIssuanceAllowed, false);
    assert.equal(outcome.courseCompletionIssued, false); assert.equal(outcome.assignedCreditSeconds, 0);
    assert.doesNotMatch(JSON.stringify(outcome), /correctChoice|rationale|sourceRefs|N26-FIN/);
  }
});

test('grading rejects incomplete, extra, array, unknown and non-string answer sets', () => {
  const attempt = drawNmlsDraftFinal(definition, input()); const answers = answersFor(attempt);
  for (const candidate of [{}, [], { ...answers, unexpected: 'A' }, { ...answers, [attempt.questionIds[0]]: 'E' },
    { ...answers, [attempt.questionIds[0]]: ['A'] }, Object.fromEntries(Object.entries(answers).slice(1))]) {
    assert.throws(() => gradeNmlsDraftFinal(definition, attempt, candidate), /invalid_answers/);
  }
});

test('failed modules require a newly pinned real unit/quiz remediation review before a completely fresh retry', () => {
  const initial = input(); const first = drawNmlsDraftFinal(definition, initial);
  // Miss only Ethics so the remediation is targeted, not the entire course.
  const answers = Object.fromEntries(first.questionIds.map(id => {
    const item = definition.items.find(item => item.id === id);
    return [id, item.moduleId === 'E01' ? item.options.find(option => option.id !== item.correctChoice).id : item.correctChoice];
  }));
  const result = gradeNmlsDraftFinal(definition, first, answers);
  assert.equal(result.disposition, 'remediation_required'); assert.deepEqual(result.remediation.map(entry => entry.moduleId), ['E01']);
  const remed = makeNmlsFinalRemediationCourse(definition, course, first, answers);
  assert.deepEqual(remed.modules.map(module => module.id), ['E01']);
  assert.deepEqual(remed.modules[0], course.modules[1]); assert.equal(remed.editorial.creditIssuanceAllowed, false);
  assert.notEqual(remed.digest, course.digest);
  const retryInput = { ...initial, id: randomUUID(), previous: { attempt: first, answers } };
  assert.throws(() => drawNmlsDraftFinal(definition, retryInput, { course }), /review_prerequisites/);
  assert.throws(() => drawNmlsDraftFinal(definition, { ...retryInput, previous: { ...retryInput.previous, remediationState: reviewState } }, { course }), /review_prerequisites/);
  assert.throws(() => drawNmlsDraftFinal(definition, { ...retryInput, previous: { ...retryInput.previous,
    remediationState: { ...startNmlsCourseReview(remed), status: 'review_complete' } } }, { course }), /review_prerequisites/);
  const remediationState = completeReview(remed);
  const second = drawNmlsDraftFinal(definition, { ...retryInput, previous: { ...retryInput.previous, remediationState } }, { course });
  assert.equal(second.number, 2); assert.equal(second.questionIds.filter(id => first.questionIds.includes(id)).length, 0);
  assert.equal(gradeNmlsDraftFinal(definition, second, answersFor(second, 0)).disposition, 'staff_review_required');
  assert.throws(() => drawNmlsDraftFinal(definition, { ...initial, id: randomUUID(), previous: { attempt: second,
    answers: answersFor(second, 0), remediationState } }, { course }), /staff_review_required/);
});

test('retry refuses passed, changed, reused-ID, other-review and foreign-remediation attempts', () => {
  const initial = input(); const first = drawNmlsDraftFinal(definition, initial); const answers = answersFor(first, 0);
  assert.throws(() => drawNmlsDraftFinal(definition, { ...initial, id: randomUUID(),
    previous: { attempt: first, answers: answersFor(first) } }, { course }), /already_passed/);
  assert.throws(() => drawNmlsDraftFinal(definition, { ...initial, previous: { attempt: first, answers } }, { course }), /attempt_scope/);
  assert.throws(() => drawNmlsDraftFinal(definition, { ...input(), previous: { attempt: first, answers } }, { course }), /attempt_scope/);
  const otherFirst = drawNmlsDraftFinal(definition, { ...initial, id: randomUUID() });
  const otherRemed = makeNmlsFinalRemediationCourse(definition, course, otherFirst, answersFor(otherFirst, 0));
  assert.throws(() => drawNmlsDraftFinal(definition, { ...initial, id: randomUUID(), previous: { attempt: first,
    answers, remediationState: completeReview(otherRemed) } }, { course }), /review_prerequisites/);
  const changed = structuredClone(definition); changed.items[0].correctChoice = 'D';
  assert.throws(() => projectNmlsDraftFinal(changed, first), /definition_changed/);
});

test('tampered question selections and option orders never reach the grading or projection path', () => {
  const attempt = drawNmlsDraftFinal(definition, input());
  for (const mutate of [
    copy => { copy.questionIds[0] = copy.questionIds[1]; },
    copy => { copy.questionIds[0] = 'not-in-bank'; },
    copy => { copy.optionOrder[copy.questionIds[0]] = ['A', 'A', 'C', 'D']; },
    copy => { copy.optionOrder.extra = ['A', 'B', 'C', 'D']; },
    copy => { copy.definitionDigest = 'f'.repeat(64); },
    copy => { copy.number = 3; },
  ]) { const copy = structuredClone(attempt); mutate(copy); assert.throws(() => projectNmlsDraftFinal(definition, copy), /invalid_attempt/); }
});

test('retake source is verified by its actual payload, not a copied course digest label', () => {
  const attempt = drawNmlsDraftFinal(definition, input());
  for (const mutate of [copy => { copy.modules[0].units[0].requiredSeconds = 1; },
    copy => { copy.modules[0].units[0].content = 'replacement'; },
    copy => { copy.modules[0].quiz.bank[0].correctChoice = 'D'; }]) {
    const changed = structuredClone(course); mutate(changed);
    assert.throws(() => makeNmlsFinalRemediationCourse(definition, changed, attempt, answersFor(attempt, 0)), /remediation_scope/);
  }
});

test('rehashed malformed definitions cannot lower the passing score or lift draft-only limits', () => {
  const original = drawNmlsDraftFinal(definition, input());
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  for (const mutate of [copy => { copy.passPercent = 0; }, copy => { copy.questionCount = 1; },
    copy => { copy.maxAutomaticAttempts = 100; }, copy => { copy.year = 2027; },
    copy => { copy.humanReviewed = true; }, copy => { copy.salesAuthorized = true; },
    copy => { copy.units.push(copy.units[0]); }, copy => { copy.moduleQuotas.F01 = 12; }]) {
    const changed = structuredClone(definition); mutate(changed); delete changed.digest;
    changed.digest = createHash('sha256').update(JSON.stringify(canonical(changed))).digest('hex');
    const attempt = { ...original, definitionDigest: changed.digest };
    assert.throws(() => gradeNmlsDraftFinal(changed, attempt, answersFor(original, 0)), /definition_changed/);
  }
});

test('cross-module supporting lessons are included in targeted remediation, not silently omitted', () => {
  const bank = structuredClone(items);
  bank.filter(item => item.moduleId === 'E01').forEach(item => { item.remediation.unitIds.push('F01-U01'); });
  const def = define(bank); const first = drawNmlsDraftFinal(def, input());
  const answers = Object.fromEntries(first.questionIds.map(id => {
    const item = def.items.find(item => item.id === id);
    return [id, item.moduleId === 'E01' ? item.options.find(option => option.id !== item.correctChoice).id : item.correctChoice];
  }));
  assert.deepEqual(gradeNmlsDraftFinal(def, first, answers).remediation.map(module => module.moduleId), ['F01', 'E01']);
  const remed = makeNmlsFinalRemediationCourse(def, course, first, answers);
  assert.deepEqual(remed.modules.map(module => module.id), ['F01', 'E01']);
});
