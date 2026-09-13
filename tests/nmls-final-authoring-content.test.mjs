import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { getNmlsFinalAuthoringCandidates, getNmlsDraftFinalDefinition,
  NMLS_FINAL_AUTHORING_BLUEPRINTS, NMLS_FINAL_CANDIDATE_HOLDS } from '../lib/nmls-final-authoring-content.mjs';
import { drawNmlsDraftFinal, projectNmlsDraftFinal, gradeNmlsDraftFinal,
  makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';

// Trusted-shape synthetic fixture, NOT actual study/attendance evidence. The
// separate runtime suite traverses real units/quizzes with test-only clocks.
function completedFixture(course) {
  return { ...startNmlsCourseReview(course), status: 'review_complete', current: null, quiz: null,
    completedUnitIds: course.modules.flatMap(module => module.units.map(unit => unit.id)),
    passedModuleIds: course.modules.map(module => module.id) };
}
const keys = Object.keys(NMLS_FINAL_AUTHORING_BLUEPRINTS);
const all = getNmlsFinalAuthoringCandidates();
const definitions = keys.map(getNmlsDraftFinalDefinition);
const answersFor = (definition, attempt, right = true) => Object.fromEntries(attempt.questionIds.map(id => {
  const item = definition.items.find(item => item.id === id);
  return [id, right ? item.correctChoice : item.options.find(option => option.id !== item.correctChoice).id];
}));

test('private source inventory has 64 candidates, two explicit holds, and exactly 50 selected per version', () => {
  assert.equal(all.length, 64); assert.equal(new Set(all.map(item => item.id)).size, 64);
  assert.deepEqual(Object.keys(NMLS_FINAL_CANDIDATE_HOLDS), ['N26-FIN-G04', 'N26-FIN-G08']);
  for (const [category, count] of Object.entries({ federal: 24, ethics: 16, nontraditional: 16, general: 8 })) {
    assert.equal(all.filter(item => item.category === category).length, count);
  }
  for (const definition of definitions) {
    assert.equal(definition.items.length, 50); assert.equal(definition.questionCount, 25);
    assert.equal(definition.humanReviewed, false); assert.equal(definition.studentDeliveryEnabled, false);
    assert.equal(definition.creditIssuanceAllowed, false); assert.equal(definition.salesAuthorized, false);
    assert.equal(definition.diagnostics.legalAccuracyVerified, false);
    for (const [moduleId, quota] of Object.entries(definition.moduleQuotas)) {
      assert.equal(definition.items.filter(item => item.moduleId === moduleId).length, 2 * quota);
    }
    assert.ok(definition.items.every(item => !Object.hasOwn(NMLS_FINAL_CANDIDATE_HOLDS, item.id)));
    assert.ok(definition.items.some(item => item.id === 'N26-FIN-E07' && item.moduleId === 'E02'));
  }
  assert.equal(new Set(definitions.flatMap(definition => definition.items.map(item => item.id))).size, 56);
  assert.throws(() => getNmlsDraftFinalDefinition('nmls-2026-national-core-private-review-v2'), /authoring_content_invalid/);
  assert.throws(() => getNmlsDraftFinalDefinition('__proto__'), /authoring_content_invalid/);
  assert.ok(Object.isFrozen(all[0].sourceRefs[0]));
});

test('v3 averaging correction is additive and leaves existing v2 digests and all other lessons intact', () => {
  const oldDigests = {
    core: '677cbd25f25d5437eecffd6597ecf982b56ea4ccd3c92f0c6d2a1a04e7d1e2a3',
    comprehensive: '79f894fbff35737d1dad209904d90bad75c7a371a27ace2acb0b5c230ad74343',
  };
  for (const variant of ['core', 'comprehensive']) {
    const before = getNmlsReviewCourse(`nmls-2026-national-${variant}-private-review-v2`);
    const after = getNmlsReviewCourse(`nmls-2026-national-${variant}-private-review-v3`);
    assert.equal(before.digest, oldDigests[variant]);
    assert.equal(after.digest, NMLS_FINAL_AUTHORING_BLUEPRINTS[after.id].contentDigest);
    assert.equal(after.editorial.completeCourse, false); assert.equal(after.editorial.finalExamIncluded, false);
    assert.equal(after.editorial.validatedDuration, false);
    for (let m = 0; m < before.modules.length; m++) {
      assert.deepEqual(after.modules[m].quiz, before.modules[m].quiz);
      for (let u = 0; u < before.modules[m].units.length; u++) {
        const oldUnit = before.modules[m].units[u]; const newUnit = after.modules[m].units[u];
        if (oldUnit.id !== 'F03-U01') assert.deepEqual(newUnit, oldUnit);
        else {
          assert.deepEqual({ ...newUnit, content: oldUnit.content }, oldUnit);
          assert.match(newUnit.content, /compliant even if collections exceed provider payments over time/);
          assert.equal(newUnit.content.split('### Averaging clarification source').length, 2);
          assert.doesNotMatch(oldUnit.content, /### Averaging clarification source/);
        }
      }
    }
  }
});

for (const definition of definitions) test(`${definition.id}: every active item and all four responses use its stored key`, () => {
  const course = getNmlsReviewCourse(definition.courseKey);
  const input = { id: randomUUID(), reviewAttemptId: randomUUID(), reviewState: completedFixture(course) };
  const first = drawNmlsDraftFinal(definition, input, { draw: () => 0 });
  const wrong = answersFor(definition, first, false);
  const remediation = makeNmlsFinalRemediationCourse(definition, course, first, wrong);
  const second = drawNmlsDraftFinal(definition, { ...input, id: randomUUID(), previous: {
    attempt: first, answers: wrong, remediationState: completedFixture(remediation),
  } }, { draw: () => 0, course });
  assert.equal(first.questionIds.filter(id => second.questionIds.includes(id)).length, 0);
  assert.equal(new Set([...first.questionIds, ...second.questionIds]).size, 50);
  for (const attempt of [first, second]) {
    const correct = answersFor(definition, attempt);
    assert.equal(gradeNmlsDraftFinal(definition, attempt, correct).correct, 25);
    const projected = projectNmlsDraftFinal(definition, attempt);
    assert.equal(projected.questions.length, 25);
    assert.doesNotMatch(JSON.stringify(projected), /correctChoice|rationale|sourceRefs|independenceNote|remediation/);
    for (const itemId of attempt.questionIds) {
      const item = definition.items.find(candidate => candidate.id === itemId);
      for (const option of item.options) {
        const result = gradeNmlsDraftFinal(definition, attempt, { ...correct, [itemId]: option.id });
        assert.equal(result.correct, option.id === item.correctChoice ? 25 : 24, `${itemId}/${option.id}`);
        assert.equal(result.courseCompletionIssued, false);
        assert.equal(result.creditIssuanceAllowed, false);
      }
    }
  }
});

test('actual F21 source linkage includes both CD and shopping lessons in failed-attempt remediation', () => {
  const definition = definitions[0]; const course = getNmlsReviewCourse(definition.courseKey);
  const attempt = drawNmlsDraftFinal(definition, { id: randomUUID(), reviewAttemptId: randomUUID(), reviewState: completedFixture(course) }, { draw: () => 0 });
  assert.ok(attempt.questionIds.includes('N26-FIN-F21'));
  const independent = attempt.questionIds.filter(id => id !== 'N26-FIN-F21' && definition.items.find(item => item.id === id).moduleId !== 'F02');
  const misses = ['N26-FIN-F21', ...independent.slice(0, 7)];
  const answers = answersFor(definition, attempt);
  const wrong = answersFor(definition, attempt, false);
  misses.forEach(id => { answers[id] = wrong[id]; });
  const result = gradeNmlsDraftFinal(definition, attempt, answers);
  assert.equal(result.correct, 17); assert.equal(result.passed, false);
  assert.ok(result.remediation.some(module => module.moduleId === 'F02'));
  assert.ok(result.remediation.some(module => module.moduleId === 'F03'));
  const control = { ...answers, 'N26-FIN-F21': definition.items.find(item => item.id === 'N26-FIN-F21').correctChoice,
    [independent[7]]: wrong[independent[7]] };
  const controlResult = gradeNmlsDraftFinal(definition, attempt, control);
  assert.equal(controlResult.correct, 17);
  assert.ok(!controlResult.remediation.some(module => module.moduleId === 'F02'));
});

test('final candidates, private keys and authoring imports are absent from public build trees', () => {
  function walk(directory) {
    if (!existsSync(directory)) return [];
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
      ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)]);
  }
  const files = ['public', 'dist', 'site'].flatMap(directory => walk(directory));
  let inspected = 0;
  for (const path of files) {
    if (!/\.(?:html|[cm]?js|json|txt|md|map)$/.test(path)) continue;
    const content = readFileSync(path, 'utf8'); inspected++;
    assert.doesNotMatch(content, /N26-FIN-[FENG]\d{2}|nmls-final-authoring-content|nmls-final-history|nmls-final-remediation|statecourse-nmls-final-authoring-v1/, path);
    for (const item of all) assert.ok(!content.includes(item.stem), `${path}: final stem ${item.id}`);
  }
  assert.ok(inspected > 10, 'must inspect actual public source/output, not an empty directory');
  const endpoint = readFileSync('netlify/functions/student-nmls-review.mts', 'utf8');
  assert.doesNotMatch(endpoint, /nmls-final-/);
});
