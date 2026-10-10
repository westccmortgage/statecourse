-- Add private, tenant-scoped Tutor article drafts with immutable revisions and idempotent MCP writes.
begin;

create schema if not exists statecourse_ai_private;
revoke all on schema statecourse_ai_private from public, anon, authenticated;

create table if not exists statecourse_ai_private.tutor_articles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  project_id uuid not null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(slug) <= 100),
  title text not null check (length(title) between 1 and 180),
  summary text not null check (length(summary) between 1 and 1000),
  jurisdiction text not null check (jurisdiction ~ '^(US|US-NMLS|[A-Z]{2})$'),
  locale text not null check (locale ~ '^[a-z]{2,3}(?:-[A-Z]{2})?$'),
  body_markdown text not null check (length(body_markdown) between 1 and 100000),
  source_refs jsonb not null check (jsonb_typeof(source_refs) = 'array'),
  content_classification text not null default 'public_original'
    check (content_classification = 'public_original'),
  status text not null default 'draft' check (status = 'draft'),
  revision integer not null default 1 check (revision > 0),
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  created_by_subject text not null check (length(created_by_subject) between 1 and 200),
  updated_by_subject text not null check (length(updated_by_subject) between 1 and 200),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  unique (account_id, slug)
);

create index if not exists tutor_articles_project_idx
  on statecourse_ai_private.tutor_articles(account_id, project_id, updated_at desc);

create table if not exists statecourse_ai_private.tutor_article_revisions (
  article_id uuid not null references statecourse_ai_private.tutor_articles(id),
  account_id uuid not null,
  revision integer not null check (revision > 0),
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_by_subject text not null check (length(created_by_subject) between 1 and 200),
  created_at timestamptz not null default clock_timestamp(),
  primary key (article_id, revision)
);

create index if not exists tutor_article_revisions_tenant_idx
  on statecourse_ai_private.tutor_article_revisions(account_id, article_id, revision desc);

create table if not exists statecourse_ai_private.tutor_article_idempotency (
  account_id uuid not null,
  idempotency_key text not null
    check (idempotency_key ~ '^[A-Za-z0-9._:-]{8,128}$'),
  request_hash text not null check (request_hash ~ '^[0-9a-f]{64}$'),
  response jsonb not null check (jsonb_typeof(response) = 'object'),
  created_at timestamptz not null default clock_timestamp(),
  primary key (account_id, idempotency_key)
);

alter table statecourse_ai_private.tutor_articles enable row level security;
alter table statecourse_ai_private.tutor_article_revisions enable row level security;
alter table statecourse_ai_private.tutor_article_idempotency enable row level security;
revoke all on table
  statecourse_ai_private.tutor_articles,
  statecourse_ai_private.tutor_article_revisions,
  statecourse_ai_private.tutor_article_idempotency
from public, anon, authenticated;

