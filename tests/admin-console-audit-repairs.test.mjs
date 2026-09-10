import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { handler as videoHandler } from "../netlify/functions/admin-video.mjs";
import { handler as catalogHandler } from "../netlify/functions/admin-catalog.mjs";
import { requireStaff } from "../netlify/functions/_lib/staff-session.mjs";
import { readProtectedTranscript } from "../netlify/functions/_lib/stream-delivery.mjs";
import {
  applyConsoleVideos, consoleVideosForDelivery, displayDuration,
} from "../netlify/functions/_lib/console-video-overlay.mjs";
import { parseWebVtt } from "../netlify/functions/_lib/video-console.mjs";
import { MODULE_3_BLOCKS } from "../config/texas/law-of-agency-module-3-blocks.mjs";
import {
  COURSE_ID, DELIVERY_ID, ENROLLMENT_ID, SCREEN_ID, STAFF_ID, VALID_TRANSCRIPT, VALID_VTT,
  completeTextAssets, createStore, getEvent, passAllReviewGates, postEvent, withConsoleMock,
} from "./fixtures/admin-console/harness.mjs";

/*
 * Six defects an independent audit found in the first console migration, each with the
 * behaviour that used to happen and the behaviour that happens now.
 *
 * The tests are written from the failure. "Placement appears in the lesson" is not a
 * useful assertion on its own; "a placed asset reaches the student payload with no block
 * map edited, and leaves it again when withdrawn" is, because that is the sentence the
 * audit found to be untrue.
 */

const ASSET = "tx-non-fiduciary-duties";
const reserve = {
  action: "reserve_upload",
  assetKey: ASSET,
  courseId: COURSE_ID,
  deliveryId: DELIVERY_ID,
  screenId: SCREEN_ID,
  label: "Optional video: non-fiduciary duties",
  durationSeconds: 200,
  transcriptPath: "private-media/texas/tx-non-fiduciary-duties.txt",
  captionsPath: "private-media/texas/tx-non-fiduciary-duties.vtt",
};

async function drivenToPlaced(store) {
  assert.equal((await videoHandler(postEvent(reserve))).statusCode, 200);
  assert.equal((await videoHandler(postEvent({
    action: "confirm_upload", assetKey: ASSET, sourceSha256: "b".repeat(64),
  }))).statusCode, 200);
  await completeTextAssets(videoHandler, ASSET);
  await passAllReviewGates(videoHandler, ASSET);
  const placed = await videoHandler(postEvent({ action: "place", assetKey: ASSET }));
  assert.equal(placed.statusCode, 200, placed.body);
}

/* ── 1 · the placed video never reached the lesson ─────────────────────────────────────── */

test("a database placement reaches the student payload with no block map edited", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    /* The screen carries no video in the block map. Before the overlay existed, that was
       the end of it: the asset was authorised for playback and appeared nowhere. */
    const before = MODULE_3_BLOCKS.blocks.flatMap((b) => b.screens).find((s) => s.id === SCREEN_ID);
    assert.equal(before.videos ?? null, null, "fixture screen should start with no block-map video");

    await drivenToPlaced(store);

    const overlay = await consoleVideosForDelivery(COURSE_ID, DELIVERY_ID);
    const payload = applyConsoleVideos(MODULE_3_BLOCKS.blocks, overlay);
    const screen = payload.flatMap((b) => b.screens).find((s) => s.id === SCREEN_ID);

    assert.equal(screen.videos.length, 1);
    assert.equal(screen.videos[0].provider, "cloudflare-stream");
    assert.equal(screen.videos[0].assetKey, ASSET);
    assert.equal(screen.videos[0].duration, "3:20");
    /* The three conditions that are data, asserted on what the student is handed. */
    assert.equal(screen.videos[0].required, false);
    assert.equal(screen.videos[0].nonBlocking, true);
    assert.equal(screen.videos[0].autoplay, false);
    /* The source block map is untouched — the overlay copies rather than mutates. */
    assert.equal(before.videos ?? null, null);
  });
});

test("withdrawal removes the video from the very next payload", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await drivenToPlaced(store);
    assert.equal((await consoleVideosForDelivery(COURSE_ID, DELIVERY_ID)).size, 1);

    await videoHandler(postEvent({
      action: "withdraw", assetKey: ASSET,
      reason: "TREC comment questions the intermediary example at 01:20.",
    }));

    const overlay = await consoleVideosForDelivery(COURSE_ID, DELIVERY_ID);
    assert.equal(overlay.size, 0);
    const screen = applyConsoleVideos(MODULE_3_BLOCKS.blocks, overlay)
      .flatMap((b) => b.screens).find((s) => s.id === SCREEN_ID);
    assert.equal(screen.videos ?? null, null);
  });
});

