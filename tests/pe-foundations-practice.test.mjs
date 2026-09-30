import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { buildPeFoundationsPractice } from '../scripts/lib/pe-foundations-practice.mjs';
import { PE_FOUNDATIONS, TOPIC_QUIZZES, SCENARIOS } from '../config/pe-foundations-practice.mjs';
import { normalizePublicPeBank } from '../config/pe-application-practice.mjs';
import { gradePractice, splitSections } from '../public/statecourse/practice-core.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function build(options = {}) {
  const files = new Map();
  const sample = buildPeFoundationsPractice({ root, write: (file, text) => files.set(file, text), ...options });
  return { sample, files, payload: JSON.parse(files.get(sample.practice_url)) };
}

test('publishes only six substantive, source-linked student modules and formative practice', () => {
  const { sample, files, payload } = build();
  assert.equal(sample.course_id, 'national-safe-pe-foundations');
  assert.equal(sample.record_url, 'mortgage/pre-license/');
  assert.equal(sample.state_code, 'US');
  assert.equal(sample.lesson_count, 6);
  assert.equal(sample.creditEligible, false);
  assert.equal(sample.completeCourse, false);
  assert.equal(payload.providerApproval, null);
  assert.equal(payload.courseApproval, null);
  assert.equal(payload.operating_mode, 'free_practice');
  assert.match(payload.availability_notice, /Six foundation modules are available/);
  assert.match(payload.access, /before, during and after paid enrollment/);
  assert.equal(files.size, 7);
  for (const [name, text] of files) {
    assert.ok(name.startsWith('free-practice/'));
    assert.doesNotMatch(name, /instructor|answer-key|final|assessment/);
    assert.doesNotMatch(text, /N26-FIN-|##\s*Answer key|"correctChoice"|passingScore|regulatedSeconds/);
  }
  for (const lesson of payload.lessons) {
    const markdown = files.get(lesson.content_url);
    assert.ok(markdown.split(/\s+/).length > 2200, 'Full substantive module, not a placeholder');
    assert.match(markdown, /https:\/\/(www\.)?consumerfinance\.gov/);
    assert.match(markdown, /not NMLS approved/i);
    assert.doesNotMatch(markdown.split(/^##\s/m)[0], /one of two foundation modules|Only PE01 and PE02 are included here/i);
    assert.equal(createHash('sha256').update(markdown).digest('hex'), lesson.sha256);
    assert.ok(splitSections(markdown).every(section => section.body.trim()));
    assert.ok(payload.questions.filter(q => q.lesson_id === lesson.id).length >= 6);
    assert.ok(payload.activities.some(a => a.lesson_id === lesson.id));
  }
  assert.ok(payload.activities.length >= 8);
  assert.deepEqual([...new Set(payload.activities.flatMap(a => a.tasks.map(t => t.type)))].sort(), ['computation', 'selection', 'self-review']);
});

test('every public quiz choice can be answered; feedback and source links are complete', () => {
  const { payload } = build();
  for (const question of payload.questions) {
    assert.equal(question.choices.length, 4);
    assert.ok(question.explanation.trim().length > 30);
    assert.ok(question.sources.every(s => new URL(s.url).protocol === 'https:' && s.reference));
    for (let index = 0; index < 4; index++) assert.equal(gradePractice(question, index).correct, index === question.solution);
    for (const bad of [null, undefined, '', '0', -1, 4, NaN]) assert.equal(gradePractice(question, bad), null);
  }
  for (const activity of payload.activities) for (const task of activity.tasks) {
    if (task.type === 'computation') assert.ok(Number.isFinite(task.solution) && task.tolerance >= 0);
    if (task.type === 'self-review') {
      assert.ok(task.rubric.length > 0);
      assert.match(task.review_notice, /not an instructor grade/);
      assert.equal(task.solution, undefined);
    }
  }
});

test('malformed quizzes fail before any public file is written', () => {
  for (const alter of [
    q => { q['module-01'][0].correctChoice = 4; },
    q => { q['module-01'][0].choices[1] = q['module-01'][0].choices[0]; },
    q => { q['module-01'][0].sources[0].url = 'javascript:alert(1)'; },
    q => { q['module-01'][0].rationale = ''; },
    q => { q['module-01'][1].id = q['module-01'][0].id; },
    q => { q['module-01'][0].module = 'module-03'; },
    q => { delete q['module-02']; },
    q => { q['module-01'][0].id = 'N26-FIN-F99'; },
    q => { q['module-03'][0].choiceFeedback.pop(); },
    q => { delete q['module-03'][0].choiceFeedback[1]; },
    q => { delete q['module-01'][0].choices[1]; },
    q => { delete q['module-01'][0].sources[0]; },
    q => { delete q['module-03'][1]; },
    q => { q['module-05'].pop(); },
    q => { delete q['module-05'][0].choiceFeedback; },
    q => { q['module-05'][0].sources = []; q['module-05'][0].sourceNote = 'Fictional'; },
    q => { q['module-05'][0].id = 'PE03-P02'; },
    q => { q['module-04'][0].choiceFeedback[1] = ''; },
    q => { q['module-03'][1].sourceNote = ''; },
  ]) {
    const quizzes = structuredClone(TOPIC_QUIZZES); alter(quizzes);
    let writes = 0;
    assert.throws(() => buildPeFoundationsPractice({ root, quizzes, write: () => writes++ }));
    assert.equal(writes, 0);
  }
});

test('protected manuscript content and missing disclosures fail closed', t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pe-practice-test-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const directory = path.join(temporary, PE_FOUNDATIONS.curriculumDir);
  fs.mkdirSync(directory, { recursive: true });
  for (const file of ['module-01.md', 'module-02.md', 'module-03.md', 'module-04.md', 'module-05.md', 'module-06.md']) fs.copyFileSync(path.join(root, PE_FOUNDATIONS.curriculumDir, file), path.join(directory, file));
  const file = path.join(directory, 'module-01.md');
  const original = fs.readFileSync(file, 'utf8');
  for (const changed of [original + '\n## Answer key\nPrivate', original.replace(/not NMLS approved/ig, 'status unavailable')]) {
    fs.writeFileSync(file, changed);
    let writes = 0;
    assert.throws(() => buildPeFoundationsPractice({ root: temporary, write: () => writes++ }));
    assert.equal(writes, 0);
  }
});

test('changed practice content changes the browser storage and cache revision', () => {
  const before = build().sample.revision;
  const quizzes = structuredClone(TOPIC_QUIZZES);
  quizzes['module-01'][0].rationale += ' Additional explanation.';
  assert.notEqual(build({ quizzes }).sample.revision, before);
  const scenarios = structuredClone(SCENARIOS);
  scenarios[0].context += ' A changed fact.';
  assert.notEqual(build({ scenarios }).sample.revision, before);
});

test('generator and browser routes keep public practice distinct from CE and regulated enrollment', () => {
  const generator = read('scripts/generate-national-platform.mjs');
  assert.match(generator, /mortgage\/pre-license\/index\.html/);
  assert.match(generator, /Six modules available\. Full course under construction/);
  assert.match(generator, /not a complete 20-hour course/);
  assert.match(generator, /No account, tuition or subscription is required/);
  assert.match(generator, /genuine instructor and peer interaction/);
  assert.match(generator, /class="cta-button" href="\$\{pePracticeUrl\}">Start free foundations/);
  assert.match(read('public/statecourse/national.css'), /\.cta-button\s*\{[^}]*display:\s*inline-block/);
  assert.match(generator, /Free Practice", "free-practice\//);
  const builder = read('scripts/generate-free-practice.mjs');
  assert.match(builder, /samples\.push\(buildPeFoundationsPractice/);
  const client = read('public/statecourse/free-practice.js');
  assert.match(client, /sample\.record_url\?\?/);
  assert.match(client, /course\.availability_notice/);
  assert.doesNotMatch(client, /api\/enroll|create-checkout|regulatedSeconds|nmls-training\/training-client/);
});


test('shared header uses the existing complete menu at tablet and phone breakpoints', () => {
  const css = read('public/statecourse/national.css');
  const breakpoint = Number(css.match(/@media \(max-width: (\d+)px\) \{\s*\.desktop-nav \{ display: none; \}/)?.[1]);
  // This is a CSS/markup contract test, not a rendered width assertion.
  for (const width of [320, 375, 480, 760, 1080, 1100, 1188, 1280, 1440]) {
    assert.ok(width <= breakpoint, `The complete menu must be enabled at ${width}px`);
  }
  assert.equal(breakpoint, 1440);
  assert.match(css, /\.header-shell \{[^}]*max-width: 1480px/);
  assert.match(css, /@media \(max-width: 1080px\) \{\s*\.hero-shell/);
  assert.match(css, /@media \(max-width: 480px\) \{[\s\S]*\.header-shell:has\(> \.mobile-menu\)[\s\S]*grid-template-columns: 1fr auto/);
  assert.match(css, /\.national-header \.header-shell:has\(> \.mobile-menu\) \.header-actions \{ display: none; \}/);
  for (const file of ['public/statecourse/index.html', 'scripts/generate-national-platform.mjs']) {
    const menu = read(file).match(/<details class="mobile-menu">([\s\S]*?)<\/details>/)?.[1];
    assert.ok(menu, file);
    assert.match(menu, /<summary[^>]*aria-label="Open navigation"/);
    assert.match(menu, />Create Account<\/a>/);
    assert.match(menu, />My Courses<\/a>/);
    assert.ok(menu.includes('Free Practice') || menu.includes('${links}'));
  }
});


test('all 96 reviewed PE03/PE04 option explanations retain source IDs and original answers', () => {
  const { payload } = build();
  assert.equal(payload.questions.length, 76);
  for (const moduleId of ['PE03', 'PE04']) {
    const bank = JSON.parse(read(`config/pe-public-practice/${moduleId}.json`));
    for (const original of bank.items) {
      const question = payload.questions.find(q => q.id.endsWith(`:${original.id}`));
      assert.ok(question);
      assert.equal(question.prompt, original.prompt);
      assert.deepEqual(question.choices, original.choices.map(c => c.text));
      assert.equal(question.solution, original.choices.findIndex(c => c.id === original.correct_choice_id));
      original.choices.forEach((choice, index) => assert.equal(gradePractice(question, index).explanation, choice.feedback));
      assert.equal(question.sources.length, original.source_ids.length);
      if (!original.source_ids.length) assert.match(question.source_note, /Original fictional/);
    }
  }
  const legacy = payload.questions.find(q => !q.choice_feedback);
  assert.equal(gradePractice(legacy, 0).explanation, legacy.explanation);
});

test('public bank boundaries and source resolution reject protected or incomplete inputs', () => {
  const original = JSON.parse(read('config/pe-public-practice/PE03.json'));
  const sources = JSON.parse(read('config/pe-public-practice/sources.json')).PE03;
  for (const change of [
    bank => { bank.official_final_exam = true; },
    bank => { bank.public_formative = false; },
    bank => { bank.credit_bearing = true; },
    bank => { bank.items[0].credit_bearing = true; },
    bank => { bank.items[0].choices[0].feedback = ''; },
    bank => { bank.items[0].correct_choice_id = 'Z'; },
    bank => { bank.items[0].source_ids = ['MISSING']; },
    bank => { bank.items[1].id = bank.items[0].id; },
    bank => { delete bank.items[1]; },
    bank => { delete bank.items[0].source_ids[1]; },
    bank => { bank.items[0].source_ids = []; },
  ]) {
    const bank = structuredClone(original); change(bank);
    assert.throws(() => normalizePublicPeBank(bank, 'PE03', sources));
  }
});


test('PE05/PE06 retain all 144 scoped-law/ethics option explanations and original keys', () => {
  const { payload } = build();
  for (const [moduleId, count] of [['PE05', 20], ['PE06', 16]]) {
    const bank = JSON.parse(read(`config/pe-public-practice/${moduleId}.json`));
    assert.equal(bank.items.length, count);
    assert.equal(payload.questions.filter(q => q.lesson_id === `module-${moduleId.slice(2)}`).length, count);
    for (const original of bank.items) {
      const question = payload.questions.find(q => q.id.endsWith(`:${original.id}`));
      assert.equal(question.prompt, original.prompt);
      assert.deepEqual(question.choices, original.choices.map(c => c.text));
      assert.equal(question.solution, original.choices.findIndex(c => c.id === original.correct_choice_id));
      original.choices.forEach((choice, index) => assert.equal(gradePractice(question, index).explanation, choice.feedback));
      assert.equal(question.sources.length, original.source_ids.length);
    }
    const shortBank = structuredClone(bank); shortBank.items.pop();
    const sources = JSON.parse(read('config/pe-public-practice/law-ethics-sources.json'))[moduleId];
    assert.throws(() => normalizePublicPeBank(shortBank, moduleId, sources));
    const unsourced = structuredClone(bank); unsourced.items[0].source_ids = [];
    assert.throws(() => normalizePublicPeBank(unsourced, moduleId, sources));
  }
});

test('PE activity input rejects sparse or missing citations/tasks before any public write', () => {
  for (const change of [
    values => { delete values[0]; },
    values => { delete values[0].tasks[0]; },
    values => { delete values[0].sources[0]; },
    values => { delete values[0].facts[0]; },
    values => { values[0].sources = { url: 'https://example.com' }; },
    values => { values.find(value => value.module === 'module-05').sources = []; },
    values => { values[0].tasks[0].sources = { url: 'https://example.com' }; },
    values => { values[0].tasks[0].sources = new Array(1); },
    values => { delete values.find(value => value.module === 'module-05').tasks[0].rubric[0]; },
  ]) {
    const scenarios = structuredClone(SCENARIOS); change(scenarios);
    let writes = 0;
    assert.throws(() => buildPeFoundationsPractice({ root, scenarios, write: () => writes++ }));
    assert.equal(writes, 0);
  }
});
