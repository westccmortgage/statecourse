import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createPracticeLocale } from '../public/statecourse/practice-locale.mjs';
import { collectPracticeTranslation,referenceTokens,numericTokens } from '../scripts/free-practice-translation-source.mjs';
import { publishPracticeLocales } from '../scripts/generate-free-practice-locales.mjs';
const root=process.cwd();
const catalog=JSON.parse(fs.readFileSync('public/statecourse/data/free-practice-catalog.json'));
test('translation inventory is exactly the existing public practice catalog',()=>{
 assert.equal(new Set(catalog.samples.map(s=>s.state_code)).size,14);
 assert.equal(catalog.samples.length,30);
 for(const sample of catalog.samples){const source=collectPracticeTranslation(root,sample);assert.equal(source.files.length,sample.lesson_count);assert.ok(source.strings.length);assert.equal(source.course_id,sample.course_id);assert.ok(source.files.every(f=>f.path.startsWith('free-practice/lessons/')));}
});
test('publisher rejects stale, incomplete and extra source content',()=>{
 const sample=catalog.samples[0],source=collectPracticeTranslation(root,sample);
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'practice-locale-test-'));
 fs.mkdirSync(path.join(temp,'locales/es/free-practice'),{recursive:true});
 fs.symlinkSync(path.join(root,'public'),path.join(temp,'public'));
 fs.writeFileSync(path.join(temp,'locales/es/free-practice/interface.json'),'{"translations":[]}');
 const file=path.join(temp,'locales/es/free-practice',sample.course_id+'.json');
 const good={course_id:sample.course_id,source_revision:sample.revision,status:'draft-complete',segmentation_version:2,source_files:source.files,translations:source.strings.map(s=>[s,s])};
 try{
   for(const bad of [{...good,source_revision:'old'},{...good,source_files:[]},{...good,segmentation_version:1},{...good,translations:[...good.translations,good.translations[0]]},{...good,translations:good.translations.slice(1)},{...good,translations:good.translations.map(([s,t],i)=>[s,i===0?t+' 999999':t])},{...good,translations:[...good.translations,['protected final','No']]}]){
    fs.writeFileSync(file,JSON.stringify(bad));assert.throws(()=>publishPracticeLocales(temp,{samples:[sample]},()=>{}));
   }
   const referenceSource=source.strings.find(s=>referenceTokens(s).length);
   assert.ok(referenceSource,'Fixture includes official references');
   const altered={...good,translations:good.translations.map(([s,t])=>[s,s===referenceSource?t.replace(referenceTokens(s)[0],'changed reference'):t])};
   fs.writeFileSync(file,JSON.stringify(altered));assert.throws(()=>publishPracticeLocales(temp,{samples:[sample]},()=>{}),/reference mismatch/);
   fs.writeFileSync(file,JSON.stringify(good));let written=[];publishPracticeLocales(temp,{samples:[sample]},p=>written.push(p));assert.ok(written.includes('free-practice/locales/es/'+sample.course_id+'.json'));
   fs.writeFileSync(file,JSON.stringify({...good,status:'translation-in-progress'}));
   const pending=new Map();publishPracticeLocales(temp,{samples:[sample]},(p,content)=>pending.set(p,JSON.parse(content)));
   const replacement=pending.get('free-practice/locales/es/'+sample.course_id+'.json');
   assert.equal(replacement.status,'translation-in-progress');assert.deepEqual(replacement.translations,[]);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('language changes preserve input nodes, unsubmitted answers and source hrefs; missing/stale Spanish fails closed',async()=>{
 const {parseHTML}=await import(process.env.PRACTICE_TEST_DOM_MODULE || 'linkedom');
 const {document,window}=parseHTML('<html><body><select id="practiceLanguage"><option value="en">English</option><option value="es">Español</option></select><p id="practiceTranslationNotice"></p><p>Check answer</p><div><span>Example question</span><input name="answer" value="2" type="radio" checked><textarea>My own analysis</textarea><a href="https://example.test/42">Source</a></div></body></html>');
 const select=document.getElementById('practiceLanguage'),input=document.querySelector('input'),textarea=document.querySelector('textarea');
 let stored=[],revision='current';
 const win={location:{href:'http://localhost/free-practice/?lang=es'},history:{replaceState(){}},localStorage:{getItem(){return null;},setItem(...a){stored.push(a);}}};
 const fetcher=async url=>({ok:true,json:async()=>String(url).endsWith('interface.json')?{translations:[['Check answer','Comprobar respuesta']]}:{course_id:'example',source_revision:revision,status:'draft-complete',segmentation_version:2,translations:[['Example question','Pregunta de ejemplo']]}});
 const locale=createPracticeLocale({document,window:win,base:'http://localhost/',fetcher});await locale.ready;await locale.loadCourse({course_id:'example',revision:'current'});
 assert.equal(document.querySelector('span').textContent,'Pregunta de ejemplo');assert.equal(document.documentElement.dataset.practiceTranslation,'ready');
 async function change(lang){for(const o of select.options)o.selected=o.value===lang;select.dispatchEvent(new window.Event('change'));for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));}
 await change('en');assert.equal(document.querySelector('span').textContent,'Example question');await change('es');
 assert.strictEqual(document.querySelector('input'),input);assert.strictEqual(document.querySelector('textarea'),textarea);assert.equal(textarea.textContent,'My own analysis');assert.equal(input.getAttribute('checked'),'');assert.equal(input.value,'2');assert.equal(document.querySelector('a').getAttribute('href'),'https://example.test/42');
 assert.ok(stored.every(([key,value])=>key==='statecourse.interface-language'&&['en','es'].includes(value)));
 revision='stale';await locale.loadCourse({course_id:'example',revision:'changed'});assert.equal(document.documentElement.dataset.practiceTranslation,'unavailable');
 await change('en');assert.equal(document.documentElement.dataset.practiceTranslation,'ready');locale.destroy();
});
test('every requested course has a complete Spanish draft and choices stay distinguishable',()=>{
 const availability=JSON.parse(fs.readFileSync('public/statecourse/free-practice/locales/es/availability.json'));
 assert.equal(availability.courses.length,catalog.samples.length);
 assert.ok(availability.courses.every(c=>c.status==='draft-complete'),'Every course must finish translation and notation review');
 for(const sample of catalog.samples){
  const english=JSON.parse(fs.readFileSync('public/statecourse/'+sample.practice_url));
  const spanish=JSON.parse(fs.readFileSync('public/statecourse/free-practice/locales/es/'+sample.course_id+'.json'));
  assert.equal(spanish.source_revision,sample.revision);assert.equal(spanish.segmentation_version,2);
  const strings=new Map(spanish.translations);
  const choices=[...english.questions,...(english.activities||[]).flatMap(a=>a.tasks)].filter(q=>Array.isArray(q.choices));
  for(const q of choices){
   const original=q.choices.map(s=>s.trim().toLowerCase());
   const localized=q.choices.map(s=>(strings.get(s.trim())||s).trim().toLowerCase());
   assert.equal(new Set(localized).size,new Set(original).size,`Collapsed choices: ${sample.course_id}/${q.id}`);
  }
 }
});

