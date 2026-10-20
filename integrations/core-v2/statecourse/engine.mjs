import { randomUUID } from 'node:crypto';
import { digest, IntegrationError, freeze } from './contract.mjs';
import { candidatesFrom, verifySnapshot } from './findings.mjs';
import { StateCoursePack, PACK_ID } from './pack.ts';
import { Scheduler } from '../upstream/workers/core-v2/kernel/scheduler.ts';
import { AgentRouter, DEFAULT_ROUTING_TABLE } from '../upstream/workers/core-v2/kernel/router.ts';
import { InMemoryOrchestrationRepository } from '../upstream/workers/core-v2/kernel/memory-repository.ts';
import { KernelDeterministicExecutor } from '../upstream/workers/core-v2/kernel/deterministic.ts';
import { DEFAULT_POLICY } from '../upstream/workers/core-v2/kernel/policy.ts';
import { entityId } from '../upstream/workers/core-v2/kernel/ids.ts';
import { segmentIdFor } from '../upstream/workers/core-v2/kernel/planning.ts';

export function prepare(snapshot, organizationId, workflowId=randomUUID()) {
 verifySnapshot(snapshot);
 const candidates=candidatesFrom(snapshot), material=new Map();
 const sources=candidates.map((candidate,ordinal)=>{
  const hash=digest(candidate.material),sourceId=entityId('source',workflowId,snapshot.snapshotHash,candidate.candidateId);
  const segmentId=segmentIdFor(workflowId,sourceId,null,'captured_observation',hash);
  material.set(sourceId,{ hash,segmentId,text:candidate.material,candidate });
  return {sourceId,ordinal,sourceKind:'record',label:null,uri:`record:${sourceId}`,contentHash:hash,hashAlgorithm:'sha-256',
   objectVersionId:snapshot.snapshotHash,byteSize:Buffer.byteLength(candidate.material),media:{},
   declaredSegments:[{sourceId,parentSegmentId:null,segmentKind:'captured_observation',label:null,ordinal:0,locator:{},contentHash:hash}]};
 });
 const resolver={ async resolve(refs) {
  return refs.map(ref=>{
   const m=material.get(ref.sourceId);
   if(!m || ref.contentHash!==m.hash || (ref.segmentId!==null && ref.segmentId!==m.segmentId)
       || Object.keys(ref.locator??{}).length || digest(m.text)!==m.hash) throw new IntegrationError('material_scope_or_hash_denied',422);
   return {sourceId:ref.sourceId,segmentId:ref.segmentId,mediaKind:'text',mimeType:'text/plain; charset=utf-8',contentHash:m.hash,
    byteLength:Buffer.byteLength(m.text),locator:ref.locator,content:{text:m.text}};
  });
 }};
 const pack=new StateCoursePack(new Map([...material.values()].map(m=>[m.hash,m.candidate])));
 return {candidates,material,resolver,pack,manifest:{workflowId,organizationId,domainPack:PACK_ID,domainPackVersion:pack.version,
  workflowType:'read_only_observation',requestedScope:{snapshot_hash:snapshot.snapshotHash},sources}};
}

// A host explicitly supplies approved executors. Importing this module opens no connection
// and calls no provider. There is no action executor, arbiter route, composer or memory lookup.
export async function explainSnapshot(snapshot,{organizationId,createExecutors,createRuntime,workflowId,routing=DEFAULT_ROUTING_TABLE}) {
 const world=prepare(snapshot,organizationId,workflowId);
 if(!world.candidates.length) return freeze({snapshotHash:snapshot.snapshotHash,capturedAt:snapshot.capturedAt,status:'no_observations',observations:[],limitations:['Bounded repository consistency checks only; no legal, launch, exam or certificate determination.']});
 const runtime=createRuntime?await createRuntime(world):{registry:await createExecutors(world.resolver),repo:new InMemoryOrchestrationRepository()};
 try {
 const registry=runtime.registry;
 if(!runtime.durable && registry.families().some(f=>registry.resolve(f).executor.providerId)) throw new IntegrationError('durable_provider_runtime_required',503);
 routing=runtime.routing??routing;
 const readers=(routing.general_analysis??[]).filter(c=>registry.has(c.family));
 const critics=(routing.evidence_criticism??[]).filter(c=>registry.has(c.family));
 const readerDomains=new Set(readers.map(c=>registry.domainOf(c.family)));
 if(readerDomains.size<2 || !critics.some(c=>!readerDomains.has(registry.domainOf(c.family)))) throw new IntegrationError('independent_readers_and_critic_required',503);
 registry.register(new KernelDeterministicExecutor(world.pack),['deterministic']);
 const repo=runtime.repo;
 const scheduler=new Scheduler(repo,world.manifest,world.pack,DEFAULT_POLICY,new AgentRouter({...routing,high_reasoning_arbitration:[]}),registry,
  {owner:'statecourse-readonly',leaseTtlMs:DEFAULT_POLICY.attemptTimeoutMs+DEFAULT_POLICY.settlementAllowanceMs+1,now:Date.now});
 await scheduler.plan();
 if(runtime.afterPlan) await runtime.afterPlan(world.manifest.workflowId);
 const report=await scheduler.runUntilQuiescent();
 const claims=await repo.listClaims({workflowId:world.manifest.workflowId});
 const observations=world.candidates.map(candidate=>{
  const subject=`observation/${digest(candidate.material)}`;
  const accepted=claims.filter(c=>c.subjectKey===subject && c.predicate==='observed_issue' && c.status==='accepted');
  return {candidateId:candidate.candidateId,code:candidate.code,explanation:candidate.explanation,evidence:candidate.evidence,
   verification:accepted.length?'accepted':'needs_human_review',acceptedClaimIds:accepted.map(c=>c.claimId)};
 });
 // Return the actual evidence trail, not merely a boolean asserted by the adapter.
 const tasks=await repo.listTasks(world.manifest.workflowId);
 const attempts=(await Promise.all(tasks.map(t=>repo.listAttempts(t.taskId)))).flat();
 const assessments=await repo.listAssessments(claims.map(c=>c.claimId));
 return freeze({snapshotHash:snapshot.snapshotHash,capturedAt:snapshot.capturedAt,workflowId:world.manifest.workflowId,
  status:observations.every(o=>o.verification==='accepted')?'verified_observations':'needs_human_review',observations,
  trace:{workflowState:report.workflow.state,claims:claims.filter(c=>c.predicate==='observed_issue'),assessments,
   attempts:attempts.map(a=>({attemptId:a.attemptId,taskId:a.taskId,state:a.state,executorFamily:a.executorFamily,independenceDomain:a.independenceDomain}))},
  limitations:['Point-in-time snapshot; re-run after any source change.','No conclusion about unimplemented checks or legal sufficiency.',runtime.durable?'Core orchestration and budget ledger are durable; automatic resubmission is disabled.':'Kernel orchestration is process-local in this mode; completed artifacts can be persisted separately by the API store.']});
 } finally {if(runtime.close) await runtime.close();}
}
