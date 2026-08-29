/**
 * Texas held-source inventory — clean-checkout reproducibility.
 *
 * WHAT THIS PROTECTS. During the Principles II build the list of held sources lived for a while in
 * a gitignored scratch file whose glob covered only two of the four source directories. The
 * Principles II register, behaving exactly as designed, refused to invent hashes for the sources
 * that file omitted and excluded five controlling TREC rules and an official TREC guidance article
 * that were sitting on disk, already hashed, in a committed artifact. Nothing in the repository
 * could have caught that, because the faulty input was untracked.
 *
 * These tests make the inventory a committed, reproducible artifact and prove three things:
 *   1. the tracked inventory still matches the files on disk;
 *   2. every source named by a committed register or lock resolves to a real file with a matching
 *      hash — no register may name a source the repository does not hold;
 *   3. every CONTROLLING source is present, where controlling means the curriculum, the assessment
 *      logic or the compliance logic relies on it directly. In particular 22 TAC §§ 535.62 and
 *      535.65 must be held, because every assessment count in this course is derived from them and
 *      the Occupations Code is not a substitute for an administrative rule.
 *
 * Nothing here reads .prins2-drafts/ or any other scratch location, so these tests pass or fail
 * identically on a clean checkout.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_ROOT = path.join(root, "texas/trec-sources");
const INVENTORY = path.join(SOURCE_ROOT, "source-inventory.json");
const SCRIPT = path.join(root, "scripts/texas-source-inventory.mjs");

const inventory = JSON.parse(fs.readFileSync(INVENTORY, "utf8"));
const byPath = new Map(inventory.files.map((f) => [f.path, f]));

test("the tracked source inventory exists and is not a stub", () => {
  assert.ok(inventory.files.length > 50, `inventory holds ${inventory.files.length} files`);
  assert.equal(typeof inventory.reproduceWith, "string");
  assert.ok(inventory.files.every((f) => /^[0-9a-f]{64}$/.test(f.sha256)), "every entry carries a full sha256");
  assert.ok(inventory.files.every((f) => Number.isInteger(f.bytes) && f.bytes > 0), "every entry carries a byte count");
});

test("every file under texas/trec-sources is in the inventory, with the hash it has on disk", () => {
  const walk = (dir, out = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, out);
      else if (e.isFile() && path.resolve(full) !== path.resolve(INVENTORY)) out.push(full);
    }
    return out;
  };
  const missing = [];
  const mismatched = [];
  for (const full of walk(SOURCE_ROOT)) {
    const rel = path.relative(root, full).split(path.sep).join("/");
    const entry = byPath.get(rel);
    if (!entry) { missing.push(rel); continue; }
    const buf = fs.readFileSync(full);
    const sha = crypto.createHash("sha256").update(buf).digest("hex");
    if (sha !== entry.sha256 || buf.length !== entry.bytes) mismatched.push(rel);
  }
  assert.deepEqual(missing, [], "files on disk absent from the tracked inventory");
  assert.deepEqual(mismatched, [], "files whose hash or size differs from the tracked inventory");
});

test("the inventory names no source the repository does not hold", () => {
  const absent = inventory.files.filter((f) => !fs.existsSync(path.join(root, f.path))).map((f) => f.path);
  assert.deepEqual(absent, [], "inventory entries with no file on disk");
});

/* The directories a Texas source can live in. The point of the walk-based generator is that adding
   a new one cannot silently escape the inventory, so assert each known kind is actually represented
   — this is the specific failure that occurred. */
test("the inventory covers every source directory, not just statutes and federal", () => {
  const kinds = {
    "statutes/": "Texas codes and the Constitution",
    "federal/": "United States Code and CFR",
    "trec-rules/": "22 TAC administrative rules",
    "articles/": "official TREC guidance",
  };
  for (const [prefix, what] of Object.entries(kinds)) {
    const n = inventory.files.filter((f) => f.path.includes(`/trec-sources/${prefix}`)).length;
    assert.ok(n > 0, `no ${what} in the inventory (${prefix}) — the omission this test exists to prevent`);
  }
});

test("the controlling TREC administrative rules are held and hashed", () => {
  /* Occupations Code chs. 1101/1103 do NOT substitute for these: the assessment counts, the passing
     score and the adoption of PRINS 2-1 by reference come from the rules themselves. */
  for (const section of ["535.55", "535.62", "535.63", "535.64", "535.65"]) {
    const rel = `texas/trec-sources/trec-rules/${section}.txt`;
    const entry = byPath.get(rel);
    assert.ok(entry, `22 TAC § ${section} is controlling and must be in the inventory`);
    assert.ok(entry.bytes > 500, `22 TAC § ${section} looks truncated at ${entry?.bytes} bytes`);
  }
});

test("the official TREC guidance article relied on for the 2026 representation changes is held", () => {
  const rel = "texas/trec-sources/articles/what-changes-2026-buyer-tenant-representation.html";
  assert.ok(byPath.get(rel), "the buyer/tenant representation article is guidance the course relies on for the open-house application and the subagency clarification, and must be held");
});

test("every committed register names only sources the inventory holds, at the same hash", async () => {
  const registers = [
    ["trec-rules-source-lock", "../config/texas/trec-rules-source-lock.mjs", (m) => (m.RULES || []).map((r) => [r.section, r.localCopy, r.sha256])],
    ["regulatory-manifest", "../config/texas/regulatory-manifest.mjs", (m) => (m.SOURCES || []).filter((s) => s.localCopy && s.sha256).map((s) => [s.id, s.localCopy, s.sha256])],
    ["principles-i-statute-sources", "../config/texas/statute-sources.mjs", (m) => (m.ALL_SOURCES || []).filter((s) => s.localCopy && s.sha256).map((s) => [s.id, s.localCopy, s.sha256])],
  ];
  for (const [id, spec, pick] of registers) {
    const mod = await import(spec);
    const named = pick(mod);
    assert.ok(named.length > 0, `${id} names no hashed source`);
    for (const [label, localCopy, sha256] of named) {
      const rel = String(localCopy).split(path.sep).join("/");
      const entry = byPath.get(rel);
      assert.ok(entry, `${id} names ${rel} (${label}) which is not in the inventory`);
      assert.equal(entry.sha256, sha256, `${id} hash for ${rel} (${label}) disagrees with the inventory`);
    }
  }
});

test("the validator reproduces cleanly and exits zero", () => {
  const out = execFileSync("node", [SCRIPT], { cwd: root, encoding: "utf8" });
  assert.match(out, /OK — tracked inventory matches disk/);
});

test("the validator actually fails when a hash is wrong — it is not a rubber stamp", () => {
  const original = fs.readFileSync(INVENTORY, "utf8");
  try {
    const tampered = JSON.parse(original);
    const target = tampered.files.find((f) => f.path.endsWith("trec-rules/535.62.txt"));
    assert.ok(target, "expected 535.62 in the inventory");
    target.sha256 = "0".repeat(64);
    fs.writeFileSync(INVENTORY, `${JSON.stringify(tampered, null, 2)}\n`);
    let failed = false;
    try { execFileSync("node", [SCRIPT], { cwd: root, encoding: "utf8", stdio: "pipe" }); }
    catch { failed = true; }
    assert.ok(failed, "validator must exit non-zero when a tracked hash does not match disk");
  } finally {
    fs.writeFileSync(INVENTORY, original);
  }
});