test('ambiguous lesson table labels use original neighboring meaning across renders and language switches',async()=>{
 const {parseHTML}=await import(process.env.PRACTICE_TEST_DOM_MODULE || 'linkedom');
 const {document,window}=parseHTML(`<html><body><select id="practiceLanguage"><option value="en">English</option><option value="es">Español</option></select><p id="practiceTranslationNotice"></p>
 <table><tr><th>Activity</th><th id="duration">Minutes</th><th>Evidence</th></tr></table>
 <table><tr><td id="hoa"><strong>Minutes</strong></td><td>What the board has been discussing, which is frequently where a future special assessment first appears</td></tr></table>
 <table><tr><th id="hoa2">Minutes</th><td>What the board is actually worried about</td><td>Litigation</td></tr></table>
 <table><tr><th id="glossary">Term</th><th>Definition</th></tr></table>
 <table><tr><th id="valuationTerm">Term</th><th>What It Is</th><th>Who Determines It</th></tr></table>
 <table><tr><td id="economicBalance">Balance</td><td>Value is maximized where the factors of production are in equilibrium</td></tr><tr><td id="loanBalance">Balance</td><td>$100,000</td></tr></table>
 <table><tr><td id="loan">Term</td><td>30 years</td></tr><tr><td id="other">Minutes</td><td>Elapsed duration</td></tr></table>
 <table><tr><th>Item</th><th id="fixture">Attachment</th><th>Typical analysis</th></tr></table><p><strong id="lien">Attachment</strong>, a pre-judgment remedy securing a claim against property pending the outcome.</p><p id="plain">Minutes</p><table><tr><th>Situation</th><th>Wrong</th><th id="correct">Right</th></tr></table><p id="legalRight">Right</p><p id="genericFor">for</p><p id="housingRule"><em>*</em>The rule is about who the property is <em>for</em>, not about what the property <em>has</em>.<em>*</em></p><p id="inherited">It <em>does</em> imply that a licensee should recognize inherited patterns rather than reading them as natural facts about places, refuse to transmit them as market wisdom, apply uniform practices, and give consumers objective information so they can apply their own criteria.</p><p id="genericIt">It</p><table><tr><th id="clauseTerm">Term</th><th>What It Governs</th></tr><tr><th></th><th id="assignment">Assignment</th><th>Sublease</th></tr><tr><td id="feeComp">Compensation</td><td>Management, leasing, renewal, and any other fees</td></tr></table><p id="homework">Assignment</p><table><tr><td>Accessibility information</td><td id="accessRule">Belongs in the copy. The rule governs who the property is <em>for</em>, not what it <em>has</em>.</td></tr></table></body></html>`);
 const win={location:{href:'http://localhost/free-practice/?lang=es'},history:{replaceState(){}},localStorage:{setItem(){}}};
 const translations=[['Assignment','Asignación'],['Compensation','Indemnización'],['It','Lo siento.'],['does','- Sí.'],['Right','Derecho'],['for','para'],['Balance','Saldo'],['Value is maximized where the factors of production are in equilibrium','El valor se maximiza cuando los factores de producción están en equilibrio'],['Minutes','Minutos'],['Term','Plazo'],['Definition','Definición'],['What the board is actually worried about','Lo que preocupa a la junta'],['What the board has been discussing, which is frequently where a future special assessment first appears','Debates de la junta sobre cuotas futuras']];
 const fetcher=async url=>({ok:true,json:async()=>String(url).endsWith('interface.json')?{translations:[]}:{course_id:'example',source_revision:'current',status:'draft-complete',segmentation_version:2,translations}});
 const locale=createPracticeLocale({document,window:win,base:'http://localhost/',fetcher});await locale.ready;await locale.loadCourse({course_id:'example',revision:'current'});
 const value=id=>document.getElementById(id).textContent;
 function checkSpanish(){assert.equal(value('clauseTerm'),'Término');assert.equal(value('assignment'),'Cesión');assert.equal(value('homework'),'Asignación');assert.equal(value('feeComp'),'Remuneración');assert.equal(value('accessRule'),'Debe incluirse en el anuncio. La regla se refiere a quién se considera destinatario de la vivienda, no a lo que esta tiene.');assert.ok(value('inherited').startsWith('Esto sí imply'));assert.equal(value('genericIt'),'Lo siento.');assert.equal(value('correct'),'Correcto');assert.equal(value('legalRight'),'Derecho');assert.equal(value('genericFor'),'para');assert.equal(value('housingRule'),'*La regla se refiere a quién se considera destinatario de la vivienda, no a lo que la propiedad tiene.*');assert.equal(value('hoa'),'Actas');assert.equal(value('hoa2'),'Actas');assert.equal(value('glossary'),'Término');assert.equal(value('valuationTerm'),'Término');assert.equal(value('economicBalance'),'Equilibrio');assert.equal(value('loanBalance'),'Saldo');for(const id of ['duration','other','plain'])assert.equal(value(id),'Minutos');assert.equal(value('loan'),'Plazo');assert.equal(value('fixture'),'Fijación');assert.equal(value('lien'),'Embargo preventivo');}
 checkSpanish();locale.render();checkSpanish();
 const select=document.getElementById('practiceLanguage');
 async function change(lang){for(const o of select.options)o.selected=o.value===lang;select.dispatchEvent(new window.Event('change'));for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));}
 await change('en');assert.ok(value('inherited').startsWith('It does imply'));assert.equal(value('housingRule'),'*The rule is about who the property is for, not about what the property has.*');assert.equal(value('correct'),'Right');assert.equal(value('hoa'),'Minutes');assert.equal(value('glossary'),'Term');await change('es');checkSpanish();locale.destroy();
});

