import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PE_COURSE_DEFINITION,PE_COURSE_UNITS} from '../config/nmls/pe-course-definition.mjs';
import {peCourseFixture,ids} from './helpers/pe-course-fixture.mjs';
import {definePeFinalBank,drawPeFinalAttempt,projectPeFinal,gradePeFinal,peFinalCandidateDigest} from '../lib/nmls-pe-final-domain.mjs';
import {executePeFinal} from '../netlify/functions/_lib/nmls-pe-final-service.mjs';
import {createPeFinalHandler} from '../netlify/functions/_lib/nmls-pe-final-http.mjs';
import {createPeCourseHandler} from '../netlify/functions/_lib/nmls-pe-course-http.mjs';
import {pathToFileURL} from 'node:url';
const candidate=JSON.parse(await fs.readFile(new URL('../config/nmls/pe-final/bank-candidate.json',import.meta.url),'utf8'));
// Explicit synthetic review fixture only, never saved as actual review evidence.
const bank=definePeFinalBank(candidate,{review:{kind:'independent_ai_source_math_review',status:'passed',candidateContentDigest:peFinalCandidateDigest(candidate),evidenceSha256:'0'.repeat(64),holds:[],humanSmeApproved:false,regulatoryApproved:false}});
const text='Synthetic evidence-based response that identifies the controlling record, missing fact and practical consequence.';
function answersFor(attempt,count){return Object.fromEntries(attempt.questionIds.map((id,i)=>{const correct=bank.items.find(q=>q.id===id).correctChoice;return [id,i<count?correct:['A','B','C','D'].find(c=>c!==correct)];}));}
test('PE private final domain: 50-item blueprint, draw, grading and strict private projection',()=>{
 const a=drawPeFinalAttempt(bank,{id:randomUUID(),courseId:ids.course,actorId:ids.a,expiresAt:Date.now()+60000});
 assert.equal(a.questionIds.length,25);assert.equal(new Set(a.questionIds).size,25);
 assert.equal(gradePeFinal(bank,a,answersFor(a,17)).passed,false);assert.equal(gradePeFinal(bank,a,answersFor(a,18)).passed,true);
 const b=drawPeFinalAttempt(bank,{id:randomUUID(),courseId:ids.course,actorId:ids.a,expiresAt:Date.now()+60000,previous:{attempt:a,answers:answersFor(a,17)}});
 assert.equal(a.questionIds.filter(id=>b.questionIds.includes(id)).length,0);assert.equal(b.number,2);
 assert.equal(gradePeFinal(bank,b,answersFor(b,0)).disposition,'staff_review_required');
 const publicForm=projectPeFinal(bank,a);assert.deepEqual(Object.keys(publicForm.questions[0]).sort(),['id','options','stem']);
 for(const forbidden of ['correctChoice','rationale','sourceRefs','independenceNote','distractorRationales'])assert.equal(JSON.stringify(publicForm).includes('"'+forbidden+'"'),false);
 assert.throws(()=>gradePeFinal(bank,a,{...answersFor(a,25),extra:'A'}),/answers_invalid/);
 assert.throws(()=>drawPeFinalAttempt(bank,{id:randomUUID(),courseId:ids.course,actorId:ids.a,expiresAt:Date.now()+60000,previous:{attempt:a,answers:answersFor(a,18)}}),/already_passed/);
 const broken=structuredClone(candidate);broken.items[1].id=broken.items[0].id;assert.throws(()=>definePeFinalBank(broken),/item_invalid/);
});

