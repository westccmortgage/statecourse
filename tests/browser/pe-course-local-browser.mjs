// Isolated real browser → HTTP → native PostgreSQL acceptance. No hosted data.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {launchPe03BrowserDriver} from '../helpers/pe03-browser-driver.mjs';
import {peCourseFixture,ids} from '../helpers/pe-course-fixture.mjs';
import {PE_COURSE_UNITS} from '../../config/nmls/pe-course-definition.mjs';
import {createPeCourseHandler} from '../../netlify/functions/_lib/nmls-pe-course-http.mjs';
import {validatePeCourseState} from '../../netlify/functions/_lib/nmls-pe-course-service.mjs';
if(process.env.PE_COURSE_NATIVE_CI!=='1')throw new Error('Native course acceptance required');
const out=path.resolve('artifacts/pe-course/browser');await fs.mkdir(out,{recursive:true});
const f=await peCourseFixture();await f.enable();const drivers=[];
const report={completed:false,database:f.db.metadata,checks:[],errors:[],productionTouched:false,timingStudyValidated:false,syntheticClockForTeachingThresholds:true};
await f.db.exec(`update pe_course_rosters set timezone='UTC',opens_at=date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC',closes_at=(date_trunc('day',clock_timestamp() at time zone 'UTC')+interval '14 days') at time zone 'UTC';
 update pe_course_cohorts set timezone='UTC',opens_at=date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC',closes_at=(date_trunc('day',clock_timestamp() at time zone 'UTC')+interval '14 days') at time zone 'UTC';
 create or replace function pe_course_now() returns timestamptz language sql volatile set search_path=public,pg_temp as $$select clock_timestamp()$$;`);
let origin,drop=false,held=null;
const handler=role=>createPeCourseHandler(role,{enabled:()=>true,rpc:f.rpc,authenticate:async event=>{const actor=ids[event.headers.cookie?.match(/pe-fixture-actor=([a-z]+)/)?.[1]];if(!actor)throw new Error('student_auth_required');return {student:{id:actor}};}});
const student=handler('student'),instructor=handler('instructor');
const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url,origin);
 if(url.pathname.startsWith('/api/')){
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const raw=Buffer.concat(chunks),input=JSON.parse(raw);
  const capture=input.operation==='snapshot'&&held?held:null;if(capture)held=null;
  const response=await(url.pathname==='/api/admin/pe-course'?instructor:student)(new Request(url,{method:req.method,headers:req.headers,body:raw,duplex:'half'}));
  if(capture){capture.started=true;await capture.wait;}
  if(drop&&input.operation==='submit'){assert.equal(response.status,200);res.destroy();return;}
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
 }
 if(url.pathname==='/away'){res.end('<!doctype html><title>Away</title><p>Local background-tab fixture</p>');return;}
 const files={'/student/pe-course/':'student/pe-course/index.html','/student/pe-course/course.mjs':'student/pe-course/course.mjs','/student/pe-course/course.css':'student/pe-course/course.css','/staff/action-proof.js':'staff/action-proof.js','/staff/security.css':'staff/security.css'};
 const file=files[url.pathname];if(!file){res.writeHead(404).end();return;}
 res.setHeader('content-type',/\.m?js$/.test(file)?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(await fs.readFile(new URL('../../public/statecourse/'+file,import.meta.url)));
 }catch(e){report.errors.push(e.message);res.writeHead(500).end('local fixture error');}});
