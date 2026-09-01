/**
 * LOA-1 — Qualifying Real Estate Course Approval Form, Law of Agency (30 hour course).
 *
 * WHAT THIS FILE IS. A transcription of the topic/unit/minute structure printed on the Texas Real
 * Estate Commission's own course approval form, revision 09/11/2024, downloaded from trec.texas.gov,
 * held at texas/trec-sources/LOA-1.pdf with its hash recorded in the Texas regulatory manifest
 * (source id trec-loa-1) and re-verified by direct sha256 recomputation on 2026-08-29. It is not a
 * summary and not an interpretation: every topic, every unit and every suggested minute figure below
 * is read off the form (extracted with pdfplumber, 2026-08-29). See config/texas/prins1-course-form.mjs
 * for the same transcription discipline applied to Principles of Real Estate I.
 *
 * ONE MID-TOPIC LABEL, RECORDED RATHER THAN DROPPED. In Employment Issues, the printed unit list
 * carries an unlabelled sub-heading — "Relationships between Brokers and Agents, §535.2" — between
 * "Employment and Compensation of Personal Assistants" and "Broker Responsibility". The form gives
 * it no minutes of its own; it reads as a citation attached to the two units that follow it, and is
 * folded into "Broker Responsibility"'s unit title below rather than invented as a thirteenth unit
 * that would break the topic's printed subtotal.
 *
 * THE MINUTE CONVENTION. TOTAL MINUTES on the form's own last page is 1500 for a course labelled
 * "30 hours" — the same 50-minute credit hour PRINS1-1 computes. No 22 TAC rule for the 50-minute
 * hour has been read from the codified text (still UNREACHABLE_JS_ONLY — see regulatory-manifest.mjs);
 * the convention is carried as FORM-DERIVED, PENDING confirmation, exactly as for Principles I.
 *
 * NOTHING HERE IS COURSE CONTENT. This file states what must be taught and for how long, not what
 * Texas law says about any of it. The substantive law for this course comes from Texas Occupations
 * Code ch. 1101 (held, texas/trec-sources/statutes/OC.1101.htm — includes §§ 1101.558, 1101.562 and
 * 1101.563, the sections added/amended for buyer representation effective 2026-01-01), the current
 * IABS form (IABS 1-2, effective 01/01/2026), and TREC's own explanatory article on the 2026 changes
 * — see the new SOURCES entries added to regulatory-manifest.mjs alongside this file.
 */

export const FORM = Object.freeze({
  formNumber: "LOA-1",
  revision: "09/11/2024",
  title: "Qualifying Real Estate Course Approval Form — Law of Agency (30 hour course)",
  issuer: "Texas Real Estate Commission",
  url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/LOA-1%2009.11.24.pdf",
  localCopy: "texas/trec-sources/LOA-1.pdf",
  sha256: "3fb2206dc9408a80ed7a736d87b43336f8eadf90f75f1540b666640f57344705",
  bytes: 1380818,
  pages: 3,
  readOn: "2026-08-29",
  courseHours: 30,
  totalMinutes: 1500,
  minutesPerCreditHour: 50,
  minutesPerCreditHourStatus: "FORM_DERIVED_PENDING_TAC_CONFIRMATION",
});

