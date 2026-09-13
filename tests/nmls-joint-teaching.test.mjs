import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { transactNmlsTeaching } from '../netlify/functions/_lib/nmls-teaching-transaction.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { defineNmlsDraftFinal, drawNmlsDraftFinal, gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';

// Genuine SQL and reducers; intentionally one-unit/one-second SYNTHETIC source.
// Sealed first final and child initialization are owner-seeded fixtures because
// policy-aware final exposure/creation is NOT implemented by this slice.
const course=structuredClone(getNmlsReviewCourse('nmls-2026-f01-private-review'));
course.id='synthetic-joint-teaching'; course.modules[0].units=[{...course.modules[0].units[0],requiredSeconds:1}];
delete course.digest;course.digest=createHash('sha256').update(JSON.stringify(course)).digest('hex');
const items=Array.from({length:50},(_,i)=>({id:`N26-FIN-F${String(i+1).padStart(2,'0')}`,category:'federal',moduleId:'F01',
  objective:'Synthetic SQL fixture.',stem:`Synthetic question ${i+1}?`,options:['A','B','C','D'].map(id=>({id,text:`Synthetic ${id}.`})),
  correctChoice:'A',rationale:'Synthetic rationale.',independenceNote:'Engineering only.',distractorRationales:{B:'Wrong.',C:'Wrong.',D:'Wrong.'},
  sourceRefs:[{url:'https://www.consumerfinance.gov/rules-policy/regulations/',locator:'Synthetic',supports:'No legal claim.',checkedOn:'2026-09-12'}],
  remediation:{unitIds:['F01-U01'],focus:'Synthetic practice.'}}));
const definition=defineNmlsDraftFinal(course,{id:'synthetic-joint-final',items,moduleQuotas:{F01:25}});

