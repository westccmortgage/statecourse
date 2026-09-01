#!/usr/bin/env node
/*
 * Fills the official RE 306 (Statutory/Pre-License Course Approval Application), one copy per
 * course, from the facts file and the regulatory manifest.
 *
 * Why this exists rather than a transcription sheet. `01-re306-answer-sheet.md` told a person
 * what to type onto the Department's form. That was the right answer while the answers were
 * still moving, and it is the wrong one now: a form filled by hand from a sheet is a form that
 * can disagree with the sheet, and neither the gate nor the source lock reads a sheet of paper.
 * RE 306 carries a full AcroForm — eighty-five fields — so the answers go into the Department's
 * own form and the answer sheet becomes what it should have been all along: the explanation of
 * why each answer is what it is, and the instruction for the parts a person still has to do.
 *
 * WHAT IS DELIBERATELY LEFT EMPTY
 *
 *   1A sponsor number      DRE assigns it on approval. The form prints a fixed "S" prefix; the
 *                          digits after it stay blank, and nothing here writes near it.
 *   Signature1..5, DATE    Signed and dated by hand at filing. The Course Provider Handbook
 *                          says digital and rubber-stamp signatures are not accepted, in terms.
 *   Secondary contacts     There is one contact. Blank lines say so; invented ones would not.
 *
 * The page 3 blocks — primary contact and owner/authorized school official — are BOTH filled
 * with the printed name and title, because they are two certifications rather than one, and
 * leaving the second blank on the ground that the same person signed the first is a deficiency.
 * Only the signatures and dates are left for the pen.
 *
 * Output: california/dre-sources/generated/RE306-<course-slug>.pdf
 * Run:    node scripts/fill-re306.mjs [--verify]
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BPPE_EXEMPTION, PROGRAMS, SB1495, SCHOOL } from "../config/california/regulatory-manifest.mjs";
import { COURSE_DESIGN, FINAL_EXAM, INSTRUCTOR, PROVIDER } from "../config/california/submission-facts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = path.join(root, "california/dre-sources");
const form = path.join(sources, "RE306.pdf");
const outDir = path.join(sources, "generated");
const VERIFY = process.argv.includes("--verify");

/* The Department's checkboxes do not share an on-state. Four different ones appear on this
   form — /YES, /NO, /Yes and /On — and writing the wrong one leaves the box silently unticked,
   which on an application is worse than leaving it blank because it reads as an answer. Each is
   the state read from the form's own appearance dictionary. */
const ON = {
  schoolApproved: "/YES",
  schoolNotApproved: "/NO",
  schoolExempt: "/Yes",
  individual: "/On",
  partnership: "/On",
  corporation: "/On",
  llc: "/Yes",
  other: "/On",
  dbaYes: "/Yes",
  dbaNo: "/Yes",
  liveClassroom: "/On",
  liveWebinar: "/On",
  correspondenceAndInternet: "/On",
  correspondence: "/Yes",
  internet: "/On",
  internetAndApp: "/On",
  mobileApp: "/On",
  inPersonProctored: "/On",
  internetFinalExam: "/On",
  mobileDeviceAppFinalExam: "/On",
  openBook: "/On",
  closedBook: "/On",
  participatoryYes: "/Yes",
  participatoryNo: "/Yes",
};
const OFF = "/Off";

const [areaCode, localNumber] = (() => {
  const match = /\((\d{3})\)\s*(.+)/.exec(PROVIDER.phone);
  if (!match) throw new Error(`the provider phone "${PROVIDER.phone}" is not in the form's (AAA) NNN-NNNN shape`);
  return [match[1], match[2].trim()];
})();

const oneLine = (address) => `${address.street}, ${address.city}, ${address.state} ${address.zip}`;

/*
 * Item 4 is the classroom facility address, and it takes text rather than the principal office.
 * Regulation 3000(a)(3) asks for classroom facilities adequate to the objective of the course
 * offered; the course offered is a correspondence course under 3000(a)(1) and there is no
 * classroom. An address here would represent a facility that does not exist for a purpose it is
 * not used for.
 */
const NO_CLASSROOM = "N/A - no classroom facility; correspondence/internet course only";

