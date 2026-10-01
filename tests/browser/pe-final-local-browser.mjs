// Local native PostgreSQL + rendered browser; all identity/review releases below
// are synthetic fixture records, not human SME or regulatory approvals.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {peFinalFixture,ids} from '../helpers/pe-final-fixture.mjs';
import {launchPe03BrowserDriver} from '../helpers/pe03-browser-driver.mjs';
import {createPeFinalHandler} from '../../netlify/functions/_lib/nmls-pe-final-http.mjs';
import {createPeCourseHandler} from '../../netlify/functions/_lib/nmls-pe-course-http.mjs';
if(process.env.PE_COURSE_NATIVE_CI!=='1')throw new Error('Native isolated final acceptance required');
const out=path.resolve('artifacts/pe-final/browser');await fs.mkdir(out,{recursive:true});
const f=await peFinalFixture();await f.qualify({pendingUnit:'1A'});const drivers=[];
const report={completed:false,fixture:f.metadata,checks:[],requests:[],errors:[],productionTouched:false,humanApprovalEstablished:false,regulatoryApprovalEstablished:false};
let origin,drop=null;
const authenticate=async event=>{const actor=ids[event.headers.cookie?.match(/pe-fixture-actor=([a-z]+)/)?.[1]];if(!actor)throw new Error('student_auth_required');return {student:{id:actor}};};
const handlers={
 '/api/student/pe-final':createPeFinalHandler('student',{enabled:()=>true,authenticate,rpc:f.rpc,bank:f.bank}),
 '/api/admin/pe-final':createPeFinalHandler('instructor',{enabled:()=>true,authenticate,rpc:f.rpc,bank:f.bank}),
 '/api/student/pe-course':createPeCourseHandler('student',{enabled:()=>true,authenticate,rpc:f.course.rpc}),
 '/api/admin/pe-course':createPeCourseHandler('instructor',{enabled:()=>true,authenticate,rpc:f.course.rpc}),
};
const files={'/student/pe-final/':'student/pe-final/index.html','/student/pe-final/pe-final.mjs':'student/pe-final/pe-final.mjs','/student/pe-course/course.css':'student/pe-course/course.css','/staff/action-proof.js':'staff/action-proof.js','/staff/security.css':'staff/security.css'};
const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url,origin);
 if(handlers[url.pathname]){const chunks=[];for await(const chunk of req)chunks.push(chunk);const raw=Buffer.concat(chunks),input=JSON.parse(raw);const response=await handlers[url.pathname](new Request(url,{method:req.method,headers:req.headers,body:raw,duplex:'half'}));report.requests.push({path:url.pathname,operation:input.operation,requestId:input.requestId||null,status:response.status});if(drop===input.operation){assert.equal(response.status,200,'Only drop committed successful responses');res.destroy();return;}res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;}
 if(url.pathname==='/away'){res.end('<!doctype html><title>Away</title><p>Local history fixture</p>');return;}
 const file=files[url.pathname];if(!file){res.writeHead(404).end();return;}res.setHeader('content-type',/\.m?js$/.test(file)?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(await fs.readFile(new URL('../../public/statecourse/'+file,import.meta.url)));
 }catch(e){report.errors.push(e.message);res.writeHead(500).end('Local fixture failure');}});
