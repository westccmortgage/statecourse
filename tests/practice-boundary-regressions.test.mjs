/** Portable, Node-only additions to existing root coverage. No jsdom dependency.
 * Place this file and public-practice-import-guard.mjs in root/tests, or supply
 * STATECOURSE_ROOT while running this proposal outside the checkout. No writes.
 * Existing tests already cover projection fixtures, ordinary scoring, workflows,
 * static publishing markers and UI state. These test the missing edge/boundaries.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = path.resolve(process.env.STATECOURSE_ROOT || fileURLToPath(new URL('..', import.meta.url)));
const load = relative => import(pathToFileURL(path.join(root, relative)));
const { checkPracticeTask } = await load('public/statecourse/practice-activities.mjs');
const { createTexasReviewerEngine } = await load('config/texas/complete-course-reviewer-engine.mjs');
const { TEXAS_FULL_PRACTICE_SOURCES, loadTexasPracticeActivities } = await load('scripts/lib/free-practice-activities.mjs');
const at = '2026-09-07T12:00:00.000Z';

const decimalCases = [
  { solution: 1, tolerance: .01, answer: 1.01, pass: true },
  { solution: 1, tolerance: .01, answer: .99, pass: true },
  { solution: 1, tolerance: .01, answer: 1.0101, pass: false },
  { solution: 1, tolerance: .01, answer: .9899, pass: false },
  { solution: 100000, tolerance: .01, answer: 100000.01, pass: true },
  { solution: 100000, tolerance: .01, answer: 99999.99, pass: true },
  { solution: 0, tolerance: .01, answer: .01, pass: true },
  { solution: 0, tolerance: .01, answer: -.01, pass: true },
  { solution: 1, tolerance: 0, answer: 1, pass: true },
  { solution: 1, tolerance: 0, answer: 1 + Number.EPSILON, pass: false },
  { solution: 1, tolerance: 0, answer: 1 - Number.EPSILON, pass: false },
  { solution: 0, tolerance: 0, answer: 0, pass: true },
  { solution: 0, tolerance: 0, answer: Number.MIN_VALUE, pass: false }
];

function privateFixture(numericTask) {
  const quizzes = [0, 1, 2].map(index => ({ id: `Q${index}`, tests: 'T01U1', prompt: 'Boundary-test prerequisite only.',
    choices: ['a', 'b', 'c', 'd'], correctChoice: 0, rationale: 'Fixture prerequisite.' }));
  const engine = createTexasReviewerEngine({ courseId: 'boundary-fixture', freeze: 'TEST_ONLY_NOT_APPROVAL',
    topics: [{ code: 'T01', units: [{ code: 'T01U1' }] }], quizzes: { T01: quizzes }, replacements: {},
    scenarios: [{ id: 'SC', afterTopic: 'T01', passingScore: 1, tasks: [{ id: 'number', type: 'computation', ...numericTask }] }],
    bank: [], forms: {}, misconceptions: [] });
  let state = engine.openReviewer({ learnerId: 'automated-boundary-fixture', at });
  state = engine.recordIdentityCheck(state, { method: 'TEST_ONLY', evidenceRef: 'not-human-identity-evidence', at });
  state = engine.readUnit(state, { unitCode: 'T01U1', at });
  for (const item of quizzes) state = engine.answerQuiz(state, { primaryId: item.id, choice: 0, at });
  return { engine, state };
}

test('public checker: positive decimal boundary is inclusive and zero tolerance stays exact', () => {
  for (const sample of decimalCases) {
    const result = checkPracticeTask({ id: 'number', type: 'computation', solution: sample.solution, tolerance: sample.tolerance, explanation: 'Numeric boundary fixture.' }, sample.answer);
    assert.equal(result.status === 'correct', sample.pass, JSON.stringify(sample));
  }
});

test('private checker: all numeric aliases preserve the same decimal and exact-zero boundaries', () => {
  for (const alias of ['answer', 'correctValue', 'expected']) for (const sample of decimalCases) {
    const { engine, state } = privateFixture({ [alias]: sample.solution, tolerance: sample.tolerance });
    const result = engine.gradeScenario(state, { id: 'SC', responses: { number: sample.answer }, at });
    assert.equal(result.scenarios.SC.grades[0].passed, sample.pass, alias + ': ' + JSON.stringify(sample));
    assert.equal(result.scenarios.SC.passed, sample.pass);
    assert.equal(result.creditEligible, false);
  }
});

test('actual TX3 public/projection imports execute under a native protected-module guard', () => {
  const guardUrl = new URL('./public-practice-import-guard.mjs', import.meta.url).href;
  const script = `
    import { register } from 'node:module';
    import path from 'node:path';
    import { pathToFileURL } from 'node:url';
    const root = process.env.STATECOURSE_ROOT;
    register(${JSON.stringify(guardUrl)}, { data: { root } });
    const load = p => import(pathToFileURL(path.join(root, p)));
    await load('public/statecourse/practice-activities.mjs');
    const { TEXAS_FULL_PRACTICE_SOURCES, loadTexasPracticeActivities } = await load('scripts/lib/free-practice-activities.mjs');
    const counts = [];
    for (const source of TEXAS_FULL_PRACTICE_SOURCES) {
      const bank = await load(source.bankPath);
      const questions = [...Object.values(bank.TOPIC_QUIZZES).flat(), ...Object.values(bank.REPLACEMENTS).flat()];
      const activities = await loadTexasPracticeActivities({ root, courseId: source.courseId,
        lessonIds: Array.from({ length: source.lessonCount }, (_, i) => 'module-' + String(i + 1).padStart(2, '0')) });
      counts.push({ courseId: source.courseId, questions: questions.length, activities: activities.length, tasks: activities.reduce((n, a) => n + a.tasks.length, 0) });
    }
    // Verify the guard actually rejects both protected delivery and a real final-bank path.
    let refused = 0;
    for (const relative of ['config/texas/complete-course-reviewer-engine.mjs', 'config/texas/real-estate-finance-final-exam-bank.mjs']) {
      try { await load(relative); throw Error('Guard did not refuse protected import'); }
      catch (error) { if (!error.message.includes('PUBLIC_IMPORT_PROTECTED_BOUNDARY:')) throw error; refused++; }
    }
    console.log(JSON.stringify({ counts, refused }));
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    env: { ...process.env, STATECOURSE_ROOT: root }, encoding: 'utf8', timeout: 30000
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout.trim());
  assert.equal(report.refused, 2);
  assert.deepEqual(report.counts, [
    { courseId: 'tx-law-of-contracts-30', questions: 162, activities: 12, tasks: 36 },
    { courseId: 'tx-promulgated-contract-forms-30', questions: 130, activities: 4, tasks: 24 },
    { courseId: 'tx-real-estate-finance-30', questions: 148, activities: 4, tasks: 20 }
  ]);
});

test('actual generated TX3 payloads equal explicit formative sources and revision includes activities', async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/statecourse/data/free-practice-catalog.json'), 'utf8'));
  let questionCount = 0, taskCount = 0;
  for (const source of TEXAS_FULL_PRACTICE_SOURCES) {
    const sample = manifest.samples.find(item => item.course_id === source.courseId);
    assert.ok(sample, source.courseId + ': missing public catalog entry');
    const payload = JSON.parse(fs.readFileSync(path.join(root, 'public/statecourse', sample.practice_url), 'utf8'));
    const bank = await load(source.bankPath);
    const known = new Map();
    const seenPrompts = new Set();
    for (const groups of [bank.TOPIC_QUIZZES, bank.REPLACEMENTS]) for (const [group, items] of Object.entries(groups)) for (const item of items) {
      const promptKey = item.prompt.trim().toLowerCase();
      if (seenPrompts.has(promptKey)) continue; seenPrompts.add(promptKey);
      const lesson = item.module ?? 'module-' + group.match(/\d+/)[0].padStart(2, '0');
      const projected = { id: `${source.courseId}:${item.id}`, lesson_id: lesson, prompt: item.prompt,
        choices: [...item.choices], solution: item.correctChoice, explanation: item.rationale, sources: item.sources ?? [] };
      known.set(projected.id, projected);
    }
    assert.equal(payload.questions.length, known.size, source.courseId + ': omitted or foreign formative questions');
    for (const item of payload.questions) assert.deepEqual(item, known.get(item.id), source.courseId + ': unknown/changed public item ' + item.id);
    const projectedActivities = await loadTexasPracticeActivities({ root, courseId: source.courseId, lessonIds: payload.lessons.map(lesson => lesson.id) });
    assert.deepEqual(payload.activities, projectedActivities, source.courseId + ': actual scenario projection mismatch');
    assert.equal(sample.revision, createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16), 'published revision must include the actual activities payload');
    questionCount += payload.questions.length;
    taskCount += payload.activities.reduce((n, activity) => n + activity.tasks.length, 0);
  }
  assert.equal(questionCount, 440);
  assert.equal(taskCount, 80);
});

test('actual generated TX3 public item IDs and prompts exclude every protected final-bank item', async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/statecourse/data/free-practice-catalog.json'), 'utf8'));
  const { TEXAS_COMPLETION_COURSES } = await load('config/texas/completion-courses.mjs');
  const normalized = value => String(value).normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
  let finalCount = 0;
  for (const spec of TEXAS_COMPLETION_COURSES) {
    const sample = manifest.samples.find(item => item.course_id === spec.catalogCourseId);
    assert.ok(sample);
    const payload = JSON.parse(fs.readFileSync(path.join(root, 'public/statecourse', sample.practice_url), 'utf8'));
    // Protected content is read only in this Node test, never in the guarded public-import process.
    const { FINAL_EXAM_BANK } = await load(spec.finalBankPath);
    const publicItems = [...payload.questions, ...payload.activities.flatMap(activity => activity.tasks)];
    const publicPrompts = new Set(publicItems.map(item => normalized(item.prompt)));
    const publicText = JSON.stringify(payload);
    for (const final of FINAL_EXAM_BANK) {
      assert.ok(!publicText.includes(final.id), spec.catalogCourseId + ': protected final ID leaked');
      assert.ok(!publicPrompts.has(normalized(final.prompt)), spec.catalogCourseId + ': protected final prompt leaked');
    }
    finalCount += FINAL_EXAM_BANK.length;
  }
  assert.equal(finalCount, 412);
});
