// Local-only acceptance. Usage: node scripts/verify-multi-state-practice-browser.mjs /absolute/path/to/playwright/index.mjs
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { PRIORITY_STATES } from '../config/free-practice/references.mjs';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const root=path.resolve(import.meta.dirname,'..'),dist=path.join(root,'dist');
const catalog=JSON.parse(fs.readFileSync(path.join(dist,'data/free-practice-catalog.json'),'utf8'));
const out=path.join(root,'reports/free-practice-expansion');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.md':'text/plain','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),file=path.resolve(dist,'.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));
  if(!file.startsWith(dist+path.sep)){res.writeHead(403).end();return;}
  if(url.pathname.startsWith('/api/')){res.writeHead(503,{'content-type':'application/json'}).end('{}');return;}
  try{res.writeHead(200,{'content-type':types[path.extname(file)]??'application/octet-stream'});res.end(fs.readFileSync(file));}
  catch{res.writeHead(404).end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
const results=[],errors=[],missing=[],posts=[];
try{
  browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext();
  await context.route('**/*',route=>{if(new URL(route.request().url()).origin!==origin)return route.abort();return route.continue();});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
  page.on('request',r=>{if(r.method()==='POST')posts.push(r.url());});
  for(const code of PRIORITY_STATES){
    await context.clearCookies();await page.setViewportSize({width:1280,height:900});
    const samples=catalog.samples.filter(s=>s.state_code===code),first=samples[0],slug=first.state_name.toLowerCase().replaceAll(' ','-');
    await page.goto(`${origin}/free-practice/${slug}/`);
    assert.match(await page.locator('main').innerText(),/No account required/);
    await page.locator('#practiceQuiz legend').waitFor();
    assert.equal(await page.locator('#practiceStateSelect').inputValue(),code);
    const data=JSON.parse(fs.readFileSync(path.join(dist,first.practice_url),'utf8'));
    assert.equal(await page.locator('#practiceCourseSelect').inputValue(),first.course_id);
    const question=data.questions.find(q=>q.lesson_id===data.lessons[0].id);
    assert.equal(await page.locator('#practiceQuiz legend').innerText(),question.prompt);
    await page.locator(`#practiceAnswerForm input[value="${question.solution}"]`).check();
    await page.locator('#practiceAnswerForm button').click();
    assert.match(await page.locator('#practiceFeedback').innerText(),/^Correct\./);
    assert.ok((await page.locator('#practiceFeedback').innerText()).includes(question.explanation));
    await page.reload();await page.locator('#practiceFeedback.is-correct').waitFor();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(overflow){await page.screenshot({path:path.join(out,'overflow.png'),fullPage:true});console.log(await page.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,id:e.id,cls:e.className,right:e.getBoundingClientRect().right})).slice(0,20)));}
    assert.equal(overflow,false,code+' desktop overflow');
    results.push({state:code,noAccount:true,graded:true,explanation:true,restored:true});
    if(code==='TX')await page.screenshot({path:path.join(out,'texas-desktop.png')});
    for(const width of [320,390,1100]){
      await page.setViewportSize({width,height:844});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${code} ${width}px overflow`);
      if(code==='FL'&&width===390){await page.locator('#practiceFeedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'florida-mobile.png')});}
    }
  }
  // Exercise the corrected current-law question through the actual anonymous player.
  const co=catalog.samples.find(sample=>sample.course_id==='co-contracts-regulations-48');
  const coCourse=JSON.parse(fs.readFileSync(path.join(dist,'free-practice/courses',co.course_id+'.json'),'utf8'));
  const coQuestion=coCourse.questions.find(question=>question.prompt.startsWith('Under current C.R.S. § 12-10-403(2)'));
  assert.ok(coQuestion,'current Colorado relationship question missing');
  const coLessonQuestions=coCourse.questions.filter(question=>question.lesson_id===coQuestion.lesson_id);
  await page.goto(`${origin}/free-practice/colorado/?course=${co.course_id}&lesson=${coQuestion.lesson_id}&mode=quiz`);
  await page.locator('#practiceQuiz legend').waitFor();
  for(let index=0;index<coLessonQuestions.findIndex(question=>question.id===coQuestion.id);index++)await page.locator('[data-action="next-question"]').click();
  assert.equal(await page.locator('#practiceQuiz legend').innerText(),coQuestion.prompt);
  await page.locator(`#practiceAnswerForm input[value="${coQuestion.solution}"]`).check();
  await page.locator('#practiceAnswerForm button').click();
  assert.match(await page.locator('#practiceFeedback').innerText(),/HB26-1426/);
  assert.ok(coQuestion.sources.some(source=>source.url==='https://leg.colorado.gov/bills/hb26-1426'));
  assert.match(await page.locator('#practiceFeedback').getAttribute('class'),/is-correct/);
  const ny=catalog.samples.find(s=>s.state_code==='NY');
  await page.goto(`${origin}/free-practice/?state=TX&course=${ny.course_id}&mode=quiz`);
  await page.locator('#practiceQuiz legend').waitFor();assert.equal(await page.locator('#practiceStateSelect').inputValue(),'TX');assert.ok((await page.locator('#practiceCourseSelect').inputValue()).startsWith('tx-'));
  await page.goto(`${origin}/free-practice/new-york/?state=TX&course=${catalog.samples.find(s=>s.state_code==='TX').course_id}&mode=quiz`);
  await page.locator('#practiceQuiz legend').waitFor();assert.equal(await page.locator('#practiceStateSelect').inputValue(),'NY');
  await page.setViewportSize({width:390,height:844});await page.goto(`${origin}/free-practice/`);await page.locator('#practice-states').waitFor();
  assert.equal(await page.locator('.content-card a[href*="free-practice/"]').count(),new Set(catalog.samples.map(s=>s.state_code)).size);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('#practice-states').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'directory-mobile.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(posts,[]);
  const report={browser:'Chrome headless',localOnly:true,currentColoradoRelationship:'written agreement correction graded correctly',states:results,widths:[1280,320,390,1100],conflictingStateCourseLink:'TX retained',pageErrors:errors,missingResources:missing,postRequests:posts};
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
