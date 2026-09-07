import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {oklahomaFinalExamBank as bank,oklahomaFinalExamAuthoredPairs as authoredPairs,validateOklahomaFinalExamBank as validate,
 renderOklahomaFinalExamBank,oklahomaFinalExamReviewStatus as status} from '../config/oklahoma/final-exam-bank.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('300 substantive protected questions cover every objective once on each form',()=>{
 assert.deepEqual(validate(bank),{forms:2,items:300,topicsPerForm:158,areasPerForm:22,pairedObjectiveItemsPerForm:8});
});
test('missing and duplicated objectives are rejected, not silently reweighted',()=>{
 const changed=structuredClone(bank);changed[0].topicIds=[changed[1].topicIds[0]];
 assert.throws(()=>validate(changed),/occurs 0 times|occurs 2 times/);
});
test('generic template, duplicate question, invalid key and deficient rationale mutations fail',()=>{
 for(const mutate of [b=>b[0].prompt='Which scenario variant follows the approved-course method?',
  b=>b[0].prompt=b[1].prompt,b=>b[0].correctChoice=4,b=>b[0].rationale='Check sources.']){
  const changed=structuredClone(bank);mutate(changed);assert.throws(()=>validate(changed));
 }
});
test('keys are balanced without a repeated short answer cycle',()=>{
 for(const form of ['A','B']){
  const keys=bank.filter(q=>q.form===form).map(q=>q.correctChoice);
  for(let period=1;period<=12;period++)assert.ok(keys.some((k,i)=>i>=period&&k!==keys[i-period]),`cyclic key period ${period}`);
  for(let key=0;key<4;key++)assert.ok([37,38].includes(keys.filter(k=>k===key).length));
 }
});
test('observed longest-answer cue cannot regress beyond 60 correct answers per form',()=>{
 for(const form of ['A','B']){
  const questions=bank.filter(q=>q.form===form);
  const longest=questions.filter(q=>q.choices.every((c,i)=>i===q.correctChoice||c.length<q.choices[q.correctChoice].length)).length;
  assert.ok(longest<=60,`${form}: ${longest} uniquely-longest correct answers`);
  const changed=structuredClone(bank);
  // Make each keyed answer longer than its distractors while retaining valid IDs, keys and topics.
  for(const q of changed.filter(q=>q.form===form))q.choices[q.correctChoice]+=' Additional qualifying explanation.'.repeat(20);
  assert.throws(()=>validate(changed),/uniquely-longest correct answers 150 exceed provider limit 60/);
 }
});
test('all 1200 answer positions map back to the independently authored correct answer text',()=>{
 let paths=0;for(const q of bank){
  const authoredCorrect=authoredPairs[q.item-1][q.form==='A'?3:4][1][0];
  for(let choice=0;choice<4;choice++){
   paths++;assert.equal(choice===q.correctChoice,q.choices[choice]===authoredCorrect,`${q.id} choice ${choice}`);
  }
 }
 assert.equal(paths,1200);
});
test('independent arithmetic cases agree with the authored correct answer',()=>{
 const money=n=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2});
 const cases=[
  ['A-017',36*640,'23,040 acres'],['A-019',264*330/43560,'2 acres'],
  ['A-040',48000+7200-6000],['A-041',3800+2400],['A-043',420000*.045*.4],
  ['A-045',510000-278000-20400-5600-6000],['A-048',350000+12000-7000],
  ['A-049',85000+310000-46000],['A-050',54000/.09],['A-092',(2000+800)/8000*100,'35%'],
  ['A-093',400000-380000*.8],['A-128',96000-4800+3000-38000],
  ['B-019',108900/43560*72000],['B-040',32000+5500+2100-3000],['B-043',2000+360000*.01],
  ['B-045',(90000+210000+9000)/.95],['B-048',280000+8000-15000],
  ['B-093',315000/450000*100,'70%'],['B-126',1200-275],
 ];
 for(const [id,value,explicit]of cases){const q=bank.find(q=>q.id===`OK-FINAL-${id}`);assert.equal(q.choices[q.correctChoice],explicit??money(value),id);}
 assert.equal(900/30*12,360);assert.equal(3650/365*100,1000);
 assert.deepEqual([200000*.015,1200-200000*.06/12],[3000,200]);
 assert.deepEqual([150000*.02,1100-750],[3000,350]);
 assert.equal(4000+6000-9500,500);assert.ok(48000/.06>48000/.08);
});
test('known citation mistakes cannot reappear',()=>{
 const text=JSON.stringify(bank);
 assert.doesNotMatch(text,/858-312\.1\(C\)|858-312\(6\), acting|15 O\.S\. 233, 236/);
 assert.match(text,/858-314\(C\)/);assert.match(text,/858-355\.1\(D\)/);
});
test('render is reproducible and guarded; no regulator or SME approval invented',()=>{
 assert.equal(renderOklahomaFinalExamBank(),renderOklahomaFinalExamBank());
 for(const key of ['regulatorApproved','smeSignoff','psychometricValidation','authorizedForAdministration'])assert.equal(status[key],false);
 const artifact=path.join(root,'oklahoma/assessments/final-exam-bank.md');
 assert.equal(readFileSync(artifact,'utf8'),renderOklahomaFinalExamBank());
});
test('generated coverage/source files and all curriculum references are current',()=>{
 const args=[path.join(root,'scripts/build-oklahoma-final-exam.mjs'),'--check'];
 // Only for isolated proposal verification; normal repository builds need no environment override.
 if(process.env.OK_CURRICULUM_ROOT)args.push('--curriculum-root',process.env.OK_CURRICULUM_ROOT);
 const result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});
 assert.equal(result.status,0,result.stdout+result.stderr);
 const audit=JSON.parse(readFileSync(path.join(root,'oklahoma/assessments/final-exam-coverage.json'),'utf8'));
 assert.equal(audit.formativeItems,176);assert.deepEqual(audit.exactFormativePromptMatches,[]);
 assert.deepEqual(audit.exactFormativeChoiceSetMatches,[]);assert.deepEqual(audit.referenceErrors,[]);
});
