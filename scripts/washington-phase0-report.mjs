#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { CLAIMS, SOURCES, VERIFIED_AS_OF } from "../config/washington/regulatory-manifest.mjs";
import { WASHINGTON_COURSE_IDS, WASHINGTON_SUBMISSION_GATES } from "../config/washington-course-engine.mjs";

const root = path.resolve(import.meta.dirname, "..");
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(path.relative(root, full));
  }
}
walk(path.join(root, "washington"));

const unsatisfied = WASHINGTON_SUBMISSION_GATES.filter((gate) => !gate.satisfied);
const report = {
  WASHINGTON_PHASE_0: "COMPLETE",
  verifiedAsOf: VERIFIED_AS_OF,
  submissionReady: false,
  enrollmentOpen: false,
  sourceCount: SOURCES.length,
  controllingClaimCount: CLAIMS.length,
  confirmedClaims: CLAIMS.filter((claim) => claim.classification === "confirmed").length,
  qualifiedClaims: CLAIMS.filter((claim) => claim.classification !== "confirmed").length,
  courseCount: WASHINGTON_COURSE_IDS.length,
  washingtonFileCount: files.length,
  unsatisfiedGateCount: unsatisfied.length,
  unsatisfiedGates: unsatisfied.map(({ id, blockedBy }) => ({ id, blockedBy })),
};

console.log(JSON.stringify(report, null, 2));

