import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { startNmlsSessionPolicy } from '../lib/nmls-session-policy.mjs';
import { nmlsRestrictionUsage } from '../lib/nmls-uncertain-exposure.mjs';

// Synthetic owner-only calls to the PRIVATE guard, plus real RPC regression
// tests in nmls-study-observer.test.mjs. No actual learner time/rest/ROCS evidence.
test('SQL027 independent exposure and pause guards (disposable PostgreSQL)', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; skipping is not verification.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table public.students(id uuid primary key);');
  for (const f of ['023_nmls_review_runtime.sql','024_nmls_review_discovery.sql','025_nmls_review_session_policy.sql','027_nmls_policy_exposure_guards.sql']) {
    await db.exec(readFileSync(new URL(`../database/${f}`, import.meta.url), 'utf8'));
  }
  const at = Date.UTC(2026, 5, 1, 12), actor = randomUUID(), attempt = randomUUID(), event = randomUUID();
  const offering = { id: randomUUID(), contentDigest: 'a'.repeat(64), opensAtMs: Date.UTC(2026,0,1), closesAtMs: Date.UTC(2027,0,1),
    rocs: { version:'4',documentDigest:'c'.repeat(64) } };
  const journal = () => ({ version: 'nmls-study-windows-v1', actorId: actor, lastReceiptMs: at,
    active: null, unresolved: null, creditIssuanceAllowed: false });
  function fixture() {
    const before = { ...startNmlsSessionPolicy(actor), revision: 1, lastReceiptMs: at-1,
      sessionStartedAtMs: at-10000, lastStudyAtMs: at-10000, studyBoundaryAtMs: at-10000,
      observationJournal: { ...journal(), lastReceiptMs: at-1 } };
    return { before, after: { ...structuredClone(before), revision: 2, lastReceiptMs: at, observationJournal: journal() },
      oldRuntime: { current: null, quiz: null, feedback: null }, runtime: { current: null, quiz: null, feedback: null },
      outcome: { deliveryAllowed: true }, audit: { policy: { kind: 'check_access', code: 'session_policy_allowed' } }, until: at+30000 };
  }
  const guard = f => db.query('select public.nmls_policy_guard_exposure($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
    [f.before,f.after,f.oldRuntime,f.runtime,f.outcome,f.audit,offering,actor,attempt,event,at,f.until]);
  const debt = (f, intervals, lastBoundaryMs = intervals.at(-1)?.end ?? null) => {
    for (const ledger of [f.before,f.after]) ledger.uncertainExposure = { version: 'nmls-uncertain-exposure-v1', intervals: structuredClone(intervals), lastBoundaryMs };
  };

  await t.test('only the service RPC is callable; old commit and helper shortcuts are revoked', async () => {
    const rows = (await db.query(`select proname, has_function_privilege('service_role',oid,'EXECUTE') as service,
      has_function_privilege('authenticated',oid,'EXECUTE') as student,
      has_function_privilege('anon',oid,'EXECUTE') as anon
      from pg_proc where pronamespace='public'::regnamespace and proname in
      ('nmls_policy_commit','nmls_policy_commit_pre_exposure_internal','nmls_policy_guard_exposure',
       'nmls_policy_checked_intervals','nmls_policy_interval_union','nmls_policy_exposure_in_range')`)).rows;
    assert.equal(rows.length,6);
    for (const row of rows) {
      assert.equal(row.service,row.proname==='nmls_policy_commit'); assert.equal(row.student,false); assert.equal(row.anon,false);
    }
  });
  await t.test('rejects malformed, future, noninteger, overlapping and noncanonical uncertain records', async () => {
    for (const bad of [null, {}, { version:'wrong',intervals:[],lastBoundaryMs:null },
      { version:'nmls-uncertain-exposure-v1',intervals:[{start:at-10,end:at}],lastBoundaryMs:null },
      { version:'nmls-uncertain-exposure-v1',intervals:[{start:at-10,end:at}],lastBoundaryMs:at-1 },
      ...[[{start:at-10,end:at+1}],[{start:at-0.5,end:at}],[{start:at,end:at}],
        [{start:at-20,end:at-10},{start:at-15,end:at}],[{start:at-20,end:at-10},{start:at-10,end:at}],
        [{start:at-10,end:at,extra:1}]].map(intervals=>({version:'nmls-uncertain-exposure-v1',intervals,lastBoundaryMs:at}))]) {
      const f=fixture(); f.after.uncertainExposure=bad; await assert.rejects(guard(f),/invalid_exposure/);
    }
  });
  await t.test('union budgets match JS, count overlap once and include uncertainty after the break boundary', async () => {
    for (const shape of ['overlap','break-limit','daily-limit']) {
      const f=fixture();
      if (shape==='overlap') {
        f.before.studyBoundaryAtMs=f.after.studyBoundaryAtMs=at-12000000;
        f.before.studyIntervals=f.after.studyIntervals=[{start:at-12000000,end:at-4000}];
        f.before.studySinceBreakMs=f.after.studySinceBreakMs=11996000;
        debt(f,[{start:at-8000,end:at-1000}]);
      } else if (shape==='break-limit') {
        f.before.studyBoundaryAtMs=f.after.studyBoundaryAtMs=at-12000000;
        debt(f,[{start:at-12000000,end:at-10000}]);
      } else debt(f,[{start:at-36000000,end:at-10000}]);
      const u=nmlsRestrictionUsage(f.after,at), remaining=Math.min(30000,12000000-u.sinceBreakMs,36000000-u.rollingMs);
      assert.ok(remaining>0);
      f.until=at+remaining; await guard(f);
      f.until++; await assert.rejects(guard(f),/invalid_delivery/);
    }
  });
  await t.test('cannot erase/shorten debt, boundary, retained observed usage, or an unresolved hold', async () => {
    for (const change of ['erase','shorten','boundary','observed','hold','journal','pause','pause-key','reset','last-study']) {
      const f=fixture(); debt(f,[{start:at-5000,end:at-1000}]);
      if(change==='erase')f.after.uncertainExposure.intervals=[];
      if(change==='shorten')f.after.uncertainExposure.intervals[0].start++;
      if(change==='boundary')f.after.uncertainExposure.lastBoundaryMs--;
      if(change==='observed')f.before.studyIntervals=[{start:at-9000,end:at-8000}];
      if(change==='hold')f.before.observationJournal.unresolved={window:{id:randomUUID()},reason:'synthetic'};
      if(change==='journal')delete f.after.observationJournal;
      if(change==='pause'||change==='pause-key') {
        f.before.breakStartedAtMs=at-1;
        if(change==='pause-key')delete f.after.breakStartedAtMs;
      }
      if(change==='reset')f.after.studyBoundaryAtMs=at;
      if(change==='last-study')f.after.lastStudyAtMs--;
      await assert.rejects(guard(f),/invalid_(exposure|observation|pause)/);
    }
  });
  await t.test('observed coverage lower bound defeats a forged counter, and material cannot lack its window', async () => {
    const f=fixture(); f.before.studyBoundaryAtMs=f.after.studyBoundaryAtMs=at-12000001;
    f.before.studyIntervals=f.after.studyIntervals=[{start:at-12000001,end:at}];
    assert.equal(f.after.studySinceBreakMs,0);
    await assert.rejects(guard(f),/invalid_delivery/);
    const material=fixture(); material.outcome.progress={lessons:[{id:'synthetic-lesson'}],quiz:null,feedback:null};
    await assert.rejects(guard(material),/invalid_delivery/);
  });
  await t.test('expired interval pruning retains last possible exposure; break reset cannot erase rolling debt', async () => {
    const f=fixture(); debt(f,[{start:at-90000000,end:at-89999999},{start:at-5000,end:at-1000}]);
    f.after.uncertainExposure.intervals.shift(); await guard(f);
    f.after.uncertainExposure.lastBoundaryMs=null; await assert.rejects(guard(f),/invalid_exposure/);
    const paused=fixture(); debt(paused,[{start:at-2000000,end:at-600000}]);
    paused.before.breakStartedAtMs=at-600000; paused.before.studySinceBreakMs=100;
    paused.after.studyBoundaryAtMs=at; paused.after.studySinceBreakMs=0;
    paused.audit.policy={kind:'end_break',code:'break_completed'}; paused.outcome.deliveryAllowed=false; paused.until=null;
    await guard(paused);
    paused.before.breakStartedAtMs++; await assert.rejects(guard(paused),/invalid_pause/);
  });
  await t.test('new session requires rest since latest uncertain exposure, not merely latest observed study', async () => {
    const f=fixture(); f.before.sessionStartedAtMs=f.after.sessionStartedAtMs=at-43200001;
    f.before.lastStudyAtMs=f.after.lastStudyAtMs=at-43200000;
    debt(f,[],at-43200000); f.after.sessionStartedAtMs=at; f.after.studyBoundaryAtMs=at;
    f.audit.policy={kind:'open_session',code:'session_policy_allowed'}; await guard(f);
    debt(f,[],at-43200000+1); await assert.rejects(guard(f),/invalid_pause/);
  });
  await t.test('zero-length recovery still starts a full pause; malformed/control/idle/unaccepted recovery is denied', async () => {
    function recoveryFixture() {
      const f=fixture();
      const window={id:randomUUID(),openingEventId:randomUUID(),materialDigest:'d'.repeat(64),runtimeRevision:1,
        scope:{actorId:actor,attemptId:attempt,offeringId:offering.id,contentDigest:offering.contentDigest,sessionId:randomUUID()},
        issuedAtMs:at,horizonMs:at+30000,lastObservedAtMs:null};
      const hold={window,reason:'study_receipt_missing_or_stale',detectedAtMs:at,eventId:randomUUID()};
      f.before.observationJournal={...journal(),unresolved:hold};
      f.before.acceptances=f.after.acceptances=[{offeringId:offering.id,contentDigest:offering.contentDigest,
        ...offering.rocs,acceptedAtMs:at-10000}];
      f.oldRuntime={...f.oldRuntime,status:'active',lastActivityMs:at};
      f.after.uncertainExposure.lastBoundaryMs=at; f.after.breakStartedAtMs=at;
      f.audit={review:{kind:'recover_observation'},policy:{kind:'check_recovery',code:'recovery_context_allowed'},observation:{recovery:{
        original:hold,method:'conservative_gap_debit_no_study_awarded',eventId:event,
        debitStartMs:at,debitEndMs:at,recoveredAtMs:at,resumeNotBeforeMs:at+600000,observedStudyAddedMs:0,creditAddedMs:0}}};
      f.outcome={ok:true,status:200,code:'study_observation_recovered',deliveryAllowed:false,resumeNotBeforeMs:at+600000}; f.until=null;
      return f;
    }
    await guard(recoveryFixture());
    for(const change of ['reason','future-receipt','review-kind','policy-kind','idle','no-acceptance','short-pause','actor','attempt','offering','digest']) {
      const f=recoveryFixture();
      if(change==='reason')f.before.observationJournal.unresolved.reason=null;
      if(change==='future-receipt')f.before.observationJournal.unresolved.window.lastObservedAtMs=at+1;
      if(change==='review-kind')f.audit.review.kind='check_access';
      if(change==='policy-kind')f.audit.policy.kind='check_access';
      if(change==='idle')f.oldRuntime.lastActivityMs=at-360000;
      if(change==='no-acceptance')f.before.acceptances=[];
      if(change==='short-pause')f.after.breakStartedAtMs=at-1;
      if(['actor','attempt','offering','digest'].includes(change)) {
        const field={actor:'actorId',attempt:'attemptId',offering:'offeringId',digest:'contentDigest'}[change];
        f.before.observationJournal.unresolved.window.scope[field]=change==='digest'?'f'.repeat(64):randomUUID();
      }
      await assert.rejects(guard(f),/invalid_(recovery|observation_transition)/,change);
    }
  });
});
