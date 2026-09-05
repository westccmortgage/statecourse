# Washington handoff

## State

- Branch: `relay-washington`
- Phase 0: **complete on 2026-09-04**
- Submission readiness: **NO-GO**
- Enrollment/payment/credit/certificates: **closed**
- School/course/instructor/distance approvals: **none claimed or recorded**
- Curriculum authoring after this audit: **not begun**

Run `node scripts/washington-phase0-report.mjs` for the current inventory/gates and
`node scripts/washington-source-lock.mjs` for live source/content/hash validation.

## Do not rediscover these four things

1. **The 60/30 split is not a StateCourse proposal.** DOL currently publishes a 60-hour Fundamentals
   curriculum (Rev. 5/2022) and 30-hour Practices curriculum (effective 03-18-2009). Both are byte-locked.
2. **The inherited Practices course is not the prescribed course.** It is an agency-law course with major
   gaps in business skills, valuation, negotiation, contracts/earnest money, finance/closing and math.
3. **A California Broker may request Managing Broker reciprocity, but DOL decides equivalence.** Same-or-
   lesser level is current guidance; WAC 308-124A-720 requires same or greater capacity. Never call the
   Managing Broker result automatic.
4. **Education approval is not a PVS exemption.** No blanket real-estate-school exemption was found in RCW
   28C.10.030. Get a written Workforce Board determination before enrollment.

## User-specific routes

The user reports California residence since 1994, California broker licensure since 2009, and no other
state license. Personal license route: official DRE history → Managing Broker reciprocity exam approval →
Washington-law exam ($210) → fingerprints → DOL notice → license application ($330 within one year).
Fallback is the lesser Broker level if DOL rejects equivalence.

Instructor route has two independent parts. Subject competency plausibly uses RE-623-125's three-active-
years-within-five-years option, but DOL must confirm a California credential counts. Teaching-technique
qualification still needs proof, most plausibly approved instructor training plus two years of recent
full-time real estate/related-field experience. Instructor fee is $114.

The school route uses RE-623-121 (R/12/25), required publication, course descriptions, administrator resume,
accepted entity/UBI proof and $380. A brokerage firm/designated broker is a separate regime, not a stated
school prerequisite. Course route uses RE-623-137 (R/10/25), $456 per prescribed course, one inclusive PDF
each. Distance route uses BPD-600-002B (R/9/21) or school-specific ARELLO certification plus clock-hour
enforcement.

## Internal blockers

- objective-level traceability to every prescribed Fundamentals and Practices objective;
- substantive reconstruction of Practices and targeted Fundamentals remediation;
- 180-item Fundamentals final and 90-item Practices final with keys and source pinpoints;
- active-instruction/clock-hour evidence;
- inactivity shutdown, identity controls and dual written certification;
- approved-instructor availability and tested administration/records workflows.

## External blockers

- DOL decision on California-to-Washington Managing Broker equivalence;
- official California DRE license history;
- DOL written answer on California license evidence for instructor subject competency;
- instructor-technique proof;
- DOL answer on foreign California LLC and required 16-digit UBI;
- Workforce Board PVS applicability determination;
- DOL school, instructor, two course and distance-method approvals/identifiers.

## Fixed sources and forms

Machine record: `config/washington/regulatory-manifest.mjs`. It stores authority class, exact official URL,
effective/revision status, retrieval date, pinpoint, evidence and claim classification. Six PDFs are SHA-256
pinned: both curricula plus school, instructor, course and distance forms. Live lock checks document type,
content marker, soft-404 text and byte drift, not merely HTTP 200.

Forms/current revision: school RE-623-121 R/12/25; instructor RE-623-125 R/8/23; course RE-623-137 R/10/25;
distance BPD-600-002B R/9/21. Base DOL education filing total is $1,406 before entity/PVS/ARELLO/ancillary
costs. The DOL planning figure is 45 days per original application, not an approval promise.

## Next build order

1. Send and archive the two written regulator requests in `submission/regulator-questions.md`.
2. Build objective IDs and two source-to-module/time/assessment matrices.
3. Rewrite Practices, then remediate Fundamentals.
4. Paginate/freeze instructional materials.
5. Author finals and keys against final page pinpoints.
6. Implement/test distance and records controls.
7. Assemble one inclusive PDF per course and revalidate current forms/sources immediately before filing.

Do not author answer-key page citations before the curriculum is paginated. Do not freeze, publish or open
enrollment merely because Phase 0 is complete.