/*
 * The exemption, in the two lines the form gives it.
 *
 * The first draft put the whole first sentence on line 1 and the field is only 270 points wide.
 * The filler shrank it to 7.3pt to make it fit — and it did fit, and it read back perfectly, and
 * it would have gone to the Department in type a reviewer has to squint at. Nothing about the PDF
 * looked wrong. It was only wrong on paper, which is the only place it matters.
 *
 * So the short line carries the citation and the wide line carries the elements. The width check
 * at the bottom of this file now measures both against the field, so the next person to lengthen
 * one of these finds out here rather than at a printer.
 */
const EXEMPTION_LINE_1 = `Exempt - Education Code ${BPPE_EXEMPTION.basis.replace(/^California Education Code\s*/, "")}`;
const EXEMPTION_LINE_2 =
  `No degrees awarded; highest program charge $${BPPE_EXEMPTION.highestProgramChargeUsd} against the ` +
  `$${BPPE_EXEMPTION.thresholdUsd.toLocaleString("en-US")} threshold; no state or federal student aid. See sheet A4.`;

const ITEM_21 =
  "The RE 313 General Information Page is displayed in full on the course's public page and again inside the " +
  "registration flow, before any payment step and before an enrollment is accepted. The student must scroll it and " +
  "affirmatively acknowledge it; the acknowledgment - student identity, page version and timestamp - is recorded with " +
  "the enrollment and is reproducible on request. A student cannot reach a payment screen without that record existing.";

const ITEM_22 =
  "Students are told three times, each with a direct link to RE 318A on the DRE website at www.dre.ca.gov: on the " +
  "enrollment confirmation issued at registration; persistently in the student portal for as long as the course is " +
  "open to them; and on the completion screen shown immediately after the final examination result.";

const ITEM_23B =
  "Assignment 14 is a dedicated implicit bias and fair housing participatory practicum. The student writes a response " +
  "from the consumer's position and a response from the real estate professional's position; each is stored as written " +
  "with its date, and the licensee-role response is revised after structured feedback. Neither role is skippable: the " +
  "assignment cannot be recorded complete with either response missing, and final examination eligibility reports the " +
  "interactive requirement from the submissions themselves. See continuation sheet 07-sb1495-traceability.";

/* One publication per course, because every word of instructional text is original to it. That
   is also why RE 303 checklist item 7, copyright authorization, is not applicable. */
const publication = (program) => ({
  /* The provider's name is the Author column two cells to the right. Repeating it in the title
     pushed the longest course name past what the title cell can render at a readable size. */
  title: `${program.title} - California Course Text`,
  author: PROVIDER.legalName,
  published: "2026",
  edition: "1.0",
});

