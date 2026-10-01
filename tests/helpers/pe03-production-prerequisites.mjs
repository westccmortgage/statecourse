import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
// Production migrations are applied unchanged. Only the external Supabase Auth
// schema is modeled: no real issuer, signature validation, MFA provider or user.
export async function pe03ProductionPrerequisites(db) {
  await db.exec(`do $$begin
    if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
    if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
    if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role bypassrls; end if;
    end$$;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as $$select null::uuid$$;
    create table auth.users(id uuid primary key,email_confirmed_at timestamptz,deleted_at timestamptz,banned_until timestamptz);
    create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz);
    create table auth.mfa_factors(id uuid primary key,user_id uuid,status text,factor_type text);`);
  const hashes={};
  for(const file of ['001_payments_enrollment.sql','002_regulatory_courses_reporting.sql','003_student_portal.sql','019_platform_admin_console.sql','028_staff_session_security.sql']) {
    const sql=await fs.readFile(new URL('../../database/'+file,import.meta.url),'utf8');
    hashes[file]=createHash('sha256').update(sql).digest('hex');await db.exec(sql);
  }
  // Hosted Supabase normally supplies default server grants. Make that fixture
  // prerequisite explicit; never grant anything to public browser roles here.
  await db.exec('grant usage on schema public to service_role; grant all on all tables in schema public to service_role; grant usage,select on all sequences in schema public to service_role;');
  const draft=await fs.readFile(new URL('../../database/drafts/pe03-cohort-evidence.sql',import.meta.url),'utf8');
  hashes['draft/pe03-cohort-evidence.sql']=createHash('sha256').update(draft).digest('hex');await db.exec(draft);
  return hashes;
}
