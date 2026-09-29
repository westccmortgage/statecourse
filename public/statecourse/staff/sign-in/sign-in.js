const status = document.querySelector('#status'), login=document.querySelector('#login'), mfa=document.querySelector('#mfa');
const params=new URLSearchParams(location.search);
const ownerKeys=['client_id','agent_id','vault_id','nonce','code_challenge'];
const ownerConnect=params.get('connect')==='owner' ? Object.fromEntries(ownerKeys.map(k=>[k,params.get(k)])) : null;
async function json(url,body) {
  const r=await fetch(url,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',
    headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  const data=await r.json(); if(!r.ok) throw Error(data.error || 'Verification unavailable'); return data;
}
async function factors() {
  const data=await json('/api/staff/security');
  if(ownerConnect && !data.owner) throw Error('A current, unscoped StateCourse owner role is required.');
  if(!data.factors.length) {document.querySelector('#enroll').hidden=false; status.textContent='Sign in again, then set up your authenticator. Access stays closed until verification succeeds.';return;}
  login.hidden=true;mfa.hidden=false;
  const select=mfa.elements.factor; select.replaceChildren();
  for(const factor of data.factors) { const option=document.createElement('option');option.value=factor.id;option.textContent=factor.name;select.append(option); }
  if(ownerConnect) document.querySelector('#purpose').textContent='Approve the existing StateCourse Command Center OAuth connection. No payment or regulatory submission is performed.';
}
login.addEventListener('submit',async e=>{e.preventDefault();status.textContent='Signing in…';
  try {await json('/api/admin/session',{email:login.elements.email.value,password:login.elements.password.value});login.elements.password.value='';await factors();status.textContent='Enter your authenticator code.';}
  catch(e){login.elements.password.value='';status.textContent=e.message;}
});
mfa.addEventListener('submit',async e=>{e.preventDefault();const button=mfa.querySelector('button');button.disabled=true;
  try {const result=await json('/api/staff/security',{factor_id:mfa.elements.factor.value,code:mfa.elements.code.value,owner_connect:ownerConnect || undefined});mfa.elements.code.value='';document.querySelector('#enrollSecret').value='';document.querySelector('#enroll').hidden=true;
    if(ownerConnect){document.querySelector('#ticketLabel').hidden=false;document.querySelector('#ticket').value=result.ownerTicket;mfa.hidden=true;status.textContent='Paste this code into the local Owner Connect helper within two minutes. Do not send the code in chat.';}
    else {const target=params.get('return') || '/admin/console/';location.assign(target.startsWith('/admin/') || target==='/admin' ? target : '/admin/console/');}
  }catch(e){mfa.elements.code.value='';status.textContent=e.message;}finally{button.disabled=false;}
});
factors().catch(()=>{});

document.querySelector('#enrollButton').addEventListener('click',async()=>{
  const button=document.querySelector('#enrollButton');button.disabled=true;
  try {const data=await json('/api/staff/security',{action:'enroll_first_factor'});
    document.querySelector('#enrollSecretLabel').hidden=false;document.querySelector('#enrollSecret').value=data.secret;
    const option=document.createElement('option');option.value=data.factor_id;option.textContent='New authenticator';mfa.elements.factor.replaceChildren(option);
    login.hidden=true;mfa.hidden=false;status.textContent='Save this setup key in your authenticator, then enter its six-digit code.';
  }catch(e){status.textContent=e.message;button.disabled=false;}
});
