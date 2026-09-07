/**
 * PROTECTED — never a public free-practice input. Original assessment cases, not regulator exams.
 * Authoring in progress; schema/count/separation/content review must pass before a content freeze.
 * Correct option is authored first; assembled examination delivery must balance/permutate options.
 */
const SOURCES = Object.freeze({
  resale: "https://www.trec.texas.gov/sites/default/files/pdf-forms/20-19_4.pdf",
  rules: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  act: "https://tcss.legis.texas.gov/resources/OC/htm/OC.1101.htm",
  frauds: "https://tcss.legis.texas.gov/resources/BC/htm/BC.26.htm",
  limitations: "https://tcss.legis.texas.gov/resources/CP/htm/CP.16.htm",
  formation: "https://www.txcourts.gov/All_Archived_Documents/14thCOA/Case/Opinions/082400/000004f.PDF",
  revocation: "https://www.txcourts.gov/media/1453474/190793.pdf",
  capacity: "https://www.txcourts.gov/media/1455637/210296pc.pdf",
  unilateral: "https://www.txcourts.gov/media/1458344/220481.pdf",
  thirdParty: "https://www.trec.texas.gov/sites/default/files/pdf-forms/40-11.pdf",
  assumption: "https://www.trec.texas.gov/sites/default/files/pdf-forms/41-3_0.pdf",
  sellerFinance: "https://www.trec.texas.gov/sites/default/files/pdf-forms/26-8_0.pdf",
  releaseVA: "https://www.trec.texas.gov/sites/default/files/pdf-forms/12-3_0.pdf",
  lead: "https://www.trec.texas.gov/sites/default/files/pdf-forms/56-0.pdf",
  environmental: "https://www.trec.texas.gov/sites/default/files/pdf-forms/28-2.pdf",
  buyerLease: "https://www.trec.texas.gov/sites/default/files/pdf-forms/16-7.pdf",
  sellerLease: "https://www.trec.texas.gov/sites/default/files/pdf-forms/15-7.pdf",
  condominium: "https://www.trec.texas.gov/sites/default/files/pdf-forms/30-18_0.pdf",
  farm: "https://www.trec.texas.gov/sites/default/files/pdf-forms/25-17_4.pdf",
  unimproved: "https://www.trec.texas.gov/sites/default/files/pdf-forms/9-18_1.pdf",
  newComplete: "https://www.trec.texas.gov/sites/default/files/pdf-forms/24-20_0.pdf",
  newIncomplete: "https://www.trec.texas.gov/sites/default/files/pdf-forms/23-20_3.pdf",
  fairHousing: "https://tcss.legis.texas.gov/resources/PR/htm/PR.301.htm",
  occupancy: "https://tcss.legis.texas.gov/resources/PR/htm/PR.92.htm",
  saleOther: "https://www.trec.texas.gov/sites/default/files/pdf-forms/10-6.pdf",
  backup: "https://www.trec.texas.gov/sites/default/files/pdf-forms/11-9.pdf",
  minerals: "https://www.trec.texas.gov/sites/default/files/pdf-forms/44-3.pdf",
  termination: "https://www.trec.texas.gov/sites/default/files/pdf-forms/38-8.pdf",
  coastal: "https://www.trec.texas.gov/sites/default/files/pdf-forms/33-2.pdf",
  seaward: "https://www.trec.texas.gov/sites/default/files/pdf-forms/34-4.pdf",
  poa: "https://www.trec.texas.gov/sites/default/files/pdf-forms/36-11.pdf",
  shortSale: "https://www.trec.texas.gov/sites/default/files/pdf-forms/45-2_1.pdf",
  condoCertificate: "https://www.trec.texas.gov/sites/default/files/pdf-forms/32-5.pdf",
  nonRealty: "https://www.trec.texas.gov/sites/default/files/pdf-forms/57-0_0.pdf",
});
const rows = [];
function add(tests, sourceKey, section, prompt, correct, wrong1, wrong2, wrong3, rationale) {
  rows.push(Object.freeze({ id: `PCF-F${String(rows.length + 1).padStart(3, "0")}`, tests,
    topic: tests.slice(0, 3), module: `module-${tests.slice(1, 3)}`, source: SOURCES[sourceKey], section,
    prompt, choices: Object.freeze([correct, wrong1, wrong2, wrong3]), correctChoice: 0, rationale,
    instruction: `texas/tx-promulgated-contract-forms-30-v1/curriculum/module-${tests.slice(1, 3)}.md`,
    requiredUnit: tests, classification: "PROTECTED_PROVIDER_DRAFT_FINAL" }));
}

// T01 — Contract Law Overview: 14 separate applications across all nine official units.
add("T01U1", "formation", "Angelou v. African Overseas Union, opinion p.11 — objective mutual assent",
  "An owner signs a $512,000 offer but changes the excluded-property list to retain a detached workshop. The buyer has not agreed to that change. Which fact prevents the agent from treating the signed pages alone as proof of the proposed bargain?",
  "The parties have not assented to the same material property terms.", "Only the seller's signature matters because the price was unchanged.", "The workshop change is binding unless the buyer objects after closing.", "Delivery to a title company supplies the buyer's acceptance.",
  "Matching signatures on different material terms do not establish matching assent. The changed property term requires the buyer's agreement, not an agent's assumption.");
add("T01U1", "revocation", "Angel v. Tauch, Supreme Court of Texas No.19-0793, pp.1–2,11 — power of acceptance",
  "A buyer's revocable offer remains unanswered. The seller actually receives the buyer's clear withdrawal at 10:00 a.m., then first attempts acceptance at 10:20 a.m. No option or other irrevocability rule applies. What is the central problem?",
  "The seller's power to accept that offer ended before the attempted acceptance.", "Withdrawal is ineffective until an escrow agent approves it.", "The seller can revive the offer simply by signing it.", "Every written offer remains irrevocable until its stated deadline.",
  "The stated facts establish communicated revocation before acceptance. A future deadline alone does not make a revocable offer an option.");
add("T01U2", "frauds", "Business & Commerce Code §26.01(a),(b)(4)",
  "Two adults agree orally to sell an identified parcel for an agreed price. Neither signs a memorandum, and no exception is established. Which description addresses the writing problem without falsely declaring that agreement impossible?",
  "The statute of frauds presents an enforceability barrier to the land-sale promise.", "All oral agreements are criminal and void for every purpose.", "A real estate license substitutes for the required signature.", "The agreed price alone makes the writing rule irrelevant.",
  "Section26.01 requires the specified signed writing for enforcement of a land-sale promise. The issue is enforceability, subject to applicable exceptions, not a blanket ban on oral agreements.");
add("T01U2", "capacity", "Taylor Morrison v. Skufca, No.21-0296, opinion p.6 footnote6 — voidability and disaffirmance",
  "Counsel determines that a particular buyer has a legally available right to disaffirm a transaction because of minority; no applicable exception defeats that right. Which term best describes an agreement binding unless the protected party avoids it?",
  "Voidable.", "Automatically void from inception in every circumstance.", "Fully performed.", "Irrevocable simply because the adult seller signed.",
  "Voidability identifies an avoidance right held by the protected party. It differs from universal nullity and does not mean the adult counterparty may selectively cancel at will.");
add("T01U3", "resale", "20-19 ¶¶9 and19 — performance and surviving obligations; original instructional classification",
  "A contract is signed, title work is underway, and the deed and purchase funds are still due next month. A colleague says 'executed' proves the entire sale has already been performed. What clarification is accurate?",
  "Signing may execute the document, while the parties' unperformed sale duties remain executory.", "A signature transfers title and discharges every future duty.", "Executory means the agreement necessarily lacks consideration.", "Signed contracts cannot contain surviving representations.",
  "Document execution and complete contractual performance are different uses of the term. Pending closing duties remain to be performed, and specified obligations can survive closing.");
add("T01U4", "unilateral", "Campbellton Road v. City of San Antonio, No.22-0481, opinion p.15 footnote46 — unilateral acceptance by performance",
  "An offer expressly requests completion of a specified task as acceptance, not a return promise. The recipient only promises to do it and has not begun. Assuming the stated acceptance method controls, which classification and result fit?",
  "A unilateral offer; the requested performance has not yet supplied acceptance.", "A bilateral contract formed because any promise is sufficient.", "A fully executed exchange because the offer was written.", "A void contract because unilateral offers are prohibited.",
  "A unilateral arrangement calls for the specified performance rather than an exchanged promise. The question excludes disputes about beginning performance or other acceptance methods.");
add("T01U4", "unilateral", "Campbellton Road, No.22-0481, opinion p.15 footnote46 — exchanged promises versus acceptance by performance",
  "A seller promises to convey at closing and a buyer promises to pay at closing; both promises form the present agreement although performance is later. What makes this bilateral?",
  "Each party exchanges a promise for the other's promise.", "Both parties must finish performance before any agreement exists.", "Acceptance is necessarily postponed until the first purchase payment.", "Only the seller is bound because the buyer promises money rather than a deed.",
  "Bilateral describes the exchanged obligations, not property type, signature count alone, or whether closing has occurred.");
add("T01U5", "resale", "20-19 ¶5A(2),5B,5E",
  "The final day of an agreed option period falls on Sunday. The buyer relies solely on the paragraph extending weekend deposit-delivery deadlines and waits until Monday to send option termination. What distinction did the buyer overlook?",
  "The deposit-delivery extension is not a general extension of the option-notice deadline.", "Every contractual date automatically moves to the next business day.", "Option notice is effective whenever the lender receives it.", "An option deadline controls only the seller, not the buyer.",
  "Paragraph5 treats delivery of funds and option termination separately. The stated deposit exception does not extend the option period or its local5p.m. notice requirement.");
add("T01U6", "resale", "20-19 ¶22 — written agreement of parties",
  "After acceptance, one party initials a changed closing date and emails it as an 'addendum.' The other party rejects the extension. What controls the existing deadline?",
  "The unchanged agreement, unless a separate applicable contract provision changes it.", "The new date because any document called an addendum controls.", "The later date automatically because extensions favor performance.", "The escrow agent's preferred appointment date.",
  "The document's label cannot substitute for mutual written agreement to amend. Existing obligations remain unless the contract itself supplies another change mechanism.");
add("T01U6", "resale", "20-19 ¶¶2E and22 — attachments and agreement",
  "A reservation is discussed during negotiations but the purported addendum is missing from the final signed package. The attachment checklist and the parties' emails conflict. What is the appropriate immediate response?",
  "Reconcile the complete agreed writings and obtain legal help before asserting the reservation's effect.", "Assume every draft attachment became part of the contract.", "Have the agent create and backdate the missing addendum.", "Treat a checked attachment box as conclusive proof of all missing terms.",
  "The file must establish what was actually agreed and incorporated. An agent should not manufacture missing terms or resolve a disputed legal effect by assumption.");