function valuesFor(program) {
  const book = publication(program);
  return {
    /* ── items 1 to 11, the sponsor ─────────────────────────────────────────────────────── */
    /* 1A stays empty. The Department assigns it, and the form's printed "S" is the Department's. */
    "1a sponsor number": "",
    "1 NAME OF APPLICANT SCHOOL": SCHOOL.legalName,
    "2 OTHER NAMES USED BY THE SCHOOL": "",
    "3a Business Area Code": areaCode,
    "3b Business telephone": localNumber,
    "SCHOOLS BUSINESS ADDRESS   CITY STATE ZIP CODE": NO_CLASSROOM,
    "SCHOOLS MAILING ADDRESS": oneLine(PROVIDER.mailingAddress),
    "Email Address": PROVIDER.publicEmail,
    "School Website": PROVIDER.website,

    "SCHOOL APPROVED": OFF,
    "SCHOOL NOT APPROVED": OFF,
    "SCHOOL EXEMPT": ON.schoolExempt,
    "EXPLAIN EXEMPTION": EXEMPTION_LINE_1,
    "EXPLAIN EXEMPTION 2": EXEMPTION_LINE_2,

    INDIVIDUAL: OFF,
    PARTNERSHIP: OFF,
    CORPORATION: OFF,
    LLC: ON.llc,
    OTHER: OFF,
    "Other 123": "",

    "DBA YES": OFF,
    "DBA NO": ON.dbaNo,
    "DBA NAME": "",

    /* Item 11, contact authorization. One contact; the other two lines stay blank rather than
       repeating him, because a second line reads as a second person. */
    "Printed name 1": INSTRUCTOR.name,
    "Area code1": areaCode,
    "Phone number 1": localNumber,
    "Email address 1": PROVIDER.publicEmail,
    "Printed name 2": "",
    "Area code2": "",
    "Phone number 2": "",
    "Email address 2": "",
    "Printed name 3": "",
    "Area code3": "",
    "Phone number 3": "",
    "Email address 3": "",

    /* ── items 12 to 23, the course ─────────────────────────────────────────────────────── */
    "COURSE TITLE": program.title,
    LANGUAGE: "English",
    "TOTAL NUMBER OF INSTRUCTION HOURS Minimum 45 hours required": String(program.hours),

    "Publication TitleRow1": book.title,
    AuthorRow1: book.author,
    "Date of PublicationRow1": book.published,
    "Edition 1": book.edition,
    "Publication TitleRow2": "",
    AuthorRow2: "",
    "Date of PublicationRow2": "",
    "Edition 2": "",
    "Publication TitleRow3": "",
    AuthorRow3: "",
    "Date of PublicationRow3": "",
    "Edition 3": "",

    /* 15A. One method, and it is the one the course actually uses. */
    "Live Classroom / Conference / Symposium": OFF,
    "live: online webinar": OFF,
    "Correspondence and Internet": ON.correspondenceAndInternet,
    Correspondence: OFF,
    Internet: OFF,
    "Internet and mobile device app": OFF,
    "mobile device app": OFF,

    /* 15B. Two boxes, and the reason is on the form's own terms: the examination is delivered
       over the internet AND administered in person by a school-designated proctor, which
       Regulation 3000(a)(2)(B) requires of a correspondence course. Checking one would
       misdescribe the arrangement. */
    "In person proctored": ON.inPersonProctored,
    "Internet Final Exam": ON.internetFinalExam,
    "Mobile Device App": OFF,

    "NUMBER OF QUESTIONS ON FINAL EXAM": String(FINAL_EXAM.questions),
    "MINIMUM PASSING SCORE": `${FINAL_EXAM.passingPercent}%`,
    "Exam Time Given": `${FINAL_EXAM.minutes} minutes`,
    "OPEN BOOK": OFF,
    "CLOSED BOOK": ON.closedBook,

    "EXPLAIN YOUR PROCEDURE TO PROVIDE THE GENERAL INFORMATION PAGE TO STUDENTS PRIOR TO REGISTRATIONENROLLMENT 1": ITEM_21,
    "EXPLAIN HOW AND WHEN STUDENTS WILL BE INFORMED OF THE AVAILABILITY OF THE ONLINE COURSE AND INSTRUCTOR EVALUATION LOCATED ON THE DRE WEB SITE 1": ITEM_22,

    /* Item 23. Yes for the practice course and no for the other two, read from the manifest
       rather than from the title, because the manifest is where that fact lives. */
    "Check Box1": program.sb1495 ? ON.participatoryYes : OFF,
    "Check Box2": program.sb1495 ? OFF : ON.participatoryNo,
    "Detail the interactive participatory component": program.sb1495 ? ITEM_23B : "",

    /* ── page 3, both certifications ────────────────────────────────────────────────────── */
    "PRINTED NAME OF PRIMARY CONTACT": INSTRUCTOR.name,
    "TITLE OF PRIMARY CONTACT": INSTRUCTOR.contactTitle,
    "Primary conatact's phone number (include area code)": PROVIDER.phone,
    "DRE LICENSE NUMBER": INSTRUCTOR.dreBrokerLicense,
    "PRINTED NAME OF OWNER OR AUTHORIZED OFFICIAL": INSTRUCTOR.name,
    "OWNER'S EMAIL ADDRESS": PROVIDER.publicEmail,
    "Owner (or authorized school official) conatact's phone number (include area code)": PROVIDER.phone,
    "DRE LICENSE 2": INSTRUCTOR.dreBrokerLicense,
    /* DATE, DATE 2, Signature1..5 stay empty on purpose. Written by hand at filing. */
    DATE: "",
    "DATE 2": "",
  };
}

/* ── writing the form ──────────────────────────────────────────────────────────────────── */

