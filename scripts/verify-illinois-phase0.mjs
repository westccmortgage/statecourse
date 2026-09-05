#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const json = (path) => JSON.parse(read(path));

const sourceLock = json("config/illinois/source-lock.json");
const requirements = json("config/illinois/requirements.json");

assert.equal(sourceLock.snapshotId, "IL-PHASE0-SOURCE-LOCK-2026-09-04-v1");
assert.equal(sourceLock.retrievedOn, "2026-09-04");
assert.ok(sourceLock.sources.length >= 18, "source lock is incomplete");

const sourceIds = new Set(sourceLock.sources.map((source) => source.id));
assert.equal(sourceIds.size, sourceLock.sources.length, "duplicate source id");

const permittedHosts = new Set([
  "idfpr.illinois.gov",
  "www.ilga.gov",
  "www.ilsos.gov",
  "test-takers.psiexams.com",
  "www2.dre.ca.gov",
  "leginfo.legislature.ca.gov"
]);

for (const source of sourceLock.sources) {
  for (const field of ["id", "authorityClass", "title", "publisher", "url", "effectiveOrRevisionDate", "retrievedOn", "pinpoints", "evidence", "validation"]) {
    assert.ok(source[field], `${source.id || "source"}: missing ${field}`);
  }
  const url = new URL(source.url);
  assert.equal(url.protocol, "https:", `${source.id}: non-HTTPS source`);
  assert.ok(permittedHosts.has(url.hostname), `${source.id}: non-primary/unapproved host ${url.hostname}`);
  assert.equal(source.retrievedOn, "2026-09-04", `${source.id}: wrong retrieval date`);
  assert.equal(source.validation.titleMatched, true, `${source.id}: title not checked`);
  assert.equal(source.validation.expectedContentMatched, true, `${source.id}: content not checked`);
  assert.equal(source.validation.soft404Rejected, true, `${source.id}: soft-404 not rejected`);
  assert.ok(source.pinpoints.length > 0, `${source.id}: no pinpoint`);
}

assert.ok(requirements.requirements.length >= 30, "requirements matrix is incomplete");
const requirementIds = new Set(requirements.requirements.map((item) => item.id));
assert.equal(requirementIds.size, requirements.requirements.length, "duplicate requirement id");
const allowedStatuses = new Set(["confirmed", "interpretation", "needs_regulator_confirmation"]);

for (const item of requirements.requirements) {
  assert.ok(allowedStatuses.has(item.status), `${item.id}: invalid status`);
  assert.ok(item.claim && item.pinpoint && item.evidenceParaphrase && item.implementation, `${item.id}: incomplete traceability`);
  assert.ok(item.sourceIds.length > 0, `${item.id}: no source`);
  for (const id of item.sourceIds) assert.ok(sourceIds.has(id), `${item.id}: missing source ${id}`);
}

const byId = Object.fromEntries(requirements.requirements.map((item) => [item.id, item]));
assert.equal(byId["IL-END-004"].status, "needs_regulator_confirmation");
assert.match(byId["IL-END-004"].implementation, /Ask IDFPR in writing/);
assert.equal(byId["IL-PROV-005"].status, "confirmed");
assert.match(byId["IL-PROV-005"].claim, /seven-course/);
assert.equal(byId["IL-COURSE-004"].status, "needs_regulator_confirmation");
assert.match(byId["IL-COURSE-004"].implementation, /Online Distance LMS/);
assert.match(byId["IL-OPS-001"].implementation, /enrollment/i);

const requiredFiles = [
  "illinois/README.md",
  "illinois/HANDOFF.md",
  "illinois/business-case.md",
  "illinois/personal-path.md",
  "illinois/regulatory/official-sources.md",
  "illinois/regulatory/requirements-traceability.md",
  "illinois/regulatory/conflict-log.md",
  "illinois/submission/00-filing-index.md",
  "illinois/submission/01-idfpr-provider-answer-sheet.md",
  "illinois/submission/02-course-application-plan.md",
  "illinois/submission/03-instructor-license-checklist.md",
  "illinois/submission/04-endorsement-checklist.md",
  "illinois/submission/05-operational-gates.md",
  "illinois/submission/06-regulator-questions.md",
  "illinois/curriculum/30h-endorsement-blueprint.md",
  "illinois/curriculum/portfolio-roadmap.md"
];

for (const path of requiredFiles) assert.ok(statSync(join(root, path)).isFile(), `missing ${path}`);

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = join(dir, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
const controlledFiles = [
  ...walk(join(root, "illinois")),
  ...walk(join(root, "config/illinois")),
  join(root, "scripts/verify-illinois-phase0.mjs"),
  join(root, "tests/illinois-phase0.test.mjs")
];
const corpus = controlledFiles.map((path) => readFileSync(path, "utf8")).join("\n");

assert.doesNotMatch(corpus, /\b\d{2}-\d{7}\b/, "possible EIN committed");
assert.doesNotMatch(corpus, /\b\d{3}-\d{2}-\d{4}\b/, "possible SSN committed");
assert.doesNotMatch(corpus, /\bStateCourse (?:is|has been) (?:approved|endorsed|recommended|accredited|licensed)\b/i, "unqualified approval claim");
assert.match(read("illinois/submission/05-operational-gates.md"), /Enrollment\/payment[\s\S]*BLOCKED/);

const statuses = requirements.requirements.reduce((acc, item) => {
  acc[item.status] = (acc[item.status] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({
  result: "PASS",
  snapshotId: sourceLock.snapshotId,
  sources: sourceLock.sources.length,
  requirements: requirements.requirements.length,
  statuses,
  controlledFiles: controlledFiles.length,
  enrollment: "BLOCKED"
}, null, 2));
