import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import handler, { config } from '../netlify/functions/student-nmls-course.mts';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';
import { NMLS_CREDIT_CHECKPOINTS, NMLS_CREDIT_REVIEW, nmlsCheckpointMode } from '../config/nmls/credit-review.mjs';
import { creditReviewPresentation, isNmlsCreditReviewEnrollment, reviewerOnlyRpc } from '../netlify/functions/_lib/nmls-credit-review.mjs';
import { portalSection, splitPortalEnrollments } from '../netlify/functions/_lib/portal-sections.mjs';
import { checkpointsAfterModules, checkpointsBeforeFinal, checkpointsOnOpen, placeholderCopy } from '../public/statecourse/student/nmls-course/checkpoint-flow.mjs';
import { COURSE_WORDING } from '../public/statecourse/student/nmls-course/nmls-course.mjs';
import { TRAINING_WORDING } from '../public/statecourse/student/nmls-training/nmls-training.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const NMLS = NMLS_CREDIT_REVIEW.courseId;
const FREE_LABEL = /free|non-credit|no nmls|training|practice/i;

test('every enrollment lands in exactly one portal section', () => {
  const rows = [
    { enrollment_id: 'paid', course_id: 'ca-principles', enrollment_origin: 'checkout' },
    { enrollment_id: 'review', course_id: 'ca-principles', enrollment_origin: 'review' },
    { enrollment_id: 'unknown-origin', course_id: 'ca-principles', enrollment_origin: null },
    { enrollment_id: 'free-ca', course_id: 'ca-principles', enrollment_origin: 'training' },
    { enrollment_id: 'free-nmls', course_id: NMLS, enrollment_origin: 'training', review_role: null },
    { enrollment_id: 'closed', course_id: NMLS, enrollment_origin: 'training', review_role: 'student_reviewer' },
    { enrollment_id: 'open', course_id: NMLS, enrollment_origin: 'training', review_role: 'regulator_reviewer' },
  ];
  const { main, freeTraining } = splitPortalEnrollments(rows);
  assert.deepEqual(main.map(r => r.enrollment_id), ['paid', 'review', 'unknown-origin', 'closed', 'open']);
  assert.deepEqual(freeTraining.map(r => r.enrollment_id), ['free-ca', 'free-nmls']);
  assert.equal(main.length + freeTraining.length, rows.length, 'nothing is dropped by the split');
});

test('only a provisioned reviewer role on the NMLS course qualifies for the credit version', () => {
  const base = { course_id: NMLS, enrollment_origin: 'training' };
  assert.equal(isNmlsCreditReviewEnrollment({ ...base, review_role: 'student_reviewer' }), true);
  assert.equal(isNmlsCreditReviewEnrollment({ ...base, review_role: 'regulator_reviewer' }), true);
  for (const refused of [{ ...base, review_role: null }, { ...base }, { ...base, review_role: 'owner' }, { ...base, review_role: 'toString' },
    { ...base, course_id: 'ca-principles', review_role: 'student_reviewer' }, { ...base, enrollment_origin: 'checkout', review_role: 'student_reviewer' }]) {
    assert.equal(isNmlsCreditReviewEnrollment(refused), false);
    assert.equal(portalSection(refused), refused.enrollment_origin === 'training' ? 'free-training' : 'main');
  }
});

test('the course endpoint refuses a non-reviewer at the first database read', async () => {
  for (const reviewRole of [null, undefined, 'owner']) {
    const calls = [], rpc = reviewerOnlyRpc(async name => { calls.push(name); return { reviewRole }; });
    await assert.rejects(() => rpc('nmls_training_context', {}), error => error.message === 'nmls_course_review_access_required' && error.statusCode === 403);
    assert.deepEqual(calls, ['nmls_training_context']);
  }
  const rpc = reviewerOnlyRpc(async () => ({ reviewRole: 'student_reviewer' }));
  assert.deepEqual(await rpc('nmls_training_context', {}), { reviewRole: 'student_reviewer' });
  assert.throws(() => creditReviewPresentation({ accessMode: 'student' }), /nmls_course_review_access_required/);
});

