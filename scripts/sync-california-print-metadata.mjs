#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { FIRST_FILING, PROGRAMS } from "../config/california/regulatory-manifest.mjs";
import { DRE, FEES, PRICING, PROVIDER } from "../config/california/submission-facts.mjs";
import { californiaDocumentEnvironment, pdfPageCount } from "./lib/california-document-runtime.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtime = californiaDocumentEnvironment();
const volumes = PROGRAMS.map((program) => ({ ...program, pages: pdfPageCount(path.join(root, `california/print/${program.courseId}-course-text.pdf`), runtime) }));
const first = volumes.find((entry) => entry.courseId === FIRST_FILING.courseId);
const total = volumes.reduce((sum, entry) => sum + entry.pages, 0);
const digest = (file) => createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex");
const currentBuild = {
  schemaVersion: 1,
  status: "newly-paginated-review-copy; not a course approval or professor certification",
  courses: volumes.map((entry) => {
    const pdf = `california/print/${entry.courseId}-course-text.pdf`;
    const html = `california/print/${entry.courseId}-course-text.html`;
    return { courseId: entry.courseId, pages: entry.pages, pdf, pdfSha256: digest(pdf), html, htmlSha256: digest(html) };
  }),
  archivalPrinciples: {
    file: "california/print/final/Real_Estate_Principles_45_Hour_Final_458pp.pdf",
    sha256: "f9968a7d2fad6bec8e4d233541912bcbca24c7cdcabddaa6997f7bbab8eab4ef",
    pages: 458,
    disposition: "Preserved separately. Do not replace or represent this new build as the already-reviewed archive.",
  },
};
const archivalFile = path.join(root, currentBuild.archivalPrinciples.file);
if (fs.existsSync(archivalFile) && digest(currentBuild.archivalPrinciples.file) !== currentBuild.archivalPrinciples.sha256) {
  throw new Error("The separately frozen Principles archival PDF has changed. Reconcile its identity before generating a current packet record.");
}
fs.writeFileSync(path.join(root, "california/print/current-build.json"), JSON.stringify(currentBuild, null, 2) + "\n");
fs.writeFileSync(path.join(root, "california/print/CURRENT_REVIEW_COPY.md"), `# Current California review copies\n\nThese are newly paginated course texts, not a replacement for the separately identified 458-page archival Principles PDF under \`final/\`. No professor certification, DRE approval or filing is claimed. Before filing, the reviewing instructor must confirm the exact instructional version used for the course-specific certification.\n\nThe browser-free renderer reads the current full HTML, preserves the complete curriculum and formative materials, and verifies each text block against the resulting PDF. PDF text pagination differs from Chromium pagination; page count is not a substitute for instructional equivalence review.\n\n| Course | Pages | PDF SHA-256 |\n|---|---:|---|\n${currentBuild.courses.map((entry) => `| ${entry.courseId} | ${entry.pages} | \`${entry.pdfSha256}\` |`).join("\n")}\n\nThe machine-readable file identities are in \`current-build.json\`. Dossiers, RE313 page fields, SB1495 traceability and mail instructions must be regenerated with these PDFs. Run \`node scripts/test-california-documents.mjs --prepare\` to rebuild and synchronize; use the same command without \`--prepare\` for non-mutating checks. Python requires pypdf/reportlab; DejaVu fonts are required by the browser-free renderer. The archived file is never rewritten by this workflow.\n`);
for (const program of volumes) {
  const file = path.join(root, `california/submission/${program.packageDir}/06-re313-general-information-page.md`);
  const source = fs.readFileSync(file, "utf8");
  if (!/^\| — Pages \| .+ \|$/m.test(source)) throw new Error(`${file}: RE313 Pages row missing`);
  fs.writeFileSync(file, source.replace(/^\| — Pages \| .+ \|$/m, `| — Pages | **${program.pages}** |`));
  const dossier = `dossier-${program.courseId.replace(/-v1$/, "")}.md`;
  const dossierSource = path.join(root, "california/dre-sources/instructor-equivalence", dossier);
  if (fs.existsSync(dossierSource)) {
    const closeout = path.join(root, "california/print/human-closeout");
    fs.mkdirSync(closeout, { recursive: true });
    fs.copyFileSync(dossierSource, path.join(closeout, dossier));
  }
}

