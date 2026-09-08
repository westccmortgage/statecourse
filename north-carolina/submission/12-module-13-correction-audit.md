# Module NC-13 correction audit

**Audit date:** 2026-09-07
**Scope:** Property Valuation & Appraisal; student curriculum, formative assessment, Required
Activities, regulatory traceability, public free-practice copy and source evidence.
**Approval status:** Development only. This report does not claim NCREC approval or course credit.

## Result

**Content, assessment and Required Activity checkpoint: PASS.** All five Section XIII Required
Activities are delivered and the identified legal, historical and form-transition defects are
corrected. **Course filing: NO-GO.** Course-wide source capture, duration, provider, instructor,
final-exam, LMS, form/manual and filing blockers remain open.

## Corrections verified

| Prior defect or unsafe shortcut | Corrected result | Authority/evidence |
|---|---|---|
| broker opinion described as a lender-only product | North Carolina's CMA/BPO exception, recipients, purposes, required contents/disclaimer and mortgage-origination limit are separated from appraisal practice | G.S. Chapter 93E Article 1; Chapter 93A Article 6 |
| appraiser trainee treated as independently licensed practice | registered trainee works under the immediate personal direction of a certified appraiser; the supervisor reviews and signs the report | G.S. 93E-1-2 and -1-4 |
| FIRREA said to have created The Appraisal Foundation | Foundation created in 1987; FIRREA later authorized its federal standards/qualifications role | Appraisal Foundation history |
| USPAP called an appraisal form | USPAP identified as professional standards; no copyrighted USPAP text is reproduced | Appraisal Foundation USPAP page |
| listing and pending data treated either as closed-sale comps or as unusable | listing/pending information is separate market evidence, not a settled sale in the closed-sale comparison grid | official Fannie Mae SF5 sample |
| three or four sales implied to be a universal form maximum | syllabus exercise baseline retained; official SF5 sample's five settled-sale comparables are taught as the actual sample | official Fannie Mae SF5 sample |
| adjustments described without direction or math | superior and inferior feature adjustments use explicit subject-relative direction, arithmetic and an indicated range | Module NC-13 lab |
| appraisal weighting reduced to a simple average | relevance, data quality and comparability control weighting; the official report's Most/Less labels are followed | official Fannie Mae SF5 sample |
| cost figures described as precisely known | source, assumptions, depreciation and obsolescence uncertainty are explicit | Module NC-13 correction |
| capitalization rate described as a standalone risk score | rate is an input connecting stabilized NOI to indicated value; selection requires supported market analysis | Module NC-13 correction |
| legacy Form 1004 treated as the only current URAR layout | legacy fixed form and dynamic UAD 3.6 report are separated with the current 2026 transition dates | Fannie Mae UAD timeline and forms pages |

## Required Activity artifacts

The dated capture retains the official 302-page combined Fannie Mae sample archive and an exact
20-page extraction of source pages 271-290: the SF5 publisher cover plus all nineteen report pages.
It also retains the seven-page legacy Form 1004 and the one-page May 5, 2026 transition timeline.

| Reviewed artifact | PDF pages | SHA-256 |
|---|---:|---|
| Fannie Mae UAD 3.6 SF5 completed URAR | 20 | `dbfd5cfddc25ea18f41b3d7f43043dc7a0bfb4e58b7d9ad390484c84aed7409b` |
| Fannie Mae legacy Form 1004 | 7 | `4455510be825a21de07dc74a9c96e715d2fc971c98ae8851fdbaea70a7926526` |
| Fannie Mae UAD and Forms Redesign Timeline | 1 | `a7dc89c39056fb81ca2e4def10dfbe14a36de8d17a3abbb039dfb46f23977687` |

All **28 pages** were rendered and visually checked against extracted digital text. The machine
record is `north-carolina/regulatory/captures/2026-09-07/module-13-appraisal/page-reviews.json`.
The source archive SHA-256 is
`7d13567fb5cbf5ce9ce9457923129bd66ce815fdf6fb7db22b9426a945f73bb9`.

## Reconciliation evidence in the completed SF5 report

- report pages 8-9 contain market, listing and pending-sale information;
- report pages 10-13 contain the settled-sale comparison analysis and weighting;
- report page 15 states a $350,000 sales-comparison indication, marks the income and cost approaches
  “Not Necessary for Credible Results,” and reconciles to a $350,000 final opinion;
- report page 16 carries reconsideration/revision history.

The lesson walks students through those locations without reproducing the report as course text.

## Machine checks

- Manifest: **135 sources, 81 claims, 12 blockers**; Module NC-13 claims resolve to six added official
  authority entries.
- Three reviewed teaching artifacts retain **28 page hashes**; the SF5 derivative has 20 pages and
  the exact 302-page source archive is separately bound by hash.
- Module NC-13 assessment keeps 11 authored items and now separates closed-sale comparison treatment
  from listing/pending market evidence.
- Public free-practice content is regenerated from the corrected course source and byte-compared by
  the repository test.

## Residual boundary

This pass does not claim to reproduce or fully reconcile the copyrighted USPAP publication, North
Carolina Appraisal Board rules or all GSE seller/servicer guidance. Those remain source boundaries.
The complete course still fails Rule 58H .0401 duration evidence and remains closed to enrollment,
payment, approval claims and North Carolina credit.
