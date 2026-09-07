/** PROTECTED. This module and every dependency containing final items must remain outside public output. */
import { FINAL_01_03 } from './final-01-03.mjs';
import { FINAL_04_06 } from './final-04-06.mjs';
import { FINAL_07_09 } from './final-07-09.mjs';
import { FINAL_10_11 } from './final-10-11.mjs';
const authored=[...FINAL_01_03,...FINAL_04_06,...FINAL_07_09,...FINAL_10_11];
const topicCodes=Array.from({length:11},(_,i)=>`T${String(i+1).padStart(2,'0')}`);
// Round-robin ordering distributes all eleven topics through every 18-item pair block.
export const BANK=Object.freeze(Array.from({length:12},(_,round)=>topicCodes.map(code=>authored.filter(q=>q.tests.startsWith(code))[round])).flat());
if(BANK.length!==132 || BANK.some(q=>!q) || new Set(BANK.map(q=>q.id)).size!==132) throw Error('Incomplete protected LOC bank');
const pairNames=['AB','AC','AD','BC','BD','CD'];
const shared=Object.fromEntries(pairNames.map((pair,i)=>[pair,BANK.slice(i*18,i*18+18).map(q=>q.id)]));
const names=['A','B','C','D'];
export const FORMS=Object.freeze(Object.fromEntries(names.map((name,i)=>[name,Object.freeze([...pairNames.filter(pair=>pair.includes(name)).flatMap(pair=>shared[pair]),...BANK.slice(108+i*6,114+i*6).map(q=>q.id)])])));
export const EXAM_POLICY=Object.freeze({authoredItems:132,versions:4,questionsPerVersion:60,pairwiseSharedQuestions:18,maximumPairwiseFraction:0.3,allTopicsOnEveryVersion:true,correctChoiceAuthoredAt:0,protectAnswersAndRationales:true,noPublicBundle:true,status:'AUTHOR_PROPOSAL_PENDING_INDEPENDENT_LEGAL_AND_SEPARATION_REVIEW'});
for(const [name,ids] of Object.entries(FORMS)) {
  if(ids.length!==60 || new Set(ids).size!==60) throw Error(`Invalid form ${name}`);
  const covered=new Set(ids.map(id=>BANK.find(q=>q.id===id).tests.slice(0,3)));
  if(topicCodes.some(code=>!covered.has(code))) throw Error(`Missing topic on form ${name}`);
}
for(let a=0;a<names.length;a++) for(let b=a+1;b<names.length;b++) {
  const right=new Set(FORMS[names[b]]);
  if(FORMS[names[a]].filter(id=>right.has(id)).length!==18) throw Error('Unexpected cross-version overlap');
}
