-- The recent-outcome reader is tenant-scoped and bounded to 200 attempts.
-- Existing evidence/assessment/completion joins already have matching indexes.
create index if not exists agent_attempts_routing_history
  on public.agent_attempts(organization_id,created_at desc,id desc)
  where executor_kind='model';
