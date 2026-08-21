# Claude Work Order — California DRE Submission Remediation

**Date:** August 20, 2026  
**Owner:** Anatoliy Kanevsky  
**Provider:** StateCourse LLC  
**Goal:** Produce one regulator-ready first-course filing for California DRE, beginning with Real Estate Principles only. Do not regenerate a multi-course print-ready packet until every blocker below is closed.

## 1. Refund policy — IMPLEMENT NOW

The California refund policy is now adopted as policy version **CA-2026-08-20-v1**.

Authoritative sources:

- `config/california/submission-facts.mjs`
- `docs/payments/california-refund-policy.md`

Required implementation:

1. Render the exact policy into the California RE 313 General Information Page for each course.
2. Present it before enrollment/checkout.
3. Require student acknowledgment and store the policy version accepted.
4. Display the same policy in Terms.
5. Make `request-refund.mjs` calculate/refuse refunds according to the policy instead of relying only on manual `policyReviewApproved`.
6. For packages, persist a course-by-course price allocation at checkout so pro-rata calculations are reproducible.
7. Add automated tests proving the same policy version/text is used by RE 313, enrollment, Terms, and refund administration.
8. Keep refund execution through Stripe to the original payment method.

Do not silently alter the adopted policy. If implementation exposes a genuine legal or technical conflict, stop and report the exact conflict.

## 2. RE 306 corrections

- Preserve the official DRE printed `S` prefix in item 1A; leave the sponsor-number digits blank until DRE assigns them.
- Item 4 classroom facility: use `N/A — no classroom facility; correspondence/internet course only` unless the official field logic requires it to remain blank. Do not present the Burbank principal office as a classroom.
- Keep legal provider name exactly `StateCourse LLC`.
- Re-evaluate and correct BPPE item 8. Do not use Education Code §94874(d)(2)(A) as the exemption basis unless controlling authority supports it for these pre-license courses.
- Maintain item 10 consistent with the final FBNS decision.
- Complete both primary-contact and owner/authorized-school-official sections on page 3 even if the same person fills both roles.

## 3. RE 336 corrections

- Use `StateCourse LLC` exactly. Never `state course LLC` or `StateCourse` in the provider-name field.
- Regenerate all course-specific RE 336 forms from the official original form.
- Do not include blank duplicate RE 336 forms in any filing packet.
- Keep DRE Sponsor ID blank until assigned.

## 4. Real Estate Practice SB 1495

Wherever the Practice course is represented for eventual filing:

- General Information Page must state that the course is **Compliant with SB 1495**.
- RE 311 specimen must state **Compliant with SB 1495**.
- Ensure interactive participatory fair-housing role-play is traceable from RE 306 item 23B into the actual course content.

## 5. Course materials

For DRE filing, do not assume cover/TOC/publication page alone is enough for StateCourse's newly authored texts.

Prepare a complete hard-copy print volume for each internet course with all student-viewable instructional material. Start with **Real Estate Principles only** for the first filing.

The first-course packet must include the complete student-viewable Principles content, timed outline, required forms/materials, and all items listed in RE 303.

## 6. Secure exams

For each course, correct provider references to `StateCourse LLC` and produce:

- Student Version — Form A
- Instructor Version / Answer Key — Form A
- Student Version — Form B
- Instructor Version / Answer Key — Form B

Instructor versions must include answer references keyed to the course material.

Do not publish answer keys into the public web artifact.

## 7. Student and regulator credentials

Create working DRE review accounts for the first filing:

- one normal student account;
- one regulator account that bypasses study-time restrictions while exposing the same course content, assessments, and final exams.

Credentials must not be committed to GitHub. Generate a local/private filing sheet for Anatoliy to insert before mailing.

## 8. Professor equivalence certification

Do not treat draft request letters as certifications.

A filing is blocked until the specific course has a signed certification from a qualified college instructor in the field of study, on official school letterhead, confirming equivalency to college/university course material.

For the first filing, only the Real Estate Principles certification is required before print/mail.

## 9. Entity documentation

Prepare the filing assuming StateCourse LLC is a California domestic LLC.

The filing checklist must require a current California Secretary of State Certificate of Status/Good Standing if DRE's current company-document requirement calls for it.

Do not include Wyoming entity documents.

## 10. FBNS consistency

Current source-of-truth assumes the public/legal name is `StateCourse LLC` and no FBN is used.

Audit all student-facing California materials, checkout descriptors, Terms, emails, forms, and course documents. If the business is marketed or contracted merely as `StateCourse`, report the inconsistency because it may require an FBNS filing. Do not silently mix the two names.

## 11. First-filing strategy

DRE recommends first-time applicants submit one course first to avoid repeating the same deficiencies.

Therefore build **only one final mailing package first:**

### Real Estate Principles — 45 Hours

Do not label it PRINT READY until all of these are present:

- corrected official RE 306;
- course fee instructions;
- required entity documentation;
- final BPPE position/support;
- final FBNS position/support;
- corrected signed RE 336 + qualification support;
- signed college equivalence certification;
- corrected RE 313 with adopted refund policy;
- complete student-viewable course material;
- timed course outline;
- student final-exam instructions;
- proctor instructions + certification/signature field;
- Student Form A;
- Instructor Form A + keyed answer references;
- Student Form B;
- Instructor Form B + keyed answer references;
- working student and regulator credentials on a private insert;
- RE 311 specimen;
- all required original/e-signatures and dates.

## 12. QA gate

Before generating the next PDF packet, run both structural and visual QA.

Search every final filing PDF for:

- `state course LLC`
- provider name `StateCourse` without `LLC` where a legal provider name is required
- invented sponsor IDs or course approval numbers
- `DRE Approved`, `State Approved`, `approved provider`, `approved instructor`
- placeholder text
- blank required contact/signature sections
- wrong price/refund-policy text
- wrong course title
- wrong course hours
- duplicate blank forms

Render every final PDF page to images and inspect for:

- overlap
- clipping
- missing checkboxes
- displaced form fields
- wrong characters
- hidden text
- unreadable font sizes
- fields that visually appear populated but extract incorrectly

Only after both QA passes may the packet be labeled `PRINT_READY`.

## Output expected from Claude

Do not return another status essay. Return only:

1. files changed;
2. tests added/changed;
3. blockers still requiring a human/external party;
4. exact next physical action for Anatoliy.
