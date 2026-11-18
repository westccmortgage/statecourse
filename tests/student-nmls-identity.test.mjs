import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  readStudentNmlsId,
  nmlsIdProfileState,
  isStoredNmlsIdWellFormed,
  NMLS_ID_MAX_DIGITS,
  NMLS_ID_REJECTIONS,
} from "../config/nmls/student-identifier.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const MIGRATION = "database/030_student_nmls_identity.sql";
const HANDLER = "netlify/functions/_lib/student-portal-handler.mjs";
const SAVER = "netlify/functions/_lib/student-nmls-identity.mjs";

test("a plain identifier is accepted and returned unchanged", () => {
  assert.deepEqual(readStudentNmlsId("1405133"), { ok: true, value: "1405133" });
});

test("separators a person types or pastes are removed, not refused", () => {
  // Copying from a web page or a PDF routinely brings spaces, non-breaking spaces and
  // dashes with it. Refusing those would read to the learner as "your number is wrong".
  for (const typed of ["140 5133", "140-5133", "140 5133", " 1405133 ", "140‑5133"]) {
    assert.deepEqual(readStudentNmlsId(typed), { ok: true, value: "1405133" }, typed);
  }
});

test("a number is accepted as readily as the string of it", () => {
  assert.deepEqual(readStudentNmlsId(1405133), { ok: true, value: "1405133" });
});

// ---- the refusals. These are the point of the module: without them it accepts anything.

test("an empty or whitespace-only entry is refused", () => {
  for (const nothing of ["", "   ", " ", "-", " - - "]) {
    const judged = readStudentNmlsId(nothing);
    assert.equal(judged.ok, false, JSON.stringify(nothing));
    assert.equal(judged.reason, NMLS_ID_REJECTIONS.EMPTY);
  }
});

test("anything that is not digits is refused, which is what a typo looks like", () => {
  for (const wrong of ["14O5133", "nmls1405133", "1405133a", "1,405,133", "140.5133", "+1405133", "१४०५१३३"]) {
    const judged = readStudentNmlsId(wrong);
    assert.equal(judged.ok, false, wrong);
    assert.equal(judged.reason, NMLS_ID_REJECTIONS.NOT_DIGITS, wrong);
  }
});

test("an entry longer than any identifier is refused rather than truncated", () => {
  const tooLong = "1".repeat(NMLS_ID_MAX_DIGITS + 1);
  const judged = readStudentNmlsId(tooLong);
  assert.equal(judged.ok, false);
  assert.equal(judged.reason, NMLS_ID_REJECTIONS.TOO_LONG);
  // Silently keeping the first twelve digits would store a different person's number.
  assert.equal(judged.value, undefined);
  assert.equal(readStudentNmlsId("1".repeat(NMLS_ID_MAX_DIGITS)).ok, true);
});

test("a value that is not text at all is refused without throwing", () => {
  for (const alien of [null, undefined, {}, [], true, Symbol.iterator, () => "1405133"]) {
    assert.equal(readStudentNmlsId(alien).ok, false);
  }
});

// ---- what the learner is shown

test("no stored number is reported as absent, not as an empty saved value", () => {
  for (const nothing of [null, undefined, "", "   "]) {
    const state = nmlsIdProfileState(nothing);
    assert.equal(state.present, false);
    assert.equal(state.value, null);
  }
});

test("a stored number is always correctable, because BioSig requires a self-service fix", () => {
  const state = nmlsIdProfileState("1405133");
  assert.equal(state.present, true);
  assert.equal(state.value, "1405133");
  assert.equal(state.correctable, true);
  assert.equal(nmlsIdProfileState(null).correctable, true);
});

test("isStoredNmlsIdWellFormed separates a clean column from a legacy one", () => {
  assert.equal(isStoredNmlsIdWellFormed("1405133"), true);
  assert.equal(isStoredNmlsIdWellFormed(null), false);
  assert.equal(isStoredNmlsIdWellFormed("NMLS-1405133"), false);
});

// ---- the database must enforce the same rule, or the two drift apart silently

