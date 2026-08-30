/**
 * Texas Law of Agency — CONFIDENTIAL FINAL EXAMINATION BANK.
 *
 * ── CONFIDENTIALITY ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS AN ANSWER KEY. It must never be importable from a student-facing surface. It lives
 * in config/, outside every served tree; nothing in public/ may import it, transitively or
 * otherwise; and no build may emit an artifact containing a prompt, a choice array, a
 * correctChoice, a rationale or a `teaches` anchor from this file. Answer keys and rationales never
 * reach the browser. The examination engine is expected to permute choices deterministically at
 * serve time — items are authored with the correct answer at index 0 purely so that a reviewer can
 * read the key down the left-hand edge — and to strip the key, the rationale, the crosswalk and the
 * source from anything a student can see. 22 TAC § 535.65(h)(2) requires final examination
 * questions to be "kept confidential and be significantly different from any quiz questions and
 * exercises used in the course," and this file is written to both halves of that sentence.
 *
 * scripts/validate-loa-assessments.mjs prints counts, ids and similarity figures and never an item
 * text. tests/no-answer-key-published.test.mjs is the standing guard that no answer key reaches
 * public/ or dist/.
 *
 * ── REGULATORY BASIS, FROM THE SOURCES THAT WERE READ ───────────────────────────────────────────
 * The numbers this bank is built to are those exported as ASSESSMENT_REQUIREMENTS by
 * config/texas/trec-rules-source-lock.mjs, which derives them from rule sections held on disk with
 * recorded hashes: 22 TAC § 535.62 (texas/trec-sources/trec-rules/535.62.txt) and 22 TAC § 535.65
 * (texas/trec-sources/trec-rules/535.65.txt).
 *
 *   • § 535.62(b)(7) — a course must "include at least four versions of a final examination"; each
 *     version must cover "each topic required by the Act or Rules for the specific course," must
 *     not "contain any true/false questions," must not "repeat more than one third of the questions
 *     from other versions of the final examination," and — for a qualifying course other than a
 *     real estate math course — must consist "of at least two questions per credit course hour"
 *     drawn "from a question bank consisting of at least four questions per credit course hour."
 *     For this 30-hour course that is FOUR versions of at least SIXTY questions each, drawn from a
 *     bank of at least ONE HUNDRED TWENTY.
 *   • § 535.62(b)(7)(A)–(C) — the same paragraph separately prescribes the FORMATIVE instruments:
 *     topic quizzes, one scenario-based exercise per 10 credit hours or less, progression gating,
 *     and a replacement question after an incorrect answer. Those live in
 *     config/texas/law-of-agency-question-bank.mjs, config/texas/law-of-agency-scenarios.mjs and
 *     config/texas/law-of-agency-misconception-checks.mjs. This file is the summative instrument
 *     and is deliberately built apart from all three.
 *   • § 535.65(h)(2) — final examination questions must be kept confidential and be significantly
 *     different from any quiz questions and exercises used in the course.
 *   • § 535.65(h)(4) — a provider must rotate all versions throughout the approval period and must
 *     require an unweighted passing score of 70%.
 *   • § 535.65(i)(2) — a subsequent final examination must be a different version of the original.
 *   • § 535.65(h)(6) and § 535.65(i)(4) — no credit after a second failure.
 *
 * The rotation rule, the second-attempt rule, the 70% unweighted passing score and the pairwise
 * overlap computation are recorded in config/texas/law-of-agency-final-exam-forms.mjs.
 *
 * WHAT THE BASIS DOES NOT INCLUDE. The Secretary of State's codified 22 TAC text remains unread;
 * the rule files above are TREC's own published reproduction, classified TIER 4 by
 * trec-rules-source-lock.mjs, and TX_PROVIDER_RULE_SOURCE_LOCK still FAILS. Building this bank is
 * not approval and is not submission readiness. StateCourse is not TREC-approved for this course,
 * no Texas qualifying credit may be offered for it, and no student may be served an attempt.
 *
 * ── WHAT EVERY ITEM IS TRACED TO ────────────────────────────────────────────────────────────────
 * `topic` and `unit` name the LOA-1 topic and unit the item examines, read from
 * config/texas/law-of-agency-course-form.mjs. `teaches` is the exam-to-instruction crosswalk: the
 * GitHub-style anchor of the "## Unit: ..." heading in the frozen curriculum
 * (texas/tx-law-of-agency-30-v1/curriculum/) that teaches the tested proposition — the anchors are
 * re-derived from the frozen markdown by scripts/report-loa-traceability.mjs rather than trusted.
 * `source` names the controlling authority where the item tests law, and says so plainly where the
 * item tests practice, judgment or a deliberate silence in the curriculum instead.
 *
 * ── SOURCE DISCIPLINE ───────────────────────────────────────────────────────────────────────────
 * No item asserts a legal proposition the frozen curriculum does not teach, and no item depends on
 * an optional-reference section: § 535.62(b)(7) examines the required course, and every
 * `## Optional reference:` block in the curriculum is marked excludedFromRequiredTime and carries
 * `noAssessmentMayDependOnThis`. Where the curriculum deliberately states no rule — the common law
 * of agency formation by ratification, estoppel and apparent authority; common-law termination by
 * operation of law; the text of the repealed § 1101.002(8), § 1101.558(a), (d) and (e) and
 * § 1101.805(f); the common-law doctrine of subagency; and Property Code § 301.045, which is
 * identified but not taught — no item supplies one either, and several items test exactly that
 * restraint. Every dollar figure in a fact pattern is illustrative and invented to make a statutory
 * range visible; every arithmetic result was computed and checked.
 *
 * ── SEPARATION FROM THE FORMATIVE INSTRUMENTS ───────────────────────────────────────────────────
 * The formative surface for this course is 58 topic-quiz primaries, 58 replacement items, 7
 * misconception checks and 31 scenario tasks across 5 scenarios. Every one of those prompts was
 * read before this bank was authored, and separation is enforced at three levels: no proposition is
 * tested here with the fact pattern a formative item uses for it; where the same rule must appear in
 * both — the rule set is finite and § 535.62(b)(7)(H)(i) requires every topic on every version — the
 * fact pattern, the party, the county, the arithmetic and the distractor set all differ; and
 * scripts/validate-loa-assessments.mjs recomputes a Jaccard token similarity of every exam prompt
 * against every formative prompt and fails the build at 0.70.
 */

import { TOPICS, ALL_UNITS } from "./law-of-agency-course-form.mjs";
import { ASSESSMENT_REQUIREMENTS } from "./trec-rules-source-lock.mjs";

/* The exam-to-instruction crosswalk, unit by unit. Each value is the GitHub-style anchor of the
   "## Unit: ..." heading in the named frozen curriculum module. Every item's `teaches` must equal
   the entry for its own unit; the invariants below refuse any other value. The anchors were
   derived from the frozen markdown, not transcribed from the LOA-1 form: the form's unit titles and
   the curriculum's headings agree, but the slug is the curriculum's. */
export const UNIT_ANCHORS = Object.freeze({
  T01U1: "module-01.md#unit-what-is-agency-the-license-act---statute-rules",
  T01U2: "module-01.md#unit-why-study-agency",
  T01U3: "module-01.md#unit-roles-people-play-in-agency-relationships---client-or-customer",
  T01U4: "module-01.md#unit-relationship-between-principal-agent",
  T02U1: "module-02.md#unit-agency-defined",
  T02U2: "module-02.md#unit-authority-of-agent",
  T02U3: "module-02.md#unit-classifications-of-agency",
  T02U4: "module-02.md#unit-duty-to-respond-fiduciary-duties-and-responsibilities",
  T02U5: "module-02.md#unit-information-about-brokerage-services---disclosure-of-representation",
  T03U1: "module-03.md#unit-non-fiduciary-duties",
  T03U2: "module-03.md#unit-general-duties-of-honesty-fairness",
  T03U3: "module-03.md#unit-define-third-partyobligations-to-third-partyduty-to-respond",
  T03U4: "module-03.md#unit-avoiding-disclosure-and-misrepresentation-problems",
  T03U5: "module-03.md#unit-section-5008-of-the-texas-property-code-sellers-disclosure",
  T03U6: "module-03.md#unit-stigmatized-properties",
  T04U1: "module-04.md#unit-listing-agreements",
  T04U2: "module-04.md#unit-exclusive-seller-agency",
  T04U3: "module-04.md#unit-benefits-of-seller-agency-relationships",
  T04U4: "module-04.md#unit-sub-agency",
  T04U5: "module-04.md#unit-disclosure-issues",
  T05U1: "module-05.md#unit-buyer-representation-agreement",
  T05U2: "module-05.md#unit-deciding-to-represent-the-buyer",
  T05U3: "module-05.md#unit-the-creation-of-buyer-agency",
  T05U4: "module-05.md#unit-benefits-of-buyer-agency-relationships",
  T05U5: "module-05.md#unit-written-notification-of-compensation-to-broker",
  T05U6: "module-05.md#unit-buyers-broker-disclosures",
  T06U1: "module-06.md#unit-the-path-from-dual-agency-to-intermediary-brokerage",
  T06U2: "module-06.md#unit-intermediary-brokerage",
  T06U3: "module-06.md#unit-representation-of-more-than-one-party-in-a-transaction",
  T06U4: "module-06.md#unit-specialized-intermediary-applications",
  T06U5: "module-06.md#unit-intentional-versus-unintended-dual-representation",
  T07U1: "module-07.md#unit-how-and-when-agency-is-created",
  T07U2: "module-07.md#unit-how-agency-is-terminated",
  T07U3: "module-07.md#unit-duties-of-agency-that-survive-termination",
  T08U1: "module-08.md#unit-disclosure-policy",
  T08U2: "module-08.md#unit-understanding-a-brokerage-companys-policy",
  T09U1: "module-09.md#unit-independent-contract-agreements",
  T09U2: "module-09.md#unit-employment-law",
  T09U3: "module-09.md#unit-employment-relationships-between-brokers-and-principals",
  T09U4: "module-09.md#unit-employment-and-compensation-of-personal-assistants",
  T09U5: "module-09.md#unit-broker-responsibility-relationships-between-brokers-and-agents-5352",
  T09U6: "module-09.md#unit-compensation-issues",
  T10U1: "module-10.md#unit-distinctions-between-law-ethics-and-morals",
  T10U2: "module-10.md#unit-federal-and-state-law-relating-to-conduct",
  T10U3: "module-10.md#unit-trela-and-rules-of-the-commission-ethics",
  T10U4: "module-10.md#unit-professional-codes-of-ethics",
  T10U5: "module-10.md#unit-minimum-ethical-standards",
  T11U1: "module-11.md#unit-fraud-versus-misrepresentation",
  T11U2: "module-11.md#unit-deceptive-trade-practices-and-consumer-protection",
  T11U3: "module-11.md#unit-damages",
  T11U4: "module-11.md#unit-defenses",
  T11U5: "module-11.md#unit-ethical-and-legal-concerns",
  T12U1: "module-12.md#unit-the-broker-working-forwith-the-seller",
  T12U2: "module-12.md#unit-the-broker-working-forwith-the-buyer",
  T12U3: "module-12.md#unit-a-practical-guide-to-everyday-practice",
  T12U4: "module-12.md#unit-other-considerations",
  T12U5: "module-12.md#unit-risk-management",
});

/* Minimum items per LOA-1 topic. Six is the floor the build works to so that every topic can be
   sampled on all four versions with room to spare; the blueprint above the floor is proportional to
   the form's prescribed minutes and is asserted against them below. Only T08 (45 prescribed
   minutes) is held up by the floor. */
export const MIN_ITEMS_PER_TOPIC = 6;

/* ── What each item asks the candidate to DECIDE. ──────────────────────────────────────────────
   Authored as one block rather than scattered across 132 item literals, because a reviewer asking
   "what judgment does this instrument actually test?" wants to read the answer as a list, and
   because a completeness invariant over a map is checkable at a glance in a way 132 optional
   fields are not. `item()` attaches the entry to the item it builds and throws if one is missing,
   so the map cannot drift out of step with the bank.

   These lines are NOT answer-bearing. They name the judgment, not the answer, which is why
   scripts/report-loa-traceability.mjs may write them into a reviewer artifact while the prompt,
   the choices, the key and the rationale stay in this file. */
const TESTED_JUDGMENTS = Object.freeze({
  "LOA-F001": "Whether described conduct is inside § 1101.002(1) when it is performed for the actor's own account, and which element of the definition decides it.",
  "LOA-F002": "Whether the three lettered conditions of § 1101.002(1)(A)(xi) are cumulative, and whether a purpose the subparagraph names reaches a refinancing decision.",
  "LOA-F003": "Which of 22 TAC § 535.4's two independent bases of application reaches each of two cross-border transactions.",
  "LOA-F004": "Where the line runs between an act requiring a licence under 22 TAC § 535.4 and the narrow clerical permission in § 535.5.",
  "LOA-F005": "Whether a Commission order resolves the civil and criminal tracks, and which sentence of the Act settles it.",
  "LOA-F006": "What the ordering of § 1101.003(a)'s list of qualifying courses does and does not prove.",
  "LOA-F007": "Where in Texas law the terms 'client' and 'customer' are defined, and what follows from the fact that they are not.",
  "LOA-F008": "Who is a 'party' under § 1101.551(2) in a transaction involving a property manager with binding authority.",
  "LOA-F009": "What the 2026 repeal of the two TRELA subagency references does and does not establish on the held sources.",
  "LOA-F010": "Whether both conditions in 22 TAC § 535.16(b) are satisfied by an owner who asks the broker what the property is worth.",
  "LOA-F011": "What a sales agent may do with files in progress once sponsorship terminates and the licence goes inactive.",
  "LOA-F012": "Whether representation can arise without a writing, and what the structure of § 1101.562 shows about it.",
  "LOA-F013": "Whether the source of a broker's compensation determines whom the broker represents.",
  "LOA-F014": "What express authority to negotiate carries with it as to earnest money, and where implied authority stops.",
  "LOA-F015": "Which authority-limit grounds in § 1101.652(b) a licence holder acting beyond written instructions reaches.",
  "LOA-F016": "Whether the intermediary posture is an election or an obligation when a broker represents both sides.",
  "LOA-F017": "Whether the classical agency taxonomy is Texas text, and which held provision fixes the scope of a residential listing.",
  "LOA-F018": "Whether a spoken instruction, recorded in the licence holder's own file note, switches off the duty to submit offers.",
  "LOA-F019": "Which Texas text imposes the care duty, and what status the six-duty teaching frame has.",
  "LOA-F020": "Which subsection of § 1101.652 carries the market-conditions ground, and why it is commonly misfiled.",
  "LOA-F021": "How far the open-house exception in § 1101.558(c)(3) reaches, and which duty it never touches.",
  "LOA-F022": "Which alterations to a reproduced IABS notice 22 TAC § 531.20 permits.",
  "LOA-F023": "To whom the § 1101.555 written advice runs, and what failure costs.",
  "LOA-F024": "What a licence holder does and does not owe a person on the other side of a transaction.",
  "LOA-F025": "Which negotiating tactic is consistent with the duty of honest and fair dealing, and why the others are not.",
  "LOA-F026": "Who is a 'party' and who is a member of the public, and whether the distinction changes the accuracy duty.",
  "LOA-F027": "How the two-calendar-day response period in 22 TAC § 535.157 counts across a holiday weekend.",
  "LOA-F028": "Whether § 1101.805(e) reaches a licence holder's own silence, and what DTPA § 17.46(b)(24) requires.",
  "LOA-F029": "Whether suspicion satisfies § 1101.805(e)'s knowledge condition, and what the shield leaves unresolved.",
  "LOA-F030": "The scope of the § 1101.804 protection for sharing sale price and terms information, with its closing qualifier.",
  "LOA-F031": "Which transfers § 5.008 reaches, and which subdivision of subsection (e) exempts each of three familiar ones.",
  "LOA-F032": "From what event the § 5.008(f) termination right runs, and how § 5.008 differs from § 5.012(e).",
  "LOA-F033": "What § 1101.556 permits when a buyer asks directly about a death on the property.",
  "LOA-F034": "Which statute supplies the writing requirement for an ordinary residential commission promise.",
  "LOA-F035": "Whether § 1101.806(d) can defeat a listing broker's fee where the broker never dealt with the buyer.",
  "LOA-F036": "Commission arithmetic across a cooperating-broker split, and the permitted payment channel to a sales agent.",
  "LOA-F037": "Whether soliciting a future listing from an owner under an outstanding exclusive listing is permitted.",
  "LOA-F038": "Which element of § 1101.652(b)(22) is missing when the competing listing has expired.",
  "LOA-F039": "What representation buys a seller, stated as sourced entitlements with their honest limits.",
  "LOA-F040": "What the structural concept of subagency is, and which Texas text now governs the outcomes it produced.",
  "LOA-F041": "Which held provisions show that compensation does not answer the representation question.",
  "LOA-F042": "Whether an emailed IABS notice discharges the duty to make representation status clear to all parties.",
  "LOA-F043": "Which subdivision of § 1101.652(b) reaches each of three money-disclosure failures.",
  "LOA-F044": "Which property types fall inside the § 1101.563(a) definition of residential real property.",
  "LOA-F045": "Whether an agreement drawn around one address covers a second showing, on the wording of § 1101.563(b).",
  "LOA-F046": "The two hard limits § 1101.563(e) places on a showing-only agreement, and what § 1101.563(d) then requires.",
  "LOA-F047": "What the competence provisions require of a licence holder offered work outside her market and product type.",
  "LOA-F048": "What a broker must tell a buyer, at engagement, about the consequence of wanting an in-house listing.",
  "LOA-F049": "What a showing agent from outside the listing brokerage must do before an open-house visitor views the property.",
  "LOA-F050": "Which statement to a visitor falls inside § 1101.562(c)'s permission to confirm size, price and terms.",
  "LOA-F051": "What a represented buyer learns that an unrepresented one does not, and what is owed either way.",
  "LOA-F052": "Whether § 1101.652(b)(22) protects a buyer under a non-exclusive representation agreement.",
  "LOA-F053": "What § 1101.563(c)(1)(E) requires of a compensation clause, and what § 1101.806(c) requires to sue on it.",
  "LOA-F054": "Buyer-side compensation arithmetic against a listing broker's contribution, and the permitted payment route.",
  "LOA-F055": "Which arrangements 22 TAC § 535.148(h) leaves outside the rule's prohibitions.",
  "LOA-F056": "Whether a 40 percent entity interest is inside 22 TAC § 535.144, and how the rule's scope compares with the statute's.",
  "LOA-F057": "Whether consent can create a dual agency in Texas, and what the Legislature supplied instead.",
  "LOA-F058": "What § 1101.551(1)'s definition of intermediary establishes about the role and who may hold it.",
  "LOA-F059": "What the enactment notes establish about when the intermediary framework became settled codified law.",
  "LOA-F060": "Whether a general 'may work with other clients' clause satisfies § 1101.559(a).",
  "LOA-F061": "Whether Texas prescribes a point size for the intermediary consent, and what the comparison with other provisions shows.",
  "LOA-F062": "What form an instruction must take before § 1101.651(d)(1)'s prohibition may be released.",
  "LOA-F063": "Which price is the benchmark § 1101.651(d)(2) uses, and what may therefore be disclosed.",
  "LOA-F064": "What § 1101.561(a)'s supersession clause displaces and what it leaves standing.",
  "LOA-F065": "What § 1101.560(b)(2) requires of an appointment notice, and which assumptions the section does not support.",
  "LOA-F066": "Whether consent to intermediary status carries consent to appointments, and what each configuration gives the parties.",
  "LOA-F067": "What differs and what is identical between intermediary with appointments and without.",
  "LOA-F068": "Which configurations are lawfully available to a sole-practitioner broker holding both sides.",
  "LOA-F069": "Whether the § 1101.558(c)(1) short-lease exception reaches the intermediary consent requirement.",
  "LOA-F070": "How the § 535.191 penalty bands rank the intermediary provisions against the two dual-representation grounds.",
  "LOA-F071": "Which of three Texas writing rules answers which question, and what each failure costs.",
  "LOA-F072": "What status the common-law routes to agency have in this course, and why they are hazards rather than strategies.",
  "LOA-F073": "Whether an oral promise and a contractual disclaimer affect what the Commission may consider under 22 TAC § 535.145.",
  "LOA-F074": "What the Estates Code establishes about a listing when the owner who signed it dies.",
  "LOA-F075": "Which terminating-event propositions the held sources support and which were not held.",
  "LOA-F076": "What § 1101.366 requires of a broker applying for inactive status, and what the broker may then do.",
  "LOA-F077": "What 22 TAC § 535.146(d) requires after a written demand, and what is available where entitlement is unclear.",
  "LOA-F078": "Which of a licence holder's online presences is a 'business website' under 22 TAC § 531.18.",
  "LOA-F079": "Which notice comes from which statutory parent, and how each is provided.",
  "LOA-F080": "What the held law settles about a first contact arriving by text, and what a brokerage policy must settle.",
  "LOA-F081": "Which two facts about a policy manual are established by 22 TAC § 535.2 rather than by firm preference.",
  "LOA-F082": "Which omissions from a policy manual are compliance failures and which are business decisions.",
  "LOA-F083": "Whether an IABS link in an email signature block satisfies 22 TAC § 531.20.",
  "LOA-F084": "What Labor Code § 201.072's opening words settle, and what its silence on control shows.",
  "LOA-F085": "Which § 201.072(1) condition a guaranteed monthly draw puts in question, and what this course states about the threshold.",
  "LOA-F086": "Which Labor Code chapter 21 coverage threshold a brokerage's first employee crosses.",
  "LOA-F087": "What chapter 21's purpose and administering agency are, and the limit of what this course states about sales-agent status.",
  "LOA-F088": "Which of two provisions uses 'employ' in the engagement sense and which in the labour-law sense.",
  "LOA-F089": "Which disciplinary ground an association with an unlicensed person expected to act as a licence holder reaches.",
  "LOA-F090": "Which statement by an unlicensed administrative employee is inside the 22 TAC § 535.5(g) permission.",
  "LOA-F091": "Which four conditions the 22 TAC § 535.20(b) referral exemption requires, and which most often fails.",
  "LOA-F092": "What 22 TAC § 535.2(a) produces where a broker knowingly permits work beyond a written scope.",
  "LOA-F093": "Which § 535.2 requirement is a numerical floor on new activities, and how it is counted.",
  "LOA-F094": "Which five conditions § 1101.355(d) requires of a compensation entity, and what a missing one produces.",
  "LOA-F095": "How one Property Code chapter 301 prohibition reaches criminal, civil and administrative enforcement at once.",
  "LOA-F096": "What § 1101.659(b) permits a refund order to do, and where a consumer seeking damages must go.",
  "LOA-F097": "Which characteristics 42 U.S.C. § 3604(a) names, and where the federal disability prohibition sits.",
  "LOA-F098": "Which request is a modification and which an accommodation, and what standard and cost rule attaches to each.",
  "LOA-F099": "What happens to the owner-seller fair housing exemptions once a licence holder is engaged.",
  "LOA-F100": "Which acts violate 22 TAC § 531.19's verbs without any refusal to sell.",
  "LOA-F101": "What gates § 1101.652(b), and why subsection (a-1) exists separately.",
  "LOA-F102": "Which complaints § 1101.204 permits the Commission to investigate.",
  "LOA-F103": "What § 1101.704 produces when a licence holder lets the twenty days pass without responding.",
  "LOA-F104": "How a trade association is defined, and what § 1101.053(b) does about the regulator-association relationship.",
  "LOA-F105": "What an association's expulsion, or its refusal to act, establishes about a Texas licence.",
  "LOA-F106": "How 22 TAC § 535.191 sorts familiar violations across its three penalty bands.",
  "LOA-F107": "What follows from ignoring a Commission request for information about a complaint believed meritless.",
  "LOA-F108": "What this course holds on fraud and misrepresentation, and where the operative distinctions live.",
  "LOA-F109": "What the final clause of DTPA § 17.45(13) does to the meaning of 'intentionally'.",
  "LOA-F110": "Which feature of the DTPA consumer definition lets a buyer sue a licence holder she never dealt with.",
  "LOA-F111": "Which laundry-list subdivision a careless explanation of a contract term engages, and which carry a scienter word.",
  "LOA-F112": "What §§ 17.43 and 17.44(b) settle about the DTPA's relationship to other Texas law.",
  "LOA-F113": "DTPA damages arithmetic across the knowing and intentional tiers, and what is excluded from the multiplier base.",
  "LOA-F114": "How the two mandatory fee provisions run, and what other relief § 17.50 authorises and forbids.",
  "LOA-F115": "Which conditions the § 17.506(a) reliance defense requires, and what § 17.506(b) adds.",
  "LOA-F116": "How the § 17.49(f) and § 17.49(g) thresholds treat a commercial sale and an owner-occupied house.",
  "LOA-F117": "The DTPA's notice, abatement, tender and limitations periods, and the word that narrows the extension.",
  "LOA-F118": "How 22 TAC § 535.149 connects DTPA definitions to TREC discipline, and the two lottery elements.",
  "LOA-F119": "What must precede a trust-account payment, what it caps, and what follows for the licence holder.",
  "LOA-F120": "What 22 TAC § 535.17 requires of a CMA's prescribed statement, its format and the name it goes out in.",
  "LOA-F121": "The two ten-day advertising timing rules that follow an expired listing and a closed transaction.",
  "LOA-F122": "What the 22 TAC § 535.155(a) size ratio requires, and how broadly 'contact information' is defined.",
  "LOA-F123": "When § 1101.555 is triggered, to whom it runs, and its two separate consequences.",
  "LOA-F124": "Which use of a non-mandatory form falls inside one of 22 TAC § 537.11(a)'s four exceptions.",
  "LOA-F125": "The correct order of the first three buyer-side obligations on a call about a specific residential listing.",
  "LOA-F126": "Which act 22 TAC § 537.11 permits and which of three familiar helpful acts it forbids.",
  "LOA-F127": "When the four-year record clock starts on a dead deal, and what 'substantive communications' reaches.",
  "LOA-F128": "Which record grounds fall on the licence holder personally rather than on the sponsoring broker.",
  "LOA-F129": "Which names may be advertised without registration, and which team name is compliant.",
  "LOA-F130": "What § 1101.552 and 22 TAC § 535.21 require of a relocating broker and of a sales agent, and the effect on service.",
  "LOA-F131": "What the held sources support as a response to a late § 5.008 delivery, and which act is forbidden.",
  "LOA-F132": "At what moment on the calendar each recurring disciplinary fact pattern is created.",
});

const item = (id, spec) =>
  Object.freeze({
    id,
    topic: spec.topic,
    unit: spec.unit,
    /* `tests` is the field name the LOA formative bank and scripts/validate-loa-assessments.mjs
       read; `unit` is the field name the Principles II tooling reads. Same value, both names, so
       neither toolchain needs a special case. */
    tests: spec.unit,
    /* What the candidate is asked to decide. Authored in TESTED_JUDGMENTS above and attached here
       so that the field exists on every item and cannot be omitted for one. */
    judgement: TESTED_JUDGMENTS[id],
    prompt: spec.prompt,
    choices: Object.freeze(spec.choices),
    correctChoice: spec.correctChoice ?? 0,
    rationale: spec.rationale,
    teaches: spec.teaches,
    source: spec.source,
  });

