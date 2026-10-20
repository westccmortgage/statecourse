import {withLambda} from '@netlify/aws-lambda-compat';
import { baseUrl } from "./_lib/env.mjs";
import { dbRequest } from "./_lib/db.mjs";
import { stripeRequest } from "./_lib/stripe.mjs";
import { handleError, method, requireSameOrigin, response } from "./_lib/http.mjs";
import { requireStudentSession } from "./_lib/student-session.mjs";

const handler=async(event)=>{
  try{
    method(event,"POST");
    requireSameOrigin(event);
    const auth=await requireStudentSession(event);
    const rows=await dbRequest(`ai_subscriptions?student_id=eq.${encodeURIComponent(auth.student.id)}&select=stripe_customer_id,stripe_mode,status&order=updated_at.desc&limit=1`);
    const subscription=rows?.[0];
    if(!subscription?.stripe_customer_id) throw Object.assign(new Error("ai_subscription_not_found"),{statusCode:404});
    const portal=await stripeRequest("/billing_portal/sessions",{
      method:"POST",
      params:{customer:subscription.stripe_customer_id,return_url:`${baseUrl()}/student/`}
    });
    return response(200,{url:portal.url});
  }catch(error){return handleError(error);}
};

// Keep the existing Lambda handler contract on the modern Netlify runtime.
export {handler as legacyHandler};
export default withLambda(handler);
