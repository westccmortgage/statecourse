import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {peCourseFixture,ids} from './pe-course-fixture.mjs';
import {PE_COURSE_DEFINITION,PE_COURSE_UNITS} from '../../config/nmls/pe-course-definition.mjs';
import candidate from '../../config/nmls/pe-final/bank-candidate.json' with {type:'json'};
import {definePeFinalBank,peFinalCandidateDigest} from '../../lib/nmls-pe-final-domain.mjs';
import {executePeFinal} from '../../netlify/functions/_lib/nmls-pe-final-service.mjs';
export {ids};
export async function peFinalFixture(){
 const course=await peCourseFixture();const {db}=course;await course.enable();
 await db.exec(await fs.readFile(new URL('../../database/drafts/pe-final-assessment.sql',import.meta.url),'utf8'));
 const bank=definePeFinalBank(candidate,{review:{kind:'independent_ai_source_math_review',status:'passed',candidateContentDigest:peFinalCandidateDigest(candidate),evidenceSha256:'0'.repeat(64),holds:[],humanSmeApproved:false,regulatoryApproved:false}});
 await db.query('insert into pe_final_settings(singleton,enabled,course_hash,bank_digest) values(true,true,$1,$2)',[PE_COURSE_DEFINITION.contentHash,bank.digest]);
 for(const item of bank.items)await db.query('insert into pe_final_bank_items values($1,$2,$3,$4,$5)',[bank.digest,item.id,item.unitId,item.moduleId,item.correctChoice]);
 const rpc=async(name,args)=>{if(name!=='pe_final_command')throw new Error('Unexpected fixture RPC');return db.transaction(async tx=>{await tx.exec('set local role service_role');return(await tx.query('select pe_final_command($1,$2,$3,$4) result',[args.p_actor,args.p_role,args.p_request,args.p_candidate])).rows[0].result;});};
 const role=actor=>actor===ids.instructor?'instructor':'student';
 const request=(operation,extra={})=>({operation,courseId:ids.course,...extra});
 const call=(actor,input)=>executePeFinal(input,actor,role(actor),{rpc,bank});
 const direct=(actor,input,candidate=null,client=null)=>{const {actorId:ignored,...publicRequest}=input;const args={p_actor:actor,p_role:role(actor),p_request:{...publicRequest,courseHash:PE_COURSE_DEFINITION.contentHash,bankDigest:bank.digest},p_candidate:candidate};return client?client.query('select pe_final_command($1,$2,$3,$4) result',[args.p_actor,args.p_role,args.p_request,args.p_candidate]).then(r=>r.rows[0].result):rpc('pe_final_command',args);};
 const state=actor=>call(actor,request('snapshot'));
 const write=async(actor,operation,extra={})=>call(actor,request(operation,{actorId:actor,requestId:randomUUID(),expectedRevision:(await state(actor)).revision,...extra}));
 const revisions={},checks={};
 const text='Synthetic teaching evidence: identify the source, missing fact, responsible decision owner and supported next action.';
 const prepareTeaching=async()=>{
  for(const unit of PE_COURSE_UNITS){const initial={};
   for(const actor of [ids.a,ids.b]){await course.observeTo(actor,unit.unit,unit.initialMinimumMs);initial[actor]=(await course.write(actor,unit.unit,'submit',{text})).receiptId;}
   for(const actor of [ids.a,ids.b])await course.write(actor,unit.unit,'peer',{targetId:initial[actor===ids.a?ids.b:ids.a],text});
   const feedback=await course.write(ids.instructor,unit.unit,'feedback',{targetId:initial[ids.a],text});await course.observeTo(ids.a,unit.unit,unit.plannedMs);revisions[unit.unit]=(await course.write(ids.a,unit.unit,'revise',{targetId:feedback.receiptId,text})).receiptId;
  }
 };
 const prepareChecks=async({pendingUnit=null,modules=null}={})=>{
  if(modules)await course.advance(1000);
  for(const unit of PE_COURSE_UNITS.filter(u=>!modules||modules.includes(u.module))){
   checks[unit.unit]=(await state(ids.a)).checks.filter(c=>c.actorId===ids.a&&c.unitId===unit.unit).at(-1)?.id||null;
   const q=await write(ids.a,'submit_check',{unitId:unit.unit,teachingRevisionId:revisions[unit.unit],previousCheckId:checks[unit.unit]||null,text});checks[unit.unit]=q.receiptId;
   if(unit.unit!==pendingUnit)await write(ids.instructor,'review_check',{checkId:q.receiptId,decision:'accepted',text});
  }
 };
 const releaseSynthetic=async()=>{
  await db.exec("update pe_final_settings set source_review_verified=true,human_sme_verified=true,human_sme_reference='SYNTHETIC-SME-NOT-APPROVAL',regulatory_release_verified=true,regulatory_release_reference='SYNTHETIC-REGULATORY-NOT-APPROVAL',rocs_document_hash=repeat('a',64)");
  await db.query("insert into pe_final_prerequisites values($1,$2,true,'SYNTHETIC-IDENTITY','4',repeat('a',64),(select opens_at from pe_course_rosters where id=$1),true)",[ids.course,ids.a]);
 };
 const qualify=async options=>{await prepareTeaching();await prepareChecks(options);await releaseSynthetic();};
 const answers=(form,n)=>Object.fromEntries(form.questionIds.map((id,i)=>{const correct=bank.items.find(q=>q.id===id).correctChoice;return[id,i<n?correct:['A','B','C','D'].find(c=>c!==correct)];}));
 return {course,db,bank,rpc,request,call,direct,state,write,qualify,prepareTeaching,prepareChecks,releaseSynthetic,revisions,checks,answers,
  metadata:{...db.metadata,identityAndReviewFlags:'SYNTHETIC FIXTURES ONLY; no human SME or regulatory approval established',timingStudyValidated:false,productionTouched:false}};
}
