import { createHash } from 'node:crypto';
import { dbRequest, rpc } from './db.mjs';
import { getCourseConfiguration } from '../../../config/course-registry.mjs';
import { verifiedTrainingReadiness } from './training-readiness.mjs';
import { COURSE_IDENTITIES } from '../../../config/course-identities.mjs';
export { trainingReadiness } from './training-readiness.mjs';
import { governanceCatalogue } from './offering-governance.mjs';

export async function availableTraining() {
  try {
    const rows=await governanceCatalogue();
    const counts=new Map();for(const row of rows)counts.set(row.offering_id,(counts.get(row.offering_id)||0)+1);
    const candidates=rows.filter(row=>counts.get(row.offering_id)===1&&row.offering_kind==='course'&&row.training_access_enabled===true&&row.state===getCourseConfiguration(row.offering_id)?.state&&row.discipline==='real_estate');
    const verified=await Promise.all(candidates.map(async row=>({row,readiness:await verifiedTrainingReadiness(row.offering_id)})));
    return {available:true,courses:verified.filter(item=>item.readiness.ready).map(({row})=>{
      const publicId=Object.entries(COURSE_IDENTITIES).find(([,identity])=>identity.id===row.offering_id&&identity.state===row.state)?.[0];
      return {id:row.offering_id,state:row.state,name:getCourseConfiguration(row.offering_id).title,...(publicId?{publicId}:{})};
    })};
  }catch{return {available:false,courses:[]};}
}

const fail=(message,statusCode=409)=>{throw Object.assign(new Error(message),{statusCode});};
export function trainingEnrollmentId(studentId,courseId) {
  const hex=createHash('sha256').update(`statecourse:training:v1:${studentId}:${courseId}`).digest('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-5${hex.slice(13,16)}-8${hex.slice(17,20)}-${hex.slice(20,32)}`;
}

export async function ensureTrainingEnrollment(studentId,course) {
  const readiness=await verifiedTrainingReadiness(course.id);
  if(!readiness.ready)fail(readiness.reason);
  const config=getCourseConfiguration(course.id);
  if(course.state!==config.state)fail('course_state_mismatch');
  const path=`enrollments?student_id=eq.${encodeURIComponent(studentId)}&course_id=eq.${encodeURIComponent(course.id)}&select=*&order=enrollment_date.desc&limit=1001`;
  const rows=await dbRequest(path);
  if(!Array.isArray(rows)||rows.length>1000)fail('enrollment_history_unavailable',503);
  const other=rows.find(r=>r.enrollment_origin!=='training'&&['active','qa_non_credit'].includes(r.status));
  if(other)return {enrollment:other,existing:true};
  let enrollment=rows.find(r=>r.enrollment_origin==='training');
  if(!enrollment) {
    const body={id:trainingEnrollmentId(studentId,course.id),student_id:studentId,course_id:course.id,state:course.state,status:'active',compliance_credit_eligible:false,enrollment_origin:'training',checkout_attempt_id:null,course_version:course.current_version||'1.0'};
    await dbRequest('enrollments?on_conflict=id',{method:'POST',prefer:'resolution=ignore-duplicates,return=minimal',body});
    enrollment=(await dbRequest(path)).find(r=>r.id===body.id);
  }
  if(!enrollment||enrollment.student_id!==studentId||enrollment.course_id!==course.id||enrollment.enrollment_origin!=='training')fail('training_enrollment_unavailable',503);
  if(enrollment.status!=='active'||enrollment.compliance_credit_eligible||enrollment.completed_at||(enrollment.expires_at&&Date.parse(enrollment.expires_at)<=Date.now()))fail('existing_training_access_inactive');
  const grant=(await dbRequest(`access_grants?enrollment_id=eq.${enrollment.id}&select=*&limit=1`))?.[0];
  if(grant&&grant.status!=='active')fail('training_access_revoked');
  await dbRequest('access_grants?on_conflict=enrollment_id',{method:'POST',prefer:'resolution=ignore-duplicates,return=minimal',body:{enrollment_id:enrollment.id,student_id:studentId,course_id:course.id,status:'active'}});
  const confirmed=(await dbRequest(`access_grants?enrollment_id=eq.${enrollment.id}&select=status&limit=1`))?.[0];
  if(confirmed?.status!=='active')fail('training_access_revoked');
  if(config.state==='TX')await rpc('initialize_training_runtime',{p_enrollment_id:enrollment.id,p_actor_id:studentId});
  else await dbRequest('lms_compliance_state?on_conflict=enrollment_id',{method:'POST',prefer:'resolution=ignore-duplicates,return=minimal',body:{enrollment_id:enrollment.id,required_study_seconds:config.requiredHours*3600,credited_study_seconds:0}});
  return {enrollment,existing:rows.some(r=>r.id===enrollment.id)};
}
