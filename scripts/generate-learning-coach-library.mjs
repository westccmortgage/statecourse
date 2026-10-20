// Explicit teaching-source allowlists. Never glob submissions, exams or private banks.
import fs from 'node:fs';
import path from 'node:path';
import {PRACTICE_SOURCES} from '../config/free-practice-sources.mjs';
import {NMLS_TRAINING_COURSE as nmls} from '../config/nmls-course-identity.mjs';
import {getNmlsReviewCourse} from '../netlify/functions/_lib/nmls-review-content.mjs';
import {chunkLesson,digest} from './lib/learning-coach-chunks.mjs';
const root=path.resolve(import.meta.dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'public/statecourse/data/course-catalog.json'))).categories.flatMap(c=>c.programs.flatMap(p=>p.courses));
const lessons=[];
for(const source of PRACTICE_SOURCES){
 const course=catalog.find(c=>c.course_id===source.courseId);if(!course)throw Error('missing_catalog_course');
 for(const file of fs.readdirSync(path.join(root,source.curriculumDir)).filter(f=>/^(module|lesson)-\d+\.md$/.test(f)).sort()){
  const sourcePath=`${source.curriculumDir}/${file}`,text=fs.readFileSync(path.join(root,sourcePath),'utf8');
  if(/instructor version and answer key|Items, with the material reference for each answer|__statecourse_private_export|^##\s*Answer key/im.test(text))throw Error(`protected_source:${sourcePath}`);
  const lessonId=file.slice(0,-3);const body={id:`lesson:${course.course_id}:${lessonId}`,access:'public_practice',discipline:'real_estate',courseId:course.course_id,state:source.stateCode,version:course.course_version,lessonId,title:text.match(/^#{1,2}\s+(.+)$/m)?.[1]??lessonId,sourcePath,lessonDigest:digest(text),chunks:chunkLesson(text)};
  lessons.push({...body,digest:digest(JSON.stringify(body))});
 }
}
// Compiler projection only: explicitly select teaching strings, never quiz/actionQuestion.
const national=getNmlsReviewCourse(nmls.contentKey);
for(const module of national.modules)for(const unit of module.units){
 if(typeof unit.content!=='string')throw Error('invalid_nmls_teaching_content');
 const body={id:`lesson:${nmls.id}:${unit.id}`,access:'authenticated_training',discipline:'mortgage',courseId:nmls.id,state:nmls.state,version:nmls.version,lessonId:unit.id,title:unit.title,sourcePath:`${nmls.contentKey}/${module.id}/${unit.id}`,courseDigest:national.digest,lessonDigest:digest(unit.content),chunks:chunkLesson(unit.content)};
 lessons.push({...body,digest:digest(JSON.stringify(body))});
}
const library={schemaVersion:1,lessons};
fs.writeFileSync(path.join(root,'config/learning-coach/library.json'),JSON.stringify(library)+'\n');
const publicContexts=lessons.filter(l=>l.access==='public_practice').map(({id,courseId,state,version,lessonId,title,lessonDigest,digest})=>({id,courseId,state,version,lessonId,title,lessonDigest,digest,questionIds:[]}));
fs.writeFileSync(path.join(root,'public/statecourse/learning-coach-library.json'),JSON.stringify({contexts:publicContexts})+'\n');
console.log(JSON.stringify({courses:new Set(lessons.map(l=>l.courseId)).size,publicLessons:publicContexts.length,privateUnits:lessons.length-publicContexts.length,chunks:lessons.reduce((n,l)=>n+l.chunks.length,0)}));
