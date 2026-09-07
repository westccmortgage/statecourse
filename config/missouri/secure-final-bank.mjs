// Proposed destination: config/missouri/secure-final-bank.mjs.
// Protected source only. Do not import from client code or publish the module tree.
import preA from './protected-final/missouri-preexam-final-a.mjs';
import preB from './protected-final/missouri-preexam-final-b.mjs';
import practiceA from './protected-final/missouri-mrep-final-a.mjs';
import practiceB from './protected-final/missouri-mrep-final-b.mjs';
import {finalize,authorities} from './protected-final/missouri-final-common.mjs';

const baseMrepObjectives=[
['01','Purpose, timing, and use of the Broker Disclosure Form'],['01','Consumer explanation and documentation'],
['02','Types of seller agency agreements'],['02','Elements of seller agency agreements'],['02','Property intake and disclosures'],['02','Pricing and marketing plan'],['02','Listing documentation'],['02','Applied listing file'],
['03','Types of buyer agency agreements'],['03','Elements of buyer agency agreements'],['03','Consumer consultation'],['03','Property search and showing'],['03','Offer strategy within authority'],['03','Applied buyer file'],
['04','Disclosed dual agency'],['04','Transaction broker role'],['04','Consent and confidentiality'],['04','Relationship conversion scenarios'],
['05','Termination of brokerage relationships'],['05','Compensation disclosures'],['05','Cooperation with other licensees'],['05','Procuring-cause and antitrust boundaries'],
['06','Duties to clients'],['06','Duties to customers'],['06','Confidentiality'],['06','Material-fact disclosure'],
['07','Pricing analysis'],['07','Market-data adjustments'],['07','Appraiser independence'],['07','CMA versus appraisal'],
['08','Types of financing'],['08','Loan-cost orientation'],['08','Estimating buyer closing costs'],['08','Estimating seller proceeds'],
['09','Offer preparation'],['09','Acceptance and counteroffers'],['09','Contingencies'],['09','Amendments and notices'],['09','Earnest-money handling'],['09','Disputes and documentation'],['09','Contract-to-closing timeline'],['09','Applied transaction file'],
['10','Fact verification'],['10','Statements and omissions'],['10','Advertising risk'],['10','Disclosure and escalation'],
['11','Construction systems and vocabulary'],['11','Condition observation and expert referral'],
].map(([id,label])=>`MO24-${id} — ${label}`);

const rowsByCourse={
  'mo-salesperson-preexam-48-v1':{kind:'preexam',title:'Missouri Salesperson Pre-Exam 48h',rows:[preA,preB],modules:9},
  'mo-real-estate-practice-24-v1':{kind:'mrep',title:'Missouri Real Estate Practice 24h',rows:[practiceA,practiceB],modules:6},
};
export const MISSOURI_SECURE_FINAL_COURSE_IDS=Object.freeze(Object.keys(rowsByCourse));
export const PREEXAM_PROVIDER_FORM_WEIGHTS=Object.freeze([4,6,8,8,7,5,4,5,3]);

export function getMissouriSecureFinalBank(courseId){
  const definition=rowsByCourse[courseId];
  if(!definition)throw new Error(`No authored Missouri secure final bank for ${courseId}`);
  const forms=definition.rows.map((rows,i)=>{
    const objectives=definition.kind==='mrep'?(i===0?[...baseMrepObjectives,...baseMrepObjectives.slice(0,2)]:[...baseMrepObjectives.slice(2),...baseMrepObjectives.slice(0,4)]):undefined;
    return {name:i===0?'A':'B',items:finalize(definition.kind,i===0?'A':'B',rows,objectives)};
  });
  const items=forms.flatMap(f=>f.items),seen=new Set();
  for(const form of forms){
    if(form.items.length!==50)throw new Error(`${courseId} Form ${form.name}: must have 50 authored items`);
    const counts={};
    for(const item of form.items){
      if(item.choices.length!==4||new Set(item.choices).size!==4||item.choices[item.correctChoice]!==item.answer)throw new Error(`${item.id}: invalid choices/key`);
      if(!item.prompt||!item.rationale||!item.section||!item.objective)throw new Error(`${item.id}: missing substantive content or reference`);
      if(/scenario variant|approved-course method|Which response best follows|The course method requires source control/.test(item.prompt+' '+item.rationale))throw new Error(`${item.id}: generic placeholder rejected`);
      const normalized=item.prompt.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      if(seen.has(normalized))throw new Error(`${item.id}: duplicate prompt across forms`);
      seen.add(normalized);counts[item.module]=(counts[item.module]||0)+1;
      for(const key of item.authority)if(!authorities[key])throw new Error(`${item.id}: unknown authority ${key}`);
    }
    for(let m=1;m<=definition.modules;m++){
      const module=`module-${String(m).padStart(2,'0')}`;
      if(!counts[module])throw new Error(`${courseId} Form ${form.name}: missing ${module}`);
      if(definition.kind==='preexam'&&counts[module]!==PREEXAM_PROVIDER_FORM_WEIGHTS[m-1])throw new Error(`${courseId} Form ${form.name}: provider blueprint mismatch for ${module}`);
    }
    if(definition.kind==='mrep')for(const topic of 'ABCDEFGHIJKLMNOP')if(!form.items.some(item=>item.topic===topic))throw new Error(`${courseId} Form ${form.name}: missing Commission topic ${topic}`);
  }
  return {courseId,title:definition.title,version:'2026-09-06-substantive-replacement-v1',confidential:true,approvalStatus:'not-approved',reviewStatus:'authored-proposal-awaiting-independent-SME-and-regulatory-review',blueprintBasis:definition.kind==='preexam'?'Provider-designed weights covering all nine authored modules; not a claim of PSI examination-weight equivalence.':'Provider-designed item allocation covering all sixteen Commission MREP topics in each form.',forms,items};
}

export function renderMissouriSecureFinalBank(courseId){
  const bank=getMissouriSecureFinalBank(courseId);
  const out=[`# ${bank.title} — Secure Final Examination Bank`,'','**CONFIDENTIAL — DO NOT PUBLISH IN THE STUDENT BUILD**','',`Version: ${bank.version}. Two forms; 50 items each; 100 substantive authored items total. Regulatory approval, independent subject-matter review, and empirical item validation remain release gates.`, '',bank.blueprintBasis,'','The correct key, distractors, explanation, and source/curriculum references are protected reviewer material. These are school-authored examination proposals, not PSI licensing-examination items.',''];
  for(const form of bank.forms)for(const item of form.items){
    out.push(`## Form ${form.name} · Item ${String(item.number).padStart(3,'0')}`,'',`**Objective:** ${item.objective}`,'',item.prompt,'',...item.choices.map((choice,i)=>`${'ABCD'[i]}. ${choice}`),'',`**Key:** ${item.key}`,'',`**Rationale:** ${item.rationale}`,'',`**Curriculum reference:** \`${item.curriculumPath}\` § ${item.section}.`,'');
    if(item.authority.length)out.push('**Authority:** '+item.authority.map(key=>`[${authorities[key][0]}](${authorities[key][1]})`).join('; ')+'.','');
    else out.push('**Source basis:** The identified authored curriculum section. Numerical transaction inputs are explicit hypothetical assumptions; no unstated Missouri deadline, tax rate, fee, or underwriting threshold is asserted.','');
  }
  return out.join('\n');
}
