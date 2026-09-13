#!/usr/bin/env node
/*
 * The reviewer walkthrough.
 *
 * The deliverable ledger asks whether the review accounts exist. That is not the question a
 * regulator will ask. A regulator will sign in and try to get from a log-in page to the SB 1495
 * role-play panel, and what matters is whether that journey works — every step of it, in both
 * accounts, in order.
 *
 * So this walks the journey instead of checking for files:
 *
 *   sign in → see three courses → open one → see fifteen assignments → open a lesson →
 *   see the assessments → see the SB 1495 practicum and which roles are outstanding →
 *   see what remains before the examination opens → see the examination's structure
 *
 * and then the two things that must be different between the accounts, and the two that must
 * be impossible for both.
 *
 * Each step is exercised rather than asserted about wherever it can be. The gating difference
 * between a student reviewer and a regulator reviewer IS the study path's `statusMap`, so the
 * walkthrough calls it with both modes and reads the answer. The examination structure comes
 * from the engine the portal serves from. What cannot be exercised without a live database —
 * the completion and certificate refusals — is read out of the migration that enforces it, and
 * the step says which kind of evidence it has rather than blurring the two.
 *
 * Usage:  node scripts/reviewer-walkthrough.mjs [--json]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ACADEMIC_CONTROLS, PROGRAMS, SB1495 } from "../config/california/regulatory-manifest.mjs";
import { getCaliforniaAssessment, getCaliforniaCourse, getCaliforniaFinalExam } from "../config/california-course-engine.mjs";
import { statusMap } from "../netlify/functions/student-course.mjs";
import { REVIEW_ACCOUNTS, WALKTHROUGH_STEPS } from "./provision-california-review-accounts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AS_JSON = process.argv.includes("--json");
const read = (relative) => (fs.existsSync(path.join(root, relative)) ? fs.readFileSync(path.join(root, relative), "utf8") : null);

const MIGRATION_012 = read("database/012_sb1495_participatory_component.sql") ?? "";
const MIGRATION_013 = read("database/013_review_accounts.sql") ?? "";
const STUDY_PATH = read("netlify/functions/student-course.mjs") ?? "";
const CLIENT = read("public/statecourse/student/course/student-course.js") ?? "";
const PAGE = read("public/statecourse/student/course/index.html") ?? "";
const PROVISION = read("scripts/provision-california-review-accounts.mjs") ?? "";

const results = [];
/* `exercised` means the walkthrough ran the code that serves the step and looked at what came
   back. `read` means it inspected the construct that enforces it. The distinction is printed,
   because a walkthrough that presented both as the same thing would be overstating half of it. */
const step = (id, kind, fn) => {
  try {
    const detail = fn();
    results.push({ id, kind, status: "pass", detail: detail ?? null });
  } catch (error) {
    results.push({ id, kind, status: "fail", detail: error.message });
  }
};
const must = (condition, message) => {
  if (!condition) throw new Error(message);
};

/* A student's assignment rows, as the database would hold them: none started. And a student who
   has finished the first three, which is what makes the gating visible. */
const freshRows = (course) => course.assignments.map((assignment) => ({ assignment_id: assignment.id, status: "not_started" }));
const partialRows = (course) =>
  course.assignments.map((assignment, index) => ({ assignment_id: assignment.id, status: index < 3 ? "completed" : "not_started" }));

/* ── the journey ───────────────────────────────────────────────────────────────────────── */

