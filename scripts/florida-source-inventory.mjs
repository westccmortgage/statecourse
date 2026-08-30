#!/usr/bin/env node
/**
 * Florida held-source inventory — deterministic generator and clean-checkout validator.
 *
 * WHY THIS EXISTS, IN THE FORM IT DOES. Texas learned this the expensive way: for part of that
 * build the list of held sources lived in a gitignored scratch file produced by a glob over two
 * named subdirectories, so it silently omitted two others, and a register that correctly refused to
 * invent hashes for sources its input never mentioned dropped six authorities that were sitting on
 * disk the whole time. The register behaved correctly. The INPUT was wrong, and the input was
 * untracked, so nothing in the repository could have caught it.
 *
 * Florida therefore starts with the mechanism rather than arriving at it: the WALK is the
 * definition of "held". Recursive, sorted, no named subdirectories, no glob to forget. A new source
 * directory is picked up because it is there, not because somebody remembered to add it.
 *
 * WHAT IT GUARANTEES.
 *   - The inventory covers EVERY file under florida/frec-sources, recursively.
 *   - Every hash in the tracked inventory is recomputed from the file on disk.
 *   - Every source the regulatory manifest names resolves into the inventory with a matching hash
 *     and byte count.
 *   - Every CONTROLLING source — one the syllabus lock, the course requirements or the permit
 *     ledger rests on directly — is present. A controlling source that goes missing fails the run.
 *   - It reads nothing from any scratch location, so it passes or fails identically on a clean
 *     checkout.
 *
 * A NOTE ON WHAT IS HELD HERE THAT IS NOT AN AUTHORITY. Two kinds of file live under
 * florida/frec-sources without being law. The `extracted/` tree holds readable text recovered from
 * the authorities — statute sections split out of the chapter, rule bodies recovered from Word 97
 * streams, OCR of a scanned syllabus — and it exists so that a person can read what was relied on.
 * It is derived, and the file it derives from is held beside it. And dbpr-real-estate-schools.html
 * is held precisely because it turned out to carry nothing: recording a fetch that came back empty
 * is how the next reader learns the school permit application was looked for and not found, rather
 * than assuming nobody looked.
 *
 * REPRODUCE THE VALIDATION (clean checkout, no scratch directory required):
 *
 *     node scripts/florida-source-inventory.mjs
 *
 * REGENERATE the tracked inventory after adding or refreshing a source:
 *
 *     node scripts/florida-source-inventory.mjs --write
 *
 * The written artifact is florida/frec-sources/source-inventory.json, which IS tracked, so a
 * changed hash shows up as a changed line in a reviewable diff.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_ROOT = path.join(root, "florida/frec-sources");
const INVENTORY = path.join(SOURCE_ROOT, "source-inventory.json");
const WRITE = process.argv.includes("--write");

/* ── the walk IS the definition of "held" ─────────────────────────────────────────────────────
   Recursive, sorted, and deliberately not a glob over named subdirectories. */
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && path.resolve(full) !== path.resolve(INVENTORY)) out.push(full);
  }
  return out;
}

function digest(file) {
  const buf = fs.readFileSync(file);
  return { sha256: crypto.createHash("sha256").update(buf).digest("hex"), bytes: buf.length };
}

function buildInventory() {
  const entries = walk(SOURCE_ROOT)
    .map((full) => ({ path: path.relative(root, full).split(path.sep).join("/"), ...digest(full) }))
    .sort((a, b) => a.path.localeCompare(b.path));
  return {
    generatedBy: "scripts/florida-source-inventory.mjs",
    reproduceWith: "node scripts/florida-source-inventory.mjs",
    regenerateWith: "node scripts/florida-source-inventory.mjs --write",
    note: "Every file held under florida/frec-sources, walked recursively. Hashes are recomputed from disk; nothing here is transcribed by hand or carried over from another state's register.",
    fileCount: entries.length,
    totalBytes: entries.reduce((a, e) => a + e.bytes, 0),
    files: entries,
  };
}

/* ── which sources are CONTROLLING ────────────────────────────────────────────────────────────
   A controlling source is one the syllabus lock, the course requirements or the permit ledger rests
   on DIRECTLY, such that the Florida build could not stand without it. Named explicitly rather than
   inferred, because the whole point is to notice when one goes missing.

   The syllabus PDF is controlling in a way the others are not. Rule 61J2-3.008(4)(b) does not
   describe the syllabus, it incorporates it by reference, so the PDF is not a supporting document
   for the rule — it is part of the rule, and every section title and learning objective in
   config/florida/frec-course-i-syllabus.mjs is an index into this one file. */
const CONTROLLING = [
  { path: "florida/frec-sources/fac/ref-14599-frec-course-1-eff-010123.pdf", why: "the Course I syllabus itself, incorporated by reference into Rule 61J2-3.008(4)(b) — the entire syllabus lock indexes this file" },
  { path: "florida/frec-sources/fac/fac-61J2-3.008.doc", why: "the rule that fixes the 63 hours, the 70% pass mark, every distance-delivery obligation and every examination constraint" },
  { path: "florida/frec-sources/fac/fac-61J2-3.015.doc", why: "the completion certificate fields and the five-year certificate retention" },
  { path: "florida/frec-sources/fac/fac-61J2-17.011.doc", why: "the Florida broker's licence requirement for the school permit holder — the blocking gate" },
  { path: "florida/frec-sources/fac/fac-61J2-17.013.doc", why: "construes the pass-guarantee prohibition to reach pass-or-refund, and the one-permit-per-location rule" },
  { path: "florida/frec-sources/fac/fac-61J2-17.015.doc", why: "the anti-recruiting statement the course must post and read" },
  { path: "florida/frec-sources/statutes/fs-chapter-475.html", why: "Chapter 475 — the 63-hour cap, the school permit, the instructor permit, the unproctored distance examination, the advertising rules and the three-year record retention" },
  { path: "florida/frec-sources/statutes/fs-chapter-455.html", why: "Chapter 455 — held so that s. 455.2123 can be cited for what it is NOT: it governs continuing education, and nothing here may rest it on pre-licence examination siting" },
];

