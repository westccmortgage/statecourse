import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import {peCourseFixture,ids} from '../helpers/pe-course-fixture.mjs';
import {PE_COURSE_DEFINITION} from '../../config/nmls/pe-course-definition.mjs';
test('PE native policy serializes reservations and refreshes time after locks',{skip:process.env.PE_COURSE_NATIVE_CI!=='1'},async t=>{
 const f=await peCourseFixture();t.after(()=>f.db.close());await f.enable();
 const out=path.resolve('artifacts/pe-oil/native');await fs.mkdir(out,{recursive:true});const report={completed:false,engine:f.db.metadata,checks:[],creditAwarded:false};t.after(()=>fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)));
 await t.test('concurrent unit requests reserve one actor-wide interval',async()=>{
  const states=await Promise.all(['1A','1B','1C'].map(u=>f.state(ids.a,u)));assert.equal(states.every(s=>s.delivery.allowed),true);assert.equal(states.every(s=>s.observedMs===0),true);
  assert.equal((await f.db.query('select count(*)::int n from pe_course_policy_intervals where actor_id=$1',[ids.a])).rows[0].n,1);report.checks.push('Three concurrent unit requests share one actor reservation and award no observed time');
 });
 await t.test('a delayed snapshot cannot reuse a pre-lock clock after the wall session expires',async()=>{
  const a=await f.db.connect(),b=await f.db.connect();assert.notEqual(a.pid,b.pid);let pending;
  try{await a.client.query('begin');await a.client.query('select 1 from students where id=$1 for update',[ids.a]);await b.client.query('begin');await b.client.query('set local role service_role');
   pending=b.client.query('select pe_course_dispatch($1,$2,$3) result',[ids.a,'student',{operation:'snapshot',courseId:ids.course,unitId:'1A',courseHash:PE_COURSE_DEFINITION.contentHash}]);
   let blocked=false;for(let i=0;i<100;i++){const r=await f.db.query('select wait_event_type from pg_stat_activity where pid=$1',[b.pid]);if(r.rows[0]?.wait_event_type==='Lock'){blocked=true;break;}await new Promise(r=>setTimeout(r,20));}assert.equal(blocked,true);
   await f.advance(12*60*60000);await a.client.query('commit');const result=(await pending).rows[0].result;assert.equal(result.delivery.allowed,false);assert.equal(result.delivery.code,'session_rest_required');await b.client.query('commit');report.checks.push({observedLockWait:true,blockerPid:a.pid,waiterPid:b.pid,code:result.delivery.code});
  }finally{await a.client.query('rollback').catch(()=>{});await b.client.query('rollback').catch(()=>{});a.client.release();b.client.release();}
  const publicState=await f.state(ids.a,'1A');assert.equal(publicState.lessonText,'');assert.deepEqual(publicState.evidence,[]);assert.equal(publicState.unit.probe,'');
 });
 report.completed=true;
});
