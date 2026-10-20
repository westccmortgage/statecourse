import {authenticate} from './auth.mjs';
import {IntegrationError,UUID} from './contract.mjs';
import {explainSnapshot} from './engine.mjs';
import {readJson} from './request.mjs';

// Netlify retries may redeliver this request. Only the atomic captured->running
// transition grants execution. Running/interrupted/complete rows never replay.
export function createBackgroundApi({reader,verifyAccessToken,organizationId,store,createRuntime,createExecutors,routing,allowedOrigin,enabled=false}) {
 if(!UUID.test(organizationId??'') || !store || !allowedOrigin || new URL(allowedOrigin).origin!==allowedOrigin)throw Error('fixed_background_configuration_required');
 const reply=(status,body)=>Response.json(body,{status,headers:{'cache-control':'no-store, private','x-content-type-options':'nosniff'}});
 return async request=>{
  if(!enabled)return reply(503,{error:'integration_disabled'});
  if(request.method!=='POST')return reply(405,{error:'method_not_allowed'});
  const url=new URL(request.url);
  if(url.pathname!=='/api/admin/core/background' || url.search)return reply(404,{error:'not_found'});
  if(request.headers.get('origin')!==allowedOrigin)return reply(403,{error:'origin_denied'});
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return reply(415,{error:'json_required'});
  let context,claimed=false,readingReserved=false;
  try {
   const identity=await authenticate(request.headers,verifyAccessToken);
   const body=await readJson(request);
   if(!body || Object.getPrototypeOf(body)!==Object.prototype || Object.keys(body).length!==1 || !UUID.test(body.runId??''))throw new IntegrationError('invalid_background_scope');
   await reader.reauthorize(identity);
   context={organizationId,actorId:identity.userId,runId:body.runId.toLowerCase()};
   const pending=await store.get(context);
   if(pending.run.status==='reserved'){
    readingReserved=true;
    const captured=await reader.read(identity,{courseId:pending.run.course_id,enrollmentId:pending.run.enrollment_id});
    await store.capture(context,captured);
   }
   const snapshot=await store.getCaptured(context);
   await store.start(context);claimed=true;
   await reader.reauthorize(identity);
   const result=await explainSnapshot(snapshot,{organizationId,workflowId:context.runId,createRuntime,createExecutors,routing});
   await store.complete(context,result);
   await reader.reauthorize(identity);
   return reply(200,{runId:context.runId,status:'completed'});
  } catch(error) {
   if(claimed){try{await store.interrupt(context);}catch{/* unknown outcome remains non-replayable */}}
   else if(readingReserved){try{await store.transition(context,'reserved','interrupted');}catch{/* never interrupt a worker that already captured/claimed */}}
   // Return normally even on rejection; platform retries are not a recovery policy.
   return reply(error instanceof IntegrationError?error.status:503,{error:error instanceof IntegrationError?error.code:'analysis_unavailable'});
  }
 };
}
