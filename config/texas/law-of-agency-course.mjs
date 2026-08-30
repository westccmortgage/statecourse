/**
 * Texas Law of Agency — course record.
 *
 * WHAT THIS FILE IS. The single place that says what this course IS: its identity, its module
 * order, and its per-unit learning objectives. It mirrors config/texas/principles-ii-course.mjs and
 * config/texas/principles-i-course.mjs, because three courses that report their compliance posture
 * differently are three courses somebody has to check three times.
 *
 * A SEPARATE TREC COURSE. Law of Agency is its own 30-hour qualifying course with its own approval
 * form (LOA-1 rev. 09/11/2024), its own course number, its own enrolment and its own completion
 * record. Nothing here models it as part of Principles of Real Estate I or II.
 *
 * WHAT IS NOT ENABLED, AND WHY. No TREC approval exists for this course or for StateCourse as a
 * qualifying education provider. Enrolment, payment, credit reporting and certificate issuance are
 * all disabled here, and no final examination exists or is administrable: the codified 22 TAC
 * provider rules still cannot be read from this environment, and config/texas/trec-rules-source-lock.mjs
 * records that limitation rather than papering over it. Nothing in this file may be read as a claim
 * of approval, and the load-time invariants at the foot of the file refuse to load a build that
 * quietly flips one of those fields.
 *
 * THE OBJECTIVES ARE AUTHORED, NOT SPLIT. Each module's front matter carries a single
 * "Learning objectives" sentence for the whole topic. That sentence cannot be divided one clause
 * per unit: its clause count matches the unit count in only five of the twelve modules, and the
 * reduction passes rewrote several of them. Every objective below was therefore written against the
 * unit it belongs to, from the frozen text of that unit — one measurable capability, specific enough
 * that a quiz item can be written to it and a reviewer can tell whether a student has met it. Where
 * an objective names a section, that section is taught in the unit named, in the frozen curriculum
 * at LOA-CONTENT-FREEZE-2026-08-30.
 *
 * WHY THEY LIVE HERE RATHER THAN IN THE GENERATOR. scripts/generate-tx-law-of-agency-block-maps.mjs
 * imports these rather than deriving anything from module prose at generate time, so that editing a
 * module cannot silently change a generated objective. An edit to an objective is a diff in this
 * file, which is what review is for.
 *
 * THE TIME MODEL IS NOT HERE. Unlike Principles I and II, this course's instructional-time evidence
 * is already carried in its own artifacts and re-derived by script: config/texas/law-of-agency-time-budget.mjs
 * holds the three-layer budget, texas/tx-law-of-agency-30-v1/time-evidence.json holds the measured
 * result, and scripts/report-loa-time-evidence.mjs recomputes both. Restating those figures here
 * would create a second number to keep in step with the first, so this file states none.
 */

import { FORM, TOPICS, ALL_UNITS } from "./law-of-agency-course-form.mjs";

export const COURSE = Object.freeze({
  courseId: "tx-law-of-agency-30-v1",
  title: "Law of Agency",
  hours: FORM.courseHours,
  totalMinutes: FORM.totalMinutes,
  approvalForm: FORM.formNumber,
  approvalFormRevision: FORM.revision,
  curriculumDir: "texas/tx-law-of-agency-30-v1/curriculum",
  contentFreeze: "LOA-CONTENT-FREEZE-2026-08-30-v6",
  enrollmentEnabled: false,
  paymentEnabled: false,
  creditReportingEnabled: false,
  certificateIssuanceEnabled: false,
  /* The examination now EXISTS — config/texas/law-of-agency-final-exam-bank.mjs carries 132 secure
     items and config/texas/law-of-agency-final-exam-forms.mjs assembles four versions of 60. It is
     still not ADMINISTRABLE: the codified 22 TAC provider rules remain unread,
     TX_PROVIDER_RULE_SOURCE_LOCK still FAILS, and no student may be served an attempt. Those are two
     separate facts and this record keeps them separate rather than collapsing them into one flag. */
  finalExaminationExists: true,
  finalExaminationAdministrable: false,
  finalExaminationStatus: "BUILT_NOT_ADMINISTRABLE_PENDING_TAC_RULES",
  trecApprovalStatus: "NOT_SUBMITTED_NOT_APPROVED",
});

/** One module per LOA-1 topic, in the form's own topic order. */
export const MODULES = Object.freeze(
  TOPICS.map((topic, index) => {
    const nn = String(index + 1).padStart(2, "0");
    return Object.freeze({
      module: `module-${nn}`,
      file: `module-${nn}.md`,
      topicCode: topic.code,
      topic: topic.topic,
      scopeNote: topic.scopeNote,
      prescribedMinutes: topic.subtotalMinutes,
      units: topic.units.length,
    });
  }),
);

