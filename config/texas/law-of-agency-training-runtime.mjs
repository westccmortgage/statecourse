import { getCourseConfiguration, getCourseDelivery, getCourseQuestion } from '../course-registry.mjs';

const courseId='tx-law-of-agency-30-v1';
const course=getCourseConfiguration(courseId);
// Only identifiers and completion requirements, never question answers.
export const LAW_OF_AGENCY_TRAINING_RUNTIME=Object.freeze({
  revision:'tx-training-v1',courseId,courseVersion:'1.0',
  modules:course.assignments.map(unit=>({
    id:unit.id,sequence:unit.sequence,title:unit.title,expectedMinutes:unit.expectedMinutes,
    contentPath:unit.contentPath,sectionCount:unit.sectionCount,
    requiredBlocks:getCourseDelivery(courseId,unit.id).blocks.filter(b=>b.required!==false).map(block=>({
      id:block.id,
      screens:block.screens.filter(s=>s.type!=='retrieval').map(s=>s.id),
      questions:block.screens.filter(s=>s.type==='retrieval').map(s=>({
        screenId:s.id,primary:s.questionId,replacement:getCourseQuestion(courseId,s.questionId).replacementId,
      })),
    })),
  })),
});
