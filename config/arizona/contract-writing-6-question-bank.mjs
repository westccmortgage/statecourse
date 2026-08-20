/**
 * Arizona Real Estate Contract Law and Contract Writing (6 hours) — module question bank.
 *
 * THE SECOND, SEPARATE COURSE A.R.S. § 32-2124 REQUIRES. Subsection (L): "An applicant for an original real
 * estate salesperson's license, AFTER COMPLETING THE REQUIREMENTS OF SUBSECTION B of this section, shall
 * provide certification to the department AT THE TIME OF APPLICATION evidencing completion of SIX HOURS OF
 * INSTRUCTION IN REAL ESTATE CONTRACT LAW AND CONTRACT WRITING. This instruction shall include
 * PARTICIPATION BY THE APPLICANT IN DRAFTING CONTRACTS TO PURCHASE REAL PROPERTY, LISTING AGREEMENTS AND
 * LEASE AGREEMENTS."
 *
 * IT IS NOT PART OF THE NINETY. "After completing the requirements of subsection B" makes it additional.
 * Ninety plus six is NINETY-SIX, and the 90-hour prelicense course has its own bank in
 * config/arizona/prelicense-90-question-bank.mjs.
 *
 * THE DRAFTING REQUIREMENT DRIVES THE COURSE AND THE ENGINE. The statute requires PARTICIPATION IN
 * DRAFTING and names THREE DOCUMENT TYPES. This course requires THREE COMPLETED DRAFTS — a purchase
 * contract in Module 01, and a listing agreement and a lease agreement in Module 02. The engine records
 * each separately and does not credit the course unless all three are recorded complete. NO ITEM IN THIS
 * BANK MAY SUGGEST THAT READING SUBSTITUTES FOR DRAFTING.
 *
 * Each module carries one applied item, five engagement items and five remediation items. The correct
 * answer is authored at index 0 and permuted deterministically per item id at delivery. The public delivery
 * path strips correctChoice and rationale, and a test proves it. The 80 percent engagement threshold and
 * the 100 percent applied threshold are STATECOURSE STANDARDS. A.A.C. R4-28-401(A)(1)'s 75 percent applies
 * to the proctored, in-person course examination, which is a separate event.
 *
 * WHAT WAS NOT OBTAINED, AND WHICH THEREFORE APPEARS IN NO ITEM: Arizona's STATUTE OF FRAUDS; any Arizona
 * statute on capacity, entity authority, trusts or probate; any Arizona ELECTRONIC TRANSACTIONS statute;
 * any Arizona authority on the UNAUTHORISED PRACTICE OF LAW; the subdivided land, unsubdivided land and
 * time-share statutes, including when a public report is required; Arizona's LANDLORD-TENANT STATUTES in
 * their entirety; any Arizona statute or rule on LISTING AGREEMENT DURATION; A.R.S. § 32-2151 and the trust
 * account statutes; any Department-approved or industry contract, listing or lease FORM; and any Department
 * prescribed content for this six-hour course, if one exists. No item asks a student to recall anything
 * from any of them.
 *
 * Course version 1.0 submission draft — NOT APPROVED. No Arizona credit is available.
 */

