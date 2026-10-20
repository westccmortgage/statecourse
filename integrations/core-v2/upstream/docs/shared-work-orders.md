# Shared WorkOrder protocol 1

`workers/core-v2/work-orders/` holds the common intent envelope. It links
existing workflow, completion, source and authority records. It does not
replace Scheduler, DomainPacks, budget reservations or runtime incident policy.

Both `core-v2-analysis` (existing organization membership) and
`core-v2-ceo-admin` (existing signed owner mapping) support create/read/list
and bounded context collection. The analysis door accepts `surface:markevita`
under the same organization boundary. No caller-selected organization is
accepted by the CEO Admin door.

Creation is PROPOSE with zero new spending authority. Caller-supplied budget
or authority fields cannot grant execution. The existing domain submission
may bind a WorkOrder using `work_order_id` and `work_order_revision`, inside
its existing workflow transaction. The original submission's authorization
checks remain required.

Stable identity includes organization, surface, initiating user and request
key. Same key with different intent fails. Context requests specify system,
type, identifier, revision, reason and scope. Observations outside those
requests fail; observations remain source material, not verified facts or
instructions. Context changes use compare-and-set revisions and append events.

An execution ending does not complete the WorkOrder. Trusted domain adapters
call `saveWorkOrderCompletion` after independent verification. That delegates
to the existing completion predicate and SQL constraints and requires every
original acceptance criterion. Public work-order APIs cannot submit a
boolean completion claim. Terminal evidence cannot be silently replaced.

Native PostgreSQL CI runs `workers/core-v2/tests/work-orders.mjs`. The same
assertions were also run locally over every migration using PGlite PostgreSQL
18. This proves contract, persistence, authority, context and completion
boundaries; it is not proof of paid generation or autonomous goal interpretation.
