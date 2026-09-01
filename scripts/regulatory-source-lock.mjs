#!/usr/bin/env node
/*
 * REGULATORY_SOURCE_LOCK
 *
 * The two worst defects this project has had were the same defect wearing different clothes.
 * The BPPE exemption cited a code section the Bureau's own evidentiary rule made unprovable,
 * and an RE 306 instruction carried a contact title — "Managing Member" — that no source
 * states. Neither was a coding error. Both were a document saying something its source does
 * not say, and neither was caught by reading the document, because a document that reads well
 * reads well whether or not it is true.
 *
 * This lock exists to catch that class. It fails when:
 *
 *   1. A primary-source URL is unreachable or has moved.
 *   2. A Department form held on disk no longer matches the revision and content recorded for
 *      it — the Department revised the form and the filing would go out on a superseded one.
 *   3. A legal authority has not been re-read inside the verification window.
 *   4. A generated submission document makes a claim stronger than its source supports.
 *
 * Check 4 is the one that matters most and the hardest to do honestly. It cannot judge whether
 * an argument is sound. What it can do — and what would have caught both defects — is refuse a
 * regulated fact that appears in a generated document without appearing in the manifest, and
 * refuse language that asserts more certainty than "sought" where no approval exists.
 *
 * Network checks are skipped with --offline, which is what CI without egress should use. A
 * skipped check is reported as skipped and never as a pass: the point of this file is that
 * nothing is assumed.
 *
 * Usage:  node scripts/regulatory-source-lock.mjs [--offline] [--json]
 */

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AUTHORITIES,
  BPPE_EXEMPTION,
  DRE_FORMS,
  FORBIDDEN_CLAIMS,
  MANIFEST_VERSION,
  PROGRAMS,
  SCHOOL,
  VERIFICATION_MAX_AGE_DAYS,
  staleAuthorities,
} from "../config/california/regulatory-manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const OFFLINE = args.includes("--offline");
const AS_JSON = args.includes("--json");

/*
 * TWO QUESTIONS, NOT ONE
 *
 * An earlier version of this file answered "LOCKED" or "BROKEN" and folded two different
 * questions into that one word.
 *
 *   THE LOCK asks whether the sources are still there and whether anything we say goes further
 *   than what they say. A source that has moved, a reading that has gone stale, a filing
 *   document that claims an approval nobody issued — each of those is a defect, and the lock
 *   FAILS.
 *
 *   DRIFT asks whether a document we hold has changed since we recorded it. A new hash on a
 *   Department PDF is not by itself a change in the law. The Department reissues forms for
 *   reasons that have nothing to do with what they require: a corrected address, a new
 *   accessibility tag, a re-export. Calling that a broken lock trains a reader to dismiss the
 *   word, and the next time it means something they will dismiss it too.
 *
 * So drift is reported separately and says what it actually is: this document is not the one
 * we read, and these are the claims taken from it that must be read again. It blocks a filing
 * — nothing goes out on an unreviewed revision — but it is not the lock failing.
 */
const findings = [];
const drift = [];
const fail = (id, message) => findings.push({ id, status: "fail", message });
const pass = (id, message) => findings.push({ id, status: "pass", message });
const skip = (id, message) => findings.push({ id, status: "skip", message });
const drifted = (record) => drift.push(record);

/* ── 1. the sources are still where we read them ──────────────────────────────────────── */

if (OFFLINE) {
  skip("source-urls", `${AUTHORITIES.length} authority URLs not checked (--offline)`);
} else {
  /*
   * Reachability is checked with curl rather than fetch, for two reasons that both bite here.
   *
   * Outbound HTTPS in this environment goes through a configured agent proxy, and Node's fetch
   * does not honour the proxy environment variables, so every request fails at the network
   * rather than at the publisher — the lock would report all eight sources as moved and mean
   * none of it.
   *
   * And both publishers reject a request with no browser User-Agent, with 403 rather than 401.
   * The header is what a browser sends; nothing else about the request is disguised.
   *
   * A ranged GET fetches one byte rather than a megabyte of PDF. 206 is the success case; 200
   * means the server ignored the range and sent the document, which is also fine.
   */
  const BROWSER_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
  const unreachable = [];
  for (const entry of AUTHORITIES) {
    try {
      const status = execFileSync(
        "curl",
        ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "-A", BROWSER_UA, "-r", "0-0", "-L", "--max-time", "25", entry.url],
        { encoding: "utf8" },
      ).trim();
      if (status !== "200" && status !== "206") unreachable.push(`${entry.id}: HTTP ${status} — ${entry.url}`);
    } catch (error) {
      unreachable.push(`${entry.id}: ${error.message.split("\n")[0]} — ${entry.url}`);
    }
  }
  if (unreachable.length > 0) fail("source-urls", `primary sources unreachable or moved:\n    ${unreachable.join("\n    ")}`);
  else pass("source-urls", `${AUTHORITIES.length} authority URLs reachable`);
}

/* ── 2. the documents on disk are the documents recorded ──────────────────────────────── */

