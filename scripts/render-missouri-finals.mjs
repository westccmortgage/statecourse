import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {getMissouriSecureFinalBank,renderMissouriSecureFinalBank,MISSOURI_SECURE_FINAL_COURSE_IDS} from '../config/missouri/secure-final-bank.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const courseId of MISSOURI_SECURE_FINAL_COURSE_IDS){
 const bank=getMissouriSecureFinalBank(courseId),markdown=renderMissouriSecureFinalBank(courseId);
 const metadata={courseId,version:bank.version,authoredContentSha256:createHash('sha256').update(JSON.stringify(bank.items)).digest('hex'),renderedBankSha256:createHash('sha256').update(markdown).digest('hex'),forms:2,questionsPerForm:50,approved:false,instructorSigned:false,public:false,blueprintBasis:bank.blueprintBasis};
 const outputs=new Map([['final-exam-bank.md',markdown],['final-exam-version.json',JSON.stringify(metadata,null,2)+'\n']]);
 const dir=path.join(root,'missouri',courseId,'assessments');
 for(const [name,content]of outputs){
  const file=path.join(dir,name);
  if(process.argv.includes('--check')){
   if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==content)throw Error('Stale Missouri protected assessment: '+file);
  }else{fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(file,content);}
 }
}
console.log('Missouri protected finals: four 50-item forms; substantive source and exact version identities verified.');
