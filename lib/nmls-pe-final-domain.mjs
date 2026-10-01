import {createHash,randomInt} from 'node:crypto';
import {PE_COURSE_DEFINITION,PE_COURSE_UNITS} from '../config/nmls/pe-course-definition.mjs';
const fail=code=>{throw new Error(`pe_final_${code}`);};
const plain=v=>v!==null&&Object.getPrototypeOf(v)===Object.prototype;
const uuid=v=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const canonical=v=>Array.isArray(v)?v.map(canonical):plain(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const hash=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const text=v=>typeof v==='string'&&v.trim().length>0;
const choices=['A','B','C','D'];
const sameSet=(a,b)=>Array.isArray(a)&&new Set(a).size===a.length&&a.length===b.length&&b.every(v=>a.includes(v));
const exact=(v,keys)=>plain(v)&&sameSet(Object.keys(v),keys);
function shuffled(input,draw){const a=[...input];for(let i=a.length-1;i>0;i--){const j=draw(i+1);if(!Number.isInteger(j)||j<0||j>i)fail('random_invalid');[a[i],a[j]]=[a[j],a[i]];}return a;}

export const peFinalCandidateDigest=candidate=>hash(candidate);
export function definePeFinalBank(candidate,{review=null}={}){
 if(!plain(candidate)||candidate.schema!=='statecourse-pe-final-candidate-v1'||candidate.version!==1||candidate.creditEligible!==false||candidate.humanReviewed!==false||!Array.isArray(candidate.items)||candidate.items.length!==50)fail('bank_invalid');
 const ids=new Set(),stems=new Set();
 for(const item of candidate.items){
  const unit=PE_COURSE_UNITS.find(u=>u.unit===item.unitId);
  if(!unit||!new RegExp(`^PE-FIN-${unit.unit}-0[12]$`).test(item.id)||ids.has(item.id)||item.moduleId!==unit.module||item.category!==unit.category||item.lessonSourceHash!==unit.sourceHash||!text(item.objective)||!text(item.stem)||!text(item.rationale)||!text(item.independenceNote))fail('item_invalid');
  const normalized=item.stem.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();if(stems.has(normalized))fail('duplicate_stem');ids.add(item.id);stems.add(normalized);
  if(!Array.isArray(item.options)||item.options.length!==4||!sameSet(item.options.map(o=>o.id),choices)||item.options.some(o=>!text(o.text))||new Set(item.options.map(o=>o.text.trim().toLowerCase())).size!==4||!choices.includes(item.correctChoice))fail('choices_invalid');
  if(!exact(item.distractorRationales,choices.filter(c=>c!==item.correctChoice))||Object.values(item.distractorRationales).some(v=>!text(v)))fail('rationales_invalid');
  if(!plain(item.remediation)||!text(item.remediation.focus)||!sameSet(item.remediation.unitIds,[unit.unit]))fail('remediation_invalid');
  if(!Array.isArray(item.sourceRefs)||item.sourceRefs.length===0)fail('sources_missing');
  for(const s of item.sourceRefs){let url;try{url=new URL(s.url);}catch{fail('source_invalid');}if(url.protocol!=='https:'||url.username||url.password||!text(s.locator)||!text(s.supports)||!/^\d{4}-\d{2}-\d{2}$/.test(s.checkedOn)||!text(s.verificationStatus))fail('source_invalid');}
 }
 for(const unit of PE_COURSE_UNITS)if(candidate.items.filter(i=>i.unitId===unit.unit).length!==2)fail('unit_ratio_invalid');
 let sourceReviewComplete=false;
 if(review?.status==='passed'){
  if(review.kind!=='independent_ai_source_math_review'||review.candidateContentDigest!==hash(candidate)||!Array.isArray(review.holds)||review.holds.length||review.humanSmeApproved!==false||review.regulatoryApproved!==false||!/^[a-f0-9]{64}$/.test(review.evidenceSha256))fail('review_mismatch');
  sourceReviewComplete=true;
 }
 const definition={schema:'statecourse-pe-private-final-v1',courseHash:PE_COURSE_DEFINITION.contentHash,questionCount:25,passPercent:70,maxAutomaticAttempts:2,assignedCreditMs:0,
  mode:'private_noncredit',creditEligible:false,certificateEligible:false,bankingEligible:false,humanReviewed:false,
  sourceReviewComplete,reviewEvidenceDigest:sourceReviewComplete?review.evidenceSha256:null,items:structuredClone(candidate.items)};
 return freeze({...definition,digest:hash(definition)});
}
function validateBank(bank){const {digest,...definition}=bank||{};if(hash(definition)!==digest||definition.schema!=='statecourse-pe-private-final-v1'||definition.courseHash!==PE_COURSE_DEFINITION.contentHash||definition.questionCount!==25||definition.passPercent!==70||definition.maxAutomaticAttempts!==2||definition.assignedCreditMs!==0||definition.creditEligible!==false||definition.certificateEligible!==false||definition.bankingEligible!==false||definition.humanReviewed!==false)fail('bank_changed');}
export function validatePeFinalAttempt(bank,attempt){
 validateBank(bank);
 if(!exact(attempt,['id','courseId','actorId','bankDigest','number','questionIds','optionOrder','expiresAt'])||!uuid(attempt.id)||!uuid(attempt.courseId)||!uuid(attempt.actorId)||attempt.bankDigest!==bank.digest||![1,2].includes(attempt.number)||!Array.isArray(attempt.questionIds)||attempt.questionIds.length!==25||new Set(attempt.questionIds).size!==25||!exact(attempt.optionOrder,attempt.questionIds)||!Number.isSafeInteger(attempt.expiresAt)||attempt.expiresAt<0)fail('attempt_invalid');
 for(const id of attempt.questionIds)if(!bank.items.some(i=>i.id===id)||!sameSet(attempt.optionOrder[id],choices))fail('attempt_invalid');
 for(const unit of PE_COURSE_UNITS)if(attempt.questionIds.filter(id=>bank.items.find(i=>i.id===id).unitId===unit.unit).length!==1)fail('attempt_blueprint_invalid');
}
export function drawPeFinalAttempt(bank,{id,courseId,actorId,expiresAt,previous=null},{draw=randomInt}={}){
 validateBank(bank);let excluded=[];
 if(previous){validatePeFinalAttempt(bank,previous.attempt);if(previous.attempt.actorId!==actorId||previous.attempt.courseId!==courseId||previous.attempt.id===id||previous.attempt.number!==1)fail('attempt_scope');if(gradePeFinal(bank,previous.attempt,previous.answers).passed)fail('already_passed');excluded=previous.attempt.questionIds;}
 const selected=PE_COURSE_UNITS.map(unit=>shuffled(bank.items.filter(i=>i.unitId===unit.unit&&!excluded.includes(i.id)),draw)[0]?.id);
 const questionIds=shuffled(selected,draw);
 const attempt={id,courseId,actorId,bankDigest:bank.digest,number:previous?2:1,questionIds,optionOrder:Object.fromEntries(questionIds.map(id=>[id,shuffled(choices,draw)])),expiresAt};
 validatePeFinalAttempt(bank,attempt);return freeze(attempt);
}
export function projectPeFinal(bank,attempt){validatePeFinalAttempt(bank,attempt);return {attemptId:attempt.id,attemptNumber:attempt.number,expiresAt:attempt.expiresAt,mode:'private_noncredit',creditEligible:false,questions:attempt.questionIds.map(id=>{const item=bank.items.find(i=>i.id===id);return {id,stem:item.stem,options:attempt.optionOrder[id].map(choice=>({id:choice,text:item.options.find(o=>o.id===choice).text}))};})};}
export function gradePeFinal(bank,attempt,answers){
 validatePeFinalAttempt(bank,attempt);if(!exact(answers,attempt.questionIds)||Object.values(answers).some(v=>!choices.includes(v)))fail('answers_invalid');
 const missed=attempt.questionIds.map(id=>bank.items.find(i=>i.id===id)).filter(item=>answers[item.id]!==item.correctChoice),correct=25-missed.length,passed=correct*100>=70*25;
 return {passed,correct,total:25,requiredCorrect:18,percent:correct*4,disposition:passed?'private_final_passed':attempt.number===1?'remediation_required':'staff_review_required',remediationModules:passed?[]:[...new Set(missed.map(i=>i.moduleId))].sort(),assignedCreditMs:0,creditEligible:false,certificateEligible:false,bankingEligible:false};
}
