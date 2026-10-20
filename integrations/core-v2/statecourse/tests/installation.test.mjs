import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {verifiedInstallation,buildInstallation,TARGET,GUARD} from '../../installation/package.mjs';
test('installation pins all original migrations plus the isolated store and guards before any DDL',async()=>{
 const {sql,manifest}=await verifiedInstallation();
 assert.equal(manifest.migrationCount,79);assert.equal(manifest.target.projectId,'hkzhburprkwtnoeqbinh');
 assert.equal(manifest.bundleSha256,createHash('sha256').update(sql).digest('hex'));
 assert.equal(manifest.entries[0].path,'upstream/supabase/migrations/001_spatial_studio.sql');
 assert.match(manifest.entries.at(-1).path,/statecourse_readonly_results.sql$/);
 assert.equal(sql.indexOf(GUARD)<sql.indexOf('-- FILE '),true);assert.match(sql,/BEGIN;\nSET LOCAL statement_timeout/);assert.ok(sql.endsWith('COMMIT;\n'));
 assert.equal(manifest.entries.some(e=>e.path.startsWith('database/')),false);
 assert.equal(TARGET.projectId==='gdldvjefibssxnrpsxja' || TARGET.projectId==='hbqlhplgqwuesrovbiye',false);
});
test('modified upstream or private store bytes are refused by the reviewed manifest',async()=>{
 const tamper=async(url,...args)=>{const text=await readFile(url,...args);return String(url).endsWith('001_spatial_studio.sql')?text+'\n-- altered':text;};
 await assert.rejects(()=>buildInstallation({read:tamper}),/upstream_migration_hash_changed/);
 await assert.rejects(()=>verifiedInstallation({read:async(url,...args)=>{const text=await readFile(url,...args);return String(url).endsWith('statecourse_readonly_results.sql')?text.replace('-- Apply ONLY','-- modified Apply ONLY'):text;}}),/reviewed_installation_manifest_changed/);
});
test('offline package CLI writes a new review file but refuses to overwrite existing files',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'core-install-package-'));try {
  const path=join(dir,'review.sql'),command=['integrations/core-v2/scripts/prepare-core-install.mjs',path];
  const result=spawnSync(process.execPath,command,{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  assert.equal(JSON.parse(result.stdout).application,'not_applied');const before=await readFile(path,'utf8');
  const again=spawnSync(process.execPath,command,{encoding:'utf8'});assert.notEqual(again.status,0);assert.equal(await readFile(path,'utf8'),before);
 }finally{await rm(dir,{recursive:true,force:true});}
});