const modules = {
  "module-01": {
    subject: "Contract law, and drafting a contract to purchase real property",
    hours: 3.0,
    draftingExercise: "purchase-contract",
    applied: {
      prompt: "You are drafting a purchase contract on an unimproved subdivided lot. The buyer will wire the deposit directly to the seller because there is no escrow open yet, the buyer has not seen the parcel, financing is uncertain, and the seller wants the contract to say only 'subject to financing' with the details to be worked out later.",
      choices: [
        "Four drafting requirements, three of them from rules read for this project. A.A.C. R4-28-803(C) requires the contract to indicate where the earnest money or down payment will be deposited and to name the title company, the broker's trust account, or other depository. A.A.C. R4-28-803(D) applies because the money goes directly to the seller and not into neutral escrow: conspicuous disclosure, the purchaser signs or initials the provision, and the bold or large-print warning that the money may be used by the seller and the purchaser assumes a risk of losing it. A.A.C. R4-28-804(A) requires the rescission legend for an unimproved subdivided lot — midnight of the seventh calendar day, and the six-month inspection right, which matters here because the buyer has not inspected. And 'subject to financing' is an unfinished contingency: a contingency clause states what event, by when, and what happens if it does not occur.",
        "Only the financing contingency needs work; the deposit arrangement is a matter between the buyer and the seller.",
        "Only the escrow disclosure is required, since the rescission legend applies to time-shares.",
        "The contract may be signed as the seller wishes and the missing terms added by amendment before closing."
      ],
      correctChoice: 0,
      rationale: "The three-part contingency rule is the drafting discipline this course assesses most strictly, and the three Arizona items are transcribed from rules read in full. A contract that names an event with no deadline, or a deadline with no consequence, has settled nothing."
    },
    engagement: [
      { prompt: "What does A.R.S. § 32-2124(L) require the six hours to include, and which document types does it name?", choices: ["Participation by the applicant in DRAFTING — naming contracts to purchase real property, listing agreements, and lease agreements.", "Six hours of instruction in contract law, with drafting optional.", "Review of the Department's approved contract forms and a written examination.", "Drafting of purchase contracts only."], correctChoice: 0, rationale: "Three document types, all named in the statute, and all three drafted in this course. A course that reads contract law aloud for six hours has not satisfied subsection (L)." },
      { prompt: "When must the six hours be completed and certified, relative to the 90-hour course?", choices: ["After completing the requirements of A.R.S. § 32-2124(B), with certification provided to the Department at the time of application.", "Before beginning the 90-hour course.", "At any point during the 90-hour course, as six of its hours.", "Within one year after the licence is issued."], correctChoice: 0, rationale: "'After completing the requirements of subsection B' is what makes the six hours additional rather than part of the 90. Ninety plus six is ninety-six." },
      { prompt: "What three things must a complete contingency clause state?", choices: ["What event, by when, and what happens if the event does not occur.", "What event and by when.", "What event and which party bears the cost.", "By when and what the remedy for breach is."], correctChoice: 0, rationale: "A clause naming an event without a deadline, or a deadline without a consequence, is the most common defect in student drafting, and it is checked directly in the Part D exercise." },
      { prompt: "What is the effect of a counter-offer on the offer it answers?", choices: ["It rejects the original offer, which cannot then be accepted unless renewed, and operates as a new offer.", "It keeps the original offer open until its stated expiration.", "It forms a contract on the modified terms.", "It suspends the original offer pending a reply."], correctChoice: 0, rationale: "The usual student defect is a counter-offer drafted to read like an acceptance, which leaves the parties disagreeing about which document controls." },
      { prompt: "Why does a drafter state in the document how and by when acceptance must be communicated?", choices: ["Because an acceptance that is signed and not communicated has not been communicated, and fixing the method and deadline removes the argument about whether and when a contract was formed.", "Because Arizona rule prescribes a specific method of acceptance.", "Because the escrow agent determines the time of acceptance.", "Because acceptance is effective on signature regardless of communication."], correctChoice: 0, rationale: "It is a drafting discipline rather than a rule of law here: this course states no Arizona rule on the timing of acceptance, because none was read." }
    ],
    remediation: [
      { prompt: "What does the statute of frauds generally require of a contract for the sale of an interest in land, and what does this course say about Arizona's version?", choices: ["A writing signed by the party to be charged, identifying the parties, the property, and the price or a means of determining it — and this course states no Arizona section number, wording or exception, because Arizona's statute of frauds was not read by this project.", "A notarised writing, under a section number this course states.", "A writing witnessed by two persons, under Arizona's own statute.", "Nothing in writing, provided performance has begun."], correctChoice: 0, rationale: "The general requirement is taught because it drives the drafting standard: write it down completely and have it signed. The Arizona specifics are a submission gate." },
      { prompt: "Why is a street address not a legal description?", choices: ["Because it identifies a property for administrative and postal purposes without describing the parcel unambiguously, which is what a conveyance requires.", "Because addresses change more often than parcels do.", "Because Arizona rule prohibits the use of addresses in contracts.", "Because the county recorder will not accept an address."], correctChoice: 0, rationale: "The drafting instruction is to use the description that identifies the property unambiguously, and never to invent or abbreviate one." },
      { prompt: "What does A.A.C. R4-28-802(A) require once a transaction document has been executed?", choices: ["Expeditious delivery of a LEGIBLE copy of the signed document and final agreement to EACH PARTY SIGNING the document.", "Delivery of a copy to the licensee's client within three days.", "Delivery of the original to the escrow agent within 24 hours.", "Retention of a copy, with delivery on request."], correctChoice: 0, rationale: "Legibility and delivery to every signing party are drafting-and-delivery requirements, not clerical ones, and this course states them because R4-28-802 was read in full." },
      { prompt: "What must the drafter do about a conflict of the kind A.A.C. R4-28-1101(E) names?", choices: ["Disclose it to the other parties IN WRITING and BEFORE the parties enter any binding agreement.", "Disclose it in the purchase contract at closing.", "Disclose it orally before the contract is signed and confirm it in writing afterwards.", "Disclose it only if a party asks."], correctChoice: 0, rationale: "The timing is the operative part of the subsection: a disclosure made when the conflict becomes awkward, or when someone asks, is late, and lateness is the breach." },
      { prompt: "Why does this course prescribe no contract form?", choices: ["Because no Department-approved or industry contract form was read by this project, and the brokerage supplies the forms it requires under A.A.C. R4-28-1103(A), which obliges the designated broker to maintain written policies on the use of disclosure forms and contracts.", "Because Arizona prohibits the use of pre-printed forms.", "Because forms are supplied by the escrow agent in every transaction.", "Because a licensee may not use a form they did not draft."], correctChoice: 0, rationale: "Reproducing a form this project never read would state requirements it cannot support. The student drafts; the brokerage supplies the forms." }
    ]
  },

  "module-02": {
    subject: "Drafting listing agreements and lease agreements",
    hours: 3.0,
    draftingExercise: "listing-and-lease",
    applied: {
      prompt: "You are drafting a listing agreement. The owner wants no end date because 'we'll just keep going until it sells,' wants a clause stopping you from bringing offers once she accepts one, and wants the brokerage named as your team name rather than the firm. She also asks you to draft the lease for the guest house and to state a security deposit figure and a return period from what you remember of another state.",
      choices: [
        "Four corrections. A listing states a definite beginning and end: no rule read by this project supplies a term or an automatic termination, so the drafter states it expressly. A clause ending the offer-submission duty on acceptance is permitted — A.A.C. R4-28-802(B) names the listing agreement as a place the duty may be 'otherwise provided' — but the same subsection lets a licensee voluntarily submit offers regardless of limitations in the listing and even after termination, so the clause does not do everything she expects. The party is the EMPLOYING BROKER, and A.A.C. R4-28-502(E) requires advertising to identify the employing broker's legal name or a dba on the licence certificate. And no security deposit figure or return period may be stated from memory of another state: Arizona's landlord-tenant statutes were not read by this project, so those figures come from the brokerage's forms and from counsel.",
        "All four requests may be drafted as she asks, since a listing agreement is a private contract between owner and broker.",
        "Only the missing end date is a problem; the other three are matters of preference.",
        "Only the deposit figure is a problem, and a listing with no end date is acceptable because it terminates on sale."
      ],
      correctChoice: 0,
      rationale: "R4-28-802(B) is the subsection that cuts both ways here: it lets the listing vary the continuing duty, and it separately permits voluntary submission despite listing limitations and after termination. And a figure recalled from another state's law is exactly the kind of invented requirement this build does not make."
    },
    engagement: [
      { prompt: "What kind of contract is a listing agreement, and who are its parties?", choices: ["A contract of employment between the owner and the BROKER — it conveys nothing and is not an offer to sell.", "An offer to sell the property, made by the owner to the market.", "A contract between the owner and the individual salesperson.", "A conveyance of a limited interest in the property to the broker."], correctChoice: 0, rationale: "The employment runs to the broker, not to the salesperson personally, which is the same distinction A.A.C. R4-28-502(E) enforces in advertising and R4-28-1103(D) rests on in making the employing broker responsible for the acts of all licensees." },
      { prompt: "Why must a listing agreement state a definite end date?", choices: ["Because a listing without a stated end date has no stated end date, and no rule read by this project supplies one — so the drafter states the term expressly.", "Because Arizona rule sets a maximum listing term of six months.", "Because the Department requires all listings to expire annually.", "Because a listing terminates automatically when the property is withdrawn."], correctChoice: 0, rationale: "This course states no maximum listing term and no automatic termination rule for Arizona, because no Arizona statute or rule on listing duration was read by this project." },
      { prompt: "Under A.A.C. R4-28-802(B), what may a licensee do regardless of limitations contained in the listing agreement?", choices: ["Voluntarily submit offers — and the same sentence permits submitting offers after the listing agreement has terminated.", "Disclose the terms of competing offers without the seller's permission.", "Withdraw the listing from the market.", "Reduce the listed price to a figure the licensee considers reasonable."], correctChoice: 0, rationale: "It converts what a drafter might fear is a breach of the listing agreement into something the rule expressly allows, and it means a limitation drafted into the listing does not do everything an inexperienced drafter expects." },
      { prompt: "What does a lease agreement create, and what else does it contain?", choices: ["A leasehold estate giving possession for a term, together with covenants between the parties — so a lease must settle both the estate and the promises.", "Only a set of covenants; no estate is created.", "Only an estate; covenants are a separate document.", "A freehold estate for the term of the lease."], correctChoice: 0, rationale: "It is why a lease both conveys something and promises something, and why a drafter who settles one half has finished half the document." },
      { prompt: "Which Arizona rule applies when a licensee hands keys to a tenant or lets a contractor into an occupied unit?", choices: ["A.A.C. R4-28-1101(J)(1) — a licensee shall not permit or facilitate access to or occupancy in a person's real property without PRIOR WRITTEN authorization from the owner.", "A.A.C. R4-28-802(A), which governs delivery of signed documents.", "A.A.C. R4-28-701, which governs compensation sharing.", "No Arizona rule applies; the question is one of landlord-tenant law only."], correctChoice: 0, rationale: "'Permit or facilitate' reaches a licensee who arranges for someone else to open the door. The tenant's own rights are a separate question this course does not answer, because Arizona's landlord-tenant statutes were not read." }
    ],
    remediation: [
      { prompt: "What does A.A.C. R4-28-1101(F) require of a licensee representing or compensated by more than one party?", choices: ["The PRIOR WRITTEN CONSENT of all parties.", "Written notice to the designated broker.", "Disclosure in the listing agreement only.", "The consent of the client whose interests are most affected."], correctChoice: 0, rationale: "Consent is permission, and it is prior. R4-28-1101(G)'s prior written ACKNOWLEDGEMENT for related goods or services is a different requirement using a different word, and satisfying one does not satisfy the other." },
      { prompt: "What does A.A.C. R4-28-701 require in a transaction where two brokerages will share compensation?", choices: ["Written disclosure to all the parties, at least THREE CALENDAR DAYS BEFORE CLOSING, of the name of each employing broker who represents a party and who will receive compensation from the transaction.", "Disclosure of the amount each brokerage will receive, at closing.", "Disclosure in the listing agreement, with no separate deadline.", "Written disclosure three business days before closing."], correctChoice: 0, rationale: "It is a third, separate obligation with its own deadline, distinct from R4-28-1101(F) and (G). A licensee who treats all three as one document has missed two rules." },
      { prompt: "Why does this course state no security deposit limit, return period, entry notice or eviction procedure for Arizona?", choices: ["Because Arizona's residential and commercial landlord-tenant statutes were not read by this project, and stating a figure from another state or from memory would be inventing a requirement.", "Because those matters are governed entirely by the lease and not by statute.", "Because a licensee is never involved in leasing.", "Because the Department prescribes them in a form this course reproduces."], correctChoice: 0, rationale: "The checklist of what a lease must settle is a drafting checklist, not a statement of Arizona legal requirements, and the exercise instruction says so on its face. It is recorded as a submission gate." },
      { prompt: "How many completed drafts does completion of this course require, and why?", choices: ["Three — a purchase contract, a listing agreement and a lease agreement — because A.R.S. § 32-2124(L) names all three document types and requires participation by the applicant in drafting.", "One, of whichever document type the student chooses.", "Two: a purchase contract and a listing agreement.", "None; the statute requires instruction rather than drafting."], correctChoice: 0, rationale: "Two out of three does not satisfy subsection (L), and the course engine does not credit it. Reading without drafting does not satisfy the statute, and this course does not certify it as though it did." },
      { prompt: "What is the status of any certificate for this course, and under which statute?", choices: ["No certificate can issue and no Arizona credit is available, because this school and this course are not approved — A.R.S. § 32-2135(B) governs certificates of course attendance.", "A certificate issues on completion of the three drafts.", "A certificate issues but is valid only for ten years.", "A certificate issues on payment, with approval recorded later."], correctChoice: 0, rationale: "The status is stated on the first page of every module of this course for exactly that reason: a course that claimed credit it does not have would misrepresent the one thing a student is paying for." }
    ]
  }
};

export default modules;
