begin;

insert into courses(id,state,name,product_type,approval_status,enrollment_enabled)
values
  ('az-salesperson-prelicense-90','AZ','Arizona Salesperson Pre-License — 90 Hours','real_estate_prelicense','submission_draft',false),
  ('az-contract-writing-6','AZ','Arizona Contract Writing — 6 Hours','real_estate_prelicense','submission_draft',false),
  ('wa-real-estate-fundamentals-60','WA','Washington Real Estate Fundamentals — 60 Hours','real_estate_prelicense','submission_draft',false),
  ('wa-real-estate-practices-30','WA','Washington Real Estate Practices — 30 Hours','real_estate_prelicense','submission_draft',false),
  ('pa-real-estate-fundamentals-30','PA','Pennsylvania Real Estate Fundamentals — 30 Hours','real_estate_prelicense','submission_draft',false),
  ('pa-real-estate-practice-45','PA','Pennsylvania Real Estate Practice — 45 Hours','real_estate_prelicense','submission_draft',false),
  ('nc-broker-prelicensing-75','NC','North Carolina Broker Prelicensing — 75 Hours','real_estate_prelicense','submission_draft',false),
  ('co-real-estate-law-practice-48','CO','Colorado Real Estate Law and Practice — 48 Hours','real_estate_prelicense','submission_draft',false),
  ('co-contracts-regulations-48','CO','Colorado Contracts and Regulations — 48 Hours','real_estate_prelicense','submission_draft',false),
  ('co-trust-accounts-recordkeeping-8','CO','Colorado Trust Accounts and Record-Keeping — 8 Hours','real_estate_prelicense','submission_draft',false),
  ('co-current-legal-issues-8','CO','Colorado Current Legal Issues — 8 Hours','real_estate_prelicense','submission_draft',false),
  ('co-real-estate-closings-24','CO','Colorado Real Estate Closings — 24 Hours','real_estate_prelicense','submission_draft',false),
  ('co-practical-applications-32','CO','Colorado Practical Applications — 32 Hours','real_estate_prelicense','submission_draft',false)
on conflict (id) do update set state=excluded.state,name=excluded.name,product_type=excluded.product_type;

insert into regulatory_course_versions(course_id,version,lifecycle_status,required_hours,configuration)
values
  ('az-salesperson-prelicense-90','1.0','development',90,'{"state_rule_layer":"arizona","separate_contract_writing_record":true,"approval_gate":true}'::jsonb),
  ('az-contract-writing-6','1.0','development',6,'{"state_rule_layer":"arizona","separate_prelicense_record":true,"approval_gate":true}'::jsonb),
  ('wa-real-estate-fundamentals-60','1.0','development',60,'{"state_rule_layer":"washington","separate_approval_record":true,"approval_gate":true}'::jsonb),
  ('wa-real-estate-practices-30','1.0','development',30,'{"state_rule_layer":"washington","separate_approval_record":true,"approval_gate":true}'::jsonb),
  ('pa-real-estate-fundamentals-30','1.0','development',30,'{"state_rule_layer":"pennsylvania","separate_approval_record":true,"approval_gate":true}'::jsonb),
  ('pa-real-estate-practice-45','1.0','development',45,'{"state_rule_layer":"pennsylvania","separate_approval_record":true,"approval_gate":true}'::jsonb),
  ('nc-broker-prelicensing-75','1.0','development',75,'{"state_rule_layer":"north_carolina","completion_period_days":180,"approval_gate":true}'::jsonb),
  ('co-real-estate-law-practice-48','1.0','development',48,'{"state_rule_layer":"colorado","dpos_and_dre":true,"approval_gate":true}'::jsonb),
  ('co-contracts-regulations-48','1.0','development',48,'{"state_rule_layer":"colorado","dpos_and_dre":true,"approval_gate":true}'::jsonb),
  ('co-trust-accounts-recordkeeping-8','1.0','development',8,'{"state_rule_layer":"colorado","dpos_and_dre":true,"approval_gate":true}'::jsonb),
  ('co-current-legal-issues-8','1.0','development',8,'{"state_rule_layer":"colorado","dpos_and_dre":true,"approval_gate":true}'::jsonb),
  ('co-real-estate-closings-24','1.0','development',24,'{"state_rule_layer":"colorado","dpos_and_dre":true,"approval_gate":true}'::jsonb),
  ('co-practical-applications-32','1.0','development',32,'{"state_rule_layer":"colorado","dpos_and_dre":true,"approval_gate":true}'::jsonb)
