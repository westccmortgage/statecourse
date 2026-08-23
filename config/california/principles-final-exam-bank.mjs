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
  /* Assignment 02 section 2.9 - Civil Code 660, the affixation modes. */
  { source: { assignment: "assignment-02", section: "2.9" },
    prompt: "Civil Code \u00a7 660 lists the ways a thing is deemed affixed to land, naming \"cement, plaster, nails, bolts, or screws\" as means of permanent attachment. A television rests in a bracket that is screwed to a wall. What is the analysis?",
    choices: [
      "The bracket is affixed because screws are among the named fasteners; the television rests in it and is not affixed.",
      "Both are affixed, because the television is attached to a fixture which is itself attached to the realty.",
      "Neither is affixed, because a television is personal property and its mount takes its character.",
      "The bracket is affixed only if removing it would damage the wall."
    ],
    correctChoice: 0,
    rationale: "The statute names the fasteners, and screws are on the list. The television is held by gravity in a bracket, which is none of the named means. Damage on removal is one of the judicial tests, not the statutory definition." },
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
  /* Assignment 06 section 3.7 - the two subdivision statutes. */
  { source: { assignment: "assignment-06", section: "3.7" },
    prompt: "An owner divides a parcel into two lots for sale. Which statutory scheme applies?",
    choices: [
      "The Subdivision Map Act, administered locally; the Subdivided Lands Act does not, because it reaches divisions into five or more parcels.",
      "Both, because any division of land for sale triggers a public report from the Department of Real Estate.",
      "Neither, because a two-lot division is a lot line adjustment rather than a subdivision.",
      "The Subdivided Lands Act only, because the Department administers all divisions made for the purpose of sale."
    ],
    correctChoice: 0,
    rationale: "Government Code \u00a7 66424 defines subdivision broadly for map purposes and reaches a two-lot division. Business and Professions Code \u00a7 11000 defines subdivided lands as a division into five or more lots or parcels, so no public report is involved." },
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
  /* Assignment 08 section 4.7 - Civil Code 1624, subscribed by the party to be charged. */
  { source: { assignment: "assignment-08", section: "4.7" },
    prompt: "Civil Code \u00a7 1624 makes certain contracts invalid unless there is a writing \"subscribed by the party to be charged or by the party's agent.\" What does that phrase establish?",
    choices: [
      "Only the party being sued need have signed, so a writing signed by the seller alone may be enforced against the seller.",
      "Both parties must sign before either can enforce the agreement.",
      "The party who drafted the writing must sign it before it takes effect.",
      "A signature is required only where the contract exceeds a stated value."
    ],
    correctChoice: 0,
    rationale: "The requirement is asymmetric by design. The writing binds the party who subscribed it, which is why a seller's signed memorandum can be enforced against the seller even where the buyer signed nothing." },
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
  /* Assignment 13 topic 6 — investment comparison and documentation. Added when the coverage gate found the topic taught and examined on neither form. */
  { source: { assignment: "assignment-13", section: "6.4" },
    prompt: "A seller's pro forma for an apartment building carries the property tax line straight from the seller's current tax bill. Why does that single line matter more than its size suggests?",
    choices: [
      "The property is reassessed on transfer, so the buyer's actual tax expense is understated, and the understatement flows through net operating income directly into value.",
      "Property taxes are excluded from net operating income, so the error changes cash flow but leaves the valuation untouched.",
      "The buyer inherits the seller's assessment, so the figure is correct until the county revalues the property on its own schedule.",
      "The line is small relative to the other operating expenses, so an error in it is immaterial to the analysis."
    ],
    correctChoice: 0,
    rationale: "Reassessment on transfer is the point. A tax figure taken from the seller understates the buyer's expense, sometimes by a large multiple, and because the expense reduces net operating income the error does not stay in the expense column \u2014 it capitalizes into the value conclusion." },
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
  /* Assignment 15 topic 2 — property management agreements. Added by the coverage gate. */
  { source: { assignment: "assignment-15", section: "2.3" },
    prompt: "An audit of a management practice finds two owners whose management agreements were never signed. How should that finding be characterized?",
    choices: [
      "As a structural defect of the same order as commingling: the scope of authority is undefined, the compensation is unenforceable, and the handling of funds is not authorized in writing.",
      "As a filing oversight, cured by obtaining signatures now and dating them to the start of management.",
      "As immaterial, because the owners accepted monthly statements and thereby ratified the arrangement.",
      "As a defect only if and when an owner disputes an action the manager has taken."
    ],
    correctChoice: 0,
    rationale: "A manager acting without a signed agreement is acting without established authority. That is not a paperwork gap: every decision is arguable, the compensation cannot be enforced, and the handling of the owner's funds rests on nothing written. Dating a signature to a time before it was made would convert a documented gap into a falsified document." },
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
  /* Assignment 03 section 3.9 - Civil Code 683, express declaration. */
  { source: { assignment: "assignment-03", section: "3.9" },
    prompt: "Two sisters buy a house together in equal shares, intending that the survivor should take the whole. The deed names them both and says nothing more. Under Civil Code \u00a7 683, what have they created?",
    choices: [
      "A tenancy in common, because \u00a7 683 requires a joint tenancy to be expressly declared in the transfer.",
      "A joint tenancy, because they took in equal shares by a single transfer at the same time.",
      "A joint tenancy, because their intention was clear and the unities are satisfied.",
      "Community property with right of survivorship, which is the default for co-owners taking equal shares."
    ],
    correctChoice: 0,
    rationale: "\u00a7 683 says \"when expressly declared in the transfer to be a joint tenancy.\" Equal shares, a single transfer and a clear intention are not substitutes for the words, and community property vesting is available only to spouses and partners." },
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
  /* Assignment 10 section 3.8 - B&P 10145, the three lawful destinations. */
  { source: { assignment: "assignment-10", section: "3.8" },
    prompt: "Business and Professions Code \u00a7 10145 requires a broker who accepts funds belonging to others to place them in one of a limited set of destinations. Which is NOT among them?",
    choices: [
      "The broker's general business account, pending transfer once the transaction is further along.",
      "A neutral escrow depository, immediately.",
      "The hands of the broker's principal, immediately.",
      "A trust fund account maintained by the broker in a bank or recognised depository in this state."
    ],
    correctChoice: 0,
    rationale: "The section names three destinations and no more. A general business account is where commingling happens, and the offence does not require a loss, a shortage, or any intent." },
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
  /* Assignment 01 section 2.9 - B&P Code 10131, the acts that require a licence, added with the statutory expansion. */
  { source: { assignment: "assignment-01", section: "2.9" },
    prompt: "Business and Professions Code \u00a7 10131 defines a real estate broker as a person who acts \"for a compensation or in expectation of a compensation, regardless of the form or time of payment.\" A person performs a listed act hoping to be paid, and is never paid. What follows?",
    choices: [
      "The expectation of compensation satisfies the section; the act was performed for compensation within its meaning.",
      "No licence was required, because the section reaches only acts for which compensation was actually received.",
      "No licence was required unless the person had a written fee agreement.",
      "The section applies only if the compensation would have been a commission rather than a flat fee."
    ],
    correctChoice: 0,
    rationale: "The Legislature wrote \"or in expectation of a compensation\" precisely so that non-payment would not defeat the section, and \"regardless of the form or time of payment\" so that the shape of the fee would not either." },
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
  /* Assignment 15 section 4.10 - B&P 10176(f), the exclusive agreement with no termination date. */
  { source: { assignment: "assignment-15", section: "4.10" },
    prompt: "Business and Professions Code \u00a7 10176(f) makes it a ground for discipline to claim, demand or receive a fee under an exclusive agreement that lacks something. What?",
    choices: [
      "A definite, specified date of final and complete termination.",
      "A statement of the commission rate expressed as a percentage.",
      "The signature of the employing broker as well as the salesperson.",
      "A recital that the agreement is governed by California law."
    ],
    correctChoice: 0,
    rationale: "The subdivision requires a definite, specified termination date. \"Until sold\" and \"90 days from acceptance\" are not dates, and the offence is claiming a fee under such an agreement rather than signing one." },
];

/* Form B is the retake form RE 303 p.4 requires: a second full examination on the same
   material with different questions. It is authored separately and must not repeat a
   Form A item. */
