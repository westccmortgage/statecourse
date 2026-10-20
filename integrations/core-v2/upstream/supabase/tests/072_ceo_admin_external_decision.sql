-- No provider, no network: exercise the signed Admin door's database boundary
-- with an owner who exists in Admin, not in this project's auth.users.
begin;

insert into auth.users(id,email) values
 ('72000000-0000-0000-0000-000000000001','submitter@example.invalid');
insert into public.organizations(id,name) values
 ('72000000-0000-0000-0000-000000000002','External decision fixture');
insert into public.organization_members(organization_id,user_id,role) values
 ('72000000-0000-0000-0000-000000000002',
  '72000000-0000-0000-0000-000000000001','admin');
insert into public.ceo_admin_tenants(admin_owner_user_id,organization_id,submitter_user_id)
values ('72000000-0000-0000-0000-000000000003',
        '72000000-0000-0000-0000-000000000002',
        '72000000-0000-0000-0000-000000000001');
insert into public.intelligence_workflows(
  id, organization_id, domain_pack, domain_pack_version, workflow_type,
  engine_version, source_set_fingerprint, request_fingerprint, requested_by)
values ('72000000-0000-0000-0000-000000000004',
        '72000000-0000-0000-0000-000000000002',
        'ceo_admin','1','external_review','core-v2/2.0',
        'source-fixture-072','request-fixture-072',
        '72000000-0000-0000-0000-000000000001');
insert into public.evidence_claims(id,organization_id,workflow_id,subject_type,
  subject_key,predicate,value,observation_basis) values
 ('72000000-0000-0000-0000-000000000005',
  '72000000-0000-0000-0000-000000000002',
  '72000000-0000-0000-0000-000000000004',
  'row','subject-072','classification','"important"'::jsonb,'observed'),
 ('72000000-0000-0000-0000-000000000006',
  '72000000-0000-0000-0000-000000000002',
  '72000000-0000-0000-0000-000000000004',
  'row','subject-072','classification','"noise"'::jsonb,'observed');
insert into public.disagreements(id,organization_id,workflow_id,disagreement_key,kind,state)
values ('72000000-0000-0000-0000-000000000007',
        '72000000-0000-0000-0000-000000000002',
        '72000000-0000-0000-0000-000000000004',
        'subject-072/classification','value','needs_human');
insert into public.disagreement_claims(organization_id,disagreement_id,claim_id,position)
values ('72000000-0000-0000-0000-000000000002',
        '72000000-0000-0000-0000-000000000007',
        '72000000-0000-0000-0000-000000000005',1),
       ('72000000-0000-0000-0000-000000000002',
        '72000000-0000-0000-0000-000000000007',
        '72000000-0000-0000-0000-000000000006',2);
insert into public.decisions(id,organization_id,workflow_id,disagreement_id,
  decision_type,title,authority,status)
values ('72000000-0000-0000-0000-000000000008',
        '72000000-0000-0000-0000-000000000002',
        '72000000-0000-0000-0000-000000000004',
        '72000000-0000-0000-0000-000000000007',
        'hold','Awaiting owner','adjudicator','needs_human');
insert into public.workflow_tasks(id,organization_id,workflow_id,phase,task_type,
  role_key,role_version,subject_key,input_fingerprint,contract_version,state)
values ('72000000-0000-0000-0000-00000000000a',
        '72000000-0000-0000-0000-000000000002',
        '72000000-0000-0000-0000-000000000004',
        'analyze','fixture','reader','1','subject-072','input-072','1','queued');
insert into public.workflow_cost_budgets(workflow_id,organization_id,
  authorized_maximum,maximum_per_attempt)
values ('72000000-0000-0000-0000-000000000004',
        '72000000-0000-0000-0000-000000000002',1.0,0.1);
select public.core_v2_schedule_continuation(
  '72000000-0000-0000-0000-000000000004');
select public.core_v2_workflow_transition('72000000-0000-0000-0000-000000000004','queued');
select public.core_v2_workflow_transition('72000000-0000-0000-0000-000000000004','planning');
select public.core_v2_workflow_transition('72000000-0000-0000-0000-000000000004','running');
select public.core_v2_stop_workflow_and_settle(
  '72000000-0000-0000-0000-000000000004','handed_to_a_person');

