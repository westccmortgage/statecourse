import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildPeEvidenceLab, publicPeEvidenceLabSource } from '../config/pe-evidence-lab.mjs';
import { buildPeFoundationsPractice } from '../scripts/lib/pe-foundations-practice.mjs';
import { TOPIC_QUIZZES } from '../config/pe-foundations-practice.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const hash = value => createHash('sha256').update(value).digest('hex');
const build = options => {
  const files = new Map();
  const sample = buildPeFoundationsPractice({ root, write: (name, content) => files.set(name, content), ...options });
  return { sample, files, payload: JSON.parse(files.get(sample.practice_url)) };
};

test('the PE03 input pair retains the independently reviewed public content exactly', () => {
  assert.equal(hash(fs.readFileSync(new URL('../config/pe-public-practice/PE03-evidence-lab.json', import.meta.url))), '86e99f73082309c748b67ac00df47edc0cc3a2f623f7f397ef8ede8d2ac2a3bb');
  assert.equal(hash(fs.readFileSync(new URL('../nmls/pe-foundations/practice/pe03-evidence-lab.md', import.meta.url))), '8c6cd1f3c9050defa01665030f613429b3a08aa09da2ca9edad53ad839d5d370');
});

test('lab projection preserves all relevant numbers and rubrics separately for each path', () => {
  const source = publicPeEvidenceLabSource(), before = structuredClone(source);
  const lab = buildPeEvidenceLab({ bundle: source });
  assert.deepEqual(source, before);
  assert.equal(lab.exhibits.length, 10);
  assert.equal(lab.stages.length, 5);
  assert.equal(lab.lesson_id, 'module-03');
  assert.equal(lab.creditEligible, false);
  assert.equal(lab.durationValidated, false);
  assert.equal(lab.oilDeliveryImplemented, false);
  for (const [branch, count] of [['R', 33], ['U', 29]]) {
    const activities = lab.activities_by_branch[branch];
    assert.equal(activities.length, 16);
    assert.equal(activities.flatMap(activity => activity.tasks).filter(task => task.type === 'computation').length, count);
    for (const [index, activity] of activities.entries()) {
      const original = source.tasks[index];
      assert.equal(activity.stage, original.stage);
      const reasoning = activity.tasks.find(task => task.type === 'self-review');
      assert.equal(reasoning.prompt, original.prompt);
      assert.equal(reasoning.explanation, original.public_self_review.explanation);
      assert.deepEqual(reasoning.rubric.map(item => item.description), original.public_self_review.rubric);
      for (const numeric of original.public_self_review.numeric_expectations) {
        const projected = activity.tasks.find(task => task.id.endsWith('-' + numeric.key));
        if (!numeric.applicable_branches.includes(branch)) { assert.equal(projected, undefined); continue; }
        assert.equal(projected.solution, Number(numeric.expected));
        assert.equal(projected.tolerance, 0.005);
        assert.equal(projected.unit, numeric.unit);
        assert.ok(projected.explanation.includes(numeric.derivation));
        numeric.source_field_paths.forEach(path => assert.ok(projected.explanation.includes(path)));
        assert.equal(projected.sources.length, 4);
      }
    }
  }
  const rIds = new Set(lab.activities_by_branch.R.flatMap(activity => activity.tasks.map(task => task.id)));
  assert.ok(lab.activities_by_branch.U.flatMap(activity => activity.tasks).every(task => !rIds.has(task.id)));
  assert.deepEqual(lab.exhibits.find(exhibit => exhibit.id === 'E06').branches, ['R']);
  assert.equal(lab.source_map_public_example.length, 8);
  assert.equal(lab.changed_fact_log_public_example.length, 3);
});

test('missing or conflicting source, branch, inventory and delivery claims fail before output', () => {
  for (const change of [
    value => { value.metadata.credit_bearing = true; },
    value => { value.metadata.public_formative = false; },
    value => { value.metadata.official_final_exam = true; },
    value => { value.metadata.duration_validated = true; },
    value => { value.metadata.oil_delivery_implemented = true; },
    value => { value.tasks.pop(); },
    value => { delete value.exhibits[1]; },
    value => { value.counts.numeric_expectations = 35; },
    value => { value.stages[0].task_ids.pop(); },
    value => { value.sources[0].url = 'http://example.com'; },
    value => { value.exhibits[5].applicable_branches.push('U'); },
    value => { value.tasks[9].public_self_review.numeric_expectations[0].applicable_branches = ['U']; },
    value => { value.tasks[0].source_exhibit_ids = ['E10']; },
    value => { value.tasks[10].source_exhibit_ids_by_branch.U.push('E06'); },
    value => { value.tasks[0].public_self_review.numeric_expectations[0].source_field_paths = ['E01.fields.absent']; },
    value => { value.tasks[0].public_self_review.numeric_expectations[0].expected = ''; },
    value => { value.tasks[0].public_self_review.rubric = []; },
  ]) {
    const bundle = publicPeEvidenceLabSource(); change(bundle);
    let writes = 0;
    assert.throws(() => buildPeFoundationsPractice({ root, labBundle: bundle, write: () => writes++ }));
    assert.equal(writes, 0);
  }
});

test('supplemental revisions preserve unchanged core progress and keep eight original lessons', () => {
  const original = build();
  const { supplemental_labs: labs, ...core } = original.payload;
  assert.equal(original.sample.progress_revision, hash(JSON.stringify(core, null, 2) + '\n').slice(0, 16));
  assert.equal(original.payload.lessons.length, 8);
  assert.equal(original.payload.questions.length, 100);
  assert.equal(original.payload.activities.length, 33);
  assert.equal(original.payload.activities.flatMap(item => item.tasks).length, 151);
  assert.equal(labs.length, 1);
  const bundle = publicPeEvidenceLabSource(); bundle.title += ' updated';
  const changedLab = build({ labBundle: bundle });
  assert.equal(changedLab.sample.progress_revision, original.sample.progress_revision);
  assert.notEqual(changedLab.sample.revision, original.sample.revision);
  assert.notEqual(changedLab.payload.supplemental_labs[0].revision, labs[0].revision);
  const quizzes = structuredClone(TOPIC_QUIZZES); quizzes['module-01'][0].prompt += ' Updated.';
  assert.notEqual(build({ quizzes }).sample.progress_revision, original.sample.progress_revision);
  assert.equal(original.files.get(labs[0].content_url), fs.readFileSync(new URL('../nmls/pe-foundations/practice/pe03-evidence-lab.md', import.meta.url), 'utf8'));
});