/**
 * UNIT_OBJECTIVES — one measurable capability per LOA-1 unit, 57 of them.
 *
 * Read each as the completion of "After this unit you will be able to ...". Each is derived from
 * what its unit actually teaches in the frozen module, not from the module's front-matter sentence
 * and not from the unit's title.
 */
export const UNIT_OBJECTIVES = Object.freeze({
  /* T01 — Agency Concepts */
  T01U1: "Decide whether described conduct makes a person a broker who must hold a Texas licence, by applying the consideration clause and the twelve enumerated acts of Occupations Code § 1101.002(1)(A), the brokerage-as-status rule and business carve-outs of § 1101.004, the conditional wholesaling exemption in § 1101.0045, the persons and transactions listed in § 1101.005 with their qualifiers attached, the licence requirement in § 1101.351, and 22 TAC §§ 535.4 and 535.5 — and say for each answer whether the statute or a Commission rule supplies it.",
  T01U2: "State what a failure of agency practice costs a Texas license holder, citing § 1101.003(a)(1) for why agency law is the first qualifying course, § 1101.652(b)(7) for the agency-specific disciplinary ground, § 1101.702(a) for the $5,000-per-violation ceiling with its per-day multiplier, § 1101.801 for the parallelism of the disciplinary, civil and criminal tracks, and §§ 1101.756 and 1101.758 for the criminal grade — and compute an unlicensed person's combined statutory exposure on a stated fee under § 1101.753(a) and § 1101.754(a).",
  T01U3: "Identify the role each person occupies in a Texas transaction — party under § 1101.551(2), principal or client, the broker as the party's agent under § 1101.557(a), the sales agent acting for that broker under §§ 1101.002(7) and 1101.351(c), the associated broker, the intermediary under § 1101.551(1), and the customer — state that TRELA defines neither \"client\" nor \"customer\", and list what a license holder owes a person the license holder does not represent under 22 TAC § 531.2, 22 TAC § 535.156(b) and (d) and § 1101.652(b)(3) and (b)(4).",
  T01U4: "Explain how a principal–agent relationship is created and what it demands: contrast the duties that follow from representation under § 1101.557(a) with the signed writing § 1101.806(c) requires before a commission can be sued for, state the fiduciary standard in 22 TAC § 531.2 and the boundaries drawn by 22 TAC § 537.11(b) and § 1101.556, apply the net-listing conditions in 22 TAC § 535.16(b), and describe the second principal–agent relationship — sales agent to sponsoring broker — under §§ 1101.351(c), 1101.803 and 1101.367(a).",

  /* T02 — Basic Agency Relationships, Disclosure and Duties to the Client */
  T02U1: "State from Occupations Code § 1101.557(a) the two acts that make a broker a party's agent, explain why the status attaches to the broker rather than to the sales agent under §§ 1101.002(7) and 1101.351(c), and distinguish agency from compensation, from holding a licence and from friendliness — using § 1101.562(a)(1)'s exclusion of an oral agreement to show that representation can arise without a signed writing.",
  T02U2: "Trace a Texas sales agent's authority from the client to the broker to the agent, quoting the three rules in the three sentences of 22 TAC § 535.2(a) — written scope, written limitation or revocation, and the broker's responsibility for permitted acts beyond scope — and decide from § 1101.557(c)(1), § 1101.652(b)(18)–(20) and 22 TAC § 535.146(b) whether a proposed act is within express or implied actual authority or exceeds it.",
  T02U3: "Classify a Texas engagement within the universal/general/special taxonomy and as single agency, statutory intermediary, or the § 1101.562 non-representation showing — showing from § 1101.557(c)(1) that a residential listing or buyer representation agreement is special agency because only a power of attorney and a property management agreement are named as instruments conferring authority to bind — and state accurately that Chapter 1101 no longer uses \"subagent\" after the repeals effective January 1, 2026.",
  T02U4: "State 22 TAC § 535.157 in its own words — who is bound, the three categories of person it names, and two calendar rather than working days — and ground each of the six fiduciary duties in the Texas text that imposes it, including the written-agreement condition 22 TAC § 535.156 attaches before the duty to submit post-contract offers can be switched off.",
  T02U5: "Distinguish the § 1101.558(b) representation disclosure — oral or written, at first contact, to the other side — from the § 1101.558(b-1) written IABS notice at first substantive communication about specific real property, apply the three § 1101.558(c) exceptions to the written notice only, and deliver the notice within 22 TAC § 531.20: its four permitted methods, the bar on a link in an email footnote or signature block, the two homepage-link labels with their different font floors, and the verbatim-reproduction constraint.",

  /* T03 — Duties and Disclosures to Third Parties */
  T03U1: "List the duties a Texas license holder owes a person the license holder does not represent, naming for each the statute or Commission rule that imposes it, and state what is not owed — loyalty, confidentiality, advocacy, and any duty to investigate — using § 1101.562's portrait of a license holder who may confirm size, price and terms but may not advise.",
  T03U2: "Apply both halves of 22 TAC § 535.156 — honest and fair dealing with all parties, fidelity to the principal only — to decide what a license holder may and may not say to the other side of a transaction, and explain why fairness is not neutrality by reference to § 1101.651(d), 22 TAC § 531.3 and § 1101.652(b)(1) and (b)(2).",
  T03U3: "Build the working definition of a third party from the § 1101.551(2) definition of \"party\", distinguish parties from the inspectors, lenders, appraisers and cooperating license holders who are reached instead by 22 TAC § 535.156's duty to convey accurate information to members of the public, and compute the 22 TAC § 535.157 two-calendar-day deadline by date for a principal, for another party's license holder, and for an unrepresented party.",
  T03U4: "Separate a duty to disclose from a duty to investigate that no held source imposes, by applying the three qualifiers in § 1101.652(b)(3) and (b)(4), the advice/judgment/opinion line drawn by Business & Commerce Code § 17.49(i), the concealment provision at § 17.46(b)(24), and both conjunctive conditions of Occupations Code § 1101.805(d) and (e) in each direction — and state what § 1101.804 protects and the qualifier it attaches.",
  T03U5: "Operate Property Code § 5.008: identify from subsection (a) which sales it reaches, state the subsection (d) knowledge standard and the \"Unknown\" safe harbour, apply the subsection (e) exemptions, and apply the subsection (f) delivery deadline and the purchaser's seven-day right to terminate for any reason running from receipt — then state what a license holder's own § 1101.652(b)(4) duty adds when the seller's notice duty is exempt.",
  T03U6: "State exactly what Occupations Code § 1101.556 and Property Code § 5.008(c) relieve — inquiry, disclosure and release, for a prior or current occupant's AIDS or HIV status and for a death by natural causes, suicide or accident unrelated to the condition of the property — identify what falls outside that relief, including homicide and a death caused by the property's condition, separate the relief from a duty those two sections give from the civil and criminal immunity § 1101.802 supplies for the AIDS or HIV limb alone, with no parallel immunity for deaths, and explain why relief from a duty to disclose is not permission to answer falsely and why 22 TAC § 531.19 independently bars inquiring about, responding to or disclosing an occupant's disability.",

  /* T04 — Seller Agency */
  T04U1: "Assemble the terms a Texas listing must carry from the prohibitions that require them — § 1101.652(b)(12), (18), (19) and (20), § 1101.155(c) and 22 TAC § 535.2 — explain why § 1101.806(c), not Business & Commerce Code § 26.01, is what makes the writing existential for an ordinary house commission, distinguish exclusive right to sell, exclusive agency and open listing by their dollar consequence to the seller, apply the two conditions and two required protections 22 TAC § 535.16 places on a net listing, apply the same rule's two price-opinion triggers of negotiating a listing and offering to purchase for your own account after contact made while acting as an agent, and hold the listing table inside 22 TAC § 537.11, whose subsection (b) bars legal advice and drafted contract language, whose (c) and (d) permit explaining informational items and acting on a principal's written instruction made conspicuous, and whose (f) requires you to tell the principals the instrument is binding on them.",
  T04U2: "Apply § 1101.652(b)(22) element by element — negotiating or attempting to negotiate, with knowledge, an outstanding written contract granting exclusive agency to another broker, in connection with the transaction — together with 22 TAC § 535.153, to decide what a competing license holder may lawfully do while a listing is outstanding, and apply the three conditions of the sole-delivery safe harbour in § 1101.557(c)(3).",
  T04U3: "Name each entitlement a seller acquires by signing a listing and cite the source that creates it — 22 TAC §§ 531.2, 535.2(b), 535.156, 535.157 and 535.16, § 1101.557(b), § 1101.803 and 22 TAC § 537.11(e) — and state the limits, including that representation does not make the license holder a lawyer and does not entitle the seller to have a known material defect concealed.",
  T04U4: "State accurately what Texas law now says about subagency — that \"subagent\" appears nowhere in Chapter 1101 as held, that § 1101.002(8) and § 1101.805(f) were repealed effective January 1, 2026, and that TREC's guidance says the concept has not been eliminated generally — describe the structural model and the listing broker's historic exposure, and explain from § 1101.557(a), § 1101.559(a)(2) and § 1101.563(c)(1)(D) and (E) why the source of compensation does not decide who is represented.",
  T04U5: "Run the disclosure sequence a listing generates in trigger order rather than by name — the § 1101.558(b) representation disclosure at first contact, the § 1101.558(b-1) written notice at first substantive communication about specific real property, the seller's Property Code § 5.008 notice on or before the effective date, the money disclosures at § 1101.652(b)(8), (13) and (16), and the limits § 1101.651(d)(3) places on confidentiality — and identify which trigger a given fact pattern has reached.",

  /* T05 — Buyer Agency */
  T05U1: "State whose contract a buyer representation agreement is, and reproduce what § 1101.563 requires: the subsection (a) definition of residential real property and what it excludes, the two subsection (b) triggers, each item subsection (c) requires including the conspicuous statement that compensation is not set by law and is fully negotiable, and the subsection (d) and (e) limits on a showing-only agreement — non-exclusive, no termination date more than fourteen days out, and a separate agreement before further brokerage acts — naming § 1101.652(b)(34) as the sanction for failing to make the agreement.",
  T05U2: "Decide whether a brokerage may accept a particular buyer engagement, applying the broker's authority over the decision under 22 TAC § 535.2, the competence threshold in 22 TAC § 531.4 and § 1101.652(b)(1), the in-house-listing conflict that makes intermediary status compulsory under § 1101.561(b) and requires the § 1101.559 consent to be captured in the agreement at signing, and the limits 22 TAC § 531.19 places on the grounds for declining.",
  T05U3: "Identify which of the two lawful buyer-side postures a license holder occupies on stated facts — representation under a § 1101.563 written agreement, or a § 1101.562 showing without representation — by applying § 1101.562(a)'s four conjunctive conditions and the subsection (c) limit permitting only confirmation of size, price and terms, and name the conduct that destroys the non-representation posture and turns an unrepresented prospect into a client by accident.",
  T05U4: "State each benefit of buyer representation as a duty in a held source rather than as a selling point, and say precisely what an unrepresented buyer receives anyway under § 1101.652(b)(3) and (b)(4) and 22 TAC § 535.156, and what representation does not deliver under 22 TAC § 537.11(b), 22 TAC § 535.17 and § 1101.556.",
  T05U5: "Draft or evaluate a buyer-side compensation term against § 1101.563(c)(1)(E)'s requirement of both the amount or rate and how it will be determined and § 1101.563(c)(2)'s conspicuous negotiability disclosure, explain why § 1101.806(c) requires a writing signed by the party sued, and route a payment correctly under § 1101.651(a)–(c) and 22 TAC § 535.3, including compensation earned before a change of sponsorship.",
  T05U6: "Sequence a buyer's broker's disclosures by trigger — the IABS at first substantive communication, the § 1101.563 agreement before any showing, the § 1101.558(b) disclosure at first contact with the other side, the 22 TAC § 535.144 written own-interest disclosure before any contract of sale, the 22 TAC § 535.148 disclosure-and-consent before accepting a fee from anyone other than the client, and the § 1101.555 written abstract-or-title-policy advice when the offer is signed — and state the commission forfeiture § 1101.806(d) attaches to omitting the last.",

  /* T06 — Representing More Than One Party in a Transaction: Intermediary Brokerage */
  T06U1: "Explain why a single license holder cannot deliver undivided loyalty to two adverse principals, state that Chapter 1101 creates no dual-agency capacity and that § 1101.561(b) requires a broker who agrees to represent both a buyer or tenant and a seller or landlord to act as an intermediary, and distinguish that from the \"dual capacity as broker and undisclosed principal\" ground in § 1101.652(b)(16), which is about concealed self-interest rather than two clients.",
  T06U2: "Create and operate the intermediary capacity: apply the two conjunctive conditions of § 1101.559(a), the § 1101.559(b) safe harbour and its requirement of conspicuous bold or underlined print without any prescribed point size, the fair-and-impartial duty in § 1101.559(c), and each of the five prohibitions in § 1101.651(d) with its separate-writing, legal-compulsion and condition-of-the-property exceptions — and state what the supersession in § 1101.561(a) does and does not displace.",
  T06U3: "Carry out an appointment under § 1101.560 — who may appoint, who may be appointed, the two conditions the word \"only\" makes mandatory, and the broker's written notice of the appointment to all parties — and state that the difference between intermediary with and without appointments is the availability of opinions and advice, not confidentiality, because § 1101.651(d) binds appointees exactly as it binds the broker.",
  T06U4: "Apply the intermediary framework to the awkward configurations of real practice — the sole-practitioner broker who cannot appoint, the agent holding both the listing and the buyer client, commercial and lease transactions where § 1101.563's residential limit does not reach but §§ 1101.559–1101.561 do, and the license holder who is a party under § 1101.557(c)(1) — and identify which of them is not an intermediary problem at all.",
  T06U5: "Distinguish an intentional intermediary arrangement from unintended dual representation by naming the behaviours that produce the latter — advising the other side on price, helping an unrepresented buyer write the offer, disclosing the client's motivation, answering \"what will they take?\", letting a showing-only relationship drift, and dealing directly with a party under another broker's exclusive agency — and quantify the exposure under § 1101.652(b)(7) and (b)(8), the per-day multiplier in § 1101.702(a), and the bands of 22 TAC § 535.191.",

  /* T07 — Creation and Termination of Agency */
  T07U1: "Fix the moment a Texas agency comes into existence under § 1101.557(a), separate the three writing requirements by the question each answers — § 1101.563 whether you may act, § 1101.806(c) whether you may sue for the fee, and Business & Commerce Code § 26.01 which promises the statute of frauds actually reaches — and explain why an agency created by conduct is a hazard rather than a technique, carrying full duties, no enforceable commission, and a § 1101.652(b)(34) count.",
  T07U2: "List the events that end an agency and state for each what the held Texas sources do and do not establish — completion of the purpose, expiry of the definite termination date § 1101.652(b)(12) requires, mutual agreement, revocation and renunciation, death with the immediate vesting rule in Estates Code § 101.001, incapacity, destruction, bankruptcy, and suspension — and apply § 1101.367(a) to a sales agent's change of sponsorship, naming who must notify whom, in what form, when, and what happens to the licence.",
  T07U3: "State which duties survive the end of an agency and on what authority: confidentiality under § 1101.651(d)(3) with its three exceptions and the honest fact that no held source fixes a duration; the trust-money duties of 22 TAC § 535.146, including the second-working-day deposit, the thirty-day payment after a written demand, the thirty-day removal of money the broker has earned, and permissive interpleader; a contractual protection period, which is enforceable only through the signed writing § 1101.806(c) requires; the four-year record clocks in 22 TAC §§ 535.146(e) and 535.2; and the document duties that survive on their face — § 1101.652(a)(5), failing without just cause to surrender a document the owner requests, and § 1101.652(b)(28), refusing a signer a copy of a document that person signed.",

  /* T08 — Clarifying Agency Relationships */
  T08U1: "Distinguish a brokerage's written disclosure policy from the forms it delivers by identifying the decisions § 1101.558 and 22 TAC § 531.20 leave to the firm — who delivers, in which channel, and how delivery is proved four years later — state the two things 22 TAC § 531.18 requires of each license holder for the Consumer Protection Notice, namely display in a readily noticeable location in each place of business the broker maintains and a labelled homepage link on each business website as that rule's three cumulative elements define one, give both permitted labels with their font floors of 10 point for \"Texas Real Estate Commission Consumer Protection Notice\" and 12 point for \"TREC Consumer Protection Notice\", and distinguish that notice from the IABS in statutory parent, audience and method of delivery.",
  T08U2: "Read a Texas brokerage's policy manual against the rules that require it, answering from that manual the day-one questions each authority raises — beginning with the written scope of your authorised activities under the first sentence of 22 TAC § 535.2 — and identify the decisions a one-sentence policy promising compliance with \"all TREC disclosure requirements\" fails to make.",

  /* T09 — Employment Issues */
  T09U1: "Apply the four conditions of Labor Code § 201.072(1) and the three conditions of 26 U.S.C. § 3508(b)(1) to a proposed independent contractor agreement, identify the clauses the written contract must carry to satisfy both, and state each statute's boundary — \"in this subtitle\" for unemployment compensation, \"for purposes of this title\" for federal tax — and that neither reduces the broker's duties under 22 TAC § 535.2 or § 1101.803 by a line.",
  T09U2: "Apply Texas Labor Code chapter 21 to a brokerage: state the prohibition and seven characteristics in § 21.051, apply the § 21.002(8) definition of employer with its fifteen-employee, twenty-week threshold to a firm of sponsored agents and salaried staff, apply the one-employee definition in § 21.141 and the liability standard in § 21.142, and explain why neither § 201.072 nor 26 U.S.C. § 3508 answers a chapter 21 question.",
  T09U3: "Distinguish the two senses of \"employ\" in Texas real estate — the client's engagement of the broker under § 1101.557(a) and § 1101.002(1)(B)(i), and the labour-law sense in 22 TAC § 535.5(c) and (d)(2) — and explain why the listing belongs to the broker and does not travel with a departing sales agent, and why § 1101.652(b)(26) makes an association \"by employment or otherwise\" with an unlicensed person expected to act as a license holder a violation whatever the label.",
  T09U4: "Decide which tasks an unlicensed personal assistant may perform and who may lawfully pay one, applying the licensed acts in 22 TAC § 535.4 including the rule's own broad definition of \"show\", the answering-service permission in 22 TAC § 535.5(g) and each of its elements, the referral rule in 22 TAC § 535.20 with its greater-than-$50 merchandise figure and the four conditions of its exemption, and the payment limits in § 1101.651(a) and 22 TAC §§ 535.147 and 535.3.",
  T09U5: "Audit a working brokerage against every subsection of 22 TAC § 535.2 — the written scope notice and acts-beyond-scope trap in (a), the fiduciary standard and its \"unless prohibited by other law\" qualifier in (b), trust funds in (c), property management in (d), the written delegation and the two 30-day Commission notices in (e), listings in the broker's name in (f), advertising in (g), the eight record categories and the four-year clock in (h), the eight written-policy requirements including first-three-times coaching in (i), the two- and three-calendar-day clocks in (j) and (k), the designated broker's ownership of all of it for a business entity in (l), and the statement in (m) that the section does not create or require an employer/employee relationship.",
  T09U6: "Route every dollar of brokerage compensation correctly, applying both sentences of 22 TAC § 535.3 and § 1101.651(a)–(c) with the clause covering compensation earned under a prior sponsorship, the five conditions § 1101.355(d) attaches to receipt through the license holder's own entity, the rebate conditions in 22 TAC § 535.147(d), and the out-of-state cooperation permitted by § 1101.651(a)(2) and 22 TAC § 535.131.",

  /* T10 — Agency, Ethics and the Law */
  T10U1: "Sort a complaint about a license holder into the enforcement system that can reach it — law, licensing or association ethics, or morals — naming the decision-maker, procedure and sanction of each, and explain from § 1101.656(a), § 1101.701(a) and § 1101.801 why conduct that is neither a crime nor a tort can cost a licence and why the three systems run in parallel rather than in sequence.",
  T10U2: "State the protected characteristics exactly as 42 U.S.C. § 3604, Texas Property Code chapter 301 and 22 TAC § 531.19 each state them, including where the lists differ; apply the reasonable-modification and reasonable-accommodation provisions with their \"may be necessary\", cost-allocation and restoration qualifiers intact; explain why the owner-seller exemptions in 42 U.S.C. § 3603(b) and Property Code § 301.041 are destroyed the moment a license holder is engaged; and trace one act of steering through the four exposures it creates — 42 U.S.C. § 3604(a), Property Code § 301.021(a), 22 TAC § 531.19 and Occupations Code § 1101.652(b)(32) — naming the Texas Workforce Commission as the chapter 301 enforcer under § 301.0015 and the duty § 301.114 places on it to send a fair housing order to the licensing agency with a recommendation of disciplinary action.",
  T10U3: "Locate a described act in the correct subsection and subdivision of § 1101.652, read the Canons at 22 TAC §§ 531.1–531.20 as the ethics code enforceable against every Texas license holder, and trace a consumer complaint from a signed, non-anonymous filing made within four years under § 1101.204 through the triage, broker-notice and suspension provisions of 22 TAC § 535.141 to a sanction authorised by § 1101.656 and § 1101.702 and priced by the bands of 22 TAC § 535.191 — and state the suspension or revocation § 1101.654(a) commands rather than permits for drafting an instrument or advising on legal sufficiency, the safe harbour subsection (b) supplies for completing an approved or attorney-prepared form, and the twenty days § 1101.704(a) allows before silence becomes acceptance of the determination.",
  T10U4: "Describe what a trade association code of ethics is and how it binds — by contract on members who joined and paid dues — using the 22 TAC § 535.1 definition of Trade Association and the definition and regulator/association wall in § 1101.053, and distinguish a private ethics or arbitration proceeding from a Commission complaint in forum, remedy and consequence without attributing any article of an unheld association code to Texas law, and name the three places held law reaches associations directly — the membership-discrimination prohibitions in 42 U.S.C. § 3606 and Property Code § 301.027, the information-sharing shelter in § 1101.804 with the statutory-prohibition qualifier that ends it, and 22 TAC §§ 535.5 and 537.11 on electronic listing services and trade-association contract forms.",
  T10U5: "State the minimum ethical standard a Texas license holder must meet as the unit's list of thirteen concrete behaviours — making your position clear, putting the client first in the writings the statute requires, telling the client everything that bears on the decision promptly, being accurate with everyone including non-clients, promising nothing you cannot deliver, handling other people's money as trust money, taking only compensation you are entitled to with disclosure, disclosing when you are on the other side of the deal, being competent for the market and the property type and declining when you are not, staying out of the practice of law under § 1101.654(a), never trading in preference or prejudice, giving the required notices and keeping the four-year file, and answering the Commission — tracing each to the canon, rule or subdivision that requires it.",

  /* T11 — Deceptive Trade Practices and Consumer Protection Act */
  T11U1: "Place a false statement on the ladder of culpability the Texas statutes actually define — the absence of any scienter requirement in most of Business & Commerce Code § 17.46(b), negligence under § 1101.652(b)(1), \"knowingly\" as § 17.45(9) defines it and \"intentionally\" as § 17.45(13) defines it, each with its inference clause read whole — and apply § 1101.805(e) and 22 TAC § 535.145 to a statement repeated from a seller or made only out loud.",
  T11U2: "Determine whether a person may sue a Texas license holder under the DTPA, applying the § 17.45(4) definition of \"consumer\" with its absence of any privity requirement and its $25 million business-consumer exclusion, the four doors of § 17.50(a) and the closed-list rule in § 17.46(d), the § 17.46(b) subdivisions that realistically reach brokerage, and the definition of an unconscionable action in § 17.45(5).",
  T11U3: "Compute a DTPA award under § 17.50(b)(1) at each of its three tiers — economic damages alone; a knowing finding, which adds mental anguish and up to three times economic damages; and an intentional finding, which multiplies mental anguish and economic damages together — add the court costs and attorney's fees § 17.50(d) makes mandatory for a prevailing consumer, keep those fees, costs and prejudgment interest out of the multiplier base as § 17.50(e) requires, and state the fee award § 17.50(c) directs to the defendant on a court finding that the action was groundless or brought in bad faith.",
  T11U4: "Assert the DTPA defences in the order a case presents them: the § 17.49(i) broker exemption and each of its three carve-outs, the professional-services exemption in § 17.49(c), the transaction-size exemptions in § 17.49(f) and (g) with their exact dollar thresholds and conjunctive conditions, the § 17.505 notice prerequisite, the written-information defence in § 17.506(a) with the causation limit in (b), the thirty-day tender defence in § 17.506(d), and the two-year limitations period in § 17.565 with its 180-day extension.",
  T11U5: "Connect civil DTPA exposure to the licence and to the consumer's backstop: identify the § 1101.652 grounds that reach the same conduct on an administrative record with no consumer, no reliance and no dollar of loss, explain how 22 TAC § 535.149 gives § 1101.652(b)(15) its content by adopting the § 17.46 acts, state the operation and exact caps of the Real Estate Recovery Trust Account under §§ 1101.601, 1101.602, 1101.605(a), 1101.610 and 1101.613(b), and state what a payment from the account does to the license holder — subrogation under § 1101.612(a), revocation under § 1101.655(a) where the account is not repaid before the 31st day after notice, and ineligibility for a licence under § 1101.655(c) until the amount is repaid in full with interest.",

  /* T12 — Implementation and Presentation */
  T12U1: "Run a Texas seller-side engagement in the order the law requires each document to exist — the IABS before the listing appointment, a price opinion carrying the 22 TAC § 535.17 statement verbatim in at least 12-point font and submitted in the broker's name, a listing with a § 1101.652(b)(12) definite termination date and written sign consent, the Property Code § 5.008 notice before marketing, advertising inside 22 TAC § 535.155's identification, size-ratio and ten-day timing rules, and every offer presented under 22 TAC § 535.156 — naming the authority that compels each step.",
  T12U2: "Run a Texas buyer-side engagement in order — the IABS at first substantive communication, the § 1101.563 written agreement before any showing with no grace period, the choice between a representation agreement and a showing-only agreement, the size/price/terms limit that governs what you may say in the kitchen under § 1101.562(c), intermediary consents obtained before the buyer writes, the § 1101.555 written abstract-or-title advisory at the signature of the offer that § 1101.806(d) makes the price of the commission, the contract-form and practice-of-law boundary of 22 TAC § 537.11 with its four mandatory-form exceptions, its reproduction rule and its bar on drafting or recommending escalation, appraisal and contingency language, and the 22 TAC § 535.146 earnest-money sequence from a sales agent's immediate delivery to the broker through the close of business of the second working day — and apply the open-house rules that differ for a hosting agent inside and outside the listing brokerage.",
  T12U3: "Convert the course's rules into standing daily habits and cite the authority behind each: the two-calendar-day response under 22 TAC § 535.157, the writings on which each statutory permission depends, the four-year eight-category file under 22 TAC § 535.2 with the personal production duties in § 1101.652(a-1)(2) and (b)(28), the five questions that keep you inside 22 TAC § 537.11, and competence in the market and property type under 22 TAC § 531.4 and § 1101.652(b)(1) and (a)(6).",
  T12U4: "Handle the matters that sit outside an ordinary brokerage transaction: a deal for your own account or in an extended capacity under 22 TAC § 535.144, applying its more-than-10% and trust extensions, its written disclosure requirement and timing, and its bar on using your expertise to the disadvantage of the person you deal with; referral fees and rebates under 22 TAC §§ 535.20, 535.147, 535.148 and 535.155; team, alternate and assumed names under 22 TAC § 535.154; and the office, address and contact duties of § 1101.552 and 22 TAC § 535.21.",
  T12U5: "Identify the recurring Texas complaint patterns, say where in the working week each one is created and what it costs under § 1101.702(a) and 22 TAC § 535.191, and state what to do on the day the mistake is yours — tell the broker, correct the record in writing toward everyone who relied on it, use the 22 TAC § 535.146 notice and interpleader rules where money is involved, add to the file rather than alter it, and answer the Commission, since § 1101.652(a)(4) makes silence its own ground and § 1101.702(b) makes correction relevant to the penalty.",
});

