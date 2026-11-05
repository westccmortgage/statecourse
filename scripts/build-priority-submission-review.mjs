/** Offline, unsigned review export inside the existing repository's ignored local area.
 * Never uploads, submits, signs, publishes, changes a gate, or equates files with readiness.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, realpathSync, unlinkSync } from 'node:fs';
import { resolve, relative, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { PRIORITY_SUBMISSION_PROGRAMS } from '../config/submission/priority-programs.mjs';
import { PROVIDER_FACTS } from '../config/approval-verification.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=resolve(root,'.local-export/submission-review/2026-11-05');
const includeProtected=process.argv.includes('--include-protected');
const assignments=JSON.parse(readFileSync(resolve(root,'config/submission/instructor-assignments.json'),'utf8'));
const mailingSource='texas/submission/provider-application/01-prefill-facts.md';
const mailingAddress=readFileSync(resolve(root,mailingSource),'utf8').match(/^\| Mailing address \| ([^|]+) \| filed Articles \|/m)?.[1]?.trim();
if(!mailingAddress)throw new Error('Confirmed correspondence address is missing from the held entity facts.');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const allowedExtensions=new Set(['.md','.json','.pdf','.doc','.txt']);

function files(directory) {
  const full=resolve(root,directory);
  if(!existsSync(full))return [];
  const canonicalRoot=realpathSync(root), canonicalDirectory=realpathSync(full);
  if(canonicalDirectory!==canonicalRoot&&!canonicalDirectory.startsWith(canonicalRoot+sep))throw new Error('Source directory escaped repository.');
  return readdirSync(full,{withFileTypes:true}).flatMap(entry=>{
    if(entry.isSymbolicLink())throw new Error('Symlinks are not review sources.');
    const path=`${directory}/${entry.name}`;
    return entry.isDirectory()?files(path):entry.isFile()?[path]:[];
  }).sort();
}

const report={schemaVersion:1,reviewDate:'2026-11-05',scope:'Unsigned offline development review, not a submission-ready or approved package',includesProtectedAssessmentSources:includeProtected,states:[]};
for(const program of PRIORITY_SUBMISSION_PROGRAMS){
  const stateDirectory=resolve(output,program.state);
  mkdirSync(stateDirectory,{recursive:true});
  const curriculum=program.courses.map(course=>{
    const paths=files(course.curriculumDir).filter(path=>extname(path)==='.md');
    return {...course,curriculumFiles:paths.length,rawCurriculumWords:paths.reduce((sum,path)=>sum+(readFileSync(resolve(root,path),'utf8').match(/\S+/g)??[]).length,0),observedInstructionMinutes:null,conformityVerified:false,manuscriptPresent:paths.length>0};
  });
  const sourceFiles=files(program.root).filter(path=>{
    if(!allowedExtensions.has(extname(path)))return false;
    if(/\/(?:assessments|reviewer-surface|video-production|video|renders|delivery|source-evidence)\//.test(path))return false;
    if(/(?:exam|answer-key|secure-final|protected-final)/i.test(path))return false;
    return /\/(?:curriculum|activities|regulatory|submission|trec-sources|frec-sources)\//.test(path)||path.endsWith('/README.md')||path.endsWith('/HANDOFF.md');
  });
  if(program.state==='WA')sourceFiles.push('washington/regulatory/source-evidence/fundamentals.pdf','washington/regulatory/source-evidence/practices.pdf');
  // Raw publisher HTML stays in the canonical, hash-pinned source archive. Reference it
  // without duplicating active publisher scripts/navigation into an offline review folder.
  const sourceReferences=files(program.root).filter(path=>extname(path)==='.html'&&/\/(?:regulatory|trec-sources|frec-sources)\//.test(path)).map(path=>{
    const bytes=readFileSync(resolve(root,path));
    return {path,bytes:bytes.length,sha256:sha(bytes),classification:'CANONICAL_SOURCE_REFERENCE_ONLY'};
  });
  const protectedFiles=includeProtected?files(`config/${program.root}`).filter(path=>/final-exam|secure-final-bank|secure-final-form/.test(path)&&/\.mjs$/.test(path)):[];
  const sharedFiles=['config/submission/instructor-assignments.json'];
  const selected=[...new Set([...sourceFiles,...protectedFiles,...sharedFiles])].sort();
  const previousManifest=resolve(stateDirectory,'MANIFEST.json');
  if(existsSync(previousManifest))for(const previous of JSON.parse(readFileSync(previousManifest,'utf8')).files??[]){
    if(selected.includes(previous.path))continue;
    const oldTarget=resolve(stateDirectory,'materials',previous.path);
    if(!relative(stateDirectory,oldTarget).startsWith('materials/'))throw new Error('Invalid old export path.');
    if(existsSync(oldTarget)){
      if(sha(readFileSync(oldTarget))!==previous.sha256)throw new Error('Modified review copy will not be removed.');
      unlinkSync(oldTarget);
    }
  }
  const manifest=selected.map(path=>{
    const bytes=readFileSync(resolve(root,path));
    const target=resolve(stateDirectory,'materials',path);
    if(!relative(stateDirectory,target).startsWith('materials/'))throw new Error('Invalid review export target.');
    mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(root,path),target);
    return {path,bytes:bytes.length,sha256:sha(bytes),classification:protectedFiles.includes(path)?'PROTECTED_ASSESSMENT_SOURCE':'REVIEW_SOURCE'};
  });
  const teacher=assignments.assignments.find(item=>item.state===program.state);
  if(!teacher||teacher.status!=='DEFERRED_BY_OWNER'||teacher.instructors.length)throw new Error('Instructor decision changed: review export policy must be deliberately revised.');
  const ownerInput={
    state:program.state,legalEntity:PROVIDER_FACTS.legalName,formationState:PROVIDER_FACTS.formationState,
    entityFileNumber:PROVIDER_FACTS.secretaryOfStateFileNumber,formationDate:PROVIDER_FACTS.secretaryOfStateFiledOn,managementStructure:PROVIDER_FACTS.managementStructure,principalOffice:PROVIDER_FACTS.principalOffice,
    mailingAddress,mailingAddressSource:mailingSource,schoolDirector:null,schoolCoordinator:null,authorizedSigner:null,
    instructorAssignment:teacher,financialEvidence:null,signatures:null,
    note:'Known entity facts are carried forward only. No person is assigned to an instructional, school-official or signing role by inference. Sensitive evidence belongs in an approved protected store, not Git.'
  };
  writeFileSync(resolve(stateDirectory,'OWNER-INPUT.json'),JSON.stringify(ownerInput,null,2)+'\n');
  writeFileSync(resolve(stateDirectory,'MANIFEST.json'),JSON.stringify({state:program.state,filingReady:false,files:manifest,sourceReferences},null,2)+'\n');
  const record={state:program.state,name:program.name,filingReady:false,approvalClaimed:false,instructorStatus:teacher.status,
    expectedCourseCount:program.courses.length,curriculum,reviewFileCount:manifest.length,
    protectedAssessmentSourceCount:protectedFiles.length,
    prerequisite:program.prerequisite??null,openContentWork:program.openContentWork,openApplicationWork:program.openApplicationWork};
  report.states.push(record);
  const courseRows=curriculum.map(c=>`| ${c.id} | ${c.proposedHours} | ${c.curriculumFiles} | ${c.rawCurriculumWords} | ${c.manuscriptPresent?'Existing draft; conformity/time unverified':'Full manuscript absent'} |`).join('\n');
  const index=`# ${program.name}: unsigned course and application review\n\n**DEVELOPMENT — NOT FILING READY.** No regulator submission, signature, fee, approval or production action was performed. Instructor selection is **DEFERRED BY OWNER**; no person or credential has been substituted. Other internal content and external evidence gaps remain independently open.\n\n${program.prerequisite??''}\n\n## Existing curriculum copied for review\n\n| Course | Proposed hours | Markdown files | Raw words | Evidence state |\n| --- | ---: | ---: | ---: | --- |\n${courseRows}\n\nRaw words include headings, notes, quotations and exercises; they are not a time study, delivered hours or an adequacy judgment. A course ID/hour label does not establish a complete manuscript or regulator conformity.\n\n## Content work remaining\n\n${program.openContentWork.map(s=>'- '+s).join('\n')}\n\n## Application evidence remaining\n\n${program.openApplicationWork.map(s=>'- '+s).join('\n')}\n- Instructor selection/qualification evidence remains deferred by the owner.\n- Any required signatures, private records, fees and regulator actions remain separate from this export.\n\n## Review contents\n\nMANIFEST.json lists the ${manifest.length} copied source files with byte hashes. Its sourceReferences list points to canonical official HTML captures retained in this repository, with their byte hashes; those raw pages are not duplicated. OWNER-INPUT.json carries known entity facts and blank/deferred roles. ${protectedFiles.length?'This local folder contains protected assessment source files; keep it out of public hosting and public practice. Their presence does not prove complete, reviewed or administrable finals.':'No protected assessment source was included; this is not a complete examination packet.'} Historical handoff/source-limit statements in copied files must be read with the November 5 remediation notes, not mistaken for current approval decisions.\n\n[Official regulator reference](${program.authority}). Current forms, operative law and filing sequence must be checked for the actual filing date.\n`;
  writeFileSync(resolve(stateDirectory,'REVIEW-INDEX.md'),index);
}
mkdirSync(resolve(root,'reports/submission-preparation'),{recursive:true});
writeFileSync(resolve(output,'REVIEW-SUMMARY.json'),JSON.stringify(report,null,2)+'\n');
writeFileSync(resolve(root,'reports/submission-preparation/2026-11-05.json'),JSON.stringify(report,null,2)+'\n');
const summaryRows=report.states.map(state=>`| [${state.name}](${state.state}/REVIEW-INDEX.md) | ${state.expectedCourseCount} | ${state.curriculum.filter(course=>course.manuscriptPresent).length} | Not filing ready | Deferred by owner |`).join('\n');
writeFileSync(resolve(output,'REVIEW-INDEX.md'),`# Nine-state unsigned course review\n\nThese are development review folders for the existing StateCourse project. No state is represented as filing ready or approved. Instructor selection is deferred; the owner is not assigned by inference. Twenty of 22 planned courses have manuscript files, with substantial gaps described individually; GA and NY full manuscripts are absent.\n\n| State | Planned courses | Existing manuscript filesets | Filing status | Instructors |\n| --- | ---: | ---: | --- | --- |\n${summaryRows}\n\n${includeProtected?'Protected assessment source files are included locally. Keep this folder out of public hosting and public attachments.':'Protected assessment sources are omitted.'} Each state index distinguishes content work, institutional/application evidence and instructor selection. No upload, signature or payment occurred.\n`);
console.log(JSON.stringify({states:report.states.length,courses:report.states.reduce((sum,s)=>sum+s.expectedCourseCount,0),copiedFiles:report.states.reduce((sum,s)=>sum+s.reviewFileCount,0),filingReady:report.states.filter(s=>s.filingReady).length,output}));
