import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { mountTrainingWorkspace } from '../public/statecourse/student/nmls-training/nmls-training.mjs';
import { renderLessonMarkdown } from '../public/statecourse/student/nmls-review/lesson-markdown.mjs';
import { executeNmlsTraining, nmlsTrainingPublicError } from '../netlify/functions/_lib/nmls-training-service.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';
import { NMLS_TRAINING_COURSE as identity } from '../config/nmls-course-identity.mjs';

// DOM tests use the actual learner controller and, for source lessons, the
// actual immutable course/service. RPC storage and time are test doubles, not
// live Supabase verification or measured instructional duration.
const domModule = process.env.NMLS_TEST_DOM_MODULE;
test('NMLS training learner DOM, controller and existing portal cards', {
  skip: domModule ? false : 'Set NMLS_TEST_DOM_MODULE; skipped DOM checks are not passing browser evidence.',
}, async t => {
  const { parseHTML } = await import(pathToFileURL(domModule).href);
  const shell = readFileSync(new URL('../public/statecourse/student/nmls-training/index.html', import.meta.url), 'utf8');
  const course = getNmlsReviewCourse(identity.contentKey), definition = getNmlsDraftFinalDefinition(course.id);
  const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r)); };
  async function setup({ reviewRole = null } = {}) {
    const { document, window: domWindow } = parseHTML(shell), enrollment = randomUUID(), actor = randomUUID(), calls = [], events = new Map(), timers = new Map();
    Object.defineProperty(document, 'hidden', { value: false, writable: true });
    const browserEvents = new EventTarget();
    const win = { location: { search: `?enrollment_id=${enrollment}`, replace() {} }, navigator: { onLine: true }, performance: { now: () => now },
      addEventListener: browserEvents.addEventListener.bind(browserEvents), removeEventListener: browserEvents.removeEventListener.bind(browserEvents),
      dispatchEvent: browserEvents.dispatchEvent.bind(browserEvents), fetch: async () => new Response('{}') };
    let runtime = null, revision = 0, now = 1_790_000_000_000, timerId = 0, lost = false, denied = false, preset = null;
    const context = eventId => ({ enrollmentId: enrollment, studentId: actor, courseId: identity.id, courseVersion: identity.version,
      reviewRole, contentDigest: course.digest, definitionDigest: definition.digest, revision, runtime: structuredClone(runtime), serverTimeMs: now, event: events.get(eventId) || null });
    const rpc = async (name, p) => {
      if (name === 'nmls_training_context') return context(p.p_event_id);
      const old = events.get(p.p_event_id);
      if (old) { assert.equal(old.command_digest, p.p_command_digest); return { ...context(p.p_event_id), replayed: true }; }
      assert.equal(p.p_expected_revision, revision); revision++; runtime = structuredClone(p.p_runtime);
      events.set(p.p_event_id, { command_digest: p.p_command_digest, audit: p.p_audit });
      return { ...context(p.p_event_id), replayed: false };
    };
    const transport = async input => {
      calls.push(structuredClone(input));
      if (denied) return { status: 403, body: { error: 'nmls_training_access_denied' } };
      let response;
      if (preset) response = { status: 200, body: structuredClone(preset) };
      else { try { response = await executeNmlsTraining(input, actor, { rpc }); } catch (error) { response = nmlsTrainingPublicError(error); } }
      if (lost && input.operation !== 'snapshot') { lost = false; throw Error('lost response after commit'); }
      return response;
    };
    const schedule = (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; };
    const api = mountTrainingWorkspace({ document, window: win, transport, newId: randomUUID,
      setTimer: schedule, setPoll: schedule, clearTimer: id => timers.delete(id), clearPoll: id => timers.delete(id) });
    await settle();
    const click = async element => { element.dispatchEvent(new domWindow.Event('click', { bubbles: true })); await settle(); };
    const submit = async form => { form.dispatchEvent(new domWindow.Event('submit', { bubbles: true, cancelable: true })); await settle(); };
    return { api, document, win, domWindow, calls, enrollment, timers, click, submit, get runtime() { return runtime; },
      advance(ms) { now += ms; }, loseNext() { lost = true; }, deny() { denied = true; },
      async poll() { timers.values().find(timer => timer.ms === 15000)?.fn(); await settle(); },
      async hide(value) { document.hidden = value; document.dispatchEvent(new domWindow.Event('visibilitychange')); await settle(); },
      async offline(value) { win.navigator.onLine = !value; win.dispatchEvent(new Event(value ? 'offline' : 'online')); await settle(); },
      async projection(body) { preset = { ...structuredClone(api.client.view.snapshot), ...body, revision: (api.client.view.snapshot?.revision || 0) + 1 }; await api.client.open(enrollment); await settle(); },
      projectionBody: () => structuredClone(preset),
    };
  }
  async function openFirst(r) {
    await r.click(r.document.getElementById('resumeTraining'));
    await r.click(r.document.getElementById('nextAction'));
  }
  await t.test('explicit resume loads a real lesson; markup is safely rendered and no browser completion shortcut appears', async () => {
    const r = await setup();
    assert.equal(r.calls.length, 1); assert.equal(r.calls[0].operation, 'snapshot');
    assert.equal(r.document.getElementById('resumePanel').hidden, false);
    await openFirst(r);
    assert.ok(r.document.getElementById('lesson').textContent.includes('Learner reading'));
    assert.equal(r.document.getElementById('unitForm').querySelectorAll('input[type="radio"]').length, 4);
    assert.equal(r.document.getElementById('nextAction').disabled, true);
    assert.equal(r.calls.some(call => call.command.runtime || call.command.credit || call.command.completedUnitIds), false);
    assert.equal(r.document.querySelectorAll('#lesson script, #lesson iframe, #lesson img[onerror]').length, 0);
    r.api.destroy();
  });
  await t.test('heartbeat and synthetic gestures do not move focus, recreate question forms, or manufacture interaction', async () => {
    const r = await setup(); await openFirst(r);
    const form = r.document.getElementById('unitForm'), option = form.querySelector('input'); option.checked = true;
    const outlineButton = r.document.querySelector('#outline button');
    r.document.dispatchEvent(new r.domWindow.Event('keydown', { bubbles: true })); await settle();
    assert.equal(r.calls.some(call => call.command.action?.kind === 'interaction'), false);
    r.advance(15000); await r.poll();
    assert.equal(r.document.getElementById('unitForm'), form); assert.equal(option.checked, true);
    assert.equal(r.document.querySelector('#outline button'), outlineButton, 'Background saves preserve keyboard navigation nodes');
    assert.equal(r.calls.at(-1).command.action.kind, 'heartbeat'); assert.equal(r.calls.at(-1).command.action.visible, true);
    assert.equal(r.runtime.source.current.provisionalMs, 0, 'No synthetic human interaction is inferred from timer callbacks');
    r.api.destroy();
  });
  await t.test('answer transport loss locks navigation and preserves choices; exact retry commits only one activity', async () => {
    const r = await setup(); await openFirst(r);
    const form = r.document.getElementById('unitForm'); form.querySelector('input').checked = true;
    r.loseNext(); await r.submit(form);
    assert.equal(r.api.client.view.phase, 'uncertain'); assert.equal(r.document.getElementById('unitForm'), form);
    assert.equal(form.querySelector('input').checked, true); assert.equal(form.querySelector('fieldset').disabled, true);
    assert.equal(r.document.getElementById('retryCommand').hidden, false);
    const command = structuredClone(r.calls.at(-1)); await r.click(r.document.getElementById('retryCommand'));
    assert.deepEqual(r.calls.at(-1), command); assert.equal(r.api.client.view.snapshot.replayed, true);
    assert.equal(r.document.getElementById('resumePanel').hidden, false, 'No silent activity restart after uncertainty');
    r.api.destroy();
  });
  await t.test('hide/offline stop observation; returning online or visible never auto-resumes', async () => {
    const r = await setup(); await openFirst(r); await r.hide(true);
    assert.equal(r.calls.at(-1).command.action.kind, 'logout'); assert.equal(r.runtime.source.status, 'logged_out');
    const count = r.calls.length; r.advance(90000); await r.poll(); await r.hide(false);
    assert.equal(r.calls.length, count); assert.equal(r.document.getElementById('resumePanel').hidden, false);
    await r.click(r.document.getElementById('resumeTraining')); assert.equal(r.runtime.source.status, 'active');
    await r.offline(true); const offlineCount = r.calls.length; await r.poll(); await r.offline(false);
    assert.equal(r.calls.length, offlineCount); assert.equal(r.document.getElementById('resumePanel').hidden, false);
    r.api.destroy();
  });
  await t.test('revocation clears lesson and questions immediately; account session is not recreated by this page', async () => {
    const r = await setup(); await openFirst(r); r.deny(); await r.poll();
    assert.equal(r.api.client.view.phase, 'denied'); assert.equal(r.document.getElementById('lesson').textContent, '');
    assert.equal(r.document.querySelectorAll('input[type="radio"]').length, 0); assert.equal(r.document.getElementById('workspace').hidden, true);
    r.api.destroy();
  });
  await t.test('late resume response cannot undo a newer hidden/offline pause', async () => {
    const r = await setup(); const transport = r.api.client.transport; let release;
    r.api.client.transport = async input => {
      const response = await transport(input);
      await new Promise(resolve => release = resolve);
      return response;
    };
    const resume = r.api.resume(); await settle();
    await r.hide(true); release(); await resume; await settle(); await r.hide(false);
    assert.equal(r.document.getElementById('resumePanel').hidden, false);
    const count = r.calls.length; await r.poll(); assert.equal(r.calls.length, count);
    r.api.destroy();
  });
  await t.test('first/second assessment use saved 25-question sets, validate all answers, and no terminal third attempt appears', async () => {
    const r = await setup();
    const questions = definition.items.slice(0, 25).map(q => ({ id: q.id, stem: q.stem, options: q.options }));
    await r.projection({ phase: 'first_assessment', assessment: { id: randomUUID(), number: 1, questions } });
    assert.equal(r.calls.at(-1).operation, 'snapshot'); await r.click(r.document.getElementById('resumeTraining'));
    assert.equal(r.calls.at(-1).operation, 'snapshot', 'Continuing a saved final does not issue another final');
    const form = r.document.getElementById('assessmentForm'); assert.equal(form.querySelectorAll('fieldset').length, 25);
    await r.submit(form); assert.equal(r.document.getElementById('formError').hidden, false); assert.equal(r.calls.at(-1).operation, 'snapshot');
    for (const field of form.querySelectorAll('fieldset')) field.querySelector('input').checked = true;
    await r.submit(form); assert.equal(r.calls.at(-1).operation, 'submit_assessment'); assert.equal(Object.keys(r.calls.at(-1).command.answers).length, 25);
    await r.projection({ phase: 'remediation_required', assessment: null, result: { correct: 10, total: 25, requiredCorrect: 18 } });
    await r.click(r.document.getElementById('resumeTraining'));
    assert.match(r.document.getElementById('phaseTitle').textContent, /Targeted review/);
    await r.click(r.document.getElementById('phaseAction')); assert.equal(r.calls.at(-1).operation, 'start_remediation');
    const pausedProgress = { ...r.projectionBody().progress, status: 'logged_out', sessionId: null, lessons: [], quiz: null };
    await r.projection({ phase: 'remediation', assessment: null, progress: pausedProgress });
    assert.equal(r.document.getElementById('resumePanel').hidden, false, 'Mandatory review must provide an explicit start action, not a dead end');
    await r.projection({ phase: 'second_assessment', assessment: { id: randomUUID(), number: 2, questions: definition.items.slice(25, 50).map(q => ({ id: q.id, stem: q.stem, options: q.options })) } });
    assert.match(r.document.getElementById('assessmentArea').textContent, /assessment 2 of 2/);
    for (const terminal of ['passed', 'staff_review_required']) {
      await r.projection({ phase: terminal, assessment: null, result: { correct: terminal === 'passed' ? 20 : 10, total: 25, requiredCorrect: 18 } });
      assert.equal(r.document.getElementById('phaseAction').hidden, true); assert.equal(r.document.getElementById('resumePanel').hidden, true);
      assert.match(r.document.getElementById('phaseHelp').textContent, /No NMLS credit|no NMLS credit/);
      assert.equal(r.document.getElementById('assessmentForm'), null);
      assert.doesNotMatch(r.document.getElementById('syncStatus').textContent, /Choose|Start or resume/);
    }
    r.api.destroy();
  });
  await t.test('source/remediation completion has assessment CTA only after saved module completion', async () => {
    const r = await setup(); const p = structuredClone(r.api.client.view.snapshot.progress);
    await r.projection({ phase: 'source', progress: { ...p, status: 'review_complete' } });
    assert.equal(r.document.getElementById('phaseAction').disabled, true); await r.click(r.document.getElementById('resumeTraining'));
    await r.click(r.document.getElementById('phaseAction')); assert.equal(r.calls.at(-1).operation, 'issue_assessment');
    await r.projection({ phase: 'remediation', progress: { ...p, status: 'review_complete' } });
    assert.equal(r.document.getElementById('phaseAction').textContent, 'Start second practice assessment');
    r.api.destroy();
  });
  await t.test('actual regulator review browses all lessons and module questions locally without time, grading, or writes', async () => {
    const r = await setup({ reviewRole: 'regulator_reviewer' });
    assert.equal(r.api.client.view.phase, 'ready'); assert.equal(r.api.client.view.snapshot.readOnly, true);
    assert.equal(r.runtime, null); assert.equal(r.timers.size, 0, 'Reviewer must not start activity or idle timers');
    assert.equal(r.document.getElementById('workspace').hidden, false); assert.equal(r.document.getElementById('readOnlyPanel').hidden, false);
    assert.match(r.document.getElementById('syncStatus').textContent, /Read-only regulator review/);
    for (const id of ['resumePanel', 'pauseTraining', 'savedSummary', 'timingNotice', 'nextArea', 'unitMeta', 'phasePanel']) assert.equal(r.document.getElementById(id).hidden, true, id);
    const modules = r.api.client.view.snapshot.review.modules;
    assert.equal(r.document.querySelectorAll('#outline button[data-review-unit]').length, 45 + modules.length);
    for (const module of modules) {
      for (const lesson of module.lessons) {
        await r.click([...r.document.querySelectorAll('#outline button')].find(button => button.dataset.reviewUnit === lesson.id));
        const expected = parseHTML(`<article>${renderLessonMarkdown(lesson.content)}</article>`).document.querySelector('article').textContent;
        assert.equal(r.document.getElementById('lesson').textContent, expected, `Full authored lesson must render: ${lesson.id}`);
        assert.ok(r.document.getElementById('questionArea').textContent.includes(lesson.question.stem));
        assert.equal(r.document.querySelector('#outline [aria-current="page"]').dataset.reviewUnit, lesson.id);
      }
      await r.click([...r.document.querySelectorAll('#outline button')].find(button => button.dataset.reviewUnit === `questions:${module.id}`));
      for (const question of module.formativeQuestions) assert.ok(r.document.getElementById('questionArea').textContent.includes(question.stem));
    }
    assert.equal(r.document.querySelectorAll('input, form, progress, [role="progressbar"]').length, 0);
    await r.api.resume(); await r.api.client.send('issue_assessment');
    await r.hide(true); await r.hide(false); await r.offline(true); await r.offline(false); await r.poll();
    assert.equal(r.calls.length, 1, 'Lesson review must use only the original authorized snapshot');
    assert.equal(r.timers.size, 0); assert.equal(r.runtime, null);
    assert.equal(r.document.getElementById('assessmentArea').textContent, '');
    r.api.destroy();
  });
  await t.test('existing student portal shows practice completion separately, suppresses regulated claims, and preserves RE cards', async () => {
    const portalShell = readFileSync(new URL('../public/statecourse/student/index.html', import.meta.url), 'utf8');
    const { document } = parseHTML(portalShell);
    const script = readFileSync(new URL('../public/statecourse/student/student-portal.js', import.meta.url), 'utf8');
    // Evaluate the real card functions without invoking the page's network load.
    const prefix = script.slice(0, script.indexOf('async function'));
    const context = vm.createContext({ document, Intl, Date, URL }); vm.runInContext(prefix, context);
    const enrollment = { enrollment_id: randomUUID(), course_id: identity.id, course_name: identity.title, course_version: identity.version,
      state: 'US', enrollment_origin: 'training', enrollment_status: 'active', access_status: 'active', completed_at: null,
      training_completed: true, nmls_training: { available: true, passedModules: 8, totalModules: 8 }, assignments_completed: 45, assignment_count: 45,
      progress_percent: 100, resume_path: '/student/nmls-training/?enrollment_id=test' };
    context.record = enrollment;
    const html = vm.runInContext('card(record)', context);
    assert.match(html, /training completed/); assert.match(html, /View training result/); assert.match(html, /Not issued — free training only/);
    assert.doesNotMatch(html, /Earliest final|Certificate:|Instructor:/);
    assert.match(html, /<progress class="mortgage-training-progress" aria-label="Training progress" max="100" value="100"/);
    assert.doesNotMatch(html, /\sstyle=|\son\w+=/, 'NMLS card must work under self-only style/script CSP');
    context.record = { ...enrollment, nmls_training: { available: false }, training_completed: false, resume_path: null };
    const unavailable = vm.runInContext('card(record)', context); assert.match(unavailable, /temporarily unavailable/); assert.doesNotMatch(unavailable, /role="progressbar"|resume-course/);
    context.record = { ...enrollment, nmls_training: { available: true, readOnly: true, accessMode: 'regulator_reviewer' }, training_completed: false, progress_percent: null, assignments_completed: null };
    const readOnly = vm.runInContext('card(record)', context);
    assert.match(readOnly, /Read-only regulator review/); assert.match(readOnly, /Open review/);
    assert.doesNotMatch(readOnly, /<progress|progressbar|0%|Module practices:|Remaining training:|Resume training|training completed/);
    context.record = { ...enrollment, course_id: 'ca-principles', enrollment_origin: 'review' };
    assert.match(vm.runInContext('card(record)', context), /Earliest final/);
  });
});
