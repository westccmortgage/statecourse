import {withLambda} from '@netlify/aws-lambda-compat';
import { requireAdmin } from "./_lib/auth.mjs";
import { dbRequest } from "./_lib/db.mjs";
import { handleError, method, response } from "./_lib/http.mjs";

const price={ai_pro_monthly:3900,ai_pro_annual:39000,ai_provider_monthly:49900,ai_provider_annual:499000,ai_founding_provider_monthly:29900};
const monthly=(key)=>key.endsWith("_annual")?Math.round((price[key]||0)/12):(price[key]||0);

const handler=async(event)=>{
  try{
    method(event,"GET");await requireAdmin(event);
    const today=new Date();today.setUTCHours(0,0,0,0);
    const [subs,entitlements,payments,attempts,newUsers]=await Promise.all([
      dbRequest("ai_subscriptions?select=student_id,plan_key,status,current_period_end,cancel_at_period_end,stripe_customer_id,updated_at&order=updated_at.desc&limit=1000"),
      dbRequest("ai_entitlements?select=student_id,tier,active,status,effective_through,updated_at&limit=1000"),
      dbRequest("ai_payments?status=eq.paid&stripe_mode=eq.live&select=student_id,stripe_invoice_id,amount_paid,currency,paid_at&order=paid_at.desc&limit=1000"),
      dbRequest("ai_checkout_attempts?select=student_id,plan_key,status,source,created_at&order=created_at.desc&limit=1000"),
      dbRequest(`students?created_at=gte.${encodeURIComponent(today.toISOString())}&select=id&limit=1000`)
    ]);
    const ids=[...new Set([...(subs||[]).map(x=>x.student_id),...(attempts||[]).map(x=>x.student_id)])];
    const students=ids.length?await dbRequest(`students?id=in.(${ids.map(encodeURIComponent).join(",")})&select=id,email,first_name,last_name,created_at,last_sign_in_at&limit=1000`):[];
    const studentMap=new Map((students||[]).map(x=>[x.id,x]));
    const latestSub=new Map();
    for(const s of subs||[])if(!latestSub.has(s.student_id))latestSub.set(s.student_id,s);
    const revenueByStudent=new Map();
    for(const p of payments||[])revenueByStudent.set(p.student_id,(revenueByStudent.get(p.student_id)||0)+Number(p.amount_paid||0));
    const active=(entitlements||[]).filter(x=>x.active);
    const customers=ids.map(id=>({
      student:studentMap.get(id)||{id},
      source:(attempts||[]).find(x=>x.student_id===id)?.source||"website",
      subscription:latestSub.get(id)||null,
      entitlement:(entitlements||[]).find(x=>x.student_id===id)||{tier:"free",active:false,status:"free"},
      recognized_revenue_cents:revenueByStudent.get(id)||0,
      recent_activity:(attempts||[]).filter(x=>x.student_id===id).slice(0,5)
    }));
    return response(200,{metrics:{
      new_users_today:(newUsers||[]).length,
      ai_subscriptions:active.length,
      ai_mrr_cents:active.reduce((sum,e)=>sum+monthly(latestSub.get(e.student_id)?.plan_key||""),0),
      recognized_ai_revenue_cents:(payments||[]).reduce((sum,p)=>sum+Number(p.amount_paid||0),0),
      ai_active_users:active.length,
      ai_calls:null
    },customers,recentPayments:(payments||[]).slice(0,100)});
  }catch(error){return handleError(error);}
};

// Keep the existing Lambda handler contract on the modern Netlify runtime.
export {handler as legacyHandler};
export default withLambda(handler);
