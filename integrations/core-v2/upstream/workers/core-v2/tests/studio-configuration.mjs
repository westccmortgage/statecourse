import assert from 'node:assert/strict';
import {evaluateConfiguration} from '../domains/studio-configuration/pack.ts';
import {closeTheNetwork} from '../kernel/network-guard.ts';
const guard=closeTheNetwork();
const input={episodeId:'episode-b',previousId:'episode-a',mode:'planning',
 expected:{bond:'apart'},carried:{bond:'initial'},allowed:{bond:['initial','trust','apart']},
 evidence:[{relationship_id:'bond',state:'apart',episode_id:'episode-a',scene_id:'scene-10',sequence:10,
  source_digest:'source-sha',evidence_id:'explicit-event',kind:'approved_script_projection',note:'Explicit separation event'}],
 episodeDigests:{'episode-a':'source-sha'},verifiedEvidenceIds:[],
 futureReference:{target:'episode-c',status:'planned_not_created',source_digest:'current-source'},
 dialogue:[{speaker:'narrator',text:'An actual line'},{speaker:'silent-cast',text:' '}],
 declaredVoiceRequirements:['silent-cast'],configuredVoices:['narrator']};
const first=await evaluateConfiguration(input);
assert.equal(first.status,'REPAIRABLE_ZERO_SPEND');
assert.deepEqual(first.decisions.map(d=>d.code),['CONTINUITY_PROJECTION_STALE','FUTURE_EPISODE_NOT_CREATED','VOICE_SCOPE_INCORRECT']);
assert.equal(first.readModel.relationships.bond,'apart');
assert.deepEqual(first.readModel.requiredVoices,['narrator']);
assert.equal(first.readModel.futureReference.target,'episode-c');
assert(first.decisions.every(d=>d.alternatives.length));
const second=await evaluateConfiguration({...input,carried:first.readModel.relationships,
 declaredVoiceRequirements:first.readModel.requiredVoices,deferredReferenceRecorded:true});
assert.equal(second.status,'VERIFIED');assert.notEqual(first.kernelTaskId,second.kernelTaskId);
for(const bad of [
 {...input,evidence:[]}, {...input,mode:'execution'},
 {...input,episodeDigests:{'episode-a':'changed'}},
 {...input,expected:{bond:'trust'}},
 {...input,evidence:[...input.evidence,{...input.evidence[0],state:'trust',evidence_id:'conflict'}]},
 {...input,configuredVoices:[]}]) {
 const plan=await evaluateConfiguration(bad);assert.equal(plan.status,'BLOCKED');assert.equal(plan.providerCalls,0);
}
assert.deepEqual(input.carried,{bond:'initial'});
assert.equal(guard.tripped(),0);
console.log('ALL OK: three repairs, re-verification, source provenance, six safe holds, unchanged canon, zero network');
