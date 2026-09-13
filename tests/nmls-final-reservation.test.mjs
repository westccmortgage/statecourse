import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { transactNmlsTeaching } from '../netlify/functions/_lib/nmls-teaching-transaction.mjs';
import { transactNmlsFinalReservation } from '../netlify/functions/_lib/nmls-final-reservation.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';
import { defineNmlsDraftFinal, drawNmlsDraftFinal } from '../lib/nmls-final-assessment.mjs';

// Actual source/observer/policy reducers and real local SQL. This deliberately
// one-unit/one-second manuscript, final bank, ROCS authority and owner-only
// clock/counter fault fixtures are SYNTHETIC, not student or regulatory proof.
// Positive completion is traversed, never owner-seeded or supplied as a flag.
const course=structuredClone(getNmlsReviewCourse('nmls-2026-f01-private-review'));
course.id='synthetic-final-reservation';course.modules[0].units=[{...course.modules[0].units[0],requiredSeconds:1}];
delete course.digest;course.digest=createHash('sha256').update(JSON.stringify(course)).digest('hex');
const items=Array.from({length:50},(_,i)=>({id:`N26-FIN-F${String(i+1).padStart(2,'0')}`,category:'federal',moduleId:'F01',
  objective:'Synthetic reservation fixture.',stem:`PRIVATE SYNTHETIC FINAL QUESTION ${i+1}?`,
  options:['A','B','C','D'].map(id=>({id,text:`PRIVATE SYNTHETIC OPTION ${id}`})),correctChoice:'A',
  rationale:'PRIVATE SYNTHETIC RATIONALE',independenceNote:'Engineering only.',distractorRationales:{B:'Wrong.',C:'Wrong.',D:'Wrong.'},
  sourceRefs:[{url:'https://www.consumerfinance.gov/rules-policy/regulations/',locator:'Synthetic',supports:'No legal claim.',checkedOn:'2026-09-12'}],
  remediation:{unitIds:['F01-U01'],focus:'Synthetic practice.'}}));
const definition=defineNmlsDraftFinal(course,{id:'synthetic-reservation-final',items,moduleQuotas:{F01:25}});
const bodyKeys=['ok','code','status','reserved','finalAttemptId','finalRevision','sourceRevision','actorRevision',
  'mode','studentDeliveryEnabled','creditIssuanceAllowed','attemptId','duplicate'].sort();
function metadata(response){
  assert.deepEqual(Object.keys(response.body).sort(),bodyKeys);
  assert.equal(response.body.mode,'private_authoring_review');assert.equal(response.body.studentDeliveryEnabled,false);
  assert.equal(response.body.creditIssuanceAllowed,false);assert.equal(response.status,response.body.status);
  assert.doesNotMatch(JSON.stringify(response),/PRIVATE SYNTHETIC|questionIds|optionOrder|correctChoice|rationale|lessons|studyWindow|deliveryUntilMs/);
}

