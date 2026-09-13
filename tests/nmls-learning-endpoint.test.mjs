import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, copyFile, readdir, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import handler, { config } from '../netlify/functions/student-nmls-learning.mts';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { NMLS_POLICY_DIGEST } from '../netlify/functions/_lib/nmls-policy-transaction.mjs';
import { NMLS_SESSION_POLICY } from '../config/nmls/session-policy.mjs';

// Synthetic identity and read-only SQL-shaped discovery response. This proves
// the HTTP/packaging boundary, not attendance, identity assurance or approval.
// The separate snapshot/transaction suites execute actual023–041 SQL histories.
test('learning endpoint uses existing Supabase identity, strict HTTP and a private packaged source', async t => {
  const originalFetch = globalThis.fetch;
  const envNames = ['STATECOURSE_BASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const previousEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
  const origin = 'https://statecourse.test', api = `${origin}/api/student/nmls/learning-review`;
  process.env.STATECOURSE_BASE_URL = origin;
  process.env.SUPABASE_URL = 'https://nmls-endpoint-test.invalid';
  process.env.SUPABASE_ANON_KEY = 'synthetic-anon';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'synthetic-service';
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const name of envNames) {
      if (previousEnv[name] === undefined) delete process.env[name]; else process.env[name] = previousEnv[name];
    }
  });
  assert.equal(config.path, '/api/student/nmls/learning-review');
  const actor = randomUUID(), grantId = randomUUID();
  const course = getNmlsReviewCourse('nmls-2026-national-comprehensive-private-review-v3');
  const user = { id: actor, email: 'synthetic-review@example.test', user_metadata: { studentId: randomUUID(), role: 'owner' } };
  const time = Date.UTC(2026, 8, 12, 12);
  const snapshot = {
    version: 'nmls-learning-snapshot-private-v1',
    grant: { id: grantId, studentId: actor, courseKey: course.id, contentDigest: course.digest,
      accessMode: 'non_credit_review', status: 'active', expiresAtMs: Date.UTC(2026, 11, 31) },
    binding: { policyId: NMLS_SESSION_POLICY.id, policyDigest: NMLS_POLICY_DIGEST, offering: {
      id: grantId, contentDigest: course.digest, year: 2026, educationType: 'annual_ce', timeZone: 'UTC',
      deadlineBasisId: 'SYNTHETIC-NOT-APPROVAL', opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
      rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true, evidenceId: 'SYNTHETIC-NOT-REAL-ROCS' },
    } },
    phase: 'not_started', status: 'not_started', serverTimeMs: time,
    cursor: { grantId, attemptId: null, firstFinalId: null, secondFinalId: null, sourceRevision: null,
      finalRevision: null, workflowRevision: null, runtimeRevision: null, actorRevision: null },
    sourceProgress: null, teachingProgress: null, sourceLayout: null, teachingLayout: null,
  };
  let calls = [], dbError = null;
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  globalThis.fetch = async (url, options = {}) => {
    const target = new URL(url);
    assert.equal(target.origin, 'https://nmls-endpoint-test.invalid');
    calls.push(target.pathname);
    if (target.pathname === '/auth/v1/user') return options.headers.authorization === 'Bearer expired' ? json({}, 401) : json(user);
    if (target.pathname === '/auth/v1/token') return json({ access_token: 'fresh-access', refresh_token: 'fresh-refresh', expires_in: 3600, user });
    if (target.pathname === '/rest/v1/students') {
      assert.equal(JSON.parse(options.body).id, actor);
      return new Response(null, { status: 204 });
    }
    if (target.pathname === '/rest/v1/rpc/nmls_learning_snapshot') {
      assert.deepEqual(JSON.parse(options.body), { p_student_id: actor, p_grant_id: grantId });
      return dbError ? json({ message: dbError }, 500) : json(snapshot);
    }
    throw Error(`Unexpected synthetic request ${target.pathname}`);
  };
  const intent = { operation: 'snapshot', command: { grantId } };
  const request = (body = intent, headers = {}) => new Request(api, {
    method: 'POST', headers: { origin, 'content-type': 'application/json', authorization: 'Bearer fixture', ...headers },
    body: JSON.stringify(body),
  });
  const noPrivateData = value => assert.doesNotMatch(JSON.stringify(value),
    /correctChoice|rationale|sourceRefs|questionIds|optionOrder|documentDigest|evidenceId|fullDocumentVerified|SYNTHETIC-NOT|"ledger"|"answers"|"sessionId"/);

  await t.test('verified actor reaches discovery; no bootstrap, lesson, exam or credit', async () => {
    calls = [];
    const response = await handler(request()), body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.phase, 'not_started'); assert.equal(body.cursor.attemptId, null);
    assert.equal(body.course.id, course.id); assert.equal(body.progress.totalUnitCount, 45);
    for (const key of ['deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed']) assert.equal(body[key], false);
    assert.equal(body.advisory, true); noPrivateData(body);
    assert.deepEqual(calls, ['/auth/v1/user', '/rest/v1/students', '/rest/v1/rpc/nmls_learning_snapshot']);
    assert.equal(response.headers.get('cache-control'), 'no-store, private');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  });
  await t.test('existing refresh session emits only secure HTTP-only cookies', async () => {
    const response = await handler(request(intent, { authorization: 'Bearer expired', cookie: '__Host-sc_refresh=refresh-fixture' }));
    assert.equal(response.status, 200);
    const cookies = response.headers.getSetCookie(); assert.equal(cookies.length, 2);
    for (const cookie of cookies) assert.match(cookie, /Path=\/; HttpOnly; Secure; SameSite=Lax/);
    assert.ok(cookies.some(c => c.startsWith('__Host-sc_access=fresh-access;')));
    assert.ok(cookies.some(c => c.startsWith('__Host-sc_refresh=fresh-refresh;')));
    assert.doesNotMatch(JSON.stringify(await response.json()), /fresh-access|fresh-refresh/);
  });
  await t.test('wrong method, origin, type and invalid body reject before authentication', async () => {
    const headers = { origin, 'content-type': 'application/json', authorization: 'Bearer fixture' };
    for (const [req, status] of [
      [new Request(api), 405], [request(intent, { origin: 'https://attacker.test' }), 403],
      [request(intent, { origin: '' }), 403], [request(intent, { 'content-type': 'text/plain' }), 415],
      [request(intent, { 'content-type': 'application/json; charset=utf-16' }), 415],
      [new Request(api, { method: 'POST', headers, body: '{broken' }), 400],
      [new Request(api, { method: 'POST', headers, body: new Uint8Array([0x22, 0xc3, 0x28, 0x22]) }), 400],
    ]) {
      calls = []; const response = await handler(req); assert.equal(response.status, status);
      assert.deepEqual(calls, []); if (status === 405) assert.equal(response.headers.get('allow'), 'POST');
    }
    assert.equal((await handler(request(intent, { authorization: '' }))).status, 401);
  });
  await t.test('actual streamed size cannot be bypassed with a missing or understated Content-Length', async () => {
    for (const contentLength of [undefined, '1', '16384']) {
      calls = []; let canceled = false;
      const body = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(9000)); }, cancel() { canceled = true; } });
      const headers = { origin, 'content-type': 'application/json' };
      if (contentLength !== undefined) headers['content-length'] = contentLength;
      const response = await handler(new Request(api, { method: 'POST', headers, body, duplex: 'half' }));
      assert.equal(response.status, 413); assert.equal(canceled, true); assert.deepEqual(calls, []);
    }
    calls = [];
    assert.equal((await handler(request(intent, { 'content-length': '16385' }))).status, 413);
    assert.deepEqual(calls, []);
  });
  await t.test('untrusted operation, actor, clock, setup or answer injection never reaches RPC', async () => {
    for (const body of [
      { ...intent, studentId: actor }, { ...intent, command: { grantId, studentId: actor } },
      { ...intent, command: { grantId, answers: {} } }, { ...intent, command: { grantId, receivedAtMs: 0 } },
      ...['start', 'bind', 'present_rocs', 'provision', '__proto__'].map(operation => ({ operation, command: { grantId } })),
    ]) {
      calls = []; const response = await handler(request(body)); assert.equal(response.status, 400);
      assert.deepEqual(calls, ['/auth/v1/user', '/rest/v1/students']);
    }
  });
  await t.test('recognized denial is safe; raw SQL, embedded tokens and missing configuration stay opaque', async () => {
    try {
      for (const [message, status, code] of [
        ['nmls_learning_snapshot_access_denied', 403, 'nmls_learning_snapshot_access_denied'],
        ['nmls_learning_snapshot_requires_review', 409, 'nmls_learning_snapshot_requires_review'],
        ['password=PRIVATE host=10.0.0.1', 503, 'nmls_learning_snapshot_unavailable'],
        ['nmls_learning_snapshot_access_denied: PRIVATE', 503, 'nmls_learning_snapshot_unavailable'],
      ]) {
        dbError = message;
        const response = await handler(request()), body = await response.json();
        assert.equal(response.status, status); assert.equal(body.code, code); assert.doesNotMatch(JSON.stringify(body), /PRIVATE|10\.0/);
      }
    } finally { dbError = null; }
    const before = process.env.SUPABASE_ANON_KEY;
    try {
      delete process.env.SUPABASE_ANON_KEY;
      const response = await handler(request()); assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { error: 'nmls_learning_unavailable' });
    } finally { process.env.SUPABASE_ANON_KEY = before; }
  });
  await t.test('isolated function bundle loads only privately packaged pinned banks and unchanged45-unit course', async () => {
    const previousCwd = process.cwd(), root = path.resolve(import.meta.dirname, '..');
    const dir = await mkdtemp(path.join(tmpdir(), 'nmls-learning-package-'));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const toml = await readFile(path.join(root, 'netlify.toml'), 'utf8');
    // Shared private inputs are packaged globally for student and console functions.
    const section = toml.split('[functions]')[1].split(/\n\[/)[0];
    const included = [...section.matchAll(/"(nmls\/[^"]+)"/g)].map(m => m[1]);
    assert.ok(included.includes('nmls/curriculum/*.md'));
    const curriculum = (await readdir(path.join(root, 'nmls/curriculum')))
      .filter(file => /^(?:federal-2026-F0\d|ethics-2026-E0\d|nontraditional-2026-N0\d|general-2026-G0\d)-.*\.md$/.test(file));
    assert.equal(curriculum.length, 11);
    await mkdir(path.join(dir, 'nmls/curriculum'), { recursive: true });
    await mkdir(path.join(dir, 'nmls/assessment/2026'), { recursive: true });
    for (const file of curriculum) await copyFile(path.join(root, 'nmls/curriculum', file), path.join(dir, 'nmls/curriculum', file));
    const banks = included.filter(file => file.startsWith('nmls/assessment/') && file.endsWith('.json')); assert.equal(banks.length, 4);
    for (const file of banks) await copyFile(path.join(root, file), path.join(dir, file));
    // The actual handler is built unmodified. A separate temporary server-only
    // probe tests the same pinned loader without inventing a completed source.
    await build({ entryPoints: {
      handler: path.join(root, 'netlify/functions/student-nmls-learning.mts'),
      privateContentProbe: path.join(root, 'lib/nmls-final-authoring-content.mjs'),
    }, bundle: true, platform: 'node', format: 'esm', outdir: dir, outExtension: { '.js': '.mjs' } });
    try {
      process.chdir(dir);
      const packed = await import(pathToFileURL(path.join(dir, 'handler.mjs')).href);
      const response = await packed.default(request()); assert.equal(response.status, 200);
      const body = await response.json(); assert.equal(body.progress.totalUnitCount, 45); noPrivateData(body);
      const probeUrl = pathToFileURL(path.join(dir, 'privateContentProbe.mjs')).href;
      const probe = await import(probeUrl);
      for (const key of Object.keys(probe.NMLS_FINAL_AUTHORING_BLUEPRINTS)) {
        const definition = probe.getNmlsDraftFinalDefinition(key);
        assert.equal(definition.items.length, 50); assert.equal(definition.studentDeliveryEnabled, false);
        assert.equal(definition.creditIssuanceAllowed, false);
      }
      const bank = banks[0], bytes = await readFile(path.join(dir, bank));
      await writeFile(path.join(dir, bank), Buffer.concat([bytes, Buffer.from('\n')]));
      const altered = await import(`${probeUrl}?altered`);
      assert.throws(() => altered.getNmlsDraftFinalDefinition(course.id), /nmls_final_authoring_content_invalid/);
      await rm(path.join(dir, bank));
      const missing = await import(`${probeUrl}?missing`);
      assert.throws(() => missing.getNmlsDraftFinalDefinition(course.id), /ENOENT/);
    } finally { process.chdir(previousCwd); }
  });
});
