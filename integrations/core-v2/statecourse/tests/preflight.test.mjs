import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {inspectConnections} from '../../server/preflight.mjs';
import {createSourceDatabase} from './source-database.mjs';
import {PGlite,installCore,installResultStore,connect} from './core-database.mjs';
import {ORGANIZATION,IDENTITY} from './fixtures.mjs';
import {StateCourseReader,QUERIES} from '../adapter.mjs';

test('catalog preflight reports unsafe source role and missing Core prerequisites without business reads/writes',async()=>{
 const source=await createSourceDatabase(),core=new PGlite();try {
  await installResultStore(core);
  const before=(await source.query('select count(*)::int n from enrollments')).rows;
  const statements=[];const track=db=>async()=>({query:async(sql,p)=>{statements.push(sql);return db.query(sql,p);},release:async()=>{}});
  const report=await inspectConnections({connectSource:track(source),connectCore:track(core),organizationId:ORGANIZATION});
  assert.equal(report.catalogChecksPassed,false);assert.equal(report.activation,'not_verified');
  assert.equal(report.source.find(r=>r.check==='source_role_has_no_admin_or_allowlisted_write_privileges').passed,false);
  assert.ok(report.source.filter(r=>r.check.startsWith('source_query_')).every(r=>r.passed));
  assert.equal(report.core.find(r=>r.check==='original_core_schema_and_budget_tables_present').passed,false);
  assert.equal(report.core.find(r=>r.check==='configured_core_organization_exists').passed,false);
  assert.equal(report.core.find(r=>r.check==='scoped_result_store_role_and_tables_readable').passed,true);
  assert.equal(statements.some(sql=>/^\s*(INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|GRANT|REVOKE)\b/i.test(sql)),false);
  assert.equal(statements.some(sql=>/^select \* from public\./i.test(sql)),false);
  assert.deepEqual((await source.query('select count(*)::int n from enrollments')).rows,before);
 }finally{await source.close();await core.close();}
});
test('existing least-privilege local source role passes plans; denied table remains a named blocker',async()=>{
 const source=await createSourceDatabase(),core=new PGlite();try {
  await installCore(core);await installResultStore(core);
  await core.exec('alter role service_role bypassrls; grant select on public.organizations to service_role'); // Supabase backend substrate, local fixture only
  await core.query("insert into organizations(id,name) values($1,'fixture')",[ORGANIZATION]);
  // Role/grants are fixture-only; no source migration or hosted grant is generated.
  await source.exec('create role fixture_core_reader; grant usage on schema public,statecourse_staff_private to fixture_core_reader');
  for(const name of [...Object.keys(QUERIES),'staff_actor_binding_events','current_staff_actor_bindings'])await source.exec(`grant select on public.${name} to fixture_core_reader`);
  await source.exec('grant select on statecourse_staff_private.proofs to fixture_core_reader; grant execute on function statecourse_staff_private.proof_active(statecourse_staff_private.proofs) to fixture_core_reader');
  const leased=async()=>{await source.exec('set role fixture_core_reader');return {query:(sql,p)=>source.query(sql,p),release:()=>source.exec('reset role')};};
  const options={connectSource:leased,connectCore:connect(core),organizationId:ORGANIZATION};
  const ready=await inspectConnections(options);assert.equal(ready.catalogChecksPassed,true,JSON.stringify(ready));assert.equal(ready.activation,'not_verified');
  await assert.rejects(()=>new StateCourseReader({connect:leased}).reauthorize(IDENTITY),/staff_scope_or_session_denied/,'planning does not prove the invoker view exposes the ledger through RLS');
  await source.exec('revoke select on public.console_evidence_events from fixture_core_reader');
  const denied=await inspectConnections(options);assert.equal(denied.catalogChecksPassed,false);
  assert.equal(denied.source.find(r=>r.check==='source_query_console_evidence_events').passed,false);
  assert.equal(denied.source.find(r=>r.check==='source_query_console_review_findings').passed,true,'savepoint permits following diagnostics');
 }finally{await source.close();await core.close();}
});
test('connection CLI refuses by default without contacting any target or exposing configuration',()=>{
 const result=spawnSync(process.execPath,['--experimental-strip-types','--no-warnings','integrations/core-v2/server/check-connections.mjs'],{encoding:'utf8',env:{PATH:process.env.PATH}});
 assert.equal(result.status,1);assert.equal(result.stdout,'');assert.equal(result.stderr,'Connection preflight refused or unavailable; no credentials are reported.\n');
});
