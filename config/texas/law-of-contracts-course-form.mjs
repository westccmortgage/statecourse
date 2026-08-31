/**
 * LOC-0 - Qualifying Course Approval Form, Law of Contracts (30 hour course).
 *
 * WHAT THIS FILE IS. A transcription of every topic, unit and suggested-minute figure printed on
 * the Texas Real Estate Commission's LOC-0 course approval form, revision 06/20/2016. The official
 * PDF is held at texas/trec-sources/LOC-0.pdf; its hash and byte count agree with source id
 * trec-loc-0 in config/texas/regulatory-manifest.mjs. The three pages were text-extracted and then
 * visually checked against full-page renders on 2026-08-31. TREC's held consolidated reproduction
 * of § 535.64(a) says LOC-0 is adopted by reference; the Secretary of State's codified text is still
 * unread and that source-lock failure remains open. This is therefore a compliance transcription,
 * not an editorial outline, but it does not establish submission readiness.
 *
 * TWO FORM QUIRKS ARE PRESERVED, NOT QUIETLY CORRECTED. Page 2 begins the seventh topic as
 * "Contingencies, Addendum and Amendments"; page 3 continues it as "Contingencies, Addenda and
 * Amendments." The continuation-page form is used as the topic title and the page-2 variant is
 * recorded in formVariantOnPage2. The Financing Real Estate scope note prints "statute & fraud";
 * scopeNote reproduces those words even though "statute of frauds" would be conventional phrasing.
 *
 * THE MINUTE CONVENTION. LOC-0 prints TOTAL MINUTES 1500 for a course labelled 30 hours. That is a
 * 50-minute credit hour derived from the form itself, pending codified-rule confirmation. Under the
 * held TREC text for 22 TAC § 535.65(g)(3)-(5), topics may be reordered and a unit's suggested time
 * may be altered, but every unit must remain in its topic. The topic subtotal is therefore the
 * minimum this build budgets; surplus time in one topic may not cure a shortfall in another.
 *
 * NOTHING HERE IS COURSE CONTENT. It states what must be taught and the controlling allocation. A
 * source register and authored instruction must establish the substantive law separately.
 */

export const FORM = Object.freeze({
  formNumber: "LOC-0",
  revision: "06/20/2016",
  title: "Qualifying Course Approval Form - Law of Contracts (30 hour course)",
  issuer: "Texas Real Estate Commission",
  url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/LOC-0.pdf",
  localCopy: "texas/trec-sources/LOC-0.pdf",
  sha256: "eaebc9d03a8131ca5cbba5457ad604fce5facf2610476b9fd79aa500467326d5",
  bytes: 991862,
  pages: 3,
  readOn: "2026-08-31",
  courseHours: 30,
  totalMinutes: 1500,
  minutesPerCreditHour: 50,
  minutesPerCreditHourStatus: "FORM_DERIVED_PENDING_TAC_CONFIRMATION",
});

