import { streamMedia } from "./stream-media";

const ACCESS_COOKIE = "__Host-sc_access";
const REFRESH_COOKIE = "__Host-sc_refresh";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ASSET_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOKEN_LIFETIME_SECONDS = 60 * 60;
const MAX_EVENT_BODY_BYTES = 16_384;
const EVENT_TYPES = new Set(["play", "pause", "heartbeat", "seeked", "ratechange", "ended", "error"]);

export interface StreamEnvironment {
  CLOUDFLARE_STREAM_CUSTOMER_CODE?: string;
  CLOUDFLARE_STREAM_KEY_ID?: string;
  CLOUDFLARE_STREAM_SIGNING_JWK?: string;
  CLOUDFLARE_STREAM_VIDEO_MAP?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

type Fetcher = typeof fetch;
type AuthenticatedStudent = Readonly<{
  id: string;
  accessToken: string;
  refreshedSession: Record<string, unknown> | null;
}>;

function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { statusCode: status });
}

function envValue(value: string | undefined, name: string): string {
  const normalized = String(value || "").trim();
  if (!normalized) fail(`${name.toLowerCase()}_not_configured`, 503);
  return normalized;
}

function json(status: number, body: unknown, cookies: string[] = []): Response {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store, private",
    "x-content-type-options": "nosniff",
    "referrer-policy": "same-origin",
  });
  for (const cookie of cookies) headers.append("set-cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers });
}

function cookies(request: Request): Record<string, string> {
  return String(request.headers.get("cookie") || "").split(";").reduce<Record<string, string>>((result, part) => {
    const index = part.indexOf("=");
    if (index < 0) return result;
    const name = part.slice(0, index).trim();
    if (!name) return result;
    try { result[name] = decodeURIComponent(part.slice(index + 1).trim()); }
    catch { result[name] = ""; }
    return result;
  }, {});
}

function refreshedCookies(session: Record<string, unknown>): string[] {
  const accessToken = String(session.access_token || "");
  const refreshToken = String(session.refresh_token || "");
  const accessSeconds = Math.max(60, Number(session.expires_in || 3600));
  if (!accessToken || !refreshToken) fail("invalid_refreshed_student_session", 401);
  const secure = "Path=/; HttpOnly; Secure; SameSite=Lax";
  return [
    `${ACCESS_COOKIE}=${encodeURIComponent(accessToken)}; ${secure}; Max-Age=${accessSeconds}`,
    `${REFRESH_COOKIE}=${encodeURIComponent(refreshToken)}; ${secure}; Max-Age=2592000`,
  ];
}

function sameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const fetchSite = String(request.headers.get("sec-fetch-site") || "").toLowerCase();
  const expected = new URL(request.url).origin;
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) fail("cross_origin_video_request", 403);
  if (origin && origin !== expected) fail("cross_origin_video_request", 403);
  if (!origin && referer) {
    let refererOrigin: string;
    try { refererOrigin = new URL(referer).origin; }
    catch { fail("invalid_video_request_referer", 403); }
    if (refererOrigin !== expected) fail("cross_origin_video_request", 403);
  }
}

