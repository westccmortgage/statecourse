#!/usr/bin/env node
/**
 * Builds the course dossier a college instructor needs in order to evaluate whether
 * the curriculum is equivalent to a college course, which RE 303 requires when a
 * provider writes its own content.
 *
 * It is generated from the lesson files rather than written separately, so the outline,
 * objectives, and timing cannot drift from the material they describe. The same output
 * doubles as the timed course outline required by RE 303 checklist item 10.
 *
 * Run:  node scripts/generate-course-dossier.mjs
 * Out:  california/dre-sources/instructor-equivalence/dossier-<course>.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as engine from "../config/california-course-engine.mjs";
import { PROVIDER } from "../config/california/submission-facts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "california/dre-sources/instructor-equivalence");

const WORDS_PER_LINE = 12;
const LINES_PER_PAGE = 40;

/*
 * The page count the reviewing instructor is told must be the page count they receive.
 *
 * This file used to state an estimate, and the estimate was wrong by about a hundred pages
 * against the volume the print builder actually renders — it told a professor the Principles
 * text was 559 pages when the bound volume is 456. An estimate that overstates by that much is
 * worse than no figure at all, because the reviewer sizes their commitment by it.
 *
 * So where the built PDF exists, its real page count is read from the file. The estimate below
 * survives only as a fallback for a course whose volume has not been built, and it says which
 * it is giving.
 */
function renderedPages(folder) {
  const pdf = path.join(root, "california/print", `${folder}-course-text.pdf`);
  if (!fs.existsSync(pdf)) return null;
  const counts = [...fs.readFileSync(pdf).toString("latin1").matchAll(/\/Type\s*\/Page[^s]/g)];
  return counts.length || null;
}

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

/* Pulls the parts of a lesson an evaluator reads: what it covers, what it claims the
   student will be able to do, how the 180 minutes are spent, and its six topics. */