test('Protected private final SQL lifecycle requires teaching, checks and current server prerequisites',{skip:!process.env.PE_PGLITE_MODULE&&process.env.PE_COURSE_NATIVE_CI!=='1'},async t=>{
 const f=await peCourseFixture();t.after(()=>f.db.close());await f.enable();await f.db.exec(await fs.readFile(new URL('../database/drafts/pe-final-assessment.sql',import.meta.url),'utf8'));
 const rpc=async(name,args)=>{assert.equal(name,'pe_final_command');return f.db.transaction(async tx=>{await tx.exec('set local role service_role');return(await tx.query('select pe_final_command($1,$2,$3,$4) result',[args.p_actor,args.p_role,args.p_request,args.p_candidate])).rows[0].result;});};
 const direct=async(actor,input,candidate=null)=>{const {actorId:ignored,...request}=input;return rpc('pe_final_command',{p_actor:actor,p_role:actor===ids.instructor?'instructor':'student',p_request:{...request,courseHash:PE_COURSE_DEFINITION.contentHash,bankDigest:bank.digest},p_candidate:candidate});};
 const role=actor=>actor===ids.instructor?'instructor':'student';
 const request=(operation,extra={})=>({operation,courseId:ids.course,...extra});
 const call=async(actor,input,selectedBank=bank)=>{
  const handler=createPeFinalHandler(role(actor),{enabled:()=>true,authenticate:async()=>({student:{id:actor}}),rpc,bank:selectedBank,sameOrigin:()=>{}});
  const response=await handler(new Request('http://local/api/'+(role(actor)==='instructor'?'admin':'student')+'/pe-final',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)}));
  const body=await response.json();if(!response.ok)throw new Error(body.error);return body;
 };
 const state=actor=>call(actor,request('snapshot'));
 const write=async(actor,operation,extra={})=>call(actor,request(operation,{actorId:actor,requestId:randomUUID(),expectedRevision:(await state(actor)).revision,...extra}));
 await t.test('feature absent/default off denies access',async()=>{await assert.rejects(()=>state(ids.a),/pe_final_disabled/);});
 await f.db.query('insert into pe_final_settings(singleton,enabled,course_hash,bank_digest) values(true,true,$1,$2)',[PE_COURSE_DEFINITION.contentHash,bank.digest]);
 for(const item of bank.items)await f.db.query('insert into pe_final_bank_items values($1,$2,$3,$4,$5)',[bank.digest,item.id,item.unitId,item.moduleId,item.correctChoice]);
 await t.test('browser may not supply grade, eligibility, bank or another actor',async()=>{
  const s=await state(ids.a);assert.ok(s.holds.includes('identity_required'));assert.ok(s.holds.includes('teaching_required'));assert.ok(s.holds.includes('learning_checks_required'));
  await assert.rejects(()=>write(ids.a,'begin'),/prerequisites_required/);
  await assert.rejects(()=>call(ids.a,{...request('snapshot'),grade:{passed:true}}),/invalid_request/);
  await assert.rejects(()=>call(ids.a,request('begin',{actorId:ids.b,requestId:randomUUID(),expectedRevision:0})),/access_denied/);
  await assert.rejects(()=>state(ids.forged),/access_denied/);
 });
 const revisions={};
 await t.test('all 25 revised teaching units still do not bypass check/identity/ROCS/policy gates',async()=>{
  for(const unit of PE_COURSE_UNITS){
   const initial={};
   for(const actor of [ids.a,ids.b]){await f.observeTo(actor,unit.unit,unit.initialMinimumMs);initial[actor]=(await f.write(actor,unit.unit,'submit',{text})).receiptId;}
   for(const actor of [ids.a,ids.b])await f.write(actor,unit.unit,'peer',{targetId:initial[actor===ids.a?ids.b:ids.a],text});
   const feedback=await f.write(ids.instructor,unit.unit,'feedback',{targetId:initial[ids.a],text});await f.observeTo(ids.a,unit.unit,unit.plannedMs);revisions[unit.unit]=(await f.write(ids.a,unit.unit,'revise',{targetId:feedback.receiptId,text})).receiptId;
  }
  const s=await state(ids.a);assert.equal(s.holds.includes('teaching_required'),false);assert.ok(s.holds.includes('learning_checks_required'));await assert.rejects(()=>write(ids.a,'begin'),/prerequisites_required/);
 });
 const checks={};
 await t.test('learner checks and actual instructor dispositions preserve lineage and revision requests',async()=>{
  for(const unit of PE_COURSE_UNITS){
   const check=await write(ids.a,'submit_check',{unitId:unit.unit,teachingRevisionId:revisions[unit.unit],previousCheckId:null,text});checks[unit.unit]=check.receiptId;
   assert.equal(check.checks.find(c=>c.id===check.receiptId).courseId,ids.course,'Actual SQL producer includes course scope in every check');
   await write(ids.instructor,'review_check',{checkId:check.receiptId,decision:unit.unit==='1A'?'revise':'accepted',text});
  }
  assert.ok((await state(ids.a)).holds.includes('learning_checks_required'));
  const revised=await write(ids.a,'submit_check',{unitId:'1A',teachingRevisionId:revisions['1A'],previousCheckId:checks['1A'],text:text+' This revision addresses the instructor correction.'});checks['1A']=revised.receiptId;
  await write(ids.instructor,'review_check',{checkId:revised.receiptId,decision:'accepted',text});
  assert.equal((await state(ids.a)).holds.includes('learning_checks_required'),false);
  await assert.rejects(()=>f.db.query("update pe_final_checks set body='changed'"),/immutable/);
  await assert.rejects(()=>write(ids.b,'review_check',{checkId:revised.receiptId,decision:'accepted',text}),/invalid_request/);
 });
 await t.test('only synthetic fixture prerequisites can release this private test; no credit flag changes',async()=>{
  await f.db.exec('update pe_final_settings set source_review_verified=true');
  const holds=(await state(ids.a)).holds;assert.ok(holds.includes('human_sme_required'));assert.ok(holds.includes('regulatory_release_required'));
  await f.db.exec("update pe_final_settings set human_sme_verified=true,human_sme_reference='SYNTHETIC-SME-FIXTURE-NOT-AN-APPROVAL',regulatory_release_verified=true,regulatory_release_reference='SYNTHETIC-REGULATORY-FIXTURE-NOT-AN-APPROVAL',rocs_document_hash=repeat('a',64)");
  await f.db.query("insert into pe_final_prerequisites values($1,$2,true,'SYNTHETIC-IDENTITY-ONLY','4',repeat('a',64),pe_course_now(),true)",[ids.course,ids.a]);
  await f.db.query("update pe_final_prerequisites set delivery_policy_id='pe-oil-restriction-draft-v1',delivery_policy_reference='SYNTHETIC-POLICY-NOT-APPROVAL' where course_id=$1 and actor_id=$2",[ids.course,ids.a]);
  assert.ok((await state(ids.a)).holds.includes('rocs_required'));
  await f.db.query('update pe_final_prerequisites set rocs_accepted_at=(select opens_at from pe_course_rosters where id=$1) where actor_id=$2',[ids.course,ids.a]); // Synthetic prior-course consent fixture, not a real acknowledgment.
  assert.deepEqual((await state(ids.a)).holds,[]);
  const unreviewed=definePeFinalBank(candidate);await assert.rejects(async()=>call(ids.a,request('begin',{actorId:ids.a,requestId:randomUUID(),expectedRevision:(await state(ids.a)).revision}),unreviewed),/content_changed|prerequisites_required/);
 });
 await t.test('provider interpretation requires its own matching policy ID and review reference',async()=>{
  await f.db.query("update pe_final_prerequisites set delivery_policy_id='old-policy' where actor_id=$1",[ids.a]);assert.ok((await state(ids.a)).holds.includes('delivery_policy_required'));await assert.rejects(()=>write(ids.a,'begin'),/prerequisites_required/);
  await f.db.query("update pe_final_prerequisites set delivery_policy_id='pe-oil-restriction-draft-v1',delivery_policy_reference=null where actor_id=$1",[ids.a]);assert.ok((await state(ids.a)).holds.includes('delivery_policy_required'));
  await f.db.query("update pe_final_prerequisites set delivery_policy_reference='SYNTHETIC-POLICY-NOT-APPROVAL' where actor_id=$1",[ids.a]);assert.equal((await state(ids.a)).delivery.providerPolicyApproved,false);
 });
 let first,beginRequest,preBeginPublicState;
 await t.test('begin recovery returns one persisted shuffled form; another begin does not create one',async()=>{
  preBeginPublicState=await state(ids.a);beginRequest=request('begin',{actorId:ids.a,requestId:randomUUID(),expectedRevision:(await state(ids.a)).revision});first=await call(ids.a,beginRequest);assert.equal(first.attempt.questions.length,25);
  const retry=await call(ids.a,beginRequest);assert.ok(retry.delivery.revision>first.delivery.revision);assert.deepEqual({...retry,delivery:{...retry.delivery,revision:0}},{...first,delivery:{...first.delivery,revision:0}});assert.equal((await f.db.query('select count(*)::int n from pe_final_attempts')).rows[0].n,1);
  await assert.rejects(()=>write(ids.a,'begin'),/attempt_active/);
  assert.equal(Object.hasOwn(first,'previousAnswers'),false);assert.equal(JSON.stringify(first).includes('correctChoice'),false);
 });
 let firstForm;
 await t.test('current teaching/check/instructor revocation blocks direct receipt replay and submission before grading',async()=>{
  const form=(await f.db.query('select form from pe_final_attempts where id=$1',[first.attempt.attemptId])).rows[0].form;
  const rejectCurrent=async hold=>{const s=await state(ids.a);assert.equal(s.attempt,null);assert.ok(s.holds.includes(hold));await assert.rejects(()=>direct(ids.a,beginRequest),/prerequisites_required/);await assert.rejects(()=>write(ids.a,'submit',{attemptId:form.id,answers:answersFor(form,25)}),/prerequisites_required/);const row=(await f.db.query('select state,grade from pe_final_attempts where id=$1',[form.id])).rows[0];assert.equal(row.state,'active');assert.equal(row.grade,null);};
  await f.db.query("update pe_course_cohorts set enabled=false where course_id=$1 and unit_id='1A'",[ids.course]);await rejectCurrent('teaching_required');await f.db.query("update pe_course_cohorts set enabled=true where course_id=$1 and unit_id='1A'",[ids.course]);
  await f.db.query("update pe_course_members set active=false where actor_id=$1 and cohort_id=(select id from pe_course_cohorts where course_id=$2 and unit_id='1B')",[ids.a,ids.course]);await rejectCurrent('teaching_required');await f.db.query("update pe_course_members set active=true where actor_id=$1 and cohort_id=(select id from pe_course_cohorts where course_id=$2 and unit_id='1B')",[ids.a,ids.course]);
  await f.db.query("update students set account_status='locked' where id=$1",[ids.instructor]);await rejectCurrent('instructor_required');await f.db.query("update students set account_status='active' where id=$1",[ids.instructor]);
  await assert.rejects(()=>f.db.query('update pe_course_rosters set assigned_instructor_id=$1 where id=$2',[ids.forged,ids.course]),/cohort_evidence_pinned/);
  // Simulate a trusted administrative change to latest evidence. Student HTTP
  // normally forbids adding a check while the final is active.
  const inserted=(await f.db.query("insert into pe_final_checks(course_id,unit_id,actor_id,teaching_revision_id,previous_check_id,body,created_at) values($1,'1A',$2,$3,$4,$5,pe_course_now()) returning id",[ids.course,ids.a,revisions['1A'],checks['1A'],text+' Reopened teaching evidence.'])).rows[0].id;
  await rejectCurrent('learning_checks_required');await write(ids.instructor,'review_check',{checkId:inserted,decision:'accepted',text});checks['1A']=inserted;
 });
 await t.test('actual final client restores 25 selected answers and clears protected content on account change',{skip:!process.env.PE_JSDOM_MODULE},async()=>{
  const {JSDOM}=await import(pathToFileURL(process.env.PE_JSDOM_MODULE));
  const html=await fs.readFile(new URL('../public/statecourse/student/pe-final/index.html',import.meta.url),'utf8'),js=(await fs.readFile(new URL('../public/statecourse/student/pe-course/pe-oil-controls.mjs',import.meta.url),'utf8')).replace(/^export /gm,'')+'\n'+(await fs.readFile(new URL('../public/statecourse/student/pe-final/pe-final.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
  const until=async fn=>{for(let i=0;i<200;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}assert.fail('DOM state did not arrive');};
  const create=async saved=>{const dom=new JSDOM(html,{url:`http://local/student/pe-final/?course=${ids.course}`,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;let mono=0;const ticks=[];Object.defineProperty(w.performance,'now',{value:()=>mono});w.setInterval=fn=>{ticks.push(fn);return ticks.length;};w.document.hasFocus=()=>true;Object.defineProperty(w.crypto,'randomUUID',{value:randomUUID});for(const [k,v] of Object.entries(saved||{}))w.sessionStorage.setItem(k,v);let actor=ids.a,held=null,courseResponses=0,slowCourse=false;
   w.fetch=async(url,opts)=>{const input=JSON.parse(opts.body);if(slowCourse&&url.includes('pe-course')&&input.operation==='course-snapshot')await new Promise(r=>setTimeout(r,150));if(held&&url.includes('pe-final')&&input.operation==='snapshot'){const h=held;held=null;h.started=true;await h.wait;return new Response(JSON.stringify(preBeginPublicState),{status:200,headers:{'content-type':'application/json'}});}const deps={enabled:()=>true,authenticate:async()=>({student:{id:actor}}),sameOrigin:()=>{}};const handler=url.includes('pe-course')?createPeCourseHandler('student',{...deps,rpc:f.rpc}):createPeFinalHandler('student',{...deps,rpc,bank});const response=await handler(new Request(new URL(url,w.location.href),opts));if(url.includes('pe-course')&&input.operation==='course-snapshot')courseResponses++;return response;};w.eval(js);await until(()=>w.document.querySelectorAll('#questions input[type=radio]').length===100);return {dom,w,changeActor:()=>{actor=ids.b;},setMono:n=>{mono=n;},slowCourseResponses:()=>{slowCourse=true;},courseResponses:()=>courseResponses,tick:()=>ticks.forEach(fn=>fn()),holdOldSnapshot:()=>{let release;const h={started:false,wait:new Promise(r=>{release=r;}),release:()=>release()};held=h;return h;}};};
  const race=await create();t.after(()=>race.dom.window.close());const held=race.holdOldSnapshot();const historyRefresh=()=>{const e=new race.w.Event('pageshow');Object.defineProperty(e,'persisted',{value:true});race.w.dispatchEvent(e);};historyRefresh();await until(()=>held.started);
  race.setMono(3599500);race.tick();race.slowCourseResponses();race.w.document.getElementById('policyResume').click();await until(()=>race.w.document.querySelectorAll('#questions fieldset').length===25);const settledCourses=race.courseResponses();held.release();await until(()=>race.courseResponses()>settledCourses);assert.equal(race.w.document.querySelectorAll('#questions fieldset').length,25,'Older snapshot must leave the current active form intact before expiry');race.setMono(3600500);race.tick();assert.equal(race.w.document.querySelectorAll('#questions input').length,0,'Discarded older no-attempt snapshot must not clear the active attempt deadline');assert.equal(race.w.document.getElementById('workspace').hidden,true);
  const a=await create();t.after(()=>a.dom.window.close());const radios=[...a.w.document.querySelectorAll('#questions fieldset')];for(const field of radios){field.querySelector('input').checked=true;}a.w.document.getElementById('examForm').dispatchEvent(new a.w.Event('change'));
  const saved=Object.fromEntries(Object.keys(a.w.sessionStorage).map(k=>[k,a.w.sessionStorage.getItem(k)]));const restored=await create(saved);t.after(()=>restored.dom.window.close());assert.equal(restored.w.document.querySelectorAll('#questions input:checked').length,25);
  restored.w.document.getElementById('checkResponse').value='Prior learner private draft';restored.w.document.getElementById('grade').textContent='Prior learner private result';restored.changeActor();restored.w.document.getElementById('refresh').click();await until(()=>restored.w.document.getElementById('workspace').hidden);assert.equal(restored.w.document.querySelectorAll('#questions input').length,0);assert.equal(restored.w.document.getElementById('checkResponse').value,'');for(const id of ['grade','summary','holds','checkPrompt','checkUnit'])assert.equal(restored.w.document.getElementById(id).textContent,'');
 });
 await t.test('a later policy clock suppresses an active form past its own expiry',async()=>{
  const context=await direct(ids.a,request('snapshot'));const expires=context.attempt.expiresAt;
  context.delivery={...context.delivery,serverAt:new Date(expires+1).toISOString(),deliveryUntil:new Date(expires+20001).toISOString()};
  const projected=await executePeFinal(request('snapshot'),ids.a,'student',{rpc:async()=>context,bank});assert.equal(projected.attempt,null);assert.equal(projected.attemptState,'expired');assert.equal(Date.parse(projected.serverAt),expires+1);
 });
 await t.test('current prerequisite revocation suppresses form and denies original begin receipt replay',async()=>{
  await f.db.query('update pe_final_prerequisites set identity_verified=false where actor_id=$1',[ids.a]);
  const s=await state(ids.a);assert.equal(s.attempt,null);assert.ok(s.holds.includes('identity_required'));
  await assert.rejects(()=>call(ids.a,beginRequest),/prerequisites_required/);
  await f.db.query('update pe_final_prerequisites set identity_verified=true where actor_id=$1',[ids.a]);
  await f.db.exec('update pe_final_settings set source_review_verified=false');assert.equal((await state(ids.a)).attempt,null);await assert.rejects(()=>call(ids.a,beginRequest),/prerequisites_required/);await f.db.exec('update pe_final_settings set source_review_verified=true');
  for(const flag of ['human_sme_verified','regulatory_release_verified']){await f.db.exec(`update pe_final_settings set ${flag}=false`);assert.equal((await state(ids.a)).attempt,null);await assert.rejects(()=>call(ids.a,beginRequest),/prerequisites_required/);await f.db.exec(`update pe_final_settings set ${flag}=true`);}
 });
 await t.test('server SQL grading is immutable/idempotent and 17/25 fails without answer-key disclosure',async()=>{
  firstForm=(await f.db.query('select form from pe_final_attempts where id=$1',[first.attempt.attemptId])).rows[0].form;
  const req=request('submit',{actorId:ids.a,requestId:randomUUID(),expectedRevision:first.revision,attemptId:first.attempt.attemptId,answers:answersFor(firstForm,17)});
  const result=await call(ids.a,req);assert.equal(result.grade.correct,17);assert.equal(result.grade.passed,false);assert.equal(result.grade.disposition,'remediation_required');const retried=await call(ids.a,req);assert.ok(retried.delivery.revision>result.delivery.revision);assert.deepEqual({...retried,delivery:{...retried.delivery,revision:0}},{...result,delivery:{...result.delivery,revision:0}});
  await assert.rejects(()=>call(ids.a,beginRequest),/prerequisites_required|attempt_conflict/);
  await assert.rejects(()=>write(ids.a,'submit',{attemptId:first.attempt.attemptId,answers:answersFor(firstForm,25)}),/attempt_conflict/);
  assert.equal(result.attempt,null);assert.equal(Object.hasOwn(result,'previousAnswers'),false);
  await assert.rejects(()=>f.db.query("update pe_final_attempts set grade='{}' where id=$1",[first.attempt.attemptId]),/attempt_immutable/);
 });
 await t.test('retake requires fresh instructor-accepted checks for missed modules, then draws zero repeated items',async()=>{
  const failed=(await state(ids.a)).grade;await assert.rejects(()=>write(ids.a,'begin'),/prerequisites_required/);await f.advance(1000);
  for(const unit of PE_COURSE_UNITS.filter(u=>failed.remediationModules.includes(u.module))){const check=await write(ids.a,'submit_check',{unitId:unit.unit,teachingRevisionId:revisions[unit.unit],previousCheckId:checks[unit.unit],text:text+' Remediation after the failed assessment.'});checks[unit.unit]=check.receiptId;await write(ids.instructor,'review_check',{checkId:check.receiptId,decision:'accepted',text});}
  await assert.rejects(()=>direct(ids.a,beginRequest),/attempt_conflict/,'A now-eligible retake cannot recover the old already-graded form');
  const second=await write(ids.a,'begin');assert.equal(second.attempt.attemptNumber,2);assert.equal(second.attempt.questions.filter(q=>firstForm.questionIds.includes(q.id)).length,0);
  const form=(await f.db.query('select form from pe_final_attempts where id=$1',[second.attempt.attemptId])).rows[0].form;
  const result=await write(ids.a,'submit',{attemptId:form.id,answers:answersFor(form,18)});assert.equal(result.grade.passed,true);assert.equal(result.grade.requiredCorrect,18);assert.equal(result.creditEligible,false);assert.equal(result.certificateEligible,false);assert.equal(result.bankingEligible,false);
  await assert.rejects(()=>write(ids.a,'begin'),/prerequisites_required/);
 });
 await t.test('revocation denies even the completed private assessment and instructor access is scoped',async()=>{
  await f.db.query('update pe_course_roster_members set active=false where course_id=$1 and actor_id=$2',[ids.course,ids.a]);await assert.rejects(()=>state(ids.a),/access_denied/);
  const instructor=await state(ids.instructor);assert.equal(instructor.checks.length>25,true);assert.equal(instructor.attempt,null);
 });
 await t.test('an expired exposure is terminal and cannot be reopened by a later clock regression',async()=>{
  // Manufactured historical exposure for isolated expiration mechanics only;
  // this fixture does not assert that learner B ever met release prerequisites.
  const now=(await f.db.query('select pe_course_now() n')).rows[0].n;
  const epoch=new Date(now).getTime();const form=drawPeFinalAttempt(bank,{id:randomUUID(),courseId:ids.course,actorId:ids.b,expiresAt:epoch+1000});
  await f.db.query("insert into pe_final_attempts(id,course_id,actor_id,bank_digest,number,form,state,started_at,expires_at) values($1,$2,$3,$4,1,$5,'active',pe_course_now(),pe_course_now()+interval '1 second')",[form.id,ids.course,ids.b,bank.digest,form]);
  await f.advance(2000);let s=await state(ids.b);assert.equal(s.attemptState,'expired');assert.equal(s.attempt,null);assert.equal(s.grade,null);assert.ok(s.holds.includes('staff_review_required'));
  await f.advance(-2000);await assert.rejects(()=>state(ids.b),/unavailable|clock_regressed/);assert.equal((await f.db.query('select state from pe_final_attempts where id=$1',[form.id])).rows[0].state,'expired');
  await assert.rejects(()=>f.db.query("update pe_final_attempts set state='active' where id=$1",[form.id]),/attempt_immutable/);
 });
});
