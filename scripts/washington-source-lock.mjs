#!/usr/bin/env node

import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CLAIMS, SOURCES, staleWashingtonSources } from "../config/washington/regulatory-manifest.mjs";

const args = process.argv.slice(2);
const offline = args.includes("--offline");
const json = args.includes("--json");
const findings = [];
const add = (id, status, message) => findings.push({ id, status, message });

const stale = staleWashingtonSources();
if (stale.length) add("verification-age", "fail", `Stale source readings: ${stale.join(", ")}`);
else add("verification-age", "pass", `${SOURCES.length} source readings are inside the verification window`);

const uncertain = CLAIMS.filter((entry) => entry.classification !== "confirmed");
add("claim-classification", "pass", `${CLAIMS.length} controlling claims classified: ${uncertain.length} explicitly non-confirmed`);

if (offline) {
  add("network", "skip", `${SOURCES.length} official URLs were not fetched (--offline)`);
} else {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "statecourse-wa-lock-"));
  const errors = [];
  const drift = [];
  try {
    for (const record of SOURCES) {
      const target = path.join(temp, crypto.createHash("sha256").update(record.id).digest("hex"));
      let headers = "";
      try {
        headers = execFileSync("curl", [
          "-L", "--fail", "--silent", "--show-error", "--max-time", "35",
          "-A", "Mozilla/5.0 StateCourse regulatory verification",
          "-D", "-", "-o", target, record.url,
        ], { encoding: "utf8", maxBuffer: 2_000_000 });
      } catch (error) {
        errors.push(`${record.id}: fetch failed (${String(error.message).split("\n")[0]})`);
        continue;
      }
      const body = fs.readFileSync(target);
      const lastHeader = headers.split(/\r?\n\r?\n/).filter(Boolean).at(-1) ?? headers;
      const statusMatch = [...headers.matchAll(/HTTP\/\S+\s+(\d{3})/g)].at(-1);
      const status = statusMatch?.[1] ?? "unknown";
      if (status !== "200" && status !== "206") {
        errors.push(`${record.id}: final HTTP ${status}`);
        continue;
      }
      if (body.length < 500) {
        errors.push(`${record.id}: response is only ${body.length} bytes (possible soft-404)`);
        continue;
      }
      const isPdf = record.expectedMarker === "%PDF-";
      if (isPdf) {
        if (!body.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
          errors.push(`${record.id}: HTTP success did not return a PDF (soft-404/content substitution)`);
          continue;
        }
        if (!/content-type:\s*application\/pdf/i.test(lastHeader)) {
          errors.push(`${record.id}: final response is not application/pdf`);
          continue;
        }
        if (record.sha256) {
          const digest = crypto.createHash("sha256").update(body).digest("hex");
          if (digest !== record.sha256) drift.push(`${record.id}: expected ${record.sha256}, found ${digest}`);
        }
      } else {
        const text = body.toString("utf8");
        if (/page not found|404 not found|requested page could not be found/i.test(text)) {
          errors.push(`${record.id}: HTTP success contains a not-found page`);
          continue;
        }
        if (record.expectedMarker && !text.toLowerCase().includes(record.expectedMarker.toLowerCase())) {
          errors.push(`${record.id}: expected content marker missing: ${record.expectedMarker}`);
        }
      }
    }
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
  if (errors.length) add("network", "fail", errors.join("\n"));
  else add("network", "pass", `${SOURCES.length} official URLs returned expected document types/content`);
  if (drift.length) add("pdf-drift", "fail", drift.join("\n"));
  else add("pdf-drift", "pass", "All pinned official PDF byte hashes match");
}

const failed = findings.filter((entry) => entry.status === "fail");
const report = {
  WASHINGTON_SOURCE_LOCK: failed.length ? "FAIL" : "PASS",
  sourceLockComplete: !failed.length && !offline,
  filingReady: false,
  offline,
  sourceCount: SOURCES.length,
  controllingClaimCount: CLAIMS.length,
  findings,
};

if (json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`WASHINGTON_SOURCE_LOCK ${report.WASHINGTON_SOURCE_LOCK}`);
  for (const finding of findings) console.log(`${finding.status.toUpperCase()} ${finding.id}: ${finding.message}`);
}
process.exit(failed.length ? 1 : 0);
