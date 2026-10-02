import {validatePeOilDelivery,validatePeOilEvidence} from '../../../lib/nmls-pe-oil-policy.mjs';
import { PE_COURSE_DEFINITION, PE_COURSE_UNITS } from '../../../config/nmls/pe-course-definition.mjs';
import lessons from '../../../config/nmls/pe-course/lessons.json' with {type:'json'};
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const invalid = () => { throw new Error('pe_course_invalid_request'); };
export function validatePeCourseRequest(input, role) {
  if (!input || Object.getPrototypeOf(input) !== Object.prototype || !['student','instructor'].includes(role)) invalid();
  const readiness=['readiness-snapshot','present-rocs','accept-rocs','decline-rocs','save-self-reported-id'];
  const reads=['snapshot','export','course-snapshot','course-export','policy-snapshot','readiness-snapshot'];
  const operations=role==='instructor'?[...reads.filter(x=>x!=='readiness-snapshot'),'feedback']:[...reads,'observe','submit','peer','revise','policy-break','policy-resume',...readiness.slice(1)];
  if(!operations.includes(input.operation))invalid();
  const keys=['operation','courseId'];
  if(!input.operation.startsWith('course-')&&!input.operation.startsWith('policy-')&&!readiness.includes(input.operation))keys.push('unitId');
  if(!reads.includes(input.operation))keys.push('actorId','requestId',...(!input.operation.startsWith('policy-')&&!readiness.includes(input.operation)?['expectedRevision']:[]));
  if(input.operation==='observe')keys.push('tabId','mode');
  if(['submit','peer','feedback','revise'].includes(input.operation))keys.push('text');
  if(['peer','feedback','revise'].includes(input.operation))keys.push('targetId');
  if(['accept-rocs','decline-rocs'].includes(input.operation))keys.push('presentationId');
  if(input.operation==='save-self-reported-id')keys.push('nmlsId');
  if(Reflect.ownKeys(input).length!==keys.length||keys.some(k=>!Object.hasOwn(input,k))||!uuid(input.courseId))invalid();
  if(keys.includes('unitId')&&!PE_COURSE_UNITS.some(u=>u.unit===input.unitId))invalid();
  if(!reads.includes(input.operation)&&(!uuid(input.actorId)||!uuid(input.requestId)||(!input.operation.startsWith('policy-')&&!readiness.includes(input.operation)&&(!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0||input.expectedRevision>2147483647))))invalid();
  if(keys.includes('targetId')&&!uuid(input.targetId))invalid();
  if(keys.includes('presentationId')&&!uuid(input.presentationId))invalid();
  if(keys.includes('nmlsId')&&(typeof input.nmlsId!=='string'||input.nmlsId.trim().length<1||input.nmlsId.length>64))invalid();
  if(input.operation==='observe'&&(!uuid(input.tabId)||!['active','paused'].includes(input.mode)))invalid();
  if(keys.includes('text')&&(typeof input.text!=='string'||input.text.trim().length<20||input.text.length>8000))invalid();
  return {...input,courseHash:PE_COURSE_DEFINITION.contentHash};
}

export async function executePeCourse(input,actorId,role,{rpc}) {
  if(!uuid(actorId))throw new Error('pe_course_access_denied');
  const {actorId:expectedActor,...request}=validatePeCourseRequest(input,role);
  if(expectedActor&&expectedActor!==actorId)throw new Error('pe_course_access_denied');
  const result=await rpc('pe_course_dispatch',{p_actor_id:actorId,p_role:role,p_request:request});
  if(['readiness-snapshot','present-rocs','accept-rocs','decline-rocs','save-self-reported-id'].includes(request.operation))return validatePeReadinessState(result,actorId,request.courseId);
  if(request.operation.startsWith('policy-')){validatePeOilDelivery(result,actorId,request.courseId,role);return result;}
  if(request.operation.startsWith('course-')) {
    if(!result||Object.keys(result).length!==(request.operation==='course-export'?7:6)||!Array.isArray(result.units)||result.units.length!==25||
      ['creditEligible','certificateEligible','bankingEligible','protectedFinalAvailable','durationValidated'].some(k=>result[k]!==false))throw new Error('pe_course_unavailable');
    if(request.operation==='course-export')validatePeOilEvidence(result.policyEvidence,actorId,request.courseId,role);
    const seen=new Set();
    for(const state of result.units){
      const unit=PE_COURSE_UNITS.find(u=>u.unit===state?.cohort?.unitId);
      if(!unit||seen.has(unit.unit))throw new Error('pe_course_unavailable');
      seen.add(unit.unit);validatePeCourseState(state,actorId,role,request.courseId,unit);
    }
    return {...result,definition:PE_COURSE_DEFINITION,progress:courseProgress(result.units,role),units:result.units.map(s=>publicUnitState(s,PE_COURSE_UNITS.find(u=>u.unit===s.cohort.unitId),role))};
  }
  const unit=PE_COURSE_UNITS.find(u=>u.unit===request.unitId);
  validatePeCourseState(result,actorId,role,request.courseId,unit);
  return {...publicUnitState(result,unit,role),definition:PE_COURSE_DEFINITION,lessonText:role==='instructor'||result.delivery.allowed?lessons[unit.module]:''};
}

