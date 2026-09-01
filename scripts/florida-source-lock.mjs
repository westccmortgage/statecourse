#!/usr/bin/env node
/**
 * FL_REGULATORY_SOURCE_LOCK and FL_REGULATORY_SOURCE_DRIFT — two questions, kept apart on purpose.
 *
 *   THE LOCK asks whether the sources are still there, whether every reading is current, and
 *   whether anything this build says goes further than what its sources say. A source that has
 *   moved, a reading that has gone stale, a page that claims an approval nobody issued — each of
 *   those is a defect and the lock FAILS.
 *
 *   DRIFT asks a different question: has a document we hold changed since we recorded it? A new
 *   hash on a Department file is not by itself a change in the law. flrules.org reissues an adopted
 *   rule as a fresh Word export; the Legislature re-renders a statute page with a new footer. Both
 *   change the hash and neither changes what is required. Calling that a broken lock trains a
 *   reader to dismiss the word, and the next time it means something they will dismiss it too. So
 *   drift is reported separately, says what it actually is — this document is not the one we read,
 *   and here are the claims taken from it that must be read again — and blocks a filing without
 *   being called a lock failure.
 *
 * WHY THE CLAIM CHECK IS SCOPED THE WAY IT IS, AND WHAT THAT COSTS. The forbidden-claim patterns
 * match phrases like "guarantee ... pass" and "permit ... endorsement". Those phrases appear, quite
 * properly, wherever the prohibitions themselves are written down — and the prohibitions are
 * written down in Florida law, which this project holds and transcribes. The first version of this
 * check scanned florida/regulatory and duly failed on three quotations of s. 475.451(3) in the
 * reading notes. A lock that fails on an accurate quotation of the rule it is enforcing is a lock
 * that gets switched off within a week, and the docstring above says exactly why that matters.
 *
 * The fix is a distinction, not a weaker pattern. What the lock is actually policing is what
 * StateCourse ASSERTS IN ITS OWN VOICE: documents that go out to students, to the public, and to
 * the regulator. Material that TRANSCRIBES THE AUTHORITY — the held sources, and the reading notes
 * that quote them — is in a different category, and is excluded for the same reason the sources
 * themselves are.
 *
 * The cost is real and is stated rather than hidden: a claim authored in StateCourse's own voice
 * inside florida/regulatory would not be caught here. That is accepted because the reading notes are
 * not published to anyone, and because narrowing the pattern instead — trying to distinguish
 * "we guarantee you will pass" from "to guarantee that its pupils will pass is unlawful" by regex —
 * would produce a check that is confidently wrong rather than honestly partial.
 *
 * Network checks are skipped with --offline, which is what CI without egress should use. A skipped
 * check is reported as skipped and never as a pass: the point of this file is that nothing is
 * assumed.
 *
 * Usage:  node scripts/florida-source-lock.mjs [--offline] [--json]
 */

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import MANIFEST, {
  FORBIDDEN_CLAIMS,
  MANIFEST_VERSION,
  REACHABILITY,
  SOURCES,
  SCHOOL,
  VERIFICATION_MAX_AGE_DAYS,
  staleAuthorities,
} from "../config/florida/regulatory-manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const OFFLINE = args.includes("--offline");
const AS_JSON = args.includes("--json");

const findings = [];
const drift = [];
const fail = (id, message) => findings.push({ id, status: "fail", message });
const pass = (id, message) => findings.push({ id, status: "pass", message });
const skip = (id, message) => findings.push({ id, status: "skip", message });

const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));

/* ── 1. the sources are still where we read them ──────────────────────────────────────────────
   Reachability is checked with curl rather than fetch, for two reasons that both bite here. Node's
   fetch does not honour this environment's proxy variables, so every request would fail at the
   network rather than at the publisher and the lock would report all thirteen sources as moved.
   And flrules.org answers a request with no browser User-Agent with 403 rather than 401. A ranged
   GET fetches one byte rather than ten megabytes of scanned syllabus. */