add("T01U7", "resale", "20-19 ¶9B(1),(2),(4)",
  "A seller is ready to sign a deed, but an existing lien cannot be paid from available proceeds and the buyer has not agreed to assume it. Which issue still prevents a clean contractual closing?",
  "The required lien satisfaction remains unresolved despite the seller's willingness to sign.", "Signing a deed automatically extinguishes the lien.", "The buyer must assume any lien that exceeds proceeds.", "The broker may remove the lien by changing the settlement statement.",
  "Readiness to sign one document is not performance of all closing obligations. Unassumed liens require proper resolution, not an accounting relabel.");
add("T01U7", "resale", "20-19 ¶15 — alternative default remedies",
  "A seller alleges buyer default and asks the agent to guarantee both specific performance and retention of earnest money as the selected liquidated-damages termination remedy. What is the safest accurate answer?",
  "The contract provides alternative remedy paths; counsel must evaluate the election and entitlement.", "Every listed remedy is automatically cumulative without limitation.", "An allegation of default transfers earnest money immediately to the broker.", "Specific performance is a payment the title company calculates.",
  "The form distinguishes enforcement relief from termination with liquidated damages. An agent cannot guarantee a remedy or direct disputed escrow merely from an allegation.");
add("T01U8", "limitations", "Civil Practice & Remedies Code §§16.004(a)(3),16.051; distinction from contract deadlines",
  "An option expired yesterday. The buyer argues that a multi-year limitations period for bringing a lawsuit gives several more years to exercise that option. Why is that reasoning wrong?",
  "A deadline to sue is different from the contract's deadline to exercise a right.", "All contract performance deadlines equal the limitations period.", "Limitations automatically renews an expired option every year.", "An option can expire only after a court enters judgment.",
  "Limitations governs timeliness of legal claims; it does not itself extend a negotiated performance or election period. Counsel separately analyzes the particular claim and accrual.");
add("T01U9", "resale", "20-19 ¶¶5B,15,18 — termination grounds versus fund release",
  "A party sends a termination notice asserting an available contract right. The other party disputes that right and refuses an earnest-money release. What two questions must remain separate?",
  "Whether termination was effective and how the disputed escrow may be disbursed.", "Whether the deposit cleared and whether that alone extinguished every termination right.", "Whether written notice alone both ended the contract and authorized the broker to release disputed funds.", "Whether a release signature alone rewrites the original termination deadline.",
  "Termination entitlement and escrow procedures are distinct. A disputed release does not by itself establish or defeat the underlying termination ground.");

// T02 — Laws, Rules and Regulations: 13 items across six official units.
add("T02U1", "act", "Occupations Code §§1101.652(b)(2)–(4),1101.805(e) — known material misrepresentation",
  "An agent knows a seller's advertised claim that a significant foundation defect was repaired is false but repeats it to preserve the sale. The agent argues that the completed TREC form makes outside statements irrelevant. Which principle applies?",
  "Using the correct form does not excuse the agent's own misleading material representation.", "A standard contract immunizes all brokerage advertising.", "Only the seller can be responsible for an agent's repeated claim.", "The agent's duty begins only after earnest money clears.",
  "Form selection and truthful brokerage conduct are separate obligations. A standard document does not erase knowledge or authorize a misleading statement.");
add("T02U1", "act", "Occupations Code §1101.555 — written title advice when an offer is signed",
  "The parties use an owner-prepared purchase contract without the standard title-advice wording. Which action addresses the broker's separate title-advice duty?",
  "Provide the required written advice concerning attorney examination of an abstract or title insurance.", "Assume the owner-prepared-form exception eliminates all title-related duties.", "Personally certify that the seller has marketable title.", "Wait until the buyer discovers an exception after closing.",
  "An exception from mandatory form use does not erase the statutory written title-advice obligation. The broker does not replace the title examiner or attorney.");
add("T02U2", "rules", "22TAC §537.11 — prohibited legal drafting and advice",
  "A sales agent drafts a custom clause limiting the buyer's remedies and describes it as 'just informational.' No party or attorney supplied the language. What determines whether the label is accurate?",
  "Its effect on legal rights, obligations and remedies, not the agent's label.", "Whether the clause is fewer than twenty words.", "Whether it appears in a blank rather than an attachment.", "Whether the buyer's lender likes the clause.",
  "Calling legal-risk allocation informational does not change its substance. A broker-created limitation on remedies requires proper legal drafting authority, not a favorable label.");
add("T02U2", "rules", "22TAC §537.11 — principal/attorney directions and unauthorized practice",
  "An attorney for the buyer supplies a written clause. The agent notices ambiguity and independently rewrites its legal effect before forwarding it for signature. Which response would have respected the role boundary?",
  "Return the question to the buyer and attorney for clarified authorized language.", "Treat attorney origin as unlimited permission for the agent to revise legal consequences.", "Insert the revision without notice if it seems more protective.", "Ask the escrow assistant to sign for the buyer.",
  "Receiving an attorney's clause does not authorize the license holder to redesign it. Clarification belongs with the principal and qualified legal adviser.");
add("T02U3", "act", "Occupations Code §§1101.155(a),1101.254 — Commission adoption versus committee drafting",
  "A proposed standard form is discussed by the Broker-Lawyer Committee but has not been adopted by the Commission. Which statement avoids confusing the two bodies' roles?",
  "Committee development or recommendation is not itself Commission promulgation.", "Any committee discussion makes the draft mandatory that day.", "A broker may privately declare the draft promulgated.", "The committee approves individual buyers' transactions.",
  "The committee's form-development role is distinct from Commission adoption. A proposal is not an effective mandatory form merely because it is under discussion.");
add("T02U3", "resale", "20-19 execution-page disclaimer, printed page10 of12 — form approval versus transaction adequacy",
  "A buyer asks whether the TREC mark means the Commission has approved this seller's title, pricing and completed blanks. What does form approval establish?",
  "Approval of the form, not approval of this transaction's facts or legal adequacy.", "A warranty of the title and every completed field.", "A required price and brokerage fee for the transaction.", "An exemption from consulting the buyer's own attorney.",
  "Approval concerns the form itself. It does not make the regulator a party, title insurer, pricing adviser or reviewer of the completed transaction.");
add("T02U4", "rules", "22TAC §537.11 — appropriate mandatory forms and exceptions",
  "A client intends to buy a condominium unit. The agent selects the familiar one-to-four resale form solely because the unit contains one residence. What is the selection error?",
  "The legal property type requires checking the appropriate condominium form rather than counting occupants or rooms.", "Every single residence must use the one-to-four form regardless of ownership type.", "A condominium form is used only when four units are bought together.", "The buyer's financing choice alone determines whether property is a condominium.",
  "Form selection follows the transaction and ownership type. The resale form expressly excludes condominium transactions.");
add("T02U4", "rules", "22TAC §537.11 — owner-prepared form exception",
  "A property owner insists on a contract the owner prepared. The agent documents that choice but is asked to assure the buyer that the document is legally sufficient. Which distinction controls?",
  "A form-use exception does not authorize the agent to give a legal-sufficiency opinion.", "Owner authorship converts every clause into a Commission-approved clause.", "The agent must always replace the owner's document regardless of the exception.", "No disclosure or brokerage duty survives use of the owner's contract.",
  "Mandatory-form exceptions and unauthorized-practice limits must both be considered. The exception is not an expansion of the license holder's legal-advice authority.");
add("T02U5", "rules", "22TAC §535.156 — presenting offers",
  "A listing agent receives a written offer with compensation less favorable to the brokerage than a competing offer. The seller has given no instruction permitting it to be withheld. What should the agent do?",
  "Present it as required and let the seller evaluate the terms with accurate advice.", "Discard it because broker compensation ranks offers automatically.", "Delay it until the preferred buyer signs so comparison is unnecessary.", "Alter the compensation term before showing it to the seller.",
  "The principal's evaluation is not replaced by the broker's compensation preference. Offers must be handled under the applicable presentation duties and lawful instructions.");
add("T02U5", "rules", "22TAC §§535.156 and531.2 — offer handling and fidelity",
  "Several offers arrive. The seller prefers a lower financed offer because its timing better fits a move. Which response respects the seller's decision-making role?",
  "Explain material tradeoffs without falsely claiming the highest price must be accepted.", "Tell the seller Texas law always requires acceptance of the highest price.", "Accept a different offer on the seller's behalf without authority.", "Promise a financed buyer will fund solely because a prequalification letter exists.",
  "A seller evaluates the whole offer, including timing and risk, within applicable law. The agent provides accurate analysis rather than inventing a highest-price mandate.");
add("T02U6", "formation", "Angelou, opinion p.11 — objective assent and communicated agreement",
  "The seller signs an unchanged offer but keeps the signed document privately and does not communicate acceptance. The agent discovers it later and proposes using the earlier signature date as conclusive effective date. What must first be verified?",
  "The actual agreement and communication events required to form the binding bargain.", "Only the time printed by the seller's pen.", "The date the broker wants for a shorter option period.", "The scheduled appraisal date, which automatically establishes acceptance.",
  "A private signature is not a substitute for verifying formation and communication. The effective-date record must reflect the actual events, not a chosen date.");
add("T02U6", "resale", "20-19 execution page and ¶5 — effective date as deadline anchor",
  "Both parties agree that final acceptance was communicated Wednesday. An agent accidentally writes Monday in the effective-date blank, shortening the buyer's apparent delivery deadline. What is the appropriate next step?",
  "Promptly document and resolve the incorrect date with the parties and appropriate advice, preserving the true communication evidence.", "Leave Monday because an agent's entry can override the actual agreement.", "Secretly change copies without informing the parties.", "Treat every obligation as cancelled automatically by the clerical mistake.",
  "An erroneous administrative entry must be addressed transparently. Evidence of the actual agreement matters; the agent cannot unilaterally manufacture earlier obligations.");
add("T02U6", "resale", "20-19 execution and receipt sections — formation versus escrow receipt",
  "The parties complete their binding agreement Thursday; the escrow office records receipt Friday and the lender opens a file Monday. Which later event alone changes the contract's effective date?",
  "Neither escrow receipt nor loan-file opening alone changes the established effective date.", "Friday receipt necessarily replaces final acceptance.", "Monday lender processing necessarily starts every contract period.", "Whichever later event gives the buyer more time controls automatically.",
  "Formation, escrow receipt and lender processing are different events. Separate receipt dates are useful records but do not independently rewrite the agreed effective date.");

// T03 — Parties, Property and Financing: 14 applications; lender approval is not a promise by an agent.
add("T03U1", "resale", "20-19 ¶3A–C; original arithmetic from the stated transaction",
  "A $685,000 purchase uses a $493,000 new loan and a $72,000 seller note. All financing is accurately disclosed. What amount belongs in the cash portion of the price, before separate settlement adjustments?",
  "$120,000.", "$192,000.", "$565,000.", "$613,000.",
  "The cash portion is685,000 minus493,000 minus72,000. The seller note is financing, not cash, and settlement credits must not be confused with the paragraph3 price components.");
