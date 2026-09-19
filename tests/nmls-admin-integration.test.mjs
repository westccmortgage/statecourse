import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { NMLS_TRAINING_COURSE as identity } from '../config/nmls-course-identity.mjs';
import { nmlsCurriculumSummary, nmlsTrainingProgress, buildNmlsReadiness } from '../netlify/functions/_lib/nmls-readiness.mjs';
import { courseStructure, assessSnapshot } from '../netlify/functions/_lib/console-operations.mjs';
import { validateDraft, baseFingerprint } from '../netlify/functions/_lib/console-content.mjs';
import { buildCourseInventory } from '../netlify/functions/_lib/course-inventory.mjs';
import { assessCourseRow } from '../netlify/functions/_lib/catalog-truth.mjs';
import { snapshot } from '../netlify/functions/_lib/console-operations.mjs';
import { createStore, withConsoleMock } from './fixtures/admin-console/harness.mjs';

const source = rows => ({ available: true, truncated: false, rows });
const catalog = JSON.parse(fs.readFileSync(new URL('../public/statecourse/data/course-catalog.json', import.meta.url)));
const curriculum = nmlsCurriculumSummary();
const course = { id: identity.id, state: 'US', name: identity.title, product_type: identity.productType,
  current_version: identity.version, approval_status: 'submission_draft', enrollment_enabled: false, trainingReadiness: { ready: true } };
const decision = { offering_id: identity.id, offering_kind: 'course', state: 'US', discipline: 'mortgage',
  training_access_enabled: true, approval_status: 'none', approval_currently_effective: false, payment_mode: 'disabled', live_charging_permitted: false };
function fixture() {
  const datasets = {
    courses: source([structuredClone(course)]), governance: source([structuredClone(decision)]),
    enrollments: source([]), videos: source([]), tasks: source([]),
    nmlsDefinitions: source([{ course_id: identity.id, course_version: identity.version, content_digest: curriculum.contentDigest, definition_digest: curriculum.definitionDigest }]),
    nmlsProgress: source([]),
  };
  return { checkedAt: '2026-09-13T12:00:00Z', datasets, inventory: buildCourseInventory(catalog, datasets.courses, datasets.governance) };
}

test('one exact national identity links the public course to actual comprehensive v3 private sources', () => {
  const mortgage = catalog.categories.find(category => category.category_id === 'mortgage');
  const courses = mortgage.programs.flatMap(program => program.courses);
  assert.equal(courses.length, 1);
  assert.equal(courses[0].course_id, identity.id);
  assert.equal(courses[0].course_version, identity.version);
  assert.equal(courses[0].student_route, identity.studentRoute);
  assert.equal(courses[0].approval_number, null);
  assert.equal(courses[0].provider_approval_number, null);
  assert.equal(courses[0].approved_hours, null);
  assert.equal(courses[0].enrollment_enabled, false);
  assert.equal(courses[0].price, null);
  assert.equal(curriculum.contentDigest, identity.contentDigest);
});

test('admin counts actual loaded material without exposing questions or claiming timing or human review', () => {
  assert.equal(curriculum.structurallyComplete, true);
  assert.deepEqual([curriculum.moduleCount, curriculum.lessonCount, curriculum.formativeQuestionCount, curriculum.provisionalMinutes, curriculum.finalBankCount, curriculum.finalQuestionCount], [8, 45, 123, 400, 50, 25]);
  assert.equal(curriculum.representativeTimingVerified, false);
  assert.equal(curriculum.humanAssessmentReviewed, false);
  assert.equal(curriculum.creditIssuanceAllowed, false);
  assert.equal(curriculum.sourceFiles.length, 9);
  assert.ok(curriculum.sourceFiles.every(record => /^[a-f0-9]{64}$/.test(record.sha256)));
  assert.doesNotMatch(JSON.stringify(curriculum), /"(?:stem|correctChoice|answers|rationale|selection|items|content|bank)":/);
});

test('missing or altered manuscript loader yields explicit unverified rather than complete curriculum', () => {
  for (const courseFor of [() => { throw new Error('private error'); }, () => ({ id: identity.contentKey, digest: 'a'.repeat(64) })]) {
    const summary = nmlsCurriculumSummary({ courseFor });
    assert.equal(summary.available, false);
    assert.equal(summary.structurallyComplete, false);
    assert.equal(summary.reason, 'nmls_curriculum_integrity_unverified');
    assert.doesNotMatch(JSON.stringify(summary), /private error/);
  }
});

