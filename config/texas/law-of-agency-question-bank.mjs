/**
 * Texas Law of Agency — formative assessment bank (topic quizzes and their replacement items).
 *
 * WHAT THIS BANK IS AND IS NOT. These are the course's FORMATIVE instruments: the topic quizzes a
 * student must clear before the delivery engine will open the next topic. They are instructional
 * artifacts — every item teaches through its rationale. This file is NOT the final examination,
 * which lives in config/texas/law-of-agency-final-exam-bank.mjs, is confidential, and is separated
 * from this bank by an automated similarity check in scripts/validate-loa-assessments.mjs.
 *
 * THE REGULATORY BASIS, READ BY SUBSECTION. Every requirement below is registered in
 * config/texas/trec-rules-source-lock.mjs with its own subsection and held text, and this file
 * reads the numeric one by its exact key name rather than restating it.
 *
 *   22 TAC § 535.62(b)(7)(A) — "topic quizzes, with at least three questions related to the subject
 *   matter in each course topic." PER TOPIC. That floor is why T08 carries three primary items
 *   across its two units while every other topic carries one per unit: 58 primaries over 57 units.
 *
 *   22 TAC § 535.62(b)(7)(C)(i) — distance delivery must prevent a student moving from one topic to
 *   the next "until the student answers all topic quiz questions correctly." The gate is ALL
 *   CORRECT, not a percentage. That governs how these items are written: each has exactly one
 *   defensible answer traceable to a named provision, the distractors are wrong for a reason a
 *   rationale can state, and no item turns on a fact the required instruction does not supply. A
 *   student who has read the required screens must be able to reach the gate.
 *
 *   22 TAC § 535.62(b)(7)(C)(ii) — an incorrect answer must produce the rationale for the correct
 *   answer AND "a subsequent related quiz question that will count toward passing the topic if
 *   answered correctly." The REPLACEMENTS map below is that subsequent question. It is a rule
 *   requirement, not a StateCourse nicety, which is why every primary has exactly one and the
 *   load-time invariants refuse to load the bank if one is missing.
 *
 *   22 TAC § 535.62(b)(8)(B) — "does not contain any true/false questions." The rule states that
 *   prohibition FOR THE FINAL EXAMINATION VERSIONS. It says nothing about topic quizzes. Extending
 *   it to this formative bank is a StateCourse policy choice and is recorded as one here and in the
 *   rule lock's provenance note; do not describe the four-option rule below as regulator-derived.
 *
 * WHY A REPLACEMENT IS NOT A REWORDED TWIN. The point of the successor question is that a student
 * who got the primary wrong, read the rationale, and then answers the successor correctly has
 * demonstrated they now know the RULE — not that they remember which option was wrong last time.
 * Every replacement here therefore changes the fact pattern, or takes the same provision at a
 * different point in its operation, or moves to the provision's mirror image. The validator fails a
 * pair at or above 0.75 Jaccard on the prompt; the load-time guard below is set at 0.60, because
 * the validator's threshold is a floor and not a target.
 *
 * WHAT NO ITEM MAY DEPEND ON. Modules 02, 03, 07, 09, 10, 11 and 12 each carry an
 * "## Optional reference:" section, generated into the block maps as a block with required: false,
 * nonBlocking: true and noAssessmentMayDependOnThis: true. A student who skips every one of them
 * must be able to answer every item in this bank. Each item therefore names the REQUIRED block-map
 * screen it is answerable from, and a load-time invariant resolves that screen id against the
 * generated block map and refuses to load if the screen sits in an optional block. Four optional
 * sections also state affirmatively that no required question asks a particular thing — Module 07's
 * date arithmetic on 22 TAC § 535.146(d), Module 10's penalty computation, Module 02's point about
 * payment not answering representation, and Module 03's point that three named rules never use the
 * phrase "third party" — and no item here asks any of them.
 *
 * THE SEVEN MISCONCEPTION CHECKS ARE NOT QUIZ ITEMS AND ARE NOT DUPLICATED HERE.
 * config/texas/law-of-agency-misconception-checks.mjs holds seven FORMATIVE_INSTRUCTIONAL items with
 * countsAsAssessment: false. They are counted once, as instruction. No item in this bank tests the
 * judgement any of them tests, and the seven judgements deliberately left to them are: that the
 * source of payment does not decide whom you represented (MC-T01, T01U3); that delivering the IABS
 * notice creates nothing (MC-T02, T02U5); that § 1101.563(b) requires the written agreement before
 * a residential showing (MC-T05, T05U3); that Texas has no dual-agency capacity to consent into
 * (MC-T06, T06U5); that § 1101.651(d) states no expiry for confidentiality (MC-T07, T07U3); that
 * 22 TAC § 531.19 reaches responding to and facilitating an inquiry, not only stating a preference
 * (MC-T10, T10U2); and that a team name must be registered with the Commission and carry the
 * broker's name (MC-T12, T12U4). A load-time guard also measures prompt similarity against all
 * seven and refuses to load on a near-copy, but the guard is a backstop: the non-duplication of the
 * judgement is an authoring obligation, not a token count.
 *
 * TRACEABILITY. Every item carries, and the invariants check: `tests`, the LOA-1 unit code from
 * config/texas/law-of-agency-course-form.mjs, from which the official topic is the first three
 * characters; `module`, the frozen curriculum module; `screen`, the REQUIRED block-map screen id it
 * is answerable from; `source` and `section`, the controlling authority; and `judgement`, the single
 * decision the item asks the student to make. The learning objective is not copied here — it is
 * UNIT_OBJECTIVES[item.tests] in config/texas/law-of-agency-course.mjs, and an invariant asserts the
 * key exists, so an objective can never drift out of step with a copy of itself.
 *
 * THE CURRICULUM IS FROZEN at LOA-CONTENT-FREEZE-2026-08-30-v3. Nothing under
 * texas/tx-law-of-agency-30-v1/ was edited to make an item answerable. Where a unit made a good item
 * hard to write, the item was written narrower rather than the prose written wider.
 *
 * AUTHORING CONVENTION. The correct answer is authored FIRST in every item, primary and replacement
 * alike; the delivery engine permutes the choices deterministically from the item id at serve time,
 * exactly as the Principles I, Principles II and California banks do. The project-wide walk in
 * tests/question-bank-integrity.test.mjs asserts index 0 across every bank, because an author who
 * moves the answer breaks nothing visibly — the item still renders, and the recorded selected_choice
 * simply stops meaning what the record says it means.
 */

import { TOPICS, ALL_UNITS } from "./law-of-agency-course-form.mjs";
import { UNIT_OBJECTIVES } from "./law-of-agency-course.mjs";
import { MISCONCEPTION_CHECKS } from "./law-of-agency-misconception-checks.mjs";
import { ASSESSMENT_REQUIREMENTS } from "./trec-rules-source-lock.mjs";

import { MODULE_1_BLOCKS } from "./law-of-agency-module-1-blocks.mjs";
import { MODULE_2_BLOCKS } from "./law-of-agency-module-2-blocks.mjs";
import { MODULE_3_BLOCKS } from "./law-of-agency-module-3-blocks.mjs";
import { MODULE_4_BLOCKS } from "./law-of-agency-module-4-blocks.mjs";
import { MODULE_5_BLOCKS } from "./law-of-agency-module-5-blocks.mjs";
import { MODULE_6_BLOCKS } from "./law-of-agency-module-6-blocks.mjs";
import { MODULE_7_BLOCKS } from "./law-of-agency-module-7-blocks.mjs";
import { MODULE_8_BLOCKS } from "./law-of-agency-module-8-blocks.mjs";
import { MODULE_9_BLOCKS } from "./law-of-agency-module-9-blocks.mjs";
import { MODULE_10_BLOCKS } from "./law-of-agency-module-10-blocks.mjs";
import { MODULE_11_BLOCKS } from "./law-of-agency-module-11-blocks.mjs";
import { MODULE_12_BLOCKS } from "./law-of-agency-module-12-blocks.mjs";

const BLOCK_MAPS = Object.freeze({
  "module-01": MODULE_1_BLOCKS, "module-02": MODULE_2_BLOCKS, "module-03": MODULE_3_BLOCKS,
  "module-04": MODULE_4_BLOCKS, "module-05": MODULE_5_BLOCKS, "module-06": MODULE_6_BLOCKS,
  "module-07": MODULE_7_BLOCKS, "module-08": MODULE_8_BLOCKS, "module-09": MODULE_9_BLOCKS,
  "module-10": MODULE_10_BLOCKS, "module-11": MODULE_11_BLOCKS, "module-12": MODULE_12_BLOCKS,
});

/* The correct answer is authored first and the factory, not the author, sets correctChoice. */
const build = (kind, o) => Object.freeze({ ...o, kind, choices: Object.freeze(o.choices), correctChoice: 0 });
const quiz = (o) => build("PRIMARY", o);
const repl = (o) => build("REPLACEMENT", o);

/* ── PRIMARY ITEMS ─────────────────────────────────────────────────────────────────────────────
   One per LOA-1 unit, in the form's own topic and unit order, with T08 carrying a third so that
   22 TAC § 535.62(b)(7)(A)'s floor of three questions per course topic is met in a topic the form
   gives only two units. */

