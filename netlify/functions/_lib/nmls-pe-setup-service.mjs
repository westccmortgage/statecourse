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
export async function executePeSetup(input,actorId,role,{rpc}){if(!UUID.test(actorId||''))throw Error('pe_course_setup_access_denied');const request=validatePeSetupRequest(input,role);const result=await rpc('pe_course_setup_command',{p_actor:actorId,p_role:role,input:request});if(!result||result.schemaVersion!==1||result.courseId!==input.courseId||result.unitCount!==25||!Array.isArray(result.members)||result.creditEligible!==false||result.certificateEligible!==false||result.bankingEligible!==false)throw Error('pe_course_setup_unavailable');return result;}