export const FINAL_EXAM_BANK = Object.freeze([

  /* ══ T01 Agency Concepts — 130 prescribed minutes ══════════════════════════════════════════ */

  item("LOA-F001", {
    topic: "T01", unit: "T01U1",
    prompt: "A Waco investor buys, renovates and resells four duplexes a year entirely for her own account, using her own money and taking title in her own name each time. She holds no licence. A colleague tells her that the volume alone puts her inside § 1101.002(1). Which reading of the definition is correct, and on which element does it turn?",
    choices: [
      "She is outside the definition, because § 1101.002(1)(A) reaches only a person who performs one of the enumerated acts \"for another person\" — volume is not an element of the definition at all, and 22 TAC § 535.5 separately confirms that a person acting as a principal may purchase, sell, lease or sublease real estate for profit without a licence.",
      "She is inside the definition once the transactions are numerous enough to be a business, because § 1101.004(a) reaches a person who performs an enumerated act \"as a part of a transaction or as an entire transaction\" and four a year is a course of dealing rather than an isolated sale.",
      "She is outside the definition only while she takes title in her own name; the moment she assigns a purchase contract instead of closing on it she is a broker, because assignment is an enumerated act under § 1101.002(1)(A).",
      "She is inside the definition because § 1101.002(1)(A)(i) reaches a person who \"sells, exchanges, purchases, or leases real estate\" and states no exception for a person dealing on the person's own account.",
    ],
    rationale: "The opening words of § 1101.002(1)(A) are the agency hinge: the enumerated acts count only when performed \"for another person.\" Acting for your own account is outside the definition however often you do it, and 22 TAC § 535.5 states the point directly — \"Acting as a principal, a person may purchase, sell, lease, or sublease real estate for profit without being licensed as a broker or sales agent.\" The fourth choice quotes (A)(i) accurately and is wrong because it reads the subparagraph without the clause that governs the whole list. The third choice is wrong on the assignment point too: § 1101.0045(a) expressly permits an unlicensed person to acquire and assign a contract to purchase, conditioned on not using it to engage in brokerage and on a written disclosure of the equitable interest.",
    teaches: "module-01.md#unit-what-is-agency-the-license-act---statute-rules",
    source: "Texas Occupations Code §§ 1101.002(1), 1101.004(a), 1101.0045(a); 22 TAC § 535.5.",
  }),

  item("LOA-F002", {
    topic: "T01", unit: "T01U1",
    prompt: "A license holder in Denton prepares a written opinion of a property's likely selling price for an owner who is deciding whether to refinance. It is produced in the ordinary course of her brokerage business and is not called an appraisal. A classmate says the document is only an act of a broker if the owner is actually selling. Reading § 1101.002(1)(A)(xi) as written, what does the subparagraph require?",
    choices: [
      "All three of its lettered conditions must be true together — the analysis is not referred to as an appraisal, it is provided in the ordinary course of the person's business, and it relates to the actual or potential management, acquisition, disposition or encumbrance of an interest in real property — and \"potential\" plus \"encumbrance\" reach a refinancing decision, so the document is an act of a broker.",
      "Only one of the three lettered conditions need be satisfied, because § 1101.002(1)(A) as a whole requires only one of its twelve acts and the same disjunctive reading carries down into each subparagraph.",
      "The subparagraph reaches only an analysis relating to an actual disposition; management, acquisition and encumbrance were added to describe the kinds of property involved rather than the purposes the analysis may serve.",
      "The subparagraph does not apply, because labelling the document as something other than an appraisal removes it from the definition — the first lettered condition is an exclusion rather than a requirement.",
    ],
    rationale: "The twelve acts in § 1101.002(1)(A) are disjunctive — one is enough — but the three lettered conditions inside subparagraph (xi) are joined by \"and\" and are cumulative. The third condition names four purposes, and it reaches the \"actual or potential\" one, so an opinion of price prepared for a refinancing decision — an encumbrance — is within it. The fourth choice inverts condition (a): not calling it an appraisal is what keeps the document inside the broker definition rather than in the appraiser's world, so the label makes it brokerage rather than exempting it.",
    teaches: "module-01.md#unit-what-is-agency-the-license-act---statute-rules",
    source: "Texas Occupations Code § 1101.002(1)(A)(xi).",
  }),

  item("LOA-F003", {
    topic: "T01", unit: "T01U1",
    prompt: "A broker licensed in Texas sits in his office in Santa Fe, New Mexico and, by email and telephone only, negotiates the lease of a warehouse in El Paso for a client. He never enters Texas during the engagement. Separately, from an office in Amarillo, he negotiates the sale of a ranch located entirely in Oklahoma. Applying 22 TAC § 535.4, which transactions are within the Act?",
    choices: [
      "Both are. The rule reaches a person acting as a broker or sales agent \"while physically within Texas, regardless of the location of the real estate involved,\" which captures the Oklahoma ranch, and it separately treats a person conducting brokerage business from another state by mail, telephone, the Internet, email or other medium as acting within Texas if the property is located wholly or partly in Texas, which captures the El Paso warehouse.",
      "Only the El Paso warehouse is. The rule's remote-brokerage sentence extends the Act to out-of-state conduct touching Texas property, but a person physically in Texas brokering out-of-state property is governed by the law of the state where the property sits.",
      "Only the Oklahoma ranch is. Physical presence in Texas is the rule's single test, and the remote-brokerage sentence describes how the Commission establishes presence rather than creating a second, property-based basis for the Act to apply.",
      "Neither is, without more. The rule applies the Act to conduct that is both performed within Texas and directed at Texas property, and each of these transactions satisfies only one of the two.",
    ],
    rationale: "Section 535.4 states two independent bases, and the module frames them as traps in opposite directions. The first sentence applies the Act to anyone acting as a broker or sales agent while physically within Texas \"regardless of the location of the real estate involved or the residence of the person's customers or clients\" — so brokering an Oklahoma ranch from Amarillo is inside it. The second sentence deems a person conducting brokerage from another state by mail, telephone, the Internet, email or other medium to be acting within Texas if the property is wholly or partly in Texas — so the El Paso warehouse is inside it too. The fourth choice makes the two bases cumulative when the rule states them as alternatives.",
    teaches: "module-01.md#unit-what-is-agency-the-license-act---statute-rules",
    source: "22 TAC § 535.4.",
  }),

  item("LOA-F004", {
    topic: "T01", unit: "T01U1",
    prompt: "A broker's unlicensed office administrator wants to be useful on Saturdays. Which single task may she perform without a licence, and what makes the others acts for which a licence is required?",
    choices: [
      "She may confirm the size, price and terms of advertised property to a caller if she is identified to the caller as clerical or administrative staff, which is the narrow permission in 22 TAC § 535.5; unlocking a property for a prospective buyer, letting a buyer view it, and hosting an open house are all inside the definition of showing in 22 TAC § 535.4, and a person must be licensed to show a property.",
      "She may host the open house, because the broker's licence covers activity at the broker's own listing and 22 TAC § 535.2 makes the broker responsible for it; what she may not do is discuss price or terms with anyone who attends.",
      "She may unlock the property and let a buyer walk through it unaccompanied, because the definition of showing in 22 TAC § 535.4 reaches a person who conducts a showing rather than one who merely provides access.",
      "She may do any of these so long as she is paid a flat hourly wage rather than a share of any commission, because 22 TAC § 535.5 turns on whether the person acts for compensation or the expectation of compensation.",
    ],
    rationale: "Section 535.4 defines showing broadly for its own purposes — it \"includes causing or permitting the property to be viewed by a prospective buyer or tenant, unlocking or providing access onto or into a property for a prospective buyer or tenant, and hosting an open house at the property\" — and requires a licence to show. Section 535.5 supplies the one narrow permission for unlicensed staff: an answering service or clerical or administrative employees \"identified to callers as such\" may confirm information concerning the size, price and terms of property advertised. The fourth choice misreads § 535.5's compensation language, which is about a person acting as an agent for a co-owner, not a general exemption for salaried staff.",
    teaches: "module-01.md#unit-what-is-agency-the-license-act---statute-rules",
    source: "22 TAC §§ 535.4, 535.5.",
  }),

  item("LOA-F005", {
    topic: "T01", unit: "T01U2",
    prompt: "A license holder's conduct in a Galveston transaction draws a TREC complaint, a private suit by the buyer and a referral to the county attorney. She signs an agreed order with the Commission and pays the penalty. Which statement about what that order settles is correct on the sections this course teaches?",
    choices: [
      "It settles nothing outside the licence case: § 1101.801 provides that disciplinary action taken under § 1101.652 \"does not relieve the person from civil or criminal liability,\" so the private suit and any prosecution proceed on their own tracks.",
      "It settles the criminal exposure but not the civil, because § 1101.756 makes a wilful violation of the chapter or a commission order a Class A misdemeanor and an agreed order is compliance with, rather than violation of, such an order.",
      "It settles the civil exposure to the extent of the penalty paid, because a penalty imposed under § 1101.702(a) is credited against a private recovery for the same conduct.",
      "It settles everything arising from the same conduct, because § 1101.701(a) authorises the penalty for a violation of the chapter, a rule or a commission order, and the conduct has now been adjudicated by the agency with jurisdiction over it.",
    ],
    rationale: "Section 1101.801 is one sentence and it does the whole work: disciplinary action under § 1101.652 does not relieve the person from civil or criminal liability. There are three tracks — the Commission's, the injured consumer's and the State's — and resolving one does not resolve the others. The second choice misreads § 1101.756, which makes a wilful violation of the chapter or a commission order a Class A misdemeanor; complying with an agreed order is not what that section addresses, and nothing in it converts an agreed order into a bar on prosecution for the underlying conduct. Nothing in § 1101.702 or § 1101.701 offsets an administrative penalty against a private recovery.",
    teaches: "module-01.md#unit-why-study-agency",
    source: "Texas Occupations Code §§ 1101.801, 1101.756, 1101.701(a), 1101.702(a).",
  }),

  item("LOA-F006", {
    topic: "T01", unit: "T01U2",
    prompt: "The Legislature listed \"agency law\" first among the qualifying real estate courses. Which account of what § 1101.003(a) actually does, and of what the ordering can and cannot be used to prove, is accurate on the held text?",
    choices: [
      "Section 1101.003(a) defines \"qualifying real estate courses\" for purposes of the chapter and opens its list with agency law at subdivision (1); the ordering shows that the course exists because a statute names it, but the section states no ranking of importance and assigns no weight, and the list is not alphabetical past its opening entries.",
      "Section 1101.003(a) ranks the qualifying subjects in the order in which the Commission must weight them when setting examination content, so agency law carries the largest share of the licensing examination.",
      "Section 1101.003(a) lists the qualifying courses alphabetically, so the position of agency law at subdivision (1) is an artefact of the alphabet and carries no significance at all.",
      "Section 1101.003(a) prescribes the order in which a student must complete the qualifying courses, which is why agency law is taken before contract law and principles of real estate.",
    ],
    rationale: "The section defines the term and lists the subjects; agency law is subdivision (1), contract law (2), principles of real estate (3), and the list continues through property management, appraisal, brokerage, finance, investment, law, marketing and mathematics. The module is careful about what the ordering proves: \"agency\" does precede \"appraisal\" and \"contract\" alphabetically, but the list is not alphabetical after that point, so the third choice is wrong — and equally, the section states no weighting and no sequence requirement, so the second and fourth choices import obligations the text does not contain. What the ordering supports is the modest claim in the correct answer.",
    teaches: "module-01.md#unit-why-study-agency",
    source: "Texas Occupations Code § 1101.003(a).",
  }),

  item("LOA-F007", {
    topic: "T01", unit: "T01U3",
    prompt: "A sales agent asks her broker where in Texas law she can find the definitions of \"client\" and \"customer\" that her study guide keeps using. On the sources read for this course, what is the accurate answer?",
    choices: [
      "Neither term is defined. \"Customer\" does not appear in Chapter 1101 at all; \"clients\" appears in § 1101.553 and § 1101.803 without being defined; and among the rules read for this course the pair appears once, in the 22 TAC § 535.1 definition of \"Place of business,\" which defines the place rather than either kind of person. The working distinction comes from representation, which the statute does address.",
      "Both are defined at § 1101.551, which supplies the definitions used throughout Subchapter L, including \"party,\" \"client\" and \"customer.\"",
      "\"Client\" is defined at 22 TAC § 531.1 alongside \"Commission\" and \"License Holder\"; \"customer\" is left to the common law of agency, which the Act incorporates by reference at § 1101.005.",
      "Both are defined in 22 TAC § 535.1, which is why the Information About Brokerage Services notice can use them without further explanation.",
    ],
    rationale: "This is the orienting fact of the unit and it is stated negatively on purpose. Chapter 1101 never uses \"customer,\" and its two uses of \"clients\" — the residential rental locator's display duty at § 1101.553 and the broker's liability to \"the commission, the public, and the broker's clients\" at § 1101.803 — define nothing. Rule 531.1 defines only \"Commission\" and \"License Holder.\" Rule 535.1 defines a good deal, but its single use of the pair is inside \"Place of business–A place where the license holder meets with clients and customers to transact business,\" which defines the place. Section 1101.551 defines \"intermediary\" and \"party,\" not these two.",
    teaches: "module-01.md#unit-roles-people-play-in-agency-relationships---client-or-customer",
    source: "Texas Occupations Code §§ 1101.551, 1101.553, 1101.803; 22 TAC §§ 531.1, 535.1.",
  }),

  item("LOA-F008", {
    topic: "T01", unit: "T01U3",
    prompt: "In a Corpus Christi lease transaction the people involved are: the owner; the owner's property manager, a license holder whose management agreement lets her sign leases without further owner approval; the listing broker; the listing broker's sponsored sales agent; and the prospective tenant. Applying § 1101.551(2) and § 1101.557(c)(1), who is a \"party\"?",
    choices: [
      "The owner and the prospective tenant are parties under § 1101.551(2); the property manager is additionally a party for purposes of § 1101.557 under subsection (c)(1), because a license holder with authority to bind a party to a lease or sale under a power of attorney or a property management agreement is also a party to the lease or sale; the listing broker and the sponsored sales agent are not, because the definition excludes a license holder who represents a party.",
      "All five are parties, because § 1101.551(2) reaches a prospective buyer, seller, landlord or tenant \"or an authorized representative\" of one, and each of the license holders is an authorised representative of somebody in the transaction.",
      "Only the owner and the prospective tenant are parties in any sense; § 1101.557(c)(1) describes when a license holder owes a party's duties, not when a license holder becomes a party.",
      "The owner, the prospective tenant and the listing broker are parties, because the broker holds the listing and § 1101.557(a) makes a broker who lists real estate under an exclusive agreement that party's agent, which places the broker inside the transaction as a principal.",
    ],
    rationale: "Section 1101.551(2) reaches the four transaction positions and those standing in a party's shoes with legal authority — a trustee, guardian, executor, administrator, receiver or attorney-in-fact — and then removes license holders: \"The term does not include a license holder who represents a party.\" The exception runs the other way for one person: § 1101.557(c)(1) provides that for purposes of that section, a license holder with authority to bind a party to a lease or sale under a power of attorney or a property management agreement is also a party. So the manager is both a license holder and, for § 1101.557, a party. The second choice reads \"authorized representative\" as though it covered brokers, which the exclusion sentence forecloses.",
    teaches: "module-01.md#unit-roles-people-play-in-agency-relationships---client-or-customer",
    source: "Texas Occupations Code §§ 1101.551(2), 1101.557(a), (c)(1).",
  }),

  item("LOA-F009", {
    topic: "T01", unit: "T01U3",
    prompt: "A student writes in her notes: \"Texas abolished subagency in 2026.\" On the held sources, what is the defensible statement, and what is wrong with hers?",
    choices: [
      "Two references to subagency were removed from TRELA effective January 1, 2026 — § 1101.002(8) and § 1101.805(f) are both shown as repealed by Acts 2025, 89th Leg., R.S., Ch. 1172 (S.B. 1968) — so the statute no longer uses the term and the circumstances in which subagency arises are limited; but the held source does not preserve the repealed text, the common-law doctrine was not held for this course, and TREC's own guidance says subagency \"has not been eliminated generally as a legal concept.\"",
      "She is right: the repeal of § 1101.002(8) and § 1101.805(f) removed subagency from Texas law entirely, and a license holder who describes a cooperating broker as a subagent after January 1, 2026 is making a statement with no legal content.",
      "She is wrong because nothing changed: § 1101.002(8) and § 1101.805(f) were reworded rather than repealed, and subagency continues to operate in Texas exactly as it did before.",
      "She is wrong because the repeal ran the other way: subagency was previously a common-law doctrine only, and the 2025 act codified it for the first time at § 1101.002(8).",
    ],
    rationale: "The module's position is deliberately narrow because the sources are. Both provisions are shown as repealed by section 13 of the 2025 act effective January 1, 2026, and the held source does not preserve what either said — so this course does not state their content. TREC's explanatory article, which is guidance and not law, says two references were removed, that the circumstances in which subagency could arise are limited, and that it \"has not been eliminated generally as a legal concept.\" The claim that the doctrine is gone outruns the sources; so does the claim that nothing changed.",
    teaches: "module-01.md#unit-roles-people-play-in-agency-relationships---client-or-customer",
    source: "Texas Occupations Code §§ 1101.002(8) and 1101.805(f), each shown as repealed by Acts 2025, 89th Leg., R.S., Ch. 1172 (S.B. 1968), Sec. 13, eff. January 1, 2026; TREC guidance on the 2026 changes, identified in the curriculum as guidance rather than law.",
  }),

  item("LOA-F010", {
    topic: "T01", unit: "T01U4",
    prompt: "A Beaumont owner tells a broker: \"Get me $240,000 for the house and keep everything above that.\" The owner has never sold a house and asks the broker what the property is worth. Under 22 TAC § 535.16(b), what may the broker do?",
    choices: [
      "The broker may not take the listing on those terms. The rule permits a net listing only where the principal requires one and the principal appears to be familiar with current market values, and if used it must assure the principal of not less than the principal's desired price and limit the broker to a specified maximum commission — an owner who is asking the broker what the house is worth does not satisfy the familiarity condition.",
      "The broker may take it, because the rule's prohibition is on a listing in which the broker's commission is the entire excess over the owner's desired price, and adding a stated maximum commission converts it into an ordinary listing to which the rule does not apply.",
      "The broker may take it if the broker first discloses in writing that the arrangement places the broker's interest above the principal's, because the rule's concern is disclosure and an informed principal may consent.",
      "The broker may not take it under any circumstances, because 22 TAC § 535.16(b) prohibits net listings outright and states no exception.",
    ],
    rationale: "The rule defines a net listing as one in which the broker's commission is the difference between the sales proceeds and an amount desired by the owner, and then sets a conditional prohibition: \"A broker may not take net listings unless the principal requires a net listing and the principal appears to be familiar with current market values of real property.\" Both conditions must hold, and this owner fails the second by asking the question. The fourth choice states a flat ban the rule does not contain; the third substitutes disclosure for the two conditions the rule actually imposes. The rule gives its own reason — the arrangement places the broker's interest above the principal's with reference to obtaining the best possible price, which is what 22 TAC § 531.2 forbids.",
    teaches: "module-01.md#unit-relationship-between-principal-agent",
    source: "22 TAC §§ 535.16(b), 531.2.",
  }),

  item("LOA-F011", {
    topic: "T01", unit: "T01U4",
    prompt: "A sales agent's relationship with her sponsoring broker ends on a Friday. She has three buyers under written agreements and a closing the following Wednesday. Applying § 1101.367(a) and § 1101.351(c), what is her position on Monday?",
    choices: [
      "The terminating party must immediately notify in writing both the other party and the commission, and on receiving that notice the commission places the sales agent licence on inactive status; an inactive sales agent may not engage in brokerage because § 1101.351(c) requires sponsorship, so there is no interval during which she may keep working the files.",
      "She may continue to work the three files to closing, because the buyer agreements were entered into while she was sponsored and § 1101.367(a) governs only new business taken after the termination date.",
      "She may continue to work the files provided she gives the written notice within thirty days, which is the period § 1101.367(a) allows before the commission places the licence on inactive status.",
      "Her licence remains active until a new sponsoring broker files a sponsorship request, because § 1101.351(c) is satisfied so long as she is acting for a broker, and until she is placed with one she is still acting for the former broker on these files.",
    ],
    rationale: "Section 1101.367(a) requires the terminating party to notify both the other party and the commission in writing immediately, and directs the commission to place the sales agent licence on inactive status on receiving that notice. Section 1101.351(c) forbids a licensed sales agent to engage or attempt to engage in real estate brokerage unless sponsored by a licensed broker and acting for that broker. Put together, there is no grace period and no carve-out for files already in progress. The third choice invents a thirty-day window; the two-calendar-day and thirty-day periods in the broker-responsibility material serve different rules entirely.",
    teaches: "module-01.md#unit-relationship-between-principal-agent",
    source: "Texas Occupations Code §§ 1101.367(a), 1101.351(c).",
  }),

  /* ══ T02 Basic Agency Relationships, Disclosure and Duties to the Client — 125 minutes ═════ */

  item("LOA-F012", {
    topic: "T02", unit: "T02U1",
    prompt: "At a builder's model home in Cedar Park a license holder spends an hour with a walk-in visitor, tells her what she should offer and why, and advises her to ask for a closing-cost contribution. Nothing is signed and no fee is discussed. A colleague says no agency can exist because there is no writing and no compensation. Which analysis follows the sections this course teaches?",
    choices: [
      "Agency may already exist. Section 1101.557(a) makes a broker who \"represents a party in a real estate transaction\" that party's agent and does not require a writing, and § 1101.562(a) confirms the point from the other direction by making a non-representation showing available only where the broker has not agreed \"either orally or in writing\" to represent the party and \"is not otherwise acting as the party's agent at the time of showing.\" A statute that must exclude oral agreement and acting-as-agent-in-fact assumes both can create the status.",
      "No agency exists, because § 1101.557(a) creates the status only where the broker lists real estate under an exclusive agreement, and the word \"represents\" earlier in the sentence describes the effect of that listing rather than a second, independent trigger.",
      "No agency exists, because compensation is an element: § 1101.002(1) defines a broker by acts performed \"in exchange for a commission or other valuable consideration or with the expectation\" of it, and without a fee expectation the license holder is outside the Act entirely.",
      "Agency exists automatically and by operation of law, because § 1101.563 requires a written agreement with a prospective residential buyer before showing property, and a license holder who advises a buyer without one has by that failure created the representation the section presupposes.",
    ],
    rationale: "Section 1101.557(a) states two independent triggers joined by \"or\" — representing a party, or listing under an exclusive agreement — and only the second is document-driven. \"Represents\" is behavioural and undefined in the section. The 2026 addition of § 1101.562 is the confirmation: the safe harbour it creates has to exclude an oral agreement to represent and \"otherwise acting as the party's agent at the time of showing,\" which it would not need to do if only a writing could create agency. The third choice confuses the licensing definition with the representation question: § 1101.002(1) tells you when someone needs a licence, not whom a broker represents. The fourth choice inverts § 1101.563, which imposes a duty and whose breach is a disciplinary ground under § 1101.652(b)(34) — it does not manufacture representation.",
    teaches: "module-02.md#unit-agency-defined",
    source: "Texas Occupations Code §§ 1101.557(a), 1101.562(a), 1101.563, 1101.002(1).",
  }),

  item("LOA-F013", {
    topic: "T02", unit: "T02U1",
    prompt: "A seller agrees to contribute toward the fee of the broker representing the buyer. The listing broker tells the seller this makes the buyer's broker the seller's agent as well. Which statement is correct, and what in the held text separates the two questions?",
    choices: [
      "Compensation and representation are separate questions. Section 1101.563(c) requires a written agreement with a residential buyer to state the license holder's representation status and the broker's compensation as two separate items and to disclose in conspicuous language that compensation is not set by law and is fully negotiable — a statute that itemises them separately is not treating one as proof of the other.",
      "The listing broker is right: because § 1101.651(a) forbids a broker to compensate a person for performing an act of a broker unless that person is a license holder, paying a broker is the statutory marker of the agency relationship.",
      "The listing broker is right as to the seller but not as to the buyer, because a broker who accepts compensation from a party becomes that party's agent unless the party consents in writing under § 1101.559(a) to a different arrangement.",
      "The question cannot arise, because a seller may not contribute to the compensation of the broker representing the buyer; § 1101.652(b)(8) reaches a license holder who receives compensation from more than one party.",
    ],
    rationale: "The module puts this plainly: if who pays determined who was represented, § 1101.563(c) would not need two separate line items — it has them. A seller may contribute to a buyer's broker's fee without that broker becoming the seller's agent, and a listing broker does not become the buyer's agent by sharing a commission. The fourth choice misreads § 1101.652(b)(8), which reaches a license holder who receives compensation from more than one party \"without the full knowledge and consent of all parties\" — it is a consent rule, not a prohibition on a seller contribution. Section 1101.559(a) governs a broker's written consent to act as an intermediary and has nothing to do with a cooperating broker's fee.",
    teaches: "module-02.md#unit-agency-defined",
    source: "Texas Occupations Code §§ 1101.563(c), 1101.651(a), 1101.652(b)(8), 1101.559(a).",
  }),

  item("LOA-F014", {
    topic: "T02", unit: "T02U2",
    prompt: "A buyer hands a sales agent a cashier's cheque for earnest money at the kitchen table after the contract is signed. The sales agent has express written authority from her broker to negotiate residential contracts. What does that authority carry with it as to the money, on the held text?",
    choices: [
      "Nothing as to holding it: 22 TAC § 535.146(b) provides that trust money accepted by a broker is held in a fiduciary capacity and must be deposited in the broker's designated trust account or delivered to an authorised escrow agent, that a sales agent may not maintain a trust account, and that trust money received by a sales agent must be delivered immediately to the sponsoring broker — implied authority fills gaps in what was expressly granted, and this gap is closed by a rule rather than left open.",
      "Authority to hold it in her own account until closing, because the authority to negotiate the contract carries by implication the authority to perform the acts reasonably necessary to complete it, and receiving earnest money is one of them.",
      "Authority to deposit it in the broker's trust account herself, because 22 TAC § 535.146(b) sets the deadline at the close of business of the second calendar day after receipt and a sales agent may act on the broker's behalf to meet it.",
      "Authority to hold it for up to two calendar days, because 22 TAC § 535.157 gives a license holder two calendar days to respond and the same period governs the handling of trust money received in the field.",
    ],
    rationale: "Implied actual authority is the authority reasonably necessary to carry out what was expressly authorised, but it fills gaps rather than overriding rules and instructions. Section 535.146(b) closes this gap: a sales agent may not maintain a trust account, and trust money the sales agent receives goes immediately to the sponsoring broker. The third choice also misstates the deadline — the deposit deadline in § 535.146(b) is the close of business of the second *working* day after receipt, and the module contrasts that deliberately with § 535.157's two *calendar* days, which is a response duty and not a money-handling rule.",
    teaches: "module-02.md#unit-authority-of-agent",
    source: "22 TAC §§ 535.146(b), 535.157.",
  }),

  item("LOA-F015", {
    topic: "T02", unit: "T02U2",
    prompt: "A seller's written listing instruction says the property may be offered only at or above a stated price and that no sign may be placed on the lot. The listing broker's sales agent, believing the price unrealistic, tells two cooperating brokers the seller \"will take considerably less,\" and installs a sign. Which disciplinary grounds does the conduct reach, and what is the common idea behind them?",
    choices: [
      "Section 1101.652(b)(20) — offering property on terms other than those authorised by the owner — and § 1101.652(b)(18) — placing a sign on real property offering it for sale or lease without the written consent of the owner. Both are built out of the single idea that a license holder may not act beyond the authority granted, which in Texas is a disciplinary matter and not merely a contract dispute with the client.",
      "Neither. Both provisions govern a broker's dealings with the owner rather than with cooperating brokers, and the sales agent's remedy for an unrealistic price is to seek a written price reduction, which is what the seller's refusal would then document.",
      "Section 1101.652(b)(19) only — offering real property for sale or lease without the knowledge and consent of the owner — because the seller consented to the listing itself and the price and sign instructions are matters of internal brokerage policy.",
      "Section 1101.652(b)(2) only, as conduct demonstrating untrustworthiness, because subdivisions (18), (19) and (20) apply to a broker and this conduct was that of a sponsored sales agent.",
    ],
    rationale: "Subdivision (b)(20) reaches offering property on terms other than those authorised by the owner, which is what telling cooperating brokers the seller will take considerably less does; (b)(18) reaches placing a sign offering the property for sale or lease without the owner's written consent. Subdivision (b)(19) covers offering the property at all without the owner's knowledge and consent, which is not this fact pattern — the seller consented to the listing. Section 1101.652(b) applies to \"a license holder,\" which § 1101.002(4) defines as a broker or sales agent, so the fourth choice's premise fails.",
    teaches: "module-02.md#unit-authority-of-agent",
    source: "Texas Occupations Code §§ 1101.652(b)(18), (19), (20), 1101.002(4).",
  }),

  item("LOA-F016", {
    topic: "T02", unit: "T02U3",
    prompt: "A brokerage's client is buying a house the same brokerage has listed. The broker proposes to handle it as a disclosed dual agency with both parties' written consent. What does Texas law require instead, and what makes it non-optional?",
    choices: [
      "The broker must act as an intermediary. Section 1101.561(b) provides that a broker must agree to act as an intermediary under Subchapter L if the broker agrees to represent both a buyer or tenant and a seller or landlord in a transaction, and § 1101.551(1) defines the intermediary as a broker employed to negotiate a transaction between the parties who for that purpose may act as an agent of the parties — there is no election between the two postures.",
      "The broker may choose either, because § 1101.559(a) conditions intermediary status on the written consent of each party, and parties who instead consent to a disclosed dual agency have made the choice the statute leaves to them.",
      "The broker must refer one side to another brokerage, because § 1101.561(b) forbids a broker to represent both a buyer and a seller in the same transaction under any arrangement.",
      "The broker must act as an intermediary only where the two clients are served by different sponsored sales agents; where one sales agent holds both sides, the arrangement is a single agency with the broker as the sole agent of both.",
    ],
    rationale: "Section 1101.561(b) states the obligation in mandatory terms: a broker \"must agree to act as an intermediary\" if the broker agrees to represent both sides. That is why intermediary is described in the module as the classification Texas substitutes for dual agency rather than as one option among several. The second choice reverses the role of § 1101.559(a): the written consent is a condition of acting as an intermediary lawfully, not a menu from which the parties may pick a different arrangement. The third overstates the rule — representing both sides is permitted, through the intermediary machinery in §§ 1101.559–1101.561, which Module 06 teaches.",
    teaches: "module-02.md#unit-classifications-of-agency",
    source: "Texas Occupations Code §§ 1101.561(b), 1101.551(1), 1101.559(a).",
  }),

  item("LOA-F017", {
    topic: "T02", unit: "T02U3",
    prompt: "A student asks where in Texas law she can find the definitions of universal, general and special agency that her national textbook uses, and what a residential listing is. What is the accurate answer on the sources held for this course?",
    choices: [
      "No Texas statute or Commission rule defining those three terms was held for this course, so they are classical vocabulary rather than Texas text; but the Texas text does place a residential listing in the narrowest category, because § 1101.557(c)(1) names a power of attorney and a property management agreement as the instruments conferring authority to bind a party — a listing is not among them — and §§ 1101.652(b)(19) and (20) confirm the limit by requiring the owner's consent and authorised terms.",
      "The three terms are defined at § 1101.002 alongside \"broker,\" \"license holder\" and \"sales agent,\" and a residential listing is a general agency because it runs over a series of showings and negotiations rather than a single act.",
      "The terms are defined at 22 TAC § 535.1, and a residential listing is a universal agency limited by its own terms, which is why the listing agreement must state a definite termination date under § 1101.652(b)(12).",
      "The terms appear nowhere in Texas law and neither does anything equivalent, so a Texas license holder cannot say what kind of authority a listing confers without a court's ruling on the particular agreement.",
    ],
    rationale: "The module teaches the taxonomy as working shorthand and is explicit that a Texas source defining any of the three terms was not held for this course. It then anchors the conclusion in text rather than in the taxonomy: the Legislature named the two instruments that confer authority to bind at § 1101.557(c)(1), a listing is not one of them, and the disciplinary grounds at (b)(19) and (b)(20) presuppose that the owner and not the agent settles the terms. The fourth choice draws the wrong conclusion from the absence of the vocabulary — the held text answers the practical question even though it never uses the labels.",
    teaches: "module-02.md#unit-classifications-of-agency",
    source: "Texas Occupations Code §§ 1101.557(c)(1), 1101.652(b)(19), (20), (12).",
  }),

  item("LOA-F018", {
    topic: "T02", unit: "T02U4",
    prompt: "A license holder's principal has accepted an offer on a Longview house. A second, higher offer arrives four days later. The principal said at the listing appointment — in conversation, with the license holder's note of it in the file — that he did not want to see anything further once he was under contract. What does 22 TAC § 535.156 require?",
    choices: [
      "The license holder must convey it. The rule's exception applies only \"if the principal has agreed in writing that offers are not to be submitted after the principal has entered into a contract,\" and a spoken instruction recorded in the license holder's own file note is not the principal's written agreement.",
      "The license holder need not convey it, because the rule's concern is that the principal's decision be an informed one and a documented instruction from the principal satisfies that concern whatever its form.",
      "The license holder need not convey it, because the affirmative duty in the rule to keep the principal informed of significant information applies to the transaction the principal is in, and an offer the principal cannot accept is not information applicable to it.",
      "The license holder must convey it, but only because the second offer is higher; the rule's exception is available for offers at or below the contract price whether or not the principal's agreement was written.",
    ],
    rationale: "The rule has two halves and they must be learned together. The duty is to convey all known information that would affect the principal's decision whether to make, accept or reject offers. The exception switches off only the duty to submit offers after acceptance, and only where \"the principal has agreed in writing.\" No writing, no exception. The fourth choice invents a price condition the rule does not contain; the third would defeat the rule's own affirmative duty to keep the principal informed at all times of significant information applicable to the transaction.",
    teaches: "module-02.md#unit-duty-to-respond-fiduciary-duties-and-responsibilities",
    source: "22 TAC § 535.156.",
  }),

  item("LOA-F019", {
    topic: "T02", unit: "T02U4",
    prompt: "Which pairing of a fiduciary duty with the Texas text that actually imposes it is correct, and what is the standing caution about the six-duty frame itself?",
    choices: [
      "Reasonable care and diligence is imposed by § 1101.652(b)(1), which reaches negligence or incompetence while engaged in real estate brokerage, and by the competency canon at 22 TAC § 531.4 — and the six-duty frame of loyalty, obedience, disclosure, confidentiality, accounting and care is an industry teaching frame, not a statutory list; no Texas source enumerating six duties under those names was held for this course.",
      "The six duties are enumerated at 22 TAC § 531.2, which is why that rule is titled \"Fidelity\" and why a breach of any one of them is a separate ground for discipline under § 1101.652(b)(7).",
      "Accounting is imposed by 22 TAC § 535.157, which sets the two-calendar-day period within which a license holder must account to a principal for money received, and the remaining five duties are common-law doctrines Texas has not codified.",
      "Confidentiality is imposed by § 1101.556, which protects information about a previous occupant's illness and about a death on the property, and the frame's other five duties are stated in the Information About Brokerage Services notice.",
    ],
    rationale: "The module gives the frame and then insists on the text, warning that the six-duty list is a filing system rather than Texas law. The care duty is carried by § 1101.652(b)(1) and by 22 TAC § 531.4, which requires a license holder to be knowledgeable and competent, informed on local market issues and conditions, informed on industry developments, and educated in the type of real estate being brokered. Section 535.157 is the response rule and says nothing about accounting; § 1101.556 is a permission not to inquire or disclose, not a confidentiality duty owed to a client.",
    teaches: "module-02.md#unit-duty-to-respond-fiduciary-duties-and-responsibilities",
    source: "Texas Occupations Code §§ 1101.652(b)(1), 1101.556; 22 TAC §§ 531.2, 531.4, 535.156, 535.157.",
  }),

  item("LOA-F020", {
    topic: "T02", unit: "T02U4",
    prompt: "A license holder is asked which subsection of § 1101.652 covers failing to consider market conditions for the specific geographic area in which the license holder provides a service. Why is the answer a common filing error, and what is it?",
    choices: [
      "It is § 1101.652(a)(6) — subsection (a), not subsection (b) — and the error is common because the neighbouring competence ground for acting negligently or incompetently while engaged in real estate brokerage sits in subsection (b), at (b)(1), so students file both under (b).",
      "It is § 1101.652(b)(1), the negligence and incompetence ground, which the Commission reads to include a failure to consider market conditions; there is no separate provision, which is why students look for one and cannot find it.",
      "It is § 1101.652(b)(6), and the error is common because the competency canon at 22 TAC § 531.4 states the same obligation and students cite the rule instead of the statute.",
      "It is not in § 1101.652 at all; the obligation to be informed on local market issues and conditions appears only in 22 TAC § 531.4, and a breach of it is reachable only through the general untrustworthiness ground at § 1101.652(b)(2).",
    ],
    rationale: "The module flags this one specifically because the two provisions look alike and sit in different subsections: § 1101.652(a)(6) reaches a license holder who fails to consider market conditions for the specific geographic area in which the license holder is providing a service, while § 1101.652(b)(1) reaches negligence or incompetence while engaged in real estate brokerage. Rule 531.4 states an overlapping obligation as a canon, but the statutory provision exists and is in subsection (a).",
    teaches: "module-02.md#unit-duty-to-respond-fiduciary-duties-and-responsibilities",
    source: "Texas Occupations Code §§ 1101.652(a)(6), (b)(1), (b)(2); 22 TAC § 531.4.",
  }),

  item("LOA-F021", {
    topic: "T02", unit: "T02U5",
    prompt: "A license holder holds a property open for any prospective buyer. A visitor asks about that house; the conversation then turns to whether the visitor should sell her own house on the other side of Lubbock. Applying § 1101.558(c)(3), what does the exception cover?",
    choices: [
      "It covers the first conversation only. The exception applies where \"the communication occurs at a property that is held open for any prospective buyer or tenant and the communication concerns that property\" — both elements attach to the communication, so a communication about the visitor's own house is outside it even though it happens at the open house.",
      "It covers both conversations, because the exception is keyed to the setting: once a communication occurs at a property held open for any prospective buyer or tenant, everything said there falls outside the notice requirement.",
      "It covers neither, because § 1101.558(c) relieves a license holder of the notice requirement only where the license holder does not represent the owner of the property being held open.",
      "It covers both conversations and also relieves the license holder of the § 1101.558(b) representation disclosure, because subsection (c) opens by excusing \"the notice\" without distinguishing between the two duties in the section.",
    ],
    rationale: "The open-house exception is narrow in two ways, and the module says so: the property must be held open for any prospective buyer or tenant, and the communication must concern that property. Turn the conversation to the visitor's own house and by its terms the exception no longer covers that communication. The fourth choice makes the error the whole unit is built to prevent: subsection (c) relieves a license holder of the notice \"required by Subsection (b-1)\" and does not touch the subsection (b) representation disclosure, which stands alone and has no exception list.",
    teaches: "module-02.md#unit-information-about-brokerage-services---disclosure-of-representation",
    source: "Texas Occupations Code § 1101.558(b), (b-1), (c)(3).",
  }),

  item("LOA-F022", {
    topic: "T02", unit: "T02U5",
    prompt: "A brokerage rebuilds the IABS Notice inside its transaction software: the text is copied word for word, but the paragraphs are re-flowed into two columns to fit one page, the office logo is inserted at the top, and the Broker Contact Information section is pre-filled. Which of those three changes does 22 TAC § 531.20 permit?",
    choices: [
      "Only the pre-filled Broker Contact Information. The rule permits reproduction \"provided that the text of the IABS Notice is copied verbatim and the spacing, borders and placement of text on the page must appear to be identical to that in the published version,\" and states one exception — that the Broker Contact Information section may be prefilled — so re-flowing the text into two columns and inserting a logo both fail the appearance requirement.",
      "The re-flow and the pre-filled contact information. The rule's requirement is that the text be verbatim, and re-flowing does not alter a word; only the logo is an addition to the published document.",
      "All three. The rule permits reproduction outright, and the requirements about spacing, borders and placement describe the published version rather than imposing conditions on a reproduction.",
      "None. The rule adopts TREC No. IABS 1-2 by reference and a license holder must deliver the Commission's own published file, which is why the rule prescribes four methods of delivery.",
    ],
    rationale: "The rule permits reproduction and then sets two conditions and one exception: the text must be copied verbatim, the spacing, borders and placement of text on the page must appear to be identical to the published version, and the single permitted deviation is that the Broker Contact Information section may be prefilled. Re-flowing into two columns changes placement; a logo inserted into the document changes the appearance of the page. The fourth choice is wrong because the rule expressly contemplates reproduction — many brokerages build it into their transaction software.",
    teaches: "module-02.md#unit-information-about-brokerage-services---disclosure-of-representation",
    source: "22 TAC § 531.20.",
  }),

  /* ══ T03 Duties and Disclosures to Third Parties — 125 prescribed minutes ══════════════════ */

  item("LOA-F023", {
    topic: "T03", unit: "T03U1",
    prompt: "A license holder representing a seller signs an offer with an unrepresented buyer. Which obligation does § 1101.555 impose, to whom does it run, and what happens if it is not performed?",
    choices: [
      "When an offer to purchase real estate in this state is signed, the license holder must advise each buyer, in writing, either to have the abstract covering the real estate examined by an attorney of the buyer's selection or to be provided with or obtain a title insurance policy; the duty runs to each buyer rather than to each client, so it is owed to this unrepresented buyer, and failure is a ground for discipline under § 1101.652(b)(29).",
      "The license holder must advise the license holder's own client in writing to obtain a title insurance policy; an unrepresented buyer is expected to obtain that advice from the title company, and § 1101.652(b)(29) reaches only a failure owed to a client.",
      "The license holder must recommend a title insurance policy specifically, because the abstract alternative in § 1101.555 was available only before the section's amendment and the Commission now treats a title policy as the single compliant route.",
      "The obligation arises at closing rather than at signing, and it may be satisfied orally, because § 1101.555 states no form requirement and the written record is supplied by the closing documents themselves.",
    ],
    rationale: "The section is triggered when an offer to purchase real estate in this state is signed and requires written advice to \"each buyer\" — the module makes the point that this is each buyer and not each client, so it is one of the duties that runs across the table to a person you do not represent. The advice is stated in the alternative: have the abstract examined by an attorney of the buyer's choosing, or be provided with or obtain a title insurance policy. Section 1101.652(b)(29) supplies the disciplinary consequence. The fourth choice moves both the timing and the form away from what the section states.",
    teaches: "module-03.md#unit-non-fiduciary-duties",
    source: "Texas Occupations Code §§ 1101.555, 1101.652(b)(29).",
  }),

  item("LOA-F024", {
    topic: "T03", unit: "T03U1",
    prompt: "Which statement correctly describes what a Texas license holder does NOT owe a person on the other side of a transaction, on the sources held for this course?",
    choices: [
      "No loyalty, no confidentiality, no advocacy, no negotiating help, no advice about whether the deal is good for them, and no duty to search out defects the license holder does not know about — but truthfulness, fairness, accuracy, responsiveness and the specific statutory disclosures are all owed, and § 1101.562 is the Legislature's own portrait of that posture: accurate about size, price and terms, and expressly forbidden to give opinions or advice.",
      "Nothing at all beyond honesty, because 22 TAC § 535.156 provides that the license holder \"represents only the principal and owes a duty of fidelity to such principal\" and everything else in the rule is addressed to the client relationship.",
      "No duty to respond within any period, because 22 TAC § 535.157 names only the license holder's principal and the license holder on the other side; an unrepresented party has no clock running in their favour.",
      "No duty to disclose a known significant defect, because § 1101.652(b)(4) runs to a \"potential buyer,\" and a person who has already made an offer has ceased to be potential and is owed only the seller's own § 5.008 notice.",
    ],
    rationale: "The module states the absences and the presences in the same breath, and both halves matter. The second choice truncates § 535.156, which in the same rule requires honest and fair dealing with all parties and a duty to convey accurate information to members of the public. The third misstates § 535.157, whose three named categories are the principal, a broker or sales agent representing another party, and \"an unrepresented party to a real estate transaction.\" The fourth invents a cut-off in § 1101.652(b)(4) that the subdivision does not contain.",
    teaches: "module-03.md#unit-non-fiduciary-duties",
    source: "Texas Occupations Code §§ 1101.562, 1101.652(b)(4); 22 TAC §§ 535.156, 535.157.",
  }),

  item("LOA-F025", {
    topic: "T03", unit: "T03U2",
    prompt: "A listing agent wants to move a slow buyer along. Which single tactic is consistent with the duty in 22 TAC § 535.156 to deal honestly and fairly with all parties, and what makes the others violations?",
    choices: [
      "Telling the buyer's agent accurately that the seller has instructed that all offers be presented Thursday evening, when that is the instruction the seller actually gave. Inventing a deadline, describing a competing offer's terms inaccurately, and stating a repair history the seller did not give are each misrepresentations of fact, and 22 TAC § 531.3 requires prudence and caution to avoid misrepresentation by acts of commission or omission.",
      "Telling the buyer's agent that another offer is expected before the weekend, on the strength of a colleague's guess that interest is strong, because a statement about what may happen is a prediction rather than an assertion of present fact.",
      "Telling the buyer's agent that the seller will not go below list, when the seller has in fact authorised a lower number, because § 1101.651(d) forbids disclosing that a seller will accept less than the asking price and the statement is therefore compelled.",
      "Telling the buyer directly that they are overpaying, because fairness under § 531.2 requires the license holder to treat other parties to a transaction fairly and a buyer who overpays has not been treated fairly.",
      ],
    rationale: "Fairness is not neutrality and it is not advocacy for the other side. What it requires is that the other side be able to rely on the accuracy of what you tell them and on the regularity of the process you run. The third choice misuses § 1101.651(d): that provision — an intermediary rule taught in Module 06 — forbids disclosing that a party will accept less than the asking price; it does not authorise an affirmative false statement that the seller will not. The fourth confuses fairness with advocacy, which the module rejects directly: over-read the fairness half of § 535.156 and you become a mediator who forgets who is paying for the advocacy.",
    teaches: "module-03.md#unit-general-duties-of-honesty-fairness",
    source: "22 TAC §§ 535.156, 531.2, 531.3; Texas Occupations Code § 1101.651(d).",
  }),

  item("LOA-F026", {
    topic: "T03", unit: "T03U3",
    prompt: "In a transaction the people involved are the license holder's own seller client, the buyer, the buyer's sales agent, the escrow officer and the licensed inspector. Which of them are \"parties\" under § 1101.551(2), and does the answer change what the license holder owes the others?",
    choices: [
      "The seller and the buyer are parties; the buyer's sales agent is not, because the definition excludes a license holder who represents a party, and neither the escrow officer nor the inspector is. But the escrow officer and the inspector are members of the public with whom the license holder deals, so the duty in 22 TAC § 535.156 to convey accurate information reaches them — the vocabulary changes and the exposure does not.",
      "All five are parties, because § 1101.551(2) reaches an \"authorized representative\" of a buyer, seller, landlord or tenant, and each of the three service providers is authorised by one of the two principals to act in the transaction.",
      "Only the seller and the buyer are parties, and the license holder owes the escrow officer and the inspector nothing, because 22 TAC § 535.156 imposes duties toward a principal and toward parties and names no one else.",
      "The seller, the buyer and the buyer's sales agent are parties, because § 1101.551(2)'s exclusion removes only the license holder who represents the party making the statement — that is, the license holder's own position — and not the license holder on the other side.",
    ],
    rationale: "Section 1101.551(2) reaches prospective buyers, sellers, landlords and tenants and those standing in their shoes with legal authority — a trustee, guardian, executor, administrator, receiver or attorney-in-fact — and then removes any \"license holder who represents a party,\" which is a category and not a self-reference. Service providers are outside the definition. The practical point is the one the module presses: they are \"members of the public with whom the license holder deals\" under 22 TAC § 535.156, so telling an appraiser or an escrow officer something the license holder knows to be untrue is a violation even though no \"party\" was misled.",
    teaches: "module-03.md#unit-define-third-partyobligations-to-third-partyduty-to-respond",
    source: "Texas Occupations Code § 1101.551(2); 22 TAC §§ 535.155, 535.156.",
  }),

  item("LOA-F027", {
    topic: "T03", unit: "T03U3",
    prompt: "An unrepresented tenant emails a listing brokerage at 11:00 p.m. on Thursday, December 24 with a question about a property the brokerage has listed for lease. The office is closed December 25 and 26. By the end of which day must the license holder respond under 22 TAC § 535.157, and on what reasoning?",
    choices: [
      "By the end of Saturday, December 26. The rule gives two calendar days and says nothing about business days, office hours or holidays, and the duty runs to \"an unrepresented party to a real estate transaction\" — a response, not a resolution, satisfies it, so an acknowledgement saying where the question has gone and when an answer is expected is enough.",
      "By the end of Monday, December 28, because a rule that sets a period in days is read to exclude days on which the office is closed unless the rule says otherwise.",
      "By the end of Tuesday, December 29, because the two-day period is measured in working days, which is how the Commission measures the trust-money deposit deadline in 22 TAC § 535.146(b).",
      "No deadline applies, because § 535.157 names a principal, a license holder representing another party, and an unrepresented party — and a prospective tenant who has signed nothing is not yet a party to a real estate transaction.",
    ],
    rationale: "The rule says \"within two calendar days,\" and the module treats this as the most commonly misremembered number in the Commission's rules, with the error always running the same way — students convert it to business days and answer late. The Commission knows how to write \"working day\": it did so in § 535.146(b) for the trust-money deposit deadline, and chose \"calendar days\" here. The fourth choice fails on § 1101.551(2), which reaches a *prospective* tenant.",
    teaches: "module-03.md#unit-define-third-partyobligations-to-third-partyduty-to-respond",
    source: "22 TAC §§ 535.157, 535.146(b); Texas Occupations Code § 1101.551(2).",
  }),

  item("LOA-F028", {
    topic: "T03", unit: "T03U4",
    prompt: "A license holder learns from the seller that the septic system failed twice in three years and was repaired without a permit. The license holder says nothing to a potential buyer because disclosing it would cost the seller the sale, and the buyer closes. Which analysis of § 1101.805(e) and DTPA § 17.46(b)(24) is correct?",
    choices: [
      "Section 1101.805(e) does not help. It shields a license holder from liability for a misrepresentation or concealment made by a *party*, and the silence here is the license holder's own conduct. Section 17.46(b)(24) reaches a failure to disclose information concerning goods or services known at the time of the transaction where the failure was intended to induce the consumer into a transaction they would not otherwise have entered — and the intent element is what separates ordinary silence from actionable concealment.",
      "Section 1101.805(e) protects the license holder, because the seller made the original statement about the system and the license holder merely failed to repeat it; the shield covers both an affirmative repetition and a silence about what a party disclosed.",
      "Section 17.46(b)(24) does not reach the conduct, because the exemption for license holders in § 17.49(i) removes claims against a broker or salesperson arising from an act or omission while acting as a broker or salesperson, and an omission is exactly what this is.",
      "Neither provision reaches the conduct, because both are civil-liability provisions and a license holder's exposure for non-disclosure to a person the license holder does not represent is limited to discipline under § 1101.652(b)(4).",
    ],
    rationale: "Section 1101.805(e) is a shield against another person's misrepresentation, not a licence to stay silent about what you know; the module lists \"an agent is never liable for repeating what a seller said\" as the first misstatement to avoid. Section 17.49(i)(2) expressly preserves § 17.46(b)(24) against the broker exemption, which is why the third choice fails. The correct answer also states the cumulative elements accurately — information concerning goods or services, known at the time of the transaction, a failure to disclose, and the intent to induce.",
    teaches: "module-03.md#unit-avoiding-disclosure-and-misrepresentation-problems",
    source: "Texas Occupations Code § 1101.805(d), (e); Business & Commerce Code §§ 17.46(b)(24), 17.49(i).",
  }),

  item("LOA-F029", {
    topic: "T03", unit: "T03U4",
    prompt: "A license holder repeats a seller's statement about a property's drainage. She suspects it is wrong but does not know it. The buyer later sues, and the license holder relies on § 1101.805(e). Which reading of the two conditions is accurate, and what does it leave unresolved?",
    choices: [
      "The two conditions are conjunctive and the statute's word is \"knew\" — not \"should have known\" and not \"had reason to suspect\" — so a license holder who merely suspected has not met the first condition and the shield holds on that claim; but the shield is only against liability for a party's misrepresentation, and § 1101.652(b)(1) reaches negligence, § 531.3 reaches carelessness, and 22 TAC § 535.156 imposes an affirmative duty to convey accurate information to members of the public.",
      "The conditions are alternatives, so knowledge of the falsity alone drops the shield whether or not the license holder disclosed what she knew; a license holder who knew and told the buyer anyway remains exposed.",
      "The first condition is met by constructive knowledge, so a license holder who had reason to suspect the statement was false is treated as having known it, which is why attribution is the recommended practice.",
      "The shield is unavailable in any event, because § 1101.805(b) provides that the section prevails over any other law including common law, which means it displaces the license holder's protections rather than the party's claims.",
    ],
    rationale: "The module lists three misstatements to avoid and this item is built on two of them. The statute says \"knew,\" so the reason-to-suspect standard in the third choice is wrong. The conditions are joined by \"and\" — knowledge of the falsity and a failure to disclose that knowledge — so a license holder who knew and did disclose has satisfied the second condition and remains protected on the section's terms, which is what the second choice gets backwards. And the third misstatement is the one the correct answer preserves: safe from this section, on this claim, is not safe from discipline.",
    teaches: "module-03.md#unit-avoiding-disclosure-and-misrepresentation-problems",
    source: "Texas Occupations Code §§ 1101.805(b), (e), 1101.652(b)(1); 22 TAC §§ 531.3, 535.156.",
  }),

  item("LOA-F030", {
    topic: "T03", unit: "T03U4",
    prompt: "A broker circulates recent comparable sale prices and terms to a prospective seller to help win the listing. Which statement about § 1101.804 is accurate?",
    choices: [
      "The section protects a license holder or nonprofit real estate board or association that provides information about real property sales prices or the terms of a sale for the purpose of facilitating the listing, selling, leasing, financing or appraisal of real property — but the protection carries a closing qualifier that must not be truncated: it does not apply where the disclosure of that information is specifically prohibited by statute.",
      "The section protects the disclosure absolutely, which is why a license holder may share closed-sale figures obtained from any source without regard to any other law.",
      "The section protects only a nonprofit real estate board or association, which is why multiple listing services rather than individual license holders publish comparable sales data.",
      "The section has no application here, because it protects the provision of sales price information only in connection with an appraisal performed under Chapter 1103 and not in connection with a listing presentation.",
    ],
    rationale: "Section 1101.804 protects both a license holder and a nonprofit real estate board or association, and names five purposes — listing, selling, leasing, financing or appraisal. The module's emphasis is on the qualifier at the end: the protection does not extend where disclosure of the information is specifically prohibited by statute, and it warns explicitly against truncating that clause. The second choice does exactly that.",
    teaches: "module-03.md#unit-avoiding-disclosure-and-misrepresentation-problems",
    source: "Texas Occupations Code § 1101.804.",
  }),

  item("LOA-F031", {
    topic: "T03", unit: "T03U5",
    prompt: "Which transfer requires a Property Code § 5.008 seller's disclosure notice, and what in subsection (a) or (e) decides it?",
    choices: [
      "A resale of an occupied single-family house by its owner. Subsection (a) reaches \"residential real property comprising not more than one dwelling unit located in this state,\" so a duplex is outside it; subsection (e)(10) exempts a transfer of newly constructed property never occupied; and subsection (e)(5) exempts a transfer by a fiduciary administering a decedent's estate.",
      "A builder's sale of a house that has never been occupied, because subsection (a) reaches residential real property comprising not more than one dwelling unit and states no exception for new construction; the exemptions in subsection (e) are limited to involuntary transfers.",
      "An executor's sale of a decedent's house, because the exemption in subsection (e) for a fiduciary applies only to a trustee in bankruptcy and a mortgagee that took the property at foreclosure.",
      "A sale of a tenanted duplex, because subsection (a)'s phrase \"not more than one dwelling unit\" describes the unit being conveyed rather than the property, and each side of a duplex is one dwelling unit.",
    ],
    rationale: "The scope clause has three limits — residential, not more than one dwelling unit, located in this state — and a duplex comprises two dwelling units, which is what defeats the fourth choice. The exemptions cluster around transferors with no meaningful personal knowledge of the property together with intra-family transfers, unoccupied new construction and the five-percent-improvements test; subdivision (10) is why the builder delivers no notice and subdivision (5) is why the executor does not. What does not change is that the exemption is from § 5.008 and not from § 1101.652(b)(4).",
    teaches: "module-03.md#unit-section-5008-of-the-texas-property-code-sellers-disclosure",
    source: "Texas Property Code § 5.008(a), (e); Texas Occupations Code § 1101.652(b)(4).",
  }),

  item("LOA-F032", {
    topic: "T03", unit: "T03U5",
    prompt: "Which statement about the § 5.008(f) termination right, and about how § 5.008 compares with Property Code § 5.012, is correct?",
    choices: [
      "The notice is due on or before the effective date of the executory contract; if the contract is entered without it, the purchaser may terminate \"for any reason\" within seven days after receiving the notice, so the clock runs from receipt and a seller who never delivers never starts it. Section 5.008 states no damages remedy and — unlike § 5.012(e), which makes termination the purchaser's exclusive remedy for that section's notice — contains no exclusivity clause.",
      "The seven days run from the effective date of the contract, so a purchaser who receives a late notice on day twelve has already lost the right; and because § 5.008 states no damages remedy, termination within that window is the purchaser's exclusive remedy for the seller's failure.",
      "The purchaser may terminate only for a reason disclosed by the notice itself, which is why the right is described as running from receipt — the period exists so the purchaser can read the document and react to its contents.",
      "The notice is due at closing, and the seven-day right runs from closing; § 5.012(e) states the same rule for the property owners' association notice, which is why the two statutes are read together.",
    ],
    rationale: "Subsection (f) sets delivery on or before the effective date of the executory contract binding the purchaser and gives a termination right \"for any reason\" within seven days after receiving the notice. Three points the module presses: the clock starts on receipt, so a never-delivered notice never starts it; \"for any reason\" is unconditional, so the buyer need not point to anything in the document; and § 5.008 states no damages remedy and no exclusivity clause, which is exactly what distinguishes it from § 5.012(e).",
    teaches: "module-03.md#unit-section-5008-of-the-texas-property-code-sellers-disclosure",
    source: "Texas Property Code §§ 5.008(f), 5.012(e).",
  }),

  item("LOA-F033", {
    topic: "T03", unit: "T03U6",
    prompt: "An unrepresented buyer asks a license holder point blank whether a previous occupant of the house died there. The license holder knows a prior occupant died of natural causes in an upstairs bedroom. What does § 1101.556 permit and what does it not?",
    choices: [
      "It relieves the license holder of any duty to inquire about, disclose or release the information, so declining to answer and explaining that Texas law imposes no such duty is available, as is answering truthfully with the seller's authorisation — but the section removes a duty and does not create a privilege to deceive, so saying \"no\" would be dishonest conduct under § 1101.652(b)(2), inaccurate information to a member of the public under 22 TAC § 535.156, and misrepresentation by an act of commission under 22 TAC § 531.3.",
      "It requires the license holder to answer truthfully once the question is asked, because the relief in § 1101.556 extends only to volunteering the information and the section's opening words, \"Notwithstanding other law,\" address the seller's notice rather than a direct question.",
      "It permits the license holder to answer \"no,\" because a statement that the license holder is not required to disclose cannot be a misrepresentation, and § 1101.802 supplies immunity from civil and criminal liability for the answer.",
      "It has no application, because the section covers only a prior occupant's AIDS or HIV status; deaths on the property are addressed solely by Property Code § 5.008(c), which imposes its duty on the seller and not on the license holder.",
    ],
    rationale: "Section 1101.556 has two subdivisions — occupant health status in specific AIDS/HIV terms, and a death by natural causes, suicide or accident unrelated to the condition of the property — so the fourth choice is wrong on the section's scope. The module's fourth qualifier is the operative one here: relief from a duty to disclose is not permission to lie. The third choice also misuses § 1101.802, whose immunity from civil and criminal liability covers a failure to inquire, disclose or release information about the AIDS/HIV category only, and does not immunise an affirmative false answer about anything.",
    teaches: "module-03.md#unit-stigmatized-properties",
    source: "Texas Occupations Code §§ 1101.556, 1101.802, 1101.652(b)(2); Texas Property Code § 5.008(c); 22 TAC §§ 531.3, 535.156.",
  }),

  /* ══ T04 Seller Agency — 120 prescribed minutes ════════════════════════════════════════════ */

  item("LOA-F034", {
    topic: "T04", unit: "T04U1",
    prompt: "A student is taught that \"the statute of frauds is what requires a listing to be in writing.\" On the two statutes this course reads side by side, what is the accurate account?",
    choices: [
      "Business & Commerce Code § 26.01(b) lists eight categories, and its only commission provision — subdivision (7) — reaches a promise to pay a commission for the sale or purchase of an oil or gas mining lease, an oil or gas royalty, minerals or a mineral interest. It does not list a promise to pay a commission on an ordinary house. The writing requirement for that promise is Occupations Code § 1101.806(c), which bars an action to recover a commission unless the promise or agreement, or a memorandum, is in writing and signed by the party against whom the action is brought.",
      "Section 26.01(b) reaches a promise to pay a commission on the sale of any real estate, and § 1101.806(c) restates the same requirement for license holders, so either statute supplies the writing requirement and the distinction is academic.",
      "Section 26.01(b) supplies the requirement because a listing is \"a contract for the sale of real estate\" within its list, and § 1101.806(c) governs only the sharing of compensation between brokers.",
      "Neither statute requires it. Section 1101.806(c) is an evidentiary preference rather than a bar, so an oral listing may be proved by other evidence and weighed against the seller's denial.",
    ],
    rationale: "The module makes this the difference between a conclusion and its authority. Section 26.01(b)(7)'s four subparagraphs are all mineral-related; an ordinary residential commission promise is not on the list. Section 1101.806(c) is what does the work, and its effect is a bar rather than a preference — a person \"may not maintain an action\" on an unwritten commission promise, so the fourth choice fails. The third confuses the listing (an employment contract) with a contract for the sale of real estate; and § 1101.806(a)(1) puts compensation-sharing agreements among license holders outside the section entirely, which is the reverse of what the third choice says.",
    teaches: "module-04.md#unit-listing-agreements",
    source: "Business & Commerce Code § 26.01(a), (b); Texas Occupations Code § 1101.806(a), (c).",
  }),

  item("LOA-F035", {
    topic: "T04", unit: "T04U1",
    prompt: "A listing broker never spoke to the buyer in a transaction; the buyer was represented throughout by another brokerage. At closing the listing broker learns that no one gave the buyer the § 1101.555 written advice. What does § 1101.806(d) do to the listing broker's fee?",
    choices: [
      "Section 1101.806(d) provides that a license holder who fails to advise a buyer as provided by § 1101.555 may not receive payment of or recover any commission agreed to be paid on the sale — so the consequence attaches to the license holder who failed to give the advice, and the module's point for a listing broker is that a fee can be defeated by a missing written advisory in the transaction file even where the broker never dealt with the buyer.",
      "Nothing. Subsection (d) conditions only the fee of the license holder representing the buyer, because § 1101.555 requires advice to \"each buyer\" and a listing broker owes no duty to a represented buyer.",
      "Nothing, because § 1101.806(a)(1) removes agreements to share compensation among license holders from the section, and the listing broker's fee reaches it through the cooperating brokerage.",
      "It defeats the fee only if the Commission has first found a violation of § 1101.652(b)(29); subsection (d) is a collateral consequence of discipline rather than a free-standing bar.",
    ],
    rationale: "Subsection (d) is a bar on payment and recovery attached directly to the failure, and it operates without a Commission proceeding — the same failure is separately a disciplinary ground under § 1101.652(b)(29), but the two are independent, which defeats the fourth choice. Section 1101.806(a)(1) keeps compensation-sharing agreements among license holders outside the section; it does not launder a fee past subsection (d). The module states the practical point precisely: a broker who never speaks to the buyer at all still has a fee that can be defeated by a missing written advisory in the transaction file.",
    teaches: "module-04.md#unit-listing-agreements",
    source: "Texas Occupations Code §§ 1101.806(a), (d), 1101.555, 1101.652(b)(29).",
  }),

  item("LOA-F036", {
    topic: "T04", unit: "T04U1",
    prompt: "A seller lists at a total compensation of 6 percent of the sales price. The house sells for $402,500. The written cooperating-broker agreement allocates 2.5 percent of the sales price to the cooperating brokerage, and the listing brokerage's written policy pays its sponsored sales agent 70 percent of what the brokerage retains. What are the four figures, and what does § 1101.651(b) say about how the sales agent's share may be paid? (Illustrative figures only; no rate here is standard, customary or required.)",
    choices: [
      "Total $24,150; cooperating brokerage $10,062.50; listing brokerage retains $14,087.50; the sales agent's share is $9,861.25 and the broker keeps $4,226.25 — and § 1101.651(b) permits the sales agent to accept that compensation only from the sponsoring broker or the broker who was sponsoring the sales agent when the compensation was earned, so a cheque cut by the title company directly to the sales agent is not permitted.",
      "Total $24,150; cooperating brokerage $10,062.50; listing brokerage retains $14,087.50; the sales agent's share is $9,861.25 — and the title company may pay the sales agent directly at closing provided the sponsoring broker consents in writing, which is what 22 TAC § 535.3 authorises.",
      "Total $24,150; cooperating brokerage $6,037.50, being 2.5 percent of the total compensation; listing brokerage retains $18,112.50; the sales agent's share is $12,678.75 and the broker keeps $5,433.75.",
      "Total $24,150; cooperating brokerage $10,062.50; listing brokerage retains $14,087.50; the sales agent's share is $4,226.25, because the 70 percent policy figure is the brokerage's retention and the balance is the agent's.",
    ],
    rationale: "Six percent of $402,500 is $24,150. The cooperating share is 2.5 percent of the sales price — not of the commission — so $402,500 × 0.025 = $10,062.50, and $24,150 − $10,062.50 = $14,087.50 retained. Seventy percent of $14,087.50 is $9,861.25 to the sales agent, leaving $4,226.25, and the parts sum back to $24,150. On the payment channel, § 1101.651(b) names the sponsoring broker or the broker who was sponsoring the sales agent when the compensation was earned; 22 TAC § 535.3 states the same requirement in terms of the sponsoring broker's written consent and does not authorise a direct payment from a title company, which is what the second choice invents.",
    teaches: "module-04.md#unit-listing-agreements",
    source: "Texas Occupations Code § 1101.651(b), (c); 22 TAC § 535.3. Dollar figures are illustrative.",
  }),

  item("LOA-F037", {
    topic: "T04", unit: "T04U2",
    prompt: "A license holder representing a buyer telephones the owner of a house that is under an outstanding written exclusive listing with another broker and asks for the chance to present a listing proposal after the current listing expires. Applying 22 TAC § 535.153, what is the position?",
    choices: [
      "Permitted. The rule states that although a license holder, including one acting as agent for a prospective buyer or tenant, may not attempt to negotiate a sale, exchange, lease or rental of property under exclusive listing with another broker, \"the Act does not prohibit a license holder from soliciting a listing from the owner while the owner's property is subject to an exclusive listing with another broker.\" Solicitation of a future engagement is not negotiation of the present sale.",
      "Prohibited, because the rule extends § 1101.652(b)(22) to a license holder acting as a buyer's agent, and a call to the owner about the property while the listing is outstanding is within that extension whatever its subject.",
      "Permitted only if the license holder first obtains the listing broker's consent and sends the listing broker a copy of the proposal, which are two of the three conditions in § 1101.557(c)(3).",
      "Prohibited by the association code of ethics that governs the conduct, although the Act itself is silent — which is why the rule addresses only negotiation.",
    ],
    rationale: "The rule does two things in one sentence: it confirms that a license holder on the buyer's side is still a license holder for the prohibition's purposes, and it expressly permits soliciting the listing itself. The third choice imports the offer-delivery safe harbour in § 1101.557(c)(3), which governs the sole delivery of an offer and has nothing to do with a listing solicitation. The fourth is wrong on two counts: no association code was held for this course, so none is taught, and the held rule answers the legal question directly.",
    teaches: "module-04.md#unit-exclusive-seller-agency",
    source: "22 TAC § 535.153; Texas Occupations Code §§ 1101.652(b)(22), 1101.557(c)(3).",
  }),

  item("LOA-F038", {
    topic: "T04", unit: "T04U2",
    prompt: "Which element of § 1101.652(b)(22) is missing where a cooperating license holder negotiates the purchase of a house directly with an owner whose exclusive listing with another broker expired six days earlier, and the cooperating license holder is unaware that it expired?",
    choices: [
      "The requirement that the contract granting exclusive agency to another broker be *outstanding* — a listing that has expired grants nothing today, so the subdivision is not engaged regardless of what the license holder believed.",
      "The knowledge element — the license holder did not know the listing had expired, so the license holder lacked knowledge that the owner was a party to the contract, which is the element the subdivision requires.",
      "The requirement that the conduct be negotiation rather than solicitation, because a direct approach to an owner about buying the property is a solicitation of business under 22 TAC § 535.153.",
      "None. Every element is satisfied, because the subdivision reaches a license holder who negotiates with an owner in connection with the transaction, and the six-day gap is within the protection period the subdivision allows a former listing broker.",
    ],
    rationale: "The subdivision requires an *outstanding* written contract granting exclusive agency to another broker in connection with the transaction, and an expired listing is not outstanding — the module lists that qualifier expressly. The second choice reaches the right result by the wrong route: the knowledge element is about knowing the person is a party to such a contract, and here there is no such contract to know about. The fourth invents a protection period the subdivision does not contain.",
    teaches: "module-04.md#unit-exclusive-seller-agency",
    source: "Texas Occupations Code § 1101.652(b)(21), (22).",
  }),

  item("LOA-F039", {
    topic: "T04", unit: "T04U3",
    prompt: "At a listing appointment a seller asks what representation actually buys her that a flat-fee listing service does not. Which answer is both accurate and properly bounded on the held sources?",
    choices: [
      "It buys enforceable obligations: a fiduciary under 22 TAC § 531.2 whose broker owes \"the highest fiduciary obligation to the principal\" under § 535.2(b); every offer presented under § 1101.557(b) and 22 TAC § 535.156(a) unless she agrees in writing that offers need not be submitted after she is under contract; an affirmative duty to keep her informed at all times and a two-calendar-day response duty under §§ 535.156(c) and 535.157; and a broker obliged under 22 TAC § 535.16 to negotiate the best possible transaction for her. It does not buy a guaranteed price or outcome, does not make the license holder her lawyer, and does not entitle her to have a known significant defect concealed.",
      "It buys the same list of obligations plus a guarantee that the license holder will obtain the highest price the market will bear, which is what 22 TAC § 535.16's obligation to negotiate the best possible transaction means in practice.",
      "It buys legal representation in the transaction, which is why 22 TAC § 537.11(e) requires the license holder to review unusual instruments before execution rather than sending the seller to an attorney.",
      "It buys confidentiality without exception, so the seller may instruct the license holder to say nothing about the condition of the property and the license holder must comply under § 1101.651(d)(3).",
    ],
    rationale: "The unit is deliberately built as an inventory of sourced entitlements plus an honest counterweight. The second choice converts an obligation to negotiate into a guarantee of result, which no held source promises. The third inverts § 537.11(e), which requires the license holder to advise the principals to consult an attorney when a transaction involves unusual matters or an instrument that must be acknowledged and filed — and § 537.11(b)(7) forbids discouraging a principal from employing an attorney. The fourth truncates § 1101.651(d)(3), whose prohibition yields where the information materially relates to the condition of the property.",
    teaches: "module-04.md#unit-benefits-of-seller-agency-relationships",
    source: "Texas Occupations Code §§ 1101.557(b), 1101.651(d)(3); 22 TAC §§ 531.2, 535.2(b), 535.16, 535.156, 535.157, 537.11(b)(7), (e).",
  }),

  item("LOA-F040", {
    topic: "T04", unit: "T04U4",
    prompt: "Which statement about the structural concept of subagency, and about what Texas text now governs the outcomes it used to produce, is accurate and properly limited?",
    choices: [
      "In the general agency sense a subagent is an agent of an agent — a cooperating broker working for the seller through the listing broker and owing the seller the duties the listing broker owes — but the common-law doctrine, its elements, and the authority under which an agent may appoint a subagent were not held for this course and are not stated as Texas law; what is held is § 1101.805, which prevails over other law including common law and relieves a party of liability for a license holder's misrepresentation unless the party both knew of the falsity and failed to disclose that knowledge.",
      "A subagent is an agent of an agent, and Texas codified the doctrine at § 1101.805(f), which is why that subsection had to be repealed effective January 1, 2026 in order to end the practice.",
      "A subagent is a cooperating broker who represents the buyer while being paid out of the seller's commission, which is why the repeal of the two TRELA references means a cooperating broker is now presumed to represent the buyer.",
      "The concept has no Texas consequence at all, because § 1101.805(c) provides that the section does not diminish a broker's responsibility for the acts or omissions of a sales agent associated with or acting for the broker, and a cooperating broker is not the listing broker's sales agent.",
    ],
    rationale: "The module separates three things and refuses to blur them: the structural concept, the practice history (which is not law and is cited to nothing), and the Texas provisions that govern outcomes. The held statute records that § 1101.002(8) and § 1101.805(f) were repealed but does not preserve their text, so the second choice states content the sources do not supply. The third confuses subagency with buyer representation — the whole point of the old model was that the cooperating broker's loyalty ran to the seller — and no held source creates a presumption of representation. The fourth quotes § 1101.805(c) accurately and draws a conclusion it does not support.",
    teaches: "module-04.md#unit-sub-agency",
    source: "Texas Occupations Code §§ 1101.805(b), (c), (d), 1101.551(2); §§ 1101.002(8) and 1101.805(f) each shown as repealed effective January 1, 2026.",
  }),

  item("LOA-F041", {
    topic: "T04", unit: "T04U4",
    prompt: "A cooperating broker's fee will be paid out of the compensation the seller agreed to pay the listing broker. A colleague says that settles it: the cooperating broker represents the seller. Which held provisions show that compensation does not answer the representation question?",
    choices: [
      "Section 1101.557(a) ties agency to representing a party or listing under an exclusive agreement and mentions compensation not at all; § 1101.559(a)(2) requires written intermediary consent to state \"the source of any expected compensation to the broker,\" which would be nothing to disclose if payment settled representation; and § 1101.563(c) puts representation status and the amount or rate of compensation on two separate lines of the same document.",
      "Section 1101.651(a) settles it the other way: because a broker may compensate only a license holder for performing an act of a broker, the broker who pays is the broker whose client's transaction the payment arises from, and representation follows the payment.",
      "Section 1101.805(d) settles it, because a party is liable for a license holder's misrepresentation where the party knew of the falsity and failed to disclose it — which can only be true where the license holder acted for that party, and the party paying is the party acting.",
      "No held provision addresses the question, so a Texas license holder must look to the cooperating brokerage's own written agreement with the buyer and to the multiple listing service's participation rules.",
    ],
    rationale: "The module treats \"whoever pays is whom you represent\" as the most durable confusion left over from the subagency era and answers it with three provisions, all of which keep the two facts apart. The fourth choice is half right and half wrong: the cooperating brokerage's own written agreement with the buyer is exactly where that relationship is established — since January 1, 2026 it is mandatory in residential transactions under § 1101.563(b) — but no multiple listing service's participation rules were held for this course, and the held statute does address the question.",
    teaches: "module-04.md#unit-sub-agency",
    source: "Texas Occupations Code §§ 1101.557(a), 1101.559(a)(2), 1101.563(b), (c).",
  }),

  item("LOA-F042", {
    topic: "T04", unit: "T04U5",
    prompt: "A listing agent has emailed an unrepresented buyer the IABS notice. Over three weekends the buyer refers to the listing agent as \"my agent,\" asks her what to offer, and takes her advice. The listing agent says nothing to correct it. Which provision does that reach, and why is the emailed notice not an answer?",
    choices: [
      "Section 1101.652(b)(7), which reaches a license holder who fails to make clear to all parties to a real estate transaction the party for whom the license holder is acting: the obligation runs to all parties rather than to the client alone, and the standard is that the fact be made *clear*, not mentioned once and filed.",
      "Section 1101.652(b)(22), because the listing agent has negotiated with a buyer who believes she is represented, and a belief in representation is the practical equivalent of the outstanding written contract the subdivision names.",
      "Section 1101.558(b-1), because a license holder who has delivered the written notice but whose conduct contradicts it has not provided the notice at all, and the duty is a continuing one until the transaction closes.",
      "Nothing, provided the emailed notice complied with 22 TAC § 531.20 as to delivery method: the notice describes the basic obligations a broker has to a party the broker does not represent, and delivering it discharges the license holder's duty to make representation status clear.",
    ],
    rationale: "The module states the breadth of the subdivision directly: all parties, and \"make clear\" rather than \"mention once.\" A license holder who lets an unrepresented buyer spend three weekends believing \"my agent\" is looking out for them has failed § 1101.652(b)(7) even if an IABS was emailed at some point — which is exactly why the fourth choice is the error the item is built to catch. Section 1101.558(b-1) is a one-time delivery duty at first substantive communication, not a continuing one.",
    teaches: "module-04.md#unit-disclosure-issues",
    source: "Texas Occupations Code §§ 1101.652(b)(7), 1101.558(b), (b-1); 22 TAC § 531.20.",
  }),

  item("LOA-F043", {
    topic: "T04", unit: "T04U5",
    prompt: "Which pairing of a money disclosure with the subdivision of § 1101.652(b) that reaches it is correct?",
    choices: [
      "Receiving compensation from more than one party without the full knowledge and consent of all parties is (b)(8); taking an undisclosed commission, rebate or direct profit on an expenditure made for a principal is (b)(13); acting in a dual capacity as broker and undisclosed principal is (b)(16).",
      "Receiving compensation from more than one party without the full knowledge and consent of all parties is (b)(13); an undisclosed rebate on an expenditure made for a principal is (b)(16); acting as broker and undisclosed principal is (b)(8).",
      "All three are reached by (b)(2) as conduct demonstrating untrustworthiness; § 1101.652(b) contains no subdivision addressed specifically to compensation, which is why the Commission relies on the general ground.",
      "Receiving compensation from more than one party is (b)(11), dividing a fee with an unlicensed person is (b)(8), and an undisclosed profit on a principal's expenditure is (b)(30).",
    ],
    rationale: "The module lists these three as the money disclosures a listing broker can trip in a single transaction and gives the subdivisions: (8) compensation from more than one party without the full knowledge and consent of all parties; (13) an undisclosed commission, rebate or direct profit on an expenditure made for a principal — the marketing vendor who quietly returns a share of what the seller paid; and (16) acting in a dual capacity as broker and undisclosed principal. Subdivision (b)(11) is paying or dividing a fee with an unlicensed person, and (b)(30) is the escrow-deposit ground, so the fourth choice misfiles both.",
    teaches: "module-04.md#unit-disclosure-issues",
    source: "Texas Occupations Code § 1101.652(b)(2), (8), (11), (13), (16), (30).",
  }),

  /* ══ T05 Buyer Agency — 150 prescribed minutes ═════════════════════════════════════════════ */

  item("LOA-F044", {
    topic: "T05", unit: "T05U1",
    prompt: "Which property is inside the definition of \"residential real property\" in § 1101.563(a), and which word or phrase in the definition decides it?",
    choices: [
      "A unit in a multiunit residential structure where title to the individual unit is transferred to the unit owner under a condominium or cooperative system — subdivision (3) turns on the transfer of title to an individual unit, which is why a fifty-unit apartment building held in one ownership is outside the definition, and why raw acreage and a retail strip centre are outside it too.",
      "A ten-acre unimproved tract bought for a future homesite, because the definition reaches property acquired for residential use and subdivision (1)'s \"single-family house\" describes the intended use rather than an existing improvement.",
      "A sixty-unit apartment building held in single ownership, because subdivision (3) reaches \"a unit in a multiunit residential structure\" and each apartment is such a unit.",
      "A warehouse leased to a residential moving company, because the definition is concerned with the character of the occupancy rather than the character of the structure.",
    ],
    rationale: "Subsection (a) supplies three categories and only three: a single-family house; a duplex, triplex or quadraplex; and a unit in a multiunit residential structure in which title to an individual unit is transferred to the owner of the unit under a condominium or cooperative system. The words that defeat the third choice are the ones about title transfer — an apartment building in single ownership transfers no title to unit owners. Unimproved land is not a single-family house, so the second choice fails on the text as well.",
    teaches: "module-05.md#unit-buyer-representation-agreement",
    source: "Texas Occupations Code § 1101.563(a).",
  }),

  item("LOA-F045", {
    topic: "T05", unit: "T05U1",
    prompt: "A license holder has a signed written agreement with a buyer that names one specific address in Frisco. The buyer then asks to see a second house. What does § 1101.563(b) require, and what in its wording decides it?",
    choices: [
      "A written agreement covering that showing too. The trigger reads \"showing any residential real property to the prospective buyer\" — any, not the — so an agreement drawn around one door does not cover a second one, and the agreement should be written to cover the engagement rather than a single address.",
      "Nothing further. The first agreement satisfies § 1101.563(b) because the section's duty attaches once, at the outset of the relationship with that prospective buyer, and is discharged by the first compliant writing.",
      "An oral extension of the existing agreement, confirmed in the file. Section 1101.563(b) requires a writing only for the initial engagement; subsequent showings within the same engagement may be documented by the license holder's own record.",
      "Nothing further, provided the second house is presented as a comparable rather than as a property the buyer might purchase, because § 1101.563(b) is triggered by showing property the buyer is considering.",
    ],
    rationale: "The module isolates the exact wording: \"showing any residential real property,\" not \"showing the residential real property.\" Showing a second house is showing residential real property to a prospective buyer, so a written agreement covering it is required. The remedy is a drafting habit — write the agreement to cover the engagement, not one door. The fourth choice invents a distinction between showing a property for purchase and showing it as a comparable that the subsection does not make.",
    teaches: "module-05.md#unit-buyer-representation-agreement",
    source: "Texas Occupations Code § 1101.563(b); § 1101.652(b)(34).",
  }),

  item("LOA-F046", {
    topic: "T05", unit: "T05U1",
    prompt: "A brokerage proposes a showing-only agreement under § 1101.562 that is exclusive to the brokerage and runs for thirty days. What does § 1101.563(e) permit, and what is the effect of the buyer later asking for an offer to be written?",
    choices: [
      "Neither term is permitted: subsection (e) provides that such an agreement may not be an exclusive agreement with the license holder and may not state a termination date more than fourteen days from the date it is entered into. Fourteen days is a ceiling rather than a default, so a shorter term is lawful; and under subsection (d) the license holder must enter into a separate agreement once additional real estate brokerage acts are to be provided after the showing.",
      "Both terms are permitted so long as the agreement discloses that compensation is negotiable, because subsection (e)'s limits apply to agreements under which the license holder represents the buyer, and a showing-only agreement is by definition a non-representation arrangement.",
      "The exclusivity is permitted and the thirty-day term is not; subsection (e) caps the term at fourteen days but leaves exclusivity to the parties, which is why subsection (c)(1)(C) requires the agreement to state whether it is exclusive or non-exclusive.",
      "Both terms are permitted, and the showing-only agreement automatically becomes a representation agreement when the license holder writes an offer, because § 1101.562(a)(4) forbids the non-representation posture once another act of brokerage is performed.",
    ],
    rationale: "Subsection (e) states two hard limits and both are engaged here. Fourteen days is a maximum, not a default — nothing stops a one-day or three-day term for a single Saturday of showings. Subsection (d) is the trapdoor: the showing-only agreement does not silently upgrade itself; a separate agreement is required once additional brokerage acts are to be provided. The fourth choice gets the consequence of § 1101.562(a)(4) right — performing another act of brokerage defeats the non-representation posture — and then draws the wrong conclusion, since nothing converts one agreement into another.",
    teaches: "module-05.md#unit-buyer-representation-agreement",
    source: "Texas Occupations Code §§ 1101.563(c), (d), (e), 1101.562(a).",
  }),

  item("LOA-F047", {
    topic: "T05", unit: "T05U2",
    prompt: "A first-year suburban resale agent is asked to represent a buyer purchasing a 300-acre place with a producing well and an existing grazing lease. What do the competence provisions require, and what does 22 TAC § 535.2 add?",
    choices: [
      "22 TAC § 531.4 requires the license holder to be knowledgeable and competent, informed on local market conditions in the geographic area where services are provided to a client, and \"educated in the characteristics involved in the specific type of real estate being brokered for others,\" and § 1101.652(b)(1) reaches acting negligently or incompetently — so the choices are to decline or to bring in someone competent with the broker's authorisation; and § 535.2 separately requires the broker's written policies to ensure a sales agent performing a type of brokerage activity for the first three times receives coaching and assistance from an experienced license holder competent for that activity.",
      "Nothing prevents the engagement, because 22 TAC § 531.4 is a canon of aspiration rather than an enforceable rule, and competence is measured by the licence the State has already issued.",
      "The license holder must decline, because 22 TAC § 535.2 forbids a sponsored sales agent to perform a type of brokerage activity the agent has not previously performed until the broker has delegated the agent as a supervisor in writing.",
      "The license holder may accept without further steps provided the buyer signs a limited-service agreement narrowing the scope, because § 1101.563(c)(1)(A) lets the agreement state the services to be provided and a narrower scope carries a correspondingly narrower standard.",
      ],
    rationale: "The module treats competence as a threshold rather than an aspiration and gives both the canon and the statutory ground. The fourth choice states the error TREC's own guidance forecloses: a limited-service agreement narrows the scope of the engagement but cannot waive the minimum duties owed to clients — you may agree to do less, not to do it worse. The third choice misuses § 535.2: the written-delegation requirement concerns a license holder who leads, supervises, directs or manages a team, while the first-three-times provision is about coaching, and neither is a prohibition on accepting the engagement.",
    teaches: "module-05.md#unit-deciding-to-represent-the-buyer",
    source: "22 TAC §§ 531.4, 535.2; Texas Occupations Code §§ 1101.652(b)(1), 1101.563(c)(1)(A).",
  }),

  item("LOA-F048", {
    topic: "T05", unit: "T05U2",
    prompt: "At the engagement meeting a prospective buyer asks what will happen if she later wants to buy one of the brokerage's own listings. Which answer states the consequence accurately and honestly on the held sections?",
    choices: [
      "If the broker agrees to represent both sides, § 1101.561(b) makes the intermediary posture compulsory; the broker's advocacy then narrows to what § 1101.651(d) permits; and if both parties' written consents authorise appointments and the broker makes them under § 1101.560 with written notice to all parties, she may still receive opinions and advice from the associate appointed to her. A buyer who does not want that outcome should be told plainly that a brokerage holding no listings, or a firm that does not take in-house transactions, is an alternative.",
      "Nothing changes, because the buyer's representation agreement was signed first and § 1101.557(a) fixes the broker as her agent for the duration of the engagement; the listing side would be handled by a different sales agent under the firm's internal information barrier.",
      "The broker would have to withdraw from one side, because a broker may not represent both a buyer and a seller in the same transaction and the intermediary provisions apply only where two separate brokerages cooperate.",
      "The broker would become a disclosed dual agent on the written consent of both parties, and the buyer would keep the same advocacy she has now provided the consent recites the conduct § 1101.651(d) prohibits.",
    ],
    rationale: "The module supplies the honest presentation of this decision, and the point is that intermediary status follows from the fact of representing both rather than from anyone's preference — § 1101.561(b) uses \"must.\" What appointments buy is advice: § 1101.560(c) permits an appointed license holder to provide opinions and advice during negotiations to the party to whom she is appointed, inside the same confidentiality cage § 1101.651(d) creates. The second choice invents a first-in-time rule the statute does not contain, and an internal information barrier is practice rather than law. The third overstates the prohibition; the fourth restores a capacity Texas law does not create.",
    teaches: "module-05.md#unit-deciding-to-represent-the-buyer",
    source: "Texas Occupations Code §§ 1101.557(a), 1101.559(a), (b), 1101.560, 1101.561(b), 1101.651(d).",
  }),

  item("LOA-F049", {
    topic: "T05", unit: "T05U3",
    prompt: "A showing agent from a brokerage other than the listing brokerage is hosting an open house at a residential listing. A visitor arrives who holds a written representation agreement with a third brokerage. What must the showing agent do before the visitor views the property?",
    choices: [
      "Provide the IABS notice under § 1101.558(b-1) and enter into a written agreement described by § 1101.563(c) with the visitor. Section 1101.562(b)(2) is a free-standing gate on showing without representation and is not relieved by the § 1101.558(c)(3) open-house exception, which by its terms relieves only the notice required by subsection (b-1); and the duty is keyed to what this license holder is doing, not to what some other broker has already signed.",
      "Nothing, because § 1101.558(c)(3) relieves the notice where the communication occurs at a property held open for any prospective buyer or tenant and concerns that property, and § 1101.563 does not apply to a buyer already represented under a written agreement with another broker.",
      "Disclose orally that the showing agent represents the owner, which is what § 1101.562(b)(1) requires of an agent hosting an open house.",
      "Obtain the listing broker's written consent under § 1101.557(c)(3), because a showing agent hosting another brokerage's open house is delivering the listing broker's property to a prospective buyer.",
    ],
    rationale: "The interaction is the point. The § 1101.558(c) exceptions relieve only \"the notice required by Subsection (b-1)\"; § 1101.562(b) imposes its own condition on showing without representation, and for a broker who does not represent the owner that condition is delivery of the (b-1) notice. TREC's guidance reads it the same way and adds that this is true even where the prospective buyer has a written representation agreement with another broker. The third choice would be right for an agent from the *listing* brokerage; this agent is not. Section 1101.557(c)(3) is the offer-delivery safe harbour and is not engaged.",
    teaches: "module-05.md#unit-the-creation-of-buyer-agency",
    source: "Texas Occupations Code §§ 1101.562(b), 1101.558(b), (b-1), (c)(3), 1101.563(b), (c); TREC guidance on the 2026 changes, identified in the curriculum as guidance rather than law.",
  }),

  item("LOA-F050", {
    topic: "T05", unit: "T05U3",
    prompt: "Under a § 1101.562 showing, which single statement to the visitor is within what subsection (c) permits, and why are the others outside it?",
    choices: [
      "\"The listed price is $389,900 and the seller has asked for a fifteen-day close with a leaseback.\" Subsection (c) permits a broker to *confirm* information regarding the size, price and terms of the real property available for sale or lease; the verb is confirm rather than evaluate, and the other statements are opinions or advice about the property or about real estate transactions in general, which subsection (a)(3) forbids.",
      "\"At this price the house is a good buy compared with the two that sold on this street last month.\" A comparison drawn from public sale prices is a confirmation of price information rather than an opinion, which is why subsection (c) names price among the three permitted categories.",
      "\"You should get a survey before you go under contract.\" Procedural guidance is not an opinion about the real property, and subsection (a)(3) reaches only opinions regarding the property itself.",
      "\"The market has been slowing, so you could probably get this for less.\" A statement about market conditions is not about this property, and the broker's obligation to be informed on local market conditions under 22 TAC § 531.4 makes it a permitted confirmation.",
      ],
    rationale: "Subsection (c) is short and its verb matters: a broker showing property under the section may *confirm* information regarding the size, price and terms. Confirming that the price is $389,900 is permitted; saying the price is fair is not. Subsection (a)(3) reaches opinions or advice \"regarding the real property or real estate transactions in general,\" and the module names the second phrase as broader than students expect — advice to get a survey and a statement that the market is slowing so the buyer could probably pay less are both squarely inside it.",
    teaches: "module-05.md#unit-the-creation-of-buyer-agency",
    source: "Texas Occupations Code § 1101.562(a)(3), (a)(4), (c); 22 TAC § 531.4.",
  }),

  item("LOA-F051", {
    topic: "T05", unit: "T05U4",
    prompt: "A prospect asks what a represented buyer learns that an unrepresented one does not. Which statement draws the line where the held sources draw it?",
    choices: [
      "A known significant defect must be disclosed either way, because § 1101.652(b)(3) and (b)(4) run to a \"potential buyer\" and 22 TAC § 535.156 imposes a duty to convey accurate information to members of the public. What representation adds is everything else — the seller's timeline, an offer that fell through, a withdrawal and relisting, the pattern in the comparable sales — because significant information about the transaction must be conveyed to a principal and need not be volunteered to a stranger.",
      "Nothing about the property differs; representation affects only who negotiates, because the disclosure duties in § 1101.652(b)(3) and (b)(4) and the affirmative duty in 22 TAC § 535.156(c) are owed identically to clients and to potential buyers.",
      "Everything differs, including defects: a license holder owes no disclosure of a known significant defect to a person the license holder does not represent, which is why the seller's § 5.008 notice exists.",
      "Representation adds a guarantee that the license holder will disclose whether a prior occupant died on the property, because the client relationship overrides the permission in § 1101.556 not to inquire or disclose.",
    ],
    rationale: "The module puts it exactly this way: the benefit of representation is not that you will be told about the foundation — that duty runs to a potential buyer regardless — it is that you will be told about everything else. The fourth choice is the module's own third honest limit: representation does not create disclosure duties the Legislature has expressly withheld, and § 1101.556 relieves a license holder of any duty to inquire about or disclose the listed matters whether or not there is a client.",
    teaches: "module-05.md#unit-benefits-of-buyer-agency-relationships",
    source: "Texas Occupations Code §§ 1101.652(b)(3), (b)(4), 1101.556, 1101.557(b); 22 TAC § 535.156.",
  }),

  item("LOA-F052", {
    topic: "T05", unit: "T05U4",
    prompt: "A buyer signs a non-exclusive representation agreement and later complains that a license holder from another brokerage approached her directly about a property she was already negotiating for. Does § 1101.652(b)(22) help her?",
    choices: [
      "No. The subdivision reaches negotiating with a person known to be \"a party to an outstanding written contract that grants exclusive agency to another broker in connection with the transaction,\" and a non-exclusive agreement grants no exclusive agency — so the provision is not engaged, and neither is § 1101.557(b)(1), which forbids a broker to instruct another broker to violate it.",
      "Yes. The subdivision protects any party to an outstanding written representation agreement; the word \"exclusive\" describes the agency relationship the agreement creates rather than a term of the contract.",
      "Yes, provided she can show the other license holder knew she had signed something, because knowledge of the agreement rather than its exclusivity is the element the subdivision turns on.",
      "No, but only because she cannot prove knowledge; had the other license holder seen her agreement, the non-exclusive character of it would not matter.",
      ],
    rationale: "The module lists the three conditions built into the subdivision — the contract must be written, must grant exclusive agency, and the other license holder must have knowledge of it — and states the consequence plainly: a non-exclusive buyer agreement does not trigger the provision, and neither does an exclusive one that nobody knows about. The third and fourth choices both drop the exclusivity element, which is the one that decides this fact pattern.",
    teaches: "module-05.md#unit-benefits-of-buyer-agency-relationships",
    source: "Texas Occupations Code §§ 1101.652(b)(22), 1101.557(b)(1).",
  }),

  item("LOA-F053", {
    topic: "T05", unit: "T05U5",
    prompt: "A buyer representation agreement states the broker's compensation as \"an amount to be agreed at the time a contract is executed.\" What is wrong with it under § 1101.563(c), and what is the separate consequence if the broker later has to sue the buyer for the fee?",
    choices: [
      "Subsection (c)(1)(E) requires both the amount or rate of compensation the broker will receive and how that amount will be determined, and this clause states neither; and § 1101.806(c) separately bars an action to recover a commission unless the promise or agreement, or a memorandum, is in writing and signed by the party against whom the action is brought — so a memorandum signed only by the broker proves nothing.",
      "Nothing is wrong with it, because § 1101.563(c)(1)(E) is satisfied by stating how the amount will be determined, and \"agreed at the time a contract is executed\" states a method; § 1101.806(c) is satisfied by the buyer's signature on the agreement whatever the fee clause says.",
      "The clause fails only the conspicuous-negotiability disclosure in subsection (c)(2), because the amount is left open and cannot therefore be presented as negotiable; § 1101.806(c) is not engaged because a buyer's broker sues under the agreement rather than for a commission.",
      "The clause is unenforceable under Business & Commerce Code § 26.01, which requires a promise to pay a commission for the purchase of real estate to be in writing and signed, and § 1101.563(c) states requirements for the Commission's own form rather than for a trade-association form.",
    ],
    rationale: "Subsection (c)(1)(E) has two halves and this clause supplies neither — \"to be determined\" is not compliance. The suing problem is separate and is § 1101.806(c)'s: the writing must be signed by the party against whom the action is brought, so a broker suing a buyer needs the buyer's signature. The fourth choice misreads both statutes: § 26.01(b)(7)'s commission provisions are mineral-related, and § 1101.563(c) reaches the agreement itself regardless of who drafted it — the Commission has not adopted a buyer representation form.",
    teaches: "module-05.md#unit-written-notification-of-compensation-to-broker",
    source: "Texas Occupations Code §§ 1101.563(c)(1)(E), (c)(2), 1101.806(a), (b), (c); Business & Commerce Code § 26.01(b).",
  }),

  item("LOA-F054", {
    topic: "T05", unit: "T05U5",
    prompt: "A buyer's broker's agreement provides for compensation of 2.5 percent of the sales price. The buyer goes under contract at $415,000 and the listing broker has agreed in writing to pay a cooperating broker $8,000. What does the buyer owe under her agreement, and what does 22 TAC § 535.3 require about how the sponsored sales agent's share reaches her? (Illustrative figures only.)",
    choices: [
      "Total compensation $10,375, of which $8,000 comes from the listing broker, leaving a $2,375 shortfall payable by the buyer under her agreement; and § 535.3 provides that a sales agent may not receive a commission or other valuable consideration except with the written consent of the sponsoring broker or the broker who sponsored the sales agent when the sales agent became entitled to it.",
      "Total compensation $10,375, and the buyer owes nothing, because a payment from the listing broker discharges the buyer's obligation pro tanto only where the agreement says so and otherwise satisfies it in full.",
      "Total compensation $8,000, because the listing broker's written offer of cooperation fixes the buyer's broker's fee and the agreement's rate applies only where no cooperation is offered.",
      "Total compensation $10,375 and a $2,375 shortfall, which the title company may pay directly to the sales agent at closing so long as the settlement statement discloses it, because 22 TAC § 535.3 governs payments between license holders rather than payments from a party.",
    ],
    rationale: "Two and a half percent of $415,000 is $10,375; the listing broker's $8,000 leaves $2,375. Nothing in the held sources makes the source of payment determine the amount owed under the agreement, which is what the second and third choices assume. On routing, § 1101.651(b) names the sponsoring broker or the broker who was sponsoring the sales agent when the compensation was earned, and 22 TAC § 535.3 states the same in terms of written consent — so the fourth choice's direct payment from the title company is not available.",
    teaches: "module-05.md#unit-written-notification-of-compensation-to-broker",
    source: "Texas Occupations Code § 1101.651(b), (c); 22 TAC § 535.3. Dollar figures are illustrative.",
  }),

  item("LOA-F055", {
    topic: "T05", unit: "T05U6",
    prompt: "Which arrangement does 22 TAC § 535.148(h) expressly leave outside the rule's prohibitions?",
    choices: [
      "A payment pursuant to a cooperative brokerage or referral arrangement or agreement between active licensed real estate agents and real estate brokers — together with normal promotional or educational activity not conditioned on the referral of business and not involving the defraying of expenses that would otherwise be incurred, and a payment at market rates for goods actually furnished or services actually performed.",
      "A fee paid by an inspector for each buyer the license holder sends, provided the license holder discloses the arrangement to the client in writing and obtains the client's consent under subsection (a).",
      "A payment for inclusion on a title company's preferred-provider list, provided the list is published and the payment is at market rates for the advertising value received.",
      "A payment from a residential service contract provider, provided it is disclosed on TREC No. RSC-4, which is why subsection (f) prescribes that form.",
    ],
    rationale: "Subsection (h) names three things the section does not prohibit, and the module insists they be carried alongside the prohibitions so the rule is not over-read. Subsection (d) is a flat prohibition on paying or receiving a fee or other valuable consideration to or from a settlement service provider for, among other things, the referral of inspections, lenders, mortgage brokers or title companies, and for inclusion on a preferred-provider list — so the second and third choices are the conduct the rule targets, and disclosure does not cure a flat prohibition. Subsection (f) requires RSC-4 for disclosing payments received for services provided for or on behalf of a residential service contract provider; it is a disclosure form, not an exemption.",
    teaches: "module-05.md#unit-buyers-broker-disclosures",
    source: "22 TAC § 535.148(a), (d), (f), (h).",
  }),

  item("LOA-F056", {
    topic: "T05", unit: "T05U6",
    prompt: "A license holder is buying a property through a business entity in which she owns 40 percent. Which disclosure obligation applies, and how does its scope compare with the statutory ground?",
    choices: [
      "22 TAC § 535.144 reaches a license holder acting on behalf of a spouse, parent or child, a business entity in which the license holder is more than a 10 percent owner, or a trust in the circumstances the rule describes; it requires written disclosure of licensed status in the contract of sale or rental agreement or in another writing given before entering into one, and forbids using the license holder's expertise to the disadvantage of a person with whom the license holder deals. Its scope is wider than § 1101.652(a-1)(1), which reaches transactions in the name of the license holder, the license holder's spouse, or a person related within the first degree by consanguinity and does not name entities or trusts.",
      "Only § 1101.652(b)(16) applies, which reaches acting in a dual capacity as broker and undisclosed principal; 22 TAC § 535.144 governs a license holder acting personally and does not reach an entity in which the license holder holds a minority interest.",
      "No disclosure is required at a 40 percent interest, because 22 TAC § 535.144's entity threshold is a majority interest and a minority owner is not acting on the entity's behalf.",
      "22 TAC § 535.144 applies and requires oral disclosure at the first substantive communication, matching the timing of § 1101.558(b-1), because both are first-contact disclosures about the license holder's position.",
      ],
    rationale: "The rule's threshold is more than 10 percent ownership, so a 40 percent interest is inside it and the third choice fails on the number. The module draws the scope comparison expressly: the rule sweeps in a more-than-10-percent-owned entity and certain trusts, which the statutory language at § 1101.652(a-1)(1) does not name. The form and timing are the rule's own — written, in the contract of sale or rental agreement or in another writing given before entering into one — which is what the fourth choice gets wrong.",
    teaches: "module-05.md#unit-buyers-broker-disclosures",
    source: "22 TAC § 535.144; Texas Occupations Code §§ 1101.652(a-1)(1), (b)(16).",
  }),

  /* ══ T06 Intermediary Brokerage — 165 prescribed minutes ═══════════════════════════════════ */

  item("LOA-F057", {
    topic: "T06", unit: "T06U1",
    prompt: "A license holder tells a client that Texas permits disclosed dual agency so long as both parties consent in writing. What is wrong with the statement at the level of the statute?",
    choices: [
      "Texas law never creates the capacity. The words \"dual agent\" and \"dual agency\" appear nowhere in Chapter 1101 — there is no subchapter defining the role, no section authorising it, and no set of reduced duties assigned to it — so consent cannot create a status the statute does not supply. What the Legislature provided instead is the intermediary at § 1101.551(1), and § 1101.561(b) makes that posture mandatory where the broker agrees to represent both a buyer or tenant and a seller or landlord.",
      "Nothing is wrong, provided the consent is in writing and states the source of expected compensation, because § 1101.559(a) is Texas's disclosed-dual-agency provision under a different name.",
      "The statement is wrong only as to sales agents; a broker may act as a disclosed dual agent under § 1101.652(b)(16) provided the broker's principal status is disclosed rather than undisclosed.",
      "The statement is wrong because Texas permits dual agency only in commercial transactions, the intermediary provisions of Subchapter L being limited to residential real property as defined by § 1101.563(a).",
    ],
    rationale: "The module's finding is a negative one and it is the point: the capacity does not exist, so a Texas license holder may not act as a dual agent. The third choice makes the error the module names as an annual trip-up — § 1101.652(b)(16) reaches a licensee who is secretly a *party* to the deal, buying through a nominee or taking a hidden interest, not one representing two sides. The fourth choice imports § 1101.563(a)'s residential definition into Subchapter L, which contains no such limit.",
    teaches: "module-06.md#unit-the-path-from-dual-agency-to-intermediary-brokerage",
    source: "Texas Occupations Code §§ 1101.551(1), 1101.557(a), 1101.559(a), 1101.561(b), 1101.652(b)(16); 22 TAC §§ 531.2, 535.156.",
  }),

  item("LOA-F058", {
    topic: "T06", unit: "T06U1",
    prompt: "Which statement about § 1101.551(1)'s definition of \"intermediary\" is accurate on the text?",
    choices: [
      "An intermediary is \"a broker who is employed to negotiate a transaction between the parties to a transaction and for that purpose may act as an agent of the parties\" — so the object of the employment is the transaction rather than one side's victory, the role belongs to a broker, and the phrase \"agent of the parties\" is plural and joint rather than a separate full agency toward each.",
      "An intermediary is a license holder — broker or sales agent — employed to negotiate between the parties, which is why § 1101.560 permits a sales agent to be appointed to act as the intermediary for one side.",
      "An intermediary is a broker who represents neither party and owes both only the duties owed to a person the broker does not represent, which is why § 1101.559(c) requires fair and impartial action.",
      "An intermediary is a broker employed by both parties who owes each the full fiduciary duties in 22 TAC § 531.2, subject only to the four disclosure prohibitions in § 1101.651(d).",
    ],
    rationale: "The drafting is deliberate and each part carries weight. The second choice states the error the module inoculates against directly: a sales agent never acts as the intermediary — she may be appointed under § 1101.560, which is a different thing. The third choice goes too far in the other direction: the definition says the broker \"may act as an agent of the parties,\" so this is not a no-representation posture. The fourth restores exactly the impossibility the subchapter exists to avoid.",
    teaches: "module-06.md#unit-the-path-from-dual-agency-to-intermediary-brokerage",
    source: "Texas Occupations Code §§ 1101.551(1), 1101.002(4), (7), 1101.351(c), 1101.559(c), 1101.560, 1101.651(d).",
  }),

  item("LOA-F059", {
    topic: "T06", unit: "T06U1",
    prompt: "On the enactment notes printed with the held text, which statement about when the intermediary framework entered Texas law in its codified form is supported?",
    choices: [
      "Sections 1101.559, 1101.560 and 1101.561 were each added by Acts 2001, 77th Leg., ch. 1421, Sec. 2, effective June 1, 2003, and § 1101.561 was then amended by Acts 2005, 79th Leg., Ch. 825 (S.B. 810), Sec. 8, effective September 1, 2005 — the same 2005 act that amended § 1101.557 — so the framework has been settled law in codified form since June 1, 2003, with the mandatory-intermediary sentence reaching its current form by September 1, 2005.",
      "All three sections were added by the 2025 act that created §§ 1101.562 and 1101.563, effective January 1, 2026, which is why the intermediary posture and the non-representation posture appear together in Subchapter L.",
      "The three sections were added in the 1990s by amendments to the former Real Estate License Act, and the held text records those amendments together with the reasons the Legislature gave for them.",
      "Section 1101.561 was added in 2001 and has never been amended, which is why § 1101.561(a)'s supersession clause has been construed the same way since codification.",
    ],
    rationale: "The module takes the dates from the enactment notes at the foot of each section and is careful about the limit of what they establish. The legislative history of the intermediary concept before codification — the 1990s amendments to the former Act — was not held for this course and is not narrated, which is what the third choice claims. The fourth is wrong on the amendment history and also asserts a construction history the module expressly disclaims: no Texas case law construing § 1101.561(a) was held.",
    teaches: "module-06.md#unit-the-path-from-dual-agency-to-intermediary-brokerage",
    source: "Enactment notes to Texas Occupations Code §§ 1101.557, 1101.559, 1101.560, 1101.561 as held.",
  }),

  item("LOA-F060", {
    topic: "T06", unit: "T06U2",
    prompt: "A brokerage's listing agreement says: \"Client agrees Broker may work with other clients in the same transaction.\" Nothing else on the subject appears in the file. Does that satisfy § 1101.559(a)?",
    choices: [
      "No. Subsection (a) permits a broker to act as an intermediary only if the broker obtains written consent from each party for the broker to act as an intermediary in the transaction and the written consent states the source of any expected compensation to the broker. This clause consents to a vague willingness rather than to the named capacity, says nothing about the source of compensation, and comes from one party only.",
      "Yes. Section 1101.559(a)(1) requires written consent to the broker's working both sides, and this clause supplies it; the compensation disclosure in (a)(2) is required only where the broker expects to be paid by both parties.",
      "Yes, provided the other party gave oral consent, because § 1101.559(a) is satisfied where at least one consent is written and the other is documented in the broker's file.",
      "No, but only because the clause is not in conspicuous bold or underlined print, which § 1101.559(a) requires of every intermediary consent.",
    ],
    rationale: "Three separate failures. The consent must be to a named capacity — intermediary — rather than to a general flexibility. It must come from *each* party, so a consent from one and a shrug from the other is not compliance. And subsection (a)(2) requires the written consent to state the source of any expected compensation without regard to whether both parties will pay. The fourth choice misplaces the typography requirement: the conspicuous bold or underlined print condition is in § 1101.559(b), and it is what makes a representation agreement *sufficient* to establish consent, not a formatting rule imposed on every consent.",
    teaches: "module-06.md#unit-intermediary-brokerage",
    source: "Texas Occupations Code § 1101.559(a), (b).",
  }),

  item("LOA-F061", {
    topic: "T06", unit: "T06U2",
    prompt: "A client asks what point size Texas requires on the intermediary consent in her representation agreement. What is the accurate answer, and what does the comparison with other provisions show?",
    choices: [
      "Section 1101.559 prescribes no point size. It requires \"conspicuous bold or underlined print\" for the § 1101.651(d) prohibitions, which is a description of emphasis rather than a measurement — and the Legislature and the Commission specify sizes when they mean to, as at § 1101.558(b-1)'s \"at least a 10-point font,\" 22 TAC § 531.20's 10-point and 12-point homepage-link labels, and 22 TAC § 535.17(c)'s disclaimer \"in at least 12-point font.\"",
      "Ten point, matching § 1101.558(b-1), because the Commission reads the two disclosure requirements together and applies the statutory notice standard to the intermediary consent.",
      "Twelve point, matching the disclaimer requirement in 22 TAC § 535.17(c), which is the minimum the Commission applies to any emphasised text a consumer must read before signing.",
      "No size and no emphasis requirement at all; § 1101.559(b) requires only that the agreement authorise intermediary status, and the reference to the § 1101.651(d) prohibitions describes what the broker must explain orally.",
    ],
    rationale: "The module answers the question precisely and then proves it by contrast. Section 1101.559(b) makes a listing or representation agreement sufficient to establish written consent only if it specifies in conspicuous bold or underlined print the conduct prohibited under § 1101.651(d) — an emphasis standard, not a measurement. The three provisions that do name sizes show the drafters know how. The fourth choice drops the condition entirely, which would defeat the point of the safe harbour: the party must be shown, in emphasised type, the four things the intermediary will not be permitted to tell the other side.",
    teaches: "module-06.md#unit-intermediary-brokerage",
    source: "Texas Occupations Code §§ 1101.559(b), 1101.558(b-1), 1101.651(d); 22 TAC §§ 531.20, 535.17(c).",
  }),

  item("LOA-F062", {
    topic: "T06", unit: "T06U2",
    prompt: "An intermediary's seller telephones and says: \"Tell buyers I'd consider quite a bit under list — do whatever you have to.\" What does § 1101.651(d)(1) require before that may be communicated?",
    choices: [
      "A separate writing from the seller. The subdivision forbids disclosing to the buyer or tenant that the seller or landlord will accept a price less than the asking price \"unless otherwise instructed in a separate writing by the seller or landlord\" — a telephone call is not a separate writing, and neither is a text saying to do whatever it takes, nor a clause tucked into the original listing.",
      "Nothing further. The prohibition protects the seller, so the seller's own instruction releases it in whatever form the seller gives it, and the broker's file note of the call documents the release.",
      "A separate writing from both parties, because the disclosure changes the negotiating position of each and § 1101.651(d) binds the intermediary toward the transaction rather than toward one side.",
      "Written notice to all parties under § 1101.560(b)(2), which is the mechanism by which an intermediary communicates a change in what may be disclosed.",
    ],
    rationale: "The qualifier is the mechanism by which a confidence is deliberately released, and its form is specified: a separate writing from that party. The module presses the point that the prohibition is on communicating the substance rather than a particular sentence — \"she's motivated\" is a disclosure that the seller will accept less than the asking price, dressed up in a word. Section 1101.560(b)(2) is the written notice of an *appointment* and has nothing to do with releasing a confidence.",
    teaches: "module-06.md#unit-intermediary-brokerage",
    source: "Texas Occupations Code §§ 1101.651(d)(1), 1101.560(b)(2).",
  }),

  item("LOA-F063", {
    topic: "T06", unit: "T06U2",
    prompt: "In an intermediary transaction a buyer submits a written offer at $400,000 and has told his appointed agent he would go to $421,000. The listing side asks whether the buyer could pay more. What is the benchmark § 1101.651(d)(2) uses, and what follows?",
    choices: [
      "The benchmark is \"the price submitted in a written offer to the seller or landlord\" — $400,000 here, not the approval letter and not what the buyer said in the car — so the appointed agent may not disclose that the buyer will pay more than $400,000 absent a separate writing from the buyer, which is exactly the instrument a buyer sometimes supplies at the escalation stage.",
      "The benchmark is the buyer's demonstrated ability to pay, so the prohibition attaches to the $430,000 approval figure and a disclosure of anything below it is permitted.",
      "The benchmark is the buyer's stated ceiling of $421,000, so the appointed agent may confirm that the buyer could go above $400,000 provided no figure at or above $421,000 is named.",
      "There is no benchmark, because § 1101.651(d)(2) is absolute and no writing can release it — only subdivisions (1) and (3) carry an unless-clause.",
    ],
    rationale: "The subdivision's precision is the point: the prohibition is on disclosing that the buyer or tenant \"will pay a price greater than the price submitted in a written offer,\" and the module names the trap directly — the benchmark is the written offer, not the approval letter and not what the buyer told you in the car. The same unless-clause appears here as in subdivision (1), so the fourth choice is wrong; subdivisions (1), (2) and (3) each carry a release mechanism and (4) and (5) do not.",
    teaches: "module-06.md#unit-intermediary-brokerage",
    source: "Texas Occupations Code § 1101.651(d)(1)-(5).",
  }),

  item("LOA-F064", {
    topic: "T06", unit: "T06U2",
    prompt: "What does § 1101.561(a)'s supersession clause displace, and what does it leave standing on the face of the held text?",
    choices: [
      "It displaces duties established under \"any other law, including common law\" — the implied fiduciary duties and the common-law obligation of undivided loyalty — so an intermediary who complies with § 1101.651(d) is not thereby breaching a duty of loyalty. It leaves standing the duties Subchapter L itself imposes, including fair and impartial action under § 1101.559(c); § 1101.651(d), which is drafted expressly for intermediaries; the § 1101.652 disciplinary grounds; the § 1101.555 written advice; § 1101.557(b); and 22 TAC § 535.157's two calendar days.",
      "It displaces every duty a license holder would otherwise owe, including those in Chapter 1101, which is why the intermediary is bound only by the five prohibitions in § 1101.651(d).",
      "It displaces only the duty of confidentiality, replacing it with the more specific rules in § 1101.651(d), and leaves the common-law duty of undivided loyalty intact toward each party.",
      "It has no operative effect until a Texas court construes it; the held sources contain a decision holding that the clause reaches only common-law fiduciary duties and not statutory ones.",
    ],
    rationale: "The module calls this the most over-read sentence in Subchapter L and gives both halves. The supersession runs against \"any other law,\" so the duties Subchapter L and the rest of Chapter 1101 impose survive — it would be absurd to read the clause as abolishing the very confidentiality rules that define the role. The fourth choice manufactures a holding: no Texas case law construing § 1101.561(a) was held for this course, and the module says so and declines to state an outer edge.",
    teaches: "module-06.md#unit-intermediary-brokerage",
    source: "Texas Occupations Code §§ 1101.561(a), 1101.559(c), 1101.555, 1101.557(b), 1101.651(d), 1101.652; 22 TAC § 535.157.",
  }),

  item("LOA-F065", {
    topic: "T06", unit: "T06U3",
    prompt: "Which statement about the written notice of appointment required by § 1101.560(b)(2) is accurate on the text, and which is an assumption the section does not support?",
    choices: [
      "The broker must provide it — not the appointed agent — it must be written, it concerns who has been appointed to whom, and it goes to all parties involved in the real estate transaction rather than only to the party whose appointee is named. The section prescribes no form, sets no deadline in days or hours, does not require the parties to sign it, and does not require it to explain the appointee's duties.",
      "The appointed license holder must provide it to the party to whom she is appointed, in writing, and the party must sign it, because subsection (b) makes the notice a condition of a valid appointment.",
      "The broker must provide it orally or in writing, matching the alternative § 1101.558(b) offers for the representation disclosure, and must do so within two calendar days of the appointment under 22 TAC § 535.157.",
      "The broker must use the Commission's prescribed appointment form, which is adopted by reference in the same way 22 TAC § 531.20 adopts TREC No. IABS 1-2.",
    ],
    rationale: "The module reads the subsection for what it says and then names the gaps, warning against filling them with assumptions carried over from another state's practice. The statute does not offer the \"orally or in writing\" alternative § 1101.558(b) offers, and § 535.157 is a response rule rather than an appointment deadline. On forms: the only Commission-promulgated form held for this course is the IABS notice; no appointment form is held, so no form's contents are described.",
    teaches: "module-06.md#unit-representation-of-more-than-one-party-in-a-transaction",
    source: "Texas Occupations Code §§ 1101.560(b), 1101.558(b); 22 TAC §§ 531.20, 535.157.",
  }),

  item("LOA-F066", {
    topic: "T06", unit: "T06U3",
    prompt: "A brokerage holds both parties' written intermediary consents, but neither consent mentions appointments. What configurations are available, and what does each party get?",
    choices: [
      "Only intermediary without appointments. Section 1101.560(b)(1) permits an appointment only if the written consent authorises the broker to make it, and that authorisation is not implied by the consent to intermediary status. The parties get a broker who acts fairly and impartially, who informs each of material information including the receipt of an offer and at a minimum answers questions and presents offers under § 1101.557(b), and who responds within two calendar days — but nobody in the brokerage may advise either of them on price or strategy.",
      "Either configuration. Section 1101.560(b)(1) is satisfied by the consent to intermediary status, because the appointment power is part of the capacity the parties consented to and § 1101.559(c) deems making an appointment a fair and impartial act.",
      "Only intermediary without appointments, and in that configuration the broker also loses the duty to present offers, because § 1101.559(c)'s impartiality command displaces § 1101.557(b) for a broker serving both sides.",
      "Either configuration, provided the broker obtains an oral confirmation from each party at the time of appointment, which is what § 1101.560(b)(2)'s written notice requirement is designed to document.",
    ],
    rationale: "Subsection (b) is a closed gate — \"only if\" — with two conditions, and the module states the first plainly: the consent must do two distinct jobs, authorise intermediary status and authorise appointments, and the second is not implied by the first. Section 1101.559(c)'s second sentence deems an appointment a fair and impartial act; it does not supply the authorisation. The third choice invents a displacement § 1101.561(a) does not perform — § 1101.557(b) is a Chapter 1101 duty, not \"other law.\"",
    teaches: "module-06.md#unit-representation-of-more-than-one-party-in-a-transaction",
    source: "Texas Occupations Code §§ 1101.560(a), (b), (c), 1101.559(c), 1101.557(b), 1101.561(a); 22 TAC § 535.157.",
  }),

  item("LOA-F067", {
    topic: "T06", unit: "T06U3",
    prompt: "What is the practical difference between intermediary with appointments and intermediary without, and what is identical in both?",
    choices: [
      "The difference is advice: with appointments each party has a licensee who may provide opinions and advice during negotiations to the party to whom she is appointed, under § 1101.560(c); without them, the parties negotiate unadvised through an impartial broker. Confidentiality is identical, because § 1101.651(d) binds \"a broker and any broker or sales agent appointed under Section 1101.560,\" so an appointee is an advisor operating inside the same confidentiality cage.",
      "The difference is confidentiality: an appointed agent may share her own party's position with that party's knowledge, because the § 1101.651(d) prohibitions are addressed to the intermediary broker and not to appointees.",
      "The difference is compensation: appointments allow the brokerage to be paid by both parties under § 1101.652(b)(8), while without them the broker may be paid by only one.",
      "There is no practical difference; appointments are a courtesy that lets each party keep the agent they already knew, and § 1101.559(c) exists to confirm that the choice changes nothing.",
    ],
    rationale: "The module states this comparison directly. The opening words of § 1101.651(d) are what defeat the second choice: the five prohibitions run to the intermediary broker *and* to every license holder the broker appoints, so an appointment does not release a sales agent from subdivisions (1) through (5). The third choice misuses § 1101.652(b)(8), which is a disciplinary ground for receiving compensation from more than one party without the full knowledge and consent of all parties, not a permission tied to appointments.",
    teaches: "module-06.md#unit-representation-of-more-than-one-party-in-a-transaction",
    source: "Texas Occupations Code §§ 1101.560(c), 1101.559(c), 1101.651(d), 1101.652(b)(8).",
  }),

  item("LOA-F068", {
    topic: "T06", unit: "T06U4",
    prompt: "A sole-practitioner broker with no sponsored license holders ends up representing both the seller and the buyer of the same property. What configurations are lawfully available?",
    choices: [
      "Only intermediary without appointments, on written consent from each party stating the source of any expected compensation. Section 1101.560(a) authorises the broker to appoint \"a license holder associated with the broker\" for one party and \"another license holder associated with the broker\" for any other party, and she has none; she cannot appoint herself, since the subsection is written in terms of a broker appointing someone else and self-appointment to both sides would produce the undivided-loyalty impossibility the subchapter exists to avoid.",
      "Intermediary with appointments, appointing herself to the seller and engaging a licensee at another firm as the buyer's appointee, since § 1101.560(a) requires only that each appointee be a license holder.",
      "None. Section 1101.561(b) requires the intermediary posture, and a broker who cannot make appointments cannot satisfy § 1101.559, so she must withdraw from one side.",
      "Either configuration, because a sole practitioner may appoint herself to both parties provided the written notice under § 1101.560(b)(2) discloses that the same license holder serves both.",
    ],
    rationale: "The module works this corner through. The appointee must be a license holder *associated with the broker*, which rules out a licensee at a different firm — the second choice — and the statute contemplates a different license holder for each party, which rules out self-appointment to both. The third choice confuses two things: § 1101.559 requires written consents, not appointments, so the intermediary-without-appointments configuration is fully available to her. Withdrawal is a business option, not a legal necessity.",
    teaches: "module-06.md#unit-specialized-intermediary-applications",
    source: "Texas Occupations Code §§ 1101.559(a), 1101.560(a), (b), (c), 1101.561(b), 1101.351(c).",
  }),

  item("LOA-F069", {
    topic: "T06", unit: "T06U4",
    prompt: "A brokerage represents both the landlord and the tenant on a residential lease of ten months where no sale is contemplated. A colleague says the § 1101.558(c)(1) exception means no intermediary paperwork is needed. What is the correct analysis?",
    choices: [
      "The exception relieves only the § 1101.558(b-1) written notice. Section 1101.559 contains no lease exception at all, so written intermediary consent from each party — stating the source of any expected compensation — is still required, and § 1101.651(d)'s paired terms (\"seller or landlord,\" \"buyer or tenant\") put the transaction squarely inside the confidentiality rules.",
      "The colleague is right: § 1101.558(c)(1) excuses the notice, and because the notice is what informs a party that a broker can act as an intermediary, a party who need not receive it cannot be asked to consent to the status.",
      "The colleague is right for a different reason: Subchapter L applies to transactions involving a sale, and § 1101.561(b) is triggered only where the broker represents a buyer and a seller.",
      "The exception does not apply in any event, because § 1101.558(c)(1) covers a residential lease of less than one year only where the brokerage represents just one party.",
    ],
    rationale: "The module flags this as a provision students misapply. The exception in § 1101.558(c)(1) has two elements — a residential lease for less than one year and no sale being considered — and both are satisfied on these facts, so the fourth choice invents a third element. What the exception does not do is reach § 1101.559, which contains no lease exception. Section 1101.561(b) is written in paired terms: a buyer *or tenant* and a seller *or landlord*, which defeats the third choice.",
    teaches: "module-06.md#unit-specialized-intermediary-applications",
    source: "Texas Occupations Code §§ 1101.558(b-1), (c)(1), 1101.559(a), 1101.561(b), 1101.651(d)(1), (2).",
  }),

  item("LOA-F070", {
    topic: "T06", unit: "T06U5",
    prompt: "Under 22 TAC § 535.191 as the module describes it, how do the penalty bands for the intermediary provisions and for the two subdivisions that reach unintended dual representation compare, and what does § 1101.702(a) add?",
    choices: [
      "Sections 1101.558, 1101.559(a) and (c), 1101.560, 1101.561(b) and 1101.651 each draw $1,000 to $5,000 per violation per day, while § 1101.652(b)(7) and (b)(8) sit one band below at $500 to $3,000 per violation per day — and § 1101.702(a) caps an administrative penalty at $5,000 for each violation while providing that each day a violation continues or occurs may be considered a separate violation.",
      "All of the provisions named sit in the same $1,000 to $5,000 band, because § 1101.652 is the section that authorises discipline for every violation of the chapter and the schedule does not distinguish among its subdivisions.",
      "Sections 1101.652(b)(7) and (b)(8) draw the higher band because they reach conduct toward consumers, while the intermediary provisions draw $500 to $3,000 as internal procedural requirements.",
      "The schedule states a single penalty per transaction rather than per day, which is why § 1101.702(a) caps the amount at $5,000 for each violation.",
    ],
    rationale: "The module gives both bands and the per-day multiplier, and draws the operational lesson: a transaction that ran forty days without the required written consent is not one violation. The fourth choice contradicts § 1101.702(a)'s own sentence that each day a violation continues or occurs may be considered a separate violation. The third choice inverts the two bands.",
    teaches: "module-06.md#unit-intentional-versus-unintended-dual-representation",
    source: "22 TAC § 535.191; Texas Occupations Code §§ 1101.652(b)(7), (b)(8), 1101.702(a).",
  }),

  /* ══ T07 Creation and Termination of Agency — 85 prescribed minutes ════════════════════════ */

  item("LOA-F071", {
    topic: "T07", unit: "T07U1",
    prompt: "Three Texas writing rules bear on an engagement, and each answers a different question. Which pairing of rule to question is correct?",
    choices: [
      "Section 1101.563 answers *may I act* — a writing required before showing residential real property or presenting an offer, whose absence is a disciplinary count under § 1101.652(b)(34). Section 1101.806(c) answers *may I sue for the fee* — a writing signed by the party against whom the action is brought. Business & Commerce Code § 26.01 answers *is the promise enforceable at all*, reaching a contract for the sale of real estate, a lease longer than a year, an agreement not to be performed within one year, and mineral commissions at subdivision (b)(7).",
      "Section 1101.563 answers whether the fee is recoverable, § 1101.806(c) answers whether the license holder may act before a showing, and § 26.01 supplies the writing requirement for an ordinary residential commission promise.",
      "All three answer the same question — whether the agreement is in writing — which is why a file that satisfies any one of them satisfies the others.",
      "Section 1101.563 and § 1101.806(c) answer the same question for residential buyers, and § 26.01 has no application to real estate brokerage because § 1101.806(a) removes brokerage agreements from it.",
    ],
    rationale: "The module frames these as three writings, three questions and three different failures, and adds that a file can satisfy one and fail another. The commonest error is the one in the second and fourth choices — putting the ordinary residential commission promise in § 26.01, whose only commission subdivision (b)(7) covers oil or gas mining leases, oil or gas royalties, minerals and mineral interests. Section 1101.806(a) removes agreements to share compensation *among license holders* from that section; it does not disapply Chapter 26.",
    teaches: "module-07.md#unit-how-and-when-agency-is-created",
    source: "Texas Occupations Code §§ 1101.563, 1101.652(b)(34), 1101.806(a), (c); Business & Commerce Code § 26.01(a), (b).",
  }),

  item("LOA-F072", {
    topic: "T07", unit: "T07U1",
    prompt: "A license holder relies on the common-law routes by which an agency can arise without a signature — implied appointment, ratification, estoppel — as a way of establishing a relationship with a buyer. What is the correct position on the held sources?",
    choices: [
      "Those common-law elements were not held for this course and are not taught as Texas law; and the held provisions show why they should be treated as hazards rather than strategies — § 1101.806(c) means there is no signed promise to sue on, § 1101.652(b)(34) makes the missing § 1101.563 agreement its own disciplinary ground, and 22 TAC § 531.2 attaches fiduciary status to a license holder \"while acting as an agent for another,\" so the exposure attaches without the fee.",
      "Those doctrines are codified in Chapter 1101 and a license holder may rely on them, which is why § 1101.557(a) contains no signature requirement.",
      "Those doctrines have no application in Texas at all, because § 1101.563 now requires a writing before any act of real estate brokerage for any prospective buyer of any property type.",
      "Those doctrines apply only to the broker and not to a sponsored sales agent, because § 1101.351(c) makes the sales agent's authority derive from the broker rather than from the client.",
    ],
    rationale: "The module states the limit — the elements of ratification and agency by estoppel were not held and are not taught as law — and then sets out the held provisions that show the Legislature and the Commission contemplating agency arising without a signature. The conclusion it draws is the one in the correct answer: an accidentally created agency is the worst of both worlds — full fiduciary exposure, no enforceable fee, and a disciplinary count. The third choice overstates § 1101.563, which reaches prospective buyers of residential real property as defined in subsection (a).",
    teaches: "module-07.md#unit-how-and-when-agency-is-created",
    source: "Texas Occupations Code §§ 1101.557(a), 1101.562(a)(1), (2), 1101.563, 1101.652(b)(34), 1101.806(c); 22 TAC §§ 531.2, 535.145.",
  }),

  item("LOA-F073", {
    topic: "T07", unit: "T07U1",
    prompt: "Under 22 TAC § 535.145, what is the position of an oral statement in a Commission proceeding under § 1101.652(b)(5), and what does the rule say about contractual disclaimers?",
    choices: [
      "A \"false promise\" for purposes of § 1101.652(b)(5) includes both oral and written promises, and neither a contractual disclaimer of oral representations nor the parol evidence rule prevents the Commission from considering what the license holder said out loud.",
      "Only a written promise can be a false promise, because § 1101.806(c) makes an oral commission promise unenforceable and the Commission follows the same rule for disciplinary purposes.",
      "An oral promise may be considered only where the complainant produces a recording or a contemporaneous writing, which is the evidentiary standard the rule imposes.",
      "A contractual disclaimer of oral representations is effective before the Commission where the party signed it knowingly, which is why brokerage forms carry one.",
    ],
    rationale: "The rule is one of the held provisions the module cites for the proposition that Texas takes spoken words seriously: a false promise includes both oral and written promises, and neither a disclaimer clause nor the parol evidence rule stops the Commission considering what was said. The remaining choices each invent a limitation the rule does not contain.",
    teaches: "module-07.md#unit-how-and-when-agency-is-created",
    source: "22 TAC § 535.145; Texas Occupations Code § 1101.652(b)(5).",
  }),

  item("LOA-F074", {
    topic: "T07", unit: "T07U2",
    prompt: "An owner who signed a listing dies leaving a will that devises the property. What do the held sources establish about the listing and about who a license holder may contract with next?",
    choices: [
      "Estates Code § 101.001(a) vests the devised estate immediately in the devisees — and an intestate estate immediately in the heirs at law under subsection (b) — subject to § 101.051's payment of debts and delinquent court-ordered child support; § 101.003 gives the executor or administrator the right to possession on issuance of letters. So the person who gave the authority no longer owns the property and the new owners agreed to nothing, and § 1101.551(2) recognises an executor or administrator as a party with whom a fresh agreement may be made, carrying a new signature and a new definite termination date under § 1101.652(b)(12).",
      "The listing survives and binds the devisees, because § 101.001(a) vests the estate subject to the decedent's obligations and a listing agreement is such an obligation.",
      "The listing terminates by operation of law under the common-law rule that the death of a principal ends the agency, which the held Estates Code sections codify.",
      "The listing is suspended until letters testamentary issue and then resumes automatically in favour of the executor, because § 101.003 gives the executor the estate \"as the estate existed at the death of the testator.\"",
    ],
    rationale: "The module reaches the practical answer from the Estates Code without needing the common-law rule, and is explicit that it does not state that rule as Texas law — which is what the third choice does. Section 101.051 subjects the vesting to debts and delinquent child support, not to a listing agreement, so the second choice fails. Section 101.003 concerns the representative's right to possession, not the revival of a contract.",
    teaches: "module-07.md#unit-how-agency-is-terminated",
    source: "Texas Estates Code §§ 101.001, 101.003, 101.051; Texas Occupations Code §§ 1101.551(2), 1101.652(b)(12).",
  }),

  item("LOA-F075", {
    topic: "T07", unit: "T07U2",
    prompt: "Which statement about what the held sources do and do not establish for the terminating events in this unit is accurate?",
    choices: [
      "No held Texas statute or rule states that destruction of the subject matter terminates an agency, that a party's bankruptcy does, or that a principal always retains the power to revoke subject to an agency coupled with an interest — none of those was held and none is taught as Texas law. What the held sources do supply is the duty to keep the principal informed of significant information at all times under 22 TAC § 535.156(c), the continuing defect duties in § 1101.652(b)(3) and (b)(4), and the four-year limitations period in Civil Practice & Remedies Code § 16.004(a) for debt and breach of fiduciary duty.",
      "Chapter 1101 states that destruction of the subject property and a party's bankruptcy each terminate an agency, at § 1101.606(c), which is why that subsection appears in the chapter.",
      "The held sources state a two-year limitations period for a breach of fiduciary duty claim, matching the DTPA period in Business & Commerce Code § 17.565.",
      "The held sources state that a principal's revocation extinguishes any claim for a commission, because the authority under the contract has ended.",
    ],
    rationale: "The module is careful about each of these absences and says so in terms. Section 1101.606(c) is a Real Estate Recovery Trust Account provision about an aggrieved person precluded by a bankruptcy court from executing a judgment — not an agency-termination provision, which defeats the second choice. Section 16.004(a) is four years and covers debt and breach of fiduciary duty. And the module states the opposite of the fourth choice: a revocation does not vaporise a signed promise to pay, because § 1101.806(c) conditions the action on the writing rather than on the agency still being alive.",
    teaches: "module-07.md#unit-how-agency-is-terminated",
    source: "Texas Occupations Code §§ 1101.606(c), 1101.652(b)(3), (b)(4), 1101.806(c); Civil Practice & Remedies Code § 16.004(a); 22 TAC § 535.156(c).",
  }),

  item("LOA-F076", {
    topic: "T07", unit: "T07U2",
    prompt: "A broker applies for inactive status. What does § 1101.366 require as to the broker's sponsored sales agents, and what may the broker then do?",
    choices: [
      "Subsection (c) requires the broker to terminate the association with each sponsored sales agent by giving written notice to each sales agent before the 30th day preceding the date the broker applies for inactive status; and under subsection (d) a broker on inactive status may not perform any activity regulated under the chapter and must pay renewal fees.",
      "Subsection (c) requires written notice to the Commission within thirty days after the application, and under subsection (d) the broker may continue to perform activity regulated under the chapter until the application is granted.",
      "Subsection (c) requires the sales agents to notify the Commission themselves under § 1101.367(a), since they are the terminating party once the broker goes inactive; the broker's only duty is to pay renewal fees.",
      "Subsection (c) requires written notice to each sales agent immediately on application, matching the \"immediately\" standard § 1101.367(a) sets for a terminating sponsorship relationship.",
      ],
    rationale: "The notice period runs backward from the application date — written notice to each sales agent before the 30th day preceding the day the broker applies — and the module contrasts it deliberately with § 1101.367(a)'s \"immediately,\" which governs the termination of a sponsorship relationship and requires notice to two recipients, the other party and the Commission. Subsection (d) bars a broker on inactive status from performing any activity regulated under the chapter while still requiring renewal fees.",
    teaches: "module-07.md#unit-how-agency-is-terminated",
    source: "Texas Occupations Code §§ 1101.366(c), (d), 1101.367(a).",
  }),

  item("LOA-F077", {
    topic: "T07", unit: "T07U3",
    prompt: "A written demand for payment of trust money is delivered to a broker on June 12. What does 22 TAC § 535.146(d) require, and what is available if the broker genuinely cannot tell who is entitled?",
    choices: [
      "Payment to the party or parties entitled within a reasonable time, which the Commission has determined to be not later than the 30th day after the date the demand is made — so not later than July 12 — with written notice to all parties immediately on any such disbursement under (d)(4); and where the broker cannot reasonably determine who is entitled, (d)(5) permits the broker to pay the money into the registry of a court and interplead the parties, which is permissive rather than mandatory.",
      "Payment within two calendar days under 22 TAC § 535.157, since a written demand is a communication from a party to which the broker must respond; and if the broker cannot determine entitlement, the broker must interplead, which (d)(5) makes mandatory.",
      "Payment not later than the close of business of the second working day after the demand, which is the same deadline § 535.146(b)(3) sets for depositing trust money; and interpleader is unavailable to a broker, being a remedy for the parties.",
      "No payment until all parties agree in writing, because (d)(1) permits disbursement only in accordance with the agreement under which the money was received and a demand by one party is not such an agreement.",
    ],
    rationale: "Subsection (d)(2) sets the thirty-day clock from the date of the demand, and the module works the arithmetic: a demand delivered June 12 must be answered with payment by July 12. Subsection (d)(5) is written as a permission — the broker \"may\" interplead — which is what a careful broker does instead of guessing between two angry parties. The second-working-day deadline in (b)(3) is the deposit deadline, not the disbursement deadline, and § 535.157's two calendar days is a response rule.",
    teaches: "module-07.md#unit-duties-of-agency-that-survive-termination",
    source: "22 TAC §§ 535.146(b)(3), (d)(1)-(5), 535.157.",
  }),

  /* ══ T08 Clarifying Agency Relationships — 45 prescribed minutes ═══════════════════════════ */

  item("LOA-F078", {
    topic: "T08", unit: "T08U1",
    prompt: "Under 22 TAC § 531.18, which of a license holder's three online presences is a \"business website\" for the Consumer Protection Notice link requirement?",
    choices: [
      "A site she controls that advertises her brokerage services — the definition has three cumulative elements: accessible to the public, containing information about a license holder's real estate brokerage services, and the content controlled by the license holder — so a personal blog that never mentions her work fails the second element and a third-party portal that displays her listings fails the third.",
      "All three, because the rule's concern is that a consumer who encounters the license holder anywhere online can reach the complaint notice, and a portal displaying her listings is a place a consumer encounters her.",
      "Only a site with a homepage in the ordinary sense, which is why the rule makes no accommodation for social media accounts.",
      "None of them, because § 531.18 imposes a display duty on the broker at each place of business and the link duty runs to the broker's website rather than to a sponsored sales agent's.",
    ],
    rationale: "The definition is cumulative and the module says control of content decides most close cases. The third choice is wrong on the rule's face: for a social media platform the link may be located on the account holder profile, or on a separate page or website reached through a direct link from the platform or profile. The fourth misreads where each duty bites — the display duty is measured by the places of business *the broker* maintains, while the rule requires each *license holder* to provide the link on each of that license holder's business websites.",
    teaches: "module-08.md#unit-disclosure-policy",
    source: "22 TAC § 531.18.",
  }),

  item("LOA-F079", {
    topic: "T08", unit: "T08U1",
    prompt: "Which pairing of notice, statutory parent and method of provision is correct?",
    choices: [
      "The Consumer Protection Notice, TREC No. CN 1-5, comes from Occupations Code § 1101.202(a) — which directs the Commission to prescribe a notice carrying the Commission's name, mailing address and telephone number for the purpose of directing a complaint to it — and is *displayed and linked* under 22 TAC § 531.18; the IABS, TREC No. IABS 1-2, comes from § 1101.558(b-1) and (b-2) and is *delivered to a party* under 22 TAC § 531.20.",
      "Both notices come from § 1101.558 and both must be delivered to a party at first substantive communication; the difference is that the Consumer Protection Notice must also be displayed in the office.",
      "The Consumer Protection Notice comes from § 1101.558(b-2) and is delivered at first contact, while the IABS comes from § 1101.202(a) and is displayed at each place of business.",
      "Both are adopted by 22 TAC § 531.20, which is why both homepage links carry the same two label options and the same font floors.",
    ],
    rationale: "The two notices have different statutory parents, different audiences and different methods, and the module says students conflate them constantly. Section 1101.202(a) sits in the subchapter on commission complaints and is about complaint routing; § 1101.558(b-1) sits in the practice subchapter and is about explaining agency. Each rule adopts its own form — § 531.18 the CN 1-5 and § 531.20 the IABS 1-2 — and each prescribes its own label options and font floors, which happen to follow the same shorter-label-larger-font pattern but are separate requirements.",
    teaches: "module-08.md#unit-disclosure-policy",
    source: "Texas Occupations Code §§ 1101.202(a), 1101.558(b), (b-1), (b-2); 22 TAC §§ 531.18, 531.20.",
  }),

  item("LOA-F080", {
    topic: "T08", unit: "T08U1",
    prompt: "A first contact about a specific property arrives by text message at 9:40 on a Saturday night. What does the held law settle, and what must a brokerage's disclosure policy settle?",
    choices: [
      "The law settles that a written notice is due at first substantive communication under § 1101.558(b-1) and that 22 TAC § 531.20 enumerates the permitted methods of providing a completed notice — text is not among them. What the law leaves open, and a policy must settle, is what an agent does when a first contact arrives in a channel the rule does not accommodate, who delivers when two of the firm's agents are in contact with the same buyer, and where the proof is filed; neither the statute nor the rule as held defines \"substantive communication.\"",
      "The law settles all of it: § 531.20 permits delivery by any method that produces a record the broker can retrieve, so a text message with the notice pasted into it complies, and a policy adds nothing.",
      "The law settles that no notice is due until the parties meet in person, because a text message is not a substantive communication as the Commission defines that phrase in § 531.20.",
      "The law settles that the agent must respond within two calendar days under 22 TAC § 535.157 and deliver the notice with that response, which is the deadline a policy simply restates.",
    ],
    rationale: "The module draws the floor-and-building distinction and is explicit that a definition of \"substantive communication\" was not held for this course, so it declines to invent a bright line — which is what the third choice asserts. Section 531.20 lists specific methods and text messaging is not among them, so the second choice fails; § 535.157 is a response rule and supplies no notice deadline, so the fourth does too. The module's own direction of prudence: delivering the notice early costs nothing and delivering it late is disciplinary exposure.",
    teaches: "module-08.md#unit-disclosure-policy",
    source: "Texas Occupations Code § 1101.558(b-1); 22 TAC §§ 531.20, 535.157.",
  }),

  item("LOA-F081", {
    topic: "T08", unit: "T08U2",
    prompt: "Which two facts about a brokerage policy manual are established by 22 TAC § 535.2 rather than being the firm's own preference?",
    choices: [
      "That the manual must exist and be maintained \"on a current basis\" as written policies and procedures on the subjects the rule lists — so a manual last revised years ago is not a current manual — and that the broker is required to notify a sponsored sales agent in writing of the scope of the sales agent's authorised activities under the Act.",
      "That the manual must carry an acknowledgement page signed by each sponsored sales agent, and that it must be filed with the Commission within thirty days of any revision.",
      "That the manual must set out the firm's chapter structure and routing rules, and that it must be delivered to each sales agent before the agent performs any act of brokerage.",
      "That the manual must state the firm's commission splits and that it must be reviewed by an attorney annually, which is what makes it a discharge of the broker's duties rather than a business document.",
    ],
    rationale: "Those are the two the module isolates: the currency requirement, and the rule's opening sentence about the written scope of authorised activities — a duty running from broker to agent that a new sales agent should ask for on day one. The module is equally clear about the limit: the structure of a manual, its chapters, its acknowledgement page and its routing rules, is a business decision and no source read for this course prescribes one, which defeats the second and third choices.",
    teaches: "module-08.md#unit-understanding-a-brokerage-companys-policy",
    source: "22 TAC § 535.2.",
  }),

  item("LOA-F082", {
    topic: "T08", unit: "T08U2",
    prompt: "A brokerage's policy manual runs to ninety pages, has a signed acknowledgement page and a careful chapter structure, but nowhere states the scope of each sponsored sales agent's authorised activities and nowhere says where proof of an IABS delivery is filed. Which of those facts is a compliance failure and which is not?",
    choices: [
      "The missing statement of authorised scope is a failure — 22 TAC § 535.2 opens by requiring a broker to notify a sponsored sales agent in writing of the scope of the sales agent's authorised activities under the Act — and the missing filing rule leaves open a question the statute and the rule do not answer and a policy must. The page count, the acknowledgement page and the chapter structure are business decisions, and no source read for this course prescribes any of them.",
      "All four are failures, because 22 TAC § 535.2 requires written policies and procedures and a manual that omits any of the subjects a sponsored sales agent needs is not a current manual.",
      "None is a failure, because § 535.2 requires the policies to exist rather than to take any particular form, and the scope notice may be given orally so long as the manual records that it was given.",
      "The missing filing rule is a failure and the missing scope statement is not, because 22 TAC § 531.20 prescribes the permitted delivery methods and therefore requires proof of delivery to be retained, while the scope of a sales agent's activities is set by the licence rather than by the broker.",
    ],
    rationale: "The unit separates what the law prescribes from what the firm decides. The scope notice is the rule's own opening sentence and it must be in writing — an oral notice recorded second-hand does not satisfy it, which defeats the third choice. The filing question is one of the ones the rules leave open, which is why a policy has to settle it; § 531.20 prescribes delivery methods and forbids a link in a footnote or signature block, but says nothing about where a sent copy is kept. And the module is explicit that the structure of a manual — its chapters, its acknowledgement page, its routing rules — is a business decision no held source prescribes.",
    teaches: "module-08.md#unit-understanding-a-brokerage-companys-policy",
    source: "22 TAC §§ 535.2, 531.20.",
  }),

  item("LOA-F083", {
    topic: "T08", unit: "T08U2",
    prompt: "A brokerage's email template carries a link labelled \"TREC Information About Brokerage Services\" in 14-point font in the signature block of every outgoing message, and the broker says this satisfies 22 TAC § 531.20 for email delivery. What does the rule say?",
    choices: [
      "It does not. The rule provides that the link to a completed IABS Notice \"may not be in a footnote or signature block in an email,\" and where delivery is by attachment or by a link within the body, the body of the email must carry a specific reference to the IABS Notice.",
      "It does, because the label is one of the two the rule permits and 14-point font exceeds the 10-point floor that label carries; the placement of a compliant link is not addressed by the rule.",
      "It does for the homepage-link duty and not for delivery, because the rule's two duties are satisfied by the same link so long as it is labelled correctly and appears in every outgoing message.",
      "It does not, because the correct label for a link inside an email is the shorter one, \"TREC Information About Brokerage Services,\" at the 12-point floor.",
    ],
    rationale: "The rule forecloses exactly the tidy solution the broker has adopted, with a flat prohibition on a link in a footnote or signature block. Delivery by attachment or by a link within the body works only with a specific reference to the IABS Notice in the body of the email. The fourth choice also garbles the labels: the longer label, \"Texas Real Estate Commission Information About Brokerage Services,\" carries the 10-point floor and the shorter \"TREC Information About Brokerage Services\" carries 12 point, and those labels govern the homepage link rather than an in-email link.",
    teaches: "module-08.md#unit-understanding-a-brokerage-companys-policy",
    source: "22 TAC § 531.20.",
  }),

  /* ══ T09 Employment Issues — 120 prescribed minutes ════════════════════════════════════════ */

  item("LOA-F084", {
    topic: "T09", unit: "T09U1",
    prompt: "Labor Code § 201.072 opens with the words \"In this subtitle.\" What does that phrase settle about the section's reach, and which neighbouring provisions show that the section's silence on control is deliberate?",
    choices: [
      "It confines the exclusion to the unemployment compensation subtitle, so § 201.072 decides nothing about wage and hour law, workers' compensation, discrimination law, tort or vicarious liability, or common-law status. And none of its four conditions requires freedom from the broker's control — unlike § 201.070, which requires that the individual \"determines the method of performing the service,\" and § 201.073, which requires that the individual \"may accept or reject a job from the delivery service\" — so a broker may supervise as closely as the Commission's rules require without endangering the exclusion.",
      "It confines the exclusion to real estate licensees, which is why the section is headed SERVICE AS REAL ESTATE BROKER; the control requirement is imported from § 201.070, which supplies the general test for every exclusion in the subchapter.",
      "It extends the exclusion across the whole Labor Code, including chapter 21, which is why a sales agent who satisfies the four conditions cannot be an employee for discrimination purposes.",
      "It confines the exclusion to federal tax treatment, matching the opening words of 26 U.S.C. § 3508(a), \"For purposes of this title,\" which is why one written contract satisfies both statutes.",
      ],
    rationale: "The module makes the boundary and the deliberate silence the two teaching points. The third choice is the error the next unit is built to prevent: § 201.072 excludes real estate service from \"employment\" for unemployment compensation purposes only, and chapter 21 sits in a different subtitle with its own definitions. The fourth confuses the two statutes' limiting phrases — § 201.072's is the Texas unemployment subtitle, § 3508(a)'s is Title 26 — even though one well-drafted agreement can satisfy both.",
    teaches: "module-09.md#unit-independent-contract-agreements",
    source: "Texas Labor Code §§ 201.070, 201.072, 201.073; 26 U.S.C. § 3508(a).",
  }),

  item("LOA-F085", {
    topic: "T09", unit: "T09U1",
    prompt: "A written agreement between a brokerage and a sponsored sales agent recites her Texas licence and expressly provides that she will not be treated as an employee with respect to the services for federal tax purposes. The firm also pays her a guaranteed $2,000 monthly draw for floor duty on top of her commission split. Which condition of Labor Code § 201.072(1) is put in question, and what does this course state about it?",
    choices: [
      "Condition (C) — substantially all remuneration for the service, whether in cash or other form of payment, must be directly related to sales or other output, including the performance of the service, and not to the number of hours worked. Commission on closings is output-based pay and an hourly rate or guaranteed monthly amount is not, so the firm has a mixed-remuneration problem; but neither § 201.072 nor 26 U.S.C. § 3508 defines \"substantially all,\" and no Treasury regulation, Internal Revenue Service ruling or Texas Workforce Commission rule construing the phrase was held for this course, so the threshold is not taught here.",
      "Condition (D), because a guaranteed draw is compensation the written contract must separately describe, and an agreement that omits it does not provide what the subparagraph requires.",
      "Condition (A), because floor duty is not activity described by the definition of \"broker\" in Occupations Code § 1101.002, so the exclusion fails at its first requirement whatever the pay arrangement.",
      "No condition is in question. The Internal Revenue Service's twenty-factor control test governs mixed remuneration, and this course states the threshold at which output-based pay ceases to be substantially all.",
    ],
    rationale: "Condition (C) is the one brokerages most often break by accident, and the module both identifies the problem and refuses to supply a number for it — the phrase is undefined in both statutes and no construing authority was held. The fourth choice is the error the module names directly: it does not state a position on the twenty-factor test, because the IRS's guidance and the Treasury regulations under § 3508 were not held. Condition (D) is the written-contract-plus-federal-tax-clause condition, which this agreement satisfies.",
    teaches: "module-09.md#unit-independent-contract-agreements",
    source: "Texas Labor Code § 201.072(1); 26 U.S.C. § 3508(b)(1); Texas Occupations Code § 1101.002.",
  }),

  item("LOA-F086", {
    topic: "T09", unit: "T09U2",
    prompt: "A broker who has practised alone for six years hires her first employee, a part-time assistant. Which of Labor Code chapter 21's coverage thresholds does that hire cross, and which does it not?",
    choices: [
      "It crosses Subchapter C-1's. Section 21.141 defines \"employer\" for that subchapter as a person who employs one or more employees or who acts directly in the interests of an employer in relation to an employee, and § 21.142 makes an employer liable where sexual harassment of an employee occurs and the employer or the employer's agents or supervisors know or should have known it was occurring and fail to take immediate and appropriate corrective action. It does not cross the general definition at § 21.002(8), which requires 15 or more employees for each working day in each of 20 or more calendar weeks in the current or preceding calendar year.",
      "It crosses neither, because a part-time worker is not counted toward either threshold and § 21.002(7) defines \"employee\" as an individual employed by an employer, which presupposes an employer already covered.",
      "It crosses both, because § 21.002(8)(B) makes an agent of a person described by Paragraph (A) an employer in their own right, and a broker who takes personnel decisions is such an agent.",
      "It crosses the general threshold only, because § 21.141's one-employee language describes the persons the subchapter protects rather than the employers it covers.",
    ],
    rationale: "The module calls Subchapter C-1 the one-employee subchapter and says a two-person brokerage is inside it the day it hires its first assistant. The general threshold counts employees on the terms § 21.002(8)(A) states, and one part-time assistant does not reach 15. The third choice misreads § 21.002(8)(B), which makes an agent of a *covered* person an employer — it does not supply coverage where the principal is not covered. The fourth inverts § 21.141, which defines who the employer is, not who is protected.",
    teaches: "module-09.md#unit-employment-law",
    source: "Texas Labor Code §§ 21.002(7), (8), 21.051, 21.141, 21.142.",
  }),

  item("LOA-F087", {
    topic: "T09", unit: "T09U2",
    prompt: "A brokerage's salaried office coordinator raises a discrimination complaint. Which statement about Labor Code chapter 21 — its stated purpose, who administers it, and what this course does and does not say about a sponsored sales agent's status under it — is accurate?",
    choices: [
      "Section 21.001 states the chapter's purposes, the first being to provide for the execution of the policies of Title VII of the Civil Rights Act of 1964 and its subsequent amendments; § 21.0015 transfers the powers and duties exercised by the Commission on Human Rights under the chapter to the Texas Workforce Commission; and § 21.051 carries the core prohibition on seven characteristics. Whether a Texas court applying the chapter would treat a particular sales agent as an employee turns on judicial decisions applying its definitions to real facts, and no case law was held for this course — so this course does not say a sales agent can never bring such a claim, and does not say one always can.",
      "Chapter 21 is administered by the Texas Real Estate Commission for license holders and by the Texas Workforce Commission for everyone else, which is why § 1101.652(b)(32) exists as a parallel disciplinary ground.",
      "Section 21.001 states that the chapter displaces Title VII in Texas, which is why the texts of Title VII and the Americans with Disabilities Act were not held for this course and are not taught.",
      "Section 21.051 lists the same eight characteristics as 22 TAC § 531.19, so a complaint under either provision is decided on the same list and a sales agent is an employee for both purposes.",
    ],
    rationale: "The chapter is Texas's state-law counterpart to the federal scheme, built to track it: § 21.001's first stated purpose is to provide for the execution of the policies of Title VII. The module teaches the Texas chapter and does not state what Title VII or the ADA say, because those texts were not held — which is the reverse of the third choice's claim about displacement. Section 21.051 carries seven characteristics; 22 TAC § 531.19 carries eight, adding ancestry, and § 1101.652(b)(32) protects owners, potential buyers, landlords and potential tenants rather than employees.",
    teaches: "module-09.md#unit-employment-law",
    source: "Texas Labor Code §§ 21.001, 21.0015, 21.002, 21.051; Texas Occupations Code § 1101.652(b)(32); 22 TAC § 531.19.",
  }),

  item("LOA-F088", {
    topic: "T09", unit: "T09U3",
    prompt: "Two provisions use the word \"employ\" in different senses. Which reading is correct?",
    choices: [
      "Occupations Code § 1101.002(1)(B)(i) uses the engagement sense — \"Broker\" includes a person who is employed by or for an owner of real estate to sell any portion of the real estate — while 22 TAC § 535.5(c) and (d)(2) use the labour-law sense, exempting an employee employed by a business entity to buy, sell or lease real property for the entity and defining that employee as a person employed and directly compensated by the entity, adding that an independent contractor is not an employee.",
      "Both use the labour-law sense, which is why an independent contractor sales agent is outside both provisions and needs no licence to sell property for a business entity that sponsors her.",
      "Both use the engagement sense, which is why a client who \"employs\" a broker is an employer for purposes of Labor Code chapter 21.",
      "Section 1101.002(1)(B)(i) uses the labour-law sense and § 535.5(c) the engagement sense, which is why an employee of a business entity is inside the definition of broker while a person engaged by an owner is exempt.",
    ],
    rationale: "The module's instruction is to tell the senses apart from context, and it gives these two provisions as the pair. Section 535.5(d)(2) makes the labour-law sense explicit by excluding independent contractors from the exemption; § 1101.002(1)(B)(i) uses \"employed by or for an owner\" in the older engagement sense and puts such a person *inside* the broker definition rather than outside it, which is what the fourth choice reverses.",
    teaches: "module-09.md#unit-employment-relationships-between-brokers-and-principals",
    source: "Texas Occupations Code § 1101.002(1)(B)(i); 22 TAC § 535.5(c), (d)(2).",
  }),

  item("LOA-F089", {
    topic: "T09", unit: "T09U3",
    prompt: "A broker brings on an unlicensed person as a \"marketing partner\" who is expected to meet prospective buyers at listings and walk them through the properties. Which disciplinary ground does the arrangement itself reach, and what makes the label irrelevant?",
    choices: [
      "Section 1101.652(b)(26), which reaches establishing an association \"by employment or otherwise\" with a person other than a license holder if that person is expected or required to act as a license holder — those four words are why the label does not matter, whether the person is called an employee, a contractor, a partner or an assistant.",
      "Section 1101.652(b)(11), which reaches paying or dividing a commission or fee with a person who is not a license holder; the association is lawful until money changes hands.",
      "Section 1101.652(b)(1), negligence or incompetence in brokerage, because a broker who staffs showings with unlicensed people is not exercising competent supervision; the association itself is not a separate ground.",
      "None until the person actually shows a property, at which point 22 TAC § 535.4(c) makes the showing the violation and the association is merely evidence of it.",
    ],
    rationale: "The module isolates \"by employment or otherwise\" as the phrase that makes the label irrelevant, and the ground reaches the association itself — the violation does not wait for the showing or for the payment, which is what the second and fourth choices assume. Section 535.4(c) does make showing an act requiring a licence, and its definition of showing includes unlocking or providing access and hosting an open house, but that is a separate provision addressed to the person doing the showing.",
    teaches: "module-09.md#unit-employment-relationships-between-brokers-and-principals",
    source: "Texas Occupations Code § 1101.652(b)(1), (11), (26); 22 TAC §§ 535.2, 535.4(c).",
  }),

  item("LOA-F090", {
    topic: "T09", unit: "T09U4",
    prompt: "Under 22 TAC § 535.5(g), which statement by an unlicensed administrative employee answering a brokerage's business line is permitted?",
    choices: [
      "Confirming to a caller who has been told she is an administrative assistant that the advertised listing is 2,410 square feet, listed at $389,000, with a 30-day close requested — every element of the permission is load-bearing: the person must be identified to callers as such, the information must be a confirmation of size, price and terms, and the property must have been advertised.",
      "Telling the same caller that the seller will probably take $370,000, because that is information about the price of an advertised property and the permission names price expressly.",
      "Confirming the same three items without identifying herself, because the rule's identification requirement applies to an answering service rather than to a brokerage's own clerical staff.",
      "Confirming the same three items about any listing in the brokerage's inventory, because the permission is keyed to the license holder's advertising generally rather than to the individual property.",
    ],
    rationale: "The rule permits an answering service or clerical or administrative employees \"identified to callers as such\" to confirm information concerning the size, price and terms of property advertised. The second choice is negotiating and outside the rule; the module gives that contrast directly. The third and fourth drop the identification element and the advertised-property element respectively, and the module says every element is load-bearing.",
    teaches: "module-09.md#unit-employment-and-compensation-of-personal-assistants",
    source: "22 TAC §§ 535.5(g), 535.4.",
  }),

  item("LOA-F091", {
    topic: "T09", unit: "T09U4",
    prompt: "Which four conditions must all be met for the referral exemption in 22 TAC § 535.20(b), and which one most often defeats an arrangement?",
    choices: [
      "The person is engaged in the business of selling goods or services to the public; sells goods or services to a real estate license holder who intends to offer them as an inducement to potential buyers, sellers, landlords or tenants; after that sale, refers the person's own customers to the license holder; and the payment to the person for the goods or services is not contingent on the consummation of a real estate transaction by the person's customers — and it is the last that fails most often, because the moment payment turns on whether a referred customer closes, the exemption is gone.",
      "The referral is made without the expectation of valuable consideration; the payment is under $50; the person is not in the real estate business; and the license holder discloses the arrangement to the client — the first being the one most often failed.",
      "The person holds a licence in another state; refers only to license holders; is paid at market rates; and does not conduct negotiations in Texas — the last being the one most often failed.",
      "The person is a settlement service provider; discloses the payment on TREC No. RSC-4; is paid at market rates for services actually performed; and does not appear on a preferred-provider list — the second being the one most often failed.",
    ],
    rationale: "The module sets out all four conditions and names the last as the recurring failure. The second choice restates the general rule in § 535.20(a) rather than the exemption — referring with the expectation of valuable consideration is what requires a licence, and \"valuable consideration\" includes gifts of merchandise having a retail value greater than $50, so a $75 gift card is inside it. The third describes the out-of-state cooperation rule in § 1101.651(a)(2) and 22 TAC § 535.131; the fourth mixes in 22 TAC § 535.148.",
    teaches: "module-09.md#unit-employment-and-compensation-of-personal-assistants",
    source: "22 TAC §§ 535.20(a), (b), 535.131, 535.148; Texas Occupations Code § 1101.651(a).",
  }),

  item("LOA-F092", {
    topic: "T09", unit: "T09U5",
    prompt: "A broker writes a sales agent a narrow written scope of authorised activities and then knowingly lets the agent work outside it for months. What does 22 TAC § 535.2(a) produce?",
    choices: [
      "The broker is responsible for those acts anyway: the subsection's third sentence provides that if a broker permits a sponsored sales agent to conduct activities beyond the scope explicitly authorised by the broker, those are acts for which the broker is responsible — so a written scope protects the broker only for as long as the broker enforces it. The same subsection requires the notice of scope to be in writing and requires any limitation or revocation of scope to be in writing, while providing that the broker \"is not required to supervise the sales agents directly.\"",
      "The broker is not responsible, because the subsection makes the broker responsible for \"the authorized acts\" of sponsored sales agents and these acts were outside the authorised scope.",
      "The broker is not responsible provided the broker orally instructed the agent to stop, because the subsection requires only that the scope be communicated and does not prescribe the form of a limitation.",
      "The broker is responsible only if the Commission finds the broker failed to supervise directly, which is the standard the subsection's second sentence establishes.",
    ],
    rationale: "The three sentences of subsection (a) carry three rules and the module names the third as the trap. The second choice reads the second sentence and stops before the third. The third choice misses the writing requirement for a limitation or revocation — an oral instruction does not shrink the written scope for purposes of this rule. The fourth inverts the second sentence, which relieves the broker of a duty to supervise directly rather than making direct supervision the test of responsibility.",
    teaches: "module-09.md#unit-broker-responsibility-relationships-between-brokers-and-agents-5352",
    source: "22 TAC § 535.2(a); Texas Occupations Code § 1101.803.",
  }),

  item("LOA-F093", {
    topic: "T09", unit: "T09U5",
    prompt: "Which requirement of 22 TAC § 535.2 is stated as a numerical floor on new activities, and how is it counted?",
    choices: [
      "Subsection (i) requires the broker's written policies to ensure that when a sales agent performs a type of real estate brokerage activity for the first three times, \"the broker must require\" that the sales agent receive coaching and assistance from an experienced license holder competent for that activity — counted per *type* of activity, so the first three listings, the first three buyer representations and the first three leases are counted separately, and the verb is \"must require\" rather than encourage or make available.",
      "Subsection (i) requires the broker to make coaching available for the first three transactions a sales agent completes in any activity, counted once per agent across the agent's career at the firm.",
      "Subsection (j) requires a broker or delegated supervisor to provide three coaching sessions within two calendar days of a sales agent's first transaction of a new type.",
      "Subsection (e) requires a delegated supervisor to be assigned for the first three months of any new type of activity, which is the three-consecutive-month period that also triggers the Commission notification.",
    ],
    rationale: "The module calls this the most concrete supervision obligation in the rule and stresses both the verb and the counting. Subsection (j) is the two-calendar-day response clock from broker or delegated supervisor to sponsored sales agents; subsection (e) carries the written delegation, the requirement that anyone who leads, supervises, directs or manages a team be delegated as a supervisor, and the 30-day Commission notification for a delegation that has lasted or is anticipated to last more than three consecutive months — three different provisions the third and fourth choices conflate.",
    teaches: "module-09.md#unit-broker-responsibility-relationships-between-brokers-and-agents-5352",
    source: "22 TAC § 535.2(e), (i), (j).",
  }),

  item("LOA-F094", {
    topic: "T09", unit: "T09U6",
    prompt: "A sales agent forms an entity to receive her compensation. Which structure satisfies Occupations Code § 1101.355(d), and what happens if a condition is missing?",
    choices: [
      "All five conditions are required: the entity receives compensation on behalf of a broker or sales agent licensed under the chapter that the license holder earned while engaged in real estate brokerage; it performs no other acts of a broker; it is a limited liability company as defined by Business Organizations Code § 101.001 or an S corporation as defined by 26 U.S.C. § 1361; it is registered with the commission; and it is at least 51 percent owned by the license holder on whose behalf it receives compensation. Miss one and § 1101.355(c)'s default applies — a business entity that receives compensation on behalf of a license holder must be licensed as a broker.",
      "Only the ownership condition matters, because § 1101.355(d)'s other conditions describe the entity's ordinary characteristics rather than imposing requirements; a 50/50 limited liability company with a spouse therefore qualifies.",
      "A general partnership qualifies provided it is registered with the commission and performs no other acts of a broker, because the entity-type condition names limited liability companies and S corporations as examples rather than as an exhaustive list.",
      "Registration is optional where the entity is at least 51 percent owned by the license holder, because 22 TAC § 535.5(h) states the five conditions in the alternative and points to § 535.35 only for entities that choose to register.",
    ],
    rationale: "The module states that every one of the five conditions is required, that 22 TAC § 535.5(h) states the same five and points to § 535.35 for the registration process, and that § 535.147(c) bars sharing a commission or fees with an unlicensed entity created to collect on the license holder's behalf unless it is exempt under § 535.5 and § 1101.355(d). The consequences it draws directly: a general partnership will not do, a C corporation will not do, and a 50/50 LLC with a spouse will not do.",
    teaches: "module-09.md#unit-compensation-issues",
    source: "Texas Occupations Code § 1101.355(c), (d); 22 TAC §§ 535.5(h), 535.35, 535.147(c).",
  }),

  /* ══ T10 Agency, Ethics and the Law — 155 prescribed minutes ═══════════════════════════════ */

  item("LOA-F095", {
    topic: "T10", unit: "T10U1",
    prompt: "Property Code chapter 301 supplies one example of a single prohibition reaching three enforcement systems at once. Which description is accurate?",
    choices: [
      "Section 301.171 makes intimidating or interfering with a protected person by force or threat of force an offense and provides that it is a Class A misdemeanor; § 301.151(a) lets an aggrieved person file a civil action in district court; and § 301.112 lets a state agency assess civil penalties administratively — one underlying prohibition, three enforcement machines.",
      "Section 301.171 authorises the Commission to suspend a licence, § 301.151(a) authorises an administrative penalty, and § 301.112 authorises a criminal prosecution — the three tracks the fair housing chapter creates against a license holder.",
      "Section 301.171 creates a private cause of action only; the criminal and administrative tracks belong to the federal Fair Housing Act at 42 U.S.C. § 3617 and are not duplicated in Texas law.",
      "All three sections describe the same administrative track at different stages — complaint, investigation and penalty — which is why chapter 301 is administered by a single agency.",
    ],
    rationale: "The module uses these three sections precisely because they show one prohibition with a criminal, a civil and an administrative face. The second choice misassigns each of them and imports TREC, which is not the fair housing chapter's enforcer — § 301.0015 transfers those powers to the Texas Workforce Commission. What links the fair housing system back to TREC is § 301.114, which requires findings and an order to be sent to the licensing agency within 30 days with a recommendation of appropriate disciplinary action.",
    teaches: "module-10.md#unit-distinctions-between-law-ethics-and-morals",
    source: "Texas Property Code §§ 301.0015, 301.112, 301.114, 301.151(a), 301.171.",
  }),

  item("LOA-F096", {
    topic: "T10", unit: "T10U1",
    prompt: "A seller asks the Commission to order her former agent to pay the $18,000 she says the agent's conduct cost her. What does § 1101.659(b) permit, and what follows?",
    choices: [
      "A refund order may not exceed the amount the consumer paid to the person for a service or accommodation regulated by the commission, and the commission may not require payment of other damages or estimate harm in a refund order — the Commission is a regulator rather than a small-claims court, so a consumer who wants damages sues, and § 1101.801 confirms that discipline does not relieve the person from civil or criminal liability.",
      "A refund order may reach the consumer's actual damages up to the $5,000 administrative penalty ceiling in § 1101.702(a), which is why the two provisions are read together.",
      "The Commission may order the full amount because § 1101.659(b) caps only the administrative penalty and leaves restitution to the Commission's discretion.",
      "The Commission must refer the claim to the real estate recovery trust account under § 1101.601, which pays consumer damages caused by an act described by § 1101.602 and is the exclusive route to compensation.",
    ],
    rationale: "The subsection does two things: it caps a refund at what the consumer paid the person for a regulated service, and it forbids the Commission to require other damages or to estimate harm. The module's summary is that the Commission is a regulator, not a small-claims court. The fourth choice overstates the recovery trust account — the module notes the account exists, and that the acts it covers and the procedural conditions on recovery were not read for that unit — and nothing makes it exclusive of a civil suit.",
    teaches: "module-10.md#unit-distinctions-between-law-ethics-and-morals",
    source: "Texas Occupations Code §§ 1101.601, 1101.659(b), 1101.702(a), 1101.801.",
  }),

  item("LOA-F097", {
    topic: "T10", unit: "T10U2",
    prompt: "Which characteristics does 42 U.S.C. § 3604(a) name, and where does the federal Act state the disability prohibition in the sale or rental of a dwelling?",
    choices: [
      "Section 3604(a) names six — race, color, religion, sex, familial status and national origin — and the disability prohibition is at § 3604(f)(1), because disability protection was added later and Congress put the substantive prohibitions in their own subsection rather than editing (a) and (b); § 3604(c), by contrast, names seven, adding handicap.",
      "Section 3604(a) names seven, including handicap, which is why refusing to rent because of a disability is cited to § 3604(a); subsection (f) supplies only the design and construction requirements.",
      "Section 3604(a) names six and § 3604(c) names the same six; the disability prohibition appears only in 42 U.S.C. § 3605(a), which covers residential real estate-related transactions.",
      "Section 3604(a) names eight, adding handicap and ancestry, matching the list in 22 TAC § 531.19.",
    ],
    rationale: "The module tells students to read the three lists slowly because the difference is not a drafting slip. Subsections (a) and (b) carry six; (c) carries seven, adding handicap; and the substantive disability prohibition in the sale or rental of a dwelling is § 3604(f)(1), which also reaches discrimination because of a handicap of a person residing or intending to reside in the dwelling and of \"any person associated with that buyer or renter.\" The eight-characteristic list including ancestry is the Commission's own rule at 22 TAC § 531.19, and § 1101.652(b)(32) — not any federal provision.",
    teaches: "module-10.md#unit-federal-and-state-law-relating-to-conduct",
    source: "42 U.S.C. §§ 3604(a), (b), (c), (f)(1), 3605(a); 22 TAC § 531.19; Texas Occupations Code § 1101.652(b)(32).",
  }),

  item("LOA-F098", {
    topic: "T10", unit: "T10U2",
    prompt: "A tenant with a disability asks a landlord for two things: permission to install a grab bar in the bathroom, and an exception to a no-pets policy for an assistance animal. On the text of 42 U.S.C. § 3604(f)(3) and Property Code § 301.025(c), which statement is accurate?",
    choices: [
      "The grab bar is a *modification* — a physical change to the premises, made at the expense of the person with the disability, refused only where it \"may be necessary to afford such person full enjoyment of the premises,\" and on a rental the landlord may where reasonable condition permission on the renter agreeing to restore the interior, reasonable wear and tear excepted. The policy exception is an *accommodation* — a change in rules, policies, practices or services, whose standard is that it \"may be necessary to afford such person equal opportunity to use and enjoy a dwelling,\" and the statute does not put its cost on the tenant.",
      "Both are modifications, made at the tenant's expense and subject to the restoration condition, because both alter what the landlord provides.",
      "Both are accommodations, and both must be shown to be indispensable rather than merely potentially necessary, because the statute conditions each on necessity.",
      "The grab bar is an accommodation and the policy exception a modification; the standard for both is \"full enjoyment of the premises,\" and the landlord may condition either on a restoration agreement.",
    ],
    rationale: "The module names four things students routinely drop, and this item turns on three of them: which is which and who pays; the \"may be necessary\" qualifier, which the third choice truncates into indispensability; and the deliberately different standards — full enjoyment for a modification, equal opportunity for an accommodation. The restoration condition belongs to modifications on a rental only. Property Code § 301.025(c) states the Texas versions in the same terms, with the same qualifiers.",
    teaches: "module-10.md#unit-federal-and-state-law-relating-to-conduct",
    source: "42 U.S.C. § 3604(f)(3)(A), (B); Texas Property Code § 301.025(c).",
  }),

  item("LOA-F099", {
    topic: "T10", unit: "T10U2",
    prompt: "An owner of two single-family rent houses says the owner-seller exemption lets him refuse a buyer for any reason. He has signed a listing with a brokerage. What do 42 U.S.C. § 3603(b) and Property Code § 301.041 actually provide?",
    choices: [
      "The exemption is gone. The federal exception applies \"only if such house is sold or rented (A) without the use in any manner of the sales or rental facilities or the sales or rental services of any real estate broker, agent, or salesman,\" and § 301.041(a)(1)(B)(i) carries the same condition for a broker, agent or salesperson licensed under Chapter 1101; the federal exemption never covers § 3604(c) in any event, so the advertising prohibition applies to an exempt owner too.",
      "The exemption stands, because it is measured by how many single-family houses the owner holds at one time and he holds two; engaging a broker changes who performs the sale, not whether the owner qualifies.",
      "The exemption stands under Texas law but not under federal law, because § 301.041(a) exempts the sale from §§ 301.021, 301.023, 301.024 and 301.025 without any condition about license holders.",
      "The exemption is gone only as to the broker; the owner retains it, which is why § 301.041(b) limits it to one sale in a 24-month period where the owner was not the most recent resident.",
    ],
    rationale: "The module's conclusion is blunt: the owner-seller exemptions evaporate the instant a license holder is engaged, and the seller who says it is his house and he can sell to whomever he wants is describing an exemption his listing agreement destroys. Both statutes carry the condition, so the third choice is wrong on the Texas text. The § 301.041(b) 24-month limit is a further restriction on the exemption, not a preservation of it for the owner alone.",
    teaches: "module-10.md#unit-federal-and-state-law-relating-to-conduct",
    source: "42 U.S.C. §§ 3603(b), 3604(c); Texas Property Code § 301.041(a), (b).",
  }),

  item("LOA-F100", {
    topic: "T10", unit: "T10U2",
    prompt: "A buyer asks a license holder on the telephone whether a particular neighbourhood is \"mostly families like us.\" Which analysis of 22 TAC § 531.19 is correct?",
    choices: [
      "Answering responds to an inquiry indicating a preference; forwarding the question to the listing agent facilitates one; and volunteering that the seller is an immigrant family makes a disclosure. The rule prohibits inquiring about, responding to or facilitating inquiries about, and disclosing, so it can be violated without any refusal to sell — and its list runs to eight characteristics, the statutory seven plus ancestry.",
      "None of the three violates the rule unless the license holder in fact refuses to show a property on a protected basis, because § 531.19 is the Commission's implementation of the statutory prohibitions on refusing, discriminating, representing, inducing and publishing.",
      "Answering violates the rule but forwarding the question does not, because the rule's verbs reach the license holder's own statements rather than the transmission of a client's question.",
      "The rule reaches only the seven characteristics named in Property Code §§ 301.022 to 301.027, so a question about ancestry is outside it and may be answered.",
    ],
    rationale: "The module's point is that the verbs are what make the rule broader than either statute: the statutes prohibit refusing, discriminating, representing, inducing and publishing, while § 531.19 prohibits inquiring about, responding to or facilitating inquiries about, and making a disclosure — so the rule can be violated without any refusal. Its list is eight characteristics: race, color, religion, sex, national origin, ancestry, familial status and disability. The module also supplies the correct response and labels it practice rather than law.",
    teaches: "module-10.md#unit-federal-and-state-law-relating-to-conduct",
    source: "22 TAC § 531.19; Texas Property Code §§ 301.021–301.027; Texas Occupations Code § 1101.652(b)(32).",
  }),

  item("LOA-F101", {
    topic: "T10", unit: "T10U3",
    prompt: "What are the six words that gate § 1101.652(b), and why does subsection (a-1) exist separately?",
    choices: [
      "The Commission may act under subsection (b) \"if the license holder, while engaged in real estate brokerage\" does one of its thirty-four listed things — and subsection (a-1) exists because conduct in the license holder's own deals is not brokerage, so the Legislature gave it its own home: misrepresentation, dishonesty or fraud when selling, buying, trading or leasing property in the name of the license holder, the license holder's spouse, or a person related within the first degree by consanguinity; failure to produce records on request; and failure to use a required contract form.",
      "Subsection (b) is gated by the words \"if the license holder holds an active license,\" and subsection (a-1) exists to reach conduct by inactive license holders.",
      "Subsection (b) is gated by the words \"while acting as an agent for another,\" borrowed from 22 TAC § 531.2, and subsection (a-1) covers conduct toward the Commission itself.",
      "Subsection (b) has no gating words; subsections (a), (a-1) and (b) are three lists of equal scope, divided only for length.",
    ],
    rationale: "The module insists on precision about the internal architecture because the subsection changes what the Commission must prove. Subsection (a) carries eight grounds applying to a license holder generally without regard to brokerage; (a-1) carries three about the license holder's own transactions and records; and (b)'s thirty-four grounds are gated by the brokerage clause. The fourth choice would erase the distinction the module builds the unit around.",
    teaches: "module-10.md#unit-trela-and-rules-of-the-commission-ethics",
    source: "Texas Occupations Code § 1101.652(a), (a-1), (b); 22 TAC §§ 531.2, 535.144.",
  }),

  item("LOA-F102", {
    topic: "T10", unit: "T10U3",
    prompt: "Under § 1101.204, which complaint may the Commission investigate?",
    choices: [
      "A signed, written complaint submitted within four years of the incident where the complaint and any evidence presented with it provide reasonable cause for an investigation — subsection (c) bars an investigation on a complaint submitted later than the fourth anniversary of the date of the incident, and subsection (f) bars any investigation or action initiated on the basis of an anonymous complaint.",
      "Any complaint that provides reasonable cause, including an anonymous one, provided it is submitted within two years of the incident, which is the window § 1101.204(c) sets.",
      "Only a complaint from a person who suffered a financial loss, since subsection (h) requires the Commission to prioritise consumer complaints and § 1101.659(b) limits a refund to what the consumer paid.",
      "A signed, written complaint with no time limit, because § 1101.204(c)'s four-year period governs when the Commission must complete an investigation rather than when a complaint may be brought.",
    ],
    rationale: "The trigger in subsection (b) has two elements — a signed, written complaint, and reasonable cause from the complaint and any evidence with it — and two immediate limits follow: the four-year window in (c) and the anonymity bar in (f). The module also notes that those four years are designed to line up with the four-year record retention in 22 TAC § 535.2, so a broker who purges at three years has destroyed the file the Commission is entitled to ask for. Subsection (a) separately allows the Commission or its staff to bring a complaint on its own initiative.",
    teaches: "module-10.md#unit-trela-and-rules-of-the-commission-ethics",
    source: "Texas Occupations Code §§ 1101.204(a)-(i), 1101.659(b); 22 TAC §§ 535.2, 535.141.",
  }),

  item("LOA-F103", {
    topic: "T10", unit: "T10U3",
    prompt: "A license holder receives a notice of violation from the executive director and lets twenty days pass without responding. What does § 1101.704 produce?",
    choices: [
      "The same outcome as acceptance: subsection (a) gives twenty days from receipt to accept the determination or to request in writing a hearing on the occurrence of the violation, the amount of the penalty, or both, and subsection (b) provides that if the person accepts \"or fails to respond in a timely manner to the notice,\" the commission by order approves the determination and orders payment or imposes the sanction — missing the twentieth day is not a neutral act.",
      "Nothing; the matter is referred automatically to the State Office of Administrative Hearings under § 1101.705, because a person who has not accepted the determination is entitled to a hearing.",
      "A thirty-day extension, because § 1101.707(a) gives thirty days after an order becomes final and the two periods run consecutively from the notice.",
      "Dismissal, because § 1101.204(i) requires the Commission to dismiss an allegation it determines at any time to be inappropriate or without merit, and an unanswered notice is an allegation with no response to weigh.",
    ],
    rationale: "The module states the consequence in terms: missing the twentieth day is an acceptance. Section 1101.705 governs the SOAH hearing when one is requested; § 1101.707(a) gives thirty days after the order becomes final to pay or to file a petition for judicial review, with enforcement stayed by paying into escrow, by supersedeas bond, or by an affidavit of financial inability the executive director may contest within five days. Section 1101.204(i) is about the Commission's own determination of merit, not about a respondent's silence.",
    teaches: "module-10.md#unit-trela-and-rules-of-the-commission-ethics",
    source: "Texas Occupations Code §§ 1101.703, 1101.704, 1101.705, 1101.707(a), 1101.204(i).",
  }),

  item("LOA-F104", {
    topic: "T10", unit: "T10U4",
    prompt: "How does 22 TAC § 535.1 define a trade association, and what does § 1101.053(b) do about the relationship between such bodies and the Commission?",
    choices: [
      "A trade association is a nonprofit voluntary member association or organization whose membership consists primarily of persons licensed as real estate license holders who pay dues, that is governed by a board of directors elected by the members, and that subscribes to a written code of professional conduct or ethics — so a written ethics code is constitutive of what a trade association is. And § 1101.053(b) bars a person from Commission membership, or from Commission employment in a bona fide executive, administrative or professional capacity, if the person or the person's spouse holds the offices the subsection names in a Texas real estate trade association.",
      "A trade association is any organisation of license holders recognised by the Commission, and § 1101.053(b) requires the Commission to include at least one trade association officer among its members so that the regulated industry is represented.",
      "A trade association is defined only by § 1101.053(a) as a voluntarily joined statewide association of business or professional competitors, and no Commission rule defines the term; § 1101.053(b) concerns conflicts of interest among Commission contractors rather than members and employees.",
      "A trade association is a nonprofit that operates a multiple listing service, which is why 22 TAC § 535.5 provides that such organisations need not be licensed under the Act.",
    ],
    rationale: "The rule's three elements are the whole legal character of these bodies, and the third — subscribing to a written code — is what makes the code constitutive rather than incidental. Section 1101.053(a) supplies TRELA's own mirror definition, frankly describing an association of competitors organised to promote their common interest, and subsection (b) builds a wall between the regulator and the trade body, which is the opposite of what the second choice asserts. Rule 535.5's MLS provision is a licensing point, not a definition.",
    teaches: "module-10.md#unit-professional-codes-of-ethics",
    source: "22 TAC §§ 535.1, 535.5; Texas Occupations Code § 1101.053(a), (b).",
  }),

  item("LOA-F105", {
    topic: "T10", unit: "T10U4",
    prompt: "A member is expelled from a trade association after a hearing panel finds a code violation. What follows for the member's Texas licence, and what would follow if the panel had instead declined to act?",
    choices: [
      "Neither outcome decides anything about the licence. The association's obligation binds by contract, so its sanctions reach membership and the privileges that come with it — including multiple listing service participation — while only the Commission may suspend or revoke a licence under § 1101.656(a) and § 1101.652; an expulsion is not a finding that TRELA was violated, and a decision not to act is not a finding that the conduct was lawful.",
      "An expulsion requires the Commission to open a proceeding, because 22 TAC § 535.1 makes subscription to a written code constitutive of a trade association and a code finding is therefore a rule finding.",
      "An expulsion has no effect on the licence, but a panel's decision not to act does bind the Commission, because the Commission may not relitigate conduct a competent private tribunal has considered.",
      "Both outcomes bind the Commission, because § 1101.801 provides that disciplinary action does not relieve a person of civil or criminal liability and an association proceeding is a civil proceeding for that purpose.",
    ],
    rationale: "The module states both halves of the error explicitly: if a code's disciplinary body declines to act, that is not a finding that the conduct was lawful and has no effect at all on the Commission's authority; and if you were expelled, that is not a finding that you violated TRELA. Two systems, two sets of tools — an association cannot touch the licence and the Commission cannot expel a member or take away MLS access. Section 1101.801 is about the parallel operation of discipline, civil and criminal liability, not about private tribunals.",
    teaches: "module-10.md#unit-professional-codes-of-ethics",
    source: "Texas Occupations Code §§ 1101.652, 1101.656(a), 1101.658(a), 1101.801; 22 TAC §§ 531.1, 535.1.",
  }),

  item("LOA-F106", {
    topic: "T10", unit: "T10U5",
    prompt: "Under the penalty bands the module reports from 22 TAC § 535.191, which grouping is correct?",
    choices: [
      "Failing to maintain a current mailing address and failing to enter into the written buyer agreement § 1101.563 requires sit in the bottom band; failing to give the IABS notice under § 531.20, acting negligently or incompetently, and failing to give a definite termination date sit in the middle band; discrimination, commingling, failing to account for another's money, breaching the fiduciary rule of § 535.156, and practising during a suspension sit in the top band.",
      "All disciplinary grounds under § 1101.652(b) sit in the top band and all rule violations in the bottom band, which is the distinction the schedule draws between statutory and administrative obligations.",
      "Discrimination sits in the middle band and the IABS failure in the top, because the schedule weights the notice obligations most heavily as the Commission's own rules.",
      "The schedule sets a single band of $100 to $5,000 and leaves the amount within it to the five factors in § 1101.702(b).",
    ],
    rationale: "The module presents the bands as a guide to the Commission's priorities — which mistakes the state treats as bookkeeping and which as betrayal — and gives these groupings. The schedule sets three bands, each expressed per violation per day: $100 to $1,500, $500 to $3,000, and $1,000 to $5,000, with authority to add up to twice the amount assessed where there is a history of previous violations, subject to the § 1101.702(a) ceiling of $5,000 for each violation. The five factors in § 1101.702(b) set the amount within a band; they do not replace the bands.",
    teaches: "module-10.md#unit-minimum-ethical-standards",
    source: "22 TAC § 535.191; Texas Occupations Code §§ 1101.563, 1101.652(b)(34), 1101.702(a), (b); 22 TAC §§ 531.20, 535.156.",
  }),

  item("LOA-F107", {
    topic: "T10", unit: "T10U5",
    prompt: "A license holder receives a Commission request for information about an informal complaint she is confident is meritless, and does not reply. What is the consequence?",
    choices: [
      "A fresh, independent violation. Section 1101.652(a)(4) reaches failing to provide within a reasonable time information requested by the commission that relates to a formal or informal complaint that would indicate a violation of the chapter or Chapter 1102, and § 1101.652(a-1)(2) reaches failure or refusal to produce on request, within a reasonable time, a document, book or record in the license holder's possession relating to a transaction she conducted — both are self-inflicted and survive the dismissal of the original complaint.",
      "None, provided the underlying complaint is in fact dismissed, because § 1101.204(i) requires dismissal of an allegation the Commission determines to be without merit and a dismissed complaint carries no collateral consequences.",
      "A violation only if the Commission first obtains an order compelling production, because § 1101.652(a-1)(2) reaches a refusal rather than an omission.",
      "A violation of § 1101.652(b)(33), disregarding or violating the chapter, which is the only ground reaching conduct toward the Commission itself.",
    ],
    rationale: "The module lists this as the thirteenth minimum standard and makes the point that both grounds are self-inflicted: the underlying complaint may be meritless and a failure to respond is a fresh, independent violation that survives the dismissal of the original one. Subsection (a-1)(2) reaches failing *or* refusing to produce, so no compulsion order is needed. Subdivision (b)(33) is gated by the brokerage clause and is not the provision addressed to responding to the Commission.",
    teaches: "module-10.md#unit-minimum-ethical-standards",
    source: "Texas Occupations Code §§ 1101.204(i), 1101.652(a)(4), (a-1)(2), (b)(33).",
  }),

  /* ══ T11 Deceptive Trade Practices and Consumer Protection Act — 140 prescribed minutes ════ */

  item("LOA-F108", {
    topic: "T11", unit: "T11U1",
    prompt: "Which statement about what this course holds on fraud and misrepresentation, and about where the distinctions that matter actually live, is accurate?",
    choices: [
      "The common-law elements of fraud, of negligent misrepresentation and of innocent misrepresentation are stated in judicial opinions; no case reporter or judicial opinion was held for this course, so none of those formulations is stated here as law. The distinctions that govern a license holder's exposure are written into statutes that were held — DTPA § 17.45(9) and (13) for the two states of mind, and Occupations Code § 1101.652 for the disciplinary grades of fault.",
      "The common-law elements of fraud are codified at Business & Commerce Code § 17.46(b)(24), which is why that subdivision requires an intent to induce.",
      "The elements of fraud were held for this course through Civil Practice & Remedies Code § 16.004(a)(4), which names fraud among the four-year actions and therefore defines it.",
      "The distinction has no practical importance because the DTPA has displaced the common-law causes of action entirely, which is what § 17.43 provides.",
    ],
    rationale: "The module is explicit about the limit and equally explicit that it matters little in practice, because the Legislature wrote the state-of-mind distinctions into the statutes that will actually be used. Section 16.004(a)(4) names fraud among the four-year actions without defining it — a limitations provision is not a definition. Section 17.43 says the opposite of the fourth choice: the subchapter's provisions are not exclusive and its remedies are in addition to those in other law.",
    teaches: "module-11.md#unit-fraud-versus-misrepresentation",
    source: "Business & Commerce Code §§ 17.43, 17.45(9), (13), 17.46(b)(24); Texas Occupations Code § 1101.652; Civil Practice & Remedies Code § 16.004(a).",
  }),

  item("LOA-F109", {
    topic: "T11", unit: "T11U1",
    prompt: "Which reading of the final clause of the DTPA's definition of \"intentionally\" at § 17.45(13) is correct?",
    choices: [
      "Intention may be inferred from objective manifestations, and also \"from facts showing that a defendant acted with flagrant disregard of prudent and fair business practices to the extent that the defendant should be treated as having acted intentionally\" — so conduct far enough outside ordinary professional care may be found intentional even where the defendant formed no plan to deceive anyone; the closing words are the bridge that carries recklessness into intent rather than a limitation that saves the defendant.",
      "The clause limits the inference: intention may be inferred only where the defendant's disregard was so flagrant that a court finds actual subjective intent, so the clause narrows the definition rather than widening it.",
      "The clause applies only to the \"knowingly\" standard at § 17.45(9), which is why that subdivision permits an inference from objective manifestations while (13) requires direct proof of a plan to deceive.",
      "The clause is inoperative in a real estate case because § 17.49(i) exempts a claim against a broker or salesperson arising from an act or omission while acting as one.",
    ],
    rationale: "The module warns that quoting the definition without the final clause teaches the opposite of the law. The definition requires actual awareness coupled with the specific intent that the consumer act in detrimental reliance — and then supplies two routes to an inference, the second of which reaches flagrant disregard of prudent and fair business practices. The fourth choice ignores the carve-outs in § 17.49(i), which is where every real case lives.",
    teaches: "module-11.md#unit-fraud-versus-misrepresentation",
    source: "Business & Commerce Code §§ 17.45(9), (13), 17.49(i).",
  }),

  item("LOA-F110", {
    topic: "T11", unit: "T11U2",
    prompt: "Which feature of the DTPA definition of \"consumer\" at § 17.45(4) explains why a buyer represented by a different brokerage, who signed nothing with the listing agent and paid the listing agent nothing, may sue that listing agent?",
    choices: [
      "The definition asks who \"seeks or acquires by purchase or lease, any goods or services\" and never uses the word privity — it does not require that the consumer bought anything from the defendant, paid the defendant, or had a contract with the defendant; and § 17.45(1) makes real property a good while § 17.45(2) makes brokerage a service.",
      "The definition reaches anyone injured by a deceptive act, because § 17.44(a) directs that the subchapter be liberally construed, and that instruction supplies standing where the definition does not.",
      "The definition confers standing on any party to a transaction, which is why § 17.45(10)'s \"business consumer\" is defined separately for commercial purchasers.",
      "The definition requires privity but § 17.506(c) waives it, providing that suit may be asserted without regard to privity where the third party knew or should have reasonably foreseen that information would be provided to a consumer.",
    ],
    rationale: "The module tells students to read the definition again and find the word privity — it is not there. Section 17.44(a)'s liberal-construction instruction colours interpretation but is not the source of standing, and § 17.506(c)'s privity language is a specific provision about suing the third party who supplied written information the defendant relied on, not a general waiver.",
    teaches: "module-11.md#unit-deceptive-trade-practices-and-consumer-protection",
    source: "Business & Commerce Code §§ 17.44(a), 17.45(1), (2), (4), (10), 17.50(a)(1), 17.506(c).",
  }),

  item("LOA-F111", {
    topic: "T11", unit: "T11U2",
    prompt: "A license holder tells a buyer that an option period \"lets you get out any time before closing.\" Which laundry-list subdivision does that most directly engage, and what does the comparison with § 17.46(b)(13) show?",
    choices: [
      "Section 17.46(b)(12) — representing that an agreement confers or involves rights, remedies or obligations which it does not have or involve, or which are prohibited by law — and it contains no scienter word, unlike § 17.46(b)(13), which reaches \"knowingly making false or misleading statements of fact concerning the need for parts, replacement, or repair service.\"",
      "Section 17.46(b)(13), because a statement about a contractual right is a statement of fact concerning a need, and the subdivision's \"knowingly\" is satisfied by a license holder's professional knowledge of contract forms.",
      "Section 17.46(b)(24), because describing the option period inaccurately conceals the true termination rights, and (24) is the only subdivision reaching statements about agreements.",
      "Neither. A statement about what a contract permits is advice about a legal document, which § 17.49(i) exempts as advice, judgment or opinion.",
    ],
    rationale: "The module gives this exact illustration for subdivision (12) — careless explanations of contract forms become DTPA claims — and pairs it with (13) to show which entries carry a scienter word and which do not. Subdivision (24) is the silence subdivision, reaching a failure to disclose. And the fourth choice misuses § 17.49(i): carve-out (1) removes an express misrepresentation of a material fact that cannot be characterised as advice, judgment or opinion, and a court reads the substance rather than the framing.",
    teaches: "module-11.md#unit-deceptive-trade-practices-and-consumer-protection",
    source: "Business & Commerce Code §§ 17.46(b)(5), (7), (12), (13), (24), 17.49(i).",
  }),

  item("LOA-F112", {
    topic: "T11", unit: "T11U2",
    prompt: "Which statement about the relationship between the DTPA and other Texas law is supported by § 17.43 and § 17.44(b)?",
    choices: [
      "The subchapter's provisions are not exclusive and its remedies are in addition to those provided in any other law, but \"a violation of a provision of law other than this subchapter is not in and of itself a violation of this subchapter\" — so breaking a TREC rule is not automatically a DTPA violation, though the same conduct commonly violates both by independent routes; and § 17.44(b) provides that Property Code chapter 27 prevails over the subchapter to the extent of any conflict.",
      "A violation of any other Texas law is itself a DTPA violation, which is what makes the Act the primary vehicle for enforcing TREC rules privately.",
      "The subchapter is the exclusive remedy for a deceptive act in a consumer transaction, which is why § 17.50(d) makes the fee award mandatory.",
      "Property Code chapter 27 is subordinate to the subchapter, which is why a residential construction defect claim proceeds under the DTPA.",
    ],
    rationale: "Section 17.43 states both halves and the module names the line students blur. Section 17.44(b) gives chapter 27 priority to the extent of any conflict, the reverse of the fourth choice — and the module adds that chapter 27 was not held for this course, so it states nothing about its content beyond that priority.",
    teaches: "module-11.md#unit-deceptive-trade-practices-and-consumer-protection",
    source: "Business & Commerce Code §§ 17.43, 17.44(a), (b), 17.50(d).",
  }),

  item("LOA-F113", {
    topic: "T11", unit: "T11U3",
    prompt: "A jury finds economic damages of $40,000 and mental anguish of $18,000, and the court finds attorneys' fees of $55,000 and costs of $3,000. What is the maximum the trier of fact may award as damages under § 17.50(b)(1) on a *knowingly* finding, and on an *intentionally* finding? (Illustrative figures only.)",
    choices: [
      "Knowingly: $40,000 economic plus $18,000 mental anguish plus additional damages of not more than three times economic damages ($120,000) — $178,000. Intentionally: the multiplier base expands to mental anguish and economic damages together ($58,000), so three times that is $174,000, for $40,000 + $18,000 + $174,000 = $232,000. Fees and costs are excluded from the multiplier base by § 17.50(e) and are added to the judgment separately.",
      "Knowingly: $40,000 plus $18,000 plus three times $58,000 — $232,000. Intentionally: the same, since both tiers permit mental anguish and a treble multiplier and the difference is only that intent also supports exemplary damages under Chapter 41.",
      "Knowingly: three times the whole judgment including fees and costs, or $348,000. Intentionally: the same computation, since § 17.50(e) restricts prejudgment interest rather than the multiplier base.",
      "Knowingly: $40,000 economic damages only, with mental anguish available only on an intentional finding; intentionally: $40,000 plus $18,000 plus three times $58,000.",
    ],
    rationale: "Tier two adds mental anguish and a multiplier whose base is economic damages only; tier three keeps mental anguish and expands the base to mental anguish plus economic damages — that base expansion is the entire difference between the two tiers. Section 17.50(e) is explicit that attorneys' fees, costs and prejudgment interest may not be considered in computing additional damages, which defeats the third choice; and § 17.50(g) provides that Chapter 41 of the Civil Practice and Remedies Code does not apply to a DTPA action, which defeats the second.",
    teaches: "module-11.md#unit-damages",
    source: "Business & Commerce Code §§ 17.45(9), (11), (13), 17.50(b)(1), (d), (e), (f), (g). Dollar figures are illustrative.",
  }),

  item("LOA-F114", {
    topic: "T11", unit: "T11U3",
    prompt: "Which statement about attorneys' fees and the other relief § 17.50 authorises is accurate?",
    choices: [
      "Section 17.50(d) is unconditional for the consumer — each consumer who prevails \"shall be awarded court costs and reasonable and necessary attorneys' fees\" — and § 17.50(c) points the other way with another \"shall,\" requiring a fee and cost award to the defendant on a finding by the court that the action was groundless in fact or law, brought in bad faith, or brought for harassment. Section 17.50(b)(3) permits restoration orders reaching a commission already paid, and § 17.50(b)(4) permits other relief but forbids a civil court to revoke the licence of a person regulated by a state agency holding revocation authority.",
      "Fees are discretionary for a prevailing consumer under § 17.50(d) and mandatory for a prevailing defendant under § 17.50(c), which is why defendants litigate rather than settle.",
      "A civil court may revoke a real estate licence under § 17.50(b)(4) if a judgment is unsatisfied for three months, which is the DTPA's own enforcement mechanism against license holders.",
      "Section 17.50(b)(3) permits restoration of money only where the defendant acted knowingly or intentionally, so an ordinary violation does not reach a commission already paid.",
      ],
    rationale: "Both fee provisions use \"shall,\" and the module notes that the consumer-side award is why a modest repair dispute becomes a filed lawsuit. Section 17.50(b)(4) contains the limitation the third choice ignores: a court may not revoke or suspend a licence, or appoint a receiver, for a person who is a licensee of or regulated by a state agency with statutory authority to do so — TREC holds that authority. Subsection (b)(3) carries no culpability condition.",
    teaches: "module-11.md#unit-damages",
    source: "Business & Commerce Code § 17.50(b)(3), (b)(4), (c), (d), (e).",
  }),

  item("LOA-F115", {
    topic: "T11", unit: "T11U4",
    prompt: "Which conditions must a license holder satisfy for the § 17.506(a) reliance-on-written-information defense, and what does § 17.506(b) add?",
    choices: [
      "The information must have been written; the defendant must have given reasonable and timely *written notice to the plaintiff of the defendant's reliance* before consummation of the transaction; the information must in fact have been false or inaccurate; and the defendant must prove he did not know and could not reasonably have known of the falsity or inaccuracy. Section 17.506(b) adds that the defendant must prove the written information was a producing cause of the alleged damage, and that a finding of one producing cause does not bar recovery where other conduct not the subject of a defensive finding was also a producing cause — so the defense is claim-specific.",
      "The defendant need only show that the information came from official government records and was false, because § 17.506(a)(1) exists precisely so a license holder may rely on public records; the written-notice requirement applies to subdivision (2) alone.",
      "The defendant must give written notice of reliance within thirty days after receiving the consumer's notice letter, matching the tender window in § 17.506(d).",
      "The defense, once established, is a complete answer to the action, because § 17.506(b)'s producing-cause requirement is satisfied by the fact that the information was relied on.",
    ],
    rationale: "The module counts the conditions because students remember this as \"I can rely on public records,\" and that is not what it says. The pre-consummation written notice of reliance is the condition that defeats almost every license holder who invokes the defense after the fact, and it applies to all three subdivisions. Section 17.506(b) makes the defense claim-specific — defending the square footage does not immunise the roof — and § 17.506(c) separately opens the door to suing the third party who supplied the information, without regard to privity and subject to no double recovery.",
    teaches: "module-11.md#unit-defenses",
    source: "Business & Commerce Code § 17.506(a), (b), (c), (d).",
  }),

  item("LOA-F116", {
    topic: "T11", unit: "T11U4",
    prompt: "Two disputes arise: a $900,000 commercial land sale under a written contract where the buyer was represented by its own counsel, and a $900,000 house the buyer will occupy. How do § 17.49(f) and § 17.49(g) treat them?",
    choices: [
      "The commercial sale is outside the DTPA under § 17.49(g), which exempts a cause of action arising from a transaction involving total consideration by the consumer of more than $500,000 \"other than a cause of action involving a consumer's residence\" — and it would also satisfy § 17.49(f)'s three conditions. The house is inside the DTPA under both, because each carries a residence exception and § 17.45(12) defines a residence by both building type and occupancy.",
      "Both are outside the DTPA, because § 17.49(g)'s threshold of more than $500,000 is met in each case and the subsection states no exception.",
      "Both are inside the DTPA, because § 17.49(f) requires all three of its conditions and neither transaction satisfies condition (2), and § 17.49(g) applies only to transactions exceeding $100,000 in a written contract.",
      "The house is outside the DTPA and the commercial sale inside, because § 17.49(f)'s condition (3) excludes contracts that do not involve the consumer's residence.",
    ],
    rationale: "The two thresholds are $100,000 at § 17.49(f) — with a written contract, independent counsel, and no consumer residence — and $500,000 at § 17.49(g), with no counsel or contract requirement but the same residence exception. Section 17.45(12) requires both the building type and that it be occupied or to be occupied as the consumer's residence. The fourth choice inverts condition (3), which excludes contracts that *do* involve the residence.",
    teaches: "module-11.md#unit-defenses",
    source: "Business & Commerce Code §§ 17.45(12), 17.49(c), (f), (g), (i).",
  }),

  item("LOA-F117", {
    topic: "T11", unit: "T11U4",
    prompt: "Which statement about the DTPA's procedural and limitations defenses is accurate?",
    choices: [
      "Section 17.505(a) requires 60 days' written notice in reasonable detail as a prerequisite to suit under § 17.50(b)(1), and § 17.505(c) lets a defendant who did not receive it file a plea in abatement not later than the 30th day after filing an original answer. Section 17.506(d) makes it a defense to the cause of action if the defendant, within 30 days after receiving the notice, tendered the economic damages and mental anguish claimed plus the expenses including attorneys' fees reasonably incurred. Section 17.565 sets two years from the act or from discovery, extendable 180 days only where the defendant knowingly engaged in conduct *solely* calculated to induce delay.",
      "The notice period is 30 days, the abatement window 60 days, and the limitations period four years, matching Civil Practice & Remedies Code § 16.004(a).",
      "A plea in abatement dismisses the suit, and the tender defense requires tender only of the economic damages claimed, fees and mental anguish being unliquidated.",
      "The 180-day extension is available whenever the plaintiff proves the defendant engaged in any conduct contributing to the delay, the word \"solely\" describing the plaintiff's reliance rather than the defendant's purpose.",
    ],
    rationale: "The module works each of these numbers and flags the tender defense as the cheapest exit in the statute — tender within 30 days of receipt, of the full amount claimed in both categories plus expenses, and it defeats the cause of action itself. Abatement is not dismissal. And \"solely\" qualifies the defendant's conduct, which is what makes the extension narrow. Section 16.004(a)'s four years is the fraud and breach-of-fiduciary-duty period, so a claimant out of time under § 17.565 may still have a fraud claim alive.",
    teaches: "module-11.md#unit-defenses",
    source: "Business & Commerce Code §§ 17.505(a), (b), (c), 17.506(d), 17.565; Civil Practice & Remedies Code § 16.004(a).",
  }),

  item("LOA-F118", {
    topic: "T11", unit: "T11U5",
    prompt: "How does 22 TAC § 535.149 connect the DTPA to TREC discipline, and what are the two elements of the lottery ground it defines?",
    choices: [
      "Its last sentence provides that deceptive practices for § 1101.652(b)(15) \"include, but are not limited to the acts described in the Texas Business and Commerce Code §17.46, done in a manner defined in that section,\" so a § 17.46(b)(5) misrepresentation is also a deceptive practice the Commission may suspend or revoke for. Its lottery elements are the award or distribution of a prize or prizes by chance *and* the payment of consideration for the opportunity to win — both required, which is why giving gifts as an inducement does not violate the section, subject to complying with 22 TAC § 535.20.",
      "It provides that any DTPA judgment is automatically a disciplinary violation, and defines a lottery as any drawing offering a prize, which is why gifts to prospective clients are prohibited.",
      "It defines \"false promise\" for § 1101.652(b)(5) and states the lottery elements for § 1101.652(b)(17), guaranteeing that future profits will result from a resale.",
      "It provides that a violation of a provision of law other than the DTPA is in and of itself a DTPA violation, which is how the two tracks share definitions.",
    ],
    rationale: "The module's point is that the two tracks are not merely parallel — they share their definitions, through this rule. Both lottery elements are required, which is what lets the rule's second paragraph say that giving gifts as an inducement does not violate the section while adding the proviso about § 535.20. Rule 535.145, not § 535.149, defines false promise; § 1101.652(b)(17) is the future-profits guarantee; and § 17.43 says the opposite of the fourth choice.",
    teaches: "module-11.md#unit-ethical-and-legal-concerns",
    source: "22 TAC §§ 535.20, 535.145, 535.149; Texas Occupations Code § 1101.652(b)(5), (14), (15), (17); Business & Commerce Code §§ 17.43, 17.46.",
  }),

  item("LOA-F119", {
    topic: "T11", unit: "T11U5",
    prompt: "A consumer holds an unsatisfied judgment arising from a single transaction. What must happen before the real estate recovery trust account pays, what does it cap, and what happens to the license holder afterwards?",
    choices: [
      "Section 1101.606(a) requires a court judgment first, then execution returned nulla bona and a judgment lien perfected, before a verified claim is filed in the court that entered the judgment; § 1101.605(a) bars an action for such a judgment after the second anniversary of accrual. Payments for claims arising out of a single transaction, including attorney's fees, interest and court costs, may not exceed $125,000 regardless of the number of claimants, and payments on judgments against a single license holder may not exceed $250,000 until reimbursement. The Commission is subrogated under § 1101.612(a), and under § 1101.655(a) it shall revoke if the holder does not repay in full before the 31st day after notice.",
      "The consumer may claim directly against the account on presenting the judgment; the cap is $125,000 in damages plus attorney's fees, interest and costs; and repayment of the account resolves any disciplinary proceeding arising from the same conduct.",
      "The account pays only where the license holder's conduct is described by § 1101.652(a-1)(1); ordinary negligence under § 1101.652(b)(1) is outside § 1101.602 and is not reimbursable.",
      "A license holder seeking an unpaid commission in the transaction may claim against the account on the same terms as a consumer, since § 1101.601(a) reaches any aggrieved person who suffers actual damages.",
    ],
    rationale: "The module emphasises that the account is not a first resort and that the caps are inclusive — the $125,000 is not damages plus fees, it is everything. Section 1101.602 reaches conduct described by § 1101.652(a-1)(1) *or any ground in* § 1101.652(b), including negligence and incompetence at (b)(1), which defeats the third choice. Section 1101.607(2)(B) bars a license holder seeking a commission in the transaction concerned. And § 1101.613 provides that repayment does not affect another disciplinary proceeding.",
    teaches: "module-11.md#unit-ethical-and-legal-concerns",
    source: "Texas Occupations Code §§ 1101.601, 1101.602, 1101.605(a), 1101.606(a), 1101.607(2)(B), 1101.610, 1101.612(a), 1101.613, 1101.655.",
  }),

  /* ══ T12 Implementation and Presentation — 140 prescribed minutes ══════════════════════════ */

  item("LOA-F120", {
    topic: "T12", unit: "T12U1",
    prompt: "A sales agent prepares a comparative market analysis. Which statement about 22 TAC § 535.17 is correct?",
    choices: [
      "She may prepare, sign and present it, but must submit it in the broker's name and the broker is responsible for it; and the rule's prescribed sentence — \"This represents an estimated sale price for this property. It is not the same as the opinion of value in an appraisal developed by a licensed appraiser under the Uniform Standards of Professional Appraisal Practice.\" — must be made part of the written analysis and reproduced verbatim in at least 12-point font.",
      "She may prepare and sign it in her own name because the rule permits a sales agent to prepare, sign and present one; the broker's name is required only on the listing agreement under 22 TAC § 535.2.",
      "She must include the prescribed sentence but may paraphrase it into the brokerage's own voice provided the substance is preserved, since the rule requires the statement rather than particular words.",
      "She may omit the statement where the analysis is prepared for the license holder's own use in setting a listing price, because the rule conditions it on providing the opinion to a person for whom it is prepared and no third party receives it.",
    ],
    rationale: "The rule permits a sales agent to prepare, sign and present a broker price opinion, CMA or estimate of worth or sale price for the sponsoring broker, but requires submission in the broker's name with the broker responsible for it. \"Verbatim\" forecloses the third choice; \"made part of\" means the sentence belongs inside the document; and 12-point is a floor, so a CMA in 9-point body text with a matching disclaimer violates the rule even though the words are right. The fourth choice also collides with 22 TAC § 535.16, which makes the CMA compulsory when negotiating a listing.",
    teaches: "module-12.md#unit-the-broker-working-forwith-the-seller",
    source: "22 TAC §§ 535.16, 535.17, 535.2; Texas Occupations Code § 1101.002(1)(A)(xi).",
  }),

  item("LOA-F121", {
    topic: "T12", unit: "T12U1",
    prompt: "A listing expires unsold. Under 22 TAC § 535.155, what must happen to the marketing, and what must happen to a \"just sold\" post after a closing?",
    choices: [
      "An advertisement offering a listed property must be discontinued within 10 days after the listing agreement is no longer in effect; and an advertisement about a property 10 days or more after the closing of a transaction must include the current status of the property.",
      "Marketing must come down immediately on expiry, and a post-closing advertisement is permitted indefinitely provided it identifies the license holder's role accurately.",
      "Marketing may continue for 30 days after expiry under the rule's grace period, and a post-closing advertisement must be removed within 30 days.",
      "Neither rule applies to social media, because § 535.155 permits the required information to sit on a separate page or the account user profile and therefore treats social posts as a distinct category.",
    ],
    rationale: "Both are ten-day timing rules and the module flags them as the ones that catch careful people. The fourth choice misreads the social-media provision, which is an accommodation about *where the required identifying information may appear* — on a separate page or the account user profile page, readily accessible by a direct link and readily noticeable — not an exemption from the rule; the definition of \"Advertisement\" expressly includes social media, email and text messages.",
    teaches: "module-12.md#unit-the-broker-working-forwith-the-seller",
    source: "22 TAC § 535.155; Texas Occupations Code § 1101.652(b)(23).",
  }),

  item("LOA-F122", {
    topic: "T12", unit: "T12U1",
    prompt: "A sales agent's advertisement carries her own contact information in 60-point type. What does 22 TAC § 535.155(a) require, and what is \"contact information\" for this purpose?",
    choices: [
      "The broker's name must appear in a readily noticeable location in at least half the size of the largest contact information for any sales agent, associated broker or team name in the advertisement — so at least 30-point here — and \"Contact Information\" is defined broadly as any information that can be used to contact a license holder featured in the advertisement, including a name, phone number, email address, website address, social media handle, scan code or other similar information.",
      "The broker's name must merely appear somewhere in the advertisement; the half-size ratio applies only to print advertisements, social media being governed by the separate-page provision.",
      "The broker's name must be at least the same size as the largest contact information, and \"contact information\" means a telephone number or email address only, a name not being a means of contact.",
      "No requirement applies, because the advertisement is a communication from a license holder to the license holder's current client, which the rule carves out.",
    ],
    rationale: "It is a size ratio rather than a presence requirement, and the broad definition of contact information is what makes a handle in 60-point type set the floor at 30. The rule carves out only two things — a communication from a license holder to the license holder's current client, and a directional sign that may also contain only the broker's name or logo — and an advertisement designed to attract the public is neither, which defeats the fourth choice.",
    teaches: "module-12.md#unit-the-broker-working-forwith-the-seller",
    source: "22 TAC § 535.155.",
  }),

  item("LOA-F123", {
    topic: "T12", unit: "T12U2",
    prompt: "Which statement about § 1101.555 and its two consequences is accurate?",
    choices: [
      "It is triggered when an offer to purchase real estate in this state is signed — not on acceptance — runs to each buyer, and must be in writing, advising the buyer either to have the abstract examined by an attorney chosen by the buyer or to be provided with or obtain a title insurance policy. Section 1101.652(b)(29) states the same requirement as a disciplinary ground phrased around the closing, and § 1101.806(d) provides that a license holder who fails to advise a buyer as § 1101.555 requires may not receive payment of or recover any commission agreed to be paid on the sale.",
      "It is triggered at closing, may be satisfied orally, and runs only to a buyer the license holder represents; the consequence of failure is a reduction of the commission in proportion to the harm.",
      "It is triggered on acceptance of the offer and requires the license holder to obtain a title insurance policy for the buyer, the abstract alternative having been removed by amendment.",
      "It is triggered at signature but applies only where the buyer is unrepresented, since a represented buyer receives the advice from the buyer's own license holder.",
    ],
    rationale: "The module gives three points and the sanction. The trigger is signature of the offer, so the advisory happens at the table in the same sitting; it runs to \"each buyer,\" every buyer, including one who is unrepresented and merely handed the form; and it must be in writing. The fee consequence in § 1101.806(d) is absolute — not reduced, not subject to offset — which is why a one-sentence written advisory protects the entire fee.",
    teaches: "module-12.md#unit-the-broker-working-forwith-the-buyer",
    source: "Texas Occupations Code §§ 1101.555, 1101.652(b)(29), 1101.806(d).",
  }),

  item("LOA-F124", {
    topic: "T12", unit: "T12U2",
    prompt: "Under 22 TAC § 537.11(a), which use of a form other than a Commission mandatory form is within one of the rule's four exceptions?",
    choices: [
      "A contract form prepared by the property owner, or prepared by an attorney and required by a property owner — so a builder's own contract qualifies; the other three exceptions are transactions in which the license holder is functioning solely as a principal and not as an agent, transactions in which an agency of the United States government requires a different form, and transactions for which no contract form has been approved for mandatory use, where the license holder may use a form prepared by a Texas-licensed attorney or by a trade association in consultation with one, carrying the identifying content the rule specifies, or a Broker-Lawyer Committee form approved for voluntary use.",
      "A form the buyer downloaded and asked the license holder to use, because the exception covers a form required by a party to the transaction.",
      "Any form the license holder's brokerage has had reviewed by counsel, because the fourth exception permits an attorney-prepared form in every transaction rather than only where the Commission has approved none.",
      "A Commission form re-typeset by the brokerage to fit on fewer pages, because the rule permits reproduction of approved forms.",
    ],
    rationale: "Each exception has a limit built into it, and the module says so. The owner-form exception requires preparation by the property owner or by an attorney and requirement by a property owner — a builder's contract qualifies, a form the buyer downloaded does not. The attorney-or-trade-association route is available only where no form has been approved for mandatory use. And the principal exception is available only when the license holder is functioning *solely* as a principal and not as an agent.",
    teaches: "module-12.md#unit-the-broker-working-forwith-the-buyer",
    source: "22 TAC § 537.11(a).",
  }),

  item("LOA-F125", {
    topic: "T12", unit: "T12U2",
    prompt: "In the buyer-side sequence, what is the correct order of the first three obligations when a prospective buyer calls a listing agent about a specific residential listing?",
    choices: [
      "Before saying anything substantive, deliver the IABS under § 1101.558(b-1) and 22 TAC § 531.20 and — because this license holder represents the seller — disclose that representation at first contact under § 1101.558(b); before unlocking a door, have the § 1101.563(b) written agreement signed; and if the agreement is showing-only, § 1101.563(e) caps it at fourteen days and forbids exclusivity while § 1101.563(d) requires a separate agreement before any further act of brokerage.",
      "Show the property first, since § 1101.563(b) requires the written agreement before presenting an offer rather than before a showing; deliver the IABS when the buyer decides to make an offer; and disclose representation at closing.",
      "Deliver the IABS at the showing, obtain the written agreement within a reasonable time afterwards, and disclose representation at the first substantive communication rather than at first contact.",
      "Obtain the written agreement first and treat it as satisfying both the § 1101.558(b) disclosure and the § 1101.558(b-1) notice, since § 1101.563(c)(1)(D) requires the agreement to state representation status.",
    ],
    rationale: "The module puts the sequence in order because the order is what an investigator reconstructs. Section 1101.563(b) requires the agreement before showing any residential real property, with the alternative trigger — before presenting an offer — reserved for the case where nothing will be shown, which is what the second choice inverts. The operative word is \"before\": no grace period, no signing back at the office. And the two § 1101.558 duties are separate from the § 1101.563 agreement and from each other — one at first contact, one at first substantive communication.",
    teaches: "module-12.md#unit-the-broker-working-forwith-the-buyer",
    source: "Texas Occupations Code §§ 1101.558(b), (b-1), 1101.562, 1101.563(b), (c), (d), (e), 1101.652(b)(34); 22 TAC § 531.20.",
  }),

  item("LOA-F126", {
    topic: "T12", unit: "T12U3",
    prompt: "Which of these is something 22 TAC § 537.11 permits a license holder to do, rather than one of the acts it forbids?",
    choices: [
      "Adding language to or striking language from a contract form when specifically instructed in writing by a principal, with the change made conspicuous — by underlining additions, striking through deletions, or another method that clearly indicates the change — and explaining to the license holder's principals the meaning of informational items or choices in a contract form without practising law or giving legal advice.",
      "Composing an escalation clause for a buyer who asks for one, because drafting a price mechanism is arithmetic rather than a statement about legal rights.",
      "Telephoning the brokerage's attorney to obtain an answer for a client and relaying it, because the advice then originates with a lawyer rather than with the license holder.",
      "Telling a principal that retaining an attorney will slow the closing and is an unnecessary expense on a straightforward transaction, because a license holder may give a principal candid practical advice about cost.",
    ],
    rationale: "The rule forbids drafting or recommending contract language defining or affecting the parties' rights, obligations or remedies, \"including escalation, appraisal, or contingency clauses\" — which is the second choice by name. The module lists relaying the brokerage lawyer's answer among the prohibited acts, noting that what a license holder may do instead is employ and pay an attorney to represent only the license holder, and may reimburse a principal for attorney's fees incurred. And § 537.11(b)(7) forbids attempting to prevent or in any manner discourage a principal from employing an attorney.",
    teaches: "module-12.md#unit-a-practical-guide-to-everyday-practice",
    source: "22 TAC § 537.11(b), (c), (d), (e), (f).",
  }),

  item("LOA-F127", {
    topic: "T12", unit: "T12U3",
    prompt: "A transaction dies during the option period. When does the four-year record clock start under 22 TAC § 535.2(h), and what does the category \"substantive communications with parties to the transaction\" reach?",
    choices: [
      "The clock runs from the end of the transaction — so it starts the day the deal dies rather than at some later tidy-up — and \"substantive communications\" reaches text messages with the other side's license holder about matters such as a repair amendment, so a messaging app set to delete after thirty days is a decision not to keep records the broker is required to hold.",
      "The clock runs from the date the file was opened, and \"substantive communications\" reaches formal correspondence only, text messages being working notes rather than records.",
      "The clock runs from the date of the last document in the file, and the category reaches only communications with the license holder's own client, since a person the license holder does not represent is not a party.",
      "No clock runs, because the retention duty attaches only to transactions that close; § 535.2(h) measures four years \"from the date of closing.\"",
    ],
    rationale: "Subsection (h) names three triggers as they apply — closing, termination of the contract, or the end of a real estate transaction — so the fourth choice truncates the rule. The module draws both consequences the correct answer states, and notes the four years is not arbitrary: it matches the outer limit of the Commission's investigative reach under § 1101.204(c) and the four-year limitations period in Civil Practice & Remedies Code § 16.004(a).",
    teaches: "module-12.md#unit-a-practical-guide-to-everyday-practice",
    source: "22 TAC § 535.2(h); Texas Occupations Code §§ 1101.204(c), 1101.652(a-1)(2), (b)(28); Civil Practice & Remedies Code § 16.004(a).",
  }),

  item("LOA-F128", {
    topic: "T12", unit: "T12U3",
    prompt: "A cooperating broker who signed a written compensation agreement asks the license holder for a copy of it. Separately, the Commission asks the same license holder to produce her file on a transaction she conducted. She provides neither. Which grounds are engaged?",
    choices: [
      "Section 1101.652(b)(28), failing or refusing to give a copy of a document to a person who signed it, and § 1101.652(a-1)(2), failing or refusing to produce on request, within a reasonable time, a document, book or record in the license holder's possession relating to a real estate transaction she conducted — two record duties that fall on the license holder personally rather than on the sponsoring broker.",
      "Only § 1101.652(a-1)(2); a request from another license holder is a matter for the two brokers to resolve, since (b)(28) protects consumers who signed a document and a cooperating broker is not a consumer.",
      "Only 22 TAC § 535.2(h), because the retention rule is the source of both obligations and it is addressed to the broker; the license holder's own exposure arises only if the broker cannot produce the file.",
      "Neither, provided the four-year retention period has not expired, because the rule requires records to be kept rather than produced and § 1101.204(c) gives the Commission four years in which to ask.",
    ],
    rationale: "Subdivision (b)(28) turns on who signed the document, not on whether that person is a consumer, so a cooperating broker who signed the compensation agreement is within it. Subsection (a-1)(2) reaches failing *or refusing* to produce a document relating to a transaction the license holder conducted, and it sits in the subsection addressed to the license holder's own records rather than in the brokerage-gated subsection (b). The broker's four-year retention duty under § 535.2(h) runs alongside both rather than instead of them.",
    teaches: "module-12.md#unit-a-practical-guide-to-everyday-practice",
    source: "Texas Occupations Code §§ 1101.204(c), 1101.652(a-1)(2), (b)(28); 22 TAC § 535.2(h).",
  }),

  item("LOA-F129", {
    topic: "T12", unit: "T12U4",
    prompt: "Under 22 TAC § 535.154, which name may be used in an advertisement without registration, and which team name is compliant?",
    choices: [
      "A common derivative of the name on the licence — Bill for William, Kim for Kimberly — is considered the same name and needs no registration, while an alternate name such as a middle name, maiden name or nickname must be registered before use; and a compliant team name must end with the word \"team\" or \"group\" and must not include terms that could mislead the public into believing the team offers brokerage services independent of its sponsoring broker, so \"The Alvarez Group\" is compliant and \"Alvarez & Associates\" is not.",
      "Any name the sponsoring broker approves in writing may be used without registration, since 22 TAC § 535.2 makes the broker responsible for a sponsored sales agent's advertising.",
      "A maiden name needs no registration because it is a name the license holder has lawfully held, while a nickname must be registered; and a team name is compliant if it ends with \"team,\" \"group,\" \"company\" or \"associates.\"",
      "An assumed business name requires only registration with the Commission, and a team name requires no registration at all because it is used by license holders rather than by the broker.",
    ],
    rationale: "The rule excludes common derivatives from the alternate-name registration duty and includes maiden names within it. Rule 535.155 supplies the enforcement edge on team names, treating as misleading an advertisement containing a team name with terms implying independence from the sponsoring broker, \"including, but not limited to, 'brokerage', 'company', and 'associates'.\" An assumed business name requires both registration with the Commission *and* written evidence of legal authority to use it in Texas; a team name must be registered by the broker before an associated broker or sponsored sales agent uses it.",
    teaches: "module-12.md#unit-other-considerations",
    source: "22 TAC §§ 535.154, 535.155, 535.2.",
  }),

  item("LOA-F130", {
    topic: "T12", unit: "T12U4",
    prompt: "A resident broker relocates her office; separately, one of her sponsored sales agents changes her business e-mail address. Neither tells the Commission. What do § 1101.552 and 22 TAC § 535.21 require of each, and what follows for service of a complaint notice?",
    choices: [
      "The broker must submit an application, with the appropriate fee, for a licence designating the new office location not later than the 10th day after the date she moves from the address designated on her licence — § 1101.552(a) requires a resident broker to maintain a fixed office in this state with its address designated on the licence. The sales agent is separately bound by § 1101.552(e) and (f), which require every license holder to keep a current mailing address, business address, business telephone number and business e-mail address with the Commission and to give notice of a change; § 535.21 sets that deadline at not later than the 10th day after the change and provides that where a license holder fails to update, the last known contact information *is* the license holder's contact information — so a notice sent to a stale address is still effective, and notices for an active sales agent go to the sponsoring broker.",
      "Only the broker has an obligation, because § 1101.552 is headed as an office requirement and a sponsored sales agent has no address of record; notices for a sales agent go to the sponsoring broker for that reason.",
      "Both have 30 days, matching the delegation notice period in 22 TAC § 535.2(e), and a notice sent to an address the Commission knows to be stale is ineffective until actual receipt is shown.",
      "Neither has an obligation until the next renewal, because § 535.21 makes the contact information part of the renewal application and the Commission's records are updated at that point.",
    ],
    rationale: "Subsection (a) is the broker's fixed-office rule and subsection (b) supplies the 10-day application deadline on moving; subsection (e) applies to every license holder, sales agents included, which is what the second choice misses. The module explains why this dull obligation belongs in a risk unit: the last known contact information *is* the license holder's contact information, so stale-address service still counts — the opposite of what the third choice asserts. The 30-day period belongs to the delegated-supervisor notice in § 535.2(e).",
    teaches: "module-12.md#unit-other-considerations",
    source: "Texas Occupations Code § 1101.552(a), (b), (d), (e), (f); 22 TAC §§ 535.21, 535.2(e).",
  }),

  item("LOA-F131", {
    topic: "T12", unit: "T12U5",
    prompt: "A listing agent discovers that a contract went effective on Monday and the seller's Property Code § 5.008 notice was not delivered until Friday. Which combination of responses is supported by the held sources, and which act is forbidden?",
    choices: [
      "Tell the broker immediately, because 22 TAC § 535.2 makes the broker responsible for the license holder's authorised acts and § 1101.803 makes the broker liable to the Commission, the public and clients for her conduct; correct the record in writing toward everyone who relied on it, because 22 TAC § 535.156 imposes an affirmative duty to keep the principal informed and a duty to convey accurate information to members of the public; and understand that § 5.008(f) has given the purchaser a right to terminate for any reason within seven days after receiving the notice. What she may not do is tell the buyer what that right does or does not do to his legal position, which is advice 22 TAC § 537.11 forbids.",
      "Say nothing to anyone and wait, because § 5.008 imposes its duty on the seller rather than on the license holder, and a license holder who volunteers a view of the seller's compliance has stepped into the seller's transaction.",
      "Tell the buyer that the late notice is a technicality that does not affect the contract, since the notice was in fact delivered and the statute states no damages remedy for a late delivery.",
      "Obtain a written waiver of the seven-day right from the buyer before the week runs, because § 5.008 states no exclusivity clause and the right may therefore be released by agreement like any other contractual term.",
      ],
    rationale: "The module assembles the self-correction response from obligations that exist rather than inventing a procedure, and § 1101.702(b) makes \"efforts to correct the violation\" a factor in setting a penalty amount — so prompt correction is statutorily relevant to what the license holder will pay. The termination right under § 5.008(f) runs from receipt and is exercisable \"for any reason,\" which is why the third choice's characterisation is both wrong and the kind of legal conclusion § 537.11 forbids a license holder to offer. The fourth choice reasons from the absence of an exclusivity clause to a power the statute does not grant the license holder, and drafting or recommending such a release is squarely within § 537.11's prohibition.",
    teaches: "module-12.md#unit-risk-management",
    source: "Texas Property Code § 5.008(f); 22 TAC §§ 535.2, 535.156, 537.11; Texas Occupations Code §§ 1101.702(b), 1101.803.",
  }),

  item("LOA-F132", {
    topic: "T12", unit: "T12U5",
    prompt: "Which pairing of a recurring disciplinary fact pattern with the moment it is created, as the risk-management unit organises them, is accurate?",
    choices: [
      "Advertising — § 1101.652(b)(23), operationalised by 22 TAC §§ 535.154 and 535.155 — is created the moment the license holder presses publish, and is the most mechanical violation in the scheme and therefore the easiest to prove; money — § 1101.652(b)(9), (10), (30) and (31), operationalised by 22 TAC § 535.146 — is created on the second working day after receipt and is provable from a bank statement; compensation and undisclosed interest — (b)(8), (11), (13) and (16) — is created when the payment is arranged rather than when it is received.",
      "Advertising violations are created when a consumer complains, money violations when the transaction closes, and compensation violations when the payment is received — which is why each is provable only from the consumer's own account of events.",
      "All of these patterns are created at the listing appointment, which is why 22 TAC § 535.2 requires the broker's written policies to address each of them before an agent takes a first listing.",
      "Silence about a defect under § 1101.652(b)(3) and (b)(4) is created at closing, when the buyer takes possession and the defect becomes discoverable.",
    ],
    rationale: "The unit's organising idea is that each recurring pattern has a moment on the calendar when it is created, which is where a license holder can intervene. Silence about a defect is created at the listing appointment, when the seller mentions something in conversation that never reaches the § 5.008 notice or the file — not at closing. The second choice moves each creation moment to the point of discovery, which is precisely the reasoning the unit is written to displace.",
    teaches: "module-12.md#unit-risk-management",
    source: "Texas Occupations Code § 1101.652(b)(3), (4), (8), (9), (10), (11), (13), (16), (23), (30), (31); 22 TAC §§ 535.146, 535.154, 535.155; Texas Property Code § 5.008.",
  }),
]);

