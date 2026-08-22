#!/usr/bin/env node
/**
 * Builds the final examination documents RE 303 requires in the submission package:
 *
 *   item 11  student final exam instructions
 *   item 12  exam proctor/monitor instructions, with a certification statement and a
 *            signature field
 *   item 13  the student version of the final exam — "an exact copy of what students see"
 *   item 14  the instructor version with an answer key that references where in the
 *            course material each answer is found
 *
 * The student version and the answer key are generated from the same engine call the
 * student portal makes, so the printed copy carries the same items in the same order
 * with the same choice order the student is served. Hand-typing them would let the two
 * drift, which is exactly the defect a reviewer comparing them would find.
 *
 * Output goes to california/<course folder>/submission/. Nothing here is copied into
 * `dist` — site/build.sh fails the build if a file matching /final-exam-bank|answer-key/
 * reaches the published site.
 *
 * Run:  node scripts/generate-california-final-exam-package.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as engine from "../config/california-course-engine.mjs";
import { PROVIDER } from "../config/california/submission-facts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LETTERS = ["A", "B", "C", "D", "E", "F"];

const NOT_APPROVED = "**Regulatory status:** submission draft. This course is not approved by the California Department of Real Estate, no course approval number has been issued, and no California continuing education or pre-license credit is available for it.";

/* Values RE 303 states, kept separate from values StateCourse proposes, because a
   reviewer is entitled to see which is which and RE 306 items 17-20 ask the applicant
   to state the second group. */
const PROVIDER_PROPOSED = [
  ["Time allowed", "180 minutes (RE 306 item 19 — provider-proposed)"],
  ["Open or closed book", "Closed book (RE 306 item 20 — provider-proposed)"]
];

function header(course, title) {
  return [
    `# ${course.title} — ${title}`,
    "",
    `**Course:** ${course.title} (${course.requiredHours} hours, ${course.assignmentCount} lesson assignments)`,
    `**Course version:** ${course.version}`,
    /* The legal name, read rather than typed. These documents said "StateCourse" for a
       fortnight after RE 336 was corrected for the same defect: a provider name that is not the
       entity's name, in a document filed with the Department. */
    `**Provider:** ${PROVIDER.legalName}`,
    NOT_APPROVED,
    ""
  ].join("\n");
}

function studentInstructions(course) {
  return `${header(course, "student final examination instructions")}
## Before you may sit for the examination

You may sit for the final examination only after all of the following are recorded:

1. **All ${course.assignmentCount} lesson assignments completed**, including every applied exercise, every scored check, and any remediation those checks triggered.
2. **The minimum elapsed time has passed.** A single correspondence course may not be completed in less than two and one-half weeks, measured from the date you received access to the date you pass the final examination.
3. **The cross-course limit is satisfied.** No more than two courses may be completed in any five-week period. The limit applies across every school you attend, not only this one, so you are asked to attest to completions elsewhere.
4. **A proctor has been approved** by the school. See the proctor instructions issued with this document.
5. **The one-year limit has not expired.** All coursework must be completed within one year of registration; after that you must re-enroll.

## The examination

| | |
|---|---|
| Questions | ${course.finalQuestionCount}, multiple choice |
| Passing score | ${course.finalPassingPercent}% or greater |
| Coverage | The entire course. Every lesson assignment is represented. |
${PROVIDER_PROPOSED.map(([label, value]) => `| ${label} | ${value} |`).join("\n")}
| Attempts | ${course.maxFinalAttempts} — the original examination and one retake |
| Retake | A different examination form covering the same material |
| Proctoring | Required. The examination is administered and supervised by a school-designated proctor. |

## Identification

**You must present photo identification to the proctor immediately before the examination begins.** Any one of the following is acceptable:

- A California identification card issued under Vehicle Code section 13000.
- Any other valid government-issued photo identification.
- Current identification issued within the preceding five years by a recognized real estate trade organization, bearing your photograph, your signature, and an identification number.

The proctor will verify that the name on your identification matches your enrollment record. **If it does not match, the proctor may not administer the examination.**

## Rules during the examination

- The examination is **closed book**. No notes, course materials, or reference material of any kind may be used.
- **No electronic device** other than the one on which the examination is being taken.
- **No assistance from any person.**
- The online examination **cannot be printed or downloaded**, and it **times out when the time allowed expires**. Answers recorded when time expires are the answers submitted.
- **You may not remove, copy, photograph, reproduce, or transmit any examination question**, in whole or in part, by any means.
- **You may not leave the examination room** except as the proctor permits and records.

## Results, and what a failure means

**If you pass**, the school records the result and issues your course completion certificate within the period the regulations require.

**If you do not pass**, you are entitled to **one retake**, on a different form covering the same material, subject to the same proctoring and identification requirements.

> **If you do not pass the retake, no credit is granted for the course and you must take the course again.** This is a regulatory consequence, not a school policy, and the school cannot waive it.

## What the school will not do

- The examination is **never furnished directly to a student** under any circumstances, before or after the fact.
- The school does not disclose which specific questions were answered incorrectly.
- Payment of any fee does not determine examination eligibility, the examination result, credit, or issuance of a certificate. Those are determined solely by the requirements above.

## Questions

Direct questions about eligibility, scheduling, proctor approval, or identification to the school before your examination date. Do not raise them with the proctor at the examination, who has no authority to waive any requirement.
`;
}

