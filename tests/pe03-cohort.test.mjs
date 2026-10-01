import test from 'node:test';
import assert from 'node:assert/strict';
import { pe03Fixture,ids } from './helpers/pe03-fixture.mjs';
import { createPe03Handler } from '../netlify/functions/_lib/nmls-pe-http.mjs';
import { validatePe03Request, validatePe03State } from '../netlify/functions/_lib/nmls-pe-service.mjs';
const text='The application is borrower-reported. E03 is incomplete, so request the missing checking page before reaching a funds conclusion.';
test('PE03 database, HTTP and negative acceptance (embedded PGlite)',{skip:process.env.PE_PGLITE_MODULE?false:'Set PE_PGLITE_MODULE to execute embedded DB acceptance; skipped is not passed'},async t=>{
 const f=await pe03Fixture();t.after(()=>f.db.close());const {db,call,request,state,advance,observe,write}=f;
 await t.test('disabled by default at database and HTTP boundaries',async()=>{
 await assert.rejects(()=>state(ids.a),/pe03_disabled/);
 assert.equal((await createPe03Handler('student')(new Request('http://local/api/student/pe03',{method:'POST'}))).status,404);
 await f.enable();
 });
 await t.test('cohort local calendar bounds: day14/day15, leap/year crossing, DST',async()=>{
 const valid=[['America/Los_Angeles','2026-10-01T07:00:00Z','2026-10-15T07:00:00Z'],['America/Los_Angeles','2026-10-25T07:00:00Z','2026-11-08T08:00:00Z'],['America/New_York','2026-03-01T05:00:00Z','2026-03-15T04:00:00Z'],['UTC','2026-12-25T00:00:00Z','2027-01-08T00:00:00Z']];
 for(const [tz,start,end] of valid){await db.query('update pe03_cohorts set timezone=$1,opens_at=$2,closes_at=$3 where id=$4',[tz,start,end,ids.other]);await assert.rejects(()=>db.query("update pe03_cohorts set closes_at=closes_at+interval '1 second' where id=$1",[ids.other]),/pe03_invalid_window/);}
 await assert.rejects(()=>db.query("update pe03_cohorts set timezone='Bogus/Zone' where id=$1",[ids.other]),/pe03_invalid_window/);
 });
 await t.test('not open, day14 inclusive, day15 closed at exclusive local midnight',async()=>{
 await db.exec("update pe03_test_clock set now_at='2026-10-01T06:59:59Z'");await assert.rejects(()=>state(ids.a),/pe03_window_closed/);
 await db.exec("update pe03_test_clock set now_at='2026-10-15T06:59:59Z'");assert.equal((await state(ids.a)).stage,'observe');
 await advance(1000);await assert.rejects(()=>state(ids.a),/pe03_window_closed/);
 await db.exec("update pe03_test_clock set now_at='2026-10-01T12:00:00Z'");
 });
 await t.test('locked/disabled accounts and revoked memberships are rejected on read/write',async()=>{
 for(const status of ['locked','disabled']){await db.query('update students set account_status=$1 where id=$2',[status,ids.a]);await assert.rejects(()=>state(ids.a),/pe03_access_denied/);await assert.rejects(()=>call(ids.a,'student',request('submit',{text})),/pe03_access_denied/);}
 await db.query("update students set account_status='active' where id=$1",[ids.a]);await db.query('update pe03_members set active=false where actor_id=$1',[ids.a]);await assert.rejects(()=>state(ids.a),/pe03_access_denied/);await db.query('update pe03_members set active=true where actor_id=$1',[ids.a]);
 });
 await t.test('forged instructor, invalid role, unassigned actor and wrong content denied',async()=>{
 await assert.rejects(()=>call(ids.a,'instructor',request('snapshot')),/pe03_access_denied/);
 await assert.rejects(()=>call(ids.forged,'instructor',request('snapshot')),/pe03_access_denied/);
 await assert.rejects(()=>f.rpc('pe03_command',{p_actor_id:ids.a,p_role:'student',p_request:{...request('snapshot'),contentHash:'0'.repeat(64)}}),/pe03_content_changed/);
 await db.exec("update current_staff_actor_bindings set binding_status='revoked'");await assert.rejects(()=>state(ids.instructor),/pe03_access_denied/);await db.exec("update current_staff_actor_bindings set binding_status='active'");
 });
 await t.test('table/RPC permissions, RLS and permanent noncredit flags',async()=>{
 for(const role of ['anon','authenticated']){const r=(await db.query("select has_table_privilege($1,'pe03_events','SELECT') r,has_function_privilege($1,'pe03_command(uuid,text,jsonb)','EXECUTE') e",[role])).rows[0];assert.deepEqual(r,{r:false,e:false});}
 assert.equal((await db.query("select count(*)::int n from pg_class where relname like 'pe03_%' and relkind='r' and relrowsecurity")).rows[0].n,6);
 await assert.rejects(()=>db.exec('update pe03_cohorts set credit_eligible=true'),/check constraint/);
 });
 await t.test('forged time and body identities rejected before persistence',async()=>{
 for(const extra of [{studentId:ids.b},{elapsedMs:60000},{creditEligible:true}])assert.throws(()=>validatePe03Request({...request('observe',{tabId:ids.tabA,mode:'active'}),...extra},'student'),/pe03_invalid_request/);
 await assert.rejects(()=>call(ids.a,'student',request('submit',{text:null})),/pe03_invalid_request/);
 await assert.rejects(()=>call(ids.a,'student',request('observe',{tabId:ids.tabA,mode:null})),/pe03_invalid_request/);
 await assert.rejects(()=>write(ids.a,'submit',{text}),/pe03_observation_required/);
 });
 await t.test('server observation excludes paused, dropped/offline and resumed gaps; concurrent tabs cannot count',async()=>{
 await observe();await advance(10000);let s=await observe();assert.equal(s.observedMs,10000);
 await advance(-1000);await assert.rejects(()=>observe(),/pe03_clock_regressed/);await advance(1000);
 await assert.rejects(()=>observe(ids.a,ids.tabB),/pe03_tab_conflict/);
 await advance(10000);s=await observe(ids.a,ids.tabA,'paused');assert.equal(s.observedMs,10000);
 await advance(60000);s=await observe();assert.equal(s.observedMs,10000);
 await advance(21000);s=await observe();assert.equal(s.observedMs,10000);
 await advance(10000);await observe();await advance(10000);s=await observe();assert.equal(s.observedMs,30000);
 });
 let firstA,peer,feedback,revision;
 await t.test('immutable initial, idempotent lost-response replay and payload mismatch',async()=>{
 const req=request('submit',{expectedRevision:(await state(ids.a)).revision,text});firstA=await call(ids.a,'student',req);
 assert.deepEqual(await call(ids.a,'student',req),firstA);
 await assert.rejects(()=>call(ids.a,'student',{...req,text:text+' altered'}),/pe03_idempotency_conflict/);
 await db.query("update students set account_status='locked' where id=$1",[ids.a]);await assert.rejects(()=>call(ids.a,'student',req),/pe03_access_denied/);await db.query("update students set account_status='active' where id=$1",[ids.a]);
 await assert.rejects(()=>db.query("update pe03_events set body='{}' where id=$1",[firstA.receiptId]),/pe03_immutable/);
 await assert.rejects(()=>write(ids.a,'submit',{text}),/pe03_already_recorded/);
 await assert.rejects(()=>observe(),/pe03_observation_closed/);
 });
 await t.test('self reply, early feedback and revision stay blocked with no partial evidence',async()=>{
 const before=(await db.query('select count(*)::int n from pe03_events')).rows[0].n;
 await assert.rejects(()=>write(ids.a,'peer',{targetId:firstA.receiptId,text}),/pe03_peer_required/);
 await assert.rejects(()=>write(ids.instructor,'feedback',{targetId:firstA.receiptId,text}),/pe03_peer_required/);
 await assert.rejects(()=>write(ids.a,'revise',{targetId:firstA.receiptId,text}),/pe03_feedback_required/);
 assert.equal((await db.query('select count(*)::int n from pe03_events')).rows[0].n,before);
 });
 await t.test('second synthetic learner submits and distinct peer dialogue unlocks instructor',async()=>{
 await f.qualify(ids.b,ids.tabB);await write(ids.b,'submit',{text:text+' Learner B.'});
 peer=await write(ids.b,'peer',{targetId:firstA.receiptId,text:'Your missing-page request is specific. Please also distinguish the application balance from the savings statement amount and explain why.'});
 assert.equal((await state(ids.a)).stage,'awaiting-instructor');
 assert.equal((await state(ids.b)).stage,'peer-dialogue');
 });
 await t.test('cross-cohort requests cannot read or attach another cohort evidence',async()=>{
 await db.query("update pe03_cohorts set timezone='UTC',opens_at='2026-10-01T00:00:00Z',closes_at='2026-10-15T00:00:00Z' where id=$1",[ids.other]);
 await assert.rejects(()=>call(ids.instructor,'instructor',request('feedback',{cohortId:ids.other,targetId:firstA.receiptId,text})),/pe03_access_denied/);
 await db.query('update pe03_members set active=false where cohort_id=$1 and actor_id=$2',[ids.other,ids.a]);await assert.rejects(()=>call(ids.a,'student',request('export',{cohortId:ids.other})),/pe03_access_denied/);
 });
 await t.test('assigned instructor feedback has peer lineage; immutable',async()=>{
 feedback=await write(ids.instructor,'feedback',{targetId:firstA.receiptId,text:'Keep your original record. Clarify the missing page and explain which E10 update changes the analysis without treating a ratio as loan approval.'});
 const e=feedback.evidence.find(e=>e.id===feedback.receiptId);assert.equal(e.body.peerId,peer.receiptId);
 await assert.rejects(()=>db.query('delete from pe03_events where id=$1',[feedback.receiptId]),/pe03_immutable/);
 assert.equal((await state(ids.a)).stage,'revision');
 });
 await t.test('concurrent revision CAS allows one atomic transition, retry recovers receipt',async()=>{
 const rev=(await state(ids.a)).revision;
 const a=request('revise',{expectedRevision:rev,targetId:feedback.receiptId,text:text+' Revised after named feedback.'});
 const b=request('revise',{expectedRevision:rev,targetId:feedback.receiptId,text:text+' A competing revision.'});
 const results=await Promise.allSettled([call(ids.a,'student',a),call(ids.a,'student',b)]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.match(results.find(r=>r.status==='rejected').reason.message,/pe03_revision_conflict/);
 revision=results.find(r=>r.status==='fulfilled').value;
 assert.deepEqual(await call(ids.a,'student',results[0].status==='fulfilled'?a:b),revision);
 assert.equal((await db.query("select count(*)::int n from pe03_events where kind='revise'")).rows[0].n,1);
 await assert.rejects(()=>db.query("update pe03_receipts set response='{}'"),/pe03_immutable/);
 });
 await t.test('read-only export proves transitions, own observed milliseconds and false credit flags',async()=>{
 const before=(await db.query('select count(*)::int n from pe03_events')).rows[0].n;
 const out=await call(ids.a,'student',request('export'));assert.equal(out.stage,'revised-noncredit');
 assert.equal(out.creditEligible,false);assert.equal(out.certificateEligible,false);assert.equal(out.bankingEligible,false);
 const event=out.evidence.find(e=>e.id===revision.receiptId);assert.equal(event.body.initialId,firstA.receiptId);assert.equal(event.targetId,feedback.receiptId);assert.equal(event.body.peerId,peer.receiptId);
 assert.equal(out.evidence.filter(e=>e.actorId===ids.a&&e.kind==='observe').reduce((n,e)=>n+e.body.observedMs,0),out.observedMs);
 assert.equal((await db.query('select count(*)::int n from pe03_events')).rows[0].n,before);
 await db.query('update pe03_members set active=false where cohort_id=$1 and actor_id=$2',[ids.cohort,ids.a]);await assert.rejects(()=>call(ids.a,'student',request('export')),/pe03_access_denied/);await db.query('update pe03_members set active=true where cohort_id=$1 and actor_id=$2',[ids.cohort,ids.a]);
 await db.query('select 1');
 });
 await t.test('cohort content stays pinned and current instructor expiry is enforced',async()=>{
 await assert.rejects(()=>db.query("update pe03_cohorts set content_hash=repeat('0',64) where id=$1",[ids.cohort]),/pe03_cohort_evidence_pinned/);
 await db.exec("update current_staff_actor_bindings set expires_at='2026-10-01T00:00:00Z'");await assert.rejects(()=>state(ids.instructor),/pe03_access_denied/);await db.exec('update current_staff_actor_bindings set expires_at=null');
 await db.exec("update current_staff_actor_bindings set scope_state='MI'");await assert.rejects(()=>state(ids.instructor),/pe03_access_denied/);await db.exec('update current_staff_actor_bindings set scope_state=null');
 });
 await t.test('real student-session adapter ignores editable role metadata (synthetic Auth response)',async()=>{
 const oldFetch=globalThis.fetch,oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_ANON_KEY,oldService=process.env.SUPABASE_SERVICE_ROLE_KEY;
 process.env.SUPABASE_URL='https://pe03-local-auth.invalid';process.env.SUPABASE_ANON_KEY='synthetic-only';process.env.SUPABASE_SERVICE_ROLE_KEY='sb_synthetic_only';let lookups=0;
 globalThis.fetch=async(url)=>{
 if(url.endsWith('/auth/v1/user')){lookups++;return new Response(JSON.stringify({id:ids.a,email:'synthetic-a@example.invalid',user_metadata:{role:'instructor'}}),{status:200});}
 if(url.includes('/rest/v1/students?'))return new Response('',{status:200});
 throw new Error('unexpected auth request '+url);
 };
 try{const handler=createPe03Handler('student',{enabled:()=>true,rpc:f.rpc,sameOrigin:()=>{}});const req=new Request('http://local/api/student/pe03',{method:'POST',headers:{authorization:'Bearer synthetic-session','content-type':'application/json'},body:JSON.stringify(request('snapshot'))});const response=await handler(req);assert.equal(response.status,200);assert.equal((await response.json()).role,'student');assert.equal(lookups,1);
 }finally{globalThis.fetch=oldFetch;if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;if(oldKey===undefined)delete process.env.SUPABASE_ANON_KEY;else process.env.SUPABASE_ANON_KEY=oldKey;if(oldService===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=oldService;}
 });
 await t.test('readback rejects wrong actor/role/definition/revision/time and hidden credit flags',async()=>{
 const valid=await state(ids.a);validatePe03State(valid,ids.a,'student',ids.cohort);
 for(const patch of [{role:'instructor'},{actorId:ids.b},{revision:'9'},{observedMs:-1},{durationValidated:true},{creditEligible:true},{cohort:{...valid.cohort,definitionId:'annual_ce'}},{cohort:{...valid.cohort,contentHash:'0'.repeat(64)}},{evidence:[{...valid.evidence[0],revision:'1'}]}])assert.throws(()=>validatePe03State({...valid,...patch},ids.a,'student',ids.cohort),/pe03_unavailable/);
 });
 await t.test('real HTTP adapter uses committed DB state; safe errors/body/origin/actor guards',async()=>{
 const handler=createPe03Handler('student',{enabled:()=>true,authenticate:async()=>({student:{id:ids.a}}),rpc:f.rpc,sameOrigin:e=>{if(e.headers.origin!=='http://local')throw new Error('origin_not_allowed');}});
 const req=(body,headers={})=>new Request('http://local/api/student/pe03',{method:'POST',headers:{origin:'http://local','content-type':'application/json',...headers},body:JSON.stringify(body)});
 let response=await handler(req(request('snapshot')));assert.equal(response.status,200);assert.equal((await response.json()).stage,'revised-noncredit');assert.match(response.headers.get('cache-control'),/no-store/);
 assert.equal((await handler(req({...request('snapshot'),actorId:ids.b}))).status,400);
 assert.equal((await handler(req({...request('submit',{text}),actorId:ids.b}))).status,403);
 assert.equal((await handler(req(request('snapshot'),{origin:'http://evil'}))).status,403);
 assert.equal((await handler(req(request('snapshot'),{'content-type':'text/plain'}))).status,415);
 assert.equal((await handler(req({huge:'x'.repeat(33000)}))).status,413);
 const failure=createPe03Handler('student',{enabled:()=>true,authenticate:async()=>{throw new Error('sensitive PostgreSQL details');},sameOrigin:()=>{}});
 assert.deepEqual(await (await failure(req(request('snapshot')))).json(),{error:'pe03_unavailable'});
 });
});
