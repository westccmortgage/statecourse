/** Protected, build-time Oklahoma final assessment source. Never ship to public practice.
 * This is authored review material, not proof of approval, psychometric validity or exam release.
 */
import first from './final-exam/items-01-06.mjs';
import second from './final-exam/items-07-11.mjs';
import third from './final-exam/items-12-16.mjs';
import fourth from './final-exam/items-17-22.mjs';

export const oklahomaFinalExamVersion = 'OK-FINAL-2026-09-06-v3';
// Provider item-writing regression limit, not a regulator-prescribed or psychometric standard.
export const oklahomaUniquelyLongestCorrectLimit = 60;
export const oklahomaFinalExamReviewStatus = Object.freeze({
  authoringComplete: true, regulatorApproved: false, smeSignoff: false,
  psychometricValidation: false, authorizedForAdministration: false,
});

// OREC prescribes 22 areas, not these 158 subtopic labels or their item weights.
// Preserve the repository's 158-topic blueprint while covering every topic on EACH form.
export const oklahomaFinalExamBlueprint = Object.freeze({
 'OK-01':['Economic characteristics of real estate','Supply and demand','Market cycles','Neighborhood and market analysis','Investment and tax orientation'],
 'OK-02':['Land and improvements','Real versus personal property','Fixtures','Physical and economic characteristics','Property classifications'],
 'OK-03':['Bundle of rights','Freehold estates','Leasehold estates','Concurrent ownership','Easements','Liens and encumbrances','Mineral-interest exclusion orientation'],
 'OK-04':['Metes and bounds','Rectangular survey','Lot and block','Measurements and description review'],
 'OK-05':['Public records','Title search','Title defects','Liens','Easements and covenants','Government powers','Zoning','Subdivision controls','Oklahoma land-use case'],
 'OK-06':['Deeds','Delivery and acceptance','Recording','Title evidence','Voluntary transfer','Involuntary transfer','Probate orientation'],
 'OK-07':['Brokerage service contracts','Listing agreements','Buyer agreements','Property management agreements','Termination','Compensation terms'],
 'OK-08':['Buyer costs','Seller costs','Prorations','Commissions','Tax and recording items','Net proceeds'],
 'OK-09':['Value principles','Highest and best use','Sales comparison','Cost approach','Income approach','Depreciation','CMA scope'],
 'OK-10':['Property marketing plans','Advertising standards','Prospecting','Showing practices','Offers and communication','Records'],
 'OK-11':['Federal protected classes','Prohibited conduct','Advertising','Steering and redlining','Disability accommodations','Fair service case'],
 'OK-12':['Contract classifications','Formation','Capacity','Consideration','Lawful purpose','Statute of Frauds','Electronic contracting'],
 'OK-13':['Performance','Assignment and novation','Default','Breach','Remedies','Contingencies','Termination','Contract case'],
 'OK-14':['Oklahoma contract forms','Offer preparation','Counteroffers','Acceptance','Addenda','Amendments','Notices','Inspection contingencies','Financing contingencies','Transaction timeline'],
 'OK-15':['Notes and mortgages','Loan markets','Conventional loans','FHA and VA orientation','Qualification','LTV and ratios','Interest and amortization','Points','Mortgage insurance','Default','Financing fraud','Finance case'],
 'OK-16':['Pre-closing process','Title work','Settlement documents','Prorations','Closing Disclosure','Possession and keys','File closeout'],
 'OK-17':['Oklahoma License Code','Commission authority','License categories','Broker supervision','Trust accounts','Advertising','Records','Discipline','Wholesaler provisions','Required pre-enrollment notices'],
 'OK-18':['Property-condition disclosure','Material facts','Lead-based paint','Radon and asbestos','Flood and environmental risk','Expert referral','Disclosure case'],
 'OK-19':['Lease formation','Landlord and tenant duties','Management agreements','Rent and deposits','Maintenance','Risk management','Fair housing in management'],
 'OK-20':['Errors and omissions','Documentation','Safety','Fraud prevention','Cyber and wire risk','Escalation'],
 'OK-21':['Competence','Honesty and disclosure','Conflicts','Confidentiality','Cooperation','Disciplinary scenarios'],
 'OK-22':['Agency creation','Oklahoma Broker Relationships Act','Duties','Clients and customers','Brokerage relationships','Consent','Confidentiality','Compensation','Termination','Integrated agency case'],
});