if (OFFLINE) {
  skip("source-urls", `${SOURCES.length} authority URLs not checked (--offline)`);
} else {
  const BROWSER_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
  const unreachable = [];
  for (const entry of SOURCES) {
    try {
      const status = execFileSync(
        "curl",
        ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "-A", BROWSER_UA, "-r", "0-0", "-L", "--max-time", "30", entry.url],
        { encoding: "utf8" },
      ).trim();
      if (status !== "200" && status !== "206") unreachable.push(`${entry.id}: HTTP ${status} — ${entry.url}`);
    } catch (error) {
      unreachable.push(`${entry.id}: ${error.message.split("\n")[0]} — ${entry.url}`);
    }
  }
  if (unreachable.length > 0) fail("source-urls", `primary sources unreachable or moved:\n    ${unreachable.join("\n    ")}`);
  else pass("source-urls", `${SOURCES.length} authority URLs reachable`);

  /* A 200 is not enough: Phase 0 v1 received one for a missing DBPR URL whose body was the
     Elevator Safety site. Sources with contentValidation therefore have their bodies inspected,
     not merely their status codes. PDF bodies are checked for PDF magic here and against an
     extracted text copy below; HTML bodies must contain every identifying marker and none of the
     known soft-404 markers. */
  const invalidBodies = [];
  for (const entry of SOURCES.filter((s) => s.contentValidation)) {
    try {
      const body = execFileSync(
        "curl",
        ["-sS", "-A", BROWSER_UA, "-L", "--max-time", "30", entry.url],
        { maxBuffer: 20 * 1024 * 1024 },
      );
      const rule = entry.contentValidation;
      if (rule.magic && !body.subarray(0, rule.magic.length).equals(Buffer.from(rule.magic))) {
        invalidBodies.push(`${entry.id}: body does not begin ${JSON.stringify(rule.magic)}`);
      }
      if (rule.mediaType === "text/html") {
        const text = body.toString("utf8");
        for (const marker of rule.requiredMarkers ?? []) {
          if (!text.includes(marker)) invalidBodies.push(`${entry.id}: identifying marker missing: ${JSON.stringify(marker)}`);
        }
        for (const marker of rule.rejectsMarkers ?? []) {
          if (text.includes(marker)) invalidBodies.push(`${entry.id}: soft-404/wrong-content marker present: ${JSON.stringify(marker)}`);
        }
      }
    } catch (error) {
      invalidBodies.push(`${entry.id}: content fetch failed: ${error.message.split("\n")[0]}`);
    }
  }
  if (invalidBodies.length > 0) fail("source-content", `source bodies failed identity validation:\n    ${invalidBodies.join("\n    ")}`);
  else pass("source-content", `${SOURCES.filter((s) => s.contentValidation).length} marker-locked source bodies identify themselves correctly`);
}

/* ── 2. the documents on disk are the documents recorded ──────────────────────────────────────
   A missing copy fails the lock: a build that cannot open its own sources is not verified, it is
   merely untested. A changed hash is drift, not failure — see the docstring. */
{
  const missing = [];
  const invalidContent = [];
  for (const entry of SOURCES) {
    if (!entry.localCopy) continue;
    if (!exists(entry.localCopy)) { missing.push(`${entry.id}: ${entry.localCopy} is recorded in the manifest and is not on disk`); continue; }
    const buf = fs.readFileSync(path.join(root, entry.localCopy));
    if (entry.sha256 && sha256(buf) !== entry.sha256) {
      drift.push({
        id: entry.id,
        localCopy: entry.localCopy,
        recorded: entry.sha256,
        actual: sha256(buf),
        claimsToReRead: entry.materialClaims.map((c) => c.claim),
      });
    } else if (entry.bytes && buf.length !== entry.bytes) {
      drift.push({ id: entry.id, localCopy: entry.localCopy, recorded: `${entry.bytes} bytes`, actual: `${buf.length} bytes`, claimsToReRead: entry.materialClaims.map((c) => c.claim) });
    }
    const rule = entry.contentValidation;
    if (rule?.magic && !buf.subarray(0, rule.magic.length).equals(Buffer.from(rule.magic))) {
      invalidContent.push(`${entry.id}: held copy does not begin ${JSON.stringify(rule.magic)}`);
    }
    if (rule?.localTextCopy) {
      if (!exists(rule.localTextCopy)) invalidContent.push(`${entry.id}: validation text missing: ${rule.localTextCopy}`);
      else {
        const text = read(rule.localTextCopy);
        for (const marker of rule.requiredMarkers ?? []) {
          if (!text.includes(marker)) invalidContent.push(`${entry.id}: held text marker missing: ${JSON.stringify(marker)}`);
        }
        for (const marker of rule.rejectsMarkers ?? []) {
          if (text.includes(marker)) invalidContent.push(`${entry.id}: held text contains wrong-content marker: ${JSON.stringify(marker)}`);
        }
      }
    }
  }
  if (missing.length > 0) fail("held-copies", `held copies missing:\n    ${missing.join("\n    ")}`);
  else pass("held-copies", `${SOURCES.filter((s) => s.localCopy).length} held copies present`);
  if (invalidContent.length > 0) fail("held-content", `held copies failed semantic validation:\n    ${invalidContent.join("\n    ")}`);
  else pass("held-content", `${SOURCES.filter((s) => s.contentValidation).length} marker-locked held copies contain the expected documents`);
}

