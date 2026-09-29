import assert from "node:assert/strict";
import test from "node:test";

import { handler as sessionHandler } from "../netlify/functions/admin-session.mjs";
import { handler as videoHandler } from "../netlify/functions/admin-video.mjs";
import { handler as catalogHandler } from "../netlify/functions/admin-catalog.mjs";
import {
  COURSE_ID, DELIVERY_ID, OTHER_STAFF_ID, SCREEN_ID, STAFF_ID,
  createStore, getEvent, postEvent, withConsoleMock,
} from "./fixtures/admin-console/harness.mjs";

/*
 * What the console will and will not accept as authority.
 *
 * The endpoints it replaces answer to STATECOURSE_ADMIN_API_TOKEN, a single string shared
 * by everyone who has ever needed it. These assertions are the reason to prefer the new
 * path: a session identifies one person, a binding says what that person may do, and
 * neither is anything the browser can assert for itself.
 */

const reserve = {
  action: "reserve_upload",
  assetKey: "tx-non-fiduciary-duties",
  courseId: COURSE_ID,
  deliveryId: DELIVERY_ID,
  screenId: SCREEN_ID,
  label: "Optional video: non-fiduciary duties",
  durationSeconds: 200,
  transcriptPath: "private-media/texas/tx-non-fiduciary-duties.txt",
  captionsPath: "private-media/texas/tx-non-fiduciary-duties.vtt",
};

test("the shared administrator token is not authority in the console", { concurrency: false }, async () => {
  const store = createStore();
  process.env.STATECOURSE_ADMIN_API_TOKEN = "a-token-several-people-have";
  try {
    await withConsoleMock(store, async (calls) => {
      const response = await videoHandler({
        httpMethod: "GET",
        headers: { authorization: "Bearer a-token-several-people-have" },
        queryStringParameters: {},
      });
      /* The bearer is read as a Supabase access token, which it is not, so this fails at
         authentication. What matters is that it fails: holding the string is not a role. */
      assert.equal(response.statusCode, 401);
      assert.equal(calls.some((call) => call.url.pathname.includes("current_staff_actor_bindings")), false);
    });
  } finally {
    delete process.env.STATECOURSE_ADMIN_API_TOKEN;
  }
});

test("a valid session with no staff binding is refused admin access", { concurrency: false }, async () => {
  const store = createStore({ bindings: [] });
  await withConsoleMock(store, async () => {
    const response = await sessionHandler(getEvent());
    assert.equal(response.statusCode, 403);
    assert.equal(JSON.parse(response.body).error, "staff_binding_required");
  });
});

test("a session with no binding cannot read the catalog or the video chain", { concurrency: false }, async () => {
  const store = createStore({ bindings: [] });
  await withConsoleMock(store, async () => {
    for (const handler of [catalogHandler, videoHandler]) {
      const response = await handler(getEvent());
      assert.equal(response.statusCode, 403);
      assert.equal(JSON.parse(response.body).error, "staff_binding_required");
    }
  });
});

test("a revoked binding is not a binding", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings[0].binding_status = "revoked";
  await withConsoleMock(store, async () => {
    const response = await videoHandler(getEvent());
    assert.equal(response.statusCode, 403);
    assert.equal(JSON.parse(response.body).error, "staff_binding_required");
  });
});

test("an expired binding is not a binding", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings[0].expires_at = "2020-01-01T00:00:00.000Z";
  await withConsoleMock(store, async () => {
    const response = await videoHandler(getEvent());
    assert.equal(response.statusCode, 403);
  });
});

test("a binding that has not taken effect yet is not a binding", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings[0].effective_at = "2099-01-01T00:00:00.000Z";
  await withConsoleMock(store, async () => {
    const response = await videoHandler(getEvent());
    assert.equal(response.statusCode, 403);
  });
});

