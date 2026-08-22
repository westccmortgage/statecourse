/*
 * The source lock, and the two questions it answers separately.
 *
 * It used to answer one: LOCKED or BROKEN. That folded together a source that had moved and a
 * source whose bytes had changed, and the second of those is not by itself a change in the law.
 * The Department reissues a PDF for a corrected address or a new accessibility tag; treating
 * that as a broken lock teaches a reader to dismiss the word, and then the reading that matters
 * gets dismissed too.
 *
 * So there are two statuses now, and these tests hold them apart — including the part that is
 * easy to lose later: a changed hash still stops a filing. Separating the two was about saying
 * what is wrong, not about downgrading one of them to a warning.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { AUTHORITIES, DRE_FORMS, VERIFICATION_MAX_AGE_DAYS, authority, staleAuthorities } from "../config/california/regulatory-manifest.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

const runLock = (extraArgs = []) => {
  try {
    return JSON.parse(
      execFileSync("node", ["scripts/regulatory-source-lock.mjs", "--offline", "--json", ...extraArgs], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    );
  } catch (error) {
    return JSON.parse(error.stdout);
  }
};

test("the lock reports two statuses, not one", () => {
  const report = runLock();
  assert.ok(["PASS", "FAIL"].includes(report.REGULATORY_SOURCE_LOCK));
  assert.ok(typeof report.REGULATORY_SOURCE_DRIFT === "string");
});

test("as things stand the lock passes and nothing has drifted", () => {
  const report = runLock();
  assert.equal(report.REGULATORY_SOURCE_LOCK, "PASS", JSON.stringify(report.findings.filter((f) => f.status === "fail"), null, 2));
  assert.equal(report.REGULATORY_SOURCE_DRIFT, "NONE", JSON.stringify(report.drift, null, 2));
});

test("a skipped network check is reported as skipped and never as a pass", () => {
  const report = runLock();
  const network = report.findings.find((finding) => finding.id === "source-urls");
  assert.equal(network.status, "skip");
  assert.notEqual(network.status, "pass");
});

test("every recorded hash is the hash of the file actually held", () => {
  /* The check the lock performs, performed here too, so that a hash edited to make the lock
     quiet fails the test suite as well. Updating a hash without re-reading the document is the
     exact move both of these exist to prevent. */
  for (const form of DRE_FORMS) {
    const full = path.join(ROOT, form.file);
    assert.ok(fs.existsSync(full), `${form.id}: ${form.file} is missing`);
    const digest = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex").slice(0, 16);
    assert.equal(digest, form.sha256Prefix, `${form.id} (${form.revision}) is not the document recorded`);
  }
  for (const entry of AUTHORITIES.filter((record) => record.localCopy && record.contentHash)) {
    const digest = crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, entry.localCopy))).digest("hex").slice(0, 16);
    assert.equal(digest, entry.contentHash, `${entry.id} is not the copy recorded`);
  }
});

test("an authority with no local copy says why, rather than being assumed unchanged", () => {
  for (const entry of AUTHORITIES.filter((record) => !record.contentHash)) {
    assert.ok(
      entry.contentHashBasis && entry.contentHashBasis.length > 30,
      `${entry.id} has no content hash and no explanation of how drift would be detected`,
    );
  }
});

test("every source record carries the fields a later reader needs", () => {
  for (const entry of AUTHORITIES) {
    assert.ok(entry.id, "a source record has no id");
    assert.ok(entry.citation, `${entry.id} has no citation`);
    assert.ok(entry.title, `${entry.id} has no title`);
    assert.ok(entry.publisher, `${entry.id} names no publisher`);
    assert.ok(Object.hasOwn(entry, "revision"), `${entry.id} has no revision field`);
    assert.ok(Object.hasOwn(entry, "effectiveDate"), `${entry.id} has no effective date field`);
    assert.match(entry.verifiedAsOf, /^\d{4}-\d{2}-\d{2}$/, `${entry.id} has no verification date`);
    assert.ok(entry.url, `${entry.id} has no canonical URL`);
  }
});

test("every material claim names what relies on it", () => {
  /* This is the field that turns a changed document into a work list. Without it, a new hash
     means "read everything again", which in practice means reading nothing again. */
  for (const entry of AUTHORITIES) {
    assert.ok(entry.materialClaims.length > 0, `${entry.id} states no material claim`);
    for (const claim of entry.materialClaims) {
      assert.match(claim.id, /^[a-z0-9-]+$/, `a claim of ${entry.id} has no usable id`);
      assert.ok(claim.claim.length > 40, `claim ${claim.id} is too short to be a claim`);
      assert.ok(claim.reliedOnBy.length > 0, `claim ${claim.id} is recorded but nothing relies on it`);
    }
  }
});

test("the prose summary of a source is its claims and cannot disagree with them", () => {
  /* `states` is derived rather than written, so the summary and the enumerated claims have one
     home between them. A record that carried both by hand would drift the moment one was
     edited, which is the defect in miniature that this whole file is about. */
  for (const entry of AUTHORITIES) {
    assert.equal(entry.states, entry.materialClaims.map((claim) => claim.claim).join(" "));
  }
});

test("claim ids are unique across the whole manifest", () => {
  const ids = AUTHORITIES.flatMap((entry) => entry.materialClaims.map((claim) => claim.id));
  assert.equal(new Set(ids).size, ids.length, "two material claims share an id");
});

test("nothing has gone stale, and staleness is measured from a reading not a memory", () => {
  assert.deepEqual([...staleAuthorities()], []);
  const future = new Date(Date.now() + (VERIFICATION_MAX_AGE_DAYS + 400) * 24 * 60 * 60 * 1000);
  assert.equal(staleAuthorities(future).length, AUTHORITIES.length, "aging the clock past the window staled nothing");
});

test("the authority lookup finds what the manifest carries and nothing it does not", () => {
  assert.equal(authority("ccr-3000").id, "ccr-3000");
  assert.equal(authority("no-such-authority"), null);
});

test("the Handbook's required-items list is recorded as a source, not as folklore", () => {
  /* The deliverable ledger is built from this. If the list is going to decide what a filing
     consists of, it has to be a reading with a date on it like anything else. */
  const record = authority("handbook-required-items");
  assert.ok(record, "the required-items list is not recorded as an authority");
  assert.equal(record.publisher, "California Department of Real Estate");
  assert.ok(record.materialClaims.some((claim) => claim.reliedOnBy.includes("REQUIRED_DELIVERABLES")));
});

test("drift and a lock failure both stop a filing", () => {
  /* Read from the script rather than asserted about it: the exit condition is the part that
     would quietly rot if drift were ever softened into a warning. */
  const source = fs.readFileSync(path.join(ROOT, "scripts/regulatory-source-lock.mjs"), "utf8");
  assert.match(source, /process\.exit\(failed\.length === 0 && drift\.length === 0 \? 0 : 1\)/);
});
