import fs from 'node:fs';
import { nmlsTrainingDefinition } from '../config/nmls-training-definition.mjs';
import { NMLS_TRAINING_COURSE as identity } from '../config/nmls-course-identity.mjs';
const d=nmlsTrainingDefinition();
const literal=v=>"'"+String(v).replaceAll("'","''")+"'";
const body=fs.readFileSync(new URL('../database/templates/nmls-free-training-runtime.sql',import.meta.url),'utf8');
const sql=`-- Generated from the real comprehensive v3 curriculum; never edit the source pins.
-- Forward migration on main024. Archived private CE migrations are NOT prerequisites.
-- Must be applied once in the existing StateCourse database after schema verification.
begin;
do $preflight$ begin
 if to_regclass('public.current_offering_governance') is null or to_regclass('public.admin_console_actions') is null
 or to_regprocedure('public.initialize_training_runtime(uuid,uuid)') is null then
 raise exception 'Verify existing main migrations 020 through 024 before NMLS025';end if;
 if exists(select 1 from courses where id=${literal(identity.id)}) then
 raise exception 'NMLS identity already exists: inspect before applying; never overwrite a live definition';end if;
end $preflight$;
insert into courses(id,state,name,product_type,approval_status,enrollment_enabled,current_version,course_route)
 values(${literal(identity.id)},'US',${literal(identity.title)},'mortgage_continuing_education','submission_draft',false,'2026.3','/mortgage/');
insert into regulatory_course_versions(course_id,version,lifecycle_status,required_hours,enrollment_enabled,regulatory_credit_enabled,configuration)
 values(${literal(identity.id)},'2026.3','development',8,false,false,
 '{"discipline":"mortgage","mode":"free_training","hours_status":"provisional_design_only","provider_id":null,"nmls_course_id":null}'::jsonb);
create table nmls_training_definitions(
 course_id text not null references courses(id),course_version text not null,
 content_digest text not null check(content_digest ~ '^[a-f0-9]{64}$'),
 definition_digest text not null check(definition_digest ~ '^[a-f0-9]{64}$'),
 manifest jsonb not null check(manifest->>'purpose'='free_training' and manifest->>'discipline'='mortgage'),
 primary key(course_id,course_version));
insert into nmls_training_definitions(course_id,course_version,content_digest,definition_digest,manifest)
 values(${literal(d.course_id)},${literal(d.course_version)},${literal(d.content_digest)},${literal(d.definition_digest)},${literal(JSON.stringify(d.manifest))}::jsonb);
create trigger nmls_training_definition_immutable before update or delete on nmls_training_definitions
 for each row execute function admin_console_refuse_record_mutation();
-- This records only the owner's requested free-training opening, no approval or charge.
do $training_authority$ declare actor uuid; begin
 -- The current view resolves the latest event per actor/role/scope BEFORE the
 -- active filter. An older grant must never defeat a later revocation.
 select u.id into actor from auth.users u join current_staff_actor_bindings b on b.auth_user_id=u.id
 where lower(u.email)='akanevsky1967@gmail.com' and b.actor_role='owner' and b.scope_state is null and b.binding_status='active'
 and (b.effective_at is null or b.effective_at<=now()) and (b.expires_at is null or b.expires_at>now())
 order by b.recorded_at desc limit 1;
 if actor is null then raise exception 'Active verified owner binding required to open training';end if;
 insert into offering_governance_events(site,state,discipline,offering_kind,offering_id,approval_status,training_access_enabled,payment_mode,recorded_by,recorded_role,note)
 values('statecourse.com','US','mortgage','course',${literal(identity.id)},'none',true,'disabled',actor,'owner',
 'Owner work order 2026-09-13: open real national mortgage content as free training only; no approval, NMLS credit, certificate, reporting or live charges.');
end $training_authority$;
`+body;
const file=new URL('../database/025_nmls_free_training.sql',import.meta.url);
if(process.argv.includes('--check')) {
 if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==sql)throw new Error('nmls_migration_out_of_date');
}else fs.writeFileSync(file,sql);
console.log('NMLS025 generated/verified from pinned real curriculum. No database contacted.');
