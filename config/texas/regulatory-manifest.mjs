/**
 * Texas — regulatory manifest.
 *
 * WHAT A SOURCE RECORD HAS TO CARRY HERE, AND WHY IT IS MORE THAN A CITATION. The California
 * manifest learned this the hard way: a citation tells you where something was read and nothing
 * about whether what you read is still there, or which of this project's claims falls if it
 * changes. Texas adds a third question California never had to ask — WHETHER THE AUTHORITY COULD BE
 * OPENED AT ALL. So every record below carries a reachability status, and an authority that could
 * not be opened is recorded as an authority that could not be opened, rather than quietly replaced
 * by a copy of it.
 *
 * THE FINDING THAT SHAPES THIS WHOLE FILE. Texas moved its two highest authorities behind
 * JavaScript applications during 2025-2026:
 *
 *   - The official Texas Administrative Code now lives in the Secretary of State's Appian portal at
 *     texas-sos.appianportalsgov.com. The legacy texreg.sos.state.tx.us reader returns a "This Site
 *     Has Moved" page for every rule.
 *   - statutes.capitol.texas.gov, which used to serve the Occupations Code as static .htm
 *     documents, now returns the same single-page-application shell for every document path,
 *     including the .pdf paths.
 *
 * Neither serves rule or statute text to a non-browser client, and headless Chromium cannot reach
 * ANY host from this environment. So the two authorities the Texas work order ranks first and
 * second could not be read here. That is a LOCK FAILURE by this file's own definition, and it is
 * the reason no Texas curriculum exists in this repository yet.
 *
 * WHAT LOCK AND DRIFT MEAN, KEPT SEPARATE ON PURPOSE.
 *   TX_REGULATORY_SOURCE_LOCK  — can every authority this build depends on be reached, and does
 *                                every held copy still hash to what was recorded? A missing or
 *                                unreachable authority FAILS the lock.
 *   TX_REGULATORY_SOURCE_DRIFT — has a reachable authority's content changed since it was read? A
 *                                changed official PDF is drift: it triggers a re-read and a review,
 *                                and it does not by itself mean the law changed.
 *
 * WHAT IS NOT AN AUTHORITY. The TREC consolidated rules web page reproduces Chapter 535 and is
 * useful for navigation. It is a CONVENIENCE COPY published by the regulated agency, not the
 * Secretary of State's adopted text, and nothing in this build may rest on it. It is recorded below
 * with that status so that a reader can see it was consulted and see what it was not used for.
 */

export const MANIFEST_VERSION = "TX-MANIFEST-2026-08-27-v1";

/* How long a reading stays good before the lock demands it be taken again. */
export const VERIFICATION_MAX_AGE_DAYS = 90;

export const REACHABILITY = Object.freeze({
  READ: "READ",
  /* The publisher serves only a JavaScript shell to a non-browser client, and no browser is
     available in this environment. */
  UNREACHABLE_JS_ONLY: "UNREACHABLE_JS_ONLY",
  /* The document exists but sits behind an authenticated portal. */
  UNREACHABLE_LOGIN_REQUIRED: "UNREACHABLE_LOGIN_REQUIRED",
  /* Searched for in the publisher's own index and not found there. */
  SEARCHED_NOT_FOUND: "SEARCHED_NOT_FOUND",
  /* Read, and deliberately not relied on. */
  READ_NOT_AUTHORITY: "READ_NOT_AUTHORITY",
});

const source = (record) =>
  Object.freeze({
    conflicts: Object.freeze([]),
    materialClaims: Object.freeze([]),
    ...record,
    materialClaims: Object.freeze((record.materialClaims ?? []).map((claim) => Object.freeze({ ...claim, reliedOnBy: Object.freeze(claim.reliedOnBy ?? []) }))),
    conflicts: Object.freeze(record.conflicts ?? []),
  });

