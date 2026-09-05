# Illinois handoff

Prepared September 4, 2026.

## State

| Item | Status |
|---|---|
| Branch | `relay-illinois` |
| Phase 0 | **Complete v1** |
| Regulatory source lock | `IL-PHASE0-SOURCE-LOCK-2026-09-04-v1` |
| Full curriculum authoring | Not begun; deliberately deferred until baseline |
| StateCourse Illinois provider approval | **Not applied / not approved** |
| Illinois course approvals | **None** |
| Illinois instructor license | **Not applied / not issued** |
| Enrollment, payment, credit, certificates, URET | **Blocked** |

## What is settled

1. Illinois replaced reciprocity applications with endorsement effective January 1, 2026.
2. Anatoliy's current public California Broker record supports preparing an Illinois **Broker endorsement** application: active/good-standing official certification, 30-hour approved Broker endorsement course/URET, Illinois-specific law exam, nonresident consent, Form 505-0347 and $150.
3. An approved Broker application without a Sponsor Card is issued inactive. Active status requires Illinois sponsorship.
4. Managing Broker is not established. Illinois requires a managing-broker license or equivalent and two immediately preceding years of active managing practice. California Broker authority does not itself decide Illinois equivalence.
5. Pre-license instructor requires a 75% exam, one expertise route, approved 12-hour training and $150 portal application. The active-broker-for-two-years route text is consistent with Anatoliy's CA record, but IDFPR makes the issuance decision.
6. StateCourse must obtain Illinois foreign-LLC authority, an education-provider license, a virtual-office license/registration, active Illinois instructor, and course licenses.
7. A provider offering endorsement must provide all seven required pre/post courses. The seven are the two Broker prelicense courses, three Broker post-license courses, and two Managing Broker prelicense courses.
8. The clean online architecture is **Online Distance LMS**, not Home Study/Correspondence. Rule 1450.1175 requires recorded responses, 75% comprehension, no more than 250 questions per course, randomized retries, start/end identity verification and five-year retention.
9. Each of the three 15-hour post-license courses has its own 50-question exam at a minimum 75%; the online-distance final-exam waiver does not apply to them.
10. Provider/course/instructor licenses expire June 30 of odd-numbered years. Completion reporting is due by the 15th of the following month; records are retained at least five years.

## Facts specific to the user

- California legal resident since 1994; never licensed in another state, per user.
- California DRE Broker license 01385024; public record shows licensed, Broker issued 2009-07-16, expiration 2029-11-15 and no public discipline.
- StateCourse LLC California entity B20260376786, formed 2026-08-18.
- User supplied a California Certificate of Status executed 2026-09-03. LLC-45.5 requires the formation-state certificate to be authenticated within 60 days; submit promptly. The PDF and certificate number were not committed.
- FEIN exists but is intentionally not stored here.

## Official forms and fees

- Form 505-0347 Rev. 7/25: Broker endorsement $150; Managing Broker $175.
- PSI booklet dated 2026-06-24: Broker examination $58; unlimited Broker Endorsement attempts within the two-year eligibility period; IDFPR application within one year after passing. Verify the exact live endorsement product/price.
- Form 505-0767 Rev. 3/2025: education provider $1,050.
- Form 505-0645 8/25: one pre/post course application, $150 per course.
- Rule 1450.130(f)(16): education-provider virtual office $200 initial.
- Illinois SOS Form LLC-45.5, March 2026: foreign LLC admission $150 plus an Illinois registered agent/office.
- Instructor application: $150; training tuition and PSI charge are separate.

The known government filing subtotal for foreign LLC + provider + virtual office + seven courses + one Broker endorsement course + instructor application + personal Broker endorsement is $2,850. This excludes third-party services, training, course tuition and exam charges.

## Unresolved questions

