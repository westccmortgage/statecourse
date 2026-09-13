import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import blueprint from '../nmls/curriculum/annual-curriculum-blueprint.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');
const lesson = fs.readFileSync(path.join(root, 'nmls/curriculum/federal-2026-F01-application-clocks.md'), 'utf8');

test('curriculum remains draft; real learner and approval evidence cannot be inferred from authoring', () => {
  assert.equal(blueprint.sales_authorized, false);
  assert.equal(blueprint.course_approval_id, null);
  assert.equal(blueprint.duration_validated, false);
  assert.equal(blueprint.learner_validation_performed, false);
  assert.equal(blueprint.state_modules.length, 24);
  assert.equal(blueprint.state_modules.reduce((sum, m) => sum + m.state_specific_hours, 0), 29);
  assert.ok(blueprint.state_modules.every((m) => m.approved === false && m.sales_authorized === false));
});

test('all original formative questions have the reviewed keys and cannot stand in for the final', () => {
  assert.equal(blueprint.authored_lesson.approved_final_exam, false);
  const questions = [...lesson.matchAll(/^### (KC\d{2}) - /gm)].map((match) => match[1]);
  assert.equal(questions.length, 12);
  assert.deepEqual(questions, Object.keys(blueprint.authored_lesson.correct_answer_map));
  for (const id of questions) assert.ok(lesson.includes(`| ${id} | ${blueprint.authored_lesson.correct_answer_map[id]} |`));
  assert.match(lesson, /during the preceding calendar year/);
  assert.match(lesson, /preapprovals constituting applications/);
  assert.match(lesson, /does not extend the separate/);
});

test('private NMLS course source is not copied into the generated public surface', () => {
  for (const folder of ['public', 'dist']) {
    const base = path.join(root, folder);
    if (!fs.existsSync(base)) continue;
    const filenames = fs.readdirSync(base, { recursive: true }).filter((name) =>
      /(?:federal-2026-F0[0-3]|ethics-2026-E0[12]|nontraditional-2026-N0[12]|general-2026-G0[123])/.test(name) || name.includes('annual-curriculum-blueprint'));
    assert.deepEqual(filenames, []);
  }
});

test('seven national companion manuscripts have 104 uniquely keyed formative items, without approval claims', () => {
  assert.deepEqual(blueprint.other_internal_blocks.map((entry) => entry.id), ['E01', 'E02', 'N01', 'N02', 'G01', 'G02', 'G03']);
  let count = 0;
  for (const entry of blueprint.other_internal_blocks) {
    assert.equal(entry.authored, true);
    const source = fs.readFileSync(path.join(root, 'nmls/curriculum', entry.file), 'utf8');
    assert.equal(createHash('sha256').update(source).digest('hex'), entry.reviewed_source_sha256, `${entry.id}: changed manuscript requires a new recorded review snapshot`);
    const ids = [...source.matchAll(/^(?:### |\*\*)([ENG]0[123]-(?:KC|Q)\d{2})(?: |\.)/gm)].map((m) => m[1]);
    const keys = [...source.matchAll(/^\| ([ENG]0[123]-(?:KC|Q)\d{2}) \| ([ABCD]) \|/gm)];
    assert.equal(ids.length, entry.formative_question_count, entry.id);
    assert.equal(new Set(ids).size, ids.length, entry.id);
    assert.deepEqual(keys.map((m) => m[1]), ids, entry.id);
    assert.ok(entry.independent_agent_review && entry.independent_agent_review !== 'approved');
    for (const field of ['human_sme_approval', 'validated_duration', 'approved_final_exam']) assert.equal(entry[field], false);
    count += ids.length;
  }
  assert.equal(count, 104);
});

test('remaining 2026 federal topics have authored manuscripts and independently reviewed private keys', () => {
  const background = blueprint.annual_federal_blueprints.find((b) => b.ce_year === 2026).background;
  assert.equal(background.authored, true); assert.equal(background.proposed_minutes, 3);
  assert.equal(background.validated_duration, false); assert.equal(background.human_sme_approval, false);
  assert.equal(background.formative_question_count, 0);
  const introduction = fs.readFileSync(path.join(root, 'nmls/curriculum', background.file), 'utf8');
  assert.equal(createHash('sha256').update(introduction).digest('hex'), background.reviewed_source_sha256);
  assert.match(introduction, /fourth quarter of 2023 and first quarter of 2024/);
  assert.match(introduction, /not an approved course/);
  assert.ok(blueprint.annual_federal_blueprints.find((b) => b.ce_year === 2026).topics.every((t) => t.authored));
  assert.ok(blueprint.annual_federal_blueprints.find((b) => b.ce_year === 2027).topics.every((t) => !t.authored));
  const keysByBlock = { F02: 'BDACBDACBDACBDAC', F03: 'CADBCADBCADBACB' };
  let total = 12;
  for (const entry of blueprint.additional_authored_lessons) {
    const text = fs.readFileSync(path.join(root, 'nmls/curriculum', entry.file), 'utf8');
    const ids = [...text.matchAll(/^### (F0[23]-(?:KC|Q)\d{2}) /gm)].map((match) => match[1]);
    assert.equal(ids.length, entry.formative_question_count); assert.equal(new Set(ids).size, ids.length);
    ids.forEach((id, i) => assert.ok(text.includes(`| ${id} | ${keysByBlock[entry.block][i]} |`), id));
    assert.equal(entry.human_sme_approval, false); assert.equal(entry.validated_duration, false); assert.equal(entry.approved_final_exam, false);
    total += ids.length;
  }
  assert.equal(total, 43);
  const t10 = blueprint.annual_federal_blueprints[0].topics.find((t) => t.topic_id === 10);
  assert.match(t10.label, /payee/);
});