export const TOPICS = Object.freeze([
  Object.freeze({
    code: "T01",
    topic: "Agency Concepts",
    scopeNote: "Disclosure of Agency; relationship between principal & agent",
    subtotalMinutes: 130,
    units: Object.freeze([
      Object.freeze({ code: "T01U1", unit: "What is Agency? The License Act - Statute & Rules", minutes: 40 }),
      Object.freeze({ code: "T01U2", unit: "Why Study Agency", minutes: 25 }),
      Object.freeze({ code: "T01U3", unit: "Roles People Play in Agency Relationships - Client or Customer?", minutes: 40 }),
      Object.freeze({ code: "T01U4", unit: "Relationship between Principal & Agent", minutes: 25 }),
    ]),
  }),
  Object.freeze({
    code: "T02",
    topic: "Basic Agency Relationships, Disclosure and Duties to the Client",
    scopeNote: "Relationship between principal & agent; authority of agent",
    subtotalMinutes: 125,
    units: Object.freeze([
      Object.freeze({ code: "T02U1", unit: "Agency Defined", minutes: 20 }),
      Object.freeze({ code: "T02U2", unit: "Authority of Agent", minutes: 20 }),
      Object.freeze({ code: "T02U3", unit: "Classifications of Agency", minutes: 25 }),
      Object.freeze({ code: "T02U4", unit: "Duty to Respond, Fiduciary Duties and Responsibilities", minutes: 40 }),
      Object.freeze({ code: "T02U5", unit: "Information About Brokerage Services - Disclosure of Representation", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T03",
    topic: "Duties and Disclosures to Third Parties",
    scopeNote: "Fiduciary & other duties of an agent",
    subtotalMinutes: 125,
    units: Object.freeze([
      Object.freeze({ code: "T03U1", unit: "Non-Fiduciary Duties", minutes: 20 }),
      Object.freeze({ code: "T03U2", unit: "General Duties of Honesty & Fairness", minutes: 20 }),
      Object.freeze({ code: "T03U3", unit: "Define Third Party/Obligations to Third Party/Duty to Respond", minutes: 20 }),
      Object.freeze({ code: "T03U4", unit: "Avoiding Disclosure and Misrepresentation Problems", minutes: 30 }),
      Object.freeze({ code: "T03U5", unit: "Section 5.008 of the Texas Property Code (Seller's Disclosure)", minutes: 20 }),
      Object.freeze({ code: "T03U6", unit: "Stigmatized Properties", minutes: 15 }),
    ]),
  }),
  Object.freeze({
    code: "T04",
    topic: "Seller Agency",
    scopeNote: "Disclosure of agency; listing or buying representation procedures",
    subtotalMinutes: 120,
    units: Object.freeze([
      Object.freeze({ code: "T04U1", unit: "Listing Agreements", minutes: 40 }),
      Object.freeze({ code: "T04U2", unit: "Exclusive Seller Agency", minutes: 20 }),
      Object.freeze({ code: "T04U3", unit: "Benefits of Seller Agency Relationships", minutes: 20 }),
      Object.freeze({ code: "T04U4", unit: "Sub Agency", minutes: 20 }),
      Object.freeze({ code: "T04U5", unit: "Disclosure Issues", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T05",
    topic: "Buyer Agency",
    scopeNote: "Disclosure of agency; listing or buying representation procedures",
    subtotalMinutes: 150,
    units: Object.freeze([
      Object.freeze({ code: "T05U1", unit: "Buyer Representation Agreement", minutes: 30 }),
      Object.freeze({ code: "T05U2", unit: "Deciding to Represent the Buyer", minutes: 20 }),
      Object.freeze({ code: "T05U3", unit: "The Creation of Buyer Agency", minutes: 30 }),
      Object.freeze({ code: "T05U4", unit: "Benefits of Buyer-Agency Relationships", minutes: 30 }),
      Object.freeze({ code: "T05U5", unit: "Written Notification of Compensation to Broker", minutes: 20 }),
      Object.freeze({ code: "T05U6", unit: "Buyer's Broker Disclosures", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T06",
    topic: "Representing More Than One Party in a Transaction: Intermediary Brokerage",
    scopeNote: "Listing or buying representation procedures; agency disclosure",
    subtotalMinutes: 165,
    units: Object.freeze([
      Object.freeze({ code: "T06U1", unit: "The Path from Dual Agency to Intermediary Brokerage", minutes: 40 }),
      Object.freeze({ code: "T06U2", unit: "Intermediary Brokerage", minutes: 45 }),
      Object.freeze({ code: "T06U3", unit: "Representation of More Than One Party in a Transaction", minutes: 30 }),
      Object.freeze({ code: "T06U4", unit: "Specialized Intermediary Applications", minutes: 20 }),
      Object.freeze({ code: "T06U5", unit: "Intentional versus Unintended Dual Representation", minutes: 30 }),
    ]),
  }),
  Object.freeze({
    code: "T07",
    topic: "Creation and Termination of Agency",
    scopeNote: "Termination of an agent's authority",
    subtotalMinutes: 85,
    units: Object.freeze([
      Object.freeze({ code: "T07U1", unit: "How and When Agency is Created", minutes: 30 }),
      Object.freeze({ code: "T07U2", unit: "How Agency is Terminated", minutes: 30 }),
      Object.freeze({ code: "T07U3", unit: "Duties of Agency that Survive Termination", minutes: 25 }),
    ]),
  }),
  Object.freeze({
    code: "T08",
    topic: "Clarifying Agency Relationships",
    scopeNote: "Disclosure of agency",
    subtotalMinutes: 45,
    units: Object.freeze([
      Object.freeze({ code: "T08U1", unit: "Disclosure Policy", minutes: 20 }),
      Object.freeze({ code: "T08U2", unit: "Understanding a Brokerage Company's Policy", minutes: 25 }),
    ]),
  }),
  Object.freeze({
    code: "T09",
    topic: "Employment Issues",
    scopeNote: "Employment law",
    subtotalMinutes: 120,
    units: Object.freeze([
      Object.freeze({ code: "T09U1", unit: "Independent Contract Agreements", minutes: 20 }),
      Object.freeze({ code: "T09U2", unit: "Employment Law", minutes: 20 }),
      Object.freeze({ code: "T09U3", unit: "Employment Relationships between Brokers and Principals", minutes: 20 }),
      Object.freeze({ code: "T09U4", unit: "Employment and Compensation of Personal Assistants", minutes: 20 }),
      /* The form's mid-list sub-heading "Relationships between Brokers and Agents, §535.2" attaches
         to this unit and the next; see the file header note. */
      Object.freeze({ code: "T09U5", unit: "Broker Responsibility (Relationships between Brokers and Agents, §535.2)", minutes: 20 }),
      Object.freeze({ code: "T09U6", unit: "Compensation Issues", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T10",
    topic: "Agency, Ethics and the Law",
    scopeNote: "An agent's duties, including fiduciary duties",
    subtotalMinutes: 155,
    units: Object.freeze([
      Object.freeze({ code: "T10U1", unit: "Distinctions between Law, Ethics, and Morals", minutes: 25 }),
      Object.freeze({ code: "T10U2", unit: "Federal and State Law Relating to Conduct", minutes: 20 }),
      Object.freeze({ code: "T10U3", unit: "TRELA and Rules of the Commission (Ethics)", minutes: 40 }),
      Object.freeze({ code: "T10U4", unit: "Professional Codes of Ethics", minutes: 40 }),
      Object.freeze({ code: "T10U5", unit: "Minimum Ethical Standards", minutes: 30 }),
    ]),
  }),
  Object.freeze({
    code: "T11",
    topic: "Deceptive Trade Practices and Consumer Protection Act",
    scopeNote: "Deceptive trade practices",
    subtotalMinutes: 140,
    units: Object.freeze([
      Object.freeze({ code: "T11U1", unit: "Fraud versus Misrepresentation", minutes: 30 }),
      Object.freeze({ code: "T11U2", unit: "Deceptive Trade Practices and Consumer Protection", minutes: 50 }),
      Object.freeze({ code: "T11U3", unit: "Damages", minutes: 20 }),
      Object.freeze({ code: "T11U4", unit: "Defenses", minutes: 20 }),
      Object.freeze({ code: "T11U5", unit: "Ethical and Legal Concerns", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T12",
    topic: "Implementation and Presentation",
    scopeNote: null,
    subtotalMinutes: 140,
    units: Object.freeze([
      Object.freeze({ code: "T12U1", unit: "The Broker Working for/with the Seller", minutes: 40 }),
      Object.freeze({ code: "T12U2", unit: "The Broker Working for/with the Buyer", minutes: 30 }),
      Object.freeze({ code: "T12U3", unit: "A Practical Guide to Everyday Practice", minutes: 30 }),
      Object.freeze({ code: "T12U4", unit: "Other Considerations", minutes: 20 }),
      Object.freeze({ code: "T12U5", unit: "Risk Management", minutes: 20 }),
    ]),
  }),
]);

export const ALL_UNITS = Object.freeze(TOPICS.flatMap((topic) => topic.units.map((unit) => Object.freeze({ ...unit, topicCode: topic.code }))));

/* Invariants over the transcription itself, exactly as PRINS1-1 enforces them. */
for (const topic of TOPICS) {
  const sum = topic.units.reduce((total, unit) => total + unit.minutes, 0);
  if (sum !== topic.subtotalMinutes) {
    throw new Error(`LOA-1 ${topic.code}: units total ${sum} minutes against the form's printed subtotal of ${topic.subtotalMinutes}`);
  }
}
const grandTotal = TOPICS.reduce((total, topic) => total + topic.subtotalMinutes, 0);
if (grandTotal !== FORM.totalMinutes) {
  throw new Error(`LOA-1: topic subtotals reach ${grandTotal} minutes against the form's printed TOTAL MINUTES of ${FORM.totalMinutes}`);
}
if (FORM.totalMinutes !== FORM.courseHours * FORM.minutesPerCreditHour) {
  throw new Error("LOA-1: the form's total minutes are not the course hours times the credit-hour length");
}

export default Object.freeze({ FORM, TOPICS, ALL_UNITS });
