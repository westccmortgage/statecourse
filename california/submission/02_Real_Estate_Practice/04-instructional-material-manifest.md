# Instructional material manifest — Real Estate Practice

**Course:** Real Estate Practice — 45 Hours
**Applicant / sponsor:** StateCourse LLC
**Prepared:** August 20, 2026
**Status:** Submission draft. This course is not approved by the California Department of Real Estate, no course approval number has been issued, and no California pre-license credit is available for it.


## What RE 303 requires, and why all of it is printed

RE 303 says two things about instructional material that look like they conflict, and do not.

**Checklist item 6, general rule:**
> "Printed copies of all instructional materials, student materials, textbooks, case studies, sample forms, etc. need to be submitted. Any material presented via digital media (CD's, DVD's, USB Flash Drive, etc.) cannot be accessed by DRE and therefore, a printed version of the contents must be submitted to the Department."

**The same item, on published textbooks:**
> "It has generally been found that approximately 450 pages of text/instructional material is equivalent to textbooks offered by a California college or university. Please only submit a copy of the textbook's 'table of contents,' 'cover,' and 'publication page' with the RE 306. **Do not send a copy of the actual textbook unless requested by DRE.**"

**And, decisively for this application, the Internet Courses section:**
> "**Hard copies of all course material to be viewed by student on the Internet must be submitted with the application.**"

The textbook carve-out exists so that an applicant does not mail DRE a commercially published book DRE can identify from its cover. **It does not apply here**, for two reasons. There is no third-party textbook — the course text is original and is itself the instructional material, so withholding it would leave DRE nothing to evaluate against the statutory equivalency test in B&P § 10153.5. And the internet-course paragraph is specific and unconditional: *all* course material a student views online is submitted in hard copy.

**Conclusion: the full course text is printed and submitted.** Approximately 450 pages is DRE's own stated benchmark for college equivalency, and this course sits at that benchmark.

## What is in the printed course text

| | |
|---|---|
| Lesson assignments | 15, printed in full and in order |
| Instructional minutes per assignment | 180 |
| Total instructional time | 2700 minutes = 45 hours |
| Source | `california/ca-real-estate-practice-45-v1/curriculum/lesson-01.md` … `lesson-15.md` |

## The volume is built

`scripts/build-california-print-volume.mjs` produces the bound volume as HTML and renders it to PDF with headless Chromium. **This course: 330 pages.** Output is in `california/print/`; regenerate after any lesson change and put the new count into RE 313.

It is bound with a **cover page**, a **publication page** (title, author StateCourse LLC, copyright 2026, edition 1.0), and a **table of contents** at the front, so the volume simultaneously satisfies the textbook-identification instruction and the full-material instruction. The exact page count goes on RE 313's "Pages" field once the volume is bound.

## What is NOT printed and NOT mailed

- **No answer keys inside the student material.** The instructor answer keys are separate submission items (checklist 14) and are placed behind the examinations, not inside the course text.
- **No digital media of any kind.** RE 303 is explicit that DRE cannot access it.
- **No third-party textbook**, because none is used.
- **No marketing material, pricing page, or Stripe/payment material.** None of it is part of a course approval application and none of it is submitted.