export const TOPICS = Object.freeze([
  Object.freeze({
    code: "T01",
    topic: "Texas Contract Law",
    scopeNote: "Commission rules relating to use of adopted forms; Unauthorized Practice of Law",
    subtotalMinutes: 155,
    units: Object.freeze([
      Object.freeze({ code: "T01U1", unit: "Key Terms", minutes: 15 }),
      Object.freeze({ code: "T01U2", unit: "Texas Real Estate License Act", minutes: 30 }),
      Object.freeze({ code: "T01U3", unit: "Unauthorized Practice of Law", minutes: 20 }),
      Object.freeze({ code: "T01U4", unit: "The Broker-Lawyer Committee", minutes: 15 }),
      Object.freeze({ code: "T01U5", unit: "Use of Promulgated Contract Forms", minutes: 55 }),
      Object.freeze({ code: "T01U6", unit: "Deceptive Trade Practices Consumer Protection Act (DTPA)", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T02",
    topic: "Basics of Real Estate Law",
    scopeNote: null,
    subtotalMinutes: 115,
    units: Object.freeze([
      Object.freeze({ code: "T02U1", unit: "Real Property and the Law", minutes: 15 }),
      Object.freeze({ code: "T02U2", unit: "Land, Real Estate, and Real Property", minutes: 15 }),
      Object.freeze({ code: "T02U3", unit: "Real Property vs. Personal Property", minutes: 15 }),
      Object.freeze({ code: "T02U4", unit: "Characteristics of Real Property", minutes: 15 }),
      Object.freeze({ code: "T02U5", unit: "Forms of Real Estate Ownership", minutes: 15 }),
      Object.freeze({ code: "T02U6", unit: "Ownership of Real Estate by Business Organizations", minutes: 10 }),
      Object.freeze({ code: "T02U7", unit: "Condominiums, Cooperatives, Town Houses & Time-Shares", minutes: 10 }),
      Object.freeze({ code: "T02U8", unit: "Laws Affecting Real Estate", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T03",
    topic: "Introduction to Contracts",
    scopeNote: "Elements of a contract; offer & acceptance",
    subtotalMinutes: 75,
    units: Object.freeze([
      Object.freeze({ code: "T03U1", unit: "Elements of a Valid Contract", minutes: 15 }),
      Object.freeze({ code: "T03U2", unit: "Express or Implied Contracts", minutes: 15 }),
      Object.freeze({ code: "T03U3", unit: "Unilateral or Bilateral Contracts", minutes: 15 }),
      Object.freeze({ code: "T03U4", unit: "Valid, Void, Voidable & Unenforceable Contracts", minutes: 15 }),
      Object.freeze({ code: "T03U5", unit: "Executed or Executory Contracts", minutes: 15 }),
    ]),
  }),
  Object.freeze({
    code: "T04",
    topic: "Ownership Rights and Limitations",
    scopeNote: "Remedies for breach",
    subtotalMinutes: 120,
    units: Object.freeze([
      Object.freeze({ code: "T04U1", unit: "Interests in Real Estate", minutes: 15 }),
      Object.freeze({ code: "T04U2", unit: "Governmental Powers", minutes: 10 }),
      Object.freeze({ code: "T04U3", unit: "Estates in Land", minutes: 20 }),
      Object.freeze({ code: "T04U4", unit: "Encumbrances", minutes: 15 }),
      Object.freeze({ code: "T04U5", unit: "Water Rights", minutes: 15 }),
      Object.freeze({ code: "T04U6", unit: "Mineral Rights", minutes: 15 }),
      Object.freeze({ code: "T04U7", unit: "Environmental issues", minutes: 15 }),
      Object.freeze({ code: "T04U8", unit: "Homestead", minutes: 15 }),
    ]),
  }),
  Object.freeze({
    code: "T05",
    topic: "Contracts Used in Real Estate",
    scopeNote: "Elements of a contract; offer & acceptance",
    subtotalMinutes: 275,
    units: Object.freeze([
      Object.freeze({ code: "T05U1", unit: "Real Estate Contracts", minutes: 20 }),
      Object.freeze({ code: "T05U2", unit: "Contract Law", minutes: 30 }),
      Object.freeze({ code: "T05U3", unit: "Discharge of Contracts", minutes: 15 }),
      Object.freeze({ code: "T05U4", unit: "Contracts Used in the Real Estate Business", minutes: 20 }),
      Object.freeze({ code: "T05U5", unit: "Listing Agreements", minutes: 20 }),
      Object.freeze({ code: "T05U6", unit: "Buyer Agency Agreement", minutes: 20 }),
      Object.freeze({ code: "T05U7", unit: "Leasing Real Estate", minutes: 20 }),
      Object.freeze({ code: "T05U8", unit: "Leasehold Estates", minutes: 15 }),
      Object.freeze({ code: "T05U9", unit: "Lease Agreements", minutes: 20 }),
      Object.freeze({ code: "T05U10", unit: "Types of Leases", minutes: 20 }),
      Object.freeze({ code: "T05U11", unit: "Discharge of Leases", minutes: 20 }),
      Object.freeze({ code: "T05U12", unit: "Options", minutes: 15 }),
      Object.freeze({ code: "T05U13", unit: "Contract for Deed", minutes: 20 }),
      Object.freeze({ code: "T05U14", unit: "Lease Purchase Agreements", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T06",
    topic: "The Sales Contract",
    scopeNote: "Elements of a contract; offer & acceptance; statute of frauds",
    subtotalMinutes: 135,
    units: Object.freeze([
      Object.freeze({ code: "T06U1", unit: "Offer and Acceptance", minutes: 15 }),
      Object.freeze({ code: "T06U2", unit: "The Document", minutes: 20 }),
      Object.freeze({ code: "T06U3", unit: "Financing Information", minutes: 15 }),
      Object.freeze({ code: "T06U4", unit: "Disclosures", minutes: 15 }),
      Object.freeze({ code: "T06U5", unit: "Conveyance of the Property", minutes: 10 }),
      Object.freeze({ code: "T06U6", unit: "Signatures", minutes: 10 }),
      Object.freeze({ code: "T06U7", unit: "Statute of Frauds", minutes: 15 }),
      Object.freeze({ code: "T06U8", unit: "Default and Breach of Contract", minutes: 20 }),
      Object.freeze({ code: "T06U9", unit: "Remedies", minutes: 15 }),
    ]),
  }),
  Object.freeze({
    code: "T07",
    topic: "Contingencies, Addenda and Amendments",
    formVariantOnPage2: "Contingencies, Addendum and Amendments",
    scopeNote: "Owner disclosure requirements; offer & acceptance",
    subtotalMinutes: 105,
    units: Object.freeze([
      Object.freeze({ code: "T07U1", unit: "Contingencies", minutes: 45 }),
      Object.freeze({ code: "T07U2", unit: "Amendments", minutes: 30 }),
      Object.freeze({ code: "T07U3", unit: "Addenda", minutes: 30 }),
    ]),
  }),
  Object.freeze({
    code: "T08",
    topic: "Financing Real Estate",
    scopeNote: "Owner disclosure requirements; elements of a contract; statute & fraud",
    subtotalMinutes: 235,
    units: Object.freeze([
      Object.freeze({ code: "T08U1", unit: "Mortgage Law", minutes: 20 }),
      Object.freeze({ code: "T08U2", unit: "Security and Debt", minutes: 20 }),
      Object.freeze({ code: "T08U3", unit: "Promissory Note", minutes: 15 }),
      Object.freeze({ code: "T08U4", unit: "Mortgages or Deeds of Trust", minutes: 15 }),
      Object.freeze({ code: "T08U5", unit: "Owner Financing", minutes: 25 }),
      Object.freeze({ code: "T08U6", unit: "Foreclosures and Short Sales", minutes: 30 }),
      Object.freeze({ code: "T08U7", unit: "Liens", minutes: 20 }),
      Object.freeze({ code: "T08U8", unit: "The Real Estate Financing Market, Techniques and Loan Programs", minutes: 55 }),
      Object.freeze({ code: "T08U9", unit: "Financing Legislation", minutes: 20 }),
      Object.freeze({ code: "T08U10", unit: "Computerized Loan Origination (CLO)", minutes: 15 }),
    ]),
  }),
  Object.freeze({
    code: "T09",
    topic: "Conveyance of Title",
    scopeNote: "Owner disclosure requirements",
    subtotalMinutes: 90,
    units: Object.freeze([
      Object.freeze({ code: "T09U1", unit: "Title", minutes: 15 }),
      Object.freeze({ code: "T09U2", unit: "Voluntary Alienation", minutes: 15 }),
      Object.freeze({ code: "T09U3", unit: "Involuntary Alienation", minutes: 15 }),
      Object.freeze({ code: "T09U4", unit: "Conveyance of Estates", minutes: 15 }),
      Object.freeze({ code: "T09U5", unit: "Public Records", minutes: 15 }),
      Object.freeze({ code: "T09U6", unit: "Proof of Ownership", minutes: 15 }),
    ]),
  }),
  Object.freeze({
    code: "T10",
    topic: "Transaction Process and Closing",
    scopeNote: "Elements of a contract; remedies for breach, including specific performance; owner disclosure requirements",
    subtotalMinutes: 135,
    units: Object.freeze([
      Object.freeze({ code: "T10U1", unit: "Transaction Process", minutes: 15 }),
      Object.freeze({ code: "T10U2", unit: "Sample Check List", minutes: 15 }),
      Object.freeze({ code: "T10U3", unit: "Loan Approval", minutes: 15 }),
      Object.freeze({ code: "T10U4", unit: "Real Estate Settlement Procedures Act (RESPA)", minutes: 15 }),
      Object.freeze({ code: "T10U5", unit: "Inspections", minutes: 15 }),
      Object.freeze({ code: "T10U6", unit: "Title Work", minutes: 15 }),
      Object.freeze({ code: "T10U7", unit: "Preparation for Closing", minutes: 15 }),
      Object.freeze({ code: "T10U8", unit: "Prorations", minutes: 15 }),
      Object.freeze({ code: "T10U9", unit: "Closing and Funding", minutes: 15 }),
    ]),
  }),
  Object.freeze({
    code: "T11",
    topic: "Common Contract Mistakes",
    scopeNote: "Elements of a contract; offer & acceptance",
    subtotalMinutes: 60,
    units: Object.freeze([
      Object.freeze({ code: "T11U1", unit: "Contract Examples", minutes: 40 }),
      Object.freeze({ code: "T11U2", unit: "Common Areas of Concern", minutes: 20 }),
    ]),
  }),
]);

export const ALL_UNITS = Object.freeze(
  TOPICS.flatMap((topic) => topic.units.map((unit) => Object.freeze({ ...unit, topicCode: topic.code }))),
);

for (const topic of TOPICS) {
  const sum = topic.units.reduce((total, unit) => total + unit.minutes, 0);
  if (sum !== topic.subtotalMinutes) {
    throw new Error(`LOC-0 ${topic.code}: units total ${sum} minutes against the form's printed subtotal of ${topic.subtotalMinutes}`);
  }
}

const grandTotal = TOPICS.reduce((total, topic) => total + topic.subtotalMinutes, 0);
if (grandTotal !== FORM.totalMinutes) {
  throw new Error(`LOC-0: topic subtotals reach ${grandTotal} minutes against the form's printed TOTAL MINUTES of ${FORM.totalMinutes}`);
}
if (FORM.totalMinutes !== FORM.courseHours * FORM.minutesPerCreditHour) {
  throw new Error("LOC-0: the form's total minutes are not the course hours times the form-derived credit-hour length");
}
if (new Set(ALL_UNITS.map((unit) => unit.code)).size !== ALL_UNITS.length) {
  throw new Error("LOC-0: unit codes must be unique");
}

export default Object.freeze({ FORM, TOPICS, ALL_UNITS });
