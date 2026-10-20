import { STAFF_COOKIE as CURRENT_TEST_COOKIE } from './fixtures/admin-console/harness.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createStore, withConsoleMock, STAFF_ID, ENROLLMENT_ID } from './fixtures/admin-console/harness.mjs';
import { NMLS_TRAINING_COURSE as identity } from '../config/nmls-course-identity.mjs';
import { nmlsTrainingDefinition } from '../config/nmls-training-definition.mjs';
import { trainingReadiness, verifiedTrainingReadiness } from '../netlify/functions/_lib/training-readiness.mjs';
import { availableTraining, ensureTrainingEnrollment } from '../netlify/functions/_lib/training-access.mjs';
import { withNmlsTrainingSummary } from '../netlify/functions/_lib/nmls-training-portal.mjs';
import { executeNmlsTraining } from '../netlify/functions/_lib/nmls-training-service.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import enrollHandler, { config as enrollConfig } from '../netlify/functions/enroll-training.mts';
import portalHandler, { config as portalConfig } from '../netlify/functions/student-portal.mts';
import { studentJsonRequest } from '../netlify/functions/_lib/student-json-adapter.mjs';

const course={id:identity.id,state:identity.state,name:identity.title,current_version:identity.version,product_type:identity.productType};
const enrollment={id:ENROLLMENT_ID,student_id:STAFF_ID,course_id:identity.id,state:identity.state,course_version:identity.version,
  enrollment_origin:'training',status:'active',compliance_credit_eligible:false,checkout_attempt_id:null,completed_at:null,expires_at:null};
const definition=nmlsTrainingDefinition();
const governance={offering_id:identity.id,offering_kind:'course',state:identity.state,discipline:identity.discipline,training_access_enabled:true};
const row={enrollment_id:ENROLLMENT_ID,student_id:STAFF_ID,course_id:identity.id,state:identity.state,course_version:identity.version,enrollment_origin:'training',enrollment_status:'active',access_status:'active'};
const context=()=>({enrollmentId:ENROLLMENT_ID,studentId:STAFF_ID,courseId:identity.id,courseVersion:identity.version,
  contentDigest:definition.content_digest,definitionDigest:definition.definition_digest,reviewRole:null,revision:0,runtime:null,event:null,serverTimeMs:Date.UTC(2026,8,13)});
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});

async function fixture(run,options={}) {
  return withConsoleMock(createStore({courses:[course]}),async()=>{
    const fallback=globalThis.fetch,calls=[];
    globalThis.fetch=async(input,init={})=>{
      const url=new URL(input),name=url.pathname.replace('/rest/v1/',''),body=init.body?JSON.parse(init.body):null;
      calls.push({name,method:init.method||'GET',body});
      if(name==='offering_public_status')return json(options.governance||[governance]);
      if(name==='rpc/nmls_training_definition')return options.unavailable?json({message:'missing runtime SECRET'},404):json(options.definition===undefined?definition:options.definition);
      if(name==='rpc/nmls_training_enroll')return options.revoked?json({message:'nmls_training_access_denied'},403):json(options.result||{enrollment,existing:true});
      if(name==='rpc/nmls_training_context')return options.contextUnavailable?json({message:'SECRET'},503):json(options.context||context());
      if(name==='student_portal_enrollments')return json([row]);
      if(name==='enrollments')return json([{id:ENROLLMENT_ID,enrollment_origin:'training'}]);
      if(name==='student_portal_events')return json(null);
      return fallback(input,init);
    };
    try{return await run(calls);}finally{globalThis.fetch=fallback;}
  });
}
const request=(body={courseId:identity.id},headers={})=>new Request('https://statecourse.test/api/enroll/training',{method:'POST',headers:{
  origin:'https://statecourse.test','content-type':'application/json',cookie:CURRENT_TEST_COOKIE,...headers},body:JSON.stringify(body)});

