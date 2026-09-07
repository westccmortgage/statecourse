#!/usr/bin/env node
// Protected assessment build only. Does not import into a client bundle or alter release gates.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {oklahomaFinalExamBank as bank,oklahomaFinalExamBlueprint as blueprint,
 oklahomaFinalExamVersion as version,oklahomaFinalExamPrimarySources as sources,
 oklahomaFinalExamReviewStatus as reviewStatus,validateOklahomaFinalExamBank,
 renderOklahomaFinalExamBank} from '../config/oklahoma/final-exam-bank.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const fallbackAt=args.indexOf('--curriculum-root');
const fallback=fallbackAt<0?root:path.resolve(args[fallbackAt+1]);
const check=args.includes('--check');
const norm=s=>s.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const sha=b=>createHash('sha256').update(b).digest('hex');
const resolveSource=rel=>existsSync(path.join(root,rel))?path.join(root,rel):path.join(fallback,rel);
const read=rel=>readFile(resolveSource(rel),'utf8');
validateOklahomaFinalExamBank(bank);
// Free practice reads the authored module files, not arbitrary sibling Markdown.
// Inline the relevant teaching so no tested supplement is hidden from those readers.
const supplementText=await read('oklahoma/curriculum/assessment-source-supplement.md');
const supplementSections=Object.fromEntries(supplementText.split(/^## /m).slice(1).map(chunk=>{
 const newline=chunk.indexOf('\n');return[chunk.slice(0,newline).trim(),chunk.slice(newline+1).trim()];
}));
const moduleSupplements={
 '03':['supervision','conflicts'],'09':['capacity','writing','electronic','forms'],
 '10':['trust'],'11':['finance'],'12':['closing','records'],
 '14':['authority','wholesaling','conflicts'],'15':['disclosure','lead','environment','wire'],
 '16':['trust','tenancy'],
};
const supplementAuthorities={capacity:['T15'],writing:['T15'],electronic:['FORM'],forms:['FORM','OREC'],
 finance:['CONV','FHA','VA','POINTS','AMORT'],closing:['CD','OREC'],records:['OREC'],authority:['OREC'],
 supervision:['OREC'],trust:['OREC'],wholesaling:['OREC'],disclosure:['T60','OREC'],lead:['LEAD'],
 environment:['RADON','ASBESTOS','FLOOD'],tenancy:['T41','FHACT','ACCOM'],wire:['FBI'],conflicts:['OREC','DOJ']};
for(const [module,sections]of Object.entries(moduleSupplements)){
 const rel=`oklahoma/curriculum/module-${module}.md`;
 const original=await read(rel);
 const start='<!-- OK-SOURCE-SUPPLEMENT:START -->',end='<!-- OK-SOURCE-SUPPLEMENT:END -->';
 const body=original.includes(start)?original.slice(0,original.indexOf(start)).trimEnd():original.trimEnd();
 const rendered=[start,'## Supplemental source review — 2026-09-06',
  'This required reading clarifies the existing topics; no additional clock-hour credit or regulator approval is claimed.',
  ...sections.map(section=>`### ${section}\n\n${supplementSections[section]}\n\nSources: ${supplementAuthorities[section].map(id=>`[${sources[id].title}](${sources[id].url})`).join('; ')}.`),end].join('\n\n');
 const desired=body+'\n\n'+rendered+'\n';
 if(check){if(original!==desired)throw new Error(`Stale in-module source supplement: ${rel}`);}
 else if(original!==desired){await mkdir(path.dirname(path.join(root,rel)),{recursive:true});await writeFile(path.join(root,rel),desired);}
}
const formative=(await import(pathToFileURL(resolveSource('config/oklahoma/module-question-bank.mjs')))).default;
const formativeItems=Object.entries(formative).flatMap(([module,v])=>[
 ...v.engagement.map((q,i)=>({...q,id:`${module}:engagement:${i+1}`})),
 ...v.remediation.map((q,i)=>({...q,id:`${module}:remediation:${i+1}`})),{...v.applied,id:`${module}:applied`},
]);
const duplicatePrompts=[],duplicateChoiceSets=[],referenceErrors=[];
for(const q of bank){
 for(const f of formativeItems){
  if(norm(q.prompt)===norm(f.prompt))duplicatePrompts.push([q.id,f.id]);
  if(q.choices.map(norm).sort().join('|')===f.choices.map(norm).sort().join('|'))duplicateChoiceSets.push([q.id,f.id]);
 }
 for(const ref of q.curriculumReferences){
  const text=await read(ref.path);
  for(const section of ref.sections){
   const found=text.split('\n').some(line=>line.startsWith('#')&&
    (line.includes(`${section} `)||line.endsWith(` ${section}`)));
   if(!found)referenceErrors.push([q.id,ref.path,section]);
  }
 }
}
if(duplicatePrompts.length||duplicateChoiceSets.length||referenceErrors.length)
 throw new Error(JSON.stringify({duplicatePrompts,duplicateChoiceSets,referenceErrors},null,2));
