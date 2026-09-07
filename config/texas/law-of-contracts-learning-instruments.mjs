import { item, SOURCES } from './law-of-contracts-assessment-sources.mjs';
const refs=(key,reference)=>[{url:SOURCES[key].url,reference:`${SOURCES[key].name}, ${reference}`}];
const criterion=(id,description,required=false)=>({id,description,required});
const short=(id,prompt,rubric,feedback,critical=false)=>({id,type:'short-answer',prompt,rubric,passingScore:0.8,critical,instructorReview:true,feedbackCorrect:feedback,feedbackIncorrect:feedback});
const select=(id,prompt,choices,feedback,critical=false)=>({id,type:'selection',prompt,choices,correctChoice:0,critical,feedbackCorrect:feedback,feedbackIncorrect:feedback});
const compute=(id,prompt,answer,feedback)=>({id,type:'computation',prompt,answer,tolerance:0.01,feedbackCorrect:feedback,feedbackIncorrect:feedback});

export const MISCONCEPTION_CHECKS = Object.freeze([
  item('LOC-MC-T01','T01U5','A principal asks an agent to make a conspicuous deletion and supplies the required written instruction. Does that permission also authorize the agent to recommend the deletion’s legal effect?',[
    'No. The mechanics of an instructed deletion and the prohibition on legal advice remain separate.','Yes. Written instructions turn the agent into the principal’s attorney.','Yes. Any conspicuous deletion is legally risk-free.','No deletion can ever be made even when the rule’s conditions are satisfied.'
  ],'Read every part of § 537.11 together. A permitted act of completion or deletion does not create authority to advise on legal sufficiency or effect. The professional should follow the actual instruction within the rule and refer legal advice.','rules','§ 537.11',{topicCode:'T01',countsAsAssessment:false,classification:'FORMATIVE_INSTRUCTIONAL'}),
  item('LOC-MC-T02','T02U2','A storm destroys a house. A learner concludes that all real property at the site has ceased to exist. Which distinction corrects the mistake?',[
    'The improvement can be destroyed while the land and legal interests remain subjects of ownership and the transaction.','Land and buildings are always the same physical object.','Destruction of an improvement automatically cancels every lien and easement.','The street address becomes personal property after a storm.'
  ],'Separate land, improvements, and legal rights. Casualty may alter condition and invoke contractual provisions, but physical damage to a building is not proof that all land interests disappear.','resale','Paragraphs 2 and 14',{topicCode:'T02',countsAsAssessment:false,classification:'FORMATIVE_INSTRUCTIONAL'}),
  item('LOC-MC-T04','T04U8','A buyer confuses the amount of a property-tax homestead exemption with the entire scope of homestead creditor protection. What is the correction?',[
    'Tax treatment and creditor protection are different legal questions with separate governing provisions.','The exemption amount is the maximum value of every protected homestead in all circumstances.','Receiving a tax exemption automatically eliminates every permitted lien.','An agent may set the exemption and creditor rules in the sales contract.'
  ],'The course separates tax benefits from the constitutional and statutory rules governing forced sale and permitted liens. Do not use a tax figure as an answer to an unrelated creditor-protection question.','constitution','Article XVI, § 50; Property Code § 41.001',{topicCode:'T04',countsAsAssessment:false,classification:'FORMATIVE_INSTRUCTIONAL'}),
  item('LOC-MC-T05','T05U9','A tenant’s deposit is transferred at a rental-property sale. A learner calls the entire deposit extra rent earned by the seller. What is the correction?',[
    'A security deposit has a distinct statutory and contractual function and is not automatically earned rent.','Every tenant payment is rent regardless of purpose.','A sale always permits the broker to retain the deposit.','Deposits cannot affect a buyer’s obligations after acquisition.'
  ],'Section 92.102 defines security deposit, and the related provisions address duties including a change of ownership. Distinguish custody and obligations from earned income and rent prorations.','pr92','§§ 92.102 and 92.105',{topicCode:'T05',countsAsAssessment:false,classification:'FORMATIVE_INSTRUCTIONAL'}),
  item('LOC-MC-T07','T07U1','A buyer thinks the word contingency means the buyer can stop performing for any reason at any time. Which correction is accurate?',[
    'The particular provision defines its condition, election, deadline, evidence, and consequence.','Every contingency creates an unlimited unilateral cancellation right.','A contingency means no contract exists until closing in every case.','The agent can expand a contingency orally whenever the buyer is worried.'
  ],'Contingencies are specific contractual mechanisms. Read the actual clause; do not turn the label into an unrestricted right or assume it eliminates every present obligation.','financing','Paragraphs 2A and 2B, examples of distinct approval provisions',{topicCode:'T07',countsAsAssessment:false,classification:'FORMATIVE_INSTRUCTIONAL'}),
  item('LOC-MC-T08','T08U3','A loan’s nominal interest rate and disclosed annual percentage rate differ. A learner concludes that one necessarily is a typographical error. What should be recognized?',[
    'The measures describe different aspects of credit cost and should be reviewed under the applicable disclosure rules.','The nominal rate and APR must be identical in every loan.','APR is the property’s annual tax rate.','The broker’s commission is always the only reason for a difference.'
  ],'Do not equate a note rate with the broader disclosed cost measure. The loan disclosures and applicable calculation rules explain the actual figures; an unexplained difference should be reviewed, not automatically called an error.','z38','§ 1026.38(b) and (o)',{topicCode:'T08',countsAsAssessment:false,classification:'FORMATIVE_INSTRUCTIONAL'})
]);

