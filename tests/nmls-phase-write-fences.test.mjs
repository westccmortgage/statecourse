import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../lib/nmls-study-observer.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';
import { executeNmlsReview, nmlsReviewPublicError } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { NMLS_POLICY_DIGEST, transactNmlsPolicyReview } from '../netlify/functions/_lib/nmls-policy-transaction.mjs';
import { transactNmlsFinalHistory } from '../netlify/functions/_lib/nmls-final-history.mjs';
import { transactNmlsFinalRemediation } from '../netlify/functions/_lib/nmls-final-remediation.mjs';

test('phase hold has a named public error without exposing internal context', () => {
  assert.deepEqual(nmlsReviewPublicError(new Error('nmls_review_teaching_phase_requires_joint_commit; private database detail')),
    { status: 409, body: { error: 'nmls_review_teaching_phase_requires_joint_commit' } });
});

test('030 legacy fences (real local SQL, synthetic actors, no phase delivery/attendance)', {
  skip: process.env.NMLS_TEST_PGLITE_MODULE ? false : 'PGlite required; a skip is not verification.',
}, async t => {
  const { PGlite } = await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db = new PGlite(); t.after(() => db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table students(id uuid primary key);');
  const migrate = name => db.exec(readFileSync(new URL(`../database/${name}`, import.meta.url), 'utf8'));
  for (const name of ['023_nmls_review_runtime.sql','024_nmls_review_discovery.sql','025_nmls_review_session_policy.sql',
    '026_nmls_private_final_history.sql','027_nmls_policy_exposure_guards.sql','028_nmls_private_final_remediation.sql','029_nmls_initial_exposure.sql']) await migrate(name);
  const rpc = async (name, args) => {
    assert.match(name, /^nmls_[a-z_]+$/); const keys = Object.keys(args);
    assert.ok(keys.every(key => /^p_[a-z_]+$/.test(key)));
    return (await db.query(`select public.${name}(${keys.map((key, i) => `${key}=>$${i+1}`).join(',')}) as result`, Object.values(args))).rows[0].result;
  };
  const row = async f => (await db.query('select * from nmls_review_attempts where id=$1', [f.attemptId])).rows[0];
  const final = async f => (await db.query('select * from nmls_private_finals where review_attempt_id=$1', [f.attemptId])).rows[0];
  const child = async f => (await db.query('select * from nmls_private_remediations where review_attempt_id=$1', [f.attemptId])).rows[0];
  const lease = async f => (await db.query('select * from nmls_review_study_leases where student_id=$1', [f.actor])).rows[0];
  async function snapshot(actor) {
    const out = {};
    for (const table of ['nmls_review_attempts','nmls_review_study_leases','nmls_review_actor_policy','nmls_review_actor_policy_events',
      'nmls_private_finals','nmls_private_final_events','nmls_private_remediations','nmls_private_remediation_events']) {
      out[table] = (await db.query(`select * from ${table} where student_id=$1 order by to_jsonb(${table})::text`, [actor])).rows;
    }
    out.reviewEvents = (await db.query('select e.* from nmls_review_attempt_events e join nmls_review_attempts a on a.id=e.attempt_id where a.student_id=$1 order by e.event_id', [actor])).rows;
    return out;
  }
  async function fixture({ actor = randomUUID(), policy = false, complete = false, key = 'nmls-2026-f01-private-review' } = {}) {
    const course = getNmlsReviewCourse(key), grantId = randomUUID();
    await db.query('insert into students(id) values($1) on conflict do nothing', [actor]);
    await db.query(`insert into nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
      values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC fixture; no attendance')`, [grantId,actor,key,course.digest]);
    if (policy) await rpc('nmls_policy_bind', { p_student_id:actor,p_grant_id:grantId,p_policy_id:P.id,p_policy_digest:NMLS_POLICY_DIGEST,
      p_offering:{id:grantId,contentDigest:course.digest,educationType:'annual_ce',year:2026,opensAtMs:Date.UTC(2026,0,1),
        closesAtMs:Date.UTC(2027,0,1),timeZone:'UTC',deadlineBasisId:'SYNTHETIC-ONLY',
        rocs:{version:'4',documentDigest:'c'.repeat(64),fullDocumentVerified:true,evidenceId:'SYNTHETIC-NOT-REAL-ROCS'}} });
    const runtime = startNmlsCourseReview(course);
    // Artificial completion is only an engineering prerequisite, not a real run.
    if (complete) Object.assign(runtime, {status:'review_complete',completedUnitIds:course.modules.flatMap(m=>m.units.map(u=>u.id)),
      passedModuleIds:course.modules.map(m=>m.id),completedReviewMs:course.modules.flatMap(m=>m.units).reduce((n,u)=>n+u.requiredSeconds*1000,0)});
    const startArgs = {p_student_id:actor,p_grant_id:grantId,p_course_key:key,p_content_digest:course.digest,p_initial_runtime:runtime};
    const started = await rpc(policy ? 'nmls_policy_start' : 'nmls_review_start', startArgs);
    return {actor,grantId,attemptId:started.attempt.id,course,startArgs,policy};
  }
  const legacy = (f, cmd) => executeNmlsReview(cmd,f.actor,{rpc,courseFor:getNmlsReviewCourse});
  async function reviewCommand(f, kind='resume', extra={}) { const a=await row(f); return {kind,attemptId:f.attemptId,eventId:randomUUID(),
    expectedRevision:a.revision,sessionId:a.runtime.sessionId,...extra}; }
  const policyRun = (f,cmd) => transactNmlsPolicyReview(cmd,f.actor,{rpc,courseFor:getNmlsReviewCourse,evaluate:createNmlsObservedPolicyReviewEvaluator()});
  async function policyCommand(f, extra={}) {
    const a=await row(f), p=(await db.query('select revision from nmls_review_actor_policy where student_id=$1',[f.actor])).rows[0];
    return {...await reviewCommand(f),expectedActorRevision:p?.revision??0,sessionId:a.runtime.sessionId,...extra};
  }
  const firstRun = (f,cmd) => transactNmlsFinalHistory(cmd,f.actor,{rpc});
  const firstCommand = f => ({kind:'issue',reviewAttemptId:f.attemptId,eventId:randomUUID(),expectedReviewRevision:0,expectedFinalRevision:0});
  const childRun = (f,cmd) => transactNmlsFinalRemediation(cmd,f.actor,{rpc});
  async function childCommand(f) { return {kind:'start_remediation',reviewAttemptId:f.attemptId,firstFinalId:(await final(f)).id,
    eventId:randomUUID(),expectedReviewRevision:0,expectedWorkflowRevision:0}; }
  async function failedFirst(f) {
    await firstRun(f,firstCommand(f)); const selected=await final(f), def=getNmlsDraftFinalDefinition(f.course.id);
    const answers=Object.fromEntries(selected.selection.questionIds.map(id=>[id,['A','B','C','D'].find(c=>c!==def.items.find(q=>q.id===id).correctChoice)]));
    await firstRun(f,{kind:'submit',reviewAttemptId:f.attemptId,eventId:randomUUID(),expectedReviewRevision:0,
      expectedFinalRevision:1,finalAttemptId:selected.id,answers});
  }

  // Reproduce a historical collision using actual pre030 writers. Do not insert
  // fake event rows to stand in for that bug. Keep it unreconciled after030.
  const historical=await fixture(), historicalFinal=await fixture({actor:historical.actor,complete:true,key:'nmls-2026-national-comprehensive-private-review-v3'});
  const oldReview=await reviewCommand(historical), oldFinal={...firstCommand(historicalFinal),eventId:oldReview.eventId};
  await legacy(historical,oldReview); await firstRun(historicalFinal,oldFinal);
  const previous=await snapshot(historical.actor);
  await migrate('030_nmls_phase_write_fences.sql');

  await t.test('forward migration preserves history and refuses contradictory historical replay',async()=>{
    const after=await snapshot(historical.actor);
    after.nmls_review_study_leases.forEach(l=>{assert.equal(l.phase_kind,null);assert.equal(l.phase_owner_id,null);delete l.phase_kind;delete l.phase_owner_id;});
    assert.deepEqual(after,previous);
    const before=await snapshot(historical.actor);
    await assert.rejects(()=>legacy(historical,oldReview),/idempotency_conflict/);
    await assert.rejects(()=>firstRun(historicalFinal,oldFinal),/idempotency_conflict/);
    assert.deepEqual(await snapshot(historical.actor),before);
  });

  await t.test('all four namespaces conflict in both insertion orders, across original reviews, before stale CAS',async()=>{
    for (const winner of ['review','policy','first_final','remediation']) {
      const actor=randomUUID(), fs={review:await fixture({actor}),policy:await fixture({actor,policy:true}),
        first_final:await fixture({actor,complete:true,key:'nmls-2026-national-comprehensive-private-review-v3'}),
        remediation:await fixture({actor,complete:true,key:'nmls-2026-national-core-private-review-v3'})};
      await failedFirst(fs.remediation);
      const id=randomUUID(), cmds={review:await reviewCommand(fs.review),policy:await policyCommand(fs.policy),
        first_final:firstCommand(fs.first_final),remediation:await childCommand(fs.remediation)};
      Object.values(cmds).forEach(cmd=>cmd.eventId=id);
      const runs={review:legacy,policy:policyRun,first_final:firstRun,remediation:childRun};
      await runs[winner](fs[winner],cmds[winner]); const before=await snapshot(actor);
      for (const loser of Object.keys(runs).filter(name=>name!==winner)) {
        const stale={...cmds[loser]}; if ('expectedRevision' in stale) stale.expectedRevision=999; else stale.expectedReviewRevision=999;
        await assert.rejects(()=>runs[loser](fs[loser],stale),/idempotency_conflict/,`${winner} -> ${loser}`);
        assert.deepEqual(await snapshot(actor),before);
      }
    }
  });

  await t.test('policy mirrored rows are one command; unmarked exact stale replay remains unchanged',async()=>{
    const f=await fixture({policy:true}), cmd=await policyCommand(f), result=await policyRun(f,cmd);
    const joined=(await db.query(`select r.resulting_revision,p.attempt_revision,r.command_digest=p.command_digest as same
      from nmls_review_attempt_events r join nmls_review_actor_policy_events p on p.attempt_id=r.attempt_id and p.event_id=r.event_id
      where p.student_id=$1`,[f.actor])).rows;
    assert.equal(joined.length,1);assert.equal(joined[0].same,true);assert.equal(joined[0].resulting_revision,joined[0].attempt_revision);
    await policyRun(f,await policyCommand(f)); const before=await snapshot(f.actor), replay=await policyRun(f,cmd);
    assert.equal(replay.body.duplicate,true);assert.equal(replay.body.deliveryAllowed,false);assert.deepEqual(replay.body.progress.lessons,[]);
    assert.equal(replay.body.progress.revision,result.body.progress.revision);assert.deepEqual(await snapshot(f.actor),before);
    await db.query('update nmls_review_actor_policy_events set attempt_revision=attempt_revision+1 where student_id=$1 and event_id=$2',[f.actor,cmd.eventId]);
    const corrupt=await snapshot(f.actor);await assert.rejects(()=>policyRun(f,cmd),/idempotency_conflict/);assert.deepEqual(await snapshot(f.actor),corrupt);
    const u=await fixture(), c=await reviewCommand(u);await legacy(u,c);await legacy(u,await reviewCommand(u));
    const ub=await snapshot(u.actor);assert.equal((await legacy(u,c)).body.duplicate,true);assert.deepEqual(await snapshot(u.actor),ub);
    const another=await fixture({actor:u.actor});await assert.rejects(async()=>legacy(another,{...await reviewCommand(another),eventId:c.eventId}),/idempotency_conflict/);
  });

  await t.test('marked source or child lease blocks old start, takeover, cleanup, policy and historical replay',async()=>{
    for (const kind of ['source','remediation']) {
      const f=await fixture({complete:kind==='remediation',key:kind==='source'?'nmls-2026-f01-private-review':'nmls-2026-national-comprehensive-private-review-v3'});
      const other=await fixture({actor:f.actor}), policy=await fixture({actor:f.actor,policy:true});
      let replay, childStart, sessionId, owner=f.attemptId;
      if (kind==='source') { replay=await reviewCommand(f);await legacy(f,replay);sessionId=(await row(f)).runtime.sessionId; }
      else { await failedFirst(f);childStart=await childCommand(f);await childRun(f,childStart);
        await childRun(f,{...childStart,kind:'remediation_event',eventId:randomUUID(),expectedWorkflowRevision:1,action:{kind:'resume'}});
        const w=await child(f);owner=w.first_final_id;sessionId=w.runtime.sessionId;
      }
      // Database-owner SYNTHETIC marker, NOT an acquisition API or permission to teach.
      await db.query('update nmls_review_study_leases set attempt_id=$2,session_id=$3,phase_kind=$4,phase_owner_id=$5 where student_id=$1',
        [f.actor,f.attemptId,sessionId,kind,owner]);
      const before=await snapshot(f.actor);
      for (const target of [f,other]) {
        await assert.rejects(()=>legacy(target,{kind:'start',grantId:target.grantId,courseKey:target.course.id}),/teaching_phase_requires_joint_commit/);
        for (const action of ['resume','logout','heartbeat']) await assert.rejects(async()=>legacy(target,
          await reviewCommand(target,action,{sessionId:sessionId,...(action==='heartbeat'?{visible:true}:{})})),/teaching_phase_requires_joint_commit/);
      }
      await assert.rejects(()=>rpc('nmls_policy_start',policy.startArgs),/teaching_phase_requires_joint_commit/);
      await assert.rejects(async()=>policyRun(policy,await policyCommand(policy)),/teaching_phase_requires_joint_commit/);
      if (replay) await assert.rejects(()=>legacy(f,replay),/teaching_phase_requires_joint_commit/);
      if (childStart) {
        await assert.rejects(()=>childRun(f,childStart),/teaching_phase_requires_joint_commit/);
        await assert.rejects(()=>firstRun(f,{...firstCommand(f),expectedFinalRevision:999}),/teaching_phase_requires_joint_commit/);
      }
      assert.deepEqual(await snapshot(f.actor),before);
      for (const sql of ['update nmls_review_study_leases set session_id=gen_random_uuid() where student_id=$1',
        'update nmls_review_study_leases set phase_kind=null,phase_owner_id=null,attempt_id=null,session_id=null where student_id=$1',
        'delete from nmls_review_study_leases where student_id=$1']) await assert.rejects(()=>db.query(sql,[f.actor]),/phase_lease_transition_requires_joint_commit/);
      assert.deepEqual(await snapshot(f.actor),before);
    }
  });

  await t.test('missing either policy mirror half is held; unrelated actors may reuse an event ID',async()=>{
    for (const table of ['nmls_review_attempt_events','nmls_review_actor_policy_events']) {
      const f=await fixture({policy:true}), cmd=await policyCommand(f);await policyRun(f,cmd);
      // Deliberate owner corruption of a synthetic history, not a repair action.
      await db.query(`delete from ${table} where event_id=$1`,[cmd.eventId]);
      const before=await snapshot(f.actor);await assert.rejects(()=>policyRun(f,cmd),/idempotency_conflict/);
      assert.deepEqual(await snapshot(f.actor),before);
    }
    const a=await fixture(), b=await fixture(), ca=await reviewCommand(a), cb={...await reviewCommand(b),eventId:ca.eventId};
    assert.equal((await legacy(a,ca)).body.duplicate,false);assert.equal((await legacy(b,cb)).body.duplicate,false);
  });

  await t.test('old exact policy replay cannot bypass a marked source lease',async()=>{
    const f=await fixture({policy:true}), cmd=await policyCommand(f);await policyRun(f,cmd);
    await db.query("update nmls_review_study_leases set phase_kind='source',phase_owner_id=attempt_id where student_id=$1",[f.actor]);
    const before=await snapshot(f.actor);await assert.rejects(()=>policyRun(f,cmd),/teaching_phase_requires_joint_commit/);
    assert.deepEqual(await snapshot(f.actor),before);
  });

  await t.test('scope/NULL checks reject false phase owners and cross-actor lease changes',async()=>{
    const f=await fixture(), g=await fixture();
    for (const [attempt,kind,owner,session] of [[f.attemptId,'source',randomUUID(),randomUUID()],
      [g.attemptId,'source',g.attemptId,randomUUID()],[f.attemptId,'remediation',randomUUID(),randomUUID()],
      [f.attemptId,'source',f.attemptId,null],[null,'source',f.attemptId,randomUUID()],
      [f.attemptId,null,f.attemptId,randomUUID()],[f.attemptId,'invalid',f.attemptId,randomUUID()]]) {
      await assert.rejects(()=>db.query('update nmls_review_study_leases set attempt_id=$2,phase_kind=$3,phase_owner_id=$4,session_id=$5 where student_id=$1',
        [f.actor,attempt,kind,owner,session]),/invalid_phase_lease|check constraint/);
    }
    await assert.rejects(()=>db.query('update nmls_review_study_leases set student_id=$2 where student_id=$1',[f.actor,g.actor]),/invalid_phase_lease/);
  });

  await t.test('a post-write failure rolls back the whole old operation; failure leaves no new mutex',async()=>{
    const f=await fixture({complete:true,key:'nmls-2026-national-comprehensive-private-review-v3'});
    await db.query('delete from nmls_review_study_leases where student_id=$1',[f.actor]);
    const cmd=firstCommand(f), before=await snapshot(f.actor);
    await db.exec(`create function reject_after_fenced_final() returns trigger language plpgsql as $$ begin
      raise exception 'synthetic_post_fenced_write'; end $$;
      create trigger reject_after_fenced_final after insert on nmls_private_final_events for each row execute function reject_after_fenced_final();`);
    try {await assert.rejects(()=>firstRun(f,cmd),/synthetic_post_fenced_write/);assert.deepEqual(await snapshot(f.actor),before);}
    finally {await db.exec('drop trigger reject_after_fenced_final on nmls_private_final_events;drop function reject_after_fenced_final();');}
    assert.equal((await firstRun(f,cmd)).duplicate,false);
    await db.query("update nmls_review_access_grants set status='revoked' where id=$1",[f.grantId]);
    await assert.rejects(()=>firstRun(f,cmd),/access_denied/);
  });

  await t.test('intended roles cannot mutate protected rows or execute retired/internal delegates',async()=>{
    const internal=(await db.query(`select p.oid::regprocedure::text as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and (p.proname like 'nmls_%_internal' or p.proname in ('nmls_review_lease_phase_integrity','nmls_review_legacy_write_fence'))`)).rows;
    assert.ok(internal.length>=10);
    for (const role of ['anon','authenticated','service_role']) {
      for (const {signature} of internal) assert.equal((await db.query('select has_function_privilege($1,$2,\'EXECUTE\') as yes',[role,signature])).rows[0].yes,false,`${role}: ${signature}`);
      await db.exec(`set role ${role}`);
      try { for (const table of ['nmls_review_attempts','nmls_review_attempt_events','nmls_review_study_leases']) {
        await assert.rejects(()=>db.query(`select * from ${table}`),/permission denied/);
        await assert.rejects(()=>db.query(`delete from ${table} where false`),/permission denied/);
      }} finally {await db.exec('reset role');}
    }
    const f=await fixture(), cmd=await reviewCommand(f);await db.exec('set role service_role');
    try {assert.equal((await legacy(f,cmd)).body.progress.status,'active');}
    finally {await db.exec('reset role');}
    assert.equal((await lease(f)).phase_kind,null);
  });
});
