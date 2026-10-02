const $=id=>document.getElementById(id);
const query=new URLSearchParams(location.search),cohortId=query.get('cohort');
const role=query.get('role')==='instructor'?'instructor':'student';
const endpoint=role==='instructor'?'/api/admin/pe03':'/api/student/pe03';
const tabId=crypto.randomUUID(); // each document/tab has a distinct lease; never persisted
let state=null,studying=false,busy=false,pending=null,key=null,locked=false;
const active=()=>studying&&document.visibilityState==='visible'&&document.hasFocus()&&navigator.onLine;
const message=text=>{$('status').textContent=text;};
const save=(suffix,value)=>{try{if(value===null)sessionStorage.removeItem(key+suffix);else sessionStorage.setItem(key+suffix,JSON.stringify(value));}catch{}};
const load=suffix=>{try{return JSON.parse(sessionStorage.getItem(key+suffix)||'null');}catch{return null;}};
async function api(input){
 const response=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(input)});
 const body=await response.json();if(!response.ok){if([401,403,404].includes(response.status)){locked=true;studying=false;$('activity').hidden=true;}const e=new Error(body.error||'pe03_unavailable');e.status=response.status;throw e;}
 if(state&&body.actorId!==state.actorId){locked=true;studying=false;$('activity').hidden=true;const e=new Error('pe03_account_changed_reload_required');e.status=403;throw e;}return body;
}
function render(){
 if(locked){$('activity').hidden=true;return;}
 $('activity').hidden=false;$('cohortTitle').textContent=state.cohort.title;
 $('window').textContent=`${state.cohort.opensAt} to ${state.cohort.closesAt} (exclusive), ${state.cohort.timezone}`;
 $('disclaimer').textContent=state.definition.disclaimer;
 $('progress').textContent=`Stage: ${state.stage} · Observed sample: ${(state.observedMs/1000).toFixed(1)} seconds · Server revision ${state.revision}`;
 $('study').hidden=role==='instructor';$('study').textContent=studying?'Take a break':'Start observed work';$('study').disabled=busy||!!pending||!['observe','initial-submission'].includes(state.stage);
 $('retry').hidden=!pending;$('retry').disabled=busy;
 $('materials').replaceChildren(...state.materials.map(item=>{
 const detail=document.createElement('details'),title=document.createElement('summary'),body=document.createElement('pre');
 title.textContent=`${item.id} · ${item.title}`;body.textContent=JSON.stringify(item,null,2);detail.append(title,body);return detail;
 }));
 const initial=state.evidence.find(e=>e.kind==='submit'&&e.actorId===state.actorId);
 const received=state.evidence.find(e=>e.kind==='feedback'&&e.targetId===initial?.id);
 let operation=null,targets=[];
 if(role==='instructor'){
 operation='feedback';targets=state.evidence.filter(e=>e.kind==='submit'&&state.evidence.some(p=>p.kind==='peer'&&p.targetId===e.id)&&!state.evidence.some(f=>f.kind==='feedback'&&f.targetId===e.id));
 }else if(state.stage==='initial-submission'){operation='submit';}
 else if(state.stage==='revision'){operation='revise';targets=received?[received]:[];}
 else if(initial){operation='peer';targets=state.evidence.filter(e=>e.kind==='submit'&&e.actorId!==state.actorId&&!state.evidence.some(p=>p.kind==='peer'&&p.actorId===state.actorId&&p.targetId===e.id));}
 $('contribution').dataset.operation=operation||'';
 $('prompt').textContent=operation?state.definition[{submit:'initialPrompt',peer:'peerPrompt',feedback:'feedbackPrompt',revise:'revisionPrompt'}[operation]]:'Review the exhibits and start observed work. The server opens initial submission after the 30-second development timing sample.';
 $('target').replaceChildren(...targets.map(e=>{const option=document.createElement('option');option.value=e.id;option.textContent=`${e.kind} · learner ${e.actorId.slice(-6)} · ${e.at}`;return option;}));
 $('target').hidden=operation==='submit'||!operation;document.querySelector('label[for=target]').hidden=$('target').hidden;
 $('send').disabled=busy||!!pending||!operation||(operation!=='submit'&&!targets.length);
 if(operation&&operation!=='submit'&&!targets.length)$('prompt').textContent='Waiting for the required peer contribution or assigned instructor feedback. Waiting does not earn observed time; use Take a break.';
 $('evidence').replaceChildren(...state.evidence.map(e=>{const d=document.createElement('details'),s=document.createElement('summary'),p=document.createElement('p');s.textContent=`${e.sequence}. ${e.kind} · ${e.at} · actor ${e.actorId.slice(-6)}`;p.textContent=e.body.text||`${e.body.mode}: ${e.body.observedMs} server-observed milliseconds`;d.append(s,p);return d;}));
}
async function snapshot(){const fresh=await api({operation:'snapshot',cohortId});if(!state||fresh.revision>=state.revision)state=fresh;render();}
async function mutate(operation,extra={}){
 if(busy||pending||locked)return;
 busy=true;pending={operation,cohortId,actorId:state.actorId,requestId:crypto.randomUUID(),expectedRevision:state.revision,...extra};save(':pending',pending);render();
 await settlePending();
}
async function settlePending(){
 busy=true;render();
 try{await api(pending);pending=null;save(':pending',null);await snapshot();message('Server record saved. No credit or certificate issued.');}
 catch(error){
  if(error.status&&error.status<500){pending=null;save(':pending',null);studying=false;await snapshot().catch(()=>{});}
  message(pending?'The response was interrupted. Retry the saved request; its original ID prevents a duplicate record.':`Request stopped: ${error.message}. Your written draft is retained.`);
 }finally{busy=false;render();}
}
async function pause(){studying=false;if(state&&!busy&&!pending&&navigator.onLine)await mutate('observe',{tabId,mode:'paused'});if(state)render();}
$('study').onclick=async()=>{
 if(studying){await pause();return;}
 // Reset any preceding hidden/offline/navigation interval before starting a new pair.
 await mutate('observe',{tabId,mode:'paused'});if(pending)return;studying=true;await mutate('observe',{tabId,mode:active()?'active':'paused'});render();
};
$('refresh').onclick=()=>snapshot().catch(e=>message(e.message));
$('retry').onclick=()=>settlePending();
$('response').oninput=()=>save(':draft',$('response').value);
$('contribution').onsubmit=async e=>{e.preventDefault();const operation=$('contribution').dataset.operation;if(!operation)return;studying=false;await mutate(operation,{text:$('response').value,...(operation!=='submit'?{targetId:$('target').value}:{})});};
$('export').onclick=async()=>{try{const out=await api({operation:'export',cohortId}),blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pe03-noncredit-evidence.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){message(e.message);}};
setInterval(()=>{if(active()&&!busy&&!pending)mutate('observe',{tabId,mode:'active'});},10000);
for(const event of ['blur','offline','pagehide'])window.addEventListener(event,()=>{if(role==='student')pause();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'&&role==='student')pause();});
window.addEventListener('pageshow',e=>{if(e.persisted){studying=false;snapshot().catch(e=>message(e.message));}});
async function init(){
 if(!/^[0-9a-f-]{36}$/i.test(cohortId||'')){message('Open the private cohort link supplied by your instructor. This trial is disabled unless explicitly configured.');return;}
 try{
 await snapshot();key=`pe03:${role}:${cohortId}:${state.actorId}`;$('response').value=load(':draft')||'';pending=load(':pending');
 if(pending){await settlePending();}else message('Connected to the assigned server record. Observed work is paused.');render();
 }catch(error){$('activity').hidden=true;message(error.status===401?'Sign in with your assigned student or staff account, then return to this cohort link.':`This private trial is unavailable: ${error.message}`);}
}
init();
