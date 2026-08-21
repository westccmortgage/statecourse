-- 010 Refunds StateCourse did not initiate
--
-- A refund issued by hand in the Stripe Dashboard has already happened by the time we hear
-- about it. There is no version of this where the platform "rejects" it: the money has moved,
-- the student has it, and the only question left is whether our record says the same thing
-- Stripe's does.
--
-- Everything in the platform path runs policy-first — calculate the entitlement, record the
-- decision, then call Stripe. An external refund runs in the opposite order and cannot be made
-- to run in ours. So it is handled on its own terms:
--
--   1. It is recorded with the ACTUAL amount Stripe reports, never a computed one. The
--      financial state must match Stripe's, which means our figures follow Stripe here rather
--      than the other way round.
--   2. It is marked origin='external', so it is never mistaken for a decision this system made.
--   3. If it exceeds what CA-2026-08-20-v1 would have allowed, that is a POLICY EXCEPTION. Not
--      an error to retry, not something to reverse — a fact about a refund that has already
--      been paid, recorded with the entitlement it exceeded and by how much, and surfaced to
--      an administrator.
--
-- The distinction matters beyond bookkeeping. A refund the policy would not have allowed is
-- either a deliberate goodwill payment or a mistake, and only a person can tell which. What
-- the system owes them is the discrepancy, stated plainly, not a silent reconciliation.

alter table refunds
  add column if not exists origin text not null default 'platform'
    check (origin in ('platform', 'external')),
  add column if not exists policy_exception boolean not null default false,
  add column if not exists policy_exception_amount bigint,
  add column if not exists policy_exception_note text,
  add column if not exists exception_reviewed boolean not null default false;

comment on column refunds.origin is
  'platform: decided by the refund engine under the adopted policy, then sent to Stripe. external: issued outside this system, typically by hand in the Stripe Dashboard, and recorded after the fact at the amount Stripe reports.';

create index if not exists refunds_exception_idx
  on refunds(created_at) where policy_exception = true and exception_reviewed = false;

/*
 * Record a refund this system did not initiate.
 *
 * The refund row itself is written by apply_refund_event from the webhook, as it is for any
 * refund; this marks what that row is and what the policy would have allowed. p_policy_amount
 * is computed by the caller from lib/refund-policy.mjs, because the policy is implemented in
 * one place and that place is not SQL.
 *
 * Idempotent: a repeated refund.updated for the same refund re-states the same facts rather
 * than raising a second exception.
 */
