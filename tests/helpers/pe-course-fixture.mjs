import {pathToFileURL} from 'node:url';
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PE_COURSE_DEFINITION,PE_COURSE_UNITS} from '../../config/nmls/pe-course-definition.mjs';
import {executePeCourse} from '../../netlify/functions/_lib/nmls-pe-course-service.mjs';
import {courseNativeDatabase} from './pe-course-native-database.mjs';
export const ids={course:'10000000-0000-4000-8000-000000000001',other:'10000000-0000-4000-8000-000000000002',a:'20000000-0000-4000-8000-000000000001',b:'20000000-0000-4000-8000-000000000002',instructor:'20000000-0000-4000-8000-000000000003',forged:'20000000-0000-4000-8000-000000000004'};
export async function peCourseFixture(){
 const native=process.env.PE_COURSE_NATIVE_CI==='1';
 if(!native&&!process.env.PE_PGLITE_MODULE)throw new Error('PE_PGLITE_MODULE required; never silently skip');
 const db=native?await courseNativeDatabase():new (await import(pathToFileURL(process.env.PE_PGLITE_MODULE))).PGlite();
 if(!native)await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create table students(id uuid primary key,email text,account_status text not null default 'active');
 create table current_staff_actor_bindings(auth_user_id uuid,actor_role text,scope_state text,binding_status text,effective_at timestamptz,expires_at timestamptz);
 grant select,update on students to service_role;grant select on current_staff_actor_bindings to service_role;`);
 await db.exec(await fs.readFile(new URL('../../database/drafts/pe-course-workbench.sql',import.meta.url),'utf8'));
 await db.exec(`create table pe_course_test_clock(now_at timestamptz not null);insert into pe_course_test_clock values('2026-10-01T12:00:00Z');grant select on pe_course_test_clock to service_role;
 create or replace function pe_course_now() returns timestamptz language sql volatile set search_path=public,pg_temp as $$select now_at from pe_course_test_clock$$;`);
 for(const actor of [ids.a,ids.b,ids.instructor,ids.forged])await db.query('insert into students(id,email) values($1,$2)',[actor,actor+'@example.invalid']);
 if(native)await db.query("insert into staff_actor_binding_events(auth_user_id,actor_role,binding_status,evidence,recorded_by) values($1,'instructor','active','{\"synthetic\":true}',$1)",[ids.instructor]);
 else await db.query("insert into current_staff_actor_bindings values($1,'instructor',null,'active',null,null)",[ids.instructor]);
 await db.query("insert into pe_course_rosters(id,title,content_hash,timezone,opens_at,closes_at,assigned_instructor_id) values($1,'Synthetic 25-unit course',$2,'America/Los_Angeles','2026-10-01T07:00Z','2026-10-15T07:00Z',$3)",[ids.course,PE_COURSE_DEFINITION.contentHash,ids.instructor]);
 for(const actor of [ids.a,ids.b,ids.instructor])await db.query('insert into pe_course_roster_members values($1,$2,$3,true)',[ids.course,actor,actor===ids.instructor?'instructor':'student']);
 for(const unit of PE_COURSE_UNITS){
  const id=randomUUID();await db.query(`insert into pe_course_cohorts(id,title,course_id,unit_id,category,initial_min_ms,planned_ms,content_hash,timezone,opens_at,closes_at,assigned_instructor_id) values($1,$2,$3,$4,$5,$6,$7,$8,'America/Los_Angeles','2026-10-01T07:00Z','2026-10-15T07:00Z',$9)`,[id,unit.title,ids.course,unit.unit,unit.category,unit.initialMinimumMs,unit.plannedMs,unit.contentHash,ids.instructor]);
  for(const actor of [ids.a,ids.b,ids.instructor])await db.query('insert into pe_course_members(cohort_id,actor_id,role,active) values($1,$2,$3,true)',[id,actor,actor===ids.instructor?'instructor':'student']);
 }
 const rpc=async(name,args)=>{if(name!=='pe_course_dispatch')throw new Error('unexpected RPC');return db.transaction(async tx=>{await tx.exec('set local role service_role');return(await tx.query('select pe_course_dispatch($1,$2,$3) result',[args.p_actor_id,args.p_role,args.p_request])).rows[0].result;});};
 const role=actor=>actor===ids.instructor?'instructor':'student';
 const request=(operation,extra={})=>({operation,courseId:ids.course,...extra});
 const call=(actor,input)=>executePeCourse(input,actor,role(actor),{rpc});
 const state=(actor,unitId)=>call(actor,request('snapshot',{unitId}));
 const write=async(actor,unitId,operation,extra={})=>{if(actor!==ids.instructor)await ensurePolicy(actor);return call(actor,request(operation,{unitId,actorId:actor,requestId:randomUUID(),expectedRevision:(await state(actor,unitId)).revision,...extra}));};
 const advance=ms=>db.query("update pe_course_test_clock set now_at=now_at+($1::bigint*interval '1 millisecond')",[ms]);
 // Explicit synthetic control/clock transitions exercise the policy; no counters
 // are reset or bypassed to accelerate teaching. Never a learner timing study.
 const ensurePolicy=async actor=>{
  for(let i=0;i<5;i++){
   let policy=await call(actor,request('policy-snapshot'));if(policy.allowed)return policy;
   if(policy.code==='mandatory_break_required')policy=await call(actor,request('policy-break',{actorId:actor,requestId:randomUUID()}));
   if(policy.resumeNotBefore){const now=(await db.query('select pe_course_now() now')).rows[0].now;await advance(Math.max(0,Date.parse(policy.resumeNotBefore)-Date.parse(now)));}
   else if(policy.code==='rolling_day_limit')await advance(24*60*60000);
   policy=await call(actor,request('policy-resume',{actorId:actor,requestId:randomUUID()}));if(policy.allowed)return policy;
  }throw new Error('Synthetic policy recovery failed');
 };
 const observeTo=async(actor,unitId,targetMs)=>{
  const tabId=randomUUID();let s=await write(actor,unitId,'observe',{tabId,mode:'active'});
  while(s.observedMs<targetMs){await ensurePolicy(actor);await advance(Math.min(20000,targetMs-s.observedMs));try{s=await call(actor,request('observe',{unitId,actorId:actor,requestId:randomUUID(),expectedRevision:s.revision,tabId,mode:'active'}));}catch(e){if(e.message!=='pe_course_delivery_paused')throw e;await ensurePolicy(actor);s=await write(actor,unitId,'observe',{tabId,mode:'active'});}}
  return s;
 };
 return {db,rpc,request,call,state,write,advance,observeTo,ensurePolicy,enable:()=>db.exec('update pe_course_settings set enabled=true;update pe_course_rosters set enabled=true;update pe_course_cohorts set enabled=true')};
}