test("a later failing gate removes the video without anyone withdrawing it", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await drivenToPlaced(store);
    assert.equal((await consoleVideosForDelivery(COURSE_ID, DELIVERY_ID)).size, 1);

    await videoHandler(postEvent({
      action: "record_gate", assetKey: ASSET, gate: "visual_fidelity_review", outcome: "fail",
      note: "The IABS form is illegible at the 00:42 crop after the re-render.",
    }));

    /* Readiness is derived, so the delivery view stops listing it. The placement row is
       still 'placed'; eligibility is what changed. */
    assert.equal((await consoleVideosForDelivery(COURSE_ID, DELIVERY_ID)).size, 0);
    assert.equal(store.placementEvents.at(-1).placement_status, "placed");
  });
});

test("a delivery lookup that fails serves the block map instead of failing the lesson", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const working = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (String(input).includes("console_video_delivery")) throw new Error("connection reset");
      return working(input, init);
    };
    const overlay = await consoleVideosForDelivery(COURSE_ID, DELIVERY_ID);
    assert.equal(overlay.size, 0);
    assert.deepEqual(applyConsoleVideos(MODULE_3_BLOCKS.blocks, overlay), MODULE_3_BLOCKS.blocks);
  });
});

test("durations are rendered in the form the player and the block maps already use", { concurrency: false }, () => {
  assert.equal(displayDuration(200), "3:20");
  assert.equal(displayDuration(194.73), "3:15");
  assert.equal(displayDuration(9), "0:09");
  assert.equal(displayDuration(0), "0:00");
});

/* ── 2 · a written note stood in for a caption file ────────────────────────────────────── */

test("captions and the transcript can no longer be passed by writing a note", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await videoHandler(postEvent(reserve));
    await videoHandler(postEvent({ action: "confirm_upload", assetKey: ASSET }));
    for (const gate of ["shipping_captions", "protected_transcript"]) {
      const response = await videoHandler(postEvent({
        action: "record_gate", assetKey: ASSET, gate, outcome: "pass",
        note: "I checked and the file is definitely there, trust me.",
      }));
      assert.equal(response.statusCode, 409);
      assert.equal(JSON.parse(response.body).error, "gate_is_recorded_from_the_stream_api");
    }
  });
});

test("release-ready is unreachable without the two text equivalents", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await videoHandler(postEvent(reserve));
    await videoHandler(postEvent({ action: "confirm_upload", assetKey: ASSET }));
    await passAllReviewGates(videoHandler, ASSET);
    const response = await videoHandler(postEvent({ action: "place", assetKey: ASSET }));
    assert.equal(response.statusCode, 409);
    assert.deepEqual(
      [...JSON.parse(response.body).detail.outstandingGates].sort(),
      ["protected_transcript", "shipping_captions"],
    );
  });
});

test("the caption track is proved by reading it back from Cloudflare, not by a 200", { concurrency: false }, async () => {
  const store = createStore();
  /* Cloudflare accepts the upload and stores something else. The old design could not
     have noticed; nothing ever read the track back. */
  store.captionUploadCorrupts = true;
  await withConsoleMock(store, async () => {
    await videoHandler(postEvent(reserve));
    await videoHandler(postEvent({ action: "confirm_upload", assetKey: ASSET }));
    const body = JSON.parse((await videoHandler(postEvent({
      action: "upload_text_assets", assetKey: ASSET,
      transcriptText: VALID_TRANSCRIPT, captionsVtt: VALID_VTT,
    }))).body);
    assert.equal(body.captionsVerified, false);
    assert.equal(body.gatesRecorded.find((g) => g.gate === "shipping_captions").outcome, "fail");
    assert.equal(store.assets[0].captions_verified_at, null);
  });
});

test("a transcript pasted into the caption box is refused as captions", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await videoHandler(postEvent(reserve));
    await videoHandler(postEvent({ action: "confirm_upload", assetKey: ASSET }));
    const response = await videoHandler(postEvent({
      action: "upload_text_assets", assetKey: ASSET,
      transcriptText: VALID_TRANSCRIPT, captionsVtt: VALID_TRANSCRIPT,
    }));
    assert.equal(response.statusCode, 400);
    assert.equal(JSON.parse(response.body).error, "captions_not_webvtt");
  });
});

test("a placeholder transcript is refused as an equivalent", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await videoHandler(postEvent(reserve));
    await videoHandler(postEvent({ action: "confirm_upload", assetKey: ASSET }));
    const response = await videoHandler(postEvent({
      action: "upload_text_assets", assetKey: ASSET,
      transcriptText: "See the video.", captionsVtt: VALID_VTT,
    }));
    assert.equal(response.statusCode, 400);
    assert.equal(JSON.parse(response.body).error, "transcript_too_short_to_be_an_equivalent");
  });
});

