begin;

-- The course record exists so private review access can be granted before TREC approval. This is
-- not activation: the approval and enrollment gates stay closed.
insert into courses(id,state,name,product_type,approval_status,enrollment_enabled)
values(
  'tx-law-of-agency-30-v1','TX','Texas Law of Agency — 30 Hours',
  'real_estate_qualifying_education','submission_draft',false
)
on conflict(id) do update set
  state=excluded.state,
  name=excluded.name,
  product_type=excluded.product_type;

-- Cloudflare Stream access is server-authorized. A token issue proves that StateCourse checked an
-- authenticated student's active enrollment (or an active reviewer grant) before releasing a
-- short-lived signed player URL. Neither table awards course credit by itself.
create table if not exists video_token_issues (
  id bigint generated always as identity primary key,
  student_id uuid not null references students(id),
  enrollment_id uuid not null references enrollments(id),
  course_id text not null references courses(id),
  delivery_id text not null,
  screen_id text not null,
  asset_key text not null check (asset_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  actor_mode text not null check (actor_mode in ('student','reviewer','admin')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > issued_at)
);

create index if not exists video_token_issues_enrollment
  on video_token_issues(enrollment_id, asset_key, issued_at desc);

-- Browser events are append-only evidence. They are deliberately not completion claims: if a
-- jurisdiction later makes a video mandatory, a separate server-side derivation must calculate
-- credited watch time from these events and the course's controlling rule.
create table if not exists video_playback_events (
  id bigint generated always as identity primary key,
  student_id uuid not null references students(id),
  enrollment_id uuid not null references enrollments(id),
  course_id text not null references courses(id),
  delivery_id text not null,
  screen_id text not null,
  asset_key text not null check (asset_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  actor_mode text not null check (actor_mode in ('student','reviewer','admin')),
  playback_session_id uuid not null,
  client_sequence integer not null check (client_sequence >= 0),
  event_type text not null check (event_type in ('play','pause','heartbeat','seeked','ratechange','ended','error')),
  position_seconds numeric(10,3) not null check (position_seconds >= 0),
  media_duration_seconds numeric(10,3) not null check (media_duration_seconds > 0),
  playback_rate numeric(4,2) not null check (playback_rate between 0.5 and 2),
  received_at timestamptz not null default now(),
  unique(enrollment_id, asset_key, playback_session_id, client_sequence)
);

create index if not exists video_playback_events_enrollment
  on video_playback_events(enrollment_id, asset_key, received_at);

-- These records contain student activity evidence. Browser roles never receive direct table
-- privileges; RLS is enabled as defense in depth and the StateCourse server writes with its service
-- credential only after authorization.
alter table video_token_issues enable row level security;
alter table video_playback_events enable row level security;
revoke all on table video_token_issues from anon, authenticated;
revoke all on table video_playback_events from anon, authenticated;

commit;