test('joint source and remediation teaching persistence (local SQL, not live CE)',{
  skip:process.env.NMLS_TEST_PGLITE_MODULE?false:'PGlite required; a skip is not verification.',
},async t=>{
  const {PGlite}=await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db=new PGlite();t.after(()=>db.close());
  await db.exec('create role anon;create role authenticated;create role service_role;create table students(id uuid primary key);');
  for(const file of ['023_nmls_review_runtime.sql','024_nmls_review_discovery.sql','025_nmls_review_session_policy.sql',
    '026_nmls_private_final_history.sql','027_nmls_policy_exposure_guards.sql','028_nmls_private_final_remediation.sql',
    '029_nmls_initial_exposure.sql','030_nmls_phase_write_fences.sql','031_nmls_teaching_exposure_guards.sql','032_nmls_joint_teaching.sql',
    '033_nmls_final_reservation.sql','034_nmls_final_delivery_guards.sql','035_nmls_first_final_delivery.sql','036_nmls_first_final_submission.sql','037_nmls_first_final_handoff.sql','038_nmls_second_final_reservation.sql', '039_nmls_second_final_delivery.sql', '040_nmls_second_final_submission.sql']) {
    await db.exec(readFileSync(new URL(`../database/${file}`,import.meta.url),'utf8'));
  }
  const rpc=async(name,args)=>{
    assert.match(name,/^nmls_[a-z_]+$/);const keys=Object.keys(args);assert.ok(keys.every(k=>/^p_[a-z_]+$/.test(k)));
    return (await db.query(`select ${name}(${keys.map((k,i)=>`${k}=>$${i+1}`).join(',')}) as result`,Object.values(args))).rows[0].result;
  };
  const tables=['nmls_review_attempts','nmls_review_actor_policy','nmls_review_study_leases','nmls_private_finals',
    'nmls_private_remediations','nmls_teaching_phase_bindings','nmls_teaching_events'];
  async function snapshot(actor){const result={};for(const table of tables)result[table]=(await db.query(`select * from ${table} where student_id=$1 order by to_jsonb(${table})::text`,[actor])).rows;return result;}
  const deps={rpc,courseFor:key=>{assert.equal(key,course.id);return structuredClone(course);},definitionFor:()=>definition};
  async function fixture(){
    const actor=randomUUID(),grant=randomUUID();await db.query('insert into students values($1)',[actor]);
    await db.query(`insert into nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
      values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC teaching fixture')`,[grant,actor,course.id,course.digest]);
    await rpc('nmls_policy_bind',{p_student_id:actor,p_grant_id:grant,p_policy_id:P.id,p_policy_digest:digestNmlsCommand(P),
      p_offering:{id:grant,contentDigest:course.digest,year:2026,educationType:'annual_ce',timeZone:'UTC',deadlineBasisId:'SYNTHETIC-ONLY',
        opensAtMs:Date.UTC(2026,0,1),closesAtMs:Date.UTC(2027,0,1),
        rocs:{version:'4',documentDigest:'c'.repeat(64),fullDocumentVerified:true,evidenceId:'SYNTHETIC-NOT-REAL-ROCS'}}});
    const start=await rpc('nmls_policy_start',{p_student_id:actor,p_grant_id:grant,p_course_key:course.id,p_content_digest:course.digest,p_initial_runtime:startNmlsCourseReview(course)});
    const h={actor,grant,attemptId:start.attempt.id,phaseKind:'source',phaseOwnerId:start.attempt.id};
    h.context=()=>rpc('nmls_teaching_context',{p_student_id:actor,p_attempt_id:h.attemptId,p_phase_kind:h.phaseKind,p_phase_owner_id:h.phaseOwnerId});
    h.command=async(kind,extra={},receipt=true)=>{
      const c=await h.context(),r=h.phaseKind==='source'?c.attempt.runtime:c.workflow.runtime;
      return {kind,attemptId:h.attemptId,phaseKind:h.phaseKind,phaseOwnerId:h.phaseOwnerId,eventId:randomUUID(),
        expectedRevision:r.revision,expectedSourceRevision:c.attempt.revision,expectedWorkflowRevision:c.workflow?.revision??null,
        expectedActorRevision:c.actorPolicy?.revision??0,sessionId:r.sessionId,
        ...(receipt&&c.actorPolicy?.ledger.observationJournal?.active?{studyReceipt:{windowId:c.actorPolicy.ledger.observationJournal.active.id,visible:true}}:{}),...extra};
    };
    h.run=(cmd,options={})=>transactNmlsTeaching(cmd,actor,{...deps,...options});
    h.act=async(kind,extra={},receipt=true)=>h.run(await h.command(kind,{...(kind==='interaction'?{observation:'keyboard'}:{}),...extra},receipt));
    h.begin=async()=>{
      await h.act('resume');
      const presented=await rpc('nmls_policy_present_rocs',{p_student_id:actor,p_attempt_id:h.attemptId,p_document_digest:'c'.repeat(64)});
      await h.act('accept_rocs',{presentationId:presented.id,version:'4',documentDigest:'c'.repeat(64),acknowledged:true});
      await h.act('resume');
    };
    h.finish=async()=>{
      await h.act('open_unit',{unitId:'F01-U01'});await h.act('interaction',{visible:true});await pause(1100);
      await h.act('heartbeat',{visible:true});await h.act('unit_action',{choice:course.modules[0].units[0].actionQuestion.correctChoice});
      assert.equal((await h.act('complete_unit')).body.code,'unit_review_complete');
      await h.act('quiz_start',{moduleId:'F01'});await h.act('interaction',{visible:true});
      const c=await h.context(),r=h.phaseKind==='source'?c.attempt.runtime:c.workflow.runtime;
      const answers=Object.fromEntries(r.quiz.questionIds.map(id=>[id,course.modules[0].quiz.bank.find(q=>q.id===id).correctChoice]));
      return h.act('quiz_submit',{quizId:r.quiz.id,answers});
    };
    h.seedChild=async()=>{
      const c=await h.context(),id=randomUUID(),selection=drawNmlsDraftFinal(definition,{id,reviewAttemptId:h.attemptId,reviewState:c.attempt.runtime},{draw:()=>0});
      const answers=Object.fromEntries(selection.questionIds.map(id=>[id,'B'])),result=gradeNmlsDraftFinal(definition,selection,answers);
      const child=makeNmlsFinalRemediationCourse(definition,course,selection,answers);
      const manifest={courseKey:child.id,contentDigest:child.digest,sourceCourseKey:course.id,sourceContentDigest:course.digest,
        definitionDigest:definition.digest,finalAttemptId:id,reviewAttemptId:h.attemptId,moduleIds:child.modules.map(m=>m.id),
        unitIds:child.modules.flatMap(m=>m.units.map(u=>u.id)),completed:false,retakeEnabled:false};
      await db.query(`insert into nmls_private_finals(id,review_attempt_id,student_id,course_key,content_digest,definition_digest,revision,selection,answers,result,remediation_manifest,submitted_at)
        values($1,$2,$3,$4,$5,$6,2,$7,$8,$9,$10,clock_timestamp())`,[id,h.attemptId,actor,course.id,course.digest,definition.digest,selection,answers,result,manifest]);
      await db.query(`insert into nmls_private_remediations(first_final_id,student_id,review_attempt_id,definition_digest,manifest,revision,status,runtime)
        values($1,$2,$3,$4,$5,1,'remediating',$6)`,[id,actor,h.attemptId,definition.digest,manifest,startNmlsCourseReview(child)]);
      h.phaseKind='remediation';h.phaseOwnerId=id;
    };
    return h;
  }
  const closed=r=>{assert.equal(r.body.deliveryAllowed,false);assert.equal(r.body.deliveryUntilMs,null);assert.equal(r.body.studyWindow,null);
    assert.deepEqual(r.body.progress.lessons,[]);assert.equal(r.body.progress.quiz,null);assert.equal(r.body.progress.feedback,null);};
  let completed;
  await t.test('actual source traversal closes terminal material; child traversal preserves source and sealed first',async()=>{
    const h=await fixture();await h.begin();const done=await h.finish();closed(done);assert.equal(done.body.code,'module_review_passed');
    const c=await h.context();assert.equal(c.attempt.runtime.status,'review_complete');assert.equal(c.attempt.runtime.completedReviewMs,1000);
    assert.equal(c.lease.phase_active,false);assert.equal(c.lease.phase_kind,'source');assert.equal(c.actorPolicy.ledger.observationJournal.active,null);
    await h.seedChild();const before=await h.context();await h.act('resume');
    // Fresh source CAS is not permission to take an ACTIVE child lease.
    const active=await h.context(),unchanged=await snapshot(h.actor);
    const sourceResume={kind:'resume',attemptId:h.attemptId,phaseKind:'source',phaseOwnerId:h.attemptId,eventId:randomUUID(),
      expectedRevision:active.attempt.revision,expectedSourceRevision:active.attempt.revision,expectedActorRevision:active.actorPolicy.revision,
      expectedWorkflowRevision:null,sessionId:active.attempt.runtime.sessionId};
    await assert.rejects(()=>h.run(sourceResume),/session_conflict|original_observation_hold/);
    assert.deepEqual(await snapshot(h.actor),unchanged);
    const childEvent=(await db.query('select event_id from nmls_teaching_events where student_id=$1 and phase_kind=\'remediation\'',[h.actor])).rows[0].event_id;
    await assert.rejects(()=>h.run({...sourceResume,eventId:childEvent}),/idempotency_conflict/);
    assert.deepEqual(await snapshot(h.actor),unchanged);
    const childDone=await h.finish();closed(childDone);
    const after=await h.context();assert.deepEqual(after.attempt,before.attempt);assert.deepEqual(after.firstFinal,before.firstFinal);
    assert.equal(after.workflow.runtime.status,'review_complete');assert.equal(after.workflow.runtime.completedReviewMs,1000);
    assert.equal(after.actorPolicy.ledger.acceptances.length,1);assert.ok(after.actorPolicy.ledger.studySinceBreakMs>before.actorPolicy.ledger.studySinceBreakMs);
    assert.equal(after.lease.phase_kind,'remediation');assert.equal(after.lease.phase_active,false);
    completed=h;
  });
  await t.test('exact stale retry is metadata-only, cross-phase reuse conflicts; legacy cannot bypass dormant ownership',async()=>{
    const h=await fixture();await h.begin();const command=await h.command('open_unit',{unitId:'F01-U01'}),first=await h.run(command);
    assert.equal(first.body.deliveryAllowed,true);await h.act('interaction',{visible:true});const before=await snapshot(h.actor);
    const replay=await h.run(command);closed(replay);assert.equal(replay.body.duplicate,true);assert.deepEqual(await snapshot(h.actor),before);
    const changed={...command,kind:'logout'};delete changed.unitId;
    await assert.rejects(()=>h.run(changed),/idempotency_conflict/);assert.deepEqual(await snapshot(h.actor),before);
    await h.act('logout');const c=await h.context();assert.equal(c.lease.phase_active,false);assert.equal(c.lease.phase_kind,'source');
    await assert.rejects(()=>rpc('nmls_policy_start',{p_student_id:h.actor,p_grant_id:h.grant,p_course_key:course.id,p_content_digest:course.digest,p_initial_runtime:startNmlsCourseReview(course)}),/teaching_phase_requires_joint_commit/);
  });
  await t.test('failure after receipt insert rolls back runtime, actor, binding and lease; retry commits once',async()=>{
    const h=await fixture(),command=await h.command('resume'),before=await snapshot(h.actor);
    await db.exec(`create function reject_teaching_receipt() returns trigger language plpgsql as $$ begin raise exception 'SYNTHETIC_receipt_failure';end $$;
      create trigger reject_teaching_receipt after insert on nmls_teaching_events for each row execute function reject_teaching_receipt();`);
    try {await assert.rejects(()=>h.run(command),/SYNTHETIC_receipt_failure/);assert.deepEqual(await snapshot(h.actor),before);}
    finally {await db.exec('drop trigger reject_teaching_receipt on nmls_teaching_events;drop function reject_teaching_receipt();');}
    assert.equal((await h.run(command)).body.duplicate,false);assert.equal((await h.run(command)).body.duplicate,true);
  });
  await t.test('a clock crossing AFTER writes rolls back the receipt and every progress row',async()=>{
    const h=await fixture(),command=await h.command('resume'),before=await snapshot(h.actor);
    await db.exec(`create function delay_teaching_receipt() returns trigger language plpgsql as $$ begin perform pg_sleep(1.1);return new;end $$;
      create trigger delay_teaching_receipt after insert on nmls_teaching_events for each row execute function delay_teaching_receipt();`);
    try {await assert.rejects(()=>h.run(command,{clockRetries:0}),/clock_refresh_required/);assert.deepEqual(await snapshot(h.actor),before);}
    finally {await db.exec('drop trigger delay_teaching_receipt on nmls_teaching_events;drop function delay_teaching_receipt();');}
    assert.equal((await h.run(command)).body.duplicate,false);
  });
  await t.test('hidden-material recovery adds no observed time and requires a new full pause',async()=>{
    const h=await fixture();await h.begin();await h.act('open_unit',{unitId:'F01-U01'});await h.act('interaction',{visible:true});
    const hidden=await h.act('heartbeat',{visible:false,studyReceipt:{windowId:(await h.context()).actorPolicy.ledger.observationJournal.active.id,visible:false}});
    closed(hidden);const held=await h.context();assert.ok(held.actorPolicy.ledger.observationJournal.unresolved);
    const recovered=await h.act('recover_observation',{recoveryWindowId:held.actorPolicy.ledger.observationJournal.unresolved.window.id},false);
    closed(recovered);assert.equal(recovered.body.code,'study_observation_recovered');
    const after=await h.context();assert.deepEqual(after.actorPolicy.ledger.studyIntervals,held.actorPolicy.ledger.studyIntervals);
    assert.equal(after.actorPolicy.ledger.studySinceBreakMs,held.actorPolicy.ledger.studySinceBreakMs);
    assert.equal(after.attempt.runtime.completedReviewMs,0);assert.equal(after.actorPolicy.ledger.observationJournal.unresolved,null);
    assert.equal(recovered.body.resumeNotBeforeMs,after.actorPolicy.ledger.breakStartedAtMs+600000);
    closed(await h.act('resume'));assert.equal((await h.context()).attempt.runtime.completedReviewMs,0);
  });
  await t.test('clean partial work survives logout; a fresh acknowledgment does not count the absence',async()=>{
    const h=await fixture();await h.begin();await h.act('open_unit',{unitId:'F01-U01'});await h.act('interaction',{visible:true});
    await pause(120);await h.act('heartbeat',{visible:true});await h.act('logout');
    const stopped=await h.context(),partial=stopped.attempt.runtime.bookmark.current.provisionalMs;
    assert.ok(partial>0);assert.equal(stopped.lease.phase_active,false);
    await pause(120);const resumed=await h.act('resume');assert.equal(resumed.body.deliveryAllowed,true);
    const restored=await h.context();assert.equal(restored.attempt.runtime.current.provisionalMs,partial);
    assert.equal(restored.attempt.runtime.bookmark,undefined);
    assert.deepEqual(restored.actorPolicy.ledger.studyIntervals,stopped.actorPolicy.ledger.studyIntervals);
    await h.act('interaction',{visible:true});const acknowledged=await h.context();
    assert.equal(acknowledged.attempt.runtime.current.provisionalMs,partial);
    assert.deepEqual(acknowledged.actorPolicy.ledger.studyIntervals,restored.actorPolicy.ledger.studyIntervals);
  });
  await t.test('idle boundary reached after writes rolls back, then exact intent saves only logout; revoked replay refuses',async()=>{
    const h=await fixture();await h.begin();
    // Explicit owner fixture places genuine active state 500ms before idle.
    // Do not wait six real minutes or claim this is a learner attendance test.
    await db.query(`update nmls_review_attempts set runtime=jsonb_set(runtime,'{lastActivityMs}',
      to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-359500)) where id=$1`,[h.attemptId]);
    const command=await h.command('check_access'),before=await snapshot(h.actor);
    await db.exec(`create function delay_teaching_idle() returns trigger language plpgsql as $$ begin perform pg_sleep(0.65);return new;end $$;
      create trigger delay_teaching_idle after insert on nmls_teaching_events for each row execute function delay_teaching_idle();`);
    try {await assert.rejects(()=>h.run(command,{clockRetries:0}),/clock_refresh_required/);assert.deepEqual(await snapshot(h.actor),before);}
    finally {await db.exec('drop trigger delay_teaching_idle on nmls_teaching_events;drop function delay_teaching_idle();');}
    const result=await h.run(command);closed(result);assert.equal(result.status,401);
    const after=await h.context();assert.equal(after.attempt.runtime.status,'logged_out');assert.equal(after.lease.phase_active,false);
    assert.equal(after.attempt.runtime.completedReviewMs,before.nmls_review_attempts[0].runtime.completedReviewMs);
    await db.query("update nmls_review_access_grants set status='revoked' where id=$1",[h.grant]);
    const revoked=await snapshot(h.actor);await assert.rejects(()=>h.run(command),/access_denied/);
    assert.deepEqual(await snapshot(h.actor),revoked);
  });
  await t.test('changed phase/layout/CAS/completion or credit flags cannot progress through direct service commit',async()=>{
    const h=await fixture();await h.begin();const command=await h.command('open_unit',{unitId:'F01-U01'});let args;
    await assert.rejects(()=>h.run(command,{rpc:async(name,input)=>{if(name==='nmls_teaching_commit'){args=structuredClone(input);throw new Error('CAPTURE_ONLY');}return rpc(name,input);}}),/CAPTURE_ONLY/);
    for(const mutate of [a=>a.p_phase.ownerId=randomUUID(),a=>a.p_layout[0].units[0].requiredMs=1,
      a=>a.p_expected_actor_revision=null,a=>a.p_runtime.status='review_complete',a=>a.p_runtime.creditIssuanceAllowed=true,
      a=>a.p_ledger.observationJournal.version='nmls-study-windows-v2']) {
      const input=structuredClone(args);mutate(input);const before=await snapshot(h.actor);
      await assert.rejects(()=>rpc('nmls_teaching_commit',input));assert.deepEqual(await snapshot(h.actor),before);
    }
  });
  await t.test('stale session cannot close a resumed phase; dormant-child handoff preserves its runtime',async()=>{
    const h=await fixture();await h.begin();const stale=await h.command('logout');await h.act('resume');
    const c=await h.context(),cmd={...stale,expectedRevision:c.attempt.revision,expectedSourceRevision:c.attempt.revision,expectedActorRevision:c.actorPolicy.revision};
    const before=await snapshot(h.actor);await assert.rejects(()=>h.run(cmd),/session_conflict/);assert.deepEqual(await snapshot(h.actor),before);
    const x=completed;assert.ok(x);await x.act('resume');
    const source=await x.context();const originalCmd={kind:'resume',attemptId:x.attemptId,phaseKind:'source',phaseOwnerId:x.attemptId,eventId:randomUUID(),
      expectedRevision:source.attempt.revision,expectedSourceRevision:source.attempt.revision,expectedActorRevision:source.actorPolicy.revision,
      expectedWorkflowRevision:null,sessionId:source.attempt.runtime.sessionId};
    // Completed child is dormant: content-free source check is permitted, no
    // child mutation; active-child takeover is tested during traversal above.
    const priorChild=structuredClone(source.workflow);closed(await x.run(originalCmd));assert.deepEqual((await x.context()).workflow,priorChild);
  });
  await t.test('direct lease edits and internal functions are unavailable to service and browser roles',async()=>{
    const h=await fixture();await h.begin();const before=await snapshot(h.actor);
    await assert.rejects(()=>db.query("update nmls_review_study_leases set phase_kind=null,phase_owner_id=null,phase_active=false where student_id=$1",[h.actor]),/requires_joint_commit/);
    assert.deepEqual(await snapshot(h.actor),before);
    for(const role of ['anon','authenticated','service_role']) {
      for(const fn of ['nmls_teaching_canonical(jsonb)','nmls_teaching_guard_progress(jsonb,jsonb,jsonb,jsonb,jsonb,bigint)'])
        assert.equal((await db.query("select has_function_privilege($1,$2,'execute') as allowed",[role,fn])).rows[0].allowed,false);
      await db.exec(`set role ${role}`);
      try {for(const table of ['nmls_teaching_events','nmls_teaching_phase_bindings','nmls_review_study_leases'])await assert.rejects(()=>db.query(`select * from ${table}`),/permission denied/);}
      finally {await db.exec('reset role');}
    }
    const command=await h.command('resume');
    for(const role of ['anon','authenticated']) {
      await db.exec(`set role ${role}`);
      try {await assert.rejects(()=>h.run(command),/permission denied/);} finally {await db.exec('reset role');}
    }
    await db.exec('set role service_role');
    try {assert.equal((await h.run(command)).body.duplicate,false);} finally {await db.exec('reset role');}
  });
});
