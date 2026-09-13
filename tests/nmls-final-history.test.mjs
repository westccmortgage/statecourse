import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { transactNmlsFinalHistory, validateNmlsFinalHistoryInput } from '../netlify/functions/_lib/nmls-final-history.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';
import { drawNmlsDraftFinal, gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';

const courseKey = 'nmls-2026-national-comprehensive-private-review-v3';
const course = getNmlsReviewCourse(courseKey), definition = getNmlsDraftFinalDefinition(courseKey);
const issue = f => ({kind:'issue',reviewAttemptId:f.attemptId,eventId:randomUUID(),expectedReviewRevision:0,expectedFinalRevision:0});
const answerSet = (selection, correct) => Object.fromEntries(selection.questionIds.map(id => {
  const key=definition.items.find(item=>item.id===id).correctChoice;
  return [id,correct?key:['A','B','C','D'].find(choice=>choice!==key)];
}));
const submit = (f,row,correct=false) => ({kind:'submit',reviewAttemptId:f.attemptId,eventId:randomUUID(),expectedReviewRevision:0,
  expectedFinalRevision:1,finalAttemptId:row.id,answers:answerSet(row.selection,correct)});

test('private final input excludes caller history, clock, replacement form, result and remediation',async()=>{
  const base=issue({attemptId:randomUUID()});
  for(const field of ['studentId','previous','selection','result','remediationState','completed','serverTimeMs','definitionDigest','finalAttemptId']) {
    assert.throws(()=>validateNmlsFinalHistoryInput({...base,[field]:{}}),/invalid_request/);
  }
  for(const kind of ['retake','reset','complete_remediation','grade','project'])assert.throws(()=>validateNmlsFinalHistoryInput({...base,kind}),/invalid_request/);
  await assert.rejects(()=>transactNmlsFinalHistory(base,null,{}),/invalid_authenticated_actor/);
});

test('durable first-final SQL + adapter (disposable PGlite; no real learner/production)',{
  skip:process.env.NMLS_TEST_PGLITE_MODULE?false:'Set NMLS_TEST_PGLITE_MODULE; skipped SQL is not verified.',
},async t=>{
  const {PGlite}=await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db=new PGlite();t.after(()=>db.close());
  await db.exec('create role anon; create role authenticated; create role service_role; create table public.students(id uuid primary key);');
  for(const file of ['023_nmls_review_runtime.sql','024_nmls_review_discovery.sql','025_nmls_review_session_policy.sql','026_nmls_private_final_history.sql',
    '027_nmls_policy_exposure_guards.sql','028_nmls_private_final_remediation.sql','029_nmls_initial_exposure.sql','030_nmls_phase_write_fences.sql',
    '031_nmls_teaching_exposure_guards.sql','032_nmls_joint_teaching.sql','033_nmls_final_reservation.sql',
    '034_nmls_final_delivery_guards.sql','035_nmls_first_final_delivery.sql','036_nmls_first_final_submission.sql','037_nmls_first_final_handoff.sql','038_nmls_second_final_reservation.sql', '039_nmls_second_final_delivery.sql', '040_nmls_second_final_submission.sql', '041_nmls_learning_snapshot.sql'])
    await db.exec(readFileSync(new URL(`../database/nmls-private/${file}`,import.meta.url),'utf8'));
  const rpc=async(name,args)=>{
    assert.match(name,/^nmls_(private_final|review)_[a-z_]+$/);
    const keys=Object.keys(args);assert.ok(keys.every(key=>/^p_[a-z_]+$/.test(key)));
    return(await db.query(`select public.${name}(${keys.map((key,i)=>`${key}=>$${i+1}`).join(',')}) as result`,Object.values(args))).rows[0].result;
  };
  const now=async()=>Number((await db.query('select floor(extract(epoch from clock_timestamp())*1000) as ms')).rows[0].ms);
  assert.equal(new Date(await now()).getUTCFullYear(),2026,'Explicit 2026 authoring fixture; not a production deadline.');
  async function fixture({actor=randomUUID(),complete=true}={}){
    await db.query('insert into students(id) values($1) on conflict do nothing',[actor]);
    const grantId=randomUUID();
    await db.query(`insert into nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
      values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC no learner attendance')`,[grantId,actor,courseKey,course.digest]);
    // Explicit synthetic prerequisite setup, NOT passage through 400 real minutes.
    const runtime=startNmlsCourseReview(course);
    if(complete)Object.assign(runtime,{status:'review_complete',completedUnitIds:course.modules.flatMap(m=>m.units.map(u=>u.id)),
      passedModuleIds:course.modules.map(m=>m.id),current:null,quiz:null});
    const c=await rpc('nmls_review_start',{p_student_id:actor,p_grant_id:grantId,p_course_key:courseKey,p_content_digest:course.digest,p_initial_runtime:runtime});
    return{actor,grantId,attemptId:c.attempt.id};
  }
  const run=(f,input,deps={})=>transactNmlsFinalHistory(input,f.actor,{rpc,...deps});
  const row=async f=>(await db.query('select * from nmls_private_finals where review_attempt_id=$1',[f.attemptId])).rows[0];
  const snapshots=async f=>({finals:(await db.query('select * from nmls_private_finals where student_id=$1 order by id',[f.actor])).rows,
    events:(await db.query('select * from nmls_private_final_events where student_id=$1 order by resulting_revision',[f.actor])).rows});
  const studySnapshot=async f=>({review:(await db.query('select * from nmls_review_attempts where id=$1',[f.attemptId])).rows,
    lease:(await db.query('select * from nmls_review_study_leases where student_id=$1',[f.actor])).rows,
    policy:(await db.query('select * from nmls_review_actor_policy where student_id=$1',[f.actor])).rows});
  const f=await fixture();
  // Establish the actor mutex before comparing; finals never take over or alter it.
  await db.query('insert into nmls_review_study_leases(student_id) values($1) on conflict do nothing',[f.actor]);
  const beforeStudy=await studySnapshot(f);
  let firstCommand,firstResult,firstRow,submitCommand,submitted;
  await t.test('issue saves one private form; lost-response retry neither redraws nor returns questions',async()=>{
    firstCommand=issue(f);let draws=0;
    const deps={draw:(...args)=>{draws++;return drawNmlsDraftFinal(...args);}};
    firstResult=await run(f,firstCommand,deps);firstRow=await row(f);
    assert.equal(draws,1);assert.equal(firstRow.selection.questionIds.length,25);
    assert.equal(firstRow.selection.id,firstResult.outcome.finalAttemptId);
    assert.equal(firstResult.outcome.studentDeliveryEnabled,false);
    const before=await snapshots(f),duplicate=await run(f,firstCommand,deps);
    assert.equal(draws,1);assert.equal(duplicate.duplicate,true);assert.deepEqual(duplicate.outcome,firstResult.outcome);
    assert.deepEqual(await snapshots(f),before);
    // Model the advisory READ COMMITTED interstatement snapshot in which final
    // lookup preceded a concurrent issue, but event lookup saw its commit. The
    // locked commit must resolve this, without trusting an absent old snapshot.
    const mixedSnapshot=async(name,args)=>{const c=await rpc(name,args);return name==='nmls_private_final_context'?{...c,final:null}:c;};
    assert.deepEqual((await run(f,firstCommand,{...deps,rpc:mixedSnapshot})).outcome,firstResult.outcome);
    assert.equal(draws,1);
    assert.doesNotMatch(JSON.stringify(firstResult),/questionIds|optionOrder|N26-FIN-|answers|correctChoice|stem/);
    await assert.rejects(()=>run(f,{...firstCommand,eventId:randomUUID(),expectedFinalRevision:1}),/already_issued/);
    await assert.rejects(()=>run(f,{...firstCommand,expectedReviewRevision:1}),/idempotency_conflict/);
    await assert.rejects(()=>run(f,{...submit(f,firstRow),eventId:firstCommand.eventId}),/idempotency_conflict/);
    assert.deepEqual(await studySnapshot(f),beforeStudy);
  });
  await t.test('failed submission seals exact answers/result + source-bound remediation without keys',async()=>{
    submitCommand=submit(f,firstRow);let grades=0;
    const deps={grade:(...args)=>{grades++;return gradeNmlsDraftFinal(...args);}};
    submitted=await run(f,submitCommand,deps);
    assert.equal(grades,1);assert.equal(submitted.outcome.result.correct,0);assert.equal(submitted.outcome.result.passed,false);
    assert.equal(submitted.outcome.retakeEnabled,false);
    const saved=await row(f),remediation=makeNmlsFinalRemediationCourse(definition,course,saved.selection,saved.answers);
    assert.deepEqual(saved.answers,submitCommand.answers);assert.deepEqual(saved.selection,firstRow.selection);
    assert.equal(saved.remediation_manifest.contentDigest,remediation.digest);
    assert.equal(saved.remediation_manifest.finalAttemptId,saved.id);assert.equal(saved.remediation_manifest.reviewAttemptId,f.attemptId);
    assert.deepEqual(saved.remediation_manifest.moduleIds,remediation.modules.map(m=>m.id));
    assert.deepEqual(saved.remediation_manifest.unitIds,remediation.modules.flatMap(m=>m.units.map(u=>u.id)));
    assert.equal(saved.remediation_manifest.completed,false);
    const before=await snapshots(f),replay=await run(f,submitCommand,deps);
    assert.equal(grades,1);assert.equal(replay.duplicate,true);assert.deepEqual(replay.outcome,submitted.outcome);
    await assert.rejects(()=>run(f,{...submitCommand,answers:answerSet(firstRow.selection,true)},deps),/idempotency_conflict/);
    await assert.rejects(()=>run(f,{...submitCommand,eventId:randomUUID()},deps),/revision_conflict/);
    await assert.rejects(()=>run(f,{...submitCommand,eventId:randomUUID(),expectedFinalRevision:2},deps),/already_submitted/);
    assert.equal(grades,1);assert.deepEqual(await snapshots(f),before);
    assert.doesNotMatch(JSON.stringify(submitted),/N26-FIN-|answers|correctChoice|rationale|questionIds|optionOrder/);
    assert.deepEqual(await studySnapshot(f),beforeStudy);
    // Database-owner tampering is outside the threat model, but sealed row also
    // has an immutable transition trigger; intended roles lack direct writes.
    await assert.rejects(()=>db.query('update nmls_private_finals set revision=1 where id=$1',[saved.id]),/immutable/);
    await assert.rejects(()=>db.query("update nmls_private_final_events set outcome='{}' where final_id=$1",[saved.id]),/event_immutable/);
    await assert.rejects(()=>db.query('delete from nmls_private_final_events where final_id=$1',[saved.id]),/event_immutable/);
  });
  await t.test('exact replay survives review revision changes, but never expired/revoked authority',async()=>{
    await db.query('update nmls_review_attempts set revision=revision+1 where id=$1',[f.attemptId]);
    assert.deepEqual((await run(f,submitCommand)).outcome,submitted.outcome);
    await db.query("update nmls_review_access_grants set status='revoked' where id=$1",[f.grantId]);
    await assert.rejects(()=>run(f,submitCommand),/access_denied/);
    await db.query("update nmls_review_access_grants set status='active',expires_at=clock_timestamp()-interval '1 second' where id=$1",[f.grantId]);
    await assert.rejects(()=>run(f,submitCommand),/access_denied/);
    await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '1 day' where id=$1",[f.grantId]);
  });
  await t.test('foreign actor, incomplete review, regrant reset and changed definition cannot issue',async()=>{
    const foreign=await fixture(),incomplete=await fixture({complete:false}),regrant=await fixture({actor:f.actor});
    await assert.rejects(()=>run(foreign,firstCommand),/access_denied/);
    await assert.rejects(()=>run(incomplete,issue(incomplete)),/review_prerequisites/);
    await assert.rejects(()=>run(regrant,issue(regrant)),/history_scope_conflict/);
    await assert.rejects(()=>run(f,submitCommand,{definitionFor:key=>({...getNmlsDraftFinalDefinition(key),digest:'f'.repeat(64)})}),/history_scope_conflict/);
    assert.equal(await row(foreign),undefined);assert.equal(await row(incomplete),undefined);assert.equal(await row(regrant),undefined);
  });
  await t.test('competing issue and submit intents commit one form/result; losers disclose no provisional grade',async()=>{
    const c=await fixture();
    // Force BOTH operations to evaluate from the same context. Still one PGlite
    // connection: verifies CAS, not real concurrent PostgreSQL lock scheduling.
    async function race(inputs){let arrivals=0,release;const ready=new Promise(resolve=>release=resolve);
      const raced=async(name,args)=>{const result=await rpc(name,args);if(name==='nmls_private_final_context'){if(++arrivals===2)release();await ready;}return result;};
      return Promise.allSettled(inputs.map(input=>run(c,input,{rpc:raced})));
    }
    const draws=await race([issue(c),issue(c)]);
    assert.equal(draws.filter(r=>r.status==='fulfilled').length,1);
    assert.match(draws.find(r=>r.status==='rejected').reason.message,/revision_conflict/);
    const selected=await row(c);
    const graded=await race([submit(c,selected,true),submit(c,selected,false)]);
    assert.equal(graded.filter(r=>r.status==='fulfilled').length,1);
    assert.match(graded.find(r=>r.status==='rejected').reason.message,/revision_conflict/);
    const saved=await row(c),winner=graded.find(r=>r.status==='fulfilled').value;
    assert.deepEqual(saved.result,winner.outcome.result);assert.equal((await snapshots(c)).events.length,2);
    if(saved.result.passed)assert.equal(saved.remediation_manifest,null);
  });
  await t.test('actual SQL failure after final UPDATE rolls back answers/result/remediation/event; retry works',async()=>{
    const c=await fixture();await run(c,issue(c));const selected=await row(c),cmd=submit(c,selected),before=await snapshots(c);
    await db.exec(`create function public.reject_private_final_event() returns trigger language plpgsql as $$ begin
      if new.resulting_revision=2 then raise exception 'synthetic_after_final_update'; end if; return new; end $$;
      create trigger reject_private_final_event before insert on nmls_private_final_events for each row execute function reject_private_final_event();`);
    try{await assert.rejects(()=>run(c,cmd),/synthetic_after_final_update/);assert.deepEqual(await snapshots(c),before);}
    finally{await db.exec('drop trigger reject_private_final_event on nmls_private_final_events; drop function reject_private_final_event();');}
    assert.equal((await run(c,cmd)).outcome.revision,2);
  });
  await t.test('expiry while saving the event rolls back finalization, not just the response',async()=>{
    const c=await fixture();await run(c,issue(c));const selected=await row(c),cmd=submit(c,selected),before=await snapshots(c);
    await db.exec(`create function public.delay_private_final_event() returns trigger language plpgsql as $$ begin
      if new.resulting_revision=2 then perform pg_sleep(0.3); end if; return new; end $$;
      create trigger delay_private_final_event before insert on nmls_private_final_events for each row execute function delay_private_final_event();`);
    const expireDuringCommit=async(name,args)=>{
      if(name==='nmls_private_final_commit')await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '0.2 second' where id=$1",[c.grantId]);
      return rpc(name,args);
    };
    try{await assert.rejects(()=>run(c,cmd,{rpc:expireDuringCommit}),/access_denied/);assert.deepEqual(await snapshots(c),before);}
    finally{await db.exec('drop trigger delay_private_final_event on nmls_private_final_events; drop function delay_private_final_event();');}
  });
  await t.test('authoritative completion is rechecked at submit; storage rejects a NULL answer snapshot',async()=>{
    const c=await fixture();await run(c,issue(c));const selected=await row(c),cmd=submit(c,selected);
    await db.query(`update nmls_review_attempts set runtime=jsonb_set(runtime,'{completedUnitIds}','[]') where id=$1`,[c.attemptId]);
    await assert.rejects(()=>run(c,cmd),/review_prerequisites/);assert.equal((await row(c)).revision,1);
    const result=gradeNmlsDraftFinal(definition,selected.selection,cmd.answers);
    await assert.rejects(()=>db.query(`update nmls_private_finals set revision=2,answers=null,result=$2,submitted_at=clock_timestamp() where id=$1`,[selected.id,result]),/check constraint/);
    assert.equal((await row(c)).revision,1);
  });
  await t.test('SQL independently refuses null CAS, changed pins, forged credit and policy flow',async()=>{
    const c=await fixture();let args;
    const capture=async(name,values)=>{if(name==='nmls_private_final_commit'){args=structuredClone(values);throw new Error('captured');}return rpc(name,values);};
    await assert.rejects(()=>run(c,issue(c),{rpc:capture}),/captured/);
    for(const key of ['p_expected_review_revision','p_expected_final_revision'])await assert.rejects(()=>rpc('nmls_private_final_commit',{...args,[key]:null}),/revision_conflict/);
    await assert.rejects(()=>rpc('nmls_private_final_commit',{...args,p_content_digest:'a'.repeat(64)}),/content_changed/);
    await assert.rejects(()=>rpc('nmls_private_final_commit',{...args,p_selection:{...args.p_selection,number:2}}),/invalid_selection/);
    // SQL injection here is deliberate synthetic policy-binding setup, not ROCS acceptance.
    await db.query(`insert into nmls_review_policy_bindings(grant_id,policy_id,policy_digest,offering)
      values($1,'synthetic','${'b'.repeat(64)}',$2)`,[c.grantId,{id:c.grantId,contentDigest:course.digest}]);
    await assert.rejects(()=>rpc('nmls_private_final_commit',args),/policy_integration_required/);
    await assert.rejects(()=>run(c,issue(c)),/policy_flow_required|policy_integration_required/);
    assert.equal(await row(c),undefined);
    const d=await fixture();await run(d,issue(d));const selected=await row(d);
    await assert.rejects(()=>run(d,submit(d,selected),{rpc:capture}),/captured/);
    await assert.rejects(()=>rpc('nmls_private_final_commit',{...args,p_result:{...args.p_result,creditIssuanceAllowed:true}}),/invalid_result/);
    await assert.rejects(()=>rpc('nmls_private_final_commit',{...args,p_remediation_manifest:{...args.p_remediation_manifest,completed:true}}),/invalid_remediation/);
    assert.equal((await row(d)).revision,1);
  });
  await t.test('actual browser roles have no SQL access; service may call RPC but cannot read or write tables',async()=>{
    for(const role of ['anon','authenticated','service_role']){
      await db.exec(`set role ${role}`);
      try{
        for(const table of ['nmls_private_finals','nmls_private_final_events']){
          await assert.rejects(()=>db.query(`select * from ${table}`),/permission denied/);
          await assert.rejects(()=>db.query(`delete from ${table}`),/permission denied/);
        }
        if(role==='service_role')assert.equal((await rpc('nmls_private_final_context',{p_student_id:f.actor,p_review_attempt_id:f.attemptId,p_event_id:submitCommand.eventId})).final.revision,2);
        else await assert.rejects(()=>rpc('nmls_private_final_context',{p_student_id:f.actor,p_review_attempt_id:f.attemptId,p_event_id:randomUUID()}),/permission denied/);
      }finally{await db.exec('reset role');}
    }
    const rows=(await db.query("select rowsecurity from pg_tables where tablename in ('nmls_private_finals','nmls_private_final_events')")).rows;
    assert.equal(rows.length,2);assert.ok(rows.every(r=>r.rowsecurity));
  });
});
