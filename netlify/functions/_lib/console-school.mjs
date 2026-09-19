import { rpc } from './db.mjs';
import { completionReadiness } from './console-completion.mjs';
import stateRegistryData from '../../../public/statecourse/data/state-registry.json' with { type: 'json' };
import coverageData from '../../../config/console-course-evidence.json' with { type: 'json' };
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { snapshot, readRows, courseStructure } from './console-operations.mjs';
import { reviewFingerprint } from './console-review-fingerprint.mjs';
import { enrollmentClassification, realEstateLearning } from './console-learning.mjs';
import { nmlsAdministrativeProgress } from './nmls-training-service.mjs';
import { completeSource, regulatoryReadiness, mediaReadiness, commerceReadiness } from './console-readiness.mjs';
import { COURSE_IDENTITIES } from '../../../config/course-identities.mjs';
import { isNmlsTrainingCourse } from '../../../config/nmls-course-identity.mjs';

async function json(file) {try{return JSON.parse(await fs.readFile(file,'utf8'));}catch{return null;}}
const subset=(source,field,value)=>({...source,rows:(source?.rows||[]).filter(r=>r[field]===value)});
const count=(source,predicate)=>completeSource(source)?source.rows.filter(predicate).length:null;
function blocker(course,code,problem,area,nextAction,evidenceRequired,external=false,owner=false) {
  return {id:`${course.id}:${course.version}:${code}`,courseId:course.id,courseVersion:course.version,state:course.state,program:course.program,
    discipline:course.discipline,problem,area,nextAction,evidenceRequired,codexCanResolve:!external&&!owner,anatoliyMustAct:owner,externalMustAct:external};
}

