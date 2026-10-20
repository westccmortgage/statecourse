-- THE TEXT A READER SAW, KEPT WHERE THE READING HAPPENED.
--
-- A workflow is not finished when the request that started it returns. The
-- watchdog picks it up minutes later, in another process, and hands a critic
-- the same message a reader was handed an hour ago. That text has to be
-- somewhere, and there are exactly two honest answers: the engine keeps it, or
-- the system it came from is asked for it again on every pass.
--
-- Asking again is the wrong answer, and not by a little. The other system's
-- row MOVES — that is what a mailbox is — so a resolver that asked again would
-- hand a critic text no reader ever saw, and the engine would record a
-- disagreement between two readings of two different things. That is the exact
-- failure `workers/core-v2-runner/source-set.ts` was written to make impossible
-- for the uploaded-files domain, and it is made impossible here the same way:
-- the material is addressed by the hash of its own bytes, and a hash this
-- workflow did not declare is not answered.
--
-- WHAT IS AND IS NOT IN HERE.
--
-- In: the sanitised text of one part of one row, the identity the other system
-- holds it under, the version it was at, and when it was captured.
--
-- Not in: any credential, any OAuth token, any address anybody could fetch
-- with, and any raw provider payload. The sanitiser on the way in
-- (workers/core-v2/domains/ceo-admin/records.ts) has already replaced every web
-- and mail address with a marker, and the column comments say so — but the real
-- guarantee is that nothing in the ingest path has anywhere to put a secret.

create table if not exists public.ceo_admin_material (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid not null references public.intelligence_workflows(id) on delete cascade,

  -- WHAT THIS IS ADDRESSED BY, AND BY NOTHING ELSE.
  -- The sha-256 of the exact characters below. A resolver is handed a hash the
  -- packet already authorised and answers with these bytes or with nothing; it
  -- cannot be asked for "the message", only for a hash.
  content_sha256 text not null check (content_sha256 ~ '^[0-9a-f]{64}$'),
  content text not null,

  -- WHERE IT CAME FROM, IN THE OTHER SYSTEM'S OWN WORDS.
  -- Provenance, for a person reading the record afterwards and for nobody's
  -- code: the engine routes by hash. `external_subject_key` is the Admin's
  -- stable name for the row (task:<uuid>, email:<account>:<message>);
  -- `record_version` is that system's version of it, so two readings of two
  -- versions of one row are visibly two readings.
  source_type text not null check (source_type in
    ('task', 'waiting_for', 'email_message', 'calendar_item', 'project_state')),
  external_subject_key text not null,
  record_version text not null,
  segment_kind text not null check (segment_kind in ('record_fields', 'record_text')),

  -- When the other system read the row. Not when we stored it: the difference
  -- is how stale a reading was, and only the first number can say.
  captured_at timestamptz not null,
  created_at timestamptz not null default now(),

  primary key (workflow_id, content_sha256)
);

-- SUPERSESSION IS A QUESTION ABOUT ONE ROW ACROSS WORKFLOWS.
-- "What did this engine last read about this task, and at which version" is the
-- question the Admin asks to decide whether a proposal is still about the row
-- in front of the owner. It is one index, and it is the whole mechanism: a
-- newer version is a different source in a different workflow, and nothing here
-- is ever updated in place.
create index if not exists ceo_admin_material_by_subject
  on public.ceo_admin_material(organization_id, external_subject_key, captured_at desc);
create index if not exists ceo_admin_material_by_workflow
  on public.ceo_admin_material(workflow_id);

-- NOBODY BUT THE SERVICE ROLE, AND NOT BY POLICY BUT BY GRANT.
-- This table holds the contents of somebody's mailbox. There is no user-facing
-- read path to it and there should not be one: what a person is shown is the
-- claim and the quotation under it, which the engine's own tables already hold
-- and already gate. RLS is enabled with no policy at all, so even a future
-- grant made by mistake reaches nothing.
alter table public.ceo_admin_material enable row level security;
revoke all on table public.ceo_admin_material from public, anon, authenticated;
grant select, insert, delete on table public.ceo_admin_material to service_role;

comment on table public.ceo_admin_material is
  'The sanitised text of one part of one row of another system, addressed by the hash of its own bytes, so a reader and a critic minutes apart are handed the same characters. Holds no credential, no token and no address.';
comment on column public.ceo_admin_material.content_sha256 is
  'sha-256 of `content`. The only way in: a resolver answers a hash the packet authorised, never a query.';
comment on column public.ceo_admin_material.external_subject_key is
  'The submitting system''s own stable name for the row. Provenance for a person; the engine routes by hash.';
comment on column public.ceo_admin_material.record_version is
  'The submitting system''s version of the row when it was captured. A new version is a new source in a new workflow, never an edit of this one.';

