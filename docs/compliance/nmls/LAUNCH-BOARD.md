> October 19, 2026, Los Angeles: approved source reconciliation preserves the newer PR #26 Core transport and the published lesson-open coach guard on main. Paid Core calls remain OFF. Lint and actual entitlement restoration are verified; AK/TX citation/sponsorship findings passed four repeated source-reviewed samples on f770fad; broader coach quality and the separate Mortgage Reg B finding remain open. See `docs/audits/COACH-AK-TX-CORRECTION-2026-10-20.md`. See `docs/audits/COACH-CORE-PRESERVATION-2026-10-20.md`.

# NMLS Launch Board

## School call email delivery verified — 2026-11-21

Owner requested all school assistant messages at `info@statecourse.com`, without
CRM routing. A separate signed callback, school-only event checks and a Netlify Forms
email route are published. The confirmed school inbox received the actual test
message at 10:52 Pacific; ElevenLabs recorded HTTP 200 and Forms accepted it.
The greeting and public number label now use Virtual assistant. Evidence is in
[the route record](../../student-portal/phone-email-routing.md). No course,
credit, payment, student Auth or BioSig control changed.

## School phone receptionist and contact publication — 2026-11-21

The owner authorized an AI school receptionist on `775-373-6657` and requested
that the website retain `310-686-5053` as **Live line** while adding the new number
as **AI assistant line**. ElevenLabs/Twilio assignment is saved; the owner's real
97-second inbound call completed and the owner confirmed normal operation.
Five language/tool paths, structured message extraction and the free-practice
registration CTA were checked in text conversations. Actual telephone audio in
every supported language, automated email/SMS delivery, live transfer and paid
promotion terms are not verified/enabled. This does not open course enrollment,
credit, payments or BioSig-ID. No SQL or Netlify secrets changed.

The inherited shared CRM post-call route was identified after three setup events
were delivered. It is now overridden only for StateCourse using a dedicated
disabled school webhook. A fresh v4 conversation retained its history/summary
without a corresponding new outbound delivery. Other agents and the shared
default were not modified. See [prompt, routing and test evidence](../../student-portal/phone-receptionist.md).

Contact publication starts from production commit
`2ed779c610e14de7bf5f2256542ddc7c7c12b6c8`, deploy
`6b01d01312ff66be7973e6d0`. Build and 18 existing public-page checks plus five
build privacy gates pass; both phone labels and dial links are present on all 90
built pages containing the existing phone. Live site readback follows publication.

## Course-entry publication observed — 2026-11-21

Production publication succeeded: revision `8e11c5287af7488f0bc124fbaf8886d5dc8096cc`,
Netlify deploy `6b01cb2c93d6b0a286fe2f1c`, published 2026-11-21 08:48:32 Pacific
at `https://statecourse.com` (site `b514a8f8-782b-448c-8881-a914ee42c69b`).
The GitHub source tree equals the validated local tree.

Observed in the production browser: the homepage's two destinations, three goal
cards in both verticals, Mortgage Renewal/CA navigation into signup with its
selection and BioSig sequence retained, and Real Estate Free Practice/CA signup
without renewal identity requirements. No account was submitted. The new learning
path endpoint responds `method_not_allowed` to GET; the BSI callback is inactive
(`Not Found`). Public payment configuration reports zero available non-QA credit
offers and successful training discovery. No payment or identity flag was changed.

A final navigation correction follows this first successful publication: Course
Finder in signup and sign-in now returns Mortgage visitors to Mortgage rather
than Real Estate, using their existing continuation context. Targeted interaction
and sign-in recovery tests cover this correction before its production build.

Unverified: complete email-confirmation/account creation, authenticated notification
and NMLS-ID persistence, actual practice enrollment, mobile/tablet layout, real BSI
round trips and ordinary credit-student admission. Direct command-line HTTP probes
received 403; the rendered browser routes above worked. This publication does not
close regulatory or commercial credit-launch gates. No production SQL or secrets
were applied; BSI activation still awaits the vendor secrets expected November 23.

## Course-entry publication authorized — 2026-11-21

The owner explicitly authorized publishing the prepared homepage, vertical entry,
registration/notification and Renewal/NMLS-ID changes to `https://statecourse.com`.
Publication starts from the verified production main revision
`ca139117e953b18a2bb6bdbc16e15761dc574a1e`, Netlify deploy
`6b0136d8a66d1152a407f684`, site `b514a8f8-782b-448c-8881-a914ee42c69b`.
The source changes are the reviewed `codex/course-entry-registration` work only.

No SQL, secrets, payment/credit enablement, BSI activation or environment values
are included in this publication. BioSig connection still awaits BSI's secrets
expected 2026-11-23. This section records authorization, not deployment success;
the following local-only sections describe prepublication verification. Production
deploy identity and public navigation/auth refusals must be checked after publish.

## Renewal registration and BioSig placement — 2026-11-21, local only

Owner direction: require the learner's NMLS ID for real Renewal/CE registration;
keep Free Practice separate. BSI secrets are expected Monday, 2026-11-23. None
was entered, fetched, printed or sent, and no production setting or SQL changed.

- The Mortgage Renewal signup page now explains: account confirmation, personal
  NMLS ID and available CE enrollment, Rules of Conduct, BioSig-ID, first lesson.
  The first BioSig step is within the course after ROC, not during free-account
  creation. Existing Middle, Resuming and FinalExam checks are retained.
