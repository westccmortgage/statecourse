import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('../',import.meta.url);
const hash=value=>createHash('sha256').update(value).digest('hex');
export const TARGET=Object.freeze({projectId:'hkzhburprkwtnoeqbinh',organizationId:'tusgtiwudezeofsxleet',database:'postgres',region:'us-west-1'});
export const GUARD=`DO $statecourse_core_install$
BEGIN
 IF current_database()<>'postgres' THEN RAISE EXCEPTION 'unexpected_core_database'; END IF;
 IF to_regclass('public.enrollments') IS NOT NULL THEN RAISE EXCEPTION 'statecourse_source_database_refused'; END IF;
 IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema IN ('public','core_readonly') AND table_type='BASE TABLE') THEN
  RAISE EXCEPTION 'initial_core_install_requires_empty_application_schema';
 END IF;
 IF to_regclass('auth.users') IS NULL OR to_regclass('storage.objects') IS NULL
  OR to_regprocedure('extensions.digest(text,text)') IS NULL THEN RAISE EXCEPTION 'supabase_substrate_required'; END IF;
END $statecourse_core_install$;`;

// Build bytes for review/local verification only. No driver, network or apply path.
export async function buildInstallation({read=readFile}={}) {
 const lock=JSON.parse(await read(new URL('upstream-lock.json',base),'utf8'));
 const names=(await readdir(new URL('upstream/supabase/migrations/',base))).filter(n=>n.endsWith('.sql')).sort();
 const locked=Object.keys(lock.files).filter(n=>n.startsWith('supabase/migrations/') && n.endsWith('.sql')).map(n=>n.split('/').at(-1)).sort();
 if(JSON.stringify(names)!==JSON.stringify(locked))throw new Error('upstream_migration_set_changed');
 const entries=[];const parts=[];
 for(const name of names) {
  const path='upstream/supabase/migrations/'+name,text=await read(new URL(path,base),'utf8');
  if(hash(text)!==lock.files['supabase/migrations/'+name])throw new Error('upstream_migration_hash_changed');
  if(/^\s*(begin|commit|rollback)\s*;/im.test(text))throw new Error('unexpected_outer_transaction');
  entries.push({order:entries.length+1,path,sha256:hash(text),bytes:Buffer.byteLength(text)});
  parts.push(`-- FILE ${path}\n${text}`);
 }
 const path='storage/supabase/migrations/20261020021909_statecourse_readonly_results.sql';
 const text=await read(new URL(path,base),'utf8');
 // Only this reviewed outer transaction is removed for one atomic package.
 // The original migration file is retained unchanged and hashed in the manifest.
 if((text.match(/^begin;$/gm)||[]).length!==1 || (text.match(/^commit;$/gm)||[]).length!==1 || !text.trimEnd().endsWith('commit;'))throw new Error('unexpected_storage_transaction');
 entries.push({order:entries.length+1,path,sha256:hash(text),bytes:Buffer.byteLength(text)});
 parts.push(`-- FILE ${path}\n${text.replace(/^begin;\n/m,'').replace(/^commit;\s*$/m,'')}`);
 const sql=`-- Target must be independently selected as ${TARGET.projectId}.\n-- A database name/SQL marker does not prove a Supabase project identity.\nBEGIN;\nSET LOCAL statement_timeout='120s';\nSET LOCAL lock_timeout='5s';\n${GUARD}\n${parts.join('\n\n')}\nCOMMIT;\n`;
 return {sql,manifest:{formatVersion:1,target:TARGET,upstreamCommit:lock.commit,migrationCount:entries.length,entries,bundleSha256:hash(sql)}};
}
export async function verifiedInstallation(options={}) {
 const built=await buildInstallation(options);
 const expected=JSON.parse(await readFile(new URL('manifest.json',import.meta.url),'utf8'));
 if(JSON.stringify(built.manifest)!==JSON.stringify(expected))throw new Error('reviewed_installation_manifest_changed');
 return built;
}
