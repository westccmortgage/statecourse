import { createRequire } from 'node:module';
import { randomBytes, randomUUID } from 'node:crypto';
import path from 'node:path';
import { pe03ProductionPrerequisites } from './pe03-production-prerequisites.mjs';
import { ids } from './pe03-fixture.mjs';
import { PE03_DEFINITION } from '../../config/nmls/pe-oil-definition.mjs';

export function nativeConnectionOptions(env=process.env) {
  if(env.PE03_NATIVE_CI!=='1')throw new Error('Explicit PE03_NATIVE_CI=1 required for disposable native acceptance');
  if(env.PE_POSTGRES_HOST && env.PE_POSTGRES_HOST!=='127.0.0.1')throw new Error('Only literal loopback PostgreSQL is allowed');
  const port=Number(env.PE_POSTGRES_PORT);
  if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Explicit loopback service port required');
  // No DATABASE_URL, PGHOST, PGPASSWORD, Supabase secret or hosted-data fallback.
  return {host:'127.0.0.1',port,user:'postgres',password:'pe03_local_only',database:'pe03_ci_bootstrap',ssl:false,connectionTimeoutMillis:5000,statement_timeout:15000};
}
export async function nativePe03Fixture({controlledClock=false}={}) {
  const options=nativeConnectionOptions();
  if(!path.isAbsolute(process.env.PE_PG_MODULE||''))throw new Error('PE_PG_MODULE must name the isolated pg package');
  const require=createRequire(import.meta.url);const {Client,Pool}=require(process.env.PE_PG_MODULE);
  const admin=new Client(options);await admin.connect();
  const database=`pe03_${process.pid}_${randomBytes(6).toString('hex')}`;
  await admin.query(`create database "${database}"`);await admin.end();
  const pool=new Pool({...options,database,max:12});
  const db={exec:sql=>pool.query(sql),query:(sql,args)=>pool.query(sql,args),close:()=>pool.end()};
  try {
    const sourceHashes=await pe03ProductionPrerequisites(db);
    if(controlledClock)await db.exec(`create table pe03_test_clock(now_at timestamptz not null);insert into pe03_test_clock values(clock_timestamp());grant select on pe03_test_clock to service_role;create or replace function pe03_now() returns timestamptz language sql volatile set search_path=public,pg_temp as $$select now_at from pe03_test_clock$$;`);
    for(const actor of [ids.a,ids.b,ids.instructor,ids.forged])await db.query('insert into students(id,email) values($1,$2)',[actor,actor+'@example.invalid']);
    await db.query("insert into staff_actor_binding_events(auth_user_id,actor_role,binding_status,evidence,recorded_by) values($1,'instructor','active','{\"synthetic\":true}',$1)",[ids.instructor]);
    for(const cid of [ids.cohort,ids.other]) {
      await db.query("insert into pe03_cohorts(id,title,content_hash,timezone,opens_at,closes_at,assigned_instructor_id) values($1,'Synthetic native PE03 cohort',$2,'UTC',date_trunc('day',pe03_now() at time zone 'UTC') at time zone 'UTC',(date_trunc('day',pe03_now() at time zone 'UTC')+interval '14 days') at time zone 'UTC',$3)",[cid,PE03_DEFINITION.contentHash,ids.instructor]);
      for(const [actor,role] of [[ids.a,'student'],[ids.b,'student'],[ids.instructor,'instructor']])await db.query('insert into pe03_members(cohort_id,actor_id,role,active) values($1,$2,$3,true)',[cid,actor,role]);
    }
    const enable=()=>db.exec('update pe03_settings set enabled=true;update pe03_cohorts set enabled=true');
    const request=(operation,extra={})=>({operation,cohortId:ids.cohort,...(!['snapshot','export'].includes(operation)?{requestId:randomUUID(),expectedRevision:0}:{}),...extra});
    const command=async(client,actor,role,input)=>(await client.query('select pe03_command($1,$2,$3) result',[actor,role,{...input,contentHash:PE03_DEFINITION.contentHash}])).rows[0].result;
    const rpc=async(name,args)=>{
      if(name!=='pe03_command')throw new Error('Unexpected local RPC');
      const client=await pool.connect();try{await client.query('begin');await client.query('set local role service_role');const result=await command(client,args.p_actor_id,args.p_role,args.p_request);await client.query('commit');return result;}catch(e){await client.query('rollback');throw e;}finally{client.release();}
    };
    const call=(actor,role,input)=>rpc('pe03_command',{p_actor_id:actor,p_role:role,p_request:input});
    const state=actor=>call(actor,actor===ids.instructor?'instructor':'student',request('snapshot'));
    const advance=ms=>{if(!controlledClock)throw new Error('Real-clock fixture cannot advance synthetic time');return db.query("update pe03_test_clock set now_at=now_at+($1::bigint*interval '1 millisecond')",[ms]);};
    const observe=async(actor=ids.a,tabId=ids.tabA)=>call(actor,'student',request('observe',{expectedRevision:(await state(actor)).revision,tabId,mode:'active'}));
    const qualify=async(actor,tabId)=>{await observe(actor,tabId);await advance(15000);await observe(actor,tabId);await advance(15000);await observe(actor,tabId);};
    const write=async(actor,op,extra={})=>call(actor,actor===ids.instructor?'instructor':'student',request(op,{expectedRevision:(await state(actor)).revision,text:'Synthetic evidence analysis with a specific request and reason.',...extra}));
    const connect=async()=>{const client=await pool.connect();const pid=(await client.query('select pg_backend_pid() pid')).rows[0].pid;return {client,pid};};
    const metadata={engine:'native PostgreSQL',database,server:(await db.query('select version() version')).rows[0].version,sourceHashes,authBoundary:'Supabase Auth schema and provider responses are synthetic; production migrations 001,002,003,019,028 applied unchanged'};
    return {db,pool,connect,command,request,rpc,call,enable,state,advance,observe,qualify,write,metadata};
  }catch(error){await pool.end();throw error;}
}
