import test from 'node:test';
import assert from 'node:assert/strict';
import { LAW_OF_AGENCY_TRAINING_RUNTIME as definition } from '../config/texas/law-of-agency-training-runtime.mjs';
import { verifiedTrainingReadiness } from '../netlify/functions/_lib/training-readiness.mjs';
import { availableTraining } from '../netlify/functions/_lib/training-access.mjs';
import { handler as courseHandler } from '../netlify/functions/student-course.mjs';
import { handler as blocksHandler } from '../netlify/functions/student-blocks.mjs';
import { createStore, withConsoleMock, STAFF_ID, ENROLLMENT_ID } from './fixtures/admin-console/harness.mjs';

const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
const event=(input)=>({httpMethod:input?'POST':'GET',headers:{cookie:'__Host-sc_access=named-session-token',origin:'https://statecourse.test'},queryStringParameters:{enrollment_id:ENROLLMENT_ID,assignment:'module-01'},...(input?{body:JSON.stringify({enrollmentId:ENROLLMENT_ID,assignmentId:'module-01',...input})}:{})});
async function fixture(run,options={}) {
  return withConsoleMock(createStore(),async()=>{
    const original=globalThis.fetch,calls=[];
    const states=definition.modules.map(m=>({assignment_id:m.id,status:m.sequence===1&&options.completed?'completed':'not_started',active_seconds:options.completed?m.expectedMinutes*60:0,viewed_sections:[]}));
    globalThis.fetch=async(input,init={})=>{
      const url=new URL(input),name=url.pathname.replace('/rest/v1/',''),body=init.body?JSON.parse(init.body):null;
      calls.push({name,method:init.method||'GET',body});
      if(name==='rpc/training_runtime_definition')return options.unavailable?json({message:'Missing runtime'},404):json(options.definition||definition);
      if(name==='rpc/initialize_training_runtime')return json(null);
      if(name==='rpc/record_training_heartbeat')return json(body.p_active?15:0);
      if(name==='rpc/complete_training_module')return json(Boolean(options.completed));
      if(name==='offering_public_status')return json([{offering_id:definition.courseId,offering_kind:'course',state:'TX',discipline:'real_estate',training_access_enabled:true}]);
      if(name==='enrollments')return json([{id:ENROLLMENT_ID,student_id:STAFF_ID,course_id:definition.courseId,state:options.state||'TX',course_version:'1.0',enrollment_origin:options.origin||'training',compliance_credit_eligible:false,status:'active'}]);
      if(name==='course_review_access')return json(options.reviewer?[{access_role:'reviewer'}]:[]);
      if(name==='lms_assignment_state')return json(states);
      if(['lms_block_progress','lms_block_assessment_attempts','console_video_delivery'].includes(name))return json([]);
      if(name==='lms_regulatory_audit')return json(null);
      return original(input,init);
    };
    try{return await run(calls);}finally{globalThis.fetch=original;}
  });
}

