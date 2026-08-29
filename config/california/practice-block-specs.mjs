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
  7: {
    objectives: [
      "Conduct a buyer consultation that establishes objectives, constraints, financial position, decision process, and expectations about the sequence before any property is shown, explain why the agency disclosure belongs at the consultation rather than at the point an offer is written, and take a buyer's stated criterion, identify the purpose behind it, and explain how knowing the purpose changes which properties you would show.",
      "Explain what a buyer representation agreement does and its status as a contract between the buyer and the brokerage rather than the individual licensee, state each operative term including exclusivity and compensation mechanics, explain why the source of payment does not determine representation, and distinguish the optional business decision to require a signed agreement before showing property from the non-optional agency disclosure.",
      "Distinguish prequalification, preapproval, and loan commitment by what each establishes and does not establish, read a preapproval letter for what was verified, what conditions remain, and its expiration, apply the three numbers — what the buyer can borrow, what cash is available, and what the buyer is willing to spend — to drive the search rather than the lender's maximum, and route mid-search changes in a buyer's financial position, such as new debt, a job change, or moved or gifted funds, to the lender without evaluating them personally.",
      "Build a property search driven by the buyer's stated criteria rather than the licensee's own judgment, recognize steering in its direct and subtle forms including assumed suitability, curated balance, differential effort, and differential enthusiasm, and respond to a buyer's neighborhood, safety, or school question by declining to characterize, giving an honest reason, and pointing to a source the buyer can use himself.",
      "Advise a buyer on investigation matched to a property's specific features, perform and record the licensee's own bounded and independent visual inspection of accessible areas, respond to a buyer's request to evaluate an inspection finding by referring rather than characterizing it, and document a buyer's informed decision to waive an inspection contingency without either refusing to write the offer or writing it without comment.",
      "Construct an offer strategy addressing price, deposit, financing terms, contingencies, closing date, concessions, and personal property, explain why a closing cost credit is not a price reduction for appraisal purposes, explain what sellers weigh beyond price including probability of closing, and document that an offer's terms — accepted or not — were the buyer's informed decision.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (a stated three-bedroom criterion and a sixty-day timeline that conceal an accessibility
       purpose and an inflexible lease) teaches §1's purpose-behind-the-criterion rule. P2 (a
       representation agreement misrepresented as legally required, with exclusivity never explained)
       teaches §2. P3 (an unverified, expired preapproval letter, a comfortable payment below the
       lender's maximum, and unconfirmed family assistance) teaches §3. P4 and P5 both teach §4: P4 the
       refuse-then-redirect double failure on neighborhood, safety, and school questions, and P5 the
       assumed-suitability, differential-effort, and differential-enthusiasm forms of steering. P6 and
       P7 both teach §5: P6 the property-matched investigation list and the correct response to an
       inspection-finding question, and P7 the correct middle path — from Section 5.6's waiver
       discipline — between refusing to write a waived-contingency offer and writing it without comment.
       P8 (the appraisal exposure of a closing-cost credit and the probability-of-closing factors a
       seller weighs beyond price) teaches §6. Every section owns at least one problem, and every
       problem 1-8 is assigned to exactly one section — no inventory gap in this assignment. */
    problemMap: { 1: [1], 2: [2], 3: [3], 4: [4, 5], 5: [6, 7], 6: [8] },
  },
  8: {
    objectives: [
      "Identify the functional components a California residential purchase agreement must address rather than a form's paragraph numbers, explain the deposit's two functions and when it stops being freely recoverable, state the constraint on liquidated damages, explain why naming disputed items of personal property avoids relying on the fixture tests after the fact, and apply the habit of walking through the agreement's unstated assumptions — what conveys, possession, and anything discussed but not written — before an offer is written.",
      "Apply the three formation rules — an offer accepted without change forms a contract, an acceptance must match the offer, and acceptance must be communicated — explain why a counteroffer rejects and substitutes the original offer rather than suspending it, why a signed document returned with a change written on it is a further counteroffer however small the change, state that an offer may generally be revoked before acceptance even where it states a deadline, and explain why delivery of an electronically signed document must still be evidenced under the contract's own notice provisions.",
      "State the three rules governing multiple offers — the seller chooses, there is no priority by order of receipt, and disclosure of competing terms is the seller's decision — explain the hazard of countering more than one offer at once and the seller's final-election protection against it, distinguish a permissible refusal to disclose competing terms from a misrepresentation of their existence in either direction, and explain why a client's instruction cannot authorize a misrepresentation.",
      "Define a contingency as a condition on an already-formed contract's obligations rather than a delay of formation or a general right to cancel, state that under the standard California form a contingency remains in effect until removed in writing and identify the seller's notice-to-perform route when a date passes without removal, apply the contract's required cancellation procedure to a contingency being exercised and identify the acts that forfeit that protection instead, and explain the concrete cost of waiving each common contingency along with the licensee's role of documenting the buyer's decision without recommending the waiver.",
      "Build a deadline calendar directly from a contract's own terms, apply the contract's definitions for how periods are counted including day zero, calendar versus business days, and weekend or holiday rolls, explain why a notice's legal effect depends on the authorized delivery method and on preserving evidence of it, state that a contract term changes only by a written amendment signed by both parties and delivered to escrow — and that an agent email or verbal understanding does not — and apply the tracking and written-confirmation habits that prevent deadline disputes.",
      "State that cancellation is accomplished only by exercising a contractual right through its specified procedure and never by announcing an intention, ceasing to perform, or instructing escrow alone, explain why escrow may act only on the parties' mutual written instruction and holds a disputed deposit pending resolution rather than deciding between them, list the documentary practices that prevent most transaction disputes, and rank a closed file's defects by consequence while distinguishing a documented gap, which is survivable, from a backdated document, which is falsification.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (tracing formation through a counteroffer that rejects and substitutes the original offer, and
       a further counteroffer created by a change written on a signed document) and P2 (revocation before
       acceptance, and a signed acceptance that was never communicated) both teach §2. P3 (a seller
       exposed on two accepted counteroffers because the final-election protection was omitted) and P4
       (refusing a seller's instruction to fabricate competing offers while properly declining, without
       the seller's authorization, to disclose a real one) both teach §3. P5 (a contingency that does not
       expire on its stated date, and the seller's notice-to-perform route) and P6 (a buyer who forfeits
       his loan-contingency protection through verbal notice, a unilateral escrow instruction, and
       non-performance, examined alongside how the resulting deposit dispute is actually resolved) both
       teach §4. P7 (a closing-date change confirmed only by an agent-to-agent email, never reduced to a
       signed amendment) teaches §5. P8 (ranking a closed file's four defects by consequence and applying
       the documented-gap-versus-falsification rule) teaches §6. §1 (purchase agreement architecture —
       its functional components, the deposit, what conveys, and the assumptions the agreement's silence
       leaves for the parties to close by writing) has no problem of its own in this assignment's
       eight-problem set; its active learning check is its retrieval bank. */
    problemMap: { 2: [1, 2], 3: [3, 4], 4: [5, 6], 5: [7], 6: [8] },
  },
  9: {
    objectives: [
      "Explain the seller's transfer disclosure obligation as bounded by what the seller actually knows and measured by materiality to a reasonable buyer rather than the seller's own view, apply that standard against the recurring seller objections — it's fixed, it's rare, it's obvious, nobody asked, it doesn't bother me, it predates me — state the four rules for completing the disclosure including why \"unknown\" is a complete answer and why a licensee may never complete it on the seller's behalf, and adapt the framework when the seller has limited personal knowledge of the property, including why an exemption from one requirement is not an exemption from the licensee's own independent obligations.",
      "Perform and record the licensee's own visual inspection as a duty independent of the seller's disclosure, a recommended inspector, another agent's inspection, or an inspection report's existence, apply the included-and-excluded scope of a reasonably competent and diligent visual inspection to a property, distinguish an observation the licensee may state from a conclusion the licensee is not qualified to make, and follow the disclose-recommend-document sequence when an observation exceeds the licensee's own competence to evaluate.",
      "Identify when natural hazard, environmental, and age-triggered disclosures apply, explain that a natural hazard disclosure applies on mapping rather than event history and neither certifies safety nor predicts an event, explain why insurance availability must be investigated early in the contingency period rather than at the end, and state the licensee's role of disclosing, recommending investigation, and not evaluating environmental conditions, interpreting a hazard report's maps, or the age-triggered lead-based paint requirements that apply to pre-1978 housing regardless of whether children will occupy it.",
      "Apply California's limits on disclosing a prior occupant's death or illness — do not volunteer, do not misrepresent, escalate — and explain why those limits exist, distinguish a material fact from a stigma, rumor, or opinion that must not be represented as fact, apply the licensee's own-knowledge obligation to information reaching the licensee from any source including a third party or a prior transaction, and handle a buyer's questions about a neighborhood's composition without characterizing or steering.",
      "Sequence disclosure delivery correctly, state the five things the file must show for each disclosure — what, to whom, when, by what method, and what evidence — explain why late delivery is not cured by delivery before closing or by extending the closing date, and apply the amendment and immediate written correction obligations when new information arrives or an error is discovered.",
      "Apply the three-part test — do I know it, would a reasonable buyer consider it important, am I qualified to evaluate it — to resolve an unfamiliar condition, distinguish the disclosure failure modes and explain why failing to disclose a known material fact is the most serious, assemble the components of a defensible disclosure file, and apply the audit question of whether a reviewer reading only the file could determine what the buyer knew and when.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (the drainage-problem objections — frequency, this seller's tolerance, obviousness, prior
       ownership, and "nobody asked") and P2 (blanks, an uncertain item marked "no," and the licensee
       completing the form himself) both teach §1's materiality standard and completion rules. P3 (the
       ceiling-staining, pipe-leak worked case, disclosed by both the seller's statement and the agent's
       own separately recorded observation) teaches §2's independent visual-inspection duty. P4 (the
       flood-zone-mapping correction and the insurance-timing error) and P5 (the age-triggered
       lead-paint rule, misstated by occupancy, and the mold assessment beyond the licensee's
       competence) both teach §3. P6 (the neighbor's unverified flood report versus the agent's own
       knowledge from a prior sale of the same property) teaches §4's licensee-own-knowledge obligation.
       P7 (the disclosure delivered two days after the buyer removed his contingencies, and the two
       proposed non-fixes) teaches §5's late-delivery consequence. P8 (the four-defect file review —
       an undated signature, an evaluation beyond competence, a laundered figure, and a death-and-illness
       comment — and the single rule that covers all four) teaches §6's failure-mode classification and
       audit framework. Every section owns at least one problem, and every problem 1-8 is assigned to
       exactly one section — no inventory gap in this assignment. */
    problemMap: { 1: [1, 2], 2: [3], 3: [4, 5], 4: [6], 5: [7], 6: [8] },
  },
  10: {
    objectives: [
      "Explain the three reasons a licensee needs a working understanding of financing and the boundary that limits it, distinguish prequalification, preapproval, and loan commitment by what each establishes and what none guarantees, read a preapproval letter as a seller's or buyer's agent for what it actually verifies, and evaluate a 'cash' offer by identifying which of the seven funding sources it actually rests on and what that source truly requires.",
      "Distinguish conventional from government-backed financing including the three points licensees regularly misstate about government programs, describe fixed, adjustable, interest-only, and balloon rate structures and what determines an adjustable rate at each adjustment, explain why occupancy is a material fact the lender relies on and why misstating it is loan fraud regardless of affordability, and identify the point at which a program-suitability question must move to the lender.",
      "State the buyer's federal loan disclosures and the licensee's four-part procedural role regarding them, identify the changes that can restart the review period and move the closing date, apply the prohibitions against characterizing a fee, comparing loan offers, and accepting anything of value for a settlement service referral, and advise a buyer who wants to switch lenders mid-escrow of the five consequences without recommending either lender.",
      "Explain the rule that a lender lends against the lower of appraised value and purchase price and work a buyer's options when the appraisal falls short, distinguish the buyer's remaining practical options from his more limited contractual rights once the appraisal contingency is removed and refer the cancellation question to counsel, supply an appraiser only relevant information and never a value target, and recognize the events during escrow — including new credit, a job change, and undocumented deposits — that can jeopardize a conditional approval because an approval rests on the file as underwritten.",
      "Explain what a seller credit is and apply its two constraints — program limits and the requirement that the property still appraise at the full contract price — compare competing offers on net proceeds rather than price alone and identify what a net comparison alone does not capture, distinguish a seller-performed repair from a credit by the risk each shifts, and audit an estimated closing statement against the contract, the last estimate, and the parties' agreements, including the payoff demand's accrued interest beyond principal.",
      "State the written-notice procedure a buyer must follow to exercise a financing contingency and the actions that forfeit its protection, apply the seller's response when a buyer's financing looks doubtful and the early-warning signs that convert a surprise into a managed problem, explain why an extension requires a signed amendment rather than an agent's email, and describe what a failed financing transaction requires afterward — a complete file, an accurate listing status, a truthful answer about the failure's cause, and correct handling of what the seller learned about value and of the failed buyer's own inspection reports.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (evaluating two preapproval letters of differing strength) teaches §1's reading-a-preapproval
       framework. P2 (the owner-occupancy misstatement request) teaches §2's occupancy-as-material-fact
       rule. P3 (the mid-escrow lender switch paired with the escrow-fee question) teaches §3's
       switching-lenders consequences and its prohibition on commenting on fees or comparing loan
       offers. P4 (the low-appraisal arithmetic with the contingency intact), P5 (the same facts with
       the contingency removed), and P6 (the credit-opened/funds-moved underwriting jeopardy) all teach
       §4 — the appraisal mechanics and what jeopardizes underwriting during escrow. P7 (the
       credit-versus-price-reduction appraisal trap and the repairs-versus-credit choice) teaches §5.
       P8 (the mishandled loan denial, on both the buyer's and the seller's agent's sides) teaches §6.
       Every section owns at least one problem, and every problem 1-8 is assigned to exactly one
       section — no inventory gap in this assignment. */
    problemMap: { 1: [1], 2: [2], 3: [3], 4: [4, 5, 6], 5: [7], 6: [8] },
  },
  11: {
    objectives: [
      "Explain what makes an arrangement an escrow — a binding contract between the parties and conditional delivery to a neutral holder — describe the limits neutrality places on what escrow may and may not do, including why a disputed instruction produces a hold rather than a decision and why an agent's confirmation never supplies the other party's consent, identify who may select escrow and why accepting anything of value for directing settlement business is prohibited regardless of disclosure, and apply the discipline that keeps escrow instructions aligned with the purchase agreement, including why every amendment must reach escrow when signed and why a verbal change must become a same-day writing.",
      "Define a preliminary report and what it is not — a guarantee that title is clear, the policy itself, or a survey — explain what an exception means for the risk the buyer bears, apply the correct routing for common report items such as an easement, recorded CC&Rs, an unreleased deed of trust, and a similarly named judgment lien while identifying the three responses that are wrong in every case, distinguish the owner's and lender's title policies, and explain why the manner of taking title is a legal and tax question that must be referred to counsel before escrow prepares the deed.",
      "Identify a transaction's parallel tracks and their typical failure modes, explain why most failed transactions fail because a track started late rather than because it was impossible, apply the licensee's coordination duties — building the deadline calendar from the contract, starting slow items first including insurance quotes in mapped hazard areas, confirming status weekly in writing, and escalating early — and recognize the recurring shapes of coordination failure, including the unowned task and the silent dependency, and the written, named task list that controls them.",
      "Explain what the final verification of condition does and does not confirm and what to check during it, apply the correct response to a problem found at the walkthrough — documenting it and resolving it through the contract before closing rather than closing and pursuing it afterward or instructing escrow to withhold funds — sequence signing, funding, recording, and disbursement and explain why recording precedes disbursement and why recording order establishes lien priority, and apply the wire fraud practices required at closing, including verifying any change to instructions through an independently obtained channel.",
      "Distinguish possession from ownership and explain why any divergence between them must be documented, apply the terms a written post-closing occupancy agreement must address and explain why early possession before closing is generally discouraged, design a transfer-of-control checklist covering keys, remotes, access devices, and the seller's remote access to cameras and smart devices, and apply the correct handling for the recurring first-ten-days post-closing calls, including checking the file before answering and looping in the broker on anything that sounds like a claim.",
      "State why a post-closing file audit happens shortly after closing and apply its audit questions covering completeness, dates, consistency, chronology, and improper content, explain why superseded document versions are retained rather than discarded, apply the correct response to an audit finding — obtain what legitimately exists, record what does not, escalate, and address the process — and distinguish a documented gap, which is survivable, from a manufactured or back-dated document, which is falsification, including the retention obligation covering cancelled and failed transactions and the rules governing requests a former client makes months or years later.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (the escrow holdback the buyer's agent tries to confirm on the buyer's behalf) teaches
       §1's mutual-written-instruction rule. P2 (routing the easement, CC&Rs, unreleased deed of
       trust, and similar-name judgment lien, and naming the three wrong responses) and P3 (the two
       siblings' conflicting vesting goals) both teach §2, since vesting is itself part of §2's
       "Title and vesting review." P4 (the incomplete repair and missing microwave found at the
       walkthrough, with both agents' suggestions assessed), P5 (sequencing signing, funding,
       recording, and disbursement and explaining why recording precedes disbursement), and P6 (the
       one-character-different wire instructions two days before funding) all teach §4, which spans
       final verification, the closing sequence, and wire fraud. P7 (the undocumented three-day
       stay that became eleven days, with camera access left unaddressed) teaches §5. P8 (the
       post-closing audit finding a missing signed amendment and a colleague's falsification
       suggestion) teaches §6. §3 (transaction coordination — parallel tracks, the insurance track,
       and the recognizable shapes of coordination failure) has no problem of its own in this
       assignment's eight-problem set; its active learning check is its retrieval bank. */
    problemMap: { 1: [1], 2: [2, 3], 4: [4, 5, 6], 5: [7], 6: [8] },
  },
  12: {
    objectives: [
      "Identify the eleven terms a management agreement must establish including spending and emergency authority, explain why property management's continuous exposure makes unsigned authority a structural defect — undefined scope, unenforceable compensation, unauthorized fund handling — rather than a filing gap, and state the additional terms that produce most disputes when left to a template: who decides on a tenant, what transfers to the manager on termination, and what the manager is not responsible for.",
      "Apply the five elements of defensible tenant screening — written, objective, uniform, documented, and disclosed criteria — recognize the practices where bias operates including differential application and discouragement, apply California's protections for source of income and familial status together with the rule that an assistance animal is not a pet, and sequence the fair-housing-safe application process from advertising and inquiry logging through adverse action notices and file retention.",
      "Define a trust fund in property management, apply the three obligations of separation, records, and timeliness, explain the structural reason an internal ledger does not cure commingling, distinguish a shortage from an overage and the immediate response each requires, and reconcile a trust account against all three required balances — bank, book, and the total of individual beneficiary ledgers — rather than bank against book alone.",
      "Apply the non-waivable, continuous habitability obligation to triage a maintenance request into emergency, habitability, ordinary, or cosmetic categories and respond accordingly, state the four elements of lawful entry and identify what does not substitute for proper notice, and explain why a tenant's asserted habitability remedy is escalated to the broker and counsel rather than resolved through the manager's own argument with the tenant.",
      "Distinguish the five elements a termination or enforcement notice must get right — type, content, period, service, and parties — from the documentation of tenant conduct that does not cure a defect in any of them, explain how enforcement action taken close to a tenant's protected activity creates a retaliation appearance and what defense answers it, and state why self-help is prohibited without exception and why a termination timeline question is answered with the legal process rather than a promised date.",
      "Explain why owner reporting must be regular and itemized to discharge the accounting duty rather than merely summarized, identify why an owner left unreported for months is a structural failure rather than an administrative backlog, and apply the four-part response — decline clearly, explain why in terms of what the manager may lawfully do, offer the lawful path, and document it in writing the same day — to an owner's instruction the manager cannot follow, including when to escalate to the broker.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (the audit finding two owners with no signed management agreement, waved off as a filing
       oversight) teaches §1's unsigned-authority-is-a-structural-defect rule. P2 (the owner's
       instruction against housing assistance, service animals, families with children, and the
       wheelchair applicant) and P3 (the manager who screens by "feel," referral preference, and
       discouragement) both teach §2. P4 (rents and deposits deposited into the operating account,
       defended by an accurate software ledger) and P5 (a bank-to-book reconciliation that missed a
       deposit credited to the wrong tenant's ledger) both teach §3. P6 (the delayed response to a
       reported loss of water, followed by an unnoticed entry) teaches §4. P7 (the termination notice
       served eleven days after a city complaint, naming only one tenant and left under the door) teaches
       §5. P8 (the deposit withheld without move-in documentation, paired with an owner unreported for
       four months) is a two-part problem whose deposit-handling half also draws on §3.5's deposit
       framework, but it is mapped to §6 — its second half restates §6.3's structural-failure analysis
       almost verbatim, and §3 already has two dedicated problems (P4, P5) on trust-fund handling while
       §6 otherwise has none. Every section owns at least one problem, and every problem 1-8 is assigned
       to exactly one section — no inventory gap in this assignment. */
    problemMap: { 1: [1], 2: [2, 3], 3: [4, 5], 4: [6], 5: [7], 6: [8] },
  },
  13: {
    objectives: [
      "Distinguish honesty and fair dealing — which runs to everyone, not only a licensee's own client — from fiduciary duty, classify a statement as innocent error, negligent misrepresentation, or fraud by the care taken and the intent behind it rather than by whether a lie was told, keep verified fact, unverified report, and professional opinion as separate categories to avoid the collapse that produces most misrepresentation claims, recognize that silence about a known material fact is concealment rather than neutral silence, and identify the recurring pressures that produce dishonest statements along with the short prepared sentences that resist them.",
      "State the correction obligation — correcting a known error immediately, in writing, to everyone who received it, before the recipient acts on it if that is still possible — explain why an instruction to conceal an error is escalated above the person who gave it rather than followed, describe what errors and omissions coverage does and does not do including why late reporting can forfeit it and why intentional acts are excluded, state what must be reported to the broker and why the bias should run toward reporting, and distinguish the correct handling of another licensee's error, a service provider's error, a client's own error, and an error nobody else has noticed.",
      "Recognize that fraud typically presents as a pattern of small, individually explainable inconsistencies rather than one obvious falsehood, distinguish the fact patterns that warrant scrutiny — pressure to close fast combined with changing parties or funding, a principal who never appears, unconnected funds, an unexplained price, a contradicted occupancy statement, requests to alter or backdate documents — from characteristics that do not warrant it, state what a licensee must never do on suspicion of fraud including investigating, confronting, or warning a participant, and draft a written escalation to the broker that states observations and their sources rather than conclusions.",
      "Identify the categories of interest that create a conflict, apply the rule that disclosure must reach the client before they rely on the advice the conflict affects and recognize why the common justifications for delaying or withholding it fail, distinguish an ordinary conflict that disclosure manages from the settlement-service referral prohibition that disclosure cannot cure, state the heightened disclosure and consent required when a licensee acts as principal or opposite a personal relationship, and build and maintain the conflicts inventory a licensee should review annually.",
      "State the correct first-response sequence to a client complaint — acknowledge, notify the broker, preserve everything, respond factually, offer no settlement, report to the carrier — and explain why an immediate defense, an apology, a fee reduction, delay, or handling it quietly each make the matter worse, apply the preservation obligation that attaches the moment a complaint is foreseeable, state a licensee's limited role when the Department makes contact or when a consumer reports another brokerage's conduct, and reconstruct what a licensee actually knew before responding to a complaint, distinguishing the outcomes that are merely weaker from the one — an undated late addition to the file — that would end a career.",
      "Explain why a contemporaneous record carries more weight than a later reconstruction as a matter of credibility rather than admissibility, write file notes that are specific, dated, and factual rather than characterizations, state what must be escalated to the broker immediately and what triggers a referral to counsel based on the nature of the question rather than experience or the client's request, distinguish a documented gap from falsification of the record and explain why only the latter is unsurvivable, and read a closed file as an adversary would to find what is undated, unsourced, missing, or inconsistent before a dispute ever arises.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1's three-statement classification (an unverified square-footage figure repeated as fact, a
       certainty-stated appreciation prediction, and silent steering away from a known drainage
       defect) teaches §1's classification framework directly. P2 (the transposed-digit square
       footage error, with a manager who wants to wait) and P3 (the three-month-quiet complaint and
       the E&O coverage assumptions) both teach §2 — P2 the correction obligation, P3 the reporting
       and coverage material. P4 (separating the four-signal fraud pattern from three characteristics
       the lesson names as not suspicious) teaches §3. P5 (the $300-per-file referral fee, the
       brother's warranty company, and the builder bonus, each mishandled) teaches §4. P6 (the
       six-paragraph defense, the apology, the fee reduction, the deletion, and the delayed broker
       notice) teaches §5. P7 (rewriting a vague file note and correcting a colleague's privilege and
       reconstruction misconceptions) and P8 (the informal Department response, the deposit
       legal-conclusion answer, and the backdated contingency removal — the latter two testing §6's
       legal-referral trigger and falsification, the section's more specific and more heavily weighted
       propositions in this problem) both teach §6. Every section owns at least one problem and every
       problem 1-8 maps to exactly one section — no inventory gap in this assignment. */
    problemMap: { 1: [1], 2: [2, 3], 3: [4], 4: [5], 5: [6], 6: [7, 8] },
  },
  14: {
    objectives: [
      "Distinguish explicit, implicit, and systemic bias, explain why sincerity, self-report, and good intentions each fail as protections against implicit bias because the association operates automatically and outside conscious awareness, and identify discretion — case-by-case decisions made without a standard, on incomplete information, under time pressure — as where bias operates, including how a systemic pattern can produce unequal outcomes with no individual acting with bias at all.",
      "Describe the historical mechanisms — racially restrictive covenants, redlining, steering, exclusionary land use, and unequal terms — that produced today's housing-wealth patterns and explain why exclusion compounds through inherited equity rather than ending when the practice ends, and state the federal Fair Housing Act's core prohibitions together with California's Fair Employment and Housing Act, Unruh Civil Rights Act, and Holden Act, identifying the California-only protected characteristics, including source of income and veteran or military status, that have no federal counterpart.",
      "Explain why structure outperforms effort at reducing implicit bias's effects, apply the interruption practices that constrain discretion at each stage of a transaction, and use the outcome-review measurements — beginning with response time by lead source — to detect a pattern that no single explainable decision would reveal, distinguishing a disparity that raises a question from a disparity that proves an answer.",
      "Complete the consumer-role practicum from inside a buyer's experience of being redirected away from the homes she asked to see, and articulate why the effect on a consumer is independent of the licensee's intent and why a consumer in that position typically cannot name what happened to her.",
      "Complete the licensee-role practicum by producing the actual words that decline a neighborhood-composition or school-quality question without appearing evasive, revise the response after structured feedback, and evaluate common but inadequate responses — a favorable characterization, a flat refusal followed by a subject change, or an answer offered \"in general terms\" — against the criteria a compliant response must meet.",
      "Build a fair housing action plan whose eight required elements are stated in checkable, operational terms rather than as commitments, apply the \"could someone else check whether you did it\" test to distinguish a real plan element from a statement of intention, and write the unlawful-instruction script in advance so it is ready before a client delivers an unlawful instruction casually.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (the three-claims sincerity/no-complaints/self-report rebuttal) and P2 (classifying three
       brokerages as explicit, implicit, and systemic bias) both teach §1's bias-type framework. P3
       (the discretion list and its one-for-one mapping onto structural controls, closing on "the
       reason this lesson sits in a practice course rather than an ethics seminar") teaches §3's
       interruption practices and structure-beats-effort principle. P4 (the Alder Street
       consumer-position reflection) teaches §4's consumer-role practicum. P5 (the neighbors-and-
       schools script, held through "off the record") and P6 (ranking four common but inadequate
       responses to the same question) both teach §5's licensee-role practicum. P7 (applying the
       checkability test to two action plans) and P8 (the unlawful-instruction script and its four
       components) both teach §6. §2 (the historical mechanisms and the federal/California statutory
       framework) has no problem of its own in this assignment's eight-problem set; its active
       learning check is its retrieval bank. */
    problemMap: { 1: [1, 2], 3: [3], 4: [4], 5: [5, 6], 6: [7, 8] },
  },
  15: {
    objectives: [
      "State the transaction chronology's organizing principle and the ordering test it produces — does this decision have, in front of it, the information it was meant to be made with — apply the intake questions covering authority, subject matter, and constraints, sequence the agency disclosure at its three distinct required times including dual agency consent that must precede the brokerage acting on both sides, and identify unverified authority as the most common and expensive intake failure together with the two buyer-side intake failures — late agency disclosure and readiness assumed from a preapproval letter.",
      "Explain the listing agreement's three operative provisions worth particular care — negotiable compensation, the definite termination date, and the protection clause — apply the pricing division between the licensee's analysis and advice and the seller's price decision, including why an analysis is never revised to match a chosen price, schedule disclosure preparation at the listing appointment rather than at offer, apply the marketing standard of current-condition truthfulness, sourced claims, identification, and approval, and recognize the listing complications — a trust or estate, an owner acting for another, unpermitted improvements, a tenant, a common-interest development, insufficient equity — that must be resolved before marketing rather than after an offer arrives.",
      "Apply contract formation rules distinguishing an acceptance from a counteroffer that rejects and replaces the original offer rather than suspending it, state the seller's discretion in multiple-offer situations and the line between permissible silence and a misrepresentation a client's instruction cannot authorize, apply the division between the client's terms and the licensee's advisory duty to a contingency waiver or escalation clause, and evaluate a competing pair of offers on net proceeds, financing capacity, lender verification, and timeline feasibility rather than on the headline number or a personal letter.",
      "Distinguish the seller's duty to disclose known material facts from the licensee's duty to disclose an inspection observation stated as observation rather than inference, apply the materiality standard requiring every disclosure item answered and 'unknown' used honestly rather than left blank or assumed 'no,' explain why rights run from delivery and why receipt before closing does not cure a late disclosure, sequence investigation to start its slowest items first, and state that a contingency ends only by written removal under the standard California form, never by a passed date.",
      "Explain escrow's neutral role acting only on mutual written instructions and stopping when the parties disagree, state that a title exception means the policy does not insure against that item and that vesting is referred to counsel before the deed is drawn, apply the rule that lenders lend against the lower of appraised value or price including the buyer's options when an appraisal comes in low, state the four-event closing sequence and the amendment discipline governing every contract change, and sequence the closing week's day-minus-seven checklist including wire-instruction verification by voice at an independently obtained number.",
      "Apply the reconstructability standard and the six-step audit sequence — completeness, dates, consistency, chronology, propriety, and retention — to rank a file's defects by seriousness rather than merely list them, distinguish a documented gap that a brokerage can survive from a manufactured document that is falsification, and apply the course's four recurring questions — whose decision, whose duty, whether the decision has its information, and what the file will show — to a transaction situation the course did not specifically cover.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (the trust listing with unverified beneficiary authority, a late agency disclosure, and
       recycled photos/square footage) is framed entirely around applying §1.1's ordering test to an
       intake sequence, and its most substantive failure is §1.4's unverified authority, so it teaches
       §1. P2 (the CMA revised upward to match a seller's above-range price, then presented as the
       brokerage's opinion of value) teaches §2's pricing division. P3 (the counteroffer/handwritten-
       date-change/phantom-offers/no-final-election problem) teaches §3's formation and multiple-offer
       rules. P4 (ceiling staining recorded as observation, blanks completed honestly, late transfer
       disclosure) and P5 (a passed contingency date mistaken for removal, and insurance ordered too
       late in a mapped fire area) both teach §4's disclosure and investigation framework. P6 (the
       waived-appraisal deposit question, the appraiser email mixing information with a target, the
       unsigned closing-date change, and the escrow holdback) teaches §5's escrow, financing, and
       amendment rules. P7 (the six-item ranked audit, directly parallel to §6.3's own worked example)
       and P8 (the power-of-attorney scenario resolved through §6.5's four questions) both teach §6.
       Every section owns at least one problem, and every problem 1-8 is assigned to exactly one
       section — no inventory gap in this assignment. */
    problemMap: { 1: [1], 2: [2], 3: [3], 4: [4, 5], 5: [6], 6: [7, 8] },
  },
};
