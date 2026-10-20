import { STAFF_COOKIE as CURRENT_TEST_COOKIE } from './fixtures/admin-console/harness.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, withConsoleMock, STAFF_ID, postEvent } from './fixtures/admin-console/harness.mjs';
import workspaceHandler from '../netlify/functions/admin-workspace.mjs';
import { handleTrainingEnrollment as enroll } from '../netlify/functions/_lib/enroll-training-handler.mjs';
import { handleStudentPortal as portal } from '../netlify/functions/_lib/student-portal-handler.mjs';
import { recordGovernance, governanceFor } from '../netlify/functions/_lib/offering-governance.mjs';
import { availableTraining, ensureTrainingEnrollment, trainingReadiness } from '../netlify/functions/_lib/training-access.mjs';
import { getCourseConfiguration, getCourseDelivery, getCourseQuestion } from '../config/course-registry.mjs';
import { allItems, replacementFor } from '../config/texas/law-of-agency-question-bank.mjs';
import { deriveBlockStatus, derivePosition } from '../config/california-block-engine.mjs';
import { contentForEnrollment, baseFingerprint, contentHash } from '../netlify/functions/_lib/console-content.mjs';
const CA='ca-real-estate-principles-45', TX='tx-law-of-agency-30-v1';
const course={id:CA,state:'CA',name:'Principles',current_version:'1.0',product_type:'real_estate_prelicense'};
const json=v=>new Response(JSON.stringify(v),{headers:{'content-type':'application/json'}});
async function fixture(run,{enrollments=[],grants=[],governance=[]}={}){
  const store=createStore({courses:[course,{...course,id:TX,state:'TX'}]});
  const records={enrollments,grants,governance,compliance:[],writes:[],tasks:[],drafts:[],releases:[]};
  return withConsoleMock(store,async()=>{
    const fallback=globalThis.fetch,previous=globalThis.Netlify;
    globalThis.Netlify={env:{get:key=>process.env[key]}};
    globalThis.fetch=async(input,init={})=>{
      const url=new URL(input),name=url.pathname.replace('/rest/v1/',''),method=init.method||'GET',body=init.body?JSON.parse(init.body):null;
      if(method!=='GET'&&url.pathname.startsWith('/rest/v1/'))records.writes.push({name,body});
      if(name==='enrollments'){
        if(method==='POST'&&!records.enrollments.some(r=>r.id===body.id))records.enrollments.push({...body});
        return json(records.enrollments.filter(r=>!url.searchParams.has('student_id')||r.student_id===url.searchParams.get('student_id').slice(3)));
      }
      if(name==='access_grants'){
        if(method==='POST'&&!records.grants.some(r=>r.enrollment_id===body.enrollment_id))records.grants.push({...body});
        return json(records.grants.filter(r=>r.enrollment_id===url.searchParams.get('enrollment_id')?.slice(3)||method==='POST'));
      }
      if(name==='lms_compliance_state'){if(method==='POST'&&!records.compliance.some(r=>r.enrollment_id===body.enrollment_id))records.compliance.push(body);return json(records.compliance);}
      if(name==='offering_public_status')return json(records.governance);
      if(name==='offering_governance_events'){records.governance.push({...body,approval_currently_effective:false,live_charging_permitted:false,representation:'training_only'});return json(null);}
      if(name==='console_course_releases')return json(records.releases.filter(r=>r.id===url.searchParams.get('id')?.slice(3)));
      if(name==='rpc/console_save_draft'){records.drafts.push(body);return json({revision:1,payload:body.p_payload});}
      if(name==='console_tasks'){if(method==='POST')records.tasks.push(body);return json(records.tasks);}
      if(name==='student_portal_enrollments')return json(records.enrollments.map(e=>({...e,enrollment_id:e.id})));
      if(name==='student_portal_events')return json(null);
      return fallback(input,init);
    };
    try{return await run(records,store);}finally{globalThis.Netlify=previous;globalThis.fetch=fallback;}
  });
}
const staff={auth:{student:{id:STAFF_ID}},roles:['owner'],matching:[{actor_role:'owner',scope_state:null}],actorRole:'owner',scopeStates:null};
const decision={offeringId:CA,state:'CA',discipline:'real_estate',offeringKind:'course',approvalStatus:'none',paymentMode:'sandbox',trainingAccessEnabled:true,note:'Open free non-credit training as requested by the owner.'};
const request=body=>new Request('https://statecourse.test/api/admin/workspace',{method:'POST',headers:{cookie:CURRENT_TEST_COOKIE,origin:'https://statecourse.test','content-type':'application/json'},body:JSON.stringify(body)});

