#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
PSQL_BIN="${PSQL_BIN:-$PGBIN/psql}"
WORK="${WORK:-$(mktemp -d "${TMPDIR:-/tmp}/core-v2-voice-pg.XXXXXX")}"
PORT="${PORT:-55437}"
SOCKET_LINK="${TMP_SOCKET_LINK:-/tmp/core-v2-voice-pg-${PORT}-$$}"

[ -x "$PGBIN/initdb" ] || { echo "PostgreSQL 16 not found at $PGBIN. Set PGBIN."; exit 1; }

cleanup() {
  "$PGBIN/pg_ctl" -D "$WORK/data" stop -m immediate >/dev/null 2>&1 || true
  rm -f "$SOCKET_LINK"
}
trap cleanup EXIT

"$PGBIN/initdb" -D "$WORK/data" -U voice_admin --auth=trust >/dev/null
ln -s "$WORK" "$SOCKET_LINK"
"$PGBIN/pg_ctl" -D "$WORK/data" \
  -o "-k '$SOCKET_LINK' -p $PORT -c listen_addresses=" -l "$WORK/postgres.log" start >/dev/null

admin_psql() {
  "$PSQL_BIN" -X -h "$SOCKET_LINK" -p "$PORT" -U voice_admin -d postgres -v ON_ERROR_STOP=1 "$@"
}
migrator_psql() {
  "$PSQL_BIN" -X -h "$SOCKET_LINK" -p "$PORT" -U voice_migrator -d postgres -v ON_ERROR_STOP=1 "$@"
}

# Supabase runs migrations with a managed principal that can create ordinary
# roles and schema objects but is not a superuser. Reproduce that boundary so
# privileged ALTER ROLE clauses fail locally just as they do when linked.
admin_psql -q <<'SQL'
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create role voice_migrator login createrole nosuperuser nocreatedb noreplication nobypassrls;
grant create on database postgres to voice_migrator;
SQL

migrator_psql -f "$ROOT/supabase/migrations/20261002215547_core_v2_voice_durable_runtime.sql"
# The migration must be a safe replay: it verifies an existing role rather
# than requiring privileged role mutation or widening its capabilities.
migrator_psql -f "$ROOT/supabase/migrations/20261002215547_core_v2_voice_durable_runtime.sql"
admin_psql -q <<'SQL'
create role voice_runtime_login login inherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
grant core_v2_voice_runtime to voice_runtime_login;
SQL
runtime_authorized="$($PSQL_BIN -X -h "$SOCKET_LINK" -p "$PORT" -U voice_runtime_login -d postgres -Atqc \
  "select coalesce((select rolcanlogin and not rolsuper and not rolcreatedb
    and not rolcreaterole and not rolreplication and not rolbypassrls
    and pg_has_role(current_user, 'core_v2_voice_runtime', 'member')
    and (select count(*) = 1 and bool_and(granted.rolname = 'core_v2_voice_runtime')
      from pg_auth_members membership join pg_roles granted on granted.oid = membership.roleid
      where membership.member = login.oid)
    from pg_roles login where login.rolname = current_user), false)")"
[ "$runtime_authorized" = "t" ] || { echo "restricted runtime login failed capability/membership check"; exit 1; }
migrator_psql -f "$ROOT/workers/core-v2-voice/tests/postgres-migration.integration.sql"