export function validatePeReadinessState(state,actorId,courseId){
 const fail=()=>{throw new Error('pe_course_unavailable');};
 const exact=(value,keys)=>value&&Object.getPrototypeOf(value)===Object.prototype&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));
 const base=['schemaVersion','actorId','courseId','mode','ready','holds','creditEligible','certificateEligible','bankingEligible'];
 if(!state||state.schemaVersion!==1||state.actorId!==actorId||state.courseId!==courseId||!['private_noncredit','prerequisite_bound'].includes(state.mode)||typeof state.ready!=='boolean'||!Array.isArray(state.holds)||new Set(state.holds).size!==state.holds.length||state.holds.some(x=>!['rocs_document_unavailable','identity_verification_required','rocs_acceptance_required'].includes(x))||state.creditEligible!==false||state.certificateEligible!==false||state.bankingEligible!==false)fail();
 if(state.mode==='private_noncredit'){if(!exact(state,base)||!state.ready||state.holds.length)fail();return {schemaVersion:1,actorId,courseId,mode:'private_noncredit',ready:true,holds:[],creditEligible:false,certificateEligible:false,bankingEligible:false};}
 const keys=[...base,'course','identity','rocs','serverAt',...(Object.hasOwn(state,'presentationId')?['presentationId']:[])];
 if(!exact(state,keys)||!exact(state.course,['title','opensAt','closesAt','assignedInstructorId'])||typeof state.course.title!=='string'||!uuid(state.course.assignedInstructorId)||!Number.isFinite(Date.parse(state.course.opensAt))||!Number.isFinite(Date.parse(state.course.closesAt))||Date.parse(state.course.closesAt)<=Date.parse(state.course.opensAt)||!exact(state.identity,['status','selfReportedNmlsId','verifiedAt'])||!['pending','verified','revoked'].includes(state.identity.status)||!(state.identity.selfReportedNmlsId===null||typeof state.identity.selfReportedNmlsId==='string')||!(state.identity.verifiedAt===null||Number.isFinite(Date.parse(state.identity.verifiedAt)))||!exact(state.rocs,['available','version','documentHash','renderedHash','acceptedAt','text'])||typeof state.rocs.available!=='boolean'||typeof state.rocs.version!=='string'||!(state.rocs.documentHash===null||/^[a-f0-9]{64}$/.test(state.rocs.documentHash))||!(state.rocs.renderedHash===null||/^[a-f0-9]{64}$/.test(state.rocs.renderedHash))||!(state.rocs.acceptedAt===null||Number.isFinite(Date.parse(state.rocs.acceptedAt)))||!(state.rocs.text===null||typeof state.rocs.text==='string')||!Number.isFinite(Date.parse(state.serverAt))||(Object.hasOwn(state,'presentationId')&&!uuid(state.presentationId)))fail();
 if(state.rocs.available&&(!state.rocs.documentHash||!state.rocs.renderedHash)||state.ready&&state.holds.length||(state.identity.verifiedAt&&Date.parse(state.identity.verifiedAt)>Date.parse(state.serverAt)&&!state.holds.includes('identity_verification_required'))||(state.rocs.acceptedAt&&Date.parse(state.rocs.acceptedAt)>Date.parse(state.serverAt)&&!state.holds.includes('rocs_acceptance_required')))fail();
 return {schemaVersion:1,actorId,courseId,mode:'prerequisite_bound',ready:state.ready,holds:[...state.holds],course:{...state.course},identity:{...state.identity},rocs:{...state.rocs},serverAt:state.serverAt,...(state.presentationId?{presentationId:state.presentationId}:{}),creditEligible:false,certificateEligible:false,bankingEligible:false};
}

function publicUnitState(state,unit,role){const allowed=role==='instructor'||state.delivery.allowed;return {...state,evidence:allowed?state.evidence:[],unit:allowed?unit:{...unit,task:'',peer:'',probe:'',revision:'',read:'',evidence:''}};}