export const TOPIC_QUIZZES = Object.freeze({
  T01: Object.freeze([
    quiz({
      id: "LOA-T01U1-Q", tests: "T01U1", module: "module-01", screen: "t01u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.002(1)(A)",
      judgement: "Whether an unpaid person who performed one enumerated act for another is inside the statutory definition of a broker.",
      prompt: "Over one weekend an unlicensed man in Tyler introduces an investor to the owner of a twelve-unit building, sits in on two negotiating sessions, and tells friends he expects the investor will look after him if it closes. The sale falls through and he is paid nothing. He says the Real Estate License Act cannot reach him because he never received a commission and never listed anything. Evaluate that under § 1101.002(1)(A).",
      choices: [
        "He is inside the definition. Subdivision (1)(A) reaches a person acting for another either in exchange for a commission or other valuable consideration or with the expectation of receiving one, and it takes only one of the enumerated acts — negotiating or attempting to negotiate the sale is expressly among them.",
        "He is outside the definition, because the opening clause of subdivision (1)(A) is satisfied only where consideration actually changes hands.",
        "He is outside the definition, because a person must perform several of the enumerated acts before the definition is satisfied and he performed only one.",
        "He is outside the definition, because the enumerated acts reach only a completed sale, exchange, purchase or lease and this transaction never closed.",
      ],
      rationale: "Section 1101.002(1)(A) opens by reaching a person who acts for another “in exchange for a commission or other valuable consideration or with the expectation of receiving a commission or other valuable consideration,” so the expectation alone engages the statute and “I was never paid” is not the defence students assume. The subdivision then requires only “one of the following acts,” and clause (iii) names one who “negotiates or attempts to negotiate” a sale — an attempt, not a closing. Section 1101.004(a) restates the same idea as a status and reaches an act performed “as a part of a transaction or as an entire transaction.”",
    }),
    quiz({
      id: "LOA-T01U2-Q", tests: "T01U2", module: "module-01", screen: "t01u2-s1",
      source: "Texas Occupations Code", section: "§§ 1101.753(a), 1101.754(a)",
      judgement: "That the civil penalty for unlicensed brokerage is measured against the money received and is available twice, to the State and to the aggrieved person.",
      prompt: "An unlicensed person collects a $9,000 fee for finding a buyer for a house in Tyler. State the range of civil penalty exposure created by § 1101.753(a) and § 1101.754(a) together, and say how the two provisions relate to each other.",
      choices: [
        "Each section separately allows not less than the amount received and not more than three times it — $9,000 to $27,000 each — and the two are separate provisions running to different claimants, the State and the aggrieved person, so the exposure from the two together tops out at $54,000 on top of the $9,000 collected.",
        "The two sections state one penalty that either the State or the aggrieved person may pursue, so the maximum exposure is $27,000 and whichever claimant sues first forecloses the other.",
        "Each section allows a flat penalty of three times the amount received with no minimum, so the exposure is $27,000 to the State and nothing separately to the aggrieved person.",
        "Neither section applies until the Commission has first imposed an administrative penalty under § 1101.702, which caps the total exposure at $5,000.",
      ],
      rationale: "Section 1101.753(a) makes a person who receives a commission or other consideration for acting as a broker or sales agent without a licence liable to the state for a civil penalty of “not less than the amount of money received or more than three times the amount of money received,” and § 1101.754(a) gives an aggrieved person the same range privately. They are separate provisions with separate claimants, so on a $9,000 fee the arithmetic is $9,000–$27,000 twice, $54,000 at the top, and § 1101.801 confirms that a disciplinary action does not relieve a person of civil or criminal liability besides.",
    }),
    quiz({
      id: "LOA-T01U3-Q", tests: "T01U3", module: "module-01", screen: "t01u3-s1",
      source: "Texas Occupations Code", section: "§ 1101.551(2)",
      judgement: "Who counts as a party under the statute's own definition, and that a license holder representing a party is expressly excluded from it.",
      prompt: "A Fort Worth transaction involves an unrepresented seller, an executor selling a second property out of an estate, a buyer represented by another brokerage, and that buyer's sales agent. Applying the definition of “party” in § 1101.551(2), which of them are parties?",
      choices: [
        "The unrepresented seller, the executor and the represented buyer are parties; the buyer's sales agent is not, because the definition ends by providing that the term “does not include a license holder who represents a party.”",
        "All four are parties, because the definition reaches everyone with a role in the transaction.",
        "Only the unrepresented seller and the represented buyer are parties; an executor is an authorised representative rather than a party, and the sales agent is excluded.",
        "Only the unrepresented seller is a party, because the definition excludes anyone who is represented by a license holder as well as the license holder.",
      ],
      rationale: "Section 1101.551(2) defines a party as “a prospective buyer, seller, landlord, or tenant or an authorized representative of a buyer, seller, landlord, or tenant, including a trustee, guardian, executor, administrator, receiver, or attorney-in-fact,” and then adds that the term “does not include a license holder who represents a party.” An executor is named in the definition, so the estate's representative is inside it; being represented does not remove a buyer from it; and the exclusion of the counterpart's license holder is why a duty owed to a party is not discharged by telling that party's agent something and assuming it landed.",
    }),
    quiz({
      id: "LOA-T01U4-Q", tests: "T01U4", module: "module-01", screen: "t01u4-s1",
      source: "Texas Occupations Code", section: "§§ 1101.557(a), 1101.806(c)",
      judgement: "The asymmetry between conduct that creates agency duties and the signed writing that creates an enforceable commission claim.",
      prompt: "A Round Rock license holder drives a couple to showings for three months, advises them on price, and writes their offer. Nothing was ever signed. The couple close with someone else and the license holder wants to sue for a fee. Reading § 1101.557(a) against § 1101.806(c), what is the position?",
      choices: [
        "The duties may well have attached and the fee claim has not: § 1101.557(a) makes a broker who “represents a party” that party's agent without requiring any signature, while § 1101.806(c) bars an action to recover a commission unless the promise or a memorandum of it is in writing and signed by the party against whom the action is brought.",
        "Both follow the same rule, so with nothing signed there is neither an agency relationship nor a fee claim.",
        "Both follow the same rule the other way, so the three months of conduct created an agency and, with it, an enforceable claim for a reasonable commission.",
        "The fee claim survives because § 1101.806(c) is satisfied by a memorandum signed by the broker recording the arrangement.",
      ],
      rationale: "Section 1101.557(a) fixes agency on what the broker is doing — representing a party, or listing under an exclusive agreement — and contains no signature requirement, while § 1101.806(c) conditions any action to recover a commission on a writing “signed by the party against whom the action is brought or by a person authorized by that party to sign the document.” Your own signature proves nothing. That asymmetry is the whole hazard: behaving as an agent can create obligations, and only a signed writing creates a claim to be paid for them.",
    }),
  ]),
  T02: Object.freeze([
    quiz({
      id: "LOA-T02U1-Q", tests: "T02U1", module: "module-02", screen: "t02u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.557(a)",
      judgement: "That the representation relationship the statute recognises runs to the broker, with the sales agent acting for that broker.",
      prompt: "An Amarillo seller signs an exclusive listing negotiated at her kitchen table by a sales agent she has known for years. She tells a neighbour that the sales agent is “my agent.” Under § 1101.557(a) and the definitions that surround it, whose agent is the seller's agent?",
      choices: [
        "The broker's. Section 1101.557(a) makes a broker who lists real estate under an exclusive agreement for a party that party's agent, § 1101.002(7) defines a sales agent by sponsorship, and § 1101.351(c) permits a sales agent to act only while sponsored by and acting for that broker.",
        "The sales agent's, because the sales agent negotiated the listing and the seller dealt with nobody else.",
        "Both equally, because a sales agent and a sponsoring broker hold the client relationship jointly once a listing is signed.",
        "Neither until the Commission is notified of the listing, at which point the relationship attaches to whichever license holder is named on the notice.",
      ],
      rationale: "Section 1101.557(a) is written about a broker: “A broker who represents a party in a real estate transaction or who lists real estate for sale under an exclusive agreement for a party is that party's agent.” Section 1101.002(7) then defines a sales agent as a person “sponsored by a licensed broker for the purpose of performing an act described by Subdivision (1),” and § 1101.351(c) requires the sales agent to be sponsored and to be acting for that broker. You service the client and can be disciplined personally, but the representation the statute recognises is between the seller and the broker — which is also why § 1101.803 puts your conduct on the broker's licence.",
    }),
    quiz({
      id: "LOA-T02U2-Q", tests: "T02U2", module: "module-02", screen: "t02u2-s1",
      source: "22 TAC", section: "§ 535.2(a)",
      judgement: "That a written scope protects a broker only while the broker enforces it, and that a limitation on scope must itself be written.",
      prompt: "A broker's written notice to a sponsored sales agent limits her authorised activities to residential resale. The broker later tells her by telephone not to touch commercial leases, then watches her run three of them over six months without objecting. A complaint arrives out of the third. Apply the three sentences of 22 TAC § 535.2(a).",
      choices: [
        "The broker is responsible. A limitation or revocation of the written scope must itself be in writing, so the telephone instruction did not shrink it, and the rule's third sentence makes acts the broker permits beyond the explicitly authorised scope acts for which the broker is responsible.",
        "The broker is not responsible, because the commercial leases fell outside the scope the broker authorised in writing and responsibility follows the written scope exactly.",
        "The broker is not responsible, because the rule expressly relieves a broker who is not required to supervise sponsored sales agents directly.",
        "The broker is responsible only for the first lease, because permitting an act outside scope makes the broker responsible until the broker objects, and six months of silence is an objection by conduct.",
      ],
      rationale: "22 TAC § 535.2(a) carries three rules in three sentences. The broker must notify a sponsored sales agent in writing of the scope of authorised activities. The broker is responsible for the authorised acts “[u]nless such scope is limited or revoked in writing” — so an oral instruction does not narrow the written scope for this rule's purposes. And “[i]f a broker permits a sponsored sales agent to conduct activities beyond the scope explicitly authorized by the broker, those are acts for which the broker is responsible.” The middle sentence's statement that the broker “is not required to supervise the sales agents directly” answers how, not whether, the broker answers.",
    }),
    quiz({
      id: "LOA-T02U3-Q", tests: "T02U3", module: "module-02", screen: "t02u3-s1",
      source: "Texas Occupations Code", section: "§ 1101.557(c)(1)",
      judgement: "Why a residential listing or buyer representation agreement is a special agency rather than a grant of authority to bind the client.",
      prompt: "A buyer client is on a flight and texts her sales agent: “Just sign the counter-offer for me, you know what I want.” The agent holds a signed exclusive buyer representation agreement and nothing else. What does the held Texas text say about the authority that agreement confers?",
      choices: [
        "It confers no authority to bind. Section 1101.557(c)(1) identifies a power of attorney and a property management agreement as the instruments under which a license holder has authority to bind a party to a lease or sale; a representation agreement is not among them, so the agent negotiates and the client signs.",
        "It confers authority to bind, because an exclusive agreement makes the broker the party's agent under § 1101.557(a) and an agent may execute documents for the principal.",
        "It confers authority to bind provided the instruction is in writing, which the text message supplies.",
        "It confers authority to bind for a counter-offer but not for the original contract, because a counter-offer only modifies terms the client already authorised.",
      ],
      rationale: "The traditional universal, general and special agency labels are classical vocabulary that no Texas statute or Commission rule held for this course defines, so the answer comes from the text instead. Section 1101.557(c)(1) provides that “a license holder who has the authority to bind a party to a lease or sale under a power of attorney or a property management agreement is also a party to the lease or sale.” The Legislature named the two instruments that confer binding authority, and an ordinary listing or representation agreement is not one of them. Sections 1101.652(b)(19) and (20) confirm the limit from the disciplinary side: an agent who could bind the client would not need the client's authorisation for terms.",
    }),
    quiz({
      id: "LOA-T02U4-Q", tests: "T02U4", module: "module-02", screen: "t02u4-s1",
      source: "22 TAC", section: "§ 535.157",
      judgement: "Exactly which three categories of person the two-calendar-day response obligation runs to.",
      prompt: "In one afternoon a sales agent receives messages from her own seller client, from the buyer's agent at another brokerage, from a for-sale-by-owner asking about a buyer she represents, from the title company, and from a neighbour with no transaction who is curious about the sign. To how many of the five does 22 TAC § 535.157 give a right to a response within two calendar days?",
      choices: [
        "Three — the principal, the license holder representing another party, and the unrepresented party to a real estate transaction. The rule names those three categories and no others, so the title company and the curious neighbour are outside its terms.",
        "All five, because the rule reaches any person who contacts a license holder about a listed property.",
        "Two — the principal and the license holder representing another party — because an unrepresented person is a customer and the rule runs only to those inside a representation relationship.",
        "Four — everyone except the neighbour, because a title company is a party to the real estate transaction it is closing.",
      ],
      rationale: "22 TAC § 535.157 is one sentence: “A broker or sales agent must respond to his or her principal, a broker or sales agent representing another party to a real estate transaction, or an unrepresented party to a real estate transaction within two calendar days.” Three categories, stated exhaustively. A title company, an inspector, a lender and a member of the public who is not a party to a transaction are outside the rule's own words, and so is a represented party you deal with through that party's license holder. The rule also says nothing about the form of the response, so an acknowledgement that names when a full answer will follow satisfies it.",
    }),
    quiz({
      id: "LOA-T02U5-Q", tests: "T02U5", module: "module-02", screen: "t02u5-s1",
      source: "Texas Occupations Code", section: "§ 1101.558(c)(3)",
      judgement: "How narrow the open-house exception to the written IABS notice is, and that it does not touch the § 1101.558(b) representation disclosure.",
      prompt: "You are hosting an open house at your brokerage's own listing on Ocean Drive. A visitor asks about the flood history of that house, and then asks you to help her lease out her own condominium on Alameda Street for eight months. Apply § 1101.558(c)(3) to the two conversations.",
      choices: [
        "The exception covers the first conversation and not the second: it relieves the written notice only where the communication occurs at a property held open for prospective buyers or tenants and the communication concerns that property, and the condominium conversation concerns a different property.",
        "The exception covers both conversations, because both occurred at a property held open to prospective buyers.",
        "The exception covers neither, because it applies only where the visitor is already represented by another license holder.",
        "The exception covers both and also relieves the § 1101.558(b) disclosure of whom you represent, because an open house is a single communication event.",
      ],
      rationale: "Section 1101.558(c)(3) is narrow in two ways at once: the property must be “held open for any prospective buyer or tenant” and “the communication concerns that property.” Turn the conversation to the visitor's own condominium and the exception by its terms no longer covers that communication. Two further limits matter. The three exceptions in subsection (c) relieve only “the notice required by Subsection (b-1)” — they never touch the subsection (b) disclosure of whom you represent, which is owed at first contact and may be made orally. And the eight-month lease is not saved by exception (c)(1) either, which requires both a residential lease of less than one year and that no sale is being considered.",
    }),
  ]),
  T03: Object.freeze([
    quiz({
      id: "LOA-T03U1-Q", tests: "T03U1", module: "module-03", screen: "t03u1-s1",
      source: "22 TAC", section: "§§ 531.2, 535.156",
      judgement: "Which duties a Texas license holder owes a person the license holder does not represent, and which are owed to the client alone.",
      prompt: "An unrepresented buyer tours your seller client's house in Round Rock, asks whether the foundation has moved, asks what he should offer, and asks you to press the seller for a faster closing date. Which of those three requests engage a duty you owe him?",
      choices: [
        "Only the foundation question. Honesty, fairness, accurate information and disclosure of a known significant defect run to a person you do not represent; advocacy on price and negotiating help are the content of representation and are owed to your client alone.",
        "All three, because 22 TAC § 531.2 requires the license holder to treat other parties to a transaction fairly and fairness means giving them the same service the client receives.",
        "None of the three, because duties of any kind arise only from a representation relationship and this buyer has none.",
        "Only the offer and closing-date questions, because those concern the transaction while property condition is the seller's disclosure obligation rather than yours.",
      ],
      rationale: "22 TAC § 531.2 makes the primary duty representation of the client's interests and then adds, in the same sentence, “that, however, the license holder, in performing duties to the client, shall treat other parties to a transaction fairly.” 22 TAC § 535.156 puts honest and fair dealing with all parties alongside a free-standing duty “to convey accurate information to members of the public with whom the license holder deals,” and § 1101.652(b)(4) makes failing to disclose a known significant defect to a “potential buyer” a disciplinary ground — a potential buyer is not your client. What the other side is not owed is loyalty, confidentiality, advocacy, or advice about whether the deal is good for them.",
    }),
    quiz({
      id: "LOA-T03U2-Q", tests: "T03U2", module: "module-03", screen: "t03u2-s1",
      source: "22 TAC", section: "§ 535.156",
      judgement: "That fairness to the other side constrains accuracy rather than requiring neutrality.",
      prompt: "Representing a seller, you want to move a hesitant buyer's agent along. Which of the following is consistent with the duty to deal honestly and fairly with all parties while still representing only your principal?",
      choices: [
        "Declining to say anything about your seller's motivation, while stating the terms of the competing offer accurately and giving a deadline your seller has actually set.",
        "Telling the buyer's agent that a competing offer is $8,000 higher than it is, on the view that hard negotiation is what the seller is paying for.",
        "Telling the buyer's agent your seller will take less than the asking price, because fairness to the other side means putting them on an equal footing.",
        "Inventing a Friday deadline that no one has set, because a deadline is a negotiating posture rather than a statement of fact about the property.",
      ],
      rationale: "22 TAC § 535.156 states both halves in one sentence: “A license holder must deal honestly and fairly with all parties; however, the license holder represents only the principal and owes a duty of fidelity to such principal.” Fairness is not neutrality — you may negotiate hard, decline to volunteer your client's motivation, and advocate a repair position. What you may not do is misstate a competing offer or invent a deadline, because 22 TAC § 531.3 requires “prudence and caution so as to avoid misrepresentation, in any way, by acts of commission or omission” and § 1101.652(b)(2) reaches dishonest conduct without proof that anyone lost money. Volunteering that the seller will take less is not required of anyone: § 1101.651(d)(1) forbids even an intermediary to do it.",
    }),
    quiz({
      id: "LOA-T03U3-Q", tests: "T03U3", module: "module-03", screen: "t03u3-s1",
      source: "22 TAC", section: "§ 535.156",
      judgement: "That a person outside the statutory definition of party is still owed accurate information as a member of the public.",
      prompt: "You tell the appraiser on your listing that the seller's rear addition was permitted, knowing the seller told you it was not. The appraiser is not a buyer and buys nothing. Which analysis is correct?",
      choices: [
        "An appraiser is not a “party” under § 1101.551(2) and is not a potential buyer under § 1101.652(b)(4), but is a member of the public with whom you deal, so 22 TAC § 535.156's duty to convey accurate information reaches the statement, as do 22 TAC § 531.3 and § 1101.652(b)(2).",
        "No duty is engaged, because the duty to convey accurate information runs only to parties to the transaction as § 1101.551(2) defines them.",
        "No duty is engaged, because the statement concerns permitting rather than a significant defect and § 1101.652(b)(4) is the only provision that reaches statements about a property.",
        "A fiduciary duty is engaged, because an appraiser retained in your client's transaction is a subagent of the broker who ordered the appraisal.",
      ],
      rationale: "Section 1101.551(2) defines “party” as a prospective buyer, seller, landlord or tenant or an authorised representative of one, and excludes a license holder who represents a party; TRELA never defines “third party” at all. Inspectors, lenders, escrow officers, appraisers and surveyors are outside that definition, which is exactly why the working definition has to be built from 22 TAC § 535.156, whose duty “to convey accurate information to members of the public with whom the license holder deals” names no client and no party. The vocabulary changes and the exposure does not: § 531.3 reaches the carelessness and § 1101.652(b)(2) reaches the dishonesty.",
    }),
    quiz({
      id: "LOA-T03U4-Q", tests: "T03U4", module: "module-03", screen: "t03u4-s1",
      source: "Texas Occupations Code", section: "§ 1101.805(e)",
      judgement: "The two conjunctive conditions on which the license holder's protection from a party's misrepresentation fails, and the exact word the statute uses.",
      prompt: "A seller tells her listing agent the roof is eight years old and the agent repeats it. Two weeks later the agent finds an invoice showing a temporary patch and a recommendation to replace, and says nothing. Apply § 1101.805(e) before and after the discovery.",
      choices: [
        "Before the discovery the section protects him, because it drops only where the license holder both knew of the falsity and failed to disclose that knowledge; after the discovery the first condition is satisfied and his silence satisfies the second, so the protection is gone.",
        "The section never protected him, because repeating a seller's statement without verifying it means he had reason to doubt it, and reason to doubt is enough to defeat the section.",
        "The section protects him throughout, because the statement was the seller's and subsection (e) shields a license holder from any misrepresentation made by a party.",
        "The section stops protecting him at the moment of discovery whatever he does next, because knowledge alone defeats it.",
      ],
      rationale: "Section 1101.805(e) provides that a license holder is not liable for a misrepresentation or concealment of a material fact made by a party “unless the license holder: (1) knew of the falsity … and (2) failed to disclose the license holder's knowledge of the falsity.” Both conditions, joined by “and,” and the word is “knew” — not “should have known” and not “was negligent in believing.” A license holder who learns a statement is false and does disclose that knowledge has satisfied the second condition and remains protected. Note the section's limits: it shields the party's statement, not the license holder's own assertion, and it does nothing about discipline, where § 1101.652(b)(1) reaches negligence and 22 TAC § 535.156 requires accurate information regardless.",
    }),
    quiz({
      id: "LOA-T03U5-Q", tests: "T03U5", module: "module-03", screen: "t03u5-s1",
      source: "Texas Property Code", section: "§ 5.008(f)",
      judgement: "When the seven-day termination right begins to run and what condition, if any, the buyer must satisfy to use it.",
      prompt: "A contract on a single-family house in Kyle goes effective with no seller's disclosure notice delivered. The seller finally delivers the notice on day twelve. The buyer reads it, finds nothing objectionable, and decides two days later that he no longer likes the neighbourhood. Apply Property Code § 5.008(f).",
      choices: [
        "He may terminate. The subsection gives a purchaser who contracted without the notice the right to terminate “for any reason within seven days after receiving the notice,” so the clock started on receipt at day twelve and no reason connected to the notice is required.",
        "He may not terminate, because the seven days ran from the effective date of the contract and expired before the notice arrived.",
        "He may not terminate, because the right exists only where the notice, once delivered, discloses a condition the buyer objects to.",
        "He may terminate at any time and recover damages, because the subsection makes late delivery a breach for which it prescribes both termination and a damages remedy.",
      ],
      rationale: "Section 5.008(f) sets delivery “on or before the effective date of an executory contract binding the purchaser to purchase the property,” and then provides that if a contract is entered without the notice “the purchaser may terminate the contract for any reason within seven days after receiving the notice.” Three points follow: the clock runs from receipt, so a seller who delivers late on day twelve starts a fresh seven days and a seller who never delivers never starts it at all; the right is unconditional, because the statute says “for any reason”; and the subsection states no damages remedy and no exclusivity clause — compare § 5.012(e), which does make termination the purchaser's exclusive remedy for a different notice.",
    }),
    quiz({
      id: "LOA-T03U6-Q", tests: "T03U6", module: "module-03", screen: "t03u6-s1",
      source: "Texas Occupations Code", section: "§ 1101.556(2)",
      judgement: "That the qualifier “unrelated to the condition of the property” removes the relief precisely where the death was caused by a defect.",
      prompt: "A tenant died on your listing after falling through a section of the rear deck that had rotted. A prospective buyer asks whether anything has happened at the property. What does § 1101.556 do here?",
      choices: [
        "It relieves you of nothing on these facts. Subdivision (2) covers a death “by natural causes, suicide, or accident unrelated to the condition of the property,” and this death was caused by the property's condition — and if you know of the defect, § 1101.652(b)(4) requires you to disclose it to a potential buyer.",
        "It relieves you of any duty to inquire about or disclose the death, because a fall is an accident and subdivision (2) covers accidents without qualification.",
        "It relieves you of the duty to disclose the death and independently forbids you to disclose the deck's condition, because information about a prior occupant is protected.",
        "It relieves you of nothing, because § 1101.556 applies only to a seller and Property Code § 5.008(c) is the provision that would apply to a license holder.",
      ],
      rationale: "Section 1101.556 says that, notwithstanding other law, a license holder is not required to inquire about, disclose or release information relating to a prior or current occupant's AIDS, HIV-related illness or HIV infection, or to whether “a death occurred on a property by natural causes, suicide, or accident unrelated to the condition of the property.” The last five words are the qualifier students drop, and they are the whole answer here: a death caused by the property's condition is outside the relief, and the condition that caused it is very likely a significant defect that § 1101.652(b)(3) and (b)(4) require you to disclose to a potential buyer. Property Code § 5.008(c) states the same relief on the seller's side and carries the identical qualifier.",
    }),
  ]),
  T04: Object.freeze([
    quiz({
      id: "LOA-T04U1-Q", tests: "T04U1", module: "module-04", screen: "t04u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.806(c)",
      judgement: "Whose signature the commission-writing statute requires, and what follows when only one of two owners signed.",
      prompt: "A Waco listing agreement is signed by only one of two spouses who jointly own the property. The house sells and both refuse to pay. The broker wants to sue both. Apply § 1101.806(c).",
      choices: [
        "The writing requirement is satisfied only as against the spouse who signed, because the subsection requires the promise or a memorandum of it to be signed by “the party against whom the action is brought or by a person authorized by that party to sign the document,” and the non-signing spouse is neither.",
        "The writing requirement is satisfied as to both, because one co-owner's signature binds the community property and the subsection asks only that a writing exist.",
        "The writing requirement is satisfied as to neither, because the subsection requires the signatures of every owner of record before any action may be maintained.",
        "The writing requirement is irrelevant, because the broker's own countersignature on the listing supplies the memorandum the subsection asks for.",
      ],
      rationale: "Section 1101.806(c) bars an action to recover a commission for the sale or purchase of real estate “unless the promise or agreement on which the action is based, or a memorandum, is in writing and signed by the party against whom the action is brought or by a person authorized by that party to sign the document.” The signature the statute wants is the defendant's, so the broker's own signature proves nothing and a co-owner who signed nothing and authorised nobody is outside the writing. Note also what the general statute of frauds does not do: Business & Commerce Code § 26.01(b)(7) reaches commission promises only for oil and gas leases, royalties, minerals and mineral interests, so § 1101.806(c) is the provision doing the work for an ordinary house.",
    }),
    quiz({
      id: "LOA-T04U2-Q", tests: "T04U2", module: "module-04", screen: "t04u2-s1",
      source: "22 TAC", section: "§ 535.153",
      judgement: "The line between soliciting a future listing, which the Act permits, and negotiating the present transaction, which it does not.",
      prompt: "Broker Ellis knocks on the door of a Waco house that is listed with Broker Nguyen until August 31. Ellis says two things: that she would like the chance to present a listing proposal when the current listing expires, and that her buyer would pay $362,000 today and might go to $370,000. Which analysis is correct?",
      choices: [
        "The first is permitted and the second is not: 22 TAC § 535.153 states that the Act does not prohibit soliciting a listing from an owner whose property is subject to another broker's exclusive listing, while § 1101.652(b)(22) reaches negotiating or attempting to negotiate with an owner known to be under an outstanding written exclusive agency.",
        "Both are prohibited, because § 1101.652(b)(22) reaches any approach to an owner who is under an outstanding exclusive listing with another broker.",
        "Both are permitted, because § 535.153 confirms that the Act does not prohibit a license holder from approaching an owner whose property is exclusively listed.",
        "Both are permitted here, because Ellis represents a buyer under a written representation agreement and § 535.153 applies only to a license holder acting for a seller.",
      ],
      rationale: "22 TAC § 535.153 does two things in one sentence. It extends the prohibition — a license holder “including one acting as agent for a prospective buyer or prospective tenant” may not attempt to negotiate a sale of property under exclusive listing with another broker — and it permits what students assume is forbidden: “the Act does not prohibit a license holder from soliciting a listing from the owner while the owner's property is subject to an exclusive listing with another broker.” Section 1101.652(b)(22) supplies the prohibition's elements, each of which limits it: negotiating or attempting to negotiate, with knowledge, an outstanding written contract granting exclusive agency to another broker, in connection with the transaction.",
    }),
    quiz({
      id: "LOA-T04U3-Q", tests: "T04U3", module: "module-04", screen: "t04u3-s1",
      source: "22 TAC", section: "§ 535.16(a)",
      judgement: "Which entitlements a seller actually acquires by signing a listing, stated as citable obligations rather than as promises.",
      prompt: "A seller asks at the listing appointment what she is buying by signing with a brokerage rather than paying a flat fee to appear in a listing database. Which answer states a legally enforceable obligation rather than a marketing claim?",
      choices: [
        "That 22 TAC § 535.16 obliges a broker “under a listing contract to negotiate the best possible transaction for the principal, the broker has agreed to represent,” which is an obligation owed on her side of the table rather than a service level.",
        "That representation guarantees a higher sale price than an unrepresented seller would obtain, which is why the compensation is justified.",
        "That the broker will act as her lawyer on the contract, so she will not need to pay one separately.",
        "That she may instruct the brokerage to keep a known foundation problem out of the marketing, because the fiduciary duty of confidentiality covers whatever the client wants kept quiet.",
      ],
      rationale: "The benefits of representation are citable or they are a feeling. 22 TAC § 535.16's first sentence is the one that makes representation different in kind from a listing service. The other three answers describe things Texas law refuses to supply: no held source promises a price or an outcome; 22 TAC § 537.11(b) forbids a license holder to practise law, to advise on the legal effect of instruments, and — at (b)(7) — to discourage a principal from employing an attorney; and § 1101.652(b)(3) and (b)(4) with 22 TAC § 535.156(d) mean a seller who wants a known defect buried is asking for something the license holder's own licence forbids.",
    }),
    quiz({
      id: "LOA-T04U4-Q", tests: "T04U4", module: "module-04", screen: "t04u4-s1",
      source: "Texas Occupations Code", section: "§§ 1101.002(8), 1101.805(f)",
      judgement: "What can honestly be said about subagency in Texas after the 2026 repeals, and what cannot.",
      prompt: "At a sales meeting a manager tells the room that “Texas law makes the cooperating broker a subagent of the seller.” What is the accurate correction from the sources held for this course?",
      choices: [
        "The word subagent appears nowhere in Chapter 1101 as held; § 1101.002(8) and § 1101.805(f) were both repealed effective January 1, 2026, the repealed text is not preserved, and the common-law doctrine was not held — so a licensee who thinks subagency is in play takes the question to the broker and to a lawyer.",
        "The statement is correct, because a broker who places a listing in a cooperative database is by that act offering subagency to every participating broker.",
        "The statement is correct as to compensation only, because a cooperating broker paid out of the seller's commission is the seller's subagent for that purpose.",
        "The statement is wrong because the 2026 legislation abolished subagency as a legal concept entirely, so the arrangement can no longer arise in any form.",
      ],
      rationale: "Chapter 1101 as held for this course uses neither “subagent” nor “subagency.” Two provisions were repealed by the same act — § 1101.002(8) by Acts 2025, 89th Leg., R.S., Ch. 1172 (S.B. 1968), Sec. 13(1) and § 1101.805(f) by Sec. 13(2), both effective January 1, 2026 — and the held statute records the repeals without preserving the former text. TREC's own explanatory article, which is guidance rather than law, says two references were removed, that the circumstances in which subagency could arise “are limited,” and that “subagency has not been eliminated generally as a legal concept.” That is why the last answer overstates it as badly as the first three do, and why the safe position is narrow.",
    }),
    quiz({
      id: "LOA-T04U5-Q", tests: "T04U5", module: "module-04", screen: "t04u5-s1",
      source: "Texas Occupations Code", section: "§ 1101.558(b), (b-1)",
      judgement: "That the two disclosure duties have different triggers, and where each falls in a listing appointment.",
      prompt: "You arrive at a listing appointment. Small talk about the weather turns into a conversation about this house and what it might sell for, and forty minutes later the seller signs. Where in that sequence did each of the two § 1101.558 duties fall?",
      choices: [
        "The written notice was due when the conversation turned to this house and what it might sell for — the first substantive communication with a party about specific real property — so before the presentation rather than with the signature page; the subsection (b) disclosure of whom you represent is owed orally or in writing at first contact with the other side of a transaction.",
        "Both were due at the moment the seller signed, because until then no transaction had been proposed and no representation existed.",
        "Both were due when you arrived, because arrival at the property is the first contact the statute describes.",
        "Only the written notice applies at a listing appointment, because subsection (b) speaks to a license holder who represents a party and you did not yet represent this seller.",
      ],
      rationale: "The two duties are separate and students merge them. Section 1101.558(b-1) requires the written notice “[a]t the time of a license holder's first substantive communication with a party relating to a proposed transaction regarding specific real property” — the weather is not substantive, this house and its likely price is, and the notice is therefore due before the presentation. Section 1101.558(b) requires a license holder who represents a party to disclose that representation, orally or in writing, at first contact with another party to the transaction or with another license holder representing another party; on a listing it is the sentence you say to the first buyer or cooperating agent who calls. Most license holders satisfy both at once, which is efficient and is not the same as understanding that they are two duties.",
    }),
  ]),
  T05: Object.freeze([
    quiz({
      id: "LOA-T05U1-Q", tests: "T05U1", module: "module-05", screen: "t05u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.563(a)",
      judgement: "How far the written-agreement mandate reaches, given the section's own three-item definition of residential real property.",
      prompt: "Four engagements land in one week: a couple buying a single-family house in Frisco; a family leasing a house in Killeen for a year; an investor buying a 60-unit apartment building in Amarillo held in one ownership; and a buyer purchasing a condominium unit in Austin. Which of them fall inside § 1101.563's written-agreement requirement?",
      choices: [
        "The Frisco house and the Austin condominium unit. Subsection (a) defines residential real property as a single-family house, a duplex, triplex or quadraplex, or a unit in a multiunit structure where title to individual units passes under a condominium or cooperative system, and subsection (b) reaches a prospective buyer — so a tenant and a single-ownership apartment building are outside it.",
        "All four, because every one of them concerns residential property and § 1101.563 applies to residential transactions.",
        "The Frisco house, the Killeen lease and the Austin condominium unit, because the section reaches prospective tenants of residential property as well as buyers.",
        "The Frisco house, the Amarillo apartment building and the Austin condominium unit, because a building containing sixty dwellings is a multiunit residential structure within subdivision (3).",
      ],
      rationale: "Section 1101.563(a) defines “residential real property” for the section as exactly three things: a single-family house; a duplex, triplex or quadraplex; and a unit in a multiunit residential structure “in which title to an individual unit is transferred to the owner of the unit under a condominium or cooperative system.” A 60-unit building held in one ownership fails the transfer-of-title clause in subdivision (3). And subsection (b)'s operative words are “a prospective buyer of residential real property,” with every later reference to “the prospective buyer,” so a tenant is outside the section however residential the house is — telling a leasing prospect that state law requires them to sign before you can show a rental misstates the statute.",
    }),
    quiz({
      id: "LOA-T05U2-Q", tests: "T05U2", module: "module-05", screen: "t05u2-s1",
      source: "22 TAC", section: "§ 531.2",
      judgement: "How the Canons bear on representing two buyers who may bid against each other, and when that decision has to be made.",
      prompt: "Two buyers your brokerage represents want the same Sugar Land house in the same week. What do the held sources support?",
      choices: [
        "Nothing in the held sources forbids representing both, but 22 TAC § 531.2 requires the license holder's position to be clear to all parties concerned and that no personal interest be placed above the client's — so the firm's policy on competing clients is decided and disclosed in advance rather than improvised on the night the offers arrive.",
        "Representing both is prohibited outright, because advancing one client's interest necessarily damages the other's and no consent can cure that.",
        "Representing both is permitted and needs no disclosure, because each buyer's own offer remains confidential from the other under § 1101.651(d).",
        "Representing both converts the brokerage into an intermediary under § 1101.561(b), so written consent from both buyers cures the problem.",
      ],
      rationale: "No held Texas source forbids a brokerage from representing two buyers who want the same property. What the Canons require is that the position be honest and settled in advance: 22 TAC § 531.2 demands that the primary duty is to represent the interests of the client, that the license holder's position “should be clear to all parties concerned in a real estate transaction,” and that the license holder “place no personal interest above that of the client.” Section 1101.561(b) is not the answer, because it is triggered by a broker agreeing to represent both a buyer or tenant and a seller or landlord in the same transaction, not by two buyers on the same side.",
    }),
    quiz({
      id: "LOA-T05U3-Q", tests: "T05U3", module: "module-05", screen: "t05u3-s1",
      source: "Texas Occupations Code", section: "§ 1101.562(a)(1)",
      judgement: "That an oral agreement to represent defeats the non-representation posture even though it would not satisfy the writing requirement.",
      prompt: "In a Katy driveway you tell a prospect, “Sure, I'll look out for you on this one.” Nothing is signed. At the showing an hour later you claim you are showing the house without representing her, under § 1101.562. Does the posture hold?",
      choices: [
        "No. Condition (a)(1) is available only to a broker who “has not agreed with the party, either orally or in writing, to represent the party,” so the driveway sentence defeats the posture even though an oral agreement would not satisfy § 1101.563's writing requirement.",
        "Yes, because § 1101.563 requires a writing to create a representation relationship and nothing was signed.",
        "Yes, provided you gave no opinions or advice at the showing itself, because condition (a)(2) is measured only at the time of the showing.",
        "No, but only because you performed another act of brokerage for her within condition (a)(4); an oral promise on its own has no effect on the section.",
      ],
      rationale: "The four conditions in § 1101.562(a) are conjunctive, and the first is written to catch exactly this: the broker must have “not agreed with the party, either orally or in writing, to represent the party.” The Legislature counted oral agreements for the purpose of taking the non-representation posture away, while requiring a writing for the purpose of establishing representation — two rules pointing the same direction, which is that you should say nothing about representing a prospect that you are not prepared to reduce to writing. Condition (a)(2) is a separate, factual condition about whether you are otherwise acting as the party's agent at the time of the showing.",
    }),
    quiz({
      id: "LOA-T05U4-Q", tests: "T05U4", module: "module-05", screen: "t05u4-s1",
      source: "Texas Occupations Code", section: "§ 1101.562(a)(3), (c)",
      judgement: "That the practical benefit of representation is entitlement to opinions and advice, which a showing-only posture cannot supply.",
      prompt: "A buyer touring a house under a showing-only arrangement asks three questions: how large the house is, whether the list price is defensible, and whether the option period she is being offered is too short. Which may the broker answer while remaining inside § 1101.562?",
      choices: [
        "Only the first. Subsection (c) permits the broker to confirm information regarding the size, price and terms of the property, while (a)(3) forbids opinions or advice regarding the real property or regarding real estate transactions in general — which is what the other two questions ask for.",
        "The first and second, because confirming the price under subsection (c) includes saying whether the price is supportable.",
        "All three, because subsection (c) begins “Notwithstanding Subsections (a)(3) and (4)” and therefore lifts the advice prohibition for any question about the property being shown.",
        "None, because a broker showing property without representation may say nothing at all about the property and must refer every question to the listing broker.",
      ],
      rationale: "Section 1101.562(c) permits a broker showing property under the section to “confirm information to a party regarding the size, price, and terms of the real property available for sale or lease.” Three items, and the verb is confirm rather than evaluate: confirming that the price is $389,900 is permitted, saying the price is fair is not. Section 1101.562(a)(3) forbids opinions or advice “regarding the real property or real estate transactions in general,” and the second phrase is broader than students expect — whether an option period is too short is advice about transactions in general. That is the concrete difference representation buys: a represented buyer is entitled to be told whether the price is defensible, and a buyer touring under a showing-only arrangement has bought a door-opening service.",
    }),
    quiz({
      id: "LOA-T05U5-Q", tests: "T05U5", module: "module-05", screen: "t05u5-s1",
      source: "Texas Occupations Code", section: "§ 1101.651(b)",
      judgement: "That the clause after the “or” in § 1101.651(b) is what permits payment on a file earned before a change of sponsorship.",
      prompt: "You earn a fee on a Pflugerville purchase while sponsored by Blackland Prairie Brokers, move your sponsorship to another firm in June, and the transaction closes in August. Who may pay you, under § 1101.651(b)?",
      choices: [
        "Blackland Prairie Brokers may, because the subsection bars a sales agent from accepting compensation from a person other than the broker sponsoring the agent “or was sponsoring the sales agent when the sales agent earned the compensation.”",
        "Only your current sponsoring broker may, and the old firm must remit the money to that broker to pass along.",
        "The title company may pay you directly at closing, because the fee was earned before the sponsorship changed and no broker is now entitled to it.",
        "Nobody may, because a sales agent forfeits compensation on any transaction that has not closed at the moment the sponsorship ends.",
      ],
      rationale: "Section 1101.651(b) provides that a sales agent may not accept compensation for a real estate transaction “from a person other than the broker that is sponsoring the sales agent or was sponsoring the sales agent when the sales agent earned the compensation.” Any version that stops after the first broker states a different and wrong rule, because it would forfeit every pending file whenever an agent changed firms. What you may never do is take the money from the client, from the title company as a direct payee, or from the cooperating brokerage. 22 TAC § 535.3 states the same thing as a consent requirement, naming the current sponsoring broker or the broker who sponsored you when you became entitled.",
    }),
    quiz({
      id: "LOA-T05U6-Q", tests: "T05U6", module: "module-05", screen: "t05u6-s1",
      source: "22 TAC", section: "§ 535.148(a)",
      judgement: "That two acts — disclosure of the intention and the client's consent — must both precede receipt of a fee from anyone other than the client.",
      prompt: "A residential service contract provider offers your buyer client's transaction a $400 payment to you for services you perform for the provider. What does 22 TAC § 535.148(a) require, and when?",
      choices: [
        "Before receiving it, you must disclose to your client that you intend to receive the commission, rebate or fee and obtain the client's consent — two acts, both of which come first.",
        "You must disclose the payment to your client on the settlement statement at closing, which is when the consent requirement is satisfied.",
        "You must obtain your sponsoring broker's written consent; the client's consent is required only where the payer is a party to the transaction.",
        "Nothing is required, because the payment is for services actually performed and § 535.148(h) preserves payments at market rates for services actually performed.",
      ],
      rationale: "22 TAC § 535.148(a) provides that a license holder may not receive a commission, rebate or fee in a transaction from a person other than the person the license holder represents “without first disclosing to the license holder's client that the license holder intends to receive the commission, rebate, or fee, and obtaining the consent of the license holder's client.” Two acts, and the word is “first.” The statutory counterparts are § 1101.652(b)(13), which reaches an undisclosed commission, rebate or direct profit on an expenditure made for a principal, and § 1101.652(b)(8), which reaches compensation from more than one party without the full knowledge and consent of all parties. Subsection (f) adds a form for this particular payer: TREC No. RSC-4.",
    }),
  ]),
  T06: Object.freeze([
    quiz({
      id: "LOA-T06U1-Q", tests: "T06U1", module: "module-06", screen: "t06u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.652(b)(16)",
      judgement: "That the one place Chapter 1101 uses the word “dual” addresses a concealed self-interest, not a broker on two sides.",
      prompt: "A student finds § 1101.652(b)(16), which reaches a license holder who “acts in a dual capacity as broker and undisclosed principal in a real estate transaction,” and concludes that this is where Texas prohibits dual agency. What is wrong with that reading?",
      choices: [
        "The subdivision is about a licensee who is secretly a party to the deal, not one representing two sides. Texas needs no dual-agency prohibition because the capacity was never created — the words dual agent and dual agency appear nowhere in Chapter 1101.",
        "Nothing is wrong with it; subdivision (16) is the prohibition, and a broker who discloses the dual capacity to both parties in writing complies with it.",
        "The subdivision does prohibit dual agency but only for brokers, so a sponsored sales agent representing both sides is outside it.",
        "The subdivision was repealed effective January 1, 2026 along with the two subagency references, so Texas now has no provision on the point at all.",
      ],
      rationale: "Subdivision (16) reaches concealed self-interest — buying through a nominee, taking a hidden interest — which is why 22 TAC § 535.144 requires a license holder dealing on her own account or for close family, an entity she owns more than ten per cent of, or certain trusts to disclose her licence status in writing. Different problem, different rule. Texas has no dual-agency prohibition because Chapter 1101 never creates the capacity: representation is the status § 1101.557(a) confers, carrying the full fiduciary content of 22 TAC §§ 531.2 and 535.156, and the Act supplies no diluted second version of it. What it supplies instead is the intermediary, defined at § 1101.551(1) as a broker.",
    }),
    quiz({
      id: "LOA-T06U2-Q", tests: "T06U2", module: "module-06", screen: "t06u2-s1",
      source: "Texas Occupations Code", section: "§ 1101.651(d)(1)",
      judgement: "That the prohibition reaches the substance of the disclosure, and that only a separate writing from that party lifts it.",
      prompt: "A brokerage is acting as intermediary on a Round Rock listing at $415,000. The seller told her agent at the listing appointment that she would take $392,000. The seller's appointed agent asks whether she may tell the buyer's side “there is room to move.” What does § 1101.651(d)(1) permit?",
      choices: [
        "Not that. The subdivision forbids disclosing that the seller will accept a price less than the asking price, and “there is room to move” communicates that substance; only a separate writing from the seller lifts it, not a phone call, a text or a clause in the original listing.",
        "It permits the statement, because the subdivision forbids disclosing a number and “there is room to move” names none.",
        "It permits the statement, because the appointment under § 1101.560 releases the appointed agent from the subdivision so she can advise her own party effectively.",
        "It forbids the statement permanently, because the subdivision states no exception and a confidence once given cannot be released.",
      ],
      rationale: "Section 1101.651(d)(1) forbids a broker, and any broker or sales agent appointed under § 1101.560, to “disclose to the buyer or tenant that the seller or landlord will accept a price less than the asking price, unless otherwise instructed in a separate writing by the seller or landlord.” The prohibition is on communicating the substance rather than on uttering a particular sentence, so “she's motivated” and “I'd come in under list” are disclosures dressed up in words. The qualifier is the release mechanism and it is exact: a separate writing from that party. And the opening words of subsection (d) bind the appointees as well as the broker, so an appointment does not free anyone from subdivisions (1) through (5).",
    }),
    quiz({
      id: "LOA-T06U3-Q", tests: "T06U3", module: "module-06", screen: "t06u3-s1",
      source: "Texas Occupations Code", section: "§ 1101.560(b)",
      judgement: "The two conditions that make an appointment valid, including who gives the written notice and to whom.",
      prompt: "Two sales agents at the same firm agree between themselves that each will “just work our own client” on an in-house transaction. Both parties' representation agreements authorise intermediary status but say nothing about appointments. Apply § 1101.560(b).",
      choices: [
        "No appointment has been made. The subsection permits one “only if” the parties' written consent under § 1101.559 authorises the broker to appoint and the broker provides written notice of the appointment to all parties involved in the transaction — and here the consent is silent and no broker has acted.",
        "An appointment has been made, because both parties consented in writing to intermediary status and appointments follow from that consent.",
        "An appointment has been made and only the written notice is outstanding, which the two agents may give to their own respective parties.",
        "No appointment is needed, because agents at the same firm working opposite sides of an in-house transaction are appointed by operation of § 1101.560(a).",
      ],
      rationale: "Section 1101.560(b) is a closed gate: a license holder may be appointed “only if” the written consent of the parties under § 1101.559 authorises the broker to make the appointment and the broker provides written notice of the appointment to all parties involved in the real estate transaction. The consent must therefore do two distinct jobs — authorise intermediary status and authorise appointments — and the second is not implied by the first. The notice is the broker's to give, must be written, and goes to all parties rather than only to the party whose appointee is named; each side is entitled to know who has been appointed on the other. A sales agent cannot appoint herself or a colleague.",
    }),
    quiz({
      id: "LOA-T06U4-Q", tests: "T06U4", module: "module-06", screen: "t06u4-s1",
      source: "Texas Occupations Code", section: "§ 1101.560(a)",
      judgement: "Why a sole practitioner broker may be an intermediary but cannot make appointments.",
      prompt: "Priya holds a broker licence, works alone in Fredericksburg with no sponsored license holders, and ends up with both the seller of a cottage and a buyer for it, each under a written agreement authorising intermediary status and appointments. What configuration is lawfully available to her?",
      choices: [
        "Intermediary without appointments. Section 1101.560(a) authorises a broker to appoint “a license holder associated with the broker” for one party and “another license holder associated with the broker” for any other party, and she has none — so she acts fairly and impartially under § 1101.559(c) and advises neither side.",
        "Intermediary with herself appointed to both parties, because the consents authorise appointments and nothing in § 1101.560 forbids a broker appointing herself.",
        "Intermediary with herself appointed to the seller only, because a broker may appoint herself to the side she took on first.",
        "No configuration is available; § 1101.561(b) obliges her to withdraw from one side because she cannot make the appointments her consents contemplate.",
      ],
      rationale: "Section 1101.561(b) applies to a sole practitioner exactly as to a large firm, so on both parties' written consent under § 1101.559(a) she may — and must — act as intermediary. What she cannot do is appoint: § 1101.560(a) is written in terms of a broker appointing a license holder associated with the broker for one party and another such license holder for any other party, and appointing herself to both would reproduce the undivided-loyalty impossibility the subchapter exists to avoid. So the honest configuration is intermediary without appointments: fair and impartial under § 1101.559(c), silent under § 1101.651(d), still bound by § 1101.557(b) and 22 TAC § 535.157, and advising neither party on price or strategy.",
    }),
    quiz({
      id: "LOA-T06U5-Q", tests: "T06U5", module: "module-06", screen: "t06u5-s1",
      source: "Texas Occupations Code", section: "§ 1101.562(a)(3)",
      judgement: "Which act in an ordinary friendly exchange takes a listing agent outside the non-representation lane.",
      prompt: "Hosting your own brokerage's open house, you confirm the square footage and the HOA dues to an unrepresented visitor, then tell him the sellers “need to be done by the end of the month,” suggest he offer $318,000 because “they'll take it,” and help him fill in an option fee and a closing date. Which of those acts stayed inside what the law permits?",
      choices: [
        "Only the square footage and the HOA dues. Section 1101.562(c) permits a broker to confirm information regarding size, price and terms; the motivation, the offer strategy and the help drafting are outside (a)(3) and (a)(4), and they build the record § 1101.652(b)(7) is made of.",
        "All of them, because you are the seller's agent and a seller's agent may say anything that helps produce an offer on the seller's property.",
        "The square footage, the HOA dues and the statement about the sellers' timing, because timing is a term of the transaction within § 1101.562(c).",
        "None of them, because a listing agent hosting an open house may not communicate with an unrepresented visitor at all until the visitor signs an agreement.",
      ],
      rationale: "Section 1101.562(c) is a short list — size, price and terms — and the verb is confirm. Telling the other side your seller's timetable hands over leverage and, if your broker were an intermediary or you an appointed agent, § 1101.651(d)(1) and (d)(3) would forbid it outright with only a separate writing, a legal requirement or court order, or property-condition information as exits; a moving date is none of those. Advising on the offer price is advice regarding the real property, and filling in the option fee and closing date is another act of brokerage for him, so both fall outside § 1101.562(a)(3) and (a)(4). The general risk is § 1101.652(b)(7): ambiguity about whom you are acting for is itself the violation.",
    }),
  ]),
  T07: Object.freeze([
    quiz({
      id: "LOA-T07U1-Q", tests: "T07U1", module: "module-07", screen: "t07u1-s1",
      source: "Texas Occupations Code", section: "§§ 1101.557(a), 1101.652(b)(34), 1101.806(c)",
      judgement: "Why an agency created by conduct is a hazard rather than a technique.",
      prompt: "A license holder works a residential buyer for six weeks with nothing signed — pulling comparables, advising on price, drafting an offer — and then argues that the absence of paperwork means there was no relationship and therefore no problem. State the position under the held sources.",
      choices: [
        "It is the worst of both worlds: § 1101.557(a) fixes agency on representing a party with no signature requirement, so the duties may have attached; § 1101.652(b)(34) makes the missing § 1101.563 agreement itself a disciplinary ground; and § 1101.806(c) leaves no signed promise to sue on for a fee.",
        "It is a defensible position, because Texas requires a written agreement before residential brokerage acts, and where there is no writing there is no relationship and no duty.",
        "It exposes the license holder to a fee claim by the buyer but not to discipline, because § 1101.652(b)(34) reaches only a broker rather than a sponsored sales agent.",
        "It is neutral, because a relationship created by conduct carries the duties and the right to a reasonable fee in equal measure.",
      ],
      rationale: "Three provisions run in different directions and all three cut against the licensee. Section 1101.557(a) makes a broker who “represents a party” that party's agent, with no signature in the sentence, and 22 TAC § 531.2 attaches fiduciary status to a license holder “while acting as an agent for another” — the trigger is acting, not signing. Section 1101.652(b)(34), effective January 1, 2026, makes failing to enter into the written agreement § 1101.563 requires a ground for discipline in its own right, so the absence of the writing is the violation rather than a defence to one. And § 1101.806(c) bars the fee action, because there is no writing signed by the party who would be sued. Full exposure, no enforceable fee, and a disciplinary count.",
    }),
    quiz({
      id: "LOA-T07U2-Q", tests: "T07U2", module: "module-07", screen: "t07u2-s1",
      source: "Texas Occupations Code", section: "§ 1101.367(a)",
      judgement: "Who must give notice when a sponsorship ends, to whom, in what form, and with what automatic consequence.",
      prompt: "On Monday you email your sponsoring broker your resignation. An offer on one of your listings is due to be presented on Tuesday. Apply § 1101.367(a) and § 1101.351(c).",
      choices: [
        "The terminating party — here you — must immediately notify in writing both the other party and the Commission, and on receiving that notice the Commission places the licence on inactive status; an inactive sales agent may not engage in brokerage, so someone else at the firm presents Tuesday's offer.",
        "The broker must notify the Commission within thirty days, and until that notice is filed you may continue to work your existing files including Tuesday's offer.",
        "Either party may notify the Commission at any time before the licence expires, and the licence remains active until a new sponsoring broker is named.",
        "No notice is required where the agent resigns rather than being released, and the agent may present offers on files opened before the resignation.",
      ],
      rationale: "Section 1101.367(a) is exact: “When the relationship of a sales agent with the sales agent's sponsoring broker terminates, the terminating party shall immediately notify in writing both the other party and the commission. On receiving the written notice, the commission shall place the sales agent license on inactive status.” The duty falls on whichever side ended it, the notice is written, it goes to two recipients, and the timing word is “immediately.” The consequence is automatic and § 1101.351(c) then bars the agent from engaging or attempting to engage in brokerage, because sponsorship is a condition of acting at all. The listing itself stays with the firm, since 22 TAC § 535.2 requires listings to be accepted in a broker's name.",
    }),
    quiz({
      id: "LOA-T07U3-Q", tests: "T07U3", module: "module-07", screen: "t07u3-s1",
      source: "22 TAC", section: "§ 535.146(c)(5), (c)(6)",
      judgement: "Which trust-money duties keep running after the transaction that generated the money has ended.",
      prompt: "A listing terminated unsold months ago, but earnest money from a dead contract is still sitting in the brokerage trust account and the broker has since become entitled to a commission paid into the same account by mistake. Which statement about the surviving duties is correct?",
      choices: [
        "Money the broker comes to own, including earned compensation, must be removed from the trust account not later than the 30th day after the broker acquires ownership, and the broker must provide an accounting to each beneficiary of trust money at least monthly if there has been any activity in the account.",
        "Both duties lapsed when the transaction terminated, because the trust obligations in § 535.146 attach only while a contract is live.",
        "The broker may leave earned compensation in the trust account indefinitely, because money the broker owns is not trust money and the rule's removal deadline applies only to a client's funds.",
        "The accounting duty is owed annually rather than monthly, and only where a beneficiary asks for it in writing.",
      ],
      rationale: "22 TAC § 535.146(c)(5) requires that if a broker acquires ownership of trust money held in a trust account, “including entitlement to compensation, such money must be removed from the trust account not later the 30th day after the date the broker acquires ownership of the money” — a rule that runs against the broker precisely after the work is done, because leaving earned commission in a trust account is a commingling risk, and § 535.146(b)(5) makes placing trust money in a personal or operating account prima facie evidence of commingling. Section 535.146(c)(6) requires a documentary record of each deposit or withdrawal and an accounting to each beneficiary “at least monthly if there has been any activity in the account” — the trigger is activity, not an open transaction.",
    }),
  ]),
  T08: Object.freeze([
    quiz({
      id: "LOA-T08U1-Q", tests: "T08U1", module: "module-08", screen: "t08u1-s1",
      source: "22 TAC", section: "§ 531.18",
      judgement: "The two ways each license holder must provide the Consumer Protection Notice, and which label carries which font floor.",
      prompt: "A brokerage frames the Consumer Protection Notice at reception and adds a homepage link labelled “TREC Consumer Protection Notice” in 10-point font. Apply 22 TAC § 531.18 to both.",
      choices: [
        "The display complies and the link does not: the rule requires the notice displayed in a readily noticeable location in each place of business the broker maintains, and a homepage link labelled either “Texas Real Estate Commission Consumer Protection Notice” in at least 10 point font or “TREC Consumer Protection Notice” in at least 12 point font — the shorter label carrying the larger floor.",
        "Both comply, because the rule requires only that the notice be visible in the office and reachable from the website, and 10-point font satisfies either label.",
        "Neither complies, because the rule requires the notice to be delivered to each party at first substantive communication rather than displayed or linked.",
        "The link complies and the display does not, because the display duty runs to each place of business a sales agent maintains rather than the broker.",
      ],
      rationale: "22 TAC § 531.18 adopts the Consumer Protection Notice, TREC No. CN 1-5, by reference and requires each license holder to provide it two ways: by displaying it in a readily noticeable location in each place of business the broker maintains, and by linking it in a readily noticeable place on the homepage of each business website under one of two labels. The pairing is the trap — the shorter “TREC” label carries the 12 point floor and the longer label the 10 point floor — and so is where each duty bites, since the display is measured by the places of business the broker maintains while the link attaches to each business website of the license holder.",
    }),
    quiz({
      id: "LOA-T08U2-Q", tests: "T08U2", module: "module-08", screen: "t08u2-s1",
      source: "22 TAC", section: "§ 535.2",
      judgement: "What a brokerage's policy manual must be, and the one thing the rule requires the broker to hand the agent personally.",
      prompt: "On your first day a brokerage hands you a policy manual last revised in 2019 and nothing else. Which two facts about that manual come from 22 TAC § 535.2, and what should you ask for?",
      choices: [
        "The manual must be maintained “on a current basis,” so a 2019 revision is not a current manual; and the rule's opening sentence requires the broker to notify a sponsored sales agent in writing of the scope of the sales agent's authorized activities under the Act — ask for that writing.",
        "The manual must be filed with the Commission before a sponsored sales agent may act, so the request is for proof of that filing.",
        "The manual must be approved annually by each sponsored sales agent's signature, so the request is to sign the acknowledgement page.",
        "The manual must follow a chapter structure the rule prescribes, so the request is for the missing chapters on records and advertising.",
      ],
      rationale: "22 TAC § 535.2 requires a broker who sponsors sales agents, or who is the designated broker for a business entity, to “maintain, on a current basis, written policies and procedures” on the subjects the rule lists — the phrase “on a current basis” is doing work, and a manual last revised years ago is not a current manual. Its opening sentence states the duty that runs to you personally: “A broker is required to notify a sponsored sales agent in writing of the scope of the sales agent's authorized activities under the Act.” Nothing in the sources held for this course prescribes a manual's structure, its acknowledgement page or a filing with the Commission; those are business decisions.",
    }),
    quiz({
      id: "LOA-T08U1-Q2", tests: "T08U1", module: "module-08", screen: "t08u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.202(a)",
      judgement: "That the Consumer Protection Notice and the IABS descend from different statutes and are provided in different ways.",
      prompt: "An agent believes the framed Consumer Protection Notice at the reception desk discharges her obligation to deliver the Information About Brokerage Services notice. Identify what she has confused.",
      choices: [
        "Two documents with different statutory parents and different methods: the Consumer Protection Notice descends from § 1101.202(a), a complaint-routing provision, and is displayed and linked; the IABS descends from § 1101.558 and is delivered to a party, so a framed notice discharges nothing under 22 TAC § 531.20.",
        "Nothing — both are TREC forms adopted by rule and both must be linked from a homepage, so displaying either satisfies the other.",
        "Only the font requirement: the framed notice would discharge the obligation if it were printed at 12 point rather than 10 point.",
        "Only the audience: the framed notice discharges the obligation as to walk-in visitors and fails only as to parties who are contacted by email.",
      ],
      rationale: "Section 1101.202(a) directs the Commission by rule to prescribe a notice carrying the Commission's name, mailing address and telephone number “for the purpose of directing a complaint to the commission,” and to establish the methods by which regulated persons provide it; 22 TAC § 531.18 executes that by adopting TREC No. CN 1-5 and requiring display and a homepage link. Section 1101.558 and 22 TAC § 531.20 do something else entirely: they require a completed notice delivered to a party, at first substantive communication about specific real property, by one of the rule's permitted methods. The IABS explains representation; the Consumer Protection Notice tells a consumer how to complain. One is delivered and the other is posted, and neither substitutes for the other.",
    }),
  ]),
  T09: Object.freeze([
    quiz({
      id: "LOA-T09U1-Q", tests: "T09U1", module: "module-09", screen: "t09u1-s1",
      source: "Texas Labor Code", section: "§ 201.072(1)(D)",
      judgement: "That the written contract must itself provide the federal-tax term, not merely call the agent an independent contractor.",
      prompt: "A brokerage's independent contractor agreement names the parties, calls the agent an independent contractor, sets a commission split and allocates marketing expenses. It says nothing about federal tax treatment. Test it against Labor Code § 201.072(1)(D).",
      choices: [
        "It fails. Condition (D) has two parts that must both be present — a written contract between the individual and the person for whom the service is performed, and a contract that “provides that the individual is not treated as an employee with respect to the service for federal tax purposes” — and the second is missing.",
        "It satisfies condition (D), because the parties plainly intended contractor status and the condition asks what the parties intended.",
        "It satisfies condition (D), because the commission split is output-based pay and that is what the condition requires.",
        "Condition (D) does not apply to a sales agent, because it is written for the instructor exclusion in paragraph (2).",
      ],
      rationale: "Section 201.072(1)(D) requires that “the service is performed under a written contract between the individual and the person for whom the service is performed, and the contract provides that the individual is not treated as an employee with respect to the service for federal tax purposes.” The statute asks not what the parties intended but whether the contract provides it, so an agreement that omits the sentence fails the condition on its face. Output-based pay is a different condition, (C), and the instructor exclusion in paragraph (2) carries the same federal-tax term. Note also the boundary: the section opens “In this subtitle,” so it decides whether the service is employment for unemployment compensation and nothing else.",
    }),
    quiz({
      id: "LOA-T09U2-Q", tests: "T09U2", module: "module-09", screen: "t09u2-s1",
      source: "Texas Labor Code", section: "§§ 21.002(8)(A), 21.141",
      judgement: "How the two coverage thresholds in Labor Code chapter 21 apply to a brokerage staffed mostly by sponsored sales agents.",
      prompt: "A Waco firm has eighty sponsored sales agents who are genuine independent contractors and three salaried staff. Which subchapters of Labor Code chapter 21 reach it?",
      choices: [
        "Subchapter C-1 does, because § 21.141 defines an employer there as a person who employs one or more employees; the general definition in § 21.002(8)(A) requires 15 or more employees for each working day in each of 20 or more calendar weeks, and three salaried staff do not reach it.",
        "Both do, because eighty-three people work for the firm and the general threshold counts sponsored sales agents as employees.",
        "Neither does, because a firm below fifteen employees is outside chapter 21 entirely and Subchapter C-1 shares the same threshold.",
        "Only the general subchapter does, because the sexual harassment subchapter applies exclusively to employers already covered by § 21.002(8)(A).",
      ],
      rationale: "Section 21.002(8) defines an employer as a person engaged in an industry affecting commerce “who has 15 or more employees for each working day in each of 20 or more calendar weeks in the current or preceding calendar year,” plus an agent of such a person, and § 21.002(7) defines an employee circularly as “an individual employed by an employer” — the chapter supplies no test for separating an employee from a contractor. Subchapter C-1, added in 2021, has its own definition at § 21.141: an employer is a person who “employs one or more employees.” A two-person brokerage is inside that subchapter the day it hires its first assistant, and § 21.142 makes an employer liable where it or its agents or supervisors knew or should have known of sexual harassment and failed to take immediate and appropriate corrective action.",
    }),
    quiz({
      id: "LOA-T09U3-Q", tests: "T09U3", module: "module-09", screen: "t09u3-s1",
      source: "22 TAC", section: "§ 535.5(d)(2)",
      judgement: "Telling the labour-law sense of “employ” from the agency sense the Act uses.",
      prompt: "Two provisions use the word employ. Occupations Code § 1101.002(1)(B)(i) includes within “broker” a person “employed by or for an owner of real estate to sell any portion of the real estate,” and 22 TAC § 535.5(d)(2) says “[a]n employee of a business entity means a person employed and directly compensated by the business entity. An independent contractor is not an employee.” How should a student read them?",
      choices: [
        "In different senses: § 1101.002(1)(B)(i) uses the agency sense, in which a principal engages an agent to act on the principal's behalf, while § 535.5(d)(2) uses the labour-law sense for the narrow licence exemption in § 535.5(c) — and context tells them apart.",
        "In the same sense, so a person engaged by an owner under § 1101.002(1)(B)(i) is an employee of the owner and needs no licence.",
        "In the same sense, so an independent contractor sales agent cannot be “employed by or for an owner” within § 1101.002(1)(B)(i) at all.",
        "In different senses, but the labour-law sense governs Chapter 1101 because the Commission's rules define the term and the statute does not.",
      ],
      rationale: "Real estate law uses “employ” in a sense that predates labour law: the seller employs the broker, which is what a listing agreement does, and it has nothing to do with payroll, withholding or unemployment tax. The Commission's rules use the labour-law sense where it matters — 22 TAC § 535.5(c) exempts from licensure “an employee employed by a business entity for the purpose of buying, selling, or leasing real property for the entity,” and § 535.5(d)(2) then defines that term and excludes an independent contractor. Section 1101.557(a) settles the agency side: the broker who represents a party or lists under an exclusive agreement “is that party's agent,” and the sales agent performs the work as the person acting for that broker.",
    }),
    quiz({
      id: "LOA-T09U4-Q", tests: "T09U4", module: "module-09", screen: "t09u4-s1",
      source: "22 TAC", section: "§ 535.4(c)",
      judgement: "How broadly the rule defines showing, and therefore what an unlicensed assistant may never do.",
      prompt: "Your unlicensed assistant offers to meet a buyer at your Round Rock listing and unlock the door so the buyer can walk through alone while you finish a closing, and to sit the open house on Sunday under instructions to answer no questions. Apply 22 TAC § 535.4(c).",
      choices: [
        "Both are licensed acts. For purposes of the section, to show a property “includes causing or permitting the property to be viewed by a prospective buyer or tenant, unlocking or providing access onto or into a property for a prospective buyer or tenant, and hosting an open house at the property,” and the rule reaches the act of providing access rather than the conversation that follows.",
        "Both are permitted, because the assistant will neither negotiate nor answer questions and the rule reaches only negotiation.",
        "Unlocking the door is permitted and hosting the open house is not, because the definition reaches hosting expressly and access only by implication.",
        "Both are permitted if the assistant is identified to the buyer as unlicensed clerical staff, because 22 TAC § 535.5(g) then applies.",
      ],
      rationale: "22 TAC § 535.4(c) provides that unless otherwise exempted by the Act “a person must be licensed as a broker or sales agent to show a property,” and then defines showing far more broadly than the word sounds — causing or permitting the property to be viewed, unlocking or providing access onto or into it, and hosting an open house. Instructions to stay silent do not help, because the rule reaches the access rather than the talk. Section 535.5(g) is a different and much narrower permission: an answering service or clerical or administrative employee identified to callers as such may confirm the size, price and terms of advertised property, which is not a permission to be at the property with a buyer.",
    }),
    quiz({
      id: "LOA-T09U5-Q", tests: "T09U5", module: "module-09", screen: "t09u5-s1",
      source: "22 TAC", section: "§ 535.2(e)",
      judgement: "That leading a team is itself a delegated supervisory role, in writing, with a reportable delegation.",
      prompt: "A sponsored sales agent has led a four-person team at her brokerage for the last eight months. Nothing was ever put in writing and the Commission has never been told. What does 22 TAC § 535.2(e) require?",
      choices: [
        "Any license holder who leads, supervises, directs or manages a team must be delegated as a supervisor, the delegation must be in writing, and the broker must give the Commission the delegated supervisor's name within 30 days of a delegation that has lasted or is anticipated to last more than three consecutive months — and again within 30 days after it ends.",
        "Nothing, provided the broker retains overall responsibility for supervision, because a team leader who is not a broker cannot be a delegated supervisor.",
        "Only a written delegation is required; the notice to the Commission is required only where the delegated supervisor holds a broker licence.",
        "The delegation must be filed with the Commission before the team is formed, and a delegation that has already run eight months cannot be cured.",
      ],
      rationale: "22 TAC § 535.2(e) lets a broker delegate the responsibility “to assist in administering compliance with the Act and Rules” without relinquishing overall responsibility for supervision, and then adds three operative sentences: any license holder who leads, supervises, directs or manages a team must be delegated as a supervisor; any such delegation must be in writing; and the broker shall provide the name of each delegated supervisor to the Commission within 30 days of any delegation “that has lasted or is anticipated to last more than three consecutive months,” with notice in the same manner within 30 days after the delegation ends. Note both limbs of the reporting trigger — has lasted, or is anticipated to last.",
    }),
    quiz({
      id: "LOA-T09U6-Q", tests: "T09U6", module: "module-09", screen: "t09u6-s1",
      source: "Texas Occupations Code", section: "§ 1101.355(d)",
      judgement: "The five conditions on which an unlicensed entity may receive a license holder's compensation.",
      prompt: "A sales agent forms an LLC owned 60 percent by her and 40 percent by her brother, does no brokerage through it, has not registered it with the Commission, and asks her broker to make the commission cheque payable to it. Apply § 1101.355(c) and (d).",
      choices: [
        "It fails, because registration with the Commission is one of the five conditions in subsection (d) and every one is required; without the exception, subsection (c) requires a business entity that receives compensation on behalf of a license holder to be licensed as a broker.",
        "It succeeds, because the entity is an LLC that the license holder majority-owns and performs no other acts of a broker, which is what the exception asks.",
        "It fails, because the exception requires the license holder to own the entity outright and a 40 percent co-owner defeats it.",
        "It succeeds, because § 1101.355(d) applies only where the entity performs acts of a broker, and this entity performs none.",
      ],
      rationale: "Section 1101.355(c) states the default: “A business entity that receives compensation on behalf of a license holder must be licensed as a broker under this chapter.” Subsection (d) supplies the exception and all five of its conditions are required — the entity receives compensation on behalf of a license holder earned while engaged in real estate brokerage; performs no other acts of a broker; is a limited liability company or an S corporation as defined by the cited provisions; is registered with the Commission; and is at least 51 percent owned by the license holder on whose behalf it receives the compensation. Sixty percent satisfies the ownership condition and the missing registration defeats the arrangement; 22 TAC § 535.147(c) bars sharing a commission with an unlicensed entity created to collect on the license holder's behalf unless it is exempt.",
    }),
  ]),
  T10: Object.freeze([
    quiz({
      id: "LOA-T10U1-Q", tests: "T10U1", module: "module-10", screen: "t10u1-s1",
      source: "Texas Occupations Code", section: "§§ 1101.656(a), 1101.701(a)",
      judgement: "Why conduct that is neither a crime nor a tort can still cost a Texas license holder money and a licence.",
      prompt: "A sales agent at a family funeral does not return a cooperating agent's call for six days. The offer stays open, the seller accepts it, and nobody loses a dollar. Can that reach her, and through which system?",
      choices: [
        "Yes, through Commission-enforced ethics. She broke 22 TAC § 535.157, § 1101.656(a) authorises discipline for violating “this chapter or a commission rule,” and § 1101.701(a) authorises an administrative penalty for violating the chapter, a rule or an order — none of which requires that anyone was harmed.",
        "No. Absent a crime, a tort or a loss there is nothing for any system to act on, and a Commission rule that produces no damage produces no violation.",
        "Yes, but only through the civil courts, because a cooperating agent who is kept waiting has a claim for interference and the Commission acts only on consumer complaints.",
        "Yes, through criminal law, because § 1101.756 makes any violation of a Commission rule a Class A misdemeanor.",
      ],
      rationale: "The three enforcement systems are jurisdictional rather than graded by seriousness. Law is enforced by the state through courts; morals are enforced by nobody; and ethics, for a Texas license holder, is enforced by the Commission — which is what the phrases “or a commission rule” in § 1101.656(a) and “or a rule adopted” in § 1101.701(a) accomplish. Failing to return a call for six days is very likely neither a crime nor a tort, and it is squarely a violation of 22 TAC § 535.157's two-calendar-day obligation. Section 1101.756 is narrower than the last option suggests: it reaches a person who wilfully violates or fails to comply with the chapter or a Commission order.",
    }),
    quiz({
      id: "LOA-T10U2-Q", tests: "T10U2", module: "module-10", screen: "t10u2-s1",
      source: "42 U.S.C.", section: "§ 3604(a), (c), (f)(1)",
      judgement: "That the federal Act's lists differ by subsection, and which provision actually carries the disability prohibition.",
      prompt: "A landlord refuses to rent to an applicant because the applicant uses a wheelchair. Which federal provision states the prohibition, and why is it not § 3604(a)?",
      choices: [
        "Section 3604(f)(1). Subsections (a) and (b) name race, color, religion, sex, familial status and national origin — six characteristics — and subsection (c) adds handicap; Congress put the substantive disability prohibitions in their own subsection rather than editing (a) and (b).",
        "Section 3604(a), because every characteristic protected by the Act is listed there and the later subsections merely elaborate on it.",
        "Section 3604(c), because that is the only subsection that names handicap and it therefore carries the substantive prohibition.",
        "Section 3605(a), because a refusal to rent is a residential real estate-related transaction and the disability prohibition is confined to that section.",
      ],
      rationale: "Read the three lists slowly, because the difference is deliberate rather than a drafting slip. Sections 3604(a) and (b) name six characteristics; § 3604(c), on notices, statements and advertisements, names seven by adding handicap; and § 3604(f)(1) carries the substantive prohibition on discriminating in the sale or rental of, or making unavailable or denying, a dwelling because of a handicap of the buyer or renter, of a person who will reside there, or of “any person associated with that buyer or renter.” That last phrase catches a common error: refusing an applicant because a visiting adult child uses a wheelchair violates the Act although the applicant has no disability.",
    }),
    quiz({
      id: "LOA-T10U3-Q", tests: "T10U3", module: "module-10", screen: "t10u3-s1",
      source: "Texas Occupations Code", section: "§ 1101.652(a-1)(1), (b)",
      judgement: "Which subsection of § 1101.652 houses conduct in the license holder's own transaction, and why subsection (b) does not.",
      prompt: "A Corpus Christi license holder sells a duplex he owns personally and lies to the buyer about a roof leak. Under the architecture of § 1101.652, where does that conduct sit?",
      choices: [
        "In subsection (a-1)(1), which reaches misrepresentation, dishonesty or fraud when selling, buying, trading or leasing real property in the name of the license holder, a spouse, or a person related within the first degree by consanguinity — because subsection (b) is gated by the words “while engaged in real estate brokerage,” and his own sale is not brokerage.",
        "In subsection (b)(3), because a material misrepresentation to a potential buyer about a known significant defect is the closest description of the conduct.",
        "In subsection (a)(1), because dishonesty in any transaction is a general ground applying to a license holder without regard to brokerage.",
        "Nowhere in § 1101.652, because a license holder selling his own property is acting as a principal and the Act does not reach him at all.",
      ],
      rationale: "Section 1101.652 has three parts and the part you are in changes what the Commission must prove. Subsection (a) lists general grounds that apply without regard to brokerage; subsection (a-1) contains three grounds concerning the license holder's own transactions and records; and subsection (b) contains thirty-four grounds gated by six words — “if the license holder, while engaged in real estate brokerage.” That gate is exactly why subsection (a-1) exists separately. 22 TAC § 535.144 then extends “license holder” for (a-1)(1) purposes to a license holder acting for a spouse, parent or child, a business entity more than ten per cent owned, or certain trusts.",
    }),
    quiz({
      id: "LOA-T10U4-Q", tests: "T10U4", module: "module-10", screen: "t10u4-s1",
      source: "Texas Occupations Code", section: "§ 1101.656(a)",
      judgement: "The legal character of a trade association code and what it can and cannot do to a licence.",
      prompt: "A trade association's hearing panel considers a member's conduct and declines to act. The member tells a colleague this clears him. Evaluate that, using the held sources on associations.",
      choices: [
        "It clears him of nothing. An association code binds by contract, reaches only members, and its sanctions are fines, education, suspension of membership and expulsion; only the Commission may suspend or revoke a Texas licence, under § 1101.656(a) and § 1101.652, and a panel declining to act is not a finding that the conduct was lawful.",
        "It clears him as to the association and as to the Commission, because the Commission gives conclusive effect to a completed association proceeding on the same facts.",
        "It clears him only if the association's code is at least as strict as TRELA, which such codes generally are.",
        "It clears him of the licence risk but not of civil liability, because association discipline and Commission discipline are alternatives while a private lawsuit is not.",
      ],
      rationale: "Everything about an association proceeding follows from its contractual character: you agreed to be bound when you joined and paid dues, so the body reaches only members, applies its own code by its own procedure, and can take membership and the privileges that come with it — commonly including participation in a multiple listing service. It cannot touch the licence. The Commission, by contrast, reaches every license holder in the state; 22 TAC § 531.1 defines License Holder as a broker or sales agent licensed under Chapter 1101 and the Canons apply on that basis alone. Neither proceeding is a prerequisite to the other and neither decides the other; § 1101.801 confirms that discipline does not relieve civil or criminal liability.",
    }),
    quiz({
      id: "LOA-T10U5-Q", tests: "T10U5", module: "module-10", screen: "t10u5-s1",
      source: "Texas Occupations Code", section: "§ 1101.652(a)(6)",
      judgement: "Which subsection houses the market-conditions ground, and how it differs from the negligence ground.",
      prompt: "A Plano agent takes a listing in Marfa as a favour, prices it from county-wide averages, and never studies the local market. Two grounds in § 1101.652 are candidates. Where do they sit?",
      choices: [
        "Failing “to consider market conditions for the specific geographic area in which the license holder is providing a service” is § 1101.652(a)(6) — subsection (a), not (b) — while acting negligently or incompetently while engaged in real estate brokerage is § 1101.652(b)(1); 22 TAC § 531.4 supplies the competency canon behind both.",
        "Both sit in subsection (b), at (b)(1) and (b)(6), because both concern conduct in brokerage.",
        "Both sit in subsection (a), at (a)(6) and (a)(8), because competence is a general obligation rather than a brokerage-specific one.",
        "Neither applies, because § 531.4 is a canon rather than a statute and no disciplinary ground reaches a licensee for working outside her usual market.",
      ],
      rationale: "Students misfile the market-conditions ground constantly, and the subsection matters because subsection (b) is gated by “while engaged in real estate brokerage” while subsection (a) is not. Section 1101.652(a)(6) reaches a license holder who fails to consider market conditions for the specific geographic area in which the license holder is providing a service; § 1101.652(b)(1) reaches one who acts negligently or incompetently in brokerage. Behind both sits 22 TAC § 531.4, which requires a license holder to be informed on local market issues and conditions “in the geographic area where a license holder provides services to a client” and to be educated in the characteristics of the specific type of real estate being brokered.",
    }),
  ]),
  T11: Object.freeze([
    quiz({
      id: "LOA-T11U1-Q", tests: "T11U1", module: "module-11", screen: "t11u1-s1",
      source: "Business & Commerce Code", section: "§ 17.46(b)(5)",
      judgement: "That most of the laundry list carries no scienter requirement, so sincerity is irrelevant to liability.",
      prompt: "An agent enters 2,900 square feet in a listing because the seller said so and she believed him; the house measures 2,640. She says her honesty answers the claim. Test that against § 17.46(b)(5) and § 17.46(b)(13).",
      choices: [
        "It does not answer it. Subdivision (5) reaches “representing that goods or services have … characteristics … or quantities which they do not have” and contains no scienter word at all, so her belief goes to what a jury may multiply rather than to whether the subdivision was violated; contrast subdivision (13), which does say “knowingly.”",
        "It answers it, because every subdivision of § 17.46(b) requires the plaintiff to prove the defendant knew the representation was false.",
        "It answers it as to subdivision (5) but not subdivision (13), because subdivision (5) reaches only statements a defendant makes about her own services.",
        "It answers it, because the seller supplied the figure and § 17.46(b) reaches only statements a license holder originates.",
      ],
      rationale: "Section 17.46(b) declares a long list of acts to be false, misleading or deceptive, and most entries contain no state-of-mind requirement whatever. Subdivision (5) says “representing,” not “knowingly representing,” so if the characteristics are not there the representation violates the subdivision and sincerity is irrelevant to liability. Compare subdivision (13), on “knowingly making false or misleading statements of fact concerning the need for parts, replacement, or repair service,” which does carry the word. State of mind re-enters at the damages stage: § 17.50(b)(1) unlocks mental anguish and a multiplier only on a finding that the conduct was committed knowingly or intentionally.",
    }),
    quiz({
      id: "LOA-T11U2-Q", tests: "T11U2", module: "module-11", screen: "t11u2-s1",
      source: "Business & Commerce Code", section: "§ 17.45(4)",
      judgement: "That DTPA standing turns on seeking or acquiring goods or services, not on privity with the defendant.",
      prompt: "A buyer represented by a different brokerage, who signed nothing with you and paid you nothing, sues you over your listing's square footage entry. Does § 17.45(4) give her standing?",
      choices: [
        "Yes. The definition asks who “seeks or acquires by purchase or lease, any goods or services” and says nothing about privity, from whom, or payment; § 17.45(1) makes real property a good, and the only exclusion is a business consumer with assets of $25 million or more or owned or controlled by such an entity.",
        "No. A consumer must have acquired the goods or services from the defendant, so a buyer who dealt with another brokerage has no claim against you.",
        "No, unless she completed the purchase, because the definition reaches a person who acquires goods or services rather than one who merely shops.",
        "Yes, but only because she is an individual; the definition would exclude a partnership or corporation buying the same house.",
      ],
      rationale: "Section 17.45(4) defines a consumer as “an individual, partnership, corporation, this state, or a subdivision or agency of this state who seeks or acquires by purchase or lease, any goods or services,” excluding only a business consumer with assets of $25 million or more or one owned or controlled by an entity with assets of that size — an asset test, not a revenue test, and one that plainly admits partnerships and corporations. Read the definition and look for the word privity: it is not there. “Seeks or acquires” also means no completed purchase is needed. That is why a buyer who never signed anything with you can sue you, provided a practice enumerated in § 17.46(b) was a producing cause of her economic damages.",
    }),
    quiz({
      id: "LOA-T11U3-Q", tests: "T11U3", module: "module-11", screen: "t11u3-s1",
      source: "Business & Commerce Code", section: "§ 17.50(b)(1)",
      judgement: "What changes between the knowing tier and the intentional tier — the base the multiplier is applied to.",
      prompt: "A jury finds economic damages of $31,500 and mental anguish of $20,000. What is the difference between a finding that the conduct was committed knowingly and one that it was committed intentionally, under § 17.50(b)(1)?",
      choices: [
        "The base the multiplier runs on. On a knowing finding the trier of fact may award not more than three times the amount of economic damages; on an intentional finding it may award not more than three times the amount of damages for mental anguish and economic damages, so mental anguish joins the base.",
        "The multiplier itself: knowing conduct trebles the award and intentional conduct allows five times the award.",
        "Whether mental anguish is recoverable at all: it is available only on an intentional finding.",
        "Whether attorneys' fees are recoverable: fees are mandatory only where the conduct was intentional.",
      ],
      rationale: "Section 17.50(b)(1) sets three tiers. An ordinary violation recovers economic damages alone. A knowing finding also unlocks mental anguish “as found by the trier of fact” and additional damages of “not more than three times the amount of economic damages.” An intentional finding unlocks mental anguish and additional damages of “not more than three times the amount of damages for mental anguish and economic damages.” Mental anguish is therefore recoverable at both of the upper tiers, and what expands is the base. Note two limits students miss: “may award not more than” is a ceiling and not an automatic trebling, and § 17.50(e) keeps attorneys' fees, costs and prejudgment interest out of the base entirely.",
    }),
    quiz({
      id: "LOA-T11U4-Q", tests: "T11U4", module: "module-11", screen: "t11u4-s1",
      source: "Business & Commerce Code", section: "§ 17.506(a)",
      judgement: "The condition that defeats almost every license holder who invokes the reliance defence after the fact.",
      prompt: "Sued over a square footage figure, an agent points to a written measurement report from a third-party service that turned out to be wrong. She never told the buyer she was relying on it. Apply § 17.506(a).",
      choices: [
        "The defence fails on its own terms, because it is available only where the defendant gave reasonable and timely written notice to the plaintiff of the defendant's reliance before consummation of the transaction — the report being written and wrong is not enough.",
        "The defence succeeds, because the information was written, came from a third-party source, and she neither knew nor could reasonably have known it was inaccurate.",
        "The defence succeeds as to damages but not as to attorneys' fees, which the statute makes mandatory for a prevailing consumer regardless.",
        "The defence fails because it is available only for written information obtained from official government records, and a private measuring service is not one.",
      ],
      rationale: "Section 17.506(a) makes it a defence “to the award of any damages or attorneys' fees if the defendant proves that before consummation of the transaction he gave reasonable and timely written notice to the plaintiff of the defendant's reliance on” written information from official government records, from another source, or from a required test — in each case where the information was false or inaccurate and the defendant “did not know and could not reasonably have known” of the falsity. Students remember this as “I can rely on public records,” which is not what it says: the written notice of reliance, given before consummation, is the condition that is almost always missing. Subsection (c) then lets the consumer sue the source of the information without regard to privity.",
    }),
    quiz({
      id: "LOA-T11U5-Q", tests: "T11U5", module: "module-11", screen: "t11u5-s1",
      source: "Texas Occupations Code", section: "§ 1101.610(a), (b)",
      judgement: "The two Recovery Trust Account caps and what they are inclusive of.",
      prompt: "A consumer holds an unsatisfied judgment of $199,200 arising from a single transaction — damages, attorney's fees and court costs together — against a judgment-proof license holder. What may the real estate recovery trust account pay, and what does the consumer bear?",
      choices: [
        "At most $125,000, because payments “arising out of a single transaction may not exceed a total of $125,000, regardless of the number of claimants” and that ceiling is inclusive of attorney's fees, interest and court costs; the consumer bears the remaining $74,200.",
        "The whole $199,200, because the account exists to make aggrieved persons whole and the caps limit only the damages component.",
        "At most $250,000, because that is the cap that applies to claims against a single license holder and no smaller limit applies to one transaction.",
        "At most $125,000 in damages plus attorney's fees and court costs on top, because the transaction cap reaches compensatory damages only.",
      ],
      rationale: "Section 1101.610(a) provides that “[p]ayments from the trust account for claims, including attorney's fees, interest, and court costs, arising out of a single transaction may not exceed a total of $125,000, regardless of the number of claimants.” The cap is not damages plus fees; it is everything. Section 1101.610(b) sets a second cap of $250,000 for claims based on judgments against a single license or certificate holder “until the license or certificate holder has reimbursed the trust account for all amounts paid,” and § 1101.610(c) directs a court to reduce claims proportionately where they exceed the limits. The fund is a backstop rather than insurance, and it is not a first resort: § 1101.606(a) requires a final judgment, execution returned nulla bona and a perfected lien first.",
    }),
  ]),
  T12: Object.freeze([
    quiz({
      id: "LOA-T12U1-Q", tests: "T12U1", module: "module-12", screen: "t12u1-s1",
      source: "22 TAC", section: "§ 535.17",
      judgement: "The three formatting and attribution requirements a comparative market analysis must satisfy.",
      prompt: "A sales agent prepares a CMA for a Pflugerville listing appointment. She tidies the Commission's prescribed sentence into her own words, sets it in the same 9-point type as the body of the document, and emails it under her own name. Which of her three decisions comply with 22 TAC § 535.17?",
      choices: [
        "None of them. The prescribed statement must be reproduced verbatim, must be made part of the written opinion in at least 12-point font, and a sales agent must submit the analysis in the broker's name, with the broker responsible for it.",
        "All three, provided the substance of the disclaimer is accurate and the broker has authorised her to present CMAs.",
        "The wording and the font, because the rule prescribes only that the statement accompany the document and 9-point is legible; the broker's name is the only failure.",
        "The name only, because a sales agent may not prepare or present a CMA at all and must have the broker prepare it.",
      ],
      rationale: "22 TAC § 535.17 requires a license holder who provides a broker price opinion, comparative market analysis or estimated worth or sale price to provide the person it is prepared for with a written statement containing the language the rule sets out, and requires that the statement “be made part of any written opinion, analysis, or estimate of worth or sale price and must be reproduced verbatim in at least 12-point font.” Verbatim means verbatim, “made part of” means inside the document rather than in a covering email, and 12-point is a floor. The same rule permits a sales agent to prepare, sign and present the analysis but requires it to be submitted in the broker's name, with the broker responsible for it.",
    }),
    quiz({
      id: "LOA-T12U2-Q", tests: "T12U2", module: "module-12", screen: "t12u2-s1",
      source: "Texas Occupations Code", section: "§§ 1101.555, 1101.806(d)",
      judgement: "What triggers the written title advisory, to whom it is owed, and what a licensee forfeits by skipping it.",
      prompt: "An unrepresented buyer signs an offer on your listing at the kitchen table. You never give him anything in writing about an abstract or a title policy. Apply § 1101.555 and § 1101.806(d).",
      choices: [
        "The advisory was owed at signature and to each buyer regardless of whom you represent, and a license holder who fails to give it “may not receive payment of or recover any commission agreed to be paid on the sale” — the whole fee, not a reduced one.",
        "The advisory was owed only to a buyer you represent, so an unrepresented buyer's file creates no duty and no fee consequence.",
        "The advisory was owed before closing rather than at signature, so it may still be given and the commission is unaffected either way.",
        "The advisory was owed at signature but the only consequence is a disciplinary ground under § 1101.652(b)(29); the commission is protected because § 1101.806 concerns writings rather than advisories.",
      ],
      rationale: "Section 1101.555 provides that when an offer to purchase real estate in this state is signed, “a license holder shall advise each buyer, in writing,” either to have the abstract examined by an attorney chosen by the buyer or to be provided with or obtain a title insurance policy. Three points: the trigger is signature of the offer, not acceptance; it runs to each buyer by a license holder, without regard to whom the license holder represents; and it must be written. Section 1101.652(b)(29) states the same requirement as a disciplinary ground phrased around the closing, and § 1101.806(d) attaches the money penalty — a one-sentence advisory, given at signature and kept in the file, protects the entire fee.",
    }),
    quiz({
      id: "LOA-T12U3-Q", tests: "T12U3", module: "module-12", screen: "t12u3-s1",
      source: "22 TAC", section: "§ 535.2(h)",
      judgement: "What the four-year record clock runs from, and that texts and emails are inside the categories it names.",
      prompt: "A listing expires unsold in September 2026 and the sales agent, changing phones, lets a messaging app delete her negotiation texts with the cooperating agent after thirty days. Apply 22 TAC § 535.2(h).",
      choices: [
        "The records were required for at least four years from the date of closing, termination of the contract, or end of a real estate transaction — so from September 2026 for this file — and “substantive communications with parties to the transaction” is one of the named categories, which covers texts and emails and not only signed forms.",
        "Nothing was required, because the four years run only from a closing and this listing never produced one.",
        "The signed forms were required for four years but text messages were not, because the rule's categories reach documents rather than communications.",
        "The records were required for four years from the date the file was opened, so the September 2026 expiry is irrelevant to the count.",
      ],
      rationale: "22 TAC § 535.2(h) requires the broker to maintain the listed records “in a format that is readily available to the Commission for at least four years from the date of closing, termination of the contract, or end of a real estate transaction” — three triggers, so a listing that expires unsold starts its own clock that day. One of the eight categories is “substantive communications with parties to the transaction,” which is where the texts and emails live; an app that deletes them is a decision not to keep records the broker is required to hold. The only excuse the rule recognises is destruction by an Act of God such as a natural disaster or fire not intentionally caused by the broker, and the four years line up with the Commission's four-year complaint window in § 1101.204(c).",
    }),
    quiz({
      id: "LOA-T12U4-Q", tests: "T12U4", module: "module-12", screen: "t12u4-s1",
      source: "22 TAC", section: "§ 535.144",
      judgement: "Who counts as a license holder for the own-account disclosure rule, and when the disclosure must be given.",
      prompt: "You want to buy a San Marcos duplex through an LLC in which you hold 35 percent, from an unrepresented owner you met while previewing the property for a client. Apply 22 TAC § 535.144.",
      choices: [
        "The rule applies, because it extends “license holder” to one acting on behalf of a business entity in which the license holder is more than a 10% owner, and it requires written disclosure that you are a licensed broker or sales agent acting in that capacity in the contract of sale or in a writing given before entering into it.",
        "The rule does not apply, because a 35 percent interest is a minority interest and the rule reaches only an entity the license holder controls.",
        "The rule applies but the disclosure may be made orally at the closing table, because the rule fixes no form.",
        "The rule applies only if the owner is unrepresented; where the other side has an agent, the agent's knowledge of your licence status satisfies it.",
      ],
      rationale: "22 TAC § 535.144 begins by expanding who counts, providing that for purposes of § 1101.652(a-1)(1) “license holder” includes a license holder acting on behalf of a spouse, parent or child, a business entity in which the license holder is more than a 10% owner, or a trust for which the license holder acts as trustee or of which the license holder or close family is a beneficiary. Thirty-five percent is well past that threshold. The duty is then to “disclose in writing that he or she is a licensed real estate broker or sales agent acting on his or her own behalf or in a capacity described by subsection (a) in any contract of sale or rental agreement or in any other writing given before entering into any contract of sale or rental agreement.” The rule also forbids using your expertise to the disadvantage of a person with whom you deal.",
    }),
    quiz({
      id: "LOA-T12U5-Q", tests: "T12U5", module: "module-12", screen: "t12u5-s1",
      source: "Texas Occupations Code", section: "§ 1101.702(a), (b)",
      judgement: "How the administrative penalty is measured, and that correction is a statutory factor rather than a courtesy.",
      prompt: "A licensee's violation continued unremedied over several weeks before she corrected it and told the Commission what she had done. What does § 1101.702 say about how that affects the penalty?",
      choices: [
        "The amount “may not exceed $5,000 for each violation,” and each day a violation continues or occurs may be considered a separate violation — but subsection (b) lists “efforts to correct the violation” among the factors that set the amount, alongside seriousness, history, deterrence and any other matter that justice may require.",
        "The $5,000 ceiling is a total for the whole matter however long the violation continued, and correction has no statutory role.",
        "Correction after the fact is legally irrelevant; the only factors the statute names are the seriousness of the violation and the history of previous violations.",
        "Correction bars an administrative penalty entirely, because subsection (b) requires the executive director to weigh efforts to correct before any penalty may be imposed.",
      ],
      rationale: "Section 1101.702(a) sets the ceiling: “The amount of an administrative penalty may not exceed $5,000 for each violation. Each day a violation continues or occurs may be considered a separate violation for purposes of imposing a penalty.” Per violation, with a per-day multiplier available, which is why a problem left running is not one violation. Subsection (b) then lists the five factors the executive director must weigh — the seriousness of the violation including the nature, circumstances, extent and gravity of the prohibited acts; the history of previous violations; the amount necessary to deter a future violation; efforts to correct the violation; and any other matter that justice may require. Correcting promptly is statutorily relevant to what you pay.",
    }),
  ]),
});

