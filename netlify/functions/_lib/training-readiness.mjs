import { getCourseConfiguration, getCourseDelivery, getCourseQuestion } from '../../../config/course-registry.mjs';

export function trainingReadiness(courseId) {
  const config=getCourseConfiguration(courseId);
  if(!config)return {ready:false,reason:'student_renderer_not_registered'};
  if(config.state!=='CA')return {ready:false,reason:'state_progress_engine_not_connected'};
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
  return {ready:true,reason:null};
}

