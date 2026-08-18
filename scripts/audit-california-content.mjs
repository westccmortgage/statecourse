#!/usr/bin/env node
/**
 * California content quality auditor.
 *
 * Measures the four things a DRE reviewer and a student both notice first:
 *   1. render integrity   - does the student reader emit clean prose, or raw Markdown?
 *   2. typography         - do rendered headings and sentences start with a capital?
 *   3. instructional substance - how much of the lesson prose is distinct writing
 *                           rather than one template with the topic name swapped in?
 *   4. assessment integrity - are the scored items actually different from each other?
 *
 * Run:  node scripts/audit-california-content.mjs
 *       node scripts/audit-california-content.mjs --strict   (exit 1 unless every gate passes)
 *
 * The strict gates describe the "California ready" standard, not today's state.
 * They are expected to fail until the lesson rebuild is complete; that is the
 * point of the gate. Do not wire --strict into CI until the rebuild lands.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as engine from "../config/california-course-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");

/* The reader is the source of truth for how a lesson actually looks to a student,
   so the audit renders through the reader's own Markdown pipeline rather than a
   second implementation that could drift from it. */
function loadReaderRenderer() {
  const source = fs.readFileSync(path.join(root, "public/statecourse/student/course/student-course.js"), "utf8");
  const start = source.indexOf("function escapeHtml");
  const tail = 'flush();return output.join("");\n}';
  const end = source.indexOf(tail);
  if (start < 0 || end < 0) throw new Error("Could not locate the reader Markdown pipeline in student-course.js");
  const body = source.slice(start, end + tail.length);
  return new Function(`${body}\nreturn { renderMarkdown, sentenceCase, titleCaseHeading };`)();
}

function lessonFiles() {
  const files = [];
  for (const courseId of engine.CALIFORNIA_COURSE_IDS) {
    const course = engine.getCaliforniaCourse(courseId);
    const folder = course.assignments[0].contentPath.split("/")[3];
    for (const [index, assignment] of course.assignments.entries()) {
      files.push({
        courseId,
        folder,
        subject: course.subjects[index],
        assignmentId: assignment.id,
        file: path.join(root, "california", folder, "curriculum", path.basename(assignment.contentPath))
      });
    }
  }
  return files;
}

/* Strip the topic name out of a paragraph so that two paragraphs which differ only
   by "business planning" vs "seller and buyer agency" collapse to one template. */
function normalizeParagraph(text, topics) {
  let value = ` ${text.toLowerCase()} `;
  for (const topic of topics) value = value.split(topic).join("«T»");
  return value.replace(/\s+/g, " ").trim();
}

