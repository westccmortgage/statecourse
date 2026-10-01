import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { pe03ProductionPrerequisites } from './helpers/pe03-production-prerequisites.mjs';
import { ids } from './helpers/pe03-fixture.mjs';
import { createPeCourseHandler } from '../netlify/functions/_lib/nmls-pe-course-http.mjs';
import { requireStaff } from '../netlify/functions/_lib/staff-session.mjs';
import { digest, requestIntent } from '../netlify/functions/_lib/staff-security.mjs';

test('Course handler binds actual fresh-action proof to new course endpoint', {skip:!process.env.PE_PGLITE_MODULE}, async t=>{
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
  const body=JSON.stringify({operation:'course-snapshot',courseId:ids.cohort});
  const url='http://local/api/admin/pe-course';
  const intent=(raw=body,target=url)=>requestIntent({httpMethod:'POST',path:new URL(target).pathname,rawUrl:target,body:raw,queryStringParameters:{}});
  const issue=async(raw=body,target=url,expired=false)=>{
    const action=randomBytes(32).toString('base64url');await db.query("insert into statecourse_staff_private.actions(action_hash,proof_hash,intent,expires_at) values($1,$2,$3,clock_timestamp()+($4::int*interval '1 second'))",[digest(action),digest(proof),intent(raw,target),expired?-1:90]);return action;
  };
  const handler=createPeCourseHandler('instructor',{enabled:()=>true,rpc:async()=>{peCalls++;throw new Error('synthetic_after_auth_boundary');}});
  const send=(action,raw=body)=>handler(new Request(url,{method:'POST',headers:{...baseHeaders,...(action?{'x-statecourse-action-proof':action}:{})},body:raw}));
  await t.test('missing, wrong-body and wrong-path proofs never reach course RPC',async()=>{
    for(const a of [null,await issue(body+' '),await issue(body,'http://local/api/admin/pe03')]){
      const r=await send(a);assert.equal(r.status,403);assert.equal((await r.json()).error,'fresh_action_authorization_required');
    }assert.equal(peCalls,0);
  });
  await t.test('exact proof authorizes new route once; RPC failure does not expose details',async()=>{
    const a=await issue();const r=await send(a);assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'pe_course_unavailable'});assert.equal(peCalls,1);
    assert.equal((await send(a)).status,403);assert.equal(peCalls,1);
    const last=securityCalls.filter(c=>c.op==='check').at(-1).payload;assert.equal(last.intent,intent());assert.equal(last.audit.method,'POST');assert.equal(last.audit.endpoint,'/.netlify/functions/admin-pe-course');
  });
});
