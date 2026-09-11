import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { handler } from '../netlify/functions/student-session.mjs';
import { requireStudentSession } from '../netlify/functions/_lib/student-session.mjs';

const user = { id: 'existing-user', email: 'existing@example.test' };
const event = { httpMethod: 'POST', headers: { origin: 'https://statecourse.com' }, body: JSON.stringify({ email: user.email, password: 'old123' }) };
async function backend(run, authStatus = 200, authBody = { user, access_token: 'user.jwt.token', refresh_token: 'refresh' }, dbStatus = 204) {
  const saved = { ...process.env }, oldFetch = globalThis.fetch, calls = [];
  process.env.SUPABASE_URL = 'https://project.example.test';
  process.env.SUPABASE_ANON_KEY = 'sb_publishable_example';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_example';
  process.env.STATECOURSE_BASE_URL = 'https://statecourse.com';
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return url.includes('/auth/') ? new Response(JSON.stringify(authBody), { status: authStatus }) : new Response(dbStatus === 204 ? null : JSON.stringify({ message: 'database offline' }), { status: dbStatus });
  };
  try { await run(calls); } finally { globalThis.fetch = oldFetch; for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k]; Object.assign(process.env, saved); }
}
test('existing short password reaches Auth and opaque keys are not sent as bearer tokens', async () => {
  await backend(async calls => {
    const response = await handler(event);
    assert.equal(response.statusCode, 200);
    assert.equal(calls.length, 2);
    assert.equal(JSON.parse(calls[0].body).password, 'old123');
    assert.equal(calls[0].headers.apikey, 'sb_publishable_example');
    assert.equal(calls[1].headers.apikey, 'sb_secret_example');
    for (const call of calls) assert.equal(call.headers.authorization, undefined);
    assert.match(response.multiValueHeaders['set-cookie'][0], /HttpOnly; Secure/);
    assert.equal(JSON.parse(response.body).access_token, undefined);
  });
});
test('legacy keys retain their authorization headers', async () => {
  await backend(async calls => {
    process.env.SUPABASE_ANON_KEY = 'legacy.anon.jwt'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'legacy.service.jwt';
    assert.equal((await handler(event)).statusCode, 200);
    assert.equal(calls[0].headers.authorization, 'Bearer legacy.anon.jwt');
    assert.equal(calls[1].headers.authorization, 'Bearer legacy.service.jwt');
  });
});
test('signed-in user JWT remains the bearer authority', async () => {
  await backend(async calls => {
    await requireStudentSession({ headers: { authorization: 'Bearer actual.user.jwt' } });
    assert.equal(calls[0].headers.authorization, 'Bearer actual.user.jwt');
  }, 200, user);
});
for (const [name, status, body, expected] of [
  ['incorrect password', 400, { code: 'invalid_credentials' }, 401],
  ['unconfirmed email', 400, { code: 'email_not_confirmed' }, 403],
  ['rate limit', 429, {}, 429],
  ['auth outage', 503, {}, 503]
]) test(name + ' preserves its error category and creates no session', async () => {
  await backend(async calls => { const r = await handler(event); assert.equal(r.statusCode, expected); assert.equal(calls.length, 1); assert.ok(!r.multiValueHeaders || r.multiValueHeaders['set-cookie'].every(c => c.includes('Max-Age=0'))); }, status, body);
});
test('profile sync failure does not issue a session or become a password error', async () => {
  await backend(async () => { const r = await handler(event); assert.equal(r.statusCode, 503); assert.equal(r.multiValueHeaders, undefined); }, 200, { user, access_token: 'token' }, 503);
});

async function frontend(status, body = {}, networkFailure = false) {
  const elements = new Map(); let submit, redirect;
  const element = () => ({ value: 'example', validity: {}, classList: { add() {}, remove() {} }, setAttribute() {}, removeAttribute() {}, getAttribute() {}, focus() {}, addEventListener() {} });
  const query = key => { if (!elements.has(key)) elements.set(key, element()); return elements.get(key); };
  const form = query('#studentSignIn'); form.elements = { email: element(), password: element() }; form.elements.email.value = 'existing@example.test'; form.querySelector = query; form.addEventListener = (name, fn) => { if (name === 'submit') submit = fn; };
  vm.runInNewContext(readFileSync(new URL('../public/statecourse/student/sign-in/student-signin.js', import.meta.url), 'utf8'), {
    document: { querySelector: query, documentElement: { dataset: {} } }, URLSearchParams,
    location: { search: '', replace: value => { redirect = value; } },
    fetch: async (_, options = {}) => {
      if (!options.method) return { ok: false };
      if (networkFailure) throw new Error('network');
      return { ok: status === 200, status, json: async () => body };
    }
  });
  await submit({ preventDefault() {} });
  return { message: query('#signinMessage').textContent, redirect, button: query("button[type='submit']") };
}
for (const [status, body, phrase] of [
  [401, {}, /Check your email address and password/],
  [403, { error: 'email_confirmation_required' }, /confirm your email/],
  [429, {}, /Too many sign-in attempts/],
  [503, {}, /temporarily unavailable/],
  [502, {}, /temporarily unavailable/]
]) test('sign-in UI explains HTTP ' + status, async () => {
  const r = await frontend(status, body); assert.match(r.message, phrase); assert.equal(r.redirect, undefined); assert.equal(r.button.disabled, false);
});
test('network failure is not presented as bad credentials', async () => { assert.match((await frontend(0, {}, true)).message, /could not connect/); });
test('successful sign-in continues to the student cabinet', async () => { assert.equal((await frontend(200)).redirect, '/student/'); });