on conflict (course_id,version) do nothing;

create table if not exists regulatory_approval_records (
  id uuid primary key default gen_random_uuid(),
  state text not null check (state ~ '^[A-Z]{2}$'),
  authority text not null,
  approval_type text not null check (approval_type in ('provider','school','owner','director','bond','instructor','course','delivery_method','program','school_agent')),
  subject_type text not null check (subject_type in ('organization','person','course','location','delivery_method','bond')),
  subject_key text not null,
  status text not null default 'development' check (status in ('development','submitted','regulator_correction','approved','suspended','expired','withdrawn','denied')),
  approval_number text,
  submitted_at timestamptz,
  correction_requested_at timestamptz,
  approved_at timestamptz,
  effective_date date,
  expiration_date date,
  fee_amount_cents integer check (fee_amount_cents is null or fee_amount_cents >= 0),
  fee_source_checked_at timestamptz,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(state,approval_type,subject_key)
);

create table if not exists state_course_rule_configurations (
  course_id text not null,
  version text not null,
  state text not null check (state ~ '^[A-Z]{2}$'),
  delivery_rules jsonb not null default '{}'::jsonb,
  identity_rules jsonb not null default '{}'::jsonb,
  attendance_rules jsonb not null default '{}'::jsonb,
  assessment_rules jsonb not null default '{}'::jsonb,
  exam_rules jsonb not null default '{}'::jsonb,
  proctoring_rules jsonb not null default '{}'::jsonb,
  refund_rules jsonb not null default '{}'::jsonb,
  reporting_rules jsonb not null default '{}'::jsonb,
  retention_rules jsonb not null default '{}'::jsonb,
  certificate_rules jsonb not null default '{}'::jsonb,
  source_manifest jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key(course_id,version),
  foreign key(course_id,version) references regulatory_course_versions(course_id,version)
);

create table if not exists regulatory_documents (
  id uuid primary key default gen_random_uuid(),
  state text not null check (state ~ '^[A-Z]{2}$'),
  approval_record_id uuid references regulatory_approval_records(id),
  course_id text,
  course_version text,
  document_type text not null,
  title text not null,
  official_source_url text,
  effective_date date,
  retrieved_at timestamptz,
  content_hash text,
  storage_key text,
  supersedes_document_id uuid references regulatory_documents(id),
  status text not null default 'current' check (status in ('current','superseded','pending_review','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key(course_id,course_version) references regulatory_course_versions(course_id,version)
);

create table if not exists regulator_communications (
  id uuid primary key default gen_random_uuid(),
  state text not null check (state ~ '^[A-Z]{2}$'),
  approval_record_id uuid references regulatory_approval_records(id),
  course_id text,
  course_version text,
  direction text not null check (direction in ('inbound','outbound','internal_note')),
  communication_type text not null,
  occurred_at timestamptz not null,
  regulator_contact text,
  subject text not null,
  summary text not null,
  document_ids uuid[] not null default '{}',
  created_by text not null,
  created_at timestamptz not null default now(),
  foreign key(course_id,course_version) references regulatory_course_versions(course_id,version)
);

create table if not exists regulatory_certificate_records (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id),
  course_id text not null,
  course_version text not null,
  certificate_number text not null unique,
  issued_at timestamptz not null,
  revoked_at timestamptz,
  revocation_reason text,
  verification_hash text not null,
  certificate_payload jsonb not null,
  created_at timestamptz not null default now(),
  foreign key(course_id,course_version) references regulatory_course_versions(course_id,version)
);

create index if not exists regulatory_approval_state_status_idx on regulatory_approval_records(state,status);
create index if not exists regulatory_documents_state_course_idx on regulatory_documents(state,course_id,course_version);
create index if not exists regulator_communications_state_idx on regulator_communications(state,occurred_at);
create index if not exists regulatory_certificates_enrollment_idx on regulatory_certificate_records(enrollment_id);

alter table regulatory_approval_records enable row level security;
alter table state_course_rule_configurations enable row level security;
alter table regulatory_documents enable row level security;
alter table regulator_communications enable row level security;
alter table regulatory_certificate_records enable row level security;

revoke all on regulatory_approval_records,state_course_rule_configurations,regulatory_documents,regulator_communications,regulatory_certificate_records from anon,authenticated;

commit;
