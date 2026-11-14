import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {sha,numericTokens,referenceTokens} from './free-practice-translation-source.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [sourceFile,resultFile]=process.argv.slice(2);
if(!sourceFile||!resultFile)throw Error('Usage: node scripts/import-free-practice-spanish.mjs sources.json translated.jsonl');
const courses=JSON.parse(fs.readFileSync(sourceFile,'utf8'));
const translated=new Map(fs.readFileSync(resultFile,'utf8').split('\n').filter(Boolean).map(line=>{const x=JSON.parse(line);return[x.id,x];}));
const numbers=numericTokens;
const summary=[];
for(const course of courses){
 const translations=[],review=[];
 for(const source of course.strings){
  const row=translated.get(sha(source));if(row?.segmentation_version!==2||!Number.isInteger(row.source_segments)||row.source_segments<1||row.source_segments!==row.translated_segments)continue;
  const target=row.text;if(!target?.trim())continue;
  if(JSON.stringify(numbers(source))!==JSON.stringify(numbers(target))||JSON.stringify(referenceTokens(source))!==JSON.stringify(referenceTokens(target)))review.push({source,reason:'numeric-or-reference-mismatch'});
  translations.push([source,target]);
 }
 const complete=translations.length===course.strings.length&&review.length===0;
 const data={course_id:course.course_id,source_revision:course.revision,segmentation_version:2,status:complete?'draft-complete':'translation-in-progress',method:'Local machine translation; human linguistic and subject-matter review OPEN',source_files:course.files,translations,notation_review_required:review,human_review:{linguistic:'OPEN',sme:'OPEN',learner_duration:'OPEN'}};
 fs.writeFileSync(path.join(root,'locales/es/free-practice',course.course_id+'.json'),JSON.stringify(data)+'\n');
 summary.push({course:course.course_id,translated:translations.length,total:course.strings.length,numeric_review:review.length,status:data.status});
}
console.log(JSON.stringify(summary,null,2));
