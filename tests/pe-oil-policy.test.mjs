import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {peCourseFixture,ids} from './helpers/pe-course-fixture.mjs';
import {validatePeOilDelivery,validatePeOilEvidence,PE_OIL_POLICY} from '../lib/nmls-pe-oil-policy.mjs';
const skip=!process.env.PE_PGLITE_MODULE&&process.env.PE_COURSE_NATIVE_CI!=='1';
test('PE restriction grants, breaks and cumulative limits use server records',{skip},async t=>{
 const f=await peCourseFixture();t.after(()=>f.db.close());await f.enable();
 const control=(operation,requestId=randomUUID())=>f.call(ids.a,f.request('policy-'+operation,operation==='snapshot'?{}:{actorId:ids.a,requestId}));
 let initial=await f.state(ids.a,'1A');assert.equal(initial.delivery.allowed,true);assert.equal(initial.delivery.reservedSinceBreakMs,20000);assert.equal(initial.observedMs,0);
 await t.test('repeated and cross-unit display shares one reservation; no observed seat time awarded',async()=>{
  for(const unit of ['1A','1B','1C']){const s=await f.state(ids.a,unit);assert.equal(s.delivery.reservedSinceBreakMs,20000);assert.equal(s.observedMs,0);}
  const count=(await f.db.query('select count(*)::int n from pe_course_policy_intervals')).rows[0].n;assert.equal(count,1);
 });
 await t.test('pause/resume uses an excluded minimum break and original-ID recovery',async()=>{
  const rid=randomUUID(),p=await control('break',rid);assert.equal(p.allowed,false);assert.equal(p.code,'break_in_progress');
  const s=await f.state(ids.a,'1A');assert.equal(s.lessonText,'');assert.equal(s.unit.task,'');assert.deepEqual(s.evidence,[]);
  await f.advance(300000);assert.equal((await control('resume')).allowed,false);assert.equal((await control('break',rid)).resumeNotBefore,p.resumeNotBefore);
  await assert.rejects(()=>control('resume',rid),/idempotency_conflict/);
  await f.advance(320000);const r=await control('resume');assert.equal(r.allowed,true);assert.equal(r.reservedSinceBreakMs,20000);assert.equal(r.reservedRollingMs,40000);
  assert.equal((await f.state(ids.a,'1A')).observedMs,0);
 });
 await t.test('three bounded study blocks reach rolling cap; break never resets daily usage',async()=>{
  for(let block=0;block<3;block++){
   let s=await f.state(ids.a,'1A');
   while(s.delivery.allowed){await f.advance(20000);s=await f.state(ids.a,'1A');}
   if(block<2){assert.equal(s.delivery.code,'mandatory_break_required');const p=await control('break');await f.advance(600000);s={delivery:await control('resume')};assert.equal(s.delivery.allowed,true);}
   else assert.ok(['rolling_day_limit','mandatory_break_required'].includes(s.delivery.code));
  }
  const p=await control('break');await f.advance(600000);const denied=await control('resume');assert.equal(denied.allowed,false);assert.equal(denied.code,'rolling_day_limit');assert.equal(denied.reservedRollingMs,PE_OIL_POLICY.rollingLimitMs);
  const s=await f.state(ids.a,'1B');assert.equal(s.delivery.allowed,false);assert.equal(s.observedMs,0);assert.equal(s.lessonText,'');
 });
 await t.test('course exports retain scoped restriction evidence separately from observed time',async()=>{
  const student=await f.call(ids.a,f.request('course-export')),staff=await f.call(ids.instructor,f.request('course-export'));
  for(const [result,actor,role] of [[student,ids.a,'student'],[staff,ids.instructor,'instructor']]){validatePeOilEvidence(result.policyEvidence,actor,ids.course,role);assert.equal(result.policyEvidence.creditedMs,0);assert.ok(result.policyEvidence.intervals.length>100);assert.ok(result.policyEvidence.events.some(e=>e.kind==='break_completed'));}
  assert.equal(student.policyEvidence.intervals.every(i=>i.actorId===ids.a),true);assert.throws(()=>validatePeOilEvidence({...student.policyEvidence,courseId:ids.other},ids.a,ids.course,'student'));
 });
 await t.test('wall/rest and rolling counters survive reload; a clock rollback is rejected',async()=>{
  await f.advance(12*60*60000);const p=await control('snapshot');assert.equal(p.allowed,false);assert.equal(p.code,'session_rest_required');
  await f.advance(12*60*60000);const r=await control('resume');assert.equal(r.allowed,true);assert.equal(r.reservedRollingMs,20000);
  validatePeOilDelivery(r,ids.a,ids.course);assert.throws(()=>validatePeOilDelivery({...r,providerPolicyApproved:true},ids.a,ids.course));
  await f.advance(-1);await assert.rejects(()=>control('snapshot'),/clock_regressed/);await f.advance(1);
 });
});
