export const SOURCES = Object.freeze({
  rules:{name:'Texas Real Estate Commission rules',url:'https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules'},
  trela:{name:'Texas Occupations Code Chapter 1101',url:'https://tcss.legis.texas.gov/resources/OC/htm/OC.1101.htm'},
  pr5:{name:'Texas Property Code Chapter 5',url:'https://tcss.legis.texas.gov/resources/PR/htm/PR.5.htm'},
  pr12:{name:'Texas Property Code Chapter 12',url:'https://tcss.legis.texas.gov/resources/PR/htm/PR.12.htm'},
  pr13:{name:'Texas Property Code Chapter 13',url:'https://tcss.legis.texas.gov/resources/PR/htm/PR.13.htm'},
  pr51:{name:'Texas Property Code Chapter 51',url:'https://tcss.legis.texas.gov/resources/PR/htm/PR.51.htm'},
  pr82:{name:'Texas Property Code Chapter 82',url:'https://tcss.legis.texas.gov/resources/PR/htm/PR.82.htm'},
  pr91:{name:'Texas Property Code Chapter 91',url:'https://tcss.legis.texas.gov/resources/PR/htm/PR.91.htm'},
  pr92:{name:'Texas Property Code Chapter 92',url:'https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm'},
  pr41:{name:'Texas Property Code Chapter 41',url:'https://tcss.legis.texas.gov/resources/PR/htm/PR.41.htm'},
  bo101:{name:'Texas Business Organizations Code Chapter 101',url:'https://tcss.legis.texas.gov/resources/BO/htm/BO.101.htm'},
  bc26:{name:'Texas Business & Commerce Code Chapter 26',url:'https://tcss.legis.texas.gov/resources/BC/htm/BC.26.htm'},
  bc322:{name:'Texas Business & Commerce Code Chapter 322',url:'https://tcss.legis.texas.gov/resources/BC/htm/BC.322.htm'},
  dtpa:{name:'Texas Business & Commerce Code Chapter 17',url:'https://tcss.legis.texas.gov/resources/BC/htm/BC.17.htm'},
  water:{name:'Texas Water Code Chapter 36',url:'https://tcss.legis.texas.gov/resources/WA/htm/WA.36.htm'},
  constitution:{name:'Texas Constitution Article XVI',url:'https://tcss.legis.texas.gov/resources/CN/htm/CN.16.htm'},
  taking:{name:'Texas Constitution Article I',url:'https://tcss.legis.texas.gov/resources/CN/htm/CN.1.htm'},
  estate:{name:'Texas Estates Code Chapter 101',url:'https://tcss.legis.texas.gov/resources/ES/htm/ES.101.htm'},
  limitations:{name:'Texas Civil Practice and Remedies Code Chapter 16',url:'https://tcss.legis.texas.gov/resources/CP/htm/CP.16.htm'},
  tax32:{name:'Texas Tax Code Chapter 32',url:'https://tcss.legis.texas.gov/resources/TX/pdf/TX.32.pdf'},
  minerals:{name:'TREC Addendum for Reservation of Oil, Gas, and Other Minerals, 44-3',url:'https://www.trec.texas.gov/sites/default/files/pdf-forms/44-3.pdf'},
  chalker:{name:'Supreme Court of Texas, Chalker Energy Partners III v. Le Norman Operating, No. 18-0352',url:'https://www.txcourts.gov/media/1445957/180352.pdf'},
  northshore:{name:'Supreme Court of Texas, North Shore Energy v. Harkins, No. 14-0552',url:'https://www.txcourts.gov/media/1436267/140552.pdf'},
  vanegas:{name:'Supreme Court of Texas, Vanegas v. American Energy Services, No. 07-0520',url:'https://www.txcourts.gov/media/819887/OpinionsFY2010.pdf#page=311'},
  resale:{name:'TREC One to Four Family Residential Contract (Resale), 20-19',url:'https://www.trec.texas.gov/forms/one-four-family-residential-contract-resale'},
  amendment:{name:'TREC Amendment to Contract, 39-11',url:'https://www.trec.texas.gov/forms/amendment'},
  financing:{name:'TREC Third Party Financing Addendum, 40-11',url:'https://www.trec.texas.gov/forms/third-party-financing-addendum-0'},
  forms:{name:'Texas Real Estate Commission contract forms',url:'https://www.trec.texas.gov/agency-information/contracts'},
  z19:{name:'CFPB Regulation Z, 12 CFR § 1026.19',url:'https://www.consumerfinance.gov/rules-policy/regulations/1026/19/'},
  z36:{name:'CFPB Regulation Z, 12 CFR § 1026.36',url:'https://www.consumerfinance.gov/rules-policy/regulations/1026/36/'},
  z38:{name:'CFPB Regulation Z, 12 CFR § 1026.38',url:'https://www.consumerfinance.gov/rules-policy/regulations/1026/38/'},
  z43:{name:'CFPB Regulation Z, 12 CFR § 1026.43',url:'https://www.consumerfinance.gov/rules-policy/regulations/1026/43/'},
  x14:{name:'CFPB Regulation X, 12 CFR § 1024.14',url:'https://www.consumerfinance.gov/rules-policy/regulations/1024/14/'},
  x15:{name:'CFPB Regulation X, 12 CFR § 1024.15',url:'https://www.consumerfinance.gov/rules-policy/regulations/1024/15/'},
  b4:{name:'CFPB Regulation B, 12 CFR § 1002.4',url:'https://www.consumerfinance.gov/rules-policy/regulations/1002/4/'},
  fannie:{name:'Freddie Mac joint-GSE UAD transition FAQ',url:'https://sf.freddiemac.com/faqs/uad-and-forms-redesign'},
  tdhca:{name:'Texas Department of Housing and Community Affairs loan programs',url:'https://welcomehome.tdhca.texas.gov/programs'},
  epa:{name:'U.S. EPA residential lead-based paint disclosure rule',url:'https://www.epa.gov/lead/real-estate-disclosures-about-potential-lead-hazards'}
});

/** Authoring helper only: every prompt, distractor, and rationale is separately authored. */
export function item(id,tests,prompt,choices,rationale,key,section,extra={}) {
  const s=SOURCES[key];
  if(!s) throw new Error(`Unknown source ${key}`);
  if(choices.length!==4 || new Set(choices).size!==4) throw new Error(`Malformed choices ${id}`);
  return Object.freeze({id,tests,unitCode:tests,module:`module-${tests.slice(1,3)}`,prompt,choices:Object.freeze(choices),correctChoice:0,rationale,source:s.name,section,sources:Object.freeze([{url:s.url,reference:`${s.name}, ${section}`}]),...extra});
}
export function pair(tests,objective,primary,replacement,suffix='') {
  const id=`LOC-${tests}${suffix}-Q`;
  return {tests,objective,primary:item(id,tests,...primary),replacement:item(`LOC-${tests}${suffix}-R`,tests,...replacement,{replaces:id})};
}