export function buildSchool({base,catalog,stateRegistry,coverage,datasets,videoMap,environment,control}) {
  const publicRows=(catalog?.categories||[]).flatMap(c=>(c.programs||[]).flatMap(p=>(p.courses||[]).map(course=>({course,program:p,discipline:c.category_id}))));
  const coverageVerified=coverage?.verified===true;
  const courses=base.inventory.rows.map(row=>{
    const pub=publicRows.find(p=>p.course.course_id===row.publicId), pc=pub?.course;
    const record=base.datasets.courses.rows.find(r=>r.id===row.databaseId);
    const course={...row,discipline:row.discipline==='real_estate'?'real-estate':row.discipline,
      school:'StateCourse',program:pub?.program.program_id||'unmapped',programType:pub?.program.program_type||null,
      version:record?.current_version||pc?.course_version||null,hours:pc?.required_hours??null,
      courseType:pc?.product_type||pub?.program.program_type||record?.product_type||null,
      regulator:pc?.regulator||(isNmlsTrainingCourse(row.id)?'NMLS / CSBS':null)};
    const states=stateRegistry?.states||[],state=states.find(s=>s.state_code===course.state);
    const decisions=base.datasets.governance.rows.filter(g=>g.offering_id===course.id&&g.state===course.state&&g.discipline===row.discipline&&g.offering_kind==='course');
    const governance=completeSource(base.datasets.governance)&&decisions.length===1?decisions[0]:null;
    const evidence=coverageVerified?coverage.courses.find(c=>c.courseId===course.id):null;
    course.curriculum=isNmlsTrainingCourse(course.id)?{status:base.nmls?.curriculum?.structurallyComplete?'structurally_complete':'unverified',source:'Pinned NMLS manuscript definition',humanAccepted:false}:
      {status:evidence?.curriculumStatus||'unverified',source:'config/console-course-evidence.json; build-time source hashes',evidence,humanAccepted:false};
    course.reviewContentHash=courseStructure(course.id).available?reviewFingerprint(course.id):null;
    course.regulatory=regulatoryReadiness(course,pc,state,governance,datasets.evidence,base.nmls);
    course.commerce=commerceReadiness(course,governance,datasets.evidence,environment);
    course.media=mediaReadiness(course,datasets,datasets.evidence,videoMap);
    course.enrollmentCount=count(base.datasets.enrollments,e=>e.course_id===course.id);
    course.regulatoryCompletionCount=count(datasets.completions,e=>e.course_id===course.id&&e.completion_status==='complete');
    course.disagreements=[];
    if(pc?.course_version&&record?.current_version&&pc.course_version!==record.current_version)course.disagreements.push(`Catalog version ${pc.course_version} differs from database ${record.current_version}.`);
    if(governance&&record?.approval_status!==governance.approval_status)course.disagreements.push(`Database legacy approval ${record?.approval_status}; current offering decision ${governance.approval_status}. Different sources, not interchangeable.`);
    if(decisions.length>1)course.disagreements.push('Ambiguous offering governance; no approval or payment decision selected.');
    const versions=(datasets.versions?.rows||[]).filter(v=>[course.id,pc?.course_id,...Object.values(control?.states||{}).filter(c=>c.payment_product_id===course.id&&c.state===course.state).map(c=>c.course_id),...Object.entries(COURSE_IDENTITIES).filter(([,i])=>i.id===course.id).map(([id])=>id)].includes(v.course_id));
    course.regulatoryVersions=versions;
    if(!course.service&&!versions.length)course.disagreements.push(completeSource(datasets.versions)?'No matching regulatory-version row.':'Regulatory-version source unavailable.');
    course.sources={identity:'Declared COURSE_IDENTITIES + catalog + courses (jurisdiction matched)',version:'courses.current_version; public version retained for comparison',
      curriculum:course.curriculum.source,approval:governance?'offering_public_status':'Unverified / no unambiguous recorded decision',
      training:'verifiedTrainingReadiness + offering_public_status',payments:course.commerce.source,counts:'Scoped enrollments and completion events; incomplete sources return unknown'};
    const add=(...args)=>blocker(course,...args);
    course.blockers=[];
    if(!course.service) {
      if(course.trainingStatus!=='available')course.blockers.push(add('training',evidence?.missingConnection||course.readiness?.reason||'Training availability not verified','Learning',
        'Verify the course-specific curriculum, delivery adapter, persisted progress definition and recorded access decision.','Passing course-specific runtime acceptance; no automatic activation'));
      if(!governance?.approval_currently_effective)course.blockers.push(add('approval','No effective offering approval verified','Regulatory','Obtain and record matching regulator approval.','Named authority, approval number, course/version, effective dates and original document',true,true));
      for(const [key,gate]of Object.entries(course.regulatory.gates))if(!['verified','not_applicable'].includes(gate.status))course.blockers.push(add(`regulatory_${key}`,`${key}: ${gate.status}${gate.reason?` — ${gate.reason}`:''}`,'Regulatory',`Resolve ${key} for this discipline/jurisdiction.`, 'Version-scoped source reference and named human verification', ['provider','course','school'].includes(key),true));
      for(const reason of course.commerce.reasons)course.blockers.push(add(`commerce_${course.commerce.reasons.indexOf(reason)}`,reason,'Commerce','Complete per-offering sandbox configuration and acceptance.','Current sandbox checkout/webhook/refund evidence',false,true));
      if(course.media.blockerCount)course.blockers.push(add('media',`${course.media.blockerCount} media requirements or verification gaps`,'Media','Review exact course media requirements and asset gates.','Caption/transcript/UID/private playback and human review evidence',false,true));
    }
    for(const d of course.disagreements)course.blockers.push(add(`data_${course.disagreements.indexOf(d)}`,d,'Data','Reconcile identities/status sources without overwriting governance.','Explicit matching course/version and retained disagreement history'));
    return course;
  });
  const people=new Map((base.datasets.people?.rows||[]).map(p=>[p.id,p]));
  const enrollments=base.datasets.enrollments.rows.map(e=>{
    const course=courses.find(c=>c.id===e.course_id), classification=enrollmentClassification(e);
    let learning;
    if(isNmlsTrainingCourse(e.course_id)) {
      const attempts=(datasets.nmlsAttempts?.rows||[]).filter(r=>r.enrollment_id===e.id);
      try {if(!completeSource(datasets.nmlsAttempts)||attempts.length!==1)throw Error();learning=nmlsAdministrativeProgress(attempts[0],e);}
      catch {learning={available:false,reason:'NMLS history or source unavailable / invalid',creditEligible:false,certificateEligible:false};}
    } else learning=realEstateLearning(e,courseStructure(e.course_id),subset(datasets.blocks,'enrollment_id',e.id),subset(datasets.assignments,'enrollment_id',e.id),subset(datasets.assessments,'enrollment_id',e.id),e.state==='CA'?subset(datasets.finalAssessments,'enrollment_id',e.id):null);
    const certificates=subset(e.state==='MI'?datasets.michiganCertificates:datasets.certificates,'enrollment_id',e.id);
    const reports=e.state==='MI'?subset(datasets.michiganReports,'enrollment_id',e.id):subset(datasets.reports,'state',e.state);
    const payments=base.datasets.payments?subset(base.datasets.payments,'enrollment_id',e.id):null;
    const latestAccess=(base.datasets.recentAccess?.rows||[]).find(a=>a.enrollment_id===e.id);
    return {id:e.id,student:people.get(e.student_id)||{id:e.student_id},courseId:e.course_id,courseVersion:e.course_version,
      reviewContentHash:course?.reviewContentHash ? (e.console_content_release_id ? (()=>{const release=datasets.releases?.rows.find(r=>r.id===e.console_content_release_id&&r.course_id===e.course_id);return completeSource(datasets.releases)&&release?reviewFingerprint(e.course_id,release.content_hash):null;})() : course.reviewContentHash) : null,
      discipline:course?.discipline||'unverified',state:e.state,classification,expiresAt:e.expires_at,learning,
      paymentStatus:classification.nonCredit?'Not required for this non-credit access':completeSource(payments)?payments.rows.map(p=>p.payment_status).join(', ')||'No payment record':'Unverified / restricted',
      lastActivity:isNmlsTrainingCourse(e.course_id)?learning.lastActivity||null:latestAccess?.occurred_at||e.last_course_accessed_at||null,
      completion:completionReadiness(e,base.datasets.courses.rows.find(c=>c.id===e.course_id),learning,{events:datasets.completions,certificates,reports,michiganStatus:datasets.michiganStatus?.rows.find(r=>r.enrollmentId===e.id)?.status})};
  });
  for(const course of courses)course.trainingCompletionCount=completeSource(base.datasets.enrollments)&&enrollments.filter(e=>e.courseId===course.id).every(e=>typeof e.learning.trainingCompleted==='boolean')?enrollments.filter(e=>e.courseId===course.id&&e.learning.trainingCompleted===true).length:null;
  const blockers=courses.flatMap(c=>c.blockers);
  const disciplines=['real-estate','mortgage'].map(id=>{
    const rows=courses.filter(c=>c.discipline===id&&!c.service);
    return {id,states:[...new Set(rows.map(c=>c.state))],courses:rows.length,operational:rows.filter(c=>c.trainingStatus==='available').length,
      blocked:rows.filter(c=>c.blockers.length).length,enrollments:completeSource(base.datasets.enrollments)?enrollments.filter(e=>e.discipline===id).length:null,
      trainingCompletions:completeSource(base.datasets.enrollments)&&enrollments.filter(e=>e.discipline===id).every(e=>typeof e.learning.trainingCompleted==='boolean')?enrollments.filter(e=>e.discipline===id&&e.learning.trainingCompleted===true).length:null,
      regulatoryBlockers:blockers.filter(b=>b.discipline===id&&b.area==='Regulatory').length};
  });
  const hierarchy=disciplines.map(d=>({...d,jurisdictions:d.states.map(state=>({state,programs:[...new Set(courses.filter(c=>c.discipline===d.id&&c.state===state).map(c=>c.program))].map(id=>({id,courses:courses.filter(c=>c.discipline===d.id&&c.state===state&&c.program===id).map(c=>({id:c.id,version:c.version,blockers:c.blockers.length}))}))}))}));
  return {school:'StateCourse',checkedAt:base.checkedAt,courses,enrollments,disciplines,hierarchy,blockers,
    tasks:base.datasets.tasks,evidence:datasets.evidence,reviews:datasets.reviews,reviewerCandidates:datasets.reviewerCandidates,
    sourceStatus:Object.fromEntries(Object.entries({...base.datasets,...datasets}).map(([k,s])=>[k,{available:s?.available===true,truncated:s?.truncated===true}])),
    coverageVerified,notice:'Operational training is separate from approval, credit, certificates and payments. Research folders never count as operational offerings.'};
}

