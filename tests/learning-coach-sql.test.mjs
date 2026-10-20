import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.LEARNING_COACH_TEST_PGLITE;
test('durable SQL admission, deduplication, retention, IP/global budget and permissions',{skip:modulePath?false:'Set LEARNING_COACH_TEST_PGLITE; SQL is unverified when skipped.'},async()=>{
 const {PGlite}=await import(pathToFileURL(modulePath));const db=new PGlite();
 try{
 await db.exec('create role anon; create role authenticated; create role service_role;');
 await db.exec(fs.readFileSync(new URL('../database/learning-coach/001_control.sql',import.meta.url),'utf8'));
 assert.deepEqual((await db.query("select public.learning_coach_control('settings','{}'::jsonb) as settings")).rows[0].settings,{LEARNING_COACH_ENABLED:'false'});
 await assert.rejects(db.query("insert into public.learning_coach_settings values(false,'{}')"));
 await assert.rejects(db.query("update public.learning_coach_settings set configuration='{\"OPENAI_API_KEY\":\"forbidden\"}'"));
 await db.exec("update public.learning_coach_settings set configuration='{\"LEARNING_COACH_ENABLED\":\"true\",\"LEARNING_COACH_DAILY_BUDGET_USD\":\"1\"}'");
 await db.exec(fs.readFileSync(new URL('../database/learning-coach/001_control.sql',import.meta.url),'utf8'));
 assert.equal((await db.query("select public.learning_coach_control('settings','{}'::jsonb) as settings")).rows[0].settings.LEARNING_COACH_ENABLED,'true','reapplying the explicit script must not overwrite existing settings');
 assert.deepEqual((await db.query("select has_table_privilege('anon','public.learning_coach_settings','select') as anon,has_table_privilege('authenticated','public.learning_coach_settings','select') as authenticated,relrowsecurity as rls from pg_class where oid='public.learning_coach_settings'::regclass")).rows[0],{anon:false,authenticated:false,rls:true});
 const payload={requestId:'11111111-1111-4111-8111-111111111111',identity:'a'.repeat(64),payloadHash:'b'.repeat(64),reserveMicros:1000,budgetMicros:10000};
 const call=async(op,p=payload)=>(await db.query('select public.learning_coach_control($1,$2::jsonb) as result',[op,JSON.stringify(p)])).rows[0].result;
 assert.equal((await call('reserve')).status,'reserved');assert.equal((await call('reserve')).status,'already_reserved');
 assert.equal((await call('reserve',{...payload,payloadHash:'c'.repeat(64)})).status,'conflict');
 await call('complete',{...payload,response:{status:'answer'}});assert.equal((await call('reserve')).response.status,'answer');
 await db.exec("update public.learning_coach_requests set created_at=clock_timestamp()-interval '11 minutes'");assert.equal((await call('reserve')).status,'already_reserved');
 for(let i=2;i<=6;i++)assert.equal((await call('reserve',{...payload,requestId:`11111111-1111-4111-8111-${String(i).padStart(12,'0')}`})).status,'reserved');
 assert.equal((await call('reserve',{...payload,requestId:'11111111-1111-4111-8111-111111111117'})).status,'limited');
 assert.equal((await call('reserve',{...payload,requestId:'11111111-1111-4111-8111-111111111118',identity:'d'.repeat(64),reserveMicros:9000})).status,'limited');
 const roles=await db.query("select has_function_privilege('anon','public.learning_coach_control(text,jsonb)','execute') as anon,has_function_privilege('authenticated','public.learning_coach_control(text,jsonb)','execute') as authenticated,has_function_privilege('service_role','public.learning_coach_control(text,jsonb)','execute') as service");assert.deepEqual(roles.rows[0],{anon:false,authenticated:false,service:true});
 assert.equal((await db.query('select sum(reserved_micros)::int as total from public.learning_coach_requests')).rows[0].total,6000);
 }finally{await db.close();}
});
