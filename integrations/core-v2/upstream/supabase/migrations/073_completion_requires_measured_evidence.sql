-- A DELIVERED result needs an explicit, measured acceptance contract. Empty
-- gates and malformed JSON cannot act as proof. The kernel enforces the same
-- rule before storage; this guard also protects direct service-role writes.
-- Generated with `supabase migration new`, numbered to match this repository.

alter table public.core_v2_task_completions
  drop constraint core_v2_task_completions_delivered_carries_its_proof;

create or replace function public.core_v2_gates_all_passed(p_gates jsonb)
returns boolean language plpgsql immutable as $$
declare
  gate jsonb;
  gate_name text;
  names text[] := '{}';
  has_required boolean := false;
begin
  if jsonb_typeof(p_gates) is distinct from 'array' then return false; end if;
  for gate in select value from jsonb_array_elements(p_gates) loop
    if jsonb_typeof(gate) is distinct from 'object'
       or jsonb_typeof(gate -> 'name') is distinct from 'string'
       or jsonb_typeof(gate -> 'required') is distinct from 'boolean'
       or coalesce(jsonb_typeof(gate -> 'passed'), 'missing') not in ('boolean','null')
       or coalesce(jsonb_typeof(gate -> 'evidence'), 'missing') not in ('string','null') then
      return false;
    end if;
    gate_name := regexp_replace(gate ->> 'name', '^[[:space:]]+|[[:space:]]+$', '', 'g');
    if gate_name = '' or gate_name = any(names) then return false; end if;
    names := array_append(names, gate_name);
    if gate -> 'required' = 'true'::jsonb then
      has_required := true;
      if gate -> 'passed' is distinct from 'true'::jsonb
         or jsonb_typeof(gate -> 'evidence') is distinct from 'string'
         or (gate ->> 'evidence' ~ '[^[:space:]]') is not true then
        return false;
      end if;
    end if;
  end loop;
  return has_required;
end $$;

comment on function public.core_v2_gates_all_passed(jsonb) is
  'An explicit acceptance contract with at least one required gate, unique names, boolean verdicts and nonblank evidence for every required pass.';

-- CHECK accepts SQL NULL. Make the entire proof positively true, so a missing
-- verifier cannot slip through a nullable equality. Re-adding the constraint
-- validates existing rows; an incompatible row blocks migration for review.
alter table public.core_v2_task_completions
  add constraint core_v2_task_completions_delivered_carries_its_proof check (
    state <> 'DELIVERED' or (
      outcome_required ~ '[^[:space:]]'
      and artifact_exists
      and artifact_digest is not null
      and decision_bound_digest is not null
      and decision_bound_digest = artifact_digest
      and read_back_succeeded
      and verified_by = 'independent_verifier'
      and cardinality(unmet) = 0
      and public.core_v2_gates_all_passed(acceptance_gates)
    ) is true
  );
