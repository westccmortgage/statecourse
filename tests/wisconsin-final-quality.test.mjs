import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import authored from '../config/wisconsin/final-exam-authoring.mjs';
import {wisconsinFinalExamBank as bank,wisconsinFinalMetadata as meta,renderWisconsinFinalExamBank as render} from '../config/wisconsin/final-exam-bank.mjs';
import formative from '../config/wisconsin/module-question-bank.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

test('Wisconsin authored final preserves IDs/count and covers all 13 modules and 19 topics',()=>{
  assert.equal(bank.length,100);assert.equal(new Set(bank.map(x=>x.id)).size,100);
  assert.deepEqual(meta.topics,Array.from({length:19},(_,i)=>i+1));
  meta.allocation.forEach((n,i)=>assert.equal(bank.filter(x=>x.module===i+1).length,n));
  bank.forEach((x,i)=>{assert.equal(x.number,i+1);assert.equal(x.form,'A');assert.equal(x.choices.length,4);});
});
test('Wisconsin all 400 answer paths preserve semantic key through balanced permutation',()=>{
  bank.forEach((x,i)=>x.choices.forEach((answer,j)=>assert.equal(j===x.correctChoice,answer===authored[i].choices[0],x.id)));
  for(let i=0;i<4;i++)assert.equal(bank.filter(x=>x.correctChoice===i).length,25);
});
test('Wisconsin final does not regress to generic or repeated stems and cites actual sections',()=>{
  assert.doesNotMatch(render(),/scenario variant|approved-course method|The course method requires source control/i);
  assert.equal(new Set(bank.map(x=>norm(x.prompt))).size,100);
  const prompts=new Set(Object.values(formative).flatMap(x=>[x.applied,...x.engagement,...x.remediation]).map(x=>norm(x.prompt)));
  for(const x of bank){assert.equal(prompts.has(norm(x.prompt)),false,x.id);assert.match(read(`wisconsin/curriculum/module-${String(x.module).padStart(2,'0')}.md`),new RegExp(`^### ${x.section.replaceAll('.','\\.')} `,'m'),x.id);}
  assert.ok(authored.filter(x=>x.choices[0].length===Math.max(...x.choices.map(c=>c.length))).length<=40,'correct-answer length cue regressed');
});
test('Wisconsin numerical keys are independently recalculated',()=>{
  const calc=[[3,1900+320+110+170],[5,96/16],[30,330*528/43560],[35,275000/1000*18],[62,425000*.8],[63,(1850+550)/7500*100],[64,312000*.0125/65],[65,1250-180000*.06/12],[70,5400/360*120],[71,390000+8500-300000-12000-4000],[72,365000-15000],[73,95000+310000-45000],[74,54000/.09],[92,144000-12000+6000-51000]];
  for(const [n,value]of calc){const key=bank[n-1].choices[bank[n-1].correctChoice];const answer=key==='Six months.'?6:Number(key.replace(/[^0-9.]/g,''));assert.ok(Math.abs(value-answer)<0.00001,bank[n-1].id);}
});
test('Wisconsin final file is reproducible and version identity matches content',()=>{
  assert.equal(read('wisconsin/assessments/final-exam-bank.md'),render());
  assert.equal(meta.authoredContentSha256,crypto.createHash('sha256').update(JSON.stringify(authored)).digest('hex'));
  assert.deepEqual(JSON.parse(read('wisconsin/assessments/final-exam-version.json')),meta);
  assert.equal(meta.passingPercent,75);assert.equal(meta.approved,false);assert.equal(meta.instructorSigned,false);assert.equal(meta.public,false);
});
test('Wisconsin known obsolete-law and chapter errors remain corrected',()=>{
  const m10=read('wisconsin/curriculum/module-10.md'),m13=read('wisconsin/curriculum/module-13.md');
  assert.match(m10,/24\.07\(3\) was repealed/);assert.doesNotMatch(m10,/24\.07\(3\)\*\* is engaged|gives the Board and the department authority to investigate/);
  assert.match(m13,/REEB 15 — Obligation to furnish copies and maintain records/);
  assert.match(m13,/REEB 17 — Licensees associated with a firm/);
  assert.match(m13,/REEB 23 — Change of name or address/);
  assert.match(m13,/two years/);assert.match(m13,/30 days/);
  assert.match(read('wisconsin/curriculum/module-06.md'),/16\.06\(3\).*crossed out/);
  assert.match(bank[12].law,/452\.134\(3\)\(a\)/);assert.match(bank[46].law,/16\.05\(4\)/);
  assert.match(bank[20].law,/452\.133\(1\)\(a\), \(b\); REEB 24\.07\(2\)/);
  assert.doesNotMatch(bank[20].law,/24\.07\(7\)/);
  assert.equal(bank[80].choices[bank[80].correctChoice],'Identify the assistant and describe their contribution in the transaction records.');
  assert.match(m13,/18\.031\(4\)\*\* applies to a licensee having an ownership interest/);
  assert.match(m13,/rental application deposits, rents, and security deposits made payable to one or more owners/);
  assert.match(m13,/48 hours of receipt by the firm or an associated licensee/);
});
test('Framework protected-final dispatch rejects unsupported, placeholder and partial content',()=>{
  const body=read('scripts/generate-launch-state-frameworks.mjs');const start=body.indexOf('function questionBank(course) {'),end=body.indexOf('\nfunction quizBank',start);assert.ok(start>=0&&end>start);
  const make=n=>Array.from({length:n},(_,i)=>`## Form A · Item ${String(i+1).padStart(3,'0')}`).join('\n');
  const context=vm.createContext({renderWisconsinFinalExamBank:()=>make(100),renderMissouriSecureFinalBank:()=>make(100),renderOklahomaFinalExamBank:()=>make(300)});
  vm.runInContext(body.slice(start,end)+'\nthis.generate=questionBank;',context);
  for(const [courseId,forms,questions]of [['wi-salesperson-prelicense-v1',1,100],['mo-salesperson-preexam-48-v1',2,50],['mo-real-estate-practice-24-v1',2,50],['ok-basic-prelicense-90-v1',2,150]])assert.ok(context.generate({courseId,final:{forms,questions}}));
  assert.throws(()=>context.generate({courseId:'unhandled',final:{forms:1,questions:1}}),/No authored/);
  context.renderWisconsinFinalExamBank=()=> 'approved-course method';assert.throws(()=>context.generate({courseId:'wi-salesperson-prelicense-v1',final:{forms:1,questions:100}}),/placeholder/);
  context.renderWisconsinFinalExamBank=()=> make(99);assert.throws(()=>context.generate({courseId:'wi-salesperson-prelicense-v1',final:{forms:1,questions:100}}),/count mismatch/);
});