const FILL = `
import json, sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, BooleanObject

form_path, out_path, values_json = sys.argv[1], sys.argv[2], sys.argv[3]
values = json.loads(values_json)

reader = PdfReader(form_path)
if reader.is_encrypted:
    reader.decrypt("")

writer = PdfWriter()
writer.append(reader)
# NeedAppearances makes viewers render the filled values with the form's own styling, which is
# what keeps the printed page looking like the Department's form rather than like a fill.
writer._root_object["/AcroForm"][NameObject("/NeedAppearances")] = BooleanObject(True)
for page in writer.pages:
    writer.update_page_form_field_values(page, values)
with open(out_path, "wb") as handle:
    writer.write(handle)
print(out_path)
`;

const READ_BACK = `
import json, sys
from pypdf import PdfReader
reader = PdfReader(sys.argv[1])
fields = reader.get_fields() or {}
print(json.dumps({k: (v.get("/V") if v.get("/V") is None else str(v.get("/V"))) for k, v in fields.items()}))
`;

/*
 * Does it fit on the page?
 *
 * Reading a field back tells you the value is stored. It does not tell you the value will be
 * legible, and it does not tell you it will be there at all: a value too long for its field is
 * shrunk by the viewer until it fits, and if it still does not fit, the appearance stream's own
 * clip rectangle cuts the overflow off. The PDF then reads back perfectly and prints truncated.
 *
 * That is not hypothetical. The first draft of the exemption line was auto-shrunk to 7.3pt to
 * make it fit, and nothing else in this file would have noticed — the field read back exactly
 * what was written into it.
 *
 * scripts/lib/measure-acroform-fit.py measures every filled field's rendered text against the
 * width its appearance stream actually clips to, and against a floor for legibility.
 */
const MEASURE = path.join(root, "scripts/lib/measure-acroform-fit.py");

fs.mkdirSync(outDir, { recursive: true });
const slug = (title) => title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const problems = [];
const written = [];

for (const program of PROGRAMS) {
  const values = valuesFor(program);
  const out = path.join(outDir, `RE306-${slug(program.title)}.pdf`);
  execFileSync("python3", ["-c", FILL, form, out, JSON.stringify(values)], { encoding: "utf8" });

  /*
   * Read the form back and compare. A fill that silently dropped a field would produce a PDF
   * that looks right in a viewer and arrives at the Department with an answer missing, and the
   * only moment anyone would find out is when the deficiency notice comes back.
   */
  const readBack = JSON.parse(execFileSync("python3", ["-c", READ_BACK, out], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }));
  for (const [field, expected] of Object.entries(values)) {
    const actual = readBack[field];
    if (expected === "" || expected === OFF) {
      if (actual && actual !== "" && actual !== OFF) problems.push(`${program.title}: "${field}" should be empty and reads "${actual}"`);
      continue;
    }
    if (String(actual ?? "") !== String(expected)) {
      problems.push(`${program.title}: "${field}" should read "${expected}" and reads "${actual ?? "(empty)"}"`);
    }
  }
  /* The three fields that must be blank when the form leaves here, whatever else happened. */
  for (const field of ["1a sponsor number", "DATE", "DATE 2"]) {
    if (readBack[field]) problems.push(`${program.title}: "${field}" is filled and must not be`);
  }
  /* And whether any of it will actually reach the paper. */
  for (const problem of JSON.parse(execFileSync("python3", [MEASURE, out], { encoding: "utf8" }))) {
    problems.push(`${program.title}: ${problem}`);
  }
  written.push({ program, out, fields: Object.values(values).filter((value) => value !== "" && value !== OFF).length });
}

console.log(`\n  RE 306 — ${written.length} forms\n`);
for (const entry of written) {
  console.log(`  ${path.relative(root, entry.out)}`);
  console.log(`      ${entry.program.title} — ${entry.fields} fields written, read back and verified`);
  console.log(`      item 23A: ${entry.program.sb1495 ? "YES, with the participatory detail" : "NO — not a practice course"}`);
}
console.log("\n  Left empty on purpose: 1A sponsor number, both dates, and all five signature fields.");
console.log("  Signed and dated by hand at filing — digital and rubber-stamp signatures are not accepted.\n");

if (problems.length > 0) {
  console.error("  The written form does not read back as intended:");
  for (const problem of problems) console.error(`    - ${problem}`);
  console.error("");
  process.exit(1);
}
if (VERIFY) console.log("  Every written field read back identical, and every one fits its field on the page.\n");
