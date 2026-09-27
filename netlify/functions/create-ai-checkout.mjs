import { randomUUID } from "node:crypto";
import { getAiPlan } from "../../config/ai-plans.mjs";
import { baseUrl, stripeEnvironment } from "./_lib/env.mjs";
import { dbRequest, rpc } from "./_lib/db.mjs";
import { stripeRequest } from "./_lib/stripe.mjs";
import { handleError, method, parseJson, requireSameOrigin, response } from "./_lib/http.mjs";
import { requireStudentSession } from "./_lib/student-session.mjs";

const safe = (value) => encodeURIComponent(String(value));

export const handler = async (event) => {
  let attemptId;
  let reservedFounding=false;
  let diagnosticForSmoke=false;
  try {
    method(event,"POST");
    requireSameOrigin(event);
    const input=parseJson(event);
    const plan=getAiPlan(input.planKey);
    const auth=await requireStudentSession(event);
    const smokeStudent=String(process.env.STATECOURSE_AI_LIVE_SMOKE_STUDENT_ID||"").trim();
    const smokeEmail=String(process.env.STATECOURSE_AI_LIVE_SMOKE_EMAIL||"").trim().toLowerCase();
    const smokeIdentity=(smokeStudent && smokeStudent===auth.student.id) || (smokeEmail && smokeEmail===String(auth.student.email||"").trim().toLowerCase());
    diagnosticForSmoke=process.env.STATECOURSE_AI_LIVE_SALES_ENABLED!=="true" && smokeIdentity;
    const { mode }=stripeEnvironment();

    if(mode==="live" && process.env.STATECOURSE_AI_LIVE_SALES_ENABLED!=="true"){
      if(!smokeIdentity){
        throw Object.assign(new Error("ai_live_sales_not_enabled"),{statusCode:503});
      }
    }

    const existing=await dbRequest(
      `ai_entitlements?student_id=eq.${safe(auth.student.id)}&active=eq.true&select=tier,status&limit=1`
    );
    if(existing?.length) throw Object.assign(new Error("ai_subscription_already_active"),{statusCode:409});

    attemptId=randomUUID();
    await dbRequest("ai_checkout_attempts",{
      method:"POST",prefer:"return=minimal",
      body:{id:attemptId,student_id:auth.student.id,plan_key:plan.key,stripe_mode:mode,status:"creating",source:"website"}
    });

    if(plan.foundingLimit){
      reservedFounding=await rpc("reserve_ai_founding_slot",{p_student_id:auth.student.id,p_checkout_attempt_id:attemptId});
      if(reservedFounding!==true) throw Object.assign(new Error("founding_provider_capacity_reached"),{statusCode:409});
    }

    const origin=baseUrl();
    const metadata={
      product_type:"ai_subscription",
      student_id:auth.student.id,
      checkout_attempt_id:attemptId,
      ai_plan_key:plan.key
    };
    const session=await stripeRequest("/checkout/sessions",{
      method:"POST",idempotencyKey:`ai-checkout-${attemptId}`,
      params:{
        mode:"subscription",
        customer_email:auth.student.email,
        client_reference_id:attemptId,
        "line_items[0][quantity]":1,
        "line_items[0][price]":plan.prices[mode],
        success_url:`${origin}/student/?ai_checkout=success`,
        cancel_url:`${origin}/ai/plans/?checkout=cancelled`,
        "metadata[product_type]":metadata.product_type,
        "metadata[student_id]":metadata.student_id,
        "metadata[checkout_attempt_id]":metadata.checkout_attempt_id,
        "metadata[ai_plan_key]":metadata.ai_plan_key,
        "subscription_data[metadata][product_type]":metadata.product_type,
        "subscription_data[metadata][student_id]":metadata.student_id,
        "subscription_data[metadata][checkout_attempt_id]":metadata.checkout_attempt_id,
        "subscription_data[metadata][ai_plan_key]":metadata.ai_plan_key
      }
    });

    await dbRequest(`ai_checkout_attempts?id=eq.${attemptId}`,{
      method:"PATCH",prefer:"return=minimal",
      body:{stripe_checkout_session_id:session.id,status:"checkout_created",updated_at:new Date().toISOString()}
    });
    return response(200,{checkoutUrl:session.url,sessionId:session.id,mode});
  } catch(error) {
    if(attemptId){
      await dbRequest(`ai_checkout_attempts?id=eq.${attemptId}`,{
        method:"PATCH",prefer:"return=minimal",
        body:{status:"checkout_failed",updated_at:new Date().toISOString()}
      }).catch(()=>null);
      if(reservedFounding) await rpc("release_ai_founding_slot",{p_checkout_attempt_id:attemptId}).catch(()=>null);
    }
    if(diagnosticForSmoke && Number(error?.statusCode)>=500){
      return response(Number(error.statusCode)||500,{error:"payment_service_unavailable",diagnostic:String(error?.message||"unknown_error")});
    }
    return handleError(error);
  }
};
