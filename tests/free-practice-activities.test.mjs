import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {TEXAS_FULL_PRACTICE_SOURCES, loadTexasPracticeActivities, projectPracticeActivities, parsePracticeNumber} from '../scripts/lib/free-practice-activities.mjs';

const source = {url: 'https://www.trec.texas.gov/forms/', reference: 'Fixture reference; not a claim of actual authority'};
const selection = {id: 'SC-T1', type: 'selection', prompt: 'Choose the supplied fixture answer.', choices: ['a', 'b', 'c', 'd'], correctChoice: 2, feedbackCorrect: 'Fixture explanation.'};
const numeric = {id: 'SC-T2', type: 'computation', prompt: 'Enter the supplied fixture result.', expected: 0, tolerance: .01, unitLabel: 'USD', feedbackCorrect: 'Zero is a valid numeric answer.'};
const written = {id: 'SC-T3', type: 'short-answer', prompt: 'Explain the supplied fixture.', rubric: ['First criterion', {id: 'two', description: 'Second criterion', required: true}], feedbackCorrect: 'Compare the evidence; no automated written grade.'};
const fixture = () => structuredClone({courseId: 'tx-fixture-30', lessonIds: ['module-01', 'module-02'], scenarios: [{id: 'SC', title: 'Fixture scenario', afterTopic: 'T02', context: 'Full context.', facts: ['Full context.', 'A separate material fact.'], sources: [source], tasks: [selection, numeric, written], optionalReflection: {prompt: 'Optional thought', graded: true}}], misconceptions: [{...selection, id: 'MC', module: 'module-01', rationale: 'Check the misconception.', sources: [source]}]});

test('only the three explicit non-credit course mappings are accepted', async () => {
  assert.equal(TEXAS_FULL_PRACTICE_SOURCES.length, 3);
  assert.deepEqual(TEXAS_FULL_PRACTICE_SOURCES.map(s => s.lessonCount), [11, 9, 10]);
  assert.deepEqual(TEXAS_FULL_PRACTICE_SOURCES.map(s => s.scenarioTaskCount), [30, 24, 20]);
  for (const entry of TEXAS_FULL_PRACTICE_SOURCES) {
    assert.doesNotMatch(entry.scenarioPath, /protected|final|reviewer-loader/);
    assert.deepEqual(entry.bankExports, ['TOPIC_QUIZZES', 'REPLACEMENTS']);
    assert.ok(!entry.curriculumDir.includes('/practice/'));
  }
  await assert.rejects(loadTexasPracticeActivities({root: '/unused-fixture', courseId: 'tx-unknown-30', lessonIds: []}), /Unknown/);
  await assert.rejects(loadTexasPracticeActivities({root: '/unused-fixture', courseId: TEXAS_FULL_PRACTICE_SOURCES[0].courseId, lessonIds: []}), /Incomplete lesson/);
});

test('context, separate facts, keys, inherited sources and mixed rubric formats survive projection', () => {
  const output = projectPracticeActivities(fixture());
  assert.equal(output.length, 2);
  const [scenario, misconception] = output;
  assert.equal(scenario.context, 'Full context.');
  assert.deepEqual(scenario.facts, ['A separate material fact.']);
  assert.equal(scenario.lesson_id, 'module-02');
  assert.equal(misconception.lesson_id, 'module-01');
  assert.deepEqual(scenario.tasks.map(t => t.type), ['selection', 'computation', 'self-review']);
  assert.equal(scenario.tasks[0].solution, 2);
  assert.equal(scenario.tasks[1].solution, 0);
  assert.equal(scenario.tasks[1].unit, 'USD');
  assert.equal(scenario.tasks[2].rubric[1].description, 'Second criterion');
  assert.equal(scenario.tasks[2].rubric[1].emphasized, true);
  assert.match(scenario.tasks[2].review_notice, /not an instructor grade/);
  assert.deepEqual(scenario.tasks[0].sources, [source]);
  assert.deepEqual(scenario.optional_reflection, {prompt: 'Optional thought', graded: false, required: false});
  assert.doesNotMatch(JSON.stringify(output), /correctChoice|passingScore|instructorReview|plannedMinutes/);
});

test('all three authored numeric aliases normalize without losing zero', () => {
  for (const key of ['expected', 'answer', 'correctValue']) {
    const input = fixture();
    delete input.scenarios[0].tasks[1].expected;
    input.scenarios[0].tasks[1] = {...numeric, expected: undefined, [key]: 0};
    assert.equal(projectPracticeActivities(input)[0].tasks[1].solution, 0);
  }
});

test('capstone is available at the final lesson, with malformed placement refused', () => {
  const input = fixture();
  input.scenarios[0].courseLevel = true;
  assert.equal(projectPracticeActivities(input)[0].lesson_id, 'module-02');
  input.scenarios[0].afterTopic = 'T01';
  assert.throws(() => projectPracticeActivities(input), /capstone/);
  input.scenarios[0].courseLevel = false;
  input.scenarios[0].afterTopic = 'T99';
  assert.throws(() => projectPracticeActivities(input), /valid lesson/);
  input.scenarios[0].afterTopic = 'T02';
  input.scenarios[0].module = 'module-01';
  assert.throws(() => projectPracticeActivities(input), /Conflicting/);
});

test('unknown, incomplete, duplicated and unsafe task inputs fail instead of disappearing', () => {
  for (const alter of [
    input => {input.scenarios[0].tasks = [];},
    input => {input.scenarios[0].tasks[0].type = 'essay-auto-pass';},
    input => {input.scenarios[0].tasks[0].correctChoice = 4;},
    input => {input.scenarios[0].tasks[0].choices = ['a', 'a', 'b', 'c'];},
    input => {input.scenarios[0].tasks[1].expected = Infinity;},
    input => {input.scenarios[0].tasks[1].tolerance = -.01;},
    input => {input.scenarios[0].tasks[2].rubric = [];},
    input => {input.scenarios[0].tasks[1].id = 'SC-T1';},
    input => {input.scenarios[0].sources = [{url: 'javascript:alert(1)', reference: 'unsafe'}];},
  ]) {
    const input = structuredClone(fixture()); alter(input);
    assert.throws(() => projectPracticeActivities(input));
  }
});

test('numeric parsing refuses accidental zero and nonfinite input', () => {
  for (const value of [null, undefined, '', ' ', false, true, NaN, Infinity, 'Infinity', '1,000', '$100', {}, [], '12x']) assert.equal(parsePracticeNumber(value), null);
  for (const [input, output] of [[0, 0], ['0', 0], [' -2.50 ', -2.5], ['.25', .25], ['12.', 12]]) assert.equal(parsePracticeNumber(input), output);
});

test('activity edits change the content revision when included in the payload', () => {
  const hash = input => createHash('sha256').update(JSON.stringify({activities: projectPracticeActivities(input)})).digest('hex');
  const before = fixture(), after = structuredClone(before);
  after.scenarios[0].context += ' Material change.';
  assert.notEqual(hash(before), hash(after));
});
