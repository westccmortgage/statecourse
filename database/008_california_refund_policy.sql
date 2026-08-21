-- 008 California refund and cancellation policy CA-2026-08-20-v1
--
-- The policy was adopted 2026-08-20 as StateCourse LLC's source of truth for California.
-- Before this migration the refund path had no policy in it at all: request-refund.mjs
-- refunded whatever amount an administrator passed, gated only on a boolean called
-- policyReviewApproved. Nothing recorded which policy version a student had accepted, and
-- nothing could reproduce a pro-rata calculation after the fact.
--
-- Three things are added, and nothing existing is altered:
--
--   1. checkout_course_allocations — how many cents of a purchase are each course's
--      tuition. For a single-course purchase that is the whole amount and the row is
--      redundant; it is written anyway, because the refund path must not have two code
--      paths, one of which is only exercised by a product that does not exist yet.
--
--   2. california_refund_basis(payment) — the facts the policy turns into an amount:
--      allocated tuition, enrollment date, the completion time of the FIRST lesson
--      assignment, percent of the course complete, whether a final examination has been
--      attempted, and whether a completion certificate has been issued. It computes no
--      amount. The calculation lives in lib/refund-policy.mjs so that it is testable
--      without a database, and so there is exactly one implementation of the policy.
--
--   3. refunds.policy_* columns — what the policy decided, recorded next to what
--      was actually refunded, so an administrator who overrides the policy leaves a
--      record of the override rather than an unexplained amount.
--
-- Percent complete is deliberately computed from COMPLETED ASSIGNMENTS OVER REQUIRED
-- ASSIGNMENTS, not from active seconds and not from a self-reported figure. Regulation
-- 3000(a)(1) defines a correspondence course as a number of lesson assignments, so the
-- assignment is the unit the course is measured in, and the 60% threshold in the policy
-- is therefore a count of assignments rather than a clock reading. A student who has sat
-- with a page open for hours without completing it has completed nothing.
--
-- Nothing in this file issues a refund, contacts Stripe, or changes an enrollment's
-- status. It reports facts.

create table if not exists checkout_course_allocations (
  checkout_attempt_id uuid not null references checkout_attempts(id) on delete cascade,
  course_id text not null references courses(id),
  allocated_amount bigint not null check (allocated_amount >= 0),
  list_amount bigint check (list_amount >= 0),
  package_id text,
  policy_version text not null,
  created_at timestamptz not null default now(),
  primary key (checkout_attempt_id, course_id)
);

comment on table checkout_course_allocations is
  'Cents of a purchase attributed to each course at checkout, so a later pro-rata refund is reproducible from the record rather than recomputed from prices that may since have changed.';

create index if not exists checkout_course_allocations_course_idx
  on checkout_course_allocations(course_id);

/* What the policy decided, alongside what was refunded. Added to the existing table so an
   override is visible as a divergence between the two rather than as a bare amount. */
alter table refunds
  add column if not exists policy_version text,
  add column if not exists policy_outcome text,
  add column if not exists policy_amount bigint,
  add column if not exists policy_reason text,
  add column if not exists policy_overridden boolean not null default false;

/*
 * The facts a refund decision rests on, one row per course covered by the payment.
 *
 * A package purchase produces several rows; a single-course purchase produces one. The
 * caller adds nothing to this and subtracts nothing from it — every column is read from a
 * table that some other part of the system already maintains for its own reasons, which is
 * what makes the result auditable.
 */
