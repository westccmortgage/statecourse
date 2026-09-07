// Protected assessment proposals. Never import these modules into public practice.
export const paths={preexam:'missouri/mo-salesperson-preexam-48-v1',mrep:'missouri/mo-real-estate-practice-24-v1'};
export const authorities={
  definitions:['339.710 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.710'],
  seller:['339.730 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.730'],
  buyer:['339.740 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.740'],
  dual:['339.750 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.750'],
  transaction:['339.755 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.755'],
  policy:['339.760 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.760'],
  disclosure:['339.770 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.770'],
  agreements:['339.780 RSMo (effective August 28, 2025)','https://revisor.mo.gov/main/OneSection.aspx?section=339.780'],
  termination:['339.790 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.790'],
  compensation:['339.800 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.800'],
  designated:['339.820 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.820'],
  qualifications:['339.040 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=339.040'],
  frauds:['432.010 RSMo','https://revisor.mo.gov/main/OneSection.aspx?section=432.010'],
  schools:['20 CSR 2250 Chapter 7','https://www.sos.mo.gov/cmsimages/adrules/csr/current/20csr/20c2250-7.pdf'],
  content:['20 CSR 2250-6.060','https://www.sos.mo.gov/cmsimages/adrules/csr/current/20csr/20c2250-6.pdf'],
  trid:['12 CFR 1026.19(e), (f)','https://www.consumerfinance.gov/rules-policy/regulations/1026/19/'],
  respa:['12 CFR 1024.14','https://www.consumerfinance.gov/rules-policy/regulations/1024/14/'],
  independence:['12 CFR 1026.42(c)','https://www.consumerfinance.gov/rules-policy/regulations/1026/42/'],
  closing:['CFPB: review documents before closing','https://www.consumerfinance.gov/owning-a-home/close/review-documents-before-closing/'],
  cd:['CFPB Closing Disclosure explainer','https://www.consumerfinance.gov/owning-a-home/closing-disclosure/'],
  fha:['42 USC 3604','https://uscode.house.gov/view.xhtml?edition=prelim&path=%2Fprelim%40title42%2Fchapter45%2Fsubchapter1'],
  fhaExempt:['42 USC 3603(b)','https://uscode.house.gov/view.xhtml?edition=prelim&req=granuleid%3AUSC-prelim-title42-section3603'],
  lead:['EPA Lead-Based Paint Disclosure Rule','https://www.epa.gov/lead/lead-based-paint-disclosure-rule-section-1018-title-x'],
  antitrust:['US DOJ: The Antitrust Laws','https://www.justice.gov/atr/antitrust-laws-and-you'],
};

export function q(module,section,topic,authority,prompt,answer,wrong1,wrong2,wrong3,rationale){
  return {module:`module-${String(module).padStart(2,'0')}`,section,topic,authority:authority?authority.split(','):[],prompt,answer,distractors:[wrong1,wrong2,wrong3],rationale};
}

// Balanced but non-cyclic key order, with no three consecutive identical positions.
export const keyPositions=[1,3,0,2,2,0,3,1,0,2,1,3,3,1,2,0,2,3,0,1,1,0,2,3,0,3,1,2,3,2,0,1,2,1,3,0,1,2,0,3,3,0,2,1,0,1,3,2,1,0];
export function finalize(course,form,rows,objectives){
  return rows.map((row,i)=>{
    const index=form==='A'?keyPositions[i]:(3-keyPositions[49-i]);
    const choices=[...row.distractors];choices.splice(index,0,row.answer);
    return {...row,id:`${course==='preexam'?'MO48':'MO24'}-${form}-${String(i+1).padStart(3,'0')}`,form,number:i+1,objective:objectives?.[i]||`${course==='preexam'?'MO48':'MO24'}-${row.module.slice(-2)} — ${row.topic}`,choices,key:'ABCD'[index],correctChoice:index,curriculumPath:`${paths[course]}/curriculum/${row.module}.md`};
  });
}
