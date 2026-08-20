# StateCourse California DRE Submission Package

**Applicant:** StateCourse LLC, a California domestic limited liability company (CA SoS **B20260376786**, filed 18 August 2026)
**Filing:** three separate Statutory/Pre-License Course Approval applications
**Total fee:** $1,500.00 ($500 per course — RE 206E)
**Prepared:** August 20, 2026
**Status: NOT FILED.** No StateCourse course is approved by the California Department of Real Estate, no course approval number or sponsor ID has been issued, no instructor is DRE-approved, enrollment is closed, and no California pre-license credit is available for any course.

---

## Structure

```
california/submission/
├── README.md                                    ← you are here
├── 00_administrative/                           ← one set, serves all three applications
│   ├── A1-re303-checklist.md                    RE 303's sixteen items, and the equivalency criteria behind them
│   ├── A2-entity-documentation.md               checklist item 3 — the stamped Articles
│   ├── A3-payment-instructions.md               checklist item 2 — $500 × 3
│   ├── A4-bppe-exemption-statement.md           RE 306 item 8 — EDC § 94874(d)(2)(A)
│   ├── A5-fbns-determination.md                 RE 306 items 2 and 10 — decision required
│   ├── A6-re304-determination.md                checklist item 5 — NOT required
│   └── A7-instructor-package.md                 checklist item 8 + the college-equivalence blocker
├── 01_Real_Estate_Principles/
├── 02_Real_Estate_Practice/
├── 03_Mortgage_Loan_Brokering_and_Lending/
└── PRINT_AND_MAIL_INSTRUCTIONS_FOR_ANATOLIY.md  ← not part of the filing
```

Each course package contains, numbered in RE 303 checklist order:

| File | Checklist item |
|---|---|
| `00-package-index.md` | assembly order and the facts a reviewer will cross-check |
| `01-re306-answer-sheet.md` | 1 — answers to transcribe onto the official RE 306 |
| `02-fee-reference.md` | 2 |
| `04-instructional-material-manifest.md` | 6 — what is printed, and the RE 303 language that settles it |
| `06-re313-general-information-page.md` | 9 — content to type into the official RE 313 Word form |
| `14-login-instructions.md` | 15 |
| `15-re311-certificate-specimen.md` | 16 |

Items 7, 10–14 live with the course they belong to, at `california/<course-id>/submission/`, and are cross-referenced rather than copied.

## Form integrity

**No California DRE form is recreated, redesigned, restyled, or re-typeset anywhere in this package.** RE 306 stays RE 306; RE 311 stays RE 311; RE 313 stays RE 313; RE 336 stays RE 336. What is generated here is the **answer sheet** for each form — the exact text to type into the official fields — plus clearly labelled continuation sheets for answers that will not fit. Official labels, checkboxes, layout, and DRE's own boilerplate are untouched.

Official forms are held at `california/dre-sources/`: RE 206E, RE 303, RE 304, RE 306, RE 307, RE 311, RE 318A, RE 336, RE 909, re313.doc, and the Course Provider Handbook.

## The three legal questions, answered from controlling text

| Question | Answer | Authority |
|---|---|---|
| **BPPE** (RE 306 item 8) | **Exempt** | Education Code **§ 94874(d)(2)(A)** — license examination preparation approved by a government agency, other than the Bureau, that licenses the profession. Carve-outs in §§ 94874.2 and 94874.7 checked and inapplicable. |
| **RE 304** (checklist item 5) | **Not required — do not include** | RE 304's own scope: *"for use by nonresident sponsors."* DRE Course Providers page: *"All out-of-state course providers will also need form RE 304."* StateCourse LLC is a California domestic LLC with a California principal office and a California agent for service of process. |
| **FBNS** (RE 306 items 2, 10) | **"StateCourse" is a fictitious business name** — a decision is required | B&P **§ 17900(b)(5)**: for an LLC, *"any name other than the name stated in its articles of organization."* Filing duty under § 17910 attaches on regularly transacting business under it. **Option A (trade as "StateCourse LLC", no FBNS) recommended.** |

None of the three is left as "ask counsel." Each is resolved on the face of the controlling text. What remains in the FBNS matter is a business decision about which name to trade under, not a legal question.

## Status of each RE 303 item

**Ready:** 1, 2, 3, 5 (not applicable), 7 (not applicable), 9, 10, 11, 12, 13, 14, 16.
**Ready, credentials issued at filing:** 15.
**Ready, print run outstanding:** 6.
**Decision required from the owner:** 4 (FBNS — see A5).
**Genuine external blocker:** the **college instructor equivalence certification** required by RE 303's COURSE CONTENT section — three certifications, one per course, each from a college instructor in the field, on school letterhead, signed. This is **not** RE 336 and is not satisfied by it. See **A7.2**.

## Consistency

Every shared fact — entity name, addresses, 45 hours, 15 assignments, 100 questions, 60%, 180 minutes, closed book, one retake, delivery method, proctor supervision, instructor name, licence #01385024 — is defined once in `config/california/submission-facts.mjs`, rendered by `scripts/generate-california-submission.mjs`, and re-verified by `tests/california-submission-consistency.test.mjs`, which also fails the build if any document asserts a regulatory status that does not exist — approval by DRE or the state, instructor or provider approval, or currently-available regulatory credit. The exact phrases the audit refuses are listed in `FORBIDDEN_CLAIMS` in the facts module.

Regenerate after any change to the facts:

```bash
node scripts/generate-california-submission.mjs
node --test tests/california-submission-consistency.test.mjs
```
