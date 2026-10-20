import {requireStudentSession,sessionCookies} from './_lib/student-session.mjs';
import {requireSameOrigin} from './_lib/http.mjs';
import {rpc} from './_lib/db.mjs';
import {authorizeNmlsCoach,nmlsTrainingPublicError} from './_lib/nmls-training-service.mjs';
import {coach,providerName} from './_lib/learning-coach.mjs';
import {store} from './learning-coach.mjs';
import library from '../../config/learning-coach/library.json' with {type:'json'};
export const config={path:'/api/student/nmls/coach'};
export default async function handler(request:Request):Promise<Response>{
 const headers=new Headers({'content-type':'application/json; charset=utf-8','cache-control':'no-store, private','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow'});
 const reply=(status:number,value:unknown)=>new Response(JSON.stringify(value),{status,headers});
 if(request.method!=='POST')return reply(405,{error:'method_not_allowed'});
 try{
  const event={headers:Object.fromEntries(request.headers)};requireSameOrigin(event);
  if(!/^application\/json(?:\s*;\s*charset="?utf-8"?)?\s*$/i.test(request.headers.get('content-type')||''))return reply(415,{error:'json_required'});
  const reader=request.body?.getReader();let length=0;const chunks:Uint8Array[]=[];
  if(reader)try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>6000){await reader.cancel();return reply(413,{error:'request_too_large'});}chunks.push(value);}}finally{reader.releaseLock();}
  let input;try{input=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));}catch{return reply(400,{error:'invalid_json'});}
  const allowed=['requestId','enrollmentId','unitId','sessionId','message','consent','consentProvider'];
  if(!input||Array.isArray(input)||Object.keys(input).some(k=>!allowed.includes(k)))return reply(400,{error:'invalid_request'});
  const auth=await requireStudentSession(event);if(auth.refreshedSession)for(const cookie of sessionCookies(auth.refreshedSession))headers.append('set-cookie',cookie);
  const access=await authorizeNmlsCoach(input,auth.student.id,{rpc});
  const lesson=library.lessons.find(l=>l.access==='authenticated_training'&&l.courseId===access.courseId&&l.lessonId===access.unitId&&l.version===access.courseVersion&&l.courseDigest===access.courseDigest);
  if(!lesson)return reply(409,{error:'course_context_changed'});
  const body={requestId:input.requestId,courseId:lesson.courseId,state:lesson.state,lessonId:lesson.lessonId,version:lesson.version,digest:lesson.digest,conceptId:lesson.id,questionId:null,selected:null,message:input.message,consent:input.consent,consentProvider:input.consentProvider};
  const name=providerName(process.env);
  if(input.consentProvider!==name)return reply(409,{error:'provider_consent_changed'});
  const result=await coach(body,{env:process.env,origin:request.headers.get('origin'),ip:`student:${auth.student.id}:${input.enrollmentId}`,store,allowPrivate:true});
  // A revoked enrollment, changed unit, quiz or stolen lease cannot expose a late answer.
  await authorizeNmlsCoach(input,auth.student.id,{rpc});
  return reply(200,result);
 }catch(error){const e=error as {status?:number,statusCode?:number};const mapped=nmlsTrainingPublicError(error).status;return reply(error instanceof SyntaxError?400:mapped!==503?mapped:e.status||e.statusCode||503,{error:'coach_unavailable'});}
}
