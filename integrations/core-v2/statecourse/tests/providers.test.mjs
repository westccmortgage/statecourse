import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite,installCore,installResultStore,connect} from './core-database.mjs';
import {ACTOR,SESSION,ENROLLMENT,ORGANIZATION,PROOF,snapshot} from './fixtures.mjs';
import {explainSnapshot,prepare} from '../engine.mjs';
import {createProviderRuntimeFactory} from '../providers.mjs';
import {PostgresResultStore} from '../store.mjs';
import {createReadOnlyApi} from '../api.mjs';
import {coreClient} from '../core-client.mjs';
import {DEMONSTRATION_CONFIG,DEMONSTRATION_ENVIRONMENT} from '../../upstream/workers/core-v2-runtime/providers/demonstration.ts';
import {LocalProviderTransport} from '../../upstream/workers/core-v2-runtime/providers/local-answers.ts';
import {TransportFault} from '../../upstream/workers/core-v2-runtime/transport/transport.ts';
import {closeTheNetwork} from '../../upstream/workers/core-v2/kernel/network-guard.ts';
const familyProviders={'reader-family-one':'anthropic','reader-family-two':'openai','critic-family-one':'google'};
const issue=()=>snapshot(t=>{t.access_grants=[];});
function wireAnswer(question) {
 const assignment=question.parts.find(p=>p.kind==='text' && p.text.includes('taskId: '))?.text??'';
 const get=name=>assignment.match(new RegExp('^'+name+': (.+)$','m'))?.[1];
 const lines=question.parts.filter(p=>p.kind==='text').flatMap(p=>p.text.split('\n'));
 const material=lines.find(line=>{try{return JSON.parse(line).rule;}catch{return false;}});
 if(!material)throw new Error('Material bytes did not reach the protocol');
 const observation=JSON.parse(material),segmentId=assignment.match(/^\s+segmentId: (\S+)$/m)?.[1];
 const env={packetVersion:get('packetVersion'),taskId:get('taskId'),roleKey:get('roleKey'),roleVersion:get('roleVersion'),outcome:'completed',
  claims:[],anchors:[{anchorKey:'record',sourceKind:'segment',sourceId:null,segmentId,locator:{},quotedText:material}],segments:[],assessments:[],disagreements:[],requestedActions:[],limitations:[],rawResponseReference:null,adjudication:null,decisions:[],calculations:[]};
 if(env.roleKey==='record_explainer') {
  assert.equal(assignment.includes('  claim '),false,'blind reader must not see another reading');
  env.claims.push({claimKey:'observation',subjectType:'observation',subjectKey:get('subject'),predicate:'observed_issue',value:{known:true,quantity:null,text:observation.explanation},unit:null,observationBasis:'observed',scope:{},anchorKeys:['record'],machineConfidence:null});
 } else {
  for(const ref of assignment.matchAll(/^  claim (\S+)$/gm)) env.assessments.push({claimRef:ref[1],assessment:'supports',reasonCode:'source_matches',explanation:'The captured material supports the exact observation.',proposedValue:null,proposedUnit:null,anchorKeys:['record']});
 }
 return env;
}
async function database() {
 const db=new PGlite();await installCore(db);await installResultStore(db);
 await db.query('insert into auth.users(id) values($1)',[ACTOR]);
 await db.query('insert into organizations(id,name) values($1,$2)',[ORGANIZATION,'Isolated integration fixture']);
 await db.query("insert into organization_members(organization_id,user_id,role) values($1,$2,'owner')",[ORGANIZATION,ACTOR]);return db;
}
function options(db,more={}) {return {config:structuredClone(DEMONSTRATION_CONFIG),familyProviders,connectCore:connect(db),expectedDatabaseName:'template1',
 environment:{...DEMONSTRATION_ENVIRONMENT,CORE_V2_ALLOW_PAID_CALLS:'true'},networkEnabled:true,...more};}