add("T03U1", "thirdParty", "40-11 ¶1A — loan amount, rate and Origination Charges limits",
  "A lender quote meets the stated principal and rate limits but its Origination Charges exceed the negotiated maximum. The buyer asks whether checking 'conventional' alone approved these terms. What must be evaluated?",
  "The full negotiated financing terms and the applicable approval and notice provisions.", "Only the loan type, because entered charge limits have no contractual effect.", "Only the monthly payment, because it replaces all other financing fields.", "The purchase price alone, because financing limits bind only the lender.",
  "The addendum identifies more than a loan label. The agent must compare the actual terms and deadlines, without promising an automatic release or rewriting the lender's quote.");
add("T03U2", "resale", "20-19 ¶2B–D — included property and exclusions",
  "The seller wishes to retain a permanently installed generator that otherwise falls within the agreed improvements. Which preparation issue must be resolved before the buyer accepts an offer expecting that generator?",
  "State an agreed exclusion clearly and reconcile the parties' property expectations.", "Omit it from photographs; omission automatically excludes a fixture.", "Leave the exclusion blank and remove it immediately before closing.", "Call it personal property verbally without addressing the written inclusion.",
  "Classification and the written agreement matter. A seller's undisclosed intention or an agent's label does not remove an included improvement from the bargain.");
add("T03U2", "resale", "20-19 ¶4B — fixture leases",
  "Roof-mounted equipment is owned by a leasing company rather than the seller. The buyer expects a transfer free of lease payments. Which unresolved distinction is essential?",
  "Ownership of the equipment and the separate leased-fixture obligations.", "All attached equipment becomes seller-owned when listed.", "A fixture lease is automatically paid off by the buyer's earnest money.", "A deed automatically cancels every third-party equipment lease.",
  "Physical attachment does not establish seller ownership or eliminate a third-party lease. The transaction must address the actual leased interest and the appropriate fixture-lease documentation.");
add("T03U3", "thirdParty", "40-11 ¶2A — buyer-approval termination documents",
  "Within an applicable buyer-approval period, the buyer sends a timely termination email but omits the lender's written statement explaining its adverse decision. Which required component is missing under paragraph2A?",
  "The lender's written reasons accompanying the buyer-approval termination.", "An appraisal even though the denial concerns the buyer's income.", "A seller-signed amendment admitting buyer default.", "A title-company promise that the loan would have funded.",
  "The paragraph calls for both notice and the written lender statement. A timely email alone should not be represented as satisfying both requirements.");
add("T03U3", "assumption", "41-3 ¶D(2)–(3),E — noteholder terms and consent",
  "An existing lender offers consent only if the buyer accepts a rate above the assumption addendum's maximum. The seller says any consent satisfies the addendum. Which omitted issue changes that analysis?",
  "The noteholder's proposed terms must also be tested against the assumption protections.", "Consent erases every stated interest-rate limitation.", "An assumption always creates a new third-party loan at any offered rate.", "Only the seller's prior payment history matters once consent is offered.",
  "Consent and acceptable assumption terms are separate. ParagraphD addresses excessive rates and modifications; the existence of a consent offer alone does not settle those protections.");
add("T03U4", "sellerFinance", "26-8 ¶C(2) — installment basis and maturity",
  "The parties choose monthly installments 'including interest' and a balloon maturity after five years. A draft note instead charges the installment plus interest with no balloon. What should the closing team do?",
  "Reconcile both payment basis and maturity with the agreed addendum through qualified document preparation.", "Use the note because any monthly payment method is equivalent.", "Delete the maturity provision without consulting the parties.", "Assume including and plus interest always produce identical cash flows.",
  "Payment basis and balloon maturity are material, separate terms. The note should reflect the actual agreement, with qualified help rather than unilateral drafting by an agent.");
add("T03U4", "sellerFinance", "26-8 ¶D(3)(b) — required tax/insurance escrow",
  "The selected seller-financing provision requires escrow, but the seller intends to mix those funds into an operating account and provide no annual statement. What is inconsistent with the selected form provision?",
  "It requires a separate escrow account and an annual accounting, among other duties.", "Escrow deposits become unrestricted additional interest when received.", "The buyer's duty to deposit eliminates all seller servicing duties.", "A seller's separate account is required only if the property is a condominium.",
  "The selected escrow arrangement creates handling and reporting obligations. Deposits are not unrestricted financing income, and a signature does not waive the stated accounting.");
add("T03U5", "releaseVA", "12-3 ¶A and¶B — independent release/restoration elections",
  "A lender releases the seller from personal loan liability, but the VA has not approved restoration of the seller's entitlement. Which file conclusion is supportable?",
  "One protection may be satisfied while the separate entitlement-restoration issue remains unresolved.", "Release automatically restores all entitlement without VA review.", "Restoration and personal liability are two names for the same approval.", "The seller's next purchase price alone determines whether entitlement is restored.",
  "ParagraphsA andB address different approvals. Evidence of one cannot be substituted for evidence of the other.");
add("T03U5", "releaseVA", "12-3 ¶A(2) — selected effect of missing release approval",
  "The parties deliberately check that failure to obtain release approval will not delay closing. Approval remains missing on the closing date. What must an agent avoid saying?",
  "That the checked provision automatically terminates the contract and refunds earnest money.", "That the checked election must be reviewed with the unresolved personal-liability risk.", "That actual release must be verified rather than inferred from assumption.", "That the parties should obtain qualified advice about proceeding without release.",
  "The two alternatives have different consequences. The selected no-delay alternative is not the automatic-termination alternative and does not itself produce a release.");
add("T03U6", "thirdParty", "40-11 ¶¶1G and2B — other financing and property-approval election",
  "A buyer uses privately arranged third-party financing of a type entered under Other Financing. The file contains an unresolved checkbox about waiving paragraph2B termination rights. Which quality-control action is necessary?",
  "Obtain the parties' actual election before treating the property-approval right as retained or waived.", "Assume the right is waived because the lender is private.", "Assume every unchecked choice creates both alternatives simultaneously.", "Replace the financing source with seller financing to avoid the checkbox.",
  "Other Financing includes an express election affecting property-approval rights. The agent must not invent that material choice from the lender's identity.");
add("T03U6", "assumption", "41-3 ¶C — assumed balance variance and chosen adjustment",
  "An assumption file selects adjustment of cash payable at closing for a changed principal balance, with the price fixed. The verified debt is $4,200 lower than anticipated and no termination threshold is exceeded. What is the directional adjustment?",
  "Buyer cash increases $4,200 to keep the same total price.", "Buyer cash decreases $4,200 while the price remains fixed.", "The price falls $4,200 despite the selected cash adjustment.", "The variance automatically becomes seller-financed debt.",
  "With a fixed price, a smaller assumed debt requires more cash. The selected adjustment controls; it is not automatically a price reduction or a new loan.");
add("T03U6", "sellerFinance", "26-8 ¶B — missing documents versus unacceptable credit",
  "The buyer timely delivers every required credit document. The seller then timely terminates because that completed information shows unacceptable credit. Which earnest-money treatment does paragraphB specify for that stated reason?",
  "Refund to the buyer.", "Payment to the seller under the missing-document remedy.", "Automatic payment to the broker as a finance fee.", "Permanent retention by escrow regardless of a proper release process.",
  "The form distinguishes failure to furnish documents from timely rejection of credit after delivery. Those branches have different earnest-money consequences.");
add("T03U6", "thirdParty", "40-11 ¶4 — FHA/VA protection and paragraph2B deadline exception",
  "A transaction qualifies for paragraph4's FHA/VA appraisal protection. A colleague says that protection necessarily expired solely because paragraph2B's third-day-before-closing deadline passed. What does paragraph4 expressly require the reviewer to recognize?",
  "The paragraph2B three-day notice requirement does not apply to paragraph4.", "All FHA/VA valuation protections automatically vanish three days before closing.", "A lender's appraisal warrants the property's physical condition.", "The buyer must always pay any valuation shortfall from undisclosed borrowed funds.",
  "The form expressly separates paragraph4 from that paragraph2B deadline. The actual FHA/VA conditions must still be evaluated; the exception is not a general promise that every denial permits cancellation.");

// T04 — Covenants, Commitments and Notices:14 items across nine units.
add("T04U1", "resale", "20-19 ¶5A — application of delivered money",
  "One timely $2,650 payment covers a $450 option fee and $2,200 earnest money. The escrow ledger classifies the entire amount as earnest money. Which correction follows the form's allocation order?",
  "Apply $450 to the option fee first and $2,200 to earnest money.", "Apply all funds to earnest money because the larger amount controls.", "Split both obligations equally regardless of the agreed amounts.", "Treat the entire payment as an additional brokerage fee.",
  "Paragraph5 allocates a combined delivery first to the option fee, then earnest money and then additional earnest money. Accurate classification matters even when the total is correct.");
add("T04U1", "resale", "20-19 ¶5C — seller notice before late earnest-money delivery",
  "The buyer delivers late earnest money before the seller sends a notice exercising paragraph5C termination. Why should the agent not assure the seller that the missed delivery date alone already terminated the agreement?",
  "The paragraph5C right is exercised by notice before the buyer delivers the earnest money.", "Every missed deposit date automatically terminates the contract without notice.", "Earnest money may never be delivered after an effective date.", "Only the buyer can enforce an earnest-money delivery obligation.",
  "The form supplies a particular notice-and-timing mechanism. The agent must examine the actual sequence rather than treating default allegations as self-executing termination.");
add("T04U2", "resale", "20-19 ¶5A–B — option fee disposition",
  "The buyer properly terminates under an effective option and asks the seller to refund the option fee because the earnest money is refundable. Which distinction is correct under the form?",
  "The option fee is not refundable merely because option termination returns earnest money.", "Option fee and earnest money must always be refunded together.", "An exercised option converts its fee into a refundable lender deposit.", "The escrow agent becomes the beneficial owner of the option fee.",
  "The fee pays for the termination option; the form separately addresses earnest-money refund and crediting the option fee to the sales price if closing occurs.");
add("T04U3", "resale", "20-19 ¶6A–B — policy, commitment and exception documents",
  "A buyer receives a commitment listing an easement but none of its referenced recorded documents. What remains necessary for informed title review?",
  "Review the actual exception documents and applicable objection rights, not just the commitment's cover page.", "Assume a commitment removes every listed exception before closing.", "Treat the easement as unenforceable solely because no copy accompanied the email.", "Ask the agent to insure title personally instead of obtaining the documents.",
  "A commitment proposes coverage subject to conditions and exceptions. The referenced documents are part of the review package; their legal effect cannot be inferred from a short label alone.");
add("T04U3", "resale", "20-19 ¶6D — new matters and renewed objection period",
  "After the original title-objection period, a revised commitment first adds a material new exception. The seller says every possible objection was waived by the earlier deadline. Which provision must be checked?",
  "The paragraph6D procedure for a revised document or new matter.", "An automatic waiver of all future matters regardless of when disclosed.", "The option-fee receipt because it replaces title review.", "The seller's listing date as the sole objection deadline.",
  "The form addresses new matters separately. An expired period for earlier materials is not a blanket waiver of later newly disclosed matters.");
