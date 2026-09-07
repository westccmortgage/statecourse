import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {buildMap,validateMap,verifySourceSnapshots,ROOT} from '../scripts/washington-objective-map.mjs';
import {WASHINGTON_SUBMISSION_GATES} from '../config/washington-course-engine.mjs';

test('complete official numbered inventory survives the source extraction and map',()=>{
  const map=buildMap();assert.deepEqual(validateMap(map),[]);
  assert.equal(map.objectives.filter(o=>o.course==='fundamentals').length,173);
  assert.equal(map.objectives.filter(o=>o.course==='practices').length,109);
  assert.equal(map.objectives.filter(o=>o.mandatory&&o.course==='fundamentals').length,172);
  assert.equal(map.objectives.find(o=>o.id==='WA-F-FAIR-07').mandatory,false);
  assert.match(map.objectives.find(o=>o.id==='WA-F-CAREER-08').sourceAnomaly,/one sentence/);
  assert.equal(map.sources.find(s=>s.course==='fundamentals').pageCount,12);
  assert.equal(map.sources.find(s=>s.course==='practices').pageCount,9);
});
test('subordinate lines and page continuations are retained, not just topic headings',()=>{
  const map=buildMap();
  for(const [id,needle] of [['WA-F-FAIR-04','49.60.222'],['WA-F-FAIR-06','within one year'],['WA-P-CLOSING-07','Disbursement of funds'],['WA-P-PSA-08','Pending personal bankruptcy'],['WA-F-PROPERTY-14','Real estate investment trusts']])assert.ok(map.objectives.find(o=>o.id===id).text.includes(needle),`${id}: ${needle}`);
  assert.deepEqual(map.objectives.find(o=>o.id==='WA-P-PRICING-08').sourcePages,[4,5]);
  assert.deepEqual(map.objectives.find(o=>o.id==='WA-F-FAIR-04').sourcePages,[10,11]);
  assert.equal(map.objectives.filter(o=>o.mandatory).reduce((n,o)=>n+o.subtopicLines.length,0),151);
});
test('dropping an objective or subordinate requirement makes validation fail',()=>{
  const map=buildMap();map.objectives=map.objectives.filter(o=>o.id!=='WA-P-PSA-14');assert.ok(validateMap(map).length);
  const other=buildMap();other.objectives.find(o=>o.id==='WA-P-CLOSING-07').text=other.objectives.find(o=>o.id==='WA-P-CLOSING-07').text.replace('Disbursement of funds','');assert.ok(validateMap(other).some(e=>e.includes('content lost')));
});
test('topic similarity and planned duration cannot be promoted to readiness',()=>{
  const map=buildMap();assert.equal(map.objectives.filter(o=>o.status==='covered').length,0);
  assert.equal(map.objectives.find(o=>o.id==='WA-F-FAIR-03').status,'missing');
  assert.equal(map.objectives.find(o=>o.id==='WA-P-PRICING-01').status,'missing');
  map.objectives[0].verifiedInstructionMinutes=50;map.submissionReady=true;assert.ok(validateMap(map).length>=2);
});
test('committed matrix exactly matches the current evidence and official source snapshot',()=>{
  const saved=JSON.parse(fs.readFileSync(path.join(ROOT,'washington/regulatory/objective-matrix.json'),'utf8'));
  assert.deepEqual(saved,buildMap());
});
test('rewriting extracted source words or replacing actual PDF bytes is rejected even with unchanged counts',()=>{
  const snapshots=JSON.parse(fs.readFileSync(path.join(ROOT,'washington/regulatory/curriculum-source-pages.json'),'utf8'));
  assert.doesNotThrow(()=>verifySourceSnapshots(snapshots));
  const changed=structuredClone(snapshots);changed[1].pages[7].text=changed[1].pages[7].text.replace('Disbursement of funds','Funds');
  assert.throws(()=>verifySourceSnapshots(changed),/Extracted source text changed/);
  assert.throws(()=>verifySourceSnapshots(snapshots,()=>Buffer.from('%PDF- not the controlling PDF')),/Actual PDF bytes changed/);
});
test('invented coverage status and foreign-course evidence cannot pass',()=>{
  const map=buildMap();map.objectives[0].status='approved';assert.ok(validateMap(map).some(e=>e.includes('Invalid status')));
  const other=buildMap();const row=other.objectives.find(o=>o.evidence.length);row.evidence[0].file='washington/wa-real-estate-practices-30-v1/curriculum/module-01.md';assert.ok(validateMap(other).some(e=>e.includes('Invalid course-local evidence')));
});
test('planned hours do not satisfy the actual-instruction duration gate',()=>{
  assert.equal(WASHINGTON_SUBMISSION_GATES.find(g=>g.id==='course-hour-allocation').satisfied,true);
  assert.equal(WASHINGTON_SUBMISSION_GATES.find(g=>g.id==='actual-instruction-duration').satisfied,false);
});
