import { createHmac, timingSafeEqual } from "node:crypto";
import { stripeEnvironment } from "./env.mjs";

export async function stripeRequest(path, { method = "GET", params, idempotencyKey } = {}) {
  const { secretKey } = stripeEnvironment();
  const headers = { authorization: `Bearer ${secretKey}` };
  let body;
  if (params) {
    body = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) body.append(key, String(value));
    }
    headers["content-type"] = "application/x-www-form-urlencoded";
  }
  if (idempotencyKey) headers["idempotency-key"] = idempotencyKey;

  const res = await fetch(`https://api.stripe.com/v1${path}`, { method, headers, body });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data?.error?.message || "stripe_request_failed");
    error.statusCode = res.status >= 500 ? 503 : 400;
    throw error;
  }
  return data;
}

export function rawBody(event) {
  return event.isBase64Encoded ? Buffer.from(event.body || "", "base64") : Buffer.from(event.body || "", "utf8");
}

export function verifyStripeSignature(payload, signatureHeader, secret, toleranceSeconds = 300) {
  if (!signatureHeader || !secret) return false;
  const parts = signatureHeader.split(",").map((part) => part.split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.`).update(payload).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  return signatures.some((signature) => {
    const actual = Buffer.from(signature);
    return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
  });
}
