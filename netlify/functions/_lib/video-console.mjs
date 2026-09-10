import { dbRequest, rpc } from "./db.mjs";
import { inspectScreen, deliveriesForCourse, indexedCourseIds } from "../../../config/course-screen-index.mjs";
import { logConsoleAction } from "./staff-session.mjs";

/*
 * The upload -> review -> placement chain, driven from the console instead of from a
 * developer's editor.
 *
 * Placing one video today means: render it, upload it to Cloudflare by hand, write a QC
 * record, edit config/stream-media.mjs, edit the state's screen-media registry, regenerate
 * the block maps, add the Stream UID to the CLOUDFLARE_STREAM_VIDEO_MAP environment
 * variable, and deploy. Eight steps across code, configuration and a deploy, six of which
 * only a developer can perform. That is why the owner cannot publish a video, and it is
 * also why the ten release conditions in video-production/PORTFOLIO.md are enforced by
 * someone remembering them.
 *
 * Here the same conditions are rows, and the gate is checked twice — once in placeAsset so
 * the console can explain what is missing, and once inside the place_video_asset function
 * so the record cannot be written even if this file is wrong.
 *
 * The API token never reaches the browser. Cloudflare's direct creator upload gives us a
 * one-time URL scoped to a single video, and the file travels from the operator's machine
 * to Cloudflare without passing through StateCourse.
 */

const ASSET_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UID = /^[a-f0-9]{32}$/i;
const SHA256 = /^[0-9a-f]{64}$/;
const PROTECTED_MEDIA_ROOT = "private-media/";

/* Recorded from what Cloudflare reports, never from what an operator types. */
const MACHINE_GATES = Object.freeze(["stream_upload", "signed_playback", "origin_restriction"]);

/* Recorded by a named person, with evidence, because no API can answer them. */
const REVIEW_GATES = Object.freeze([
  "final_master",
  "poster_image",
  "shipping_captions",
  "protected_transcript",
  "lesson_text_equivalent",
  "factual_review",
  "visual_fidelity_review",
  "logo_safe_review",
  "accessibility_review",
  "placement_rules",
]);

export const ALL_GATES = Object.freeze([...REVIEW_GATES, ...MACHINE_GATES]);

function fail(message, statusCode = 400) {
  throw Object.assign(new Error(message), { statusCode });
}

function requiredEnvironment(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) fail(`${name.toLowerCase()}_not_configured`, 503);
  return value;
}

/*
 * Origins Cloudflare is allowed to play this video into.
 *
 * Defaults to the configured production origin and its www form, matching the allowlist the
 * reviewed Texas videos already carry. An explicit variable overrides it so a staging origin
 * can be added without editing code.
 */
export function productionOrigins() {
  const explicit = String(process.env.CLOUDFLARE_STREAM_ALLOWED_ORIGINS || "").trim();
  if (explicit) {
    const origins = explicit.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
    if (!origins.length) fail("cloudflare_stream_allowed_origins_invalid", 503);
    return origins;
  }
  const host = new URL(requiredEnvironment("STATECOURSE_BASE_URL")).hostname.toLowerCase();
  return host.startsWith("www.") ? [host.slice(4), host] : [host, `www.${host}`];
}

function protectedPath(value, field) {
  const raw = String(value || "").trim();
  if (!raw.startsWith(PROTECTED_MEDIA_ROOT)) fail(`${field}_must_be_under_private_media`);
  if (raw.includes("..") || raw.includes("\\") || raw.includes("//")) fail(`invalid_${field}`);
  if (!/^[a-z0-9/_.-]+$/i.test(raw)) fail(`invalid_${field}`);
  return raw;
}

async function cloudflare(path, { method = "GET", body } = {}) {
  const account = requiredEnvironment("CLOUDFLARE_ACCOUNT_ID");
  const token = requiredEnvironment("CLOUDFLARE_STREAM_API_TOKEN");
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/stream${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    /* Cloudflare's own message is logged and withheld from the response: it can name the
       account and the token's permissions. */
    console.error("Cloudflare Stream API error", path, response.status, JSON.stringify(payload?.errors || null));
    fail("cloudflare_stream_request_failed", response.status === 401 || response.status === 403 ? 503 : 502);
  }
  return payload?.result ?? null;
}