test("WebVTT validation catches the three ways this field is filled in wrongly", { concurrency: false }, () => {
  assert.equal(parseWebVtt("").reason, "captions_empty");
  assert.equal(parseWebVtt("Just some prose about the video.").reason, "captions_not_webvtt");
  assert.equal(parseWebVtt("WEBVTT\n\nno timings here").reason, "captions_have_no_cues");
  assert.equal(parseWebVtt(VALID_VTT).ok, true);
  assert.equal(parseWebVtt(VALID_VTT).cueCount, 2);
});

test("the stored transcript is what the student's transcript endpoint serves", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await drivenToPlaced(store);
    const served = await readProtectedTranscript({
      auth: { student: { id: STAFF_ID } },
      enrollmentId: ENROLLMENT_ID,
      assetKey: ASSET,
    });
    assert.equal(served, VALID_TRANSCRIPT.replace(/\r\n/g, "\n").trim());
  });
});

/* ── 3 · a console asset silently took over an occupied screen ─────────────────────────── */

test("reserving onto a screen a block map already fills is refused", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    /* t02u5-s1 carries tx-iabs-1-2-document-overview in the code registry. */
    const response = await videoHandler(postEvent({
      ...reserve, assetKey: "tx-iabs-replacement", deliveryId: "module-02", screenId: "t02u5-s1",
    }));
    assert.equal(response.statusCode, 409);
    const body = JSON.parse(response.body);
    assert.equal(body.error, "screen_already_carries_video");
    assert.deepEqual(body.detail.occupants, [
      { assetKey: "tx-iabs-1-2-document-overview", source: "code_registry" },
    ]);
    assert.equal(store.assets.length, 0);
  });
});

test("a replacement is accepted when it names what it displaces and why", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const response = await videoHandler(postEvent({
      ...reserve,
      assetKey: "tx-iabs-replacement",
      deliveryId: "module-02",
      screenId: "t02u5-s1",
      replacesAssetKey: "tx-iabs-1-2-document-overview",
      replacementReason: "Re-render corrects the subsection cited at 00:58.",
    }));
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(store.replacements.length, 1);
    assert.equal(store.replacements[0].replaced_asset_key, "tx-iabs-1-2-document-overview");
    assert.equal(store.replacements[0].replaced_source, "code_registry");
    assert.equal(store.replacements[0].recorded_by, STAFF_ID);
  });
});

test("a replacement naming the wrong asset is refused", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const response = await videoHandler(postEvent({
      ...reserve,
      assetKey: "tx-iabs-replacement",
      deliveryId: "module-02",
      screenId: "t02u5-s1",
      replacesAssetKey: "some-other-video",
      replacementReason: "Re-render corrects the subsection cited at 00:58.",
    }));
    assert.equal(response.statusCode, 409);
    assert.equal(store.replacements.length, 0);
  });
});

/* ── 4 · another state's screen structure through the query string ─────────────────────── */

test("a state-scoped viewer cannot read another state's screens by editing course_id", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings[0] = { ...store.bindings[0], actor_role: "regulator_reviewer", scope_state: "MI" };
  await withConsoleMock(store, async () => {
    const response = await videoHandler(getEvent({ course_id: COURSE_ID }));
    assert.equal(response.statusCode, 403);
    assert.equal(JSON.parse(response.body).error, "course_outside_staff_scope");
  });
});

test("an unscoped viewer still gets the screen structure", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async () => {
    const body = JSON.parse((await videoHandler(getEvent({ course_id: COURSE_ID }))).body);
    const unit = body.placementTargets.find((t) => t.deliveryId === DELIVERY_ID);
    assert.ok(unit.instructionScreens.length > 0);
    assert.ok(body.placeableCourses.includes(COURSE_ID));
  });
});

/* ── 5 · a second state scope silently replaced the first ──────────────────────────────── */

test("one role holds two state scopes at once", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings = [
    { auth_user_id: STAFF_ID, actor_role: "regulator_reviewer", scope_state: "TX",
      binding_status: "active", effective_at: "2026-01-01T00:00:00.000Z", expires_at: null,
      recorded_at: "2026-01-01T00:00:00.000Z" },
    /* Granted later. Under the old key this replaced Texas outright and nobody was told. */
    { auth_user_id: STAFF_ID, actor_role: "regulator_reviewer", scope_state: "MI",
      binding_status: "active", effective_at: "2026-02-01T00:00:00.000Z", expires_at: null,
      recorded_at: "2026-02-01T00:00:00.000Z" },
  ];
  await withConsoleMock(store, async () => {
    const staff = await requireStaff(getEvent(), ["regulator_reviewer"]);
    assert.deepEqual([...staff.scopeStates].sort(), ["MI", "TX"]);
    const body = JSON.parse((await catalogHandler(getEvent())).body);
    assert.deepEqual([...body.viewer.scopeStates].sort(), ["MI", "TX"]);
    assert.deepEqual([...new Set(body.rows.map((r) => r.state))].sort(), ["MI", "TX"]);
  });
});

