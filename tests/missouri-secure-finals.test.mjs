import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {getMissouriSecureFinalBank as get,renderMissouriSecureFinalBank as render,MISSOURI_SECURE_FINAL_COURSE_IDS as ids,PREEXAM_PROVIDER_FORM_WEIGHTS as weights} from '../config/missouri/secure-final-bank.mjs';
import preA from '../config/missouri/protected-final/missouri-preexam-final-a.mjs';
import preB from '../config/missouri/protected-final/missouri-preexam-final-b.mjs';
import practiceA from '../config/missouri/protected-final/missouri-mrep-final-a.mjs';
import {authorities} from '../config/missouri/protected-final/missouri-final-common.mjs';

const root=resolve(process.env.STATECOURSE_ROOT||process.cwd());
const banks=ids.map(get),items=banks.flatMap(b=>b.items);
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const tally=(xs,key)=>xs.reduce((a,x)=>(a[x[key]]=(a[x[key]]||0)+1,a),{});
const allObjects=value=>!value||typeof value!=='object'?[]:[value,...Object.values(value).flatMap(allObjects)];
const collectPrompts=value=>allObjects(value).filter(v=>typeof v.prompt==='string').map(v=>v.prompt);
const sourceCache=new Map();
const read=path=>{if(!sourceCache.has(path))sourceCache.set(path,readFileSync(join(root,path),'utf8'));return sourceCache.get(path);};

test('checked-in Missouri bank text and version hashes reproduce the authored source',()=>{
 for(const bank of banks){
  const dir=`missouri/${bank.courseId}/assessments`,text=render(bank.courseId);
  assert.equal(read(`${dir}/final-exam-bank.md`),text);
  const metadata=JSON.parse(read(`${dir}/final-exam-version.json`));
  assert.equal(metadata.version,bank.version);
  assert.equal(metadata.authoredContentSha256,createHash('sha256').update(JSON.stringify(bank.items)).digest('hex'));
  assert.equal(metadata.renderedBankSha256,createHash('sha256').update(text).digest('hex'));
  assert.equal(metadata.approved,false);assert.equal(metadata.public,false);
 }
});

test('two protected banks retain four complete 50-item forms and stable identifiers',()=>{
  assert.equal(banks.length,2);assert.equal(items.length,200);
  assert.equal(new Set(items.map(i=>i.id)).size,200);
  for(const b of banks){
    assert.equal(b.confidential,true);assert.equal(b.approvalStatus,'not-approved');
    assert.match(b.reviewStatus,/awaiting-independent-SME/);
    assert.deepEqual(b.forms.map(f=>f.name),['A','B']);
    for(const f of b.forms){assert.equal(f.items.length,50);f.items.forEach((q,i)=>{
      assert.equal(q.number,i+1);assert.equal(q.form,f.name);
      assert.equal(q.id,`${b.courseId.includes('preexam')?'MO48':'MO24'}-${f.name}-${String(i+1).padStart(3,'0')}`);
    });}
  }
});

test('all 800 choices have one consistent key; positions are balanced and not always longest',()=>{
  for(const q of items){
    assert.equal(q.choices.length,4,q.id);assert.equal(new Set(q.choices.map(norm)).size,4,q.id);
    assert.equal(q.choices[q.correctChoice],q.answer,q.id);assert.equal(q.key,'ABCD'[q.correctChoice],q.id);
    assert.equal(q.choices.filter(c=>c===q.answer).length,1,q.id);
    assert.ok(q.rationale.length>=55,q.id);assert.ok(q.prompt.length>=45,q.id);
  }
  for(const b of banks){
    assert.deepEqual(tally(b.items,'key'),{B:25,D:25,A:25,C:25});
    for(const f of b.forms){
      assert.deepEqual(Object.values(tally(f.items,'key')).sort(),[12,12,13,13]);
      const longest=f.items.filter(q=>q.answer.length>Math.max(...q.distractors.map(s=>s.length))).length;
      assert.ok(longest<=20,`${b.courseId}/${f.name}: ${longest}/50 keys are uniquely longest`);
    }
  }
});

