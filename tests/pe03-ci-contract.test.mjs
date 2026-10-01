import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { nativeConnectionOptions } from './helpers/pe03-native-fixture.mjs';

test('native acceptance has no hosted URL, environment-secret or hostname fallback',()=>{
  assert.throws(()=>nativeConnectionOptions({}),/Explicit PE03_NATIVE_CI/);
  for(const host of ['localhost','db.example.invalid','127.0.0.1.example.invalid','::1'])assert.throws(()=>nativeConnectionOptions({PE03_NATIVE_CI:'1',PE_POSTGRES_HOST:host,PE_POSTGRES_PORT:'5432'}),/literal loopback/);
  for(const port of ['',0,443,'5432.5','not-a-port',70000])assert.throws(()=>nativeConnectionOptions({PE03_NATIVE_CI:'1',PE_POSTGRES_PORT:port}),/port required/);
  const options=nativeConnectionOptions({PE03_NATIVE_CI:'1',PE_POSTGRES_PORT:'55432',DATABASE_URL:'do-not-use',PGHOST:'do-not-use',PGDATABASE:'do-not-use',PGPASSWORD:'do-not-use'});
  assert.equal(options.host,'127.0.0.1');assert.equal(options.database,'pe03_ci_bootstrap');assert.equal(options.password,'pe03_local_only');assert.equal(options.ssl,false);
});

test('CI proposal uses read-only checkout permissions and only isolated acceptance',async()=>{
  const workflow=await fs.readFile(new URL('../.github/workflows/pe03-isolated-acceptance.yml',import.meta.url),'utf8');
  assert.match(workflow,/contents: read/);assert.match(workflow,/persist-credentials: false/);
  assert.doesNotMatch(workflow,/secrets\.|pull_request_target|netlify deploy|supabase db push|git push|workflow_dispatch/);
  assert.match(workflow,/tests\/pe03-cohort.test.mjs tests\/pe03-staff-boundary.test.mjs/);assert.match(workflow,/tests\/integration\/pe03-native.test.mjs/);assert.match(workflow,/xvfb-run --auto-servernum node tests\/browser\/pe03-local-browser.mjs/);
  assert.match(workflow,/PE_CHROMIUM_HEADED: '1'/);assert.match(workflow,/retention-days: 3/);
});

test('PE03 instructor page selects the existing fresh-action client contract',async()=>{
  const html=await fs.readFile(new URL('../public/statecourse/student/pe03/index.html',import.meta.url),'utf8');
  const js=await fs.readFile(new URL('../public/statecourse/student/pe03/pe03.mjs',import.meta.url),'utf8');
  const endpoint=await fs.readFile(new URL('../netlify/functions/instructor-pe03.mts',import.meta.url),'utf8');
  assert.match(html,/src="\/staff\/action-proof.js"/);assert.match(js,/'\/api\/admin\/pe03'/);assert.match(endpoint,/'\/api\/admin\/pe03'/);
});