function proctorInstructions(course) {
  return `${header(course, "examination proctor instructions and certification")}
## Who may serve as proctor

The proctor is **designated by the school**. A candidate proposed by the student must be approved by the school before the examination is scheduled.

**A person may not serve as proctor if that person is related to the student by blood, marriage, or domestic partnership, or by any other relationship.** A future or prospective responsible broker of the student is an example of a relationship that disqualifies. If you are unsure whether a relationship disqualifies you, **you must contact the school before the examination rather than exercise judgment about it.**

## Before the examination

1. **Verify identity.** Immediately before the examination begins, examine the student's photo identification. Acceptable identification is: a California identification card issued under Vehicle Code section 13000; any other valid government-issued photo identification; or current identification issued within the preceding five years by a recognized real estate trade organization bearing the student's photograph, signature, and identification number.
2. **Confirm the name matches** the enrollment record supplied to you by the school. **If it does not match, do not administer the examination.** Contact the school.
3. **Confirm the examination environment.** The student must be alone with you, free of course materials, notes, reference materials, and any electronic device other than the one on which the examination is taken.
4. **Do not open, read, copy, photograph, or retain the examination.** The examination materials are the school's and are returned to the school.

## During the examination

- **Remain present and supervising for the entire examination period.** Do not leave the student unattended.
- **Permit no assistance of any kind**, from any person or material.
- **Answer no question about examination content.** Direct any content question to the school afterward.
- **Record any interruption** — a departure from the room, a technical failure, an interruption by another person — with the time and the circumstances, on the certification below.
- **The examination times out when the time allowed expires.** Do not extend it. If a technical failure occurs, stop, record it, and contact the school.

## After the examination

1. **Return all examination materials to the school** by the method the school specifies. Retain no copy.
2. **Complete and sign the certification below** and return it with the materials.
3. **Report any irregularity**, however minor and whether or not you believe it affected the result.

## Proctor certification

I certify that:

- I am the proctor designated or approved by the school for this examination.
- **I am not related to the student by blood, marriage, or domestic partnership, or by any other relationship**, and I have no interest in the outcome of this examination.
- I verified the student's photo identification immediately before the examination began and the name matched the enrollment record supplied to me.
- I remained present and supervised the student for the entire examination period.
- The student received no assistance from any person and used no notes, course materials, reference materials, or unauthorized device.
- The examination was concluded within the time allowed.
- I have recorded below every interruption and every irregularity that occurred.
- I have returned all examination materials to the school and retained no copy of any part of the examination.

**I make this certification under penalty of perjury under the laws of the State of California.**

| | |
|---|---|
| Student name | ____________________________________________ |
| Course | ${course.title} |
| Examination form | ____________  (original / retake) |
| Date of examination | ____________________________________________ |
| Time started | ____________________  Time finished ____________________ |
| Location | ____________________________________________ |
| Interruptions or irregularities (write "none" if none) | ____________________________________________ |
| | ____________________________________________ |

| | |
|---|---|
| Proctor name (print) | ____________________________________________ |
| Proctor title and organization | ____________________________________________ |
| Proctor address | ____________________________________________ |
| Proctor telephone and email | ____________________________________________ |
| Relationship to student, if any | ____________________________________________ |
| **Proctor signature** | ____________________________________________ |
| **Date signed** | ____________________________________________ |

${NOT_APPROVED}
`;
}

