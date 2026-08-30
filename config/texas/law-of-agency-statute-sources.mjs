/**
 * Texas statutes, federal law, TREC rules, the adopted IABS form, TREC guidance and the Secretary
 * of State's Texas Register capture for the Law of Agency (LOA-1, 30 hours) — the read register.
 *
 * THE RULE THIS FILE ENFORCES BY ITS SHAPE: HELD IS NOT READ, AND READ IS NOT RELIED ON. Every
 * source below is a document on disk. Its sha256 and byte count are recomputed from that file by
 * sourceValidation(), never transcribed from another artefact. Inside each source, `sectionsRead`
 * lists the sections the twelve modules actually opened, each with a note stating what that section
 * establishes.
 *
 * A CHAPTER CAN SIT ON DISK FULLY HASHED AND CONTRIBUTE NOTHING. texas/trec-sources holds 146 files.
 * This register names 55 of them, and the other 91 are ABSENT from it entirely rather than listed
 * for completeness: the other five course approval forms, the Texas Constitution file, Occupations
 * Code ch. 1103, Property Code chs. 11, 12, 13, 21, 41, 51, 53, 91, 92, 111 and 202, Estates Code
 * chs. 111, 112, 201, 203 and 251, Business and Commerce Code ch. 9, Business Organizations Code
 * ch. 200, Family Code ch. 3, Finance Code ch. 343, Government Code chs. 4001 and 4005, Health and
 * Safety Code ch. 361, Insurance Code ch. 2501, Local Government Code chs. 211, 212 and 232, Natural
 * Resources Code ch. 21, Penal Code ch. 32, Tax Code chs. 11 and 32, Water Code ch. 11, every
 * RESPA, TILA, ECOA, HMDA, CRA, bank-holding and environmental federal file,
 * 26 U.S.C. §§ 1445 and 860A, and the Fair Housing Act sections this course does not cite —
 * 42 U.S.C. §§ 3601, 3605, 3607, 3610, 3611 and 3617. They were read for other Texas courses, or for
 * none; they were not read for this one, so they are not registered for it.
 *
 * THE THREE RULES THIS REGISTER USED TO OMIT ARE NOW REGISTERED, AND THE REASON THEY WERE OMITTED
 * IS THE REASON THEY ARE HERE. Until 2026-08-30 this file held 22 TAC §§ 535.62, 535.63 and 535.65
 * on disk and deliberately left them out, because the course had no assessment engine, no instructor
 * dossier and no delivery-control artefact for them to be controlling OVER. Assessment authoring
 * begins now, so the omission would become the opposite of what it was: an acceptance package that
 * leaves out the rules governing its own examinations. All five course-governing rules —
 * §§ 535.55, 535.62, 535.63, 535.64 and 535.65 — are registered below as CONTROLLING, at subsection
 * granularity, with the artefact each subsection controls named on the record and inverted into
 * ASSESSMENT_AND_DELIVERY_CONTROLS. §§ 535.55 and 535.64 were already registered and have been
 * rewritten to the same granularity rather than left as one-line records.
 *
 * THEY CONTROL ARTEFACTS, NOT UNITS, AND THAT IS RECORDED AS A DIFFERENCE RATHER THAN GLOSSED.
 * No LOA-1 unit teaches any of the five, so each carries an empty reliedOnByUnits and a populated
 * reliedOnByArtifacts; unit coverage is unchanged by their arrival at 57/57. Occupations Code
 * ch. 1101 is not a substitute for any of them: § 1101.151 confers the rulemaking power and
 * §§ 1101.301 and 1101.358 require qualifying education, and none of them states a single one of
 * the assessment or delivery requirements these rules impose.
 *
 * WHERE THE UNIT ATTRIBUTIONS COME FROM, AND WHY THEY WERE NOT GUESSED. `primaryUnits` and
 * `pointerUnits` in every read record below are DERIVED, not asserted. The derivation is
 * texas/tx-law-of-agency-30-v1/claim-audit.json — regenerate it with `node scripts/audit-loa-claims.mjs`
 * — which carries one row per citation occurrence in the twelve curriculum modules, each row naming
 * the module, the section cited and the held file the section resolves to. Each citation is
 * attributed to the unit whose `## Unit:` heading precedes it in the module, and the module's topic
 * is the topic that module teaches. 2,217 citation rows resolved to 46 distinct held files, and
 * every one of those 46 is registered below.
 * A citation that falls before any unit heading belongs to the module's front matter and is recorded
 * as `citedInTopicFrontMatter` at source level rather than being pushed onto a unit that did not
 * make it.
 *
 * PRIMARY RELIANCE VERSUS A POINTER. The LOA build ran a condensation pass under an ownership rule:
 * every authority has ONE home topic, which teaches it in full, and every other topic states the
 * operative sentence, cites it, says which module teaches it, and moves on. Recording those two
 * things as if they were the same would misdescribe the course. So each read record carries
 * `ownedByTopics` — the topic the ownership map assigns the section to — and splits the citing units
 * into `primaryUnits` (units inside an owning topic) and `pointerUnits` (units elsewhere that cite
 * it to point at the owning module). Where the ownership map assigns no owner, `ownedByTopics` is
 * null and every citing unit is recorded as primary rather than being ranked by guess.
 * `reliedOnByUnits` is the union of the two, which is what unit coverage is measured on: a unit that
 * cites held authority is sourced whether it teaches that authority or points at it.
 *
 * SOURCE TIERS. Every registered source carries a `tier`:
 *   "controlling"  — binding law or rule whose operative text supplies a proposition the course
 *                    teaches as law, or on which the course's compliance logic depends. Every Texas
 *                    chapter, every federal section and all 37 administrative rules below.
 *   "guidance"     — official explanatory material published by the regulator that is not itself
 *                    binding. OFFICIAL EXPLANATORY GUIDANCE MAY EXPLAIN CONTROLLING LAW BUT MAY NOT
 *                    REPLACE IT, and this register enforces that rather than merely saying it: a
 *                    load-time invariant below rejects any unit whose only support is guidance or
 *                    contextual. Two sources: TREC's 2026 buyer/tenant representation article and
 *                    TREC's contracts listing page.
 *   "contextual"   — read and used for background, framing, naming, or for LOCATING a provision
 *                    within a rule, with no operative rule taken from it as adopted text. One
 *                    source: the Secretary of State's Texas Register of 22 May 2026, which is where
 *                    the subsection lettering of §§ 535.62 and 535.65 is read from and which carries
 *                    the 2026 amendment to § 535.65(j) as PROPOSED. Nothing is built on it as though
 *                    it were the codified rule, and no unit may rest on it.
 *   "identified-not-taught" — a source this course HOLDS and IDENTIFIES but takes no proposition
 *                    from. One source: the adopted IABS 1-2 form. See its entry for why it is
 *                    registered at all rather than left out.
 *
 * THE FORM AND THE RULE THAT ADOPTS IT. texas/trec-sources/forms/IABS-1-2.pdf is the Information
 * About Brokerage Services notice that 22 TAC § 531.20 adopts by reference. The CONTROLLING
 * AUTHORITY for everything this course says about that notice is the rule, together with Occupations
 * Code § 1101.558(b-1); the form is the instrument the rule adopts. The twelve modules were authored
 * before the PDF was acquired and say in eight places that the form's text "was not held for this
 * course", teaching the notice through the rule and the statute instead. Acquiring the file does not
 * retroactively make it a source of anything the course teaches, so it is registered at tier
 * "identified-not-taught" with an empty `reliedOnByUnits` and an `identifiedByUnits` list — held,
 * hashed, findable, and honestly described as contributing no taught proposition.
 *
 * FEDERAL AUTHORITY IS RECORDED WITHIN ITS ACTUAL SCOPE. 26 U.S.C. § 3508 opens "For purposes of
 * this title" and that title is the Internal Revenue Code: it is registered as controlling for
 * FEDERAL TAX TREATMENT ONLY. Labor Code § 201.072 opens "In this subtitle" and that subtitle is the
 * Texas Unemployment Compensation Act: it is registered as controlling for UNEMPLOYMENT
 * COMPENSATION ONLY. Neither decides common-law employment status, vicarious liability, wage-and-hour
 * treatment, or a broker's supervisory responsibility under 22 TAC § 535.2. The read records say so
 * in those words, because a source register that implies a broader reliance than the statute
 * supports is the same error the curriculum was corrected for.
 *
 * THE ADMINISTRATIVE RULES ARE THE REGULATOR'S OWN REPRODUCTION, NOT THE CODIFIED TEXT. All 34
 * rule files are the section text TREC publishes on its consolidated Rules page. The Secretary of
 * State's codified 22 TAC could not be opened from this environment. Every rule entry carries
 * codifiedTextCompared: false and the gap is recorded in GAPS. Nothing here may be cited to a
 * student as the Secretary of State's adopted text.
 *
 * NOTHING HERE CLAIMS OR IMPLIES TREC APPROVAL. This register records what was read. It is not an
 * approval, a submission, or evidence of one.
 *
 * PROVING ITSELF. sourceValidation() recomputes every registered source's sha256 and byte count from
 * disk with node:crypto and node:fs and reports mismatches, alongside tier counts, gap counts by
 * gapTier, and unit coverage against the 57 units of LOA-1 as transcribed in
 * config/texas/law-of-agency-course-form.mjs. A register that cannot prove its own integrity is a
 * claim, not a record.
 */

import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TOPICS, ALL_UNITS } from "./law-of-agency-course-form.mjs";
import { RULES as TREC_RULES, SOURCE as TREC_RULES_SOURCE } from "./trec-rules-source-lock.mjs";
import { SOURCES as REGULATORY_SOURCES, lawOfAgencySourceLock as manifestLawOfAgencySourceLock } from "./regulatory-manifest.mjs";

/** Repository root, so a localCopy path can be resolved for hash verification from anywhere. */
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const SOURCE_TIERS = Object.freeze(["controlling", "guidance", "contextual", "identified-not-taught"]);
export const GAP_TIERS = Object.freeze(["controlling", "guidance", "identified-not-taught"]);

/** LOA-1's own unit codes, in the form's printed order. Imported, never transcribed. */
export const LOA_UNITS = Object.freeze(ALL_UNITS.map((unit) => unit.code));
const UNIT_ORDER = new Map(LOA_UNITS.map((code, index) => [code, index]));

/**
 * The shape every registered source shares. `sectionsRead` is the read layer; everything above it
 * is derived from it, so a unit cannot appear in `reliedOnByUnits` without a section that names it.
 */
const register = (record) => {
  const sections = record.sectionsRead.map((entry) =>
    Object.freeze({
      ...entry,
      ownedByTopics: entry.ownedByTopics ? Object.freeze(entry.ownedByTopics) : null,
      primaryUnits: Object.freeze(entry.primaryUnits),
      pointerUnits: Object.freeze(entry.pointerUnits),
    }),
  );
  const order = (codes) => Object.freeze([...new Set(codes)].sort((a, b) => UNIT_ORDER.get(a) - UNIT_ORDER.get(b)));
  const primary = order(sections.flatMap((s) => s.primaryUnits));
  const pointerOnly = order(sections.flatMap((s) => s.pointerUnits).filter((code) => !primary.includes(code)));
  return Object.freeze({
    ...record,
    tier: record.tier ?? "controlling",
    citedInTopicFrontMatter: Object.freeze(record.citedInTopicFrontMatter ?? []),
    reliedOnByArtifacts: Object.freeze(record.reliedOnByArtifacts ?? []),
    identifiedByUnits: Object.freeze(record.identifiedByUnits ?? []),
    primaryUnits: primary,
    pointerUnits: pointerOnly,
    reliedOnByUnits: order([...primary, ...pointerOnly]),
    sectionsRead: Object.freeze(sections),
  });
};

/** A Texas code chapter, retrieved from the Texas Legislative Council's static resource layer. */
const chapter = (record) =>
  register({
    ...record,
    id: `${record.code.toLowerCase()}-${record.chapter}`,
    citation: `Tex. ${record.codeName} ch. ${record.chapter}`,
    publisher: "Texas Legislative Council",
    sourceLayer: "tcss.legis.texas.gov static resources",
    jurisdiction: "texas",
  });

/** A federal statute. Its `tierReason` states the scope the statute itself fixes. */
const federal = (record) =>
  register({
    ...record,
    id: record.citation.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    jurisdiction: "federal",
  });

/**
 * A 22 TAC section. Where config/texas/trec-rules-source-lock.mjs also holds the section, the lock
 * is the other authority for its hash and this register must agree with it — asserted below.
 */
const trecRule = (record) =>
  register({
    ...record,
    id: `tac-${record.section.replace(/^22 TAC \u00a7/, "").replace(".", "-")}`,
    citation: record.section,
    title: record.heading,
    authority: "Texas Real Estate Commission",
    publisher: TREC_RULES_SOURCE.authority,
    sourceLayer: TREC_RULES_SOURCE.title,
    codifiedTextStatus: TREC_RULES_SOURCE.codifiedTextStatus,
    jurisdiction: "texas",
  });

/** The instrument a rule adopts by reference. Held and identified; no taught proposition rests on it. */
const adoptedForm = (record) =>
  register({ ...record, jurisdiction: "texas", authority: "Texas Real Estate Commission", publisher: "Texas Real Estate Commission" });

/** Regulator-published explanatory material. Never a substitute for the rule it explains. */
const guidance = (record) => {
  const manifest = REGULATORY_SOURCES.find((entry) => entry.id === record.manifestSourceId);
  if (!manifest) throw new Error(`law-of-agency-statute-sources: manifest source '${record.manifestSourceId}' not found in regulatory-manifest SOURCES`);
  return register({
    ...record,
    id: manifest.id,
    citation: `TREC, "${manifest.title}"`,
    title: manifest.title,
    authority: manifest.authority,
    publisher: manifest.authority,
    manifestPrecedence: manifest.precedence,
    materialClaimIds: Object.freeze(manifest.materialClaims.map((claim) => claim.id)),
    jurisdiction: "texas",
    tier: "guidance",
  });
};

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * TEXAS CODE CHAPTERS
 * ──────────────────────────────────────────────────────────────────────────────────────────────── */

