import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import handler,{config} from '../netlify/functions/student-nmls-coach.mts';
import {executeNmlsTraining} from '../netlify/functions/_lib/nmls-training-service.mjs';
import {getNmlsReviewCourse} from '../netlify/functions/_lib/nmls-review-content.mjs';
import {getNmlsDraftFinalDefinition} from '../lib/nmls-final-authoring-content.mjs';
import {NMLS_TRAINING_COURSE as identity} from '../config/nmls-course-identity.mjs';

test('private mortgage coach uses authenticated current source, durable admission and late access checks',async t=>{
 const origin='https://coach.test',actor=randomUUID(),enrollmentId=randomUUID(),course=getNmlsReviewCourse(identity.contentKey),definition=getNmlsDraftFinalDefinition(course.id);
 const env={STATECOURSE_BASE_URL:origin,SUPABASE_URL:'https://coach-db.invalid',SUPABASE_ANON_KEY:'synthetic-anon',SUPABASE_SERVICE_ROLE_KEY:'synthetic-service',LEARNING_COACH_ENABLED:'true',LEARNING_COACH_PROVIDER:'openai',OPENAI_API_KEY:'synthetic-model-key',LEARNING_COACH_API_KEY:'synthetic-model-key',LEARNING_COACH_MODEL:'synthetic-model',LEARNING_COACH_ORIGIN:origin,LEARNING_COACH_HASH_SECRET:'s'.repeat(32),LEARNING_COACH_INPUT_USD_PER_MILLION:'1',LEARNING_COACH_OUTPUT_USD_PER_MILLION:'4',LEARNING_COACH_DAILY_BUDGET_USD:'1'};
 const before=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]])),previousFetch=globalThis.fetch;Object.assign(process.env,env);
 t.after(()=>{globalThis.fetch=previousFetch;for(const [k,v]of Object.entries(before)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
 const snapshot={enrollmentId,studentId:actor,courseId:identity.id,courseVersion:identity.version,reviewRole:null,contentDigest:course.digest,definitionDigest:definition.digest,revision:0,runtime:null,serverTimeMs:Date.UTC(2026,8,13),event:null};
 const setupRpc=async(name,p)=>{
  if(name==='nmls_training_commit'){snapshot.runtime=structuredClone(p.p_runtime);snapshot.revision++;return {...structuredClone(snapshot),event:{command_digest:p.p_command_digest,audit:p.p_audit},replayed:false};}
  return structuredClone(snapshot);
 };
 const teach=async action=>executeNmlsTraining({operation:'teaching',command:{enrollmentId,eventId:randomUUID(),expectedRevision:snapshot.revision,action}},actor,{rpc:setupRpc});
 await teach({kind:'resume',sessionId:null});
 const sessionId=snapshot.runtime.source.sessionId,unitId=course.modules[0].units[0].id;
 snapshot.serverTimeMs++;await teach({kind:'open_unit',sessionId,unitId});
 const originalState=JSON.stringify(snapshot.runtime),originalRevision=snapshot.revision;
 let calls=[],denied=false,afterModel=null,modelCalls=0;const cache=new Map();
 const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
 globalThis.fetch=async(url,options={})=>{
  const target=new URL(url);calls.push(target.pathname);
  if(target.origin==='https://api.openai.com'){
   modelCalls++;const payload=JSON.parse(options.body),input=JSON.parse(payload.input);
   assert.equal(payload.store,false);assert.equal(options.headers.authorization,'Bearer synthetic-model-key');
   assert.equal(input.context.course,identity.id);assert.equal(input.context.lesson,unitId);assert.equal(input.practice,null);
   assert.ok(input.sources.length<=5);assert.doesNotMatch(payload.input,/correctChoice|N26-FIN-|"answers"|studentId|training@example|synthetic-service/);
   afterModel?.();
   return json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({status:'answer',explanation:'Synthetic explanation grounded in this lesson.',nextStep:'Review the source.',sourceIds:[input.sources[0].id]})}]}],usage:{input_tokens:100,output_tokens:40}});
  }
  assert.equal(target.origin,'https://coach-db.invalid');
  if(target.pathname==='/auth/v1/user')return options.headers.authorization==='Bearer rejected'?json({},401):json({id:actor,email:'training@example.test',user_metadata:{}});
  if(target.pathname==='/rest/v1/students')return new Response(null,{status:204});
  if(target.pathname==='/rest/v1/rpc/nmls_training_context'){
   const p=JSON.parse(options.body);assert.equal(p.p_student_id,actor);assert.equal(p.p_enrollment_id,enrollmentId);
   return denied?json({message:'nmls_training_access_denied'},403):json(snapshot);
  }
  if(target.pathname==='/rest/v1/rpc/learning_coach_control'){
   const {op,payload:p}=JSON.parse(options.body);assert.match(p.identity,/^[a-f0-9]{64}$/);assert.notEqual(p.identity,actor);
   if(op==='reserve')return json(cache.has(p.requestId)?{status:'cached',response:cache.get(p.requestId)}:{status:'reserved'});
   if(op==='complete')cache.set(p.requestId,p.response);
   return json({status:'ok'});
  }
  throw Error(`Unexpected request ${target.pathname}`);
 };
 const input=()=>({requestId:randomUUID(),enrollmentId,unitId,sessionId,message:'Explain the main lesson concept.',consent:true,consentProvider:'openai'});
 const request=(value=input(),headers={})=>new Request(origin+'/api/student/nmls/coach',{method:'POST',headers:{origin,'content-type':'application/json',authorization:'Bearer fixture',...headers},body:JSON.stringify(value)});
 await t.test('actual auth, HTTP provider adapter and replay produce no progress or timing write',async()=>{
  assert.equal(config.path,'/api/student/nmls/coach');const value=input();
  const response=await handler(request(value)),answer=await response.json();assert.equal(response.status,200);assert.equal(answer.provider,'openai');assert.ok(answer.sources[0].excerpt);
  assert.equal(response.headers.get('cache-control'),'no-store, private');assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
  assert.equal(calls.filter(p=>p.endsWith('nmls_training_context')).length,2);assert.ok(!calls.some(p=>/commit|charge|certificate/.test(p)));
  assert.equal((await handler(request(value))).status,200);assert.equal(modelCalls,1);assert.equal(JSON.stringify(snapshot.runtime),originalState);assert.equal(snapshot.revision,originalRevision);
 });
 await t.test('hostile origin, malformed UTF8/type, oversize stream, forged context and missing auth spend nothing',async()=>{
  const modelBefore=modelCalls;
  for(const [req,status]of [[new Request(origin+'/api/student/nmls/coach'),405],[request(input(),{origin:'https://evil.test'}),403],[request(input(),{'content-type':'application/json; charset=utf-16'}),415],[request({...input(),lessonContent:'forged'}),400],[request(input(),{authorization:'Bearer rejected'}),401],[request({...input(),sessionId:randomUUID()}),403],[request({...input(),unitId:'future-unit'}),403],[request({...input(),consentProvider:'gemini'}),409]])assert.equal((await handler(req)).status,status);
  assert.equal((await handler(new Request(origin+'/api/student/nmls/coach',{method:'POST',headers:{origin,'content-type':'application/json'},body:new Uint8Array([0x22,0xc3,0x28,0x22])}))).status,400);
  let canceled=false;const stream=new ReadableStream({pull(c){c.enqueue(new Uint8Array(4000));},cancel(){canceled=true;}});
  assert.equal((await handler(new Request(origin+'/api/student/nmls/coach',{method:'POST',headers:{origin,'content-type':'application/json','content-length':'1'},body:stream,duplex:'half'}))).status,413);assert.equal(canceled,true);assert.equal(modelCalls,modelBefore);
 });
 await t.test('revocation during generation and on a cached retry suppresses all lesson excerpts',async()=>{
  const value=input();afterModel=()=>{denied=true;};
  try{const response=await handler(request(value));assert.equal(response.status,403);assert.deepEqual(await response.json(),{error:'coach_unavailable'});const count=modelCalls;assert.equal((await handler(request(value))).status,403);assert.equal(modelCalls,count);}
  finally{afterModel=null;denied=false;}
 });
 await t.test('regulator read-only role cannot use the student coach',async()=>{
  snapshot.reviewRole='regulator_reviewer';const count=modelCalls;
  try{assert.equal((await handler(request())).status,403);assert.equal(modelCalls,count);}finally{snapshot.reviewRole=null;}
 });
});