try{
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;process.env.STATECOURSE_BASE_URL=origin;
 const actorPage=async actor=>{const driver=await launchPe03BrowserDriver({origin,viewport:{width:1100,height:900},artifactDir:out});drivers.push(driver);await driver.context.addCookies([{name:'pe-fixture-actor',value:actor,url:origin}]);const page=await driver.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(`${origin}/student/pe-final/?course=${ids.course}${actor==='instructor'?'&role=instructor':''}`);await page.locator('#workspace').waitFor({state:'visible'});await driver.focus(page);return {driver,page,context:driver.context};};
 const idle=page=>page.waitForFunction(()=>!document.getElementById('refresh').disabled);
 const a=await actorPage('a');assert.equal(await a.page.locator('#begin').isEnabled(),false);assert.match(await a.page.locator('#holds').innerText(),/learning checks required/);await a.page.screenshot({path:path.join(out,'01-learning-check-hold.png')});
 const staff=await actorPage('instructor');await staff.page.locator('#decision').selectOption('revise');await staff.page.locator('#checkResponse').fill('Explain which record supports the decision and identify the owner of the unresolved condition. Preserve the earlier response.');await staff.page.locator('#saveCheck').click();await idle(staff.page);
 await a.page.bringToFront();await a.page.locator('#refresh').click();await idle(a.page);await a.page.locator('#checkResponse').fill('Revised check: the supplied record supports receipt only. The assigned reviewer must clear the remaining condition using the identified evidence; I preserve the unresolved status.');await a.page.locator('#saveCheck').click();await idle(a.page);
 await staff.page.bringToFront();await staff.page.locator('#refresh').click();await idle(staff.page);await staff.page.locator('#decision').selectOption('accepted');await staff.page.locator('#checkResponse').fill('The revised response now separates receipt from clearance and identifies the supported next owner and evidence. This teaching check is accepted.');await staff.page.locator('#saveCheck').click();await idle(staff.page);
 await a.page.bringToFront();await a.page.locator('#refresh').click();await idle(a.page);assert.equal(await a.page.locator('#begin').isEnabled(),true);report.checks.push('Actual learner check revision and assigned-instructor disposition unblock only the synthetic released fixture');
 drop='begin';await a.page.locator('#begin').click();await a.page.waitForFunction(()=>document.getElementById('status').textContent.includes('interrupted'));drop=null;await a.page.reload();await a.page.locator('#examForm').waitFor({state:'visible'});await idle(a.page);assert.equal(await a.page.locator('#questions fieldset').count(),25);assert.equal((await f.db.query('select count(*)::int n from pe_final_attempts')).rows[0].n,1);
 await a.page.locator('#submitExam').click();assert.match(await a.page.locator('#status').innerText(),/Answer every question/);
 let current=await f.state(ids.a);const firstId=current.attempt.attemptId,firstForm=(await f.db.query('select form from pe_final_attempts where id=$1',[firstId])).rows[0].form;
 const fillAnswers=async(page,form,count)=>{for(const [id,choice] of Object.entries(f.answers(form,count)))await page.locator(`input[name="${id}"][value="${choice}"]`).check();};
 await fillAnswers(a.page,firstForm,17);await a.page.reload();await a.page.locator('#examForm').waitFor({state:'visible'});assert.equal(await a.page.locator('#questions input:checked').count(),25);await a.page.screenshot({path:path.join(out,'02-protected-form-desktop.png')});
 await a.page.goto(`${origin}/away`);assert.equal(await a.page.title(),'Away');
 await a.page.goBack();await a.page.locator('#examForm').waitFor({state:'visible'});await idle(a.page);assert.equal(await a.page.locator('#questions input:checked').count(),25);
 await a.page.goForward();assert.equal(await a.page.title(),'Away');await a.page.goBack();await a.page.locator('#examForm').waitFor({state:'visible'});await idle(a.page);
 assert.equal(await a.page.locator('#questions input:checked').count(),25);assert.equal((await f.state(ids.a)).attempt.attemptId,firstId);assert.equal((await f.db.query('select count(*)::int n from pe_final_attempts')).rows[0].n,1);
 assert.equal(await a.page.locator('#decision').isVisible(),false);assert.equal(await a.page.locator('#grade').innerText(),'');
 report.checks.push('Back/Forward navigation restores the same active attempt and all answer drafts without a new form or instructor controls');
 const response=await a.page.evaluate(async()=>{const r=await fetch('/config/nmls/pe-final/bank-candidate.json');return r.status;});assert.equal(response,404);
 drop='submit';await a.page.locator('#submitExam').click();await a.page.waitForFunction(()=>document.getElementById('status').textContent.includes('interrupted'));drop=null;await a.page.reload();await a.page.waitForFunction(()=>document.getElementById('grade').textContent.includes('17/25'));await idle(a.page);assert.equal(await a.page.locator('#questions fieldset').count(),0);
 assert.equal((await f.db.query("select count(*)::int n from pe_final_receipts where actor_id=$1 and request->>'operation'='submit'",[ids.a])).rows[0].n,1);assert.equal(await a.page.locator('#begin').isEnabled(),false);
 report.checks.push('25-question protected form, required answers, answer-draft reload and original-ID begin/submit recovery; no static bank URL');
 current=await f.state(ids.a);await f.prepareChecks({modules:current.grade.remediationModules});await a.page.locator('#refresh').click();await idle(a.page);assert.equal(await a.page.locator('#begin').isEnabled(),true);await a.page.locator('#begin').click();await a.page.locator('#examForm').waitFor({state:'visible'});await idle(a.page);
 current=await f.state(ids.a);const secondForm=(await f.db.query('select form from pe_final_attempts where id=$1',[current.attempt.attemptId])).rows[0].form;assert.equal(secondForm.questionIds.filter(id=>firstForm.questionIds.includes(id)).length,0);
 await fillAnswers(a.page,secondForm,18);await a.page.locator('#submitExam').click();await a.page.waitForFunction(()=>document.getElementById('grade').textContent.includes('18/25'));await idle(a.page);assert.equal(await a.page.locator('#questions fieldset').count(),0);assert.equal(await a.page.locator('#begin').isVisible(),false);
 current=await f.state(ids.a);assert.equal(current.grade.passed,true);assert.equal(current.grade.attemptNumber,2);for(const flag of ['creditEligible','certificateEligible','bankingEligible'])assert.equal(current[flag],false);
 await a.page.setViewportSize({width:390,height:844});await a.page.locator('#grade').scrollIntoViewIfNeeded();await a.page.screenshot({path:path.join(out,'03-private-result-mobile.png')});assert.equal(await a.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 report.checks.push('Fresh accepted remediation, complementary retake, 18/25 boundary and no third attempt/credit issuance');report.result=current.grade;
 const b=await actorPage('b');assert.equal(await b.page.locator('#questions fieldset').count(),0);assert.equal(await b.page.locator('#begin').isEnabled(),false);assert.equal((await f.state(ids.b)).grade,null);report.checks.push('Other enrolled learner receives neither protected form nor another learner grade');
 report.completed=true;
}finally{await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));for(const driver of drivers)await driver.close();await new Promise(resolve=>server.close(resolve));await f.db.close();}
assert.equal(report.completed,true);assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
