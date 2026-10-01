import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {peCourseFixture,ids} from './helpers/pe-course-fixture.mjs';
import {PE_COURSE_UNITS} from '../config/nmls/pe-course-definition.mjs';
import {createPeCourseHandler} from '../netlify/functions/_lib/nmls-pe-course-http.mjs';
const text='Synthetic learner analysis: separate the source evidence, missing decision and responsible next owner.';
const until=async(fn)=>{for(let i=0;i<200;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}assert.fail('DOM condition did not become true');};
test('25-unit workbench DOM→HTTP→SQL contribution, navigation and interrupted response',{skip:!process.env.PE_JSDOM_MODULE||(!process.env.PE_PGLITE_MODULE&&process.env.PE_COURSE_NATIVE_CI!=='1')},async t=>{
 if(!process.env.PE_JSDOM_MODULE)throw new Error('PE_JSDOM_MODULE required');
 const {JSDOM}=await import(pathToFileURL(process.env.PE_JSDOM_MODULE));
 const f=await peCourseFixture();t.after(()=>f.db.close());await f.enable();
 const html=await fs.readFile(new URL('../public/statecourse/student/pe-course/index.html',import.meta.url),'utf8');
 const code=await fs.readFile(new URL('../public/statecourse/student/pe-course/course.mjs',import.meta.url),'utf8');
 const tabs=[];
 async function tab(actor,role='student'){
  const dom=new JSDOM(html,{url:`http://local/student/pe-course/?course=${ids.course}&role=${role}`,runScripts:'outside-only',pretendToBeVisual:true});tabs.push(dom);const w=dom.window;
  Object.defineProperty(w.crypto,'randomUUID',{value:randomUUID});w.setInterval=()=>1;w.document.hasFocus=()=>true;
  const handler=createPeCourseHandler(role,{enabled:()=>true,authenticate:async()=>({student:{id:actor}}),rpc:f.rpc,sameOrigin:()=>{}});
  let drop=false,hold=null;w.fetch=async(url,options)=>{const operation=JSON.parse(options.body).operation;const capture=operation==='snapshot'?hold:null;if(capture)hold=null;const response=await handler(new Request(new URL(url,w.location.href),options));if(capture){capture.started=true;await capture.wait;}if(drop&&operation==='submit'&&response.status===200){drop=false;throw new Error('Synthetic lost response after commit');}return response;};
  w.eval(code);await until(()=>!w.document.getElementById('activity').hidden);
  return {w,$:id=>w.document.getElementById(id),drop:()=>{drop=true;},holdSnapshot:()=>{let release;const control={started:false,wait:new Promise(r=>{release=r;}),release:()=>release()};hold=control;return control;}};
 }
 t.after(()=>tabs.forEach(d=>d.window.close()));
 const a=await tab(ids.a),b=await tab(ids.b),staff=await tab(ids.instructor,'instructor');
 await t.test('all25 units and readable preserved lesson are available; final locked',()=>{assert.equal(a.$('unit').options.length,25);assert.ok(a.$('lesson').textContent.length>20000);assert.match(a.$('finalGate').textContent,/never grants exam access/);assert.equal(staff.$('study').hidden,true);});
 const unit=PE_COURSE_UNITS[0];
 for(const actor of [ids.a,ids.b])await f.observeTo(actor,'1A',unit.initialMinimumMs);
 const refresh=async tab=>{tab.$('refresh').click();await until(()=>tab.$('contribution').dataset.operation==='submit');};
 await refresh(a);await refresh(b);
 const submit=async(tab,expected)=>{tab.$('response').value=text;tab.$('contribution').dispatchEvent(new tab.w.Event('submit',{bubbles:true,cancelable:true}));await until(expected);};
 await t.test('committed-response loss recovers one initial record with original request',async()=>{
  a.drop();await submit(a,()=>!a.$('retry').hidden&&!a.$('retry').disabled);assert.match(a.$('status').textContent,/interrupted/);
  const before=(await f.db.query("select count(*)::int n from pe_course_events where actor_id=$1 and kind='submit'",[ids.a])).rows[0].n;assert.equal(before,1);
  a.$('retry').click();await until(()=>a.$('retry').hidden&&a.$('contribution').dataset.operation==='peer');
  assert.equal((await f.db.query("select count(*)::int n from pe_course_events where actor_id=$1 and kind='submit'",[ids.a])).rows[0].n,1);
 });
 await submit(b,()=>b.$('contribution').dataset.operation==='peer'&&!b.$('send').disabled);
 a.$('refresh').click();await until(()=>!a.$('send').disabled&&a.$('target').options.length===1);
 await t.test('feedback arriving before outgoing peer work does not strand the learner',async()=>{
  await submit(b,()=>b.$('send').disabled&&b.$('retry').hidden);
  staff.$('refresh').click();await until(()=>staff.$('target').options.length===1&&!staff.$('send').disabled);
  await submit(staff,()=>staff.$('target').options.length===0&&staff.$('send').disabled);
  a.$('refresh').click();await until(()=>a.$('progress').textContent.includes('revision')&&!a.$('send').disabled);
  assert.equal(a.$('contribution').dataset.operation,'peer');
  assert.equal((await f.state(ids.a,'1A')).stage,'revision');
  await submit(a,()=>a.$('contribution').dataset.operation==='revise'&&a.$('send').disabled&&a.$('retry').hidden);
  staff.$('refresh').click();await until(()=>staff.$('target').options.length===1&&!staff.$('send').disabled);
  await submit(staff,()=>staff.$('target').options.length===0&&staff.$('send').disabled);
 });
 await t.test('revision stays blocked until planned observation threshold, then records linked revision',async()=>{
  a.$('refresh').click();await until(()=>a.$('contribution').dataset.operation==='revise');assert.equal(a.$('send').disabled,true);
  await f.observeTo(ids.a,'1A',unit.plannedMs);a.$('refresh').click();await until(()=>!a.$('send').disabled);
  await submit(a,()=>a.$('progress').textContent.includes('revised-noncredit'));assert.equal((await f.state(ids.a,'1A')).stage,'revised-noncredit');
 });
 await t.test('drafts are unit scoped and Back restores the correct unit',async()=>{
  a.$('response').value='Draft for unit 1A only';a.$('response').dispatchEvent(new a.w.Event('input'));
  a.$('unit').value='1B';a.$('unit').dispatchEvent(new a.w.Event('change'));await until(()=>a.$('title').textContent.includes('1B'));await until(()=>!a.$('unit').disabled);
  assert.equal(a.$('response').value,'');assert.match(a.w.location.search,/unit=1B/);
  a.$('response').value='Draft for unit 1B only';a.$('response').dispatchEvent(new a.w.Event('input'));
  a.w.history.back();await until(()=>a.$('title').textContent.includes('1A'));await until(()=>!a.$('unit').disabled);assert.equal(a.$('response').value,'Draft for unit 1A only');
 });
 await t.test('delayed old-unit snapshot cannot overwrite newer navigation',async()=>{
  const held=a.holdSnapshot();const event=new a.w.Event('pageshow');Object.defineProperty(event,'persisted',{value:true});a.w.dispatchEvent(event);await until(()=>held.started);
  a.$('unit').value='1B';a.$('unit').dispatchEvent(new a.w.Event('change'));await until(()=>a.$('title').textContent.includes('1B'));await until(()=>!a.$('unit').disabled);
  held.release();await new Promise(r=>setTimeout(r,40));assert.match(a.$('title').textContent,/1B/);assert.equal(a.$('unit').value,'1B');assert.equal(a.$('response').value,'Draft for unit 1B only');
 });
});
