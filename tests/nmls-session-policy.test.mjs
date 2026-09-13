import test from 'node:test';
import assert from 'node:assert/strict';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { startNmlsSessionPolicy, applyNmlsSessionPolicy, validateNmlsAnnualWindow } from '../lib/nmls-session-policy.mjs';

// Synthetic evidence only. No actual ROCS document, student, approval or credit.
const start = Date.parse('2026-06-01T12:00:00Z');
const offering = () => ({ id: 'fixture-2026-a', contentDigest: 'a'.repeat(64), year: 2026,
  educationType: 'annual_ce', timeZone: 'America/New_York', deadlineBasisId: 'fixture-only',
  opensAtMs: Date.parse('2026-01-01T05:00:00Z'), closesAtMs: Date.parse('2027-01-01T05:00:00Z'),
  rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true, evidenceId: 'synthetic-rocs-only' } });
function harness(o = offering()) {
  let state = startNmlsSessionPolicy('synthetic-student'); let at = start;
  const h = { get state() { return state; }, get at() { return at; }, offering: o,
    act(kind, fields = {}, evidence = {}, when = at) {
      at = when;
      const prior = structuredClone(state);
      const r = applyNmlsSessionPolicy(state, { kind, expectedRevision: state.revision, ...fields }, h.offering,
        { actorId: state.actorId, receivedAtMs: at, ...evidence });
      assert.deepEqual(state, prior, 'input immutable'); assert.equal(r.creditIssuanceAllowed, false);
      state = r.state; return r;
    },
    accept() { return h.act('accept_rocs', { version: '4', documentDigest: h.offering.rocs.documentDigest, acknowledged: true }, {
      presentation: { id: 'synthetic-presentation', actorId: state.actorId, offeringId: h.offering.id,
        contentDigest: h.offering.contentDigest, documentDigest: h.offering.rocs.documentDigest, presentedAtMs: at },
    }); },
    study(ms) {
      assert.ok(ms > 0 && ms <= P.maximumObservationMs);
      return h.act('observe_study', {}, { studyInterval: { start: at, end: at + ms } }, at + ms);
    },
    minutes(n) { for (let i = 0; i < n * 2; i++) assert.equal(h.study(30_000).ok, true); },
    break() { h.act('begin_break'); return h.act('end_break', {}, {}, at + P.minimumBreakMs); },
  }; return h;
}
function active() { const h = harness(); assert.equal(h.accept().ok, true); assert.equal(h.act('open_session').ok, true); return h; }

test('annual window has explicit verified-basis reference/timezone and cannot cross its year', () => {
  assert.equal(validateNmlsAnnualWindow(offering()), true);
  for (const delta of [
    { timeZone: '' }, { timeZone: 'Invalid/Zone' }, { deadlineBasisId: '' },
    { educationType: 'late_ce' }, { opensAtMs: Date.parse('2026-01-01T04:59:59Z') },
    { closesAtMs: Date.parse('2027-01-01T05:00:00.001Z') }, { closesAtMs: NaN },
    { year: 2027 }, { closesAtMs: offering().opensAtMs },
  ]) assert.throws(() => validateNmlsAnnualWindow({ ...offering(), ...delta }), /invalid_annual_delivery_window/);
});

test('ROCS requires exact full-document presentation and per-offering acceptance, not account login', () => {
  const h = harness();
  assert.equal(h.act('open_session').code, 'rocs_required');
  assert.equal(h.act('accept_rocs', { version: '4', documentDigest: 'c'.repeat(64), acknowledged: true }).code, 'rocs_presentation_required');
  assert.equal(h.act('accept_rocs', { version: '3', documentDigest: 'c'.repeat(64), acknowledged: true }).code, 'rocs_acknowledgment_required');
  const r = h.accept(); assert.equal(r.code, 'rocs_accepted');
  assert.equal(r.audit.receipt.retentionYears, 5); assert.equal(r.audit.receipt.actorId, 'synthetic-student');
  assert.equal(r.audit.receipt.acceptedAtMs, start); assert.equal(r.audit.receipt.presentationId, 'synthetic-presentation');
  assert.equal(h.accept().code, 'rocs_already_accepted'); assert.equal(h.state.acceptances.length, 1);
  h.offering = { ...h.offering, id: 'fixture-2026-b' };
  assert.equal(h.act('open_session').code, 'rocs_required');
  h.accept(); assert.equal(h.state.acceptances.length, 2);
  h.offering = { ...h.offering, contentDigest: 'b'.repeat(64) };
  assert.equal(h.act('open_session').code, 'rocs_required');
  h.offering.rocs = { ...h.offering.rocs, fullDocumentVerified: false };
  assert.equal(h.accept().code, 'rocs_document_unverified');
});

