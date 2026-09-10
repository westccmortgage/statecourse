import assert from "node:assert/strict";
import test from "node:test";

import { handler as videoHandler } from "../netlify/functions/admin-video.mjs";
import { authorizeStreamMedia } from "../netlify/functions/_lib/stream-delivery.mjs";
import {
  COURSE_ID, DELIVERY_ID, GATE_DEFINITIONS, REVIEW_GATES, SCREEN_ID, STAFF_ID, STREAM_UID,
  UPLOAD_URL, createStore, getEvent, passAllReviewGates, postEvent, withConsoleMock,
} from "./fixtures/admin-console/harness.mjs";

/*
 * Upload, review, placement — driven end to end against a test course.
 *
 * tx-law-of-agency-30-v1 is the right course to exercise this on: it has a course record
 * so private review access can exist, its approval status is submission_draft, and its
 * enrollment is disabled. Nothing here can turn any of that into a release.
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

async function reserveAndConfirm() {
  const reserved = await videoHandler(postEvent(reserve));
  assert.equal(reserved.statusCode, 200, reserved.body);
  const confirmed = await videoHandler(postEvent({
    action: "confirm_upload",
    assetKey: ASSET,
    sourceSha256: "b".repeat(64),
  }));
  assert.equal(confirmed.statusCode, 200, confirmed.body);
  return { reserved: JSON.parse(reserved.body), confirmed: JSON.parse(confirmed.body) };
}

test("reserving an upload never sends the API token to the browser", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async () => {
    const body = JSON.parse((await videoHandler(postEvent(reserve))).body);
    assert.equal(body.uploadUrl, UPLOAD_URL);
    const serialized = JSON.stringify(body);
    assert.equal(serialized.includes("test-stream-token"), false);
    assert.equal(serialized.includes("test-account"), false);
  });
});

test("the reserved upload is private and origin-restricted from the moment it is created", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await videoHandler(postEvent(reserve));
    assert.equal(store.lastDirectUpload.requireSignedURLs, true);
    assert.deepEqual(store.lastDirectUpload.allowedOrigins, ["statecourse.test", "www.statecourse.test"]);
  });
});

test("a placement target that is not an instruction screen is refused before anything is created", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const response = await videoHandler(postEvent({ ...reserve, screenId: "t03u1-s2" }));
    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.match(body.error, /^placement_target_rejected:/);
    assert.equal(store.assets.length, 0);
  });
});

test("a screen id that does not exist is refused, rather than rendering as nothing later", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const response = await videoHandler(postEvent({ ...reserve, screenId: "t03u1-s9999" }));
    assert.equal(response.statusCode, 400);
    assert.equal(JSON.parse(response.body).error, "placement_target_rejected:unknown_screen");
    assert.equal(store.assets.length, 0);
  });
});

test("an unknown delivery unit is refused and the real ones are named", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async () => {
    const response = await videoHandler(postEvent({ ...reserve, deliveryId: "module-99" }));
    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.error, "placement_target_rejected:unknown_delivery_unit");
    assert.ok(body.detail.knownDeliveryIds.includes("module-03"));
  });
});

test("transcript and caption paths must sit under the protected media root", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    for (const path of ["public/leak.txt", "private-media/../public/leak.txt", "/etc/passwd"]) {
      const response = await videoHandler(postEvent({ ...reserve, transcriptPath: path }));
      assert.equal(response.statusCode, 400, `accepted ${path}`);
    }
    assert.equal(store.assets.length, 0);
  });
});

test("the three delivery conditions are recorded from what Cloudflare reports", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const { confirmed } = await reserveAndConfirm();
    assert.equal(confirmed.uploadState, "ready");
    assert.equal(confirmed.streamUid, STREAM_UID);
    assert.deepEqual(confirmed.gatesRecorded, [
      { gate: "stream_upload", outcome: "pass" },
      { gate: "signed_playback", outcome: "pass" },
      { gate: "origin_restriction", outcome: "pass" },
    ]);
    for (const event of store.gateEvents) {
      assert.equal(event.evidence.source, "cloudflare_stream_api");
      assert.equal(event.reviewed_by, STAFF_ID);
    }
  });
});

test("Cloudflare reporting an unsigned or unrestricted video records a failing condition", { concurrency: false }, async () => {
  const store = createStore();
  store.cloudflare.requireSignedURLs = false;
  store.cloudflare.allowedOrigins = [];
  await withConsoleMock(store, async () => {
    const { confirmed } = await reserveAndConfirm();
    assert.deepEqual(confirmed.gatesRecorded, [
      { gate: "stream_upload", outcome: "pass" },
      { gate: "signed_playback", outcome: "fail" },
      { gate: "origin_restriction", outcome: "fail" },
    ]);
  });
});

test("a render whose duration does not match the declared duration is rejected", { concurrency: false }, async () => {
  const store = createStore();
  store.cloudflare.duration = 480;
  await withConsoleMock(store, async () => {
    await videoHandler(postEvent(reserve));
    const response = await videoHandler(postEvent({ action: "confirm_upload", assetKey: ASSET }));
    assert.equal(response.statusCode, 409);
    assert.equal(JSON.parse(response.body).error, "uploaded_duration_does_not_match_declared");
    assert.equal(store.assets[0].stream_uid, null);
  });
});

test("an upload still encoding reports progress and records nothing", { concurrency: false }, async () => {
  const store = createStore();
  store.cloudflare.state = "inprogress";
  await withConsoleMock(store, async () => {
    await videoHandler(postEvent(reserve));
    const body = JSON.parse((await videoHandler(postEvent({ action: "confirm_upload", assetKey: ASSET }))).body);
    assert.equal(body.uploadState, "inprogress");
    assert.deepEqual(body.gatesRecorded, []);
    assert.equal(store.gateEvents.length, 0);
  });
});

test("the delivery conditions cannot be recorded by hand", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await reserveAndConfirm();
    for (const gate of ["stream_upload", "signed_playback", "origin_restriction"]) {
      const response = await videoHandler(postEvent({
        action: "record_gate", assetKey: ASSET, gate, outcome: "pass",
        note: "Asserting this by hand rather than from the API.",
      }));
      assert.equal(response.statusCode, 409);
      assert.equal(JSON.parse(response.body).error, "gate_is_recorded_from_the_stream_api");
    }
  });
});

test("a review cannot be recorded as a bare checkbox", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await reserveAndConfirm();
    const before = store.gateEvents.length;
    for (const note of ["", "ok", "   "]) {
      const response = await videoHandler(postEvent({
        action: "record_gate", assetKey: ASSET, gate: "factual_review", outcome: "pass", note,
      }));
      assert.equal(response.statusCode, 400);
      assert.equal(JSON.parse(response.body).error, "gate_note_required");
    }
    assert.equal(store.gateEvents.length, before);
  });
});

test("placement is refused while any release condition is outstanding, and names them", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await reserveAndConfirm();
    const response = await videoHandler(postEvent({ action: "place", assetKey: ASSET }));
    assert.equal(response.statusCode, 409);
    const body = JSON.parse(response.body);
    assert.equal(body.error, "video_release_gate_incomplete");
    assert.deepEqual([...body.detail.outstandingGates].sort(), [...REVIEW_GATES].sort());
    assert.equal(store.placementEvents.length, 0);
  });
});

test("placement is refused with one review still missing", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await reserveAndConfirm();
    for (const gate of REVIEW_GATES.filter((entry) => entry !== "accessibility_review")) {
      await videoHandler(postEvent({
        action: "record_gate", assetKey: ASSET, gate, outcome: "pass",
        note: `Checked ${gate} against the production record.`,
      }));
    }
    const response = await videoHandler(postEvent({ action: "place", assetKey: ASSET }));
    assert.equal(response.statusCode, 409);
    assert.deepEqual(JSON.parse(response.body).detail.outstandingGates, ["accessibility_review"]);
  });
});

test("a review recorded as a failure withdraws readiness that a later pass had granted", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await reserveAndConfirm();
    await passAllReviewGates(videoHandler, ASSET);
    assert.equal(JSON.parse((await videoHandler(postEvent({ action: "place", assetKey: ASSET }))).body).readiness.release_ready, true);

    /* The visual review is re-opened and fails. Readiness is derived, so nothing has to be
       remembered to undo. */
    await videoHandler(postEvent({
      action: "record_gate", assetKey: ASSET, gate: "visual_fidelity_review", outcome: "fail",
      note: "The IABS form is illegible at the 00:42 crop after the re-render.",
    }));
    const inventory = JSON.parse((await videoHandler(getEvent())).body);
    const asset = inventory.assets.find((entry) => entry.asset_key === ASSET);
    assert.equal(asset.readiness.release_ready, false);
    assert.deepEqual(asset.readiness.outstanding_gates, ["visual_fidelity_review"]);
  });
});