test('NMLS readiness requires an exact real source manifest, not just a matching label',async()=>fixture(async calls=>{
  assert.equal(trainingReadiness(identity.id).ready,false);
  assert.deepEqual(await verifiedTrainingReadiness(identity.id),{ready:true,reason:null});
  assert.deepEqual(calls.at(-1).body,{p_course_id:identity.id});
  assert.equal(definition.manifest.modules.length,8);assert.equal(definition.manifest.modules.flatMap(m=>m.units).length,45);
}));
test('missing NMLS definition fails closed and performs no enrollment write',async()=>fixture(async calls=>{
  assert.equal((await verifiedTrainingReadiness(identity.id)).reason,'nmls_training_database_runtime_unavailable');
  await assert.rejects(()=>ensureTrainingEnrollment(STAFF_ID,course),/nmls_training_database_runtime_unavailable/);
  assert.equal(calls.some(c=>c.name==='rpc/nmls_training_enroll'),false);
},{unavailable:true}));
test('every database pin, timing, source and course version is compared',async()=>{
  for(const change of [d=>d.course_version='1.0',d=>d.content_digest='0'.repeat(64),d=>d.definition_digest='0'.repeat(64),
    d=>d.manifest.modules[0].units[0].requiredSeconds=1,d=>d.manifest.sourceFiles[0].sha256='0'.repeat(64),d=>d.manifest.creditEligible=true]){
    const altered=structuredClone(definition);change(altered);
    await fixture(async()=>assert.equal((await verifiedTrainingReadiness(identity.id)).reason,'nmls_training_database_definition_mismatch'),{definition:altered});
  }
});
test('NMLS discovery needs the exact unambiguous US mortgage governance',async()=>{
  await fixture(async()=>assert.deepEqual((await availableTraining()).courses,[{id:identity.id,state:'US',name:identity.title,discipline:'mortgage',publicId:identity.id}]));
  for(const rows of [[{...governance,state:'CA'}],[{...governance,discipline:'real_estate'}],[governance,governance],[{...governance,training_access_enabled:false}]])
    await fixture(async()=>assert.deepEqual((await availableTraining()).courses,[]),{governance:rows});
});
test('NMLS enrollment uses only the atomic training RPC and preserves its existing row',async()=>fixture(async calls=>{
  const result=await ensureTrainingEnrollment(STAFF_ID,course);
  assert.deepEqual(result,{enrollment,existing:true});
  assert.deepEqual(calls.map(c=>c.name),['rpc/nmls_training_definition','rpc/nmls_training_enroll']);
  assert.deepEqual(calls.at(-1).body,{p_student_id:STAFF_ID});
  assert.equal(calls.some(c=>/california|initialize_training|compliance|checkout|payment/.test(c.name)),false);
}));
test('wrong course identity or returned privileged/foreign enrollment cannot become free access',async()=>{
  for(const patch of [{state:'CA'},{current_version:'1.0'},{product_type:'real_estate_prelicense'}])await fixture(async calls=>{
    await assert.rejects(()=>ensureTrainingEnrollment(STAFF_ID,{...course,...patch}),/identity_mismatch/);
    assert.equal(calls.some(c=>c.name==='rpc/nmls_training_enroll'),false);
  });
  for(const patch of [{student_id:randomUUID()},{course_id:'ca-real-estate-principles-45'},{state:'CA'},{course_version:'1.0'},
    {compliance_credit_eligible:true},{checkout_attempt_id:randomUUID()},{enrollment_origin:'purchase'},{status:'revoked'},
    {completed_at:new Date().toISOString()},{expires_at:'2020-01-01'},{expires_at:'invalid'},{id:'invalid'}])
    await fixture(async()=>assert.rejects(()=>ensureTrainingEnrollment(STAFF_ID,course),/nmls_training_enrollment_unavailable/),{result:{enrollment:{...enrollment,...patch},existing:true}});
});
test('revocation fails without any grant restoration or secondary write',async()=>fixture(async calls=>{
  await assert.rejects(()=>ensureTrainingEnrollment(STAFF_ID,course),/access_denied/);
  assert.deepEqual(calls.map(c=>c.name),['rpc/nmls_training_definition','rpc/nmls_training_enroll']);
},{revoked:true}));
test('revoked access is a forbidden enrollment response and never exposes raw database errors',async()=>fixture(async()=>{
  const response=await enrollHandler(request());assert.equal(response.status,403);
  assert.deepEqual(await response.json(),{error:'nmls_training_access_denied'});
},{revoked:true}));
test('real authenticated enrollment HTTP returns an in-course path and no payment or credit',async()=>fixture(async calls=>{
  const response=await enrollHandler(request()),body=await response.json();
  assert.equal(response.status,200);assert.equal(body.href,`/student/nmls-training/?enrollment_id=${ENROLLMENT_ID}`);
  assert.equal(body.creditEligible,false);assert.equal(body.paidNothing,true);assert.equal(body.representation,'training_only');
  assert.ok(enrollConfig.path.includes('/api/enroll/training'));assert.ok(enrollConfig.path.includes('/.netlify/functions/enroll-training'));
  assert.equal(calls.some(c=>/checkout|stripe|payments|california|lms_compliance/.test(c.name)),false);
  assert.equal(response.headers.get('cache-control'),'no-store, private');
}));
test('enrollment rejects cross-discipline/duplicate governance before atomic creation',async()=>{
  for(const rows of [[{...governance,state:'CA'}],[{...governance,discipline:'real_estate'}],[governance,governance]])await fixture(async calls=>{
    assert.equal((await enrollHandler(request())).status,403);assert.equal(calls.some(c=>c.name==='rpc/nmls_training_enroll'),false);
  },{governance:rows});
});
test('authentication is mandatory and browser-supplied student identity cannot replace the session actor',async()=>fixture(async calls=>{
  assert.equal((await enrollHandler(request(undefined,{cookie:''}))).status,401);
  assert.equal(calls.some(c=>c.name.startsWith('rpc/')),false);
  const response=await enrollHandler(request({courseId:identity.id,studentId:randomUUID(),compliance_credit_eligible:true}));
  assert.equal(response.status,200);assert.deepEqual(calls.find(c=>c.name==='rpc/nmls_training_enroll').body,{p_student_id:STAFF_ID});
  assert.equal((await response.json()).creditEligible,false);
}));
test('student portal projects real zero-progress NMLS context with 45 lessons and no raw runtime',async()=>fixture(async calls=>{
  const response=await portalHandler(new Request('https://statecourse.test/api/student/portal',{headers:{cookie:CURRENT_TEST_COOKIE}}));
  assert.equal(response.status,200);const item=(await response.json()).enrollments[0];
  assert.equal(item.assignment_count,45);assert.equal(item.assignments_completed,0);assert.equal(item.training_phase,'not_started');
  assert.equal(item.training_completed,false);assert.equal(item.nmls_training.available,true);assert.equal(item.completed_at,null);
  assert.equal(item.regulatory_credit_status,'not_applicable');assert.equal(item.portal_certificate_status,'not_applicable');
  assert.doesNotMatch(JSON.stringify(item),/correctChoice|sourcePayloadDigest|definitionDigest|"answers"|"runtime"|unit_action/);
  assert.ok(portalConfig.path.includes('/api/student/portal'));
  assert.equal(calls.some(c=>c.name==='rpc/nmls_training_commit'),false);
}));
test('missing/denied/wrong-owner progress is unavailable, never a false empty course',async()=>{
  for(const get of [async()=>{throw Error('unavailable SECRET');},async()=>({...context(),studentId:randomUUID()}),async()=>({...context(),contentDigest:'0'.repeat(64)})]){
    const item=await withNmlsTrainingSummary(STAFF_ID,row,{callRpc:get});
    assert.equal(item.nmls_training.available,false);assert.equal(item.progress_percent,null);assert.equal(item.assignments_completed,null);
    assert.equal(item.resume_path,null);assert.equal(item.training_completed,false);assert.doesNotMatch(JSON.stringify(item),/SECRET/);
  }
});
test('regulator portal review is read-only, not fabricated zero-percent learner progress',async()=>{
  const calls=[];
  const item=await withNmlsTrainingSummary(STAFF_ID,row,{callRpc:async(name)=>{
    calls.push(name);assert.equal(name,'nmls_training_context');return {...context(),reviewRole:'regulator_reviewer'};
  }});
  assert.equal(item.nmls_training.available,true);assert.equal(item.nmls_training.readOnly,true);
  assert.equal(item.nmls_training.accessMode,'regulator_reviewer');assert.equal(item.training_phase,'read_only_review');
  assert.equal(item.assignment_count,45);assert.equal(item.assignments_completed,null);assert.equal(item.progress_percent,null);
  assert.equal(item.nmls_training.completedUnits,null);assert.equal(item.nmls_training.passedModules,null);
  assert.equal(item.training_completed,false);assert.equal(item.completed_at,null);assert.equal(item.nmls_training.creditEarned,false);
  assert.match(item.resume_path,/\/student\/nmls-training\/\?enrollment_id=/);
  assert.doesNotMatch(JSON.stringify(item),/correctChoice|sourcePayloadDigest|definitionDigest|"answers"|"runtime"|unit_action/);
  assert.deepEqual(calls,['nmls_training_context']);
});
test('portal counts actual completed authored units but does not manufacture course completion',async()=>{
  const c=context(),source=getNmlsReviewCourse(identity.contentKey);const unit=source.modules[0].units[0];
  const rpc=async(name,args)=>{
    if(name==='nmls_training_context')return {...structuredClone(c),event:null};
    assert.equal(name,'nmls_training_commit');c.runtime=structuredClone(args.p_runtime);c.revision++;
    return {...structuredClone(c),event:{command_digest:args.p_command_digest},replayed:false};
  };
  const teach=async(kind,extra={})=>executeNmlsTraining({operation:'teaching',command:{enrollmentId:ENROLLMENT_ID,eventId:randomUUID(),expectedRevision:c.revision,
    action:{kind,sessionId:c.runtime?.source.sessionId||null,...extra}}},STAFF_ID,{rpc});
  await teach('resume');await teach('open_unit',{unitId:unit.id});await teach('interaction',{visible:true,observation:'keyboard'});
  for(let left=unit.requiredSeconds*1000;left>0;){const span=Math.min(left,30_000);c.serverTimeMs+=span;left-=span;await teach('interaction',{visible:true,observation:'scroll'});}
  await teach('unit_action',{choice:unit.actionQuestion.correctChoice});assert.equal((await teach('complete_unit')).body.code,'unit_review_complete');
  const item=await withNmlsTrainingSummary(STAFF_ID,row,{callRpc:rpc});
  assert.equal(item.assignments_completed,1);assert.equal(item.assignment_count,45);assert.equal(item.nmls_training.passedModules,0);
  assert.equal(item.training_completed,false);assert.equal(item.completed_at,null);assert.equal(item.progress_percent,2);
  c.runtime.phase='passed';
  assert.equal((await withNmlsTrainingSummary(STAFF_ID,row,{callRpc:rpc})).nmls_training.available,false);
});
test('adapter rejects method, cross-origin, invalid type/JSON and streamed oversize before domain work',async()=>fixture(async calls=>{
  for(const [req,status] of [[new Request('https://statecourse.test/api/enroll/training'),405],
    [request({}, {origin:'https://evil.test'}),403],[request({}, {'content-type':'text/plain'}),415],[request(null),400],
    [new Request('https://statecourse.test/api/enroll/training',{method:'POST',headers:{origin:'https://statecourse.test','content-type':'application/json'},body:'{'}),400]]){
    calls.length=0;assert.equal((await enrollHandler(req)).status,status);assert.equal(calls.length,0);
  }
  let canceled=false;
  const stream=new ReadableStream({pull(controller){controller.enqueue(new Uint8Array(9000));},cancel(){canceled=true;}});
  const req=new Request('https://statecourse.test/api/enroll/training',{method:'POST',headers:{origin:'https://statecourse.test','content-type':'application/json','content-length':'1'},body:stream,duplex:'half'});
  calls.length=0;assert.equal((await enrollHandler(req)).status,413);assert.equal(canceled,true);assert.equal(calls.length,0);
}));
test('modern adapter preserves each refreshed secure session cookie separately',async()=>{
  const response=await studentJsonRequest(new Request('https://statecourse.test/api/student/portal'),['GET'],async()=>({statusCode:200,body:'{"ok":true}',
    multiValueHeaders:{'set-cookie':['__Host-sc_access=a; Path=/; HttpOnly; Secure; SameSite=Lax','__Host-sc_refresh=b; Path=/; HttpOnly; Secure; SameSite=Lax']}}));
  assert.equal(response.headers.getSetCookie().length,2);assert.doesNotMatch(await response.text(),/sc_access|sc_refresh/);
});
