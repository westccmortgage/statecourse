#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const offline = args.includes("--offline");
const asJson = args.includes("--json");
const lockFlag = args.indexOf("--lock");
const fixtureFlag = args.indexOf("--fixture");
const lockPath = lockFlag >= 0
  ? path.resolve(process.cwd(), args[lockFlag + 1] ?? "")
  : path.join(root, "georgia/regulatory/source-lock.json");

if (lockFlag >= 0 && !args[lockFlag + 1]) {
  console.error("--lock requires a JSON file path");
  process.exit(1);
}

let fixture = null;
if (fixtureFlag >= 0) {
  const specification = args[fixtureFlag + 1] ?? "";
  const separator = specification.indexOf("=");
  if (separator <= 0 || separator === specification.length - 1) {
    console.error("--fixture requires SOURCE_ID=/absolute/or/relative/path");
    process.exit(1);
  }
  fixture = {
    sourceId: specification.slice(0, separator),
    path: path.resolve(process.cwd(), specification.slice(separator + 1)),
  };
}

const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
const checks = [];
const add = (id, status, detail, sourceId = undefined, manualEligible = false) => {
  checks.push({
    id,
    status,
    detail,
    ...(sourceId ? { sourceId } : {}),
    ...(manualEligible ? { manualEligible: true } : {}),
  });
};

const ageInDays = (dateText) => {
  const date = new Date(`${dateText}T00:00:00Z`);
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
};

const isFreshManualVerification = (source) => {
  const record = source.manualVerification;
  if (!record || record.status !== "verified" || !record.date || !record.method) return false;
  const age = ageInDays(record.date);
  return Number.isFinite(age) && age >= 0 && age <= lock.maximum_age_days;
};

if (!/^GA-PHASE0-\d{4}-\d{2}-\d{2}-v\d+$/.test(lock.version)) {
  add("version", "fail", `invalid version ${lock.version}`);
} else {
  add("version", "pass", lock.version);
}

const sourceIds = new Set();
const claimIds = new Set();
const allowedDomains = new Set(lock.allowed_domains ?? []);
let schemaFailures = 0;
const schemaFail = (detail, sourceId) => {
  schemaFailures += 1;
  add("source-schema", "fail", detail, sourceId);
};

if (!Array.isArray(lock.sources) || lock.sources.length === 0) {
  schemaFail("sources must be a non-empty array");
} else if (allowedDomains.size === 0) {
  schemaFail("allowed_domains must be a non-empty official-source allowlist");
} else {
  for (const source of lock.sources) {
    if (!source.id || sourceIds.has(source.id)) schemaFail(`missing or duplicate source id: ${source.id}`, source.id);
    sourceIds.add(source.id);

    let parsed;
    try {
      parsed = new URL(source.url);
    } catch {
      schemaFail(`invalid URL: ${source.url}`, source.id);
    }
    if (parsed?.protocol !== "https:") schemaFail("source URL must use HTTPS", source.id);
    if (parsed && !allowedDomains.has(parsed.hostname)) {
      schemaFail(`domain ${parsed.hostname} is not in allowed_domains`, source.id);
    }

    if (!new Set(["binary", "html"]).has(source.kind)) schemaFail(`invalid kind ${source.kind}`, source.id);
    if (!source.expected || !Number.isInteger(source.expected.minimumBytes) || source.expected.minimumBytes <= 0) {
      schemaFail("expected.minimumBytes must be a positive integer", source.id);
    }
    if (!Array.isArray(source.expected?.mimeTypes) || source.expected.mimeTypes.length === 0) {
      schemaFail("expected.mimeTypes must be non-empty", source.id);
    }
    if (source.kind === "binary") {
      if (!/^[a-f0-9]{64}$/.test(source.expected?.sha256 ?? "")) schemaFail("binary source requires SHA-256", source.id);
      if (!Number.isInteger(source.expected?.bytes) || source.expected.bytes <= 0) schemaFail("binary source requires exact byte count", source.id);
      try {
        const finalUrl = new URL(source.finalUrl);
        if (!source.finalUrl || finalUrl.protocol !== "https:") throw new Error("missing HTTPS final URL");
        if (!allowedDomains.has(finalUrl.hostname)) throw new Error("final URL domain is not allowlisted");
      } catch {
        schemaFail("binary source requires a verified final HTTPS URL on the official-source allowlist", source.id);
      }
    } else if (!Array.isArray(source.expected?.requiredPhrases) || source.expected.requiredPhrases.length < 2) {
      schemaFail("HTML source requires at least two semantic anchors", source.id);
    }
    if (!isFreshManualVerification(source)) schemaFail("manual verification record is missing or stale", source.id);

    if (!Array.isArray(source.materialClaims) || source.materialClaims.length === 0) {
      schemaFail("materialClaims must be non-empty", source.id);
      continue;
    }
    for (const claim of source.materialClaims) {
      if (!claim.id || claimIds.has(claim.id)) schemaFail(`missing or duplicate material claim id: ${claim.id}`, source.id);
      claimIds.add(claim.id);
      if (!claim.locator || !claim.claim) schemaFail(`claim ${claim.id} requires locator and claim text`, source.id);
      if (!Array.isArray(claim.reliedOnBy) || claim.reliedOnBy.length === 0) {
        schemaFail(`claim ${claim.id} requires reliedOnBy paths`, source.id);
      } else {
        for (const relative of claim.reliedOnBy) {
          const absolute = path.resolve(root, relative);
          const insideRoot = absolute === root || absolute.startsWith(`${root}${path.sep}`);
          if (!insideRoot || !fs.existsSync(absolute)) schemaFail(`claim ${claim.id} points to missing/out-of-repository path ${relative}`, source.id);
        }
      }
    }
  }
}

