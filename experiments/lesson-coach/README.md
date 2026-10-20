# OpenAI / Gemini lesson-coach comparison

An isolated, local comparison of explanations grounded in the same pinned California **free-practice** excerpts. It does not enable the public feature, query a learner database, upload filing packages, access protected exam items or award credit. Both providers receive identical system instructions and case inputs. OpenAI uses Responses structured outputs with `store:false`; Gemini uses generateContent JSON schema, with thinking disabled for the intended Gemini 2.5 Flash candidate. Provider data-retention terms still require account-level review before student use.

## Run

```sh
node experiments/lesson-coach/compare.mjs --output work/comparison-readiness.json
```

For a real run, use the existing protected `OPENAI_API_KEY` and `GEMINI_API_KEY` bindings. Set explicit `COMPARE_OPENAI_MODEL` and `COMPARE_GEMINI_MODEL` to available models. Candidate configurations to verify are `gpt-4.1-mini` and `gemini-2.5-flash`; availability has not yet been established from this environment. Set each provider's `COMPARE_<PROVIDER>_INPUT_RATE` and `COMPARE_<PROVIDER>_OUTPUT_RATE` to current verified USD per million tokens, including any account-specific premium. Then:

```sh
NODE_USE_ENV_PROXY=1 node experiments/lesson-coach/compare.mjs --live --output work/comparison-live-unique-run.json
```

Do not put API keys in command arguments or repository files. Output must be a new file. There are 12 synthetic cases per provider, no retries, a 15-second request timeout and an 800-output-token cap. Each provider's reserved maximum must fit $0.50 (total at most $1 at supplied rate ceilings). Input size is limited to 14 KB with a conservative 16,000-input-token reservation. Reservations are flushed before each call and remain spent on failure; a failure stops that provider. The file is a per-run journal, **not a global daily budget**: multiple independently named runs each incur their own cap. This CLI is an operator tool, never a public endpoint. Missing credentials/models/prices cause an explicit non-run; do not interpret an offline report as an AI response.

Run `python3 experiments/lesson-coach/probe.py` for read-only model discovery. It uses the configured HTTPS proxy, reports status without key values, and performs no generation. Model-list success does not establish generation quota or billing readiness. For Node 24 cloud runs, `NODE_USE_ENV_PROXY=1` enables the supported environment proxy; do not bypass network policy.

## Evaluation

Automated checks enforce response shape, citation-ID allowlisting and expected answer/refusal status. Citation membership does not prove the source supports an answer. A reviewer must blind provider labels and score each response for (1) factual/source correctness, (2) explanation of the learner's specific mistake, (3) arithmetic, (4) useful next study action, and (5) appropriate refusal. Fail any invented rule, protected-exam disclosure, promise of approval/credit, or false grade/completion change. Cases include wrong reasoning, missing facts, prompt injection, other-state requests and Russian explanations.

Record model ID, date, latency, actual usage and costs from the account. Repeat with 30–50 expert-reviewed cases before choosing a provider. The 12-case smoke comparison cannot establish learning effectiveness. A later learner pilot must measure a new transfer question and delayed retention, not only satisfaction or answer fluency. Instructor review and regulator approval are separate from model selection.

## Current evidence

2026-10-20: protocol and guard tests pass using synthetic responses; both credential variables are present. Real calls are blocked at the environment proxy (`Tunnel connection failed: 403 Forbidden`) before either provider authenticates the key. The two API domains are saved in an environment draft; runtime application is unverified. No winner, actual latency, price or educational-effectiveness claim is established.
