import {createHash,createHmac} from 'node:crypto';
import contexts from '../../../config/learning-coach/context.json' with {type:'json'};
import {requestCoach} from './learning-coach-provider.mjs';
import {requestGemini} from './learning-coach-gemini.mjs';
import library from '../../../config/learning-coach/library.json' with {type:'json'};
import {selectChunks} from '../../../scripts/lib/learning-coach-chunks.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const fail=(code,status=400)=>{throw Object.assign(Error(code),{status});};
const keys=['requestId','courseId','state','lessonId','version','digest','conceptId','questionId','selected','message','consent','consentProvider'];
export function resolveContext(body,{allowPrivate=false}={}){
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!keys.includes(k)))fail('invalid_request');
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId??'')||body.consent!==true||typeof body.message!=='string'||!body.message.trim()||body.message.length>1000)fail('invalid_request');
 let c=contexts.contexts.find(c=>c.id===body.conceptId);
 if(!c){
  const lesson=library.lessons.find(l=>l.id===body.conceptId&&(l.access==='public_practice'||allowPrivate));
  if(lesson)c={...lesson,questions:[],sources:selectChunks(lesson.chunks,body.message).map(chunk=>({id:chunk.id,label:lesson.title+' — '+chunk.heading,excerpt:chunk.excerpt,url:lesson.access==='public_practice'?`/free-practice/?state=${lesson.state}&course=${lesson.courseId}&lesson=${lesson.lessonId}&mode=read`:'/student/nmls-training/'}))};
 }
 if(!c||['courseId','state','lessonId','version','digest'].some(k=>body[k]!==c[k]))fail('unsupported_or_changed_context',409);
 const question=body.questionId==null?null:c.questions.find(q=>q.id===body.questionId);
 if(body.questionId!=null&&!question)fail('unsupported_practice_question');
 if(question&&(!Number.isInteger(body.selected)||body.selected<0||body.selected>=question.choices.length))fail('invalid_answer');
 if(!question&&body.selected!=null)fail('invalid_answer');
 return {context:c,question};
}
export function validateAnswer(answer,c){
 if(!answer||Object.keys(answer).sort().join(',')!=='explanation,nextStep,sourceIds,status'||!['answer','insufficient_sources'].includes(answer.status))fail('invalid_provider_response',502);
 if(typeof answer.explanation!=='string'||!answer.explanation.trim()||answer.explanation.length>2400||typeof answer.nextStep!=='string'||answer.nextStep.length>500||/https?:\/\/|www\.|<\/?[a-z]/i.test(answer.explanation+' '+answer.nextStep))fail('invalid_provider_response',502);
 if(!Array.isArray(answer.sourceIds)||answer.sourceIds.length>c.sources.length||answer.sourceIds.some(id=>!c.sources.some(s=>s.id===id))||(answer.status==='answer'&&!answer.sourceIds.length))fail('invalid_provider_sources',502);
 return answer;
}
export const providerName=env=>env.LEARNING_COACH_PROVIDER||'openai';
const providerKey=env=>providerName(env)==='gemini'?env.GEMINI_API_KEY:(env.LEARNING_COACH_API_KEY||env.OPENAI_API_KEY);
export function settings(env){
 if(!['openai','gemini'].includes(providerName(env)))fail('coach_unavailable',503);
 if(env.LEARNING_COACH_ENABLED!=='true')fail('coach_unavailable',503);
 for(const key of ['LEARNING_COACH_MODEL','LEARNING_COACH_ORIGIN','LEARNING_COACH_HASH_SECRET'])if(!env[key])fail('coach_unavailable',503);
 if(!providerKey(env))fail('coach_unavailable',503);
 if(env.LEARNING_COACH_HASH_SECRET.length<32)fail('coach_unavailable',503);
 const inputRate=Number(env.LEARNING_COACH_INPUT_USD_PER_MILLION),outputRate=Number(env.LEARNING_COACH_OUTPUT_USD_PER_MILLION),budget=Number(env.LEARNING_COACH_DAILY_BUDGET_USD);
 if(![inputRate,outputRate,budget].every(x=>Number.isFinite(x)&&x>0)||budget>10)fail('coach_unavailable',503);
 return {reserveMicros:Math.ceil(16000*inputRate+800*outputRate),budgetMicros:Math.floor(budget*1e6)};
}
export async function coach(body,{env,ip,origin,store,provider,allowPrivate=false}){
 const {context:c,question}=resolveContext(body,{allowPrivate}),limits=settings(env);
 if(providerName(env)==='gemini'&&body.consentProvider!=='gemini'||body.consentProvider&&body.consentProvider!==providerName(env))fail('provider_consent_changed',409);
 provider??=providerName(env)==='gemini'?requestGemini:requestCoach;
 if(origin!==env.LEARNING_COACH_ORIGIN||!ip)fail('request_not_allowed',403);
 const identity=createHmac('sha256',env.LEARNING_COACH_HASH_SECRET).update(ip).digest('hex');
 const payloadHash=hash(JSON.stringify({provider:providerName(env),model:env.LEARNING_COACH_MODEL,context:c.digest,question:question?.id??null,selected:body.selected??null,message:body.message}));
 const reservation=await store('reserve',{requestId:body.requestId,identity,payloadHash,...limits});
 if(reservation.status==='cached')return reservation.response;
 if(reservation.status!=='reserved')fail(reservation.status==='conflict'?'request_id_conflict':'coach_busy_or_limit_reached',reservation.status==='conflict'?409:429);
 try{
  const input={context:{state:c.state,discipline:c.discipline??'real_estate',course:c.courseId,lesson:c.lessonId,version:c.version,digest:c.digest,concept:c.title},sources:c.sources.map(({id,excerpt})=>({id,excerpt})),learnerMessage:body.message,
   practice:question?{prompt:question.prompt,selected:question.choices[body.selected],correct:body.selected===question.solution,correctAnswer:question.choices[question.solution],explanation:question.explanation}:null,
   ...(c.id==='ltv'?{workedExample:{propertyValue:400000,loan:320000,ltvPercent:320000/400000*100,downPaymentPercent:(400000-320000)/400000*100,note:'Arithmetic computed by code; value assumes purchase price and appraisal are both $400,000.'}}:{})};
  if(Buffer.byteLength(JSON.stringify(input))>14000)fail('context_too_large');
  const {answer,usage}=await provider({apiKey:providerKey(env),model:env.LEARNING_COACH_MODEL,input});
  validateAnswer(answer,c);
  const next=c.questions.find(q=>q.id!==question?.id);
  const result={requestId:body.requestId,version:c.version,digest:c.digest,status:answer.status,explanation:answer.explanation,nextStep:answer.nextStep,
   sources:answer.sourceIds.map(id=>{const s=c.sources.find(s=>s.id===id);return {id,label:s.label,url:s.url,excerpt:s.excerpt};}),
   nextQuestionId:answer.status==='answer'?(next?.id??null):null,
   practiceNote:next?'Existing formative practice; graded by code.':'No other reviewed question for this concept. Revisit the cited lesson or ask an instructor.',
   provider:providerName(env),model:env.LEARNING_COACH_MODEL,usage};
  await store('complete',{requestId:body.requestId,identity,payloadHash,response:result});
  return result;
 }catch(error){
  // Never release the reservation: provider timeouts can still be billable.
  await store('failed',{requestId:body.requestId,identity,payloadHash}).catch(()=>{});
  if(error.status)throw error;
  fail('coach_unavailable',503);
 }
}
