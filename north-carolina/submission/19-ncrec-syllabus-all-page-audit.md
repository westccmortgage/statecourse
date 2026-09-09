# North Carolina NCREC syllabus all-page audit

**Control date:** 2026-09-07
**Scope:** official NCREC Broker Prelicensing Course Syllabus, Student Version
**Status:** retained-source review complete; overall source verification remains INCOMPLETE and filing remains NO-GO
**Enrollment, payment and North Carolina credit:** closed, disabled and unavailable

## Outcome

The official syllabus route that returned HTTP 403 during the first capture attempt later returned a valid
PDF from the same NCREC URL. The current 108-page document was retained, text-extracted, rendered page by
page and visually reviewed in full. It is the **March 2024 Edition, Amended May 2026** already identified by
the curriculum; no silent edition change was found.

| Artifact | Publisher URL | Size | Pages reviewed | PDF SHA-256 |
|---|---|---:|---:|---|
| *North Carolina Real Estate Prelicensing Course Syllabus (Student Version)* | [NCREC](https://www.ncrec.gov/Forms/Education/Prelicense_Course_Syllabus.pdf) | 1,473,900 bytes | 108/108 | `e5fe46c1922c1b98aeaa560c49b9315e6f39b0e52c125e824df71c77ebecb48c` |

The response was HTTP 200 with `application/pdf`. PDF metadata identifies the North Carolina Real Estate
Commission as author, Microsoft 365 as creator/producer and May 11, 2026 as the creation and modification
date. The file is tagged, unencrypted, letter-sized and contains no JavaScript or form fields.

## All-page review

Every PDF page has an independently hashed render. Nine ordered contact sheets covering pages 1-108 were
visually inspected. The cover, introduction, required materials, delivery/completion rules, instructional
levels, hour table, contents, all sixteen syllabus sections and the closing math activities are legible and
complete without clipping or overlap. PDF page 10 is an intentional divider/blank page carrying only the
footer, not a rendering failure.

The digital text layer was compared with the visible structure and contains the required edition anchors,
the 75-hour total, Sections I-XVI and exactly 47 `Required Activity:` labels. OCR was unnecessary. The
retained text SHA-256 is
`b6bff32619c7a09e524493863a42cffdf72f87527893864b9950f9404c7df809`.

The source PDF, extracted text, 108 page renders, nine contact sheets and their hash-bound review record are
under `north-carolina/regulatory/captures/2026-09-07/syllabus-2026/`. The global source-integrity validator
checks the PDF identity, source hash, page count and every reviewed page-render hash.

## Reconciliation result

The retained source confirms the course architecture already encoded in the project:

- 75 total hours, including a three-hour end-of-course examination;
- 72 non-exam hours requiring 3,600 instructional minutes under the 50-minute instructional-hour rule;
- sixteen syllabus sections, with mathematics integrated rather than separately timed;
- 60 state and 80 national licensing-examination items across the section weights;
- three instructional levels; and
- 47 Required Activities in the retained PDF.

The all-page review does not revive outdated legal statements inside the syllabus. The course's documented
current-law corrections remain in force, including current property-tax reappraisal law, the current
Rule .0112 contract-form structure, current lead-program penalties and current square-footage guidance.
Current statutes and rules control when they conflict with the prescribed syllabus.

## Machine-verifiable state

- Manifest: **NC-PHASE0-2026-09-07-v19**.
- Sources and claims: **162 sources; 102 claims** — 98 confirmed, one interpretation and three needing
  regulator confirmation.
- Source ledger: **48 PDF source entries across 45 unique URLs**; twelve have verified bytes and all twelve
  have complete all-page review. Source status remains **INCOMPLETE**.
- Reviewed source pages: **199 total** across the twelve reviewed source artifacts.
- Timing remains deficient: **69,379 curriculum words / 308.35 minutes** at 225 wpm; **89,746 words /
  398.87 minutes** with the question-bank source included as a deliberately generous ceiling. This does
  not meet the 3,600-minute non-exam instructional target.
- Validation: **140/140** focused North Carolina, source-integrity and all-course free-practice tests;
  **1,313/1,313** complete repository tests using the bundled Python runtime.
- Release state: structure **PASS**; source verification **INCOMPLETE**; filing **NO-GO**.

## Remaining gates

The OAH rule host still times out from this environment. The former LLCR PDF route returns HTTP 404.
Current proprietary Form 2-T materials, the rights-safe deed/survey/plat exhibits, complete timing ledger,
secured final and proctoring, reviewer-ready LMS, operational records, user facts and every
provider/course/instructor approval remain unresolved.

This audit proves only the named syllabus's current publisher route, retained bytes and complete page
review. It is not NCREC certification or approval and does not authorize enrollment, payment, course credit
or a completion certificate.