function topicsFor(markdown, subject) {
  const topics = new Set([subject.toLowerCase()]);
  for (const line of markdown.split("\n")) {
    const objective = line.match(/^-\s+Analyze (.+?) using verified facts/i);
    if (objective) topics.add(objective[1].toLowerCase());
    const heading = line.match(/^##\s+\d+\.\s+(.+)$/);
    if (heading) topics.add(heading[1].trim().toLowerCase());
  }
  return [...topics].sort((a, b) => b.length - a.length);
}

function isProse(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return !/^(#|\||-|\*|\d+\.)/.test(trimmed);
}

/* RE 303 measures instructional material in pages, not words, and DRE requires printed
   copies. Word count understates a page carrying a table or a callout, so this estimates
   typeset length instead: prose wraps at roughly 12 words per line, table rows and list
   items take their own line, headings take a line plus spacing, and a page holds about
   40 lines. The authoritative figure is the printed submission copy; this is the working
   estimate while the rebuild is in progress. */
const WORDS_PER_LINE = 12;
const LINES_PER_PAGE = 40;

function estimatePages(markdown) {
  let lines = 0;
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const words = line.split(/\s+/).length;
    if (/^#{1,6}\s/.test(line)) { lines += 2; continue; }
    if (line.startsWith("|")) { lines += 1; continue; }
    if (/^([-*]|\d+[.)]|>)\s/.test(line)) { lines += Math.max(1, Math.ceil(words / WORDS_PER_LINE)); continue; }
    lines += Math.ceil(words / WORDS_PER_LINE) + 1;
  }
  return lines / LINES_PER_PAGE;
}

const renderer = loadReaderRenderer();
const lessons = lessonFiles();
const report = { render: [], typography: [], substance: null, assessments: null };

/* 1 + 2: render integrity and typography, measured on the rendered output. */
const rawMarkdown = [
  ["bold marker", /\*\*/],
  ["emphasis marker", /(^|\s)\*\S/],
  ["heading marker", /(^|\n)\s*#{1,6}\s/],
  ["thematic break", /(^|\n)\s*(---|\*\*\*|___)\s*(\n|$)/],
  ["blockquote marker", /(^|\n)\s*>\s/],
  ["code backtick", /`/],
  ["table pipe", /\|/],
  ["unresolved link", /\[[^\]]+\]\(/]
];

const paragraphCounts = new Map();
const lessonStats = [];
let totalParagraphs = 0;
let totalWords = 0;

for (const lesson of lessons) {
  const markdown = fs.readFileSync(lesson.file, "utf8");
  const relative = path.relative(root, lesson.file);
  const html = renderer.renderMarkdown(markdown);
  const text = html.replace(/<[^>]+>/g, "");

  for (const [label, pattern] of rawMarkdown) {
    if (pattern.test(text)) report.render.push(`${relative}: raw ${label} survived rendering`);
  }

  for (const heading of html.matchAll(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/g)) {
    const plain = heading[1].replace(/<[^>]+>/g, "").replace(/&#39;|&quot;|&amp;/g, (entity) => ({ "&#39;": "'", "&quot;": '"', "&amp;": "&" }[entity])).trim();
    if (plain && /^[a-z]/.test(plain)) report.typography.push(`${relative}: heading renders lowercase - "${plain}"`);
    /* Title-casing must not capitalize the letter after an apostrophe: "Commissioner'S". */
    if (/['\u2019][A-Z]/.test(plain)) report.typography.push(`${relative}: heading capitalizes after an apostrophe - "${plain}"`);
  }
  for (const paragraph of html.matchAll(/<p>(.*?)<\/p>/g)) {
    const plain = paragraph[1].replace(/<[^>]+>/g, "").trim();
    if (plain && /^[a-z]/.test(plain)) report.typography.push(`${relative}: paragraph renders lowercase - "${plain.slice(0, 60)}"`);
  }

  const topics = topicsFor(markdown, lesson.subject);
  const lessonWords = markdown.split(/\s+/).filter(Boolean).length;
  totalWords += lessonWords;
  lessonStats.push({ course: lesson.courseId, id: lesson.assignmentId, words: lessonWords, pages: estimatePages(markdown) });
  for (const line of markdown.split("\n")) {
    if (!isProse(line)) continue;
    const normalized = normalizeParagraph(line.trim(), topics);
    paragraphCounts.set(normalized, (paragraphCounts.get(normalized) ?? 0) + 1);
    totalParagraphs += 1;
  }
}

/* DRE's benchmark for a 45-hour statutory course is instructional material of a length
   comparable to a college textbook - RE 303 puts that at roughly 450 pages per course.
   Across 15 lesson assignments that is about 30 pages, or roughly 8,000 words, each.
   The target is reported per lesson so the rebuild's progress is measurable. */
/* RE 303: "approximately 450 pages of text/instructional material is equivalent to
   textbooks offered by a California college or university" for a 45-hour course. Across
   15 lesson assignments that is 30 pages each. */
const PAGE_TARGET = 30;

/* 3: substance. Distinct paragraphs are the honest measure of how much was written;
   word count only measures how many times the template was stamped out. */
const distinctParagraphs = paragraphCounts.size;
const templated = [...paragraphCounts.values()].filter((count) => count > 1).reduce((sum, count) => sum + count, 0);
report.substance = {
  lessons: lessons.length,
  words: totalWords,
  paragraphs: totalParagraphs,
  distinctParagraphs,
  templatedShare: totalParagraphs ? templated / totalParagraphs : 0,
  worstTemplates: [...paragraphCounts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text, count]) => ({ count, preview: text.slice(0, 96) }))
};

/* 4: assessment integrity. Reordering one fixed answer list is not a question bank. */
const items = [];
const missing = [];
const shortSets = [];
for (const courseId of engine.CALIFORNIA_COURSE_IDS) {
  const course = engine.getCaliforniaCourse(courseId);
  for (const assignment of course.assignments) {
    for (const kind of ["applied", "engagement", "remediation"]) {
      const assessment = engine.getCaliforniaAssessment(courseId, assignment.id, kind);
      if (!assessment) {
        missing.push(`${courseId} ${assignment.id} ${kind}`);
        continue;
      }
      const expected = kind === "applied" ? 1 : 5;
      if (assessment.items.length !== expected) {
        shortSets.push(`${courseId} ${assignment.id} ${kind}: ${assessment.items.length} item(s), expected ${expected}`);
      }
      items.push(...assessment.items);
    }
  }
}
const expectedAssessments = engine.CALIFORNIA_COURSE_IDS.length * 15 * 3;
const positions = [0, 0, 0, 0];
for (const item of items) positions[item.correctChoice] = (positions[item.correctChoice] ?? 0) + 1;
const worstPosition = items.length ? Math.max(...positions) / items.length : 0;
const choiceSets = new Set(items.map((item) => JSON.stringify([...item.choices].sort())));
const correctAnswers = new Set(items.map((item) => item.choices[item.correctChoice]));
report.assessments = {
  authoredAssessments: expectedAssessments - missing.length,
  expectedAssessments,
  missing,
  shortSets,
  items: items.length,
  distinctPrompts: new Set(items.map((item) => item.prompt)).size,
  distinctChoiceSets: choiceSets.size,
  distinctCorrectAnswers: correctAnswers.size,
  distinctRationales: new Set(items.map((item) => item.rationale)).size,
  positions,
  worstPosition
};

/* Gates that define "California ready" for these four dimensions. */
const gates = [
  { name: "no raw Markdown reaches the student reader", pass: report.render.length === 0, detail: `${report.render.length} finding(s)` },
  { name: "no rendered heading or sentence starts lowercase", pass: report.typography.length === 0, detail: `${report.typography.length} finding(s)` },
  {
    name: "lesson prose is written, not templated (<10% repeated)",
    pass: report.substance.templatedShare < 0.1,
    detail: `${(report.substance.templatedShare * 100).toFixed(1)}% of ${report.substance.paragraphs} paragraphs repeat a template; only ${report.substance.distinctParagraphs} distinct paragraphs exist`
  },
  {
    name: "every lesson has an authored question bank",
    pass: report.assessments.missing.length === 0 && report.assessments.shortSets.length === 0,
    detail: report.assessments.missing.length || report.assessments.shortSets.length
      ? `${report.assessments.missing.length} missing, ${report.assessments.shortSets.length} wrong size (first: ${[...report.assessments.missing, ...report.assessments.shortSets][0]})`
      : `${report.assessments.authoredAssessments} / ${report.assessments.expectedAssessments} assessments authored`
  },
  {
    name: "correct answers are spread across positions (no position over 40%)",
    pass: report.assessments.items > 0 && report.assessments.worstPosition <= 0.4,
    detail: `positions A/B/C/D = ${report.assessments.positions.join(" / ")} (worst ${(report.assessments.worstPosition * 100).toFixed(1)}%)`
  },
  {
    name: "every scored item has its own answer choices",
    pass: report.assessments.items > 0 && report.assessments.distinctChoiceSets >= report.assessments.items,
    detail: `${report.assessments.items} items share ${report.assessments.distinctChoiceSets} choice set(s) and ${report.assessments.distinctCorrectAnswers} correct-answer text(s)`
  }
];

const out = [];
out.push("California content audit");
out.push("========================");
out.push(`lessons audited: ${report.substance.lessons} (3 courses x 15 lesson assignments)`);
out.push("");
out.push("Render integrity");
out.push(report.render.length ? report.render.slice(0, 10).map((line) => `  - ${line}`).join("\n") : "  clean - no raw Markdown survives the reader pipeline");
out.push("");
out.push("Typography");
out.push(report.typography.length ? report.typography.slice(0, 10).map((line) => `  - ${line}`).join("\n") : "  clean - headings and sentences render capitalized");
out.push("");
out.push("Instructional substance");
out.push(`  words across all lessons ....... ${report.substance.words.toLocaleString("en-US")}`);
out.push(`  body paragraphs ............... ${report.substance.paragraphs.toLocaleString("en-US")}`);
out.push(`  distinct paragraphs ........... ${report.substance.distinctParagraphs}`);
out.push(`  templated share ............... ${(report.substance.templatedShare * 100).toFixed(1)}%`);
out.push(`  estimated pages, all lessons .. ${Math.round(lessonStats.reduce((sum, lesson) => sum + lesson.pages, 0))}`);
out.push(`  per-course target ............. 450 pages (RE 303) = ${PAGE_TARGET} per lesson assignment`);
for (const courseId of engine.CALIFORNIA_COURSE_IDS) {
  const inCourse = lessonStats.filter((lesson) => lesson.course === courseId);
  const pages = inCourse.reduce((sum, lesson) => sum + lesson.pages, 0);
  const short = inCourse.filter((lesson) => lesson.pages < PAGE_TARGET).length;
  out.push(`    ${courseId.padEnd(38)} ~${String(Math.round(pages)).padStart(3)} pages, ${short}/${inCourse.length} lessons under target`);
}
for (const template of report.substance.worstTemplates) out.push(`    ${String(template.count).padStart(3)}x  ${template.preview}...`);
out.push("");
out.push("Assessment integrity");
out.push(`  assessments authored .......... ${report.assessments.authoredAssessments} / ${report.assessments.expectedAssessments}`);
out.push(`  scored items .................. ${report.assessments.items}`);
out.push(`  distinct prompts .............. ${report.assessments.distinctPrompts}`);
out.push(`  distinct choice sets .......... ${report.assessments.distinctChoiceSets}`);
out.push(`  distinct correct answers ...... ${report.assessments.distinctCorrectAnswers}`);
out.push(`  distinct rationales ........... ${report.assessments.distinctRationales}`);
out.push(`  correct-answer positions ...... ${report.assessments.positions.join(" / ")}`);
out.push("");
out.push("Gates");
for (const gate of gates) out.push(`  [${gate.pass ? "pass" : "FAIL"}] ${gate.name}\n         ${gate.detail}`);
console.log(out.join("\n"));

if (strict && gates.some((gate) => !gate.pass)) process.exit(1);