/* The same check for actions addressed by asset key rather than by course. */
async function assetInScope(staff, assetKey) {
  const asset = await assetRow(assetKey);
  await requireCourseInScope(staff, asset.course_id);
  return asset;
}

async function assetRow(assetKey) {
  const rows = await dbRequest(
    `video_assets?asset_key=eq.${encodeURIComponent(assetKey)}`
      + "&select=asset_key,course_id,delivery_id,screen_id,label,duration_seconds,transcript_path,captions_path,stream_uid,stream_upload_id,source_sha256,source_bytes,created_by,created_at,updated_at&limit=1",
  );
  const asset = rows?.[0];
  if (!asset) fail("video_asset_not_found", 404);
  return asset;
}

async function courseRow(courseId) {
  const rows = await dbRequest(
    `courses?id=eq.${encodeURIComponent(courseId)}&select=id,state,name,approval_status,enrollment_enabled&limit=1`,
  );
  const course = rows?.[0];
  if (!course) fail("unknown_course", 404);
  return course;
}

/*
 * A binding scoped to a state acts only in that state.
 *
 * Checked against the course record rather than against anything in the request, so a
 * producer engaged for Texas cannot reach a Michigan course by editing a field. An
 * unscoped binding (scopeStates null) covers every state.
 */
async function requireCourseInScope(staff, courseId) {
  const course = await courseRow(courseId);
  if (staff.scopeStates && !staff.scopeStates.includes(course.state)) {
    fail("course_outside_staff_scope", 403);
  }
  return course;
}

/* ── step one: reserve the upload ──────────────────────────────────────────────────────── */

export async function reserveUpload({ staff, input }) {
  const assetKey = String(input.assetKey || "").trim();
  if (!ASSET_KEY.test(assetKey)) fail("invalid_asset_key");
  const existing = await dbRequest(
    `video_assets?asset_key=eq.${encodeURIComponent(assetKey)}&select=asset_key&limit=1`,
  );
  if (existing?.[0]) fail("video_asset_already_exists", 409);

  const courseId = String(input.courseId || "").trim();
  const course = await requireCourseInScope(staff, courseId);
  const deliveryId = String(input.deliveryId || "").trim();
  const screenId = String(input.screenId || "").trim();

  /* Refused here rather than discovered at playback: a video bound to a screen that does not
     exist renders as nothing at all, which looks like a delivery outage. */
  const screen = inspectScreen(courseId, deliveryId, screenId);
  if (!screen.ok) {
    throw Object.assign(new Error(`placement_target_rejected:${screen.reason}`), {
      statusCode: 400,
      detail: screen,
    });
  }

  const label = String(input.label || "").trim();
  if (label.length < 3 || label.length > 200) fail("invalid_label");
  const durationSeconds = Number(input.durationSeconds);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 7200) {
    fail("invalid_duration_seconds");
  }
  const transcriptPath = protectedPath(input.transcriptPath, "transcript_path");
  const captionsPath = protectedPath(input.captionsPath, "captions_path");

  const allowedOrigins = productionOrigins();
  const upload = await cloudflare("/direct_upload", {
    method: "POST",
    body: {
      /* Headroom over the declared duration so a render a few seconds long is not rejected
         by Cloudflare after the operator has already uploaded it. */
      maxDurationSeconds: Math.min(7200, Math.ceil(durationSeconds) + 120),
      requireSignedURLs: true,
      allowedOrigins,
      creator: "StateCourse",
      meta: { name: assetKey, courseId, deliveryId, screenId },
    },
  });
  if (!upload?.uploadURL || !UID.test(upload?.uid || "")) fail("cloudflare_stream_upload_not_created", 502);

  await dbRequest("video_assets", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      asset_key: assetKey,
      course_id: courseId,
      delivery_id: deliveryId,
      screen_id: screenId,
      label,
      duration_seconds: Math.round(durationSeconds * 1000) / 1000,
      transcript_path: transcriptPath,
      captions_path: captionsPath,
      stream_upload_id: upload.uid,
      created_by: staff.auth.student.id,
    },
  });
  await logConsoleAction(staff, "video.reserve_upload", assetKey, { courseId, deliveryId, screenId });

  return {
    assetKey,
    course: { id: course.id, state: course.state, name: course.name },
    placementTarget: { deliveryId, screenId, blockId: screen.blockId, title: screen.title },
    replacesExistingVideo: screen.existingVideoAssetKeys,
    allowedOrigins,
    /* One-time and short-lived. The browser PUTs the file straight to Cloudflare; the API
       token stays on the server. */
    uploadUrl: upload.uploadURL,
    uploadId: upload.uid,
  };
}

