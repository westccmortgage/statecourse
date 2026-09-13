import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import { transactNmlsFinalRemediation, validateNmlsRemediationInput } from '../netlify/functions/_lib/nmls-final-remediation.mjs';
import { transactNmlsFinalHistory } from '../netlify/functions/_lib/nmls-final-history.mjs';
import { digestNmlsCommand } from '../netlify/functions/_lib/nmls-review-service.mjs';
import { defineNmlsDraftFinal, drawNmlsDraftFinal, gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';
import { startNmlsCourseReview, reduceNmlsReview } from '../lib/nmls-review-runtime.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';

// Deliberately SYNTHETIC two-unit/one-second engineering fixture. Never replaces
// a pinned manuscript or a real learner's attendance/timing evidence.
const course = structuredClone(getNmlsReviewCourse('nmls-2026-national-comprehensive-private-review-v3'));
course.id='synthetic-remediation-review';
course.modules=course.modules.filter(module=>['F01','E01'].includes(module.id));
course.modules.forEach(module=>{module.units=[module.units[0]];module.units[0].requiredSeconds=1;});
const {digest:unused,...payload}=course;course.digest=digestNmlsCommand(payload);
const quotas={F01:13,E01:12};
const items=Object.entries(quotas).flatMap(([moduleId,count])=>Array.from({length:count*2},(_,i)=>{
  const key=['A','B','C','D'][i%4];
  return{id:`N26-FIN-${moduleId[0]}${String(i+1).padStart(2,'0')}`,category:moduleId[0]==='F'?'federal':'ethics',moduleId,
    objective:'Synthetic persistence fixture.',stem:`Synthetic child ${moduleId} problem ${i+1}?`,
    options:['A','B','C','D'].map(id=>({id,text:`Synthetic answer ${id}.`})),correctChoice:key,
    rationale:'Synthetic private rationale.',independenceNote:'Engineering fixture only.',
    distractorRationales:Object.fromEntries(['A','B','C','D'].filter(id=>id!==key).map(id=>[id,'Synthetic wrong answer.'])),
    sourceRefs:[{url:'https://www.consumerfinance.gov/rules-policy/regulations/',locator:'Synthetic test',supports:'No legal assertion.',checkedOn:'2026-09-11'}],
    remediation:{unitIds:[`${moduleId}-U01`],focus:'Synthetic targeted practice.'}};
}));
const definition=defineNmlsDraftFinal(course,{id:'synthetic-remediation-final',items,moduleQuotas:quotas});
const answersFor=(def,selection,correct=false)=>Object.fromEntries(selection.questionIds.map(id=>{
  const key=def.items.find(item=>item.id===id).correctChoice;return[id,correct?key:['A','B','C','D'].find(choice=>choice!==key)];
}));
const command=(f,kind,revision=0,extra={})=>({kind,reviewAttemptId:f.attemptId,firstFinalId:f.firstId,eventId:randomUUID(),
  expectedReviewRevision:0,expectedWorkflowRevision:revision,...extra});

test('private remediation input accepts intent, never actor/time/history/completion or replacement state',()=>{
  const base=command({attemptId:randomUUID(),firstId:randomUUID()},'start_remediation');
  for(const field of ['studentId','runtime','completed','previous','selection','manifest','serverTimeMs','result','remediationDigest'])
    assert.throws(()=>validateNmlsRemediationInput({...base,[field]:{}}),/invalid_request/);
  for(const kind of ['complete_remediation','reset','retake','issue_third','start'])
    assert.throws(()=>validateNmlsRemediationInput({...base,kind}),/invalid_request/);
  for(const field of ['expectedRevision','attemptId','eventId','studentId','provisionalMs'])
    assert.throws(()=>validateNmlsRemediationInput({...base,kind:'remediation_event',action:{kind:'resume',[field]:randomUUID()}}),/invalid_action|unsupported_review_field/);
});

test('durable child remediation + second final (disposable PGlite, synthetic learning only)',{
  skip:process.env.NMLS_TEST_PGLITE_MODULE?false:'Set NMLS_TEST_PGLITE_MODULE; skipped SQL is not verified.',
},async t=>{
  const {PGlite}=await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
  const db=new PGlite();t.after(()=>db.close());
  await db.exec('create role anon;create role authenticated;create role service_role;create table public.students(id uuid primary key);');
  for(const name of ['023_nmls_review_runtime.sql','024_nmls_review_discovery.sql','025_nmls_review_session_policy.sql',
    '026_nmls_private_final_history.sql','027_nmls_policy_exposure_guards.sql','028_nmls_private_final_remediation.sql','029_nmls_initial_exposure.sql','030_nmls_phase_write_fences.sql',
    '031_nmls_teaching_exposure_guards.sql','032_nmls_joint_teaching.sql','033_nmls_final_reservation.sql',
    '034_nmls_final_delivery_guards.sql','035_nmls_first_final_delivery.sql','036_nmls_first_final_submission.sql','037_nmls_first_final_handoff.sql','038_nmls_second_final_reservation.sql', '039_nmls_second_final_delivery.sql', '040_nmls_second_final_submission.sql'])
    await db.exec(readFileSync(new URL(`../database/${name}`,import.meta.url),'utf8'));
  const rpc=async(name,args)=>{
    assert.match(name,/^nmls_[a-z_]+$/);const keys=Object.keys(args);assert.ok(keys.every(key=>/^p_[a-z_]+$/.test(key)));
    return(await db.query(`select public.${name}(${keys.map((key,i)=>`${key}=>$${i+1}`).join(',')}) as result`,Object.values(args))).rows[0].result;
  };
  const deps=f=>({rpc,courseFor:()=>f.course,definitionFor:()=>f.definition});
  const run=(f,input,more={})=>transactNmlsFinalRemediation(input,f.actor,{...deps(f),...more});
  const workflow=async f=>(await db.query('select * from nmls_private_remediations where first_final_id=$1',[f.firstId])).rows[0];
  const original=async f=>({review:(await db.query('select * from nmls_review_attempts where id=$1',[f.attemptId])).rows,
    final:(await db.query('select * from nmls_private_finals where id=$1',[f.firstId])).rows,
    events:(await db.query('select * from nmls_private_final_events where final_id=$1 order by resulting_revision',[f.firstId])).rows,
    policy:(await db.query('select * from nmls_review_actor_policy where student_id=$1',[f.actor])).rows,
    lease:(await db.query('select * from nmls_review_study_leases where student_id=$1',[f.actor])).rows});
  const snap=async f=>({row:await workflow(f),events:(await db.query('select * from nmls_private_remediation_events where first_final_id=$1 order by resulting_revision',[f.firstId])).rows});
  async function fixture({real=false,pass=false,actor=randomUUID(),miss=null}={}){
    const c=real?getNmlsReviewCourse('nmls-2026-national-comprehensive-private-review-v3'):course;
    const def=real?getNmlsDraftFinalDefinition(c.id):definition;
    await db.query('insert into students(id) values($1) on conflict do nothing',[actor]);
    const grantId=randomUUID();
    await db.query(`insert into nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
      values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC: no real attendance')`,[grantId,actor,c.id,c.digest]);
    // Original prerequisite is a synthetic setup. Only CHILD traversal below
    // uses actual persisted reducer events; no 400-minute original run claimed.
    const state={...startNmlsCourseReview(c),status:'review_complete',completedUnitIds:c.modules.flatMap(m=>m.units.map(u=>u.id)),passedModuleIds:c.modules.map(m=>m.id)};
    const created=await rpc('nmls_review_start',{p_student_id:actor,p_grant_id:grantId,p_course_key:c.id,p_content_digest:c.digest,p_initial_runtime:state});
    const f={actor,grantId,attemptId:created.attempt.id,course:c,definition:def};
    const firstCommand={kind:'issue',reviewAttemptId:f.attemptId,eventId:randomUUID(),expectedReviewRevision:0,expectedFinalRevision:0};
    const issued=await transactNmlsFinalHistory(firstCommand,actor,{...deps(f),draw:(d,a)=>drawNmlsDraftFinal(d,a,{draw:()=>0})});
    f.firstId=issued.outcome.finalAttemptId;f.firstCommand=firstCommand;
    const first=(await original(f)).final[0];let answers=answersFor(def,first.selection,pass);
    if(miss){answers=answersFor(def,first.selection,true);const wrong=answersFor(def,first.selection,false);miss(def,first.selection).forEach(id=>answers[id]=wrong[id]);}
    await transactNmlsFinalHistory({kind:'submit',reviewAttemptId:f.attemptId,eventId:randomUUID(),expectedReviewRevision:0,
      expectedFinalRevision:1,finalAttemptId:f.firstId,answers},actor,deps(f));
    return f;
  }
  const action=async(f,kind,extra={})=>{const w=await workflow(f);return run(f,command(f,'remediation_event',w.revision,
    {action:{kind,sessionId:w.runtime.sessionId,...extra}}));};
  async function traverse(f){
    await action(f,'resume');const first=(await original(f)).final[0];
    const rem=makeNmlsFinalRemediationCourse(f.definition,f.course,first.selection,first.answers);
    for(const m of rem.modules){
      for(const u of m.units){
        await action(f,'open_unit',{unitId:u.id});
        assert.equal((await action(f,'complete_unit')).outcome.reviewResult.ok,false);
        await action(f,'interaction',{visible:true,observation:'keyboard'});
        // Wait for one-second SYNTHETIC allocation. Does not shorten source.
        await wait(1010);await action(f,'heartbeat',{visible:true});
        await action(f,'unit_action',{choice:u.actionQuestion.correctChoice});
        assert.equal((await action(f,'complete_unit')).outcome.reviewResult.code,'unit_review_complete');
      }
      await action(f,'quiz_start',{moduleId:m.id});const w=await workflow(f);
      const answers=Object.fromEntries(w.runtime.quiz.questionIds.map(id=>[id,m.quiz.bank.find(q=>q.id===id).correctChoice]));
      assert.equal((await action(f,'quiz_submit',{quizId:w.runtime.quiz.id,answers})).outcome.reviewResult.code,'module_review_passed');
    }
    assert.equal((await workflow(f)).runtime.status,'review_complete');
  }
  let primary,primaryStart,secondCommand,secondResult,secondSubmit;
  await t.test('empty child, exact replay and incomplete retake; originals unchanged',async()=>{
    primary=await fixture();const f=primary,before=await original(f);primaryStart=command(f,'start_remediation');
    const started=await run(f,primaryStart),w=await workflow(f);
    assert.deepEqual(w.runtime.completedUnitIds,[]);assert.deepEqual(w.runtime.passedModuleIds,[]);assert.equal(w.runtime.completedReviewMs,0);
    assert.notEqual(w.runtime.contentDigest,f.course.digest);assert.equal(w.runtime.courseKey,w.manifest.courseKey);
    const saved=await snap(f);assert.deepEqual((await run(f,primaryStart)).outcome,started.outcome);assert.deepEqual(await snap(f),saved);
    const mixed=async(name,args)=>{const c=await rpc(name,args);return name==='nmls_private_remediation_context'?{...c,workflow:null}:c;};
    assert.deepEqual((await run(f,primaryStart,{rpc:mixed})).outcome,started.outcome);
    await assert.rejects(()=>run(f,{...primaryStart,eventId:randomUUID(),expectedWorkflowRevision:1}),/already_started/);
    await assert.rejects(()=>run(f,command(f,'issue_second',1)),/incomplete/);
    await assert.rejects(()=>run(f,{...primaryStart,expectedReviewRevision:1}),/idempotency_conflict/);
    await assert.rejects(()=>run(f,{...primaryStart,eventId:f.firstCommand.eventId}),/idempotency_conflict/);
    assert.deepEqual(await original(f),before);
  });
  await t.test('persisted reducer traversal, fully new second set, sealed pass and no third attempt',async()=>{
    const f=primary,before=await original(f);await traverse(f);let w=await workflow(f);let draws=0;
    secondCommand=command(f,'issue_second',w.revision);
    const d={draw:(...args)=>{draws++;return drawNmlsDraftFinal(...args);}};
    secondResult=await run(f,secondCommand,d);w=await workflow(f);const first=(await original(f)).final[0];
    assert.equal(w.second_selection.number,2);assert.equal(w.second_selection.questionIds.length,25);
    assert.equal(w.second_selection.questionIds.filter(id=>first.selection.questionIds.includes(id)).length,0);
    assert.deepEqual((await run(f,secondCommand,d)).outcome,secondResult.outcome);assert.equal(draws,1);
    await assert.rejects(()=>run(f,command(f,'issue_second',w.revision)),/already_issued/);
    secondSubmit=command(f,'submit_second',w.revision,{secondFinalId:w.second_id,answers:answersFor(f.definition,w.second_selection,true)});
    let grades=0;const grading={grade:(...args)=>{grades++;return gradeNmlsDraftFinal(...args);}};
    const result=await run(f,secondSubmit,grading);assert.equal(result.outcome.phase,'passed');assert.equal(result.outcome.result.correct,25);
    const sealed=await snap(f);assert.deepEqual((await run(f,secondSubmit,grading)).outcome,result.outcome);assert.equal(grades,1);
    assert.deepEqual((await run(f,primaryStart)).outcome.phase,'remediating');assert.deepEqual(await snap(f),sealed,'old metadata replay must not roll back');
    await assert.rejects(()=>run(f,{...secondSubmit,answers:answersFor(f.definition,w.second_selection,false)},grading),/idempotency_conflict/);
    w=await workflow(f);await assert.rejects(()=>run(f,command(f,'submit_second',w.revision,{secondFinalId:w.second_id,answers:secondSubmit.answers})),/second_unavailable/);
    await assert.rejects(()=>run(f,command(f,'issue_second',w.revision)),/already_issued/);
    await assert.rejects(()=>action(f,'resume'),/phase_closed/);
    await assert.rejects(()=>db.query('update nmls_private_remediations set revision=revision+1 where first_final_id=$1',[f.firstId]),/immutable/);
    assert.deepEqual(await original(f),before);
    assert.doesNotMatch(JSON.stringify(sealed.events.map(e=>e.outcome)),/N26-FIN-|correctChoice|rationale|questionIds|optionOrder|"lessons"|"feedback"|"answers"/);
    assert.ok(sealed.events.every(e=>e.outcome.studentDeliveryEnabled===false && e.outcome.creditIssuanceAllowed===false));
  });
  await t.test('wrong answer and idle refusals persist; stale lease fails, interrupted quiz cannot redraw',async()=>{
    const f=await fixture();await run(f,command(f,'start_remediation'));await action(f,'resume');
    const u=f.course.modules[0].units[0];await action(f,'open_unit',{unitId:u.id});
    const wrong=u.actionQuestion.options.find(o=>o.id!==u.actionQuestion.correctChoice).id;
    const refused=await action(f,'unit_action',{choice:wrong});assert.equal(refused.outcome.reviewResult.code,'review_answer_incorrect');
    assert.deepEqual((await workflow(f)).runtime.current.completedActionIds,[]);
    const oldSession=(await workflow(f)).runtime.sessionId;
    // Synthetic idle setup is NOT completion: force the stored activity clock
    // into the past, then exercise a real reducer + transaction cleanup.
    await db.query(`update nmls_private_remediations set revision=revision+1,runtime=jsonb_set(runtime,'{lastActivityMs}',to_jsonb(1::bigint)) where first_final_id=$1`,[f.firstId]);
    const idle=await action(f,'heartbeat',{visible:true});assert.equal(idle.outcome.reviewResult.status,401);
    assert.equal((await workflow(f)).runtime.current,null);assert.equal((await workflow(f)).runtime.completedReviewMs,0);
    await action(f,'resume');const w=await workflow(f);
    await assert.rejects(()=>run(f,command(f,'remediation_event',w.revision,{action:{kind:'open_unit',unitId:u.id,sessionId:oldSession}})),/session_conflict/);
    await action(f,'open_unit',{unitId:u.id});await action(f,'interaction',{visible:true,observation:'keyboard'});await wait(1010);
    await action(f,'heartbeat',{visible:true});await action(f,'unit_action',{choice:u.actionQuestion.correctChoice});await action(f,'complete_unit');
    await action(f,'quiz_start',{moduleId:f.course.modules[0].id});const reserved=(await workflow(f)).runtime.quiz;
    await action(f,'logout');await action(f,'resume');await action(f,'quiz_start',{moduleId:f.course.modules[0].id});
    assert.deepEqual((await workflow(f)).runtime.quiz,reserved);
    assert.equal((await action(f,'quiz_submit',{quizId:reserved.id,answers:{}})).outcome.reviewResult.status,400);
    assert.deepEqual((await workflow(f)).runtime.quiz,reserved);
  });
  await t.test('failure after child UPDATE rolls back runtime, second result and event; exact retry works',async()=>{
    const f=await fixture();await run(f,command(f,'start_remediation'));await traverse(f);let w=await workflow(f);
    await run(f,command(f,'issue_second',w.revision));w=await workflow(f);
    const input=command(f,'submit_second',w.revision,{secondFinalId:w.second_id,answers:answersFor(f.definition,w.second_selection,false)}),before=await snap(f);
    await db.exec(`create function reject_child_event() returns trigger language plpgsql as $$ begin raise exception 'synthetic_after_child_write'; end $$;
      create trigger reject_child_event before insert on nmls_private_remediation_events for each row execute function reject_child_event();`);
    try{await assert.rejects(()=>run(f,input),/synthetic_after_child_write/);assert.deepEqual(await snap(f),before);}
    finally{await db.exec('drop trigger reject_child_event on nmls_private_remediation_events;drop function reject_child_event();');}
    const result=await run(f,input);assert.equal(result.outcome.phase,'staff_review_required');
    assert.equal(result.outcome.result.disposition,'staff_review_required');
    assert.deepEqual((await run(f,input)).outcome,result.outcome);
    w=await workflow(f);await assert.rejects(()=>run(f,command(f,'issue_second',w.revision)),/already_issued/);
  });
  await t.test('foreign actor, passed first, content substitution, altered manifest and policy scope refuse',async()=>{
    const f=await fixture(),foreign=await fixture(),passed=await fixture({pass:true}),input=command(f,'start_remediation');
    await assert.rejects(()=>run(foreign,input),/access_denied/);
    await assert.rejects(()=>run(passed,command(passed,'start_remediation')),/already_passed/);
    const changed=structuredClone(f.course);changed.modules[0].units[0].requiredSeconds=2;
    await assert.rejects(()=>run(f,input,{courseFor:()=>changed}),/content_changed/);
    const corrupt=async(name,args)=>{const c=await rpc(name,args);if(name==='nmls_private_remediation_context')c.final.remediation_manifest.unitIds.pop();return c;};
    await assert.rejects(()=>run(f,input,{rpc:corrupt}),/manifest_changed/);
    await db.query(`insert into nmls_review_policy_bindings(grant_id,policy_id,policy_digest,offering) values($1,'synthetic',$2,$3)`,
      [f.grantId,'b'.repeat(64),{id:f.grantId,contentDigest:f.course.digest}]);
    await assert.rejects(()=>run(f,input),/policy_flow_required|policy_integration_required/);assert.equal(await workflow(f),undefined);
  });
  await t.test('actual national F21 requires F02 plus F03, not just the directly missed module',async()=>{
    const f=await fixture({real:true,miss:(def,s)=>{
      assert.ok(s.questionIds.includes('N26-FIN-F21'));
      return['N26-FIN-F21',...s.questionIds.filter(id=>id!=='N26-FIN-F21'&&def.items.find(x=>x.id===id).moduleId!=='F02').slice(0,7)];
    }});
    const before=await original(f);await run(f,command(f,'start_remediation'));const w=await workflow(f);
    assert.ok(w.manifest.moduleIds.includes('F02'));assert.ok(w.manifest.moduleIds.includes('F03'));
    assert.equal(w.manifest.unitIds.filter(id=>id.startsWith('F02-')).length,f.course.modules.find(m=>m.id==='F02').units.length);
    await assert.rejects(()=>run(f,command(f,'issue_second',w.revision)),/incomplete/);
    assert.deepEqual(await original(f),before);
  });
  await t.test('same-snapshot competing starts commit once, rollback event failure, replay does not reduce',async()=>{
    const f=await fixture();let arrivals=0,release;const ready=new Promise(resolve=>release=resolve);
    const raceRpc=async(name,args)=>{const c=await rpc(name,args);if(name==='nmls_private_remediation_context'){if(++arrivals===2)release();await ready;}return c;};
    const raced=await Promise.allSettled([run(f,command(f,'start_remediation'),{rpc:raceRpc}),run(f,command(f,'start_remediation'),{rpc:raceRpc})]);
    assert.equal(raced.filter(r=>r.status==='fulfilled').length,1);assert.match(raced.find(r=>r.status==='rejected').reason.message,/revision_conflict/);
    const w=await workflow(f),cmd=command(f,'remediation_event',w.revision,{action:{kind:'resume'}});let reduces=0;
    const count={reduce:(...args)=>{reduces++;return reduceNmlsReview(...args);}};
    const first=await run(f,cmd,count);assert.deepEqual((await run(f,cmd,count)).outcome,first.outcome);assert.equal(reduces,1);
    const before=await snap(f);await assert.rejects(()=>run(f,{...cmd,action:{kind:'resume',sessionId:randomUUID()}},count),/idempotency_conflict/);
    assert.deepEqual(await snap(f),before);assert.equal(reduces,1);
  });
  await t.test('SQL independently rejects forged initialization, null CAS and source/metadata changes',async()=>{
    const f=await fixture();let args;
    const capture=async(name,value)=>{if(name==='nmls_private_remediation_commit'){args=structuredClone(value);throw Error('captured');}return rpc(name,value);};
    await assert.rejects(()=>run(f,command(f,'start_remediation'),{rpc:capture}),/captured/);
    const forged=changes=>rpc('nmls_private_remediation_commit',{...args,...changes});
    await assert.rejects(()=>forged({p_expected_workflow_revision:null}),/revision_conflict/);
    await assert.rejects(()=>forged({p_runtime:{...args.p_runtime,completedUnitIds:args.p_manifest.unitIds}}),/nonempty_start/);
    await assert.rejects(()=>forged({p_manifest:{...args.p_manifest,completed:true}}),/manifest_changed/);
    await assert.rejects(()=>forged({p_definition_digest:'f'.repeat(64)}),/content_changed/);
    await assert.rejects(()=>forged({p_runtime:{...args.p_runtime,creditIssuanceAllowed:true}}),/invalid_runtime/);
    assert.equal(await workflow(f),undefined);
  });
  await t.test('SQL rejects NULL statuses, completion-by-resume and nested metadata instead of echoing them',async()=>{
    const f=await fixture();await run(f,command(f,'start_remediation'));let args;
    const capture=async(name,value)=>{if(name==='nmls_private_remediation_commit'){args=structuredClone(value);throw Error('captured');}return rpc(name,value);};
    await assert.rejects(()=>run(f,command(f,'remediation_event',1,{action:{kind:'resume'}}),{rpc:capture}),/captured/);
    const before=await snap(f);
    for(const mutate of [
      a=>{delete a.p_runtime.status;},a=>{a.p_runtime.status=null;},
      a=>{delete a.p_review_outcome.status;},a=>{a.p_review_outcome.status=null;},
      a=>{a.p_runtime.sessionId={correctChoice:'SYNTHETIC_PRIVATE_MARKER'};},
      a=>{a.p_runtime.current={unitId:{correctChoice:'SYNTHETIC_PRIVATE_MARKER'}};},
      a=>{a.p_runtime.quiz={id:{correctChoice:'SYNTHETIC_PRIVATE_MARKER'},moduleId:'F01'};},
      a=>{a.p_runtime.status='review_complete';a.p_runtime.completedUnitIds=a.p_manifest.unitIds;a.p_runtime.passedModuleIds=a.p_manifest.moduleIds;},
    ]){
      const forged=structuredClone(args);mutate(forged);
      await assert.rejects(()=>rpc('nmls_private_remediation_commit',forged),/nmls_remediation_invalid_/);
      assert.deepEqual(await snap(f),before);
    }
    await assert.rejects(()=>run(f,command(f,'issue_second',1)),/incomplete/);
  });
  await t.test('expiry during event insertion rolls back child runtime and event; first-final cannot reuse child event',async()=>{
    const f=await fixture(),start=command(f,'start_remediation');await run(f,start);
    const before=await snap(f),input=command(f,'remediation_event',1,{action:{kind:'resume'}});
    await db.exec(`create function delay_child_event() returns trigger language plpgsql as $$ begin perform pg_sleep(0.3);return new;end $$;
      create trigger delay_child_event before insert on nmls_private_remediation_events for each row execute function delay_child_event();`);
    const expire=async(name,args)=>{if(name==='nmls_private_remediation_commit')await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '0.2 second' where id=$1",[f.grantId]);return rpc(name,args);};
    try{await assert.rejects(()=>run(f,input,{rpc:expire}),/access_denied/);assert.deepEqual(await snap(f),before);}
    finally{await db.exec('drop trigger delay_child_event on nmls_private_remediation_events;drop function delay_child_event();');}
    await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '1 day' where id=$1",[f.grantId]);
    await assert.rejects(()=>rpc('nmls_private_final_commit',{
      p_student_id:f.actor,p_review_attempt_id:f.attemptId,p_event_id:start.eventId,p_command_digest:digestNmlsCommand(start),p_kind:'issue',
      p_expected_review_revision:0,p_expected_final_revision:2,p_evaluated_at_ms:0,p_content_digest:f.course.digest,p_definition_digest:f.definition.digest,
      p_final_id:f.firstId,p_selection:null,p_answers:null,p_result:null,p_remediation_manifest:null,
    }),/idempotency_conflict/);
    assert.equal((await db.query("select has_function_privilege('service_role','public.nmls_private_final_commit_pre_remediation_internal(uuid,uuid,uuid,text,text,bigint,bigint,bigint,text,text,uuid,jsonb,jsonb,jsonb,jsonb)','EXECUTE') as allowed")).rows[0].allowed,false);
    assert.equal((await run(f,input)).outcome.progress.status,'active');
  });
  await t.test('idle crossing after evaluation or during writes re-evaluates and saves only the logout',async()=>{
    for(const boundary of ['after_context','during_event_insert']){
      const f=await fixture();await run(f,command(f,'start_remediation'));await action(f,'resume');
      await db.query(`update nmls_private_remediations set revision=revision+1,
        runtime=jsonb_set(runtime,'{lastActivityMs}',to_jsonb(floor(extract(epoch from clock_timestamp())*1000)::bigint-359900))
        where first_final_id=$1`,[f.firstId]);
      const w=await workflow(f),before=await snap(f);let contexts=0;
      const delayed=async(name,args)=>{const c=await rpc(name,args);if(name==='nmls_private_remediation_context' && ++contexts===1 && boundary==='after_context')await wait(150);return c;};
      if(boundary==='during_event_insert')await db.exec(`create function delay_idle_child_event() returns trigger language plpgsql as $$ begin perform pg_sleep(0.15);return new;end $$;
        create trigger delay_idle_child_event before insert on nmls_private_remediation_events for each row execute function delay_idle_child_event();`);
      let result;
      try{result=await run(f,command(f,'remediation_event',w.revision,{action:{kind:'heartbeat',visible:true,sessionId:w.runtime.sessionId}}),{rpc:delayed});}
      finally{if(boundary==='during_event_insert')await db.exec('drop trigger delay_idle_child_event on nmls_private_remediation_events;drop function delay_idle_child_event();');}
      assert.equal(contexts,2,boundary);assert.equal(result.outcome.reviewResult.status,401);
      const after=await snap(f);assert.equal(after.events.length,before.events.length+1);assert.equal(after.row.revision,w.revision+1);
      assert.equal(after.row.runtime.status,'logged_out');assert.equal(after.row.runtime.current,null);
      assert.deepEqual(after.row.runtime.completedUnitIds,w.runtime.completedUnitIds);
    }
  });
  await t.test('replay checks current authority; browser roles cannot read/write or call private RPCs',async()=>{
    const f=primary;
    await db.query("update nmls_review_access_grants set status='revoked' where id=$1",[f.grantId]);
    await assert.rejects(()=>run(f,secondSubmit),/access_denied/);
    await db.query("update nmls_review_access_grants set status='active',expires_at=clock_timestamp()-interval '1 second' where id=$1",[f.grantId]);
    await assert.rejects(()=>run(f,secondSubmit),/access_denied/);
    await db.query("update nmls_review_access_grants set expires_at=clock_timestamp()+interval '1 day' where id=$1",[f.grantId]);
    const ctx={p_student_id:f.actor,p_review_attempt_id:f.attemptId,p_first_final_id:f.firstId,p_event_id:secondSubmit.eventId};
    for(const role of ['anon','authenticated','service_role']){
      await db.exec(`set role ${role}`);
      try{
        for(const table of ['nmls_private_remediations','nmls_private_remediation_events']){
          await assert.rejects(()=>db.query(`select * from ${table}`),/permission denied/);
          await assert.rejects(()=>db.query(`delete from ${table}`),/permission denied/);
        }
        if(role==='service_role')assert.equal((await rpc('nmls_private_remediation_context',ctx)).workflow.status,'passed');
        else await assert.rejects(()=>rpc('nmls_private_remediation_context',ctx),/permission denied/);
      }finally{await db.exec('reset role');}
    }
    await assert.rejects(()=>db.query('delete from nmls_private_remediation_events where first_final_id=$1',[f.firstId]),/immutable/);
  });
});
