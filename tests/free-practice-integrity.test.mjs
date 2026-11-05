import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { validatePracticePayload } from '../scripts/lib/validate-free-practice.mjs';
import { PRIORITY_STATES } from '../config/free-practice/references.mjs';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,'dist',p),'utf8'));
const catalog=read('data/free-practice-catalog.json');
const expected={TX:708,FL:100,CO:319,AZ:165,NC:176,GA:100,PA:165,WA:100,NY:100};
for(const code of PRIORITY_STATES)test(code+': public integrity, provenance and non-credit flags',()=>{
  const samples=catalog.samples.filter(s=>s.state_code===code);
  assert.equal(samples.reduce((n,s)=>n+s.question_count,0),expected[code]);
  for(const sample of samples){
    const bank=read(sample.practice_url);validatePracticePayload(bank);
    for(const q of bank.questions){
      assert.equal(q.state_code,code);assert.ok(q.category.trim());
      assert.ok(q.sources.length);assert.ok(q.sources.every(s=>s&&/^https:\/\//.test(s.url)&&s.reference));
      assert.ok(fs.existsSync(path.join(root,q.curriculum_reference)));
    }
  }
});
test('altered identity, missing answer/explanation, references and credit/certificate/account flags fail closed',()=>{
  const original=read(catalog.samples.find(s=>s.state_code==='FL').practice_url);
  for(const alter of [
    d=>{d.questions[0].state_code='TX';},d=>{d.questions[0].solution=4;},d=>{d.questions[0].explanation='';},
    d=>{d.questions[0].choices[1]=d.questions[0].choices[0];},d=>{d.questions.push(d.questions[0]);},
    d=>{d.questions[0].lesson_id='foreign';},d=>{d.questions[0].category='';},d=>{d.questions[0].curriculum_reference='';},
    d=>{d.credit_eligible=true;},d=>{d.certificate_available=true;},d=>{d.account_required=true;},
  ]){const bad=structuredClone(original);alter(bad);assert.throws(()=>validatePracticePayload(bad),/Invalid public practice/);}
});
test('public source banks and collections import with protected examination modules forbidden',()=>{
  const guard=new URL('./public-practice-import-guard.mjs',import.meta.url).href;
  const script=`import {register} from 'node:module';import {pathToFileURL} from 'node:url';import path from 'node:path';register(${JSON.stringify(guard)},{data:{root:process.cwd()}});const {PRACTICE_SOURCES}=await import('./config/free-practice-sources.mjs');for(const s of PRACTICE_SOURCES)await import(pathToFileURL(path.resolve(s.bankPath)));await import('./config/free-practice/collections.mjs');`;
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{cwd:root,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
});