export const oklahomaFinalExamPrimarySources = Object.freeze({
 OREC:{title:'OREC License Code and Rules, as of November 1, 2025',url:'https://oklahoma.gov/content/dam/ok/en/orec/documents/meetings/Nov%201%202025%20Oklahoma%20Real%20Estate%20Commission%20Code%20and%20Rules%20Book.pdf'},
 T15:{title:'Oklahoma Legislature, Title 15 — Contracts',url:'https://www.oklegislature.gov/OK_Statutes/CompleteTitles/os15.pdf'},
 T60:{title:'Oklahoma Legislature, Title 60 — Property',url:'https://www.oklegislature.gov/OK_Statutes/CompleteTitles/os60.pdf'},
 T41:{title:'Oklahoma Legislature, Title 41 — Landlord and Tenant',url:'https://www.oklegislature.gov/OK_Statutes/CompleteTitles/os41.pdf'},
 FORM:{title:'OREC Residential Sale, January 1, 2026',url:'https://oklahoma.gov/content/dam/ok/en/orec/documents/contracts-and-forms-page/2026-contract-forms/2026%20Residential%20Sale.pdf'},
 HUD:{title:'HUD — Fair Housing Act overview',url:'https://www.hud.gov/helping-americans/fair-housing-act-overview'},
 FHACT:{title:'U.S. Code (2024), Title 42, Chapter 45 — Fair Housing',url:'https://www.govinfo.gov/content/pkg/USCODE-2024-title42/pdf/USCODE-2024-title42-chap45.pdf'},
 ACCOM:{title:'HUD/DOJ — Reasonable Accommodations',url:'https://www.hud.gov/sites/documents/huddojstatement.pdf'},
 LEAD:{title:'EPA — Real Estate Disclosures About Potential Lead Hazards',url:'https://www.epa.gov/lead/real-estate-disclosures-about-potential-lead-hazards'},
 RADON:{title:'EPA — Home Buyer’s and Seller’s Guide to Radon',url:'https://www.epa.gov/sites/default/files/2015-05/documents/hmbuygud.pdf'},
 ASBESTOS:{title:'EPA — Protect Your Family from Exposures to Asbestos',url:'https://www.epa.gov/asbestos/protect-your-family-exposures-asbestos'},
 FLOOD:{title:'FEMA NFIP — Flood Zones and Maps',url:'https://www.floodsmart.gov/flood-zones-and-maps/what-is-my-flood-zone'},
 CD:{title:'Regulation Z, 12 CFR 1026.19',url:'https://www.consumerfinance.gov/rules-policy/regulations/1026/19/'},
 CONV:{title:'CFPB — What is a conventional loan?',url:'https://www.consumerfinance.gov/ask-cfpb/what-is-a-conventional-loan-en-117/'},
 FHA:{title:'CFPB — What is an FHA loan?',url:'https://www.consumerfinance.gov/ask-cfpb/what-is-an-fha-loan-en-112/'},
 VA:{title:'CFPB — What is a VA loan?',url:'https://www.consumerfinance.gov/ask-cfpb/what-is-a-va-loan-en-113/'},
 POINTS:{title:'CFPB — Lender credits and points',url:'https://www.consumerfinance.gov/ask-cfpb/how-should-i-use-lender-credits-and-points-also-called-discount-points-en-136/'},
 AMORT:{title:'CFPB — How paying down a mortgage works',url:'https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/'},
 IRS:{title:'IRS Publication 527 — Residential Rental Property',url:'https://www.irs.gov/publications/p527'},
 FTC:{title:'FTC — Complying with the Telemarketing Sales Rule',url:'https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule'},
 DOJ:{title:'DOJ — United States v. Atlanta Real Estate Board, horizontal price fixing',url:'https://www.justice.gov/atr/case/us-v-atlanta-real-estate-board'},
 FBI:{title:'FBI — Business Email Compromise',url:'https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams/business-email-compromise'},
 SURVEY:{title:'Oklahoma Corporation Commission — Royalty Owners Booklet, land survey explanation',url:'https://oklahoma.gov/content/dam/ok/en/occ/documents/og/pubasst/Royalty-Owners-Booklet-112020.pdf'},
});

