import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {PRACTICE_SOURCES} from '../config/free-practice-sources.mjs';
import {splitSections,presentedChoices,gradePractice,practiceSummary,restorePractice} from '../public/statecourse/practice-core.mjs';
import {renderLessonMarkdown} from '../public/statecourse/student/course/blocks/lesson-markdown.mjs';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=JSON.parse(read('public/statecourse/data/course-catalog.json'));
const allCourses=catalog.categories.flatMap(c=>c.programs??[]).flatMap(p=>p.courses??[]);
const manifest=JSON.parse(read('public/statecourse/data/free-practice-catalog.json'));
const protectedText=/final-exam-form-[ab]-answer-key|##\s*Answer key|\bcorrectChoice\b|module-question-bank|final-exam-bank|instructor version and answer key|Items, with the material reference for each answer|__statecourse_private_export/i;
test('all catalog courses have distinct explicit non-credit practice sources',()=>{
 assert.equal(manifest.schema_version,'2.0');
 assert.deepEqual(manifest.samples.map(s=>s.course_id).sort(),allCourses.map(c=>c.course_id).sort());
 assert.equal(new Set(manifest.samples.map(s=>s.practice_url)).size,allCourses.length);
 assert.match(manifest.disclosure,/No enrollment.*licensing credit.*certificate.*final examination/i);
 for(const category of catalog.categories)for(const program of category.programs??[])for(const c of program.courses??[])assert.equal(c.state_id,program.state_code);
});
for(const sample of manifest.samples)test(sample.course_id+': every lesson and every answer choice is usable',()=>{
 const source=PRACTICE_SOURCES.find(s=>s.courseId===sample.course_id);
 const course=JSON.parse(read('public/statecourse/'+sample.practice_url));
 const files=fs.readdirSync(path.join(root,source.curriculumDir)).filter(f=>/^(module|lesson)-\d+\.md$/.test(f)).sort();
 assert.deepEqual(course.lessons.map(l=>l.id+'.md'),files);
 assert.equal(course.questions.length,sample.question_count);
 assert.equal(course.lessons.length,sample.lesson_count);
 assert.equal(new Set(course.questions.map(q=>q.id)).size,course.questions.length);
 const answers={};
 for(const lesson of course.lessons){
  const text=read('public/statecourse/'+lesson.content_url);
  assert.equal(text,read(source.curriculumDir+'/'+lesson.id+'.md'));
  assert.equal(createHash('sha256').update(text).digest('hex'),lesson.sha256);
  assert.doesNotMatch(text,protectedText);
  for(const section of splitSections(text))assert.ok(renderLessonMarkdown(section.body).length>0,lesson.id+'/'+section.title);
  assert.ok(course.questions.some(q=>q.lesson_id===lesson.id),lesson.id+' has no questions');
 }
 for(const q of course.questions){
  assert.ok(course.lessons.some(l=>l.id===q.lesson_id));
  assert.equal(new Set(q.choices).size,4);
  assert.ok(q.prompt&&q.explanation);
  assert.deepEqual(presentedChoices(q).map(c=>c.index).sort(),[0,1,2,3]);
  assert.deepEqual(presentedChoices(q),presentedChoices(q));
  for(let i=0;i<4;i++)assert.equal(gradePractice(q,i).correct,i===q.solution);
  for(const invalid of [null,undefined,'0',-1,4,NaN])assert.equal(gradePractice(q,invalid),null);
  answers[q.id]={selected:q.solution,firstSelected:q.solution};
 }
 assert.equal(practiceSummary(course.questions,answers).percent,100);
 assert.equal(practiceSummary(course.questions,answers).firstCorrect,course.questions.length);
});
test('every course page links to its own practice; each built state has a working route',()=>{
 for(const sample of manifest.samples){
  const c=allCourses.find(c=>c.course_id===sample.course_id);
  const route=c.route.replace(/^\//,'');
  const coursePage=read('public/statecourse/'+route+'index.html');
  assert.ok(coursePage.includes('free-practice/?state='+sample.state_code+'&amp;course='+sample.course_id),sample.course_id+' links to the wrong practice');
  const stateSlug=sample.state_name.toLowerCase().replaceAll(/[^a-z0-9]+/g,'-');
  const state=read('public/statecourse/real-estate/'+stateSlug+'/index.html');
  assert.ok(state.includes('free-practice/?state='+sample.state_code));
 }
});
test('invalid saved data cannot crash or manufacture progress',()=>{
 const q={id:'one',prompt:'test',choices:['a','b','c','d'],solution:2,explanation:'why'};
 for(const saved of [null,[],{answers:null},{answers:{one:{selected:99}},position:{section:'bad',question:-1}},'broken']){
  const restored=restorePractice(saved,[q]);assert.equal(practiceSummary([q],restored.answers).answered,0);assert.equal(restored.position.section,0);
 }
 assert.equal(practiceSummary([q],{one:{selected:99}}).answered,0);
 const retry=restorePractice({answers:{one:{firstSelected:1,attempts:2}}},[q]);
 assert.equal(retry.answers.one.firstSelected,1);assert.equal(retry.answers.one.selected,undefined);
});
test('introductory text survives, but a heading-only preamble does not create an empty screen',()=>{
 assert.equal(splitSections('# Title\n\n## First\nBody').length,1);
 assert.equal(splitSections('# Title\nImportant introduction.\n## First\nBody')[0].body.includes('Important introduction.'),true);
});
test('interactive practice retains the no-credit boundary and cache revisions',()=>{
 const page=read('public/statecourse/free-practice/index.html'),js=read('public/statecourse/free-practice.js');
 assert.match(page,/does not create enrollment.*licensing credit.*completion certificate.*protected course final examination/i);
 for(const id of ['practiceStateSelect','practiceCourseSelect','practiceLessonSelect','practiceQuiz','practiceProgress'])assert.ok(page.includes('id="'+id+'"'));
 assert.match(js,/gradePractice/);assert.match(js,/localStorage/);assert.match(js,/AbortController/);
 assert.match(js,/lessonUrl.searchParams.set\('v',lesson.sha256\)/);assert.match(js,/courseUrl.searchParams.set\('v',sample.revision\)/);
});
