import { handler as sharedStripeWebhook } from "./stripe-webhook.mjs";

export const handler = async (event) => {
  const mode=process.env.STRIPE_MODE==="live"?"live":"test";
  const secret=mode==="live"
    ? process.env.STRIPE_AI_WEBHOOK_SECRET_LIVE
    : process.env.STRIPE_AI_WEBHOOK_SECRET_TEST;
  if(!secret){
    return {statusCode:503,headers:{"content-type":"application/json","cache-control":"no-store"},body:JSON.stringify({error:"payment_service_unavailable"})};
  }
  if(mode==="live") process.env.STRIPE_WEBHOOK_SECRET_LIVE=secret;
  else process.env.STRIPE_WEBHOOK_SECRET_TEST=secret;
  return sharedStripeWebhook(event);
};
