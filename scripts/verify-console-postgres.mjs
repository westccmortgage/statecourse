/** Run against an isolated embedded PostgreSQL, never the production database.
 * node scripts/verify-console-postgres.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js
 * The optional module path lets CI provide a pinned verification dependency without
 * bundling an embedded database into the website or its serverless functions.
 */
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const modulePath=process.argv[2];
if(!modulePath)throw new Error('Pass the absolute path to the installed PGlite module.');
const {PGlite}=await import(pathToFileURL(modulePath));
const db=new PGlite();
let checks=0;
const ok=(value,message)=>{assert.ok(value,message);checks++;};
async function refuses(sql,params,reason){await assert.rejects(()=>db.query(sql,params),reason);checks++;}
try {
  // Prerequisites reproduce only the existing columns/roles used by 021–023.
  // This is not represented as an integration test of the entire production schema.
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create table courses(id text primary key);
    create table enrollments(id uuid primary key default gen_random_uuid(),course_id text not null references courses(id),checkout_attempt_id uuid not null,compliance_credit_eligible boolean not null default false);
    create table admin_console_actions(id bigint generated always as identity primary key,auth_user_id uuid not null,actor_role text not null,action text not null,subject text,detail jsonb not null);
    create function admin_console_refuse_record_mutation() returns trigger language plpgsql as $$begin raise exception 'append_only';end$$;
  `);
  for(const file of ['021_offering_governance.sql','022_training_enrollment.sql','023_console_workbench.sql']){
    await db.exec(await fs.readFile(new URL('../database/'+file,import.meta.url),'utf8'));checks++;
  }
  const actor='11111111-1111-4111-8111-111111111111',course='ca-real-estate-principles-45',other='tx-law-of-agency-30-v1';
  await db.query('insert into courses(id) values($1),($2)',[course,other]);
  const preexisting=(await db.query("insert into enrollments(course_id,enrollment_origin,checkout_attempt_id) values($1,'training',null) returning id",[course])).rows[0];
  await refuses("insert into enrollments(course_id,enrollment_origin,checkout_attempt_id,compliance_credit_eligible) values($1,'training',null,true)",[course],/training_enrolments_never_earn_credit/);
  await refuses("insert into enrollments(course_id,enrollment_origin,checkout_attempt_id) values($1,'purchase',null)",[course],/enrollment_origin_has_its_evidence/);
  const hash='a'.repeat(64),hash2='b'.repeat(64),payload={schemaVersion:1,overrides:[]};
  const save='select console_save_draft($1,$2,$3,$4,$5,$6) as draft';
  const publish='select console_publish_course($1,$2,$3,$4,$5) as release';
  const first=(await db.query(save,[course,0,payload,hash,actor,'owner'])).rows[0].draft;
  ok(first.revision===1,'first draft saved');
  await refuses(save,[course,0,payload,hash,actor,'owner'],/draft_revision_conflict/);
  await refuses(publish,[course,hash,actor,'Publish reviewed teaching text','owner'],/current_review_required/);
  await db.query('insert into console_course_reviews(course_id,content_hash,outcome,note,reviewed_by) values($1,$2,$3,$4,$5)',[course,hash,'pass','Reviewed the exact content version',actor]);
  await db.query(save,[course,1,{...payload,changed:true},hash2,actor,'owner']);
  await refuses(publish,[course,hash,actor,'Publish reviewed teaching text','owner'],/draft_revision_conflict/);
  await refuses(publish,[course,hash2,actor,'Publish reviewed teaching text','owner'],/current_review_required/);
  await db.query('insert into console_course_reviews(course_id,content_hash,outcome,note,reviewed_by) values($1,$2,$3,$4,$5)',[course,hash2,'pass','Reviewed the revised teaching text',actor]);
  const release=(await db.query(publish,[course,hash2,actor,'Publish reviewed teaching text','owner'])).rows[0].release;
  ok(Boolean(release.id),'reviewed publication created');
  const before=(await db.query('select console_content_release_id from enrollments where id=$1',[preexisting.id])).rows[0];
  ok(before.console_content_release_id===null,'existing enrollment was not silently moved');
  const next=(await db.query("insert into enrollments(course_id,enrollment_origin,checkout_attempt_id) values($1,'training',null) returning console_content_release_id",[course])).rows[0];
  ok(next.console_content_release_id===release.id,'new enrollment pinned to publication');
  await refuses("insert into enrollments(course_id,enrollment_origin,checkout_attempt_id,console_content_release_id) values($1,'training',null,$2)",[other,release.id],/enrollment_console_release_course/);
  await refuses('update console_course_releases set note=$1 where id=$2',['Tampered history',release.id],/append_only/);
  await refuses('delete from console_course_reviews where course_id=$1',[course],/append_only/);
  const audit=(await db.query("select actor_role from admin_console_actions where action='course.publish'")).rows[0];
  ok(audit.actor_role==='owner','audit preserves actual actor role');
  const task=(await db.query('insert into console_tasks(course_id,title,created_by,updated_by) values($1,$2,$3,$3) returning id',[course,'Verify the updated lesson',actor])).rows[0];
  const change='select console_update_task($1,$2,$3,$4,$5)';
  await refuses(change,[task.id,1,{status:'closed'},actor,'Closing without verification'],/verification_step_required/);
  await db.query(change,[task.id,1,{status:'needs_verification'},actor,'Implementation is ready to verify']);
  await refuses(change,[task.id,1,{status:'closed'},actor,'Verified the updated screen'],/task_revision_conflict/);
  await db.query(change,[task.id,2,{status:'closed'},actor,'Verified the updated screen']);
  ok((await db.query('select count(*)::int n from console_task_events')).rows[0].n===2,'task history records both transitions');
  for(const role of ['anon','authenticated']){
    const privileges=await db.query("select has_table_privilege($1,'console_course_drafts','SELECT') as read,has_function_privilege($1,'console_save_draft(text,integer,jsonb,text,uuid,text)','EXECUTE') as write",[role]);
    ok(!privileges.rows[0].read&&!privileges.rows[0].write,role+' has no draft read or RPC permission');
  }
  await db.exec('set role service_role');
  // service_role must be able to write the audit row inside the transaction.
  // The real base migration grants these; reproduce those grants before exercising RPCs.
  await db.exec('reset role; grant select,insert on admin_console_actions to service_role; grant usage,select on sequence admin_console_actions_id_seq to service_role; grant select on courses to service_role; set role service_role;');
  await db.query(save,[other,0,payload,hash,actor,'owner']);checks++;
  console.log(JSON.stringify({postgresChecks:checks,passed:checks,productionDatabaseTouched:false,scope:'021–023 against their modeled prerequisites'}));
} finally { await db.close(); }