create or replace function california_refund_basis(p_payment_id uuid)
returns table (
  course_id text,
  allocated_amount bigint,
  already_refunded bigint,
  enrolled_at timestamptz,
  first_assignment_completed_at timestamptz,
  required_assignments integer,
  completed_assignments integer,
  percent_complete numeric,
  final_exam_attempted boolean,
  certificate_issued boolean
)
language sql
stable
as $$
  with paid as (
    select p.id,
           p.enrollment_id,
           p.course_id as payment_course_id,
           p.amount,
           p.refund_amount,
           e.checkout_attempt_id,
           e.enrollment_date
      from payments p
      join enrollments e on e.id = p.enrollment_id
     where p.id = p_payment_id
  ),
  /* The allocation if one was recorded; otherwise the payment's own single course for the
     full amount, so a payment taken before this migration still resolves. */
  allocation as (
    select a.course_id, a.allocated_amount
      from checkout_course_allocations a
      join paid on paid.checkout_attempt_id = a.checkout_attempt_id
    union all
    select paid.payment_course_id, paid.amount
      from paid
     where not exists (
       select 1 from checkout_course_allocations a2
        where a2.checkout_attempt_id = paid.checkout_attempt_id
     )
  ),
  progress as (
    select s.course_id,
           count(*) filter (where s.status = 'completed') as completed_assignments,
           min(s.completed_at) filter (where s.status = 'completed') as first_completed_at
      from lms_assignment_state s
      join paid on paid.enrollment_id = s.enrollment_id
     group by s.course_id
  ),
  required as (
    select r.course_id, count(*)::integer as required_assignments
      from regulated_course_assignments r
     group by r.course_id
  )
  select allocation.course_id,
         allocation.allocated_amount,
         /* Refunds are recorded against the payment, not the course. Attributing the whole
            recorded refund to each course would double-count on a package, so it is applied
            only where the payment covers a single course; a package refund history is
            reconstructed from the refunds table instead. */
         case when (select count(*) from allocation) = 1
              then (select paid.refund_amount from paid)
              else 0 end as already_refunded,
         (select paid.enrollment_date from paid) as enrolled_at,
         progress.first_completed_at,
         coalesce(required.required_assignments, 0) as required_assignments,
         coalesce(progress.completed_assignments, 0)::integer as completed_assignments,
         case
           when coalesce(required.required_assignments, 0) = 0 then null
           else round(
             (coalesce(progress.completed_assignments, 0)::numeric * 100)
             / required.required_assignments, 4)
         end as percent_complete,
         exists (
           select 1 from final_exam_sessions f
            join paid on paid.enrollment_id = f.enrollment_id
            where f.course_id = allocation.course_id
              and f.status in ('in_progress','submitted','expired')
         ) as final_exam_attempted,
         exists (
           select 1 from course_completion_certificates c
            join paid on paid.enrollment_id = c.enrollment_id
            where c.course_id = allocation.course_id
         ) as certificate_issued
    from allocation
    left join progress on progress.course_id = allocation.course_id
    left join required on required.course_id = allocation.course_id;
$$;

comment on function california_refund_basis(uuid) is
  'Facts only. The amount is decided by lib/refund-policy.mjs under CA-2026-08-20-v1; percent complete is completed lesson assignments over required lesson assignments, because Regulation 3000(a)(1) defines a correspondence course in assignments.';

/*
 * A voided final examination session does NOT count as an attempt above. A session voided
 * because a proctor could not be verified, or because the platform failed, is not something
 * the student did, and the policy ends refund eligibility on the student "having attempted"
 * the examination. 'expired' does count: the student started it and let the clock run out.
 */

/* The policy decision, recorded with the refund it produced. Kept as a separate function
   rather than widening record_refund_request's signature, so migration 001's call sites
   keep working unchanged and a caller that records no decision is visible as a null. */
create or replace function record_refund_policy_decision(
  p_stripe_refund_id text, p_policy_version text, p_policy_outcome text,
  p_policy_amount bigint, p_policy_reason text, p_overridden boolean
) returns void language plpgsql security definer set search_path = public as $$
begin
  update refunds
     set policy_version = p_policy_version,
         policy_outcome = p_policy_outcome,
         policy_amount = p_policy_amount,
         policy_reason = p_policy_reason,
         policy_overridden = coalesce(p_overridden, false),
         updated_at = now()
   where stripe_refund_id = p_stripe_refund_id;
  if not found then raise exception 'unknown refund %', p_stripe_refund_id; end if;
  insert into admin_audit_log(action, detail)
  values('refund_policy_decision',
         jsonb_build_object('refund_id', p_stripe_refund_id, 'policy_version', p_policy_version,
                            'outcome', p_policy_outcome, 'policy_amount', p_policy_amount,
                            'overridden', coalesce(p_overridden, false)));
end $$;

revoke all on function california_refund_basis(uuid) from public;
revoke all on function record_refund_policy_decision(text,text,text,bigint,text,boolean) from public;
grant execute on function california_refund_basis(uuid) to service_role;
grant execute on function record_refund_policy_decision(text,text,text,bigint,text,boolean) to service_role;
grant select, insert on checkout_course_allocations to service_role;
