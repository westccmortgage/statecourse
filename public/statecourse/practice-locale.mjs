// Text-only presentation of explicitly public practice. Never mutates answers,
// grading, IDs, saved work, source links or authentication/enrollment state.
export function createPracticeLocale({document:doc=globalThis.document,window:win=globalThis.window,base,fetcher=globalThis.fetch}={}) {
  const key='statecourse.interface-language', query=new URL(win.location.href).searchParams.get('lang');
  let language=query==='es'?'es':query==='en'?'en':'en';
  if(!query)try{language=win.localStorage.getItem(key)==='es'?'es':'en';}catch{}
  try{win.localStorage.setItem(key,language);}catch{}
  const select=doc.getElementById('practiceLanguage'),notice=doc.getElementById('practiceTranslationNotice');
  let uiReady=false;
  let course=null, translations=new Map(), ui=new Map(), request=0, observer;
  const memory=new WeakMap(),attributes=new WeakMap(),cache=new Map();
  function translate(text){
    const value=text.trim();
    if(translations.has(value))return translations.get(value);
    if(ui.has(value))return ui.get(value);
    const patterns=[
      [/^(\d+)\. (.+)$/, (n,s)=>n+'. '+translate(s)],
      [/^(.+) — In development · Free practice$/,s=>translate(s)+' — En desarrollo · Práctica gratuita'],
      [/^(.+) · In development · Free practice$/,s=>translate(s)+' · En desarrollo · Práctica gratuita'],
      [/^(\d+) lessons · (\d+) questions$/, (a,b)=>`${a} lecciones · ${b} preguntas`],
      [/^Section (\d+) of (\d+)$/, (a,b)=>`Sección ${a} de ${b}`],
      [/^Question (\d+) of (\d+)$/, (a,b)=>`Pregunta ${a} de ${b}`],
      [/^Practice questions \((\d+)\)$/,n=>`Preguntas de práctica (${n})`],
      [/^Casework \((\d+)\)$/,n=>`Casos prácticos (${n})`],
      [/^Lesson: (\d+)\/(\d+) answered · (\d+) correct\. Course practice: (\d+)\/(\d+) answered · (\d+) correct on the first try\.$/,(a,b,c,d,e,f)=>`Lección: ${a}/${b} respondidas · ${c} correctas. Práctica del curso: ${d}/${e} respondidas · ${f} correctas al primer intento.`],
      [/^(\d+) of (\d+) correct \((\d+)%\)\. First try: (\d+) of (\d+)\.$/,(a,b,c,d,e)=>`${a} de ${b} correctas (${c}%). Primer intento: ${d} de ${e}.`],
      [/^(-?[\d,.]+) (.+)$/, (n,s)=>n+' '+translate(s)],
      [/^Expected answer: (.+)$/,s=>'Respuesta esperada: '+translate(s)],
      [/^Your answer \((.+)\)$/,s=>'Su respuesta ('+translate(s)+')'],
      [/^(\d+) of (\d+) objective checks correct\. Written responses, if present, require your own review against the criteria\. This is not course passage or an instructor assessment\.$/,(a,b)=>`${a} de ${b} comprobaciones objetivas correctas. Debe revisar sus respuestas escritas según los criterios. Esto no constituye la aprobación del curso ni una evaluación del instructor.`],
      [/^(.+) — Free Practice \| StateCourse$/,s=>translate(s)+' — Práctica gratuita | StateCourse'],
    ];
    for(const [pattern,format] of patterns){const m=value.match(pattern);if(m)return format(...m.slice(1));}
    return value;
  }
  function render(){
    observer?.disconnect();
    doc.documentElement.lang=language;
    function visit(node){
      if(node.nodeType===1 && (['SCRIPT','STYLE','CODE'].includes(node.tagName)||node.getAttribute('translate')==='no'||node.id==='practiceTranslationNotice'||node.id==='practiceLanguage'))return;
      if(node.nodeType===3){
        const prior=memory.get(node),current=node.textContent,source=prior&&prior.output===current?prior.source:current;
        const output=language==='es'?source.replace(/\S[\s\S]*\S|\S/,s=>translate(s)):source;
        if(current!==output)node.textContent=output;memory.set(node,{source,output});
      }
      if(node.nodeType===1){
        const cached=attributes.get(node)||{};
        for(const name of ['aria-label','placeholder','title'])if(node.hasAttribute(name)){
          const current=node.getAttribute(name),prior=cached[name],source=prior&&prior.output===current?prior.source:current;
          const output=language==='es'?translate(source):source;
          if(current!==output)node.setAttribute(name,output);cached[name]={source,output};
        }
        attributes.set(node,cached);
      }
      if(node.nodeType===1 && ['TEXTAREA','INPUT'].includes(node.tagName))return;
      for(const child of [...node.childNodes])visit(child);
    }
    visit(doc.documentElement);
    for(const option of select.options)option.selected=option.value===language;
    notice.hidden=language!=='es';
    observer?.observe(doc.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title']});
  }
  function state(value){doc.documentElement.dataset.practiceTranslation=value;notice.textContent=value==='loading'?'Cargando la traducción al español…':value==='unavailable'?'La traducción completa de este curso aún no está disponible. Seleccione English para continuar.':'Traducción al español en revisión. Las fuentes oficiales conservan su idioma original. Se conserva el formato numérico del original en inglés. Práctica gratuita, sin créditos para licencias ni certificado. La revisión humana lingüística y por un especialista sigue pendiente.';}
  async function loadCourse(sample){
    course=sample;const token=++request;translations=new Map();
    if(language!=='es'){state('ready');render();return;}
    if(!uiReady){state('unavailable');render();return;}
    const cacheKey=sample.course_id+':'+sample.revision;
    if(cache.has(cacheKey)){translations=cache.get(cacheKey);state('ready');render();return;}
    state('loading');render();
    try{
      const response=await fetcher(new URL(`free-practice/locales/es/${sample.course_id}.json`,base),{cache:'no-store'});
      if(!response.ok)throw Error('unavailable');
      const data=await response.json();
      if(token!==request)return;
      if(data.course_id!==sample.course_id||data.source_revision!==sample.revision||data.status!=='draft-complete'||data.segmentation_version!==2||!Array.isArray(data.translations))throw Error('stale');
      translations=new Map(data.translations);cache.set(cacheKey,translations);state('ready');render();
    }catch{if(token===request){state('unavailable');render();}}
  }
  const ready=fetcher(new URL('free-practice/locales/es/interface.json',base),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('interface unavailable');return r.json();}).then(data=>{ui=new Map(data.translations);uiReady=true;render();}).catch(()=>{if(language==='es')state('unavailable');});
  select.addEventListener('change',async()=>{
    language=select.value==='es'?'es':'en';try{win.localStorage.setItem(key,language);}catch{}
    const url=new URL(win.location.href);url.searchParams.set('lang',language);win.history.replaceState({},'',url);
    await ready;if(course)await loadCourse(course);else{state('ready');render();}
  });
  if(win.MutationObserver)observer=new win.MutationObserver(render);
  state('ready');render();
  return {ready,loadCourse,render,get language(){return language;},destroy(){observer?.disconnect();}};
}
