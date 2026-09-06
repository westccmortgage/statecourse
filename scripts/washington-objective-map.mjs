#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { SECTIONS, EVIDENCE, BUILD_BATCHES } from '../config/washington/curriculum-map-plan.mjs';
import { washingtonSource } from '../config/washington/regulatory-manifest.mjs';

export const ROOT = path.resolve(import.meta.dirname,'..');
const compact = text => text.replace(/\s+/g,'').toLowerCase();
const clean = text => text.replace(/\s+/g,' ').trim();
// Fixed independently after extracting the freshly downloaded, byte-matched PDFs.
// Regenerating a matrix cannot bless edits to source words or mandatory subtopics.
export const SOURCE_PAGE_DIGESTS = Object.freeze({fundamentals:'3773922185cbcd32dc9431fd0bbb6fce8e937708aaeeb705be3e7555e30b25ce',practices:'779e99490adb729d6f77c16b29c43e9619d9792c97c17a26a8467e5e842b9437'});
export function verifySourceSnapshots(snapshots, readPdf = file=>fs.readFileSync(file)){
  if(snapshots.length!==2||new Set(snapshots.map(s=>s.course)).size!==2)throw Error('Expected exactly two distinct source snapshots');
  for(const s of snapshots){
    const expected=washingtonSource(`wa-curriculum-${s.course}`)?.sha256;
    if(!expected||s.sha256!==expected)throw Error(`Unreviewed PDF hash ${s.course}`);
    const pdf=readPdf(path.join(ROOT,`washington/regulatory/source-evidence/${s.course}.pdf`));
    if(crypto.createHash('sha256').update(pdf).digest('hex')!==expected)throw Error(`Actual PDF bytes changed ${s.course}`);
    if(crypto.createHash('sha256').update(JSON.stringify(s.pages)).digest('hex')!==SOURCE_PAGE_DIGESTS[s.course])throw Error(`Extracted source text changed ${s.course}`);
    if(s.pages.length!==s.pageCount||s.pageCount!==(s.course==='fundamentals'?12:9))throw Error(`Wrong PDF page count ${s.course}`);
  }
}
export function extractObjectives(snapshots) {
  const result=[];
  for (const snapshot of snapshots) {
    const defs=SECTIONS[snapshot.course]; let section=null, objective=null;
    for (const page of snapshot.pages) {
      const lines=page.text.split('\n');
      for (let index=0;index<lines.length;index++) {
        const text=lines[index].trim();
        if (!text || /^\d+$/.test(text) || /^WA Real Estate Practices Page \d+/.test(text) || /Washington Real Estate Fundamentals Rev\./.test(text)) continue;
        const def=defs.find(d=>compact(d[1])===compact(text));
        if(def){section=def;objective=null;continue;}
        if(!section || /^Upon completion/.test(text))continue;
        const number=text.match(/^(\d+)\.\s+(.*)/);
        if(number){
          objective={id:`WA-${snapshot.course==='fundamentals'?'F':'P'}-${section[0]}-${number[1].padStart(2,'0')}`,course:snapshot.course,sectionId:section[0],sectionTitle:section[1],officialNumber:Number(number[1]),sourceId:`wa-curriculum-${snapshot.course}`,sourcePages:[page.page],sourceLines:[],mandatory:!(snapshot.course==='fundamentals'&&section[0]==='FAIR'&&Number(number[1])===7)};
          result.push(objective);
        }
        if(objective){objective.sourceLines.push({page:page.page,line:index+1,text});if(!objective.sourcePages.includes(page.page))objective.sourcePages.push(page.page);}
      }
    }
  }
  for(const objective of result){
    objective.text=clean(objective.sourceLines.map(l=>l.text).join(' '));
    objective.contentSha256=crypto.createHash('sha256').update(objective.text).digest('hex');
    objective.subtopicLines=objective.sourceLines.filter(l=>/^(?:[a-z]\.|[•]|o\s)/.test(l.text));
  }
  return result;
}
export function buildMap(){
  const snapshots=JSON.parse(fs.readFileSync(path.join(ROOT,'washington/regulatory/curriculum-source-pages.json'),'utf8'));
  verifySourceSnapshots(snapshots);
  const objectives=extractObjectives(snapshots);
  for(const objective of objectives){
    const evidence=EVIDENCE.filter(e=>e[0]===objective.course&&e[1]===objective.sectionId&&e[2].includes(objective.officialNumber)).map(e=>{
      const file=`washington/wa-real-estate-${e[0]}-${e[0]==='fundamentals'?60:30}-v1/curriculum/module-${e[3]}.md`;
      const content=fs.readFileSync(path.join(ROOT,file),'utf8');const lines=content.split('\n');
      const index=lines.findIndex(l=>l.startsWith('#')&&l.includes(e[4]));
      if(index<0)throw Error(`Missing lesson anchor ${file}: ${e[4]}`);
      return {file,line:index+1,heading:lines[index],review:e[5],fileSha256:crypto.createHash('sha256').update(content).digest('hex')};
    });
    const def=SECTIONS[objective.course].find(s=>s[0]===objective.sectionId);
    objective.status=!objective.mandatory?'optional-resource':evidence.length?'partial':'missing';
    objective.evidence=evidence;
    objective.gap=!objective.mandatory?'DOL expressly calls these sample resources nonmandatory; retain as optional instructor context.':evidence.length?evidence.map(e=>e.review).join(' '):`No substantive in-course lesson evidence located for this complete objective. ${def[5]}`;
    objective.plannedSection=def[4];objective.remediation=def[5];objective.assessmentIds=[];objective.verifiedInstructionMinutes=null;objective.finalPagePinpoint=null;
    if(objective.sectionId==='INTRO'){objective.status='rollup';objective.gap='Course-level rollup; assess against the remaining Fundamentals sections, not as ten extra teaching blocks.';}
    if(objective.id==='WA-F-CAREER-08'||objective.id==='WA-F-CAREER-09')objective.sourceAnomaly='Official PDF prints one sentence as items8 and9; retain both source anchors, count one substantive objective, do not invent a second learning outcome.';
    if((objective.course==='practices'&&['AGENCY','LISTING','NEGOTIATION','PSA'].includes(objective.sectionId))||(objective.course==='fundamentals'&&objective.sectionId==='AGENCY'))objective.currentLawOverlay='Legacy prescribed wording remains in source inventory; teach current RCW18.86 service-agreement/limited-dual-agency duties and current compensation/MLS rules with dated primary pinpoints. Old outline terms are not independent evidence of current law.';
  }
  return {verifiedAt:'2026-09-06',kind:'objective-level audit and proposed time plan',submissionReady:false,actualDurationVerified:false,sources:snapshots.map(({pages,...s})=>s),sections:SECTIONS,buildBatches:BUILD_BATCHES,objectives};
}
export function validateMap(map){
  const errors=[];const ids=new Set();
  for(const [course,defs] of Object.entries(SECTIONS)){
    for(const def of defs){const rows=map.objectives.filter(o=>o.course===course&&o.sectionId===def[0]);if(rows.length!==def[2])errors.push(`${course}/${def[0]} needs${def[2]} printed numbered records, got${rows.length}`);for(let n=1;n<=def[2];n++)if(rows.filter(o=>o.officialNumber===n).length!==1)errors.push(`Missing/duplicate ${course}/${def[0]}/${n}`);}
    const minutes=defs.reduce((s,d)=>s+d[3],0);if(minutes!==(course==='fundamentals'?3000:1500))errors.push(`Wrong planned minutes ${course}: ${minutes}`);
  }
  const originals=extractObjectives(JSON.parse(fs.readFileSync(path.join(ROOT,'washington/regulatory/curriculum-source-pages.json'),'utf8')));
  for(const original of originals){const row=map.objectives.find(o=>o.id===original.id);if(!row||row.text!==original.text||JSON.stringify(row.sourceLines)!==JSON.stringify(original.sourceLines))errors.push(`Prescribed content lost or changed: ${original.id}`);}
  for(const o of map.objectives){
    if(ids.has(o.id))errors.push(`Duplicate ${o.id}`);ids.add(o.id);
    if(!['partial','missing','rollup','optional-resource'].includes(o.status))errors.push(`Invalid status ${o.id}`);
    if(!o.gap||!o.remediation)errors.push(`No gap/remediation ${o.id}`);
    if(o.status==='partial'&&!o.evidence.length)errors.push(`Unsupported evidence ${o.id}`);
    for(const e of o.evidence){
      if(!e.file?.startsWith(`washington/wa-real-estate-${o.course}-`)||!e.review||!e.heading||!Number.isInteger(e.line)){errors.push(`Invalid course-local evidence ${o.id}`);continue;}
      const full=path.join(ROOT,e.file);if(!fs.existsSync(full)){errors.push(`Missing lesson ${o.id}`);continue;}
      const content=fs.readFileSync(full,'utf8');if(crypto.createHash('sha256').update(content).digest('hex')!==e.fileSha256||content.split('\n')[e.line-1]!==e.heading)errors.push(`Lesson evidence changed ${o.id}`);
    }
    if(o.status==='covered'||o.verifiedInstructionMinutes!==null||o.finalPagePinpoint!==null)errors.push(`Unverified completion claim ${o.id}`);
  }
  if(map.submissionReady||map.actualDurationVerified)errors.push('Audit cannot claim submission or actual duration complete');
  return errors;
}
function markdown(map,course){
  const rows=map.objectives.filter(o=>o.course===course);let text=`# Washington ${course} objective matrix\n\nVerified 2026-09-06 against the official PDF (${course==='fundamentals'?'12':'9'} pages). Source wording includes every subordinate required topic. Status is instructional evidence only; no final exam, final page or actual-duration certification is complete. Proposed minutes are section allocations, not measured time.\n\n`;
  for(const section of SECTIONS[course]){
    text+=`## ${section[0]} — ${section[1]}\n\nProposed active instruction: ${section[3]} minutes. ${section[5]}\n\n`;
    for(const row of rows.filter(o=>o.sectionId===section[0])){
      text+=`### ${row.id} — ${row.status}\n\nOfficial: ${row.sourcePages.map(p=>`p.${p}`).join(', ')}, ${section[1]} #${row.officialNumber}.\n\n${row.text}\n\n`;
      if(row.sourceAnomaly)text+=`Source anomaly: ${row.sourceAnomaly}\n\n`;
      text+=row.evidence.length?`Located evidence: ${row.evidence.map(e=>`${e.file}:${e.line} (${e.heading.replace(/^#+ /,'')})`).join('; ')}.\n\n`:'Located in-course evidence: none.\n\n';
      text+=`Outstanding work: ${row.gap}\n\n`;
    }
  }
  return text;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const map=buildMap();const errors=validateMap(map);if(errors.length){console.error(errors.join('\n'));process.exit(1);}
  if(process.argv.includes('--write')){
    fs.writeFileSync(path.join(ROOT,'washington/regulatory/objective-matrix.json'),JSON.stringify(map,null,2)+'\n');
    for(const course of Object.keys(SECTIONS))fs.writeFileSync(path.join(ROOT,`washington/regulatory/${course}-objective-matrix.md`),markdown(map,course));
  }
  console.log(JSON.stringify({valid:true,submissionReady:false,actualDurationVerified:false,courses:Object.keys(SECTIONS).map(course=>{const rows=map.objectives.filter(o=>o.course===course);return {course,printedRecords:rows.length,mandatoryPrintedRecords:rows.filter(o=>o.mandatory).length,substantiveMandatoryObjectives:rows.filter(o=>o.mandatory).length-(course==='fundamentals'?1:0),statusCounts:Object.fromEntries([...new Set(rows.map(o=>o.status))].map(status=>[status,rows.filter(o=>o.status===status).length])),subtopicAnchorCount:rows.filter(o=>o.mandatory).reduce((n,o)=>n+o.subtopicLines.length,0),plannedMinutes:SECTIONS[course].reduce((n,s)=>n+s[3],0)};})},null,2));
}
