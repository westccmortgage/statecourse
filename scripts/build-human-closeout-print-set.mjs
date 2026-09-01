#!/usr/bin/env node
/*
 * The human closeout print set.
 *
 * Every software deliverable is finished. What is left is a stack of paper that a person has to
 * sign, send, or carry to a post office, and this assembles that stack into one directory so it
 * can be printed from one place rather than gathered from six.
 *
 * It contains:
 *
 *   RE 306 × 3   the Department's own application, filled, one per course
 *   RE 336 × 3   the Department's own instructor certification, filled, one per course
 *   Three equivalence certification letters, one per course, each naming its course
 *
 * WHY THE LETTERS ARE GENERATED RATHER THAN COPIED
 *
 * There was one certification letter draft, with [Course Title] in it three times. RE 303 asks
 * for "a certification from a college instructor in the field of study FOR EACH SPECIFIC COURSE,
 * confirming the course content is equivalent to course material used in a college or university
 * course" — and the README already says, correctly, that "one letter covering all three does not
 * satisfy 'for each specific course'". A template with a placeholder is one letter covering all
 * three until somebody fills it in three times by hand, which is the step that gets done twice.
 *
 * So each letter names its own course, its hours, its assignment count and its subject list, and
 * the practice course's letter names the SB 1495 components, because a reviewer of that course is
 * being asked about content the other two do not have.
 *
 * WHAT IS NOT IN HERE AND CANNOT BE
 *
 * A signature. This set is what goes TO the people who sign; the signed returns are what come
 * back. Nothing here signs, dates, or certifies anything, and every signature line is left blank
 * on purpose — the Course Provider Handbook says digital and rubber-stamp signatures are not
 * accepted, in terms.
 *
 * Run:  node scripts/build-human-closeout-print-set.mjs
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FIRST_FILING, PROGRAMS, SB1495 } from "../config/california/regulatory-manifest.mjs";
import { COURSE_DESIGN, FINAL_EXAM, INSTRUCTOR, PROVIDER } from "../config/california/submission-facts.mjs";
import { getCaliforniaCourse } from "../config/california-course-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generated = path.join(root, "california/dre-sources/generated");
const equivalence = path.join(root, "california/dre-sources/instructor-equivalence");
const outDir = path.join(root, "california/print/human-closeout");

const slug = (title) => title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const pageCount = (file) =>
  Number(
    execFileSync("python3", ["-c", "import sys;from pypdf import PdfReader;print(len(PdfReader(sys.argv[1]).pages))", file], {
      encoding: "utf8",
    }).trim(),
  );

/* ── the three certification letters ───────────────────────────────────────────────────── */

/*
 * RE 303's four elements, quoted from the packet: who certifies, one per course, equivalence to
 * college material, on letterhead and signed. Every letter states them at the top so the person
 * being asked can see what they are being asked for before they read what they are being asked
 * to say.
 */
