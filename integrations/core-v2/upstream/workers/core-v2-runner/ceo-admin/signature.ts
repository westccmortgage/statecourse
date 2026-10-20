/* HOW THE ADMINISTRATIVE APPLICATION PROVES A REQUEST IS ITS OWN.
 *
 * The administrative application and this record live in two different
 * Supabase projects, so no token either platform issues means anything to
 * the other. The door used to accept a JWT signed with THIS project's JWT
 * secret — which meant the other system had to hold a secret that can mint
 * any role here, service_role included. That is too much to lend anybody.
 *
 * So the two systems share one secret that is good for exactly one thing:
 * this door. The caller signs `${timestamp}.${body}` with it (HMAC-SHA256,
 * hex); the door accepts a timestamp within five minutes of its own clock and
 * compares in constant time. The secret is read by name, never logged, never
 * echoed, and rotating it touches nothing else in either project.
 *
 * WHO the caller is does not travel in the request at all. The door acts as
 * the one submitter its own deployment names (CORE_V2_CEO_ADMIN_SUBMITTER),
 * and `ceo_admin_tenant_for` still decides which organization that submitter
 * may act in for the owner named in the body. Holding the secret therefore
 * buys exactly the permissions the record already granted, and no more.
 *
 * Replay inside the window is harmless by construction: `submit` is keyed by
 * the content it carries, `adjudicate` is refused once the disagreement is
 * settled, `cancel` is idempotent, and the rest only read.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const SIGNATURE_HEADER = "x-ceo-admin-signature";
export const TIMESTAMP_HEADER = "x-ceo-admin-timestamp";
export const WINDOW_SECONDS = 300;
export const MINIMUM_SECRET_LENGTH = 32;

export function sign(secret: string, timestamp: string, body: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`, "utf8").digest("hex");
}

/* Null when the request is the administrative application's own; otherwise
   the reason it is not, for the log. The caller is told only "refused". */
export function verify(
  secret: string | undefined,
  timestamp: string | null,
  signature: string | null,
  body: string,
  nowSeconds: number,
): string | null {
  if (!secret || secret.length < MINIMUM_SECRET_LENGTH) return "the door has no usable secret";
  if (!timestamp || !/^\d{10}$/.test(timestamp)) return "no timestamp";
  if (Math.abs(nowSeconds - Number(timestamp)) > WINDOW_SECONDS) return "timestamp outside the window";
  if (!signature || !/^[0-9a-f]{64}$/.test(signature)) return "no signature";
  const expected = Buffer.from(sign(secret, timestamp, body), "hex");
  const given = Buffer.from(signature, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given) ? null : "signature does not match";
}
