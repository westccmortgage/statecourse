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

export const MANIFEST_VERSION = "TX-MANIFEST-2026-08-29-v3";

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
          "LOCK FAILURE for the CODIFIED CURRENT TEXT, which remains unread. The proposed text of §§ 535.62 and 535.65 was afterwards obtained from the Secretary of State's Texas Register of 22 May 2026 and is held; the adoption notice publishes 28 August 2026. What is still missing is the codified text of §§ 535.55, 535.60, 535.61, 535.63, 535.64, 535.66, 535.67 and 535.101. Retrieval is a HUMAN item — see texas/submission/human-export-list.md.",
      },
    ],
  }),
  source({
    id: "tx-occupations-code-1101",
    authority: "Texas Legislative Council",
    title: "Texas Occupations Code, Chapter 1101 (Real Estate Brokers and Sales Agents)",
    documentNumber: "Tex. Occ. Code ch. 1101",
    revision: null,
    url: "https://tcss.legis.texas.gov/resources/OC/htm/OC.1101.htm",
    localCopy: "texas/trec-sources/statutes/OC.1101.htm",
    sha256: "8c40aa399cf717901540150ae6acaf3d847305f7fefcf7dd7ec4c3068a418858",
    bytes: 308708,
    readOn: "2026-08-27",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "TIER 2 — the statute, retrieved from the Texas Legislative Council's static resource layer.",
    materialClaims: [
      {
        id: "oc-1101-301",
        claim:
          "§ 1101.301: the Commission may by rule establish standards for approving qualifying educational programs or courses of study in real estate conducted in this state, excluding programs offered by public high schools and accredited colleges and universities, and develop minimum education and experience requirements for an instructor.",
        reliedOnBy: ["config/texas/statute-sources.mjs"],
      },
      {
        id: "oc-1101-155",
        claim:
          "§ 1101.155: the Commission may adopt rules requiring licence holders to use contract forms prepared by the Texas Real Estate Broker-Lawyer Committee and adopted by the Commission, and may not prohibit certain other forms.",
        reliedOnBy: ["config/texas/statute-sources.mjs", "PRINS1-1 unit T06U5 TREC Forms"],
      },
    ],
    conflicts: [
      {
        id: "statutes-path-correction",
        question:
          "The TX-0 report recorded the Occupations Code as unreachable, on the strength of statutes.capitol.texas.gov returning an identical single-page-application shell for every document path.",
        resolution:
          "CORRECTED 2026-08-27. That host does behave that way; the conclusion drawn from it did not follow. The Texas Legislative Council publishes the same codes as plain static HTML at tcss.legis.texas.gov/resources/{CODE}/htm/{CODE}.{CHAPTER}.htm, and twenty-five chapters were retrieved from it with no browser and no failures. A single failing endpoint is evidence about that endpoint.",
      },
    ],
    /* Re-verified 2026-08-29 against the same local copy for the Law of Agency build: the held HTML
       already carries the sections added/amended by the 89th Legislature for buyer representation,
       effective 2026-01-01, so no re-fetch was needed. */
  }),
  source({
    id: "oc-1101-buyer-representation-2026",
    authority: "Texas Legislative Council",
    title: "Texas Occupations Code §§ 1101.558, 1101.562, 1101.563 (buyer/tenant representation, as amended/added by the 89th Legislature, effective 2026-01-01)",
    documentNumber: "Tex. Occ. Code §§ 1101.558, 1101.562, 1101.563",
    revision: null,
    effectiveDate: "2026-01-01",
    url: "https://tcss.legis.texas.gov/resources/OC/htm/OC.1101.htm",
    localCopy: "texas/trec-sources/statutes/OC.1101.htm",
    sha256: "8c40aa399cf717901540150ae6acaf3d847305f7fefcf7dd7ec4c3068a418858",
    readOn: "2026-08-29",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "TIER 2 — the statute itself, same held copy as oc-1101 above; this record isolates the specific sections the Law of Agency build depends on and their confirmed presence in the held text.",
    materialClaims: [
      {
        id: "1101-558-representation-disclosure",
        claim: "§ 1101.558(b)/(b-1): a license holder who represents a party must disclose that representation, orally or in writing, at first contact with another party or their license holder; at first substantive communication about specific property, the license holder must give a written notice (the IABS) meeting the content requirements of (b-1)(1)-(4), with commission-prescribed text and delivery method under (b-2). Subsection (c) lists three exceptions, including communication at an open house concerning that property.",
        reliedOnBy: ["config/texas/law-of-agency-course-form.mjs T02U5", "config/texas/law-of-agency-course-form.mjs T08U1"],
      },
      {
        id: "1101-562-showings-without-representation",
        claim: "§ 1101.562: a broker may show real property to a party without representing them if the broker has not agreed to represent the party (orally or in writing), is not otherwise acting as their agent, gives no opinions or advice on the property or transactions generally, and performs no other brokerage act for the party; before showing, the broker must give the § 1101.558(b) disclosure or the § 1101.558(b-1) written notice, as applicable; and may still confirm size, price and terms of the property under (c).",
        reliedOnBy: ["config/texas/law-of-agency-course-form.mjs T04U5", "config/texas/law-of-agency-course-form.mjs T08U1"],
      },
      {
        id: "1101-563-written-agreement-required",
        claim: "§ 1101.563: a license holder performing any act of real estate brokerage for a prospective buyer of residential real property (single-family house; duplex/triplex/quadraplex; or a condominium/cooperative unit) must enter a written agreement with the prospective buyer before showing residential property or, if none will be shown, before presenting an offer on the buyer's behalf. The agreement must state the services to be provided, its termination date, whether it is exclusive or non-exclusive, whether the license holder represents the buyer or (for a showing-only agreement under § 1101.562) does not, and the amount/rate of compensation and how it is determined, and must disclose in conspicuous language that broker compensation is not set by law and is fully negotiable. A showing-only agreement under § 1101.562 may not be exclusive and may not run more than fourteen days; a separate agreement is required if further brokerage acts follow the showing. § 1101.652(a-1)(3)/(34)(added) makes failure to use a required contract form, and failure to enter into the § 1101.563 written agreement, grounds for suspension or revocation.",
        reliedOnBy: ["config/texas/law-of-agency-course-form.mjs T04U5", "config/texas/law-of-agency-course-form.mjs T05U1"],
      },
    ],
  }),
  source({
    id: "trec-buyer-rep-2026-article",
    authority: "Texas Real Estate Commission",
    title: "What Changes in 2026 About Buyer/Tenant Representation in Texas",
    documentNumber: null,
    revision: null,
    effectiveDate: "2026-01-01",
    url: "https://www.trec.texas.gov/article/what-changes-2026-about-buyertenant-representation-texas",
    localCopy: "texas/trec-sources/articles/what-changes-2026-buyer-tenant-representation.html",
    sha256: "dd987ceb2d972d8e54a245cdf30fe3344369e7666dfa1059f817da28db6fd3ae",
    readOn: "2026-08-29",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "Tier-4 TREC explanatory guidance on the tier-2 statute above (§§ 1101.562-.563), published by the regulator, dated 01-07-2026, byline Summer Mandell. Used for the open-house and 'refuses to sign' operating detail the bare statute text does not spell out; every claim below cross-checks against the held statute text and nothing here overrides it.",
    materialClaims: [
      {
        id: "open-house-listing-agent-exception",
        claim: "An agent hosting an open house who is a member of the listing broker's office need not provide the IABS or enter a written agreement with visitors, but must disclose (orally or in writing, per § 1101.558(b)) that they represent the owner.",
        reliedOnBy: ["config/texas/law-of-agency-course-form.mjs T08U1"],
      },
      {
        id: "open-house-outside-agent-requirement",
        claim: "An agent hosting an open house who is NOT a member of the listing broker's office and does not represent the seller must provide the IABS and enter into a § 1101.563(c) written agreement with a prospective buyer before the buyer views the property, even if that buyer already has a written representation agreement with another broker; if the buyer refuses to sign, the agent cannot show the property.",
        reliedOnBy: ["config/texas/law-of-agency-course-form.mjs T08U1"],
      },
      {
        id: "subagency-removed-not-eliminated",
        claim: "Two references to subagency were removed from TRELA, narrowing the circumstances in which it could arise, but the article states subagency 'has not been eliminated generally as a legal concept.'",
        reliedOnBy: ["config/texas/law-of-agency-course-form.mjs T04U4"],
      },
    ],
  }),
  source({
    id: "trec-iabs-1-2",
    authority: "Texas Real Estate Commission",
    title: "Information About Brokerage Services (IABS) Form",
    documentNumber: "IABS 1-2",
    revision: null,
    effectiveDate: "2026-01-01",
    url: "https://www.trec.texas.gov/forms/information-about-brokerage-services",
    localCopy: null,
    sha256: null,
    readOn: "2026-08-29",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "Current TREC form (tier 4), superseding IABS 1-0 effective 2026-01-01 to reflect the § 1101.558(b-1)/§ 1101.562 notice requirements.",
    materialClaims: [
      {
        id: "iabs-current-version",
        claim: "The current Information About Brokerage Services form is IABS 1-2, effective 01/01/2026, per TREC's own forms listing.",
        reliedOnBy: ["config/texas/law-of-agency-course-form.mjs T02U5"],
      },
    ],
    conflicts: [
      {
        id: "iabs-pdf-not-downloaded",
        question: "The IABS 1-2 PDF itself has not yet been downloaded and hashed to texas/trec-sources/ — only the forms-listing page naming it was read.",
        resolution: "OPEN. Download and hash before the Law of Agency course content ships; the form-number and effective-date claim above does not depend on it.",
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
        id: "register-scan-window",
        claim:
          "The 2026 Texas Register adopted-rules sections are reachable as static PDFs and HTML. Issues through 21 August 2026 were scanned; the 28 August 2026 issue returns 403 and is not yet published.",
        reliedOnBy: ["conflict:august-2026-amendments"],
      },
    ],
    conflicts: [
      {
        id: "august-2026-amendments",
        question:
          "The TX-0 report concluded that no adopted amendment to § 535.62 or § 535.65 appears in the Secretary of State's 2026 publication.",
        resolution:
          "CORRECTED 2026-08-27. The conclusion was wrong. Both were adopted 10 August 2026, effective 31 August 2026, and TREC's own rule records carry the dates and the Secretary of State record ids. An adoption filed on 10 August publishes in the Register about three weeks later — the 28 August issue, which returns 403 because it is not yet published. The scan was accurate about what it covered and the CONCLUSION drawn from it was too strong: 'not found in the issues I read' was reported as 'does not appear'.",
      },
    ],
  }),

  /* ── the two 2026 amendments: adopted, not yet effective ── */
  source({
    id: "trec-rule-535-62",
    authority: "Texas Real Estate Commission (rule record); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.62, Approval of Qualifying Courses",
    documentNumber: "22 TAC § 535.62",
    revision: null,
    proposedDate: "2026-05-04",
    adoptedDate: "2026-08-10",
    effectiveDate: "2026-08-31",
    url: "https://www.trec.texas.gov/22-tac-%C2%A753562-approval-qualifying-courses",
    sosRecordUrl: "https://texas-sos.appianportalsgov.com/rules-and-meetings?interface=VIEW_TEXAS_REGISTER_SUMMARY&recordId=465426",
    sosRecordId: "465426",
    localCopy: null,
    sha256: null,
    readOn: "2026-08-27",
    /* Today is 2026-08-27. The amendment is adopted and takes effect in four days. It is neither
       "current" nor "not found", and calling it either would be wrong in a different direction. */
    status: "adopted_pending_effective",
    reachability: REACHABILITY.READ,
    precedence:
      "The dates and the record id come from TREC's own rule record. The CONTROLLING TEXT is the Secretary of State's, which is not reachable from here — so the amendment's dates are recorded and its text is not.",
    materialClaims: [
      {
        id: "535-62-adoption-dates",
        claim: "22 TAC § 535.62 was proposed 4 May 2026, adopted 10 August 2026, and takes effect 31 August 2026. Emergency adopted: NO.",
        reliedOnBy: ["PROVIDER_TERM", "gate:TX_PROVIDER_RULE_SOURCE_LOCK"],
      },
      {
        id: "535-62-subject",
        claim:
          "TREC describes the change as updating terminology in subsection (i) for consistency with current practice and to align language with other rules, as a result of the REALM Portal.",
        reliedOnBy: [],
      },
    ],
  }),
  source({
    id: "trec-rule-535-65",
    authority: "Texas Real Estate Commission (rule record); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.65, Responsibilities and Operations of Providers of Qualifying Courses",
    documentNumber: "22 TAC § 535.65",
    revision: null,
    proposedDate: "2026-05-04",
    adoptedDate: "2026-08-10",
    effectiveDate: "2026-08-31",
    url: "https://www.trec.texas.gov/22-tac-%C2%A753565-responsibilities-and-operations-providers-qualifying-courses",
    sosRecordUrl: "https://texas-sos.appianportalsgov.com/rules-and-meetings?interface=VIEW_TEXAS_REGISTER_SUMMARY&recordId=465427",
    sosRecordId: "465427",
    localCopy: null,
    sha256: null,
    readOn: "2026-08-27",
    status: "adopted_pending_effective",
    reachability: REACHABILITY.READ,
    precedence: "Dates from TREC's rule record; controlling text is the Secretary of State's and is not reachable from here.",
    materialClaims: [
      {
        id: "535-65-adoption-dates",
        claim: "22 TAC § 535.65 was proposed 4 May 2026, adopted 10 August 2026, and takes effect 31 August 2026. Emergency adopted: NO.",
        reliedOnBy: ["gate:TX_PROVIDER_RULE_SOURCE_LOCK"],
      },
      {
        id: "535-65-completion-record",
        claim:
          "TREC's summary states the rule renames course completion certificates as COURSE COMPLETION RECORDS and requires either the student's licence number or application number on the record, so that REALM can automate processing that is currently manual.",
        reliedOnBy: ["deliverable:tx-completion-record"],
      },
    ],
    conflicts: [
      {
        id: "535-65-withdrawn-flag",
        question:
          "TREC's § 535.65 rule record renders a field reading 'Rule Withdrawn: 1'. The § 535.62 record renders no such field. A rule cannot be both adopted with an effective date and withdrawn, so the flag means something else — a withdrawn earlier proposal, or a display artefact of the agency's content system.",
        resolution:
          "UNRESOLVED. The dates are recorded as TREC states them and the flag is recorded as an open question to be settled against the Secretary of State record 465427. Nothing in this build depends on the answer.",
      },
    ],
  }),

  /* ── the Secretary of State's own text, reachable through the Texas Register ── */
  source({
    id: "sos-texas-register-2026-05-22",
    authority: "Texas Secretary of State",
    title: "Texas Register, 22 May 2026 — Title 22 Examining Boards, Proposed Rules",
    documentNumber: "TRD-202601975 (the § 535.62 / § 535.65 proposal); filed with the Office of the Secretary of State 8 May 2026",
    revision: "issue of 22 May 2026",
    effectiveDate: null,
    url: "https://www.sos.texas.gov/texreg/archive/May222026/Proposed%20Rules/22.EXAMINING%20BOARDS.html",
    localCopy: "texas/trec-sources/texas-register/2026-05-22-title22-proposed-rules.html",
    sha256: "6c5c97f0c283133b306913198d6c86dacf553de1ac03de31017ea93bda62063b",
    bytes: 172495,
    readOn: "2026-08-27",
    status: "proposed_text_as_published",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 3 — the Secretary of State's own publication, and the highest-ranked Texas source this project has actually opened. It carries the PROPOSED text of §§ 535.62 and 535.65 in full, not the adopted text; the adoption notice publishes in the issue of 28 August 2026, which returns 403 because it is not yet published.",
    materialClaims: [
      {
        id: "535-65-a-4-attorney-in-fact",
        claim:
          "§ 535.65(a)(4) as proposed: \"If a provider approved by the Commission does not maintain a fixed office in Texas for the duration of the provider's approval to offer courses, the provider shall designate a resident of this state as attorney-in-fact to accept service of process AND act as custodian of any records in Texas that the provider is required to maintain by this section. A power-of-attorney designating the resident must be filed with the Commission in a form acceptable to the Commission.\"",
        reliedOnBy: ["deliverable:texas-attorney-in-fact", "deliverable:texas-power-of-attorney", "deliverable:texas-records-custodian"],
      },
      {
        id: "535-65-a-1-provider-responsibilities",
        claim:
          "§ 535.65(a)(1) as proposed makes the provider responsible for course administration including prescribed time for required topics, student attendance records and pre-enrolment agreements, verifying instructor qualification, performance and attendance, proper examination administration, VALIDATION OF STUDENT IDENTITY ACCEPTABLE TO THE COMMISSION, maintaining student course completion records, advertising compliance, preventing recruitment during course presentation, and staff availability for public inquiry.",
        reliedOnBy: ["texas/submission/distance-delivery-controls.md"],
      },
      {
        id: "535-65-b-instructor",
        claim:
          "§ 535.65(b) as proposed requires a provider to use an instructor currently qualified under § 535.63 to teach the specified course, selected on the basis of expertise in the subject area and ability as an instructor.",
        reliedOnBy: ["deliverable:instructor-dossier"],
      },
      {
        id: "ownership-threshold-and-bond",
        claim:
          "The same issue states, for a change of ownership, that a Principal Information Form is required for each proposed new owner who holds AT LEAST 10% INTEREST in the school, and that financial documents must satisfy § 535.61 INCLUDING A $20,000 SURETY BOND.",
        reliedOnBy: ["deliverable:entity-principals", "deliverable:fin-surety-bond", "PROVIDER_TERM.bondAmount"],
      },
      {
        id: "rulemaking-authority",
        claim: "The proposal is made under Texas Occupations Code § 1101.151, which authorises the Commission to adopt and enforce rules necessary to administer Chapter 1101.",
        reliedOnBy: [],
      },
    ],
    conflicts: [
      {
        id: "proposed-not-adopted-text",
        question: "The text held is the text AS PROPOSED. Adopted text can differ from proposed text.",
        resolution:
          "OPEN and dated. The adoption notice publishes 28 August 2026. Until it is read, every claim above is labelled 'as proposed' in the record itself and nothing states it as the codified current rule.",
      },
    ],
  }),

  /* ── PCF-0 prep: the current contract-forms inventory ── */
  source({
    id: "trec-contracts-page-2026-08-29",
    authority: "Texas Real Estate Commission",
    title: "Contracts (current TREC contract and addendum forms listing)",
    documentNumber: null,
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/contracts",
    localCopy: "texas/trec-sources/articles/trec-contracts-page-2026-08-29.html",
    sha256: "8d07003825e46a4e0b617363641ac3aa75bd44ff61135aa18c7e0210bfa16d71",
    readOn: "2026-08-29",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence: "Tier-4 current forms listing, published by the agency that promulgates the forms. Parsed into config/texas/pcf-current-forms-inventory.mjs; captured before any Promulgated Contract Forms content is authored, per the work order's own requirement.",
    materialClaims: [
      {
        id: "form-20-19-current",
        claim: "As listed on this page, the One to Four Family Residential Contract (Resale) is Form 20-19, effective 07/01/2026 — matching the figure the work order asked to be verified directly.",
        reliedOnBy: ["config/texas/pcf-current-forms-inventory.mjs"],
      },
      {
        id: "42-forms-captured",
        claim: "42 forms are listed on this page as of the read date, spanning contracts, addenda, notices and disclosures, several bearing a 2026-07-01 or 2026-05-28 effective date not reflected in the PCF-0 outline (dated 06/20/2016).",
        reliedOnBy: ["config/texas/pcf-current-forms-inventory.mjs"],
      },
    ],
    conflicts: [
      {
        id: "pcf-outline-not-yet-crosswalked",
        question: "PCF-0's own outline units have not yet been mapped against this current inventory — some outline terminology may name a form by a superseded number or title.",
        resolution: "OPEN. That crosswalk is Phase 3 work and has not started; nothing in the build currently relies on the PCF-0 outline's own form references.",
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
  bondAmountStatus: "VERIFIED as proposed text — the Texas Register of 22 May 2026 states a $20,000 surety bond among the financial documents § 535.61 requires. The codified current text has still not been read.",
  reserveAmount: 10000,
  reserveAmountStatus: "UNVERIFIED — same.",
});

/* ── three locks, split by PURPOSE ────────────────────────────────────────────────────────────
 *
 * One lock over everything was too blunt, and it hid a real distinction: an administrative
 * access problem and a curriculum source problem are not the same problem, they block different
 * work, and different people clear them. Merged into one status, a provider-portal login barrier
 * looked like a reason not to write a course — which is exactly the wrong conclusion, and exactly
 * the one the TX-0 report drew.
 *
 * So the locks are separate, and neither is weakened to make the other pass.
 */

/** Provider, course, instructor, fee, bond, reserve, Texas presence, completion reporting. */
const PROVIDER_RULE_SOURCE_IDS = ["sos-tac-22-535", "trec-qe-provider-application", "trec-fee-schedule", "trec-rule-535-62", "trec-rule-535-65", "sos-texas-register-2026-05-22"];

/** PRINS1-1 and the substantive law Principles I is taught from. */
const PRINCIPLES_I_SOURCE_IDS = ["trec-prins1-1"];

const unreachable = (entry) =>
  entry.reachability === REACHABILITY.UNREACHABLE_JS_ONLY || entry.reachability === REACHABILITY.UNREACHABLE_LOGIN_REQUIRED;

const lockOver = (ids) => {
  const scope = SOURCES.filter((entry) => ids.includes(entry.id));
  const blocking = scope.filter(unreachable);
  return Object.freeze({
    status: blocking.length === 0 ? "PASS" : "FAIL",
    considered: scope.length,
    unreachable: Object.freeze(blocking.map((entry) => Object.freeze({ id: entry.id, title: entry.title, reachability: entry.reachability }))),
  });
};

export function providerRuleSourceLock() {
  return lockOver(PROVIDER_RULE_SOURCE_IDS);
}

/**
 * Principles I passes only when the course form is held AND every PRINS1-1 unit either has a
 * primary source on disk or is named as needing none. `statuteCoverage` is injected so this module
 * does not import the statute layer and the statute layer does not import this one.
 */
export function principlesISourceLock(statuteCoverage) {
  const formLock = lockOver(PRINCIPLES_I_SOURCE_IDS);
  const uncovered = statuteCoverage?.uncovered ?? ["statute coverage was not supplied"];
  return Object.freeze({
    status: formLock.status === "PASS" && uncovered.length === 0 ? "PASS" : "FAIL",
    form: formLock,
    unitsHeld: statuteCoverage?.held?.length ?? 0,
    unitsExcused: statuteCoverage?.excused?.length ?? 0,
    unitsUncovered: Object.freeze(uncovered),
  });
}

/** LOA-1 and the buyer/tenant-representation statute sections the 2026 update depends on. */
const LAW_OF_AGENCY_SOURCE_IDS = ["trec-loa-1", "oc-1101-buyer-representation-2026", "trec-buyer-rep-2026-article", "trec-iabs-1-2"];

/**
 * Law of Agency passes only when its form and its substantive-law sources are all reachable AND
 * every LOA-1 unit either has a primary source on disk or is named as needing none — the same
 * shape as principlesISourceLock, with statuteCoverage injected for the same layering reason.
 */
export function lawOfAgencySourceLock(statuteCoverage) {
  const formLock = lockOver(LAW_OF_AGENCY_SOURCE_IDS);
  const uncovered = statuteCoverage?.uncovered ?? ["statute coverage was not supplied"];
  return Object.freeze({
    status: formLock.status === "PASS" && uncovered.length === 0 ? "PASS" : "FAIL",
    form: formLock,
    unitsHeld: statuteCoverage?.held?.length ?? 0,
    unitsExcused: statuteCoverage?.excused?.length ?? 0,
    unitsUncovered: Object.freeze(uncovered),
  });
}

/** The aggregate passes only when both components pass. It cannot be granted on its own. */
export function sourceLock(statuteCoverage) {
  const provider = providerRuleSourceLock();
  const principles = principlesISourceLock(statuteCoverage);
  return Object.freeze({
    status: provider.status === "PASS" && principles.status === "PASS" ? "PASS" : "FAIL",
    provider,
    principles,
    unreachable: Object.freeze([...provider.unreachable, ...principles.form.unreachable]),
  });
}

export function held() {
  return SOURCES.filter((entry) => entry.localCopy && entry.sha256);
}

export const CONFLICTS = Object.freeze(SOURCES.flatMap((entry) => entry.conflicts.map((conflict) => Object.freeze({ sourceId: entry.id, ...conflict }))));

export default Object.freeze({ MANIFEST_VERSION, SOURCES, FEES, PROGRAMS, PATHWAY, FILING_PLAN, PROVIDER_TERM, CONFLICTS, sourceLock, providerRuleSourceLock, principlesISourceLock, lawOfAgencySourceLock, held, courseApplicationFee });
