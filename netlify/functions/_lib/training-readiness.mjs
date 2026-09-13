import { getCourseConfiguration, getCourseDelivery, getCourseQuestion } from '../../../config/course-registry.mjs';
import { isDeepStrictEqual } from 'node:util';
import { LAW_OF_AGENCY_TRAINING_RUNTIME } from '../../../config/texas/law-of-agency-training-runtime.mjs';
import { rpc } from './db.mjs';
import { isNmlsTrainingCourse } from '../../../config/nmls-course-identity.mjs';
import { nmlsTrainingDefinition } from '../../../config/nmls-training-definition.mjs';

export function trainingReadiness(courseId) {
  if(isNmlsTrainingCourse(courseId)) {
    try { nmlsTrainingDefinition(); }
    catch { return {ready:false,reason:'nmls_curriculum_integrity_unverified'}; }
    return {ready:false,reason:'nmls_database_runtime_verification_required'};
  }
  const config=getCourseConfiguration(courseId);
  if(!config)return {ready:false,reason:'student_renderer_not_registered'};
  if(config.state!=='CA' && courseId!==LAW_OF_AGENCY_TRAINING_RUNTIME.courseId)return {ready:false,reason:'state_progress_engine_not_connected'};
  for(const unit of config.assignments) {
    const delivery=getCourseDelivery(courseId,unit.id);
    if(!delivery?.blocks?.length)return {ready:false,reason:'lesson_delivery_missing'};
    for(const block of delivery.blocks)for(const screen of block.screens) {
      if(screen.type==='retrieval') {
        const primary=getCourseQuestion(courseId,screen.questionId);
        if(!primary||!getCourseQuestion(courseId,primary.replacementId))return {ready:false,reason:'retrieval_question_missing'};
      }
    }
  }
  return config.state==='TX'?{ready:false,reason:'database_runtime_verification_required'}:{ready:true,reason:null};
}

export async function verifiedTrainingReadiness(courseId) {
  const readiness=trainingReadiness(courseId);
  if(readiness.reason==='nmls_database_runtime_verification_required') {
    try {
      const actual=await rpc('nmls_training_definition',{p_course_id:courseId});
      if(!isDeepStrictEqual(actual,nmlsTrainingDefinition()))return {ready:false,reason:'nmls_training_database_definition_mismatch'};
      return {ready:true,reason:null};
    } catch { return {ready:false,reason:'nmls_training_database_runtime_unavailable'}; }
  }
  if(readiness.reason!=='database_runtime_verification_required')return readiness;
  try{
    const actual=await rpc('training_runtime_definition',{p_course_id:courseId});
    if(!isDeepStrictEqual(actual,LAW_OF_AGENCY_TRAINING_RUNTIME))return {ready:false,reason:'training_database_definition_mismatch'};
    return {ready:true,reason:null};
  }catch{return {ready:false,reason:'training_database_runtime_unavailable'};}
}
