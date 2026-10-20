// Explicit formative allowlist only. Never import a final-examination aggregate.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildFreePractice} from './generate-free-practice.mjs';
const root=new URL('../',import.meta.url).pathname;
const read=p=>fs.readFileSync(root+p,'utf8');
const hash=x=>createHash('sha256').update(x).digest('hex');
const courseId='ca-real-estate-principles-45';
let course;
const states=JSON.parse(read('public/statecourse/data/state-registry.json')).states;
const catalogCourses=JSON.parse(read('public/statecourse/data/course-catalog.json')).categories.flatMap(c=>c.programs.flatMap(p=>p.courses));
await buildFreePractice({root,states,catalogCourses,write:(p,v)=>{if(p===`free-practice/courses/${courseId}.json`)course=JSON.parse(v);}});
const specs=[
 ['property','Real and personal property','lesson-01','### 1.4 Real property versus real estate versus land','### 1.5',[2,7]],
 ['dre','What California DRE does','lesson-01','### 2.1 What the Department does','### 2.2',[3,8]],
 ['ltv','Loan-to-value versus down payment','lesson-11','### 5.1 Loan-to-value','### 5.2',[118]],
];
const contexts=specs.map(([id,title,lessonId,start,end,numbers])=>{
 const lesson=course.lessons.find(l=>l.id===lessonId);
 const file=`california/${courseId}-v1/curriculum/${lessonId}.md`,raw=read(file);
 const a=raw.indexOf(start),b=raw.indexOf(end,a);if(a<0||b<=a)throw Error('source_anchor_missing');
 const questions=numbers.map(n=>{const q=course.questions.find(q=>q.id===`${courseId}:${n}`);if(!q||q.lesson_id!==lessonId)throw Error('question_missing');return q;});
 const source={id:`${id}-lesson`,label:`${lessonId}: ${title}`,excerpt:raw.slice(a,b).trim(),url:`/free-practice/?state=CA&course=${courseId}&lesson=${lessonId}&mode=read`,file,sha256:hash(raw)};
 const sources=[source,...questions.map((q,i)=>({id:`${id}-practice-${i+1}`,label:'Authored formative explanation',excerpt:q.explanation,url:source.url}))];
 const body={id,title,courseId,state:'CA',lessonId,version:catalogCourses.find(c=>c.course_id===courseId).course_version,pilotVersion:'coach-pilot-v1',lessonDigest:lesson.sha256,bankDigest:hash(read('config/california/principles-question-bank.mjs')),sources,questions};
 return {...body,digest:hash(JSON.stringify(body))};
});
fs.writeFileSync(root+'config/learning-coach/context.json',JSON.stringify({contexts},null,2)+'\n');
fs.writeFileSync(root+'public/statecourse/learning-coach-context.json',JSON.stringify({contexts:contexts.map(({id,title,courseId,state,lessonId,version,digest,lessonDigest,questions})=>({id,title,courseId,state,lessonId,version,digest,lessonDigest,questionIds:questions.map(q=>q.id)}))},null,2)+'\n');
console.log('Pinned 3 formative concepts; 5 existing questions; no protected inputs.');
