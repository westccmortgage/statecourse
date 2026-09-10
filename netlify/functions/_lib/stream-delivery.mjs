import fs from "node:fs/promises";
import path from "node:path";
import { dbRequest } from "./db.mjs";
import { streamMedia } from "../../../config/stream-media.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ASSET_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOKEN_LIFETIME_SECONDS = 60 * 60;
const EVENT_TYPES = new Set(["play", "pause", "heartbeat", "seeked", "ratechange", "ended", "error"]);

function fail(message, statusCode = 400) {
  throw Object.assign(new Error(message), { statusCode });
}

function requiredEnvironment(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) fail(`${name.toLowerCase()}_not_configured`, 503);
  return value;
}

export function requireStreamSameOrigin(event, { allowGet = false } = {}) {
  const base = requiredEnvironment("STATECOURSE_BASE_URL");
  const expected = new URL(base).origin;
  const origin = String(event.headers?.origin || "").trim();
  const referer = String(event.headers?.referer || event.headers?.referrer || "").trim();
  const fetchSite = String(event.headers?.["sec-fetch-site"] || "").toLowerCase();
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) fail("origin_not_allowed", 403);
  if (origin) {
    let parsed;
    try { parsed = new URL(origin).origin; } catch { fail("origin_not_allowed", 403); }
    if (parsed !== expected) fail("origin_not_allowed", 403);
    return;
  }
  if (allowGet && referer) {
    let parsed;
    try { parsed = new URL(referer).origin; } catch { fail("origin_not_allowed", 403); }
    if (parsed !== expected) fail("origin_not_allowed", 403);
    return;
  }
  fail("origin_not_allowed", 403);
}

/*
 * Where an asset's delivery facts come from.
 *
 * Two registries now describe the same kind of thing. config/stream-media.mjs is the
 * hand-edited one the reviewed Texas videos use; console_video_delivery is the database view
 * the administration console writes, and it lists only assets whose release gate is complete
 * and whose placement stands. The console is preferred where it has an entry, so a video
 * released through it needs no code change and no environment variable.
 *
 * A database that cannot be reached falls back to the code registry rather than failing.
 * Students watching an already-released video must not lose it because a console table is
 * missing or Supabase is briefly unavailable; the console route simply has nothing to say
 * about that asset yet.
 */
async function resolveMedia(assetKey) {
  try {
    const rows = await dbRequest(
      `console_video_delivery?asset_key=eq.${encodeURIComponent(assetKey)}`
        + "&select=asset_key,course_id,delivery_id,screen_id,label,duration_seconds,transcript_path,stream_uid&limit=1",
    );
    const row = rows?.[0];
    if (row) {
      return {
        assetKey: row.asset_key,
        courseId: row.course_id,
        deliveryId: row.delivery_id,
        screenId: row.screen_id,
        label: row.label,
        durationSeconds: Number(row.duration_seconds),
        transcriptFile: row.transcript_path,
        streamUid: row.stream_uid,
        source: "admin_console",
      };
    }
  } catch (error) {
    console.error("Console video delivery lookup failed; using the code registry", assetKey, error?.message);
  }
  const media = streamMedia(assetKey);
  return media ? { ...media, streamUid: null, source: "code_registry" } : null;
}

export async function authorizeStreamMedia(studentId, enrollmentId, assetKey) {
  if (!UUID.test(studentId || "")) fail("invalid_student_session", 401);
  if (!UUID.test(enrollmentId || "")) fail("invalid_enrollment", 400);
  if (!ASSET_KEY.test(assetKey || "")) fail("unknown_stream_asset", 404);
  const media = await resolveMedia(assetKey);
  if (!media) fail("unknown_stream_asset", 404);

  const rows = await dbRequest(
    `enrollments?id=eq.${encodeURIComponent(enrollmentId)}&select=id,student_id,course_id,state,status,compliance_credit_eligible,expires_at&limit=1`,
  );
  const enrollment = rows?.[0];
  if (!enrollment || enrollment.course_id !== media.courseId) fail("video_course_access_denied", 403);

  if (enrollment.student_id === studentId) {
    if (enrollment.status !== "active") fail("video_course_access_inactive", 403);
    if (enrollment.expires_at && new Date(enrollment.expires_at).valueOf() <= Date.now()) {
      fail("video_course_access_expired", 403);
    }
    const grants = await dbRequest(
      `access_grants?enrollment_id=eq.${encodeURIComponent(enrollmentId)}&student_id=eq.${encodeURIComponent(studentId)}&course_id=eq.${encodeURIComponent(media.courseId)}&status=eq.active&select=id&limit=1`,
    );
    if (!grants?.[0]) fail("video_course_access_not_active", 403);
    return { media, enrollment, actorMode: "student" };
  }

  const reviews = await dbRequest(
    `course_review_access?user_id=eq.${encodeURIComponent(studentId)}&course_id=eq.${encodeURIComponent(media.courseId)}&active=eq.true&select=access_role,expires_at`,
  );
  const review = (reviews || []).find((row) => !row.expires_at || new Date(row.expires_at).valueOf() > Date.now());
  if (!review) fail("video_course_access_denied", 403);
  return { media, enrollment, actorMode: review.access_role === "administrator" ? "admin" : "reviewer" };
}