/* ── 3. every reading is inside the verification window ───────────────────────────────────────── */
{
  const stale = staleAuthorities();
  if (stale.length > 0) {
    fail("verification-age", `${stale.length} authority reading(s) older than ${VERIFICATION_MAX_AGE_DAYS} days — re-read required:\n    ${stale.map((s) => `${s.id} (read ${s.readOn}) — ${s.citation}`).join("\n    ")}`);
  } else {
    pass("verification-age", `every reading is within ${VERIFICATION_MAX_AGE_DAYS} days`);
  }
}

/* ── 4. an authority that could not be read is recorded as such ───────────────────────────────
   Florida differs from Texas here: everything was readable. The check is kept anyway, because the
   day one of these moves behind a portal is the day it matters, and a check that only exists after
   the failure is a check that did not catch it. */
{
  const unread = SOURCES.filter((s) => s.reachability !== REACHABILITY.READ && s.reachability !== REACHABILITY.READ_NOT_AUTHORITY);
  const relied = unread.filter((s) => s.materialClaims.length > 0);
  if (relied.length > 0) {
    fail("unread-authority-relied-on", `an authority that could not be read carries material claims:\n    ${relied.map((s) => `${s.id} (${s.reachability})`).join("\n    ")}`);
  } else if (unread.length > 0) {
    pass("unread-authority-relied-on", `${unread.length} authority not read, and nothing rests on it`);
  } else {
    pass("unread-authority-relied-on", "every authority was read");
  }
}

/* ── 5. nothing StateCourse publishes claims more than it holds ───────────────────────────────
   The scope is stated in the output, not merely in a comment, so that a reader of the lock's own
   report can see what it did not look at. */
const SCANNED = [
  "florida/submission",
  "florida/fl-sales-associate-course-i-63-v1",
  "docs/florida",
  "marketing/state-intros/FL-florida.md",
];
const NOT_SCANNED = [
  "florida/frec-sources — the statutes and rules themselves, where the prohibitions are written",
  "florida/regulatory — reading notes that transcribe and quote those same statutes and rules",
  "config/florida — where the forbidden-claim patterns are defined",
  "scripts/florida-source-lock.mjs — this file",
];

function collect(rel, out = []) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return out;
  const stat = fs.statSync(abs);
  if (stat.isFile()) { if (/\.(md|html|json|txt)$/.test(rel)) out.push(rel); return out; }
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    collect(path.join(rel, entry.name).split(path.sep).join("/"), out);
  }
  return out;
}

{
  const files = SCANNED.flatMap((s) => collect(s));
  const violations = [];
  for (const rel of files) {
    const text = read(rel);
    for (const claim of FORBIDDEN_CLAIMS) {
      const match = text.match(claim.pattern);
      if (match) violations.push(`${rel}: "${match[0].trim().slice(0, 90)}" — ${claim.id} (${claim.why})`);
    }
  }
  if (violations.length > 0) fail("forbidden-claims", `forbidden claim(s) found:\n    ${violations.join("\n    ")}`);
  else pass("forbidden-claims", `${files.length} Florida artifact(s) scanned, no forbidden claim`);
}

