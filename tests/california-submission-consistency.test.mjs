import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  COURSES, COURSE_DESIGN, DRE, FEES, FINAL_EXAM, FORBIDDEN_CLAIMS, INSTRUCTOR, PROVIDER
} from "../config/california/submission-facts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const submissionDir = path.join(root, "california/submission");

function markdownUnder(dir) {
  const out = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) out.push(full);
    }
  };
  walk(dir);
  return out;
}

/* The submission is these files plus the per-course exam and outline documents, which live
   with the course they describe. A consistency audit that skipped those would miss exactly
   the documents a reviewer reads most closely. */
const submissionFiles = markdownUnder(submissionDir);
const courseFiles = COURSES.flatMap((course) =>
  markdownUnder(path.join(root, "california", course.courseId, "submission")));
const allFiles = [...submissionFiles, ...courseFiles];
const read = (file) => fs.readFileSync(file, "utf8");
const rel = (file) => path.relative(root, file);

test("the submission package exists and is complete", () => {
  assert.ok(submissionFiles.length > 0, "no submission documents found");
  for (const name of ["README.md", "PRINT_AND_MAIL_INSTRUCTIONS_FOR_ANATOLIY.md"]) {
    assert.ok(fs.existsSync(path.join(submissionDir, name)), `missing ${name}`);
  }
  for (const sheet of ["A1-re303-checklist", "A2-entity-documentation", "A3-payment-instructions",
    "A4-bppe-exemption-statement", "A5-fbns-determination", "A6-re304-determination",
    "A7-instructor-package"]) {
    assert.ok(fs.existsSync(path.join(submissionDir, "00_administrative", `${sheet}.md`)),
      `missing administrative sheet ${sheet}`);
  }
  for (const course of COURSES) {
    for (const doc of ["00-package-index", "01-re306-answer-sheet", "02-fee-reference",
      "04-instructional-material-manifest", "06-re313-general-information-page",
      "14-login-instructions", "15-re311-certificate-specimen"]) {
      assert.ok(fs.existsSync(path.join(submissionDir, course.packageDir, `${doc}.md`)),
        `${course.packageDir} is missing ${doc}`);
    }
  }
});

test("no document claims approval that does not exist", () => {
  /* The single most important assertion in this file. Every one of these phrases would be
     false today, and several would be actionable. */
  const offenders = [];
  for (const file of allFiles) {
    const text = read(file);
    for (const claim of FORBIDDEN_CLAIMS) {
      /* Skip lines that are explicitly denying the claim or listing it as forbidden. */
      for (const line of text.split("\n")) {
        if (!line.toLowerCase().includes(claim.toLowerCase())) continue;
        const denial = /\b(not|never|no|cannot|must not|do not|does not|until|forbidden|refus|without|pending|prohibit)\b/i.test(line);
        if (!denial) offenders.push(`${rel(file)}: "${claim}" in: ${line.trim().slice(0, 110)}`);
      }
    }
  }
  assert.deepEqual(offenders, [], "a document asserts an approval that does not exist");
});

