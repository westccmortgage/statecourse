import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ReviewClient, postReview } from '../public/statecourse/student/nmls-review/review-client.mjs';
import { renderLessonMarkdown } from '../public/statecourse/student/nmls-review/lesson-markdown.mjs';
import { presentOptions } from '../public/statecourse/student/nmls-review/question-presentation.mjs';

const grant = { grantId: randomUUID(), courseKey: 'test-review' };
const attemptId = randomUUID();
const progress = (revision = 0, extra = {}) => ({ mode: 'non_credit_review', creditIssuanceAllowed: false,
  contentDigest: 'a'.repeat(64), courseKey: grant.courseKey, revision, status: 'active', sessionId: randomUUID(),
  title: 'Synthetic private review', completedReviewMs: 0, provisionalReviewMs: 0,
  modules: [], lessons: [], completedUnitIds: [], passedModuleIds: [], ...extra });
const result = (p, extra = {}, status = 200) => ({ status, body: { progress: p, attemptId, ...extra } });
const tick = () => new Promise((resolve) => setImmediate(resolve));
async function ready(transport) {
  const calls = []; let opening = true;
  const client = new ReviewClient({ transport: async (input) => {
    calls.push(structuredClone(input)); if (opening) { opening = false; return result(progress(0, { sessionId: null })); }
    return transport(input);
  }, newId: randomUUID });
  await client.open(grant); return { client, calls };
}

test('opening or reloading never resumes a lease automatically', async () => {
  const { client, calls } = await ready(() => { throw new Error('unexpected'); });
  assert.deepEqual(calls, [{ kind: 'start', grantId: grant.grantId, courseKey: grant.courseKey }]);
  assert.equal(client.view.progress.sessionId, null);
  assert.deepEqual(await client.send('heartbeat', { visible: true }), { cancelled: true });
});

test('queued writes snapshot revision and lease at dispatch, not at enqueue', async () => {
  let release;
  const { client, calls } = await ready((input) => input.kind === 'heartbeat' ? new Promise((r) => { release = r; }) : result(progress(input.expectedRevision + 1, { sessionId: 'new-lease' })));
  await client.send('resume');
  const first = client.send('heartbeat', { visible: true });
  const second = client.send('unit_action', { choice: 'A' });
  release(result(progress(2, { sessionId: 'new-lease' })));
  await first; await second;
  assert.equal(calls[2].expectedRevision, 1); assert.equal(calls[2].sessionId, 'new-lease');
  assert.equal(calls[3].expectedRevision, 2); assert.equal(calls[3].sessionId, 'new-lease');
  assert.notEqual(calls[2].eventId, calls[3].eventId);
});

test('lost answer response freezes payload and retries same event even if source draft changes', async () => {
  let fail = true;
  const { client, calls } = await ready((input) => {
    if (input.kind === 'resume') return result(progress(1));
    if (fail) { fail = false; throw new Error('network'); }
    return result(progress(2), { code: 'module_review_passed', duplicate: true });
  });
  await client.send('resume'); const answers = { Q01: 'A', Q02: 'B' };
  const pending = client.send('quiz_submit', { quizId: 'quiz-1', answers }); await tick();
  answers.Q01 = 'D';
  assert.equal(client.view.phase, 'uncertain');
  assert.deepEqual(await client.send('heartbeat', { visible: true }, { background: true }), { cancelled: true });
  await client.retry(); await pending;
  assert.deepEqual(calls[2], calls[3]); assert.equal(calls[3].answers.Q01, 'A');
  assert.equal(client.view.phase, 'ready'); assert.equal(client.view.progress.revision, 2);
});

