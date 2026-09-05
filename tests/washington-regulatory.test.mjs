import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { CLAIMS, MAX_VERIFICATION_AGE_DAYS, SOURCES, staleWashingtonSources, washingtonClaim, washingtonSource } from "../config/washington/regulatory-manifest.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

test("every Washington controlling claim has complete provenance and a certainty class", () => {
  assert.ok(CLAIMS.length >= 20);
  for (const claim of CLAIMS) {
    const source = washingtonSource(claim.sourceId);
    assert.ok(source, `${claim.id} has no source`);
    assert.equal(claim.authorityClass, source.authorityClass, `${claim.id} authority class drift`);
    assert.ok(source.url.startsWith("https://"), `${claim.id} source is not HTTPS`);
    assert.ok(source.retrievedAt);
    assert.ok(source.pinpoint);
    assert.ok(claim.pinpoint);
    assert.ok(claim.evidence.length > 40);
    assert.ok(claim.claim.length > 40);
    assert.ok(claim.reliedOnBy.length > 0);
  }
});

test("confirmation-sensitive claims are never labelled confirmed", () => {
  for (const id of ["wa-instructor-subject", "wa-pvs-status", "wa-school-entity-status"]) {
    assert.equal(washingtonClaim(id).classification, "needs-regulator-confirmation");
  }
  assert.equal(washingtonClaim("wa-no-proctor-claim").classification, "interpretation");
  assert.equal(washingtonClaim("wa-license-level").classification, "confirmed");
  assert.match(washingtonClaim("wa-license-level").claim, /DOL must determine/i);
});

test("current DOL PDF forms and both prescribed curricula are hash pinned", () => {
  const ids = [
    "wa-curriculum-fundamentals", "wa-curriculum-practices", "wa-form-school-623121",
    "wa-form-instructor-623125", "wa-form-course-623137", "wa-form-distance-600002b",
  ];
  for (const id of ids) {
    const source = washingtonSource(id);
    assert.match(source.sha256, /^[a-f0-9]{64}$/, id);
    assert.equal(source.expectedMarker, "%PDF-", id);
  }
  assert.equal(washingtonSource("wa-form-school-623121").revision, "RE-623-121 (R/12/25)");
  assert.equal(washingtonSource("wa-form-course-623137").revision, "RE-623-137 (R/10/25)");
});

test("all source readings are fresh and staleness cannot be hidden", () => {
  assert.deepEqual(staleWashingtonSources(), []);
  const future = new Date(Date.now() + (MAX_VERIFICATION_AGE_DAYS + 60) * 86_400_000);
  assert.equal(staleWashingtonSources(future).length, SOURCES.length);
});

test("offline lock skips network and does not describe a live URL check as passed", () => {
  const raw = execFileSync("node", ["scripts/washington-source-lock.mjs", "--offline", "--json"], { cwd: ROOT, encoding: "utf8" });
  const report = JSON.parse(raw);
  assert.equal(report.WASHINGTON_SOURCE_LOCK, "PASS");
  assert.equal(report.sourceLockComplete, false);
  assert.equal(report.filingReady, false);
  assert.equal(report.findings.find((entry) => entry.id === "network").status, "skip");
});

test("the online lock checks PDF magic, content type, hash, HTML content and soft-404 text", () => {
  const script = fs.readFileSync(path.join(ROOT, "scripts/washington-source-lock.mjs"), "utf8");
  assert.match(script, /%PDF-/);
  assert.match(script, /application\\\/pdf/);
  assert.match(script, /possible soft-404/);
  assert.match(script, /page not found/);
  assert.match(script, /sha256/);
});
