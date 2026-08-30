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

export const MANIFEST_VERSION = "TX-MANIFEST-2026-08-30-v4";

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
        claim: "§ 1101.563: a license holder performing any act of real estate brokerage for a prospective buyer of residential real property (single-family house; duplex/triplex/quadraplex; or a condominium/cooperative unit) must enter a written agreement with the prospective buyer before showing residential property or, if none will be shown, before presenting an offer on the buyer's behalf. The agreement must state the services to be provided, its termination date, whether it is exclusive or non-exclusive, whether the license holder represents the buyer or (for a showing-only agreement under § 1101.562) does not, and the amount/rate of compensation and how it is determined, and must disclose in conspicuous language that broker compensation is not set by law and is fully negotiable. A showing-only agreement under § 1101.562 may not be exclusive and may not run more than fourteen days; a separate agreement is required if further brokerage acts follow the showing. Two separate discipline hooks back this up, and they sit in DIFFERENT subsections of § 1101.652: subsection (a-1)(3) makes failure to use a contract form required by § 1101.155 a ground for suspension or revocation, while subdivision (34) — 'fails to enter into a written agreement with a prospective buyer as required by Section 1101.563' — is the last item of the subsection (b) list, following (32) discrimination and (33) 'disregards or violates this chapter'. An earlier revision of this record cited that subdivision as (a)(34); it was re-read against the held text on 2026-08-29 and corrected to (b)(34).",
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
    /* The revision stamp printed on the form itself, top left, read off the held PDF — not the
       effective date below, which comes from TREC's forms listing. */
    revision: "11-03-2025",
    pages: 1,
    effectiveDate: "2026-01-01",
    url: "https://www.trec.texas.gov/sites/default/files/pdf-forms/IABS%201-2.pdf",
    listingUrl: "https://www.trec.texas.gov/forms/information-about-brokerage-services",
    /* The instrument 22 TAC § 531.20(a) adopts by reference. The rule is the authority. */
    adoptedBy: "22 TAC § 531.20(a)",
    controllingAuthority: ["22 TAC § 531.20", "Tex. Occ. Code § 1101.558(b-1)"],
    localCopy: "texas/trec-sources/forms/IABS-1-2.pdf",
    sha256: "5056930b66d237a7a4376db0c43f833929600f0b6e5ce6e42a417da824ef6b20",
    bytes: 1491257,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "Current TREC form (tier 4), superseding IABS 1-0 effective 2026-01-01 to reflect the § 1101.558(b-1)/§ 1101.562 notice requirements. THE FORM IS THE INSTRUMENT, NOT THE AUTHORITY: 22 TAC § 531.20 adopts it by reference and, with Occupations Code § 1101.558(b-1), is the controlling authority for everything the Law of Agency course states about the notice. The form is registered in config/texas/law-of-agency-statute-sources.mjs at tier identified-not-taught for exactly that reason.",
    materialClaims: [
      {
        id: "iabs-current-version",
        claim: "The current Information About Brokerage Services form is IABS 1-2, effective 01/01/2026, per TREC's own forms listing.",
        reliedOnBy: ["config/texas/law-of-agency-course-form.mjs T02U5"],
      },
      {
        id: "iabs-pdf-held-and-verified",
        claim: "The PDF held at texas/trec-sources/forms/IABS-1-2.pdf is a single page, carries the form number IABS 1-2 in its footer and the printed date 11-03-2025, and contains the 2026 material the rule and statute require — the broker's minimum duties, the written-agreement paragraph citing Occupations Code § 1101.563, the four representation postures including intermediary, the showing-without-representation conditions, and the 14-day non-exclusive limit on a showing-only agreement.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs trec-iabs-1-2-form"],
      },
      {
        id: "iabs-adopted-by-rule",
        claim: "22 TAC § 531.20(a) adopts this form by reference. No proposition in the Law of Agency curriculum is taken from the form's own text: the twelve modules were authored before the PDF was acquired and teach the notice through § 531.20 and Occupations Code § 1101.558(b-1).",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-531-20"],
      },
    ],
    conflicts: [
      {
        id: "iabs-pdf-not-downloaded",
        question: "The IABS 1-2 PDF itself has not yet been downloaded and hashed to texas/trec-sources/ — only the forms-listing page naming it was read.",
        resolution:
          "CLOSED 2026-08-30. The form was downloaded to texas/trec-sources/forms/IABS-1-2.pdf from https://www.trec.texas.gov/sites/default/files/pdf-forms/IABS%201-2.pdf, and this record was completed by RECOMPUTING the sha256 and byte count from that file on disk rather than copying a figure from anywhere — config/texas/law-of-agency-statute-sources.mjs recomputes both again on every import and would throw if they drifted. The file was then opened and read: one page, form number IABS 1-2 in the footer, printed revision stamp 11-03-2025, and the 2026 content recorded in the material claims above. The entry is kept rather than deleted so the record still shows that this was open between 2026-08-29 and 2026-08-30 and how it closed. Holding the form changes nothing about what the Law of Agency course teaches: § 531.20 and Occupations Code § 1101.558(b-1) remain the controlling authority, and the register carries the form at tier identified-not-taught rather than promoting it to a source of taught propositions.",
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

  /* ── substantive law acquired for the Law of Agency build ──────────────────────────────────
     The Texas chapters and the federal section fetched for LOA-1's Employment Issues topic. Each
     is recorded here with the scope its own text fixes, because the Law of Agency curriculum was
     corrected once for stating an employment-status conclusion wider than the statute it cited,
     and a manifest that repeated that error would re-import it. The other substantive chapters
     this course reads — Property Code chs. 5 and 301, Business and Commerce Code chs. 17 and 26,
     Civil Practice and Remedies Code ch. 16 and Estates Code ch. 101 — were acquired for earlier
     Texas builds and are hashed, read-recorded and re-verified against disk in
     config/texas/law-of-agency-statute-sources.mjs, which is the read register for this course. */
  source({
    id: "tx-labor-code-21",
    authority: "Texas Legislative Council",
    title: "Texas Labor Code, Chapter 21 (Employment Discrimination)",
    documentNumber: "Tex. Lab. Code ch. 21",
    revision: null,
    url: "https://tcss.legis.texas.gov/resources/LA/htm/LA.21.htm",
    localCopy: "texas/trec-sources/statutes/LA.21.htm",
    sha256: "c92d7ed636c5d88f55f4448134fd04da1f9f969ee20babb38d01c548ea5f15fc",
    bytes: 157702,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 2 — the statute, retrieved from the Texas Legislative Council's static resource layer. SCOPE: chapter 21 is an EMPLOYMENT statute. Nothing in it is relied on in this build as a fair-housing rule or as a rule of brokerage conduct; Texas fair housing is Property Code ch. 301 and 42 U.S.C. §§ 3602-3606.",
    materialClaims: [
      {
        id: "labor-21-employment-discrimination",
        claim:
          "Chapter 21 is the Texas employment-discrimination statute. § 21.002 supplies its definitions and protected characteristics; § 21.101 limits its age provisions to individuals 40 years of age or older; §§ 21.141-21.142 define 'employer' for the sexual-harassment subchapter as a person who employs ONE OR MORE employees and make an employer liable where it knew or should have known of harassment and failed to take immediate and appropriate corrective action; § 21.1065 extends those protections to unpaid interns; §§ 21.202, 21.254 and 21.256 fix the administrative and civil deadlines; and § 21.2585 governs compensatory and punitive damages.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs la-21", "config/texas/law-of-agency-course-form.mjs T09U2"],
      },
      {
        id: "labor-21-employee-status-not-decided",
        claim:
          "Whether a Texas real estate sales agent is an 'employee' for purposes of chapter 21 is NOT decided by any held source. The Law of Agency curriculum says so in T09U6 and states no conclusion; nothing in this build may assert one.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs GAPS common-law-employment-status-and-vicarious-liability-not-held"],
      },
    ],
  }),
  source({
    id: "tx-labor-code-201",
    authority: "Texas Legislative Council",
    title: "Texas Labor Code, Chapter 201 (Texas Unemployment Compensation Act — definitions and exclusions)",
    documentNumber: "Tex. Lab. Code ch. 201",
    revision: null,
    url: "https://tcss.legis.texas.gov/resources/LA/htm/LA.201.htm",
    localCopy: "texas/trec-sources/statutes/LA.201.htm",
    sha256: "f8a816c3ca477541417c65b34fd99ad4037ac223e02dc260dfe2b2ec88d96f3b",
    bytes: 77445,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 2 — the statute, retrieved from the Texas Legislative Council's static resource layer. SCOPE, taken from § 201.072's own opening words 'In this subtitle': the subtitle is the Texas Unemployment Compensation Act, so this chapter is authority on UNEMPLOYMENT COMPENSATION COVERAGE and on nothing else.",
    materialClaims: [
      {
        id: "labor-201-072-real-estate-exclusion",
        claim:
          "§ 201.072: in this subtitle, 'employment' does not include service performed by an individual as a real estate broker or salesperson if the individual engages in activities requiring a licence, substantially all of the remuneration for the services is directly related to sales or other output rather than to the number of hours worked, and the services are performed under a written contract providing that the individual will not be treated as an employee for state tax purposes. This decides UNEMPLOYMENT COMPENSATION COVERAGE ONLY — not common-law employment status, not vicarious liability, not wage-and-hour treatment, and not federal tax treatment.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs la-201", "config/texas/law-of-agency-course-form.mjs T09U1"],
      },
      {
        id: "labor-201-substantially-all-undefined",
        claim:
          "Neither § 201.072 nor any held Texas Workforce Commission rule defines 'substantially all'. No percentage appears anywhere in this build, and the curriculum states the absence rather than supplying a figure.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs GAPS irs-and-twc-administrative-material-not-held"],
      },
    ],
  }),
  source({
    id: "us-26-3508",
    authority: "Office of the Law Revision Counsel, U.S. House of Representatives",
    title: "26 U.S.C. § 3508 (Treatment of real estate agents and direct sellers)",
    documentNumber: "26 U.S.C. § 3508",
    revision: null,
    url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section3508&num=0&edition=prelim",
    localCopy: "texas/trec-sources/federal/us26-3508.html",
    sha256: "77a251dca1cb6510851bdc79089b664711607a6afb6d7b9a16590c7d702bef27",
    bytes: 150546,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "Federal statute. SCOPE, taken from the section's own opening words 'For purposes of this title': that title is Title 26, the Internal Revenue Code, so this section is authority on FEDERAL TAX TREATMENT ONLY.",
    materialClaims: [
      {
        id: "us-3508-qualified-real-estate-agent",
        claim:
          "§ 3508(a): for purposes of Title 26, an individual performing services as a qualified real estate agent is not treated as an employee and the person for whom the services are performed is not treated as an employer. § 3508(b)(1) fixes three cumulative conditions: the individual is a licensed real estate agent; substantially all of the remuneration for the services performed as a real estate agent is directly related to sales or other output rather than to the number of hours worked; and the services are performed under a written contract providing that the individual will not be treated as an employee with respect to those services for Federal tax purposes.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs 26-u-s-c-3508", "config/texas/law-of-agency-course-form.mjs T09U1"],
      },
      {
        id: "us-3508-scope-limit",
        claim:
          "§ 3508 does not decide Texas unemployment compensation coverage, common-law employment status, vicarious liability, wage-and-hour treatment, or a broker's supervisory responsibility under 22 TAC § 535.2. No Treasury regulation or Internal Revenue Service guidance under it is held.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs GAPS irs-and-twc-administrative-material-not-held"],
      },
    ],
  }),

  /* ── 22 TAC sections acquired for the Law of Agency build, one file per section ──────────────
     Thirty-two sections of the Commission's rules, downloaded on 2026-08-30 from TREC's own
     consolidated Rules page and stored verbatim as text, one file per section. They carry the
     same precedence caveat as the five sections already recorded in
     config/texas/trec-rules-source-lock.mjs and the same classification this manifest has always
     given that page: it is the REGULATED AGENCY'S OWN REPRODUCTION, not the Secretary of State's
     adopted text, which remains UNREACHABLE_JS_ONLY under source id sos-tac-22-535. The provider
     rule lock therefore still FAILS on that ground and is not weakened by these entries. What
     these records add is that the rules the Law of Agency curriculum states as law are now held,
     hashed and traceable rather than being cited from nothing. Read records — which unit relies
     on which section and what it establishes — live in
     config/texas/law-of-agency-statute-sources.mjs, which recomputes every hash below from disk. */
  source({
    id: "trec-rule-531-1",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 531.1, Definitions",
    documentNumber: "22 TAC § 531.1",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/531.1.txt",
    sha256: "e526560dbe9fdc688bd22c422977f18a052ed95ed26e90045907801dbfa48658",
    bytes: 322,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "531.1-operative",
        claim: "Defines 'Commission' and 'License Holder' for the whole of 22 TAC ch. 531, so the Canons that follow are read in the Act's own vocabulary.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-531-1"],
      },
    ],
  }),
  source({
    id: "trec-rule-531-2",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 531.2, Fidelity",
    documentNumber: "22 TAC § 531.2",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/531.2.txt",
    sha256: "e9e3e0e277df8b6ec627bf5aaacdcfff5fcc1b74093337c57341b975c14a0044",
    bytes: 778,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "531.2-operative",
        claim: "The first Canon: a license holder acting as an agent for another is a fiduciary whose primary duty is to represent the client's interests, who must treat other parties fairly, who must be faithful and observant to the trust placed in the license holder, and who must place no personal interest above the client's.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-531-2"],
      },
    ],
  }),
  source({
    id: "trec-rule-531-3",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 531.3, Integrity",
    documentNumber: "22 TAC § 531.3",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/531.3.txt",
    sha256: "e0426e6158f3cd3b6c26ddff7fd90cde9a7b851d2d67408d9553d786e8f3d43c",
    bytes: 281,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "531.3-operative",
        claim: "The second Canon: a special obligation to exercise integrity, including prudence and caution so as to avoid misrepresentation by acts of commission or omission — the held source for misrepresentation by silence.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-531-3"],
      },
    ],
  }),
  source({
    id: "trec-rule-531-4",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 531.4, Competency",
    documentNumber: "22 TAC § 531.4",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/531.4.txt",
    sha256: "43b112793ee2e6d947e0011df1910e2c923613c4bb55933851ee46eae67868b3",
    bytes: 601,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "531.4-operative",
        claim: "The third Canon: the obligation to be knowledgeable and competent, with its four requirements covering local market conditions, industry developments, judgment and skill, and education in the specific type of real estate being brokered.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-531-4"],
      },
    ],
  }),
  source({
    id: "trec-rule-531-18",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 531.18, Consumer Information",
    documentNumber: "22 TAC § 531.18",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/531.18.txt",
    sha256: "be1e80c58218eb2a23dce64db8cc5eba56c8aa88a783acefbe9d01eb15881598",
    bytes: 1227,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "531.18-operative",
        claim: "The Commission adopts the Consumer Protection Notice, TREC No. CN 1-5, by reference and requires EACH LICENSE HOLDER to display it at each place of business and to link to it on each business website with a prescribed label and minimum font size. The text of CN 1-5 itself is not held.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-531-18"],
      },
    ],
  }),
  source({
    id: "trec-rule-531-19",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 531.19, Discriminatory Practices",
    documentNumber: "22 TAC § 531.19",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/531.19.txt",
    sha256: "97daf1e28de570d597706a55d3cb3053dd1395b4504f92c8d62b9437d1634e10",
    bytes: 648,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "531.19-operative",
        claim: "No license holder shall inquire about, respond to or facilitate inquiries about, or disclose information about an owner, occupant or prospective party that indicates or is intended to indicate a preference, limitation or discrimination on any of eight listed bases, with disability defined to include AIDS, HIV-related illnesses and HIV infection.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-531-19"],
      },
    ],
  }),
  source({
    id: "trec-rule-531-20",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 531.20, Information About Brokerage Services",
    documentNumber: "22 TAC § 531.20",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/531.20.txt",
    sha256: "ae123f1c3d83e1467fe4a7c75a54346546f69afd541a39f9a36173819d3d6757",
    bytes: 2101,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "531.20-operative",
        claim: "The Commission adopts the Information About Brokerage Services Notice, TREC No. IABS 1-2, by reference, and prescribes the website link, its label and font size, the requirement to provide the completed notice at the first substantive communication under Occupations Code § 1101.558, the four permitted delivery methods, and the bar on placing the link in an email footnote or signature block. THIS RULE, NOT THE FORM, is the controlling authority for what the notice requires.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-531-20"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-1",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.1, Definitions",
    documentNumber: "22 TAC § 535.1",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.1.txt",
    sha256: "6ed8623c50818a454a4f4d9cb2ae3169bfb6ebdef73fbb949095142ecc10e99b",
    bytes: 1850,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.1-operative",
        claim: "The chapter 535 definitions, including 'compensation', 'place of business', 'associated broker' and 'trade association' — the last being a nonprofit voluntary member association subscribing to a written code of professional conduct or ethics, which is how a private code is distinguished from a Commission rule.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-1"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-2",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.2, Broker Responsibility",
    documentNumber: "22 TAC § 535.2",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.2.txt",
    sha256: "c776c91cb6432a735e1d69f079f9606b1f990fbefcea506adcb372f01d4f094b",
    bytes: 5902,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.2-operative",
        claim: "The broker-responsibility rule: written notice of a sales agent's authorized scope and the broker's responsibility for authorized acts and permitted acts beyond that scope; the highest fiduciary obligation to the principal; responsibility for trust funds and for a sponsored agent's property management and advertising; written delegation of supervision with 30-day notification to the Commission; the requirement that agreements be solicited and accepted in a broker's name; and the four-year record-retention list.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-2"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-3",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.3, Compensation to or Paid by a Sales Agent",
    documentNumber: "22 TAC § 535.3",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.3.txt",
    sha256: "e92a0cd37b738bc11a4cf7bf87d8f682dfa292a4eb36c405b66401ea6fd809c6",
    bytes: 502,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.3-operative",
        claim: "A sales agent may not receive or pay a commission or other valuable consideration except with the sponsoring broker's written consent.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-3"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-4",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.4, License Required",
    documentNumber: "22 TAC § 535.4",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.4.txt",
    sha256: "156c19eb775a2e33eb76d38188f0bf8ffc0d779017f3cde68b3b4c8d43014405",
    bytes: 4582,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.4-operative",
        claim: "What requires a licence, including that a person must be licensed to SHOW a property, with 'show' defined to include causing or permitting a property to be viewed, providing access, and HOSTING AN OPEN HOUSE; and the three conditions for unescorted access by a prospective tenant.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-4"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-5",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.5, License Not Required",
    documentNumber: "22 TAC § 535.5",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.5.txt",
    sha256: "16e8c0988d1a23fd80f369aa078ab3f4d04511014a99495772796a194c9eee9e",
    bytes: 2381,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.5-operative",
        claim: "The counterpart exclusions, including acting as a principal, an employee of a business entity (excluding an independent contractor), auctioneers who do not show or negotiate, clerical staff confirming size, price and terms, and (g) the compensation-receiving business entity that must be an LLC or S corporation at least 51 percent owned by the license holder and registered under § 535.35.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-5"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-16",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.16, Listings; Net Listings",
    documentNumber: "22 TAC § 535.16",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.16.txt",
    sha256: "dba92618f0200c824091b2d5f94fec70d47faf3814c04ad7baea8353cf97a2fd",
    bytes: 1196,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.16-operative",
        claim: "The obligation under a listing contract to negotiate the best possible transaction for the principal, the definition of a net listing and the conditions on taking one, and the obligation to provide a broker price opinion or comparative market analysis when negotiating a listing or offering to purchase for the license holder's own account.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-16"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-17",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.17, Broker Price Opinion, Comparative Market Analysis, or Sales Price Estimate",
    documentNumber: "22 TAC § 535.17",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.17.txt",
    sha256: "a67f0514277a956b4740738d23d949693075110d3236d0d2a996cb87e52f3662",
    bytes: 1388,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.17-operative",
        claim: "A license holder may not perform an appraisal or provide an opinion of value unless licensed under Occupations Code ch. 1103, and any broker price opinion, comparative market analysis or price estimate must carry the rule's verbatim disclaimer reproduced in at least 12-point font.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-17"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-20",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.20, Referrals from Unlicensed Persons",
    documentNumber: "22 TAC § 535.20",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.20.txt",
    sha256: "cba8a67aca7d8452cce4a7366e3a8e66b67ab0c3b11a22838b2ef3de0eff6189",
    bytes: 1212,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.20-operative",
        claim: "Referring a prospective party with the expectation of valuable consideration requires a licence, with 'valuable consideration' defined to include gifts of merchandise having a retail value greater than $50, rent bonuses and discounts.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-20"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-21",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.21, Mailing Address and Other Contact Information",
    documentNumber: "22 TAC § 535.21",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.21.txt",
    sha256: "fd0b790e01ccf6a73c05568760ca1df75a9ef21683cbed5a717f60609e31c1e7",
    bytes: 1173,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.21-operative",
        claim: "Each license holder must supply a mailing address, business address, business phone number and business email address to the Commission and report changes not later than the 10th day after a change.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-21"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-35",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.35, Registration of Certain Business Entities",
    documentNumber: "22 TAC § 535.35",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.35.txt",
    sha256: "32641992fb1a9b905f159e9084f78285fc954db95f8d041dbabb5f43632f2249",
    bytes: 1823,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.35-operative",
        claim: "The registration procedure, two-year term and certification requirement for an exempt business entity under § 535.5(g) and Occupations Code § 1101.355(d) before it may receive compensation on a license holder's behalf.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-35"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-131",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.131, Unlawful Conduct; Splitting Fees",
    documentNumber: "22 TAC § 535.131",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.131.txt",
    sha256: "0c35d9c86fe0b8f3fccc3b68fe6f79b5b7d8d51e85086382daadc273151f4ac5",
    bytes: 584,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.131-operative",
        claim: "A Texas broker may cooperate with and share earned commissions with a foreign broker, but only Texas license holders may handle negotiations physically conducted within Texas.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-131"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-141",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.141, Initiation of Investigation; Order Requirements",
    documentNumber: "22 TAC § 535.141",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.141.txt",
    sha256: "7dde456f63f828d3b2be9ba2048bc8096e1336aeca1f9485fab34e93c26b41c7",
    bytes: 6498,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.141-operative",
        claim: "A complaint naming a sales agent is a complaint against the sponsoring broker for the limited purpose of determining the broker's involvement and whether the broker fulfilled the broker's professional responsibilities, and the Commission prioritises complaints in three levels under the Occupations Code § 1101.204 criteria.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-141"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-144",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.144, When Acquiring or Disposing of Own Property or Property of Spouse, Parent or Child",
    documentNumber: "22 TAC § 535.144",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.144.txt",
    sha256: "0b8529b7fbd7a3bab2df030b2156159bf133f1ee9dcf2441a7d7b8ad8abf75ce",
    bytes: 1134,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.144-operative",
        claim: "For purposes of Occupations Code § 1101.652(a-1)(1), 'license holder' extends to acting for a spouse, parent or child, a business entity more than 10 percent owned by the license holder, or a trust with a close family connection, and written disclosure of licensed status is required before entering the contract.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-144"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-145",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.145, False Promise",
    documentNumber: "22 TAC § 535.145",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.145.txt",
    sha256: "45c6e20c061cd5747222f4401fe6b20fd9d808148377dbdcc67430ddcdf3de9a",
    bytes: 734,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.145-operative",
        claim: "'False promise' includes oral promises, and neither the absence of the promise from the written agreement, nor the absence of detrimental reliance, nor a contractual disclaimer or the parol evidence rule prevents the Commission from finding one.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-145"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-146",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.146, Maintaining Trust Money",
    documentNumber: "22 TAC § 535.146",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.146.txt",
    sha256: "afa8ef1f244fafd04893891ad681e266a4de57f013af32b6513b7df0b8b27719",
    bytes: 5084,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.146-operative",
        claim: "The trust-money regime: a sales agent may not maintain a trust account; trust money must be deposited or delivered to an authorised escrow agent not later than the close of business of the second working day after receipt unless the principals agree otherwise in writing; commingling is prohibited, with two forms of prima facie evidence; money the broker becomes entitled to must leave the account within 30 days; and documentary records and an accounting must be kept.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-146"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-147",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.147, Splitting Fee with Unlicensed Person",
    documentNumber: "22 TAC § 535.147",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.147.txt",
    sha256: "f6861f6f78ab4feb600464bc4733a21da895e067c59eb9d3e755d2b0877a4f04",
    bytes: 1733,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.147-operative",
        claim: "A broker or sales agent may not share a commission or fees with a person who performs acts requiring a licence and is not actively licensed, and the rebate rule requires written consents and forbids payment in a manner that misleads a broker, lender, title company or governmental agency.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-147"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-148",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.148, Receiving an Undisclosed Commission or Rebate",
    documentNumber: "22 TAC § 535.148",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.148.txt",
    sha256: "639ca0bd4d50e77313952587412ed57c35005e0d47e26b8e78be99744bbf4e1d",
    bytes: 3973,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.148-operative",
        claim: "A license holder may not receive a commission, rebate or fee from a person other than the client without prior disclosure to and consent of the client, may not enter exclusive-dealing agreements with a service provider while representing a party, and may not pay or receive referral fees among settlement service providers.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-148"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-149",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.149, Lottery or Deceptive Trade Practice",
    documentNumber: "22 TAC § 535.149",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.149.txt",
    sha256: "ebc17478542f03e1171b3d1412f842ffa736d76372ee7b8b625bbfb0655ff614",
    bytes: 672,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.149-operative",
        claim: "The elements of a 'lottery' for Occupations Code § 1101.652(b)(14), and the Commission's own statement that 'deceptive practices' include the acts described in Business and Commerce Code § 17.46 — the bridge between TREC discipline and the DTPA.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-149"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-153",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.153, Violating an Exclusive Agency",
    documentNumber: "22 TAC § 535.153",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.153.txt",
    sha256: "8859b2661f0b768cdf9d5307e2feeaabdb7ea2a8d37ad038c4ec028cfa2bc5ab",
    bytes: 446,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.153-operative",
        claim: "A license holder may not attempt to negotiate a transaction on property under exclusive listing with another broker, but the Act does not prohibit soliciting a listing from the owner while that listing is in force.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-153"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-154",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.154, Registration and Use of Alternate, Team and Assumed Business Names Used in Advertisements",
    documentNumber: "22 TAC § 535.154",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.154.txt",
    sha256: "d03acc8c470b9148411c463fe31ffa3a9b6344a761b5c43b88aea680c87e3bc8",
    bytes: 3332,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.154-operative",
        claim: "The definitions and registration requirements for alternate, team and assumed business names, including that a team name may not imply brokerage services independent of the sponsoring broker and must end with 'team' or 'group'.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-154"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-155",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.155, Advertisements",
    documentNumber: "22 TAC § 535.155",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.155.txt",
    sha256: "d810281b23fdbe923d0ac712213c8c99f173f6a07265a91b53bc91db6cf982b1",
    bytes: 5859,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.155-operative",
        claim: "Each advertisement must carry the name of the license holder or team and the broker's name in at least half the size of the largest contact information for any sales agent, associated broker or team name, with the rule's own definition of 'advertisement' and its list of what misleads for purposes of Occupations Code § 1101.652(b)(23).",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-155"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-156",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.156, Dishonesty; Bad Faith; Untrustworthiness",
    documentNumber: "22 TAC § 535.156",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.156.txt",
    sha256: "b432afcf0351fd1391a13ae231cef1db2cac3b47f47b2114c2dabf66ad2a2ecb",
    bytes: 1240,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.156-operative",
        claim: "The fiduciary relationship with the principal; the duty to convey all known information affecting the principal's decision on offers, with the written exception once an offer is accepted; the duty to put the principal's interest first while dealing honestly and fairly with all parties; the affirmative duty to keep the principal informed; and the duty to convey accurate information to the public.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-156"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-157",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.157, Obligation to Respond Timely",
    documentNumber: "22 TAC § 535.157",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.157.txt",
    sha256: "958c5d966bb1aa369d6bd80447a1ab1ed1835479929dd06962d6f5c98cbe87bb",
    bytes: 277,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.157-operative",
        claim: "A broker or sales agent must respond to the principal, to a license holder representing another party, or to an unrepresented party within two calendar days. The only held source for a response deadline.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-157"],
      },
    ],
  }),
  source({
    id: "trec-rule-535-191",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 535.191, Schedule of Administrative Penalties",
    documentNumber: "22 TAC § 535.191",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/535.191.txt",
    sha256: "e74c8d64a22aea761d36fe7e2ab31078ac04d32ca97dcf218247798e4b29a327",
    bytes: 2573,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "535.191-operative",
        claim: "The three administrative-penalty bands — $100-$1,500, $500-$3,000 and $1,000-$5,000 per violation per day — each with its own enumerated list of Act and rule provisions, plus the doubling provision for a history of previous violations. A provision's band is read off the list it appears in and is not generalised across bands.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-535-191"],
      },
    ],
  }),
  source({
    id: "trec-rule-537-11",
    authority: "Texas Real Estate Commission (published reproduction); Texas Secretary of State (controlling text)",
    title: "22 TAC § 537.11, Use of Standard Contract Forms; Unauthorized Practice of Law",
    documentNumber: "22 TAC § 537.11",
    revision: null,
    url: "https://www.trec.texas.gov/agency-information/rules-and-laws/trec-rules",
    localCopy: "texas/trec-sources/trec-rules/537.11.txt",
    sha256: "7a063a037d136c3241e60905831b98a1fa7c3ebbb96bba8b8d44439471bc8224",
    bytes: 4894,
    readOn: "2026-08-30",
    status: "current",
    reachability: REACHABILITY.READ,
    precedence:
      "TIER 4 — the regulator's own published reproduction of an adopted rule. NOT the Secretary of State's codified text, which could not be opened from this environment; the codified text has not been compared against it.",
    materialClaims: [
      {
        id: "537.11-operative",
        claim: "A license holder must use only Commission forms approved for mandatory use, subject to four exceptions, and may not practise law, give legal advice, opine on the legal effect of contract forms or on title, draft contract language including escalation, appraisal or contingency clauses, or discourage a principal from employing an attorney.",
        reliedOnBy: ["config/texas/law-of-agency-statute-sources.mjs tac-537-11"],
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

/**
 * LOA-1, the substantive law the Law of Agency course is taught from, and the 22 TAC sections it
 * states as law. Every id below is a record above with a localCopy and a hash, except the two that
 * are deliberately reachability-only. If any of them ever becomes unreachable the lock fails, which
 * is the point: this course cites all thirty-two of these rules to students.
 */
const LAW_OF_AGENCY_SOURCE_IDS = [
  "trec-loa-1",
  "tx-occupations-code-1101",
  "oc-1101-buyer-representation-2026",
  "trec-buyer-rep-2026-article",
  "trec-iabs-1-2",
  "tx-labor-code-21",
  "tx-labor-code-201",
  "us-26-3508",
  "trec-rule-531-1", "trec-rule-531-2", "trec-rule-531-3", "trec-rule-531-4",
  "trec-rule-531-18", "trec-rule-531-19", "trec-rule-531-20",
  "trec-rule-535-1", "trec-rule-535-2", "trec-rule-535-3", "trec-rule-535-4", "trec-rule-535-5",
  "trec-rule-535-16", "trec-rule-535-17", "trec-rule-535-20", "trec-rule-535-21", "trec-rule-535-35",
  "trec-rule-535-131", "trec-rule-535-141", "trec-rule-535-144", "trec-rule-535-145", "trec-rule-535-146",
  "trec-rule-535-147", "trec-rule-535-148", "trec-rule-535-149", "trec-rule-535-153", "trec-rule-535-154",
  "trec-rule-535-155", "trec-rule-535-156", "trec-rule-535-157", "trec-rule-535-191",
  "trec-rule-537-11",
];

/**
 * Law of Agency passes only when its form and its substantive-law sources are all reachable AND
 * every LOA-1 unit either has a primary source on disk or is named as needing none — the same
 * shape as principlesISourceLock, with statuteCoverage injected for the same layering reason.
 *
 * WHERE THE COVERAGE COMES FROM. config/texas/law-of-agency-statute-sources.mjs is the read register
 * for this course; its unitCoverage() measures all 57 LOA-1 units against the sources it holds and
 * recomputes every hash from disk. That register imports this manifest, so this function takes the
 * coverage as an argument rather than importing the register back — and the register exports a
 * zero-argument lawOfAgencySourceLock() that calls this one with unitCoverage() already supplied.
 * Call that one unless you have a reason to inject different coverage.
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
