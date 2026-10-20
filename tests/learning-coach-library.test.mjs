import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chunkLesson,selectChunks,digest} from '../scripts/lib/learning-coach-chunks.mjs';
import library from '../config/learning-coach/library.json' with {type:'json'};
import {resolveContext,coach} from '../netlify/functions/_lib/learning-coach.mjs';
import {getNmlsReviewCourse} from '../netlify/functions/_lib/nmls-review-content.mjs';
import {NMLS_TRAINING_COURSE} from '../config/nmls-course-identity.mjs';
const publicLessons=library.lessons.filter(l=>l.access==='public_practice'),privateLessons=library.lessons.filter(l=>l.access==='authenticated_training');
const body=l=>({requestId:'11111111-1111-4111-8111-111111111111',courseId:l.courseId,state:l.state,lessonId:l.lessonId,version:l.version,digest:l.digest,conceptId:l.id,questionId:null,selected:null,message:'Explain this lesson.',consent:true});
test('chunking preserves every normalized character and enforces hard bounds',()=>{
 const text='# Title\r\n\n'+('Long paragraph 🏡 '.repeat(700))+'\n\n## Another topic\nShort text.';
 const chunks=chunkLesson(text);assert.equal(chunks.map(c=>c.excerpt).join(''),text.replace(/\r\n/g,'\n'));assert.ok(chunks.every(c=>c.excerpt.length<=1800));assert.equal(new Set(chunks.map(c=>c.id)).size,chunks.length);
 assert.deepEqual(chunkLesson(text),chunks);
 assert.ok(chunks.every(c=>c.excerpt.isWellFormed()));
});
test('all authored practice lessons and mortgage teaching units are separately pinned',()=>{
 assert.equal(publicLessons.length,284);assert.equal(privateLessons.length,45);assert.equal(new Set(publicLessons.map(l=>l.courseId)).size,30);
 for(const l of library.lessons){const {digest:hash,...data}=l;assert.equal(hash,digest(JSON.stringify(data)));assert.ok(l.chunks.length);assert.ok(l.chunks.every(c=>c.excerpt.length<=1800));if(l.access==='public_practice')assert.equal(digest(fs.readFileSync(l.sourcePath,'utf8')),l.lessonDigest);}
 const publicIndex=JSON.parse(fs.readFileSync('public/statecourse/learning-coach-library.json','utf8'));
 assert.equal(publicIndex.contexts.length,284);assert.ok(publicIndex.contexts.every(c=>!c.courseId.startsWith('nmls')));
 assert.doesNotMatch(JSON.stringify(publicIndex),/"excerpt"|"correctChoice"|"solution"/);
 assert.doesNotMatch(JSON.stringify(library),/"correctChoice"\s*:|"actionQuestion"\s*:|"bank"\s*:/);
 const national=getNmlsReviewCourse(NMLS_TRAINING_COURSE.contentKey),units=national.modules.flatMap(m=>m.units);
 for(const l of privateLessons){const unit=units.find(u=>u.id===l.lessonId);assert.equal(l.courseDigest,national.digest);assert.equal(l.lessonDigest,digest(unit.content));assert.equal(l.chunks.map(c=>c.excerpt).join(''),unit.content.replace(/\r\n/g,'\n'));}
});
test('lookup cannot cross state/course/version, expose private mortgage or accept protected questions',()=>{
 const l=publicLessons[0],b=body(l),r=resolveContext(b);assert.ok(r.context.sources.length<=5);assert.ok(r.context.sources.every(s=>l.chunks.some(c=>c.id===s.id)));
 for(const bad of [{state:'OTHER'},{version:'old'},{digest:'bad'},{questionId:'protected-final'},{allowPrivate:true}])assert.throws(()=>resolveContext({...b,...bad}));
 assert.throws(()=>resolveContext(body(privateLessons[0])));
 assert.ok(resolveContext(body(privateLessons[0]),{allowPrivate:true}).context.sources.length);
});
test('retrieval ranks only supplied chunks and never fetches external sources',()=>{
 const chunks=chunkLesson('# Property\nAttachment to land.\n\n'+('a'.repeat(1800))+'\n\n# Loans\nLoan-to-value uses the loan amount divided by value.');
 const selected=selectChunks(chunks,'loan value',{limit:1});assert.equal(selected.length,1);assert.match(selected[0].excerpt,/Loan-to-value/);
});
test('every teaching context can produce a bounded source-only request without changing course state',async()=>{
 const env={LEARNING_COACH_ENABLED:'true',OPENAI_API_KEY:'synthetic',LEARNING_COACH_MODEL:'synthetic-model',LEARNING_COACH_ORIGIN:'https://example.test',LEARNING_COACH_HASH_SECRET:'x'.repeat(32),LEARNING_COACH_INPUT_USD_PER_MILLION:'1',LEARNING_COACH_OUTPUT_USD_PER_MILLION:'4',LEARNING_COACH_DAILY_BUDGET_USD:'1'};
 for(const lesson of library.lessons){
  let providerCalls=0;
  const result=await coach(body(lesson),{env,origin:env.LEARNING_COACH_ORIGIN,ip:'synthetic',allowPrivate:lesson.access==='authenticated_training',store:async op=>{assert.ok(['reserve','complete'].includes(op));return {status:'reserved'};},provider:async({input})=>{
   providerCalls++;assert.ok(Buffer.byteLength(JSON.stringify(input))<=14000);assert.equal(input.context.course,lesson.courseId);assert.equal(input.context.discipline,lesson.discipline);assert.equal(input.practice,null);
   assert.ok(input.sources.every(s=>lesson.chunks.some(c=>c.id===s.id&&c.excerpt===s.excerpt)));
   return {answer:{status:'answer',explanation:'Synthetic source-grounded explanation.',sourceIds:[input.sources[0].id],nextStep:'Read the cited lesson.'},usage:{}};
  }});assert.equal(result.status,'answer');assert.equal(providerCalls,1);
 }
});
test('Gemini requires matching explicit consent before reservation and keeps provider credentials separate',async()=>{
 const l=publicLessons[0],env={LEARNING_COACH_ENABLED:'true',LEARNING_COACH_PROVIDER:'gemini',GEMINI_API_KEY:'gemini-synthetic',OPENAI_API_KEY:'openai-synthetic',LEARNING_COACH_MODEL:'gemini-2.5-flash',LEARNING_COACH_ORIGIN:'https://example.test',LEARNING_COACH_HASH_SECRET:'a'.repeat(32),LEARNING_COACH_INPUT_USD_PER_MILLION:'1',LEARNING_COACH_OUTPUT_USD_PER_MILLION:'4',LEARNING_COACH_DAILY_BUDGET_USD:'1'};
 const calls=[];const opts={env,ip:'test',origin:env.LEARNING_COACH_ORIGIN,store:async(op)=>{calls.push(op);return {status:'reserved'};},provider:async args=>{assert.equal(args.apiKey,'gemini-synthetic');return {answer:{status:'answer',explanation:'Study this source.',sourceIds:[args.input.sources[0].id],nextStep:'Review the lesson.'},usage:{}};}};
 await assert.rejects(coach(body(l),opts),/provider_consent_changed/);assert.deepEqual(calls,[]);
 const result=await coach({...body(l),consentProvider:'gemini'},opts);assert.equal(result.provider,'gemini');assert.equal(result.nextQuestionId,null);assert.deepEqual(calls,['reserve','complete']);
});