- When a live, non-QA mortgage CE offer exists, the existing entry page requires
  saving the NMLS ID through the authenticated profile endpoint before showing
  its course-registration links. Checkout independently reads the authenticated
  learner's stored ID before writing payment attempts or calling Stripe. Client
  identifiers are not accepted as checkout authority. Saving a number is not
  verification that it belongs to the learner.
- Practice, availability notifications and account creation acquire no ID or
  BioSig prerequisite. A real-estate renewal does not acquire an NMLS requirement.
- **Activation remains incomplete.** The existing identity/course endpoints are
  reviewer-only. Adding BSI secrets does not itself admit ordinary credit students,
  supply course approval or enable CE commerce. Confirm migrations 030–033,
  callback configuration, BSI activation and checkpoint/return behavior under
  separate production authorization; regular credit-student admission and the
  NMLS CE commerce path still need explicit implementation/acceptance before launch.
- Verification: 149 targeted tests pass, plus 5 build privacy checks. One existing
  migration-031 PGlite test is skipped because PGlite is unavailable; no SQL is
  changed and no database acceptance is claimed. The actual signup page was
  inspected in the managed desktop preview: the renewal sequence is visible for
  Mortgage Renewal and absent for Free Practice. No account was submitted and
  no BSI/network identity check was performed. Mobile and live end-to-end behavior
  remain unverified.