test('actual provider protocols + actual Core SQL ledger reserve/settle and persist independent evidence',async()=>{
 const db=await database();const guard=closeTheNetwork();
 try {
  const transport=new LocalProviderTransport({answer:wireAnswer});
  const checkedTransport={name:'checked-local-protocols',send:async request=>{
   const taskId=request.body.match(/taskId: ([0-9a-f-]+)/)?.[1];
   const held=(await db.query("select count(*)::int n from attempt_cost_reservations r join agent_attempts a on a.id=r.attempt_id where a.task_id=$1 and r.state='reserved'",[taskId])).rows[0].n;
   assert.equal(held,1,'the exact attempt must hold its durable reservation before transport submission');
   return transport.send(request);
  }};
  const factory=createProviderRuntimeFactory(options(db,{transportFactory:()=>checkedTransport}));
  const api=createReadOnlyApi({enabled:true,allowedOrigin:'https://statecourse.invalid',organizationId:ORGANIZATION,createRuntime:factory,
   store:new PostgresResultStore({connect:connect(db),expectedDatabaseName:'template1'}),verifyAccessToken:async()=>({userId:ACTOR,sessionId:SESSION}),
   reader:{read:async()=>issue(),reauthorize:async()=>true}});
  const response=await api(new Request('https://core.invalid/v1/statecourse/observations',{method:'POST',headers:{origin:'https://statecourse.invalid',authorization:'Bearer fixture','x-statecourse-staff-proof':PROOF,'content-type':'application/json','idempotency-key':ENROLLMENT},body:JSON.stringify(issue().scope)}));
  assert.equal(response.status,200,await response.clone().text());const result=await response.json();
  assert.equal(result.status,'verified_observations',JSON.stringify(result.trace));assert.equal(transport.sent.length,3);
  assert.equal(new Set(transport.questions.map(q=>q.providerId)).size,3);
  const budget=(await db.query('select reserved,settled from workflow_cost_budgets where workflow_id=$1',[result.workflowId])).rows[0];
  assert.equal(Number(budget.reserved),0);assert.ok(Number(budget.settled)>0);
  const reservations=(await db.query('select state,price_basis from attempt_cost_reservations where workflow_id=$1',[result.workflowId])).rows;
  assert.equal(reservations.length,3);assert.ok(reservations.every(r=>r.state==='settled' && r.price_basis));
  const persisted=(await db.query("select count(*)::int n from evidence_claims where workflow_id=$1 and predicate='observed_issue' and status='accepted'",[result.workflowId])).rows[0].n;
  assert.ok(persisted>0);assert.equal(persisted,result.trace.claims.filter(c=>c.status==='accepted').length);
  assert.equal(result.trace.claims.length,2,'both independent readings must persist');
  assert.equal((await db.query("select count(*)::int n from core_readonly.artifacts where run_id=$1",[result.workflowId])).rows[0].n,2);
  const second=await api(new Request('https://core.invalid/v1/statecourse/observations',{method:'POST',headers:{origin:'https://statecourse.invalid',authorization:'Bearer fixture','x-statecourse-staff-proof':PROOF,'content-type':'application/json','idempotency-key':ACTOR},body:JSON.stringify(issue().scope)}));
  assert.equal(second.status,200,await second.clone().text());
  const next=await second.json();assert.notEqual(next.workflowId,result.workflowId);assert.equal(next.status,'verified_observations');
  assert.equal(transport.sent.length,6,'distinct explicitly requested runs may share identical captured material');
  assert.equal(guard.tripped(),0);
 } finally {await db.close();}
});
test('disabled network, missing keys, missing prices and aliased providers refuse before SQL/network',async()=>{
 const world=prepare(issue(),ORGANIZATION);let connections=0;
 const base={...options(null),connectCore:async()=>{connections++;throw new Error('must not connect');}};
 const disabled=createProviderRuntimeFactory({...base,networkEnabled:false});await assert.rejects(()=>disabled(world),/network_disabled/);
 const noKey=createProviderRuntimeFactory({...base,environment:{CORE_V2_ALLOW_PAID_CALLS:'true'}});await assert.rejects(()=>noKey(world),/credentials_required/);
 const aliased=createProviderRuntimeFactory({...base,familyProviders:{...familyProviders,'critic-family-one':'openai'}});await assert.rejects(()=>aliased(world),/independent/);
 const noPrices=createProviderRuntimeFactory({...base,config:{...base.config,pricing:[]}});await assert.rejects(()=>noPrices(world),/pricing_required/);
 assert.equal(connections,0);
});
test('Core SQL client serializes whole transactions and normalizes typed driver values',async()=>{
 const db=new PGlite();try {
  const client=await coreClient(await connect(db)(),'template1');await client.query('create table fixture_values(id int primary key,value int)');
  await Promise.all(Array.from({length:5},(_,id)=>client.transaction(async tx=>{await tx.query('insert into fixture_values values($1,$2)',[id,1]);await tx.query('update fixture_values set value=value+1 where id=$1',[id]);})));
  const rows=(await client.query('select value,true flag,jsonb_build_object(\'a\',1) object from fixture_values order by id')).rows;
  assert.equal(rows.length,5);assert.ok(rows.every(r=>r.value==='2' && r.flag==='t' && r.object==='{"a":1}'));
  await assert.rejects(()=>client.transaction(async tx=>{await tx.query('insert into fixture_values values(99,9)');throw new Error('fixture rollback');}),/rollback/);
  assert.equal((await client.query('select * from fixture_values where id=99')).rows.length,0);await client.close();
 } finally {await db.close();}
});
test('unknown provider submission retains budget holds and does not retry the transport',async()=>{
 const db=await database();try {
  let sent=0;
  const factory=createProviderRuntimeFactory(options(db,{transportFactory:()=>({name:'unknown-fixture',send:async()=>{sent++;throw new TransportFault('fixture response lost',false);}})}));
  const result=await explainSnapshot(issue(),{organizationId:ORGANIZATION,createRuntime:factory});
  assert.equal(result.status,'needs_human_review');assert.equal(sent,2);
  const rows=(await db.query("select state from attempt_cost_reservations where workflow_id=$1",[result.workflowId])).rows;
  assert.equal(rows.length,2);assert.ok(rows.every(r=>r.state==='reserved'));
  assert.equal((await db.query("select count(*)::int n from agent_attempts where workflow_id=$1 and state='outcome_unknown'",[result.workflowId])).rows[0].n,2);
 } finally {await db.close();}
});
test('insufficient durable budget blocks transport before any request can be sent',async()=>{
 const db=await database();try {
  let sent=0;const config=structuredClone(DEMONSTRATION_CONFIG);config.authorization.maximumAuthorizedCost=0.000001;
  const factory=createProviderRuntimeFactory(options(db,{config,transportFactory:()=>({name:'budget-fixture',send:async()=>{sent++;throw new Error('budget bypass');}})}));
  const result=await explainSnapshot(issue(),{organizationId:ORGANIZATION,createRuntime:factory});
  assert.equal(sent,0);assert.equal(result.status,'needs_human_review');
  assert.equal((await db.query('select count(*)::int n from attempt_cost_reservations where workflow_id=$1',[result.workflowId])).rows[0].n,0);
 } finally {await db.close();}
});
test('actual StateCourse SQL/MFA → isolated durable Core/provider pipeline → revoked-session denial',async()=>{
 const {createSourceDatabase}=await import('./source-database.mjs');
 const {StateCourseReader}=await import('../adapter.mjs');
 const source=await createSourceDatabase(),db=await database();
 try {
  await source.query("update access_grants set status='revoked',revoked_at=now() where enrollment_id=$1",[ENROLLMENT]);
  const before=(await source.query('select to_jsonb(e) body from enrollments e order by id')).rows;
  const transport=new LocalProviderTransport({answer:wireAnswer});
  const api=createReadOnlyApi({enabled:true,allowedOrigin:'https://statecourse.invalid',organizationId:ORGANIZATION,
   store:new PostgresResultStore({connect:connect(db),expectedDatabaseName:'template1'}),
   reader:new StateCourseReader({connect:connect(source)}),verifyAccessToken:async()=>({userId:ACTOR,sessionId:SESSION}),
   createRuntime:createProviderRuntimeFactory(options(db,{transportFactory:()=>transport}))});
  const headers={origin:'https://statecourse.invalid',authorization:'Bearer fixture','x-statecourse-staff-proof':PROOF,'content-type':'application/json','idempotency-key':ACTOR};
  const response=await api(new Request('https://core.invalid/v1/statecourse/observations',{method:'POST',headers,body:JSON.stringify({courseId:'ca-real-estate-principles-45',enrollmentId:ENROLLMENT})}));
  assert.equal(response.status,200,await response.clone().text());const result=await response.json();
  assert.equal(result.status,'verified_observations');assert.equal(result.observations[0].code,'active_access_missing');
  assert.equal(result.observations[0].evidence[1].table,'access_grants');assert.equal(transport.sent.length,3);
  assert.deepEqual((await source.query('select to_jsonb(e) body from enrollments e order by id')).rows,before);
  const wrongWriter=createReadOnlyApi({enabled:true,allowedOrigin:'https://statecourse.invalid',organizationId:ORGANIZATION,
   store:new PostgresResultStore({connect:connect(db),expectedDatabaseName:'template1'}),reader:new StateCourseReader({connect:connect(source)}),
   verifyAccessToken:async()=>({userId:ACTOR,sessionId:SESSION}),
   createRuntime:createProviderRuntimeFactory(options(db,{connectCore:connect(source),transportFactory:()=>transport}))});
  const refused=await wrongWriter(new Request('https://core.invalid/v1/statecourse/observations',{method:'POST',headers:{...headers,'idempotency-key':SESSION},body:JSON.stringify(result.scope)}));
  assert.equal(refused.status,503);assert.equal((await refused.json()).error,'core_storage_target_refused');
  assert.equal(transport.sent.length,3);assert.deepEqual((await source.query('select to_jsonb(e) body from enrollments e order by id')).rows,before);
  await source.query('update statecourse_staff_private.proofs set revoked_at=now()');
  const revoked=await api(new Request('https://core.invalid/v1/statecourse/observations/'+result.persistence.runId,{headers}));
  assert.equal(revoked.status,403);assert.equal(transport.sent.length,3);
 }finally {await source.close();await db.close();}
});