export async function schoolWorkspace(staff) {
  const base=await snapshot(staff), ids=base.datasets.courses.rows.map(c=>c.id).filter(id=>/^[a-zA-Z0-9_-]+$/.test(id));
  const filter=`&course_id=in.(${ids.length?ids.join(','):'__none__'})`;
  const control=await json('config/state-regulatory-controls.json');
  const versionIds=[...new Set([...ids,...Object.values(control?.states||{}).filter(c=>ids.includes(c.payment_product_id)).map(c=>c.course_id)])];
  const versionFilter=`&course_id=in.(${versionIds.filter(id=>/^[a-zA-Z0-9_-]+$/.test(id)).join(',')||'__none__'})`;
  const stateFilter=staff.scopeStates?`&state=in.(${staff.scopeStates.join(',')})`:'';
  const queries={
    reviewerCandidates:'students?select=id,email,first_name,last_name&account_status=eq.active&order=email.asc&limit=1001',
    releases:`console_course_releases?select=id,course_id,content_hash&limit=1001${filter}`,
    evidence:`console_evidence_events?select=*&order=event_order.desc&limit=1001${filter}`,
    reviews:`console_review_findings?select=*&order=event_order.desc&limit=1001${filter}`,
    versions:`regulatory_course_versions?select=course_id,version,lifecycle_status,required_hours,regulatory_credit_enabled,enrollment_enabled&limit=1001${versionFilter}`,
    completions:`course_completion_events?select=enrollment_id,course_id,completion_status,completed_at&limit=1001${filter}`,
    certificates:`course_completion_certificates?select=enrollment_id,course_id,course_version,certificate_number,issued_at,delivery_status,delivered_at,delivery_due_at&limit=1001${filter}`,
    reports:`regulatory_reports?select=id,state,report_type,period_start,period_end,due_date,status,submitted_at&limit=1001${stateFilter}`,
    michiganCertificates:`michigan_completion_certificates?select=enrollment_id,course_id,certificate_identifier,issued_at,status&limit=1001${filter}`,
    michiganReports:`michigan_completion_reports?select=enrollment_id,course_id,status,generated_at,submitted_at&limit=1001${filter}`,
    blocks:`lms_block_progress?select=enrollment_id,assignment_id,block_id,status&limit=1001${filter}`,
    assignments:`lms_assignment_state?select=enrollment_id,assignment_id,status,active_seconds,remediation_status&limit=1001${filter}`,
    finalAssessments:`final_exam_sessions?select=enrollment_id,attempt_number,status,correct_count,question_count,passed,submitted_at&limit=1001${filter}`,
    assessments:`lms_block_assessment_attempts?select=enrollment_id,assignment_id,block_id,kind,correct&limit=1001${filter}`,
    media:`video_assets?select=asset_key,course_id,stream_uid,source_sha256,captions_verified_at,transcript_verified_at&limit=1001${filter}`,
    mediaGates:'video_release_readiness?select=asset_key,release_ready,outstanding_gates&limit=1001',
    mediaPlacements:'current_video_placements?select=asset_key,placement_status&limit=1001',
  };
  if(ids.some(isNmlsTrainingCourse))queries.nmlsAttempts='nmls_training_attempts?course_id=eq.nmls-ce-2026-comprehensive-8&select=enrollment_id,student_id,course_id,course_version,revision,runtime,updated_at&limit=1001';
  const datasets=Object.fromEntries(await Promise.all(Object.entries(queries).map(async([key,q])=>[key,await readRows(q)])));
  const michigan=base.datasets.enrollments.rows.filter(e=>e.state==='MI'&&!enrollmentClassification(e).nonCredit);
  datasets.michiganStatus={available:true,truncated:false,rows:await Promise.all(michigan.map(async e=>{try{const status=await rpc('michigan_operational_status',{p_enrollment_id:e.id});return {enrollmentId:e.id,status:{certificate_eligible:status.certificate_eligible,completion_eligible:status.completion_eligible,blockers:status.reasons,reportEligible:status.completion_report_eligible}};}catch{return {enrollmentId:e.id,status:null};}}))};
  const catalog=await json('public/statecourse/data/course-catalog.json'),stateRegistry=stateRegistryData,coverage=structuredClone(coverageData);
  if(coverage&&catalog)coverage.verified=coverage.catalogSha256===createHash('sha256').update(await fs.readFile('public/statecourse/data/course-catalog.json')).digest('hex');
  let videoMap={};try {videoMap=JSON.parse(globalThis.Netlify?.env.get('CLOUDFLARE_STREAM_VIDEO_MAP')||process.env.CLOUDFLARE_STREAM_VIDEO_MAP||'{}');}catch{}
  return buildSchool({base,catalog,stateRegistry,coverage,datasets,videoMap,control});
}
