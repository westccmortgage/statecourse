import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { ALL_GATES } from "../netlify/functions/_lib/video-console.mjs";
import { STAFF_ROLES } from "../netlify/functions/_lib/staff-session.mjs";

/*
 * The invariants that have to survive a bug in the application layer.
 *
 * Everything the endpoints check, they check because the code says so, and code changes.
 * These assertions are about the conditions that are also written into the schema, where a
 * refactor cannot quietly drop them.
 */

const migration = await readFile(new URL("../database/019_platform_admin_console.sql", import.meta.url), "utf8");

test("a placement row cannot say a video is required, blocking, or autoplaying", { concurrency: false }, () => {
  for (const constraint of [
    "required boolean not null default false check (required = false)",
    "non_blocking boolean not null default true check (non_blocking = true)",
    "autoplay boolean not null default false check (autoplay = false)",
  ]) {
    assert.ok(migration.includes(constraint), `missing schema constraint: ${constraint}`);
  }
});

test("the release gate is enforced inside the placement function, not only above it", { concurrency: false }, () => {
  const body = migration.slice(migration.indexOf("create or replace function place_video_asset"));
  assert.ok(body.includes("if not found or not v_ready.release_ready then"));
  assert.ok(body.includes("raise exception 'video_release_gate_incomplete"));
  assert.ok(body.includes("raise exception 'video_asset_upload_incomplete'"));
});

test("the ledgers are append-only", { concurrency: false }, () => {
  for (const table of [
    "staff_actor_binding_events",
    "video_release_gate_events",
    "video_placement_events",
    "admin_console_actions",
  ]) {
    assert.ok(migration.includes(`'${table}'`), `${table} is not in the append-only list`);
  }
  assert.ok(migration.includes("raise exception 'admin_console_records_are_append_only'"));
});

test("browser roles are granted nothing on the console tables", { concurrency: false }, () => {
  assert.ok(migration.includes("revoke all on\n  staff_actor_binding_events, video_assets, video_release_gate_definitions,\n  video_release_gate_events, video_placement_events, admin_console_actions\nfrom public, anon, authenticated;"));
  assert.ok(migration.includes("from public, anon, authenticated;"));
  for (const table of [
    "staff_actor_binding_events", "video_assets", "video_release_gate_events",
    "video_placement_events", "admin_console_actions",
  ]) {
    assert.ok(migration.includes(`alter table ${table} enable row level security;`), `${table} has no RLS`);
  }
});

test("the migration seeds no binding, no gate decision and no placement", { concurrency: false }, () => {
  /* Provisioning a role, asserting a review happened, or placing a video are acts a person
     performs and a record shows. A migration that did any of them would be manufacturing
     the evidence. */
  const inserts = [...migration.matchAll(/insert into (\w+)/g)].map((match) => match[1]);
  assert.deepEqual([...new Set(inserts)], ["video_release_gate_definitions", "video_placement_events"],
    `unexpected seed inserts: ${inserts.join(", ")}`);
  /* The one placement insert is inside the function, not a seed. */
  const seedSection = migration.slice(0, migration.indexOf("create or replace function place_video_asset"));
  assert.equal(seedSection.includes("insert into video_placement_events"), false);
  assert.equal(seedSection.includes("insert into staff_actor_binding_events"), false);
  assert.equal(seedSection.includes("insert into video_release_gate_events"), false);
});

test("the migration changes no approval, enrollment or lifecycle record", { concurrency: false }, () => {
  for (const forbidden of [
    "update courses", "approval_status=", "enrollment_enabled=",
    "update regulatory_course_versions", "regulatory_credit_enabled",
  ]) {
    assert.equal(migration.includes(forbidden), false, `the migration touches ${forbidden}`);
  }
});

test("the gates the code knows are exactly the gates the schema defines", { concurrency: false }, () => {
  const defined = [...migration.matchAll(/\('([a-z_]+)',\d+,'/g)].map((match) => match[1]);
  assert.deepEqual([...defined].sort(), [...ALL_GATES].sort());
  /* Thirteen: the ten in PORTFOLIO.md plus the three delivery conditions in
     portfolio.json's release rule. */
  assert.equal(defined.length, 13);
});

test("the roles the schema allows are the roles the session library accepts", { concurrency: false }, () => {
  const match = migration.match(/actor_role in \(\n?\s*([^)]+)\)/);
  assert.ok(match, "the actor_role check is missing");
  const allowed = [...match[1].matchAll(/'([a-z_]+)'/g)].map((entry) => entry[1]);
  assert.deepEqual(allowed.sort(), [...STAFF_ROLES].sort());
});

test("one screen carries at most one console-managed asset", { concurrency: false }, () => {
  assert.ok(migration.includes("unique (course_id, delivery_id, screen_id)"));
});

test("delivery reaches only assets that are placed, ready, and uploaded", { concurrency: false }, () => {
  const view = migration.slice(
    migration.indexOf("create or replace view console_video_delivery"),
    migration.indexOf("-- ---------------------------------------------------------------------------\n-- Console audit"),
  );
  assert.ok(view.includes("p.placement_status='placed'"));
  assert.ok(view.includes("r.release_ready"));
  assert.ok(view.includes("a.stream_uid is not null"));
});
