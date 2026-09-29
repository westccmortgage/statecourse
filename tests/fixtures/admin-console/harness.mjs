/*
 * A Supabase and Cloudflare stand-in for the administration console tests.
 *
 * The gate arithmetic is implemented here rather than stubbed, and place_video_asset
 * refuses on the same condition the SQL function does. Otherwise a test proving "placement
 * is refused until every condition passes" would only prove that the mock said no, which is
 * exactly the assertion worth being sure about.
 */

export const STAFF_ID = "11111111-1111-4111-8111-111111111111";
const NAMED_SESSION = 'header.'+Buffer.from(JSON.stringify({sub:STAFF_ID, session_id:'22222222-2222-4222-8222-222222222222',aal:'aal2',exp:4102444800})).toString('base64url')+'.signature';
const STAFF_COOKIE='__Host-sc_access='+NAMED_SESSION+'; __Host-sc_staff='+'p'.repeat(43);
export const OTHER_STAFF_ID = "99999999-9999-4999-8999-999999999999";
export const COURSE_ID = "tx-law-of-agency-30-v1";
export const DELIVERY_ID = "module-03";
export const SCREEN_ID = "t03u1-s1";
export const ENROLLMENT_ID = "44444444-4444-4444-8444-444444444444";
export const STREAM_UID = "abcdef0123456789abcdef0123456789";
export const UPLOAD_URL = "https://upload.videodelivery.net/abcdef0123456789abcdef0123456789";
/* Shaped like a real Cloudflare account id, so the fixture exercises the format check
   rather than routing around it. */
export const TEST_ACCOUNT_ID = "0123456789abcdef0123456789abcdef";

export const GATE_DEFINITIONS = Object.freeze([
  ["final_master", 1],
  ["poster_image", 2],
  ["shipping_captions", 3],
  ["protected_transcript", 4],
  ["lesson_text_equivalent", 5],
  ["factual_review", 6],
  ["visual_fidelity_review", 7],
  ["logo_safe_review", 8],
  ["accessibility_review", 9],
  ["placement_rules", 10],
  ["stream_upload", 11],
  ["signed_playback", 12],
  ["origin_restriction", 13],
].map(([gate, sequence]) => Object.freeze({ gate, sequence, description: `${gate} condition` })));

/* The gates a person records. shipping_captions and protected_transcript left this list
   when they became machine-verified; passAllReviewGates must not try to write them. */
export const MACHINE_GATES = Object.freeze([
  "stream_upload", "signed_playback", "origin_restriction", "shipping_captions", "protected_transcript",
]);
export const REVIEW_GATES = Object.freeze(GATE_DEFINITIONS
  .filter((definition) => !MACHINE_GATES.includes(definition.gate))
  .map((definition) => definition.gate));

export const VALID_VTT = "WEBVTT\n\n00:00:00.000 --> 00:00:04.000\nA broker who represents both parties.\n\n"
  + "00:00:04.000 --> 00:00:09.000\nmust obtain written consent from each of them.\n";
export const VALID_TRANSCRIPT = "Non-fiduciary duties. ".repeat(20)
  + "This transcript stands in for the full narration of the video and is long enough to be "
  + "treated as a complete text equivalent rather than a placeholder typed to satisfy a field.";

const ENV_KEYS = [
  "SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "STATECOURSE_BASE_URL",
  "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_STREAM_API_TOKEN", "CLOUDFLARE_STREAM_ALLOWED_ORIGINS",
];