function certificationLetter(program) {
  const course = getCaliforniaCourse(program.catalogId);
  const dossier = `dossier-${program.catalogId}.md`;
  const isPractice = program.sb1495;

  return `# Curriculum equivalence certification — ${program.title}

**One of three.** RE 303 requires a separate certification for each specific course, naming that
course. This letter is for **${program.title}** and covers no other.

**Course under review:** ${program.title} — ${program.hours} hours, ${program.lessonAssignments} lesson assignments
**Applicant:** ${PROVIDER.legalName}
**Review packet:** \`${dossier}\` (in this directory)
**Status:** Submission draft. Not filed. No DRE approval has been issued for this course.

---

## What the Department asks of the reviewer

RE 303, under COURSE CONTENT:

> "If you write your own course content, it will be necessary to obtain a certification from a
> **college instructor in the field of study** for **each specific course**, confirming the course
> content is **equivalent to course material used in a college or university course**. This
> certification must be **on official school letterhead** and **signed by the instructor**."

| Element | What it requires here |
|---|---|
| **Who** | A college instructor in the field of study — real estate, or the discipline in which ${program.title.toLowerCase()} is taught |
| **Scope** | This course and this course only |
| **Substance** | Equivalence to the material used in a college or university course the reviewer teaches |
| **Form** | The institution's own letterhead, signed by the instructor |

## Before this letter is sent

**Send it only after the instructor has read the material and said they are willing to certify.**
Sending it earlier presumes the conclusion, and the conclusion is the only thing of value here.

**The draft below is a structure, not a script.** The certification is worth something because it
is the reviewer's professional judgment. A letter that reads as though the applicant wrote it and
someone else signed it is worth less — to the Department and to anyone reading it later — than a
shorter letter in the reviewer's own words. Invite them to change anything, including narrowing
what they attest to.

**A qualified certification is stronger than an unqualified one that overstates.** A letter saying
the curriculum is equivalent in coverage and objectives while recommending two areas be expanded is
a credible document, and it tells the Department what an honest reviewer would tell them.

## What this course covers, for the reviewer's comparison

${course.subjects.map((subject, index) => `${index + 1}. ${subject}`).join("\n")}

**Assessment.** Each of the ${program.lessonAssignments} assignments carries a required applied
exercise scored at 100 per cent and a scored engagement check at 80 per cent with a remediation
path. The final examination is ${FINAL_EXAM.questions} multiple-choice questions, ${FINAL_EXAM.passingPercent} per cent to pass,
${FINAL_EXAM.minutes} minutes, closed book, proctored, on two independent forms with one retake permitted on the
second form.
${
  isPractice
    ? `
**This course additionally carries the SB 1495 components**, which the other two do not, and a
reviewer of this course is asked about them specifically: a component on implicit bias covering
implicit, explicit and systemic bias, their historical and social impacts, and actionable steps a
student can take; and a component on federal and state fair housing law that includes an
interactive participatory element in which the student role plays as both a consumer and a real
estate professional. Assignment 14 is that practicum, and \`07-sb1495-traceability.md\` in the
submission packet traces each element to the section that teaches it.
`
    : ""
}
---

## Draft

*[Institution letterhead]*

[Date]

California Department of Real Estate
Attn: Education Section
651 Bannon Street, STE 504
Sacramento, CA 95811

**Re: Certification of curriculum equivalence — ${program.title}, submitted by ${PROVIDER.legalName}**

To the Department:

I am [Name], [title] at [Institution], where I teach [course name(s)] in the [department or
program]. I have taught this subject for [duration]. [Optional: relevant licensure, designations,
or industry experience.]

At the request of ${PROVIDER.legalName}, I have reviewed the curriculum for its proposed statutory
pre-license course, **${program.title}**, consisting of ${program.lessonAssignments} lesson
assignments totalling ${program.hours} hours of instruction. My review covered the course outline,
the learning objectives for each lesson assignment, the instructional content, the time allocation,
and the assessment design.

I reviewed the material against **[name the college course you teach and its catalog number]**,
which I teach at [Institution].

Based on that review, it is my professional opinion that the course content is **equivalent to the
course material used in [the college course named above]** in the following respects:

- **Coverage.** [The subject areas correspond to those covered in the college course / and note
  any differences.]
- **Depth of treatment.** [Comment on whether the treatment is comparable to college level.]
- **Learning objectives.** [Comment on whether they are appropriate and addressed by the content.]
- **Assessment.** [Comment on whether the assessment is appropriate to the objectives.]
${isPractice ? "- **SB 1495 components.** [Comment on the implicit bias and fair housing content and the participatory practicum, if you are able to.]\n" : ""}
[**If any qualification applies, state it here.** For example: areas you consider adequate but
thinner than the college course; topics you recommend be expanded; or limits on the scope of what
you reviewed.]

I make this certification based on my own review of the material provided to me. I am not the
instructor of record for this course, I have no role in its administration, and this certification
addresses the curriculum content only — not the provider's regulatory compliance, its business
operations, or the legal accuracy of any particular statement in the material.

Sincerely,

_____________________________
[Name]
[Title], [Department]
[Institution]
[Phone] · [Email]

---

## Notes for the applicant — not part of the letter, do not send

**Do not edit the reviewer's substantive conclusions.** If they qualify the certification, the
qualification goes to the Department as written. Softening a reviewer's qualification would
misrepresent their opinion in a submission certified under penalty of perjury.

**Ask for the letter in original signed form** on letterhead, and ask whether the institution will
also provide a scanned copy.

**Keep the reviewer's comments**, including anything that does not go in the letter. They are the
input to the curriculum work, and being able to show the Department that reviewer comments were
acted on is worth having.

**Check the Department's mailing address** against the current RE 306 before this is sent. The
address above is taken from RE 306 (Rev. 1/26), and addresses change.

