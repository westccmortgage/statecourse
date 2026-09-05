import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(import.meta.dirname, "..");
const required = [
  "washington/README.md",
  "washington/HANDOFF.md",
  "washington/regulatory/phase-0-status.md",
  "washington/regulatory/requirements-traceability.md",
  "washington/regulatory/existing-content-gap-audit.md",
  "washington/submission/filing-index.md",
  "washington/submission/application-dossier.md",
  "washington/submission/regulator-questions.md",
  "washington/commercial-roadmap.md",
];

test("Washington Phase 0 package contains all routed artifacts", () => {
  for (const file of required) assert.ok(fs.existsSync(path.join(ROOT, file)), file);
});

test("Phase 0 report is candid about approval, enrollment and blockers", () => {
  const report = JSON.parse(execFileSync("node", ["scripts/washington-phase0-report.mjs"], { cwd: ROOT, encoding: "utf8" }));
  assert.equal(report.WASHINGTON_PHASE_0, "COMPLETE");
  assert.equal(report.submissionReady, false);
  assert.equal(report.enrollmentOpen, false);
  assert.ok(report.sourceCount >= 20);
  assert.ok(report.controllingClaimCount >= 20);
  assert.ok(report.unsatisfiedGateCount >= 8);
});

test("submission package does not claim approval or invite Washington enrollment", () => {
  const text = required.map((file) => fs.readFileSync(path.join(ROOT, file), "utf8")).join("\n");
  assert.doesNotMatch(text, /(?:is|are|now) (?:DOL |Washington )?approved/i);
  assert.doesNotMatch(text, /enroll now|buy now|Washington credit available/i);
  assert.match(text, /NO-GO|do not submit/i);
  assert.match(text, /Regulator confirmation/i);
});

