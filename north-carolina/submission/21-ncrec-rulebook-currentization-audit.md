# North Carolina NCREC rulebook currentization audit

**Control date:** 2026-09-07  
**Manifest:** `NC-PHASE0-2026-09-07-v21`  
**Source status:** VERIFIED_AS_OF_CAPTURE  
**Filing status:** NO-GO

## Outcome

The current North Carolina source ledger no longer depends on the inaccessible OAH PDF routes.
All 35 administrative-rule source records now resolve to two official NCREC publications that were
retained, hashed, text-extracted, rendered and visually reviewed on every page:

1. [North Carolina Real Estate License Law and Commission Rules](https://www.ncrec.gov/Pdfs/Rules/NCRECLawAndRules.pdf) — the January 2026 consolidated baseline, 126 pages.
2. [Rules Effective April and July 2026](https://www.ncrec.gov/Pdfs/Rules/ApprovedRulesEffectiveAprilAndJuly2026.pdf) — the official later-change notice, 13 pages.

The January compilation controls the 32 rule-source records not changed by the later notice. The
three affected records — Rules 58A .0112, 58A .0302 and 58H .0101 — resolve to the later change notice.
This pairing prevents the older compilation from silently overriding April/July 2026 amendments.

## Authenticity and page review

| Artifact | HTTP | SHA-256 | Pages | Review |
|---|---:|---|---:|---|
| `NCRECLawAndRules.pdf` | 200, `application/pdf` | `5c55cbd14b43299b42a5110fcb140246840205447f1d7b5121f73ec466c2edec` | 126 | all pages reviewed |
| `ApprovedRulesEffectiveAprilAndJuly2026.pdf` | 200, `application/pdf` | `d4e69417fe9dc79ea9e6c995ab486c6c939af87429a76a44d537f7dcc3575b88` | 13 | all pages reviewed |

The full review found no clipping, overlap, missing pages or illegible rule text. In the 126-page
booklet, pages 2, 51, 101 and 102 are intentional divider or blank pages, and page 126 is the back
cover. The change notice contains the notice, effective-date statements, redline conventions,
complete changed-rule text and rule histories through its final page. Both PDFs have usable digital
text; OCR was unnecessary.

## Source-lock result

- Source records: **162/162 indexed**.
- Controlling claims: **102/102 traced**.
- PDF source records: **48/48 byte- and identity-verified**.
- PDF source records with all-page review: **48/48**.
- Retained current PDF artifacts: **15**, covering **360 unique reviewed pages**.
- Structural validation: **PASS**.
- Strict source-capture validation: **PASS**.
- Source blocker `NC-B01`: **closed**.

Historical failed OAH requests remain in the capture log as audit history. They are not used by the
current manifest and do not affect the source lock.

## What this does not clear

The filing remains NO-GO with eleven open blockers. Source completeness does not supply NCREC
provider or course approval, an approved instructor, the missing proprietary/required-activity
materials, the 72 instructional-hour evidence, a secured final/proctoring flow, a reviewer-ready LMS,
complete entity and instructor facts, live filing fields, or signed provider/PPD documents.

## Validation

- **143/143** focused North Carolina, source-integrity and all-course free-practice tests passed.
- **1,316/1,316** complete repository tests passed with the bundled PDF runtime.
- The strict source lock reports `VERIFIED_AS_OF_CAPTURE` and exits successfully.

The retained evidence is an as-of-capture record, not a permanent currency guarantee. Re-fetch both
official NCREC rule publications before filing and repeat the page review if publisher bytes change.
