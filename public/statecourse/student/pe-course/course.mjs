import {installPeOilControls} from './pe-oil-controls.mjs';
import {chunkLesson,readingChunkIndex,readingBookmarkKey,renderLessonChunk} from './reading.mjs';
const $=id=>document.getElementById(id);
const query=new URLSearchParams(location.search),courseId=query.get('course');
const role=query.get('role')==='instructor'?'instructor':'student';
const endpoint=role==='instructor'?'/api/admin/pe-course':'/api/student/pe-course';
const tabId=crypto.randomUUID();
let boundActor=null,readingView=null,requestedReadingAnchor=null;
function clearReading(){
 readingView=null;requestedReadingAnchor=null;$('lesson').replaceChildren();
 for(const name of ['module','anchor','sourceStart','sourceEnd'])delete $('lesson').dataset[name];
 $('readingOutline').replaceChildren();$('readingTitle').textContent='';$('readingPosition').textContent='';$('reading').textContent='';
 $('readingPrevious').disabled=true;$('readingContinue').disabled=true;$('readingUnitStart').disabled=true;
}
function clearPrivateView(){
 locked=true;studying=false;generation++;oil.close();clearReading();state=null;course=null;key=null;pending=null;
 $('workspace').hidden=true;$('response').value='';$('evidence').replaceChildren();$('target').replaceChildren();$('unit').replaceChildren();$('categories').replaceChildren();$('contribution').dataset.operation='';
 for(const id of ['title','prompt','probe','overall','window','progress'])$(id).textContent='';
}