if (schemaFailures === 0) {
  add("source-schema", "pass", `${lock.sources.length} allowlisted sources and ${claimIds.size} unique material claims`);
}

const ageDays = ageInDays(lock.verified_as_of);
if (!Number.isFinite(ageDays) || ageDays < 0 || ageDays > lock.maximum_age_days) {
  add("verification-age", "fail", `source reading age ${ageDays} days; maximum ${lock.maximum_age_days}`);
} else {
  add("verification-age", "pass", `${ageDays} days old; maximum ${lock.maximum_age_days}`);
}

const gateEntries = Object.entries(lock.release_gates ?? {});
if (gateEntries.length === 0 || gateEntries.some(([, state]) => state !== "CLOSED")) {
  add("release-gates", "fail", "every filing, development, and commerce gate must be CLOSED in Phase 0");
} else {
  add("release-gates", "pass", `${gateEntries.length} gates closed`);
}

if (offline) {
  add("content-verification", "unverified", `${lock.sources.length} sources not downloaded in offline mode; offline is never LOCKED`);
} else if (!checks.some((check) => check.status === "fail")) {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "georgia-source-lock-"));
  try {
    for (const [index, source] of lock.sources.entries()) {
      const bodyPath = path.join(temporaryDirectory, `${String(index).padStart(2, "0")}.body`);
      try {
        let output;
        if (fixture?.sourceId === source.id) {
          fs.copyFileSync(fixture.path, bodyPath);
          output = `200\n${source.expected.mimeTypes[0]}\n${source.url}`;
        } else {
          output = execFileSync(
            "curl",
            [
              "-sS",
              "-L",
              "--max-time", "45",
              "-o", bodyPath,
              "-w", "%{http_code}\n%{content_type}\n%{url_effective}",
              source.url,
            ],
            { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
          );
        }
        const [statusText, contentTypeRaw, ...finalUrlParts] = output.trim().split("\n");
        const status = Number(statusText);
        const contentType = (contentTypeRaw ?? "").toLowerCase().split(";")[0].trim();
        const finalUrl = finalUrlParts.join("\n");

        let parsedFinalUrl;
        try {
          parsedFinalUrl = new URL(finalUrl);
        } catch {
          add("content-verification", "fail", `invalid final URL ${finalUrl || "<missing>"}`, source.id);
          continue;
        }
        if (parsedFinalUrl.protocol !== "https:" || !allowedDomains.has(parsedFinalUrl.hostname)) {
          add("content-verification", "fail", `redirect left the official allowlist: ${parsedFinalUrl.href}`, source.id);
          continue;
        }

        if ([401, 403, 429].includes(status)) {
          add("content-verification", "unverified", `HTTP ${status}; only a fresh manual reading may qualify this explicit publisher block`, source.id, true);
          continue;
        }
        if (status < 200 || status >= 300) {
          add("content-verification", "fail", `HTTP ${status} at ${finalUrl || source.url}`, source.id);
          continue;
        }
        if (source.kind === "binary" && new URL(finalUrl).href !== new URL(source.finalUrl).href) {
          add("content-verification", "fail", `unexpected final URL ${finalUrl}; expected ${source.finalUrl}`, source.id);
          continue;
        }

        const body = fs.readFileSync(bodyPath);
        const textBody = body.toString("utf8");
        const lowerBody = textBody.toLowerCase();
        const titleOrHeading = [
          ...textBody.matchAll(/<(?:title|h1)[^>]*>([\s\S]*?)<\/(?:title|h1)>/gi),
        ].map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).join(" | ");
        const soft404 = /(?:\b404\b.*(?:not found|missing)|page not found|requested page (?:was|could not be) found|content unavailable)/i.test(titleOrHeading);
        if (soft404) {
          add("content-verification", "fail", `soft-404 detected in title/heading: ${titleOrHeading}`, source.id);
          continue;
        }
        if (body.length < source.expected.minimumBytes) {
          add("content-verification", "fail", `body is ${body.length} bytes; minimum ${source.expected.minimumBytes}`, source.id);
          continue;
        }
        if (!source.expected.mimeTypes.some((mime) => contentType === mime.toLowerCase())) {
          add("content-verification", "fail", `MIME ${contentType || "missing"} not in ${source.expected.mimeTypes.join(", ")}`, source.id);
          continue;
        }
        if (source.expected.magicHex) {
          const actualMagic = body.subarray(0, source.expected.magicHex.length / 2).toString("hex");
          if (actualMagic !== source.expected.magicHex.toLowerCase()) {
            add("content-verification", "fail", `file signature ${actualMagic} != ${source.expected.magicHex}`, source.id);
            continue;
          }
        }
        if (Array.isArray(source.expected.requiredPhrases)) {
          const missing = source.expected.requiredPhrases.filter((phrase) => !lowerBody.includes(phrase.toLowerCase()));
          if (missing.length) {
            add("content-verification", "fail", `semantic anchors missing: ${missing.join(" | ")}`, source.id);
            continue;
          }
        }
        if (source.kind === "binary") {
          const digest = crypto.createHash("sha256").update(body).digest("hex");
          if (body.length !== source.expected.bytes || digest !== source.expected.sha256) {
            add("content-verification", "fail", `content drift: bytes ${body.length}/${source.expected.bytes}; sha256 ${digest}/${source.expected.sha256}`, source.id);
            continue;
          }
        }
        add("content-verification", "pass", `${body.length} bytes; MIME ${contentType}; content controls matched${fixture?.sourceId === source.id ? " (local test fixture)" : ""}`, source.id);
      } catch (error) {
        add("content-verification", "unverified", `download could not be completed: ${error.message.split("\n")[0]}`, source.id);
      }
    }
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

if (fixture && !lock.sources.some((source) => source.id === fixture.sourceId)) {
  add("fixture", "fail", `fixture source ${fixture.sourceId} is not in the lock`);
}

const failed = checks.some((check) => check.status === "fail");
const unverified = checks.filter((check) => check.status === "unverified");
const allUnverifiedHaveFreshManualRecords = unverified.every((check) => {
  if (!check.sourceId || check.manualEligible !== true) return false;
  return isFreshManualVerification(lock.sources.find((source) => source.id === check.sourceId));
});

let status;
if (failed) status = "BROKEN";
else if (offline) status = "OFFLINE_UNVERIFIED";
else if (unverified.length && allUnverifiedHaveFreshManualRecords) status = "LOCKED_WITH_MANUAL_VERIFICATION";
else if (unverified.length) status = "UNVERIFIED";
else status = "LOCKED";

const result = {
  status,
  filingAndCommerceGatesClosed: gateEntries.length > 0 && gateEntries.every(([, state]) => state === "CLOSED"),
  substantiveVerification: "Only exact hash/size/type matches or source-specific semantic anchors can produce LOCKED. LOCKED_WITH_MANUAL_VERIFICATION is limited to explicit HTTP 401/403/429 publisher blocks with fresh manual readings; offline, DNS, connection, timeout, skipped, stale, redirect, and drift failures never qualify.",
  checks,
};

if (asJson) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Georgia source lock: ${result.status}`);
  for (const check of checks) {
    console.log(`${check.status.toUpperCase()} ${check.id}${check.sourceId ? ` [${check.sourceId}]` : ""}: ${check.detail}`);
  }
}

if (status === "BROKEN") process.exitCode = 1;
else if (status !== "LOCKED") process.exitCode = 2;