add("T04U4", "resale", "20-19 ¶6C(1) — non-delivery versus rejection of existing survey package",
  "The selected existing-survey provision is used. The seller delivers both the survey and required affidavit or declaration on time, but the lender rejects the package. Which cost question must be read from the selected terms?",
  "Who was selected to pay for a replacement survey when the timely package is unacceptable.", "The seller always pays because rejection is identical to non-delivery.", "The buyer always pays because lenders can never reject a seller's survey.", "The title company always pays without regard to the contract.",
  "The form separates missing timely delivery from a timely package's rejection. The stated expense election governs the rejection branch.");
add("T04U4", "resale", "20-19 ¶6C(2) — buyer survey and financing termination limitation",
  "The buyer chose the buyer-obtained-survey provision but elected not to obtain a survey. The lender later requires one. Why is a blanket paragraph2B financing-termination assurance unsafe?",
  "Paragraph6C(2) limits reliance on failure to obtain that survey as a paragraph2B termination reason.", "A buyer's survey choice permanently waives all unrelated financing protections.", "Every lender-required survey is automatically paid for by the seller.", "A missing survey converts the purchase into a cash contract.",
  "The selected survey provision contains a specific limitation tied to not obtaining the survey. It neither guarantees termination nor erases all other financing protections.");
add("T04U5", "resale", "20-19 ¶6C(1) and¶6E(1) — separate survey and title-advice documents",
  "A file contains written advice to obtain a title policy but lacks the required survey affidavit or declaration for the selected existing-survey option. Which conclusion is accurate?",
  "Title advice does not substitute for the survey affidavit or declaration.", "Any document with the buyer's name satisfies all survey-document requirements.", "A broker's title-advice notice certifies that the survey is current.", "The notice replaces both the survey and title commitment.",
  "The documents have different functions. Title advice directs the buyer toward title protection; it is not the seller's survey-related factual statement.");
add("T04U6", "resale", "20-19 ¶7E — lender-required repairs",
  "A lender requires a $7,400 correction before funding. The parties have not agreed in writing who will pay or perform it. Which starting point follows paragraph7E?",
  "Neither party is obligated by that paragraph to make or pay for the lender repair without written agreement.", "The seller automatically owes any repair demanded by any lender.", "The buyer must pay because the lender is the buyer's lender.", "The broker must split the repair equally between the parties.",
  "The lender's underwriting demand and the parties' contractual allocation are distinct. Paragraph7E supplies an agreement and termination framework, not an automatic seller invoice.");
add("T04U6", "resale", "20-19 ¶7F — completion and documentation of agreed work",
  "A promised electrical repair is marked complete, but no required permit, scope document or payment evidence is available. Which is the best review action before claiming full compliance?",
  "Verify the agreed work and paragraph7F documentation through the appropriate licensed trade and closing process.", "Treat a seller's checkmark as conclusive compliance with every requirement.", "Have the agent issue an electrical-code certification.", "Ignore the repair agreement because the buyer accepted the property's general condition.",
  "The repair obligation includes the stated performance standards and documentation. General acceptance does not erase specifically agreed work, and an agent is not the licensed repair professional.");
add("T04U7", "lead", "56-0 ¶C(2) — inspection period and separate notice period",
  "The buyer selected the unwaived lead-inspection option. A timely inspection identifies lead, and written termination is delivered on day12 after the effective date. Which distinction must be considered before rejecting it as 'after day10'?",
  "The form separates the ten-day inspection period from its fourteen-day written-termination period.", "Every lead-related contractual action expires on the inspection's first day.", "The inspection deadline automatically gives an unlimited termination period.", "The form requires termination before any inspection may begin.",
  "The current56-0 uses different periods for inspection and the specified termination process. The stated facts must be tested against both, not a single shorthand deadline.");
add("T04U7", "resale", "20-19 ¶7B(2) — seller disclosure delivered after effective date",
  "The selected paragraph7B(2) applies. The seller finally delivers the notice two days before closing, with no other extension agreed. Which limit appears in the buyer's resulting notice-based termination provision?",
  "Seven days after receipt or before closing, whichever occurs first.", "Exactly seven days after receipt even if closing already occurred.", "Until the first mortgage payment regardless of closing.", "Only the original option period, regardless of the later disclosure provision.",
  "The provision expressly uses the earlier of the receipt-based period and closing. It should not be represented as automatically extending closing by seven days.");
add("T04U8", "environmental", "28-2 — selected report, adverse effect and notice within negotiated days",
  "The buyer selected a wetlands report and receives it within the negotiated period. The report identifies a restriction adversely affecting the planned use. What package does the addendum require to exercise its stated termination mechanism?",
  "A copy of the applicable adverse report and notice of termination within the agreed period.", "A verbal statement that the buyer dislikes wetlands, with no report or timely notice.", "A lender's loan denial even when environmental termination is the selected right.", "An automatic court order declaring every wetland parcel unsaleable.",
  "The addendum ties its right to the selected professional report, adverse effect on use, and timely delivery of both report and termination notice.");
add("T04U9", "resale", "20-19 ¶7H — optional service contract and coverage exclusions",
  "A buyer expects a residential service contract to pay for every future roof, appliance and structural problem. What should the agent explain before the buyer relies on it?",
  "Coverage, limits and exclusions must be checked; it is not an unlimited substitute for inspection.", "Any service contract guarantees all property components for life.", "The seller's contribution automatically removes all policy exclusions.", "A service contract is the same document as an owner's title policy.",
  "Paragraph7H alerts the buyer to coverage limitations. A contribution toward an optional service contract does not expand its terms or replace property due diligence.");

// T05 — Closing, Possession and More:19 items, including a separate closing-file workshop set.
add("T05U1", "resale", "20-19 ¶10A — possession at closing and funding",
  "The parties selected possession at closing and funding. All signatures are complete at noon, but the escrow office confirms funds have not been received. What must be checked before handing over possession?",
  "Whether funding has occurred or a separate written possession arrangement authorizes earlier occupancy.", "Whether the buyer has signed; that alone satisfies both closing and funding.", "Whether the moving company has arrived; that automatically accelerates possession.", "Whether the buyer bought insurance; insurance alone changes the possession clause.",
  "The selected condition includes both closing and funding. A signature appointment, moving schedule or insurance policy is not a substitute for the contractual trigger.");
add("T05U1", "resale", "20-19 ¶10B — smart-device credentials and seller disconnection",
  "The seller supplies the smart-lock password but keeps remote access through a personal phone after delivering possession. What additional contract duty is unresolved?",
  "Terminate and remove the seller's personal-device access and connections to the conveyed improvements and accessories.", "Nothing; providing any one password completes every handoff duty.", "Replace all smart devices at the seller's expense regardless of their condition.", "Transfer ownership of the seller's personal phone to the buyer.",
  "The form requires both operational access information for the buyer and removal of the seller's relevant connections. One does not substitute for the other.");
add("T05U2", "resale", "20-19 ¶11 — informational items versus modified legal obligations",
  "Which proposed entry requires legal drafting authority rather than being treated as a mere factual instruction: a delivery contact, an access appointment, a property-identification clarification, or a new penalty for delayed funding?",
  "A new penalty for delayed funding.", "A delivery contact that changes no contractual notice requirement.", "An agreed access appointment that changes no substantive right.", "A factual property-identification clarification that changes no property conveyed.",
  "The penalty alters the parties' legal obligations and remedies. Truly factual entries can be informational, but labels cannot turn a new remedy into a neutral instruction.");
add("T05U2", "rules", "22TAC §537.11; 20-19 ¶11 — agent role in modifying form provisions",
  "To speed acceptance, an agent deletes the printed mediation provision without a party- or attorney-drafted change. Why is the blank Special Provisions space no defense?",
  "The restriction covers deletion or modification of form provisions, not only text inserted into a blank.", "Printed terms may be deleted freely as long as no new words are added.", "Mediation is automatically prohibited in all financed sales.", "A commission split gives the agent independent power to change dispute remedies.",
  "Unauthorized alteration can occur through deletion as well as new language. The manner of editing does not expand the license holder's drafting authority.");
add("T05U3", "sellerLease", "15-7 ¶¶1–4 — reversed landlord/tenant roles and commencement",
  "A seller remains in the home for twelve days after a closed and funded sale under the seller's temporary lease. Who is landlord, and what event begins that lease?",
  "The buyer is landlord; closing and funding begin the lease.", "The seller remains landlord because the seller originally owned the home.", "The buyer is tenant until the seller moves out, regardless of the form.", "The listing broker is landlord from the date the offer was submitted.",
  "After transfer, the buyer leases the property back to the seller. The roles in the sale and lease must be distinguished, and the selected form states the commencement event.");
add("T05U3", "buyerLease", "16-7 ¶4 — early-possession rent separate from purchase items",
  "A buyer pays the anticipated early-possession rent in advance under16-7. The buyer then subtracts that rent from the cash price at closing because 'all money paid should count toward purchase.' What does the lease provide?",
  "The rent is not applied to items covered by the purchase contract; term differences have a separate adjustment.", "All temporary rent automatically reduces the purchase price dollar for dollar.", "Rent automatically becomes option money if the sale closes.", "The landlord must waive rent whenever the buyer obtains financing.",
  "Lease consideration and purchase consideration are distinct. The form addresses adjustment for a changed actual lease term without converting rent into a purchase-price credit.");
add("T05U3", "sellerLease", "15-7 ¶5 — deposit accounting and forwarding-address condition",
  "A former seller has surrendered possession but has not supplied written notice of a forwarding address. Which two events must be tracked under the lease's stated deposit-return timing?",
  "Surrender of possession and written notice of the tenant's forwarding address.", "Only the original sale's effective date and the lender's approval date.", "Only the landlord's purchase-loan first-payment date.", "The broker's commission receipt and the tenant's verbal moving estimate.",
  "The lease ties the thirty-day accounting period to both stated tenant actions. The sale chronology does not replace the lease's deposit conditions.");
add("T05U4", "resale", "20-19 ¶12A(1)(b),12B — separate concession and brokerage contribution",
  "The parties enter a $9,000 expense concession in12A(1)(b), with no12B contribution. A settlement draft applies $5,000 of that concession to buyer-broker compensation. What mismatch requires correction or a properly agreed change?",
  "The expense concession excludes brokerage compensation and contributions under12B.", "Every12A concession automatically pays all broker fees first.", "Brokerage compensation is a tax and therefore always part of12A.", "An unused concession must be paid to the buyer as unrestricted cash.",
  "The current form separates ordinary buyer expenses from brokerage contributions. Settlement coding should reflect that distinction rather than silently reallocating the concession.");