test('agency glossary and termination fragments retain legal meaning across language switches',async()=>{
 const{parseHTML}=await import(process.env.PRACTICE_TEST_DOM_MODULE||'linkedom');
 const source='An agency may end by completion of its purpose, expiration of its term, mutual agreement, revocation by the principal, or renunciation by the agent. The <em>power</em> to end the relationship is not the same as the <em>right</em> to end it without consequence: an early termination may still breach the underlying contract, and the compensation terms of that contract govern what is owed.';
 const{document,window}=parseHTML(`<html><body><select id="practiceLanguage"><option value="en">English</option><option value="es">Español</option></select><p id="practiceTranslationNotice"></p><p id="termination">${source}</p><p id="electrical">power</p><p id="direction">right</p><table><tr><td id="agency">Agency</td><td>The relationship in which one person is authorized to act on behalf of another in dealings with third parties.</td></tr><tr><td id="principal">Principal</td><td>The party the agent represents. Also called the client.</td></tr><tr><td id="loanPrincipal">Principal</td><td>Unpaid loan amount</td></tr><tr><td id="regulator">Agency</td><td>Government regulator</td></tr></table></body></html>`);
 const emphasis=[...document.querySelectorAll('#termination em')];const english=document.getElementById('termination').textContent;
 const translations=[['power','potencia'],['right','derecha'],['Principal','Capital'],['Agency','Organismo']];
 const fetcher=async url=>({ok:true,json:async()=>String(url).endsWith('interface.json')?{translations:[]}:{course_id:'example',source_revision:'current',status:'draft-complete',segmentation_version:2,translations}});
 const locale=createPracticeLocale({document,window:{location:{href:'http://localhost/?lang=es'},history:{replaceState(){}},localStorage:{setItem(){}}},base:'http://localhost/',fetcher});await locale.ready;await locale.loadCourse({course_id:'example',revision:'current'});
 const value=id=>document.getElementById(id).textContent;
 const check=()=>{assert.match(value('termination'),/La facultad de terminar la relación no equivale al derecho de terminarla sin consecuencias/);assert.equal(value('agency'),'Relación de agencia');assert.equal(value('principal'),'Mandante');assert.equal(value('loanPrincipal'),'Capital');assert.equal(value('regulator'),'Organismo');assert.equal(value('electrical'),'potencia');assert.equal(value('direction'),'derecha');assert.deepEqual([...document.querySelectorAll('#termination em')],emphasis);};
 check();locale.render();check();const select=document.getElementById('practiceLanguage');
 async function change(lang){for(const o of select.options)o.selected=o.value===lang;select.dispatchEvent(new window.Event('change'));for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));}
 await change('en');assert.equal(value('termination'),english);assert.equal(value('principal'),'Principal');await change('es');check();locale.destroy();
});

