-- Exercise the database write boundary, including the nullable-verifier case.
-- This is synthetic local evidence only; every fixture is rolled back.
begin;
insert into public.organizations(id,name)
values ('73000000-0000-0000-0000-000000000001','Completion evidence fixture');

do $$
declare
  bad jsonb;
  good jsonb := '[{"name":"QA","required":true,"passed":true,"evidence":"independently checked"}]';
  denied boolean;
  n integer := 0;
begin
  if not public.core_v2_gates_all_passed(good) then
    raise exception 'a measured acceptance contract was refused';
  end if;
  if not public.core_v2_gates_all_passed(good ||
      '[{"name":"optional","required":false,"passed":false,"evidence":null}]'::jsonb) then
    raise exception 'an optional failed gate incorrectly blocked delivery';
  end if;
  foreach bad in array array[
    null::jsonb, 'null', '{}', '[]', '[null]', '[{}]',
    '[{"name":"QA","required":false,"passed":true,"evidence":"checked"}]',
    '[{"name":"QA","required":true,"passed":true,"evidence":"   "}]',
    '[{"name":"QA","required":true,"passed":true,"evidence":"\t\n"}]',
    '[{"name":"QA","required":true,"passed":true,"evidence":null}]',
    '[{"name":"QA","required":true,"passed":true}]',
    '[{"name":"QA","required":true,"evidence":"checked"}]',
    '[{"name":"QA","required":true,"passed":"true","evidence":"checked"}]',
    '[{"name":"QA","required":"true","passed":true,"evidence":"checked"}]',
    '[{"name":"QA","passed":true,"evidence":"checked"}]',
    '[{"name":" ","required":true,"passed":true,"evidence":"checked"}]',
    '[{"name":"QA","required":true,"passed":false,"evidence":"defect"}]',
    '[{"name":"QA","required":true,"passed":null,"evidence":"checked"}]',
    good || good
  ] loop
    n := n + 1;
    if public.core_v2_gates_all_passed(bad) is distinct from false then
      raise exception 'malformed or incomplete gate case % was accepted: %', n, bad;
    end if;
  end loop;
  raise notice 'PASS  % incomplete gate contracts refused', n;

  -- The old CHECK evaluated to NULL here and Postgres accepted the row.
  denied := false;
  begin
    insert into public.core_v2_task_completions(
      organization_id,application,task_key,outcome_required,state,
      artifact_exists,artifact_digest,decision_bound_digest,read_back_succeeded,
      verified_by,acceptance_gates,delivered_at,policy_version,engine_version)
    values ('73000000-0000-0000-0000-000000000001','fixture','no-verifier','finished product',
      'DELIVERED',true,repeat('a',64),repeat('a',64),true,null,good,now(),'fixture','fixture');
  exception when check_violation then denied := true;
  end;
  if not denied then raise exception 'DELIVERED without a verifier reached storage'; end if;
  raise notice 'PASS  nullable verifier cannot bypass the DELIVERED constraint';

  denied := false;
  begin
    insert into public.core_v2_task_completions(
      organization_id,application,task_key,outcome_required,state,
      artifact_exists,artifact_digest,decision_bound_digest,read_back_succeeded,
      verified_by,acceptance_gates,delivered_at,policy_version,engine_version)
    values ('73000000-0000-0000-0000-000000000001','fixture','no-gates','finished product',
      'DELIVERED',true,repeat('a',64),repeat('a',64),true,'independent_verifier','[]',now(),'fixture','fixture');
  exception when check_violation then denied := true;
  end;
  if not denied then raise exception 'DELIVERED without acceptance criteria reached storage'; end if;
  raise notice 'PASS  empty acceptance contract cannot reach storage as DELIVERED';

  insert into public.core_v2_task_completions(
    organization_id,application,task_key,outcome_required,state,
    artifact_exists,artifact_digest,decision_bound_digest,read_back_succeeded,
    verified_by,acceptance_gates,delivered_at,policy_version,engine_version)
  values ('73000000-0000-0000-0000-000000000001','fixture','good','finished product',
    'DELIVERED',true,repeat('a',64),repeat('a',64),true,'independent_verifier',good,now(),'fixture','fixture');
  raise notice 'PASS  complete independent proof still reaches DELIVERED';
end $$;
rollback;
