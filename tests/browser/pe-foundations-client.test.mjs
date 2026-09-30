/** Isolated DOM flow test. Supply JSDOM_MODULE_PATH or install jsdom separately.
 * Exercises the real public client against generated, local artifact files.
 * This does not replace rendered-browser or production acceptance.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { JSDOM } = require(process.env.JSDOM_MODULE_PATH || 'jsdom');
const root = fileURLToPath(new URL('../..', import.meta.url));
const publicRoot = path.join(root, 'public/statecourse');
const payload = JSON.parse(fs.readFileSync(path.join(publicRoot, 'free-practice/courses/national-safe-pe-foundations.json')));
const waitFor = async predicate => {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  assert.ok(predicate(), 'DOM client did not reach the expected state');
};

test('PE public client supports questions, retries, casework, state switching and safe restoration', async t => {
  const dom = new JSDOM(fs.readFileSync(path.join(publicRoot, 'free-practice/index.html'), 'utf8'), {
    url: 'https://practice.example/free-practice/?course=national-safe-pe-foundations&lesson=module-01',
    pretendToBeVisual: true,
  });
  const scrolled = [];
  dom.window.HTMLElement.prototype.scrollIntoView = function (options) { scrolled.push({ element: this, options }); };
  const previous = new Map();
  for (const name of ['window', 'document', 'location', 'history', 'localStorage', 'Option', 'FormData']) {
    previous.set(name, globalThis[name]); globalThis[name] = dom.window[name];
  }
  previous.set('fetch', globalThis.fetch);
  const requests = [];
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(input);
    requests.push(url.pathname);
    await new Promise(resolve => setTimeout(resolve, url.pathname.includes('national-safe-pe-foundations') ? 1 : 5));
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    assert.equal(url.origin, 'https://practice.example');
    const file = path.join(publicRoot, url.pathname);
    const ok = fs.existsSync(file);
    return { ok, text: async () => fs.readFileSync(file, 'utf8'), json: async () => JSON.parse(fs.readFileSync(file, 'utf8')) };
  };
  t.after(() => { for (const [name, value] of previous) globalThis[name] = value; dom.window.close(); });
  const $ = id => dom.window.document.getElementById(id);
  const change = (element, value) => { element.value = value; element.dispatchEvent(new dom.window.Event('change', { bubbles: true })); };
  const input = (element, value) => { element.value = String(value); element.dispatchEvent(new dom.window.Event('input', { bubbles: true })); };
  // Local modules retain their real implementation; give the entry module the
  // same HTTP import base it has when deployed, rather than Node's file URL.
  const entry = pathToFileURL(path.join(publicRoot, 'free-practice.js'));
  const source = fs.readFileSync(entry, 'utf8')
    .replace(/from '(\.\/[^']+)'/g, (_, specifier) => `from '${new URL(specifier, entry).href}'`)
    .replace("new URL('./',import.meta.url)", "new URL('./','https://practice.example/free-practice.js')");
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  await waitFor(() => !$('practiceMode').hidden);
  assert.equal($('practiceLessonSelect').options.length, 6);
  assert.equal($('practiceStateSelect').value, 'US');
  assert.equal($('practiceStatePath').pathname, '/mortgage/pre-license/');
  assert.match($('practiceMessage').textContent, /Six foundation modules/);

  $('practiceQuizMode').click();
  let form = $('practiceAnswerForm');
  const initialUrl = dom.window.location.href;
  form.querySelector('button[type=submit]').click();
  assert.equal(form.checkValidity(), false);
  assert.equal(dom.window.location.href, initialUrl);
  assert.equal($('practiceFeedback').textContent, '');
  const q = payload.questions.find(q => q.lesson_id === 'module-01');
  form.querySelector(`[value="${(q.solution + 1) % 4}"]`).click();
  form.querySelector('button[type=submit]').click();
  assert.match($('practiceFeedback').textContent, /Review this answer/);
  $('practiceQuiz').querySelector('[data-action=retry]').click();
  assert.equal(scrolled.at(-1).element, $('practiceQuiz').querySelector('legend'));
  assert.deepEqual(scrolled.at(-1).options, { block: 'start', behavior: 'instant' });
  assert.equal(dom.window.document.activeElement, scrolled.at(-1).element);
  form = $('practiceAnswerForm');
  form.querySelector(`[value="${q.solution}"]`).click();
  form.querySelector('button[type=submit]').click();
  assert.match($('practiceFeedback').textContent, /Correct/);
  assert.match($('practiceProgress').textContent, /0 correct on the first try/);
  assert.equal($('practiceQuiz').querySelector('fieldset').disabled, true);

  change($('practiceLessonSelect'), 'module-02');
  await waitFor(() => !$('practiceMode').hidden && $('practiceLessonSelect').value === 'module-02');
  $('practiceActivitiesMode').click();
  const activity = payload.activities.find(a => a.lesson_id === 'module-02' && a.tasks.some(task => task.type === 'computation'));
  const caseElement = () => dom.window.document.querySelector(`[data-case="${activity.id}"]`);
  const caseForm = () => caseElement().querySelector('form');
  caseForm().querySelector('button[type=submit]').click();
  assert.equal(caseForm().querySelectorAll('[aria-invalid=true]').length, 1);
  for (const task of activity.tasks) {
    if (task.type === 'selection') {
      const field = caseForm().querySelector(`[name="${task.id}"][value="${task.solution}"]`);
      field.click();
    } else input(caseForm().elements.namedItem(task.id), task.type === 'computation' ? task.solution : 'Fictional reasoning: identify the assumption, evidence and authorized reviewer.');
  }
  caseForm().querySelector('button[type=submit]').click();
  assert.equal(caseElement().querySelectorAll('.is-incorrect').length, 0);
  assert.match(caseElement().textContent, /This is not course passage or an instructor assessment/);
  const storage = JSON.parse(dom.window.localStorage.getItem([...Object.keys(dom.window.localStorage)].find(key => key.endsWith(':activities'))));
  assert.ok(activity.tasks.every(task => storage[task.id]?.checked));
  caseForm().querySelector('[data-retry-case]').click();
  assert.equal(caseElement().querySelectorAll('.is-correct').length, 0);

  for (const lessonId of ['module-03', 'module-04', 'module-05', 'module-06']) {
    change($('practiceLessonSelect'), lessonId);
    await waitFor(() => !$('practiceMode').hidden && $('practiceLessonSelect').value === lessonId);
    $('practiceQuizMode').click();
    const question = payload.questions.find(question => question.lesson_id === lessonId);
    const wrong = (question.solution + 1) % 4;
    let form = $('practiceAnswerForm');
    form.querySelector(`[value="${wrong}"]`).click();
    form.querySelector('button[type=submit]').click();
    assert.ok($('practiceFeedback').textContent.includes(question.choice_feedback[wrong]));
    $('practiceQuiz').querySelector('[data-action=retry]').click();
    form = $('practiceAnswerForm');
    form.querySelector(`[value="${question.solution}"]`).click();
    form.querySelector('button[type=submit]').click();
    assert.ok($('practiceFeedback').textContent.includes(question.choice_feedback[question.solution]));
    assert.match($('practiceProgress').textContent, /0 correct on the first try/);
    $('practiceActivitiesMode').click();
    const nextActivity = payload.activities.find(activity => activity.lesson_id === lessonId);
    const activeCase = () => dom.window.document.querySelector(`[data-case="${nextActivity.id}"]`);
    await waitFor(() => activeCase()?.querySelector('textarea'));
    assert.match($('practiceActivities').textContent, /self-review only: no instructor grade/);
    let nextForm = activeCase().querySelector('form');
    nextForm.querySelector('button[type=submit]').click();
    assert.ok(nextForm.querySelector('[aria-invalid=true]'));
    for (const task of nextActivity.tasks) {
      input(nextForm.elements.namedItem(task.id), task.type === 'computation' ? task.solution : 'Fictional case analysis: record the source, assumption, unresolved decision and next request.');
    }
    nextForm.querySelector('button[type=submit]').click();
    nextForm = activeCase().querySelector('form');
    assert.equal(nextForm.querySelectorAll('.is-incorrect').length, 0);
    assert.match(activeCase().textContent, /not course passage or an instructor assessment/);
  }

  change($('practiceStateSelect'), 'CA');
  change($('practiceStateSelect'), 'US');
  await waitFor(() => !$('practiceMode').hidden && $('practiceCourseSelect').value === 'national-safe-pe-foundations');
  assert.match($('practiceCourseTitle').textContent, /SAFE PE Foundations/);
  assert.equal($('practiceStatePath').pathname, '/mortgage/pre-license/');
  const key = Object.keys(dom.window.localStorage).find(key => key.includes('national-safe-pe-foundations') && !key.endsWith(':activities'));
  dom.window.localStorage.setItem(key, '{malformed');
  change($('practiceStateSelect'), 'US');
  await waitFor(() => !$('practiceMode').hidden);
  assert.match($('practiceProgress').textContent, /Lesson: 0\//);

  dom.window.history.replaceState({}, '', '/free-practice/?course=national-safe-pe-foundations&lesson=module-06&mode=activities');
  dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'));
  await waitFor(() => !$('practiceMode').hidden && $('practiceLessonSelect').value === 'module-06');
  assert.equal($('practiceActivities').hidden, false);
  assert.ok(requests.every(url => !url.startsWith('/api/') && !url.includes('/.netlify/functions/')));
});
