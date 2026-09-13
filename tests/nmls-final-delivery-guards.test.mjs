import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { makeFinalDeliveryFixture } from './helpers/nmls-final-delivery-fixture.mjs';
import { makeNmlsFirstFinalDeliveryContext, nmlsFinalDeliveryScope } from '../lib/nmls-final-delivery-context.mjs';
import { createNmlsFirstFinalDeliveryEvaluator, startNmlsFirstFinalDelivery } from '../lib/nmls-final-delivery.mjs';

// SYNTHETIC completed source, invented authority/ROCS rows and explicit clocks.
// Each positive below is the actual final evaluator's unmodified transition,
// independently checked by034 before advancing the in-memory ledger/runtime.
// This pure SQL guard test does NOT prove durable035 transaction authorization,
// identity, delivery, instructional time, a real ROCS archive or course credit.
const clone = structuredClone;
const migrations = ['023_nmls_review_runtime.sql', '024_nmls_review_discovery.sql',
  '025_nmls_review_session_policy.sql', '026_nmls_private_final_history.sql',
  '027_nmls_policy_exposure_guards.sql', '028_nmls_private_final_remediation.sql',
  '029_nmls_initial_exposure.sql', '030_nmls_phase_write_fences.sql',
  '031_nmls_teaching_exposure_guards.sql', '032_nmls_joint_teaching.sql',
  '033_nmls_final_reservation.sql', '034_nmls_final_delivery_guards.sql'];
const query = 'select public.nmls_final_delivery_guard($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)';

