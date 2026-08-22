#!/usr/bin/env node
/*
 * The two DRE review accounts.
 *
 * RE 303 checklist item 15 asks for "Student AND Regulator log-in and password for
 * courses/final exams offered online". Two log-ins, and the Department means two different
 * things by them — which is why this provisions two accounts and not one with a switch.
 *
 *   THE STUDENT REVIEWER is a student. No reviewer grant, no bypass, no shortcut. The
 *   sequencing gates apply, study time is recorded, and the SB 1495 practicum will not close
 *   until both role-play responses exist. Its whole value is that nothing is bypassed: a
 *   reviewer shown a frictionless walkthrough has not been shown the course a student takes.
 *
 *   THE REGULATOR REVIEWER reaches everything at once — every assignment, both examination
 *   forms, the answer keys, the completion rules — because coverage is what a regulator needs.
 *   Coverage is the opposite of the first account's value, which is why one account cannot
 *   honestly be both.
 *
 * Neither can complete a course or be issued a certificate. Both enrollments carry
 * `review_role`, and migration 013 puts a trigger on `course_completion_events` and
 * `course_completion_certificates` that refuses either for a review enrollment. The refusal is
 * in the database rather than here, because this script is one caller.
 *
 * CREDENTIALS NEVER TOUCH THIS REPOSITORY. The passwords are generated here, used here, and
 * written to a filing sheet at a path outside the working tree. The sheet is what Anatoliy
 * inserts into the envelope; nothing about it is committed, printed to a log, or echoed into a
 * gate report.
 *
 * Usage:
 *   node scripts/provision-california-review-accounts.mjs --plan
 *       What it would do, against no database. Safe anywhere, and what CI runs.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/provision-california-review-accounts.mjs --apply [--out <path>]
 *       Creates or refreshes both accounts and writes the filing sheet.
 *       Default --out is ~/statecourse-dre-filing/review-accounts.md
 */

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FIRST_FILING, PROGRAMS, SB1495 } from "../config/california/regulatory-manifest.mjs";
import { PROVIDER } from "../config/california/submission-facts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};

/*
 * The two accounts, and the one line each that says what it is for. The email addresses are on
 * the provider's own domain so that a reviewer who looks at them can tell they are the school's
 * accounts rather than a person's.
 */
export const REVIEW_ACCOUNTS = Object.freeze([
  Object.freeze({
    key: "student_reviewer",
    reviewRole: "student_reviewer",
    email: `dre-student-review@${PROVIDER.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}`,
    name: "DRE Student Review",
    purpose:
      "Sees the course exactly as an enrolled student sees it. Every sequencing gate applies, study time is recorded, and the SB 1495 practicum does not close until both role-play responses are submitted.",
    reviewerGrant: false,
    mode: "student",
  }),
  Object.freeze({
    key: "regulator_reviewer",
    reviewRole: "regulator_reviewer",
    email: `dre-regulator-review@${PROVIDER.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}`,
    name: "DRE Regulator Review",
    purpose:
      "Reaches the whole course at once: every lesson assignment, every assessment, both final examination forms and the instructor answer keys, without study-time or sequencing gating. Records nothing against any student.",
    reviewerGrant: true,
    mode: "reviewer",
  }),
]);

/*
 * What a reviewer must be able to reach with each account, in the order they would do it. The
 * walkthrough checks this list; the filing sheet prints it. One list, so the sheet cannot
 * promise a step the walkthrough does not check.
 */
export const WALKTHROUGH_STEPS = Object.freeze([
  Object.freeze({ id: "sign-in", label: "Sign in at /student/sign-in/", accounts: ["student_reviewer", "regulator_reviewer"] }),
  Object.freeze({ id: "course-list", label: "See all three California courses on My StateCourse", accounts: ["student_reviewer", "regulator_reviewer"] }),
  Object.freeze({ id: "open-course", label: "Open each course and see its 15 lesson assignments in sequence", accounts: ["student_reviewer", "regulator_reviewer"] }),
  Object.freeze({ id: "open-lesson", label: "Open a lesson and read the instructional text as it is served", accounts: ["student_reviewer", "regulator_reviewer"] }),
  Object.freeze({ id: "assessments", label: "See the applied exercise and the engagement check for the assignment", accounts: ["student_reviewer", "regulator_reviewer"] }),
  Object.freeze({ id: "sb1495", label: "See the SB 1495 practicum with one panel per role and which are outstanding", accounts: ["student_reviewer", "regulator_reviewer"] }),
  Object.freeze({ id: "completion-rules", label: "See what remains before the final examination opens, named requirement by requirement", accounts: ["student_reviewer"] }),
  Object.freeze({ id: "final-exam-structure", label: "See the final examination structure: 100 items, 60% to pass, two forms, proctored", accounts: ["student_reviewer", "regulator_reviewer"] }),
  Object.freeze({ id: "gating-applies", label: "Confirm the student account is gated — a later assignment is locked until the one before it is complete", accounts: ["student_reviewer"] }),
  Object.freeze({ id: "no-gating", label: "Confirm the regulator account reaches every assignment without completing any", accounts: ["regulator_reviewer"] }),
  Object.freeze({ id: "no-student-write", label: "Confirm reviewer activity writes no student record and creates no study credit", accounts: ["regulator_reviewer"] }),
  Object.freeze({ id: "no-completion", label: "Confirm neither account can produce a completion record or a certificate", accounts: ["student_reviewer", "regulator_reviewer"] }),
]);

