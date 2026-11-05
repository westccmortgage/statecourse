# Validation and preview handoff

November 4, 2026 (Los Angeles). Work continues the existing branch `codex/multi-state-free-practice-expansion` at `ea004109ac68ff12eb7deb2e9433685936a15fa5`; its implementation, banks, Pennsylvania corrections and Washington withholding are preserved. Main baseline: `d3970e640915321baee85db68bbffa9cefdcab40`.

| Check | Observed result |
| --- | --- |
| Existing-branch focused tests, before follow-up changes | 68 passed |
| `npm run test:free-practice` | 79 passed; static build and five protected-publication checks also pass |
| `bash site/build.sh` | Passed; this is the Netlify static artifact, with no deploy |
| `npm run build` | Passed; separate Sites/Vinext artifact and artifact validation, with no publish |
| `npm run lint` | Exit 0; 0 errors, 115 existing repository warnings |
| Broad direct Node suite on main | 2,380 tests: 2,324 passed, 27 failed, 29 skipped |
| Broad `node --test tests/*.test.mjs` on reconciled branch | 2,397 tests: 2,341 passed, the same 27 failed, the same 29 skipped; no new or removed failure names |
| Standard `test:netlify` wrapper prerequisite | Requires generated California print PDFs absent in this checkout. Its static build passes; the wrapper's document-preparation requirement is not silently bypassed |
| Actual local Chrome browser | Nine priority states: anonymous access, correct grading, explanations and reload restoration; no overflow at 320/390/1100/1280px; conflicting state/course links scoped correctly; no page errors, missing resources or POST requests |

Machine evidence is retained in `reports/free-practice-expansion/browser-results.json` and `baseline-comparison.json`. The browser runner generates local screenshots in the same directory; PNGs are excluded from Git. Tests run with the locked repository dependencies and isolated browser tooling; no paid API or connected production system is exercised.

The 27 unchanged failures concern California generated form/print/traceability artifacts, prior Georgia offline-source expectations, Michigan production-discovery copy, NMLS endpoint/enrollment prerequisites, the existing Texas video-freeze hash mismatch and stale Washington paid-source-lock checks. Exact names are in the comparison JSON. No existing test was removed or relaxed to erase these failures. The TX3 expected projection was extended to assert the newly added state/topic/provenance metadata while retaining exact original prompt/choice/answer/explanation and source checks.

New negative tests prove the validator rejects foreign state identity, invalid answer index, blank explanation, duplicate choice/item, unknown lesson, missing category/reference, enabled credit/certificate and required account. Native guarded imports prove that public banks and collections do not load protected exam modules. Existing protected-final non-overlap tests remain green.

## Published-build scope

| State | Public questions |
| --- | ---: |
| Texas | 708 |
| Florida | 100 |
| Colorado | 319 |
| Arizona | 165 |
| North Carolina | 176 |
| Georgia | 100 |
| Pennsylvania | 165 |
| Washington | 100 |
| New York | 100 |
| Total | 1,933 |

Routes are `/free-practice/{texas,florida,colorado,arizona,north-carolina,georgia,pennsylvania,washington,new-york}/`, using the existing shared player. The existing discovery, state finder, licensing hubs, metadata/canonicals and root `/sitemap.xml` integration are preserved. Existing paid-course catalog and approval records are unchanged. The 198 inherited Washington items remain in the repository and absent from public exports/coach contexts.

This follow-up changes `scripts/generate-free-practice.mjs`, `scripts/lib/validate-free-practice.mjs`, `config/free-practice/references.mjs`, the player identity check, shared responsive CSS, the explicit non-endorsement disclosure, focused scripts/tests, current-source evidence and launch boards. It does not replace the existing state bank files.

## Exact preview recommendation

Use this branch in the existing repository. With Node >=22.13 and the locked dependencies installed through the documented environment procedure, run `npm run test:free-practice`, then `python3 -m http.server 4173 --directory dist`. Review `/free-practice/texas/` and then the remaining states in the requested order. The Netlify artifact is built by `bash site/build.sh`; `npm run build` creates a separate Sites artifact.

Repeat browser acceptance with `node scripts/verify-multi-state-practice-browser.mjs /absolute/path/to/playwright/index.mjs` and Chrome installed. The runner uses an ephemeral loopback server and blocks external requests.

No deployment is recommended as an automatic next step. A future separately authorized preview should reuse the existing Netlify project, first confirm branch/preview triggers, build with `bash site/build.sh` and publish `dist/`. Do not create another hosting project. Triage the existing broad-suite failures before a release decision. No PR that could trigger an automatic preview is opened by this task; the follow-up commit carries `[skip netlify]`.

Unverified: production configuration and runtime, hosting triggers, this exact branch in Safari/Firefox, independent human review of every question, and regulator acceptance of any paid course. No unresolved current-source conflict was found within the bounded public-practice offering. Paid-course conformity and freshness gates remain separate.
