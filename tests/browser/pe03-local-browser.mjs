// Supported Playwright-style harness, LOCAL ONLY. Production auth providers are
// represented by synthetic local identities; real application HTTP/RPC/PG/UI run.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { nativePe03Fixture } from '../helpers/pe03-native-fixture.mjs';
import { pe03Fixture, ids } from '../helpers/pe03-fixture.mjs';
import { createPe03Handler } from '../../netlify/functions/_lib/nmls-pe-http.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PE_PLAYWRIGHT_MODULE||'/opt/codex/cua_node/lib/node_modules/playwright');
const out=path.resolve('artifacts/pe-cohort/browser');await fs.mkdir(out,{recursive:true});
const f=process.env.PE03_NATIVE_CI==='1'?await nativePe03Fixture():await pe03Fixture();await f.enable();
await f.db.exec("update pe03_cohorts set timezone='UTC',opens_at=date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC',closes_at=(date_trunc('day',clock_timestamp() at time zone 'UTC')+interval '14 days') at time zone 'UTC'; create or replace function pe03_now() returns timestamptz language sql volatile set search_path=public,pg_temp as $$select clock_timestamp()$$;");
let origin,dropSubmission=false,browser;const report={completed:false,engine:f.metadata?.engine||'embedded PGlite',database:f.metadata||null,scope:'Local UI → actual HTTP handler → PostgreSQL function. Synthetic auth provider, modeled schema prerequisites.',checks:[],errors:[],realTiming:[],productionTouched:false};
const handler=role=>createPe03Handler(role,{enabled:()=>true,rpc:f.rpc,authenticate:async event=>{
 const token=event.headers.cookie?.match(/pe-fixture-actor=([a-z]+)/)?.[1];const actor=ids[token];
 if(!actor)throw new Error('student_auth_required');return {student:{id:actor}};
}});
const student=handler('student'),instructor=handler('instructor');
const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url,origin);
 if(url.pathname.startsWith('/api/')){
 const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);
 const request=new Request(url,{method:req.method,headers:req.headers,body,duplex:'half'});
 const response=await(url.pathname==='/api/admin/pe03'?instructor:student)(request);
 if(dropSubmission&&JSON.parse(body).operation==='submit'){dropSubmission=false;res.destroy();return;}
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
 }
 if(url.pathname==='/away'){res.end('<!doctype html><title>Local navigation test</title><p>Away from activity</p>');return;}
 if(['/staff/action-proof.js','/staff/security.css'].includes(url.pathname)){res.setHeader('content-type',url.pathname.endsWith('.js')?'text/javascript':'text/css');res.end(await fs.readFile(new URL('../../public/statecourse'+url.pathname,import.meta.url)));return;}
 const files={'/student/pe03/':'index.html','/student/pe03/pe03.mjs':'pe03.mjs','/student/pe03/pe03.css':'pe03.css'};
 const file=files[url.pathname];if(!file){res.writeHead(404).end();return;}
 res.setHeader('content-type',file.endsWith('.mjs')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
 res.end(await fs.readFile(new URL('../../public/statecourse/student/pe03/'+file,import.meta.url)));
 }catch(e){report.errors.push(e.message);res.writeHead(500).end('local harness error');}});