test('database plus public identity and real curriculum clear missing-record only, never approval or live payments', () => {
  const readiness = buildNmlsReadiness(fixture());
  assert.equal(readiness.courseRecordConnected, true);
  assert.equal(readiness.definitionVerified, true);
  assert.equal(readiness.freeTrainingAvailable, true);
  assert.equal(readiness.providerApprovalVerified, false);
  assert.equal(readiness.courseApprovalEffective, false);
  assert.equal(readiness.livePaymentsActivated, false);
  assert.equal(readiness.creditIssuanceAllowed, false);
  assert.equal(readiness.reportingEnabled, false);
  assert.ok(!readiness.findings.some(finding => finding.code === 'nmls_course_record_missing'));
  assert.ok(readiness.findings.some(finding => finding.code === 'nmls_provider_approval_unverified'));
  assert.ok(readiness.findings.some(finding => finding.code === 'nmls_human_review_pending'));
});

test('a public catalog shell or incomplete source does not clear the missing-course blocker', () => {
  const missing = fixture(); missing.datasets.courses.rows = [];
  for (const [data, sources] of [[missing, curriculum], [fixture(), { ...curriculum, structurallyComplete: false }]]) {
    const readiness = buildNmlsReadiness(data, sources);
    assert.equal(readiness.courseRecordConnected, false);
    assert.equal(readiness.freeTrainingAvailable, false);
    assert.ok(readiness.findings.some(finding => finding.code === 'nmls_course_record_missing'));
  }
});

test('a current-version mismatch cannot be hidden by an otherwise matching course title', () => {
  const data = fixture(); data.datasets.courses.rows[0].current_version = '2026.2';
  assert.equal(buildNmlsReadiness(data).courseRecordConnected, false);
});

test('unreadable, mismatched, ambiguous or missing runtime definitions cannot open training', () => {
  for (const mutation of [data => { data.datasets.nmlsDefinitions.available = false; }, data => { data.datasets.nmlsDefinitions.truncated = true; }, data => { data.datasets.nmlsDefinitions.rows[0].definition_digest = 'b'.repeat(64); }, data => { data.datasets.nmlsDefinitions.rows.push({ ...data.datasets.nmlsDefinitions.rows[0] }); }, data => { data.datasets.nmlsDefinitions.rows = []; }]) {
    const data = fixture(); mutation(data); const readiness = buildNmlsReadiness(data);
    assert.equal(readiness.definitionVerified, false);
    assert.equal(readiness.freeTrainingAvailable, false);
  }
});

test('wrong-state, wrong-discipline and duplicate governance decisions never enable national training', () => {
  for (const mutation of [rows => { rows[0].state = 'CA'; }, rows => { rows[0].discipline = 'real_estate'; }, rows => { rows.push({ ...rows[0] }); }, rows => { rows[0].training_access_enabled = false; }]) {
    const data = fixture(); mutation(data.datasets.governance.rows);
    assert.equal(buildNmlsReadiness(data).freeTrainingAvailable, false);
  }
});

test('a generic offering approval cannot manufacture provider approval or activate live payments', () => {
  const data = fixture(); Object.assign(data.datasets.governance.rows[0], { approval_status: 'approved', approval_currently_effective: true, live_charging_permitted: true, payment_mode: 'live' });
  const readiness = buildNmlsReadiness(data);
  assert.equal(readiness.courseApprovalEffective, true);
  assert.equal(readiness.providerApprovalVerified, false);
  assert.equal(readiness.livePaymentPermissionRecorded, true);
  assert.equal(readiness.livePaymentsActivated, false);
});

test('an unreadable progress source remains unknown rather than zero enrolled students', () => {
  const data = fixture(); data.datasets.nmlsProgress.available = false; data.datasets.enrollments.truncated = true;
  const readiness = buildNmlsReadiness(data);
  assert.equal(readiness.progress, null);
  assert.equal(readiness.enrollmentCount, null);
});

test('training progress projection excludes responses, selections, runtime and learner identity', () => {
  const row = { enrollment_id: 'enrollment', student_id: 'private_student', course_id: identity.id, course_version: identity.version, revision: 3,
    runtime: { schema: 'nmls-free-training-runtime-v1', purpose: 'free_training', courseId: identity.id, courseVersion: identity.version, contentDigest: identity.contentDigest,
      phase: 'passed', source: { completedUnitIds: ['F01-U01'], passedModuleIds: ['F01'] }, finals: [{ selection: { question: 'secret' }, answers: { answer: 'secret' }, result: 'secret' }] } };
  const result = nmlsTrainingProgress(row);
  assert.equal(result.phase, 'passed'); assert.equal(result.trainingCompleted, true); assert.equal(result.nmlsCreditEarned, false);
  assert.doesNotMatch(JSON.stringify(result), /private_student|secret|"runtime"|"answers"|"selection"/);
  row.runtime.courseVersion = 'another';
  assert.equal(nmlsTrainingProgress(row).phase, 'unverified');
});