test('checkpoint placeholders are off by default and there is no live mode', () => {
  assert.equal(nmlsCheckpointMode({}), 'off');
  for (const value of ['', 'on', 'true', '1', 'live', 'production', 'PLACEHOLDER', 'biosig']) assert.equal(nmlsCheckpointMode({ NMLS_CREDIT_CHECKPOINTS: value }), 'off');
  assert.equal(nmlsCheckpointMode({ NMLS_CREDIT_CHECKPOINTS: 'placeholder' }), 'placeholder');
  const closed = creditReviewPresentation({ accessMode: 'student_reviewer' }, {});
  assert.equal(closed.creditReview.version, 'closed'); assert.equal(closed.creditReview.checkpoints.mode, 'off'); assert.equal(closed.creditReview.checkpoints.connected, false);
  assert.equal(creditReviewPresentation({ accessMode: 'regulator_reviewer' }, { NMLS_CREDIT_CHECKPOINTS: 'placeholder' }).creditReview.checkpoints.mode, 'placeholder');
});

test('the checkpoint sequence is Rules of Conduct, Begin, Middle#1, Middle#2, FinalExam, with Resuming on return', () => {
  assert.deepEqual(NMLS_CREDIT_CHECKPOINTS.map(step => step.d3 || step.kind), ['rules_of_conduct', 'Begin', 'Middle#1', 'Middle#2', 'FinalExam', 'Resuming']);
  const course = getNmlsReviewCourse('nmls-2026-national-comprehensive-private-review-v3'), order = course.modules.map(m => m.id);
  const [first, second] = NMLS_CREDIT_CHECKPOINTS.filter(step => step.when === 'after_module').map(step => order.indexOf(step.moduleId));
  assert.ok(first >= 0 && second > first && second < order.length - 1, 'the middle checkpoints fall inside the course, in order');
  assert.deepEqual(checkpointsOnOpen({ phase: 'not_started', readOnly: false }, NMLS_CREDIT_CHECKPOINTS), ['rules_of_conduct', 'begin']);
  for (const phase of ['source', 'first_assessment', 'remediation', 'second_assessment', 'passed']) assert.deepEqual(checkpointsOnOpen({ phase, readOnly: false }, NMLS_CREDIT_CHECKPOINTS), ['resuming']);
  assert.deepEqual(checkpointsOnOpen({ phase: 'read_only_review', readOnly: true }, NMLS_CREDIT_CHECKPOINTS), [], 'the open version is freely navigable');
  assert.deepEqual(checkpointsAfterModules(['F01', 'F02'], ['F01', 'F02', 'F03'], NMLS_CREDIT_CHECKPOINTS), ['middle_1']);
  assert.deepEqual(checkpointsAfterModules(['F01', 'F02', 'F03', 'E01'], ['F01', 'F02', 'F03', 'E01', 'E02'], NMLS_CREDIT_CHECKPOINTS), ['middle_2']);
  assert.deepEqual(checkpointsAfterModules(['F01', 'F02', 'F03'], ['F01', 'F02', 'F03', 'E01'], NMLS_CREDIT_CHECKPOINTS), [], 'a module passed earlier does not raise its checkpoint again');
  assert.deepEqual(checkpointsBeforeFinal(NMLS_CREDIT_CHECKPOINTS), ['final_exam']);
});

