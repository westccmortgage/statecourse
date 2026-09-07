import {FORM,TOPICS,ALL_UNITS} from './law-of-contracts-course-form.mjs';
import {UNIT_OBJECTIVES} from './law-of-contracts-question-bank.mjs';
export {UNIT_OBJECTIVES};
export const COURSE=Object.freeze({courseId:'tx-law-of-contracts-30-v1',title:'Law of Contracts',hours:FORM.courseHours,totalMinutes:FORM.totalMinutes,
  approvalForm:FORM.formNumber,approvalFormRevision:FORM.revision,curriculumDir:'texas/tx-law-of-contracts-30-v1/curriculum',contentFreeze:null,
  authoringStatus:'COMPLETE_DRAFT_PENDING_INDEPENDENT_REVIEW',fullCourseAuthoringComplete:true,independentReviewComplete:false,
  enrollmentEnabled:false,paymentEnabled:false,creditReportingEnabled:false,certificateIssuanceEnabled:false,finalExaminationAdministrable:false,
  finalExaminationStatus:'AUTHORED_132_ITEMS_PENDING_INDEPENDENT_LEGAL_AND_SEPARATION_REVIEW',trecApproved:false,trecApprovalStatus:'NOT_SUBMITTED_NOT_APPROVED',
  timeStudyStatus:'PROVIDER_ASSUMPTION_ONLY_NO_MEASURED_LEARNER_STUDY'});
export const MODULES=Object.freeze(TOPICS.map((t,i)=>Object.freeze({module:`module-${String(i+1).padStart(2,'0')}`,file:`module-${String(i+1).padStart(2,'0')}.md`,topicCode:t.code,topic:t.topic,scopeNote:t.scopeNote,prescribedMinutes:t.subtotalMinutes,units:t.units.length})));
export const UNIT_TRACE=Object.freeze(ALL_UNITS.map(u=>Object.freeze({...u,objective:UNIT_OBJECTIVES[u.code],module:`module-${u.code.slice(1,3)}`})));
if(UNIT_TRACE.length!==80 || UNIT_TRACE.some(u=>!u.objective)) throw Error('LOC objectives incomplete');
