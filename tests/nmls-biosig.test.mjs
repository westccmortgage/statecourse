import test from 'node:test';
import assert from 'node:assert/strict';
import crypto, { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import BioSigInterfaceHelper from '../netlify/functions/_lib/biosig/interface-helper.mjs';
import { BIOSIG_REQUIRED, biosigConfig, nmlsBiosigCourseFields } from '../config/nmls/biosig.mjs';
import { resolveBiosigUid } from '../netlify/functions/_lib/biosig/identifier.mjs';
import { buildInboundUrl, buildNmlsArgumentString, buildSsoResponseXml, CHALLENGE_ARGUMENT, decryptCallbackArgs, parseSsoResponseXml,
  requestBiosigRedirect, validationSucceeded } from '../netlify/functions/_lib/biosig/sso.mjs';
import { checkpointD3, createChallengeStore, dueCheckpoint, dueStudyCheckpoint, identityGate, identityStatus, requirementFor,
  CHALLENGE_LIFETIME_MS, VERIFIED_LIFETIME_MS } from '../netlify/functions/_lib/biosig/checkpoints.mjs';
import identityHandler, { config as identityConfig } from '../netlify/functions/student-nmls-identity.mts';
import callbackHandler, { config as callbackConfig } from '../netlify/functions/biosig-callback.mts';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
// The defaults printed in BSI's own sample config. Public placeholders, not credentials.
const SAMPLE = { BIOSIG_SYSTEM_ID: 'SID', BIOSIG_CUSTOMER_ID: 'CID', BIOSIG_SHARED_CODE: 'SC', BIOSIG_PASS: 'random-pass-guid-code',
  BIOSIG_SALT: 'random-salt-guid-code', BIOSIG_VECTOR: 'random-vector-16', BIOSIG_PARTNER: 'partner' };
const ready = (extra = {}) => biosigConfig({ ...SAMPLE, ...extra });
const NMLS = 'nmls-ce-2026-comprehensive-8';

test("the helper reproduces BSI's own sample byte for byte", () => {
  const helper = new BioSigInterfaceHelper(SAMPLE.BIOSIG_PASS, SAMPLE.BIOSIG_SALT);
  // Both values below were produced by running BSI's original bioSigInterfaceHelper.js
  // (custom.code.zip, Samples/NodeJS) with the sample defaults.
  assert.equal(helper._key.toString('hex'), 'e4d80aad16dbaee733c138f2bc775b57');
  const args = helper.generateArgumentString('SC', 'SID', 'CID', 'en_US', false, 'me@example.com', 'John', 'Doe', 'UID-001', '2026-11-20T00:00:00.000Z');
  assert.equal(args, 'ts=2026-11-20T00:00:00.000Z&sc=SC&sid=SID&cid=CID&lc=en_US&nw=false&em=me@example.com&fn=John&ln=Doe&uid=UID-001');
  assert.equal(helper.encrypt(args, SAMPLE.BIOSIG_VECTOR, 128),
    'Es/CtGX8gg0agALpNTkCG6SdEC3nFZ92PbE9JnI5bBEUtExjUZ5pU569QuSBw6lfpJMguROVuM3Dt9MPJtYuxuHs0BVsUMZx5tQ81NtfqiqlonVZEENpHIJLqtAVN27QDix5s2stdPSTk4zmuJD3hjR0odO+bJCovJJhQ2mMUaI=');
  assert.equal(helper.decrypt(helper.encrypt(args, SAMPLE.BIOSIG_VECTOR, 128), SAMPLE.BIOSIG_VECTOR, 128).toString('utf8'), args);
  // The derivation is the non-standard one: SHA-1 twice over pass+salt, first 16 bytes.
  const once = crypto.createHash('sha1').update(SAMPLE.BIOSIG_PASS + SAMPLE.BIOSIG_SALT, 'utf8').digest();
  assert.deepEqual(helper._key, crypto.createHash('sha1').update(once).digest().subarray(0, 16));
  assert.notDeepEqual(helper._key, crypto.pbkdf2Sync(SAMPLE.BIOSIG_PASS, SAMPLE.BIOSIG_SALT, 2, 16, 'sha1'), 'a standard derivation would not match BSI');
  const source = read('netlify/functions/_lib/biosig/interface-helper.mjs');
  assert.doesNotMatch(source.replace(/^\s*\/\/.*$/gm, ''), /pbkdf2|scrypt|randomBytes|aes-\d+-gcm|createHmac/i);
});

test('without every BSI value the integration is unavailable, and it never echoes a value', () => {
  assert.deepEqual(biosigConfig({}), { ready: false, missing: BIOSIG_REQUIRED });
  for (const name of BIOSIG_REQUIRED) {
    const rest = Object.fromEntries(Object.entries(SAMPLE).filter(([key]) => key !== name));
    assert.deepEqual(biosigConfig(rest), { ready: false, missing: [name] });
    assert.deepEqual(biosigConfig({ ...SAMPLE, [name]: '[FROM BSI]' }), { ready: false, missing: [name] }, 'a placeholder left in place is not a value');
    assert.deepEqual(biosigConfig({ ...SAMPLE, [name]: '   ' }), { ready: false, missing: [name] });
  }
  assert.deepEqual(ready({ BIOSIG_VECTOR: 'too-short' }).missing, ['BIOSIG_VECTOR']);
  assert.deepEqual(ready({ BIOSIG_KEY_SIZE: '256' }).missing, ['BIOSIG_KEY_SIZE'], 'the helper derives a 16-byte key, so only 128 can work');
  assert.deepEqual(ready({ BIOSIG_PARTNER: '../evil' }).missing, ['BIOSIG_PARTNER']);
  assert.deepEqual(ready({ BIOSIG_ENVIRONMENT: 'staging' }).missing, ['BIOSIG_ENVIRONMENT']);
  assert.doesNotMatch(JSON.stringify(ready({ BIOSIG_VECTOR: 'bad' })), /random-pass|random-salt/);
  assert.equal(ready().inboundUrl, 'https://sandbox.verifyexpress.com/interface/standard/partner/SSOInbound.aspx');
  assert.equal(ready({ BIOSIG_ENVIRONMENT: 'production' }).inboundUrl, 'https://verifyexpress.com/interface/standard/partner/SSOInbound.aspx');
  const student = randomUUID();
  assert.deepEqual(ready({ BIOSIG_REVIEWER_UIDS: `${student}=reviewer, not-a-uuid=x, ${randomUUID()}=bad uid` }).reviewerUids, { [student]: 'reviewer' });
});

test('the interface address: a two-segment partner path, or the exact address BSI gave, on BSI\'s domain only', () => {
  assert.equal(ready({ BIOSIG_PARTNER: 'program/school' }).inboundUrl, 'https://sandbox.verifyexpress.com/interface/standard/program/school/SSOInbound.aspx');
  for (const bad of ['../x', 'a/../b', 'a//b', '/a', 'a/', 'a/.', 'a b', 'a?x=1', 'a#b', 'https://evil.example'])
    assert.deepEqual(ready({ BIOSIG_PARTNER: bad }).missing, ['BIOSIG_PARTNER'], bad);
  // BSI's analyst wrote the file name in lower case; an exact address is used as written.
  const exact = 'https://sandbox.verifyexpress.com/interface/standard/program/school/ssoinbound.aspx';
  assert.equal(ready({ BIOSIG_INBOUND_URL: exact }).inboundUrl, exact);
  assert.match(buildInboundUrl(ready({ BIOSIG_INBOUND_URL: exact }), 'ts=x'), /\/program\/school\/ssoinbound\.aspx\?args=[A-Za-z0-9%]+$/);
  for (const bad of ['http://sandbox.verifyexpress.com/a/ssoinbound.aspx', 'https://verifyexpress.com.evil.example/a/ssoinbound.aspx', 'https://evil.example/ssoinbound.aspx',
    'https://user:pw@sandbox.verifyexpress.com/a/ssoinbound.aspx', 'https://sandbox.verifyexpress.com/a/ssoinbound.aspx?args=1', 'https://sandbox.verifyexpress.com:8443/a/ssoinbound.aspx',
    'https://sandbox.verifyexpress.com/a/', 'not a url'])
    assert.deepEqual(ready({ BIOSIG_INBOUND_URL: bad }).missing, ['BIOSIG_INBOUND_URL'], bad);
});

test('uid: a real licensee is their NMLS ID; a test account is never a number that could be one', async () => {
  assert.equal(ready().testUidFormat, 'prefixed'); assert.equal(ready({ BIOSIG_ENVIRONMENT: 'production' }).ready, true);
  assert.deepEqual(ready({ BIOSIG_TEST_UID_FORMAT: 'nmls_id' }).missing, ['BIOSIG_TEST_UID_FORMAT']);
  assert.deepEqual(ready({ BIOSIG_UID_PREFIX: 'State Course' }).missing, ['BIOSIG_UID_PREFIX']);

  const numbers = new Map(), calls = [];
  const request = async (path, { method = 'GET', body } = {}) => {
    calls.push(method); assert.match(path, /^nmls_biosig_identifiers\?/);
    if (method === 'POST') { if (!numbers.has(body.student_id)) numbers.set(body.student_id, numbers.size + 1); return null; }
    const id = new URLSearchParams(path.split('?')[1]).get('student_id').replace('eq.', '');
    return numbers.has(id) ? [{ sequence: numbers.get(id) }] : [];
  };
  const licensee = randomUUID(), reviewerA = randomUUID(), reviewerB = randomUUID(), named = randomUUID();
  const config = ready({ BIOSIG_REVIEWER_UIDS: `${named}=nmls-named-reviewer` });
  // A real licensee: their own NMLS ID, and nothing is allocated.
  assert.equal(await resolveBiosigUid(config, { studentId: licensee, nmlsId: '1234567', testAccount: false }, { request }), '1234567');
  assert.equal(await resolveBiosigUid(config, { studentId: licensee, nmlsId: null, testAccount: false }, { request }), null, 'no NMLS ID, no check');
  assert.equal(await resolveBiosigUid(config, { studentId: licensee, nmlsId: 'abc', testAccount: false }, { request }), null);
  assert.deepEqual(calls, []);
  // A test account: a provider-marked identifier even when a real-looking number sits in its profile.
  assert.equal(await resolveBiosigUid(config, { studentId: reviewerA, nmlsId: '1234567', testAccount: true }, { request }), 'StateCourse-001');
  assert.equal(await resolveBiosigUid(config, { studentId: reviewerB, nmlsId: null, testAccount: true }, { request }), 'StateCourse-002');
  assert.equal(await resolveBiosigUid(config, { studentId: reviewerA, nmlsId: '7', testAccount: true }, { request }), 'StateCourse-001', 'the same account keeps the same identifier');
  assert.equal(await resolveBiosigUid(ready({ BIOSIG_UID_PREFIX: 'SC' }), { studentId: reviewerB, testAccount: true }, { request }), 'SC-002');
  // BSI's alternative: the provider ID followed by a number, e.g. 1405133000000001.
  const numeric = ready({ BIOSIG_TEST_UID_FORMAT: 'provider_numeric' });
  assert.equal(await resolveBiosigUid(numeric, { studentId: reviewerA, testAccount: true }, { request }), '1405133000000001');
  assert.equal(await resolveBiosigUid(numeric, { studentId: reviewerB, testAccount: true }, { request }), '1405133000000002');
  // An identifier NMLS names for a reviewer account wins over everything.
  assert.equal(await resolveBiosigUid(config, { studentId: named, nmlsId: '5', testAccount: true }, { request }), 'nmls-named-reviewer');
  assert.equal(await resolveBiosigUid(config, { studentId: randomUUID(), testAccount: true }, { request: async () => [] }), null, 'no number, no identifier');
});

test('a return at a Middle or FinalExam checkpoint is one combined stop; Begin is always Begin', () => {
  for (const [checkpoint, plain] of [['middle_1', 'Middle#1'], ['middle_2', 'Middle#2'], ['final_exam', 'FinalExam']]) {
    assert.equal(checkpointD3(checkpoint, { returning: false }), plain);
    assert.equal(checkpointD3(checkpoint, { returning: true }), `Resuming-${plain}`);
  }
  for (const returning of [true, false]) { assert.equal(checkpointD3('begin', { returning }), 'Begin'); assert.equal(checkpointD3('resuming', { returning }), 'Resuming'); }
});

test('no BSI value is stored in the repository', () => {
  const files = ['config/nmls/biosig.mjs', 'config/nmls/credit-review.mjs', 'netlify/functions/student-nmls-identity.mts', 'netlify/functions/biosig-callback.mts',
    'netlify/functions/student-nmls-course.mts', 'database/031_nmls_identity_challenges.sql', 'database/032_nmls_biosig_identifiers.sql', 'database/033_nmls_identity_combined_checkpoints.sql', 'docs/compliance/nmls/LAUNCH-BOARD.md',
    ...readdirSync(new URL('../netlify/functions/_lib/biosig/', import.meta.url)).map(name => `netlify/functions/_lib/biosig/${name}`)];
  for (const path of files) {
    const source = read(path);
    assert.doesNotMatch(source, /random-pass-guid-code|random-salt-guid-code|random-vector-16/, path);
    // The identifiers and address BSI issued for this account are kept out of the repository too.
    assert.doesNotMatch(source, /nmls_statecourse|standard\/nmls\/statecourse/i, path);
    // Secrets are named only as environment variables, never assigned a literal.
    assert.doesNotMatch(source, /BIOSIG_(?:PASS|SALT|VECTOR|SHARED_CODE|SYSTEM_ID|CUSTOMER_ID)\s*[:=]\s*['"`][^'"`\s]/, path);
    assert.doesNotMatch(source, /console\.(?:log|error|warn)\([^)]*(?:pass|salt|vector|sharedCode|args\b)/i, path);
  }
});

test('the NMLS argument string: generic fields, then NMLS fields, then our reference', () => {
  const now = new Date('2026-11-23T18:00:00.000Z');
  const args = buildNmlsArgumentString(ready(), { email: 'ana@example.test', firstName: 'Ana', lastName: 'Lee', uid: '1234567', d3: 'Middle#1', challengeId: 'ref-1' }, now);
  assert.equal(args, 'ts=2026-11-23T18:00:00.000Z&sc=SC&sid=SID&cid=CID&lc=en_US&nw=false&em=ana@example.test&fn=Ana&ln=Lee&uid=1234567' +
    '&ls=1405133&as=CE-course&d1=2026&d2=109386&d3=Middle#1&d4=8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education&d5=8&statecourse_ref=ref-1');
  assert.deepEqual(nmlsBiosigCourseFields(new Date('2027-01-02T00:00:00Z')).d1, '2027');
  // A value cannot smuggle in another field.
  const hostile = buildNmlsArgumentString(ready(), { email: 'a@b.c', firstName: 'Ana&vs=True', lastName: 'Lee=x', uid: '1', d3: 'Begin', challengeId: 'r' }, now);
  assert.match(hostile, /&fn=Ana vs True&ln=Lee x&uid=1&/); assert.equal(hostile.split('&').filter(pair => pair.startsWith('vs=')).length, 0);
  assert.throws(() => buildNmlsArgumentString(ready(), { email: 'a@b.c', uid: '', d3: 'Begin', challengeId: 'r' }), /nmls_id_required/);
});

test('inbound address: encrypted once, URL-encoded, sent to SSOInbound.aspx, with no Base64 step before encryption', () => {
  const config = ready(), args = buildNmlsArgumentString(config, { email: 'a@b.c', firstName: 'A', lastName: 'B', uid: '7', d3: 'Begin', challengeId: 'r' });
  const url = new URL(buildInboundUrl(config, args));
  assert.equal(url.origin + url.pathname, 'https://sandbox.verifyexpress.com/interface/standard/partner/SSOInbound.aspx');
  assert.deepEqual([...url.searchParams.keys()], ['args']);
  const helper = new BioSigInterfaceHelper(SAMPLE.BIOSIG_PASS, SAMPLE.BIOSIG_SALT);
  assert.equal(helper.decrypt(url.searchParams.get('args'), SAMPLE.BIOSIG_VECTOR, 128).toString('utf8'), args, 'the plaintext is the argument string itself');
  assert.match(buildInboundUrl(config, args), /args=[A-Za-z0-9%]+$/, 'Base64 "+", "/" and "=" are percent-encoded');
});

test('SSO_RESPONSE is read and written in the shape of BSI\'s sample', () => {
  const xml = '<?xml version="1.0" encoding="utf-8"?>\n<SSO_RESPONSE xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n\t<STATUS>Success</STATUS>\n\t<CODE>100</CODE>\n\t<MESSAGE>None</MESSAGE>\n\t<REDIRECT>https://bsi.example/app?a=1&amp;b=2</REDIRECT>\n</SSO_RESPONSE>';
  assert.deepEqual(parseSsoResponseXml(xml), { status: 'Success', code: '100', message: 'None', redirect: 'https://bsi.example/app?a=1&b=2' });
  assert.deepEqual(parseSsoResponseXml('<html>gateway error</html>'), { status: '', code: '', message: '', redirect: '' });
  assert.equal(parseSsoResponseXml('<SSO_RESPONSE><CODE>100</CODE><REDIRECT><![CDATA[https://x.example/?a=1&b=2]]></REDIRECT></SSO_RESPONSE>').redirect, 'https://x.example/?a=1&b=2');
  const ours = buildSsoResponseXml('Success', '100', 'None', 'https://statecourse.test/student/nmls-course/?enrollment_id=e1');
  assert.equal(ours, '<?xml version="1.0" encoding="utf-8"?>\n<SSO_RESPONSE xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n\t<STATUS>Success</STATUS>\n\t<CODE>100</CODE>\n\t<MESSAGE>None</MESSAGE>\n\t<REDIRECT>https://statecourse.test/student/nmls-course/?enrollment_id=e1</REDIRECT>\n</SSO_RESPONSE>');
  assert.deepEqual(parseSsoResponseXml(buildSsoResponseXml('Failure', '110', 'a<b>&c', 'https://x.example/?a=1&b=2')), { status: 'Failure', code: '110', message: 'a<b>&c', redirect: 'https://x.example/?a=1&b=2' });
});

test('a callback is trusted only if it decrypts with our key; vs is the single access signal', () => {
  const config = ready(), helper = new BioSigInterfaceHelper(SAMPLE.BIOSIG_PASS, SAMPLE.BIOSIG_SALT);
  let encrypted = '';
  // Find a ciphertext containing "+", the character a URL decoder turns into a space.
  for (let i = 0; !encrypted.includes('+'); i++) encrypted = helper.encrypt(`vs=True&vl=1&uid=77&statecourse_ref=r${i}`, SAMPLE.BIOSIG_VECTOR, 128);
  assert.equal(decryptCallbackArgs(config, encrypted).vs, 'True');
  assert.equal(decryptCallbackArgs(config, encrypted.replace(/\+/g, ' ')).uid, '77', 'spaces are restored to "+" before decrypting');
  for (const bad of [null, '', 'not base64!', 'AAAA', encrypted.slice(0, -8), 'A'.repeat(9000)]) assert.equal(decryptCallbackArgs(config, bad), null);
  const other = new BioSigInterfaceHelper('another-pass', SAMPLE.BIOSIG_SALT).encrypt('vs=True&uid=77', SAMPLE.BIOSIG_VECTOR, 128);
  assert.equal(decryptCallbackArgs(config, other)?.vs, undefined, 'a value made with a different key grants nothing');
  for (const value of ['True', 'true', 'TRUE']) assert.equal(validationSucceeded({ vs: value }), true);
  for (const value of ['False', '', undefined, '1', 'yes', 'True ']) assert.equal(validationSucceeded({ vs: value }), false);
});

test('BSI\'s launch answer: only code 100 with an https address sends the student anywhere', async () => {
  const config = ready(), calls = [];
  const answer = xml => async (url, init) => { calls.push([url, init.method]); return new Response(xml, { status: 200 }); };
  const good = buildSsoResponseXml('Success', '100', 'None', 'https://sandbox.verifyexpress.com/app/launch?t=1');
  assert.equal(await requestBiosigRedirect(config, 'ts=x', { fetcher: answer(good) }), 'https://sandbox.verifyexpress.com/app/launch?t=1');
  assert.match(calls[0][0], /^https:\/\/sandbox\.verifyexpress\.com\/interface\/standard\/partner\/SSOInbound\.aspx\?args=/); assert.equal(calls[0][1], 'GET');
  for (const xml of [buildSsoResponseXml('Failure', '110', 'Unknown error', 'https://x.example/'), buildSsoResponseXml('Success', '100', 'None', ''),
    buildSsoResponseXml('Success', '100', 'None', 'http://insecure.example/'), buildSsoResponseXml('Success', '100', 'None', 'javascript:alert(1)'), '<html></html>'])
    await assert.rejects(() => requestBiosigRedirect(config, 'ts=x', { fetcher: answer(xml) }), /^Error: biosig_refused:(110|100|unreadable)$/);
  await assert.rejects(() => requestBiosigRedirect(config, 'ts=x', { fetcher: async () => new Response('down', { status: 502 }) }), /biosig_http_error/);
  await assert.rejects(() => requestBiosigRedirect(config, 'ts=x', { fetcher: async () => { throw new Error('ECONNRESET secret-url'); } }), error => error.message === 'biosig_unreachable');
});

test('which checkpoint is owed', () => {
  const passed = (...ids) => new Set(ids), source = (modules, status = 'active') => ({ phase: 'source', source: { passedModuleIds: modules, status } });
  assert.equal(dueStudyCheckpoint(null, passed()), 'begin');
  assert.equal(dueStudyCheckpoint(source(['F01', 'F02', 'F03']), passed()), 'begin', 'Begin comes first even for a course already under way');
  assert.equal(dueStudyCheckpoint(source(['F01']), passed('begin')), 'resuming');
  assert.equal(dueStudyCheckpoint(source(['F01', 'F02', 'F03']), passed('begin')), 'middle_1');
  assert.equal(dueStudyCheckpoint(source(['F01', 'F02', 'F03', 'E01']), passed('begin', 'middle_1')), 'resuming');
  assert.equal(dueStudyCheckpoint(source(['F01', 'F02', 'F03', 'E01', 'E02']), passed('begin', 'middle_1')), 'middle_2');
  assert.equal(dueStudyCheckpoint(source(['F01', 'F02', 'F03', 'E01', 'E02']), passed('begin')), 'middle_1', 'a missed Middle#1 is owed before Middle#2');
  const done = source(['F01', 'F02', 'F03', 'E01', 'E02', 'N01', 'N02', 'G01'], 'review_complete');
  assert.equal(dueCheckpoint(done, passed('begin', 'middle_1', 'middle_2')), 'final_exam');
  assert.equal(dueCheckpoint(done, passed('begin')), 'middle_1');
  assert.equal(dueCheckpoint({ phase: 'remediation', source: done.source, remediation: { runtime: { status: 'review_complete' } } }, passed('begin', 'middle_1', 'middle_2')), 'final_exam');

  const teach = kind => ({ operation: 'teaching', command: { action: { kind } } });
  const all = passed('begin', 'middle_1', 'middle_2');
  assert.deepEqual(requirementFor(teach('resume'), null, passed()), { checkpoint: 'begin', spend: true });
  assert.deepEqual(requirementFor(teach('resume'), source(['F01']), passed('begin')), { checkpoint: 'resuming', spend: true }, 'every return to study owes a fresh check');
  assert.deepEqual(requirementFor(teach('open_unit'), source(['F01', 'F02', 'F03']), passed('begin')), { checkpoint: 'middle_1', spend: false, owed: true });
  assert.equal(requirementFor(teach('open_unit'), source(['F01']), passed('begin')), null, 'inside a session, lessons continue until a checkpoint comes due');
  for (const kind of ['heartbeat', 'interaction', 'logout']) assert.equal(requirementFor(teach(kind), null, passed()), null, `${kind} is never blocked`);
  assert.deepEqual(requirementFor({ operation: 'issue_assessment', command: {} }, done, all), { checkpoint: 'final_exam', spend: true });
  assert.equal(requirementFor({ operation: 'snapshot', command: {} }, null, passed()), null);
});

// An in-memory stand-in for the one table, speaking the PostgREST subset the store uses.
function fakeTable() {
  const rows = [], numbers = new Map();
  const filters = query => [...new URLSearchParams(query)].filter(([key]) => !['select', 'order', 'limit'].includes(key)).map(([key, value]) => [key, value.replace(/^eq\./, '')]);
  const request = async (path, { method = 'GET', body } = {}) => {
    const [table, query = ''] = path.split('?');
    if (table === 'nmls_biosig_identifiers') {
      const id = body?.student_id || new URLSearchParams(query).get('student_id')?.replace('eq.', '');
      if (method === 'POST') { if (!numbers.has(id)) numbers.set(id, numbers.size + 1); return null; }
      return numbers.has(id) ? [{ sequence: numbers.get(id) }] : [];
    }
    assert.equal(table, 'nmls_identity_challenges');
    if (method === 'POST') { rows.push({ created_at: new Date(Date.now() + rows.length).toISOString(), completed_at: null, consumed_at: null, ...body }); return null; }
    const hit = rows.filter(row => filters(query).every(([key, value]) => String(row[key]) === value));
    if (method === 'PATCH') { hit.forEach(row => Object.assign(row, body)); return hit.map(row => ({ ...row })); }
    return hit.map(row => ({ ...row })).sort((a, b) => b.created_at.localeCompare(a.created_at));
  };
  return { rows, request };
}

test('a check opens a checkpoint once: pending, answered by BSI, then spent', async () => {
  let clock = Date.UTC(2026, 10, 23, 18); const table = fakeTable(), store = createChallengeStore({ request: table.request, now: () => clock });
  const enrollmentId = randomUUID(), studentId = randomUUID();
  const first = await store.create({ enrollmentId, studentId, checkpoint: 'begin', uid: '1234567' });
  assert.equal(first.d3, 'Begin'); assert.equal(first.status, 'pending'); assert.equal(Date.parse(first.expires_at) - clock, CHALLENGE_LIFETIME_MS);
  assert.equal((await store.history(enrollmentId)).passed.size, 0, 'a pending check proves nothing');

  assert.equal(await store.answer('not-a-uuid', { uid: '1234567', verified: true }), null);
  assert.equal(await store.answer(randomUUID(), { uid: '1234567', verified: true }), null, 'an unknown reference is refused');
  assert.equal((await store.answer(first.id, { uid: '1234567', verified: true })).status, 'verified');
  assert.equal(await store.answer(first.id, { uid: '1234567', verified: true }), null, 'a replayed callback is refused');
  assert.equal(await store.answer(first.id, { uid: '1234567', verified: false }), null, 'a later callback cannot overturn the answer');

  let { rows, passed } = await store.history(enrollmentId);
  assert.equal(passed.size, 0, 'verified but not yet used: Begin is still the check that is owed');
  const proof = store.usable(rows, 'begin'); assert.equal(proof.id, first.id);
  assert.equal(store.usable(rows, 'resuming'), null, 'a Begin check does not open a different checkpoint');
  assert.equal((await store.spend(proof.id)).status, 'consumed'); assert.equal(await store.spend(proof.id), null, 'a passed check is used once');
  assert.deepEqual([...(await store.history(enrollmentId)).passed], ['begin'], 'once used, the checkpoint counts as passed');

  const wrongPerson = await store.create({ enrollmentId, studentId, checkpoint: 'resuming', uid: '1234567' });
  assert.equal(await store.answer(wrongPerson.id, { uid: '7654321', verified: true }), null, 'an answer for another identifier is refused');
  assert.equal(table.rows.find(row => row.id === wrongPerson.id).status, 'failed');

  const failed = await store.create({ enrollmentId, studentId, checkpoint: 'resuming', uid: '1234567' });
  assert.equal((await store.answer(failed.id, { uid: '1234567', verified: false })).status, 'failed');
  assert.equal(store.usable((await store.history(enrollmentId)).rows, 'resuming'), null);

  const late = await store.create({ enrollmentId, studentId, checkpoint: 'resuming', uid: '1234567' });
  clock += CHALLENGE_LIFETIME_MS + 1;
  assert.equal(await store.answer(late.id, { uid: '1234567', verified: true }), null, 'an answer after expiry is refused');
  assert.equal(table.rows.find(row => row.id === late.id).status, 'expired');

  const superseded = await store.create({ enrollmentId, studentId, checkpoint: 'resuming', uid: '1234567' });
  const newest = await store.create({ enrollmentId, studentId, checkpoint: 'resuming', uid: '1234567' });
  assert.equal(await store.answer(superseded.id, { uid: '1234567', verified: true }), null, 'only the newest check can be answered');
  await store.answer(newest.id, { uid: '1234567', verified: true });
  clock += VERIFIED_LIFETIME_MS + 1; ({ rows } = await store.history(enrollmentId));
  assert.equal(store.usable(rows, 'resuming'), null, 'a passed check left unused goes stale');
});

test('the course endpoint gate: no commit without a fresh passed check, and one check opens one request', async () => {
  const table = fakeTable(), store = createChallengeStore({ request: table.request }), config = ready();
  const enrollmentId = randomUUID(), studentId = randomUUID(), calls = [];
  const context = { enrollmentId, reviewRole: 'student_reviewer', runtime: null };
  const callRpc = async name => { calls.push(name); return name === 'nmls_training_context' ? context : { committed: true }; };
  const resume = { operation: 'teaching', command: { action: { kind: 'resume', sessionId: null } } };
  const attempt = async (input = resume) => { const rpc = identityGate(callRpc, input, { store, config }); await rpc('nmls_training_context', {}); return rpc('nmls_training_commit', {}); };

  await assert.rejects(attempt, error => error.message === 'nmls_identity_check_required' && error.statusCode === 409);
  assert.equal(calls.includes('nmls_training_commit'), false, 'nothing is written');
  const begin = await store.create({ enrollmentId, studentId, checkpoint: 'begin', uid: '1' });
  await assert.rejects(attempt, /nmls_identity_check_required/, 'a check that is only pending opens nothing');
  await store.answer(begin.id, { uid: '1', verified: false });
  await assert.rejects(attempt, /nmls_identity_check_required/, 'a failed check opens nothing');

  const retry = await store.create({ enrollmentId, studentId, checkpoint: 'begin', uid: '1' });
  await store.answer(retry.id, { uid: '1', verified: true });
  assert.deepEqual(await attempt(), { committed: true }); assert.equal(calls.filter(name => name === 'nmls_training_commit').length, 1);
  await assert.rejects(attempt, /nmls_identity_check_required/, 'the next return to study owes a new check (Resuming)');
  assert.deepEqual((await identityStatus(context, { store, config })).due, { id: 'resuming', d3: 'Resuming', label: 'Identity verification when you return' });

  // Ending a session and observing it are never blocked.
  for (const kind of ['logout', 'heartbeat']) assert.deepEqual(await attempt({ operation: 'teaching', command: { action: { kind } } }), { committed: true });
  // A Middle check that has come due stops lesson work inside a running session.
  context.runtime = { phase: 'source', source: { passedModuleIds: ['F01', 'F02', 'F03'], status: 'active' } };
  await assert.rejects(() => attempt({ operation: 'teaching', command: { action: { kind: 'open_unit' } } }), /nmls_identity_check_required/);
  // With real checks switched on but BSI values missing, the course stays closed. It never skips the check.
  const unconfigured = identityGate(callRpc, resume, { store, config: biosigConfig({}) }); await unconfigured('nmls_training_context', {});
  await assert.rejects(() => unconfigured('nmls_training_commit', {}), /nmls_identity_check_unavailable/);
  // The open (read-only) version has no checkpoints and is not gated.
  const open = identityGate(async name => name === 'nmls_training_context' ? { enrollmentId, reviewRole: 'regulator_reviewer' } : 'ok', resume, { store, config });
  await open('nmls_training_context', {}); assert.equal(await open('anything', {}), 'ok');
  assert.equal(await identityStatus({ reviewRole: 'regulator_reviewer' }, { store, config }), null);
});

test('HTTP: start a check, then BSI\'s simulated success and failure callbacks', async t => {
  const names = ['STATECOURSE_BASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NMLS_CREDIT_CHECKPOINTS', 'BIOSIG_REVIEWER_UIDS', 'BIOSIG_TEST_UID_FORMAT', 'BIOSIG_PARTNER', 'BIOSIG_INBOUND_URL', ...Object.keys(SAMPLE)];
  const before = Object.fromEntries(names.map(name => [name, process.env[name]])), originalFetch = globalThis.fetch, originalError = console.error;
  const origin = 'https://statecourse.test', db = 'https://biosig-db.invalid';
  const actor = randomUUID(), enrollmentId = randomUUID(), table = fakeTable(), logged = [];
  Object.assign(process.env, { STATECOURSE_BASE_URL: origin, SUPABASE_URL: db, SUPABASE_ANON_KEY: 'synthetic-anon', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service', ...SAMPLE });
  delete process.env.NMLS_CREDIT_CHECKPOINTS; delete process.env.BIOSIG_REVIEWER_UIDS;
  const originalInfo = console.info; console.info = (...parts) => logged.push(JSON.stringify(parts));
  console.error = (...parts) => logged.push(JSON.stringify(parts));
  t.after(() => { globalThis.fetch = originalFetch; console.error = originalError; console.info = originalInfo; for (const name of names) { if (before[name] === undefined) delete process.env[name]; else process.env[name] = before[name]; } });
  const context = { enrollmentId, studentId: actor, courseId: NMLS, courseVersion: '2026.3', reviewRole: 'student_reviewer', revision: 0, runtime: null };
  let hosts = [], bsiAnswer = () => buildSsoResponseXml('Success', '100', 'None', 'https://sandbox.verifyexpress.com/app/draw?session=abc'), nmlsId = '1234567', sent = null;
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  globalThis.fetch = async (url, options = {}) => {
    const target = new URL(url); hosts.push(target.host);
    if (target.host === 'sandbox.verifyexpress.com') { sent = target; return new Response(bsiAnswer(), { status: 200 }); }
    assert.equal(target.origin, db, `unexpected host ${target.host}`);
    if (target.pathname === '/auth/v1/user') return json({ id: actor, email: 'closed-reviewer@example.test' });
    if (target.pathname === '/rest/v1/rpc/nmls_training_context') return json(context);
    if (['/rest/v1/nmls_identity_challenges', '/rest/v1/nmls_biosig_identifiers'].includes(target.pathname)) return json(await table.request(`${target.pathname.replace('/rest/v1/', '')}${target.search}`, { method: options.method || 'GET', body: options.body ? JSON.parse(options.body) : undefined }));
    if (target.pathname === '/rest/v1/students') return options.method === 'POST' ? new Response(null, { status: 204 }) : json([{ email: 'closed-reviewer@example.test', first_name: 'Closed', last_name: 'Reviewer', nmls_id: nmlsId }]);
    throw new Error(`Unexpected mocked request ${target.pathname}`);
  };
  const start = (body = { enrollmentId }, headers = {}) => identityHandler(new Request(`${origin}/api/student/nmls/identity-check`, { method: 'POST',
    headers: { origin, 'content-type': 'application/json', authorization: 'Bearer fixture', ...headers }, body: JSON.stringify(body) }));
  const helper = new BioSigInterfaceHelper(SAMPLE.BIOSIG_PASS, SAMPLE.BIOSIG_SALT);
  const callback = (plain, { method = 'GET' } = {}) => {
    const args = helper.encrypt(plain, SAMPLE.BIOSIG_VECTOR, 128);
    return method === 'GET' ? callbackHandler(new Request(`${origin}/api/biosig/callback?args=${encodeURIComponent(args)}`))
      : callbackHandler(new Request(`${origin}/api/biosig/callback`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ args }).toString() }));
  };
  assert.equal(identityConfig.path, '/api/student/nmls/identity-check'); assert.equal(callbackConfig.path, '/api/biosig/callback');

  await t.test('switched off (the default): no check can start, the callback address does not exist, BSI is never contacted', async () => {
    for (const value of [undefined, 'placeholder', 'off']) {
      if (value === undefined) delete process.env.NMLS_CREDIT_CHECKPOINTS; else process.env.NMLS_CREDIT_CHECKPOINTS = value;
      hosts = []; const response = await start();
      assert.equal(response.status, 409); assert.deepEqual(await response.json(), { error: 'nmls_identity_check_unavailable' });
      assert.equal((await callback('vs=True&uid=StateCourse-001')).status, 404);
      assert.equal(hosts.includes('sandbox.verifyexpress.com'), false); assert.equal(table.rows.length, 0);
    }
  });
  await t.test('switched on but a BSI value missing: still unavailable, still no contact', async () => {
    process.env.NMLS_CREDIT_CHECKPOINTS = 'biosig'; const kept = process.env.BIOSIG_SALT; delete process.env.BIOSIG_SALT; hosts = [];
    assert.equal((await start()).status, 409); assert.equal((await callback('vs=True')).status, 404);
    assert.equal(hosts.includes('sandbox.verifyexpress.com'), false); process.env.BIOSIG_SALT = kept;
  });
  await t.test('refusals before anything is sent', async () => {
    assert.equal((await identityHandler(new Request(`${origin}/api/student/nmls/identity-check`))).status, 405);
    assert.equal((await start({ enrollmentId }, { origin: 'https://elsewhere.test' })).status, 403);
    assert.equal((await start({ enrollmentId: 'x' })).status, 400);
    context.reviewRole = null; hosts = [];
    assert.equal((await start()).status, 403, 'an ordinary free-training enrollment cannot start a check');
    context.reviewRole = 'regulator_reviewer'; assert.equal((await start()).status, 403, 'the open version has no checks');
    context.reviewRole = 'student_reviewer';
    assert.equal(hosts.includes('sandbox.verifyexpress.com'), false); assert.equal(table.rows.length, 0);
  });
  await t.test('start: the server picks Begin, records a pending check and returns BSI\'s address', async () => {
    hosts = []; const response = await start(), body = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(body, { ready: false, redirect: 'https://sandbox.verifyexpress.com/app/draw?session=abc', checkpoint: { id: 'begin', d3: 'Begin', label: 'Identity verification before the course' } });
    assert.equal(sent.pathname, '/interface/standard/partner/SSOInbound.aspx');
    const keyed = decryptCallbackArgs(ready(), sent.searchParams.get('args'));
    assert.equal(keyed.uid, 'StateCourse-001', 'a reviewer is a test account: the real-looking NMLS ID in its profile is not sent');
    assert.equal(table.rows[0].uid, 'StateCourse-001'); assert.equal(keyed.d3, 'Begin'); assert.equal(keyed.ls, '1405133'); assert.equal(keyed.d2, '109386'); assert.equal(keyed.d5, '8');
    assert.equal(keyed.em, 'closed-reviewer@example.test'); assert.equal(keyed.fn, 'Closed');
    assert.equal(table.rows.length, 1); assert.equal(table.rows[0].status, 'pending'); assert.equal(keyed[CHALLENGE_ARGUMENT], table.rows[0].id);
    assert.equal(response.headers.get('cache-control'), 'no-store, private');
    assert.doesNotMatch(JSON.stringify(body), /random-pass|random-salt|random-vector|args=/);
  });
  await t.test('simulate-failure: vs=False leaves the checkpoint closed and sends the student back', async () => {
    const id = table.rows.at(-1).id, response = await callback(`vs=False&vl=1&uid=StateCourse-001&em=closed-reviewer@example.test&${CHALLENGE_ARGUMENT}=${id}`);
    assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'text/xml; charset=utf-8');
    assert.deepEqual(parseSsoResponseXml(await response.text()), { status: 'Failure', code: '110', message: 'Validation failed', redirect: `${origin}/student/nmls-course/?enrollment_id=${enrollmentId}` });
    assert.equal(table.rows.at(-1).status, 'failed');
  });
  await t.test('simulate-success: a retry is allowed, and vs=True marks that one check passed', async () => {
    await start(); const id = table.rows.at(-1).id; assert.equal(table.rows.length, 2);
    const response = await callback(`vs=True&vl=1&uid=StateCourse-001&em=closed-reviewer@example.test&${CHALLENGE_ARGUMENT}=${id}`, { method: 'POST' });
    assert.deepEqual(parseSsoResponseXml(await response.text()), { status: 'Success', code: '100', message: 'None', redirect: `${origin}/student/nmls-course/?enrollment_id=${enrollmentId}` });
    assert.equal(table.rows.at(-1).status, 'verified');
    assert.deepEqual(await (await start()).json(), { ready: true, checkpoint: { id: 'begin', d3: 'Begin', label: 'Identity verification before the course' } }, 'a passed, unused check is not asked for twice');
  });
  await t.test('callbacks that must not count', async () => {
    const id = table.rows.at(-1).id, refusedXml = { status: 'Failure', code: '110', message: 'Validation failed', redirect: `${origin}/student/` };
    const refused = async response => { assert.equal(response.status, 200); assert.deepEqual(parseSsoResponseXml(await response.text()), refusedXml); };
    await refused(await callback(`vs=True&uid=StateCourse-001&${CHALLENGE_ARGUMENT}=${id}`)); // replay of an answered check
    await refused(await callback(`vs=True&uid=StateCourse-001&${CHALLENGE_ARGUMENT}=${randomUUID()}`)); // unknown check
    await refused(await callback('vs=True&uid=StateCourse-001')); // no reference at all
    await refused(await callbackHandler(new Request(`${origin}/api/biosig/callback?args=${encodeURIComponent('bm90IGVuY3J5cHRlZA==')}`))); // not our key
    await refused(await callbackHandler(new Request(`${origin}/api/biosig/callback`))); // nothing sent
    await start(); const pending = table.rows.at(-1).id; // (a pending check exists only if the last one was spent; force one)
    const fresh = await createChallengeStore({ request: table.request }).create({ enrollmentId, studentId: actor, checkpoint: 'resuming', uid: 'StateCourse-001' });
    await refused(await callback(`ts=2020-01-01T00:00:00.000Z&vs=True&uid=StateCourse-001&${CHALLENGE_ARGUMENT}=${fresh.id}`)); // stale timestamp
    assert.equal(table.rows.find(row => row.id === fresh.id).status, 'pending', 'a refused callback changes nothing');
    await refused(await callback(`vs=True&uid=9999999&${CHALLENGE_ARGUMENT}=${fresh.id}`)); // another person's identifier
    assert.equal(table.rows.find(row => row.id === fresh.id).status, 'failed'); assert.ok(pending);
    assert.equal((await callbackHandler(new Request(`${origin}/api/biosig/callback`, { method: 'DELETE' }))).status, 405);
  });
  await t.test('BSI refusing or being down: reported plainly, the check is closed, and no secret is logged', async () => {
    const fresh = fakeTable(); table.rows.length = 0; logged.length = 0;
    bsiAnswer = () => buildSsoResponseXml('Failure', '250', 'Timestamp not found or not accepted', '');
    const response = await start(); assert.equal(response.status, 409); assert.deepEqual(await response.json(), { error: 'nmls_identity_check_unavailable' });
    assert.equal(table.rows.at(-1).status, 'failed');
    assert.match(logged.join(' '), /biosig_refused:250/); assert.match(logged.join(' '), /Begin/);
    assert.doesNotMatch(logged.join(' '), /random-pass|random-salt|random-vector|1234567|StateCourse-001|closed-reviewer|args=/); assert.ok(fresh);
  });
  await t.test('each callback leaves one diagnostic line with its outcome and nothing sensitive', async () => {
    logged.length = 0; table.rows.length = 0;
    bsiAnswer = () => buildSsoResponseXml('Success', '100', 'None', 'https://sandbox.verifyexpress.com/app/draw');
    await start(); const row = table.rows.at(-1);
    await callback('vs=True&uid=StateCourse-001'); await callbackHandler(new Request(`${origin}/api/biosig/callback?args=AAAA`));
    await callback(`vs=True&uid=StateCourse-001&${CHALLENGE_ARGUMENT}=${row.id}`);
    const lines = logged.join('\n');
    for (const outcome of ['no_reference', 'not_decryptable', 'verified']) assert.match(lines, new RegExp(`"outcome":"${outcome}"`));
    assert.match(lines, /BioSig-ID check started/); assert.match(lines, new RegExp(row.id)); assert.match(lines, /"checkpoint":"Begin"/);
    assert.doesNotMatch(lines, /random-pass|random-salt|random-vector|1234567|StateCourse-001|closed-reviewer|args=|"vs"/);
  });
  await t.test('two-segment partner path, provider-numbered test identifier, and a combined return checkpoint', async () => {
    process.env.BIOSIG_TEST_UID_FORMAT = 'provider_numeric'; process.env.BIOSIG_PARTNER = 'program/school'; table.rows.length = 0;
    // Begin has been passed and used; lessons are finished; the reviewer comes back later.
    table.rows.push({ id: randomUUID(), enrollment_id: enrollmentId, checkpoint: 'begin', status: 'consumed', created_at: '2026-11-20T00:00:00.000Z', completed_at: '2026-11-20T00:00:00.000Z' },
      ...['middle_1', 'middle_2'].map(checkpoint => ({ id: randomUUID(), enrollment_id: enrollmentId, checkpoint, status: 'consumed', created_at: '2026-11-20T01:00:00.000Z', completed_at: '2026-11-20T01:00:00.000Z' })));
    context.runtime = { phase: 'source', source: { passedModuleIds: ['F01', 'F02', 'F03', 'E01', 'E02', 'N01', 'N02', 'G01'], status: 'review_complete' } };
    assert.equal((await (await start()).json()).checkpoint.d3, 'Resuming-FinalExam', 'returning to the door of the final examination is one stop');
    assert.equal(sent.pathname, '/interface/standard/program/school/SSOInbound.aspx');
    const keyed = decryptCallbackArgs(biosigConfig(process.env), sent.searchParams.get('args'));
    assert.equal(keyed.uid, '1405133000000001'); assert.equal(keyed.d3, 'Resuming-FinalExam'); assert.equal(table.rows.at(-1).checkpoint, 'final_exam');
    // Reaching the same door inside a running sitting is the plain checkpoint.
    assert.equal((await (await start({ enrollmentId, inSession: true })).json()).checkpoint.d3, 'FinalExam');
    // BSI's answer must name that same identifier.
    const row = table.rows.at(-1);
    assert.equal(parseSsoResponseXml(await (await callback(`vs=True&uid=1234567&${CHALLENGE_ARGUMENT}=${row.id}`)).text()).status, 'Failure');
    await start({ enrollmentId, inSession: true }); const again = table.rows.at(-1);
    assert.equal(parseSsoResponseXml(await (await callback(`vs=True&uid=1405133000000001&${CHALLENGE_ARGUMENT}=${again.id}`)).text()).status, 'Success');
    delete process.env.BIOSIG_TEST_UID_FORMAT; process.env.BIOSIG_PARTNER = SAMPLE.BIOSIG_PARTNER; context.runtime = null;
  });
  await t.test('reviewer accounts use the identifier assigned to them', async () => {
    process.env.BIOSIG_REVIEWER_UIDS = `${actor}=reviewer2`; table.rows.length = 0;
    bsiAnswer = () => buildSsoResponseXml('Success', '100', 'None', 'https://sandbox.verifyexpress.com/app/draw');
    assert.equal((await start()).status, 200);
    assert.equal(decryptCallbackArgs(ready(), sent.searchParams.get('args')).uid, 'reviewer2'); assert.equal(table.rows.at(-1).uid, 'reviewer2');
  });
});

test('the course page offers the real check only in biosig mode and decides nothing itself', () => {
  const page = read('public/statecourse/student/nmls-course/nmls-course.mjs'), html = read('public/statecourse/student/nmls-course/index.html');
  assert.match(html, /id="identityStart"[^>]*hidden/);
  assert.match(page, /\/api\/student\/nmls\/identity-check/);
  assert.match(page, /contact the NMLS help desk/); assert.doesNotMatch(page + html, /contact (?:BioSig|BSI)|biosig-id\.com|verifyexpress/i, 'students are never sent to BSI for support');
  assert.match(page, /body\.redirect\.startsWith\('https:\/\/'\)/);
  // No client-side "verified" flag, storage or simulated success exists.
  assert.doesNotMatch(page, /localStorage|sessionStorage|simulate|vs=|verified\s*=\s*true/i);
});

test('migration 031: forward-only transitions, service role only', { skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipping is not verification.' }, async () => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite();
  await db.exec(`create role service_role; create role anon; create role authenticated;
    create table students(id uuid primary key); create table enrollments(id uuid primary key); create table nmls_training_attempts(enrollment_id uuid primary key);`);
  const sql = read('database/031_nmls_identity_challenges.sql');
  await db.exec(sql); await db.exec(sql); // repeatable
  const student = randomUUID(), enrollment = randomUUID();
  await db.query('insert into students values($1)', [student]); await db.query('insert into enrollments values($1)', [enrollment]);
  const insert = (extra = {}) => { const row = { checkpoint: 'begin', d3: 'Begin', uid: '1234567', ...extra };
    return db.query(`insert into nmls_identity_challenges(enrollment_id,student_id,course_id,checkpoint,d3,uid,expires_at) values($1,$2,'${NMLS}',$3,$4,$5,now()+interval '20 minutes') returning id`,
      [enrollment, student, row.checkpoint, row.d3, row.uid]); };
  const id = (await insert()).rows[0].id;
  await assert.rejects(insert({ checkpoint: 'made_up' }), /check/); await assert.rejects(insert({ uid: 'has space' }), /check/);
  const set = (status, extra = '') => db.query(`update nmls_identity_challenges set status='${status}'${extra} where id=$1`, [id]);
  await assert.rejects(set('consumed', ', completed_at=now(), consumed_at=now()'), /nmls_identity_challenge_transition/, 'pending cannot jump to consumed');
  await assert.rejects(set('verified'), /check/, 'a verified row must record when');
  await set('verified', ', completed_at=now()');
  await assert.rejects(set('failed'), /nmls_identity_challenge_transition/); await assert.rejects(set('pending', ', completed_at=null'), /nmls_identity_challenge_transition/);
  await assert.rejects(db.query(`update nmls_identity_challenges set uid='7654321' where id=$1`, [id]), /nmls_identity_challenge_immutable/);
  await set('consumed', ', consumed_at=now()');
  await assert.rejects(set('verified', ', consumed_at=null'), /nmls_identity_challenge_transition/, 'a spent check cannot be reused');
  await assert.rejects(db.query('delete from nmls_identity_challenges where id=$1', [id]), /nmls_identity_challenge_immutable/);
  const grants = (await db.query(`select grantee, string_agg(privilege_type, ',' order by privilege_type) p from information_schema.role_table_grants where table_name='nmls_identity_challenges' and grantee in ('service_role','anon','authenticated','PUBLIC') group by grantee`)).rows;
  assert.deepEqual(grants, [{ grantee: 'service_role', p: 'INSERT,SELECT,UPDATE' }]);
  assert.equal((await db.query(`select relrowsecurity from pg_class where relname='nmls_identity_challenges'`)).rows[0].relrowsecurity, true);

  // 033: the combined return checkpoints become valid names; anything else is still refused.
  await assert.rejects(insert({ checkpoint: 'final_exam', d3: 'Resuming-FinalExam' }), /check/, 'before 033 the combined name is refused');
  const combined = read('database/033_nmls_identity_combined_checkpoints.sql'); await db.exec(combined); await db.exec(combined);
  await insert({ checkpoint: 'final_exam', d3: 'Resuming-FinalExam' }); await insert({ checkpoint: 'middle_1', d3: 'Resuming-Middle#1' });
  await assert.rejects(insert({ checkpoint: 'begin', d3: 'Resuming-Begin' }), /check/);

  // 032: one number per student, assigned once, never changed or reused.
  const identifiers = read('database/032_nmls_biosig_identifiers.sql'); await db.exec(identifiers); await db.exec(identifiers);
  const other = randomUUID(); await db.query('insert into students values($1)', [other]);
  const assign = who => db.query('insert into nmls_biosig_identifiers(student_id) values($1) on conflict(student_id) do nothing', [who]);
  await assign(student); await assign(other); await assign(student);
  assert.deepEqual((await db.query('select student_id, sequence::int from nmls_biosig_identifiers order by sequence')).rows, [{ student_id: student, sequence: 1 }, { student_id: other, sequence: 2 }]);
  await assert.rejects(db.query('update nmls_biosig_identifiers set assigned_at=now()'), /nmls_biosig_identifier_immutable/);
  await assert.rejects(db.query('delete from nmls_biosig_identifiers'), /nmls_biosig_identifier_immutable/);
  await assert.rejects(db.query('insert into nmls_biosig_identifiers(student_id, sequence) values($1, 1)', [randomUUID()]), /non-DEFAULT|generated|identity/i, 'a number cannot be chosen by the caller');
});
