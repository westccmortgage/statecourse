import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.LEARNING_COACH_TEST_PLAYWRIGHT;
if(!modulePath){console.error('Set LEARNING_COACH_TEST_PLAYWRIGHT to an isolated Playwright index.mjs');process.exit(2);}
const {chromium}=await import(pathToFileURL(modulePath));
const output=path.resolve('work/coach-browser');fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.LEARNING_COACH_CHROMIUM??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8082/free-practice/?state=CA&course=ca-real-estate-principles-45&lesson=lesson-01&mode=quiz');
 const panel=page.getByRole('region',{name:'AI lesson coach'});await panel.waitFor();
 await page.locator('[data-action="next-question"]').click();
 await page.locator('input[name="answer"][value="1"]').check();await page.getByRole('button',{name:'Check answer',exact:true}).click();
 await page.getByRole('button',{name:'Help me understand',exact:true}).click();
 await panel.locator('textarea').fill('I thought bookshelves were always personal property because furniture can be moved.');
 await panel.locator('input[type="checkbox"]').check();
 await panel.getByRole('button',{name:'Send to AI coach'}).click();
 await page.getByText('The AI coach is unavailable. Ordinary practice still works.',{exact:true}).waitFor();
 await page.screenshot({path:`${output}/unavailable-${viewport.width}.png`,fullPage:true});
 let calls=0,last;
 await page.route('**/api/learning/coach',async route=>{if(route.request().method()==='GET'){await route.fulfill({json:{provider:'openai',enabled:false}});return;}calls++;last=route.request().postDataJSON();await route.fulfill({json:{requestId:last.requestId,version:last.version,digest:last.digest,status:'answer',explanation:'SYNTHETIC UI FIXTURE: Attachment and legal rights matter more than calling an item furniture.',nextStep:'Review the quoted distinction.',sources:[{id:'property-lesson',label:'lesson-01: Real and personal property',excerpt:'Real estate is land plus permanent improvements.',url:'/free-practice/?state=CA&course=ca-real-estate-principles-45&lesson=lesson-01&mode=read'}],nextQuestionId:'ca-real-estate-principles-45:7',practiceNote:'Existing formative practice; graded by code.'}});});
 await panel.getByRole('button',{name:'Retry same request'}).click();await panel.getByText('AI explanation — check the sources',{exact:true}).waitFor();
 assert.equal(calls,1);assert(last.message.includes('bookshelves'));
 await page.screenshot({path:`${output}/synthetic-response-${viewport.width}.png`,fullPage:true});
 await panel.getByRole('button',{name:'Try the next practice question'}).click();
 assert.match(await page.locator('legend').textContent(),/bookshelves/);
 await page.locator('input[name="answer"][value="0"]').check();await page.getByRole('button',{name:'Check answer',exact:true}).click();assert.match(await page.locator('#practiceFeedback').innerText(),/^Correct\./);
 await page.locator('#practiceCourseSelect').selectOption('ca-real-estate-practice-45');await page.waitForFunction(()=>document.querySelector('#practiceMessage').textContent.includes('formative practice'));
 await panel.waitFor();assert.equal(await panel.isVisible(),true);assert.equal(await panel.getByText('SYNTHETIC UI FIXTURE: Attachment and legal rights matter more than calling an item furniture.').count(),0);assert.equal(await panel.locator('input[type=checkbox]').isChecked(),false);assert.deepEqual(errors,[]);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false);
 console.log(JSON.stringify({viewport,ordinaryGrading:true,realDisabledHandler:true,syntheticCoachUI:true,nextQuestionGraded:true,genericCourseAvailable:true,previousAnswerCleared:true,consoleErrors:errors}));await page.close();
}}finally{await browser.close();}