{
  /*
   * A missing form is a lock failure: we cannot file on a document we do not have, and we
   * cannot know what it says. A CHANGED form is drift: we have a document, it is not the one
   * whose claims are recorded, and the answer is to read it rather than to update a hash.
   */
  const absent = [];
  for (const form of DRE_FORMS) {
    const full = path.join(root, form.file);
    if (!fs.existsSync(full)) {
      absent.push(`${form.id}: ${form.file} is missing`);
      continue;
    }
    const digest = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex").slice(0, 16);
    if (digest !== form.sha256Prefix) {
      drifted({
        sourceId: form.id,
        kind: "form",
        title: form.title,
        revision: form.revision,
        canonicalUrl: form.url,
        recordedHash: form.sha256Prefix,
        foundHash: digest,
        claimsToReRead: [],
        action:
          "Read the document again and confirm the revision printed on its face. If what it requires is unchanged, record the new hash with the date it was re-read. Never update the hash alone.",
      });
    }
  }
  if (absent.length > 0) fail("form-presence", `Department forms are missing:\n    ${absent.join("\n    ")}`);
  else pass("form-presence", `${DRE_FORMS.length} Department forms are held`);
}

{
  /* The same question for the authorities that have a local copy. An authority served as
     generated HTML has none, and says so rather than being assumed unchanged. */
  const hashed = AUTHORITIES.filter((entry) => entry.localCopy && entry.contentHash);
  for (const entry of hashed) {
    const full = path.join(root, entry.localCopy);
    if (!fs.existsSync(full)) {
      fail("authority-copy", `${entry.id}: the copy at ${entry.localCopy} is missing`);
      continue;
    }
    const digest = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex").slice(0, 16);
    if (digest !== entry.contentHash) {
      drifted({
        sourceId: entry.id,
        kind: "authority",
        title: entry.title,
        revision: entry.revision,
        canonicalUrl: entry.url,
        recordedHash: entry.contentHash,
        foundHash: digest,
        claimsToReRead: entry.materialClaims.map((claim) => ({ id: claim.id, claim: claim.claim, reliedOnBy: claim.reliedOnBy })),
        action:
          "Read the passage again. If the claim below still stands word for word, record the new hash and the date. If it does not, everything listed under reliedOnBy is wrong until it is corrected.",
      });
    }
  }
  const unhashed = AUTHORITIES.filter((entry) => !entry.contentHash);
  pass(
    "authority-copies",
    `${hashed.length} authorities hashed against a local copy; ${unhashed.length} have none and are checked by re-reading`,
  );
}

/* ── 3. nothing has gone stale ─────────────────────────────────────────────────────────── */

{
  const stale = staleAuthorities();
  if (stale.length > 0) {
    fail(
      "verification-age",
      `not re-read within ${VERIFICATION_MAX_AGE_DAYS} days: ${stale.join(", ")}. ` +
        "Read the text again and update verifiedAsOf — do not move the date without reading.",
    );
  } else {
    pass("verification-age", `all ${AUTHORITIES.length} authorities read within ${VERIFICATION_MAX_AGE_DAYS} days`);
  }
}

/* ── 4. no document claims more than its source ───────────────────────────────────────── */

const submissionFiles = () => {
  const base = path.join(root, "california/submission");
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      fs
        .readdirSync(path.join(base, entry.name))
        .filter((name) => name.endsWith(".md"))
        .map((name) => ({ relative: `${entry.name}/${name}`, full: path.join(base, entry.name, name) })),
    );
};