create or replace function mark_external_refund(
  p_stripe_refund_id text, p_actual_amount bigint, p_policy_amount bigint, p_note text
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_refund refunds%rowtype;
  v_exceeds boolean;
begin
  select * into v_refund from refunds where stripe_refund_id = p_stripe_refund_id for update;
  if not found then raise exception 'unknown refund %', p_stripe_refund_id; end if;

  /* A refund this system decided is never reclassified. If a policy decision was recorded
     against it, it came from the refund engine and the Dashboard was not involved. */
  if v_refund.policy_version is not null and v_refund.origin = 'platform'
     and v_refund.policy_amount is not null then
    return;
  end if;

  /* A null entitlement is "not yet assessed", never "nothing was owed". An unassessed refund
     is neither within the entitlement nor an exception; it is waiting for the assessment, and
     the outcome says so rather than defaulting to the reassuring answer. */
  v_exceeds := p_policy_amount is not null and p_actual_amount > p_policy_amount;

  update refunds
     set origin = 'external',
         policy_version = coalesce(policy_version, 'CA-2026-08-20-v1'),
         policy_amount = p_policy_amount,
         policy_outcome = case
           when p_policy_amount is null then 'external_entitlement_unassessed'
           when v_exceeds then 'external_exceeds_entitlement'
           else 'external_within_entitlement' end,
         policy_overridden = v_exceeds,
         policy_exception = v_exceeds,
         policy_exception_amount = case when v_exceeds then p_actual_amount - p_policy_amount else null end,
         policy_exception_note = p_note,
         updated_at = now()
   where id = v_refund.id;

  insert into admin_audit_log(action, payment_id, detail)
  values('external_refund_recorded', v_refund.payment_id,
         jsonb_build_object(
           'refund_id', p_stripe_refund_id,
           'actual_amount', p_actual_amount,
           'policy_amount', p_policy_amount,
           'exceeds_entitlement', v_exceeds,
           'excess', case when v_exceeds then p_actual_amount - p_policy_amount else 0 end));
end $$;

/*
 * Assess an external refund against the entitlement, once something has computed it.
 *
 * Separate from mark_external_refund because the two happen at different times and for
 * different reasons: the webhook records what Stripe did, and the assessment decides what the
 * policy would have allowed. Keeping them apart is what lets the webhook stay clear of course
 * progress records entirely.
 */
create or replace function assess_external_refund(
  p_stripe_refund_id text, p_policy_amount bigint, p_note text
) returns void language plpgsql security definer set search_path = public as $$
declare v_refund refunds%rowtype; v_exceeds boolean;
begin
  select * into v_refund from refunds where stripe_refund_id = p_stripe_refund_id for update;
  if not found then raise exception 'unknown refund %', p_stripe_refund_id; end if;
  if v_refund.origin <> 'external' then raise exception 'refund % was decided by the refund engine', p_stripe_refund_id; end if;
  if p_policy_amount is null then raise exception 'assess_external_refund requires an entitlement'; end if;

  v_exceeds := v_refund.amount > p_policy_amount;
  update refunds
     set policy_amount = p_policy_amount,
         policy_outcome = case when v_exceeds then 'external_exceeds_entitlement' else 'external_within_entitlement' end,
         policy_overridden = v_exceeds,
         policy_exception = v_exceeds,
         policy_exception_amount = case when v_exceeds then v_refund.amount - p_policy_amount else null end,
         policy_exception_note = coalesce(p_note, policy_exception_note),
         updated_at = now()
   where id = v_refund.id;

  insert into admin_audit_log(action, payment_id, detail)
  values('external_refund_assessed', v_refund.payment_id,
         jsonb_build_object('refund_id', p_stripe_refund_id, 'actual_amount', v_refund.amount,
                            'entitlement', p_policy_amount, 'exceeds_entitlement', v_exceeds,
                            'excess', case when v_exceeds then v_refund.amount - p_policy_amount else 0 end));
end $$;

/* External refunds recorded but not yet compared against the entitlement. */
create or replace view external_refunds_unassessed with (security_invoker=true) as
select r.id, r.stripe_refund_id, r.payment_id, r.amount as actual_amount, r.created_at,
       p.course_id, p.state, p.stripe_mode
  from refunds r
  left join payments p on p.id = r.payment_id
 where r.origin = 'external' and r.policy_outcome = 'external_entitlement_unassessed';

/*
 * Refunds that were paid but that the policy would not have allowed, awaiting review.
 *
 * Nothing acts on this automatically and nothing should. The refund has been paid; a person
 * decides whether it was goodwill or a mistake, and the record exists so that decision is made
 * on the facts rather than discovered in a bank statement.
 */
create or replace view refund_policy_exceptions_open with (security_invoker=true) as
select r.id, r.stripe_refund_id, r.payment_id, r.amount as actual_amount,
       r.policy_amount as entitlement, r.policy_exception_amount as excess,
       r.policy_exception_note, r.origin, r.created_at,
       p.course_id, p.state, p.student_id, p.amount as payment_amount, p.stripe_mode
  from refunds r
  left join payments p on p.id = r.payment_id
 where r.policy_exception = true and r.exception_reviewed = false;

create or replace function review_refund_exception(
  p_stripe_refund_id text, p_note text
) returns void language plpgsql security definer set search_path = public as $$
begin
  update refunds
     set exception_reviewed = true,
         policy_exception_note = coalesce(p_note, policy_exception_note),
         updated_at = now()
   where stripe_refund_id = p_stripe_refund_id and policy_exception = true;
  if not found then raise exception 'no open exception for refund %', p_stripe_refund_id; end if;
  insert into admin_audit_log(action, detail)
  values('refund_exception_reviewed', jsonb_build_object('refund_id', p_stripe_refund_id, 'note', p_note));
end $$;

revoke all on function mark_external_refund(text,bigint,bigint,text) from public;
revoke all on function assess_external_refund(text,bigint,text) from public;
grant execute on function assess_external_refund(text,bigint,text) to service_role;
grant select on external_refunds_unassessed to service_role;
revoke all on function review_refund_exception(text,text) from public;
grant execute on function mark_external_refund(text,bigint,bigint,text) to service_role;
grant execute on function review_refund_exception(text,text) to service_role;
grant select on refund_policy_exceptions_open to service_role;