/* ── REPLACEMENT ITEMS ─────────────────────────────────────────────────────────────────────────
   22 TAC § 535.62(b)(7)(C)(ii) requires that an incorrect answer produce the rationale for the
   correct answer AND "a subsequent related quiz question that will count toward passing the topic
   if answered correctly." These are those questions. Each is keyed to the primary it replaces and
   is served only after that primary is answered incorrectly, once the rationale has been read.
   None of them is the primary reworded: each moves to a different fact pattern, to the mirror image
   of the same provision, or to a different point in the same rule's operation, so that answering it
   correctly demonstrates the student now knows the rule rather than which option was wrong. */

export const REPLACEMENTS = Object.freeze({
  T01: Object.freeze([
    repl({
      id: "LOA-T01U1-QR", replaces: "LOA-T01U1-Q", tests: "T01U1", module: "module-01", screen: "t01u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.0045",
      judgement: "That the wholesaling exemption is conditional, and that dropping its written disclosure makes the same conduct brokerage.",
      prompt: "An unlicensed wholesaler in Killeen acquires a contract to purchase a house and assigns it at a profit. He tells neither the seller nor the buyer anything about the nature of his interest. Apply § 1101.0045.",
      choices: [
        "He is engaging in real estate brokerage. Subsection (a) permits an unlicensed person to sell an option or assign a contract to purchase only where the person does not use it to engage in brokerage and discloses the nature of the equitable interest in writing, and subsection (b) provides that doing so without that disclosure is engaging in real estate brokerage.",
        "He is outside the chapter, because acquiring and assigning a contract is dealing as a principal for his own account and § 535.5 permits that without a licence.",
        "He is outside the chapter, because § 1101.0045(a) is an unconditional exemption for options and contract assignments.",
        "He is inside the chapter only if he assigned more than three contracts in a year, borrowing the numerical limit § 1101.005 places on an attorney-in-fact.",
      ],
      rationale: "Section 1101.0045 is the place where unlicensed activity most often becomes licensed activity by accident, because the exemption is conditional and the condition is a written disclosure. Subsection (a) permits a person to “acquire an option or an interest in a contract to purchase real property and then sell or offer to sell the option or assign or offer to assign the contract without holding a license” only where the person does not use it to engage in brokerage and “discloses in writing the nature of the equitable interest to any seller or potential buyer.” Subsection (b) supplies the consequence in one sentence: without that disclosure, the identical conduct is engaging in real estate brokerage — which, for an unlicensed wholesaler, is brokerage without a licence.",
    }),
    repl({
      id: "LOA-T01U2-QR", replaces: "LOA-T01U2-Q", tests: "T01U2", module: "module-01", screen: "t01u2-s1",
      source: "Texas Occupations Code", section: "§ 1101.801",
      judgement: "That a Commission order settles nothing in the other two tracks.",
      prompt: "A license holder signs an agreed order with the Commission and pays an administrative penalty. She tells her broker the matter is now closed. What does § 1101.801 say?",
      choices: [
        "It is not closed. “Disciplinary action taken against a person under Section 1101.652 does not relieve the person from civil or criminal liability,” so the injured consumer's suit and any prosecution proceed independently of the Commission's order.",
        "It is closed as to the consumer, because a Commission order that assesses a penalty compensates the consumer for the same conduct.",
        "It is closed as to any criminal exposure, because the Commission's jurisdiction over a licence displaces a prosecutor's on the same facts.",
        "It is closed unless the consumer intervened in the Commission proceeding, in which case the consumer may still sue.",
      ],
      rationale: "A TREC order is one of three tracks, and the other two belong to the injured consumer and to the State. Section 1101.801 says so in terms. The criminal track is real if rarely travelled — § 1101.756 makes a wilful violation of the chapter or a Commission order a Class A misdemeanor and § 1101.758 does the same for acting without a licence — and the money track is where unlicensed activity becomes catastrophic under § 1101.753(a) and § 1101.754(a). Nor does the Commission compensate anyone: § 1101.659(b) limits a refund order to what the consumer paid and forbids the Commission to require other damages.",
    }),
    repl({
      id: "LOA-T01U3-QR", replaces: "LOA-T01U3-Q", tests: "T01U3", module: "module-01", screen: "t01u3-s1",
      source: "22 TAC", section: "§ 535.1",
      judgement: "That TRELA defines neither client nor customer, and where the industry vocabulary actually comes from.",
      prompt: "A student searches Chapter 1101 for definitions of “client” and “customer” and finds neither. What is the accurate account of where the client/customer distinction comes from?",
      choices: [
        "From the concept of representation, which the statute does address by other means. “Customer” does not appear in Chapter 1101 at all; “clients” appears in § 1101.553 and § 1101.803 without being defined; and among the rules held for this course the pair appears once, in the 22 TAC § 535.1 definition of “Place of business,” which defines the place and not the people.",
        "From 22 TAC § 535.1, which defines both terms for Chapter 535 and supplies the meaning Chapter 1101 leaves out.",
        "From § 1101.551(2), which defines “party” to mean a client and excludes customers from the definition.",
        "From § 1101.557(a), which defines a client as a person who has signed an exclusive agreement and a customer as one who has not.",
      ],
      rationale: "The distinction is industry vocabulary describing two positions the statute creates by other means, which is why learning the statutory machinery first and the vocabulary second is the order that survives a complicated fact pattern. What the statute does define is “party” at § 1101.551(2) and “intermediary” at § 1101.551(1); what it creates is representation, at § 1101.557(a). The 22 TAC § 535.1 definition of “Place of business” — “[a] place where the license holder meets with clients and customers to transact business” — is the one place in the sources read for this course where the two words appear side by side, and it defines the place.",
    }),
    repl({
      id: "LOA-T01U4-QR", replaces: "LOA-T01U4-Q", tests: "T01U4", module: "module-01", screen: "t01u4-s1",
      source: "22 TAC", section: "§ 531.2",
      judgement: "At what moment fiduciary status attaches under the Commission's fidelity canon.",
      prompt: "A license holder has spent two weeks doing a buyer's work — pulling comparables, advising, arranging showings — and the representation agreement is sitting unsigned in her car. When did the fiduciary standard attach?",
      choices: [
        "When she began acting for him. 22 TAC § 531.2 imposes the standard on a license holder “while acting as an agent for another,” so the trigger is acting rather than signing, and the paperwork records the relationship instead of creating it.",
        "When the agreement is signed, because the canon speaks of a fiduciary relationship being “created” and a relationship is created by the parties' signatures.",
        "When compensation is first agreed, because a fiduciary duty is the consideration a client buys.",
        "When the broker accepts the engagement in the broker's own name, because the canon binds brokers and not sponsored sales agents.",
      ],
      rationale: "22 TAC § 531.2 opens: “A license holder, while acting as an agent for another, is a fiduciary. Special obligations are imposed when such fiduciary relationships are created.” The standard attaches to the relationship rather than to the paperwork, so you become a fiduciary when you start acting for somebody. The canon also binds each individual licence — 22 TAC § 531.1 defines License Holder as a broker or sales agent licensed under Chapter 1101 — so a sales agent cannot treat fidelity as the broker's problem. That is the direction of hazard the unit warns about: the duties arrive on their own schedule, and only the signed writing brings the fee.",
    }),
  ]),
  T02: Object.freeze([
    repl({
      id: "LOA-T02U1-QR", replaces: "LOA-T02U1-Q", tests: "T02U1", module: "module-02", screen: "t02u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.551(2)",
      judgement: "That a duty owed to a party is not discharged by telling that party's license holder.",
      prompt: "You must get material information to the buyer in your transaction. You tell the buyer's sales agent and assume it has landed. What does the exclusion at the end of § 1101.551(2) tell you about that assumption?",
      choices: [
        "That the person you told is not a party at all — “[t]he term does not include a license holder who represents a party” — so the counterpart's license holder is a different person from the party, and you do not owe that license holder the duties you owe your own principal either.",
        "That the counterpart's license holder is a party for this purpose, so telling that agent discharges the duty completely.",
        "That the duty was never yours, because information owed to a party is owed only by the broker who represents that party.",
        "That the assumption is safe as long as the other agent acknowledges receipt in writing, which converts the agent into an authorised representative under the definition.",
      ],
      rationale: "Section 1101.551(2) defines a party as a prospective buyer, seller, landlord or tenant, or an authorised representative of one — naming a trustee, guardian, executor, administrator, receiver or attorney-in-fact — and then adds the sentence that matters more than students expect: “The term does not include a license holder who represents a party.” Two consequences follow. The agent on the other side of your deal is not a party, so you do not owe that person the duties you owe your principal; and you cannot discharge a duty owed to a party by telling that party's broker something and assuming it landed. Note also that agency is not friendliness, cooperation or access: what it is, is the status § 1101.557(a) confers.",
    }),
    repl({
      id: "LOA-T02U2-QR", replaces: "LOA-T02U2-Q", tests: "T02U2", module: "module-02", screen: "t02u2-s1",
      source: "22 TAC", section: "§ 535.2(f)",
      judgement: "Whose contract a listing is, and what that means when a sales agent changes sponsorship.",
      prompt: "A sales agent negotiated and signed a listing in her own name, then changes brokerages and tells the seller she is taking the listing with her. Which provisions answer her?",
      choices: [
        "Section 1101.351(c), because she may not engage in brokerage except while sponsored by and acting for a broker, and 22 TAC § 535.2(f), because “[l]istings and other agreements for real estate brokerage services must be solicited and accepted in a broker's name” — the listing was never hers to take.",
        "Section 1101.806(c), because the listing is enforceable only against the party who signed it and the agent signed it herself.",
        "Section 1101.557(c)(1), because a listing agreement confers authority to bind and that authority travels with the license holder who obtained it.",
        "Nothing prevents it, because the seller may consent to transfer the listing and consent cures the naming defect.",
      ],
      rationale: "The chain of authority runs from the client to the broker under § 1101.557(a), from the broker to the sales agent in writing under 22 TAC § 535.2(a), and it may be extended but not cut. Section 1101.351(c) permits a sales agent to act only while “sponsored by a licensed broker and … acting for that broker,” and § 535.2(f) requires listings and other brokerage agreements to be solicited and accepted in a broker's name. Signing a listing in her own name violates the first and misstates who the contracting party is under the second. Compensation travels the same route: § 1101.651(b) and (c) with 22 TAC § 535.3 keep money moving through the sponsoring broker, so a buyer who wants to hand you a cheque at closing is asking you to break the chain.",
    }),
    repl({
      id: "LOA-T02U3-QR", replaces: "LOA-T02U3-Q", tests: "T02U3", module: "module-02", screen: "t02u3-s1",
      source: "Texas Occupations Code", section: "§ 1101.652(b)(12)",
      judgement: "Why property management sits differently in the Act from a listing, and what that signals about the size of the grant.",
      prompt: "A broker's property management agreement runs indefinitely over a continuing series of leases, renewals and repairs. A colleague says every contract for services requiring a licence must carry a definite termination date, so the agreement is defective. Is he right?",
      choices: [
        "No. Section 1101.652(b)(12) requires a definite termination date not subject to prior notice in a contract for services requiring a licence “other than a contract to perform property management services,” and the Act treats property management differently because it is a materially larger grant of authority.",
        "Yes. The requirement admits no exception, and a property management agreement without a stated end date is a disciplinary matter like any other open-ended engagement.",
        "No, because § 1101.652(b)(12) reaches only listing agreements and buyer representation agreements by its own terms.",
        "Yes, unless the agreement provides that either party may terminate on thirty days' notice, which satisfies the definite-termination-date requirement.",
      ],
      rationale: "Section 1101.652(b)(12) makes it a ground for discipline to fail to specify “a definite termination date that is not subject to prior notice” in a contract, “other than a contract to perform property management services,” in which the license holder agrees to perform services requiring a licence. Two things follow. The carve-out is real, and it is a signal: a property management agreement can confer authority to bind under § 1101.557(c)(1) and typically runs over an indefinite series of transactions, which is the shape of a general agency, and 22 TAC § 535.2(d) makes the broker responsible for a sponsored sales agent's property management activity requiring a licence. And a term that runs until one side gives thirty days' notice is subject to prior notice, so it does not satisfy the requirement anywhere it applies.",
    }),
    repl({
      id: "LOA-T02U4-QR", replaces: "LOA-T02U4-Q", tests: "T02U4", module: "module-02", screen: "t02u4-s1",
      source: "22 TAC", section: "§ 535.156",
      judgement: "The one condition on which the duty to submit offers after a client is under contract can be switched off.",
      prompt: "Your sellers accept an offer on Friday. On Saturday a higher backup offer arrives. The sellers told you at the listing appointment that once they were under contract they did not want to see anything else, but nothing was written down. What does 22 TAC § 535.156 require?",
      choices: [
        "Submit it. The rule relieves the duty only “if the principal has agreed in writing that offers are not to be submitted after the principal has entered into a contract,” and no writing exists — so the duty to convey all known information affecting the decision on offers stands.",
        "Do not submit it, because the sellers gave a clear instruction and obedience to a lawful instruction is a fiduciary duty.",
        "Do not submit it, because the rule's duty to convey information about offers ends automatically once the principal has accepted one.",
        "Submit it only if the backup offer is higher than the accepted one, because information that could not change the decision is not information affecting it.",
      ],
      rationale: "22 TAC § 535.156 states the duty and its exception together, and quoting the first clause alone teaches a falsehood: a license holder “shall convey to the principal all known information which would affect the principal's decision on whether or not to make, accept or reject offers; however, if the principal has agreed in writing that offers are not to be submitted after the principal has entered into a contract … the license holder shall have no duty to submit offers to the principal after the principal has accepted an offer.” No writing, no exception. The same rule adds an affirmative duty to keep the principal informed “at all times” of significant information, and § 1101.557(b)(2) and (3) put the same obligation in the statute, at a minimum answering the party's questions and presenting any offer to or from the party.",
    }),
    repl({
      id: "LOA-T02U5-QR", replaces: "LOA-T02U5-Q", tests: "T02U5", module: "module-02", screen: "t02u5-s1",
      source: "22 TAC", section: "§ 531.20",
      judgement: "Which delivery methods the rule permits and the qualifier attached to an attachment or link.",
      prompt: "You email a prospective buyer about a specific listing, attach the completed IABS notice as a PDF, and write only: “Hi Marcus — here's the info you asked for, call me anytime.” Your team lead suggests instead putting a permanent IABS link in everyone's signature block. Apply 22 TAC § 531.20.",
      choices: [
        "Neither complies. An attachment or a link within the body requires “a specific reference to the IABS Notice in the body of the email,” which your message lacks, and the rule adds flatly that the link to a completed notice “may not be in a footnote or signature block in an email.”",
        "Both comply, because the notice reached the recipient in a permitted format and the rule is concerned with delivery rather than with wording.",
        "The attachment complies and the signature block does not, because attaching the completed notice is personal delivery within the rule.",
        "Neither complies, because the rule permits delivery only by personal delivery, first class mail or overnight common carrier and does not recognise email at all.",
      ],
      rationale: "22 TAC § 531.20 states four permitted routes: personal delivery by the license holder; first class mail or overnight common carrier; the body of an email; or an attachment or a link within the body of an email, “with a specific reference to the IABS Notice in the body of the email.” That final qualifier is the one people fail, and an email body that says only that it was great talking today does not satisfy it. The rule then forecloses the tidy solution by name: the link “may not be in a footnote or signature block in an email.” The homepage link is a separate duty with two label options at different font floors, and reproduction of the form is permitted only verbatim with the spacing, borders and placement appearing identical, except that the Broker Contact Information section may be prefilled.",
    }),
  ]),
  T03: Object.freeze([
    repl({
      id: "LOA-T03U1-QR", replaces: "LOA-T03U1-Q", tests: "T03U1", module: "module-03", screen: "t03u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.803",
      judgement: "That a duty owed to a non-client still reaches the broker's licence.",
      prompt: "An unrepresented buyer who bought your listing complains to the Commission about something you told him. Your sponsoring broker says the complaint cannot touch the firm because the buyer was never a client. Evaluate that using § 1101.803.",
      choices: [
        "It can. The section makes a licensed broker “liable to the commission, the public, and the broker's clients for any conduct engaged in under this chapter by the broker or by a sales agent associated with or acting for the broker” — the public is named before the clients, and the liability attaches to association rather than to a client relationship.",
        "It cannot, because the broker's liability under the section runs to the broker's own clients and to the Commission, not to members of the public.",
        "It cannot, because a complaint that names only a sales agent is a complaint against that agent alone.",
        "It can, but only if the buyer proves he suffered a loss, because liability to the public requires damages while liability to a client does not.",
      ],
      rationale: "Non-fiduciary does not mean no consequences. Section 1101.803 lists the people to whom a licensed broker is liable in the order the Legislature wrote them: the commission, the public, and the broker's clients. Section 1101.801 adds that discipline “does not relieve the person from civil or criminal liability.” And the Commission's own rule closes the gap the broker was reaching for: 22 TAC § 535.141 makes a complaint naming a sales agent, but not the sponsoring broker, a complaint against the broker for the limited purposes of determining the broker's involvement and whether the broker fulfilled the broker's professional responsibilities.",
    }),
    repl({
      id: "LOA-T03U2-QR", replaces: "LOA-T03U2-Q", tests: "T03U2", module: "module-03", screen: "t03u2-s1",
      source: "22 TAC", section: "§ 531.3",
      judgement: "That carelessness and speaking outside your competence are violations without any dishonesty.",
      prompt: "An agent tells an unrepresented buyer in Bastrop County that a tract “is not in a flood zone,” having glanced at a map on her phone. She believes it and it is wrong. Which analysis fits the held rules?",
      choices: [
        "22 TAC § 531.3 requires “prudence and caution so as to avoid misrepresentation, in any way, by acts of commission or omission,” which imports a standard of care rather than a mere ban on lying, and § 1101.652(b)(1) independently reaches incompetence — so honesty does not answer either.",
        "Neither provision is engaged, because she believed the statement and § 531.3 reaches only deliberate misrepresentation.",
        "Only § 1101.652(b)(2) is engaged, because a statement made in good faith cannot be careless within the meaning of § 531.3.",
        "Neither is engaged, because the buyer was unrepresented and the canons state duties owed to clients.",
      ],
      rationale: "The phrase “prudence and caution” in 22 TAC § 531.3 is the Commission importing a standard of care, so carelessness with facts is a violation, and “by acts of commission or omission” makes the rule reach silence as well as speech. The competence side is statutory too: § 1101.652(b)(1) reaches a license holder who acts negligently or incompetently while engaged in real estate brokerage, and 22 TAC § 535.156 imposes a duty to convey accurate information to members of the public with whom the license holder deals — a duty that names no client. Flood risk goes to the flood map and the insurer, zoning to the city, structural questions to an engineer, and value to a licensed appraiser.",
    }),
    repl({
      id: "LOA-T03U3-QR", replaces: "LOA-T03U3-Q", tests: "T03U3", module: "module-03", screen: "t03u3-s1",
      source: "22 TAC", section: "§ 535.157",
      judgement: "That the response clock is measured in calendar days and reaches an unrepresented party you do not represent.",
      prompt: "A for-sale-by-owner in Killeen emails your listing brokerage at 4:00 p.m. on Friday about a buyer you represent. You are out of the office until Monday. What does 22 TAC § 535.157 give you?",
      choices: [
        "Two calendar days, which do not pause for the weekend: the rule says “calendar days,” says nothing about business days, holidays or office hours, and names an unrepresented party to a real estate transaction as one of the three recipients of the duty.",
        "Two business days, because Commission deadlines are computed in working days unless the rule says otherwise.",
        "No deadline at all, because the sender is unrepresented and the duty runs only to your own principal and to the license holder on the other side.",
        "Two calendar days, but only once you have resolved the question, because an acknowledgement is not a response within the rule.",
      ],
      rationale: "This is the most commonly misremembered number in the Commission's rules, and the error always runs the same way: students convert it to business days and answer late. 22 TAC § 535.157 says “within two calendar days” and excludes no Saturday, Sunday or holiday. Compare 22 TAC § 535.146(b), where the Commission set the trust-money deposit deadline at the close of business of the second working day — it knows how to write “working day” when it means one. The third category, “an unrepresented party to a real estate transaction,” is exactly the for-sale-by-owner here, and responding is not resolving: an acknowledgement naming where the question has gone and when an answer is expected satisfies the rule.",
    }),
    repl({
      id: "LOA-T03U4-QR", replaces: "LOA-T03U4-Q", tests: "T03U4", module: "module-03", screen: "t03u4-s1",
      source: "Business & Commerce Code", section: "§ 17.49(i)",
      judgement: "Where Texas draws the statutory line between opinion and an express misrepresentation of fact.",
      prompt: "Two statements appear in the same listing: “a wonderful family home in a great school district,” and “this home is zoned for Bowie Elementary.” The second is wrong. Apply the carve-outs in Business & Commerce Code § 17.49(i).",
      choices: [
        "The first can honestly be characterised as advice, judgment or opinion and stays inside the broker exemption; the second is an express misrepresentation of a material fact that cannot be so characterised, which is the first carve-out, so the exemption does not protect it.",
        "Both stay inside the exemption, because § 17.49(i) exempts any claim against a license holder arising from an act or omission while acting as a broker or salesperson.",
        "Neither stays inside the exemption, because the subsection's carve-outs remove every statement made in the course of marketing a property.",
        "The second stays inside the exemption because the school district assignment came from a public source, and the first does not because it makes a claim about quality.",
      ],
      rationale: "Section 17.49(i) exempts a claim against a person licensed under Chapter 1101 arising from an act or omission “while acting as a broker or salesperson,” and then removes three things from the exemption: an express misrepresentation of a material fact that cannot be characterised as advice, judgment or opinion; a failure to disclose in violation of § 17.46(b)(24); and an unconscionable action or course of action that cannot be so characterised. That is the puffing rule in statutory language. Two warnings: the exemption is from the DTPA only, so § 1101.652(b)(2) still reaches dishonest conduct, and a court reads substance, so dressing a hard factual claim in the words “I think” will not convert it into an opinion.",
    }),
    repl({
      id: "LOA-T03U5-QR", replaces: "LOA-T03U5-Q", tests: "T03U5", module: "module-03", screen: "t03u5-s1",
      source: "Texas Property Code", section: "§ 5.008(a), (d)",
      judgement: "Which properties the seller's notice reaches, and that “Unknown” is compliance when the information genuinely is unknown.",
      prompt: "A seller is transferring a duplex in San Marcos, both units tenanted, and does not know the age of the roof on the house she is separately selling. Apply Property Code § 5.008(a) and (d) to the two facts.",
      choices: [
        "The duplex is outside the section, because subsection (a) reaches “[a] seller of residential real property comprising not more than one dwelling unit,” and on the house a seller who genuinely does not know may indicate that on the notice and “by that act is in compliance with this section.”",
        "The duplex is inside the section because both units are residential, and “Unknown” is never compliance because subsection (d) requires the notice to be completed accurately.",
        "The duplex is outside the section because it is tenanted rather than owner-occupied, and “Unknown” is compliance only where the buyer accepts it in writing.",
        "The duplex is inside the section because the exemptions in subsection (e) are exhaustive and none covers a duplex, and “Unknown” is compliance in every case including where the seller does know.",
      ],
      rationale: "Parse subsection (a) by its own words: residential real property, comprising not more than one dwelling unit, located in this state, with the notice going to “the purchaser.” A single-family house is inside; a duplex comprises two dwelling units and is not. Subsection (d) then makes the notice a knowledge document: it must be completed “to the best of seller's belief and knowledge as of the date the notice is completed and signed by the seller,” and “[i]f the information required by the notice is unknown to the seller, the seller shall indicate that fact on the notice, and by that act is in compliance with this section.” The safe harbour operates only where the information genuinely is unknown — “Unknown” written to avoid an answer the seller has is a false statement on the notice.",
    }),
    repl({
      id: "LOA-T03U6-QR", replaces: "LOA-T03U6-Q", tests: "T03U6", module: "module-03", screen: "t03u6-s1",
      source: "Texas Occupations Code", section: "§§ 1101.556, 1101.802",
      judgement: "How far the enumeration in § 1101.556 reaches, and that the liability immunity is drafted for one category only.",
      prompt: "Two questions arrive on the same listing: whether a homicide occurred in the house, and whether a former occupant had an HIV-related illness. What do § 1101.556 and § 1101.802 do with each?",
      choices: [
        "Section 1101.556(2) lists three manners of death — natural causes, suicide and accident unrelated to the condition of the property — and homicide is not among them, so the section supplies no relief for it; on the health-status question § 1101.556(1) relieves the duty and § 1101.802 adds an immunity from civil and criminal liability that is drafted for the AIDS and HIV category alone.",
        "Both questions fall inside § 1101.556, because the section covers anything that stigmatises a property without affecting its physical condition.",
        "Neither falls inside § 1101.556, because the section relieves only a duty to inquire and never a duty to disclose.",
        "Both fall inside § 1101.802, which supplies immunity from civil and criminal liability for any failure to disclose a stigma.",
      ],
      rationale: "Section 1101.556 relieves the duty to inquire about, disclose or release information for two categories only, and its subdivision (2) enumerates natural causes, suicide and accident unrelated to the condition of the property. Homicide is outside the words the Legislature chose, and what Texas common law requires about it was not held for this course. The asymmetry with § 1101.802 is real: § 1101.556 relieves the duty for both categories, while § 1101.802 supplies an immunity from civil and criminal liability and only for AIDS, an HIV-related illness or HIV infection. And on that category 22 TAC § 531.19 points the other way, independently prohibiting inquiring about, responding to or facilitating inquiries about, or disclosing information indicating a preference or limitation based on disability, which that rule defines to include those conditions.",
    }),
  ]),
  T04: Object.freeze([
    repl({
      id: "LOA-T04U1-QR", replaces: "LOA-T04U1-Q", tests: "T04U1", module: "module-04", screen: "t04u1-s1",
      source: "22 TAC", section: "§ 535.16(b)",
      judgement: "The two conditions on a net listing and the two terms the rule forces into the agreement.",
      prompt: "An heir outside Bastrop who inherited a house she has never lived in, and who has not been inside a Texas purchase since 1998, insists on a net listing: “Get me $260,000 and keep the rest.” May the broker take it, and on what terms if so?",
      choices: [
        "No. The rule permits a net listing only where the principal requires it and the principal appears familiar with current market values of real property, and the second condition fails here; had both held, the agreement would still have to assure the principal of not less than her desired price and limit the broker to a specified maximum commission.",
        "Yes. She required it, which is the condition the rule states, and the rule leaves the terms of the agreement to the parties.",
        "Yes, provided the broker discloses that a net listing may pay more on a higher sale, because disclosure cures the conflict the rule identifies.",
        "No, because 22 TAC § 535.16 prohibits net listings outright and the broker's only option is a percentage commission.",
      ],
      rationale: "22 TAC § 535.16 defines a net listing as one “in which the broker's commission is the difference (‘net’) between the sales proceeds and an amount desired by the owner,” and then states the restriction with its condition attached: “A broker may not take net listings unless the principal requires a net listing and the principal appears to be familiar with current market values of real property.” Both conditions, joined by “and,” and familiarity is not assumed from ownership. The rule explains itself — the arrangement “places an upper limit on the principal's expectancy and places the broker's interest above the principal's interest with reference to obtaining the best possible price” — and if a net listing is used it must “assure the principal of not less than the principal's desired price and limit the broker to a specified maximum commission.”",
    }),
    repl({
      id: "LOA-T04U2-QR", replaces: "LOA-T04U2-Q", tests: "T04U2", module: "module-04", screen: "t04u2-s1",
      source: "Texas Occupations Code", section: "§ 1101.557(c)(3)",
      judgement: "The three conditions of the offer-delivery safe harbour and the meaning of the word “sole”.",
      prompt: "A listing broker is out of state. A cooperating broker telephones him, obtains his consent to hand the written offer directly to the sellers, emails him a copy the same hour, delivers the envelope, and then spends ten minutes explaining why the price is generous and the closing date flexible. Apply § 1101.557(c)(3).",
      choices: [
        "The safe harbour is lost. It protects the sole delivery of an offer where the party's broker consents, a copy is sent to that broker, and the person delivering “does not engage in another activity that directly or indirectly violates” § 1101.652(b)(22) — and explaining why the terms are attractive is negotiating.",
        "The safe harbour holds, because all three conditions were satisfied at the moment of delivery and what was said afterwards is a separate matter.",
        "The safe harbour holds, because the listing broker's consent to the delivery is consent to whatever the delivering broker says while there.",
        "The safe harbour is lost, because consent given by telephone is not effective; the subsection requires the party's broker to consent in writing.",
      ],
      rationale: "Section 1101.557(c)(3) creates a narrow, conditioned exception that new license holders misread constantly. Three conditions are all required: the party's broker must consent — silence is not consent and an unreachable listing broker has not consented; a copy of the offer must go to that broker, with a single carve-out where a governmental agency's sealed bid process forbids it; and the person delivering must do nothing else that would violate subdivision (22). The word “sole” is doing the work: this is a safe harbour for delivery alone. Handing over the envelope is protected; handing it over and then arguing the merits is negotiating, which is precisely the conduct subdivision (22) reaches.",
    }),
    repl({
      id: "LOA-T04U3-QR", replaces: "LOA-T04U3-Q", tests: "T04U3", module: "module-04", screen: "t04u3-s1",
      source: "22 TAC", section: "§ 537.11(e), (b)(7)",
      judgement: "That representation includes an affirmative duty to send a client to a lawyer, and never a licence to discourage one.",
      prompt: "A seller's transaction involves an unusual instrument that must be acknowledged and filed of record. The seller asks whether she really needs to pay a lawyer to look at it. What does 22 TAC § 537.11 require of you?",
      choices: [
        "You must advise her to consult an attorney before executing the instrument, because § 537.11(e) makes that duty affirmative where a transaction involves unusual matters that should be reviewed by an attorney or where the instrument must be acknowledged and filed of record — and § 537.11(b)(7) separately forbids you to attempt to prevent or in any manner discourage a principal from employing an attorney.",
        "You may tell her that in your experience a lawyer is an unnecessary expense on a routine matter, provided you do not give her an opinion about the instrument itself.",
        "You must decline to comment either way, because any statement about legal representation is the practice of law under § 537.11(b).",
        "You must obtain an opinion from the brokerage's attorney and relay it to her, which § 537.11 permits so long as the brokerage pays for it.",
      ],
      rationale: "22 TAC § 537.11(e) is an affirmative duty: “When a transaction involves unusual matters that should be reviewed by an attorney before an instrument is executed, or if the instrument must be acknowledged and filed of record, the license holder shall advise the license holder's principals to consult an attorney before executing the instrument.” Section 537.11(b)(7) then forbids attempting to prevent or in any manner whatsoever discouraging a principal from employing an attorney, and the rule elsewhere forbids obtaining legal advice from an attorney, directly or indirectly, for a principal in a transaction where you are acting as agent. The section also requires you to advise principals that the instrument they are about to execute is binding on them.",
    }),
    repl({
      id: "LOA-T04U4-QR", replaces: "LOA-T04U4-Q", tests: "T04U4", module: "module-04", screen: "t04u4-s1",
      source: "Texas Occupations Code", section: "§ 1101.805(d)",
      judgement: "The mirror image of the misrepresentation allocation: when a party becomes liable for a license holder's statement.",
      prompt: "A listing agent misstates the age of the roof. The seller knew nothing about it. Is the seller liable for the agent's misstatement under § 1101.805(d)?",
      choices: [
        "No. A party is not liable for a license holder's misrepresentation or concealment of a material fact unless the party both “knew of the falsity” and “failed to disclose the party's knowledge of the falsity,” and the two conditions are joined by “and,” so a seller who knew nothing satisfies neither.",
        "Yes, because a principal answers for the acts of the agent through whom the principal acts and § 1101.805 does not disturb that.",
        "Yes, unless the seller can show the agent acted outside the authority the listing conferred.",
        "No, because § 1101.805(d) relieves a party of liability for anything a license holder says, without conditions.",
      ],
      rationale: "Section 1101.805(d) is the mirror image of subsection (e): it protects the party from the license holder's conduct on the same two conjunctive conditions — knew of the falsity, and failed to disclose that knowledge. Subsection (b) makes the section prevail “over any other law, including common law,” which is how Texas changed the vicarious-liability analysis that made listing brokers fear subagency. What the section does not do is relieve a broker: subsection (c) provides that it “does not diminish a broker's responsibility for the acts or omissions of a sales agent associated with or acting for the broker,” which § 1101.803 states affirmatively and 22 TAC § 535.2(a) works out mechanically.",
    }),
    repl({
      id: "LOA-T04U5-QR", replaces: "LOA-T04U5-Q", tests: "T04U5", module: "module-04", screen: "t04u5-s1",
      source: "Texas Occupations Code", section: "§ 1101.652(b)(13)",
      judgement: "That a quiet vendor rebate on a client's expenditure is a disciplinary ground even where the client paid a fair price.",
      prompt: "A seller pays $1,800 for a photography package the listing agent arranged. The vendor quietly returns fifteen per cent of it to the agent's brokerage. The seller is never told. Which ground does that engage?",
      choices: [
        "Section 1101.652(b)(13), which reaches an undisclosed commission, rebate or direct profit on an expenditure made for a principal — the vice is the concealment, not the amount.",
        "None, because the seller received the photography she paid for and suffered no loss.",
        "Section 1101.652(b)(11), because the payment was divided with a person who is not a license holder.",
        "Section 1101.652(b)(30), because money returned by a vendor in connection with a transaction is trust money that must be deposited with a title company.",
      ],
      rationale: "Three subdivisions of § 1101.652(b) reach undisclosed money and a listing broker can trip all three in one transaction: (8) receiving compensation from more than one party without the full knowledge and consent of all parties; (13) an undisclosed commission, rebate or direct profit on an expenditure made for a principal; and (16) acting in a dual capacity as broker and undisclosed principal. Subdivision (13) is the one that fits a vendor kickback on the seller's own spending, and no loss is required — accounting is a fiduciary duty and it covers money that comes to you because of the transaction. 22 TAC § 535.148(a) reaches the same conduct from the rule side by requiring prior disclosure and the client's consent.",
    }),
  ]),
  T05: Object.freeze([
    repl({
      id: "LOA-T05U1-QR", replaces: "LOA-T05U1-Q", tests: "T05U1", module: "module-05", screen: "t05u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.563(c)",
      judgement: "What the written agreement must actually state about compensation, and in what form the negotiability disclosure must appear.",
      prompt: "A buyer representation agreement states the services, a termination date, that it is exclusive, and that the broker represents the buyer. Its fee clause reads: “Broker's fee shall be as agreed at the time of contract.” The negotiability sentence sits in the same type as the surrounding paragraph on page four. Apply § 1101.563(c).",
      choices: [
        "It fails twice. Subdivision (c)(1)(E) requires “the amount or rate of compensation the broker will receive and how this amount will be determined,” and (c)(2) requires the agreement to disclose “in conspicuous language that broker compensation is not set by law and is fully negotiable.”",
        "It complies, because the agreement carries every item subsection (c) lists and the fee can be settled later by agreement.",
        "It fails only on the fee clause; a negotiability sentence placed anywhere in the agreement satisfies subsection (c)(2).",
        "It fails only on the negotiability sentence; the fee clause complies because subsection (c)(1)(E) requires an amount or a rate and “as agreed” states a method.",
      ],
      rationale: "Subsection (c)(1)(E) has two halves and both matter: the number or the rate, and the method by which the amount will be determined — percent of what, measured when, payable on what event. “To be determined” states neither. Subsection (c)(2) then requires the agreement to “disclose in conspicuous language that broker compensation is not set by law and is fully negotiable,” and conspicuous means it must stand out, so a sentence in the same type as the surrounding paragraph on page four is not conspicuous. The Commission has adopted no buyer representation form, and (c)(2) reaches the agreement whoever drafted it, so noticing when a form does not comply is the license holder's job.",
    }),
    repl({
      id: "LOA-T05U2-QR", replaces: "LOA-T05U2-Q", tests: "T05U2", module: "module-05", screen: "t05u2-s1",
      source: "Texas Occupations Code", section: "§ 1101.559(b)",
      judgement: "What a representation agreement must contain before it can supply a party's written intermediary consent.",
      prompt: "A brokerage's buyer representation agreement says the broker may act as an intermediary, and nothing more. On a Saturday the buyer wants to see one of the firm's own listings. Apply § 1101.559.",
      choices: [
        "The agreement does not supply the consent. Subsection (b) makes such an agreement sufficient to establish a party's written consent only “if the written agreement specifies in conspicuous bold or underlined print the conduct that is prohibited under Section 1101.651(d),” so the broker must obtain written consent under subsection (a) — stating the source of any expected compensation — before acting as intermediary.",
        "The agreement supplies the consent, because subsection (b) requires only that the agreement authorise intermediary status.",
        "The agreement supplies the consent provided the buyer initials it again on the day the conflict arises, which cures the missing recital.",
        "No consent is needed, because § 1101.561(b) makes intermediary status mandatory and a mandatory status cannot depend on consent.",
      ],
      rationale: "Section 1101.559(a) permits a broker to act as an intermediary only if the broker obtains written consent from each party for the broker to act as an intermediary in the transaction and the written consent states the source of any expected compensation to the broker. Subsection (b) then lets an ordinary listing or representation agreement carry that consent, but on a substantive condition: the agreement must specify, in conspicuous bold or underlined print, the conduct § 1101.651(d) prohibits. That is the Legislature making sure the consent is informed about the actual cost of the arrangement. Note also what the subsection does not require: it prescribes no point size, unlike § 1101.558(b-1)'s 10-point floor or 22 TAC § 535.17(c)'s 12-point one.",
    }),
    repl({
      id: "LOA-T05U3-QR", replaces: "LOA-T05U3-Q", tests: "T05U3", module: "module-05", screen: "t05u3-s1",
      source: "Texas Occupations Code", section: "§ 1101.563(d)",
      judgement: "That a showing-only agreement does not silently upgrade itself when the work changes.",
      prompt: "A buyer signs a showing-only agreement on Tuesday. On Thursday she asks the same license holder to write an offer on one of the houses. What does § 1101.563(d) require?",
      choices: [
        "A separate agreement. Subsection (d) requires a license holder who entered into a written agreement for the sole purpose of showing property under § 1101.562 to enter into a separate agreement with the prospective buyer “if additional real estate brokerage acts are to be provided after showing the real property.”",
        "Nothing further, because the showing-only agreement is still within its fourteen-day term and covers the engagement until it expires.",
        "An oral confirmation that the license holder now represents her, because the writing requirement is satisfied by the existing agreement.",
        "An amendment extending the fourteen-day term, because subsection (e) fixes the term and subsection (d) addresses only its length.",
      ],
      rationale: "Section 1101.563(d) exists because the posture is not permanent and does not upgrade itself: the moment you begin doing more than showing — advising, negotiating, drafting an offer — a separate agreement is required, and that separate agreement is where the representation status box gets checked differently. Subsection (e) puts two hard limits on the showing-only agreement itself: it may not be exclusive, and it may not state a termination date more than fourteen days from the date it is entered into. Fourteen days is a ceiling rather than a default, so a one-day or three-day term for a single Saturday of showings is lawful and often cleaner.",
    }),
    repl({
      id: "LOA-T05U4-QR", replaces: "LOA-T05U4-Q", tests: "T05U4", module: "module-05", screen: "t05u4-s1",
      source: "Texas Occupations Code", section: "§ 1101.652(b)(3), (b)(4)",
      judgement: "Which protection an unrepresented buyer already has, so that the benefit of representation is stated honestly.",
      prompt: "A prospect asks why she should sign anything, since she assumes an unrepresented buyer is told nothing at all. Which statement is accurate about what she already has?",
      choices: [
        "She is already owed disclosure of a known significant defect: § 1101.652(b)(3) and (b)(4) reach a material misrepresentation to, or a failure to disclose to, “a potential buyer” such a defect, and 22 TAC § 535.156 requires accurate information to members of the public. What representation adds is everything else — the seller's timeline, the offer that fell through, the pattern in the comparables.",
        "She is owed nothing until she signs, which is why the written agreement is described as protecting consumers.",
        "She is owed the same information a client is owed, because 22 TAC § 531.2 requires other parties to be treated fairly and fairness means equal information.",
        "She is owed disclosure of defects only if she asks, because § 1101.652(b)(4) reaches a failure to answer rather than a failure to volunteer.",
      ],
      rationale: "The benefits of buyer agency are stated honestly by naming what the buyer would receive anyway. Sections 1101.652(b)(3) and (b)(4) speak of a “potential buyer,” not a client, and (b)(4) is a failure-to-disclose ground, so nobody has to ask a question first; 22 TAC § 535.156 adds the duty to convey accurate information to members of the public with whom the license holder deals. What an unrepresented buyer does not have is anyone whose duty of fidelity runs to her, anyone obliged to keep her informed of significant information under § 535.156, and anyone permitted to give her opinions and advice — which § 1101.562(a)(3) forbids a broker showing property without representation to do.",
    }),
    repl({
      id: "LOA-T05U5-QR", replaces: "LOA-T05U5-Q", tests: "T05U5", module: "module-05", screen: "t05u5-s1",
      source: "22 TAC", section: "§ 535.147(d)",
      judgement: "The consents a rebate requires and the one manner of payment the rule forbids outright.",
      prompt: "A sales agent wants to rebate $2,000 of her share to her buyer client at closing, and to keep it off the settlement statement because the buyer is short on cash to close. Apply 22 TAC § 535.147(d).",
      choices: [
        "The rebate itself is permitted with the written consent of the sponsoring broker and of the party the license holder represents, but keeping it off the settlement statement is not: the subsection forbids paying a rebate “in a manner that misleads a broker, lender, title company, or governmental agency regarding the real estate transaction or the financial resources or obligations of the buyer.”",
        "Both are permitted, because a rebate is the license holder's own money and how it is documented is a matter between her and her client.",
        "Neither is permitted, because a license holder may never pay any part of a commission to a party to the transaction.",
        "Both are permitted provided the sponsoring broker consents in writing; the client's consent is required only where the rebate goes to a party the license holder does not represent.",
      ],
      rationale: "22 TAC § 535.147(d) permits a license holder to “rebate or pay a portion of the license holder's fee or commission to a party in the transaction when the sales agent has the written consent of the sales agent's sponsoring broker and the party represented by the license holder,” requires a license holder intending to pay a party they do not represent to obtain the represented party's written consent first, and forbids payment in a manner that misleads a broker, lender, title company or governmental agency about the transaction or the buyer's financial resources or obligations. That last clause is the career-ending one: a rebate paid outside closing on a loan whose cash to close was computed without it misleads the lender about the buyer's resources.",
    }),
    repl({
      id: "LOA-T05U6-QR", replaces: "LOA-T05U6-Q", tests: "T05U6", module: "module-05", screen: "t05u6-s1",
      source: "22 TAC", section: "§ 535.148(d), (h)",
      judgement: "Which payments between a license holder and a settlement service provider are barred outright, and which the rule preserves.",
      prompt: "Four arrangements are proposed: a fee from an inspector for each buyer you send him; a payment for appearing on a title company's preferred-provider list; a cooperative brokerage split with the other side's broker; and a title company hosting an educational class that is not conditioned on referrals. Apply 22 TAC § 535.148.",
      choices: [
        "The first two are barred by subsection (d), which forbids paying or receiving a fee or other valuable consideration to or from any other settlement service provider for the referral of inspections, lenders, mortgage brokers or title companies or for inclusion on a preferred list; the last two are preserved by subsection (h).",
        "All four are barred, because subsection (d) reaches every payment between a license holder and any settlement service provider.",
        "All four are permitted, because subsection (h) preserves normal promotional and educational activity and payments for services actually performed.",
        "The first is barred and the other three are permitted, because a preferred-provider list is advertising rather than a referral.",
      ],
      rationale: "Subsection (d) is a flat prohibition and its list of settlement service providers is long and expressly non-exhaustive, reaching mortgage originators and brokers, lenders, title service providers, attorneys, appraisers, inspectors, settlement agents, insurers, residential service contract providers and “a real estate agent or broker.” Subsection (h) is the counterweight and must be carried with it: the section does not prohibit normal promotional or educational activity that is not conditioned on the referral of business and does not defray expenses that would otherwise be incurred; a payment at market rates for goods actually furnished or services actually performed; or a payment under a cooperative brokerage or referral arrangement between active licensed agents and brokers. Payment contingent on where you send your buyer is what the rule is aimed at.",
    }),
  ]),
  T06: Object.freeze([
    repl({
      id: "LOA-T06U1-QR", replaces: "LOA-T06U1-Q", tests: "T06U1", module: "module-06", screen: "t06u1-s1",
      source: "Texas Occupations Code", section: "§ 1101.561(a)",
      judgement: "How far the supersession clause reaches, and what it leaves standing.",
      prompt: "A broker acting as intermediary goes silent for a week and says the supersession clause in § 1101.561(a) displaced the two-calendar-day response rule along with everything else. Evaluate that.",
      choices: [
        "Wrong. The clause provides that the intermediary's duties “supersede the duties of a license holder established under any other law, including common law” — it resolves the conflict with other law in Subchapter L's favour and does nothing else, so 22 TAC § 535.157, § 1101.559(c)'s fair and impartial requirement, § 1101.557(b) and § 1101.652 all still apply.",
        "Right. The clause displaces every duty outside Subchapter L, including the Commission's rules adopted under Chapter 1101.",
        "Right as to Commission rules but not as to statutes, because the clause names “any other law” and a rule is not law.",
        "Wrong, because the clause has no operation at all until a court has construed it and no Texas decision construing it was held for this course.",
      ],
      rationale: "Section 1101.561(a) is the most over-read sentence in Subchapter L. What it displaces is duties established under other law — the fiduciary obligations a court would otherwise imply, and the argument that withholding the seller's floor from a buyer-client is a breach of trust. What it does not displace, on the face of the text, is the subchapter's own duties, the rest of Chapter 1101 including § 1101.651(d) and § 1101.652, or the Commission's rules: an intermediary who goes quiet for a week has not become impartial, he has become non-responsive. No Texas case construing the clause was held for this course, which is why the safe professional reading is the narrow one rather than a general amnesty.",
    }),
    repl({
      id: "LOA-T06U2-QR", replaces: "LOA-T06U2-Q", tests: "T06U2", module: "module-06", screen: "t06u2-s1",
      source: "Texas Occupations Code", section: "§ 1101.651(d)(3)(C)",
      judgement: "That the confidentiality prohibition never covers information materially relating to the condition of the property.",
      prompt: "During the option period an intermediary's seller mentions that the upstairs HVAC condensate line has backed up twice and stained the ceiling, and asks that it be kept between them. What does § 1101.651(d)(3) allow?",
      choices: [
        "The information must not be withheld. Subdivision (3) forbids disclosing confidential information or information a party instructed in writing not to disclose, but lettered exception (C) removes information that “materially relates to the condition of the property” — and § 1101.652(b)(3) and (b)(4) independently expose a licensee who stays silent about a known significant defect.",
        "It must be withheld, because the seller gave an instruction and the subdivision protects any information a party asks to be kept confidential.",
        "It must be withheld unless the buyer asks about the ceiling, because exception (C) reaches only information a party requests.",
        "It may be disclosed only if the seller confirms the instruction is withdrawn in a separate writing, because exception (A) is the only route out of subdivision (3).",
      ],
      rationale: "Subdivision (3) has two limbs — “any confidential information” and “any information a party specifically instructs the broker or sales agent in writing not to disclose” — and three lettered exceptions: (A) a separate writing from the respective party; (B) disclosure required by the chapter or a court order; and (C) information that “materially relates to the condition of the property.” Exception (C) is the one that saves careers: a seller cannot use the intermediary's confidentiality duty as a lid on a defect. Confidentiality in Texas protects negotiating position and has never protected physical facts about the house, which is why § 1101.652(b)(3) and (b)(4) stand behind the exception.",
    }),
    repl({
      id: "LOA-T06U3-QR", replaces: "LOA-T06U3-Q", tests: "T06U3", module: "module-06", screen: "t06u3-s1",
      source: "Texas Occupations Code", section: "§ 1101.560(c)",
      judgement: "What an appointment buys, and the one thing it does not lift.",
      prompt: "An appointed sales agent tells her party that the comparables do not support the offer and a counter at $407,500 is defensible. She then mentions, to help the deal along, that the other side would take less than its asking price. Which of those was inside her appointment?",
      choices: [
        "The first only. Section 1101.560(c) permits an appointed license holder to “provide opinions and advice during negotiations to the party to whom the license holder is appointed,” but § 1101.651(d) binds “[a] broker and any broker or sales agent appointed under Section 1101.560,” so the appointment lifts none of its five prohibitions.",
        "Both, because an appointment restores full agency duties to the appointed licensee as to her own party.",
        "Neither, because § 1101.559(c) requires fair and impartial conduct and an appointed licensee is bound by it in the same way the broker is.",
        "The second only, because opinions about value are the intermediary broker's to give and an appointee may only carry information.",
      ],
      rationale: "The architecture is one sentence: the broker stays neutral and the appointees advise. Section 1101.559(c) requires the intermediary to act fairly and impartially and then deems the act of making appointments to be “a fair and impartial act,” which forecloses the argument that appointing advocates is itself partial. Section 1101.560(c) permits the appointee to give opinions and advice during negotiations to the party to whom she is appointed — and only to that party. But the opening words of § 1101.651(d) reach the broker and every appointee alike, so the appointee is an advisor operating inside a confidentiality cage; disclosing that the other side will move off its price is subdivision (1) or (2) territory, unlocked only by a separate writing from that party.",
    }),
    repl({
      id: "LOA-T06U4-QR", replaces: "LOA-T06U4-Q", tests: "T06U4", module: "module-06", screen: "t06u4-s1",
      source: "Texas Occupations Code", section: "§§ 1101.559, 1101.563(a)",
      judgement: "That the intermediary requirements and the 2026 written-agreement mandate have different scopes.",
      prompt: "Your firm will represent both the seller and the buyer of a 12,000-square-foot flex building in Brenham. A colleague says that because it is commercial, none of the intermediary requirements apply. Evaluate that against § 1101.559 and § 1101.563(a).",
      choices: [
        "He has merged two rules with different scopes. Nothing in Subchapter L limits the intermediary provisions to houses, so § 1101.561(b) and the written consents of § 1101.559 apply fully; what does not reach a warehouse is § 1101.563's written-agreement mandate, whose subsection (a) defines residential real property as three things and none of them is a warehouse.",
        "He is right: Subchapter L applies only to residential transactions, and a commercial buyer and seller may be represented by one brokerage without consents.",
        "He is right as to consents but wrong as to appointments, which § 1101.560 requires in every transaction whatever the property type.",
        "He is wrong on both: § 1101.563 reaches any prospective buyer, so the warehouse buyer needs a written agreement before the building is shown.",
      ],
      rationale: "Two different rules with two different scopes, and merging them is the error. Section 1101.551(2) defines “Party” without regard to property type, and nothing in §§ 1101.559 to 1101.561 limits the intermediary framework to residential transactions — a broker representing both sides of a Brenham warehouse sale is in exactly the same statutory position as a residential broker. Section 1101.563(b) reaches “a prospective buyer of residential real property,” which subsection (a) defines as a single-family house, a duplex, triplex or quadraplex, or a condominium or cooperative unit. Leases are inside Subchapter L too: § 1101.558(c)(1)'s short residential lease exception relieves only the written notice, and § 1101.559 contains no lease exception at all.",
    }),
    repl({
      id: "LOA-T06U5-QR", replaces: "LOA-T06U5-Q", tests: "T06U5", module: "module-06", screen: "t06u5-s1",
      source: "Texas Occupations Code", section: "§ 1101.557(b)(3)",
      judgement: "To whom the duty to answer questions and present offers runs, and what the correct answer to the other side is.",
      prompt: "An unrepresented visitor at your seller's open house asks, “What will they take?” You represent the seller and hold no other relationship. What is the correct response and why?",
      choices: [
        "Decline the question and offer what you may give: the § 1101.557(b)(3) duty to answer the party's questions and present any offer runs to your own client, not to the other side, so the safe reply names your side, offers to confirm size, price and terms under § 1101.562(c), and promises to present any offer promptly.",
        "Answer it, because § 1101.557(b)(3) requires a broker to answer the questions of any party to the transaction at a minimum.",
        "Answer it in general terms only, because a range rather than a number is not a disclosure of what the seller will accept.",
        "Decline the question and refuse to give any information at all, because a listing agent may not communicate with an unrepresented visitor before an agreement is signed.",
      ],
      rationale: "Section 1101.557(b)(3) requires a broker who represents a party to “at a minimum, answer the party's questions and present any offer to or from the party” — it is a floor of service owed to your own client, and it is not a duty to answer the other side's questions about your client's position. The reply that works has every clause doing statutory work: naming whom you represent comes from § 1101.558(b); declining to advise comes from § 1101.562(a)(3); confirming size, price and terms comes from § 1101.562(c); and promising to present any offer promptly comes from § 1101.557(b)(3). Answering the question instead is the same violation in interrogative form, and § 1101.651(d)(5) makes any violation of the chapter a violation of the intermediary prohibition as well.",
    }),
  ]),
  T07: Object.freeze([
    repl({
      id: "LOA-T07U1-QR", replaces: "LOA-T07U1-Q", tests: "T07U1", module: "module-07", screen: "t07u1-s1",
      source: "Business & Commerce Code", section: "§ 26.01(b)",
      judgement: "Which of three writing rules answers which question about a file.",
      prompt: "Three writing rules bear on a Texas engagement: Occupations Code § 1101.563, Occupations Code § 1101.806(c) and Business & Commerce Code § 26.01. Which question does each answer?",
      choices: [
        "Section 1101.563 answers may I act, and failing it is a disciplinary count; § 1101.806(c) answers may I sue for the fee, and failing it loses the suit; § 26.01 answers whether the promise is enforceable at all, reaching among other things a contract for the sale of real estate, a lease longer than a year, and an agreement not to be performed within one year.",
        "All three answer the same question in different codes, so a file that satisfies one satisfies them all.",
        "Section 1101.563 answers may I sue for the fee, § 1101.806(c) answers may I act, and § 26.01 governs only mineral commissions.",
        "Section 26.01 answers may I act, § 1101.563 answers whether the promise is enforceable, and § 1101.806(c) has no application to residential transactions.",
      ],
      rationale: "Three writings, three questions, three different failures, and a file can satisfy one and fail another. Section 1101.563 is the writing TRELA requires before you act, and § 1101.652(b)(34) makes the omission its own disciplinary ground. Section 1101.806(c) is the writing you need before you can sue for a commission, and it must be signed by the party against whom the action is brought. Business & Commerce Code § 26.01 is the general statute of frauds, reaching a contract for the sale of real estate, a lease for a term longer than one year, and an agreement not to be performed within one year — which is why a fifteen-month exclusive listing agreed orally is unenforceable on its face — while its commission subdivision, (b)(7), reaches only oil and gas leases, royalties, minerals and mineral interests.",
    }),
    repl({
      id: "LOA-T07U2-QR", replaces: "LOA-T07U2-Q", tests: "T07U2", module: "module-07", screen: "t07u2-s1",
      source: "Texas Estates Code", section: "§ 101.001",
      judgement: "Why an owner's death ends the practical life of a listing, without any common-law rule being needed.",
      prompt: "The owner who signed your listing dies. The property is devised by will. What do the held sources let you say about the listing and about who you deal with next?",
      choices: [
        "Estates Code § 101.001 vests the devised estate immediately in the devisees, so the person who gave you authority no longer owns the property and the new owners agreed to nothing with you; § 1101.551(2) names an executor or administrator as a party, so you contract afresh, with a new signature and a new definite termination date.",
        "The listing continues against the estate for its stated term, because a contract signed by an owner binds the owner's successors automatically.",
        "The listing terminates by operation of the common-law rule that death revokes an agency, which Chapter 1101 codifies.",
        "The listing continues until the Commission is notified of the death, at which point the broker must file a new listing within thirty days.",
      ],
      rationale: "The held sources answer this without needing a common-law rule. Estates Code § 101.001(a) provides that where a person dies leaving a lawful will, the estate devised by the will “vests immediately in the devisees,” with undevised property vesting immediately in the heirs at law, and subsection (b) does the same for an intestate estate, both subject to § 101.051. So at the instant of death title is in someone who never agreed to anything with you. Section 101.003 adds that on issuance of letters testamentary or of administration the executor or administrator has the right to possession of the estate. Chapter 1101 anticipates the sequel: § 1101.551(2) makes an executor or administrator a party with whom you may contract, and § 1101.652(b)(12) requires the new agreement to carry a definite termination date.",
    }),
    repl({
      id: "LOA-T07U3-QR", replaces: "LOA-T07U3-Q", tests: "T07U3", module: "module-07", screen: "t07u3-s1",
      source: "22 TAC", section: "§§ 535.2(h), 535.146(e)",
      judgement: "That the two four-year record clocks are measured from different events.",
      prompt: "A listing terminates unsold on August 31, 2026. The brokerage also holds trust-account documentation created at various dates during the engagement. From what event does each four-year retention period run?",
      choices: [
        "The brokerage records under 22 TAC § 535.2(h) run four years from the date of closing, termination of the contract, or end of the transaction — here August 31, 2026 — while trust-account documentation under 22 TAC § 535.146(e) runs four years “from the date the document is received or created by the broker,” per document.",
        "Both run four years from the date of closing, so a listing that terminates without a sale starts no clock at all.",
        "Both run four years from the date each document was created, so the termination date is irrelevant to either.",
        "The brokerage records run four years from termination and the trust-account documentation must be kept indefinitely, because trust money has no statutory retention limit.",
      ],
      rationale: "The two rules use different measuring points and are worth keeping separate. 22 TAC § 535.2(h) requires the eight listed categories of brokerage records to be maintained in a format readily available to the Commission “for at least four years from the date of closing, termination of the contract, or end of a real estate transaction,” so a listing that expires unsold starts its own clock on that date. 22 TAC § 535.146(e) is the trust rule's own records subsection: “A broker must maintain all documentation regarding a trust account for four years from the date the document is received or created by the broker.” Four years, per document, from receipt or creation.",
    }),
  ]),
  T08: Object.freeze([
    repl({
      id: "LOA-T08U1-QR", replaces: "LOA-T08U1-Q", tests: "T08U1", module: "module-08", screen: "t08u1-s1",
      source: "22 TAC", section: "§ 531.18",
      judgement: "The three cumulative elements that make a site a business website, and where the link may sit on social media.",
      prompt: "A license holder has three online presences: a personal cooking blog that never mentions her work; a third-party portal that displays her listings but whose content she does not control; and a social media profile advertising her brokerage services. Which are business websites for 22 TAC § 531.18, and where may the link sit on the third?",
      choices: [
        "Only the third. A business website must be accessible to the public, contain information about a license holder's real estate brokerage services, and have content controlled by the license holder — all three — and for a social media platform the link may sit on the account holder profile or on a separate page or website reached by a direct link from the platform or profile.",
        "All three, because each is publicly accessible and each is connected to her practice.",
        "The second and third, because a portal displaying her listings contains information about her brokerage services and that is the decisive element.",
        "Only the third, and the link must sit on a homepage; the rule makes no accommodation for a platform with no homepage in the ordinary sense.",
      ],
      rationale: "22 TAC § 531.18 defines business website by three cumulative elements — accessible to the public; contains information about a license holder's real estate brokerage services; and the content of the website is controlled by the license holder — and control of content decides most close cases, which is what removes the third-party portal. A personal blog that never mentions brokerage services fails the second element. The rule then makes an express accommodation for platforms without a conventional homepage: the required link may be located on “the account holder profile” or on “a separate page or website through a direct link from the social media platform or account holder profile.”",
    }),
    repl({
      id: "LOA-T08U2-QR", replaces: "LOA-T08U2-Q", tests: "T08U2", module: "module-08", screen: "t08u2-s1",
      source: "22 TAC", section: "§ 535.2",
      judgement: "Which day-one questions a brokerage's own manual has to answer, and which authority makes each matter.",
      prompt: "Which of the following is a question your brokerage's written policy must answer for you, rather than a question the statute or the rule already answers?",
      choices: [
        "Who sends the IABS when two of the firm's agents are in contact with the same buyer, and where the sent copy is filed — neither § 1101.558 nor 22 TAC § 531.20 says, while 22 TAC § 535.2 requires the broker to keep the disclosure among the brokerage's records.",
        "Whether a completed IABS notice may be delivered as an attachment to an email, which only a firm policy can settle.",
        "How many calendar days a license holder has to respond to an unrepresented party, which varies by brokerage.",
        "Whether a delegation of supervisory responsibility must be in writing, which the rule leaves to each firm.",
        ],
      rationale: "The statute and the rule set a floor: they say what must happen, not how a firm makes it happen the same way every time. That is the policy's job, and its absence is the commonest reason a firm's deliveries are inconsistent. The other three options are answered by authority rather than by policy — 22 TAC § 531.20 lists the four permitted delivery methods, 22 TAC § 535.157 fixes two calendar days, and 22 TAC § 535.2(e) requires any delegation to be in writing. What no held source settles is who within a brokerage delivers when two agents are working the same buyer, or where the proof is filed, and § 535.2 makes the broker responsible for producing that proof four years later.",
    }),
    repl({
      id: "LOA-T08U1-Q2R", replaces: "LOA-T08U1-Q2", tests: "T08U1", module: "module-08", screen: "t08u1-s1",
      source: "22 TAC", section: "§ 531.20",
      judgement: "What a written disclosure policy must decide that a one-sentence promise of compliance does not.",
      prompt: "A brokerage manual's entire page headed “Agency” reads: “This firm complies with all TREC disclosure requirements.” Which decisions has that sentence failed to make?",
      choices: [
        "The ones the rules leave open: who delivers the IABS when two of the firm's agents are working the same buyer, which permitted channel is used when a first contact arrives by text — a medium 22 TAC § 531.20 does not list — and where the sent copy is filed so the broker can retrieve it without the agent.",
        "None. A statement of compliance with the Commission's requirements is exactly what a written disclosure policy is.",
        "Only the font and label of the homepage links, which are the sole matters § 531.20 and § 531.18 leave to a firm.",
        "Only the question whether the firm acts as an intermediary, which is the only disclosure decision § 1101.559 leaves to a brokerage.",
      ],
      rationale: "A disclosure policy is not a form and it is not a promise. It is the firm's standing answer to the questions the rules leave open, and the text-message case is the clearest: a Saturday-night text about a specific property is a communication with a party, and text is not among the delivery methods 22 TAC § 531.20 enumerates, so the rule does not tell the agent what to do next and a policy must. The competent office rule is to move the conversation into a channel the rule recognises before going further, answer the substantive question only then, and file the sent copy where the broker can find it — which matters because 22 TAC § 535.2 makes the broker keep disclosures among the brokerage's records for at least four years.",
    }),
  ]),
