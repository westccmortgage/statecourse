// A monotonic client deadline stops display before the bounded server grant ends.
// It is not evidence of attention or credited attendance. Server gates remain
// authoritative even if this page or its controls are modified.
export function installPeOilControls({root,courseId,role,request,isBusy,onResume,onSuspend}){
 if(role==='instructor')return {accept(){},enforce(){},setAttempt(){},token(){return 0;},close(){}};
 const panel=document.createElement('section');panel.id='policyPanel';panel.setAttribute('aria-label','Study session and breaks');
 const status=document.createElement('p'),resume=document.createElement('button'),pause=document.createElement('button');resume.type=pause.type='button';resume.id='policyResume';pause.id='policyBreak';resume.disabled=pause.disabled=true;resume.textContent='Resume course';pause.textContent='Start a break';panel.append(status,resume,pause);root.before(panel);
 let policy=null,deadline=0,attemptDeadline=Infinity,attemptId=null,showing=false,working=false,pending=null,storageKey=null,closed=false,generation=0,awaitingResume=false;
 const save=()=>{try{if(storageKey){if(pending)sessionStorage.setItem(storageKey,JSON.stringify(pending));else sessionStorage.removeItem(storageKey);}}catch{}};
 const visible=()=>document.visibilityState==='visible'&&document.hasFocus()&&navigator.onLine;
 function clear(reason){generation++;awaitingResume=true;deadline=0;showing=false;root.hidden=true;onSuspend();if(reason)status.textContent=reason;enforce();}
 function enforce(){
  const allowed=showing&&performance.now()<Math.min(deadline,attemptDeadline)&&visible()&&!closed;
  if(!allowed){root.hidden=true;onSuspend();}
  resume.hidden=allowed;pause.hidden=!allowed;resume.disabled=working||isBusy()||!policy;pause.disabled=working||isBusy()||!policy;
  if(pending)resume.textContent='Retry saved session request';else resume.textContent=policy?.code==='break_in_progress'?'Resume after break':'Resume course';
 }
 function accept(value,startedAt=performance.now(),epoch=generation){
  if(closed||!value)return;
  if(showing&&performance.now()>=Math.min(deadline,attemptDeadline))clear('Study display expired. Resume to recheck the server limits.');
  if(policy&&value.actorId!==policy.actorId){clear('Account changed. Reload the course.');closed=true;return;}
  if(policy&&(value.revision<policy.revision||Date.parse(value.serverAt)<Date.parse(policy.serverAt)))return;
  policy=value;
  if(!storageKey){storageKey=`pe-oil:${courseId}:${value.actorId}:pending`;try{pending=JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch{pending=null;}}
  // A stale denial is no more authoritative than a stale grant. It may
  // establish identity metadata, but cannot cancel a newer explicit resume.
  if(epoch!==generation){enforce();return;}
  if(value.allowed&&(awaitingResume||!visible())){showing=false;deadline=0;awaitingResume=true;root.hidden=true;status.textContent='Study is paused. Resume explicitly when ready.';enforce();return;}
  if(value.allowed){const remaining=Date.parse(value.deliveryUntil)-Date.parse(value.serverAt)-Math.max(0,performance.now()-startedAt);deadline=performance.now()+Math.max(0,remaining);showing=remaining>0;if(!showing)awaitingResume=true;status.textContent='Scheduled study session. Break and daily limits count possible content exposure separately from observed learning time.';}
  else {showing=false;deadline=0;awaitingResume=true;status.textContent=`Study paused: ${value.code.replaceAll('_',' ')}.${value.resumeNotBefore?' Earliest resume: '+new Date(value.resumeNotBefore).toLocaleString()+'.':''} These are conservative draft provider controls; no approved duration or credit is implied.`;onSuspend();}
  enforce();
 }
 async function send(kind,{renew=false}={}){
  if(closed||working||isBusy()||!policy||(renew&&awaitingResume))return;
  if(!pending){pending={operation:'policy-'+kind,courseId,actorId:policy.actorId,requestId:crypto.randomUUID()};save();}
  if(!renew&&pending.operation==='policy-resume'){generation++;awaitingResume=false;}
  working=true;if(pending.operation==='policy-break')clear('Starting a break. Instruction is hidden.');const epoch=generation;enforce();
  try{const start=performance.now(),value=await request(pending);accept(value,start,epoch);pending=null;save();if(value.allowed&&epoch===generation&&!awaitingResume&&visible()){await onResume();if(epoch===generation&&!awaitingResume)root.hidden=false;enforce();}}
  catch(e){clear('Session response interrupted. Retry the saved request; your work remains saved.');}
  finally{working=false;enforce();}
 }
 resume.onclick=()=>send('resume');pause.onclick=()=>send('break');
 const timer=setInterval(()=>{if(showing&&performance.now()>=Math.min(deadline,attemptDeadline))clear('Study display expired. Resume to recheck the server limits.');else if(showing&&deadline-performance.now()<8000&&visible()&&!working&&!isBusy())send('resume',{renew:true});enforce();},250);
 const suspend=()=>{if(!visible())clear('Study paused while this page is hidden, unfocused or offline. Resume when ready.');};
 for(const name of ['blur','offline','pagehide'])window.addEventListener(name,suspend);document.addEventListener('visibilitychange',suspend);
 return {accept,enforce,token:()=>generation,setAttempt(attempt,serverAt,startedAt=performance.now()){if(!attempt){if(attemptId)onSuspend();attemptId=null;attemptDeadline=Infinity;return;}const bound=performance.now()+Math.max(0,attempt.expiresAt-Date.parse(serverAt)-Math.max(0,performance.now()-startedAt));attemptDeadline=attemptId===attempt.attemptId?Math.min(attemptDeadline,bound):bound;attemptId=attempt.attemptId;if(performance.now()>=attemptDeadline)clear('This form display expired. Refresh the server record.');enforce();},close(){closed=true;clearInterval(timer);clear('Course session closed.');}};
}