step("sign-in", "read", () => {
  /* Both accounts sign in at the student sign-in page, on purpose. Credentials to a side door
     would not be credentials to the thing the Department is reviewing. */
  must(/student\/sign-in\//.test(PROVISION), "the filing sheet does not send the reviewer to the student sign-in page");
  must(REVIEW_ACCOUNTS.length === 2, `${REVIEW_ACCOUNTS.length} review accounts are defined; RE 303 item 15 asks for two`);
  const roles = REVIEW_ACCOUNTS.map((account) => account.reviewRole);
  must(new Set(roles).size === 2, "the two accounts do not carry distinct review roles");
  must(!/password[^\n]{0,40}=\s*["'][A-Za-z0-9]/.test(PROVISION), "a password literal appears in the provisioning script");
  return REVIEW_ACCOUNTS.map((account) => `${account.reviewRole} → mode ${account.mode}`).join(", ");
});

step("course-list", "exercised", () => {
  for (const program of PROGRAMS) {
    const course = getCaliforniaCourse(program.catalogId);
    must(course, `${program.title} does not resolve to a course the portal can serve`);
    must(course.title === program.title, `${program.catalogId} serves the title "${course.title}"`);
  }
  return `${PROGRAMS.length} courses resolve`;
});

step("open-course", "exercised", () => {
  for (const program of PROGRAMS) {
    const course = getCaliforniaCourse(program.catalogId);
    must(
      course.assignments.length === ACADEMIC_CONTROLS.minimumLessonAssignments,
      `${program.title} serves ${course.assignments.length} assignments against the ${ACADEMIC_CONTROLS.minimumLessonAssignments} Regulation 3000 requires`,
    );
    const sequence = course.assignments.map((assignment) => assignment.sequence);
    must(sequence.every((value, index) => value === index + 1), `${program.title} does not present its assignments in sequence`);
  }
  return `${PROGRAMS.length} × ${ACADEMIC_CONTROLS.minimumLessonAssignments} assignments, in sequence`;
});

step("open-lesson", "exercised", () => {
  for (const program of PROGRAMS) {
    const course = getCaliforniaCourse(program.catalogId);
    for (const assignment of course.assignments) {
      const served = assignment.contentPath.replace(/^\/content\//, "");
      const source = `california/${program.courseId}/curriculum/${path.basename(served)}`;
      must(read(source), `${program.title} ${assignment.id} points at ${assignment.contentPath}, which has no source`);
    }
  }
  /* And the build actually copies them, or the path serves a 404 to a regulator. */
  const build = read("site/build.sh") ?? "";
  must(/dist\/content\/california/.test(build), "the build does not publish the California lesson text");
  return `${PROGRAMS.length * 15} lesson files, all published`;
});

step("assessments", "exercised", () => {
  for (const program of PROGRAMS) {
    for (const assignment of getCaliforniaCourse(program.catalogId).assignments) {
      for (const kind of ["applied", "engagement"]) {
        const assessment = getCaliforniaAssessment(program.catalogId, assignment.id, kind);
        must(assessment, `${program.title} ${assignment.id} serves no ${kind} assessment`);
        must(assessment.items.length > 0, `${program.title} ${assignment.id} ${kind} has no items`);
      }
    }
  }
  return "applied and engagement assessments serve for all 45 assignments";
});

step("sb1495", "exercised", () => {
  const course = getCaliforniaCourse(SB1495.courseId);
  const practicum = course.assignments.find((assignment) => assignment.id === SB1495.assignmentId);
  must(practicum, `the practice course has no ${SB1495.assignmentId}`);
  must(/practicum/i.test(practicum.title), `${SB1495.assignmentId} is titled "${practicum.title}"`);
  /* The panel, one box per role, and the page element it renders into. */
  must(/renderParticipatory/.test(CLIENT), "the page does not render the participatory panel");
  must(/id="participatoryRoles"/.test(PAGE), "the page has no participatory panel to render into");
  must(/participatory:participation \?/.test(STUDY_PATH), "the payload does not carry the participation state");
  for (const role of SB1495.roles) {
    must(new RegExp(`'${role.id}'`).test(MIGRATION_012), `the database does not know the ${role.id} role`);
  }
  return `${SB1495.roles.length} role panels, served from the submissions`;
});

step("completion-rules", "read", () => {
  /* What remains, named requirement by requirement. A reviewer who is told only "not yet
     eligible" has been told nothing they can check. */
  const named = [
    "lesson assignments",
    "California 2.5-week minimum period",
    "California two-course / five-week completion window",
    "Identity and proctor authorization",
    "SB 1495 participatory component - consumer role",
    "SB 1495 participatory component - real estate professional role",
    "Enrollment expired - re-enrollment required",
  ];
  for (const requirement of named) {
    must(MIGRATION_012.includes(requirement), `the remaining-requirements list does not name "${requirement}"`);
  }
  must(/remaining:Array\.isArray\(eligibility\?\.remaining_requirements\)/.test(STUDY_PATH), "the page does not surface the remaining requirements");
  return `${named.length} requirements named individually`;
});

step("final-exam-structure", "exercised", () => {
  for (const program of PROGRAMS) {
    for (const form of ["A", "B"]) {
      const exam = getCaliforniaFinalExam(program.catalogId, form);
      must(exam, `${program.title} serves no form ${form}`);
      must(exam.items.length === ACADEMIC_CONTROLS.finalExamMinimumQuestions, `${program.title} form ${form} serves ${exam.items.length} items`);
      must(exam.passingPercent === ACADEMIC_CONTROLS.finalExamPassingPercent, `${program.title} form ${form} passes at ${exam.passingPercent}%`);
    }
  }
  const course = getCaliforniaCourse(PROGRAMS[0].catalogId);
  must(course.finalExamProctored === true, "the served course does not say the examination is proctored");
  must(course.finalExamOpenBook === false, "the served course does not say the examination is closed book");
  must(course.maxFinalAttempts === ACADEMIC_CONTROLS.finalExamMaximumAttempts, "the served attempt limit is not the regulation's");
  return `2 forms × ${ACADEMIC_CONTROLS.finalExamMinimumQuestions} items, ${ACADEMIC_CONTROLS.finalExamPassingPercent}% to pass, proctored, closed book`;
});

/* ── where the two accounts must differ ────────────────────────────────────────────────── */

step("gating-applies", "exercised", () => {
  /* The student reviewer is a student. Assignment 05 is locked while 04 is unfinished, and a
     reviewer who was not shown that has not been shown the course a student takes. */
  const course = getCaliforniaCourse(FIRST_COURSE());
  const fresh = statusMap(course, freshRows(course), "student");
  must(fresh[0].accessible, "the student reviewer cannot open the first assignment");
  must(!fresh[1].accessible, "the student reviewer can open the second assignment without finishing the first");
  must(fresh[1].status === "locked", `the second assignment reads "${fresh[1].status}" rather than locked`);

  const partial = statusMap(course, partialRows(course), "student");
  must(partial[3].accessible, "finishing three assignments did not open the fourth");
  must(!partial[4].accessible, "finishing three assignments opened the fifth as well");
  const locked = partial.filter((assignment) => !assignment.accessible).length;
  return `1 of 15 open at the start; ${15 - locked} open after three completions`;
});

step("no-gating", "exercised", () => {
  const course = getCaliforniaCourse(FIRST_COURSE());
  const reviewer = statusMap(course, freshRows(course), "reviewer");
  must(reviewer.every((assignment) => assignment.accessible), "the regulator reviewer cannot reach every assignment");
  must(reviewer.every((assignment) => assignment.status === "review_available"), "the regulator reviewer sees student statuses");
  /* And it did so having completed nothing, which is the whole point. */
  must(reviewer.every((assignment) => assignment.activeSeconds === 0), "the reviewer view carries study time");
  return "15 of 15 reachable with nothing completed";
});

step("no-student-write", "read", () => {
  /* Reviewer mode is resolved before any handler that writes, the assignment rows are not
     created for it, and the heartbeat is told which mode it is in. */
  must(/if \(ctx\.mode !== "student" \|\| ctx\.trainingRuntime\) return;/.test(STUDY_PATH), "reviewer or separate training runtime mode still initialises California student assignment rows");
  const reviewerBranch = STUDY_PATH.indexOf('if (ctx.mode !== "student") {');
  const submission = STUDY_PATH.indexOf('if (eventType === "sb1495_role_submitted")');
  const finish = STUDY_PATH.indexOf("const kind=ANSWER_EVENTS.get(eventType);\n  if (!kind) fail");
  must(reviewerBranch > 0, "the reviewer branch is gone");
  must(reviewerBranch < submission, "a reviewer reaches the SB 1495 submission handler");
  must(finish < 0 || reviewerBranch < finish, "a reviewer reaches the scored-assessment handler");
  must(/no_student_credit:true/.test(STUDY_PATH), "reviewer activity is not marked as creating no student credit");
  must(/p_mode:ctx\.mode/.test(STUDY_PATH), "the heartbeat does not tell the database which mode it is in");
  /* And the regulator browses its own enrollments rather than a student's. */
  must(/p_review_role/.test(MIGRATION_013), "the regulator reviewer has no enrollments of its own");
  return "reviewer mode writes no assignment row, no submission, no assessment attempt and no study credit";
});

/* ── what neither account may do ───────────────────────────────────────────────────────── */

step("no-completion", "read", () => {
  must(/create trigger review_enrollment_completion_guard/.test(MIGRATION_013), "no trigger refuses a completion event for a review enrollment");
  must(/create trigger review_enrollment_certificate_guard/.test(MIGRATION_013), "no trigger refuses a certificate for a review enrollment");
  must(/completion_refused_for_review_enrollment/.test(MIGRATION_013), "the refusal has no reason a caller can read");
  /* The two defects this closed. 'qa_non_credit' is what every review enrollment carries, and
     it used to be an accepted completion status for issuing a certificate. */
  const issuance = MIGRATION_013.slice(MIGRATION_013.indexOf("function issue_california_completion_certificate"));
  must(/certificate_refused_for_review_enrollment/.test(issuance), "issuance does not refuse a review enrollment");
  must(!/completion_status not in \('complete','qa_non_credit'\)/.test(issuance), "issuance still accepts a qa_non_credit completion");
  must(/completion_status <> 'complete'/.test(issuance), "issuance no longer requires a real completion");
  must(/certificate_refused_no_dre_approval_number/.test(issuance), "issuance does not read the DRE approval number");
  return "refused four ways: two triggers, the review-role check, and the missing approval number";
});

function FIRST_COURSE() {
  return PROGRAMS[0].catalogId;
}

/* ── the report ────────────────────────────────────────────────────────────────────────── */

const declared = WALKTHROUGH_STEPS.map((entry) => entry.id);
const walked = results.map((entry) => entry.id);
const unwalked = declared.filter((id) => !walked.includes(id));
for (const id of unwalked) {
  results.push({ id, kind: "read", status: "fail", detail: "the filing sheet promises this step and the walkthrough does not check it" });
}

const failed = results.filter((entry) => entry.status === "fail");
const exercised = results.filter((entry) => entry.kind === "exercised" && entry.status === "pass").length;

if (AS_JSON) {
  console.log(JSON.stringify({ REVIEWER_WALKTHROUGH: failed.length === 0 ? "PASS" : "FAIL", steps: results, exercised }, null, 2));
} else {
  console.log(`\n  REVIEWER WALKTHROUGH — ${REVIEW_ACCOUNTS.length} accounts, ${results.length} steps\n`);
  const width = Math.max(...results.map((entry) => entry.id.length));
  for (const entry of results) {
    console.log(`  ${entry.status === "pass" ? "PASS" : "FAIL"}  ${entry.id.padEnd(width)}  [${entry.kind.padEnd(9)}]  ${entry.detail ?? ""}`);
  }
  console.log("");
  console.log(`  ${exercised} step(s) exercised against the code the portal serves; the rest read from the construct that enforces them.`);
  console.log(`  REVIEWER_WALKTHROUGH: ${failed.length === 0 ? "PASS" : `FAIL — ${failed.length} step(s)`}\n`);
}

process.exit(failed.length === 0 ? 0 : 1);
