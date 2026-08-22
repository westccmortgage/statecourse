#!/usr/bin/env node
/*
 * The SB 1495 traceability matrix.
 *
 * "Compliant with SB 1495" is a sentence anyone can type onto a General Information Page. This
 * generator produces the document that has to be true instead: every element the Department's
 * FAQ states, traced to the lesson section that teaches it, the page of the printed volume a
 * reviewer can turn to, the assessment and examination items that test it, and — for the
 * interactive participatory component — the table, the trigger and the code path that make it
 * impossible to finish the course having taken only one of the two roles.
 *
 * Nothing in the output is typed by hand. Every row is found by reading the lesson text, the
 * assessment banks, the examination banks, the migration and the study path. A row that cannot
 * be substantiated prints as NOT FOUND and the generator exits non-zero, because a matrix that
 * quietly omitted an element it could not find would be worse than no matrix: it would read as
 * a complete answer.
 *
 * Run:  node scripts/generate-sb1495-traceability.mjs
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SB1495, authority, program } from "../config/california/regulatory-manifest.mjs";
import { PROVIDER } from "../config/california/submission-facts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const PRACTICE = program(SB1495.courseId);
const CURRICULUM = `california/${SB1495.contentFolder}/curriculum`;
const PRINT_VOLUME = `california/print/${SB1495.contentFolder}-course-text.pdf`;
const OUTPUT = `california/submission/${SB1495.packageDir}/07-sb1495-traceability.md`;

const problems = [];

/* ── the lessons, section by section ───────────────────────────────────────────────────── */

const lessons = [];
for (let index = 1; index <= 15; index += 1) {
  const number = String(index).padStart(2, "0");
  const text = read(`${CURRICULUM}/lesson-${number}.md`);
  const sections = [...text.matchAll(/^###\s+(\d+\.\d+)\s+(.+)$/gm)].map((match) => ({
    id: match[1],
    title: match[2].trim(),
    at: match.index,
  }));
  lessons.push({ assignmentId: `assignment-${number}`, number, text, sections, lower: text.toLowerCase() });
}
const practicum = lessons.find((lesson) => lesson.assignmentId === SB1495.assignmentId);

/* Which section of which lesson a phrase first appears in. This is what makes the matrix a
   finding rather than an assertion: the row names the section the generator actually found the
   words in, not the section somebody expected them to be in. */
function locate(phrase) {
  const needle = phrase.toLowerCase();
  const hits = [];
  for (const lesson of lessons) {
    let from = 0;
    while (true) {
      const at = lesson.lower.indexOf(needle, from);
      if (at < 0) break;
      const section = [...lesson.sections].reverse().find((entry) => entry.at < at);
      const key = `${lesson.assignmentId}:${section?.id ?? "—"}`;
      if (!hits.some((hit) => hit.key === key)) {
        hits.push({ key, assignmentId: lesson.assignmentId, section: section?.id ?? null, title: section?.title ?? null });
      }
      from = at + needle.length;
    }
  }
  return hits;
}

/* ── the printed volume, so a reviewer can turn to a page ──────────────────────────────── */

