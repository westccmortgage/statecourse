#!/usr/bin/env node
/**
 * Builds the print-ready course text volume for each California course.
 *
 * RE 303, Internet Courses: "Hard copies of all course material to be viewed by student on
 * the Internet must be submitted with the application." So the whole text is printed. This
 * produces one bound volume per course — cover, publication page, table of contents, then
 * the fifteen lesson assignments in order — as HTML with print CSS, which Chromium renders
 * to PDF.
 *
 * Why a bound volume rather than fifteen loose files: RE 303 also asks for a textbook's
 * "cover", "publication page" and "table of contents". Our text is not a published textbook,
 * so the textbook carve-out does not apply and the body is printed in full — but presenting
 * it as a proper volume answers both instructions at once and gives RE 313's "Pages" field
 * a real number to hold.
 *
 * No npm dependencies: a focused markdown renderer for the constructs the lessons actually
 * use, and headless Chromium via --print-to-pdf.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COURSES, COURSE_DESIGN, INSTRUCTOR, PROVIDER, STATUS_LINE } from "../config/california/submission-facts.mjs";

/*
 * The assessment banks, printed with the lessons.
 *
 * RE 303 item 6 asks for "Printed copies of all instructional materials, student materials,
 * textbooks, case studies, sample forms, etc." The applied exercise, the engagement check and
 * the remediation set are student materials — the student is served them inside the assignment
 * — and a volume that printed only the reading was a volume that omitted a fifth of what a
 * student is given.
 *
 * The FINAL EXAMINATION banks are not here and must never be. They are secure documents; the
 * student and instructor versions are submitted separately as RE 303 items 13 and 14, and
 * site/build.sh refuses to publish any file matching /final-exam-bank|answer-key/.
 */
const ASSESSMENT_BANKS = {
  "ca-real-estate-principles-45-v1": "config/california/principles-question-bank.mjs",
  "ca-real-estate-practice-45-v1": "config/california/practice-question-bank.mjs",
  "ca-mortgage-loan-brokering-lending-45-v1": "config/california/mortgage-question-bank.mjs",
};
const LETTERS = ["A", "B", "C", "D", "E", "F"];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "california/print");
const CHROME = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"]
  .find((p) => fs.existsSync(p));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Inline: bold, italic, code, links. Escaping happens first so lesson prose containing a
   less-than sign cannot inject markup into a regulatory document. */
