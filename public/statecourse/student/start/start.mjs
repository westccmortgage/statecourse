import {courseEntry,entryPath,ENTRY_STATES} from '../../course-entry-context.mjs';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const vertical=params.get('vertical')==='mortgage'?'mortgage':'real-estate';
const goal=['practice','licensed','renew'].includes(params.get('goal'))?params.get('goal'):'practice';
const titles={practice:'Start free practice.',licensed:'Get licensed.',renew:'Renew your license.'};
const stateSelect=$('entryState');let selected=null,practice=null,opening=false;
$('entryVertical').textContent=vertical==='mortgage'?'Mortgage / NMLS':'Real Estate';
$('entryTitle').textContent=titles[goal];
$('changePath').href=vertical==='mortgage'?'/mortgage/':'/get-licensed/';
for(const code of [...ENTRY_STATES].sort())stateSelect.add(new Option(code,code));
async function stateNames(){try{const r=await fetch('/data/state-registry.json');if(!r.ok)return;const data=await r.json();for(const option of stateSelect.options){const state=data.states.find(s=>s.state_code===option.value);if(state)option.textContent=state.state_name;}}catch{}}
const safePath=value=>typeof value==='string'&&value.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\');
async function save(notify){const r=await fetch('/api/student/learning-path',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({...selected,...(notify===true?{notify:true}:{})})});if(!r.ok)throw Error('Your selection could not be saved. Please try again.');}
function registration(){location.replace('/student/register/?return_to='+encodeURIComponent(entryPath(selected)));}
async function openPractice(){
 if(opening||!practice)return;opening=true;$('openPractice').disabled=true;
 try{
  if(practice.href){location.assign(practice.href);return;}
  const r=await fetch('/api/enroll/training',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({courseId:practice.id})});
  const body=await r.json();
  if(!r.ok||body.origin!=='training'||body.creditEligible!==false||!safePath(body.href)||!body.href.startsWith('/student/nmls-training/?enrollment_id='))throw Error();
  location.assign(body.href);
 }catch{$('practiceMessage').textContent='Practice could not be opened just now. Your selection is saved; try again shortly.';opening=false;$('openPractice').disabled=false;}
}
async function continuePath(){
 selected=courseEntry({vertical,goal,state:stateSelect.value});if(!selected)return;
 $('entryMessage').textContent='Opening your learning path…';$('entryStateForm').querySelector('button').disabled=true;
 try{
  const session=await fetch('/api/student/session',{credentials:'same-origin'});
  if(session.status===401){registration();return;}if(!session.ok)throw Error('Sign-in is temporarily unavailable. Please try again.');
  await save();
  const [configResponse,sampleResponse]=await Promise.all([fetch('/api/payments/config'),fetch('/data/free-practice-catalog.json')]);
  if(!configResponse.ok||!sampleResponse.ok)throw Error('We could not check course availability. Please try again.');
  const config=await configResponse.json(),catalog=await sampleResponse.json();
  // Only a live, non-QA offer can be displayed as open credit enrollment.
  const type=vertical==='mortgage'?(goal==='renew'?'mortgage_continuing_education':'mortgage_prelicense'):(goal==='renew'?'real_estate_continuing_education':'real_estate_prelicense');
  const credits=goal!=='practice'&&config.mode==='live'&&config.productionPaymentsEnabled===true?(config.courses||[]).filter(c=>(c.state===selected.state||(vertical==='mortgage'&&c.state==='US'))&&c.productType===type&&c.checkoutEnabled===true&&!c.qaOnly):[];
  $('creditCourses').replaceChildren();
  const renewalRegistration=vertical==='mortgage'&&goal==='renew'&&credits.length>0;
  $('renewalIdentity').hidden=!renewalRegistration;
  $('creditCourses').hidden=renewalRegistration;
  for(const c of credits){const a=document.createElement('a');a.className='cta-button';a.textContent='View course: '+c.name;a.href='/enroll/?course='+encodeURIComponent(c.id);$('creditCourses').append(a);}
  $('availabilityPanel').hidden=goal==='practice'||credits.length>0;
  $('availabilityDescription').textContent=goal==='practice'?'Practice for this state is not open yet. Request an email when it becomes available.':'Credit enrollment for this selection is not open yet. Request an email when it becomes available.';
  if(vertical==='mortgage'){
   if(config.training?.available!==true)throw Error('We could not check practice availability. Please try again.');
   practice=config.training?.available===true?(config.training.courses||[]).find(c=>c.id==='nmls-ce-2026-comprehensive-8')||null:null;
   $('practiceDescription').textContent='National mortgage lessons and practice questions. General non-credit practice; this is not a pre-licensing or state-specific CE course.';
  }else{
   const sample=(catalog.samples||[]).find(s=>s.state_code===selected.state);
   practice=sample?{href:'/free-practice/?'+new URLSearchParams({state:selected.state,course:sample.course_id})}:null;
   $('practiceDescription').textContent='Real estate lessons and questions for your selected state. Non-credit practice; this is not a renewal course.';
  }
  $('entryStateForm').hidden=true;$('entryResult').hidden=false;$('entryMessage').textContent='Your selection is saved.';
  $('openPractice').hidden=!practice;
  if(!practice){$('practiceMessage').textContent='Practice for this selection is not open yet. You can request an availability email or choose another state.';$('availabilityPanel').hidden=false;}
  if(goal==='practice'&&practice)await openPractice();
 }catch(error){$('entryMessage').textContent=error.message||'We could not open your learning path. Please try again.';$('entryStateForm').querySelector('button').disabled=false;}
}
$('entryStateForm').addEventListener('submit',event=>{event.preventDefault();history.replaceState({},'',entryPath({vertical,goal,state:stateSelect.value})||location.pathname);continuePath();});
$('openPractice').addEventListener('click',openPractice);
$('renewalNmlsId').addEventListener('input',()=>{
 $('creditCourses').hidden=true;
 $('renewalIdentityMessage').textContent='Save your NMLS ID to continue with credit-course registration.';
});
$('renewalIdentityForm').addEventListener('submit',async event=>{
 event.preventDefault();const button=$('renewalIdentityForm').querySelector('button');
 if($('renewalIdentity').hidden)return;
 button.disabled=true;$('creditCourses').hidden=true;$('renewalIdentityMessage').textContent='Saving your NMLS ID…';
 try{
  const r=await fetch('/api/student/portal',{method:'PATCH',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({nmlsId:$('renewalNmlsId').value})});
  const result=await r.json();
  if(!r.ok||result?.ok!==true||result.nmlsIdentity?.present!==true||!/^\d{1,12}$/.test(result.nmlsIdentity.value||'')){
   const typingError=['nmls_id_empty','nmls_id_not_digits','nmls_id_too_long'].includes(result?.error);
   throw Error(typingError?'Enter your NMLS ID as shown on your NMLS record.':'Your NMLS ID could not be saved. Please try again.');
  }
  $('renewalNmlsId').value=result.nmlsIdentity.value;
  $('creditCourses').hidden=false;
  $('renewalIdentityMessage').textContent='NMLS ID saved. Choose your CE course below. BioSig-ID verification follows the Rules of Conduct within your course.';
 }catch(error){$('renewalIdentityMessage').textContent=error.message||'Your NMLS ID could not be saved. Please try again.';}
 finally{button.disabled=false;}
});
$('notifyAvailable').addEventListener('click',async()=>{const button=$('notifyAvailable');button.disabled=true;try{await save(true);$('notifyMessage').textContent="You're on the list. Your request to receive an availability email is saved.";button.textContent='Notification requested';}catch{$('notifyMessage').textContent='Your notification request was not saved. Please try again.';button.disabled=false;}});
stateNames();
if(ENTRY_STATES.has(params.get('state'))){stateSelect.value=params.get('state');continuePath();}