add("T05U4", "resale", "20-19 ¶12C — governmental-program prohibited expenses",
  "A governmental loan program prohibits the buyer from paying a particular charge, and an agreed12A concession is available. Under12C, how is that concession prioritized?",
  "First toward the prohibited expense, then other eligible buyer expenses, excluding brokerage compensation.", "First toward broker compensation, with prohibited expenses left to the buyer.", "Equally across every expense regardless of program restrictions.", "As automatic cash back before any actual charge is considered.",
  "Paragraph12C provides an allocation order; it does not authorize a prohibited buyer charge or convert concessions into unrestricted proceeds.");
add("T05U5", "resale", "20-19 ¶13 — adjustment when actual current-year taxes become available",
  "The parties close using a tax estimate. The actual current-year tax statement later differs. A party says closing made the estimated proration permanently final. What does paragraph13 contemplate?",
  "A later adjustment of prorations using the actual current-year tax statement.", "No adjustment under any circumstances after signing the settlement statement.", "Automatic cancellation of the deed whenever estimated taxes differ.", "Payment of the entire difference by the broker regardless of agreement.",
  "The form expressly anticipates that actual current-year taxes may differ from the closing estimate and calls for a corresponding proration adjustment.");
add("T05U5", "resale", "20-19 ¶14 — casualty election, carrier permission and deductible credit",
  "A casualty cannot be restored by closing for reasons beyond the seller's control. The buyer considers accepting the damaged property with assigned insurance proceeds. Which additional conditions belong in that analysis?",
  "Carrier permission for assignment and a seller credit for the deductible, under the stated election.", "Automatic assignment regardless of the insurance carrier's restrictions.", "Mandatory buyer acceptance of the damage with no other contract choices.", "Automatic loss of earnest money whenever casualty occurs after acceptance.",
  "That election includes both an assignment condition and deductible credit. It is one alternative in the casualty paragraph, not an automatic result of the casualty.");
add("T05U6", "resale", "20-19 ¶18C — demand, objection and discretionary disbursement",
  "Escrow forwards one party's written demand to the other party. Fifteen days pass without a written objection. A broker orders escrow to release the money, asserting the form says 'must.' What is the textual distinction?",
  "The paragraph says escrow may disburse under the stated process; it does not command the broker to adjudicate entitlement.", "Silence automatically transfers the escrow account into the broker's ownership.", "Any oral objection always satisfies the written-objection condition.", "The demand procedure eliminates every other release or legal issue.",
  "The form's discretionary disbursement language is not a blanket entitlement judgment. The actual demand process and any other applicable circumstances still matter.");
add("T05U6", "resale", "20-19 ¶18E — objection effective on receipt by escrow",
  "An escrow objection is transmitted just before the deadline but received by escrow afterward. Which special timing language must the reviewer examine instead of relying only on paragraph21?",
  "Paragraph18E makes an objection to escrow effective on receipt.", "Every escrow objection is effective when the sender begins drafting it.", "The buyer's lender may receive an objection in place of escrow in all cases.", "An objection is unnecessary whenever the party disagrees privately.",
  "A specific receipt rule governs this escrow objection. General notice language should not be used to erase that express condition.");
add("T05U7", "resale", "20-19 ¶19 — representations and agreements surviving closing",
  "A seller claims every representation necessarily disappears when the deed is delivered. Which contract provision must be considered before accepting that claim?",
  "The provision that the contract's representations, covenants and warranties survive closing.", "An automatic merger of every promise regardless of the survival language.", "A rule that only unsigned statements can survive a closing.", "The earnest-money amount, which alone determines survival.",
  "The agreement expressly addresses survival. The agent should refer disputed legal consequences appropriately, not announce that deed delivery erases every stated obligation.");
add("T05U7", "resale", "20-19 ¶16 — mediation and equitable relief",
  "During a dispute, a party needs urgent equitable relief and is told that the mediation paragraph absolutely forbids going to court first for that relief. What exception does the paragraph preserve?",
  "It does not preclude seeking equitable relief from a court with jurisdiction.", "It makes the broker the final arbitrator of every dispute.", "It eliminates all court proceedings after any informal discussion.", "It requires the buyer alone to pay every mediation cost.",
  "The mediation provision includes an express equitable-relief carveout and equal mediation-cost sharing. It is not a promise to forgo all judicial protection.");
add("T05U8", "resale", "20-19 ¶22 and execution page — complete written agreement",
  "A signed contract references an attached negotiated page, but the buyer's copy and seller's copy contain materially different versions. What should happen before the file is treated as a finalized agreement?",
  "Reconcile the actual agreed version and obtain appropriate confirmation, preserving the conflicting records.", "Choose the version that produces the larger brokerage fee.", "Assume the attachment with the latest computer timestamp was mutually accepted.", "Destroy the inconsistent version so the file appears complete.",
  "Version integrity is substantive when terms differ. A timestamp or cleaner file is not evidence of mutual assent, and conflicting records should not be concealed.");
add("T05U9", "resale", "20-19 ¶¶9A and7F — distinct closing extensions",
  "A closing reviewer sees a possible title-objection extension and a separate incomplete-agreed-repair extension. What is the correct scheduling method?",
  "Apply each provision to its own facts and documented election instead of assuming one generic extension rule.", "Use the longest number printed anywhere in the contract for every delay.", "Treat lender scheduling as an automatic extension of every contractual deadline.", "Delete both provisions because a closing date was entered.",
  "The contract uses different triggers and procedures for different delays. A reliable timeline identifies which actual provision applies, rather than transferring a number from one clause to another.");
add("T05U9", "resale", "20-19 ¶¶3,5A,12 — original settlement reconciliation",
  "Before prorations and other expenses, a $410,000 sale has $328,000 financing and $6,000 earnest money already credited. No other price deposit exists. Which remaining price cash amount avoids counting earnest money twice?",
  "$76,000.", "$82,000.", "$88,000.", "$404,000.",
  "The cash price portion is82,000; subtract the6,000 already held toward that obligation to obtain76,000. This is not the full cash-to-close calculation because separate expenses and prorations are excluded by the question.");
add("T05U9", "sellerLease", "15-7 ¶4 — rent excluding closing/funding day; original calculation",
  "A seller lease begins at closing and funding on October2 and ends after occupancy through October8. The agreed daily rent is $185, and the closing/funding day is excluded. What rent covers the stated six chargeable days?",
  "$1,110.", "$1,295.", "$925.", "$1,480.",
  "October3 through8 are six chargeable days;6×185=1,110. The lease expressly excludes the closing-and-funding day from rental, unlike an assumed seven-day count.");

// T06 — Remaining Promulgated Forms:18 cases, including the different paragraph structures.
add("T06U1", "condominium", "30-18 ¶2A and front-page use limitation",
  "A marketing brochure calls a residence a 'condo-style cottage,' but the deed and recorded subdivision establish fee-simple ownership of the land beneath it, not a condominium unit. What should guide form selection?",
  "The legal ownership and transaction facts, not the brochure's architectural label.", "Any use of the word condo in advertising makes30-18 mandatory.", "An attached wall alone determines whether the owner holds condominium title.", "The buyer's preferred loan program changes the recorded ownership form.",
  "Condominium status is a legal property structure. The form's use limitation and recorded documents matter more than an advertising description.");
add("T06U1", "newComplete", "24-20 — scope identified by the current TREC form and property condition provisions",
  "A recently renovated house has been occupied for years. A seller calls it 'like new' and asks for the new-home-completed-construction form solely for that reason. What is missing from that analysis?",
  "The distinction between a previously occupied resale and a newly completed, never-occupied builder home.", "The rule that every renovation converts an existing house into new construction.", "The assumption that a new appliance package changes the property's contract category.", "The buyer's ability to waive all form-selection rules verbally.",
  "Cosmetic condition and the applicable transaction type are not the same. The completed-new-home form is not selected merely because a resale has new finishes.");
add("T06U2", "condominium", "30-18 ¶6C compared with20-19 ¶6D — objections",
  "A reviewer copies a resale checklist instructing a condominium buyer to use paragraph6D for objections. In30-18, paragraph6D contains title notices. What does this demonstrate?",
  "Paragraph numbers and procedures must be mapped in the actual selected form rather than carried over by memory.", "All TREC contracts have identical paragraph lettering for every topic.", "Condominium buyers have no objection process because the letter differs.", "A checklist overrides the signed form when headings conflict.",
  "The condominium form places objections in6C. Related forms share concepts but not every paragraph label; a transplanted checklist can direct a student to the wrong provision.");
add("T06U2", "farm", "25-17 ¶4D — surface leases, including oral arrangements",
  "A ranch seller provides oil-and-gas leases but omits an oral grazing arrangement, reasoning that only written natural-resource leases need attention. Which additional provision exposes the gap?",
  "The farm form separately addresses surface leases and specified information about oral surface arrangements.", "All oral leases cease to exist automatically when the property is listed.", "A mineral lease disclosure necessarily describes every surface tenant.", "The buyer must discover every tenant independently because leases are never a seller-document issue.",
  "The farm form distinguishes natural-resource and surface arrangements and addresses oral surface leases. Providing one category's documents is not complete disclosure of the other.");
add("T06U3", "condominium", "30-18 ¶2B–C — Documents versus Certificate",
  "The buyer has the declaration and bylaws but no current resale certificate. The agent checks that both 'Documents' and 'Certificate' were received because association papers exist. What is the error?",
  "Governing documents and the financial/status resale certificate are distinct deliverables.", "A declaration automatically supplies every current financial fact in a certificate.", "The certificate is merely a duplicate title policy.", "Receipt of any association email waives all missing-document rights.",
  "The form separately defines and records these categories. Receipt should be supported for each rather than inferred from the presence of unrelated association material.");
add("T06U3", "condominium", "30-18 ¶2C — age measured to delivery",
  "A resale certificate was prepared four months before it is delivered to the buyer. It was less than three months old when the seller ordered it. Which date comparison does the contract require?",
  "Preparation must be no more than three months before delivery to the buyer.", "Age is measured only when the seller first requests the certificate.", "A certificate never becomes stale once an association signs it.", "The contract measures age only from the lender's appraisal date.",
  "The form expressly measures the certificate's preparation date against delivery, not its request date. Ordering a timely document does not prove that the delivered document still meets the stated age limit.");
add("T06U3", "condominium", "30-18 ¶2D — right of refusal certification and effective-date mechanism",
  "Condominium documents reveal an applicable association right of refusal. The required certification arrives later and confirms compliance and nonexercise or waiver. What unusual timing mechanism must be considered?",
  "Paragraph2D provides for amending the effective date to the buyer's receipt of the required certification.", "The buyer's first viewing date automatically becomes the effective date.", "The association's annual-meeting date replaces all contract deadlines.", "Receipt of association certification has no possible effect under this paragraph.",
  "The condominium form includes a specific certification-related effective-date mechanism. It must be read with its deadline and termination conditions, not treated as ordinary receipt of marketing material.");
add("T06U4", "farm", "25-17 ¶2D — growing crops and delivery of possession",
  "No different crop arrangement is written. Closing occurs Monday, while agreed delivery of possession is Friday. The seller wants to harvest growing crops Tuesday. Which event controls the default crop-harvest cutoff in the form?",
  "Delivery of possession, not closing alone.", "The date the property was first advertised.", "The buyer's loan-approval date.", "The first signature on the offer regardless of possession.",
  "Paragraph2D allows the seller's harvest until delivery of possession unless otherwise agreed in writing. Sale and possession events must not be conflated.");