const OC_1101 = chapter({
  code: "OC",
  codeName: "Occupations Code",
  chapter: "1101",
  title: "Real Estate Brokers and Sales Agents (The Real Estate License Act)",
  url: "https://tcss.legis.texas.gov/resources/OC/htm/OC.1101.htm",
  localCopy: "texas/trec-sources/statutes/OC.1101.htm",
  sha256: "8c40aa399cf717901540150ae6acaf3d847305f7fefcf7dd7ec4c3068a418858", bytes: 308708, retrievedOn: "2026-08-27",
  tier: "controlling",
  tierReason:
    "The statute the whole course is about. Sixty-five of its sections are cited across all twelve modules and every one of the 57 units draws on it directly or through a rule adopted under it. The held copy carries §§ 1101.558, 1101.562 and 1101.563 as amended and added by the 89th Legislature effective 2026-01-01, which is what makes the 2026 buyer-representation material sourceable at all.",
  citedInTopicFrontMatter: ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T09", "T10", "T11", "T12"],
  sectionsRead: [
    Object.freeze({ section: "1101.001", ownedByTopics: ["T01"], primaryUnits: ["T01U1", "T01U4"], pointerUnits: [], note: "Short title - the chapter may be cited as The Real Estate License Act; the source of the name TRELA used throughout the course." }),
    Object.freeze({ section: "1101.002", ownedByTopics: ["T01"], primaryUnits: ["T01U1", "T01U2", "T01U3", "T01U4"], pointerUnits: ["T02U1", "T02U3", "T02U5", "T04U1", "T04U4", "T04U5", "T05U1", "T06U1", "T06U2", "T06U3", "T07U1", "T09U1", "T09U3", "T09U4", "T09U6", "T12U1"], note: "Definitions. (1)(A) the acts that make a person a broker when done for another for a commission or other valuable consideration or with the expectation of one, and (1)(B) the persons treated as brokers; (3) 'Commission' means TREC; (4) 'license holder' means a broker or sales agent; (5) 'real estate' means an interest in real property, including a leasehold, other than an interest given as security; (6) 'residential rental locator'; (7) 'sales agent' means a person sponsored by a licensed broker. The vocabulary the whole course runs on." }),
    Object.freeze({ section: "1101.003", ownedByTopics: ["T01"], primaryUnits: ["T01U2"], pointerUnits: [], note: "Qualifying real estate courses - the statutory subject list that includes agency law, the Commission's power to prescribe content, and the elapsed-time rule for reporting completion. Read for the course's own front matter; no unit teaches a course-approval requirement." }),
    Object.freeze({ section: "1101.004", ownedByTopics: ["T01"], primaryUnits: ["T01U1"], pointerUnits: ["T05U1"], note: "Real estate brokerage - a person is engaged in brokerage by performing a § 1101.002(1) act for another with the expectation of receiving valuable consideration, as part of or as an entire transaction; (b) construction, investment participation and secured obligations do not by themselves make a person a broker." }),
    Object.freeze({ section: "1101.005", ownedByTopics: ["T01"], primaryUnits: ["T01U1"], pointerUnits: ["T02U3", "T07U2", "T09U3"], note: "Applicability - the enumerated persons and transactions the chapter does not reach, including attorneys, attorneys-in-fact, public officials on official duty, licensed auctioneers calling the sale, court-ordered and will or trust transactions, on-site apartment managers, and an owner or the owner's employee leasing the owner's own real estate. Used to mark the outer edge of the licensing requirement, not to state an agency duty." }),
    Object.freeze({ section: "1101.053", ownedByTopics: null, primaryUnits: ["T10U4"], pointerUnits: [], note: "Membership and employee restrictions - (a) defines a \"Texas trade association\" as a cooperative and voluntarily joined statewide association of business or professional competitors designed to assist its members and its industry in dealing with mutual problems and promoting their common interest; (b) a person may not be a commission member, or a commission employee in a bona fide executive, administrative or professional capacity, if the person is an officer, employee or paid consultant of a Texas trade association in the real estate industry, or if the person's spouse is an officer, manager or paid consultant of one; (c) the lobbyist disqualification. Read in T10U4 for the statute's own separation of a private professional association from the regulator - the reason a trade association's code of ethics is not the Commission's." }),
    Object.freeze({ section: "1101.151", ownedByTopics: null, primaryUnits: ["T01U4"], pointerUnits: [], note: "General powers and duties - (a)(1) the Commission shall administer this chapter and ch. 1102; (b)(1) the Commission MAY ADOPT AND ENFORCE RULES NECESSARY TO ADMINISTER the chapters, which is the delegation every 22 TAC rule registered below rests on; and (b)(2) the power to establish standards of conduct and ethics for license holders." }),
    Object.freeze({ section: "1101.155", ownedByTopics: null, primaryUnits: ["T04U1", "T04U5", "T05U1", "T10U5", "T12U1", "T12U2"], pointerUnits: [], note: "Rules relating to contract forms - the Commission may require license holders to use forms prepared by the Broker-Lawyer Committee; the owner-prepared and attorney-prepared form protections; and the requirement that an adopted listing form state that commissions are negotiable. Read alongside 22 TAC § 537.11." }),
    Object.freeze({ section: "1101.202", ownedByTopics: null, primaryUnits: ["T08U1", "T08U2"], pointerUnits: [], note: "Complaints - (a) the Commission by rule shall prescribe a notice containing the Commission's name, mailing address and telephone number for the purpose of directing a complaint to it, and establish the methods by which a regulated person provides that notice to consumers and service recipients; (b) the Commission provides the complainant and the license holder with an explanation of the available remedies and information about other agencies with whom a complaint may be filed. The statutory hook that 22 TAC § 531.18 executes." }),
    Object.freeze({ section: "1101.204", ownedByTopics: null, primaryUnits: ["T10U3", "T10U4", "T10U5", "T12U3", "T12U5"], pointerUnits: [], note: "Complaint investigation and disposition - who may file, the reasonable-cause requirement, the limitations period on complaints, the bar on investigating an anonymous complaint, and the risk-based prioritisation criteria that 22 TAC § 535.141(d) implements." }),
    Object.freeze({ section: "1101.351", ownedByTopics: ["T01", "T09"], primaryUnits: ["T01U3", "T01U4", "T09U3", "T09U4", "T09U5", "T09U6"], pointerUnits: ["T02U2", "T02U5", "T06U3", "T07U1", "T07U2", "T07U3"], note: "License required - (a) a person may not act as or represent being a broker or sales agent without a licence; (a-1) a business entity may not act as a broker unlicensed; (b) no acting before issuance; (c) a sales agent may not engage in brokerage unless sponsored by and acting for a licensed broker. T01 owns it as the licensing rule; T09 owns it as the structural fact that a sales agent acts only for the sponsoring broker." }),
    Object.freeze({ section: "1101.355", ownedByTopics: null, primaryUnits: ["T09U5", "T09U6"], pointerUnits: [], note: "Additional eligibility for business entities, and (d) the narrow registration alternative under which a business entity that performs no other act of a broker may receive compensation on a license holder's behalf. Read in T09 for the compensation-entity rule that 22 TAC §§ 535.5(g) and 535.35 build on." }),
    Object.freeze({ section: "1101.366", ownedByTopics: null, primaryUnits: ["T07U2"], pointerUnits: [], note: "Inactive licence: broker - (a) the three conditions on which the Commission may place a broker's licence on inactive status; (c) the broker must terminate the association with each sponsored sales agent by written notice before the 30th day preceding the application; (d) a broker on inactive status may not perform any activity regulated under the chapter but must pay renewal fees. Read in T07U2 as one of the ways a license holder's authority to act ends without the agency agreement itself being terminated." }),
    Object.freeze({ section: "1101.367", ownedByTopics: ["T07"], primaryUnits: ["T07U2"], pointerUnits: ["T01U4", "T09U1", "T09U6"], note: "Inactive licence: sales agent - on termination of the sales agent's relationship with the sponsoring broker the terminating party must immediately give written notice to the other party and to the Commission, and the sales agent goes inactive; return to active status requires a broker to assume sponsorship. The statutory hinge of T07's termination topic." }),
    Object.freeze({ section: "1101.454", ownedByTopics: null, primaryUnits: ["T07U2"], pointerUnits: [], note: "Sales agent licence renewal and the first-renewal education requirement. Read in T07U2 only to distinguish licence expiry from termination of an agency; no agency proposition is taken from it." }),
    Object.freeze({ section: "1101.455", ownedByTopics: null, primaryUnits: ["T07U2"], pointerUnits: [], note: "Continuing education requirements. Read in T07U2 for the same distinction as § 1101.454; nothing about agency is taken from it." }),
    Object.freeze({ section: "1101.551", ownedByTopics: null, primaryUnits: ["T01U3", "T01U4", "T02U3", "T03U3", "T03U4", "T03U6", "T04U4", "T06U1", "T06U5"], pointerUnits: [], note: "Definitions for the agency subchapter - (1) \"Intermediary\" means a broker who is employed to negotiate a transaction between the parties to a transaction and for that purpose MAY ACT as an agent of the parties; (2) \"Party\" means a prospective buyer, seller, landlord or tenant, or an authorized representative of one including a trustee, guardian, executor, administrator, receiver or attorney-in-fact, and the term DOES NOT INCLUDE a license holder who represents a party. Those are the only two definitions the section contains: the word \"subagent\" appears nowhere in the held chapter, which is why T05U3 says so and teaches no statutory definition of it." }),
    Object.freeze({ section: "1101.552", ownedByTopics: ["T12"], primaryUnits: ["T12U5"], pointerUnits: ["T01U3"], note: "Fixed office required; change of address - a resident broker shall maintain a fixed office in this state, and the address is designated on the licence. Read in T12 as a broker-operations requirement, with 22 TAC § 535.21 for contact information." }),
    Object.freeze({ section: "1101.553", ownedByTopics: null, primaryUnits: ["T01U3", "T01U4"], pointerUnits: [], note: "Display of licence - a residential rental locator shall prominently display, accessibly to clients and prospective clients, the locator's licence, a statement that the locator is licensed by the Commission, and the notice required by § 1101.202(a). Read in T01 to mark the locator as a licensed category with its own notice duty." }),
    Object.freeze({ section: "1101.555", ownedByTopics: ["T12"], primaryUnits: ["T12U2", "T12U3", "T12U5"], pointerUnits: ["T03U1", "T03U3", "T03U4", "T03U6", "T04U5", "T05U6", "T09U6"], note: "Notice to buyer regarding abstract or title policy - when an offer to purchase real estate in this state is signed, a license holder shall advise each buyer in writing to have the abstract examined by an attorney or to obtain a title insurance policy. A duty owed to a buyer whether or not the buyer is the license holder's client, which is why T03 and T05 cite it as well." }),
    Object.freeze({ section: "1101.556", ownedByTopics: ["T03"], primaryUnits: ["T03U4", "T03U6"], pointerUnits: ["T01U4", "T02U4", "T05U4", "T07U3", "T12U1"], note: "Disclosure of certain information relating to occupants - notwithstanding other law, a license holder is not required to inquire about, disclose or release information relating to whether (1) a previous or current occupant had, may have had, has or may have AIDS, an HIV-related illness or an HIV infection as defined by the Centers for Disease Control and Prevention, or (2) a death occurred on a property by natural causes, suicide or accident unrelated to the condition of the property. Those two limbs, with § 1101.802, are the whole of what this course states about stigmatised properties - which is why T03U6 says no held source addresses a homicide." }),
    Object.freeze({ section: "1101.557", ownedByTopics: ["T02"], primaryUnits: ["T02U1", "T02U2", "T02U3", "T02U4", "T02U5"], pointerUnits: ["T01U3", "T01U4", "T03U3", "T04U1", "T04U2", "T04U4", "T04U5", "T05U1", "T05U2", "T05U3", "T05U4", "T05U6", "T06U1", "T06U3", "T06U4", "T06U5", "T07U1", "T07U2", "T07U3", "T09U3", "T10U5"], note: "Acting as agent; regulation of certain transactions - (a) a broker who represents a party in a real estate transaction, or who lists real estate for sale under an exclusive agreement for a party, IS THAT PARTY'S AGENT; (b) that broker may not instruct another broker to violate § 1101.652(b)(22), must inform the party of material information related to the transaction including the receipt of an offer, and shall at a minimum answer the party's questions and present any offer to or from the party; (c) the three interpretive rules, covering a license holder with power to bind a party, an inquiry to a residential rental locator about an employer's contract terms, and the sole delivery of an offer with the party's broker's consent. The statutory statement of the agency relationship itself, taught in full in T02 and applied everywhere." }),
    Object.freeze({ section: "1101.558", ownedByTopics: ["T02"], primaryUnits: ["T02U5"], pointerUnits: ["T01U3", "T01U4", "T03U1", "T03U3", "T03U4", "T03U6", "T04U5", "T05U3", "T05U6", "T06U1", "T06U2", "T06U3", "T06U4", "T06U5", "T07U1", "T08U1", "T08U2", "T10U3", "T12U1", "T12U2", "T12U5"], note: "Representation disclosure - (a), (d) and (e) repealed effective 2016-01-01; (b) a license holder who represents a party in a proposed transaction shall disclose that representation, ORALLY OR IN WRITING, at the time of first contact with another party to the transaction or with another license holder who represents another party; (b-1) at the first substantive communication with a party about specific real property the license holder shall provide WRITTEN NOTICE IN AT LEAST A 10-POINT FONT meeting four content requirements - the ways a broker can represent a party including as an intermediary, the basic duties owed to a represented party, the basic obligations owed to a party the broker does not represent, and the name, license number and contact information for the license holder and the license holder's supervisor and broker; (b-2) the Commission by rule prescribes the text of the (b-1)(1) and (2) content and the delivery methods; (c) three situations in which the (b-1) notice is not required - a residential lease of less than one year where no sale is contemplated, meeting a party the license holder knows is represented by another license holder, and a communication at a property held open for any prospective buyer or tenant that concerns that property. Taught in full in T02U5, the form's own IABS unit." }),
    Object.freeze({ section: "1101.559", ownedByTopics: ["T06"], primaryUnits: ["T06U1", "T06U2", "T06U3", "T06U4", "T06U5"], pointerUnits: ["T01U3", "T01U4", "T02U3", "T02U5", "T04U1", "T04U3", "T04U5", "T05U2", "T05U4", "T05U5", "T05U6", "T07U1", "T08U2", "T12U2", "T12U3"], note: "Broker acting as intermediary - (a) a broker may act as an intermediary only if the broker obtains WRITTEN CONSENT from each party and that written consent states the source of any expected compensation; (b) a written listing agreement or a written buyer or tenant representation agreement authorising the broker to act as an intermediary is sufficient to establish a party's written consent IF it specifies in conspicuous bold or underlined print the conduct prohibited by § 1101.651(d); (c) an intermediary shall act fairly and impartially, and appointing associated license holders under § 1101.560 to communicate with, carry out the instructions of and provide opinions and advice to the parties to whom they are appointed IS a fair and impartial act. The core of the intermediary machinery, taught in full only in T06." }),
    Object.freeze({ section: "1101.560", ownedByTopics: ["T06"], primaryUnits: ["T06U1", "T06U2", "T06U3", "T06U4", "T06U5"], pointerUnits: ["T01U3", "T02U3", "T02U5", "T05U2", "T07U3", "T08U2"], note: "Associated license holder acting as intermediary - (a) a broker who has complied with § 1101.559's written-consent requirements may appoint one associated license holder to communicate with and carry out the instructions of one party and another to do the same for any other party; (b) an appointment may be made only if the parties' written consent authorises it AND the broker gives written notice of the appointment to all parties involved; (c) an appointed license holder MAY provide opinions and advice during negotiations to the party to whom that license holder is appointed. T06 teaches it; every other topic cites it." }),
    Object.freeze({ section: "1101.561", ownedByTopics: ["T06"], primaryUnits: ["T06U1", "T06U2", "T06U4", "T06U5"], pointerUnits: ["T01U3", "T02U3", "T02U5", "T04U1", "T04U3", "T05U2", "T05U6", "T12U2"], note: "Duties of intermediary prevail - (a) the duties of a license holder acting as an intermediary under this subchapter SUPERSEDE the duties established under any other law, including common law; (b) a broker MUST agree to act as an intermediary if the broker agrees to represent both a buyer or tenant and a seller or landlord in the same transaction. The provision that answers what happens to the fiduciary duties when a broker ends up on both sides." }),
    Object.freeze({ section: "1101.562", ownedByTopics: ["T05"], primaryUnits: ["T05U1", "T05U2", "T05U3", "T05U4", "T05U6"], pointerUnits: ["T01U3", "T01U4", "T02U1", "T02U3", "T02U5", "T03U1", "T03U3", "T04U4", "T06U1", "T06U3", "T06U5", "T07U1", "T07U3", "T12U2", "T12U5"], note: "Real property showings without representation, added effective 2026-01-01 - a broker may show property to a party without representing the party only if the broker has not agreed to represent that party, is not otherwise acting as that party's agent at the time of the showing, gives no opinions or advice on the property or on real estate transactions generally, and performs no other act of brokerage for the party; the broker must first give the § 1101.558(b) disclosure or the § 1101.558(b-1) written notice as applicable; and (c) the broker may still provide information about the size, price and terms of the property. Taught in full in T05." }),
    Object.freeze({ section: "1101.563", ownedByTopics: ["T05"], primaryUnits: ["T05U1", "T05U2", "T05U3", "T05U5", "T05U6"], pointerUnits: ["T01U2", "T01U3", "T01U4", "T02U1", "T02U5", "T03U3", "T04U1", "T04U4", "T06U1", "T06U4", "T06U5", "T07U1", "T07U3", "T09U3", "T09U6", "T10U5", "T12U2", "T12U3", "T12U5"], note: "Written agreement required, added effective 2026-01-01 - (a) 'residential real property' means a single-family house, a duplex, triplex or quadraplex, or a condominium or cooperative unit; (b) a license holder performing an act of brokerage for a prospective buyer of residential real property must enter a written agreement with that buyer before showing residential property or, if none will be shown, before presenting an offer on the buyer's behalf; (c) the required contents, including the services to be provided, the termination date, whether the agreement is exclusive, whether the license holder represents the buyer, the amount or rate of compensation and how it is determined, and the conspicuous statement that broker compensation is not set by law and is fully negotiable; and the limits on a showing-only agreement under § 1101.562. Taught in full in T05." }),
    Object.freeze({ section: "1101.601", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: ["T01U2", "T04U3", "T12U5"], note: "Real estate recovery trust account - (a) the Commission shall maintain the account to reimburse aggrieved persons who suffer actual damages caused by an act described by § 1101.602 committed by a license holder, a certificate holder, or a person who holds neither and is an employee or agent of one. The head of the recovery subchapter T11 teaches as the consumer's remedy of last resort." }),
    Object.freeze({ section: "1101.602", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: ["T04U3"], note: "Entitlement to reimbursement - an aggrieved person is entitled to reimbursement if the license holder engaged in conduct described by the section. Read in T11 with § 1101.607." }),
    Object.freeze({ section: "1101.603", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: [], note: "Payments into the trust account, including the repeal history of two of its subsections. Read in T11; nothing is stated from the repealed text." }),
    Object.freeze({ section: "1101.605", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: ["T01U2"], note: "Deadline for action; notice to the Commission - (a) an action for a judgment that may result in an order for payment from the trust account may not be brought after the SECOND ANNIVERSARY of the date the cause of action accrues; (b) the parties must notify the Commission in writing before entry of an agreed judgment and deliver copies of the pleadings." }),
    Object.freeze({ section: "1101.606", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: ["T07U2"], note: "Claim for payment from the trust account - the requirement of a court judgment against a license holder and the procedure for applying for payment. Read in T07U2 as well, because a claim on the account can end a licence." }),
    Object.freeze({ section: "1101.607", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: [], note: "Issues at hearing - what the aggrieved person must show, including that the judgment is based on facts allowing recovery under the subchapter." }),
    Object.freeze({ section: "1101.610", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: ["T01U2"], note: "Payment limits and attorney's fees - (a) payments from the trust account for claims arising out of a single transaction, including attorney's fees, interest and court costs, may not exceed $125,000 in total regardless of the number of claimants; (b) payments on judgments against a single license or certificate holder may not exceed $250,000 in total until that holder has reimbursed the account in full; (c) proportionate reduction where claims exceed the limits." }),
    Object.freeze({ section: "1101.612", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: [], note: "Subrogation - the Commission is subrogated to the judgment creditor's rights to the extent of an amount paid from the trust account." }),
    Object.freeze({ section: "1101.613", ownedByTopics: ["T11"], primaryUnits: [], pointerUnits: ["T01U2"], note: "Effect on disciplinary proceedings - the subchapter does not limit the Commission's authority to take disciplinary action. Read in T01U2 for the point that reimbursement and discipline are separate tracks." }),
    Object.freeze({ section: "1101.614", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: [], note: "Waiver of rights - an aggrieved person who does not comply with the subchapter waives the person's rights under it." }),
    Object.freeze({ section: "1101.615", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: [], note: "Notice to consumers and service recipients - the Commission by rule prescribes a notice about the availability of payment from the trust account. Read in T11 as the statutory hook for the consumer notice." }),
    Object.freeze({ section: "1101.651", ownedByTopics: ["T06", "T09"], primaryUnits: ["T06U1", "T06U2", "T06U3", "T06U4", "T06U5", "T09U1", "T09U3", "T09U4", "T09U6"], pointerUnits: ["T01U3", "T02U1", "T02U2", "T02U3", "T02U4", "T02U5", "T03U2", "T03U3", "T03U4", "T03U6", "T04U1", "T04U3", "T04U5", "T05U2", "T05U4", "T05U5", "T05U6", "T07U2", "T07U3", "T10U3", "T10U5", "T12U1", "T12U4", "T12U5"], note: "Certain practices prohibited - (a) a licensed broker may not pay a commission to or otherwise compensate a person directly or indirectly for performing an act of a broker unless the person is a license holder or a broker licensed in another state who conducts none of the negotiations in Texas; (b) a sales agent may not accept compensation for a real estate transaction from a person other than the broker sponsoring the sales agent, or who was sponsoring the sales agent when the compensation was earned; (c) a sales agent may not pay a commission to a person except through the sponsoring broker; (d) THE FIVE INTERMEDIARY PROHIBITIONS binding a broker and any license holder appointed under § 1101.560 - not disclosing that the seller or landlord will take less than asking, not disclosing that the buyer or tenant will pay more than the written offer, not disclosing confidential information or information a party has instructed in writing not to disclose (subject to three exceptions, one of which is information that materially relates to the condition of the property), not treating a party dishonestly, and not violating the chapter. T09 owns (a)-(c) as the compensation rule; T06 owns (d) as part of the intermediary machinery." }),
    Object.freeze({ section: "1101.652", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U2", "T10U3", "T10U4", "T10U5"], pointerUnits: ["T01U2", "T01U3", "T01U4", "T02U1", "T02U2", "T02U3", "T02U4", "T02U5", "T03U1", "T03U2", "T03U3", "T03U4", "T03U5", "T03U6", "T04U1", "T04U2", "T04U3", "T04U4", "T04U5", "T05U1", "T05U2", "T05U3", "T05U4", "T05U5", "T05U6", "T06U1", "T06U2", "T06U5", "T07U1", "T07U2", "T07U3", "T08U1", "T09U2", "T09U3", "T09U4", "T09U6", "T11U1", "T11U2", "T11U3", "T11U5", "T12U1", "T12U2", "T12U3", "T12U4", "T12U5"], note: "Grounds for suspension or revocation - the three lists, subsections (a), (a-1) and (b). Every discipline hook the course names lives here, including (a)(1) a felony or fraud conviction; (a-1)(1) misrepresentation, dishonesty or fraud when selling, buying, trading or leasing real property in the name of the license holder, the license holder's spouse or a person related within the first degree by consanguinity - the subsection 22 TAC § 535.144 extends and executes; (a-1)(2) failing to produce records on request; (a-1)(3) failing to use a contract form required by the Commission under § 1101.155; and in subsection (b), (b)(2) making a material misrepresentation or failing to disclose a latent structural defect or other material defect, (b)(3) making a false promise, (b)(5) failing within a reasonable time to properly account for or remit money, (b)(22) the bar on dealing behind another broker, (b)(23) publishing a misleading advertisement, (b)(32) discrimination including steering, (b)(33) disregarding or violating the chapter, and (b)(34) failing to enter into a written agreement with a prospective buyer as required by § 1101.563, which is the last subdivision of the subsection (b) list. Taught subdivision by subdivision only in T10; every other topic cites the subdivision by number and states in a clause what it prohibits." }),
    Object.freeze({ section: "1101.654", ownedByTopics: ["T10"], primaryUnits: ["T10U3", "T10U5"], pointerUnits: ["T12U5"], note: "Suspension or revocation for the unauthorized practice of law - the Commission shall suspend or revoke the licence of a license holder who is not a licensed attorney and who drafts an instrument, other than a form described by § 1101.155, that transfers or otherwise affects an interest in real property. The statutory partner of 22 TAC § 537.11." }),
    Object.freeze({ section: "1101.655", ownedByTopics: ["T10"], primaryUnits: [], pointerUnits: ["T11U5"], note: "Revocation of a licence for a claim on the recovery trust account. Read in T11U5 as the consequence that follows a payment from the account." }),
    Object.freeze({ section: "1101.656", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U3", "T10U4", "T10U5"], pointerUnits: [], note: "Additional disciplinary authority - the Commission may suspend or revoke a licence, place a license holder on probation, or reprimand a license holder, in addition to any other authority under the chapter." }),
    Object.freeze({ section: "1101.657", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U4", "T10U5"], pointerUnits: [], note: "Hearing - a person whose licence the Commission proposes to deny, suspend or revoke is entitled to a hearing conducted as provided by the section. Read in T10 for the procedural half of the discipline scheme." }),
    Object.freeze({ section: "1101.658", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U4", "T10U5"], pointerUnits: [], note: "Appeal - a person aggrieved by a ruling, order or decision is entitled to appeal to a district court in the county where the administrative hearing was held." }),
    Object.freeze({ section: "1101.659", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U3"], pointerUnits: [], note: "Refund - the Commission may order a person it regulates to pay a refund to a consumer as provided in an agreement resulting from an informal settlement conference, and the refund may not exceed the amount the consumer paid." }),
    Object.freeze({ section: "1101.701", ownedByTopics: ["T10"], primaryUnits: ["T10U5"], pointerUnits: ["T01U4"], note: "Imposition of an administrative penalty on a person who violates the chapter or a rule adopted or order issued under it. The statutory authority the penalty schedule in 22 TAC § 535.191 is built on." }),
    Object.freeze({ section: "1101.702", ownedByTopics: ["T10"], primaryUnits: ["T10U3", "T10U4", "T10U5"], pointerUnits: ["T01U2", "T06U5", "T12U5"], note: "Amount of penalty - (a) an administrative penalty may not exceed $5,000 for each violation, and each day a violation continues or occurs may be considered a separate violation; (b) the five criteria THE EXECUTIVE DIRECTOR shall consider in setting the amount, including the seriousness of the violation, the history of previous violations, the amount necessary to deter, efforts to correct, and any other matter that justice may require; (c) the Commission by rule shall adopt a schedule of administrative penalties based on those criteria - which is the statutory hook 22 TAC § 535.191(b) answers." }),
    Object.freeze({ section: "1101.704", ownedByTopics: ["T10"], primaryUnits: ["T10U5"], pointerUnits: [], note: "Penalty to be paid or hearing requested - the deadline after receiving notice for the person to pay or to request a hearing." }),
    Object.freeze({ section: "1101.705", ownedByTopics: ["T10"], primaryUnits: ["T10U3"], pointerUnits: [], note: "Hearing and decision on an administrative penalty. Read in T10U3; no separate proposition is taught from it." }),
    Object.freeze({ section: "1101.707", ownedByTopics: ["T10"], primaryUnits: ["T10U5"], pointerUnits: [], note: "Options following decision - pay or appeal, and the deadline after the Commission's order becomes final." }),
    Object.freeze({ section: "1101.751", ownedByTopics: null, primaryUnits: ["T01U1", "T12U5"], pointerUnits: [], note: "Injunctive action brought by the Commission - the Commission may bring an action in its own name to enjoin a violation. Read in T01 and T12 as one of the enforcement routes that does not depend on a disciplinary proceeding." }),
    Object.freeze({ section: "1101.753", ownedByTopics: null, primaryUnits: ["T01U2", "T01U4"], pointerUnits: [], note: "Civil penalty for certain violations by a broker, sales agent or certificate holder, in addition to injunctive relief. Read in T01." }),
    Object.freeze({ section: "1101.754", ownedByTopics: null, primaryUnits: ["T01U2", "T01U4"], pointerUnits: [], note: "Private cause of action for certain violations - a person who receives a commission or other consideration as a result of acting as a broker or sales agent without a licence is liable to an aggrieved person. Read in T01 as the private remedy for unlicensed activity." }),
    Object.freeze({ section: "1101.756", ownedByTopics: null, primaryUnits: ["T01U4", "T12U5"], pointerUnits: [], note: "General criminal penalty - a person commits an offence by wilfully violating or failing to comply with the chapter or a Commission order. Read in T01 and T12." }),
    Object.freeze({ section: "1101.758", ownedByTopics: null, primaryUnits: ["T01U4"], pointerUnits: [], note: "Criminal penalty for acting as a broker or sales agent without a licence. Read in T01." }),
    Object.freeze({ section: "1101.759", ownedByTopics: null, primaryUnits: ["T01U1", "T12U5"], pointerUnits: [], note: "Cease and desist order - the Commission may issue one if it appears a person is violating the chapter or a rule. Read in T01 and T12." }),
    Object.freeze({ section: "1101.801", ownedByTopics: null, primaryUnits: ["T01U2", "T02U2", "T03U1", "T03U6", "T06U5", "T10U1", "T10U4", "T10U5"], pointerUnits: [], note: "Effect of disciplinary action on liability - disciplinary action under § 1101.652 does not relieve a person from civil or criminal liability. The provision that keeps the licensing track and the liability track separate, which T10 and T11 both rely on." }),
    Object.freeze({ section: "1101.802", ownedByTopics: ["T03"], primaryUnits: ["T03U6"], pointerUnits: ["T01U4", "T02U2", "T02U4", "T10U1", "T10U5"], note: "Liability relating to HIV infection or AIDS - notwithstanding § 1101.801, a person is not civilly or criminally liable for failing to inquire about, make a disclosure of, or release information about whether an occupant had or may have had an HIV-related illness. Read with § 1101.556, which is the duty side of the same rule." }),
    Object.freeze({ section: "1101.803", ownedByTopics: ["T09"], primaryUnits: ["T09U1", "T09U3"], pointerUnits: ["T01U2", "T01U3", "T01U4", "T02U4", "T03U1", "T03U6", "T04U4", "T06U2", "T06U3", "T06U4", "T06U5", "T10U3", "T10U4", "T12U5"], note: "General liability of broker - a licensed broker is liable to the Commission, the public and the broker's clients for any conduct engaged in under the chapter by the broker or by a sales agent ASSOCIATED WITH OR ACTING FOR the broker. The statute behind the broker-responsibility rule in 22 TAC § 535.2, taught in full in T09." }),
    Object.freeze({ section: "1101.804", ownedByTopics: ["T03"], primaryUnits: [], pointerUnits: ["T04U3", "T10U4", "T10U5"], note: "Liability for providing certain information - a license holder or a nonprofit real estate board or association that provides information about real property sales prices or the terms of a sale, for the purpose of facilitating the listing, selling, leasing, financing or appraisal of real property, is not liable to another person for providing that information UNLESS disclosure of that information is specifically prohibited by statute. Read in T03, T04 and T10 for what a license holder may safely share about comparable sales." }),
    Object.freeze({ section: "1101.805", ownedByTopics: ["T03"], primaryUnits: ["T03U4", "T03U5", "T03U6"], pointerUnits: ["T01U2", "T01U3", "T01U4", "T02U2", "T02U3", "T02U5", "T04U4", "T04U5", "T11U1", "T11U4", "T11U5", "T12U5"], note: "Liability for misrepresentation or concealment - (a) \"party\" has the § 1101.551 meaning; (b) THIS SECTION PREVAILS OVER ANY OTHER LAW, INCLUDING COMMON LAW; (c) it does not diminish a broker's responsibility for the acts or omissions of a sales agent associated with or acting for the broker; (d) a party is not liable for a license holder's misrepresentation or concealment of a material fact unless the party knew of the falsity and failed to disclose that knowledge; (e) the mirror rule - a license holder is not liable for a party's misrepresentation or concealment unless the license holder knew of the falsity and failed to disclose that knowledge; (f) repealed by Acts 2025, 89th Leg., R.S., Ch. 1172 (S.B. 1968), Sec. 13(2), effective January 1, 2026. The statutory answer to who bears a misrepresentation, relied on in T03, T04, T11 and T12; the repealed subsection is not preserved in the held text and nothing is stated from it." }),
    Object.freeze({ section: "1101.806", ownedByTopics: ["T04"], primaryUnits: ["T04U1", "T04U5"], pointerUnits: ["T01U2", "T01U4", "T02U1", "T05U5", "T05U6", "T07U1", "T07U2", "T07U3", "T09U3", "T09U6", "T12U1", "T12U2", "T12U3", "T12U5"], note: "Liability for payment of compensation or commission - (a) the section does not apply to an agreement to share compensation among license holders and does not limit a cause of action among brokers for interference with business relationships; (b) a person may not maintain an action to collect compensation for an act as a broker or sales agent performed in this state unless the person alleges and proves licensure at the time the act was commenced, or that the person is an attorney licensed in any state; (c) a person may not maintain an action to recover a commission for the sale or purchase of real estate unless the promise or agreement on which the action is based, or a memorandum of it, is IN WRITING AND SIGNED by the party against whom the action is brought or by a person authorized by that party; (d) a license holder who fails to advise a buyer as § 1101.555 requires may not receive or recover any commission agreed to be paid on the sale. Taught in full in T04 and read with Business and Commerce Code § 26.01." }),
    Object.freeze({ section: "1101.2051", ownedByTopics: null, primaryUnits: ["T10U4"], pointerUnits: [], note: "Confidentiality of investigation material - an investigation file is confidential and not subject to disclosure, with the enumerated exceptions. Read in T10U4; nothing is taught about the exceptions." }),
  ],
});

const PR_5 = chapter({
  code: "PR",
  codeName: "Property Code",
  chapter: "5",
  title: "Conveyances",
  url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.5.htm",
  localCopy: "texas/trec-sources/statutes/PR.5.htm",
  sha256: "8d2de95ab891d16cb19dd73f4ac8f46c2cb349f49b7ed6f59d9e5a98c80ca9d7", bytes: 273766, retrievedOn: "2026-08-28",
  tier: "controlling",
  tierReason:
    "Section 5.008 is a unit of LOA-1 in its own words - T03U5 is titled 'Section 5.008 of the Texas Property Code (Seller's Disclosure)'. The chapter's other notice sections are read with it so the course can say what the seller's disclosure is and is not.",
  citedInTopicFrontMatter: ["T01", "T03"],
  sectionsRead: [
    Object.freeze({ section: "5.008", ownedByTopics: ["T03"], primaryUnits: ["T03U4", "T03U5", "T03U6"], pointerUnits: ["T04U5", "T11U2", "T12U1", "T12U3", "T12U5"], note: "Seller's disclosure of property condition - (a) a seller of residential real property comprising not more than one dwelling unit must give the purchaser a written notice as prescribed by the section, or one substantially similar containing at a minimum all of its items; (b) the section prints the notice itself; (d) it is completed to the best of the seller's belief and knowledge, and indicating that an item is unknown is compliance; (e) eleven transfers to which the section does not apply, including a court-ordered or foreclosure sale, a transfer by a fiduciary administering an estate, one between co-owners or spouses, and a new residence not previously occupied; (f) the notice shall be delivered on or before the effective date of an executory contract binding the purchaser, and if a contract is entered without it the purchaser MAY TERMINATE THE CONTRACT FOR ANY REASON WITHIN SEVEN DAYS after receiving the notice. Taught in full in T03U5, which is the form's own unit for it." }),
    Object.freeze({ section: "5.010", ownedByTopics: ["T03"], primaryUnits: ["T03U5"], pointerUnits: [], note: "Notice of additional tax liability on the transfer of an interest in vacant land - the bold-faced notice the contract must contain. One of the ch. 5 notices T03U5 sets beside § 5.008 to show that the seller's disclosure is one of several statutory notices, not the only one." }),
    Object.freeze({ section: "5.011", ownedByTopics: ["T03"], primaryUnits: ["T03U5"], pointerUnits: [], note: "Seller's disclosure regarding potential annexation - the written notice a seller of an interest in real property must give about a municipality's extraterritorial jurisdiction and possible annexation." }),
    Object.freeze({ section: "5.012", ownedByTopics: ["T03"], primaryUnits: ["T03U5", "T03U6"], pointerUnits: [], note: "Notice of obligations related to membership in a property owners' association - the notice a seller of residential real property subject to mandatory membership must give, and its statutory wording." }),
    Object.freeze({ section: "5.013", ownedByTopics: ["T03"], primaryUnits: ["T03U5"], pointerUnits: [], note: "Seller's disclosure of the location of conditions under the surface of unimproved real property to be used for residential purposes." }),
    Object.freeze({ section: "5.019", ownedByTopics: ["T03"], primaryUnits: ["T03U5", "T03U6"], pointerUnits: [], note: "Notice of water level fluctuations for property adjoining an impoundment of water. Read in T03U5 and T03U6 as part of the statutory-notice set; nothing is stated about reservoirs beyond the section's own terms." }),
  ],
});

const PR_301 = chapter({
  code: "PR",
  codeName: "Property Code",
  chapter: "301",
  title: "Texas Fair Housing Act",
  url: "https://tcss.legis.texas.gov/resources/PR/htm/PR.301.htm",
  localCopy: "texas/trec-sources/statutes/PR.301.htm",
  sha256: "925c6a1adcdf66c06b0088da4f7c714d6151cd3bafd436654cafc6c322151a3d", bytes: 71019, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "The Texas fair housing statute, taught in full in T10 and applied in T10U5. It supplies the prohibitions, the exemptions and their limits, the enforcement route through the Texas Workforce Commission and the § 301.114 referral that ties a fair-housing finding back to a real estate licence - none of which the federal Act supplies for Texas.",
  sectionsRead: [
    Object.freeze({ section: "301.001", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "Short title - the chapter may be cited as the Texas Fair Housing Act." }),
    Object.freeze({ section: "301.002", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "Purposes - to provide for fair housing practices in this state, to create a procedure for investigating and settling complaints of discriminatory housing practices, and to provide rights and remedies substantially equivalent to those under federal law. The 'substantially equivalent' purpose is why the course teaches the state and federal Acts side by side rather than as alternatives." }),
    Object.freeze({ section: "301.003", ownedByTopics: ["T10"], primaryUnits: ["T10U2", "T10U5"], pointerUnits: [], note: "Definitions, including 'aggrieved person', 'discriminatory housing practice', 'dwelling', 'familial status' and 'disability'. The vocabulary of the Texas Act." }),
    Object.freeze({ section: "301.004", ownedByTopics: ["T10"], primaryUnits: ["T10U5"], pointerUnits: [], note: "Familial status - when a discriminatory act is committed because of familial status, including pregnancy and being domiciled with an individual younger than 18 in the legal custody of a parent or another person with written permission." }),
    Object.freeze({ section: "301.0015", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "Texas Workforce Commission - the powers and duties exercised by the Commission on Human Rights under the chapter are transferred to the Texas Workforce Commission, and a reference in the chapter to the commission means that agency. Read so the course names the right enforcing agency." }),
    Object.freeze({ section: "301.021", ownedByTopics: ["T10"], primaryUnits: ["T10U2", "T10U3", "T10U5"], pointerUnits: [], note: "Sale or rental - a person may not refuse to sell or rent after the making of a bona fide offer, refuse to negotiate, or otherwise make unavailable or deny a dwelling to a person because of a protected characteristic; and the related prohibitions on discriminatory terms, conditions or privileges and on discriminatory representations that a dwelling is unavailable. The Texas counterpart of 42 U.S.C. § 3604." }),
    Object.freeze({ section: "301.022", ownedByTopics: ["T10"], primaryUnits: ["T10U5"], pointerUnits: [], note: "Publication - a person may not make, print or publish a notice, statement or advertisement about the sale or rental of a dwelling that indicates a preference, limitation or discrimination based on a protected characteristic." }),
    Object.freeze({ section: "301.025", ownedByTopics: ["T10"], primaryUnits: ["T10U2", "T10U5"], pointerUnits: [], note: "Disability - the prohibition on discrimination in the sale or rental of a dwelling because of the disability of the buyer or renter, a person residing in or intending to reside in the dwelling, or a person associated with the buyer or renter, together with the reasonable-modification and reasonable-accommodation provisions." }),
    Object.freeze({ section: "301.026", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "Residential real estate related transaction - a person whose business includes engaging in residential real estate related transactions may not discriminate in making such a transaction available or in its terms or conditions." }),
    Object.freeze({ section: "301.027", ownedByTopics: ["T10"], primaryUnits: ["T10U4", "T10U5"], pointerUnits: [], note: "Brokerage services - a person may not deny another access to, or membership or participation in, a multiple-listing service, real estate brokers' organization or other service, organization or facility relating to the business of selling or renting dwellings, or discriminate in the terms or conditions of that access, membership or participation. The Texas counterpart of 42 U.S.C. § 3606." }),
    Object.freeze({ section: "301.041", ownedByTopics: ["T10"], primaryUnits: ["T10U2", "T10U5"], pointerUnits: [], note: "Certain sales and rentals exempted - the owner-occupant and small-owner exemptions from §§ 301.021, 301.023, 301.024 and 301.025, with the conditions that limit them. Taught with the point the course makes twice: the exemption is unavailable where a license holder is engaged." }),
    Object.freeze({ section: "301.043", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "Housing for elderly exempted - the familial-status provisions do not apply to housing the commission determines is specifically designed and operated to assist elderly persons or that meets the section's other conditions." }),
    Object.freeze({ section: "301.044", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "Effect on other law - the chapter does not affect a reasonable local or state restriction on the maximum number of occupants or a restriction relating to health or safety, and does not affect a requirement of nondiscrimination in any other state or federal law." }),
    Object.freeze({ section: "301.045", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "IDENTIFIED, NOT HELD, NOT TAUGHT. Module 10 names a section numbered § 301.045 and states in the module text that it 'was not held for this course and is not taught here.' The held copy of ch. 301 does not contain a section with that number, which the mechanical claim audit records as the single IDENTIFIED_NOT_TAUGHT row in texas/tx-law-of-agency-30-v1/claim-audit.json. No proposition rests on it; the sentence is a disclosure, not a citation. Recorded here so the register does not silently drop the one section the course names and does not hold." }),
    Object.freeze({ section: "301.0045", ownedByTopics: ["T10"], primaryUnits: ["T10U5"], pointerUnits: [], note: "Racial discrimination based on hair texture or protective hairstyle - 'protective hairstyle' includes braids, locks and twists, and a provision of the chapter referring to race includes discrimination on that basis." }),
    Object.freeze({ section: "301.081", ownedByTopics: ["T10"], primaryUnits: ["T10U2", "T10U4", "T10U5"], pointerUnits: [], note: "Complaint - the commission investigates complaints of alleged discriminatory housing practices; a complaint must be in writing, under oath and in the prescribed form, and must be filed within the statutory period." }),
    Object.freeze({ section: "301.083", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "Investigation - the commission's duty to investigate, including where the federal government has referred a complaint or deferred jurisdiction. Read for the interaction between the federal and state enforcement routes." }),
    Object.freeze({ section: "301.112", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U2", "T10U5"], pointerUnits: [], note: "Administrative penalties - the amounts the commission may assess on finding a discriminatory housing practice, and how prior findings affect them." }),
    Object.freeze({ section: "301.114", ownedByTopics: ["T10"], primaryUnits: ["T10U5"], pointerUnits: [], note: "Licensed or regulated business - where a discriminatory housing practice occurs in the course of a business subject to licensing or regulation by a governmental agency, the commission notifies that agency and recommends appropriate disciplinary action. The provision that ties a fair-housing finding back to a real estate licence." }),
    Object.freeze({ section: "301.132", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "Pattern or practice case - on the commission's request the attorney general may file a civil action for appropriate relief where there is reasonable cause to believe a person is engaged in a pattern or practice of resistance to the rights granted by the chapter." }),
    Object.freeze({ section: "301.151", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U2", "T10U4", "T10U5"], pointerUnits: [], note: "Civil action - an aggrieved person may file a civil action in district court not later than the second year after the occurrence or termination of an alleged discriminatory housing practice, whether or not a complaint has been filed. The private remedy the course sets beside the administrative one." }),
    Object.freeze({ section: "301.171", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U5"], pointerUnits: [], note: "Intimidation or interference - a person commits an offence by using force or the threat of force to intimidate or interfere with a person exercising a right granted by the chapter. A criminal provision requiring force or its threat, which is why the course does not treat it as the counterpart of the civil federal interference provision." }),
  ],
});

const BC_17 = chapter({
  code: "BC",
  codeName: "Business and Commerce Code",
  chapter: "17",
  title: "Deceptive Trade Practices",
  url: "https://tcss.legis.texas.gov/resources/BC/htm/BC.17.htm",
  localCopy: "texas/trec-sources/statutes/BC.17.htm",
  sha256: "33fdf21e31dba579c3e95972f6c9fef82f1582f2b83a2d7d883d1b216cd54d1f", bytes: 193909, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "Topic 11 of LOA-1 is 'Deceptive Trade Practices and Consumer Protection Act'. Subchapter E is that Act. Every proposition T11 teaches about the laundry list, the remedies, the defences and the limitations period comes from the sections recorded below and from nowhere else.",
  citedInTopicFrontMatter: ["T11"],
  sectionsRead: [
    Object.freeze({ section: "17.41", ownedByTopics: ["T11"], primaryUnits: ["T11U2", "T11U5"], pointerUnits: [], note: "Short title - subchapter E may be cited as the Deceptive Trade Practices-Consumer Protection Act." }),
    Object.freeze({ section: "17.42", ownedByTopics: ["T11"], primaryUnits: ["T11U1", "T11U2", "T11U4", "T11U5"], pointerUnits: [], note: "Waivers: public policy - any waiver by a consumer of the subchapter's provisions is contrary to public policy and unenforceable and void, subject to the narrow conditions under which a waiver is valid, including that the consumer is not in a significantly disparate bargaining position and is represented by legal counsel. Central to T11's treatment of what a contract clause cannot do." }),
    Object.freeze({ section: "17.43", ownedByTopics: ["T11"], primaryUnits: ["T11U2"], pointerUnits: [], note: "Cumulative remedies - the subchapter's remedies are in addition to any other procedures or remedies provided by other law. The reason a DTPA claim does not displace a common-law or TRELA remedy." }),
    Object.freeze({ section: "17.44", ownedByTopics: ["T11"], primaryUnits: ["T11U1", "T11U2", "T11U5"], pointerUnits: [], note: "Construction and application - the subchapter is to be liberally construed and applied to promote its underlying purposes, which are to protect consumers against false, misleading and deceptive business practices and to provide efficient and economical procedures to secure that protection." }),
    Object.freeze({ section: "17.45", ownedByTopics: ["T11"], primaryUnits: ["T11U1", "T11U2", "T11U3", "T11U4", "T11U5"], pointerUnits: ["T03U4"], note: "Definitions - 'goods' includes real property purchased or leased for use; 'services'; 'consumer'; 'unconscionable action or course of action'; 'economic damages'; and 'knowingly' and 'intentionally'. The definitions that determine whether a real estate transaction is inside the Act at all." }),
    Object.freeze({ section: "17.46", ownedByTopics: ["T11"], primaryUnits: ["T11U1", "T11U2", "T11U3", "T11U4", "T11U5"], pointerUnits: ["T03U4", "T03U6", "T10U3"], note: "Deceptive trade practices unlawful - (a) the general prohibition on false, misleading or deceptive acts or practices in the conduct of any trade or commerce, and (b) the enumerated list of specific practices, including representing that goods or services have characteristics or benefits they do not have and failing to disclose information concerning goods or services which was known at the time of the transaction where the failure was intended to induce the consumer into a transaction the consumer would not have entered had the information been disclosed. The laundry list T11 teaches in full and T03 and T10 cite." }),
    Object.freeze({ section: "17.49", ownedByTopics: ["T11"], primaryUnits: ["T11U4", "T11U5"], pointerUnits: ["T03U4", "T03U6"], note: "Exemptions - the media exemption, the professional-services exemption for advice, judgment or opinion, and the large-transaction exemptions, together with the express carve-outs that keep certain conduct inside the Act." }),
    Object.freeze({ section: "17.50", ownedByTopics: ["T11"], primaryUnits: ["T11U1", "T11U2", "T11U3", "T11U4", "T11U5"], pointerUnits: ["T03U4", "T12U5"], note: "Relief for consumers - (a) the four grounds on which a consumer may maintain an action, each requiring that the conduct be a producing cause of economic damages or damages for mental anguish; (b) the relief available, including economic damages and, on a finding of knowing conduct, damages for mental anguish and additional damages; and the attorney's fees provision. The remedies engine of T11U3." }),
    Object.freeze({ section: "17.55", ownedByTopics: ["T11"], primaryUnits: ["T11U3"], pointerUnits: [], note: "Promotional material - the treatment of advertisements and promotional material where damages or civil penalties are assessed against a seller." }),
    Object.freeze({ section: "17.63", ownedByTopics: ["T11"], primaryUnits: ["T11U2"], pointerUnits: [], note: "Application - the subchapter applies only to acts or practices occurring after its effective date. Read; no proposition is taught from it beyond the fact of prospective application." }),
    Object.freeze({ section: "17.505", ownedByTopics: ["T11"], primaryUnits: ["T11U2", "T11U4"], pointerUnits: [], note: "Notice; inspection - the written notice a consumer must give as a prerequisite to filing suit for damages, its contents and its timing, and the defendant's right to request inspection. The procedural gate T11U4 teaches as a defence." }),
    Object.freeze({ section: "17.506", ownedByTopics: ["T11"], primaryUnits: ["T11U2", "T11U4", "T11U5"], pointerUnits: [], note: "Damages: defences - the defence available where the defendant proves it gave written information relied on in good faith and the information's use was the cause of the misleading act, and the settlement-offer defences. The core of T11U4." }),
    Object.freeze({ section: "17.555", ownedByTopics: ["T11"], primaryUnits: ["T11U3", "T11U5"], pointerUnits: [], note: "Indemnity - a person against whom an action has been brought may seek contribution or indemnity from one who under statute or common law may have liability." }),
    Object.freeze({ section: "17.565", ownedByTopics: ["T11"], primaryUnits: ["T11U1", "T11U4", "T11U5"], pointerUnits: ["T03U4"], note: "Limitation - all actions under the subchapter must be commenced within two years after the date on which the false, misleading or deceptive act or practice occurred or within two years after the consumer discovered or in the exercise of reasonable diligence should have discovered it, with the 180-day extension where the consumer was induced to delay. The DTPA limitations period the course keeps distinct from the four-year period in Civil Practice and Remedies Code § 16.004." }),
    Object.freeze({ section: "17.5051", ownedByTopics: ["T11"], primaryUnits: ["T11U3", "T11U5"], pointerUnits: [], note: "Mediation - a party's right to move to compel mediation of a dispute in which relief under the subchapter is sought, and the deadline for the motion." }),
    Object.freeze({ section: "17.5052", ownedByTopics: ["T11"], primaryUnits: ["T11U3"], pointerUnits: [], note: "Offers of settlement - the period in which a person who receives notice under § 17.505 may tender an offer of settlement, and the effect of the offer on recoverable damages and fees." }),
  ],
});

const BC_26 = chapter({
  code: "BC",
  codeName: "Business and Commerce Code",
  chapter: "26",
  title: "Statute of Frauds",
  url: "https://tcss.legis.texas.gov/resources/BC/htm/BC.26.htm",
  localCopy: "texas/trec-sources/statutes/BC.26.htm",
  sha256: "e2c23d1a446796b7083157d2940094e660e14ca660670665ff5a801a8bd1a708", bytes: 9473, retrievedOn: "2026-08-28",
  tier: "controlling",
  tierReason:
    "Section 26.01 is one of the two held sources for the writing requirement, read with Occupations Code § 1101.806. A course that teaches listing and representation agreements without the statute of frauds is teaching a practice, not a rule.",
  citedInTopicFrontMatter: ["T04", "T07"],
  sectionsRead: [
    Object.freeze({ section: "26.01", ownedByTopics: ["T04"], primaryUnits: ["T04U1", "T04U5"], pointerUnits: ["T02U1", "T05U5", "T07U1", "T07U3", "T12U1"], note: "Promise or agreement must be in writing - a promise or agreement described by subsection (b) is not enforceable unless it, or a memorandum of it, is in writing and signed by the person to be charged or by someone lawfully authorised to sign for that person; subsection (b) includes a contract for the sale of real estate and a lease of real estate for a term longer than one year. The statute of frauds, taught in T04 and cited by T02, T05, T07 and T12 alongside Occupations Code § 1101.806." }),
  ],
});

const CP_16 = chapter({
  code: "CP",
  codeName: "Civil Practice and Remedies Code",
  chapter: "16",
  title: "Limitations",
  url: "https://tcss.legis.texas.gov/resources/CP/htm/CP.16.htm",
  localCopy: "texas/trec-sources/statutes/CP.16.htm",
  sha256: "cfefbe20090b0e909f368e0d8a95a86fef9c80733921408d170070cc56dd8e78", bytes: 89021, retrievedOn: "2026-08-28",
  tier: "controlling",
  tierReason:
    "The four-year period in § 16.004 is the only held source for how long a fiduciary-duty or fraud claim survives, and the course keeps it expressly distinct from the DTPA's two-year period in Business and Commerce Code § 17.565. Both are stated as law, so both are controlling.",
  sectionsRead: [
    Object.freeze({ section: "16.004", ownedByTopics: null, primaryUnits: ["T03U4", "T07U2", "T07U3", "T11U1", "T11U5", "T12U3", "T12U5"], pointerUnits: [], note: "Four-year limitations period - a person must bring suit not later than four years after the day the cause of action accrues on the listed actions, which include specific performance of a contract for the conveyance of real property, debt, fraud, and breach of fiduciary duty. The period the course states for a fiduciary-duty or fraud claim, kept expressly distinct from the DTPA's two-year period." }),
    Object.freeze({ section: "16.051", ownedByTopics: null, primaryUnits: ["T11U4", "T11U5"], pointerUnits: [], note: "Residual limitations period - every action for which there is no express limitations period, except an action for the recovery of real property, must be brought not later than four years after the day the cause of action accrues. Read in T11 for actions the enumerated periods do not name." }),
  ],
});

const ES_101 = chapter({
  code: "ES",
  codeName: "Estates Code",
  chapter: "101",
  title: "Estate Assets on Death",
  url: "https://tcss.legis.texas.gov/resources/ES/htm/ES.101.htm",
  localCopy: "texas/trec-sources/statutes/ES.101.htm",
  sha256: "1d1417459c5fb129bc936e9f89e27db8cefd514bf3536fb1cf4b0231fafbc056", bytes: 9174, retrievedOn: "2026-08-28",
  tier: "controlling",
  tierReason:
    "Read for one narrow question T07 has to answer - what becomes of the property, and who may deal with it, when a principal dies. The three sections below are stated as law; no probate procedure is taken from the chapter and the module says so.",
  sectionsRead: [
    Object.freeze({ section: "101.001", ownedByTopics: null, primaryUnits: ["T07U2", "T07U3"], pointerUnits: [], note: "Passage of estate on decedent's death - subject to § 101.051, if a person dies leaving a lawful will, the estate devised by the will vests immediately in the devisees, and if a person dies intestate the estate vests immediately in the heirs at law. Read in T07 for what becomes of the property when a principal dies, and for nothing else." }),
    Object.freeze({ section: "101.003", ownedByTopics: null, primaryUnits: ["T07U2"], pointerUnits: [], note: "Possession of the estate by the personal representative - on issuance of letters testamentary or of administration the executor or administrator has the right to possession of the estate as it existed at the decedent's death. Read in T07U2 for who a license holder may deal with after a seller's death." }),
    Object.freeze({ section: "101.051", ownedByTopics: null, primaryUnits: ["T07U2"], pointerUnits: [], note: "Liability of the estate for debts in general - the estate vests subject to the payment of the decedent's debts except as exempted by law. Read in T07U2 with § 101.001; the course takes no probate procedure from Estates Code ch. 101 and says so." }),
  ],
});

const LA_21 = chapter({
  code: "LA",
  codeName: "Labor Code",
  chapter: "21",
  title: "Employment Discrimination",
  url: "https://tcss.legis.texas.gov/resources/LA/htm/LA.21.htm",
  localCopy: "texas/trec-sources/statutes/LA.21.htm",
  sha256: "c92d7ed636c5d88f55f4448134fd04da1f9f969ee20babb38d01c548ea5f15fc", bytes: 157702, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Topic 9 of LOA-1 has the scope note 'Employment law'. Chapter 21 is the Texas employment-discrimination statute and T09U2 teaches it as law. SCOPE, recorded because a register that implies a wider reliance than the statute supports is the error this course was corrected for: chapter 21 governs EMPLOYMENT. Nothing here is registered as a fair-housing or brokerage-conduct rule - that is Property Code ch. 301 and 42 U.S.C. §§ 3602-3606.",
  citedInTopicFrontMatter: ["T09"],
  sectionsRead: [
    Object.freeze({ section: "21.002", ownedByTopics: ["T09"], primaryUnits: ["T09U2", "T09U6"], pointerUnits: [], note: "Definitions for the Texas employment-discrimination chapter, including 'employer', 'employee', 'disability', 'political subdivision' and 'auxiliary aids and services'. The chapter's protected characteristics are stated in its operative sections rather than in this one. SCOPE: chapter 21 is an EMPLOYMENT statute. Nothing in this chapter is registered here as a fair-housing or brokerage-conduct rule; the fair-housing law of this course is Property Code ch. 301 and 42 U.S.C. §§ 3602-3606." }),
    Object.freeze({ section: "21.0021", ownedByTopics: ["T09"], primaryUnits: ["T09U2"], pointerUnits: [], note: "Construction of certain definitions - 'disability' is to be construed in favour of broad coverage to the maximum extent allowed under the corresponding federal provisions." }),
    Object.freeze({ section: "21.0022", ownedByTopics: ["T09"], primaryUnits: ["T09U2"], pointerUnits: [], note: "Franchisors excluded - for purposes of the chapter a franchisor is not considered the employer of a franchisee or of a franchisee's employees. Read in T09U2 for its bearing on how a brokerage's business form affects employment-law exposure." }),
    Object.freeze({ section: "21.101", ownedByTopics: ["T09"], primaryUnits: ["T09U2"], pointerUnits: [], note: "Age discrimination limited to individuals of a certain age - the chapter's age provisions apply only to discrimination against an individual 40 years of age or older." }),
    Object.freeze({ section: "21.102", ownedByTopics: ["T09"], primaryUnits: ["T09U2"], pointerUnits: [], note: "Bona fide employee benefit plan; production measurement system - when applying different terms under such a plan or system is not an unlawful employment practice." }),
    Object.freeze({ section: "21.141", ownedByTopics: ["T09"], primaryUnits: ["T09U2", "T09U6"], pointerUnits: [], note: "Definitions for the sexual-harassment subchapter - 'employer' means a person who employs one or more employees or who acts directly in the interests of an employer in relation to an employee, and 'sexual harassment' as the subchapter defines it. The one-employee threshold is why this subchapter reaches a small brokerage that the general chapter's threshold would not." }),
    Object.freeze({ section: "21.142", ownedByTopics: ["T09"], primaryUnits: ["T09U2", "T09U6"], pointerUnits: [], note: "Unlawful employment practice - an employer commits an unlawful employment practice if sexual harassment of an employee occurs and the employer or its agents or supervisors know or should have known of the conduct and fail to take immediate and appropriate corrective action." }),
    Object.freeze({ section: "21.202", ownedByTopics: ["T09"], primaryUnits: ["T09U2", "T09U6"], pointerUnits: [], note: "Statute of limitations - a complaint under the administrative subchapter must be filed not later than the 180th day after the date the alleged unlawful employment practice occurred, subject to the subsection (a-1) exception." }),
    Object.freeze({ section: "21.254", ownedByTopics: ["T09"], primaryUnits: ["T09U2", "T09U6"], pointerUnits: [], note: "Civil action by complainant - within 60 days after receiving a notice of the right to file a civil action the complainant may bring a civil action against the respondent." }),
    Object.freeze({ section: "21.256", ownedByTopics: ["T09"], primaryUnits: ["T09U2", "T09U6"], pointerUnits: [], note: "Statute of limitations on the civil action - it may not be brought later than the second anniversary of the date the complaint relating to the action is filed." }),
    Object.freeze({ section: "21.1065", ownedByTopics: ["T09"], primaryUnits: ["T09U2"], pointerUnits: [], note: "Sexual harassment protections for unpaid interns - the section's own definition of sexual harassment and its application to a person performing services for an employer without compensation. Read in T09U2 for the personal-assistant fact pattern." }),
    Object.freeze({ section: "21.2585", ownedByTopics: ["T09"], primaryUnits: ["T09U2"], pointerUnits: [], note: "Compensatory and punitive damages - what a court may award on finding an unlawful intentional employment practice, and the caps by employer size." }),
  ],
});

const LA_201 = chapter({
  code: "LA",
  codeName: "Labor Code",
  chapter: "201",
  title: "Texas Unemployment Compensation Act - Definitions",
  url: "https://tcss.legis.texas.gov/resources/LA/htm/LA.201.htm",
  localCopy: "texas/trec-sources/statutes/LA.201.htm",
  sha256: "f8a816c3ca477541417c65b34fd99ad4037ac223e02dc260dfe2b2ec88d96f3b", bytes: 77445, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Section 201.072 is the held source for the real estate exclusion from 'employment'. SCOPE, and it is the whole point of this entry: the section opens 'In this subtitle', and that subtitle is the Texas Unemployment Compensation Act. It decides UNEMPLOYMENT COMPENSATION COVERAGE ONLY. It does not decide common-law employment status, vicarious liability, wage-and-hour treatment or federal tax treatment, and this register may not be read as saying it does.",
  citedInTopicFrontMatter: ["T09"],
  sectionsRead: [
    Object.freeze({ section: "201.070", ownedByTopics: ["T09"], primaryUnits: ["T09U1", "T09U6"], pointerUnits: [], note: "Service as product demonstrator or salesman - the conditions under which such service is excluded from 'employment' in this subtitle. Read in T09 for the pattern the real estate exclusion follows; SCOPE, stated here because the course states it: 'this subtitle' is the Texas Unemployment Compensation Act, so the section decides unemployment-compensation coverage and nothing else." }),
    Object.freeze({ section: "201.072", ownedByTopics: ["T09"], primaryUnits: ["T09U1", "T09U2", "T09U5", "T09U6"], pointerUnits: [], note: "Service as real estate broker - in this subtitle 'employment' does not include service performed by an individual as a real estate broker or salesperson if the individual engages in activities requiring a licence, substantially all remuneration for the services is directly related to sales or other output rather than to the number of hours worked, and the services are performed under a written contract providing that the individual will not be treated as an employee for state tax purposes. SCOPE, and the register states it because the curriculum does: this is the UNEMPLOYMENT COMPENSATION definition only. It does not decide common-law employment status, vicarious liability, wage-and-hour treatment or federal tax treatment, and nothing in this register may be read as saying it does." }),
    Object.freeze({ section: "201.073", ownedByTopics: ["T09"], primaryUnits: ["T09U1", "T09U6"], pointerUnits: [], note: "Delivery service and newspaper delivery service exclusions from 'employment' in the same subtitle. Read in T09 as the third member of the same exclusion family; no real estate proposition rests on it." }),
  ],
});

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * FEDERAL AUTHORITY, EACH RECORDED WITHIN ITS OWN SCOPE
 * ──────────────────────────────────────────────────────────────────────────────────────────────── */

const US26_3508 = federal({
  citation: "26 U.S.C. § 3508",
  title: "Treatment of real estate agents and direct sellers",
  publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section3508&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us26-3508.html",
  sha256: "77a251dca1cb6510851bdc79089b664711607a6afb6d7b9a16590c7d702bef27", bytes: 150546, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "T09 states the three § 3508(b)(1) conditions as law, so the section is controlling - WITHIN ITS OWN SCOPE, which the section fixes in its opening words: 'For purposes of this title'. That title is Title 26, the Internal Revenue Code, so this source is controlling for FEDERAL TAX TREATMENT ONLY. It is not authority on Texas unemployment compensation, on common-law employment status, on vicarious liability or on a broker's supervisory responsibility under 22 TAC § 535.2, and T09U6 says so expressly.",
  citedInTopicFrontMatter: ["T09"],
  sectionsRead: [
    Object.freeze({ section: "3508", ownedByTopics: ["T09"], primaryUnits: ["T09U1", "T09U2", "T09U6"], pointerUnits: [], note: "Treatment of real estate agents and direct sellers - (a) 'For purposes of this title', in the case of services performed as a qualified real estate agent, the individual is not treated as an employee and the person for whom the services are performed is not treated as an employer; (b)(1) the three conditions defining a 'qualified real estate agent': the individual is a licensed real estate agent; substantially all of the remuneration for the services performed as a real estate agent is directly related to sales or other output rather than to the number of hours worked; and the services are performed under a written contract providing that the individual will not be treated as an employee with respect to those services for Federal tax purposes. SCOPE, taken from the section's own opening words: 'this title' is Title 26, the Internal Revenue Code. The section decides FEDERAL TAX TREATMENT ONLY. It does not decide Texas unemployment compensation, common-law employment status, vicarious liability or a broker's supervisory responsibility, and the curriculum says so in T09U6." }),
  ],
});

const US42_3602 = federal({
  citation: "42 U.S.C. § 3602",
  title: "Fair Housing Act - definitions",
  publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3602&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us42-3602.html",
  sha256: "6a17c0d6df0b561337bb3173eee953d6b1b255ed65a75477d8a88f3f476e7daa", bytes: 151733, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "A definitions section of a statute whose operative provisions are held and taught. T10U2 quotes 'handicap' from it and sets the federal definition beside the Texas Act's 'disability'.",
  sectionsRead: [
    Object.freeze({ section: "3602", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "Fair Housing Act definitions - 'dwelling', 'family', 'person', 'to rent', 'discriminatory housing practice', 'handicap' and 'familial status'. Read in T10U2 and quoted for 'handicap', which the module sets beside the Texas Act's 'disability' in Property Code § 301.003." }),
  ],
});

const US42_3603 = federal({
  citation: "42 U.S.C. § 3603",
  title: "Fair Housing Act - effective dates of certain prohibitions; exemptions",
  publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3603&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us42-3603.html",
  sha256: "1a8383b2416f976e13a705c0340d43567671104e4d026daee2cb9441a21b1a64", bytes: 147561, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "T10U5 states subsection (b) as law for one conclusion the course repeats: the owner exemption is unavailable where a broker, agent or salesperson is used. That is an operative limit, not background.",
  sectionsRead: [
    Object.freeze({ section: "3603", ownedByTopics: ["T10"], primaryUnits: ["T10U5"], pointerUnits: [], note: "Effective dates of certain prohibitions, and (b) the exemptions from § 3604 (other than subsection (c)) for a single-family house sold or rented by an owner on the stated conditions and for rooms or units in an owner-occupied dwelling for no more than four families. Taught in T10U5 for one point above all: the (b)(1) conditions are unavailable where a broker, agent or salesperson or a person in the business of selling or renting dwellings is used, so the exemption ends when a license holder is engaged." }),
  ],
});

const US42_3604 = federal({
  citation: "42 U.S.C. § 3604",
  title: "Fair Housing Act - discrimination in the sale or rental of housing and other prohibited practices",
  publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3604&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us42-3604.html",
  sha256: "1c35aca0cc53d430dcb4b100669730aff179d589b7d208593552b6c61a3fee9b", bytes: 156930, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "The operative federal prohibitions T10U2 teaches. The Texas Act is taught beside it, not instead of it.",
  sectionsRead: [
    Object.freeze({ section: "3604", ownedByTopics: ["T10"], primaryUnits: ["T10U2"], pointerUnits: [], note: "Discrimination in the sale or rental of housing and other prohibited practices - the operative federal prohibitions, including (a) refusing to sell or rent after the making of a bona fide offer or otherwise making a dwelling unavailable, (b) discrimination in terms, conditions or privileges, (c) discriminatory notices, statements and advertisements, (d) representing that a dwelling is not available when it is, (e) blockbusting, and (f) the disability provisions including reasonable modifications and reasonable accommodations. The federal spine of T10U2." }),
  ],
});

const US42_3606 = federal({
  citation: "42 U.S.C. § 3606",
  title: "Fair Housing Act - discrimination in the provision of brokerage services",
  publisher: "uscode.house.gov",
  url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title42-section3606&num=0&edition=prelim",
  localCopy: "texas/trec-sources/federal/us42-3606.html",
  sha256: "d89e59025d0bc899058c293d5a0766507eea9055983b36a90ea8c5f088b9af24", bytes: 144309, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "The one federal fair-housing section aimed squarely at what a license holder does - multiple-listing services, brokers' organizations and facilities relating to the business of selling or renting dwellings. T10U4 and T10U5 state it as law, with Property Code § 301.027 beside it.",
  sectionsRead: [
    Object.freeze({ section: "3606", ownedByTopics: ["T10"], primaryUnits: ["T10U4", "T10U5"], pointerUnits: [], note: "Discrimination in the provision of brokerage services - a single sentence making it unlawful to deny a person access to or membership or participation in a multiple-listing service, real estate brokers' organization or other service, organization or facility relating to the business of selling or renting dwellings, or to discriminate in the terms or conditions of that access, membership or participation. Read with Property Code § 301.027, which the course sets beside it in T10U5." }),
  ],
});

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 22 TAC — THE COMMISSION'S RULES
 *
 * Every rule below is stored as the section text TREC itself publishes on its consolidated Rules
 * page, one file per section. The Secretary of State's CODIFIED text remains unread from this
 * environment — texas-sos.appianportalsgov.com serves a JavaScript shell to a non-browser client
 * and the legacy texreg reader redirects to it — so every entry carries codifiedTextCompared:
 * false, exactly as config/texas/trec-rules-source-lock.mjs does for the five rules it holds.
 * Five of the sections below — §§ 535.55, 535.62, 535.63, 535.64 and 535.65 — ARE in that lock; a
 * load-time invariant checks that this register's hash, byte count and local path for each of them
 * agree with the lock's, so two registers can never carry different hashes for one file.
 * ──────────────────────────────────────────────────────────────────────────────────────────────── */

const TAC_531_1 = trecRule({
  section: "22 TAC §531.1",
  heading: "Definitions",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/531.1.txt",
  sha256: "e526560dbe9fdc688bd22c422977f18a052ed95ed26e90045907801dbfa48658", bytes: 322, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T01 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T10"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "531.1", ownedByTopics: ["T01"], primaryUnits: ["T01U1", "T01U4"], pointerUnits: ["T10U3", "T10U4", "T10U5"], note: "Defines 'Commission' as the Texas Real Estate Commission and 'License Holder' as a real estate broker or sales agent licensed under Occupations Code ch. 1101, for the whole of 22 TAC ch. 531. The two words the Canons are written in." }),
  ],
});

const TAC_531_2 = trecRule({
  section: "22 TAC §531.2",
  heading: "Fidelity",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/531.2.txt",
  sha256: "e9e3e0e277df8b6ec627bf5aaacdcfff5fcc1b74093337c57341b975c14a0044", bytes: 778, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T02 and T10 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T01"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "531.2", ownedByTopics: ["T02", "T10"], primaryUnits: ["T02U1", "T02U3", "T02U4", "T02U5", "T10U3", "T10U5"], pointerUnits: ["T01U2", "T01U3", "T01U4", "T03U1", "T03U2", "T03U3", "T03U6", "T04U1", "T04U3", "T04U5", "T05U2", "T05U4", "T07U1", "T07U3", "T12U3"], note: "The first Canon: a license holder acting as an agent for another is a fiduciary, and the special obligations that imposes - that the license holder's primary duty is to represent the interests of the client and that position should be clear to all parties; that in performing duties to the client the license holder shall treat other parties fairly; that the license holder be faithful and observant to trust placed in the license holder and scrupulous and meticulous in performing those functions; and that the license holder place no personal interest above that of the client. T02 owns it as the fiduciary rule; T10 owns it again as one of the Canons read as an ethical whole." }),
  ],
});

const TAC_531_3 = trecRule({
  section: "22 TAC §531.3",
  heading: "Integrity",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/531.3.txt",
  sha256: "e0426e6158f3cd3b6c26ddff7fd90cde9a7b851d2d67408d9553d786e8f3d43c", bytes: 281, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T02 and T10 and applied in the topics that cite it. The statute does not state what this rule states.",
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "531.3", ownedByTopics: ["T02", "T10"], primaryUnits: ["T02U4", "T02U5", "T10U1", "T10U3", "T10U5"], pointerUnits: ["T01U2", "T01U4", "T03U1", "T03U2", "T03U3", "T03U4", "T03U6", "T04U5", "T12U3"], note: "The second Canon: a license holder has a special obligation to exercise integrity in the discharge of the license holder's responsibilities, including employment of prudence and caution so as to avoid misrepresentation, in any way, by acts of commission or omission. The rule the course uses for misrepresentation by silence." }),
  ],
});

const TAC_531_4 = trecRule({
  section: "22 TAC §531.4",
  heading: "Competency",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/531.4.txt",
  sha256: "43b112793ee2e6d947e0011df1910e2c923613c4bb55933851ee46eae67868b3", bytes: 601, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T02 and T10 and applied in the topics that cite it. The statute does not state what this rule states.",
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "531.4", ownedByTopics: ["T02", "T10"], primaryUnits: ["T02U4", "T10U3", "T10U5"], pointerUnits: ["T01U2", "T05U2", "T05U4", "T12U3"], note: "The third Canon: the obligation to be knowledgeable and competent as a real estate brokerage practitioner, with its four requirements - being informed on local market issues and conditions where the license holder provides services, being informed on national, state and local industry issues and developments, exercising judgment and skill, and being educated in the characteristics of the specific type of real estate being brokered." }),
  ],
});

const TAC_531_18 = trecRule({
  section: "22 TAC §531.18",
  heading: "Consumer Information",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/531.18.txt",
  sha256: "be1e80c58218eb2a23dce64db8cc5eba56c8aa88a783acefbe9d01eb15881598", bytes: 1227, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T08 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T08"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "531.18", ownedByTopics: ["T08"], primaryUnits: ["T08U1", "T08U2"], pointerUnits: ["T02U5", "T03U1", "T05U6", "T10U3", "T10U5", "T12U1"], note: "The Commission adopts by reference the Consumer Protection Notice, TREC No. CN 1-5, and requires EACH LICENSE HOLDER - not merely the broker - to provide it by displaying it in a readily noticeable location in each place of business the broker maintains and by providing a link to it in a readily noticeable place on the homepage of each business website with the prescribed label and minimum font size; the three cumulative elements of 'business website'; and the social-media placement allowance. Taught in full in T08, which is the topic that owns it. The text of CN 1-5 itself is not held; the course teaches the rule, not the form, and says so." }),
  ],
});

const TAC_531_19 = trecRule({
  section: "22 TAC §531.19",
  heading: "Discriminatory Practices",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/531.19.txt",
  sha256: "97daf1e28de570d597706a55d3cb3053dd1395b4504f92c8d62b9437d1634e10", bytes: 648, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T10 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T10"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "531.19", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U2", "T10U3", "T10U5"], pointerUnits: ["T02U4", "T03U1", "T03U3", "T03U6", "T05U2", "T12U5"], note: "No license holder shall inquire about, respond to or facilitate inquiries about, or make a disclosure of an owner, previous or current occupant, potential purchaser, lessor or potential lessee which indicates or is intended to indicate any preference, limitation or discrimination based on the eight listed characteristics; and for purposes of the section disability includes AIDS, HIV-related illnesses or HIV infection as defined by the Centers for Disease Control. The conduct rule that connects the fair-housing statutes to a license holder's daily answers, and the rule that makes § 1101.556's permission to stay silent a requirement to stay silent." }),
  ],
});

const TAC_531_20 = trecRule({
  section: "22 TAC §531.20",
  heading: "Information About Brokerage Services",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/531.20.txt",
  sha256: "ae123f1c3d83e1467fe4a7c75a54346546f69afd541a39f9a36173819d3d6757", bytes: 2101, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T02 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T01", "T02"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "531.20", ownedByTopics: ["T02"], primaryUnits: ["T02U5"], pointerUnits: ["T01U3", "T03U1", "T03U3", "T03U6", "T04U5", "T05U6", "T06U5", "T07U1", "T08U1", "T08U2", "T10U3", "T10U5", "T12U1", "T12U2", "T12U5"], note: "The Commission adopts by reference the Information About Brokerage Services Notice, TREC No. IABS 1-2; each license holder shall provide a link to a completed IABS Notice in a readily noticeable place on the homepage of each business website with the prescribed label and minimum font size, and the completed notice at the first substantive communication as required under Occupations Code § 1101.558; the four permitted delivery methods; the bar on placing the link in a footnote or signature block; the definition of 'business website'; and the social-media placement allowance. Taught in full in T02U5, the form's own IABS unit. This rule, not the adopted form, is the controlling authority for everything the course states about the notice." }),
  ],
});

const TAC_535_1 = trecRule({
  section: "22 TAC §535.1",
  heading: "Definitions",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.1.txt",
  sha256: "6ed8623c50818a454a4f4d9cb2ae3169bfb6ebdef73fbb949095142ecc10e99b", bytes: 1850, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T01 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T10"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.1", ownedByTopics: ["T01"], primaryUnits: ["T01U1", "T01U3", "T01U4"], pointerUnits: ["T10U3", "T10U4"], note: "The chapter 535 definitions, including 'Act', 'associated broker', 'business entity', 'compensation', 'license holder', 'place of business' and 'trade association' - the last defined as a nonprofit voluntary member association whose membership consists primarily of licensed license holders who pay dues, governed by a board elected by the members, and subscribing to a written code of professional conduct or ethics. That definition is what T10U4 uses to place a professional code of ethics outside the Commission's rules." }),
  ],
});

