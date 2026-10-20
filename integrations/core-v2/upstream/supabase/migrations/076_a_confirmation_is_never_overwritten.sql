-- 076 · A confirmation is never overwritten.
--
-- The product's question is not "what is the state of this room" but "what
-- was the state of this room on the fifth of March, who signed for it, and
-- what had been paid by then". Three things stood between the record and that
-- question.
--
-- A person's verdict on a marker — "yes, that is the outlet", "no, that is
-- not a window" — was kept in the browser that pressed the button. The same
-- person in a headset, or a colleague on a tablet, saw the AI's suggestion as
-- if nobody had looked at it.
--
-- A room's approval and the approval of its AI reading were single rows,
-- rewritten in place. Reopening a room erased the fact that it had been
-- confirmed, by whom and when; confirming it again erased the reopening. A
-- history that keeps only its last line is not a history.
--
-- And a withdrawn cost recorded that it was withdrawn but not when, so the
-- ledger as it stood on a past date could not be rebuilt.
--
-- So: every verdict on a marker is a row, and every change to a room's or a
-- reading's approval writes a row, and neither kind of row can be changed or
-- removed afterwards. A person who changes their mind adds a row; the earlier
-- one stays, with its date and its author. The AI writes none of these: every
-- marker verdict names the signed-in person who gave it, and the approval
-- history is written by the database from the approvals people make.

-- ----------------------------------------------------------- marker verdicts
create table if not exists public.marker_reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  -- Plain ids rather than foreign keys. A room deleted, a file moved or a
  -- reading replaced must not reach back and rewrite what a person decided,
  -- and a foreign key's ON DELETE would do exactly that.
  space_id uuid,
  evidence_id uuid,
  suggestion_id uuid,
  -- Which marker: for one the AI placed, the capture and the observation's
  -- words; for one a person placed, that marker's own id. The same key on
  -- every device, so a verdict given on a laptop lands on the same pin in a
  -- headset.
  marker_key text not null check (char_length(marker_key) between 1 and 4000),
  origin text not null check (origin in ('ai', 'person')),
  verdict text not null check (verdict in ('placed', 'confirmed', 'rejected', 'needs_more')),
  -- Where the pin is, as a fraction of the equirectangular frame, and the
  -- second of the capture it was seen at. Kept with the verdict so a pin a
  -- person placed by hand can be put back on any device.
  u double precision not null check (u >= 0 and u <= 1),
  v double precision not null check (v >= 0 and v <= 1),
  timestamp_seconds double precision check (timestamp_seconds is null or timestamp_seconds >= 0),
  label text check (label is null or char_length(label) <= 200),
  detail text check (detail is null or char_length(detail) <= 4000),
  category text check (category is null or char_length(category) <= 60),
  note text check (note is null or char_length(note) <= 600),
  reviewed_by uuid not null references auth.users(id),
  -- Who, in words a colleague can read, as the account named itself when the
  -- verdict was given. The id above is the proof; this is the sentence.
  reviewed_by_label text,
  reviewed_at timestamptz not null default now(),
  -- Only a person places a pin. The AI's pins come from its reading.
  check (verdict <> 'placed' or origin = 'person')
);

create index if not exists marker_reviews_by_moment
  on public.marker_reviews(property_id, reviewed_at);
create index if not exists marker_reviews_by_marker
  on public.marker_reviews(property_id, marker_key, reviewed_at);

comment on table public.marker_reviews is
  'One row per verdict a person gave on a marker. Never updated or deleted: a later verdict is a later row.';

-- ---------------------------------------------------------- approval history
create table if not exists public.approval_history (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  space_id uuid,
  -- 'room' is the space's own review state; 'reading' is the decision on the
  -- AI's interpretation of it. The Studio sets both together, other paths
  -- set one, and the history keeps them apart because they are different
  -- statements.
  subject text not null check (subject in ('room', 'reading')),
  subject_id uuid not null,
  state text not null,
  previous_state text,
  note text,
  actor_id uuid references auth.users(id),
  actor_label text,
  occurred_at timestamptz not null default now(),
  -- 'backfill' rows were reconstructed when this table was created, from the
  -- audit trail and the approvals that already existed. Their times are the
  -- times those records carry.
  source text not null default 'live' check (source in ('live', 'backfill'))
);

