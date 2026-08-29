/**
 * PRINS2-1 — Qualifying Real Estate Course Approval Form, Principles of Real Estate II (30 hour course).
 *
 * WHAT THIS FILE IS. A transcription of the topic/unit/minute structure printed on the Texas Real
 * Estate Commission's own course approval form, revision 09/11/2024, downloaded from trec.texas.gov,
 * held at texas/trec-sources/PRINS2-1.pdf with its hash recorded in the Texas regulatory manifest
 * (source id trec-prins2-1) and re-verified by direct sha256 recomputation on 2026-08-29. Every topic,
 * unit and suggested-minute figure below is read off the form (pdfplumber word-position extraction,
 * 2026-08-29, cross-checked against every topic's own printed SUBTOTAL — see the invariants below).
 * See config/texas/prins1-course-form.mjs and law-of-agency-course-form.mjs for the same discipline.
 *
 * ONE STRUCTURAL FEATURE, RECORDED RATHER THAN GUESSED AT. In "Texas Real Estate License Act", the
 * form prints "Subchapter A - General Provisions" with a suggested length of 120 minutes, followed
 * by ten more lines — "Subchapter B" through "Subchapter Q" of Texas Occupations Code ch. 1101 —
 * each printed with NO suggested-minutes figure. Word-position extraction (not just text extraction,
 * which can silently drop a table column) confirms this: only the "Subchapter A" line carries an
 * adjacent number; B through Q do not. The topic's own printed SUBTOTAL (250) reconciles exactly
 * against the SIX units that do carry minutes and excludes B-Q entirely, so B-Q are recorded here as
 * a documented, unscored list of what the form names as within-scope subchapters — not invented as
 * thirteen additional minute-bearing units that would break the printed subtotal, and not silently
 * dropped either.
 *
 * NOTHING HERE IS COURSE CONTENT. This file states what must be taught and for how long, not what
 * Texas law says about any of it. See regulatory-manifest.mjs SOURCES for the substantive-law sources
 * this build depends on, including the new TREC Rules page lock for §§535.55/.62/.63/.64/.65 added
 * 2026-08-29, and the still-open TAC/provider lock failure that lock does not resolve.
 */

