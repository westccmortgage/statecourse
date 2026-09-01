#!/usr/bin/env node
/** Deterministically render the authored Florida curriculum and reviewer submission artifacts. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SECTION_PLANS, TOTALS, verifyCurriculumPlan } from "../config/florida/course-i-curriculum.mjs";
import { PERIODIC_ASSESSMENTS } from "../config/florida/periodic-assessment-bank.mjs";
import { BANK_STATUS, SECURE_FINAL_DRAFT_ITEMS } from "../config/florida/secure-final-bank-draft.mjs";
import { ANTI_RECRUITING_STATEMENT, CERTIFICATION_STATEMENT, COMPLETION_CERTIFICATE_STATEMENT } from "../config/florida/course-i-requirements.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const courseRoot = path.join(root, "florida/fl-sales-associate-course-i-63-v1");
const curriculumDir = path.join(courseRoot, "curriculum");
const assessmentDir = path.join(courseRoot, "assessments");
const submissionDir = path.join(courseRoot, "submission");
for (const dir of [curriculumDir, assessmentDir, submissionDir]) fs.mkdirSync(dir, { recursive: true });

const result = verifyCurriculumPlan();
if (!result.ok) throw new Error(result.failures.join("\n"));

const action = (objective) => {
  const text = objective.text.replace(/\.$/, "");
  return `Apply objective ${objective.n}: ${text}. Record the governing concept, material facts, conclusion, and the curriculum page used. For a calculation, show inputs, formula, result, and independent check.`;
};

const pageMap = [];
let page = 1;
for (const section of SECTION_PLANS) {
  const filename = `${String(section.number).padStart(2, "0")}-${section.slug}.md`;
  const sectionPage = page++;
  const objectiveRows = section.learningObjectives.map((o) => {
    const objectivePage = page++;
    pageMap.push({ objective: `${section.number}.${o.n}`, curriculumPage: objectivePage, syllabusPage: o.page, file: filename });
    return `### Objective ${section.number}.${o.n} — curriculum page ${objectivePage}\n\n${o.text}.\n\n**Required application.** ${action(o)}\n`;
  }).join("\n");
  const a = PERIODIC_ASSESSMENTS.filter((q) => q.section === section.number);
  const body = `# FREC Course I — Section ${section.number}: ${section.title}\n\n` +
    `**Canonical curriculum page:** ${sectionPage}  \n**Syllabus source page:** ${section.syllabusPage}  \n` +
    `**Designed instructional time:** ${section.plannedMinutes} minutes — StateCourse allocation, not a Florida per-section minimum.  \n` +
    `**Regulatory status:** curriculum draft; not approved; no Florida credit or enrolment is available.\n\n` +
    `${section.number === 1 ? `## Required opening statement\n\n> ${ANTI_RECRUITING_STATEMENT}\n\nThe learner must acknowledge that this statement was displayed and read before instructional work begins.\n\n` : ""}` +
    `## Learning objectives\n\n${section.learningObjectives.map((o) => `- **${section.number}.${o.n}** ${o.text} *(FREC syllabus p. ${o.page})*`).join("\n")}\n\n` +
    `## Required workflow\n\n| Component | Minutes | Completion evidence |\n|---|---:|---|\n` +
    `| Authored reading and worked examples | ${section.components.reading} | reading segments and engagement checks |\n` +
    `| Guided primary-source work | ${section.components.sourceWork} | source citation and finding submitted |\n` +
    `| Application lab | ${section.components.application} | scenario/calculation response |\n` +
    `| Periodic assessment and remediation | ${section.components.assessment} | first attempt, feedback, remediation if needed |\n` +
    `| **Total** | **${section.plannedMinutes}** | elapsed time alone never completes a component |\n\n` +
    `## Core lesson\n\n${section.lesson}\n\n` +
    `## Primary-source reading\n\n${section.authorities.map((x) => `- ${x}`).join("\n")}\n\n` +
    `## Objective-level application pages\n\n${objectiveRows}\n` +
    `## Periodic assessment\n\nComplete all ${a.length} formative items assigned to this section. Each item requires an application or worked response, not recognition alone. The module mastery threshold is StateCourse policy, not a Florida passing-score rule. Below-threshold work receives a new fact pattern; the first attempt remains in the record.\n\n` +
    `## Section completion attestation\n\nI certify that I personally completed the assigned reading, source work, applications and periodic assessment for this section. Completion of this section is not a license, course approval or authorization to practice.\n`;
  fs.writeFileSync(path.join(curriculumDir, filename), body);
}

fs.writeFileSync(path.join(courseRoot, "curriculum-page-map.json"), `${JSON.stringify({ generatedBy: "scripts/build-florida-course.mjs", totalPages: page - 1, pages: pageMap }, null, 2)}\n`);

const bank = `# Florida Course I — periodic assessment bank\n\n**Formative only. Not an end-of-course examination.** ${PERIODIC_ASSESSMENTS.length} items map one-to-one to the 180 incorporated learning objectives.\n\n` + PERIODIC_ASSESSMENTS.map((q) =>
  `## ${q.id} — objective ${q.objective}\n\n${q.prompt}\n\n**Rubric**\n${q.rubric.map((r) => `- ${r}`).join("\n")}\n`).join("\n");
fs.writeFileSync(path.join(assessmentDir, "periodic-assessment-bank.md"), bank);

const pageByObjective = new Map(pageMap.map((p) => [p.objective, p.curriculumPage]));
const secureDraft = `# Florida Course I — secure end-course item-development slice\n\n` +
  `**Confidential authoring artifact. Not a usable examination form.** ${BANK_STATUS.draftedItems} application-level items are drafted against the paginated curriculum map; at least ${BANK_STATUS.minimumRegulatoryFormItems} are required for one regulatory-minimum form and StateCourse presently plans ${BANK_STATUS.stateCoursePlannedFormItems}. Every item requires independent review before form assembly.\n\n` +
  SECURE_FINAL_DRAFT_ITEMS.map((q, i) => {
    const p = pageByObjective.get(q.objective);
    return `## ${i + 1}. ${q.id}\n\n${q.stem}\n\n${q.choices.map((c, j) => `${String.fromCharCode(65 + j)}. ${c}`).join("\n")}\n\n**Key:** ${String.fromCharCode(65 + q.correctIndex)}  \n**Rationale:** ${q.rationale}  \n**Curriculum support:** objective ${q.objective}, curriculum page ${p}  \n**Level/status:** ${q.level}; ${q.status}\n`;
  }).join("\n") + `\n## Completion blockers\n\n${BANK_STATUS.blockers.map((b) => `- ${b}`).join("\n")}\n`;
fs.writeFileSync(path.join(assessmentDir, "secure-final-bank-development-slice.md"), secureDraft);

const outline = `# FREC Course I — timed course outline\n\n` +
  `**Draft for reviewer preparation; not submitted or approved.** Instruction totals ${TOTALS.instructionMinutes} minutes (60 fifty-minute hours). The end-course examination is ${TOTALS.examinationMinutes} minutes, for ${TOTALS.courseMinutes} minutes total. Per-section allocations are provider design values that require the objective study described in the submission package.\n\n` +
  `| # | Syllabus section | Objectives | Reading | Source work | Application | Assessment | Total |\n|---:|---|---:|---:|---:|---:|---:|---:|\n` +
  SECTION_PLANS.map((s) => `| ${s.number} | ${s.title} | ${s.learningObjectives.length} | ${s.components.reading} | ${s.components.sourceWork} | ${s.components.application} | ${s.components.assessment} | **${s.plannedMinutes}** |`).join("\n") +
  `\n| | **Instruction total** | **180** | | | | | **3,000** |\n| | End-course examination | | | | | | **150** |\n| | **Course total** | | | | | | **3,150** |\n`;
fs.writeFileSync(path.join(submissionDir, "timed-course-outline.md"), outline);

const certificate = `# Course-completion certificate template — inactive\n\n` +
  `**Do not issue. No Florida school permit, course approval, school number or course number is held.**\n\n` +
  `| Required field | Value |\n|---|---|\n` +
  `| Name of School | StateCourse LLC |\n| School License Number | [blank until issued and verified] |\n` +
  `| Address of School | [physical street address pending DBPR confirmation] |\n| Course Title | Course I |\n` +
  `| Course Number | [blank until issued and verified] |\n| Start Date | [system value] |\n| Finish Date | [system value] |\n` +
  `| Exam Date | [system value] |\n| Student Name | [verified legal name] |\n| Student Address | [student record] |\n` +
  `| Authorized Signature for the School | [permitted authorized signer] |\n\n` +
  `> ${COMPLETION_CERTIFICATE_STATEMENT}\n\n` +
  `Completion certification required before the final: “${CERTIFICATION_STATEMENT}”\n`;
fs.writeFileSync(path.join(submissionDir, "completion-certificate-template.md"), certificate);

console.log(`built ${SECTION_PLANS.length} Florida curriculum sections, ${PERIODIC_ASSESSMENTS.length} periodic items, ${SECURE_FINAL_DRAFT_ITEMS.length} secure final-item drafts, ${TOTALS.instructionMinutes} instructional minutes`);
