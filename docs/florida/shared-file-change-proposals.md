# Florida — proposed changes to shared files

> **Phase 0 v2.** Two changes: §1's registry table has been corrected (v1 recorded
> `live_online_allowed` as already `true`; it is `null`), and §6 is new — the documented build is
> broken on `main`.

**Nothing in this document has been applied.** Every change below touches a file that Texas,
California or another jurisdiction also depends on, and the Texas workstream is active in a separate
session. Editing a shared registry or a shared engine while another state is mid-build is how two
sessions produce a conflict neither of them can review, so Florida Phase 0 writes the changes down
instead and leaves the files alone.

Each proposal gives the file, the current value, the proposed value, and the Florida authority the
proposed value comes from. Nothing here is a guess: a field whose answer was not found in the
authorities is recorded as not found rather than filled in.

---

## 1. `public/statecourse/data/state-registry.json` — the FL record

The Florida record currently carries placeholders — `null`, `"Regulator research pending"`,
`"Pending official-source research"` — across nineteen fields. Phase 0 can now supply real, cited
values for most of them.

**Two fields deliberately do not change.** `provider_status` stays `"Not Started"` and
`public_status` stays `"Coming Soon"`, because StateCourse holds no Florida credential and enrolment
must stay disabled. `provider_approval_number` stays `null`. Filling in the research fields must not
be allowed to drift into implying a status that does not exist —
`tests/florida-foundation.test.mjs` and `scripts/florida-source-lock.mjs` both fail if it does.

| Field | Current | Proposed | Authority |
|---|---|---|---|
| `regulator_name` | `"Regulator research pending"` | `"Florida Real Estate Commission, Division of Real Estate, Department of Business and Professional Regulation"` | Ch. 475 F.S.; Rule Ch. 61J2 F.A.C. |
| `regulator_url` | `null` | `"https://www.myfloridalicense.com/DBPR/real-estate-commission/"` | Department's own site; returned HTTP 200 on 2026-08-30. `https://www2.myfloridalicense.com/real-estate/` also reachable. |
| `allowed_delivery_methods` | `[]` | `["classroom", "live streaming or video conferencing", "distance learning"]` | Rule 61J2-3.008(2)(b)-(c); s. 475.451(5), (9) F.S. |
| `asynchronous_online_allowed` | `null` | `true` | s. 475.17(2)(a)2 F.S.; Rule 61J2-3.008(4)(b)3 |
| `live_online_allowed` | `null` | `true` | Rule 61J2-3.008(2)(b): classroom hours include hours delivered live by an instructor "by a live streaming or any means of video conferencing technology while the students are in attendance". (2)(c) requires the school to submit delivery method and software platform details at course submission. |
| `classroom_allowed` | `null` | `true` | Rule 61J2-3.008(2)(b) |
| `ARELLO_required` | `null` | `false` | **Read this one carefully.** No ARELLO certification requirement appears anywhere in Chapter 475 F.S. or Rule Chapter 61J2 F.A.C. as read on 2026-08-30. `false` here means *not found in the authorities read*, not *affirmatively abolished*. |
| `ARELLO_status` | `"Not evaluated"` | `"Not required by any authority read (Ch. 475 F.S.; Rule Ch. 61J2 F.A.C., 2026-08-30)"` | as above |
| `instructor_approval_required` | `null` | `true` | s. 475.451(2)(b) F.S. — an instructor permit is required, by one of three routes |
| `prelicense_hours` | `null` | `63` | s. 475.17(2)(a)1 F.S.; Rule 61J2-3.008(1) — 63 hours of 50 minutes each, inclusive of examination |
| `course_approval_required` | `null` | `true` | Rule 61J2-3.008(4)(b) |
| `reporting_requirements` | `"Pending official-source research"` | `"A course completion certificate is issued to the student on satisfactory completion and is presented by the applicant at the scheduled state examination (Rule 61J2-3.015(1), (6)(a) F.A.C.). Electronic delivery to the student is permitted (61J2-3.015(5))."` | Rule 61J2-3.015 |
| `record_retention_period` | `"Pending official-source research"` | `"Two periods, over two different sets of records. 3 years: registration records, course rosters, attendance records, a file copy of each examination and progress test, and all student answer sheets (s. 475.451(8) F.S.). 5 years: the school's copy of each course completion certificate (Rule 61J2-3.015(6)(f) F.A.C.)."` | s. 475.451(8) F.S.; Rule 61J2-3.015(6)(f) |
| `refund_policy_rules` | `"Pending state/course configuration"` | `"No school refund rule was found in Ch. 475 F.S. or Rule Ch. 61J2 F.A.C. as read on 2026-08-30. Note the constraint that does exist: Rule 61J2-17.013 F.A.C. construes any promise of a refund on failing the Department's examination as a prohibited guarantee under s. 475.451(3) F.S., so a refund policy may not be conditioned on examination outcome."` | Rule 61J2-17.013; s. 475.451(3) F.S. |
| `enrollment_period` | `"Pending official-source research"` | `"No student enrolment-period rule was found. What is time-bound is the course approval: 24 months, renewable on application made no more than 120 days before expiry (Rule 61J2-3.008(4)(c) F.A.C.). Students must be told the course number and course expiration date upon enrolment."` | Rule 61J2-3.008(4)(c) |
| `final_exam_rules` | `"Pending official-source research"` | `"70% or higher constitutes satisfactory completion. At least two forms, no more than 15% shared items, a unique answer key per form citing the page numbers each item and answer rest on. At least 70% of items application level, no more than 10% knowledge level. All items multiple choice with four answer choices. Examination order may not follow the course order and items may not refer the student to the course material. Timed, with overall time not exceeding 1.8 minutes per item. No hint, back or retry function. No student may reach it without completing all sessions of the syllabus. On failure: a 30-day wait, one retake within a year of the original examination, then the course is repeated; a different form each time."` | Rule 61J2-3.008(4)(a), (4)(b)3.i, (4)(d), (6); s. 475.17(2)(a)2 F.S. |
| `proctoring_rules` | `"Pending official-source research"` | `"Not required. s. 475.17(2)(a)2 F.S.: satisfactory completion of a distance learning course requires a timed distance learning course examination, and 'such examination shall not be required to be monitored or given at a centralized location.' Timed, but neither monitored nor sited. Do not cite s. 455.2123 F.S. for this — that section concerns continuing education."` | s. 475.17(2)(a)2 F.S. |
| `certificate_rules` | `"Pending official-source research"` | `"The certificate carries eleven prescribed fields: name of school, school license number, address of school, course title 'Course I', course number, start date, finish date, exam date, student name, student address, and an authorized signature for the school. It carries the Commission's prescribed completion sentence. The original goes to the student; the school keeps a copy for at least five years, in any readily retrievable electronic or digital format."` | Rule 61J2-3.015(5), (6)(a), (6)(f), (7) |
| `notes` | unchanged | unchanged | — |
| `provider_status`, `public_status`, `provider_approval_number` | **unchanged** | **unchanged** | StateCourse holds no Florida credential |

