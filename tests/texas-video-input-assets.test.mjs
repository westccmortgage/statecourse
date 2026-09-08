import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

test("the IABS HeyGen input set is complete, source-locked and 1080p", () => {
  const inputDir = path.join(
    repoRoot,
    "texas/tx-law-of-agency-30-v1/video-production/inputs/iabs-1-2",
  );
  const manifest = JSON.parse(fs.readFileSync(path.join(inputDir, "manifest.json"), "utf8"));
  assert.equal(
    manifest.sourceSha256,
    "5056930b66d237a7a4376db0c43f833929600f0b6e5ce6e42a417da824ef6b20",
  );
  const expected = [
    "iabs-full.png",
    ..."abcdefgh".split("").map((letter) => `iabs-band-${letter}.png`),
  ];
  assert.deepEqual(Object.keys(manifest.assets).sort(), expected.sort());
  for (const filename of expected) {
    assert.deepEqual(manifest.assets[filename].dimensions, [1920, 1080], filename);
    const bytes = fs.readFileSync(path.join(inputDir, filename));
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], filename);
  }
});
