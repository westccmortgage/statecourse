# North Carolina RELINC and Form L-09 all-page audit

**Control date:** 2026-09-07
**Scope:** licensing/application handbook and foreign-LLC filing form
**Status:** retained-source review complete; overall source verification remains INCOMPLETE and filing remains NO-GO
**Enrollment, payment and North Carolina credit:** closed, disabled and unavailable

## Outcome

The official April 2026 *Real Estate Licensing in North Carolina* handbook and the North Carolina
Secretary of State Form L-09 were re-fetched from their publisher URLs on the control date. Each
response matched the previously retained PDF byte-for-byte. Every page is now bound to a visually
reviewed render and a SHA-256 value. No selective-page review is counted as a complete review.

## Authentic publisher evidence

| Artifact | Publisher URL | Pages reviewed | PDF SHA-256 |
|---|---|---:|---|
| *Real Estate Licensing in North Carolina*, April 2026 | [Pearson VUE](https://www.pearsonvue.com/content/dam/VUE/vue/en/documents/publications/093400.pdf) | 36/36 | `bd367e286af12537c2c311eb688746b51c132679bb7ed2c9e81cbb5dcc2a25d4` |
| Form L-09, *Application for Certificate of Authority for a Limited Liability Company*, revised July 2017 | [North Carolina Secretary of State](https://www.sosnc.gov/webfiles/documents/forms/Business_Registration/limited_liability_companies/application_for_certificate_of_authority.pdf) | 3/3 | `0edbf25603a6a0829824672875bbe96c27299fe3a24b2e56a9b70ec48a7b0857` |

Both files returned HTTP 200 with `application/pdf` from the requested publisher host. The retained
and re-fetched hashes matched. The 39 page renders were legible and complete, with no missing page,
clipping or overlap. The handbook's last page is intentionally rotated as a mailing panel. Digital
text matched the visible pages, so OCR was not required.

The hash-bound page record is
`north-carolina/regulatory/captures/2026-09-07/relinc-l09-review/page-reviews.json`. The source-integrity
ledger independently checks the two source PDFs and every one of the 39 render hashes.

## Content verified and limits preserved

The handbook review covered the qualification choices, application and character-review process,
published application and examination charges, 180-day eligibility period, examination structure,
identification and security rules, postlicensing, continuing education, reinstatement and application
flowchart. These are licensing-path facts, not proof that StateCourse is certified or its course is
approved. Any variable portal field, booking availability or amount charged must still be checked at
the actual transaction.

The L-09 review covered the three-page blank filing form, registered-agent consent, filing instructions,
published $250 fee and the requirement for an authenticated existence document meeting the form's
currency instructions. Whether StateCourse LLC's exact North Carolina activity requires foreign
qualification remains a fact-dependent legal and filing determination; this audit does not decide it
or complete/sign the form.

## Machine-verifiable state

- Manifest: **NC-PHASE0-2026-09-07-v17**.
- Sources and claims: **162 sources; 102 claims** — 98 confirmed, one interpretation and three needing
  regulator confirmation.
- Source ledger: **48 PDF source entries across 45 unique URLs**; ten have verified bytes and all ten
  have complete all-page review. Source status remains **INCOMPLETE**.
- Reviewed source pages: **89 total** across the ten reviewed source artifacts.
- Timing remains deficient: **69,379 curriculum words / 308.35 minutes** at 225 wpm; **89,746 words /
  398.87 minutes** with the question-bank source included as a deliberately generous ceiling. This
  does not meet the 3,600-minute non-exam instructional target.
- Validation: **138/138** focused North Carolina, source-integrity and all-course free-practice tests;
  **1,311/1,311** complete repository tests using the bundled Python runtime.
- Release state: structure **PASS**; source verification **INCOMPLETE**; filing **NO-GO**.

## Remaining gates

Most current rule/source PDFs remain uncaptured. The OAH rule host timed out, and the current NCREC
syllabus and LLCR remain inaccessible from this environment. Current proprietary Form 2-T materials,
the approved-plat and other outstanding Required Activity artifacts, the complete timing ledger,
secured final and proctoring, reviewer-ready LMS, operational records, user facts and every
provider/course/instructor approval remain unresolved.

This audit proves only the two named source captures, their currency check and their complete page
review. It is not NCREC certification or approval and does not authorize enrollment, payment, course
credit or a completion certificate.