add("T06U4", "farm", "25-17 ¶3D — elected acreage price adjustment; original arithmetic",
  "A ranch price-adjustment election compares75acres with a survey showing77.5acres at$12,400 per acre. No termination threshold is reached. What is the price adjustment before allocating it to cash or financing?",
  "Increase $31,000.", "Decrease $31,000.", "Increase $12,400.", "Increase $955,000.",
  "Only the2.5-acre difference is multiplied by12,400. The result increases the agreed price; the entire surveyed acreage is not repriced from zero under this calculation.");
add("T06U4", "farm", "25-17 ¶2C(1),2E–F — accessories, exclusions and reservations",
  "The parties intend to convey specified portable irrigation equipment but reserve a mineral interest. What file structure avoids treating both intentions as an undifferentiated property note?",
  "Identify the conveyed accessory and document the separate reservation through the appropriate attached terms.", "Assume every portable item and every mineral interest is excluded without writing.", "Use a single undocumented verbal statement to override all property clauses.", "Describe mineral ownership as an equipment serial number.",
  "The farm form separately addresses accessories, exclusions and reservations. The records should establish each intended interest rather than relying on an ambiguous inventory note.");
add("T06U5", "unimproved", "9-18 ¶2 — property description and condominium exclusion",
  "A buyer purchases a separately platted vacant lot with no buildings, additions or fixtures. Which additional fact would make the reviewer reconsider using the unimproved-property form despite the vacant appearance?",
  "The interest is legally a condominium unit rather than the described fee-simple lot.", "The lot has a recorded lot-and-block description.", "The buyer plans a future house that has not been built.", "The buyer intends to obtain a survey.",
  "The form expressly excludes condominium transactions. A vacant appearance does not override the legal nature of the interest being conveyed.");
add("T06U5", "unimproved", "9-18 ¶3D — optional acreage adjustment",
  "The parties check that the sales price will not be adjusted based on the survey. The survey later shows a smaller acreage than a marketing estimate. Which automatic conclusion does paragraph3D not support?",
  "A per-acre price reduction under an adjustment election the parties did not select.", "Review of the actual survey and other applicable contract rights.", "Seeking advice about a material discrepancy or separate misrepresentation issue.", "Negotiating a written price change if both parties agree.",
  "The unchecked adjustment mechanism is not automatically activated by a discrepancy. Other rights or negotiated changes require their own factual and legal basis.");
add("T06U5", "unimproved", "9-18 ¶4A–B — existing leases and post-effective-date changes",
  "After the effective date, the seller signs a new resource lease affecting the vacant parcel without the buyer's written consent. Why is 'there are no buildings' not an answer to the contract issue?",
  "The restriction on creating leases or conveying interests applies to the property, not only buildings.", "Vacant property cannot be subject to any enforceable lease.", "Only residential tenants count as an interest under this form.", "A resource lease is automatically outside every purchase agreement.",
  "Unimproved land can carry significant lease and resource interests. Paragraph4 addresses those interests and restricts new post-effective-date arrangements without the required consent.");
add("T06U6", "newIncomplete", "23-20 ¶7B–C — incorporated Construction Documents and written change orders",
  "A buyer selects upgraded flooring beyond the allowance in the signed Construction Documents. The parties verbally discuss price but sign no change order. What must be resolved under the construction provisions?",
  "Document the authorized change and its cost treatment in writing under the selected form.", "Assume the allowance increases automatically whenever the buyer selects a higher-priced finish.", "Treat an agent's recollection as a substitute for all Construction Documents.", "Delete the allowance from the completed file to avoid showing an overrun.",
  "The incomplete-construction form incorporates defined Construction Documents and requires written change orders. Scope and cost consequences should be reconciled before claiming a settled construction obligation.");
add("T06U6", "newComplete", "24-20 ¶7C–D — manufacturer warranties and insulation information",
  "A completed new-home file includes the builder's sales brochure but omits the agreed warranty writings and required insulation specifications. Which review is appropriate?",
  "Check the form's separate warranty and insulation-information provisions rather than treating the brochure as universal proof.", "Assume a brochure supplies every manufacturer warranty and R-value by implication.", "Treat new construction as exempt from all written property information.", "Ask the agent to create manufacturer ratings from visual inspection.",
  "Different documents establish different representations. The completed-new-home form includes specific warranty and insulation provisions; promotional language is not a substitute for their required information.");
add("T06U7", "newIncomplete", "23-20 ¶7E — substantial completion and outside closing limit",
  "A qualifying material shortage delays construction. The builder argues that any listed delay allows substantial completion to move beyond closing without limit. What restriction remains in the printed provision?",
  "The time for substantial completion may not extend beyond the Closing Date under that paragraph.", "Every listed delay automatically postpones closing indefinitely.", "The lender must waive all inspections whenever materials are unavailable.", "The buyer becomes responsible for construction merely because a delay occurred.",
  "The provision identifies specified delay causes but also an outside closing-date limit. A separate change to closing is not silently supplied by an unlimited-delay reading.");
add("T06U7", "condominium", "30-18 ¶2A(1) — assigned parking and common-element interests",
  "A condominium buyer assumes an advertised parking space is individually owned and freely saleable apart from the unit. The declaration instead assigns a limited common-element use right. What must the reviewer clarify?",
  "The actual assigned right and transfer restrictions shown in the governing documents.", "Every numbered parking space is a separate fee-simple parcel.", "Advertising language overrides the recorded declaration.", "The buyer's lender can turn a use assignment into separate ownership by approving the loan.",
  "The nature of the parking right comes from the condominium's legal documents. Assignment, limited common elements and separately owned property are not interchangeable labels.");
add("T06U7", "farm", "25-17 ¶3D — more-than-ten-percent threshold and notice election",
  "The selected survey-adjustment provision produces an11%price change. A party declares the contract ended automatically without notice. Which step was overlooked?",
  "The form permits termination by written notice within the entered period; the threshold alone is not automatic termination.", "Any price variance automatically cancels every farm contract immediately.", "The threshold eliminates the other party's right to receive notice.", "An agent's worksheet replaces the required party election.",
  "The threshold supplies an election with a notice period. The reviewer must check both the amount and whether the party actually exercised the contractual right.");

// T08 — Other Real Estate Matters:10 separate professional-conduct applications.
add("T08U1", "act", "Occupations Code §1101.652(b)(2),(5) — dishonest conduct and false promises",
  "An agent promises that a lender has guaranteed approval, although the lender only issued a conditional prequalification and the agent knows significant conditions remain. Why is this not cured by later giving the buyer the correct financing addendum?",
  "The agent's knowingly false assurance is a separate conduct issue from providing a standard form.", "Every prequalification is legally identical to unconditional final approval.", "A financing addendum retroactively makes all earlier statements accurate.", "The assurance becomes permissible if the buyer does not ask a follow-up question.",
  "Truthfulness applies to the agent's own representations. Delivering a correct form does not convert a knowingly overstated loan status into an accurate promise.");
add("T08U1", "act", "Occupations Code §1101.652(b)(2),(3),(24) — dishonest and misleading transaction records",
  "A settlement draft accurately shows a concession. A colleague suggests secretly removing it from the lender's copy while leaving it in the buyer's copy to obtain approval. What should the agent do?",
  "Refuse the concealed inconsistency and route an accurate, reconciled transaction record through the broker and closing/lending professionals.", "Use different copies because a lender only needs the price, not actual concessions.", "Hide the discrepancy until after funding and then call it a clerical correction.", "Obtain the buyer's verbal permission and treat that as authorization to mislead the lender.",
  "Materially inconsistent transaction records cannot be legitimized by a private side understanding. Accurate disclosure and reconciliation are required; client consent is not permission for dishonest conduct.");
add("T08U2", "resale", "20-19 ¶12B — independent written compensation obligations",
  "A buyer's separate broker agreement specifies a $12,000 obligation. The purchase contract supplies a $10,000 seller contribution and no amendment of the broker agreement. Which inference is unsupported?",
  "That the contribution alone automatically reduces the separate agreed compensation obligation to $10,000.", "That the contribution must be applied toward the actual separate obligation.", "That the documents should be reconciled before explaining the buyer's remaining amount.", "That brokerage compensation is negotiable rather than set by the state.",
  "Paragraph12B expressly distinguishes contributions from the separate compensation agreement. A contribution is not itself an amendment of that agreement.");
add("T08U2", "act", "Occupations Code §1101.651(a)(2) — out-of-state broker compensation condition",
  "A Texas broker considers paying another state's broker for brokerage work. The out-of-state broker personally conducted the relevant negotiations in Texas without the required Texas authority. Which fact prevents reliance on the stated out-of-state compensation exception alone?",
  "The exception requires that the out-of-state broker not conduct those negotiations in Texas.", "Any foreign-state license permits all brokerage negotiations in Texas without restriction.", "The exception depends only on whether the payment is called a referral fee.", "A Texas client's approval automatically waives the statutory condition.",
  "Section1101.651(a)(2) has a location-of-negotiations condition. The broker must evaluate actual acts and authority, not merely the invoice label or existence of another state's license.");
add("T08U3", "fairHousing", "Property Code §301.023 — false availability representation",
  "A dwelling is available for inspection. An agent tells an otherwise qualified prospect it is unavailable solely because of the prospect's national origin, but continues offering tours to others. Which conduct is directly addressed by301.023?",
  "Discriminatorily misrepresenting an available dwelling as unavailable for inspection.", "Applying the same documented appointment hours to every prospect.", "Accurately reporting an actual executed sale without regard to protected status.", "Asking every prospect for the same lawful scheduling information.",
  "The statute specifically prohibits the stated false availability representation on protected grounds. Neutral, accurate scheduling is different from discriminatory denial disguised as unavailability.");
add("T08U3", "fairHousing", "Property Code §301.025(a)(3),(b)(3) — disability of an associated person",
  "A seller proposes rejecting a buyer because a person regularly associated with that buyer has a disability, even though the buyer does not. No applicable exception or individualized safety basis is established. What does the statute require the agent to recognize?",
  "Protection is not limited to a buyer's own disability; disability of an associated person is also addressed.", "Discrimination is permissible whenever the buyer personally has no disability.", "An association with a person with a disability automatically proves a direct threat.", "The seller's preference overrides disability protections in every brokered transaction.",
  "Section301.025 expressly includes associated persons. The agent cannot reduce the provision to the purchaser's own medical status or substitute speculation for an actual legal exception.");
