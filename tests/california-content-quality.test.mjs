import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const auditor = fileURLToPath(new URL("../scripts/audit-california-content.mjs", import.meta.url));
const report = execFileSync(process.execPath, [auditor], { encoding: "utf8" });

function loadRenderer() {
  const source = readFileSync(fileURLToPath(new URL("../public/statecourse/student/course/student-course.js", import.meta.url)), "utf8");
  const start = source.indexOf("function escapeHtml");
  const tail = 'flush();return output.join("");\n}';
  const end = source.indexOf(tail);
  return new Function(`${source.slice(start, end + tail.length)}\nreturn { renderMarkdown };`)();
}

/* The reader redesign fixed raw Markdown leakage and lowercase headings across all
   45 California lessons. These two tests keep that fixed while the lesson rebuild
   rewrites the prose underneath. */

test("no raw Markdown survives the California reader pipeline", () => {
  assert.match(report, /\[pass\] no raw Markdown reaches the student reader/);
});

test("California lessons render with capitalized headings and sentences", () => {
  assert.match(report, /\[pass\] no rendered heading or sentence starts lowercase/);
});

test("the auditor still measures substance and assessment integrity", () => {
  /* Guards the auditor itself: if these lines stop appearing, the audit has silently
     stopped checking the two gates that are still open. */
  assert.match(report, /lesson prose is written, not templated/);
  assert.match(report, /every scored item has its own answer choices/);
  assert.match(report, /lessons audited: 45/);
});

/* The rebuilt lessons will contain numbered procedures, quoted statutory text, form
   names, and sub-headings below level 3. The reader must render all of them rather
   than printing the Markdown markers to the student. */

test("the reader renders the Markdown constructs real instruction needs", () => {
  const { renderMarkdown } = loadRenderer();
  const html = renderMarkdown([
    "## Section",
    "",
    "1. Verify the identity of the principal.",
    "2. Deliver the disclosure and retain the receipt.",
    "",
    "> Quoted source text.",
    "",
    "#### Sub-heading",
    "",
    "---",
    "",
    "File the `RE 882` form."
  ].join("\n"));

  assert.match(html, /<ol><li>Verify the identity of the principal\.<\/li><li>Deliver/);
  assert.match(html, /<blockquote><p>Quoted source text\.<\/p><\/blockquote>/);
  assert.match(html, /<h4>Sub-Heading<\/h4>/);
  assert.match(html, /<hr>/);
  assert.match(html, /<code>RE 882<\/code>/);

  const text = html.replace(/<[^>]+>/g, "");
  for (const marker of ["#", ">", "`", "---"]) {
    assert.ok(!text.includes(marker), `raw Markdown marker "${marker}" reached the student`);
  }
});

test("a code span cannot smuggle markup into the lesson body", () => {
  const { renderMarkdown } = loadRenderer();
  const html = renderMarkdown("Use `<script>alert(1)</script>` carefully.");
  assert.ok(!html.includes("<script>"));
  assert.match(html, /<code>&lt;script&gt;/);
});

/* The assessment rebuild replaced one reused question with per-lesson item banks.
   These guard the properties that make the banks real assessments rather than a
   restatement of the defect they replaced. */

test("every California lesson has a complete authored question bank", () => {
  assert.match(report, /\[pass\] every lesson has an authored question bank/);
  assert.match(report, /135 \/ 135 assessments authored/);
});

test("no two scored items share answer choices", () => {
  assert.match(report, /\[pass\] every scored item has its own answer choices/);
});

test("the correct answer is not always in the same position", () => {
  assert.match(report, /\[pass\] correct answers are spread across positions/);
});

test("heading title-casing does not capitalize after an apostrophe", () => {
  const { renderMarkdown } = loadRenderer();
  /* "the Commissioner's Regulations" must not render as "Commissioner'S", while a
     hyphenated term must still capitalize both halves. */
  const html = renderMarkdown("## Subtitle\n\n### the Commissioner's Regulations\n\n### fair-housing advertising\n\ntext");
  assert.match(html, /Commissioner&#39;s Regulations/);
  assert.match(html, /Fair-Housing Advertising/);
});

/* RE 303 p.4 requires a final examination of not less than 100 questions per form with
   comprehensive coverage of the entire course, 60% to pass, and one retake on different
   questions. These guard the properties that make the bank an examination rather than a
   pool of questions, and — critically — that the answer key's material references are
   real, since RE 303 requires the instructor version to say where each answer is found. */

test("the final examination answer key references resolve to real lesson subsections", () => {
  /* Reported as a finding rather than a count, so a wrong reference names itself. */
  const section = report.slice(report.indexOf("Final examinations"), report.indexOf("Gates"));
  assert.doesNotMatch(section, /has no section/);
  assert.doesNotMatch(section, /references unknown/);
  assert.doesNotMatch(section, /answer key reference incomplete/);
});

test("no question appears on both the examination and its retake", () => {
  assert.doesNotMatch(report, /appear on both the exam and the retake/);
  assert.match(report, /\[pass\] the retake uses different questions/);
});

test("an authored final examination form is complete and covers every assignment", async () => {
  const engine = await import("../config/california-course-engine.mjs");
  const exam = engine.getCaliforniaFinalExam("ca-real-estate-principles-45", "A");
  assert.equal(exam.items.length, 100);
  assert.equal(exam.passingPercent, 60);
  assert.equal(new Set(exam.items.map((item) => item.source.assignment)).size, 15);
});

test("the final examination never sends an answer key to the browser", async () => {
  const engine = await import("../config/california-course-engine.mjs");
  const exam = engine.getCaliforniaFinalExam("ca-real-estate-principles-45", "A");
  const published = engine.publicAssessment(exam);
  const keys = new Set(published.items.flatMap((item) => Object.keys(item)));
  assert.deepEqual([...keys].sort(), ["choices", "id", "prompt"]);
  for (const field of ["correctChoice", "rationale", "source", "crossReferences"]) {
    assert.ok(!Object.prototype.hasOwnProperty.call(published.items[0], field), `${field} reached the browser`);
  }
});

test("the retake is a different form and there is no third attempt", async () => {
  const engine = await import("../config/california-course-engine.mjs");
  assert.equal(engine.californiaFinalExamForm(1), "A");
  assert.equal(engine.californiaFinalExamForm(2), "B");
  assert.equal(engine.californiaFinalExamForm(3), null);
});

test("the final examination passes at 60 percent and not below", async () => {
  const engine = await import("../config/california-course-engine.mjs");
  const exam = engine.getCaliforniaFinalExam("ca-real-estate-principles-45", "A");
  const answers = (correct) => exam.items.map((item, index) => (index < correct ? item.correctChoice : (item.correctChoice + 1) % item.choices.length));
  assert.equal(engine.scoreCaliforniaAssessment(exam, answers(59)).passed, false);
  assert.equal(engine.scoreCaliforniaAssessment(exam, answers(60)).passed, true);
});
