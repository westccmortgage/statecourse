import fs from 'node:fs';
import path from 'node:path';
import { collectPracticeTranslation,numericTokens,referenceTokens } from './free-practice-translation-source.mjs';
export function publishPracticeLocales(root,manifest,write){
  const folder=path.join(root,'locales/es/free-practice');
  const ui=JSON.parse(fs.readFileSync(path.join(folder,'interface.json'),'utf8'));

  const availability=[];
  const pending=sample=>{write('free-practice/locales/es/'+sample.course_id+'.json',JSON.stringify({course_id:sample.course_id,source_revision:sample.revision,status:'translation-in-progress',translations:[]})+'\n');availability.push({course_id:sample.course_id,status:'pending'});};
  for(const sample of manifest.samples){
    const file=path.join(folder,sample.course_id+'.json');
    if(!fs.existsSync(file)){pending(sample);continue;}
    const data=JSON.parse(fs.readFileSync(file,'utf8'));
    if(data.status!=='draft-complete'){pending(sample);continue;}
    const source=collectPracticeTranslation(root,sample),translations=new Map(data.translations);
    if(JSON.stringify(data.source_files)!==JSON.stringify(source.files))throw Error('Spanish source trace mismatch');
    if(data.segmentation_version!==2)throw Error('Spanish segmentation coverage missing');
    if(data.course_id!==sample.course_id||data.source_revision!==source.revision)throw Error('Stale Spanish practice: '+sample.course_id);
    if(source.strings.some(s=>translations.has(s)&&JSON.stringify(referenceTokens(s))!==JSON.stringify(referenceTokens(translations.get(s)))))throw Error('Spanish reference mismatch: '+sample.course_id);
    if(data.translations.length!==translations.size)throw Error('Duplicate translation source');
    if(source.strings.some(s=>translations.has(s)&&JSON.stringify(numericTokens(s))!==JSON.stringify(numericTokens(translations.get(s)))))throw Error('Spanish numeric mismatch: '+sample.course_id);
    if(translations.size!==source.strings.length||source.strings.some(s=>!translations.get(s)?.trim()))throw Error('Incomplete Spanish practice: '+sample.course_id);
    // Only strings from the public formative projection can reach this export.
    if([...translations.keys()].some(s=>!source.strings.includes(s)))throw Error('Unexpected translation source');
    if(translations.has(sample.course_title))ui.translations.push([sample.course_title,translations.get(sample.course_title)]);
    write('free-practice/locales/es/'+sample.course_id+'.json',JSON.stringify(data)+'\n');
    availability.push({course_id:sample.course_id,status:'draft-complete'});
  }
  write('free-practice/locales/es/interface.json',JSON.stringify(ui)+'\n');
  write('free-practice/locales/es/availability.json',JSON.stringify({language:'es',courses:availability})+'\n');
  return availability;
}
