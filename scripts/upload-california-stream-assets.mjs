/**
 * Upload the California document-overview videos to Cloudflare Stream as private assets.
 *
 * These four shipped as public MP4s. Moving them behind signed delivery took the public URLs
 * away; this puts the media where signed delivery can find it. Until it runs, the four screens
 * carry no video — the player says so and course progress is unaffected.
 *
 * Every upload sets requireSignedURLs, so a Stream UID on its own plays nothing: the video is
 * reachable only through a short-lived token this server signs for an authenticated enrollment.
 * The English caption track is attached in the same pass, because a video that arrives without
 * its captions is not deliverable to every student.
 *
 *   CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_STREAM_API_TOKEN=... \
 *     node scripts/upload-california-stream-assets.mjs [--dry-run]
 *
 * It prints the CLOUDFLARE_STREAM_VIDEO_MAP JSON to set in Netlify (Functions scope, secret).
 * Re-running is safe: an asset whose UID is already in the map is skipped unless --force is set.
 * The token is read from the environment and never written to disk or echoed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STREAM_MEDIA } from "../config/stream-media.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.cloudflare.com/client/v4";
const MEDIA_DIR = "private-media/california";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set. Export it for this command only; do not commit it.`);
    process.exit(2);
  }
  return value;
}

const assets = Object.values(STREAM_MEDIA).filter((asset) => asset.assetKey.startsWith("ca-"));

function existingMap() {
  const raw = process.env.CLOUDFLARE_STREAM_VIDEO_MAP;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    console.error("CLOUDFLARE_STREAM_VIDEO_MAP is set but is not valid JSON; refusing to guess.");
    process.exit(2);
  }
}

async function cloudflare(accountId, token, endpoint, init = {}) {
  const response = await fetch(`${API}/accounts/${accountId}/${endpoint}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const detail = (payload.errors || []).map((error) => error.message).join("; ");
    throw new Error(`${endpoint} failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }
  return payload.result;
}

async function uploadOne(accountId, token, asset) {
  const mp4 = path.join(root, MEDIA_DIR, `${asset.assetKey}.mp4`);
  const vtt = path.join(root, MEDIA_DIR, `${asset.assetKey}.vtt`);
  for (const file of [mp4, vtt]) {
    if (!fs.existsSync(file)) throw new Error(`missing ${path.relative(root, file)}`);
  }

  const form = new FormData();
  form.set("file", new Blob([fs.readFileSync(mp4)], { type: "video/mp4" }), `${asset.assetKey}.mp4`);
  form.set("requireSignedURLs", "true");
  form.set("meta", JSON.stringify({
    name: asset.assetKey,
    assetKey: asset.assetKey,
    courseId: asset.courseId,
    deliveryId: asset.deliveryId,
    screenId: asset.screenId,
  }));

  const uploaded = await cloudflare(accountId, token, "stream", { method: "POST", body: form });
  const uid = uploaded?.uid;
  if (!uid) throw new Error(`${asset.assetKey}: Cloudflare returned no uid`);

  const captions = new FormData();
  captions.set("file", new Blob([fs.readFileSync(vtt)], { type: "text/vtt" }), `${asset.assetKey}.vtt`);
  await cloudflare(accountId, token, `stream/${uid}/captions/en`, { method: "POST", body: captions });

  /* requireSignedURLs is the whole point of the move; a silent default would republish the
     lesson under a different URL, so confirm what Cloudflare actually stored. */
  const stored = await cloudflare(accountId, token, `stream/${uid}`);
  if (stored?.requireSignedURLs !== true) {
    throw new Error(`${asset.assetKey}: uploaded as ${uid} but requireSignedURLs is not set — delete it and retry`);
  }
  return uid;
}

async function main() {
  const accountId = requiredEnvironment("CLOUDFLARE_ACCOUNT_ID");
  const token = requiredEnvironment("CLOUDFLARE_STREAM_API_TOKEN");
  const map = existingMap();

  if (dryRun) {
    for (const asset of assets) {
      const mp4 = path.join(root, MEDIA_DIR, `${asset.assetKey}.mp4`);
      const size = fs.existsSync(mp4) ? `${(fs.statSync(mp4).size / 1e6).toFixed(1)} MB` : "MISSING";
      console.log(`${asset.assetKey.padEnd(30)} ${size.padStart(10)}  ${map[asset.assetKey] ? "already mapped" : "would upload"}`);
    }
    return;
  }

  const failures = [];
  for (const asset of assets) {
    if (map[asset.assetKey] && !force) {
      console.log(`${asset.assetKey}: already mapped, skipping (--force to re-upload)`);
      continue;
    }
    try {
      process.stdout.write(`${asset.assetKey}: uploading… `);
      map[asset.assetKey] = await uploadOne(accountId, token, asset);
      console.log(`done (${map[asset.assetKey]})`);
    } catch (error) {
      console.log("FAILED");
      console.error(`  ${error.message}`);
      failures.push(asset.assetKey);
    }
  }

  console.log("\nSet CLOUDFLARE_STREAM_VIDEO_MAP in Netlify (Functions scope, secret) to:\n");
  console.log(JSON.stringify(map));
  if (failures.length) {
    console.error(`\n${failures.length} asset(s) failed: ${failures.join(", ")}. The map above omits them.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
