/**
 * CA-BLOCK rollout — delivery-layer retrieval banks for Real Estate Principles.
 *
 * Hand-authored after reading each frozen lesson: one primary and one replacement item per
 * substantive block (B1-B6), every proposition traceable to the lesson text, correct answer at
 * index 0 per project convention (permuted at serve). `concept` ties primary to replacement: an
 * incorrect primary routes to `remediationScreen` — an instruction screen of the same block that
 * teaches the missed proposition — and then serves the DIFFERENT replacement question on the same
 * concept, never the same question again. Formative delivery-layer items only: not DRE
 * instruments, not drawn from and never feeding the final-exam bank, and never gating anything
 * regulatory.
 */

export const PRINCIPLES_RETRIEVAL_BANKS = Object.freeze({

  /* ── Assignment 1 — The real estate profession and California regulatory structure ──────── */

  "pr1-b1-q1": {
    blockId: "pr1-b1", concept: "real-property-characteristics", role: "primary",
    replacementId: "pr1-b1-q2", remediationScreen: "pr1-b1-s1",
    prompt: "A buyer is denied the specific parcel she contracted to purchase and, instead of accepting damages, seeks a court order for that exact parcel. Which characteristic of real property explains why courts allow this?",
    choices: [
      "Uniqueness — no two parcels occupy the same location, so a substitute parcel cannot make the buyer whole, and specific performance rather than damages is the appropriate remedy.",
      "Immobility — the parcel cannot be moved to a different jurisdiction.",
      "Indestructibility — the land itself cannot be destroyed.",
      "Scarcity — desirable locations cannot be expanded to meet demand.",
    ],
    correctChoice: 0,
    rationale: "Uniqueness means no two parcels occupy the same location. That is why a buyer who is denied the parcel he contracted for may seek the parcel itself rather than damages, and why valuation is an act of judgment rather than a lookup.",
  },
  "pr1-b1-q2": {
    blockId: "pr1-b1", concept: "real-property-characteristics", role: "replacement",
    replacementId: null, remediationScreen: "pr1-b1-s1",
    prompt: "A landlord grants a ten-year lease, a bank holds a deed of trust on the same building, and a utility company holds an easement across the rear of the lot — all at once, without conflict. Which characteristic of real property makes this layering possible?",
    choices: [
      "Indestructibility — because the land itself endures, interests in it can be carved up and held concurrently or across time, in ways that make no sense for a perishable asset.",
      "Immobility — because the land cannot move, multiple parties can hold interests in it.",
      "Uniqueness — because no two parcels are identical, several parties may hold rights in the same one.",
      "Scarcity — because land in a desirable location is limited, multiple interests naturally accumulate.",
    ],
    correctChoice: 0,
    rationale: "Indestructibility means the land itself endures, though improvements do not. Interests in it can therefore be carved up across time — a life estate now and a remainder afterwards, a lease for ten years, an easement forever — in ways that would be meaningless for a perishable asset.",
  },
  "pr1-b2-q1": {
    blockId: "pr1-b2", concept: "dre-jurisdiction-licensed-activity", role: "primary",
    replacementId: "pr1-b2-q2", remediationScreen: "pr1-b2-s2",
    prompt: "An unpaid volunteer helps a friend list her house on a for-sale-by-owner site, expecting nothing in return and receiving nothing. Is a real estate license required?",
    choices: [
      "No — licensed activity requires acting for another for compensation or the expectation of it; genuine unpaid help between friends, with no expectation of payment, falls outside the license law.",
      "Yes — any assistance with a real property transaction requires a license regardless of payment.",
      "Yes, but only if the friend's house sells for more than a certain amount.",
      "No, because volunteers are categorically exempt from the license law.",
    ],
    correctChoice: 0,
    rationale: "Licensed activity is acting for another, for compensation or the expectation of it. Compensation is central: the expectation of compensation is what converts helping a friend into licensed activity. Genuine unpaid help, with no expectation of payment, is outside the section.",
  },
  "pr1-b2-q2": {
    blockId: "pr1-b2", concept: "dre-jurisdiction-licensed-activity", role: "replacement",
    replacementId: null, remediationScreen: "pr1-b2-s2",
    prompt: "A person calls herself a \"marketing coordinator,\" never negotiates, and is paid $500 for every buyer she introduces who ends up transacting. Does this require a license?",
    choices: [
      "Yes — the activity is what matters, not the title used, and being paid for soliciting or introducing prospective buyers is licensed activity regardless of the job title on a business card.",
      "No, because she never negotiates on anyone's behalf.",
      "No, because her business card describes her as a marketing coordinator, not an agent.",
      "Yes, but only if she is paid more than $1,000 per introduction.",
    ],
    correctChoice: 0,
    rationale: "The activity is what matters, not the title. A person who performs licensed activity without a license does not escape the requirement by calling themselves an assistant, a consultant, or a marketing coordinator — and a per-transaction payment for introducing buyers is a commission in substance, whatever it is called.",
  },
  "pr1-b3-q1": {
    blockId: "pr1-b3", concept: "broker-salesperson-supervision", role: "primary",
    replacementId: "pr1-b3-q2", remediationScreen: "pr1-b3-s1",
    prompt: "A seller wants to cancel her listing and asks the salesperson who took it to release her. The salesperson agrees, saying it's his listing to release. Is he correct?",
    choices: [
      "No — the listing agreement is between the seller and the brokerage, not the individual salesperson; the salesperson performs the work, but cancellation is a broker-level decision governed by the agreement's terms.",
      "Yes, because the salesperson who took the listing has full authority over it.",
      "Yes, as long as the seller agrees in writing.",
      "No, because only the Department of Real Estate can cancel a listing.",
    ],
    correctChoice: 0,
    rationale: "The salesperson's client is the broker's client; the salesperson's contract is the broker's contract. A listing agreement is between the seller and the brokerage, not the individual — the salesperson performs the work, but the brokerage is the party.",
  },
  "pr1-b3-q2": {
    blockId: "pr1-b3", concept: "broker-salesperson-supervision", role: "replacement",
    replacementId: null, remediationScreen: "pr1-b3-s2",
    prompt: "A broker responds to a question about supervision by saying his salespersons are independent contractors for tax purposes, so formal supervision doesn't apply to them. Is this correct?",
    choices: [
      "No — independent contractor status characterizes the tax and compensation relationship only; it does not reduce the broker's supervisory duty or the salesperson's obligation to act under the broker.",
      "Yes, because independent contractors are not subject to a broker's direct control.",
      "Yes, but only for salespersons who have held their license for more than five years.",
      "No, but only because the salespersons in this case work across three offices.",
    ],
    correctChoice: 0,
    rationale: "Many salespersons are treated as independent contractors for tax purposes. That characterization addresses the tax and compensation relationship — it does not reduce the broker's supervisory duty or the salesperson's obligation to act under the broker.",
  },
  "pr1-b4-q1": {
    blockId: "pr1-b4", concept: "scope-and-unauthorized-practice", role: "primary",
    replacementId: "pr1-b4-q2", remediationScreen: "pr1-b4-s1",
    prompt: "A client asks her real estate licensee, \"If I back out of this deal, do I lose my deposit?\" What should the licensee do?",
    choices: [
      "Explain what the contract's procedure provides, but not predict the outcome — entitlement to the deposit is a legal conclusion, and that question should be referred to an attorney.",
      "Give a direct yes-or-no answer based on the licensee's experience with similar deals.",
      "Decline to discuss the contract at all, even procedurally.",
      "Tell the client the deposit is always forfeited when a buyer backs out.",
    ],
    correctChoice: 0,
    rationale: "\"Can I cancel and get my deposit back?\" is a legal conclusion — refer. A licensee may explain what a provision does procedurally, but advising on entitlement to money crosses into the unauthorized practice of law.",
  },
  "pr1-b4-q2": {
    blockId: "pr1-b4", concept: "scope-and-unauthorized-practice", role: "replacement",
    replacementId: null, remediationScreen: "pr1-b4-s1",
    prompt: "Which single question should a licensee ask before answering any question a client raises about a transaction?",
    choices: [
      "Would answering require a legal conclusion? If yes, the question should be referred rather than answered.",
      "How many years of experience does the licensee have with similar questions?",
      "Did the client ask the question directly, or only imply it?",
      "Is the licensee confident in the answer?",
    ],
    correctChoice: 0,
    rationale: "The reliable test is not who asked, not how confident the licensee feels, and not how many years they have practiced: would answering require a legal conclusion? If yes, refer.",
  },
  "pr1-b5-q1": {
    blockId: "pr1-b5", concept: "sources-of-law", role: "primary",
    replacementId: "pr1-b5-q2", remediationScreen: "pr1-b5-s2",
    prompt: "A licensee tells a client that a provision in a standard association form is \"required by law.\" What is the problem with this statement, if the licensee has not actually checked the current statute?",
    choices: [
      "Forms and publications are not law — a form's language may be superseded by a change in law or may address matters the law does not require at all, so describing a form provision as a legal requirement without knowing it is one misstates the law to a client.",
      "There is no problem, because association forms are always kept current with the law.",
      "The problem is only that the licensee should have used the DRE's version of the form instead.",
      "There is no problem as long as the client does not ask a follow-up question.",
    ],
    correctChoice: 0,
    rationale: "DRE publications, association forms, and standard contracts are useful and widely used, but they are not statutes. Check the current version before relying on it, and do not describe a form provision as a legal requirement without knowing that it is one.",
  },
  "pr1-b5-q2": {
    blockId: "pr1-b5", concept: "sources-of-law", role: "replacement",
    replacementId: null, remediationScreen: "pr1-b5-s1",
    prompt: "A brokerage's office policy on advertising review is stricter than what the law requires. A salesperson skips the office review, saying \"the law doesn't require it.\" Is the salesperson correct to skip it?",
    choices: [
      "No — a brokerage policy stricter than the law still governs the licensee's conduct; citing the law does not excuse departing from office policy.",
      "Yes, because the law always overrides brokerage policy.",
      "Yes, as long as the advertisement is accurate.",
      "No, but only because advertising review is a DRE requirement, not a brokerage one.",
    ],
    correctChoice: 0,
    rationale: "A brokerage policy stricter than the law governs the licensee's conduct. A licensee who says \"the law doesn't require that\" while departing from office policy has answered a question nobody asked.",
  },
  "pr1-b6-q1": {
    blockId: "pr1-b6", concept: "transaction-accountability", role: "primary",
    replacementId: "pr1-b6-q2", remediationScreen: "pr1-b6-s1",
    prompt: "In a failed transaction, the seller's disclosure was never evidenced as delivered because each side assumed the other had sent it. What does this pattern illustrate?",
    choices: [
      "Accountability gaps usually arise not because a participant performed badly, but because everyone assumed someone else owned a task that nobody actually owned — the control is naming one person, one date, and evidence when done.",
      "The seller is always solely responsible for any disclosure failure, regardless of the circumstances.",
      "Escrow should have caught the missing disclosure, since escrow tracks all contract deadlines.",
      "Disclosure delivery failures are rare and this pattern is unusual.",
    ],
    correctChoice: 0,
    rationale: "Accountability rarely fails because a participant did their job badly. Usually everyone assumed someone else would do a job nobody owned. The control is ownership: one named person, one date, and evidence when it is done.",
  },
  "pr1-b6-q2": {
    blockId: "pr1-b6", concept: "transaction-accountability", role: "replacement",
    replacementId: null, remediationScreen: "pr1-b6-s2",
    prompt: "A licensee expects escrow to resolve a disagreement between the buyer and seller about a repair credit. Is this a correct expectation of escrow's role?",
    choices: [
      "No — escrow is neutral, acts only on mutual written instructions, does not advise either party, and does not decide disputes; where the parties disagree, escrow stops.",
      "Yes, because escrow is responsible for resolving any dispute that arises during a transaction.",
      "Yes, but only for disputes involving repair credits specifically.",
      "No, because escrow only handles disputes larger than $1,000.",
    ],
    correctChoice: 0,
    rationale: "Escrow is neutral. It holds funds and documents and acts only on mutual written instructions. It does not advise either party, does not decide disputes, and does not release funds because one party asserts entitlement. Where the parties disagree, escrow stops.",
  },
});