export const SCENARIOS = Object.freeze([
{
  id:'LOC-SC0',title:'Formation before labels',afterTopic:'T03',placement:{afterTopic:'T03',timeAttribution:'TOPIC'},passingScore:0.8,
  units:['T03U1','T03U2','T03U3','T03U4','T03U5'],
  narrative:'Hypothetical file: Two adults discuss a future land purchase. Their first exchange states the parcel and price but says that neither intends to be bound until a definitive agreement is signed and delivered. One participant later emails that the price is acceptable and asks the other to prepare documents. No definitive agreement has yet been delivered. In a separate proposed transaction, an owner offers a paid option to buy a different parcel during a stated period; the holder has not exercised it. In a third file, the parties have signed the same authorized sales agreement and communicated acceptance, but closing performance is due next month. A learner labels all three files executed, bilateral sales because each contains written words. Your role is to compare the evidence and classifications without treating an instructional label as a legal opinion about a disputed real transaction.',
  tasks:[
    short('LOC-SC0-A','Analyze the first file’s stated formation condition and the later email. Identify the evidence and the question requiring legal review.',[
      criterion('condition','Identifies the express definitive-agreement condition.',true),
      criterion('context','Reads the later email in the full exchange rather than isolating price assent.',true),
      criterion('evidence','Requests the actual versions, attachments, signatures, delivery, and communications.'),
      criterion('noIcon','Does not treat any written words or software status as conclusive formation.'),
      criterion('boundary','Refers a disputed enforceability determination to counsel.',true)
    ],'Chalker illustrates why the parties’ stated formation condition matters. Preserve the complete context and do not infer a completed bargain from price language alone.',true),
    select('LOC-SC0-B','Which description best distinguishes the second file’s stand-alone option from the third file’s signed purchase agreement?',[
      'The option preserves a specified opportunity to purchase; the signed sale contains the parties’ purchase obligations subject to its terms.','Both necessarily convey title immediately.','The option holder necessarily promised to buy merely by accepting the option.','A written sale cannot have future obligations.'
    ],'The option and underlying purchase obligations are distinct. Read exercise and other duties from the actual instrument; do not count signatures as a substitute for the promised exchange.'),
    select('LOC-SC0-C','Which expression and performance description fits the third file on the supplied facts?',[
      'Express and fully signed, with closing performance still executory.','Implied solely because performance is future.','Fully performed solely because signatures are complete.','Void solely because closing is next month.'
    ],'Words express the agreement, while future performance makes it executory in the general classification sense. Signature completion is not full performance.'),
    short('LOC-SC0-D','Prepare a classification record using separate headings for expression, promised exchange, legal status, and performance. State what each heading asks and identify a fact still needing proof where appropriate.',[
      criterion('expression','Explains words versus conduct as the expression inquiry.'),
      criterion('exchange','Distinguishes return promises from requested performance or an option election.'),
      criterion('status','Treats validity and enforceability as legal inquiries requiring their elements and applicable writing rules.',true),
      criterion('performance','Separates signing from obligations already performed or still due.',true),
      criterion('uncertainty','States missing evidence instead of inventing a categorical conclusion.')
    ],'The four dimensions are independent. A useful response asks the right question for each, supports the classification with facts, and identifies unresolved legal issues rather than collapsing all files into one label.'),
    select('LOC-SC0-E','The learner proposes applying every contract-for-deed rule to the third file because closing is in the future. What additional inquiry is necessary?',[
      'Whether the actual transaction falls within the statutory applicability provisions of Property Code § 5.062.','Only whether any duty remains to be performed.','Only whether the parties used an electronic signature.','Only whether the purchase price is large.'
    ],'The general term executory is not the complete statutory coverage test. Subchapter D defines the arrangements subject to its specialized protections.',true)
  ],sources:[...refs('chalker','opinion pages 7–13'),...refs('northshore','opinion page 12'),...refs('vanegas','opinion pages 5–6'),...refs('pr5','§ 5.062'),...refs('bc26','§ 26.01')],
  optionalReflection:{prompt:'Which classification changed when you separated signing from performance?',graded:false,points:0}
},
{
  id:'LOC-SC1',title:'One property, three proposed agreements',afterTopic:'T05',placement:{afterTopic:'T05',timeAttribution:'TOPIC'},passingScore:0.8,
  units:['T05U5','T05U6','T05U9','T05U13','T05U14'],
  narrative:'Hypothetical file: Northgate owns a rented residence. The owner proposes a listing agreement, then offers the current tenant a three-year lease with a simultaneous purchase option. Part of each monthly payment would be credited toward the purchase price, but title would remain with Northgate until a later event. Northgate asks the broker to use a short internet form and add a clause allowing immediate forfeiture of all credits after any late payment. The tenant wants the broker to represent the tenant as a buyer and assumes the existing lease signature already covers brokerage services. The broker also receives a deposit ledger showing $1,800 held for security and $900 of prepaid rent. No participant has obtained legal advice about the combined arrangement. The broker must identify the relationships and information needed without drafting substantive remedies or deciding whether every statute applies.',
  tasks:[
    select('LOC-SC1-A','Which first classification step is appropriate?',[
      'Identify the listing, proposed buyer services, tenancy, option, and possible executory conveyance as separate but connected relationships.','Treat the internet form’s title as a complete legal classification.','Assume the lease signature authorizes every brokerage service.','Treat the security deposit as the broker’s earned fee.'
    ],'The file involves multiple relationships. Their obligations and required documents must be identified separately; a single signature or label cannot settle all of them.'),
    short('LOC-SC1-B','Prepare a referral brief for counsel about the proposed lease-option arrangement. Identify the facts counsel needs and the statutory issue; do not draft a forfeiture clause.',[
      criterion('structure','Identifies simultaneous lease and option, payment credits, deferred title, and the proposed default consequence.',true),
      criterion('scope','Identifies Property Code § 5.062 applicability and relevant Subchapter D protections without assuming exemption.',true),
      criterion('debt','Requests existing-lien and financing information relevant to the proposed structure.'),
      criterion('documents','Provides the complete proposed documents and existing lease for integrated review.'),
      criterion('boundary','Declines to draft or assure enforceability of the requested forfeiture remedy.',true)
    ],'A complete brief supplies structure, payments, conveyance timing, existing interests, and actual documents. It identifies the Subchapter D question and preserves the legal-drafting boundary. The required criteria must all be met.',true),
    select('LOC-SC1-C','What should happen before the broker provides residential buyer services that trigger the current written-agreement requirement?',[
      'Use the required compliant written buyer agreement; do not treat the tenancy document as its substitute.','Rely on the tenant’s old lease because it contains a signature.','Deliver only a commission invoice after closing.','Ask the owner to waive the tenant’s statutory protection.'
    ],'The buyer-agreement requirement is distinct from a tenancy. The actual statutory trigger and agreement requirements must be satisfied.',true),
    compute('LOC-SC1-D','The ledger contains $1,800 security and $900 prepaid rent. What total amount must be reconciled as these two separately classified tenant-related balances?',2700,'$1,800 + $900 = $2,700. This sum is a reconciliation total, not a conclusion that both amounts are earned rent or that they receive identical closing treatment.'),
    short('LOC-SC1-E','Write the next-action record for the two tenant balances and the proposed agreements. State responsible participants and evidence needed to close each issue.',[
      criterion('deposit','Separately identifies security-deposit amount, custody, and applicable obligations.',true),
      criterion('rent','Separately identifies prepaid-rent period and allocation under the actual agreement.'),
      criterion('authority','Identifies the owner and required entity or signing authority review.'),
      criterion('agreements','Tracks brokerage agreements and counsel-reviewed transaction documents separately.'),
      criterion('evidence','Keeps unresolved items pending until documents and proper confirmations exist.',true)
    ],'The answer should produce an actionable record, not merely say that someone will handle it. Security, prepaid income, representation, and conveyance each need their own source and completion evidence.')
  ],
  sources:[...refs('pr5','§§ 5.062–5.085'),...refs('trela','§ 1101.563'),...refs('pr92','§§ 92.102–92.105'),...refs('rules','§ 537.11')],
  optionalReflection:{prompt:'Which label in the file was most likely to conceal a separate legal question?',graded:false,points:0}
},
{
  id:'LOC-SC2',title:'The accepted version and the approaching election',afterTopic:'T06',placement:{afterTopic:'T06',timeAttribution:'TOPIC'},passingScore:0.8,
  units:['T06U1','T06U2','T06U3','T06U6','T06U8','T06U9'],
  narrative:'Hypothetical file: A buyer signs an offer with a stated price and financing addendum. The seller returns a version changing the price and the closing date. A later message from the buyer says the changes are accepted, but the attachment in the agent’s working folder is still the original offer. The signature service shows completion on one version while the email chain identifies another. The lender reports that borrower documentation is satisfactory but appraisal review remains pending. The buyer asks for a repair credit, and the seller has not responded. A contractual election period is approaching its end. The buyer says that ongoing negotiation must keep all rights open and asks the agent to promise a refund of earnest money if the appraisal is late. Your task is to organize the file and decisions without declaring a disputed legal result.',
  tasks:[
    short('LOC-SC2-A','Identify the evidence needed to establish the operative agreement and its chronology.',[
      criterion('versions','Preserves and compares the original offer, changed version, and actual attachments.',true),
      criterion('assent','Identifies evidence of assent to the same terms and communication of acceptance.',true),
      criterion('signature','Preserves signature attribution and audit information rather than relying on a completion icon.'),
      criterion('date','Avoids manufacturing an effective date from an unresolved version conflict.'),
      criterion('referral','Escalates a disputed formation or authority question to broker and counsel.',true)
    ],'The record must link assent and signatures to a specific document set. A platform status or isolated message is not enough when versions conflict. Preserve the evidence and seek legal review of any dispute.',true),
    select('LOC-SC2-B','How should the lender’s update be recorded?',[
      'Borrower documentation is satisfactory at the reported stage; property appraisal review remains pending.','All financing protection is irrelevant because the lender sent a positive message.','The lender has amended the closing date.','The purchase price automatically changes to the later appraisal amount.'
    ],'Borrower and property conditions are different. Record the actual stage without claiming final approval, funding, or an amendment.'),
    select('LOC-SC2-C','What is the effect of the unanswered repair-credit request on an existing election deadline?',[
      'Do not assume extension; review the current provision and obtain timely instructions and any needed agreed change.','Every pending repair negotiation automatically pauses the contract.','The seller’s silence accepts every requested change.','The agent may create an oral extension without authority.'
    ],'A proposal is not an amendment. The original deadline requires attention unless validly changed or another applicable legal basis is established.',true),
    short('LOC-SC2-D','Prepare a decision brief for the buyer before the election period ends. Include information, options requiring advice, and notice evidence without choosing a remedy for the buyer.',[
      criterion('facts','States the unresolved appraisal and unanswered repair request accurately.'),
      criterion('provision','Identifies the actual relevant election or financing provisions and their requirements.',true),
      criterion('decision','Reserves the decision to the buyer with appropriate legal advice.',true),
      criterion('notice','Identifies recipient, method, timing, and evidence for any notice actually selected.'),
      criterion('noPromise','Does not guarantee earnest-money entitlement or a legal outcome.',true)
    ],'The brief should support an informed timely decision. It must not turn lender delay into an automatic refund or let the agent elect a legal remedy for the client.',true),
    select('LOC-SC2-E','If entitlement to earnest money is disputed, which records should remain available?',[
      'The operative agreement, amendments, notices, delivery evidence, performance chronology, and escrow records.','Only the buyer’s latest demand.','Only the seller’s preferred account.','Only a final folder label saying cancelled.'
    ],'The merits and escrow authority require the actual record. Preserve both parties’ relevant communications and the transaction evidence rather than reducing the dispute to a label.')
  ],sources:[...refs('chalker','opinion pages 7–13'),...refs('financing','paragraphs 2A and 2B'),...refs('resale','paragraphs 15, 18 and 21'),...refs('bc322','§ 322.009'),...refs('rules','§ 537.11')],
  optionalReflection:{prompt:'Which piece of evidence would most reduce uncertainty about the operative version?',graded:false,points:0}
},
{
  id:'LOC-SC3',title:'Seller credit, existing debt, and a loan portal',afterTopic:'T08',placement:{afterTopic:'T08',timeAttribution:'TOPIC'},passingScore:0.8,
  units:['T08U2','T08U3','T08U5','T08U6','T08U9','T08U10'],
  narrative:'Hypothetical file: An owner offers to finance a residential sale while an existing mortgage remains. The proposed buyer payment is described as affordable because it is calculated on a long amortization schedule, but the entire remaining balance would be due in five years. The seller has not asked the existing lender about transfer restrictions. A broker-operated online portal offers to connect the buyer to another lender and pays the brokerage a fee for each referred closing; no one has identified a separate service supporting the fee. The buyer also sees a state loan program and assumes eligibility guarantees approval. The property may sell for less than the existing debt if the transaction changes to a conventional short sale. All dollar amounts and loan structures in this exercise are illustrative; no actual current rate or program limit is assumed.',
  tasks:[
    short('LOC-SC3-A','Prepare the professional-referral checklist for the owner-financing proposal.',[
      criterion('existing','Identifies existing debt terms, transfer restrictions, lien position, and payment flow.',true),
      criterion('regulation','Calls for applicable lending and loan-originator analysis rather than assuming blanket seller exemption.',true),
      criterion('documents','Identifies note, security, sale terms, disclosures, taxes, and insurance as related but distinct matters.'),
      criterion('balloon','Flags maturity and the remaining-balance risk for the buyer.'),
      criterion('boundary','Does not draft a custom loan or guarantee enforceability.',true)
    ],'The analysis needs the entire credit and security structure, applicable regulation, and existing lender terms. The broker gathers facts and coordinates qualified advice without creating legal loan terms.',true),
    select('LOC-SC3-B','Why can a five-year maturity create a risk despite regularly paid monthly installments?',[
      'The payment schedule may leave a balloon balance due at maturity.','Every installment automatically eliminates the balance at year five.','A long amortization schedule makes refinancing legally guaranteed.','The buyer’s deposit necessarily pays the entire balloon.'
    ],'Amortization and maturity are different. The note and disclosures must show the actual repayment obligation, including any balloon.'),
    short('LOC-SC3-C','Identify the questions the brokerage must resolve about the portal’s per-closing payment.',[
      criterion('coverage','Identifies whether the referral involves a covered settlement service.'),
      criterion('substance','Examines the actual payment arrangement, referrals, and services rather than the technology label.',true),
      criterion('fees','Identifies Regulation X § 1024.14 anti-kickback and unearned-fee concerns.',true),
      criterion('affiliation','Asks whether an affiliated arrangement or required-use issue adds applicable conditions.'),
      criterion('review','Requires compliance review before treating the payment as lawful.',true)
    ],'The portal’s technology does not decide legality. Coverage, referral arrangements, actual services, compensation, and any affiliation conditions need a substantive review.',true),
    select('LOC-SC3-D','What should the buyer be told about identifying a potentially suitable state program?',[
      'Current program eligibility, lender underwriting, and property requirements still must be verified.','Finding the program guarantees a loan on the selected property.','All published program terms are permanent.','The agent can issue the final state-program approval.'
    ],'Program fit is only one step. Use the current primary program information and the participating lender’s actual review.'),
    select('LOC-SC3-E','If the sale price will not cover the existing debt, what must not be assumed?',[
      'That a creditor’s lien release necessarily forgives every remaining personal obligation without the applicable agreement.','That creditor approval may be needed for the proposed short sale.','That counsel should review the release and debt treatment.','That the purchase agreement and creditor agreement are separate.'
    ],'A short sale requires explicit treatment of the lien and any remaining debt. The purchase agreement cannot unilaterally bind the creditor to forgive a deficiency.')
  ],sources:[...refs('z36','§ 1026.36(a)'),...refs('z38','§ 1026.38(b)–(c)'),...refs('x14','§ 1024.14'),...refs('x15','§ 1024.15'),...refs('pr51','§ 51.003'),...refs('tdhca','homebuyer program descriptions')],
  optionalReflection:{prompt:'Which low monthly-payment claim would you ask the lender to explain in writing?',graded:false,points:0}
},
{
  id:'LOC-SC4',title:'A closing ledger with unresolved evidence',afterTopic:'T10',placement:{afterTopic:'T10',timeAttribution:'TOPIC'},passingScore:0.8,
  units:['T10U2','T10U4','T10U6','T10U7','T10U8','T10U9'],
  narrative:'Hypothetical file: The agreed tax-proration convention uses a 365-day year, a $9,125 annual estimate, and 120 seller days. Taxes remain unpaid and the buyer will pay the later bill. A $3,500 deposit receipt exists but the draft closing statement omits it. The seller’s existing loan requires an official payoff; only a monthly statement has arrived. The lender has sent a Closing Disclosure and is reviewing a later minor fee correction. Both parties plan to sign tomorrow. An unexpected email changes wire instructions and supplies a new telephone number. The seller has a signed temporary lease for four days after the sale. The buyer’s moving company says keys must be released immediately after signing. You must reconcile figures, preserve the appropriate disclosures and confirmations, and distinguish the separate completion events.',
  tasks:[
    compute('LOC-SC4-A','Calculate the seller’s tax share under the supplied assumptions. Enter dollars.',3000,'$9,125 ÷ 365 = $25 per day; $25 × 120 = $3,000. Because taxes are unpaid and the buyer will pay the bill, this seller share is credited to the buyer under the stated arrangement.'),
    short('LOC-SC4-B','Prepare the correction and open-item list for the draft closing statement and title requirements.',[
      criterion('tax','States the $3,000 seller-share buyer credit and the supplied assumptions.'),
      criterion('deposit','Reconciles the omitted $3,500 deposit with the contract and escrow receipt.',true),
      criterion('payoff','Keeps the official payoff requirement open rather than substituting a monthly statement.',true),
      criterion('participants','Coordinates corrections with the authorized closing participants rather than changing wire amounts unilaterally.'),
      criterion('estimate','Identifies the tax figure as estimated and checks any later adjustment obligation.')
    ],'The list should distinguish allocation, deposit accounting, and payoff evidence. The agent identifies discrepancies and sources; authorized closing participants make the proper corrections.'),
    select('LOC-SC4-C','What is the correct response to the minor fee correction?',[
      'Have the lender apply the actual changed-disclosure rule; do not automatically announce a new three-business-day wait.','Assume every correction always restarts the waiting period.','Ignore every corrected disclosure after the first is sent.','Have the broker waive federal timing orally.'
    ],'Section 1026.19(f)(2) distinguishes ordinary corrections from specified changes requiring a new waiting period. The actual lender compliance analysis controls.'),
    select('LOC-SC4-D','How should the changed wire instructions be verified?',[
      'Through a trusted independently established contact channel, not merely the new number in the message.','By calling only the new number supplied in the unexpected message.','By checking whether the logo looks familiar.','By asking the moving company whether the message seems urgent.'
    ],'A suspicious message can supply its own false verification channel. Follow the brokerage and closing office’s trusted process and preserve the message.',true),
    short('LOC-SC4-E','Write a status update explaining what must be confirmed before acting on funds and keys, including the temporary lease.',[
      criterion('signing','Distinguishes signing from lender authorization, funding, and disbursement.',true),
      criterion('confirmation','Requires appropriate closing confirmation before reporting completion.'),
      criterion('possession','Identifies the seller’s separate four-day temporary possession arrangement.',true),
      criterion('noOverride','Does not let the moving schedule override the contract or lease.',true),
      criterion('followup','Calendars the remaining possession and other open obligations.')
    ],'The update should state the actual stage and evidence, then separately describe possession. Signing and moving pressure do not cancel the temporary lease or prove disbursement.',true)
  ],sources:[...refs('resale','paragraphs 5, 6, 9, 10, 12 and 13'),...refs('z19','§ 1026.19(f)'),...refs('rules','§§ 531.4 and 535.156')],
  optionalReflection:{prompt:'Which single word in a status update would you replace with a more precise description?',graded:false,points:0}
},
{
  id:'LOC-SC5',title:'Course capstone: reconstruct and administer the bargain',afterTopic:'T11',courseLevel:true,placement:{afterTopic:'T11',timeAttribution:'COURSE_LEVEL'},passingScore:0.8,
  units:['T01U5','T02U6','T04U4','T05U7','T06U1','T06U9','T07U2','T09U5','T10U9','T11U2'],
  narrative:'Hypothetical capstone: Harbor Mesa LLC owns a residence with an occupied guest unit. A company member signs a purchase offer as seller, but the company’s management and authority documents have not been reviewed. The buyer plans to live in the guest unit immediately, although its lease may continue. The offer refers to the main parcel but the marketing map also depicts an adjacent strip that may be separately owned. A recorded access instrument affects the driveway. During negotiation, the parties exchange two different price amendments; only one appears fully signed. The buyer’s lender reports conditional approval and requests more title information. The seller asks the agent to add a broad release of all future claims in exchange for a small price credit. The buyer asks whether the release is enforceable and whether refusal to close would guarantee recovery of earnest money. The file must be reconstructed and administered without unsupported ownership, use, lending, or remedy assurances.',
  tasks:[
    short('LOC-SC5-A','Build the party, property, and authority issue record. Identify the documents and professionals needed.',[
      criterion('entity','Separates LLC membership from authority to bind and convey company property.',true),
      criterion('parcel','Identifies the discrepancy between the contract parcel and marketing strip.',true),
      criterion('access','Obtains the actual recorded access instrument with appropriate title and survey review.'),
      criterion('lease','Obtains the guest-unit lease and amendments before promising immediate possession.'),
      criterion('referrals','Assigns legal, title, and technical determinations to appropriate professionals.',true)
    ],'The record must resolve who can promise what property interest and what possession is available. Marketing appearance, membership, and intended occupancy are not substitutes for the required evidence.',true),
    short('LOC-SC5-B','Reconstruct the operative agreement and amendment history without deleting superseded documents.',[
      criterion('base','Identifies the accepted base agreement and complete incorporated attachments.',true),
      criterion('amendments','Compares both amendments and establishes the actual agreed version and signatures.',true),
      criterion('communication','Preserves relevant acceptance communications and attribution evidence.'),
      criterion('calendar','Updates only the affected duties and dates from the operative change.'),
      criterion('history','Retains rejected and superseded versions as historical evidence.')
    ],'The current document set must be traceable to actual assent, with its history preserved. A convenient consolidated copy does not authorize erasing prior evidence.'),
    select('LOC-SC5-C','How should the requested broad release be handled?',[
      'Refer legal drafting and effect to counsel; a price credit does not give the agent authority to write or validate the release.','Write it because the seller offered money for it.','Guarantee it is enforceable once initialed.','Insert it in an unrelated disclosure notice.'
    ],'A release allocates substantive legal rights. The form-use boundary remains applicable despite consideration or a party’s request.',true),
    short('LOC-SC5-D','Prepare a buyer decision brief covering the lender’s status, title information, possession, and potential refusal to close.',[
      criterion('lender','States conditional approval and outstanding title information without promising funding.'),
      criterion('title','Identifies unresolved ownership, parcel, and access questions.'),
      criterion('possession','Separates the intended move-in plan from existing lease rights.',true),
      criterion('remedies','Refers refusal-to-close and earnest-money entitlement to counsel rather than guaranteeing a remedy.',true),
      criterion('timing','Identifies relevant current deadlines and required notice evidence.',true)
    ],'The buyer needs accurate unresolved facts and timely legal advice to decide. The agent should neither compel closing nor promise that refusal is consequence-free.',true),
    select('LOC-SC5-E','Which final handoff record best supports continued administration?',[
      'An evidence-based issue list with responsible participants, due checkpoints, operative sources, and remaining confirmations.','A single label saying everyone agreed.','Only the lender’s positive email.','Only the agent’s conclusion that the title concerns are probably minor.'
    ],'The capstone ends with an actionable record. Each open matter remains visible until the required evidence and proper review establish resolution.')
  ],sources:[...refs('bo101','§§ 101.106 and 101.251–101.254'),...refs('pr13','§ 13.002'),...refs('resale','paragraphs 2, 6, 9, 10, 15 and 21'),...refs('rules','§§ 535.2, 535.156 and 537.11')],
  optionalReflection:{prompt:'Where did preserving a distinction prevent a premature legal conclusion?',graded:false,points:0}
}
]);

export const INSTRUMENT_POLICY=Object.freeze({scenarioPassingScore:0.8,thresholdBasis:'PROVIDER_DESIGN_NOT_A_TREC_NUMERIC_SCENARIO_THRESHOLD',criticalTasksMustPass:true,shortAnswersRequireQualifiedInstructorRubricReview:true,noLengthBasedScoring:true,optionalReflectionIsUngraded:true,plannedTimeIsNotObservedTime:true,misconceptionsCountAsAssessment:false,finalPayloadIncluded:false});
