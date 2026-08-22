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
  /* Assignment 03 topic 6 — the agency documentation case. Added by the coverage gate. */
  { source: { assignment: "assignment-03", section: "6.2" },
    prompt: "A closed file shows an agency disclosure signed three days after the listing agreement, a purchase agreement confirming the brokerage as the buyer's agent while the listing file shows it as the seller's agent, and no dual agency consent from either party. Which finding is the most serious, and why?",
    choices: [
      "The contradiction, because it describes an undisclosed dual agency \u2014 duties actually owed to both parties were breached, rather than a documentation step being missed.",
      "The late disclosure, because a disclosure signed after the listing agreement is void and takes the listing agreement with it.",
      "All three equally, because each is a dated document appearing out of sequence in the file.",
      "None of them, because the transaction closed and no party has complained."
    ],
    correctChoice: 0,
    rationale: "The disclosure signed after the listing means the seller committed before being informed, which is a real defect. But the contradiction is different in kind: the file shows the brokerage acting on both sides with consent from neither, which is undisclosed dual agency. The absence of a complaint establishes nothing, and no finding may be corrected by adjusting a date after the fact." },
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
  /* Assignment 12 topic 6 — owner reporting and risk controls. Added by the coverage gate. */
  { source: { assignment: "assignment-12", section: "6.3" },
    prompt: "A property manager has sent one owner no report for four months. What has actually happened during those four months?",
    choices: [
      "The owner has been unable to verify the handling of their own funds for a third of a year, and the trust records have gone that long without any outside scrutiny.",
      "Nothing of consequence, provided the annual summary is complete and delivered at year end.",
      "A scheduling problem only, since reporting frequency is a term the parties set in the management agreement rather than an obligation.",
      "A defect that becomes real only if an error is later found in the trust records."
    ],
    correctChoice: 0,
    rationale: "Reporting is how the accounting duty is discharged, so a gap in reporting is a gap in the accounting itself. The significance does not wait on an error being found: nobody was in a position to find one. A finding of this kind sits alongside commingling and unsigned agreements rather than in a filing backlog." },
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
  /* Assignment 14 topic 4 — the SB 1495 participatory practicum, consumer role. Added by the coverage gate; the practicum is examined on what it establishes, not by asking a student to role play in a multiple choice item. */
  { source: { assignment: "assignment-14", section: "4.4" },
    prompt: "A buyer asks to see two specific homes on Alder Street. The licensee, friendly and evidently trying to help throughout, shows three homes in a different area instead and remarks that the schools there are \"a better fit for a family like yours.\" Taking the consumer's position in this scenario is designed to establish what?",
    choices: [
      "That the effect is independent of the intent: the consumer still did not see the homes he asked about and still cannot evaluate them, however well meant the substitution was.",
      "That the conduct is permissible where the licensee sincerely believes the alternatives are better suited to the buyer's circumstances.",
      "That the consumer carries the responsibility to object at the time, since a licensee cannot act on a preference the consumer does not restate.",
      "That the remark about schools is the only defect, the substitution of properties being a matter of professional judgment."
    ],
    correctChoice: 0,
    rationale: "The licensee in the scenario is warm and well meaning, and the consumer is left without the information he asked for. Experiencing that gap from the consumer's side is the point of the exercise. Most consumers in the position cannot name what happened \u2014 which is why the obligation sits on the licensee rather than on the consumer to object." },
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
  /* Assignment 01 — California practice standards and the regulated professional */
  { source: { assignment: "assignment-01", section: "1.4" },
    prompt: "What is the operative difference between a broker license and a salesperson license?",
    choices: [
      "A broker may operate independently and supervise licensees; a salesperson's authority flows through an employing broker.",
      "A broker may list property and a salesperson may only sell it.",
      "A broker must be a natural person and a salesperson may be an entity.",
      "A broker may handle trust funds and a salesperson may not touch any transaction document."
    ],
    correctChoice: 0,
    rationale: "The distinction is independent operation and supervisory authority. Salespersons perform the full range of licensed activity under a broker's authority." },
  { source: { assignment: "assignment-01", section: "2.3" },
    prompt: "An independent contractor agreement states the salesperson controls his own schedule and methods. What does it do to the broker's supervisory duty?",
    choices: [
      "Nothing — independent contractor status addresses tax and payroll treatment and does not reduce supervision.",
      "It transfers the supervisory duty to the salesperson for his own files.",
      "It limits supervision to the files the broker personally reviews.",
      "It eliminates vicarious responsibility for the salesperson's acts."
    ],
    correctChoice: 0,
    rationale: "The status is a tax and payroll characterization. The supervisory duty and vicarious responsibility are unaffected by it." },
  { source: { assignment: "assignment-01", section: "3.2" },
    prompt: "Which activity crosses from real estate practice into the practice of law?",
    choices: [
      "Drafting a provision that alters the parties' legal rights, rather than completing an approved form with negotiated terms.",
      "Explaining what a deadline in the agreement is and when it falls.",
      "Recommending that a client consult an attorney about a clause.",
      "Delivering a document prepared by the other party's counsel."
    ],
    correctChoice: 0,
    rationale: "Authorship of provisions that change legal rights is the boundary. Explaining the document's own procedure, referring, and delivering are all within scope." },
  { source: { assignment: "assignment-01", section: "4.2" },
    prompt: "Which belongs in a working brokerage policy set?",
    choices: [
      "What must be submitted for review and when, the escalation path, trust fund handling, and the file standard.",
      "The brokerage's commission splits and recruiting terms.",
      "A directory of preferred vendors and their pricing.",
      "The marketing calendar for the coming year."
    ],
    correctChoice: 0,
    rationale: "The policy set governs supervision, escalation, funds, and records. Compensation and marketing are business documents rather than the compliance framework." },
  { source: { assignment: "assignment-01", section: "5.5" },
    prompt: "What should a confirming message after a consequential client conversation contain?",
    choices: [
      "The date, what the client asked or decided, what he was told, and what happens next by when — in a few sentences, sent the same day.",
      "A complete transcript of the conversation.",
      "The licensee's assessment of the client's likely motives.",
      "A statement that the client agreed with the licensee's recommendation."
    ],
    correctChoice: 0,
    rationale: "Short, same day, specific. A transcript is not the point, and characterizing motives or asserting agreement puts the licensee's conclusions into the record." },
  { source: { assignment: "assignment-02", section: "1.1" },
    prompt: "What is wrong with a business plan that consists of a transaction target and a gross income figure?",
    choices: [
      "It does not work backward from the hours a transaction actually requires, including the compliance work, so the target is met by skipping steps.",
      "It fails to account for market conditions that may change during the year.",
      "It cannot be evaluated by a brokerage during recruiting.",
      "It omits the commission split, which determines net income."
    ],
    correctChoice: 0,
    rationale: "A target exceeding capacity is still met — by cutting the work that is invisible until something goes wrong, which is precisely the work that gets cut." },
  { source: { assignment: "assignment-02", section: "2.2" },
    prompt: "A lead vendor assures a licensee that its call list has been screened against do-not-call registries. Where does the obligation sit?",
    choices: [
      "With the caller — a licensee cannot rely on a vendor's assurance.",
      "With the vendor, which contracted to supply a compliant list.",
      "With the brokerage, which purchased the list.",
      "With whichever party the calling script identifies."
    ],
    correctChoice: 0,
    rationale: "The obligation belongs to the person placing the call, and identification of the caller is a separate requirement rather than a way of allocating this one." },
  { source: { assignment: "assignment-02", section: "2.5" },
    prompt: "Which prospecting statement is prohibited in every channel?",
    choices: [
      "\"I have a buyer for your house,\" when no such buyer exists.",
      "\"I sold a property on your street last month,\" when that is true.",
      "\"I would be glad to prepare a market analysis at no cost.\"",
      "\"May I ask whether you have considered selling?\""
    ],
    correctChoice: 0,
    rationale: "A representation creating a false impression of urgency, endorsement, or authority is prohibited, and prospecting pressure is not a defense." },
  { source: { assignment: "assignment-02", section: "3.3" },
    prompt: "A team markets itself under a name displayed more prominently than the brokerage, styled like a separate firm. What is the defect?",
    choices: [
      "It creates the impression of an independent company that is not licensed, which the identification requirements exist to prevent.",
      "Team names may not be used in California advertising at all.",
      "The team name must be registered with the Department before use.",
      "Nothing, provided the brokerage's name appears somewhere in the advertisement."
    ],
    correctChoice: 0,
    rationale: "Team names are permitted; presenting one as though it were the licensed entity is the problem, and mere presence of the brokerage name does not cure prominence." },
  { source: { assignment: "assignment-02", section: "5.4" },
    prompt: "Which control most reduces a brokerage's exposure when a vendor it uses suffers a data breach?",
    choices: [
      "Sending the vendor only the data it actually needs, rather than the whole file.",
      "Requiring the vendor to carry cyber liability insurance.",
      "Using a vendor located in the same state as the brokerage.",
      "Encrypting the brokerage's own devices."
    ],
    correctChoice: 0,
    rationale: "Data not sent cannot be leaked, and most over-sharing happens because sending the whole file is faster than assembling the part. The other measures help but do not reduce what the vendor holds." },
  { source: { assignment: "assignment-02", section: "6.3" },
    prompt: "Why is shortening a retention period a poor economy?",
    choices: [
      "The obligation runs from the transaction rather than from convenience, and a complaint can arrive long after a file was destroyed.",
      "Storage costs are trivial compared with brokerage revenue.",
      "The listing service requires records to be kept indefinitely.",
      "Destroyed records must be reconstructed at the brokerage's expense."
    ],
    correctChoice: 0,
    rationale: "The period runs from the transaction, and retention extends where a complaint has been made or a proceeding is pending. Cost is not the reason the rule exists." },
  /* Assignment 03 — Agency disclosure and fiduciary performance */
  { source: { assignment: "assignment-03", section: "2.2" },
    prompt: "When must the agency disclosure be delivered to a buyer the brokerage is working with?",
    choices: [
      "At the outset of the working relationship, before advice is given — not at the point an offer is written.",
      "With the purchase agreement, where the confirmation also appears.",
      "Within a defined period after the buyer identifies a property of interest.",
      "Before escrow opens, so the parties' roles are settled for closing."
    ],
    correctChoice: 0,
    rationale: "By the time an offer exists, weeks of advice have been given. The confirmation is a later, separate step." },
  { source: { assignment: "assignment-03", section: "3.3" },
    prompt: "A seller instructs his agent not to show the property to a category of buyers. Why can the agent not follow it, even documenting that it came from the client?",
    choices: [
      "The duty of obedience extends only to lawful instructions, and documentation does not transfer responsibility for the act.",
      "The agent may follow it if the brokerage's policy manual permits.",
      "The agent may follow it if the property is owner-occupied.",
      "The agent may follow it provided he does not state the reason to anyone."
    ],
    correctChoice: 0,
    rationale: "Following it informally achieves the same exclusion, and the documentation records that the agent knew rather than shielding him." },
  { source: { assignment: "assignment-03", section: "3.4" },
    prompt: "Which duty continues after the agency relationship has ended?",
    choices: [
      "Confidentiality, including as to the lowest price a former seller would have accepted.",
      "Obedience to the former principal's instructions.",
      "The duty to continue marketing the property.",
      "The duty to account for funds not yet received."
    ],
    correctChoice: 0,
    rationale: "A duty that evaporated at the end of the engagement would not be worth having, and it applies even when the licensee later works with a different client." },
  { source: { assignment: "assignment-03", section: "4.3" },
    prompt: "Both parties have signed a dual agency consent. What does the consent NOT authorize?",
    choices: [
      "Disclosing to one party the price or terms the other is willing to accept.",
      "Presenting offers and counteroffers between the parties.",
      "Disclosing material facts about the property's condition to both.",
      "Explaining the agreement's provisions to both parties."
    ],
    correctChoice: 0,
    rationale: "Confidential negotiating information may not move between sides even with consent to the dual agency itself. Everything else in the list remains required." },
  { source: { assignment: "assignment-03", section: "4.5" },
    prompt: "When should a possible dual agency be raised with the parties?",
    choices: [
      "As soon as it becomes foreseeable, typically when a buyer the brokerage works with becomes interested in a brokerage listing.",
      "When the offer is written, since that is when both sides are represented in one transaction.",
      "At closing, when the compensation from both sides becomes visible.",
      "Only if one of the parties asks whether the brokerage represents the other."
    ],
    correctChoice: 0,
    rationale: "Raising it at the offer is late, because both parties have already invested effort under an assumption that may be wrong. Consent obtained after the conduct records the problem." },
  { source: { assignment: "assignment-03", section: "3.5" },
    prompt: "A licensee wants to buy a property his brokerage has listed. What does loyalty require?",
    choices: [
      "Disclosing that he is acting as a principal rather than an agent, on terms heightened beyond ordinary disclosure, and routing the matter through the broker.",
      "Nothing beyond offering a fair price, since price is what the seller cares about.",
      "Withdrawing from the brokerage's representation of the seller and proceeding as an ordinary buyer.",
      "Obtaining an appraisal to demonstrate the price is market value."
    ],
    correctChoice: 0,
    rationale: "The interest is directly opposed to the principal's on the term that matters most, and a fair price does not substitute for disclosure of the licensee's role." },
  { source: { assignment: "assignment-04", section: "2.5" },
    prompt: "What does a protection clause in a listing agreement generally address?",
    choices: [
      "Compensation where the property is sold after expiration to a buyer identified to the seller during the term, on the clause's own terms.",
      "The brokerage's right to renew the listing automatically.",
      "The seller's obligation to reimburse marketing costs on cancellation.",
      "The buyer's obligation to work exclusively with the listing brokerage."
    ],
    correctChoice: 0,
    rationale: "The clause operates on its own terms as to buyers identified during the term, which is why a written protected-buyer list delivered before expiration is what makes it usable." },
  { source: { assignment: "assignment-04", section: "1.3" },
    prompt: "At intake a seller mentions the garage was converted to a bedroom years ago by a family member. What must be established?",
    choices: [
      "Whether the work was permitted and how the records describe the property, before any room count or square footage is published.",
      "Whether the conversion is structurally sound, which the licensee should assess during the walkthrough.",
      "Whether the buyer will want the space returned to a garage.",
      "Nothing, since the seller's description of his own property may be relied on."
    ],
    correctChoice: 0,
    rationale: "The published figures become the licensee's representation. Structural assessment is outside his competence and the buyer's preferences are a marketing question." },
  { source: { assignment: "assignment-04", section: "4.3" },
    prompt: "A seller says a defect is 'fixed, so there's nothing to disclose.' What is the counseling response?",
    choices: [
      "The repair is exactly what the buyer wants to evaluate, and disclosing it with the repair records is stronger than silence.",
      "Agree, provided the repair was performed by a licensed contractor.",
      "Agree, provided the repair is more than five years old.",
      "Disclose it only if the buyer's inspector identifies the underlying condition."
    ],
    correctChoice: 0,
    rationale: "A repaired condition is still disclosed. Neither the contractor's licensure nor the passage of time removes it, and waiting for the inspector concedes the point." },
  { source: { assignment: "assignment-04", section: "6.4" },
    prompt: "A seller needs the property off the market temporarily for a family matter. What is the correct mechanism?",
    choices: [
      "Withdrawal — the listing continues and the marketing pauses, documented with an accurate listing service status change.",
      "Cancellation, which ends the engagement and can be reinstated later.",
      "Expiration, by allowing the term to run out.",
      "A verbal instruction to stop showings, since no document is needed to pause marketing."
    ],
    correctChoice: 0,
    rationale: "Withdrawal and cancellation are different things, and misrepresenting a property's status in a listing service is its own problem." },
  { source: { assignment: "assignment-04", section: "5.5" },
    prompt: "A listed property is occupied by tenants. What changes about showings?",
    choices: [
      "The tenants' rights govern access, including notice, and the showing plan is built around them rather than around the seller's preference.",
      "Nothing, since the seller owns the property and controls access.",
      "Showings are prohibited until the tenancy ends.",
      "The tenants may be required to vacate for open houses."
    ],
    correctChoice: 0,
    rationale: "A tenancy carries possession rights that a sale does not suspend, and entry requirements apply regardless of who wants the showing." },
  { source: { assignment: "assignment-04", section: "6.6" },
    prompt: "What should the file show when a listing engagement ends?",
    choices: [
      "The date and method, who authorized it for the brokerage, any agreement about compensation or protected buyers, and the listing service status change with its date.",
      "Only the expiration date stated in the original agreement.",
      "A written statement of the seller's reasons for ending it.",
      "Nothing, if the engagement simply expired by its own terms."
    ],
    correctChoice: 0,
    rationale: "An engagement that ends informally by everyone ceasing to act is the one that generates a dispute six weeks later when the property sells." },
  /* Assignment 05 — Market analysis and pricing strategy */
  { source: { assignment: "assignment-05", section: "1.3" },
    prompt: "What defines a defensible competitive set?",
    choices: [
      "Properties a buyer would genuinely consider instead of the subject, with each inclusion and exclusion justified.",
      "The three closest sales by distance regardless of characteristics.",
      "Every sale in the subject's zip code in the last twelve months.",
      "The sales producing the tightest range of indicated values."
    ],
    correctChoice: 0,
    rationale: "Substitution is the principle; proximity, an arbitrary geographic filter, and selecting for convergence are all ways of choosing the answer first." },
  { source: { assignment: "assignment-05", section: "3.3" },
    prompt: "How should active listings be used in a market analysis?",
    choices: [
      "As evidence of current competition and an upper boundary, not as evidence of what buyers have paid.",
      "As the primary indication, because they reflect present market conditions.",
      "As a substitute for closed sales where recent closings are scarce.",
      "They should be excluded entirely from any analysis."
    ],
    correctChoice: 0,
    rationale: "An asking price is an offer to the market. Actives inform strategy and mislead when used as value evidence, but they are not excluded." },
  { source: { assignment: "assignment-05", section: "3.4" },
    prompt: "What does the absorption rate measure?",
    choices: [
      "The rate at which available inventory is being sold, which indicates how long the current supply would last.",
      "The share of listings that expire without selling.",
      "The average number of days a property remains on the market.",
      "The percentage of list price that sellers actually receive."
    ],
    correctChoice: 0,
    rationale: "Absorption relates inventory to sales pace. Days on market and list-to-sale ratio are separate measures of different things." },
  { source: { assignment: "assignment-05", section: "2.7" },
    prompt: "Three comparables each required adjustments approaching a fifth of their sale prices, and all three converge on the number the seller mentioned. What does that convergence show?",
    choices: [
      "Little — convergence produced by heavy adjustment is the analyst's judgment restated three times.",
      "That the analysis is well supported, since three independent indications agree.",
      "That the comparables were correctly selected.",
      "That the seller's expectation is consistent with the market."
    ],
    correctChoice: 0,
    rationale: "Gross adjustment measures how much work the grid is doing. A comparable requiring large gross adjustment is weak however close its adjusted figure lands." },
  { source: { assignment: "assignment-05", section: "6.2" },
    prompt: "What must the pricing file contain for the opinion to be reconstructable later?",
    choices: [
      "The comparables as they existed on that date, the selection reasoning, the derivation of the adjustments, and the market conditions statement.",
      "The final range and the date it was delivered.",
      "The seller's signature acknowledging the recommendation.",
      "A copy of the listing agreement showing the price selected."
    ],
    correctChoice: 0,
    rationale: "A listing service re-queried later returns different data and can contradict the original analysis, so the contemporaneous export and the reasoning are what answer a claim." },
  { source: { assignment: "assignment-05", section: "1.6" },
    prompt: "A subject property is a five-acre rural parcel and the nearest similar sale is eleven months old and four miles away. What does the analysis owe the seller?",
    choices: [
      "A range with its reasoning and a plain statement of what the data does and does not support.",
      "A single figure derived from the nearest available sale.",
      "A figure adjusted upward for the passage of time since the comparable sold.",
      "A refusal to provide any opinion, since the method does not apply."
    ],
    correctChoice: 0,
    rationale: "Applying the method where its assumptions fail produces false precision, which is worse than no number. Stating the limit is the professional obligation, and refusing entirely is not required." },
  { source: { assignment: "assignment-05", section: "5.4" },
    prompt: "An appraisal comes in below the contract price. What may the licensee do?",
    choices: [
      "Submit additional data through the prescribed reconsideration channel, with the appraiser free to reject it.",
      "Contact the appraiser directly to explain what the transaction needs.",
      "Ask the lender to order a second appraisal from a different appraiser who is more familiar with the area.",
      "Advise the seller that the appraisal is wrong and should be disregarded."
    ],
    correctChoice: 0,
    rationale: "A low appraisal is a fact, not a problem to solve. Data may be submitted through the channel; a target, direct pressure, or shopping for a different result may not." },
  /* Assignment 06 — Marketing, advertising, and fair access */
  { source: { assignment: "assignment-06", section: "1.4" },
    prompt: "Which statement crosses from puffery into misrepresentation?",
    choices: [
      "\"The addition is fully permitted,\" where the records do not show a permit.",
      "\"A wonderful home for entertaining.\"",
      "\"One of the nicest streets in the neighborhood.\"",
      "\"You will love the natural light.\""
    ],
    correctChoice: 0,
    rationale: "Puffery is obvious opinion a buyer does not rely on as fact. A statement about permitting is a verifiable fact and, if unsupported, a misrepresentation." },
  { source: { assignment: "assignment-06", section: "2.4" },
    prompt: "A licensee promotes a listing on a personal social account. What applies?",
    choices: [
      "The same identification requirements as any other advertisement — the platform does not change what the advertisement is.",
      "Nothing, because a personal account is personal expression.",
      "Only the truthfulness requirement, since identification applies to paid media.",
      "The requirements apply only if the post is boosted with paid promotion."
    ],
    correctChoice: 0,
    rationale: "Promoting listings is advertising regardless of platform or whether money changed hands, and the profile itself advertises the licensee's services." },
  { source: { assignment: "assignment-06", section: "3.3" },
    prompt: "Which listing phrase must be rewritten?",
    choices: [
      "\"Walk to St. Anne's — perfect for a young family.\"",
      "\"Three bedrooms, two baths, 1,480 square feet per assessor.\"",
      "\"Corner lot with alley access and detached workshop.\"",
      "\"Roof replaced in 2021; permits in the seller's disclosure package.\""
    ],
    correctChoice: 0,
    rationale: "The phrase conveys a preference about who the property is for and identifies the neighborhood by a religious landmark. The others are sourced factual descriptions." },
  { source: { assignment: "assignment-06", section: "3.4" },
    prompt: "How should accessibility features be handled in listing copy?",
    choices: [
      "Described factually as features of the property, because omitting them denies information to the people who need it.",
      "Omitted, since mentioning them may imply a preference about who should apply.",
      "Mentioned only if the seller authorizes it in writing.",
      "Described only in response to a direct inquiry."
    ],
    correctChoice: 0,
    rationale: "Accessibility information belongs in the copy. Withholding it does not avoid a fair housing problem — it creates one." },
  { source: { assignment: "assignment-06", section: "6.5" },
    prompt: "An advertisement is discovered to contain an inaccurate square footage figure. What is required?",
    choices: [
      "Correct or take it down promptly across every channel where it appears, and record what was corrected and when.",
      "Correct the listing service entry only, since that is the source syndication draws from.",
      "Leave it and disclose the correct figure to any buyer who makes an offer.",
      "Correct it at the next scheduled marketing update."
    ],
    correctChoice: 0,
    rationale: "The correction has to reach where consumers actually see it, and syndicated copies do not always update from the source. Waiting continues the misstatement." },
  { source: { assignment: "assignment-06", section: "6.7" },
    prompt: "A portal displays a photograph the licensee removed from the listing six weeks ago. Whose problem is it?",
    choices: [
      "The licensee's — he is responsible for what appears about his listing, which is why the destination is checked rather than only the source.",
      "The portal's, which controls its own display.",
      "The listing service's, which supplies the feed.",
      "Nobody's, since the photograph was accurate when published."
    ],
    correctChoice: 0,
    rationale: "Syndicated content is reformatted by systems the licensee does not control, and periodic capture of how the listing actually appears is how the problem is found." },
  /* Assignment 07 — Buyer representation and property selection */
  { source: { assignment: "assignment-07", section: "2.3" },
    prompt: "How should exclusivity in a buyer representation agreement be explained?",
    choices: [
      "Honestly — what the buyer is agreeing to, for how long, in what area, and what happens if he buys through someone else.",
      "As a formality the brokerage requires before showing property.",
      "As protection for the buyer that carries no obligation on his part.",
      "As terminable by the buyer at any time without consequence."
    ],
    correctChoice: 0,
    rationale: "The agreement creates real obligations, and describing it as a formality or as consequence-free misstates what the buyer is signing." },
  { source: { assignment: "assignment-07", section: "3.4" },
    prompt: "A buyer's parents will contribute to the down payment. What should the licensee do?",
    choices: [
      "Direct the buyer to raise it with the lender early, because how the funds are documented and transferred matters to the approval.",
      "Advise that the funds be deposited a few months before application so they season.",
      "Advise structuring the contribution as a loan rather than a gift.",
      "Treat it as the buyer's private financial matter and say nothing."
    ],
    correctChoice: 0,
    rationale: "Documentation is the lender's requirement and easier before funds move than after. Advising on seasoning or on characterizing the funds is advising on how to present facts to a lender." },
  { source: { assignment: "assignment-07", section: "4.3" },
    prompt: "A buyer asks which schools are best in the area. What is the correct response?",
    choices: [
      "Direct him to the district's own published information and to the district for attendance boundaries, without rating or comparing.",
      "Share the ratings the licensee has seen on a widely used website.",
      "Describe which schools local buyers consider strongest.",
      "Answer if the buyer has already told the licensee he has children."
    ],
    correctChoice: 0,
    rationale: "School-quality claims are among the most common ways an advertisement or a conversation conveys a preference about who a neighborhood is for, and a boundary stated from memory is also a care problem." },
  { source: { assignment: "assignment-07", section: "4.5" },
    prompt: "Why is the property search documented against the buyer's stated criteria?",
    choices: [
      "Because it is the evidence that the search was not built on anything else, including assumptions the licensee never articulated.",
      "Because the listing service requires a record of properties shown.",
      "Because the buyer may later dispute the commission if the record is incomplete.",
      "Because the seller's agent is entitled to see which properties were considered."
    ],
    correctChoice: 0,
    rationale: "Areas quietly added or omitted against stated criteria is where steering lives, and the record is what shows the search followed the buyer rather than the licensee." },
  { source: { assignment: "assignment-07", section: "5.5" },
    prompt: "A buyer is purchasing new construction and asks whether an inspection is necessary.",
    choices: [
      "Recommend investigation in writing — new construction is not an exception, and the buyer's decision either way is documented.",
      "Advise that the builder's warranty and municipal inspections make an independent inspection unnecessary.",
      "Advise against it, since builders commonly refuse access before closing.",
      "Leave the decision to the buyer without a recommendation."
    ],
    correctChoice: 0,
    rationale: "Municipal inspection and a warranty answer different questions than an independent inspection. The recommendation is made and recorded regardless of what the buyer decides." },
  { source: { assignment: "assignment-07", section: "6.6" },
    prompt: "What is the central risk a buyer should understand about an escalation clause?",
    choices: [
      "It reveals what he is willing to pay and depends on how competing offers are verified, so its mechanics and their consequences must be explained before he uses one.",
      "It is prohibited in California residential transactions.",
      "It binds the seller to accept the highest escalated amount.",
      "It replaces the appraisal contingency automatically."
    ],
    correctChoice: 0,
    rationale: "The clause discloses the buyer's ceiling and turns on verification of the competing offer. It binds nobody to accept and does not touch the appraisal contingency." },
  /* Assignment 08 — Purchase agreements, counteroffers, and contingencies */
  { source: { assignment: "assignment-08", section: "1.3" },
    prompt: "What is the function of the deposit in a residential purchase agreement?",
    choices: [
      "It is consideration held under the agreement's terms, whose disposition on cancellation follows the contract's procedure.",
      "It is a fee earned by the listing brokerage when the offer is accepted.",
      "It is applied to the buyer's closing costs and cannot be at risk.",
      "It is a penalty automatically forfeited if the buyer does not close."
    ],
    correctChoice: 0,
    rationale: "Disposition follows the contract's procedure and, where disputed, a legal determination. It is neither automatically forfeited nor immune from risk." },
  { source: { assignment: "assignment-08", section: "1.5" },
    prompt: "What does it mean that time is a term of a purchase agreement?",
    choices: [
      "The dates are substantive obligations rather than administrative targets, and missing one has contractual consequences.",
      "The agreement expires automatically if any deadline passes.",
      "Escrow may extend any deadline to accommodate the parties.",
      "Deadlines are enforceable only if the agreement states that time is of the essence for that item."
    ],
    correctChoice: 0,
    rationale: "Dates carry obligations. The agreement does not evaporate on a missed date, escrow does not extend terms, and treating deadlines as targets is how files fail." },
  { source: { assignment: "assignment-08", section: "2.4" },
    prompt: "A seller receives an offer and instructs his agent not to present a second one that arrives an hour later. What is the agent's obligation?",
    choices: [
      "Explain that offers are presented, and take the instruction to the broker rather than following it silently.",
      "Follow the instruction, since the seller may decide which offers to consider.",
      "Present the second offer directly to the seller's spouse instead.",
      "Advise the second buyer's agent that the property is no longer available."
    ],
    correctChoice: 0,
    rationale: "Withholding a competing offer is a disclosure failure, and telling the second buyer the property is unavailable is a misrepresentation on top of it." },
  { source: { assignment: "assignment-08", section: "3.4" },
    prompt: "What is a backup offer?",
    choices: [
      "A contractual position behind an accepted offer, with defined triggers and its own obligations — not an expression of continuing interest.",
      "An offer held by the listing agent and presented only if the first transaction cancels.",
      "A second offer accepted at the same time as the first.",
      "An option to purchase exercisable if the first buyer defaults."
    ],
    correctChoice: 0,
    rationale: "A buyer entering backup position is entering an agreement with consequences for his deposit and his obligations, which is what he must understand before signing." },
  { source: { assignment: "assignment-08", section: "4.6" },
    prompt: "A buyer waives his investigation contingency at the outset to strengthen an offer. What does the waiver change?",
    choices: [
      "His ability to respond to what an investigation would reveal — the property's condition is unchanged by it.",
      "The seller's disclosure obligations, which are reduced accordingly.",
      "The licensee's duty to recommend investigation, which no longer applies.",
      "The lender's appraisal requirement, which the waiver supersedes."
    ],
    correctChoice: 0,
    rationale: "A waiver removes the buyer's response right and nothing else. Disclosure duties, the recommendation, and the lender's requirements are untouched." },
  { source: { assignment: "assignment-08", section: "5.5" },
    prompt: "The parties agree by telephone to move the closing date. What is required?",
    choices: [
      "A written amendment signed by both, transmitted to escrow, with a same-day confirming message at minimum.",
      "Nothing, since the parties' agreement is what governs.",
      "A note in the file recording the conversation.",
      "Notification to the listing service of the revised date."
    ],
    correctChoice: 0,
    rationale: "The operative date remains the one in the agreement until amended in writing, and escrow acts on what it receives." },
  { source: { assignment: "assignment-08", section: "6.3" },
    prompt: "What is the practical effect of the mediation and arbitration provisions in a residential purchase agreement?",
    choices: [
      "They set the dispute resolution path the parties agreed to, and the consequences of declining to follow it are contractual questions for counsel.",
      "They prevent the parties from ever litigating any dispute.",
      "They allow the brokerage to resolve disputes between the parties.",
      "They apply only to disputes about the deposit."
    ],
    correctChoice: 0,
    rationale: "The provisions set a path and carry consequences; their operation on particular facts is a legal question, and the brokerage does not adjudicate between the parties." },
  /* Assignment 09 — Disclosures and property-condition risk */
  { source: { assignment: "assignment-09", section: "1.6" },
    prompt: "A property is being sold by a trustee who has never entered it. What follows for the disclosures?",
    choices: [
      "The obligation is about known facts, so 'unknown' will be the honest answer to much of it — and the licensee's own inspection disclosure carries correspondingly more weight.",
      "The disclosure obligation does not apply to a trustee.",
      "The trustee must have the property inspected to complete the form.",
      "The licensee should complete the form from the property records."
    ],
    correctChoice: 0,
    rationale: "Whether a particular transfer is exempt from a particular requirement is a legal question, and an exemption from one requirement is not a general release. The licensee never completes the seller's disclosure." },
  { source: { assignment: "assignment-09", section: "3.1" },
    prompt: "What does the natural hazard disclosure convey?",
    choices: [
      "Whether the property falls within mapped zones, based on maps at a scale with approximate boundaries that are revised over time.",
      "Whether the property has ever suffered damage from a natural hazard.",
      "Whether the property is insurable against the hazards identified.",
      "Whether the seller is required to remediate any hazard identified."
    ],
    correctChoice: 0,
    rationale: "It reports mapped status, not history, insurability, or a remediation obligation — and 'not in a zone' is not a statement that no risk exists." },
  { source: { assignment: "assignment-09", section: "3.7" },
    prompt: "What practical instruction follows from a hazard report identifying a fire severity zone?",
    choices: [
      "Tell the buyer to obtain insurance quotes early, before the contingency period runs, and record that the recommendation was made.",
      "Tell the buyer that coverage is available at standard rates within mapped zones.",
      "Tell the buyer the seller must complete defensible space work before closing.",
      "Tell the buyer the designation will be removed if no fire occurs within five years."
    ],
    correctChoice: 0,
    rationale: "Insurance availability and cost is the practical consequence and it surprises buyers late. The other statements assert requirements and outcomes that do not follow from the designation." },
  { source: { assignment: "assignment-09", section: "4.2" },
    prompt: "What distinguishes a material fact from a stigma question?",
    choices: [
      "A material fact affects value or desirability and is disclosed; some historical or reputational matters are governed by specific rules that limit or prohibit what may be said.",
      "A material fact is physical and a stigma is anything non-physical, which never requires disclosure.",
      "A material fact must be disclosed only if the buyer asks about it.",
      "A stigma must always be disclosed if the licensee is aware of it."
    ],
    correctChoice: 0,
    rationale: "The category is governed by specific California rules with boundaries, and some inquiries touch protected characteristics where an answer is prohibited. It is a question for the broker before anything is said." },
  { source: { assignment: "assignment-09", section: "4.4" },
    prompt: "A neighbor tells the listing agent that the house 'had a mold problem years ago.' What should the agent do with the information?",
    choices: [
      "Treat it as unverified, raise it with the seller and the broker, and not repeat it as fact to a buyer.",
      "Include it in the marketing description as a disclosed condition.",
      "Ignore it, since a neighbor is not a party to the transaction.",
      "Tell buyers that the property is reported to have had mold."
    ],
    correctChoice: 0,
    rationale: "Unverified information is not represented as fact, and it is not simply discarded either — it is raised with the seller and the broker." },
  { source: { assignment: "assignment-09", section: "6.2" },
    prompt: "Which disclosure failure is worse: content that is incomplete, or delivery that is late?",
    choices: [
      "Both are serious, but late delivery is the one that defeats the protection entirely, because a decision was made without the information.",
      "Incomplete content, because it can never be corrected.",
      "Late delivery, because it voids the purchase agreement.",
      "Neither, provided the buyer signs an acknowledgment before closing."
    ],
    correctChoice: 0,
    rationale: "Incomplete content can be amended; a decision already made cannot be un-made. Late delivery does not void the agreement, and an acknowledgment does not restore the lost opportunity." },
  { source: { assignment: "assignment-10", section: "1.2" },
    prompt: "Which describes the strongest of the three levels of lender assessment?",
    choices: [
      "An underwritten approval, where a person has reviewed verified documentation, as distinct from a prequalification based on stated information.",
      "A prequalification, because it is issued fastest and reflects current conditions.",
      "A rate quote, because it commits the lender to specific terms.",
      "A credit report, because it is the objective element of the file."
    ],
    correctChoice: 0,
    rationale: "The levels differ by what was actually verified and by whom. A rate quote commits nothing about qualification and a credit report is one input." },
  { source: { assignment: "assignment-10", section: "3.2" },
    prompt: "Why does a buyer's disclosure review period matter to the transaction as a whole?",
    choices: [
      "Certain changes restart waiting periods, which can move the closing date, so a change requested late has consequences the buyer should know before he decides.",
      "The lender may not order the appraisal until the review period ends.",
      "The seller may cancel if the buyer does not complete the review promptly.",
      "Escrow cannot open until the review period has run."
    ],
    correctChoice: 0,
    rationale: "A borrower who learns after the fact that his own request delayed closing by a week has been surprised by his own decision, which is the outcome the regime exists to prevent." },
  { source: { assignment: "assignment-10", section: "3.4" },
    prompt: "Which action by a licensee is prohibited when a buyer asks about his loan documents?",
    choices: [
      "Comparing the terms of two loan offers and identifying which is better for the buyer.",
      "Explaining what the closing timeline is and which deadlines depend on the lender.",
      "Telling the buyer to ask his lender for the worst-case payment on an adjustable product.",
      "Recording in the file what the buyer was told and when."
    ],
    correctChoice: 0,
    rationale: "Comparing loan offers is the lender's work. Explaining timelines, directing the buyer to ask the right question, and documenting are all within scope." },
  { source: { assignment: "assignment-10", section: "4.5" },
    prompt: "Underwriting issues a condition requiring documentation of a large deposit. What is the licensee's role?",
    choices: [
      "Route it to the lender and the borrower, and never draft the borrower's explanation or advise how the funds should be characterized.",
      "Draft the explanation for the borrower's signature to keep the file moving.",
      "Advise the borrower to return the funds and re-deposit them later.",
      "Tell the borrower the condition is routine and can be satisfied at closing."
    ],
    correctChoice: 0,
    rationale: "The condition asks where the money came from, and the answer is source documents plus the borrower's own words. Drafting it, advising on seasoning, and minimizing it are all improper." },
  { source: { assignment: "assignment-10", section: "5.4" },
    prompt: "A buyer requests repairs; the seller proposes a credit instead. What should the licensee explain?",
    choices: [
      "That the two are different in effect — a credit leaves the work undone and the condition unchanged, and lender limits may apply to credits.",
      "That a credit is always preferable because the buyer controls the work.",
      "That a repair is always preferable because the property is delivered complete.",
      "That the choice is purely a matter of the parties' convenience."
    ],
    correctChoice: 0,
    rationale: "Which is better depends on the buyer's circumstances and on constraints outside the parties' control, so the licensee explains the difference rather than recommending one." },
  { source: { assignment: "assignment-10", section: "6.3" },
    prompt: "Which is an early warning sign that a financing contingency is at risk?",
    choices: [
      "The lender stops giving specific answers about outstanding conditions and timelines.",
      "The buyer asks for a copy of the appraisal.",
      "The appraisal is ordered later than the licensee expected but is completed on time.",
      "The buyer changes his mind about a repair request."
    ],
    correctChoice: 0,
    rationale: "\"We should be fine\" is what a loan officer under pressure says. Vagueness about named conditions and dates is the signal worth acting on early." },
  /* Assignment 11 — Escrow, title, closing, and possession */
  { source: { assignment: "assignment-11", section: "2.2" },
    prompt: "What does an exception in a preliminary report mean?",
    choices: [
      "A matter that will not be covered by the policy, which the buyer should understand before he relies on the coverage.",
      "A condition the title company will require to be cleared before closing.",
      "A defect that renders title uninsurable.",
      "An item the seller has agreed to remove."
    ],
    correctChoice: 0,
    rationale: "Exceptions are matters outside coverage; requirements are conditions to issuance. Confusing the two produces a file surprised at title clearance." },
  { source: { assignment: "assignment-11", section: "2.5" },
    prompt: "What does an owner's policy of title insurance do?",
    choices: [
      "Insures the owner's interest against covered title matters, subject to its exceptions and exclusions.",
      "Guarantees that the property has no undisclosed physical defects.",
      "Replaces the need for a survey by insuring the boundaries as fenced.",
      "Insures the lender's security interest for the life of the loan."
    ],
    correctChoice: 0,
    rationale: "It insures title, not condition, and standard coverage generally does not perform a survey's function. The lender's interest is covered by a separate policy." },
  { source: { assignment: "assignment-11", section: "3.3" },
    prompt: "Why is the insurance track worth managing separately during escrow?",
    choices: [
      "Coverage must be bound before closing and, in some California markets, availability itself is uncertain — which is discovered late if nobody asks early.",
      "Because the lender selects the carrier and the buyer cannot influence it.",
      "Because escrow will not open until a policy is in force.",
      "Because the seller's existing policy transfers to the buyer at closing."
    ],
    correctChoice: 0,
    rationale: "Insurance is the item most often assumed and least often confirmed, and a policy does not transfer with the property." },
  { source: { assignment: "assignment-11", section: "4.2" },
    prompt: "What is the purpose of the final verification of condition?",
    choices: [
      "To confirm the property is in the condition the agreement requires, that agreed repairs were made, and that nothing has changed since the buyer's investigation.",
      "To give the buyer a final opportunity to renegotiate price.",
      "To confirm the seller has vacated, which is the only issue it addresses.",
      "To satisfy the lender's funding conditions."
    ],
    correctChoice: 0,
    rationale: "It verifies condition against the agreement. It is neither a renegotiation opportunity nor limited to occupancy, and it is not a lender requirement." },
  { source: { assignment: "assignment-11", section: "5.4" },
    prompt: "What does a complete transfer of control at closing include?",
    choices: [
      "Every point of access — keys, gate and garage remotes, alarm codes, mailbox, and any keyed outbuilding — not simply the front door key.",
      "The front door key, with other access provided on request.",
      "Whatever the seller happens to leave on the counter.",
      "Access codes only, since physical keys are the buyer's to replace."
    ],
    correctChoice: 0,
    rationale: "\"Keys\" means every point of access, which is why the week-one call about a gate nobody could open is a transfer that was incomplete." },
  { source: { assignment: "assignment-11", section: "6.7" },
    prompt: "A former client asks the licensee to explain the tax treatment of his sale. What is the correct response?",
    choices: [
      "Refer him to a tax advisor, without a general summary — the categories outside a licensee's competence during the transaction are still outside it afterward.",
      "Explain the general rules, since the transaction has closed and no advice is being given about it.",
      "Provide the closing statement and explain which figures are taxable.",
      "Decline and provide nothing further."
    ],
    correctChoice: 0,
    rationale: "The pressure to answer is higher because the relationship is warmer, but the boundary has not moved. Documents are provided; the tax analysis is not." },
  /* Assignment 12 — Property management and leasing practice */
  { source: { assignment: "assignment-12", section: "1.3" },
    prompt: "Why is an unsigned management agreement a structural defect rather than a paperwork gap?",
    choices: [
      "Everything the manager does rests on authority the agreement confers, so without it the scope of authority, the spending limits, and the fee are all unestablished.",
      "Because the owner may refuse to pay for services rendered.",
      "Because the listing service will not accept the property.",
      "Because an unsigned agreement makes the manager a tenant at will."
    ],
    correctChoice: 0,
    rationale: "The agreement is the source of authority. A manager acting without it cannot say what he was authorized to do, which is the question every later dispute asks." },
  { source: { assignment: "assignment-12", section: "1.4" },
    prompt: "A habitability item requires immediate replacement exceeding the manager's spending authority and the owner cannot be reached. What governs?",
    choices: [
      "The agreement's emergency provision — which is why defining what an emergency is, and up to what amount, belongs in the agreement rather than in the moment.",
      "The manager's judgment, which is unlimited where habitability is involved.",
      "The tenant's instruction, since the tenant occupies the unit.",
      "The manager must wait for the owner regardless of the condition."
    ],
    correctChoice: 0,
    rationale: "An emergency provision with no figure and no definition is a provision that will be argued about — after the money is spent." },
  { source: { assignment: "assignment-12", section: "2.3" },
    prompt: "How should an occupancy standard be set?",
    choices: [
      "By a neutral, reasonable standard applied uniformly, recognizing that a restrictive standard can operate as familial status discrimination.",
      "By the owner's preference about how many people should live in the unit.",
      "By one person per bedroom, which is the safe universal rule.",
      "By whatever the local fire code permits, applied case by case."
    ],
    correctChoice: 0,
    rationale: "An unreasonably restrictive occupancy limit operates against households with children. There is no universal safe number, and the owner's preference is not the standard." },
  { source: { assignment: "assignment-12", section: "2.4" },
    prompt: "An applicant intends to pay part of the rent with a housing subsidy. What does California law require?",
    choices: [
      "The subsidy may not be the basis for refusal — source of income is a protected characteristic in California.",
      "The applicant may be refused if the owner does not wish to participate in the program.",
      "The applicant must meet an income standard measured against the full rent without counting the subsidy.",
      "The applicant may be charged a higher deposit to offset administrative burden."
    ],
    correctChoice: 0,
    rationale: "Source of income is protected in California, and applying an income standard that ignores the subsidy, or charging more, are ways of refusing on the same basis." },
  { source: { assignment: "assignment-12", section: "3.4" },
    prompt: "A trust account shows an overage that cannot be attributed to any beneficiary. What is the correct treatment?",
    choices: [
      "It remains trust funds and is researched and handled under the applicable framework — it does not become brokerage income over time.",
      "It is transferred to the operating account after a reasonable period.",
      "It is distributed pro rata among the current beneficiaries.",
      "It is applied against any shortage elsewhere in the account."
    ],
    correctChoice: 0,
    rationale: "An overage is not the broker's money, and using it to offset a shortage uses one person's funds for another's benefit." },
  { source: { assignment: "assignment-12", section: "4.1" },
    prompt: "Which item is a habitability matter rather than a convenience repair?",
    choices: [
      "No hot water.",
      "A dripping faucet.",
      "A cabinet door that will not close.",
      "A worn carpet in a bedroom."
    ],
    correctChoice: 0,
    rationale: "Habitability items drive triage priority. The others are logged, scheduled, and communicated — an unanswered minor request teaches a tenant that reports produce nothing." },
  { source: { assignment: "assignment-13", section: "1.6" },
    prompt: "Which pressure most reliably precedes a licensee's misstatement?",
    choices: [
      "A transaction about to fail, or an error already made that the next statement would cover.",
      "A client who asks too many questions.",
      "A competing brokerage marketing aggressively in the same area.",
      "A listing service policy the licensee disagrees with."
    ],
    correctChoice: 0,
    rationale: "The first six pressures produce misstatements about the transaction; the covering statement produces a misstatement about the licensee, and that is the one that ends careers." },
  { source: { assignment: "assignment-13", section: "2.3" },
    prompt: "A licensee is told informally to do something the written office policy prohibits. What is the correct response?",
    choices: [
      "Treat the conflict as a question to raise, since an informal practice does not amend a written policy and following it exposes him under both.",
      "Follow the informal practice, since it reflects how the office actually operates.",
      "Follow the written policy silently and say nothing about the instruction.",
      "Follow whichever the client would prefer."
    ],
    correctChoice: 0,
    rationale: "A licensee following the informal version is exposed on both, and silence leaves the conflict in place for the next transaction." },
  { source: { assignment: "assignment-13", section: "2.6" },
    prompt: "A licensee notices that the other brokerage's contingency removal in the file is undated. What should he do?",
    choices: [
      "Raise it directly and promptly with the fact rather than a characterization, and escalate to his broker if it is not corrected or it affects his client's rights.",
      "Correct the document himself so the file is complete.",
      "Say nothing, since it is the other brokerage's document.",
      "Raise it only if his client is later disadvantaged by it."
    ],
    correctChoice: 0,
    rationale: "A licensee never fixes another party's document, and a defect he saw and said nothing about becomes his once the record shows he knew." },
  { source: { assignment: "assignment-13", section: "4.6" },
    prompt: "Why should a licensee keep a practice-wide conflicts inventory?",
    choices: [
      "Because the arrangements that get missed are the ones that grew gradually and now feel like background.",
      "Because the Department requires an annual filing of vendor relationships.",
      "Because clients are entitled to a list of the licensee's business relationships.",
      "Because the brokerage's insurer requires it as a condition of coverage."
    ],
    correctChoice: 0,
    rationale: "A vendor who bought lunch twice and now sponsors a monthly event is a different relationship, and nobody made a decision to change it." },
  { source: { assignment: "assignment-13", section: "5.4" },
    prompt: "A regulator contacts a licensee directly about a transaction. What is the correct step?",
    choices: [
      "Notify the broker immediately, preserve everything, and respond with the broker and, where appropriate, counsel.",
      "Answer fully and immediately to demonstrate cooperation.",
      "Decline to communicate until served with a formal accusation.",
      "Refer the regulator to the other party's brokerage."
    ],
    correctChoice: 0,
    rationale: "The process is largely documentary and the first response matters most. An improvised personal answer and a refusal to engage are both wrong." },
  { source: { assignment: "assignment-13", section: "6.4" },
    prompt: "Which situation must be escalated to the broker rather than handled by the licensee?",
    choices: [
      "Anything that sounds like a claim, any suspected fraud, and any instruction the licensee believes is unlawful.",
      "Any client question the licensee cannot answer immediately.",
      "Any request from the other brokerage for an extension.",
      "Any inspection report identifying more than ten items."
    ],
    correctChoice: 0,
    rationale: "Claims, suspected fraud, and unlawful instructions are brokerage matters from the first minute. Routine transaction questions are not." },
  /* Assignment 14 — Implicit bias and fair housing participatory practicum */
  { source: { assignment: "assignment-14", section: "1.4" },
    prompt: "Why is systemic bias not simply the sum of individual bias?",
    choices: [
      "Structures — inherited networks, lead sources, referral composition, encoded criteria — produce unequal outcomes without any individual holding a discriminatory belief.",
      "Because systemic bias is unlawful while individual bias is not.",
      "Because systemic bias affects only institutions that make lending decisions.",
      "Because individual bias is always conscious and therefore correctable."
    ],
    correctChoice: 0,
    rationale: "This is why the professional answer is structure rather than sincerity: the mechanisms operate whether or not anyone is thinking about them." },
  { source: { assignment: "assignment-14", section: "1.3" },
    prompt: "Where does implicit bias most often operate in a licensee's day?",
    choices: [
      "In the distribution of information, effort, follow-up, and attention — decisions made quickly and never recorded as decisions.",
      "In the decision to accept or reject a written offer.",
      "In the preparation of the closing statement.",
      "In the selection of the escrow holder."
    ],
    correctChoice: 0,
    rationale: "Only a small share of what produces unequal service is a refusal. The rest is distribution, which is why 'I never refused anyone' answers a question nobody asked." },
  { source: { assignment: "assignment-14", section: "3.2" },
    prompt: "Which is an interruption practice rather than an intention?",
    choices: [
      "Using the same information script for every inquiry and logging every one.",
      "Committing to treat every client equally.",
      "Reviewing fair housing law annually.",
      "Being alert to one's own assumptions during showings."
    ],
    correctChoice: 0,
    rationale: "A practice happens whether or not the licensee is thinking about it. Commitment, review, and alertness all depend on attention on the day it is needed." },
  { source: { assignment: "assignment-14", section: "3.4" },
    prompt: "A client makes a remark about the composition of a neighborhood during a showing. What is the professional response?",
    choices: [
      "Say plainly that you do not characterize neighborhoods and point to the public sources, in the moment rather than afterward.",
      "Change the subject to avoid an uncomfortable exchange.",
      "Agree noncommittally and move on, since the client is not the licensee.",
      "Report the client to the broker without saying anything to him."
    ],
    correctChoice: 0,
    rationale: "The scripts exist because the gap between knowing what to say and having said it is the entire distance. Silence reads as agreement." },
  /* Assignment 14 topic 5 — the SB 1495 participatory practicum, licensee role. Added by the coverage gate. */
  { source: { assignment: "assignment-14", section: "5.2" },
    prompt: "During a showing a client asks, sincerely and in person, what the neighbors are like and which schools would be right for their children, adding that they trust the licensee's judgment more than a website. What does the licensee position in the practicum require of the answer?",
    choices: [
      "Declining the parts that cannot be answered, offering the sources the client can consult for themselves, and doing so in words that are neither evasive nor unhelpful.",
      "Answering fully, because the client asked directly and a refusal would breach the duty of loyalty owed to a client.",
      "Ending the showing and referring the client elsewhere, since the subject has now been raised in the licensee's presence.",
      "Answering off the record if the client presses, so long as nothing about the exchange is written into the file."
    ],
    correctChoice: 0,
    rationale: "The exercise asks for the actual words, because the difficulty is not knowing the rule but declining without appearing unhelpful to a client who is sincere and trusting. What the licensee offers instead of the answer is the substance of the response; \"off the record\" is not available, and neither refusing to engage nor answering fully is the professional course." },
  { source: { assignment: "assignment-14", section: "6.2" },
    prompt: "What makes a fair housing action plan real rather than a document?",
    choices: [
      "It names practices that happen on a schedule, produces a record even when nothing is wrong, and states in advance what happens when a review finds something.",
      "It is signed by every licensee in the brokerage.",
      "It restates the protected characteristics under federal and California law.",
      "It is reviewed by counsel before adoption."
    ],
    correctChoice: 0,
    rationale: "A plan that depends on remembering fails on the day it matters, and one that generates documents only when there is a problem creates an incentive not to find one." },
  /* Assignment 15 — Integrated California residential transaction */
  { source: { assignment: "assignment-15", section: "1.2" },
    prompt: "Which intake question most often determines whether a listing can proceed at all?",
    choices: [
      "How title is currently held and who must sign to convey, answered from the documents.",
      "What price the seller has in mind.",
      "When the seller would like to close.",
      "Whether the seller has interviewed other brokerages."
    ],
    correctChoice: 0,
    rationale: "Authority is established from documents rather than description, and it is cheap at intake and expensive at title clearance with a buyer's deadlines running." },
  { source: { assignment: "assignment-15", section: "2.3" },
    prompt: "When does the disclosure work begin in a listing?",
    choices: [
      "At the listing stage, while there is no deadline pressure — not when an offer arrives.",
      "When the buyer's investigation period opens.",
      "When escrow is opened and the file is assembled.",
      "When the buyer requests the disclosure package."
    ],
    correctChoice: 0,
    rationale: "Deferring compresses the buyer's review period and creates pressure at exactly the wrong moment, which is why the timing is not a negotiable business term." },
  { source: { assignment: "assignment-15", section: "3.3" },
    prompt: "In a multiple offer situation, what belongs to the client and what belongs to the licensee?",
    choices: [
      "The terms and the decision are the client's; the analysis and the advice are the licensee's.",
      "Both belong to the client, and the licensee only transmits.",
      "Both belong to the licensee, who is engaged for his judgment.",
      "The decision is the client's and the analysis belongs to the brokerage's manager."
    ],
    correctChoice: 0,
    rationale: "Withholding the analysis and substituting the licensee's judgment are opposite failures of the same division." },
  { source: { assignment: "assignment-15", section: "4.5" },
    prompt: "A buyer removes his investigation contingency without obtaining a specialist evaluation the general inspection recommended. What should the file show?",
    choices: [
      "The written recommendation that preceded the removal and the buyer's decision, recorded in his words where possible.",
      "A statement by the licensee that the evaluation was unnecessary.",
      "An indemnity from the buyer releasing the brokerage.",
      "Nothing, since the removal is the buyer's decision alone."
    ],
    correctChoice: 0,
    rationale: "The licensee does not talk the buyer out of the decision and does not pretend it was not made. An indemnity is not what the file needs." },
  { source: { assignment: "assignment-15", section: "5.2" },
    prompt: "A preliminary report reveals a recorded notice of a pending action affecting the property. What is the correct handling?",
    choices: [
      "Escalate to the broker and the title officer immediately, because it can reach insurability and financing as well as cost.",
      "Treat it as an ordinary exception the buyer accepts with the rest.",
      "Explain to the buyer what the action is likely to be about.",
      "Ask escrow to have it removed before closing."
    ],
    correctChoice: 0,
    rationale: "It is the item on a report most likely to affect whether the transaction can close at all, and characterizing the underlying dispute is not the licensee's to do." },
  { source: { assignment: "assignment-15", section: "6.2" },
    prompt: "What is the standard a closed file is audited against?",
    choices: [
      "Reconstructability — could a person who was not present determine what happened, when, and on what basis.",
      "Completeness of the brokerage's own checklist.",
      "Whether the transaction closed without a complaint.",
      "Whether every document bears an original signature."
    ],
    correctChoice: 0,
    rationale: "Every retention rule, dating requirement, and delivery obligation serves that one standard, and no amount of accurate recollection substitutes." },
  { source: { assignment: "assignment-15", section: "5.4" },
    prompt: "What must never be assumed about wire instructions in the closing week?",
    choices: [
      "That instructions arriving in a familiar email thread are genuine — verification runs by voice through an independently obtained number.",
      "That the buyer knows how much to bring to closing.",
      "That escrow has received the lender's funding package.",
      "That the seller has scheduled his move."
    ],
    correctChoice: 0,
    rationale: "The attack is timed to when funds are expected and arrives from a near-identical address inside a thread that looks familiar." },
  /* Integrative items — each answer requires material from more than one assignment */
  { source: { assignment: "assignment-11", section: "1.6" },
    crossReferences: [{ assignment: "assignment-10", section: "5.7" }],
    prompt: "A seller credit negotiated in an amendment does not appear on the estimated closing statement. What happened, and what is the fix?",
    choices: [
      "The amendment never reached escrow; transmit it with the supporting document attached and confirm receipt, rather than telephoning that the figure is wrong.",
      "Escrow made an arithmetic error and will correct it before closing.",
      "The credit was disallowed by the lender and must be renegotiated as a repair.",
      "The statement is an estimate, so the credit will appear on the final version automatically."
    ],
    correctChoice: 0,
    rationale: "Escrow performs the instructions it holds. A call reporting that a figure is wrong, without the amendment, produces a delay rather than a correction." },
  { source: { assignment: "assignment-09", section: "5.4" },
    crossReferences: [{ assignment: "assignment-08", section: "4.3" }],
    prompt: "A disclosure amendment is delivered two days after the buyer removed his investigation contingency. What is the correct sequence of steps?",
    choices: [
      "Raise it with both brokers immediately, tell the buyer what the amendment says and when it reached him, and treat whether his rights are affected as a legal question.",
      "Proceed to closing, since the contingency was removed before the amendment arrived.",
      "Obtain the buyer's written statement that the amendment does not change his decision.",
      "Treat the amendment as informational because the period has closed."
    ],
    correctChoice: 0,
    rationale: "Rights running from delivery are not extinguished by the buyer having acted earlier without the information, and asking him to waive the point substitutes the licensee's judgment for his." },
  { source: { assignment: "assignment-06", section: "5.2" },
    crossReferences: [{ assignment: "assignment-14", section: "1.5" }],
    prompt: "Why is a uniform showing and inquiry procedure a fair access control as well as a security control?",
    choices: [
      "Because a procedure relaxed for visitors the licensee knows produces unequal treatment that nobody decided and a record that cannot answer the question later.",
      "Because fair housing law requires identical scheduling for all showings.",
      "Because the listing service audits showing records for uniformity.",
      "Because a uniform procedure eliminates the need to document individual showings."
    ],
    correctChoice: 0,
    rationale: "Distribution of access, information, and follow-up is where unequal service lives, and structure operates on the day attention does not." },
  { source: { assignment: "assignment-13", section: "3.4" },
    crossReferences: [{ assignment: "assignment-10", section: "2.4" }],
    prompt: "A buyer's file states owner occupancy and also contains a lease for the same property signed by the buyer as landlord, dated before the application. What is this?",
    choices: [
      "A contradiction within the file on a material representation, which is escalated rather than resolved by asking the buyer to explain it away.",
      "An ambiguity to clarify with the buyer before deciding whether it matters.",
      "A private matter between the buyer and his lender.",
      "A clerical inconsistency that the lender's underwriting will catch."
    ],
    correctChoice: 0,
    rationale: "Where the file contradicts itself on a material point, the response is escalation. Resolving it himself is how a person who was not part of a fraud becomes part of one." },
  { source: { assignment: "assignment-04", section: "3.5" },
    crossReferences: [{ assignment: "assignment-05", section: "6.6" }],
    prompt: "Why is the seller's pricing decision documented, including where it departed from the recommendation?",
    choices: [
      "Because a later negligence claim about the price is answered by what the file shows the seller was told and chose.",
      "Because the listing service requires a record of the price rationale.",
      "Because the brokerage's commission depends on the recommended price.",
      "Because the seller may not change the price after listing without a documented reason."
    ],
    correctChoice: 0,
    rationale: "If the seller listed below the recommendation, that document ends the claim; if he listed at it, the claim is about the recommendation and the reasoning is the answer." },
  { source: { assignment: "assignment-01", section: "6.6" },
    crossReferences: [{ assignment: "assignment-15", section: "6.4" }],
    prompt: "A post-closing audit finds that a required disclosure has no evidence of delivery. Which response is prohibited?",
    choices: [
      "Asking the buyer to sign a receipt dated as of the original delivery.",
      "Recording the finding and escalating it to the broker.",
      "Searching the licensee's own sent items for a transmission record.",
      "Adding a memorandum dated today describing what the file does and does not show."
    ],
    correctChoice: 0,
    rationale: "Back-dating a receipt through the buyer's hand is the same act performed by a different hand. A documented gap is survivable; a manufactured record is not." },
  { source: { assignment: "assignment-07", section: "1.5" },
    crossReferences: [{ assignment: "assignment-03", section: "1.6" }],
    prompt: "What must a licensee avoid doing at a buyer consultation before any agency disclosure has been delivered?",
    choices: [
      "Giving advice that would lead a reasonable person to believe he is being represented, since agency can arise from conduct.",
      "Asking the buyer about his timeline and financial readiness.",
      "Explaining how buyer representation and compensation work.",
      "Describing the process from search through closing."
    ],
    correctChoice: 0,
    rationale: "The disclosure attaches to the outset of the working relationship precisely because advice given before it is advice given inside an undisclosed relationship." },
  { source: { assignment: "assignment-12", section: "5.5" },
    crossReferences: [{ assignment: "assignment-13", section: "6.4" }],
    prompt: "An owner instructs a property manager to change the locks on a delinquent tenant. What does the manager do?",
    choices: [
      "Decline clearly, say why in terms of what he may lawfully do, offer the lawful notice procedure, confirm it in writing the same day, and escalate to the broker if the owner insists.",
      "Comply, since the owner owns the property and directs its management.",
      "Comply while advising the owner in writing that the action carries risk.",
      "Resign the management engagement without explanation."
    ],
    correctChoice: 0,
    rationale: "Self-help is prohibited and the manager who performs it has done the unlawful act himself. A written warning does not transfer responsibility, and a silent resignation leaves the owner free to do it himself." },
];

export default {
  courseId: "ca-real-estate-practice-45",
  forms: { A: formA, B: formB }
};
