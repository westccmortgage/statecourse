import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { nativePe03Fixture } from '../helpers/pe03-native-fixture.mjs';
import { ids } from '../helpers/pe03-fixture.mjs';
const report={completed:false,checks:[],fixtures:[],failures:[],productionTouched:false};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function locked(f,pid) {
  const start=Date.now();while(Date.now()-start<7000){const row=(await f.db.query('select wait_event_type,wait_event from pg_stat_activity where pid=$1',[pid])).rows[0];if(row?.wait_event_type==='Lock')return row;await delay(30);}throw new Error('Native second connection never demonstrated a PostgreSQL lock wait');
}
async function fixture(fn){let f,error;try{f=await nativePe03Fixture({controlledClock:true});await f.enable();report.fixtures.push(f.metadata);await fn(f);}catch(e){error=e;}finally{if(f)try{await f.db.close();}catch(e){error ||= e;}}if(error){report.failures.push(error.message);throw error;}}
async function race(f,one,two,{actor=ids.a,role='student',rollback=false}={}) {
  const a=await f.connect(),b=await f.connect();assert.notEqual(a.pid,b.pid);
  try {
    await a.client.query('begin');await a.client.query('set local role service_role');
    const first=await f.command(a.client,actor,role,one);
    await b.client.query('begin');await b.client.query('set local role service_role');
    const pending=f.command(b.client,actor,role,two).then(value=>({value}),error=>({error}));
    const wait=await locked(f,b.pid);await a.client.query(rollback?'rollback':'commit');
    const second=await pending;await b.client.query(second.error?'rollback':'commit');
    report.checks.push({pids:[a.pid,b.pid],wait,rollback,firstReceipt:first.receiptId,secondReceipt:second.value?.receiptId||null,secondError:second.error?.message||null});
    return {first,...second};
  }finally{await a.client.query('rollback').catch(()=>{});await b.client.query('rollback').catch(()=>{});a.client.release();b.client.release();}
}
const observe=(f,extra={})=>f.request('observe',{tabId:ids.tabA,mode:'active',...extra});
try {
 await test('native locks, receipts, revocation and immutable revision evidence',async t=>{
  await t.test('same request waits on an actual separate backend and returns one receipt',()=>fixture(async f=>{
    const request=observe(f),r=await race(f,request,request);assert.deepEqual(r.value,r.first);assert.equal((await f.db.query('select count(*)::int n from pe03_events')).rows[0].n,1);assert.equal((await f.db.query('select count(*)::int n from pe03_receipts')).rows[0].n,1);
  }));
  await t.test('different request at the same revision blocks then fails CAS without partial evidence',()=>fixture(async f=>{
    const r=await race(f,observe(f),observe(f));assert.match(r.error.message,/pe03_revision_conflict/);assert.equal((await f.state(ids.a)).revision,1);assert.equal((await f.db.query('select count(*)::int n from pe03_receipts')).rows[0].n,1);
  }));
  await t.test('actor-wide lease prevents simultaneous tabs in two cohorts',()=>fixture(async f=>{
    const r=await race(f,observe(f),observe(f,{cohortId:ids.other,tabId:ids.tabB}));assert.match(r.error.message,/pe03_tab_conflict/);assert.equal((await f.db.query('select count(*)::int n from pe03_events')).rows[0].n,1);
  }));
  for(const kind of ['account','membership'])await t.test(`committed ${kind} revocation wins over a waiting learning request`,()=>fixture(async f=>{
    const a=await f.connect(),b=await f.connect();assert.notEqual(a.pid,b.pid);try{
      await a.client.query('begin');await a.client.query(kind==='account'?"update students set account_status='locked' where id=$1":'update pe03_members set active=false where actor_id=$1 and cohort_id=$2',kind==='account'?[ids.a]:[ids.a,ids.cohort]);
      await b.client.query('begin');await b.client.query('set local role service_role');const pending=f.command(b.client,ids.a,'student',observe(f)).then(value=>({value}),error=>({error}));const wait=await locked(f,b.pid);await a.client.query('commit');const r=await pending;await b.client.query('rollback');assert.match(r.error.message,/pe03_access_denied/);assert.equal((await f.db.query('select count(*)::int n from pe03_events')).rows[0].n,0);report.checks.push({revocation:kind,pids:[a.pid,b.pid],wait,error:r.error.message});
    }finally{await a.client.query('rollback').catch(()=>{});await b.client.query('rollback').catch(()=>{});a.client.release();b.client.release();}
  }));
  await t.test('deadline crossed while waiting on the cohort lock rejects the request',()=>fixture(async f=>{
    const a=await f.connect(),b=await f.connect();try{
      await a.client.query('begin');await a.client.query('select id from pe03_cohorts where id=$1 for update',[ids.cohort]);
      await b.client.query('begin');await b.client.query('set local role service_role');const pending=f.command(b.client,ids.a,'student',observe(f)).then(value=>({value}),error=>({error}));const wait=await locked(f,b.pid);
      await a.client.query("update pe03_test_clock set now_at=(select closes_at from pe03_cohorts where id=$1)+interval '1 second'",[ids.cohort]);await a.client.query('commit');const r=await pending;await b.client.query('rollback');assert.match(r.error.message,/pe03_window_closed/);assert.equal((await f.db.query('select count(*)::int n from pe03_events')).rows[0].n,0);report.checks.push({deadline:true,pids:[a.pid,b.pid],wait,error:r.error.message});
    }finally{await a.client.query('rollback').catch(()=>{});await b.client.query('rollback').catch(()=>{});a.client.release();b.client.release();}
  }));
  await t.test('append-only instructor revocation blocks feedback waiting for a cohort lock',()=>fixture(async f=>{
    await f.qualify(ids.a,ids.tabA);const initial=await f.write(ids.a,'submit');await f.qualify(ids.b,ids.tabB);await f.write(ids.b,'submit');await f.write(ids.b,'peer',{targetId:initial.receiptId});
    const a=await f.connect(),b=await f.connect();try{
      await a.client.query('begin');await a.client.query('select id from pe03_cohorts where id=$1 for update',[ids.cohort]);
      await b.client.query('begin');await b.client.query('set local role service_role');const pending=f.command(b.client,ids.instructor,'instructor',f.request('feedback',{targetId:initial.receiptId,text:'Specific feedback on the fictional source and missing evidence.'})).then(value=>({value}),error=>({error}));const wait=await locked(f,b.pid);
      await a.client.query("insert into staff_actor_binding_events(auth_user_id,actor_role,binding_status,evidence,recorded_by) values($1,'instructor','revoked','{\"synthetic\":true}',$1)",[ids.instructor]);await a.client.query('commit');const r=await pending;await b.client.query('rollback');assert.match(r.error.message,/pe03_access_denied/);assert.equal((await f.db.query("select count(*)::int n from pe03_events where kind='feedback'")).rows[0].n,0);report.checks.push({revocation:'instructor ledger',pids:[a.pid,b.pid],wait,error:r.error.message});
    }finally{await a.client.query('rollback').catch(()=>{});await b.client.query('rollback').catch(()=>{});a.client.release();b.client.release();}
  }));
  await t.test('rollback releases locks without ghost receipt, allowing the waiting command to commit',()=>fixture(async f=>{
    const second=observe(f);const r=await race(f,observe(f),second,{rollback:true});assert.ok(r.value);assert.equal((await f.db.query('select request_id from pe03_receipts')).rows[0].request_id,second.requestId);assert.equal((await f.db.query('select count(*)::int n from pe03_events')).rows[0].n,1);
  }));
  await t.test('concurrent final revisions retain one atomic immutable lineage',()=>fixture(async f=>{
    await f.qualify(ids.a,ids.tabA);const initial=await f.write(ids.a,'submit');await f.qualify(ids.b,ids.tabB);await f.write(ids.b,'submit');const peer=await f.write(ids.b,'peer',{targetId:initial.receiptId});const feedback=await f.write(ids.instructor,'feedback',{targetId:initial.receiptId});const revision=(await f.state(ids.a)).revision;
    const make=text=>f.request('revise',{expectedRevision:revision,targetId:feedback.receiptId,text});const r=await race(f,make('Revision one preserves missing evidence and the peer observation.'),make('Competing revision also preserves the source records and peer review.'));assert.match(r.error.message,/pe03_revision_conflict/);
    const rows=(await f.db.query("select * from pe03_events where kind='revise'")).rows;assert.equal(rows.length,1);assert.equal(rows[0].body.peerId,peer.receiptId);assert.equal(rows[0].target_id,feedback.receiptId);await assert.rejects(()=>f.db.query('delete from pe03_events where id=$1',[rows[0].id]),/pe03_immutable/);
  }));
 });
 report.completed=report.failures.length===0&&report.checks.length===9;
}finally{await fs.mkdir('artifacts/pe-cohort/native',{recursive:true});await fs.writeFile('artifacts/pe-cohort/native/report.json',JSON.stringify(report,null,2));}
