import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createPhoneNotificationHandler, SCHOOL_AGENT, SCHOOL_NUMBER, SCHOOL_MESSAGE_ID, PHONE_FORM, PHONE_RECIPIENT, schoolCallFields } from '../netlify/functions/_lib/phone-notifications.mjs';

const secret = 'local-test-signing-secret';
const clock = 1795285800000;
const event = () => ({ type: 'post_call_transcription', data: {
  agent_id: SCHOOL_AGENT, conversation_id: 'conv_local_phone_test',
  metadata: { start_time_unix_secs: clock / 1000, call_duration_secs: 61,
    phone_call: { type: 'twilio', direction: 'inbound', agent_number: SCHOOL_NUMBER, external_number: '+12025550146' } },
  analysis: { transcript_summary: 'The caller wants help registering for free mortgage practice in California.',
    data_collection_results: { statecourse_school_message: { value: 'Name: QA caller; California Mortgage/NMLS practice; callback requested.' } } },
  transcript: [{ role: 'user', message: 'How do I register?' }, { role: 'agent', message: 'Visit statecourse.com.' }, { role: 'tool', message: 'private tool metadata' }],
} });
const request = (value = event(), options = {}) => {
  const body = options.body ?? JSON.stringify(value);
  const t = String(options.timestamp ?? clock / 1000);
  const signature = createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  return new Request('https://statecourse.com/api/phone/post-call', { method: 'POST', headers: {
    'content-type': 'application/json', 'elevenlabs-signature': `t=${t},v0=${signature}`, ...options.headers,
  }, body });
};
const setup = (options = {}) => {
  const sent = [], receipts = new Map();
  const handler = createPhoneNotificationHandler({ getSecret: () => secret, now: () => clock,
    getStore: () => ({ get: async key => receipts.get(key) ?? null, setJSON: async (key, value) => receipts.set(key, value) }),
    submit: async fields => { sent.push(fields); return { ok: true }; }, ...options });
  return { handler, sent, receipts };
};

test('signed school call produces a bounded email record with contacts, transcript and protected recording link', async () => {
  const { handler, sent, receipts } = setup();
  assert.equal((await handler(request())).status, 200);
  assert.equal(sent.length, 1);
  assert.equal(sent[0]['form-name'], PHONE_FORM);
  assert.equal(sent[0].caller_number, '+12025550146');
  assert.match(sent[0].message, /callback requested/);
  assert.match(sent[0].transcript, /Caller: How do I register/);
  assert.doesNotMatch(sent[0].transcript, /private tool/);
  assert.match(sent[0].conversation_link, /^https:\/\/elevenlabs.io\/app\/agents\/agents\//);
  assert.deepEqual([...receipts.values()], [{ acceptedAt: clock }]);
  assert.equal(PHONE_RECIPIENT, 'info@statecourse.com');
});

test('missing configuration, signatures, tampering, stale/future requests and malformed signatures cannot send mail', async () => {
  assert.equal((await setup({ getSecret: () => '' }).handler(request())).status, 503);
  const { handler, sent } = setup();
  for (const req of [request(undefined, { headers: { 'elevenlabs-signature': '' } }),
    request(undefined, { timestamp: clock / 1000 - 301 }), request(undefined, { timestamp: clock / 1000 + 301 }),
    request(undefined, { headers: { 'elevenlabs-signature': `t=${clock / 1000},v0=short` } })]) assert.equal((await handler(req)).status, 401);
  const signed = request();
  const headers = signed.headers;
  assert.equal((await handler(new Request(signed.url, { method: 'POST', headers, body: JSON.stringify({ ...event(), extra: 'changed' }) }))).status, 401);
  assert.equal(sent.length, 0);
});

test('school contact extraction survives analysis-item IDs and result-list payloads without forwarding unrelated data points', () => {
  for (const shape of ['id-map', 'result-list']) {
    const value = event();
    const result = { data_collection_id: SCHOOL_MESSAGE_ID, value: 'Name: internal QA; email: info@statecourse.com; no callback.' };
    value.data.analysis.data_collection_results = shape === 'id-map' ? { [SCHOOL_MESSAGE_ID]: result } : {};
    if (shape === 'result-list') value.data.analysis.data_collection_results_list = [result, { data_collection_id: 'unrelated', value: 'do not forward this field' }];
    assert.match(schoolCallFields(value).message, /email: info@statecourse.com/);
    assert.doesNotMatch(schoolCallFields(value).message, /do not forward/);
  }
});

test('other agents, numbers, outbound calls and other event types cannot reach the school email', async () => {
  const { handler, sent } = setup();
  const variants = [event(), event(), event(), event(), event()];
  variants[0].data.agent_id = 'other-agent';
  variants[1].data.metadata.phone_call.agent_number = '+12025550199';
  variants[2].data.metadata.phone_call.direction = 'outbound';
  variants[3].type = 'post_call_audio';
  variants[4].data.conversation_id = '../../other';
  for (const value of variants) assert.equal((await (await handler(request(value))).json()).result, 'outside_school_scope');
  assert.equal(sent.length, 0);
});

test('accepted sequential retries are suppressed without storing caller data', async () => {
  const { handler, sent, receipts } = setup();
  await handler(request());
  const response = await handler(request());
  assert.equal((await response.json()).result, 'already_accepted');
  assert.equal(sent.length, 1);
  assert.doesNotMatch(JSON.stringify([...receipts.values()]), /202555|California|caller/);
});

test('submission failure is retryable and does not create a successful receipt', async () => {
  const { handler, receipts } = setup({ submit: async () => ({ ok: false }) });
  assert.equal((await handler(request())).status, 502);
  assert.equal(receipts.size, 0);
  const broken = setup({ submit: async () => { throw new Error('private-provider-detail'); } });
  assert.equal(await (await broken.handler(request())).text(), '{"result":"notification_temporarily_unavailable"}');
});

test('non-POST, invalid JSON, wrong media type and oversized bodies are refused', async () => {
  const { handler, sent } = setup();
  assert.equal((await handler(new Request('https://statecourse.com/api/phone/post-call'))).status, 405);
  assert.equal((await handler(request(undefined, { body: '{' }))).status, 400);
  assert.equal((await handler(request(undefined, { headers: { 'content-type': 'text/plain' } }))).status, 415);
  assert.equal((await handler(request(undefined, { headers: { 'content-length': '1048577' } }))).status, 413);
  assert.equal((await handler(request(undefined, { body: 'x'.repeat(1048577) }))).status, 413);
  assert.equal(sent.length, 0);
});

test('the static form registers every forwarded field and does not let a caller choose the notification recipient', () => {
  const value = event(); value.data.to = 'unrelated@example.invalid';
  const fields = schoolCallFields(value);
  const form = readFileSync(new URL('../public/statecourse/phone-notification-form/index.html', import.meta.url), 'utf8');
  for (const key of Object.keys(fields)) assert.ok(form.includes(`name="${key}"`), key);
  assert.equal(Object.hasOwn(fields, 'to'), false);
  assert.doesNotMatch(JSON.stringify(fields), /unrelated@example.invalid/);
  value.data.transcript = [{ role: 'user', message: 'x'.repeat(200000) }];
  assert.ok(schoolCallFields(value).transcript.length <= 80000);
  assert.match(form, /noindex,nofollow/);
});