export const SOURCES = Object.freeze([
  /* ── the six course approval forms: adopted by rule, published by TREC, downloaded and hashed ── */
  source({
    id: "trec-prins1-1",
    authority: "Texas Real Estate Commission",
    title: "Qualifying Real Estate Course Approval Form — Principles of Real Estate I (30 hour course)",
    documentNumber: "PRINS1-1",
    revision: "09/11/2024",
    effectiveDate: null,
    url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/PRINS1-1%2009.11.24.pdf",
    localCopy: "texas/trec-sources/PRINS1-1.pdf",
    sha256: "1ec0a549dac17854cb7a90308368e8b07a1ced25c9e69d7ef6f4c93a0adaf42c",
    bytes: 1204141,
    readOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "Course approval form adopted by rule — authority tier 4 of the Texas source hierarchy.",
    materialClaims: [
      {
        id: "prins1-structure",
        claim:
          "Principles of Real Estate I is a 30-hour course made of 9 topics and 46 units, each unit carrying a suggested length in minutes, totalling 1500 minutes on the form's own TOTAL MINUTES line.",
        reliedOnBy: ["config/texas/prins1-course-form.mjs", "gate:TX_PRINCIPLES_I_CONTENT_READY"],
      },
      {
        id: "prins1-minute-arithmetic",
        claim:
          "The form labels 1500 minutes as 30 hours, which is a 50-minute credit hour. This is the form's arithmetic. The form does not cite the rule that fixes the credit-hour length.",
        reliedOnBy: ["config/texas/prins1-course-form.mjs"],
      },
      {
        id: "prins1-provider-fields",
        claim:
          "The form asks the provider for its name, its provider licence number, the name of the text or workbook and its author, and the page on which each unit is covered; the Commission marks each unit included or not included.",
        reliedOnBy: ["deliverable:tx-prins1-crosswalk"],
      },
    ],
  }),
  source({
    id: "trec-prins2-1",
    authority: "Texas Real Estate Commission",
    title: "Qualifying Real Estate Course Approval Form — Principles of Real Estate II (30 hour course)",
    documentNumber: "PRINS2-1",
    revision: "09/11/2024",
    url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/PRINS2-1%2009.11.24.pdf",
    localCopy: "texas/trec-sources/PRINS2-1.pdf",
    sha256: "732242abd59613a08e631276760b5520747c57fb281c272c0415b2292bbfcc5e",
    bytes: 1233801,
    readOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "Course approval form adopted by rule.",
    materialClaims: [{ id: "prins2-exists", claim: "Principles of Real Estate II is a separate 30-hour course with its own approval form.", reliedOnBy: ["PROGRAMS"] }],
  }),
  source({
    id: "trec-loa-1",
    authority: "Texas Real Estate Commission",
    title: "Qualifying Real Estate Course Approval Form — Law of Agency (30 hour course)",
    documentNumber: "LOA-1",
    revision: "09/11/2024",
    url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/LOA-1%2009.11.24.pdf",
    localCopy: "texas/trec-sources/LOA-1.pdf",
    sha256: "3fb2206dc9408a80ed7a736d87b43336f8eadf90f75f1540b666640f57344705",
    bytes: 1380818,
    readOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "Course approval form adopted by rule.",
    materialClaims: [{ id: "loa-exists", claim: "Law of Agency is a separate 30-hour course with its own approval form.", reliedOnBy: ["PROGRAMS"] }],
  }),
  source({
    id: "trec-loc-0",
    authority: "Texas Real Estate Commission",
    title: "Qualifying Real Estate Course Approval Form — Law of Contracts (30 hour course)",
    documentNumber: "LOC-0",
    revision: "06/20/2016",
    url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/LOC-0.pdf",
    localCopy: "texas/trec-sources/LOC-0.pdf",
    sha256: "eaebc9d03a8131ca5cbba5457ad604fce5facf2610476b9fd79aa500467326d5",
    bytes: 991862,
    readOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "Course approval form adopted by rule. The 2016 revision date is the date printed on the form; the form is the one TREC currently publishes and it controls until replaced.",
    materialClaims: [{ id: "loc-exists", claim: "Law of Contracts is a separate 30-hour course with its own approval form.", reliedOnBy: ["PROGRAMS"] }],
  }),
  source({
    id: "trec-pcf-0",
    authority: "Texas Real Estate Commission",
    title: "Qualifying Real Estate Course Approval Form — Promulgated Contract Forms (30 hour course)",
    documentNumber: "PCF-0",
    revision: "06/20/2016",
    url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/PCF-0.pdf",
    localCopy: "texas/trec-sources/PCF-0.pdf",
    sha256: "6b87ca7dceb8d06f94ae46102823dede01edc3690c9e0944505a91f676704eec",
    bytes: 1040262,
    readOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "Course approval form adopted by rule; currently published revision controls.",
    materialClaims: [{ id: "pcf-exists", claim: "Promulgated Contract Forms is a separate 30-hour course with its own approval form.", reliedOnBy: ["PROGRAMS"] }],
  }),
  source({
    id: "trec-ref-0",
    authority: "Texas Real Estate Commission",
    title: "Qualifying Real Estate Course Approval Form — Real Estate Finance (30 hour course)",
    documentNumber: "REF-0",
    revision: "06/20/2016",
    url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/REF-0_0.pdf",
    localCopy: "texas/trec-sources/REF-0.pdf",
    sha256: "0ce0803148aff392bad39ba77d8c5f59e9668fd70455170f2bcf8c39d602f1f8",
    bytes: 1260112,
    readOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "Course approval form adopted by rule; currently published revision controls.",
    materialClaims: [{ id: "ref-exists", claim: "Real Estate Finance is a separate 30-hour course with its own approval form.", reliedOnBy: ["PROGRAMS"] }],
  }),

  /* ── the fee schedule ── */
  source({
    id: "trec-fee-schedule",
    authority: "Texas Real Estate Commission",
    title: "Fee Schedule Effective December 15, 2025",
    documentNumber: null,
    revision: "Effective December 15, 2025",
    effectiveDate: "2025-12-15",
    url: "https://www.trec.texas.gov/node/142",
    localCopy: null,
    /* Hash of the education-provider and course-application fee ROWS, not of the whole page, so
       that navigation churn on a Drupal site is not reported as a fee change. */
    sha256: "e1dc695ac05fc385ab57a014b874b7f3343f2b8c5f4e783f162c11aa9ae55b18",
    hashScope: "the Education Providers and Real Estate Course Applications fee rows, normalised to one line per row",
    readOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "Fee schedule published by the agency that charges the fees.",
    materialClaims: [
      {
        id: "fee-qe-provider-original",
        claim: "Qualifying Education Original Application Filing (4 year approval): $400.00 plus a $12.00 Texas Online Fee.",
        reliedOnBy: ["FEES.providerApplication"],
      },
      {
        id: "fee-qe-provider-annual",
        claim: "Qualifying Provider Annual Fee: $200.00 plus a $6.00 Texas Online Fee.",
        reliedOnBy: ["FEES.providerAnnual"],
      },
      {
        id: "fee-qualifying-course",
        claim:
          "Qualifying Courses: $50 base fee plus $10 per credit hour for content and exam review; $10 per credit hour for classroom delivery design and presentation review; $20 per credit hour for distance education delivery design and presentation review.",
        reliedOnBy: ["FEES.courseApplication"],
      },
      {
        id: "fee-four-year-term",
        claim: "The qualifying education provider original application filing is described by the fee schedule itself as a 4 year approval.",
        reliedOnBy: ["PROVIDER_TERM.providerApprovalYears"],
      },
    ],
    conflicts: [
      {
        id: "fee-classroom-component",
        question:
          "The per-credit-hour schedule has three components and a distance-only course plainly does not incur the classroom delivery review. Whether REALM charges $950 or $1,250 for a 30-hour distance course is not stated on the fee schedule.",
        resolution: "UNRESOLVED — REALM's own calculation controls. Recorded in the TREC clarification memo.",
      },
    ],
  }),

  /* ── the provider application: exists, cannot be read from here ── */
  source({
    id: "trec-qe-provider-application",
    authority: "Texas Real Estate Commission",
    title: "Qualifying Education Provider Application",
    documentNumber: null,
    revision: null,
    url: "https://www.trec.texas.gov/forms/qualifying-education-provider-application",
    localCopy: null,
    sha256: null,
    readOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.UNREACHABLE_LOGIN_REQUIRED,
    precedence: "Current TREC application — authority tier 5.",
    materialClaims: [
      {
        id: "provider-application-is-online",
        claim:
          "The link TREC publishes for the Qualifying Education Provider Application does not serve a PDF. It redirects to TREC's Accela portal login (/TREC/Login.aspx and /TREC/CommunityView/account/new). The application is filed online, in an account.",
        reliedOnBy: ["conflict:apply-by-mail", "deliverable:tx-realm-account"],
      },
    ],
    conflicts: [
      {
        id: "application-field-list-unknown",
        question: "The application's own field list, attachment list and fee calculation cannot be read without a REALM account.",
        resolution:
          "OPEN — HUMAN. The ledger in config/texas/provider-ledger.mjs is therefore built from the rules and the fee schedule and is explicitly marked incomplete against the application itself.",
      },
    ],
  }),

  /* ── the two authorities that could not be opened ── */
  source({
    id: "sos-tac-22-535",
    authority: "Texas Secretary of State",
    title: "Texas Administrative Code, Title 22, Part 23, Chapter 535 (Provisions of the Real Estate License Act)",
    documentNumber: "22 TAC ch. 535",
    revision: null,
    url: "https://texas-sos.appianportalsgov.com/rules-and-meetings?interface=VIEW_TAC",
    legacyUrl: "https://texreg.sos.state.tx.us/public/readtac$ext.TacPage",
    localCopy: null,
    sha256: null,
    readOn: null,
    attemptedOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.UNREACHABLE_JS_ONLY,
    precedence: "TIER 1 — the highest authority in the Texas source hierarchy, and it could not be opened.",
    materialClaims: [],
    conflicts: [
      {
        id: "tac-unreachable",
        question:
          "§§ 535.55, 535.60 to 535.67 and 535.101 could not be read. The legacy Secretary of State rule reader returns a 'This Site Has Moved' page for every rule; the replacement is an Appian single-page application that serves only a JavaScript shell to a non-browser client; and headless Chromium cannot reach any host from this environment.",
        resolution:
          "LOCK FAILURE. No Texas rule text is stated anywhere in this build. Retrieval is a HUMAN item: open the portal in a browser and save the adopted text of each section.",
      },
    ],
  }),
  source({
    id: "tx-occupations-code-1101",
    authority: "Texas Legislative Council / Texas Legislature Online",
    title: "Texas Occupations Code, Chapter 1101 (Real Estate Brokers and Sales Agents)",
    documentNumber: "Tex. Occ. Code ch. 1101",
    revision: null,
    url: "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1101.htm",
    localCopy: null,
    sha256: null,
    readOn: null,
    attemptedOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.UNREACHABLE_JS_ONLY,
    precedence: "TIER 2 — and it could not be opened.",
    materialClaims: [],
    conflicts: [
      {
        id: "statutes-unreachable",
        question:
          "statutes.capitol.texas.gov returns an identical 250,874-byte single-page-application shell for every document path tried, including .htm, .pdf and StatutesByDate paths, and returns 406 for a non-HTML Accept header. The statute text is fetched by client-side JavaScript.",
        resolution:
          "LOCK FAILURE. No Texas statutory text is stated anywhere in this build. The same failure blocks the Property Code, Estates Code, Finance Code, Tax Code and Local Government Code, which is why no Principles of Real Estate I instructional content exists yet.",
      },
    ],
  }),

  /* ── searched and not found ── */
  source({
    id: "sos-texas-register-2026",
    authority: "Texas Secretary of State",
    title: "Texas Register, adopted rules sections, 2026",
    documentNumber: null,
    revision: null,
    url: "https://www.sos.texas.gov/texreg/pdf/backview/",
    localCopy: null,
    sha256: null,
    readOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "TIER 3 — final adopted rules and orders published by the Secretary of State. Reachable as static PDFs and HTML, unlike the TAC itself.",
    materialClaims: [
      {
        id: "no-2026-535-62-or-65-adoption",
        claim:
          "Across 34 issues of the 2026 Texas Register adopted-rules sections (January through August) and the Title 22 adopted-rules pages for May through August 2026, the only Texas Real Estate Commission adoptions in Chapter 535 are § 535.214 (issue of 27 February 2026) and § 535.69 (issue of 22 May 2026). No adopted amendment to § 535.62 or § 535.65 appears.",
        reliedOnBy: ["conflict:august-2026-amendments"],
      },
    ],
    conflicts: [
      {
        id: "august-2026-amendments",
        question:
          "The Texas work order names 'final adopted August 2026 amendments to §§ 535.62 and 535.65' and a completion-record rule effective 31 August 2026 with an operational requirement from 1 October 2026. Neither appears in the Secretary of State's own adopted-rules publication for 2026.",
        resolution:
          "UNVERIFIED. This does not establish that no such amendment exists — it may have been adopted before 2026, or published in a section not scanned. It does establish that this project has not found it, and nothing in this build is written to it.",
      },
    ],
  }),

  /* ── consulted, explicitly not authority ── */
  source({
    id: "trec-consolidated-rules-page",
    authority: "Texas Real Estate Commission",
    title: "TREC Rules (consolidated web reproduction of 22 TAC Chapter 535)",
    documentNumber: null,
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: null,
    sha256: null,
    readOn: "2026-08-24",
    status: "current",
    reachability: REACHABILITY.READ_NOT_AUTHORITY,
    precedence:
      "NOT AUTHORITY. A convenience copy published by the regulated agency rather than the Secretary of State's adopted text. Used for navigation only — to learn which sections exist and roughly what they cover — and no rule, figure, deadline or requirement in this build is taken from it.",
    materialClaims: [],
  }),
]);