const TAC_535_2 = trecRule({
  section: "22 TAC §535.2",
  heading: "Broker Responsibility",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.2.txt",
  sha256: "c776c91cb6432a735e1d69f079f9606b1f990fbefcea506adcb372f01d4f094b", bytes: 5902, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T09 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T01", "T02", "T07", "T08", "T09"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.2", ownedByTopics: ["T09"], primaryUnits: ["T09U1", "T09U2", "T09U3", "T09U4", "T09U5", "T09U6"], pointerUnits: ["T01U1", "T01U3", "T01U4", "T02U1", "T02U2", "T02U3", "T02U4", "T02U5", "T03U3", "T03U4", "T03U5", "T04U1", "T04U3", "T04U4", "T04U5", "T05U1", "T05U2", "T05U4", "T05U5", "T07U1", "T07U2", "T07U3", "T08U2", "T10U3", "T10U4", "T10U5", "T12U1", "T12U3", "T12U4", "T12U5"], note: "The broker-responsibility rule, taught in full in T09 and cited by nine other modules: the duty to notify a sponsored sales agent in writing of the scope of authorised activities and the broker's responsibility for authorised acts and for acts beyond the authorised scope the broker permits; the highest fiduciary obligation to the principal and the duty to convey all information known to the agent which may affect the principal's decision unless prohibited by other law; responsibility for the proper handling of trust funds under § 535.146; responsibility for a sponsored sales agent's property-management activity; the written delegation of supervisory responsibility, the rule that any license holder who leads, supervises, directs or manages a team must be delegated as a supervisor, and the 30-day notification to the Commission; the requirement that listings and other agreements for brokerage services be solicited and accepted in a broker's name; responsibility for a sponsored sales agent's advertising under §§ 535.154 and 535.155; and the four-year record-retention list." }),
  ],
});