/* The blueprint: how many items each LOA-1 topic carries. Asserted against the items below and
   against the form's prescribed minutes. */
export const TOPIC_BLUEPRINT = Object.freeze({
  T01: 11, T02: 11, T03: 11, T04: 10, T05: 13, T06: 14,
  T07: 7, T08: 6, T09: 11, T10: 13, T11: 12, T12: 13,
});

export const BANK_SIZE = FINAL_EXAM_BANK.length;

/* Aliases the repository's Texas tooling reads. scripts/validate-loa-assessments.mjs resolves the
   bank as FINAL_EXAM_BANK || ITEMS || BANK; the Principles II scripts resolve it as ITEMS || BANK.
   Same frozen array under three names; nothing here is a second copy. */
export const ITEMS = FINAL_EXAM_BANK;
export const BANK = FINAL_EXAM_BANK;

/* ── Load-time invariants. The bank refuses to load in any inconsistent state rather than
      exporting something broken. ─────────────────────────────────────────────────────────── */

const topicCodes = new Set(TOPICS.map((topic) => topic.code));
const unitCodes = new Map(ALL_UNITS.map((unit) => [unit.code, unit.topicCode]));
const anchorShape = /^module-(0[1-9]|1[0-2])\.md#[a-z0-9-]+$/;
const trueFalseWords = new Set(["true", "false", "t", "f", "yes", "no"]);

