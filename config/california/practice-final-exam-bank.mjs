/**
 * California Real Estate Practice (45 hours) — secure final examination bank.
 *
 * NOT PUBLIC. Imported by Netlify functions only; site/build.sh fails the build if any
 * file matching /final-exam-bank|answer-key/ reaches `dist`. The correct answer never
 * leaves the server: publicAssessment() strips it and scoring happens server-side.
 *
 * Structure required by RE 303 p.4 and recorded in database/004_california_prelicense.sql:
 *   two forms, 100 questions each, 60% passing, one retake on DIFFERENT questions.
 *
 * Coverage rule: six or seven items per lesson assignment plus integrative items that
 * cross assignments. Every item carries `source`, naming the assignment and the
 * subsection where the answer is found; scripts/audit-california-content.mjs resolves
 * every reference against the lesson's actual headings and fails if one does not exist.
 *
 * Authoring standard: the correct answer is written first and permuted deterministically
 * at serve time. Every distractor states a specifically wrong proposition.
 *
 * Course version 1.0 — not approved; no California credit is available.
 */

const formA = [
  /* Assignment 01 — California practice standards and the regulated professional */
  { source: { assignment: "assignment-01", section: "1.6" },
    prompt: "Which activity is outside what a California real estate license authorizes?",
    choices: [
      "Advising a client on how title should be taken and what the tax consequences would be.",
      "Preparing a comparative market analysis to support a listing decision.",
      "Completing an approved form by filling in the terms the parties negotiated.",
      "Presenting an offer and explaining the deadlines the agreement sets."
    ],
    correctChoice: 0,
    rationale: "Vesting and tax consequences belong to counsel and a tax advisor. Market analysis, approved-form completion, and explaining the document's own procedure are all within scope." },
  { source: { assignment: "assignment-01", section: "2.2" },
    prompt: "A broker assigns advertising approval to an office manager who holds a salesperson license. What is the defect?",
    choices: [
      "A supervisory function has been delegated to someone without supervisory authority, and the duty remains the broker's regardless.",
      "None, provided the delegation is recorded in the office policy manual.",
      "None, because advertising approval is an administrative rather than a supervisory function.",
      "The manager becomes personally responsible for every advertisement approved."
    ],
    correctChoice: 0,
    rationale: "Delegation does not transfer responsibility, and a supervisory function performed by a person without supervisory authority is a structural defect rather than a staffing arrangement." },
  { source: { assignment: "assignment-01", section: "5.1" },
    prompt: "Which three categories must a consumer be able to tell apart in what a licensee says?",
    choices: [
      "Fact, estimate, and assurance — and an assurance is never statable.",
      "Advice, opinion, and instruction.",
      "Disclosure, negotiation, and marketing.",
      "Written, oral, and implied statements."
    ],
    correctChoice: 0,
    rationale: "Facts are statable, estimates are statable when identified as estimates, and assurances about approval, appraisal, or value are not statable at any confidence level." },
  { source: { assignment: "assignment-01", section: "6.3" },
    prompt: "Why is evidence of delivery, rather than a signature, the thing a transaction file must carry?",
    choices: [
      "Rights and deadlines run from receipt, so a file that cannot show when a document reached the party cannot show the timing was honored.",
      "Signatures can be forged, while delivery records cannot.",
      "The regulations require electronic delivery for all transaction documents.",
      "A signature is only valid if it is accompanied by a delivery receipt."
    ],
    correctChoice: 0,
    rationale: "A signature proves execution; delivery is what starts the clock. That gap is where most disclosure findings live." },
  { source: { assignment: "assignment-01", section: "6.5" },
    prompt: "A closed file is found to contain an undated contingency removal. Which response is prohibited?",
    choices: [
      "Entering a date now so the file appears complete.",
      "Recording the finding and escalating it to the broker.",
      "Contacting the party who signed to ask whether a dated copy exists.",
      "Adding a memorandum dated today describing what the file shows."
    ],
    correctChoice: 0,
    rationale: "A documented gap is survivable; a document altered to say something it did not say is falsification. The other three are all proper responses." },
  { source: { assignment: "assignment-01", section: "4.4" },
    prompt: "A brokerage policy prohibits something the law permits. What is a licensee's obligation?",
    choices: [
      "Follow the policy — a brokerage may lawfully hold its licensees to a stricter standard than the law requires.",
      "Follow the law, since a private policy cannot restrict lawful activity.",
      "Follow whichever standard the client prefers.",
      "Follow the policy only where it is repeated in the licensee's independent contractor agreement."
    ],
    correctChoice: 0,
    rationale: "Stricter than the law is a legitimate brokerage choice, and a prohibition the licensee did not know about is one he will violate — which is why the policy set is read before the first transaction." },
  /* Assignment 02 — Building a lawful real estate practice */
  { source: { assignment: "assignment-02", section: "2.3" },
    prompt: "A visitor writes a phone number on an open house sign-in sheet that says nothing about future contact. May the licensee add the number to a marketing text campaign?",
    choices: [
      "No — consent is defined by what the person was actually told when the information was collected.",
      "Yes, because providing the number at a marketing event implies consent.",
      "Yes, provided every message includes an opt-out instruction.",
      "Yes, provided the first message identifies the licensee and the brokerage."
    ],
    correctChoice: 0,
    rationale: "An opt-out mechanism is necessary but not sufficient — it does not create the consent required to send the first message, and identification addresses a different requirement." },
  { source: { assignment: "assignment-02", section: "4.2" },
    prompt: "Two brokers agree at a caravan that neither will show properties listed by discount brokerages. What is this?",
    choices: [
      "A group boycott, which is among the most serious conduct in this area and does not require a written agreement.",
      "A permissible business decision, since each brokerage sets its own showing practices.",
      "A conflict of interest requiring disclosure to affected clients.",
      "A steering violation under fair housing law."
    ],
    correctChoice: 0,
    rationale: "Concerted refusal to deal is a group boycott. An agreement can be inferred from a conversation followed by a course of conduct, and the participants who said nothing are participants." },
  { source: { assignment: "assignment-02", section: "4.6" },
    prompt: "A colleague at a professional event says, 'Nobody around here should be going below a certain rate.' What should the licensee do?",
    choices: [
      "Say aloud that he sets his own fees independently and does not discuss them with other firms, leave the conversation, and write a dated note that day.",
      "Change the subject so the conversation does not continue.",
      "Say nothing at the time and mention it privately to the speaker afterward.",
      "Remain and listen, since he did not initiate the topic and has not agreed to anything."
    ],
    correctChoice: 0,
    rationale: "Silence in the room reads as agreement, and the contemporaneous note is what distinguishes a witness from a participant years later. Changing the subject and private follow-up leave no record." },
  { source: { assignment: "assignment-02", section: "3.2" },
    prompt: "Which is the most common advertising identification defect?",
    choices: [
      "Personal branding and a mobile number with no brokerage named, so the consumer cannot tell which supervising brokerage stands behind the advertisement.",
      "Using a photograph of the licensee rather than of the property.",
      "Failing to state the property's list price.",
      "Advertising a property before the seller has signed the disclosure package."
    ],
    correctChoice: 0,
    rationale: "Identification exists so the consumer can tell there is a supervising brokerage and which one. Photographs, price, and disclosure timing are separate questions." },
  { source: { assignment: "assignment-02", section: "5.2" },
    prompt: "A licensee receives an email from an address closely resembling escrow's, giving new wire instructions two days before closing. What is the correct step?",
    choices: [
      "Verify by voice using a number the file already held, obtained independently of the message.",
      "Reply to the email and ask escrow to confirm the change.",
      "Forward the email to the client with a warning to be careful.",
      "Send a small test wire and confirm receipt before sending the balance."
    ],
    correctChoice: 0,
    rationale: "Verification must run through a channel the attacker does not control. Replying, forwarding, and test wires all remain inside the compromised channel." },
  { source: { assignment: "assignment-02", section: "6.7" },
    prompt: "Why is the close-out routine performed within days of closing rather than later?",
    choices: [
      "Because a missing document is usually still obtainable in week one and usually is not in year two.",
      "Because the brokerage's retention period runs from the date of the audit.",
      "Because escrow destroys its records shortly after closing.",
      "Because the file cannot be retained until it has been audited."
    ],
    correctChoice: 0,
    rationale: "The obtainable-now test is the entire argument for the routine: the other participants still answer the phone, and the facts are still fresh." },
  /* Assignment 03 — Agency disclosure and fiduciary performance */
  { source: { assignment: "assignment-03", section: "2.1" },
    prompt: "What are the three steps of the California agency disclosure sequence?",
    choices: [
      "Disclose, elect, confirm.",
      "Advise, agree, record.",
      "Present, negotiate, close.",
      "Notify, consent, deliver."
    ],
    correctChoice: 0,
    rationale: "Disclosure comes first, the relationship is elected in the agreement, and the confirmation appears in or with the purchase agreement — and the dates must run in that order." },
  { source: { assignment: "assignment-03", section: "1.6" },
    prompt: "A listing agent at an open house tells an unrepresented visitor what the seller would probably accept and suggests an offer strategy. What has happened?",
    choices: [
      "The agent has given advice against his own principal's interest and may have created a relationship with the visitor by conduct.",
      "Nothing, because the visitor is unrepresented and no agreement was signed.",
      "The visitor has become a customer, to whom only honesty is owed.",
      "The agent has satisfied his duty of fair dealing to a non-client."
    ],
    correctChoice: 0,
    rationale: "Disclosing what the seller would take is confidential negotiating information given to the party negotiating against the seller, and agency can arise from conduct without any signed agreement." },
  { source: { assignment: "assignment-03", section: "3.6" },
    prompt: "Which duty is breached most often, and why does it produce most claims against licensees?",
    choices: [
      "Reasonable care — it can be breached without any dishonesty, by ordinary pressure applied to an ordinary practice.",
      "Loyalty — because most licensees have undisclosed interests.",
      "Confidentiality — because most licensees discuss transactions socially.",
      "Accounting — because most licensees handle trust funds."
    ],
    correctChoice: 0,
    rationale: "Fraud requires intent and is comparatively rare. Negligence requires only work below the standard of a competent licensee, which is what a missed deadline or an unverified number produces." },
  { source: { assignment: "assignment-03", section: "4.6" },
    prompt: "Two salespersons in the same brokerage represent the buyer and the seller in one transaction, and have never discussed the file. What is the position?",
    choices: [
      "A dual agency exists, because the agency belongs to the brokerage rather than to the individual salesperson.",
      "No dual agency, because the two salespersons kept the sides separate.",
      "No dual agency, because they work from different offices of the brokerage.",
      "A dual agency exists only if the two salespersons share compensation."
    ],
    correctChoice: 0,
    rationale: "Agency belongs to the brokerage. Internal separation is a control on confidential information, not something that prevents the dual agency from existing." },
  { source: { assignment: "assignment-03", section: "5.1" },
    prompt: "A buyer's agent is paid from the seller's side. What must the file show for the arrangement to be internally consistent?",
    choices: [
      "A confirmation of buyer agency together with disclosure of the compensation arrangement — payment does not determine representation.",
      "A dual agency consent signed by both parties.",
      "A written waiver by the buyer of his right to independent representation.",
      "An amendment converting the buyer's agent to a subagent of the seller."
    ],
    correctChoice: 0,
    rationale: "A file showing seller-side compensation and confirmed buyer agency is consistent, not contradictory. What must still happen is disclosure of the arrangement, since the client cannot evaluate advice without knowing the adviser's economics." },
  { source: { assignment: "assignment-03", section: "5.3" },
    prompt: "Which approach satisfies the obligation to disclose a conflict?",
    choices: [
      "Disclosure delivered while the client can still act on it, in a form he can evaluate.",
      "Telling the client he is free to choose a different provider.",
      "Disclosing the conflict if the client asks about it.",
      "Assuring the client that the interest will not influence the advice."
    ],
    correctChoice: 0,
    rationale: "Information arriving after the decision has no value, the client does not know to ask, and a private intention is not something the client can evaluate." },
  { source: { assignment: "assignment-04", section: "2.3" },
    prompt: "Why must a listing agreement's term be definite?",
    choices: [
      "So both parties know when the engagement ends, which determines when protection and compensation provisions operate.",
      "Because the listing service will not accept an entry without one.",
      "Because an indefinite term converts the listing into an open listing by operation of law.",
      "Because the seller may otherwise cancel at will without consequence."
    ],
    correctChoice: 0,
    rationale: "A definite termination date is what makes expiration, protection, and compensation computable. The other statements assert consequences that do not follow from indefiniteness itself." },
  { source: { assignment: "assignment-04", section: "1.2" },
    prompt: "A caller says she inherited a house and wants to list it. What must be established before the listing proceeds?",
    choices: [
      "How title is currently held and who has authority to convey, from the documents rather than from her description.",
      "Whether she intends to buy a replacement property.",
      "Whether the property has been appraised in the last year.",
      "Whether any siblings agree with the asking price."
    ],
    correctChoice: 0,
    rationale: "Authority is established from documents. Whether the property passed by trust, by will requiring administration, or by operation of law determines who must sign, and it is expensive to discover during escrow." },
  { source: { assignment: "assignment-04", section: "4.1" },
    prompt: "A seller wants to defer the disclosure paperwork until an offer arrives. How should the licensee respond?",
    choices: [
      "Explain that disclosure runs on its own schedule because the buyer's rights depend on when it is delivered, and begin it now while there is no deadline pressure.",
      "Agree, since disclosures are delivered with the purchase agreement in any event.",
      "Agree, provided the seller signs an acknowledgment that he chose to defer.",
      "Refuse the listing, since deferral makes the transaction impossible."
    ],
    correctChoice: 0,
    rationale: "Price, showing schedule, and cancellation terms are negotiable; disclosure timing is not. Deferring compresses the buyer's review period at exactly the wrong moment." },
  { source: { assignment: "assignment-04", section: "4.4" },
    prompt: "How should an item on a seller's disclosure be handled when the seller genuinely does not know the answer?",
    choices: [
      "Answer 'unknown', which is an honest and available answer — a blank is not.",
      "Leave it blank, since the seller cannot assert what he does not know.",
      "Answer 'no', since the seller has no knowledge of a problem.",
      "Have the licensee answer it from his own observation."
    ],
    correctChoice: 0,
    rationale: "A blank is ambiguous about whether the item was addressed, 'no' asserts knowledge the seller does not have, and the licensee completing the seller's disclosure misattributes the statement." },
  { source: { assignment: "assignment-04", section: "3.6" },
    prompt: "A seller insists on listing above the licensee's recommendation. What is the correct handling?",
    choices: [
      "Price it at the seller's number, work it professionally, document the recommendation and the seller's decision, and agree in advance on a review date.",
      "Decline the listing, since marketing a price the licensee cannot support is a misrepresentation.",
      "Take the listing and adopt the seller's number as the licensee's own professional opinion.",
      "Take the listing at the seller's price and reduce marketing effort until he agrees to a reduction."
    ],
    correctChoice: 0,
    rationale: "Price is the seller's decision and the recommendation is the licensee's obligation. Adopting the number as his own opinion is a representation he cannot support, and reduced effort is a reasonable-care breach." },
  { source: { assignment: "assignment-04", section: "6.1" },
    prompt: "A seller says he wants to 'cancel' the listing. What is the licensee's first task?",
    choices: [
      "Determine which of expiration, cancellation, and withdrawal he actually means, since the three operate differently.",
      "Prepare a release for the seller's signature.",
      "Remove the property from the listing service immediately.",
      "Tell the seller the agreement cannot be ended before its term expires."
    ],
    correctChoice: 0,
    rationale: "The three are frequently conflated and a request often means the marketing should pause rather than the engagement end. Whether to release the seller is a broker-level decision in any case." },
  { source: { assignment: "assignment-05", section: "3.2" },
    prompt: "Why do closed sales dominate a comparative market analysis?",
    choices: [
      "They record what buyers actually paid after negotiation, which is the only category that proves a completed transaction.",
      "They are the only category the listing service makes available to licensees.",
      "They are the most recent data in every market.",
      "They require no adjustment because the transactions are complete."
    ],
    correctChoice: 0,
    rationale: "Active listings show what sellers ask and pending sales show what buyers agreed to but have not completed. Only closed sales prove what was paid, and they still require adjustment." },
  { source: { assignment: "assignment-05", section: "2.1" },
    prompt: "A comparable sale has one more bathroom than the subject. How is the adjustment applied?",
    choices: [
      "Downward, to the comparable's sale price, because the adjustment is always made to the comparable rather than to the subject.",
      "Upward, to the comparable's sale price, to reflect the additional bathroom.",
      "Downward, to the subject's indicated value.",
      "The comparable is excluded, since a difference in bathroom count makes it unusable."
    ],
    correctChoice: 0,
    rationale: "Adjustments run to the comparable: superior features are adjusted down, inferior features up. The subject is never adjusted, and one differing feature does not disqualify a comparable." },
  { source: { assignment: "assignment-05", section: "2.5" },
    prompt: "A seller says his kitchen remodel cost $85,000 and should be added to the price. What is the correct response?",
    choices: [
      "Explain that the market decides what a component contributes, and that contribution and cost are frequently different numbers.",
      "Add the full cost, since improvements are recoverable at sale.",
      "Add half the cost, which is the customary recovery rate.",
      "Exclude the remodel entirely, since improvements do not affect market value."
    ],
    correctChoice: 0,
    rationale: "Contribution is what the market pays for the component, which may be more or less than its cost. There is no customary fraction, and improvements plainly can affect value." },
  { source: { assignment: "assignment-05", section: "3.6" },
    prompt: "Why can a grid built on recorded sale prices overstate value in a market where seller credits are common?",
    choices: [
      "A recorded price that carried a large credit overstates the economic price the parties actually agreed to.",
      "Recorded prices exclude the buyer's closing costs, which understates the transaction.",
      "Credits are added to the recorded price by the county recorder.",
      "Credits affect only the buyer's loan amount and not the price."
    ],
    correctChoice: 0,
    rationale: "A credit means the buyer paid a higher nominal price in exchange for cash back. Comparing nominal numbers in a market that trades in net ones is a systematic overstatement, and it is invisible on the page." },
  { source: { assignment: "assignment-05", section: "6.6" },
    prompt: "Two years after a closing a seller alleges the pricing analysis was careless. What answers the claim?",
    choices: [
      "The comparables as they existed then, the selection reasoning, the derivation of the adjustments, and the record of what the seller was shown and decided.",
      "A fresh listing service query run today showing the property was priced correctly.",
      "The licensee's recollection of the pricing conversation.",
      "The fact that the property sold quickly, which establishes the price was right."
    ],
    correctChoice: 0,
    rationale: "A re-run query returns different data and can contradict the original analysis. A fast sale proves nothing by itself, and recollection is the interested party's, two years old." },
  { source: { assignment: "assignment-05", section: "4.6" },
    prompt: "A seller's net sheet comes back showing insufficient proceeds to pay off the existing loans. What is the licensee's obligation?",
    choices: [
      "Tell the seller now, route the credit, tax, and deficiency questions to the appropriate professionals, and promise no outcome that depends on a lienholder.",
      "Recommend a short sale and explain the likely tax treatment.",
      "Assure the seller the lienholder will approve, since the alternative costs it more.",
      "Proceed with the listing and address the shortfall if an offer arrives."
    ],
    correctChoice: 0,
    rationale: "The bad news arrived early, which is the net sheet's value. Tax and deficiency consequences are not the licensee's to explain, and whether a lienholder approves is its decision." },
  /* Assignment 06 — Marketing, advertising, and fair access */
  { source: { assignment: "assignment-06", section: "1.3" },
    prompt: "Photographs of a listing were taken in spring; the property is being marketed in autumn and the landscaping has died. What is required?",
    choices: [
      "Update the images, because truthfulness is measured against the property as it is now.",
      "Nothing, provided the photographs were accurate when taken.",
      "Nothing, provided the listing states when the photographs were taken.",
      "Nothing, because landscaping is not a material feature."
    ],
    correctChoice: 0,
    rationale: "Images that no longer show the property's condition create a false impression regardless of when they were accurate, and a date stamp does not cure it." },
  { source: { assignment: "assignment-06", section: "2.5" },
    prompt: "A brokerage uses a platform's audience tools to restrict who sees a housing advertisement. How is that analyzed?",
    choices: [
      "The targeting is part of the advertisement and is a fair housing question; using the platform's tool does not move the responsibility to the platform.",
      "It is a media-buying decision outside the fair housing framework.",
      "It is permissible as long as no protected characteristic is named in the parameters.",
      "It is the platform's compliance obligation, not the advertiser's."
    ],
    correctChoice: 0,
    rationale: "Who was permitted to see the advertisement is part of the advertisement. A parameter that operates as a proxy is exclusion even though no characteristic is named." },
  { source: { assignment: "assignment-06", section: "3.6" },
    prompt: "A listing includes an equal housing opportunity statement but the copy describes the neighborhood as 'perfect for young professionals.' What is the effect of the statement?",
    choices: [
      "None — the disclaimer does not cure copy that sorts people, and the copy must be rewritten.",
      "The statement cures the copy by declaring the brokerage's non-discriminatory intent.",
      "The statement is sufficient if it appears in the same size type as the copy.",
      "The statement shifts the analysis to whether anyone was actually excluded."
    ],
    correctChoice: 0,
    rationale: "The equal housing statement is required in its own right and is not a cure. Copy conveying a preference about who a property is for is the violation, whatever accompanies it." },
  { source: { assignment: "assignment-06", section: "3.7" },
    prompt: "A seller instructs his agent not to advertise the property in a particular publication because of the readership it reaches. What must the agent do?",
    choices: [
      "Refuse the instruction, explain why, and escalate to the broker — an instruction that restricts who learns of the property on a protected basis is unlawful.",
      "Follow the instruction and record that it came from the seller.",
      "Follow it informally by not placing the advertisement without discussing why.",
      "Withdraw from the listing without explaining the reason."
    ],
    correctChoice: 0,
    rationale: "Documenting an unlawful instruction does not transfer responsibility, informal compliance achieves the same exclusion, and a silent withdrawal leaves the seller free to repeat it." },
  { source: { assignment: "assignment-06", section: "6.3" },
    prompt: "What must an advertising archive capture?",
    choices: [
      "The advertisement as it was actually published, with its date, because platforms crop, edit, expire, and delete.",
      "The draft submitted for approval, which shows what the brokerage authorized.",
      "The invoice establishing where and when the advertisement ran.",
      "A description of the advertisement's content prepared by the licensee."
    ],
    correctChoice: 0,
    rationale: "The archive answers what the consumer saw. A draft shows what was intended, and neither an invoice nor a description reproduces the published item." },
  { source: { assignment: "assignment-06", section: "4.2" },
    prompt: "An applicant states she has an assistance animal and the property has a no-pets policy. What is the correct treatment?",
    choices: [
      "The animal is not a pet for this purpose; waiving the policy is a reasonable accommodation and the ordinary pet deposit and pet rent do not attach.",
      "The policy applies, since it is applied uniformly to every applicant.",
      "The animal is permitted only after the applicant provides a diagnosis.",
      "The animal is permitted subject to the standard pet deposit."
    ],
    correctChoice: 0,
    rationale: "An assistance animal is not a pet, so pet fees do not attach — though the tenant remains responsible for damage the animal actually causes. The diagnosis may not be demanded." },
  /* Assignment 07 — Buyer representation and property selection */
  { source: { assignment: "assignment-07", section: "3.1" },
    prompt: "Which three things must a licensee keep distinct when assessing a buyer's readiness?",
    choices: [
      "What a lender will lend, what the buyer can carry, and what cash he will actually have at closing.",
      "The preapproval amount, the appraised value, and the list price.",
      "The down payment, the loan amount, and the purchase price.",
      "The buyer's income, his credit score, and his debt."
    ],
    correctChoice: 0,
    rationale: "The three numbers answer different questions, and a buyer approved for an amount he cannot comfortably carry, or without the cash to close, is a transaction that fails during escrow." },
  { source: { assignment: "assignment-07", section: "4.1" },
    prompt: "What must drive the properties shown to a buyer?",
    choices: [
      "The buyer's own stated criteria, documented, so the search can be shown to have been built on nothing else.",
      "The licensee's judgment about where the buyer would be comfortable.",
      "The areas where the brokerage holds the most listings.",
      "The neighborhoods with the strongest recent appreciation."
    ],
    correctChoice: 0,
    rationale: "A search documented against the buyer's stated criteria is the evidence that it was not built on anything else. Judgments about comfort are how steering happens with a benign motive." },
  { source: { assignment: "assignment-07", section: "5.3" },
    prompt: "A general inspection report recommends further evaluation of a foundation by a qualified professional. What is the licensee's obligation?",
    choices: [
      "Recommend the further evaluation in writing, record that it was recommended, and record the buyer's response if he declines.",
      "Summarize the finding for the buyer and let him decide without a written recommendation.",
      "Obtain the evaluation himself so the buyer has the answer before the deadline.",
      "Advise whether the item is serious enough to warrant the additional cost."
    ],
    correctChoice: 0,
    rationale: "A general inspection that recommends further evaluation has said it did not answer the question. The licensee recommends and records; he does not assess the seriousness of a building system." },
  { source: { assignment: "assignment-07", section: "5.6" },
    prompt: "A buyer decides to waive his investigation contingency entirely. What is the correct handling?",
    choices: [
      "Explain the consequence, document the recommendation that preceded the decision and the buyer's response, and proceed on his instruction.",
      "Refuse to submit the offer, since waiving investigation is against the buyer's interest.",
      "Submit the offer and note that the property's condition is now the seller's responsibility.",
      "Submit the offer and obtain an indemnity from the buyer in the brokerage's favor."
    ],
    correctChoice: 0,
    rationale: "The decision is the buyer's and the record is the licensee's. The property's condition is unchanged by the waiver, and an indemnity is not what the file needs." },
  { source: { assignment: "assignment-07", section: "6.1" },
    prompt: "A buyer asks his agent what to offer. What is within the licensee's role?",
    choices: [
      "Supply the analysis — what the data supports, what the competition looks like, what each term costs — while the number and the terms remain the buyer's decision.",
      "State the number the buyer should offer, since that is the advice he is paying for.",
      "Decline to discuss price, since offer terms are the client's alone.",
      "Recommend the list price, which avoids advising on value."
    ],
    correctChoice: 0,
    rationale: "Terms are the buyer's; the analysis and the advice are the licensee's. Neither substituting his judgment nor withholding the analysis serves the client." },
  { source: { assignment: "assignment-07", section: "3.6" },
    prompt: "A buyer under contract mentions he has just financed new furniture. What should the licensee do?",
    choices: [
      "Tell him to contact his lender immediately, confirm that he did, and record it — without assessing whether the new debt matters.",
      "Reassure him that furniture purchases are too small to affect underwriting.",
      "Advise him to return the furniture before the lender re-pulls credit.",
      "Notify the lender directly, since the licensee learned of it first."
    ],
    correctChoice: 0,
    rationale: "Whether a change matters is the lender's determination. Reassurance and advice about how to handle it are both outside the licensee's role." },
  /* Assignment 08 — Purchase agreements, counteroffers, and contingencies */
  { source: { assignment: "assignment-08", section: "2.1" },
    prompt: "An offer expires Wednesday at 5:00 p.m. The seller signs it Wednesday at 4:00 p.m. but the signed copy is not transmitted until Thursday. What is the position?",
    choices: [
      "No contract formed on those facts, because acceptance must be communicated within the time the offer allows.",
      "A contract formed Wednesday at 4:00 p.m., when the seller signed.",
      "A contract formed Thursday, because transmission relates back to the signature.",
      "A contract formed if the buyer had not revoked before Thursday."
    ],
    correctChoice: 0,
    rationale: "Formation turns on communication of acceptance, not on the signature. A signed acceptance that has not been transmitted has not been communicated." },
  { source: { assignment: "assignment-08", section: "1.6" },
    prompt: "The parties assume the seller will repair everything on the inspection report. What does the purchase agreement actually provide?",
    choices: [
      "Nothing of the kind unless a repair term was negotiated and written — an inspection contingency is a right to investigate and respond.",
      "That the seller must repair all health and safety items identified.",
      "That the seller must repair items costing less than a threshold amount.",
      "That the buyer may cancel unless every item is repaired."
    ],
    correctChoice: 0,
    rationale: "The contingency gives the buyer the ability to investigate and to respond within his period. Repair obligations exist only where they were negotiated." },
  { source: { assignment: "assignment-08", section: "3.3" },
    prompt: "A buyer's agent asks the listing agent what the competing offers are. What may the listing agent say?",
    choices: [
      "Only what the seller has authorized him to disclose — the terms of competing offers are the seller's confidential negotiating information.",
      "Anything factual, since a true statement cannot be a misrepresentation.",
      "Nothing at all, since any statement about competing offers is prohibited.",
      "That there are multiple offers, but he may not say how many."
    ],
    correctChoice: 0,
    rationale: "Disclosure of the seller's negotiating position requires the seller's authorization. Truthfulness does not remove the confidentiality duty, and an authorized disclosure is permitted." },
  { source: { assignment: "assignment-08", section: "4.3" },
    prompt: "How does a residential contingency generally cease to protect a buyer?",
    choices: [
      "By an active removal or waiver delivered in the manner and within the time the agreement specifies.",
      "Automatically when the contingency period expires.",
      "When the buyer completes the inspection the contingency contemplated.",
      "When escrow notifies the parties that the period has run."
    ],
    correctChoice: 0,
    rationale: "California residential practice generally requires an active removal, delivered as the agreement specifies. Completion of an inspection and an escrow notification do not remove it." },
  { source: { assignment: "assignment-08", section: "5.2" },
    prompt: "Which question must be answered before a transaction calendar can be built?",
    choices: [
      "What event starts each period, whether days are counted as calendar or business days, and what happens when a deadline falls on a weekend or holiday.",
      "Which party's agent is responsible for tracking each deadline.",
      "Whether escrow will send reminders before each deadline.",
      "Whether the lender's timeline permits the stated closing date."
    ],
    correctChoice: 0,
    rationale: "Day zero, the counting convention, and the weekend rule are what make the dates computable, and assuming acceptance day is day one shifts every deadline in the file." },
  { source: { assignment: "assignment-08", section: "6.2" },
    prompt: "Buyer and seller both claim the deposit after a cancellation. What determines the outcome?",
    choices: [
      "The contract's own procedure, and where the parties do not agree, a legal determination — not the licensees' assessment of who was right.",
      "The listing broker's decision, since the deposit is in the brokerage trust account.",
      "Escrow's determination, applied neutrally to both claims.",
      "Return to the buyer, since the funds originated with him."
    ],
    correctChoice: 0,
    rationale: "Escrow's neutrality prevents it from deciding, and the disposition is a contractual and legal question that goes to the broker and counsel." },
  /* Assignment 09 — Disclosures and property-condition risk */
  { source: { assignment: "assignment-09", section: "1.2" },
    prompt: "How is materiality measured for a seller's disclosure obligation?",
    choices: [
      "By whether a reasonable buyer would consider the fact important to his decision.",
      "By whether the condition currently causes a problem.",
      "By the cost of repairing the condition.",
      "By whether the seller considers the fact significant."
    ],
    correctChoice: 0,
    rationale: "The standard is the effect on a reasonable buyer's decision. Frequency, current effect, cost, and the seller's own view do not set it." },
  { source: { assignment: "assignment-09", section: "1.3" },
    prompt: "Who completes the seller's disclosure, and why does it matter?",
    choices: [
      "The seller, because the document is offered to the buyer as the seller's own statement of what he knows.",
      "The licensee, using the seller's answers, so the document is legible and complete.",
      "Either party, provided the seller signs it afterward.",
      "The transaction coordinator, from the file."
    ],
    correctChoice: 0,
    rationale: "A licensee completing it misattributes the statement — the buyer receives it as the seller's account of his own knowledge." },
  { source: { assignment: "assignment-09", section: "2.2" },
    prompt: "What does the licensee's own inspection duty cover?",
    choices: [
      "A reasonably competent and diligent visual inspection of the accessible areas, disclosing what was observed.",
      "An inspection of every area including the crawlspace, attic, and roof.",
      "A review of the seller's disclosure to confirm its accuracy.",
      "Whatever the buyer requests be examined."
    ],
    correctChoice: 0,
    rationale: "The duty is visual and limited to accessible areas. Exceeding it creates an expectation the licensee cannot meet on every property, and it does not extend to verifying the seller's statements." },
  { source: { assignment: "assignment-09", section: "2.5" },
    prompt: "A licensee observes a diagonal crack above a doorway. What should he record?",
    choices: [
      "The observation — the crack, its location, and that its cause was not determined.",
      "That the crack is cosmetic and does not affect the structure.",
      "That the property shows evidence of settlement.",
      "Nothing, since characterizing a crack requires expertise he does not have."
    ],
    correctChoice: 0,
    rationale: "Observation is recorded and inference is not. Silence is also wrong — the competence limit constrains the characterization, not the disclosure of what was seen." },
  { source: { assignment: "assignment-09", section: "5.4" },
    prompt: "A disclosure amendment reaches the buyer after he removed his investigation contingency. What is the correct response?",
    choices: [
      "Raise it immediately rather than proceeding as though the transaction were firm, because rights running from delivery are not extinguished by the buyer having acted earlier without the information.",
      "Proceed, since the contingency was removed before the amendment arrived.",
      "Ask the buyer to sign an acknowledgment that the amendment does not change his decision.",
      "Treat the amendment as informational only, since the period has closed."
    ],
    correctChoice: 0,
    rationale: "The buyer made a decision without information he was entitled to. Asking him to waive the point, or treating the amendment as informational, substitutes the licensee's judgment for his." },
  { source: { assignment: "assignment-09", section: "4.6" },
    prompt: "A buyer asks whether a neighborhood is safe. What is the correct answer?",
    choices: [
      "Direct him to law enforcement's published data and his own investigation, without characterizing the area.",
      "Give an honest assessment based on the licensee's familiarity with the area.",
      "Say the area is safe if the licensee has never heard of an incident there.",
      "Decline to answer and offer no alternative."
    ],
    correctChoice: 0,
    rationale: "'Safe' and 'bad area' are exactly the terms that carry composition. Refusing to characterize while pointing at the actual data is a service rather than an evasion." },
  /* Assignment 10 — Financing the transaction */
  { source: { assignment: "assignment-10", section: "2.4" },
    prompt: "A buyer says he will rent the property out although the application states owner occupancy. What is the correct handling?",
    choices: [
      "Tell him occupancy is material to the credit decision, direct him to inform his lender, decline to be part of any communication stating otherwise, and escalate to the broker.",
      "Keep it confidential, since the client disclosed it in confidence.",
      "Notify the lender directly without telling the buyer.",
      "Do nothing, since intentions can lawfully change after closing."
    ],
    correctChoice: 0,
    rationale: "Occupancy is material and misstating it is loan fraud. Confidentiality does not extend to participating in a misrepresentation to a third party." },
  { source: { assignment: "assignment-10", section: "4.4" },
    prompt: "A manager tells a licensee to send the appraiser comparables selected because they support the contract price. What is the analysis?",
    choices: [
      "It communicates a target rather than information, and it is improper regardless of who gave the instruction.",
      "It is permissible, since the appraiser remains free to reject the data.",
      "It is permissible if the licensee also sends comparables that do not support the price.",
      "It is improper only if the licensee states the contract price in the message."
    ],
    correctChoice: 0,
    rationale: "A set assembled by working backward from a figure is a target in another form. 'My manager told me to' does not transfer responsibility for making the call." },
  { source: { assignment: "assignment-10", section: "5.3" },
    prompt: "A seller compares two offers, one at a higher price with a large closing-cost credit. How should the licensee present them?",
    choices: [
      "On net proceeds after costs and credits, not on the headline price.",
      "On price, since the credit is the buyer's expense rather than the seller's.",
      "On price and closing date only, since credits are negotiable later.",
      "On whichever measure the seller prefers to use."
    ],
    correctChoice: 0,
    rationale: "A credit moves money from the seller's proceeds. Comparing headline prices where the concession structures differ is comparing two different things." },
  { source: { assignment: "assignment-10", section: "4.6" },
    prompt: "Which action by a buyer under contract most commonly jeopardizes an approval before funding?",
    choices: [
      "Opening new credit, changing jobs, or moving money between accounts without telling the lender.",
      "Scheduling additional inspections after the contingency is removed.",
      "Requesting a copy of the appraisal from the lender.",
      "Asking the seller for an extension of the closing date."
    ],
    correctChoice: 0,
    rationale: "Approval is not final until funding, and a re-verification before closing is where these appear. The other three are ordinary transaction activity." },
  { source: { assignment: "assignment-10", section: "5.7" },
    prompt: "Which item is most often missing from an estimated closing statement?",
    choices: [
      "A credit agreed in an amendment that reached escrow late or not at all.",
      "The loan amount, which escrow takes from the lender's instructions.",
      "The commission, which escrow computes from the listing agreement.",
      "The property tax proration, which escrow computes from the county record."
    ],
    correctChoice: 0,
    rationale: "Escrow performs the instructions it holds, so a term agreed late and never transmitted does not appear. The other three come from documents escrow already has." },
  { source: { assignment: "assignment-10", section: "1.6" },
    prompt: "An offer is labeled 'cash' and the proof of funds shows a brokerage account statement. What must the licensee establish?",
    choices: [
      "Whether the funds are liquid and how long they take to reach escrow, since a liquidation has its own timeline and produces a different amount.",
      "Nothing further — a statement showing sufficient value is proof of funds.",
      "Whether the buyer will obtain an appraisal, since cash buyers cannot.",
      "Whether the buyer will waive the inspection, which cash offers require."
    ],
    correctChoice: 0,
    rationale: "Cash means no loan secured by the property, not that the money is available today. A cash buyer may obtain an appraisal and may investigate; neither is precluded." },
  /* Assignment 11 — Escrow, title, closing, and possession */
  { source: { assignment: "assignment-11", section: "1.2" },
    prompt: "What does escrow's neutrality forbid?",
    choices: [
      "Deciding between the parties, advising either of them, or acting on anything other than the instructions it holds.",
      "Communicating with either party without the other present.",
      "Preparing the closing statement before both parties have signed instructions.",
      "Holding funds belonging to one party only."
    ],
    correctChoice: 0,
    rationale: "Neutrality is a constraint on deciding and advising. Ordinary communication, statement preparation, and holding one party's funds are all normal escrow activity." },
  { source: { assignment: "assignment-11", section: "1.6" },
    prompt: "The parties sign an amendment and no one sends it to escrow. What appears at closing?",
    choices: [
      "The original terms, because escrow acts on the instructions it holds — the amendment binds the parties but escrow has not been instructed.",
      "The amended terms, because the parties' agreement controls escrow.",
      "Nothing closes, because escrow must detect the discrepancy.",
      "The amended terms, provided one party mentions the change to escrow by phone."
    ],
    correctChoice: 0,
    rationale: "Keeping the agreement and the escrow instructions aligned is the licensee's task on every file, and escrow will not act on a phone call." },
  { source: { assignment: "assignment-11", section: "2.3" },
    prompt: "A preliminary report lists an easement in a single line. What should the licensee do?",
    choices: [
      "Obtain the recorded instrument, because the summary says an easement exists while the instrument says what it permits and where it runs.",
      "Explain the easement's effect to the buyer from the report's description.",
      "Treat it as routine unless the buyer raises a question.",
      "Ask escrow to have the easement removed before closing."
    ],
    correctChoice: 0,
    rationale: "The single most valuable thing a licensee does with a preliminary report is obtain the underlying documents. Interpreting their effect is counsel's, and easements are not removed on request." },
  { source: { assignment: "assignment-11", section: "2.4" },
    prompt: "A buyer asks how he should take title. What is the correct response?",
    choices: [
      "Explain that vesting carries legal and tax consequences and route the question to counsel and a tax advisor.",
      "Recommend the form most buyers in his situation use.",
      "Recommend the form that avoids probate, since that is the usual objective.",
      "Have escrow choose, since escrow prepares the deed."
    ],
    correctChoice: 0,
    rationale: "Vesting affects survivorship, creditors, and taxation, and it is not the licensee's question. Escrow's neutrality equally prevents it from advising." },
  { source: { assignment: "assignment-11", section: "4.5" },
    prompt: "Why does the order of recording matter at closing?",
    choices: [
      "It establishes the priority of the instruments recorded, which determines lien positions.",
      "It determines the effective date of the buyer's insurance coverage.",
      "It determines which party pays the recording fees.",
      "It determines when possession transfers to the buyer."
    ],
    correctChoice: 0,
    rationale: "Recording order fixes priority. Insurance, fees, and possession are governed by other documents." },
  { source: { assignment: "assignment-11", section: "5.2" },
    prompt: "A seller asks to remain in the property for three days after closing. What is required?",
    choices: [
      "A written agreement addressing the term, the condition of the property, insurance, liability, and what happens if he does not vacate.",
      "Nothing, provided the buyer agrees verbally and the parties are on good terms.",
      "An amendment moving the closing date to the day the seller vacates.",
      "Escrow's approval, since escrow controls possession."
    ],
    correctChoice: 0,
    rationale: "Post-closing occupancy is an occupancy of the buyer's property by a non-owner. It needs a written agreement, and escrow does not control possession." },
  { source: { assignment: "assignment-12", section: "2.1" },
    prompt: "What is the foundation of a defensible tenant selection process?",
    choices: [
      "Written criteria defined so that two people applying them reach the same result, applied uniformly and recorded.",
      "An experienced manager's judgment about which applicants will be reliable.",
      "A preference for applicants who apply first, evaluated case by case.",
      "The owner's approval of each applicant before any criteria are applied."
    ],
    correctChoice: 0,
    rationale: "Criteria that require knowing what the manager thought cannot be shown to have been applied evenly. An owner reviewing applicants before criteria are applied is where exposure concentrates." },
  { source: { assignment: "assignment-12", section: "3.3" },
    prompt: "A broker deposits tenant funds into the brokerage operating account and tracks them on an internal ledger. What is the position?",
    choices: [
      "Commingling, and the internal ledger does not cure it.",
      "Permissible, because the ledger identifies the owner of each dollar.",
      "Permissible if the funds are transferred to trust within a short period.",
      "Conversion, which is the same violation as commingling."
    ],
    correctChoice: 0,
    rationale: "Trust funds in an operating account is commingling regardless of internal records. Conversion — using the funds for the broker's purposes — is a further and distinct wrong." },
  { source: { assignment: "assignment-12", section: "3.6" },
    prompt: "A manager's trust account balances to the bank statement, yet one property's ledger is negative. What did the reconciliation that missed this fail to do?",
    choices: [
      "Compare the individual beneficiary ledgers as well as the bank balance and the control record, all as of the same date.",
      "Reconcile the account within the required period after the statement date.",
      "Include the security deposits held for that property.",
      "Separate the manager's earned fees from the funds held in trust."
    ],
    correctChoice: 0,
    rationale: "A bank-to-book comparison balances whenever the total is right, which is exactly how one owner's funds end up covering another's shortfall unnoticed. Only the property-level comparison surfaces it." },
  { source: { assignment: "assignment-12", section: "4.4" },
    prompt: "A manager needs to enter an occupied unit to inspect a reported leak. What applies?",
    choices: [
      "The lawful entry requirements, including notice — a tenant's earlier report is not a standing invitation to enter.",
      "Nothing, because the tenant requested the repair.",
      "Nothing, because an inspection is not a repair.",
      "The requirements apply only to entries the owner requests."
    ],
    correctChoice: 0,
    rationale: "Entry rules apply to inspections as well as repairs, and entering without required notice converts a maintenance visit into a violation." },
  { source: { assignment: "assignment-12", section: "5.4" },
    prompt: "A tenant is months behind in rent. Which action by the owner or manager is prohibited?",
    choices: [
      "Changing the locks or shutting off utilities to force the tenant out.",
      "Serving the notice the statute requires for nonpayment.",
      "Filing an unlawful detainer after the notice period expires.",
      "Applying the security deposit as the lease and statute permit at the end of the tenancy."
    ],
    correctChoice: 0,
    rationale: "Self-help eviction is prohibited regardless of how far behind the tenant is, and a manager who performs it has done the unlawful act himself." },
  { source: { assignment: "assignment-12", section: "5.3" },
    prompt: "An owner instructs the manager to raise a tenant's rent because the tenant keeps complaining about repairs. What is the problem?",
    choices: [
      "A rent increase following complaints has the appearance of retaliation, and the appearance is itself the problem.",
      "Nothing, provided the increase is within any applicable limit.",
      "Nothing, provided proper notice of the increase is served.",
      "The instruction is improper only if the tenant has filed with a public agency."
    ],
    correctChoice: 0,
    rationale: "Retaliation analysis turns on the sequence and the apparent reason. Proper notice and a lawful amount do not answer why the increase was imposed." },
  /* Assignment 13 — Ethics, risk management, and dispute prevention */
  { source: { assignment: "assignment-13", section: "1.4" },
    prompt: "A licensee knows of a material defect, says nothing, and makes no false statement. How is that treated?",
    choices: [
      "As concealment, which is a form of misrepresentation — careful silence about a known material defect is not a defense.",
      "As permissible, since no affirmative false statement was made.",
      "As permissible if the buyer had his own inspector.",
      "As a breach of confidentiality to the seller if the licensee had disclosed it."
    ],
    correctChoice: 0,
    rationale: "Concealment and misstatement are treated alike. The buyer having representation or an inspector does not transfer the duty." },
  { source: { assignment: "assignment-13", section: "1.5" },
    prompt: "Which statement is a prediction a licensee must not make?",
    choices: [
      "\"Values here are only going up.\"",
      "\"The disclosure must be delivered within the period the agreement states.\"",
      "\"Based on the last six closed sales, a file like this typically prices in this range.\"",
      "\"I don't know the answer to that — let me find out today.\""
    ],
    correctChoice: 0,
    rationale: "A prediction about future value stated as fact is not defensible in any market. The others are a fact, an identified estimate, and a routing." },
  { source: { assignment: "assignment-13", section: "2.1" },
    prompt: "A licensee discovers he sent the wrong disclosure version to a buyer three days ago. What should he do?",
    choices: [
      "Correct it immediately and visibly, preserving the original, and tell the broker.",
      "Send the correct version without comment so the file contains it.",
      "Replace the document in the file with the correct version.",
      "Wait to see whether the error has any consequence before raising it."
    ],
    correctChoice: 0,
    rationale: "Corrections are made visibly with the original preserved. Silent replacement is the act that converts a correctable error into a question about integrity." },
  { source: { assignment: "assignment-13", section: "3.7" },
    prompt: "How should a licensee write an escalation about suspected fraud?",
    choices: [
      "As facts with dates and sources, addressed to the responsible broker, without conclusions or legal characterizations.",
      "As a clear statement of what he believes occurred, so the broker can act quickly.",
      "As an anonymous note, to avoid retaliation.",
      "As an oral report, so nothing is written that could be produced later."
    ],
    correctChoice: 0,
    rationale: "A conclusion is the licensee's opinion and exposes him if he is wrong; a fact is a fact. An oral report leaves nothing showing he made it." },
  { source: { assignment: "assignment-13", section: "5.1" },
    prompt: "A former client sends a message alleging he was never told about a permitting problem and threatening a regulatory filing. What is the correct first step?",
    choices: [
      "Notify the broker, preserve everything, and reconstruct what the file shows before replying.",
      "Reply promptly with a reassuring explanation to defuse the situation.",
      "Reply denying the allegation, since the licensee remembers disclosing it.",
      "Offer to pay for a portion of the cost to resolve the matter."
    ],
    correctChoice: 0,
    rationale: "The first response sets the trajectory, and a fast reply written from memory is how a service problem becomes a credibility problem. An offer to pay is a decision for the broker." },
  { source: { assignment: "assignment-13", section: "6.6" },
    prompt: "What is the one category of conduct this course treats as not survivable?",
    choices: [
      "Falsifying a record — creating or altering a document to say something it did not say.",
      "Missing a contractual deadline.",
      "Giving a client an inaccurate answer to a question.",
      "Failing to document a conversation that later matters."
    ],
    correctChoice: 0,
    rationale: "A documented gap is a compliance problem a brokerage survives. A manufactured document converts a defensible situation into a question about integrity." },
  /* Assignment 14 — Implicit bias and fair housing participatory practicum */
  { source: { assignment: "assignment-14", section: "1.1" },
    prompt: "What distinguishes implicit bias from explicit bias?",
    choices: [
      "Implicit bias operates outside conscious awareness and can affect the conduct of a person who holds no discriminatory belief.",
      "Implicit bias is unlawful while explicit bias is merely unprofessional.",
      "Implicit bias applies to advertising and explicit bias to client selection.",
      "Implicit bias occurs only in organizations, not in individuals."
    ],
    correctChoice: 0,
    rationale: "The distinction is awareness. Both can produce unlawful conduct, and systemic bias is a third thing that is not the sum of individual bias." },
  { source: { assignment: "assignment-14", section: "3.1" },
    prompt: "Why does the professional response emphasize structure over effort?",
    choices: [
      "A structural control operates on the day the licensee is not thinking about bias, and that is the day it matters.",
      "Effort is legally irrelevant because fair housing liability is strict.",
      "Structure is required by statute in place of training.",
      "Effort addresses explicit bias only, which is rare."
    ],
    correctChoice: 0,
    rationale: "Implicit bias operates fastest under time pressure and load, which is a working licensee's ordinary day. Uniform scripts, documented searches, and outcome review do not depend on attention." },
  { source: { assignment: "assignment-14", section: "1.5" },
    prompt: "At which stage of a transaction is unequal treatment least visible and therefore most dangerous?",
    choices: [
      "The first inquiry, where different callers receive different amounts of information, encouragement, and follow-up.",
      "The offer stage, where terms are documented.",
      "The closing, where every figure is recorded.",
      "The listing appointment, where the agreement is signed."
    ],
    correctChoice: 0,
    rationale: "Differential information at the inquiry stage leaves almost no trace, which is why an inquiry log is the control. The later stages generate documents by default." },
  { source: { assignment: "assignment-14", section: "3.3" },
    prompt: "What does outcome review examine?",
    choices: [
      "Patterns across clients — response times, properties shown, exceptions granted, reach — rather than the intentions behind individual decisions.",
      "Whether any client has complained about unequal treatment.",
      "Whether the licensee can explain each individual decision.",
      "Whether the brokerage's advertising includes the equal housing statement."
    ],
    correctChoice: 0,
    rationale: "A set of individually explainable decisions can still produce a distribution that is not explainable, and complaints are only one route — data is another and requires no dissatisfaction." },
  { source: { assignment: "assignment-14", section: "6.4" },
    prompt: "A client instructs a licensee not to show the property to a category of buyers. What is the correct response?",
    choices: [
      "Refuse, state why, escalate to the broker, and address whether the engagement can continue.",
      "Follow the instruction while documenting that the client gave it.",
      "Schedule around those buyers without stating a reason.",
      "Withdraw quietly without explaining."
    ],
    correctChoice: 0,
    rationale: "Documentation does not transfer responsibility, informal compliance achieves the same exclusion, and quiet withdrawal leaves the client free to repeat it with the next licensee." },
  { source: { assignment: "assignment-14", section: "2.4" },
    prompt: "Does the history of exclusion in housing justify steering a buyer toward a particular area to correct it?",
    choices: [
      "No — steering on a protected basis is prohibited regardless of intent, including a corrective intent.",
      "Yes, where the licensee documents the corrective purpose.",
      "Yes, where the buyer consents in writing.",
      "Yes, where the area was historically excluded from lending."
    ],
    correctChoice: 0,
    rationale: "History explains why the present distribution exists; it does not license unequal treatment in either direction. What it licenses is skepticism about processes producing unequal results." },
  /* Assignment 15 — Integrated California residential transaction */
  { source: { assignment: "assignment-15", section: "1.1" },
    prompt: "What form does almost every serious defect in a transaction file take?",
    choices: [
      "A timing defect — the right act performed after the moment at which it protected anyone.",
      "A missing signature on a required document.",
      "An arithmetic error in the closing statement.",
      "A disagreement between the parties about a negotiated term."
    ],
    correctChoice: 0,
    rationale: "Disclosure after a decision, consent after the conduct, a comparison after the client was steered — the act occurred, and it occurred too late to operate." },
  { source: { assignment: "assignment-15", section: "4.3" },
    prompt: "Why is delivery the point at which a disclosure obligation is measured?",
    choices: [
      "Because the buyer's rights run from receipt, so a file that cannot evidence delivery cannot show the rights were honored.",
      "Because the seller's obligation ends when the document is signed.",
      "Because escrow will not close without proof of delivery.",
      "Because the listing service requires delivery to be logged."
    ],
    correctChoice: 0,
    rationale: "Rights attach at delivery, and the evidence — what, to whom, when, by what method, with what proof — is what the file must carry." },
  { source: { assignment: "assignment-15", section: "6.3" },
    prompt: "A closed file contains an undisclosed dual agency and a contingency removal that is signed but undated. How do they rank?",
    choices: [
      "The undisclosed dual agency is more serious, because it describes duties actually owed being breached rather than a documentation failure.",
      "The undated removal is more serious, because rights ran from it.",
      "They are equally serious, since both are file defects.",
      "Neither is serious if the transaction closed without objection."
    ],
    correctChoice: 0,
    rationale: "The undated removal is the defect a dispute is most likely to turn on, but the dual agency is different in kind — and closing without objection establishes only that the parties did not know." },
  { source: { assignment: "assignment-15", section: "6.4" },
    prompt: "An audit finds a required consent that was never obtained. What must not happen?",
    choices: [
      "Creating the consent now and filing it as though it had been obtained at the time.",
      "Recording the finding and escalating it to the broker.",
      "Obtaining what legitimately exists elsewhere in the participants' files.",
      "Changing the process that allowed the omission to occur."
    ],
    correctChoice: 0,
    rationale: "A documented gap is a compliance problem a brokerage survives; a manufactured document is falsification and it ends careers." },
  { source: { assignment: "assignment-15", section: "6.5" },
    prompt: "Which set of questions resolves a transaction situation the course did not cover?",
    choices: [
      "Whose decision is this, whose duty is engaged, does the decision have the information it requires, and what will the file show.",
      "What is customary, what will the client accept, what closes fastest, and what will the broker approve.",
      "What does the form say, what did the last transaction do, what does the other agent expect, and what is defensible later.",
      "What is my opinion, what does the client prefer, what is least disruptive, and what can be fixed afterward."
    ],
    correctChoice: 0,
    rationale: "Identifying the decision-maker, the duty, whether the decision is informed, and what the record will show produces both the action and the record it requires." },
  { source: { assignment: "assignment-15", section: "5.6" },
    prompt: "Which item should already be complete seven days before closing?",
    choices: [
      "All contingencies resolved with removals dated and delivered, all amendments at escrow, and insurance bound.",
      "The final walkthrough, which is performed a week ahead to allow time to respond.",
      "The recording of the deed, which precedes the disbursement of funds.",
      "The transfer of possession, which occurs before the closing statement is signed."
    ],
    correctChoice: 0,
    rationale: "The closing week concentrates the failures deferred earlier. Recording and disbursement occur at closing, and possession follows the agreement." },
  /* Integrative items — each answer requires material from more than one assignment */
  { source: { assignment: "assignment-03", section: "3.2" },
    crossReferences: [{ assignment: "assignment-09", section: "1.5" }],
    prompt: "A seller tells his listing agent privately that a bathroom leaked into the ceiling below and was dried out informally, and instructs him to leave it off the disclosure. What is the correct handling?",
    choices: [
      "Explain the exposure, offer the stronger path of full disclosure with the remediation history, involve the broker immediately if the seller holds his position, and record the conversation the day it happens.",
      "Leave it off, since the instruction came from the principal and confidentiality runs to him.",
      "Use wording that technically discloses moisture without describing what happened.",
      "Say nothing and rely on the buyer's inspector to open the ceiling."
    ],
    correctChoice: 0,
    rationale: "Confidentiality protects the seller's negotiating position, not concealment of a material condition. Wording a buyer would not understand as describing the event is not a disclosure, and the ceiling has been closed." },
  { source: { assignment: "assignment-08", section: "4.7" },
    crossReferences: [{ assignment: "assignment-10", section: "4.3" }],
    prompt: "A buyer proposes waiving the appraisal contingency to compete. What must the licensee do before the offer goes out?",
    choices: [
      "Explain the mechanism with a number — a shortfall must be covered in cash — confirm the buyer has told his lender, and document the advice and his decision.",
      "Recommend the waiver, since it materially improves the offer's competitiveness.",
      "Refuse to submit an offer containing the waiver.",
      "Submit it and address the shortfall if the appraisal comes in low."
    ],
    correctChoice: 0,
    rationale: "The strategy belongs to the buyer and the number makes the risk real in a way the word does not. A waiver the buyer cannot perform is a default with a delay built in." },
  { source: { assignment: "assignment-06", section: "1.7" },
    crossReferences: [{ assignment: "assignment-09", section: "4.5" }],
    prompt: "A seller's addition was built without permits. What governs the marketing?",
    choices: [
      "The published room count and square footage must come from a source that supports them, and the permitting condition is disclosed.",
      "The seller's description controls, since the property is his.",
      "The prior listing's figures may be repeated, since they were published before.",
      "The addition should be omitted from marketing and disclosures alike."
    ],
    correctChoice: 0,
    rationale: "Every factual claim needs a source and this is the category where advertising most often becomes a misrepresentation. Omitting it from the disclosures is concealment." },
  { source: { assignment: "assignment-11", section: "3.5" },
    crossReferences: [{ assignment: "assignment-08", section: "5.1" }],
    prompt: "Which coordination failure is invisible until the deadline arrives?",
    choices: [
      "The unowned task — everyone assumed someone else ordered the association documents, so nobody is behind because nobody started.",
      "A vendor who cancels an appointment, which is reported immediately.",
      "A party who refuses to sign an amendment, which is apparent at once.",
      "An inspection that identifies more items than expected."
    ],
    correctChoice: 0,
    rationale: "Nothing looks wrong while an unowned task sits undone. The control is a written task list with a name against each item, made the day escrow opens." },
  { source: { assignment: "assignment-13", section: "4.3" },
    crossReferences: [{ assignment: "assignment-03", section: "5.6" }],
    prompt: "A licensee receives a fee from a home warranty company for each referral. What is the first question?",
    choices: [
      "Whether the payment may lawfully be received at all — disclosure does not cure a prohibited referral payment.",
      "Whether the client was told before he purchased the warranty.",
      "Whether the fee is paid to the licensee or to the brokerage.",
      "Whether the client was offered more than one warranty company."
    ],
    correctChoice: 0,
    rationale: "Asking only whether it was disclosed skips the first question. Routing it through the brokerage does not change the character of the payment." },
  { source: { assignment: "assignment-04", section: "5.6" },
    crossReferences: [{ assignment: "assignment-13", section: "5.3" }],
    prompt: "A seller reports that jewelry is missing after a showing. What should the licensee do first?",
    choices: [
      "Take it seriously, notify the broker immediately, tell the seller to contact law enforcement, and preserve the access record before any system rolls over.",
      "Reassure the seller that items are usually misplaced and suggest looking again.",
      "Call the agents who showed the property to ask what happened.",
      "Review the access log privately and identify the likely visitor before reporting."
    ],
    correctChoice: 0,
    rationale: "Reassurance reads as dismissal, and investigating or repeating a suspicion about a named person carries its own exposure. Preservation is immediate." },
  { source: { assignment: "assignment-09", section: "2.6" },
    crossReferences: [{ assignment: "assignment-01", section: "3.3" }],
    prompt: "During a visual inspection of a fifty-year-old house a licensee finds nothing remarkable. What should his disclosure say?",
    choices: [
      "What he examined and what he observed, item by item — never 'no issues observed', which is a statement about the property the inspection did not support.",
      "'No issues observed', which accurately records the result.",
      "Nothing, since there is nothing to disclose.",
      "That the property appears to be in good condition for its age."
    ],
    correctChoice: 0,
    rationale: "A blanket statement of no issues on an older property asserts more than a visual inspection of accessible areas can support, and 'good condition for its age' is a characterization." },
  { source: { assignment: "assignment-05", section: "5.5" },
    crossReferences: [{ assignment: "assignment-01", section: "1.6" }],
    prompt: "A former client asks for a written opinion of value to use in a dissolution proceeding. What comes first?",
    choices: [
      "Establishing who will rely on it and for what, because the intended use determines whether the licensee may accept the assignment at all.",
      "Determining the effective date, which is the only variable that changes.",
      "Preparing the analysis using the same method as a listing presentation.",
      "Declining, since a licensee may not prepare a written opinion of value."
    ],
    correctChoice: 0,
    rationale: "The intended use governs, and some uses place the assignment outside what the license authorizes. The effective date matters too, but only after the assignment may be accepted." },
  { source: { assignment: "assignment-12", section: "2.8" },
    crossReferences: [{ assignment: "assignment-14", section: "3.6" }],
    prompt: "A management office applies identical written criteria to every application but keeps no record of what was said to telephone inquiries. What is the exposure?",
    choices: [
      "Uniform criteria do not answer an allegation that different callers received different information, and only an inquiry log can.",
      "None, since uniform criteria are a complete defense.",
      "None, since telephone inquiries are not applications.",
      "Exposure limited to applicants who were denied."
    ],
    correctChoice: 0,
    rationale: "The criteria govern a later stage. Differential information at first contact is the least visible violation in leasing and leaves no trace without a log." },
  { source: { assignment: "assignment-15", section: "2.6" },
    crossReferences: [{ assignment: "assignment-04", section: "1.6" }],
    prompt: "Why does a complication discovered at intake cost far less than the same complication discovered during escrow?",
    choices: [
      "At intake it is a document request or a referral; during escrow it collides with a buyer's running deadlines and a lender's committed timeline.",
      "Because intake findings do not need to be disclosed to a buyer.",
      "Because the seller may withdraw the listing at intake without consequence.",
      "Because escrow charges a fee for each amendment."
    ],
    correctChoice: 0,
    rationale: "The complication is knowable at intake and expensive after an offer. Moving the work to the point where it collides with deadlines is the definition of a timing defect." },
];

/* Form B is the retake form RE 303 p.4 requires: a second full examination on the same
   material with different questions. It is authored separately and must not repeat a
   Form A item. */
const formB = [
];

export default {
  courseId: "ca-real-estate-practice-45",
  forms: { A: formA, B: formB }
};
