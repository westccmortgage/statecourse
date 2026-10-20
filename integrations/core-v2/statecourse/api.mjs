import { authenticate } from './auth.mjs';
import { IntegrationError, requestInput, UUID, VERSION } from './contract.mjs';
import { explainSnapshot } from './engine.mjs';

const BASE='/v1/statecourse/observations';
function storedBody(saved) {
 const {run,result,resultHash,events}=saved;
 if(!result) return {contractVersion:VERSION,runId:run.id,status:run.status,events};
 return {contractVersion:VERSION,scope:{courseId:run.course_id,enrollmentId:run.enrollment_id},...result,
  persistence:{runId:run.id,resultHash,createdAt:run.created_at},events};
}
// Source connections are read-only. Optional store/runtime connections are isolated Core writers.
export function createReadOnlyApi({ reader, verifyAccessToken, organizationId, createExecutors, createRuntime, store, routing, allowedOrigin, enabled=false }) {
 if(!UUID.test(organizationId??'') || !allowedOrigin || new URL(allowedOrigin).origin!==allowedOrigin) throw new Error('fixed_host_configuration_required');
 if(createRuntime && !store) throw new Error('provider_runtime_requires_durable_results');
 let busy=false;
 return async request=>{
  const headers={'content-type':'application/json','cache-control':'no-store, private','x-content-type-options':'nosniff'};
  const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
  if(!enabled) return reply(503,{error:'integration_disabled'});
  const url=new URL(request.url),suffix=url.pathname.startsWith(BASE+'/')?url.pathname.slice(BASE.length+1):null;
  const isStored=suffix!==null && UUID.test(suffix);
  if(url.pathname!==BASE && !isStored) return reply(404,{error:'not_found'});
  if((isStored && request.method!=='GET') || (!isStored && request.method!=='POST')) return reply(405,{error:'method_not_allowed'});
  if(request.headers.get('origin')!==allowedOrigin) return reply(403,{error:'origin_denied'});
  if(!isStored && !request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(415,{error:'json_required'});
  if(!isStored && busy) return reply(429,{error:'analysis_in_progress'});
  if(!isStored) busy=true;
  let context=null;
  try {
   const identity=await authenticate(request.headers,verifyAccessToken);
   if(isStored) {
    if(!store) throw new IntegrationError('result_not_found',404);
    await reader.reauthorize(identity);
    const saved=await store.get({organizationId,actorId:identity.userId,runId:suffix.toLowerCase()});
    await reader.reauthorize(identity);
    return reply(saved.result?200:202,storedBody(saved));
   }
   const contentLength=request.headers.get('content-length');
   if(contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength)>1024)) throw new IntegrationError('request_too_large',413);
   const stream=request.body?.getReader();let text='',size=0;
   if(stream) {const decoder=new TextDecoder();try{while(true){const next=await stream.read();if(next.done)break;size+=next.value.byteLength;
    if(size>1024){await stream.cancel();throw new IntegrationError('request_too_large',413);}text+=decoder.decode(next.value,{stream:true});}text+=decoder.decode();}finally{stream.releaseLock();}}
   let body;try{body=JSON.parse(text);}catch{throw new IntegrationError('invalid_json');}
   const scope=requestInput(body);
   if(store) {
    // No Core write or cache read occurs until CURRENT StateCourse authority is checked.
    await reader.reauthorize(identity);
    const reserved=await store.reserve({organizationId,actorId:identity.userId,idempotencyKey:request.headers.get('idempotency-key'),scope});
    if(!reserved.created) {
     const saved=await store.get({organizationId,actorId:identity.userId,runId:reserved.run.id});
     await reader.reauthorize(identity);
     if(saved.result) return reply(200,storedBody(saved));
     return reply(409,{error:'run_already_reserved_no_automatic_replay',runId:saved.run.id,status:saved.run.status});
    }
    context={organizationId,actorId:identity.userId,runId:reserved.run.id};
   }
   const snapshot=await reader.read(identity,scope);
   if(store){await store.capture(context,snapshot);await store.start(context);}
   const result=await explainSnapshot(snapshot,{organizationId,createExecutors,createRuntime,routing,workflowId:context?.runId});
   if(store) await store.complete(context,result);
   if(store) {const saved=await store.get(context);await reader.reauthorize(identity);return reply(200,storedBody(saved));}
   await reader.reauthorize(identity);
   return reply(200,{contractVersion:VERSION,scope,...result});
  } catch(error) {
   // A crash/unknown response is held for review. Never automatically repeat a paid run.
   if(store && context) {try{await store.interrupt(context);}catch{/* an unavailable store leaves a non-replayable running record */}}
   return reply(error instanceof IntegrationError?error.status:503,{error:error instanceof IntegrationError?error.code:'analysis_unavailable'});
  } finally {if(!isStored)busy=false;}
 };
}