const words=s=>new Set(norm(s).split(' ').filter(w=>w.length>3));
const similarity=(a,b)=>{const intersection=[...a].filter(w=>b.has(w)).length;return intersection/new Set([...a,...b]).size;};
const nearPairs=[];
for(const q of bank){
 const qwords=words(q.prompt);let best={score:0};
 for(const f of formativeItems){const score=similarity(qwords,words(f.prompt));if(score>best.score)best={score,finalId:q.id,formativeId:f.id};}
 if(best.score>=0.35)nearPairs.push({...best,score:Number(best.score.toFixed(4))});
}
nearPairs.sort((a,b)=>b.score-a.score);
const counts=['A','B'].map(form=>{const qs=bank.filter(q=>q.form===form);return {
 form,items:qs.length,areaCounts:Object.fromEntries(Object.keys(blueprint).map(area=>[area,qs.filter(q=>q.area===area).length])),
 keyCounts:[0,1,2,3].map(key=>qs.filter(q=>q.correctChoice===key).length),
 uniquelyLongestCorrect:qs.filter(q=>q.choices.every((c,i)=>i===q.correctChoice||c.length<q.choices[q.correctChoice].length)).length,
 topicCoverage:Object.entries(blueprint).flatMap(([area,topics])=>topics.map((objective,i)=>{
  const topicId=`${area}.${String(i+1).padStart(2,'0')}`;
  return{topicId,objective,itemIds:qs.filter(q=>q.topicIds.includes(topicId)).map(q=>q.id)};
 })),
};});
const sourceFiles=[
 'config/oklahoma/final-exam-bank.mjs',
 ...['01-06','07-11','12-16','17-22'].map(p=>`config/oklahoma/final-exam/items-${p}.mjs`),
 'config/oklahoma/module-question-bank.mjs',
 ...Array.from({length:16},(_,i)=>`oklahoma/curriculum/module-${String(i+1).padStart(2,'0')}.md`),
 'oklahoma/curriculum/assessment-source-supplement.md',
 'scripts/build-oklahoma-final-exam.mjs',
];
const sourceHashes=await Promise.all(sourceFiles.map(async file=>({path:file,sha256:sha(await readFile(resolveSource(file)))})));
const pdfVerified={
 OREC:{sha256:'a5766871ca274ad2de31e53f3884ae05f0c0554ac648a947219389911d56b36a',pdfPages:109,edition:'As of November 1, 2025'},
 FORM:{sha256:'97ba5efd1dfd9ee924c38abb959e06bf00802d85f67f0f9945c8ee4faa467272',pdfPages:8,edition:'January 1, 2026',pagination:'One disclosure acknowledgment page plus seven printed Residential Sale pages'},
};
const finalMarkdown=renderOklahomaFinalExamBank();
const manifest={schemaVersion:1,version,reviewed:'2026-09-06',reviewStatus,
 supersedes:'Generic 300-item generated final bank and v2 distractor-length cue; all 300 IDs, correct answers and course approval/release controls are unchanged by v3',
 sourceHashes,renderedBankSha256:sha(finalMarkdown),
 primarySources:Object.entries(sources).map(([id,source])=>({id,...source,verifiedOn:'2026-09-06',
  ...(pdfVerified[id]?{verification:'Downloaded with normal TLS; edition, text and byte hash verified',...pdfVerified[id]}:
   id==='FHACT'?{verification:'2024 U.S. Code chapter text read through web tool; normal-TLS HTTP 200 PDF verified after replacing a broken HUD link; no retained-file byte lock',edition:'2024 U.S. Code, Title 42, Chapter 45',sha256:null}:
   {verification:'Official primary text read through web tool; no downloaded-file byte lock',sha256:null})})),
 limitation:'Titles 15/41/60 text was read on the Legislature website. Direct download failed local TLS certificate verification; no bypass and no fabricated PDF hash. This is a scoped source review, not a legal opinion or regulator approval.',
};
const audit={version,forms:counts,finalItems:bank.length,formativeItems:formativeItems.length,
 exactFormativePromptMatches:duplicatePrompts,exactFormativeChoiceSetMatches:duplicateChoiceSets,referenceErrors,
 lexicalReview:{metric:'Jaccard of normalized stem words longer than three characters',reportThreshold:0.35,nearPairs,
 limitation:'A low score cannot prove absence of semantic reuse. Flagged pairs require human review; source-based concept overlap is expected and is not itself a reused fact pattern.'},
 itemWritingControl:{uniquelyLongestCorrectMaximumPerForm:60,characterization:'Provider regression limit, not a regulator-prescribed or psychometric standard',repair:'75 distractors revised; correct answers, stems, rationales, IDs and objective assignments preserved'},
 limits:['No SME signoff','No psychometric equivalence evidence','No final administration authorization','The observed above-limit longest-answer cue is repaired and guarded; technical item-writing controls do not establish distractor performance or substantive approval'],
};
const outputs={
 'oklahoma/assessments/final-exam-bank.md':finalMarkdown,
 'oklahoma/assessments/final-exam-coverage.json':JSON.stringify(audit,null,2)+'\n',
 'oklahoma/assessments/final-exam-source-manifest.json':JSON.stringify(manifest,null,2)+'\n',
};
for(const [rel,content]of Object.entries(outputs)){
 const target=path.join(root,rel);
 if(check){if(await readFile(target,'utf8')!==content)throw new Error(`Stale generated final artifact: ${rel}`);}
 else{await mkdir(path.dirname(target),{recursive:true});await writeFile(target,content);}
}
console.log(JSON.stringify({mode:check?'check':'build',version,items:bank.length,forms:2,topicsPerForm:158,formativeItems:formativeItems.length,nearPairs:nearPairs.length,sourceFiles:sourceHashes.length}));
