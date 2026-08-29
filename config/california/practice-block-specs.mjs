/**
 * CA-BLOCK rollout — the HAND-AUTHORED pedagogy for Real Estate Practice assignments.
 *
 * Same apparatus as the Mortgage and Principles rollouts (see mortgage-block-specs.mjs for the
 * full design rationale): the generator (scripts/generate-practice-block-maps.mjs) derives every
 * screen range from the frozen lesson's own headings; what it must never invent lives here,
 * written after reading the lesson — each block's learning objective (blocks B1-B6 follow the
 * lesson's six sections; the seventh entry is B7, synthesis), and the mapping of the eight
 * practice problems to the block teaching their concept. Every problem 1-8 must be assigned to
 * exactly one block. Block/screen ids use the "pc" prefix (e.g. "pc1-b3") to stay collision-free
 * with Mortgage's "a" prefix and Principles' "pr" prefix once all three share one registry.
 */

export const PRACTICE_BLOCK_SPECS = {
  1: {
    objectives: [
      "Explain why California licenses real estate activity at all — the consumer information asymmetry it responds to — distinguish the Real Estate Law from the Commissioner's Regulations and place brokerage policy and local custom beneath them, identify the three elements that make an activity require a license, and distinguish a broker's independent authority from a salesperson's derivative authority, including what a salesperson may never do on her own.",
      "Describe what reasonable supervision covers at minimum, explain why delegating a task never delegates the responsibility for it, distinguish independent contractor status as a tax and compensation framework from the separate question of who is responsible for supervising licensed activity, and identify the practical indicators that a supervision system is real as a brokerage grows.",
      "Apply the three-part approach to unfamiliar work — disclose plainly, arrange real supervision, identify specialists early — distinguish activity within a licensee's role from the unauthorized practice of law using the legal-conclusion test, identify the separate boundaries around valuation, property condition, and tax or estate consequences, and state the four-part 'I don't know' formulation as the professional response to a question the licensee cannot answer.",
      "Explain what a working policy set must cover and why a policy is only as real as the conduct it controls, identify the four components of a defensible delegation and explain why monitoring is the one most often missing, explain why a brokerage policy stricter than the law still governs and is not an individual licensee's decision to set aside, and describe what a new licensee should look for when reading a policy manual, including the escalation path and what happens on departure.",
      "Distinguish a verified fact, an unverified report, and a professional opinion in a consumer communication and explain why collapsing those categories is the recurring source of misrepresentation, apply the timeliness and written-confirmation practices including the immediate written correction of an error to everyone who received it, and explain what consumer-first communication does and does not require, including declining certain questions well.",
      "State the reconstructability standard a transaction file must meet, explain why a signature without a delivery date fails to establish that a response period was honored and why superseded drafts are retained rather than discarded, distinguish a documented gap from falsification and state the correct response to a gap found during a post-closing audit, and identify the file-accountability practices a new licensee should install before the first client.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (a salesperson wanting to take listings and advertise under her own trade name) and P8
       (a licensee helping a friend sell a house with no compensation discussed) both turn on §1's
       licensed-activity elements and the salesperson license's derivative nature, so both teach §1.
       P2 (reviewing a signed contract for breach and advising on withholding payment) and P4 (the
       septic-system question, resolved through the four-part "I don't know" formulation) both teach
       §3. P3 (a broker's delegation to an office manager, missing the fourth component) and P5 (an
       office policy stricter than the law's retention requirement) both teach §4's delegation and
       policy-primacy framework. P6 (the wrong square-footage figure requiring immediate written
       correction) teaches §5. P7 (a signed disclosure with no delivery date) teaches §6. §2 (broker
       supervision) has no problem of its own in this assignment's eight-problem set — its core
       principle (delegation transfers the task, never the responsibility) is tested instead through
       P3, which draws on both §2.2's general rule and §4.3's four-component checklist and was judged
       to test §4's more specific framework; §2's active learning check is its retrieval bank. */
    problemMap: { 1: [1, 8], 3: [2, 4], 4: [3, 5], 5: [6], 6: [7] },
  },
  2: {
    objectives: [
      "Build a business plan that works backward from capacity — hours a transaction requires including its compliance work, hours actually available, divided into a transaction count — rather than forward from a volume target, and explain why an unbudgeted revenue-timing gap between first contact and first closing turns a capacity shortfall into pressure to cut corners rather than only a financial problem.",
      "Apply the channel-specific solicitation rules for telephone, text, email, and in-person contact — including do-not-call obligations that bind the caller regardless of a vendor's assurance, the rule that text and email consent is defined by what the consumer was actually told when the information was collected, and the limits of an opt-out mechanism — and state what a defensible contact record must document.",
      "State the licensee and brokerage identification advertising must carry across every channel including social profiles, short video, direct messages, and syndicated listings, and explain why a team name or brand is judged by the impression it creates for a consumer rather than by the brokerage's own organizational chart.",
      "Recognize price fixing, group boycotts, market allocation, and tying, explain why an agreement can be inferred from conduct or from remaining silent in a room rather than requiring a signed document, and state the three-part response — say it aloud, leave the conversation, document it in writing to the broker — required when a competitor raises one.",
      "Apply the access, transmission, and disposal controls that protect a transaction file's sensitive information, and describe the wire fraud pattern together with the one verification step — confirming instructions through a channel the attacker does not control — that defeats it, including why a phone number supplied inside the suspicious message does not qualify.",
      "Explain why transaction records belong to the brokerage rather than the individual licensee, state what a complete records workflow and close-out routine must produce including for transactions that did not close, and distinguish a documented gap, which is survivable, from a falsified record, which ends a career.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (the two-closings-a-month plan with no capacity estimate) teaches §1. P2 (the open-house
       sign-in sheet and marketing text) teaches §2. P5 (the team name displayed more prominently
       than the brokerage) teaches §3. P3 and P4 both teach §4: P3 the required exit from a live
       price-fixing-and-boycott conversation, and P4 the negotiable-compensation script that
       forecloses the antitrust exposure. P6 and P8 both teach §5: P6 the wire-fraud verification
       sequence, and P8 the severity-and-response analysis for a lost, unencrypted device. P7 (the
       departing licensee wanting to take file copies) teaches §6. Every section owns at least one
       problem — no inventory gap in this assignment. */
    problemMap: { 1: [1], 2: [2], 3: [5], 4: [3, 4], 5: [6, 8], 6: [7] },
  },
  3: {
    objectives: [
      "Explain how an agency relationship forms — by express agreement, conduct, or ratification — why the brokerage rather than the individual salesperson is the agent, what a seller's or buyer's agent owes their own client versus a non-client, and how a licensee's ordinary conversation with an unrepresented visitor can create an unintended agency by conduct.",
      "State California's three-step agency disclosure sequence — disclose, elect, confirm — identify when each step must occur for a seller's agent, a buyer's agent, and an agent presenting an offer, and explain why a disclosure delivered after the decision it was meant to inform remains a defect even once it is signed.",
      "Apply each of the six fiduciary duties to a concrete transaction decision, explain the boundary between confidentiality (the negotiating position) and disclosure (a material defect), state the limit obedience places on following only lawful instructions, and explain how reasonable care can be breached, and confidentiality can survive termination, without any dishonesty at all.",
      "Explain what dual agency is and why it belongs to the brokerage rather than the individual salesperson, state what informed written consent from both principals requires, and distinguish what consent authorizes — representation — from what it never authorizes — moving either party's confidential negotiating position to the other.",
      "Distinguish who pays a licensee from whom the licensee represents, identify the categories of conflicts that must be disclosed — including referral fees, bonuses, and vendor relationships — explain why a conflict disclosure must reach the client while they can still act on it, and distinguish the power to terminate an agency from the right to do so without consequence.",
      "Assemble the agency documentation a file needs to show disclosure, election, and confirmation occurred in the correct order and on time, audit a completed file for contradictions, late delivery, and missing consent, and apply the rule that a documented gap is survivable while a manufactured document is falsification.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (agency arising from five weeks of unsigned, unpaid advice) teaches §1's agency-by-conduct
       rule. P4 (a disclosure delivered to the listing side the week after acceptance) teaches §2's
       disclosure-precedes-the-decision timing rule. §3 is this assignment's widest section and draws
       three problems: P2 (the confidentiality-versus-disclosure boundary on a concealed foundation
       repair), P6 (the obedience limit on an unlawful instruction to exclude buyers), and P7
       (confidentiality surviving the end of a listing). P3 (what a dual agent may say about a
       seller's private floor after mutual consent) teaches §4. P5 (the builder bonus that must be
       disclosed before the buyer relies on the advice) teaches §5. P8 (the three-finding agency-
       documentation audit) teaches §6. Every section owns at least one problem — no inventory gap
       in this assignment. */
    problemMap: { 1: [1], 2: [4], 3: [2, 6, 7], 4: [3], 5: [5], 6: [8] },
  },
  4: {
    objectives: [
      "Conduct a property and client intake that establishes authority to convey, what is actually being sold, and what constraints affect the transaction, verify each against a source such as title or the trust or entity's governing documents rather than an occupant's statement or the tax roll, and route an unresolved authority question to the broker or counsel before listing.",
      "Identify the listing agreement as a contract between the seller and the brokerage rather than the individual licensee, explain what each operative provision does and what a change to it means, and apply the amendment discipline — in writing, signed, dated, and retained with the prior version — to any change made after signing, including why a compensation change is a brokerage-level rather than licensee-level decision.",
      "Build a defensible pricing recommendation from closed sales, pending sales, active listings, and adjustments, distinguish the seller's pricing decision from the licensee's advisory obligation, and state and document the consequences the licensee must communicate when a seller prices above the supported range.",
      "Distinguish the seller's non-negotiable disclosure obligations from the negotiable business terms of a listing, apply the materiality standard — effect on a reasonable buyer's decision, not the seller's opinion, a repair's presence, or frequency — to determine what must be disclosed, and complete a disclosure correctly by answering an uncertain item 'unknown' rather than leaving it blank or marking it 'no.'",
      "Design a showing and access protocol that surfaces valuables, medications, occupants, and recording devices during intake, explain why applying that protocol identically to every visitor is simultaneously a security control and a fair housing requirement, and state the licensee's required first response — take it seriously, notify the broker, preserve the log, and do not investigate personally — when something goes missing.",
      "Distinguish expiration, cancellation, and withdrawal as three different mechanisms, explain why releasing a seller from a listing is a broker-level decision governed by the agreement's terms rather than the licensee's judgment or the marketing already spent, and identify the two obligations — confidentiality and the protection clause's own terms — that survive a listing's end.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (verifying who must sign for a house held in a trust, against the trustee's authority
       rather than a beneficiary's belief) teaches §1. P2 (weighing a competing brokerage's price
       opinion built on active, unadjusted listings against closed-sale evidence) teaches §3. P3
       (sorting a seller's four appointment requests into negotiable business terms versus the
       non-negotiable disclosure obligation) and P4 (completing a disclosure honestly, including
       "unknown" rather than a blank or an assumed "no") both teach §4. P5 (the access-and-valuables
       intake conversation before authorizing a lockbox) and P6 (selective supervision at an open
       house as both a security and a fair housing failure) both teach §5. P7 (who decides a
       cancellation request and what governs it) and P8 (the protection clause and the
       confidentiality obligation that survive expiration) both teach §6. §2 (listing agreement
       structure — its operative provisions and the amendment discipline for changing one) has no
       problem of its own in this assignment's eight-problem set; its active learning check is its
       retrieval bank. */
    problemMap: { 1: [1], 3: [2], 4: [3, 4], 5: [5, 6], 6: [7, 8] },
  },
  5: {
    objectives: [
      "Define a defensible market area using behavioral rather than administrative boundaries, select a competitive set of comparables using the characteristics that drive buyer decisions, weigh recency against market movement and data sources by their reliability, and recognize the property types — common interest developments, acreage, unique properties, new construction, deed-restricted housing, and mixed use — where the standard method breaks down and requires a disclosed change in approach, justifying a comparable's inclusion or exclusion in terms of buyer behavior rather than distance.",
      "Apply the rule that adjustments are made to the comparable and never to the subject, construct and read an adjustment grid to determine each adjustment's direction and derive its amount in the correct order of preference, reconcile multiple indicated values into a supported range and most-probable point by weighting for net and gross adjustment size, recency, and similarity rather than averaging, explain why contribution is not cost, and use bracketing and the gross-versus-net distinction to separate a defensible grid from one whose convergence merely restates the analyst's judgment.",
      "Distinguish what closed, pending, and active listing data each prove and do not prove, explain why closed sales are the only direct evidence of price even though they lag a moving market, compute months of supply and read days on market as an independent measure of market direction, describe the stale-listing effect, and account for concessions that separate a sale's recorded price from its true economic price.",
      "Prepare an estimated seller net sheet, explain how price interacts with terms — a closing cost credit, contingency length, and down payment size — to affect the seller's real risk and proceeds beyond the arithmetic, and describe the licensee's limited role of recognizing and routing rather than advising when a net sheet reveals the seller may not have enough equity to complete the sale as contemplated.",
      "State the legal and practical boundary between a comparative market analysis and an appraisal, explain what a licensee may and may not do when a lender's appraisal comes in below the contract price, distinguish supplying an appraiser relevant information from supplying a value target, and identify the three questions — who will rely on the opinion, what is its effective date, and whether the licensee is independent of the outcome — that govern accepting an assignment to value a property for a purpose other than a sale.",
      "Explain what makes a pricing opinion reconstructable and list what the pricing file must contain, sequence a defensible presentation to a seller, describe what the file must show when a seller chooses a price above the recommendation, and explain why a file assembled contemporaneously withstands a later claim while a reconstructed analysis presented as contemporaneous does not.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1's radius-search-versus-behavioral-market critique teaches §1. P2's three-item adjustment-
       direction problem, P3's reconciliation-versus-averaging problem, and P4's contribution-is-not-
       cost recording-studio problem all teach §2. P5's active-listings-mislead reframing and P6's
       months-of-supply computation both teach §3. P7's net-sheet offer comparison teaches §4. P8's
       appraisal-event and appraiser-independence email problem teaches §5. §6 (pricing presentation
       and file support) has no mapped problem — the documented gap; its retrieval check is its
       active learning. */
    problemMap: { 1: [1], 2: [2, 3, 4], 3: [5, 6], 4: [7], 5: [8] },
  },
  6: {
    objectives: [
      "Evaluate advertising copy and photographs against the truthfulness standard — measured against the property as it is when the advertisement runs, not as photographed or as the seller described it — by naming the required source for each factual claim, distinguishing opinion from a factual claim about value, entitlement, or feasibility, and applying the four-category framework for advertising a property with a physical, permitting, title, or stigma-related problem.",
      "Apply California's licensee and brokerage identification requirements to print, digital, team, and social media advertising, identify what is missing from a given social media post, and explain why audience targeting choices are part of the advertisement itself rather than separate from it.",
      "Distinguish advertising copy that describes the property from copy that sorts the people who should live in it, rewrite discriminatory phrases into more informative property-focused copy, and explain why California's protected characteristics exceed the federal baseline and why an equal housing statement does not cure discriminatory content.",
      "Classify a request as a reasonable accommodation (a change to a rule, policy, practice, or service) or a reasonable modification (a change to the physical premises), apply the correct standard and cost allocation to each, and identify what a provider may and may not ask when verifying a disability-related need.",
      "Design an open house, showing, or tenant-access protocol that satisfies security, fair access, and personal safety at once, and explain why applying a safety or qualifying practice selectively rather than uniformly creates a fair housing exposure.",
      "Operate an advertising approval and archive process — a named approver, defined turnaround, checklist, and record of approval — that can reconstruct months later exactly what ran, where, when, and with whose approval, and apply the correction procedure, including client notification and process review, when advertising is found to be inaccurate.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1's four-defect listing-description analysis (unverified square footage, an unpermitted-egress
       "bedroom," the seller's unverified permit claim, and the "room for a pool" feasibility claim)
       and P2's photograph classification (stale post-storm images, digital alteration removing a
       power line, labeled virtual staging) both teach §1. P3's Instagram audience-targeting/
       identification ranking and P4's team-name prominence question both teach §2. P5's fair-housing
       rewrite-and-justify exercise teaches §3. P6's assistance-animal/grab-bar classification and the
       four scored errors in the manager's reply teach §4. P7's open-house accompaniment, qualifying-
       question, and selective-safety-practice exposures teach §5. P8's quarterly-audit ranking and
       response (identification, fair housing, status accuracy, and the archive gap) teaches §6.
       Every section owns at least one problem, and every problem 1-8 is assigned to exactly one
       section — no inventory gap in this assignment. */
    problemMap: { 1: [1, 2], 2: [3, 4], 3: [5], 4: [6], 5: [7], 6: [8] },
  },
};