function json(data, status = 200) {
  return new Response(data === null ? "" : JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function eqValue(params, field) {
  const raw = params.get(field);
  return raw?.startsWith("eq.") ? raw.slice(3) : null;
}

/** distinct on (asset_key, gate) ordered by reviewed_at desc — the SQL view's rule. */
function currentGates(store, assetKey = null) {
  const latest = new Map();
  for (const event of store.gateEvents) {
    if (assetKey && event.asset_key !== assetKey) continue;
    latest.set(`${event.asset_key}:${event.gate}`, event);
  }
  return [...latest.values()];
}

function readiness(store, assetKey) {
  const passed = currentGates(store, assetKey).filter((event) => event.outcome === "pass").map((event) => event.gate);
  const outstanding = GATE_DEFINITIONS.map((definition) => definition.gate).filter((gate) => !passed.includes(gate));
  return {
    asset_key: assetKey,
    required_gates: GATE_DEFINITIONS.length,
    passed_gates: passed.length,
    outstanding_gates: outstanding,
    release_ready: outstanding.length === 0,
  };
}

function currentPlacement(store, assetKey) {
  const events = store.placementEvents.filter((event) => event.asset_key === assetKey);
  return events.length ? events[events.length - 1] : null;
}

export function createStore(overrides = {}) {
  return {
    bindings: [{
      auth_user_id: STAFF_ID,
      actor_role: "owner",
      scope_state: null,
      binding_status: "active",
      effective_at: "2026-01-01T00:00:00.000Z",
      expires_at: null,
      recorded_at: "2026-01-01T00:00:00.000Z",
    }],
    courses: [{
      id: COURSE_ID,
      state: "TX",
      name: "Texas Law of Agency — 30 Hours",
      product_type: "real_estate_qualifying_education",
      approval_status: "submission_draft",
      enrollment_enabled: false,
      regulatory_approval_number: null,
      updated_at: "2026-09-01T00:00:00.000Z",
    }],
    courseVersions: [],
    assets: [],
    gateEvents: [],
    placementEvents: [],
    consoleActions: [],
    replacements: [],
    /* What Cloudflare reports about the reserved upload. Tests move it. */
    cloudflare: {
      state: "ready",
      uid: STREAM_UID,
      duration: 200.4,
      size: 12_345_678,
      requireSignedURLs: true,
      allowedOrigins: ["statecourse.test", "www.statecourse.test"],
      captions: [{ language: "en", status: "ready", generated: false }],
    },
    ...overrides,
  };
}

/*
 * Installs the doubles, runs the action, restores everything.
 * `calls` records every request so a test can assert what was and was not asked for.
 */
export async function withConsoleMock(store, action) {
  const originalFetch = globalThis.fetch;
  const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  const calls = [];

  process.env.SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_ANON_KEY = "anon-test-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
  process.env.STATECOURSE_BASE_URL = "https://statecourse.test";
  process.env.CLOUDFLARE_ACCOUNT_ID = TEST_ACCOUNT_ID;
  process.env.CLOUDFLARE_STREAM_API_TOKEN = "test-stream-token";
  delete process.env.CLOUDFLARE_STREAM_ALLOWED_ORIGINS;

  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    let body = null;
    if (init.body instanceof FormData) {
      const file = init.body.get("file");
      store.lastCaptionBody = file && typeof file.text === "function" ? await file.text() : String(file ?? "");
    } else if (init.body) {
      body = JSON.parse(init.body);
    }
    const method = (init.method || "GET").toUpperCase();
    calls.push({ url, method, body });

    if (url.hostname === "api.cloudflare.com") return cloudflareRoute(store, url, method, body);
    if (url.pathname === "/auth/v1/user") {
      if (init.headers?.authorization !== `Bearer ${NAMED_SESSION}`) return json({ msg: "bad_jwt" }, 401);
      return json({ id: store.signedInAs || STAFF_ID, email: "owner@statecourse.test", email_confirmed_at:"2026-01-01T00:00:00Z", user_metadata: {} });
    }
    if (url.pathname.startsWith("/rest/v1/")) return restRoute(store, url, method, body);
    throw new Error(`unexpected_mock_request:${url.href}`);
  };

  try {
    return await action(calls);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  }
}

function text(body, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/vtt" } });
}

function cloudflareRoute(store, url, method, body) {
  const path = url.pathname.replace(`/client/v4/accounts/${TEST_ACCOUNT_ID}/stream`, "");
  /* Raw endpoints: the caption upload is multipart and the read-back is the VTT itself. */
  const captionPut = path.match(/^\/([a-f0-9]{32})\/captions\/([a-z-]+)$/i);
  if (captionPut && method === "PUT") {
    store.cloudflare.storedCaptions = store.captionUploadCorrupts
      ? "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\ntruncated\n"
      : store.lastCaptionBody;
    return json({ success: true, result: { language: captionPut[2], status: "ready" } });
  }
  const captionGet = path.match(/^\/([a-f0-9]{32})\/captions\/([a-z-]+)\/vtt$/i);
  if (captionGet) {
    if (store.captionReadBackMissing) return text("", 404);
    return text(store.cloudflare.storedCaptions ?? "");
  }
  if (path === "" || path.startsWith("?")) {
    return json({ success: true, result: store.cloudflare.library || [] });
  }
  if (path === "/direct_upload" && method === "POST") {
    store.lastDirectUpload = body;
    return json({ success: true, result: { uploadURL: UPLOAD_URL, uid: STREAM_UID } });
  }
  if (path === `/${STREAM_UID}/captions`) {
    return json({ success: true, result: store.cloudflare.captions });
  }
  if (path === `/${STREAM_UID}`) {
    const video = store.cloudflare;
    return json({
      success: true,
      result: {
        uid: video.uid,
        duration: video.duration,
        size: video.size,
        requireSignedURLs: video.requireSignedURLs,
        allowedOrigins: video.allowedOrigins,
        status: { state: video.state, pctComplete: video.state === "ready" ? 100 : 40 },
      },
    });
  }
  throw new Error(`unexpected_cloudflare_request:${method} ${path}`);
}

function restRoute(store, url, method, body) {
  const table = url.pathname.replace("/rest/v1/", "").split("?")[0];
  const params = url.searchParams;

  // Boundary policy is exercised against real isolated Postgres by verify-staff-security.mjs.
  // Legacy content tests start from an already-authorized exact-session fixture.
  if (table === "rpc/statecourse_staff_security") return json({ok:true});
  if (table === "students") return json(null);
  if (table === "admin_console_actions" && method === "POST") {
    store.consoleActions.push(body);
    return json(null);
  }
  if (table === "current_staff_actor_bindings") {
    const wanted = eqValue(params, "auth_user_id");
    /* The view's own rule: distinct on (auth_user_id, actor_role, scope_state), latest
       first. Modelled faithfully so a test can reproduce the bug where a second state
       scope silently replaced the first. */
    const latest = new Map();
    for (const event of store.bindings) {
      latest.set(`${event.auth_user_id}:${event.actor_role}:${event.scope_state ?? ""}`, event);
    }
    return json([...latest.values()].filter((b) => !wanted || b.auth_user_id === wanted));
  }
  if (table === "video_screen_replacements") {
    if (method === "POST") { store.replacements.push(body); return json(null); }
    return json(store.replacements);
  }
  if (table === "courses") {
    const wanted = eqValue(params, "id");
    return json(store.courses.filter((course) => !wanted || course.id === wanted));
  }
  if (table === "regulatory_course_versions") return json(store.courseVersions);
  /* Enough of the student side to exercise the delivery path end to end. */
  if (table === "enrollments") {
    return json([{
      id: ENROLLMENT_ID, student_id: STAFF_ID, course_id: COURSE_ID,
      status: "active", expires_at: null, compliance_credit_eligible: false,
    }]);
  }
  if (table === "access_grants") return json([{ id: "grant-1" }]);
  if (table === "course_review_access") return json([]);
  if (table === "video_token_issues") return json(null);
  if (table === "video_release_gate_definitions") return json(GATE_DEFINITIONS);

  if (table === "video_assets") {
    if (method === "POST") {
      store.assets.push({
        stream_uid: null, stream_upload_id: null, transcript_text: null, captions_vtt: null,
        captions_verified_at: null, transcript_verified_at: null, ...body,
      });
      return json(null);
    }
    if (method === "PATCH") {
      const wanted = eqValue(params, "asset_key");
      const asset = store.assets.find((entry) => entry.asset_key === wanted);
      if (asset) Object.assign(asset, body);
      return json(null);
    }
    const wanted = eqValue(params, "asset_key");
    const course = eqValue(params, "course_id");
    return json(store.assets.filter((asset) => (!wanted || asset.asset_key === wanted)
      && (!course || asset.course_id === course)));
  }

  if (table === "video_release_gate_events" && method === "POST") {
    store.gateEvents.push({ ...body, reviewed_at: new Date().toISOString() });
    return json(null);
  }
  if (table === "current_video_release_gates") {
    return json(currentGates(store, eqValue(params, "asset_key")));
  }
  if (table === "video_release_readiness") {
    const wanted = eqValue(params, "asset_key");
    const keys = wanted ? [wanted] : store.assets.map((asset) => asset.asset_key);
    return json(keys.map((key) => readiness(store, key)));
  }
  if (table === "current_video_placements") {
    return json(store.assets.map((asset) => currentPlacement(store, asset.asset_key)).filter(Boolean));
  }
  if (table === "console_video_delivery") {
    const wanted = eqValue(params, "asset_key");
    return json(store.assets.filter((asset) => {
      if (wanted && asset.asset_key !== wanted) return false;
      const placement = currentPlacement(store, asset.asset_key);
      return placement?.placement_status === "placed"
        && readiness(store, asset.asset_key).release_ready
        && asset.stream_uid
        && asset.transcript_text && asset.captions_vtt
        && asset.captions_verified_at && asset.transcript_verified_at;
    }).map((asset) => ({
      asset_key: asset.asset_key,
      course_id: asset.course_id,
      delivery_id: asset.delivery_id,
      screen_id: asset.screen_id,
      label: asset.label,
      duration_seconds: asset.duration_seconds,
      transcript_path: asset.transcript_path,
      stream_uid: asset.stream_uid,
      captions_language: asset.captions_language || "en",
    })));
  }

  if (table === "rpc/place_video_asset") {
    const asset = store.assets.find((entry) => entry.asset_key === body.p_asset_key);
    if (!asset) return json({ message: "video_asset_not_found" }, 400);
    if (!asset.stream_uid) return json({ message: "video_asset_upload_incomplete" }, 400);
    const state = readiness(store, asset.asset_key);
    /* The same refusal the SQL function raises, so a Node-side bug that skipped the check
       would still be caught here. */
    if (!state.release_ready) {
      return json({ message: `video_release_gate_incomplete: ${state.outstanding_gates.join(",")}` }, 400);
    }
    const event = {
      asset_key: asset.asset_key,
      course_id: asset.course_id,
      delivery_id: asset.delivery_id,
      screen_id: asset.screen_id,
      placement_status: "placed",
      required: false,
      non_blocking: true,
      autoplay: false,
      recorded_by: body.p_recorded_by,
      recorded_at: new Date().toISOString(),
    };
    store.placementEvents.push(event);
    return json({ placement_event_id: "placement-1", asset_key: asset.asset_key });
  }
  if (table === "rpc/withdraw_video_asset") {
    const asset = store.assets.find((entry) => entry.asset_key === body.p_asset_key);
    if (!asset) return json({ message: "video_asset_not_found" }, 400);
    if (!String(body.p_reason || "").trim()) return json({ message: "video_withdrawal_reason_required" }, 400);
    store.placementEvents.push({
      asset_key: asset.asset_key,
      course_id: asset.course_id,
      delivery_id: asset.delivery_id,
      screen_id: asset.screen_id,
      placement_status: "withdrawn",
      recorded_by: body.p_recorded_by,
      recorded_at: new Date().toISOString(),
    });
    return json({ placement_event_id: "placement-2", asset_key: asset.asset_key });
  }

  throw new Error(`unexpected_rest_request:${method} ${table}${url.search}`);
}

export function getEvent(query = {}, { cookie = STAFF_COOKIE } = {}) {
  return {
    httpMethod: "GET",
    headers: { cookie, referer: "https://statecourse.test/admin/console/" },
    queryStringParameters: query,
  };
}

export function postEvent(body, { cookie = STAFF_COOKIE, origin = "https://statecourse.test" } = {}) {
  return {
    httpMethod: "POST",
    path: "/api/admin/video",
    headers: { cookie, origin, "x-statecourse-action-proof":"a".repeat(43) },
    queryStringParameters: {},
    body: JSON.stringify(body),
  };
}

/** Drive an asset from reserved to release-ready, so a test can start where it means to. */
export async function passAllReviewGates(handler, assetKey) {
  for (const gate of REVIEW_GATES) {
    const response = await handler(postEvent({
      action: "record_gate",
      assetKey,
      gate,
      outcome: "pass",
      note: `Checked ${gate} against the production record on 2026-09-10.`,
    }));
    if (response.statusCode !== 200) {
      throw new Error(`gate ${gate} was refused: ${response.body}`);
    }
  }
}

/** Store and verify the two text equivalents, the step between upload and review. */
export async function completeTextAssets(handler, assetKey) {
  const response = await handler(postEvent({
    action: "upload_text_assets",
    assetKey,
    transcriptText: VALID_TRANSCRIPT,
    captionsVtt: VALID_VTT,
  }));
  if (response.statusCode !== 200) throw new Error(`text assets refused: ${response.body}`);
  return JSON.parse(response.body);
}