const TAC_535_3 = trecRule({
  section: "22 TAC §535.3",
  heading: "Compensation to or Paid by a Sales Agent",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.3.txt",
  sha256: "e92a0cd37b738bc11a4cf7bf87d8f682dfa292a4eb36c405b66401ea6fd809c6", bytes: 502, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T05 and T09 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T05", "T09"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.3", ownedByTopics: ["T05", "T09"], primaryUnits: ["T05U5", "T05U6", "T09U1", "T09U4", "T09U6"], pointerUnits: ["T01U3", "T02U2", "T02U5", "T07U2", "T07U3", "T08U2", "T12U1", "T12U3"], note: "A sales agent may not receive a commission or other valuable consideration except with the written consent of the sponsoring broker or the broker who sponsored the sales agent when the sales agent became entitled to it, and may not pay a commission or other valuable consideration to another person except with the sponsoring broker's written consent. Owned by T09 as the compensation rule and by T05 for the buyer-side compensation unit." }),
  ],
});

const TAC_535_4 = trecRule({
  section: "22 TAC §535.4",
  heading: "License Required",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.4.txt",
  sha256: "156c19eb775a2e33eb76d38188f0bf8ffc0d779017f3cde68b3b4c8d43014405", bytes: 4582, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T01 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T01", "T09"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.4", ownedByTopics: ["T01"], primaryUnits: ["T01U1", "T01U4"], pointerUnits: ["T04U1", "T07U1", "T09U4", "T09U5", "T09U6", "T12U4"], note: "What requires a licence: acting as a broker or sales agent while physically within Texas regardless of where the property or the client is; the out-of-state medium rule; the cooperative-arrangement saving; the requirement that a person be licensed to SHOW a property, with 'show' defined to include causing or permitting the property to be viewed, unlocking or providing access, and HOSTING AN OPEN HOUSE at the property; the three conditions for unescorted access by a prospective tenant; the licensing of employees who direct or supervise; soliciting listings; the compensation-entity rule; and the rent-control test for single-family residential units. The open-house limb is why T05 and T12 can teach who may host one." }),
  ],
});

