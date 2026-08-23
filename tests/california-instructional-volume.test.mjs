/*
 * The instructional volume, and what "complete" means for it.
 *
 * RE 303 item 6 asks for "Printed copies of all instructional materials, student materials,
 * textbooks, case studies, sample forms, etc.", and adds a benchmark: "An up-to-date text or
 * appropriate reading material of sufficient length to require the student to spend a minimum of
 * 45 hours of study/work in order to complete the course is required. It has generally been found
 * that approximately 450 pages of text/instructional material is equivalent to textbooks offered
 * by a California college or university."
 *
 * Two things were wrong before this was written, and each was invisible from inside the build.
 *
 * The volume printed the lesson text and NOT the assessments. The applied exercise, the
 * engagement check and the remediation set are student materials — the student is served them
 * inside the assignment — so a volume without them omitted about a fifth of what a student is
 * given, in a submission whose instruction is "all instructional materials".
 *
 * And the Principles volume ran to 332 pages against the Department's ~450-page benchmark, while
 * the professor's dossier told the reviewing instructor it was 559 — an estimate wrong by more
 * than a hundred pages in the direction that would have embarrassed everyone.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { FIRST_FILING, PROGRAMS } from "../config/california/regulatory-manifest.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const volume = (program) => path.join(ROOT, "california/print", `${program.courseId}-course-text.pdf`);

/* The Department's figure, from RE 303 item 6. Not a statutory minimum — the requirement is
   "sufficient length to require ... a minimum of 45 hours" — but it is the benchmark a reviewer
   measures against, and the course being filed first is held to it. */
const BENCHMARK_PAGES = 450;

const pageCount = (file) =>
  Number(
    execFileSync("python3", ["-c", "import sys;from pypdf import PdfReader;print(len(PdfReader(sys.argv[1]).pages))", file], {
      encoding: "utf8",
    }).trim(),
  );

test("every course has a built print volume", () => {
  for (const program of PROGRAMS) {
    assert.ok(fs.existsSync(volume(program)), `${program.title}: no printed volume has been built`);
  }
});

test("the first filing's volume meets the Department's page benchmark", () => {
  const program = PROGRAMS.find((entry) => entry.courseId === FIRST_FILING.courseId);
  const pages = pageCount(volume(program));
  assert.ok(
    pages >= BENCHMARK_PAGES,
    `${program.title} is ${pages} pages against RE 303's ~${BENCHMARK_PAGES}-page equivalence benchmark`,
  );
});

test("the volume contains the assessments, not only the reading", () => {
  /* The omission this test exists for. Checked in the builder rather than the PDF, because the
     PDF's text extraction is not a reliable place to look for a section heading. */
  const builder = fs.readFileSync(path.join(ROOT, "scripts/build-california-print-volume.mjs"), "utf8");
  assert.match(builder, /function renderAssessments/);
  assert.match(builder, /Assessment materials for this assignment/);
  assert.match(builder, /bodies\.push\(renderAssessments\(/);
  /* Applied, engagement and remediation — all three, or it is not all the student materials. */
  for (const kind of ["applied", "engagement", "remediation"]) {
    assert.ok(builder.includes(`lesson.${kind}`) || builder.includes(`${kind}`), `the volume omits the ${kind} set`);
  }
});

test("the volume never contains the final examination banks", () => {
  /* The student and instructor versions are RE 303 items 13 and 14 and are submitted separately.
     A secure examination inside the student's own course text would be the worst possible place
     for it. */
  const builder = fs.readFileSync(path.join(ROOT, "scripts/build-california-print-volume.mjs"), "utf8");
  /* What matters is what the builder LOADS, not what its comments mention — the comment above
     ASSESSMENT_BANKS names the exam banks precisely in order to exclude them. */
  const banks = builder.slice(builder.indexOf("const ASSESSMENT_BANKS"), builder.indexOf("};", builder.indexOf("const ASSESSMENT_BANKS")));
  assert.doesNotMatch(banks, /final-exam-bank/, "the volume builder loads a final examination bank");
  for (const program of PROGRAMS) {
    assert.ok(banks.includes(`${program.courseId}`), `${program.title} has no assessment bank registered for the volume`);
  }
  const build = fs.readFileSync(path.join(ROOT, "site/build.sh"), "utf8");
  assert.match(build, /final-exam-bank\|answer-key/, "the site build no longer refuses to publish an answer key");
});

test("the printed volume tells the student what the portal withholds", () => {
  /* The assessments are printed with their keys, and the browser does not show them until the
     student has answered. A volume that printed the key without saying so would misdescribe the
     course to a reviewer comparing the book against the platform. */
  const builder = fs.readFileSync(path.join(ROOT, "scripts/build-california-print-volume.mjs"), "utf8");
  assert.match(builder, /the student sees only the question and the answer choices/i);
});

test("the page count a reviewer is told is the page count they receive", () => {
  /* The dossier estimated; the estimate was wrong by 103 pages for Principles. It now reads the
     built PDF. */
  const dossier = fs.readFileSync(
    path.join(ROOT, `california/dre-sources/instructor-equivalence/dossier-${FIRST_FILING.courseId.replace("-v1", "")}.md`),
    "utf8",
  );
  const program = PROGRAMS.find((entry) => entry.courseId === FIRST_FILING.courseId);
  const pages = pageCount(volume(program));
  assert.ok(
    dossier.includes(`**${pages} pages**`),
    `the dossier does not state the volume's actual ${pages} pages`,
  );
  assert.match(dossier, /measured from the bound PDF/i);
});

test("RE 313 carries the volume's real page count, not an instruction to count it", () => {
  for (const program of PROGRAMS) {
    const sheet = fs.readFileSync(path.join(ROOT, `california/submission/${program.packageDir}/06-re313-general-information-page.md`), "utf8");
    const pages = pageCount(volume(program));
    assert.match(sheet, new RegExp(`\\| — Pages \\| \\*\\*${pages}\\*\\* \\|`), `${program.title}: RE 313 does not carry ${pages}`);
  }
});

test("the printing instructions state the page count of the volume that will be printed", () => {
  /* The defect this exists for. The volume grew from 332 to 456 pages and the instructions for
     the person taking the PDFs to a printer still named 332 / 330 / 334 — three numbers that
     described a book nobody would receive. Every other page figure is generated; this file is
     written by hand, which is exactly why it drifted and why it needs a check of its own. */
  const instructions = fs.readFileSync(path.join(ROOT, "california/submission/PRINT_AND_MAIL_INSTRUCTIONS_FOR_ANATOLIY.md"), "utf8");
  const counts = PROGRAMS.map((program) => pageCount(volume(program)));
  for (const [index, program] of PROGRAMS.entries()) {
    assert.match(
      instructions,
      new RegExp(`\`${program.courseId}-course-text\\.pdf\` \\| \\*\\*${counts[index]}\\*\\*`),
      `${program.title}: the printing instructions do not state its ${counts[index]} pages`,
    );
  }
  assert.ok(
    instructions.includes(`**${counts.join(" / ")}**`),
    `the packet checklist does not state ${counts.join(" / ")} for the three volumes`,
  );
});