let state=null,course=null,studying=false,busy=false,pending=null,key=null,locked=false,unitId=query.get('unit')||'1A',generation=0;
const oil=installPeOilControls({root:document.getElementById('activity'),courseId,role,request:input=>api(input),isBusy:()=>busy,onResume:()=>pending?settlePending():snapshot(true),onSuspend:()=>{studying=false;clearReading();$('prompt').textContent='';$('probe').textContent='';$('evidence').replaceChildren();}});
const message=text=>{$('status').textContent=text;};
const active=()=>studying&&document.visibilityState==='visible'&&document.hasFocus()&&navigator.onLine;
const save=(suffix,value)=>{try{if(value===null)sessionStorage.removeItem(key+suffix);else sessionStorage.setItem(key+suffix,JSON.stringify(value));}catch{}};
const load=suffix=>{try{return JSON.parse(sessionStorage.getItem(key+suffix)||'null');}catch{return null;}};
async function api(input){
 const startedAt=performance.now(),policyEpoch=oil.token();
 if(locked)throw new Error('Private course access ended. Reload this page before continuing.');
 const response=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(input)});
 const body=await response.json();
 if(!response.ok){if([401,403,404].includes(response.status))clearPrivateView();const e=new Error(body.error||'pe_course_unavailable');e.status=response.status;throw e;}
 const actor=body.actorId||body.units?.[0]?.actorId;
 if(boundActor&&actor!==boundActor){clearPrivateView();throw new Error('Account changed. Reload this page before continuing.');}
 if(!boundActor&&actor)boundActor=actor;
 oil.accept(body.delivery||body.units?.[0]?.delivery||(body.policyId?body:null),startedAt,policyEpoch);
 return body;
}
function readingUrl(anchor,mode='replaceState'){
 const url=new URL(location.href);url.searchParams.set('unit',unitId);url.hash=anchor;
 if(url.href!==location.href)history[mode]({},'',url);
}
function showReading(index,{historyMode=null,focus=false}={}){
 if(locked||!state||!readingView)return;
 const chunk=readingView.chunks[index];if(!chunk)return;
 readingView.index=index;
 try{sessionStorage.setItem(readingView.key,JSON.stringify(chunk.id));}catch{}
 const page=document.createElement('div');page.id=chunk.id;page.append(renderLessonChunk(document,chunk));
 $('lesson').replaceChildren(page);Object.assign($('lesson').dataset,{module:state.unit.module,anchor:chunk.id,sourceStart:String(chunk.start),sourceEnd:String(chunk.end)});
 $('readingTitle').textContent=chunk.title+(chunk.part>1?` · part ${chunk.part}`:'');
 $('readingPosition').textContent=`Reading section ${index+1} of ${readingView.chunks.length}. This is a reading position, not completion or credit.`;
 $('readingUnitStart').disabled=false;$('readingPrevious').disabled=index===0;$('readingContinue').disabled=index===readingView.chunks.length-1;
 $('readingContinue').textContent=index===readingView.chunks.length-1?'End of module reading':'Continue reading';
 for(const link of $('readingOutline').querySelectorAll('a')){
  if(link.dataset.anchor===chunk.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
 }
 if(historyMode)readingUrl(chunk.id,historyMode);
 if(focus){$('lesson').focus({preventScroll:true});$('readingTitle').scrollIntoView?.({block:'start'});}
}
function renderReading(){
 if(typeof state.lessonText!=='string'||!state.lessonText){clearReading();return;}
 const bookmarkKey=readingBookmarkKey({role,courseId,actorId:state.actorId,unitId,sourceHash:state.unit.sourceHash});
 if(!readingView||readingView.key!==bookmarkKey){
  const chunks=chunkLesson(state.lessonText,state.unit.module);let saved='';
  try{saved=JSON.parse(sessionStorage.getItem(bookmarkKey)||'null')||'';}catch{}
  const anchor=requestedReadingAnchor??location.hash.slice(1);requestedReadingAnchor=null;
  readingView={key:bookmarkKey,chunks,index:readingChunkIndex(chunks,{anchor,saved,unitId})};
  $('readingOutline').replaceChildren(...chunks.map((chunk,index)=>{
   const li=document.createElement('li'),link=document.createElement('a');link.href=`#${chunk.id}`;link.dataset.anchor=chunk.id;
   link.textContent=`${index+1}. ${chunk.title}${chunk.part>1?` · part ${chunk.part}`:''}`;
   link.onclick=e=>{e.preventDefault();showReading(index,{historyMode:'pushState',focus:true});};li.append(link);return li;
  }));
  showReading(readingView.index);
 }
}
function restoreReadingHistory(){
 if(locked||!state||!readingView)return;
 const index=readingChunkIndex(readingView.chunks,{anchor:location.hash.slice(1),unitId});
 showReading(index,{historyMode:'replaceState'});
}
function render(){
 if(locked){$('workspace').hidden=true;return;}if(!state||!course)return;
 $('workspace').hidden=false;$('activity').hidden=false;$('unit').value=unitId;$('unit').disabled=busy||!!pending;
 $('overall').textContent=`${course.progress.revisedUnits} of 25 teaching units have recorded revisions. Observed: ${(course.progress.observedMs/60000).toFixed(1)} min; planned: 1,000 min (unvalidated).`;
 $('categories').replaceChildren(...Object.entries(course.progress.categories).map(([name,v])=>{const li=document.createElement('li');li.textContent=`${name.replaceAll('_',' ')}: ${(v.observedMs/60000).toFixed(1)} observed / ${v.plannedMs/60000} planned min`;return li;}));
 $('finalGate').textContent='This workbench never grants exam access or credit. Open learning checks and final readiness for the separate eligibility decision.';
 $('finalLink').href=`/student/pe-final/?course=${encodeURIComponent(courseId)}${role==='instructor'?'&role=instructor':''}`;
 $('title').textContent=`${state.unit.module} · ${unitId} · ${state.unit.title}`;
 $('window').textContent=`Course window: ${state.cohort.opensAt} to ${state.cohort.closesAt} (exclusive), ${state.cohort.timezone}`;
 $('progress').textContent=`Stage: ${state.stage} · ${(state.observedMs/60000).toFixed(1)} observed / ${state.unit.plannedMs/60000} planned min · record ${state.revision}`;
 $('study').hidden=role==='instructor';$('study').textContent=studying?'Take a break':'Start observed work';$('study').disabled=busy||!!pending||state.stage==='revised-noncredit';
 $('retry').hidden=!pending;$('retry').disabled=busy;$('refresh').disabled=busy||!!pending;$('export').disabled=busy||!!pending;
 renderReading();
 $('reading').textContent=`For this unit: ${state.unit.read}`;
 const initial=state.evidence.find(e=>e.kind==='submit'&&e.actorId===state.actorId);
 const feedback=state.evidence.find(e=>e.kind==='feedback'&&e.targetId===initial?.id);
 let operation=null,targets=[];
 if(role==='instructor'){operation='feedback';targets=state.evidence.filter(e=>e.kind==='submit'&&state.evidence.some(p=>p.kind==='peer'&&p.targetId===e.id)&&!state.evidence.some(p=>p.kind==='feedback'&&p.targetId===e.id));}
 else if(state.stage==='initial-submission'){operation='submit';}
 else if(state.stage==='revision'&&state.evidence.some(e=>e.kind==='peer'&&e.actorId===state.actorId)){operation='revise';targets=feedback?[feedback]:[];}
 else if(initial){operation='peer';targets=state.evidence.filter(e=>e.kind==='submit'&&e.actorId!==state.actorId&&!state.evidence.some(p=>p.kind==='peer'&&p.actorId===state.actorId&&p.targetId===e.id));}
 $('contribution').dataset.operation=operation||'';
 $('prompt').textContent=operation==='feedback'?'Respond to this learner’s work and named peer challenge. Give specific teaching feedback and a reasoned revision request.':operation?state.unit[{submit:'task',peer:'peer',revise:'revision'}[operation]]:state.unit.task;
 $('probe').textContent=`Consider while preparing your revision: ${state.unit.probe}`;
 $('target').replaceChildren(...targets.map(e=>{const option=document.createElement('option');option.value=e.id;option.textContent=`${e.kind} · learner ${e.actorId.slice(-6)} · ${e.at}`;return option;}));
 $('target').hidden=operation==='submit'||!operation;document.querySelector('label[for=target]').hidden=$('target').hidden;
 $('send').disabled=busy||!!pending||!operation||(operation!=='submit'&&!targets.length)||(operation==='revise'&&state.observedMs<state.unit.plannedMs);
 $('evidence').replaceChildren(...state.evidence.filter(e=>e.kind!=='observe').map(e=>{const d=document.createElement('details'),s=document.createElement('summary'),p=document.createElement('p');s.textContent=`${e.kind} · ${e.at} · learner ${e.actorId.slice(-6)}`;p.textContent=e.body.text;d.append(s,p);return d;}));
 oil.enforce();
}
async function snapshot(refreshCourse=false){
 const requestedUnit=unitId,epoch=generation;
 const fresh=await api({operation:'snapshot',courseId,unitId:requestedUnit});
 if(epoch!==generation||requestedUnit!==unitId)return;
 const lastSequence=s=>s.evidence.at(-1)?.sequence||0;
 if(!state||(fresh.revision>=state.revision&&lastSequence(fresh)>=lastSequence(state)&&Date.parse(fresh.serverAt)>=Date.parse(state.serverAt)))state=fresh;
 if(refreshCourse){const latest=await api({operation:'course-snapshot',courseId});if(epoch!==generation||requestedUnit!==unitId)return;course=latest;}
 else if(course){
  course.units=course.units.map(s=>s.unit.unit===unitId?state:s);
  course.progress.observedMs=course.units.reduce((n,s)=>n+s.observedMs,0);
  course.progress.revisedUnits=course.units.filter(s=>s.stage==='revised-noncredit').length;
  for(const [category,c] of Object.entries(course.progress.categories))c.observedMs=course.units.filter(s=>s.unit.category===category).reduce((n,s)=>n+s.observedMs,0);
 }
 render();
}
async function settlePending(){
 busy=true;render();try{await api(pending);pending=null;save(':pending',null);await snapshot();message('Contribution saved. No credit or certificate issued.');}
 catch(error){if(error.status&&error.status<500){pending=null;save(':pending',null);studying=false;await snapshot().catch(()=>{});}message(pending?'Response interrupted. Retry the saved request; its original ID prevents duplicate work.':`Request stopped: ${error.message}. Your written draft is retained.`);}
 finally{busy=false;render();}
}
async function mutate(operation,extra={}){if(busy||pending||locked)return;busy=true;pending={operation,courseId,unitId,actorId:state.actorId,requestId:crypto.randomUUID(),expectedRevision:state.revision,...extra};save(':pending',pending);render();await settlePending();}
async function pause(){studying=false;if(role==='student'&&state&&!busy&&!pending&&navigator.onLine)await mutate('observe',{tabId,mode:'paused'});render();}
async function selectUnit(next,changeHistory=true){
 if(busy||pending){$('unit').value=unitId;return;}await pause();if(pending||locked)return;
 generation++;unitId=next;state=null;readingView=null;requestedReadingAnchor=changeHistory?'':location.hash.slice(1);busy=true;try{await snapshot();key=`pe-course:${role}:${courseId}:${state.actorId}:${unitId}`;$('response').value=load(':draft')||'';pending=load(':pending');if(changeHistory){const url=new URL(location.href);url.searchParams.set('unit',unitId);url.hash=readingView?.chunks[readingView.index]?.id||'';history.pushState({},'',url);}if(!changeHistory&&readingView)readingUrl(readingView.chunks[readingView.index].id);if(pending)await settlePending();}
 catch(e){message(e.message);}finally{busy=false;render();}
}
$('unit').onchange=()=>selectUnit($('unit').value);
$('readingPrevious').onclick=()=>showReading((readingView?.index??0)-1,{historyMode:'pushState',focus:true});
$('readingContinue').onclick=()=>showReading((readingView?.index??0)+1,{historyMode:'pushState',focus:true});
$('readingUnitStart').onclick=()=>{if(readingView)showReading(readingChunkIndex(readingView.chunks,{unitId}),{historyMode:'pushState',focus:true});};
$('study').onclick=async()=>{if(studying){await pause();return;}await mutate('observe',{tabId,mode:'paused'});if(pending||locked)return;studying=true;await mutate('observe',{tabId,mode:active()?'active':'paused'});render();};
$('refresh').onclick=async()=>{if(busy||pending)return;busy=true;render();try{await snapshot(true);}catch(e){message(e.message);}finally{busy=false;render();}};$('retry').onclick=()=>settlePending();
$('response').oninput=()=>save(':draft',$('response').value);
$('contribution').onsubmit=async e=>{e.preventDefault();const operation=$('contribution').dataset.operation;if(!operation||$('send').disabled)return;studying=false;await mutate(operation,{text:$('response').value,...(operation!=='submit'?{targetId:$('target').value}:{})});};
$('export').onclick=async()=>{try{await pause();if(pending||locked)return;const out=await api({operation:'course-export',courseId}),url=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='national-pe-noncredit-course-evidence.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){message(e.message);}};
setInterval(()=>{if(active()&&!busy&&!pending)mutate('observe',{tabId,mode:'active'});},10000);
for(const event of ['blur','offline','pagehide'])window.addEventListener(event,pause);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')pause();});
window.addEventListener('pageshow',e=>{if(e.persisted){studying=false;snapshot().catch(e=>message(e.message));}});
window.addEventListener('hashchange',restoreReadingHistory);
window.addEventListener('popstate',()=>{const next=new URLSearchParams(location.search).get('unit')||'1A';if(next===unitId){restoreReadingHistory();return;}if(busy||pending){const url=new URL(location.href);url.searchParams.set('unit',unitId);url.hash=readingView?.chunks[readingView.index]?.id||'';history.replaceState({},'',url);message('Resolve the saved request before changing units.');}else selectUnit(next,false);});
async function init(){
 if(!/^[0-9a-f-]{36}$/i.test(courseId||'')){message('Open the private course link supplied by your instructor. This workbench is disabled unless explicitly configured.');return;}
 try{course=await api({operation:'course-snapshot',courseId});$('unit').replaceChildren(...course.units.map(s=>{const option=document.createElement('option');option.value=s.unit.unit;option.textContent=`${s.unit.unit} · ${s.unit.title}`;return option;}));if(!course.units.some(s=>s.unit.unit===unitId))unitId='1A';await selectUnit(unitId,false);if(!locked&&state)message('Connected to your assigned course. Observed work is paused.');}
 catch(e){$('workspace').hidden=true;message(e.status===401?'Sign in with your assigned account and return to this course link.':`Private course unavailable: ${e.message}`);}
}
init();