test('200-minute provider break boundary, minimum break and repeat clicks earn no time or reset', () => {
  const h = active(); h.minutes(199); assert.equal(h.study(30_000).ok, true);
  assert.equal(h.study(30_000).ok, true); assert.equal(h.state.studySinceBreakMs, P.breakAfterStudyMs);
  assert.equal(h.act('check_access').code, 'mandatory_break_required');
  assert.equal(h.act('open_session').code, 'mandatory_break_required');
  h.act('begin_break'); const began = h.state.breakStartedAtMs;
  h.act('begin_break', {}, {}, began + 100); assert.equal(h.state.breakStartedAtMs, began);
  assert.equal(h.study(100).code, 'break_in_progress');
  assert.equal(h.act('end_break', {}, {}, began + P.minimumBreakMs - 1).code, 'break_incomplete');
  assert.equal(h.act('end_break', {}, {}, began + P.minimumBreakMs).ok, true);
  assert.equal(h.state.studySinceBreakMs, 0);
  assert.equal(h.state.studyIntervals.reduce((s, i) => s + i.end - i.start, 0), P.breakAfterStudyMs);
  assert.equal(h.study(30_000).ok, true);
});

test('actor-wide rolling usage survives course changes, breaks and session reopen', () => {
  const h = active(); h.minutes(200); h.break();
  h.offering = { ...h.offering, id: 'fixture-2026-b' }; h.accept(); h.act('open_session');
  h.minutes(200); h.break(); h.minutes(200); h.break();
  assert.equal(h.act('check_access').code, 'rolling_study_limit');
  assert.equal(h.act('open_session').code, 'rolling_study_limit');
  const at = h.at;
  assert.equal(h.act('open_session', {}, {}, at + P.minimumNewSessionRestMs).code, 'rolling_study_limit');
  // Both the rest and rolling history must clear; refreshing is insufficient.
  assert.equal(h.act('open_session', {}, {}, at + 25 * 3600_000).ok, true);
  assert.equal(h.study(30_000).ok, true);
});

test('wall-session expiry is not reset by a break or polls; real rest can permit a new session', () => {
  const h = active(); h.minutes(1); h.break();
  const lastStudy = h.state.lastStudyAtMs;
  assert.equal(h.act('check_access', {}, {}, start + P.sessionWallLimitMs).code, 'session_wall_limit');
  assert.equal(h.act('open_session').code, 'session_wall_limit');
  h.act('check_access', {}, {}, lastStudy + P.minimumNewSessionRestMs - 1);
  assert.equal(h.act('open_session', {}, {}, lastStudy + P.minimumNewSessionRestMs).ok, true);
  assert.equal(h.state.studySinceBreakMs, 0); assert.equal(h.study(30_000).ok, true);
});

test('reopening an already-open new session cannot move its first observation boundary', () => {
  const h = active(); h.minutes(1);
  const resumed = h.at + P.minimumNewSessionRestMs;
  assert.equal(h.act('open_session', {}, {}, resumed).ok, true);
  assert.equal(h.act('open_session', {}, {}, resumed + 10_000).ok, true);
  assert.equal(h.state.studyBoundaryAtMs, resumed);
  const r = h.act('observe_study', {}, { studyInterval: { start: resumed, end: resumed + 30_000 } }, resumed + 30_000);
  assert.equal(r.ok, true); assert.equal(h.state.studySinceBreakMs, 30_000);
});

