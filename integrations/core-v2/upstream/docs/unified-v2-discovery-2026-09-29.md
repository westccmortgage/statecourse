# Unified production discovery — 2026-09-29

Owner assignment: unified production readiness, supplied September 28 at 21:51 America/Los_Angeles. Real autonomous operation remains off. No provider spending, email sending, deletion, publication, or external meeting changes are authorized. Synthetic/reversible tests and bounded code deployments are authorized. Historical workflows are not test fixtures.

## Baselines before implementation

| Surface | Repository / deployment | Database / record |
| --- | --- | --- |
| Measured Decision Studio / shared Core | westccmortgage/measured-decision-ai main 093c27fa3ab0d8ec50d0c12ffd59f0f997e5949c; measureddecision.ai Netlify 6abb3e07bdf6100008808df8, ready at exact SHA | hbqlhplgqwuesrovbiye; live migration 073; Core analysis, CEO Admin door, runner, tick, canary functions |
| CEO Admin | westccmortgage/anatoliykanevsky main a7f23bae059fff01e8973974c7952222ca93a926; anatoliykanevsky.com Netlify 6abb3a55019c850008ec2e5c | visfvdtmvycpyggkxjlp; latest migration-history version 20260929040646; admin and mcp Netlify functions |
| MARKEVITA | westccmortgage/markevita public main 000827750f43fdafa5dba6362ef04097fc9d21d4; Studio on Render, claude/series-studio a34d577891a401af9e926c49e496a5c23c45566c confirmed by health read | Health reports Supabase; exact live project and migrations not exposed by available connections. Render access / active-job state must be established before any process restart. |

## Capability matrix before architectural changes

COMPLETE means the bounded capability is implemented, not that the complete product has passed real-mode acceptance. PARTIAL includes a capability whose wiring or production proof is incomplete. No percentage is assigned.

| Capability | Measured Decision Studio | MARKEVITA | CEO Admin | Shared Core |
| --- | --- | --- | --- | --- |
| Intent intake | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| Common WorkOrder envelope | MISSING | MISSING | MISSING | MISSING |
| Context expansion | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| Planning | PARTIAL | PARTIAL | PARTIAL | COMPLETE |
| Evidence | COMPLETE | PARTIAL | COMPLETE | COMPLETE |
| Decision | COMPLETE | PARTIAL | PARTIAL | COMPLETE |
| Authority | COMPLETE | PARTIAL | COMPLETE | COMPLETE |
| Decision to product action | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| Execution | COMPLETE | COMPLETE | PARTIAL | COMPLETE |
| Independent verification | PARTIAL | PARTIAL | PARTIAL | COMPLETE |
| Technical recovery | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| Human review separation | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| Durable memory | COMPLETE | PARTIAL | COMPLETE | COMPLETE |
| Cost accounting | COMPLETE | PARTIAL | COMPLETE | COMPLETE |
| Idempotency / resume | COMPLETE | PARTIAL | PARTIAL | COMPLETE |
| Atomic result projection | PARTIAL | PARTIAL | MISSING | PARTIAL |
| ChatGPT WorkOrder bridge | NOT APPLICABLE | NOT APPLICABLE | MISSING | MISSING |
| Event / continuation trigger | COMPLETE | PARTIAL | PARTIAL | COMPLETE |
| Verified final delivery | PARTIAL | PARTIAL | PARTIAL | COMPLETE |

## Existing implementation to reuse

Core: SourceManifest, workflowRecordFor, DomainPack, Scheduler, Dispatcher, durable workflow/attempt/claim/decision records, record-based budget ledger, bounded follow-up planner, completionOf, core_v2_task_completions, runtime-incident diagnosis/authority/verifiers, incidents and recovery records. These remain the kernel.

DomainPacks: source-documents, ceo-admin, video-episode, synthetic records/transcripts, runtime-incident policy. The production runner currently rebuilds source-documents, ceo-admin and synthetic-records worlds. Other pack existence does not imply a production caller.

Admin: signed backend door, per-owner mapping, revisioned source records, Decision Audit, approval/token RPCs, existing executor, Gmail/Calendar/contacts services, OAuth MCP. Its result sync writes multiple tables separately. It creates only classify_email proposals automatically. Internal action writes lack independent readback and can misclassify a lost response as a definite failure. MCP safe commands bypass Core appropriately; complex WorkOrder tools are absent.

MARKEVITA: existing paid-call ledger, media pipeline, stored jobs/checkpoints, routing, canonical references, ffmpeg/ffprobe and QA. PR7 adds a measuring/local-recovery adapter but is unmerged and has no production caller. Course Factory direct provider calls and Instant Video's done-job-to-done-product shortcut remain concrete gaps. Marketing is an entrance, not a implemented campaign pipeline.

Historical CEO workflow 59f322b8-d89e-5837-ac54-52e985076070 remains PARTIAL; four uncertain attempts and their $0.491520 remain untouched. af4eb392… is excluded. Historical technical failures must not be relabelled as semantic business disagreements or silently resolved.

## Verification discipline

Use isolated fixtures and a zero-provider-spend boundary. Production code existence, mocked provider behavior, real database readback, deployed commit, and production cross-system acceptance are distinct evidence classes. Report each separately. Do not claim domain creative or professional quality from a synthetic orchestration test.
