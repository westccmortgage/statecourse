import pg from 'pg';
import {createServerApplication,createBackgroundApplication} from './application.mjs';
import {IntegrationError} from '../statecourse/contract.mjs';

const headers={'cache-control':'no-store, private','x-content-type-options':'nosniff'};
const reply=(status,body)=>Response.json(body,{status,headers});
// The transport supports durable background execution. This release still clamps
// provider spending OFF; a future spending approval must deliberately change this profile.
const closedProviderEnvironment=environment=>new Proxy({}, {get:(_target,name)=>
 ['CORE_V2_ALLOW_PAID_CALLS','CORE_V2_PROVIDER_NETWORK_ENABLED'].includes(name)?'false':environment[name]});
export function createNetlifyHandler({environment,Pool=pg.Pool,fetch=globalThis.fetch,createApplication=createServerApplication}) {
 const serverEnvironment=closedProviderEnvironment(environment);let application;
 const dispatch=async({context,headers:original})=>{
  const origin=serverEnvironment.STATECOURSE_ORIGIN;
  if(!origin?.startsWith('https://') || new URL(origin).origin!==origin)throw new IntegrationError('fixed_https_site_origin_required',503);
  const forwarded=new Headers({origin,'content-type':'application/json'});
  for(const name of ['authorization','x-statecourse-staff-proof'])forwarded.set(name,original.get(name)||'');
  try {
   const response=await fetch(origin+'/api/admin/core/background',{method:'POST',redirect:'error',cache:'no-store',
    headers:forwarded,body:JSON.stringify({runId:context.runId}),signal:AbortSignal.timeout(5000)});
   if(response.status!==202)throw Error('not_accepted');
  } catch {throw new IntegrationError('background_dispatch_unconfirmed',503);}
 };
 return async request=>{
  const url=new URL(request.url);
  if(url.pathname==='/api/admin/core/health') {
   if(url.search)return reply(404,{error:'not_found'});
   if(request.method!=='GET')return reply(405,{error:'method_not_allowed'});
   return reply(200,{service:'statecourse-core',hosting:'existing-netlify',
    analysisEnabled:false,providerCallsEnabled:false,
    sourceAccess:'not_verified',coreConnection:'not_verified'});
  }
  if(request.method==='POST' && serverEnvironment.CORE_V2_BACKGROUND_ENABLED!=='true')return reply(503,{error:'analysis_disabled_pending_background_execution'});
  try {
   application??=createApplication({Pool,environment:serverEnvironment,fetch,dispatch});
   return await application.handle(request);
  } catch {return reply(503,{error:'integration_unavailable'});}
 };
}
export function createNetlifyBackgroundHandler({environment,Pool=pg.Pool,fetch=globalThis.fetch,createApplication=createBackgroundApplication}) {
 const serverEnvironment=closedProviderEnvironment(environment);let application;
 return async request=>{
  try {application??=createApplication({Pool,environment:serverEnvironment,fetch});return await application.handle(request);}
  catch {return reply(503,{error:'integration_unavailable'});}
 };
}
