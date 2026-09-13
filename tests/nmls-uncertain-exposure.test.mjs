import test from 'node:test';
import assert from 'node:assert/strict';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { startNmlsSessionPolicy, applyNmlsSessionPolicy } from '../lib/nmls-session-policy.mjs';
import { addNmlsRecoveryDebit, nmlsRestrictionUsage, unionNmlsExposureIntervals,
  validateNmlsUncertainExposure } from '../lib/nmls-uncertain-exposure.mjs';

// Synthetic clocks/ROCS only; never a human timing/identity/approval record.
const at = Date.UTC(2026, 5, 1, 12), minute = 60000;
const o = { id: 'synthetic-offering', contentDigest: 'a'.repeat(64), year: 2026,
  educationType: 'annual_ce', timeZone: 'UTC', deadlineBasisId: 'fixture-only',
  opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
  rocs: { version: '4', documentDigest: 'b'.repeat(64), fullDocumentVerified: true, evidenceId: 'synthetic-only' } };
function active() {
  const s = startNmlsSessionPolicy('fixture-actor');
  Object.assign(s, { sessionStartedAtMs: at, studyBoundaryAtMs: at, lastStudyAtMs: at, lastReceiptMs: at });
  s.acceptances.push({ offeringId: o.id, contentDigest: o.contentDigest, documentDigest: o.rocs.documentDigest,
    version: '4', acceptedAtMs: at });
  return s;
}
function step(state, kind, now, offering = o, extra = {}) {
  return applyNmlsSessionPolicy(state, { kind, expectedRevision: state.revision }, offering,
    { actorId: state.actorId, receivedAtMs: now, ...extra });
}

test('policy version is explicit and old or malformed debit history cannot silently initialize', () => {
  assert.equal(P.id, 'statecourse-oss-session-draft-2026-02');
  const s = active();
  assert.throws(() => step({ ...s, policyId: 'statecourse-oss-session-draft-2026-01' }, 'check_access', at), /version_mismatch/);
  for (const value of [undefined, {}, { ...s.uncertainExposure, version: 'invented' },
    { ...s.uncertainExposure, intervals: [{ start: at, end: at + 1 }] },
    { ...s.uncertainExposure, lastBoundaryMs: at + 10, intervals: [{ start: at, end: at + 6 }, { start: at + 5, end: at + 10 }] },
    { ...s.uncertainExposure, lastBoundaryMs: NaN }, { ...s.uncertainExposure, creditAddedMs: 1 }]) {
    assert.throws(() => step({ ...s, uncertainExposure: value }, 'check_access', at), /invalid_uncertain/);
  }
});

test('restriction union merges overlap, adjacency and containment exactly once without mutating inputs', () => {
  const observed = [{ start: at, end: at + 100 }], debit = [{ start: at + 50, end: at + 200 }, { start: at + 20, end: at + 30 }];
  const original = structuredClone([observed, debit]);
  assert.deepEqual(unionNmlsExposureIntervals(observed, debit, [{ start: at + 200, end: at + 300 }]), [{ start: at, end: at + 300 }]);
  assert.deepEqual([observed, debit], original);
  const s = active(); s.studyIntervals = observed; s.studySinceBreakMs = 100;
  const next = addNmlsRecoveryDebit(s, at + 50, at + 200).state;
  assert.deepEqual(nmlsRestrictionUsage(next, at + 200), { rollingMs: 200, sinceBreakMs: 200, latestPossibleExposureMs: at + 200 });
  assert.deepEqual(next.studyIntervals, observed); assert.equal(next.studySinceBreakMs, 100);
  assert.equal(next.lastStudyAtMs, at); assert.equal(next.creditIssuanceAllowed, false);
  assert.equal(s.breakStartedAtMs, null);
});

test('every recovery starts a new full pause; earlier break cannot erase gap or rolling usage', () => {
  let s = active(); s.breakStartedAtMs = at;
  s = step(s, 'end_break', at + P.minimumBreakMs).state;
  s = addNmlsRecoveryDebit(s, at, at + P.minimumBreakMs + 1).state;
  const end = s.breakStartedAtMs;
  assert.equal(step(s, 'end_break', end + P.minimumBreakMs - 1).code, 'break_incomplete');
  assert.equal(step(s, 'check_access', end + P.minimumBreakMs).code, 'break_in_progress');
  const ended = step(s, 'end_break', end + P.minimumBreakMs);
  assert.equal(ended.code, 'break_completed');
  assert.equal(ended.state.studySinceBreakMs, 0);
  assert.equal(nmlsRestrictionUsage(ended.state, end + P.minimumBreakMs).rollingMs, P.minimumBreakMs + 1);
  assert.equal(nmlsRestrictionUsage(ended.state, end + P.minimumBreakMs).sinceBreakMs, 0);
  assert.equal(step(ended.state, 'check_access', end + P.minimumBreakMs).ok, true);
});

