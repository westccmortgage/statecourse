import {PE_COURSE_DEFINITION,PE_COURSE_UNITS} from '../../../config/nmls/pe-course-definition.mjs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,HASH=/^[a-f0-9]{64}$/;
const invalid=()=>{throw Object.assign(Error('pe_course_setup_invalid_request'),{statusCode:400});};
export function validatePeSetupRequest(input,role){
 if(!input||Object.getPrototypeOf(input)!==Object.prototype||!['owner','administrator','instructor'].includes(role))invalid();
 const op=input.operation;if(!['create','snapshot','revoke-member'].includes(op)||!UUID.test(input.courseId||''))invalid();
 const keys=op==='snapshot'?['operation','courseId']:op==='revoke-member'?['operation','requestId','courseId','learnerId']:['operation','requestId','courseId','title','timezone','opensAt','closesAt','instructorId','learners','rocsVersion','rocsDocumentHash','rocsRenderedHash'];
 if(Reflect.ownKeys(input).length!==keys.length||keys.some(k=>!Object.hasOwn(input,k)))invalid();
 if(op!=='snapshot'&&!UUID.test(input.requestId||''))invalid();
 if(op==='revoke-member'){if(!UUID.test(input.learnerId||''))invalid();return input;}
 if(op==='snapshot')return input;
 if(!['owner','administrator'].includes(role)||typeof input.title!=='string'||input.title.trim().length<1||input.title.length>200||typeof input.timezone!=='string'||input.timezone.length>100||!Number.isFinite(Date.parse(input.opensAt))||!Number.isFinite(Date.parse(input.closesAt))||Date.parse(input.closesAt)<=Date.parse(input.opensAt)||!UUID.test(input.instructorId||'')||!Array.isArray(input.learners)||input.learners.length<1||input.learners.length>100||new Set(input.learners).size!==input.learners.length||input.learners.some(x=>!UUID.test(x))||typeof input.rocsVersion!=='string'||input.rocsVersion.length<1||input.rocsVersion.length>100||!HASH.test(input.rocsDocumentHash||'')||!HASH.test(input.rocsRenderedHash||''))invalid();
 return {...input,title:input.title.trim(),courseHash:PE_COURSE_DEFINITION.contentHash,definitionId:PE_COURSE_DEFINITION.id,units:PE_COURSE_UNITS.map(unit=>({unitId:unit.unit,title:unit.title,category:unit.category,initialMinimumMs:unit.initialMinimumMs,plannedMs:unit.plannedMs,contentHash:unit.contentHash}))};
}
export async function executePeSetup(input,actorId,role,{rpc}){
 if(!UUID.test(actorId||''))throw Error('pe_course_setup_access_denied');const request=validatePeSetupRequest(input,role),result=await rpc('pe_course_setup_command',{p_actor:actorId,p_role:role,input:request}),fail=()=>{throw Error('pe_course_setup_unavailable');};
 const exact=(value,keys)=>value&&Object.getPrototypeOf(value)===Object.prototype&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));
 const keys=['schemaVersion','courseId','title','mode','enabled','assignedInstructorId','unitCount','members','creditEligible','certificateEligible','bankingEligible'];
 if(!exact(result,keys)||result.schemaVersion!==1||result.courseId!==input.courseId||typeof result.title!=='string'||result.title.length<1||result.mode!=='prerequisite_bound'||typeof result.enabled!=='boolean'||!UUID.test(result.assignedInstructorId)||result.unitCount!==25||!Array.isArray(result.members)||result.members.length<2||result.creditEligible!==false||result.certificateEligible!==false||result.bankingEligible!==false)fail();
 const expected=input.operation==='create'?new Set([input.instructorId,...input.learners]):null,seen=new Set();let instructors=0;
 if(expected&&(result.title!==input.title.trim()||result.enabled!==false||result.assignedInstructorId!==input.instructorId||result.members.length!==expected.size))fail();
 if(role==='instructor'&&result.assignedInstructorId!==actorId)fail();
 for(const member of result.members){if(!exact(member,['actorId','role','active'])||!UUID.test(member.actorId)||seen.has(member.actorId)||!['student','instructor'].includes(member.role)||typeof member.active!=='boolean'||(member.actorId===result.assignedInstructorId)!==(member.role==='instructor')||(expected&&!expected.has(member.actorId))||(input.operation==='create'&&member.active!==true))fail();seen.add(member.actorId);if(member.role==='instructor')instructors++;}
 if(input.operation==='revoke-member'&&!result.members.some(member=>member.actorId===input.learnerId&&member.role==='student'&&member.active===false))fail();
 if(instructors!==1)fail();return {schemaVersion:1,courseId:result.courseId,title:result.title,mode:result.mode,enabled:result.enabled,assignedInstructorId:result.assignedInstructorId,unitCount:25,members:result.members.map(({actorId,role,active})=>({actorId,role,active})),creditEligible:false,certificateEligible:false,bankingEligible:false};
}
