# CEO Admin delivery receipt — 2026-09-29

The default desk-batch WorkOrder asks for a verified audit and approval-gated
proposals. It does not authorize those actions and does not ask for their effects
to have happened. Completion now reflects that exact contract.

Admin first atomically syncs a complete Core result. A separate service-only SQL
function locks the batch and independently reopens every current subject, output,
input and proposal. Stale revision, altered content or missing rows refuse PASS.
Only this server-side readback is sent through the existing signed door.

Core matches the owner, workflow, batch, revision and subject count against its
own fresh record. It refuses unresolved evidence, unknown attempts and open
reservations. The accepted receipt and result digest join the existing shared
completion record. Repeated receipt delivery is idempotent. A custom execution
WorkOrder cannot be completed by this audit receipt.

The cross-system synthetic acceptance opens two WorkOrders: an audit contract and
an internal task/Waiting For contract. The real SQL receipt completes the former;
the latter remains unfinished until existing owner-gated executors write the two
records, independent readback confirms them, and the trusted test verifier binds
those exact effects. The latter verifier is scenario-specific: arbitrary natural
language execution goals still require a supported domain plan and criteria.

Tests also inject damaged projection evidence, stale receipt, rejected receipt,
and a completion acknowledgement timeout. Neither a repeated sync nor a receipt
retry runs actions or calls providers. The historical partial workflow is not
settled or labelled completed by this addition.