// Per-topic substantive authorities. Empty entries deliberately mean an authored
// property/valuation concept or a fully specified hypothetical calculation, NOT
// an invented statutory rule. Every item separately cites its exact curriculum sections.
const authorities = {
 'OK-01.5':[['IRS','Rental income, expenses and depreciation']],
 'OK-02.1':[['T60','60 O.S. 4–9']], 'OK-02.2':[['T60','60 O.S. 5–9']], 'OK-02.3':[['T60','60 O.S. 7']],
 'OK-03.1':[['T60','60 O.S. 1, 22–30']], 'OK-03.2':[['T60','60 O.S. 22–27']], 'OK-03.3':[['T60','60 O.S. 22, 26']],
 'OK-03.4':[['T60','60 O.S. 74']], 'OK-03.5':[['T60','60 O.S. 50–54']], 'OK-03.7':[['OREC','59 O.S. 858-102(1)']],
 'OK-04.2':[['SURVEY','The United States Land Survey System']],
 'OK-07.1':[['OREC','59 O.S. 858-353, 858-355.1(A), 858-363']], 'OK-07.3':[['OREC','59 O.S. 858-355.1']],
 'OK-07.5':[['OREC','59 O.S. 858-358']], 'OK-07.6':[['OREC','59 O.S. 858-353(A)(7)']],
 'OK-09.7':[['OREC','59 O.S. 858-312(13)']],
 'OK-10.1':[['OREC','59 O.S. 858-312(2)']], 'OK-10.2':[['OREC','59 O.S. 858-312(2), (20)']],
 'OK-10.3':[['FTC','Do Not Call provisions and company-specific suppression']], 'OK-10.5':[['OREC','59 O.S. 858-353(A)(2)']],
 'OK-11.1':[['FHACT','42 U.S.C. 3602(k), 3604(a)–(b)']], 'OK-11.2':[['FHACT','42 U.S.C. 3604(a)–(d)']],
 'OK-11.3':[['FHACT','42 U.S.C. 3604(c)']], 'OK-11.4':[['FHACT','42 U.S.C. 3604, 3605']],
 'OK-11.5':[['ACCOM','Questions 3, 6, 11–13, 17–18']], 'OK-11.6':[['FHACT','42 U.S.C. 3604(b), (f)']],
 'OK-12.1':[['T15','15 O.S. 2, 131–133']], 'OK-12.2':[['T15','15 O.S. 66–71']],
 'OK-12.3':[['T15','15 O.S. 2, 24']], 'OK-12.4':[['T15','15 O.S. 106–110']],
 'OK-12.5':[['T15','15 O.S. 102–104']], 'OK-12.6':[['T15','15 O.S. 136(4)']],
 'OK-12.7':[['FORM','Contract Documents and Parties, printed page 1']],
 'OK-13.1':[['T15','15 O.S. 2; agreed performance terms']], 'OK-13.2':[],
 'OK-13.3':[['T15','15 O.S. 152–155; stated contract obligations']], 'OK-13.4':[['T15','15 O.S. 152–155; stated contract obligations']],
 'OK-13.5':[['T15','15 O.S. 214–215; liquidated-damages analysis']], 'OK-13.6':[['T15','15 O.S. 152–155; expressly supplied hypothetical terms']],
 'OK-13.7':[['T15','15 O.S. 73, 232–233']], 'OK-13.8':[['T15','15 O.S. 53, 58, 63']],
 'OK-14.1':[['FORM','Contract Documents, printed page 1'],['OREC','59 O.S. 858-208(14)']],
 'OK-14.3':[['T15','15 O.S. 71']], 'OK-14.4':[['FORM','Parties, printed page 1'],['T15','15 O.S. 68–69']],
 'OK-14.5':[['FORM','Contract Documents, printed page 1']], 'OK-14.6':[['T15','15 O.S. 237']],
 'OK-15.3':[['CONV','Definition and variation by product']], 'OK-15.4':[['FHA','Insurance and underwriting'],['VA','Guaranty and eligibility']],
 'OK-15.7':[['AMORT','Interest and principal allocation']], 'OK-15.8':[['POINTS','One point is one percent of loan amount']],
 'OK-15.9':[['CONV','Mortgage insurance distinction']], 'OK-15.11':[['OREC','59 O.S. 858-312(2), (19), (22)']],
 'OK-15.12':[['POINTS','Comparing upfront costs and interest savings']],
 'OK-16.5':[['CD','12 CFR 1026.19(f)(2)(ii)']], 'OK-16.7':[['OREC','59 O.S. 858-358, 858-364']],
 'OK-17.1':[['OREC','59 O.S. 858-102, 858-301, 858-309']], 'OK-17.2':[['OREC','59 O.S. 858-208(6), (11)']],
 'OK-17.3':[['OREC','59 O.S. 858-102(8), 858-363']], 'OK-17.4':[['OREC','59 O.S. 858-310(B), 858-363; OAC 605:10-9-1']],
 'OK-17.5':[['OREC','59 O.S. 858-312(6), (16); OAC 605:10-13-1(k)']], 'OK-17.6':[['OREC','59 O.S. 858-312(2), (11)']],
 'OK-17.7':[['OREC','OAC 605:10-13-1(l)']], 'OK-17.8':[['OREC','59 O.S. 858-312(26)']],
 'OK-17.9':[['OREC','59 O.S. 858-301, 858-314(C)']], 'OK-17.10':[['OREC','OAC 605:10-5-1(m)']],
 'OK-18.1':[['T60','60 O.S. 832(10), 833(A)(1)']], 'OK-18.2':[['T60','60 O.S. 836(C), (E)'],['OREC','59 O.S. 858-353(A)(4)–(5)']],
 'OK-18.3':[['LEAD','Required records, reports and inspection opportunity']], 'OK-18.4':[['RADON','Testing and sensory detection'],['ASBESTOS','Do not disturb suspect materials']],
 'OK-18.5':[['FLOOD','Risk outside mapped high-risk zones']], 'OK-18.7':[['T60','60 O.S. 834(B)–(D)']],
 'OK-19.2':[['T41','41 O.S. 118(A), 127']], 'OK-19.4':[['T41','41 O.S. 115']],
 'OK-19.5':[['T41','41 O.S. 118(A)']], 'OK-19.7':[['FHACT','42 U.S.C. 3604(b), (f)'],['ACCOM','Accommodation requests during tenancy']],
 'OK-20.2':[['OREC','59 O.S. 858-353(A)(1), (3); OAC 605:10-13-1(h)']],
 'OK-20.4':[['OREC','59 O.S. 858-351(3), 858-312(2), (19)']], 'OK-20.5':[['FBI','Prevention, independent verification and immediate bank reporting']],
 'OK-21.1':[['OREC','59 O.S. 858-353(A)(1), 858-312(25)']], 'OK-21.2':[['OREC','59 O.S. 858-312(2), 858-353(A)(1)']],
 'OK-21.3':[['OREC','59 O.S. 858-312(3), 858-355.1(D)']], 'OK-21.4':[['OREC','59 O.S. 858-353(A)(4)']],
 'OK-21.5':[['DOJ','Horizontal price fixing'],['OREC','59 O.S. 858-359(D)']], 'OK-21.6':[['OREC','59 O.S. 858-312(18), (21)']],
 'OK-22.1':[['OREC','59 O.S. 858-360(A)–(C)']], 'OK-22.2':[['OREC','59 O.S. 858-360, 858-361']],
 'OK-22.3':[['OREC','59 O.S. 858-353(A)–(B)']], 'OK-22.4':[['OREC','59 O.S. 858-351(5)–(6), 858-353(B)']],
 'OK-22.5':[['OREC','59 O.S. 858-355.1(D)–(E)']], 'OK-22.6':[['OREC','59 O.S. 858-355.1(C), 858-356']],
 'OK-22.7':[['OREC','59 O.S. 858-353(A)(4)']], 'OK-22.8':[['OREC','59 O.S. 858-359(A), (D)']],
 'OK-22.9':[['OREC','59 O.S. 858-358']], 'OK-22.10':[['OREC','59 O.S. 858-353(A)(3)–(4), (C), 858-355.1(E)']],
};

