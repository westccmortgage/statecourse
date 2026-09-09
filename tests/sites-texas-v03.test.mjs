import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const module6 = fs.readFileSync(path.join(root, "config/texas/law-of-agency-module-6-blocks.mjs"), "utf8");
const player = fs.readFileSync(path.join(root, "public/statecourse/student/course/blocks/block-player.js"), "utf8");

test("accepted Texas intermediary video ships on its instruction screen", () => {
  assert.match(module6, /t06u3-s1[\s\S]*?8630af57b63d4255a1b51db7bb143398/);
  assert.match(module6, /defaultTextTrack=en/);
  assert.match(module6, /"duration":"3:07"/);
  assert.match(module6, /"required":false,"nonBlocking":true/);
  assert.ok(fs.statSync(path.join(root, "public/statecourse/media/tx-loa-v03-texas-intermediary-brokerage.en.vtt")).size > 0);
  assert.ok(fs.statSync(path.join(root, "public/statecourse/media/tx-loa-v03-texas-intermediary-brokerage.txt")).size > 0);
});

test("the shared player renders hosted Stream video without autoplay and exposes the transcript", () => {
  assert.match(player, /video\.provider === "cloudflare-stream"/);
  assert.match(player, /<iframe/);
  assert.match(player, /loading="lazy"/);
  assert.doesNotMatch(player, /autoplay="(?:true|autoplay)"/);
  assert.match(player, /video\.transcript \|\| video\.captions/);
});
