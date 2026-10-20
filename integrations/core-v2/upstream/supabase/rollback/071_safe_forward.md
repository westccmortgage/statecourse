# Recovery for migration 071

Migration 071 protects five incident and completion tables against `DELETE`
and `TRUNCATE`. Its ten triggers are the data protection rule; its `REVOKE`s
also keep the service role's permissions narrow. Do not remove the triggers or
restore broad grants on production as a rollback. That would make an existing
proof erasable, including proofs written after 071.

If a deployment of 071 fails before its transaction commits, inspect the error,
correct the cause, and retry the same migration through the normal migration
path. If a later grant or manual schema change has removed some protections,
replay the SQL in `supabase/migrations/071_a_proof_that_cannot_be_deleted.sql`
in one transaction, without changing the migration ledger. It uses `REVOKE`,
`GRANT`, `CREATE OR REPLACE FUNCTION` and `DROP TRIGGER IF EXISTS` followed by
`CREATE TRIGGER`, so a replay restores all five privilege sets and all ten
triggers without deleting incident or completion rows. Confirm the migration's
own postcondition block succeeds, then check the five row counts and the
presence of the ten triggers. If a subsequent migration has changed any of
these tables or the function, review that later migration before replaying 071.

`supabase/tests/071_safe_forward.sql` proves this on a disposable database:
it inserts an incident, grants excessive privileges, removes all ten guards,
replays the committed 071 SQL, checks privileges and guards, attempts deletion
and truncation, checks the recorded rows, then rolls the whole exercise back.
`bash supabase/tests/run.sh` runs this after all migrations and before the
normal invariants. It cannot reach production or a provider.
