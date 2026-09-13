import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, copyFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import handler from '../netlify/functions/student-nmls-review.mts';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';

test('NMLS endpoint reuses actual session contract and runs as a packaged function', async (t) => {
  const originalFetch = globalThis.fetch;
  const envNames = ['STATECOURSE_BASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const previousEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const origin = 'https://statecourse.test';
  process.env.STATECOURSE_BASE_URL = origin; process.env.SUPABASE_URL = 'https://nmls-test.invalid';
  process.env.SUPABASE_ANON_KEY = 'synthetic-anon'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'synthetic-service';
  t.after(() => { globalThis.fetch = originalFetch; for (const name of envNames) {
    if (previousEnv[name] === undefined) delete process.env[name]; else process.env[name] = previousEnv[name];
  } });
  const actor = randomUUID(); const attemptId = randomUUID(); const grantId = randomUUID();
  const courseKey = 'nmls-2026-f01-private-review';
  const user = { id: actor, email: 'review-fixture@example.test', user_metadata: { studentId: randomUUID(), role: 'owner' } };
  let calls = [], failDatabase = false;
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  globalThis.fetch = async (url, options = {}) => {
    const target = new URL(url); assert.equal(target.origin, 'https://nmls-test.invalid'); calls.push(target.pathname);
    if (target.pathname === '/auth/v1/user') return options.headers.authorization === 'Bearer expired' ? json({}, 401) : json(user);
    if (target.pathname === '/auth/v1/token') return json({ access_token: 'fresh-access', refresh_token: 'fresh-refresh', expires_in: 3600, user });
    if (target.pathname === '/rest/v1/students') {
      assert.equal(JSON.parse(options.body).id, actor); return new Response(null, { status: 204 });
    }
    if (target.pathname === '/rest/v1/rpc/nmls_review_start') {
      if (failDatabase) return json({ message: 'password=private-internal host=10.0.0.1' }, 500);
      const args = JSON.parse(options.body); assert.equal(args.p_student_id, actor); assert.equal(args.p_grant_id, grantId);
      assert.equal(args.p_initial_runtime.creditIssuanceAllowed, false);
      return json({ attempt: { id: attemptId, runtime: args.p_initial_runtime }, serverTimeMs: Date.now() });
    }
    if (target.pathname === '/rest/v1/rpc/nmls_review_list') {
      assert.deepEqual(JSON.parse(options.body), { p_student_id: actor });
      return json([{ grantId, courseKey, contentDigest: getNmlsReviewCourse(courseKey).digest,
        expiresAt: '2026-10-01T12:00:00Z', status: 'active', evidence: 'private operator note', sessionId: randomUUID() }]);
    }
    throw new Error(`Unexpected fake request path: ${target.pathname}`);
  };
  const request = (body = { kind: 'start', grantId, courseKey }, headers = {}) => new Request(`${origin}/api/student/nmls/review`, {
    method: 'POST', headers: { origin, 'content-type': 'application/json', authorization: 'Bearer fixture', ...headers }, body: JSON.stringify(body),
  });

  await t.test('verified student identity reaches RPC; no approval or enrollment created', async () => {
    calls = []; const response = await handler(request()); const data = await response.json();
    assert.equal(response.status, 200); assert.equal(data.attemptId, attemptId); assert.equal(data.progress.creditIssuanceAllowed, false);
    assert.deepEqual(calls, ['/auth/v1/user', '/rest/v1/students', '/rest/v1/rpc/nmls_review_start']);
    assert.equal(response.headers.get('cache-control'), 'no-store, private');
    assert.ok(!JSON.stringify(data).includes('correctChoice'));
  });
  await t.test('actual refresh contract emits two secure HTTP-only cookies', async () => {
    const response = await handler(request(undefined, { authorization: 'Bearer expired', cookie: '__Host-sc_refresh=refresh-fixture' }));
    assert.equal(response.status, 200);
    const cookies = response.headers.getSetCookie(); assert.equal(cookies.length, 2);
    for (const cookie of cookies) { assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); }
    assert.ok(cookies.some((c) => c.startsWith('__Host-sc_access=fresh-access;')));
  });
  await t.test('assignment discovery uses authenticated actor only and filters private fields', async () => {
    calls = [];
    const response = await handler(request({ kind: 'list' }));
    const data = await response.json();
    assert.equal(response.status, 200); assert.equal(data.reviews.length, 1);
    assert.equal(data.reviews[0].grantId, grantId); assert.equal(data.reviews[0].available, true);
    assert.equal(data.reviews[0].creditIssuanceAllowed, false);
    assert.deepEqual(calls, ['/auth/v1/user', '/rest/v1/students', '/rest/v1/rpc/nmls_review_list']);
    assert.ok(!JSON.stringify(data).includes('private operator note')); assert.equal('sessionId' in data.reviews[0], false);
    calls = [];
    assert.equal((await handler(request({ kind: 'list', studentId: randomUUID() }))).status, 400);
    assert.equal(calls.includes('/rest/v1/rpc/nmls_review_list'), false);
  });
  await t.test('foreign origin, missing auth, wrong method and oversized input refuse safely', async () => {
    calls = []; assert.equal((await handler(request(undefined, { origin: 'https://attacker.test' }))).status, 403); assert.equal(calls.length, 0);
    assert.equal((await handler(request(undefined, { authorization: '' }))).status, 401);
    assert.equal((await handler(new Request(`${origin}/api/student/nmls/review`))).status, 405);
    assert.equal((await handler(request('x'.repeat(17000)))).status, 413);
    assert.equal((await handler(request(undefined, { 'content-type': 'text/plain' }))).status, 415);
    assert.equal((await handler(request({ kind: 'start', grantId, courseKey, studentId: randomUUID() }))).status, 400);
  });
  await t.test('raw backend failure remains private', async () => {
    failDatabase = true;
    try { const response = await handler(request()); assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { error: 'nmls_review_unavailable' });
    } finally { failDatabase = false; }
  });
  await t.test('esbuild bundle resolves included manuscript from packaged task root, not source depth', async () => {
    const previousCwd = process.cwd();
    const root = path.resolve(import.meta.dirname, '..');
    const dir = await mkdtemp(path.join(tmpdir(), 'nmls-function-bundle-'));
    t.after(() => rm(dir, { recursive: true, force: true }));
    await mkdir(path.join(dir, 'nmls/curriculum'), { recursive: true });
    const included = (await readdir(path.join(root, 'nmls/curriculum'))).filter(file => /^(?:federal-2026-F0\d|ethics-2026-E0\d|nontraditional-2026-N0\d|general-2026-G0\d)-.*\.md$/.test(file));
    assert.equal(included.length, 11);
    for (const file of included) await copyFile(path.join(root, 'nmls/curriculum', file), path.join(dir, 'nmls/curriculum', file));
    const outfile = path.join(dir, 'student-nmls-review.mjs');
    await build({ entryPoints: [path.join(root, 'netlify/functions/student-nmls-review.mts')], bundle: true, platform: 'node', format: 'esm', outfile });
    try {
      process.chdir(dir);
      const packed = await import(pathToFileURL(outfile).href);
      const response = await packed.default(request());
      assert.equal(response.status, 200); assert.equal((await response.json()).attemptId, attemptId);
      const national = await packed.default(request({ kind: 'start', grantId, courseKey: 'nmls-2026-national-comprehensive-private-review' }));
      assert.equal(national.status, 200);
      const data = await national.json();
      assert.equal(data.progress.modules.length, 8); assert.equal(data.progress.creditIssuanceAllowed, false);
      assert.equal(data.progress.lessons.length, 0); assert.doesNotMatch(JSON.stringify(data), /correctChoice/);
      const v2 = await packed.default(request({ kind: 'start', grantId, courseKey: 'nmls-2026-national-comprehensive-private-review-v2' }));
      assert.equal(v2.status, 200);
      const practiceData = await v2.json();
      assert.equal(practiceData.progress.modules.flatMap(m => m.units).length, 45);
      assert.equal(practiceData.progress.lessons.length, 0);
      assert.doesNotMatch(JSON.stringify(practiceData), /correctChoice|Cedar Point|Harbor Oak|Marlow/);
    } finally { process.chdir(previousCwd); }
  });
});
