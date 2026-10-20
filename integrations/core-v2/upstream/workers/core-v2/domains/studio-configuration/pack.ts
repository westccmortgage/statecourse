/** Studio facts and bounded read-model repair. No provider, canonical write or second kernel. */
import {PACKET_VERSION} from '../../kernel/contracts.ts';
import {canonical, sha256, entityId} from '../../kernel/ids.ts';
import {KernelDeterministicExecutor, emptyEnvelope} from '../../kernel/deterministic.ts';
import type {DomainPack, ExpansionInput, TaskSpec} from '../../kernel/domain.ts';
import type {WorkPacket, AgentResultEnvelope, ClaimRecord, ProposedClaim, SegmentRecord, TaskRecord, SourceDescriptor} from '../../kernel/contracts.ts';
export const VERSION='studio-configuration.2';
export type Facts={episodeId:string;previousId:string|null;mode:'planning'|'execution';
  expected:Record<string,string>;carried:Record<string,string>;allowed:Record<string,string[]>;
  evidence:Array<{relationship_id:string;state:string;episode_id:string;scene_id:string;sequence:number;
    source_digest:string;evidence_id:string;kind:string;note:string}>;
  episodeDigests:Record<string,string>;verifiedEvidenceIds:string[];
  futureReference:{target:string;status:string;source_digest:string}|null;
  sourceConflicts?:Array<Record<string,unknown>>;
  dialogue:Array<{speaker:string;text:string}>;declaredVoiceRequirements:string[];configuredVoices:string[];deferredReferenceRecorded?:boolean};
