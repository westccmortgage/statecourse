import { timingSafeEqual } from "node:crypto";

export function requireAdmin(event) {
  const configured = process.env.STATECOURSE_ADMIN_API_TOKEN || "";
  const supplied = (event.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(configured);
  const b = Buffer.from(supplied);
  if (!configured || a.length !== b.length || !timingSafeEqual(a, b)) {
    throw Object.assign(new Error("unauthorized"), { statusCode: 401 });
  }
}