/* ── step two: confirm what Cloudflare actually has ────────────────────────────────────── */

/*
 * Three of the thirteen release conditions are facts an API reports, and recording them from
 * the API response is the only way they stay true — a checkbox saying "signed playback is
 * enforced" is a statement about what someone believed at the time.
 *
 * The other ten need a person, and this function will not write them.
 */
export async function confirmUpload({ staff, input }) {
  const asset = await assetInScope(staff, String(input.assetKey || "").trim());
  if (!asset.stream_upload_id) fail("video_asset_has_no_reserved_upload", 409);

  const video = await cloudflare(`/${encodeURIComponent(asset.stream_upload_id)}`);
  const state = String(video?.status?.state || "unknown");
  if (state !== "ready") {
    return {
      assetKey: asset.asset_key,
      uploadState: state,
      /* Cloudflare reports these while encoding; surfacing them is the difference between
         "still working" and "stuck". */
      progress: video?.status?.pctComplete ?? null,
      errors: video?.status?.errorReasonText || null,
      gatesRecorded: [],
    };
  }

  const reported = Number(video?.duration);
  if (!Number.isFinite(reported) || reported <= 0) fail("cloudflare_stream_duration_unavailable", 502);
  /* The declared duration is what the lesson text, the transcript and the playback validator
     were all built against. A render that does not match is the wrong file. */
  if (Math.abs(reported - Number(asset.duration_seconds)) > 5) {
    throw Object.assign(new Error("uploaded_duration_does_not_match_declared"), {
      statusCode: 409,
      detail: { declared: Number(asset.duration_seconds), reported },
    });
  }

  const sourceSha256 = String(input.sourceSha256 || "").trim().toLowerCase();
  if (sourceSha256 && !SHA256.test(sourceSha256)) fail("invalid_source_sha256");

  await dbRequest(`video_assets?asset_key=eq.${encodeURIComponent(asset.asset_key)}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      stream_uid: video.uid,
      source_sha256: sourceSha256 || asset.source_sha256 || null,
      source_bytes: Number(video?.size) > 0 ? Number(video.size) : asset.source_bytes,
      updated_at: new Date().toISOString(),
    },
  });

  const allowedOrigins = productionOrigins();
  const reportedOrigins = (video?.allowedOrigins || []).map((value) => String(value).toLowerCase());
  const originsRestricted = reportedOrigins.length > 0
    && reportedOrigins.every((origin) => allowedOrigins.includes(origin));
  const captions = await cloudflare(`/${encodeURIComponent(video.uid)}/captions`).catch(() => null);

  const decisions = [
    ["stream_upload", true, { state, uid: video.uid, duration: reported, size: video?.size ?? null }],
    ["signed_playback", video?.requireSignedURLs === true, { requireSignedURLs: video?.requireSignedURLs === true }],
    ["origin_restriction", originsRestricted, { reported: reportedOrigins, expected: allowedOrigins }],
  ];

  for (const [gate, passed, evidence] of decisions) {
    await dbRequest("video_release_gate_events", {
      method: "POST",
      prefer: "return=minimal",
      body: {
        asset_key: asset.asset_key,
        gate,
        outcome: passed ? "pass" : "fail",
        evidence: { source: "cloudflare_stream_api", checkedAt: new Date().toISOString(), ...evidence },
        reviewed_by: staff.auth.student.id,
      },
    });
  }
  await logConsoleAction(staff, "video.confirm_upload", asset.asset_key, { uid: video.uid, state });

  return {
    assetKey: asset.asset_key,
    uploadState: state,
    streamUid: video.uid,
    durationSeconds: reported,
    gatesRecorded: decisions.map(([gate, passed]) => ({ gate, outcome: passed ? "pass" : "fail" })),
    /* Attached to the review, not scored: whether captions were timed from the final render
       is a provenance question, and only the person who made them can answer it. */
    cloudflareCaptions: (captions || []).map((track) => ({
      language: track?.language ?? null,
      status: track?.status ?? null,
      generated: track?.generated ?? null,
    })),
  };
}

/* ── step three: the ten human gates ───────────────────────────────────────────────────── */

export async function recordGate({ staff, input }) {
  const assetKey = String(input.assetKey || "").trim();
  const gate = String(input.gate || "").trim();
  const outcome = String(input.outcome || "").trim();
  const note = String(input.note || "").trim();

  if (MACHINE_GATES.includes(gate)) fail("gate_is_recorded_from_the_stream_api", 409);
  if (!REVIEW_GATES.includes(gate)) fail("unknown_release_gate");
  if (!["pass", "fail"].includes(outcome)) fail("invalid_gate_outcome");
  /* A pass with no stated basis is a checkbox. The note is what a later reader has to work
     from when asking why this video was released. */
  if (note.length < 10 || note.length > 2000) fail("gate_note_required");

  const asset = await assetInScope(staff, assetKey);
  const evidence = { note, recordedAt: new Date().toISOString() };
  const digest = String(input.evidenceSha256 || "").trim().toLowerCase();
  if (digest) {
    if (!SHA256.test(digest)) fail("invalid_evidence_sha256");
    evidence.evidenceSha256 = digest;
  }
  if (input.evidenceReference) evidence.reference = String(input.evidenceReference).slice(0, 500);

  await dbRequest("video_release_gate_events", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      asset_key: asset.asset_key,
      gate,
      outcome,
      evidence,
      reviewed_by: staff.auth.student.id,
    },
  });
  await logConsoleAction(staff, "video.record_gate", asset.asset_key, { gate, outcome });
  return readiness(asset.asset_key);
}

async function readiness(assetKey) {
  const [rows, gates] = await Promise.all([
    dbRequest(`video_release_readiness?asset_key=eq.${encodeURIComponent(assetKey)}&select=asset_key,required_gates,passed_gates,outstanding_gates,release_ready&limit=1`),
    dbRequest(`current_video_release_gates?asset_key=eq.${encodeURIComponent(assetKey)}&select=gate,outcome,evidence,reviewed_by,reviewed_at&order=gate.asc`),
  ]);
  return { readiness: rows?.[0] || null, gates: gates || [] };
}

/* ── step four: placement ──────────────────────────────────────────────────────────────── */

export async function placeAsset({ staff, input }) {
  const asset = await assetInScope(staff, String(input.assetKey || "").trim());
  const state = await readiness(asset.asset_key);
  if (!state.readiness?.release_ready) {
    throw Object.assign(new Error("video_release_gate_incomplete"), {
      statusCode: 409,
      detail: { outstandingGates: state.readiness?.outstanding_gates || null },
    });
  }
  /* The database refuses the same condition. This call is the one that decides. */
  const result = await rpc("place_video_asset", {
    p_asset_key: asset.asset_key,
    p_recorded_by: staff.auth.student.id,
  });
  await logConsoleAction(staff, "video.place", asset.asset_key, {
    courseId: asset.course_id,
    deliveryId: asset.delivery_id,
    screenId: asset.screen_id,
  });
  return { placement: result, ...(await readiness(asset.asset_key)) };
}

export async function withdrawAsset({ staff, input }) {
  const asset = await assetInScope(staff, String(input.assetKey || "").trim());
  const reason = String(input.reason || "").trim();
  if (reason.length < 10 || reason.length > 2000) fail("withdrawal_reason_required");
  const result = await rpc("withdraw_video_asset", {
    p_asset_key: asset.asset_key,
    p_recorded_by: staff.auth.student.id,
    p_reason: reason,
  });
  await logConsoleAction(staff, "video.withdraw", asset.asset_key, { reason });
  return { placement: result };
}

/* ── the console's view of the chain ───────────────────────────────────────────────────── */

/* Which of these course ids a state-scoped binding may see. State comes from the course
   record, never from the shape of the id. */
async function withinScope(scopeStates, courseIds) {
  const ids = [...new Set(courseIds.filter(Boolean))];
  if (!scopeStates || !ids.length) return ids;
  const rows = await dbRequest(
    `courses?id=in.(${ids.map((id) => encodeURIComponent(id)).join(",")})&select=id,state`,
  );
  const allowed = new Set((rows || []).filter((row) => scopeStates.includes(row.state)).map((row) => row.id));
  return ids.filter((id) => allowed.has(id));
}

export async function videoInventory({ courseId = null, scopeStates = null } = {}) {
  const filter = courseId ? `&course_id=eq.${encodeURIComponent(courseId)}` : "";
  const [assets, gates, readinessRows, placements, definitions] = await Promise.all([
    dbRequest(`video_assets?select=asset_key,course_id,delivery_id,screen_id,label,duration_seconds,transcript_path,captions_path,stream_uid,stream_upload_id,source_sha256,source_bytes,created_at,updated_at${filter}&order=asset_key.asc`),
    dbRequest("current_video_release_gates?select=asset_key,gate,outcome,evidence,reviewed_by,reviewed_at&order=asset_key.asc,gate.asc"),
    dbRequest("video_release_readiness?select=asset_key,required_gates,passed_gates,outstanding_gates,release_ready"),
    dbRequest("current_video_placements?select=asset_key,placement_status,recorded_at,recorded_by&order=asset_key.asc"),
    dbRequest("video_release_gate_definitions?select=gate,sequence,description&order=sequence.asc"),
  ]);

  const visibleCourses = new Set(await withinScope(scopeStates, (assets || []).map((asset) => asset.course_id)));
  const visible = (assets || []).filter((asset) => !scopeStates || visibleCourses.has(asset.course_id));

  const gatesByAsset = new Map();
  for (const gate of gates || []) {
    if (!gatesByAsset.has(gate.asset_key)) gatesByAsset.set(gate.asset_key, []);
    gatesByAsset.get(gate.asset_key).push(gate);
  }

  return {
    gateDefinitions: (definitions || []).map((definition) => ({
      ...definition,
      recordedBy: MACHINE_GATES.includes(definition.gate) ? "stream_api" : "named_reviewer",
    })),
    assets: visible.map((asset) => ({
      ...asset,
      stage: !asset.stream_uid
        ? "awaiting_upload"
        : ((readinessRows || []).find((row) => row.asset_key === asset.asset_key)?.release_ready
          ? ((placements || []).find((row) => row.asset_key === asset.asset_key)?.placement_status === "placed"
            ? "placed" : "release_ready")
          : "in_review"),
      readiness: (readinessRows || []).find((row) => row.asset_key === asset.asset_key) || null,
      placement: (placements || []).find((row) => row.asset_key === asset.asset_key) || null,
      gates: gatesByAsset.get(asset.asset_key) || [],
    })),
  };
}

export function placementTargets(courseId) {
  return deliveriesForCourse(String(courseId || ""));
}

/* Courses whose block maps are indexed, which is exactly the set a placement can target,
   narrowed to the states this binding covers. The console offers these rather than a
   free-text course id. */
export function placeableCourseIds(scopeStates = null) {
  return withinScope(scopeStates, indexedCourseIds());
}
