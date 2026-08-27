/**
 * PRINS1-1 — Qualifying Real Estate Course Approval Form, Principles of Real Estate I (30 hour course).
 *
 * WHAT THIS FILE IS. A transcription of the topic/unit/minute structure printed on the Texas Real
 * Estate Commission's own course approval form, revision 09/11/2024, downloaded from
 * trec.texas.gov on 2026-08-24 and held at texas/trec-sources/PRINS1-1.pdf with its hash recorded
 * in the Texas regulatory manifest. It is not a summary and not an interpretation: every topic,
 * every unit and every suggested minute figure below is read off the form.
 *
 * WHY THE STRUCTURE IS FIXED AND THE ORDER IS NOT. The form is organised as TOPICS, each carrying a
 * scope note in the Commission's own words and a set of UNITS with a suggested length in minutes.
 * A provider fills in the page number on which each unit is covered, and the Commission checks
 * "included" or "not included". So the topic-to-unit relationship is the Commission's and may not
 * be rearranged; the order in which a course presents the topics is the provider's.
 *
 * THE MINUTE CONVENTION, AND WHAT IT IMPLIES. The form's own TOTAL MINUTES is 1500 for a course it
 * labels "30 hours". 1500 / 30 = 50, so the form is computing a 50-minute credit hour. That
 * arithmetic is on the face of the form and is recorded here as such. WHAT IS NOT RECORDED HERE is
 * a rule citation for the 50-minute hour: 22 TAC is not reachable from this environment (see the
 * manifest), so the convention is carried as FORM-DERIVED and marked UNVERIFIED against the rule.
 *
 * NOTHING HERE IS COURSE CONTENT. This file states what must be taught and for how long. It does
 * not state what Texas law says about any of it, because the Texas Occupations Code, Property Code,
 * Estates Code, Finance Code and Tax Code could not be opened from this environment.
 */

export const FORM = Object.freeze({
  formNumber: "PRINS1-1",
  revision: "09/11/2024",
  title: "Qualifying Real Estate Course Approval Form — Principles of Real Estate I (30 hour course)",
  issuer: "Texas Real Estate Commission",
  url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/PRINS1-1%2009.11.24.pdf",
  localCopy: "texas/trec-sources/PRINS1-1.pdf",
  sha256: "1ec0a549dac17854cb7a90308368e8b07a1ced25c9e69d7ef6f4c93a0adaf42c",
  bytes: 1204141,
  pages: 3,
  readOn: "2026-08-24",
  courseHours: 30,
  totalMinutes: 1500,
  /* 1500 / 30. Stated by the form's own arithmetic, not by a rule this project has read. */
  minutesPerCreditHour: 50,
  minutesPerCreditHourStatus: "FORM_DERIVED_UNVERIFIED_AGAINST_RULE",
});

