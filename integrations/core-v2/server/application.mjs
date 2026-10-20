import {createReadOnlyApi} from '../statecourse/api.mjs';
import {StateCourseReader} from '../statecourse/adapter.mjs';
import {createSupabaseVerifier} from '../statecourse/auth.mjs';
import {PostgresResultStore} from '../statecourse/store.mjs';
import {createProviderRuntimeFactory} from '../statecourse/providers.mjs';
import {createDatabaseConnections} from './database.mjs';
import {createCookieBridge} from './bridge.mjs';

export function createServerApplication({Pool,environment=process.env,providerConfig,familyProviders,fetch=globalThis.fetch}) {
 if(environment.CORE_V2_BRIDGE_ENABLED!=='true')return {handle:async()=>Response.json({error:'integration_disabled'},{status:503,headers:{'cache-control':'no-store'}}),close:async()=>{}};
 const allowedOrigin=environment.STATECOURSE_ORIGIN;
 const verifyAccessToken=createSupabaseVerifier({url:environment.SUPABASE_URL,publishableKey:environment.SUPABASE_ANON_KEY,fetch});
 if(!environment.SUPABASE_ANON_KEY)throw new Error('existing_public_auth_key_required');
 const db=createDatabaseConnections({Pool,sourceUrl:environment.STATECOURSE_READ_DATABASE_URL,sourceDatabase:environment.STATECOURSE_DATABASE_NAME,
  coreUrl:environment.CORE_DATABASE_URL,coreDatabase:environment.CORE_DATABASE_NAME});
 try {
  const handleCore=createReadOnlyApi({enabled:true,allowedOrigin,organizationId:environment.CORE_ORGANIZATION_ID,
   reader:new StateCourseReader({connect:db.connectSource}),verifyAccessToken,
   store:new PostgresResultStore({connect:db.connectCore,expectedDatabaseName:environment.CORE_DATABASE_NAME}),
   createRuntime:createProviderRuntimeFactory({config:providerConfig,familyProviders,connectCore:db.connectCore,
    expectedDatabaseName:environment.CORE_DATABASE_NAME,environment,networkEnabled:environment.CORE_V2_PROVIDER_NETWORK_ENABLED==='true'})});
  return {handle:createCookieBridge({handleCore,allowedOrigin,enabled:true}),close:db.close};
 } catch(error){void db.close();throw error;}
}