/* ── the fee arithmetic, computed rather than asserted ─────────────────────────────────────── */
export const FEES = Object.freeze({
  currency: "USD",
  scheduleEffective: "2025-12-15",
  providerApplication: Object.freeze({ base: 400, texasOnlineFee: 12, total: 412, approvalYears: 4 }),
  providerAnnual: Object.freeze({ base: 200, texasOnlineFee: 6, total: 206 }),
  courseApplication: Object.freeze({
    base: 50,
    perCreditHourContentAndExamReview: 10,
    perCreditHourClassroomDeliveryReview: 10,
    perCreditHourDistanceDeliveryReview: 20,
  }),
});

/** What TREC charges to review one qualifying real estate course, by the delivery methods sought. */
export function courseApplicationFee({ creditHours, classroom = false, distance = true }) {
  const f = FEES.courseApplication;
  let total = f.base + creditHours * f.perCreditHourContentAndExamReview;
  if (classroom) total += creditHours * f.perCreditHourClassroomDeliveryReview;
  if (distance) total += creditHours * f.perCreditHourDistanceDeliveryReview;
  return total;
}

/* ── the programme: six separate courses, never one 180-hour course ────────────────────────── */
export const COURSE_HOURS = 30;

export const PROGRAMS = Object.freeze([
  Object.freeze({ courseId: "tx-principles-real-estate-i-30-v1", title: "Principles of Real Estate I", formId: "trec-prins1-1", formNumber: "PRINS1-1", sequence: 1 }),
  Object.freeze({ courseId: "tx-principles-real-estate-ii-30-v1", title: "Principles of Real Estate II", formId: "trec-prins2-1", formNumber: "PRINS2-1", sequence: 2 }),
  Object.freeze({ courseId: "tx-law-of-agency-30-v1", title: "Law of Agency", formId: "trec-loa-1", formNumber: "LOA-1", sequence: 3 }),
  Object.freeze({ courseId: "tx-law-of-contracts-30-v1", title: "Law of Contracts", formId: "trec-loc-0", formNumber: "LOC-0", sequence: 4 }),
  Object.freeze({ courseId: "tx-promulgated-contract-forms-30-v1", title: "Promulgated Contract Forms", formId: "trec-pcf-0", formNumber: "PCF-0", sequence: 5 }),
  Object.freeze({ courseId: "tx-real-estate-finance-30-v1", title: "Real Estate Finance", formId: "trec-ref-0", formNumber: "REF-0", sequence: 6 }),
].map((program) => Object.freeze({
  ...program,
  state: "TX",
  hours: COURSE_HOURS,
  regulator: "Texas Real Estate Commission",
  providerApprovalNumber: null,
  courseApprovalNumber: null,
  enrollmentEnabled: false,
  paymentEnabled: false,
  creditAvailable: false,
  completionRecordEnabled: false,
  instructor: "Unassigned / Pending qualification",
  delivery: "Proposed distance education",
  approvalDate: null,
  launchDate: null,
  status: "In Development",
})));

