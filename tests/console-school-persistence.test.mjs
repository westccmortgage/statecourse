import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync,readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const skip=process.env.NMLS_TEST_PGLITE_MODULE?false:'Set NMLS_TEST_PGLITE_MODULE; SQL not verified when skipped.';
test('unified admin migration executes against real application migrations with scoped reviewer lifecycle and RLS',{skip},async t=>{
 const {PGlite}=await import(pathToFileURL(process.env.NMLS_TEST_PGLITE_MODULE).href);const db=new PGlite();t.after(()=>db.close());
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select null::uuid$$;grant usage on schema public to anon,authenticated,service_role;alter default privileges in schema public grant all on tables to service_role;alter default privileges in schema public grant all on functions to service_role;`);
 const owner=randomUUID(),reviewer=randomUUID(),sample=randomUUID(),other=randomUUID();
 for(const file of readdirSync('database').filter(f=>/^0(?:0[1-9]|1\d|2[0-57])_.*\.sql$/.test(f)&&f!=='020_rollback.sql').sort()) {
  if(file.startsWith('025_')) {await db.query('insert into auth.users(id,email) values($1,$2)',[owner,'akanevsky1967@gmail.com']);await db.query('insert into students(id,email) values($1,$2)',[owner,'akanevsky1967@gmail.com']);await db.query("insert into staff_actor_binding_events(auth_user_id,actor_role,binding_status,effective_at,evidence,recorded_by) values($1,'owner','active',now()-interval '1 hour','{\"fixture\":\"local owner authorization\"}',$1)",[owner]);}
  try{await db.exec(readFileSync(`database/${file}`,'utf8').replace('create extension if not exists pgcrypto;',''));}catch(e){throw Error(`${file}: ${e.message}`);}
 }
 for(const id of [reviewer,sample,other]){await db.query('insert into auth.users(id,email) values($1,$2)',[id,`${id}@example.invalid`]);await db.query('insert into students(id,email) values($1,$2)',[id,`${id}@example.invalid`]);}
 const access=async(actor,student,course,version,role,action='create',enrollment=null)=>{const r=await db.query(`select console_review_access($1,$2,$3,$4,$5,now()+interval '30 days',$6,$7) as id`,[actor,student,course,version,role,action,enrollment]);return r.rows[0].id;};
 await assert.rejects(access(other,reviewer,'nmls-ce-2026-comprehensive-8','2026.3','regulator_reviewer'),/owner_required/);
 await assert.rejects(access(owner,reviewer,'nmls-ce-2026-comprehensive-8','old','regulator_reviewer'),/version_changed/);
 const id=await access(owner,reviewer,'nmls-ce-2026-comprehensive-8','2026.3','regulator_reviewer');
 const row=(await db.query('select * from enrollments where id=$1',[id])).rows[0];assert.equal(row.review_role,'regulator_reviewer');assert.equal(row.compliance_credit_eligible,false);
 await assert.rejects(access(owner,reviewer,'nmls-ce-2026-comprehensive-8','2026.3','student_reviewer'),/existing_enrollment/);
 await assert.rejects(access(owner,other,'tx-law-of-agency-30-v1','1.0','regulator_reviewer'),/not_supported/);
 await access(owner,reviewer,row.course_id,row.course_version,null,'expiry',id);
 await assert.rejects(access(owner,other,row.course_id,row.course_version,null,'revoke',id),/scope_mismatch/);
 const finding=randomUUID(),hash='a'.repeat(64);
 const find=async(status,key=finding,h=hash)=>db.query('select console_record_review_finding($1,$2,$3,$4,$5,$6,$7,$8,$9)',[row.course_id,row.course_version,id,key,h,status,'Documented reviewer finding and resolution.','https://example.invalid/review',owner]);
 await assert.rejects(find('signed_off'),/not_found/);
 await find('open');await assert.rejects(find('signed_off'),/transition_conflict/);
 await find('resolved');await assert.rejects(find('signed_off',finding,'b'.repeat(64)),/scope_changed/);
 await find('signed_off');await assert.rejects(find('open'),/transition_conflict/);
 await db.query('update courses set current_version=$1 where id=$2',['2026.4',row.course_id]);
 await access(owner,reviewer,row.course_id,row.course_version,null,'revoke',id);
 await find('reopened');await find('resolved');await assert.rejects(find('signed_off'),/active_review_required/);
 assert.equal((await db.query('select status from access_grants where enrollment_id=$1',[id])).rows[0].status,'revoked');
 await assert.rejects(access(owner,reviewer,row.course_id,row.course_version,null,'expiry',id),/cannot_reopen/);
 const ca=await access(owner,sample,'ca-real-estate-principles-45','1.0','student_reviewer');
 assert.equal((await db.query('select status from enrollments where id=$1',[ca])).rows[0].status,'qa_non_credit');
 await assert.rejects(db.query('select issue_california_completion_certificate($1)',[ca]),/refused_for_review/);
 await db.query(`insert into console_evidence_events(course_id,course_version,area,evidence_key,status,reference,note,recorded_by) values($1,'1.0','regulatory','provider','missing','','Document missing; no approval claimed.',$2)`,['ca-real-estate-principles-45',owner]);
 await assert.rejects(db.exec(`update console_evidence_events set status='verified'`),/append_only/);
 await db.exec('set role authenticated');
 await assert.rejects(db.exec('select * from console_evidence_events'),/permission denied/);
 await assert.rejects(access(owner,other,'ca-real-estate-principles-45','1.0','student_reviewer'),/permission denied/);
});