test("revoking one state scope leaves the other standing", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings = [
    { auth_user_id: STAFF_ID, actor_role: "regulator_reviewer", scope_state: "TX",
      binding_status: "active", effective_at: "2026-01-01T00:00:00.000Z", expires_at: null,
      recorded_at: "2026-01-01T00:00:00.000Z" },
    { auth_user_id: STAFF_ID, actor_role: "regulator_reviewer", scope_state: "MI",
      binding_status: "active", effective_at: "2026-02-01T00:00:00.000Z", expires_at: null,
      recorded_at: "2026-02-01T00:00:00.000Z" },
    { auth_user_id: STAFF_ID, actor_role: "regulator_reviewer", scope_state: "MI",
      binding_status: "revoked", effective_at: "2026-03-01T00:00:00.000Z", expires_at: null,
      recorded_at: "2026-03-01T00:00:00.000Z" },
  ];
  await withConsoleMock(store, async () => {
    const staff = await requireStaff(getEvent(), ["regulator_reviewer"]);
    assert.deepEqual(staff.scopeStates, ["TX"]);
  });
});

test("the view keys current bindings on the scope, not only the role", { concurrency: false }, async () => {
  const sql = await readFile(new URL("../database/020_admin_console_audit_repairs.sql", import.meta.url), "utf8");
  assert.match(sql, /distinct on \(auth_user_id, actor_role, scope_state\)/);
  assert.match(sql, /order by auth_user_id, actor_role, scope_state, recorded_at desc, id desc/);
});

/* ── 6 · a Cloudflare upload nothing could account for ─────────────────────────────────── */

test("the asset row is written before Cloudflare is called, so nothing is orphaned", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async (calls) => {
    await videoHandler(postEvent(reserve));
    const insert = calls.findIndex((c) => c.url.pathname === "/rest/v1/video_assets" && c.method === "POST");
    const cloudflare = calls.findIndex((c) => c.url.pathname.endsWith("/direct_upload"));
    assert.ok(insert >= 0 && cloudflare >= 0);
    assert.ok(insert < cloudflare, "the row must exist before the upload is reserved");
    /* The id that lets a lost upload find its way home travels with it. */
    assert.match(store.lastDirectUpload.meta.reservationId, /^[0-9a-f-]{36}$/);
    assert.equal(store.assets[0].reservation_id, store.lastDirectUpload.meta.reservationId);
  });
});

test("a reservation that failed at Cloudflare can be retried under the same key", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const working = globalThis.fetch;
    let fail = true;
    globalThis.fetch = async (input, init) => {
      if (fail && String(input).includes("/direct_upload")) throw new Error("cloudflare unreachable");
      return working(input, init);
    };
    await assert.rejects(async () => {
      const first = await videoHandler(postEvent(reserve));
      if (first.statusCode !== 200) throw new Error(first.body);
    });
    assert.equal(store.assets.length, 1);
    assert.equal(store.assets[0].stream_upload_id ?? null, null);

    fail = false;
    const retry = await videoHandler(postEvent(reserve));
    assert.equal(retry.statusCode, 200, retry.body);
    assert.equal(store.assets.length, 1, "the retry reuses the incomplete row rather than adding one");
    assert.ok(store.assets[0].stream_upload_id);
  });
});

test("reconciliation repairs an upload whose id was never recorded", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await videoHandler(postEvent(reserve));
    const reservationId = store.assets[0].reservation_id;
    /* The crash case: Cloudflare has the video, StateCourse lost the id. */
    store.assets[0].stream_upload_id = null;
    store.cloudflare.library = [{ uid: "1".repeat(32), meta: { reservationId }, size: 100, created: "2026-09-10" }];

    const body = JSON.parse((await videoHandler(postEvent({ action: "reconcile_uploads" }))).body);
    assert.deepEqual(body.repaired, [{ assetKey: ASSET, uid: "1".repeat(32) }]);
    assert.equal(body.orphans.length, 0);
    assert.equal(store.assets[0].stream_upload_id, "1".repeat(32));
  });
});

test("a Cloudflare video matching no row is reported and never deleted", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async (calls) => {
    store.cloudflare.library = [{ uid: "2".repeat(32), meta: {}, size: 5_000, created: "2026-09-01" }];
    const body = JSON.parse((await videoHandler(postEvent({ action: "reconcile_uploads" }))).body);
    assert.equal(body.orphans.length, 1);
    assert.equal(body.orphans[0].uid, "2".repeat(32));
    assert.equal(body.orphans[0].reason, "no reservation id in metadata");
    assert.equal(calls.some((c) => c.method === "DELETE"), false, "reconciliation must not delete");
  });
});
