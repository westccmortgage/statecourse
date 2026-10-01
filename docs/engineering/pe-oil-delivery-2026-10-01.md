# PE scheduled delivery integration: private candidate

## Preserved technical acceptance

Protected final application `0ec1a528182afe91dc15ca5fae722c6e6628d27f` passed isolated run [36927200796](https://github.com/westccmortgage/statecourse/actions/runs/36927200796), including native PostgreSQL 17.11 real lock waits and Chromium check/final/retake/recovery. Its exact artifact SHA-256 is `e82582b1bcc51d6c137e32c2c5e901b88171e1121b067a1636885e67c58aee33`. This new delivery/reader candidate has not yet completed native/browser acceptance. No hosted service, live migration or release was changed.

## Requirement versus provider interpretation

Current official v17 sources were checked October 1, 2026:
- [Mandatory breaks §1.5.4](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_timeReqsMandatoryBreaks.html): instruction cannot continue beyond four hours without a break; breaks are excluded from instruction.
- [Maximum session §1.5.5](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_timeReqsMaxCourseSession.html): maximum twelve hours in a 24-hour day.
- [OIL scheduling §4.2](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OIL_courseSched.html): courses of thirteen or more hours may not extend beyond fourteen calendar days; instructor-led interaction remains required.
- [OIL design §4.3](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/nmlsFS_OIL_courseDesign.html): navigable content chunks and a representative learner timing study are distinct obligations.

The separate PE descriptor uses conservative **draft provider choices**: a ten-minute break after 200 restriction-budget minutes, 600 restriction-budget minutes in any rolling 24 hours, a twelve-hour wall session, and twelve hours since the latest possible exposure before a new wall session. The official sections do not expressly specify these conversions, the minimum break length, rolling accounting, or rest duration. `providerPolicyApproved:false` remains explicit. No generic CE six-minute inactivity rule is imported or represented as an OIL requirement. Human provider-policy approval, human SME, representative timing and regulatory release remain separate gates.

## Server and client integration

One actor ledger spans all teaching units and the protected final. Server-issued display reservations are at most twenty seconds. Reservations survive lost responses and navigation; they restrict possible exposure and never award observed learning time. Foreground observation records continue independently. Breaks and new sessions do not reset rolling usage; repeat control requests use immutable receipts. Existing reservations and break events are retained. Server clocks refresh after authority locks; policy identity and ordered revisions prevent stale response or configuration reinterpretation.

The learner receives no lesson/check/form projection while delivery is paused. Monotonic browser deadlines clear instruction even without another server response. Hidden, unfocused and offline pages stop display; returning requires an explicit resume. Pending contribution/assessment requests retain their original IDs and can recover after session resumption. A final form's own deadline further shortens its display window; breaks do not extend that deadline. Instructor review remains separately authenticated and scoped.

The existing schedule is pinned once evidence or a delivery reservation exists. The fourteen-inclusive-local-date implementation is conservative and is not a claim that every possible schedule interpretation has regulatory approval. No window extension, late completion or banking grace is inferred.

## Preserved reading

Eight original module strings and all 25 unit manifests remain byte-identical. The lossless helper exposes 233 source sections of at most 4,200 characters with outline/previous/continue, stable source anchors, actor/course/unit/hash-scoped bookmarks and Back/Forward recovery. Concatenated source slices reproduce each manuscript exactly. Navigation does not manufacture reading completion, learning evidence or observed time. Actor changes during an in-flight unit switch clear private DOM. Protected assessment items and teacher originals are unchanged.

## Remaining end-to-end gates

The proposed 1,000 minutes are still unvalidated. Real scoped roster setup, complete verified ROCS document presentation and learner acceptance, identity/BioSig integration, hosted Auth/recovery, instructor operational quality, representative timing, accessibility/reading-level review, retention/restore/retrieval and authorized regulatory completion/reporting remain unfinished. This candidate enforces draft restrictions in a private noncredit runtime; it does not enable approved PE, certificates or banking.
