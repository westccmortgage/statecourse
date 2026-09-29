// One-use authorization for the exact request. A denied action has no side effect
// and is retried only after the person explicitly approves a fresh MFA challenge.
(() => {
  const originalFetch=window.fetch.bind(window);
  let pending=false;
  function canonical(path) {
    const special={'/api/admin/refunds':'request-refund','/api/admin/compliance/missouri-completion-times':'admin-missouri-completion-report'};
    if(special[path]) return '/.netlify/functions/'+special[path];
    return path==='/api/admin/workspace'?path:'/.netlify/functions/admin-'+path.slice('/api/admin/'.length);
  }
  async function promptMfa(request) {
    if(pending) throw Error('Complete the current verification first.');
    pending=true;
    const dialog=document.createElement('dialog');
    try {
      const r=await originalFetch('/api/staff/security',{credentials:'same-origin',cache:'no-store'});
      const data=await r.json();if(!r.ok || !data.factors?.length) throw Error('Staff MFA is required. Sign in again.');
      const title=document.createElement('h2');title.textContent='Confirm this administrative action';dialog.append(title);
      const detail=document.createElement('p');
      const url=new URL(request.url), raw=['GET','HEAD'].includes(request.method)?'':await request.clone().text();
      let label=url.pathname;try{label=JSON.parse(raw).action || label;}catch{}
      detail.textContent=label;dialog.append(detail);
      const review=document.createElement('details'), summary=document.createElement('summary'), payload=document.createElement('pre');
      summary.textContent='Review the requested change';payload.textContent=raw ? (()=>{try{return JSON.stringify(JSON.parse(raw),null,2).slice(0,6000);}catch{return raw.slice(0,6000);}})() : url.search;
      review.append(summary,payload);dialog.append(review);
      const select=document.createElement('select');select.setAttribute('aria-label','Authenticator');
      for(const f of data.factors){const o=document.createElement('option');o.value=f.id;o.textContent=f.name;select.append(o);}dialog.append(select);
      const input=document.createElement('input');input.inputMode='numeric';input.autocomplete='one-time-code';input.maxLength=6;input.setAttribute('aria-label','Authenticator code');dialog.append(input);
      const note=document.createElement('p');note.setAttribute('role','status');dialog.append(note);
      const confirm=document.createElement('button');confirm.textContent='Verify and approve';dialog.append(confirm);
      const cancel=document.createElement('button');cancel.textContent='Cancel';dialog.append(cancel);
      const query=new URLSearchParams([...url.searchParams.entries()].sort(([a],[b])=>a.localeCompare(b))).toString();
      const bytes=new TextEncoder().encode(JSON.stringify([request.method,canonical(url.pathname),query,raw]));
      const intent=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
      document.body.append(dialog);dialog.showModal();input.focus();
      return await new Promise((resolve,reject)=>{
        const stop=()=>reject(Error('Action cancelled'));cancel.onclick=stop;dialog.addEventListener('cancel',stop);
        confirm.onclick=async()=>{
          confirm.disabled=true;
          try {
            const res=await originalFetch('/api/staff/security',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},
              body:JSON.stringify({factor_id:select.value,code:input.value,intent})});input.value='';
            const result=await res.json();if(!res.ok || !result.actionProof) throw Error(result.error || 'Verification failed');
            resolve(result.actionProof);
          }catch(e){input.value='';note.textContent=e.message;confirm.disabled=false;}
        };
      });
    }finally{dialog.remove();pending=false;}
  }
  window.fetch=async(input,options)=>{
    const request=new Request(input instanceof Request ? input : new URL(input,location.href),options);
    const url=new URL(request.url);
    if(url.origin!==location.origin || !url.pathname.startsWith('/api/admin/') || url.pathname==='/api/admin/session') return originalFetch(request);
    // Legacy UI bearer fields never override the named HttpOnly session.
    const headers=new Headers(request.headers);headers.delete('authorization');
    const named=new Request(request,{headers,credentials:'same-origin'});
    const response=await originalFetch(named.clone());
    if(response.status!==403) return response;
    const problem=await response.clone().json().catch(()=>({}));
    if(problem.error==='staff_step_up_required') {location.assign('/staff/sign-in/?return='+encodeURIComponent(location.pathname+location.search));return response;}
    if(problem.error!=='fresh_action_authorization_required') return response;
    const proof=await promptMfa(named.clone());headers.set('x-statecourse-action-proof',proof);
    return originalFetch(new Request(named,{headers,credentials:'same-origin'}));
  };
})();
