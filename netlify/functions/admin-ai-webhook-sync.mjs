import { timingSafeEqual } from "node:crypto";
const events=["checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.async_payment_failed","checkout.session.expired","customer.subscription.created","customer.subscription.updated","customer.subscription.deleted","invoice.paid","invoice.payment_failed"];
const json=(statusCode,body)=>({statusCode,headers:{"content-type":"application/json","cache-control":"no-store"},body:JSON.stringify(body)});
function authorized(event){
 const expected=String(process.env.STATECOURSE_AI_WEBHOOK_PROVISION_KEY||"");
 const actual=String(event.headers?.["x-statecourse-provision-key"]||"");
 const a=Buffer.from(actual),b=Buffer.from(expected);
 return expected&&actual&&a.length===b.length&&timingSafeEqual(a,b);
}
async function stripe(path,{method="GET",params}={}){
 const key=String(process.env.STRIPE_SECRET_KEY_LIVE||"");
 if(!key)throw new Error("stripe_live_key_unavailable");
 const headers={authorization:`Bearer ${key}`};let body;
 if(params){body=new URLSearchParams();for(const [k,v] of Object.entries(params))if(Array.isArray(v))for(const item of v)body.append(k,String(item));else body.append(k,String(v));headers["content-type"]="application/x-www-form-urlencoded";}
 const response=await fetch(`https://api.stripe.com/v1${path}`,{method,headers,body});
 const data=await response.json();if(!response.ok)throw new Error(data?.error?.message||"stripe_request_failed");return data;
}
export const handler=async(event)=>{
 try{
  if(event.httpMethod!=="POST")return json(405,{error:"method_not_allowed"});
  if(String(event.headers?.host||"").toLowerCase()!=="statecourse.com"||!authorized(event))return json(403,{error:"forbidden"});
  const url="https://statecourse.com/api/stripe/ai-webhook";
  const listed=await stripe("/webhook_endpoints?limit=100");
  let endpoint=listed.data.find(x=>x.url===url);
  if(endpoint){
   endpoint=await stripe(`/webhook_endpoints/${encodeURIComponent(endpoint.id)}`,{method:"POST",params:{"enabled_events[]":events,description:"StateCourse AI live subscriptions"}});
   return json(200,{created:false,endpoint_id:endpoint.id,url:endpoint.url,livemode:endpoint.livemode});
  }
  endpoint=await stripe("/webhook_endpoints",{method:"POST",params:{url,"enabled_events[]":events,description:"StateCourse AI live subscriptions"}});
  return json(200,{created:true,endpoint_id:endpoint.id,url:endpoint.url,livemode:endpoint.livemode,secret:endpoint.secret});
 }catch(error){return json(500,{error:"webhook_provision_failed",category:error.message});}
};