try{
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;process.env.STATECOURSE_BASE_URL=origin;
 const actorPage=async actor=>{const driver=await launchPe03BrowserDriver({origin,viewport:{width:1100,height:900},artifactDir:out});drivers.push(driver);await driver.context.addCookies([{name:'pe-fixture-actor',value:actor,url:origin}]);const page=await driver.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(`${origin}/student/pe-course/?course=${ids.course}${actor==='instructor'?'&role=instructor':''}`);await page.locator('#activity').waitFor({state:'visible'});await driver.focus(page);return {driver,page,context:driver.context};};
 const a=await actorPage('a');assert.equal(await a.page.locator('#unit option').count(),25);await a.page.screenshot({path:path.join(out,'01-course-desktop.png')});
 const idle=page=>page.waitForFunction(()=>!document.getElementById('unit').disabled);
 await a.page.locator('#study').click();await a.page.waitForFunction(()=>document.getElementById('study').textContent==='Take a break'&&!document.getElementById('study').disabled);
 const wallStart=Date.now();await a.page.waitForTimeout(12500);await a.page.locator('#study').click();await idle(a.page);
 const observed=(await f.state(ids.a,'1A')).observedMs;assert.ok(observed>0&&observed<=Date.now()-wallStart+1500);report.foregroundSample={wallMs:Date.now()-wallStart,observedMs:observed};
 await a.page.locator('#study').click();await idle(a.page);await a.context.setOffline(true);await a.page.waitForTimeout(1200);await a.context.setOffline(false);assert.equal(await a.page.locator('#study').innerText(),'Start observed work');assert.equal((await f.state(ids.a,'1A')).observedMs,observed);
 await a.page.locator('#study').click();await idle(a.page);const away=await a.driver.newPage();await away.goto(origin+'/away');await away.bringToFront();await a.page.waitForFunction(()=>document.visibilityState==='hidden',{},{polling:100,timeout:10000});await a.page.waitForTimeout(1200);await a.page.bringToFront();await away.close();await idle(a.page);assert.equal((await f.state(ids.a,'1A')).observedMs,observed);report.checks.push('Real foreground sample and genuine offline/hidden intervals; no gap time or auto-resume');
 // The following advances only a synthetic test clock. It proves persisted gates,
 // never a real 1,000-minute course duration or learner timing validation.
 await f.db.exec("update pe_course_test_clock set now_at=clock_timestamp();create or replace function pe_course_now() returns timestamptz language sql volatile set search_path=public,pg_temp as $$select now_at from pe_course_test_clock$$;");
 const unit=PE_COURSE_UNITS[0];await f.observeTo(ids.a,'1A',unit.initialMinimumMs);await a.page.locator('#refresh').click();await a.page.waitForFunction(()=>document.getElementById('contribution').dataset.operation==='submit');
 const text='Fictional role map distinguishes document receipt, missing evidence, the decision owner and an unresolved clearance. No personal or borrower data.';
 await a.page.locator('#response').fill(text);drop=true;await a.page.locator('#send').click();await a.page.waitForFunction(()=>document.getElementById('status').textContent.includes('interrupted'));drop=false;await a.page.reload();await a.page.waitForFunction(()=>document.getElementById('contribution').dataset.operation==='peer');await idle(a.page);assert.equal((await f.db.query("select count(*)::int n from pe_course_events where actor_id=$1 and kind='submit'",[ids.a])).rows[0].n,1);
 const b=await actorPage('b');await f.observeTo(ids.b,'1A',unit.initialMinimumMs);await b.page.locator('#refresh').click();await b.page.waitForFunction(()=>document.getElementById('contribution').dataset.operation==='submit');await b.page.locator('#response').fill(text);await b.page.locator('#send').click();await b.page.waitForFunction(()=>document.getElementById('contribution').dataset.operation==='peer');await idle(b.page);await b.page.locator('#response').fill('I challenge the unsupported clearance claim: which authorized reviewer and source establish that all conditions are satisfied?');await b.page.locator('#send').click();await idle(b.page);
 const staff=await actorPage('instructor');await staff.page.locator('#response').fill('Retain the original map, address the named peer challenge, and revise the handoff to identify the unresolved evidence and next decision owner.');await staff.page.locator('#send').click();await idle(staff.page);
 await a.page.bringToFront();await a.page.locator('#refresh').click();await idle(a.page);assert.equal(await a.page.locator('#contribution').getAttribute('data-operation'),'peer');await a.page.locator('#response').fill('Your map correctly names the responsible reviewer. Ask which specific record supports clearance before describing the remaining condition as satisfied.');await a.page.locator('#send').click();await a.page.waitForFunction(()=>document.getElementById('contribution').dataset.operation==='revise');await idle(a.page);assert.equal(await a.page.locator('#send').isEnabled(),false);
 await f.observeTo(ids.a,'1A',unit.plannedMs);await a.page.locator('#refresh').click();await idle(a.page);await a.page.locator('#response').fill('Revision: the initial clearance wording exceeded the supplied evidence. I retain that original, name the missing review, and route the unresolved decision to the correct owner.');await a.page.locator('#send').click();await a.page.waitForFunction(()=>document.getElementById('progress').textContent.includes('revised-noncredit'));await idle(a.page);report.checks.push('Original-ID lost-response recovery, adverse-order peer/feedback, planned-threshold revision and immutable lineage');
 let release;held={started:false,wait:new Promise(r=>{release=r;})};const capture=held;
 await a.page.evaluate(()=>{const event=new Event('pageshow');Object.defineProperty(event,'persisted',{value:true});window.dispatchEvent(event);});
 while(!capture.started)await new Promise(r=>setTimeout(r,10));await a.page.locator('#unit').selectOption('1B');await a.page.waitForFunction(()=>document.getElementById('title').textContent.includes('1B'));await idle(a.page);release();await a.page.waitForTimeout(100);assert.match(await a.page.locator('#title').innerText(),/1B/);await a.page.goBack();await a.page.waitForFunction(()=>document.getElementById('title').textContent.includes('1A'));await idle(a.page);report.checks.push('Delayed old-unit response rejected; Back restores current unit');
 await a.page.setViewportSize({width:390,height:844});await a.page.screenshot({path:path.join(out,'02-course-mobile.png')});assert.equal(await a.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 for(const [actor,entry] of [['a',a],['instructor',staff]]){
  await entry.page.bringToFront();const file=path.join(out,`${actor}-course-evidence.json`);
  const downloaded=await entry.driver.saveDownload(entry.page,()=>entry.page.locator('#export').click(),file);
  (report.downloads??=[]).push({actor,...downloaded});
  const evidence=JSON.parse(await fs.readFile(file,'utf8'));const role=actor==='instructor'?'instructor':'student';
  assert.equal(evidence.units.length,25);assert.equal(evidence.progress.role,role);
  for(const flag of ['protectedFinalAvailable','creditEligible','certificateEligible','bankingEligible','durationValidated'])assert.equal(evidence[flag],false);
  assert.equal(new Set(evidence.units.map(u=>u.unit.unit)).size,25);
  for(const u of evidence.units){
   const {unit,...raw}=u;const expectedUnit=PE_COURSE_UNITS.find(x=>x.unit===raw.cohort.unitId);
   assert.deepEqual(unit,expectedUnit);assert.equal(raw.cohort.assignedInstructorId,ids.instructor);
   validatePeCourseState(raw,ids[actor],role,ids.course,expectedUnit);
   if(actor==='a')assert.equal(raw.evidence.some(e=>e.actorId===ids.b&&['observe','revise'].includes(e.kind)),false);
  }
  const first=evidence.units.find(u=>u.unit.unit==='1A');
  if(actor==='a'){assert.equal(first.stage,'revised-noncredit');assert.equal(evidence.progress.revisedUnits,1);}
  assert.equal(first.evidence.filter(e=>e.actorId===ids.a&&e.kind==='revise').length,1);
 }
 report.checks.push('Actual downloaded 25-unit learner/instructor exports and 390×844 layout');report.completed=true;
}finally{await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));for(const driver of drivers)await driver.close();await new Promise(resolve=>server.close(resolve));await f.db.close();}
assert.equal(report.completed,true);assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
