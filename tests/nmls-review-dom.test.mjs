import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID, webcrypto } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { build } from 'esbuild';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { startNmlsCourseReview, reduceNmlsReview, projectNmlsReview } from '../lib/nmls-review-runtime.mjs';

// DOM/controller interaction tests, not a browser or real learner timing study.
// Isolated dependency: NMLS_TEST_DOM_MODULE=/tmp/.../node_modules/linkedom/esm/index.js
test('NMLS real study-controller DOM interactions', {
  skip: process.env.NMLS_TEST_DOM_MODULE ? false : 'Set NMLS_TEST_DOM_MODULE; skipped DOM checks are not passing UI evidence.',
}, async (t) => {
  const { parseHTML } = await import(pathToFileURL(process.env.NMLS_TEST_DOM_MODULE).href);
  const course = structuredClone(getNmlsReviewCourse('nmls-2026-f01-private-review'));
  course.modules[0].units = course.modules[0].units.slice(0, 2).map((u) => ({ ...u, requiredSeconds: 20 }));
  const bundle = await build({ entryPoints: [new URL('../public/statecourse/student/nmls-review/nmls-review.mjs', import.meta.url).pathname], bundle: true, write: false, format: 'iife', platform: 'browser' });
  const shell = readFileSync(new URL('../public/statecourse/student/nmls-review/index.html', import.meta.url), 'utf8');
  const settle = async () => { for (let n = 0; n < 5; n++) await new Promise((r) => setImmediate(r)); };
  async function setup({ quiz = false } = {}) {
    const { document, window } = parseHTML(shell); Object.defineProperty(document, 'hidden', { value: false, writable: true });
    const grantId = randomUUID(), attemptId = randomUUID(), calls = [], focusCalls = [], timers = new Map();
    let time = 1000, state = startNmlsCourseReview(course), timerId = 0, failOnce = false, pausedPoll, releasePoll;
    const apply = (kind, fields = {}) => {
      const reduced = reduceNmlsReview(state, { kind, eventId: randomUUID(), expectedRevision: state.revision, sessionId: state.sessionId, ...fields }, course, time);
      state = reduced.state; return reduced;
    };
    apply('resume'); apply('open_unit', { unitId: 'F01-U01' }); apply('interaction', { visible: true });
    time += 20000; apply('heartbeat', { visible: true }); apply('unit_action', { choice: 'B' }); apply('complete_unit');
    if (quiz) {
      apply('open_unit', { unitId: 'F01-U02' }); apply('interaction', { visible: true }); time += 20000;
      apply('heartbeat', { visible: true }); apply('unit_action', { choice: course.modules[0].units[1].actionQuestion.correctChoice });
      apply('complete_unit'); apply('quiz_start', { moduleId: 'F01' });
    }
    // Explicit UI resume normally resets partial state. For quiz tests, return
    // the seeded active quiz only after that explicit click (fixture, not live).
    const seededQuiz = quiz ? structuredClone(state.quiz) : null;
    window.HTMLElement.prototype.focus = function () { focusCalls.push(this); };
    const fetcher = async (url, init = {}) => {
      if (url === '/api/student/session') return new Response('{}');
      const input = JSON.parse(init.body); calls.push(structuredClone(input));
      let body, status = 200;
      if (input.kind === 'list') body = { reviews: [{ grantId, courseKey: course.id, title: course.title, expiresAt: '2026-10-10T00:00:00Z', available: true }] };
      else if (input.kind === 'start') body = { attemptId, progress: { ...projectNmlsReview(state, course), sessionId: null } };
      else {
        const reduced = reduceNmlsReview(state, input, course, time); state = reduced.state;
        if (input.kind === 'resume' && seededQuiz) { state.quiz = structuredClone(seededQuiz); reduced.outcome.progress = projectNmlsReview(state, course); }
        body = { ...reduced.outcome, attemptId }; status = reduced.outcome.status;
      }
      if (input.kind === 'heartbeat' && pausedPoll) { pausedPoll = false; await new Promise((r) => { releasePoll = r; }); }
      if (input.kind === 'unit_action' && failOnce) { failOnce = false; throw new Error('lost response after server evaluation'); }
      return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    };
    class FormDataShim {
      constructor(form) { this.values = [...form.querySelectorAll('input')].filter((input) => input.checked).map((input) => [input.name, input.value]); }
      [Symbol.iterator]() { return this.values[Symbol.iterator](); }
    }
    const context = vm.createContext({ document, location: { search: '', replace() {} }, history: { replaceState() {} },
      fetch: fetcher, crypto: { randomUUID, getRandomValues: (array) => webcrypto.getRandomValues(array) }, FormData: FormDataShim, URLSearchParams, AbortSignal, structuredClone,
      performance: { now: () => time }, setTimeout: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; },
      clearTimeout: (id) => timers.delete(id), setInterval: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; }, console });
    vm.runInContext(bundle.outputFiles[0].text, context); await settle();
    const click = async (element) => { element.dispatchEvent(new window.Event('click', { bubbles: true })); await settle(); };
    await click(document.querySelector('#reviewList button'));
    assert.equal(calls.filter((c) => c.kind === 'resume').length, 0);
    await click(document.getElementById('resumeReview'));
    return { document, window, calls, focusCalls, timers, get state() { return state; }, click,
      advance(ms) { time += ms; }, failNextAnswer() { failOnce = true; },
      pauseNextPoll() { pausedPoll = true; }, releasePoll() { releasePoll(); },
      async poll() { timers.values().find((timer) => timer.ms === 15000).fn(); await settle(); },
      async submit(form) { form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); await settle(); },
    };
  }
  await t.test('heartbeat preserves unit/quiz form nodes, radio drafts and focus', async () => {
    for (const quiz of [false, true]) {
      const r = await setup({ quiz });
      if (!quiz) await r.click(r.document.getElementById('nextAction'));
      const form = r.document.getElementById(quiz ? 'quizForm' : 'unitForm'); assert.ok(form);
      for (const option of form.querySelectorAll('input[type="radio"]')) {
        assert.ok(option.parentElement.querySelector('span').textContent.startsWith(option.value + '. '),
          'visible answer letter and server/feedback identity stay bound in the actual controller');
      }
      const input = form.querySelector('input'); input.checked = true; input.focus();
      const focused = r.focusCalls.length; r.advance(15000); await r.poll();
      assert.equal(r.document.getElementById(form.id), form); assert.equal(input.checked, true); assert.equal(r.focusCalls.length, focused);
    }
  });
  await t.test('reading a completed unit cannot accrue time for hidden current unit', async () => {
    const r = await setup(); await r.click(r.document.getElementById('nextAction'));
    r.advance(15000); await r.poll(); r.advance(15000); await r.poll();
    const before = r.state.current.provisionalMs;
    await r.click(r.document.querySelector('[data-unit="F01-U01"]'));
    assert.equal(r.calls.at(-1).visible, false);
    r.advance(15000); await r.poll();
    assert.equal(r.calls.at(-1).visible, false); assert.equal(r.state.current.provisionalMs, before);
  });
  await t.test('uncertain answer locks unit navigation and retains the exact radio/form', async () => {
    const r = await setup(); await r.click(r.document.getElementById('nextAction'));
    const form = r.document.getElementById('unitForm'); const input = form.querySelector('input'); input.checked = true;
    r.failNextAnswer(); await r.submit(form);
    assert.equal(r.document.getElementById('retryCommand').hidden, false);
    assert.equal(r.document.querySelector('[data-unit="F01-U01"]').disabled, true);
    await r.click(r.document.querySelector('[data-unit="F01-U01"]'));
    assert.equal(r.document.getElementById('unitForm'), form); assert.equal(input.checked, true);
  });
  await t.test('double submit behind a delayed poll produces one foreground command', async () => {
    const r = await setup({ quiz: true }); const form = r.document.getElementById('quizForm');
    for (const fieldset of form.querySelectorAll('fieldset')) fieldset.querySelector('input').checked = true;
    r.pauseNextPoll(); await r.poll();
    await r.submit(form); assert.equal(form.querySelector('button').disabled, true);
    await r.submit(form); r.releasePoll(); await settle();
    assert.equal(r.calls.filter((c) => c.kind === 'quiz_submit').length, 1);
    assert.equal(r.document.getElementById('studySignIn').hidden, true);
  });
});