/* ── 6. no approval, permit or course number appears anywhere, because none is held ───────────
   This is the check that would have caught the class of defect this project has actually suffered:
   a placeholder that looks like a real number, committed once and never questioned again. */
{
  const held = SCHOOL.schoolPermitHeld || SCHOOL.instructorPermitHeld || SCHOOL.courseApprovalHeld;
  const numbers = [SCHOOL.schoolPermitNumber, SCHOOL.schoolLicenceNumber, SCHOOL.instructorPermitNumber, SCHOOL.courseNumber].filter(Boolean);
  if (!held && numbers.length > 0) {
    fail("unheld-credential-numbers", `the manifest carries credential number(s) while holding no Florida credential: ${numbers.join(", ")}`);
  } else if (held) {
    pass("unheld-credential-numbers", "a Florida credential is recorded as held — numbers must now be verified against the regulator's own record");
  } else {
    pass("unheld-credential-numbers", "no Florida credential is held and no number is recorded");
  }
}

/* ── 7. the public registry does not promise Florida ──────────────────────────────────────────── */
{
  const rel = "public/statecourse/data/state-registry.json";
  if (!exists(rel)) {
    skip("registry-florida-record", `${rel} not present`);
  } else {
    const fl = JSON.parse(read(rel)).states.find((s) => s.state_code === "FL");
    if (!fl) {
      fail("registry-florida-record", "the public state registry carries no FL record at all");
    } else {
      const problems = [];
      if (fl.provider_approval_number) problems.push(`provider_approval_number is set to ${fl.provider_approval_number}`);
      if (/approved/i.test(String(fl.provider_status))) problems.push(`provider_status reads "${fl.provider_status}"`);
      if (/^(available|open|enrolling)$/i.test(String(fl.public_status))) problems.push(`public_status reads "${fl.public_status}"`);
      if (problems.length > 0) fail("registry-florida-record", `the public FL record overstates what StateCourse holds:\n    ${problems.join("\n    ")}`);
      else pass("registry-florida-record", `FL public record reads "${fl.public_status}" / "${fl.provider_status}" with no approval number`);
    }
  }
}

/* ── report ───────────────────────────────────────────────────────────────────────────────────── */
const failed = findings.filter((f) => f.status === "fail");
const locked = failed.length === 0;

if (AS_JSON) {
  console.log(JSON.stringify({ manifestVersion: MANIFEST_VERSION, locked, findings, drift, scanned: SCANNED, notScanned: NOT_SCANNED, openConflicts: MANIFEST.openConflicts().length }, null, 2));
} else {
  console.log(`FL_REGULATORY_SOURCE_LOCK — ${MANIFEST_VERSION}\n`);
  for (const f of findings) {
    const mark = f.status === "pass" ? "  ok  " : f.status === "skip" ? " skip " : " FAIL ";
    console.log(`[${mark}] ${f.id}: ${f.message}`);
  }
  console.log(`\nclaim scan covered: ${SCANNED.join(", ")}`);
  console.log(`claim scan did NOT cover:\n    ${NOT_SCANNED.join("\n    ")}`);

  if (drift.length > 0) {
    console.log(`\nFL_REGULATORY_SOURCE_DRIFT — ${drift.length} held document(s) are not the documents recorded.`);
    console.log("This is not the lock failing. It means these must be read again before anything is filed:");
    for (const d of drift) {
      console.log(`  - ${d.id} (${d.localCopy})\n      recorded ${String(d.recorded).slice(0, 20)}…  now ${String(d.actual).slice(0, 20)}…`);
      for (const c of d.claimsToReRead) console.log(`      re-read: ${c.slice(0, 110)}`);
    }
  } else {
    console.log("\nFL_REGULATORY_SOURCE_DRIFT — none. Every held document still hashes to what was recorded.");
  }

  const conflicts = MANIFEST.openConflicts();
  console.log(`\nOPEN CONFLICTS — ${conflicts.length} disagreement(s) between or within the authorities, unresolved by design.`);
  for (const c of conflicts) console.log(`  - ${c.sourceId}: ${c.conflict.slice(0, 120)}…`);

  console.log(`\n${locked ? "LOCKED" : `LOCK FAILED — ${failed.length} finding(s)`}`);
}

process.exitCode = locked ? 0 : 1;
