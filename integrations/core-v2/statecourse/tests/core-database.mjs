import {readFile,readdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.STATECOURSE_TEST_PGLITE;
if(!modulePath)throw new Error('STATECOURSE_TEST_PGLITE required; no storage test is skipped.');
export const {PGlite}=await import(pathToFileURL(modulePath));
export const migration=new URL('../../storage/supabase/migrations/20261020021909_statecourse_readonly_results.sql',import.meta.url);
export async function installResultStore(db) {await db.exec(await readFile(migration,'utf8'));}
export async function installCore(db) {
 // Same external Supabase substrate as the original native harness. pgcrypto's
 // text SHA-256 alone is modeled with PG's built-in SHA-256; no encryption is exercised.
 await db.exec(`create role anon;create role authenticated;create role service_role;
 create schema auth;create schema storage;create schema extensions;
 create table auth.users(id uuid primary key default gen_random_uuid(),email text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
 create function auth.role() returns text language sql stable as $$select coalesce(nullif(current_setting('test.role',true),''),'authenticated')$$;
 create table storage.buckets(id text primary key,name text,public boolean default false,file_size_limit bigint,allowed_mime_types text[],owner uuid);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,owner uuid);
 alter table storage.objects enable row level security;
 create function storage.foldername(name text) returns text[] language sql immutable as $$select string_to_array(name,'/')$$;
 create function public.digest(value text,algorithm text) returns bytea language sql immutable as $$select sha256(convert_to(value,'UTF8'))$$;`);
 const dir=new URL('../../upstream/supabase/migrations/',import.meta.url);
 for(const file of (await readdir(dir)).filter(f=>f.endsWith('.sql')).sort()) await db.exec((await readFile(new URL(file,dir),'utf8')).replace('create extension if not exists pgcrypto;','-- PGlite substrate'));
}
export const connect=db=>async()=>({query:(sql,args)=>db.query(sql,args),release:async()=>{}});
