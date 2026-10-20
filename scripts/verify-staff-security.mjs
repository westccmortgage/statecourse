// Isolated PostgreSQL and HTTP boundary tests. No production writes or accounts.
// node scripts/verify-staff-security.mjs /absolute/path/to/pglite/dist/index.js
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import securityHandler from '../netlify/functions/staff-security.mjs';
import {legacyHandler as adminSession} from '../netlify/functions/admin-session.mjs';
import {requireStaff} from '../netlify/functions/_lib/staff-session.mjs';
import {requestIntent, proofCookie} from '../netlify/functions/_lib/staff-security.mjs';
const {PGlite}=await import(pathToFileURL(process.argv[2]));
const db=new PGlite();
const actor='11111111-1111-4111-8111-111111111111', sid='22222222-2222-4222-8222-222222222222',
  factor='33333333-3333-4333-8333-333333333333', other='44444444-4444-4444-8444-444444444444';
const hash=v=>createHash('sha256').update(v).digest('hex');
let checks=0;const ok=(v,label)=>{assert.ok(v,label);checks++;};
const rpc=async(op,payload={})=>(await db.query('select public.statecourse_staff_security($1,$2) as r',[op,payload])).rows[0].r;
const token=aal=>['header',Buffer.from(JSON.stringify({sub:actor,session_id:sid,exp:Math.floor(Date.now()/1000)+3600,aal,amr:[{method:'password',timestamp:Math.floor(Date.now()/1000)}]})).toString('base64url'),'signature'].join('.');
const access=token('aal1'), upgraded=token('aal2');
let cookies=`__Host-sc_access=${access}`, mfaCalls=0, factorStatus='verified';
const originalFetch=globalThis.fetch;
const originalEnv={...process.env};
try {
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
    create schema auth;create schema statecourse_ai_private;
    create table auth.users(id uuid primary key,email_confirmed_at timestamptz,deleted_at timestamptz,banned_until timestamptz);
    create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz);
    create table auth.mfa_factors(id uuid primary key,user_id uuid,status text,factor_type text);
    create table public.current_staff_actor_bindings(auth_user_id uuid,actor_role text,scope_state text,
      binding_status text,effective_at timestamptz,expires_at timestamptz,recorded_at timestamptz);
    create function statecourse_ai_private.assert_backend_key() returns void language plpgsql as $$begin
      if current_setting('test.backend_key',true) is distinct from 'server-only-test-key' then raise exception 'backend authentication failed';end if;end$$;
  `);
  for(const file of ['028_staff_session_security.sql','029_owner_oauth_authority.sql']) await db.exec(await fs.readFile(new URL('../database/'+file,import.meta.url),'utf8'));
  await db.query('insert into auth.users values($1,now(),null,null);',[actor]);
  await db.query('insert into auth.sessions values($1,$2,null);',[sid,actor]);
  await db.query("insert into auth.mfa_factors values($1,$2,'verified','totp');",[factor,actor]);
  const setRole=async(role)=>{
    await db.exec('delete from current_staff_actor_bindings;delete from statecourse_staff_private.rate_buckets;');
    if(role)await db.query("insert into current_staff_actor_bindings values($1,$2,null,'active',now()-interval '1 day',null,now())",[actor,role]);
  };
  process.env.SUPABASE_URL='https://fixture.invalid';process.env.SUPABASE_ANON_KEY='test-publishable';
  process.env.SUPABASE_SERVICE_ROLE_KEY='test-service';process.env.STATECOURSE_BASE_URL='https://statecourse.com';
  globalThis.fetch=async(input,options={})=>{
    const url=new URL(input);const body=options.body?JSON.parse(options.body):{};
    const respond=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
    if(url.pathname==='/auth/v1/user') {
      const bearer=options.headers.authorization;
      if(![`Bearer ${access}`,`Bearer ${upgraded}`].includes(bearer))return respond({},401);
      return respond({id:actor,email:'student@example.test',email_confirmed_at:new Date().toISOString(),
        user_metadata:{role:'owner',is_admin:true},factors:factorStatus ? [{id:factor,status:factorStatus,factor_type:'totp'}] : []});
    }
    if(url.pathname==='/auth/v1/factors') {
      factorStatus='unverified';await db.query("insert into auth.mfa_factors values($1,$2,'unverified','totp')",[factor,actor]);return respond({id:factor,totp:{secret:'SYNTHETIC-NOT-A-REAL-SECRET'}});
    }
    if(url.pathname===`/auth/v1/factors/${factor}/challenge`)return respond({id:other});
    if(url.pathname===`/auth/v1/factors/${factor}/verify`) {
      mfaCalls++;if(body.code!=='123456')return respond({},401);
      factorStatus='verified';await db.exec("update auth.mfa_factors set status='verified'");
      return respond({access_token:upgraded,refresh_token:'test-refresh',expires_in:3600});
    }
    if(url.pathname==='/rest/v1/students')return respond(null);
    if(url.pathname==='/rest/v1/current_staff_actor_bindings')return respond((await db.query('select * from current_staff_actor_bindings')).rows);
    if(url.pathname==='/rest/v1/rpc/statecourse_staff_security') {
      try{return respond(await rpc(body.op,body.payload));}catch{return respond({message:'security_store_unavailable'},503);}
    }
    throw Error('Unexpected test URL '+url.pathname);
  };
  const event=(method='GET',body='')=>({httpMethod:method,path:'/api/admin/workspace',headers:{cookie:cookies,origin:'https://statecourse.com'},queryStringParameters:{},body});
  const staff=()=>requireStaff(event(),['owner','administrator','support']);
  for(const [label,role] of [['student',null],['reviewer','regulator_reviewer'],['authenticated non-staff',null]]) {
    await setRole(role);await assert.rejects(staff,/staff_binding_required|staff_role_not_authorized/);checks++;
    const denied=await adminSession({...event(),path:'/api/admin/session'});ok(denied.statusCode===403,`${label} cannot enter admin`);
  }
  await setRole('owner');await assert.rejects(staff,/staff_step_up_required/);checks++;
  const step=async(extra={},code='123456')=>{
    const res=await securityHandler(new Request('https://statecourse.com/api/staff/security',{method:'POST',
      headers:{cookie:cookies,origin:'https://statecourse.com','content-type':'application/json'},body:JSON.stringify({factor_id:factor,code,...extra})}));
    const data=await res.json();
    if(res.ok)cookies=res.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
    return {res,data};
  };
  ok((await step({},'000000')).res.status===403,'incorrect MFA fails');
  ok((await step()).res.ok,'owner MFA succeeds');
  ok((await staff()).actorRole==='owner','owner with valid step-up enters');
  ok(mfaCalls===2,'actual challenge verification invoked');
  const proof=cookies.match(/__Host-sc_staff=([^;]+)/)[1];
  const checked={user_id:actor,session_id:other,proof_hash:hash(proof)};
  ok(!(await rpc('check',checked)).ok,'another exact session cannot reuse proof');
  await db.exec("update statecourse_staff_private.proofs set last_seen_at=now()-interval '6 minutes'");
  await assert.rejects(staff,/staff_step_up_required/);checks++;
  await step();await db.exec("update current_staff_actor_bindings set binding_status='revoked'");
  await assert.rejects(staff,/staff_binding_required/);checks++;
  await setRole('owner');await step();
  await db.exec("update current_staff_actor_bindings set recorded_at=now()+interval '1 second'");
  await assert.rejects(staff,/staff_step_up_required/);checks++;
  await step();
  const command=JSON.stringify({action:'publish',course_id:'test-course'});
  let actionEvent=event('POST',command);
  await assert.rejects(()=>requireStaff(actionEvent,['owner']),/fresh_action_authorization_required/);checks++;
  const action=await step({intent:requestIntent(actionEvent)});ok(action.res.ok,'fresh action MFA accepted');
  actionEvent=event('POST',command);actionEvent.headers['x-statecourse-action-proof']=action.data.actionProof;
  await assert.rejects(()=>requireStaff({...actionEvent,body:JSON.stringify({action:'binding'})},['owner']),/fresh_action_authorization_required/);checks++;
  ok((await requireStaff(actionEvent,['owner'])).actorRole==='owner','exact action authorization succeeds');
  await assert.rejects(()=>requireStaff(actionEvent,['owner']),/fresh_action_authorization_required/);checks++;
  const ownerContext={client_id:'sc_prod_0ffa33db-cbe6-4985-b068-ac8398582ed8',agent_id:'agent_49a84ffe9474417885d19e4b1dab410f1734218fc37c444a9e',
    vault_id:'vault_107d569388134c558ebb932e2dcacff9ad46674d3bb44cb19b',nonce:'n'.repeat(43),code_challenge:'c'.repeat(43)};
  const owner=await step({owner_connect:ownerContext});ok(owner.res.ok,'fresh owner integration permission minted');
  const ownerPayload={user_id:actor,client_id:ownerContext.client_id,resource:'https://statecourse-ai-beta.netlify.app',ticket_hash:hash(owner.data.ownerTicket),context:ownerContext};
  const consume=async payload=>(await db.query('select public.statecourse_owner_oauth_authority($1,$2) r',['consume_owner_approval',payload])).rows[0].r;
  await assert.rejects(()=>consume(ownerPayload),/backend authentication failed/);checks++;
  await db.exec("set test.backend_key='server-only-test-key'");
  ok(!(await consume({...ownerPayload,user_id:other})).ok,'different OAuth identity cannot use owner ticket');
  const authority=await consume(ownerPayload);ok(authority.ok && authority.role==='owner' && authority.authority_source==='current_staff_actor_bindings','same server owner source accepted');
  ok(!(await consume(ownerPayload)).ok,'owner ticket replay denied');
  await db.exec('set role anon');
  await assert.rejects(()=>rpc('context',{user_id:actor,session_id:sid}),/permission denied/);checks++;
  await db.exec('reset role');
  const bucket={key:hash('test brute force'),limit:2};
  await rpc('rate',bucket);await rpc('rate',bucket);ok(!(await rpc('rate',bucket)).ok,'persistent limiter refuses excessive attempts');
  await db.exec('delete from statecourse_staff_private.rate_buckets');await step();
  const enroll=()=>securityHandler(new Request('https://statecourse.com/api/staff/security',{method:'POST',headers:{cookie:cookies,origin:'https://statecourse.com','content-type':'application/json'},body:JSON.stringify({action:'enroll_first_factor'})}));
  ok((await enroll()).status===403,'existing MFA cannot be bypassed through first-factor enrollment');
  await setRole(null);await db.exec('delete from auth.mfa_factors');factorStatus=null;
  ok((await enroll()).status===403,'student cannot use staff MFA enrollment');
  await setRole('owner');const enrollment=await enroll();ok(enrollment.ok,'current staff with recent password can begin first-factor setup');
  await assert.rejects(staff,/staff_step_up_required/);checks++;
  ok(!(await rpc('enrollment_check',{user_id:actor,session_id:other,factor_id:factor})).ok,'enrollment cannot cross sessions');
  ok((await step()).res.ok,'new factor requires actual OTP verification before proof minting');
  await db.exec('delete from auth.sessions');await assert.rejects(staff,/active_staff_session_required/);checks++;
  ok((await db.query("select * from statecourse_staff_private.audit_events where event='admin_action' and outcome='authorized'")).rows.length===1,'authorized action has durable audit event');
  ok(proofCookie('x').includes('HttpOnly; SameSite=Strict') && proofCookie('x').includes('Max-Age=900'),'privileged cookie has shorter lifecycle');
  console.log(`PASS: ${checks} isolated PostgreSQL + HTTP security checks`);
} finally {
  globalThis.fetch=originalFetch;
  for(const key of Object.keys(process.env))if(!(key in originalEnv))delete process.env[key];Object.assign(process.env,originalEnv);
  await db.close();
}
