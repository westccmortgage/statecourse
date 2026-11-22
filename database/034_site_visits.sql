-- First-party visit counting for statecourse.com: which pages are opened, from where, and
-- whether the visitor looks like a person or an automated client.
--
-- What is deliberately NOT stored: the IP address, the full user-agent string, names,
-- email addresses, query strings, or anything typed into a page. `day_hash` is a one-way
-- hash that changes every day, so the same browser cannot be followed from one day to the
-- next without the visitor's consent. `visitor_id` is set only after the visitor presses
-- Accept on the cookie notice.
--
-- NOT APPLIED TO PRODUCTION BY THIS COMMIT. Applying it is a production change and needs
-- the owner's approval. Until it is applied the collector discards every visit and the
-- site runs unchanged.
begin;
create table if not exists site_visits (
 id bigint generated always as identity primary key,
 occurred_at timestamptz not null default now(),
 kind text not null default 'view' check (kind in ('view','consent')),
 path text not null check (path ~ '^/' and length(path) <= 200),
 source_kind text not null check (source_kind in ('direct','internal','search','social','ai','campaign','referral')),
 source_name text check (source_name is null or length(source_name) <= 120),
 utm_source text check (utm_source is null or length(utm_source) <= 80),
 utm_medium text check (utm_medium is null or length(utm_medium) <= 80),
 utm_campaign text check (utm_campaign is null or length(utm_campaign) <= 80),
 country text check (country is null or length(country) <= 2),
 region text check (region is null or length(region) <= 80),
 city text check (city is null or length(city) <= 80),
 device text not null check (device in ('desktop','mobile','tablet','other')),
 browser text check (browser is null or length(browser) <= 30),
 visitor_class text not null check (visitor_class in ('human','bot','suspect')),
 bot_name text check (bot_name is null or length(bot_name) <= 60),
 script_ran boolean not null,
 day_hash text not null check (day_hash ~ '^[a-f0-9]{16}$'),
 consent text not null check (consent in ('accepted','declined','unset')),
 visitor_id uuid,
 -- A remembered visitor exists only with consent.
 check (visitor_id is null or consent = 'accepted')
);
create index if not exists site_visits_time on site_visits(occurred_at);
create index if not exists site_visits_visitor on site_visits(visitor_id, occurred_at) where visitor_id is not null;

-- A recorded visit is never edited. Old rows may be removed in bulk for retention.
create or replace function site_visits_no_update() returns trigger language plpgsql as $$
begin raise exception 'site_visit_immutable'; end $$;
drop trigger if exists site_visits_no_update on site_visits;
create trigger site_visits_no_update before update on site_visits for each row execute function site_visits_no_update();

create table if not exists site_daily_reports (
 day date primary key,
 report jsonb not null,
 created_at timestamptz not null default now(),
 emailed_at timestamptz
);

-- Everything the daily report says about visits, computed in one pass.
-- A browser that opens more than 300 pages in the period is counted as suspect whatever
-- it called itself.
create or replace function site_visit_report(p_from timestamptz, p_to timestamptz)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
with v as (
 select *, case when visitor_class = 'human' and count(*) filter (where kind = 'view') over (partition by day_hash) > 300
   then 'suspect' else visitor_class end as class
 from site_visits where occurred_at >= p_from and occurred_at < p_to
), views as (select * from v where kind = 'view'),
people as (select * from views where class = 'human'),
top as (
 select
  (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select path, count(*)::int views, count(distinct day_hash)::int visitors from people group by path order by views desc, path limit 15) x) pages,
  (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select source_kind kind, count(*)::int views, count(distinct day_hash)::int visitors from people where source_kind <> 'internal' group by source_kind order by visitors desc, kind) x) sources,
  (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select source_kind kind, source_name name, count(distinct day_hash)::int visitors from people where source_kind not in ('internal','direct') and source_name is not null group by source_kind, source_name order by visitors desc, name limit 15) x) referrers,
  (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select utm_source source, utm_medium medium, utm_campaign campaign, count(distinct day_hash)::int visitors from people where utm_source is not null group by 1,2,3 order by visitors desc limit 15) x) campaigns,
  (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select country, region, city, count(distinct day_hash)::int visitors from people where country is not null group by 1,2,3 order by visitors desc limit 15) x) places,
  (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select device, count(distinct day_hash)::int visitors from people group by device order by visitors desc) x) devices,
  (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select coalesce(bot_name, 'unnamed') name, count(*)::int views from views where class = 'bot' group by 1 order by views desc, name limit 15) x) bots,
  (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select path, count(*)::int views from views where class <> 'human' group by path order by views desc, path limit 10) x) bot_pages
), remembered as (
 -- Visitors who accepted: where each first came from (ever), and how far they got in the period.
 select r.visitor_id,
  (select f.source_kind from site_visits f where f.visitor_id = r.visitor_id and f.source_kind <> 'internal' order by f.occurred_at limit 1) first_source,
  not exists (select 1 from site_visits e where e.visitor_id = r.visitor_id and e.occurred_at < p_from) is_new,
  bool_or(r.path like '/student/register/%') reached_register,
  bool_or(r.path = '/student/') reached_account
 from v r where r.visitor_id is not null group by r.visitor_id
)
select jsonb_build_object(
 'from', p_from, 'to', p_to,
 'people', jsonb_build_object('views', (select count(*) from people)::int, 'visitors', (select count(distinct day_hash) from people)::int),
 'bots', jsonb_build_object('views', (select count(*) from views where class = 'bot')::int, 'clients', (select count(distinct day_hash) from views where class = 'bot')::int),
 'suspect', jsonb_build_object('views', (select count(*) from views where class = 'suspect')::int, 'clients', (select count(distinct day_hash) from views where class = 'suspect')::int),
 'consent', jsonb_build_object(
   'accepted', (select count(distinct day_hash) from people where consent = 'accepted')::int,
   'declined', (select count(distinct day_hash) from people where consent = 'declined')::int,
   'unset', (select count(distinct day_hash) from people p where consent = 'unset' and not exists (select 1 from people q where q.day_hash = p.day_hash and q.consent <> 'unset'))::int),
 'remembered', jsonb_build_object(
   'visitors', (select count(*) from remembered)::int, 'new', (select count(*) from remembered where is_new)::int,
   'returning', (select count(*) from remembered where not is_new)::int,
   'reached_register', (select count(*) from remembered where reached_register)::int,
   'reached_account', (select count(*) from remembered where reached_account)::int,
   'by_first_source', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select coalesce(first_source, 'direct') source, count(*)::int visitors,
      count(*) filter (where reached_register)::int reached_register, count(*) filter (where reached_account)::int reached_account
      from remembered group by 1 order by visitors desc, source) x)),
 'pages', top.pages, 'sources', top.sources, 'referrers', top.referrers, 'campaigns', top.campaigns,
 'places', top.places, 'devices', top.devices, 'bot_names', top.bots, 'bot_pages', top.bot_pages)
from top;
$$;

alter table site_visits enable row level security;
alter table site_daily_reports enable row level security;
revoke all on site_visits, site_daily_reports from public, anon, authenticated;
revoke all on function site_visit_report(timestamptz, timestamptz) from public, anon, authenticated;
grant select, insert, delete on site_visits to service_role;
grant select, insert, update on site_daily_reports to service_role;
grant execute on function site_visit_report(timestamptz, timestamptz) to service_role;
commit;
