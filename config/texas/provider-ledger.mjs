/**
 * Texas qualifying-education provider — deliverable ledger.
 *
 * WHY A LEDGER RATHER THAN A CHECK. California taught this project the difference: a check VERIFIES
 * what exists, and only a ledger ENUMERATES what must exist. A gate built on checks alone prints
 * GRANTED while half the packet is missing, because a deliverable nobody wrote a check for cannot
 * fail one. So this file lists what the application requires, and the gate refuses to grant while
 * any entry is outstanding — whether or not a check exists for it.
 *
 * WHAT THIS LEDGER IS BUILT FROM, AND WHAT IT IS NOT BUILT FROM. It is built from the fee schedule,
 * from TREC's published provider page, and from the Texas work order of 2026-08-27. It is NOT built
 * from the application itself: TREC's Qualifying Education Provider Application link redirects to an
 * Accela portal login, so the application's own field list and attachment list could not be read.
 * Every entry therefore carries `verifiedAgainstApplication: false`, and the ledger reports itself
 * as INCOMPLETE. It is a floor, not a list.
 *
 * OWNERS.
 *   build     — this repository can produce it.
 *   human     — a person must sign, pay, open an account, or obtain a document from a third party.
 *   regulator — TREC must answer or issue something before it can exist.
 */

export const OWNER = Object.freeze({ BUILD: "build", HUMAN: "human", REGULATOR: "regulator" });

const item = (record) => Object.freeze({ verifiedAgainstApplication: false, evidence: Object.freeze([]), ...record });