{
  /* A quotation is a mention, not a claim: the work order and the QA checklist both name the
     forbidden strings in order to forbid them. A hit inside quotes or backticks is skipped,
     as is one whose sentence denies it. */
  const isMention = (text, index, length) => {
    const before = text.slice(Math.max(0, index - 2), index);
    const after = text.slice(index + length, index + length + 2);
    if (/["'`]$/.test(before) && /^["'`]/.test(after)) return true;
    const context = text.slice(Math.max(0, index - 130), index + 90);
    return /\bnot\b|\bno\b|\buntil\b|never|forbid|must not|cannot|withdrawn|superseded|were wrong|was wrong/i.test(context);
  };

  const offenders = [];
  for (const file of submissionFiles()) {
    const text = fs.readFileSync(file.full, "utf8");
    for (const claim of FORBIDDEN_CLAIMS) {
      const hit = text.match(claim.pattern);
      if (!hit) continue;
      if (isMention(text, hit.index, hit[0].length)) continue;
      offenders.push(`${file.relative}: "${hit[0]}" — ${claim.why}`);
    }
  }
  if (offenders.length > 0) fail("forbidden-claims", `claims stronger than any source supports:\n    ${offenders.join("\n    ")}`);
  else pass("forbidden-claims", `${submissionFiles().length} submission documents carry no forbidden claim`);
}

{
  /*
   * The regulated facts, checked against the manifest wherever a generated document states
   * them. This is the check that would have caught "Managing Member": a title in a filing
   * document that the manifest does not carry is a title nothing stands behind.
   */
  const drift = [];
  const titlePattern = /\btitle\s+\*{0,2}([A-Z][A-Za-z ]{2,30}?)\*{0,2}\s+in (?:each|the owner)/g;
  for (const file of submissionFiles()) {
    const text = fs.readFileSync(file.full, "utf8");
    for (const match of text.matchAll(titlePattern)) {
      if (match[1].trim() !== SCHOOL.contactTitle) {
        drift.push(`${file.relative}: states the title "${match[1].trim()}", which the manifest does not carry`);
      }
    }
    /* Course hours, where stated, must be the manifest's. */
    for (const program of PROGRAMS) {
      if (!text.includes(program.title)) continue;
      const hours = text.match(new RegExp(`${program.title}[^\\n]{0,160}?(\\d{2,3})\\s*(?:clock\\s*)?hours`, "i"));
      if (hours && Number(hours[1]) !== program.hours) {
        drift.push(`${file.relative}: states ${hours[1]} hours for ${program.title}; the manifest says ${program.hours}`);
      }
    }
    /* And the BPPE basis must be the one the manifest relies on. */
    if (/94874\(d\)\(2\)\(A\)/.test(text) && !/withdrawn|not relied on|possible future basis/i.test(text)) {
      drift.push(`${file.relative}: relies on ${BPPE_EXEMPTION.withdrawnBasis}, which was withdrawn`);
    }
  }
  if (drift.length > 0) fail("manifest-drift", `documents state regulated facts the manifest does not:\n    ${drift.join("\n    ")}`);
  else pass("manifest-drift", "every regulated fact stated in a submission document matches the manifest");
}

{
  /* Approval language. Until DRE issues something, the only true statement is that approval is
     sought — and the manifest's own status line must say so rather than being quietly edited. */
  if (SCHOOL.sponsorId !== null) fail("approval-status", "the manifest carries a sponsor id DRE has not assigned");
  else if (PROGRAMS.some((program) => program.approvalNumber !== null)) fail("approval-status", "a program carries an approval number");
  else if (!/Approval sought/i.test(SCHOOL.approvalStatus)) fail("approval-status", "the manifest's approval status no longer says approval is sought");
  else pass("approval-status", "no approval is claimed anywhere in the manifest");
}

/* ── report ───────────────────────────────────────────────────────────────────────────── */

const failed = findings.filter((finding) => finding.status === "fail");
const skipped = findings.filter((finding) => finding.status === "skip");
const LOCK = failed.length === 0 ? "PASS" : "FAIL";
const DRIFT = drift.length === 0 ? "NONE" : drift.map((entry) => entry.sourceId).join(", ");

if (AS_JSON) {
  console.log(
    JSON.stringify(
      {
        manifest: MANIFEST_VERSION,
        REGULATORY_SOURCE_LOCK: LOCK,
        REGULATORY_SOURCE_DRIFT: DRIFT,
        findings,
        drift,
      },
      null,
      2,
    ),
  );
} else {
  console.log(`\n  REGULATORY_SOURCE_LOCK — manifest ${MANIFEST_VERSION}\n`);
  for (const finding of findings) {
    const mark = finding.status === "pass" ? "PASS " : finding.status === "skip" ? "SKIP " : "FAIL ";
    console.log(`  ${mark} ${finding.id.padEnd(20)} ${finding.message.split("\n")[0]}`);
    for (const line of finding.message.split("\n").slice(1)) console.log(`        ${line}`);
  }
  console.log("");
  console.log(`  REGULATORY_SOURCE_LOCK: ${LOCK}`);
  if (LOCK === "FAIL") {
    for (const finding of failed) console.log(`    ${finding.id}: ${finding.message.split("\n")[0]}`);
  }
  console.log(`  REGULATORY_SOURCE_DRIFT: ${DRIFT}`);
  for (const entry of drift) {
    console.log("");
    console.log(`    ${entry.sourceId} — ${entry.title}${entry.revision ? ` (${entry.revision})` : ""}`);
    console.log(`      recorded ${entry.recordedHash}, found ${entry.foundHash}`);
    if (entry.canonicalUrl) console.log(`      ${entry.canonicalUrl}`);
    console.log(`      ${entry.action}`);
    for (const claim of entry.claimsToReRead) {
      console.log(`      claim ${claim.id}: ${claim.claim}`);
      console.log(`        relied on by: ${claim.reliedOnBy.join(", ")}`);
    }
  }
  console.log("");
  if (skipped.length > 0) console.log(`  ${skipped.length} check(s) skipped and NOT counted as passing.\n`);
  if (DRIFT !== "NONE") {
    console.log("  Drift is not the lock failing. It means a document we hold is not the one whose claims");
    console.log("  are recorded, and nothing is filed on it until it has been read again.\n");
  }
}

/* Either one blocks a filing. They are reported apart because they mean different things and
   call for different work, not because one of them is advisory. */
process.exit(failed.length === 0 && drift.length === 0 ? 0 : 1);
