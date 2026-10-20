import {createSourceDatabase} from './source-database.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { StateCourseReader } from '../adapter.mjs';
import { createReadOnlyApi } from '../api.mjs';
import { COURSE_ID } from '../contract.mjs';
import { candidatesFrom } from '../findings.mjs';
import { ACTOR, SESSION, ENROLLMENT, OTHER, ORGANIZATION, IDENTITY, PROOF } from './fixtures.mjs';
import { executors } from './executors.mjs';
let db;
let releases=0,sqlLog=[];
const reader=new StateCourseReader({connect:async()=>({query:async(sql,params)=>{sqlLog.push(sql);return db.query(sql,params);},release:async()=>{releases++;}})});
const scope={courseId:COURSE_ID,enrollmentId:ENROLLMENT};
test.before(async()=>{db=await createSourceDatabase();});
test.after(async()=>{await db.close();});
test('actual StateCourse migrations support every adapter query and enforce READ ONLY',async()=>{
 const before=await db.query('select to_jsonb(e) row from enrollments e order by id');
 const s=await reader.read(IDENTITY,scope);
 assert.equal(s.tables.enrollments[0].id,ENROLLMENT);assert.equal(s.tables.enrollments[0].enrollment_origin,'training');
 assert.equal(s.tables.regulatory_course_versions[0].version,'1.0');assert.equal(candidatesFrom(s).length,0);
 assert.match(sqlLog[0],/^BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY$/);assert.equal(releases,1);
 const mutation=new StateCourseReader({connect:async()=>({query:async(sql,params)=>{
  if(sql==='select transaction_timestamp() as captured_at') await db.query("update enrollments set status='cancelled' where id=$1",[ENROLLMENT]);
  return db.query(sql,params);
 },release:async()=>{}})});
 await assert.rejects(()=>mutation.read(IDENTITY,scope),/read.only transaction/i);
 assert.deepEqual((await db.query('select to_jsonb(e) row from enrollments e order by id')).rows,before.rows);
});
test('secondary package payment is read through payment_enrollments, without Stripe identifiers',async()=>{
 await db.query(`insert into payments(id,student_id,enrollment_id,course_id,state,stripe_mode,stripe_checkout_session_id,stripe_payment_intent_id,amount,currency,status,payment_date,regulatory_acknowledgment_version,terms_version,refund_policy_version,cancellation_policy_version)
 values($1,$2,$3,'ca-real-estate-practice-45','CA','test','cs_fixture','pi_fixture',2000,'usd','paid',now(),'1','1','1','1')`,[OTHER,ACTOR,OTHER]);
 await db.query('insert into payment_enrollments(payment_id,enrollment_id,course_id,allocated_amount,is_primary) values($1,$2,$3,1000,false)',[OTHER,ENROLLMENT,COURSE_ID]);
 const s=await reader.read(IDENTITY,scope);
 assert.equal(s.tables.payments[0].enrollment_id,OTHER);assert.equal(s.tables.payment_enrollments[0].is_primary,false);
 assert.equal(JSON.stringify(s).includes('cs_fixture'),false);assert.equal(JSON.stringify(s).includes('fixture@example'),false);
});
test('exact session and MFA proof plus current CA authority are mandatory',async()=>{
 for(const patch of [{sessionId:OTHER},{userId:OTHER},{proofHash:'0'.repeat(64)}]) await assert.rejects(()=>reader.read({...IDENTITY,...patch},scope),/denied/);
 await db.query('update statecourse_staff_private.proofs set revoked_at=now()');
 await assert.rejects(()=>reader.read(IDENTITY,scope),/denied/);
 await db.query('update statecourse_staff_private.proofs set revoked_at=null,expires_at=now()-interval \'1 second\'');
 await assert.rejects(()=>reader.read(IDENTITY,scope),/denied/);
 await db.query('update statecourse_staff_private.proofs set expires_at=now()+interval \'15 minutes\',last_seen_at=now()-interval \'6 minutes\'');
 await assert.rejects(()=>reader.read(IDENTITY,scope),/denied/);
 await db.query('update statecourse_staff_private.proofs set last_seen_at=now()');
 await db.query("update auth.mfa_factors set status='unverified'");await assert.rejects(()=>reader.read(IDENTITY,scope),/denied/);
 await db.query("update auth.mfa_factors set status='verified'");
 const bind=async(role,state,status)=>db.query("insert into staff_actor_binding_events(auth_user_id,actor_role,scope_state,binding_status,evidence,recorded_by,recorded_at) values($1,$2,$3,$4,'{\"fixture\":true}',$1,clock_timestamp())",[ACTOR,role,state,status]);
 const refresh=async()=>db.query('update statecourse_staff_private.proofs set bindings=statecourse_staff_private.bindings_for($1)',[ACTOR]);
 await bind('administrator','CA','revoked');await bind('administrator','TX','active');await refresh();
 await assert.rejects(()=>reader.read(IDENTITY,scope),/denied/);
 await bind('administrator','TX','revoked');await bind('administrator','CA','active');await refresh();
 assert.equal((await reader.read(IDENTITY,scope)).tables.enrollments.length,1);
 await bind('administrator','CA','revoked');await assert.rejects(()=>reader.read(IDENTITY,scope),/denied/);
 await bind('regulator_reviewer','CA','active');await refresh();await assert.rejects(()=>reader.read(IDENTITY,scope),/denied/);
 await bind('administrator','CA','active');await refresh();
 await db.query('delete from auth.sessions where id=$1',[SESSION]);await assert.rejects(()=>reader.read(IDENTITY,scope),/denied/);
 await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[SESSION,ACTOR]);
 assert.equal((await reader.read(IDENTITY,scope)).tables.enrollments.length,1);
});
test('API → actual SQL snapshot → Core readers/critic → record-anchored explanation',async()=>{
 await db.query("update access_grants set status='revoked',revoked_at=now() where enrollment_id=$1",[ENROLLMENT]);
 const api=createReadOnlyApi({enabled:true,organizationId:ORGANIZATION,allowedOrigin:'https://statecourse.invalid',reader,
  verifyAccessToken:async()=>({userId:ACTOR,sessionId:SESSION}),createExecutors:executors()});
 const response=await api(new Request('https://core.invalid/v1/statecourse/observations',{method:'POST',headers:{origin:'https://statecourse.invalid','content-type':'application/json',authorization:'Bearer fixture','x-statecourse-staff-proof':PROOF},body:JSON.stringify(scope)}));
 assert.equal(response.status,200,await response.clone().text());const result=await response.json();
 assert.equal(result.status,'verified_observations');assert.equal(result.observations[0].code,'active_access_missing');
 assert.equal(result.observations[0].evidence[1].table,'access_grants');
 assert.ok(result.trace.assessments.some(a=>a.assessment==='supports'));
 const blocked=await api(new Request('https://core.invalid/v1/statecourse/observations',{method:'POST',headers:{origin:'https://statecourse.invalid','content-type':'application/json',authorization:'Bearer fixture','x-statecourse-staff-proof':PROOF},body:JSON.stringify({...scope,enrollmentId:ORGANIZATION})}));
 assert.equal(blocked.status,404);
});
test('row-limit and missing-source failures refuse the entire snapshot rather than manufacturing absence',async()=>{
 await db.query(`insert into console_tasks(course_id,title,created_by,updated_by)
 select $1,'Fixture bounded task '||n,$2::uuid,$2::uuid from generate_series(1,1001) n`,[COURSE_ID,ACTOR]);
 await assert.rejects(()=>reader.read(IDENTITY,scope),error=>error.code==='source_limit_exceeded' && error.status===422);
 // A failed SELECT must propagate and release the transaction; never substitute [].
 let released=false;
 const failedSource=new StateCourseReader({connect:async()=>({query:async(sql,params)=>{
  if(sql.includes('from public.lms_block_progress')) throw new Error('fixture_source_unavailable');
  return db.query(sql,params);
 },release:async()=>{released=true;}})});
 await assert.rejects(()=>failedSource.read(IDENTITY,scope),/fixture_source_unavailable/);assert.equal(released,true);
 assert.equal((await db.query('select count(*)::int n from console_tasks')).rows[0].n,1001);
});