const formB = [
  /* Assignment 01 — The real estate profession and California regulatory structure */
  { source: { assignment: "assignment-01", section: "1.4" },
    prompt: "Which statement correctly distinguishes land from real property?",
    choices: [
      "Land is the surface, what lies beneath, and the space above; real property is land together with what is affixed and appurtenant to it and the rights it carries.",
      "Land includes improvements, while real property is the unimproved surface only.",
      "Land is the legal concept and real property is the physical concept.",
      "The terms are interchangeable in California law."
    ],
    correctChoice: 0,
    rationale: "Real property is the broader concept, taking in the land plus attachments, appurtenances, and the bundle of rights." },
  { source: { assignment: "assignment-01", section: "2.5" },
    prompt: "What is the function of the Real Estate Recovery Account?",
    choices: [
      "To provide a limited source of recovery to a member of the public who obtains an unsatisfied judgment against a licensee for specified conduct.",
      "To reimburse licensees for losses caused by clients who fail to pay commissions.",
      "To fund the Department's investigation and enforcement operations.",
      "To insure brokerages against errors and omissions claims."
    ],
    correctChoice: 0,
    rationale: "The account exists for injured members of the public who cannot collect a judgment. It is not licensee insurance, an operating fund, or an errors and omissions policy." },
  { source: { assignment: "assignment-01", section: "3.5" },
    prompt: "Which of the following may a salesperson NOT do?",
    choices: [
      "Accept compensation for licensed activity directly from a party rather than through the employing broker.",
      "Prepare a comparative market analysis for a seller.",
      "Present an offer to a seller on behalf of a buyer.",
      "Hold a listing agreement in the brokerage's name."
    ],
    correctChoice: 0,
    rationale: "Compensation for licensed activity flows through the employing broker. The other three are ordinary salesperson activity performed under the broker's authority." },
  { source: { assignment: "assignment-01", section: "5.1" },
    prompt: "In the hierarchy of California real estate law, what is the relationship between the Real Estate Law and the Commissioner's Regulations?",
    choices: [
      "The statute is enacted by the Legislature and the regulations are adopted under authority the statute grants; both are binding.",
      "The regulations are advisory interpretations that carry no independent force.",
      "The regulations supersede the statute where the two address the same subject.",
      "The statute applies to brokers and the regulations apply to salespersons."
    ],
    correctChoice: 0,
    rationale: "Regulations are adopted under statutory authority and are binding. They neither supersede the statute nor divide by license level." },
  { source: { assignment: "assignment-01", section: "6.3" },
    prompt: "Which of the following will escrow NOT do?",
    choices: [
      "Notice that a term the parties agreed to never reached escrow and adjust the closing accordingly.",
      "Follow written instructions signed by both parties.",
      "Hold funds and documents pending satisfaction of the conditions in its instructions.",
      "Prepare a closing statement from the documents and instructions it holds."
    ],
    correctChoice: 0,
    rationale: "Escrow is neutral and acts on the instructions it holds. Detecting an agreement it never received is not its function, which is why transmission is the licensee's task." },
  { source: { assignment: "assignment-01", section: "2.6" },
    prompt: "A licensee receives a document request in a Department investigation. What is the correct first step?",
    choices: [
      "Preserve everything, respond with the broker and, where appropriate, counsel, and produce what is requested rather than answering personally and quickly.",
      "Answer immediately in his own words to demonstrate cooperation.",
      "Organize and clean up the file before producing it so the record reads clearly.",
      "Decline to respond until served with a formal accusation."
    ],
    correctChoice: 0,
    rationale: "The process is largely documentary. Preservation is immediate and total, and an improvised personal response is how licensees say what they did not need to say." },
  /* Assignment 01 section 5.7 - B&P 10153.2, the statute that names the courses. */
  { source: { assignment: "assignment-01", section: "5.7" },
    prompt: "Where do the titles \"Real Estate Practice\" and \"Real Estate Principles\" come from?",
    choices: [
      "Business and Professions Code \u00a7 10153.2, which names the courses an applicant must complete to qualify for examination.",
      "The Commissioner's Regulations, which prescribe course titles for private vocational schools.",
      "Convention among California schools, which have used consistent titles for decades.",
      "The Department's course provider handbook, which lists approved titles."
    ],
    correctChoice: 0,
    rationale: "\u00a7 10153.2 lists the statutory courses by name. A school offering an equivalent course offers it under the statutory title, and the regulations and the handbook implement the section rather than supply the names." },
  { source: { assignment: "assignment-02", section: "1.2" },
    prompt: "Standing timber is cut and stacked for sale. What has happened to its classification?",
    choices: [
      "It moved from real property to personal property by severance.",
      "It moved from personal property to real property by annexation.",
      "It remained real property, because it originated from the land.",
      "Its classification is determined by the intent of the buyer rather than by severance."
    ],
    correctChoice: 0,
    rationale: "Severance converts real property to personal property; annexation moves an item the other way. Origin does not fix the classification permanently." },
  { source: { assignment: "assignment-02", section: "2.6" },
    prompt: "Which factor does the 'relationship of the parties' test consider?",
    choices: [
      "Whether the person who installed the item was an owner or a tenant, because that context bears on whether it was meant to become part of the realty.",
      "Whether the buyer and seller are related by blood or marriage.",
      "Whether the listing and selling agents work for the same brokerage.",
      "Whether the installer was licensed for the work performed."
    ],
    correctChoice: 0,
    rationale: "The test looks at the installer's relationship to the property — owner or tenant — as evidence of intent. The distractors describe unrelated relationships." },
  { source: { assignment: "assignment-02", section: "4.3" },
    prompt: "Crops requiring annual cultivation are generally treated how?",
    choices: [
      "As personal property, even while growing and attached to the soil.",
      "As real property until harvested, like all growing things.",
      "As trade fixtures, because they serve the agricultural business.",
      "As personal property only after the harvest is complete."
    ],
    correctChoice: 0,
    rationale: "Annually cultivated crops are treated as personal property while growing, which distinguishes them from perennial growth such as trees and shrubs." },
  { source: { assignment: "assignment-02", section: "5.2" },
    prompt: "A buyer is purchasing rural acreage and intends to build. Which water question matters most at intake?",
    choices: [
      "Whether a confirmed and lawful supply exists for the intended use, and on what basis it is held or shared.",
      "Whether the seller's water bills have been paid current.",
      "Whether the county assesses a water availability fee.",
      "Whether the parcel has ever flooded."
    ],
    correctChoice: 0,
    rationale: "Without a confirmed supply the buyer may have purchased land he cannot use as intended. Billing, fees, and flood history are separate questions." },
  { source: { assignment: "assignment-02", section: "6.2" },
    prompt: "What is the purpose of naming items in the purchase agreement?",
    choices: [
      "To settle in advance the items whose classification is genuinely uncertain, so the analysis is never needed.",
      "To create a complete inventory of every item present at the property.",
      "To satisfy a statutory requirement that all fixtures be itemized.",
      "To transfer title to personal property without a bill of sale in every case."
    ],
    correctChoice: 0,
    rationale: "The naming list targets the uncertain items — the ones the fixture tests would have to resolve. A complete inventory is neither required nor useful." },
  { source: { assignment: "assignment-02", section: "1.5" },
    prompt: "Why can the same item's classification be contested by parties who were not at the negotiation?",
    choices: [
      "Because the classification also determines what a security instrument covers, how the transfer is documented, and how the item is taxed.",
      "Because any third party may intervene in a purchase agreement dispute.",
      "Because classification is determined by the county assessor for all purposes.",
      "Because personal property disputes are resolved in a different forum than real property disputes."
    ],
    correctChoice: 0,
    rationale: "One classification answers four separate systems' questions, so a lender, an assessor, or a lienholder can have a stake the buyer and seller never considered." },
  /* Assignment 03 — Estates, ownership, and common interests */
  { source: { assignment: "assignment-03", section: "1.2" },
    prompt: "A tenancy that continues from period to period until one party gives proper notice describes which leasehold estate?",
    choices: [
      "An estate from period to period.",
      "An estate for years.",
      "An estate at will.",
      "An estate at sufferance."
    ],
    correctChoice: 0,
    rationale: "A periodic tenancy renews automatically until notice. An estate for years has a fixed term, and an estate at sufferance describes a holdover after the right to possession ended." },
  { source: { assignment: "assignment-03", section: "2.2" },
    prompt: "An estate that may terminate if a stated condition occurs is best described as which of the following?",
    choices: [
      "A defeasible fee.",
      "A fee simple absolute.",
      "A life estate.",
      "A leasehold estate."
    ],
    correctChoice: 0,
    rationale: "A defeasible fee is a fee that can end on a stated event. A fee simple absolute has no such limitation, and a life estate is measured by a life rather than by a condition." },
  { source: { assignment: "assignment-03", section: "2.4" },
    prompt: "Which act is generally outside a life tenant's authority?",
    choices: [
      "Committing waste that permanently impairs the value of the future interest.",
      "Occupying the property.",
      "Leasing the property for a term within the life estate.",
      "Collecting rents produced by the property."
    ],
    correctChoice: 0,
    rationale: "A life tenant has the use and its income but may not impair the interest that follows. The other three are ordinary incidents of the estate." },
  { source: { assignment: "assignment-03", section: "3.3" },
    prompt: "Which set states the four unities of a joint tenancy?",
    choices: [
      "Time, title, interest, and possession.",
      "Time, transfer, intent, and possession.",
      "Title, interest, survivorship, and recording.",
      "Interest, possession, consideration, and capacity."
    ],
    correctChoice: 0,
    rationale: "Time, title, interest, and possession must all be present. Survivorship is the consequence of the unities rather than one of them." },
  { source: { assignment: "assignment-03", section: "3.5" },
    prompt: "Co-owners cannot agree on the disposition of jointly held property. What remedy addresses the deadlock?",
    choices: [
      "A partition action, which may divide the property or order it sold and the proceeds divided.",
      "A quiet title action, which determines the validity of competing claims to title.",
      "A specific performance action against the non-consenting owner.",
      "An action for adverse possession by the owner in possession."
    ],
    correctChoice: 0,
    rationale: "Partition is the remedy for co-owners who cannot agree. Quiet title resolves competing claims, and neither of the last two applies between co-owners in this posture." },
  { source: { assignment: "assignment-03", section: "6.3" },
    prompt: "A seller says the property is owned by his limited liability company and that he is a member. What establishes his authority to sign?",
    choices: [
      "The entity's governing documents and any resolution they require, not the title he uses.",
      "His membership, which carries authority to convey entity property by operation of law.",
      "A statement of information filed with the Secretary of State.",
      "The entity's tax identification number and its bank signature card."
    ],
    correctChoice: 0,
    rationale: "Authority comes from the governing documents. Membership alone does not confer it, and none of the other documents establishes signing authority." },
  /* Assignment 04 — Land description, measurement, and boundaries */
  { source: { assignment: "assignment-04", section: "2.3" },
    prompt: "In the government survey system, how many acres are in a full section?",
    choices: [
      "640",
      "160",
      "36",
      "43,560"
    ],
    correctChoice: 0,
    rationale: "A section is nominally one mile square, or 640 acres. A quarter section is 160 acres, a township contains 36 sections, and 43,560 is the square feet in one acre." },
  { source: { assignment: "assignment-04", section: "2.4" },
    prompt: "How many acres are described by 'the NW 1/4 of the SE 1/4' of a section?",
    choices: [
      "40",
      "80",
      "160",
      "20"
    ],
    correctChoice: 0,
    rationale: "Multiply the fractions and apply them to 640: 1/4 × 1/4 × 640 = 40 acres." },
  { source: { assignment: "assignment-04", section: "1.6" },
    prompt: "In a metes and bounds description, a call to a natural monument conflicts with a stated distance. Which generally controls?",
    choices: [
      "The monument, under the established order of priority among conflicting calls.",
      "The distance, because it is the more precise measurement.",
      "Whichever appears first in the description.",
      "Neither; the description fails for uncertainty."
    ],
    correctChoice: 0,
    rationale: "Monuments generally prevail over courses and distances in the priority order, on the reasoning that a physical marker reflects what was actually intended on the ground." },
  { source: { assignment: "assignment-04", section: "3.2" },
    prompt: "Why must a lot and block description include the recording reference for the map?",
    choices: [
      "Because the lot and block have meaning only by reference to the specific recorded map that defines them.",
      "Because the recorder assigns a new reference each time the property is sold.",
      "Because the reference establishes the property's assessed value.",
      "Because the reference is what transfers title at closing."
    ],
    correctChoice: 0,
    rationale: "Lot and block numbers are meaningless without the map that defines them, which is why the book and page reference is part of the description." },
  { source: { assignment: "assignment-04", section: "5.6" },
    prompt: "Which circumstance most clearly calls for recommending a survey?",
    choices: [
      "A fence, wall, or structure appears to sit near or across a boundary, or the parties describe the line differently.",
      "The property is described by lot and block rather than metes and bounds.",
      "The buyer is obtaining conventional rather than government-backed financing.",
      "The preliminary report lists more than three exceptions."
    ],
    correctChoice: 0,
    rationale: "Physical indications of a boundary problem are the trigger. The description method, the loan type, and the number of exceptions are not." },
  { source: { assignment: "assignment-04", section: "6.2" },
    prompt: "A rectangular lot measures 120 feet by 90 feet. What is its area in square feet, and approximately what fraction of an acre is that?",
    choices: [
      "10,800 square feet, about one quarter of an acre.",
      "10,800 square feet, about half an acre.",
      "1,080 square feet, about one fortieth of an acre.",
      "21,600 square feet, about half an acre."
    ],
    correctChoice: 0,
    rationale: "120 × 90 = 10,800 square feet; 10,800 ÷ 43,560 ≈ 0.248 acre. The distractors misplace a decimal, double the area, or misstate the fraction." },
  /* Assignment 05 — Encumbrances, liens, easements, and restrictions */
  { source: { assignment: "assignment-05", section: "2.2" },
    prompt: "Which characteristic distinguishes a property tax lien from most other liens?",
    choices: [
      "It generally takes priority over other liens regardless of when they were recorded.",
      "It must be recorded to attach to the property.",
      "It attaches to all of the owner's property rather than to the taxed parcel.",
      "It expires automatically if not enforced within one year."
    ],
    correctChoice: 0,
    rationale: "Property tax liens are specific to the parcel and generally hold priority ahead of recorded liens, which is what makes them different from the ordinary priority rule." },
  /* Assignment 05 section 2.8 - CCP 704.730, the homestead exemption amount. */
  { source: { assignment: "assignment-05", section: "2.8" },
    prompt: "Code of Civil Procedure \u00a7 704.730 sets the homestead exemption as the greater of the prior year's countywide median sale price for a single-family home, capped, or a stated floor, with both figures adjusting annually for inflation. What does this mean for a licensee asked the amount?",
    choices: [
      "The answer is county-specific and changes annually, and because the section prints base figures rather than the adjusted ones, it cannot be given from the code alone.",
      "The answer is a single statewide amount that has been fixed since the section was last amended.",
      "The answer depends on the debtor's age and household composition, as it did under the former scheme.",
      "The answer is whatever equity the debtor has, since the exemption protects the whole homestead."
    ],
    correctChoice: 0,
    rationale: "The section sets a base floor and a base cap with the actual figure driven by the prior year's county median, and subdivision (b) then adjusts both amounts every January. The adjusted amounts are not printed in the section, so reading the code alone does not produce the current number. Age and household tiering belonged to the repealed scheme." },
  { source: { assignment: "assignment-05", section: "3.3" },
    prompt: "Which of the following is a recognized way an easement may be created?",
    choices: [
      "By express grant or reservation, by implication, by necessity, or by prescription.",
      "By an oral agreement between neighbors, in every case.",
      "By continuous use for any period, without more.",
      "By the county assessor's designation on a parcel map."
    ],
    correctChoice: 0,
    rationale: "Grant, reservation, implication, necessity, and prescription are the recognized routes. Use alone, an oral arrangement, and an assessor's map do not create an interest in land." },
  { source: { assignment: "assignment-05", section: "4.4" },
    prompt: "Who generally enforces a private recorded restriction in a common interest development?",
    choices: [
      "The association or a benefited owner, through the remedies the declaration and the law provide.",
      "The city or county planning department.",
      "The Department of Real Estate, through its disciplinary process.",
      "The title insurer that issued the owner's policy."
    ],
    correctChoice: 0,
    rationale: "Private restrictions are privately enforced. Public agencies enforce public land use controls, and the title insurer's role is coverage rather than enforcement." },
  { source: { assignment: "assignment-05", section: "5.1" },
    prompt: "A neighbor's garage extends two feet onto the subject property. What is this?",
    choices: [
      "An encroachment, which is a physical intrusion and a matter a survey rather than a title search reveals.",
      "An easement by prescription, established by the structure's presence.",
      "A license, revocable by the owner at any time.",
      "A nonconforming use under the zoning ordinance."
    ],
    correctChoice: 0,
    rationale: "An encroachment is a physical intrusion. Whether it has ripened into any legal right is a separate question, and it is the classic survey matter." },
  { source: { assignment: "assignment-05", section: "6.5" },
    prompt: "What is the essential difference between an owner's policy and a lender's policy of title insurance?",
    choices: [
      "The owner's policy insures the owner's interest, while the lender's policy insures the lender's security interest and generally declines with the loan balance.",
      "The owner's policy covers survey matters, while the lender's policy does not.",
      "The owner's policy is issued after closing, while the lender's policy is issued before.",
      "They are the same policy issued to two payees."
    ],
    correctChoice: 0,
    rationale: "The two policies insure different interests for different amounts and durations. Neither, in standard form, performs the function of a survey." },
  /* Assignment 06 — Government powers, land use, and environmental controls */
  { source: { assignment: "assignment-06", section: "1.5" },
    prompt: "Property passes to the state because an owner died without a will and without heirs. Which power is this?",
    choices: [
      "Escheat.",
      "Eminent domain.",
      "Police power.",
      "Taxation."
    ],
    correctChoice: 0,
    rationale: "Escheat addresses property with no owner to take it. Eminent domain involves a taking for public use with compensation." },
  { source: { assignment: "assignment-06", section: "2.1" },
    prompt: "What is the relationship between a general plan and a zoning ordinance?",
    choices: [
      "The general plan states the jurisdiction's long-range policy and the zoning ordinance implements it parcel by parcel.",
      "The zoning ordinance states policy and the general plan implements it.",
      "They are alternative names for the same document.",
      "The general plan applies to unincorporated areas and zoning to incorporated ones."
    ],
    correctChoice: 0,
    rationale: "Policy sits above implementation in the planning hierarchy, which is why a zoning question can turn on consistency with the general plan." },
  { source: { assignment: "assignment-06", section: "3.2" },
    prompt: "Why does a buyer need to know whether work on a property was permitted?",
    choices: [
      "Unpermitted work can affect legal use, insurability, financing, valuation, and what may lawfully be advertised about the property.",
      "Permits determine the property's assessed value for the following fiscal year only.",
      "A permit is required before a property may be listed for sale.",
      "Unpermitted work voids the seller's title."
    ],
    correctChoice: 0,
    rationale: "The consequences reach several systems at once. Unpermitted work does not void title, and no permit is required to list a property." },
  { source: { assignment: "assignment-06", section: "4.2" },
    prompt: "Which fact triggers the federal lead-based paint disclosure obligation for residential property?",
    choices: [
      "The dwelling was built before 1978.",
      "The dwelling has visible peeling paint.",
      "The dwelling is being sold rather than leased.",
      "The buyer intends to occupy the property with children."
    ],
    correctChoice: 0,
    rationale: "The obligation is age-triggered for target housing built before 1978, and it applies to both sales and leases regardless of condition or the buyer's household." },
  { source: { assignment: "assignment-06", section: "5.4" },
    prompt: "Why is a fire hazard severity zone determination increasingly consequential to a California buyer beyond the disclosure itself?",
    choices: [
      "It can affect the availability and cost of insurance, which a buyer should establish before removing contingencies.",
      "It prohibits any new construction within the zone.",
      "It requires the seller to complete defensible space work before closing in every case.",
      "It reduces the property's assessed value automatically."
    ],
    correctChoice: 0,
    rationale: "Insurance availability is the practical consequence and it surprises buyers late. The other options state prohibitions and automatic effects that do not follow from the determination itself." },
  { source: { assignment: "assignment-06", section: "6.5" },
    prompt: "What is the recurring due diligence failure this lesson identifies?",
    choices: [
      "The buyer's stated plan is never tested against the property's actual public and private constraints before contingencies are removed.",
      "Buyers order too many specialist reports and run out of time.",
      "Licensees rely on surveys rather than on the title report.",
      "Sellers refuse to disclose zoning information."
    ],
    correctChoice: 0,
    rationale: "The failure is that nobody asks the jurisdiction and nobody reads the recorded restrictions, and the omission is discovered after closing when it costs the most." },
  /* Assignment 07 — Agency and brokerage relationships */
  { source: { assignment: "assignment-07", section: "2.2" },
    prompt: "A principal instructs his agent to do something unlawful. What does the duty of obedience require?",
    choices: [
      "The agent must refuse, explain why, and escalate, because the duty extends only to lawful instructions.",
      "The agent must comply, because obedience is owed to the principal without qualification.",
      "The agent may comply if he documents that the instruction came from the principal.",
      "The agent must resign immediately without explanation."
    ],
    correctChoice: 0,
    rationale: "Obedience is limited to lawful instructions. Documenting an improper instruction records that the agent knew; it does not transfer responsibility for the act." },
  /* Assignment 07 section 4.9 - Civil Code 2079.16, the duty owed to the party not represented. */
  { source: { assignment: "assignment-07", section: "4.9" },
    prompt: "Civil Code \u00a7 2079.16 divides a seller's agent's obligations into duties owed to the seller and duties owed \"to the Buyer and the Seller.\" Which is in the second group?",
    choices: [
      "The duty to disclose all facts known to the agent materially affecting the value or desirability of the property.",
      "The fiduciary duty of utmost care, integrity, honesty and loyalty.",
      "The duty to obey the client's lawful instructions.",
      "The duty to keep the client's bargaining position confidential."
    ],
    correctChoice: 0,
    rationale: "The disclosure duty runs to both parties even though the fiduciary duty runs only to the client. Loyalty, obedience and confidentiality are owed to the principal." },
  { source: { assignment: "assignment-07", section: "3.3" },
    prompt: "What may a dual agent NOT do?",
    choices: [
      "Disclose to one party the price or terms the other party is willing to accept, absent that party's written authorization.",
      "Present offers and counteroffers between the parties.",
      "Disclose material facts about the property's condition to both parties.",
      "Explain the provisions of the purchase agreement to both parties."
    ],
    correctChoice: 0,
    rationale: "Confidential negotiating information may not move between the sides. Presenting offers, disclosing material facts, and explaining provisions all remain required." },
  { source: { assignment: "assignment-07", section: "5.5" },
    prompt: "A salesperson commits a violation in the course of licensed activity. What is the broker's exposure?",
    choices: [
      "The broker may be responsible for the acts of licensees under his supervision, because supervision is an affirmative duty rather than an optional oversight function.",
      "None, provided the salesperson signed an independent contractor agreement.",
      "None, because discipline runs only against the individual who acted.",
      "The broker is responsible only if he directed the specific act."
    ],
    correctChoice: 0,
    rationale: "Vicarious responsibility follows from the supervisory duty. Independent contractor status for tax and payroll purposes does not reduce it." },
  { source: { assignment: "assignment-07", section: "6.8" },
    prompt: "Which obligation survives the termination of an agency relationship?",
    choices: [
      "Confidentiality as to the former principal's confidential information.",
      "The duty to continue marketing the property.",
      "The duty of obedience to the former principal's instructions.",
      "The right to compensation on any future sale, regardless of the agreement's terms."
    ],
    correctChoice: 0,
    rationale: "Confidentiality continues after the engagement ends. Performance duties end with it, and compensation after termination is governed by the agreement's own terms." },
  { source: { assignment: "assignment-07", section: "6.5" },
    prompt: "Why is the referral fee prohibition different from an ordinary conflict of interest?",
    choices: [
      "Where a payment is prohibited, disclosing it does not make it lawful — the first question is whether it may be received at all.",
      "Referral fees must be disclosed only to the paying party.",
      "Referral fees are permitted if the referring licensee performs no work.",
      "Referral fees become lawful once the client signs an acknowledgment."
    ],
    correctChoice: 0,
    rationale: "A conflict is managed by timely disclosure; a prohibited payment is not cured by disclosure at all. Asking only whether it was disclosed skips the first question." },
  /* Assignment 08 — Contracts and transaction formation */
  { source: { assignment: "assignment-08", section: "1.3" },
    prompt: "Which describes a unilateral contract?",
    choices: [
      "A promise given in exchange for an act, where the offeree is not obligated to perform.",
      "A contract signed by only one of the two parties.",
      "A contract in which only one party receives consideration.",
      "A contract that may be terminated by one party without notice."
    ],
    correctChoice: 0,
    rationale: "The distinction is promise-for-act versus promise-for-promise, not the number of signatures or who benefits." },
  { source: { assignment: "assignment-08", section: "2.4" },
    prompt: "Which event does NOT terminate an offer before acceptance?",
    choices: [
      "The offeror's expression of hope that the offeree will accept soon.",
      "Revocation communicated to the offeree.",
      "Rejection by the offeree.",
      "Lapse of the time stated in the offer."
    ],
    correctChoice: 0,
    rationale: "Revocation, rejection, lapse, and in some circumstances death or incapacity terminate an offer. An expression of hope does not." },
  { source: { assignment: "assignment-08", section: "2.5" },
    prompt: "What distinguishes an option from an ordinary offer?",
    choices: [
      "Consideration has been given to keep the offer open, so it cannot be revoked during the option period.",
      "An option must be recorded to be enforceable.",
      "An option obligates the optionee to purchase.",
      "An option may be created orally while an offer must be written."
    ],
    correctChoice: 0,
    rationale: "Consideration purchases irrevocability for the stated period. The optionee is not obligated to exercise, which is the point of an option." },
  { source: { assignment: "assignment-08", section: "3.4" },
    prompt: "A contract falls within the Statute of Frauds and was never reduced to writing. How is it best described?",
    choices: [
      "Unenforceable.",
      "Void.",
      "Voidable at the option of either party.",
      "Executed."
    ],
    correctChoice: 0,
    rationale: "Non-compliance with the statute makes an otherwise valid agreement unenforceable rather than void, which is a different consequence with different remedies." },
  { source: { assignment: "assignment-08", section: "5.3" },
    prompt: "How does a contingency in a residential purchase agreement generally cease to protect the buyer?",
    choices: [
      "By removal or waiver in the manner and within the time the agreement specifies.",
      "Automatically, when the underlying condition is satisfied.",
      "When the seller notifies the buyer that the contingency period has ended.",
      "When escrow confirms that the buyer's inspections are complete."
    ],
    correctChoice: 0,
    rationale: "Removal follows the agreement's own procedure and timing. Satisfaction of the condition, a seller's notice, and escrow's observation do not remove it by themselves." },
  { source: { assignment: "assignment-08", section: "6.4" },
    prompt: "What is a liquidated damages provision?",
    choices: [
      "An advance agreement fixing the amount recoverable on a specified breach, in place of proving actual damages.",
      "A provision requiring the breaching party to pay the other's attorney fees.",
      "A provision converting the deposit into an option payment.",
      "A provision requiring the parties to mediate before filing suit."
    ],
    correctChoice: 0,
    rationale: "Liquidated damages fix an amount in advance. Fee-shifting, option treatment, and dispute resolution are separate provisions with separate functions." },
  /* Assignment 09 — Transfer, deeds, title, and recording */
  { source: { assignment: "assignment-09", section: "1.2" },
    prompt: "Which element is required for a valid deed?",
    choices: [
      "A grantee identified with reasonable certainty.",
      "The signature of the grantee.",
      "Recording within a stated period after execution.",
      "A statement of the consideration actually paid."
    ],
    correctChoice: 0,
    rationale: "The grantee must be identifiable. The grantee does not sign, recording is not an element of validity, and the actual consideration need not be stated." },
  { source: { assignment: "assignment-09", section: "2.3" },
    prompt: "What does a quitclaim deed convey?",
    choices: [
      "Whatever interest the grantor has, if any, with no warranty that he has any.",
      "Fee simple absolute, warranted against all claims.",
      "The interest described in the preliminary report.",
      "Nothing, since a quitclaim deed only releases claims and cannot transfer title."
    ],
    correctChoice: 0,
    rationale: "A quitclaim passes whatever the grantor holds without warranty. It can transfer a full interest if the grantor has one; it simply promises nothing." },
  /* Assignment 09 section 4.8 - Civil Code 1214, the four conditions. */
  { source: { assignment: "assignment-09", section: "4.8" },
    prompt: "A buyer takes a deed and does not record it. Later the same owner gifts the property to a nephew, who records immediately and knows nothing of the first deed. Under Civil Code \u00a7 1214, who prevails?",
    choices: [
      "The first buyer, because the nephew did not take for a valuable consideration.",
      "The nephew, because he recorded first and took in good faith.",
      "The nephew, because an unrecorded conveyance is void against anyone.",
      "The first buyer, because a gift deed conveys nothing until the donee pays value."
    ],
    correctChoice: 0,
    rationale: "\u00a7 1214 protects a subsequent purchaser or mortgagee who is in good faith, for a valuable consideration, and first to record. A donee fails the consideration element, so the earlier unrecorded deed stands against him." },
  { source: { assignment: "assignment-09", section: "4.2" },
    prompt: "Which describes constructive notice?",
    choices: [
      "Notice the law imputes from the public record, whether or not the person actually examined it.",
      "Notice a person actually has from having been told.",
      "Notice arising from facts that would cause a reasonable person to inquire further.",
      "Notice given by publication in a newspaper of general circulation."
    ],
    correctChoice: 0,
    rationale: "Constructive notice is imputed from the record. The second describes actual notice and the third inquiry notice." },
  { source: { assignment: "assignment-09", section: "6.4" },
    prompt: "Land is gradually added to a riverfront parcel by the slow deposit of soil. What is this called?",
    choices: [
      "Accretion, and the added land generally belongs to the owner of the parcel to which it attached.",
      "Avulsion, which is the sudden loss or addition of land.",
      "Reliction, which is land uncovered by the permanent recession of water.",
      "Erosion, which is the gradual loss of land."
    ],
    correctChoice: 0,
    rationale: "Accretion is gradual addition by deposit. Avulsion is sudden, reliction is exposure by receding water, and erosion is gradual loss." },
  /* Assignment 10 — Escrow, settlement, and transaction chronology */
  { source: { assignment: "assignment-10", section: "1.1" },
    prompt: "What is escrow?",
    choices: [
      "A neutral third party that holds funds and documents and performs the parties' written instructions when the stated conditions are satisfied.",
      "An agent of the buyer, responsible for protecting the buyer's deposit.",
      "A division of the title company that issues the policy of title insurance.",
      "A licensee acting as an intermediary between the two brokerages."
    ],
    correctChoice: 0,
    rationale: "Neutrality and instruction-following define escrow. It represents neither party, and issuing title insurance is a separate function." },
  { source: { assignment: "assignment-10", section: "1.6" },
    prompt: "A licensee is offered a payment by an escrow company for each transaction he directs to it. What is the problem?",
    choices: [
      "It is a payment for the referral of settlement service business, which the referral prohibition reaches; disclosure does not make it permissible.",
      "Nothing, provided the licensee discloses the arrangement to his client.",
      "Nothing, provided the client is free to choose a different escrow holder.",
      "It is permissible only if the payment is made to the brokerage rather than to the licensee."
    ],
    correctChoice: 0,
    rationale: "Whether the payment may be received at all comes before whether it was disclosed, and routing it to the brokerage does not change its character." },
  { source: { assignment: "assignment-10", section: "3.2" },
    prompt: "Buyer and seller each demand the deposit after a cancellation. What determines the disposition?",
    choices: [
      "The contract's own procedure and, failing agreement, a legal determination — not escrow's assessment of who is right.",
      "The escrow holder's judgment, applied neutrally to both claims.",
      "The listing broker's decision, since the deposit is held in the brokerage's trust account.",
      "Automatic return to the buyer, since the deposit is his funds."
    ],
    correctChoice: 0,
    rationale: "Neutrality prevents escrow from deciding. The contract sets the procedure, and an unresolved dispute is a legal question rather than a brokerage or escrow determination." },
  { source: { assignment: "assignment-10", section: "4.4" },
    prompt: "Why must a proration state the convention used?",
    choices: [
      "Because a 360-day and a 365-day basis, and the treatment of the closing date itself, produce different dollar amounts from the same facts.",
      "Because the county requires the convention to be recorded with the deed.",
      "Because the lender selects the convention and it varies by loan program.",
      "Because the convention determines which party is charged for the item."
    ],
    correctChoice: 0,
    rationale: "The convention changes the arithmetic, which is why a proration is checked against the convention rather than only against the total." },
  { source: { assignment: "assignment-10", section: "5.6" },
    prompt: "What is the relationship between possession and ownership at closing?",
    choices: [
      "They are separate: ownership transfers on recording of the deed, and possession transfers as the agreement provides.",
      "They are the same event and cannot be separated by agreement.",
      "Possession always transfers before ownership in a residential sale.",
      "Ownership transfers on funding and possession on recording."
    ],
    correctChoice: 0,
    rationale: "Possession is a contract term and ownership is a title event. Any arrangement other than possession at closing needs its own written agreement." },
  { source: { assignment: "assignment-10", section: "6.5" },
    prompt: "A post-closing audit finds a required disclosure with no evidence of when it was delivered. What is the correct handling?",
    choices: [
      "Record the finding, attempt to obtain evidence that legitimately exists, and escalate — without creating a delivery record after the fact.",
      "Enter today's date as the delivery date so the file is complete.",
      "Remove the disclosure from the file, since an undated document has no value.",
      "Ask the buyer to sign a receipt dated as of the original delivery."
    ],
    correctChoice: 0,
    rationale: "A documented gap is survivable; a manufactured record is not. Back-dating a receipt through the buyer's signature is the same act performed by a different hand." },
  /* Assignment 11 — Real estate finance foundations */
  { source: { assignment: "assignment-11", section: "1.4" },
    prompt: "What does an acceleration clause in a promissory note permit?",
    choices: [
      "The holder to declare the entire unpaid balance immediately due on the occurrence of a stated event, such as default.",
      "The borrower to prepay the loan without penalty at any time.",
      "The lender to raise the interest rate at its discretion.",
      "The loan to be assumed by a subsequent purchaser."
    ],
    correctChoice: 0,
    rationale: "Acceleration makes the whole balance due on default. Prepayment, rate adjustment, and assumption are governed by separate clauses." },
  /* Assignment 11 section 6.11 - CCP 580d, the trustee's sale bar. */
  { source: { assignment: "assignment-11", section: "6.11" },
    prompt: "A lender forecloses non-judicially under the power of sale in a deed of trust. The sale leaves a shortfall. What does Code of Civil Procedure \u00a7 580d provide?",
    choices: [
      "No deficiency may be owed or collected from the borrower, whatever the loan was for.",
      "A deficiency may be collected only if the loan was not purchase money.",
      "A deficiency may be collected after a statutory redemption period expires.",
      "A deficiency may be collected up to the difference between the sale price and the fair value of the property."
    ],
    correctChoice: 0,
    rationale: "\u00a7 580d bars the deficiency outright where the property has been sold under the power of sale. The purchase-money character matters under \u00a7 580b, and fair-value limits belong to judicial foreclosure." },
  { source: { assignment: "assignment-11", section: "4.3" },
    prompt: "A borrower pays 2 points on a loan of $425,000. What is the dollar cost?",
    choices: [
      "$8,500",
      "$850",
      "$4,250",
      "$21,250"
    ],
    correctChoice: 0,
    rationale: "A point is one percent of the loan amount: $425,000 × 0.02 = $8,500. The distractors misplace a decimal, use one point, and use five." },
  { source: { assignment: "assignment-11", section: "4.6" },
    prompt: "What is an impound account?",
    choices: [
      "An account into which the borrower pays a portion of taxes and insurance with each payment, from which the servicer pays those items when due.",
      "An account holding the borrower's down payment until closing.",
      "A reserve the lender holds against future rate increases.",
      "An account into which rents are deposited during a default."
    ],
    correctChoice: 0,
    rationale: "Impounds collect and disburse taxes and insurance. The other descriptions are of escrow deposits, rate reserves, and receivership arrangements." },
  { source: { assignment: "assignment-11", section: "6.6" },
    prompt: "A senior lienholder completes a nonjudicial foreclosure sale. What generally happens to junior liens against the property?",
    choices: [
      "Junior liens are generally extinguished as to the property, though the underlying obligations may survive against the borrower depending on the circumstances.",
      "Junior liens attach to the purchaser at the sale and must be paid by him.",
      "Junior liens are unaffected and remain enforceable against the property.",
      "Junior liens advance in priority and become the new first lien."
    ],
    correctChoice: 0,
    rationale: "A senior lien's foreclosure clears junior liens from the property. Whether the debt survives against the borrower personally is a separate question." },
  { source: { assignment: "assignment-11", section: "3.3" },
    prompt: "Which statement about government-backed loan programs is accurate?",
    choices: [
      "The agency insures or guarantees the loan against loss; the loan itself is made by an approved lender.",
      "The agency lends the money directly to the borrower.",
      "The agency sets the interest rate the borrower will pay.",
      "The agency appraises the property and issues the title policy."
    ],
    correctChoice: 0,
    rationale: "Insuring or guaranteeing is not lending. The rate is set in the market between lender and borrower, and appraisal and title are separate functions." },
  /* Assignment 12 — Valuation and appraisal foundations */
  { source: { assignment: "assignment-12", section: "1.2" },
    prompt: "Which condition is part of the definition of market value?",
    choices: [
      "Buyer and seller are each typically motivated, well informed, and acting without undue duress, with the property exposed on the open market for a reasonable time.",
      "The transaction closes for cash without financing of any kind.",
      "The price equals the cost to replace the improvements.",
      "The buyer and seller are related and the price reflects a family arrangement."
    ],
    correctChoice: 0,
    rationale: "Market value assumes typical motivation, information, absence of duress, and reasonable exposure. Cost is not value, and a related-party arrangement is the opposite of an arm's-length sale." },
  { source: { assignment: "assignment-12", section: "1.6" },
    prompt: "A homeowner spends $60,000 on a swimming pool and the property's value rises by $25,000. Which principle does this illustrate?",
    choices: [
      "Contribution — a component adds what the market says it adds, which is not what it cost.",
      "Substitution — a buyer will pay no more than the cost of an equivalent substitute.",
      "Conformity — value is maximized where a property conforms to its surroundings.",
      "Progression — a lesser property gains value from better surrounding properties."
    ],
    correctChoice: 0,
    rationale: "Contribution measures what a component adds to value. The gap between cost and contribution is the single most useful point in a pricing conversation." },
  { source: { assignment: "assignment-12", section: "2.2" },
    prompt: "Which set states the four tests of highest and best use?",
    choices: [
      "Legally permissible, physically possible, financially feasible, and maximally productive.",
      "Zoned, financed, marketable, and improved.",
      "Available, affordable, appropriate, and approved.",
      "Permitted, profitable, popular, and permanent."
    ],
    correctChoice: 0,
    rationale: "The four tests are applied in that order, and a use failing any one of them is not the highest and best use." },
  { source: { assignment: "assignment-12", section: "3.6" },
    prompt: "What does an active listing prove for valuation purposes?",
    choices: [
      "What a seller is asking, which sets an upper boundary on the market's response rather than establishing value.",
      "What a buyer has agreed to pay for a comparable property.",
      "What a property actually sold for after negotiation.",
      "What an appraiser concluded about a comparable property."
    ],
    correctChoice: 0,
    rationale: "An asking price is an offer to the market, not a transaction. Closed sales prove what buyers actually paid, which is why they dominate the analysis." },
  { source: { assignment: "assignment-12", section: "4.6" },
    prompt: "What is the difference between effective age and actual age?",
    choices: [
      "Actual age is chronological; effective age reflects condition, maintenance, and updating, and may be less or more than actual age.",
      "Effective age is the age since the last sale; actual age is the age since construction.",
      "Effective age applies to improvements and actual age to the land.",
      "They are the same measure expressed on different scales."
    ],
    correctChoice: 0,
    rationale: "Effective age reflects the condition the market perceives, which is why a well-maintained older improvement can have a lower effective age than its chronological age." },
  { source: { assignment: "assignment-12", section: "5.6" },
    prompt: "A property rents for $3,200 per month and comparable properties sell at a gross rent multiplier of 180. What value does the multiplier indicate?",
    choices: [
      "$576,000",
      "$57,600",
      "$480,000",
      "$38,400"
    ],
    correctChoice: 0,
    rationale: "$3,200 × 180 = $576,000. A gross rent multiplier is applied to monthly rent; the last figure is annual rent, which pairs with a gross income multiplier instead." },
  /* Assignment 13 — Taxation, investment, and real estate mathematics */
  { source: { assignment: "assignment-13", section: "1.6" },
    prompt: "What is a Mello-Roos charge?",
    choices: [
      "A special tax levied within a community facilities district to finance public facilities or services, appearing on the property tax bill.",
      "A county surcharge applied to properties sold within one year of purchase.",
      "A state levy on the gain realized from the sale of investment property.",
      "A homeowners association assessment collected by the county."
    ],
    correctChoice: 0,
    rationale: "It is a district-based special tax appearing on the tax bill, and it is a real cost item a buyer's budget frequently omits." },
  { source: { assignment: "assignment-13", section: "2.2" },
    prompt: "Which statement about documentary transfer tax is accurate?",
    choices: [
      "It is imposed on the transfer of an interest in real property and is generally computed on the consideration, with certain transfers exempt.",
      "It is imposed annually on the assessed value of the property.",
      "It is paid by the lender at the time the deed of trust is recorded.",
      "It applies only to commercial transactions."
    ],
    correctChoice: 0,
    rationale: "The tax attaches to the transfer, not to ownership over time, and exemptions exist for defined categories of transfer." },
  { source: { assignment: "assignment-13", section: "3.1" },
    prompt: "How is net operating income derived?",
    choices: [
      "Gross scheduled income, less vacancy and collection loss, plus other income, less operating expenses — before debt service.",
      "Gross income less debt service and income taxes.",
      "Gross income less operating expenses and depreciation.",
      "Cash flow before taxes plus principal reduction."
    ],
    correctChoice: 0,
    rationale: "Net operating income is calculated before debt service and before income tax effects, which is why it can be compared across properties with different financing." },
  { source: { assignment: "assignment-13", section: "3.3" },
    prompt: "A buyer invests $180,000 of his own funds and the property produces $14,400 in annual cash flow before taxes. What is the cash-on-cash return?",
    choices: [
      "8%",
      "12.5%",
      "0.8%",
      "80%"
    ],
    correctChoice: 0,
    rationale: "$14,400 ÷ $180,000 = 0.08. The distractors invert the ratio and misplace the decimal." },
  { source: { assignment: "assignment-13", section: "4.7" },
    prompt: "A client asks the licensee to prepare a ten-year projection showing the return on a rental property. What is the professional handling?",
    choices: [
      "Prepare the analysis with every assumption stated on the page, verify the inputs that are verifiable, and present the projection as assumptions being tested rather than as an expectation.",
      "Prepare it using the appreciation rate the local market has averaged, presented as the expected result.",
      "Decline, because projections are outside a licensee's scope in every case.",
      "Prepare it and omit the assumptions, so the client focuses on the conclusion."
    ],
    correctChoice: 0,
    rationale: "An analysis with visible assumptions survives being wrong. A projected appreciation rate presented as an expectation is a prediction stated as a plan." },
  { source: { assignment: "assignment-13", section: "5.6" },
    prompt: "A loan of $290,000 carries interest at 7.2% per year. What is the interest for one month?",
    choices: [
      "$1,740",
      "$2,088",
      "$20,880",
      "$1,450"
    ],
    correctChoice: 0,
    rationale: "$290,000 × 0.072 = $20,880 per year; ÷ 12 = $1,740. The distractors use the wrong divisor, the annual figure, and a 6% rate." },
  /* Assignment 14 — Fair housing, civil rights, and consumer protection */
  { source: { assignment: "assignment-14", section: "3.1" },
    prompt: "A licensee tells owners that a protected group is moving into the area and that values will fall, in order to obtain listings. What is this?",
    choices: [
      "Blockbusting, which is prohibited.",
      "Steering, which concerns where buyers are shown property.",
      "Redlining, which concerns the availability of credit by area.",
      "Puffery, which is permitted opinion."
    ],
    correctChoice: 0,
    rationale: "Inducing sales by representations about the entry of a protected group is blockbusting. It is neither steering nor redlining, and it is not opinion." },
  { source: { assignment: "assignment-14", section: "2.3" },
    prompt: "Which characteristic is protected under California law and is not among the federal protected classes for housing?",
    choices: [
      "Source of income.",
      "National origin.",
      "Religion.",
      "Familial status."
    ],
    correctChoice: 0,
    rationale: "California's list is broader than the federal baseline and includes source of income among other characteristics. The other three are federally protected." },
  { source: { assignment: "assignment-14", section: "4.4" },
    prompt: "A tenant with a disability asks to install a grab bar in the bathroom at her own expense. How is the request characterized?",
    choices: [
      "A reasonable modification — a physical change to the premises — analyzed on its own terms, including who bears the cost and what conditions may attach.",
      "A reasonable accommodation, because it changes a rule about alterations.",
      "A request the provider may decline because it alters the physical premises.",
      "A request that requires the tenant to purchase additional insurance in every case."
    ],
    correctChoice: 0,
    rationale: "A physical change is a modification; a change to a rule is an accommodation. The analysis of cost and conditions is fact-specific rather than an automatic denial." },
  { source: { assignment: "assignment-14", section: "4.5" },
    prompt: "What may a housing provider generally request when a disability and the disability-related need are not obvious?",
    choices: [
      "Reliable information that the person has a disability and that the requested accommodation is related to that disability.",
      "The applicant's medical records and diagnosis.",
      "A demonstration of an assistance animal's training.",
      "A physician's certification that the applicant cannot live independently."
    ],
    correctChoice: 0,
    rationale: "The inquiry is limited to whether a disability-related need exists. Diagnosis, records, and training demonstrations exceed it." },
  { source: { assignment: "assignment-14", section: "3.6" },
    prompt: "A brokerage restricts who sees a housing advertisement using a platform's audience tools. What is the correct analysis?",
    choices: [
      "Restricting the audience for a housing advertisement is a fair housing question, and using a platform's tool does not shift responsibility to the platform.",
      "It is a marketing decision outside the fair housing framework, since no one is refused housing.",
      "It is permissible provided the targeting parameters do not name a protected characteristic.",
      "It is permissible because the platform is responsible for its own compliance."
    ],
    correctChoice: 0,
    rationale: "The advertisement is the advertiser's, including who was permitted to see it, and a parameter that operates as a proxy is still exclusion." },
  { source: { assignment: "assignment-14", section: "6.3" },
    prompt: "A buyer asks the licensee what kind of people live in a neighborhood. What is the correct response?",
    choices: [
      "Decline to characterize the composition of the neighborhood and direct the buyer to public data sources and his own investigation.",
      "Answer accurately, since factual information about a neighborhood is not a violation.",
      "Answer only in general terms that avoid naming any specific group.",
      "Answer if the buyer is a member of the group he is asking about."
    ],
    correctChoice: 0,
    rationale: "Composition is not characterized, and the prohibition does not depend on accuracy, vagueness, or who is asking." },
  /* Assignment 15 — Leasing, property management, license law, and integrated transaction */
  { source: { assignment: "assignment-15", section: "1.5" },
    prompt: "Which describes the implied warranty of habitability in a residential tenancy?",
    choices: [
      "The landlord must maintain the premises in a condition fit for human occupancy, and the obligation cannot generally be waived by the tenant in advance.",
      "The tenant must accept the premises as they are on the date of possession.",
      "The obligation applies only where the lease expressly states it.",
      "The obligation ends once the tenant takes possession."
    ],
    correctChoice: 0,
    rationale: "Habitability is implied by law and continues through the tenancy. A general advance waiver by the tenant does not eliminate it." },
  { source: { assignment: "assignment-15", section: "1.7" },
    prompt: "A tenant is several months behind in rent. Which action by the landlord is prohibited?",
    choices: [
      "Changing the locks or shutting off utilities to force the tenant out.",
      "Serving the notice the statute requires for nonpayment.",
      "Filing an unlawful detainer action after the notice period expires.",
      "Applying the security deposit as the lease and the statute permit at the end of the tenancy."
    ],
    correctChoice: 0,
    rationale: "Self-help eviction is prohibited regardless of how far behind the tenant is. The lawful path runs through notice and the court process." },
  { source: { assignment: "assignment-15", section: "3.6" },
    prompt: "What must a trust account reconciliation compare?",
    choices: [
      "The bank balance, the control record, and the sum of the individual beneficiary ledgers, all as of the same date.",
      "The bank balance against the control record only.",
      "The total deposits against the total disbursements for the month.",
      "The broker's operating account against the trust account."
    ],
    correctChoice: 0,
    rationale: "A three-way reconciliation is what detects a negative individual ledger inside an account whose total happens to balance." },
  { source: { assignment: "assignment-15", section: "4.4" },
    prompt: "Which is most likely to produce discipline against a licensee?",
    choices: [
      "Mishandling trust funds, misrepresentation, or failure to supervise.",
      "Losing a listing to a competing brokerage.",
      "Advising a client to reject an offer that later proves to have been the best one received.",
      "Charging a commission above the local average."
    ],
    correctChoice: 0,
    rationale: "Trust fund handling, misrepresentation, and supervision failures are the recurring sources of discipline. Commissions are negotiable and a judgment that proves wrong is not itself a violation." },
  { source: { assignment: "assignment-15", section: "5.4" },
    prompt: "During a visual inspection the licensee sees a stain on a ceiling. What should the disclosure state?",
    choices: [
      "What was observed — the stain, its location, and that its cause and current status were not determined.",
      "That there was a prior roof leak that has since been repaired.",
      "That the stain is cosmetic and does not affect the property.",
      "Nothing, because a stain is not a defect."
    ],
    correctChoice: 0,
    rationale: "Observation is recorded; inference is not. The second and third options assert causes and conclusions the licensee has no basis to state." },
  { source: { assignment: "assignment-15", section: "5.9" },
    prompt: "What is the three-part test for whether a condition must be disclosed?",
    choices: [
      "Is it known, is it material, and has it been disclosed in a way the file can show.",
      "Is it visible, is it recent, and is it expensive to repair.",
      "Is it recorded, is it insured, and is it repairable.",
      "Did the buyer ask, did the seller answer, and was the answer written."
    ],
    correctChoice: 0,
    rationale: "Knowledge, materiality, and evidenced disclosure are the three parts. Visibility, cost, and whether the buyer thought to ask do not determine the obligation." },
  /* Integrative items — each answer requires material from more than one assignment */
  { source: { assignment: "assignment-05", section: "6.4" },
    crossReferences: [{ assignment: "assignment-03", section: "5.2" }],
    prompt: "A preliminary report on a condominium lists a recorded declaration and a notice of a pending action involving the association. Which item most affects the buyer's ability to close as planned?",
    choices: [
      "The pending action, because it can affect insurability and financing availability in addition to what it may cost.",
      "The declaration, because private restrictions must be removed before title can be insured.",
      "Neither, because both are ordinary items in a common interest development.",
      "Both equally, since every exception carries the same weight."
    ],
    correctChoice: 0,
    rationale: "A recorded declaration is expected and is not removed; a pending action affecting the association can reach insurability, lender program eligibility, and value at once." },
  { source: { assignment: "assignment-08", section: "2.6" },
    crossReferences: [{ assignment: "assignment-10", section: "3.6" }],
    prompt: "An email arrives from what appears to be the other agent's address, attaching a signed acceptance and new delivery instructions. What is the correct handling?",
    choices: [
      "Verify by voice through a number obtained independently before treating the acceptance as communicated or acting on the instructions.",
      "Treat the acceptance as communicated, since electronic delivery is valid and the address matches.",
      "Reply to the email asking the sender to confirm both items.",
      "Act on the acceptance but not on the delivery instructions."
    ],
    correctChoice: 0,
    rationale: "Electronic delivery is valid, which is exactly why a compromised or spoofed thread is dangerous. Verification must run through a channel the sender does not control." },
  { source: { assignment: "assignment-12", section: "6.7" },
    crossReferences: [{ assignment: "assignment-13", section: "6.5" }],
    prompt: "Two years after a sale, a former seller claims the licensee's pricing analysis was careless. What determines the outcome?",
    choices: [
      "What the file shows about the comparables as they existed then, the selection reasoning, the adjustments and their derivation, and the seller's own recorded pricing decision.",
      "Whether the property in fact sold quickly, which establishes that the price was too low.",
      "Whether the licensee can reproduce the analysis today from current data.",
      "Whether the licensee's opinion matched the appraisal obtained by the buyer's lender."
    ],
    correctChoice: 0,
    rationale: "A negligence claim is decided by what the file shows about the work. A fast sale proves nothing by itself, and a re-run query today cannot reproduce the analysis and may contradict it." },
  /* Assignment 14 section 2.8 - Government Code 12955, the California characteristics. */
  { source: { assignment: "assignment-14", section: "2.8" },
    prompt: "Which characteristic is protected in housing by Government Code \u00a7 12955 but has no counterpart in the federal Fair Housing Act's list?",
    choices: [
      "Source of income.",
      "Familial status.",
      "National origin.",
      "Religion."
    ],
    correctChoice: 0,
    rationale: "Familial status, national origin and religion are federally protected. Source of income is one of the California additions, along with gender identity and expression, sexual orientation, marital status, ancestry, veteran or military status, and genetic information." },
  { source: { assignment: "assignment-09", section: "5.7" },
    crossReferences: [{ assignment: "assignment-06", section: "6.2" }],
    prompt: "Why does the timing of delivery of the preliminary report and the association documents matter so much to a buyer?",
    choices: [
      "The buyer's review period is what remains after delivery, so late delivery consumes the time in which he could still investigate and respond.",
      "Late delivery invalidates the documents.",
      "The seller must extend the closing date by the length of any delay.",
      "The title company will not issue a policy if delivery was late."
    ],
    correctChoice: 0,
    rationale: "Delivery starts the clock and the review time is the remainder. Nothing about lateness invalidates the documents or automatically extends the transaction." },
  { source: { assignment: "assignment-11", section: "5.6" },
    crossReferences: [{ assignment: "assignment-08", section: "5.3" }],
    prompt: "A buyer whose loan contingency has been removed opens a store credit account to furnish the new house. What is the risk?",
    choices: [
      "The lender may re-verify credit before funding, the new debt can affect qualification, and the deposit is exposed because the contingency is gone.",
      "None, because approval is final once the contingency is removed.",
      "None, because consumer credit is not considered in mortgage underwriting.",
      "The risk is limited to a delay in the closing date."
    ],
    correctChoice: 0,
    rationale: "Approval is not final until funding, and removing the contingency removed the protection. This is why the instruction is to talk to the lender before any financial move." },
  { source: { assignment: "assignment-07", section: "4.6" },
    crossReferences: [{ assignment: "assignment-01", section: "6.2" }],
    prompt: "A file contains a purchase agreement confirming the same brokerage on both sides and no consent from either party. How should this finding be ranked against a disclosure delivered three days late?",
    choices: [
      "More serious, because it describes duties actually owed being breached rather than a document arriving late.",
      "Less serious, because the confirmation itself is accurate and complete.",
      "Equally serious, because both are documentation defects.",
      "Less serious, because the parties closed without objecting."
    ],
    correctChoice: 0,
    rationale: "An undisclosed dual agency is different in kind from a timing defect. That the parties did not object establishes only that they did not know." },
  { source: { assignment: "assignment-02", section: "6.4" },
    crossReferences: [{ assignment: "assignment-14", section: "3.3" }],
    prompt: "A listing photograph shows a chandelier the seller intends to take. What is the correct handling?",
    choices: [
      "State the exclusion where the photograph appears, or replace the fixture before marketing, because the advertisement is a representation about what is offered.",
      "Nothing, because the purchase agreement will control what conveys.",
      "Nothing, because photographs are illustrative rather than representational.",
      "Remove the photograph after an offer is accepted."
    ],
    correctChoice: 0,
    rationale: "Marketing consistency is an advertising obligation, not only a fixture question. A buyer who saw the item in the listing has a grievance whatever the fixture analysis concludes." },
  { source: { assignment: "assignment-10", section: "6.2" },
    crossReferences: [{ assignment: "assignment-09", section: "3.2" }],
    prompt: "A closed file contains a deed with no date of delivery and an escrow instruction amendment signed by only one party. Which is the more serious finding?",
    choices: [
      "The undated delivery, because delivery is what transferred title and the file cannot show when it occurred.",
      "The one-sided amendment, because escrow cannot act on it.",
      "Neither, because the transaction closed and title was insured.",
      "Both equally, because each is a missing signature or date."
    ],
    correctChoice: 0,
    rationale: "Delivery is the operative transfer event, so a file that cannot evidence it has a gap at the point that matters most. A one-sided amendment simply was not effective, which is a smaller and more visible problem." },
  { source: { assignment: "assignment-15", section: "6.6" },
    crossReferences: [{ assignment: "assignment-12", section: "6.2" }],
    prompt: "A client asks a licensee for a written opinion of value to submit in a court proceeding. What is the correct first step?",
    choices: [
      "Establish what the opinion will be used for and by whom, because the intended use determines whether the licensee may accept the assignment at all.",
      "Prepare the analysis using the same method as a listing presentation.",
      "Prepare it and label it clearly as an appraisal for litigation purposes.",
      "Decline, because a licensee may never express an opinion of value in writing."
    ],
    correctChoice: 0,
    rationale: "The intended use governs. Labeling a licensee's opinion an appraisal is precisely what may not be done, and licensees do prepare written opinions for appropriate purposes." },
];

export default {
  courseId: "ca-real-estate-principles-45",
  forms: { A: formA, B: formB }
};