-- ─────────────────────────────────────────────────────────── the one door in
--
-- Written with the workflow, inside the transaction that creates it. A store
-- that accepted material after the workflow existed would allow a workflow
-- whose first pass finds nothing to read, which is a failure nobody would see
-- until a watchdog had retried it five times and given up.
--
-- `security definer` because the caller is the service role of an Edge Function
-- that has already proved the caller belongs to this organization; the function
-- re-checks that the workflow is that organization's, so a wrong id cannot
-- write into somebody else's workflow even if the door is called directly.
create or replace function public.ceo_admin_put_material(
  p_workflow_id uuid,
  p_items jsonb
) returns integer language plpgsql security definer set search_path = public as $$
declare
  wf public.intelligence_workflows;
  written integer;
begin
  select * into wf from public.intelligence_workflows where id = p_workflow_id;
  if not found then raise exception 'ceo_admin: no such workflow'; end if;
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'ceo_admin: material is a list of items';
  end if;

  -- The bytes decide the hash, and the hash is recomputed here rather than
  -- trusted: a caller that sent a hash of something else would make every
  -- later read miss, silently, in another process.
  insert into public.ceo_admin_material(
    organization_id, workflow_id, content_sha256, content,
    source_type, external_subject_key, record_version, segment_kind, captured_at)
  select
    wf.organization_id, wf.id,
    encode(sha256(convert_to(item->>'content', 'UTF8')), 'hex'),
    item->>'content',
    item->>'source_type', item->>'external_subject_key',
    item->>'record_version', item->>'segment_kind',
    (item->>'captured_at')::timestamptz
  from jsonb_array_elements(p_items) as item
  on conflict (workflow_id, content_sha256) do nothing;
  get diagnostics written = row_count;

  perform public.core_v2_audit(wf.organization_id, 'ceo_admin.material.written',
    'workflow', p_workflow_id::text,
    jsonb_build_object('items', jsonb_array_length(p_items), 'written', written));
  return written;
end;
$$;

revoke all on function public.ceo_admin_put_material(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.ceo_admin_put_material(uuid, jsonb) to service_role;

-- ───────────────────────────────────────────────────────── the one door out
--
-- By hash, for one workflow, and nothing else. There is no listing, no search
-- and no "give me this subject's text": a resolver that could ask a question
-- could widen an assignment, and the whole material boundary in
-- `workers/core-v2-runtime/material/` exists so that it cannot.
create or replace function public.ceo_admin_read_material(
  p_workflow_id uuid,
  p_hashes text[]
) returns table (content_sha256 text, content text)
language sql security definer set search_path = public as $$
  select m.content_sha256, m.content
    from public.ceo_admin_material m
   where m.workflow_id = p_workflow_id
     and m.content_sha256 = any(p_hashes);
$$;

revoke all on function public.ceo_admin_read_material(uuid, text[]) from public, anon, authenticated;
grant execute on function public.ceo_admin_read_material(uuid, text[]) to service_role;

-- ══════════════════════════════════════════════ who the other system is here
--
-- The CEO Admin is one owner of one other system, and Core V2 is multi-tenant.
-- Something has to say which organization that owner's workflows belong to, and
-- it must be a row rather than an environment variable: a variable that changes
-- silently re-points a person's whole history at another tenant.
--
-- The mapping is deliberately narrow. It does not hold the Admin's owner
-- credentials, cannot be read by a browser, and grants nothing on its own —
-- membership in `organization_members` is still what authorises, exactly as it
-- does for a person. This only answers "which organization, and is that
-- submitter still allowed to submit".
create table if not exists public.ceo_admin_tenants (
  -- The Admin's own owner user id, in the Admin's own Supabase project. An
  -- opaque identifier here: this database has no way to resolve it and no
  -- business trying.
  admin_owner_user_id uuid primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  -- The service account in THIS project that the Admin backend signs as. It is
  -- a member of the organization like anybody else; this row only records which
  -- one belongs to which Admin owner, so a submission naming one owner cannot
  -- be signed by another owner's service account.
  submitter_user_id uuid not null,
  label text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, submitter_user_id)
);

alter table public.ceo_admin_tenants enable row level security;
revoke all on table public.ceo_admin_tenants from public, anon, authenticated;
grant select on table public.ceo_admin_tenants to service_role;

comment on table public.ceo_admin_tenants is
  'Which Core V2 organization an external administrative owner''s workflows belong to, and which service account may submit them. Authorises nothing by itself: organization_members still decides.';

-- The one question the door asks of it: this submitter, this owner, this
-- organization — yes or no. Returns the organization so a caller cannot pass
-- one of its own choosing.
create or replace function public.ceo_admin_tenant_for(
  p_submitter uuid,
  p_admin_owner uuid
) returns uuid language sql stable security definer set search_path = public as $$
  select t.organization_id
    from public.ceo_admin_tenants t
   where t.admin_owner_user_id = p_admin_owner
     and t.submitter_user_id = p_submitter
     and t.enabled
     and exists (
       select 1 from public.organization_members m
        where m.organization_id = t.organization_id
          and m.user_id = p_submitter);
$$;

revoke all on function public.ceo_admin_tenant_for(uuid, uuid) from public, anon, authenticated;
grant execute on function public.ceo_admin_tenant_for(uuid, uuid) to service_role;
