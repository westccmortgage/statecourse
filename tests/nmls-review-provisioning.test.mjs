import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { provisionReviewGrant, publicProvisionError } from '../scripts/provision-nmls-review-grant.mjs';
const now = Date.parse('2026-09-10T18:00:00Z');
const options = () => ({ 'student-id': randomUUID(), 'operator-student-id': randomUUID(), 'grant-id': randomUUID(),
  'course-key': 'nmls-2026-f01-private-review', 'expires-at': '2026-10-10T18:00:00Z', evidence: 'Synthetic authorized test fixture',
  'expect-project-ref': 'abcdefghijklmnopqrst' });
const env = { SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-not-a-real-key' };
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
function api({ existing = null, missingAccount = false, missingStudent = false, brokenReadback = false, wrongIdentity = false } = {}) {
  const calls = []; let created;
  return { calls, get created() { return created; }, fetcher: async (url, init) => {
    assert.ok(url.startsWith(env.SUPABASE_URL)); calls.push({ path: new URL(url).pathname, method: init.method, body: init.body });
    assert.equal(init.headers.apikey, env.SUPABASE_SERVICE_ROLE_KEY);
    if (url.includes('/auth/v1/admin/users/')) return missingAccount ? response({}, 404) : response({ id: wrongIdentity ? randomUUID() : url.split('/').at(-1), email_confirmed_at: '2026-09-01T00:00:00Z' });
    if (url.includes('/students?')) return response(missingStudent ? [] : [{ id: new URL(url).searchParams.get('id').replace('eq.', '') }]);
    if (url.includes('/rpc/nmls_review_list')) return response([]);
    if (init.method === 'POST') { created = JSON.parse(init.body); return response([created], 201); }
    return response(created ? brokenReadback ? [] : [created] : existing ? [existing] : []);
  } };
}
test('review grant dry run makes zero network calls and needs no credentials', async () => {
  const plan = await provisionReviewGrant(options(), { now, clock: () => now, env: {}, fetcher: () => { throw new Error('must not call'); } });
  assert.equal(plan.operation, 'plan_only_no_network'); assert.equal(plan.grant.access_mode, 'non_credit_review');
  assert.match(plan.grant.content_digest, /^[a-f0-9]{64}$/); assert.match(plan.studyUrl, /^https:\/\/statecourse.com\/student\/nmls-review\//);
});
test('grant apply requires explicit authority confirmation and verified project before network', async () => {
  const input = options(); let calls = 0;
  const fetcher = () => { calls++; throw new Error('unexpected'); };
  await assert.rejects(() => provisionReviewGrant({ ...input, apply: true }, { now, clock: () => now, env, fetcher }), /apply_confirmation_required/);
  await assert.rejects(() => provisionReviewGrant({ ...input, apply: true, 'confirm-private-review-grant': true }, { now, clock: () => now, env: { ...env, SUPABASE_URL: 'https://attacker.test' }, fetcher }), /project_mismatch/);
  assert.equal(calls, 0);
});
test('expired and indefinite/over90-day grants are rejected', async () => {
  for (const expiry of ['2026-09-09T00:00:00Z', '2028-01-01T00:00:00Z', '2026-10-10', 'never', '2026-09-31T00:00:00Z', '2026-09-30T24:00:00Z']) {
    await assert.rejects(() => provisionReviewGrant({ ...options(), 'expires-at': expiry }, { now }), /invalid_grant_expiry/);
  }
});
test('apply verifies existing identities and students, writes one grant and reads it back', async () => {
  const fixture = api(); const input = { ...options(), apply: true, 'confirm-private-review-grant': true };
  const receipt = await provisionReviewGrant(input, { now, clock: () => now, env, fetcher: fixture.fetcher });
  assert.equal(receipt.result, 'private_grant_created_and_verified'); assert.equal(fixture.created.student_id, input['student-id']);
  const writes = fixture.calls.filter((c) => c.method === 'POST' && !c.path.includes('/rpc/'));
  assert.equal(writes.length, 1); assert.equal(writes[0].path, '/rest/v1/nmls_review_access_grants');
  assert.ok(!fixture.calls.some((c) => /enrollment|password|role_binding/.test(c.path)));
});
test('missing/mismatched account or missing student prevents all grant writes', async () => {
  for (const fixtureOptions of [{ missingAccount: true }, { wrongIdentity: true }, { missingStudent: true }]) {
    const fixture = api(fixtureOptions);
    await assert.rejects(() => provisionReviewGrant({ ...options(), apply: true, 'confirm-private-review-grant': true }, { now, clock: () => now, env, fetcher: fixture.fetcher }), /existing_verified_account_required|student_record_required/);
    assert.equal(fixture.created, undefined);
  }
});
test('identical duplicate is safe; changed/revoked/content-mismatched grant is never overwritten', async () => {
  const input = options(); const plan = await provisionReviewGrant(input, { now });
  for (const changed of [{}, { status: 'revoked' }, { content_digest: 'e'.repeat(64) }, { student_id: randomUUID() }, { evidence: 'Different authority' }]) {
    const fixture = api({ existing: { ...plan.grant, ...changed } });
    const operation = provisionReviewGrant({ ...input, apply: true, 'confirm-private-review-grant': true }, { now, clock: () => now, env, fetcher: fixture.fetcher });
    if (!Object.keys(changed).length) assert.equal((await operation).result, 'existing_identical_grant_verified');
    else await assert.rejects(() => operation, /existing_grant_conflict/);
    assert.equal(fixture.created, undefined);
  }
});
test('read-back failure is not reported as success and raw errors never expose secrets', async () => {
  const fixture = api({ brokenReadback: true });
  await assert.rejects(() => provisionReviewGrant({ ...options(), apply: true, 'confirm-private-review-grant': true }, { now, clock: () => now, env, fetcher: fixture.fetcher }), /grant_readback_failed/);
  assert.equal(publicProvisionError(new Error('password=private host=10.0.0.1')), 'review_provision_unavailable');
});

test('expiry during preflight prevents insert; expiry during write/readback is never called success', async () => {
  for (const expireAt of ['preflight', 'write']) {
    let current = now;
    const fixture = api();
    const input = { ...options(), 'expires-at': '2026-09-10T18:00:05Z', apply: true, 'confirm-private-review-grant': true };
    const fetcher = async (url, init) => {
      const result = await fixture.fetcher(url, init);
      if ((expireAt === 'preflight' && url.includes('/rpc/')) ||
          (expireAt === 'write' && init.method === 'POST' && url.includes('/nmls_review_access_grants'))) current = now + 16000;
      return result;
    };
    await assert.rejects(() => provisionReviewGrant(input, { env, fetcher, clock: () => current }), /invalid_grant_expiry/);
    assert.equal(Boolean(fixture.created), expireAt === 'write');
    // A row expiring while in flight may exist, but runtime SQL independently refuses expired grants.
  }
});

test('expiry during duplicate verification cannot produce an active-grant receipt', async () => {
  let current = now;
  const input = { ...options(), 'expires-at': '2026-09-10T18:00:05Z' };
  const plan = await provisionReviewGrant(input, { now });
  const fixture = api({ existing: plan.grant });
  const fetcher = async (url, init) => {
    const result = await fixture.fetcher(url, init);
    if (url.includes('/nmls_review_access_grants')) current = now + 6000;
    return result;
  };
  await assert.rejects(() => provisionReviewGrant({ ...input, apply: true, 'confirm-private-review-grant': true },
    { env, fetcher, clock: () => current }), /invalid_grant_expiry/);
  assert.equal(fixture.created, undefined);
});
