import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import handler, { config } from '../netlify/functions/student-nmls-training.mts';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';

test('free-training HTTP keeps actual student authentication and strict private transport', async t => {
  const originalFetch = globalThis.fetch, names = ['STATECOURSE_BASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const before = Object.fromEntries(names.map(k => [k, process.env[k]]));
  const origin = 'https://training.test', api = `${origin}/api/student/nmls/training`;
  Object.assign(process.env, { STATECOURSE_BASE_URL: origin, SUPABASE_URL: 'https://training-db.invalid',
    SUPABASE_ANON_KEY: 'synthetic-anon', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service' });
  t.after(() => { globalThis.fetch = originalFetch; for (const k of names) { if (before[k] === undefined) delete process.env[k]; else process.env[k] = before[k]; } });
  const actor = randomUUID(), enrollmentId = randomUUID(), user = { id: actor, email: 'training@example.test', user_metadata: { studentId: randomUUID(), role: 'admin' } };
  const course = getNmlsReviewCourse('nmls-2026-national-comprehensive-private-review-v3'), definition = getNmlsDraftFinalDefinition(course.id);
  const snapshot = { enrollmentId, studentId: actor, courseId: 'nmls-ce-2026-comprehensive-8', courseVersion: '2026.3', reviewRole: null,
    contentDigest: course.digest, definitionDigest: definition.digest, revision: 0, runtime: null, serverTimeMs: Date.UTC(2026, 8, 13), event: null };
  let calls = [], dbError = null;
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  globalThis.fetch = async (url, options = {}) => {
    const target = new URL(url); assert.equal(target.origin, 'https://training-db.invalid'); calls.push(target.pathname);
    if (target.pathname === '/auth/v1/user') return options.headers.authorization === 'Bearer expired' ? json({}, 401) : json(user);
    if (target.pathname === '/auth/v1/token') return json({ access_token: 'fresh-access', refresh_token: 'fresh-refresh', expires_in: 3600, user });
    if (target.pathname === '/rest/v1/students') { assert.equal(JSON.parse(options.body).id, actor); return new Response(null, { status: 204 }); }
    if (target.pathname === '/rest/v1/rpc/nmls_training_context') {
      const params=JSON.parse(options.body);
      assert.equal(params.p_student_id,actor);assert.equal(params.p_enrollment_id,enrollmentId);
      return dbError ? json({ message: dbError }, 500) : json(snapshot);
    }
    throw Error(`Unexpected mocked request ${target.pathname}`);
  };
  const input = { operation: 'snapshot', command: { enrollmentId } };
  const request = (body = input, headers = {}) => new Request(api, { method: 'POST', headers: {
    origin, 'content-type': 'application/json', authorization: 'Bearer fixture', ...headers }, body: JSON.stringify(body) });

  await t.test('exact path, authenticated actor and source projection; no enrollment, charge or CE RPC', async () => {
    assert.equal(config.path, '/api/student/nmls/training'); calls = [];
    const response = await handler(request()), body = await response.json();
    assert.equal(response.status, 200); assert.equal(body.phase, 'not_started'); assert.equal(body.mode, 'free_training');
    assert.equal(body.course.id, 'nmls-ce-2026-comprehensive-8'); assert.equal(body.progress.modules.flatMap(m => m.units).length, 45);
    assert.equal(body.creditIssuanceAllowed, false); assert.equal(body.nmlsCreditEligible, false); assert.equal(body.courseCompletionIssued, false);
    assert.deepEqual(calls, ['/auth/v1/user', '/rest/v1/students', '/rest/v1/rpc/nmls_training_context']);
    assert.doesNotMatch(JSON.stringify(body), /correctChoice|definitionDigest|contentDigest|sourceRefs|optionOrder|"answers"|"runtime"|synthetic-service/);
    assert.deepEqual(body.progress.lessons, []); assert.equal(body.assessment, null);
    assert.equal(response.headers.get('cache-control'), 'no-store, private'); assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff'); assert.equal(response.headers.get('access-control-allow-origin'), null);
  });
  await t.test('existing session refresh is retained without leaking tokens', async () => {
    const response = await handler(request(input, { authorization: 'Bearer expired', cookie: '__Host-sc_refresh=fixture-refresh' }));
    assert.equal(response.status, 200); assert.equal(response.headers.getSetCookie().length, 2);
    for (const cookie of response.headers.getSetCookie()) assert.match(cookie, /Path=\/; HttpOnly; Secure; SameSite=Lax/);
    assert.doesNotMatch(JSON.stringify(await response.json()), /fresh-access|fresh-refresh/);
  });
  await t.test('actual authenticated HTTP reviewer reads are course-scoped and every write fails403',async()=>{
    snapshot.reviewRole='regulator_reviewer';
    try {
      calls=[];const response=await handler(request());const body=await response.json();
      assert.equal(response.status,200);assert.equal(body.readOnly,true);assert.equal(body.review.modules.flatMap(m=>m.lessons).length,45);
      assert.doesNotMatch(JSON.stringify(body),/correctChoice|"answers"|"sessionId"/);
      for(const operation of ['teaching','issue_assessment','start_remediation','submit_assessment']) {
        calls=[];const command={enrollmentId,eventId:randomUUID(),expectedRevision:0};
        if(operation==='teaching')command.action={kind:'resume',sessionId:null};
        if(operation==='submit_assessment'){command.assessmentId=randomUUID();command.answers=Object.fromEntries(definition.items.slice(0,25).map(q=>[q.id,'A']));}
        const denied=await handler(request({operation,command}));assert.equal(denied.status,403);
        assert.deepEqual(await denied.json(),{error:'nmls_training_read_only'});
        assert.deepEqual(calls,['/auth/v1/user','/rest/v1/students','/rest/v1/rpc/nmls_training_context']);
      }
    } finally {snapshot.reviewRole=null;}
  });
  await t.test('method, origin, type and malformed UTF8/JSON fail before auth', async () => {
    const headers = { origin, 'content-type': 'application/json', authorization: 'Bearer fixture' };
    for (const [req, status] of [
      [new Request(api), 405], [request(input, { origin: '' }), 403], [request(input, { origin: 'https://evil.test' }), 403],
      [request(input, { 'content-type': 'text/plain' }), 415], [request(input, { 'content-type': 'application/json; charset=utf-16' }), 415],
      [new Request(api, { method: 'POST', headers, body: '{' }), 400],
      [new Request(api, { method: 'POST', headers, body: new Uint8Array([0x22, 0xc3, 0x28, 0x22]) }), 400],
    ]) { calls = []; const response = await handler(req); assert.equal(response.status, status); assert.deepEqual(calls, []); }
    assert.equal((await handler(request(input, { authorization: '' }))).status, 401);
  });
  await t.test('actual streamed bytes enforce16KiB, including lying Content-Length', async () => {
    for (const length of [undefined, '1', '16384']) {
      calls = []; let canceled = false;
      const body = new ReadableStream({ pull(c) { c.enqueue(new Uint8Array(9000)); }, cancel() { canceled = true; } });
      const headers = { origin, 'content-type': 'application/json' }; if (length !== undefined) headers['content-length'] = length;
      const response = await handler(new Request(api, { method: 'POST', headers, body, duplex: 'half' }));
      assert.equal(response.status, 413); assert.equal(canceled, true); assert.deepEqual(calls, []);
    }
  });
  await t.test('client actor/clock/runtime/CE setup cannot reach any RPC', async () => {
    for (const body of [
      { ...input, studentId: actor }, { ...input, command: { enrollmentId, runtime: {} } },
      { ...input, command: { enrollmentId, serverTimeMs: 0 } }, { ...input, command: { enrollmentId, studentId: actor } },
      ...['enroll', 'bind', 'present_rocs', 'accept_rocs', 'approve', 'charge'].map(operation => ({ operation, command: { enrollmentId } })),
    ]) {
      calls = []; assert.equal((await handler(request(body))).status, 400);
      assert.deepEqual(calls, ['/auth/v1/user', '/rest/v1/students']);
    }
  });
  await t.test('only finite exact denial/error tokens are public', async () => {
    try {
      for (const [message, status, expected] of [
        ['nmls_training_access_denied', 403, 'nmls_training_access_denied'],
        ['nmls_training_revision_conflict', 409, 'nmls_training_revision_conflict'],
        ['nmls_training_access_denied SECRET', 503, 'nmls_training_unavailable'],
        ['password=SECRET', 503, 'nmls_training_unavailable'],
      ]) {
        dbError = message; const response = await handler(request()); assert.equal(response.status, status);
        assert.deepEqual(await response.json(), { error: expected });
      }
    } finally { dbError = null; }
  });
});