export const DELIVERABLES = Object.freeze([
  /* ── entity and ownership ── */
  item({ id: "entity-legal-name", section: "Entity", owner: OWNER.HUMAN, title: "Exact legal name of the StateCourse entity as formed", note: "Read from the company's own formation documents. Not to be assumed or inferred from the brand name." }),
  item({ id: "entity-jurisdiction", section: "Entity", owner: OWNER.HUMAN, title: "Jurisdiction of formation" }),
  item({ id: "entity-formation-documents", section: "Entity", owner: OWNER.HUMAN, title: "Formation documents as filed and stamped" }),
  item({ id: "entity-ein", section: "Entity", owner: OWNER.HUMAN, title: "IRS EIN confirmation letter", note: "Private. The number itself is never committed to this repository." }),
  item({ id: "entity-assumed-name", section: "Entity", owner: OWNER.HUMAN, title: "Assumed-name certificate, if the provider trades under a name other than its legal name" }),
  item({ id: "entity-texas-registration", section: "Entity", owner: OWNER.HUMAN, title: "Texas foreign-entity registration or Certificate of Fact, if required", note: "Whether it is required is a REGULATOR question for a distance-only provider with no Texas office." }),
  item({ id: "entity-principals", section: "Entity", owner: OWNER.HUMAN, title: "All owners and principals at the ownership threshold the current application sets", note: "The threshold itself is unread — the application is behind a login." }),
  item({ id: "entity-principal-forms", section: "Entity", owner: OWNER.HUMAN, title: "Principal Information Form for each principal" }),
  item({ id: "entity-background-forms", section: "Entity", owner: OWNER.HUMAN, title: "Background History Form for each person the application requires one from" }),
  item({ id: "entity-officers", section: "Entity", owner: OWNER.HUMAN, title: "Board, managers and officers as filed" }),
  item({ id: "entity-signers", section: "Entity", owner: OWNER.HUMAN, title: "Authorised signers" }),
  item({ id: "entity-operations-manager", section: "Entity", owner: OWNER.HUMAN, title: "Operations Manager designated" }),
  item({ id: "entity-records-manager", section: "Entity", owner: OWNER.HUMAN, title: "Records Manager designated" }),

  /* ── Texas presence, for a provider that will have no Texas classroom ── */
  item({ id: "texas-attorney-in-fact", section: "Texas presence", owner: OWNER.HUMAN, title: "Texas-resident attorney-in-fact who accepts service of process", note: "A named natural person or an entity TREC accepts. Not assumed to be satisfiable by a commercial registered-agent service — that is a REGULATOR question." }),
  item({ id: "texas-power-of-attorney", section: "Texas presence", owner: OWNER.HUMAN, title: "Power of Attorney executed in a form acceptable to TREC" }),
  item({ id: "texas-records-custodian", section: "Texas presence", owner: OWNER.HUMAN, title: "Texas records custodian identified and consenting" }),
  item({ id: "texas-records-location", section: "Texas presence", owner: OWNER.REGULATOR, title: "Which provider records must be maintained in Texas when the LMS and the records are electronic", note: "TREC clarification question 5." }),
  item({ id: "texas-no-classroom", section: "Texas presence", owner: OWNER.BUILD, title: "The build claims no Texas classroom and no Texas campus anywhere", evidence: [{ path: "public/statecourse/data/state-registry.json", mustNotContain: ["campus", "classroom location"] }] }),

  /* ── financial ── */
  item({ id: "fin-income-statement", section: "Financial", owner: OWNER.HUMAN, title: "Current income statement prepared in accordance with GAAP" }),
  item({ id: "fin-balance-sheet", section: "Financial", owner: OWNER.HUMAN, title: "Current balance sheet prepared in accordance with GAAP" }),
  item({ id: "fin-operating-budget", section: "Financial", owner: OWNER.HUMAN, title: "First-year operating budget" }),
  item({ id: "fin-market-survey", section: "Financial", owner: OWNER.HUMAN, title: "First-year enrollment market survey" }),
  item({ id: "fin-operating-account", section: "Financial", owner: OWNER.HUMAN, title: "Evidence of an operating bank account" }),
  item({ id: "fin-reserve-account", section: "Financial", owner: OWNER.HUMAN, title: "Evidence of a reserve account holding at least $10,000", note: "Nothing in this build says the reserve is restricted, TREC-controlled, or required to sit in a Texas bank. No source read here says any of that." }),
  item({ id: "fin-surety-bond", section: "Financial", owner: OWNER.HUMAN, title: "Original $20,000 surety bond with original or raised seal" }),
  item({ id: "fin-bond-delivery", section: "Financial", owner: OWNER.REGULATOR, title: "How the original bond is delivered when the application is filed online", note: "TREC clarification question 1." }),
  item({ id: "fin-bond-renewal-control", section: "Financial", owner: OWNER.BUILD, title: "Bond expiry and continuation tracked as an operating control", evidence: [{ path: "config/texas/regulatory-manifest.mjs", mustContain: ["bondAmount"] }] }),
  item({ id: "fin-liabilities-review", section: "Financial", owner: OWNER.HUMAN, title: "Liabilities and judgments review" }),
  item({ id: "fin-ratio-calculator", section: "Financial", owner: OWNER.BUILD, title: "Internal prima facie financial-ratio calculator", evidence: [{ path: "lib/texas-financial-readiness.mjs", mustContain: ["PLANNING_ONLY", "debtToEquity"] }] }),

  /* ── application mechanics ── */
  item({ id: "realm-account", section: "Application", owner: OWNER.HUMAN, title: "REALM/Accela account opened so the application and its field list can be read" , note: "Until this exists the ledger cannot be completed against the application, and the source lock cannot pass." }),
  item({ id: "app-fee-provider", section: "Application", owner: OWNER.HUMAN, title: "Provider application fee paid — $400 plus $12 Texas Online Fee" }),
  item({ id: "app-fee-courses", section: "Application", owner: OWNER.HUMAN, title: "Course application fees paid — $950 per 30-hour distance course as computed from the schedule" }),
  item({ id: "app-fee-reconciliation", section: "Application", owner: OWNER.REGULATOR, title: "Reconcile the computed fee against REALM's own calculation", note: "REALM controls. A difference is reported, not reconciled silently." }),

  /* ── instructor ── */
  item({ id: "instructor-dossier", section: "Instructor", owner: OWNER.HUMAN, title: "Qualification dossier for each proposed instructor", evidence: [{ path: "texas/submission/instructor-qualification-dossier-checklist.md", mustContain: ["Route 1", "Route 2", "Route 3"] }] }),
  item({ id: "instructor-determination", section: "Instructor", owner: OWNER.HUMAN, title: "The provider's own written qualification determination for the specified course" }),

  /* ── regulatory sources, which are a deliverable in their own right ── */
  item({ id: "source-tac-535", section: "Sources", owner: OWNER.HUMAN, title: "Adopted text of 22 TAC §§ 535.55, 535.60-535.67 and 535.101 retrieved from the Secretary of State", note: "Unreachable from the build environment. Until this exists no Texas rule may be stated and no course content may be written." }),
  item({ id: "source-occupations-code", section: "Sources", owner: OWNER.HUMAN, title: "Texas Occupations Code chapter 1101 retrieved from the Legislature", note: "Same." }),
  item({ id: "source-substantive-codes", section: "Sources", owner: OWNER.HUMAN, title: "Texas Property, Estates, Finance, Tax and Local Government Code chapters the Principles I units require", note: "Same. This is the blocker on TX-1 content." }),

  /* ── what this repository has already produced ── */
  item({ id: "course-forms-held", section: "Sources", owner: OWNER.BUILD, title: "The six current TREC course approval forms downloaded, hashed and held", evidence: [{ path: "texas/trec-sources/PRINS1-1.pdf" }, { path: "config/texas/regulatory-manifest.mjs", mustContain: ["1ec0a549dac17854"] }] }),
  item({ id: "prins1-structure", section: "Course", owner: OWNER.BUILD, title: "PRINS1-1 topic, unit and minute structure transcribed with invariants", evidence: [{ path: "config/texas/prins1-course-form.mjs", mustContain: ["totalMinutes", "1500"] }] }),
  item({ id: "six-course-records", section: "Course", owner: OWNER.BUILD, title: "Six separate disabled course records, never one 180-hour course", evidence: [{ path: "config/texas/regulatory-manifest.mjs", mustContain: ["modelledAsSingleCourse: false"] }] }),
  item({ id: "trec-memo", section: "Application", owner: OWNER.BUILD, title: "TREC clarification memo listing only what current authority does not resolve", evidence: [{ path: "texas/submission/trec-clarification-memo.md", mustContain: ["REGULATOR CLARIFICATION"] }] }),
  item({ id: "source-register", section: "Sources", owner: OWNER.BUILD, title: "Texas source register recording what was read and what could not be", evidence: [{ path: "texas/regulatory/primary-text-readings.md", mustContain: ["UNREACHABLE"] }] }),

  /* ── course content, blocked at the source ── */
  item({ id: "prins1-content", section: "Course", owner: OWNER.BUILD, title: "Principles of Real Estate I instructional text, 1500 minutes across 9 topics and 46 units", note: "BLOCKED at the source: writing it requires the Texas Occupations, Property, Estates, Finance and Tax Codes, none of which could be opened." }),
  item({ id: "prins1-quizzes", section: "Course", owner: OWNER.BUILD, title: "At least three topic-quiz questions for each of the nine topics", note: "Blocked behind the content." }),
  item({ id: "prins1-scenarios", section: "Course", owner: OWNER.BUILD, title: "At least three scenario-based learning exercises", note: "Blocked behind the content." }),
  item({ id: "prins1-exam-bank", section: "Course", owner: OWNER.BUILD, title: "120-item secure bank and four 60-item final versions with pairwise overlap no greater than one third", note: "Blocked behind the content." }),
]);

export const SECTIONS = Object.freeze([...new Set(DELIVERABLES.map((entry) => entry.section))]);

export const LEDGER_STATUS = Object.freeze({
  completeAgainstApplication: DELIVERABLES.every((entry) => entry.verifiedAgainstApplication),
  note:
    "INCOMPLETE. Built from the fee schedule, TREC's provider page and the work order. Not built from the application itself, which is behind a REALM/Accela login. Treat as a floor.",
});

export default Object.freeze({ OWNER, DELIVERABLES, SECTIONS, LEDGER_STATUS });