export const PATHWAY = Object.freeze({
  id: "tx-sales-agent-180",
  title: "Texas Sales Agent Qualifying Education",
  totalHours: PROGRAMS.reduce((sum, program) => sum + program.hours, 0),
  /* The pathway is a PRESENTATION of six courses and never a course. Six approvals, six
     enrolments, six completion records, six prices, six refunds, six Stripe allocations. */
  courseIds: Object.freeze(PROGRAMS.map((program) => program.courseId)),
  modelledAsSingleCourse: false,
});

/* ── what the build plans to pay, computed from the schedule ───────────────────────────────── */
export const FILING_PLAN = Object.freeze({
  distanceCourseFeeEach: courseApplicationFee({ creditHours: COURSE_HOURS }),
  distanceCourseFeeAll: courseApplicationFee({ creditHours: COURSE_HOURS }) * PROGRAMS.length,
  providerApplicationTotal: FEES.providerApplication.total,
  get initialFilingTotal() {
    return this.distanceCourseFeeAll + this.providerApplicationTotal;
  },
  providerAnnualTotal: FEES.providerAnnual.total,
  note:
    "Computed from the fee schedule effective 2025-12-15 for DISTANCE delivery only. If REALM calculates any fee differently, REALM controls and the difference is reported rather than reconciled silently. The $10,000 reserve is not an application fee and is not included.",
});

