import test from 'node:test';
import assert from 'node:assert/strict';
import {peCourseFixture,ids} from './helpers/pe-course-fixture.mjs';
import {PE_COURSE_UNITS,PE_COURSE_DEFINITION} from '../config/nmls/pe-course-definition.mjs';
import {createPeCourseHandler} from '../netlify/functions/_lib/nmls-pe-course-http.mjs';
const text='Synthetic source-grounded analysis identifying the evidence, unresolved issue and next responsible owner.';
test('25-unit NONCREDIT course teaching lifecycle and scoped timing export',{skip:!process.env.PE_PGLITE_MODULE&&process.env.PE_COURSE_NATIVE_CI!=='1'},async t=>{
 const f=await peCourseFixture();t.after(()=>f.db.close());
 await t.test('default disabled, no paid or credit capability',async()=>{await assert.rejects(()=>f.state(ids.a,'1A'),/pe_course_disabled/);assert.equal(PE_COURSE_DEFINITION.creditEligible,false);});
 await f.enable();
 await t.test('empty course lists all25 units and planned categories but no measured minutes',async()=>{
  const s=await f.call(ids.a,f.request('course-snapshot'));assert.equal(s.units.length,25);assert.equal(s.progress.observedMs,0);assert.equal(s.progress.plannedMs,60000000);assert.equal(s.progress.allTeachingEvidenceRecorded,false);
  assert.deepEqual(Object.fromEntries(Object.entries(s.progress.categories).map(([k,v])=>[k,v.plannedMs/60000])),{federal_law:150,ethics:150,nontraditional:100,elective:600});
 });
 await t.test('root roster revocation denies every unit and exports',async()=>{
  await f.db.query('update pe_course_roster_members set active=false where actor_id=$1',[ids.a]);
  await assert.rejects(()=>f.state(ids.a,'1A'),/pe_course_access_denied/);await assert.rejects(()=>f.call(ids.a,f.request('course-export')),/pe_course_access_denied/);
  await f.db.query('update pe_course_roster_members set active=true where actor_id=$1',[ids.a]);
 });
 await t.test('initial submission, peer and instructor/revision gates reject early work',async()=>{
  await assert.rejects(()=>f.write(ids.a,'1A','submit',{text}),/pe_course_observation_required/);
  await assert.rejects(()=>f.write(ids.a,'1A','feedback',{text,targetId:ids.forged}),/pe_course_invalid_request/);
 });
 await t.test('HTTP uses authenticated actor and fails closed when disabled',async()=>{
  const make=(enabled,actor=ids.a)=>createPeCourseHandler('student',{enabled:()=>enabled,authenticate:async()=>({student:{id:actor}}),rpc:f.rpc,sameOrigin:()=>{}});
  const req=body=>new Request('http://local/api/student/pe-course',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await make(false)(req(f.request('course-snapshot')))).status,404);
  const r=await make(true)(req(f.request('course-snapshot')));assert.equal(r.status,200);assert.equal((await r.json()).units.length,25);
  const denied=await make(true,ids.forged)(req(f.request('course-snapshot')));assert.equal(denied.status,403);
 });
 await t.test('two actual synthetic actors complete all25 teaching evidence chains through SQL and service',async()=>{
  for(const unit of PE_COURSE_UNITS){
   const initial={};
   for(const actor of [ids.a,ids.b]){await f.observeTo(actor,unit.unit,unit.initialMinimumMs);initial[actor]=(await f.write(actor,unit.unit,'submit',{text})).receiptId;}
   for(const actor of [ids.a,ids.b])await f.write(actor,unit.unit,'peer',{targetId:initial[actor===ids.a?ids.b:ids.a],text});
   for(const actor of [ids.a,ids.b]){
    const feedback=await f.write(ids.instructor,unit.unit,'feedback',{targetId:initial[actor],text});
    await assert.rejects(()=>f.write(actor,unit.unit,'revise',{targetId:feedback.receiptId,text}),/pe_course_observation_required/);
    await f.observeTo(actor,unit.unit,unit.plannedMs);
    const revised=await f.write(actor,unit.unit,'revise',{targetId:feedback.receiptId,text});assert.equal(revised.stage,'revised-noncredit');
   }
  }
 });
 await t.test('full teaching evidence never opens protected final or enables credit',async()=>{
  const a=await f.call(ids.a,f.request('course-export'));
  assert.equal(a.progress.revisedUnits,25);assert.equal(a.progress.allTeachingEvidenceRecorded,true);assert.equal(a.progress.observedMs,60000000);
  assert.equal(a.protectedFinalAvailable,false);assert.equal(a.progress.protectedFinal.available,false);assert.equal(a.creditEligible,false);assert.equal(a.certificateEligible,false);assert.equal(a.bankingEligible,false);assert.equal(a.durationValidated,false);
  for(const unit of a.units){assert.equal(unit.evidence.some(e=>e.actorId===ids.b&&['observe','revise'].includes(e.kind)),false);assert.equal(unit.evidence.filter(e=>e.actorId===ids.a&&e.kind==='observe').reduce((n,e)=>n+e.body.observedMs,0),unit.observedMs);}
  const staff=await f.call(ids.instructor,f.request('course-export'));assert.equal(staff.units.filter(u=>u.evidence.some(e=>e.actorId===ids.b&&e.kind==='revise')).length,25);
 });
 await t.test('root content cannot change after evidence; revocation still denies completed course',async()=>{
  await assert.rejects(()=>f.db.query("update pe_course_rosters set content_hash=repeat('0',64)"),/pe_course_cohort_evidence_pinned/);
  await f.db.query("update students set account_status='locked' where id=$1",[ids.a]);await assert.rejects(()=>f.call(ids.a,f.request('course-export')),/pe_course_access_denied/);
 });
});