add("T08U4", "act", "Occupations Code §1101.556(2),§1101.652(b)(3)–(4) — property-related accident and defect",
  "An agent learns that a fatal accident was caused by a still-unrepaired, significant structural defect. The seller invokes the no-duty provision for accidents unrelated to property condition. What is wrong with that reliance?",
  "The stated accident is related to property condition, and the known significant defect requires separate disclosure analysis.", "Every death-related fact automatically eliminates known-defect duties.", "The no-duty provision applies only to new construction.", "A seller's request converts a known defect into legally protected price information.",
  "The cited exception expressly concerns accidents unrelated to condition. It cannot be generalized to conceal a known significant physical defect that caused the incident.");
add("T08U4", "resale", "20-19 ¶8 — personal-interest disclosure threshold",
  "The buyer entity is14%owned by the sales agent handling the transaction. The agent argues that disclosure is unnecessary because the agent is not the majority owner. Which threshold appears in the form?",
  "More than10%ownership, not majority ownership.", "More than50%ownership only.", "Exactly100%ownership only.", "No ownership threshold can require written disclosure before contracting.",
  "The form identifies a more-than-ten-percent business-entity interest. Majority control is not the stated trigger, and the disclosure timing is before the sale contract is entered.");
add("T08U5", "occupancy", "Property Code §92.010(d)(2) — spaces excluded from bedroom definition",
  "To increase a proposed adult-occupancy maximum, a landlord counts a living room and a storage closet as bedrooms solely because portable beds can fit there. What does the statutory definition require the reviewer to recognize?",
  "Living rooms and closets or storage areas are expressly excluded from the bedroom definition in this section.", "Any space containing a temporary bed automatically counts as a statutory bedroom.", "Every square-foot estimate replaces the statute's defined terms.", "The number of people willing to sign the lease determines the bedroom count.",
  "The section defines the counted spaces rather than allowing the landlord to create bedrooms through labels or temporary furnishings. Other safety and fair-housing requirements also remain relevant.");
add("T08U5", "occupancy", "Property Code §92.010(a)–(b) — maximum, exceptions and other legal duties",
  "A landlord cites the three-adults-per-bedroom maximum as a complete answer to a request for a legally required fair-housing accommodation involving occupancy. Which omitted subsection matters?",
  "The exception allowing a higher rate to the extent state or federal fair-housing law requires it.", "A rule that every accommodation is denied whenever the base maximum is met.", "A rule that every accommodation request automatically approves any number of occupants.", "A rule permitting the agent to resolve every building-safety question without facts.",
  "The statute itself preserves required fair-housing exceptions. The actual request still needs proper evaluation; neither automatic denial nor unconditional approval follows from a single number.");

// T07 — Addenda, Notices and Other Forms:18 applications; form title alone does not create a right.
add("T07U1", "saleOther", "10-6 ¶A — receipt of proceeds rather than signing the other sale",
  "The buyer's existing home is under contract, but that sale has not funded and the buyer has not received proceeds by the entered contingency date. The contingency has not been waived. What fact distinguishes acceptance of an offer from satisfying paragraphA?",
  "ParagraphA conditions the purchase on receipt of the other property's sale proceeds.", "Any signed resale offer is equivalent to received proceeds.", "A scheduled closing guarantees the funds have already been received.", "The listing broker's confidence alone satisfies the contingency.",
  "A contract to sell, a closing appointment and receipt of proceeds are different events. The actual contingency must be evaluated using its stated receipt requirement and deadline.");
add("T07U1", "saleOther", "10-6 ¶B — seller notice of accepted offer and required waiver",
  "The seller hears of an interested prospect but has not accepted a written offer. The agent sends a generic 'other interest exists' email and calls it a completed paragraphB demand. What specified predicates need verification?",
  "Acceptance of a written offer and notice both of that acceptance and the requirement to waive the contingency.", "Only the existence of any verbal inquiry about the home.", "Only a new showing appointment, regardless of an accepted offer.", "Only the seller's desire for a shorter deadline, without the stated notice.",
  "ParagraphB identifies an accepted written offer and a two-part notice. A vague competition message is not automatically the contractual demand.");
add("T07U2", "backup", "11-9 ¶I — amendment of first contract is not termination",
  "The first buyer and seller extend their closing date. The backup buyer argues that changing the first contract ended it and activated the backup. Which express provision controls that claim?",
  "An amendment or modification of the first contract does not itself terminate it.", "Every amendment automatically replaces the first buyer with the backup buyer.", "Any changed date makes both purchase contracts simultaneously primary.", "The backup buyer can unilaterally select the first contract's termination date.",
  "ParagraphI prevents treating an amendment as the termination event. The actual termination and notice requirements must be met before the backup's performance schedule changes.");
add("T07U2", "backup", "11-9 ¶A(2),B–C — additional funds allocation and delivery",
  "After an amended effective date, escrow receives a combined $3,150 payment for $650 additional option fee and $2,500 additional earnest money. Which allocation follows paragraphC?",
  "$650 first to the additional option fee, then $2,500 to additional earnest money.", "The entire amount is additional earnest money because this is a backup contract.", "The entire amount refunds the original option fee.", "The payment is automatically a reduction of the broker's fee.",
  "The current backup addendum contains its own additional-payment allocation. The order is additional option fee first, then additional earnest money.");
add("T07U3", "minerals", "44-3 ¶A — express mineral-estate definition exclusions",
  "The seller tries to reserve water rights solely by checking all of the Mineral Estate under44-3. Which definitional issue makes that insufficient by itself?",
  "The addendum's defined Mineral Estate expressly excludes water.", "Water is always included in every mineral reservation regardless of wording.", "The checkbox automatically reserves every interest of every third party.", "The form converts all surface ownership into groundwater permits.",
  "The form uses a defined term that excludes water. A separate water-interest arrangement needs appropriate analysis and drafting, not an assumption that the mineral checkbox captures it.");
add("T07U3", "minerals", "44-3 ¶C — limits of seller's surface-right waiver",
  "The seller waives the seller's mineral-related ingress and egress rights. An existing lessee that is not a party also holds surface rights. What cannot be promised from the seller's election alone?",
  "That the nonparty lessee's rights have also been eliminated.", "That the seller's own election must be considered in the transaction.", "That the existing instruments require qualified review.", "That the buyer should distinguish the seller's rights from third-party rights.",
  "ParagraphC expressly preserves the effect of rights held by other mineral owners or lessees who are not parties. A seller cannot waive someone else's rights through this election.");
add("T07U4", "termination", "38-8 other-ground entry and note — actual authority and no election of remedies",
  "A buyer checks Other and writes a nonexistent contract paragraph into a termination notice. The buyer asks whether the signed notice itself creates the missing right. What is the proper distinction?",
  "A notice communicates an asserted existing basis; signing it does not create a termination right absent from the governing agreement or law.", "Any completed termination form grants an unconditional cancellation right.", "The title company's receipt automatically proves the cited ground exists.", "Using Other transfers every remedy decision to the broker.",
  "The notice must correspond to an actual right and satisfy its conditions. The form also warns that it is not an election of remedies and that earnest-money release is governed separately.");
add("T07U5", "resale", "20-19 ¶¶18 and22 — agreed termination versus scope of release",
  "Both parties want to end their purchase contract but disagree about whether their proposed release also waives a separate damage claim. Which step is appropriate before treating the release as a mere administrative receipt?",
  "Have the parties and counsel resolve the release's actual scope and agreed fund disposition.", "Assume every escrow release automatically waives every possible claim.", "Have the broker insert an undisclosed broad waiver to speed disbursement.", "Treat agreement to stop the sale as conclusive agreement on every remedy.",
  "Mutual termination, fund distribution and waiver of claims are distinct matters. An agent should not decide or draft disputed legal releases under an administrative label.");
add("T07U6", "coastal", "33-2 ¶¶1,3–4 — tide boundary and permission on submerged land",
  "A buyer treats an old fence beside tidally influenced submerged land as a permanent state boundary and plans a dock without further review. Which warning does33-2 make material?",
  "The boundary may change and appropriate surveying, legal review and permission may be required for structures on state-owned submerged land.", "A private fence conclusively fixes the state's boundary forever.", "Ownership of an adjoining tract automatically grants permission for every offshore structure.", "The contract form itself is a state construction permit.",
  "The notice identifies a potentially changing boundary and restrictions on use of state-owned submerged land. A fence or purchase contract is not authoritative boundary or permit evidence.");
add("T07U6", "seaward", "34-4 — erosion, public beach easement and economic-risk notice",
  "A buyer assumes that a building's present location guarantees it will never be affected by the public beach easement. Which risk is the seaward-property notice designed to flag?",
  "Erosion or storms can change the building's relationship to the beach and create removal and economic risks requiring qualified review.", "Every coastal building is automatically state-owned at purchase.", "A signed notice insures the buyer against all erosion loss.", "The buyer may block any public easement merely because the deed is recorded.",
  "The notice warns about moving coastal conditions and possible legal and economic consequences. It neither decides every parcel's boundary nor provides insurance or authority to obstruct public rights.");
add("T07U7", "poa", "36-11 ¶A(2) — buyer-obtained information and deemed receipt",
  "The buyer elected to obtain Subdivision Information by an entered date. Actual receipt is later. Which provision prevents assuming that the review period necessarily starts only on the later actual receipt date?",
  "The buyer-obtained election deems receipt on actual receipt or the specified date, whichever is earlier.", "Every information election uses only actual receipt with no deemed-receipt rule.", "Receipt is automatically postponed until the association's next annual meeting.", "The buyer may choose any start date after reading the information.",
  "ParagraphA(2) differs from seller-delivery and other elections. Its deemed-receipt language must be considered when calculating the applicable review period.");
add("T07U7", "poa", "36-11 ¶C — transfer-charge cap and excluded categories; original arithmetic",
  "Qualifying association transfer charges under paragraphC total $1,460. The buyer cap is $900; regular prorated dues and separate document costs are excluded from the stated total. How is this paragraphC amount allocated?",
  "$900 to buyer and $560 excess to seller.", "$1,460 to buyer regardless of the entered cap.", "$900 to seller and $560 to buyer.", "$730 to each because all closing charges are split equally.",
  "The selected cap limits the buyer's paragraphC allocation, with excess to seller. Categories governed by other paragraphs must not be silently added to or deducted from this isolated calculation.");
add("T07U8", "shortSale", "45-2 ¶A(2) — consent, full liability satisfaction and lien release",
  "A lienholder agrees to release its lien for the sale proceeds but explicitly reserves a remaining personal deficiency claim. Why should that letter not automatically be labeled the complete Consent and Agreement defined in45-2?",
  "The defined requirements also include acceptance in full satisfaction of the seller's mortgage-loan liability.", "Any lien release always cancels all personal debt as a matter of definition.", "The seller's approval of the price binds the lienholder to forgive every balance.", "A brokerage commission reduction alone proves deficiency forgiveness.",
  "Lien release and satisfaction of personal liability are different. The addendum's definition includes both and requires review of what the lienholder actually agreed.");