/* ── provider term and operating controls ──────────────────────────────────────────────────── */
export const PROVIDER_TERM = Object.freeze({
  providerApprovalYears: 4,
  providerApprovalYearsSource: "trec-fee-schedule/fee-qe-provider-original",
  courseApprovalYears: null,
  courseApprovalYearsSource: null,
  courseApprovalYearsStatus: "UNVERIFIED — the four-year course term is stated in 22 TAC, which could not be read.",
  annualOperatingFee: FEES.providerAnnual.total,
  renewalWindowDays: null,
  renewalWindowStatus: "UNVERIFIED — 22 TAC unreachable.",
  bondAmount: 20000,
  bondAmountStatus: "UNVERIFIED — the $20,000 figure comes from the work order and from TREC's provider page, not from rule text this project has read.",
  reserveAmount: 10000,
  reserveAmountStatus: "UNVERIFIED — same.",
});

/* ── the two statuses, kept apart ──────────────────────────────────────────────────────────── */
export function sourceLock() {
  const blocking = SOURCES.filter(
    (entry) => entry.reachability === REACHABILITY.UNREACHABLE_JS_ONLY || entry.reachability === REACHABILITY.UNREACHABLE_LOGIN_REQUIRED,
  );
  return Object.freeze({
    status: blocking.length === 0 ? "PASS" : "FAIL",
    unreachable: Object.freeze(blocking.map((entry) => Object.freeze({ id: entry.id, title: entry.title, reachability: entry.reachability }))),
  });
}

export function held() {
  return SOURCES.filter((entry) => entry.localCopy && entry.sha256);
}

export const CONFLICTS = Object.freeze(SOURCES.flatMap((entry) => entry.conflicts.map((conflict) => Object.freeze({ sourceId: entry.id, ...conflict }))));

export default Object.freeze({ MANIFEST_VERSION, SOURCES, FEES, PROGRAMS, PATHWAY, FILING_PLAN, PROVIDER_TERM, CONFLICTS, sourceLock, held, courseApplicationFee });