const pageIndex = (() => {
  const full = path.join(root, PRINT_VOLUME);
  if (!fs.existsSync(full)) {
    problems.push(`the printed volume ${PRINT_VOLUME} does not exist, so no page number can be given`);
    return null;
  }
  try {
    const raw = execFileSync(
      "python3",
      [
        "-c",
        [
          "import json,sys",
          "from pypdf import PdfReader",
          "r=PdfReader(sys.argv[1])",
          "out=[]",
          "for n,p in enumerate(r.pages,1):",
          "    out.append(p.extract_text() or '')",
          "print(json.dumps(out))",
        ].join("\n"),
        full,
      ],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
    return JSON.parse(raw);
  } catch (error) {
    problems.push(`the printed volume could not be read for page numbers: ${error.message.split("\n")[0]}`);
    return null;
  }
})();

/* A section heading is printed as "N.M Title". The page is the first one carrying it. Where the
   volume cannot be read, the cell says so rather than carrying a number nobody checked. */
function pageOf(assignmentId, sectionId) {
  if (!pageIndex) return "volume not read";
  const lesson = lessons.find((entry) => entry.assignmentId === assignmentId);
  const section = lesson?.sections.find((entry) => entry.id === sectionId);
  if (!section) return "—";
  const needle = `${sectionId} ${section.title}`.toLowerCase().replaceAll(/\s+/g, " ");
  for (const [index, text] of pageIndex.entries()) {
    if (String(text).toLowerCase().replaceAll(/\s+/g, " ").includes(needle)) return `p. ${index + 1}`;
  }
  return "not located in the volume";
}

/* ── the assessments and the examinations ──────────────────────────────────────────────── */

const practiceBank = (await import(path.join(root, "config/california/practice-question-bank.mjs"))).default;
const finalBank = (await import(path.join(root, "config/california/practice-final-exam-bank.mjs"))).default;

const practicumAssessments = (() => {
  const lesson = practiceBank.assignments?.[SB1495.assignmentId];
  if (!lesson) {
    problems.push(`the question bank carries no assignment ${SB1495.assignmentId}`);
    return { applied: 0, engagement: 0, remediation: 0, subject: null };
  }
  return {
    subject: lesson.subject ?? null,
    applied: lesson.applied ? 1 : 0,
    engagement: Array.isArray(lesson.engagement) ? lesson.engagement.length : 0,
    remediation: Array.isArray(lesson.remediation) ? lesson.remediation.length : 0,
  };
})();

/* Examination items whose recorded source is the practicum assignment, by form and section. */
const examItems = Object.entries(finalBank.forms).flatMap(([form, items]) =>
  items
    .map((item, index) => ({ form, number: index + 1, section: String(item.source.section), assignment: item.source.assignment }))
    .filter((item) => item.assignment === SB1495.assignmentId),
);
const examFor = (sectionIds) => {
  const matches = examItems.filter((item) => sectionIds.includes(item.section));
  return matches.length === 0 ? null : matches.map((item) => `${item.form}-${item.number} (§${item.section})`).join(", ");
};

/* ── the elements ──────────────────────────────────────────────────────────────────────── */

function elementRow(element, group) {
  const found = element.find.flatMap((phrase) => locate(phrase));
  const inPracticum = found.filter((hit) => hit.assignmentId === SB1495.assignmentId);
  const usable = inPracticum.length > 0 ? inPracticum : found;
  if (usable.length === 0) {
    problems.push(`${group} element "${element.id}" — none of ${element.find.map((f) => `"${f}"`).join(", ")} appears anywhere in the course`);
    return null;
  }
  const sections = [...new Set(usable.map((hit) => hit.section).filter(Boolean))].sort();
  /* A phrase that appears in the lesson title or the learning objectives sits above the first
     numbered heading and belongs to no subsection. Taking that hit as the primary one would
     leave the page column empty for the element that is most thoroughly taught. */
  const primary = usable.find((hit) => hit.section) ?? usable[0];
  const exam = examFor(sections);
  if (!exam) problems.push(`${group} element "${element.id}" is taught at §${sections.join(", §")} and examined by no final examination item`);
  return {
    id: element.id,
    requirement: element.requirement,
    terms: element.find,
    assignment: primary.assignmentId,
    sections,
    page: pageOf(primary.assignmentId, primary.section),
    exam: exam ?? "**NOT EXAMINED**",
  };
}

const implicitBiasRows = SB1495.implicitBias.map((element) => elementRow(element, "implicit bias")).filter(Boolean);
const fairHousingRows = SB1495.fairHousing.map((element) => elementRow(element, "fair housing")).filter(Boolean);

/* ── the interactive participatory component, proved rather than described ─────────────── */

const migration = read("database/012_sb1495_participatory_component.sql");
const studyPath = read("netlify/functions/student-course.mjs");
const clientScript = read("public/statecourse/student/course/student-course.js");

const roleRows = SB1495.roles.map((role) => {
  const section = practicum.sections.find((entry) => entry.id.startsWith(`${role.topic}.`));
  const heading = [...practicum.text.matchAll(/^##\s+(\d+)\.\s+(.+)$/gm)].find((match) => match[1] === role.topic);
  if (!heading) problems.push(`the practicum has no section ${role.topic} for the ${role.label} role`);
  return {
    role,
    heading: heading ? heading[2].trim() : "**NOT FOUND**",
    section: heading ? `${role.topic}` : "—",
    firstSubsection: section?.id ?? "—",
    page: section ? pageOf(SB1495.assignmentId, section.id) : "—",
    storedAs: `sb1495_participatory_submissions.participant_role = '${role.id}'`,
  };
});

const enforcementRows = [
  {
    property: "a response is persisted for each role, with the text the student wrote",
    evidence: "`database/012_sb1495_participatory_component.sql` — table `sb1495_participatory_submissions`, column `response`",
    proved: /create table if not exists sb1495_participatory_submissions/.test(migration) && /response text not null check \(length\(btrim\(response\)\) >= 200\)/.test(migration),
  },
  {
    property: "a submission cannot be a single character",
    evidence: "check constraint `length(btrim(response)) >= 200`, and the same figure in the study path",
    proved: /length\(btrim\(response\)\) >= 200/.test(migration) && /SB1495_MINIMUM_RESPONSE = 200/.test(studyPath),
  },
  {
    property: "the practicum assignment cannot reach 'completed' with either role missing",
    evidence: "trigger `sb1495_assignment_completion_guard` on `lms_assignment_state`, before insert or update",
    proved: /create trigger sb1495_assignment_completion_guard/.test(migration) && /sb1495_consumer_role_not_submitted/.test(migration) && /sb1495_licensee_role_not_submitted/.test(migration),
  },
  {
    property: "the study path applies the same rule, so the student sees it rather than hitting a database error",
    evidence: "`netlify/functions/student-course.mjs` — `finishIfReady` reads `sb1495_participation` before completing the practicum",
    proved: /both_roles_submitted/.test(studyPath) && /finishIfReady/.test(studyPath),
  },
  {
    property: "final examination eligibility reports the interactive requirement from the submissions, not from the assignment count",
    evidence: "`refresh_california_eligibility` sets `interactive_requirements_complete` from `sb1495_participation`",
    proved: /v_interactive := \(v_participation->>'both_roles_submitted'\)::boolean/.test(migration) && /interactive_requirements_complete=excluded/.test(migration),
  },
  {
    property: "an incomplete component names which role is outstanding, not merely that something is",
    evidence: "`remaining_requirements` carries 'SB 1495 participatory component - consumer role' and '- real estate professional role'",
    proved: /SB 1495 participatory component - consumer role/.test(migration) && /SB 1495 participatory component - real estate professional role/.test(migration),
  },
  {
    property: "the components cannot be taken apart from the practice course (FAQ Q7)",
    evidence: "`record_sb1495_submission` raises `sb1495_not_applicable_to_this_course` for any enrollment whose course does not carry the requirement",
    proved: /sb1495_not_applicable_to_this_course/.test(migration),
  },
  {
    property: "the evidence of both roles travels with the completion record",
    evidence: "`course_completion_certificates.sb1495_participation` and `california_sb1495_completion_evidence`",
    proved: /course_completion_certificates\s*\n\s*add column if not exists sb1495_participation jsonb/.test(migration) && /california_sb1495_completion_evidence/.test(migration),
  },
  {
    property: "a reviewer browsing the practicum writes no student submission",
    evidence: "the study path routes every non-student mode away before the submission handler, and reviewer activity is recorded in `course_review_access`",
    proved: /if \(ctx\.mode !== "student"\)/.test(studyPath),
  },
  {
    property: "the student is shown two role boxes and which of them is outstanding",
    evidence: "`public/statecourse/student/course/student-course.js` — `renderParticipatory`",
    proved: /renderParticipatory/.test(clientScript) && /sb1495_role_submitted/.test(clientScript),
  },
];
for (const row of enforcementRows) {
  if (!row.proved) problems.push(`the participatory property "${row.property}" is not evidenced by the code it names`);
}

/* ── the document ──────────────────────────────────────────────────────────────────────── */

const faq = authority(SB1495.authorityId);
const mark = (value) => (value ? "**YES**" : "**NO**");

const document = `# SB 1495 traceability — ${PRACTICE.title}

**Applicant:** ${PROVIDER.legalName}
**Course:** ${PRACTICE.title} (${PRACTICE.hours} hours, ${PRACTICE.lessonAssignments} lesson assignments)
**Status:** Submission draft. Not filed. No DRE approval has been issued for this course.
**Generated:** \`node scripts/generate-sb1495-traceability.mjs\` — every row below is found by reading the course, not typed.

## What is being demonstrated

RE 306 item 23B asks whether the course contains the SB 1495 components. This sheet is the
evidence behind the answer. It exists because **"Compliant with SB 1495" is a sentence, and the
Department is entitled to the thing the sentence refers to.**

The requirement, in the Department's own words:

> ${faq.materialClaims.find((claim) => claim.id === "sb1495-implicit-bias").claim}
>
> ${faq.materialClaims.find((claim) => claim.id === "sb1495-fair-housing").claim}

*— ${faq.citation}, read ${faq.verifiedAsOf} from ${faq.url}*

## 1. The implicit bias component

| Element the FAQ requires | Taught at | Printed volume | Examined by |
|---|---|---|---|
${implicitBiasRows
  .map((row) => `| ${row.requirement} | Assignment ${row.assignment.replace("assignment-", "")} §${row.sections.join(", §")} | ${row.page} | ${row.exam} |`)
  .join("\n")}

## 2. The fair housing component — federal **and** state

| Element the FAQ requires | Taught at | Printed volume | Examined by |
|---|---|---|---|
${fairHousingRows
  .map((row) => `| ${row.requirement} | Assignment ${row.assignment.replace("assignment-", "")} §${row.sections.join(", §")} | ${row.page} | ${row.exam} |`)
  .join("\n")}

**The state component is not a formality.** The federal Fair Housing Act protects race, color,
religion, sex, familial status and national origin; Government Code § 12955 adds gender identity,
gender expression, sexual orientation, marital status, ancestry, **source of income**, **veteran or
military status**, genetic information and medical condition. A licensee who knows only the
federal list acts lawfully under federal law and unlawfully in California, which is why the course
teaches the two together and examines the difference.

## 3. The interactive participatory component

> "${faq.materialClaims.find((claim) => claim.id === "sb1495-fair-housing").claim.split("include an ")[1]}"

### 3.1 The two roles

| Role the FAQ names | Course section | First subsection | Printed volume | Recorded in the database as |
|---|---|---|---|---|
${roleRows
  .map((row) => `| the applicant shall role play as a **${row.role.label}** | §${row.section} — ${row.heading} | ${row.firstSubsection} | ${row.page} | \`${row.storedAs}\` |`)
  .join("\n")}

### 3.2 What the student does, in order

1. Reads the scenario in the lesson section for the role.
2. Writes a response **from inside that position**, addressing each question the section sets.
3. Submits it. The text is stored as written, with the date and time.
4. In the licensee role, reads the structured feedback and **submits a revision**, which is stored
   as a further revision rather than replacing the first — so the evidence that the feedback step
   happened is not destroyed by the step that follows it.
5. Cannot complete the assignment until both roles are recorded.

### 3.3 The properties that make it real, and what proves each

**A participatory component described in a syllabus and unenforced by the platform is a
participatory component a student can skip.** Each row below names the file and the construct
that makes the property true; the generator checks that the construct is actually there, and
fails if it is not.

| Property | Proved by | Verified |
|---|---|---|
${enforcementRows.map((row) => `| ${row.property} | ${row.evidence} | ${mark(row.proved)} |`).join("\n")}

### 3.4 What a reviewer can do to check it

**With the regulator account** (credentials supplied on the private insert, not in this document):

1. Open ${PRACTICE.title}, Assignment ${SB1495.assignmentId.replace("assignment-", "")}.
2. The two role panels appear beneath the lesson, one per role, each showing whether it has been
   submitted. In review mode they are marked as not recording against a student record.
3. Open the student account instead and attempt to complete the assignment with one role
   submitted. The assignment does not complete, and the final examination page lists
   **"SB 1495 participatory component — real estate professional role"** among the outstanding
   requirements by name.

## 4. Assessment within the assignment

| Instrument | Items |
|---|---|
| Applied exercise (100% required) | ${practicumAssessments.applied} |
| Engagement check (80% required) | ${practicumAssessments.engagement} |
| Remediation alternate set | ${practicumAssessments.remediation} |
| Final examination items sourced to this assignment | ${examItems.length} across both forms |

## 5. Completion evidence

SB 1495 requires an applicant to **show evidence** of having completed a compliant practice course.

- The completion record carries \`sb1495_participation\` — the roles taken and when — so the
  evidence of compliance travels with the evidence of completion rather than being reconstructed
  later from memory.
- The **General Information Page** states *${SB1495.statement}*.
- The **RE 311 course completion certificate** states *${SB1495.statement}*.
- \`california_sb1495_completion_evidence(enrollment_id)\` returns the dated evidence for any
  enrollment, which is what a duplicate certificate request is answered from.

## 6. What is asserted here, and what is not

**Asserted:** the course contains both components, the fair housing component includes an
interactive participatory element in both roles, and the platform will not record completion of
the practice course for a student who has taken only one role.

**Asserted:** the two components are delivered as part of this practice course and cannot be
taken separately from it, as FAQ Q7 requires.

**Not asserted:** that DRE has approved this course, or found it SB 1495 compliant. No approval of
any kind has been issued. The statement *${SB1495.statement}* describes the course's content
against the statute; it is not a claim of Departmental approval.
`;

fs.writeFileSync(path.join(root, OUTPUT), document);
console.log(`Wrote ${OUTPUT}`);
console.log(
  `  ${implicitBiasRows.length} implicit bias elements, ${fairHousingRows.length} fair housing elements, ` +
    `${roleRows.length} roles, ${enforcementRows.filter((row) => row.proved).length}/${enforcementRows.length} properties proved, ` +
    `${examItems.length} examination items.`,
);
if (problems.length > 0) {
  console.error("\n  SB 1495 traceability is incomplete:");
  for (const problem of problems) console.error(`    - ${problem}`);
  console.error("");
  process.exit(1);
}