export const oklahomaFinalExamAuthoredPairs = [...first,...second,...third,...fourth];
const normalize = text => text.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const prohibited = /scenario variant|approved-course method|rely on customary practice from another state|treat payment or course completion as authority|check the current primary source|omit the issue unless/i;

function parseCurriculumRefs(value) {
 return value.split(';').map(segment => {
  const [module,sections] = segment.split(':');
  if (module === 'SUP') return {path:'oklahoma/curriculum/assessment-source-supplement.md', sections:[sections]};
  return {path:`oklahoma/curriculum/module-${module}.md`, sections:sections.split(',')};
 });
}

function compile() {
 const result=[];
 for (const [formIndex,form] of ['A','B'].entries()) {
  // Reproducible Fisher–Yates permutation of an exactly balanced key pool.
  // This is not cryptographic randomness and must never be used for live exam selection.
  let seed = formIndex === 0 ? 0x4f4b4132 : 0x4f4b4232;
  const keys = Array.from({length:150},(_,i)=>i%4);
  for(let i=keys.length-1;i>0;i--){
   seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
   const j=(seed>>>0)%(i+1); [keys[i],keys[j]]=[keys[j],keys[i]];
  }
  for (const [index,pair] of oklahomaFinalExamAuthoredPairs.entries()) {
   const [area,topicIndexes,refs] = pair;
   const [prompt,authoredChoices,rationale] = pair[3+formIndex];
   const correctChoice=keys[index];
   const choices=Array.from({length:4},(_,position)=>authoredChoices[(position-correctChoice+4)%4]);
   const topicIds=topicIndexes.map(n=>`${area}.${String(n).padStart(2,'0')}`);
   const authorityReferences=topicIndexes.flatMap(n=>(authorities[`${area}.${n}`]??[])).filter((r,i,a)=>a.findIndex(x=>x.join('|')===r.join('|'))===i).map(([source,locator])=>({source,locator,...oklahomaFinalExamPrimarySources[source]}));
   result.push({id:`OK-FINAL-${form}-${String(index+1).padStart(3,'0')}`,form,item:index+1,area,topicIds,
    objectives:topicIndexes.map(n=>oklahomaFinalExamBlueprint[area]?.[n-1]),prompt,choices,correctChoice,rationale,
    curriculumReferences:parseCurriculumRefs(refs),authorityReferences,
    authorityScope:`OAC 605:10-3-1(a)(1)(${String.fromCharCode(64+Number(area.slice(3)))}) establishes the study area; it is not a source for illustrative numbers or a claim that these 158 subtopics are prescribed.`,
   });
  }
 }
 return result;
}

