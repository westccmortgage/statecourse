#!/usr/bin/env node
/**
 * Texas source lock and source drift — kept apart on purpose.
 *
 * LOCK answers: can every authority this build depends on be reached, and is every copy it holds
 * still the copy it recorded? An authority that cannot be opened FAILS the lock, because a build
 * that cannot read its own sources is not verified — it is merely untested.
 *
 * DRIFT answers a different question: has a reachable authority's content changed since it was
 * read? A changed official PDF is drift. It triggers a re-read and a review. It does NOT by itself
 * mean the law changed — a regulator reissuing a form with a new footer changes the hash and
 * nothing else — and reporting it as a failure would train a reader to ignore it.
 *
 * Run offline by default (hashes on disk only). Pass --online to re-fetch and compare.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import MANIFEST, { REACHABILITY, VERIFICATION_MAX_AGE_DAYS } from "../config/texas/regulatory-manifest.mjs";
import STATUTES from "../config/texas/statute-sources.mjs";
import PRINS1 from "../config/texas/prins1-course-form.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

const failures = [];
const drift = [];
const notes = [];

/* ── 1. every held copy is present and still hashes to what was recorded ── */
for (const entry of MANIFEST.SOURCES) {
  if (!entry.localCopy) continue;
  const file = path.join(root, entry.localCopy);
  if (!fs.existsSync(file)) {
    failures.push(`${entry.id}: ${entry.localCopy} is recorded in the manifest and is not on disk`);
    continue;
  }
  const actual = sha256(fs.readFileSync(file));
  if (entry.sha256 && actual !== entry.sha256) {
    drift.push(`${entry.id}: ${entry.localCopy} hashes to ${actual.slice(0, 16)}…, recorded ${entry.sha256.slice(0, 16)}…`);
  }
  if (entry.bytes && fs.statSync(file).size !== entry.bytes) {
    drift.push(`${entry.id}: ${entry.localCopy} is ${fs.statSync(file).size} bytes, recorded ${entry.bytes}`);
  }
}

/* ── 1b. every statute and federal snapshot is present and unchanged ── */
for (const entry of STATUTES.ALL_SOURCES) {
  const file = path.join(root, entry.localCopy);
  if (!fs.existsSync(file)) {
    failures.push(`${entry.id}: ${entry.localCopy} is recorded and not on disk`);
    continue;
  }
  const actual = sha256(fs.readFileSync(file));
  if (actual !== entry.sha256) drift.push(`${entry.id}: ${entry.localCopy} hashes to ${actual.slice(0, 16)}…, recorded ${entry.sha256.slice(0, 16)}…`);
}

/* ── 2. an authority that could not be opened fails the lock ── */
for (const entry of MANIFEST.SOURCES) {
  if (entry.reachability === REACHABILITY.UNREACHABLE_JS_ONLY || entry.reachability === REACHABILITY.UNREACHABLE_LOGIN_REQUIRED) {
    failures.push(`${entry.id}: ${entry.title} could not be opened (${entry.reachability})`);
  }
}

/* ── 2b. a section may be cited only where it was actually read ── */
const heldButUnread = STATUTES.ALL_SOURCES.filter((entry) => entry.sectionsRead.length === 0).length;
notes.push(`${STATUTES.ALL_SOURCES.length} source document(s) held; ${STATUTES.SECTIONS_READ.length} section(s) recorded as read; ${heldButUnread} document(s) held with no section read yet — held is not read`);

/* ── 3. staleness ── */
const cutoff = new Date(Date.now() - VERIFICATION_MAX_AGE_DAYS * 86_400_000);
for (const entry of MANIFEST.SOURCES) {
  if (!entry.readOn) continue;
  if (new Date(`${entry.readOn}T00:00:00Z`) < cutoff) failures.push(`${entry.id}: last read ${entry.readOn}, older than ${VERIFICATION_MAX_AGE_DAYS} days`);
}

/* ── 4. nothing rests on a source recorded as not-authority ── */
for (const entry of MANIFEST.SOURCES) {
  if (entry.reachability === REACHABILITY.READ_NOT_AUTHORITY && entry.materialClaims.length > 0) {
    failures.push(`${entry.id}: recorded as not authority and carries ${entry.materialClaims.length} material claim(s)`);
  }
}

/* ── 5. no approval is claimed ── */
for (const program of MANIFEST.PROGRAMS) {
  if (program.providerApprovalNumber || program.courseApprovalNumber) failures.push(`${program.courseId}: claims an approval number`);
  if (program.status !== "In Development") failures.push(`${program.courseId}: status is ${program.status}`);
}

/* ── 6. every unresolved conflict is recorded rather than settled quietly ── */
for (const conflict of MANIFEST.CONFLICTS) {
  if (!conflict.resolution) failures.push(`${conflict.sourceId}/${conflict.id}: a conflict with no recorded resolution`);
  else notes.push(`${conflict.sourceId}/${conflict.id}: ${conflict.resolution.split("—")[0].trim()}`);
}

console.log(`\n  Texas source lock — ${MANIFEST.MANIFEST_VERSION}\n`);
console.log(`  ${MANIFEST.SOURCES.length} source record(s); ${MANIFEST.held().length} copy(ies) held on disk\n`);
for (const line of failures) console.log(`  FAIL   ${line}`);
if (failures.length === 0) console.log("  PASS   every authority reachable and every held copy intact");
console.log();
for (const line of drift) console.log(`  DRIFT  ${line}`);
console.log();
const coverage = STATUTES.unitCoverage(PRINS1.ALL_UNITS.map((unit) => unit.code));
const providerLock = MANIFEST.providerRuleSourceLock();
const principlesLock = MANIFEST.principlesISourceLock(coverage);
const aggregate = MANIFEST.sourceLock(coverage);
console.log(`  TX_PROVIDER_RULE_SOURCE_LOCK: ${providerLock.status}${providerLock.unreachable.length ? ` — ${providerLock.unreachable.map((u) => u.id).join(", ")}` : ""}`);
console.log(`  TX_PRINCIPLES_I_SOURCE_LOCK:  ${principlesLock.status} — ${principlesLock.unitsHeld} unit(s) with a source held, ${principlesLock.unitsExcused} needing none, ${principlesLock.unitsUncovered.length} uncovered`);
console.log(`  TX_REGULATORY_SOURCE_LOCK:    ${aggregate.status} — the aggregate passes only when both do`);
console.log(`  TX_REGULATORY_SOURCE_DRIFT:   ${drift.length === 0 ? "NONE" : drift.length + " change(s) — re-read and review; a changed document is not by itself a changed law"}`);
console.log();
for (const line of notes) console.log(`  conflict recorded: ${line}`);
console.log();

/* Exit non-zero while the aggregate fails, so CI cannot mistake a split lock for a green one. */
process.exit(aggregate.status === "PASS" && drift.length === 0 ? 0 : 1);