create or replace function public.statecourse_ai_upsert_tutor_article(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  tenant uuid;
  project uuid;
  actor_subject text := btrim(coalesce(payload->>'actor_subject', ''));
  article_slug text := btrim(coalesce(payload->>'slug', ''));
  article_title text := btrim(coalesce(payload->>'title', ''));
  article_summary text := btrim(coalesce(payload->>'summary', ''));
  article_jurisdiction text := btrim(coalesce(payload->>'jurisdiction', ''));
  article_locale text := btrim(coalesce(payload->>'locale', ''));
  article_body text := coalesce(payload->>'body_markdown', '');
  refs jsonb := coalesce(payload->'source_refs', 'null'::jsonb);
  idem_key text := btrim(coalesce(payload->>'idempotency_key', ''));
  request_hash text;
  article_hash text;
  snapshot jsonb;
  stored statecourse_ai_private.tutor_articles%rowtype;
  prior_idempotency statecourse_ai_private.tutor_article_idempotency%rowtype;
  result jsonb;
  changed boolean := false;
begin
  -- This checks the existing functions-only MCP credential. A client-supplied
  -- account id is never sufficient authority to reach this function.
  perform statecourse_ai_private.assert_backend_key();

  begin
    tenant := (payload->>'account_id')::uuid;
    project := (payload->>'project_id')::uuid;
  exception when invalid_text_representation then
    raise exception 'invalid_tutor_article_identity';
  end;

  if tenant is null or project is null then raise exception 'tutor_article_identity_required'; end if;
  if actor_subject = '' or length(actor_subject) > 200 then raise exception 'invalid_actor_subject'; end if;
  if article_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or length(article_slug) > 100 then
    raise exception 'invalid_tutor_article_slug';
  end if;
  if length(article_title) not between 1 and 180 then raise exception 'invalid_tutor_article_title'; end if;
  if length(article_summary) not between 1 and 1000 then raise exception 'invalid_tutor_article_summary'; end if;
  if article_jurisdiction !~ '^(US|US-NMLS|[A-Z]{2})$' then raise exception 'invalid_tutor_article_jurisdiction'; end if;
  if article_locale !~ '^[a-z]{2,3}(?:-[A-Z]{2})?$' then raise exception 'invalid_tutor_article_locale'; end if;
  if length(article_body) not between 1 and 100000 then raise exception 'invalid_tutor_article_body'; end if;
  if coalesce(payload->>'status', 'draft') <> 'draft' then raise exception 'tutor_article_draft_only'; end if;
  if coalesce(payload->>'content_classification', '') <> 'public_original' then
    raise exception 'public_original_content_required';
  end if;
  if idem_key !~ '^[A-Za-z0-9._:-]{8,128}$' then raise exception 'invalid_idempotency_key'; end if;
  if jsonb_typeof(refs) <> 'array' or jsonb_array_length(refs) not between 1 and 50 then
    raise exception 'official_source_refs_required';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(refs) source_ref
    where jsonb_typeof(source_ref) <> 'object'
      or btrim(coalesce(source_ref->>'source_id', '')) = ''
      or length(source_ref->>'source_id') > 120
      or btrim(coalesce(source_ref->>'title', '')) = ''
      or length(source_ref->>'title') > 300
      or coalesce(source_ref->>'url', '') !~ '^https://'
  ) then
    raise exception 'invalid_official_source_ref';
  end if;

  snapshot := jsonb_build_object(
    'project_id', project,
    'slug', article_slug,
    'title', article_title,
    'summary', article_summary,
    'jurisdiction', article_jurisdiction,
    'locale', article_locale,
    'body_markdown', article_body,
    'source_refs', refs,
    'content_classification', 'public_original',
    'status', 'draft'
  );
  request_hash := encode(sha256(convert_to(payload::text, 'UTF8')), 'hex');
  article_hash := encode(sha256(convert_to(snapshot::text, 'UTF8')), 'hex');

  perform pg_advisory_xact_lock(hashtextextended(tenant::text || ':' || idem_key, 0));
  select * into prior_idempotency
    from statecourse_ai_private.tutor_article_idempotency
    where account_id = tenant and idempotency_key = idem_key;
  if found then
    if prior_idempotency.request_hash is distinct from request_hash then
      raise exception 'idempotency_key_reused_with_different_request';
    end if;
    return prior_idempotency.response;
  end if;

  select * into stored
    from statecourse_ai_private.tutor_articles
    where account_id = tenant and slug = article_slug
    for update;

  if not found then
    insert into statecourse_ai_private.tutor_articles(
      account_id, project_id, slug, title, summary, jurisdiction, locale,
      body_markdown, source_refs, content_classification, status, revision,
      content_hash, created_by_subject, updated_by_subject
    ) values (
      tenant, project, article_slug, article_title, article_summary,
      article_jurisdiction, article_locale, article_body, refs,
      'public_original', 'draft', 1, article_hash, actor_subject, actor_subject
    ) returning * into stored;
    changed := true;
  elsif stored.content_hash is distinct from article_hash or stored.project_id is distinct from project then
    update statecourse_ai_private.tutor_articles
       set project_id = project,
           title = article_title,
           summary = article_summary,
           jurisdiction = article_jurisdiction,
           locale = article_locale,
           body_markdown = article_body,
           source_refs = refs,
           revision = stored.revision + 1,
           content_hash = article_hash,
           updated_by_subject = actor_subject,
           updated_at = clock_timestamp()
     where id = stored.id and account_id = tenant
     returning * into stored;
    changed := true;
  end if;

  if changed then
    insert into statecourse_ai_private.tutor_article_revisions(
      article_id, account_id, revision, content_hash, snapshot,
      created_by_subject
    ) values (
      stored.id, tenant, stored.revision, stored.content_hash, snapshot,
      actor_subject
    );
  end if;

  result := jsonb_build_object(
    'article_id', stored.id,
    'account_id', stored.account_id,
    'project_id', stored.project_id,
    'slug', stored.slug,
    'status', stored.status,
    'revision', stored.revision,
    'content_hash', stored.content_hash,
    'changed', changed,
    'updated_at', stored.updated_at
  );

  insert into statecourse_ai_private.tutor_article_idempotency(
    account_id, idempotency_key, request_hash, response
  ) values (tenant, idem_key, request_hash, result);

  return result;
end;
$$;

revoke all on function public.statecourse_ai_upsert_tutor_article(jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.statecourse_ai_upsert_tutor_article(jsonb)
  to anon, authenticated, service_role;

comment on function public.statecourse_ai_upsert_tutor_article(jsonb) is
  'Functions-only, tenant-scoped, idempotent write path for noncredit Tutor article drafts. Never publishes or awards credit.';

commit;
