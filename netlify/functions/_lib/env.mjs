import { stripeSecretKeyMode } from "../../../lib/stripe-contract.mjs";

export function stripeEnvironment() {
  const mode = process.env.STRIPE_MODE === "live" ? "live" : "test";
  const secretKey = String(mode === "live" ? process.env.STRIPE_SECRET_KEY_LIVE : process.env.STRIPE_SECRET_KEY_TEST || "").trim();
  const webhookSecret = String(mode === "live" ? process.env.STRIPE_WEBHOOK_SECRET_LIVE : process.env.STRIPE_WEBHOOK_SECRET_TEST || "").trim();

  if (mode === "live" && process.env.STATECOURSE_LIVE_PAYMENTS_ENABLED !== "true") {
    throw Object.assign(new Error("live_payments_disabled"), { statusCode: 503 });
  }
  if (!secretKey) throw Object.assign(new Error("stripe_not_configured"), { statusCode: 503 });
  // A variable's name does not constrain the Stripe account addressed by its value.
  // Reject opposite-mode and non-secret keys before any request can reach Stripe.
  const keyMode = stripeSecretKeyMode(secretKey);
  if (!keyMode) throw Object.assign(new Error("stripe_secret_key_invalid"), { statusCode: 503 });
  if (keyMode !== mode) throw Object.assign(new Error("stripe_mode_key_mismatch"), { statusCode: 503 });
  return { mode, secretKey, webhookSecret };
}

export function baseUrl() {
  const value = process.env.STATECOURSE_BASE_URL;
  if (!value) throw Object.assign(new Error("base_url_not_configured"), { statusCode: 503 });
  return new URL(value).origin;
}
