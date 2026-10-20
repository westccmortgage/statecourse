import assert from 'node:assert/strict';
import {AgentRouter,DEFAULT_ROUTING_TABLE} from '../kernel/router.ts';
import {ExecutorRegistry} from '../kernel/executors.ts';
import {RoleRegistry} from '../kernel/roles.ts';
import {outcomeScore} from '../kernel/outcomes.ts';
import {SourceDocumentsPack} from '../domains/source-documents/pack.ts';
import {closeNetwork} from './harness.mjs';
const reached=closeNetwork(),registry=new ExecutorRegistry(),roles=new RoleRegistry(new SourceDocumentsPack({question:'Synthetic'}));
for(const [i,family] of ['reader-family-one','reader-family-two'].entries())registry.register({family,providerId:`provider-${i}`,model:'model-1',
  execute(){throw Error('Routing never executes');}},[family],`provider-${i}`);
const candidates=DEFAULT_ROUTING_TABLE.visual_analysis;
const history=[0,1].flatMap(i=>Array.from({length:4},(_,n)=>({attemptId:`${i}-${n}`,roleKey:'page_reader',roleVersion:'1.0',
  family:candidates[i].family,configuration:candidates[i].configuration,provider:`provider-${i}`,model:'model-1',
  state:'succeeded',verifiedQuality:i===0?'fail':'pass',failureType:null,latencyMs:100,actualCost:null,repairRequired:false,finalAccepted:i===1})));
const request={roleKey:'page_reader',requiresVisualInput:true,independenceGroup:'reader-a',usedDomains:[]};
const router=new AgentRouter(DEFAULT_ROUTING_TABLE,history);
assert.equal(router.select(request,roles,registry).selection.executorFamily,'reader-family-two');
const next=router.select({...request,usedDomains:[registry.domainOf('reader-family-two')]},roles,registry);
assert.equal(next.selection.executorFamily,'reader-family-one');
assert.equal(router.select({...request,usedDomains:registry.families().map(f=>registry.domainOf(f))},roles,registry).ok,false);
const rawSuccess=history.map(o=>({...o,verifiedQuality:null}));
assert.equal(new AgentRouter(DEFAULT_ROUTING_TABLE,rawSuccess).select(request,roles,registry).selection.executorFamily,'reader-family-one');
const changed=outcomeScore(history,'page_reader','1.0',candidates[1].family,candidates[1].configuration,'provider-1','new-model');
assert.equal(changed.samples,0);assert.equal(changed.score,0.5);
assert.equal(outcomeScore(history,'page_reader','2.0',candidates[1].family,candidates[1].configuration,'provider-1','model-1').samples,0);
assert.ok(next.selection.reason.includes('independently accepted or failed outcomes'));
assert.equal(reached(),0);
console.log('ALL OK: verified history changes routing; raw success, changed model/version and used domains cannot buy acceptance');
