import pg from 'pg';
import {createDatabaseConnections} from './database.mjs';
import {inspectConnections} from './preflight.mjs';
async function main() {
 // An operator must explicitly authorize network access. Never inherit bridge enablement.
 if(process.env.CORE_V2_PREFLIGHT_ALLOW_NETWORK!=='true')throw new Error();
 if(process.env.CORE_V2_ALLOW_PAID_CALLS==='true' || process.env.CORE_V2_PROVIDER_NETWORK_ENABLED==='true')throw new Error();
 const db=createDatabaseConnections({Pool:pg.Pool,sourceUrl:process.env.STATECOURSE_READ_DATABASE_URL,sourceDatabase:process.env.STATECOURSE_DATABASE_NAME,
  coreUrl:process.env.CORE_DATABASE_URL,coreDatabase:process.env.CORE_DATABASE_NAME});
 try {
  const report=await inspectConnections({...db,organizationId:process.env.CORE_ORGANIZATION_ID});
  process.stdout.write(JSON.stringify(report,null,2)+'\n');if(!report.catalogChecksPassed)process.exitCode=1;
 } finally {await db.close();}
}
main().catch(()=>{process.stderr.write('Connection preflight refused or unavailable; no credentials are reported.\n');process.exitCode=1;});
