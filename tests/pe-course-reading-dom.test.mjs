// Focused reader DOM tests use the production UI with a synthetic local transport.
// They do not stand in for native PostgreSQL or Chromium acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {chunkLesson,readingChunkIndex,readingBookmarkKey,renderLessonChunk} from '../public/statecourse/student/pe-course/reading.mjs';
const courseId='00000000-0000-4000-8000-000000000001',actorA='reader-actor-a',actorB='reader-actor-b';
const lessons=JSON.parse(await fs.readFile(new URL('../config/nmls/pe-course/lessons.json',import.meta.url)));
const units=JSON.parse(await fs.readFile(new URL('../config/nmls/pe-course/units.json',import.meta.url))).map(unit=>({...unit,plannedMs:unit.minutes.reduce((a,b)=>a+b)*60000}));
const html=await fs.readFile(new URL('../public/statecourse/student/pe-course/index.html',import.meta.url),'utf8');
const helper=await fs.readFile(new URL('../public/statecourse/student/pe-course/reading.mjs',import.meta.url),'utf8');
const courseCode=await fs.readFile(new URL('../public/statecourse/student/pe-course/course.mjs',import.meta.url),'utf8');
const until=async(fn)=>{for(let i=0;i<200;i++){if(fn())return;await new Promise(r=>setTimeout(r,5));}assert.fail('Reader DOM condition did not become true');};
const modulePath=process.env.PE_JSDOM_MODULE;
test('preserved reader navigation, interruption recovery and actor boundary',{skip:!modulePath},async t=>{
 const {JSDOM}=await import(pathToFileURL(modulePath));const tabs=[];t.after(()=>tabs.forEach(d=>d.window.close()));
 async function tab({actor=actorA,unit='1A',anchor='',storage={},offline=false}={}){
  const dom=new JSDOM(html,{url:`http://local/student/pe-course/?course=${courseId}&unit=${unit}${anchor?'#'+anchor:''}`,runScripts:'outside-only',pretendToBeVisual:true});tabs.push(dom);const w=dom.window,$=id=>w.document.getElementById(id),requests=[];let currentActor=actor,switchOn=null,denied=false,hold=null;
  Object.defineProperty(w.crypto,'randomUUID',{value:randomUUID});w.setInterval=()=>1;w.document.hasFocus=()=>true;
  for(const [k,v]of Object.entries(storage))w.sessionStorage.setItem(k,v);
  const snapshot=id=>({actorId:currentActor,unit:units.find(u=>u.unit===id),lessonText:lessons[units.find(u=>u.unit===id).module],cohort:{opensAt:'2026-10-01',closesAt:'2026-10-15',timezone:'UTC'},stage:'initial-submission',observedMs:0,revision:0,serverAt:new Date().toISOString(),evidence:[]});
  w.fetch=async(url,options)=>{
   const input=JSON.parse(options.body);requests.push(input);if(offline)throw new Error('Synthetic disconnected reader');
   if(denied)return {ok:false,status:403,json:async()=>({error:'reader_access_ended'})};
   if(input.operation==='snapshot'&&switchOn===input.unitId)currentActor=actorB;
   const result=input.operation==='course-snapshot'?{units:units.map(u=>snapshot(u.unit)),progress:{revisedUnits:0,observedMs:0,categories:{}}}:snapshot(input.unitId||unit);
   if(hold&&input.operation==='snapshot'){const captured=hold;hold=null;captured.started=true;await captured.wait;}
   return {ok:true,status:200,json:async()=>result};
  };
  // Delivery policy is deliberately mocked here; native integration tests own it.
  const mockPolicy='const installPeOilControls=options=>{window.__readingPolicy=options;return {accept(){},enforce(){},token(){return 0;},close(){}};};\n';
  w.eval(mockPolicy+helper.replaceAll(/export /g,'')+'\n'+courseCode.replace(/^import .*from '\.\/(?:reading|pe-oil-controls)\.mjs';\n/gm,''));
  await until(()=>offline?$('status').textContent.includes('unavailable'):!$('activity').hidden&&!$('unit').disabled);
  return {w,$,requests,storage:()=>Object.fromEntries(Object.keys(w.sessionStorage).map(k=>[k,w.sessionStorage.getItem(k)])),switchOnUnit:id=>{switchOn=id;},deny:()=>{denied=true;},holdSnapshot:()=>{let release;const control={started:false,wait:new Promise(r=>{release=r;}),release:()=>release()};hold=control;return control;}};
 }
 const a=await tab(),chunks=chunkLesson(lessons.PE01,'PE01'),defaultIndex=readingChunkIndex(chunks,{unitId:'1A'}),defaultAnchor=chunks[defaultIndex].id;
 await t.test('only the unit’s bounded first chunk appears, with complete outline and no completion claim',()=>{
  assert.equal(a.$('unit').options.length,25);assert.equal(a.$('lesson').dataset.anchor,defaultAnchor);assert.equal(a.$('readingOutline').children.length,chunks.length);
  assert.ok(a.$('lesson').textContent.length<4200);assert.match(a.$('lesson').textContent,/Unit 1A/);assert.match(a.$('readingPosition').textContent,/not completion or credit/);assert.equal(a.$('study').textContent,'Start observed work');
 });
 await t.test('previous/continue/outline/history are local only, retain focus and stable URL anchors',async()=>{
  const before=a.requests.length;
  a.$('readingContinue').click();assert.equal(a.$('lesson').dataset.anchor,chunks[defaultIndex+1].id);assert.equal(a.w.document.activeElement,a.$('lesson'));assert.equal(a.w.location.hash,'#'+chunks[defaultIndex+1].id);
  a.$('readingPrevious').click();assert.equal(a.$('lesson').dataset.anchor,defaultAnchor);
  a.$('readingOutline').querySelector('a').click();assert.equal(a.$('readingPrevious').disabled,true);
  a.$('readingOutline').querySelector('li:last-child a').click();assert.equal(a.$('readingContinue').disabled,true);assert.equal(a.$('readingContinue').textContent,'End of module reading');
  a.w.history.back();await until(()=>a.$('lesson').dataset.anchor===chunks[0].id);a.w.history.forward();await until(()=>a.$('lesson').dataset.anchor===chunks.at(-1).id);
  assert.equal(a.requests.length,before);assert.equal(a.$('progress').textContent.includes('record 0'),true);
 });
 await t.test('reload resumes account/unit bookmark; another actor and a corrupt bookmark cannot inherit it',async()=>{
  const recovered=await tab({storage:a.storage()});assert.equal(recovered.$('lesson').dataset.anchor,chunks.at(-1).id);
  const other=await tab({actor:actorB,storage:a.storage()});assert.equal(other.$('lesson').dataset.anchor,defaultAnchor);
  const key=readingBookmarkKey({role:'student',courseId,actorId:actorA,unitId:'1A',sourceHash:units[0].sourceHash});
  const corrupt=await tab({storage:{[key]:'not-json'}});assert.equal(corrupt.$('lesson').dataset.anchor,defaultAnchor);
  const offline=await tab({storage:a.storage(),offline:true});assert.equal(offline.$('workspace').hidden,true);assert.equal(offline.$('lesson').textContent,'');
 });
 await t.test('same-module unit navigation defaults correctly and Back restores the former unit bookmark/draft',async()=>{
  a.$('response').value='Synthetic unit A draft';a.$('response').dispatchEvent(new a.w.Event('input'));
  a.$('unit').value='1B';a.$('unit').dispatchEvent(new a.w.Event('change'));await until(()=>a.$('title').textContent.includes('1B')&&!a.$('unit').disabled);
  assert.equal(a.$('lesson').dataset.anchor,chunks[readingChunkIndex(chunks,{unitId:'1B'})].id);assert.equal(a.$('response').value,'');
  a.w.history.back();await until(()=>a.$('title').textContent.includes('1A')&&!a.$('unit').disabled);assert.equal(a.$('lesson').dataset.anchor,chunks.at(-1).id);assert.equal(a.$('response').value,'Synthetic unit A draft');
 });
 await t.test('direct anchors and invalid hashes recover without injecting content or crossing modules',async()=>{
  const direct=await tab({anchor:chunks[5].id});assert.equal(direct.$('lesson').dataset.anchor,chunks[5].id);
  direct.w.location.hash='<img src=x onerror=alert(1)>';await until(()=>direct.w.location.hash==='#'+defaultAnchor);assert.equal(direct.$('lesson').querySelector('img'),null);
  const module2=await tab({unit:'2B',anchor:chunks[5].id});assert.match(module2.$('readingTitle').textContent,/Unit 2B/);assert.equal(module2.$('lesson').dataset.module,'PE02');
 });
 await t.test('late old-unit snapshots do not overwrite the newer unit reader',async()=>{
  const held=a.holdSnapshot(),event=new a.w.Event('pageshow');Object.defineProperty(event,'persisted',{value:true});a.w.dispatchEvent(event);await until(()=>held.started);
  a.$('unit').value='2B';a.$('unit').dispatchEvent(new a.w.Event('change'));await until(()=>a.$('title').textContent.includes('2B')&&!a.$('unit').disabled);const anchor=a.$('lesson').dataset.anchor;
  held.release();await new Promise(r=>setTimeout(r,25));assert.equal(a.$('lesson').dataset.anchor,anchor);assert.match(a.$('readingTitle').textContent,/Unit 2B/);
 });
 await t.test('account change during state-null unit switch locks and clears private reader/draft DOM',async()=>{
  const switched=await tab();switched.$('response').value='Private actor A draft';switched.$('response').dispatchEvent(new switched.w.Event('input'));switched.switchOnUnit('1B');
  switched.$('unit').value='1B';switched.$('unit').dispatchEvent(new switched.w.Event('change'));await until(()=>switched.$('workspace').hidden);
  assert.match(switched.$('status').textContent,/Account changed/);assert.equal(switched.$('lesson').textContent,'');assert.equal(switched.$('readingOutline').children.length,0);assert.equal(switched.$('response').value,'');assert.equal(switched.$('prompt').textContent,'');
  const count=switched.requests.length;switched.$('readingContinue').click();assert.equal(switched.requests.length,count);assert.equal(switched.$('lesson').textContent,'');
 });
 await t.test('policy suspension hook clears cached reading while preserving its actor-scoped bookmark',async()=>{
  const paused=await tab();paused.$('readingContinue').click();const saved=paused.$('lesson').dataset.anchor;
  paused.w.__readingPolicy.onSuspend();assert.equal(paused.$('lesson').textContent,'');assert.equal(paused.$('readingOutline').children.length,0);assert.equal(paused.$('readingContinue').disabled,true);
  paused.$('refresh').click();await until(()=>paused.$('lesson').dataset.anchor===saved);assert.equal(paused.$('readingContinue').disabled,false);
 });
 await t.test('source HTML and event attributes remain inert literal text',()=>{
  const article=a.w.document.createElement('article');article.append(renderLessonChunk(a.w.document,{text:'# Heading <img src=x onerror=alert(1)>\n\n<script>alert(1)</script>\n- <a href=javascript:alert(1)>literal</a>'}));
  assert.equal(article.querySelector('img,script,a'),null);assert.match(article.textContent,/<script>alert\(1\)<\/script>/);
 });
 await t.test('authorization loss clears already-rendered reading and response content',async()=>{
  const denied=await tab();denied.deny();denied.$('refresh').click();await until(()=>denied.$('workspace').hidden);assert.equal(denied.$('lesson').textContent,'');assert.equal(denied.$('readingOutline').children.length,0);assert.equal(denied.$('response').value,'');
 });
});