export function validateOklahomaFinalExamBank(bank) {
 const errors=[];
 const expected=Object.entries(oklahomaFinalExamBlueprint).flatMap(([area,topics])=>topics.map((_,i)=>`${area}.${String(i+1).padStart(2,'0')}`));
 if(bank.length!==300)errors.push(`Expected 300 final items, received ${bank.length}`);
 const ids=new Set(),prompts=new Set(),choiceSets=new Set(),rationales=new Set();
 for(const item of bank){
  if(ids.has(item.id))errors.push(`Duplicate ID ${item.id}`);ids.add(item.id);
  if(!/^OK-FINAL-[AB]-\d{3}$/.test(item.id))errors.push(`Malformed ID ${item.id}`);
  for(const [label,value,set] of [['prompt',normalize(item.prompt??''),prompts],['choices',item.choices?.map(normalize).sort().join('|'),choiceSets],['rationale',normalize(item.rationale??''),rationales]]){
   if(!value||set.has(value))errors.push(`${item.id}: empty or duplicate ${label}`);set.add(value);
  }
  if(prohibited.test([item.prompt,...(item.choices??[]),item.rationale].join(' ')))errors.push(`${item.id}: prohibited placeholder template`);
  if(item.choices?.length!==4||new Set(item.choices).size!==4||!Number.isInteger(item.correctChoice)||item.correctChoice<0||item.correctChoice>3)errors.push(`${item.id}: invalid choices/key`);
  if(!item.prompt?.endsWith('?')||normalize(item.prompt).split(' ').length<10)errors.push(`${item.id}: deficient question stem`);
  if(normalize(item.rationale??'').split(' ').length<12)errors.push(`${item.id}: deficient rationale`);
  if(!item.curriculumReferences?.length||item.objectives?.some(v=>!v))errors.push(`${item.id}: missing curriculum/objective`);
  if(item.topicIds?.length<1||item.topicIds?.length>2||new Set(item.topicIds).size!==item.topicIds?.length)errors.push(`${item.id}: invalid objective assignment`);
  for(const t of item.topicIds??[])if(!expected.includes(t))errors.push(`${item.id}: unknown topic ${t}`);
 }
 for(const form of ['A','B']){
  const items=bank.filter(q=>q.form===form);
  if(items.length!==150)errors.push(`${form}: expected 150 questions`);
  if(items.some((q,i)=>q.item!==i+1||q.id!==`OK-FINAL-${form}-${String(i+1).padStart(3,'0')}`))errors.push(`${form}: ID/order mismatch`);
  const counts=new Map(expected.map(t=>[t,0]));
  for(const item of items)for(const t of item.topicIds??[])counts.set(t,(counts.get(t)??0)+1);
  for(const [t,count]of counts)if(count!==1)errors.push(`${form}: ${t} occurs ${count} times, expected 1`);
  const keyCounts=[0,0,0,0];for(const item of items)keyCounts[item.correctChoice]++;
  if(keyCounts.some(c=>c<37||c>38))errors.push(`${form}: unbalanced answer-key distribution ${keyCounts}`);
  const longest=items.filter(item=>Array.isArray(item.choices)&&typeof item.choices[item.correctChoice]==='string'&&
   item.choices.every((choice,i)=>i===item.correctChoice||choice.length<item.choices[item.correctChoice].length)).length;
  if(longest>oklahomaUniquelyLongestCorrectLimit)errors.push(`${form}: uniquely-longest correct answers ${longest} exceed provider limit ${oklahomaUniquelyLongestCorrectLimit}`);
 }
 if(errors.length)throw new Error(`Oklahoma final-bank guard failed:\n${errors.join('\n')}`);
 return {forms:2,items:300,topicsPerForm:158,areasPerForm:22,pairedObjectiveItemsPerForm:8};
}