const hash=(x:unknown)=>sha256(canonical(x));
export function planConfiguration(f:Facts){
 if(!f || !['planning','execution'].includes(f.mode) || !f.episodeId || !Array.isArray(f.evidence) || !Array.isArray(f.dialogue) || !f.allowed || !f.expected || !f.carried)throw new Error('Invalid configuration facts');
 const decisions:Array<Record<string,unknown>>=[];const carried={...f.carried};
 const add=(code:string, status:string, chosen:string, because:string, evidence:unknown, alternatives:unknown[])=>
   decisions.push({code,status,chosen,because,evidence,alternatives});
 if(f.sourceConflicts?.length)add('CONFIGURATION_SOURCE_CONFLICT','blocked','hold_for_source_reconciliation',
   'Conflicting saved and imported obligations require source-precedence evidence; preserve both sources.',f.sourceConflicts,
   [{action:'force_imported_target',rejected:'No evidence that import overrides a later owner choice.'},
    {action:'discard_imported_obligation',rejected:'A placeholder or disagreement does not cancel an authored obligation.'}]);
 for(const [rid,wanted] of Object.entries(f.expected)){
  if(!f.previousId)continue;
  const candidates=f.evidence.filter(e=>e.relationship_id===rid&&e.episode_id===f.previousId
    && e.source_digest===f.episodeDigests[e.episode_id] && e.evidence_id && e.scene_id && e.note.trim()
    && f.allowed[rid]?.includes(e.state)
    && ((e.kind==='verified_delivered'&&f.verifiedEvidenceIds.includes(e.evidence_id))
        || (e.kind==='approved_script_projection'&&f.mode==='planning')));
  // Last explicit event within one source; competing sources never silently overwrite one another.
  const bySource=new Map<string,typeof candidates[number]>();
  for(const e of candidates){const key=e.kind+':'+e.source_digest;const last=bySource.get(key);
    if(!last||e.sequence>last.sequence)bySource.set(key,e);}
  const sources=candidates.filter(e=>e.sequence===bySource.get(e.kind+':'+e.source_digest)?.sequence);const states=new Set(sources.map(e=>e.state));
  const alternatives=[{action:'force_requested_opening',rejected:'A desired opening is not source evidence.'},
    {action:'reset_to_bible',rejected:'Initial state does not prove the predecessor ending.'},
    {action:'regenerate_previous_episode',rejected:'Changes preserved media and needs new spending authority.'}];
  if(states.size!==1 || sources.length===0 || !states.has(wanted)){
    add('CONTINUITY_EVIDENCE_GAP','blocked','hold_for_evidence',
      sources.length===0?'No current admissible predecessor evidence.':states.size>1?'Admissible sources disagree.':'The source ending contradicts the requested opening.',sources,alternatives);continue;}
  if(carried[rid]!==wanted){carried[rid]=wanted;
    add('CONTINUITY_PROJECTION_STALE','repair','rebuild_carried_read_model',
      'Replay the explicit admissible predecessor event; preserve the script and media.',sources,alternatives);
  }else add('CONTINUITY_CONFIRMED','verified','retain_carried_state','Carried state matches admissible source evidence.',sources,alternatives);
 }
 if(f.futureReference)add('FUTURE_EPISODE_NOT_CREATED',f.deferredReferenceRecorded?'verified':'repair','retain_deferred_reference',
   'A validated later-episode link is a pending obligation, not a missing prerequisite.',f.futureReference,
   [{action:'create_placeholder_episode',rejected:'Unnecessary episode creation.'},{action:'replace_with_tbd',rejected:'Loses the author’s intended target.'},{action:'claim_resolution_complete',rejected:'No future script or media exists.'}]);
 const required=[...new Set(f.dialogue.filter(d=>d.text.trim()).map(d=>d.speaker))].sort();
 const missing=required.filter(id=>!f.configuredVoices.includes(id));
 if(canonical([...f.declaredVoiceRequirements].sort())!==canonical(required))
  add('VOICE_SCOPE_INCORRECT','repair','derive_requirements_from_nonempty_dialogue',
    'Speaking, including voice-over, determines voice requirements; visibility does not.',required,
    [{action:'assign_voices_to_silent_cast',rejected:'Not required by any line.'},{action:'switch_to_native_audio',rejected:'Changes the approved audio intent.'},{action:'invent_narrator_voice',rejected:'Requires identity choice and external authority.'}]);
 if(missing.length)add('REQUIRED_VOICE_UNAVAILABLE','blocked','request_voice_assignment',
   'A genuinely speaking character lacks its assigned voice.',missing,[]);
 return {policyVersion:VERSION,decisionId:entityId('studio-config',hash(f)),inputDigest:hash(f),
   status:decisions.some(d=>d.status==='blocked')?'BLOCKED':decisions.some(d=>d.status==='repair')?'REPAIRABLE_ZERO_SPEND':'VERIFIED',
   decisions,readModel:{relationships:carried,requiredVoices:required,futureReference:f.futureReference},
   providerCalls:0,spendUsd:0,canonicalMutations:0};
}
export class StudioConfigurationPack implements DomainPack {
 readonly id='studio-configuration';readonly version=VERSION;readonly roles=[];
 readonly objectives={'studio-configuration:derive':'Diagnose configuration from source facts and compare bounded alternatives.'};
 discovererFor(_s:SourceDescriptor){return null;} expand(_i:ExpansionInput):TaskSpec[]{return [];}
 decisionSubjects(_c:ClaimRecord[]){return [];}
 validateClaim(_p:WorkPacket,_c:ProposedClaim,_e:AgentResultEnvelope){return [];}
 normaliseUnit(u:string|null){return u;} normaliseKey(k:string){return k;}
 isRelated(_s:SegmentRecord,_t:TaskRecord,_all:SegmentRecord[]){return false;}
 isReference(_s:SegmentRecord){return false;} linkedSegments(_s:SegmentRecord,_all:SegmentRecord[]){return [];}
 async derive(packet:WorkPacket):Promise<AgentResultEnvelope>{
  const source=packet.context.claims.find(c=>c.predicate==='studio_configuration_facts'&&c.status==='accepted');
  if(!source?.value.text)throw new Error('Accepted source facts required');
  const plan=planConfiguration(JSON.parse(source.value.text));const envelope=emptyEnvelope(packet);
  envelope.claims.push({claimKey:'configuration-plan',subjectType:'episode',subjectKey:packet.subjectKey,
   predicate:'bounded_configuration_repair',value:{known:true,quantity:null,text:JSON.stringify(plan),attributes:{}},
   unit:null,observationBasis:'derived',scope:{},anchorKeys:[],machineConfidence:null,inputClaimIds:[source.ref]});
  return envelope;
 }
}
/** Existing kernel executor is the only derive dispatcher. Input is authenticated factory source data. */
export async function evaluateConfiguration(facts:Facts){
 const id=entityId('studio-config-input',hash(facts));
 const packet:WorkPacket={packetVersion:PACKET_VERSION,workflowId:id,taskId:entityId('studio-config-task',id),parentTaskId:null,
  phase:'derive',roleKey:'studio_configuration_deriver',roleVersion:VERSION,taskType:'studio-configuration:derive',
  subjectKey:facts.episodeId,objective:'Zero-spend configuration repair',sources:[],dependencies:[],independenceGroup:null,
  blindContext:false,allowedActions:[],limits:{maximumSources:0,maximumClaims:1,maximumFollowUps:0,maximumDepth:0,maximumOutputBytes:100000},
  expectedOutputContract:'Bounded configuration plan',inputFingerprint:hash(facts),
  context:{claims:[{ref:id,subjectType:'episode',subjectKey:facts.episodeId,predicate:'studio_configuration_facts',
   value:{known:true,quantity:null,text:JSON.stringify(facts),attributes:{}},unit:null,observationBasis:'reported',scope:{},
   anchors:[],status:'accepted',independenceGroup:null,inputRefs:[]}],assessments:[],disagreements:[],depth:0,validation:[]}};
 const result=await new KernelDeterministicExecutor(new StudioConfigurationPack()).execute(packet,{} as never);
 return {...JSON.parse(result.claims[0].value.text!),kernelTaskId:packet.taskId,sourceClaimId:id};
}
