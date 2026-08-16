begin;

create extension if not exists pgcrypto;

create table if not exists students (
  id uuid primary key,
  email text not null,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists courses (
  id text primary key,
  state text not null check (state ~ '^[A-Z]{2}$'),
  name text not null,
  product_type text not null,
  approval_status text not null default 'submission_draft',
  enrollment_enabled boolean not null default false,
  regulatory_approval_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into courses(id,state,name,product_type,approval_status,enrollment_enabled)
values
  ('me-sales-agent','ME','Maine Real Estate Sales Agent Pre-License Course','real_estate_prelicense','submission_draft',false),
  ('va-salesperson','VA','Virginia Principles and Practices of Real Estate','real_estate_prelicense','submission_draft',false)
on conflict (id) do nothing;

create table if not exists course_policy_versions (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references courses(id),
  policy_type text not null check (policy_type in ('regulatory_acknowledgment','terms','refund','cancellation','disclosure')),
  version text not null,
  effective_at timestamptz,
  retired_at timestamptz,
  content_hash text,
  unique (course_id, policy_type, version)
);

create table if not exists checkout_attempts (
  id uuid primary key,
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  state text not null,
  stripe_mode text not null check (stripe_mode in ('test','live')),
  stripe_checkout_session_id text unique,
  amount bigint not null check (amount > 0),
  currency text not null check (currency ~ '^[a-z]{3}$'),
  status text not null,
  regulatory_acknowledgment_version text not null,
  terms_version text not null,
  refund_policy_version text not null,
  cancellation_policy_version text not null,
  qa_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  state text not null,
  status text not null check (status in ('active','qa_non_credit','cancelled','expired')),
  compliance_credit_eligible boolean not null default false,
  checkout_attempt_id uuid not null unique references checkout_attempts(id),
  enrollment_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  enrollment_id uuid not null unique references enrollments(id),
  course_id text not null references courses(id),
  state text not null,
  stripe_mode text not null check (stripe_mode in ('test','live')),
  stripe_customer_id text,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text not null unique,
  amount bigint not null check (amount > 0),
  subtotal_amount bigint not null default 0 check (subtotal_amount >= 0),
  tax_amount bigint not null default 0 check (tax_amount >= 0),
  discount_amount bigint not null default 0 check (discount_amount >= 0),
  currency text not null check (currency ~ '^[a-z]{3}$'),
  status text not null,
  payment_date timestamptz not null,
  refund_status text not null default 'none',
  refund_amount bigint not null default 0 check (refund_amount >= 0),
  coupon_promotion_code text,
  regulatory_acknowledgment_version text not null,
  terms_version text not null,
  refund_policy_version text not null,
  cancellation_policy_version text not null,
  qa_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_events (
  stripe_event_id text primary key,
  event_type text not null,
  stripe_mode text not null check (stripe_mode in ('test','live')),
  object_id text,
  stripe_created_at timestamptz not null,
  processing_status text not null check (processing_status in ('processing','completed','failed')),
  error_code text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  request_id uuid unique,
  payment_id uuid not null references payments(id),
  stripe_refund_id text not null unique,
  amount bigint not null check (amount > 0),
  currency text not null check (currency ~ '^[a-z]{3}$'),
  status text not null,
  reason text,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists access_grants (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references enrollments(id),
  student_id uuid not null references students(id),
  course_id text not null references courses(id),
  status text not null check (status in ('active','revoked')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists notification_outbox (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  enrollment_id uuid references enrollments(id),
  payment_id uuid references payments(id),
  notification_type text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  payment_id uuid references payments(id),
  enrollment_id uuid references enrollments(id),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- This table belongs exclusively to the LMS compliance engine. No payment RPC
-- below inserts or updates it. Payment success grants only the purchased course.
create table if not exists lms_compliance_state (
  enrollment_id uuid primary key references enrollments(id),
  required_study_seconds bigint not null default 0,
  credited_study_seconds bigint not null default 0,
  final_exam_eligible boolean not null default false,
  final_exam_status text not null default 'not_started',
  regulatory_credit_status text not null default 'not_earned',
  certificate_status text not null default 'not_issued',
  updated_at timestamptz not null default now()
);

create index if not exists payments_student_idx on payments(student_id, payment_date desc);
create index if not exists payments_course_idx on payments(course_id, payment_date desc);
create index if not exists refunds_payment_idx on refunds(payment_id);
create index if not exists enrollments_student_idx on enrollments(student_id, created_at desc);

create or replace function claim_stripe_event(
  p_event_id text, p_event_type text, p_mode text, p_object_id text, p_created_at timestamptz
) returns boolean language plpgsql security definer set search_path = public as $$
declare v_claimed boolean := false;
begin
  insert into payment_events(stripe_event_id,event_type,stripe_mode,object_id,stripe_created_at,processing_status)
  values(p_event_id,p_event_type,p_mode,p_object_id,p_created_at,'processing')
  on conflict (stripe_event_id) do update
    set processing_status='processing', error_code=null, received_at=now()
    where payment_events.processing_status='failed'
  returning true into v_claimed;
  return coalesce(v_claimed,false);
end $$;

create or replace function complete_stripe_event(p_event_id text)
returns void language sql security definer set search_path = public as $$
  update payment_events set processing_status='completed', processed_at=now(), error_code=null
  where stripe_event_id=p_event_id;
$$;

create or replace function fail_stripe_event(p_event_id text, p_error_code text)
returns void language sql security definer set search_path = public as $$
  update payment_events set processing_status='failed', processed_at=now(), error_code=p_error_code
  where stripe_event_id=p_event_id;
$$;

create or replace function finalize_paid_checkout(
  p_event_id text, p_mode text, p_checkout_session_id text, p_payment_intent_id text,
  p_customer_id text, p_amount_total bigint, p_amount_subtotal bigint, p_amount_tax bigint,
  p_amount_discount bigint, p_currency text, p_payment_date timestamptz,
  p_customer_email text, p_coupon_code text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_attempt checkout_attempts%rowtype;
  v_enrollment_id uuid;
  v_payment_id uuid;
begin
  select * into v_attempt from checkout_attempts
  where stripe_checkout_session_id=p_checkout_session_id for update;
  if not found then raise exception 'unknown checkout session'; end if;
  if v_attempt.amount <> p_amount_subtotal or v_attempt.currency <> lower(p_currency) or v_attempt.stripe_mode <> p_mode then
    raise exception 'checkout payment mismatch';
  end if;

  select enrollment_id into v_enrollment_id from payments
  where stripe_checkout_session_id=p_checkout_session_id;
  if v_enrollment_id is not null then return v_enrollment_id; end if;

  insert into enrollments(student_id,course_id,state,status,compliance_credit_eligible,checkout_attempt_id,enrollment_date)
  values(v_attempt.student_id,v_attempt.course_id,v_attempt.state,
    case when v_attempt.qa_only then 'qa_non_credit' else 'active' end,
    not v_attempt.qa_only,v_attempt.id,p_payment_date)
  returning id into v_enrollment_id;

  insert into payments(student_id,enrollment_id,course_id,state,stripe_mode,stripe_customer_id,
    stripe_checkout_session_id,stripe_payment_intent_id,amount,subtotal_amount,tax_amount,discount_amount,currency,status,payment_date,
    coupon_promotion_code,regulatory_acknowledgment_version,terms_version,refund_policy_version,
    cancellation_policy_version,qa_only)
  values(v_attempt.student_id,v_enrollment_id,v_attempt.course_id,v_attempt.state,p_mode,p_customer_id,
    p_checkout_session_id,p_payment_intent_id,p_amount_total,p_amount_subtotal,p_amount_tax,p_amount_discount,lower(p_currency),'paid',p_payment_date,
    p_coupon_code,v_attempt.regulatory_acknowledgment_version,v_attempt.terms_version,
    v_attempt.refund_policy_version,v_attempt.cancellation_policy_version,v_attempt.qa_only)
  returning id into v_payment_id;

  insert into access_grants(enrollment_id,student_id,course_id,status)
  values(v_enrollment_id,v_attempt.student_id,v_attempt.course_id,'active');
  insert into notification_outbox(student_id,enrollment_id,payment_id,notification_type)
  values(v_attempt.student_id,v_enrollment_id,v_payment_id,'payment_and_enrollment_confirmation');
  update checkout_attempts set status='paid',updated_at=now() where id=v_attempt.id;
  return v_enrollment_id;
end $$;

create or replace function mark_checkout_failed(p_checkout_session_id text, p_status text)
returns void language sql security definer set search_path = public as $$
  update checkout_attempts set status=p_status,updated_at=now()
  where stripe_checkout_session_id=p_checkout_session_id and status <> 'paid';
$$;

create or replace function record_refund_request(
  p_request_id uuid, p_payment_id uuid, p_stripe_refund_id text, p_amount bigint,
  p_currency text, p_status text, p_reason text
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  insert into refunds(request_id,payment_id,stripe_refund_id,amount,currency,status,reason)
  values(p_request_id,p_payment_id,p_stripe_refund_id,p_amount,lower(p_currency),p_status,p_reason)
  on conflict (stripe_refund_id) do update set status=excluded.status,updated_at=now()
  returning id into v_id;
  insert into admin_audit_log(action,payment_id,detail)
  values('refund_requested',p_payment_id,jsonb_build_object('refund_id',p_stripe_refund_id,'amount',p_amount,'reason',p_reason));
  update payments set refund_status='pending',updated_at=now() where id=p_payment_id and refund_status='none';
  return v_id;
end $$;

create or replace function apply_refund_event(
  p_stripe_refund_id text, p_payment_intent_id text, p_amount bigint,
  p_currency text, p_status text, p_reason text
) returns void language plpgsql security definer set search_path = public as $$
declare v_payment_id uuid; v_total bigint; v_payment_amount bigint;
begin
  select id,amount into v_payment_id,v_payment_amount from payments
  where stripe_payment_intent_id=p_payment_intent_id for update;
  if not found then raise exception 'unknown payment intent'; end if;
  insert into refunds(payment_id,stripe_refund_id,amount,currency,status,reason)
  values(v_payment_id,p_stripe_refund_id,p_amount,lower(p_currency),p_status,p_reason)
  on conflict (stripe_refund_id) do update
    set amount=excluded.amount,status=excluded.status,reason=excluded.reason,updated_at=now();
  select coalesce(sum(amount),0) into v_total from refunds
  where payment_id=v_payment_id and status='succeeded';
  update payments set refund_amount=v_total,
    refund_status=case when v_total=0 then 'none' when v_total>=v_payment_amount then 'full' else 'partial' end,
    status=case when v_total>=v_payment_amount then 'refunded' else status end,
    updated_at=now()
  where id=v_payment_id;
end $$;

create or replace view admin_payment_ledger with (security_invoker=true) as
select
  p.id as order_id, p.student_id, s.email as student_email, p.state, p.course_id,
  c.name as course_name, p.amount, p.currency, p.status as payment_status,
  p.payment_date, p.enrollment_id, e.status as enrollment_status,
  p.refund_status, p.refund_amount, p.stripe_mode, p.stripe_checkout_session_id,
  p.stripe_payment_intent_id, p.stripe_customer_id, p.qa_only
from payments p
join students s on s.id=p.student_id
join courses c on c.id=p.course_id
join enrollments e on e.id=p.enrollment_id;

alter table students enable row level security;
alter table courses enable row level security;
alter table course_policy_versions enable row level security;
alter table checkout_attempts enable row level security;
alter table enrollments enable row level security;
alter table payments enable row level security;
alter table payment_events enable row level security;
alter table refunds enable row level security;
alter table access_grants enable row level security;
alter table notification_outbox enable row level security;
alter table admin_audit_log enable row level security;
alter table lms_compliance_state enable row level security;

revoke all on admin_payment_ledger from anon, authenticated;
revoke all on function claim_stripe_event(text,text,text,text,timestamptz) from public;
revoke all on function complete_stripe_event(text) from public;
revoke all on function fail_stripe_event(text,text) from public;
revoke all on function finalize_paid_checkout(text,text,text,text,text,bigint,bigint,bigint,bigint,text,timestamptz,text,text) from public;
revoke all on function mark_checkout_failed(text,text) from public;
revoke all on function record_refund_request(uuid,uuid,text,bigint,text,text,text) from public;
revoke all on function apply_refund_event(text,text,bigint,text,text,text) from public;

grant select on admin_payment_ledger to service_role;
grant execute on function claim_stripe_event(text,text,text,text,timestamptz) to service_role;
grant execute on function complete_stripe_event(text) to service_role;
grant execute on function fail_stripe_event(text,text) to service_role;
grant execute on function finalize_paid_checkout(text,text,text,text,text,bigint,bigint,bigint,bigint,text,timestamptz,text,text) to service_role;
grant execute on function mark_checkout_failed(text,text) to service_role;
grant execute on function record_refund_request(uuid,uuid,text,bigint,text,text,text) to service_role;
grant execute on function apply_refund_event(text,text,bigint,text,text,text) to service_role;

commit;