/* A password a person will type off a printed sheet once, into a browser, while a regulator
   watches. Ambiguous glyphs are omitted for that reason and for no other. */
function password() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(24);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length])
    .join("")
    .replace(/(.{6})(?=.)/g, "$1-");
}

/* ── the plan, which is what runs without a database ───────────────────────────────────── */

function plan() {
  console.log(`\n  CALIFORNIA REVIEW ACCOUNTS — plan\n`);
  console.log(`  Provider: ${PROVIDER.legalName}`);
  console.log(`  Courses:  ${PROGRAMS.length} (${PROGRAMS.map((program) => program.title).join(", ")})`);
  console.log(`  First filing: ${FIRST_FILING.title}\n`);
  for (const account of REVIEW_ACCOUNTS) {
    console.log(`  ${account.name}  <${account.email}>`);
    console.log(`    review_role       ${account.reviewRole}`);
    console.log(`    resolves to mode  ${account.mode}`);
    console.log(`    reviewer grant    ${account.reviewerGrant ? "yes — course_review_access on all three courses" : "no — every student gate applies"}`);
    console.log(`    ${account.purpose}`);
    console.log(`    would create      ${PROGRAMS.length} enrollments, ${PROGRAMS.length * 15} assignment rows, ${PROGRAMS.length} access grants`);
    console.log("");
  }
  console.log("  Neither account can produce a completion record or a certificate. Migration 013");
  console.log("  refuses both in a trigger on course_completion_events and");
  console.log("  course_completion_certificates for any enrollment carrying review_role.\n");
  console.log("  Passwords are generated at --apply time and written only to the filing sheet,");
  console.log("  outside the working tree. Nothing about them is committed or logged.\n");
  console.log(`  To apply:  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \\\n               node scripts/provision-california-review-accounts.mjs --apply\n`);
}

/* ── applying it ───────────────────────────────────────────────────────────────────────── */

