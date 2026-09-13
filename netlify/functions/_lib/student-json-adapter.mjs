import { requireSameOrigin } from './http.mjs';

// Bounded Web Request adapter for existing student-session domain handlers.
// It preserves refreshed HttpOnly cookies and the established authorization logic.
export async function studentJsonRequest(request, methods, handle) {
  const headers=new Headers({'content-type':'application/json; charset=utf-8','cache-control':'no-store, private','x-content-type-options':'nosniff'});
  const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
  if(!methods.includes(request.method)){headers.set('allow',methods.join(', '));return reply(405,{error:'method_not_allowed'});}
  const event={httpMethod:request.method,headers:Object.fromEntries(request.headers),queryStringParameters:Object.fromEntries(new URL(request.url).searchParams)};
  if(['POST','PATCH'].includes(request.method)) {
    try { requireSameOrigin(event); }
    catch(error) { const status=Number(error?.statusCode)||500;return reply(status,{error:status>=500?'student_service_unavailable':error.message}); }
    if(!/^application\/json(?:\s*;\s*charset="?utf-8"?)?\s*$/i.test(request.headers.get('content-type')||''))return reply(415,{error:'json_required'});
    if(Number(request.headers.get('content-length'))>16_384)return reply(413,{error:'request_too_large'});
    const reader=request.body?.getReader(),chunks=[];let size=0;
    try {
      if(reader)while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
        if(size>16_384){await reader.cancel().catch(()=>{});return reply(413,{error:'request_too_large'});}chunks.push(value);}
      event.body=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks));
      const input=JSON.parse(event.body);
      if(input===null||typeof input!=='object'||Array.isArray(input))return reply(400,{error:'invalid_request'});
    } catch { return reply(400,{error:'invalid_json'}); }
    finally {reader?.releaseLock();}
  }
  const result=await handle(event);
  for(const [key,value] of Object.entries(result.headers||{}))headers.set(key,value);
  headers.set('cache-control','no-store, private');
  for(const cookie of result.multiValueHeaders?.['set-cookie']||[])headers.append('set-cookie',cookie);
  return new Response(result.body,{status:result.statusCode,headers});
}
