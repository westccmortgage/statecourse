import assert from "node:assert/strict";
import test from "node:test";

import { authorizeStreamMedia, issuePlayback } from "../netlify/functions/_lib/stream-delivery.mjs";

/*
 * Does a video released through the console actually reach a student, and does the existing
 * route still work?
 *
 * Two registries now describe delivery. The reviewed Texas videos are in
 * config/stream-media.mjs with their UIDs in CLOUDFLARE_STREAM_VIDEO_MAP; anything released
 * through the console is in the database with its UID alongside it. These assertions are
 * about the second one working and the first one being untouched — a console that broke
 * playback for the videos already in front of students would be a net loss whatever else it
 * did.
 */

const STUDENT_ID = "33333333-3333-4333-8333-333333333333";
const ENROLLMENT_ID = "44444444-4444-4444-8444-444444444444";
const CONSOLE_ASSET = "tx-non-fiduciary-duties";
const CODE_ASSET = "tx-iabs-1-2-document-overview";
const CONSOLE_UID = "abcdef0123456789abcdef0123456789";
const CODE_UID = "2eb5b2e307c5e54b60e5aaa506951dd4";
const KEY_ID = "1234567890abcdef1234567890abcdef";

const ENV_KEYS = [
  "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "STATECOURSE_BASE_URL",
  "CLOUDFLARE_STREAM_VIDEO_MAP", "CLOUDFLARE_STREAM_CUSTOMER_CODE",
  "CLOUDFLARE_STREAM_KEY_ID", "CLOUDFLARE_STREAM_SIGNING_JWK",
];

function json(data, status = 200) {
  return new Response(data === null ? "" : JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

let signingJwk = null;
async function signingKey() {
  if (signingJwk) return signingJwk;
  const pair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
  signingJwk = JSON.stringify(await crypto.subtle.exportKey("jwk", pair.privateKey));
  return signingJwk;
}

async function withDelivery({ consoleRows = [], consoleUnavailable = false }, action) {
  const originalFetch = globalThis.fetch;
  const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  const writes = [];

  process.env.SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
  process.env.STATECOURSE_BASE_URL = "https://statecourse.test";
  process.env.CLOUDFLARE_STREAM_VIDEO_MAP = JSON.stringify({ [CODE_ASSET]: CODE_UID });
  process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE = "abc123";
  process.env.CLOUDFLARE_STREAM_KEY_ID = KEY_ID;
  process.env.CLOUDFLARE_STREAM_SIGNING_JWK = await signingKey();

  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const table = url.pathname.replace("/rest/v1/", "");
    const method = (init.method || "GET").toUpperCase();
    if (method !== "GET") writes.push({ table, body: init.body ? JSON.parse(init.body) : null });

    if (table.startsWith("console_video_delivery")) {
      if (consoleUnavailable) throw new Error("connection reset");
      const wanted = url.searchParams.get("asset_key")?.replace("eq.", "");
      return json(consoleRows.filter((row) => row.asset_key === wanted));
    }
    if (table.startsWith("enrollments")) {
      return json([{
        id: ENROLLMENT_ID,
        student_id: STUDENT_ID,
        course_id: "tx-law-of-agency-30-v1",
        status: "active",
        expires_at: null,
        compliance_credit_eligible: false,
      }]);
    }
    if (table.startsWith("access_grants")) return json([{ id: "grant-1" }]);
    if (table.startsWith("course_review_access")) return json([]);
    if (table.startsWith("video_token_issues")) return json(null);
    throw new Error(`unexpected_request:${method} ${table}`);
  };

  try {
    return await action(writes);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  }
}

const consoleRow = {
  asset_key: CONSOLE_ASSET,
  course_id: "tx-law-of-agency-30-v1",
  delivery_id: "module-03",
  screen_id: "t03u1-s1",
  label: "Optional video: non-fiduciary duties",
  duration_seconds: "200.400",
  transcript_path: "private-media/texas/tx-non-fiduciary-duties.txt",
  stream_uid: CONSOLE_UID,
};

test("a console-released asset is delivered, with no environment variable to edit", { concurrency: false }, async () => {
  await withDelivery({ consoleRows: [consoleRow] }, async () => {
    const access = await authorizeStreamMedia(STUDENT_ID, ENROLLMENT_ID, CONSOLE_ASSET);
    assert.equal(access.media.source, "admin_console");
    assert.equal(access.media.streamUid, CONSOLE_UID);
    assert.equal(access.media.screenId, "t03u1-s1");
    assert.equal(access.actorMode, "student");
    /* CLOUDFLARE_STREAM_VIDEO_MAP does not mention this asset and does not have to. */
    assert.equal(Object.hasOwn(JSON.parse(process.env.CLOUDFLARE_STREAM_VIDEO_MAP), CONSOLE_ASSET), false);
  });
});

test("the signed player URL is issued against the console's own UID", { concurrency: false }, async () => {
  await withDelivery({ consoleRows: [consoleRow] }, async (writes) => {
    const payload = await issuePlayback({
      auth: { student: { id: STUDENT_ID } },
      enrollmentId: ENROLLMENT_ID,
      assetKey: CONSOLE_ASSET,
    });
    assert.match(payload.iframeUrl, /^https:\/\/customer-abc123\.cloudflarestream\.com\//);
    const token = payload.iframeUrl.split("/")[3];
    const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    assert.equal(claims.sub, CONSOLE_UID);
    /* The issue is recorded as evidence that authorization was checked before release. */
    const issue = writes.find((write) => write.table.startsWith("video_token_issues"));
    assert.equal(issue.body.asset_key, CONSOLE_ASSET);
    assert.equal(issue.body.screen_id, "t03u1-s1");
  });
});

test("an asset the console has not placed is not delivered by the console route", { concurrency: false }, async () => {
  await withDelivery({ consoleRows: [] }, async () => {
    await assert.rejects(
      authorizeStreamMedia(STUDENT_ID, ENROLLMENT_ID, CONSOLE_ASSET),
      (error) => error.message === "unknown_stream_asset" && error.statusCode === 404,
    );
  });
});

test("the videos already in front of students still resolve from the code registry", { concurrency: false }, async () => {
  await withDelivery({ consoleRows: [] }, async () => {
    const access = await authorizeStreamMedia(STUDENT_ID, ENROLLMENT_ID, CODE_ASSET);
    assert.equal(access.media.source, "code_registry");
    assert.equal(access.media.streamUid, null);
    const payload = await issuePlayback({
      auth: { student: { id: STUDENT_ID } },
      enrollmentId: ENROLLMENT_ID,
      assetKey: CODE_ASSET,
    });
    const claims = JSON.parse(Buffer.from(payload.iframeUrl.split("/")[3].split(".")[1], "base64url").toString("utf8"));
    assert.equal(claims.sub, CODE_UID);
  });
});

test("a console lookup that fails falls back to the code registry rather than going dark", { concurrency: false }, async () => {
  await withDelivery({ consoleUnavailable: true }, async () => {
    const access = await authorizeStreamMedia(STUDENT_ID, ENROLLMENT_ID, CODE_ASSET);
    assert.equal(access.media.source, "code_registry");
  });
});

test("a console asset bound to a different course is still refused for this enrollment", { concurrency: false }, async () => {
  await withDelivery({
    consoleRows: [{ ...consoleRow, course_id: "mi-salesperson-prelicensure-40-v1" }],
  }, async () => {
    await assert.rejects(
      authorizeStreamMedia(STUDENT_ID, ENROLLMENT_ID, CONSOLE_ASSET),
      (error) => error.message === "video_course_access_denied" && error.statusCode === 403,
    );
  });
});
