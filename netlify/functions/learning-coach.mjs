import {withLambda} from '@netlify/aws-lambda-compat';
import {coach,providerName} from './_lib/learning-coach.mjs';
import {loadCoachEnvironment} from './_lib/learning-coach-settings.mjs';
export async function store(op,payload){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw Error('store_unavailable');
 const r=await fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/learning_coach_control`,{method:'POST',signal:AbortSignal.timeout(4000),headers:{apikey:key,...(key.startsWith('sb_')?{}:{authorization:`Bearer ${key}`}), 'content-type':'application/json'},body:JSON.stringify({op,payload})});
 if(!r.ok)throw Error('store_unavailable');return r.json();
}
async function handler(event){
 const headers={'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'};
 if(!['GET','POST'].includes(event.httpMethod))return {statusCode:405,headers:{...headers,allow:'GET, POST'},body:JSON.stringify({error:'method_not_allowed'})};
 try{
  if(event.httpMethod==='GET'){
   const env=await loadCoachEnvironment({env:process.env,store});
   return {statusCode:200,headers,body:JSON.stringify({provider:['openai','gemini'].includes(providerName(env))?providerName(env):null,enabled:env.LEARNING_COACH_ENABLED==='true'})};
  }
  if(event.isBase64Encoded||Buffer.byteLength(event.body??'')>6000||!event.headers?.['content-type']?.startsWith('application/json'))return {statusCode:400,headers,body:JSON.stringify({error:'invalid_request'})};
  const body=JSON.parse(event.body);
  const env=await loadCoachEnvironment({env:process.env,store});
  const result=await coach(body,{env,ip:event.headers['x-nf-client-connection-ip'],origin:event.headers.origin,store});
  return {statusCode:200,headers,body:JSON.stringify(result)};
 }catch(e){if(/^(?:provider_(?:http_[0-9]{3}|incomplete|timeout|format|other)|invalid_provider_evidence_(?:shape|quote|text|citations))$/.test(e.coachFailureReason??''))headers['x-statecourse-coach-diagnostic']=e.coachFailureReason;return {statusCode:e instanceof SyntaxError?400:(e.status??503),headers,body:JSON.stringify({error:e.status?e.message:'coach_unavailable'})};}
}

// Keep the existing Lambda handler contract on the modern Netlify runtime.
export {handler as legacyHandler};
export default withLambda(handler);
