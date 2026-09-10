/*
 * A Supabase and Cloudflare stand-in for the administration console tests.
 *
 * The gate arithmetic is implemented here rather than stubbed, and place_video_asset
 * refuses on the same condition the SQL function does. Otherwise a test proving "placement
 * is refused until every condition passes" would only prove that the mock said no, which is
 * exactly the assertion worth being sure about.
 */

export const STAFF_ID = "11111111-1111-4111-8111-111111111111";
export const OTHER_STAFF_ID = "99999999-9999-4999-8999-999999999999";
export const COURSE_ID = "tx-law-of-agency-30-v1";
export const DELIVERY_ID = "module-03";
export const SCREEN_ID = "t03u1-s1";
export const STREAM_UID = "abcdef0123456789abcdef0123456789";
export const UPLOAD_URL = "https://upload.videodelivery.net/abcdef0123456789abcdef0123456789";

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

export const REVIEW_GATES = Object.freeze(GATE_DEFINITIONS
  .filter((definition) => !["stream_upload", "signed_playback", "origin_restriction"].includes(definition.gate))
  .map((definition) => definition.gate));

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
  process.env.CLOUDFLARE_ACCOUNT_ID = "test-account";
  process.env.CLOUDFLARE_STREAM_API_TOKEN = "test-stream-token";
  delete process.env.CLOUDFLARE_STREAM_ALLOWED_ORIGINS;

  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const body = init.body ? JSON.parse(init.body) : null;
    const method = (init.method || "GET").toUpperCase();
    calls.push({ url, method, body });

    if (url.hostname === "api.cloudflare.com") return cloudflareRoute(store, url, method, body);
    if (url.pathname === "/auth/v1/user") {
      if (init.headers?.authorization !== "Bearer named-session-token") return json({ msg: "bad_jwt" }, 401);
      return json({ id: store.signedInAs || STAFF_ID, email: "owner@statecourse.test", user_metadata: {} });
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

function cloudflareRoute(store, url, method, body) {
  const path = url.pathname.replace("/client/v4/accounts/test-account/stream", "");
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

  if (table === "students") return json(null);
  if (table === "admin_console_actions" && method === "POST") {
    store.consoleActions.push(body);
    return json(null);
  }
  if (table === "current_staff_actor_bindings") {
    const wanted = eqValue(params, "auth_user_id");
    return json(store.bindings.filter((binding) => !wanted || binding.auth_user_id === wanted));
  }
  if (table === "courses") {
    const wanted = eqValue(params, "id");
    return json(store.courses.filter((course) => !wanted || course.id === wanted));
  }
  if (table === "regulatory_course_versions") return json(store.courseVersions);
  if (table === "video_release_gate_definitions") return json(GATE_DEFINITIONS);

  if (table === "video_assets") {
    if (method === "POST") { store.assets.push({ ...body, stream_uid: body.stream_uid ?? null }); return json(null); }
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
      return placement?.placement_status === "placed" && readiness(store, asset.asset_key).release_ready && asset.stream_uid;
    }).map((asset) => ({
      asset_key: asset.asset_key,
      course_id: asset.course_id,
      delivery_id: asset.delivery_id,
      screen_id: asset.screen_id,
      label: asset.label,
      duration_seconds: asset.duration_seconds,
      transcript_path: asset.transcript_path,
      stream_uid: asset.stream_uid,
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

export function getEvent(query = {}, { cookie = "__Host-sc_access=named-session-token" } = {}) {
  return {
    httpMethod: "GET",
    headers: { cookie, referer: "https://statecourse.test/admin/console/" },
    queryStringParameters: query,
  };
}

export function postEvent(body, { cookie = "__Host-sc_access=named-session-token", origin = "https://statecourse.test" } = {}) {
  return {
    httpMethod: "POST",
    headers: { cookie, origin },
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