test("the whole chain: reserve, confirm, review, place, and only then does delivery see it", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await reserveAndConfirm();

    /* Before placement the delivery path finds nothing in the console registry, so an asset
       under review is not reachable by an enrolled student. */
    await assert.rejects(
      authorizeStreamMedia(STAFF_ID, "44444444-4444-4444-8444-444444444444", ASSET),
      (error) => error.message === "unknown_stream_asset" && error.statusCode === 404,
    );

    await passAllReviewGates(videoHandler, ASSET);
    const placed = await videoHandler(postEvent({ action: "place", assetKey: ASSET }));
    assert.equal(placed.statusCode, 200, placed.body);
    const body = JSON.parse(placed.body);
    assert.equal(body.grantsApproval, false);
    assert.equal(body.readiness.release_ready, true);

    const event = store.placementEvents.at(-1);
    assert.equal(event.placement_status, "placed");
    assert.equal(event.recorded_by, STAFF_ID);
    /* The three parts of the tenth release condition that are data, not judgement. */
    assert.equal(event.required, false);
    assert.equal(event.non_blocking, true);
    assert.equal(event.autoplay, false);

    const inventory = JSON.parse((await videoHandler(getEvent())).body);
    assert.equal(inventory.assets.find((entry) => entry.asset_key === ASSET).stage, "placed");
  });
});

