/** Portable DOM addition: install jsdom as a test dependency OR provide
 * JSDOM_MODULE_PATH. STATECOURSE_ROOT is optional after placing in root/tests/browser.
 * No checkout writes. Uses real requestSubmit/button.click, not dispatchEvent.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { JSDOM, VirtualConsole } = require(process.env.JSDOM_MODULE_PATH || 'jsdom');
const root = path.resolve(process.env.STATECOURSE_ROOT || fileURLToPath(new URL('../..', import.meta.url)));
const { renderPracticeActivities } = await import(pathToFileURL(path.join(root, 'public/statecourse/practice-activities.mjs')));
const tasks = [
  { id: 'choice', type: 'selection', prompt: 'Select the fixture result.', choices: ['A', 'B', 'C', 'D'], solution: 2, explanation: 'Fixture feedback.' },
  { id: 'number', type: 'computation', prompt: 'Enter the supplied number.', solution: 0, tolerance: 0, explanation: 'Zero is valid; blank is not zero.' },
  { id: 'written', type: 'self-review', prompt: 'Write a fixture analysis.', rubric: [{ id: 'one', description: 'Compare the supplied evidence.' }], explanation: 'Self-review only.' }
];

test('native empty submission always reaches custom inline validation and never accepts a blank', () => {
  for (const task of tasks) for (const method of ['requestSubmit', 'click']) {
    const errors = [], virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', error => errors.push(error.message));
    const dom = new JSDOM('<main></main>', { url: 'https://practice.example.test/', virtualConsole });
    const names = ['document', 'localStorage', 'FormData'];
    const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
    for (const name of names) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: dom.window[name] });
    try {
      const container = dom.window.document.querySelector('main');
      renderPracticeActivities(container, [{ id: 'native-case', title: 'Native validation fixture', context: 'No actual learner data.', facts: [], tasks: [task] }], 'native-submit-fixture');
      const form = container.querySelector('form'), first = container.querySelector('input,textarea');
      assert.equal(form.noValidate, true);
      assert.equal(first.validity.valueMissing, true);
      if (method === 'requestSubmit') form.requestSubmit(); else form.querySelector('button[type="submit"]').click();
      assert.match(container.querySelector('.practice-feedback').textContent, /Choose an answer|Enter a finite number|Write your analysis/);
      assert.equal(first.getAttribute('aria-invalid'), 'true');
      assert.equal(dom.window.document.activeElement, first);
      assert.equal(container.querySelectorAll('.is-correct').length, 0);
      assert.equal(JSON.parse(dom.window.localStorage.getItem('native-submit-fixture') || '{}')[task.id], undefined);
      assert.deepEqual(errors, []);
    } finally {
      for (const name of names) { const descriptor = previous.get(name); if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; }
      dom.window.close();
    }
  }
});