function inline(text) {
  return esc(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

function renderMarkdown(md) {
  const out = [];
  const lines = md.split("\n");
  let i = 0;
  const flushList = (tag, items) => {
    if (items.length) out.push(`<${tag}>${items.map((li) => `<li>${inline(li)}</li>`).join("")}</${tag}>`);
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i += 1; continue; }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i += 1; continue;
    }

    if (/^\s*\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i += 1; }
      const cells = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const isDivider = (r) => /^[\s|:-]+$/.test(r);
      const body = rows.filter((r) => !isDivider(r));
      if (!body.length) continue;
      const head = cells(body[0]);
      const rest = body.slice(1);
      out.push("<table><thead><tr>"
        + head.map((c) => `<th>${inline(c)}</th>`).join("")
        + "</tr></thead><tbody>"
        + rest.map((r) => "<tr>" + cells(r).map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>").join("")
        + "</tbody></table>");
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { quote.push(lines[i].replace(/^\s*>\s?/, "")); i += 1; }
      out.push(`<blockquote>${renderMarkdown(quote.join("\n"))}</blockquote>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, "")); i += 1; }
      flushList("ul", items);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, "")); i += 1; }
      flushList("ol", items);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*[|>]|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) {
      para.push(lines[i]); i += 1;
    }
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

const CSS = `
@page { size: Letter; margin: 22mm 20mm 22mm 20mm; }
@page { @bottom-center { content: counter(page); } }
* { box-sizing: border-box; }
body { font: 10.5pt/1.5 Georgia, "Times New Roman", serif; color: #111; margin: 0; }
h1, h2, h3, h4, h5, h6 { font-family: Helvetica, Arial, sans-serif; color: #000; line-height: 1.25; }
h1 { font-size: 19pt; margin: 0 0 14pt; break-before: page; }
h2 { font-size: 14pt; margin: 20pt 0 8pt; break-after: avoid; }
h3 { font-size: 11.5pt; margin: 15pt 0 6pt; break-after: avoid; }
h4 { font-size: 10.5pt; margin: 12pt 0 5pt; break-after: avoid; }
p { margin: 0 0 8pt; orphans: 3; widows: 3; }
ul, ol { margin: 0 0 9pt 18pt; padding: 0; }
li { margin-bottom: 3pt; }
table { border-collapse: collapse; width: 100%; margin: 9pt 0 12pt; font-size: 9.5pt; break-inside: avoid; }
th, td { border: 0.5pt solid #999; padding: 4pt 6pt; text-align: left; vertical-align: top; }
th { background: #eee; font-family: Helvetica, Arial, sans-serif; font-size: 9pt; }
blockquote { margin: 9pt 0 9pt 12pt; padding-left: 10pt; border-left: 2pt solid #bbb; }
blockquote p { margin-bottom: 5pt; }
code { font-family: "Courier New", monospace; font-size: 9.5pt; }
.cover { break-after: page; text-align: center; padding-top: 68mm; }
.cover .title { font-family: Helvetica, Arial, sans-serif; font-size: 27pt; font-weight: 700; line-height: 1.2; }
.cover .hours { font-family: Helvetica, Arial, sans-serif; font-size: 15pt; margin-top: 10pt; color: #333; }
.cover .pub { margin-top: 46mm; font-family: Helvetica, Arial, sans-serif; font-size: 12pt; }
.cover .status { margin-top: 24mm; font-size: 9.5pt; color: #444; max-width: 118mm; margin-left: auto; margin-right: auto; }
.pubpage { break-after: page; padding-top: 34mm; font-family: Helvetica, Arial, sans-serif; font-size: 10.5pt; }
.pubpage table { border: none; font-size: 10.5pt; }
.pubpage th, .pubpage td { border: none; padding: 3pt 10pt 3pt 0; }
.toc { break-after: page; }
.toc h1 { break-before: auto; }
.toc ol { list-style: none; margin-left: 0; }
.toc li { margin-bottom: 5pt; font-size: 10.5pt; }
.toc .n { font-family: Helvetica, Arial, sans-serif; font-weight: 700; display: inline-block; min-width: 24mm; }

.assessments{page-break-before:auto;margin-top:26pt;border-top:2pt solid #222;padding-top:12pt}
.assessments h2{font-size:13pt;margin:0 0 8pt}
.assessments h3{font-size:11pt;margin:14pt 0 6pt;border-bottom:0.5pt solid #999;padding-bottom:2pt}
.assessment-note{font-size:9pt;line-height:1.35;margin:0 0 12pt;padding:6pt 8pt;background:#f2f2f2}
.item{margin:0 0 10pt;page-break-inside:avoid}
.item .prompt{margin:0 0 4pt}
.choices{list-style:none;margin:0 0 4pt;padding-left:14pt}
.choices li{margin:0 0 1pt}
.choices li.key{font-weight:700}
.rationale{margin:0 0 0 14pt;font-size:9.5pt;color:#333}
`;

function frontMatter(course, lessonTitles) {
  const toc = lessonTitles.map((t, n) =>
    `<li><span class="n">Assignment ${String(n + 1).padStart(2, "0")}</span> ${esc(t)}</li>`).join("");
  return `
<section class="cover">
  <div class="title">${esc(course.title)}</div>
  <div class="hours">California Statutory Pre-License Course &middot; ${COURSE_DESIGN.hours} Hours</div>
  <div class="pub">${esc(PROVIDER.legalName)}</div>
  <div class="status">${esc(STATUS_LINE)}</div>
</section>

<section class="pubpage">
  <h2>Publication</h2>
  <table><tbody>
    <tr><th>Title</th><td>${esc(course.title)} — ${esc(PROVIDER.legalName)} California Course Text</td></tr>
    <tr><th>Author</th><td>${esc(PROVIDER.legalName)}</td></tr>
    <tr><th>Copyright</th><td>&copy; 2026 ${esc(PROVIDER.legalName)}. All rights reserved.</td></tr>
    <tr><th>Edition</th><td>1.0</td></tr>
    <tr><th>Publisher</th><td>${esc(PROVIDER.legalName)}, ${esc(PROVIDER.mailingAddress.city)}, ${esc(PROVIDER.mailingAddress.state)}</td></tr>
    <tr><th>Course hours</th><td>${COURSE_DESIGN.hours}</td></tr>
    <tr><th>Structure</th><td>${COURSE_DESIGN.lessonAssignments} separate lesson assignments of ${COURSE_DESIGN.minutesPerAssignment} instructional minutes each</td></tr>
    <tr><th>Delivery</th><td>${esc(COURSE_DESIGN.methodOfPresentation)}</td></tr>
    <tr><th>Proposed instructor</th><td>${esc(INSTRUCTOR.name)}, California DRE broker licence ${INSTRUCTOR.dreBrokerLicense} — ${esc(INSTRUCTOR.approvalStatus.toLowerCase())}</td></tr>
  </tbody></table>
  <p style="margin-top:16pt">All content in this volume is original and written for this course. No third-party
  textbook, workbook, or instructor guide is used.</p>
  <p><strong>${esc(STATUS_LINE)}</strong></p>
</section>

<section class="toc">
  <h1>Table of contents</h1>
  <ol>${toc}</ol>
</section>
`;
}

/*
 * The assessments as the student meets them, printed after the assignment they belong to.
 *
 * The correct answer and its explanation ARE printed here, and that is a deliberate difference
 * from what the browser serves: the portal withholds the explanation until the student answers,
 * because a check the student can read the answer to is not a check. A printed volume cannot
 * withhold anything, so rather than pretend, it prints the whole item and says plainly what the
 * student is served instead. A reviewer needs to see the item, the key and the reasoning; a
 * student working from paper has already answered.
 */
function renderAssessments(bank, assignmentId) {
  const lesson = bank?.assignments?.[assignmentId];
  if (!lesson) throw new Error(`${assignmentId}: no assessment bank entry`);

  const item = (entry, number) => {
    const choices = entry.choices
      .map((choice, index) => `<li${index === entry.correctChoice ? ' class="key"' : ""}>${inline(`${LETTERS[index]}. ${choice}`)}</li>`)
      .join("");
    return `<div class="item"><p class="prompt"><strong>${number}.</strong> ${inline(entry.prompt)}</p>
      <ol class="choices">${choices}</ol>
      <p class="rationale"><strong>Answer: ${LETTERS[entry.correctChoice]}.</strong> ${inline(entry.rationale)}</p></div>`;
  };

  const applied = Array.isArray(lesson.applied) ? lesson.applied : [lesson.applied];
  return `<section class="assessments">
  <h2>Assessment materials for this assignment</h2>
  <p class="assessment-note">These are the assessment items the student is served inside this assignment.
  <strong>In the course itself the student sees only the question and the answer choices</strong> — the correct
  answer and the explanation are withheld until the item has been answered, and the explanation for a failed
  engagement check is withheld while the student works the remediation set. They are printed here in full because
  this volume is submitted for review, and a reviewer is entitled to the item, the key and the reasoning.</p>
  <h3>Applied exercise — 100% required to complete the assignment</h3>
  ${applied.map((entry, index) => item(entry, index + 1)).join("")}
  <h3>Engagement check — ${lesson.engagement.length} items, ${"80"}% required</h3>
  ${lesson.engagement.map((entry, index) => item(entry, index + 1)).join("")}
  <h3>Remediation set — served only after a failed engagement check</h3>
  ${lesson.remediation.map((entry, index) => item(entry, index + 1)).join("")}
</section>`;
}

fs.mkdirSync(outDir, { recursive: true });
const summary = [];

for (const course of COURSES) {
  const curriculumDir = path.join(root, "california", course.courseId, "curriculum");
  const files = fs.readdirSync(curriculumDir).filter((f) => /^lesson-\d+\.md$/.test(f)).sort();

  if (files.length !== COURSE_DESIGN.lessonAssignments) {
    throw new Error(`${course.title}: found ${files.length} lessons, expected ${COURSE_DESIGN.lessonAssignments}`);
  }

  const bank = (await import(path.join(root, ASSESSMENT_BANKS[course.courseId]))).default;

  const titles = [];
  const bodies = [];
  for (const [index, file] of files.entries()) {
    const md = fs.readFileSync(path.join(curriculumDir, file), "utf8");
    /* The "## ..." immediately after the "# ..." line is the assignment's subject. */
    const subject = md.match(/^#\s+.*\n+##\s+(.+)$/m);
    titles.push(subject ? subject[1].trim() : file);
    bodies.push(renderMarkdown(md));
    bodies.push(renderAssessments(bank, `assignment-${String(index + 1).padStart(2, "0")}`));
  }

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(course.title)} — ${PROVIDER.legalName} California Course Text</title>
<style>${CSS}</style></head><body>
${frontMatter(course, titles)}
${bodies.join("\n")}
</body></html>`;

  const htmlPath = path.join(outDir, `${course.courseId}-course-text.html`);
  fs.writeFileSync(htmlPath, html);

  let pages = null;
  const pdfPath = path.join(outDir, `${course.courseId}-course-text.pdf`);
  if (CHROME) {
    execFileSync(CHROME, [
      "--headless", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`, `file://${htmlPath}`
    ], { stdio: "pipe", timeout: 300000 });
    const buf = fs.readFileSync(pdfPath);
    const counts = [...buf.toString("latin1").matchAll(/\/Type\s*\/Page[^s]/g)];
    pages = counts.length || null;
  }

  summary.push({ course: course.title, lessons: files.length, pdf: path.relative(root, pdfPath), pages });
}

console.log(`\nPrint-ready volumes — ${outDir.replace(root + "/", "")}\n`);
for (const s of summary) {
  console.log(`  ${s.course.padEnd(38)} ${String(s.lessons).padStart(2)} assignments  ${s.pages ? String(s.pages).padStart(4) + " pages" : "  (no PDF)"}`);
}
console.log(`\n  Total to print, one copy: ${summary.reduce((n, s) => n + (s.pages || 0), 0)} pages`);
console.log(`  Put each page count into that course's RE 313 "Pages" field.\n`);