test('background polls coalesce without delaying an explicit answer', async () => {
  let release;
  const { client, calls } = await ready((input) => input.kind === 'resume' ? result(progress(1)) : input.kind === 'heartbeat' ?
    new Promise((r) => { release = r; }) : result(progress(3)));
  await client.send('resume'); const poll = client.send('heartbeat', { visible: true }, { background: true });
  assert.deepEqual(await client.send('interaction', { visible: true, observation: 'keyboard' }, { background: true }), { coalesced: true });
  const answer = client.send('unit_action', { choice: 'A' });
  release(result(progress(2))); await poll; await answer;
  assert.equal(calls.length, 4); assert.equal(calls[3].kind, 'unit_action'); assert.equal(calls[3].expectedRevision, 2);
});

test('older idempotent outcome settles but cannot regress an already newer projection', async () => {
  let release;
  const { client } = await ready(() => new Promise((r) => { release = r; }));
  const pending = client.send('resume');
  client.view.progress = progress(9);
  release(result(progress(1), { duplicate: true })); await pending;
  assert.equal(client.view.progress.revision, 9);
});

test('late response after account exit or assignment switch cannot reopen old content', async () => {
  let release;
  const { client } = await ready(() => new Promise((r) => { release = r; }));
  const pending = client.send('resume'); client.stop();
  release(result(progress(1))); await pending; await tick();
  assert.equal(client.view.phase, 'idle'); assert.equal(client.view.progress, null);
});

test('course inactivity401 preserves account recovery; account401 clears private content', async () => {
  let courseIdle = true;
  const { client } = await ready(() => courseIdle ? result(progress(1, { sessionId: null, status: 'logged_out' }), { code: 'course_logout_required' }, 401) :
    { status: 401, body: { error: 'student_auth_required' } });
  await client.send('resume');
  assert.equal(client.view.phase, 'ready'); assert.equal(client.view.code, 'course_logout_required'); assert.ok(client.view.progress);
  courseIdle = false; await client.send('resume');
  assert.equal(client.view.phase, 'auth'); assert.equal(client.view.progress, null);
});

test('session conflict stops queued writes and never silently takes over', async () => {
  let release;
  const { client, calls } = await ready(() => new Promise((r) => { release = r; }));
  const first = client.send('resume'); const queued = client.enqueue({ kind: 'heartbeat', visible: true });
  release({ status: 409, body: { error: 'nmls_review_session_conflict' } });
  await first; assert.deepEqual(await queued, { cancelled: true });
  assert.equal(client.view.phase, 'recover'); assert.equal(client.view.progress.sessionId, null); assert.equal(calls.length, 2);
});

test('foreground command is reserved immediately behind a poll; double submit is coalesced', async () => {
  let release;
  const { client, calls } = await ready((input) => input.kind === 'heartbeat' ? new Promise((r) => { release = r; }) : result(progress(input.expectedRevision + 1)));
  await client.send('resume'); const poll = client.send('heartbeat', { visible: true });
  const first = client.send('quiz_submit', { quizId: 'quiz-1', answers: { Q01: 'A' } });
  assert.equal(client.view.foregroundPending, true);
  assert.deepEqual(await client.send('quiz_submit', { quizId: 'quiz-1', answers: { Q01: 'A' } }), { coalesced: true });
  release(result(progress(2))); await poll; await first;
  assert.equal(calls.filter((c) => c.kind === 'quiz_submit').length, 1);
});

test('render callback exception settles delivery and stops invisible queued work', async () => {
  let fatal = false;
  const { client } = await ready(() => result(progress(1)));
  client.onChange = (view) => { if (view.progress?.revision === 1) throw new Error('render failure'); };
  client.onRenderError = () => { fatal = true; };
  await client.send('resume');
  assert.equal(client.view.phase, 'render_error'); assert.equal(client.pending, null); assert.equal(fatal, true);
  assert.deepEqual(await client.send('resume'), { cancelled: true });
});

test('revoked or changed content clears private projection and blocks writes', async () => {
  for (const code of ['nmls_review_access_denied', 'nmls_review_content_changed']) {
    const { client } = await ready(() => ({ status: 403, body: { error: code } }));
    await client.send('resume'); assert.equal(client.view.phase, 'denied'); assert.equal(client.view.progress, null);
    assert.deepEqual(await client.send('resume'), { cancelled: true });
  }
});

