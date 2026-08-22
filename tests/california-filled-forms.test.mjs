/*
 * The filled Department forms, and what must not be filled on them.
 *
 * Three defects were found by a person rendering the PDFs and looking at them. Nothing in this
 * suite would have caught any of the three, because every one was a question of what the applicant
 * is entitled to answer rather than of whether the answer was written correctly:
 *
 *   RE 306 needs THREE signatures, not two. Item 11 on page 1 carries its own signature field, and
 *   the Course Provider Handbook says of it: "Contact(s) original signature is required." The print
 *   set's instruction named only the two on page 3, and would have sent the application out one
 *   signature short.
 *
 *   RE 336's licence question at the very bottom is the INSTRUCTOR's to answer. The form addresses
 *   it to them in its own words, and the Handbook says the primary contact completes everything
 *   "except for the instructor's signature and the real estate license status question on the very
 *   bottom of the form". It had been pre-filled with YES and the licence number.
 *
 *   RE 336's city and state of execution are established at the moment of signing, in the same
 *   clause as the date: "Signed in the City of ___, State of ___, this ___ day of ___, 20___."
 *   They had been pre-printed as Redondo Beach while the date was left blank — half a fact about
 *   an event that had not happened, and false on its face if the form were signed anywhere else,
 *   under penalty of perjury.
 *
 * So these tests are mostly about emptiness. A field left blank on purpose is indistinguishable
 * from a field somebody forgot, and only a test can tell the difference later.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { PROGRAMS, SB1495 } from "../config/california/regulatory-manifest.mjs";
import { COURSE_DESIGN, FINAL_EXAM, INSTRUCTOR, PROVIDER } from "../config/california/submission-facts.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const slug = (title) => title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const READ = `
import json, sys
from pypdf import PdfReader
fields = PdfReader(sys.argv[1]).get_fields() or {}
print(json.dumps({k: (None if v.get("/V") is None else str(v.get("/V"))) for k, v in fields.items()}))
`;
const fieldsOf = (file) =>
  JSON.parse(execFileSync("python3", ["-c", READ, path.join(ROOT, file)], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }));

const isBlank = (value) => value === null || value === "" || value === "/Off";

const re306 = (program) => `california/dre-sources/generated/RE306-${slug(program.title)}.pdf`;
const re336 = (program) => `california/dre-sources/generated/RE336-${slug(program.title)}.pdf`;

/* ── the forms exist and carry the answers ─────────────────────────────────────────────── */