test('owner can create an actual task through the enabled endpoint',async()=>fixture(async r=>{
  const result=await workspaceHandler(request({action:'task_create',courseId:CA,title:'Verify the saved lesson'}));
  assert.equal(result.status,200);assert.equal(r.tasks.length,1);assert.equal(r.tasks[0].created_by,STAFF_ID);
}));
test('owner saves an instruction draft through the endpoint without publishing or changing enrollment',async()=>fixture(async r=>{
  const delivery=getCourseDelivery(CA,'assignment-01'),screen=delivery.blocks[0].screens.find(s=>s.type==='instruction');
  const result=await workspaceHandler(request({action:'save_draft',courseId:CA,expectedRevision:0,payload:{baseFingerprint:baseFingerprint(CA),overrides:[{deliveryId:delivery.assignmentId,screenId:screen.id,title:screen.title,bodyMarkdown:'A reviewed replacement instruction paragraph for this lesson.'}]}}));
  assert.equal(result.status,200);assert.equal(r.drafts.length,1);assert.equal(r.drafts[0].p_actor,STAFF_ID);assert.equal(r.writes.some(w=>/publish|enrollments/.test(w.name)),false);
}));
test('simultaneous and repeated free enrollment requests share one non-credit enrollment and grant',async()=>fixture(async r=>{
  const replies=await Promise.all(Array.from({length:4},()=>ensureTrainingEnrollment(STAFF_ID,course)));
  assert.equal(new Set(replies.map(x=>x.enrollment.id)).size,1);assert.equal(r.enrollments.length,1);assert.equal(r.grants.length,1);assert.equal(r.compliance.length,1);
  assert.equal(r.enrollments[0].enrollment_origin,'training');assert.equal(r.enrollments[0].compliance_credit_eligible,false);assert.equal(r.enrollments[0].checkout_attempt_id,null);
  assert.equal(r.writes.some(w=>/payments|checkout_attempts|stripe/.test(w.name)),false);
  assert.equal((await ensureTrainingEnrollment(STAFF_ID,course)).existing,true);
}));
test('a partial training enrollment resumes grant initialization without duplicating enrollment',async()=>fixture(async r=>{
  const result=await ensureTrainingEnrollment(STAFF_ID,course);assert.equal(result.existing,true);assert.equal(r.enrollments.length,1);assert.equal(r.grants.length,1);
},{enrollments:[{id:STAFF_ID,student_id:STAFF_ID,course_id:CA,status:'active',enrollment_origin:'training',compliance_credit_eligible:false}]}));
test('free access cannot restore a revoked training grant',async()=>fixture(async r=>{
  await assert.rejects(()=>ensureTrainingEnrollment(STAFF_ID,course),/training_access_revoked/);assert.equal(r.writes.length,0);
},{enrollments:[{id:STAFF_ID,student_id:STAFF_ID,course_id:CA,status:'active',enrollment_origin:'training',compliance_credit_eligible:false}],grants:[{enrollment_id:STAFF_ID,status:'revoked'}]}));
test('a purchase is preserved when its student requests free training',async()=>fixture(async r=>{
  const x=await ensureTrainingEnrollment(STAFF_ID,course);assert.equal(x.enrollment.enrollment_origin,'purchase');assert.equal(x.enrollment.compliance_credit_eligible,true);assert.equal(r.writes.length,0);
},{enrollments:[{id:STAFF_ID,student_id:STAFF_ID,course_id:CA,status:'active',enrollment_origin:'purchase',compliance_credit_eligible:true}]}));
test('an approved offering still labels its free enrollment as non-credit training',async()=>fixture(async r=>{
  const response=await enroll(postEvent({courseId:CA}));assert.equal(response.statusCode,200);const body=JSON.parse(response.body);assert.equal(body.creditEligible,false);assert.equal(body.representation,'training_only');assert.match(body.href,/enrollment_id=/);
},{governance:[{offering_id:CA,state:'CA',discipline:'real_estate',training_access_enabled:true,representation:'approved'}]}));
test('closed training access rejects enrollment before writing any enrollment row',async()=>fixture(async r=>{
  const response=await enroll(postEvent({courseId:CA}));assert.equal(response.statusCode,403);assert.equal(r.enrollments.length,0);
}));
test('training catalogue exposes only enabled courses whose actual learning engine is connected',async()=>fixture(async()=>{
  const list=await availableTraining();assert.deepEqual(list.courses.map(c=>c.id),[CA]);assert.equal(trainingReadiness(TX).ready,false);
},{governance:[{offering_id:CA,state:'CA',discipline:'real_estate',offering_kind:'course',training_access_enabled:true},{offering_id:TX,state:'TX',discipline:'real_estate',offering_kind:'course',training_access_enabled:true}]}));
test('student portal returns training choices with enrollment origins',async()=>fixture(async()=>{
  const result=await portal({httpMethod:'GET',headers:{cookie:CURRENT_TEST_COOKIE}});assert.equal(result.statusCode,200);assert.equal(JSON.parse(result.body).enrollments[0].enrollment_origin,'training');
},{enrollments:[{id:STAFF_ID,student_id:STAFF_ID,enrollment_origin:'training'}]}));
test('training and sandbox can be recorded without fabricating an approval',async()=>fixture(async r=>{
  await recordGovernance({staff,input:decision});assert.equal(r.governance[0].approval_status,'none');assert.equal(r.governance[0].payment_mode,'sandbox');assert.equal(r.governance[0].recorded_by,STAFF_ID);
}));
for(const [patch,error] of [[{state:'TX'},/state_mismatch/],[{discipline:'mortgage'},/discipline_mismatch/],[{site:'another.test'},/site_outside/],[{offeringId:'nonexistent'},/unknown_offering/],[{approvalEffectiveDate:'2026-02-30'},/invalid_approval_effective/]])test('invalid governance target/date refuses without a ledger write: '+JSON.stringify(patch),async()=>fixture(async r=>{
  await assert.rejects(()=>recordGovernance({staff,input:{...decision,...patch}}),error);assert.equal(r.governance.length,0);
}));
test('owner authority from one state cannot activate live payments in another state through a global administrator binding',async()=>fixture(async r=>{
  await assert.rejects(()=>recordGovernance({staff:{...staff,matching:[{actor_role:'owner',scope_state:'TX'},{actor_role:'administrator',scope_state:null}]},input:{...decision,paymentMode:'live'}}),/owner_only/);assert.equal(r.governance.length,0);
}));
test('ambiguous governance cannot choose a permissive row arbitrarily',async()=>fixture(async()=>{
  const result=await governanceFor(CA);assert.equal(result.unreadable,true);assert.equal(result.training_access_enabled,false);assert.equal(result.live_charging_permitted,false);
},{governance:[{offering_id:CA,training_access_enabled:true},{offering_id:CA,training_access_enabled:false}]}));
test('pinned content is verified by hash before use and altered storage is refused',async()=>fixture(async r=>{
  const delivery=getCourseDelivery(CA,'assignment-01'),screen=delivery.blocks[0].screens[0];
  const payload={schemaVersion:1,baseFingerprint:baseFingerprint(CA),overrides:[{deliveryId:delivery.assignmentId,screenId:screen.id,title:screen.title,bodyMarkdown:'This is the exact published instruction text for students.'}]};
  r.releases.push({id:STAFF_ID,payload,content_hash:contentHash(payload)});
  const enrollment={course_id:CA,console_content_release_id:STAFF_ID};assert.deepEqual(await contentForEnrollment(enrollment),payload);
  r.releases[0].payload.overrides[0].bodyMarkdown+=' Tampered.';await assert.rejects(()=>contentForEnrollment(enrollment),/release_unavailable/);
}));
test('all 58 Law of Agency questions and replacements preserve their authored prompts and semantic answers',()=>{
  const screens=getCourseConfiguration(TX).assignments.flatMap(a=>getCourseDelivery(TX,a.id).blocks.flatMap(b=>b.screens.filter(s=>s.type==='retrieval')));
  assert.equal(screens.length,58);assert.equal(new Set(screens.map(s=>s.questionId)).size,58);
  for(const item of allItems()){
    const match=/^LOA-(T\d{2}U\d+)-Q(\d*)$/.exec(item.id),id=match[1].toLowerCase()+'-q'+(match[2]||'1');
    const presented=getCourseQuestion(TX,id),replacement=getCourseQuestion(TX,presented.replacementId),original=replacementFor(item.id);
    assert.equal(presented.prompt,item.prompt);assert.equal(presented.choices[presented.correctChoice],item.choices[item.correctChoice]);assert.equal(replacement.prompt,original.prompt);assert.equal(replacement.choices[replacement.correctChoice],original.choices[original.correctChoice]);assert.equal(getCourseQuestion(CA,id),null);
  }
});
test('two retrieval questions require both answers and remediation cannot be skipped',()=>{
  const delivery=getCourseDelivery(TX,'module-08'),block=delivery.blocks.find(b=>b.id==='t08u1');
  const retrieval=block.screens.filter(s=>s.type==='retrieval'),done=block.screens.filter(s=>s.type!=='retrieval').map(s=>s.id);
  const questionLookup=id=>getCourseQuestion(TX,id),attempts=[{kind:'retrieval',question_id:retrieval[0].questionId,correct:true}];
  let status=deriveBlockStatus(block,{completedScreens:done,attempts,questionLookup});assert.equal(status.status,'RETRIEVAL_REQUIRED');
  const position=derivePosition({blocks:[block]},new Map([[block.id,status]]),new Map([[block.id,{completedScreens:[...done,retrieval[0].id]}]]));assert.equal(position.screenId,retrieval[1].id);
  attempts.push({kind:'retrieval',question_id:retrieval[1].questionId,correct:false},{kind:'replacement',question_id:questionLookup(retrieval[1].questionId).replacementId,correct:true});
  assert.equal(deriveBlockStatus(block,{completedScreens:done,attempts,questionLookup}).status,'REMEDIATION_REQUIRED');
  attempts.push({kind:'remediation_review',screen_id:retrieval[1].id});assert.equal(deriveBlockStatus(block,{completedScreens:done,attempts,questionLookup}).status,'MASTERED');
});
