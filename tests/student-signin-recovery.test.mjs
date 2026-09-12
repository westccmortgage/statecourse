import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { handler } from '../netlify/functions/student-session.mjs';
import { requireStudentSession } from '../netlify/functions/_lib/student-session.mjs';

const user = { id: 'existing-user', email: 'existing@example.test' };
const event = { httpMethod: 'POST', headers: { origin: 'https://statecourse.com' }, body: JSON.stringify({ email: user.email, password: 'old123' }) };
async function backend(run, authStatus = 200, authBody = { user, access_token: 'user.jwt.token', refresh_token: 'refresh' }, dbStatus = 204, respond) {
  const saved = { ...process.env }, oldFetch = globalThis.fetch, calls = [];
  process.env.SUPABASE_URL = 'https://project.example.test';
  process.env.SUPABASE_ANON_KEY = 'sb_publishable_example';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_example';
  process.env.STATECOURSE_BASE_URL = 'https://statecourse.com';
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    const override = respond?.(url, options);
    if (override) return override;
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
  await backend(async calls => { const r = await handler(event); assert.equal(r.statusCode, expected); if (name === 'incorrect password') assert.equal(JSON.parse(r.body).error, 'invalid_credentials'); assert.equal(calls.length, 1); assert.ok(!r.multiValueHeaders || r.multiValueHeaders['set-cookie'].every(c => c.includes('Max-Age=0'))); }, status, body);
});

test('incorrect credentials reported through error_code retain their category', async () => {
  await backend(async () => {
    const response = await handler(event);
    assert.equal(response.statusCode, 401);
    assert.equal(JSON.parse(response.body).error, 'invalid_credentials');
  }, 400, { error_code: 'invalid_credentials' });
});

for (const access of ['', '__Host-sc_access=expired.access; ']) {
  test('refresh restores a session when the access cookie is ' + (access ? 'expired' : 'absent'), async () => {
    await backend(async calls => {
      const response = await handler({ httpMethod: 'GET', headers: { cookie: access + '__Host-sc_refresh=valid.refresh' } });
      assert.equal(response.statusCode, 200);
      assert.equal(JSON.parse(response.body).student.email, user.email);
      const refresh = calls.filter(c => c.url.includes('grant_type=refresh_token'));
      assert.equal(refresh.length, 1);
      assert.deepEqual(JSON.parse(refresh[0].body), { refresh_token: 'valid.refresh' });
      assert.equal(calls.filter(c => c.url.endsWith('/user')).length, access ? 1 : 0);
      assert.equal(calls.filter(c => c.url.includes('/rest/')).length, 1);
      const cookies = response.multiValueHeaders['set-cookie'];
      assert.match(cookies[0], /__Host-sc_access=new.access;.*HttpOnly; Secure/);
      assert.match(cookies[1], /__Host-sc_refresh=new.refresh;.*HttpOnly; Secure/);
      assert.doesNotMatch(response.body, /new.access|new.refresh/);
    }, 200, user, 204, (url, options) => {
      if (url.includes('grant_type=refresh_token')) return Response.json({ user, access_token: 'new.access', refresh_token: 'new.refresh', expires_in: 3600 });
      if (url.endsWith('/user') && options.headers.authorization === 'Bearer expired.access') return Response.json({ code: 'bad_jwt' }, { status: 401 });
    });
  });
}

test('a rejected refresh token clears stale cookies and never syncs a student', async () => {
  await backend(async calls => {
    const response = await handler({ httpMethod: 'GET', headers: { cookie: '__Host-sc_refresh=revoked.refresh' } });
    assert.equal(response.statusCode, 401);
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.includes('grant_type=refresh_token'));
    assert.ok(response.multiValueHeaders['set-cookie'].every(c => c.includes('Max-Age=0')));
  }, 400, { code: 'refresh_token_not_found' });
});

test('anonymous requests do not contact Auth or the database', async () => {
  await backend(async calls => {
    const response = await handler({ httpMethod: 'GET', headers: {} });
    assert.equal(response.statusCode, 401);
    assert.equal(JSON.parse(response.body).error, 'student_auth_required');
    assert.equal(calls.length, 0);
  });
});

test('Auth outage does not trigger refresh or discard a potentially valid session', async () => {
  await backend(async calls => {
    const response = await handler({ httpMethod: 'GET', headers: { cookie: '__Host-sc_access=valid.access; __Host-sc_refresh=valid.refresh' } });
    assert.equal(response.statusCode, 503);
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.endsWith('/user'));
    assert.equal(response.multiValueHeaders, undefined);
  }, 503, {});
});

test('a malformed refresh response cannot become a session', async () => {
  await backend(async calls => {
    const response = await handler({ httpMethod: 'GET', headers: { cookie: '__Host-sc_refresh=valid.refresh' } });
    assert.equal(response.statusCode, 401);
    assert.equal(calls.length, 1);
    assert.ok(response.multiValueHeaders['set-cookie'].every(c => c.includes('Max-Age=0')));
  }, 200, { access_token: 'incomplete.access' });
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