function authConfiguration(env: StreamEnvironment): { url: string; anonKey: string } {
  return {
    url: envValue(env.SUPABASE_URL, "SUPABASE_URL").replace(/\/$/, ""),
    anonKey: envValue(env.SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY"),
  };
}

async function authRequest(
  env: StreamEnvironment,
  platformFetch: Fetcher,
  path: string,
  options: { method?: string; token?: string; body?: unknown } = {},
): Promise<Record<string, unknown>> {
  const { url, anonKey } = authConfiguration(env);
  const response = await platformFetch(`${url}/auth/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${options.token || anonKey}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) fail(response.status === 400 || response.status === 401 ? "invalid_student_session" : "student_auth_unavailable", response.status === 400 || response.status === 401 ? 401 : 503);
  return data;
}

async function authenticate(request: Request, env: StreamEnvironment, platformFetch: Fetcher): Promise<AuthenticatedStudent> {
  const parsed = cookies(request);
  const bearer = String(request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  let accessToken = bearer || parsed[ACCESS_COOKIE] || "";
  if (!accessToken) fail("student_auth_required", 401);

  let user: Record<string, unknown>;
  let refreshedSession: Record<string, unknown> | null = null;
  try {
    user = await authRequest(env, platformFetch, "user", { token: accessToken });
  } catch (error) {
    const refreshToken = parsed[REFRESH_COOKIE];
    if (!refreshToken || Number((error as { statusCode?: number }).statusCode) !== 401) throw error;
    refreshedSession = await authRequest(env, platformFetch, "token?grant_type=refresh_token", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });
    accessToken = String(refreshedSession.access_token || "");
    user = (refreshedSession.user || {}) as Record<string, unknown>;
  }
  const id = String(user.id || "");
  if (!UUID.test(id)) fail("invalid_student_session", 401);
  return Object.freeze({ id, accessToken, refreshedSession });
}

async function databaseRequest(
  env: StreamEnvironment,
  platformFetch: Fetcher,
  path: string,
  options: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<unknown> {
  const url = envValue(env.SUPABASE_URL, "SUPABASE_URL").replace(/\/$/, "");
  const key = envValue(env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
  const headers: Record<string, string> = {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
    accept: "application/json",
  };
  if (options.prefer) headers.prefer = options.prefer;
  const response = await platformFetch(`${url}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) fail("video_evidence_store_unavailable", 503);
  return data;
}

async function authorizeMedia(
  studentId: string,
  enrollmentId: string,
  courseId: string,
  env: StreamEnvironment,
  platformFetch: Fetcher,
): Promise<{ actorMode: "student" | "reviewer" | "admin"; enrollment: Record<string, unknown> }> {
  if (!UUID.test(enrollmentId)) fail("invalid_enrollment", 400);
  const rows = await databaseRequest(
    env,
    platformFetch,
    `enrollments?id=eq.${encodeURIComponent(enrollmentId)}&select=id,student_id,course_id,state,status,compliance_credit_eligible,expires_at&limit=1`,
  ) as Record<string, unknown>[];
  const enrollment = rows?.[0];
  if (!enrollment || enrollment.course_id !== courseId) fail("video_course_access_denied", 403);

  if (enrollment.student_id === studentId) {
    if (enrollment.status !== "active") fail("video_course_access_inactive", 403);
    if (enrollment.expires_at && new Date(String(enrollment.expires_at)).valueOf() <= Date.now()) fail("video_course_access_expired", 403);
    const grants = await databaseRequest(
      env,
      platformFetch,
      `access_grants?enrollment_id=eq.${encodeURIComponent(enrollmentId)}&student_id=eq.${encodeURIComponent(studentId)}&course_id=eq.${encodeURIComponent(courseId)}&status=eq.active&select=id&limit=1`,
    ) as Record<string, unknown>[];
    if (!grants?.[0]) fail("video_course_access_not_active", 403);
    return { actorMode: "student", enrollment };
  }

  const reviews = await databaseRequest(
    env,
    platformFetch,
    `course_review_access?user_id=eq.${encodeURIComponent(studentId)}&course_id=eq.${encodeURIComponent(courseId)}&active=eq.true&select=access_role,expires_at`,
  ) as Record<string, unknown>[];
  const review = (reviews || []).find((row) => !row.expires_at || new Date(String(row.expires_at)).valueOf() > Date.now());
  if (!review) fail("video_course_access_denied", 403);
  return { actorMode: review.access_role === "administrator" ? "admin" : "reviewer", enrollment };
}

function videoMap(env: StreamEnvironment): Record<string, string> {
  const raw = envValue(env.CLOUDFLARE_STREAM_VIDEO_MAP, "CLOUDFLARE_STREAM_VIDEO_MAP");
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch { fail("cloudflare_stream_video_map_invalid", 503); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) fail("cloudflare_stream_video_map_invalid", 503);
  const result: Record<string, string> = {};
  for (const [asset, uid] of Object.entries(parsed as Record<string, unknown>)) {
    if (!ASSET_KEY.test(asset) || !/^[a-f0-9]{32}$/i.test(String(uid || ""))) fail("cloudflare_stream_video_map_invalid", 503);
    result[asset] = String(uid);
  }
  return result;
}

function base64url(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function parseSigningJwk(value: string): JsonWebKey {
  const trimmed = String(value || "").trim();
  if (!trimmed) fail("cloudflare_stream_signing_jwk_not_configured", 503);
  let decoded = trimmed;
  if (!trimmed.startsWith("{")) {
    try { decoded = atob(trimmed); }
    catch { fail("cloudflare_stream_signing_jwk_invalid", 503); }
  }
  try {
    const jwk = JSON.parse(decoded) as JsonWebKey;
    if (jwk.kty !== "RSA" || !jwk.n || !jwk.e || !jwk.d) fail("cloudflare_stream_signing_jwk_invalid", 503);
    return jwk;
  } catch (error) {
    if ((error as Error).message === "cloudflare_stream_signing_jwk_invalid") throw error;
    fail("cloudflare_stream_signing_jwk_invalid", 503);
  }
}

export async function signStreamToken(
  videoUid: string,
  keyId: string,
  encodedJwk: string,
  expiresAt: number,
): Promise<string> {
  if (!/^[a-f0-9]{32}$/i.test(videoUid)) fail("cloudflare_stream_video_uid_invalid", 503);
  if (!/^[a-f0-9]{32}$/i.test(keyId)) fail("cloudflare_stream_key_id_invalid", 503);
  const header = base64url(JSON.stringify({ alg: "RS256", kid: keyId }));
  const payload = base64url(JSON.stringify({ sub: videoUid, kid: keyId, exp: expiresAt }));
  const unsigned = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "jwk",
    parseSigningJwk(encodedJwk),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${base64url(new Uint8Array(signature))}`;
}

async function playback(request: Request, env: StreamEnvironment, platformFetch: Fetcher): Promise<Response> {
  sameOrigin(request);
  const url = new URL(request.url);
  const assetKey = String(url.searchParams.get("asset") || "");
  const enrollmentId = String(url.searchParams.get("enrollment_id") || "");
  const media = streamMedia(assetKey);
  if (!media) fail("unknown_stream_asset", 404);
  const student = await authenticate(request, env, platformFetch);
  const access = await authorizeMedia(student.id, enrollmentId, media.courseId, env, platformFetch);
  const uid = videoMap(env)[assetKey];
  if (!uid) fail("cloudflare_stream_asset_not_configured", 503);
  const keyId = envValue(env.CLOUDFLARE_STREAM_KEY_ID, "CLOUDFLARE_STREAM_KEY_ID");
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS;
  const token = await signStreamToken(uid, keyId, envValue(env.CLOUDFLARE_STREAM_SIGNING_JWK, "CLOUDFLARE_STREAM_SIGNING_JWK"), expiresAt);
  await databaseRequest(env, platformFetch, "video_token_issues", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      student_id: student.id,
      enrollment_id: enrollmentId,
      course_id: media.courseId,
      delivery_id: media.deliveryId,
      screen_id: media.screenId,
      asset_key: assetKey,
      actor_mode: access.actorMode,
      expires_at: new Date(expiresAt * 1000).toISOString(),
    },
  });
  const customerCode = envValue(env.CLOUDFLARE_STREAM_CUSTOMER_CODE, "CLOUDFLARE_STREAM_CUSTOMER_CODE");
  if (!/^[a-z0-9]+$/i.test(customerCode)) fail("cloudflare_stream_customer_code_invalid", 503);
  return json(200, {
    assetKey,
    iframeUrl: `https://customer-${customerCode}.cloudflarestream.com/${token}/iframe?autoplay=false&preload=metadata`,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
    captions: ["en"],
  }, student.refreshedSession ? refreshedCookies(student.refreshedSession) : []);
}

