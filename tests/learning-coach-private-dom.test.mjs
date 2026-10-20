import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {mountPrivateCoach} from '../public/statecourse/learning-coach-private.js';

test('private coach detaches in review/exams and clears late answers after unit or access changes',{skip:process.env.NMLS_TEST_DOM_MODULE?false:'NMLS_TEST_DOM_MODULE is required for actual DOM checks.'},async()=>{
 const {parseHTML}=await import(pathToFileURL(process.env.NMLS_TEST_DOM_MODULE));const {document}=parseHTML('<html><body><article id="lesson"></article></body></html>');
 let context=null,release,provider='gemini',sent;
 const win={crypto:{randomUUID},setTimeout,clearTimeout,fetch:async(url,options)=>{
  if(url==='/api/learning/coach')return {ok:true,json:async()=>({provider,enabled:true})};
  sent=JSON.parse(options.body);return new Promise(resolve=>{release=()=>resolve({ok:true,json:async()=>({status:'answer',explanation:'LATE PRIVATE ANSWER',nextStep:'Read again.',sources:[{label:'Source',excerpt:'PRIVATE EXCERPT'}]})});});
 }};
 const coach=mountPrivateCoach({document,window:win,anchor:document.getElementById('lesson'),getContext:()=>context});
 await coach.update();assert.equal(document.querySelectorAll('input, textarea, .learning-coach').length,0);
 context={enrollmentId:randomUUID(),sessionId:randomUUID(),unitId:'unit-1'};await coach.update();
 const panel=document.querySelector('.learning-coach');assert.match(panel.textContent,/Google Gemini/);panel.querySelector('textarea').value='Explain this lesson.';panel.querySelector('input').checked=true;
 const pending=panel.querySelector('button').onclick();assert.equal(sent.consentProvider,'gemini');assert.deepEqual(Object.keys(sent).sort(),['consent','consentProvider','enrollmentId','message','requestId','sessionId','unitId']);
 context=null;await coach.update();assert.equal(document.querySelectorAll('input, textarea, .learning-coach').length,0);release();await pending;assert.doesNotMatch(panel.textContent,/LATE PRIVATE ANSWER|PRIVATE EXCERPT/);
 context={enrollmentId:randomUUID(),sessionId:randomUUID(),unitId:'unit-2'};provider='openai';await coach.update();
 assert.equal(panel.querySelector('input').checked,false);assert.equal(panel.querySelector('textarea').value,'');assert.match(panel.textContent,/AI provider: OpenAI/);
 coach.reset();assert.equal(document.querySelector('.learning-coach'),null);await coach.update();assert.ok(document.querySelector('.learning-coach'));coach.destroy();assert.equal(document.querySelector('.learning-coach'),null);
});