test('an unstarted training enrollment is distinguished from damaged progress', () => {
  const row = { enrollment_id: 'enrollment', course_id: identity.id, course_version: identity.version, revision: 0, runtime: null };
  assert.equal(nmlsTrainingProgress(row).phase, 'not_started');
  assert.equal(nmlsTrainingProgress(row).completedUnits, 0);
  row.revision = 1;
  assert.equal(nmlsTrainingProgress(row).phase, 'unverified');
});

test('national registry diagnostics do not add a fictitious US state or recategorize the California DRE elective', () => {
  const data = fixture(); data.datasets.courses.rows.push({ id: 'ca-mortgage-loan-brokering-lending-45', state: 'CA', name: 'DRE mortgage elective', product_type: 'real_estate_prelicense' });
  const inventory = buildCourseInventory(catalog, data.datasets.courses, data.datasets.governance);
  assert.equal(inventory.summary.catalogStates, 14);
  assert.equal(inventory.summary.databaseStates, 1);
  assert.equal(inventory.rows.find(row => row.id === identity.id).discipline, 'mortgage');
  assert.equal(inventory.rows.find(row => row.id === 'ca-mortgage-loan-brokering-lending-45').discipline, 'real_estate');
});

test('NMLS cannot be rewritten by the California/Texas generic text-overlay editor', () => {
  const structure = courseStructure(identity.id);
  assert.equal(structure.readOnly, true); assert.equal(structure.units.length, 8);
  assert.equal(structure.units.flatMap(unit => unit.blocks.flatMap(block => block.screens)).length, 45);
  assert.throws(() => validateDraft(identity.id, { baseFingerprint: baseFingerprint(identity.id), overrides: [] }), /versioned_training_source_is_read_only/);
});

test('weekly check replaces missing source with remaining real blockers, not a false all-ready result', () => {
  const data = fixture(); data.nmls = buildNmlsReadiness(data);
  const report = assessSnapshot(data, { stripeTestConnected: true, googleConnected: true });
  assert.ok(!report.findings.some(finding => ['nmls_course_record_missing', 'renderer_missing'].includes(finding.code)));
  assert.ok(report.findings.some(finding => finding.code === 'nmls_provider_approval_unverified'));
  assert.ok(report.findings.some(finding => finding.code === 'delivery_checks_pending'));
});

test('documented exact free-only offering does not produce a false missing-checkout finding', () => {
  const publicEntry = { courseId: identity.id, categoryId: 'mortgage', state: 'US', operatingMode: 'free_training', enrollmentEnabled: false, price: null };
  const input = { publicEntry, payment: null, dbCourse: course, dbVersions: [], regulatoryFile: null };
  assert.deepEqual(assessCourseRow(input), []);
  input.publicEntry = { ...publicEntry, courseId: 'unrelated' };
  assert.ok(assessCourseRow(input).some(finding => finding.code === 'public_without_checkout'));
});

test('authenticated admin snapshot projects database runtime without leaking its private assessment material', async () => {
  await withConsoleMock(createStore(), async () => {
    const previous = globalThis.fetch;
    const paths = [];
    globalThis.fetch = async (input, init = {}) => {
      const url = new URL(input), name = url.pathname.replace('/rest/v1/', ''); paths.push(name);
      let rows = [];
      if (name === 'courses') rows = [course];
      else if (name === 'offering_public_status') rows = [decision];
      else if (name === 'nmls_training_definitions') rows = fixture().datasets.nmlsDefinitions.rows;
      else if (name === 'nmls_training_attempts') rows = [{ enrollment_id: 'test-enrollment', course_id: identity.id, course_version: identity.version, revision: 1,
        runtime: { schema: 'nmls-free-training-runtime-v1', purpose: 'free_training', courseId: identity.id, courseVersion: identity.version, contentDigest: identity.contentDigest, phase: 'source', source: { completedUnitIds: [], passedModuleIds: [] }, finals: [{ answers: 'NEVER_IN_OVERVIEW', selection: 'NEVER_IN_OVERVIEW' }] } }];
      else if (name.startsWith('rpc/')) return new Response(JSON.stringify({ error: 'not_installed' }), { status: 404 });
      assert.equal(init.method || 'GET', 'GET');
      return new Response(JSON.stringify(rows), { headers: { 'content-type': 'application/json' } });
    };
    try {
      const result = await snapshot({ scopeStates: ['US'], matching: [{ actor_role: 'support', scope_state: 'US' }] });
      assert.equal(result.datasets.nmlsProgress.rows[0].phase, 'unverified');
      assert.equal(result.datasets.nmlsProgress.rows[0].completedUnits, null);
      assert.equal(result.datasets.nmlsActivity.rows.length, 0);
      assert.doesNotMatch(JSON.stringify(result), /NEVER_IN_OVERVIEW|"runtime"|"answers"|"selection"/);
      assert.ok(paths.includes('nmls_training_attempts'));
      assert.equal(result.datasets.payments, undefined);
      paths.length = 0;
      const outside = await snapshot({ scopeStates: ['CA'], matching: [{ actor_role: 'support', scope_state: 'CA' }] });
      assert.equal(outside.nmls, undefined);
      assert.ok(!paths.includes('nmls_training_attempts'));
    } finally { globalThis.fetch = previous; }
  });
});