const TAC_535_5 = trecRule({
  section: "22 TAC §535.5",
  heading: "License Not Required",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.5.txt",
  sha256: "16e8c0988d1a23fd80f369aa078ab3f4d04511014a99495772796a194c9eee9e", bytes: 2381, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T01 and applied in the topics that cite it. The statute does not state what this rule states.",
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.5", ownedByTopics: ["T01"], primaryUnits: ["T01U1", "T01U4"], pointerUnits: ["T09U3", "T09U4", "T09U6", "T10U5"], note: "The counterpart exclusions: acting as a principal; a joint owner conveying the owner's own interest; an employee of a business entity buying, selling or leasing for the entity, with 'employee' defined to exclude an independent contractor; trade-association listing services that receive no compensation on sale; auctioneers, who may not show property, prepare offers or negotiate contracts unless also licensed; answering services and clerical employees identified as such who confirm size, price and terms; and (g) the business entity that receives compensation on a license holder's behalf, which must perform no other act of a broker, be an LLC or an S corporation, be at least 51 percent owned by that license holder, and be registered under § 535.35." }),
  ],
});

const TAC_535_16 = trecRule({
  section: "22 TAC §535.16",
  heading: "Listings; Net Listings",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.16.txt",
  sha256: "dba92618f0200c824091b2d5f94fec70d47faf3814c04ad7baea8353cf97a2fd", bytes: 1196, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T04 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T01", "T04"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.16", ownedByTopics: ["T04"], primaryUnits: ["T04U1", "T04U3", "T04U5"], pointerUnits: ["T01U4", "T02U4", "T02U5", "T03U1", "T03U2", "T05U6", "T09U3", "T09U6", "T10U3", "T12U1", "T12U4"], note: "A broker is obligated under a listing contract to negotiate the best possible transaction for the principal the broker has agreed to represent; the definition of a net listing and the conditions under which a broker may take one, including that the listing agreement assure the principal of not less than the principal's desired price and limit the broker to a specified maximum commission; and the obligation to provide a broker price opinion or comparative market analysis when negotiating a listing or offering to purchase for the license holder's own account. Taught in full in T04, which owns listing agreements." }),
  ],
});

const TAC_535_17 = trecRule({
  section: "22 TAC §535.17",
  heading: "Broker Price Opinion, Comparative Market Analysis, or Sales Price Estimate",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.17.txt",
  sha256: "a67f0514277a956b4740738d23d949693075110d3236d0d2a996cb87e52f3662", bytes: 1388, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T12 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T12"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.17", ownedByTopics: ["T12"], primaryUnits: ["T12U1", "T12U3", "T12U5"], pointerUnits: ["T03U2", "T03U4", "T04U1", "T04U3", "T05U4", "T10U3"], note: "A real estate license holder may not perform an appraisal or provide an opinion of value unless licensed or certified under Occupations Code ch. 1103; the verbatim written statement that must accompany a broker price opinion, comparative market analysis or estimated worth or sale price, reproduced in at least 12-point font; and the rule that a sales agent may prepare and present one but must submit it in the broker's name, with the broker responsible for it." }),
  ],
});

const TAC_535_20 = trecRule({
  section: "22 TAC §535.20",
  heading: "Referrals from Unlicensed Persons",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.20.txt",
  sha256: "cba8a67aca7d8452cce4a7366e3a8e66b67ab0c3b11a22838b2ef3de0eff6189", bytes: 1212, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T09 and applied in the topics that cite it. The statute does not state what this rule states.",
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.20", ownedByTopics: ["T09"], primaryUnits: ["T09U4", "T09U6"], pointerUnits: ["T04U1", "T05U5", "T10U3", "T11U5", "T12U4", "T12U5"], note: "Referring a prospective buyer, seller, landlord or tenant with the expectation of receiving valuable consideration is an act requiring a licence, with 'valuable consideration' defined to include money, gifts of merchandise having a retail value greater than $50, rent bonuses and discounts; and the four cumulative conditions under which a person selling goods or services to the public and to a license holder need not be licensed. The rule behind the course's treatment of referral fees and closing gifts." }),
  ],
});

const TAC_535_21 = trecRule({
  section: "22 TAC §535.21",
  heading: "Mailing Address and Other Contact Information",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.21.txt",
  sha256: "fd0b790e01ccf6a73c05568760ca1df75a9ef21683cbed5a717f60609e31c1e7", bytes: 1173, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T12 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T12"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.21", ownedByTopics: ["T12"], primaryUnits: ["T12U5"], pointerUnits: ["T09U5", "T10U3"], note: "Each license holder must provide a mailing address, business address, business phone number and business email address to the Commission and report changes not later than the 10th day after a change; the consequence of failing to update; where the Commission sends notices for an active broker, an inactive license holder and an active sales agent; and the associated broker's separate reporting duty." }),
  ],
});

const TAC_535_35 = trecRule({
  section: "22 TAC §535.35",
  heading: "Registration of Certain Business Entities",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.35.txt",
  sha256: "32641992fb1a9b905f159e9084f78285fc954db95f8d041dbabb5f43632f2249", bytes: 1823, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1). The curriculum states its operative text as law; the statute does not supply what the rule supplies.",
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.35", ownedByTopics: null, primaryUnits: ["T09U6"], pointerUnits: [], note: "The registration procedure for an 'exempt business entity' under § 535.5(g) and Occupations Code § 1101.355(d) before it may receive compensation on a license holder's behalf, its two-year term, the certification requirement before expiry, and the 10-day notice when the entity no longer qualifies. Read in T09U6 for the compensation-entity route; the course states the procedure, not the fee schedule as a fee schedule." }),
  ],
});

const TAC_535_131 = trecRule({
  section: "22 TAC §535.131",
  heading: "Unlawful Conduct; Splitting Fees",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.131.txt",
  sha256: "0c35d9c86fe0b8f3fccc3b68fe6f79b5b7d8d51e85086382daadc273151f4ac5", bytes: 584, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T09 and applied in the topics that cite it. The statute does not state what this rule states.",
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.131", ownedByTopics: ["T09"], primaryUnits: ["T09U6"], pointerUnits: ["T04U1"], note: "A Texas broker may cooperate with a foreign broker and share earned commissions with one; only Texas license holders may handle negotiations physically conducted within Texas; and a resident of a foreign country or territory that does not licence brokers is considered licensed as a foreign broker for the purposes of Occupations Code § 1101.651 if the person practises in compliance with that jurisdiction's law." }),
  ],
});

const TAC_535_141 = trecRule({
  section: "22 TAC §535.141",
  heading: "Initiation of Investigation; Order Requirements",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.141.txt",
  sha256: "7dde456f63f828d3b2be9ba2048bc8096e1336aeca1f9485fab34e93c26b41c7", bytes: 6498, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T10 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T10"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.141", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U3", "T10U4"], pointerUnits: ["T07U2", "T07U3", "T12U5"], note: "A complaint naming a sales agent but not the sponsoring broker is a complaint against the broker for the limited purpose of determining the broker's involvement and whether the broker fulfilled the broker's professional responsibilities; the parallel rule for a designated broker of a licensed business entity; who receives a copy of the complaint notice; and the three-level prioritisation of complaints under the § 1101.204 criteria, with the $10,000 fraud threshold that separates level 1 from level 2. The rule that makes broker responsibility operational when a complaint arrives." }),
  ],
});

const TAC_535_144 = trecRule({
  section: "22 TAC §535.144",
  heading: "When Acquiring or Disposing of Own Property or Property of Spouse, Parent or Child",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.144.txt",
  sha256: "0b8529b7fbd7a3bab2df030b2156159bf133f1ee9dcf2441a7d7b8ad8abf75ce", bytes: 1134, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T12 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T12"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.144", ownedByTopics: ["T12"], primaryUnits: ["T12U3", "T12U4", "T12U5"], pointerUnits: ["T02U4", "T03U1", "T03U2", "T03U6", "T05U6", "T10U3", "T10U5"], note: "For purposes of Occupations Code § 1101.652(a-1)(1), 'license holder' includes one acting on behalf of a spouse, parent or child, a business entity in which the license holder is more than a 10% owner, or a trust in which the license holder or a close relative is trustee or beneficiary; the duty to disclose in writing that the person is a licensed broker or sales agent acting in that capacity, in the contract of sale or rental agreement or in another writing given before entering it; and the bar on using the license holder's expertise to the disadvantage of a person with whom the license holder deals." }),
  ],
});

const TAC_535_145 = trecRule({
  section: "22 TAC §535.145",
  heading: "False Promise",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.145.txt",
  sha256: "45c6e20c061cd5747222f4401fe6b20fd9d808148377dbdcc67430ddcdf3de9a", bytes: 734, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T11 and applied in the topics that cite it. The statute does not state what this rule states.",
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.145", ownedByTopics: ["T11"], primaryUnits: ["T11U1", "T11U5"], pointerUnits: ["T07U1", "T07U3", "T10U3", "T10U4", "T12U3"], note: "For purposes of Occupations Code § 1101.652(b)(5), 'false promise' includes both oral and written promises; neither the absence of the promise from the written agreement nor the absence of detrimental reliance prevents the Commission from finding a false promise; and neither a contractual disclaimer of oral representations nor the parol evidence rule prevents the Commission from considering oral promises. The rule T11 uses to separate a disciplinary false promise from a common-law fraud claim." }),
  ],
});

const TAC_535_146 = trecRule({
  section: "22 TAC §535.146",
  heading: "Maintaining Trust Money",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.146.txt",
  sha256: "afa8ef1f244fafd04893891ad681e266a4de57f013af32b6513b7df0b8b27719", bytes: 5084, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T07 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T07"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.146", ownedByTopics: ["T07"], primaryUnits: ["T07U2", "T07U3"], pointerUnits: ["T02U2", "T02U4", "T09U5", "T09U6", "T12U1", "T12U2", "T12U3", "T12U5"], note: "The trust-money rule: the definitions of 'trust money' and 'trust account'; that trust money accepted by a broker is held in a fiduciary capacity and must be maintained in a designated trust account or delivered to an authorised escrow agent; that a sales agent may not maintain a trust account and must immediately deliver trust money to the sponsoring broker; the deposit deadline of not later than the close of business of the second working day after receipt unless the principals agree otherwise in writing; the prohibition on commingling and the two forms of prima facie evidence of it; the trust-account requirements including interest and the reasonable service-fee balance; the 30-day removal of money the broker becomes entitled to; and the documentary record and accounting duties. T07 owns it for the specific reason that the accounting duty survives termination of the agency." }),
  ],
});

const TAC_535_147 = trecRule({
  section: "22 TAC §535.147",
  heading: "Splitting Fee with Unlicensed Person",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.147.txt",
  sha256: "f6861f6f78ab4feb600464bc4733a21da895e067c59eb9d3e755d2b0877a4f04", bytes: 1733, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T09 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T09"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.147", ownedByTopics: ["T09"], primaryUnits: ["T09U4", "T09U6"], pointerUnits: ["T05U5", "T05U6", "T10U5", "T12U4", "T12U5"], note: "A broker or sales agent may not share a commission or fees with a person who engages in acts for which a licence is required and is not actively licensed; the narrow allowance for an unlicensed person to share in the income of a licensed business entity where the person engages in no acts requiring a licence and does not lead the public to believe otherwise; the bar on sharing with an unlicensed collection entity except under § 535.5(g) and § 1101.355(d); and the rebate rule, including the written consents required and the bar on paying a party in a manner that misleads a broker, lender, title company or governmental agency. The rule that governs what an unlicensed personal assistant may be paid for." }),
  ],
});

const TAC_535_148 = trecRule({
  section: "22 TAC §535.148",
  heading: "Receiving an Undisclosed Commission or Rebate",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.148.txt",
  sha256: "639ca0bd4d50e77313952587412ed57c35005e0d47e26b8e78be99744bbf4e1d", bytes: 3973, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T05 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T05", "T09"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.148", ownedByTopics: ["T05"], primaryUnits: ["T05U5", "T05U6"], pointerUnits: ["T02U4", "T09U6", "T10U5", "T12U4", "T12U5"], note: "A license holder may not receive a commission, rebate or fee in a transaction from a person other than the person the license holder represents without first disclosing the intention to the client and obtaining the client's consent; the additional consent required from a party the license holder does not represent who agrees to pay a service provider; the bar on exclusive-dealing contracts with a service provider where the license holder represents a party; the bar on paying or receiving a fee to or from a settlement service provider for referrals or for inclusion on preferred-provider lists, with the section's own definition of 'settlement service provider'; and the mandatory use of TREC No. RSC-4 for residential service contract disclosures." }),
  ],
});

const TAC_535_149 = trecRule({
  section: "22 TAC §535.149",
  heading: "Lottery or Deceptive Trade Practice",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.149.txt",
  sha256: "ebc17478542f03e1171b3d1412f842ffa736d76372ee7b8b625bbfb0655ff614", bytes: 672, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T11 and applied in the topics that cite it. The statute does not state what this rule states.",
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.149", ownedByTopics: ["T11"], primaryUnits: ["T11U5"], pointerUnits: [], note: "For purposes of Occupations Code § 1101.652(b)(14), the elements of a 'lottery' are the award or distribution of a prize by chance and the payment of consideration for the opportunity to win; giving gifts as an inducement does not violate the section but procurement of prospects must comply with § 535.20; and 'deceptive practices' include the acts described in Business and Commerce Code § 17.46 done in the manner defined in that section. The bridge the Commission itself builds between its own discipline and the DTPA." }),
  ],
});

const TAC_535_153 = trecRule({
  section: "22 TAC §535.153",
  heading: "Violating an Exclusive Agency",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.153.txt",
  sha256: "8859b2661f0b768cdf9d5307e2feeaabdb7ea2a8d37ad038c4ec028cfa2bc5ab", bytes: 446, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T04 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T04"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.153", ownedByTopics: ["T04"], primaryUnits: ["T04U2", "T04U5"], pointerUnits: ["T07U1", "T12U5"], note: "A license holder, including one acting as agent for a prospective buyer or tenant, may not attempt to negotiate a sale, exchange, lease or rental of property under exclusive listing with another broker, but the Act does not prohibit soliciting a listing from the owner while the property is subject to another broker's exclusive listing. Taught in T04, which owns exclusive seller agency." }),
  ],
});

const TAC_535_154 = trecRule({
  section: "22 TAC §535.154",
  heading: "Registration and Use of Alternate, Team and Assumed Business Names Used in Advertisements",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.154.txt",
  sha256: "d03acc8c470b9148411c463fe31ffa3a9b6344a761b5c43b88aea680c87e3bc8", bytes: 3332, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T12 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T12"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.154", ownedByTopics: ["T12"], primaryUnits: ["T12U4", "T12U5"], pointerUnits: ["T08U2", "T09U5", "T09U6", "T10U3"], note: "The definitions of 'alternate name', 'associated broker', 'assumed business name' and 'team name'; the registration requirements before each may be used in an advertisement and the 10-day notifications when use stops; the requirement that a team name not mislead the public into believing the team offers brokerage services independent of its sponsoring broker and that it end with the word 'team' or 'group'; and the broker's registration duty for an assumed business name." }),
  ],
});

const TAC_535_155 = trecRule({
  section: "22 TAC §535.155",
  heading: "Advertisements",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.155.txt",
  sha256: "d810281b23fdbe923d0ac712213c8c99f173f6a07265a91b53bc91db6cf982b1", bytes: 5859, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T12 and applied in the topics that cite it. The statute does not state what this rule states.",
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.155", ownedByTopics: ["T12"], primaryUnits: ["T12U1", "T12U4", "T12U5"], pointerUnits: ["T03U2", "T03U3", "T08U2", "T09U5", "T10U3"], note: "Each advertisement must include, in a readily noticeable location, the name of the license holder or team placing it and the broker's name in at least half the size of the largest contact information for any sales agent, associated broker or team name; the definitions of 'advertisement' (with its two exclusions), 'broker's name', 'contact information', 'party' and 'team name'; the social-media and text placement allowance; and the enumerated list of advertisements that mislead or are likely to deceive for purposes of this section and Occupations Code § 1101.652(b)(23)." }),
  ],
});

const TAC_535_156 = trecRule({
  section: "22 TAC §535.156",
  heading: "Dishonesty; Bad Faith; Untrustworthiness",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.156.txt",
  sha256: "b432afcf0351fd1391a13ae231cef1db2cac3b47f47b2114c2dabf66ad2a2ecb", bytes: 1240, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T02 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T01"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.156", ownedByTopics: ["T02"], primaryUnits: ["T02U1", "T02U4", "T02U5"], pointerUnits: ["T01U3", "T01U4", "T03U1", "T03U2", "T03U3", "T03U4", "T03U6", "T04U3", "T05U4", "T07U2", "T10U3", "T10U5", "T11U5", "T12U1", "T12U3", "T12U5"], note: "A license holder's relationship with the principal is that of a fiduciary; the duty to convey all known information which would affect the principal's decision whether to make, accept or reject offers, and the written-agreement exception that ends the duty to submit offers after the principal has accepted one; the duty to put the principal's interest above the license holder's own while dealing honestly and fairly with all parties, representing only the principal; the affirmative duty to keep the principal informed at all times of significant information; and the duty to convey accurate information to members of the public with whom the license holder deals. With § 531.2 and § 1101.557 this is where the course's statement of fiduciary duty comes from." }),
  ],
});

const TAC_535_157 = trecRule({
  section: "22 TAC §535.157",
  heading: "Obligation to Respond Timely",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.157.txt",
  sha256: "958c5d966bb1aa369d6bd80447a1ab1ed1835479929dd06962d6f5c98cbe87bb", bytes: 277, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T02 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T02", "T03"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.157", ownedByTopics: ["T02"], primaryUnits: ["T02U4", "T02U5"], pointerUnits: ["T03U1", "T03U3", "T03U6", "T04U3", "T07U2", "T08U2", "T09U5", "T10U1", "T10U3", "T10U5", "T12U1", "T12U3", "T12U5"], note: "A broker or sales agent must respond to his or her principal, to a broker or sales agent representing another party, or to an unrepresented party within two calendar days. The only held source for a response deadline, which is why the course states two calendar days and no other figure." }),
  ],
});

const TAC_535_191 = trecRule({
  section: "22 TAC §535.191",
  heading: "Schedule of Administrative Penalties",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.191.txt",
  sha256: "e74c8d64a22aea761d36fe7e2ab31078ac04d32ca97dcf218247798e4b29a327", bytes: 2573, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T10 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T10"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "535.191", ownedByTopics: ["T10"], primaryUnits: ["T10U1", "T10U3", "T10U4", "T10U5"], pointerUnits: ["T06U1", "T06U2", "T06U5"], note: "The penalty schedule: the Commission may suspend or revoke or take other disciplinary action in addition to or instead of a penalty; the schedule takes into account the § 1101.702(b) criteria; and the three penalty bands - $100-$1,500, $500-$3,000 and $1,000-$5,000 per violation per day - each with its own enumerated list of Act and rule provisions, plus the doubling provision for a history of previous violations. The course reads a provision's band off the list it appears in and does not generalise across bands." }),
  ],
});

const TAC_537_11 = trecRule({
  section: "22 TAC §537.11",
  heading: "Use of Standard Contract Forms; Unauthorized Practice of Law",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/537.11.txt",
  sha256: "7a063a037d136c3241e60905831b98a1fa7c3ebbb96bba8b8d44439471bc8224", bytes: 4894, retrievedOn: "2026-08-30",
  tier: "controlling",
  tierReason:
    "Binding administrative rule adopted under Occupations Code § 1101.151(b)(1), taught in full in T04 and applied in the topics that cite it. The statute does not state what this rule states.",
  citedInTopicFrontMatter: ["T04", "T12"],
  codifiedTextCompared: false,
  sectionsRead: [
    Object.freeze({ section: "537.11", ownedByTopics: ["T04"], primaryUnits: ["T04U1", "T04U3", "T04U5"], pointerUnits: ["T01U4", "T05U1", "T05U4", "T10U5", "T12U2", "T12U3", "T12U5"], note: "A license holder shall use only contract forms approved for mandatory use by the Commission when negotiating contracts binding the sale, exchange, option or lease of an interest in real property, subject to the four exceptions - acting solely as a principal, a federal agency form requirement, an owner-prepared or owner-required attorney-prepared form, and transactions for which no form is approved for mandatory use, where an attorney-prepared or trade-association-prepared form may be used if it carries the five listed items; the eight prohibitions, including practising law, giving legal advice, giving opinions on the legal effect of contract forms or on title, drafting or recommending contract language including escalation, appraisal or contingency clauses, and discouraging a principal from employing an attorney; and the savings clauses preserving the fiduciary duty to disclose pertinent facts and the ability to explain informational items." }),
  ],
});

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * THE FIVE RULES THAT GOVERN THIS COURSE AS A COURSE, RATHER THAN ITS LAW.
 *
 * §§ 535.55, 535.62, 535.63, 535.64 and 535.65 teach nothing to a student and no LOA-1 unit cites
 * them. They govern the COURSE: what it must contain, how it must be assessed, who may teach it,
 * how it must be delivered, and what must be kept afterwards. Until assessment authoring began,
 * three of them (§§ 535.62, 535.63 and 535.65) were held on disk and deliberately left out of this
 * register, because there was no assessment engine, instructor dossier or delivery-control artefact
 * for them to be controlling OVER. Assessment authoring starts now, so leaving them out would mean
 * an acceptance package that omits the rules governing its own examinations. They are registered
 * here, at subsection granularity, with the artefact each subsection controls named on the record.
 *
 * OCCUPATIONS CODE ch. 1101 IS NOT A SUBSTITUTE FOR ANY OF THEM. § 1101.151 confers the rulemaking
 * power and §§ 1101.301 and 1101.358 require qualifying education; none of them states a single
 * assessment or delivery requirement below. Where a behaviour of this course is governed by a rule
 * in 22 TAC, the rule is cited. The chapter is the enabling statute, not the operative requirement.
 *
 * THE SUBSECTION LETTERING, AND WHAT IT RESTS ON. TREC's Rules page prints no subsection letters —
 * it renders the structure as indentation. For §§ 535.62 and 535.65 the lettering below is not
 * inferred from that indentation: the Secretary of State's Texas Register of 22 May 2026 publishes
 * both sections in full WITH their lettering (TRD-202601975), that file is held at
 * texas/trec-sources/texas-register/, and on 2026-08-30 the two copies were diffed paragraph by
 * paragraph and are identical word for word except in the paragraphs the 2026 proposal amends
 * (§ 535.62(i)(2) and § 535.65(j)). config/texas/trec-rules-source-lock.mjs records that comparison
 * as SUBSECTION_IDENTIFIER_SOURCE. For §§ 535.55, 535.63 and 535.64 no Secretary of State copy is
 * held, so their lettering is a reading of the TREC page's nesting corroborated by the rules' own
 * internal cross-references, and every such record says so in its own words.
 *
 * NONE OF THIS IS THE CODIFIED TEXT. The Secretary of State's adopted 22 TAC still could not be
 * opened from this environment, every entry below carries codifiedTextCompared: false, and
 * TX_PROVIDER_RULE_SOURCE_LOCK continues to FAIL. A Texas Register publication of a PROPOSAL is a
 * higher-tier document than TREC's convenience copy and it is still not the adopted rule.
 * ──────────────────────────────────────────────────────────────────────────────────────────────── */