test('reviewed complete lesson contexts correct fragment meaning without replacing elements or generic translations',async()=>{
 const {parseHTML}=await import(process.env.PRACTICE_TEST_DOM_MODULE||'linkedom');
 const fixtures=JSON.parse(fs.readFileSync('tests/fixtures/free-practice-semantic-contexts.json'));
 for(const fixture of fixtures){
  const {document,window}=parseHTML(`<html><body><select id="practiceLanguage"><option value="en">English</option><option value="es">Español</option></select><p id="practiceTranslationNotice"></p><div id="case">${fixture.html}</div><p id="generic">${Object.keys(fixture.fragments)[0]}</p></body></html>`);document.normalize();
  const box=document.getElementById('case'),elements=[...box.querySelectorAll('*')],nodes=[];
  function walk(n){if(n.nodeType===3)nodes.push({node:n,source:n.textContent});else for(const c of n.childNodes)walk(c);}walk(box);
  const english=box.textContent,translations=JSON.parse(fs.readFileSync(`locales/es/free-practice/${fixture.course}.json`)).translations;
  const generic=Object.keys(fixture.fragments)[0];const genericExpected=new Map(translations).get(generic)||generic;
  const fetcher=async url=>({ok:true,json:async()=>String(url).endsWith('interface.json')?{translations:[]}:{course_id:fixture.course,source_revision:'current',status:'draft-complete',segmentation_version:2,translations}});
  const locale=createPracticeLocale({document,window:{location:{href:'http://localhost/?lang=es'},history:{replaceState(){}},localStorage:{setItem(){}}},base:'http://localhost/',fetcher});await locale.ready;await locale.loadCourse({course_id:fixture.course,revision:'current'});
  function check(){let found=0;for(const {node,source} of nodes)if(Object.hasOwn(fixture.fragments,source.trim())){found++;assert.equal(node.textContent.trim(),fixture.fragments[source.trim()].trim(),fixture.source+' / '+source);}assert.ok(found>0,fixture.source);for(const key of Object.keys(fixture.fragments))assert.ok(nodes.some(n=>n.source.trim()===key),`Unused contextual key: ${key}`);assert.deepEqual(numericTokens(box.textContent),numericTokens(english),`Numeric order: ${fixture.source}`);assert.deepEqual(referenceTokens(box.textContent),referenceTokens(english),`Citations: ${fixture.source}`);assert.deepEqual([...box.querySelectorAll('*')],elements);assert.equal(document.getElementById('generic').textContent,genericExpected,`Generic key must remain unchanged: ${generic}`);}
  check();locale.render();check();
  const select=document.getElementById('practiceLanguage');async function change(lang){for(const o of select.options)o.selected=o.value===lang;select.dispatchEvent(new window.Event('change'));for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));}
  await change('en');assert.equal(box.textContent,english);await change('es');check();locale.destroy();
 }
});