const seenIds = new Set();
const seenPrompts = new Map();
const perTopic = new Map();
const perUnit = new Map();

for (const entry of FINAL_EXAM_BANK) {
  if (seenIds.has(entry.id)) throw new Error(`final exam bank: duplicate item id ${entry.id}`);
  seenIds.add(entry.id);

  if (!topicCodes.has(entry.topic)) {
    throw new Error(`final exam bank: ${entry.id} names unknown LOA-1 topic ${entry.topic}`);
  }
  if (!unitCodes.has(entry.unit)) {
    throw new Error(`final exam bank: ${entry.id} names unknown LOA-1 unit ${entry.unit}`);
  }
  if (unitCodes.get(entry.unit) !== entry.topic) {
    throw new Error(`final exam bank: ${entry.id} places unit ${entry.unit} under topic ${entry.topic}`);
  }
  /* `tests` is what the LOA validator slices for a topic code; it must equal `unit` or the two
     toolchains would disagree about what an item examines. */
  if (entry.tests !== entry.unit) {
    throw new Error(`final exam bank: ${entry.id} has tests ${entry.tests} against unit ${entry.unit}`);
  }

  if (!Array.isArray(entry.choices) || entry.choices.length !== 4) {
    throw new Error(`final exam bank: ${entry.id} must offer exactly four choices, not ${entry.choices?.length}`);
  }
  if (entry.correctChoice !== 0) {
    throw new Error(`final exam bank: ${entry.id} must author the correct answer first (correctChoice 0)`);
  }
  if (new Set(entry.choices).size !== entry.choices.length) {
    throw new Error(`final exam bank: ${entry.id} repeats a choice`);
  }
  for (const choice of entry.choices) {
    if (typeof choice !== "string" || choice.trim().length < 12) {
      throw new Error(`final exam bank: ${entry.id} has a choice too short to be a real distractor`);
    }
    const bare = choice.trim().toLowerCase().replace(/[.,;:!?"'()]/g, "");
    if (trueFalseWords.has(bare)) {
      throw new Error(`final exam bank: ${entry.id} is true/false-shaped — a choice reads "${choice}"`);
    }
  }

  if (!entry.prompt || entry.prompt.trim().length < 24) {
    throw new Error(`final exam bank: ${entry.id} lacks a usable prompt`);
  }
  if (/\btrue or false\b/i.test(entry.prompt)) {
    throw new Error(`final exam bank: ${entry.id} is a true/false item; § 535.62(b)(7)(H)(ii) forbids them`);
  }
  if (!entry.rationale || entry.rationale.trim().length < 40) {
    throw new Error(`final exam bank: ${entry.id} lacks a rationale`);
  }
  if (!entry.source || entry.source.trim().length < 8) {
    throw new Error(`final exam bank: ${entry.id} lacks a controlling source`);
  }
  if (!entry.judgement || entry.judgement.trim().length < 20) {
    throw new Error(`final exam bank: ${entry.id} has no entry in TESTED_JUDGMENTS`);
  }

  if (!entry.teaches) throw new Error(`final exam bank: ${entry.id} lacks a teaches anchor`);
  if (!anchorShape.test(entry.teaches)) {
    throw new Error(`final exam bank: ${entry.id} has a malformed teaches anchor "${entry.teaches}"`);
  }
  if (entry.teaches !== UNIT_ANCHORS[entry.unit]) {
    throw new Error(
      `final exam bank: ${entry.id} teaches "${entry.teaches}" but unit ${entry.unit} is taught at "${UNIT_ANCHORS[entry.unit]}"`,
    );
  }
  /* No required item may be traced to an optional-reference block. Every `## Optional reference:`
     section in the frozen curriculum carries noAssessmentMayDependOnThis, and § 535.62(b)(7)
     examines the required course. */
  if (/optional/i.test(entry.teaches)) {
    throw new Error(`final exam bank: ${entry.id} is traced to optional-reference material`);
  }

  const promptKey = entry.prompt.trim().toLowerCase().replace(/\s+/g, " ");
  if (seenPrompts.has(promptKey)) {
    throw new Error(`final exam bank: ${entry.id} duplicates the prompt of ${seenPrompts.get(promptKey)}`);
  }
  seenPrompts.set(promptKey, entry.id);

  perTopic.set(entry.topic, (perTopic.get(entry.topic) ?? 0) + 1);
  perUnit.set(entry.unit, (perUnit.get(entry.unit) ?? 0) + 1);
}

if (BANK_SIZE < ASSESSMENT_REQUIREMENTS.minExamBankQuestions) {
  throw new Error(
    `final exam bank: ${BANK_SIZE} items against the § 535.62(b)(7) floor of ${ASSESSMENT_REQUIREMENTS.minExamBankQuestions}`,
  );
}

for (const topic of TOPICS) {
  const count = perTopic.get(topic.code) ?? 0;
  if (count < MIN_ITEMS_PER_TOPIC) {
    throw new Error(`final exam bank: topic ${topic.code} carries ${count} items against a minimum of ${MIN_ITEMS_PER_TOPIC}`);
  }
  if (count !== TOPIC_BLUEPRINT[topic.code]) {
    throw new Error(`final exam bank: topic ${topic.code} carries ${count} items against a blueprint of ${TOPIC_BLUEPRINT[topic.code]}`);
  }
}
if (Object.values(TOPIC_BLUEPRINT).reduce((sum, n) => sum + n, 0) !== BANK_SIZE) {
  throw new Error("final exam bank: the topic blueprint does not total the bank size");
}
for (const code of Object.keys(TOPIC_BLUEPRINT)) {
  if (!topicCodes.has(code)) throw new Error(`final exam bank: blueprint names unknown topic ${code}`);
}
for (const code of Object.keys(UNIT_ANCHORS)) {
  if (!unitCodes.has(code)) throw new Error(`final exam bank: UNIT_ANCHORS names unknown unit ${code}`);
}
for (const unit of ALL_UNITS) {
  if (!UNIT_ANCHORS[unit.code]) throw new Error(`final exam bank: UNIT_ANCHORS is missing unit ${unit.code}`);
}
for (const id of Object.keys(TESTED_JUDGMENTS)) {
  if (!seenIds.has(id)) throw new Error(`final exam bank: TESTED_JUDGMENTS names ${id}, which is not an item`);
}
if (Object.keys(TESTED_JUDGMENTS).length !== BANK_SIZE) {
  throw new Error(`final exam bank: ${Object.keys(TESTED_JUDGMENTS).length} tested judgments against ${BANK_SIZE} items`);
}

/* Every LOA-1 unit is examined. 132 items across 57 units leaves room for this, and a summative
   instrument that skipped units the Commission's own form prescribes would not "cover each topic
   required by the Act or Rules for the specific course" in any meaningful sense. */
export const UNITS_EXAMINED = Object.freeze(
  Object.fromEntries(ALL_UNITS.map((unit) => [unit.code, perUnit.get(unit.code) ?? 0])),
);
const unexamined = ALL_UNITS.filter((unit) => !perUnit.has(unit.code));
if (unexamined.length) {
  throw new Error(`final exam bank: ${unexamined.length} LOA-1 unit(s) carry no item — ${unexamined.map((u) => u.code).join(", ")}`);
}

/* ── Proportionality against the form's prescribed minutes, recorded rather than asserted. Two
      figures per topic. `rawProportionalItems` is the topic's share of the full 1,500 prescribed
      minutes applied to the whole bank — the naive figure. `adjustedProportionalItems` is the one
      the blueprint was built to: T08 is raised to MIN_ITEMS_PER_TOPIC because 45 prescribed minutes
      would otherwise buy fewer than four items and a topic below the floor could not appear on
      every version, and the remaining 126 items are distributed across the remaining 1,455
      prescribed minutes in proportion. The assertion is against the adjusted figure with a
      tolerance of one item, which is what integer rounding needs. ─────────────────────────── */

const totalMinutes = TOPICS.reduce((sum, topic) => sum + topic.subtotalMinutes, 0);
const floorTopics = TOPICS.filter((topic) => (topic.subtotalMinutes / totalMinutes) * BANK_SIZE < MIN_ITEMS_PER_TOPIC);
const floorTopicCodes = new Set(floorTopics.map((topic) => topic.code));
const floorItems = floorTopics.length * MIN_ITEMS_PER_TOPIC;
const floorMinutes = floorTopics.reduce((sum, topic) => sum + topic.subtotalMinutes, 0);
const remainingItems = BANK_SIZE - floorItems;
const remainingMinutes = totalMinutes - floorMinutes;

const round2 = (n) => Math.round(n * 100) / 100;

export const TOPIC_PROPORTIONALITY = Object.freeze(
  Object.fromEntries(
    TOPICS.map((topic) => {
      const raw = (topic.subtotalMinutes / totalMinutes) * BANK_SIZE;
      const adjusted = floorTopicCodes.has(topic.code)
        ? MIN_ITEMS_PER_TOPIC
        : (topic.subtotalMinutes / remainingMinutes) * remainingItems;
      return [
        topic.code,
        Object.freeze({
          prescribedMinutes: topic.subtotalMinutes,
          rawProportionalItems: round2(raw),
          adjustedProportionalItems: round2(adjusted),
          actualItems: TOPIC_BLUEPRINT[topic.code],
          floorGoverns: floorTopicCodes.has(topic.code),
        }),
      ];
    }),
  ),
);
for (const [code, row] of Object.entries(TOPIC_PROPORTIONALITY)) {
  if (Math.abs(row.actualItems - row.adjustedProportionalItems) > 1) {
    throw new Error(
      `final exam bank: topic ${code} carries ${row.actualItems} items against an adjusted proportional share of ${row.adjustedProportionalItems}`,
    );
  }
}

/* ── The version-assembly design, computed here so the bank's own export is self-contained. ──
   The topic-ordered bank is dealt into 22 cells of six items each by cell(i) = (3i mod 22) + 1.
   Three is coprime with 22, so the map is a bijection on residues and every cell receives exactly
   six items; the stride of three also spreads each topic's consecutive items across cells that sit
   on different versions, which is what lets the smallest topic — T08, six items — reach all four
   versions. Each version is ten cells (sixty items), chosen so that each PAIR of versions shares
   exactly three cells, or eighteen items: 30 percent of a sixty-item version, strictly under the
   § 535.62(b)(7)(H)(iii) one-third cap. Four cells sit on one version only. The forms file
   recomputes and re-verifies all of this rather than trusting it. */
export const CELL_COUNT = 22;
export const CELL_STRIDE = 3;

export const ITEM_CELLS = Object.freeze(
  FINAL_EXAM_BANK.map((entry, index) => Object.freeze({ id: entry.id, cell: ((CELL_STRIDE * index) % CELL_COUNT) + 1 })),
);

export const FORM_CELLS = Object.freeze({
  A: Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 19]),
  B: Object.freeze([1, 2, 3, 10, 11, 12, 13, 14, 15, 20]),
  C: Object.freeze([4, 5, 6, 10, 11, 12, 16, 17, 18, 21]),
  D: Object.freeze([7, 8, 9, 13, 14, 15, 16, 17, 18, 22]),
});

const cellSizes = new Map();
for (const row of ITEM_CELLS) cellSizes.set(row.cell, (cellSizes.get(row.cell) ?? 0) + 1);
if (cellSizes.size !== CELL_COUNT) {
  throw new Error(`final exam bank: the cell map produced ${cellSizes.size} cells rather than ${CELL_COUNT}`);
}
const expectedCellSize = BANK_SIZE / CELL_COUNT;
if (!Number.isInteger(expectedCellSize)) {
  throw new Error(`final exam bank: ${BANK_SIZE} items do not divide evenly into ${CELL_COUNT} cells`);
}
for (const [cell, size] of cellSizes) {
  if (size !== expectedCellSize) {
    throw new Error(`final exam bank: cell ${cell} holds ${size} items rather than ${expectedCellSize}`);
  }
}

export default Object.freeze({
  FINAL_EXAM_BANK,
  ITEMS,
  BANK,
  BANK_SIZE,
  TOPIC_BLUEPRINT,
  TOPIC_PROPORTIONALITY,
  UNITS_EXAMINED,
  UNIT_ANCHORS,
  ITEM_CELLS,
  FORM_CELLS,
  CELL_COUNT,
  CELL_STRIDE,
  MIN_ITEMS_PER_TOPIC,
});
