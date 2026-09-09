import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { generateModuleBlocks } from "../scripts/lib/generate-tx-block-maps.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const playerSource = fs.readFileSync(path.join(repoRoot, "public/statecourse/student/course/blocks/block-player.js"), "utf8");
const componentSource = fs.readFileSync(path.join(repoRoot, "public/statecourse/student/course/blocks/course-video.mjs"), "utf8");

function makeFixture({ screenId = "t01u1-s1", mutateEntry, omitAsset } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "statecourse-tx-video-"));
  const curriculumDir = path.join(root, "curriculum");
  const mediaDir = path.join(root, "public/statecourse/media");
  const output = path.join(root, "module-blocks.mjs");
  fs.mkdirSync(curriculumDir, { recursive: true });
  fs.mkdirSync(mediaDir, { recursive: true });
  fs.writeFileSync(path.join(curriculumDir, "module-01.md"), `# Test module

## TREC Topic: Test topic

Front matter.

## Unit: Media unit

Instruction that remains complete without the optional video.

### Applied exercise: Apply the unit

Practice work.

### Module recap

Review.
`);

  const assets = {
    "video.mp4": "mp4 fixture",
    "poster.webp": "poster fixture",
    "captions.vtt": "WEBVTT\n\n00:00.000 --> 00:01.000\nCaption.\n",
    "transcript.txt": "Caption.\n",
  };
  for (const [name, value] of Object.entries(assets)) {
    if (name !== omitAsset) fs.writeFileSync(path.join(mediaDir, name), value);
  }

  const entry = {
    required: false,
    nonBlocking: true,
    noAssessmentContent: true,
    videos: [{
      src: "/media/video.mp4",
      poster: "/media/poster.webp",
      captions: "/media/captions.vtt",
      transcript: "/media/transcript.txt",
      label: "Optional video: reviewed Texas instruction",
      duration: "1:00",
      autoplay: false,
      controls: true,
      keyboardAccessible: true,
      captionsSelectable: true,
      factualQcApproved: true,
      visualQcApproved: true,
      logoSafeReviewed: true,
      accessibilityQcApproved: true,
    }],
  };
  if (mutateEntry) mutateEntry(entry);

  return {
    root,
    output,
    course: {
      root,
      curriculumDir,
      courseId: "tx-video-hook-test",
      unitCodes: ["T01U1"],
      unitObjectives: { T01U1: "Use the reviewed instruction." },
      screenMedia: { [screenId]: entry },
      outFile: () => output,
    },
  };
}

test("Texas media attaches to the exact instruction screen and remains optional", async () => {
  const fixture = makeFixture();
  generateModuleBlocks(fixture.course, 1);
  const delivery = (await import(`${pathToFileURL(fixture.output).href}?test=${Date.now()}`)).default;
  const screens = delivery.blocks.flatMap((block) => block.screens);
  const target = screens.find((screen) => screen.id === "t01u1-s1");
  assert.equal(target.videos.length, 1);
  assert.deepEqual(target.videos[0], {
    src: "/media/video.mp4",
    poster: "/media/poster.webp",
    captions: "/media/captions.vtt",
    transcript: "/media/transcript.txt",
    label: "Optional video: reviewed Texas instruction",
    duration: "1:00",
    required: false,
    nonBlocking: true,
    autoplay: false,
    controls: true,
    keyboardAccessible: true,
    captionsSelectable: true,
  });
  assert.equal(screens.filter((screen) => screen.videos).length, 1);
  assert.equal(screens.find((screen) => screen.id === "t01u1-s3").videos, undefined);
});

test("private Stream media emits no public source URL and remains optional", async () => {
  const fixture = makeFixture({ mutateEntry: (entry) => {
    entry.videos[0] = {
      provider: "cloudflare-stream",
      assetKey: "tx-reviewed-video",
      captionLanguage: "en",
      label: "Optional video: reviewed Texas instruction",
      duration: "1:00",
      autoplay: false,
      controls: true,
      keyboardAccessible: true,
      captionsSelectable: true,
      signedPlaybackRequired: true,
      streamReady: true,
      captionsUploaded: true,
      protectedTranscriptReady: true,
      factualQcApproved: true,
      visualQcApproved: true,
      logoSafeReviewed: true,
      accessibilityQcApproved: true,
    };
  } });
  generateModuleBlocks(fixture.course, 1);
  const delivery = (await import(`${pathToFileURL(fixture.output).href}?stream=${Date.now()}`)).default;
  const video = delivery.blocks.flatMap((block) => block.screens).find((screen) => screen.id === "t01u1-s1").videos[0];
  assert.deepEqual(video, {
    provider: "cloudflare-stream",
    assetKey: "tx-reviewed-video",
    captionLanguage: "en",
    label: "Optional video: reviewed Texas instruction",
    duration: "1:00",
    required: false,
    nonBlocking: true,
    autoplay: false,
    controls: true,
    keyboardAccessible: true,
    captionsSelectable: true,
  });
  assert.equal(video.src, undefined);
});