const TAC_535_55 = trecRule({
  section: "22 TAC §535.55",
  heading: "Education and Sponsorship Requirements for a Sales Agent License",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.55.txt",
  sha256: "d5a8a6b9a97051109563e919f4cdf8d5b1615100e0c9a5dae44b96b30ce11204", bytes: 1205, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "Controlling for COMPLIANCE rather than curriculum: no unit teaches it and none needs to, but the course could not be built without it. It is also the rule that fixes THIRTY credit hours for Law of Agency, and every per-hour assessment count this course is built to — 60 questions per examination version, a 120-question bank, three scenario exercises — is that number multiplied by a rate in § 535.62(b)(7)-(8). reliedOnByUnits is therefore empty and reliedOnByArtifacts names what actually depends on it.",
  codifiedTextCompared: false,
  subsectionIdentifierBasis: "held-page-nesting",
  reliedOnByArtifacts: [
    "config/texas/regulatory-manifest.mjs PROGRAMS",
    "config/texas/law-of-agency-time-budget.mjs",
    "config/texas/trec-rules-source-lock.mjs ASSESSMENT_REQUIREMENTS.creditHours",
  ],
  sectionsRead: [
    Object.freeze({
      section: "535.55(a)",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["config/texas/trec-rules-source-lock.mjs ASSESSMENT_REQUIREMENTS.creditHours", "config/texas/law-of-agency-time-budget.mjs"],
      note: "COMPLIANCE, NOT CURRICULUM. 180 hours of qualifying real estate courses for an initial sales agent licence: 60 hours of Principles of Real Estate, 30 of Law of Agency, 30 of Law of Contracts, 30 of Promulgated Contracts Forms and 30 of Real Estate Finance. The second item is why this course exists AND why it is a 30-hour course, which is the multiplicand in every per-credit-hour assessment count. The held page prints the list without paragraph numbers, so that item is identified by its position in the (a) list rather than cited as (a)(2). WHAT THIS RULE DOES NOT FIX: the length of a credit hour. Neither this rule nor §§ 535.62-535.65 defines it. LOA-1 prescribes 1,500 minutes for the 30 hours, which is the form's own 50-minute hour, and the words-per-minute rates in the time budget are StateCourse methodology labelled as such.",
    }),
    Object.freeze({
      section: "535.55(b)",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["config/texas/regulatory-manifest.mjs PROGRAMS"],
      note: "COMPLIANCE, NOT CURRICULUM. An additional 90 classroom hours in qualifying courses, including the 30-hour real estate brokerage course, by the expiration of the initial licensing period. Registered because it is part of the pathway the manifest states; nothing in this course's assessment or delivery turns on it.",
    }),
    Object.freeze({
      section: "535.55(c)",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: [],
      note: "COMPLIANCE, NOT CURRICULUM. An inactive sales agent licence issues on satisfaction of the education and examination requirements, and an inactive sales agent may not practise until sponsored by an active Texas broker. Read and recorded; no LOA-1 unit cites it and no artefact depends on it.",
    }),
  ],
});

const TAC_535_62 = trecRule({
  section: "22 TAC §535.62",
  heading: "Approval of Qualifying Courses",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.62.txt",
  sha256: "3a17a31f4c8e5acb1add6ba71ad8f061f34bc64bfaef9f98eedd8737a170b2f0", bytes: 11383, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "CONTROLLING FOR THE ASSESSMENT DESIGN, which is a use, not a mention. No LOA-1 unit teaches this rule and none needs to; every assessment number the course is built to comes from it and from nowhere else. Occupations Code ch. 1101 contains none of these figures, so citing the chapter here instead of the rule would be a false statement of where the requirement comes from.",
  codifiedTextCompared: false,
  subsectionIdentifierBasis: "sos-published-proposed-text",
  reliedOnByArtifacts: [
    "config/texas/law-of-agency-course-form.mjs",
    "config/texas/law-of-agency-time-budget.mjs",
    "config/texas/law-of-agency-statute-sources.mjs unitCoverage()",
    "texas/tx-law-of-agency-30-v1/time-evidence.json",
    "planned:loa-topic-quizzes",
    "planned:loa-scenarios",
    "planned:loa-final-exam-versions",
    "planned:loa-final-exam-bank",
    "planned:loa-progression-gate",
    "planned:loa-replacement-questions",
  ],
  sectionsRead: [
    Object.freeze({
      section: "535.62(b)(1)-(2)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["config/texas/law-of-agency-course-form.mjs", "config/texas/law-of-agency-statute-sources.mjs unitCoverage()"],
      note: "A course must cover all topics and units for the course subject required by the Act, Chapter 1102 and this chapter, and cover all units within the prescribed topic. THE ARTEFACT IT CONTROLS: the LOA-1 transcription and the 57-unit coverage measure in this file. It is why unitCoverage() is measured against every unit of the adopted form and why a unit may be excused only by being named in NO_STATUTE_REQUIRED with a reason.",
    }),
    Object.freeze({
      section: "535.62(b)(3)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["config/texas/law-of-agency-time-budget.mjs", "texas/tx-law-of-agency-30-v1/time-evidence.json"],
      note: "A course must contain sufficient content to satisfy the number of hours for which credit is requested, as evidenced by (A) word count studies, (B) samples of student time studies, or (C) other methods acceptable to the Commission. THE ARTEFACT IT CONTROLS: the three-layer time evidence report. The rule permits the evidence to take any of three forms and does not prescribe a rate; the words-per-minute rates in the time budget are StateCourse methodology and the file labels them PROVIDER_METHODOLOGY.",
    }),
    Object.freeze({
      section: "535.62(b)(4)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["config/texas/law-of-agency-time-budget.mjs"],
      note: "The course will be scheduled for the full clock hours of time for which credit is awarded and presented in full hourly units. THE BEHAVIOUR IT CONTROLS: the course is scheduled for the whole of LOA-1's 1,500 prescribed minutes; a student may not be credited with 30 hours for less scheduled time.",
    }),
    Object.freeze({
      section: "535.62(b)(5)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/distance-delivery-controls.md"],
      note: "No daily course segment may exceed 12 hours. THE BEHAVIOUR IT CONTROLS: the pacing limit any delivery schedule must enforce. § 535.65(g)(1)(B)(iv) states the same cap again for classroom delivery.",
    }),
    Object.freeze({
      section: "535.62(b)(6)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/distance-delivery-controls.md"],
      note: "A course will be delivered by (A) classroom delivery, (B) distance education delivery, or (C) a combination in which at least 50% is classroom. THE BEHAVIOUR IT CONTROLS: the delivery method this course declares. It is authored for distance education delivery, which is what makes (b)(7)(C) below binding on it rather than optional.",
    }),
    Object.freeze({
      section: "535.62(b)(7)(A)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-topic-quizzes", "config/texas/law-of-agency-time-budget.mjs"],
      note: "TOPIC QUIZZES, WITH AT LEAST THREE QUESTIONS RELATED TO THE SUBJECT MATTER IN EACH COURSE TOPIC. THE ARTEFACT IT CONTROLS: the topic quiz bank, not yet authored. The floor is per COURSE TOPIC — for LOA-1's twelve topics, 36 items — and the planned load in config/texas/law-of-agency-time-budget.mjs is 58 items with no topic below three (T07 and T08 sit exactly at the floor with three each). ASSESSMENT_REQUIREMENTS.minQuestionsPerTopicQuiz is this sentence.",
    }),
    Object.freeze({
      section: "535.62(b)(7)(B)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-scenarios", "config/texas/law-of-agency-time-budget.mjs"],
      note: "AT LEAST ONE SCENARIO-BASED LEARNING EXERCISE PER EVERY INCREMENT OF 10 CREDIT HOURS OR LESS. THE ARTEFACT IT CONTROLS: the scenario set, not yet authored. Thirty credit hours gives a floor of three; the time budget plans five (four topic scenarios plus one course-level capstone). ASSESSMENT_REQUIREMENTS.minScenarioExercises is ceil(30/10) and the arithmetic is recorded in the rule lock rather than assumed.",
    }),
    Object.freeze({
      section: "535.62(b)(7)(C)(i)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-progression-gate"],
      note: "FOR DISTANCE EDUCATION DELIVERY: prevent the student from moving from one topic to the next until the student answers all topic quiz questions correctly and receives a passing grade on the scenario-based learning exercises. THE BEHAVIOUR IT CONTROLS: topic-to-topic progression gating. Note what it requires — ALL quiz questions answered CORRECTLY, not a percentage — which is why the topic quiz and the final examination are governed by different standards and may not share a pass rule.",
    }),
    Object.freeze({
      section: "535.62(b)(7)(C)(ii)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-replacement-questions"],
      note: "FOR QUIZ QUESTIONS ANSWERED INCORRECTLY: present the rationale behind the correct answer and ask a subsequent related quiz question that will count toward passing the topic if answered correctly. THE ARTEFACT IT CONTROLS: the replacement-question layer of the topic quiz bank, which is why the quiz bank cannot be a flat list of items — every item needs a rationale and at least one related successor. The formative misconception checks in config/texas/law-of-agency-misconception-checks.mjs are a StateCourse instrument and are NOT this requirement.",
    }),
    Object.freeze({
      section: "535.62(b)(8)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-final-exam-versions"],
      note: "AT LEAST FOUR VERSIONS OF A FINAL EXAMINATION. THE ARTEFACT IT CONTROLS: the examination forms, not yet built. ASSESSMENT_REQUIREMENTS.minExamVersions is this sentence. § 535.65(h)(4) requires those versions to be ROTATED throughout the approval period, so building four and serving one would not comply.",
    }),
    Object.freeze({
      section: "535.62(b)(8)(A)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-final-exam-versions", "config/texas/law-of-agency-course-form.mjs"],
      note: "EACH VERSION MUST COVER EACH TOPIC REQUIRED BY THE ACT OR RULES FOR THE SPECIFIC COURSE. THE BEHAVIOUR IT CONTROLS: the per-version blueprint. 'Each topic required by the Rules' resolves, for this course, through § 535.64(a) to LOA-1's twelve topics — so every one of the four versions must carry items from all twelve, and a version that omits a topic is non-compliant however well it scores.",
    }),
    Object.freeze({
      section: "535.62(b)(8)(B)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-final-exam-bank", "planned:loa-final-exam-versions"],
      note: "NO VERSION MAY CONTAIN ANY TRUE/FALSE QUESTIONS. THE BEHAVIOUR IT CONTROLS: permitted item types in the final examination bank. ASSESSMENT_REQUIREMENTS.trueFalsePermitted is false because of this sentence. The prohibition is stated for the examination; extending it to the formative quiz bank is a StateCourse choice and is recorded as one in the rule lock.",
    }),
    Object.freeze({
      section: "535.62(b)(8)(C)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-final-exam-versions"],
      note: "NO VERSION MAY REPEAT MORE THAN ONE THIRD OF THE QUESTIONS FROM OTHER VERSIONS. THE BEHAVIOUR IT CONTROLS: overlap between the four forms. ASSESSMENT_REQUIREMENTS.maxCrossVersionOverlapFraction is the rule's one third. WHAT THE RULE DOES NOT SETTLE: whether the cap is measured pairwise or against the union of all other versions — the union reading is much stricter. Whichever a build adopts is a StateCourse interpretation and must be labelled as one; the rule lock records the ambiguity rather than resolving it.",
    }),
    Object.freeze({
      section: "535.62(b)(8)(D)(i)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-final-exam-versions"],
      note: "FOR ALL QUALIFYING COURSES OTHER THAN A REAL ESTATE MATH COURSE: at least two questions per credit course hour in each version. THE NUMBER IT CONTROLS: 30 x 2 = 60 questions per version. ASSESSMENT_REQUIREMENTS.minQuestionsPerExamVersion.",
    }),
    Object.freeze({
      section: "535.62(b)(8)(D)(ii)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-final-exam-bank"],
      note: "FOR ALL QUALIFYING COURSES OTHER THAN A REAL ESTATE MATH COURSE: the examination draws from a question bank of at least four questions per credit course hour. THE NUMBER IT CONTROLS: 30 x 4 = 120 bank items. ASSESSMENT_REQUIREMENTS.minExamBankQuestions. The bank floor is a floor: four 60-question versions capped at one-third overlap need substantially more than 120 distinct items if the cap is read against the union of the other versions.",
    }),
    Object.freeze({
      section: "535.62(b)(8)(E)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: [],
      note: "NOT APPLICABLE, AND REGISTERED FOR THAT REASON. Real estate math courses take 20 questions from a bank of 40. Law of Agency is not a real estate math course, so the governing figures are (D)'s 60 and 120. Recorded so that the numbers this course builds to are visibly the result of choosing between two stated alternatives rather than an unexplained pair of figures.",
    }),
    Object.freeze({
      section: "535.62(g)(1)-(2)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["config/texas/trec-rules-source-lock.mjs SUBMISSION_READINESS"],
      note: "A qualifying provider shall not offer qualifying education courses until it has received WRITTEN NOTICE OF APPROVAL from the Commission, and a qualifying course expires four years from approval. THE BEHAVIOUR IT CONTROLS: enrolment. StateCourse holds no such notice, which is why SUBMISSION_READINESS keeps enrollmentPermitted and texasCreditAvailable false in code rather than in prose.",
    }),
    Object.freeze({
      section: "535.62(b)(7) and (b)(8) — the rule's own cross-reference discrepancy",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: [],
      note: "RECORDED BECAUSE IT AFFECTS HOW THIS COURSE CITES ITS OWN REQUIREMENTS. § 535.65(h)(4) requires rotation of 'all versions of the examination required by § 535.62(b)(7)', but in both held copies the four-versions requirement is (b)(8); (b)(7) is the comprehension-assessment paragraph. § 535.65(i)(2) cites (b)(8) for the same examination. Both held copies — TREC's and the Secretary of State's — carry the discrepancy in identical words, so it is the rule's, not a transcription artefact. This register cites each requirement by the number it carries in the held text and does not decide which the Commission intends; the codified text, which would settle it, has not been read.",
    }),
  ],
});

const TAC_535_63 = trecRule({
  section: "22 TAC §535.63",
  heading: "Qualifications for Instructors of Qualifying Courses",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.63.txt",
  sha256: "ac9a7c94371acffc8938f43203d7d18ec74f0c75e53bba992b8a4e8777c686a4", bytes: 1368, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "CONTROLLING FOR THE INSTRUCTOR DOSSIER. Instructor qualification is a condition of course approval under § 535.62 and of lawful operation under § 535.65(b)(1); no LOA-1 unit teaches it. It is registered now because the course must name a qualified instructor before an examination can be graded — § 535.65(g)(2)(D) makes a qualified instructor responsible for the answers and rationale behind the grading of the course work.",
  codifiedTextCompared: false,
  subsectionIdentifierBasis: "held-page-nesting",
  reliedOnByArtifacts: ["texas/submission/instructor-qualification-dossier-checklist.md", "planned:loa-instructor-dossier"],
  sectionsRead: [
    Object.freeze({
      section: "535.63(a)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/instructor-qualification-dossier-checklist.md"],
      note: "A provider must ensure that an instructor who teaches real estate, easement or right-of-way, or real estate inspection qualifying courses is COMPETENT IN THE SUBJECT MATTER to be taught and HAS THE ABILITY TO TEACH EFFECTIVELY. THE ARTEFACT IT CONTROLS: the qualification determination the dossier records. The duty is the provider's; the rule creates no Commission-issued instructor credential and this project does not claim one.",
    }),
    Object.freeze({
      section: "535.63(b)(1)-(3)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/instructor-qualification-dossier-checklist.md", "planned:loa-instructor-dossier"],
      note: "THE THREE ROUTES, one of which a named instructor must satisfy: (1) a college degree in the subject area to be taught and three years of experience in teaching or training; (2) five years of active experience as a licence holder — broker for Real Estate Brokerage and Broker Responsibility courses — and three years of experience in teaching or training; or (3) the equivalent of (b)(1) or (2) as determined by the provider after considering professional experience, research, authorship or other significant endeavours. The lettering is fixed by the rule's own words, which refer to 'the equivalent of subsection (b)(1) or (2) of this section'. THE ARTEFACT IT CONTROLS: the dossier's three routes, which the checklist currently marks UNVERIFIED on the basis that the rule could not be read. It can now be read: the held file is the text above.",
    }),
    Object.freeze({
      section: "535.63(c)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: [],
      note: "NOT APPLICABLE. Texas Standards of Practice and Inspector Legal and Ethics courses require five years of active Texas professional inspector licensure plus 200 inspections or three years of teaching or sponsoring experience. Law of Agency is not an inspector course. Registered so the scope of (b) is visible: (b) applies 'except as provided by subsection (c)', and (c) does not reach this course.",
    }),
    Object.freeze({
      section: "535.63 — what this rule does NOT contain",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: [],
      note: "THE GUEST-INSTRUCTOR 10% CAP IS NOT IN THIS RULE. The held § 535.63 does not mention guest instructors at all; the cap is § 535.65(b)(5) and is registered there. config/texas/trec-rules-source-lock.mjs carried it under § 535.63 until 2026-08-30 and now carries it under § 535.65(b)(5). Recorded rather than silently corrected, because a citation that does not survive opening the file is the defect this register exists to catch.",
    }),
  ],
});

const TAC_535_64 = trecRule({
  section: "22 TAC §535.64",
  heading: "Content Requirements for Qualifying Real Estate Courses",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.64.txt",
  sha256: "6e126cb931287ad9ce965f5d7889ff09d9fc44253e147fb1b5ca515ba08bf94f", bytes: 3225, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "Controlling for COMPLIANCE rather than curriculum: no unit teaches it and none needs to, but the course could not be built without it. It is the rule that adopts LOA-1 BY REFERENCE, which makes it the authority for the entire outline — and, through § 535.62(b)(8)(A), the rule that fixes which topics every final examination version must cover. reliedOnByUnits is therefore empty and reliedOnByArtifacts names what actually depends on it.",
  codifiedTextCompared: false,
  subsectionIdentifierBasis: "held-page-nesting",
  reliedOnByArtifacts: [
    "config/texas/law-of-agency-course-form.mjs",
    "config/texas/law-of-agency-statute-sources.mjs unitCoverage()",
    "planned:loa-final-exam-versions",
  ],
  sectionsRead: [
    Object.freeze({
      section: "535.64(a), third item in the mandatory list",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["config/texas/law-of-agency-course-form.mjs", "config/texas/law-of-agency-statute-sources.mjs unitCoverage()", "planned:loa-final-exam-versions"],
      note: "COMPLIANCE, NOT CURRICULUM. 'Law of Agency shall contain the topics and units outlined in the LOA-1, Qualifying Real Estate Course Approval Form, Law of Agency, hereby adopted by reference.' THE ARTEFACTS IT CONTROLS: the LOA-1 transcription, which is a compliance artefact and not an editorial choice because of this sentence; the 12-topic, 57-unit coverage measure this register reports; and — through § 535.62(b)(8)(A), which requires each examination version to cover 'each topic required by the Act or Rules for the specific course' — the topic list every final examination version must cover. The held page prints the mandatory courses without paragraph numbers, so Law of Agency is identified by its position in the (a) list. Occupations Code § 1101.301 confers the power and adopts nothing.",
    }),
    Object.freeze({
      section: "535.64(a), remaining mandatory courses",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["config/texas/regulatory-manifest.mjs PROGRAMS"],
      note: "COMPLIANCE, NOT CURRICULUM. PRINS 1-1, PRINS 2-1, LOC-0, PCF-0 and REF-0 are adopted by reference on the same terms, as is REB-1 for a broker's licence. Registered so that this course's outline is visibly one instance of a general adoption rather than a special arrangement.",
    }),
    Object.freeze({
      section: "535.64(c)",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: [],
      note: "All forms adopted by the section are available from the Commission at www.trec.texas.gov. The LOA-1 PDF this project transcribes was obtained there and is held at texas/trec-sources/LOA-1.pdf.",
    }),
  ],
});