test('first-form reservation with genuine source policy persistence (local SQL only)',{
  skip:process.env.NMLS_TEST_PGLITE_MODULE?false:'PGlite required; a skip is not verification.',
},async t=>{
  const {PGlite}=await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db=new PGlite();t.after(()=>db.close());
  await db.exec('create role anon;create role authenticated;create role service_role;create table students(id uuid primary key);');
  for(const file of ['023_nmls_review_runtime.sql','024_nmls_review_discovery.sql','025_nmls_review_session_policy.sql',
    '026_nmls_private_final_history.sql','027_nmls_policy_exposure_guards.sql','028_nmls_private_final_remediation.sql',
    '029_nmls_initial_exposure.sql','030_nmls_phase_write_fences.sql','031_nmls_teaching_exposure_guards.sql',
    '032_nmls_joint_teaching.sql','033_nmls_final_reservation.sql',
    '034_nmls_final_delivery_guards.sql','035_nmls_first_final_delivery.sql','036_nmls_first_final_submission.sql','037_nmls_first_final_handoff.sql','038_nmls_second_final_reservation.sql', '039_nmls_second_final_delivery.sql', '040_nmls_second_final_submission.sql', '041_nmls_learning_snapshot.sql']) {
    await db.exec(readFileSync(new URL(`../database/nmls-private/${file}`,import.meta.url),'utf8'));
  }
  const rpc=async(name,args)=>{
    assert.match(name,/^nmls_[a-z_]+$/);const keys=Object.keys(args);assert.ok(keys.every(k=>/^p_[a-z_]+$/.test(k)));
    return (await db.query(`select ${name}(${keys.map((k,i)=>`${k}=>$${i+1}`).join(',')}) as result`,Object.values(args))).rows[0].result;
  };
  const deps={rpc,courseFor:key=>{assert.equal(key,course.id);return structuredClone(course);},definitionFor:key=>{assert.equal(key,course.id);return definition;}};
  const tables=['nmls_review_access_grants','nmls_review_attempts','nmls_review_actor_policy','nmls_review_study_leases',
    'nmls_private_finals','nmls_private_final_events','nmls_private_remediations','nmls_private_remediation_events',
    'nmls_teaching_phase_bindings','nmls_teaching_events','nmls_final_reservation_events'];
  async function snapshot(actor){const out={};for(const table of tables)out[table]=(await db.query(`select * from ${table} where student_id=$1 order by to_jsonb(${table})::text`,[actor])).rows;return out;}
  async function fixture(){
    const actor=randomUUID(),grant=randomUUID();await db.query('insert into students values($1)',[actor]);
    await db.query(`insert into nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
      values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC reservation fixture')`,[grant,actor,course.id,course.digest]);
    await rpc('nmls_policy_bind',{p_student_id:actor,p_grant_id:grant,p_policy_id:P.id,p_policy_digest:digestNmlsCommand(P),
      p_offering:{id:grant,contentDigest:course.digest,year:2026,educationType:'annual_ce',timeZone:'UTC',deadlineBasisId:'SYNTHETIC-ONLY',
        opensAtMs:Date.UTC(2026,0,1),closesAtMs:Date.UTC(2027,0,1),
        rocs:{version:'4',documentDigest:'c'.repeat(64),fullDocumentVerified:true,evidenceId:'SYNTHETIC-NOT-REAL-ROCS'}}});
    const started=await rpc('nmls_policy_start',{p_student_id:actor,p_grant_id:grant,p_course_key:course.id,p_content_digest:course.digest,
      p_initial_runtime:startNmlsCourseReview(course)});
    const h={actor,grant,attemptId:started.attempt.id};
    h.context=()=>rpc('nmls_teaching_context',{p_student_id:actor,p_attempt_id:h.attemptId,p_phase_kind:'source',p_phase_owner_id:h.attemptId});
    h.teachingCommand=async(kind,extra={})=>{
      const c=await h.context(),r=c.attempt.runtime;
      return {kind,attemptId:h.attemptId,phaseKind:'source',phaseOwnerId:h.attemptId,eventId:randomUUID(),
        expectedRevision:r.revision,expectedSourceRevision:c.attempt.revision,expectedWorkflowRevision:null,
        expectedActorRevision:c.actorPolicy?.revision??0,sessionId:r.sessionId,
        ...(c.actorPolicy?.ledger.observationJournal?.active?{studyReceipt:{windowId:c.actorPolicy.ledger.observationJournal.active.id,visible:true}}:{}),
        ...(kind==='interaction'?{observation:'keyboard'}:{}),...extra};
    };
    h.teach=input=>transactNmlsTeaching(input,actor,deps);
    h.act=async(kind,extra={})=>h.teach(await h.teachingCommand(kind,extra));
    h.accept=async()=>{
      const shown=await rpc('nmls_policy_present_rocs',{p_student_id:actor,p_attempt_id:h.attemptId,p_document_digest:'c'.repeat(64)});
      return h.act('accept_rocs',{presentationId:shown.id,version:'4',documentDigest:'c'.repeat(64),acknowledged:true});
    };
    h.complete=async()=>{
      await h.act('resume');await h.accept();await h.act('resume');
      await h.act('open_unit',{unitId:'F01-U01'});await h.act('interaction',{visible:true});await pause(1100);
      await h.act('heartbeat',{visible:true});await h.act('unit_action',{choice:course.modules[0].units[0].actionQuestion.correctChoice});
      assert.equal((await h.act('complete_unit')).body.code,'unit_review_complete');
      await h.act('quiz_start',{moduleId:'F01'});await h.act('interaction',{visible:true});
      const c=await h.context(),q=c.attempt.runtime.quiz;
      const answers=Object.fromEntries(q.questionIds.map(id=>[id,course.modules[0].quiz.bank.find(x=>x.id===id).correctChoice]));
      const done=await h.act('quiz_submit',{quizId:q.id,answers});assert.equal(done.body.code,'module_review_passed');
      assert.equal(done.body.deliveryAllowed,false);assert.deepEqual(done.body.progress.lessons,[]);
      assert.equal((await h.context()).attempt.runtime.status,'review_complete');
    };
    h.command=async(extra={})=>{
      const c=await h.context();return {kind:'reserve_first_final',attemptId:h.attemptId,eventId:randomUUID(),
        expectedSourceRevision:c.attempt.revision,expectedActorRevision:c.actorPolicy.revision,expectedFinalRevision:0,
        sessionId:c.attempt.runtime.sessionId,...extra};
    };
    h.run=(input,options={})=>transactNmlsFinalReservation(input,actor,{...deps,...options});
    h.capture=async(input)=>{
      let captured;await assert.rejects(()=>h.run(input,{rpc:async(name,args)=>{
        if(name==='nmls_final_reservation_commit'){captured=structuredClone(args);throw new Error('CAPTURE_ONLY');}return rpc(name,args);
      }}),/CAPTURE_ONLY/);assert.ok(captured);return captured;
    };
    return h;
  }

  await t.test('actual completion reserves one immutable form; stale exact replay does not evaluate or redraw',async()=>{
    const h=await fixture();await h.complete();const c=await h.context(),input=await h.command();let draws=0;
    await db.exec('set role service_role');let made;
    try {made=await h.run(input,{draw:(...args)=>{draws++;return drawNmlsDraftFinal(...args,{draw:()=>0});}});} finally {await db.exec('reset role');}
    metadata(made);assert.equal(made.body.reserved,true);assert.ok(draws>0);assert.equal(made.body.finalRevision,1);
    const after=await h.context();
    for(const field of ['completedReviewMs','completedUnitIds','passedModuleIds','lastActivityMs','sessionId','status'])
      assert.deepEqual(after.attempt.runtime[field],c.attempt.runtime[field]);
    for(const field of ['studySinceBreakMs','studyIntervals','uncertainExposure','sessionStartedAtMs','lastStudyAtMs','studyBoundaryAtMs','breakStartedAtMs','acceptances'])
      assert.deepEqual(after.actorPolicy.ledger[field],c.actorPolicy.ledger[field]);
    assert.equal(after.actorPolicy.ledger.observationJournal.active,null);assert.equal(after.actorPolicy.ledger.observationJournal.unresolved,null);
    assert.equal(after.lease.phase_active,false);assert.equal(after.lease.phase_kind,'source');
    const beforeReplay=await snapshot(h.actor),replay=await h.run(input,{evaluate:()=>{throw new Error('MUST_NOT_EVALUATE');},draw:()=>{throw new Error('MUST_NOT_DRAW');}});
    metadata(replay);assert.equal(replay.body.duplicate,true);assert.equal(replay.body.finalAttemptId,made.body.finalAttemptId);
    assert.deepEqual(await snapshot(h.actor),beforeReplay);
    const rows=beforeReplay.nmls_private_finals;assert.equal(rows.length,1);assert.equal(rows[0].revision,1);
    assert.equal(rows[0].answers,null);assert.equal(rows[0].result,null);assert.equal(rows[0].remediation_manifest,null);
    assert.equal(new Set(rows[0].selection.questionIds).size,25);
    for(const order of Object.values(rows[0].selection.optionOrder))assert.deepEqual([...order].sort(),['A','B','C','D']);
    assert.equal(beforeReplay.nmls_private_final_events.length,0);assert.equal(beforeReplay.nmls_private_remediations.length,0);
    await assert.rejects(async()=>h.run(await h.command()),/already_issued|history/);
    assert.deepEqual(await snapshot(h.actor),beforeReplay);
    await assert.rejects(()=>rpc('nmls_private_final_context',{p_student_id:h.actor,p_review_attempt_id:h.attemptId,p_event_id:randomUUID()}),/policy_integration_required|policy_flow_required/);
  });

  await t.test('actual ROCS denial records no form; later acceptance/reservation cannot rewrite old denied replay',async()=>{
    const h=await fixture();await h.complete();
    // Owner-only missing-acceptance fault fixture. The subsequent acceptance
    // uses the actual presentation+acceptance reducers, not a fabricated flag.
    await db.query("update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{acceptances}','[]') where student_id=$1",[h.actor]);
    const deniedInput=await h.command(),denied=await h.run(deniedInput,{draw:()=>{throw new Error('DENIAL_MUST_NOT_DRAW');}});
    metadata(denied);assert.equal(denied.status,409);assert.equal(denied.body.code,'rocs_required');assert.equal(denied.body.reserved,false);
    assert.equal(denied.body.finalAttemptId,null);assert.equal((await snapshot(h.actor)).nmls_private_finals.length,0);
    await h.accept();const made=await h.run(await h.command());metadata(made);assert.equal(made.body.reserved,true);
    const before=await snapshot(h.actor),replay=await h.run(deniedInput,{evaluate:()=>{throw new Error('MUST_NOT_EVALUATE');},draw:()=>{throw new Error('MUST_NOT_DRAW');}});
    metadata(replay);assert.equal(replay.body.duplicate,true);assert.equal(replay.body.code,'rocs_required');assert.equal(replay.body.finalAttemptId,null);
    assert.deepEqual(await snapshot(h.actor),before);
  });

  await t.test('failure after either final or reservation receipt insertion rolls back source, actor, lease and all history',async()=>{
    for(const table of ['nmls_private_finals','nmls_final_reservation_events']){
      const h=await fixture();await h.complete();const input=await h.command(),before=await snapshot(h.actor);
      await db.exec(`create function fail_final_reservation() returns trigger language plpgsql as $$ begin raise exception 'SYNTHETIC_RESERVATION_FAILURE';end $$;
        create trigger fail_final_reservation after insert on ${table} for each row execute function fail_final_reservation();`);
      try {await assert.rejects(()=>h.run(input),/SYNTHETIC_RESERVATION_FAILURE/);assert.deepEqual(await snapshot(h.actor),before);}
      finally {await db.exec(`drop trigger fail_final_reservation on ${table};drop function fail_final_reservation();`);}
      const retry=await h.run(input);metadata(retry);assert.equal(retry.body.reserved,true);
      assert.equal((await snapshot(h.actor)).nmls_final_reservation_events.length,1);
    }
  });

  await t.test('a preexisting teaching event cannot be supplemented; missing reservation half remains a conflict',async()=>{
    const h=await fixture();await h.complete();const prior=await h.teachingCommand('check_access');await h.teach(prior);
    const before=await snapshot(h.actor);
    await assert.rejects(async()=>h.run(await h.command({eventId:prior.eventId})),/idempotency_conflict/);
    assert.deepEqual(await snapshot(h.actor),before);
    const input=await h.command();await h.run(input);
    // Owner-only corruption to exercise the forbidden historical repair path.
    await db.exec('alter table nmls_final_reservation_events disable trigger nmls_final_reservation_event_immutable');
    try {await db.query('delete from nmls_final_reservation_events where student_id=$1 and event_id=$2',[h.actor,input.eventId]);}
    finally {await db.exec('alter table nmls_final_reservation_events enable trigger nmls_final_reservation_event_immutable');}
    const corrupt=await snapshot(h.actor);await assert.rejects(()=>h.run(input),/idempotency_conflict/);
    assert.deepEqual(await snapshot(h.actor),corrupt);
  });

  await t.test('stored selection drift and a missing teaching half are never repaired by exact replay',async()=>{
    const h=await fixture();await h.complete();const input=await h.command();await h.run(input);
    const original=(await snapshot(h.actor)).nmls_private_finals[0],changed=structuredClone(original.selection);
    changed.optionOrder[changed.questionIds[0]].reverse();
    // Owner-only corruption: even a still structurally valid option permutation
    // must match the immutable reservation's original selection fingerprint.
    await db.exec('alter table nmls_private_finals disable trigger nmls_private_final_immutable');
    try {await db.query('update nmls_private_finals set selection=$1 where id=$2',[changed,original.id]);}
    finally {await db.exec('alter table nmls_private_finals enable trigger nmls_private_final_immutable');}
    let before=await snapshot(h.actor);await assert.rejects(()=>h.run(input),/idempotency_conflict/);assert.deepEqual(await snapshot(h.actor),before);
    await db.exec('alter table nmls_private_finals disable trigger nmls_private_final_immutable');
    try {await db.query('update nmls_private_finals set selection=$1 where id=$2',[original.selection,original.id]);}
    finally {await db.exec('alter table nmls_private_finals enable trigger nmls_private_final_immutable');}
    // Bypass immutability AND the receipt FK as owner solely to create the
    // impossible historical half-pair that commit must explicitly fail closed.
    await db.exec('alter table nmls_teaching_events disable trigger all');
    try {await db.query('delete from nmls_teaching_events where student_id=$1 and event_id=$2',[h.actor,input.eventId]);}
    finally {await db.exec('alter table nmls_teaching_events enable trigger all');}
    before=await snapshot(h.actor);await assert.rejects(()=>h.run(input),/idempotency_conflict/);assert.deepEqual(await snapshot(h.actor),before);
  });

  await t.test('stale source/actor, wrong session and uninstrumented old first forms are not adopted',async()=>{
    const h=await fixture();await h.complete();const old=await h.command();await h.act('check_access');
    let before=await snapshot(h.actor);await assert.rejects(()=>h.run(old),/revision_conflict/);assert.deepEqual(await snapshot(h.actor),before);
    await assert.rejects(async()=>h.run(await h.command({sessionId:randomUUID()})),/session_conflict/);assert.deepEqual(await snapshot(h.actor),before);
    const c=await h.context(),id=randomUUID(),selection=drawNmlsDraftFinal(definition,{id,reviewAttemptId:h.attemptId,reviewState:c.attempt.runtime});
    await db.query(`insert into nmls_private_finals(id,review_attempt_id,student_id,course_key,content_digest,definition_digest,revision,selection)
      values($1,$2,$3,$4,$5,$6,1,$7)`,[id,h.attemptId,h.actor,course.id,course.digest,definition.digest,selection]);
    before=await snapshot(h.actor);await assert.rejects(async()=>h.run(await h.command()),/already_issued|history/);
    assert.deepEqual(await snapshot(h.actor),before);assert.equal(before.nmls_final_reservation_events.length,0);
  });

  await t.test('completed source older than six minutes can reserve metadata without exam activation or activity refresh',async()=>{
    const h=await fixture();await h.complete();
    // Completed teaching has no active idle clock. This explicit clock fixture
    // proves reservation neither pretends to resume teaching nor starts an exam.
    await db.query(`update nmls_review_attempts set runtime=jsonb_set(runtime,'{lastActivityMs}',
      to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-360001)) where id=$1`,[h.attemptId]);
    const before=await h.context(),made=await h.run(await h.command());metadata(made);assert.equal(made.body.reserved,true);
    const after=await h.context();assert.equal(after.attempt.runtime.lastActivityMs,before.attempt.runtime.lastActivityMs);
    assert.equal(after.attempt.runtime.sessionId,before.attempt.runtime.sessionId);assert.equal(after.lease.phase_active,false);
    assert.equal(after.actorPolicy.ledger.observationJournal.active,null);
  });

  await t.test('direct service proposals cannot forge source scope, material, credit, selection or successful budget labels',async()=>{
    const h=await fixture();await h.complete();
    const mutations=[a=>a.p_transition.phase.kind='remediation',a=>a.p_transition.phase.ownerId=randomUUID(),
      a=>a.p_transition.runtime.completedReviewMs=0,a=>a.p_transition.outcome.deliveryAllowed=true,
      a=>a.p_transition.outcome.questions=['PRIVATE'],a=>a.p_transition.outcome.progress.lessons=[{id:'F01-U01'}],
      a=>a.p_transition.ledger.creditIssuanceAllowed=true,a=>a.p_transition.ledger.observationJournal.version='nmls-study-windows-v2',
      a=>a.p_transition.audit.review.kind='resume',a=>a.p_transition.audit.policy.kind='open_session',
      a=>a.p_selection.number=2,a=>a.p_selection.questionIds[0]=null,a=>a.p_selection.answers={},
      a=>a.p_selection.optionOrder[a.p_selection.questionIds[0]]=['A','A','C','D']];
    // Every corruption starts with a freshly loaded context and genuine
    // evaluation. Reusing one captured proposal across this loop could test
    // the one-second clock fence instead of the intended validation guard.
    for(const mutate of mutations){const before=await snapshot(h.actor);
      const changed=await h.capture(await h.command());mutate(changed);
      await assert.rejects(()=>rpc('nmls_final_reservation_commit',changed),error=>{
        assert.doesNotMatch(error.message,/clock_refresh_required/);return true;
      });assert.deepEqual(await snapshot(h.actor),before);}
    // Preserve a real allowed transition's labels while moving BOTH stored and
    // proposed accounting to exact restriction boundaries. SQL must do its own
    // arithmetic; these negative proposals NEVER claim a real reducer allowed
    // access at a boundary. Restore owner fault fixtures between independent cases.
    for(const accountingPatch of [()=>({studySinceBreakMs:12000000}),
      at=>({studyIntervals:[{start:at-36000000,end:at}],lastStudyAtMs:at}),
      at=>({sessionStartedAtMs:at-43200000})]){
      const base=(await h.context()).actorPolicy.ledger;
      const boundary=await h.capture(await h.command()),patch=accountingPatch(boundary.p_evaluated_at_ms);
      await db.query('update nmls_review_actor_policy set ledger=$1 where student_id=$2',[{...base,...patch},h.actor]);
      Object.assign(boundary.p_transition.ledger,patch);
      try {
        const before=await snapshot(h.actor);await assert.rejects(()=>rpc('nmls_final_reservation_commit',boundary),/invalid_reservation_access/);
        assert.deepEqual(await snapshot(h.actor),before);
      } finally {await db.query('update nmls_review_actor_policy set ledger=$1 where student_id=$2',[base,h.actor]);}
    }
  });

  await t.test('session or annual cutoff during reservation insertion rolls everything back; fresh retry saves only refusal',async()=>{
    for(const boundary of ['session','annual']){
      const h=await fixture();await h.complete();
      // Owner-only clock/authority fault fixtures place the original actor
      // session or original offering 600ms before its real SQL deadline.
      if(boundary==='session')await db.query(`update nmls_review_actor_policy set ledger=jsonb_set(ledger,'{sessionStartedAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-43200000+600)) where student_id=$1`,[h.actor]);
      else await db.query(`update nmls_review_policy_bindings set offering=jsonb_set(offering,'{closesAtMs}',
        to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint+600)) where grant_id=$1`,[h.grant]);
      const input=await h.command(),before=await snapshot(h.actor);
      await db.exec(`create function delay_final_reservation() returns trigger language plpgsql as $$ begin perform pg_sleep(0.7);return new;end $$;
        create trigger delay_final_reservation after insert on nmls_final_reservation_events for each row execute function delay_final_reservation();`);
      try {await assert.rejects(()=>h.run(input,{clockRetries:0}),/clock_refresh_required/);assert.deepEqual(await snapshot(h.actor),before);}
      finally {await db.exec('drop trigger delay_final_reservation on nmls_final_reservation_events;drop function delay_final_reservation();');}
      const retry=await h.run(input,{draw:()=>{throw new Error('EXPIRED_AUTHORITY_MUST_NOT_DRAW');}});metadata(retry);
      assert.equal(retry.body.code,boundary==='session'?'session_wall_limit':'delivery_window_closed');assert.equal(retry.body.reserved,false);
      assert.equal((await snapshot(h.actor)).nmls_private_finals.length,0);
    }
  });

  await t.test('grant expiry reached after either new write rolls back all pending state and history',async()=>{
    for(const table of ['nmls_private_finals','nmls_final_reservation_events']){
      const h=await fixture();await h.complete();
      // The original locked grant deadline is known BEFORE evaluation. Time
      // crosses it during insertion; no owner mutation bypasses a held lock.
      await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '600 milliseconds' where id=$1",[h.grant]);
      const input=await h.command(),before=await snapshot(h.actor);
      await db.exec(`create function expire_reservation_grant() returns trigger language plpgsql as $$ begin perform pg_sleep(0.7);return new;end $$;
        create trigger expire_reservation_grant after insert on ${table} for each row execute function expire_reservation_grant();`);
      try {await assert.rejects(()=>h.run(input),/access_denied/);assert.deepEqual(await snapshot(h.actor),before);}
      finally {await db.exec(`drop trigger expire_reservation_grant on ${table};drop function expire_reservation_grant();`);}
      await assert.rejects(()=>h.run(input),/access_denied/);assert.deepEqual(await snapshot(h.actor),before);
    }
  });

  await t.test('over-one-second post-write freshness rollback retries with the same tentative form, not a new draw',async()=>{
    const h=await fixture();await h.complete();const input=await h.command(),before=await snapshot(h.actor);
    await db.exec(`create function stale_final_reservation() returns trigger language plpgsql as $$ begin perform pg_sleep(1.1);return new;end $$;
      create trigger stale_final_reservation after insert on nmls_final_reservation_events for each row execute function stale_final_reservation();`);
    let delayInstalled=true,draws=0,refreshes=0;const submissions=[];
    try {
      const made=await h.run(input,{draw:(...args)=>{draws++;return drawNmlsDraftFinal(...args);},rpc:async(name,args)=>{
        if(name==='nmls_final_reservation_commit')submissions.push(structuredClone(args));
        try {return await rpc(name,args);} catch(error){
          if(name==='nmls_final_reservation_commit' && /clock_refresh_required/.test(error.message)){
            refreshes++;assert.deepEqual(await snapshot(h.actor),before);
            await db.exec('drop trigger stale_final_reservation on nmls_final_reservation_events;drop function stale_final_reservation();');delayInstalled=false;
          }
          throw error;
        }
      }});
      metadata(made);assert.equal(made.body.reserved,true);assert.equal(refreshes,1);assert.equal(draws,1);assert.equal(submissions.length,2);
      assert.equal(submissions[0].p_final_id,submissions[1].p_final_id);assert.deepEqual(submissions[0].p_selection,submissions[1].p_selection);
      assert.ok(submissions[1].p_evaluated_at_ms>submissions[0].p_evaluated_at_ms);
      const after=await snapshot(h.actor);assert.equal(after.nmls_private_finals.length,1);assert.equal(after.nmls_final_reservation_events.length,1);
      assert.equal(after.nmls_review_attempts[0].revision,before.nmls_review_attempts[0].revision+1);
      assert.equal(after.nmls_review_actor_policy[0].revision,before.nmls_review_actor_policy[0].revision+1);
    } finally {if(delayInstalled)await db.exec('drop trigger stale_final_reservation on nmls_final_reservation_events;drop function stale_final_reservation();');}
  });

  await t.test('owner-seeded replacement grant and review cannot reset the same student/course first history',async()=>{
    const h=await fixture();await h.complete();await h.run(await h.command());
    // Explicit owner fixture: normal legacy start is already held by phase
    // ownership. The replacement is pristine, not a counterfeit completion.
    // History must refuse BEFORE considering its stale CAS or missing lease.
    const grant=randomUUID(),attempt=randomUUID(),c=await h.context();
    await db.query(`insert into nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
      values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC replacement-grant fault fixture')`,[grant,h.actor,course.id,course.digest]);
    await rpc('nmls_policy_bind',{p_student_id:h.actor,p_grant_id:grant,p_policy_id:P.id,p_policy_digest:digestNmlsCommand(P),
      p_offering:{...c.binding.offering,id:grant}});
    await db.query(`insert into nmls_review_attempts(id,grant_id,student_id,course_key,content_digest,runtime)
      values($1,$2,$3,$4,$5,$6)`,[attempt,grant,h.actor,course.id,course.digest,startNmlsCourseReview(course)]);
    const before=await snapshot(h.actor);
    await assert.rejects(()=>rpc('nmls_final_reservation_commit',{p_student_id:h.actor,p_attempt_id:attempt,p_event_id:randomUUID(),
      p_command_digest:digestNmlsCommand({kind:'synthetic_replacement_attempt'}),p_expected_source_revision:0,p_expected_actor_revision:0,
      p_expected_session_id:null,p_evaluated_at_ms:c.serverTimeMs,p_definition_digest:definition.digest,
      p_final_id:null,p_selection:null,p_transition:null}),/history_scope_conflict/);
    assert.deepEqual(await snapshot(h.actor),before);assert.equal(before.nmls_private_finals.length,1);
  });

  await t.test('only private RPCs are service callable; revoked metadata replay is denied',async()=>{
    const h=await fixture();await h.complete();const input=await h.command();await h.run(input);
    for(const role of ['anon','authenticated','service_role']){
      await db.exec(`set role ${role}`);
      try {await assert.rejects(()=>db.query('select * from nmls_final_reservation_events'),/permission denied/);
        await assert.rejects(()=>db.query('select * from nmls_private_finals'),/permission denied/);}
      finally {await db.exec('reset role');}
      for(const fn of ['nmls_final_reservation_context(uuid,uuid,uuid)',
        'nmls_final_reservation_commit(uuid,uuid,uuid,text,bigint,bigint,uuid,bigint,text,uuid,jsonb,jsonb)'])
        assert.equal((await db.query("select has_function_privilege($1,$2,'execute') as allowed",[role,fn])).rows[0].allowed,role==='service_role');
    }
    await db.query("update nmls_review_access_grants set status='revoked' where id=$1",[h.grant]);
    const before=await snapshot(h.actor);await assert.rejects(()=>h.run(input),/access_denied/);assert.deepEqual(await snapshot(h.actor),before);
  });
});
