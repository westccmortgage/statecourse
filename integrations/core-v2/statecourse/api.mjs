import { authenticate } from './auth.mjs';
import { IntegrationError, requestInput, UUID, VERSION } from './contract.mjs';
import { explainSnapshot } from './engine.mjs';

// Explicit server-side assembly seam. This is not installed in Netlify or Supabase.
// auth verifier and SQL reader are host-owned capabilities, never request parameters.
export function createReadOnlyApi({ reader, verifyAccessToken, organizationId, createExecutors, routing, allowedOrigin, enabled=false }) {
 if(!UUID.test(organizationId??'') || !allowedOrigin || new URL(allowedOrigin).origin!==allowedOrigin) throw new Error('fixed_host_configuration_required');
 let busy=false; // Single-flight per process. The host must also rate-limit across replicas.
 return async request=>{
  const headers={'content-type':'application/json','cache-control':'no-store, private','x-content-type-options':'nosniff'};
  const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
  if(!enabled) return reply(503,{error:'integration_disabled'});
  const url=new URL(request.url);
  if(url.pathname!=='/v1/statecourse/observations') return reply(404,{error:'not_found'});
  if(request.method!=='POST') return reply(405,{error:'method_not_allowed'});
  // This is an internal server bridge, not a browser CORS API. Preserve exact origin.
  if(request.headers.get('origin')!==allowedOrigin) return reply(403,{error:'origin_denied'});
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(415,{error:'json_required'});
  if(busy) return reply(429,{error:'analysis_in_progress'});
  busy=true;
  try {
   const identity=await authenticate(request.headers,verifyAccessToken);
   const contentLength=request.headers.get('content-length');
   if(contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength)>1024)) throw new IntegrationError('request_too_large',413);
   const stream=request.body?.getReader();
   let text='',size=0;
   if(stream) { const decoder=new TextDecoder(); try { while(true) { const next=await stream.read(); if(next.done) break; size+=next.value.byteLength;
     if(size>1024) { await stream.cancel(); throw new IntegrationError('request_too_large',413); } text+=decoder.decode(next.value,{stream:true}); } text+=decoder.decode(); } finally { stream.releaseLock(); } }
   let body; try { body=JSON.parse(text); } catch { throw new IntegrationError('invalid_json'); }
   const scope=requestInput(body);
   const snapshot=await reader.read(identity,scope);
   const result=await explainSnapshot(snapshot,{organizationId,createExecutors,routing});
   // Long analysis cannot deliver records after a session/role was revoked meanwhile.
   await reader.reauthorize(identity);
   return reply(200,{contractVersion:VERSION,scope,...result});
  } catch(error) {
   return reply(error instanceof IntegrationError?error.status:503,{error:error instanceof IntegrationError?error.code:'analysis_unavailable'});
  } finally { busy=false; }
 };
}