/* ── unit trace: LOA-1 unit → module → objective ───────────────────────────────────────────────
   The map a reviewer reads left to right: the form's own unit code, the module that teaches it, the
   minutes the form allocates it, and the capability this build claims for it. Statute sourcing for
   each unit is not restated here — it lives in config/texas/law-of-agency-statute-sources.mjs and is
   re-derived by scripts/texas-source-inventory.mjs and scripts/freeze-loa-curriculum.mjs, so there is
   one place to keep current rather than two. */
const moduleByTopic = new Map(MODULES.map((m) => [m.topicCode, m]));

export const UNIT_TRACE = Object.freeze(
  ALL_UNITS.map((unit) => {
    const mod = moduleByTopic.get(unit.topicCode);
    return Object.freeze({
      code: unit.code,
      unit: unit.unit,
      topicCode: unit.topicCode,
      module: mod?.module ?? null,
      file: mod?.file ?? null,
      prescribedMinutes: unit.minutes,
      objective: UNIT_OBJECTIVES[unit.code] ?? null,
    });
  }),
);

/* ── load-time invariants ─────────────────────────────────────────────────────────────────────
   A unit with no objective is a unit nobody can assess, and this file refuses to load rather than
   export one. The approval-status fields are frozen shut the same way: this build has no TREC
   approval, and a future edit that flips one of them without the approval to match should break the
   build rather than ship quietly. */
