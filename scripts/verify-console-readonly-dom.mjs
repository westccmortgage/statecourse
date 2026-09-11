// Executes the production HTML and both console scripts in an isolated DOM.
// No requests leave this process; this does not claim a signed-in browser test.
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { courseStructure, } from '../netlify/functions/_lib/console-operations.mjs';
import { baseFingerprint,contentHash } from '../netlify/functions/_lib/console-content.mjs';
import {renderLessonMarkdown} from '../public/statecourse/student/course/blocks/lesson-markdown.mjs';
if(!process.argv[2])throw new Error('Pass the absolute path to the installed jsdom/lib/api.js.');
const {JSDOM}=await import(pathToFileURL(process.argv[2]));
const root=new URL('../public/statecourse/admin/console/',import.meta.url);
const dom=new JSDOM(await fs.readFile(new URL('index.html',root),'utf8'),{url:'https://statecourse.test/admin/console/',runScripts:'outside-only'});
const {window:w}=dom;w.HTMLElement.prototype.scrollIntoView=function(){};w.renderLessonMarkdown=renderLessonMarkdown;
const id='ca-real-estate-principles-45',course={id,state:'CA',name:'Real Estate Principles',approval_status:'submission_draft'};
const structure=courseStructure(id), firstUnit=structure.units[0], firstScreen=firstUnit.blocks[0].screens.find(s=>s.type==='instruction');
let storedDraft=null,checks=0;const requests=[];
const source=rows=>({available:true,truncated:false,rows});
const person={user:{id:'11111111-1111-4111-8111-111111111111',email:'owner@example.invalid'},roles:['owner'],bindings:[{actorRole:'owner',scopeState:null}]};
const workspace=()=>({course,structure,baseFingerprint:baseFingerprint(id),draft:storedDraft,reviews:[],releases:[],storageAvailable:true});
w.fetch=async(url,options={})=>{
  const u=new URL(url,'https://statecourse.test'),body=options.body?JSON.parse(options.body):null;requests.push({url:u.pathname,view:u.searchParams.get('view'),body});
  let payload={};
  if(u.pathname==='/api/admin/session')payload=options.method==='DELETE'?{ok:true}:person;
  else if(u.pathname==='/api/admin/catalog')payload={summary:{rows:1},sources:{},rows:[],generatedAt:new Date().toISOString(),disclaimer:'Inventory'};
  else if(u.pathname==='/api/admin/video')payload={viewer:{canPlace:true},placeableCourses:[id],assets:[],gateDefinitions:[]};
  else if(u.pathname==='/api/admin/offerings')payload={viewer:{canActivateLivePayments:true},offerings:[]};
  else if(u.pathname==='/api/admin/workspace'){
    let result={};
    if(body?.action==='save_draft'){storedDraft={revision:(storedDraft?.revision||0)+1,payload:body.payload,content_hash:contentHash(body.payload)};result=storedDraft;}
    else if(u.searchParams.get('view')==='overview')result={checkedAt:new Date().toISOString(),datasets:{courses:source([course]),enrollments:source([]),videos:source([]),governance:source([]),tasks:source([])}};
    else if(u.searchParams.get('view')==='course')result=workspace();
    else if(u.searchParams.get('view')==='screen')result={title:firstScreen.title,bodyMarkdown:'The original instruction text, available for editing.',type:'instruction'};
    else if(u.searchParams.get('view')==='health'||u.searchParams.get('view')==='audit'||u.searchParams.get('view')==='payments')result=source([]);
    else if(u.searchParams.get('view')==='team')result={bindings:source([]),people:source([]),roles:['owner']};
    else if(u.searchParams.get('view')==='messages')result={outbox:source([])};
    else if(u.searchParams.get('view')==='settings')result={weeklySchedule:'Monday 16:00 UTC'};
    payload={result};
  }else throw new Error('Unexpected request '+u.pathname);
  return {ok:true,status:200,json:async()=>payload};
};
const drain=async()=>{for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));};
const ok=(value,description)=>{assert.ok(value,description);checks++;};
try {
  w.eval('(function(){'+(await fs.readFile(new URL('workspace.js',root),'utf8')).replace(/^import .*\n/,'')+'})()');
  w.eval('(function(){'+await fs.readFile(new URL('console.js',root),'utf8')+'})()');await drain();
  ok(!w.document.querySelector('#console').hidden,'staff session opens workspace');
  ok(w.document.querySelector('#overviewBody').textContent.includes('Active enrollments'),'overview metrics rendered');
  for(const tab of w.document.querySelectorAll('.tab')){
    tab.click();await drain();
    ok(!w.document.getElementById(tab.dataset.panel).hidden,'navigation opens '+tab.dataset.panel);
    ok([...w.document.querySelectorAll('.tab')].filter(t=>t!==tab).every(t=>w.document.getElementById(t.dataset.panel).hidden),'other panels hidden');
  }
  w.document.querySelector('[data-panel="coursesPanel"]').click();
  w.document.querySelector('[data-work="course"]').click();await drain();
  ok(w.document.querySelector('#courseWorkspace').textContent.includes('Real Estate Principles'),'course opens');
  const button=[...w.document.querySelectorAll('[data-work="screen"]')].find(b=>b.dataset.screen===firstScreen.id);button.click();await drain();
  const form=w.document.querySelector('#screenDraftForm');
  ok(Boolean(form),'screen editing form exists');
  form.querySelector('[name="bodyMarkdown"]').value='Updated teaching text. <script>alert("xss")</script>';
  w.document.querySelector('[data-work="preview-text"]').click();await drain();
  ok(!w.document.querySelector('#textPreview script'),'preview escapes injected HTML');
  ok(w.document.querySelector('#textPreview').textContent.includes('no progress or credit'),'preview identified as non-credit');
  form.dispatchEvent(new w.SubmitEvent('submit',{bubbles:true,cancelable:true,submitter:form.querySelector('button')}));await drain();
  ok(storedDraft===null,'inspection never saves a draft');
  ok(!requests.some(r=>r.body?.action==='save_draft'),'submission is blocked before a network write');
  ok(!requests.some(r=>r.body?.action==='publish'),'saving does not publish');
  ok(!requests.some(r=>/student|stripe/.test(r.url)),'preview and editing record no student or payment activity');
  w.document.querySelector('#signOut').click();await drain();
  ok(w.document.querySelector('#console').hidden,'signed-out workspace hidden');
  ok(!w.document.querySelector('#courseWorkspace').textContent,'sensitive course workspace cleared on sign-out');
  console.log(JSON.stringify({domChecks:checks,passed:checks,externalRequests:0}));
} finally {dom.window.close();}