test('server deadline is exclusive: no backdated completion or seven-day banking grace', () => {
  const h = active(); const cutoff = h.offering.closesAtMs;
  assert.equal(h.act('open_session', {}, {}, cutoff - 1).ok, true);
  const before = h.state.studySinceBreakMs;
  assert.equal(h.study(1).code, 'delivery_window_closed');
  assert.equal(h.state.studySinceBreakMs, before);
  assert.equal(h.act('open_session', {}, {}, cutoff + 86400_000).code, 'delivery_window_closed');
  h.offering = { ...h.offering, year: 2027, id: 'fixture-2027',
    opensAtMs: cutoff, closesAtMs: Date.parse('2028-01-01T05:00:00Z') };
  assert.equal(h.act('open_session').code, 'rocs_required', 'never auto-transfer a prior-year acceptance');
});

test('untrusted actor/clock/revision and browser-supplied time or policy overrides are rejected', () => {
  const h = active();
  for (const [fields, evidence, pattern] of [
    [{ earnedMs: 3000 }, {}, /invalid_policy_command/],
    [{ receivedAtMs: start }, {}, /invalid_policy_command/],
    [{ expectedRevision: 0 }, {}, /policy_revision_conflict/],
    [{}, { actorId: 'other-student' }, /invalid_policy_server_evidence/],
    [{}, { receivedAtMs: start - 1 }, /invalid_policy_server_evidence/],
  ]) assert.throws(() => h.act('check_access', fields, evidence), pattern);
  assert.equal(h.act('observe_study').code, 'invalid_study_interval');
  assert.equal(h.study(30_000).ok, true);
  assert.equal(h.act('observe_study', {}, { studyInterval: { start, end: h.at } }).code, 'invalid_study_interval');
  assert.equal(h.act('observe_study', {}, { studyInterval: { start: h.at, end: h.at + 30_001 } }, h.at + 30_001).code, 'invalid_study_interval');
  assert.equal(h.state.studySinceBreakMs, 30_000);
});

test('navigation/other-course agreement cannot discard an in-flight study interval', () => {
  const h = active();
  h.act('check_access', {}, {}, start + 10_000);
  const original = h.offering;
  h.offering = { ...original, id: 'fixture-2026-b' }; h.accept(); h.offering = original;
  const r = h.act('observe_study', {}, { studyInterval: { start, end: start + 30_000 } }, start + 30_000);
  assert.equal(r.ok, true); assert.equal(h.state.studySinceBreakMs, 30_000);
  h.break();
  assert.equal(h.act('observe_study', {}, { studyInterval: { start: h.at - 10_000, end: h.at } }).code, 'invalid_study_interval', 'cannot include break time');
});

test('exact remaining horizon and persistent refusal when an observed interval crosses a limit', () => {
  const h = active(); h.minutes(199); h.study(30_000); h.study(29_000);
  assert.equal(h.act('check_access').maxNextStudyMs, 1000);
  const violation = h.study(30_000);
  assert.equal(violation.code, 'mandatory_break_required'); assert.equal(violation.audit.observedOutsidePolicy, true);
  assert.equal(h.state.studySinceBreakMs, P.breakAfterStudyMs + 29_000);
  assert.equal(h.act('check_access').code, 'mandatory_break_required');
  assert.equal(h.act('open_session').code, 'mandatory_break_required');
  h.break(); h.minutes(199); h.study(30_000); h.study(1000); h.break(); h.minutes(199); h.study(30_000); h.study(29_000);
  // Total599m59s across three study stretches; remaining rolling budget1s.
  assert.equal(h.act('check_access').maxNextStudyMs, 1000);
  const daily = h.study(30_000); assert.equal(daily.code, 'mandatory_break_required');
  h.break(); assert.equal(h.act('check_access').code, 'rolling_study_limit');
  const separate = active();
  for (let i = 0; i < 3; i++) { separate.minutes(150); separate.break(); }
  separate.minutes(149); separate.study(30_000); separate.study(29_000);
  assert.equal(separate.act('check_access').maxNextStudyMs, 1000);
  assert.equal(separate.study(30_000).code, 'rolling_study_limit', 'rolling violation without crossing break threshold');
  assert.equal(separate.act('check_access').code, 'rolling_study_limit');
});
