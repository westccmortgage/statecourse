# Studio delivery and outcome memory — 2026-09-29

## Original Studio completion

The authenticated analysis results door uses the same read-only SQL projection
as the acceptance suite. Its fixed default WorkOrder can complete only when the
workflow is completed, every subject has an accepted finding, required checks
have finished, no comparison source is unpaired, no disagreement is unresolved,
and no unknown attempt or open money reservation remains. Each accepted observed
finding must have an anchor in the correct file/page and exact current content
hash. Source manifest hashes must match the immutable workflow sources.

The adapter rereads the saved result and persists the complete small accepted
snapshot as completion-gate evidence, with its SHA-256. Reopening is idempotent.
A later result mismatch reports SOURCE_RESULT_CHANGED rather than rewriting the
accepted record. Custom acceptance criteria require their own trusted verifier.
Large outputs require an export rather than an unbounded inline receipt.

Test B uses the real SourceDocumentsPack, source manifest/material resolver,
independent local provider stand-ins, critic, PostgreSQL schema, result reader and
WorkOrder completion. It ingests a non-sensitive prepared PDF, PNG and text,
reopens source evidence, declines an incomplete result, resumes with a fresh
runner without duplicate reads, and reopens the same durable completion.
No real provider calls or new spend. The PDF preparation fixture is generated
with PyMuPDF; this does not claim to have tested browser upload/preparation.

## Operational routing memory

The runtime reads at most 200 recent model attempts from the same organization
and exact domain version. It records existing provider/model, role/version,
independent quality verdict, failure, latency, actual settled cost (null remains
unknown), repair and final acceptance facts. Three comparable measured outcomes
are required before ranking changes. Provider HTTP success alone is not quality.
Current model and role version must match the history. Changed models receive no
inherited score. Evidence, not source or model instructions, determines ranking.

The kernel ranks only already registered, capability-compatible candidates.
Independent reader rotation, used-domain exclusions, SQL submission checks,
authority, price ceilings and unknown-outcome no-retry rules remain mandatory.
The selection reason is persisted with the attempt. Learning cannot create a
provider, approve spend, retry an attempt or clear an uncertain reservation.
Latency and cost are recorded for audit; they do not yet outweigh quality in
ranking. Real-world quality calibration is outside this synthetic proof.

`routing-outcomes.mjs` proves quality changes the eligible selection, while raw
success, changed models/roles and already-used domains cannot bypass the guards.
`source-work-order.mjs` proves the SQL history reader sees independently accepted
source findings and excludes another domain. Migration 075 adds the tenant/time
index used by this bounded reader; its rollback removes only the index.
