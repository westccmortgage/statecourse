import test from 'node:test';
import assert from 'node:assert/strict';
import {createNetlifyHandler} from '../../server/netlify.mjs';
import deployed,{config} from '../../../../netlify/functions/core-readonly.mjs';
const origin='https://statecourse.com';
const request=(path,method='GET')=>new Request(origin+'/api/admin/core/'+path,{method});
test('Netlify health and disabled analysis never inspect credentials, connect or call providers',async()=>{
 const environment=new Proxy({}, {get(){throw Error('secret access');}});
 const handle=createNetlifyHandler({environment,Pool:class{constructor(){throw Error('connection');}},fetch(){throw Error('network');}});
 const response=await handle(request('health'));
 assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/no-store/);
 assert.equal(response.headers.get('access-control-allow-origin'),null);
 assert.deepEqual(await response.json(),{service:'statecourse-core',hosting:'existing-netlify',analysisEnabled:false,
  providerCallsEnabled:false,sourceAccess:'not_verified',coreConnection:'not_verified'});
 const denied=await handle(request('observations','POST'));
 assert.equal(denied.status,503);assert.equal((await denied.json()).error,'analysis_disabled_pending_background_execution');
 assert.equal((await handle(request('health','POST'))).status,405);
 assert.equal((await handle(request('health?secret=value'))).status,404);
});
test('Netlify default deployment remains closed without runtime credentials',async()=>{
 const handle=createNetlifyHandler({environment:{},Pool:class{constructor(){throw Error('connection');}},fetch(){throw Error('network');}});
 const response=await handle(request('observations/00000000-0000-4000-8000-000000000001'));
 assert.equal(response.status,503);assert.equal((await response.json()).error,'integration_disabled');
 assert.equal((await deployed(request('health'))).status,200);
 assert.equal(config.path.length,3);
});
test('Netlify passes retrieval to existing authenticated bridge and overrides both paid flags',async()=>{
 let calls=0;
 const handle=createNetlifyHandler({environment:{CORE_V2_ALLOW_PAID_CALLS:'true',CORE_V2_PROVIDER_NETWORK_ENABLED:'true',STATECOURSE_ORIGIN:origin},
  createApplication({environment}){calls++;assert.equal(environment.CORE_V2_ALLOW_PAID_CALLS,'false');
   assert.equal(environment.CORE_V2_PROVIDER_NETWORK_ENABLED,'false');assert.equal(environment.STATECOURSE_ORIGIN,origin);
   return {handle:r=>Response.json({path:new URL(r.url).pathname})};}});
 const path='observations/00000000-0000-4000-8000-000000000001';
 assert.equal((await (await handle(request(path))).json()).path,'/api/admin/core/'+path);
 await handle(request(path));assert.equal(calls,1);
});
test('Netlify redacts application initialization errors',async()=>{
 const handle=createNetlifyHandler({environment:{},createApplication(){throw Error('private credential');}});
 const r=await handle(request('observations/a'));assert.equal(r.status,503);assert.equal(await r.text(),'{"error":"integration_unavailable"}');
});