test('placeholders say that nothing was verified, and no BioSig-ID call, key or address exists', () => {
  for (const step of NMLS_CREDIT_CHECKPOINTS) assert.match(placeholderCopy(step).status, /^Placeholder\..*(no acceptance|No identity check)/i);
  for (const path of ['config/nmls/credit-review.mjs', 'netlify/functions/_lib/nmls-credit-review.mjs', 'netlify/functions/student-nmls-course.mts',
    'public/statecourse/student/nmls-course/checkpoint-flow.mjs', 'public/statecourse/student/nmls-course/nmls-course.mjs', 'public/statecourse/student/nmls-course/index.html']) {
    const source = read(path);
    assert.doesNotMatch(source, /https?:\/\/|soap|wsdl|api[_-]?key|secret|biosig-id\.com|verified\s*[:=]\s*true/i, path);
  }
  assert.doesNotMatch(read('public/statecourse/student/nmls-course/checkpoint-flow.mjs'), /fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
});

test('the reviewer version carries no free or non-credit label, and free training keeps all of its own', () => {
  const page = read('public/statecourse/student/nmls-course/index.html').replace(/<link[^>]*>|<script[^>]*>|id="[^"]*"|class="[^"]*"/g, '');
  assert.doesNotMatch(page, FREE_LABEL);
  assert.match(page, /8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education/);
  for (const [key, value] of Object.entries({ ...COURSE_WORDING, ...COURSE_WORDING.messages, route: '', messages: '' })) assert.doesNotMatch(String(value), FREE_LABEL, key);
  assert.deepEqual(Object.keys(TRAINING_WORDING).filter(key => !(key in COURSE_WORDING)), [], 'every sentence of the workspace is reworded for the course');
  const training = read('public/statecourse/student/nmls-training/index.html');
  assert.match(training, /Free mortgage training · No NMLS CE credit/); assert.match(training, /Not an approved CE course/);
  assert.match(TRAINING_WORDING.passedHelp, /not completion of an approved CE course/);
});

test('My StateCourse lists no free training; the free section is labelled and linked from the public pages', () => {
  const main = read('public/statecourse/student/index.html'), free = read('public/statecourse/student/free-training/index.html');
  assert.doesNotMatch(main, /trainingGroup|trainingCourses|Start free training/);
  assert.match(main, /href="\/student\/free-training\/"/); assert.match(main, /Free practice, no licensing credit/);
  assert.match(free, /data-portal-section="free-training"/); assert.match(free, /Free practice, no licensing credit/);
  for (const id of ['activeCourses', 'completedCourses', 'otherCourses', 'trainingCourses', 'emptyState', 'portalMessage', 'signOut']) assert.match(free, new RegExp(`id="${id}"`));
  assert.doesNotMatch(free, /profileNameForm|nmlsIdentityForm|certificateCount/);
  const generator = read('scripts/generate-national-platform.mjs');
  assert.match(generator, /mortgage[\s\S]*href="\.\.\/student\/free-training\/"/);
  assert.match(generator, /Practice-only access[\s\S]{0,400}href="\.\.\/student\/free-training\/"/);
  // Public statements and payment stay as they were.
  assert.match(generator, /It is not approved NMLS continuing education/);
});

test('profile forms: desktop rows are pinned and the mobile rule is unchanged', () => {
  const css = read('public/statecourse/student/student-portal.css');
  const desktop = css.match(/@media \(min-width: 761px\) \{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(desktop, /\.profile-completion form > label \{ grid-row: 1; \}/);
  assert.match(desktop, /\.profile-completion form > input,\s*\.profile-completion form > button \{ grid-row: 2; \}/);
  assert.match(desktop, /\.profile-completion form > p \{ grid-row: 3; grid-column: 1 \/ -1; \}/);
  assert.match(desktop, /#nmlsIdentityForm > label,\s*#nmlsIdentityForm > input \{ grid-column: 1 \/ 3; \}/);
  assert.match(desktop, /#nmlsIdentityForm > button \{ grid-column: 3; \}/);
  assert.match(css, /@media\(max-width:760px\)\{[\s\S]*?\.profile-completion form\{grid-template-columns:1fr\}/);
});

test('course HTTP: a reviewer gets the course, an ordinary free-training student gets 403 and no write', async t => {
  const originalFetch = globalThis.fetch, names = ['STATECOURSE_BASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NMLS_CREDIT_CHECKPOINTS'];
  const before = Object.fromEntries(names.map(k => [k, process.env[k]]));
  const origin = 'https://course.test', api = `${origin}/api/student/nmls/course`;
  Object.assign(process.env, { STATECOURSE_BASE_URL: origin, SUPABASE_URL: 'https://course-db.invalid', SUPABASE_ANON_KEY: 'synthetic-anon', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service' });
  delete process.env.NMLS_CREDIT_CHECKPOINTS;
  t.after(() => { globalThis.fetch = originalFetch; for (const k of names) { if (before[k] === undefined) delete process.env[k]; else process.env[k] = before[k]; } });
  const actor = randomUUID(), enrollmentId = randomUUID(), user = { id: actor, email: 'reviewer@example.test' };
  const course = getNmlsReviewCourse('nmls-2026-national-comprehensive-private-review-v3'), definition = getNmlsDraftFinalDefinition(course.id);
  const snapshot = { enrollmentId, studentId: actor, courseId: NMLS, courseVersion: '2026.3', reviewRole: null,
    contentDigest: course.digest, definitionDigest: definition.digest, revision: 0, runtime: null, serverTimeMs: Date.UTC(2026, 10, 20), event: null };
  let calls = [];
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  globalThis.fetch = async url => {
    const target = new URL(url); assert.equal(target.origin, 'https://course-db.invalid', 'no host other than the database is contacted'); calls.push(target.pathname);
    if (target.pathname === '/auth/v1/user') return json(user);
    if (target.pathname === '/rest/v1/students') return new Response(null, { status: 204 });
    if (target.pathname === '/rest/v1/rpc/nmls_training_context') return json(snapshot);
    throw Error(`Unexpected mocked request ${target.pathname}`);
  };
  const request = (body = { operation: 'snapshot', command: { enrollmentId } }) => new Request(api, { method: 'POST',
    headers: { origin, 'content-type': 'application/json', authorization: 'Bearer fixture' }, body: JSON.stringify(body) });
  assert.equal(config.path, '/api/student/nmls/course');

  await t.test('ordinary free-training enrollment: refused before anything else is read or written', async () => {
    calls = []; const response = await handler(request());
    assert.equal(response.status, 403); assert.deepEqual(await response.json(), { error: 'nmls_course_review_access_required' });
    assert.deepEqual(calls, ['/auth/v1/user', '/rest/v1/students', '/rest/v1/rpc/nmls_training_context']);
  });
  await t.test('a write from an ordinary enrollment is refused the same way, and never committed', async () => {
    calls = []; const response = await handler(request({ operation: 'teaching', command: { enrollmentId, eventId: randomUUID(), expectedRevision: 0, action: { kind: 'resume', sessionId: null } } }));
    assert.equal(response.status, 403); assert.equal(calls.includes('/rest/v1/rpc/nmls_training_commit'), false);
  });
  await t.test('closed (student) reviewer: the course, with checkpoints described and switched off', async () => {
    snapshot.reviewRole = 'student_reviewer'; calls = [];
    const response = await handler(request()), body = await response.json();
    assert.equal(response.status, 200); assert.equal(body.accessMode, 'student_reviewer'); assert.equal(body.readOnly, false);
    assert.equal(body.progress.modules.flatMap(m => m.units).length, 45);
    assert.deepEqual(body.creditReview.checkpoints.sequence.map(step => step.id), NMLS_CREDIT_CHECKPOINTS.map(step => step.id));
    assert.equal(body.creditReview.checkpoints.mode, 'off'); assert.equal(body.creditReview.checkpoints.connected, false);
    assert.equal(body.creditReview.title, '8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education'); assert.equal(body.creditReview.version, 'closed');
    // The credit version changes labels only: it still cannot issue credit.
    assert.equal(body.creditIssuanceAllowed, false); assert.equal(body.nmlsCreditEligible, false); assert.equal(body.courseCompletionIssued, false);
    assert.doesNotMatch(JSON.stringify(body), /correctChoice|definitionDigest|"answers"|"runtime"|synthetic-service/);
    assert.equal(response.headers.get('cache-control'), 'no-store, private'); assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  });
  await t.test('the placeholder flag changes the mode and still contacts nothing new', async () => {
    process.env.NMLS_CREDIT_CHECKPOINTS = 'placeholder'; calls = [];
    const body = await (await handler(request())).json();
    assert.equal(body.creditReview.checkpoints.mode, 'placeholder'); assert.equal(body.creditReview.checkpoints.connected, false);
    assert.deepEqual(calls, ['/auth/v1/user', '/rest/v1/students', '/rest/v1/rpc/nmls_training_context']);
    delete process.env.NMLS_CREDIT_CHECKPOINTS;
  });
});