create index if not exists approval_history_by_moment
  on public.approval_history(property_id, occurred_at);

comment on table public.approval_history is
  'Every change to a room''s or a reading''s approval, in order, written by the database. Never updated or deleted.';

-- ------------------------------------------------------- neither is rewritten
create or replace function public.decision_record_is_permanent()
returns trigger language plpgsql as $$
begin
  raise exception '% is a permanent record: a later decision is a new row, never a change to an earlier one', tg_table_name
    using errcode = 'insufficient_privilege';
end $$;

comment on function public.decision_record_is_permanent() is
  'Refuses UPDATE, DELETE and TRUNCATE on decision history, for every role including the service role.';

drop trigger if exists marker_reviews_are_permanent on public.marker_reviews;
create trigger marker_reviews_are_permanent before update or delete on public.marker_reviews
  for each row execute function public.decision_record_is_permanent();
drop trigger if exists marker_reviews_are_not_emptied on public.marker_reviews;
create trigger marker_reviews_are_not_emptied before truncate on public.marker_reviews
  for each statement execute function public.decision_record_is_permanent();

drop trigger if exists approval_history_is_permanent on public.approval_history;
create trigger approval_history_is_permanent before update or delete on public.approval_history
  for each row execute function public.decision_record_is_permanent();
drop trigger if exists approval_history_is_not_emptied on public.approval_history;
create trigger approval_history_is_not_emptied before truncate on public.approval_history
  for each statement execute function public.decision_record_is_permanent();

-- Read by anybody who can see the project; written by nobody directly. A
-- verdict arrives through record_marker_review, which checks who is asking;
-- the history arrives through the triggers below.
alter table public.marker_reviews enable row level security;
alter table public.approval_history enable row level security;

drop policy if exists marker_reviews_read on public.marker_reviews;
create policy marker_reviews_read on public.marker_reviews for select
using (public.can_access_property(property_id));

drop policy if exists approval_history_read on public.approval_history;
create policy approval_history_read on public.approval_history for select
using (public.can_access_property(property_id));

revoke insert, update, delete, truncate on public.marker_reviews from anon, authenticated;
revoke insert, update, delete, truncate on public.approval_history from anon, authenticated;

-- The words a colleague reads for a person: their email, which is what the
-- account is known by everywhere else in the product.
create or replace function public.person_label(target uuid)
returns text language sql stable security definer set search_path = public, auth as $$
  select email from auth.users where id = target
$$;
revoke all on function public.person_label(uuid) from public, anon, authenticated;

