import {createServer} from 'node:http';
import {Readable} from 'node:stream';

// Bind loopback only. A separately approved same-origin proxy must forward the
// original Cookie and Origin and must not cache responses or retry POST.
export function createHttpServer({handle,allowedOrigin}) {
 const server=createServer(async(incoming,outgoing)=>{
  try {
   if(!incoming.url?.startsWith('/') || incoming.url.startsWith('//'))throw new Error();
   const request=new Request(new URL(incoming.url,allowedOrigin),{method:incoming.method,headers:incoming.headers,
    ...(!['GET','HEAD'].includes(incoming.method)?{body:Readable.toWeb(incoming),duplex:'half'}:{})});
   const response=await handle(request);
   outgoing.writeHead(response.status,Object.fromEntries(response.headers));
   // Bound responses are buffered by the API; no cookies/credentials are added here.
   outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch {
   outgoing.writeHead(503,{'content-type':'application/json','cache-control':'no-store'});
   outgoing.end('{"error":"analysis_unavailable"}');
  }
 });
 server.headersTimeout=10000;server.requestTimeout=15000;server.timeout=180000;
 return server;
}
