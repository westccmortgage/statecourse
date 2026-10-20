# Shared factory recovery — 2026-09-29

The existing Runtime Governor makes the decision. The factory measures artifacts,
executes the permitted local operation, then measures again. SQL migrations 069,
070 and 074 preserve incidents, fences, verification and WorkOrder completion.
There is no second planning or recovery policy in the Python transport.

## Bounded production bridge

`core-v2-factory` has a dedicated HMAC secret and deployment-owned organization /
submitter mapping. A valid organization membership is required. It starts dormant
when these settings are missing. It exposes scoped WorkOrder records and local
recovery only. It grants no provider budget, publication or owner decision.

Only existing-asset assembly, master rebuilding and QA can dispatch. SQL serializes
claims by WorkOrder. At most three local attempts are allowed. Repeated requests,
including changed artifact facts after a lost reply, return the unsettled fence
for readback; they cannot dispatch another attempt. Unknown paid outcomes remain
blocked with their original ledger. The factory list excludes other surfaces.

The narrow existing-master contract requires measured decoding, duration,
dimensions, fresh QA bound to the current SHA-256, unchanged selected assets and
zero new provider activity. These checks bind the existing shared completion
record. Creative acceptance and publication are not implied by technical QA.
Custom WorkOrders cannot be completed through this fixed technical contract.

## Proof

- `workers/core-v2-runner/tests/shared-recovery.mjs`: actual migrations and SQL
  claims, duplicate preparation, changed-facts/lost-reply recovery, wrong fence,
  repeated settlement, outcome memory, unknown reservations preserved.
- Python and TypeScript pin the same HMAC vector; timeout makes one submission.
- MARKEVITA `pipeline/tests/test_shared_core_completion.py`: actual ffmpeg media,
  missing master despite an existing assembly checkpoint, Core-selected repair,
  independent QA, SHA-256-bound completion, unchanged scene bytes and synthetic
  prior ledger, then a process restart reopening the durable completed record.
  Local provider calls: 0. New spend: 0. This is not live creative-quality proof.
- The factory persists and reads back its existing private checkpoint before
  acknowledging completion to Core. Active production jobs and the existing
  series lease prevent concurrent editing of a live episode.

Run the cross-repository proof with `CORE_V2_REPO_ROOT` and `ADMIN_REPO_ROOT`
pointing to the checked repositories. The local helper uses PGlite with every
migration, while engine CI also exercises the shared recovery on PostgreSQL 16.

## Exact deployment boundary

The Core endpoint may be deployed dormant. The MARKEVITA adapter must be deployed
from its actual Render branch, `claude/series-studio`, not assumed `main`.
Before that restart, inspect active production jobs using the authenticated host /
database. Configure a dedicated factory secret at both ends and bind only an
existing authorized organization/submitter; never copy the CEO Admin secret or
create owner authority. Current session has no Render configuration / job access.
This is a production activation gate, not evidence of a completed live bridge.