export const FORM = Object.freeze({
  formNumber: "PRINS2-1",
  revision: "09/11/2024",
  title: "Qualifying Real Estate Course Approval Form — Principles of Real Estate II (30 hour course)",
  issuer: "Texas Real Estate Commission",
  url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/PRINS2-1%2009.11.24.pdf",
  localCopy: "texas/trec-sources/PRINS2-1.pdf",
  sha256: "732242abd59613a08e631276760b5520747c57fb281c272c0415b2292bbfcc5e",
  bytes: 1233801,
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
    topic: "Real Estate Math",
    scopeNote: "Key terms/overview",
    subtotalMinutes: 30,
    units: Object.freeze([
      Object.freeze({ code: "T01U1", unit: "Calculators", minutes: 15 }),
      Object.freeze({ code: "T01U2", unit: "Fractions and Percentages", minutes: 15 }),
    ]),
  }),
  Object.freeze({
    code: "T02",
    topic: "Real Estate Financing Principles",
    scopeNote: "Finance & regulations",
    subtotalMinutes: 275,
    units: Object.freeze([
      Object.freeze({ code: "T02U1", unit: "Sources of Real Estate Financing", minutes: 50 }),
      Object.freeze({ code: "T02U2", unit: "Mortgage Market", minutes: 30 }),
      Object.freeze({ code: "T02U3", unit: "Application for Credit", minutes: 30 }),
      Object.freeze({ code: "T02U4", unit: "Payment Plans", minutes: 30 }),
      Object.freeze({ code: "T02U5", unit: "Conventional, FHA & VA Loans", minutes: 30 }),
      Object.freeze({ code: "T02U6", unit: "Texas Loan Programs", minutes: 25 }),
      Object.freeze({ code: "T02U7", unit: "Govt. Influence in Mortgage Lending", minutes: 25 }),
      Object.freeze({ code: "T02U8", unit: "Other Financing Techniques", minutes: 40 }),
      Object.freeze({ code: "T02U9", unit: "Financing Legislation", minutes: 15 }),
    ]),
  }),
  Object.freeze({
    code: "T03",
    topic: "Real Estate Appraisal",
    scopeNote: "Appraisal",
    subtotalMinutes: 220,
    /* Runs pages 1-2 of the form, the second part headed "(cont'd)" with the same scope note —
       one topic, one printed subtotal (220 on page 2), recorded as one. */
    units: Object.freeze([
      Object.freeze({ code: "T03U1", unit: "Requirements to Become an Appraiser", minutes: 40 }),
      Object.freeze({ code: "T03U2", unit: "Key Appraisal Terms", minutes: 25 }),
      Object.freeze({ code: "T03U3", unit: "Appraising & The Appraisal Process", minutes: 60 }),
      Object.freeze({ code: "T03U4", unit: "Value", minutes: 20 }),
      Object.freeze({ code: "T03U5", unit: "Three Approaches to Value", minutes: 30 }),
      Object.freeze({ code: "T03U6", unit: "Pricing a Property", minutes: 45 }),
    ]),
  }),
  Object.freeze({
    code: "T04",
    topic: "Leases",
    scopeNote: null,
    subtotalMinutes: 130,
    units: Object.freeze([
      Object.freeze({ code: "T04U1", unit: "Leasehold Estates", minutes: 25 }),
      Object.freeze({ code: "T04U2", unit: "Leasing Real Estate", minutes: 20 }),
      Object.freeze({ code: "T04U3", unit: "Common Lease Provisions", minutes: 20 }),
      Object.freeze({ code: "T04U4", unit: "Texas Landlord & Tenant Statutes", minutes: 45 }),
      Object.freeze({ code: "T04U5", unit: "Types of Leases", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T05",
    topic: "Control of Land Use",
    scopeNote: "Finance & regulations",
    subtotalMinutes: 110,
    units: Object.freeze([
      Object.freeze({ code: "T05U1", unit: "Land-Use Controls", minutes: 60 }),
      Object.freeze({ code: "T05U2", unit: "Public Ownership", minutes: 25 }),
      Object.freeze({ code: "T05U3", unit: "Environmental Protection Legislation", minutes: 25 }),
    ]),
  }),
  Object.freeze({
    code: "T06",
    topic: "Texas Real Estate License Act",
    scopeNote: "Licensing as a broker or salesperson",
    subtotalMinutes: 250,
    /* Runs pages 2-3, "(cont'd)" on page 3, one printed subtotal. See the file header note on the
       unscored Subchapter B-Q list attached to T06U2. */
    units: Object.freeze([
      Object.freeze({ code: "T06U1", unit: "Basic Provisions of the Texas Real Estate License Act", minutes: 30 }),
      Object.freeze({
        code: "T06U2",
        unit: "Subchapter A - General Provisions",
        minutes: 120,
        formNote:
          "The form lists ten further subchapters directly beneath this unit with no suggested-minutes figure of their own: Subchapter B - Texas Real Estate Commission; Subchapter C - Executive Director and Other Commission Personnel; Subchapter D - Commission Powers and Duties; Subchapter E - Public Interest Information and Complaint Procedures; Subchapter F - Texas Real Estate Broker-Lawyer Committee; Subchapter G - Approval of Real Estate Educational Programs and Courses of Study; Subchapter H - License Requirements; Subchapter I - Examinations; Subchapter J - License Renewal; Subchapter K - Certificate Requirements; Subchapter L - Practice by License Holder; Subchapter M - Real Estate Recovery Trust Account; Subchapter N - Prohibited Practices and Disciplinary Proceedings; Subchapter O - Administrative Penalty; Subchapter P - Other Penalties and Enforcement Provisions; Subchapter Q - General Provisions Relating to Liability Issues. (That is sixteen further named subchapters, B through Q; the form gives none of them a suggested length, and the topic's printed SUBTOTAL reconciles without them.)",
      }),
      Object.freeze({ code: "T06U3", unit: "Professional Organizations", minutes: 20 }),
      Object.freeze({ code: "T06U4", unit: "Real Estate - The Business of Value", minutes: 30 }),
      Object.freeze({ code: "T06U5", unit: "The Purpose of Licensing Laws - What a License Holder Can and Cannot Do", minutes: 30 }),
      Object.freeze({ code: "T06U6", unit: "The Texas Real Estate Commission & Licensing Requirements", minutes: 20 }),
    ]),
  }),
  Object.freeze({
    code: "T07",
    topic: "Real Estate Brokerage and Law of Agency",
    scopeNote: null,
    subtotalMinutes: 195,
    units: Object.freeze([
      Object.freeze({ code: "T07U1", unit: "The Law of Agency", minutes: 30 }),
      Object.freeze({ code: "T07U2", unit: "Agency Positions and Disclosure", minutes: 25 }),
      Object.freeze({ code: "T07U3", unit: "Brokerage & Nature of the Brokerage Business", minutes: 60 }),
      Object.freeze({ code: "T07U4", unit: "Fiduciary Duties", minutes: 30 }),
      Object.freeze({ code: "T07U5", unit: "Texas Deceptive Trade Practices - Consumer Protection Act", minutes: 50 }),
    ]),
  }),
  Object.freeze({
    code: "T08",
    topic: "Fair Housing Laws",
    scopeNote: "Federal, state & local fair housing laws",
    subtotalMinutes: 170,
    units: Object.freeze([
      Object.freeze({ code: "T08U1", unit: "Equal Opportunity in Housing", minutes: 50 }),
      Object.freeze({ code: "T08U2", unit: "Texas Fair Housing Laws", minutes: 30 }),
      Object.freeze({ code: "T08U3", unit: "Housing Discrimination", minutes: 30 }),
      Object.freeze({ code: "T08U4", unit: "Housing Credit Discrimination", minutes: 30 }),
      Object.freeze({ code: "T08U5", unit: "Community Reinvestment", minutes: 30 }),
    ]),
  }),
  Object.freeze({
    code: "T09",
    topic: "Property Management",
    scopeNote: "Licensing as a broker or salesperson; Ethics of practice as a license holder",
    subtotalMinutes: 120,
    units: Object.freeze([
      Object.freeze({ code: "T09U1", unit: "Property Management", minutes: 50 }),
      Object.freeze({ code: "T09U2", unit: "Management Considerations", minutes: 40 }),
      Object.freeze({ code: "T09U3", unit: "The Management Profession", minutes: 30 }),
    ]),
  }),
]);

export const ALL_UNITS = Object.freeze(TOPICS.flatMap((topic) => topic.units.map((unit) => Object.freeze({ ...unit, topicCode: topic.code }))));

/* Invariants over the transcription itself, exactly as PRINS1-1 and LOA-1 enforce them. */
for (const topic of TOPICS) {
  const sum = topic.units.reduce((total, unit) => total + unit.minutes, 0);
  if (sum !== topic.subtotalMinutes) {
    throw new Error(`PRINS2-1 ${topic.code}: units total ${sum} minutes against the form's printed subtotal of ${topic.subtotalMinutes}`);
  }
}
const grandTotal = TOPICS.reduce((total, topic) => total + topic.subtotalMinutes, 0);
if (grandTotal !== FORM.totalMinutes) {
  throw new Error(`PRINS2-1: topic subtotals reach ${grandTotal} minutes against the form's printed TOTAL MINUTES of ${FORM.totalMinutes}`);
}
if (FORM.totalMinutes !== FORM.courseHours * FORM.minutesPerCreditHour) {
  throw new Error("PRINS2-1: the form's total minutes are not the course hours times the credit-hour length");
}

export default Object.freeze({ FORM, TOPICS, ALL_UNITS });
