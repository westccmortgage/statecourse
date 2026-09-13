import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { nmlsTrainingDefinition } from '../config/nmls-training-definition.mjs';
import { executeNmlsTraining, NMLS_TRAINING_SOURCE_KEY } from '../netlify/functions/_lib/nmls-training-service.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';
import { makeNmlsFinalRemediationCourse } from '../lib/nmls-final-assessment.mjs';

const directory=new URL('../database/',import.meta.url);
const migration=readFileSync(new URL('025_nmls_free_training.sql',directory),'utf8');
const reviewProvision=readFileSync(new URL('manual/nmls-review-accounts.sql',directory),'utf8');
const course=getNmlsReviewCourse(NMLS_TRAINING_SOURCE_KEY);
const definition=getNmlsDraftFinalDefinition(NMLS_TRAINING_SOURCE_KEY);
const owner=randomUUID();
const skip=process.env.NMLS_TEST_PGLITE_MODULE?false:'PGlite required; skipping is not persistence verification.';

async function createDatabase(t,{omitMichigan=false}={}) {
 const {PGlite}=await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);
 const db=new PGlite();t.after(()=>db.close());
 // Only hosted-auth infrastructure is a fixture. Real main001-024 migrations
 // create every application table/function below. PGlite supplies UUID natively;
 // pgcrypto is not installed, and no NMLS025 path calls its digest function.
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$select null::uuid$$;
 grant usage on schema public to anon,authenticated,service_role;
 alter default privileges in schema public grant all on tables to service_role;
 alter default privileges in schema public grant all on functions to service_role;`);
 const files=readdirSync(directory).filter(f=>/^0(?:0[1-9]|1\d|2[0-4])_.*\.sql$/.test(f)&&f!=='020_rollback.sql'&&(!omitMichigan||!/^01[567]_/.test(f))).sort();
 for(const file of files) {
  const sql=readFileSync(new URL(file,directory),'utf8').replace('create extension if not exists pgcrypto;','-- PGlite: UUID is built in; pgcrypto extension omitted.');
  try {await db.exec(sql);} catch(error){throw Error(`${file}: ${error.message}`,{cause:error});}
 }
 await db.query('insert into auth.users(id,email) values($1,$2)',[owner,'akanevsky1967@gmail.com']);
 await db.query(`insert into staff_actor_binding_events(auth_user_id,actor_role,binding_status,effective_at,evidence,recorded_by,recorded_at)
 values($1,'owner','active',now()-interval '1 hour','{"fixture":"test authorization"}',$1,now()-interval '2 minute')`,[owner]);
 return db;
}
async function rpc(db,name,args) {
 assert.match(name,/^nmls_training_(enroll|context|definition|commit)$/);
 const keys=Object.keys(args);
 const result=await db.query(`select ${name}(${keys.map((key,i)=>`${key}=>$${i+1}`).join(',')}) as value`,Object.values(args));
 return result.rows[0].value;
}
async function learner(db) {
 const actor=randomUUID();await db.query('insert into students(id,email) values($1,$2)',[actor,`${actor}@example.invalid`]);
 const enrolled=await rpc(db,'nmls_training_enroll',{p_student_id:actor});
 const enrollment=enrolled.enrollment.id;
 const state=()=>rpc(db,'nmls_training_context',{p_student_id:actor,p_enrollment_id:enrollment,p_event_id:null});
 const invoke=(input,who=actor,transport=(n,p)=>rpc(db,n,p))=>executeNmlsTraining(input,who,{rpc:transport});
 const input=async(operation,extra={})=>({operation,command:{enrollmentId:enrollment,...(operation==='snapshot'?{}:{eventId:randomUUID(),expectedRevision:(await state()).revision}),...extra}});
 const run=async(operation,extra)=>invoke(await input(operation,extra));
 const teaching=async(kind,extra={})=>{const s=(await state()).runtime;return run('teaching',{action:{kind,sessionId:(s?.phase==='remediation'?s.remediation.runtime:s?.source)?.sessionId||null,...extra}});};
 return {actor,enrollment,state,input,run,invoke,teaching};
}
async function proposal(h,mutate=()=>{}) {
 const c=await h.state();let params;
 await h.invoke(await h.input('teaching',{action:{kind:'resume',sessionId:null}}),h.actor,async(name,p)=>{
  if(name==='nmls_training_context')return c;
  params=structuredClone(p);throw Error('capture_only');
 }).catch(error=>assert.equal(error.message,'capture_only'));
 mutate(params);return params;
}

// The real service and real SQL persist every operation. Only the teaching
// receipt clock is simulated (three days in the past), avoiding an eight-hour
// wall-clock test. SQL's request timestamp remains the actual database clock.
// This exercises storage/transitions, NOT real learner attendance or duration.
async function simulatedLearner(db) {
 const h=await learner(db);let now=Date.now()-3*86400000;
 const transport=async(name,p)=>{
  if(name==='nmls_training_context')return {...await rpc(db,name,p),serverTimeMs:now};
  const stamp=Number((await db.query('select floor(extract(epoch from clock_timestamp())*1000)::bigint n')).rows[0].n);
  return {...await rpc(db,name,{...p,p_evaluated_at_ms:stamp,p_audit:p.p_audit&&{...p.p_audit,atMs:stamp}}),serverTimeMs:now};
 };
 const run=async(operation,extra)=>h.invoke(await h.input(operation,extra),h.actor,transport);
 const teaching=async(kind,extra={})=>{const s=(await h.state()).runtime;return run('teaching',{action:{kind,sessionId:(s?.phase==='remediation'?s.remediation.runtime:s?.source)?.sessionId||null,...extra}});};
 return {...h,run,teaching,tick(ms=1){now+=ms;}};
}
async function complete(h,content){
 await h.teaching('resume');
 for(const module of content.modules){
  for(const unit of module.units){
   h.tick();assert.equal((await h.teaching('open_unit',{unitId:unit.id})).body.code,'unit_open');
   await h.teaching('interaction',{visible:true,observation:'keyboard'});
   let remaining=unit.requiredSeconds*1000;
   while(remaining){const span=Math.min(remaining,30000);h.tick(span);await h.teaching('interaction',{visible:true,observation:'scroll'});remaining-=span;}
   h.tick();await h.teaching('unit_action',{choice:unit.actionQuestion.correctChoice});
   h.tick();assert.equal((await h.teaching('complete_unit')).body.code,'unit_review_complete');
  }
  h.tick();const quiz=(await h.teaching('quiz_start',{moduleId:module.id})).body.progress.quiz;
  const answers=Object.fromEntries(quiz.questions.map(q=>[q.id,module.quiz.bank.find(item=>item.id===q.id).correctChoice]));
  h.tick();assert.equal((await h.teaching('quiz_submit',{quizId:quiz.id,answers})).body.code,'module_review_passed');
 }
}
function answersFor(form,correct){return Object.fromEntries(form.questions.map(q=>{const item=definition.items.find(i=>i.id===q.id);
 return [q.id,correct?item.correctChoice:item.options.find(o=>o.id!==item.correctChoice).id];}));}

async function transitionProposal(h,operation,extra={}){
 let params;
 const input=await h.input(operation,extra);
 await h.invoke(input,h.actor,async(name,p)=>{
  if(name==='nmls_training_context')return h.state();
  params=structuredClone(p);throw Error('capture_only');
 }).catch(error=>assert.equal(error.message,'capture_only'));
 return params;
}

test('real main001-024 plus generated025: free-training SQL authorization and transactional persistence', {skip}, async t=>{
 const db=await createDatabase(t);
 await t.test('revoked latest owner cannot be replaced by a historical active binding',async()=>{
  await db.query(`insert into staff_actor_binding_events(auth_user_id,actor_role,binding_status,evidence,recorded_by,recorded_at)
   values($1,'owner','revoked','{"fixture":"revoked"}',$1,now()-interval '1 minute')`,[owner]);
  await assert.rejects(db.exec(migration),/Active verified owner binding/);await db.exec('rollback');
  assert.equal((await db.query("select count(*)::int as n from courses where id='nmls-ce-2026-comprehensive-8'")).rows[0].n,0);
  await db.query(`insert into staff_actor_binding_events(auth_user_id,actor_role,binding_status,effective_at,evidence,recorded_by,recorded_at)
   values($1,'owner','active',null,'{"fixture":"renewed free-training authority"}',$1,now())`,[owner]);
  await db.exec(migration);
 });
 await t.test('immutable real content pins and disabled approval/payment/credit',async()=>{
  assert.deepEqual(await rpc(db,'nmls_training_definition',{p_course_id:course.id}),null);
  assert.deepEqual(await rpc(db,'nmls_training_definition',{p_course_id:'nmls-ce-2026-comprehensive-8'}),nmlsTrainingDefinition());
  const row=(await db.query("select * from current_offering_governance where offering_id='nmls-ce-2026-comprehensive-8'")).rows[0];
  assert.equal(row.training_access_enabled,true);assert.equal(row.approval_status,'none');assert.equal(row.payment_mode,'disabled');
  assert.equal((await db.query("select regulatory_credit_enabled from regulatory_course_versions where course_id=$1",[row.offering_id])).rows[0].regulatory_credit_enabled,false);
  await assert.rejects(db.query('update nmls_training_definitions set manifest=manifest'),/append.only|immutable|mutation/i);
  await assert.rejects(db.exec(migration),/identity already exists/);await db.exec('rollback');
 });
 const h=await learner(db);
 await t.test('browser denied; service DML removed even with Supabase-like default grants',async()=>{
  for(const role of ['anon','authenticated']){
   await db.exec(`set role ${role}`);
   try{await assert.rejects(db.query('select * from nmls_training_attempts'),/permission denied/);
    await assert.rejects(rpc(db,'nmls_training_context',{p_student_id:h.actor,p_enrollment_id:h.enrollment}),/permission denied/);
   }finally{await db.exec('reset role');}
  }
  await db.exec('set role service_role');
  try{
   assert.equal((await db.query('select count(*)::int n from nmls_training_attempts')).rows[0].n,1);
   for(const table of ['nmls_training_definitions','nmls_training_attempts','nmls_training_events']){
    await assert.rejects(db.query(`delete from ${table} where false`),/permission denied/);
    assert.equal((await db.query('select has_table_privilege(current_user,$1,\'INSERT\') allowed',[table])).rows[0].allowed,false);
    assert.equal((await db.query('select has_table_privilege(current_user,$1,\'UPDATE\') allowed',[table])).rows[0].allowed,false);
   }
   await assert.rejects(db.query('select nmls_training_access($1,$2)',[h.actor,h.enrollment]),/permission denied/);
   assert.equal((await rpc(db,'nmls_training_context',{p_student_id:h.actor,p_enrollment_id:h.enrollment})).revision,0);
  }finally{await db.exec('reset role');}
  assert.equal((await db.query("select count(*)::int n from pg_tables where schemaname='public' and tablename like 'nmls_training_%' and rowsecurity")).rows[0].n,3);
 });
 await t.test('enrollment idempotency, no checkout/payment/certificate or cross-course runtime',async()=>{
  const again=await rpc(db,'nmls_training_enroll',{p_student_id:h.actor});assert.equal(again.enrollment.id,h.enrollment);assert.equal(again.existing,true);
  assert.equal(again.enrollment.enrollment_origin,'training');assert.equal(again.enrollment.checkout_attempt_id,null);assert.equal(again.enrollment.compliance_credit_eligible,false);
  for(const table of ['checkout_attempts','payments','course_certificates','course_completion_events','regulatory_reports','lms_compliance_state']){
   assert.equal((await db.query(`select count(*)::int n from ${table}`)).rows[0].n,0,table);
  }
  await assert.rejects(db.query('update enrollments set compliance_credit_eligible=true where id=$1',[h.enrollment]),/scope_mismatch/);
  await assert.rejects(db.query("update enrollments set course_id='va-salesperson',state='VA',course_version='1.0' where id=$1",[h.enrollment]),/scope_mismatch/);
  await assert.rejects(db.query('update enrollments set student_id=$1 where id=$2',[owner,h.enrollment]),/scope_mismatch/);
 });
 await t.test('NULL/other actor rejected and actual resume state survives fresh transport',async()=>{
  for(const actor of [null,randomUUID()])await assert.rejects(rpc(db,'nmls_training_context',{p_student_id:actor,p_enrollment_id:h.enrollment}),/access_denied/);
  const response=await h.teaching('resume');assert.equal(response.body.revision,1);
  const snapshot=await h.run('snapshot');assert.equal(snapshot.body.progress.sessionId,null);assert.equal(snapshot.body.progress.resumeRequired,true);
  assert.equal((await h.state()).runtime.source.sessionId,response.body.progress.sessionId);
  assert.equal((await h.state()).runtime.source.courseKey,course.id);
 });
 await t.test('exact replay returns current state; changed event digest and stale CAS cannot write',async()=>{
  const event=await h.input('teaching',{action:{kind:'logout',sessionId:(await h.state()).runtime.source.sessionId}});
  await h.invoke(event);await h.teaching('resume');const rev=(await h.state()).revision;
  const replay=await h.invoke(event);assert.equal(replay.body.replayed,true);assert.equal(replay.body.revision,rev);
  await assert.rejects(h.invoke({...event,command:{...event.command,action:{kind:'resume',sessionId:null}}}),/event_conflict/);
  const stale=await h.input('teaching',{action:{kind:'logout',sessionId:(await h.state()).runtime.source.sessionId}});stale.command.expectedRevision--;
  await assert.rejects(h.invoke(stale),/revision_conflict/);
  assert.equal((await h.state()).revision,rev);
 });
 await t.test('clock, identity, audit and operation tampering fail without partial persistence',async()=>{
  const rev=(await h.state()).revision;
  for(const mutate of [p=>p.p_runtime.sourceCourseKey='california',p=>p.p_runtime.definitionDigest='0'.repeat(64),
   p=>p.p_audit.eventId=randomUUID(),p=>p.p_audit.atMs--,p=>p.p_audit.fromPhase='passed',p=>p.p_audit.toPhase='passed',
   p=>p.p_audit.operation='approve',p=>p.p_runtime.extra='injected']){
   await assert.rejects(rpc(db,'nmls_training_commit',await proposal(h,mutate)),/history_invalid|phase_closed/);
  }
  await assert.rejects(rpc(db,'nmls_training_commit',await proposal(h,p=>p.p_evaluated_at_ms-=31_000)),/clock_refresh_required/);
  await assert.rejects(rpc(db,'nmls_training_commit',await proposal(h,p=>p.p_evaluated_at_ms+=31_000)),/clock_refresh_required/);
  assert.equal((await h.state()).revision,rev);
  assert.equal((await db.query('select count(*)::int n from nmls_training_events where enrollment_id=$1',[h.enrollment])).rows[0].n,rev);
 });
 await t.test('slow post-write and revoked-after-write checks roll back all rows',async()=>{
  const before=await h.state();
  await db.exec(`create function nmls_test_slow_write() returns trigger language plpgsql as $$begin perform pg_sleep(0.75);return new;end$$;
   create trigger nmls_test_slow_write before insert on nmls_training_events for each row execute function nmls_test_slow_write();`);
  const p=await proposal(h);p.p_evaluated_at_ms-=29500;p.p_audit.atMs=p.p_evaluated_at_ms;
  try{await assert.rejects(rpc(db,'nmls_training_commit',p),/clock_refresh_required/);}finally{await db.exec('drop trigger nmls_test_slow_write on nmls_training_events;drop function nmls_test_slow_write();');}
  assert.deepEqual((await h.state()).runtime,before.runtime);
  await db.exec(`create function nmls_test_revoke_after_write() returns trigger language plpgsql as $$begin
   update enrollments set expires_at=clock_timestamp()-interval '1 second' where id=new.enrollment_id;return new;end$$;
   create trigger nmls_test_revoke_after_write after insert on nmls_training_events for each row execute function nmls_test_revoke_after_write();`);
  try{await assert.rejects(rpc(db,'nmls_training_commit',await proposal(h)),/access_denied/);}finally{await db.exec('drop trigger nmls_test_revoke_after_write on nmls_training_events;drop function nmls_test_revoke_after_write();');}
  assert.equal((await h.state()).revision,before.revision);
  assert.equal((await db.query('select expires_at from enrollments where id=$1',[h.enrollment])).rows[0].expires_at,null);
 });
 await t.test('revoked grants/accounts/expiry fail closed, including replay; never silently restored',async()=>{
  const event=await h.input('teaching',{action:{kind:'logout',sessionId:(await h.state()).runtime.source.sessionId}});await h.invoke(event);
  await db.query("update access_grants set status='revoked' where enrollment_id=$1",[h.enrollment]);
  await assert.rejects(h.invoke(event),/access_denied/);await assert.rejects(rpc(db,'nmls_training_enroll',{p_student_id:h.actor}),/access_denied/);
  await db.query("update access_grants set status='active' where enrollment_id=$1",[h.enrollment]);
  await db.query("update students set account_status='locked' where id=$1",[h.actor]);await assert.rejects(h.state(),/access_denied/);
  await db.query("update students set account_status='active' where id=$1",[h.actor]);
  await db.query("update enrollments set expires_at=now()-interval '1 second' where id=$1",[h.enrollment]);await assert.rejects(h.state(),/access_denied/);
  await db.query('update enrollments set expires_at=null where id=$1',[h.enrollment]);
 });
 await t.test('same-revision competing commands serialize to one winner, without true multi-connection claims',async()=>{
  await h.teaching('resume');
  const [a,b]=await Promise.all([h.input('teaching',{action:{kind:'logout',sessionId:(await h.state()).runtime.source.sessionId}}),h.input('teaching',{action:{kind:'logout',sessionId:(await h.state()).runtime.source.sessionId}})]);
  const result=await Promise.allSettled([h.invoke(a),h.invoke(b)]);
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1);assert.match(result.find(r=>r.status==='rejected').reason.message,/revision_conflict/);
 });
 await t.test('all45 real lessons, fail first, real targeted remediation, disjoint second pass persist end to end',async t=>{
  const learner=await simulatedLearner(db);await assert.rejects(learner.run('issue_assessment'),/review_prerequisites/);
  await complete(learner,course);
  let source=(await learner.state()).runtime.source;
  assert.equal(source.completedUnitIds.length,45);assert.equal(source.passedModuleIds.length,8);assert.equal(source.completedReviewMs,400*60000);
  const first=(await learner.run('issue_assessment')).body.assessment;assert.equal(first.questions.length,25);
  await t.test('saved source and selected first form cannot change while first answer is committed',async()=>{
   for(const mutate of [p=>p.p_runtime.source.completedReviewMs++,p=>p.p_runtime.finals[0].selection.questionIds.reverse()]){
    const p=await transitionProposal(learner,'submit_assessment',{assessmentId:first.id,answers:answersFor(first,false)});mutate(p);
    await assert.rejects(rpc(db,'nmls_training_commit',p),/history_invalid/);
   }
  });
  assert.equal((await learner.run('submit_assessment',{assessmentId:first.id,answers:answersFor(first,false)})).body.phase,'remediation_required');
  await learner.run('start_remediation');await assert.rejects(learner.run('issue_assessment'),/review_prerequisites/);
  const state=(await learner.state()).runtime;
  const child=makeNmlsFinalRemediationCourse(definition,course,state.finals[0].selection,state.finals[0].answers);
  await complete(learner,child);const second=(await learner.run('issue_assessment')).body.assessment;
  assert.ok(second.questions.every(q=>!first.questions.some(old=>old.id===q.id)));
  await t.test('second selection freezes source, child remediation and sealed first submission',async()=>{
   for(const mutate of [p=>p.p_runtime.remediation.runtime.completedReviewMs++,p=>p.p_runtime.finals[0].result.correct++]){
    const p=await transitionProposal(learner,'submit_assessment',{assessmentId:second.id,answers:answersFor(second,true)});mutate(p);
    await assert.rejects(rpc(db,'nmls_training_commit',p),/history_invalid/);
   }
  });
  const result=await learner.run('submit_assessment',{assessmentId:second.id,answers:answersFor(second,true)});
  assert.equal(result.body.phase,'passed');assert.equal(result.body.nmlsCreditEligible,false);assert.equal(result.body.courseCompletionIssued,false);
  const saved=await learner.state();assert.deepEqual(saved.runtime.source,source);assert.equal(saved.runtime.finals.length,2);
  await assert.rejects(learner.run('issue_assessment'),/phase_conflict/);
  const fresh=await learner.run('snapshot');assert.equal(fresh.body.phase,'passed');assert.equal(fresh.body.result.correct,25);
  const lastEvent=(await db.query('select * from nmls_training_events where enrollment_id=$1 order by revision desc limit 1',[learner.enrollment])).rows[0];
  const replay=await rpc(db,'nmls_training_commit',{p_student_id:learner.actor,p_enrollment_id:learner.enrollment,p_event_id:lastEvent.event_id,
   p_command_digest:lastEvent.command_digest,p_expected_revision:0,p_evaluated_at_ms:0,p_runtime:null,p_audit:null});
  assert.equal(replay.replayed,true);assert.equal(replay.runtime.phase,'passed');assert.equal(replay.revision,saved.revision);
  const id=randomUUID(),at=Number((await learner.state()).serverTimeMs);
  await assert.rejects(rpc(db,'nmls_training_commit',{p_student_id:learner.actor,p_enrollment_id:learner.enrollment,p_event_id:id,
   p_command_digest:'0'.repeat(64),p_expected_revision:saved.revision,p_evaluated_at_ms:at,
   p_runtime:{...saved.runtime,revision:saved.revision+1},p_audit:{schema:'nmls-free-training-event-v1',operation:'teaching',eventId:id,atMs:at,
    code:'fake_reopen',status:200,ok:true,fromPhase:'passed',toPhase:'passed',expectedRevision:saved.revision,resultingRevision:saved.revision+1,detail:null}}),/phase_closed/);
  assert.equal((await db.query('select count(*)::int n from nmls_training_events where enrollment_id=$1',[learner.enrollment])).rows[0].n,saved.revision);
  for(const table of ['checkout_attempts','payments','course_certificates','course_completion_events','regulatory_reports'])assert.equal((await db.query(`select count(*)::int n from ${table}`)).rows[0].n,0,table);
 });
 await t.test('latest disabled governance closes enrollment, snapshots and old-event replay',async()=>{
  await db.query(`insert into offering_governance_events(site,state,discipline,offering_kind,offering_id,approval_status,training_access_enabled,payment_mode,recorded_by,recorded_role,note,recorded_at)
   values('statecourse.com','US','mortgage','course','nmls-ce-2026-comprehensive-8','none',false,'disabled',$1,'owner','Test revocation closes only mortgage training',clock_timestamp())`,[owner]);
  await assert.rejects(h.state(),/gate_closed/);await assert.rejects(rpc(db,'nmls_training_enroll',{p_student_id:h.actor}),/gate_closed/);
  assert.equal((await db.query('select count(*)::int n from courses')).rows[0].n>1,true);
 });
});

test('real existing-auth provisioning: isolated regulator reads and sample-student non-credit writes', {skip}, async t=>{
 const db=await createDatabase(t);await db.exec(migration);
 const regulator=randomUUID(),sample=randomUUID();
 const regulatorEmail=`regulator-${regulator}@example.invalid`,sampleEmail=`sample-${sample}@example.invalid`;
 const sql=reviewProvision.replaceAll('REPLACE_WITH_EXISTING_REGULATOR_EMAIL',regulatorEmail)
  .replaceAll('REPLACE_WITH_EXISTING_SAMPLE_STUDENT_EMAIL',sampleEmail);
 await assert.rejects(db.exec(reviewProvision),/Replace both distinct/);await db.exec('rollback');
 await assert.rejects(db.exec(sql),/exactly one existing Supabase Auth/);await db.exec('rollback');
 await db.query('insert into auth.users(id,email) values($1,$2),($3,$4)',[regulator,regulatorEmail,sample,sampleEmail]);
 await db.exec(sql);
 const bindings=(await db.query("select * from enrollments where course_id='nmls-ce-2026-comprehensive-8' order by review_role")).rows;
 assert.equal(bindings.length,2);
 const reg=bindings.find(e=>e.student_id===regulator),student=bindings.find(e=>e.student_id===sample);
 assert.equal(reg.review_role,'regulator_reviewer');assert.equal(student.review_role,'student_reviewer');
 for(const e of bindings){assert.equal(e.enrollment_origin,'training');assert.equal(e.compliance_credit_eligible,false);assert.equal(e.checkout_attempt_id,null);assert.ok(e.expires_at);}
 await db.exec(sql);assert.equal((await db.query('select count(*)::int n from admin_console_actions where action=$1',['nmls_review_scope_provisioned'])).rows[0].n,2);
 assert.equal((await db.query('select count(*)::int n from auth.users')).rows[0].n,3); // provisioning never creates Auth identities
 for(const table of ['checkout_attempts','payments','course_completion_events','course_certificates','regulatory_reports'])
  assert.equal((await db.query(`select count(*)::int n from ${table}`)).rows[0].n,0,table);
 const context=(actor,id)=>rpc(db,'nmls_training_context',{p_student_id:actor,p_enrollment_id:id,p_event_id:null});
 const before=await context(regulator,reg.id);assert.equal(before.reviewRole,'regulator_reviewer');assert.equal(before.revision,0);
 const invoke=(input,actor)=>executeNmlsTraining(input,actor,{rpc:(n,p)=>rpc(db,n,p)});
 const snapshot={operation:'snapshot',command:{enrollmentId:reg.id}};
 const review=(await invoke(snapshot,regulator)).body;
 assert.equal(review.readOnly,true);assert.equal(review.review.modules.flatMap(m=>m.lessons).length,45);
 assert.doesNotMatch(JSON.stringify(review),/correctChoice|"answers"|"sessionId"|N26-FIN-/);
 const after=await context(regulator,reg.id);assert.equal(after.revision,0);assert.equal(after.runtime,null);
 assert.equal((await db.query('select count(*)::int n from nmls_training_events')).rows[0].n,0);
 await assert.rejects(invoke(snapshot,sample),/access_denied/);
 await assert.rejects(context(regulator,student.id),/access_denied/);
 await assert.rejects(invoke({operation:'teaching',command:{enrollmentId:reg.id,eventId:randomUUID(),expectedRevision:0,action:{kind:'resume',sessionId:null}}},regulator),/read_only/);
 // The database independently rejects a service process, including the replay
 // branch. Seed an old event solely as adversarial test data, not via an app.
 const event=randomUUID(),digest='a'.repeat(64);
 await db.query('insert into nmls_training_events(enrollment_id,event_id,student_id,command_digest,revision,audit) values($1,$2,$3,$4,1,$5)',
  [reg.id,event,regulator,digest,{fixture:'adversarial historical replay'}]);
 await db.exec('set role service_role');
 try {for(const eventId of [randomUUID(),event]) await assert.rejects(rpc(db,'nmls_training_commit',{
  p_student_id:regulator,p_enrollment_id:reg.id,p_event_id:eventId,p_command_digest:digest,p_expected_revision:0,
  p_evaluated_at_ms:Date.now(),p_runtime:null,p_audit:null}),/nmls_training_read_only/);}
 finally {await db.exec('reset role');}
 await assert.rejects(db.query('update enrollments set review_role=null where id=$1',[reg.id]),/scope_mismatch/);
 const again=await rpc(db,'nmls_training_enroll',{p_student_id:regulator});assert.equal(again.existing,true);assert.equal(again.enrollment.review_role,'regulator_reviewer');
 const sampleInput={operation:'teaching',command:{enrollmentId:student.id,eventId:randomUUID(),expectedRevision:0,action:{kind:'resume',sessionId:null}}};
 const result=(await invoke(sampleInput,sample)).body;
 assert.equal(result.accessMode,'student_reviewer');assert.equal(result.readOnly,false);assert.equal(result.nmlsCreditEligible,false);assert.equal(result.revision,1);
 await assert.rejects(invoke({operation:'issue_assessment',command:{enrollmentId:student.id,eventId:randomUUID(),expectedRevision:1}},sample),/review_prerequisites/);
 await db.query("update access_grants set status='revoked' where enrollment_id=$1",[reg.id]);
 await assert.rejects(invoke(snapshot,regulator),/access_denied/);
 await assert.rejects(db.exec(sql),/access_denied/);await db.exec('rollback');
 assert.equal((await db.query('select status from access_grants where enrollment_id=$1',[reg.id])).rows[0].status,'revoked');
 const expired=await db.query("update enrollments set expires_at=clock_timestamp()-interval '1 minute' where id=$1 returning id",[student.id]);
 assert.equal(expired.rows.length,1);await assert.rejects(context(sample,student.id),/access_denied/);
});

test('NMLS025 does not depend on Michigan015–017 or archived private CE migrations', {skip}, async t=>{
 const db=await createDatabase(t,{omitMichigan:true});await db.exec(migration);
 assert.equal((await db.query("select count(*)::int n from pg_tables where schemaname='public' and (tablename like 'michigan_%' or tablename like 'nmls_review_%')")).rows[0].n,0);
 const h=await learner(db);assert.equal((await h.teaching('resume')).body.phase,'source');
 assert.equal((await h.run('snapshot')).body.courseCompletionIssued,false);
});
