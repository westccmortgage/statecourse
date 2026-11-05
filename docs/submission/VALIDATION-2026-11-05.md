# Full-course preparation validation — November 5, 2026

This verifies the implemented remediation and local review preparation. It does not certify all nine courses/packages as complete. All nine filing statuses remain false; instructor selection is deferred, not satisfied.

| Observed check | Result |
| --- | --- |
| PA/CO engine, closing cases, current-source regression and Florida manuscript tests | 121 passed |
| Complete direct Node suite with Node 22 on PATH | 2,407 tests: 2,351 passed, 27 failed, 29 skipped |
| Previous review-branch baseline | 2,397 tests: 2,341 passed, the same 27 failed, the same 29 skipped |
| Failure-name comparison | No new or resolved failure names; ten additional tests pass |
| Netlify static build, `bash site/build.sh` | Passed; no deployment |
| Separate Sites build, `npm run build` | Passed including artifact validation; no publication |
| Lint | Passed: zero errors, 115 existing warnings |
| Local actual Chrome acceptance | All nine public states grade, explain and restore without account; 320/390/1100/1280px checks pass; no page errors, missing resources or POST requests |
| Corrected CO relationship question in actual player | Current writing/compensation question graded correctly; HB26-1426 rationale and source present |
| Florida metadata regeneration | All nineteen authored manuscript byte hashes unchanged; generator no longer overwrites them with stubs |
| Original closing calculations | Five independently checked buyer/seller/cash totals and changed-proration tests pass |
| Primary-source capture integrity | PA, CO, FL, GA and NY retained bytes match their manifests |
| Ignored local package boundary | Review exports stay under `.local-export/`; no protected source copy is staged or public-hosted |

Negative checks reject the superseded CO automatic default; omission of transaction brokerage from required writings; missing conspicuous compensation; wrong sequence; compensation-only sufficiency; the old PA ten-year window; impossible/reversed dates; invalid monetary/proration inputs; and missing/duplicate/wrong-section Florida objectives. No readiness rule is loosened to produce a green result.

The first broad run used an absolute Node executable without adding it to PATH, so child processes could not locate Node. It also identified a PA source-boundary heading regression and an official example tax-number false positive in a duplicated HTML source. Corrected the heading and changed the review export to reference canonical official HTML by hash rather than duplicate publisher pages. Re-ran with the correct PATH; the final result matches the existing 27-failure baseline. Existing tests were not weakened. The standard `test:netlify` document wrapper still has the previously recorded missing generated California-PDF prerequisite; the direct suite and both builds are reported separately.

Evidence: [failure comparison](../../reports/submission-preparation/baseline-comparison.json), [review inventory](../../reports/submission-preparation/2026-11-05.json), [browser report](../../reports/free-practice-expansion/browser-results.json). No paid model/API calls, regulator transmissions, signatures, payments, merge or deployment were performed.

## What remains unverified

Full objective/subordinate-topic coverage and manuscript completeness; independent legal/content/accessibility review; actual student activity performance; observed course duration; protected final completion/duplication/pagination/security review; current completed Commission forms; accepted distance-method certification and identity/proctor controls; production LMS persistence/completion/reporting; instructor qualifications/approvals; actual school/entity/financial/bond/official-role evidence; final application correctness and regulator approval. NY organizational independence and GA methodology sequencing are material separate dependencies. Passing arithmetic, structural and source-hash checks does not close these gates.
