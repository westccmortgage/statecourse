# Unified bridge proof — 2026-09-29

## Deployed baseline

Engine PR 240: atomic repeatable-read result envelope; Admin PR 37: atomic
projection and independent executor readback. Engine PR 241 (`4111720`):
shared durable WorkOrder; Admin PR 38 (`ae6e049`): owner-authenticated MCP
intake and selective context expansion. Engine production migration 074
verified; Admin Netlify deployment `6abb544ce414e200086cc7d1` is ready at
`ae6e04999ee3c4365c38cbd0382717d118f63dfd`.

The live authenticated MCP `capture_items` `[V2]` route created WorkOrder
`0d9f890f-2bb5-5e73-afbd-ff1514242f9b`. Repeating the exact key
`unified_v2_intake_20260929_001` returned the same ID, revision 1 and
`repeated: true`. `get_today` independently reopened the record. State is
REQUESTED, authority PROPOSE, authorized budget $0. This proves durable
intake, not autonomous completion. No provider or product action ran.

## Result-to-action bridge

Core now returns the immutable, hash-checked source field snapshot alongside
accepted findings. Admin maps accepted commitments to existing internal task
proposals, explicit outbound waiting facts to Waiting For proposals, and
accepted priority bands to priority proposals. Missing project identity,
missing source version or missing waiting direction refuses that mapping.
A prior human priority is preserved. Every proposal retains the existing
owner decision and single-use execution-token gate.

Scheduler-marked independence coverage failure is technical recovery, not a
business decision. It remains visible as inconclusive in the audit, blocks
new proposals, and is excluded from the human adjudication forms. No hold is
cleared and no paid work is retried by this presentation change.

Existing desk submission and Studio analysis submission create/link the same
WorkOrder inside the existing workflow start transaction. Neither adds an
execution mechanism or spending authority. The actual workflow cost ledger
is exposed separately from the immutable intake's $0 authority ceiling.

## Coordinated synthetic proof A and cross-system path

Run from the engine checkout:

```sh
ADMIN_REPO_ROOT=/path/to/anatoliykanevsky node --experimental-strip-types tools/unified-acceptance.mjs
```

Requires the matching Admin checkout with `npm ci`. The probe applies all
engine and Admin migrations in two isolated PGlite PostgreSQL 18 databases.
Core's production scheduler, Postgres repository, domain pack, result
projection, Admin atomic RPC, SQL owner/token gates, existing executors,
readback verifiers and shared completion function are used. Independent
scripted readers substitute for AI providers; no network/provider call is
made. Synthetic owner approval is explicitly recorded in the isolated DB;
this is not a test of autonomous action authority.

Passed:
- intent -> durable WorkOrder -> existing Core plan and blind readers;
- evidence anchors, accepted findings and decisions persisted;
- new scheduler process resumes the same workflow;
- current complete Core result projected atomically into Admin;
- exactly one task and one Waiting For proposed for the known project;
- unapproved action token issuance refused;
- approved SQL token consumed once; repeat consumption refused;
- task response deliberately lost after SQL commit;
- fresh executor independently rereads and reconciles that outcome;
- repeated executor invocation creates no duplicate;
- both records, source links and project association independently verified;
- shared completion persisted and reopened as COMPLETED only after readback.

Synthetic workflow `9b8c9493-9f0f-5229-95d0-ac91442ae6ba`, WorkOrder
`536996fd-7c6f-5da6-8ef4-921ffc6b5192`: 2 actions, 1 scheduler restart,
0 provider calls, $0 spent. These IDs belong to throwaway databases.

This does not prove live Google actions, live AI reasoning quality, generic
natural-language action planning, autonomous authority, or a production
adapter automatically finalizing arbitrary WorkOrders. Those remain separate
acceptance requirements. MARKEVITA's runtime bridge and controlled media
recovery proof are also separate; this probe does not claim creative quality.