test('existing admin renderer consumes current readiness and escapes hostile record text', () => {
  const elements = new Map();
  const document = { addEventListener() {}, querySelector(selector) {
    if (!elements.has(selector)) elements.set(selector, { addEventListener() {}, innerHTML: '' });
    return elements.get(selector);
  } };
  const script = fs.readFileSync(new URL('../public/statecourse/admin/console/workspace.js', import.meta.url), 'utf8');
  const context = vm.createContext({ document, console, URLSearchParams });
  vm.runInContext(script.replace(/^import[^\n]+\n/, '') + '\nglobalThis.renderTest = fixture => { data = fixture; renderNmls(); };', context);
  const data = fixture(); data.nmls = buildNmlsReadiness(data);
  data.nmls.identity = { ...data.nmls.identity, title: '<img src=x onerror=alert(1)>' };
  context.renderTest(data);
  const html = elements.get('#nmlsBody').innerHTML;
  assert.match(html, /Authored modules[\s\S]*?<strong>8<\/strong>/);
  assert.match(html, /Lesson units[\s\S]*?<strong>45<\/strong>/);
  assert.match(html, /Formative questions[\s\S]*?<strong>123<\/strong>/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img|workstream must be recovered|no published NMLS course record/);
  assert.match(html, /Not independently verified/);
  assert.match(html,/19 of 19 verified against retained hashes/);
  assert.match(html,/19 bodies reviewed; record matches this acquisition/);
  assert.match(html,/2 PDF originals remain missing/);
  assert.match(html,/Independent human review[\s\S]*?No human signoff in the source manifest; see current version evidence/);
  assert.match(html,/AI desk review is not human review/);
  data.nmls.officialEvidence.sources[0].url='javascript:alert(1)';
  data.nmls.officialEvidence.sources[0].title='<img src=x onerror=alert(1)>';
  context.renderTest(data);
  assert.doesNotMatch(elements.get('#nmlsBody').innerHTML,/<img|href="javascript:/);
  data.nmls.officialEvidence={available:false};
  context.renderTest(data);
  assert.match(elements.get('#nmlsBody').innerHTML,/Official-source evidence unavailable/);
  assert.doesNotMatch(elements.get('#nmlsBody').innerHTML,/19 of 19 verified/);
  delete data.nmls;
  context.renderTest(data);
  assert.match(elements.get('#nmlsBody').innerHTML, /readiness unavailable/);
});

 test('NMLS recent activity never falls back to California/Texas access records',()=>{
  const elements=new Map();const document={addEventListener(){},querySelector(selector){if(!elements.has(selector))elements.set(selector,{addEventListener(){},innerHTML:'',value:''});return elements.get(selector);}};
  const script=fs.readFileSync(new URL('../public/statecourse/admin/console/workspace.js',import.meta.url),'utf8');
  const context=vm.createContext({document,console,URLSearchParams});
  vm.runInContext(script.replace(/^import[^\n]+\n/,'')+'\nglobalThis.renderTest=fixture=>{data=fixture;renderStudents();};',context);
  context.renderTest({datasets:{enrollments:source([{id:'e',course_id:identity.id,student_id:'p',last_course_accessed_at:'2001-01-01'}]),people:source([]),courses:source([course]),recentAccess:source([{enrollment_id:'e',occurred_at:'2002-01-01'}]),nmlsActivity:source([])}});
  const html=elements.get('#studentsBody').innerHTML;assert.match(html,/No recent record/);assert.doesNotMatch(html,/2001|2002/);
 });