**When it comes back signed**, save it as
\`california/dre-sources/instructor-equivalence/${slug(program.title)}-signed-certification.pdf\`.
That is the path the deliverable ledger checks, and until the file is there this course's filing
stays blocked.
`;
}

/* ── assembling the set ────────────────────────────────────────────────────────────────── */

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const items = [];
const missing = [];

for (const program of PROGRAMS) {
  const name = slug(program.title);

  for (const [form, label, pen] of [
    /*
     * RE 306 takes THREE signatures, not two. Item 11 on page 1 has its own signature field, and
     * the Course Provider Handbook says of it: "Enter the Primary and Secondary contact
     * information for those who are responsible for the sponsor/school. Contact(s) original
     * signature is required." An earlier version of this index named only the two on page 3 and
     * would have sent an application out one signature short.
     */
    [
      "RE306",
      "RE 306 course approval application",
      "THREE signatures. Page 1 item 11, the primary contact's own line. Then page 3, both blocks — primary contact AND owner/authorized school official — each signed and dated.",
    ],
    [
      "RE336",
      "RE 336 instructor certification",
      "Two signatures. As primary contact: sign, date, and write the city and state you are actually signing in. As instructor: sign, date, answer the licence question at the very bottom and write the licence number.",
    ],
  ]) {
    const source = path.join(generated, `${form}-${name}.pdf`);
    if (!fs.existsSync(source)) {
      missing.push(`${form}-${name}.pdf has not been generated — run scripts/fill-${form.toLowerCase()}.mjs`);
      continue;
    }
    const target = path.join(outDir, `${program.packageDir}--${form}.pdf`);
    fs.copyFileSync(source, target);
    items.push({ program, kind: form, label, file: path.basename(target), pages: pageCount(target), pen });
  }

  const letter = path.join(outDir, `${program.packageDir}--equivalence-certification-request.md`);
  fs.writeFileSync(letter, certificationLetter(program));
  items.push({
    program,
    kind: "EQUIVALENCE",
    label: "Curriculum equivalence certification request",
    file: path.basename(letter),
    pages: null,
    pen: "Goes to a college instructor in the field of study. They sign it, on their institution's letterhead.",
  });

  /* The review packet the letter refers to. Copied rather than linked, because the person
     handing this over should not have to find a second directory. */
  const dossier = path.join(equivalence, `dossier-${program.catalogId}.md`);
  if (fs.existsSync(dossier)) fs.copyFileSync(dossier, path.join(outDir, `dossier-${program.catalogId}.md`));
  else missing.push(`dossier-${program.catalogId}.md is missing from the equivalence directory`);
}

/* ── the index ─────────────────────────────────────────────────────────────────────────── */

const byProgram = PROGRAMS.map((program) => ({
  program,
  items: items.filter((item) => item.program.catalogId === program.catalogId),
}));

const index = `# Human closeout print set

**${PROVIDER.legalName}** · generated by \`node scripts/build-human-closeout-print-set.mjs\`
**Status:** Submission draft. Nothing here is filed, and no DRE approval has been issued.

Every software deliverable in this project is finished. What follows is the paper — the forms that
need a pen and the letters that need somebody else's letterhead. **Nothing in this directory is
signed, dated, or certified**, and every signature field on every form is deliberately empty: the
Course Provider Handbook states that digital and rubber-stamp signatures are not accepted.

**Count the signatures before you start.** For the first filing alone that is **five**: three on
RE 306 — page 1 item 11, and both blocks on page 3 — and two on RE 336. An earlier version of this
sheet named only the two on page 3 of RE 306 and would have sent the application out one signature
short.

**File ${FIRST_FILING.title} first.** DRE advises a first-time applicant to submit one course rather
than three, so that a deficiency is found once instead of repeated across every course filed at
once. The other two sets are here so the work can be done in one sitting, not so they can be mailed
together.

## What needs a pen, and whose

| Item | Course | Pages | What the person does |
|---|---|---|---|
${byProgram
  .flatMap(({ program, items: rows }) =>
    rows.map((item) => `| \`${item.file}\` | ${program.title} | ${item.pages ?? "—"} | ${item.pen} |`),
  )
  .join("\n")}

## In order

### 1. RE 306 — three signatures, not two

**Page 1, item 11.** The primary contact's row carries its own signature field. The Course Provider
Handbook, on item 11: *"Enter the Primary and Secondary contact information for those who are
responsible for the sponsor/school. **Contact(s) original signature is required.**"* The two
secondary rows stay blank — there is one contact, and a second line would read as a second person.

