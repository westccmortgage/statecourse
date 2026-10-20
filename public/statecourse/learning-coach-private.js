// No course text, assessment content, credentials or student profile is sent by the browser.
export function mountPrivateCoach({document:doc,window:win,anchor,getContext}){
 const make=(tag,text)=>{const e=doc.createElement(tag);if(text)e.textContent=text;return e;};
 const panel=make('section');panel.hidden=true;panel.className='practice-feedback learning-coach';panel.setAttribute('aria-label','Mortgage lesson coach');
 const text=make('textarea');text.maxLength=1000;text.rows=3;text.setAttribute('aria-label','Question about this lesson');
 const consent=make('input');consent.type='checkbox';const disclosure=make('label');
 disclosure.append(consent,doc.createTextNode(' I agree to send my question and relevant lesson excerpts to the named AI provider. Do not include borrower, client or personal information.'));
 const providerLabel=make('p'),send=make('button','Ask about this lesson'),status=make('p'),output=make('div');send.type='button';status.setAttribute('role','status');
 panel.append(make('h3','AI lesson coach'),make('p','Optional study help. Check the sources. This does not change grades, progress or licensing credit.'),providerLabel,text,disclosure,send,status,output);
 let context=null,provider=null,controller=null,generation=0,last=null,contextKey='';
 function clear(){generation++;controller?.abort();output.replaceChildren();status.textContent='';text.value='';consent.checked=false;last=null;send.disabled=false;}
 async function update(){
  const next=getContext(),key=next?JSON.stringify(next):'';
  if(key===contextKey)return;
  clear();context=next;contextKey=key;provider=null;panel.hidden=!next;
  if(!next){panel.remove();return;}anchor.after(panel);
  const token=generation;
  try{const r=await win.fetch('/api/learning/coach');if(!r.ok)throw Error();const config=await r.json();if(token!==generation)return;if(!['openai','gemini'].includes(config.provider))throw Error();provider=config.provider;providerLabel.textContent='AI provider: '+(provider==='gemini'?'Google Gemini':'OpenAI');}
  catch{if(token===generation){provider=null;status.textContent='The AI coach is unavailable. Continue your lesson.';}}
 }
 send.onclick=async()=>{
  if(!context||!provider||!consent.checked||!text.value.trim()){status.textContent='Enter a question and agree to the disclosure first.';return;}
  if(JSON.stringify(getContext())!==contextKey){await update();return;}
  const payload={...context,message:text.value.trim(),consent:true,consentProvider:provider};
  if(!last||JSON.stringify(last.payload)!==JSON.stringify(payload))last={payload,requestId:win.crypto.randomUUID()};
  const token=++generation;controller?.abort();controller=new AbortController();send.disabled=true;status.textContent='Asking the AI coach…';output.replaceChildren();
  const timer=win.setTimeout(()=>controller.abort(),25000);
  try{
   const r=await win.fetch('/api/student/nmls/coach',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...payload,requestId:last.requestId}),signal:controller.signal});
   if(!r.ok)throw Error();const result=await r.json();if(token!==generation||JSON.stringify(getContext())!==contextKey)return;
   status.textContent=result.status==='answer'?'AI explanation — check the sources':'The sources are insufficient';output.append(make('p',result.explanation),make('p',result.nextStep));
   for(const source of result.sources??[]){const details=make('details');details.append(make('summary',source.label),make('blockquote',source.excerpt));output.append(details);}
  }catch{if(token===generation)status.textContent='The AI coach is unavailable. Continue your lesson or retry the same question.';}
  finally{win.clearTimeout(timer);if(token===generation)send.disabled=false;}
 };
 function reset(){clear();context=null;contextKey='';provider=null;panel.hidden=true;panel.remove();}
 return {update,reset,destroy:reset};
}
