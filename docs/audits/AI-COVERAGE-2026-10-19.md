# StateCourse AI teaching integration — October 19, 2026 (Los Angeles)

## Implemented source coverage

| Teaching surface | Source coverage | Access and assessment boundary |
| --- | --- | --- |
| Free Real Estate practice | All 30 catalog courses, 284 authored lessons in 14 states | Public teaching sources only; reviewed formative-answer help remains limited to the original three concepts |
| Real Estate student block player | Matching public manuscripts, including all three California courses | Student instruction/review screens; hidden on retrieval, practice, applied/mastery/completion and remediation screens, and regulator review |
| Legacy Real Estate reading page | Matching public manuscripts | Student reading; regulator review excluded; final-exam pages have no coach |
| National Mortgage training | 45 units across eight modules | Existing authenticated enrollment, exact current source unit, active session and idle policy; excludes module quizzes, finals, remediation and regulator review |

The library contains **329 lessons / units and 6,666 chunks**, with a maximum 1,800 UTF-16 characters per chunk and intact Unicode pairs. Paragraph boundaries and headings are preserved where possible. Concatenating the chunks reconstructs the complete normalized teaching text. Source, lesson and context digests identify exactly which version an explanation uses.

`scripts/generate-learning-coach-library.mjs` uses explicit curriculum allowlists and the Mortgage compiler's teaching strings. It selects no action-question object, formative bank or final bank. Build runs regenerate the library. The complete server corpus lives in `config/learning-coach/library.json`; the public `learning-coach-library.json` contains only Real Estate identifiers, titles and digests. Private Mortgage excerpts are not copied into the public manifest or static site.

Each request retrieves at most five chunks from **that lesson only**, ranks by query terms and headings, and gives the model only those sources and the current question. It does not search other students, other courses, filing PDFs or the internet. This is an auditable first retrieval implementation; it is not a claim that lexical ranking is optimal for all Russian/English queries.

## Both providers

The same response schema, source constraints and output validation now serve OpenAI and Gemini in the application and comparison lab. The provider and model are selected on the server. The UI names the provider and requires consent; changing provider invalidates prior consent. Gemini receives only `GEMINI_API_KEY`; OpenAI uses the existing dedicated `LEARNING_COACH_API_KEY`, or `OPENAI_API_KEY` when that is unset. Neither key reaches browser assets, course contexts, response objects or Git.

Existing admission controls remain mandatory: explicit enablement, model, exact origin, HMAC identity secret, verified positive price ceilings, daily budget at most $10, durable reservation, replay protection and short provider timeout. Presence of a key alone cannot enable generation. Reservations remain charged on provider failure because a timed-out generation can still be billable.

Mortgage additionally verifies existing Supabase authentication, course/version/source digest, membership, full runtime integrity, active session, current unit, phase and inactivity. It repeats the access check after generation **and after a cached result**. Revocation during generation returns no explanation or source excerpts. This endpoint performs no course progress, attendance, grading, payment, certificate or credit write. Existing authentication can synchronize the student profile; coach admission stores its own budget/cache records separately.

## Comparison and educational decision

The local lab retains its 12-case diagnostic suite and adds a **50-case portfolio suite**: those 12 cases, one lesson from each of 30 catalog courses, and one unit from each of eight national Mortgage modules. Inputs are pinned and bounded; both adapters receive the same case data. An offline execution does not contact either provider.

```sh
node experiments/lesson-coach/compare.mjs --suite portfolio --output work/portfolio-readiness-unique.json
```

A live operator run adds `--live`, protected environment credentials, explicit available model IDs and independently verified current prices. The existing cap remains $0.50 per provider per run, no automatic retries, exclusive report creation and stop on first provider failure. The full 50-case run is refused when its conservative reserved cost exceeds the cap.

Recommendation remains a measured pilot. `gpt-4.1-mini` and `gemini-2.5-flash` are benchmark candidates whose current availability and pricing must be verified in the actual accounts. No winner or demonstrated learning improvement has been established. Blind human scoring must judge correctness, source support, explanation of the student's mistake and useful next action. The subsequent learner pilot should compare a different transfer question and delayed retention, with ordinary instruction as a baseline.

The proposed next learning feature is scheduled review using existing vetted questions: deterministic scheduling and grading, with AI explanations as optional help. Core V2's administrative record investigation is a separate integration being prepared in its original project.

## Verification and remaining limits

Full isolated regression: **2,642 tests; 2,639 pass, 3 fail, 0 skipped** (295.27 seconds). The three failures are the preserved Georgia and Washington freshness/offline checks. The subsequent 11-case test run adds the portfolio benchmark checks and exercises a synthetic provider input for each of all 329 teaching contexts. Final focused coach/HTTP/DOM/PostgreSQL checks: **44 passed, 0 skipped**. Lint: **0 errors, 116 warnings**. No live provider quality score is established.

- All corpus lesson/context hashes and reconstruction limits are checked against actual authored sources. Negative tests reject other states/versions, forged lesson text, protected question IDs and public access to private Mortgage contexts.
- The private HTTP test exercises existing authentication, actual provider request/response adapters with synthetic responses, durable replay and revocation before/after generation. It verifies that no progress commit or timing write occurs.
- Actual Chromium pages pass at 1440-pixel and 390-pixel widths: provider disclosure, explanation display, public course change clears the previous answer, Real Estate retrieval hides the coach, Mortgage pause removes it, ordinary grading continues, no page errors or horizontal overflow. Screenshots contain explicitly labelled synthetic answers.
- The SQL admission check executes the real coach migration in isolated PostgreSQL. Both Netlify functions bundle successfully. This does not apply the migration to production.

Production is **unverified and not activated by these changes**. Both provider API connections and live-site readback were previously rejected by the environment proxy before provider authentication. No live model comparison, production Supabase migration, Netlify deployment, actual student session or educational outcome is represented by the local evidence. No regulatory approval, commerce or credit flag changed.

Validation logs and screenshots remain in ignored `work/ai-validation/`, `work/final-validation/` and `work/coach-browser/`. The portfolio inventory and California filing review remain authoritative for course readiness; AI coverage is not course approval.
