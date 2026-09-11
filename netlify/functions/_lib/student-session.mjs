import { dbRequest } from "./db.mjs";

const ACCESS_COOKIE = "__Host-sc_access";
const REFRESH_COOKIE = "__Host-sc_refresh";
const EMAIL = /^\S+@\S+\.\S+$/;

function authConfig() {
  /* trim() for the same reason as db.mjs: pasted values with trailing whitespace make invalid
     HTTP headers and fetch throws before any request is sent. */
  const url = String(process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const anonKey = String(process.env.SUPABASE_ANON_KEY || "").trim();
  if (!url || !anonKey) throw Object.assign(new Error("student_auth_not_configured"), { statusCode: 503 });
  return { url, anonKey };
}

function cookies(event) {
  return String(event.headers?.cookie || "").split(";").reduce((result, part) => {
    const index = part.indexOf("=");
    if (index < 0) return result;
    result[part.slice(0,index).trim()] = decodeURIComponent(part.slice(index+1).trim());
    return result;
  }, {});
}

async function authRequest(path, { method="GET", token, body }={}) {
  const { url, anonKey } = authConfig();
  const response = await fetch(`${url}/auth/v1/${path}`, {
    method,
    headers: {
      apikey: anonKey,
      // Opaque API keys belong only in apikey; user access tokens remain Bearer JWTs.
      ...(token ? { authorization: `Bearer ${token}` } :
        anonKey.startsWith("sb_") ? {} : { authorization: `Bearer ${anonKey}` }),
      "content-type": "application/json",
      accept: "application/json"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (data.code === "email_not_confirmed" || data.error_code === "email_not_confirmed") {
      throw Object.assign(new Error("email_confirmation_required"), { statusCode: 403 });
    }
    if (response.status === 429) {
      throw Object.assign(new Error("sign_in_rate_limited"), { statusCode: 429 });
    }
    const statusCode = response.status === 400 || response.status === 401 ? 401 : 503;
    throw Object.assign(new Error(statusCode === 401 ? "invalid_student_session" : "student_auth_unavailable"), { statusCode });
  }
  return data;
}

async function syncStudent(user, { signedIn = true } = {}) {
  const email = String(user.email || "").trim().toLowerCase();
  if (!user.id || !EMAIL.test(email)) throw Object.assign(new Error("invalid_student_session"), { statusCode: 401 });
  const record = {
    id: user.id,
    email,
    first_name: String(user.user_metadata?.first_name || "").slice(0,100) || null,
    last_name: String(user.user_metadata?.last_name || "").slice(0,100) || null,
    preferred_name: String(user.user_metadata?.preferred_name || "").slice(0,100) || null,
    updated_at: new Date().toISOString()
  };
  if (signedIn) record.last_sign_in_at = new Date().toISOString();
  await dbRequest("students?on_conflict=id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: record
  });
  return { id: user.id, email, firstName: user.user_metadata?.first_name || null, lastName: user.user_metadata?.last_name || null, preferredName: user.user_metadata?.preferred_name || null };
}

export async function registerStudent(input = {}) {
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");
  const firstName = String(input.firstName || "").trim().slice(0,100);
  const lastName = String(input.lastName || "").trim().slice(0,100);
  const intendedCourse = String(input.courseId || "").trim().slice(0,100);
  if (!EMAIL.test(email) || password.length < 10 || password.length > 200 || !firstName || !lastName) {
    throw Object.assign(new Error("invalid_registration"), { statusCode: 400 });
  }
  const origin = String(process.env.STATECOURSE_BASE_URL || "").replace(/\/$/,"");
  const redirect = origin.startsWith("https://") ? `?redirect_to=${encodeURIComponent(`${origin}/student/sign-in/`)}` : "";
  const result = await authRequest(`signup${redirect}`, {
    method:"POST",
    body:{
      email,
      password,
      data:{
        first_name:firstName,
        last_name:lastName,
        intended_course:intendedCourse || null
      }
    }
  });
  /* Signup response shape differs by confirmation mode: with autoconfirm the user arrives
     inside a session ({ access_token, user }); with email confirmation enabled GoTrue returns
     the user object itself at the top level and no session. Accept both. */
  const user = result.user?.id ? result.user : (result.id ? result : null);
  if (!user?.id) throw Object.assign(new Error("registration_unavailable"), { statusCode: 503 });
  const student = await syncStudent(user,{ signedIn:Boolean(result.access_token) });
  return {
    student,
    session:result.access_token ? result : null,
    confirmationRequired:!result.access_token
  };
}

export async function signInStudent(emailInput,passwordInput) {
  const email = String(emailInput || "").trim().toLowerCase();
  const password = String(passwordInput || "");
  if (!EMAIL.test(email) || password.length === 0 || password.length > 200) {
    throw Object.assign(new Error("invalid_sign_in"), { statusCode: 400 });
  }
  const session = await authRequest("token?grant_type=password", { method:"POST", body:{ email,password } });
  const student = await syncStudent(session.user);
  return { student, session };
}

export async function requireStudentSession(event) {
  const parsed = cookies(event);
  const bearer = String(event.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  let accessToken = bearer || parsed[ACCESS_COOKIE] || "";
  let refreshedSession = null;
  if (!accessToken) throw Object.assign(new Error("student_auth_required"), { statusCode: 401 });

  let user;
  try {
    user = await authRequest("user", { token:accessToken });
  } catch (error) {
    const refreshToken = parsed[REFRESH_COOKIE];
    if (!refreshToken || error.statusCode !== 401) throw error;
    refreshedSession = await authRequest("token?grant_type=refresh_token", { method:"POST", body:{ refresh_token:refreshToken } });
    accessToken = refreshedSession.access_token;
    user = refreshedSession.user;
  }
  const student = await syncStudent(user);
  return { student, accessToken, refreshedSession };
}

export async function updateStudentProfile(accessToken,input = {}) {
  const firstName = String(input.firstName || "").trim().slice(0,100);
  const lastName = String(input.lastName || "").trim().slice(0,100);
  if (!firstName || !lastName) {
    throw Object.assign(new Error("invalid_student_profile"), { statusCode:400 });
  }
  const user = await authRequest("user", {
    method:"PUT",
    token:accessToken,
    body:{ data:{ first_name:firstName,last_name:lastName } }
  });
  return syncStudent(user,{ signedIn:false });
}

export async function signOutStudent(event) {
  const parsed = cookies(event);
  const token = parsed[ACCESS_COOKIE];
  if (token) await authRequest("logout", { method:"POST", token }).catch(() => null);
}

export function sessionCookies(session) {
  const secure = "Path=/; HttpOnly; Secure; SameSite=Lax";
  const accessMaxAge = Math.max(60,Number(session.expires_in || 3600));
  return [
    `${ACCESS_COOKIE}=${encodeURIComponent(session.access_token)}; ${secure}; Max-Age=${accessMaxAge}`,
    `${REFRESH_COOKIE}=${encodeURIComponent(session.refresh_token)}; ${secure}; Max-Age=2592000`
  ];
}

export function clearSessionCookies() {
  const expired = "Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
  return [`${ACCESS_COOKIE}=; ${expired}`,`${REFRESH_COOKIE}=; ${expired}`];
}

export function sessionResponse(statusCode,body,setCookies=[]) {
  const response = {
    statusCode,
    headers: { "content-type":"application/json; charset=utf-8", "cache-control":"no-store", "x-content-type-options":"nosniff" },
    body: JSON.stringify(body)
  };
  if (setCookies.length) response.multiValueHeaders = { "set-cookie":setCookies };
  return response;
}
