import {createRequire} from 'node:module';
import {randomBytes} from 'node:crypto';
import path from 'node:path';
import {nativeConnectionOptions} from './pe03-native-fixture.mjs';
import {pe03ProductionPrerequisites} from './pe03-production-prerequisites.mjs';
export async function courseNativeDatabase(){
 if(process.env.PE_COURSE_NATIVE_CI!=='1')throw new Error('PE_COURSE_NATIVE_CI=1 required');
 const options=nativeConnectionOptions();
 if(!path.isAbsolute(process.env.PE_PG_MODULE||''))throw new Error('Absolute isolated pg package required');
 const {Client,Pool}=createRequire(import.meta.url)(process.env.PE_PG_MODULE);
 const admin=new Client(options);await admin.connect();const database=`pe_course_${process.pid}_${randomBytes(6).toString('hex')}`;
 await admin.query(`create database "${database}"`);await admin.end();const pool=new Pool({...options,database,max:12});
 const db={exec:sql=>pool.query(sql),query:(sql,args)=>pool.query(sql,args),close:()=>pool.end(),
  transaction:async callback=>{const c=await pool.connect();try{await c.query('begin');const result=await callback({exec:sql=>c.query(sql),query:(sql,args)=>c.query(sql,args)});await c.query('commit');return result;}catch(e){await c.query('rollback');throw e;}finally{c.release();}},
  connect:async()=>{const client=await pool.connect();return {client,pid:(await client.query('select pg_backend_pid() pid')).rows[0].pid};},
 };
 try{const sourceHashes=await pe03ProductionPrerequisites(db);db.metadata={engine:'native PostgreSQL',version:(await db.query('select version() version')).rows[0].version,database,sourceHashes,auth:'synthetic upstream provider'};return db;}catch(e){await pool.end();throw e;}
}