test("private Stream media refuses public URLs or incomplete protection", () => {
  assert.throws(() => generateModuleBlocks(makeFixture({ mutateEntry: (entry) => {
    Object.assign(entry.videos[0], { provider: "cloudflare-stream", assetKey: "tx-reviewed-video" });
  } }).course, 1), /private signed Stream playback/);
  assert.throws(() => generateModuleBlocks(makeFixture({ mutateEntry: (entry) => {
    Object.assign(entry.videos[0], {
      provider: "cloudflare-stream", assetKey: "tx-reviewed-video", signedPlaybackRequired: true,
      streamReady: true, captionsUploaded: true, captionLanguage: "en", protectedTranscriptReady: true,
    });
  } }).course, 1), /cannot publish src/);
});

test("an unknown or retrieval screen id refuses generation", () => {
  assert.throws(() => generateModuleBlocks(makeFixture({ screenId: "t01u9-s1" }).course, 1), /unknown screen/);
  assert.throws(() => generateModuleBlocks(makeFixture({ screenId: "t01u1-s3" }).course, 1), /cannot attach to retrieval/);
});

test("media can never become required or block progression", () => {
  assert.throws(() => generateModuleBlocks(makeFixture({ mutateEntry: (entry) => { entry.required = true; } }).course, 1), /required:false/);
  assert.throws(() => generateModuleBlocks(makeFixture({ mutateEntry: (entry) => { delete entry.nonBlocking; } }).course, 1), /nonBlocking:true/);
});

test("every video requires an explicit no-assessment review", () => {
  assert.throws(() => generateModuleBlocks(makeFixture({ mutateEntry: (entry) => { delete entry.noAssessmentContent; } }).course, 1), /noAssessmentContent:true/);
});

test("missing MP4, poster, captions or transcript refuses the entire generation", () => {
  for (const asset of ["video.mp4", "poster.webp", "captions.vtt", "transcript.txt"]) {
    const fixture = makeFixture({ omitAsset: asset });
    fs.writeFileSync(fixture.output, "sentinel\n");
    assert.throws(() => generateModuleBlocks(fixture.course, 1), /missing or empty/);
    assert.equal(fs.readFileSync(fixture.output, "utf8"), "sentinel\n", `${asset} failure overwrote the previous map`);
  }
});

test("provisional captions and unmeasured durations cannot ship", () => {
  assert.throws(() => generateModuleBlocks(makeFixture({ mutateEntry: (entry) => { entry.videos[0].captions = "/media/captions.provisional.vtt"; } }).course, 1), /provisional captions/);
  assert.throws(() => generateModuleBlocks(makeFixture({ mutateEntry: (entry) => { entry.videos[0].duration = "about one minute"; } }).course, 1), /measured m:ss/);
});

test("factual, visual, logo-safety and accessibility reviews are mandatory", () => {
  for (const field of ["factualQcApproved", "visualQcApproved", "logoSafeReviewed", "accessibilityQcApproved"]) {
    assert.throws(
      () => generateModuleBlocks(makeFixture({ mutateEntry: (entry) => { delete entry.videos[0][field]; } }).course, 1),
      /missing factual, visual, logo-safety or accessibility approval/,
      field,
    );
  }
});

test("the shared player exposes native controls, captions and an explicit transcript", () => {
  assert.match(playerSource, /<video controls preload="none" playsinline/);
  assert.match(playerSource, /<track kind="captions"/);
  assert.match(playerSource, /data-transcript=/);
  assert.match(playerSource, /video\.transcript \|\| video\.captions/);
  assert.doesNotMatch(playerSource, /video\.autoplay\s*=\s*true/);
});

test("the paid player obtains a signed URL and records playback evidence without gating progress", () => {
  assert.match(playerSource, /provider === "cloudflare-stream"/);
  assert.match(playerSource, /asset-key=/);
  assert.match(componentSource, /\/api\/stream\/playback\?asset=/);
  assert.match(componentSource, /\/api\/stream\/events/);
  assert.match(componentSource, /\/api\/stream\/transcript\?asset=/);
  assert.match(componentSource, /setInterval\(\(\) => send\("heartbeat"\), 15000\)/);
  assert.match(componentSource, /iframe\.src = payload\.iframeUrl/);
  assert.doesNotMatch(componentSource, /iframe\.allow = "[^"]*autoplay;[^\n]*";\s*iframe\.autoplay\s*=\s*true/);
  assert.doesNotMatch(componentSource, /completion|credit.*true/i);
});
