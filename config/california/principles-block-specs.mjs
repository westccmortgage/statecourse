/**
 * CA-BLOCK rollout — the HAND-AUTHORED pedagogy for Real Estate Principles assignments.
 *
 * Same apparatus as the Mortgage rollout (see mortgage-block-specs.mjs for the full design
 * rationale): the generator (scripts/generate-principles-block-maps.mjs) derives every screen
 * range from the frozen lesson's own headings; what it must never invent lives here, written
 * after reading the lesson — each block's learning objective (blocks B1-B6 follow the lesson's
 * six sections; the seventh entry is B7, synthesis), and the mapping of the eight practice
 * problems to the block teaching their concept. Every problem 1-8 must be assigned to exactly one
 * block. Block/screen ids use the "pr" prefix (e.g. "pr1-b3") to stay collision-free with the
 * Mortgage course's "a" prefix once both share one registry.
 */

export const PRINCIPLES_BLOCK_SPECS = {
  1: {
    objectives: [
      "Explain why real property is treated differently in law from other assets, tracing the consequences of immobility, indestructibility, and uniqueness, and describe the bundle of rights and how its sticks separate across leases, security interests, easements, and covenants.",
      "Describe the Department of Real Estate's jurisdiction and consumer-protection purpose, identify what counts as licensed activity under the license law, and explain why the activity — not the title used — is what triggers it.",
      "Distinguish the broker's and the salesperson's roles, explain why the brokerage rather than the individual salesperson is the party to a listing or representation agreement, and describe what reasonable supervision actually requires as a system.",
      "Apply the legal-conclusion test to distinguish licensed real estate practice from the unauthorized practice of law, and route a consumer's actual questions correctly, referring well rather than refusing badly.",
      "Rank the sources of California real estate law from constitution to brokerage policy, explain why forms and publications are not themselves law, and read a statute or regulation for its definitions, scope, operative verbs, and exceptions.",
      "Identify each participant in a residential transaction and what each is accountable for, locate where accountability gaps recur, and explain the licensee's role as the participant who owns what would otherwise belong to nobody.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the three physical characteristics and P2 the bundle of rights both teach §1; P3 the
       unlicensed-activity/compensation question teaches §2; P4 the brokerage-as-party question
       and P5 the supervision assessment both teach §3; P6 the within-scope/refer sort teaches §4;
       P7 the forms-are-not-law/brokerage-policy question teaches §5; P8 the accountability-gap
       diagnosis teaches §6. Every section owns a problem — no inventory gap in this assignment. */
    problemMap: { 1: [1, 2], 2: [3], 3: [4, 5], 4: [6], 5: [7], 6: [8] },
  },
  2: {
    objectives: [
      "Distinguish real property from personal property, explain the opposite default rules governing what conveys in a sale (real property conveys unless excluded; personal property does not convey unless included), and state the four consequences that follow from an item's classification — what conveys, what secures financing, how the transfer is documented, and how the item is taxed.",
      "Apply the MARIA fixture tests to a specific item, explain why intention and agreement do most of the analytical work while method of attachment and adaptability largely serve as evidence of intention, and explain how the relationship between the parties can change the outcome for the same item, grounding the analysis in Civil Code section 660's statutory language.",
      "Define a trade fixture, distinguish it from a building improvement, and explain the tenant's right to remove trade fixtures at or before the end of the tenancy along with the accession rule that converts an untimely-removed trade fixture into the landlord's property.",
      "Classify natural attachments by distinguishing perennial growth from annual cultivated crops and explain why each is treated differently, and identify why solar panels and similar artificial attachments require a licensee to ask about ownership and financing rather than assume they convey.",
      "Describe water rights (riparian, appropriative, overlying) and severed mineral rights at the level a licensee must understand, list the intake questions a rural listing requires, and explain why the licensee's role is to recognize, ask and obtain the documents, and refer rather than to advise.",
      "Prevent fixture disputes by running the listing-appointment intake conversation, naming disputable items in the agreement, keeping marketing consistent with what conveys, and stating the correct sequence — document, address through the contract, never instruct escrow unilaterally — when a named item is missing at the walkthrough.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 tests Section 1's opposite-default rule (real property conveys unless excluded; personal
       property does not convey unless included) through the refrigerator dispute. P2 and P3 both
       teach Section 2: P2 applies the MARIA tests item-by-item, and P3 tests the relationship-of-
       the-parties variable by holding one item constant and varying who is arguing. P4 teaches
       Section 3's trade-fixture/accession rule and the trade-fixture-versus-improvement distinction.
       P5 teaches Section 4's natural-attachment classification (orchard versus annual crop) and the
       solar-panel question. P6 teaches Section 5's water-and-mineral recognize/ask/refer framework.
       P7 and P8 both teach Section 6: P7 teaches the intake-and-naming habit and marketing
       consistency, and P8 teaches the walkthrough sequence and the licensee's limit when a named
       item is missing. Every section owns at least one problem; none is skipped or double-counted. */
    problemMap: { 1: [1], 2: [2, 3], 3: [4], 4: [5], 5: [6], 6: [7, 8] },
  },
  3: {
    objectives: [
      "Distinguish freehold from leasehold estates, classify each leasehold type by how it terminates, and explain why a leasehold survives the sale of the property.",
      "Explain fee simple absolute and life estates, identify who must join a life tenant to convey a fee, and describe what constitutes waste.",
      "Distinguish joint tenancy from tenancy in common by their operative differences, including the four unities and the express-language requirement for creating a joint tenancy, and explain what severance does.",
      "Describe California community property and separate property at the level a licensee must recognize, state the general rule for joining in a conveyance, and identify what belongs to counsel.",
      "Explain how a common interest development is organized and governed, identify what a buyer must review before the contingency expires and why the documents must be ordered early, and recognize the limits on what a licensee may say about reserves or litigation.",
      "Verify authority to convey where title is held in a trust or by an entity, distinguishing a trustee's signing authority from a beneficiary's lack of it and an entity's governing documents from a signer's claimed title.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (classifying four leaseholds by termination) and P2 (a leasehold surviving a sale) both
       teach §1; P3 (life tenant conveying only a life estate, remainderman must join) teaches §2;
       P4 (severance on a joint tenant's transfer) and P5 (joint tenancy vs. tenancy in common as an
       estate-planning referral) both teach §3; P6 (community property joinder and what is a legal
       conclusion) teaches §4; P7 (CID document timing and the reserves/litigation question a
       licensee may not answer) teaches §5; P8 (verifying trustee and entity authority) teaches §6.
       Every section owns a problem — no inventory gap in this assignment. */
    problemMap: { 1: [1, 2], 2: [3], 3: [4, 5], 4: [6], 5: [7], 6: [8] },
  },
  4: {
    objectives: [
      "Read a metes and bounds description as a sequence of courses from a point of beginning, interpret a bearing's direction and magnitude, and explain what closure means and why a description that does not close is defective.",
      "Locate a parcel within California's rectangular survey system by township and range, compute acreage from a sectional description by reading it backwards, and explain why convergence produces government lots and a nominal rather than guaranteed 640 acres.",
      "Identify the elements of a lot, block, and tract description and its recording reference, and explain how 'except' and 'together with' language subtracts from or adds to the parcel conveyed.",
      "Distinguish an assessor's parcel number from a legal description, explain why a separate tax bill is not evidence of a lawful separate parcel, and identify the deed and preliminary report as the operative sources of a description.",
      "Distinguish the record boundary from the occupied boundary, explain why a title policy does not insure boundary location, and identify the recurring situations that call for recommending a survey rather than assessing the boundary personally.",
      "Perform the area, unit-conversion, and reasonableness calculations a licensee needs for lot size, acreage, and value, and state a measurement — especially square footage — with its number, unit, and source rather than as an unattributed fact.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P2 (reading a metes and bounds description, computing its area, and naming what makes it close
       or defective) teaches §1; P3 (sectional acreage computation and why sections aren't exactly 640
       acres) teaches §2; P4 (dropping "except"/"together with" while copying a lot-and-block
       description) teaches §3; P1 (neither a street address nor an APN is a legal description) and P5
       (a separate tax bill is evidence of assessment practice, not of a lawful split) both teach §4's
       central APN/legal-description distinction; P6 (a "clean" title report does not answer a boundary
       question, and long use of a fence doesn't settle it) teaches §5; P7 (area, value, and unit
       computations, plus the three unit errors) and P8 (stating square footage with its source when
       documents disagree) both teach §6. Every section owns at least one problem — no inventory gap
       in this assignment. */
    problemMap: { 1: [2], 2: [3], 3: [4], 4: [1, 5], 5: [6], 6: [7, 8] },
  },
  5: {
    objectives: [
      "Classify encumbrances as affecting title or use, place each common lien on the voluntary/involuntary and general/specific axes, and explain the practical consequence of a general lien reaching every parcel a debtor owns in the county.",
      "Explain how each common lien — deed of trust, property tax lien, mechanic's lien, judgment lien, lis pendens — arises and is removed, why a mechanic's lien's priority relates back to commencement of work rather than to its own recording date, and the scope and limits of the homestead exemption.",
      "Distinguish an easement from a license, identify the dominant and servient tenements in an easement appurtenant versus an easement in gross, describe how easements are created and terminated (noting that non-use alone does not end one), and state the correct handling of an easement shown in a preliminary report.",
      "Explain how recorded private restrictions differ from zoning in source, enforcement, and amendment, apply the rule that the more restrictive of the two generally governs, and state what a licensee may and may not say about a restriction's meaning or enforceability.",
      "Identify an encroachment and route it correctly, distinguish actual, constructive, and inquiry notice, and state the first-in-time priority rule together with its property-tax-lien and mechanic's-lien exceptions and the weight of a subordination agreement.",
      "Explain what a preliminary report is and is not, define an exception as an uninsured risk the buyer bears, distinguish exceptions from exclusions and requirements, and state the correct licensee response to each type of item found on a preliminary report.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1's two-axis classification of a deed of trust, tax lien, judgment lien, and mechanic's lien
       teaches §1's own checkpoint. P2's mechanic's-lien exposure on a recent renovation teaches §2.
       P3's utility-easement/workshop scenario and P4's license-vs-easement/non-use questions both
       teach §3. P5's zoning-vs-CC&Rs correction teaches §4. P6's inquiry-notice scenario and P7's
       subordination-agreement assessment (its owner's/lender's-policy aside is secondary to the
       priority point) both teach §5. P8's preliminary-report item-by-item handling, including the
       exception/exclusion/requirement distinction, teaches §6. Every section owns at least one
       problem — no inventory gap in this assignment. */
    problemMap: { 1: [1], 2: [2], 3: [3, 4], 4: [5], 5: [6, 7], 6: [8] },
  },
  6: {
    objectives: [
      "Identify the four government powers over private property — police power, eminent domain, taxation, and escheat — state which requires compensation, and distinguish regulation from a taking on a given set of facts, including partial takings and severance damages.",
      "Explain how the general plan, zoning ordinance, and entitlement process relate and what each answers; distinguish permitted use from physical feasibility; distinguish a variance, a conditional use permit, and a rezoning; and explain the limits on a legal nonconforming use and why recorded restrictions can independently forbid what zoning allows.",
      "Distinguish the Subdivision Map Act from the Subdivided Lands Law and what each governs, state what a building permit record does and does not establish, handle unpermitted work using the licensee's disclose-recommend-document role, and explain why local transfer requirements must be checked jurisdiction by jurisdiction rather than assumed.",
      "Identify the environmental hazards a California residential transaction commonly raises — including lead-based paint, asbestos, radon, mold, and underground storage tanks — and apply the licensee's disclose-recommend-do-not-evaluate role to each, stating the lead-based paint obligations correctly in both directions.",
      "Explain why natural hazard disclosure applies on mapping rather than on the property's event history and why insurance availability is the consequence that decides transactions, distinguish supply, rights, and conservation as separate water questions, and list the rural intake questions a licensee should ask at a listing appointment.",
      "Build a land-use due diligence sequence ordered by lead time rather than apparent importance, separate the public and private halves of a land-use question so that clearing one is not mistaken for clearing both, and state what a defensible due-diligence file must document, including items that did not arrive in time.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (rezoning vs. road widening) tests the four powers and the regulation/taking distinction,
       teaching §1; P2 (permitted use vs. physical feasibility, and CC&Rs vs. zoning) and P3 (variance
       vs. conditional use permit vs. rezoning) both teach §2; P4's open-permit and permit-record
       analysis (plus the nonconforming-use mislabel) teaches §3; P5's lead-paint/mold/underground-
       storage-tank triage teaches §4; P6 (mapping vs. event history, insurance timing) and P7 (rural
       intake questions, access by custom) both teach §5; P8's lead-time sequencing and file-
       documentation diagnosis teaches §6. Every section owns at least one problem, and every problem
       1-8 is assigned to exactly one section — no inventory gap in this assignment. */
    problemMap: { 1: [1], 2: [2, 3], 3: [4], 4: [5], 5: [6, 7], 6: [8] },
  },
  7: {
    objectives: [
      "Identify the three ways agency is created — express agreement, conduct, and ratification — explain why agency by conduct is the route that most often surprises licensees, and state why the agency disclosure belongs before the relationship has been operating rather than at the offer.",
      "State each of the six fiduciary duties under OLD CAR, identify the conduct that breaches each one including breaches involving no dishonesty, and explain why a careless licensee can breach a fiduciary duty without ever lying to anyone.",
      "Distinguish seller's agent, buyer's agent, and dual agency, explain why informed written consent must come from both parties before the brokerage acts on both sides, and state why consent to dual agency permits representation but never the movement of either party's confidential negotiating position to the other.",
      "Apply California's disclose-elect-confirm sequence, state when each of the three disclosures must be provided, and explain why a disclosure delivered or signed after the decision it was meant to inform is not cured by later delivery.",
      "Explain why the brokerage rather than the individual salesperson is the agent and the party to the listing, describe what reasonable supervision requires as a system, and state the correct response when a salesperson receives an improper instruction or discovers unlicensed activity.",
      "State that brokerage compensation is negotiable and never standard, disclose a compensation conflict before the client relies on the advice it affects, distinguish the referral fee prohibition — never cured by disclosure — from an ordinary disclosable conflict, and distinguish the principal's power to terminate an agency from the right to do so without consequence.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 (agency arising from conduct alone, with no signature and no payment) teaches §1; P2 (the
       confidentiality-versus-disclosure boundary and the obedience limit on an unlawful instruction)
       teaches §2; P3 (dual agency consent permits representation but never moves either party's
       confidences to the other) teaches §3; P4 (a disclosure that arrives after the decision it was
       meant to inform, ranked against a contradictory confirmation) teaches §4; P5 (a listing that is
       not the salesperson's to cancel, escalating a manager's instruction to conceal an error, and an
       unlicensed assistant soliciting listings for pay — three supervision failures) teaches §5. §6
       (compensation, conflicts, and termination) is the widest section and draws three problems: P6
       (the negotiability sentence and the referral-fee prohibition that disclosure cannot cure), P7
       (confidentiality surviving termination), and P8 (the power to terminate versus the right to do
       so without consequence). Every section 1-6 owns at least one problem — no inventory gap. */
    problemMap: { 1: [1], 2: [2], 3: [3], 4: [4], 5: [5], 6: [6, 7, 8] },
  },
  8: {
    objectives: [
      "Identify the four elements required to form a contract, classify a contract along the formation, obligation, performance, and enforceability axes, and explain why \"executed\" means fully performed rather than signed.",
      "Apply the three formation rules — offer, mirror-image acceptance, and communicated acceptance — together with the counteroffer, revocation, and option rules to trace a sequence of offers and counteroffers and determine whether, and on whose terms, a contract formed.",
      "Explain consideration, capacity, and lawful object as elements of a valid contract, distinguish void, voidable, and unenforceable outcomes and their practical consequences, and state why a licensee addresses capacity and defects in assent by escalating rather than diagnosing.",
      "State what the Statute of Frauds requires for sales of real property, leases over a year, and compensation agreements, explain why noncompliance makes an agreement unenforceable rather than void, and identify that only a signed written amendment — never an email, a verbal agreement, or an escrow instruction — changes a contract term.",
      "Explain what a contingency conditions inside an already-formed contract, state that under the standard California form contingencies end only by written removal rather than by a passed date, and distinguish assignment from novation and a waiver's practical exposure.",
      "Distinguish the remedies for breach — damages, specific performance, liquidated damages, rescission, and reformation — explain why specific performance is available for real property because of uniqueness, and state what a licensee may and may not say when a client asks about breach, cancellation, or the deposit.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 classifies a purchase agreement and an open listing on all four axes, teaching §1; P2 the
       revocation/uncommunicated-acceptance problem and P3 the counteroffer problem both teach §2;
       P4 the four-part void/voidable/unenforceable classification and P5 the capacity/file-note
       problem both teach §3; P6 the oral-amendment-during-escrow problem teaches §4; P7 the
       contingency-removal and appraisal-waiver problem teaches §5; P8 the loan-denial/
       cancellation/remedies problem teaches §6. Every section owns at least one problem and every
       problem 1-8 is assigned to exactly one section — no inventory gap in this assignment. */
    problemMap: { 1: [1], 2: [2, 3], 3: [4, 5], 4: [6], 5: [7], 6: [8] },
  },
  9: {
    objectives: [
      "State the requirements of a valid deed — writing, a competent grantor, an ascertainable grantee, an adequate property description, granting language, and the grantor's signature — and identify which common assumptions about deeds are wrong: that consideration, the grantee's signature, recording, or notarization are required for validity.",
      "Distinguish a grant deed from a quitclaim deed and other deed types by what each warrants, state the grant deed's two implied warranties and their limit to the grantor's own period of ownership, and explain what a quitclaim conveys and what it does not accomplish.",
      "Explain delivery and acceptance as the grantor's present intent to pass title now, and explain why a deed that is signed, notarized, and even recorded can still fail to transfer title when that present intent is missing.",
      "Explain what recording does and does not accomplish, distinguish actual, constructive, and inquiry notice, state the elements of a bona fide purchaser, and apply Civil Code Section 1214's race-notice conditions to determine priority between competing claims to title.",
      "Describe what title insurance covers and does not cover, and read a preliminary report as an allocation of risk by distinguishing an exception from an exclusion and a requirement.",
      "Distinguish voluntary from involuntary transfer, identify what each requires — including California's adverse possession tax-payment element — and place an unfamiliar title problem into one of the lesson's three organizing questions: did title transfer, who has notice and whose interest prevails, and what is insured.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 tests the deed-validity misconceptions (§1); P2 tests grant deed vs. quitclaim warranties
       and the reconveyance requirement (§2); P3 tests delivery/present-intent through a failed
       testamentary transfer (§3); P4 tests inquiry notice arising from unrecorded occupancy and a
       worn path (§4); P5 and P6 both require reading a preliminary report — coverage/exceptions and
       owner's-vs-lender's policies for P5, the exception/exclusion/requirement categories and timing
       for P6 — so §5 carries two problems; P7 tests the adverse possession elements including
       California's tax requirement, and P8 applies the lesson's closing three-questions framework
       across three title patterns (trustee's deed, a break in the chain, and dedication), so §6 also
       carries two problems. Every section owns at least one problem — no inventory gap in this
       assignment. */
    problemMap: { 1: [1], 2: [2], 3: [3], 4: [4], 5: [5, 6], 6: [7, 8] },
  },
  10: {
    objectives: [
      "Define escrow by its two required elements — a binding contract between the parties and conditional delivery to a neutral holder — explain that escrow exists to solve the simultaneity problem of a buyer and seller who will each not go first, and apply what neutrality forbids (acting on one party's instruction, advising either party, deciding a dispute) to state precisely what escrow does when only one side instructs it.",
      "Explain that escrow instructions implement the purchase agreement and that the agreement governs when the two conflict, describe what escrow needs at opening and why an incomplete contract or a missing amendment produces a mismatch, and explain why instructions are amended only in writing, signed by both parties, with line-by-line reconciliation against the contract the licensee's job that nobody else performs.",
      "Explain the deposit's two functions and when it is genuinely at risk, describe what escrow does with a disputed deposit and why entitlement to it is a legal question rather than one a licensee predicts, and apply the trust fund rules — including Business and Professions Code § 10145's three lawful destinations for client funds, who may sign for withdrawals, the auditor findings that recur, and the wire fraud warning's content and timing — to a broker's or licensee's handling of deposits and documents.",
      "Compute a proration in both directions from the three questions that produce every proration — what period a charge covers, whether it has been paid or is owed, and where the ownership boundary falls — state which party is credited and which is debited depending on whether an item was prepaid or is accrued, and read a closing statement to identify what a licensee checks against the contract before closing, including the four recurring errors.",
      "Sequence signing, funding, recording, and disbursement in their required order, explain why recording deliberately precedes disbursement and why the order in which instruments record establishes lien priority, and distinguish ownership (transferring at recording) from possession (transferring on the contract's terms), including the documented response required at the final verification and for any divergence between recording and possession.",
      "Run the post-closing audit for completeness, dates, consistency, chronology, and retention, explain why superseded document versions and failed transaction files are kept rather than discarded, and apply the correction rule — append, never overwrite — to distinguish a documented gap, which is survivable, from a falsified record, which is not.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 tests escrow's neutrality when only one party instructs it, including that an agent's
       confirmation is not a party's consent — teaches §1. P2 tests the instructions-vs-agreement
       conflict, what governs, and whose reconciliation failure produced the mismatch — teaches §2.
       P3 tests payoff demands (why they exceed the principal balance) and the statement of
       information — teaches §3. P4 and P5 both teach §4: P4 the proration mechanics across three
       item types, P5 reading and checking a closing statement before disbursement. P6 and P7 both
       teach §5: P6 the four-event sequence and prior-to-funding conditions, P7 the final
       verification and post-closing possession/transfer-of-control. P8 teaches §6, the post-closing
       audit and the falsification line. Every section owns at least one problem; §4 and §5 each own
       two; none is skipped or double-counted. */
    problemMap: { 1: [1], 2: [2], 3: [3], 4: [4, 5], 5: [6, 7], 6: [8] },
  },
  11: {
    objectives: [
      "Distinguish the promissory note from the security instrument and state what each does, identify what a note contains and why a licensee's role regarding negotiability is recognition rather than analysis, distinguish the acceleration clause from the alienation clause and name what the other recurring note and security-instrument clauses do, and explain what a balloon payment signals about a note's amortization.",
      "Name the three parties to a California deed of trust and explain why the deed of trust is generally treated as a lien so that the borrower remains the owner, explain what the trustee's power of sale produces and why a recorded reconveyance rather than payment clears the record, distinguish assumption from taking title subject to and explain why priority and subordination are decisions for counsel, and compare the deed of trust with the mortgage on foreclosure speed, deficiency, and redemption.",
      "Describe the primary and secondary markets and explain why underwriting standards flow backward from the secondary market's need for saleable loans, identify the sources of real estate financing and correct the recurring misstatements about government-backed programs, explain that mortgage insurance protects the lender rather than the borrower, and state what a licensee may and may not say about financing, including the prohibition on predicting rates.",
      "Compute interest, amortization components, points, and the effect of each on cost, explain why early payments on an amortized loan are almost entirely interest and what that means for a borrower who sells before the crossover, distinguish fixed, adjustable, interest-only, and balloon rate structures and state that an adjustable rate at each adjustment is the index plus the lender's margin within the note's caps, and explain what an impound shortage does to a payment a borrower believed was fixed.",
      "Compute loan-to-value and combined loan-to-value and explain why lenders lend against the lower of appraised value and purchase price, compute the front-end and back-end qualifying ratios and explain what each measures without stating a threshold as a rule, identify the buyer actions during escrow that jeopardize an approval and the written warning that prevents them, and explain why misstating occupancy is loan fraud regardless of affordability.",
      "Describe default and explain why the acceleration clause is what makes it consequential, compare the nonjudicial and judicial foreclosure paths on speed, court involvement, deficiency, and redemption, distinguish the reinstatement window from redemption before sale, and state what a licensee says to a distressed client asking whether they will owe a deficiency.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P2 the acceleration-versus-alienation correction (missed payments versus a transfer) teaches
       §1; P1 the assumption-versus-subject-to correction teaches §2; P3 the interest-split, points,
       and break-even computation and P4 the adjustable-rate-at-adjustment correction both teach §4;
       P5 the low-appraisal LTV shortfall, P6 the qualifying-ratio computation with the three-numbers
       and gift-funds analysis, and P7 the escrow-jeopardizing-actions and occupancy-fraud set all
       teach §5; P8 the distressed-homeowner reinstatement, redemption, and deficiency conversation
       teaches §6. §3 (loan markets and sources) has no mapped problem — the documented gap; its
       retrieval check is its active learning. */
    problemMap: { 1: [2], 2: [1], 4: [3, 4], 5: [5, 6, 7], 6: [8] },
  },
};