1. Does IDFPR classify California Broker as Illinois Managing Broker equivalent, and what evidence proves two immediate years of managing practice?
2. May a new provider file the seven mandatory course applications and optional endorsement course simultaneously?
3. What exact current form/ePay selection attaches the $200 education-provider virtual-office application to Form 505-0767?
4. Will a certified California DRE history alone satisfy the instructor expertise route, or does IDFPR want additional practice evidence?
5. What is the current PSI instructor-exam fee and exact scheduling product? The June 2026 booklet does not clearly list that fee.

The safe build does not need answers 1 or 5 to start portfolio architecture. Answers 2-4 affect submission sequencing and evidence.

## External blockers

- Illinois registered agent/registered office not yet obtained.
- Illinois LLC admission not yet filed.
- Certified California DRE license history not yet in this workstream.
- Approved 12-hour instructor training not selected/completed.
- Instructor exam not passed and license not issued.
- Seven full curricula, assessments, timed outlines, materials and LMS evidence not authored.
- IDFPR provider/virtual-office/course approvals not issued.
- Written regulator answers above not received.

## Exact next actions

### User

1. Engage an **Illinois** registered agent; the Florida Northwest appointment does not cover Illinois.
2. File LLC-45.5 in duplicate with $150 and the September 3 California Certificate of Status while it is within 60 days.
3. Select a 12-hour instructor program only from IDFPR's current approved registry.
4. Order certified California DRE license history for license 01385024.
5. Complete instructor training/exam and submit the $150 IDFPR portal application.
6. If personal Illinois Broker licensure is desired now, take an existing approved 30-hour Broker endorsement course, pass the Illinois-law exam, and assemble Form 505-0347. Apply inactive unless an Illinois sponsor is intentionally chosen.

### StateCourse build team

1. Get written answers using `submission/06-regulator-questions.md`.
2. Freeze the complete source set for the 75h, 45h, and 45h managing-broker curricula before authoring.
3. Build all seven mandatory courses with page/screen traceability, timed outlines, activities, required finals and answer keys.
4. Implement and test the Online Distance LMS evidence model, regulator portal, five-year retention and monthly completion export.
5. Insert the issued instructor credential; assemble one immutable package per course.
6. Run an updated source recheck and form revision audit immediately before paying any nonrefundable fee.

## Three traps not to rediscover

- The PSI Broker endorsement paragraph accidentally says “Managing Broker.” The statute, rule, form, heading and listed qualifications all show it is the Broker route.
- A “30-hour” endorsement course is 30 credit hours: 1,500 instructional minutes plus 300 break minutes. Breaks are not instruction.
- Remote-proctor language in the rule does not safely erase the Act/form's in-person condition for **home study**. Avoid the conflict by applying as Online Distance LMS.

## Verification

Run:

`node scripts/verify-illinois-phase0.mjs`

`node --test tests/illinois-phase0.test.mjs`

The verifier fails if source IDs are missing, soft-404/title/content validation flags are absent, requirement statuses are uncontrolled, required artifacts disappear, sensitive identifier patterns are committed, an unqualified StateCourse approval claim appears, or enrollment stops failing closed.

Results at handoff:

- Illinois verifier: **PASS** — 19 locked sources, 37 requirements (33 confirmed, 1 interpretation, 3 regulator-confirmation), 20 controlled files, enrollment blocked.
- Illinois tests: **11/11 PASS**.
- Full repository test command: **1050/1087 pass; 37 fail outside the Illinois files**. The failures include absent generated public/dist artifacts, absent `node_modules` mutation workspace, and pre-existing Arizona/Missouri date assertions. They were not repaired in this isolated state workstream.
- Repository build: **not runnable in this clone**; `npm run build` exits 69 because `vinext` is unavailable and directs the operator to complete `npm run install:ci` first. No dependency install or shared build-script change was made.
- The full suite rewrote `california/submission/02_Real_Estate_Practice/07-sb1495-traceability.md` as a side effect. That file was restored immediately. Never commit that side effect from the Illinois branch.
