// Offline test doubles only. Not exported by the integration's runtime entry points.
import { ExecutorRegistry } from '../../upstream/workers/core-v2/kernel/executors.ts';
import { ScriptedExecutor, kernelRoleResponders } from '../../upstream/workers/core-v2/domains/mock-executor.ts';
import { emptyEnvelope } from '../../upstream/workers/core-v2/kernel/deterministic.ts';
export function executors({silentCritic=false,aliasReaders=false,wrongReading=false}={}) {
 return async resolver=>{
  // Test oracle uses captured material; its dictionary never enters a reader packet.
  const index=new Map();
  const responder=async packet=>{
   const ref=packet.sources.find(s=>s.kind==='segment');
   if(!ref) return emptyEnvelope(packet);
   const text=(await resolver.resolve([ref]))[0].content.text;
   const record=JSON.parse(text); index.set(ref.contentHash,record);
   const env=emptyEnvelope(packet);
   env.anchors.push({anchorKey:'evidence',sourceKind:'segment',sourceId:null,segmentId:ref.segmentId,locator:{},quotedText:text});
   env.claims.push({claimKey:'observation',subjectType:'observation',subjectKey:packet.subjectKey,predicate:'observed_issue',
    value:{known:true,quantity:null,text:wrongReading?'Invented conclusion':record.explanation},unit:null,observationBasis:'observed',scope:{},anchorKeys:['evidence'],machineConfidence:null});
   return env;
  };
  const registry=new ExecutorRegistry();
  const a={family:'reader-family-one',execute:responder};
  const b={family:'reader-family-two',execute:responder};
  registry.register(a,['reader-family-one'],'fixture-reader-a');
  registry.register(aliasReaders?a:b,['reader-family-two'],aliasReaders?undefined:'fixture-reader-b');
  const oracle={readingFor(packet){const record=index.get(packet.sources.find(s=>s.kind==='segment')?.contentHash);return record?{value:{known:true,quantity:null,text:record.explanation},unit:null}:'unreadable';}};
  const responders=kernelRoleResponders(oracle,u=>u);
  registry.register(new ScriptedExecutor('critic-family-one',silentCritic?{evidence_critic:p=>emptyEnvelope(p)}:responders),['critic-family-one'],'fixture-critic');
  return registry;
 };
}
