import test from 'node:test';
import assert from 'node:assert/strict';
import {createCookieBridge,BRIDGE_PATH} from '../../server/bridge.mjs';
import {createDatabaseConnections} from '../../server/database.mjs';
import {createServerApplication} from '../../server/application.mjs';
import {createHttpServer} from '../../server/http.mjs';
import {createReadOnlyApi} from '../api.mjs';
import {StateCourseReader} from '../adapter.mjs';
import {PostgresResultStore} from '../store.mjs';
import {createSupabaseVerifier} from '../auth.mjs';
import {PGlite,installResultStore,connect} from './core-database.mjs';
import {createSourceDatabase} from './source-database.mjs';
import {executors} from './executors.mjs';
import {ACTOR,SESSION,ENROLLMENT,ORGANIZATION,PROOF} from './fixtures.mjs';
import {COURSE_ID} from '../contract.mjs';
const ORIGIN='https://statecourse.invalid';
const TOKEN='eyJhbGciOiJmaXh0dXJlIn0.'+Buffer.from(JSON.stringify({sub:ACTOR,session_id:SESSION,aal:'aal2',exp:Math.floor(Date.now()/1000)+600})).toString('base64url')+'.fixture';
const COOKIE=`__Host-sc_access=${TOKEN}; __Host-sc_staff=${PROOF}`;
const scope={courseId:COURSE_ID,enrollmentId:ENROLLMENT};
const KEY='66666666-6666-4666-8666-666666666666';
function request(path='',headers={},method='POST') {return new Request(ORIGIN+BRIDGE_PATH+path,{method,headers:{origin:ORIGIN,cookie:COOKIE,'content-type':'application/json','idempotency-key':KEY,...headers},...(method==='POST'?{body:JSON.stringify(scope)}:{})});}
test('cookie bridge discards supplied identity, routes only fixed scope, fails closed before Core',async()=>{
 let calls=0;
 const bridge=createCookieBridge({enabled:true,allowedOrigin:ORIGIN,handleCore:async req=>{
  calls++;assert.equal(new URL(req.url).pathname,'/v1/statecourse/observations');
  assert.equal(req.headers.get('authorization'),'Bearer '+TOKEN);assert.equal(req.headers.get('x-statecourse-staff-proof'),PROOF);
  assert.equal(req.headers.get('cookie'),null);assert.equal(req.headers.get('x-actor-id'),null);
  assert.deepEqual(await req.json(),scope);return Response.json({ok:true});
 }});
 assert.equal((await bridge(request('',{authorization:'Bearer forged','x-statecourse-staff-proof':'forged','x-actor-id':'forged'}))).status,200);
 for(const [headers,status] of [[{cookie:''},401],[{cookie:COOKIE+'; __Host-sc_staff='+PROOF},401],[{cookie:COOKIE+'; __Host-sc_access='+TOKEN},401],[{origin:'https://attacker.invalid'},403],[{'sec-fetch-site':'cross-site'},403],[{origin:''},403]])assert.equal((await bridge(request('',headers))).status,status);
 assert.equal((await bridge(request('?sql=drop'))).status,404);
 assert.equal((await bridge(request('/not-a-run'))).status,404);
 assert.equal((await bridge(request('',{},'GET'))).status,405);
 assert.equal(calls,1);
 const disabled=createCookieBridge({allowedOrigin:ORIGIN,handleCore:()=>assert.fail()});assert.equal((await disabled(request())).status,503);
});
test('database connector requires separate explicit TLS targets and destroys failed leases',async()=>{
 const configs=[];let opens=0,destroyed=0;
 class Pool {constructor(config){configs.push(config);this.config=config;}on(){} async end(){} async connect(){opens++;return {query:async()=>({rows:[{database_name:this.config.database,source_present:this.config.host==='source.invalid'}]}),release:destroy=>{assert.equal(destroy,true);destroyed++;}};}}
 const config={Pool,sourceUrl:'postgres://reader:fixture@source.invalid/source',sourceDatabase:'source',coreUrl:'postgres://writer:fixture@core.invalid/core',coreDatabase:'core'};
 const db=createDatabaseConnections(config);assert.equal(opens,0);
 for(const c of configs){assert.deepEqual(c.ssl,{rejectUnauthorized:true});assert.equal(c.max,4);assert.equal(c.connectionTimeoutMillis,5000);}
 assert.equal(configs[0].options,'-c default_transaction_read_only=on');assert.equal(configs[1].options,undefined);
 await(await db.connectSource()).release();await(await db.connectCore()).release();assert.equal(destroyed,2);await db.close();
 assert.throws(()=>createDatabaseConnections({...config,coreUrl:'postgres://other:fixture@source.invalid/source',coreDatabase:'source'}),/separate_core/);
 for(const url of ['postgres://reader:fixture@source.invalid/source?sslmode=disable','http://source.invalid/source','postgres://reader@source.invalid/source'])assert.throws(()=>createDatabaseConnections({...config,sourceUrl:url}),/configuration_required/);
 const wrong=createDatabaseConnections({...config,coreUrl:'postgres://writer:fixture@source.invalid/core'});
 await assert.rejects(()=>wrong.connectCore(),/database_connection_unavailable/);assert.equal(destroyed,3);await wrong.close();
});
test('disabled server does not construct pools, read secrets or call auth/providers',async()=>{
 const environment=new Proxy({CORE_V2_BRIDGE_ENABLED:'false'},{get:(obj,key)=>{if(key!=='CORE_V2_BRIDGE_ENABLED')assert.fail('disabled configuration was accessed');return obj[key];}});
 const app=createServerApplication({environment,Pool:class{constructor(){assert.fail();}},fetch:()=>assert.fail()});
 assert.equal((await app.handle(request())).status,503);await app.close();
});
test('actual source SQL through cookie bridge persists evidence in isolated Core and denies revoked proof',async()=>{
 const source=await createSourceDatabase(),core=new PGlite();try {
  await installResultStore(core);
  const auth=createSupabaseVerifier({url:'https://auth.invalid',publishableKey:'public-fixture',fetch:async(url,options)=>{
   assert.equal(url.pathname,'/auth/v1/user');assert.equal(options.method,'GET');assert.equal(options.headers.authorization,'Bearer '+TOKEN);
   return Response.json({id:ACTOR,email_confirmed_at:'2026-01-01T00:00:00Z'});
  }});
  let calls=0;const factory=executors();
  const api=createReadOnlyApi({enabled:true,allowedOrigin:ORIGIN,organizationId:ORGANIZATION,verifyAccessToken:auth,
   reader:new StateCourseReader({connect:connect(source)}),store:new PostgresResultStore({connect:connect(core),expectedDatabaseName:'template1'}),
   createExecutors:async r=>{calls++;return factory(r);}});
  const bridge=createCookieBridge({enabled:true,allowedOrigin:ORIGIN,handleCore:api});
  // Ensure an evidence-backed candidate without altering any remote data.
  await source.query('delete from access_grants');
  const before=await source.query('select * from enrollments');
  const reply=await bridge(request());assert.equal(reply.status,200,await reply.clone().text());
  const body=await reply.json();assert.ok(body.persistence.resultHash);assert.ok(body.observations.length);assert.equal(calls,1);
  assert.deepEqual((await source.query('select * from enrollments')).rows,before.rows);
  const saved=await bridge(request('/'+body.persistence.runId,{},'GET'));assert.equal(saved.status,200);assert.equal((await saved.json()).persistence.resultHash,body.persistence.resultHash);
  assert.equal((await bridge(request())).status,200);assert.equal(calls,1);
  await source.query('delete from statecourse_staff_private.proofs');
  assert.equal((await bridge(request('/'+body.persistence.runId,{},'GET'))).status,403);
 }finally{await source.close();await core.close();}
});
test('server assembly keeps provider gate shut with actual source/Core SQL adapters',async()=>{
 const source=await createSourceDatabase(),core=new PGlite();try {
  await installResultStore(core);await source.query('delete from access_grants');
  let connections=0;
  class Pool {constructor(c){this.db=c.host==='source.invalid'?source:core;}on(){}async end(){}async connect(){connections++;const db=this.db;return {query:(sql,p)=>db.query(sql,p),release:()=>{}};}}
  const app=createServerApplication({Pool,environment:{CORE_V2_BRIDGE_ENABLED:'true',STATECOURSE_ORIGIN:ORIGIN,SUPABASE_URL:'https://auth.invalid',SUPABASE_ANON_KEY:'public-fixture',
   STATECOURSE_READ_DATABASE_URL:'postgres://reader:fixture@source.invalid/template1',STATECOURSE_DATABASE_NAME:'template1',CORE_DATABASE_URL:'postgres://writer:fixture@core.invalid/template1',CORE_DATABASE_NAME:'template1',CORE_ORGANIZATION_ID:ORGANIZATION},
   fetch:async()=>Response.json({id:ACTOR,email_confirmed_at:'2026-01-01T00:00:00Z'})});
  assert.equal(connections,0);const reply=await app.handle(request());assert.equal(reply.status,503);assert.equal((await reply.json()).error,'provider_network_disabled');
  assert.ok(connections>0);assert.equal((await core.query('select status from core_readonly.runs')).rows[0].status,'interrupted');await app.close();
 }finally{await source.close();await core.close();}
});
test('loopback HTTP adapter executes real requests with safe errors and no credentials in responses',async()=>{
 const app=createServerApplication({environment:{CORE_V2_BRIDGE_ENABLED:'false'}});
 const server=createHttpServer({handle:app.handle,allowedOrigin:ORIGIN});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {const reply=await fetch(`http://127.0.0.1:${server.address().port}${BRIDGE_PATH}`,{headers:{cookie:COOKIE}});assert.equal(reply.status,503);assert.equal(await reply.text(),'{"error":"integration_disabled"}');assert.equal(reply.headers.get('set-cookie'),null);assert.equal(reply.headers.get('access-control-allow-origin'),null);}
 finally{await new Promise(resolve=>server.close(resolve));await app.close();}
});
test('real pg driver refuses a PostgreSQL endpoint that declines TLS before sending credentials',async()=>{
 const {createServer}=await import('node:net');
 const {default:pg}=await import('../../server/node_modules/pg/lib/index.js');
 let packets=0;
 const endpoint=createServer(socket=>{socket.once('data',packet=>{
  packets++;assert.equal(packet.length,8);assert.equal(packet.readInt32BE(4),80877103);socket.end('N');
 });});
 await new Promise((resolve,reject)=>{endpoint.once('error',reject);endpoint.listen(0,'127.0.0.1',resolve);});
 const db=createDatabaseConnections({Pool:pg.Pool,sourceUrl:`postgres://reader:fixture@127.0.0.1:${endpoint.address().port}/source`,sourceDatabase:'source',coreUrl:'postgres://writer:fixture@core.invalid/core',coreDatabase:'core'});
 try {await assert.rejects(()=>db.connectSource(),/database_connection_unavailable/);assert.equal(packets,1);}
 finally{await db.close();await new Promise(resolve=>endpoint.close(resolve));}
});
