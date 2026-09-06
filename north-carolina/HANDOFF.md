# North Carolina handoff

**Branch:** `relay-north-carolina`
**Phase:** Phase 0 regulatory baseline and pre-filing package
**Control date:** 2026-09-06
**Provider:** Not certified
**Course:** Not approved
**Instructor:** Not approved
**Enrollment:** closed
**Payment:** disabled
**North Carolina credit:** none

## What is complete

- Official-source Phase 0 covers personal broker licensure, instructor qualification, education
  provider, education director, PPD, course approval, distance delivery, completion/proctoring,
  reporting, records, renewals, postlicense/CE products, foreign-LLC route and current market scale.
- The machine manifest records authority class, exact URL, revision/effective date, retrieval date,
  pinpoint, evidence, supersession check and source-integrity state for each source.
- Twenty-one claims are separated into confirmed, interpretation and regulator-confirmation states.
- Filing index, provider/course datasheets, personal path, instructor dossier, regulator email draft,
  PPD draft, distance control plan, course guide, records SOP, timing report, product roadmap and
  certificate specimen are prepared.
- The course engine now exposes a closed release posture and refuses certificate eligibility without
  provider, course, instructor, timing and exam-security evidence in addition to student completion.

## Personal route — exact present answer

The user's active California Broker can invoke 21 NCAC 58A .0511 if documented active/in-good-standing
within the preceding three years. The recommended election is **.0511(b)(1): pass only the North
Carolina State section**, because the other election issues provisional status without an exam and a
provisional broker cannot meet the instructor rule. NCREC must still confirm that it considers a
California Broker a comparable category for issuance of a **nonprovisional** NC Broker. No repository
artifact promises that result.

The broker application requires a Commission-designated criminal records report obtained within six
months, not a fingerprint step in the controlling rule; the current application fee is $105. The
April 2026 official handbook was downloaded from Pearson: printed page 19 / PDF page 21 gives a $53
single-section exam fee ($63 for both) and 180-day eligibility. The prior April 2025/$50 citation was
stale. The State section has 60 scored items plus five pretest items; recheck the booking charge.

## Instructor answer

Even after a nonprovisional NC broker license, Rule 58H .0302 requires activation CE, 60 accredited
college semester hours, the instructor approval exam before NIS registration, NIS within the required
six-month window, ≥90% NIS attendance, a 15-minute teaching block, nonresident consent, and one
experience/equivalency branch. The ordinary experience branch includes one NC brokerage year, which
the user does not have. Transcripts and teaching/other-jurisdiction instructor evidence are not in
the record; equivalency therefore needs NCREC preclearance.

## The decisive build discovery

Rule 58H .0401 measures self-paced course time at 225 words per minute plus actual audio/video
duration. Rule .0101(7) defines an instructional hour as 50 instructional minutes plus 10 break
minutes, so the 72-hour non-exam syllabus allocation is 3,600 actual instructional minutes, not the
previously reported 4,320. The sixteen curriculum files contain 51,568 audit-tokenized words, or at
most 229.19 minutes/3.82 elapsed hours; they include nonstudent author notes. Adding the entire
question-bank source gives a generous 321.75-minute ceiling including code. Neither is validated
student time. There is no media ledger. Planned “72-hour” module labels prove nothing. The course
must not be submitted or advertised as 75 hours until its student-visible content and unit/media
ledger actually demonstrate the required time.

## Open blockers

| ID | Owner | Blocker |
|---|---|---|
| NC-B01 | StateCourse | Partial PDF capture: 2/21 source entries retained and reviewed; 19 entries unavailable; source status INCOMPLETE |
| NC-B02 | NCREC | Provider certification absent |
| NC-B03 | NCREC | Written self-paced course approval absent |
| NC-B04 | user + NCREC | Nonprovisional NC broker and instructor approval absent |
| NC-B05 | StateCourse | 225-wpm/media timing fails |
| NC-B06 | StateCourse/rights holders | Current forms/manuals/Required Activity artifacts incomplete |
| NC-B07 | StateCourse | Secured comprehensive final and proctoring not complete |
| NC-B08 | StateCourse | Full reviewer-ready LMS/attendance/support evidence incomplete |
| NC-B09 | user | Entity/director/ownership/pricing/refund/signature facts incomplete |
| NC-B10 | user + NCREC | Transcript and instructor experience/equivalency unresolved |
| NC-B11 | StateCourse | Live portal revisions and variable charges not captured |
| NC-B12 | user | PPD/certifications not factualized and signed |

## Entity filing

Whether the exact online operation is “transacting business” under G.S. 57D-7-01 is fact-dependent
because the statute lists exceptions. If foreign qualification is required, use current NC Secretary
of State Form L-09, $250, with NC registered office/agent, principal officials and a California
certificate of existence authenticated and less than six months old. NCREC Rule .0202 separately
requires its own foreign-entity consent to service and asks for an NC SOS ID if applicable.

## Next fixed order

1. Await the NCREC comparable-status/equivalency answers. Inquiry was sent to educ@ncrec.gov on
   September 6, 2026 at 04:16:45 PDT, subject “StateCourse — NC comparable broker status and instructor
   qualification”; Gmail message ID `1a0766f5c826402a`. No reply recorded at this handoff; do not duplicate.
2. Obtain college transcripts and certified California license history.
3. Resolve/file NC foreign qualification if required and designate entity/education-director facts.
4. Complete authentic PDF capture and relevant-page/text review; use OCR only when digital text is
   missing or disputed. L-09 is retained but still needs factual completion/signature when applicable.
5. Expand/reconcile the curriculum and build a regulator-format timing ledger.
6. Build/test secure final exam, proctoring, complete distance LMS, reports, storage and reviewer access.
7. Finalize/sign PPD and provider packet; submit provider application.
8. After provider number issues, submit the complete course in the live REC 7.33 workflow.
9. Open enrollment/payment only after approvals and a signed production release audit.

Run:

```text
node scripts/north-carolina-source-lock.mjs --json
node --test tests/north-carolina-course.test.mjs tests/north-carolina-phase0.test.mjs
node --test tests/north-carolina-source-integrity.test.mjs
node scripts/north-carolina-source-lock.mjs --require-source-capture
```

Structure reports **PASS**, source verification **INCOMPLETE**, and filing **NO-GO**. The capture log
records exact failures and does not turn search-index text into downloaded evidence. Current PDFs:
2 retained of 19 unique URLs, representing 2 of 21 source entries; the shared Chapter 58 compilation
supports three entries. Scripts verify actual bytes and content identity and reject a wrong PDF,
soft-404, missing snapshot, stale hash, foreign redirect, and missing/stale page review. No push made.

PDF extraction needs Python with `pypdf`; set `NC_PYTHON` to that interpreter when it is not `python3`.
The strict `--require-source-capture` command intentionally exits 1 while sources are incomplete;
the normal command checks structure and reports source failures without claiming a lock. These are
offline as-of-capture checks; re-fetch before filing. Current focused tests: 77/77 passing.
