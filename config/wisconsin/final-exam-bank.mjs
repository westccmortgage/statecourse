// Protected final bank. Import only from server-side/admin authoring tools.
import crypto from 'node:crypto';
import authored, {bankVersion, allocation} from './final-exam-authoring.mjs';
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const normalize = s => s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const positions = Array.from({length:100},(_,i)=>i%4);
let randomState=0x5190626;
const rand = n => { randomState ^= randomState << 13; randomState ^= randomState >>> 17; randomState ^= randomState << 5; return (randomState >>> 0) % n; };
for(let i=positions.length-1;i>0;i--) { const j=rand(i+1); [positions[i],positions[j]]=[positions[j],positions[i]]; }

function validateAuthored(items) {
  if(items.length!==100) throw Error('Wisconsin Form A must contain exactly 100 authored items');
  const seen=new Set();
  for(const [i,x] of items.entries()) {
    if(!Number.isInteger(x.module)||x.module<1||x.module>13||!Number.isInteger(x.topic)||x.topic<1||x.topic>19) throw Error(`WI ${i+1}: invalid module/topic`);
    if(!x.section||!x.title||!x.prompt||!x.rationale) throw Error(`WI ${i+1}: missing content/reference`);
    if(x.choices.length!==4||new Set(x.choices.map(normalize)).size!==4) throw Error(`WI ${i+1}: four unique choices required`);
    const key=normalize(x.prompt); if(seen.has(key)) throw Error(`WI ${i+1}: duplicate stem`); seen.add(key);
    if(/scenario variant|approved-course method|Rely on a customary practice from another state|The course method requires source control/i.test(JSON.stringify(x))) throw Error(`WI ${i+1}: prohibited generic placeholder`);
  }
  if(new Set(items.map(x=>x.topic)).size!==19) throw Error('Wisconsin final omits a required curriculum topic');
  allocation.forEach((count,i)=> { if(items.filter(x=>x.module===i+1).length!==count) throw Error(`WI-${i+1}: allocation drift`); });
}
validateAuthored(authored);
export const wisconsinFinalExamBank = authored.map((x,i)=> {
  const options=x.choices.slice(1); options.splice(positions[i],0,x.choices[0]);
  return {...x,id:`WI-FINAL-A-${String(i+1).padStart(3,'0')}`,form:'A',number:i+1,choices:options,correctChoice:positions[i],bankVersion};
});
export const wisconsinFinalMetadata = {
  version:bankVersion,forms:1,itemsPerForm:100,passingPercent:75,
  passingPercentCharacterization:'provider_proposal_pending_approval',
  allocationCharacterization:'provider_defined_not_state_exam_blueprint',allocation,
  topics:[...new Set(authored.map(x=>x.topic))].sort((a,b)=>a-b),
  authoredContentSha256:sha(JSON.stringify(authored)),
  deliveredContentSha256:sha(JSON.stringify(wisconsinFinalExamBank)),
  replaces:'100 generic all-key-B placeholders with truncated WI-01–WI-09 objective map',
  approved:false,instructorSigned:false,psychometricallyValidated:false,public:false,
};
function authorityLinks(law) {
  if(!law) return null;
  const refs=[];
  for(const match of law.matchAll(/REEB\s+(\d+)\.(\d+)/g)) refs.push(`https://docs.legis.wisconsin.gov/code/admin_code/reeb/${match[1]}/${match[2]}`);
  for(const match of law.matchAll(/452\.(\d+)/g)) refs.push(`https://docs.legis.wisconsin.gov/statutes/statutes/452/${match[1]}`);
  if(law.includes('106.50')) refs.push('https://docs.legis.wisconsin.gov/statutes/statutes/106/iii/50');
  if(law.includes('ATCP 134')) refs.push('https://docs.legis.wisconsin.gov/code/admin_code/atcp/090/134');
  if(law.includes('WB-1')) refs.push('https://dsps.wi.gov/Documents/BoardCouncils/REB/Forms/WB-1.pdf');
  return [...new Set(refs)].map(url=>`[Official source](${url})`).join('; ');
}
export function renderWisconsinFinalExamBank() {
  validateAuthored(authored);
  const out=['# Wisconsin Salesperson Pre-License — Secure Final Examination Bank','','**CONFIDENTIAL — DO NOT PUBLISH IN THE STUDENT BUILD**','',
    `Bank version: ${bankVersion}. Form A; 100 authored items. Proposed pass standard: 75%, a StateCourse control pending review. No regulatory approval, instructor sign-off, or psychometric validation is claimed.`,
    `Authored content SHA-256: ${wisconsinFinalMetadata.authoredContentSha256}. Delivered content SHA-256: ${wisconsinFinalMetadata.deliveredContentSha256}.`,
    '','This replaces the generic bank and its incomplete objective mapping. Allocation covers all 13 modules and 19 course topics and is provider-defined, not a mandated state examination blueprint. Legal references were checked as described in ../regulatory/legal-source-review-2026-09-06.md. Curricular rule citations establish required topics; general concepts are grounded in the lesson references, and calculations use the expressly supplied assumptions.',''];
  for(const x of wisconsinFinalExamBank) {
    const mod=String(x.module).padStart(2,'0');
    out.push(`## Form A · Item ${String(x.number).padStart(3,'0')}`,'',`**Objective:** WI-${mod} — ${x.title}`,'',x.prompt,'',...x.choices.map((c,i)=>`${String.fromCharCode(65+i)}. ${c}`),'',`**Key:** ${String.fromCharCode(65+x.correctChoice)}`,'',`**Rationale:** ${x.rationale}`,'',`**Curriculum reference:** wisconsin/curriculum/module-${mod}.md, section ${x.section}.`,`**Curricular topic authority:** [REEB 25.033(${x.topic})](https://docs.legis.wisconsin.gov/code/admin_code/reeb/25/033) (topic coverage, not a source for a provider-defined allocation).`,...(x.law?[`**Controlling rule/form reference:** ${x.law}. ${authorityLinks(x.law)}`]:[]),'');
  }
  return out.join('\n');
}
export default wisconsinFinalExamBank;
