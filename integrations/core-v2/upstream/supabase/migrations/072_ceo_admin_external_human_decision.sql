-- An Admin owner belongs to the Admin Supabase project, not auth.users in
-- this engine. Keep the actual human identity without inventing an engine user.
alter table public.decisions
  add column if not exists decided_by_external_owner_id uuid,
  add column if not exists external_request_fingerprint text;
comment on column public.decisions.decided_by_external_owner_id is
  'Authenticated owner in CEO Admin, checked against the enabled tenant mapping at resolution time; intentionally not an engine auth.users id.';
comment on column public.decisions.external_request_fingerprint is
  'Canonical resolution request digest for idempotent replay of a signed Admin decision.';

alter table public.decisions drop constraint decisions_decided_by_exactly_one;
alter table public.decisions drop constraint decisions_human_decided_by_person;
alter table public.decisions add constraint decisions_decided_by_exactly_one check (
  status not in ('machine_decided','human_decided')
  or (status = 'machine_decided' and decided_by_attempt_id is not null
      and decided_by_user_id is null and decided_by_external_owner_id is null)
  or (status = 'human_decided' and decided_by_attempt_id is null
      and num_nonnulls(decided_by_user_id, decided_by_external_owner_id) = 1)
);
alter table public.decisions add constraint decisions_human_decided_by_person check (
  status <> 'human_decided'
  or num_nonnulls(decided_by_user_id, decided_by_external_owner_id) = 1
);

