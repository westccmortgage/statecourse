import pg from 'pg';
import {createServerApplication} from './application.mjs';

const headers={'cache-control':'no-store, private','x-content-type-options':'nosniff'};
const reply=(status,body)=>Response.json(body,{status,headers});
// Netlify's synchronous execution limit is shorter than the existing Core runner's
// settlement window. Until a durable background handoff is reviewed, this host may
// retrieve authorized saved runs, but never start analysis or spend on providers.
export function createNetlifyHandler({environment,Pool=pg.Pool,fetch=globalThis.fetch,createApplication=createServerApplication}) {
 const serverEnvironment=new Proxy({}, {get:(_target,name)=>
  ['CORE_V2_ALLOW_PAID_CALLS','CORE_V2_PROVIDER_NETWORK_ENABLED'].includes(name)?'false':environment[name]});
 let application;
 return async request=>{
  const url=new URL(request.url);
  if(url.pathname==='/api/admin/core/health') {
   if(url.search)return reply(404,{error:'not_found'});
   if(request.method!=='GET')return reply(405,{error:'method_not_allowed'});
   return reply(200,{service:'statecourse-core',hosting:'existing-netlify',
    analysisEnabled:false,providerCallsEnabled:false,
    sourceAccess:'not_verified',coreConnection:'not_verified'});
  }
  if(request.method==='POST')return reply(503,{error:'analysis_disabled_pending_background_execution'});
  try {
   application??=createApplication({Pool,environment:serverEnvironment,fetch});
   return await application.handle(request);
  } catch {return reply(503,{error:'integration_unavailable'});}
 };
}
