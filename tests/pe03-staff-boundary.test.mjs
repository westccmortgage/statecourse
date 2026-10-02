import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { pe03ProductionPrerequisites } from './helpers/pe03-production-prerequisites.mjs';
import { ids } from './helpers/pe03-fixture.mjs';
import { PE03_DEFINITION } from '../config/nmls/pe-oil-definition.mjs';
import { createPe03Handler } from '../netlify/functions/_lib/nmls-pe-http.mjs';
import { requireStaff } from '../netlify/functions/_lib/staff-session.mjs';
import { digest, requestIntent } from '../netlify/functions/_lib/staff-security.mjs';

test('PE03 actual requireStaff/requirePrivilege with unchanged 028 SQL', {skip:!process.env.PE_PGLITE_MODULE}, async t=>{
  const {PGlite}=await import(pathToFileURL(process.env.PE_PGLITE_MODULE));
  const {pgcrypto}=await import(pathToFileURL(path.join(path.dirname(process.env.PE_PGLITE_MODULE),'contrib/pgcrypto.js')));
  const db=new PGlite({extensions:{pgcrypto}});t.after(()=>db.close());await pe03ProductionPrerequisites(db);
  const sid=randomUUID(),factor=randomUUID(),proof=randomBytes(32).toString('base64url');
  const token='synthetic.'+Buffer.from(JSON.stringify({sub:ids.instructor,session_id:sid,aal:'aal2',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.only';
  await db.query('insert into students(id,email) values($1,$2)',[ids.instructor,'synthetic-instructor@example.invalid']);
  await db.query("insert into staff_actor_binding_events(auth_user_id,actor_role,binding_status,evidence,recorded_by) values($1,'instructor','active','{\"synthetic\":true}',$1)",[ids.instructor]);
  await db.query('insert into auth.users values($1,clock_timestamp(),null,null)',[ids.instructor]);await db.query('insert into auth.sessions values($1,$2,null)',[sid,ids.instructor]);await db.query("insert into auth.mfa_factors values($1,$2,'verified','totp')",[factor,ids.instructor]);
  await db.query('insert into statecourse_staff_private.proofs(proof_hash,user_id,session_id,factor_id,bindings) values($1,$2,$3,$4,statecourse_staff_private.bindings_for($2))',[digest(proof),ids.instructor,sid,factor]);
  const envKeys=['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','STATECOURSE_BASE_URL'];const before=Object.fromEntries(envKeys.map(k=>[k,process.env[k]]));
  const originalFetch=globalThis.fetch;const securityCalls=[];let peCalls=0;
  Object.assign(process.env,{SUPABASE_URL:'https://pe03-fixture.invalid',SUPABASE_ANON_KEY:'synthetic',SUPABASE_SERVICE_ROLE_KEY:'sb_synthetic',STATECOURSE_BASE_URL:'http://local'});
  t.after(()=>{globalThis.fetch=originalFetch;for(const k of envKeys){if(before[k]===undefined)delete process.env[k];else process.env[k]=before[k];}});
  globalThis.fetch=async(url,options={})=>{
    let body;
    if(url.endsWith('/auth/v1/user')) {assert.equal(options.headers.authorization,'Bearer '+token);body={id:ids.instructor,email:'synthetic-instructor@example.invalid',email_confirmed_at:new Date().toISOString()};}
    else if(url.includes('/rest/v1/students?'))body=[];
    else if(url.includes('/rest/v1/current_staff_actor_bindings?'))body=(await db.query('select * from current_staff_actor_bindings where auth_user_id=$1',[ids.instructor])).rows;
    else if(url.endsWith('/rest/v1/rpc/statecourse_staff_security')) {
      const args=JSON.parse(options.body);securityCalls.push(args);
      body=(await db.query('select statecourse_staff_security($1,$2) r',[args.op,args.payload])).rows[0].r;
    } else throw new Error('Unexpected external endpoint in synthetic test');
    return new Response(JSON.stringify(body),{status:200,headers:{'content-type':'application/json'}});
  };
  const baseHeaders={'content-type':'application/json',origin:'http://local',cookie:`__Host-sc_access=${token}; __Host-sc_staff=${proof}`};
  const body=JSON.stringify({operation:'snapshot',cohortId:ids.cohort});
  const url='http://local/api/admin/pe03';
  const intent=(raw=body,target=url)=>requestIntent({httpMethod:'POST',path:new URL(target).pathname,rawUrl:target,body:raw,queryStringParameters:{}});
  const issue=async(raw=body,target=url,expired=false)=>{
    const action=randomBytes(32).toString('base64url');await db.query("insert into statecourse_staff_private.actions(action_hash,proof_hash,intent,expires_at) values($1,$2,$3,clock_timestamp()+($4::int*interval '1 second'))",[digest(action),digest(proof),intent(raw,target),expired?-1:90]);return action;
  };
  const handler=createPe03Handler('instructor',{enabled:()=>true,rpc:async()=>{peCalls++;return {schemaVersion:1,cohort:{id:ids.cohort,title:'Synthetic',definitionId:PE03_DEFINITION.id,contentHash:PE03_DEFINITION.contentHash,timezone:'UTC',opensAt:'2026-01-01T00:00Z',closesAt:'2026-01-14T00:00Z',assignedInstructorId:ids.instructor},actorId:ids.instructor,role:'instructor',revision:0,stage:'instructor-review',observedMs:0,serverAt:new Date().toISOString(),evidence:[],receiptId:null,creditEligible:false,certificateEligible:false,bankingEligible:false,durationValidated:false};}});
  const send=(action,raw=body)=>handler(new Request(url,{method:'POST',headers:{...baseHeaders,...(action?{'x-statecourse-action-proof':action}:{})},body:raw}));
  await t.test('old headers-only event fails closed before any action authorization',async()=>{
    await assert.rejects(()=>requireStaff({headers:baseHeaders},['instructor']),/admin_request_path_required/);
    assert.equal(securityCalls.filter(c=>c.op==='check').length,0);assert.equal(peCalls,0);
  });
  await t.test('missing fresh proof is403 and never reaches learning RPC',async()=>{const r=await send();assert.equal(r.status,403);assert.equal((await r.json()).error,'fresh_action_authorization_required');assert.equal(peCalls,0);});
  await t.test('stale, wrong-body and wrong-path proofs fail closed',async()=>{
    for(const a of [await issue(body,url,true),await issue(body+' '),await issue(body,'http://local/api/admin/other')]){const r=await send(a);assert.equal(r.status,403);assert.equal((await r.json()).error,'fresh_action_authorization_required');}assert.equal(peCalls,0);
  });
  await t.test('exact valid proof binds raw body/path/method, commits authorization and is one-use',async()=>{
    const a=await issue();assert.equal((await send(a)).status,200);assert.equal(peCalls,1);assert.equal((await send(a)).status,403);assert.equal(peCalls,1);
    const last=securityCalls.filter(c=>c.op==='check').at(-1).payload;assert.equal(last.intent,intent());assert.equal(last.audit.method,'POST');assert.equal(last.audit.endpoint,'/.netlify/functions/admin-pe03');
    assert.equal((await db.query('select count(*)::int n from statecourse_staff_private.actions where used_at is not null')).rows[0].n,1);
  });
  await t.test('committed feedback with lost response requires a fresh proof, then returns the same receipt',async()=>{
    for(const actor of [ids.a,ids.b])await db.query('insert into students(id,email) values($1,$2)',[actor,actor+'@example.invalid']);
    await db.query("insert into pe03_cohorts(id,title,content_hash,timezone,opens_at,closes_at,assigned_instructor_id,enabled) values($1,'Synthetic proof-recovery cohort',$2,'UTC',date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC',(date_trunc('day',clock_timestamp() at time zone 'UTC')+interval '14 days') at time zone 'UTC',$3,true)",[ids.cohort,PE03_DEFINITION.contentHash,ids.instructor]);
    for(const actor of [ids.a,ids.b,ids.instructor])await db.query('insert into pe03_members(cohort_id,actor_id,role,active) values($1,$2,$3,true)',[ids.cohort,actor,actor===ids.instructor?'instructor':'student']);
    await db.exec("update pe03_settings set enabled=true;create table pe03_test_clock(now_at timestamptz not null);insert into pe03_test_clock values(clock_timestamp());grant select on pe03_test_clock to service_role;create or replace function pe03_now() returns timestamptz language sql volatile set search_path=public,pg_temp as $$select now_at from pe03_test_clock$$;");
    const rpc=async(name,args)=>{assert.equal(name,'pe03_command');return db.transaction(async tx=>{await tx.exec('set local role service_role');return (await tx.query('select pe03_command($1,$2,$3) result',[args.p_actor_id,args.p_role,args.p_request])).rows[0].result;});};
    const command=(actor,input)=>rpc('pe03_command',{p_actor_id:actor,p_role:actor===ids.instructor?'instructor':'student',p_request:{cohortId:ids.cohort,contentHash:PE03_DEFINITION.contentHash,...input}});
    let initial;
    for(const actor of [ids.a,ids.b]){
      const tabId=randomUUID();
      for(let revision=0;revision<3;revision++){if(revision)await db.exec("update pe03_test_clock set now_at=now_at+interval '15 seconds'");await command(actor,{operation:'observe',requestId:randomUUID(),expectedRevision:revision,tabId,mode:'active'});}
      const result=await command(actor,{operation:'submit',requestId:randomUUID(),expectedRevision:3,text:'Documented fictional evidence remains separate from unverified claims.'});if(actor===ids.a)initial=result.receiptId;
    }
    await command(ids.b,{operation:'peer',requestId:randomUUID(),expectedRevision:4,targetId:initial,text:'Please identify the missing record and explain the next useful request.'});
    const raw=JSON.stringify({operation:'feedback',cohortId:ids.cohort,actorId:ids.instructor,requestId:randomUUID(),expectedRevision:0,targetId:initial,text:'Retain the initial analysis and revise the missing-evidence explanation using the peer observation.'});
    const liveHandler=createPe03Handler('instructor',{enabled:()=>true,rpc});
    const call=(action,sessionProof=proof)=>liveHandler(new Request(url,{method:'POST',headers:{...baseHeaders,cookie:`__Host-sc_access=${token}; __Host-sc_staff=${sessionProof}`,'x-statecourse-action-proof':action},body:raw}));
    const firstAction=await issue(raw);const lost=await call(firstAction);assert.equal(lost.status,200); // Deliberately discard the response body.
    const stored=(await db.query("select id from pe03_events where kind='feedback'")).rows;assert.equal(stored.length,1);
    assert.equal((await call(firstAction)).status,403);
    const freshProof=randomBytes(32).toString('base64url'),freshAction=randomBytes(32).toString('base64url');
    const minted=(await db.query('select statecourse_staff_security($1,$2) r',['mint',{aal:'aal2',user_id:ids.instructor,session_id:sid,factor_id:factor,proof_hash:digest(freshProof),intent:intent(raw),action_hash:digest(freshAction)}])).rows[0].r;assert.equal(minted.ok,true);
    const recovered=await call(freshAction,freshProof);assert.equal(recovered.status,200);assert.equal((await recovered.json()).receiptId,stored[0].id);
    assert.equal((await db.query("select count(*)::int n from pe03_events where kind='feedback'")).rows[0].n,1);
    assert.equal((await db.query('select count(*)::int n from pe03_receipts where actor_id=$1',[ids.instructor])).rows[0].n,1);
  });
  await t.test('expired session proof requires step-up and still blocks the learning RPC',async()=>{await db.query("update statecourse_staff_private.proofs set expires_at=clock_timestamp()-interval '1 second'");const r=await send(await issue());assert.equal(r.status,403);assert.equal((await r.json()).error,'staff_step_up_required');assert.equal(peCalls,1);});
});
