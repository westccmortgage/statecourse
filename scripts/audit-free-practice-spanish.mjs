// Candidate queue only: lexical matches require contextual editorial review.
// Passing this scan is not evidence of correct legal meaning or human approval.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha } from './free-practice-translation-source.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'locales/es/free-practice');
const rules=[
 ['earnest-money-literal', /\bearnest money\b/i, /dinero serio|earnest dinero|dinero en efectivo/i],
 ['principal-as-director', /\bprincipals?\b/i, /\bdirector(?:es)?\b/i],
 ['parcel-as-package', /\bparcels?\b/i, /\bpaquetes?\b/i],
 ['client-customer-collapsed', /\bclient\b.*\bcustomer\b|\bcustomer\b.*\bclient\b/i, /cliente y cliente|cliente tanto como a un cliente|cliente y del cliente/i],
 ['void-as-empty', /\bvoid(?:able)?\b/i, /\bvac[ií][oa]s?\b/i],
];
const findings=new Map();let courses=0;
for(const name of fs.readdirSync(dir).sort()){
 if(!name.endsWith('.json'))continue;
 const data=JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
 if(!data.course_id)continue;courses++;
 for(const [source,target] of data.translations){
  const flags=rules.filter(([,a,b])=>a.test(source)&&b.test(target)).map(([id])=>id);
  if(!flags.length)continue;
  const id=sha(source);let row=findings.get(id);
  if(!row){row={id,source,target,flags,courses:[]};findings.set(id,row);}
  row.courses.push(data.course_id);
 }
}
const rows=[...findings.values()];
const report={status:'EDITORIAL_REVIEW_REQUIRED',scope:'Lexical candidates only; not an exhaustive semantic audit',courses,unique_candidates:rows.length,counts:Object.fromEntries(rules.map(([id])=>[id,rows.filter(r=>r.flags.includes(id)).length])),human_linguistic_review:'OPEN',state_sme_review:'OPEN',findings:rows};
const output=process.argv[2];
if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,findings:undefined},null,2));
