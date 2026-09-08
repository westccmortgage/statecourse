# Protected final-examination authoring audit

**Completed:** 2026-09-07

**Artifact version:** `NC-FINAL-DRAFT-2026-09-07-v1`

**Protected source SHA-256:** `da42475fe8e1360c5aca9b5ab318a4a987fa48b054158af3ce72d29aae21210e`
**Regulatory posture:** authored review draft; not approved and not authorized for administration

## Result

The repository now contains two protected, independently authored end-of-course examination forms.
Each form has 48 scored multiple-choice items: three items for each of the sixteen NCREC syllabus
sections. The examination allocation is 180 minutes and the passing threshold is 75 percent, so
36 of 48 passes and 35 does not.

The 48-item form size is a **StateCourse design decision**, not a number attributed to NCREC. The
reviewed May 2026 Syllabus and Rule 58H .0207 prescribe a comprehensive, closed-book, proctored
examination, a minimum 75-percent grade, confidentiality and three course hours for the examination;
they do not prescribe the education provider's item count.

## Security properties proved in the repository

- The 96 final prompts are unique and none duplicates any of the 176 formative prompts.
- Every form covers all sixteen sections exactly three times.
- Every item has four distinct choices, one internal key, a rationale and a curriculum reference.
- A student-facing attempt requires a persisted attempt seed of at least sixteen characters.
- The same seed recreates the same question and choice order; another seed changes the presentation.
- Correct answers are balanced exactly across A, B, C and D positions for every attempt.
- The student payload includes only item id, section, prompt and displayed choices. It serializes no
  key, rationale or curriculum locator.
- Grading refuses missing, extra, non-integer or out-of-range answers.
- Public application code imports no protected-final module.

These controls are mechanically verified by `tests/north-carolina-final-exam.test.mjs`.

## What this closes — and what it does not

This closes the **authored-bank** portion of NC-B07. It does not close NC-B07 as a production gate.
Before administration, StateCourse still must implement and validate:

1. school-authorized proctor enrollment and candidate identity verification;
2. closed-book/no-assistance certification and incident handling;
3. server-only attempt authorization, answer persistence and finalization;
4. least-privilege access to the protected bank and answer keys;
5. immutable attempt, timing, proctor, score and appeal records;
6. timeout, disconnect, recovery and accessibility cases;
7. clean-device reviewer testing and security review; and
8. instructor/education-director substantive signoff and any NCREC-required revision.

No public practice route serves these items. No completion certificate may rely on the draft bank,
and `finalExamSecurityValidated` remains false until the production workflow passes its acceptance
record.

## Public-framework correction found during this audit

The public launch framework previously described fifteen generic five-hour modules, which contradicted
the controlling course engine and NCREC syllabus. It now records the actual sixteen sections, their
72 instructional hours, levels and published license-examination weights, plus a separate three-hour
provider final inside the 75-hour total. Section XVI remains zero standalone hours because mathematics
is integrated into the relevant subjects.
