-- Approval, training access and payment mode, recorded per offering.
--
-- The question this answers is "may this specific thing be sold, and may it be described
-- as approved" — and it answers it per site, per state, per discipline, per offering, so
-- that approving one never activates another. That separation is the whole point: a
-- California real-estate approval must not switch on California mortgage, and an approval
-- anywhere must not switch on payments anywhere.
--
-- Two rules are enforced here rather than in application code, because they are the two
-- that would be expensive to get wrong:
--
--   1. Live payments require a recorded approval. A check constraint refuses the row.
--   2. Recording an approval does not activate charges. Approval and payment mode are
--      separate columns set by separate acts; nothing derives one from the other.
--
-- Who may set live is enforced in the endpoint, because the database cannot see a session.
-- Both layers exist for the same reason the video gate has both.

begin;

create table if not exists offering_governance_events (
  id uuid primary key default gen_random_uuid(),
  site text not null check (site <> ''),
  state text not null check (state ~ '^[A-Z]{2}$'),
  /* Kept in the key so real-estate and mortgage approvals cannot be confused for one
     another even when they share a state and a regulator. */
  discipline text not null check (discipline in ('real_estate','mortgage')),
  offering_kind text not null check (offering_kind in ('course','package')),
  offering_id text not null check (offering_id <> ''),

  approval_status text not null
    check (approval_status in ('none','submitted','approved','withdrawn','expired')),
  approval_authority text,
  approval_number text,
  approval_effective_date date,
  approval_expires_date date,
  /* What the approval rests on: a filing id, a letter reference, a document digest. Free
     text is accepted because regulators differ; an empty object is not. */
  approval_evidence jsonb not null default '{}'::jsonb,

  /* Free study, offered before or without approval. Deliberately independent of both
     approval and payment: it is how a course is used for training. */
  training_access_enabled boolean not null default false,

  payment_mode text not null default 'disabled'
    check (payment_mode in ('disabled','sandbox','live')),

  recorded_by uuid not null,
  recorded_role text not null,
  note text not null check (length(btrim(note)) >= 10),
  recorded_at timestamptz not null default now(),

  /* Live charging requires an approval that names itself. "Approved" with no authority and
     no number is a claim, not an approval, and it must not be able to take money. */
  constraint live_requires_named_approval check (
    payment_mode <> 'live' or (
      approval_status = 'approved'
      and coalesce(btrim(approval_authority),'') <> ''
      and coalesce(btrim(approval_number),'') <> ''
      and approval_effective_date is not null
    )
  ),
  constraint approval_window_ordered check (
    approval_expires_date is null or approval_effective_date is null
    or approval_expires_date > approval_effective_date
  ),
  constraint approved_names_its_authority check (
    approval_status <> 'approved' or (
      coalesce(btrim(approval_authority),'') <> '' and coalesce(btrim(approval_number),'') <> ''
    )
  )
);

create index if not exists offering_governance_current_idx
  on offering_governance_events(site, state, discipline, offering_id, recorded_at desc);

create or replace view current_offering_governance with (security_invoker=true) as
select distinct on (site, state, discipline, offering_id)
  id, site, state, discipline, offering_kind, offering_id,
  approval_status, approval_authority, approval_number,
  approval_effective_date, approval_expires_date, approval_evidence,
  training_access_enabled, payment_mode,
  recorded_by, recorded_role, note, recorded_at
from offering_governance_events
order by site, state, discipline, offering_id, recorded_at desc, id desc;

/*
 * What may be said about an offering, and what may be charged for it, derived rather than
 * stored.
 *
 * `representation` is the load-bearing column. An offering without a currently effective
 * approval may be described as training and as nothing else — not as licensing education,
 * not as continuing education, not as approved. Deriving it means an approval that expires
 * changes the wording by itself, on the next read, with nobody remembering to.
 */
create or replace view offering_public_status with (security_invoker=true) as
select
  g.site, g.state, g.discipline, g.offering_kind, g.offering_id,
  g.approval_status, g.approval_authority, g.approval_number,
  g.approval_effective_date, g.approval_expires_date,
  g.training_access_enabled,
  g.payment_mode,
  (g.approval_status = 'approved'
     and (g.approval_effective_date is null or g.approval_effective_date <= current_date)
     and (g.approval_expires_date is null or g.approval_expires_date > current_date)
  ) as approval_currently_effective,
  case
    when g.approval_status = 'approved'
      and (g.approval_effective_date is null or g.approval_effective_date <= current_date)
      and (g.approval_expires_date is null or g.approval_expires_date > current_date)
    then 'approved'
    else 'training_only'
  end as representation,
  /* Charging is permitted only where a currently effective approval and live mode meet.
     An expired approval stops charging without anyone editing the payment mode. */
  (g.payment_mode = 'live'
     and g.approval_status = 'approved'
     and (g.approval_effective_date is null or g.approval_effective_date <= current_date)
     and (g.approval_expires_date is null or g.approval_expires_date > current_date)
  ) as live_charging_permitted,
  g.recorded_at
from current_offering_governance g;

-- The ledger is append-only: a change of mind is a new row, and the previous decision
-- stays readable with the name of whoever made it.
drop trigger if exists append_only_offering_governance_events on offering_governance_events;
create trigger append_only_offering_governance_events
before update or delete on offering_governance_events
for each row execute function admin_console_refuse_record_mutation();

alter table offering_governance_events enable row level security;
revoke all on offering_governance_events from public, anon, authenticated;
revoke all on current_offering_governance, offering_public_status from public, anon, authenticated;
grant select, insert on offering_governance_events to service_role;
grant select on current_offering_governance, offering_public_status to service_role;

commit;