-- Waking is part of the human decision transaction. A settled continuation
-- gets its SAME workflow back only after every hold closes, and only under
-- the budget already recorded for that workflow. Both resolver and stop
-- invoke this helper, so resolution racing a runner's final stop is not lost.
create or replace function public.core_v2_resume_after_human_decision(p_workflow_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  wf public.intelligence_workflows;
  continuation public.workflow_continuations;
begin
  select * into wf from public.intelligence_workflows
   where id = p_workflow_id for update;
  if not found or wf.state <> 'needs_attention'
     or wf.cancel_requested_at is not null then return false; end if;
  select * into continuation from public.workflow_continuations
   where workflow_id = p_workflow_id for update;
  if not found or continuation.state <> 'settled'
     or continuation.settled_reason <> 'handed_to_a_person' then return false; end if;
  if not exists (select 1 from public.workflow_cost_budgets b
                  where b.workflow_id = p_workflow_id and b.stopped_at is null)
     or exists (select 1 from public.disagreements d
                 where d.workflow_id = p_workflow_id and d.state = 'needs_human')
     or exists (select 1 from public.decisions d
                 where d.workflow_id = p_workflow_id and d.status = 'needs_human')
     or not exists (select 1 from public.workflow_tasks t
                     where t.workflow_id = p_workflow_id
                       and t.state in ('created','blocked','queued'))
  then return false; end if;

  update public.intelligence_workflows
     set state = 'running', error_code = null, error_message = null
   where id = p_workflow_id and state = 'needs_attention';
  update public.workflow_continuations
     set state = 'due', due_at = now(), settled_at = null,
         settled_reason = null, idle_streak = 0, backoff_ms = 0,
         last_error = null
   where workflow_id = p_workflow_id and state = 'settled';
  perform public.core_v2_audit(wf.organization_id,
    'core_v2.workflow.resumed_after_human_decision', 'intelligence_workflow',
    p_workflow_id::text, jsonb_build_object('continuation_reused', true));
  return true;
end $$;

-- A resolution that commits just before the runner settles must not strand
-- the continuation. Reuse the same wake condition after the atomic stop.
create or replace function public.core_v2_stop_workflow_and_settle(
  p_workflow_id uuid,
  p_reason text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  ended text;
  row public.workflow_continuations;
begin
  -- One transaction: the function body. Either the workflow says why it
  -- stopped AND its continuation is settled, or neither happened.
  ended := public.core_v2_note_workflow_stopped(p_workflow_id, p_reason);
  select * into row from public.core_v2_settle_continuation(p_workflow_id, p_reason);
  -- The owner may have resolved the last hold while this runner was stopping.
  -- The common resume gate serializes on workflow then continuation.
  if p_reason = 'handed_to_a_person' and
     public.core_v2_resume_after_human_decision(p_workflow_id) then
    select state into ended from public.intelligence_workflows where id = p_workflow_id;
    select * into row from public.workflow_continuations where workflow_id = p_workflow_id;
  end if;
  return jsonb_build_object(
    'workflow_state', ended,
    'continuation_state', row.state,
    'settled_reason', row.settled_reason
  );
end $$;
revoke all on function public.core_v2_resume_after_human_decision(uuid)
  from public, anon, authenticated, service_role;

-- This is a separate service door. The original engine-user resolver retains
-- its auth.uid() rule. No browser role can invoke the external-owner door.
create or replace function public.core_v2_resolve_disagreement_record(
  p_user_actor uuid,
  p_external_owner uuid,
  p_disagreement_id uuid,
  p_outcome text,
  p_note text default null,
  p_accepted_claim_id uuid default null,
  p_corrected_value jsonb default null,
  p_corrected_unit text default null,
  p_corrected_source text default null,
  p_evidence_anchor_ids uuid[] default null
) returns public.decisions language plpgsql security definer set search_path = public as $$
declare
  dis public.disagreements;
  winner public.evidence_claims;
  template public.evidence_claims;
  decision public.decisions;
  loser uuid;
  anchor uuid;
  anchor_workflow uuid;
  kept jsonb;
  request_fingerprint text;
begin
  if num_nonnulls(p_user_actor, p_external_owner) <> 1 then
    raise exception 'core_v2: exactly one human actor is required';
  end if;
  request_fingerprint := encode(sha256(convert_to(jsonb_build_object(
    'outcome', p_outcome, 'note', p_note, 'accepted_claim', p_accepted_claim_id,
    'corrected_value', p_corrected_value, 'corrected_unit', p_corrected_unit,
    'corrected_source', p_corrected_source, 'anchor_ids', p_evidence_anchor_ids
  )::text, 'UTF8')), 'hex');
  select * into dis from public.disagreements where id = p_disagreement_id for update;
  if not found then raise exception 'core_v2: no such disagreement'; end if;
  if dis.state = 'resolved' then
    select * into decision from public.decisions d
     where d.id = dis.resolution_decision_id;
    if decision.decided_by_external_owner_id = p_external_owner
       and p_external_owner is not null
       and decision.external_request_fingerprint = request_fingerprint then
      return decision;
    end if;
  end if;
  if dis.state not in ('open','verifying','needs_human') then
    raise exception 'core_v2: disagreement % is % — it is not open', p_disagreement_id, dis.state;
  end if;

  select jsonb_agg(dc.claim_id order by dc.position, dc.claim_id) into kept
    from public.disagreement_claims dc where dc.disagreement_id = dis.id;
  -- The template a correction is written from, and the set a rejection covers,
  -- are the claims that actually competed. A reading carried for context, or a
  -- counterpart that was never there, did not disagree with anything.
  select c.* into template from public.disagreement_claims dc
    join public.evidence_claims c on c.id = dc.claim_id
   where dc.disagreement_id = dis.id and dc.role = 'candidate'
   order by dc.position, dc.claim_id limit 1;

  -- Asking for more evidence settles nothing, and says so. It moves the
  -- disagreement to where a person can see it and writes its own event; it never
  -- writes the word `resolved`.
  if p_outcome = 'needs_more_evidence' then
    if dis.state <> 'needs_human' then
      perform public.core_v2_disagreement_transition(p_disagreement_id, 'needs_human');
    end if;
    perform public.core_v2_audit(dis.organization_id, 'core_v2.disagreement.more_evidence_requested',
      'disagreement', p_disagreement_id::text,
      jsonb_build_object('note', p_note, 'claims_kept', kept,
        'user_actor', p_user_actor, 'external_admin_owner', p_external_owner));
    return null;
  end if;

  if p_outcome = 'accept_claim' then
    if p_accepted_claim_id is null
       or not exists (select 1 from public.disagreement_claims dc
                       where dc.disagreement_id = dis.id and dc.claim_id = p_accepted_claim_id
                         and dc.role = 'candidate') then
      raise exception 'core_v2: the accepted claim must be one of the claims that disagreed';
    end if;
    winner := public.core_v2_claim_transition(p_accepted_claim_id, 'accepted');
  elsif p_outcome = 'correct' then
    -- None of the readings was right. The person supplies the corrected value
    -- and what they read it off; that becomes a reported claim with a human
    -- anchor, and it supersedes nothing quietly — the readings it replaces are
    -- rejected below and stay in the record.
    if p_corrected_value is null or p_corrected_source is null then
      raise exception 'core_v2: a correction needs both the corrected value and the source it was read from';
    end if;
    if template.id is null then
      raise exception 'core_v2: disagreement % names no claim to correct', p_disagreement_id;
    end if;
    insert into public.evidence_claims(
      organization_id, workflow_id, subject_type, subject_key, predicate,
      value, unit, observation_basis, scope, status, supersedes_claim_id)
    values (dis.organization_id, dis.workflow_id, template.subject_type,
            template.subject_key, template.predicate, p_corrected_value, p_corrected_unit,
            'reported', template.scope, 'accepted', template.id)
    returning * into winner;
    insert into public.evidence_anchors(organization_id, workflow_id, claim_id, source_kind,
      quoted_text, anchor_hash, locator)
    values (dis.organization_id, dis.workflow_id, winner.id, 'human_record', p_corrected_source,
            encode(sha256(convert_to(winner.id::text || p_corrected_source, 'UTF8')), 'hex'),
            jsonb_build_object('recorded_by', p_user_actor,
              'recorded_by_external_admin_owner', p_external_owner, 'note', p_note));
  elsif p_outcome = 'reject_all' then
    -- The source supports none of them. That is an adjudication with its own
    -- burden of proof, not a shrug: every competing claim is rejected and named,
    -- and the decision points at what the source does show.
    if p_evidence_anchor_ids is null or array_length(p_evidence_anchor_ids, 1) is null then
      raise exception 'core_v2: rejecting every reading needs at least one source anchor saying what the source shows';
    end if;
  else
    raise exception 'core_v2: % is not an outcome this function knows', p_outcome;
  end if;

  insert into public.decisions(organization_id, workflow_id, disagreement_id, decision_type,
    subject_key, title, summary, status, authority, rationale,
    decided_by_user_id, decided_by_external_owner_id, external_request_fingerprint, effective_at)
  values (dis.organization_id, dis.workflow_id, dis.id,
    case when p_outcome = 'reject_all' then 'reject_all' else 'accept_claim' end,
    coalesce(winner.subject_key, template.subject_key, ''),
    case when p_outcome = 'reject_all'
         then format('No reading of %s is supported by the source', dis.disagreement_key)
         else format('%s %s', winner.subject_key, winner.predicate) end,
    jsonb_build_object('outcome', p_outcome, 'accepted_claim_id', winner.id,
                       'disagreement_id', p_disagreement_id),
    -- Proposed first, then decided: a decided decision's evidence set is closed,
    -- so the links below have to be written while it is still open. The
    -- transition at the end is what makes it authoritative.
    'proposed', 'human', coalesce(p_note, ''), p_user_actor, p_external_owner,
    case when p_external_owner is not null then request_fingerprint end, null)
  returning * into decision;

  if winner.id is not null then
    insert into public.decision_evidence(organization_id, decision_id, claim_id, link, rule)
    values (dis.organization_id, decision.id, winner.id, 'supports', 'human_resolution');
  end if;

  -- The claims that lost. Rejected, linked to the decision that rejected them,
  -- and still there to read.
  for loser in
    select dc.claim_id from public.disagreement_claims dc
     where dc.disagreement_id = dis.id and dc.role = 'candidate'
       and dc.claim_id is distinct from winner.id
     order by dc.position, dc.claim_id
  loop
    perform public.core_v2_claim_transition(loser, 'rejected');
    insert into public.decision_evidence(organization_id, decision_id, claim_id, link, rule)
    values (dis.organization_id, decision.id, loser, 'contradicts', 'human_resolution');
  end loop;

  if p_outcome = 'reject_all' then
    foreach anchor in array p_evidence_anchor_ids loop
      select a.workflow_id into anchor_workflow from public.evidence_anchors a where a.id = anchor;
      if anchor_workflow is distinct from dis.workflow_id then
        raise exception 'core_v2: that source anchor does not belong to this workflow';
      end if;
      insert into public.decision_evidence(organization_id, decision_id, anchor_id, link, rule)
      values (dis.organization_id, decision.id, anchor, 'context', 'human_resolution');
    end loop;
  end if;

  -- proposed -> needs_human -> human_decided, the path a decision a person
  -- makes takes. The evidence above was written while it was still open; from
  -- here it is closed.
  perform public.core_v2_decision_transition(decision.id, 'needs_human');
  decision := public.core_v2_decision_transition(decision.id, 'human_decided');
  -- The former unanswered proposal is history, not another open request.
  update public.decisions
     set status = 'superseded', superseded_at = now()
   where disagreement_id = p_disagreement_id
     and id <> decision.id and status = 'needs_human';
  perform public.core_v2_disagreement_transition(p_disagreement_id, 'resolved', decision.id);
  perform public.core_v2_audit(dis.organization_id, 'core_v2.disagreement.resolved', 'disagreement',
    p_disagreement_id::text, jsonb_build_object('outcome', p_outcome, 'note', p_note,
      'decision_id', decision.id, 'accepted_claim_id', winner.id,
      'claims_kept', kept, 'user_actor', p_user_actor,
      'external_admin_owner', p_external_owner));
  perform public.core_v2_resume_after_human_decision(dis.workflow_id);
  return decision;
end $$;



-- Only the two gated wrappers can reach the shared mutating operation.
revoke all on function public.core_v2_resolve_disagreement_record(
  uuid,uuid,uuid,text,text,uuid,jsonb,text,text,uuid[]) from public, anon, authenticated, service_role;

-- Preserve the original authenticated engine entry point and its role check.
create or replace function public.core_v2_resolve_disagreement(
  p_disagreement_id uuid,
  p_outcome text,
  p_note text default null,
  p_accepted_claim_id uuid default null,
  p_corrected_value jsonb default null,
  p_corrected_unit text default null,
  p_corrected_source text default null,
  p_evidence_anchor_ids uuid[] default null
) returns public.decisions language plpgsql security definer set search_path = public as $$
declare dis public.disagreements;
begin
  select * into dis from public.disagreements where id = p_disagreement_id;
  if not found then raise exception 'core_v2: no such disagreement'; end if;
  if not public.has_org_role(dis.organization_id,
      array['owner','admin','reviewer']::public.studio_role[]) then
    raise exception 'core_v2: only an owner, an administrator or a reviewer settles a disagreement';
  end if;
  return public.core_v2_resolve_disagreement_record(auth.uid(), null,
    p_disagreement_id, p_outcome, p_note, p_accepted_claim_id,
    p_corrected_value, p_corrected_unit, p_corrected_source, p_evidence_anchor_ids);
end $$;

-- The service door checks the current Admin tenant mapping and submitter role.
create or replace function public.core_v2_resolve_ceo_admin_disagreement(
  p_submitter uuid,
  p_admin_owner uuid,
  p_disagreement_id uuid,
  p_outcome text,
  p_note text default null,
  p_accepted_claim_id uuid default null,
  p_corrected_value jsonb default null,
  p_corrected_unit text default null,
  p_corrected_source text default null,
  p_evidence_anchor_ids uuid[] default null
) returns public.decisions language plpgsql security definer set search_path = public as $$
declare dis public.disagreements;
begin
  select * into dis from public.disagreements where id = p_disagreement_id;
  if not found then raise exception 'core_v2: no such disagreement'; end if;
  if public.ceo_admin_tenant_for(p_submitter, p_admin_owner) is distinct from dis.organization_id
     or not exists (
       select 1 from public.organization_members m
        where m.organization_id = dis.organization_id
          and m.user_id = p_submitter
          and m.role = any(array['owner','admin','reviewer']::public.studio_role[])
     ) then
    raise exception 'core_v2: CEO Admin owner is not authorised for this disagreement';
  end if;
  return public.core_v2_resolve_disagreement_record(null, p_admin_owner,
    p_disagreement_id, p_outcome, p_note, p_accepted_claim_id,
    p_corrected_value, p_corrected_unit, p_corrected_source, p_evidence_anchor_ids);
end $$;

comment on function public.core_v2_resolve_ceo_admin_disagreement(
  uuid,uuid,uuid,text,text,uuid,jsonb,text,text,uuid[]) is
  'Resolve a CEO Admin disagreement under the signed Admin owner identity, checking the tenant mapping and current submitter role; both entry points share one resolution kernel. Exact retries return the recorded decision; different retries are refused.';
revoke all on function public.core_v2_resolve_ceo_admin_disagreement(
  uuid,uuid,uuid,text,text,uuid,jsonb,text,text,uuid[]) from public, anon, authenticated;
grant execute on function public.core_v2_resolve_ceo_admin_disagreement(
  uuid,uuid,uuid,text,text,uuid,jsonb,text,text,uuid[]) to service_role;

-- A human hold is a workflow-wide pause on buying more work. Existing
-- submissions keep their lease and reconciliation path; no attempt is erased.
create or replace function public.core_v2_lease_task(p_task_id uuid, p_owner text, p_ttl_ms integer)
returns public.workflow_tasks language plpgsql security definer set search_path = public as $$
declare row public.workflow_tasks;
begin
  update public.workflow_tasks t
     set state = 'leased',
         lease_owner = p_owner,
         lease_token = gen_random_uuid(),
         lease_expires_at = now() + make_interval(secs => p_ttl_ms / 1000.0)
   where t.id = p_task_id
     and (t.state = 'queued' or (t.state = 'leased' and t.lease_expires_at < now()))
     and not public.core_v2_task_has_open_attempt(t)
     -- The work already sent is reconciled separately. New work cannot be
     -- leased while any evidence dispute or decision awaits a person.
     and not exists (select 1 from public.disagreements d
                      where d.workflow_id = t.workflow_id and d.state = 'needs_human')
     and not exists (select 1 from public.decisions d
                      where d.workflow_id = t.workflow_id and d.status = 'needs_human')
  returning t.* into row;
  return row;
end $$;


-- The final money boundary checks the hold again. A lease taken before a
-- conflict arose cannot turn into a paid submission while the person waits.
create or replace function public.core_v2_transition_allowed(
  p_machine text, p_from text, p_to text
) returns boolean language sql immutable as $$
  select exists (
    select 1 from (values
      -- workflow
      ('workflow','created','queued'),
      ('workflow','created','cancelled'),
      ('workflow','queued','planning'),
      ('workflow','queued','cancelled'),
      ('workflow','queued','failed'),
      ('workflow','planning','running'),
      ('workflow','planning','needs_attention'),
      ('workflow','planning','failed'),
      ('workflow','planning','cancelled'),
      ('workflow','running','needs_attention'),
      ('workflow','running','ready_for_decision'),
      ('workflow','running','cancelled'),
      ('workflow','running','failed'),
      ('workflow','needs_attention','running'),
      ('workflow','needs_attention','ready_for_decision'),
      ('workflow','needs_attention','cancelled'),
      ('workflow','needs_attention','failed'),
      ('workflow','ready_for_decision','deciding'),
      ('workflow','ready_for_decision','needs_attention'),
      ('workflow','deciding','completed'),
      ('workflow','deciding','partial'),
      ('workflow','deciding','needs_attention'),
      ('workflow','deciding','failed'),
      -- task
      ('task','created','blocked'),
      ('task','created','queued'),
      ('task','created','cancelled'),
      ('task','blocked','queued'),
      ('task','blocked','cancelled'),
      ('task','blocked','superseded'),
      -- A task already offered to workers can gain a prerequisite it did not
      -- have when it was planned — a follow-up it must now wait for. It goes
      -- back to waiting; it does not run with a dependency unmet.
      ('task','queued','blocked'),
      ('task','queued','leased'),
      ('task','queued','cancelled'),
      ('task','queued','superseded'),
      ('task','leased','running'),
      ('task','leased','queued'),
      ('task','leased','cancelled'),
      -- A prepared attempt held before submission remains unbought work.
      ('task','running','blocked'),
      ('task','running','completed'),
      ('task','running','failed_known'),
      ('task','running','outcome_unknown'),
      ('task','running','cancelled'),
      -- attempt
      ('attempt','prepared','submitted'),
      ('attempt','prepared','rejected_before_submission'),
      ('attempt','prepared','cancelled_before_submission'),
      ('attempt','submitted','response_received'),
      ('attempt','submitted','failed_known'),
      ('attempt','submitted','output_limited'),
      ('attempt','submitted','outcome_unknown'),
      ('attempt','response_received','parsed'),
      ('attempt','response_received','output_limited'),
      ('attempt','response_received','failed_known'),
      ('attempt','parsed','succeeded'),
      ('attempt','parsed','failed_known'),
      -- claim
      ('claim','proposed','corroborated'),
      ('claim','proposed','disputed'),
      ('claim','proposed','verified'),
      ('claim','proposed','accepted'),
      ('claim','proposed','rejected'),
      ('claim','proposed','unresolved'),
      ('claim','proposed','superseded'),
      ('claim','corroborated','disputed'),
      ('claim','corroborated','verified'),
      ('claim','corroborated','accepted'),
      ('claim','corroborated','rejected'),
      ('claim','corroborated','unresolved'),
      ('claim','corroborated','superseded'),
      ('claim','disputed','verified'),
      ('claim','disputed','accepted'),
      ('claim','disputed','rejected'),
      ('claim','disputed','unresolved'),
      ('claim','disputed','superseded'),
      ('claim','verified','accepted'),
      ('claim','verified','rejected'),
      ('claim','verified','disputed'),
      ('claim','verified','superseded'),
      ('claim','unresolved','disputed'),
      ('claim','unresolved','verified'),
      ('claim','unresolved','accepted'),
      ('claim','unresolved','rejected'),
      ('claim','unresolved','superseded'),
      -- an accepted or rejected claim is never edited back into another shape;
      -- the only way onward is supersession, which keeps both versions.
      ('claim','accepted','superseded'),
      ('claim','rejected','superseded'),
      -- disagreement
      ('disagreement','open','verifying'),
      ('disagreement','open','needs_human'),
      ('disagreement','open','resolved'),
      ('disagreement','open','superseded'),
      ('disagreement','verifying','resolved'),
      ('disagreement','verifying','needs_human'),
      ('disagreement','verifying','superseded'),
      ('disagreement','needs_human','resolved'),
      ('disagreement','needs_human','superseded'),
      ('disagreement','resolved','superseded'),
      -- segment
      ('segment','proposed','accepted'),
      ('segment','proposed','rejected'),
      ('segment','proposed','superseded'),
      ('segment','accepted','superseded'),
      ('segment','rejected','superseded'),
      -- decision
      ('decision','proposed','machine_decided'),
      ('decision','proposed','needs_human'),
      ('decision','proposed','superseded'),
      ('decision','needs_human','human_decided'),
      ('decision','needs_human','superseded'),
      ('decision','machine_decided','superseded'),
      ('decision','human_decided','superseded')
    ) as t(machine, from_state, to_state)
    where t.machine = p_machine and t.from_state = p_from and t.to_state = p_to
  );
$$;

create or replace function public.core_v2_guard_task() returns trigger
language plpgsql as $$
begin
  if new.state is distinct from old.state then
    -- A task that ended without a known outcome, or with a known failure, does
    -- not go back into the queue on its own. A person authorises it, and
    -- core_v2_authorize_task_retry is the only thing that can say so.
    if old.state in ('outcome_unknown','failed_known') and new.state = 'queued' then
      -- The marker says which door was used; the row says who walked through
      -- it. A worker runs as the service role, for which auth.uid() is null, so
      -- it cannot produce the second half however it sets the first.
      if coalesce(current_setting('core_v2.authorized_retry', true), '') <> old.id::text
         or new.retry_authorized_by is null
         or new.retry_authorized_by is distinct from auth.uid()
         or new.retry_authorized_at is not distinct from old.retry_authorized_at then
        raise exception 'core_v2: task % ended as % — a person must authorise running it again', old.id, old.state
          using errcode = 'check_violation';
      end if;
    elsif not public.core_v2_transition_allowed('task', old.state, new.state) then
      raise exception 'core_v2: a task cannot go from % to %', old.state, new.state
        using errcode = 'check_violation';
    end if;

    -- A lease that expires before anything was sent may return the task to the
    -- queue. A lease that expires after a request went out may not: the
    -- executor may have run, and requeueing would buy it again. Cancelling is
    -- the same problem wearing a friendlier word — unsent work stops, sent work
    -- is reconciled.
    if (old.state = 'leased' and new.state = 'queued')
       or (old.state = 'running' and new.state = 'blocked')
       or new.state = 'cancelled' then
      if public.core_v2_task_has_open_attempt(old) then
        raise exception 'core_v2: task % has an attempt that was already submitted — it is reconciled, not %',
          old.id, case when new.state = 'cancelled' then 'cancelled'
                       when new.state = 'blocked' then 'blocked' else 'requeued' end
          using errcode = 'check_violation';
      end if;
    end if;
  end if;
  new := public.core_v2_shape_task_lease(new);
  new.updated_at := now();
  return new;
end $$;

create or replace function public.core_v2_submit_attempt(p_attempt_id uuid, p_lease_token uuid)
returns public.agent_attempts language plpgsql security definer set search_path = public as $$
declare
  attempt public.agent_attempts;
  task public.workflow_tasks;
  wf public.intelligence_workflows;
  row public.agent_attempts;
begin
  select * into attempt from public.agent_attempts where id = p_attempt_id for update;
  if not found then
    raise exception 'core_v2: submission refused: no attempt %', p_attempt_id;
  end if;
  select * into task from public.workflow_tasks where id = attempt.task_id for update;
  select * into wf from public.intelligence_workflows where id = attempt.workflow_id for share;

  if not public.core_v2_workflow_active(wf.state) then
    raise exception 'core_v2: submission refused: workflow % is %', wf.id, wf.state;
  end if;
  if wf.cancel_requested_at is not null then
    raise exception 'core_v2: submission refused: cancellation of workflow % was requested', wf.id;
  end if;
  if exists (select 1 from public.disagreements d
              where d.workflow_id = wf.id and d.state = 'needs_human')
     or exists (select 1 from public.decisions d
                 where d.workflow_id = wf.id and d.status = 'needs_human') then
    raise exception 'core_v2: submission refused: human decision pending';
  end if;
  if task.state <> 'running' then
    raise exception 'core_v2: submission refused: task % is %, not running', task.id, task.state;
  end if;
  if p_lease_token is null or task.lease_token is distinct from p_lease_token then
    raise exception 'core_v2: submission refused: the lease token does not match task %', task.id;
  end if;
  if task.lease_expires_at is null or task.lease_expires_at <= now() then
    raise exception 'core_v2: submission refused: the lease on task % has expired', task.id;
  end if;
  if attempt.state <> 'prepared' then
    raise exception 'core_v2: submission refused: attempt % is %, not prepared', attempt.id, attempt.state;
  end if;

  -- Independence is decided here, not only by whoever routed the work. Two
  -- blind readings of one subject must run in two executor domains, and a
  -- router that has forgotten what already read this subject must not be able
  -- to buy the same domain twice. The advisory lock serialises the blind
  -- submissions of one subject so two of them cannot both pass this check.
  if task.independence_group is not null then
    perform pg_advisory_xact_lock(hashtextextended(task.workflow_id::text || '/' || task.subject_key, 0));
    if exists (
      select 1
        from public.agent_attempts a
        join public.workflow_tasks t on t.id = a.task_id
       where t.workflow_id = task.workflow_id
         and t.subject_key = task.subject_key
         and t.independence_group is not null
         and t.independence_group <> task.independence_group
         and a.independence_domain = attempt.independence_domain
         and public.core_v2_attempt_submitted(a.state)
    ) then
      raise exception 'core_v2: submission refused: independence: domain % already read % under another group',
        attempt.independence_domain, task.subject_key;
    end if;
  end if;

  -- Everything above has been proved; the marker says so to the row guard,
  -- which refuses this move to anybody who has not proved it.
  perform set_config('core_v2.submitting_attempt', p_attempt_id::text, true);
  update public.agent_attempts
     set state = 'submitted',
         submitted_at = now(),
         lease_token = p_lease_token
   where id = p_attempt_id
  returning * into row;
  perform set_config('core_v2.submitting_attempt', '', true);
  return row;
end $$;