**Page 3, both blocks.** The primary contact block and the owner/authorized school official block
are two separate certifications: one names who the Department corresponds with, the other is the
person certifying the application on behalf of the applicant. Both are filled with the printed name
and title and **both must be signed and dated**. The Handbook is explicit that all sections of page
3 are completed *"even if the Primary Contact and the Owner/Authorized School Official are the same
individual"*.

The **title is \`${INSTRUCTOR.contactTitle}\` in both**, and it is the same title RE 336 carries.
Two forms in one packet giving the same person two titles is a deficiency of its own.

**Item 1A, the sponsor number, is blank and stays blank.** The form prints a fixed \`S\`; the digits
after it are the Department's to assign on approval. Do not write in that field.

### 2. RE 336 — and the three things on it that are not the applicant's to fill

Sign both blocks and date both.

**Write the city and state where you are actually signing.** The declaration reads *"I, ___, declare
under penalty of perjury that the foregoing is true and correct. Signed in the City of ___, State of
___, this ___ day of ___, 20___."* The place and the date are one clause about one act. An earlier
version of this form arrived with \`Redondo Beach\` and \`California\` already printed and the date
blank — half a fact about an event that had not happened, and false on its face if the form were
signed anywhere else, under penalty of perjury. They are blank now.

**Answer the licence question at the very bottom yourself, as the instructor.** The form addresses
it to the instructor in its own words, and the Handbook says the primary contact completes
everything on RE 336 *"except for the instructor's signature and the real estate license status
question on the very bottom of the form"*. Tick **YES** and write **\`${INSTRUCTOR.dreBrokerLicense}\`**.
Holding both roles does not transfer one role's answer to the other: the question is put to the
instructor, and the instructor answers it.

**The four-digit sponsor ID stays empty** for the same reason as item 1A.

The primary contact name reads **\`${INSTRUCTOR.nameLastFirst}\`** on RE 336 and
**\`${INSTRUCTOR.name}\`** on RE 306. That is not an inconsistency: RE 336 prints
*(LAST, FIRST, MIDDLE)* against the field and RE 306 prints only *PRINTED NAME*. Each form is
answered the way that form asks.

### 3. The three equivalence certifications

**This is the longest-lead-time item in the whole submission and nothing substitutes for it.**

Each request goes to a **college instructor in the field of study**, with the dossier for that
course. One certification per course, each naming its course, each on the reviewer's own
institutional letterhead, each signed by them. One letter covering all three does not satisfy
"for each specific course".

Send the letter **only after** the instructor has read the material and said they are willing to
certify. And when a reviewer qualifies their certification, **the qualification goes to the
Department as written** — softening it would misrepresent their opinion in an application certified
under penalty of perjury.

When each comes back, save it as
\`california/dre-sources/instructor-equivalence/<course-slug>-signed-certification.pdf\`. That is the
path the deliverable ledger checks; until the file exists, that course's filing stays blocked.

## What is still outstanding after all of this is signed

Run \`node scripts/closeout-queue.mjs\` for the live answer. At the time this set was generated:

- **§7B** — the two review accounts provisioned against the live database, and signed into by hand.
- **§8** — these three certifications, returned signed.
- **§11** — these signatures.

## Contents

${byProgram
  .map(
    ({ program, items: rows }) =>
      `**${program.title}**\n${rows.map((item) => `- \`${item.file}\` — ${item.label}`).join("\n")}\n- \`dossier-${program.catalogId}.md\` — the review packet the certification request refers to`,
  )
  .join("\n\n")}
`;

fs.writeFileSync(path.join(outDir, "INDEX.md"), index);

console.log(`\n  HUMAN CLOSEOUT PRINT SET → ${path.relative(root, outDir)}\n`);
for (const { program, items: rows } of byProgram) {
  console.log(`  ${program.title}`);
  for (const item of rows) console.log(`      ${item.file.padEnd(58)} ${item.pages ? `${item.pages} pages` : "letter"}`);
}
const pages = items.reduce((total, item) => total + (item.pages ?? 0), 0);
console.log(`\n  ${items.length} items, ${pages} PDF pages, plus 3 dossiers and INDEX.md.`);
console.log("  Nothing here is signed. Every signature field is empty on purpose.\n");

if (missing.length > 0) {
  console.error("  The set is incomplete:");
  for (const problem of missing) console.error(`    - ${problem}`);
  console.error("");
  process.exit(1);
}
