import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateKeyPairSync, webcrypto } from "node:crypto";
import { parseSigningJwk, requireStreamSameOrigin, signStreamToken } from "../netlify/functions/_lib/stream-delivery.mjs";
import { STREAM_MEDIA, streamMedia } from "../config/stream-media.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

test("Stream allowlist binds every private asset to one course, delivery and screen", () => {
  assert.ok(Object.keys(STREAM_MEDIA).length >= 2);
  for (const [key, item] of Object.entries(STREAM_MEDIA)) {
    assert.equal(streamMedia(key), item);
    assert.equal(item.assetKey, key);
    assert.match(item.courseId, /^[a-z0-9-]+$/);
    assert.match(item.deliveryId, /^[a-z0-9-]+$/);
    assert.match(item.screenId, /^[a-z0-9-]+$/);
    assert.ok(item.durationSeconds > 0);
    assert.ok(fs.statSync(path.join(root, item.transcriptFile)).size > 0);
  }
  assert.equal(streamMedia("not-allowlisted"), null);
});

test("Stream token signer emits an RS256 JWT with the bound UID, key id and expiry", async () => {
  if (!globalThis.crypto) globalThis.crypto = webcrypto;
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = privateKey.export({ format: "jwk" });
  const uid = "a".repeat(32);
  const keyId = "b".repeat(32);
  const expiry = 2_000_000_000;
  const token = await signStreamToken(uid, keyId, JSON.stringify(jwk), expiry);
  const [header, payload, signature] = token.split(".");
  assert.deepEqual(JSON.parse(Buffer.from(header, "base64url").toString("utf8")), { alg: "RS256", kid: keyId });
  assert.deepEqual(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")), { sub: uid, kid: keyId, exp: expiry });
  assert.ok(signature.length > 100);
  assert.equal(parseSigningJwk(Buffer.from(JSON.stringify(jwk)).toString("base64")).kty, "RSA");
});

test("production routes, CSP and protected transcript packaging are present", () => {
  const netlify = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
  assert.match(netlify, /from = "\/api\/stream\/playback"/);
  assert.match(netlify, /from = "\/api\/stream\/events"/);
  assert.match(netlify, /from = "\/api\/stream\/transcript"/);
  assert.match(netlify, /frame-src https:\/\/\*\.cloudflarestream\.com/);
  assert.match(netlify, /script-src 'self' https:\/\/embed\.cloudflarestream\.com/);
  assert.match(netlify, /included_files = \["private-media\/texas\/\*\.txt"\]/);
});

test("Stream endpoints reject cross-site requests before releasing protected media", () => {
  const previous = process.env.STATECOURSE_BASE_URL;
  process.env.STATECOURSE_BASE_URL = "https://statecourse.com";
  try {
    assert.doesNotThrow(() => requireStreamSameOrigin({ headers: { origin: "https://statecourse.com", "sec-fetch-site": "same-origin" } }));
    assert.doesNotThrow(() => requireStreamSameOrigin({ headers: { referer: "https://statecourse.com/student/course/" } }, { allowGet: true }));
    assert.throws(() => requireStreamSameOrigin({ headers: { origin: "https://example.com", "sec-fetch-site": "cross-site" } }), /origin_not_allowed/);
    assert.throws(() => requireStreamSameOrigin({ headers: {} }, { allowGet: true }), /origin_not_allowed/);
  } finally {
    if (previous === undefined) delete process.env.STATECOURSE_BASE_URL;
    else process.env.STATECOURSE_BASE_URL = previous;
  }
});

test("the evidence migration is append-only, deduplicated and cannot award course credit", () => {
  const sql = fs.readFileSync(path.join(root, "database/018_cloudflare_stream_delivery.sql"), "utf8");
  assert.match(sql, /create table if not exists video_token_issues/i);
  assert.match(sql, /create table if not exists video_playback_events/i);
  assert.match(sql, /'tx-law-of-agency-30-v1','TX'[\s\S]*'submission_draft',false/i);
  assert.match(sql, /unique\(enrollment_id, asset_key, playback_session_id, client_sequence\)/i);
  assert.match(sql, /alter table video_token_issues enable row level security/i);
  assert.match(sql, /alter table video_playback_events enable row level security/i);
  assert.match(sql, /revoke all on table video_token_issues from anon, authenticated/i);
  assert.match(sql, /revoke all on table video_playback_events from anon, authenticated/i);
  assert.doesNotMatch(sql, /update\s+lms_assignment_state|insert\s+into\s+course_final_eligibility/i);
});