function courseProgress(states,role) {
  const categories=Object.fromEntries(['federal_law','ethics','nontraditional','elective'].map(k=>[k,{plannedMs:0,observedMs:0,revisedUnits:0,unitCount:0}]));
  for(const state of states){const c=categories[state.cohort.category];c.plannedMs+=state.cohort.plannedMs;c.observedMs+=state.observedMs;c.unitCount++;if(state.stage==='revised-noncredit')c.revisedUnits++;}
  const revisedUnits=states.filter(s=>s.stage==='revised-noncredit').length;
  return {role,unitCount:25,revisedUnits,allTeachingEvidenceRecorded:role==='student'&&revisedUnits===25,
    observedMs:states.reduce((n,s)=>n+s.observedMs,0),plannedMs:60000000,categories,
    protectedFinal:{available:false,reasons:['protected_pe_final_not_installed','timing_study_unvalidated','human_teaching_review_pending','hosted_identity_and_rocs_acceptance_pending','regulatory_release_pending']}};
}

export function validatePeCourseState(state,actorId,role,courseId,unit) {
  const fail=()=>{throw new Error('pe_course_unavailable');};
  const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  const integer=x=>Number.isSafeInteger(x)&&x>=0;
  const date=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
  const exact=(x,keys)=>record(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
  if(!exact(state,['schemaVersion','delivery','cohort','actorId','role','revision','stage','observedMs','serverAt','evidence','receiptId','creditEligible','certificateEligible','bankingEligible','durationValidated']))fail();
  validatePeOilDelivery(state.delivery,actorId,courseId,role);
  if(state.schemaVersion!==1||state.actorId!==actorId||state.role!==role||!integer(state.revision)||!integer(state.observedMs)||!date(state.serverAt)||!Array.isArray(state.evidence)||!(state.receiptId===null||uuid(state.receiptId))||state.creditEligible!==false||state.certificateEligible!==false||state.bankingEligible!==false||state.durationValidated!==false)fail();
  if(!exact(state.cohort,['id','title','definitionId','contentHash','timezone','opensAt','closesAt','assignedInstructorId','courseId','unitId','category','initialMinimumMs','plannedMs'])||!uuid(state.cohort.id)||state.cohort.courseId!==courseId||state.cohort.unitId!==unit.unit||state.cohort.category!==unit.category||state.cohort.initialMinimumMs!==unit.initialMinimumMs||state.cohort.plannedMs!==unit.plannedMs||state.cohort.definitionId!==PE_COURSE_DEFINITION.id||state.cohort.contentHash!==unit.contentHash||!uuid(state.cohort.assignedInstructorId)||typeof state.cohort.title!=='string'||typeof state.cohort.timezone!=='string'||!date(state.cohort.opensAt)||!date(state.cohort.closesAt)||Date.parse(state.cohort.closesAt)<=Date.parse(state.cohort.opensAt))fail();
  if(!(role==='instructor'?['instructor-review']:['observe','initial-submission','peer-dialogue','awaiting-instructor','revision','revised-noncredit']).includes(state.stage))fail();
  let sequence=0;
  for(const event of state.evidence){
    if(!exact(event,['id','sequence','actorId','kind','at','revision','targetId','body'])||!uuid(event.id)||!uuid(event.actorId)||!integer(event.sequence)||event.sequence<=sequence||!integer(event.revision)||event.revision<1||!date(event.at)||!record(event.body)||!['observe','submit','peer','feedback','revise'].includes(event.kind))fail();
    sequence=event.sequence;
    if(['observe','submit'].includes(event.kind)?event.targetId!==null:!uuid(event.targetId))fail();
    if(event.kind==='observe'){
      if(!integer(event.body.observedMs)||event.body.observedMs>PE_COURSE_DEFINITION.maxObservedIntervalMs||!['active','paused'].includes(event.body.mode)||!uuid(event.body.tabId)||!date(event.body.intervalEnd)||(event.body.intervalStart!==null&&!date(event.body.intervalStart)))fail();
    }else if(typeof event.body.text!=='string'||event.body.text.trim().length<20||event.body.text.length>8000)fail();
  }
  validatePeCourseEvidence(state, fail);
}


// Treat RPC readback as an authority boundary too. A future SQL regression must
// not leak unrelated learner evidence or fabricate technical completion.
function validatePeCourseEvidence(state, fail) {
  const events = state.evidence;
  const byId = new Map(events.map(event => [event.id, event]));
  if (byId.size !== events.length) fail();
  const own = events.filter(event => event.actorId === state.actorId);
  const initial = own.find(event => event.kind === 'submit');
  const feedback = events.find(event => event.kind === 'feedback' && event.targetId === initial?.id);
  const incoming = events.find(event => event.kind === 'peer' && event.targetId === initial?.id);
  const revised = own.find(event => event.kind === 'revise');
  let observedMs = 0, revision = 0;
  const revisions = new Set();
  const uniqueTransitions = new Set();
  for (const event of events) {
    if (Date.parse(event.at) > Date.parse(state.serverAt)) fail();
    const revisionKey = `${event.actorId}:${event.revision}`;
    if (revisions.has(revisionKey)) fail();
    revisions.add(revisionKey);
    if (event.actorId === state.actorId) {
      if (event.revision !== revision + 1) fail();
      revision = event.revision;
      if (event.kind === 'observe') observedMs += event.body.observedMs;
    }
    if (state.role === 'student' && event.actorId !== state.actorId && !(
      (initial && event.kind === 'submit') ||
      (initial && ['peer', 'feedback'].includes(event.kind) && event.targetId === initial.id)
    )) fail();
    const bodyKeys = event.kind === 'observe'
      ? ['mode','tabId','observedMs','intervalStart','intervalEnd']
      : event.kind === 'feedback' ? ['text','peerId']
      : event.kind === 'revise' ? ['text','initialId','peerId'] : ['text'];
    if (Object.keys(event.body).length !== bodyKeys.length || bodyKeys.some(k => !Object.hasOwn(event.body,k))) fail();
    if (event.kind === 'observe') {
      const end = Date.parse(event.body.intervalEnd), start = Date.parse(event.body.intervalStart);
      if (end !== Date.parse(event.at)) fail();
      if (event.body.observedMs === 0 ? event.body.intervalStart !== null : (
        event.body.mode !== 'active' || !Number.isFinite(start) || end <= start ||
        Math.abs((end - start) - event.body.observedMs) > 1
      )) fail();
      continue;
    }
    const key = event.kind === 'peer' ? `${event.kind}:${event.actorId}:${event.targetId}`
      : event.kind === 'feedback' ? `${event.kind}:${event.targetId}` : `${event.kind}:${event.actorId}`;
    if (uniqueTransitions.has(key)) fail();
    uniqueTransitions.add(key);
    if (event.kind === 'submit') continue;
    const target = byId.get(event.targetId);
    if (!target || target.sequence >= event.sequence) fail();
    if (event.kind === 'peer' && (target.kind !== 'submit' || target.actorId === event.actorId)) fail();
    if (event.kind === 'feedback') {
      const peer = byId.get(event.body.peerId);
      if (event.actorId !== state.cohort.assignedInstructorId || target.kind !== 'submit' ||
        !peer || peer.kind !== 'peer' || peer.targetId !== target.id || peer.sequence >= event.sequence) fail();
    }
    if (event.kind === 'revise') {
      const first = byId.get(event.body.initialId);
      if (target.kind !== 'feedback' || target.actorId !== state.cohort.assignedInstructorId ||
        !first || first.kind !== 'submit' || first.actorId !== event.actorId || target.targetId !== first.id ||
        event.body.peerId !== target.body.peerId) fail();
    }
  }
  if (!Number.isSafeInteger(observedMs) || observedMs !== state.observedMs || revision !== state.revision) fail();
  if (state.receiptId !== null && (!byId.has(state.receiptId) || byId.get(state.receiptId).actorId !== state.actorId || byId.get(state.receiptId).revision !== state.revision)) fail();
  if (state.role === 'student') {
    const stage = revised ? 'revised-noncredit' : feedback ? 'revision' : incoming ? 'awaiting-instructor'
      : initial ? 'peer-dialogue' : observedMs >= state.cohort.initialMinimumMs ? 'initial-submission' : 'observe';
    if (state.stage !== stage || (initial && observedMs < state.cohort.initialMinimumMs) || (revised && observedMs < state.cohort.plannedMs)) fail();
  } else if (own.some(event => event.kind !== 'feedback')) fail();
}

export function peCoursePublicError(error) {
  const code = error?.message;
  const status = ['student_auth_required','invalid_student_session','invalid_staff_session'].includes(code) ? 401
    : ['origin_not_allowed','pe_course_access_denied','staff_binding_required','staff_role_not_authorized','staff_mfa_required','staff_session_required','staff_step_up_required','fresh_action_authorization_required'].includes(code) ? 403
    : code === 'pe_course_invalid_request' ? 400
    : code === 'pe_course_disabled' ? 404
    : ['pe_course_delivery_paused','pe_course_window_closed','pe_course_observation_closed','pe_course_clock_regressed','pe_course_content_changed','pe_course_revision_conflict','pe_course_idempotency_conflict','pe_course_tab_conflict','pe_course_already_recorded','pe_course_observation_required','pe_course_peer_required','pe_course_feedback_required','pe_course_readiness_required','pe_course_rocs_unavailable','pe_course_rocs_presentation_invalid'].includes(code) ? 409 : 503;
  return { status, body: { error: status === 503 ? 'pe_course_unavailable' : code } };
}
