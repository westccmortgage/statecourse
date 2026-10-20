import { PostgresError } from '../upstream/workers/core-v2/postgres/wire.ts';
import { IntegrationError } from './contract.mjs';

// Adapt an exclusive TLS driver lease to the unchanged kernel's text-row client.
// Queue whole transactions, not just queries: parallel scheduler lanes must not interleave them.
export async function coreClient(connection,expectedDatabaseName) {
 if(!expectedDatabaseName) throw new Error('explicit_core_database_required');
 const guard=await connection.query("select current_database() as database_name,to_regclass('public.enrollments') is null as isolated");
 if(guard.rows[0]?.database_name!==expectedDatabaseName || guard.rows[0]?.isolated!==true) throw new IntegrationError('core_storage_target_refused',503);
 let tail=Promise.resolve();
 const queue=work=>{const result=tail.then(work);tail=result.catch(()=>{});return result;};
 const text=value=>value==null?null:typeof value==='boolean'?(value?'t':'f'):value instanceof Date?value.toISOString():typeof value==='object'?JSON.stringify(value):String(value);
 async function raw(sql,params=[]) {
  try {
   const r=await connection.query(sql,params);
   const rows=r.rows.map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,text(value)])));
   return {rows,rowCount:r.rowCount??r.affectedRows??rows.length,command:r.command??sql.trim().split(/\s/)[0],fields:Object.keys(rows[0]??{})};
  } catch(error) {
   if(typeof error?.code==='string' && /^[0-9A-Z]{5}$/.test(error.code)) throw new PostgresError({message:error.message,code:error.code,severity:error.severity??'ERROR',constraint:error.constraint??'',detail:error.detail??''});
   throw error;
  }
 }
 return {
  query:(sql,params)=>queue(()=>raw(sql,params)),
  transaction:fn=>queue(async()=>{await raw('BEGIN');try{await raw("SET LOCAL statement_timeout='5s'");const result=await fn({query:raw});await raw('COMMIT');return result;}catch(error){try{await raw('ROLLBACK');}catch{/* hold remains unresolved */}throw error;}}),
  close:()=>queue(()=>connection.release()),
 };
}
