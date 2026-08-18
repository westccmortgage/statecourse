/**
 * California Real Estate Principles (45 hours) — secure final examination bank.
 *
 * NOT PUBLIC. This file is imported by Netlify functions only; `site/build.sh`
 * fails the build if any file matching /final-exam-bank|answer-key/ reaches `dist`.
 * The correct answer never leaves the server: `publicAssessment()` strips it, and
 * scoring happens in `scoreCaliforniaAssessment()`.
 *
 * Structure required by RE 303 p.4 and recorded in database/004_california_prelicense.sql:
 *   two forms, 100 questions each, 60% passing, one retake on DIFFERENT questions.
 *
 * Coverage rule: six items per lesson assignment (90) plus ten integrative items that
 * cross assignments (10). Every item carries `source`, naming the assignment and the
 * subsection where the answer is found — RE 303 requires the instructor answer key to
 * reference where in the course material each answer appears.
 *
 * Authoring standard: the correct answer is written first and permuted deterministically
 * at serve time. Distractors state a plausible and specifically wrong proposition; none
 * is filler.
 *
 * Course version 1.0 — not approved; no California credit is available.
 */

const formA = [
  /* Assignment 01 — The real estate profession and California regulatory structure */
  { source: { assignment: "assignment-01", section: "1.3" },
    prompt: "A landowner sells the right to extract minerals beneath her parcel while continuing to live on it. What has she done in terms of the bundle of rights?",
    choices: [
      "Separated and conveyed one right out of the bundle while retaining the rest.",
      "Converted the parcel from real property to personal property.",
      "Terminated her fee simple estate, because the bundle cannot be divided.",
      "Created a leasehold estate in the buyer of the mineral rights."
    ],
    correctChoice: 0,
    rationale: "The bundle of rights can be separated and conveyed individually. Selling one stick neither destroys the estate nor changes the classification of the land." },
  { source: { assignment: "assignment-01", section: "1.5" },
    prompt: "Why does a change in credit conditions move real estate prices even when nothing has happened to any particular property?",
    choices: [
      "Most transactions depend on financing, so credit conditions transmit directly into what buyers can pay.",
      "Assessed values are recalculated automatically whenever interest rates change.",
      "Sellers are required to adjust list prices when rates change.",
      "Appraisers are required to apply a rate adjustment to every comparable sale."
    ],
    correctChoice: 0,
    rationale: "Financing dependence is a characteristic of the market. Buying power moves with credit conditions, and prices follow, without any change to the properties themselves." },
  { source: { assignment: "assignment-01", section: "2.3" },
    prompt: "Which fact determines whether an activity requires a real estate license?",
    choices: [
      "What the person actually did and whether it was done for compensation or the expectation of it.",
      "Whether the person described himself to the public as an agent.",
      "Whether the transaction ultimately closed.",
      "Whether the person kept the compensation or passed it to someone else."
    ],
    correctChoice: 0,
    rationale: "Licensure turns on the activity performed and the compensation element, not on labels, outcomes, or what happened to the money afterward." },
  { source: { assignment: "assignment-01", section: "3.3" },
    prompt: "A broker delegates file review to an experienced salesperson and a defect later appears in a reviewed file. What is the broker's position?",
    choices: [
      "The supervisory duty remains the broker's; delegating the task did not transfer responsibility for it.",
      "The reviewing salesperson has assumed the supervisory duty by accepting the assignment.",
      "The duty is shared equally once the delegation is documented in writing.",
      "The broker is relieved of responsibility because supervision may be delegated to any licensee."
    ],
    correctChoice: 0,
    rationale: "Supervision is an affirmative duty of the responsible broker. A task can be delegated; the responsibility for its performance cannot." },
  { source: { assignment: "assignment-01", section: "4.2" },
    prompt: "A buyer asks his agent whether a contingency clause still protects him if he cancels on Friday. Applying the scope test, what should the agent do?",
    choices: [
      "State what the document provides procedurally and what the deadline is, and route the question of the client's legal rights to counsel.",
      "Answer directly, because the agent has read the contract and knows what it says.",
      "Decline to say anything at all, since any comment on a contract is the practice of law.",
      "Answer only if the agent puts the answer in writing, which converts it into permissible information."
    ],
    correctChoice: 0,
    rationale: "Explaining what the document provides for is within scope; stating its legal effect on the client's rights is not. Silence is not required and writing it down does not change its character." },
  { source: { assignment: "assignment-01", section: "5.3" },
    prompt: "A licensee cites a passage from a trade association publication as the reason a disclosure is not required. What is wrong with that reasoning?",
    choices: [
      "Publications and forms are not sources of law; the obligation is set by statute and regulation regardless of what a publication says.",
      "Nothing, provided the publication is current and issued by a recognized association.",
      "Nothing, because industry publications are incorporated into the Commissioner's Regulations.",
      "The reasoning fails only if the publication is more than one year old."
    ],
    correctChoice: 0,
    rationale: "Forms and publications describe practice; they do not create or excuse legal obligations, and currency does not convert one into a source of law." },
  /* Assignment 02 — Real property, personal property, and fixtures */
  { source: { assignment: "assignment-02", section: "2.3" },
    prompt: "Two tests do most of the work in deciding whether an item has become a fixture. Which are they?",
    choices: [
      "The method of attachment and the intent of the parties as objectively evidenced.",
      "The cost of the item and the length of time it has been in place.",
      "Whether the item is listed in the purchase agreement and whether it is insured.",
      "The seller's stated sentimental attachment and the buyer's expectation."
    ],
    correctChoice: 0,
    rationale: "Attachment and objectively evidenced intent decide most cases. Cost, duration, insurance, and a party's private sentiment do not control." },
  { source: { assignment: "assignment-02", section: "2.5" },
    prompt: "Custom window coverings were cut to fit each window of a particular house. Which test most directly supports treating them as fixtures?",
    choices: [
      "Adaptability, because they were fitted to this property specifically and have little use elsewhere.",
      "Relationship of the parties, because the seller installed them personally.",
      "Method of attachment, because fabric is affixed to the structure with permanent fasteners.",
      "Trade fixture doctrine, because the coverings serve the use of the premises."
    ],
    correctChoice: 0,
    rationale: "Adaptation to the specific property is the controlling factor for items custom-fitted to it. The trade fixture doctrine concerns items a tenant installs for a business." },
  { source: { assignment: "assignment-02", section: "3.2" },
    prompt: "A commercial tenant installs display shelving and refrigeration units to operate a grocery. Under the trade fixture rule, what is the general position at lease end?",
    choices: [
      "The tenant may generally remove them within the time the lease allows, repairing damage caused by removal.",
      "They became the landlord's property on installation because they are attached to the building.",
      "They may be removed only if the landlord consented in writing before installation.",
      "They belong to the landlord unless the tenant recorded a notice of the installation."
    ],
    correctChoice: 0,
    rationale: "Trade fixtures installed for the tenant's business are generally removable by the tenant, subject to timing and repair obligations, and the lease commonly settles the details." },
  { source: { assignment: "assignment-02", section: "4.4" },
    prompt: "A seller digs up mature rose bushes on the morning of the buyer's final walkthrough. What has occurred?",
    choices: [
      "Real property was severed and removed after the buyer contracted for the property including it.",
      "Personal property was removed, since plants are always personal property.",
      "A permitted removal, because landscaping is excluded from every purchase agreement by default.",
      "A fixture dispute, resolved by the method of attachment test."
    ],
    correctChoice: 0,
    rationale: "Perennial growth is part of the real property until severed. Severing it after the contract removes something the buyer contracted for; the timing of severance is the operative fact." },
  { source: { assignment: "assignment-02", section: "5.4" },
    prompt: "A preliminary report shows that mineral rights were severed from the parcel decades ago. What follows for the buyer?",
    choices: [
      "Another party holds those rights and may hold rights of access; the buyer should obtain the recorded instrument and route its interpretation.",
      "The severance lapsed automatically because no extraction has occurred.",
      "The buyer acquires the mineral rights at closing because they are appurtenant to the surface.",
      "The severance affects taxation only and has no effect on use of the surface."
    ],
    correctChoice: 0,
    rationale: "A severed mineral estate remains with its holder and may carry access rights. Non-use does not extinguish it automatically, and the recorded instrument states its scope." },
  { source: { assignment: "assignment-02", section: "6.6" },
    prompt: "At the walkthrough, the parties disagree about whether a shed resting on gravel conveys. What is the licensee's correct role?",
    choices: [
      "Identify the issue, decline to declare who is right, and take it to the broker while the parties consider their options.",
      "Apply the fixture tests and tell the parties which one prevails, since the analysis is objective.",
      "Advise the buyer to accept the seller's position to preserve the closing date.",
      "Tell the parties the shed conveys because anything on the land at closing conveys."
    ],
    correctChoice: 0,
    rationale: "The classification of a contested item is a legal question. The licensee identifies it and escalates rather than announcing an outcome the parties will rely on." },
  /* Assignment 03 — Estates, ownership, and common interests */
  { source: { assignment: "assignment-03", section: "2.3" },
    prompt: "A life tenant contracts to sell 'the property' to a buyer. What can the buyer actually acquire from him?",
    choices: [
      "An interest measured by the life that measures the estate, which ends when that life ends.",
      "Fee simple absolute, because a life tenant is the present owner of record.",
      "Nothing, because a life estate is not transferable under any circumstances.",
      "A leasehold estate for a term equal to the life tenant's remaining life expectancy."
    ],
    correctChoice: 0,
    rationale: "A grantor cannot convey more than he holds. What passes is measured by the same life, and it terminates with it." },
  { source: { assignment: "assignment-03", section: "3.2" },
    prompt: "Which consequence most sharply distinguishes joint tenancy from tenancy in common?",
    choices: [
      "On the death of a co-owner, a joint tenancy interest passes by right of survivorship rather than through the decedent's estate.",
      "Only joint tenants may hold unequal shares in the property.",
      "Only tenants in common may convey their interest during life.",
      "Only joint tenancy permits more than two owners."
    ],
    correctChoice: 0,
    rationale: "Survivorship is the operative distinction. Unequal shares are characteristic of tenancy in common, and both forms permit lifetime transfer and more than two owners." },
  { source: { assignment: "assignment-03", section: "3.4" },
    prompt: "One of two joint tenants conveys his interest to a third party during his lifetime. What is the general effect?",
    choices: [
      "The unities supporting the joint tenancy are disturbed as to that interest, and the transferee generally takes as a tenant in common.",
      "The conveyance is void, because a joint tenant cannot transfer without the other's consent.",
      "The remaining joint tenant automatically acquires the whole interest immediately.",
      "The joint tenancy continues unchanged, with the transferee substituted as a joint tenant."
    ],
    correctChoice: 0,
    rationale: "A lifetime transfer severs as to the transferred interest. It is neither void, nor an immediate accretion to the other owner, nor a substitution preserving the joint tenancy." },
  { source: { assignment: "assignment-03", section: "4.5" },
    prompt: "A married couple asks their listing agent which form of ownership they should use for a property they are buying. What is the correct response?",
    choices: [
      "Explain that the choice carries legal and tax consequences and refer them to counsel and a tax advisor.",
      "Recommend the form most commonly used in the county, since it is the market standard.",
      "Recommend the form producing the simplest transfer at death, since that is the usual objective.",
      "Decline to discuss ownership at all, since the subject is outside the transaction."
    ],
    correctChoice: 0,
    rationale: "Vesting affects survivorship, creditors, and taxation. The licensee explains that the question exists and routes it; recommending a form is advice he is not qualified to give." },
  { source: { assignment: "assignment-03", section: "5.2" },
    prompt: "Which document in a common interest development package is most predictive of a future special assessment?",
    choices: [
      "The reserve study, read together with the association's budget and recent minutes.",
      "The declaration of covenants, conditions, and restrictions.",
      "The association's rules governing pets and parking.",
      "The insurance certificate for the common area."
    ],
    correctChoice: 0,
    rationale: "A thinly funded reserve is a special assessment that has not been announced yet, and the minutes are where it first appears. The other documents govern use and coverage rather than funding." },
  { source: { assignment: "assignment-03", section: "6.2" },
    prompt: "A seller says the property is 'in my trust.' Who has authority to convey?",
    choices: [
      "The currently serving trustee, whose identity is established from the trust instrument rather than from the seller's description.",
      "The person who created the trust, in every case.",
      "Any named beneficiary of the trust.",
      "The seller personally, since a trust is not a separate owner."
    ],
    correctChoice: 0,
    rationale: "Title is held by the trustee in that capacity, and the office may have passed to a successor. The instrument, not the conversation, establishes who currently holds it." },
  /* Assignment 04 — Land description, measurement, and boundaries */
  { source: { assignment: "assignment-04", section: "3.1" },
    prompt: "Most California residential property in recorded subdivisions is described by which method?",
    choices: [
      "Lot and block, by reference to a recorded subdivision map.",
      "Metes and bounds, running from a monument and closing back to it.",
      "The government survey system, by township, range, and section.",
      "The assessor's parcel number assigned by the county."
    ],
    correctChoice: 0,
    rationale: "Lot and block by reference to a recorded map is the residential norm. The assessor's parcel number is a tax identifier, not a legal description." },
  { source: { assignment: "assignment-04", section: "4.1" },
    prompt: "Why is an assessor's parcel number not a substitute for the legal description in a purchase agreement?",
    choices: [
      "The assessor's records exist for taxation, and a tax parcel does not necessarily describe the land conveyed.",
      "Assessor's parcel numbers change every fiscal year.",
      "Assessor's parcel numbers are not public records.",
      "A parcel number may only be used for improved property."
    ],
    correctChoice: 0,
    rationale: "The assessor maintains parcels for taxation. The description that conveys is the one in the deed, and using the parcel number in its place is a recurring source of error." },
  { source: { assignment: "assignment-04", section: "5.1" },
    prompt: "A seller states that a fence has marked the property line for twenty years. What has he described?",
    choices: [
      "A boundary in use, which may or may not correspond to the boundary of record.",
      "The boundary of record, since long acquiescence establishes it conclusively.",
      "An easement by prescription in favor of the neighbor.",
      "A survey monument, which controls over the recorded description."
    ],
    correctChoice: 0,
    rationale: "The boundary in use and the boundary of record are different things. Whether long use has any legal effect is a legal question, not something the fence itself establishes." },
  { source: { assignment: "assignment-04", section: "5.3" },
    prompt: "A buyer asks whether the title policy will protect him if the fence turns out to be three feet onto the neighbor's land. What is the accurate answer?",
    choices: [
      "A title policy is not a survey, and matters that an accurate survey would disclose are commonly outside standard coverage — the buyer should obtain a survey and review coverage with the title officer.",
      "Yes, the policy insures the physical boundaries of the parcel as fenced.",
      "Yes, provided the fence appears in the preliminary report.",
      "No, because title policies never cover boundary matters under any circumstances."
    ],
    correctChoice: 0,
    rationale: "Title insurance addresses matters of record and its own terms; it does not perform the function of a survey. The precise coverage question belongs to the title officer." },
  { source: { assignment: "assignment-04", section: "6.6" },
    prompt: "A licensee is preparing a listing and has three different figures for the property's area. What is the professional handling?",
    choices: [
      "Report a figure with its source named, and do not reconcile sources into a new number no source stands behind.",
      "Average the three figures and state the result as approximate.",
      "Use the largest figure, since it is the one the seller supplied.",
      "Omit the area entirely, since any statement of it creates liability."
    ],
    correctChoice: 0,
    rationale: "Every measurement carries its basis. Averaging or adjusting produces a number the licensee is asserting on his own authority; omission is not required." },
  { source: { assignment: "assignment-04", section: "6.4" },
    prompt: "A parcel is stated at 2.5 acres. Approximately how many square feet is that?",
    choices: [
      "108,900",
      "10,890",
      "43,560",
      "1,089,000"
    ],
    correctChoice: 0,
    rationale: "An acre is 43,560 square feet, so 2.5 acres is 108,900. The distractors are the one-acre figure and order-of-magnitude errors of the kind unit conversions produce." },
  /* Assignment 05 — Encumbrances, liens, easements, and restrictions */
  { source: { assignment: "assignment-05", section: "1.3" },
    prompt: "Which best distinguishes a general lien from a specific lien?",
    choices: [
      "A general lien attaches to the debtor's property generally, while a specific lien attaches to an identified parcel.",
      "A general lien arises voluntarily, while a specific lien arises involuntarily.",
      "A general lien must be recorded, while a specific lien need not be.",
      "A general lien expires automatically, while a specific lien continues indefinitely."
    ],
    correctChoice: 0,
    rationale: "The general-versus-specific axis concerns what property is reached. Voluntariness is a separate axis, and recording and duration are separate questions again." },
  { source: { assignment: "assignment-05", section: "3.2" },
    prompt: "An easement benefits an adjoining parcel rather than a person. What follows when that parcel is sold?",
    choices: [
      "The easement is appurtenant and generally runs with the land to the new owner.",
      "The easement terminates because the benefited owner has changed.",
      "The easement converts to a license revocable at will.",
      "The easement must be re-recorded by the new owner to remain effective."
    ],
    correctChoice: 0,
    rationale: "An appurtenant easement benefits the dominant parcel and passes with it. An easement in gross benefits a person or entity rather than a parcel." },
  { source: { assignment: "assignment-05", section: "3.5" },
    prompt: "What most clearly distinguishes a license from an easement?",
    choices: [
      "A license is generally personal and revocable, while an easement is an interest in land.",
      "A license must be in writing, while an easement may be oral.",
      "A license is always exclusive, while an easement is always shared.",
      "A license runs with the land, while an easement is personal to the holder."
    ],
    correctChoice: 0,
    rationale: "Revocability and the absence of an interest in land are what mark a license. The last option reverses the two." },
  { source: { assignment: "assignment-05", section: "4.2" },
    prompt: "A recorded declaration prohibits a use that the zoning ordinance permits. What is the practical result for a buyer who wants that use?",
    choices: [
      "Both systems apply independently, and the private restriction can defeat a use the zoning allows.",
      "Zoning controls, because a public ordinance supersedes a private instrument.",
      "The declaration controls only if it was recorded after the zoning was adopted.",
      "The buyer may proceed if he obtains a variance from the jurisdiction."
    ],
    correctChoice: 0,
    rationale: "Public land use controls and private recorded restrictions operate separately. Satisfying one does not satisfy the other, and a variance addresses only the public side." },
  { source: { assignment: "assignment-05", section: "5.3" },
    prompt: "Why does the order of recording matter so much to the outcome of a lien dispute?",
    choices: [
      "The recording system establishes notice and, with it, the priority that determines who is paid and in what order.",
      "It determines which lien is valid; later-recorded liens are void.",
      "It determines which lienholder may foreclose; only the last may do so.",
      "It determines the interest rate each lienholder may charge."
    ],
    correctChoice: 0,
    rationale: "Recording gives constructive notice and orders priority. Later liens are not void — they are subordinate, which is what decides the money." },
  { source: { assignment: "assignment-05", section: "6.3" },
    prompt: "A preliminary report lists an item under 'requirements' rather than as an exception. What does that mean?",
    choices: [
      "It is a condition the title company will insist be satisfied before it issues the policy.",
      "It is a matter excluded from coverage that the buyer must accept.",
      "It is an informational note carrying no consequence for closing.",
      "It is a lien that will be paid from the seller's proceeds at closing."
    ],
    correctChoice: 0,
    rationale: "Requirements are conditions to issuance; exceptions are matters not covered. Confusing the two produces a file that is surprised at title clearance." },
  /* Assignment 06 — Government powers, land use, and environmental controls */
  { source: { assignment: "assignment-06", section: "1.2" },
    prompt: "A city adopts an ordinance restricting building heights near an airport approach path. Which government power is being exercised?",
    choices: [
      "Police power, regulating use in the interest of public health, safety, and welfare.",
      "Eminent domain, because the restriction reduces what owners may build.",
      "Taxation, because height limits affect assessed value.",
      "Escheat, because unused development capacity reverts to the public."
    ],
    correctChoice: 0,
    rationale: "Regulation of use without taking title is the police power. Eminent domain involves taking property, and escheat concerns property passing to the state when there is no owner." },
  { source: { assignment: "assignment-06", section: "1.3" },
    prompt: "Which pair of elements is essential to an exercise of eminent domain?",
    choices: [
      "A public use and the payment of just compensation.",
      "A public hearing and the consent of the affected owner.",
      "A finding of blight and a court order of foreclosure.",
      "A recorded restriction and a zoning amendment."
    ],
    correctChoice: 0,
    rationale: "Public use and just compensation are the defining elements. Owner consent is not required — that is what distinguishes the power from a purchase." },
  { source: { assignment: "assignment-06", section: "2.4" },
    prompt: "A building lawfully constructed under a prior ordinance no longer complies with current zoning. What is its status?",
    choices: [
      "A nonconforming use, whose continuation and limits are governed by the ordinance's own provisions.",
      "An illegal use requiring immediate removal.",
      "A conforming use, because zoning changes apply only to new construction in every case.",
      "A variance, granted automatically by operation of the ordinance change."
    ],
    correctChoice: 0,
    rationale: "Lawful use predating the change becomes nonconforming, and the ordinance itself sets what may continue, expand, or lapse. It is neither automatically illegal nor a variance." },
  { source: { assignment: "assignment-06", section: "2.3" },
    prompt: "A buyer says he will 'just get a variance' if the ordinance does not permit his intended use. Why is that a dangerous assumption for a licensee to encourage?",
    choices: [
      "Relief mechanisms are discretionary processes with standards, timelines, and no guaranteed outcome.",
      "Variances are prohibited in California residential zones.",
      "A variance can only be sought by the owner of record after closing.",
      "A variance would convert the property to a nonconforming use."
    ],
    correctChoice: 0,
    rationale: "A variance or conditional use permit is a process with standards and a hearing, not an entitlement. Encouraging reliance on it is how buyers remove contingencies on a plan that later fails." },
  { source: { assignment: "assignment-06", section: "3.3" },
    prompt: "A seller discloses that a bedroom addition was built without permits. What is the licensee's correct handling of the marketing?",
    choices: [
      "Verify what the records support before publishing a room count or square footage, and disclose the condition.",
      "Advertise the room count the seller states, since the seller has personal knowledge of his own house.",
      "Omit the addition from all marketing and disclosures to avoid drawing attention to it.",
      "Advertise the addition as permitted, because a permit can be obtained retroactively."
    ],
    correctChoice: 0,
    rationale: "The published figures must be supportable from a source, and the condition is disclosable. Concealment and a claim the records do not support are both misrepresentations." },
  { source: { assignment: "assignment-06", section: "5.1" },
    prompt: "A natural hazard report states the property is not within a mapped zone. What is the accurate reading?",
    choices: [
      "The determination is based on maps at a scale with approximate boundaries that are revised over time; it is not a statement that no risk exists.",
      "The property carries no natural hazard risk of any kind.",
      "The determination is conclusive and cannot change for the life of the property.",
      "The report replaces the need to investigate insurance availability."
    ],
    correctChoice: 0,
    rationale: "Mapped determinations are qualified by scale and revision. Reading 'not in a zone' as 'not at risk' is the most common misreading, and insurance availability is a separate inquiry." },
  /* Assignment 07 — Agency and brokerage relationships */
  { source: { assignment: "assignment-07", section: "1.2" },
    prompt: "Which of the following can create an agency relationship without any signed agreement?",
    choices: [
      "Conduct — acting for a person and being permitted to do so, such that a reasonable person would understand representation exists.",
      "The payment of a commission by one party to the brokerage.",
      "Delivery of a written disclosure form to the party.",
      "Showing a property listed by another brokerage."
    ],
    correctChoice: 0,
    rationale: "Agency may arise by conduct as well as by express agreement or ratification. Payment does not create it, and the disclosure form is notice rather than the relationship itself." },
  { source: { assignment: "assignment-07", section: "2.4" },
    prompt: "A seller instructs his listing agent to say nothing about a known roof leak. Which analysis is correct?",
    choices: [
      "Confidentiality protects the seller's negotiating position, not concealment of a material physical condition, so the agent must not follow the instruction.",
      "Confidentiality controls, because the duty runs to the principal and outranks duties to non-clients.",
      "The agent may stay silent as long as he makes no affirmative false statement.",
      "The presence of a buyer's agent transfers the disclosure duty to the buyer's side."
    ],
    correctChoice: 0,
    rationale: "Honesty and disclosure of material facts run to everyone and set the limit of confidentiality. Careful silence is concealment, and the duty is not transferred by the other side having representation." },
  { source: { assignment: "assignment-07", section: "2.5" },
    prompt: "A licensee misses a contingency deadline through inattention, with no dishonesty involved. Which duty is breached?",
    choices: [
      "Reasonable care and diligence.",
      "Loyalty.",
      "Confidentiality.",
      "Accounting."
    ],
    correctChoice: 0,
    rationale: "Careless performance breaches the care duty, which is why most claims against licensees are negligence claims rather than fraud claims." },
  { source: { assignment: "assignment-07", section: "3.2" },
    prompt: "One brokerage represents both the seller and the buyer in a transaction. What does the law require?",
    choices: [
      "Informed written consent from both parties, obtained before the brokerage acts on both sides.",
      "Written consent from the seller only, since the listing agreement is the brokerage's contract.",
      "Oral acknowledgment from both parties at the time the offer is presented.",
      "No consent, provided two different salespersons handle the two sides."
    ],
    correctChoice: 0,
    rationale: "Both parties must consent, in writing and informed. Because the agency belongs to the brokerage, using two salespersons does not avoid the dual agency." },
  { source: { assignment: "assignment-07", section: "6.2" },
    prompt: "A buyer's agent is compensated from the seller's side of the transaction. What does that establish about representation?",
    choices: [
      "Nothing — the agency disclosure and confirmation establish who represented whom, not the source of payment.",
      "That the agent represents the seller, because the seller is paying.",
      "That a dual agency has been created by operation of the payment.",
      "That the buyer must consent in writing to the agent's compensation before representation begins."
    ],
    correctChoice: 0,
    rationale: "Source of payment does not determine representation. The disclosure, election, and confirmation do — though the compensation arrangement must still be disclosed." },
  { source: { assignment: "assignment-07", section: "4.3" },
    prompt: "An agency disclosure is delivered to a buyer on the day the purchase agreement is signed, five weeks after the working relationship began. What is the defect?",
    choices: [
      "The document exists but arrived after the decisions it was meant to inform, and late delivery is not cured by delivery.",
      "There is no defect, because the disclosure was delivered before the contract was formed.",
      "The defect is cured by the confirmation in the purchase agreement.",
      "The defect is cured if the buyer signs an acknowledgment that he received it late."
    ],
    correctChoice: 0,
    rationale: "The disclosure attaches to the beginning of the relationship. Confirmation is a later step with a different function, and an acknowledgment of lateness records the problem rather than curing it." },
  /* Assignment 08 — Contracts and transaction formation */
  { source: { assignment: "assignment-08", section: "1.1" },
    prompt: "Which set states the essential elements of a valid contract?",
    choices: [
      "Capable parties, mutual consent, lawful object, and consideration.",
      "Offer, acceptance, recording, and delivery.",
      "Writing, signature, notarization, and witnesses.",
      "Consideration, contingencies, closing date, and legal description."
    ],
    correctChoice: 0,
    rationale: "The four elements are capacity, mutual consent, lawful object, and consideration. Recording, notarization, and contingencies are features of particular transactions, not elements of contract formation." },
  { source: { assignment: "assignment-08", section: "2.3" },
    prompt: "An offeree returns the offer with the price changed. What has happened?",
    choices: [
      "The original offer is terminated and a counteroffer now exists, which the original offeror may accept or reject.",
      "The original offer remains open and a second offer now exists alongside it.",
      "A contract is formed at the original price, with the change treated as a request.",
      "A contract is formed at the changed price, because returning the document is acceptance."
    ],
    correctChoice: 0,
    rationale: "A change of terms is a counteroffer, which terminates the original offer. Both remaining options treat a counteroffer as an acceptance, which it is not." },
  { source: { assignment: "assignment-08", section: "2.1" },
    prompt: "An offeree signs an acceptance but it is never transmitted to the offeror before the offer expires. What is the position?",
    choices: [
      "No contract formed, because formation turns on communication of acceptance rather than on the signature alone.",
      "A contract formed at the moment of signature, and transmission is a formality.",
      "A contract formed, because the offeror's own expiration term cannot defeat an acceptance actually made.",
      "A contract formed only if the offeree can prove he intended to send it."
    ],
    correctChoice: 0,
    rationale: "Communication is the operative event. A signed acceptance sitting in an outbox has not been communicated, which is why transmission and confirmation are operational disciplines rather than formalities." },
  { source: { assignment: "assignment-08", section: "3.4" },
    prompt: "Which best describes a voidable contract?",
    choices: [
      "One that is valid until a party with the power to do so elects to disaffirm it.",
      "One that never had legal effect from the beginning.",
      "One that is valid but cannot be proved in court for want of a writing.",
      "One that has been fully performed by both parties."
    ],
    correctChoice: 0,
    rationale: "Voidable means operative unless disaffirmed by the party entitled to. The second describes void, the third unenforceable, and the fourth executed." },
  { source: { assignment: "assignment-08", section: "4.1" },
    prompt: "Under the Statute of Frauds, which agreement must generally be in writing to be enforceable?",
    choices: [
      "A contract for the sale of real property.",
      "A month-to-month rental agreement.",
      "An agreement between two agents to cooperate on a showing.",
      "A seller's instruction to his agent about showing hours."
    ],
    correctChoice: 0,
    rationale: "Contracts for the sale of an interest in real property fall within the statute. Short-term tenancies and internal working arrangements generally do not." },
  { source: { assignment: "assignment-08", section: "6.3" },
    prompt: "Why is specific performance a remedy of particular significance in real estate?",
    choices: [
      "Each parcel is treated as unique, so money damages may not put the injured party in the position the contract promised.",
      "Real estate contracts are exempt from money damages by statute.",
      "It is the only remedy available for breach of a purchase agreement.",
      "It allows the injured party to recover the property without a court proceeding."
    ],
    correctChoice: 0,
    rationale: "Uniqueness is the rationale. Damages remain available, other remedies exist, and specific performance is obtained through a court rather than around one." },
  /* Assignment 09 — Transfer, deeds, title, and recording */
  { source: { assignment: "assignment-09", section: "1.3" },
    prompt: "Which of the following is generally NOT required for a deed to be valid between the parties?",
    choices: [
      "Recording.",
      "A competent grantor.",
      "A granting clause showing intent to convey.",
      "Delivery to the grantee."
    ],
    correctChoice: 0,
    rationale: "Recording gives notice to the world; it is not what makes a deed effective between grantor and grantee. Competency, granting language, and delivery go to validity." },
  { source: { assignment: "assignment-09", section: "2.2" },
    prompt: "What does a grant deed impliedly warrant that a quitclaim deed does not?",
    choices: [
      "That the grantor has not previously conveyed the same interest and has not encumbered the property except as disclosed.",
      "That the property is free of physical defects.",
      "That the grantor will defend title against all claims whatsoever, forever.",
      "That title is insurable by any title company."
    ],
    correctChoice: 0,
    rationale: "The grant deed's implied covenants concern prior conveyance and undisclosed encumbrances by the grantor. Physical condition, an unlimited warranty, and insurability are different things." },
  { source: { assignment: "assignment-09", section: "3.2" },
    prompt: "A grantor signs a deed and locks it in a drawer, telling no one. He dies two years later and the deed is found. What is the central question?",
    choices: [
      "Whether the deed was delivered with intent to pass title presently during the grantor's lifetime.",
      "Whether the deed was notarized at the time of signature.",
      "Whether the grantee had constructive notice of the deed's existence.",
      "Whether the deed was recorded within a fixed period after signature."
    ],
    correctChoice: 0,
    rationale: "Delivery with present intent is what transfers title. Notarization and recording concern recordability and notice, not whether the transfer occurred." },
  { source: { assignment: "assignment-09", section: "4.3" },
    prompt: "Which best describes a bona fide purchaser?",
    choices: [
      "One who acquires an interest for value and without notice — actual, constructive, or inquiry — of a competing claim.",
      "One who pays the full appraised value in cash at closing.",
      "One who records first, regardless of what he knew.",
      "One who purchases directly from the record owner rather than through an agent."
    ],
    correctChoice: 0,
    rationale: "Value plus the absence of notice defines the status. Notice of any kind defeats it, which is why recording first does not help a purchaser who knew." },
  { source: { assignment: "assignment-09", section: "5.5" },
    prompt: "Which matter is commonly outside the coverage of a standard title policy?",
    choices: [
      "Matters an accurate survey would disclose, such as a boundary discrepancy or an encroachment.",
      "A recorded deed of trust appearing in the chain of title.",
      "A recorded judgment lien against the seller.",
      "A recorded easement described in the preliminary report."
    ],
    correctChoice: 0,
    rationale: "Title insurance addresses matters of record and its own terms. Survey matters are the classic category outside standard coverage, which is why a survey is a separate recommendation." },
  { source: { assignment: "assignment-09", section: "6.3" },
    prompt: "Which set of characteristics is essential to a claim of adverse possession?",
    choices: [
      "Possession that is open and notorious, hostile to the true owner's title, continuous for the statutory period, and under claim of right or color of title, with payment of taxes required in California.",
      "Possession with the owner's written permission for the statutory period.",
      "Possession by a tenant who has paid rent for the statutory period.",
      "Possession under a recorded easement for the statutory period."
    ],
    correctChoice: 0,
    rationale: "Permission defeats hostility, so a permitted occupant and a tenant cannot acquire by adverse possession, and an easement is a use right rather than possession. California additionally requires payment of taxes." },
  /* Assignment 10 — Escrow, settlement, and transaction chronology */
  { source: { assignment: "assignment-10", section: "1.3" },
    prompt: "Two parties give escrow conflicting instructions about the disposition of the deposit. What does escrow do?",
    choices: [
      "Holds and takes no action, because neutrality forbids it from deciding between the parties.",
      "Follows the instruction of the party who signed first.",
      "Follows the instruction of the buyer, since the deposit is his money.",
      "Determines which party is entitled and disburses accordingly."
    ],
    correctChoice: 0,
    rationale: "Escrow is a neutral holder acting on instructions. Conflicting instructions produce a hold, not a ruling, and the disposition follows the contract's procedure or a legal determination." },
  { source: { assignment: "assignment-10", section: "2.5" },
    prompt: "The parties agree by email to a closing-cost credit two days before closing, and nothing is sent to escrow. What appears on the closing statement?",
    choices: [
      "No credit, because escrow acts on the instructions it has received rather than on what the parties agreed elsewhere.",
      "The credit, because escrow is bound by the parties' agreement however it is made.",
      "The credit, because email constitutes a written instruction to escrow.",
      "No credit, and escrow is liable for failing to detect the agreement."
    ],
    correctChoice: 0,
    rationale: "Escrow performs the instructions it holds. An agreement that never reached escrow does not exist for its purposes, and detecting it is not escrow's function." },
  { source: { assignment: "assignment-10", section: "4.1" },
    prompt: "What is the purpose of proration at closing?",
    choices: [
      "To allocate an expense or income between buyer and seller according to the portion of the period each owns the property.",
      "To reduce the purchase price by the amount of unpaid property taxes.",
      "To convert the seller's obligations into a credit against the commission.",
      "To spread closing costs evenly across both parties."
    ],
    correctChoice: 0,
    rationale: "Proration divides an item by time of ownership. It is not a price adjustment, a commission offset, or an equal split of costs." },
  { source: { assignment: "assignment-10", section: "4.3" },
    prompt: "Annual property taxes of $7,300 are prorated on a 365-day basis, and the seller owns the property for 90 days of the tax year. What is the seller's share?",
    choices: [
      "$1,800",
      "$1,825",
      "$2,000",
      "$3,650"
    ],
    correctChoice: 0,
    rationale: "$7,300 ÷ 365 = $20 per day; $20 × 90 = $1,800. The distractors come from using a 360-day year, a quarter of the annual amount, and half of it." },
  { source: { assignment: "assignment-10", section: "5.2" },
    prompt: "Why does recording precede disbursement in the closing sequence?",
    choices: [
      "So that title vests and lien positions are established before funds are released against them.",
      "Because the county requires payment of transfer taxes before funds can move.",
      "Because the lender's funding conditions are satisfied only after recording.",
      "Because possession transfers at the moment of recording."
    ],
    correctChoice: 0,
    rationale: "Recording fixes title and priority, and disbursement follows so that money is released against a completed transfer. Possession is a separate matter governed by the agreement." },
  { source: { assignment: "assignment-10", section: "3.6" },
    prompt: "A licensee receives an email that appears to come from escrow, changing the wire instructions. What is the correct verification?",
    choices: [
      "Call the escrow officer at a number obtained independently of the message and confirm by voice before any funds move.",
      "Reply to the email asking escrow to confirm the change.",
      "Forward the message to the buyer with a warning to be careful.",
      "Send a small test wire first and confirm receipt before sending the balance."
    ],
    correctChoice: 0,
    rationale: "Verification must run through a channel the attacker does not control. Replying, forwarding with a warning, and test wires all stay inside the compromised channel." },
  /* Assignment 11 — Real estate finance foundations */
  { source: { assignment: "assignment-11", section: "1.1" },
    prompt: "What is the relationship between the promissory note and the deed of trust?",
    choices: [
      "The note is the evidence of the debt; the deed of trust is the security instrument that secures it against the property.",
      "The note secures the property and the deed of trust states the amount owed.",
      "They are two names for the same instrument, used in different counties.",
      "The note conveys title to the lender and the deed of trust records the conveyance."
    ],
    correctChoice: 0,
    rationale: "Two documents, two jobs: the note is what is owed, and the deed of trust is what happens if it is not paid." },
  { source: { assignment: "assignment-11", section: "2.1" },
    prompt: "Which three parties are involved in a California deed of trust?",
    choices: [
      "Trustor, trustee, and beneficiary.",
      "Mortgagor, mortgagee, and escrow holder.",
      "Grantor, grantee, and title insurer.",
      "Borrower, servicer, and county recorder."
    ],
    correctChoice: 0,
    rationale: "The borrower is the trustor, the lender is the beneficiary, and a neutral third party holds the power of sale as trustee. A two-party mortgage lacks the trustee." },
  { source: { assignment: "assignment-11", section: "4.1" },
    prompt: "A borrower owes $340,000 at 6.5% annual simple interest. What is one month's interest?",
    choices: [
      "$1,841.67",
      "$2,210.00",
      "$1,700.00",
      "$22,100.00"
    ],
    correctChoice: 0,
    rationale: "$340,000 × 0.065 = $22,100 per year; ÷ 12 = $1,841.67. The distractors use a wrong divisor, a 6% rate, and the annual figure itself." },
  { source: { assignment: "assignment-11", section: "5.1" },
    prompt: "A property appraises at $640,000 and the buyer obtains a first loan of $512,000. What is the loan-to-value ratio?",
    choices: [
      "80%",
      "75%",
      "125%",
      "20%"
    ],
    correctChoice: 0,
    rationale: "$512,000 ÷ $640,000 = 0.80. The last figure is the down payment percentage, which is the complement rather than the ratio." },
  { source: { assignment: "assignment-11", section: "6.3" },
    prompt: "In a nonjudicial foreclosure, what distinguishes reinstatement from redemption?",
    choices: [
      "Reinstatement requires curing the arrearage and allowable costs within the period allowed; redemption requires paying the full accelerated balance.",
      "Reinstatement is available only after the sale, and redemption only before it.",
      "Reinstatement requires a court order, and redemption does not.",
      "They are alternative names for the same right at different stages."
    ],
    correctChoice: 0,
    rationale: "The amounts are different, and confusing them is the single most consequential thing a borrower in default does not know." },
  { source: { assignment: "assignment-11", section: "5.7" },
    prompt: "A buyer tells his agent he will rent the property out although his loan application states owner occupancy. What is the agent's obligation?",
    choices: [
      "Tell the buyer plainly that occupancy is material to the credit decision, direct him to inform his lender, decline to participate in any statement to the contrary, and escalate to the broker.",
      "Keep the statement confidential, since it was made by his client in confidence.",
      "Notify the lender directly without telling the buyer.",
      "Do nothing, because occupancy intent can change lawfully after closing."
    ],
    correctChoice: 0,
    rationale: "Occupancy is a material fact the lender relies on. Confidentiality does not extend to participating in a misrepresentation to a third party, and the escalation runs through the broker." },
  /* Assignment 12 — Valuation and appraisal foundations */
  { source: { assignment: "assignment-12", section: "1.3" },
    prompt: "Which set states the four elements of value?",
    choices: [
      "Demand, utility, scarcity, and transferability.",
      "Cost, price, income, and depreciation.",
      "Location, condition, size, and age.",
      "Supply, financing, zoning, and access."
    ],
    correctChoice: 0,
    rationale: "Demand, utility, scarcity, and transferability must all be present for value to exist. The other sets list influences on value rather than its elements." },
  { source: { assignment: "assignment-12", section: "1.5" },
    prompt: "Which principle holds that a buyer will pay no more for a property than the cost of acquiring an equally desirable substitute?",
    choices: [
      "Substitution.",
      "Contribution.",
      "Conformity.",
      "Anticipation."
    ],
    correctChoice: 0,
    rationale: "Substitution is the engine behind the sales comparison approach. Contribution measures what a component adds, and anticipation concerns expected future benefits." },
  { source: { assignment: "assignment-12", section: "3.2" },
    prompt: "A comparable sale is superior to the subject in one respect. In which direction is the adjustment made?",
    choices: [
      "Downward to the comparable's sale price, to state what it would have sold for if it were like the subject.",
      "Upward to the comparable's sale price, to reflect its superiority.",
      "Downward to the subject's indicated value, leaving the comparable unadjusted.",
      "No adjustment, because superior comparables are excluded from the grid."
    ],
    correctChoice: 0,
    rationale: "Adjustments are made to the comparable, not the subject: a superior comparable is adjusted down, an inferior one up." },
  { source: { assignment: "assignment-12", section: "4.4" },
    prompt: "Which category of depreciation describes a property whose value is reduced by a freeway constructed adjacent to it?",
    choices: [
      "External obsolescence.",
      "Physical deterioration.",
      "Functional obsolescence.",
      "Accrued depreciation, which is not one of the three categories."
    ],
    correctChoice: 0,
    rationale: "External obsolescence arises from causes outside the property boundary. Physical deterioration is wear, and functional obsolescence is a defect in the improvement itself." },
  { source: { assignment: "assignment-12", section: "5.3" },
    prompt: "A property produces net operating income of $84,000 and the applicable capitalization rate is 7%. What value does the income approach indicate?",
    choices: [
      "$1,200,000",
      "$588,000",
      "$120,000",
      "$5,880"
    ],
    correctChoice: 0,
    rationale: "Value = income ÷ rate: $84,000 ÷ 0.07 = $1,200,000. The distractors multiply instead of dividing and misplace the decimal." },
  { source: { assignment: "assignment-12", section: "6.1" },
    prompt: "What is the essential difference between a comparative market analysis and an appraisal?",
    choices: [
      "An appraisal is an independent opinion of value prepared by a licensed or certified appraiser under professional standards; a comparative market analysis is a licensee's opinion prepared to assist a pricing decision.",
      "An appraisal uses closed sales while a comparative market analysis uses active listings only.",
      "An appraisal is required for cash transactions and a comparative market analysis for financed ones.",
      "There is no substantive difference; the terms describe the same document prepared for different audiences."
    ],
    correctChoice: 0,
    rationale: "The distinction is who prepares it, under what standards, and for what purpose — not the data used, and a licensee's analysis may never be presented as an appraisal." },
  /* Assignment 13 — Taxation, investment, and real estate mathematics */
  { source: { assignment: "assignment-13", section: "1.5" },
    prompt: "A buyer closes in March and receives an unexpected tax bill later that year in addition to the regular installment. What is the most likely explanation?",
    choices: [
      "A supplemental assessment, issued because the property was reassessed on change of ownership.",
      "A duplicate billing error by the county.",
      "A special assessment for a district the property was newly annexed into.",
      "A penalty for late payment of the prior owner's installment."
    ],
    correctChoice: 0,
    rationale: "A change of ownership triggers reassessment, and the supplemental bill covers the difference for the remainder of the year. It is the item that most often surprises first-time buyers after closing." },
  { source: { assignment: "assignment-13", section: "2.6" },
    prompt: "A client asks whether he will owe tax on the gain from the sale of his home. What should the licensee do?",
    choices: [
      "Explain that the question has real consequences and refer him to a tax advisor, without summarizing the rules.",
      "Explain the general rule and note that his particular facts may differ.",
      "Answer only in writing, so the client can show it to his tax advisor later.",
      "Decline to respond at all and change the subject."
    ],
    correctChoice: 0,
    rationale: "Tax treatment is outside the license. A general summary is still advice the client will act on, and putting it in writing does not change what it is." },
  { source: { assignment: "assignment-13", section: "3.3" },
    prompt: "A property produces net operating income of $52,500 and was purchased for $750,000. What is the capitalization rate?",
    choices: [
      "7%",
      "14.3%",
      "0.7%",
      "5.25%"
    ],
    correctChoice: 0,
    rationale: "Rate = income ÷ value: $52,500 ÷ $750,000 = 0.07. The distractors invert the ratio and misplace the decimal." },
  { source: { assignment: "assignment-13", section: "4.2" },
    prompt: "What describes positive leverage?",
    choices: [
      "Borrowed funds cost less than the return the property produces, so the return on the investor's own capital rises.",
      "The property's value increases faster than the loan balance amortizes.",
      "The loan-to-value ratio is below fifty percent.",
      "The investor's payments are interest-only, so no principal is repaid."
    ],
    correctChoice: 0,
    rationale: "Leverage is positive when the cost of borrowed money is below the property's return. It is a relationship between two rates, not a loan structure or a ratio." },
  { source: { assignment: "assignment-13", section: "5.2" },
    prompt: "A property sells for $685,000 with a total commission of 5%, split evenly between two brokerages, and the listing salesperson receives 60% of his brokerage's share. What does he receive?",
    choices: [
      "$10,275",
      "$17,125",
      "$20,550",
      "$6,850"
    ],
    correctChoice: 0,
    rationale: "$685,000 × 0.05 = $34,250 total; ÷ 2 = $17,125 to the listing brokerage; × 0.60 = $10,275. The distractors stop at the brokerage share, take 60% of the full commission, and take 1% of the price." },
  { source: { assignment: "assignment-13", section: "5.3" },
    prompt: "A seller wants $400,000 net after paying a 6% commission and $6,000 in other costs. What sale price is required, to the nearest dollar?",
    choices: [
      "$431,915",
      "$430,000",
      "$424,000",
      "$406,000"
    ],
    correctChoice: 0,
    rationale: "Price = ($400,000 + $6,000) ÷ (1 − 0.06) = $406,000 ÷ 0.94 = $431,915. Adding 6% to the net rather than dividing by the complement is the error the distractors represent." },
  /* Assignment 14 — Fair housing, civil rights, and consumer protection */
  { source: { assignment: "assignment-14", section: "1.3" },
    prompt: "Which practice most directly engages the protection for familial status?",
    choices: [
      "Advertising a property as suited to 'mature adults, no children.'",
      "Requiring the same income standard of every applicant.",
      "Declining to answer a buyer's question about the composition of a neighborhood.",
      "Requiring a credit report from every applicant."
    ],
    correctChoice: 0,
    rationale: "Familial status protects households with children under eighteen and others defined by the statute. Uniform criteria and declining to characterize a neighborhood are the correct practices, not violations." },
  { source: { assignment: "assignment-14", section: "3.1" },
    prompt: "A licensee shows a buyer properties only in areas the licensee believes the buyer would 'be comfortable in,' based on the buyer's background. What is this?",
    choices: [
      "Steering, and it is prohibited regardless of the licensee's intent to be helpful.",
      "Permissible, because the licensee is serving the client's likely preferences.",
      "Blockbusting, because it concerns neighborhood composition.",
      "Redlining, because it restricts the areas shown."
    ],
    correctChoice: 0,
    rationale: "Directing a buyer toward or away from areas on a protected basis is steering, and a benign motive does not cure it. Blockbusting induces sales by representations about composition; redlining denies or varies credit or insurance by area." },
  { source: { assignment: "assignment-14", section: "4.2" },
    prompt: "An applicant with a disability requests that a no-pets policy be waived for an assistance animal. How is the request characterized?",
    choices: [
      "A reasonable accommodation — a change to a rule — and the animal is not a pet for this purpose.",
      "A reasonable modification, because it changes the terms of occupancy.",
      "A request the housing provider may decline for any nondiscriminatory business reason.",
      "A request that requires disclosure of the applicant's diagnosis before it can be evaluated."
    ],
    correctChoice: 0,
    rationale: "A change to a rule, policy, or practice is an accommodation; a physical change to the premises is a modification. The diagnosis may not be demanded, and pet fees do not attach to an assistance animal." },
  { source: { assignment: "assignment-14", section: "5.2" },
    prompt: "Which describes redlining?",
    choices: [
      "Denying or varying the terms of credit or insurance by area rather than by the characteristics of the applicant or the transaction.",
      "Inducing owners to sell by representations about the entry of a protected group into the neighborhood.",
      "Directing prospective buyers toward or away from particular areas.",
      "Refusing to rent to an applicant because of the source of his income."
    ],
    correctChoice: 0,
    rationale: "Redlining operates by geography. The distractors describe blockbusting, steering, and a source-of-income refusal, each prohibited on its own terms." },
  { source: { assignment: "assignment-14", section: "6.4" },
    prompt: "A seller instructs his listing agent not to show the property to members of a particular group. What must the agent do?",
    choices: [
      "Refuse the instruction, explain why, escalate to the broker, and address whether the listing can continue.",
      "Follow the instruction while documenting that it came from the seller.",
      "Schedule around those buyers informally without stating a reason.",
      "Withdraw from the listing quietly without explanation."
    ],
    correctChoice: 0,
    rationale: "An unlawful instruction may not be followed, and documenting it does not transfer responsibility. Informal compliance achieves the same exclusion, and a silent withdrawal leaves the seller free to repeat it." },
  { source: { assignment: "assignment-14", section: "6.1" },
    prompt: "Why does the professional response to implicit bias emphasize structural controls rather than good intentions?",
    choices: [
      "Controls such as uniform criteria, documented searches, and outcome review operate whether or not the licensee is thinking about bias on a given day.",
      "Intentions are irrelevant because liability is strict in every fair housing matter.",
      "Structural controls are required by statute in place of training.",
      "Implicit bias affects only advertising, which is a structural function."
    ],
    correctChoice: 0,
    rationale: "Unequal service is produced largely by distribution of information and effort under time pressure, which a person cannot detect from inside. Structure operates on the day attention does not." },
  /* Assignment 15 — Leasing, property management, license law, and integrated transaction */
  { source: { assignment: "assignment-15", section: "1.8" },
    prompt: "A property with a tenant on a one-year written lease is sold in the sixth month. What is the tenant's position?",
    choices: [
      "The lease generally continues against the new owner for its remaining term.",
      "The lease terminates on transfer of title, and the tenant becomes a month-to-month occupant.",
      "The lease terminates and the tenant must vacate on the closing date.",
      "The lease continues only if the tenant records a notice of the tenancy."
    ],
    correctChoice: 0,
    rationale: "A lease is an interest that survives a sale of the property. Transfer of ownership changes who the landlord is, not the term of the tenancy." },
  { source: { assignment: "assignment-15", section: "1.4" },
    prompt: "What distinguishes an assignment from a sublease?",
    choices: [
      "An assignment transfers the tenant's entire remaining interest; a sublease transfers less than all of it, leaving the original tenant with an interest.",
      "An assignment requires the landlord's consent and a sublease does not.",
      "An assignment is oral and a sublease must be written.",
      "An assignment applies to residential tenancies and a sublease to commercial ones."
    ],
    correctChoice: 0,
    rationale: "The distinction is how much of the remaining interest passes. Consent requirements come from the lease and apply to both." },
  { source: { assignment: "assignment-15", section: "3.3" },
    prompt: "A broker deposits a tenant's security deposit into the brokerage's operating account and records it on an internal ledger. What has occurred?",
    choices: [
      "Commingling, and the internal ledger does not cure it.",
      "Nothing improper, because the ledger identifies whose money it is.",
      "Conversion, which is the same offense as commingling.",
      "A permissible practice, because deposits are the broker's to hold as he sees fit."
    ],
    correctChoice: 0,
    rationale: "Placing trust funds in an operating account is commingling regardless of internal records. Conversion is using the funds for the broker's own purposes, which is a further and distinct wrong." },
  { source: { assignment: "assignment-15", section: "3.5" },
    prompt: "A trust account reconciliation reveals a shortage. What is the correct response?",
    choices: [
      "The broker corrects it immediately from broker funds and documents the correction.",
      "The shortage is carried until the responsible party makes it good.",
      "The shortage is offset against other beneficiaries' balances in the same account.",
      "The account is closed and the remaining funds distributed pro rata."
    ],
    correctChoice: 0,
    rationale: "A shortage is corrected immediately by the broker and documented. Carrying it or covering it from other beneficiaries' balances uses one person's money for another's benefit." },
  { source: { assignment: "assignment-15", section: "5.2" },
    prompt: "In a residential sale, which describes the relationship between the seller's disclosure and the licensee's own inspection disclosure?",
    choices: [
      "They are two independent obligations: the seller states what he knows, and the licensee states what a reasonably competent and diligent visual inspection of accessible areas revealed.",
      "The licensee's disclosure replaces the seller's where the licensee has inspected.",
      "The seller's disclosure satisfies both, since the licensee's knowledge derives from the seller.",
      "The licensee's disclosure is required only where the seller declines to complete his own."
    ],
    correctChoice: 0,
    rationale: "The two duties run in parallel and neither discharges the other. The licensee's statement is his own, based on his own observation." },
  { source: { assignment: "assignment-15", section: "6.5" },
    prompt: "A post-closing audit finds a contingency removal that is signed but undated. What must NOT be done?",
    choices: [
      "Write today's date on the removal so the file appears complete.",
      "Record the finding and escalate it to the broker.",
      "Ask the party who signed whether a dated copy exists elsewhere.",
      "Add a dated memorandum stating what the file shows and when the omission was discovered."
    ],
    correctChoice: 0,
    rationale: "A documented gap is a compliance problem a brokerage survives; a document made to say something it did not say is falsification. Recording, inquiring, and adding an honest dated memorandum are all proper." },
  /* Integrative items — each answer requires material from more than one assignment */
  { source: { assignment: "assignment-07", section: "2.4" },
    crossReferences: [{ assignment: "assignment-15", section: "5.2" }],
    prompt: "A listing agent learns from the seller that the foundation was repaired after a movement problem. The seller instructs him to leave it off the disclosure because the repair is complete. What is the correct analysis?",
    choices: [
      "A repaired condition is still a known material fact and is disclosed; the instruction to omit it is not one the agent may follow, and his own inspection disclosure is a separate obligation besides.",
      "The condition need not be disclosed because the repair resolved it.",
      "The condition is disclosed only if the buyer's inspector fails to find it.",
      "The agent may omit it from the seller's disclosure and note it in his own inspection disclosure instead."
    ],
    correctChoice: 0,
    rationale: "Materiality is not extinguished by repair — the adequacy of the repair is what the buyer wants to evaluate. The obedience limit governs the instruction, and the licensee's own disclosure duty runs in parallel rather than as a substitute." },
  { source: { assignment: "assignment-03", section: "6.2" },
    crossReferences: [{ assignment: "assignment-09", section: "1.2" }],
    prompt: "A seller says the property is held in his late mother's trust and that he is 'the beneficiary, so it's mine.' What must be established before the listing proceeds?",
    choices: [
      "Who currently holds the office of trustee, established from the trust instrument, because the trustee conveys and a competent grantor is a deed requirement.",
      "Whether the beneficiary has recorded a notice of his interest.",
      "Whether the trust was funded with other assets besides the property.",
      "Nothing, since a sole beneficiary may convey trust property directly."
    ],
    correctChoice: 0,
    rationale: "Title is held by the trustee in that capacity, and after a death the office may have passed to a successor. A deed from a person without authority to convey fails at the grantor requirement." },
  { source: { assignment: "assignment-05", section: "5.3" },
    crossReferences: [{ assignment: "assignment-09", section: "4.4" }],
    prompt: "A deed is delivered on Monday but not recorded. On Wednesday a judgment creditor records an abstract against the record owner. On Friday the deed is recorded. What issue does this sequence raise?",
    choices: [
      "Whether the creditor's lien attached before the deed gave constructive notice, which the recording and priority rules determine.",
      "Whether the deed is void, since an unrecorded deed transfers nothing.",
      "Whether the grantee may re-record the deed with Monday's date.",
      "Whether the creditor must release the lien because the deed predates it."
    ],
    correctChoice: 0,
    rationale: "The deed can be effective between the parties while giving no constructive notice to the world. That gap is exactly what the recording system resolves, and the outcome turns on priority rather than on which document is older." },
  { source: { assignment: "assignment-10", section: "2.5" },
    crossReferences: [{ assignment: "assignment-08", section: "5.3" }],
    prompt: "The parties sign an amendment extending the closing date, and it is never sent to escrow. What is the position?",
    choices: [
      "The amendment binds the parties, but escrow will act on the instructions it holds, so the extension must be transmitted for the closing to reflect it.",
      "The amendment is ineffective because escrow did not receive it.",
      "Escrow is required to detect the amendment and adjust the closing accordingly.",
      "The original closing date is unenforceable once any amendment exists."
    ],
    correctChoice: 0,
    rationale: "The purchase agreement governs what the parties owe each other; the escrow instructions govern what the neutral third party does. Keeping them aligned is the licensee's task on every file." },
  { source: { assignment: "assignment-12", section: "6.4" },
    crossReferences: [{ assignment: "assignment-14", section: "5.5" }],
    prompt: "A manager tells a licensee to send the appraiser three comparables selected because they support the contract price, and to use an appraiser 'whose numbers come in.' How should both instructions be assessed?",
    choices: [
      "Both compromise appraiser independence — selecting data to support a number and selecting appraisers by favorable history are two forms of communicating a target.",
      "Supplying comparables is always permissible; only the appraiser-selection instruction is improper.",
      "Both are permissible because the appraiser remains free to reject the data.",
      "Only the comparables instruction is improper, since appraiser selection is a business decision."
    ],
    correctChoice: 0,
    rationale: "Information may be supplied; a target may not. A set assembled by working backward from a figure is a target in another form, and selecting by history builds the pressure into the ordering pattern." },
  { source: { assignment: "assignment-01", section: "4.2" },
    crossReferences: [{ assignment: "assignment-08", section: "6.9" }],
    prompt: "A client asks whether he can cancel and recover his deposit. Which response is within the licensee's scope?",
    choices: [
      "State what the agreement provides procedurally and by when, and refer the question of his rights and the deposit's disposition to counsel.",
      "Tell him the liquidated damages clause caps the seller's recovery at the deposit amount.",
      "Tell him he may cancel because his contingency period has not expired.",
      "Tell him the deposit is returned automatically whenever a buyer cancels in writing."
    ],
    correctChoice: 0,
    rationale: "Explaining the document's procedure is within scope; stating the legal effect on his rights is not. The three rejected answers are all legal conclusions delivered under pressure." },
  { source: { assignment: "assignment-06", section: "6.2" },
    crossReferences: [{ assignment: "assignment-05", section: "4.2" }],
    prompt: "A buyer intends to add a second unit to a property. What does defensible due diligence require before he removes his contingencies?",
    choices: [
      "Confirmation from the jurisdiction of what the ordinance permits and what permits are required, and review of the recorded private restrictions, since either can defeat the plan.",
      "Confirmation from the jurisdiction only, since public controls supersede private restrictions.",
      "Review of the recorded restrictions only, since they are specific to the property.",
      "A written opinion from the licensee that the plan appears feasible."
    ],
    correctChoice: 0,
    rationale: "The public and private systems operate independently and both must be checked. The licensee identifies the work and routes it rather than offering an opinion on feasibility." },
  { source: { assignment: "assignment-11", section: "6.7" },
    crossReferences: [{ assignment: "assignment-13", section: "2.6" }],
    prompt: "A seller in default asks his listing agent what a short sale will do to his credit and his taxes, and whether the lender will approve one. What should the agent do?",
    choices: [
      "Route the credit and tax questions to the appropriate professionals, state that lienholder approval is the lienholder's decision, and make no prediction about the outcome.",
      "Explain the general credit and tax consequences and say that lenders usually approve.",
      "Tell the seller the lender will approve because the alternative costs the lender more.",
      "Decline to list the property, since a distressed sale is outside a licensee's scope."
    ],
    correctChoice: 0,
    rationale: "Credit and tax consequences belong to other professionals, and whether a third party will approve is not the licensee's to promise. The transaction itself is within scope." },
  { source: { assignment: "assignment-04", section: "5.6" },
    crossReferences: [{ assignment: "assignment-15", section: "5.4" }],
    prompt: "During a listing appointment the seller mentions that the neighbor's fence sits several feet inside the property line and that the two families 'have an understanding.' What follows?",
    choices: [
      "It is a known material fact that is disclosed, a survey is recommended in writing, and the legal effect of the long-standing arrangement is routed to counsel.",
      "It need not be disclosed because the arrangement is between neighbors and does not affect title.",
      "The licensee should determine from the assessor's map where the line actually runs and advise accordingly.",
      "It is disclosed only if the buyer asks about boundaries."
    ],
    correctChoice: 0,
    rationale: "The discrepancy affects what the buyer is acquiring and is material. Locating the boundary and evaluating the arrangement are both outside the licensee's competence, and disclosure is not conditioned on being asked." },
  { source: { assignment: "assignment-15", section: "6.6" },
    crossReferences: [{ assignment: "assignment-07", section: "2.7" }],
    prompt: "A licensee meets a situation no rule in the course addresses. Which sequence of questions is most likely to produce the correct action and the correct record?",
    choices: [
      "Whose decision is this, whose duty is engaged, does the decision have the information it requires, and what will the file show.",
      "What is customary in the market, what will the client accept, what will close fastest, and what will the broker approve.",
      "What does the form provide, what did the last transaction do, what does the other agent expect, and what is defensible later.",
      "What is the licensee's opinion, what is the client's preference, what is the least disruptive course, and what can be corrected afterward."
    ],
    correctChoice: 0,
    rationale: "Identifying the decision-maker, the duty engaged, whether the decision is informed, and what the record will show resolves situations no rule anticipated. The rejected sets substitute custom, convenience, or the licensee's own judgment for the analysis." },
];

/* Form B is the retake form RE 303 p.4 requires: a second full examination on the same
   material with different questions. It is authored separately and must not repeat a
   Form A item. */
const formB = [
];

export default {
  courseId: "ca-real-estate-principles-45",
  forms: { A: formA, B: formB }
};