test('fee, task owner and appraisal consideration labels retain unrelated legal meanings',async()=>{
 const {parseHTML}=await import(process.env.PRACTICE_TEST_DOM_MODULE||'linkedom');
 const{document,window}=parseHTML(`<html><body><select id="practiceLanguage"><option value="en">English</option><option value="es">Español</option></select><p id="practiceTranslationNotice"></p><table><tr><th>Track</th><th id="owner">Owner</th><th>Typical failure</th></tr></table><table><tr><th id="consideration">Consideration</th><th>Why it matters</th></tr></table><table><tr><td id="fee">Compensation</td><td>Amount, who pays, and when it is earned</td></tr></table><table><tr><td id="surveyCourse">Course</td><td>One leg of a perimeter, stated as a direction and a distance.</td></tr></table><p id="educationalCourse">Course</p><table><tr><td id="singleAssignment">Assignment</td></tr><tr><td id="singleCompensation">Compensation</td></tr><tr><td id="singleOwner">Owner</td></tr><tr><td>Track</td><td id="pairOwner">Owner</td></tr></table><p id="genericParty">Party.</p><p id="legal">Consideration</p><p id="property">Owner</p><p id="damages">Compensation</p></body></html>`);
 const translations=[['Party.','partes.'],['Assignment','Asignación'],['Course','Curso'],['Consideration','Contraprestación'],['Owner','Propietario'],['Compensation','Indemnización']];const fetcher=async url=>({ok:true,json:async()=>String(url).endsWith('interface.json')?{translations:[]}:{course_id:'test',source_revision:'r',status:'draft-complete',segmentation_version:2,translations}});
 const locale=createPracticeLocale({document,window:{location:{href:'http://localhost/?lang=es'},history:{replaceState(){}},localStorage:{setItem(){}}},base:'http://localhost/',fetcher});await locale.ready;await locale.loadCourse({course_id:'test',revision:'r'});
 const expected={genericParty:'partes.',singleAssignment:'Asignación',singleCompensation:'Indemnización',singleOwner:'Propietario',pairOwner:'Propietario',surveyCourse:'Tramo',educationalCourse:'Curso',owner:'Responsable',consideration:'Aspecto',fee:'Remuneración',legal:'Contraprestación',property:'Propietario',damages:'Indemnización'};function check(){for(const[id,v]of Object.entries(expected))assert.equal(document.getElementById(id).textContent,v)}check();locale.render();check();
 const select=document.getElementById('practiceLanguage');async function change(lang){for(const o of select.options)o.selected=o.value===lang;select.dispatchEvent(new window.Event('change'));for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));}
 await change('en');assert.equal(document.getElementById('owner').textContent,'Owner');await change('es');check();locale.destroy();
});
