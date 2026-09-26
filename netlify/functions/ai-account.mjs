import { dbRequest } from "./_lib/db.mjs";
import { handleError, method, response } from "./_lib/http.mjs";
import { requireStudentSession } from "./_lib/student-session.mjs";

const safe=(value)=>encodeURIComponent(String(value));

export const handler=async(event)=>{
  try{
    method(event,"GET");
    const auth=await requireStudentSession(event);
    const id=safe(auth.student.id);
    const [entitlements,subscriptions,attempts,payments]=await Promise.all([
      dbRequest(`ai_entitlements?student_id=eq.${id}&select=tier,active,status,effective_through,plan_key,updated_at&limit=1`),
      dbRequest(`ai_subscriptions?student_id=eq.${id}&select=plan_key,status,current_period_end,cancel_at_period_end,stripe_mode,updated_at&order=updated_at.desc&limit=1`),
      dbRequest(`ai_checkout_attempts?student_id=eq.${id}&select=plan_key,status,stripe_mode,created_at&order=created_at.desc&limit=10`),
      dbRequest(`ai_payments?student_id=eq.${id}&select=stripe_invoice_id,amount_paid,currency,status,paid_at&order=paid_at.desc&limit=20`)
    ]);
    return response(200,{
      entitlement:entitlements?.[0]||{tier:"free",active:false,status:"free"},
      subscription:subscriptions?.[0]||null,
      recentCheckouts:attempts||[],payments:payments||[]
    });
  }catch(error){return handleError(error);}
};