test("a regulator reviewer cannot read or change admin resources", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings[0].actor_role = "regulator_reviewer";
  await withConsoleMock(store, async () => {
    assert.equal((await videoHandler(getEvent())).statusCode, 403);
    const write = await videoHandler(postEvent(reserve));
    assert.equal(write.statusCode, 403);
    assert.equal(JSON.parse(write.body).error, "staff_role_not_authorized");
  });
});

test("a video producer may drive the review and may not place", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings[0].actor_role = "video_producer";
  await withConsoleMock(store, async () => {
    const reserved = await videoHandler(postEvent(reserve));
    assert.equal(reserved.statusCode, 200);
    const placed = await videoHandler(postEvent({ action: "place", assetKey: reserve.assetKey }));
    assert.equal(placed.statusCode, 403);
    assert.equal(JSON.parse(placed.body).error, "staff_role_not_authorized");

    const inventory = JSON.parse((await videoHandler(getEvent())).body);
    assert.equal(inventory.viewer.canPlace, false);
  });
});

test("a state-scoped binding reads only that state's catalog rows", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings[0] = { ...store.bindings[0], actor_role: "support", scope_state: "MI" };
  await withConsoleMock(store, async () => {
    const body = JSON.parse((await catalogHandler(getEvent())).body);
    assert.deepEqual(body.viewer.scopeStates, ["MI"]);
    assert.ok(body.rows.length > 0, "Michigan staff should still see Michigan");
    assert.deepEqual([...new Set(body.rows.map((row) => row.state))], ["MI"]);
    /* The summary is recounted from the rows returned, so the headline cannot describe
       records this viewer cannot see. */
    assert.equal(body.summary.rows, body.rows.length);
  });
});

test("an unscoped binding reads every state", { concurrency: false }, async () => {
  await withConsoleMock(createStore(), async () => {
    const body = JSON.parse((await catalogHandler(getEvent())).body);
    assert.equal(body.viewer.scopeStates, null);
    assert.ok(new Set(body.rows.map((row) => row.state)).size > 1);
  });
});

test("a state-scoped binding cannot act on another state's course", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings[0] = { ...store.bindings[0], scope_state: "MI" };
  await withConsoleMock(store, async () => {
    /* The course record says TX; the request cannot say otherwise. */
    const response = await videoHandler(postEvent(reserve));
    assert.equal(response.statusCode, 403);
    assert.equal(JSON.parse(response.body).error, "course_outside_staff_scope");
    assert.equal(store.assets.length, 0);
  });
});

test("a state-scoped binding is not offered another state's courses to place into", { concurrency: false }, async () => {
  const store = createStore();
  store.bindings[0] = { ...store.bindings[0], scope_state: "MI" };
  await withConsoleMock(store, async () => {
    const body = JSON.parse((await videoHandler(getEvent())).body);
    assert.deepEqual(body.placeableCourses, []);
  });
});

test("the actor written to the audit record is the session, never the request body", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const response = await videoHandler(postEvent({
      ...reserve,
      /* A browser trying to record someone else as the actor. */
      recordedBy: OTHER_STAFF_ID,
      created_by: OTHER_STAFF_ID,
      reviewed_by: OTHER_STAFF_ID,
    }));
    assert.equal(response.statusCode, 200);
    assert.equal(store.assets[0].created_by, STAFF_ID);
    assert.ok(store.consoleActions.length > 0);
    for (const action of store.consoleActions) assert.equal(action.auth_user_id, STAFF_ID);
  });
});

test("console writes require a same-origin request", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const response = await videoHandler(postEvent(reserve, { origin: "https://attacker.test" }));
    assert.equal(response.statusCode, 403);
    assert.equal(JSON.parse(response.body).error, "origin_not_allowed");
    assert.equal(store.assets.length, 0);
  });
});

test("signing in reports roles and states plainly that it grants no approval", { concurrency: false }, async () => {
  const store = createStore();
  await withConsoleMock(store, async () => {
    const body = JSON.parse((await sessionHandler(getEvent())).body);
    assert.deepEqual(body.roles, ["owner"]);
    assert.equal(body.grantsApproval, false);
  });
});

