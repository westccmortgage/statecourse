// Optional non-credit coach. No keys, grading or progress changes live here.
const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
let manifestPromise;
export function createLearningCoach({anchor,getContext,goToQuestion}){
 const panel=el('section');panel.className='practice-feedback learning-coach';panel.hidden=true;panel.setAttribute('aria-label','AI lesson coach');anchor.after(panel);
 let currentProvider=null,active=null,contexts=[],sequence=0,abort=null,last=null;
 const status=el('p'),output=el('div');status.setAttribute('role','status');output.setAttribute('aria-live','polite');
 const title=el('h3','AI lesson coach — optional pilot');
 const topic=el('select');topic.setAttribute('aria-label','Lesson concept');
 const ask=el('button','Ask about this lesson');ask.type='button';
 const help=el('button','Help me understand');help.type='button';
 const question=el('textarea');question.maxLength=1000;question.rows=3;question.placeholder='Ask about this concept, or explain your reasoning. Do not include personal or client information.';
 const label=el('label','Your question / Why did you choose this answer? (optional reasoning)');label.append(question);
 const consent=el('input');consent.type='checkbox';
 const providerLabel=el('p');
 const disclosure=el('label');disclosure.className='learning-coach-consent';disclosure.append(consent,document.createTextNode(' I agree to send my question, selected practice answer and relevant lesson excerpts to the AI provider named above. Do not send client documents, SSNs, bank details or borrower information. No account/profile or earlier conversation is sent.'));
 const send=el('button','Send to AI coach');send.type='button';
 const retry=el('button','Retry same request');retry.type='button';retry.hidden=true;
 panel.append(title,el('p','Practice only. AI can be wrong; check the cited lesson. It cannot grant credit or change your score.'),topic,ask,help,label,providerLabel,disclosure,send,retry,status,output);
 function clear(){sequence++;abort?.abort();last=null;output.replaceChildren();status.textContent='';retry.hidden=true;question.value='';consent.checked=false;send.disabled=false;}
 function choose(){active=contexts.find(c=>c.id===topic.value);clear();const current=getContext();help.hidden=!Number.isInteger(current.selected)||!active.questionIds.includes(current.question?.id);}
 topic.addEventListener('change',choose);
 ask.addEventListener('click',()=>{question.value='Please explain '+active.title+' using this lesson.';question.focus();});
 help.addEventListener('click',()=>{question.value='Help me understand my selected answer. My reasoning was: ';question.focus();});
 async function submit(reuse=false){
  if(!active||!currentProvider||!consent.checked||!question.value.trim()){status.textContent='Enter a question and agree to the disclosure first.';return;}
  const current=getContext();
  if(!current||current.courseId!==active.courseId||current.lessonId!==active.lessonId||current.lessonDigest!==active.lessonDigest){clear();panel.hidden=true;return;}
  const matched=current.question&&active.questionIds.includes(current.question.id)&&Number.isInteger(current.selected);
  let body=reuse&&last?last:{requestId:crypto.randomUUID(),courseId:active.courseId,state:active.state,lessonId:active.lessonId,version:active.version,digest:active.digest,conceptId:active.id,questionId:matched?current.question.id:null,selected:matched?current.selected:null,message:question.value.trim(),consent:true,consentProvider:currentProvider};
  if(last&&JSON.stringify({...last,requestId:null})===JSON.stringify({...body,requestId:null}))body=last;
  last=body;const token=++sequence;abort?.abort();abort=new AbortController();
  const timer=setTimeout(()=>abort.abort(),25000);send.disabled=true;retry.hidden=true;status.textContent='Asking the AI coach…';output.replaceChildren();
  try{
   const response=await fetch('/api/learning/coach',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:abort.signal});
   if(!response.ok)throw Error(response.status===429?'The coach is busy or its pilot limit was reached. Continue ordinary practice.':'The AI coach is unavailable. Ordinary practice still works.');
   const data=await response.json();if(token!==sequence)return;
   if(data.digest!==active.digest)throw Error('The lesson changed. Reload before using the coach.');
   status.textContent=data.status==='answer'?'AI explanation — check the sources':'The available sources are insufficient';
   output.append(el('p',data.explanation),el('p',data.nextStep));
   for(const source of data.sources){const detail=el('details');detail.append(el('summary',source.label),el('blockquote',source.excerpt));const link=el('a','Read source lesson');const url=new URL(source.url,location.origin);if(url.origin===location.origin&&url.pathname==='/free-practice/'){link.href=url.href;detail.append(link);}output.append(detail);}
   output.append(el('p',data.practiceNote));
   if(data.nextQuestionId&&active.questionIds.includes(data.nextQuestionId)){const next=el('button','Try the next practice question');next.type='button';next.onclick=()=>goToQuestion(data.nextQuestionId);output.append(next);}
  }catch(e){if(token!==sequence)return;status.textContent=e.name==='AbortError'?'The coach timed out. Ordinary practice still works.':e.message;retry.hidden=false;}
  finally{clearTimeout(timer);if(token===sequence)send.disabled=false;}
 }
 send.onclick=()=>submit();retry.onclick=()=>submit(true);
 return {reset(){clear();panel.hidden=true;active=null;contexts=[];},destroy(){clear();panel.remove();},async update(){
  const token=++sequence;abort?.abort();const current=getContext();
  if(!current){clear();panel.hidden=true;active=null;return;}
  try{manifestPromise??=Promise.all(['./learning-coach-context.json','./learning-coach-library.json'].map(p=>fetch(new URL(p,import.meta.url)).then(r=>{if(!r.ok)throw Error();return r.json();}))).then(parts=>({contexts:parts.flatMap(p=>p.contexts)}));const m=await manifestPromise;
   const config=await fetch('/api/learning/coach').then(r=>{if(!r.ok)throw Error();return r.json();});if(token!==sequence)return;if(!['openai','gemini'].includes(config.provider))throw Error();if(currentProvider!==config.provider){consent.checked=false;currentProvider=config.provider;last=null;}providerLabel.textContent='AI provider: '+(currentProvider==='gemini'?'Google Gemini':'OpenAI');
   const next=m.contexts.filter(c=>c.courseId===current.courseId&&c.lessonId===current.lessonId&&c.lessonDigest===current.lessonDigest);
   contexts=next;panel.hidden=!contexts.length;if(panel.hidden){clear();return;}
   const preferred=contexts.find(c=>c.questionIds.includes(current.question?.id))??contexts.find(c=>c.id===active?.id)??contexts[0];
   const changed=active?.digest!==preferred.digest||panel.dataset.scope!==String(current.scope??'')||panel.dataset.question!==String(current.question?.id??'')||panel.dataset.answer!==String(current.selected??'');
   topic.replaceChildren(...contexts.map(c=>{const o=new Option(c.title,c.id);o.selected=c.id===preferred.id;return o;}));active=preferred;
   panel.dataset.scope=String(current.scope??'');panel.dataset.question=String(current.question?.id??'');panel.dataset.answer=String(current.selected??'');
   help.hidden=!Number.isInteger(current.selected)||!active.questionIds.includes(current.question?.id);
   if(changed)clear();
  }catch{if(token===sequence){clear();panel.hidden=true;}}
 }};
}