test("the SQL check and the JavaScript rule state the same bound", () => {
  const sql = read(MIGRATION);
  const bounds = [...sql.matchAll(/\[0-9\]\{1,(\d+)\}/g)].map((m) => Number(m[1]));
  assert.ok(bounds.length >= 2, "both the column constraint and the log constraint must state the rule");
  for (const bound of bounds) {
    assert.equal(bound, NMLS_ID_MAX_DIGITS,
      `SQL allows ${bound} digits but config/nmls/student-identifier.mjs allows ${NMLS_ID_MAX_DIGITS}`);
  }
});

test("the identifier column is nullable, so an empty profile is never a verified one", () => {
  const sql = read(MIGRATION);
  assert.match(sql, /add column if not exists nmls_id text;/);
  // \b excludes the log's own new_nmls_id, which is correctly NOT NULL: a change entry
  // without a new value would be meaningless.
  assert.doesNotMatch(sql, /\bnmls_id text not null/);
  assert.doesNotMatch(sql, /alter column nmls_id set not null/);
  assert.match(sql, /new_nmls_id text not null/, "a logged change must carry its new value");
});

test("the change log cannot record a change that changed nothing", () => {
  assert.match(read(MIGRATION), /previous_nmls_id is null or previous_nmls_id <> new_nmls_id/);
});

test("no browser role may write the identifier or call the writer", () => {
  const sql = read(MIGRATION);
  // The write path is the service role inside a function and nothing else.
  assert.match(sql, /revoke insert, update, delete on students from authenticated;/);
  assert.match(sql, /revoke all on function set_student_nmls_id\(uuid, text, text\) from public, anon, authenticated;/);
  // A learner reading their own history is fine; writing it is not.
  assert.match(sql, /for select to authenticated using \(student_id = auth\.uid\(\)\)/);
  assert.doesNotMatch(sql, /for (insert|update|delete) to authenticated/);
});

test("the value and its log entry are written in one transaction", () => {
  const sql = read(MIGRATION);
  const body = sql.slice(sql.indexOf("create or replace function set_student_nmls_id"));
  // Reading the previous value without locking lets two corrections log the wrong one.
  assert.match(body, /for update/);
  assert.ok(body.indexOf("insert into student_nmls_id_changes") < body.indexOf("update students set nmls_id"),
    "the log entry must be written inside the same transaction as the change");
});

// ---- the server must not take the student's identity from the request

test("the saver is given the session's student, never a value from the request body", () => {
  const handler = read(HANDLER);
  assert.match(handler, /saveStudentNmlsId\(auth\.student\.id,\s*input\.nmlsId\)/);
  assert.doesNotMatch(handler, /saveStudentNmlsId\(\s*input\./);
});

test("the saver refuses a bad entry before it reaches the database", () => {
  const saver = read(SAVER);
  const validation = saver.indexOf("readStudentNmlsId(raw)");
  const call = saver.indexOf('rpc("set_student_nmls_id"');
  assert.ok(validation > -1 && call > -1);
  assert.ok(validation < call, "the entry must be judged before any database call");
  assert.match(saver, /if \(!judged\.ok\) refuse\(judged\.reason\);/);
});

test("correcting the identifier does not require resending the name", () => {
  const handler = read(HANDLER);
  // The old handler passed the whole body to updateStudentProfile, which refuses without
  // both names — so an identifier-only correction would have been rejected.
  assert.doesNotMatch(handler, /const student = await updateStudentProfile\(auth\.accessToken,input\);\n\s*await dbRequest\("student_portal_events"/);
  assert.match(handler, /const wantsName = input\.firstName !== undefined \|\| input\.lastName !== undefined;/);
  assert.match(handler, /const wantsNmlsId = input\.nmlsId !== undefined;/);
  assert.match(handler, /if \(!wantsName && !wantsNmlsId\) throw/);
});

test("the portal page offers a field the learner can edit, not a read-only display", () => {
  const page = read("public/statecourse/student/index.html");
  assert.match(page, /id="nmlsIdInput"/);
  assert.match(page, /id="nmlsIdentityForm"/);
  const script = read("public/statecourse/student/student-portal.js");
  // The saved value is placed into the field so a typo is edited, not retyped.
  assert.match(script, /nmlsIdInput\.value = present \? String\(state\.value \?\? ""\) : "";/);
  // Every refusal the server can return has a sentence for the learner.
  for (const reason of Object.values(NMLS_ID_REJECTIONS)) {
    assert.ok(script.includes(reason), `the portal has no message for ${reason}`);
  }
});