test('malformed/5xx/changed-digest responses are uncertain, not a successful save', async () => {
  for (const bad of [{ status: 200, body: {} }, { status: 503, body: { error: 'nmls_review_unavailable' } }, result(progress(1, { contentDigest: 'b'.repeat(64) }))]) {
    const { client } = await ready(() => bad);
    client.send('resume'); await tick(); assert.equal(client.view.phase, 'uncertain'); assert.equal(client.view.progress.revision, 0); client.stop();
  }
});

test('transport has cookies, same-origin endpoint, no-store, JSON and bounded timeout', async () => {
  await postReview({ kind: 'list' }, async (url, options) => {
    assert.equal(url, '/api/student/nmls/review'); assert.equal(options.credentials, 'same-origin'); assert.equal(options.cache, 'no-store');
    assert.equal(options.body, '{"kind":"list"}'); assert.ok(options.signal instanceof AbortSignal);
    return new Response('{"reviews":[]}', { headers: { 'content-type': 'application/json' } });
  });
});

test('lesson rendering preserves legal case and text, escapes HTML and rejects executable links', () => {
  const html = renderLessonMarkdown('## ECOA and the LE\n\nOne line\\\nAnother **important** line.\n\n[CFPB](https://example.test/?x=1&y=2)\n\n<script>alert(1)</script>\n\n[bad](javascript:alert)\n\n| lower case | Code |\n| --- | --- |\n| same | `LE` |');
  assert.match(html, /<h2>ECOA and the LE<\/h2>/); assert.match(html, /One line<br>Another <strong>important<\/strong> line\./);
  assert.match(html, /href="https:\/\/example.test\/\?x=1&amp;y=2"/); assert.match(html, /&lt;script&gt;/);
  assert.ok(!html.includes('<script>')); assert.ok(!html.includes('href="javascript:'));
  assert.match(html, /<th scope="col">lower case<\/th>/); assert.match(html, /<code>LE<\/code>/);
  const hostile = renderLessonMarkdown('[x](https://example.test/"onmouseover="evil)');
  assert.match(hostile, /&quot;/); assert.ok(!hostile.includes(' onmouseover='));
});

test('option presentation shuffles positions, retains server IDs and never mutates the question', () => {
  const options = ['A', 'B', 'C', 'D'].map((id) => ({ id, text: `Option ${id}` }));
  const before = JSON.stringify(options); const displayed = presentOptions(options, () => 0);
  assert.equal(JSON.stringify(options), before);
  assert.deepEqual(displayed.map((o) => o.displayLabel), displayed.map((o) => o.id), 'feedback labels must keep their meaning after shuffling');
  assert.notDeepEqual(displayed.map((o) => o.id), ['A', 'B', 'C', 'D']);
  for (const row of displayed) assert.equal(row.text, options.find((o) => o.id === row.id).text);
});

test('static study shell is private/no-credit, local assets only and contains no private key', () => {
  const base = new URL('../public/statecourse/student/nmls-review/', import.meta.url);
  const html = readFileSync(new URL('index.html', base), 'utf8');
  assert.match(html, /noindex,nofollow/); assert.match(html, /No NMLS credit/);
  assert.match(html, /role="status"/); assert.match(html, /Skip to learning workspace/);
  assert.ok(!/https?:\/\//.test(html)); assert.ok(!/correctChoice|## 7\. Answer key|SUPABASE_SERVICE_ROLE_KEY/.test(html));
  const script = readFileSync(new URL('nmls-review.mjs', base), 'utf8');
  assert.ok(!/localStorage|sessionStorage|courseFor|nmls\/curriculum|location\.replace.*course_logout_required/.test(script));
  assert.match(script, /if \(contentKey !== key\)/); assert.match(script, /event\.isTrusted/);
  assert.ok(!/setInterval\([^]*send\('interaction'/.test(script));
});