add("T07U8", "shortSale", "45-2 ¶I — more than one lienholder",
  "The first mortgage lender gives all required short-sale approvals, but a second secured lender has not. Which paragraph prevents declaring the contingency satisfied solely from the first letter?",
  "The addendum applies to each lienholder when more than one lienholder or secured loan exists.", "First-lien consent automatically binds every junior lender.", "The buyer's loan approval extinguishes the seller's second lien.", "A second lien can be omitted whenever the proceeds are insufficient.",
  "All applicable lienholders must be addressed. Priority does not allow the first lender or the agent to supply another creditor's required consent and agreement.");
add("T07U9", "condoCertificate", "32-5 ¶G,J and required attachments — budget, insurance summary and balance sheet",
  "A signed condominium resale certificate arrives without its operating budget, insurance summary or balance sheet. What does a completeness review identify?",
  "The certificate lists those attachments as required; the signature alone does not establish their delivery.", "The attachments are automatically included by the signature even when no files were delivered.", "A sales brochure necessarily replaces all three financial and insurance records.", "The agent should invent figures to fill the absent records.",
  "The form expressly lists the required attachments. Completeness involves the actual delivered package, not simply a signed certification page.");
add("T07U9", "act", "Occupations Code §§1101.558(b-1),1101.563 — information notice versus agreement",
  "A consumer receives an IABS notice and the brokerage's consumer-protection notice. The agent treats those disclosures alone as a signed agreement authorizing a specified buyer-broker fee. What must be distinguished?",
  "Informational disclosures from the separate agreement establishing actual representation and compensation terms.", "A consumer-protection notice automatically sets every brokerage fee.", "Any notice of agency alternatives selects all alternatives simultaneously.", "Delivery of IABS authorizes the agent to sign a sale contract for the consumer.",
  "Required information does not by itself prove a particular representation and compensation agreement. The actual agreement and applicable statutory requirements need their own evidence.");
add("T07U10", "nonRealty", "57-0 ¶B–C — title warranty distinct from condition disclaimer",
  "Personal property listed in57-0 is subject to an undisclosed creditor lien. The seller relies on the form's no-condition-warranty language to avoid the ownership issue. What is the correct distinction?",
  "The condition disclaimer does not erase the separate representation of ownership free of encumbrances.", "No condition warranty means the seller makes no ownership representation either.", "A personal-property lien automatically becomes part of the buyer's new mortgage.", "The additional consideration guarantees the item's future performance instead of title.",
  "ParagraphB addresses ownership and encumbrances; paragraphC addresses condition and future performance. The two provisions must not be merged into a blanket disclaimer.");
add("T07U11", "poa", "36-11 ¶B — material adverse changes before closing",
  "A buyer previously approved Subdivision Information. Before closing, a material adverse change occurs and the seller learns of it. Which later issue remains under paragraphB even though the earlier review was completed?",
  "Prompt notice of the material change and the buyer's stated preclosing termination right must be considered.", "Earlier approval irrevocably waives every later material change under all circumstances.", "Only a new purchase price can revive disclosure of the change.", "The title company must conceal the change to preserve the original approval.",
  "The current addendum separately addresses inaccurate information and material adverse changes before closing. Earlier review is not an excuse to ignore that later provision.");

// T09 — Practice Makes Perfect:12 original cross-document final-review decisions.
add("T09U1", "resale", "20-19 ¶7I(3)(a)–(e) — all conditions for water-disclosure election",
  "A capstone resale receives city water but also has an unused well known to the seller. The packet selects the water-disclosure exception solely because city service exists. Which finding should prevent the reviewer from accepting that selection?",
  "The exception requires all listed conditions; a known well, even unused, defeats the stated no-well condition.", "City service alone satisfies the exception even with a known well.", "Only a currently pumping well matters under the form.", "The buyer's financing election controls whether the seller knows of a well.",
  "Paragraph7I's exception is conjunctive. City service is only one condition, and the well condition expressly includes wells in use or not in use.");
add("T09U1", "resale", "20-19 ¶7A — general inspection access and hydrostatic authorization",
  "In a final transaction file, the buyer has general inspection access and a valid option. The plumber plans hydrostatic testing, but the seller has never authorized that test in writing. What missing item belongs on the review checklist?",
  "Separate written seller authorization for hydrostatic testing.", "Nothing; a paid option automatically authorizes every invasive test.", "A buyer-broker fee amendment instead of testing authorization.", "An owner's title policy endorsement as a substitute for seller permission.",
  "General inspection and option rights do not remove the form's specific written-authorization requirement for hydrostatic testing.");
add("T09U1", "lead", "56-0 ¶B–E — inspection waiver versus disclosure and receipt duties",
  "The buyer waives the lead risk-assessment opportunity, and a reviewer consequently removes the seller's known-lead disclosure, available reports and pamphlet receipt from a pre-1978 home's file. What distinction invalidates that shortcut?",
  "Waiving an inspection opportunity does not waive the separate disclosure and information duties.", "Any inspection waiver eliminates every lead-related duty for everyone.", "The lender's appraisal automatically supplies the missing pamphlet.", "A buyer's waiver converts the home's construction date to1978.",
  "The addendum separately addresses the seller's information, buyer's inspection election, receipt and broker duties. One checkbox is not a global waiver of the other provisions.");
add("T09U1", "resale", "20-19 ¶12B(1) — one contribution basis and separate agreement",
  "The signed draft mistakenly selects both a $8,500 seller contribution and3%of a$450,000 price in a field instructing the parties to select one. Which review result is proper?",
  "Flag the conflicting $8,500 and $13,500 alternatives and obtain the parties' actual agreement before computing the contribution.", "Automatically add both alternatives and charge $22,000.", "Automatically choose the larger amount because it favors brokerage payment.", "Treat3%as a state-mandated fee that overrides the dollar entry.",
  "Three percent of450,000 is13,500, which conflicts with8,500. The form requires one basis; an agent cannot choose or combine the inconsistent alternatives without establishing the actual agreement.");
add("T09U1", "newIncomplete", "23-20 ¶7C — unused allowance and proportionate price adjustment",
  "An incomplete-construction file shows an agreed allowance that was partly unused. The contractor offers to keep the unused amount because the buyer did not request a cash refund. Which contractual treatment must the closing reviewer check?",
  "A decrease from unused allowances reduces the sales price, with the stated cash/financing adjustments as required by the lender.", "Unused allowances automatically increase the builder's price without any agreed change.", "The buyer must accept a private undisclosed cash payment in every case.", "Unused allowances always become additional option fees.",
  "The form addresses decreases and unused allowances explicitly. The closing record should implement that agreed price treatment and appropriate lender adjustments, not an undocumented retention or side payment.");
add("T09U1", "resale", "20-19 ¶6D — receipt of all title-review materials",
  "A resale buyer receives the commitment Monday, exception documents Wednesday and the required survey Friday. The objection clause uses a negotiated number of days after receiving all three, subject to the closing-date limit. Which receipt completes that document set?",
  "Friday's survey receipt, while the separate closing-date limit must also be checked.", "Monday's commitment receipt regardless of the missing documents.", "The first day the title company began its search.", "The seller's original survey date rather than the buyer's receipt.",
  "The stated trigger is receipt of the complete identified set, not its first component. A correct timeline also checks the earlier closing-date limitation.");
add("T09U1", "shortSale", "45-2 ¶C — initial payment duties while consent remains pending",
  "A short-sale buyer has signed the binding contract but postpones all initial earnest money and option fee until lienholder consent. Which express carveout must the reviewer identify?",
  "The addendum preserves earnest-money and option-fee payment as provided in the contract despite the pending contingency.", "No payment can ever be due before lienholder consent.", "Pending consent makes the signed contract legally nonexistent for every purpose.", "The seller's lender is automatically the buyer's escrow agent.",
  "The addendum distinguishes the initial payment duties from performance held pending consent. The contingency does not suspend every obligation.");
add("T09U1", "sellerLease", "15-7 front-page use limitation — no more than90days after closing",
  "A proposed postclosing seller occupancy lasts120days. The team chooses15-7 without review because it is labeled Temporary. What must be addressed?",
  "The form is intended for seller occupancy of no more than90days; an appropriate agreement and legal review are needed for the longer arrangement.", "Calling any term temporary automatically brings it within the90-day form.", "The extra30days automatically become a renewed purchase option.", "The original sale price determines the maximum lease term instead of the form's limit.",
  "The stated use limitation is numerical, not satisfied by a label. A longer occupancy arrangement should not be forced into the form without proper legal evaluation and documentation.");
add("T09U1", "sellerFinance", "26-8 ¶D(1) note — continuing buyer liability without release",
  "A later purchaser assumes a seller-financed note under a transfer provision permitting the conveyance. The original buyer never obtains the noteholder-seller's release. Which assurance would be inaccurate?",
  "That permission to transfer necessarily released the original buyer from personal note liability.", "That transfer consent and release of liability are separate matters.", "That the actual note and release record should be checked.", "That counsel should evaluate the original buyer's continuing exposure.",
  "The form states that liability continues unless the buyer obtains a release from the seller. An allowed transfer is not itself a personal release.");
add("T09U1", "thirdParty", "40-11 ¶2A–B — borrower qualification versus insurability underwriting",
  "The buyer's assets, income and credit satisfy underwriting, but the lender rejects the property's insurability. Which approval category and record should the reviewer evaluate?",
  "Property Approval and the lender's written reasons, with that provision's notice deadline and any applicable elections.", "Buyer Approval only, because every rejection concerns personal credit.", "Automatic approval of the property because the borrower qualified.", "An unlimited right to terminate without written lender evidence.",
  "Paragraph2B expressly includes insurability among property underwriting matters. Borrower qualification does not resolve that distinct approval or eliminate its procedural conditions.");
add("T09U1", "minerals", "44-3 ¶B(2) — reservation fraction of seller's interest; original fraction calculation",
  "Title review establishes that the seller owns40%of the Mineral Estate. The accepted addendum reserves one-quarter of the seller's interest. What share of the whole estate is reserved by that stated fraction?",
  "10%of the whole estate.", "25%of the whole estate.", "40%of the whole estate.", "65%of the whole estate.",
  "The fraction applies to the seller's40%interest:0.25×0.40=0.10. It is not a reservation of25%of interests the seller does not own.");
add("T09U1", "poa", "36-11 ¶C compared with20-19 ¶13 — transfer charges versus recurring prorations",
  "A final association statement combines a transfer charge, regular monthly dues and a document fee. The reviewer applies the paragraphC transfer cap to the entire invoice. What must be separated first?",
  "Transfer charges governed byC from recurring prorated amounts and document costs governed by other provisions.", "Nothing; every association invoice line is automatically the same contractual category.", "Only charges over$1,000 because smaller amounts are never allocated.", "Only the buyer's loan program because it replaces the association addendum.",
  "ParagraphC expressly excludes regular prorated amounts and costs governed byA andD. Correct allocation requires classifying actual charges before applying a cap.");

export const FINAL_EXAM_BANK = Object.freeze(rows);
export const BANK_SIZE = FINAL_EXAM_BANK.length;
export const AUTHORING_COMPLETE = BANK_SIZE === 132;
export default FINAL_EXAM_BANK;
