const CaliforniaPracticeExam = (() => {
  const DOMAINS = {
    ownership: "Property Ownership and Land Use Controls",
    agency: "Laws of Agency and Fiduciary Duties",
    valuation: "Property Valuation and Financial Analysis",
    financing: "Financing",
    transfer: "Transfer of Property",
    practice: "Practice of Real Estate and Disclosures",
    contracts: "Contracts",
  };

  const bank = [
    { id:"own-01", domain:"ownership", prompt:"A tenant installs removable display shelving for the tenant's retail business. The lease is silent. What is the best classification?", choices:["A trade fixture that the tenant may generally remove before the tenancy ends, subject to repairing damage","A fixture that automatically belongs to the landlord as soon as it is attached","An easement because the shelving benefits the business","A lien because the shelving has value"], answer:0, explanation:"Equipment installed by a commercial tenant for business use is generally treated as a trade fixture. Timely removal and repair obligations still matter." },
    { id:"own-02", domain:"ownership", prompt:"Parcel A receives a recorded right of way across neighboring Parcel B. The right benefits Parcel A regardless of who owns it. This is most likely:", choices:["An easement appurtenant","An easement in gross","A license","An encroachment"], answer:0, explanation:"An easement appurtenant benefits a dominant tenement and burdens a servient tenement, ordinarily passing with the land." },
    { id:"own-03", domain:"ownership", prompt:"One joint tenant conveys that owner's interest to a third party. What is the usual effect on that conveyed interest?", choices:["The joint tenancy is severed as to that share, and the transferee ordinarily holds as a tenant in common","The conveyance is void unless every joint tenant signs","All ownership automatically becomes community property","The transferee receives only a leasehold"], answer:0, explanation:"A conveyance by one joint tenant generally severs the joint tenancy as to that share. The remaining joint tenants may retain survivorship among themselves." },
    { id:"own-04", domain:"ownership", prompt:"A city adopts a zoning ordinance limiting residential density. Which governmental power is primarily involved?", choices:["Police power","Eminent domain","Escheat","Taxation"], answer:0, explanation:"Zoning is an exercise of police power used to regulate land use for public health, safety, morals, and general welfare." },
    { id:"own-05", domain:"ownership", prompt:"Which legal description method identifies a parcel by lot, block, tract, and a recorded subdivision map?", choices:["Lot and block","Metes and bounds","Government survey","Street address"], answer:0, explanation:"The lot-and-block method refers to a parcel shown on a recorded subdivision map. A street address or assessor number is not automatically a legal description." },
    { id:"own-06", domain:"ownership", prompt:"A recorded deed of trust and a later private judgment lien both affect a property. What fact is most important before deciding priority?", choices:["The type of lien, applicable law, recording dates, and any subordination agreement","Which creditor is owed more money","Which document has more pages","Which creditor first telephones escrow"], answer:0, explanation:"Priority depends on the nature of each lien, statutory rules, recording, and any valid subordination—not merely the debt amount." },
    { id:"own-07", domain:"ownership", prompt:"An owner dies without a valid will and without lawful heirs. Which governmental right may cause the property to pass to the state?", choices:["Escheat","Police power","Eminent domain","Special assessment"], answer:0, explanation:"Escheat is the state's right to acquire property when a person dies without a valid will and without lawful successors." },

    { id:"agency-01", domain:"agency", prompt:"A buyer tells the buyer's agent the buyer would pay more than the written offer. Without authorization, the agent should:", choices:["Keep that bargaining information confidential","Disclose it to the seller to help the transaction close","Publish it in the multiple listing service","Tell the seller only after acceptance"], answer:0, explanation:"An agent owes confidentiality to the principal. The agent should not disclose the buyer's willingness to pay more without authorization or a legal requirement." },
    { id:"agency-02", domain:"agency", prompt:"A broker represents both buyer and seller in the same transaction. What is required for lawful dual agency?", choices:["Disclosure and informed consent of both principals","Only the seller's consent because the listing came first","No disclosure if different salespersons work for the broker","Approval from the escrow holder"], answer:0, explanation:"California dual agency requires disclosure and informed consent. Using different salespersons under one broker does not eliminate the dual agency." },
    { id:"agency-03", domain:"agency", prompt:"Which duty most directly requires an agent to place the principal's interests ahead of the agent's own financial interest?", choices:["Loyalty","Accounting","Obedience","Reasonable care"], answer:0, explanation:"Loyalty requires the agent to avoid undisclosed self-dealing and put the principal's interests ahead of the agent's interests within the agency relationship." },
    { id:"agency-04", domain:"agency", prompt:"A salesperson receives an offer on a listed property but believes it is too low. What should the salesperson generally do?", choices:["Promptly present the offer as required and provide competent advice","Reject it without telling the seller","Hold it until a better offer arrives","Change the price before presentation"], answer:0, explanation:"The agent should present offers promptly according to law and the principal's instructions. Advice does not authorize withholding or altering an offer." },
    { id:"agency-05", domain:"agency", prompt:"An agent knows of a hidden foundation crack that materially affects value. The seller instructs the agent not to mention it. The agent should:", choices:["Disclose the known material fact and refuse to conceal it","Obey because the duty of loyalty always overrides disclosure duties","Tell only the appraiser","Wait until after closing"], answer:0, explanation:"A principal cannot lawfully instruct an agent to conceal a known material fact. Duties to the principal do not permit fraud or material nondisclosure." },
    { id:"agency-06", domain:"agency", prompt:"An agent is buying the agent's own listing through an entity controlled by the agent. The safest required control is to:", choices:["Disclose the agent's ownership interest and role clearly and in writing","Use the entity name so the interest remains private","Ask escrow to make the disclosure after closing","Avoid presenting competing offers"], answer:0, explanation:"A licensee acting as a principal or having a material ownership interest must make the required disclosure. An entity does not erase the conflict." },
    { id:"agency-07", domain:"agency", prompt:"Which action best reflects the agent's duty to account?", choices:["Keeping accurate records of money and property received for the principal","Estimating market value without supporting data","Choosing the title company without instruction","Guaranteeing that the transaction will close"], answer:0, explanation:"Accounting requires accurate custody and records for money, documents, and property received or handled for the principal." },

    { id:"value-01", domain:"valuation", prompt:"A property sells for $640,000 after costing $590,000 to construct. Which statement is correct?", choices:["Price is $640,000; cost is $590,000; value is an opinion under stated conditions","Value and price are both necessarily $640,000","Cost is $640,000 because that is what the buyer paid","Price cannot differ from value"], answer:0, explanation:"Price is the amount paid, cost is the expenditure to create or acquire, and value is an opinion under specified conditions." },
    { id:"value-02", domain:"valuation", prompt:"Which test is part of highest and best use analysis?", choices:["Legally permissible, physically possible, financially feasible, and maximally productive","Most expensive use regardless of zoning","Owner's preferred use only","Current use must always continue"], answer:0, explanation:"Highest and best use must pass legal, physical, financial, and productivity tests. The current or most expensive use is not automatically the answer." },
    { id:"value-03", domain:"valuation", prompt:"A comparable sale has a swimming pool worth $35,000, but the subject property does not. In a sales comparison analysis, the appraiser would generally:", choices:["Subtract $35,000 from the comparable's price","Add $35,000 to the comparable's price","Subtract $35,000 from the subject's unknown value","Make no adjustment because pools are personal property"], answer:0, explanation:"Adjust the comparable toward the subject. If the comparable is superior because it has a pool, subtract the pool's market contribution from the comparable." },
    { id:"value-04", domain:"valuation", prompt:"A four-unit property produces monthly gross rent of $8,000 and sells for $960,000. What is its gross rent multiplier using monthly rent?", choices:["120","12","960","80"], answer:0, explanation:"GRM = sale price ÷ monthly gross rent: $960,000 ÷ $8,000 = 120." },
    { id:"value-05", domain:"valuation", prompt:"A property has annual net operating income of $72,000 and a market capitalization rate of 6%. Its indicated value is:", choices:["$1,200,000","$432,000","$120,000","$4,320"], answer:0, explanation:"Value = NOI ÷ capitalization rate: $72,000 ÷ 0.06 = $1,200,000." },
    { id:"value-06", domain:"valuation", prompt:"Which statement best distinguishes a comparative market analysis from an appraisal?", choices:["A CMA supports brokerage pricing advice; it is not automatically an appraisal performed under appraisal standards","A CMA always has greater legal authority than an appraisal","Only a property owner may prepare a CMA","A CMA guarantees the eventual sale price"], answer:0, explanation:"A licensee may use a CMA for brokerage purposes, but should not misrepresent it as an appraisal or guarantee a price." },

    { id:"finance-01", domain:"financing", prompt:"What is the primary function of a promissory note in a real estate loan?", choices:["It evidences the borrower's debt and repayment promise","It transfers legal title to the buyer","It is the lender's title insurance policy","It records the property's zoning"], answer:0, explanation:"The note is evidence of the debt. A deed of trust or mortgage separately provides real-property security for that debt." },
    { id:"finance-02", domain:"financing", prompt:"A buyer borrows $510,000 to purchase a property appraised at $600,000. What is the loan-to-value ratio?", choices:["85%","90%","83.3%","117.6%"], answer:0, explanation:"LTV = loan amount ÷ property value: $510,000 ÷ $600,000 = 85%." },
    { id:"finance-03", domain:"financing", prompt:"In a fully amortized fixed-rate loan, each scheduled payment generally includes:", choices:["Interest and a portion of principal","Principal only until the final year","Interest only with no reduction in debt","Property taxes only"], answer:0, explanation:"A fully amortized payment pays current interest and reduces principal so the balance reaches zero at the end of the amortization term." },
    { id:"finance-04", domain:"financing", prompt:"Which statement correctly compares FHA and VA financing?", choices:["FHA loans are federally insured; qualifying VA loans are guaranteed for eligible borrowers","Both are made directly by the county recorder","VA loans are available to every borrower without eligibility rules","FHA insurance eliminates all borrower costs"], answer:0, explanation:"FHA provides mortgage insurance; VA provides a guaranty for eligible borrowers. Private lenders usually originate the loans under program rules." },
    { id:"finance-05", domain:"financing", prompt:"A deed of trust contains an acceleration clause. After a qualifying default, the clause may allow the lender to:", choices:["Declare the unpaid balance immediately due, subject to law and loan terms","Raise the property tax assessment","Transfer the borrower's title without foreclosure","Cancel all recorded junior liens automatically"], answer:0, explanation:"An acceleration clause permits the lender to call the unpaid debt due after a covered default, but enforcement remains subject to governing law and required procedures." },

    { id:"transfer-01", domain:"transfer", prompt:"A grantor signs a deed but keeps it in a desk and never intends a present transfer. Has title passed merely because the deed was signed?", choices:["No; delivery with present intent and acceptance are also required","Yes; signature alone always transfers title","Yes, but only if the deed is notarized","No, because every deed must be recorded before delivery"], answer:0, explanation:"Execution alone does not complete a deed transfer. Delivery with present intent and acceptance are essential; recording serves other purposes." },
    { id:"transfer-02", domain:"transfer", prompt:"What is the principal effect of recording a valid deed in the public records?", choices:["It gives constructive notice and may affect priority","It guarantees the physical condition of the property","It creates title even if the grantor owned nothing","It replaces delivery and acceptance"], answer:0, explanation:"Recording provides constructive notice and can protect priority. It does not cure a defective conveyance or create title the grantor did not have." },
    { id:"transfer-03", domain:"transfer", prompt:"What is the escrow holder's basic role in a typical California transaction?", choices:["Act as a neutral stakeholder following mutual written instructions","Advocate exclusively for the buyer","Guarantee that the property has no defects","Decide legal disputes between the principals"], answer:0, explanation:"The escrow holder is a neutral stakeholder and follows the parties' lawful mutual instructions; it does not serve as either party's advocate." },
    { id:"transfer-04", domain:"transfer", prompt:"A preliminary title report is best described as:", choices:["An offer to issue title insurance subject to stated exceptions","A guarantee that no boundary dispute exists","A property inspection report","A promise that every recorded lien will be paid by the insurer"], answer:0, explanation:"A preliminary report states the terms and exceptions under which a title company is prepared to issue a policy. It is not a physical inspection or unlimited guarantee." },
    { id:"transfer-05", domain:"transfer", prompt:"Annual property taxes are $7,300. Using a 365-day year, what is the approximate daily tax rate?", choices:["$20","$200","$19.18","$730"], answer:0, explanation:"$7,300 ÷ 365 = $20 per day. A contract may specify a different proration convention, so always follow the agreement." },

    { id:"practice-01", domain:"practice", prompt:"A salesperson learns from a reliable source that a roof has severe hidden leakage. The seller did not mention it. What is the best next action?", choices:["Investigate within the licensee's role, disclose the known material fact, and document the response","Remain silent because only the seller signs disclosures","Wait to see whether the buyer's inspector discovers it","Delete the message that reported the leak"], answer:0, explanation:"Known material facts affecting value or desirability cannot be concealed. The licensee should act competently, disclose as required, and preserve the record." },
    { id:"practice-02", domain:"practice", prompt:"For a covered California residential transfer, the Transfer Disclosure Statement primarily communicates:", choices:["The seller's statutory disclosures concerning property condition and specified matters","The buyer's final loan approval","The appraiser's opinion of value","The title insurer's exceptions"], answer:0, explanation:"The TDS is a statutory seller disclosure document. It does not replace inspections, title review, or financing approval." },
    { id:"practice-03", domain:"practice", prompt:"A California residential listing agent's required visual inspection is generally:", choices:["Reasonably competent and diligent and limited to accessible areas","A guarantee against every hidden defect","A structural engineering inspection","Waived whenever the seller completes a TDS"], answer:0, explanation:"The statutory visual inspection standard does not make the agent an engineer or guarantor, but it does require competent observation of accessible areas and disclosure of material facts observed." },
    { id:"practice-04", domain:"practice", prompt:"A Natural Hazard Disclosure statement should be treated as:", choices:["A required disclosure process that uses current hazard information and does not replace property-specific investigation","A guarantee that the property will never experience a disaster","A substitute for every seller disclosure","An optional marketing brochure"], answer:0, explanation:"The NHD addresses specified hazard zones. It does not guarantee safety or eliminate the buyer's need for investigation." },
    { id:"practice-05", domain:"practice", prompt:"Federal lead-based paint disclosure rules generally apply to the sale of covered residential property built before:", choices:["1978","1988","1965","2000"], answer:0, explanation:"Federal disclosure requirements generally cover pre-1978 housing, subject to statutory exemptions and procedures." },
    { id:"practice-06", domain:"practice", prompt:"An agent limits a family's property search to one neighborhood because the agent thinks families with children belong there. This is most clearly a risk of:", choices:["Steering","Puffing","Proration","Subrogation"], answer:0, explanation:"Directing consumers toward or away from neighborhoods because of protected characteristics or assumptions is steering. Objective client criteria should control the search." },
    { id:"practice-07", domain:"practice", prompt:"A broker receives a buyer's deposit check made payable to the broker. The safest initial control is to:", choices:["Follow the contract and trust-fund rules, document receipt, and place it in authorized custody promptly","Deposit it into the broker's operating account for convenience","Hold it unrecorded until closing","Endorse it to the salesperson"], answer:0, explanation:"Trust funds require prompt authorized handling, accurate records, and separation from operating funds. The contract and current trust-fund rules govern the next step." },
    { id:"practice-08", domain:"practice", prompt:"A social-media advertisement omits the responsible brokerage identity and exaggerates a property's condition. Which principle is most directly violated?", choices:["Advertising must be truthful and identify the responsible licensee or brokerage as required","Online advertisements are exempt from real estate law","Only printed advertisements require retention","The seller is solely responsible for every advertisement"], answer:0, explanation:"Digital advertising remains subject to truthfulness, required identification, supervision, and recordkeeping rules." },
    { id:"practice-09", domain:"practice", prompt:"Which task may an unlicensed assistant generally perform without crossing into licensed activity?", choices:["Schedule appointments according to instructions without discussing price or terms","Solicit listings and negotiate commissions","Explain contract provisions to a buyer","Show property alone and answer transaction questions"], answer:0, explanation:"Unlicensed assistants may perform administrative tasks within strict limits. Solicitation, showing, negotiation, and transaction advice ordinarily require a license." },
    { id:"practice-10", domain:"practice", prompt:"Competing brokers agree that none will accept listings below a 6% commission. This agreement creates the greatest risk of:", choices:["Price fixing under antitrust law","A lawful multiple listing rule","An easement in gross","A property tax reassessment"], answer:0, explanation:"Competitors must set commissions independently. An agreement on commission levels is a classic price-fixing risk." },

    { id:"contract-01", domain:"contracts", prompt:"Which group contains the basic elements generally required for an enforceable contract?", choices:["Capable parties, mutual consent, lawful object, and consideration","Recording, notarization, possession, and appraisal","Escrow, title insurance, financing, and inspection","A broker, a lender, a notary, and a witness"], answer:0, explanation:"Contract formation generally requires capable parties, mutual consent, lawful object, and consideration, plus any writing or signature required by the Statute of Frauds." },
    { id:"contract-02", domain:"contracts", prompt:"A seller changes the buyer's offered closing date and signs the altered document. The seller has most likely created:", choices:["A counteroffer","An acceptance","An option","An assignment"], answer:0, explanation:"An acceptance must mirror the offer. A material change is generally a counteroffer, which must then be accepted and communicated according to its terms." },
    { id:"contract-03", domain:"contracts", prompt:"Why are most agreements authorizing a broker to sell real property required to be in writing?", choices:["They fall within the Statute of Frauds","All oral contracts are criminal","Recording law requires every service contract to be recorded","Escrow cannot open without notarization"], answer:0, explanation:"The Statute of Frauds requires specified agreements, including covered real estate and brokerage agreements, to be in writing to be enforceable." },
    { id:"contract-04", domain:"contracts", prompt:"A purchase agreement contains an inspection contingency. Before removing it, the buyer should primarily:", choices:["Complete the permitted investigation, evaluate results, and follow the contract's notice and deadline terms","Assume the seller's disclosures eliminate inspection risk","Remove it immediately so the offer looks stronger","Ask escrow to decide whether the property is acceptable"], answer:0, explanation:"A contingency allocates risk. The party should complete due diligence and follow the agreement's deadlines, notices, and removal procedures." },
    { id:"contract-05", domain:"contracts", prompt:"An exclusive-right-to-sell listing generally means the broker may earn the agreed compensation if the property sells during the term:", choices:["Regardless of who procures the buyer, subject to the agreement and law","Only when the listing broker personally finds the buyer","Only when the seller finds the buyer","Only after the listing is recorded"], answer:0, explanation:"An exclusive-right-to-sell listing generally protects the broker's compensation if the property sells during the term, subject to the contract and applicable law." },
    { id:"contract-06", domain:"contracts", prompt:"A buyer wants to transfer contractual rights to another person. Before treating the transfer as effective, the agent should first review:", choices:["The assignment provisions, party consent requirements, and any continuing liability","Only the property's tax bill","The buyer's preferred escrow company","Whether the new person is related to the buyer"], answer:0, explanation:"Assignment depends on the contract and law. Consent, restrictions, and the original party's continuing obligations must be analyzed." },
    { id:"contract-07", domain:"contracts", prompt:"A valid option to purchase is best described as:", choices:["A contract keeping an offer open for a stated period in exchange for consideration","A deed that transfers title immediately","A month-to-month tenancy","A lender's acceleration right"], answer:0, explanation:"An option gives the optionee the right, but not the obligation, to purchase under stated terms during the option period." },
    { id:"contract-08", domain:"contracts", prompt:"The parties agree to change the purchase price after acceptance. The safest method is to:", choices:["Use a written amendment signed by the required parties and preserve the version history","Erase the original price and initial nothing","Rely only on a telephone call with escrow","Wait until after closing to correct the file"], answer:0, explanation:"A material contract change should be documented in a properly executed written amendment, communicated to affected participants, and retained with the transaction record." },
  ];

  const selection = { ownership:5, agency:5, valuation:4, financing:3, transfer:2, practice:7, contracts:4 };
  const state = { questions:[], answers:[], current:0, startedAt:0 };
  const $ = (selector) => document.querySelector(selector);
  const escapeHtml = (value="") => String(value).replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const shuffle = (items) => {
    const result = [...items];
    for (let index=result.length-1; index>0; index-=1) {
      const swap = Math.floor(Math.random()*(index+1));
      [result[index],result[swap]]=[result[swap],result[index]];
    }
    return result;
  };
  const track = (action, detail={}) => {
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push({event:`statecourse_ca_practice_${action}`,marketing_only:true,regulated_progress:false,...detail});
  };
  const randomizeChoices = (item) => {
    const choices=shuffle(item.choices.map((choice,index)=>({choice,correct:index===item.answer})));
    return {...item,choices:choices.map((entry)=>entry.choice),answer:choices.findIndex((entry)=>entry.correct)};
  };
  const createExam = () => shuffle(Object.entries(selection).flatMap(([domain,count])=>shuffle(bank.filter((item)=>item.domain===domain)).slice(0,count))).map(randomizeChoices);

  function renderQuestion() {
    const question=state.questions[state.current];
    const saved=state.answers[state.current];
    $("#examProgressHeading").textContent=`Question ${state.current+1} of ${state.questions.length}`;
    $("#examProgressBar").style.width=`${((state.current+1)/state.questions.length)*100}%`;
    $("#questionCard").innerHTML=`<p class="question-domain">${escapeHtml(DOMAINS[question.domain])}</p><h3>${escapeHtml(question.prompt)}</h3><fieldset><legend>Select one answer</legend>${question.choices.map((choice,index)=>`<label class="exam-choice"><input type="radio" name="practiceAnswer" value="${index}" ${saved===index?"checked":""}/><span><b>${String.fromCharCode(65+index)}</b>${escapeHtml(choice)}</span></label>`).join("")}</fieldset><p class="question-status">${saved===undefined?"Not answered":"Answer saved"}</p>`;
    $("#questionCard").querySelectorAll('input[name="practiceAnswer"]').forEach((input)=>input.addEventListener("change",()=>{
      state.answers[state.current]=Number(input.value);
      $("#questionCard .question-status").textContent="Answer saved";
      updateNavigation();
    }));
    updateNavigation();
    $("#questionCard").focus({preventScroll:true});
  }

  function updateNavigation() {
    $("#previousPracticeQuestion").disabled=state.current===0;
    const next=$("#nextPracticeQuestion");
    next.textContent=state.current===state.questions.length-1?"Finish and score →":"Next →";
  }

  function begin() {
    state.questions=createExam();
    state.answers=Array(state.questions.length);
    state.current=0;
    state.startedAt=Date.now();
    $("#examStart").hidden=true;
    $("#examResults").hidden=true;
    $("#practiceExam").hidden=false;
    renderQuestion();
    track("started",{question_count:state.questions.length});
    $("#practiceExam").scrollIntoView({behavior:"smooth",block:"start"});
  }

  function finish() {
    const correct=state.questions.reduce((total,question,index)=>total+(state.answers[index]===question.answer?1:0),0);
    const percent=Math.round((correct/state.questions.length)*100);
    const domainRows=Object.entries(DOMAINS).map(([key,label])=>{
      const indexes=state.questions.map((question,index)=>question.domain===key?index:-1).filter((index)=>index>=0);
      const score=indexes.reduce((sum,index)=>sum+(state.answers[index]===state.questions[index].answer?1:0),0);
      return {key,label,score,total:indexes.length,percent:indexes.length?Math.round(score/indexes.length*100):0};
    }).filter((row)=>row.total);
    const weak=domainRows.filter((row)=>row.percent<70).sort((a,b)=>a.percent-b.percent);
    const review=state.questions.map((question,index)=>{
      const selected=state.answers[index];
      const right=selected===question.answer;
      return `<details class="answer-review ${right?"correct":"incorrect"}"><summary><span>${right?"Correct":"Review"}</span>${escapeHtml(question.prompt)}</summary><div><p><strong>Your answer:</strong> ${selected===undefined?"No answer":`${String.fromCharCode(65+selected)}. ${escapeHtml(question.choices[selected])}`}</p>${right?"":`<p><strong>Correct answer:</strong> ${String.fromCharCode(65+question.answer)}. ${escapeHtml(question.choices[question.answer])}</p>`}<p>${escapeHtml(question.explanation)}</p></div></details>`;
    }).join("");
    $("#practiceExam").hidden=true;
    const result=$("#examResults");
    result.hidden=false;
    result.innerHTML=`<div class="score-header"><p class="overline">Diagnostic result</p><strong>${percent}%</strong><div><h2>${percent>=70?"You reached the 70% practice target.":"Your study plan is ready."}</h2><p>${correct} of ${state.questions.length} correct. This score is a study diagnostic, not an official DRE examination result.</p></div></div><div class="domain-results"><h3>Performance by DRE domain</h3>${domainRows.map((row)=>`<div><span>${escapeHtml(row.label)}</span><progress value="${row.percent}" max="100">${row.percent}%</progress><strong>${row.score}/${row.total}</strong></div>`).join("")}</div><div class="study-plan"><p class="overline">Recommended next study</p><h3>${weak.length?weak.slice(0,3).map((row)=>escapeHtml(row.label)).join(" · "):"Maintain broad review across all seven domains."}</h3><p>${weak.length?"Start with the lowest-scoring domains, review the corresponding California course assignments, then take a new randomized diagnostic.":"Review missed explanations below and continue mixed practice so strong domains remain strong."}</p><button id="retakePracticeExam" type="button">Take a new 30-question diagnostic</button></div><section class="answer-review-list"><h3>Answer review and explanations</h3>${review}</section>`;
    result.querySelector("#retakePracticeExam").addEventListener("click",begin);
    result.focus();
    track("completed",{score_percent:percent,correct,question_count:state.questions.length,duration_seconds:Math.round((Date.now()-state.startedAt)/1000)});
  }

  function next() {
    if(state.current===state.questions.length-1){finish();return;}
    state.current+=1;renderQuestion();
  }
  function previous(){if(state.current>0){state.current-=1;renderQuestion();}}
  function exit(){if(confirm("Exit this diagnostic? Your current answers will be cleared.")){state.questions=[];state.answers=[];$("#practiceExam").hidden=true;$("#examStart").hidden=false;track("exited");}}

  function initialize(){
    $("#startPracticeExam")?.addEventListener("click",begin);
    $("#nextPracticeQuestion")?.addEventListener("click",next);
    $("#previousPracticeQuestion")?.addEventListener("click",previous);
    $("#exitPracticeExam")?.addEventListener("click",exit);
  }
  return { initialize, bankSize:bank.length };
})();

CaliforniaPracticeExam.initialize();
