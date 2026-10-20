import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite,installResultStore,connect} from './core-database.mjs';
import {PostgresResultStore} from '../store.mjs';
import {createReadOnlyApi} from '../api.mjs';
import {createBackgroundApi} from '../background.mjs';
import {IntegrationError,COURSE_ID} from '../contract.mjs';
import {snapshot,ACTOR,SESSION,ENROLLMENT,OTHER,ORGANIZATION,PROOF} from './fixtures.mjs';
import {executors} from './executors.mjs';
const ORIGIN='https://statecourse.invalid',KEY='66666666-6666-4666-8666-666666666666';
const context={organizationId:ORGANIZATION,actorId:ACTOR};
const scope={courseId:COURSE_ID,enrollmentId:ENROLLMENT};
const issue=()=>snapshot(t=>{t.access_grants=[];});
const headers={origin:ORIGIN,authorization:'Bearer fixture','x-statecourse-staff-proof':PROOF,'content-type':'application/json','idempotency-key':KEY};
const submit=()=>new Request(ORIGIN+'/v1/statecourse/observations',{method:'POST',headers,body:JSON.stringify(scope)});
const job=(runId,over={})=>new Request(ORIGIN+'/api/admin/core/background',{method:'POST',headers:{...headers,...over.headers},body:JSON.stringify(over.body??{runId})});
const config=store=>({enabled:true,allowedOrigin:ORIGIN,organizationId:ORGANIZATION,store,
 verifyAccessToken:async()=>({userId:ACTOR,sessionId:SESSION}),reader:{reauthorize:async()=>true,read:async()=>issue()},createExecutors:executors()});
