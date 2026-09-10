-- Free training enrolment, without pretending money changed hands.
--
-- enrollments.checkout_attempt_id was not null, and checkout_attempts.amount must be
-- greater than zero, so the only way to enrol someone for free was to write a fake
-- purchase. A fake purchase in the payment ledger is worse than no row: it is the ledger
-- lying about itself, and every later reconciliation inherits the lie.
--
-- So an enrolment now says where it came from, and a training enrolment carries no
-- checkout attempt at all.

begin;

alter table enrollments
  add column if not exists enrollment_origin text not null default 'purchase'
    check (enrollment_origin in ('purchase','training','review'));

alter table enrollments alter column checkout_attempt_id drop not null;

alter table enrollments drop constraint if exists enrollment_origin_has_its_evidence;
alter table enrollments add constraint enrollment_origin_has_its_evidence check (
  enrollment_origin <> 'purchase' or checkout_attempt_id is not null
);

/*
 * The load-bearing one. Training is study without credit, and this is the sentence that
 * makes that true rather than intended: no training enrolment can be marked
 * credit-eligible, whatever any endpoint, migration or operator later decides. Regulated
 * credit follows an approval, and an approval is recorded elsewhere.
 */
alter table enrollments drop constraint if exists training_enrolments_never_earn_credit;
alter table enrollments add constraint training_enrolments_never_earn_credit check (
  enrollment_origin <> 'training' or compliance_credit_eligible = false
);

create index if not exists enrollments_origin_idx on enrollments(enrollment_origin, course_id);

comment on column enrollments.enrollment_origin is
  'purchase: a checkout attempt exists and is referenced. training: free study, never '
  'credit-eligible, permitted only where offering governance enables training access. '
  'review: a regulator or internal reviewer grant.';

commit;