function videoMap() {
  let parsed;
  try { parsed = JSON.parse(requiredEnvironment("CLOUDFLARE_STREAM_VIDEO_MAP")); }
  catch { fail("cloudflare_stream_video_map_invalid", 503); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) fail("cloudflare_stream_video_map_invalid", 503);
  const normalized = {};
  for (const [assetKey, uid] of Object.entries(parsed)) {
    if (!ASSET_KEY.test(assetKey) || !/^[a-f0-9]{32}$/i.test(String(uid || ""))) {
      fail("cloudflare_stream_video_map_invalid", 503);
    }
    normalized[assetKey] = String(uid);
  }
  return normalized;
}

function base64url(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  return Buffer.from(bytes).toString("base64url");
}

export function parseSigningJwk(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) fail("cloudflare_stream_signing_jwk_not_configured", 503);
  let decoded = trimmed;
  if (!trimmed.startsWith("{")) {
    try { decoded = Buffer.from(trimmed, "base64").toString("utf8"); }
    catch { fail("cloudflare_stream_signing_jwk_invalid", 503); }
  }
  try {
    const jwk = JSON.parse(decoded);
    if (jwk.kty !== "RSA" || !jwk.n || !jwk.e || !jwk.d) fail("cloudflare_stream_signing_jwk_invalid", 503);
    return jwk;
  } catch (error) {
    if (error?.message === "cloudflare_stream_signing_jwk_invalid") throw error;
    fail("cloudflare_stream_signing_jwk_invalid", 503);
  }
}

export async function signStreamToken(videoUid, keyId, encodedJwk, expiresAt) {
  if (!/^[a-f0-9]{32}$/i.test(videoUid || "")) fail("cloudflare_stream_video_uid_invalid", 503);
  if (!/^[a-f0-9]{32}$/i.test(keyId || "")) fail("cloudflare_stream_key_id_invalid", 503);
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

export async function issuePlayback({ auth, enrollmentId, assetKey }) {
  const access = await authorizeStreamMedia(auth.student.id, enrollmentId, assetKey);
  /* A console-released asset carries its own UID, so no environment variable has to be
     edited and redeployed to add a video. Code-registry assets keep reading the map. */
  const uid = access.media.streamUid || videoMap()[assetKey];
  if (!uid) fail("cloudflare_stream_asset_not_configured", 503);
  const keyId = requiredEnvironment("CLOUDFLARE_STREAM_KEY_ID");
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS;
  const token = await signStreamToken(
    uid,
    keyId,
    requiredEnvironment("CLOUDFLARE_STREAM_SIGNING_JWK"),
    expiresAt,
  );
  await dbRequest("video_token_issues", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      student_id: auth.student.id,
      enrollment_id: enrollmentId,
      course_id: access.media.courseId,
      delivery_id: access.media.deliveryId,
      screen_id: access.media.screenId,
      asset_key: assetKey,
      actor_mode: access.actorMode,
      expires_at: new Date(expiresAt * 1000).toISOString(),
    },
  });
  const customerCode = requiredEnvironment("CLOUDFLARE_STREAM_CUSTOMER_CODE");
  if (!/^[a-z0-9]+$/i.test(customerCode)) fail("cloudflare_stream_customer_code_invalid", 503);
  return {
    assetKey,
    iframeUrl: `https://customer-${customerCode}.cloudflarestream.com/${token}/iframe?autoplay=false&preload=metadata`,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
    captions: ["en"],
  };
}

export async function recordPlaybackEvent({ auth, input }) {
  const assetKey = String(input.assetKey || "");
  const enrollmentId = String(input.enrollmentId || "");
  const eventType = String(input.eventType || "");
  const sessionId = String(input.sessionId || "");
  const clientSequence = Number(input.clientSequence);
  const positionSeconds = Number(input.positionSeconds);
  const mediaDurationSeconds = Number(input.mediaDurationSeconds);
  const playbackRate = Number(input.playbackRate);
  const access = await authorizeStreamMedia(auth.student.id, enrollmentId, assetKey);
  const media = access.media;
  if (!EVENT_TYPES.has(eventType) || !UUID.test(sessionId) || !Number.isInteger(clientSequence)
      || clientSequence < 0 || clientSequence > 1_000_000) fail("invalid_video_event", 400);
  if (!Number.isFinite(positionSeconds) || positionSeconds < 0 || positionSeconds > media.durationSeconds + 5) {
    fail("invalid_video_position", 400);
  }
  if (!Number.isFinite(mediaDurationSeconds) || Math.abs(mediaDurationSeconds - media.durationSeconds) > 5) {
    fail("invalid_video_duration", 400);
  }
  if (!Number.isFinite(playbackRate) || playbackRate < 0.5 || playbackRate > 2) {
    fail("invalid_video_playback_rate", 400);
  }
  await dbRequest("video_playback_events?on_conflict=enrollment_id,asset_key,playback_session_id,client_sequence", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: {
      student_id: auth.student.id,
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
  return { recorded: true };
}

export async function readProtectedTranscript({ auth, enrollmentId, assetKey }) {
  const { media } = await authorizeStreamMedia(auth.student.id, enrollmentId, assetKey);
  const projectRoot = path.resolve(process.cwd());
  const transcriptPath = path.resolve(projectRoot, media.transcriptFile);
  if (!transcriptPath.startsWith(`${projectRoot}${path.sep}`)) fail("video_transcript_unavailable", 503);
  try { return await fs.readFile(transcriptPath, "utf8"); }
  catch { fail("video_transcript_unavailable", 503); }
}