const TAC_535_65 = trecRule({
  section: "22 TAC §535.65",
  heading: "Responsibilities and Operations of Providers of Qualifying Courses",
  url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
  localCopy: "texas/trec-sources/trec-rules/535.65.txt",
  sha256: "fbaeedb3904d6bac666948d58a523a3762ac639617d44df7db2cbbf79b2c65e7", bytes: 16135, retrievedOn: "2026-08-29",
  tier: "controlling",
  tierReason:
    "CONTROLLING FOR DELIVERY AND FOR EXAMINATION ADMINISTRATION. No LOA-1 unit teaches it. It fixes the passing score, the rotation duty, examination confidentiality, the conditions of administration, the subsequent-examination rules, the completion record and the four-year retention term — none of which appears anywhere in Occupations Code ch. 1101 or ch. 1103.",
  codifiedTextCompared: false,
  subsectionIdentifierBasis: "sos-published-proposed-text",
  reliedOnByArtifacts: [
    "texas/submission/distance-delivery-controls.md",
    "texas/submission/pre-enrollment-agreement.md",
    "texas/submission/instructor-qualification-dossier-checklist.md",
    "config/texas/law-of-agency-time-budget.mjs",
    "planned:loa-exam-engine",
    "planned:loa-final-exam-bank",
    "planned:loa-identity-verification",
    "planned:loa-completion-record",
    "planned:loa-student-records",
  ],
  sectionsRead: [
    Object.freeze({
      section: "535.65(a)(1)(A)-(I)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/distance-delivery-controls.md", "planned:loa-identity-verification"],
      note: "THE NINE PROVIDER RESPONSIBILITIES: (A) administration of each course, including compliance with any prescribed period of time for required course topics; (B) maintaining student attendance records and pre-enrollment agreements; (C) verifying instructor qualification, performance and attendance; (D) PROPER EXAMINATION ADMINISTRATION; (E) VALIDATION OF STUDENT IDENTITY ACCEPTABLE TO THE COMMISSION; (F) maintaining student course completion records; (G) advertising compliance; (H) no recruiting or soliciting during course presentation; (I) staff reasonably available for public inquiry. THE ARTEFACT IT CONTROLS: the delivery-control matrix, which cites (a)(1) subsection by subsection. (A) is also the provision that makes LOA-1's per-topic minutes an operating obligation and not merely a design input.",
    }),
    Object.freeze({
      section: "535.65(b)(1) and (b)(5)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/instructor-qualification-dossier-checklist.md", "planned:loa-instructor-dossier"],
      note: "(b)(1): a provider must use an instructor currently qualified under § 535.63 to teach the specified course. (b)(5): a provider MAY use a guest instructor who does not meet those qualifications provided that person instructs for NO MORE THAN 10% OF THE TOTAL COURSE TIME — for a 30-hour course, 3 hours. THE ARTEFACT IT CONTROLS: the instructor dossier and any use of a guest presenter in recorded instruction. This is where the 10% cap lives; it is not in § 535.63.",
    }),
    Object.freeze({
      section: "535.65(d)(1)(D)-(G)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/pre-enrollment-agreement.md"],
      note: "THE ASSESSMENT-RELEVANT CONTENTS OF THE PRE-ENROLLMENT AGREEMENT: (D) the attendance requirements; (E) acceptable makeup procedures including time limits and fees; (F) the procedure and fees, IF APPLICABLE, associated with EXAM PROCTORING; (G) the procedure and fees for any permitted makeup final examination or re-examination, including time limits. THE ARTEFACT IT CONTROLS: the pre-enrollment agreement. NOTE WHAT (F) DOES AND DOES NOT DO: it requires proctoring arrangements to be DISCLOSED if there are any; it does not require a proctor. No held provision requires a human proctor for a distance-education final examination.",
    }),
    Object.freeze({
      section: "535.65(f)(1)-(2)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/distance-delivery-controls.md"],
      note: "Before the course starts the provider must give each student copies of, or online access to, the course materials, and must keep them current and accurate as provided under § 535.62. THE BEHAVIOUR IT CONTROLS: when the twelve modules must be available to an enrolled student, and the duty to revise them when the law they teach changes.",
    }),
    Object.freeze({
      section: "535.65(g)(1)(B)-(D)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/distance-delivery-controls.md"],
      note: "CLASSROOM DELIVERY, recorded for scope rather than for use: identity verified at sign-up and each meeting; the student present for the hours credited; a 10-minute break per hour at least every two hours; no daily segment over 12 hours; a MONITOR in addition to the instructor where a classroom course delivered through technology has more than 20 registered students; and the makeup rules — two-thirds attendance to be eligible, staff approval, completion by the 90th day, automatic drop below two-thirds. This course is authored for distance delivery, so (g)(2) governs it; (g)(1) is registered so that the absence of a proctor or monitor requirement for distance delivery is visibly a reading of the rule rather than an omission.",
    }),
    Object.freeze({
      section: "535.65(g)(2)(A)-(D)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/distance-delivery-controls.md", "planned:loa-identity-verification", "planned:loa-progression-gate"],
      note: "DISTANCE EDUCATION DELIVERY — the four things the provider must ensure: (A) the student taking all topics and completing all quizzes and exercises is the student receiving credit, THROUGH A STUDENT IDENTITY VERIFICATION PROCESS ACCEPTABLE TO THE COMMISSION; (B) a qualified instructor is available to answer questions or assist in a timely manner; (C) the student has completed all instructional modules and attended any required live instruction; (D) A QUALIFIED INSTRUCTOR IS RESPONSIBLE FOR PROVIDING ANSWERS AND RATIONALE FOR THE GRADING OF THE COURSE WORK. THE ARTEFACTS THEY CONTROL: identity verification, the completion gate, and the rule that automated grading does not remove a named responsible instructor — which is why § 535.63 had to be registered before assessment authoring, not after.",
    }),
    Object.freeze({
      section: "535.65(g)(3)-(5)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["config/texas/law-of-agency-time-budget.mjs", "texas/tx-law-of-agency-30-v1/time-evidence.json"],
      note: "A provider need not present topics in the order outlined on the approval form; the periods of time prescribed to each UNIT of a topic are RECOMMENDATIONS and may be altered to meet students' needs; but ALL UNITS MUST BE PRESENTED WITHIN THE PRESCRIBED TOPIC. THE ARTEFACT IT CONTROLS: the time budget. This is the provision that makes LOA-1's TOPIC subtotals binding and its UNIT minutes advisory, which is exactly how the budget treats them — and it is also why a surplus in one topic may not cure a shortfall in another.",
    }),
    Object.freeze({
      section: "535.65(h)(1)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-exam-engine", "config/texas/trec-rules-source-lock.mjs SUBMISSION_READINESS"],
      note: "The final examination must be given IN THE MANNER SUBMITTED TO AND APPROVED BY THE COMMISSION. THE BEHAVIOUR IT CONTROLS: administration. There is no approved manner for this course, because there is no approval, so no examination may be administered — which is why the examination work now beginning is a BUILD and not a launch.",
    }),
    Object.freeze({
      section: "535.65(h)(2)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-final-exam-bank", "planned:loa-topic-quizzes"],
      note: "FINAL EXAMINATION QUESTIONS MUST BE KEPT CONFIDENTIAL AND BE SIGNIFICANTLY DIFFERENT FROM ANY QUIZ QUESTIONS AND EXERCISES USED IN THE COURSE. THE ARTEFACT IT CONTROLS: the boundary between the formative bank and the examination bank. No topic quiz item, misconception check or scenario may be promoted into the final examination, and no answer key may be published. 'Significantly different' is not quantified by the rule; any numeric similarity threshold a build adopts is a StateCourse policy choice and may not be presented as regulator-derived.",
    }),
    Object.freeze({
      section: "535.65(h)(3)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-exam-engine", "planned:loa-progression-gate"],
      note: "A provider shall not permit a student to VIEW OR TAKE a final examination before the completion of regular course work and any makeup sessions. THE BEHAVIOUR IT CONTROLS: examination eligibility. Combined with § 535.62(b)(7)(C)(i), the examination cannot be reached until every topic quiz is answered correctly and every scenario passed.",
    }),
    Object.freeze({
      section: "535.65(h)(4)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-exam-engine", "planned:loa-final-exam-versions"],
      note: "TWO REQUIREMENTS IN ONE SENTENCE: rotate all versions of the examination throughout the approval period in a manner acceptable to the Commission, AND require an UNWEIGHTED PASSING SCORE OF 70%. THE VALUES THEY CONTROL: ASSESSMENT_REQUIREMENTS.passingScorePercent = 70 and passingScoreWeighting = 'unweighted' — every item counts once, so a scorer that weights items is not permitted even though a blueprint that weights topics in item SELECTION is unaffected. The sentence's cross-reference to § 535.62(b)(7) is discussed in the § 535.62 record above.",
    }),
    Object.freeze({
      section: "535.65(h)(5)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-identity-verification", "planned:loa-exam-engine"],
      note: "A provider must administer the examination UNDER CONDITIONS THAT ENSURE THE STUDENT TAKING THE EXAMINATION IS THE STUDENT WHO REGISTERED FOR AND TOOK THE COURSE. THE BEHAVIOUR IT CONTROLS: what the examination session must establish. This is the closest the held rules come to a proctoring requirement and it is not one: it fixes the OUTCOME (identity assurance) and leaves the method to the provider, subject to (g)(2)(A)'s 'acceptable to the Commission'. Any proctoring decision this project makes is a provider choice to be disclosed under (d)(1)(F), not a rule requirement.",
    }),
    Object.freeze({
      section: "535.65(h)(6) and (i)(1)-(4)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-exam-engine"],
      note: "THE SUBSEQUENT EXAMINATION, in four operative parts: (i)(1) a subsequent final examination may be permitted ONLY AFTER the student has completed additional course work prescribed by the provider; (i)(2) it must be completed NO LATER THAN THE 90TH DAY after the date the original class concludes, must be A DIFFERENT VERSION of the original, and must comply with § 535.62(b)(8) and subsection (h) — so the second attempt is held to the same 60-question, topic-covering, no-true-false, 70%-unweighted standard as the first; (i)(3) failure to complete it in time drops the student from the course with no credit; (i)(4) with (h)(6), a student who fails a second time may not be given credit and must RETAKE THE COURSE and the examination. THE BEHAVIOUR IT CONTROLS: attempt accounting, version assignment on retake, the 90-day clock and the remediation gate. The CONTENT of the prescribed additional course work is left to the provider and is a StateCourse design choice.",
    }),
    Object.freeze({
      section: "535.65(j) — as held", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-completion-record"],
      note: "COURSE COMPLETION CERTIFICATE as the TREC-published text has it: on successful completion the provider shall issue a certificate carrying (A) the provider's name and approval number; (B) the instructor's name; (C) the course title; (D) course numbers; (E) the number of classroom credit hours; (F) the course delivery method; (G) the dates the student began and completed the course; and (H) the printed name and signature of an official of the provider on record with the Commission. The provider may withhold it until the student's financial obligations are met and must maintain security against forgery.",
    }),
    Object.freeze({
      section: "535.65(j) — as amended, adopted and not yet read",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-completion-record"],
      note: "THE ONE PLACE WHERE THE TWO HELD COPIES DIFFER, AND IT IS A DELIVERY REQUIREMENT OF THIS COURSE. The Secretary of State's 22 May 2026 publication of the proposal renames the subsection 'Course completion records' and replaces issuing a certificate to the student with SUBMITTING completion records TO THE COMMISSION using a process acceptable to it, NOT SOONER THAN THE NUMBER OF COURSE CREDIT HOURS HAS PASSED and NOT LATER THAN THE 10TH CALENDAR DAY after the date the course is completed; the record carries the student's name in place of the instructor's; and for qualifying courses completed ON OR AFTER 1 OCTOBER 2026 it must carry the student's Commission-issued licence number or, if none has issued, the application number, in place of the provider official's printed name and signature. TREC's own rule record gives adoption on 2026-08-10 and an effective date of 2026-08-31. THE TEXT HELD IS THE TEXT AS PROPOSED: the adoption notice publishes in the Texas Register issue of 28 August 2026, which returns 403 and has not been read. The 'not sooner than the number of course credit hours has passed' clause is the only held provision that imposes a MINIMUM ELAPSED TIME on a student's course, and it does so on the submission rather than on the student; it is recorded here so that an assessment build does not treat completion as instantaneous. See GAPS 'loa-535-65-j-adopted-text-not-read'.",
    }),
    Object.freeze({
      section: "535.65(k)(1)-(5)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["texas/submission/distance-delivery-controls.md"],
      note: "INSTRUCTOR AND COURSE EVALUATIONS: every student gets the form or a link to it, completable any time after course completion; the instructor may not be present or involved; the provider must use ALL of the questions from the Commission-approved evaluation form IN THE SAME ORDER and may only add its own questions after them; management comments are kept with the records; the forms are produced for inspection on request. THE BEHAVIOUR IT CONTROLS: the post-completion evaluation step, which is part of course delivery and not an optional courtesy. The Commission's approved evaluation form is not held.",
    }),
    Object.freeze({
      section: "535.65(l)(1)", ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["planned:loa-student-records", "planned:loa-completion-record"],
      note: "RECORD RETENTION: a provider shall maintain records of each student enrolled in a course FOR A MINIMUM OF FOUR YEARS following completion of the course, INCLUDING course and instructor evaluations and student enrollment agreements. THE VALUE IT CONTROLS: ASSESSMENT_REQUIREMENTS.studentRecordRetentionYears = 4. The rule itself states the term; it is not derived from the four-year provider approval period or from the fee schedule, and any note in this repository that derived it from those was reasoning from the wrong document. (l)(4) adds that records may be kept electronically provided they are in a common format, legible and easily printed or viewed without special software.",
    }),
  ],
});

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * THE SECRETARY OF STATE'S OWN PUBLICATION — the highest-tier Texas source this project has opened,
 * and still not the adopted text.
 * ──────────────────────────────────────────────────────────────────────────────────────────────── */

const SOS_TEXAS_REGISTER_2026_05_22 = register({
  id: "sos-texas-register-2026-05-22",
  citation: "Texas Register, issue of 22 May 2026 — Title 22 Examining Boards, Proposed Rules (TRD-202601975)",
  title: "Texas Register, 22 May 2026 — TREC's proposed amendments to 22 TAC §§ 535.62 and 535.65",
  jurisdiction: "texas",
  authority: "Texas Secretary of State",
  publisher: "Texas Secretary of State",
  sourceLayer: "sos.texas.gov texreg archive",
  url: "https://www.sos.texas.gov/texreg/archive/May222026/Proposed%20Rules/22.EXAMINING%20BOARDS.html",
  localCopy: "texas/trec-sources/texas-register/2026-05-22-title22-proposed-rules.html",
  sha256: "6c5c97f0c283133b306913198d6c86dacf553de1ac03de31017ea93bda62063b", bytes: 172495, retrievedOn: "2026-08-27",
  tier: "contextual",
  codifiedTextCompared: false,
  tierReason:
    "REGISTERED FOR EXACTLY TWO USES, AND NOT AS LAW. (1) It publishes §§ 535.62 and 535.65 in full WITH their subsection lettering, which TREC's own Rules page does not print; on 2026-08-30 the two copies were diffed paragraph by paragraph and are identical word for word except at § 535.62(i)(2) and § 535.65(j), so the lettering this register cites for those two rules is READ rather than inferred. (2) It carries the 2026 amendment to § 535.65(j) as PROPOSED, which TREC's rule record says was adopted on 2026-08-10 and takes effect on 2026-08-31. It is CONTEXTUAL and not controlling because a published proposal is not the adopted rule: the adoption notice publishes in the issue of 28 August 2026, which returns 403 and has not been read. No unit rests on it, no artefact implements the amendment, and it does nothing to clear TX_PROVIDER_RULE_SOURCE_LOCK.",
  reliedOnByArtifacts: [
    "config/texas/trec-rules-source-lock.mjs SUBSECTION_IDENTIFIER_SOURCE",
    "config/texas/law-of-agency-statute-sources.mjs TREC_RULE_SOURCES",
  ],
  sectionsRead: [
    Object.freeze({
      section: "§§ 535.62 and 535.65 as proposed — the subsection lettering",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: ["config/texas/trec-rules-source-lock.mjs SUBSECTION_IDENTIFIER_SOURCE"],
      note: "The proposal reproduces both rules with (a), (b)(7)(A), (b)(8)(D)(i) and the rest printed. The comparison against the TREC-published copies held at texas/trec-sources/trec-rules/ was mechanical — both reduced to ordered paragraphs, whitespace normalised, diffed — and returned 86 paragraphs each for § 535.62 and 132 against 127 for § 535.65, with the only differences at § 535.62(i)(2) and § 535.65(j). That is what allows the § 535.62 and § 535.65 records above to carry subsectionIdentifierBasis: 'sos-published-proposed-text' while §§ 535.55, 535.63 and 535.64 carry 'held-page-nesting'.",
    }),
    Object.freeze({
      section: "§ 535.65(j) as proposed",
      ownedByTopics: null, primaryUnits: [], pointerUnits: [],
      controls: [],
      note: "The completion-record amendment, recorded in the § 535.65 entry above and NOT implemented anywhere: submission of course completion records to the Commission not sooner than the number of course credit hours has passed and not later than the 10th calendar day after completion; the student's name in place of the instructor's; and the student's licence or application number for qualifying courses completed on or after 1 October 2026. Held as PROPOSED text. Nothing may be built as though this were the codified rule, and the gap 'loa-535-65-j-adopted-text-not-read' says so in the gap ledger.",
    }),
  ],
});

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * THE ADOPTED INSTRUMENT — held and identified, contributing no taught proposition.
 * ──────────────────────────────────────────────────────────────────────────────────────────────── */

const IABS_1_2 = adoptedForm({
  id: "trec-iabs-1-2-form",
  citation: "TREC No. IABS 1-2, Information About Brokerage Services",
  title: "Information About Brokerage Services (IABS 1-2)",
  documentNumber: "IABS 1-2",
  printedDate: "11-03-2025",
  pages: 1,
  url: "https://www.trec.texas.gov/forms/information-about-brokerage-services",
  localCopy: "texas/trec-sources/forms/IABS-1-2.pdf",
  sha256: "5056930b66d237a7a4376db0c43f833929600f0b6e5ce6e42a417da824ef6b20", bytes: 1491257, retrievedOn: "2026-08-30",
  tier: "identified-not-taught",
  /* The rule is the authority; the form is what the rule adopts. Recorded as a field, not prose,
     so a consumer of this register cannot read the form as if it were the controlling source. */
  adoptedBy: "22 TAC §531.20",
  controllingAuthority: ["22 TAC §531.20", "Tex. Occ. Code § 1101.558(b-1)"],
  tierReason:
    "The instrument 22 TAC § 531.20 adopts by reference. It is HELD and hashed, and it is not a source of anything this course teaches. The twelve modules were authored before the PDF was acquired and state in eight units that the form's text 'was not held for this course', teaching the notice through § 531.20 and Occupations Code § 1101.558(b-1) instead. Acquiring the file afterwards does not retroactively make it the source of a taught proposition, so reliedOnByUnits is empty and the units that NAME the form are recorded in identifiedByUnits. The controlling authority for every statement this course makes about the notice is the rule and the statute, never the form.",
  identifiedByUnits: ["T01U3", "T02U5", "T03U1", "T04U5", "T05U6", "T06U5", "T07U1", "T08U1"],
  sectionsRead: [
    Object.freeze({
      section: "whole form (1 page)",
      ownedByTopics: ["T02"],
      primaryUnits: [],
      pointerUnits: [],
      note: "Opened and read on acquisition to confirm identity and currency: the page is one page, bears the form number 'IABS 1-2' in its footer and the printed date 11-03-2025, and carries the 2026 material the rule and statute require — the broker's minimum duties, the WRITTEN AGREEMENTS ARE REQUIRED IN CERTAIN SITUATIONS paragraph pointing to Occupations Code § 1101.563, the four representation postures including intermediary, the showing-without-representation conditions, the 14-day non-exclusive limit on a showing-only agreement, and the license-holder contact block. NO PROPOSITION IN THE CURRICULUM RESTS ON THIS READING. It is recorded so the register can state what the held file is and is not, and so a later reviewer can tell that the form was verified rather than assumed.",
    }),
  ],
});

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * TREC GUIDANCE — official, explanatory, and never a substitute for the rule it explains.
 * ──────────────────────────────────────────────────────────────────────────────────────────────── */

const TREC_BUYER_REP_ARTICLE = guidance({
  manifestSourceId: "trec-buyer-rep-2026-article",
  url: "https://www.trec.texas.gov/article/what-changes-2026-about-buyertenant-representation-texas",
  localCopy: "texas/trec-sources/articles/what-changes-2026-buyer-tenant-representation.html",
  sha256: "dd987ceb2d972d8e54a245cdf30fe3344369e7666dfa1059f817da28db6fd3ae", bytes: 67348, retrievedOn: "2026-08-29",
  effectiveDate: "2026-01-01",
  tierReason:
    "Official explanatory material published by the regulator; not binding law. Six modules use it and every one of them labels it in the module text as guidance rather than controlling authority — T02U3 and T02U5 say so in bold. It is registered rather than ignored because it supplies operating detail the statute does not: the open-house application of §§ 1101.558, 1101.562 and 1101.563, the plain-words statement of what a representation agreement may limit, and the statement that subagency was narrowed rather than eliminated. It is registered as GUIDANCE, and the load-time invariant below refuses to let any unit rest on it alone.",
  reliedOnByArtifacts: ["config/texas/regulatory-manifest.mjs SOURCES trec-buyer-rep-2026-article"],
  sectionsRead: [
    Object.freeze({
      section: "the 2026 buyer/tenant representation changes",
      ownedByTopics: ["T05"],
      primaryUnits: ["T05U1", "T05U3", "T05U6"],
      pointerUnits: ["T01U3", "T02U3", "T02U5", "T03U4", "T04U4", "T12U2"],
      note: "Read in full. What the modules take from it, always attributed to the article and never presented as statutory text: that a written representation agreement can limit the services a broker will provide and that the agreement's required contents are those of Occupations Code § 1101.563; that the written-agreement requirement does not reach tenants, commercial buyers or land; the open-house application, under which a hosting agent from the listing broker's office need not give the IABS or enter a written agreement but must disclose owner representation under § 1101.558(b), while a hosting agent outside the listing brokerage who does not represent the seller must give the IABS and enter a § 1101.563(c) agreement before showing; and that two references to subagency were removed from TRELA, narrowing the circumstances in which it can arise, without eliminating subagency generally as a legal concept. Each of these units also cites the controlling statute or rule for the proposition it teaches; none rests on the article alone.",
    }),
  ],
});

const TREC_CONTRACTS_PAGE = guidance({
  manifestSourceId: "trec-contracts-page-2026-08-29",
  url: "https://www.trec.texas.gov/agency-information/contracts",
  localCopy: "texas/trec-sources/articles/trec-contracts-page-2026-08-29.html",
  sha256: "8d07003825e46a4e0b617363641ac3aa75bd44ff61135aa18c7e0210bfa16d71", bytes: 107120, retrievedOn: "2026-08-29",
  effectiveDate: null,
  tierReason:
    "The agency's own listing of the contract and addendum forms it promulgates. T05U1 uses it for a single negative proposition — that the Commission does not supply a buyer representation agreement form — which is a statement about what the listing contains, not a rule of law. Guidance tier: 22 TAC § 537.11 and Occupations Code § 1101.155 remain the controlling authority for which forms a license holder must use.",
  reliedOnByArtifacts: ["config/texas/pcf-current-forms-inventory.mjs"],
  sectionsRead: [
    Object.freeze({
      section: "current contract and addendum forms listing",
      ownedByTopics: ["T05"],
      primaryUnits: ["T05U1"],
      pointerUnits: [],
      note: "Read for T05U1 to establish that no buyer representation agreement appears among the forms TREC promulgates, which is why the unit teaches the § 1101.563(c) content requirements and leaves the choice of form to the broker. Nothing about a promulgated contract's terms is taken from the page; the mandatory-use rule is 22 TAC § 537.11.",
    }),
  ],
});

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * THE REGISTER
 * ──────────────────────────────────────────────────────────────────────────────────────────────── */

export const STATUTE_CHAPTERS = Object.freeze([OC_1101, PR_5, PR_301, BC_17, BC_26, CP_16, ES_101, LA_21, LA_201]);

export const FEDERAL_SOURCES = Object.freeze([US26_3508, US42_3602, US42_3603, US42_3604, US42_3606]);

/** 22 TAC, in section order: chapter 531 (canons and notices), 535 (conduct), 537 (forms). */
export const TREC_RULE_SOURCES = Object.freeze([
  TAC_531_1, TAC_531_2, TAC_531_3, TAC_531_4, TAC_531_18, TAC_531_19, TAC_531_20,
  TAC_535_1, TAC_535_2, TAC_535_3, TAC_535_4, TAC_535_5,
  TAC_535_16, TAC_535_17, TAC_535_20, TAC_535_21, TAC_535_35,
  TAC_535_55, TAC_535_62, TAC_535_63, TAC_535_64, TAC_535_65,
  TAC_535_131, TAC_535_141, TAC_535_144, TAC_535_145, TAC_535_146, TAC_535_147, TAC_535_148, TAC_535_149,
  TAC_535_153, TAC_535_154, TAC_535_155, TAC_535_156, TAC_535_157, TAC_535_191,
  TAC_537_11,
]);

/** Instruments a rule adopts by reference and the course holds. */
export const ADOPTED_INSTRUMENTS = Object.freeze([IABS_1_2]);

/** Regulator-published explanatory material. */
export const GUIDANCE_SOURCES = Object.freeze([TREC_BUYER_REP_ARTICLE, TREC_CONTRACTS_PAGE]);

/** The Secretary of State's own publication — held, hashed, and not the adopted text. */
export const SECRETARY_OF_STATE_SOURCES = Object.freeze([SOS_TEXAS_REGISTER_2026_05_22]);

export const ALL_SOURCES = Object.freeze([
  ...STATUTE_CHAPTERS,
  ...FEDERAL_SOURCES,
  ...TREC_RULE_SOURCES,
  ...ADOPTED_INSTRUMENTS,
  ...GUIDANCE_SOURCES,
  ...SECRETARY_OF_STATE_SOURCES,
]);

/**
 * Units that need no legal source, and why.
 *
 * THIS ARRAY IS EMPTY, AND THAT IS A FINDING RATHER THAN AN OVERSIGHT. Every one of LOA-1's 57
 * units cites held authority: the claim audit resolves at least one citation inside every unit
 * heading in all twelve modules, which is what unitCoverage() measures. Law of Agency has no
 * arithmetic unit and no vocabulary-only unit of the kind Principles II had to excuse — LOA-1's
 * units are all about what the law requires of a license holder. The array exists, is exported, and
 * is checked by the same invariant as every other register, so that if a future unit ever does need
 * excusing it must be named here with a reason rather than quietly dropping out of coverage.
 */
export const NO_STATUTE_REQUIRED = Object.freeze([]);

/**
 * The honest counterpart to the register: what the course had to teach around.
 *
 * `gapTier` says what kind of hole each one is:
 *   "controlling"           — a binding source the course RELIES ON but does not hold. This category
 *                             must be, and is, EMPTY, and a load-time invariant below throws if it
 *                             ever is not. Naming a source in order to say the course does not teach
 *                             it is not reliance.
 *   "guidance"              — explanatory material that would have helped and was not held.
 *   "identified-not-taught" — the course names the thing, states that it was not held, and teaches
 *                             nothing from it. Every entry below is of this kind, and every one is
 *                             traceable to a "was not held" sentence in the curriculum, which the
 *                             claim audit is built to classify.
 *
 * `affectedUnits` names a unit only where the curriculum's own "was not held" sentence sits inside
 * that unit. Where a statement sits in a module's front matter it is recorded at topic level in the
 * text of the gap rather than attributed to a unit by inference.
 */
