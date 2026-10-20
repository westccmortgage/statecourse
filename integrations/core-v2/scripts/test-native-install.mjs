// Disposable LOCAL cluster only; never accepts a hosted connection string.
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm,chmod} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:net';
import pg from '../server/node_modules/pg/lib/index.js';
import {verifiedInstallation} from '../installation/package.mjs';
import {PostgresResultStore} from '../statecourse/store.mjs';
import {explainSnapshot} from '../statecourse/engine.mjs';
import {snapshot,ACTOR,OTHER,ORGANIZATION} from '../statecourse/tests/fixtures.mjs';
import {executors} from '../statecourse/tests/executors.mjs';

const bin=process.argv[2];if(!bin)throw new Error('Pass an absolute directory containing native initdb, pg_ctl and postgres; no hosted URL is supported.');
const dir=await mkdtemp(join(tmpdir(),'statecourse-core-native-')),data=join(dir,'data');
let started=false,client;
function command(file,args) {const result=spawnSync(file,args,{encoding:'utf8',timeout:30000});if(result.status!==0)throw new Error(`${file.split('/').at(-1)} failed: ${result.stderr||result.error||result.stdout}`);return result.stdout;}
const listener=createServer();await new Promise(resolve=>listener.listen(0,'127.0.0.1',resolve));const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
const ctl=(...args)=>command(join(bin,'pg_ctl'),['-D',data,...args]);
async function open() {const c=new pg.Client({host:'127.0.0.1',port,database:'postgres',user:'core_native_fixture',password:'local-fixture-only',ssl:{rejectUnauthorized:true,ca:await readFile(join(dir,'cert.pem'),'utf8')},connectionTimeoutMillis:5000});await c.connect();assert.equal((await c.query('select ssl from pg_stat_ssl where pid=pg_backend_pid()')).rows[0].ssl,true);return c;}
try {
 await writeFile(join(dir,'password'),'local-fixture-only\n',{mode:0o600});
 command(join(bin,'initdb'),['-D',data,'--username=core_native_fixture','--pwfile='+join(dir,'password'),'--auth-local=trust','--auth-host=scram-sha-256','--no-locale','--encoding=UTF8']);
 await writeFile(join(dir,'openssl.cnf'),'[req]\ndistinguished_name=dn\nx509_extensions=ext\nprompt=no\n[dn]\nCN=127.0.0.1\n[ext]\nsubjectAltName=IP:127.0.0.1\n');
 command('openssl',['req','-new','-x509','-nodes','-newkey','rsa:2048','-days','1','-keyout',join(dir,'key.pem'),'-out',join(dir,'cert.pem'),'-config',join(dir,'openssl.cnf')]);
 await chmod(join(dir,'key.pem'),0o600);
 // The disposable TLS key is owner-only regardless of the host OpenSSL defaults.
 const options=`-h 127.0.0.1 -p ${port} -k ${dir} -c ssl=on -c ssl_cert_file=${join(dir,'cert.pem')} -c ssl_key_file=${join(dir,'key.pem')}`;
 ctl('-l',join(dir,'postgres.log'),'-o',options,'-w','start');started=true;client=await open();
 const version=(await client.query('show server_version')).rows[0].server_version;
 // Only Supabase platform substrate is modeled. pgcrypto and PostgreSQL itself are native.
 await client.query(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create schema storage;create schema extensions;
 create extension pgcrypto with schema extensions;
 create table auth.users(id uuid primary key default gen_random_uuid(),email text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.role() returns text language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claim.role',true),''),'authenticated')$$;
 create table storage.buckets(id text primary key,name text,public boolean default false,file_size_limit bigint,allowed_mime_types text[],owner uuid);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,owner uuid);
 alter table storage.objects enable row level security;
 create function storage.foldername(name text) returns text[] language sql immutable as $$select string_to_array(name,'/')$$;
 alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
 alter default privileges in schema public grant all on sequences to anon,authenticated,service_role;
 alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;`);
 const {sql,manifest}=await verifiedInstallation();
 await client.query('create table public.enrollments(id uuid)');
 await assert.rejects(()=>client.query(sql),/statecourse_source_database_refused/);await client.query('ROLLBACK');
 assert.equal((await client.query("select to_regclass('public.intelligence_workflows') is null as absent")).rows[0].absent,true);
 await client.query('drop table public.enrollments'); // only this disposable fixture
 await assert.rejects(()=>client.query(sql.replace('\nCOMMIT;','\nSELECT 1/0;\nCOMMIT;')),/division by zero/);await client.query('ROLLBACK');
 assert.equal((await client.query("select count(*)::int n from information_schema.tables where table_schema in ('public','core_readonly') and table_type='BASE TABLE'")).rows[0].n,0,'failed package rolls back every application object');
 assert.equal((await client.query("select exists(select 1 from pg_roles where rolname='statecourse_core_store') as present")).rows[0].present,false);
 await client.query(sql);
 await assert.rejects(()=>client.query(sql),/initial_core_install_requires_empty_application_schema/);await client.query('ROLLBACK');
 const exposedWithoutRls=(await client.query("select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity and has_table_privilege('anon',c.oid,'SELECT') order by c.relname")).rows.map(r=>r.relname);
 assert.deepEqual(exposedWithoutRls,[],'public tables readable by anon must have RLS');
 const privateTables=(await client.query("select count(*)::int n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='core_readonly' and c.relkind='r' and c.relrowsecurity and c.relforcerowsecurity")).rows[0].n;
 assert.equal(privateTables,3);
 for(const role of ['anon','authenticated','service_role'])assert.equal((await client.query("select has_schema_privilege($1,'core_readonly','USAGE') as allowed",[role])).rows[0].allowed,false);
 assert.equal((await client.query("select count(*)::int n from public.core_v2_runner_settings")).rows[0].n,0,'no watchdog settings seeded');
 assert.deepEqual((await client.query('select public.core_v2_tick_due_continuations(1) as result')).rows[0].result,{armed:false,due:0,posted:0,note:'the watchdog is not armed; nothing was posted'});
 const context={organizationId:ORGANIZATION,actorId:ACTOR},issue=snapshot(t=>{t.access_grants=[];});
 const connect=async()=>({query:(s,p)=>client.query(s,p),release:async()=>{}});
 let store=new PostgresResultStore({connect,expectedDatabaseName:'postgres'});
 const {run}=await store.reserve({...context,idempotencyKey:OTHER,scope:issue.scope}),ctx={...context,runId:run.id};
 await store.capture(ctx,issue);await store.start(ctx);
 const result=await explainSnapshot(issue,{organizationId:ORGANIZATION,createExecutors:executors(),workflowId:run.id});
 await store.complete(ctx,result);const before=await store.get(ctx);
 await assert.rejects(()=>client.query('delete from core_readonly.events'),/immutable/);
 await client.end();client=null;ctl('-m','fast','-w','stop');started=false;
 ctl('-l',join(dir,'postgres.log'),'-o',options,'-w','start');started=true;client=await open();
 store=new PostgresResultStore({connect,expectedDatabaseName:'postgres'});const after=await store.get(ctx);
 assert.equal(after.resultHash,before.resultHash);assert.deepEqual(after.result,before.result);
 await assert.rejects(()=>store.get({...ctx,actorId:OTHER}),/result_not_found/);
 console.log(JSON.stringify({nativePostgres:version,tlsCertificateVerified:true,migrationCount:manifest.migrationCount,bundleSha256:manifest.bundleSha256,
  checks:['source target refused','complete installation rollback after injected failure','full atomic install','nonempty rerun refused','private forced RLS/API role denial','public tables have RLS under broad default grants','watchdog dormant','immutable lifecycle','result survives actual database server restart','cross-actor denied'],platformAuthStorage:'modeled; not a hosted Supabase installation',hostedChanges:false},null,2));
} catch(error) {
 const log=await readFile(join(dir,'postgres.log'),'utf8').catch(()=> '');
 process.stderr.write(log.split('\n').filter(line=>/FATAL|PANIC/.test(line)).join('\n')+'\n');
 throw error;
} finally {
 try{await client?.end();}finally{if(started)ctl('-m','fast','-w','stop');await rm(dir,{recursive:true,force:true});}
}