test("both Department forms are generated for every course", () => {
  for (const program of PROGRAMS) {
    for (const file of [re306(program), re336(program)]) {
      assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} does not exist`);
    }
  }
});

test("RE 306 carries the school, the course and the examination as the manifest states them", () => {
  for (const program of PROGRAMS) {
    const fields = fieldsOf(re306(program));
    assert.equal(fields["1 NAME OF APPLICANT SCHOOL"], PROVIDER.legalName);
    assert.equal(fields["COURSE TITLE"], program.title);
    assert.equal(fields["TOTAL NUMBER OF INSTRUCTION HOURS Minimum 45 hours required"], String(program.hours));
    assert.equal(fields["NUMBER OF QUESTIONS ON FINAL EXAM"], String(FINAL_EXAM.questions));
    assert.equal(fields["MINIMUM PASSING SCORE"], `${FINAL_EXAM.passingPercent}%`);
    assert.equal(fields["PRINTED NAME OF PRIMARY CONTACT"], INSTRUCTOR.name);
    assert.equal(fields["TITLE OF PRIMARY CONTACT"], INSTRUCTOR.contactTitle);
    /* Two certifications on page 3, so the owner block is filled too. */
    assert.equal(fields["PRINTED NAME OF OWNER OR AUTHORIZED OFFICIAL"], INSTRUCTOR.name);
  }
});

test("item 23A answers yes for the practice course and no for the other two", () => {
  for (const program of PROGRAMS) {
    const fields = fieldsOf(re306(program));
    if (program.sb1495) {
      assert.ok(!isBlank(fields["Check Box1"]), `${program.title} does not answer YES to item 23A`);
      assert.ok(isBlank(fields["Check Box2"]), `${program.title} answers both YES and NO to item 23A`);
      assert.match(fields["Detail the interactive participatory component"], /consumer/i);
      assert.match(fields["Detail the interactive participatory component"], /real estate professional/i);
    } else {
      assert.ok(!isBlank(fields["Check Box2"]), `${program.title} does not answer NO to item 23A`);
      assert.ok(isBlank(fields["Check Box1"]));
      assert.ok(isBlank(fields["Detail the interactive participatory component"]));
    }
  }
});

/* ── items 15A and 15B, against the arrangement they describe ──────────────────────────── */

test("15A names the arrangement the regulation names", () => {
  /* The Handbook: "All courses which are not presented live are considered correspondence course
     including online and mobile device app courses." RE 303 then attaches the proctor rule and the
     photo-identification rule to a "correspondence/internet course". That compound is the row. */
  assert.equal(COURSE_DESIGN.re306_15A, "CORRESPONDENCE AND INTERNET");
  for (const program of PROGRAMS) {
    const fields = fieldsOf(re306(program));
    assert.ok(!isBlank(fields["Correspondence and Internet"]), `${program.title}: 15A is not correspondence and internet`);
    for (const other of ["Live Classroom / Conference / Symposium", "live: online webinar", "Correspondence", "Internet", "Internet and mobile device app", "mobile device app"]) {
      assert.ok(isBlank(fields[other]), `${program.title}: 15A also claims "${other}", and the Handbook says it cannot be both`);
    }
  }
});

test("15B claims in-person proctoring only because the platform actually does it in person", () => {
  /* The reconciliation a reviewer would perform. If the proctoring ever became remote, this is
     what should stop the form claiming otherwise. */
  const proctor = fs.readFileSync(path.join(ROOT, `california/${PROGRAMS[0].courseId}/submission/final-exam-proctor-instructions.md`), "utf8");
  assert.match(proctor, /Remain present and supervising for the entire examination period/i);
  assert.match(proctor, /Do not leave the student unattended/i);
  assert.match(proctor, /The student must be alone with you/i);
  assert.doesNotMatch(proctor, /webcam|remote proctor|remotely proctored/i, "the proctoring is no longer in person and 15B must be revisited");

  for (const program of PROGRAMS) {
    const fields = fieldsOf(re306(program));
    assert.ok(!isBlank(fields["In person proctored"]), `${program.title}: 15B does not claim in-person proctoring`);
    assert.ok(!isBlank(fields["Internet Final Exam"]), `${program.title}: 15B does not claim internet delivery`);
    assert.ok(isBlank(fields["Mobile Device App"]), `${program.title}: 15B claims a mobile app that is not offered`);
  }
});

test("the answer sheet shows the 15A/15B reconciliation rather than asserting the answer", () => {
  for (const program of PROGRAMS) {
    const sheet = fs.readFileSync(path.join(ROOT, `california/submission/${program.packageDir}/01-re306-answer-sheet.md`), "utf8");
    assert.match(sheet, /reconciled against what a student actually does/i);
    assert.match(sheet, /All courses which are not presented live are considered correspondence course/);
    assert.match(sheet, /correspondence\/internet offering/);
    assert.match(sheet, /no remote or webcam proctoring anywhere in this platform/i);
  }
});

/* ── what stays blank until a pen touches it ───────────────────────────────────────────── */

test("RE 306 leaves the sponsor number, both dates and every signature empty", () => {
  for (const program of PROGRAMS) {
    const fields = fieldsOf(re306(program));
    for (const field of ["1a sponsor number", "DATE", "DATE 2", "Signature1", "Signature2", "Signature3", "Signature4", "Signature5"]) {
      assert.ok(isBlank(fields[field]), `${program.title}: RE 306 "${field}" is filled and must not be`);
    }
  }
});

test("RE 306 needs three signatures and the print set says so", () => {
  /* Signature1 is item 11 on page 1; Signature4 and Signature5 are the two page 3 blocks. The
     index named only the page 3 pair, which would have sent the application out a signature short. */
  const index = fs.readFileSync(path.join(ROOT, "california/print/human-closeout/INDEX.md"), "utf8");
  assert.match(index, /THREE signatures/);
  assert.match(index, /Page 1 item 11/i);
  assert.match(index, /Contact\(s\) original signature is required/);
  assert.match(index, /five/i, "the index no longer counts the signatures for the first filing");
});

test("RE 336 leaves the instructor's own question for the instructor", () => {
  /* The Handbook: the primary contact completes all of RE 336 "except for the instructor's
     signature and the real estate license status question on the very bottom of the form". The
     same person holding both roles does not transfer one role's answer to the other. */
  for (const program of PROGRAMS) {
    const fields = fieldsOf(re336(program));
    assert.ok(isBlank(fields["insturctor licensced? yes"]), `${program.title}: the licence answer is pre-filled`);
    assert.ok(isBlank(fields["insturctor licensced? No"]), `${program.title}: the licence answer is pre-filled`);
    assert.ok(isBlank(fields["CalBRE LICENSE NUMBER"]), `${program.title}: the licence number is pre-filled`);
    /* The printed instructor name is a line above and is the primary contact's to enter. */
    assert.equal(fields["INSTRUCTOR NAME"], INSTRUCTOR.nameLastFirst);
  }
});

test("RE 336 leaves the place of execution to be written with the date", () => {
  /* "Signed in the City of ___, State of ___, this ___ day of ___, 20___." One clause, one act.
     A pre-printed city is a false declaration the moment the form is signed elsewhere, and the
     declaration is made under penalty of perjury. */
  for (const program of PROGRAMS) {
    const fields = fieldsOf(re336(program));
    for (const field of ["City a", "State a", "day", "Month", "Year", "DATE", "DATE 2", "Signature1", "Signature2"]) {
      assert.ok(isBlank(fields[field]), `${program.title}: RE 336 "${field}" is filled and belongs to the act of signing`);
    }
    /* The declarant's name is a fact known now, and stays. */
    assert.equal(fields["Name"], "Anatoliy Kanevsky");
    /* And the provider's own address is not the place of execution — different fields, both right. */
    assert.equal(fields["city"], "Redondo Beach");
  }
});

test("neither form carries a DRE sponsor id", () => {
  for (const program of PROGRAMS) {
    assert.ok(isBlank(fieldsOf(re306(program))["1a sponsor number"]));
    assert.ok(isBlank(fieldsOf(re336(program))["4DIGIT SPONSOR ID NUMBER"]));
  }
});

/* ── it will print ─────────────────────────────────────────────────────────────────────── */

test("every filled field is legible and fits its field on the page", () => {
  /* The check that caught an exemption line auto-shrunk to 7.3pt: the value read back perfectly
     and would have printed in type a reviewer squints at. */
  for (const program of PROGRAMS) {
    for (const file of [re306(program), re336(program)]) {
      const problems = JSON.parse(
        execFileSync("python3", [path.join(ROOT, "scripts/lib/measure-acroform-fit.py"), path.join(ROOT, file)], { encoding: "utf8" }),
      );
      assert.deepEqual(problems, [], `${file}:\n  ${problems.join("\n  ")}`);
    }
  }
});

/* ── the print set ─────────────────────────────────────────────────────────────────────── */

test("the print set carries one certification request per course, each naming its course", () => {
  for (const program of PROGRAMS) {
    const letter = fs.readFileSync(
      path.join(ROOT, `california/print/human-closeout/${program.packageDir}--equivalence-certification-request.md`),
      "utf8",
    );
    assert.ok(letter.includes(program.title), `the ${program.title} request does not name its course`);
    assert.doesNotMatch(letter, /\[Course Title\]/, "a placeholder survived into the request");
    assert.match(letter, /on official school letterhead/i);
    assert.match(letter, /each specific course/i);
    /* The other two courses are not named in it, or it is not a per-course certification. */
    for (const other of PROGRAMS.filter((entry) => entry.catalogId !== program.catalogId)) {
      assert.ok(!letter.includes(other.title), `the ${program.title} request also names ${other.title}`);
    }
    /* Only the practice course's reviewer is asked about SB 1495. */
    assert.equal(letter.includes(SB1495.statement.replace("Compliant with ", "")), program.sb1495 || letter.includes("SB 1495"));
  }
});