-- ------------------------------------------------------ giving a verdict
create or replace function public.record_marker_review(
  p_property_id uuid,
  p_marker_key text,
  p_origin text,
  p_verdict text,
  p_u double precision,
  p_v double precision,
  p_space_id uuid default null,
  p_evidence_id uuid default null,
  p_suggestion_id uuid default null,
  p_timestamp_seconds double precision default null,
  p_label text default null,
  p_detail text default null,
  p_category text default null,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  property_record public.properties%rowtype;
  actor_role public.studio_role;
  saved public.marker_reviews%rowtype;
begin
  if auth.uid() is null then
    raise exception 'A verdict names the person who gave it';
  end if;
  select * into property_record from public.properties where id = p_property_id;
  if property_record.id is null then
    raise exception 'That project is not in the record';
  end if;
  actor_role := public.property_role(p_property_id);
  /* Putting a pin on something you saw is an observation, open to everybody
     working on the project. Saying the AI was right or wrong is a decision,
     and decisions belong to the people who run it. */
  if p_verdict = 'placed' then
    if actor_role is null or actor_role not in ('owner', 'admin', 'reviewer', 'project_manager', 'contributor') then
      raise exception 'Placing a marker is for the people working on the project';
    end if;
  elsif actor_role is null or actor_role not in ('owner', 'admin', 'reviewer', 'project_manager') then
    raise exception 'Confirming what the record shows is for the people who run the project';
  end if;
  if p_space_id is not null and not exists (
    select 1 from public.spaces where id = p_space_id and property_id = p_property_id
  ) then
    raise exception 'That room is not in this project';
  end if;
  if p_evidence_id is not null and not exists (
    select 1 from public.evidence_items where id = p_evidence_id and property_id = p_property_id
  ) then
    raise exception 'That capture is not in this project';
  end if;
  if p_suggestion_id is not null and not exists (
    select 1 from public.ai_suggestions where id = p_suggestion_id and property_id = p_property_id
  ) then
    raise exception 'That reading is not in this project';
  end if;
  if p_verdict = 'placed' and coalesce(trim(p_label), '') = '' then
    raise exception 'A marker placed by hand says what it marks';
  end if;

  insert into public.marker_reviews(organization_id, property_id, space_id, evidence_id, suggestion_id,
    marker_key, origin, verdict, u, v, timestamp_seconds, label, detail, category, note, reviewed_by, reviewed_by_label)
  values (property_record.organization_id, p_property_id, p_space_id, p_evidence_id, p_suggestion_id,
    trim(p_marker_key), p_origin, p_verdict, p_u, p_v, p_timestamp_seconds,
    nullif(trim(p_label), ''), nullif(trim(p_detail), ''), nullif(trim(p_category), ''),
    nullif(trim(p_note), ''), auth.uid(), public.person_label(auth.uid()))
  returning * into saved;

  return jsonb_build_object('id', saved.id, 'reviewed_at', saved.reviewed_at,
    'reviewed_by', saved.reviewed_by, 'reviewed_by_label', saved.reviewed_by_label);
end;
$$;

comment on function public.record_marker_review(uuid, text, text, text, double precision, double precision,
  uuid, uuid, uuid, double precision, text, text, text, text) is
  'One person''s verdict on one marker, added to the record. Earlier verdicts stay.';

revoke all on function public.record_marker_review(uuid, text, text, text, double precision, double precision,
  uuid, uuid, uuid, double precision, text, text, text, text) from public, anon;
grant execute on function public.record_marker_review(uuid, text, text, text, double precision, double precision,
  uuid, uuid, uuid, double precision, text, text, text, text) to authenticated;

-- ----------------------------------------------------- approvals, as they happen
create or replace function public.remember_reading_decision()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  reading record;
begin
  /* The Studio upserts the same row on every press; a press that changes
     nothing is not a decision. */
  if tg_op = 'UPDATE'
     and new.state is not distinct from old.state
     and new.reviewer_note is not distinct from old.reviewer_note
     and new.edited_body is not distinct from old.edited_body
     and new.reviewed_at is not distinct from old.reviewed_at then
    return new;
  end if;
  select property_id, space_id into reading from public.ai_suggestions where id = new.suggestion_id;
  if reading.property_id is null then
    return new;
  end if;
  insert into public.approval_history(organization_id, property_id, space_id, subject, subject_id,
    state, previous_state, note, actor_id, actor_label)
  values (new.organization_id, reading.property_id, reading.space_id, 'reading', new.suggestion_id,
    new.state::text, case when tg_op = 'UPDATE' then old.state::text end, new.reviewer_note, new.reviewed_by,
    public.person_label(new.reviewed_by));
  return new;
end $$;

drop trigger if exists suggestion_reviews_history on public.suggestion_reviews;
create trigger suggestion_reviews_history after insert or update on public.suggestion_reviews
  for each row execute function public.remember_reading_decision();

create or replace function public.remember_room_decision()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.approval_history(organization_id, property_id, space_id, subject, subject_id,
    state, previous_state, actor_id, actor_label)
  values (new.organization_id, new.property_id, new.id, 'room', new.id,
    new.review_state::text, case when tg_op = 'UPDATE' then old.review_state::text end, auth.uid(),
    public.person_label(auth.uid()));
  return new;
end $$;

drop trigger if exists spaces_review_history on public.spaces;
create trigger spaces_review_history after update of review_state on public.spaces
  for each row when (old.review_state is distinct from new.review_state)
  execute function public.remember_room_decision();
drop trigger if exists spaces_review_history_at_birth on public.spaces;
create trigger spaces_review_history_at_birth after insert on public.spaces
  for each row when (new.review_state is distinct from 'needs_review')
  execute function public.remember_room_decision();

-- ------------------------------------------------- what already happened
-- Reading decisions the audit trail already holds, each at the moment it was
-- made — including the ones a later press overwrote.
insert into public.approval_history(organization_id, property_id, space_id, subject, subject_id,
  state, previous_state, actor_id, actor_label, occurred_at, source)
select ae.organization_id, s.property_id, s.space_id, 'reading', sr.suggestion_id,
  ae.detail->>'state', ae.detail->>'previous_state', ae.actor_id, public.person_label(ae.actor_id),
  ae.created_at, 'backfill'
from public.audit_events ae
join public.suggestion_reviews sr on sr.id::text = ae.entity_id
join public.ai_suggestions s on s.id = sr.suggestion_id
where ae.entity_type = 'suggestion_reviews'
  and ae.action in ('decision.made', 'decision.changed')
  and ae.detail->>'state' is not null
  and not exists (
    select 1 from public.approval_history h
    where h.subject = 'reading' and h.subject_id = sr.suggestion_id and h.occurred_at = ae.created_at
  );

-- Decisions older than the audit trail survive only as their latest row.
insert into public.approval_history(organization_id, property_id, space_id, subject, subject_id,
  state, note, actor_id, actor_label, occurred_at, source)
select sr.organization_id, s.property_id, s.space_id, 'reading', sr.suggestion_id,
  sr.state::text, sr.reviewer_note, sr.reviewed_by, public.person_label(sr.reviewed_by), sr.reviewed_at, 'backfill'
from public.suggestion_reviews sr
join public.ai_suggestions s on s.id = sr.suggestion_id
where not exists (
  select 1 from public.approval_history h
  where h.subject = 'reading' and h.subject_id = sr.suggestion_id
);

-- A room's own approval was never timed. The Studio confirms the room and its
-- reading with one press, so a confirmed room takes the time and the person of
-- the latest confirmed reading in it. A confirmed room with no such reading
-- has no date anybody can vouch for, and gets no row.
insert into public.approval_history(organization_id, property_id, space_id, subject, subject_id,
  state, actor_id, actor_label, occurred_at, source)
select sp.organization_id, sp.property_id, sp.id, 'room', sp.id,
  'confirmed', latest.actor_id, public.person_label(latest.actor_id), latest.occurred_at, 'backfill'
from public.spaces sp
join lateral (
  select h.actor_id, h.occurred_at from public.approval_history h
  where h.subject = 'reading' and h.space_id = sp.id and h.state = 'confirmed'
  order by h.occurred_at desc limit 1
) latest on true
where sp.review_state = 'confirmed'
  and not exists (
    select 1 from public.approval_history h
    where h.subject = 'room' and h.subject_id = sp.id
  );

-- ------------------------------------------------- when money was withdrawn
alter table public.project_costs add column if not exists superseded_at timestamptz;

comment on column public.project_costs.superseded_at is
  'When the entry was withdrawn. Null on an active entry; null on one withdrawn before this column existed, whose moment is unknown.';

create or replace function public.supersede_project_cost(p_cost_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  cost_record public.project_costs%rowtype;
  actor_role public.studio_role;
begin
  select * into cost_record from public.project_costs where id = p_cost_id;
  if cost_record.id is null then
    raise exception 'That cost entry is not in the record';
  end if;
  actor_role := public.property_role(cost_record.property_id);
  if actor_role is null or actor_role not in ('owner', 'admin', 'project_manager') then
    raise exception 'Withdrawing a cost entry is for the people who run the project';
  end if;
  /* Superseded, never deleted: a figure that was once entered against this
     project is part of what happened, even after somebody corrected it. And
     the moment it stopped counting is kept, so the ledger as it stood on any
     earlier day can be read back. */
  update public.project_costs
     set state = 'superseded',
         superseded_at = coalesce(superseded_at, now())
   where id = p_cost_id;
  return true;
end;
$$;