async function fixture(work){const db=new PGlite();try{await installResultStore(db);await work(db,new PostgresResultStore({connect:connect(db),expectedDatabaseName:'template1'}));}finally{await db.close();}}
test('durable reserved submission returns 202; background captures evidence and saved GET delivers original Core result',()=>fixture(async(db,store)=>{
 let dispatched=0,sourceReads=0;
 const options=config(store),front=createReadOnlyApi({...options,reader:{...options.reader,read:async()=>{sourceReads++;return issue();}},dispatch:async({context,headers:forwarded})=>{
  dispatched++;assert.equal((await store.get(context)).run.status,'reserved');assert.equal(forwarded.get('authorization'),'Bearer fixture');
 }});
 const response=await front(submit());assert.equal(response.status,202);const body=await response.json();assert.equal(body.status,'reserved');assert.equal(dispatched,1);assert.equal(sourceReads,0);
 const worker=createBackgroundApi({...options,reader:{...options.reader,read:async()=>{sourceReads++;return issue();}}});
 const ran=await worker(job(body.runId));assert.equal(ran.status,200,await ran.clone().text());
 const saved=await store.get({...context,runId:body.runId});assert.equal(saved.result.status,'verified_observations');
 assert.deepEqual(saved.events.map(e=>e.kind),['reserved','captured','running','completed']);
 const get=new Request(ORIGIN+'/v1/statecourse/observations/'+body.runId,{headers});
 const result=await front(get);assert.equal(result.status,200);assert.equal((await result.json()).observations[0].verification,'accepted');
 assert.equal((await front(submit())).status,200);assert.equal(dispatched,1);assert.equal(sourceReads,1);
 const artifacts=(await db.query('select canonical_text from core_readonly.artifacts')).rows;
 assert.equal(artifacts.some(a=>a.canonical_text.includes(PROOF)||a.canonical_text.includes('Bearer fixture')),false,'never store auth credentials');
}));
test('delivery retry while running or completed cannot execute or interrupt the winning worker',()=>fixture(async(_db,store)=>{
 const options=config(store),front=createReadOnlyApi({...options,dispatch:async()=>{}});
 const id=(await (await front(submit())).json()).runId;let release,entered;const gate=new Promise(r=>{release=r;}),started=new Promise(r=>{entered=r;});let executions=0;
 const base=executors(),worker=createBackgroundApi({...options,createExecutors:async resolver=>{executions++;entered();await gate;return base(resolver);}});
 const first=worker(job(id));await started;
 assert.equal((await worker(job(id))).status,409);assert.equal((await store.get({...context,runId:id})).run.status,'running');assert.equal(executions,1);
 release();assert.equal((await first).status,200);assert.equal((await worker(job(id))).status,409);assert.equal(executions,1);
}));
test('unknown dispatch outcomes stay durable and are never automatically dispatched again',()=>fixture(async(_db,store)=>{
 let dispatches=0;const options=config(store),front=createReadOnlyApi({...options,dispatch:async()=>{dispatches++;throw new IntegrationError('background_dispatch_unconfirmed',503);}});
 const response=await front(submit());assert.equal(response.status,503);const body=await response.json();assert.ok(body.runId);
 assert.equal((await store.get({...context,runId:body.runId})).run.status,'reserved');
 assert.equal((await front(submit())).status,409);assert.equal(dispatches,1);
 const worker=createBackgroundApi(options);assert.equal((await worker(job(body.runId))).status,200,'a delayed original delivery may claim once');
 assert.equal((await worker(job(body.runId))).status,409);
}));
test('source revocation, cross-actor/org access, forged authority, bad proof and wrong origin fail before execution',()=>fixture(async(_db,store)=>{
 const options=config(store),front=createReadOnlyApi({...options,dispatch:async()=>{}}),id=(await (await front(submit())).json()).runId;
 let executions=0;const execute=async()=>{executions++;throw Error('must not run');};
 const actor=createBackgroundApi({...options,createExecutors:execute,verifyAccessToken:async()=>({userId:OTHER,sessionId:SESSION})});assert.equal((await actor(job(id))).status,404);
 const tenant=createBackgroundApi({...options,organizationId:OTHER,createExecutors:execute});assert.equal((await tenant(job(id))).status,404);
 const revoked=createBackgroundApi({...options,createExecutors:execute,reader:{reauthorize:async()=>{throw new IntegrationError('staff_scope_or_session_denied',403);}}});assert.equal((await revoked(job(id))).status,403);
 const worker=createBackgroundApi({...options,createExecutors:execute});
 assert.equal((await worker(job(id,{body:{runId:id,actorId:ACTOR}}))).status,400);
 assert.equal((await worker(job(id,{headers:{'x-statecourse-staff-proof':''}}))).status,401);
 assert.equal((await worker(job(id,{headers:{origin:'https://attacker.invalid'}}))).status,403);
 assert.equal((await worker(job(id,{body:{runId:id,padding:'x'.repeat(1500)}}))).status,413);
 assert.equal((await store.get({...context,runId:id})).run.status,'reserved');assert.equal(executions,0);
}));
test('provider failure is held; retries do not repeat an unknown outcome',()=>fixture(async(_db,store)=>{
 const options=config(store),front=createReadOnlyApi({...options,dispatch:async()=>{}}),id=(await (await front(submit())).json()).runId;let executions=0;
 const worker=createBackgroundApi({...options,createExecutors:async()=>{executions++;throw Error('unknown provider outcome');}});
 assert.equal((await worker(job(id))).status,503);assert.equal((await store.get({...context,runId:id})).run.status,'interrupted');
 assert.equal((await worker(job(id))).status,409);assert.equal(executions,1);
}));