async function apply() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("\n  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set to apply.\n");
    process.exit(2);
  }
  const { registerStudent, setStudentPassword } = await import("../netlify/functions/_lib/student-auth.mjs").catch(() => ({}));

  const request = async (pathname, options = {}) => {
    const response = await fetch(`${url}/rest/v1/${pathname}`, {
      ...options,
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        ...(options.prefer ? { prefer: options.prefer } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`${pathname}: ${response.status} ${text.slice(0, 300)}`);
    return text ? JSON.parse(text) : null;
  };
  const rpc = (name, body) => request(`rpc/${name}`, { method: "POST", body });

  const issued = [];
  for (const account of REVIEW_ACCOUNTS) {
    const secret = password();
    /* The account is created through the same registration path a student uses, so that the
       credentials on the sheet are credentials to the real sign-in and not to a side door. */
    let studentId = null;
    const existing = await request(`students?email=eq.${encodeURIComponent(account.email)}&select=id&limit=1`);
    if (existing?.[0]) {
      studentId = existing[0].id;
      if (setStudentPassword) await setStudentPassword(studentId, secret);
      else await rpc("set_student_password", { p_student_id: studentId, p_password: secret });
    } else if (registerStudent) {
      studentId = (await registerStudent({ email: account.email, password: secret, name: account.name }))?.id ?? null;
    } else {
      studentId = (await rpc("register_student", { p_email: account.email, p_password: secret, p_name: account.name }))?.id ?? null;
    }
    if (!studentId) throw new Error(`${account.email}: the account could not be created`);

    const enrollments = [];
    for (const program of PROGRAMS) {
      const enrollmentId = await rpc("provision_california_review_enrollment", {
        p_student_id: studentId,
        p_course_id: program.catalogId,
        p_review_role: account.reviewRole,
      });
      enrollments.push({ course: program.title, courseId: program.catalogId, enrollmentId });
    }
    const summary = await rpc("california_review_account_summary", { p_student_id: studentId });
    issued.push({ account, secret, studentId, enrollments, summary });
    console.log(`  ${account.name}: ${enrollments.length} enrollments provisioned.`);
  }

  const out = path.resolve(flag("out", path.join(os.homedir(), "statecourse-dre-filing", "review-accounts.md")));
  if (out.startsWith(root + path.sep)) {
    console.error(`\n  Refusing to write credentials inside the repository (${out}).\n`);
    process.exit(2);
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, filingSheet(issued), { mode: 0o600 });
  console.log(`\n  Filing sheet written to ${out} (mode 600).`);
  console.log("  Print it, insert it in the envelope, and do not commit it anywhere.\n");

  /* A receipt, in the repository, carrying no secret. The addresses are on the school's own
     domain and go into the filing anyway; the enrollment ids are opaque and grant nothing
     without a password. What it records is that the accounts exist and when — which is the
     thing the deliverable ledger has to be able to check, and which no script that wrote only
     to a private path could ever prove. */
  const receipt = path.join(root, "california/submission/00_administrative/A8-review-accounts-provisioned.md");
  fs.writeFileSync(receipt, provisioningReceipt(issued));
  console.log(`  Receipt written to ${path.relative(root, receipt)} — no credentials in it.\n`);
}

function provisioningReceipt(issued) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `# A8 — DRE review accounts, provisioned

**Applicant:** ${PROVIDER.legalName}
**Provisioned:** ${stamp} by \`node scripts/provision-california-review-accounts.mjs --apply\`
**Status:** Submission draft. Not filed.

**No credential appears in this file, and none ever will.** The passwords are on the private
filing sheet, which is written outside this repository and inserted into the envelope by hand.
This sheet records only that the two accounts exist, which of them is which, and what each one
reaches — the facts a reviewer of this repository needs and a reader of the envelope does not.

${issued
  .map(
    (entry) => `## ${entry.account.name}

| | |
|---|---|
| Address | \`${entry.account.email}\` |
| Review role | \`${entry.account.reviewRole}\` |
| Resolves to | mode \`${entry.account.mode}\` |
| Reviewer grant | ${entry.account.reviewerGrant ? "course_review_access on all three courses" : "none — every student gate applies"} |
| Enrollments | ${entry.enrollments.length} |

${entry.account.purpose}

${entry.enrollments.map((enrollment) => `- ${enrollment.course} — enrollment \`${enrollment.enrollmentId}\``).join("\n")}
`,
  )
  .join("\n")}

## What neither account can do

Neither can produce a course completion record or a course completion certificate. Both
enrollments carry \`review_role\`, and migration 013 refuses a completion event or a certificate
for any such enrollment in a trigger. Separately, no certificate may issue for any enrollment at
all while the course carries no DRE approval number, and none does.

Verified end to end by \`node scripts/reviewer-walkthrough.mjs\`, which walks the sign-in to
role-play journey in both accounts and checks each prohibition against the construct enforcing it.
`;
}

function filingSheet(issued) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `# DRE review accounts — PRIVATE FILING INSERT

**${PROVIDER.legalName}** · generated ${stamp}

**This sheet is not part of the repository and must not be committed anywhere.** It exists to be
printed once, inserted in the envelope behind the login instructions, and then destroyed or kept
with the filing copy. If it is lost, run the provisioning script again: it issues new passwords
rather than recovering these.

Sign in at **${PROVIDER.website}/student/sign-in/**

${issued
  .map(
    (entry) => `## ${entry.account.name}

| | |
|---|---|
| **Email** | \`${entry.account.email}\` |
| **Password** | \`${entry.secret}\` |
| **Role** | ${entry.account.reviewRole} |

${entry.account.purpose}

${entry.enrollments.map((enrollment) => `- **${enrollment.course}** — \`/student-course.html?enrollment_id=${enrollment.enrollmentId}\``).join("\n")}
`,
  )
  .join("\n")}

## What the Department can do with these

${WALKTHROUGH_STEPS.map((step) => `${step.accounts.length === 2 ? "**Both accounts**" : `**${REVIEW_ACCOUNTS.find((account) => account.key === step.accounts[0]).name}**`} — ${step.label}`)
  .map((line) => `- ${line}`)
  .join("\n")}

## What neither account can do

Neither review account can produce a course completion record or a course completion
certificate. Both enrollments carry \`review_role\`, and a database trigger refuses a completion
event or a certificate for any such enrollment. Separately, no certificate may issue for any
enrollment while the course carries no DRE approval number — and none does, because none has been
assigned.

The SB 1495 practicum in **${SB1495.statement === "Compliant with SB 1495" ? "Real Estate Practice" : "the practice course"}** requires both role-play
responses before the assignment closes. The student review account is subject to that rule like
any student, which is the point of having a student review account at all.
`;
}

/* Importing this module must not run it. The reviewer walkthrough imports REVIEW_ACCOUNTS and
   WALKTHROUGH_STEPS from here so that the sheet and the checks cannot promise different things,
   and a plan printed in the middle of the walkthrough's own report would be noise. */
const INVOKED_DIRECTLY = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (INVOKED_DIRECTLY) {
  if (APPLY) await apply();
  else plan();
}
