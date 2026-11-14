import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createPracticeLocale } from '../public/statecourse/practice-locale.mjs';
import { collectPracticeTranslation,referenceTokens } from '../scripts/free-practice-translation-source.mjs';
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
