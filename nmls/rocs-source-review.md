# ROCS V4 source review — not a verified document archive

Reviewed September 10, 2026 (Pacific). Internal course-development evidence only; no student acceptance, approval, production change or verified source-byte archive.

## Controlling requirement

[NMLS functional specification v17, OSS §5.5](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OSS_ROCS.html), effective January 1, 2026, requires the learner to read and acknowledge V4 within the LMS at the start of each course. Keep the agreement log for five years. Include ROCS on the cover or a standalone second page of course materials. A once-per-account acceptance does not meet that per-course requirement.

## Document identity and completeness

The [official V4 PDF linked by §5.5](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/pdf/Rules_of_Conduct_for_NMLS_Education_V4.pdf) is four pages, dated March 20, 2024. All four pages were read through the web PDF text extractor. Its content inventory is:

1. Background, individual responsibility, reporting, live-classroom rules and the start of webinar rules.
2. Remaining webinar rules, instructor-led online rules, and self-study rules including personal BioSig authentication, private credentials, seat time and activities.
3. Ten numbered rules, including the prohibition on learner use of AI/LLM assistance to complete approved courses and the CSBS privacy-policy reference.
4. Consequences of violations and blank identity, course, signature and date fields.

Do not remove other delivery-format sections when preserving this document. Webinar camera rules must not be relabelled as OSS requirements. Do not complete a learner's attestation on their behalf. This inventory is not a substitute for the full document.

## Implementation details from the FAQ

The [official ROCS issuance/retention FAQ](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/courseproviderresources/Course%20Provider%20Resources/FAQ%20for%20Issuance%20and%20Retention%20of%20ROCS.pdf), dated September 20, 2024, was read across all five pages. It describes unchanged uniform LMS text, a readable presentation and explicit agree/disagree choices. Online click-through agreement is a digital signature; an additional handwritten signature is not stated as mandatory for OSS. Registration alone is insufficient. Reading/explaining/acknowledging ROCS is excluded from approved instructional time. Retention runs five years from course start, with records readily retrievable. Primary materials must carry ROCS; secondary handouts are distinguished.

The existing domain constant `retentionYears: 5` is not an implemented retention/deletion schedule. The future archive must bind the original document, presentation, acceptance and course-start evidence. The distinct official uniform LMS text still needs to be obtained/confirmed; do not label a reconstruction as that published text.

## Acquisition outcome and next boundary

Direct downloads of the official PDF and FAQ returned HTTP 403 after network access was granted. The separately indexed official testing-handbook copy also returned 403. **No original PDF bytes were saved; no PDF SHA-256 was computed.** Extracted web text is not original PDF-byte evidence. No alternate document, fixture hash or successful HTTP status was substituted.

Keep `fullDocumentVerified` false for genuine offerings. Next obtain the genuine source through an ordinary permitted download, inspect every page, pin the actual bytes and resolve the uniform LMS text. Then build the accessible presentation and course-export wrapper without silently changing pinned manuscripts. Source authentication, accessible rendering, learner consent and provider/course approval are separate checks; this review completes none of those by itself.

## September11 follow-up: supplementary official HTML, not verified V4 bytes

The official handbook context link resolves to [this full ROCS HTML page](https://mortgage.nationwidelicensingsystem.org/knowledge/products/nmls/pubs/testingHbk/education/mlo_testing/MTEB/ROC_preLicenseStudents.html). It includes the delivery-format rules, ten additional rules, sanctions and blank attestation fields, and links a PDF version. Root verified the HTML with the web extractor after independent browser/source discovery. It shows no V4 version/update date; sanctions also include administrative penalties, unlike the previously extracted V4 PDF wording. Therefore official provenance does not establish unchanged V4/PDF equivalence or the designated uniform LMS text.

The legacy courseprovider PDF path discovered during this check redirects to the provider homepage. A direct download of the new HTML failed at DNS/network resolution in the local environment; no original document bytes or hash were saved. Previously403 PDF paths were not repeatedly retried. Keep the genuine-offering verification flag false. This adds a useful official reference, not a completed archive, learner agreement or approval.
