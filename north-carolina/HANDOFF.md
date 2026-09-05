# North Carolina handoff

**Branch:** `relay-north-carolina`  
**Phase:** Phase 0 regulatory baseline and pre-filing package  
**Control date:** 2026-09-04  
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
April 2025 official handbook described a $50 Pearson single-section fee and 180-day eligibility, but
the fee must be checked live. The State section has 60 scored items plus five pretest items in that
official outline.

## Instructor answer

Even after a nonprovisional NC broker license, Rule 58H .0302 requires activation CE, 60 accredited
college semester hours, the instructor approval exam before NIS registration, NIS within the required
six-month window, ≥90% NIS attendance, a 15-minute teaching block, nonresident consent, and one
experience/equivalency branch. The ordinary experience branch includes one NC brokerage year, which
the user does not have. Transcripts and teaching/other-jurisdiction instructor evidence are not in
the record; equivalency therefore needs NCREC preclearance.

## The decisive build discovery

Rule 58H .0401 measures self-paced course time at 225 words per minute plus actual audio/video
duration. The sixteen curriculum files contain 51,568 audit-tokenized words: about 229.19 minutes or
3.82 hours. Even adding every word in the question-bank source produces only a deliberately generous
5.36-hour ceiling. There is no media ledger. Planned “72-hour” module labels prove nothing. The course
must not be submitted or advertised as 75 hours until its student-visible content and unit/media
ledger actually demonstrate the required time.

## Open blockers

| ID | Owner | Blocker |
|---|---|---|
| NC-B01 | StateCourse | Filing-date PDF byte/hash/render/OCR lock absent |
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

1. Send the preclearance request and obtain the NCREC comparable-status/equivalency answers.
2. Obtain college transcripts and certified California license history.
3. Resolve/file NC foreign qualification if required and designate entity/education-director facts.
4. Capture/hash/render/OCR-check official filing-date sources and lawfully obtain required forms.
5. Expand/reconcile the curriculum and build a regulator-format timing ledger.
6. Build/test secure final exam, proctoring, complete distance LMS, reports, storage and reviewer access.
7. Finalize/sign PPD and provider packet; submit provider application.
8. After provider number issues, submit the complete course in the live REC 7.33 workflow.
9. Open enrollment/payment only after approvals and a signed production release audit.

Run:

```text
node scripts/north-carolina-source-lock.mjs --json
node --test tests/north-carolina-course.test.mjs tests/north-carolina-phase0.test.mjs
```

The structural source lock is intended to pass while filing remains **NO-GO**. A green test suite is
not regulator approval.
