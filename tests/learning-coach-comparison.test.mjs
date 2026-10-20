import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {requestGemini} from '../experiments/lesson-coach/providers.mjs';
import {requestGemini as requestProductionGemini} from '../netlify/functions/_lib/learning-coach-gemini.mjs';
import {instructions} from '../netlify/functions/_lib/learning-coach-provider.mjs';
import {run,makeInput,assess} from '../experiments/lesson-coach/compare.mjs';
import {cases} from '../experiments/lesson-coach/cases.mjs';
import {portfolioCases} from '../experiments/lesson-coach/portfolio-cases.mjs';
const answer={status:'answer',explanation:'Review attachment to land.',sourceIds:['property-lesson'],nextStep:'Read the source.'};
test('production Gemini uses the model-compatible thinking control while retaining the token cap and schema',async()=>{
 for(const [model,thinkingConfig] of [['gemini-2.5-flash-lite',{thinkingBudget:0}],['gemini-3.5-flash-lite',{thinkingLevel:'minimal'}]]){
  const result=await requestProductionGemini({apiKey:'synthetic',model,input:{learnerMessage:'test',sources:[{id:'property-lesson',excerpt:answer.explanation}]},fetcher:async(url,options)=>{
   assert.equal(url,`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`);
   const body=JSON.parse(options.body);assert.deepEqual(body.generationConfig.thinkingConfig,thinkingConfig);
   assert.equal(body.generationConfig.maxOutputTokens,800);assert.equal(body.generationConfig.responseJsonSchema.additionalProperties,false);
   assert.equal(options.headers['x-goog-api-key'],'synthetic');assert.doesNotMatch(options.body,/synthetic/);
   return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({status:answer.status,refusal:'',nextStep:answer.nextStep,evidence:[{text:answer.explanation,sourceId:'property-lesson',passageId:'p0'}]})}]}}]})};
  }});assert.deepEqual(result.answer,answer);
 }
});
test('Gemini sends key only in header, bounded generation and shared instructions; parses usage',async()=>{
 const result=await requestGemini({apiKey:'synthetic',model:'gemini-2.5-flash',input:{learnerMessage:'test',sources:[{id:'property-lesson',excerpt:answer.explanation}]},fetcher:async(url,options)=>{
  assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
  assert.equal(options.headers['x-goog-api-key'],'synthetic');assert.ok(options.signal);
  const b=JSON.parse(options.body);assert.equal(b.systemInstruction.parts[0].text,instructions);assert.equal(b.generationConfig.maxOutputTokens,800);assert.equal(b.generationConfig.thinkingConfig.thinkingBudget,0);
  return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({status:answer.status,refusal:'',nextStep:answer.nextStep,evidence:[{text:answer.explanation,sourceId:'property-lesson',passageId:'p0'}]})}]}}],usageMetadata:{promptTokenCount:100,candidatesTokenCount:30}})};
 }});assert.deepEqual(result,{answer,usage:{inputTokens:100,outputTokens:30}});
});
test('Gemini rejects truncation, blocked requests, malformed JSON and unsafe model paths',async()=>{
 for(const response of [{ok:false},{ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS'}]})},{ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:'bad-json'}]}}]})}])await assert.rejects(requestGemini({apiKey:'synthetic',model:'gemini-2.5-flash',input:{},fetcher:async()=>response}));
 await assert.rejects(requestGemini({apiKey:'synthetic',model:'../wrong?key=bad',input:{},fetcher:()=>assert.fail('must not call')}));
});
test('comparison rejects invented citations and records refusal mismatches without pretending quality approval',()=>{
 const {context}=makeInput(cases[0]);assert.throws(()=>assess({...answer,sourceIds:['invented']},context,cases[0]));
 const result=assess(answer,context,{expected:'insufficient_sources'});assert.equal(result.statusMatch,false);assert.match(result.humanReview,/REQUIRED/);
});
test('offline run never requires credentials; paid runs require prices and cannot overwrite earlier results',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'coach-compare-'));
 try{
  const output=path.join(dir,'offline.json'),report=await run({output,env:{}});assert.equal(report.kind,'offline_readiness');assert.equal(report.results.length,2);assert.ok(report.results.every(r=>r.items.length===0));
  await assert.rejects(run({output,env:{}}),/EEXIST/);
  const live=await run({live:true,output:path.join(dir,'guarded.json'),env:{OPENAI_API_KEY:'synthetic',GEMINI_API_KEY:'synthetic',COMPARE_OPENAI_MODEL:'test',COMPARE_GEMINI_MODEL:'test'}});
  assert.ok(live.results.every(r=>r.status==='missing_verified_prices'&&r.items.length===0));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('portfolio comparison covers every catalog course and national mortgage module with bounded teaching-only input',()=>{
 assert.equal(portfolioCases.length,50);const inputs=portfolioCases.map(item=>makeInput(item));
 assert.equal(new Set(inputs.map(x=>x.context.courseId)).size,31);
 assert.equal(portfolioCases.filter(c=>c.contextId?.includes('nmls')).length,8);
 for(const {input}of inputs){assert.ok(Buffer.byteLength(JSON.stringify(input))<=14000);assert.ok(input.sources.length);assert.doesNotMatch(JSON.stringify(input),/"correctChoice"\s*:|"actionQuestion"\s*:|N26-FIN-/);}
});
