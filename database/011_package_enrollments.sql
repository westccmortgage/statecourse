-- 011 Package purchases: one payment, one enrollment per component
--
-- A package is not a course. Buying the California Complete Licensing Path buys three
-- DRE-credit courses plus two complimentary products, and a student who has bought it is
-- enrolled in five things. Before this migration the paid-webhook path created exactly one
-- enrollment, because payments.enrollment_id is `not null unique` and finalize_paid_checkout
-- was written for a purchase that is one course.
--
-- WHAT THIS ADDS
--
--   1. The two complimentary products as courses. enrollments.course_id references courses(id),
--      so a student cannot be enrolled in something the courses table has never heard of. They
--      carry approval_status 'not_regulated' and enrollment_enabled false: neither is statutory
--      pre-license education, neither has or needs a DRE approval number, and neither may ever
--      be sold on its own.
--
--   2. payment_enrollments — every enrollment a payment produced, with the cents allocated to
--      it. A single-course purchase writes one row; a package writes one per component. The
--      single-course case is written too, so the refund path has one shape rather than two.
--
--   3. finalize_paid_package — the package equivalent of finalize_paid_checkout, idempotent in
--      exactly the same way and for the same reason. Stripe delivers a webhook more than once
--      as a matter of course, and the second delivery must return the five enrollments the
--      first one made rather than making five more.
--
-- WHY payments.enrollment_id STAYS NOT NULL
--
-- It points at the FIRST component enrollment: the primary. Every reader of it — the payment
-- ledger, the notification outbox, the admin views — was written for a single course and keeps
-- working unchanged. What must not happen is any of them treating that one enrollment as the
-- whole purchase, so payment_enrollments is the complete record and payments.enrollment_id is
-- documented as the primary rather than the only.
--
-- Allocation is never recomputed here. It is read from checkout_course_allocations, which was
-- written before the student reached Stripe, so a price change between purchase and webhook
-- cannot alter what a student is recorded as having paid for each course.

insert into courses(id, state, name, product_type, approval_status, enrollment_enabled)
values
  ('ca-exam-prep', 'CA', 'California Exam Prep', 'exam_preparation', 'not_regulated', false),
  ('ca-licensing-navigator', 'CA', 'Licensing/Application Navigator', 'licensing_support', 'not_regulated', false)
on conflict (id) do update
  set name = excluded.name,
      product_type = excluded.product_type,
      approval_status = excluded.approval_status,
      updated_at = now();

comment on column payments.enrollment_id is
  'The PRIMARY enrollment of the purchase, kept for readers written before packages existed. For a package purchase it is the first component only; payment_enrollments is the complete record.';

create table if not exists payment_enrollments (
  payment_id uuid not null references payments(id) on delete cascade,
  enrollment_id uuid not null references enrollments(id),
  course_id text not null references courses(id),
  allocated_amount bigint not null check (allocated_amount >= 0),
  is_primary boolean not null default false,
  package_id text,
  created_at timestamptz not null default now(),
  primary key (payment_id, course_id),
  unique (enrollment_id)
);

comment on table payment_enrollments is
  'Every enrollment a payment produced and the cents allocated to it. One row for a single-course purchase, one per component for a package. The unique constraint on enrollment_id is what makes a repeated webhook unable to attach a second payment to an enrollment that already has one.';

create index if not exists payment_enrollments_course_idx on payment_enrollments(course_id);

/*
 * Finalize a paid package purchase.
 *
 * Mirrors finalize_paid_checkout deliberately: same reconciliation of the charged amount
 * against the attempt, same idempotency shape, same refusal to invent anything. It differs in
 * one respect only — it loops over the allocation rows instead of assuming there is one.
 *
 * Returns the primary enrollment id, as finalize_paid_checkout does, so both callers look the
 * same to the webhook.
 */
