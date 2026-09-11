import { randomBytes, createHash } from "node:crypto";
import { requireStudentSession, sessionCookies, clearSessionCookies } from "./_lib/student-session.mjs";

export const config = { path: "/api/student/account" };

function fail(code, status = 400) { throw Object.assign(new Error(code), { statusCode: status }); }
function env() {
  const url = String(Netlify.env.get("SUPABASE_URL") || "").trim().replace(/\/$/, "");
  const key = String(Netlify.env.get("SUPABASE_ANON_KEY") || "").trim();
  const origin = String(Netlify.env.get("STATECOURSE_BASE_URL") || "").trim().replace(/\/$/, "");
  if (!url || !key || !origin.startsWith("https://")) fail("account_service_unavailable", 503);
  return { url, key, origin: new URL(origin).origin };
}
function cookie(req, name) {
  const entry = (req.headers.get("cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith(name + "="));
  try { return entry ? decodeURIComponent(entry.slice(name.length + 1)) : ""; } catch { return ""; }
}
function verifierCookie(value, age = 600) {
  return "__Host-sc_pkce=" + encodeURIComponent(value) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + age;
}
async function auth(path, { body, token, method } = {}) {
  const { url, key } = env();
  const headers = { apikey: key, "content-type": "application/json" };
  if (token) headers.authorization = "Bearer " + token;
  else if (!key.startsWith("sb_")) headers.authorization = "Bearer " + key;
  let res;
  try {
    res = await fetch(url + "/auth/v1/" + path, {
      method: method || (body ? "POST" : "GET"), headers,
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(12000)
    });
  } catch { fail("account_service_unavailable", 503); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 429) fail("too_many_attempts", 429);
    if (data.code === "same_password" || data.error_code === "same_password") fail("same_password");
    if (data.code === "weak_password" || data.error_code === "weak_password") fail("weak_password");
    if (data.code === "reauthentication_needed" || data.error_code === "reauthentication_needed") fail("reauthentication_required", 403);
    if (res.status >= 500) fail("account_service_unavailable", 503);
    fail("authentication_failed", 401);
  }
  return data;
}
function validPassword(value) {
  if (typeof value !== "string" || value.length < 10 || value.length > 200) fail("password_length");
}
function json(status, data, cookies = []) {
  const headers = new Headers({ "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  for (const item of cookies) headers.append("set-cookie", item);
  return new Response(JSON.stringify(data), { status, headers });
}
function sessionEvent(req) { return { headers: { cookie: req.headers.get("cookie") || "" } }; }

export default async function account(req) {
  try {
    const { url, origin } = env();
    if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
    if (req.headers.get("origin") !== origin) fail("origin_not_allowed", 403);
    if (!req.headers.get("content-type")?.startsWith("application/json")) fail("invalid_json");
    const raw = await req.text();
    if (raw.length > 16000) fail("request_too_large", 413);
    let input; try { input = JSON.parse(raw); } catch { fail("invalid_json"); }
    if (!input || typeof input !== "object" || Array.isArray(input)) fail("invalid_json");
    if (input.action === "forgot") {
      const email = String(input.email || "").trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) fail("invalid_email");
      await auth("recover?redirect_to=" + encodeURIComponent(origin + "/student/sign-in/"), { body: { email } });
      return json(200, { ok: true, message: "If an account uses that email, a password reset link will be sent." });
    }
    if (input.action === "google_start") {
      const settings = await auth("settings");
      if (!settings.external?.google) fail("google_not_configured", 503);
      const verifier = randomBytes(32).toString("base64url");
      const challenge = createHash("sha256").update(verifier).digest("base64url");
      const destination = input.destination === "admin" ? "admin" : "student";
      const target = new URL(url + "/auth/v1/authorize");
      target.searchParams.set("provider", "google");
      target.searchParams.set("redirect_to", origin + (destination === "admin" ? "/admin/console/" : "/student/sign-in/"));
      target.searchParams.set("code_challenge", challenge);
      target.searchParams.set("code_challenge_method", "s256");
      return json(200, { url: target.href }, [verifierCookie(verifier)]);
    }
    if (input.action === "google_finish") {
      const verifier = cookie(req, "__Host-sc_pkce");
      if (!/^[A-Za-z0-9_-]{43}$/.test(verifier) || typeof input.code !== "string" || input.code.length > 2048 || !input.code) fail("oauth_session_expired", 401);
      const session = await auth("token?grant_type=pkce", { body: { auth_code: input.code, code_verifier: verifier } });
      if (!session.access_token || !session.refresh_token) fail("authentication_failed", 401);
      await requireStudentSession({ headers: { authorization: "Bearer " + session.access_token } });
      return json(200, { ok: true }, [...sessionCookies(session), verifierCookie("", 0)]);
    }
    if (input.action === "reset" || input.action === "change") {
      validPassword(input.password);
      let token;
      if (input.action === "reset") {
        if (typeof input.recoveryToken !== "string" || input.recoveryToken.length < 20 || input.recoveryToken.length > 12000) fail("reset_link_expired", 401);
        token = input.recoveryToken;
        // Validate with Auth, never decode a browser-supplied JWT as proof.
        try { await auth("user", { token }); } catch (e) {
          if (e.statusCode === 401) fail("reset_link_expired", 401);
          throw e;
        }
      } else {
        const current = await requireStudentSession(sessionEvent(req));
        if (typeof input.currentPassword !== "string" || !input.currentPassword || input.currentPassword.length > 200) fail("current_password_required");
        let checked;
        try { checked = await auth("token?grant_type=password", { body: { email: current.student.email, password: input.currentPassword } }); }
        catch (e) { if (e.statusCode === 401) fail("current_password_incorrect", 401); throw e; }
        if (checked.user?.id !== current.student.id || !checked.access_token) fail("authentication_failed", 401);
        token = checked.access_token;
      }
      await auth("user", { method: "PUT", token, body: { password: input.password } });
      let sessionsRevoked = true;
      try { await auth("logout?scope=global", { method: "POST", token }); } catch { sessionsRevoked = false; }
      return json(200, { ok: true, sessionsRevoked }, clearSessionCookies());
    }
    fail("unknown_action");
  } catch (error) {
    const status = Number(error.statusCode) || 500;
    const allowed = new Set(["google_not_configured", "account_service_unavailable"]);
    return json(status, { error: status >= 500 && !allowed.has(error.message) ? "account_service_unavailable" : error.message });
  }
}
