import { freeze, IntegrationError } from './contract.mjs';
import { coreClient } from './core-client.mjs';
import { buildProviderRegistry } from '../upstream/workers/core-v2-runtime/providers/registry.ts';
import { createHttpsTransport } from '../upstream/workers/core-v2-runtime/transport/https.ts';
import { compilePrompt } from '../upstream/workers/core-v2-runtime/prompt-compiler.ts';
import { RoleRegistry } from '../upstream/workers/core-v2/kernel/roles.ts';
import { PostgresOrchestrationRepository } from '../upstream/workers/core-v2/postgres/repository.ts';
import { BudgetLedger, ceilingFor } from '../upstream/workers/core-v2-runtime/budget/ledger.ts';
import { meteredRepository } from '../upstream/workers/core-v2-runtime/budget/metered.ts';
import { configurationProblems, networkAuthorizationProblems, everyDeclaredKeyIsPresent } from '../upstream/workers/core-v2-runtime/runtime-config.ts';

const FAMILIES=['reader-family-one','reader-family-two','critic-family-one'];
// Existing operator config/pricing/environment are server-owned. No key, model or budget
// is accepted from the API caller. Construction does not access a secret or open a socket.
export function createProviderRuntimeFactory({config,familyProviders,connectCore,expectedDatabaseName,environment=process.env,
 networkEnabled=false,maximumAttempts=128,maximumConcurrentAttempts=8,deadlineMs=120000,transportFactory}) {
 if(typeof connectCore!=='function' || !expectedDatabaseName) throw new Error('durable_core_backend_required');
 const declaration=freeze(structuredClone(config)),families=freeze(structuredClone(familyProviders));
 return async world=>{
  if(networkEnabled!==true || environment.CORE_V2_ALLOW_PAID_CALLS!=='true') throw new IntegrationError('provider_network_disabled',503);
  if(!declaration || configurationProblems(declaration).length || networkAuthorizationProblems(declaration).length) throw new IntegrationError('provider_authorization_or_pricing_required',503);
  if(Object.keys(families).length!==3 || FAMILIES.some(f=>typeof families[f]!=='string') || new Set(FAMILIES.map(f=>families[f])).size!==3
    || Object.values(families).some(id=>!declaration.providers.some(p=>p.providerId===id))) throw new IntegrationError('three_independent_providers_required',503);
  if(!Number.isInteger(maximumAttempts) || maximumAttempts<1 || maximumAttempts>512 || !Number.isInteger(maximumConcurrentAttempts)
    || maximumConcurrentAttempts<1 || maximumConcurrentAttempts>32 || !Number.isFinite(deadlineMs) || deadlineMs<1000 || deadlineMs>300000) throw new IntegrationError('bounded_provider_budget_required',503);
  const critic=declaration.providers.find(p=>p.providerId===families['critic-family-one']);
  if(critic.capabilities?.[critic.defaultModel]?.images!==true) throw new IntegrationError('critic_capabilities_required',503);
  if(!everyDeclaredKeyIsPresent(declaration,name=>environment[name])) throw new IntegrationError('existing_provider_credentials_required',503);
  const ceilings=declaration.providers.map(p=>ceilingFor(declaration,p.providerId,p.defaultModel));
  if(ceilings.some(c=>!c)) throw new IntegrationError('provider_price_ceiling_required',503);
  const connection=await connectCore();let client;
  try {
   client=await coreClient(connection,expectedDatabaseName);
   const roles=new RoleRegistry(world.pack);
   const transport=transportFactory?transportFactory(declaration):createHttpsTransport({config:declaration});
   const built=buildProviderRegistry({config:declaration,transport,compilePrompt:p=>compilePrompt(p,roles.role(p.roleKey)),
    materialResolver:world.resolver,routing:families,environment,retry:{maximumAttempts:1,backoffMs:0}});
   const ledger=new BudgetLedger(client,declaration);
   const inner=new PostgresOrchestrationRepository(client,{organizationId:world.manifest.organizationId});
   const repo=meteredRepository(inner,{ledger,config:declaration,providerOfFamily:family=>families[family]??null});
   const route=family=>{const p=declaration.providers.find(p=>p.providerId===families[family]);return {family,configuration:`${family}/configured`,visual:p.capabilities?.[p.defaultModel]?.images===true};};
   return {repo,registry:built.registry,durable:true,routing:{general_analysis:FAMILIES.slice(0,2).map(route),visual_analysis:[],evidence_criticism:[route('critic-family-one')],high_reasoning_arbitration:[],deterministic:[{family:'deterministic',configuration:'code',visual:false}]},
    afterPlan:async workflowId=>{
     await ledger.authorizeWorkflow({workflowId,organizationId:world.manifest.organizationId,currency:declaration.authorization.currency,
      authorizedMaximum:declaration.authorization.maximumAuthorizedCost,maximumPerAttempt:Math.max(...ceilings.map(c=>c.maximumCost)),
      maximumAttempts,maximumConcurrentAttempts,maximumInputTokens:maximumConcurrentAttempts*Math.max(...declaration.providers.map(p=>p.maximumInputTokens)),
      maximumOutputTokens:maximumConcurrentAttempts*Math.max(...declaration.providers.map(p=>p.maximumOutputTokens)),wallClockDeadline:new Date(Date.now()+deadlineMs)});
    },close:()=>client.close()};
  } catch(error) {if(client)await client.close();else await connection.release();throw error;}
 };
}
