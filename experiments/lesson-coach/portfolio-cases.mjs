import library from '../../config/learning-coach/library.json' with {type:'json'};
import {cases} from './cases.mjs';
const courses=new Map(),modules=new Map();
for(const lesson of library.lessons){
 if(lesson.access==='public_practice'&&!courses.has(lesson.courseId))courses.set(lesson.courseId,lesson);
 if(lesson.access==='authenticated_training'){
  const moduleId=lesson.sourcePath.split('/')[1];if(!modules.has(moduleId))modules.set(moduleId,lesson);
 }
}
const sample=(lesson,index)=>({id:`portfolio-${index}-${lesson.courseId}-${lesson.lessonId}`,contextId:lesson.id,message:`Explain one important distinction from "${lesson.title}" using only this lesson. Give a short, clearly hypothetical application. State if the sources do not support an answer.`,expected:'review'});
// 30 catalog courses, all eight national mortgage modules, plus the 12 targeted
// misconception/refusal/injection/language cases. No learner or exam records.
export const portfolioCases=[...cases,...[...courses.values(),...modules.values()].map(sample)];