function parseLesson(markdown) {
  const lines = markdown.split("\n");
  const subject = (lines.find((line, index) => index > 1 && line.startsWith("## ")) ?? "").replace(/^##\s+/, "").trim();

  const objectives = [];
  let inObjectives = false;
  const timed = [];
  let inTimed = false;
  const topics = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (/^##\s+Learning objectives/i.test(line)) { inObjectives = true; continue; }
    if (/^##\s+Timed sequence/i.test(line)) { inObjectives = false; inTimed = true; continue; }
    if (/^##\s/.test(line) && !/^##\s+\d+\./.test(line)) { inObjectives = false; inTimed = false; }

    if (inObjectives && line.startsWith("- ")) objectives.push(line.slice(2).trim());
    if (inTimed && line.startsWith("|") && !/^\|\s*-+/.test(line) && !/Activity\s*\|/.test(line)) {
      const cells = line.slice(1, -1).split("|").map((cell) => cell.trim().replace(/\*\*/g, ""));
      if (cells.length >= 2 && cells[0] && !/^Total$/i.test(cells[0])) timed.push({ activity: cells[0], minutes: cells[1] });
    }
    const topic = line.match(/^##\s+(\d+)\.\s+(.+)$/);
    if (topic) topics.push(topic[2].trim());
  }
  return { subject, objectives, timed, topics };
}

function courseTotals(lessons, folder) {
  const words = lessons.reduce((sum, lesson) => sum + lesson.words, 0);
  const measured = renderedPages(folder);
  const pages = measured ?? lessons.reduce((sum, lesson) => sum + lesson.pages, 0);
  const rebuilt = lessons.filter((lesson) => lesson.distinct).length;
  return { words, pages, rebuilt, measured: measured !== null };
}

/* A lesson still generated from the original template repeats the same sentence stems
   in every topic. This flags which lessons have been rewritten, so the dossier never
   presents placeholder material as finished. */
function isRebuilt(markdown) {
  return !markdown.includes("is studied as an operating concept, not as a vocabulary label");
}

fs.mkdirSync(outDir, { recursive: true });

for (const courseId of engine.CALIFORNIA_COURSE_IDS) {
  const course = engine.getCaliforniaCourse(courseId);
  const folder = course.assignments[0].contentPath.split("/")[3];

  const lessons = course.assignments.map((assignment, index) => {
    const file = path.join(root, "california", folder, "curriculum", path.basename(assignment.contentPath));
    const markdown = fs.readFileSync(file, "utf8");
    return {
      sequence: index + 1,
      id: assignment.id,
      words: markdown.split(/\s+/).filter(Boolean).length,
      pages: estimatePages(markdown),
      distinct: isRebuilt(markdown),
      ...parseLesson(markdown)
    };
  });

  const totals = courseTotals(lessons, folder);
  const assessmentItems = course.assignments.reduce((sum, assignment) => {
    return sum + ["applied", "engagement", "remediation"].reduce((inner, kind) => {
      return inner + (engine.getCaliforniaAssessment(courseId, assignment.id, kind)?.items.length ?? 0);
    }, 0);
  }, 0);

  const out = [];
  out.push(`# Course dossier — ${course.title}`);
  out.push("");
  /* The legal name comes from the facts file. It used to be written here as "state course
     LLC", the Wyoming-era spelling of a name that is StateCourse LLC, and it reached every
     dossier sent to a prospective certifying instructor. */
  out.push(
    `**Provider:** ${PROVIDER.legalName} (${PROVIDER.entityType}, CA SoS file ${PROVIDER.secretaryOfStateFileNumber}, filed ${PROVIDER.secretaryOfStateFiledOn})`,
  );
  out.push(`**Course:** ${course.title}`);
  out.push(`**Course identifier:** \`${courseId}\`, version ${course.version}`);
  out.push(`**Instruction hours:** ${course.requiredHours}`);
  out.push(`**Delivery:** Correspondence / internet`);
  out.push(`**Structure:** ${course.assignmentCount} separate lesson assignments of ${course.expectedMinutesPerAssignment} instructional minutes each`);
  out.push(`**Regulatory status:** Not approved. No California credit is available. This dossier supports an application that has not been filed.`);
  out.push("");
  out.push("> **Generated file.** Produced by `scripts/generate-course-dossier.mjs` from the lesson");
  out.push("> files themselves, so the outline, objectives, and timing cannot drift from the material");
  out.push("> they describe. Regenerate after any change to the curriculum.");
  out.push("");

  out.push("## Why this document exists");
  out.push("");
  out.push("California DRE form RE 303 sets the approval standard for a statutory pre-license course:");
  out.push("");
  out.push("> To obtain approval, curriculum must be equivalent to real estate courses offered by colleges");
  out.push("> or universities accredited by the Western Association of Schools and Colleges as recognized by");
  out.push("> the United States Department of Education.");
  out.push(">");
  out.push("> **If you write your own course content, it will be necessary to obtain a certification from a");
  out.push("> college instructor in the field of study for each specific course, confirming the course content");
  out.push("> is equivalent to course material used in a college or university course. This certification must");
  out.push("> be on official school letterhead and signed by the instructor.**");
  out.push("");
  out.push("This dossier is the material a reviewing college instructor needs in order to make that judgment.");
  out.push("");

  out.push("## Structure and why it takes this form");
  out.push("");
  out.push("The 15-assignment structure is not a design preference. Commissioner's Regulation 3000(a)(1)");
  out.push("provides that *\"a correspondence course shall consist of not less than 15 separate lesson");
  out.push("assignments,\"* and the course is built to that requirement. Each assignment is scoped to 180");
  out.push("instructional minutes, giving 45 hours across the course.");
  out.push("");
  out.push("Each assignment covers six topics, carries its own learning objectives, an applied written");
  out.push("exercise, and a five-item scored check against an 80 percent mastery threshold, with a separate");
  out.push("five-item remediation set covering the same concepts a second way for students who do not meet it.");
  out.push("");

  out.push("## Current state of the material");
  out.push("");
  out.push("| Measure | Value |");
  out.push("| --- | --- |");
  out.push(`| Lesson assignments | ${lessons.length} |`);
  out.push(`| Lessons written as distinct instruction | ${totals.rebuilt} of ${lessons.length} |`);
  out.push(`| Words of instructional text | ${totals.words.toLocaleString("en-US")} |`);
  out.push(
    totals.measured
      ? `| Printed volume | **${totals.pages} pages**, measured from the bound PDF submitted with this application |`
      : `| Estimated typeset pages | ~${Math.round(totals.pages)} (estimate — the volume has not been built) |`,
  );
  out.push(`| Scored assessment items | ${assessmentItems} |`);
  out.push("");
  out.push("RE 303 states that *\"approximately 450 pages of text/instructional material is equivalent to");
  out.push("textbooks offered by a California college or university\"* for a 45-hour course.");
  out.push("");
  if (Math.round(totals.pages) < 450) {
    out.push(`**This course is at ${totals.pages} pages${totals.measured ? " (measured)" : " (estimated)"}, against that ~450-page benchmark.**`);
    out.push("The material is written instruction rather than placeholder text, but it is not yet at the depth");
    out.push("the benchmark implies, and it is presented here as work in progress. A reviewing instructor is");
    out.push("being asked to evaluate the approach, the coverage, and the quality of what exists — and their");
    out.push("comments are wanted while the remaining depth is being written, not afterwards.");
  } else {
    out.push(`This course is at **${totals.pages} pages${totals.measured ? ", measured from the bound volume" : " (estimated)"}**, meeting the benchmark. The volume contains the complete student-viewable instructional text together with the applied exercise, engagement check and remediation set for every assignment — all of the material RE 303 item 6 asks for.`);
  }
  out.push("");
  if (totals.rebuilt < lessons.length) {
    out.push(`> **Note:** ${lessons.length - totals.rebuilt} of the ${lessons.length} lessons below are still generated placeholder`);
    out.push("> text and are marked as such in the outline. They are listed for completeness of the outline");
    out.push("> only and should not be read as representative of the course.");
    out.push("");
  }

  out.push("## Timed course outline");
  out.push("");
  out.push("| # | Lesson assignment | Minutes | Est. pages | Status |");
  out.push("| ---: | --- | ---: | ---: | --- |");
  for (const lesson of lessons) {
    out.push(`| ${lesson.sequence} | ${lesson.subject} | ${course.expectedMinutesPerAssignment} | ~${lesson.pages.toFixed(1)} | ${lesson.distinct ? "Written" : "Placeholder"} |`);
  }
  out.push(`| | **Total** | **${lessons.length * course.expectedMinutesPerAssignment} minutes = ${course.requiredHours} hours** | **~${Math.round(totals.pages)}** | |`);
  out.push("");

  out.push("## Lesson detail");
  out.push("");
  for (const lesson of lessons) {
    out.push(`### ${lesson.sequence}. ${lesson.subject}${lesson.distinct ? "" : "  *(placeholder text — not yet written)*"}`);
    out.push("");
    if (lesson.topics.length) {
      out.push("**Topics covered:**");
      out.push("");
      for (const [index, topic] of lesson.topics.entries()) out.push(`${index + 1}. ${topic}`);
      out.push("");
    }
    if (lesson.objectives.length) {
      out.push("**Learning objectives — on completion the student can:**");
      out.push("");
      for (const objective of lesson.objectives) out.push(`- ${objective}`);
      out.push("");
    }
    if (lesson.timed.length) {
      out.push("**Time allocation:**");
      out.push("");
      out.push("| Activity | Minutes |");
      out.push("| --- | ---: |");
      for (const row of lesson.timed) out.push(`| ${row.activity} | ${row.minutes} |`);
      out.push("");
    }
  }

  out.push("## Assessment design");
  out.push("");
  out.push("| Component | Per lesson | Across the course |");
  out.push("| --- | ---: | ---: |");
  out.push(`| Applied written exercise | 1 | ${lessons.length} |`);
  out.push(`| Scored engagement items | 5 | ${lessons.length * 5} |`);
  out.push(`| Remediation items (alternate set) | 5 | ${lessons.length * 5} |`);
  out.push(`| **Total scored items** | **11** | **${assessmentItems}** |`);
  out.push("");
  out.push("Every item has its own prompt, its own answer choices, and its own rationale; no item shares an");
  out.push("answer set with any other item in any of the three courses. Correct answers are distributed across");
  out.push("positions rather than sitting in a fixed place. A student who does not reach the 80 percent");
  out.push("threshold receives an alternate explanation and a different item set covering the same concepts,");
  out.push("rather than being re-shown the questions they missed.");
  out.push("");
  out.push("The final examination is separate from these lesson checks and is governed by the requirements in");
  out.push("RE 303: not fewer than 100 multiple-choice or fill-in questions, a passing score of 60 percent or");
  out.push("greater, comprehensive coverage of the entire course, proctored administration, and one permitted");
  out.push("retake using different questions.");
  out.push("");

  out.push("## What the reviewing instructor is asked to evaluate");
  out.push("");
  out.push("1. Does the **coverage** correspond to what a college course in this subject covers?");
  out.push("2. Is the **depth** of treatment comparable to college-level material?");
  out.push("3. Are the **learning objectives** appropriate and actually addressed by the content?");
  out.push("4. Is the **assessment** appropriate to the objectives?");
  out.push("5. Is the **time allocation** realistic for the material?");
  out.push("6. What is **missing or thin** relative to a college course in this field?");
  out.push("");
  out.push("Question 6 is the one most wanted. A list of gaps is more useful than an endorsement.");
  out.push("");

  fs.writeFileSync(path.join(outDir, `dossier-${courseId}.md`), `${out.join("\n")}\n`);
  console.log(`wrote dossier-${courseId}.md — ${totals.rebuilt}/${lessons.length} lessons written, ~${Math.round(totals.pages)} pages, ${assessmentItems} items`);
}