### Knock-on effect once this lands

`marketing/state-intros/FL-florida.md` is generated by `scripts/generate-state-intro-scripts.mjs`
and currently reads **"NOT READY TO RECORD"**, because the registry holds no verified regulator name,
source URL, hour requirement, or delivery methods. Applying the table above supplies all four, so
regenerating will replace that file with a recordable script.

That is a real consequence and should be a deliberate step, not a side effect: a script becomes
recordable the moment the data supports one, and the resulting video would be the first public
Florida artifact. Run `node scripts/generate-state-intro-scripts.mjs` as its own reviewed change, and
check the output states availability from the registry rather than implying a course exists.

---

## 2. `config/approval-verification.mjs` — a Florida entry

The file carries `VERIFICATION_PROCEDURES` for CA and VA — how a member of the public checks a
StateCourse claim in the regulator's own records. Florida needs an entry, and it needs to be written
the way the Virginia entry was written rather than the California one.

**Why: the lookup could not be run.** The Department's public licensee search at
`myfloridalicense.com/wl11.asp` timed out on every attempt from this environment on 2026-08-30. The
California entry walks the reader through the DRE's screens step by step because those screens were
actually opened. The Virginia entry deliberately does not, and says why. Florida is in Virginia's
position.

Proposed shape:

```js
FL: {
  regulator: "Florida Real Estate Commission, Division of Real Estate, Department of Business and Professional Regulation",
  lookupLabel: "DBPR licensee search",
  lookupUrl: "https://www.myfloridalicense.com/DBPR/",
  reviewedOn: "2026-08-30",
  steps: [
    "Open DBPR's public licensee search. Real estate school permits, instructor permits and licensees are Department records.",
    "Search for StateCourse. A school that holds a permit appears as a Department record; one that does not, does not.",
    "Check the date on the record as well as its existence.",
  ],
  /* Deliberately not written as a numbered path through the search's own screens. The Department's
     licensee search timed out on every attempt when this entry was written, and no StateCourse
     record exists in Florida to check a path against. Describing a search nobody ran would be the
     kind of confident detail this page exists to avoid. The exact path is published with the
     permit. */
  note: "Section 475.451(3), Fla. Stat. bars a school from suggesting that the Department, by authorising it to operate, has thereby endorsed or recommended it. Holding a school permit means the Department allowed the school to offer courses; it is not a judgement about their quality.",
}
```

That last sentence is worth having because it is the honest reading of what a Florida permit means,
and because the statute specifically forbids the school from suggesting otherwise.

*(The `note` above is worded to state the prohibition without reproducing the statute's own phrasing
verbatim. That is not squeamishness: `scripts/florida-source-lock.mjs` scans this directory for
forbidden claims, and the statutory phrase matches its own pattern. The lock's docstring explains
why the scan excludes material that transcribes the authority and includes material StateCourse
writes in its own voice — this file is the latter, so it is written to pass its own check. The
verbatim statutory text is in `florida/regulatory/primary-text-readings.md`.)*

---

## 3. `public/statecourse/data/course-catalog.json` — a Florida course record

The catalog holds 30 courses and no Florida entry. One is eventually needed, and it must carry
**build status without approval status and without enrolment**:

```json
{
  "course_id": "fl-sales-associate-course-i-63-v1",
  "state_id": "FL",
  "program_type": "prelicense",
  "course_title": "Florida Sales Associate Pre-License Course — FREC Course I",
  "regulator": "Florida Real Estate Commission",
  "required_hours": 63,
  "approved_hours": null,
  "delivery_method": "distance learning",
  "approval_status": "Not Submitted",
  "approval_number": null,
  "approval_date": null,
  "expiration_date": null,
  "instructor_id": null,
  "enrollment_enabled": false
}
```

`instructor_id` is `null` and stays `null` until a Florida instructor permit exists, because Rule
61J2-3.008(5)(b) makes the named permitted instructor a course-level fact students must be given.

**Do not add this record until there is a course to describe.** A catalog entry is a public surface;
one pointing at a course that has not been authored is a promise. Adding it is Phase 2 work at the
earliest.

---

## 4. `tests/state-record-citations.test.mjs` — Florida citation patterns

The test holds one entry per built jurisdiction, with citation forms distinctive enough that finding
one inside another state's record is a defect rather than a coincidence. Florida needs an entry when
the registry record above lands:

```js
FL: [/\bFla\. Stat\./, /\b61J2-/, /Florida Real Estate Commission/i, /\bFREC\b/],
```

`61J2-` is safely distinctive. `\bDBPR\b` is **not** proposed: it is a department-wide acronym that
could legitimately appear in a non-Florida context, and the test's own docstring explains why shared
forms are excluded — bare `DRE` is left out for exactly that reason, because California and Colorado
both use it.

---

## 5. `scripts/regulatory-source-lock.mjs` — the shared lock is California-only

The shared lock imports `config/california/regulatory-manifest.mjs` directly and checks California
authorities, DRE forms and the BPPE exemption. It is a California lock with a general name.

Texas solved this by writing `scripts/texas-source-lock.mjs` rather than generalising the shared one,
and Florida has followed the same precedent with `scripts/florida-source-lock.mjs`. That is three
locks with substantially the same skeleton, which is a duplication worth naming even though
resolving it now would be wrong.

**Proposed, and explicitly deferred:** extract the common skeleton — reachability, held-copy
hashing, drift-versus-failure reporting, verification-window checks, forbidden-claim scanning — into
a shared module that each state's lock supplies its manifest to. Not now. That refactor touches the
California and Texas locks, both of which are load-bearing for jurisdictions further along than
Florida, and it should not happen while the Texas workstream is active. Florida's lock is written to
be readable next to the other two so that whoever does the extraction can see the shape.

No change is proposed to `tests/regulatory-source-lock.test.mjs`, which tests the California lock.

---

## 6. `scripts/build-verified.sh` — the documented build is broken on `main`

Found while establishing the Florida regression baseline. Not a Florida issue, recorded because
Florida discovered it and because it blocks any honest claim that the platform is green.

Line 23 of `scripts/build-verified.sh` runs:

```bash
node "${script_dir}/sync-california-pdf-downloads.mjs"
```

**That file does not exist and never has.** `git log --all -- scripts/sync-california-pdf-downloads.mjs`
returns nothing, and `git cat-file -e origin/main:scripts/sync-california-pdf-downloads.mjs` fails.
So `npm run build` aborts with `MODULE_NOT_FOUND` on `main`, after `generate-national-platform.mjs`
has run and before `vinext build`. Nineteen tests fail on both `main` and this branch as a direct
consequence — see `docs/florida/regression-baseline.md`.

**Proposed, and explicitly NOT applied:** either restore the missing script, or remove the line if
the California PDF sync is no longer part of the build. Which of those is right depends on
California's intent, and the file sits between California and Texas in a way Florida should not
adjudicate. Repairing a shared build script while the Texas workstream is actively pushing to `main`
is exactly what Florida's isolation rules exclude.

Note the precedent immediately above it in the same file: the `export-california-source-temp.mjs`
line was **removed** on 2026-08-20 with a comment explaining why, rather than being restored. That
may be the intended treatment here too.

---

## 7. `package.json` — no change needed

The `test` script runs `node --test tests/*.test.mjs`, so `tests/florida-foundation.test.mjs` is
picked up by the existing glob. Noted here so nobody adds a Florida entry that was never required.

---

## Application order, when the time comes

1. **§1, the registry record** — the foundation everything else reads from.
2. **§4, the citation test entry** — land with or immediately after §1, so the new record is guarded
   from its first commit rather than retrospectively.
3. Regenerate `marketing/state-intros/FL-florida.md` as its own reviewed change, and read the output.
4. **§2, the verification entry** — independent of the others; can land any time.
5. **§3, the catalog record** — Phase 2 at the earliest, and only once a course exists.
6. **§5** — deferred, and not while Texas is active.
7. **§6, the broken build script** — needs a decision from whoever owns the California build, not
   from Florida.

Steps 1, 2 and 4 are the only ones that make sense during Phase 0, and all three touch files Texas
also depends on. They should be applied in a single reviewed change once the Texas workstream is at
a point where a shared-file edit will not collide with it.
