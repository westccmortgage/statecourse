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