test('repeated recovery debt accumulates actor-wide across accepted offerings, never as observed study', () => {
  let s = active();
  s = addNmlsRecoveryDebit(s, at, at + minute).state;
  s = step(s, 'end_break', at + minute + P.minimumBreakMs).state;
  s = addNmlsRecoveryDebit(s, at + 12 * minute, at + 14 * minute).state;
  s = step(s, 'end_break', at + 14 * minute + P.minimumBreakMs).state;
  const other = { ...o, id: 'synthetic-other-offering' };
  s.acceptances.push({ ...s.acceptances[0], offeringId: other.id });
  assert.equal(step(s, 'check_access', at + 24 * minute, other).ok, true);
  assert.equal(nmlsRestrictionUsage(s, at + 24 * minute).rollingMs, 3 * minute);
  assert.deepEqual(s.studyIntervals, []); assert.equal(s.studySinceBreakMs, 0);
  assert.equal(s.lastStudyAtMs, at); assert.equal(s.creditIssuanceAllowed, false);
});

test('long uncertainty remains blocked by new-session rest and rolling cap after recovery pause', () => {
  let s = active(); const reset = at + 13 * 60 * minute;
  s = addNmlsRecoveryDebit(s, at, reset).state;
  s = step(s, 'end_break', reset + P.minimumBreakMs).state;
  const early = step(s, 'open_session', reset + P.minimumBreakMs);
  assert.equal(early.code, 'session_wall_limit'); assert.equal(early.state.sessionStartedAtMs, at);
  const rested = step(early.state, 'open_session', reset + P.minimumNewSessionRestMs);
  assert.equal(rested.code, 'rolling_study_limit');
  assert.equal(rested.state.studySinceBreakMs, 0);
  assert.equal(rested.state.sessionStartedAtMs, reset + P.minimumNewSessionRestMs);
  assert.equal(nmlsRestrictionUsage(rested.state, reset + P.minimumNewSessionRestMs).rollingMs, 12 * 60 * minute);
});

test('exact rolling boundary and next permitted horizon include conservative debt without early release', () => {
  let s = active(), end = at + P.rollingStudyLimitMs;
  s = addNmlsRecoveryDebit(s, at, end).state;
  s = step(s, 'end_break', end + P.minimumBreakMs).state;
  assert.equal(step(s, 'check_access', end + P.minimumBreakMs).code, 'rolling_study_limit');
  const boundary = at + P.rollingWindowMs;
  const exact = step(s, 'open_session', boundary);
  assert.equal(exact.code, 'rolling_study_limit');
  const one = step(exact.state, 'check_access', boundary + 1);
  assert.equal(one.ok, true); assert.equal(one.maxNextStudyMs, 1);
  assert.deepEqual(one.state.studyIntervals, []);
});

test('pruning rolling debit never erases last exposure boundary or modifies observed history', () => {
  let s = active(); s = addNmlsRecoveryDebit(s, at, at + minute).state;
  s = step(s, 'end_break', at + minute + P.minimumBreakMs).state;
  const r = step(s, 'open_session', at + minute + P.rollingWindowMs + P.maximumObservationMs + 1);
  assert.equal(r.ok, true); assert.deepEqual(r.state.uncertainExposure.intervals, []);
  assert.equal(r.state.uncertainExposure.lastBoundaryMs, at + minute);
  assert.deepEqual(r.state.studyIntervals, []); assert.equal(r.state.lastStudyAtMs, at);
  validateNmlsUncertainExposure(r.state.uncertainExposure);
});

test('recovery debit rejects backward/invalid boundaries and cannot create negative or fabricated observations', () => {
  const s = addNmlsRecoveryDebit(active(), at, at + 100).state;
  for (const [start, end] of [[at + 100, at], [NaN, at + 200], [at, Infinity], [at, at + 99], [at, 8.64e15]]) {
    assert.throws(() => addNmlsRecoveryDebit(s, start, end), /invalid_uncertain/);
  }
  const zero = addNmlsRecoveryDebit(s, at + 200, at + 200);
  assert.equal(zero.state.uncertainExposure.lastBoundaryMs, at + 200);
  assert.deepEqual(zero.state.uncertainExposure.intervals, s.uncertainExposure.intervals);
  assert.equal(zero.resumeNotBeforeMs, at + 200 + P.minimumBreakMs);
});
