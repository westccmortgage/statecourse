// Run after `bash site/build.sh`. Uses local Chromium and mocked APIs only.
// STATECOURSE_PLAYWRIGHT_MODULE may point to an installed Playwright index.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../dist/',import.meta.url));
const {chromium}=await import(process.env.STATECOURSE_PLAYWRIGHT_MODULE||'playwright');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.vtt':'text/vtt'};
const server=createServer(async(req,res)=>{
 try {
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root))throw Error('outside build');
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  res.setHeader('content-type',mime[path.extname(file)]||'application/octet-stream');
  res.end(await readFile(file));
 }catch{res.statusCode=404;res.end('Not found');}
});

test('rendered entry, signup, notification and practice journeys (local mocked APIs)',async t=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({executablePath:process.env.STATECOURSE_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 t.after(()=>browser.close());
 async function fixture(options={}){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  t.after(()=>context.close());
  const page=await context.newPage(),calls=[],errors=[];let signedIn=Boolean(options.signedIn),failNotify=Boolean(options.failNotify);
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.origin!==base)return route.abort(); // Never contact production or an email provider.
   const json=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
   if(url.pathname==='/api/student/session'){
    if(req.method()==='POST')signedIn=true;
    return json(signedIn?{student:{id:'local-browser-fixture'}}:{error:'unauthorized'},options.sessionFailure?503:signedIn?200:401);
   }
   if(url.pathname==='/api/student/register'){
    calls.push({kind:'register',...req.postDataJSON()});
    if(options.registerFailure)return json({error:'student_auth_unavailable'},503);
    signedIn=!options.confirmation;
    return json({confirmationRequired:Boolean(options.confirmation)},201);
   }
   if(url.pathname==='/api/student/learning-path'){
    const body=req.postDataJSON();calls.push({kind:'interest',...body});
    if(body.notify&&failNotify){failNotify=false;return json({error:'learning_path_unavailable'},503);}
    return json({saved:true,entry:body,notificationRequested:body.notify===true});
   }
   if(url.pathname==='/api/payments/config')return json({mode:options.live?'live':'test',productionPaymentsEnabled:Boolean(options.live),courses:options.courses||[{id:'qa-credit',state:'CA',productType:'real_estate_prelicense',name:'QA must stay hidden',checkoutEnabled:true,qaOnly:true}],training:{available:!options.unknownTraining,courses:options.noPractice?[]:[{id:'nmls-ce-2026-comprehensive-8',state:'US',name:'National mortgage practice'}]}});
   if(url.pathname==='/api/enroll/training'){
    calls.push({kind:'training',...req.postDataJSON()});
    return json({origin:'training',creditEligible:false,href:'/student/nmls-training/?enrollment_id=local-fixture'});
   }
   if(url.pathname==='/student/nmls-training/')return route.fulfill({contentType:'text/html',body:'<h1>Existing NMLS training runtime destination</h1>'});
   if(url.pathname.startsWith('/api/'))return json({enabled:false});
   return route.continue();
  });
  return {page,calls,errors};
 }
 async function register(page){
  for(const [name,value]of Object.entries({firstName:'Sample',lastName:'Student',email:'sample@example.test',password:'Local-test-password-2026!',passwordConfirm:'Local-test-password-2026!'}))await page.locator(`[name="${name}"]`).fill(value);
  await page.locator('#studentRegister button[type=submit]').click();
 }
 for(const vertical of ['real-estate','mortgage'])for(const goal of ['practice','licensed','renew']){
  await t.test(`${vertical}: ${goal} retains state and goal through registration`,async()=>{
   const {page,calls,errors}=await fixture();
   await page.goto(base+(vertical==='mortgage'?'/mortgage/':'/get-licensed/'));
   assert.equal(await page.locator('.entry-action').count(),3);
   await page.locator(`.entry-action a[href*="goal=${goal}"]`).click();
   await page.locator('#entryState').selectOption('CA');
   await page.locator('#entryStateForm button').click();
   await page.waitForURL('**/student/register/**');
   assert.match(await page.locator('#registerPathSummary').textContent(),/CA/);
   await register(page);
   if(goal==='practice'){
    await page.waitForURL(vertical==='mortgage'?'**/student/nmls-training/**':'**/free-practice/**');
    if(vertical==='real-estate'){
     await page.waitForFunction(()=>document.querySelector('#practiceContent')?.textContent.trim().length>100);
    }else assert.equal(calls.filter(c=>c.kind==='training').length,1);
   }else{
    await page.locator('#entryResult').waitFor({state:'visible'});
    assert.equal(await page.locator('#creditCourses a').count(),0,'test/QA payment offers remain hidden');
    assert.equal(calls.some(c=>c.notify),false,'notification consent is not automatic');
    await page.locator('#notifyAvailable').click();
    await page.waitForFunction(()=>document.querySelector('#notifyMessage').textContent.includes('saved'));
    const notify=calls.find(c=>c.notify);assert.deepEqual({vertical:notify.vertical,goal:notify.goal,state:notify.state},{vertical,goal,state:'CA'});
    await page.locator('#openPractice').click();
    await page.waitForURL(vertical==='mortgage'?'**/student/nmls-training/**':'**/free-practice/**');
   }
   const signup=calls.find(c=>c.kind==='register'),selection=new URL(signup.returnTo,base).searchParams;
   assert.equal(selection.get('vertical'),vertical);assert.equal(selection.get('goal'),goal);assert.equal(selection.get('state'),'CA');
   assert.equal(signup.nmlsId,undefined);assert.deepEqual(errors,[]);
  });
 }
 await t.test('email-confirmation screen and later sign-in retain the selected path',async()=>{
  const {page,calls,errors}=await fixture({confirmation:true});
  await page.goto(base+'/student/start/?vertical=mortgage&goal=renew&state=TX');
  await page.waitForURL('**/student/register/**');await register(page);
  await page.waitForFunction(()=>document.querySelector('#registerMessage').textContent.includes('Check your email'));
  await page.locator('#studentSignInLink').click();
  assert.equal(new URL(page.url()).searchParams.get('return_to'),'/student/start/?vertical=mortgage&goal=renew&state=TX');
  await page.locator('#email').fill('sample@example.test');await page.locator('#password').fill('Local-test-password-2026!');
  await page.locator('#studentSignIn button[type=submit]').click();
  await page.locator('#entryResult').waitFor({state:'visible'});
  assert.equal(calls.find(c=>c.kind==='interest').state,'TX');assert.deepEqual(errors,[]);
 });
 await t.test('failed signup and notification do not display success or blame the password',async()=>{
  const {page}=await fixture({registerFailure:true});
  await page.goto(base+'/student/register/');await register(page);
  await page.waitForFunction(()=>document.querySelector('#registerMessage').textContent.includes('temporarily unavailable'));
  assert.doesNotMatch(await page.locator('#registerMessage').textContent(),/already registered|password/i);
  const second=await fixture({signedIn:true,failNotify:true});
  await second.page.goto(base+'/student/start/?vertical=mortgage&goal=renew&state=CA');
  await second.page.locator('#notifyAvailable').click();
  await second.page.waitForFunction(()=>document.querySelector('#notifyMessage').textContent.includes('not saved'));
  assert.equal(await second.page.locator('#notifyAvailable').isDisabled(),false);
  await second.page.locator('#notifyAvailable').click();
  await second.page.waitForFunction(()=>document.querySelector('#notifyMessage').textContent.includes('is saved'));
 });
 await t.test('only live eligible courses for the selected goal and state appear',async()=>{
  const courses=[
   {id:'matching',state:'CA',productType:'real_estate_prelicense',name:'Matching live course',checkoutEnabled:true},
   {id:'wrong-goal',state:'CA',productType:'real_estate_continuing_education',name:'Wrong goal',checkoutEnabled:true},
   {id:'wrong-state',state:'TX',productType:'real_estate_prelicense',name:'Wrong state',checkoutEnabled:true},
   {id:'qa',state:'CA',productType:'real_estate_prelicense',name:'QA',checkoutEnabled:true,qaOnly:true},
   {id:'closed',state:'CA',productType:'real_estate_prelicense',name:'Closed',checkoutEnabled:false}
  ];
  const {page}=await fixture({signedIn:true,live:true,courses});
  await page.goto(base+'/student/start/?vertical=real-estate&goal=licensed&state=CA');
  await page.locator('#creditCourses a').waitFor();assert.equal(await page.locator('#creditCourses a').count(),1);
  assert.match(await page.locator('#creditCourses a').getAttribute('href'),/course=matching$/);
  assert.equal(await page.locator('#availabilityPanel').isVisible(),false);
 });
 await t.test('unknown training service status offers retry instead of false unavailability',async()=>{
  const {page}=await fixture({signedIn:true,unknownTraining:true});
  await page.goto(base+'/student/start/?vertical=mortgage&goal=renew&state=CA');
  await page.waitForFunction(()=>document.querySelector('#entryMessage').textContent.includes('Please try again'));
  assert.equal(await page.locator('#entryResult').isVisible(),false);
 });
 await t.test('anonymous direct practice links require signup and preserve the sample URL',async()=>{
  const {page}=await fixture();
  await page.goto(base+'/free-practice/?state=CA&course=ca-real-estate-principles-45-v1');
  await page.waitForURL('**/student/register/**');
  assert.equal(new URL(page.url()).searchParams.get('return_to'),'/free-practice/?state=CA&course=ca-real-estate-principles-45-v1');
 });
 await t.test('mobile and tablet entry screens have no horizontal overflow',async()=>{
  const {page,errors}=await fixture();
  for(const width of [390,1024])for(const route of ['/','/mortgage/','/get-licensed/']){
   await page.setViewportSize({width,height:900});await page.goto(base+route);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}: ${route}`);
   assert.equal(await page.locator(route==='/'?'.vertical-door':'.entry-action').count(),route==='/'?2:3);
   if(process.env.STATECOURSE_ENTRY_SCREENSHOTS){
    await mkdir(process.env.STATECOURSE_ENTRY_SCREENSHOTS,{recursive:true});
    await page.screenshot({path:path.join(process.env.STATECOURSE_ENTRY_SCREENSHOTS,`${width}-${route.replaceAll('/','')||'home'}.png`),fullPage:true});
   }
  }
  assert.deepEqual(errors,[]);
 });
});
