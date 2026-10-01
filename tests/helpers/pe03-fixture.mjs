import { pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';
import { PE03_DEFINITION } from '../../config/nmls/pe-oil-definition.mjs';
export const ids = { cohort:'10000000-0000-4000-8000-000000000001', other:'10000000-0000-4000-8000-000000000002', a:'20000000-0000-4000-8000-000000000001', b:'20000000-0000-4000-8000-000000000002', instructor:'20000000-0000-4000-8000-000000000003', forged:'20000000-0000-4000-8000-000000000004', tabA:'30000000-0000-4000-8000-000000000001', tabB:'30000000-0000-4000-8000-000000000002' };
export async function pe03Fixture() {
 if (!process.env.PE_PGLITE_MODULE) throw new Error('PE_PGLITE_MODULE must point to the installed PGlite dist/index.js; this DB acceptance may not silently skip');
 const { PGlite }=await import(pathToFileURL(process.env.PE_PGLITE_MODULE)); const db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create table students(id uuid primary key,account_status text not null default 'active');
 create table current_staff_actor_bindings(auth_user_id uuid,actor_role text,scope_state text,binding_status text,effective_at timestamptz,expires_at timestamptz);
 grant select,update on students to service_role; grant select on current_staff_actor_bindings to service_role;`);
 await db.exec(await fs.readFile(new URL('../../database/drafts/pe03-cohort-evidence.sql',import.meta.url),'utf8'));
 await db.exec(`create table pe03_test_clock(now_at timestamptz not null); insert into pe03_test_clock values('2026-10-01T12:00:00Z'); grant select on pe03_test_clock to service_role;
 create or replace function pe03_now() returns timestamptz language sql volatile set search_path=public,pg_temp as $$select now_at from pe03_test_clock$$;`);
 for(const actor of [ids.a,ids.b,ids.instructor,ids.forged])await db.query('insert into students(id) values($1)',[actor]);
 await db.query("insert into current_staff_actor_bindings values($1,'instructor',null,'active',null,null)",[ids.instructor]);
 for(const cohort of [ids.cohort,ids.other]){
 await db.query("insert into pe03_cohorts(id,title,content_hash,timezone,opens_at,closes_at,assigned_instructor_id) values($1,'Synthetic PE03 cohort',$2,'America/Los_Angeles','2026-10-01T07:00:00Z','2026-10-15T07:00:00Z',$3)",[cohort,PE03_DEFINITION.contentHash,ids.instructor]);
 for(const [actor,role] of [[ids.a,'student'],[ids.b,'student'],[ids.instructor,'instructor']])await db.query('insert into pe03_members(cohort_id,actor_id,role,active) values($1,$2,$3,true)',[cohort,actor,role]);
 }
 let n=0;
 const request=(operation,extra={})=>({operation,cohortId:ids.cohort,...(!['snapshot','export'].includes(operation)?{requestId:`40000000-0000-4000-8000-${String(++n).padStart(12,'0')}`,expectedRevision:0}:{}),...extra});
 const rpc=async(name,args)=>{
 if(name!=='pe03_command')throw new Error('unexpected RPC');
 return db.transaction(async tx=>{await tx.exec('set local role service_role');return (await tx.query('select pe03_command($1,$2,$3) result',[args.p_actor_id,args.p_role,args.p_request])).rows[0].result;});
 };
 const call=async(actor,role,input)=>rpc('pe03_command',{p_actor_id:actor,p_role:role,p_request:{...input,contentHash:PE03_DEFINITION.contentHash}});
 const enable=()=>db.exec('update pe03_settings set enabled=true; update pe03_cohorts set enabled=true');
 const advance=ms=>db.query("update pe03_test_clock set now_at=now_at+($1::bigint*interval '1 millisecond')",[ms]);
 const state=actor=>call(actor,actor===ids.instructor?'instructor':'student',request('snapshot'));
 const observe=async(actor=ids.a,tabId=ids.tabA,mode='active')=>call(actor,'student',request('observe',{expectedRevision:(await state(actor)).revision,tabId,mode}));
 const write=async(actor,operation,extra={})=>call(actor,actor===ids.instructor?'instructor':'student',request(operation,{expectedRevision:(await state(actor)).revision,text:'Synthetic evidence analysis with a specific missing record and next action.',...extra}));
 const qualify=async(actor=ids.a,tabId=ids.tabA)=>{await observe(actor,tabId);await advance(15000);await observe(actor,tabId);await advance(15000);await observe(actor,tabId);};
 return {db,request,rpc,call,enable,advance,state,observe,write,qualify};
}
