import {UUID} from '../statecourse/contract.mjs';
export const BRIDGE_PATH='/api/admin/core/observations';
const INTERNAL_PATH='/v1/statecourse/observations';
const response=(status,error)=>Response.json({error},{status,headers:{'cache-control':'no-store, private','x-content-type-options':'nosniff'}});
function credentials(value) {
 const values=new Map();
 for(const piece of (value||'').split(';')) {
  const index=piece.indexOf('=');if(index<0)continue;
  const name=piece.slice(0,index).trim();
  if(!['__Host-sc_access','__Host-sc_staff'].includes(name))continue;
  if(values.has(name))return null;
  values.set(name,piece.slice(index+1).trim());
 }
 const token=values.get('__Host-sc_access'),proof=values.get('__Host-sc_staff');
 if(!token || token.length>8192 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)
   || !/^[A-Za-z0-9_-]{43}$/.test(proof||''))return null;
 return {token,proof};
}
// Same-origin reverse-proxy target. Original HttpOnly cookies never enter browser JS.
// No refresh, mint, consume, audit or rate-limit RPC is executed on StateCourse.
export function createCookieBridge({handleCore,allowedOrigin,enabled=false}) {
 if(new URL(allowedOrigin).origin!==allowedOrigin || !allowedOrigin.startsWith('https://'))throw new Error('fixed_https_site_origin_required');
 return async request=>{
  if(!enabled)return response(503,'integration_disabled');
  const url=new URL(request.url),suffix=url.pathname.slice(BRIDGE_PATH.length);
  if(url.search || !(url.pathname===BRIDGE_PATH || (url.pathname.startsWith(BRIDGE_PATH+'/') && UUID.test(suffix.slice(1)))))return response(404,'not_found');
  if((suffix && request.method!=='GET') || (!suffix && request.method!=='POST'))return response(405,'method_not_allowed');
  // GET clients must send Origin explicitly too; cross-site cookies are never sufficient.
  if(request.headers.get('origin')!==allowedOrigin || ['cross-site','none'].includes(request.headers.get('sec-fetch-site')))return response(403,'origin_denied');
  const auth=credentials(request.headers.get('cookie'));
  if(!auth)return response(401,'authentication_required');
  const headers=new Headers({origin:allowedOrigin,authorization:'Bearer '+auth.token,'x-statecourse-staff-proof':auth.proof});
  for(const name of ['content-type','content-length','idempotency-key'])if(request.headers.has(name))headers.set(name,request.headers.get(name));
  try {
   return await handleCore(new Request(allowedOrigin+INTERNAL_PATH+suffix,{method:request.method,headers,
    ...(request.method==='POST'?{body:request.body,duplex:'half'}:{})}));
  } catch {return response(503,'analysis_unavailable');}
 };
}
