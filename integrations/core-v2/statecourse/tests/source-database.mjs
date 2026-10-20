import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from './core-database.mjs';
import {ACTOR,SESSION,ENROLLMENT,OTHER,IDENTITY} from './fixtures.mjs';
import {COURSE_ID} from '../contract.mjs';
export async function createSourceDatabase() {
 const db=new PGlite();
 try {
 // Real repository SQL, with only the external Supabase auth substrate modeled.
 // PGlite supplies gen_random_uuid; installing pgcrypto itself requires native Supabase/PG.
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
 create function auth.uid() returns uuid language sql as $$select null::uuid$$;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,deleted_at timestamptz,banned_until timestamptz);
 create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz);
 create table auth.mfa_factors(id uuid primary key,user_id uuid,status text,factor_type text);`);
 const dir=new URL('../../../../database/',import.meta.url);
 const files=(await readdir(dir)).filter(f=>/^\d{3}_.*\.sql$/.test(f) && f.slice(0,3)<='028' && !['020_rollback.sql','025_nmls_free_training.sql'].includes(f)).sort();
 // 025 provisions NMLS owner training and is not a California integration dependency.
 for(const file of files) await db.exec((await readFile(new URL(file,dir),'utf8')).replace('create extension if not exists pgcrypto;','-- gen_random_uuid provided by PGlite'));
 await db.query('insert into students(id,email) values($1,$2)',[ACTOR,'fixture@example.invalid']);
 await db.query(`insert into enrollments(id,student_id,course_id,state,status,course_version,enrollment_origin,checkout_attempt_id)
 values($1,$2,$3,'CA','active','1.0','training',null),($4,$2,'ca-real-estate-practice-45','CA','active','1.0','training',null)`,[ENROLLMENT,ACTOR,COURSE_ID,OTHER]);
 await db.query("insert into access_grants(enrollment_id,student_id,course_id,status) values($1,$2,$3,'active')",[ENROLLMENT,ACTOR,COURSE_ID]);
 await db.query('insert into auth.users(id,email_confirmed_at) values($1,now())',[ACTOR]);
 await db.query('insert into auth.sessions(id,user_id) values($1,$2)',[SESSION,ACTOR]);
 await db.query("insert into auth.mfa_factors(id,user_id,status,factor_type) values($1,$2,'verified','totp')",[OTHER,ACTOR]);
 await db.query("insert into staff_actor_binding_events(auth_user_id,actor_role,scope_state,binding_status,evidence,recorded_by) values($1,'administrator','CA','active','{\"fixture\":true}',$1)",[ACTOR]);
 await db.query('insert into statecourse_staff_private.proofs(proof_hash,user_id,session_id,factor_id,bindings) values($1,$2,$3,$4,statecourse_staff_private.bindings_for($2))',[IDENTITY.proofHash,ACTOR,SESSION,OTHER]);

 return db;
 }catch(error){await db.close();throw error;}
}