const money = (value) => `$${Number(value).toFixed(2)}`;
const instructions = `# Print and mail instructions — for Anatoliy

**${PROVIDER.legalName}. Internal instructions; do not include this sheet in the application.**

## First filing

File **${FIRST_FILING.title} first**, following the first-filing decision in the California regulatory manifest and the recommendation in [RE303, General Information, page 1](https://www.dre.ca.gov/files/pdf/forms/re303.pdf). Prepare the other two courses for later filings. The initial course text is **${first.pages} pages**; sending that text to DRE and keeping a complete printed copy would require **${first.pages * 2} text pages**, plus the actual forms and supporting documents. A digital retained copy avoids the second text print run; retain copies of everything signed and sent.

The current course text PDFs were measured before this document was generated. Their page counts are **${volumes.map((entry) => entry.pages).join(" / ")}**, totaling **${total} pages** for one copy of all three courses. These figures do not include application forms or examination documents. Do not estimate a whole-packet total from the text count.

## What must be ready before mailing the first application

1. Obtain the college instructor's equivalence certification **for ${FIRST_FILING.title}**, on the instructor's institution's letterhead and signed by that instructor. It must identify and review the exact instructional material being submitted. The other courses each need their own certification for their later filings.
2. Include the supporting instructor qualifications and entity documents called for by the administrative package and the current DRE forms.
3. Verify the student and regulator review credentials by signing in and opening this course and its examination review. Include working access instructions. Credentials written on a sheet but never tested do not satisfy this step.
4. Review the filled official RE306 and RE336, complete the signature and execution fields described below, and include the current RE313 General Information Page and its refund policy.

The refund/cancellation policy is already adopted as **${PRICING.refundPolicy.version}** and included in RE313. It is not an undecided or empty field. Keep the filed disclosure consistent with that adopted policy.

The applicant uses the legal name **${PROVIDER.legalName}**. The administrative FBNS determination records no fictitious name. Use the actual entity documents for this applicant.

## Print the first course package

| Item | Print and include |
|---|---|
| Official filled RE306 | All three pages, with relevant continuation sheets |
| Official filled RE336 | The complete form and instructor supporting documentation |
| General Information Page | Current RE313/filled field sheet, including the adopted refund policy |
| Course instructional text | The ${first.pages}-page PDF below, including cover, publication page, contents, all assignments and formative materials |
| Timed course outline | Current outline for ${FIRST_FILING.title} |
| Final examination material | Student instructions, proctor instructions, Form A and Form B student versions, and the corresponding instructor versions/answer keys |
| Online review access | Tested student and regulator credentials with access instructions |
| Completion certificate | Current RE311 specimen and field map |
| Equivalence certification | The signed, course-specific college instructor letter |
| Administrative documents | The current checklist, applicant's entity records, instructor evidence and other applicable supporting documents |
| Payment | ${money(FEES.perCourse)} for this one course, according to the current fee reference |

Print signature forms single-sided. Bind the instructional text separately, double-sided if desired. Keep the protected exam and answer key separate from the student instructional volume.

## Measured volumes for all three prepared courses

| Course | File | Pages |
|---|---|---:|
${volumes.map((entry) => `| ${entry.title} | \`${entry.courseId}-course-text.pdf\` | **${entry.pages}** |`).join("\n")}

The generated files are in \`california/print/\`. Before sending a newly rendered version to a reviewer or DRE, reconcile it with the exact version the college instructor reviewed. An equal page count does not prove equal content or equal file bytes. The tracked archival Principles PDF under \`california/print/final/\` remains a separately identified artifact and must not be silently replaced.

## Five applicant signatures for the first course

| Form | Where | Count |
|---|---|---:|
| RE306 | Page 1, item 11: primary contact's signature line | 1 |
| RE306 | Page 3: primary contact certification and owner/authorized official certification | 2 |
| RE336 | Primary contact declaration and instructor certification | 2 |
| **Total on RE306 and RE336** | **Complete all five, even when one person holds the roles** | **5** |

Use the actual signing date wherever the form requests a date. On RE336, write the city and state where signing actually occurs. As the instructor, personally answer the real estate license-status question and supply the requested license information. The fields were deliberately left blank for that act. Follow the current forms' original-signature instructions; no signature is supplied by this document.

Payment instruments have their own authorization/signature requirements. The college instructor signs their own equivalence letter.

## Fields that stay blank until DRE assigns them

Leave the sponsor ID, statutory/pre-license school ID and course approval number blank. The fixed printed prefix on an official form stays as printed. Do not enter a guessed number or a value such as “pending.” No DRE approval has been issued.

## Payment and mailing

For the first filing, prepare **one ${money(FEES.perCourse)} payment**, payable to **${FEES.payableTo}**, and identify **${FIRST_FILING.title}**. The fee reference states the application fee is non-refundable. If paying by credit card, use the current RE909 and do not also send a check. Do not send cash. Later courses each require their own application and applicable fee.

Assemble one administrative section and the ${FIRST_FILING.title} application. Include a short cover letter identifying the applicant, the single course, the included payment and the contact details. Use clips or dividers so the materials can be separated for review. Send only the course package actually being filed; the prepared Practice and Mortgage packages remain for later filings.

**Mailing address from the current California submission manifest:**

${DRE.department}  
${DRE.section}  
${DRE.street}  
${DRE.city}, ${DRE.state} ${DRE.zip}

Contact: ${DRE.phone}. Recheck the Department's current submission instructions and fee form when the packet is ready to mail. The internal manifest records a ${DRE.reviewDays}-day review estimate; this is an estimate to verify, not a promise about the date this application will be decided.

The fee, mailing address, form signature blocks and required-items list were rechecked against official DRE sources on **September 6, 2026**: [RE206E fee schedule, Rev. 7/26](https://www.dre.ca.gov/files/pdf/forms/re206e.pdf), [RE306, Rev. 1/26](https://www.dre.ca.gov/files/pdf/forms/re306.pdf), and [Course Provider Handbook, Rev. 1/26](https://www.dre.ca.gov/files/pdf/faqs/Course%20Provider%20Handbook.pdf). Use the signature method allowed by the current official form; this packet leaves all signatures for the appropriate person.

Use a tracked delivery service and retain the assembled packet, exact instructional-file version, signed documents, payment details, credentials supplied, tracking number and delivery confirmation. Record the filing and delivery dates when they happen. This document does not mean that an application has been mailed, a certification received, or a course approved.
`;
fs.writeFileSync(path.join(root, "california/submission/PRINT_AND_MAIL_INSTRUCTIONS_FOR_ANATOLIY.md"), instructions);
console.log(`Synchronized California print metadata: ${volumes.map((entry) => entry.pages).join(" / ")} pages; first filing ${FIRST_FILING.title}.`);
