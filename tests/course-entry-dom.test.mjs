import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
import {courseEntry,entryPath,ENTRY_STATES} from '../public/statecourse/course-entry-context.mjs';

// Actual entry HTML/controller, with Auth, storage and enrollment transports
// replaced. These are interaction tests, not browser or production evidence.
const html=readFileSync(new URL('../public/statecourse/student/start/index.html',import.meta.url),'utf8');
const source=readFileSync(new URL('../public/statecourse/student/start/start.mjs',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'');
const catalog=JSON.parse(readFileSync(new URL('../public/statecourse/data/free-practice-catalog.json',import.meta.url)));
const registry=JSON.parse(readFileSync(new URL('../public/statecourse/data/state-registry.json',import.meta.url)));
const settle=async()=>{for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve));};
async function fixture({vertical='mortgage',goal='renew',state='CA',authenticated=true,notifyFailure=false,trainingUnknown=false,trainingResponse=null,live=false,courses=[],noPractice=false,sessionFailure=false,nmlsFailure=false}={}){
 const {document,window}=parseHTML(html),select=document.getElementById('entryState'),calls=[],navigations=[];
 let stateValue='';
 Object.defineProperty(select,'value',{get:()=>stateValue,set:value=>{stateValue=value;}});
 select.add=option=>select.append(option);
 const location={origin:'https://statecourse.test',pathname:'/student/start/',search:'?'+new URLSearchParams({vertical,goal,state}),
  replace:path=>navigations.push(path),assign:path=>navigations.push(path)};
 const fetch=async(url,options={})=>{
  calls.push({url,...options,body:options.body&&JSON.parse(options.body)});
  if(url==='/api/student/session')return Response.json({}, {status:sessionFailure?503:authenticated?200:401});
  if(url==='/api/student/learning-path')return Response.json({saved:true},{status:notifyFailure&&JSON.parse(options.body).notify?503:200});
  if(url==='/api/student/portal')return nmlsFailure?Response.json({error:'nmls_id_not_digits'},{status:400}):Response.json({ok:true,nmlsIdentity:{present:true,value:'123456'}});
  if(url==='/api/payments/config')return Response.json({mode:live?'live':'test',productionPaymentsEnabled:live,courses,training:{available:!trainingUnknown,courses:noPractice?[]:[{id:'nmls-ce-2026-comprehensive-8'}]}});
  if(url==='/data/state-registry.json')return Response.json(registry);
  if(url==='/data/free-practice-catalog.json')return Response.json(catalog);
  if(url==='/api/enroll/training')return Response.json(trainingResponse||{origin:'training',creditEligible:false,href:'/student/nmls-training/?enrollment_id=test-only'});
  throw Error('Unexpected request: '+url);
 };
 const context=vm.createContext({document,location,history:{replaceState(){}},fetch,URL,URLSearchParams,courseEntry,entryPath,ENTRY_STATES,
  Option:function(label,value){const o=document.createElement('option');o.textContent=label;o.value=value;return o;}});
 vm.runInContext(source,context);await settle();
 const click=async id=>{document.getElementById(id).dispatchEvent(new window.Event('click'));await settle();};
 const submit=async id=>{document.getElementById(id).dispatchEvent(new window.Event('submit',{cancelable:true}));await settle();};
 return {document,window,calls,navigations,click,submit};
}
for(const vertical of ['real-estate','mortgage'])for(const goal of ['practice','licensed','renew']){
 test(`${vertical}/${goal}: actual entry controller preserves selection and opens the correct practice`,async()=>{
  const f=await fixture({vertical,goal});
  const saved=f.calls.find(c=>c.url==='/api/student/learning-path').body;
  assert.deepEqual(saved,{vertical,goal,state:'CA'});assert.equal(f.calls.some(c=>c.body?.notify),false);
  if(goal!=='practice'){
   assert.equal(f.document.getElementById('entryResult').hidden,false);
   assert.equal(f.document.getElementById('availabilityPanel').hidden,false);
   await f.click('notifyAvailable');assert.equal(f.calls.filter(c=>c.body?.notify===true).length,1);
   assert.match(f.document.getElementById('notifyMessage').textContent,/is saved/);
   await f.click('openPractice');
  }
  assert.equal(f.navigations.length,1);
  if(vertical==='mortgage'){
   assert.match(f.navigations[0],/^\/student\/nmls-training\//);
   assert.deepEqual(f.calls.find(c=>c.url==='/api/enroll/training').body,{courseId:'nmls-ce-2026-comprehensive-8'});
  }else{
   const target=new URL(f.navigations[0],'https://statecourse.test');
   assert.equal(target.pathname,'/free-practice/');assert.equal(target.searchParams.get('state'),'CA');
   assert.ok(catalog.samples.some(s=>s.course_id===target.searchParams.get('course')&&s.state_code==='CA'));
   assert.equal(f.calls.some(c=>c.url==='/api/enroll/training'),false);
  }
 });
}
test('anonymous entry redirects to signup without a preference write or lost context',async()=>{
 const f=await fixture({authenticated:false,vertical:'real-estate',goal:'licensed',state:'TX'});
 assert.equal(new URL(f.navigations[0],'https://statecourse.test').searchParams.get('return_to'),entryPath({vertical:'real-estate',goal:'licensed',state:'TX'}));
 assert.equal(f.calls.some(c=>c.url==='/api/student/learning-path'),false);
});
test('notification persistence failure is visible and leaves retry enabled',async()=>{
 const f=await fixture({notifyFailure:true});await f.click('notifyAvailable');
 assert.match(f.document.getElementById('notifyMessage').textContent,/not saved/);
 assert.equal(f.document.getElementById('notifyAvailable').disabled,false);
});
test('test-mode, QA-only, closed, wrong-state and wrong-goal courses are never offered',async()=>{
 const course={id:'right',name:'Matching credit offer',state:'CA',productType:'real_estate_prelicense',checkoutEnabled:true};
 const courses=[course,{...course,id:'qa',qaOnly:true},{...course,id:'closed',checkoutEnabled:false},{...course,id:'state',state:'TX'},{...course,id:'renew',productType:'real_estate_continuing_education'}];
 const testMode=await fixture({vertical:'real-estate',goal:'licensed',courses});
 assert.equal(testMode.document.querySelectorAll('#creditCourses a').length,0);
 const live=await fixture({vertical:'real-estate',goal:'licensed',live:true,courses});
 assert.equal(live.document.querySelectorAll('#creditCourses a').length,1);
 assert.equal(live.document.querySelector('#creditCourses a').getAttribute('href'),'/enroll/?course=right');
 assert.equal(live.document.getElementById('availabilityPanel').hidden,true);
});
test('unknown service availability and failed Auth do not become a closed-course message',async()=>{
 for(const options of [{trainingUnknown:true},{sessionFailure:true}]){
  const f=await fixture(options);assert.equal(f.document.getElementById('entryResult').hidden,true);
  assert.match(f.document.getElementById('entryMessage').textContent,/Please try again/);assert.equal(f.navigations.length,0);
 }
});
test('training replies granting credit or redirecting externally cannot open practice',async()=>{
 for(const response of [{origin:'paid',creditEligible:true,href:'/student-course.html'},{origin:'training',creditEligible:false,href:'https://evil.test/'}]){
  const f=await fixture({goal:'practice',trainingResponse:response});assert.equal(f.navigations.length,0);
  assert.match(f.document.getElementById('practiceMessage').textContent,/could not be opened/);
 }
});
test('a state without authored practice receives notification and change-selection choices',async()=>{
 const state=[...ENTRY_STATES].find(code=>!catalog.samples.some(sample=>sample.state_code===code));
 const f=await fixture({vertical:'real-estate',goal:'practice',state});
 assert.equal(f.document.getElementById('openPractice').hidden,true);
 assert.equal(f.document.getElementById('availabilityPanel').hidden,false);
 assert.equal(f.navigations.length,0);
 assert.match(f.document.getElementById('changePath').getAttribute('href'),/get-licensed/);
});
test('homepage video CTA keeps its real link after the state finder moves inside Real Estate',async()=>{
 const {document,window:domWindow}=parseHTML(readFileSync(new URL('../public/statecourse/index.html',import.meta.url),'utf8'));
 Object.defineProperty(document,'currentScript',{value:{src:'https://statecourse.test/national.js'}});
 const requests=[],errors=[];
 const window={dispatchEvent(){},dataLayer:[],setTimeout,matchMedia:()=>({matches:true})};
 const context=vm.createContext({document,window,URL,CustomEvent:domWindow.CustomEvent,
  console:{error:e=>errors.push(e.message),warn:e=>errors.push(e.message)},
  fetch:async url=>{requests.push(String(url));return Response.json({});}});
 vm.runInContext(readFileSync(new URL('../public/statecourse/national.js',import.meta.url),'utf8'),context);
 await settle();
 document.getElementById('statecourseIntroVideo').dispatchEvent(new domWindow.Event('ended'));
 const event=new domWindow.Event('click',{cancelable:true});
 document.querySelector('[data-video-cta="choose-state"]').dispatchEvent(event);
 assert.equal(event.defaultPrevented,false);assert.deepEqual(errors,[]);
 assert.equal(requests.some(url=>url.includes('state-registry')||url.includes('course-catalog')),false);
 assert.equal(document.querySelector('[data-video-cta="choose-state"]').getAttribute('href'),'get-licensed/');
});
const ceOffer={id:'nmls-fixture',state:'US',productType:'mortgage_continuing_education',name:'Local CE fixture',checkoutEnabled:true};
test('real NMLS renewal registration requires a saved profile ID before displaying course links',async()=>{
 const f=await fixture({live:true,courses:[ceOffer]});
 assert.equal(f.document.getElementById('renewalIdentity').hidden,false);
 assert.equal(f.document.getElementById('creditCourses').hidden,true);
 f.document.getElementById('renewalNmlsId').value='123456';
 await f.submit('renewalIdentityForm');
 assert.deepEqual(f.calls.find(c=>c.url==='/api/student/portal').body,{nmlsId:'123456'});
 assert.equal(f.document.getElementById('creditCourses').hidden,false);
 assert.match(f.document.getElementById('renewalIdentityMessage').textContent,/NMLS ID saved/);
 assert.doesNotMatch(f.document.getElementById('renewalIdentityMessage').textContent,/identity verified|verification complete/i);
 f.document.getElementById('renewalNmlsId').dispatchEvent(new f.window.Event('input'));
 assert.equal(f.document.getElementById('creditCourses').hidden,true,'editing requires saving the corrected ID');
 assert.equal(f.calls.some(c=>c.url.includes('identity-check')),false,'registration must not launch BioSig before Rules of Conduct');
});
test('failed NMLS ID save keeps real renewal course registration closed',async()=>{
 const f=await fixture({live:true,courses:[ceOffer],nmlsFailure:true});
 f.document.getElementById('renewalNmlsId').value='wrong';await f.submit('renewalIdentityForm');
 assert.equal(f.document.getElementById('creditCourses').hidden,true);
 assert.match(f.document.getElementById('renewalIdentityMessage').textContent,/Enter your NMLS ID/);
});
test('practice and renewal waitlist accounts require neither an NMLS ID nor a BioSig call',async()=>{
 for(const options of [{goal:'practice',live:true,courses:[ceOffer]},{goal:'renew',courses:[ceOffer]}]){
  const f=await fixture(options);assert.equal(f.document.getElementById('renewalIdentity').hidden,true);
  assert.equal(f.calls.some(c=>c.url==='/api/student/portal'||c.url.includes('identity-check')),false);
 }
});
test('signup shows the BioSig course sequence only for Mortgage Renewal, without collecting a biometric credential',()=>{
 const source=readFileSync(new URL('../public/statecourse/student/register/student-register.js',import.meta.url),'utf8');
 for(const vertical of ['mortgage','real-estate'])for(const goal of ['practice','licensed','renew']){
  const {document}=parseHTML(readFileSync(new URL('../public/statecourse/student/register/index.html',import.meta.url),'utf8'));
  const form=document.getElementById('studentRegister');
  Object.defineProperty(form,'elements',{value:Object.fromEntries([...form.querySelectorAll('input[name]')].map(el=>[el.name,el]))});
  const returnTo=entryPath({vertical,goal,state:'CA'});
  vm.runInNewContext(source,{document,location:{search:'?return_to='+encodeURIComponent(returnTo)},URL,URLSearchParams});
  assert.equal(document.getElementById('renewalRegistrationPlan').hidden,!(vertical==='mortgage'&&goal==='renew'));
  assert.equal(document.getElementById('accountCourseFinder').getAttribute('href'),vertical==='mortgage'?'/mortgage/':'/get-licensed/');
  assert.equal(document.querySelectorAll('input[name="nmlsId"],input[name="biosig"]').length,0);
 }
});
test('sign-in Course Finder retains the selected mortgage vertical',async()=>{
 const source=readFileSync(new URL('../public/statecourse/student/sign-in/student-signin.js',import.meta.url),'utf8');
 for(const vertical of ['mortgage','real-estate']){
  const {document}=parseHTML(readFileSync(new URL('../public/statecourse/student/sign-in/index.html',import.meta.url),'utf8'));
  const form=document.getElementById('studentSignIn');
  Object.defineProperty(form,'elements',{value:Object.fromEntries([...form.querySelectorAll('input[name]')].map(el=>[el.name,el]))});
  const returnTo=entryPath({vertical,goal:'renew',state:'CA'});
  vm.runInNewContext(source,{document,location:{search:'?return_to='+encodeURIComponent(returnTo)},URL,URLSearchParams,fetch:async()=>new Response(null,{status:401})});
  await settle();
  assert.equal(document.getElementById('accountCourseFinder').getAttribute('href'),vertical==='mortgage'?'/mortgage/':'/get-licensed/');
 }
});
