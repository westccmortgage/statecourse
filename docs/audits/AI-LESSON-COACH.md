# AI Lesson Coach: decision, implementation and acceptance

Current implementation: [all-course coverage and dual-provider integration, October 19, 2026](AI-COVERAGE-2026-10-19.md). The initial three-concept pilot below is retained as design history; coverage now includes all 30 catalog Real Estate courses and the 45 authenticated national Mortgage teaching units.

## Решение для владельца

**Рекомендация: ограниченный измеряемый пилот, не полномасштабное внедрение.** Контекстный разбор ошибки имеет разумную учебную цель: показать, где ломается рассуждение, сослаться на текст и предложить перенос знания на другой вопрос. Но для StateCourse ещё нет измеренного эффекта, реальных ответов выбранной модели или данных удержания знаний. Обещать проценты улучшения, экономию преподавателей или рост сдачи экзамена сейчас нельзя.

Предлагаемый стартовый кандидат — **OpenAI Responses API, `gpt-4.1-mini`**, задаваемый серверно, не клиентом. Имя и structured-output interface подтверждены официальными исходниками OpenAI SDK, прочитанными в этой задаче: [response types](https://github.com/openai/openai-node/blob/master/src/resources/responses/responses.ts), [model names](https://github.com/openai/openai-node/blob/master/src/resources/shared.ts). Документационная HTML-страница вернула HTTP 403; реальный provider call не выполнялся. Это кандидат для benchmark, не утверждение, что он лучший или доступен в вашем проекте. Ни ключи коммерческого StateCourse AI plugin, ни его подписки/база не использованы.

Предпочтительная следующая функция после пилота — **очередь повторения ошибочных понятий**: deterministic scheduling, другие проверенные задания, повтор через 2–7 дней, AI только для объяснения. Она дешевле бесконечного чата и позволяет измерить перенос знаний. Ещё полезнее для команды — единая очередь source freshness / SME / application / runtime blockers; текущий audit generator уже даёт её исходный инвентарь. Векторная база и несколько моделей на каждый ответ сейчас не нужны.

## Initial pilot scope (superseded by the coverage report)

The existing Netlify free-practice route remains anonymous. The optional UI covers only California Real Estate Principles and three pinned concepts:

| Concept | Existing source | Formative IDs | Next practice |
|---|---|---|---|
| Real/personal property | lesson-01 §1.4 plus authored formative explanations | `:2`, `:7` | The other existing item |
| DRE's role | lesson-01 §2.1 plus authored formative explanations | `:3`, `:8` | The other existing item |
| LTV vs down payment | lesson-11 §5.1 plus authored formative explanation | `:118` | No second reviewed LTV item exists in this allowlist; explicitly send learner back to the source/instructor |

The `$400,000 / $320,000` demonstration is supplementary arithmetic, not a new graded question. Code computes LTV 80% and down payment 20%, assuming purchase price and appraisal are both $400,000. The bank's actual LTV item remains unchanged. The UI does not invent a second item to conceal the limitation. This is a deliberate acceptance limitation for the LTV demonstration; the full next-question loop exists for property and DRE.

`POST /api/learning/coach` is routed to `netlify/functions/learning-coach.mjs`. The separate Sites API is not the provider backend. Context is generated from the explicit free-practice allowlist and pinned to canonical catalog course version, lesson SHA-256, formative-bank SHA-256, and complete context digest. No final bank, private transcript, learner identity, grade update, enrollment or credit operation is imported. After legitimate curriculum changes, regenerate context deliberately and rerun pin tests. Source/assessment changes are not hidden by refreshing hashes during an audit.

The server rejects browser-supplied roles, answer keys, lesson bodies, history, wrong course/state/lesson/version/digest, unapproved question IDs and selected choices outside the bank. It grades the indicated formative choice itself. Asking without a prior choice is allowed. A forged browser claim of having attempted a public formative question grants no access or credit; this feature intentionally has no trusted attendance state.

Provider output must follow a closed schema. Unknown source IDs, external URLs/HTML in generated prose, missing citations for answers, incomplete/invalid responses fail closed. The server creates source URLs and chooses the next item. **Source-ID validation does not establish semantic support.** Human review of explanations and real injection tests remain acceptance gates. The model receives no tools and no protected documents even if a prompt requests them. Model instructions treat both source text and learner text as data; this is not proof that every adversarial prompt is semantically defeated.

## Activation prerequisites — not performed

Feature defaults off. Required deployment-owned configuration, all server-only:

| Name | Purpose |
|---|---|
| `LEARNING_COACH_ENABLED` | Explicit `true` only after acceptance; otherwise unavailable |
| `LEARNING_COACH_API_KEY` | Dedicated educational-service OpenAI project key; secure secret entry only |
| `LEARNING_COACH_MODEL` | Supported Responses/structured-output model; proposed first benchmark `gpt-4.1-mini` |
| `LEARNING_COACH_ORIGIN` | Exact permitted site origin, e.g. `https://statecourse.com` only for an approved production activation |
| `LEARNING_COACH_HASH_SECRET` | Dedicated random secret, at least 32 characters, for pseudonymizing client IP |
| `LEARNING_COACH_INPUT_USD_PER_MILLION` / `LEARNING_COACH_OUTPUT_USD_PER_MILLION` | Current verified worst-case model prices; positive numeric values; no guessed prices |
| `LEARNING_COACH_DAILY_BUDGET_USD` | Explicit daily cap >0 and ≤$10; proposed pilot $1/day pending owner choice |
| Existing `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Existing learning platform store, not commercial plugin; reuse only authorized platform bindings |

No secret was requested in chat, created, moved from another product, or added to production. Migration `database/learning-coach/001_control.sql` is a **reviewable, unapplied** isolated addition. Apply it only after explicit database authorization and review; never execute the SQL directory as a glob. It cannot modify existing learner, course, exam or commerce tables. The current provider/model/key selection and live smoke remain blocked on dedicated access and authorization of that environment's activation.

## Limits, privacy and failure behavior

- Maximum 1,000 learner characters, 6 KB HTTP body, 14 KB serialized provider context, no conversation history, 800 output tokens, 15-second provider timeout, no automatic provider retries.
- Durable PostgreSQL admission serializes all workers. Caps: 5 requests/minute and 20/day per pseudonymous IP; 100/day globally; UTC daily cost reservations. Multiple people behind one IP share the quota; changing IP cannot bypass the global cap.
- Reserve worst-case `16,000 × input USD/million + 800 × output USD/million` microdollars before each call. This is a conservative bound, not measured cost, and depends on correct current pricing for the configured model. `16,000` bounds input bytes plus instructions/schema conservatively for the intended tokenizer. Do not enable a model with extra pricing/tool charges not covered by these assumptions. Also set a provider-project budget independently when configuring access.
- Reservations survive timeout/failure, because the provider might have processed the request. Same ID + identity + payload returns cached success or a non-billable refusal; a changed payload conflicts. Double clicks are disabled and repeated identical UI submissions reuse the same ID. Durable duplicate protection lasts 48 hours; there is no promise of unlimited replay protection.
- The UI explains data transfer and asks affirmative consent. Only question/reasoning, selected formative answer and relevant excerpts are sent. No email, user profile or raw client IP goes to the provider. The user is told not to include client/borrower documents, SSNs or bank details; this is minimization, not automatic PII detection.
- Requests use `store:false`; this disables Responses storage, **not a promise of zero provider abuse-monitoring retention**. Review the provider's actual project terms before pilot activation.
- The application does not log prompts, raw responses, raw IPs or keys. The durable table holds request IDs, pseudonymous IP hash, payload hash, reserved cost and a short-lived generated response. The response may paraphrase learner input; treat it as potentially personal. Response-cache eligibility expires after 10 minutes, tombstones after 48 hours; physical cleanup is **lazy on subsequent requests**, not guaranteed wall-clock deletion. Before production, schedule authorized cleanup if strict retention is required. No scheduled service is created by this patch.
- API errors do not expose provider/backend error bodies. Ordinary code grading and local practice progress remain available. Synthetic test feedback is never installed as a fallback AI answer.

## What was verified

Baseline setup at `84c38a6`: both builds and local serving passed; full pre-existing suite 2,287 passed / 48 failed / 27 skipped; existing lint 114 errors / 116 warnings. Those defects were not rewritten to make this pilot green.

For this branch:

- 25 new tests passed, including actual isolated PGlite execution of the migration, durable quota/budget/duplicate behavior and role permissions. Core/provider tests use synthetic responses and explicitly do not prove model quality.
- 71 targeted tests passed: free-practice regressions, public answer-key protection and new core tests. Netlify build and its 5 public artifact/privacy gates passed.
- Chromium desktop 1440×1000 and mobile 390×844: ordinary wrong-answer feedback, actual disabled backend response, optional coach UI with **labelled synthetic fixture**, next existing question graded by the original code, and clearing stale answers on course changes; the expanded coverage report supersedes the original unsupported-course behavior. No page errors or horizontal overflow. Screenshots retained under ignored `work/coach-qa/`; they are not live-AI evidence.
- Three context pins and canonical lesson/bank correspondence checked; malformed fields, foreign scopes, arbitrary source IDs, provider errors, timeouts, malformed output and replays tested.
- Real provider smoke: **NOT RUN**. Actual latency, token cost, response quality, two genuinely different reasoning responses, meaningful refusal and adversarial source/prompt behavior are **unverified**. Full deployed learner E2E and production migration are unverified.

Reproduce:

```bash
node scripts/audit-course-portfolio.mjs
node --test tests/learning-coach.test.mjs
LEARNING_COACH_TEST_PGLITE=/absolute/path/to/@electric-sql/pglite/dist/index.js node --test tests/learning-coach-sql.test.mjs
# In the disposable source copy, because generators overwrite existing tracked outputs:
bash site/build.sh
node --test tests/free-practice*.test.mjs tests/no-answer-key-published.test.mjs tests/learning-coach.test.mjs
```

The SQL test deliberately skips without the isolated dependency and says so. The tested dependency was PGlite 0.5.8 outside project dependencies. Browser automation used Playwright 1.58.2 with system Chromium; neither was added to application package files.

## Real evaluation before enabling

1. Supply dedicated access, select candidate model and verified prices, authorize the durable store in the intended environment. Keep production off while validating an authorized local/test route; do not create a new paid service or staging environment implicitly.
2. `LEARNING_COACH_SMOKE_URL=<authorized endpoint>/api/learning/coach node scripts/learning-coach-smoke.mjs --run-paid-smoke` runs at most six guarded calls: two distinct property misconceptions, two DRE misconceptions, LTV confusion, and an unsupported-state/protected-exam request. It writes results to a local `/tmp` file for human review; no secrets/prompts are printed. This is a smoke test, not the complete quality benchmark.
3. Expand to a fixed set of at least 30 cases across the three concepts, including correct reasoning, misconceptions, missing evidence and adversarial requests. A qualified reviewer scores correctness, actual source support, whether feedback addresses the stated reasoning, and appropriate refusal. Require zero critical misinformation/exam disclosures; target ≥90% acceptable grounded responses. These are **proposed gates, not measured results**. Record model version, material digest, raw token usage, p50/p95 latency and cost per helpful intervention, with a capped call count.
4. Only after quality gates, run a consented non-credit pilot against ordinary saved explanations. Primary metric: first-attempt correctness on a different reviewed item; secondary: delayed retention after 2–7 days, abandonment and help requests. Predefine comparison and sample-size plan from baseline performance; report uncertainty and do not infer effectiveness from a tiny demonstration. LTV needs another expert-reviewed formative item before it can contribute an independent transfer metric.
5. Stop for material misinformation, source mismatch, privacy exposure, budget excess or worse learning outcomes. Disable `LEARNING_COACH_ENABLED`; practice continues. Reverting the UI/route commit removes the surface. Retain/reconcile request records and reserved costs under the agreed retention policy; do not drop production data as an automatic rollback.

## MIT description — factual, not an application submission

StateCourse's proposed Lesson Coach is a source-constrained assistant for anonymous, non-credit California real-estate practice. The implementation sends a learner's question or reasoning and a small, version-pinned set of authored excerpts to a server-side model adapter, validates source identifiers, and offers another existing formative question when one is available. Code retains responsibility for grading and progress. Local tests verified integration boundaries, durable budget controls and desktop/mobile UI behavior using synthetic model fixtures. A live model evaluation and evidence of improved learning outcomes have not yet been obtained; the feature is disabled and has not been deployed.

Browser checks are reproducible with checked-in helpers (local validation only):

```bash
LEARNING_COACH_LOCAL_DIST=/absolute/path/to/disposable-source/dist node scripts/serve-learning-coach-local.mjs
# In another terminal; install Playwright outside project dependencies if needed:
LEARNING_COACH_TEST_PLAYWRIGHT=/absolute/path/to/playwright/index.mjs node scripts/verify-learning-coach-browser.mjs
```

The local helper always disables AI calls. The browser verifier tests the real unavailable handler first, then intercepts the coach route with a visibly labelled synthetic UI fixture; it cannot establish live provider quality. Screenshots are written to `work/coach-browser/` and contain no real learner data.

## Provider comparison extension — 2026-10-20

An isolated [OpenAI/Gemini comparison project](../../experiments/lesson-coach/README.md) now reuses the pilot response schema and identical system instructions for both providers. Twelve synthetic cases cover misconceptions, arithmetic, refusals, unsupported jurisdictions, injection and Russian explanations. The application now supports both adapters server-side; production activation and runtime behavior remain unverified. No live provider response has yet been obtained: both keys are present, but the environment proxy rejects API connectivity. See [continuation record](CONTINUATION-2026-10-20.md).

## Netlify variable compatibility — October 19, 2026 (Los Angeles)

The guarded OpenAI handler now accepts the existing Netlify `OPENAI_API_KEY` when the older dedicated `LEARNING_COACH_API_KEY` is unset. An existing dedicated key retains precedence. `GEMINI_API_KEY` is never sent to OpenAI; it is used only when the application or comparison selects Gemini. Both providers' secrets were visible as masked entries with Functions scope in the owner's Netlify screenshot, but the selected deploy contexts, deployed function version and provider authentication remain unverified.

Thirty focused coach/comparison tests pass, including credential selection, no secret disclosure in responses/store arguments, wrong-provider rejection and disabled-feature behavior. Presence of a key does not enable the coach: the model, origin, hash secret, prices, budget, durable SQL store and enable flag still apply. No Netlify environment setting or production deployment was changed. This session has no Netlify account binding/token/connector, and read-only requests to the site and Netlify API are also rejected by the environment proxy. Runtime deployment/E2E remains externally blocked.