Primary sources read 2026-11-21:
[BSI first-time enrollment](https://setup.biosig-id.com/portal/en/kb/articles/nmls-first-time-enrollment)
and [NMLS Functional Specifications 5.6](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OSS_IDAuth.html).

## Course entry and registration funnel — 2026-11-21, local only

Branch `codex/course-entry-registration`, based on main `ca139117`. Built locally;
not pushed, merged, deployed, or verified against production. No SQL or hosted
configuration changed. This does not close a regulatory or production launch gate.

- Homepage has two destinations: Real Estate and Mortgage / NMLS. The real-estate
  state finder is inside Real Estate. Each vertical presents Free Practice,
  Get Licensed, and Renew My License / CE before supplementary course details.
- State/vertical/goal survives signup, email-confirmation continuation and sign-in.
  A session-bound endpoint records the choice in existing `licensing_navigator_state`.
  Only an explicit Notify Me action records versioned availability-email consent.
  This change records notification requests; no availability mailing was sent or
  automatic mailing worker introduced.
- Public real-estate practice now directs anonymous visitors through signup.
  Mortgage practice uses existing governed, non-credit training enrollment, with
  no NMLS-ID prerequisite. Unknown service availability produces a retry message.
  Credit offers require matching state/goal and live, non-QA checkout eligibility;
  server approval, payment, identity and credit controls remain authoritative.
- Local verification: 190 targeted backend, interaction and regression tests pass,
  plus the 5 build privacy checks. The build scanned 656 files and found no private
  assessment leakage. Interaction tests use mocked Auth/database/enrollment transports.
- Desktop visual review subsequently **PASSED for the observed screens** through
  the supported managed preview: homepage with two destinations, both verticals
  with three goal cards, the state-selection form, and registration showing the
  selected Mortgage/CE/CA context. Screenshots were captured from the actual built
  pages. No form was submitted and no production service was contacted.
  Mobile/tablet layout, real confirmation email, authenticated enrollment and the
  separate automated browser suite remain unverified. The earlier direct Chromium
  launch and arbitrary-loopback attempts failed; the supported managed preview
  resolves only the desktop visual-review blocker.

Next: inspect mobile/tablet screens and execute authenticated acceptance in an
approved environment; obtain owner approval before production publication.

## BioSig-ID: BSI's answers to the eleven questions — 2026-11-21

Source: reply from BSI's Chief Technology Analyst, 2026-11-20 5:14 PM Pacific, read from
an owner-supplied screenshot of the email. Branch `claude/inspiring-lamport-wjsuvn`, not
deployed. Still switched off, still never connected. **This section supersedes the
"`uid` is unresolved" and `BIOSIG_UID_MODE` statements in the section below.**

| # | Question | BSI's answer | Effect here |
| --- | --- | --- | --- |
| 1 | `uid` | A real licensee is identified by their NMLS ID, a plain number. Test accounts must never use an identifier that could be a real ID, so they carry a prefix; alternatively the provider ID as a numeric prefix (`1405133000000001`). Use the same approach on sandbox. | Built: licensee -> NMLS ID; test account -> `StateCourse-001`, or `1405133000000001` with `BIOSIG_TEST_UID_FORMAT=provider_numeric`. `BIOSIG_UID_MODE` is removed. |
| 2 | Reviewer accounts' `uid` | "NMLS will tell you, we don't control that." | **Open, with NMLS (SRR).** Until NMLS names them, reviewer accounts are treated as test accounts. Set `BIOSIG_REVIEWER_UIDS` when NMLS answers. |
| 3 | `d2` | Any value works on sandbox; what matters is that we control it and it is valid for production. | `d2=109386` kept until NMLS assigns a course number. |
| 4 | Checkpoint spacing; `Resuming` | Spacing "sounds about right", a rough indicator only. `Resuming` after logout or time-out. A return at a point that also needs Middle or FinalExam may be one combined stop, e.g. `Resuming-FinalExam`. Begin is always Begin. | Spacing unchanged (after modules 3 and 5 of 8). Combined names built; needs `database/033_nmls_identity_combined_checkpoints.sql` (**not applied**). |
| 5 | Custom argument returned in callback | Confirmed, as documented. | No change. Whether the callback carries `ts` was not answered; it is checked when present. |
| 6 | One callback address for sandbox and production | Yes; the interfaces are separate and may point to the same address. | `https://statecourse.com/api/biosig/callback` for both. |
| 7 | `SSOInbound.aspx` vs `ssoinbound.aspx` | The server is case-insensitive. | Either works. |
| 8 | Key size | 128 confirmed; larger sizes planned with a TLS 1.3 upgrade next year. | No change. |
| 9 | Test vector | None available; the interface account does not exist yet. The NodeJS sample is fully functional. BSI asks for logging on our side and can supply detailed logs from theirs. | One diagnostic line per check started and per callback: outcome, checkpoint and our check ID. Never arguments, identifiers, email or key material. |
| 10 | Callback source | Addresses are static today but not guaranteed. Staging is `sandbox.verifyexpress.com`, production `verifyexpress.com`. | Allow both through Cloudflare; do not rely on one fixed IP. |
| 11 | Secrets before the meeting | No. | Shared code, key, salt and vector arrive at the meeting of 2026-11-23. Nothing can be tested against BSI before then. |

**Open after this reply:** question 2 goes to NMLS, not BSI. Production launch address
was not stated explicitly (the host is `verifyexpress.com`). No test vector exists, so the
first real proof is the live connection test at the meeting.

**Switch-on steps, current:** apply migrations 031, 032 and 033; set the BSI values and
`BIOSIG_PARTNER` (or `BIOSIG_INBOUND_URL`) in Netlify; register the callback address with
BSI; allow BSI's hosts through Cloudflare; set `NMLS_CREDIT_CHECKPOINTS=biosig`; redeploy.

## BioSig-ID: BSI's first answers applied — 2026-11-21

Branch `claude/inspiring-lamport-wjsuvn`, not deployed. Still switched off, still never
connected. From the owner's updated build specification, which reports an email from
BSI's analyst of 2026-11-20 (not read here):

- BSI has issued the System ID, the Customer ID and the sandbox launch address. They are
  deliberately not written in this repository; they are in the owner's specification and
  go into Netlify with the rest. The four secrets (shared code, pass phrase, salt,
  vector) are to be handed over during the meeting of 2026-11-23, when BSI also
  activates the interface account.
- **Address.** The partner path has two segments, which the first build would have
  rejected; `BIOSIG_PARTNER` now accepts `a/b`. BSI wrote the launch file name in lower
  case while its sample uses `SSOInbound.aspx`; set `BIOSIG_INBOUND_URL` to the exact
  address BSI gave to use it as written. It is accepted only over https on BSI's own
  domain.
- **`uid` is unresolved.** The NMLS interface specification says it is the student's own
  NMLS ID. BSI's analyst says production identifiers must be provider-prefixed
  (`StateCourse-001`). Both are built; `BIOSIG_UID_MODE` chooses (`provider_prefixed` or
  `nmls_id`). Sandbox defaults to `provider_prefixed` as BSI recommended. **Production has
  no default** and stays unavailable until the confirmed convention is set. Prefixed
  numbers come from `database/032_nmls_biosig_identifiers.sql` (**not applied**): one
  per student, assigned once, never changed or reused.
- **Callback address filtering.** BSI says its callback IP is not guaranteed static, so
  do not pin one address in Cloudflare long-term. A blocked callback shows up as a check
  that stays pending and expires after 20 minutes; nothing alerts on that yet.

To ask BSI on 2026-11-23: the `uid` convention for this NMLS course and for the reviewer
accounts; `d2=109386` until a course number exists; Middle checkpoint spacing; key size;
a test vector; the production launch address and callback source; whether the callback
returns our `statecourse_ref` argument and carries `ts`.

The switch-on steps in the section below now also include applying migration 032 (when
`provider_prefixed` is used) and setting `BIOSIG_UID_MODE`.

## BioSig-ID interface built, switched off, not connected — 2026-11-20

Branch `claude/inspiring-lamport-wjsuvn`. **Not deployed. No BSI value exists anywhere. No
request has been sent to BSI. Gate 3 is not closed.** Built ahead of the BSI meeting of
2026-11-23 at the owner's instruction, from BSI's NodeJS sample (`custom.code.zip`,
`Samples/NodeJS/`) and the owner's build specification of 2026-11-20. Earlier instruction
recorded on this board: per CSBS, no BioSig calls before that meeting and BSI's keys. That
still holds in effect: the code cannot build a request without all seven BSI values, and
it is off unless `NMLS_CREDIT_CHECKPOINTS=biosig`.

**What exists.**

| Piece | Where | Note |
| --- | --- | --- |
| BSI's helper, unchanged | `netlify/functions/_lib/biosig/interface-helper.mjs` | Class body identical to BSI's file; key is SHA-1 twice over pass+salt, 16 bytes. Output pinned against BSI's original. Do not modify. |
| Configuration | `config/nmls/biosig.mjs` | Environment only. Unavailable if any value is missing, left as a placeholder, or malformed. |
| Launch request | `netlify/functions/_lib/biosig/sso.mjs` | Argument string -> AES -> URL-encode -> `SSOInbound.aspx?args=`. No Base64 before encryption. NMLS fields `ls as d1 d2 d3 d4 d5` appended after `uid`. |
| Start a check | `POST /api/student/nmls/identity-check` | Closed reviewer enrollments only. Server chooses the checkpoint. |
| BSI callback | `GET/POST /api/biosig/callback` | Returns 404 while off. The only place a check is marked passed. Replies with `SSO_RESPONSE` XML. |
| Enforcement | `netlify/functions/_lib/biosig/checkpoints.mjs`, course endpoint | The course will not continue past a checkpoint without a check BSI verified; each verified check is used once. |
| Table | `database/031_nmls_identity_challenges.sql` | **Not applied.** Required before switching on. |

**Checkpoints (`d3`).** `Begin` before the first lesson; `Middle#1` after module F03
(3 of 8); `Middle#2` after module E02 (5 of 8); `FinalExam` at entry to each final
examination form; `Resuming` on every later return to study. The build specification
suggests Middle#2 near module 6 of 8; it is at 5 of 8 (250 of 400 minutes) as built.
Confirm the spacing with BSI and change `config/nmls/credit-review.mjs` if needed.

**To switch on, after BSI supplies the values (each step is a production change needing
the owner's approval):**

1. Apply `database/031_nmls_identity_challenges.sql` in the Supabase SQL editor.
2. Set in Netlify, values from BSI only: `BIOSIG_SYSTEM_ID`, `BIOSIG_CUSTOMER_ID`,
   `BIOSIG_SHARED_CODE`, `BIOSIG_PASS`, `BIOSIG_SALT`, `BIOSIG_VECTOR` (16 characters),
   `BIOSIG_PARTNER`. Optional: `BIOSIG_KEY_SIZE` (only 128 works), `BIOSIG_ENVIRONMENT`
   (`sandbox` default, or `production`), `BIOSIG_REVIEWER_UIDS`
   (`student-uuid=reviewer,student-uuid=reviewer2`).
3. Give BSI the callback address `https://statecourse.com/api/biosig/callback`.
4. Allow BSI's callback server through Cloudflare (the specification names `23.100.25.17`;
   confirm it is current).
5. Set `NMLS_CREDIT_CHECKPOINTS=biosig` and redeploy.
6. Compare our encryption with BSI's test vector before any student check.

**Not verified, and not verifiable before BSI's values exist:** any exchange with BSI;
the sandbox and production addresses; that BSI returns our `statecourse_ref` argument in
its callback (its README says prefixed custom arguments are returned unchanged; the
callback is refused without it); whether BSI's callback carries `ts`; that reviewer
identifiers `reviewer` / `reviewer2` and `d2=109386` are accepted; the callback IP; TLS
negotiation; Cloudflare behaviour.

**Known gaps.** The Rules of Conduct step is still a placeholder: the official text is
not in the repository, so `Begin` is not preceded by a real acceptance. A student already
inside a final examination who leaves and returns is not re-checked before submitting.
`Resuming` is sent as plain `Resuming`, without the optional context suffix. BSI's sample
reads the XML with `fast-xml-parser`; this build reads the four elements directly to
avoid a new dependency.

## Free training separated; reviewers' credit version built — 2026-11-20

Branch `claude/inspiring-lamport-wjsuvn`. Not deployed. No database change, no production
setting changed, no reviewer account provisioned.

**Portal fix of 2026-11-19 is live.** PR #28 was merged and the owner reports the student
portal working. That report is the evidence; the production site was not reachable from
the work session.

**Free training has its own section.** My StateCourse (`/student/`) now lists credit
courses, purchases, progress and certificates only. Free training, including the national
mortgage training, is at `/student/free-training/`, labelled "Free practice, no licensing
credit", and linked from `/free-practice/` and `/mortgage/`. The split is made by the
server from `enrollment_origin`; every enrollment is placed in exactly one section and no
enrollment or progress row is written, moved or reset by it.

**Credit version for NMLS reviewers (application 109386).** `/student/nmls-course/` and
`/api/student/nmls/course` present the same pinned course as "8 Hour SAFE Comprehensive:
2026 Mortgage Continuing Education", without free-training labels, inside My StateCourse.
Access is limited to enrollments the owner provisions with a reviewer role: one open
version (`regulator_reviewer`, read-only, free navigation) and two closed versions
(`student_reviewer`, the student experience). The endpoint refuses any other enrollment
at its first database read. `database/manual/nmls-review-accounts.sql` now takes one open
and two closed reviewer emails; **it has not been run**, so no reviewer can see this
version until the owner provisions the three accounts.

The credit version changes labels and adds checkpoint structure only. It cannot issue
credit, a certificate or a report, `courseApprovalId` stays null, payments stay disabled,
and public pages still say the course is not approved NMLS continuing education.

**Checkpoints are placeholders, off by default (Gates 3 and 4 not closed).** The sequence
is Rules of Conduct, BioSig-ID `Begin`, `Middle#1` (after module F03), `Middle#2` (after
module E02), `FinalExam`, and `Resuming` on return. They appear only when the Netlify
variable `NMLS_CREDIT_CHECKPOINTS` is exactly `placeholder`; there is no value that turns
on real verification. Each placeholder states that nothing is verified or recorded. No
BioSig-ID call, key, endpoint or SOAP client exists in the repository, per the CSBS
instruction to wait for the BSI meeting of 2026-11-23 and BSI's keys. The Rules of Conduct
text is not loaded: the genuine ROCS original is still not retained. `Middle#2` is added
at the owner's instruction; BioSig's own list of 2026-11-18 named `Middle#1` only, so
confirm the second middle checkpoint with BSI.

**Open against SRR's access requirement:** provisioning the three reviewer accounts;
BioSig-ID and Rules of Conduct (placeholders only); human review and duration validation.

## Course application 109386 opened; student portal defect found — 2026-11-19

**Submission status changed.** The owner initiated a course application in the NMLS
Education Management System. Read from owner-supplied screenshots on 2026-11-19, not
independently retrieved:

| Field | Value |
| --- | --- |
| Application ID | 109386 (type New) |
| Course name | 8 Hour SAFE Comprehensive: 2026 Mortgage Continuing Education |
| Category / method | CE Comprehensive / Online Self-Study, 8 requested hours |
| Course number | TBD — none assigned |
| Course status / application status | Pending / Awaiting Documents |
| Basecamp milestone | Application Materials Due (#109386), calendar date 2026-11-24 |

The SRR notice of 2026-11-19 (Jessica Esquina) asks for all course materials and the
application form in Basecamp **within 2 business days**, then a message to SRR Staff to
start review. For online courses it requires that the course be loaded in the LMS and
that SRR can reach **two student versions and one open version**; it states the
application is denied without review if they cannot access the course.

**This is an open application, not approval.** No NMLS course number exists,
`courseApprovalId` stays null, and enrollment, payment, credit, certificate and reporting
controls are unchanged. Gate 6 moves from not submitted to application open, documents
outstanding.

**Defect that blocks reviewer access.** The admin console reported "The training delivery
engine has not passed its current database definition check", and the student portal
would not open the course. Cause, established from the repository: commit `bc6bad5`
(2026-11-17) put the provider ID into the training-definition manifest
(`config/nmls-training-definition.mjs`). The delivery engine opens only when that
manifest is identical to the immutable row migration 025 stored on 2026-09-13, where
`providerApprovalId` is null, so every readiness check has failed since that deploy.
The existing tests mocked the database with the code's own value and could not see it.

Repair on branch `claude/inspiring-lamport-wjsuvn`: the manifest's two approval fields
are pinned back to the stored values (provider approval stays recorded in
`config/nmls-course-identity.mjs` and in the readiness report), and a new test compares
the authored definition with the row inside `database/025_nmls_free_training.sql`. That
test was shown to fail with the defect present. No database change is needed or made.
**Not verified in production:** the production database was not reachable from the
repair session, so the stored row was not read back, and the fix is not deployed. The
portal must be opened with a real student login after deploy before SRR is told the
course is accessible.

**Still open against the SRR access requirement, none of it changed here:** the two
student accounts and one open version for SRR are not provisioned; BioSig-ID (Gate 3)
and the Rules of Conduct presentation (Gate 4) are not built, while the submitted
syllabus describes both as part of the course; human review and duration validation
(Gate 5) are not recorded.

**Review copy of the content.** `scripts/export-nmls-course-content.mjs` builds the
complete course content (45 lessons, 123 lesson-check and quiz questions, 50-question
final bank, answer keys) from the pinned source into git-ignored `.local-export/nmls/`.
It contains answer keys and must not be placed in `public/` or `dist/`.

## BioSig-ID interface requirements — 2026-11-18

Received from Ron Kerkenaar, Chief Technology Analyst, Biometric Signature ID
(ron.kerkenaar@biosig-id.com), in thread "StateCourse LLC — NMLS BioSig-ID Integration /
Provider Application 90788", with Rachel Lane. Vendor-supplied, not independently tested.

**Transport.** A **SOAP XML** interface reached over a **public HTTPS endpoint**. BioSig
supplies NodeJS interface code inside a custom-code ZIP referenced in **the API
documentation NMLS provides** — that documentation sits behind the NMLS provider login
and has not been read. The sample code is generic and must still be made to satisfy NMLS
requirements, the vendor naming **Resuming** as the hard part. BioSig will supply an
NMLS-compliant development endpoint **at the intro meeting**; that meeting is therefore
the gate on all integration work.

**Environments.** BioSig connects `statecourse.com` to **BioSig's own staging sandbox**.
No StateCourse staging environment is required, which leaves the no-staging policy intact.
A localhost target would need a public HTTPS tunnel; none is planned.

**Checkpoints.** A `d3` parameter names the point in the course: `Enrollment`, `Begin`,
`Middle#1`, `Resuming`, `FinalExam`. Per BioSig's published NMLS enrolment article, the
first authentication occurs **after the Rules of Conduct and immediately before the course
starts** — so Gate 4 (ROC) is a prerequisite of this gate, not a parallel track. Student
credential is a four-character pattern drawn with mouse, stylus, touchpad or touchscreen,
enrolled by drawing it three times and validating once.

**Acceptance.** A review meeting after development verifies eight items: first-time
enrolment UX and whether enrolment is a separate course (`d3=Enrollment`) or precedes
`d3=Begin`; flow and parameter values at `Begin` and `FinalExam` on a one-hour course;
`Middle#1` on longer courses; `Resuming` across a new LMS session after browser close or
sign-out; SOAP XML error handling that tells the student to contact support and logs
enough to diagnose; refusal of access on failed validation **with retry allowed**; a way
for the student to correct a mistyped NMLS agent ID held on their profile; and routing all
support to the **NMLS help desk** — BioSig is explicit that students must not contact BSI.

**Repository gap, read 2026-11-18.** No NMLS agent-ID field exists anywhere in the
functions, database or student pages. No `d3` checkpoint model exists. No SOAP client
exists: every integration in this codebase is REST over `fetch`, so SOAP is a new
transport here. Nothing in this paragraph is a defect; it is the scope of the work.

No gate closed, and no enrollment, payment, completion, certificate or credit control
changed.

## Provider approval — 2026-11-17 (supersedes the 2026-10-19 owner update below)

State Regulatory Registry LLC has **approved StateCourse LLC as an NMLS course provider**.

| Field | Value |
| --- | --- |
| Provider Organization Name | StateCourse LLC |
| NMLS Course Provider ID | 1405133 |
| Approval Date | 2026-11-17 |
| Renewal Date | 2028-11-01 |

**This is provider approval, not course approval.** The approval notice itself heads its
next section "Submitting Courses for NMLS Approval" and directs the provider to the
*User Guide: NMLS Course Approval Application Process* and the *NMLS Functional
Specifications for All NMLS Approved Courses* before any course is submitted. It is not
approval of `nmls-ce-2026-comprehensive-8`, no StateCourse course carries an NMLS course
number, and nothing here authorizes NMLS credit, opens enrollment or payments, or permits
describing any course as NMLS-approved. Gate 6 is now the binding gate and Gate 14
remains **BLOCKED**.

Evidence is two owner-supplied notices, both read on 2026-11-17: the State Regulatory
Registry LLC approval notice addressed to Anatoliy Kanevsky carrying the ID, approval and
renewal dates, and a separate confirmation from **Paula Lindsay, Senior Program Manager,
Mortgage Education Compliance, Conference of State Bank Supervisors** (plindsay@csbs.org),
copied to Anatoliy Kanevsky and Jessica Esquina, which directs the provider to the NMLS
Approved Course Provider Resource Center for the governing policies and procedures. SRR
operates NMLS under CSBS, so the two are corroborating rather than independent regulators.
Independent confirmation against the NMLS Approved Course Provider List is **not yet
possible**: that list is refreshed monthly, so an approval issued on the approval date
cannot appear in it yet, and its absence today neither confirms nor contradicts the
notices. Retain both original emails and confirm the listing at the next monthly refresh.
The 2028-11-01 renewal is a hard date and is otherwise untracked.

**Number discipline.** 1405133 is the NMLS Course Provider ID, from the SRR notice.
**90788 is BioSig-ID's own Integration / Provider Application number**, taken from that
vendor's subject line; neither NMLS notice states an NMLS application number. Do not
present 90788 as an NMLS application.

BioSig-ID asked for the LMS programming language, production URI, optional staging URI,
technical contact, company email, provider name and provider ID before scheduling
onboarding. Repository-derived answers: Node.js/JavaScript (ESM) serverless functions
with a generated HTML/CSS/JavaScript frontend and PostgreSQL, integrated over REST, not
SCORM or LTI; `https://statecourse.com`; no staging environment exists or is requested;
Anatoliy Kanevsky. BioSig onboarding, ROCS, human review and duration acceptance, course
submission and course approval all remain launch blockers.

No course was submitted, no enrollment, payment, completion, certificate or credit
control changed, and no public page was changed by this board update.

## Production AI pilot verification — October 19, 2026 (Los Angeles)

Production coach pilot is enabled on code `bf0433a4d7cc1fafa2f370fc43ced76142fcf36c` (ready deploy `6ad6e8e5ebf75c110bf19d98`). Real OpenAI and current Gemini 3.5 Flash-Lite answers were observed in Real Estate and authenticated Mortgage, with matching lesson excerpts, named consent, refusal samples and desktop/mobile inspection. Lesson change, pause and sign-out cleared generated answers; revisit after sign-out rejected the private session. OpenAI/gpt-4.1-mini is restored as default. Service-only RLS configuration preserves the shared $1/day cap without extra Lambda variables; existing provider keys are unchanged. Production ledger:11 complete,2 failed, $0.095761 conservatively reserved.44 targeted tests and the production build pass; lint unavailable (eslint absent). Authenticated protected build.json now independently confirms bf0433a / main / production, builtAt2026-10-20T04:07:15Z, after owner reauthentication at approximately21:26 Los Angeles. Actual enrollment revocation and portfolio-wide semantic/learning quality remain unverified. No knowledge-check answer graded, unit completed, payment or regulatory-credit/approval control changed; Mortgage remains 0/45 units, 0/8 practices. This is functional non-credit pilot evidence, not regulatory launch approval.

## Historical deployment snapshot — before coach activation

The expected commit `bd8319ec758b0f6e08aaf178704064984954d833` is Netlify's published production revision and now matches authenticated `build.json` readback. The existing Mortgage enrollment was exercised at desktop/mobile sizes: named consent is required, actual requests display unavailable, and pausing removes the coach. No answers were submitted and counts remained 0/45 units, 0/8 module practices; ordinary non-credit session/activity bookkeeping occurred. Mortgage coaching acceptance remains **BLOCKED**: runtime coach disabled, required coach settings absent, production durable admission unverified, and no live provider response/citation/refusal or generated-answer logout evidence. Anonymous and cross-origin coach requests returned 401 and 403 respectively. [Production verification](../../audits/PRODUCTION-DEPLOYMENT-2026-10-20.md). No NMLS approval, payment, regulated progress or credit control changed; this board update is local only.

## Historical local implementation snapshot — October 19, 2026

Local implementation now covers 284 Real Estate lessons across 30 catalog courses and 45 authenticated national Mortgage teaching units, with shared OpenAI/Gemini adapters and versioned lesson chunks. Student reading surfaces are connected; assessment and regulator-review boundaries are retained. Local HTTP/SQL/DOM/browser evidence is documented in [AI coverage](../../audits/AI-COVERAGE-2026-10-19.md). Provider authentication, live model quality, production migration/deployment and student production E2E remain unverified. No approval, credit, commerce or launch enablement flag changed.

Texas Law of Agency shared routing/player dependency drift was reviewed and recorded in video freeze v16 and content freeze v20. Stream regression checks and freeze validators pass; Texas submission/operational acceptance remains NO-GO. Georgia and Washington source readings remain stale and their gates stay closed.

## Owner update — 2026-10-19 (supersedes initial-access/submission assumptions below)

The owner confirms the **NMLS package has been submitted and is under review**, separately from California DRE. Record **OWNER-REPORTED SUBMITTED / UNDER REVIEW**. Exact provider/course application scope, date, IDs and receipt were not supplied. Do not continue to describe initial account access as the only progress, and do not infer provider or course approval. Remaining acceptance gates require current evidence; older statements below are historical, not live observations.

See the [current portfolio audit](../../audits/STATECOURSE-AUDIT-2026-10-19.md). No NMLS runtime, migration, credit, course version, payment or approval flag changed.

Last verified: 2026-09-19. Launch target: October 2026. Baseline: [CURRENT-STATE.md](CURRENT-STATE.md).

The initial NMLS account/access request was submitted approximately 24 hours before this board was created. NMLS advised that temporary login/password information may take approximately 48 hours. Account access is therefore **WAITING EXTERNAL**, not missing. This request is **not** provider approval and **not** course approval.

Status key: **VERIFIED** = narrowly verified evidence; **BUILT** = repository implementation exists; **PARTIAL** = some evidence exists; **WAITING EXTERNAL** = dependent on an outside party; **MISSING** = required evidence or implementation absent; **BLOCKED** = launch cannot pass.

| Gate | Status | Already built | Verified | Missing | External dependency | Evidence | Next action | Launch blocking | Last verified |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. NMLS account/access | **CLOSED** | Provider account in NMLS | Issuance of provider ID 1405133 presupposes account access | Retain the approval artifact in controlled records | None | SRR approval notice and CSBS confirmation, 2026-11-17 (owner-supplied) | None; superseded by Gate 2 | No | 2026-11-17 |
| 2. Provider application package | **APPROVED — OWNER-SUPPLIED EVIDENCE** | Submitted provider application | SRR notice: StateCourse LLC, NMLS Course Provider ID 1405133, approved 2026-11-17, renewal 2028-11-01 | Independent read-back from the NMLS Approved Course Provider List; archived original decision artifact | NMLS public list, refreshed monthly | SRR approval notice and CSBS confirmation (P. Lindsay), both 2026-11-17 | Retain both original emails; confirm the public listing at the next monthly refresh; calendar the 2028-11-01 renewal; do not treat this as course approval | No | 2026-11-17 |
| 3. BioSig access and integration | **INTERFACE BUILT FROM BSI SAMPLE / SWITCHED OFF / NEVER CONNECTED — no BSI values, table not applied (2026-11-20)** | Identity and session-control concepts; authenticated actor binding | Local actor-binding tests only; vendor requirements recorded above, none tested | Intro meeting, NMLS-compliant development endpoint, sandbox credentials, SOAP client, the five `d3` checkpoints, agent-ID profile field, error/retry and support routing, acceptance evidence | BioSig-ID (application 90788); NMLS API documentation behind the provider login | BioSig email 2026-11-17 and published enrolment article; repository read 2026-11-18 | Book the intro meeting — it is what releases the development endpoint. Download the NMLS API documentation and its custom-code ZIP. Build ROC first, since enrolment follows it | **YES** | 2026-11-18 |
| 4. ROCS / learner agreement | **PARTIAL / MISSING** | Session-policy contract and receipt-bound agreement model | Retained evidence checks identify unresolved originals | Genuine current ROCS/FAQ originals, complete presentation, affirmative consent, per-course retained agreement/export | NMLS source availability and accountable review | CURRENT-STATE §2 | Acquire official originals; finalize presentation, consent, retention, and export design | **YES** | 2026-09-19 |
| 5. Course content / human review / duration validation | **BUILT / MISSING ACCEPTANCE** | 8 modules, 45 lessons, assessment banks, 400 provisional minutes, traceability | Structure/content-loader tests; audit totals | Human SME/item signoff and representative learner duration study | Qualified reviewers and test learners | CURRENT-STATE §§3–5, 7, 21 | Assign reviewers; execute documented content, item, legal, and duration acceptance | **YES** | 2026-09-19 |
| 6. Course submission and approval | **APPLICATION 109386 OPEN — AWAITING DOCUMENTS / NOT APPROVED — BINDING GATE** (see 2026-11-19 section) | Draft course portfolio and planning records | Null course IDs and closed enrollment verified; the provider ID is no longer null | Final approved version, submission receipt, NMLS course number, approval decision | Gates 3–5; NMLS course review | CURRENT-STATE §§3, 20–22; SRR approval notice and CSBS confirmation, 2026-11-17 | Work from the NMLS Approved Course Provider Resource Center, the User Guide and the NMLS Functional Specifications; Paula Lindsay (CSBS) is the named provider contact for questions, including whether BioSig integration must precede submission; then prepare one course. Owner approves submission separately | **YES** | 2026-11-17 |
| 7. Regulated LMS delivery compliance | **PARTIAL / MISSING** | Free non-credit learner path; private CE-policy engines; timing/progression controls | Narrow local unit/service tests | Integrated approved-course browser flow, eligibility/history checks, genuine identity/ROCS, production acceptance | Gates 3–6 | CURRENT-STATE §§5–9, 19 | Build regulated path only after IDs/policies exist; keep free training separate | **YES** | 2026-09-19 |
| 8. Student NMLS ID / identity handling | **BUILT / NOT DEPLOYED** | Agent-ID intake, format check, student-editable correction, append-only change log, transactional write behind the service role | 19 unit tests including refusals, proven to fail when the digit check is removed; browser render exercising a typo and a correction | Migration 030 applied to production, real end-to-end run, BioSig binding, NMLS-authoritative format rule, exception handling | Gate 3; owner approval to apply the migration | `config/nmls/student-identifier.mjs`, `database/030_student_nmls_identity.sql`, `tests/student-nmls-identity.test.mjs` | Obtain approval and apply migration 030, then verify against the deployed site. The 12-digit bound is provisional until the NMLS specifications are read | **YES** | 2026-11-18 |
| 9. Assessment / completion authority | **BUILT / MISSING AUTHORITY** | Formative/final/remediation engines and private policy chain | Local assessment tests | Authorized regulatory completion decision, terminal-failure adjudication, approved rules and deployed persistence evidence | Course approval; human policy approval | CURRENT-STATE §§7, 11 | Define accountable completion authority and exception workflow; validate against approved course | **YES** | 2026-09-19 |
| 10. Certificate / reporting / credit banking | **MISSING** | Generic reporting/database concepts | No NMLS regulatory issuance/banking acceptance | NMLS certificate, reporting export, credit banking, reconciliation, accepted operational evidence | Course/provider approval and NMLS reporting access | CURRENT-STATE §§12–13, 22 | Design after official IDs/rules; test reconciliation before launch | **YES** | 2026-09-19 |
| 11. Records / retention / operational procedures | **PARTIAL / MISSING ACCEPTANCE** | Event/audit concepts and draft contracts | Some local immutability/trace checks | NMLS-specific retention/retrieval, backup/restore proof, complaints/support, exception and incident procedures | Accountable operations review | CURRENT-STATE §§2, 7, 14, 16, 22 | Consolidate SOPs and perform retrieval/restore tabletop acceptance | **YES** | 2026-09-19 |
| 12. Stripe commerce readiness | **VERIFY / NOT LIVE** | Shared checkout, signed webhook, ledger, entitlement, refund architecture | Local code tests only; historical sandbox report | Current account/config read-back, NMLS product/price, full sandbox E2E, refund/duplicate evidence | Authorized Stripe test access; owner price; Gate 6 before sale | [Stripe Readiness](../commerce/STRIPE-READINESS.md); CURRENT-STATE §10 | Reconcile test objects and run approved sandbox acceptance; keep live off | **YES** for paid launch | 2026-09-19 |
| 13. Learner / reviewer end-to-end acceptance | **MISSING — portal working per owner after PR #28; reviewer credit version built 2026-11-20, not deployed, reviewer accounts not provisioned** | Learner and reviewer surfaces | Service tests and source artifact scan | Real browser learner/reviewer flow, auth/recovery, persistence, accessibility, deployment/schema evidence | Test accounts, approved environment, completed gates | CURRENT-STATE §§15, 17, 19, 21 | Execute scripted learner and reviewer acceptance with observed evidence | **YES** | 2026-09-19 |
| 14. Production launch | **BLOCKED** | Non-credit training capability exists | No commercial credit-bearing launch acceptance | All prior blocking gates, owner launch approval, verified production readiness | NMLS/BioSig/Stripe decisions and owner authorization | This board and CURRENT-STATE | Keep regulated enrollment, payment, completion, certificate, and credit off | **YES** | 2026-09-19 |

## Required state separation

`payment` → `payment entitlement` → `course enrollment` are separate from `course completion` → `regulatory completion` → `certificate` → `NMLS credit`.

The free training course is non-credit and must never be represented as approved NMLS CE. Payment or enrollment must never directly grant completion, regulatory completion, a certificate, or NMLS credit.

## Unified Admin adapter — 2026-09-19 local implementation

The existing console reads validated NMLS attempts instead of CA/TX blocks: 45 lessons, 8 modules, phase, safe final-attempt summaries, remediation and training completion. Source snapshots and activity reject invalid histories. Credit, certificates and reporting remain independently closed. The common media index includes 45 NMLS instructional targets and uses the existing signed Stream overlay; no asset was uploaded or marked playback-verified. Reviewer access uses the existing NMLS course/version grant and can be revoked without granting a Team role. [Acceptance record](../../admin/UNIFIED-ADMIN-ACCEPTANCE.md). Production migration/deployment and live-account acceptance are still required; no launch gate above is closed by local tests.
