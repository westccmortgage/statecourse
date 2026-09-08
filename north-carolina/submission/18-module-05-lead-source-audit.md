# North Carolina Module NC-05 lead-disclosure source audit

**Control date:** 2026-09-07
**Scope:** current joint EPA/HUD lead-disclosure fact sheet
**Status:** retained-source review complete; overall source verification remains INCOMPLETE and filing remains NO-GO
**Enrollment, payment and North Carolina credit:** closed, disabled and unavailable

## Outcome

The previously indexed September 2024 HUD file no longer exists at its recorded HUD URL: the control-date
request returned HTTP 404 with HTML, so it is not accepted as PDF evidence. The EPA's current disclosure-rule
page links a newer joint EPA/HUD fact sheet. That official January 2025 PDF was downloaded from the EPA host,
text-extracted, rendered and visually reviewed on both pages.

## Authentic publisher evidence

| Artifact | Publisher URL | Pages reviewed | PDF SHA-256 |
|---|---|---:|---|
| EPA/HUD, *Lead-Based Paint Disclosure Rule Fact Sheet*, EPA-747-F-25-001, January 2025 | [U.S. EPA](https://www.epa.gov/system/files/documents/2024-09/lead-disclosure-rule-fact-sheet.pdf) | 2/2 | `3984b7a333b243c17a2d68b7d82652b87f7235b240e734941f84f452e7d75b96` |

The current file returned HTTP 200 with `application/pdf` from the requested `epa.gov` host. Both pages
were legible and complete, with no missing text, clipping or overlap. The joint EPA/HUD marks, document
number and January 2025 date were visible on page 1. Digital text matched the visible pages, so OCR was
not required.

The source PDF, extracted text, two render files and their hashes are retained under
`north-carolina/regulatory/captures/2026-09-07/module-05-lead/`. The page-level record is
`page-reviews.json`; the global source-integrity check independently verifies the current URL, PDF identity,
source hash, page count and each render hash.

## Instructional disposition

The fact sheet supports plain-language instruction about covered and excluded housing, the required
pre-contract disclosure sequence, the buyer's inspection opportunity, three-year retention and conditions
for electronic delivery. It also states what the disclosure rule does not itself require. The fact sheet is
guidance; 42 U.S.C. §4852d and current 40 CFR part 745 subpart F remain controlling.

## Machine-verifiable state

- Manifest: **NC-PHASE0-2026-09-07-v18**.
- Sources and claims: **162 sources; 102 claims** — 98 confirmed, one interpretation and three needing
  regulator confirmation.
- Source ledger: **48 PDF source entries across 45 unique URLs**; eleven have verified bytes and all eleven
  have complete all-page review. Source status remains **INCOMPLETE**.
- Reviewed source pages: **91 total** across the eleven reviewed source artifacts.
- Timing remains deficient: **69,379 curriculum words / 308.35 minutes** at 225 wpm; **89,746 words /
  398.87 minutes** with the question-bank source included as a deliberately generous ceiling. This does
  not meet the 3,600-minute non-exam instructional target.
- Validation: **139/139** focused North Carolina, source-integrity and all-course free-practice tests;
  **1,312/1,312** complete repository tests using the bundled Python runtime.
- Release state: structure **PASS**; source verification **INCOMPLETE**; filing **NO-GO**.

## Remaining gates

Most current rule/source PDFs remain uncaptured. The OAH rule host timed out, and the current NCREC
syllabus and LLCR returned HTTP 403. Current proprietary Form 2-T materials, the approved-plat and other
outstanding Required Activity artifacts, the complete timing ledger, secured final and proctoring,
reviewer-ready LMS, operational records, user facts and every provider/course/instructor approval remain
unresolved.

This audit proves only the named fact sheet's current publisher route, retained bytes and complete page
review. It is not NCREC certification or approval and does not authorize enrollment, payment, course credit
or a completion certificate.