try{
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;process.env.STATECOURSE_BASE_URL=origin;
 browser=await chromium.launch({headless:process.env.PE_CHROMIUM_HEADED!=='1',...(process.env.PE_CHROMIUM?{executablePath:process.env.PE_CHROMIUM}:{}),args:['--no-sandbox']});
 report.browser={version:browser.version(),headed:process.env.PE_CHROMIUM_HEADED==='1',focusEmulation:false,screenshotBackend:process.env.PLAYWRIGHT_LEGACY_SCREENSHOT?'legacy':'new-surface'};
 const newLearner=async actor=>{const context=await browser.newContext({viewport:{width:1100,height:900}});await context.addCookies([{name:'pe-fixture-actor',value:actor,url:origin}]);await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());const page=await context.newPage();const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setFocusEmulationEnabled',{enabled:false});page.on('pageerror',e=>report.errors.push(e.message));await page.goto(`${origin}/student/pe03/?cohort=${ids.cohort}${actor==='instructor'?'&role=instructor':''}`);await page.locator('#activity').waitFor({state:'visible'});await page.bringToFront();await page.waitForFunction(()=>document.visibilityState==='visible'&&document.hasFocus(),{},{timeout:10000});return {context,page};};
 const a=await newLearner('a');
 assert.equal(await a.page.locator('#send').isEnabled(),false);
 await a.page.screenshot({path:path.join(out,'01-initial-desktop.png')});
 const qualify=async(page,actor)=>{await page.bringToFront();await page.locator('#study').click();const start=Date.now();await page.waitForFunction(()=>document.getElementById('progress').textContent.includes('initial-submission'),{},{timeout:60000});await page.locator('#study').click();await page.waitForFunction(()=>!document.getElementById('study').disabled);const s=await f.state(ids[actor]);report.realTiming.push({actor,wallMs:Date.now()-start,observedMs:s.observedMs});assert.ok(s.observedMs>=30000);assert.ok(s.observedMs<=Date.now()-start+1000);};
 // Playwright enables focus emulation by default. Disable it above so actual browser tab visibility/focus, not an always-focused page, drives the lifecycle.
 // No synthetic visibility events: actual offline transport and tab switches.
 await a.page.locator('#study').click();await a.page.waitForFunction(()=>document.getElementById('study').textContent==='Take a break'&&!document.getElementById('study').disabled);
 await a.context.setOffline(true);await a.page.waitForTimeout(1200);await a.context.setOffline(false);
 assert.equal(await a.page.locator('#study').innerText(),'Start observed work');assert.equal((await f.state(ids.a)).observedMs,0);
 await a.page.locator('#study').click();await a.page.waitForFunction(()=>document.getElementById('study').textContent==='Take a break'&&!document.getElementById('study').disabled);
 const away=await a.context.newPage();await away.goto(origin+'/away');await away.bringToFront();
 await a.page.waitForFunction(()=>document.visibilityState==='hidden',{},{timeout:10000});await a.page.waitForTimeout(1200);await a.page.bringToFront();await away.close();
 await a.page.waitForFunction(()=>document.getElementById('study').textContent==='Start observed work'&&!document.getElementById('study').disabled);
 assert.equal((await f.state(ids.a)).observedMs,0);report.checks.push('Actual Chromium offline/reconnect and hidden/background tab transitions earn no gap time and do not auto-resume');
 await qualify(a.page,'a');
 await a.page.locator('#response').fill('E01 is borrower-reported. E03 has a missing page; request it before treating the balance as verified. E04 is separately documented savings.');
 dropSubmission=true;await a.page.locator('#send').click();await a.page.waitForFunction(()=>document.getElementById('status').textContent.includes('response was interrupted'));await a.page.locator('#retry').waitFor({state:'visible'});
 await a.page.reload();await a.page.waitForFunction(()=>document.getElementById('status').textContent.includes('Server record saved'));
 assert.equal((await f.db.query("select count(*)::int n from pe03_events where actor_id=$1 and kind='submit'",[ids.a])).rows[0].n,1);
 report.checks.push('Real ≥30s observation; premature submit blocked; lost-response retry after refresh preserves exactly one immutable submission and draft');
 const b=await newLearner('b');await qualify(b.page,'b');
 await b.page.locator('#response').fill('E03 needs the missing page. I would ask for the complete record and keep E01 borrower claims separate from the E04 documented savings.');await b.page.locator('#send').click();await b.page.waitForFunction(()=>document.getElementById('progress').textContent.includes('peer-dialogue'));
 await b.page.locator('#response').fill('Your missing-page request is specific. Distinguish the application figure from the savings statement and explain why unresolved checking evidence cannot be treated as verified.');await b.page.locator('#send').click();await b.page.waitForFunction(()=>document.querySelector('#evidence').textContent.includes('peer'));
 const teacher=await newLearner('instructor');await teacher.page.locator('#response').fill('Keep the original analysis. Respond to the peer point and use E10 to describe what changed without erasing the unresolved checking evidence or promising loan approval.');await teacher.page.locator('#send').click();await teacher.page.waitForFunction(()=>document.querySelector('#evidence').textContent.includes('feedback'));
 await a.page.bringToFront();await a.page.locator('#refresh').click();await a.page.waitForFunction(()=>document.getElementById('progress').textContent.includes('Stage: revision'));
 assert.equal(await a.page.locator('#materials').getByText('E10 · Versioned application update and re-review memo M2',{exact:true}).count(),1);
 await a.page.locator('#response').fill('Revision after the instructor and peer: retain E01 claims and E04 savings as distinct sources. E10 changes the debt analysis, while E03 remains incomplete. Request the page and do not make an approval promise.');await a.page.locator('#send').click();await a.page.waitForFunction(()=>document.getElementById('progress').textContent.includes('revised-noncredit'));
 await a.page.screenshot({path:path.join(out,'02-revised-desktop.png')});
 report.checks.push('Two synthetic learners and the assigned instructor complete immutable initial → distinct peer → feedback → learner revision through UI/HTTP/PostgreSQL');
 const before=(await f.state(ids.a)).observedMs;
 await a.page.goto(origin+'/away');await a.page.goBack();await a.page.locator('#activity').waitFor({state:'visible'});assert.match(await a.page.locator('#progress').innerText(),/revised-noncredit/);assert.equal(await a.page.locator('#study').innerText(),'Start observed work');
 await a.page.goForward();await a.page.goBack();await a.page.locator('#activity').waitFor({state:'visible'});
 await a.page.setViewportSize({width:390,height:844});await a.page.screenshot({path:path.join(out,'03-mobile-history.png')});
 assert.ok(await a.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await a.page.waitForTimeout(1200);assert.equal((await f.state(ids.a)).observedMs,before);
 report.checks.push('Refresh, Back/Forward and mobile viewport preserve server history, pause observation and avoid horizontal overflow');
 assert.equal(await a.page.locator('#study').isEnabled(),false);
 report.checks.push('Observed initial preparation is closed after submission; dialogue waiting cannot earn time');
 // Add evidence in another cohort through the real RPC so scope checks have an exclusion witness.
 const other=await f.call(ids.b,'student',f.request('observe',{cohortId:ids.other,tabId:ids.tabB,mode:'paused'}));
 const downloadEvidence=async(page,filename)=>{await page.bringToFront();const pending=page.waitForEvent('download');await page.locator('#export').click();const downloaded=await pending;await downloaded.saveAs(path.join(out,filename));return JSON.parse(await fs.readFile(path.join(out,filename),'utf8'));};
 const state=await downloadEvidence(teacher.page,'synthetic-cohort-evidence.json');
 assert.equal(state.role,'instructor');assert.equal(state.actorId,ids.instructor);assert.equal(state.cohort.id,ids.cohort);
 assert.equal(state.cohort.assignedInstructorId,ids.instructor);assert.equal(state.definition.contentHash,state.cohort.contentHash);
 const initial=state.evidence.filter(e=>e.kind==='submit'&&e.actorId===ids.a);assert.equal(initial.length,1);
 const peers=state.evidence.filter(e=>e.kind==='peer'&&e.targetId===initial[0].id);assert.equal(peers.length,1);assert.equal(peers[0].actorId,ids.b);
 const feedback=state.evidence.filter(e=>e.kind==='feedback'&&e.targetId===initial[0].id);assert.equal(feedback.length,1);assert.equal(feedback[0].actorId,ids.instructor);assert.equal(feedback[0].body.peerId,peers[0].id);
 const revision=state.evidence.filter(e=>e.kind==='revise'&&e.actorId===ids.a);assert.equal(revision.length,1);assert.equal(revision[0].targetId,feedback[0].id);assert.equal(revision[0].body.initialId,initial[0].id);assert.equal(revision[0].body.peerId,peers[0].id);
 assert.ok(initial[0].sequence<peers[0].sequence&&peers[0].sequence<feedback[0].sequence&&feedback[0].sequence<revision[0].sequence);
 assert.equal(initial[0].body.text,'E01 is borrower-reported. E03 has a missing page; request it before treating the balance as verified. E04 is separately documented savings.');
 const stored=await f.state(ids.instructor);assert.deepEqual(state.evidence,stored.evidence);assert.equal(state.evidence.some(e=>e.id===other.receiptId),false);
 const studentExport=await downloadEvidence(a.page,'synthetic-learner-evidence.json');assert.equal(studentExport.role,'student');assert.equal(studentExport.actorId,ids.a);assert.equal(studentExport.cohort.id,ids.cohort);
 assert.deepEqual(studentExport.evidence,state.evidence.filter(e=>e.actorId===ids.a||e.kind==='submit'||(['peer','feedback'].includes(e.kind)&&e.targetId===initial[0].id)));
 assert.ok(state.evidence.some(e=>e.actorId===ids.b&&e.kind==='observe'));assert.equal(studentExport.evidence.some(e=>e.actorId===ids.b&&e.kind==='observe'),false);assert.equal(studentExport.evidence.some(e=>e.id===other.receiptId),false);
 for(const exported of [state,studentExport])for(const flag of ['creditEligible','certificateEligible','bankingEligible','durationValidated'])assert.equal(exported[flag],false);
 report.checks.push('Actual instructor/learner JSON downloads match stored initial → distinct peer → assigned feedback → revision lineage, preserve original text, exclude other-cohort evidence and other-learner observations, and retain false credit flags');
 assert.deepEqual(report.errors,[]);report.completed=true;
}catch(error){report.failure={name:error.name,message:error.message};throw error;}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));await f.db.close();report.finished=new Date().toISOString();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
