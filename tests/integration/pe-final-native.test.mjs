import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {peFinalFixture,ids} from '../helpers/pe-final-fixture.mjs';
const out=path.resolve('artifacts/pe-final/native');
test('Private final native races and fresh-authority lock-wait checks',{skip:process.env.PE_COURSE_NATIVE_CI!=='1'},async t=>{
 const f=await peFinalFixture();t.after(()=>f.db.close());await f.qualify();
 const report={database:f.metadata,checks:[],completed:false};await fs.mkdir(out,{recursive:true});t.after(()=>fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)));
 let beginRequest,first;
 await t.test('two begin requests persist and expose exactly one form',async()=>{
  const revision=(await f.state(ids.a)).revision;
  const requests=[0,1].map(()=>f.request('begin',{actorId:ids.a,requestId:randomUUID(),expectedRevision:revision}));
  const result=await Promise.allSettled(requests.map(r=>f.call(ids.a,r)));assert.equal(result.filter(r=>r.status==='fulfilled').length,1);
  const index=result.findIndex(r=>r.status==='fulfilled');beginRequest=requests[index];first=result[index].value;
  assert.match(result.find(r=>r.status==='rejected').reason.message,/revision_conflict|attempt_active/);
  assert.equal((await f.db.query('select count(*)::int n from pe_final_attempts')).rows[0].n,1);
  report.checks.push('Concurrent begin has one committed form; losing candidate never projects');
 });
 async function lockWait({setup,request,onBlocked=async()=>{},expected}){
  const a=await f.db.connect(),b=await f.db.connect();assert.notEqual(a.pid,b.pid);let pending;
  try{
   await a.client.query('begin');await setup(a.client);await b.client.query('begin');await b.client.query('set local role service_role');
   pending=f.direct(ids.a,request,null,b.client).then(value=>({value}),error=>({error}));
   let blocked=false;for(let i=0;i<100;i++){const r=await f.db.query("select wait_event_type from pg_stat_activity where pid=$1",[b.pid]);if(r.rows[0]?.wait_event_type==='Lock'){blocked=true;break;}await new Promise(r=>setTimeout(r,20));}
   assert.equal(blocked,true,'Native second backend must actually wait for an authority lock');await onBlocked(a.client);await a.client.query('commit');
   const result=await pending;assert.ok(result.error,'Revocation/expiry must not return a form or score');assert.match(result.error.message,expected);
   report.checks.push({blockerPid:a.pid,waiterPid:b.pid,error:result.error.message,observedLockWait:true});
  }finally{await a.client.query('rollback').catch(()=>{});await b.client.query('rollback').catch(()=>{});a.client.release();b.client.release();}
 }
 await t.test('unit withdrawal blocks direct original-ID begin recovery after real lock wait',async()=>{
  await lockWait({setup:c=>c.query("update pe_course_cohorts set enabled=false where course_id=$1 and unit_id='1A'",[ids.course]),request:beginRequest,expected:/prerequisites_required/});
  await f.db.query("update pe_course_cohorts set enabled=true where course_id=$1 and unit_id='1A'",[ids.course]);
 });
 await t.test('student account revocation is read after the blocking authority update',async()=>{
  await lockWait({setup:c=>c.query("update students set account_status='locked' where id=$1",[ids.a]),request:beginRequest,expected:/access_denied/});await f.db.query("update students set account_status='active' where id=$1",[ids.a]);
 });
 await t.test('new nonaccepted evidence blocks submission before a score can persist',async()=>{
  const form=(await f.db.query('select form from pe_final_attempts where id=$1',[first.attempt.attemptId])).rows[0].form;
  const req=f.request('submit',{actorId:ids.a,requestId:randomUUID(),expectedRevision:(await f.state(ids.a)).revision,attemptId:form.id,answers:f.answers(form,25)});let check;
  await lockWait({setup:c=>c.query('select 1 from pe_final_prerequisites where course_id=$1 and actor_id=$2 for update',[ids.course,ids.a]),request:req,
   onBlocked:async c=>{check=(await c.query("insert into pe_final_checks(course_id,unit_id,actor_id,teaching_revision_id,previous_check_id,body,created_at) values($1,'1A',$2,$3,$4,'Synthetic reopened learning evidence after the first final began.',pe_course_now()) returning id",[ids.course,ids.a,f.revisions['1A'],f.checks['1A']])).rows[0].id;},expected:/prerequisites_required/});
  assert.equal((await f.db.query('select grade from pe_final_attempts where id=$1',[form.id])).rows[0].grade,null);
  await f.write(ids.instructor,'review_check',{checkId:check,decision:'accepted',text:'Synthetic instructor re-review accepts this reasoned response after the evidence was reopened.'});f.checks['1A']=check;
 });
 await t.test('concurrent conflicting submissions commit exactly one immutable grade',async()=>{
  const form=(await f.db.query('select form from pe_final_attempts where id=$1',[first.attempt.attemptId])).rows[0].form,revision=(await f.state(ids.a)).revision;
  const result=await Promise.allSettled([15,17].map(n=>f.call(ids.a,f.request('submit',{actorId:ids.a,requestId:randomUUID(),expectedRevision:revision,attemptId:form.id,answers:f.answers(form,n)}))));
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1);assert.match(result.find(r=>r.status==='rejected').reason.message,/revision_conflict|attempt_conflict/);
  const grade=(await f.db.query('select grade from pe_final_attempts where id=$1',[form.id])).rows[0].grade;assert.ok([15,17].includes(grade.correct));assert.equal(grade.passed,false);
  assert.equal((await f.db.query("select count(*)::int n from pe_final_receipts where actor_id=$1 and request->>'operation'='submit'",[ids.a])).rows[0].n,1);
  await assert.rejects(()=>f.db.query("update pe_final_attempts set grade='{}' where id=$1",[form.id]),/immutable/);report.checks.push('Concurrent submissions preserve one grade and one receipt');
 });
 const failed=(await f.state(ids.a)).grade;await f.prepareChecks({modules:failed.remediationModules});
 const secondRequest=f.request('begin',{actorId:ids.a,requestId:randomUUID(),expectedRevision:(await f.state(ids.a)).revision});const second=await f.call(ids.a,secondRequest);
 assert.equal(second.attempt.questions.filter(q=>first.attempt.questions.some(x=>x.id===q.id)).length,0);
 await t.test('direct replay cannot expose a form after attempt expiry crossed during a row-lock wait',async()=>{
  await lockWait({setup:c=>c.query('select 1 from students where id=$1 for update',[ids.a]),request:secondRequest,
   onBlocked:()=>f.db.query('update pe_course_test_clock set now_at=to_timestamp($1::bigint/1000.0)+interval \'1 second\'',[second.attempt.expiresAt]),expected:/attempt_conflict|attempt_expired/});
  const s=await f.state(ids.a);assert.equal(s.attemptState,'expired');assert.equal(s.attempt,null);assert.equal(s.grade,null);
 });
 await t.test('direct replay rechecks the course deadline after waiting on student authority',async()=>{
  await lockWait({setup:c=>c.query('select 1 from students where id=$1 for update',[ids.a]),request:secondRequest,
   onBlocked:()=>f.db.query('update pe_course_test_clock set now_at=(select closes_at from pe_course_rosters where id=$1)+interval \'1 second\'',[ids.course]),expected:/window_closed/});
 });
 report.completed=true;
});