create or replace function finalize_paid_package(
  p_event_id text, p_mode text, p_checkout_session_id text, p_payment_intent_id text,
  p_customer_id text, p_amount_total bigint, p_amount_subtotal bigint, p_amount_tax bigint,
  p_amount_discount bigint, p_currency text, p_payment_date timestamptz,
  p_customer_email text, p_coupon_code text, p_package_id text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_attempt checkout_attempts%rowtype;
  v_allocation record;
  v_enrollment_id uuid;
  v_primary_enrollment_id uuid;
  v_payment_id uuid;
  v_allocated_total bigint;
  v_first boolean := true;
begin
  select * into v_attempt from checkout_attempts
   where stripe_checkout_session_id = p_checkout_session_id for update;
  if not found then raise exception 'unknown checkout session'; end if;
  if v_attempt.amount <> p_amount_subtotal or v_attempt.currency <> lower(p_currency)
     or v_attempt.stripe_mode <> p_mode then
    raise exception 'checkout payment mismatch';
  end if;

  /* Already finalized. Return the primary enrollment rather than creating a second set — a
     repeated webhook is normal Stripe behaviour, not an error. */
  select enrollment_id into v_primary_enrollment_id from payments
   where stripe_checkout_session_id = p_checkout_session_id;
  if v_primary_enrollment_id is not null then return v_primary_enrollment_id; end if;

  /* The allocation was written at checkout. If it is missing, the purchase cannot be recorded
     honestly and must not be guessed at from current prices. */
  select coalesce(sum(allocated_amount), -1) into v_allocated_total
    from checkout_course_allocations where checkout_attempt_id = v_attempt.id;
  if v_allocated_total < 0 then raise exception 'no course allocation recorded for this checkout'; end if;
  if v_allocated_total <> v_attempt.amount then
    raise exception 'allocation totals % but the charge is %', v_allocated_total, v_attempt.amount;
  end if;

  for v_allocation in
    select a.course_id, a.allocated_amount, c.state
      from checkout_course_allocations a
      join courses c on c.id = a.course_id
     where a.checkout_attempt_id = v_attempt.id
     order by a.allocated_amount desc, a.course_id
  loop
    insert into enrollments(student_id, course_id, state, status, compliance_credit_eligible,
                            checkout_attempt_id, enrollment_date)
    values(v_attempt.student_id, v_allocation.course_id, v_allocation.state,
           case when v_attempt.qa_only then 'qa_non_credit' else 'active' end,
           /* A complimentary component carries no regulatory credit whatever the purchase
              was: it is not statutory pre-license education. */
           not v_attempt.qa_only and v_allocation.allocated_amount > 0,
           v_attempt.id, p_payment_date)
    returning id into v_enrollment_id;

    if v_first then
      v_primary_enrollment_id := v_enrollment_id;

      insert into payments(student_id, enrollment_id, course_id, state, stripe_mode, stripe_customer_id,
        stripe_checkout_session_id, stripe_payment_intent_id, amount, subtotal_amount, tax_amount,
        discount_amount, currency, status, payment_date, coupon_promotion_code,
        regulatory_acknowledgment_version, terms_version, refund_policy_version,
        cancellation_policy_version, qa_only)
      values(v_attempt.student_id, v_primary_enrollment_id, v_attempt.course_id, v_attempt.state, p_mode,
        p_customer_id, p_checkout_session_id, p_payment_intent_id, p_amount_total, p_amount_subtotal,
        p_amount_tax, p_amount_discount, lower(p_currency), 'paid', p_payment_date, p_coupon_code,
        v_attempt.regulatory_acknowledgment_version, v_attempt.terms_version,
        v_attempt.refund_policy_version, v_attempt.cancellation_policy_version, v_attempt.qa_only)
      returning id into v_payment_id;

      v_first := false;
    end if;

    insert into payment_enrollments(payment_id, enrollment_id, course_id, allocated_amount, is_primary, package_id)
    values(v_payment_id, v_enrollment_id, v_allocation.course_id, v_allocation.allocated_amount,
           v_enrollment_id = v_primary_enrollment_id, p_package_id);

    insert into access_grants(enrollment_id, student_id, course_id, status)
    values(v_enrollment_id, v_attempt.student_id, v_allocation.course_id, 'active');
  end loop;

  if v_payment_id is null then raise exception 'no allocation rows produced an enrollment'; end if;

  /* One notification for the purchase, not one per component. */
  insert into notification_outbox(student_id, enrollment_id, payment_id, notification_type)
  values(v_attempt.student_id, v_primary_enrollment_id, v_payment_id, 'payment_and_enrollment_confirmation');
  update checkout_attempts set status = 'paid', updated_at = now() where id = v_attempt.id;

  insert into admin_audit_log(action, payment_id, detail)
  values('package_finalized', v_payment_id,
         jsonb_build_object('package_id', p_package_id, 'session', p_checkout_session_id,
                            'components', (select count(*) from payment_enrollments where payment_id = v_payment_id)));
  return v_primary_enrollment_id;
end $$;

/*
 * Backfill: a single-course payment taken before this migration has no payment_enrollments
 * row. The refund path reads the allocation, and a purchase with no row would look like a
 * purchase of nothing.
 */
insert into payment_enrollments(payment_id, enrollment_id, course_id, allocated_amount, is_primary, package_id)
select p.id, p.enrollment_id, p.course_id, p.amount, true, null
  from payments p
 where not exists (select 1 from payment_enrollments pe where pe.payment_id = p.id)
on conflict do nothing;

/* Everything a payment bought, in one place, for the ledger and for an operator. */
create or replace view payment_components with (security_invoker=true) as
select pe.payment_id, pe.package_id, pe.course_id, c.name as course_name,
       pe.allocated_amount, pe.is_primary, pe.enrollment_id,
       e.status as enrollment_status, e.compliance_credit_eligible,
       p.student_id, p.amount as payment_amount, p.currency, p.stripe_mode,
       p.stripe_payment_intent_id
  from payment_enrollments pe
  join payments p on p.id = pe.payment_id
  join enrollments e on e.id = pe.enrollment_id
  join courses c on c.id = pe.course_id;

revoke all on function finalize_paid_package(text,text,text,text,text,bigint,bigint,bigint,bigint,text,timestamptz,text,text,text) from public;
grant execute on function finalize_paid_package(text,text,text,text,text,bigint,bigint,bigint,bigint,text,timestamptz,text,text,text) to service_role;
grant select, insert on payment_enrollments to service_role;
grant select on payment_components to service_role;