test('every item has a real authored curriculum section and any legal citations resolve in the registry',()=>{
  for(const q of items){
    const escaped=q.section.replaceAll('.','\\.');
    assert.match(read(q.curriculumPath),new RegExp(`^#{2,6}\\s+${escaped}(?:\\s|\\.)`,'m'),`${q.id} ${q.curriculumPath} §${q.section}`);
    for(const key of q.authority){assert.ok(authorities[key],q.id);assert.match(authorities[key][1],/^https:\/\//);}
  }
});

test('each preexam form covers every authored module; each MREP form covers all sixteen Commission topics',()=>{
  const pre=banks[0],practice=banks[1];
  for(const f of pre.forms){const counts=tally(f.items,'module');assert.deepEqual(Array.from({length:9},(_,i)=>counts[`module-${String(i+1).padStart(2,'0')}`]),weights);}
  for(const f of practice.forms){assert.deepEqual([...new Set(f.items.map(i=>i.topic))].sort(),[...'ABCDEFGHIJKLMNOP']);assert.equal(new Set(f.items.map(i=>i.module)).size,6);}
});

test('MREP preserves the established objective labels and form-item positions',()=>{
  const existing=read('missouri/mo-real-estate-practice-24-v1/assessments/final-exam-bank.md');
  const labels=[...existing.matchAll(/^\*\*Objective:\*\* (.+)$/gm)].map(m=>m[1]);
  assert.equal(labels.length,100);assert.deepEqual(banks[1].items.map(q=>q.objective),labels);
});

test('renderer preserves all four choices, keys, rationales and references for every item',()=>{
  for(const b of banks){
    const text=render(b.courseId),blocks=text.split(/^## Form /m).slice(1);
    assert.equal(blocks.length,100);assert.equal((text.match(/^\*\*Curriculum reference:/gm)||[]).length,100);
    assert.match(text,/CONFIDENTIAL — DO NOT PUBLISH/);
    assert.doesNotMatch(text,/scenario variant|approved-course method|Which response best follows/);
    blocks.forEach((block,i)=>{
      const q=b.items[i];assert.ok(block.includes(q.prompt),q.id);assert.ok(block.includes(q.rationale),q.id);
      assert.match(block,new RegExp(`^\\*\\*Key:\\*\\* ${q.key}$`,'m'),q.id);
      for(let c=0;c<4;c++)assert.ok(block.includes(`${'ABCD'[c]}. ${q.choices[c]}`),q.id);
      assert.ok(block.includes(q.curriculumPath),q.id);
    });
  }
});

test('source guards actually reject unknown courses, placeholders, duplicate prompts and missing coverage',()=>{
  assert.throws(()=>render('unknown-course'),/No authored/);
  const original=preA[0].prompt;
  try{preA[0].prompt='Which response best follows the approved-course method?';assert.throws(()=>render(ids[0]),/generic placeholder/);}finally{preA[0].prompt=original;}
  const second=preB[0].prompt;
  try{preB[0].prompt=preA[0].prompt;assert.throws(()=>render(ids[0]),/duplicate prompt/);}finally{preB[0].prompt=second;}
  const popped=preA.pop();try{assert.throws(()=>render(ids[0]),/50 authored items/);}finally{preA.push(popped);}
  const oldModule=preA[0].module;
  try{preA[0].module='module-02';assert.throws(()=>render(ids[0]),/blueprint mismatch/);}finally{preA[0].module=oldModule;}
  const topicRows=practiceA.filter(q=>q.topic==='P');
  try{topicRows.forEach(q=>q.topic='O');assert.throws(()=>render(ids[1]),/missing Commission topic P/);}finally{topicRows.forEach(q=>q.topic='P');}
  ids.forEach(id=>assert.equal(get(id).items.length,100));
});

test('numerical answers match independently recomputed transaction inputs',()=>{
  const checks={
    'MO24-A-028':[(360000-12000+7000),'355,000'],
    'MO24-A-033':[(31000+8600-4000-2100),'33,500'],
    'MO24-A-034':[(415000-268000-20750-4400-3500),'118,350'],
    'MO24-B-026':[(290000-18000),'272,000'],
    'MO24-B-031':[(25000+5300+2700-3000),'30,000'],
    'MO24-B-032':[(109000-4250),'104,750'],
    'MO48-A-010':[(330*528/43560),'4'],
    'MO48-A-029':[(325000*.8),'260,000'],
    'MO48-A-030':[(2800/8000*100),'35'],
    'MO48-A-031':[(120000*.06*45/360),'900'],
    'MO48-A-032':[(1850-1400),'450'],
    'MO48-A-033':[(600*12/30),'240'],
    'MO48-A-036':[(90000+310000-70000),'330,000'],
    'MO48-B-031':[(180000*.02),'3,600'],
    'MO48-B-032':[(18000*.6),'10,800'],
    'MO48-B-033':[(206450-205000),'1,450'],
  };
  for(const [id,[computed,printed]] of Object.entries(checks)){
    assert.equal(computed,Number(printed.replaceAll(',','')),id);
    assert.ok(items.find(q=>q.id===id).answer.includes(printed),id);
  }
  const a37=items.find(q=>q.id==='MO48-A-037').answer;
  assert.equal(80000/.08,1000000);assert.equal(80000/.10,800000);assert.match(a37,/1,000,000/);assert.match(a37,/800,000/);
  const b37=items.find(q=>q.id==='MO48-B-037').answer;
  assert.equal(140000-60000,80000);assert.equal(80000-52000,28000);assert.match(b37,/80,000/);assert.match(b37,/28,000/);
});

test('no exact or near-verbatim prompt reuse within finals or from public Missouri practice banks',async t=>{
  const publicQuestions=[];
  for(const file of ['config/missouri/preexam-48-question-bank.mjs','config/missouri/mrep-24-question-bank.mjs']){
    const mod=await import(pathToFileURL(join(root,file)).href);publicQuestions.push(...collectPrompts(mod));
  }
  assert.ok(publicQuestions.length>=100,'must actually load existing formative questions');
  const publicNormalized=new Set(publicQuestions.map(norm));
  assert.equal(new Set(items.map(q=>norm(q.prompt))).size,200);
  for(const q of items)assert.ok(!publicNormalized.has(norm(q.prompt)),`${q.id} copies a formative prompt`);
  const grams=s=>{const words=norm(s).split(' ');return new Set(words.slice(0,-2).map((_,i)=>words.slice(i,i+3).join(' ')));};
  const similarity=(a,b)=>{const x=grams(a),y=grams(b),intersection=[...x].filter(v=>y.has(v)).length;return intersection/(x.size+y.size-intersection);};
  let closestPublic={score:0},closestFinal={score:0};
  for(let i=0;i<items.length;i++){
    for(const prompt of publicQuestions){const score=similarity(items[i].prompt,prompt);if(score>closestPublic.score)closestPublic={score,id:items[i].id,formativePrompt:prompt};}
    for(let j=i+1;j<items.length;j++){const score=similarity(items[i].prompt,items[j].prompt);if(score>closestFinal.score)closestFinal={score,ids:[items[i].id,items[j].id]};}
  }
  assert.ok(closestPublic.score<.6,JSON.stringify(closestPublic));assert.ok(closestFinal.score<.6,JSON.stringify(closestFinal));
  t.diagnostic(JSON.stringify({formativePromptsLoaded:publicQuestions.length,closestPublic,closestFinal,note:'Lexical checks do not prove absence of semantic fact-pattern reuse; independent review is also required.'}));
});

test('none of the 200 protected prompts is present in public textual source assets',()=>{
  const files=[];
  const walk=dir=>{for(const e of readdirSync(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())walk(path);else if(/\.(?:mjs|js|json|md|html|txt)$/.test(e.name))files.push(path);}};
  walk(join(root,'public'));assert.ok(files.length>10);
  const needles=items.map(q=>({id:q.id,prompt:q.prompt,escaped:JSON.stringify(q.prompt).slice(1,-1)}));
  for(const path of files){const body=readFileSync(path,'utf8');for(const q of needles)assert.ok(!body.includes(q.prompt)&&!body.includes(q.escaped),`${q.id} leaked into ${path}`);}
});