test('an uncertain dispatch cannot interrupt a worker that already claimed the run',()=>fixture(async(_db,store)=>{
 let release,entered,working;const gate=new Promise(r=>{release=r;}),started=new Promise(r=>{entered=r;});
 const options=config(store),base=executors();
 const worker=createBackgroundApi({...options,createExecutors:async resolver=>{entered();await gate;return base(resolver);}});
 const front=createReadOnlyApi({...options,dispatch:async({context})=>{working=worker(job(context.runId));await started;throw new IntegrationError('background_dispatch_unconfirmed',503);}});
 const response=await front(submit());assert.equal(response.status,503);const {runId}=await response.json();
 assert.equal((await store.get({...context,runId})).run.status,'running');
 release();assert.equal((await working).status,200);assert.equal((await store.get({...context,runId})).run.status,'completed');
}));
test('revocation after the atomic claim prevents execution and preserves an interrupted hold',()=>fixture(async(_db,store)=>{
 const options=config(store),front=createReadOnlyApi({...options,dispatch:async()=>{}}),runId=(await (await front(submit())).json()).runId;let checks=0,calls=0;
 const worker=createBackgroundApi({...options,reader:{...options.reader,reauthorize:async()=>{if(++checks===2)throw new IntegrationError('staff_scope_or_session_denied',403);}},createExecutors:async()=>{calls++;throw Error('must not run');}});
 assert.equal((await worker(job(runId))).status,403);assert.equal((await store.get({...context,runId})).run.status,'interrupted');assert.equal(calls,0);
}));
test('cookie admission and background use actual source SQL; proof revocation prevents work and result delivery',async()=>{
 const {createSourceDatabase}=await import('./source-database.mjs');const {StateCourseReader}=await import('../adapter.mjs');
 const {createCookieBridge}=await import('../../server/bridge.mjs');const {createSupabaseVerifier}=await import('../auth.mjs');
 const source=await createSourceDatabase(),core=new PGlite();try {
  await installResultStore(core);await source.query('delete from access_grants');const before=(await source.query('select * from enrollments')).rows;
  const store=new PostgresResultStore({connect:connect(core),expectedDatabaseName:'template1'}),reader=new StateCourseReader({connect:connect(source)});
  const token='header.'+Buffer.from(JSON.stringify({sub:ACTOR,session_id:SESSION,aal:'aal2',exp:Math.floor(Date.now()/1000)+600})).toString('base64url')+'.signature';
  const verifyAccessToken=createSupabaseVerifier({url:'https://auth.invalid',publishableKey:'public-fixture',fetch:async(_url,options)=>{
   assert.equal(options.method,'GET');assert.equal(options.headers.authorization,'Bearer '+token);return Response.json({id:ACTOR});
  }});
  let dispatchedHeaders,executions=0;
  const factory=executors(),settings={enabled:true,allowedOrigin:ORIGIN,organizationId:ORGANIZATION,reader,verifyAccessToken,store,
   createExecutors:async resolver=>{executions++;return factory(resolver);}};
  const front=createCookieBridge({enabled:true,allowedOrigin:ORIGIN,handleCore:createReadOnlyApi({...settings,dispatch:async({headers})=>{dispatchedHeaders=new Headers(headers);}})});
  const cookieHeaders={origin:ORIGIN,cookie:`__Host-sc_access=${token}; __Host-sc_staff=${PROOF}`,'content-type':'application/json','idempotency-key':KEY};
  const submitRequest=key=>new Request(ORIGIN+'/api/admin/core/observations',{method:'POST',headers:{...cookieHeaders,'idempotency-key':key},body:JSON.stringify(scope)});
  const first=await front(submitRequest(KEY));assert.equal(first.status,202,await first.clone().text());const firstId=(await first.json()).runId;
  const worker=createBackgroundApi(settings);const deliver=id=>new Request(ORIGIN+'/api/admin/core/background',{method:'POST',headers:dispatchedHeaders,body:JSON.stringify({runId:id})});
  assert.equal((await worker(deliver(firstId))).status,200);assert.equal(executions,1);
  const queued=await front(submitRequest(OTHER));assert.equal(queued.status,202);const nextId=(await queued.json()).runId;
  await source.query('delete from statecourse_staff_private.proofs');
  assert.equal((await worker(deliver(nextId))).status,403);assert.equal(executions,1);
  assert.equal((await front(new Request(ORIGIN+'/api/admin/core/observations/'+firstId,{headers:cookieHeaders}))).status,403);
  assert.deepEqual((await source.query('select * from enrollments')).rows,before);
  assert.equal((await store.get({...context,runId:nextId})).run.status,'reserved');
 }finally{await source.close();await core.close();}
});
