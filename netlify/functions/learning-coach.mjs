import {coach} from './_lib/learning-coach.mjs';
async function store(op,payload){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw Error('store_unavailable');
 const r=await fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/learning_coach_control`,{method:'POST',signal:AbortSignal.timeout(4000),headers:{apikey:key,...(key.startsWith('sb_')?{}:{authorization:`Bearer ${key}`}), 'content-type':'application/json'},body:JSON.stringify({op,payload})});
 if(!r.ok)throw Error('store_unavailable');return r.json();
}
export async function handler(event){
 const headers={'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'};
 if(event.httpMethod!=='POST')return {statusCode:405,headers:{...headers,allow:'POST'},body:JSON.stringify({error:'method_not_allowed'})};
 try{
  if(event.isBase64Encoded||Buffer.byteLength(event.body??'')>6000||!event.headers?.['content-type']?.startsWith('application/json'))return {statusCode:400,headers,body:JSON.stringify({error:'invalid_request'})};
  const body=JSON.parse(event.body);
  const result=await coach(body,{env:process.env,ip:event.headers['x-nf-client-connection-ip'],origin:event.headers.origin,store});
  return {statusCode:200,headers,body:JSON.stringify(result)};
 }catch(e){return {statusCode:e instanceof SyntaxError?400:(e.status??503),headers,body:JSON.stringify({error:e.status?e.message:'coach_unavailable'})};}
}