/* Topic scope notes are the Commission's wording, printed under each topic heading on the form. */
export const TOPICS = Object.freeze([
  Object.freeze({
    code: "T01",
    topic: "Introduction to Modern Real Estate Practice",
    scopeNote: "Licensing as a broker and salesperson",
    subtotalMinutes: 100,
    units: Object.freeze([
      Object.freeze({ code: "T01U1", unit: "Real Estate - A Business of Many Opportunities", minutes: 25 }),
      Object.freeze({ code: "T01U2", unit: "TREC Education Standards Advisory Committee", minutes: 15 }),
      Object.freeze({ code: "T01U3", unit: "The Real Estate Market - Characteristics of Real Estate", minutes: 20 }),
      Object.freeze({ code: "T01U4", unit: "Real Estate Law", minutes: 40 }),
    ]),
  }),
  Object.freeze({
    code: "T02",
    topic: "Real Property",
    scopeNote: "Distinctions between personal & real property",
    subtotalMinutes: 60,
    units: Object.freeze([
      Object.freeze({ code: "T02U1", unit: "Land, Real Estate and Real Property", minutes: 30 }),
      Object.freeze({ code: "T02U2", unit: "Personal Property", minutes: 30 }),
    ]),
  }),
  Object.freeze({
    code: "T03",
    topic: "Interests in Real Estate",
    scopeNote: "Deeds, encumbrances and liens",
    subtotalMinutes: 205,
    units: Object.freeze([
      Object.freeze({ code: "T03U1", unit: "Historical Background", minutes: 30 }),
      Object.freeze({ code: "T03U2", unit: "Estates in Land", minutes: 30 }),
      Object.freeze({ code: "T03U3", unit: "Encumbrances", minutes: 30 }),
      Object.freeze({ code: "T03U4", unit: "Tax Liens", minutes: 20 }),
      Object.freeze({ code: "T03U5", unit: "Liens other than Taxes", minutes: 25 }),
      Object.freeze({ code: "T03U6", unit: "Water Rights", minutes: 20 }),
      Object.freeze({ code: "T03U7", unit: "Residence as a Homestead", minutes: 50 }),
    ]),
  }),
  Object.freeze({
    code: "T04",
    topic: "Legal Description",
    scopeNote: "Legal descriptions",
    subtotalMinutes: 100,
    units: Object.freeze([
      Object.freeze({ code: "T04U1", unit: "Methods of Describing Real Estate in Texas", minutes: 65 }),
      Object.freeze({ code: "T04U2", unit: "Surveying", minutes: 35 }),
    ]),
  }),
  Object.freeze({
    code: "T05",
    topic: "How Home Ownership is Held and Real Estate Business Ownership Issues",
    scopeNote: "Titles to and conveyance of real estate; finance and regulation",
    subtotalMinutes: 180,
    units: Object.freeze([
      Object.freeze({ code: "T05U1", unit: "Forms of Ownership", minutes: 20 }),
      Object.freeze({ code: "T05U2", unit: "Business and Home", minutes: 20 }),
      Object.freeze({ code: "T05U3", unit: "Co-Ownership", minutes: 15 }),
      Object.freeze({ code: "T05U4", unit: "Trusts", minutes: 15 }),
      Object.freeze({ code: "T05U5", unit: "Investing in Real Estate", minutes: 25 }),
      Object.freeze({ code: "T05U6", unit: "The Investment", minutes: 20 }),
      Object.freeze({ code: "T05U7", unit: "The Benefits", minutes: 20 }),
      Object.freeze({ code: "T05U8", unit: "Real Estate Investment Syndicates", minutes: 15 }),
      Object.freeze({ code: "T05U9", unit: "Real Estate Investment Trusts", minutes: 15 }),
      Object.freeze({ code: "T05U10", unit: "Real Estate Mortgage Investment Conduits", minutes: 15 }),
    ]),
  }),
  Object.freeze({
    code: "T06",
    topic: "Real Estate Contracts",
    scopeNote: null,
    subtotalMinutes: 215,
    units: Object.freeze([
      Object.freeze({ code: "T06U1", unit: "Contracts", minutes: 30 }),
      Object.freeze({ code: "T06U2", unit: "Elements of a Contract", minutes: 30 }),
      Object.freeze({ code: "T06U3", unit: "Breach of a Contract", minutes: 30 }),
      Object.freeze({ code: "T06U4", unit: "Real Estate Contracts for Sale", minutes: 50 }),
      Object.freeze({ code: "T06U5", unit: "TREC Forms", minutes: 75 }),
    ]),
  }),
  Object.freeze({
    code: "T07",
    topic: "Estates, Transfers and Titles",
    scopeNote: "Titles & conveyance of real estate; deed, encumbrances and liens",
    subtotalMinutes: 210,
    /* The form runs this topic across pages 2 and 3, the second part headed "(cont'd)" with the
       same scope note. It is one topic with one subtotal, and is recorded as one. */
    units: Object.freeze([
      Object.freeze({ code: "T07U1", unit: "Deeds", minutes: 20 }),
      Object.freeze({ code: "T07U2", unit: "Title", minutes: 15 }),
      Object.freeze({ code: "T07U3", unit: "Public Records, Recording & Acknowledgment", minutes: 25 }),
      Object.freeze({ code: "T07U4", unit: "Evidence of Title", minutes: 45 }),
      Object.freeze({ code: "T07U5", unit: "Acquisitions & Transfers", minutes: 20 }),
      Object.freeze({ code: "T07U6", unit: "Estate Ownership", minutes: 20 }),
      Object.freeze({ code: "T07U7", unit: "Transfer of Decedent's Property", minutes: 25 }),
      Object.freeze({ code: "T07U8", unit: "Voluntary Alienation", minutes: 20 }),
      Object.freeze({ code: "T07U9", unit: "Involuntary Alienation", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T08",
    topic: "Mortgages and Promissory Notes",
    scopeNote: null,
    subtotalMinutes: 230,
    units: Object.freeze([
      Object.freeze({ code: "T08U1", unit: "Deed of Trust", minutes: 90 }),
      Object.freeze({ code: "T08U2", unit: "Real Estate Lien Note", minutes: 85 }),
      Object.freeze({ code: "T08U3", unit: "FIRPTA Affidavit", minutes: 55 }),
    ]),
  }),
  Object.freeze({
    code: "T09",
    topic: "Closing Procedures/Closing the Real Estate Transaction",
    scopeNote: "Closing Procedures",
    subtotalMinutes: 200,
    units: Object.freeze([
      Object.freeze({ code: "T09U1", unit: "Pre-Closing Procedures/Closing the Transaction", minutes: 50 }),
      Object.freeze({ code: "T09U2", unit: "Conducting the Closing", minutes: 45 }),
      Object.freeze({ code: "T09U3", unit: "RESPA/Uniform Settlement Statement", minutes: 40 }),
      Object.freeze({ code: "T09U4", unit: "Preparation of Closing Statements", minutes: 65 }),
    ]),
  }),
]);

export const ALL_UNITS = Object.freeze(TOPICS.flatMap((topic) => topic.units.map((unit) => Object.freeze({ ...unit, topicCode: topic.code }))));

/* Invariants over the transcription itself. A typo in a minute figure changes what the course owes
   the Commission, so the file refuses to load rather than let one through. */
for (const topic of TOPICS) {
  const sum = topic.units.reduce((total, unit) => total + unit.minutes, 0);
  if (sum !== topic.subtotalMinutes) {
    throw new Error(`PRINS1-1 ${topic.code}: units total ${sum} minutes against the form's printed subtotal of ${topic.subtotalMinutes}`);
  }
}
const grandTotal = TOPICS.reduce((total, topic) => total + topic.subtotalMinutes, 0);
if (grandTotal !== FORM.totalMinutes) {
  throw new Error(`PRINS1-1: topic subtotals reach ${grandTotal} minutes against the form's printed TOTAL MINUTES of ${FORM.totalMinutes}`);
}
if (FORM.totalMinutes !== FORM.courseHours * FORM.minutesPerCreditHour) {
  throw new Error("PRINS1-1: the form's total minutes are not the course hours times the credit-hour length");
}

export default Object.freeze({ FORM, TOPICS, ALL_UNITS });
