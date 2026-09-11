import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, withConsoleMock, STAFF_ID } from './fixtures/admin-console/harness.mjs';
import handler from '../netlify/functions/admin-workspace.mjs';
import { assessSnapshot, courseStructure, globalOwner } from '../netlify/functions/_lib/console-operations.mjs';
import { baseFingerprint, validateDraft, contentHash, overlayText, contentForEnrollment } from '../netlify/functions/_lib/console-content.mjs';

const COURSE='ca-real-estate-principles-45';
const structure=courseStructure(COURSE), unit=structure.units[0], screen=unit.blocks[0].screens.find(s=>s.type==='instruction');
const draft=()=>({baseFingerprint:baseFingerprint(COURSE),overrides:[{deliveryId:unit.id,screenId:screen.id,title:'Updated instruction',bodyMarkdown:'The reviewed teaching text for this instruction screen.'}]});
const request=(view,{body,cookie=true,origin='https://statecourse.test'}={})=>new Request('https://statecourse.test/api/admin/workspace?'+new URLSearchParams(view),{method:body?'POST':'GET',headers:{...(cookie?{cookie:'__Host-sc_access=named-session-token'}:{}),origin,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
async function mock(store,action){const previous=globalThis.Netlify;globalThis.Netlify={env:{get:k=>process.env[k]}};try{return await withConsoleMock(store,action);}finally{globalThis.Netlify=previous;}}

test('workspace rejects unauthenticated requests without revealing any datasets',async()=>{
  await mock(createStore(),async()=>{const r=await handler(request({view:'overview'},{cookie:false}));assert.equal(r.status,401);assert.equal((await r.json()).result,undefined);});
});
test('interface review rejects every new mutation even for an owner without writing workspace records',async()=>{
  await mock(createStore(),async calls=>{
    for(const action of ['save_draft','review','publish','health_run','task_create','task_update','binding']){
      const r=await handler(request({}, {body:{action}}));
      assert.equal(r.status,409);
      assert.equal((await r.json()).error,'workspace_preview_read_only');
    }
    assert.equal(calls.some(c=>['POST','PATCH','DELETE'].includes(c.method)&&c.url.pathname!=='/rest/v1/students'),false);
  });
});
test('workspace mutations require exact same origin before authentication or database calls',async()=>{
  await mock(createStore(),async calls=>{const r=await handler(request({}, {origin:'https://attacker.test',body:{action:'task_create'}}));assert.equal(r.status,403);assert.equal(calls.length,0);});
});
test('ordinary student cannot use workspace even when browser supplies owner role',async()=>{
  await mock(createStore({bindings:[]}),async()=>{const r=await handler(request({}, {body:{action:'task_create',roles:['owner']}}));assert.equal(r.status,403);});
});
test('support cannot change staff access',async()=>{
  const store=createStore();store.bindings[0].actor_role='support';
  await mock(store,async calls=>{const r=await handler(request({}, {body:{action:'binding',userId:STAFF_ID,role:'owner',status:'active'}}));assert.equal(r.status,403);assert.equal(calls.some(c=>c.method==='POST'&&c.url.pathname.includes('binding_events')),false);});
});
test('state-scoped owner cannot read global staff list',async()=>{
  const store=createStore();store.bindings[0].scope_state='CA';
  await mock(store,async()=>{assert.equal((await handler(request({view:'team'}))).status,403);});
});
test('state-scoped administrator cannot read global reports or action log',async()=>{
  const store=createStore();store.bindings[0].actor_role='administrator';store.bindings[0].scope_state='CA';
  await mock(store,async()=>{for(const view of ['health','audit','messages','settings'])assert.equal((await handler(request({view}))).status,403);});
});
test('video producer cannot read student data or financial ledger',async()=>{
  const store=createStore();store.bindings[0].actor_role='video_producer';
  await mock(store,async()=>{for(const view of ['overview','student','payments'])assert.equal((await handler(request({view}))).status,403);});
});
test('owner cannot revoke their own owner binding',async()=>{
  await mock(createStore(),async()=>{const r=await handler(request({}, {body:{action:'binding',userId:STAFF_ID,role:'owner',status:'revoked',note:'Removing the current owner'}}));assert.equal(r.status,409);});
});
test('mixed scoped roles do not become global ownership',()=>{
  assert.equal(globalOwner({matching:[{actor_role:'owner',scope_state:'CA'},{actor_role:'administrator',scope_state:null}]}),false);
});
test('support snapshot omits payments rather than leaking financial data behind hidden navigation',async()=>{
  const store=createStore();store.bindings[0].actor_role='support';
  await mock(store,async calls=>{const r=await handler(request({view:'overview'}));assert.equal(r.status,200);assert.equal((await r.json()).result.datasets.payments,undefined);assert.equal(calls.some(c=>c.url.pathname.includes('payment_ledger')),false);});
});
test('unavailable optional tables are explicit and do not become empty successful sources',async()=>{
  await mock(createStore(),async()=>{const r=await handler(request({view:'overview'}));const d=(await r.json()).result.datasets;assert.equal(d.tasks.available,false);assert.equal(d.governance.available,false);});
});
test('editing cannot accept client-supplied requirements, status, scoring or actor fields',()=>{
  const d=validateDraft(COURSE,{...draft(),requiredHours:0,approved:true,actor:'owner'});
  assert.deepEqual(Object.keys(d),['schemaVersion','baseFingerprint','overrides']);
  assert.deepEqual(Object.keys(d.overrides[0]),['deliveryId','screenId','title','bodyMarkdown']);
});
test('stale registered structure refuses a draft before saving',()=>{
  assert.throws(()=>validateDraft(COURSE,{...draft(),baseFingerprint:'old'}),/structure_changed/);
});
test('unknown screens and duplicate overrides are rejected',()=>{
  const d=draft();d.overrides[0].screenId='nonexistent';assert.throws(()=>validateDraft(COURSE,d),/only_instruction/);
  const duplicate=draft();duplicate.overrides.push({...duplicate.overrides[0]});assert.throws(()=>validateDraft(COURSE,duplicate),/duplicate/);
});
test('question screens cannot be replaced with text that avoids retrieval',()=>{
  const retrieval=unit.blocks.flatMap(b=>b.screens).find(s=>s.type==='retrieval');const d=draft();d.overrides[0].screenId=retrieval.id;assert.throws(()=>validateDraft(COURSE,d),/only_instruction/);
});
test('blank or oversized text is rejected',()=>{
  for(const text of ['', 'x'.repeat(60001)]){const d=draft();d.overrides[0].bodyMarkdown=text;assert.throws(()=>validateDraft(COURSE,d),/20_to_60000/);}
});
test('content hash changes when one word changes, invalidating a previous review',()=>{
  const one=validateDraft(COURSE,draft());const two=structuredClone(one);two.overrides[0].bodyMarkdown+=' Updated.';assert.notEqual(contentHash(one),contentHash(two));
});
test('published text overlay preserves block requirements, video placement and progress',()=>{
  const blocks=[{id:'b1',required:true,status:'MASTERED',screens:[{id:screen.id,type:'instruction',completed:true,videos:[{assetKey:'real-video'}]}]}];
  const result=overlayText(blocks,validateDraft(COURSE,draft()),unit.id);
  assert.equal(result[0].required,true);assert.equal(result[0].status,'MASTERED');assert.equal(result[0].screens[0].completed,true);assert.equal(result[0].screens[0].videos[0].assetKey,'real-video');assert.match(result[0].screens[0].bodyMarkdown,/reviewed/);assert.equal(blocks[0].screens[0].bodyMarkdown,undefined);
});
test('one delivery text override cannot appear on another delivery with the same screen id',()=>{
  const blocks=[{screens:[{id:screen.id,type:'instruction'}]}];assert.equal(overlayText(blocks,validateDraft(COURSE,draft()),'another-unit')[0].screens[0].bodyMarkdown,undefined);
});
test('existing enrollment without pinned revision makes no publication lookup',async()=>{
  const original=globalThis.fetch;globalThis.fetch=()=>{throw new Error('unexpected fetch')};try{assert.equal(await contentForEnrollment({course_id:COURSE}),null);}finally{globalThis.fetch=original;}
});
test('pinned release cannot silently fall back if its storage disappears',async()=>{
  await mock(createStore(),async()=>{await assert.rejects(()=>contentForEnrollment({course_id:COURSE,console_content_release_id:'11111111-1111-4111-8111-111111111111'}));});
});
test('weekly check never reports green when a source or journey is unverified',()=>{
  const source={available:true,truncated:false,rows:[]};const datasets={courses:source,enrollments:source,videos:source,governance:{...source,available:false}};
  const r=assessSnapshot({datasets,checkedAt:new Date().toISOString()},{stripeTestConnected:false});assert.equal(r.outcome,'needs_review');assert.ok(r.findings.some(f=>f.code==='source_governance'));assert.ok(r.findings.some(f=>f.code==='delivery_checks_pending'));
});
test('truncated metrics are reported as incomplete',()=>{
  const source={available:true,truncated:false,rows:[]};const r=assessSnapshot({datasets:{courses:{...source,truncated:true},enrollments:source,videos:source,governance:source},checkedAt:new Date().toISOString()});assert.ok(r.findings.some(f=>f.code==='incomplete_courses'));
});
test('missing retrieval questions are a blocking finding, not a renderer success',()=>{
  const source={available:true,truncated:false,rows:[]};const r=assessSnapshot({datasets:{courses:{...source,rows:[{id:'tx-law-of-agency-30-v1',name:'Law of Agency'}]},enrollments:source,videos:source,governance:source},checkedAt:new Date().toISOString()});assert.ok(r.findings.some(f=>f.code==='retrieval_question_missing'));assert.equal(r.outcome,'action_required');
});