async function playbackEvent(request: Request, env: StreamEnvironment, platformFetch: Fetcher): Promise<Response> {
  sameOrigin(request);
  const size = Number(request.headers.get("content-length") || 0);
  if (size > MAX_EVENT_BODY_BYTES) fail("video_event_too_large", 413);
  const text = await request.text();
  if (text.length > MAX_EVENT_BODY_BYTES) fail("video_event_too_large", 413);
  let input: Record<string, unknown>;
  try { input = JSON.parse(text || "{}"); }
  catch { fail("invalid_video_event", 400); }

  const assetKey = String(input.assetKey || "");
  const enrollmentId = String(input.enrollmentId || "");
  const media = streamMedia(assetKey);
  if (!media) fail("unknown_stream_asset", 404);
  const eventType = String(input.eventType || "");
  const sessionId = String(input.sessionId || "");
  const clientSequence = Number(input.clientSequence);
  const positionSeconds = Number(input.positionSeconds);
  const mediaDurationSeconds = Number(input.mediaDurationSeconds);
  const playbackRate = Number(input.playbackRate);
  if (!EVENT_TYPES.has(eventType) || !UUID.test(sessionId) || !Number.isInteger(clientSequence) || clientSequence < 0 || clientSequence > 1_000_000) fail("invalid_video_event", 400);
  if (!Number.isFinite(positionSeconds) || positionSeconds < 0 || positionSeconds > media.durationSeconds + 5) fail("invalid_video_position", 400);
  if (!Number.isFinite(mediaDurationSeconds) || Math.abs(mediaDurationSeconds - media.durationSeconds) > 5) fail("invalid_video_duration", 400);
  if (!Number.isFinite(playbackRate) || playbackRate < 0.5 || playbackRate > 2) fail("invalid_video_playback_rate", 400);

  const student = await authenticate(request, env, platformFetch);
  const access = await authorizeMedia(student.id, enrollmentId, media.courseId, env, platformFetch);
  await databaseRequest(env, platformFetch, "video_playback_events?on_conflict=enrollment_id,asset_key,playback_session_id,client_sequence", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: {
      student_id: student.id,
      enrollment_id: enrollmentId,
      course_id: media.courseId,
      delivery_id: media.deliveryId,
      screen_id: media.screenId,
      asset_key: assetKey,
      actor_mode: access.actorMode,
      playback_session_id: sessionId,
      client_sequence: clientSequence,
      event_type: eventType,
      position_seconds: Math.round(positionSeconds * 1000) / 1000,
      media_duration_seconds: Math.round(mediaDurationSeconds * 1000) / 1000,
      playback_rate: playbackRate,
    },
  });
  return json(202, { recorded: true }, student.refreshedSession ? refreshedCookies(student.refreshedSession) : []);
}

export async function handleStreamApi(
  request: Request,
  env: StreamEnvironment,
  options: { fetch?: Fetcher } = {},
): Promise<Response | null> {
  const url = new URL(request.url);
  const platformFetch = options.fetch || fetch;
  try {
    if (url.pathname === "/api/stream/playback" && request.method === "GET") return await playback(request, env, platformFetch);
    if (url.pathname === "/api/stream/events" && request.method === "POST") return await playbackEvent(request, env, platformFetch);
    if (url.pathname.startsWith("/api/stream/")) return json(405, { error: "method_not_allowed" });
    return null;
  } catch (error) {
    const status = Number((error as { statusCode?: number }).statusCode) || 500;
    return json(status, { error: status >= 500 ? "stream_service_unavailable" : String((error as Error).message || "stream_request_failed") });
  }
}
