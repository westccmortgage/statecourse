#!/usr/bin/env node
/**
 * Generate the timed course outlines for the three California submissions.
 *
 * RE 303 checklist item 10 asks for a timed course outline. Rather than author one by hand
 * — which would immediately start disagreeing with the lesson files and the engine — this
 * script assembles each outline FROM the lesson files and the engine definition, and fails
 * loudly if they disagree with each other. The document DRE reads is therefore provably the
 * course the platform delivers.
 *
 * Checks enforced before anything is written:
 *   - the engine defines 15 assignments of 180 minutes (45 hours) per course
 *   - every lesson file exists, carries a timed sequence, and its rows sum to 180
 *   - every lesson has six instructional sections, matching the engine's sectionCount
 *   - the lesson's own title matches the engine's assignment title
 *
 * Output: california/<course>/submission/timed-course-outline.md
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCaliforniaCourse } from "../config/california-course-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const COURSES = [
  { id: "ca-real-estate-principles-45", folder: "ca-real-estate-principles-45-v1" },
  { id: "ca-real-estate-practice-45", folder: "ca-real-estate-practice-45-v1" },
  { id: "ca-mortgage-loan-brokering-lending-45", folder: "ca-mortgage-loan-brokering-lending-45-v1" }
];

const problems = [];

function parseLesson(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const title = text.match(/^## (.+)$/m)?.[1]?.trim();
  const objectives = [];
  const objectivesBlock = text.match(/## Learning objectives\n([\s\S]*?)\n## /);
  if (objectivesBlock) {
    for (const line of objectivesBlock[1].split("\n")) {
      const item = line.match(/^- (.+)$/)?.[1];
      if (item) objectives.push(item.trim());
    }
  }
  const rows = [];
  const sequenceBlock = text.match(/## Timed sequence\n([\s\S]*?)\n## /);
  if (sequenceBlock) {
    for (const line of sequenceBlock[1].split("\n")) {
      const match = line.match(/^\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|$/);
      if (match && !/^-+$/.test(match[1]) && !/^\*\*Total/.test(match[1]) && match[1] !== "Activity") {
        rows.push({ activity: match[1], minutes: Number(match[2]), evidence: match[3] });
      }
    }
  }
  const sections = [...text.matchAll(/^## (\d+)\. (.+)$/gm)].map((match) => ({
    number: Number(match[1]),
    title: match[2].trim()
  }));
  return { title, objectives, rows, sections };
}

for (const { id, folder } of COURSES) {
  const course = getCaliforniaCourse(id);
  if (!course) { problems.push(`${id}: not defined in the engine`); continue; }
  if (course.assignmentCount !== 15 || course.expectedMinutesPerAssignment !== 180) {
    problems.push(`${id}: engine does not define 15 × 180 minutes`);
    continue;
  }

  const lessons = [];
  for (const assignment of course.assignments) {
    const lessonPath = path.join(root, "california", folder, "curriculum", `lesson-${String(assignment.sequence).padStart(2, "0")}.md`);
    if (!fs.existsSync(lessonPath)) { problems.push(`${id}: missing ${lessonPath}`); continue; }
    const lesson = parseLesson(lessonPath);

    if (lesson.title !== assignment.title) {
      problems.push(`${id} lesson ${assignment.sequence}: file title "${lesson.title}" ≠ engine title "${assignment.title}"`);
    }
    const total = lesson.rows.reduce((sum, row) => sum + row.minutes, 0);
    if (total !== 180) {
      problems.push(`${id} lesson ${assignment.sequence}: timed sequence sums to ${total}, not 180`);
    }
    if (lesson.sections.length !== assignment.sectionCount) {
      problems.push(`${id} lesson ${assignment.sequence}: ${lesson.sections.length} sections, engine expects ${assignment.sectionCount}`);
    }
    if (!lesson.objectives.length) {
      problems.push(`${id} lesson ${assignment.sequence}: no learning objectives found`);
    }
    lessons.push({ assignment, lesson });
  }

  if (problems.length) continue;

  const lines = [];
  lines.push(`# Timed Course Outline — ${course.title}`);
  lines.push("");
  lines.push(`**Submission document for RE 303 checklist item 10.**`);
  lines.push(`**Course:** ${course.title}`);
  lines.push(`**Claimed hours:** 45 (fifteen separate lesson assignments of 180 instructional minutes each — Regulation 3000(a)(1))`);
  lines.push(`**Delivery:** Internet correspondence course with sequential control of progression`);
  lines.push(`**Status:** Submission draft. Not approved; no California credit is available.`);
  lines.push("");
  lines.push("## How this document was produced, and why it can be trusted");
  lines.push("");
  lines.push("This outline is generated from the course's own lesson files by `scripts/generate-california-timed-outlines.mjs`, which refuses to produce it unless every lesson exists, carries six instructional sections, states its learning objectives, and carries a timed sequence whose rows sum to exactly 180 minutes. The outline therefore cannot describe a course other than the one the platform delivers. Regenerate it after any lesson change; do not edit it by hand.");
  lines.push("");
  lines.push("## Course timing summary");
  lines.push("");
  lines.push("| Requirement | Value | Source |");
  lines.push("|---|---|---|");
  lines.push("| Lesson assignments | 15 | Regulation 3000(a)(1): not fewer than 15 separate lesson assignments |");
  lines.push("| Minutes per assignment | 180 | Course design |");
  lines.push("| Total instructional time | 2,700 minutes = 45 hours | Sum of the fifteen assignments |");
  lines.push("| Earliest completion | 2½ weeks from access | RE 303: a single correspondence course may not be completed in less than 2½ weeks |");
  lines.push("| Completion deadline | One year from registration | RE 303 |");
  lines.push(`| Final examination | ${course.finalQuestionCount} questions, ${course.finalExamMinutes} minutes, closed book, proctored, ${course.finalPassingPercent}% to pass, one retake on a different form | RE 303; Regulation 3000(a)(2)(B) |`);
  lines.push("");
  lines.push("Progression is sequential: each segment of each assignment must be completed before the next opens, and active study time is recorded server-side against each assignment. A lesson assignment is complete only when every section is viewed in order, the applied scenario response is submitted, and the scored lesson assessment is passed.");
  lines.push("");
  lines.push("## The fifteen lesson assignments");

  for (const { assignment, lesson } of lessons) {
    lines.push("");
    lines.push(`### Assignment ${assignment.sequence}: ${assignment.title}`);
    lines.push("");
    lines.push(`**Instructional time:** 180 minutes`);
    lines.push("");
    lines.push("**Learning objectives**");
    lines.push("");
    for (const objective of lesson.objectives) lines.push(`- ${objective}`);
    lines.push("");
    lines.push("**Instructional sections**");
    lines.push("");
    for (const section of lesson.sections) lines.push(`${section.number}. ${section.title}`);
    lines.push("");
    lines.push("**Timed sequence**");
    lines.push("");
    lines.push("| Activity | Minutes | Completion evidence |");
    lines.push("|---|---:|---|");
    for (const row of lesson.rows) lines.push(`| ${row.activity} | ${row.minutes} | ${row.evidence} |`);
    lines.push("| **Total** | **180** | One of 15 separate lesson assignments |");
  }

  lines.push("");
  lines.push("## Total");
  lines.push("");
  lines.push("Fifteen assignments × 180 minutes = **2,700 instructional minutes = 45 hours**.");
  lines.push("");

  const outPath = path.join(root, "california", folder, "submission", "timed-course-outline.md");
  fs.writeFileSync(outPath, lines.join("\n"));
  console.log(`written ${path.relative(root, outPath)} (${lessons.length} assignments)`);
}

if (problems.length) {
  console.error("\nRefusing to generate outlines that disagree with the course:");
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}
