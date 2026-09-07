#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { inspectIllinoisCapture } from "./lib/illinois-source-integrity.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const json = (path) => JSON.parse(read(path));

const sourceLock = json("config/illinois/source-lock.json");
const requirements = json("config/illinois/requirements.json");

assert.equal(sourceLock.snapshotId, "IL-PHASE0-SOURCE-LOCK-2026-09-06-v2");
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
  assert.ok(["2026-09-04", "2026-09-06"].includes(source.retrievedOn), `${source.id}: wrong retrieval date`);
  assert.equal(source.validation.titleMatched, true, `${source.id}: title not checked`);
  assert.equal(source.validation.expectedContentMatched, true, `${source.id}: content not checked`);
  assert.equal(source.validation.soft404Rejected, true, `${source.id}: soft-404 not rejected`);
  assert.ok(source.pinpoints.length > 0, `${source.id}: no pinpoint`);
}

const evidence = json("config/illinois/source-evidence.json");
const norm = text => text.replace(/\s+/g, " ").toLowerCase();
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const mandatoryIds = ["IL-CURR-75", "IL-CURR-45POST", "IL-CURR-45MB", "IL-CURR-END-BROKER", "IL-CURR-END-MB", "IL-FORM-PROVIDER", "IL-FORM-COURSE", "IL-DATA-FY2024", "IL-DATA-BOARD-202603"];
for (const id of mandatoryIds) assert.ok(evidence.captures.some(c=>c.id===id), `${id}: missing byte evidence`);
for (const capture of evidence.captures) {
  assert.ok(sourceIds.has(capture.id));
  const bytes = readFileSync(join(root, capture.path));
  const extracted = read(capture.textPath);
  assert.deepEqual(inspectIllinoisCapture(capture, { bytes, extracted, source: sourceLock.sources.find(source => source.id === capture.id) }), [], `${capture.id}: evidence validation failed`);
  assert.equal(hash(bytes), capture.sha256, `${capture.id}: source changed`);
  assert.equal(hash(extracted), capture.textSha256, `${capture.id}: extraction changed`);
  assert.equal(bytes.length, capture.byteCount);
  assert.equal(capture.httpStatus, 200);
  for (const marker of capture.contentMarkers) assert.ok(norm(extracted).includes(norm(marker)), `${capture.id}: marker ${marker} absent`);
  if (capture.pageCount) {
    assert.equal(bytes.subarray(0,5).toString(), "%PDF-");
    assert.equal((extracted.match(/^PAGE \d+$/gm)||[]).length, capture.pageCount);
  }
}
const portfolio = json("config/illinois/course-portfolio.json");
assert.equal(portfolio.courses.length, 7);
assert.equal(new Set(portfolio.courses.map(c=>c.id)).size, 7);
assert.equal(portfolio.courses.reduce((n,c)=>n+c.hours,0), 165);
for(const course of portfolio.courses) {
  assert.equal(course.instructionMinutes, course.hours*50);
  if(course.blocks) assert.equal(course.blocks.reduce((n,b)=>n+b.hours,0),course.hours);
  for(const id of course.sourceIds) assert.ok(sourceIds.has(id));
  assert.ok(course.pinpoint && course.finalPolicy);
  if(course.id.startsWith("IL-POST-")) assert.equal(course.finalPolicy,"required_50_questions_minimum_75_percent");
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
assert.equal(byId["IL-INS-002"].status, "needs_regulator_confirmation");
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
  ,"illinois/curriculum/source-foundation-audit.md"
  ,"config/illinois/course-portfolio.json"
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
  join(root, "scripts/lib/illinois-source-integrity.mjs"),
  join(root, "tests/illinois-phase0.test.mjs")
];
const corpus = controlledFiles.filter(path=>!path.includes("/regulatory/evidence/")).map((path) => readFileSync(path, "utf8")).join("\n");

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
  byteVerifiedSources: evidence.captures.length,
  byteCaptureFailures: evidence.captureFailures.map(c=>c.id),
  portfolioCourses: portfolio.courses.length,
  portfolioHours: portfolio.requiredPortfolioHours,
  requirements: requirements.requirements.length,
  statuses,
  controlledFiles: controlledFiles.length,
  enrollment: "BLOCKED"
}, null, 2));
