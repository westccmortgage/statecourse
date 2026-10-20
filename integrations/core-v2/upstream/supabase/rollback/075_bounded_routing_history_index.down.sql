-- Index-only rollback preserves every workflow, decision and cost record.
drop index if exists public.agent_attempts_routing_history;
