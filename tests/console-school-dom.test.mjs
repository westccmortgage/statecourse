import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';
import {buildSchool} from '../netlify/functions/_lib/console-school.mjs';
import {buildCourseInventory} from '../netlify/functions/_lib/course-inventory.mjs';
import {nmlsCurriculumSummary} from '../netlify/functions/_lib/nmls-readiness.mjs';
const skip=process.env.NMLS_TEST_DOM_MODULE?false:'Set NMLS_TEST_DOM_MODULE; skipped DOM is not verification.';
test('owner school UI renders every section, filters disciplines, escapes records and clears on logout',{skip},async()=>{
 const {parseHTML}=await import(pathToFileURL(process.env.NMLS_TEST_DOM_MODULE).href);
 const {document,window}=parseHTML('<html><body><button data-panel="schoolPanel">School</button><button id="schoolRefresh">Refresh</button><p id="workspaceMessage"></p><div id="schoolBody"></div></body></html>');
 const source=(rows=[])=>({available:true,truncated:false,rows});
 const catalog=JSON.parse(readFileSync('public/statecourse/data/course-catalog.json'));
 const courses=source([{id:'ca-mortgage-loan-brokering-lending-45',name:'<img src=x onerror=alert(1)>',state:'CA',current_version:'1.0',trainingReadiness:{ready:false}},{id:'nmls-ce-2026-comprehensive-8',state:'US',name:'NMLS training',current_version:'2026.3',trainingReadiness:{ready:false}}]);
 const enrollment={id:'11111111-1111-4111-8111-111111111111',student_id:'22222222-2222-4222-8222-222222222222',course_id:'nmls-ce-2026-comprehensive-8',course_version:'2026.3',state:'US',status:'active',enrollment_origin:'training',compliance_credit_eligible:false};
 const base={inventory:buildCourseInventory(catalog,courses,source(),null),datasets:{courses,governance:source(),enrollments:source([enrollment]),people:source([{id:enrollment.student_id,email:'learner@example.invalid'}]),payments:source(),tasks:source()},nmls:{curriculum:nmlsCurriculumSummary()}};
 const datasets=Object.fromEntries(['evidence','reviews','versions','completions','certificates','reports','michiganCertificates','michiganReports','blocks','assignments','assessments','finalAssessments','media','mediaGates','mediaPlacements','reviewerCandidates'].map(k=>[k,source()]));
 datasets.nmlsAttempts=source([{enrollment_id:enrollment.id,student_id:enrollment.student_id,course_id:enrollment.course_id,course_version:enrollment.course_version,revision:0,runtime:null}]);
 const data=buildSchool({base,catalog,datasets,coverage:{verified:false},environment:{stripeTestConnected:false,stripeMode:'test'}});
 let calls=0;
 const context=vm.createContext({document,console,fetch:async()=>{calls++;return {ok:true,json:async()=>({result:data})};}});
 vm.runInContext(readFileSync('public/statecourse/admin/console/school.js','utf8'),context);
 const emit=detail=>document.dispatchEvent(new window.CustomEvent('statecourse:staff',{detail}));
 const settle=async()=>{for(let i=0;i<4;i++)await new Promise(r=>setImmediate(r));};
 emit({roles:['support'],bindings:[{actorRole:'support'}]});await settle();assert.equal(calls,0);assert.equal(document.querySelector('[data-panel]').hidden,true);
 emit({roles:['owner'],bindings:[{actorRole:'owner',scopeState:null}]});await settle();assert.equal(calls,1);
 for(const section of ['Inventory','Regulatory & Evidence','Learning','Reviewers','Media','Completion & Reporting','Commerce','Launch Control','Dashboard']) {
  document.querySelector(`[data-school-section="${section}"]`).click();
  assert.equal(document.querySelector('#schoolBody > h3').textContent,section);
  assert.equal(document.querySelector('#schoolBody img'),null);
 }
 document.querySelector('[data-school-section="Learning"]').click();assert.match(document.querySelector('#schoolBody').textContent,/0 \/ 45 lessons/);
 const select=document.querySelector('[data-school-filter="discipline"]');select.querySelector('[value="mortgage"]').selected=true;select.dispatchEvent(new window.Event('change',{bubbles:true}));
 document.querySelector('[data-school-section="Inventory"]').click();assert.doesNotMatch(document.querySelector('#schoolBody').textContent,/ca-mortgage-loan-brokering-lending-45/);
 emit(null);assert.equal(document.querySelector('#schoolBody').textContent,'');assert.equal(document.querySelector('[data-panel]').hidden,true);
});
