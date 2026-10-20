// Synthetic HTTP fixtures exercise actual built portal pages. No real accounts,
// production writes or provider generation are used by this verifier.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getCourseDelivery,getCourseQuestion} from '../config/course-registry.mjs';
import {publicBlockQuestion} from '../config/california-block-engine.mjs';
import {executeNmlsTraining} from '../netlify/functions/_lib/nmls-training-service.mjs';
import {getNmlsReviewCourse} from '../netlify/functions/_lib/nmls-review-content.mjs';
import {getNmlsDraftFinalDefinition} from '../lib/nmls-final-authoring-content.mjs';
import {NMLS_TRAINING_COURSE as identity} from '../config/nmls-course-identity.mjs';
const {chromium}=await import(pathToFileURL(process.env.LEARNING_COACH_TEST_PLAYWRIGHT));
const browser=await chromium.launch({executablePath:process.env.LEARNING_COACH_CHROMIUM??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
fs.mkdirSync('work/coach-browser',{recursive:true});
const courseId='ca-real-estate-principles-45',delivery=getCourseDelivery(courseId,'assignment-01');
try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const block=structuredClone(delivery.blocks[0]),reading={...block.screens[0],completed:true},retrieval={...block.screens.find(s=>s.type==='retrieval')};
 retrieval.question=publicBlockQuestion(getCourseQuestion(courseId,retrieval.questionId));block.screens=[reading,retrieval];block.status='IN_PROGRESS';
 const payload={mode:'student',reviewNotice:null,course:{courseId,title:'California Real Estate Principles',version:'1'},assignment:{sequence:1,of:15,contentPath:delivery.contentPath,regulatory:{}},header:{courseProgress:{completed:0,total:15},currentAssignment:{mastered:0,blocks:1},studyTimeSeconds:0},blocks:[block],position:{blockId:block.id,screenId:reading.id}};
 let modelCalls=0;
 await page.route('**/api/student/blocks*',route=>route.fulfill({json:payload}));
 await page.route('**/api/student/course',route=>route.fulfill({json:{creditedSeconds:0}}));
 await page.route('**/api/learning/coach',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:{provider:'openai',enabled:true}});
  modelCalls++;const b=route.request().postDataJSON();assert.equal(b.courseId,courseId);assert.equal(b.questionId,null);
  return route.fulfill({json:{requestId:b.requestId,digest:b.digest,version:b.version,status:'answer',explanation:'SYNTHETIC PORTAL COACH RESPONSE',nextStep:'Review this lesson.',sources:[],nextQuestionId:null,practiceNote:'Practice only.'}});
 });
 await page.goto('http://127.0.0.1:8082/student/course/blocks/?enrollment_id='+randomUUID()+'&assignment=assignment-01');
 const panel=page.getByRole('region',{name:'AI lesson coach'});await panel.waitFor();await panel.locator('textarea').fill('Explain real property.');await panel.locator('input[type=checkbox]').check();await panel.getByRole('button',{name:'Send to AI coach',exact:true}).click();await panel.getByText('SYNTHETIC PORTAL COACH RESPONSE').waitFor();
 await page.screenshot({path:`work/coach-browser/portal-real-estate-${width}.png`,fullPage:true});
 await page.locator('#continueScreen').click();await page.getByRole('heading',{name:retrieval.title,exact:true}).waitFor();assert.equal(await panel.isVisible(),false);assert.equal(modelCalls,1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);await page.close();

 const mortgage=await browser.newPage({viewport:{width,height:900}});mortgage.on('pageerror',e=>errors.push(e.message));
 const actor=randomUUID(),enrollmentId=randomUUID(),events=new Map(),source=getNmlsReviewCourse(identity.contentKey),definition=getNmlsDraftFinalDefinition(source.id);let runtime=null,revision=0,now=Date.UTC(2026,8,13);
 const context=eventId=>({enrollmentId,studentId:actor,courseId:identity.id,courseVersion:identity.version,reviewRole:null,contentDigest:source.digest,definitionDigest:definition.digest,revision,runtime:structuredClone(runtime),serverTimeMs:now,event:events.get(eventId)??null});
 const rpc=async(name,p)=>{if(name==='nmls_training_context')return context(p.p_event_id);revision++;runtime=structuredClone(p.p_runtime);events.set(p.p_event_id,{command_digest:p.p_command_digest,audit:p.p_audit});return {...context(p.p_event_id),replayed:false};};
 await mortgage.route('**/api/student/nmls/training',async route=>{now++;const result=await executeNmlsTraining(route.request().postDataJSON(),actor,{rpc});await route.fulfill({status:result.status,json:result.body});});
 await mortgage.route('**/api/learning/coach',route=>route.fulfill({json:{provider:'gemini',enabled:true}}));
 await mortgage.route('**/api/student/nmls/coach',async route=>{const b=route.request().postDataJSON();assert.equal(b.consentProvider,'gemini');assert.equal(b.enrollmentId,enrollmentId);assert.equal(b.unitId,runtime.source.current.unitId);await route.fulfill({json:{status:'answer',explanation:'SYNTHETIC MORTGAGE COACH RESPONSE',nextStep:'Review the source.',sources:[]}});});
 await mortgage.goto('http://127.0.0.1:8082/student/nmls-training/?enrollment_id='+enrollmentId);
 await mortgage.locator('#resumeTraining').click();await mortgage.locator('[data-unit]').first().click();
 const mp=mortgage.getByRole('region',{name:'Mortgage lesson coach'});await mp.waitFor();await mp.getByText('AI provider: Google Gemini',{exact:true}).waitFor();
 await mp.locator('textarea').fill('Explain this mortgage lesson.');await mp.locator('input[type=checkbox]').check();const savedRevision=revision;await mp.getByRole('button',{name:'Ask about this lesson',exact:true}).click();await mp.getByText('SYNTHETIC MORTGAGE COACH RESPONSE').waitFor();assert.equal(revision,savedRevision);
 await mortgage.screenshot({path:`work/coach-browser/portal-mortgage-${width}.png`,fullPage:true});await mortgage.locator('#pauseTraining').click();assert.equal(await mp.count(),0);assert.equal(await mortgage.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({width,realEstateReading:true,retrievalCoachHidden:true,mortgageCurrentUnit:true,geminiDisclosure:true,coachDoesNotWriteProgress:true,pauseClearsCoach:true,consoleErrors:errors}));await mortgage.close();
}}finally{await browser.close();}