export const GAPS = Object.freeze([
  Object.freeze({
    id: "common-law-agency-formation-not-held",
    gapTier: "identified-not-taught",
    gap: "No Texas case law is held for this repository, so the common-law doctrines by which an agency can be formed — ratification, estoppel, and apparent authority — are named and expressly not taught. T01U1, T02U1 and T07U1 each say so in the module text. What the course teaches instead is the statutory and rule-based route: Occupations Code §§ 1101.557 and 1101.558, and the writing requirements of §§ 1101.806 and 1101.563 with Business and Commerce Code § 26.01.",
    affectedUnits: ["T01U1", "T02U1", "T05U6", "T07U1", "T07U3"],
  }),
  Object.freeze({
    id: "common-law-agency-termination-not-held",
    gapTier: "identified-not-taught",
    gap: "The common-law grounds on which an agency ends — death or incapacity of a principal, destruction of the subject matter, expiry of a reasonable time, and agency coupled with an interest — were not held. T01U4 and T07U2 name each and state that none is taught as Texas law. What is held and taught is Occupations Code § 1101.367 (sponsorship termination), §§ 1101.366, 1101.454 and 1101.455 (licence status), and Estates Code §§ 101.001, 101.003 and 101.051 for what happens to the property on death.",
    affectedUnits: ["T01U4", "T07U2", "T07U3"],
  }),
  Object.freeze({
    id: "common-law-subagency-not-held",
    gapTier: "identified-not-taught",
    gap: "The common-law doctrine of subagency was not held. The 89th Legislature removed two references to subagency from TRELA effective 2026-01-01 and the repealed text is not preserved in the held copy, so the word 'subagent' now appears NOWHERE in Occupations Code ch. 1101 as held — not in the § 1101.551 definitions and not in § 1101.805. T01U3, T04U4 and T05U3 say so. What the course teaches instead is the representation postures the statute does define (§§ 1101.557, 1101.559-.561 and 1101.562) and TREC's own guidance statement that subagency was narrowed rather than eliminated generally as a legal concept.",
    affectedUnits: ["T01U3", "T04U4"],
  }),
  Object.freeze({
    id: "procuring-cause-not-held",
    gapTier: "identified-not-taught",
    gap: "Procuring-cause doctrine was not held and is not taught. T04U5 states this expressly and teaches the written-agreement route to a commission under Occupations Code § 1101.806 and Business and Commerce Code § 26.01 instead.",
    affectedUnits: ["T04U5"],
  }),
  Object.freeze({
    id: "common-law-fraud-and-misrepresentation-elements-not-held",
    gapTier: "identified-not-taught",
    gap: "The common-law elements of fraud, and the usual formulations of negligent and innocent misrepresentation, were not held. T11U1 says so in terms and warns against papering over it. What is held is the statutory ladder that replaces them for this course: Business and Commerce Code §§ 17.45, 17.46 and 17.50, Occupations Code §§ 1101.652(b)(2)-(3) and 1101.805, and 22 TAC §§ 531.3, 535.145 and 535.156.",
    affectedUnits: ["T11U1", "T11U5"],
  }),
  Object.freeze({
    id: "common-law-employment-status-and-vicarious-liability-not-held",
    gapTier: "identified-not-taught",
    gap: "No held source decides common-law employment status, vicarious liability, or wage-and-hour treatment for a Texas sales agent, and T09U1 and T09U6 say so. The two exclusions the course does teach are each confined to their own statute: Labor Code § 201.072 to unemployment compensation, and 26 U.S.C. § 3508 to federal tax. Whether a sales agent is an 'employee' under Labor Code ch. 21 depends on case law that was not held.",
    affectedUnits: ["T09U1", "T09U6"],
  }),
  Object.freeze({
    id: "irs-and-twc-administrative-material-not-held",
    gapTier: "identified-not-taught",
    gap: "Neither Labor Code § 201.072 nor 26 U.S.C. § 3508 defines 'substantially all', and no Treasury regulation, Internal Revenue Service guidance or Texas Workforce Commission rule under either was held. T09U1 states this plainly rather than supplying a percentage, and no figure appears in the module.",
    affectedUnits: ["T09U1", "T09U2", "T09U6"],
  }),
  Object.freeze({
    id: "six-named-fiduciary-duties-not-a-texas-source",
    gapTier: "identified-not-taught",
    gap: "No held Texas statute or Commission rule enumerates six fiduciary duties under the familiar names. T02U4 says so and teaches what Texas actually has: Occupations Code § 1101.557, 22 TAC §§ 531.2, 535.156 and 535.157, and the disclosure duties in §§ 1101.556 and 1101.558.",
    affectedUnits: ["T02U4"],
  }),
  Object.freeze({
    id: "confidentiality-duration-not-fixed-by-any-held-source",
    gapTier: "identified-not-taught",
    gap: "No held source fixes how long the duty of confidentiality lasts after an agency terminates, and no held source states a stand-alone confidentiality obligation in those words. T02U4 and T07U3 both say a period was not held, and neither states one.",
    affectedUnits: ["T02U4", "T07U3"],
  }),
  Object.freeze({
    id: "agency-classification-terms-not-defined-by-any-held-source",
    gapTier: "identified-not-taught",
    gap: "T02U3 states that no held Texas statute or Commission rule defines the three classification terms it discusses, and teaches the statutory postures instead — representation under § 1101.557, intermediary under §§ 1101.559-.561, and showing without representation under § 1101.562.",
    affectedUnits: ["T02U3"],
  }),
  Object.freeze({
    id: "trec-form-cn-1-5-text-not-held",
    gapTier: "identified-not-taught",
    gap: "22 TAC § 531.18 adopts the Consumer Protection Notice, TREC No. CN 1-5, by reference. The text of CN 1-5 was not held. T08U1 and T08U2 say so and teach the rule — who must provide the notice, by displaying it in each place of business and linking to it on each business website, with the prescribed labels and font sizes — rather than reciting the form. T02U5 makes the same statement about the same form.",
    affectedUnits: ["T02U5", "T08U1", "T08U2"],
  }),
  Object.freeze({
    id: "iabs-1-2-form-text-held-after-authoring",
    gapTier: "identified-not-taught",
    gap: "RECORDED AS RESOLVED-AS-TO-HOLDING, AND NOT AS TO TEACHING. Eight units state that the text of TREC No. IABS 1-2 'was not held for this course', which was true when the modules were written; the PDF has since been acquired and is registered above at tier identified-not-taught, hashed and verified. Nothing in the curriculum was changed on the strength of it and nothing may be: the units still teach the notice through 22 TAC § 531.20 and Occupations Code § 1101.558(b-1), which is the correct authority in any event. The gap that remains is the one that always mattered — no unit takes a proposition from the form's own text.",
    affectedUnits: ["T01U3", "T02U5", "T03U1", "T04U5", "T05U6", "T06U5", "T07U1", "T08U1"],
  }),
  Object.freeze({
    id: "property-code-ch-27-not-held",
    gapTier: "identified-not-taught",
    gap: "Property Code ch. 27, the Residential Construction Liability Act, was not held. T11U2 says so and states nothing about how it interacts with a DTPA claim on a residential construction defect.",
    affectedUnits: ["T11U2"],
  }),
  Object.freeze({
    id: "property-code-301-045-named-and-not-held",
    gapTier: "identified-not-taught",
    gap: "T10U2 names a section numbered Property Code § 301.045 and states that it was not held for this course and is not taught. The held copy of ch. 301 contains no section with that number, and the mechanical claim audit records this as its single IDENTIFIED_NOT_TAUGHT row. No proposition rests on it.",
    affectedUnits: ["T10U2"],
  }),
  Object.freeze({
    id: "stigmatised-property-homicide-disclosure-not-held",
    gapTier: "identified-not-taught",
    gap: "No held source states what Texas law requires or does not require about disclosing a homicide at a property. T03U6 says so and teaches only what Occupations Code §§ 1101.556 and 1101.802 provide. Those two sections reach exactly two things: AIDS, an HIV-related illness or an HIV infection of a previous or current occupant, and a death on the property by natural causes, suicide or accident UNRELATED TO THE CONDITION OF THE PROPERTY. A homicide is none of those, so the statute says nothing about it and neither does the course.",
    affectedUnits: ["T03U6"],
  }),
  Object.freeze({
    id: "intermediary-legislative-history-not-held",
    gapTier: "identified-not-taught",
    gap: "The 1990s amendments to the former Real Estate License Act that introduced intermediary brokerage were not held. T06U1 names them and teaches the current text of §§ 1101.559-.561 and § 1101.651(d) rather than a history of how it got there.",
    affectedUnits: ["T06U1"],
  }),
  Object.freeze({
    id: "loa-535-65-j-adopted-text-not-read",
    gapTier: "identified-not-taught",
    gap: "22 TAC § 535.65(j) — the course completion record — was amended in 2026, and the ADOPTED text has not been read. TREC's own rule record gives adoption on 2026-08-10 and an effective date of 2026-08-31; the text held for it is the text AS PROPOSED in the Secretary of State's Texas Register of 22 May 2026, because the adoption notice publishes in the issue of 28 August 2026, which returns 403. This is the single place where the two held copies of § 535.65 disagree, and it matters for delivery: as proposed, the provider must SUBMIT completion records to the Commission not sooner than the number of course credit hours has passed and not later than the 10th calendar day after completion, must carry the student's name rather than the instructor's, and must carry the student's licence or application number for courses completed on or after 1 October 2026. Both readings are registered against § 535.65(j) above and neither is implemented; no completion record exists for this course. Reading the adopted text is a HUMAN item — see texas/submission/human-export-list.md.",
    affectedUnits: [],
  }),
  Object.freeze({
    id: "commission-evaluation-form-not-held",
    gapTier: "identified-not-taught",
    gap: "22 TAC § 535.65(k)(3) requires a provider evaluating an instructor or course to use ALL of the questions from the evaluation form APPROVED BY THE COMMISSION, in the same order as listed on that form, adding any of its own only after them. The Commission's approved evaluation form is not held for this course, so the questions it prescribes are named as a requirement and not reproduced. No evaluation instrument may be built as if its wording were known.",
    affectedUnits: [],
  }),
  Object.freeze({
    id: "codified-22-tac-text-not-read",
    gapTier: "identified-not-taught",
    gap: "All 37 administrative rules registered above are the section text TREC publishes on its own consolidated Rules page. For two of them, §§ 535.62 and 535.65, a higher-tier copy has also been opened — the Secretary of State's Texas Register of 22 May 2026 publishes the proposal in full with its subsection lettering — but that is the text AS PROPOSED and not the adopted rule either. The Secretary of State's CODIFIED 22 TAC text could not be opened from this environment: texas-sos.appianportalsgov.com serves a JavaScript shell to a non-browser client and the legacy texreg reader redirects to it. Every rule entry carries codifiedTextCompared: false. The regulator's own published statement of its rules is evidence, and it is not the adopted text; nothing here may be cited to a student as the Secretary of State's codified rule, and the provider-rule lock in config/texas/regulatory-manifest.mjs continues to FAIL on this ground rather than being reinterpreted around it.",
    affectedUnits: [],
  }),
  Object.freeze({
    id: "trade-association-codes-of-ethics-not-held",
    gapTier: "identified-not-taught",
    gap: "T10U4 is titled 'Professional Codes of Ethics'. No private trade association's code of ethics is held for this course, and none is quoted. What the unit teaches is what Texas law supplies about such bodies: 22 TAC § 535.1's definition of a trade association as a body that subscribes to a written code of professional conduct or ethics, Occupations Code § 1101.053's exclusion of trade association officers from the Commission, and the Commission's own ethical rules in 22 TAC §§ 531.1-531.4 and 531.19. A private code is not law, so its absence is not a controlling gap.",
    affectedUnits: ["T10U4"],
  }),
]);

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * INVARIANTS — asserted at import, so a later edit cannot quietly break them.
 * ──────────────────────────────────────────────────────────────────────────────────────────────── */

export const SECTIONS_READ = Object.freeze(
  ALL_SOURCES.flatMap((entry) =>
    entry.sectionsRead.map((section) =>
      Object.freeze({ ...section, sourceId: entry.id, jurisdiction: entry.jurisdiction, tier: entry.tier, citation: entry.citation }),
    ),
  ),
);

/**
 * THE COURSE-GOVERNING LAYER, INVERTED: artefact -> the rule subsections that control it.
 *
 * SECTIONS_READ above answers "what did this rule govern?". This answers the question an assessment
 * author actually asks — "what governs the thing I am about to build?" — and it is derived from the
 * same records rather than written twice: every entry comes from a `controls` list on a registered
 * read record, so a control cannot be claimed here without a rule subsection behind it.
 *
 * An artefact id is either a REPOSITORY PATH, in which case the file must exist on disk and a
 * load-time invariant below checks that it does, or it begins with "planned:", which says in one
 * word that the artefact does not exist yet. Assessment authoring starts now; most of the exam-side
 * ids are planned, and none of them may be described as built until the id becomes a path.
 */
export const ASSESSMENT_AND_DELIVERY_CONTROLS = Object.freeze(
  (() => {
    const byArtifact = new Map();
    for (const entry of ALL_SOURCES) {
      for (const section of entry.sectionsRead) {
        for (const artifact of section.controls ?? []) {
          if (!byArtifact.has(artifact)) byArtifact.set(artifact, []);
          byArtifact.get(artifact).push(Object.freeze({ rule: entry.citation, subsection: section.section, requirement: section.note }));
        }
      }
    }
    return [...byArtifact.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([artifact, controlledBy]) =>
        Object.freeze({
          artifact,
          exists: !artifact.startsWith("planned:"),
          controlledBy: Object.freeze(controlledBy),
        }),
      );
  })(),
);

/** Every LOA-1 unit either has a source read for it or is named as needing none. */
export function unitCoverage(allUnitCodes = LOA_UNITS) {
  const held = new Set(ALL_SOURCES.flatMap((entry) => entry.reliedOnByUnits));
  const excused = new Set(NO_STATUTE_REQUIRED.map((entry) => entry.unit));
  return Object.freeze({
    held: Object.freeze(allUnitCodes.filter((code) => held.has(code))),
    excused: Object.freeze(allUnitCodes.filter((code) => !held.has(code) && excused.has(code))),
    uncovered: Object.freeze(allUnitCodes.filter((code) => !held.has(code) && !excused.has(code))),
  });
}

{
  /* 1. The form this register measures against is LOA-1 itself, not a transcription of it. */
  if (TOPICS.length !== 12) {
    throw new Error(`law-of-agency-statute-sources: LOA-1 has 12 topics; the course form supplies ${TOPICS.length}`);
  }
  if (LOA_UNITS.length !== 57 || new Set(LOA_UNITS).size !== 57) {
    throw new Error(`law-of-agency-statute-sources: LOA-1 has 57 distinct units; the course form supplies ${LOA_UNITS.length}`);
  }

  /* 2. Structural sanity of the register itself. */
  const ids = ALL_SOURCES.map((entry) => entry.id);
  const duplicate = ids.find((id, index) => ids.indexOf(id) !== index);
  if (duplicate) throw new Error(`law-of-agency-statute-sources: duplicate source id '${duplicate}'`);
  const untiered = ALL_SOURCES.filter((entry) => !SOURCE_TIERS.includes(entry.tier));
  if (untiered.length) throw new Error(`law-of-agency-statute-sources: source(s) without a valid tier: ${untiered.map((e) => e.id).join(", ")}`);
  const unhashed = ALL_SOURCES.filter((entry) => !entry.localCopy || !entry.sha256 || !entry.bytes);
  if (unhashed.length) throw new Error(`law-of-agency-statute-sources: source(s) registered without a local copy, hash or byte count: ${unhashed.map((e) => e.id).join(", ")}`);
  const strayUnit = SECTIONS_READ.flatMap((section) => [...section.primaryUnits, ...section.pointerUnits]).find((code) => !UNIT_ORDER.has(code));
  if (strayUnit) throw new Error(`law-of-agency-statute-sources: read record names '${strayUnit}', which is not an LOA-1 unit code`);

  /* 3. Every hash must be recomputable from disk, here and now — not only when someone runs the
        report. A register whose files have moved or changed is wrong the moment it is imported. */
  const unrecomputable = [];
  for (const entry of ALL_SOURCES) {
    const path = join(REPO_ROOT, entry.localCopy);
    try {
      const bytes = statSync(path).size;
      const sha256 = createHash("sha256").update(readFileSync(path)).digest("hex");
      if (sha256 !== entry.sha256 || bytes !== entry.bytes) unrecomputable.push(`${entry.id} (${entry.localCopy}: recorded ${entry.sha256}/${entry.bytes}, disk ${sha256}/${bytes})`);
    } catch (error) {
      unrecomputable.push(`${entry.id} (${entry.localCopy}: ${error.message})`);
    }
  }
  if (unrecomputable.length) {
    throw new Error(`law-of-agency-statute-sources: hash could not be recomputed from disk for ${unrecomputable.length} source(s): ${unrecomputable.join("; ")}`);
  }

  /* 4. Where config/texas/trec-rules-source-lock.mjs also holds a rule, the two must agree. Two
        registers carrying different hashes for one file is worse than one register. */
  for (const entry of TREC_RULE_SOURCES) {
    const locked = TREC_RULES.find((rule) => rule.section === entry.section);
    if (!locked) continue;
    if (locked.localCopy !== entry.localCopy || locked.sha256 !== entry.sha256 || locked.bytes !== entry.bytes) {
      throw new Error(`law-of-agency-statute-sources: ${entry.section} disagrees with trec-rules-source-lock (lock ${locked.localCopy}/${locked.sha256}/${locked.bytes})`);
    }
  }

  /* 4b. The Secretary of State capture is also carried by the regulatory manifest. Same file, same
        hash, or one of the two is wrong. */
  for (const entry of SECRETARY_OF_STATE_SOURCES) {
    const manifest = REGULATORY_SOURCES.find((source) => source.id === entry.id);
    if (!manifest) throw new Error(`law-of-agency-statute-sources: '${entry.id}' is not in regulatory-manifest SOURCES`);
    if (manifest.localCopy !== entry.localCopy || manifest.sha256 !== entry.sha256 || (manifest.bytes && manifest.bytes !== entry.bytes)) {
      throw new Error(`law-of-agency-statute-sources: ${entry.id} disagrees with regulatory-manifest (manifest ${manifest.localCopy}/${manifest.sha256}/${manifest.bytes})`);
    }
  }

  /* 5. Coverage. Every LOA-1 unit is sourced or excused, and no unit rests on guidance alone —
        official explanatory guidance may explain controlling law but may not replace it. */
  const coverage = unitCoverage();
  if (coverage.uncovered.length) {
    throw new Error(
      `law-of-agency-statute-sources: ${coverage.uncovered.length} LOA-1 unit(s) neither sourced nor excused: ${coverage.uncovered.join(", ")}. ` +
        "Register the source that unit relies on, or name the unit in NO_STATUTE_REQUIRED with the reason it needs none.",
    );
  }
  if (coverage.held.length + coverage.excused.length !== 57) {
    throw new Error(`law-of-agency-statute-sources: coverage accounts for ${coverage.held.length + coverage.excused.length} units, not 57`);
  }
  const bindingUnits = new Set(ALL_SOURCES.filter((entry) => entry.tier === "controlling").flatMap((entry) => entry.reliedOnByUnits));
  const guidanceOnly = coverage.held.filter((code) => !bindingUnits.has(code));
  if (guidanceOnly.length) {
    throw new Error(
      `law-of-agency-statute-sources: unit(s) supported only by non-controlling sources: ${guidanceOnly.join(", ")}. ` +
        "Official explanatory guidance may explain controlling law; it may not replace it.",
    );
  }

  /* 7. Every artefact a rule is registered as controlling is either a file that exists on disk or
        is explicitly marked "planned:". A control record pointing at nothing is a claim, not a
        record — and an artefact quietly renamed out from under a rule is exactly the drift this
        register is supposed to catch. */
  const danglingControls = [];
  for (const record of ASSESSMENT_AND_DELIVERY_CONTROLS) {
    if (!record.exists) continue;
    const [file] = record.artifact.split(" ");
    try {
      statSync(join(REPO_ROOT, file));
    } catch {
      danglingControls.push(record.artifact);
    }
  }
  if (danglingControls.length) {
    throw new Error(
      `law-of-agency-statute-sources: rule(s) registered as controlling artefact(s) that do not exist: ${danglingControls.join(", ")}. ` +
        'Correct the path, or mark the artefact "planned:" if it has not been built yet.',
    );
  }

  /* 6. Gaps. */
  const invalid = GAPS.filter((entry) => !GAP_TIERS.includes(entry.gapTier));
  if (invalid.length) throw new Error(`law-of-agency-statute-sources: gap(s) without a valid gapTier: ${invalid.map((e) => e.id).join(", ")}`);
  const controllingGaps = GAPS.filter((entry) => entry.gapTier === "controlling");
  if (controllingGaps.length) {
    throw new Error(
      `law-of-agency-statute-sources: a controlling source the course relies on is not held: ${controllingGaps.map((e) => e.id).join(", ")}. ` +
        "Hold and register the source, or establish that the course does not rely on it.",
    );
  }
}

/**
 * The register proving itself. Every registered source's sha256 and byte count are recomputed from
 * the file on disk; a source whose file is missing, whose hash differs or whose size differs is
 * reported in `hashMismatches` with what was expected and what was found. `hashesVerified` counts
 * only the sources that matched on both hash and size.
 *
 * This is deliberately a hard read of every file rather than a cached digest: the whole point of the
 * register is that it can be re-run and either agrees with the disk or says exactly where it does not.
 */
export function sourceValidation(unitCodes = LOA_UNITS) {
  const byTier = Object.fromEntries(SOURCE_TIERS.map((tier) => [tier, 0]));
  const hashMismatches = [];
  let hashesVerified = 0;
  let bytesVerified = 0;

  for (const entry of ALL_SOURCES) {
    byTier[entry.tier] += 1;
    const path = join(REPO_ROOT, entry.localCopy);
    let bytesOnDisk = null;
    let sha256OnDisk = null;
    try {
      bytesOnDisk = statSync(path).size;
      sha256OnDisk = createHash("sha256").update(readFileSync(path)).digest("hex");
    } catch (error) {
      hashMismatches.push(Object.freeze({ id: entry.id, localCopy: entry.localCopy, problem: "unreadable", detail: error.message }));
      continue;
    }
    const hashOk = sha256OnDisk === entry.sha256;
    const bytesOk = bytesOnDisk === entry.bytes;
    if (hashOk && bytesOk) {
      hashesVerified += 1;
      bytesVerified += bytesOnDisk;
    } else {
      hashMismatches.push(
        Object.freeze({
          id: entry.id,
          localCopy: entry.localCopy,
          problem: !hashOk && !bytesOk ? "hash and size" : !hashOk ? "hash" : "size",
          expectedSha256: entry.sha256,
          actualSha256: sha256OnDisk,
          expectedBytes: entry.bytes,
          actualBytes: bytesOnDisk,
        }),
      );
    }
  }

  const coverage = unitCoverage(unitCodes);
  const gapsByTier = (tier) => GAPS.filter((entry) => entry.gapTier === tier).map((entry) => entry.id);

  return Object.freeze({
    registeredSources: ALL_SOURCES.length,
    byTier: Object.freeze(byTier),
    sectionsRead: SECTIONS_READ.length,
    controllingGaps: Object.freeze(gapsByTier("controlling")),
    guidanceGaps: Object.freeze(gapsByTier("guidance")),
    identifiedNotTaught: Object.freeze(gapsByTier("identified-not-taught")),
    unitsTotal: unitCodes.length,
    unitsHeld: coverage.held.length,
    unitsExcused: coverage.excused.length,
    unitsUncovered: Object.freeze(coverage.uncovered),
    hashesVerified,
    bytesVerified,
    hashMismatches: Object.freeze(hashMismatches),
  });
}

/**
 * The manifest's Law of Agency lock, wired to this register's coverage.
 *
 * config/texas/regulatory-manifest.mjs exports lawOfAgencySourceLock(statuteCoverage) and takes the
 * coverage as an argument precisely so that the manifest does not import the statute layer. This
 * register does import the manifest, so it is the right place to close the loop: callers get the
 * lock already fed with the real 57-unit coverage rather than having to remember to supply it.
 */
export function lawOfAgencySourceLock() {
  return manifestLawOfAgencySourceLock(unitCoverage());
}

export default Object.freeze({
  SOURCE_TIERS,
  GAP_TIERS,
  LOA_UNITS,
  STATUTE_CHAPTERS,
  FEDERAL_SOURCES,
  TREC_RULE_SOURCES,
  ADOPTED_INSTRUMENTS,
  GUIDANCE_SOURCES,
  SECRETARY_OF_STATE_SOURCES,
  ALL_SOURCES,
  NO_STATUTE_REQUIRED,
  GAPS,
  SECTIONS_READ,
  ASSESSMENT_AND_DELIVERY_CONTROLS,
  unitCoverage,
  sourceValidation,
  lawOfAgencySourceLock,
});