test("no approval number, sponsor id, or school id is ever invented", () => {
  assert.equal(PROVIDER.dreSponsorId, null, "the sponsor id must stay null until DRE assigns one");

  /* The documents say a certificate cannot issue without a DRE approval number. That claim is
     only true if the running configuration actually holds none, so check the configuration
     rather than trusting the prose. */
  const catalogDir = path.join(root, "config/courses");
  for (const file of fs.readdirSync(catalogDir).filter((f) => f.endsWith(".json"))) {
    const config = JSON.parse(read(path.join(catalogDir, file)));
    assert.equal(config.approval_number ?? null, null, `${file} carries an approval number`);
    assert.equal(config.enrollment_enabled, false, `${file} has enrollment enabled`);
  }

  /* And no submission document may contain something shaped like an assigned DRE number in a
     field the documents promise to leave blank. */
  const offenders = [];
  for (const file of submissionFiles) {
    for (const line of read(file).split("\n")) {
      if (!/(sponsor|school|approval)\s*(id|number|#)/i.test(line)) continue;
      if (/\bS\d{4,}\b/.test(line)) offenders.push(`${rel(file)}: ${line.trim().slice(0, 100)}`);
    }
  }
  assert.deepEqual(offenders, [], "a document contains something shaped like an assigned DRE number");
});

test("every shared fact is stated identically wherever it appears", () => {
  /* Each entry is a regular expression that must NOT match: a wrong value for a fact that
     appears across many documents. Stating 90 minutes once anywhere fails the build. */
  const wrongValues = [
    { label: "course hours", bad: /\b(?:30|40|60|90|135)[- ]hour(?:s)? (?:statutory|pre-?license) course\b/i },
    { label: "lesson assignments", bad: /\b(?:10|12|14|16|18|20) (?:separate )?lesson assignments\b/i },
    { label: "final exam question count", bad: /\b(?:50|60|75|80|90|120|150) (?:multiple[- ]choice )?questions?\b(?![^.]*bank)/i },
    { label: "passing score", bad: /\b(?:50|65|70|75|80)% (?:or (?:greater|better)|to pass|minimum passing)\b/i },
    { label: "exam minutes", bad: /\b(?:60|90|120|150|240) minutes?\b(?=[^.]*(?:final )?exam)/i },
    { label: "fee", bad: /\$(?:250|300|350|400|450|550|600|750)\b(?=[^.]*(?:course|application|fee))/i }
  ];
  const offenders = [];
  for (const file of allFiles) {
    const text = read(file);
    for (const { label, bad } of wrongValues) {
      const m = text.match(bad);
      if (m) offenders.push(`${rel(file)}: wrong ${label} — "${m[0]}"`);
    }
  }
  assert.deepEqual(offenders, [], "a document states a value that contradicts the submission facts");
});

test("the correct shared values appear in the documents that must carry them", () => {
  for (const course of COURSES) {
    const dir = path.join(submissionDir, course.packageDir);
    const re306 = read(path.join(dir, "01-re306-answer-sheet.md"));
    const re313 = read(path.join(dir, "06-re313-general-information-page.md"));
    const re311 = read(path.join(dir, "15-re311-certificate-specimen.md"));

    for (const [name, text] of [["RE 306", re306], ["RE 313", re313]]) {
      assert.match(text, new RegExp(`\\b${FINAL_EXAM.questions}\\b`), `${course.packageDir} ${name}: question count`);
      assert.match(text, new RegExp(`\\b${FINAL_EXAM.minutes} minutes\\b`), `${course.packageDir} ${name}: exam minutes`);
      assert.match(text, new RegExp(`${FINAL_EXAM.passingPercent}%`), `${course.packageDir} ${name}: passing score`);
      assert.match(text, new RegExp(`\\b${COURSE_DESIGN.hours}\\b`), `${course.packageDir} ${name}: hours`);
      assert.match(text, /[Cc]losed book/, `${course.packageDir} ${name}: closed book`);
      assert.match(text, new RegExp(course.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${course.packageDir} ${name}: course title`);
    }

    /* Both 15B boxes checked, and the third not. */
    for (const box of COURSE_DESIGN.re306_15B) {
      assert.match(re306, new RegExp(`☒ \\*\\*${box}\\*\\*`), `${course.packageDir}: 15B must check ${box}`);
    }
    assert.match(re306, /☐ MOBILE DEVICE APP/, `${course.packageDir}: 15B must not check mobile device app`);

    /* The certificate gate. */
    assert.match(re311, /BLANK until DRE assigns it/i, `${course.packageDir}: RE 311 approval-number gate`);
    assert.match(re311, new RegExp(COURSE_DESIGN.re311CourseType), `${course.packageDir}: RE 311 course type`);

    /* Interactive participatory component: required for Practice, absent elsewhere. */
    if (course.interactiveParticipatory) {
      assert.match(re306, /\*\*23A\. ☒ YES\*\*/, "Real Estate Practice must answer 23A yes");
      assert.match(re306, /implicit bias and fair housing/i, "Practice must identify the fair-housing practicum");
    } else {
      assert.match(re306, /☒ NO\*\* — not applicable/, `${course.packageDir}: 23A must be no`);
    }
  }
});

test("entity, instructor and DRE facts are consistent across the package", () => {
  const readme = read(path.join(submissionDir, "README.md"));
  const a2 = read(path.join(submissionDir, "00_administrative/A2-entity-documentation.md"));
  const a3 = read(path.join(submissionDir, "00_administrative/A3-payment-instructions.md"));
  const a7 = read(path.join(submissionDir, "00_administrative/A7-instructor-package.md"));

  for (const text of [readme, a2]) {
    assert.match(text, new RegExp(PROVIDER.secretaryOfStateFileNumber), "SoS file number");
    assert.match(text, /StateCourse LLC/, "legal name");
  }
  assert.match(a2, new RegExp(PROVIDER.principalOffice.city), "principal office city");
  assert.match(a2, new RegExp(PROVIDER.mailingAddress.city), "mailing city");
  assert.match(a3, new RegExp(`\\$${FEES.perCourse}`), "per-course fee");
  assert.match(a3, new RegExp(`\\$${FEES.total.toLocaleString("en-US")}`), "total fee");
  assert.match(a3, new RegExp(DRE.street.replace(/,/g, ",?")), "DRE street address");
  assert.match(a7, new RegExp(INSTRUCTOR.dreBrokerLicense), "instructor licence number");
  assert.match(a7, /pending DRE review/i, "instructor status must be stated as pending");
});

test("the three legal determinations state a conclusion rather than deferring", () => {
  const dir = path.join(submissionDir, "00_administrative");
  const bppe = read(path.join(dir, "A4-bppe-exemption-statement.md"));
  const fbns = read(path.join(dir, "A5-fbns-determination.md"));
  const re304 = read(path.join(dir, "A6-re304-determination.md"));

  assert.match(bppe, /94874\(d\)\(2\)\(A\)/, "BPPE must cite the exemption");
  assert.match(bppe, /94874\.2/, "BPPE must address the carve-outs");
  assert.match(fbns, /17900\(b\)\(5\)/, "FBNS must cite the LLC definition");
  assert.match(fbns, /17910/, "FBNS must cite the filing duty");
  assert.match(re304, /nonresident sponsors/i, "RE 304 must quote its own scope");
  assert.match(re304, /NOT required/i, "RE 304 must state the conclusion");

  /* The Wyoming analysis must be withdrawn, not merely unused. */
  for (const [name, text] of [["A6", re304]]) {
    assert.match(text, /Wyoming/, `${name} must address the superseded Wyoming analysis`);
    assert.match(text, /superseded|withdrawn/i, `${name} must withdraw it explicitly`);
  }
});

test("the college instructor equivalence certification is recorded as a blocker, not as RE 336", () => {
  /* RE 303's COURSE CONTENT section requires this and the numbered checklist does not
     mention it, which is exactly how it gets missed. */
  const a7 = read(path.join(submissionDir, "00_administrative/A7-instructor-package.md"));
  assert.match(a7, /college instructor/i, "A7 must name the requirement");
  assert.match(a7, /official school letterhead/i, "A7 must state the letterhead condition");
  assert.match(a7, /not RE 336|separate from, and additional to/i, "A7 must distinguish it from RE 336");
  assert.match(a7, /blocker/i, "A7 must record it as a blocker");

  const readme = read(path.join(submissionDir, "README.md"));
  assert.match(readme, /college instructor equivalence/i, "the README must surface the blocker");
});

test("no DRE form is recreated, and the official sources are present", () => {
  const readme = read(path.join(submissionDir, "README.md"));
  assert.match(readme, /No California DRE form is recreated/i, "the form-integrity rule must be stated");

  const sources = path.join(root, "california/dre-sources");
  for (const form of ["RE206E.pdf", "RE303.pdf", "RE306.pdf", "RE307.pdf", "RE311.pdf",
    "RE336.pdf", "re304.pdf", "re313.doc", "re909.pdf", "re318a.pdf"]) {
    const full = path.join(sources, form);
    assert.ok(fs.existsSync(full), `official source ${form} is missing`);
    assert.ok(fs.statSync(full).size > 10000, `${form} looks like an error page, not a form`);
  }
});

test("no answer key, credential, or secret is written into the submission package", () => {
  const offenders = [];
  for (const file of submissionFiles) {
    const text = read(file);
    if (/\bsk_(?:live|test)_[A-Za-z0-9]{16,}/.test(text)) offenders.push(`${rel(file)}: Stripe key`);
    if (/\bwhsec_[A-Za-z0-9]{16,}/.test(text)) offenders.push(`${rel(file)}: webhook secret`);
    if (/\b\d{2}-\d{7}\b/.test(text)) offenders.push(`${rel(file)}: EIN`);
    if (/correctChoice/.test(text)) offenders.push(`${rel(file)}: answer-key field`);
  }
  assert.deepEqual(offenders, [], "the submission package must carry no secrets or answer keys");
});