do $$
declare resolved public.decisions; replayed public.decisions; leased public.workflow_tasks;
  refused boolean; refusal_message text;
begin
  if exists (select 1 from auth.users where id='72000000-0000-0000-0000-000000000003') then
    raise exception 'the external owner was incorrectly made an engine user';
  end if;
  if has_function_privilege('authenticated',
      'public.core_v2_resolve_ceo_admin_disagreement(uuid,uuid,uuid,text,text,uuid,jsonb,text,text,uuid[])',
      'EXECUTE') then
    raise exception 'a browser may call the signed Admin resolution function';
  end if;
  if has_function_privilege('authenticated',
      'public.core_v2_resolve_disagreement_record(uuid,uuid,uuid,text,text,uuid,jsonb,text,text,uuid[])',
      'EXECUTE') or has_function_privilege('service_role',
      'public.core_v2_resolve_disagreement_record(uuid,uuid,uuid,text,text,uuid,jsonb,text,text,uuid[])',
      'EXECUTE') then
    raise exception 'the shared mutating resolver bypasses an authorization gate';
  end if;
  leased := public.core_v2_lease_task('72000000-0000-0000-0000-00000000000a',
    'human-hold-fixture', 30000);
  if leased.id is not null then
    raise exception 'a task was leased while a person held the workflow';
  end if;
  if (select state from public.workflow_continuations where workflow_id =
       '72000000-0000-0000-0000-000000000004') <> 'settled'
     or (select state from public.intelligence_workflows where id =
       '72000000-0000-0000-0000-000000000004') <> 'needs_attention' then
    raise exception 'the unanswered dispute should settle continuation and hold workflow';
  end if;
  refused := false;
  begin
    perform public.core_v2_resolve_ceo_admin_disagreement(
      '72000000-0000-0000-0000-000000000001',
      '72000000-0000-0000-0000-000000000009',
      '72000000-0000-0000-0000-000000000007',
      'accept_claim','source checked','72000000-0000-0000-0000-000000000005');
  exception when others then
    get stacked diagnostics refusal_message = message_text;
    if position('not authorised' in refusal_message) = 0 then raise; end if;
    refused := true;
  end;
  if not refused then raise exception 'wrong external owner accepted'; end if;
  -- A signed door carries the configured submitter and Admin owner. Their
  -- enabled mapping is the authority, even without engine auth.uid().
  resolved := public.core_v2_resolve_ceo_admin_disagreement(
    '72000000-0000-0000-0000-000000000001',
    '72000000-0000-0000-0000-000000000003',
    '72000000-0000-0000-0000-000000000007',
    'accept_claim','source checked','72000000-0000-0000-0000-000000000005');
  if resolved.status <> 'human_decided'
     or resolved.decided_by_user_id is not null
     or resolved.decided_by_external_owner_id is distinct from
        '72000000-0000-0000-0000-000000000003' then
    raise exception 'external owner was not recorded as the real actor';
  end if;
  if (select state from public.workflow_continuations where workflow_id =
       '72000000-0000-0000-0000-000000000004') <> 'due'
     or (select state from public.intelligence_workflows where id =
       '72000000-0000-0000-0000-000000000004') <> 'running' then
    raise exception 'a resolved human hold did not wake the same authorized workflow';
  end if;
  leased := public.core_v2_lease_task('72000000-0000-0000-0000-00000000000a',
    'human-hold-fixture', 30000);
  if leased.id is distinct from '72000000-0000-0000-0000-00000000000a'
     or leased.state <> 'leased' then
    raise exception 'a resolved human hold did not unlock a queued task';
  end if;
  -- The owner may have resolved the hold while a runner was still winding
  -- down. Its stale stop must not settle the continuation for good.
  perform public.core_v2_task_transition(
    '72000000-0000-0000-0000-00000000000a','queued',null,'leased');
  perform public.core_v2_stop_workflow_and_settle(
    '72000000-0000-0000-0000-000000000004','handed_to_a_person');
  if (select state from public.workflow_continuations where workflow_id =
       '72000000-0000-0000-0000-000000000004') <> 'due'
     or (select state from public.intelligence_workflows where id =
       '72000000-0000-0000-0000-000000000004') <> 'running' then
    raise exception 'a stale runner stop stranded an already resolved human hold';
  end if;
  -- A second hold can arrive after a lease but before the paid submission.
  -- The attempt is never sent, and the task remains available after review.
  leased := public.core_v2_lease_task('72000000-0000-0000-0000-00000000000a',
    'human-hold-fixture', 30000);
  perform public.core_v2_task_transition(
    '72000000-0000-0000-0000-00000000000a','running',null,'leased');
  insert into public.agent_attempts(id,organization_id,workflow_id,task_id,
    attempt_no,role_key,role_version,executor_kind,executor_family,
    independence_domain,packet_fingerprint,lease_token)
  values ('72000000-0000-0000-0000-00000000000c',
          '72000000-0000-0000-0000-000000000002',
          '72000000-0000-0000-0000-000000000004',
          '72000000-0000-0000-0000-00000000000a',
          1,'reader','1','model','fixture-family','fixture-domain',
          'fixture-packet-072',leased.lease_token);
  insert into public.disagreements(id,organization_id,workflow_id,
    disagreement_key,kind,state)
  values ('72000000-0000-0000-0000-00000000000b',
          '72000000-0000-0000-0000-000000000002',
          '72000000-0000-0000-0000-000000000004',
          'second-hold','value','needs_human');
  refused := false;
  begin
    perform public.core_v2_submit_attempt(
      '72000000-0000-0000-0000-00000000000c',leased.lease_token);
  exception when others then
    get stacked diagnostics refusal_message = message_text;
    if position('human decision pending' in refusal_message) = 0 then raise; end if;
    refused := true;
  end;
  if not refused then raise exception 'a previously leased task was submitted after the hold'; end if;
  perform public.core_v2_attempt_transition(
    '72000000-0000-0000-0000-00000000000c','cancelled_before_submission',
    'human decision pending');
  perform public.core_v2_task_transition(
    '72000000-0000-0000-0000-00000000000a','blocked','human decision pending','running');
  if (select state from public.workflow_tasks where id =
       '72000000-0000-0000-0000-00000000000a') <> 'blocked'
     or (select state from public.agent_attempts where id =
       '72000000-0000-0000-0000-00000000000c') <> 'cancelled_before_submission' then
    raise exception 'a task was lost rather than held after a refused submission';
  end if;
  replayed := public.core_v2_resolve_ceo_admin_disagreement(
    '72000000-0000-0000-0000-000000000001',
    '72000000-0000-0000-0000-000000000003',
    '72000000-0000-0000-0000-000000000007',
    'accept_claim','source checked','72000000-0000-0000-0000-000000000005');
  if replayed.id is distinct from resolved.id then
    raise exception 'identical replay created another decision';
  end if;
  if (select count(*) from public.decisions where disagreement_id =
       '72000000-0000-0000-0000-000000000007') <> 2
     or (select status from public.decisions where id =
       '72000000-0000-0000-0000-000000000008') <> 'superseded'
     or (select state from public.disagreements where id =
       '72000000-0000-0000-0000-000000000007') <> 'resolved' then
    raise exception 'the conflict or its former unanswered proposal did not close';
  end if;
  refused := false;
  begin
    perform public.core_v2_resolve_ceo_admin_disagreement(
      '72000000-0000-0000-0000-000000000001',
      '72000000-0000-0000-0000-000000000003',
      '72000000-0000-0000-0000-000000000007',
      'reject_all','different decision',null,null,null,null,
      array['72000000-0000-0000-0000-000000000005'::uuid]);
  exception when others then
    get stacked diagnostics refusal_message = message_text;
    if position('not open' in refusal_message) = 0 then raise; end if;
    refused := true;
  end;
  if not refused then raise exception 'different replay rewrote a resolved conflict'; end if;
end $$;

rollback;
select 'PASS  CEO Admin external owner resolution and idempotent replay' as result;
