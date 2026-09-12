import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {LAW_OF_AGENCY_TRAINING_RUNTIME as definition} from '../config/texas/law-of-agency-training-runtime.mjs';
if(!process.argv[2])throw new Error('Pass the installed PGlite module path.');
const {PGlite}=await import(pathToFileURL(process.argv[2]));
const db=new PGlite();let checks=0;
const ok=(value,message)=>{assert.ok(value,message);checks++;};
const rejects=async(sql,args,pattern)=>{await assert.rejects(()=>db.query(sql,args),pattern);checks++;};
const student='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
const enrollment='33333333-3333-4333-8333-333333333333',session='44444444-4444-4444-8444-444444444444',secondSession='55555555-5555-4555-8555-555555555555';
try{
  await db.exec("create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create function auth.uid() returns uuid language sql stable as $$select null::uuid$$;");
  for(const name of ['001_payments_enrollment.sql','002_regulatory_courses_reporting.sql','003_student_portal.sql','004_california_prelicense.sql','014_block_learning.sql','022_training_enrollment.sql']){
    const sql=(await fs.readFile(new URL('../database/'+name,import.meta.url),'utf8')).replace(/create extension if not exists pgcrypto;/i,'');
    await db.exec(sql);
  }
  await db.query("insert into courses(id,state,name,product_type) values($1,'TX','Texas Law of Agency','real_estate_qualifying_education')",[definition.courseId]);
  const migration=await fs.readFile(new URL('../database/024_texas_training_runtime.sql',import.meta.url),'utf8');
  await db.exec(migration);checks++;
  await db.exec(migration);checks++;
  const actual=(await db.query('select training_runtime_definition($1) as definition',[definition.courseId])).rows[0].definition;
  assert.deepEqual(actual,definition);checks++;
  await db.query("insert into students(id,email) values($1,'training@example.invalid'),($2,'other@example.invalid')",[student,other]);
  await db.query("insert into enrollments(id,student_id,course_id,state,status,course_version,enrollment_origin,compliance_credit_eligible) values($1,$2,$3,'TX','active','1.0','training',false)",[enrollment,student,definition.courseId]);
  await db.query("insert into access_grants(enrollment_id,student_id,course_id,status) values($1,$2,$3,'active')",[enrollment,student,definition.courseId]);
  const init='select initialize_training_runtime($1,$2)';
  await rejects(init,[enrollment,other],/course_access_denied/);
  await rejects(init,[enrollment,null],/course_access_denied/);
  await db.query(init,[enrollment,student]);await db.query(init,[enrollment,student]);
  ok((await db.query('select count(*)::int n from lms_assignment_state where enrollment_id=$1',[enrollment])).rows[0].n===12,'twelve modules initialized once');
  ok((await db.query('select required_study_seconds from lms_compliance_state where enrollment_id=$1',[enrollment])).rows[0].required_study_seconds===90000,'study requirement comes from the existing 1500-minute module plan');
  const beat='select record_training_heartbeat($1,$2,$3,$4,$5,$6) seconds';
  const args=[session,enrollment,student,'module-01',true,{}];
  ok((await db.query(beat,args)).rows[0].seconds===0,'first signal gives no retrospective time');
  await db.query("update lms_active_sessions set last_heartbeat_at=now()-interval '15 seconds' where id=$1",[session]);
  ok((await db.query(beat,args)).rows[0].seconds===15,'server-measured interval saved');
  ok((await db.query(beat,args)).rows[0].seconds===0,'immediate replay gives no extra time');
  await db.query(beat,[secondSession,enrollment,student,'module-01',true,{}]);
  await db.query("update lms_active_sessions set last_heartbeat_at=now()-interval '15 seconds' where id=$1",[secondSession]);
  ok((await db.query(beat,[secondSession,enrollment,student,'module-01',true,{}])).rows[0].seconds===0,'overlapping tabs cannot double-count the interval');
  await db.query("update lms_active_sessions set last_heartbeat_at=now()-interval '15 seconds' where id=$1",[session]);
  ok((await db.query(beat,[session,enrollment,student,'module-01',false,{}])).rows[0].seconds===0,'hidden or inactive page gets no time');
  await db.query("update lms_active_sessions set last_heartbeat_at=now()-interval '5 minutes' where id=$1",[session]);
  ok((await db.query(beat,args)).rows[0].seconds===0,'offline gap gets no time');
  await rejects(beat,[session,enrollment,student,'module-02',true,{}],/assignment_locked/);
  const finish='select complete_training_module($1,$2,$3) completed';
  ok((await db.query(finish,[enrollment,student,'module-01'])).rows[0].completed===false,'time and evidence are required for module completion');
  const block=definition.modules[0].requiredBlocks[0];
  const saveBlock='insert into lms_block_progress(enrollment_id,student_id,course_id,course_version,assignment_id,block_id,status,completed_screens) values($1,$2,$3,\'1.0\',$4,$5,\'MASTERED\',$6)';
  await rejects(saveBlock,[enrollment,student,definition.courseId,'module-01',block.id,block.screens],/texas_block_evidence_incomplete/);
  const attempt='insert into lms_block_assessment_attempts(enrollment_id,student_id,course_id,course_version,assignment_id,block_id,screen_id,question_id,kind,correct) values($1,$2,$3,\'1.0\',$4,$5,$6,$7,$8,$9)';
  async function evidence(module,b){
    for(const q of b.questions)await db.query(attempt,[enrollment,student,definition.courseId,module.id,b.id,q.screenId,q.primary,'retrieval',true]);
    await db.query(saveBlock,[enrollment,student,definition.courseId,module.id,b.id,b.screens]);
  }
  const first=definition.modules[0];
  for(const b of first.requiredBlocks)await evidence(first,b);
  ok((await db.query(finish,[enrollment,student,first.id])).rows[0].completed===false,'all answers alone cannot bypass the module study-time requirement');
  await db.query('update lms_assignment_state set active_seconds=$1 where enrollment_id=$2 and assignment_id=$3',[first.expectedMinutes*60,enrollment,first.id]);
  ok((await db.query(finish,[enrollment,student,first.id])).rows[0].completed===true,'complete module evidence unlocks the next module');
  ok((await db.query('select resume_path from student_portal_state where enrollment_id=$1',[enrollment])).rows[0].resume_path.endsWith('assignment=module-02'),'resume moves to the next module');
  await rejects(beat,[session,enrollment,student,'module-02',true,{}],/training_session_mismatch/);
  const before=(await db.query("select count(*)::int n from lms_regulatory_audit where event_type='training_module_completed'")).rows[0].n;
  await db.query(finish,[enrollment,student,first.id]);
  ok((await db.query("select count(*)::int n from lms_regulatory_audit where event_type='training_module_completed'")).rows[0].n===before,'repeating completion adds no duplicate completion event');
  const dual=definition.modules[7].requiredBlocks.find(b=>b.questions.length===2);
  const q=dual.questions[0];
  await db.query(attempt,[enrollment,student,definition.courseId,'module-08',dual.id,q.screenId,q.primary,'retrieval',true]);
  await rejects(saveBlock,[enrollment,student,definition.courseId,'module-08',dual.id,dual.screens],/texas_block_evidence_incomplete/);
  const missed=dual.questions[1];
  await db.query(attempt,[enrollment,student,definition.courseId,'module-08',dual.id,missed.screenId,missed.primary,'retrieval',false]);
  await db.query(attempt,[enrollment,student,definition.courseId,'module-08',dual.id,missed.screenId,missed.replacement,'replacement',true]);
  await rejects(saveBlock,[enrollment,student,definition.courseId,'module-08',dual.id,dual.screens],/texas_block_evidence_incomplete/);
  await db.query(attempt,[enrollment,student,definition.courseId,'module-08',dual.id,missed.screenId,null,'remediation_review',null]);
  await db.query(saveBlock,[enrollment,student,definition.courseId,'module-08',dual.id,dual.screens]);checks++;
  // Exercise the entire existing module plan in this isolated database. The explicit
  // clock setup below is test data, never an operation on a production enrollment.
  for(const module of definition.modules.slice(1)) {
    for(const b of module.requiredBlocks)if(b.id!==dual.id)await evidence(module,b);
    await db.query('update lms_assignment_state set active_seconds=$1 where enrollment_id=$2 and assignment_id=$3',[module.expectedMinutes*60,enrollment,module.id]);
    ok((await db.query(finish,[enrollment,student,module.id])).rows[0].completed===true,module.id+' completes in sequence');
  }
  ok((await db.query("select count(*)::int n from lms_assignment_state where enrollment_id=$1 and status='completed'",[enrollment])).rows[0].n===12,'all twelve real module definitions can finish');
  await db.query(init,[enrollment,student]);
  ok((await db.query('select resume_path from student_portal_state where enrollment_id=$1',[enrollment])).rows[0].resume_path.endsWith('assignment=module-12'),'reopening does not reset saved progress to module one');
  await db.query("update access_grants set status='revoked' where enrollment_id=$1",[enrollment]);
  await rejects(beat,args,/training_access_revoked/);
  await db.query("update access_grants set status='active' where enrollment_id=$1",[enrollment]);
  await db.query("update enrollments set expires_at=now()-interval '1 second' where id=$1",[enrollment]);
  await rejects(init,[enrollment,student],/training_access_inactive/);
  const outcome=(await db.query('select e.compliance_credit_eligible,c.final_exam_eligible,c.certificate_status from enrollments e join lms_compliance_state c on c.enrollment_id=e.id where e.id=$1',[enrollment])).rows[0];
  ok(!outcome.compliance_credit_eligible&&!outcome.final_exam_eligible&&outcome.certificate_status==='not_issued','training does not award licensing credit, examination access or certificates');
  for(const role of ['anon','authenticated']){
    const allowed=(await db.query("select has_function_privilege($1,'record_training_heartbeat(uuid,uuid,uuid,text,boolean,jsonb)','EXECUTE') allowed",[role])).rows[0].allowed;
    ok(!allowed,role+' cannot directly submit authoritative training time');
  }
  console.log(JSON.stringify({postgresChecks:checks,passed:checks,productionDatabaseTouched:false}));
}finally{await db.close();}