async function harness(guard) {
  const f = await makeFinalDeliveryFixture();
  let ledger = clone(f.ledger), time = f.timeMs;
  const evaluator = createNmlsFirstFinalDeliveryEvaluator();
  const context = () => makeNmlsFirstFinalDeliveryContext({ ...f.input,
    actorPolicy: { ...f.input.actorPolicy, revision: ledger.revision, ledger } });
  let runtime = startNmlsFirstFinalDelivery(context().finalPhase);
  const h = {
    input: f.input, get now() { return time; }, get runtime() { return runtime; },
    set runtime(value) { runtime = clone(value); }, get ledger() { return ledger; },
    set ledger(value) { ledger = clone(value); },
    proposal(kind, extra = {}, at = time + 1, receipt = true, presentation) {
      const c = { ...context(), ledger, runtime,
        command: { kind, eventId: randomUUID(), expectedRevision: runtime.revision,
          expectedActorRevision: ledger.revision, sessionId: runtime.sessionId,
          ...(receipt && ledger.observationJournal.active ? { studyReceipt: {
            windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra },
        evidence: { actorId: f.input.actorId, receivedAtMs: at, ...(presentation ? { presentation } : {}) } };
      const unchanged = clone({ ledger, runtime, command: c.command, offering: c.offering });
      const result = evaluator(c);
      assert.deepEqual({ ledger, runtime, command: c.command, offering: c.offering }, unchanged);
      const args = clone([ledger, result.ledger, runtime, result.runtime, result.outcome,
        result.audit, c.offering, f.input.actorId, f.input.review.id, c.command.eventId,
        at, nmlsFinalDeliveryScope(c.finalPhase), c.command]);
      return { args, result, kind };
    },
    async act(kind, extra = {}, at = time + 1, receipt = true, presentation) {
      const p = h.proposal(kind, extra, at, receipt, presentation);
      await guard(p);
      runtime = p.result.runtime; ledger = p.result.ledger; time = at;
      assert.equal(p.result.audit.instructionalTimeAddedMs, 0);
      assert.equal(p.result.audit.creditAddedMs, 0);
      assert.equal(p.result.outcome.deliveryAllowed, false);
      assert.equal(p.result.outcome.studentDeliveryEnabled, false);
      assert.equal(p.result.outcome.creditIssuanceAllowed, false);
      return p;
    },
    async open() { await h.act('activate'); return h.act('heartbeat', {}, time + 10); },
  };
  return h;
}

test('034 independently guards actual first-final candidates (synthetic local SQL)', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; a skip is not verification.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table students(id uuid primary key);');
  for (const file of migrations) await db.exec(readFileSync(new URL(`../database/${file}`, import.meta.url), 'utf8'));
  const accepted = [], rejected = [];
  async function guard(p) {
    try { await db.query(query, p.args); }
    catch (error) { error.message = `${p.kind}/${p.result.outcome.code}: ${error.message}`; throw error; }
    accepted.push(clone(p));
  }
  async function rejects(p, label, mutate, pattern = /nmls_final_delivery_/) {
    const args = clone(p.args); mutate(args);
    await assert.rejects(db.query(query, args), pattern, label); rejected.push(label);
  }
  let opening, firstAck, continuous, cleanStop, recovered, hidden, idle;

  await t.test('open, first acknowledgment, renewed observation, rotation and clean controls', async () => {
    const h = await harness(guard);
    const source = clone(h.input.review), form = clone(h.input.reservedFinal);
    opening = await h.act('activate');
    const beforeObserved = clone(h.ledger.studyIntervals), activity = h.runtime.lastActivityMs;
    firstAck = await h.act('interaction', { visible: true }, h.now + 100);
    assert.equal(h.runtime.lastActivityMs, activity, 'first receipt is not activity');
    assert.deepEqual(h.ledger.studyIntervals, beforeObserved, 'first receipt awards no observed time');
    assert.equal(h.ledger.uncertainExposure.lastBoundaryMs, h.now);
    continuous = await h.act('interaction', { visible: true }, h.now + 1000);
    assert.equal(h.runtime.lastActivityMs, h.now);
    for (let i = 0; i < 12; i++) {
      await h.act('heartbeat', {}, h.now + 25000);
      await h.act('interaction', { visible: true }, h.now + 1);
    }
    const oldSession = h.runtime.sessionId, oldWindow = h.ledger.observationJournal.active.id;
    const rotated = await h.act('resume');
    assert.notEqual(h.runtime.sessionId, oldSession); assert.notEqual(h.ledger.observationJournal.active.id, oldWindow);
    assert.equal(rotated.result.audit.observation.closedWindow.lastObservedAtMs, h.now);
    await h.act('heartbeat'); cleanStop = await h.act('pause');
    assert.equal(h.ledger.observationJournal.active, null);
    await h.act('begin_break');
    assert.equal((await h.act('end_break', {}, h.now + 599999)).result.outcome.code, 'break_incomplete');
    assert.equal((await h.act('end_break')).result.outcome.code, 'break_completed');
    await h.act('resume'); await h.act('heartbeat'); await h.act('logout'); await h.act('resume');
    assert.deepEqual(h.input.review, source); assert.deepEqual(h.input.reservedFinal, form);
  });

  await t.test('hidden hold cannot be laundered by controls; recovery uses original boundary and fresh pause', async () => {
    const h = await harness(guard); await h.open();
    await h.act('interaction', { visible: true }, h.now + 500);
    const w = clone(h.ledger.observationJournal.active), observed = clone(h.ledger.studyIntervals);
    hidden = await h.act('heartbeat', { studyReceipt: { windowId: w.id, visible: false } }, h.now + 1000);
    assert.equal(hidden.result.outcome.observationCode, 'visibility_interrupted');
    await h.act('resume'); await h.act('begin_break');
    await h.act('end_break', {}, h.now + 600000);
    assert.deepEqual(h.ledger.observationJournal.unresolved.window, w);
    await assert.rejects(async () => h.proposal('recover_observation', { recoveryWindowId: randomUUID() }), /recovery_window_conflict/);
    recovered = await h.act('recover_observation', { recoveryWindowId: w.id });
    assert.equal(h.ledger.breakStartedAtMs, h.now);
    assert.equal(recovered.result.outcome.resumeNotBeforeMs, h.now + 600000);
    assert.equal(recovered.result.audit.observation.recovery.debitStartMs, w.lastObservedAtMs);
    assert.deepEqual(h.ledger.studyIntervals, observed); assert.equal(h.ledger.observationJournal.unresolved, null);
    assert.equal((await h.act('resume')).result.outcome.code, 'break_in_progress');
    await h.act('end_break', {}, h.now + 600000); await h.act('resume');
  });

  await t.test('missing and expired first receipts debit from issuance only on recovery', async () => {
    for (const reason of ['receipt_missing_or_stale', 'horizon_expired']) {
      const h = await harness(guard); await h.act('activate');
      const w = clone(h.ledger.observationJournal.active), observed = clone(h.ledger.studyIntervals);
      const interrupted = await h.act('heartbeat', {}, h.now + (reason === 'horizon_expired' ? 30001 : 100), reason !== 'receipt_missing_or_stale');
      assert.equal(interrupted.result.outcome.observationCode, reason);
      const r = await h.act('recover_observation', { recoveryWindowId: w.id });
      assert.equal(r.result.audit.observation.recovery.debitStartMs, w.issuedAtMs);
      assert.deepEqual(h.ledger.studyIntervals, observed);
    }
  });

  await t.test('material-revision and settlement rejection retain manual-review hold', async () => {
    for (const reason of ['material_revision_interrupted', 'settlement_rejected']) {
      const h = await harness(guard); await h.open();
      // Explicit owner-fault fixture, not a browser-controlled accepted state.
      if (reason === 'material_revision_interrupted') h.ledger.observationJournal.active.runtimeRevision--;
      else h.ledger.lastStudyAtMs = h.now + 1;
      const p = await h.act('heartbeat', {}, h.now + 2);
      assert.equal(p.result.outcome.observationCode, reason);
      const held = clone(h.ledger.observationJournal.unresolved);
      assert.equal((await h.act('recover_observation', { recoveryWindowId: held.window.id })).result.outcome.code, 'recovery_review_required');
      assert.deepEqual(h.ledger.observationJournal.unresolved, held);
    }
  });

  await t.test('idle exact boundary precedes activity, resume and policy controls', async () => {
    for (const kind of ['interaction', 'resume', 'begin_break', 'accept_rocs']) {
      const h = await harness(guard); await h.open();
      // Owner-fault historical activity timestamp puts a valid current receipt
      // exactly at idle expiry without manufacturing an evaluator green flag.
      h.runtime.lastActivityMs = h.now + 1 - 360000;
      const extra = kind === 'interaction' ? { visible: true } : kind === 'accept_rocs' ? {
        version: '4', documentDigest: h.input.binding.offering.rocs.documentDigest, acknowledged: true } : {};
      idle = await h.act(kind, extra);
      assert.equal(idle.result.outcome.code, 'inactivity_logout');
      assert.equal(idle.result.outcome.status, 401); assert.equal(idle.result.outcome.candidateMaterialAllowed, false);
      assert.equal(h.runtime.lastActivityMs, h.now - 360000);
      assert.equal(h.ledger.breakStartedAtMs, null);
    }
  });

  await t.test('break, daily and session budget refusals are genuine policy outputs', async () => {
    for (const boundary of ['break', 'daily', 'wall']) {
      const h = await harness(guard);
      // Synthetic owner-loaded history exercises independently recomputed limits.
      if (boundary === 'break') h.ledger.studySinceBreakMs = 12000000;
      if (boundary === 'daily') {
        h.ledger.studyIntervals = [{ start: h.now - 36000000, end: h.now }];
        h.ledger.studySinceBreakMs = 0; h.ledger.studyBoundaryAtMs = h.now;
      }
      if (boundary === 'wall') h.ledger.sessionStartedAtMs = h.now - 43200000;
      const p = await h.act('activate');
      assert.equal(p.result.outcome.candidateMaterialAllowed, false);
      assert.match(p.result.outcome.policyCode, /break_required|rolling_study_limit|session_wall_limit/);
    }
    const h = await harness(guard); await h.open();
    h.ledger.studySinceBreakMs = 11999990;
    const p = await h.act('heartbeat', {}, h.now + 20);
    assert.equal(p.result.audit.policy.observation.observedOutsidePolicy, true);
    assert.equal(p.result.outcome.candidateMaterialAllowed, false);
    assert.equal(h.ledger.studyIntervals.at(-1).end, h.now, 'actual observation remains restriction evidence');
  });

  await t.test('full-rest session reset and annual closure do not erase evidence', async () => {
    const h = await harness(guard); await h.open(); await h.act('logout');
    const oldIntervals = clone(h.ledger.studyIntervals);
    await h.act('resume', {}, h.now + 43200001);
    assert.equal(h.ledger.sessionStartedAtMs, h.now);
    assert.deepEqual(h.ledger.studyIntervals, oldIntervals);
    const year = await harness(guard);
    year.input.binding.offering.closesAtMs = year.now + 10000; // Valid synthetic2026 annual cutoff.
    await year.act('activate');
    assert.equal(year.ledger.observationJournal.active.horizonMs, year.input.binding.offering.closesAtMs);
    const journal = clone(year.ledger.observationJournal);
    const p = await year.act('heartbeat', {}, year.input.binding.offering.closesAtMs);
    assert.equal(p.result.outcome.observationCode, 'outside_window_no_settlement');
    assert.deepEqual(year.ledger.observationJournal, journal);
    await rejects(p, 'closed-year journal erasure', a => { a[1].observationJournal.active = null; });
  });

  await t.test('retention pruning preserves boundaries and overlapping evidence is unioned once', async () => {
    const h = await harness(guard), at = h.now;
    // Explicit synthetic owner history straddles the rolling retention cutoff.
    h.ledger.studyBoundaryAtMs = at - 1000; h.ledger.studySinceBreakMs = 500;
    h.ledger.studyIntervals = [{ start: at - 86500000, end: at - 86440000 }, { start: at - 500, end: at }];
    h.ledger.uncertainExposure = { version: 'nmls-uncertain-exposure-v1', lastBoundaryMs: at - 100,
      intervals: [{ start: at - 86600000, end: at - 86500000 }, { start: at - 700, end: at - 100 }] };
    const p = await h.act('activate');
    assert.deepEqual(h.ledger.studyIntervals, [{ start: at - 500, end: at }]);
    assert.deepEqual(h.ledger.uncertainExposure.intervals, [{ start: at - 700, end: at - 100 }]);
    assert.equal(h.ledger.uncertainExposure.lastBoundaryMs, at - 100);
    assert.equal(h.ledger.studySinceBreakMs, 500, 'uncertain overlap never becomes observed time');
    await rejects(p, 'retained uncertainty erased', a => { a[1].uncertainExposure.intervals = []; });
    await rejects(p, 'pruning resets exposure boundary', a => { a[1].uncertainExposure.lastBoundaryMs = null; });
    await h.act('heartbeat'); await h.act('interaction', { visible: true }, h.now + 100);
  });

  await t.test('initial gap consumes exact remaining break/day/wall horizon without observed credit', async () => {
    for (const boundary of ['break', 'daily', 'wall']) {
      const h = await harness(guard);
      if (boundary === 'break') {
        h.ledger.studySinceBreakMs = 11999970;
        h.ledger.uncertainExposure.intervals = []; // Isolated synthetic30ms remaining counter fixture.
      }
      if (boundary === 'daily') {
        h.ledger.studyIntervals = [{ start: h.now - 35999970, end: h.now }];
        h.ledger.studySinceBreakMs = 0; h.ledger.studyBoundaryAtMs = h.now;
        h.ledger.uncertainExposure.intervals = [];
      }
      if (boundary === 'wall') h.ledger.sessionStartedAtMs = h.now - 43200000 + 31;
      await h.act('activate');
      assert.equal(h.ledger.observationJournal.active.horizonMs - h.now, 30);
      const observed = clone(h.ledger.studyIntervals);
      const p = await h.act('heartbeat', {}, h.now + 20);
      assert.equal(p.result.outcome.candidateUntilMs - h.now, 10);
      assert.deepEqual(h.ledger.studyIntervals, observed);
      const stopped = await h.act('heartbeat', {}, h.now + 10);
      assert.equal(stopped.result.outcome.candidateMaterialAllowed, false);
      assert.match(stopped.result.outcome.policyCode, /mandatory_break_required|rolling_study_limit|session_wall_limit/);
    }
  });

  await t.test('same-phase session interruption retains original held scope for recovery', async () => {
    const h = await harness(guard); await h.open();
    h.ledger.observationJournal.active.scope.sessionId = randomUUID(); // Explicit owner-fault lease/window divergence.
    const p = await h.act('heartbeat');
    assert.equal(p.result.outcome.observationCode, 'session_interrupted');
    const held = clone(h.ledger.observationJournal.unresolved);
    const r = await h.act('recover_observation', { recoveryWindowId: held.window.id });
    assert.deepEqual(r.result.audit.observation.recovery.original, held);
    assert.equal(r.result.outcome.candidateMaterialAllowed, false);
  });

  await t.test('ROCS structural receipt checks use actual policy reducer output', async () => {
    const h = await harness(guard); h.ledger.acceptances = []; // Synthetic owner-missing receipt history.
    assert.equal((await h.act('activate')).result.outcome.code, 'rocs_required');
    const at = h.now + 1, id = randomUUID(), rocs = h.input.binding.offering.rocs;
    const p = await h.act('accept_rocs', { version: '4', documentDigest: rocs.documentDigest,
      acknowledged: true, presentationId: id }, at, true, { id, actorId: h.input.actorId,
      offeringId: h.input.binding.offering.id, contentDigest: h.input.sourceCourse.digest,
      documentDigest: rocs.documentDigest, presentedAtMs: at });
    assert.equal(p.result.outcome.code, 'rocs_accepted');
    await rejects(p, 'presentation selector mismatch', a => { a[12].presentationId = randomUUID(); });
    await rejects(p, 'new receipt actor forgery', a => { a[5].policy.receipt.actorId = randomUUID(); });
    await h.act('activate');
  });

  await t.test('captured real proposals reject malformed, forged, omitted or greenwashed fields', async () => {
    for (const [label, edit] of [
      ['extra phase revision', a => { a[11].revision = 1; }],
      ['foreign phase actor', a => { a[11].actorId = randomUUID(); }],
      ['wrong event intent', a => { a[12].eventId = randomUUID(); }],
      ['wrong actor CAS', a => { a[12].expectedActorRevision++; }],
      ['wrong session intent', a => { a[12].sessionId = randomUUID(); }],
      ['unknown answer payload', a => { a[12].answers = {}; }],
      ['null runtime', a => { a[3] = null; }],
      ['null runtime status', a => { a[3].status = null; }],
      ['null candidate flag', a => { a[4].candidateMaterialAllowed = null; }],
      ['delivery green flag', a => { a[4].deliveryAllowed = true; }],
      ['credit green flag', a => { a[1].creditIssuanceAllowed = true; }],
      ['extra questions', a => { a[4].questions = []; }],
      ['enlarged horizon', a => { a[4].candidateUntilMs++; }],
      ['forged opening event', a => { a[1].observationJournal.active.openingEventId = randomUUID(); }],
      ['forged material digest', a => { a[1].observationJournal.active.materialDigest = 'f'.repeat(64); }],
      ['teaching scope substitution', a => { const s = a[1].observationJournal.active.scope; s.teachingPhase = s.finalPhase; delete s.finalPhase; }],
      ['null journal', a => { a[1].observationJournal = null; }],
      ['audit event spoof', a => { a[5].eventId = randomUUID(); }],
    ]) await rejects(opening, label, edit);
    await rejects(firstAck, 'first receipt activity refresh', a => { a[3].lastActivityMs = a[10]; });
    await rejects(firstAck, 'missing initial exposure', a => { a[1].uncertainExposure = clone(a[0].uncertainExposure); });
    await rejects(firstAck, 'wrong first acknowledgment', a => { a[5].observation.firstAcknowledgment = false; });
    await rejects(continuous, 'omitted observed interval', a => { a[1].studyIntervals = clone(a[0].studyIntervals); });
    await rejects(continuous, 'omitted observed audit', a => { delete a[5].policy.observation; });
    await rejects(continuous, 'observed scalar underreport', a => { a[1].studySinceBreakMs--; });
    await rejects(cleanStop, 'old unacknowledged closed-window audit', a => { a[5].observation.closedWindow = clone(a[0].observationJournal.active); });
    await rejects(hidden, 'hold erased', a => { a[1].observationJournal.unresolved = null; });
    await rejects(hidden, 'foreign prior evidence discarded', a => { a[0].observationJournal.active.scope.finalPhase.finalAttemptId = randomUUID(); });
    await rejects(recovered, 'recovery gap underreport', a => { a[1].uncertainExposure = clone(a[0].uncertainExposure); });
    await rejects(recovered, 'pre-recovery break laundering', a => { a[1].breakStartedAtMs = a[10] - 600000; });
    await rejects(recovered, 'recovery original audit rewritten', a => { a[5].observation.recovery.original.detectedAtMs--; });
    await rejects(idle, 'idle activity refreshed', a => { a[3].lastActivityMs = a[10]; });
    await rejects(idle, 'idle policy label greenwashed', a => { a[4].policyCode = 'session_policy_allowed'; a[4].code = 'final_session_opened'; });
  });

  await t.test('owner-fault underreported scalar cannot make retained observed budget green', async () => {
    const h = await harness(guard);
    h.ledger.studyIntervals = [{ start: h.now - 12000000, end: h.now }];
    h.ledger.studyBoundaryAtMs = h.now - 12000000; h.ledger.studySinceBreakMs = 0;
    const p = h.proposal('activate');
    assert.equal(p.result.outcome.candidateMaterialAllowed, true, 'explicit malformed-owner-state negative fixture');
    await rejects(p, 'independent retained-interval lower bound', () => {}, /nmls_final_delivery_underreported_exposure/);
  });

  await t.test('helpers and guard are owner-only, including service role', async () => {
    const acl = await db.query(`select p.proname, r.role, has_function_privilege(r.role,p.oid,'EXECUTE') allowed
      from pg_proc p cross join (values ('anon'),('authenticated'),('service_role')) r(role)
      where p.proname in ('nmls_final_delivery_guard','nmls_final_guard_canonical',
        'nmls_final_guard_integer','nmls_final_guard_policy_step')`);
    assert.equal(acl.rows.length, 12); assert.ok(acl.rows.every(row => row.allowed === false));
  });
  t.diagnostic(`${accepted.length} actual unmodified evaluator→SQL transitions; ${rejected.length} corruptions refused.`);
});
