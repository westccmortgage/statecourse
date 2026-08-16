export function stripeEnvironment() {
  const mode = process.env.STRIPE_MODE === "live" ? "live" : "test";
  const secretKey = mode === "live" ? process.env.STRIPE_SECRET_KEY_LIVE : process.env.STRIPE_SECRET_KEY_TEST;
  const webhookSecret = mode === "live" ? process.env.STRIPE_WEBHOOK_SECRET_LIVE : process.env.STRIPE_WEBHOOK_SECRET_TEST;

  if (mode === "live" && process.env.STATECOURSE_LIVE_PAYMENTS_ENABLED !== "true") {
    throw Object.assign(new Error("live_payments_disabled"), { statusCode: 503 });
  }
  if (!secretKey) throw Object.assign(new Error("stripe_not_configured"), { statusCode: 503 });
  return { mode, secretKey, webhookSecret };
}

export function baseUrl() {
  const value = process.env.STATECOURSE_BASE_URL;
  if (!value) throw Object.assign(new Error("base_url_not_configured"), { statusCode: 503 });
  return new URL(value).origin;
}