export const oklahomaFinalExamBank=compile();
validateOklahomaFinalExamBank(oklahomaFinalExamBank);

export function renderOklahomaFinalExamBank() {
 validateOklahomaFinalExamBank(oklahomaFinalExamBank);
 return [
  '# Oklahoma Basic Course of Real Estate, Part I of II — protected final assessment bank',
  `Version: ${oklahomaFinalExamVersion}. Authored review draft; not approved or authorized for administration.`,
  'Two forms of 150 substantively authored questions. Each form covers all 22 study areas and all 158 repository subtopics using eight two-objective case items. OREC prescribes the 22 areas, not the provider’s subtopic labels or weights.',
  'SME signoff and psychometric validation remain pending. This replacement does not certify difficulty equivalence or authorize enrollment, credit, certificates or final-exam administration. Keep all questions, keys and rationales out of public practice materials.',
  ...oklahomaFinalExamBank.map(q=>[
   `## Form ${q.form} · Item ${String(q.item).padStart(3,'0')}`,
   `**Objective:** ${q.area} — ${q.objectives.join('; ')}`,
   `**ID:** ${q.id} · **Topic IDs:** ${q.topicIds.join(', ')}`,
   q.prompt,
   ...q.choices.map((c,i)=>`${String.fromCharCode(65+i)}. ${c}`),
   `**Key:** ${String.fromCharCode(65+q.correctChoice)}`,
   `**Rationale:** ${q.rationale}`,
   `**Curriculum:** ${q.curriculumReferences.map(r=>`${r.path} §§ ${r.sections.join(', ')}`).join('; ')}`,
   q.authorityReferences.length?`**Primary authority:** ${q.authorityReferences.map(r=>`${r.locator} — [${r.title}](${r.url})`).join('; ')}`:'**Authority note:** Authored foundational concept or calculation using the explicitly stated hypothetical facts; see the curriculum reference. No jurisdiction-specific rate, deadline, entitlement or legal mandate is inferred from the example.',
  ].join('\n\n')),
 ].join('\n\n')+'\n';
}