test('Texas is available only after the real database definition matches every module and question',async()=>fixture(async calls=>{
  assert.deepEqual(await verifiedTrainingReadiness(definition.courseId),{ready:true,reason:null});
  assert.equal(calls[0].name,'rpc/training_runtime_definition');
}));
test('unapplied migration blocks enrollment readiness without pretending the database is empty',async()=>fixture(async()=>{
  assert.deepEqual(await verifiedTrainingReadiness(definition.courseId),{ready:false,reason:'training_database_runtime_unavailable'});
},{unavailable:true}));
test('a changed time requirement or question in the database blocks readiness',async()=>{
  for(const change of [d=>d.modules[0].expectedMinutes=1,d=>d.modules[0].requiredBlocks[0].questions=[]]){
    const changed=structuredClone(definition);change(changed);
    await fixture(async()=>assert.equal((await verifiedTrainingReadiness(definition.courseId)).reason,'training_database_definition_mismatch'),{definition:changed});
  }
});
test('free Texas discovery retains the public alias and canonical enrollment identity',async()=>fixture(async()=>{
  const result=await availableTraining();assert.equal(result.courses[0].id,definition.courseId);assert.equal(result.courses[0].publicId,'tx-law-of-agency-30');
}));
test('student Texas payload initializes its own progress and contains no California notices or examinations',async()=>fixture(async calls=>{
  const response=await courseHandler(event());assert.equal(response.statusCode,200,response.body);
  const payload=JSON.parse(response.body);assert.equal(payload.assignments.length,12);assert.equal(payload.assignments[1].accessible,false);
  assert.deepEqual(payload.regulatoryNotices,[]);assert.equal(payload.finalExam.eligible,false);assert.equal(payload.finalExam.href,null);
  assert.deepEqual(payload.assessments,{applied:null,engagement:null,remediation:null});
  assert.equal(calls.some(c=>c.name==='rpc/initialize_training_runtime'),true);
  assert.equal(calls.some(c=>/california|course_final_eligibility/.test(c.name)),false);
}));
test('an absent Texas database runtime refuses the student payload before writing progress',async()=>fixture(async calls=>{
  assert.equal((await courseHandler(event())).statusCode,503);
  assert.equal(calls.some(c=>c.name==='rpc/initialize_training_runtime'),false);
},{unavailable:true}));
test('Texas refuses cross-state enrollment and non-training enrollment',async()=>{
  for(const options of [{state:'CA'},{origin:'checkout'}])await fixture(async()=>assert.ok([403,409].includes((await courseHandler(event())).statusCode)),options);
});
test('Texas heartbeat accepts a just-active screen and delegates clock measurement only to its PostgreSQL function',async()=>fixture(async calls=>{
  const response=await courseHandler(event({eventType:'heartbeat',sessionId:'55555555-5555-4555-8555-555555555555',visible:true,focused:true,idleSeconds:0}));
  assert.equal(response.statusCode,200,response.body);assert.equal(JSON.parse(response.body).creditedSeconds,15);
  const call=calls.find(c=>c.name==='rpc/record_training_heartbeat');assert.equal(call.body.p_active,true);assert.equal(call.body.p_mode,undefined);
  assert.equal(calls.some(c=>/california/.test(c.name)),false);
}));
test('invalid activity values and hidden screens cannot accrue study time',async()=>{
  for(const activity of [{idleSeconds:-1},{idleSeconds:'invalid'},{idleSeconds:null},{idleSeconds:120},{visible:false},{visible:'true'},{focused:false}])await fixture(async calls=>{
    const response=await courseHandler(event({eventType:'heartbeat',sessionId:'55555555-5555-4555-8555-555555555555',visible:true,focused:true,idleSeconds:0,...activity}));
    assert.equal(response.statusCode,200,response.body);assert.equal(calls.find(c=>c.name==='rpc/record_training_heartbeat').body.p_active,false);
  });
});
test('a later Texas module remains locked even with a valid session and heartbeat',async()=>fixture(async calls=>{
  const response=await courseHandler(event({assignmentId:'module-02',eventType:'heartbeat',sessionId:'55555555-5555-4555-8555-555555555555',visible:true,focused:true,idleSeconds:0}));
  assert.equal(response.statusCode,403);assert.equal(calls.some(c=>c.name==='rpc/record_training_heartbeat'),false);
}));
test('reviewer activity never initializes or completes a student training record',async()=>fixture(async calls=>{
  const response=await courseHandler(event({eventType:'heartbeat',sessionId:'55555555-5555-4555-8555-555555555555',visible:true,focused:true,idleSeconds:0}));
  assert.equal(response.statusCode,200,response.body);assert.equal(JSON.parse(response.body).creditedSeconds,0);
  assert.equal(calls.some(c=>c.name.startsWith('rpc/')),false);
},{reviewer:true}));
test('module player reports planned time and withholds the next link until completion',async()=>fixture(async()=>{
  const response=await blocksHandler(event());assert.equal(response.statusCode,200,response.body);
  const payload=JSON.parse(response.body);assert.equal(payload.trainingModule.remainingStudySeconds,definition.modules[0].expectedMinutes*60);
  assert.equal(payload.trainingModule.nextHref,null);assert.equal(payload.trainingModule.completed,false);
}));
test('completed module player opens the next real module without final-exam access',async()=>fixture(async()=>{
  const response=await blocksHandler(event());assert.equal(response.statusCode,200,response.body);
  const payload=JSON.parse(response.body);assert.equal(payload.trainingModule.remainingStudySeconds,0);
  assert.equal(payload.trainingModule.completed,true);assert.match(payload.trainingModule.nextHref,/assignment=module-02$/);
},{completed:true}));