test("withdrawal needs a stated reason and removes the video from delivery", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await reserveAndConfirm();
    await passAllReviewGates(videoHandler, ASSET);
    await videoHandler(postEvent({ action: "place", assetKey: ASSET }));

    const bare = await videoHandler(postEvent({ action: "withdraw", assetKey: ASSET, reason: "no" }));
    assert.equal(bare.statusCode, 400);
    assert.equal(JSON.parse(bare.body).error, "withdrawal_reason_required");

    const withdrawn = await videoHandler(postEvent({
      action: "withdraw", assetKey: ASSET,
      reason: "TREC comment 2026-09-10 questions the intermediary example at 01:20.",
    }));
    assert.equal(withdrawn.statusCode, 200);
    assert.equal(store.placementEvents.at(-1).placement_status, "withdrawn");
  });
});

test("the gate ledger is append-only: a later decision is added, never edited", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    await reserveAndConfirm();
    await videoHandler(postEvent({
      action: "record_gate", assetKey: ASSET, gate: "factual_review", outcome: "fail",
      note: "Section 1101.558 is cited with the wrong subsection at 00:58.",
    }));
    await videoHandler(postEvent({
      action: "record_gate", assetKey: ASSET, gate: "factual_review", outcome: "pass",
      note: "Re-rendered with the corrected citation; verified against the statute text.",
    }));
    const factual = store.gateEvents.filter((event) => event.gate === "factual_review");
    assert.equal(factual.length, 2, "the failing decision was replaced rather than kept");
    assert.deepEqual(factual.map((event) => event.outcome), ["fail", "pass"]);
  });
});

test("a second asset cannot be reserved under an asset key already in use", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    assert.equal((await videoHandler(postEvent(reserve))).statusCode, 200);
    const again = await videoHandler(postEvent(reserve));
    assert.equal(again.statusCode, 409);
    assert.equal(JSON.parse(again.body).error, "video_asset_already_exists");
    assert.equal(store.assets.length, 1);
  });
});

test("every release condition in the database is one the console can report on", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const body = JSON.parse((await videoHandler(getEvent())).body);
    assert.equal(body.gateDefinitions.length, GATE_DEFINITIONS.length);
    const machine = body.gateDefinitions.filter((definition) => definition.recordedBy === "stream_api");
    assert.deepEqual(machine.map((definition) => definition.gate).sort(),
      ["origin_restriction", "signed_playback", "stream_upload"]);
    assert.equal(body.gateDefinitions.filter((definition) => definition.recordedBy === "named_reviewer").length, 10);
  });
});
