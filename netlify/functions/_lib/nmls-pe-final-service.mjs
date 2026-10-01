import {randomUUID} from 'node:crypto';
import {PE_COURSE_DEFINITION,PE_COURSE_UNITS} from '../../../config/nmls/pe-course-definition.mjs';
import {drawPeFinalAttempt,projectPeFinal,validatePeFinalAttempt,gradePeFinal} from '../../../lib/nmls-pe-final-domain.mjs';
const uuid=v=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const plain=v=>v!==null&&Object.getPrototypeOf(v)===Object.prototype;
const fail=code=>{throw new Error(`pe_final_${code}`);};
const exact=(v,keys)=>plain(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
export function validatePeFinalRequest(input,role){
 if(!plain(input)||!['student','instructor'].includes(role))fail('invalid_request');
 const allowed=role==='instructor'?['snapshot','review_check']:['snapshot','submit_check','begin','submit'];
 if(!allowed.includes(input.operation))fail('invalid_request');
 const keys=['operation','courseId'];
 if(input.operation!=='snapshot')keys.push('actorId','requestId','expectedRevision');
 if(input.operation==='submit_check')keys.push('unitId','teachingRevisionId','previousCheckId','text');
 if(input.operation==='review_check')keys.push('checkId','decision','text');
 if(input.operation==='submit')keys.push('attemptId','answers');
 if(!exact(input,keys)||!uuid(input.courseId))fail('invalid_request');
 if(input.operation!=='snapshot'&&(!uuid(input.actorId)||!uuid(input.requestId)||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0||input.expectedRevision>2147483647))fail('invalid_request');
 if(input.operation==='submit_check'&&(!PE_COURSE_UNITS.some(u=>u.unit===input.unitId)||!uuid(input.teachingRevisionId)||(input.previousCheckId!==null&&!uuid(input.previousCheckId))))fail('invalid_request');
 if(input.operation==='review_check'&&(!uuid(input.checkId)||!['accepted','revise'].includes(input.decision)))fail('invalid_request');
 if(keys.includes('text')&&(typeof input.text!=='string'||input.text.trim().length<20||input.text.length>8000))fail('invalid_request');
 if(input.operation==='submit'&&(!uuid(input.attemptId)||!plain(input.answers)||Object.keys(input.answers).length!==25||Object.values(input.answers).some(v=>!['A','B','C','D'].includes(v))))fail('invalid_request');
 return input;
}
function validateContext(state,actorId,role,courseId,bank){
 const keys=['courseId','actorId','role','revision','bankDigest','serverAt','closesAt','assignedInstructorId','checks','holds','attempt','attemptState','previousAnswers','grade','receiptId','creditEligible','certificateEligible','bankingEligible'];
 if(!exact(state,keys)||state.courseId!==courseId||state.actorId!==actorId||state.role!==role||state.bankDigest!==bank.digest||!uuid(state.assignedInstructorId)||(role==='instructor'&&state.assignedInstructorId!==actorId)||!Number.isSafeInteger(state.revision)||state.revision<0||!Number.isFinite(Date.parse(state.serverAt))||!Number.isFinite(Date.parse(state.closesAt))||!Array.isArray(state.checks)||!Array.isArray(state.holds)||state.holds.some(h=>typeof h!=='string')||['creditEligible','certificateEligible','bankingEligible'].some(k=>state[k]!==false))fail('unavailable');
 const allowedHolds=new Set(['instructor_required','bank_source_review_required','human_sme_required','regulatory_release_required','bank_incomplete','identity_required','rocs_required','delivery_policy_required','teaching_required','learning_checks_required','already_passed','staff_review_required']);
 if(state.holds.some(h=>!allowedHolds.has(h))||(state.receiptId!==null&&!uuid(state.receiptId))||Date.parse(state.serverAt)>=Date.parse(state.closesAt))fail('unavailable');
 const ids=new Map();
 for(const c of state.checks){
  if(!exact(c,['id','courseId','unitId','actorId','teachingRevisionId','previousCheckId','text','createdAt','review'])||!uuid(c.id)||c.courseId!==courseId||ids.has(c.id)||!uuid(c.actorId)||!uuid(c.teachingRevisionId)||(c.previousCheckId!==null&&!ids.has(c.previousCheckId))||!PE_COURSE_UNITS.some(u=>u.unit===c.unitId)||typeof c.text!=='string'||c.text.trim().length<20||c.text.length>8000||!Number.isFinite(Date.parse(c.createdAt))||(role==='student'&&c.actorId!==actorId)||Date.parse(c.createdAt)>Date.parse(state.serverAt))fail('unavailable');
  if(c.previousCheckId!==null){const prior=ids.get(c.previousCheckId);if(prior.actorId!==c.actorId||prior.unitId!==c.unitId||prior.teachingRevisionId!==c.teachingRevisionId||Date.parse(prior.createdAt)>Date.parse(c.createdAt))fail('unavailable');}
  if(c.review!==null&&(!exact(c.review,['id','instructorId','decision','feedback','createdAt'])||!uuid(c.review.id)||c.review.instructorId!==state.assignedInstructorId||!['accepted','revise'].includes(c.review.decision)||typeof c.review.feedback!=='string'||c.review.feedback.trim().length<20||c.review.feedback.length>8000||Date.parse(c.review.createdAt)<Date.parse(c.createdAt)||Date.parse(c.review.createdAt)>Date.parse(state.serverAt)||!Number.isFinite(Date.parse(c.review.createdAt))))fail('unavailable');ids.set(c.id,c);
 }
 if(state.attempt!==null){validatePeFinalAttempt(bank,state.attempt);if(state.attempt.actorId!==actorId||state.attempt.courseId!==courseId||!['active','submitted','expired'].includes(state.attemptState))fail('unavailable');}
 else if(state.attemptState!==null||state.grade!==null||state.previousAnswers!==null)fail('unavailable');
 if(state.grade!==null){if(!state.previousAnswers||!state.attempt)fail('unavailable');const expected=gradePeFinal(bank,state.attempt,state.previousAnswers);if(JSON.stringify(Object.entries(expected).sort())!==JSON.stringify(Object.entries(state.grade).sort()))fail('unavailable');}
}
export async function executePeFinal(input,actorId,role,{rpc,bank}){
 if(!uuid(actorId))fail('access_denied');
 const {actorId:expectedActor,...request}=validatePeFinalRequest(input,role);if(expectedActor&&expectedActor!==actorId)fail('access_denied');
 const call=(request,candidate=null)=>rpc('pe_final_command',{p_actor:actorId,p_role:role,p_request:{...request,courseHash:PE_COURSE_DEFINITION.contentHash,bankDigest:bank.digest},p_candidate:candidate});
 let candidate=null;
 if(request.operation==='begin'){
  const state=await call({operation:'snapshot',courseId:request.courseId});validateContext(state,actorId,role,request.courseId,bank);
  // A retry must reach the persisted receipt before active-attempt checks. A new
  // request while active is rejected by SQL, never opens an additional form.
  if(state.attemptState==='active'){if(state.holds.length||!bank.sourceReviewComplete)fail('prerequisites_required');if(Date.parse(state.serverAt)>=state.attempt.expiresAt)fail('attempt_expired');candidate=state.attempt;}
  else {
   if(state.holds.length||!bank.sourceReviewComplete)fail('prerequisites_required');
   candidate=drawPeFinalAttempt(bank,{id:randomUUID(),courseId:request.courseId,actorId,expiresAt:Math.min(Date.parse(state.closesAt),Date.parse(state.serverAt)+3600000),previous:state.attempt?{attempt:state.attempt,answers:state.previousAnswers}:null});
  }
 }
 const state=await call(request,candidate);validateContext(state,actorId,role,request.courseId,bank);
 // Never spread private context: prior answers, keys and rationales stay server-side.
 return {courseId:state.courseId,actorId:state.actorId,role:state.role,revision:state.revision,serverAt:state.serverAt,
  checks:state.checks,holds:[...new Set([...state.holds,...(!bank.sourceReviewComplete?['bank_source_review_required']:[])])],receiptId:state.receiptId,grade:state.grade?{...state.grade,attemptId:state.attempt.id,attemptNumber:state.attempt.number}:null,
  attemptState:state.attemptState==='active'&&Date.parse(state.serverAt)>=state.attempt.expiresAt?'expired':state.attemptState,attempt:state.attemptState==='active'&&state.holds.length===0&&bank.sourceReviewComplete&&Date.parse(state.serverAt)<state.attempt.expiresAt?projectPeFinal(bank,state.attempt):null,
  mode:'private_noncredit',creditEligible:false,certificateEligible:false,bankingEligible:false};
}