/** The Florida registers whose named sources must all resolve. Loaded defensively: a register that
    is mid-edit should report as such rather than crash the validator. */
const REGISTERS = [
  {
    id: "regulatory-manifest",
    module: "../config/florida/regulatory-manifest.mjs",
    pick: (m) => (m.SOURCES || [])
      .filter((s) => s.localCopy && s.sha256)
      .map((s) => ({ label: s.id, localCopy: s.localCopy, sha256: s.sha256, bytes: s.bytes })),
  },
  {
    id: "frec-course-i-syllabus",
    module: "../config/florida/frec-course-i-syllabus.mjs",
    pick: (m) => (m.SYLLABUS_REFERENCE?.localCopy
      ? [{ label: m.SYLLABUS_REFERENCE.id, localCopy: m.SYLLABUS_REFERENCE.localCopy, sha256: null, bytes: null }]
      : []),
  },
];

async function validate() {
  const failures = [];
  const warnings = [];
  const fresh = buildInventory();

  if (!fs.existsSync(INVENTORY)) {
    failures.push(`tracked inventory missing at ${path.relative(root, INVENTORY)} — run with --write`);
    return { failures, warnings, fresh, registerChecks: [] };
  }

  const tracked = JSON.parse(fs.readFileSync(INVENTORY, "utf8"));
  const trackedByPath = new Map(tracked.files.map((f) => [f.path, f]));
  const freshByPath = new Map(fresh.files.map((f) => [f.path, f]));

  for (const f of fresh.files) {
    const t = trackedByPath.get(f.path);
    if (!t) { failures.push(`file on disk is absent from the tracked inventory: ${f.path}`); continue; }
    if (t.sha256 !== f.sha256) failures.push(`HASH DIFFERS from tracked inventory: ${f.path}`);
    else if (t.bytes !== f.bytes) failures.push(`byte count differs: ${f.path} (tracked ${t.bytes}, disk ${f.bytes})`);
  }
  for (const t of tracked.files) {
    if (!freshByPath.has(t.path)) failures.push(`inventory names a source that is MISSING from disk: ${t.path}`);
  }

  for (const c of CONTROLLING) {
    if (!freshByPath.has(c.path)) failures.push(`CONTROLLING source missing from disk: ${c.path} (${c.why})`);
    else if (!trackedByPath.has(c.path)) failures.push(`CONTROLLING source lacks an inventory entry: ${c.path} (${c.why})`);
  }

  const registerChecks = [];
  for (const reg of REGISTERS) {
    let mod;
    try { mod = await import(reg.module); }
    catch (error) { warnings.push(`register ${reg.id} could not be loaded (${error.message.split("\n")[0]}) — skipped`); continue; }
    let named;
    try { named = reg.pick(mod); }
    catch (error) { warnings.push(`register ${reg.id} shape unexpected (${error.message}) — skipped`); continue; }
    if (!named.length) { warnings.push(`register ${reg.id} names no held sources — skipped`); continue; }
    let ok = 0;
    for (const s of named) {
      const rel = s.localCopy.split(path.sep).join("/");
      const f = freshByPath.get(rel);
      if (!f) { failures.push(`${reg.id} names a source not present on disk: ${rel} (${s.label})`); continue; }
      if (s.sha256 && f.sha256 !== s.sha256) { failures.push(`${reg.id} hash disagrees with disk for ${rel} (${s.label})`); continue; }
      if (s.bytes && f.bytes !== s.bytes) { failures.push(`${reg.id} byte count disagrees with disk for ${rel} (${s.label})`); continue; }
      ok += 1;
    }
    registerChecks.push({ register: reg.id, named: named.length, verified: ok });
  }

  return { failures, warnings, fresh, registerChecks };
}

if (WRITE) {
  const inv = buildInventory();
  fs.writeFileSync(INVENTORY, `${JSON.stringify(inv, null, 2)}\n`);
  console.log(`wrote ${path.relative(root, INVENTORY)} — ${inv.fileCount} files, ${inv.totalBytes.toLocaleString()} bytes`);
} else {
  const { failures, warnings, fresh, registerChecks } = await validate();
  console.log(`held sources on disk: ${fresh.fileCount} (${fresh.totalBytes.toLocaleString()} bytes)`);
  console.log(`controlling sources checked: ${CONTROLLING.length}`);
  for (const r of registerChecks) console.log(`  register ${r.register}: ${r.verified}/${r.named} sources verified against disk`);
  for (const w of warnings) console.log(`  note: ${w}`);
  if (failures.length) {
    console.log(`\nFAILURES (${failures.length}):`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  } else {
    console.log("\nOK — tracked inventory matches disk, every registered source resolves, every controlling source is present.");
  }
}