function studentVersion(course, exam) {
  const lines = [header(course, `final examination — form ${exam.form}, student version`)];
  lines.push(`This is the examination exactly as the student is served it: the same ${exam.items.length} items in the same order, with the same answer choices in the same order. It is generated from the examination engine rather than transcribed.`);
  lines.push("");
  lines.push(`**Questions:** ${exam.items.length}  |  **Passing score:** ${exam.passingPercent}%  |  **Time allowed:** ${exam.minutes} minutes  |  **Closed book**  |  **Proctored**`);
  lines.push("");
  lines.push("Select the one best answer for each question.");
  lines.push("");
  lines.push("---");
  lines.push("");
  for (const [index, item] of exam.items.entries()) {
    lines.push(`**${index + 1}.** ${item.prompt}`);
    lines.push("");
    for (const [choiceIndex, choice] of item.choices.entries()) {
      lines.push(`${LETTERS[choiceIndex]}. ${choice}`);
    }
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  lines.push("**End of examination.**");
  lines.push("");
  return lines.join("\n");
}

function answerKey(course, exam) {
  const lines = [header(course, `final examination — form ${exam.form}, instructor version and answer key`)];
  lines.push("**SECURE DOCUMENT — INSTRUCTOR AND REGULATOR USE ONLY. NOT FOR DISTRIBUTION TO STUDENTS.**");
  lines.push("");
  lines.push(`Every item shows the correct answer, why it is correct, and **where in the course material the answer is found** — the assignment and the numbered subsection, which RE 303 requires of the instructor version. Item order and choice order match the student version exactly.`);
  lines.push("");
  lines.push(`**Questions:** ${exam.items.length}  |  **Passing score:** ${exam.passingPercent}% (${Math.ceil(exam.items.length * exam.passingPercent / 100)} correct)  |  **Time allowed:** ${exam.minutes} minutes`);
  lines.push("");
  const assignmentTitle = new Map(course.assignments.map((assignment) => [assignment.id, assignment.title]));
  const reference = (source) => `Assignment ${source.assignment.replace("assignment-", "")} (${assignmentTitle.get(source.assignment)}), section ${source.section}`;

  lines.push("## Answer summary");
  lines.push("");
  lines.push("| Item | Answer | Item | Answer | Item | Answer | Item | Answer | Item | Answer |");
  lines.push("|---|---|---|---|---|---|---|---|---|---|");
  for (let row = 0; row < Math.ceil(exam.items.length / 5); row += 1) {
    const cells = [];
    for (let column = 0; column < 5; column += 1) {
      const index = row * 5 + column;
      cells.push(index < exam.items.length ? `${index + 1} | **${LETTERS[exam.items[index].correctChoice]}**` : " | ");
    }
    lines.push(`| ${cells.join(" | ")} |`);
  }
  lines.push("");
  lines.push("## Items, with the material reference for each answer");
  lines.push("");
  for (const [index, item] of exam.items.entries()) {
    lines.push(`### ${index + 1}. ${item.prompt}`);
    lines.push("");
    for (const [choiceIndex, choice] of item.choices.entries()) {
      const marker = choiceIndex === item.correctChoice ? "**" : "";
      lines.push(`${marker}${LETTERS[choiceIndex]}. ${choice}${marker}`);
    }
    lines.push("");
    lines.push(`> **Correct answer: ${LETTERS[item.correctChoice]}.** ${item.rationale}`);
    lines.push(">");
    lines.push(`> **Found in the course material at:** ${reference(item.source)}`);
    for (const cross of item.crossReferences ?? []) {
      lines.push(`> **Also drawn from:** ${reference(cross)}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

const written = [];
const skipped = [];
for (const courseId of engine.CALIFORNIA_COURSE_IDS) {
  const course = engine.getCaliforniaCourse(courseId);
  const folder = course.assignments[0].contentPath.split("/")[3];
  const dir = path.join(root, "california", folder, "submission");
  const forms = engine.CALIFORNIA_FINAL_EXAM_FORMS.map((form) => engine.getCaliforniaFinalExam(courseId, form)).filter(Boolean);
  if (!forms.length) {
    skipped.push(`${courseId}: no examination authored`);
    continue;
  }
  fs.mkdirSync(dir, { recursive: true });
  const write = (name, content) => {
    fs.writeFileSync(path.join(dir, name), content);
    written.push(path.relative(root, path.join(dir, name)));
  };
  write("final-exam-student-instructions.md", studentInstructions(course));
  write("final-exam-proctor-instructions.md", proctorInstructions(course));
  for (const exam of forms) {
    const slug = exam.form.toLowerCase();
    write(`final-exam-form-${slug}-student.md`, studentVersion(course, exam));
    write(`final-exam-form-${slug}-answer-key.md`, answerKey(course, exam));
  }
  if (forms.length !== engine.CALIFORNIA_FINAL_EXAM_FORMS.length) {
    skipped.push(`${courseId}: only form(s) ${forms.map((exam) => exam.form).join(", ")} authored`);
  }
}

console.log(`Wrote ${written.length} file(s):`);
for (const file of written) console.log(`  ${file}`);
if (skipped.length) {
  console.log("");
  console.log("Not generated:");
  for (const note of skipped) console.log(`  ${note}`);
}
