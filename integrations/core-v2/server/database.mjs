import {IntegrationError} from '../statecourse/contract.mjs';

// Explicit objects prevent libpq URL sslmode/options from overriding certificate checks.
function target(value, expectedDatabase, source) {
 try {
  const url=new URL(value);
  const database=decodeURIComponent(url.pathname.slice(1));
  if(!['postgres:','postgresql:'].includes(url.protocol) || !url.hostname || !url.username || !url.password
    || url.search || url.hash || !database || database.includes('/') || database!==expectedDatabase) throw new Error();
  return {host:url.hostname,port:Number(url.port||5432),database,user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),
   ssl:{rejectUnauthorized:true},max:4,connectionTimeoutMillis:5000,idleTimeoutMillis:10000,
   query_timeout:10000,application_name:source?'statecourse_core_readonly':'statecourse_core_store',
   ...(source?{options:'-c default_transaction_read_only=on'}:{})};
 } catch {throw new Error('explicit_tls_database_configuration_required');}
}
export function createDatabaseConnections({Pool,sourceUrl,sourceDatabase,coreUrl,coreDatabase}) {
 const source=target(sourceUrl,sourceDatabase,true),core=target(coreUrl,coreDatabase,false);
 if(source.host.toLowerCase()===core.host.toLowerCase() && source.port===core.port && source.database===core.database)
  throw new Error('separate_core_database_required');
 // Pool construction is lazy: no socket is opened until an authorized request leases it.
 const pools=[new Pool(source),new Pool(core)];
 for(const pool of pools) pool.on('error',()=>{/* discard idle errors; never log credentials */});
 const lease=(pool,config,isSource)=>async()=>{
  let connection;
  try {
   connection=await pool.connect();
   connection.on?.('error',()=>{/* queries fail closed; no driver details in logs */});
   const {rows}=await connection.query("select current_database() as database_name,to_regclass('public.enrollments') is not null as source_present");
   if(rows[0]?.database_name!==config.database || rows[0]?.source_present!==isSource)
    throw new IntegrationError('database_target_refused',503);
   return {query:(sql,params)=>connection.query(sql,params),release:()=>connection.release(true)};
  } catch {connection?.release(true);throw new IntegrationError('database_connection_unavailable',503);}
 };
 const connectCore=lease(pools[1],core,false);
 const connectCoreWorker=async()=>{
  const connection=await connectCore();
  try {
   // Original Core RPCs are backend-only and inspect auth.role(). The dedicated
   // login must be NOINHERIT with explicitly approved service_role membership.
   // This context is confined to an isolated, exclusively leased Core session.
   await connection.query('SET ROLE service_role');
   await connection.query("select set_config('request.jwt.claim.role','service_role',false)");
   return connection;
  } catch {await connection.release();throw new IntegrationError('core_worker_role_unavailable',503);}
 };
 return {connectSource:lease(pools[0],source,true),connectCore,connectCoreWorker,close:()=>Promise.all(pools.map(pool=>pool.end()))};
}
