import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/statecourse/admin/console/console.js', import.meta.url), 'utf8');

async function screen(reply) {
  const elements = new Map();
  let submit;
  let posts = 0;
  const find = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      value: '', disabled: false, hidden: false,
      setAttribute() {}, removeAttribute() {}, focus() {},
      addEventListener(event, callback) {
        if (selector === '#signInForm' && event === 'submit') submit = callback;
      },
    });
    return elements.get(selector);
  };
  find('#signInEmail').value = 'owner@example.test';
  find('#signInPassword').value = 'entered-password';
  vm.runInNewContext(source, {
    document: { querySelector: find, querySelectorAll: () => [], dispatchEvent() {}, addEventListener() {} },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
    fetch: async (path, options) => {
      if (options.method !== 'POST') return { ok: false, status: 401, json: async () => ({ error: 'student_auth_required' }) };
      posts++;
      return reply(path, options);
    },
  });
  await new Promise(resolve => setImmediate(resolve));
  return { find, submit: () => submit({ preventDefault() {} }), posts: () => posts };
}

for (const [status, code, expected] of [
  [401, 'invalid_credentials', /Email or password was not accepted.*new password/],
  [401, 'invalid_student_session', /could not verify this sign-in/],
  [403, 'email_confirmation_required', /Confirm your email/],
  [403, 'origin_not_allowed', /Reload the page/],
  [429, 'sign_in_rate_limited', /Too many sign-in attempts/],
  [503, 'student_auth_unavailable', /temporarily unavailable/],
]) test('admin sign-in explains ' + code + ' without hiding it behind a session label', async () => {
  const ui = await screen(async () => ({ ok: false, status, json: async () => ({ error: code }) }));
  await ui.submit();
  assert.match(ui.find('#sessionState').textContent, expected);
  assert.doesNotMatch(ui.find('#sessionState').textContent, /invalid student session|invalid_student_session/);
  assert.equal(ui.find("#signInForm button[type='submit']").disabled, false);
  assert.equal(ui.find('#signInPassword').value, 'entered-password');
});

test('an admin sign-in connection error is not described as a wrong password', async () => {
  const ui = await screen(async () => { throw new TypeError('fetch failed'); });
  await ui.submit();
  assert.match(ui.find('#sessionState').textContent, /Could not connect/);
});

test('repeated clicks send only one in-flight password request', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const ui = await screen(() => pending);
  const first = ui.submit();
  await ui.submit();
  assert.equal(ui.posts(), 1);
  finish({ ok: false, status: 401, json: async () => ({ error: 'invalid_credentials' }) });
  await first;
  assert.equal(ui.find("#signInForm button[type='submit']").disabled, false);
});

test('a valid account with no staff binding remains signed in without admin authority', async () => {
  const ui = await screen(async () => ({ ok: true, status: 200, json: async () => ({ user: { id: 'review-account', email: 'reviewer@example.test' }, roles: [], bindings: [] }) }));
  await ui.submit();
  assert.match(ui.find('#sessionState').textContent, /no staff role binding/);
  assert.equal(ui.find('#signInForm').hidden, true);
  assert.equal(ui.find('#console').hidden, true);
  assert.equal(ui.find('#signInPassword').value, '');
});
