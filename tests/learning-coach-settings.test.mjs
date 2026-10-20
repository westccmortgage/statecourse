import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCoachEnvironment} from '../netlify/functions/_lib/learning-coach-settings.mjs';
import {settings} from '../netlify/functions/_lib/learning-coach.mjs';
import {handler} from '../netlify/functions/learning-coach.mjs';

const configuration={LEARNING_COACH_ENABLED:'true',LEARNING_COACH_PROVIDER:'openai',LEARNING_COACH_MODEL:'synthetic-model',LEARNING_COACH_ORIGIN:'https://coach.test',LEARNING_COACH_HASH_SECRET:'synthetic-hash-secret-32-characters',LEARNING_COACH_INPUT_USD_PER_MILLION:'0.4',LEARNING_COACH_OUTPUT_USD_PER_MILLION:'1.6',LEARNING_COACH_DAILY_BUDGET_USD:'1'};
test('database settings enable guarded generation without adding Lambda variables or copying credentials',async()=>{
 const env={OPENAI_API_KEY:'synthetic-openai',GEMINI_API_KEY:'synthetic-gemini',SUPABASE_SERVICE_ROLE_KEY:'synthetic-service'};
 const effective=await loadCoachEnvironment({env,store:async(op,payload)=>{assert.equal(op,'settings');assert.deepEqual(payload,{});return configuration;}});
 assert.equal(effective.OPENAI_API_KEY,env.OPENAI_API_KEY);assert.equal(effective.GEMINI_API_KEY,env.GEMINI_API_KEY);
 assert.deepEqual(settings(effective),{reserveMicros:7680,budgetMicros:1000000});assert.equal(env.LEARNING_COACH_ENABLED,undefined);
});
test('explicit deployment off switch overrides the database without even loading its secret',async()=>{
 const env={LEARNING_COACH_ENABLED:'false'};
 assert.equal(await loadCoachEnvironment({env,store:()=>assert.fail('database must not be read')}),env);
 assert.throws(()=>settings(env),/coach_unavailable/);
});
test('database cannot replace provider keys, backend bindings or non-string settings',async()=>{
 for(const stored of [null,[],{OPENAI_API_KEY:'untrusted'},{SUPABASE_URL:'https://evil.test'},{LEARNING_COACH_ENABLED:true},{...configuration,GEMINI_API_KEY:'untrusted'}]){
  await assert.rejects(loadCoachEnvironment({env:{},store:async()=>stored}),/^Error: coach_unavailable$/);
 }
});
test('missing storage fails closed, and unsafe stored budgets still fail validation',async()=>{
 await assert.rejects(loadCoachEnvironment({env:{},store:async()=>{throw Error('store_unavailable');}}),/store_unavailable/);
 for(const amount of ['0','-1','100','NaN']){
  const env=await loadCoachEnvironment({env:{OPENAI_API_KEY:'synthetic'},store:async()=>({...configuration,LEARNING_COACH_DAILY_BUDGET_USD:amount})});
  assert.throws(()=>settings(env),/coach_unavailable/);
 }
});
test('public configuration route exposes only provider/enabled when settings include a server secret',async t=>{
 const names=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','LEARNING_COACH_ENABLED'];
 const before=Object.fromEntries(names.map(key=>[key,process.env[key]])),fetchBefore=globalThis.fetch;
 t.after(()=>{globalThis.fetch=fetchBefore;for(const [key,value]of Object.entries(before)){if(value===undefined)delete process.env[key];else process.env[key]=value;}});
 process.env.SUPABASE_URL='https://coach-store.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='synthetic-service';delete process.env.LEARNING_COACH_ENABLED;
 globalThis.fetch=async(url,init)=>{assert.equal(url,'https://coach-store.invalid/rest/v1/rpc/learning_coach_control');assert.deepEqual(JSON.parse(init.body),{op:'settings',payload:{}});return Response.json(configuration);};
 const response=await handler({httpMethod:'GET'});
 assert.equal(response.statusCode,200);assert.deepEqual(JSON.parse(response.body),{provider:'openai',enabled:true});
 assert.doesNotMatch(response.body,/synthetic|HASH_SECRET|SUPABASE|API_KEY/);
 globalThis.fetch=async()=>Response.json({}, {status:403});
 const failed=await handler({httpMethod:'GET'});assert.equal(failed.statusCode,503);assert.deepEqual(JSON.parse(failed.body),{error:'coach_unavailable'});
});