for (const trace of UNIT_TRACE) {
  if (!trace.module) throw new Error(`law-of-agency-course: unit ${trace.code} has no module`);
  if (!trace.objective) throw new Error(`law-of-agency-course: unit ${trace.code} has no learning objective`);
}
const objectiveCodes = Object.keys(UNIT_OBJECTIVES);
const unitCodes = new Set(ALL_UNITS.map((unit) => unit.code));
for (const code of objectiveCodes) {
  if (!unitCodes.has(code)) throw new Error(`law-of-agency-course: objective ${code} is not an LOA-1 unit`);
}
if (objectiveCodes.length !== 57) {
  throw new Error(`law-of-agency-course: expected 57 unit objectives, found ${objectiveCodes.length}`);
}
if (UNIT_TRACE.length !== 57) throw new Error(`law-of-agency-course: expected 57 LOA-1 units, found ${UNIT_TRACE.length}`);
if (MODULES.length !== 12) throw new Error(`law-of-agency-course: expected 12 topics, found ${MODULES.length}`);
if (COURSE.trecApprovalStatus !== "NOT_SUBMITTED_NOT_APPROVED") {
  throw new Error("law-of-agency-course: this course has no TREC approval; the status field may not say otherwise");
}
if (COURSE.enrollmentEnabled || COURSE.paymentEnabled || COURSE.creditReportingEnabled || COURSE.certificateIssuanceEnabled) {
  throw new Error("law-of-agency-course: nothing downstream of content may be enabled without TREC approval");
}
if (COURSE.finalExaminationAdministrable) {
  throw new Error("law-of-agency-course: no examination is administrable while the codified 22 TAC provider rules remain unread");
}
if (COURSE.finalExaminationExists && COURSE.finalExaminationStatus !== "BUILT_NOT_ADMINISTRABLE_PENDING_TAC_RULES") {
  throw new Error("law-of-agency-course: an examination that exists but cannot be administered must say so in its status");
}

export default Object.freeze({ COURSE, MODULES, UNIT_OBJECTIVES, UNIT_TRACE });
