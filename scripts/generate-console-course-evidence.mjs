import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { COURSE_IDENTITIES } from '../config/course-identities.mjs';
import { renderableCourseIds } from '../config/course-registry.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'public/statecourse/data/course-catalog.json')));
const stateRoots = { AK:'alaska', AZ:'arizona', CA:'california', CO:'colorado', ME:'maine', MI:'michigan', MO:'missouri',
  NC:'north-carolina', OK:'oklahoma', PA:'pennsylvania', TX:'texas', VA:'virginia', WA:'washington', WI:'wisconsin' };
// Declared source relationships, not fuzzy title matching.
const special = {
  'va-principles-practices-v1':'virginia', 'me-sales-agent-v1':'maine', 'wi-salesperson':'wisconsin',
  'ok-basic-prelicense-90':'oklahoma', 'nc-broker-prelicensing-75':'north-carolina',
  'co-real-estate-law-practice-48':'colorado/co-real-estate-law-and-practice-48-v1',
  'co-contracts-regulations-48':'colorado/co-contracts-and-regulations-48-v1',
  'co-trust-accounts-recordkeeping-8':'colorado/co-trust-accounts-and-record-keeping-8-v1',
  'co-real-estate-closings-24':'colorado/co-closings-24-v1',
};
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const exists = p => fs.existsSync(path.join(root,p));
function files(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
}
async function inspectEngine(stateRoot, sourceRoot, state) {
 const file=`config/${stateRoot}-course-engine.mjs`;
 if(state==='TX')return {status:'separate_texas_authoring_and_reviewer_engines',studentCompatible:false,
  missing:'Only Law of Agency is wired to the student blocks service and SQL 024. Other Texas definitions need their own persisted timing/assessment adapter; reviewer engines are not production persistence.'};
 if(!exists(file))return {status:'no_state_engine_found',studentCompatible:false};
 try {
  const engineModule=await import(pathToFileURL(path.join(root,file)));
  const name='get'+stateRoot.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join('')+'Course';
  const single={ME:'me-sales-agent-55-v1',VA:'va-salesperson-principles-v1',WI:'wi-salesperson-72-v1',OK:'ok-basic-prelicense-90-v1',NC:'nc-broker-prelicensing-75-v1'};
  const definition=engineModule[name]?.(single[state]||path.basename(sourceRoot));
  return {status:definition?'state_definition_loaded':'exact_state_definition_unresolved',file,
   authoredCourseId:definition?.courseId||definition?.id||null,authoredVersion:definition?.version||null,
   studentCompatible:false,missing:'State engine can describe/score authored material but has no registered student delivery, authenticated persistence and version bridge for this offering.'};
 } catch {return {status:'state_definition_import_failed',file,studentCompatible:false};}
}

const rows = await Promise.all(catalog.categories.filter(c=>c.category_id==='real-estate').flatMap(c=>c.programs.flatMap(p=>p.courses.map(async course=>{
  const id=COURSE_IDENTITIES[course.course_id]?.id || course.course_id, stateRoot=stateRoots[course.state_id];
  const sourceRoot=special[course.course_id] || `${stateRoot}/${course.course_id}${course.course_id.endsWith('-v1')?'':'-v1'}`;
  const lessons=files(`${sourceRoot}/curriculum`).filter(p=>/\/(?:module|lesson)-\d+[^/]*\.md$/.test(p));
  const engineCandidates=course.state_id==='TX'?['config/texas-law-of-agency-engine.mjs','config/texas-principles-ii-engine.mjs','config/texas/complete-course-reviewer-engine.mjs']:[`config/${stateRoot}-course-engine.mjs`];
  const registered=renderableCourseIds().includes(id);
  const engine=await inspectEngine(stateRoot,sourceRoot,course.state_id);
  return { courseId:id, publicId:course.course_id, state:course.state_id, sourceRoot,
    curriculumFiles:lessons.sort().map(p=>({path:p,sha256:hash(fs.readFileSync(path.join(root,p))),bytes:fs.statSync(path.join(root,p)).size})),
    curriculumStatus:lessons.length?'authored_material_present_review_required':'curriculum_not_located',
    engineCandidates:engineCandidates.filter(exists), engineInspection:engine, runtimeRegistered:registered,
    compatibility:registered?'registered_student_adapter':'Authored state engine is not a verified student-runtime connection.',
    missingConnection:registered?null:`${engine.missing||'Resolve the exact authored state definition.'} Register the exact ${id} course/version with its state delivery and progress adapter, then verify enrollment, timing, assessments and persistence. Do not activate from file presence.`,
    approvalClaim:false, completeCurriculumClaim:false };
}))));
const output={schema:1,source:'repository build inspection; file presence is not curriculum approval or runtime acceptance',
  catalogSha256:hash(fs.readFileSync(path.join(root,'public/statecourse/data/course-catalog.json'))),courses:rows};
fs.writeFileSync(path.join(root,'config/console-course-evidence.json'),JSON.stringify(output,null,2)+'\n');
console.log(`Recorded curriculum evidence for ${rows.length} Real Estate courses; no course activated.`);
