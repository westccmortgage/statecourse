-- 009 Stripe integrity: the charge, the reconciliation, and what happens when the two
-- records disagree
--
-- Stripe is part of this architecture rather than an integration bolted on beside it, and
-- what makes it part of it is that both sides carry the same facts and can be compared. The
-- payment path already had the pieces that stop a duplicate: claim_stripe_event makes each
-- event single-use, finalize_paid_checkout returns the existing enrollment rather than making
-- a second one, and apply_refund_event upserts on the Stripe refund id. What it did not have
-- was the charge, or anywhere to put a disagreement.
--
--   1. payments.stripe_charge_id and refunds.stripe_charge_id — a refund is reconciled by
--      charge as often as by payment intent, and neither was recorded. Without the charge the
--      only key we share with Stripe on a refund is the payment intent, so a refund issued in
--      the Stripe dashboard against a charge could not be matched to a payment at all.
--
--   2. record_payment_charge — writes the charge and the received amount when the
--      PaymentIntent settles. It does NOT create an enrollment: the paid Checkout Session is
--      the only thing that does, so a PaymentIntent event arriving first, late, or twice
--      changes nothing about what the student is enrolled in.
--
--   3. record_charge_refund_total — Stripe's own running refunded total for a charge, kept
--      beside the total we compute from our refund rows. Two independently maintained figures
--      that should agree are the cheapest possible check on our own arithmetic.
--
--   4. stripe_reconciliation_events — where a disagreement goes. It is recorded rather than
--      raised: raising would fail the webhook, Stripe would retry for days, every retry would
--      find the same disagreement, and the database would never converge. A discrepancy
--      should arrive as a discrepancy, not as an outage.
--
-- Amounts are never recomputed here from a price. Every figure written is one Stripe sent.

alter table payments
  add column if not exists stripe_charge_id text,
  add column if not exists stripe_amount_received bigint,
  add column if not exists stripe_charge_refunded bigint;

alter table refunds
  add column if not exists stripe_charge_id text;

create index if not exists payments_stripe_charge_idx on payments(stripe_charge_id);

/* One row per disagreement between Stripe's record and ours. Nothing reads it automatically;
   it exists so that a disagreement is durable and reviewable rather than a log line in a
   function that has already returned 200. */
create table if not exists stripe_reconciliation_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id),
  stripe_event_id text not null,
  stripe_event_type text not null,
  mismatches jsonb not null,
  resolved boolean not null default false,
  resolved_note text,
  created_at timestamptz not null default now()
);

comment on table stripe_reconciliation_events is
  'Recorded when Stripe and the StateCourse record disagree about a payment intent, charge, amount, currency or status. Recorded rather than raised: a webhook that fails on a disagreement is retried forever and converges on nothing.';

create index if not exists stripe_reconciliation_open_idx
  on stripe_reconciliation_events(created_at) where resolved = false;

create or replace function record_payment_charge(
  p_payment_intent_id text, p_charge_id text, p_amount_received bigint, p_status text
) returns void language plpgsql security definer set search_path = public as $$
declare v_payment payments%rowtype;
begin
  select * into v_payment from payments
   where stripe_payment_intent_id = p_payment_intent_id for update;
  /* A PaymentIntent event can arrive before the Checkout Session has been finalized. That is
     not an error and must not fail the event: the session will create the payment, and the
     charge arrives with it or on the next PaymentIntent event. */
  if not found then return; end if;

  update payments
     set stripe_charge_id = coalesce(p_charge_id, stripe_charge_id),
         stripe_amount_received = coalesce(p_amount_received, stripe_amount_received),
         updated_at = now()
   where id = v_payment.id;

  /* Stripe says it received a different amount from the one we recorded. Not raised — see the
     header — but never silently dropped either. */
  if p_amount_received is not null and p_amount_received > 0 and p_amount_received <> v_payment.amount then
    insert into stripe_reconciliation_events(payment_id, stripe_event_id, stripe_event_type, mismatches)
    values(v_payment.id, coalesce(p_charge_id, p_payment_intent_id), 'payment_intent.amount_received',
           jsonb_build_array(jsonb_build_object(
             'field','amount','ours',v_payment.amount,'theirs',p_amount_received)));
  end if;

  insert into admin_audit_log(action, payment_id, detail)
  values('stripe_charge_recorded', v_payment.id,
         jsonb_build_object('charge_id', p_charge_id, 'status', p_status, 'amount_received', p_amount_received));
end $$;

create or replace function record_charge_refund_total(
  p_charge_id text, p_payment_intent_id text, p_amount_refunded bigint, p_fully_refunded boolean
) returns void language plpgsql security definer set search_path = public as $$
declare v_payment payments%rowtype;
begin
  select * into v_payment from payments
   where stripe_charge_id = p_charge_id
      or stripe_payment_intent_id = p_payment_intent_id
   limit 1 for update;
  if not found then return; end if;

  update payments
     set stripe_charge_id = coalesce(stripe_charge_id, p_charge_id),
         stripe_charge_refunded = p_amount_refunded,
         updated_at = now()
   where id = v_payment.id;

  /* Our refund_amount is summed from our own refund rows; Stripe's amount_refunded is its
     own. They are maintained independently and must agree. */
  if p_amount_refunded is distinct from v_payment.refund_amount then
    insert into stripe_reconciliation_events(payment_id, stripe_event_id, stripe_event_type, mismatches)
    values(v_payment.id, p_charge_id, 'charge.refunded',
           jsonb_build_array(jsonb_build_object(
             'field','refund_amount','ours',v_payment.refund_amount,'theirs',p_amount_refunded)));
  end if;
end $$;

create or replace function record_stripe_reconciliation(
  p_payment_id uuid, p_event_id text, p_event_type text, p_mismatches jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_mismatches is null or jsonb_array_length(p_mismatches) = 0 then return null; end if;
  insert into stripe_reconciliation_events(payment_id, stripe_event_id, stripe_event_type, mismatches)
  values(p_payment_id, p_event_id, p_event_type, p_mismatches)
  returning id into v_id;
  return v_id;
end $$;

/* Open disagreements, for an operator and for the release gate. A packet must not be called
   PRINT_READY, and payments must not go live, while this returns rows. */
create or replace view stripe_reconciliation_open with (security_invoker=true) as
select r.id, r.payment_id, r.stripe_event_id, r.stripe_event_type, r.mismatches, r.created_at,
       p.stripe_mode, p.course_id, p.state, p.amount, p.refund_amount
  from stripe_reconciliation_events r
  left join payments p on p.id = r.payment_id
 where r.resolved = false;

revoke all on function record_payment_charge(text,text,bigint,text) from public;
revoke all on function record_charge_refund_total(text,text,bigint,boolean) from public;
revoke all on function record_stripe_reconciliation(uuid,text,text,jsonb) from public;
grant execute on function record_payment_charge(text,text,bigint,text) to service_role;
grant execute on function record_charge_refund_total(text,text,bigint,boolean) to service_role;
grant execute on function record_stripe_reconciliation(uuid,text,text,jsonb) to service_role;
grant select on stripe_reconciliation_open to service_role;
