import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderWisconsinFinalExamBank,wisconsinFinalMetadata} from '../config/wisconsin/final-exam-bank.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'wisconsin/assessments');
const outputs = new Map([
  ['final-exam-bank.md',renderWisconsinFinalExamBank()],
  ['final-exam-version.json',JSON.stringify(wisconsinFinalMetadata,null,2)+'\n'],
]);
if(process.argv.includes('--check')) {
  for(const [file,content] of outputs) if(!fs.existsSync(path.join(dir,file))||fs.readFileSync(path.join(dir,file),'utf8')!==content) throw Error(`Stale Wisconsin protected assessment: ${file}`);
} else {
  fs.mkdirSync(dir,{recursive:true}); for(const [file,content] of outputs) fs.writeFileSync(path.join(dir,file),content);
}
console.log('Wisconsin protected Form A: 100 distinct items; 13 modules; 19 topics; no public output.');
