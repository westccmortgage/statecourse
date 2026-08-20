/**
 * Colorado broker prelicensing — course engine.
 *
 * ONE ENGINE, SIX COURSES, 168 HOURS. C.R.S. § 12-10-203(4)(a) requires 48 hours in real estate law and
 * real estate practice, 48 in understanding and preparation of Colorado real estate contracts, and "A TOTAL
 * OF SEVENTY-TWO HOURS" from four named subjects — TRUST ACCOUNTS AND RECORD KEEPING, REAL ESTATE CLOSINGS,
 * CURRENT LEGAL ISSUES and PRACTICAL APPLICATIONS — ALLOCATING NONE AMONG THE FOUR.
 *
 * THE COMMISSION'S RULE MAKES THAT ALLOCATION, AND MAKES IT ASYMMETRICALLY. Rule 2.1.A.2 states the first
 * two as EXACT figures — "48 hours" — and the other four as FLOORS — "NOT LESS THAN" 24, 8, 8 and 32. The
 * four floors add to exactly the 72 the statute requires. The engine records which courses are exact and
 * which are floors, and asserts both the individual figures and the two totals.
 *
 * THE COMMISSION PUBLISHES ITS OWN COURSE OUTLINES, AND THIS BUILD IS WRITTEN TO THEM. For Arizona and
 * Washington this project recorded as its FIRST submission gate that the regulator's prescribed course
 * content could not be obtained. Colorado publishes all six — each naming its course objective, its major
 * topics, and THE HOURS ALLOCATED TO EACH TOPIC. Every module in this build is one of those topics at the
 * Commission's own hours, with ONE EXCEPTION recorded structurally: the Current Legal Issues outline states
 * hours for the course and NONE for its three topic areas, so that course's module hours are a StateCourse
 * decision and every one of its modules carries hoursAreStateCourseDecision: true.
 *
 * THE WAIVERS ARE BY COURSE, NOT BY BLOCK, AND ONE COURSE SURVIVES EVERY WAIVER.
 *   § 12-10-203(4)(b) — an applicant licensed as a BROKER in another jurisdiction completes ONLY the
 *                       subject matter areas in (4)(a)(II) and (4)(a)(III)(B): CONTRACTS and CLOSINGS.
 *   § 12-10-203(4)(c) — an applicant licensed as a SALESPERSON elsewhere completes ONLY (4)(a)(II) and all
 *                       of (4)(a)(III): CONTRACTS plus the whole 72-hour group.
 * EVERY APPLICANT COMPLETES THE CONTRACTS COURSE. coloradoRequiredCourses() computes the required set from
 * the applicant's out-of-state status, and an invariant asserts that the contracts course is in all three
 * sets.
 *
 * THREE COMMISSION COMPLETION REQUIREMENTS THAT READING DOES NOT SATISFY, each recorded and each gated:
 *   Contracts Topic III — "Students must complete a minimum of one of each of the 6 FAMILIES of listing and
 *                         buyer brokerage contracts ... [and] ONE OF EACH TYPE OF THE RELATED FORMS."
 *   Contracts Topic IV  — "Students must complete a minimum of one of each of the 4 FAMILIES of sales
 *                         contracts and complete one of each of the related forms. Include examples of NEW
 *                         FINANCING, LOAN ASSUMPTION, and OWNER CARRY FINANCING."
 *   Closings Topic V    — "Preparation of a MINIMUM OF EIGHT (8) CLOSING PROBLEMS ... THREE PROBLEMS SHALL
 *                         BE USING SAMPLES OF PREPARED CONTRACTS."
 * A fourth, in the Record Keeping outline's Topic II.B.4, requires "a Minimum of 2 Practical Exercises" and
 * then DESCRIBES FOUR. This build delivers four and records four.
 *
 * THE EXAMINATION IS THE STATE'S, AND IT HAS TWO PARTS. Rule 2.2.A: the Real Estate Licensing Examination is
 * administered and developed by a THIRD PARTY TESTING SERVICE and consists of a NATIONAL part and a COLORADO
 * part. Rule 2.2.C: the education must be COMPLETED AND PROOF FILED BEFORE taking it. Rule 2.2.F: a passing
 * score for either part is VALID FOR ONE YEAR. § 12-10-203(5)(a) gives the Commission authority to set the
 * minimum passing score — AND THIS BUILD STATES NO PASSING SCORE, because the rules read state none. An
 * invariant asserts stateExaminationPassingPercent is null.
 *
 * THE OUTLINES DIFFER ON TESTING, AND THE ENGINE RECORDS THE DIFFERENCE RATHER THAN FLATTENING IT. The
 * Closings and Record Keeping outlines require a written examination IN CAPITALS; Law and Practice,
 * Contracts and Practical Applications state that testing is required; the CURRENT LEGAL ISSUES OUTLINE
 * STATES NO EXAMINATION REQUIREMENT AT ALL, and this build does not supply one the Commission did not state.
 *
 * WHAT WAS READ. C.R.S. §§ 12-10-203 and 12-10-402 to 12-10-411; 4 CCR 725-1 in full, rule version 12355
 * from the Secretary of State's CCR; and the six Commission qualifying education outlines from
 * dre.colorado.gov. All on 2026-08-20. UNREAD_SOURCES carries the rest into the payload, and the largest
 * entry is EVERY COMMISSION-APPROVED FORM — which § 12-10-403(4)(c) and Rule 7.1.A require a broker to USE
 * and which the Contracts outline requires students to COMPLETE.
 *
 * Course version 1.0 submission draft — NOT APPROVED. No Colorado qualifying education hours are available.
 */

import LAW_AND_PRACTICE_BANK from "./colorado/law-and-practice-48-question-bank.mjs";
import CONTRACTS_BANK from "./colorado/contracts-and-regulations-48-question-bank.mjs";
import CLOSINGS_BANK from "./colorado/closings-24-question-bank.mjs";
import TRUST_ACCOUNTS_BANK from "./colorado/trust-accounts-8-question-bank.mjs";
import CURRENT_LEGAL_ISSUES_BANK from "./colorado/current-legal-issues-8-question-bank.mjs";
import PRACTICAL_APPLICATIONS_BANK from "./colorado/practical-applications-32-question-bank.mjs";

/* The regulator's figures. */
const REQUIRED_TOTAL_HOURS = 168;                    /* § 12-10-203(4)(a); Rule 2.1.A.2 */
const STATUTORY_FOUR_SUBJECT_GROUP_HOURS = 72;       /* § 12-10-203(4)(a)(III) — "a total of seventy-two hours" */
const MINIMUM_AGE = 18;                              /* § 12-10-203(4)(a) */
const EXAMINATION_SCORE_VALIDITY_YEARS = 1;          /* Rule 2.2.F */
const TRANSACTION_FILE_RETENTION_YEARS = 4;          /* Rule 6.20 */
const INDEPENDENT_PRACTICE_YEARS = 2;                /* § 12-10-203(5)(c)(I) */
const BROKERAGE_ADMINISTRATION_HOURS = 24;           /* § 12-10-203(5)(c)(II); Rule 2.1.B */
const RELATIONSHIP_BACKSTOP_YEARS = 1;               /* § 12-10-409(1)(b)(III) */
const COMPENSATION_SHARING_NOT_AGENCY = true;        /* § 12-10-410(2) */
const DUAL_AGENCY_PROHIBITED = true;                 /* § 12-10-406 */
const DEFAULT_RELATIONSHIP = "transaction-broker";   /* § 12-10-403(2) */
const OTHER_MONEY_DEPOSIT_BUSINESS_DAYS = 3;         /* Rule 5.7.B */
const PROPERTY_MANAGEMENT_DEPOSIT_BUSINESS_DAYS = 5; /* Rule 5.7.A */
const DEPOSIT_STATUS_DISCLOSURE_DAYS = 30;           /* Rule 5.8.B */
const DEPOSIT_TRANSFER_DAYS = 60;                    /* Rule 5.8.B */
const BENEFICIARY_REPORT_DAYS = 30;                  /* Rule 5.15.A */
const EXPIRED_LISTING_REMOVAL_DAYS = 3;              /* Rule 6.10.D.1 and D.2 */

/* THE COMMISSION SETS THE STATE EXAMINATION PASSING SCORE UNDER § 12-10-203(5)(a). THE RULES READ FOR THIS
   BUILD STATE NO FIGURE, SO THIS BUILD STATES NONE. An invariant below asserts it stays null. */
const STATE_EXAMINATION_PASSING_PERCENT = null;

/* StateCourse standards. No Colorado statute or rule read for this build prescribes an in-module assessment
   or an in-module score. */
const ENGAGEMENT_PASSING_PERCENT = 80;
const APPLIED_PASSING_PERCENT = 100;

/* § 12-10-203(4)(a)(III) names four subjects and allocates no hours among them. Rule 2.1.A.2 sets the
   floors. Recorded structurally so a payload cannot present a floor as an exact figure or the reverse. */
const STATUTORY_SUBJECTS = Object.freeze([
  { statuteCitation: "§ 12-10-203(4)(a)(I)", ruleCitation: "Rule 2.1.A.2.a", hours: 48, hoursAreExact: true, inFourSubjectGroup: false, courseId: "co-real-estate-law-and-practice-48-v1" },
  { statuteCitation: "§ 12-10-203(4)(a)(II)", ruleCitation: "Rule 2.1.A.2.b", hours: 48, hoursAreExact: true, inFourSubjectGroup: false, courseId: "co-contracts-and-regulations-48-v1" },
  { statuteCitation: "§ 12-10-203(4)(a)(III)(A)", ruleCitation: "Rule 2.1.A.2.d", hours: 8, hoursAreExact: false, inFourSubjectGroup: true, courseId: "co-trust-accounts-and-record-keeping-8-v1" },
  { statuteCitation: "§ 12-10-203(4)(a)(III)(B)", ruleCitation: "Rule 2.1.A.2.c", hours: 24, hoursAreExact: false, inFourSubjectGroup: true, courseId: "co-closings-24-v1" },
  { statuteCitation: "§ 12-10-203(4)(a)(III)(C)", ruleCitation: "Rule 2.1.A.2.e", hours: 8, hoursAreExact: false, inFourSubjectGroup: true, courseId: "co-current-legal-issues-8-v1" },
  { statuteCitation: "§ 12-10-203(4)(a)(III)(D)", ruleCitation: "Rule 2.1.A.2.f", hours: 32, hoursAreExact: false, inFourSubjectGroup: true, courseId: "co-practical-applications-32-v1" }
].map((item) => Object.freeze(item)));

/* The Commission's outline for Contracts Topic III requires one of each of six families and one of each
   related form; Topic IV requires one of each of four sales contract families and one of each related form,
   with three financing structures represented. Recorded so the engine can gate on completion. */
const REQUIRED_FORM_COMPLETIONS = Object.freeze([
  { id: "exclusive-right-to-sell", family: "Exclusive Right-to-Sell Listing Contracts", courseId: "co-contracts-and-regulations-48-v1", moduleId: "module-03", group: "brokerage-relationship" },
  { id: "exclusive-agency-listing", family: "Exclusive Agency Listing Contracts", courseId: "co-contracts-and-regulations-48-v1", moduleId: "module-03", group: "brokerage-relationship" },
  { id: "open-listing", family: "Open Listing Contracts", courseId: "co-contracts-and-regulations-48-v1", moduleId: "module-03", group: "brokerage-relationship" },
  { id: "exclusive-right-to-buy", family: "Exclusive Right-to-Buy Contracts", courseId: "co-contracts-and-regulations-48-v1", moduleId: "module-03", group: "brokerage-relationship" },
  { id: "exclusive-right-to-lease", family: "Exclusive Right-to-Lease Listing Contracts", courseId: "co-contracts-and-regulations-48-v1", moduleId: "module-03", group: "brokerage-relationship" },
  { id: "exclusive-tenant", family: "Exclusive Tenant Contracts", courseId: "co-contracts-and-regulations-48-v1", moduleId: "module-03", group: "brokerage-relationship" },
  { id: "contract-residential", family: "Contract to Buy and Sell Real Estate (Residential)", courseId: "co-contracts-and-regulations-48-v1", moduleId: "module-04", group: "sales-contract" },
  { id: "contract-commercial", family: "Contract to Buy and Sell Real Estate (Commercial)", courseId: "co-contracts-and-regulations-48-v1", moduleId: "module-04", group: "sales-contract" },
  { id: "contract-vacant-land-farm-ranch", family: "Contract to Buy and Sell Real Estate (Vacant Land/Farm & Ranch)", courseId: "co-contracts-and-regulations-48-v1", moduleId: "module-04", group: "sales-contract" },
  { id: "contract-exchange", family: "Contract to Exchange Real Estate (Simultaneous Exchange)", courseId: "co-contracts-and-regulations-48-v1", moduleId: "module-04", group: "sales-contract" }
].map((item) => Object.freeze(item)));

/* The Contracts outline's Topic IV note: "Include examples of new financing, loan assumption, and owner
   carry financing." */
const REQUIRED_FINANCING_STRUCTURES = Object.freeze(["new-financing", "loan-assumption", "owner-carry"]);

/* Closings Topic V: a minimum of eight, of which THREE from samples of prepared contracts. */
const REQUIRED_CLOSING_PROBLEMS = 8;
const REQUIRED_PREPARED_CONTRACT_PROBLEMS = 3;

/* Record Keeping Topic II.B.4 requires "a Minimum of 2 Practical Exercises" and describes four. */
const REQUIRED_PRACTICAL_EXERCISES = Object.freeze([
  { id: "broker-closed-sale", description: "From a sample contract and 6-column settlement worksheet, create journal and ledger entries leading to the closing of a real estate sale by a broker, and reconcile the ledger totals to the journal balance and a sample bank statement." },
  { id: "property-manager-reconciliation", description: "From sample files, journals and ledgers, reconcile the bank accounts for a property manager managing and holding security deposits for a minimum of 8 properties." },
  { id: "title-company-closed-sale", description: "Repeat the broker-closed sale exercise where the broker holds an earnest money deposit but the closing is performed by a title company." },
  { id: "software-backup-and-production", description: "Proper backup and printouts for software accounting systems, and production of records." }
].map((item) => Object.freeze(item)));

/* §§ 12-10-403 to 12-10-407 recognise two relationships and PROHIBIT a third. Recorded structurally so a
   payload cannot present Colorado as permitting dual agency. */
const STATUTORY_RELATIONSHIPS = Object.freeze([
  { id: "transaction-broker", name: "Transaction-broker", statute: "§ 12-10-407", isAgent: false, isDefault: true, arisesBy: "operation of § 12-10-403(2) unless single agency is established through a written agreement", confidentialItems: 6, survivesTermination: "accounting only — § 12-10-409(3)" },
  { id: "sellers-agent", name: "Single agent engaged by seller or landlord", statute: "§ 12-10-404", isAgent: true, isDefault: false, arisesBy: "a written agreement establishing single agency — § 12-10-403(2) and § 12-10-408(2)(b)", confidentialItems: 5, survivesTermination: "accounting and confidentiality — § 12-10-409(2)(b)" },
  { id: "buyers-agent", name: "Single agent engaged by buyer or tenant", statute: "§ 12-10-405", isAgent: true, isDefault: false, arisesBy: "a written agreement establishing single agency — § 12-10-403(2) and § 12-10-408(2)(b)", confidentialItems: 5, survivesTermination: "accounting and confidentiality — § 12-10-409(2)(b)" }
].map((item) => Object.freeze(item)));

const COURSES = Object.freeze({
  "co-real-estate-law-and-practice-48-v1": Object.freeze({
    courseId: "co-real-estate-law-and-practice-48-v1",
    title: "Real Estate Law and Practice",
    ruleName: "Real Estate Law and Real Estate Practice",
    statuteCitation: "C.R.S. § 12-10-203(4)(a)(I)",
    ruleCitation: "4 CCR 725-1, Rule 2.1.A.2.a",
    outlineApproved: "1 April 1998",
    hours: 48,
    hoursAreExact: true,
    inFourSubjectGroup: false,
    moduleHoursAreCommissions: true,
    outlineRequiresExamination: "testing-required",
    curriculumDir: "colorado/co-real-estate-law-and-practice-48-v1/curriculum",
    bank: LAW_AND_PRACTICE_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "Real property: characteristics, definitions, ownership, restrictions and transfer", hours: 10, commissionTopic: "I" },
      { id: "module-02", sequence: 2, title: "Valuation and appraisal", hours: 7, commissionTopic: "II" },
      { id: "module-03", sequence: 3, title: "Contracts, agency relationships with buyers and sellers, and federal requirements", hours: 12, commissionTopic: "III" },
      { id: "module-04", sequence: 4, title: "Real estate finance and settlement", hours: 12, commissionTopic: "IV" },
      { id: "module-05", sequence: 5, title: "Property management, leases and rents", hours: 7, commissionTopic: "V" }
    ].map((item) => Object.freeze(item)))
  }),
  "co-contracts-and-regulations-48-v1": Object.freeze({
    courseId: "co-contracts-and-regulations-48-v1",
    title: "Contracts and Regulations",
    ruleName: "Colorado Real Estate Contracts",
    statuteCitation: "C.R.S. § 12-10-203(4)(a)(II)",
    ruleCitation: "4 CCR 725-1, Rule 2.1.A.2.b",
    outlineApproved: "6 June 1996, updated 07/03/06",
    hours: 48,
    hoursAreExact: true,
    inFourSubjectGroup: false,
    moduleHoursAreCommissions: true,
    outlineRequiresExamination: "testing-required",
    requiresFormCompletions: true,
    curriculumDir: "colorado/co-contracts-and-regulations-48-v1/curriculum",
    bank: CONTRACTS_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "Regulations: the licence law, Colorado contract law, and the statutes the Commission names", hours: 8, commissionTopic: "I" },
      { id: "module-02", sequence: 2, title: "Colorado statutory relationships — §§ 12-10-402 to 12-10-411", hours: 4, commissionTopic: "II" },
      { id: "module-03", sequence: 3, title: "Brokerage relationship agreements: the six families and the related forms", hours: 16, commissionTopic: "III" },
      { id: "module-04", sequence: 4, title: "Sales contracts and related forms: the four families", hours: 16, commissionTopic: "IV" },
      { id: "module-05", sequence: 5, title: "Other considerations in real estate contracting", hours: 4, commissionTopic: "V" }
    ].map((item) => Object.freeze(item)))
  }),
  "co-closings-24-v1": Object.freeze({
    courseId: "co-closings-24-v1",
    title: "Closings",
    ruleName: "Real Estate Closings",
    statuteCitation: "C.R.S. § 12-10-203(4)(a)(III)(B)",
    ruleCitation: "4 CCR 725-1, Rule 2.1.A.2.c",
    outlineApproved: "6 June 1996",
    hours: 24,
    hoursAreExact: false,
    inFourSubjectGroup: true,
    moduleHoursAreCommissions: true,
    outlineRequiresExamination: "written-examination-required",
    requiresClosingProblems: true,
    curriculumDir: "colorado/co-closings-24-v1/curriculum",
    bank: CLOSINGS_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "The broker's responsibility relating to closing", hours: 1.0, commissionTopic: "I" },
      { id: "module-02", sequence: 2, title: "Introduction to a six-column worksheet", hours: 2.0, commissionTopic: "II" },
      { id: "module-03", sequence: 3, title: "Closing to a prepared contract", hours: 4.0, commissionTopic: "III" },
      { id: "module-04", sequence: 4, title: "Legal documents", hours: 1.0, commissionTopic: "IV" },
      { id: "module-05", sequence: 5, title: "Preparation of a minimum of eight closing problems", hours: 16.0, commissionTopic: "V" }
    ].map((item) => Object.freeze(item)))
  }),
  "co-trust-accounts-and-record-keeping-8-v1": Object.freeze({
    courseId: "co-trust-accounts-and-record-keeping-8-v1",
    title: "Record Keeping and Trust Accounts",
    ruleName: "Trust Accounts and Record Keeping",
    statuteCitation: "C.R.S. § 12-10-203(4)(a)(III)(A)",
    ruleCitation: "4 CCR 725-1, Rule 2.1.A.2.d",
    outlineApproved: "6 June 1996, updated 8/99",
    hours: 8,
    hoursAreExact: false,
    inFourSubjectGroup: true,
    moduleHoursAreCommissions: true,
    outlineRequiresExamination: "written-examination-required",
    requiresPracticalExercises: true,
    curriculumDir: "colorado/co-trust-accounts-and-record-keeping-8-v1/curriculum",
    bank: TRUST_ACCOUNTS_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "Legal requirements", hours: 0.5, commissionTopic: "I" },
      { id: "module-02", sequence: 2, title: "Recordkeeping", hours: 6.0, commissionTopic: "II" },
      { id: "module-03", sequence: 3, title: "Special areas of concern", hours: 1.0, commissionTopic: "III" },
      { id: "module-04", sequence: 4, title: "Termination of brokerage relationship", hours: 0.5, commissionTopic: "IV" }
    ].map((item) => Object.freeze(item)))
  }),
  "co-current-legal-issues-8-v1": Object.freeze({
    courseId: "co-current-legal-issues-8-v1",
    title: "Current Legal Issues",
    ruleName: "Current Legal Issues",
    statuteCitation: "C.R.S. § 12-10-203(4)(a)(III)(C)",
    ruleCitation: "4 CCR 725-1, Rule 2.1.A.2.e",
    outlineApproved: "2 July 1996",
    hours: 8,
    hoursAreExact: false,
    inFourSubjectGroup: true,
    /* The ONLY course in this build whose module hours are not the Commission's: its outline states hours
       for the course and none for its three topic areas. */
    moduleHoursAreCommissions: false,
    /* The outline is headed "8.1 Classroom Hours"; the Division's page says 8; Rule 2.1.A.2.e says not less
       than 8. This build delivers 8.0 and records the discrepancy rather than resolving it. */
    outlineHeadingHours: 8.1,
    outlineRequiresExamination: "none-stated",
    contentSuppliedByCommissionStaff: true,
    curriculumDir: "colorado/co-current-legal-issues-8-v1/curriculum",
    bank: CURRENT_LEGAL_ISSUES_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "Colorado rules, regulations, policies, position statements and instructive disciplinary proceedings", hours: 3.0, commissionTopic: "1" },
      { id: "module-02", sequence: 2, title: "Recent and relevant federal and state case law and statutory law", hours: 3.0, commissionTopic: "2" },
      { id: "module-03", sequence: 3, title: "The representative areas, and the outline's appendices", hours: 2.0, commissionTopic: "3" }
    ].map((item) => Object.freeze(item)))
  }),
  "co-practical-applications-32-v1": Object.freeze({
    courseId: "co-practical-applications-32-v1",
    title: "Practical Applications",
    ruleName: "Practical Application",
    statuteCitation: "C.R.S. § 12-10-203(4)(a)(III)(D)",
    ruleCitation: "4 CCR 725-1, Rule 2.1.A.2.f",
    outlineApproved: "7 August 2012, mandatory for all providers from 1 July 2013",
    hours: 32,
    hoursAreExact: false,
    inFourSubjectGroup: true,
    moduleHoursAreCommissions: true,
    outlineRequiresExamination: "test-required",
    curriculumDir: "colorado/co-practical-applications-32-v1/curriculum",
    bank: PRACTICAL_APPLICATIONS_BANK,
    modules: Object.freeze([
      { id: "module-01", sequence: 1, title: "Entering the field", hours: 3, commissionTopic: "I" },
      { id: "module-02", sequence: 2, title: "Residential competency", hours: 4, commissionTopic: "II", competencyModule: true },
      { id: "module-03", sequence: 3, title: "Property management competency", hours: 3, commissionTopic: "III", competencyModule: true },
      { id: "module-04", sequence: 4, title: "Commercial competency", hours: 2, commissionTopic: "IV", competencyModule: true },
      { id: "module-05", sequence: 5, title: "Other competency", hours: 1, commissionTopic: "V", competencyModule: true },
      { id: "module-06", sequence: 6, title: "Offer to closing", hours: 16, commissionTopic: "VI" },
      { id: "module-07", sequence: 7, title: "Current market trends", hours: 3, commissionTopic: "VII" }
    ].map((item) => Object.freeze(item)))
  })
});

const COURSE_IDS = Object.freeze(Object.keys(COURSES));

const CONTRACTS_COURSE_ID = "co-contracts-and-regulations-48-v1";
const CLOSINGS_COURSE_ID = "co-closings-24-v1";

const SUBMISSION_GATES = Object.freeze([
  { id: "commission-approved-forms", rule: "C.R.S. § 12-10-403(4)(c) and 4 CCR 725-1 Rule 7.1.A", requirement: "A broker shall use a Commission-approved form when such a form exists and is appropriate for the transaction, and the Contracts and Regulations outline requires students to COMPLETE one of each of six listing and buyer brokerage families, one of each of four sales contract families, and one of each of the related forms.", satisfied: false, blockedBy: "NO Commission-approved form was obtained, read or reproduced by this project. No module states any form's contents, version, date, paragraph numbering or provisions. Obtaining the current forms from the Division's website, as Rule 7.1.A directs, is the largest submission gate in the Colorado build." },
  { id: "current-legal-issues-content", rule: "Current Legal Issues outline, bracketed note", requirement: "Commission staff supply references, source materials, topics, areas and direction to providers shown on its records as authorized to provide this course, and periodically specify the items that will be MANDATORY in the course coverage.", satisfied: false, blockedBy: "This project is not on those records and has not received that material. This gate RECURS every time the Commission issues new material; it is not satisfied once." },
  { id: "position-statements", rule: "Contracts outline Topic I.A.3; Record Keeping outline Topic I.D.2; Practical Applications outline Topic I.D", requirement: "Commission interpretations and position statements, including CP 41 on gaining competency.", satisfied: false, blockedBy: "NO Commission position statement was obtained or read by this project. No module states the content, number, date or effect of one. This gate reaches three of the six Colorado courses." },
  { id: "transaction-file-checklist", rule: "4 CCR 725-1 Rule 6.20", requirement: "Required documents in a transaction file are designated in the Commission's Transaction File Checklist, found on the Division's website.", satisfied: false, blockedBy: "The Transaction File Checklist was not obtained. No module states what documents it designates." },
  { id: "online-course-approval-checklist", rule: "Practical Applications outline, testing note", requirement: "Courses taught online must meet the requirements set forth in the Online Course Approval Checklist created by the Division of Real Estate.", satisfied: false, blockedBy: "The Online Course Approval Checklist was not obtained. This is a gate for EVERY distance-delivered course in this build, not only Practical Applications." },
  { id: "errors-and-omissions-insurance", rule: "4 CCR 725-1 Chapter 3; Contracts outline Topic V.C", requirement: "The errors and omissions insurance requirement applicable to a Colorado broker.", satisfied: false, blockedBy: "The insurance rules in Chapter 3 were not read in detail for this build. No coverage amount, deductible, carrier requirement, policy form, effective date or exemption is stated anywhere in it." },
  { id: "school-approval", rule: "C.R.S. § 12-10-203(4)(a)", requirement: "Courses of study approved by the commission at an accredited college or university, or at a private occupational school with a certificate of approval from the private occupational school division under article 64 of title 23, or approved by the commission or licensed by an official state agency of another state.", satisfied: false, blockedBy: "No approval, certificate of approval or licence is held for this build." },
  { id: "course-approval", rule: "4 CCR 725-1 Rule 2.1.C and 2.1.D", requirement: "Completion of courses approved by the Commission, based upon educational principles acceptable to the Commission, and subject to audit at any time and at no cost with production of all instructional materials and student attendance records.", satisfied: false, blockedBy: "No Commission course approval is recorded for any of the six courses." },
  { id: "drafting-and-problem-assessment", rule: "Contracts outline Topics III and IV; Closings outline Topic V; Record Keeping outline Topic II.B.4", requirement: "Completion of six brokerage relationship families and four sales contract families with related forms; eight closing problems including three from prepared contracts; and the practical exercises.", satisfied: false, blockedBy: "The completion requirements are specified in the curriculum and recorded by this engine, but the assessment rubrics and the recording mechanism have not been built. The three prepared-contract closing problems additionally require Commission-approved contracts, which were not obtained." },
  { id: "current-legal-issues-hours", rule: "Current Legal Issues outline heading; Rule 2.1.A.2.e", requirement: "The outline is headed '8.1 Classroom Hours'; the Division's Broker Qualifying Education page says 8 hours; Rule 2.1.A.2.e says not less than 8.", satisfied: false, blockedBy: "This build delivers 8.0, which satisfies the rule's floor and produces the statutory 168 exactly. Whether the Commission intends 8.1 as the approved figure is an open question for the Division." },
  { id: "state-examination-passing-score", rule: "C.R.S. § 12-10-203(5)(a)", requirement: "The Commission has authority to set the minimum passing score for the state examination.", satisfied: false, blockedBy: "The rules read for this build state no passing score, so this build states none. Rule 2.2.A records only that the examination is administered and developed by a third party testing service and consists of a national part and a Colorado part." }
].map((item) => Object.freeze(item)));

const UNREAD_SOURCES = Object.freeze([
  "EVERY COMMISSION-APPROVED FORM — the listing and buyer brokerage contracts, the contracts to buy and sell, the counterproposal, the amend/extend agreements, the inspection notice, the seller's property disclosure, the brokerage disclosure forms, the change of status form, the square footage disclosure form and the licensee's buyout addendum",
  "The Commission's Transaction File Checklist, named by Rule 6.20; the Online Course Approval Checklist; and the Division's practitioner aids and audit guides",
  "The material Commission staff supplies to authorized providers of the Current Legal Issues course, and every Commission position statement including CP 41",
  "Every Colorado and federal case, including the Conway-Bogue decision and Colorado Bar Association v. The Title Guaranty Company, both named by the Contracts outline",
  "C.R.S. §§ 12-10-217, 12-10-218, 12-10-219, 12-10-222, 12-10-304 and 12-10-602 — every disciplinary ground, penalty, sanction and procedure, the affiliated business arrangement statute, the referral fee statute and the appraiser statute",
  "C.R.S. § 38-35.5-101, psychologically impacted property, cited by four of the duty provisions; and C.R.S. § 38-35-125, cited by Rule 6.19.E for Good Funds",
  "C.R.S. § 38-12-101 et seq., the Landlord Tenant Act, and Colorado's eviction and unlawful detainer statutes — every deposit limit, return period, notice period, habitability standard, late fee, retaliation provision and tenant remedy",
  "The Colorado Common Interest Ownership Act, article 33.3 of title 38; Colorado's statute of frauds; its Uniform Power of Attorney Act; and any Colorado electronic transactions or electronic signature statute",
  "Colorado's recording, mechanics' lien, adverse possession, foreclosure and public trustee, condemnation, escheat, entity, trust, probate, unclaimed property and U.C.C.C. statutes",
  "Colorado's water law in its entirety — appropriation, priority dates, adjudication, augmentation plans, well permits, exempt wells, ditch company shares and change of use proceedings — named by TWO of the six Commission outlines",
  "Colorado's oil and gas, severed mineral, surface use and dormant mineral provisions and every COGCC rule; its conservation easement, fence and agricultural statutes; and its surveying statutes",
  "Colorado's property tax, assessment, levy and tax sale statutes; its special district statutes; and its zoning, land use and subdivision statutes and every local ordinance",
  "The Colorado Fair Housing Act; the federal Fair Housing Act; the Americans with Disabilities Act; antitrust law; the Interstate Land Sales Full Disclosure Act; the Telephone Consumer Protection Act; the UCC; federal securities law; the Bankruptcy Code; and copyright law",
  "RESPA, TILA, TRID and ECOA; the federal lead-based paint regulations; the non-resident seller withholding statute and FIRPTA; and USPAP",
  "C.R.S. Title 12 Article 10 Parts 5 through 8, including the subdivision, conversion and time share provisions; and 4 CCR 725-2, 725-3 and 725-6"
]);

/* ---- Import-time invariants ---- */

if (COURSE_IDS.length !== 6) {
  throw new Error(`Colorado course engine: Rule 2.1.A.2 names six courses; ${COURSE_IDS.length} are defined.`);
}

let deliveredHours = 0;
let fourSubjectGroupHours = 0;
let moduleCount = 0;

for (const courseId of COURSE_IDS) {
  const course = COURSES[courseId];

  const moduleHours = course.modules.reduce((sum, module) => sum + module.hours, 0);
  if (Math.abs(moduleHours - course.hours) > 1e-9) {
    throw new Error(`Colorado course engine: ${courseId} modules total ${moduleHours} hours; the course is ${course.hours}.`);
  }

  const sequences = course.modules.map((module) => module.sequence);
  if (new Set(sequences).size !== sequences.length) {
    throw new Error(`Colorado course engine: ${courseId} has two modules claiming the same sequence position.`);
  }
  for (let position = 1; position <= course.modules.length; position += 1) {
    if (!sequences.includes(position)) throw new Error(`Colorado course engine: ${courseId} sequence position ${position} is claimed by no module.`);
  }

  for (const module of course.modules) {
    const bank = course.bank[module.id];
    if (!bank) throw new Error(`Colorado course engine: ${courseId} ${module.id} has no question bank.`);
    if (Math.abs(bank.hours - module.hours) > 1e-9) {
      throw new Error(`Colorado course engine: ${courseId} ${module.id} bank claims ${bank.hours} hours; the module table says ${module.hours}.`);
    }
    if (bank.commissionTopic !== module.commissionTopic) {
      throw new Error(`Colorado course engine: ${courseId} ${module.id} bank claims Commission topic ${bank.commissionTopic}; the module table says ${module.commissionTopic}.`);
    }
    /* The Current Legal Issues outline states no hours for its topic areas, so those module hours are this
       school's. Every module of that course must say so, and no other module may. */
    const shouldBeStateCourseHours = course.moduleHoursAreCommissions === false;
    if (Boolean(bank.hoursAreStateCourseDecision) !== shouldBeStateCourseHours) {
      throw new Error(`Colorado course engine: ${courseId} ${module.id} disagrees with its course about whether its hours are the Commission's. The Current Legal Issues outline states hours for the course and none for its topic areas; every other outline states them per topic.`);
    }
    moduleCount += 1;
  }

  deliveredHours += course.hours;
  if (course.inFourSubjectGroup) fourSubjectGroupHours += course.hours;
}

/* THE STATUTORY TOTAL, and the four-subject group inside it. */
if (deliveredHours !== REQUIRED_TOTAL_HOURS) {
  throw new Error(`Colorado course engine: the six courses total ${deliveredHours} hours; C.R.S. § 12-10-203(4)(a) and Rule 2.1.A.2 require ${REQUIRED_TOTAL_HOURS}.`);
}
if (fourSubjectGroupHours !== STATUTORY_FOUR_SUBJECT_GROUP_HOURS) {
  throw new Error(`Colorado course engine: the four subjects in § 12-10-203(4)(a)(III) total ${fourSubjectGroupHours} hours; the statute requires "a total of seventy-two hours".`);
}

/* THE ASYMMETRY IN RULE 2.1.A.2 — two exact figures and four floors. */
if (STATUTORY_SUBJECTS.length !== 6) {
  throw new Error(`Colorado course engine: § 12-10-203(4)(a) and Rule 2.1.A.2 name six subjects; ${STATUTORY_SUBJECTS.length} are recorded.`);
}
const exactSubjects = STATUTORY_SUBJECTS.filter((subject) => subject.hoursAreExact);
const floorSubjects = STATUTORY_SUBJECTS.filter((subject) => !subject.hoursAreExact);
if (exactSubjects.length !== 2) {
  throw new Error("Colorado course engine: Rule 2.1.A.2 states exactly two subjects as exact figures — 48 hours each for law and practice and for Colorado real estate contracts.");
}
if (floorSubjects.length !== 4) {
  throw new Error('Colorado course engine: Rule 2.1.A.2 states the other four subjects as floors — "not less than" 24, 8, 8 and 32.');
}
if (floorSubjects.reduce((sum, subject) => sum + subject.hours, 0) !== STATUTORY_FOUR_SUBJECT_GROUP_HOURS) {
  throw new Error("Colorado course engine: the four floors in Rule 2.1.A.2 add to exactly the seventy-two hours § 12-10-203(4)(a)(III) requires.");
}
for (const subject of STATUTORY_SUBJECTS) {
  const course = COURSES[subject.courseId];
  if (!course) throw new Error(`Colorado course engine: statutory subject ${subject.statuteCitation} names a course that does not exist.`);
  if (course.hours !== subject.hours || course.hoursAreExact !== subject.hoursAreExact || course.inFourSubjectGroup !== subject.inFourSubjectGroup) {
    throw new Error(`Colorado course engine: ${subject.courseId} disagrees with the statutory subject table recorded from § 12-10-203(4)(a) and Rule 2.1.A.2.`);
  }
}

/* THE CONTRACTS COURSE SURVIVES EVERY WAIVER. */
if (!COURSES[CONTRACTS_COURSE_ID]) {
  throw new Error("Colorado course engine: the Colorado real estate contracts course is required of every applicant under § 12-10-203(4)(a)(II), (4)(b) and (4)(c).");
}
for (const status of ["none", "broker", "salesperson"]) {
  const required = computeRequiredCourses(status);
  if (!required.includes(CONTRACTS_COURSE_ID)) {
    throw new Error(`Colorado course engine: § 12-10-203(4)(b) and (4)(c) both require the Colorado contracts course, so it must appear in the required set for out-of-state status "${status}".`);
  }
}
if (computeRequiredCourses("broker").length !== 2) {
  throw new Error("Colorado course engine: § 12-10-203(4)(b) requires an out-of-state BROKER to complete only the subject matter areas in (4)(a)(II) and (4)(a)(III)(B) — the contracts course and the closings course.");
}
if (computeRequiredCourses("salesperson").length !== 5) {
  throw new Error("Colorado course engine: § 12-10-203(4)(c) requires an out-of-state SALESPERSON to complete only (4)(a)(II) and all of (4)(a)(III) — the contracts course plus the whole four-subject group.");
}
if (computeRequiredCourses("none").length !== 6) {
  throw new Error("Colorado course engine: an applicant with no out-of-state licence completes all six courses.");
}

/* DUAL AGENCY IS PROHIBITED AND THE DEFAULT IS THE NON-AGENCY RELATIONSHIP. */
if (DUAL_AGENCY_PROHIBITED !== true) {
  throw new Error('Colorado course engine: § 12-10-406 provides, in its entirety, "A broker shall not establish dual agency with any seller, landlord, buyer, or tenant."');
}
if (STATUTORY_RELATIONSHIPS.length !== 3) {
  throw new Error(`Colorado course engine: §§ 12-10-404, 12-10-405 and 12-10-407 recognise three relationships; ${STATUTORY_RELATIONSHIPS.length} are recorded.`);
}
if (STATUTORY_RELATIONSHIPS.some((relationship) => relationship.id === "dual-agent")) {
  throw new Error("Colorado course engine: § 12-10-406 prohibits dual agency, so no dual agency relationship may be recorded.");
}
const defaults = STATUTORY_RELATIONSHIPS.filter((relationship) => relationship.isDefault);
if (defaults.length !== 1 || defaults[0].id !== DEFAULT_RELATIONSHIP) {
  throw new Error('Colorado course engine: § 12-10-403(2) makes the TRANSACTION-BROKER the single default — "A broker shall be considered a transaction-broker unless a single agency relationship is established through a written agreement."');
}
if (defaults[0].isAgent !== false) {
  throw new Error('Colorado course engine: § 12-10-407(1) provides that "a broker engaged as a transaction-broker is not an agent for either party."');
}
const transactionBroker = STATUTORY_RELATIONSHIPS.find((relationship) => relationship.id === "transaction-broker");
if (transactionBroker.confidentialItems !== 6) {
  throw new Error("Colorado course engine: § 12-10-407(3) lists SIX items a transaction-broker may not disclose without the informed consent of all parties — the union of the two single-agent lists plus material information about the other party.");
}
if (STATUTORY_RELATIONSHIPS.filter((relationship) => relationship.isAgent).every((relationship) => relationship.confidentialItems !== 5)) {
  throw new Error("Colorado course engine: §§ 12-10-404(2) and 12-10-405(2) each list five items a single agent may not disclose without informed consent.");
}

/* THE COMMISSION'S COMPLETION REQUIREMENTS. */
if (REQUIRED_FORM_COMPLETIONS.filter((form) => form.group === "brokerage-relationship").length !== 6) {
  throw new Error("Colorado course engine: the Contracts and Regulations outline Topic III names SIX families of listing and buyer brokerage contracts.");
}
if (REQUIRED_FORM_COMPLETIONS.filter((form) => form.group === "sales-contract").length !== 4) {
  throw new Error("Colorado course engine: the Contracts and Regulations outline Topic IV names FOUR families of sales contracts.");
}
for (const form of REQUIRED_FORM_COMPLETIONS) {
  const course = COURSES[form.courseId];
  if (!course || !course.requiresFormCompletions) {
    throw new Error(`Colorado course engine: required form ${form.id} is attached to a course that does not carry the outline's completion requirement.`);
  }
  if (!course.modules.some((module) => module.id === form.moduleId)) {
    throw new Error(`Colorado course engine: required form ${form.id} names module ${form.moduleId}, which does not exist in ${form.courseId}.`);
  }
}
if (REQUIRED_FINANCING_STRUCTURES.length !== 3) {
  throw new Error('Colorado course engine: the Contracts outline Topic IV note requires examples of "new financing, loan assumption, and owner carry financing" — three structures.');
}
if (REQUIRED_CLOSING_PROBLEMS !== 8 || REQUIRED_PREPARED_CONTRACT_PROBLEMS !== 3) {
  throw new Error("Colorado course engine: the Closings outline Topic V requires a minimum of EIGHT closing problems, of which THREE shall use samples of prepared contracts.");
}
if (REQUIRED_PREPARED_CONTRACT_PROBLEMS > REQUIRED_CLOSING_PROBLEMS) {
  throw new Error("Colorado course engine: the prepared-contract problems are a subset of the eight.");
}
if (REQUIRED_PRACTICAL_EXERCISES.length !== 4) {
  throw new Error('Colorado course engine: the Record Keeping outline Topic II.B.4 requires "a Minimum of 2 Practical Exercises" and describes FOUR; this build delivers four.');
}

/* THE STATE EXAMINATION PASSING SCORE IS THE COMMISSION'S AND WAS NOT READ. */
if (STATE_EXAMINATION_PASSING_PERCENT !== null) {
  throw new Error("Colorado course engine: § 12-10-203(5)(a) gives the Commission authority to set the minimum passing score, and the rules read for this build state no figure. This build states none.");
}
if (ENGAGEMENT_PASSING_PERCENT === APPLIED_PASSING_PERCENT) {
  throw new Error("Colorado course engine: the in-module engagement threshold and the applied threshold are different figures for different purposes.");
}

/* THE OUTLINES DIFFER ON TESTING, AND THE DIFFERENCE IS RECORDED RATHER THAN FLATTENED. */
const examinationRequirements = new Set(COURSE_IDS.map((id) => COURSES[id].outlineRequiresExamination));
if (!examinationRequirements.has("none-stated")) {
  throw new Error("Colorado course engine: the Current Legal Issues outline states NO examination requirement, and this build does not supply one the Commission did not state.");
}
if (COURSES["co-current-legal-issues-8-v1"].outlineRequiresExamination !== "none-stated") {
  throw new Error("Colorado course engine: the course whose outline states no examination requirement is Current Legal Issues.");
}
for (const id of ["co-closings-24-v1", "co-trust-accounts-and-record-keeping-8-v1"]) {
  if (COURSES[id].outlineRequiresExamination !== "written-examination-required") {
    throw new Error(`Colorado course engine: the ${id} outline requires, in its own capitals, that all students successfully complete a written examination covering all major topic areas.`);
  }
}

for (const gate of SUBMISSION_GATES) {
  if (!gate.satisfied && !gate.blockedBy) {
    throw new Error(`Colorado course engine: submission gate ${gate.id} is unsatisfied and does not say what blocks it.`);
  }
  if (gate.satisfied && gate.blockedBy) {
    throw new Error(`Colorado course engine: submission gate ${gate.id} is marked satisfied but still names a blocker.`);
  }
}

const PASSING_PERCENT = Object.freeze({
  applied: APPLIED_PASSING_PERCENT,
  engagement: ENGAGEMENT_PASSING_PERCENT,
  remediation: ENGAGEMENT_PASSING_PERCENT
});

/**
 * § 12-10-203(4)(b) and (4)(c). outOfStateLicence is "none", "broker" or "salesperson".
 *
 * (4)(b) — a BROKER licensed elsewhere completes only (4)(a)(II) and (4)(a)(III)(B): contracts and closings.
 * (4)(c) — a SALESPERSON licensed elsewhere completes only (4)(a)(II) and all of (4)(a)(III): contracts plus
 *          the whole four-subject group.
 *
 * Declared as a function so the import-time invariants above can call it.
 */
function computeRequiredCourses(outOfStateLicence = "none") {
  if (outOfStateLicence === "broker") {
    return [CONTRACTS_COURSE_ID, CLOSINGS_COURSE_ID];
  }
  if (outOfStateLicence === "salesperson") {
    return [CONTRACTS_COURSE_ID, ...COURSE_IDS.filter((id) => COURSES[id].inFourSubjectGroup)];
  }
  return [...COURSE_IDS];
}

export function coloradoRequiredCourses(outOfStateLicence = "none") {
  return Object.freeze(computeRequiredCourses(outOfStateLicence));
}

function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/* Deterministic per item id, so the presented order is stable for as long as the item exists and a recorded
   selection keeps its meaning permanently. Authoring puts the correct answer first; no student ever sees
   that order. */
function permuteChoices(choices, correctChoice, key) {
  const order = choices.map((_, index) => index);
  let seed = hashKey(key) || 1;
  for (let index = order.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 48271) + 11) >>> 0;
    const swap = seed % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return { choices: order.map((index) => choices[index]), correctChoice: order.indexOf(correctChoice) };
}

export function getColoradoCourse(courseId) {
  const course = COURSES[courseId];
  if (!course) return null;
  return Object.freeze({
    courseId: course.courseId,
    title: course.title,
    ruleName: course.ruleName,
    version: "1.0-submission-draft",
    state: "CO",
    regulator: "Colorado Real Estate Commission, Division of Real Estate",
    licenseTitle: "broker",
    hours: course.hours,
    hoursAreExact: course.hoursAreExact,
    hoursAreFloor: !course.hoursAreExact,
    inFourSubjectGroup: course.inFourSubjectGroup,
    statuteCitation: course.statuteCitation,
    ruleCitation: course.ruleCitation,
    commissionOutlineApproved: course.outlineApproved,
    /* The Commission publishes its own outline for every one of the six. */
    writtenToCommissionOutline: true,
    moduleHoursAreCommissions: course.moduleHoursAreCommissions,
    outlineHeadingHours: course.outlineHeadingHours ?? null,
    contentSuppliedByCommissionStaff: Boolean(course.contentSuppliedByCommissionStaff),
    modules: course.modules,
    outlineExaminationRequirement: course.outlineRequiresExamination,
    requiresFormCompletions: Boolean(course.requiresFormCompletions),
    requiredFormCompletions: course.requiresFormCompletions ? REQUIRED_FORM_COMPLETIONS : Object.freeze([]),
    requiredFinancingStructures: course.requiresFormCompletions ? REQUIRED_FINANCING_STRUCTURES : Object.freeze([]),
    requiresClosingProblems: Boolean(course.requiresClosingProblems),
    requiredClosingProblems: course.requiresClosingProblems ? REQUIRED_CLOSING_PROBLEMS : 0,
    requiredPreparedContractProblems: course.requiresClosingProblems ? REQUIRED_PREPARED_CONTRACT_PROBLEMS : 0,
    requiresPracticalExercises: Boolean(course.requiresPracticalExercises),
    requiredPracticalExercises: course.requiresPracticalExercises ? REQUIRED_PRACTICAL_EXERCISES : Object.freeze([]),
    stateExamination: Object.freeze({
      administeredBy: "a third party testing service — Rule 2.2.A",
      parts: Object.freeze(["national", "Colorado"]),
      educationCompletedAndProofFiledFirst: true,
      ruleCitation: "4 CCR 725-1, Rule 2.2",
      passingPercent: STATE_EXAMINATION_PASSING_PERCENT,
      passingPercentIsRegulatorFigure: false,
      passingScoreValidityYears: EXAMINATION_SCORE_VALIDITY_YEARS,
      /* § 12-10-203(5)(a): "The examination for a broker's license shall also include the preparation of a
         real estate closing statement." */
      includesClosingStatementPreparation: true
    }),
    dualAgencyProhibited: DUAL_AGENCY_PROHIBITED,
    defaultRelationship: DEFAULT_RELATIONSHIP,
    statutoryRelationships: STATUTORY_RELATIONSHIPS,
    submissionGates: SUBMISSION_GATES,
    unreadSources: UNREAD_SOURCES,
    /* What the regulator fixes. */
    regulatorRequirements: Object.freeze([
      `C.R.S. § 12-10-203(4)(a): an applicant must be at least ${MINIMUM_AGE} years of age and must have a degree with a major course of study in real estate, or have completed commission-approved courses of study — 48 hours in real estate law and real estate practice, 48 in understanding and preparation of Colorado real estate contracts, and A TOTAL OF SEVENTY-TWO HOURS from trust accounts and record keeping, real estate closings, current legal issues and practical applications.`,
      "C.R.S. § 12-10-203(4)(b): an applicant licensed as a real estate BROKER in another jurisdiction is required to complete ONLY the subject matter areas in (4)(a)(II) and (4)(a)(III)(B).",
      "C.R.S. § 12-10-203(4)(c): an applicant licensed as a real estate SALESPERSON in another jurisdiction is required to complete ONLY the course of study in (4)(a)(II) and (4)(a)(III).",
      `4 CCR 725-1, Rule 2.1.A.2: proof of completion of ${REQUIRED_TOTAL_HOURS} hours of classroom instruction or equivalent distance learning — 48, 48, and NOT LESS THAN 24, 8, 8 and 32.`,
      "4 CCR 725-1, Rule 2.1.C and 2.1.D: courses must be based upon educational principles acceptable to the Commission, and the Commission may audit them at any time and at no cost, requesting all instructional materials and student attendance records; failure to comply may result in removal of the provider, instructor and/or course from the approved provider list.",
      `4 CCR 725-1, Rule 2.2: the Real Estate Licensing Examination is administered and developed by a third party testing service and consists of a national part and a Colorado part; educational requirements must be COMPLETED AND PROOF FILED BEFORE taking it; and a passing score for either part is valid for ${EXAMINATION_SCORE_VALIDITY_YEARS} year.`,
      "C.R.S. § 12-10-203(5)(a): the examination for a broker's license shall also include the preparation of a real estate closing statement, and the Commission has authority to set the minimum passing score.",
      `C.R.S. § 12-10-203(5)(c): a broker who did not hold a current and valid licence on 31 December 1996 shall not engage in an independent brokerage practice without at least ${INDEPENDENT_PRACTICE_YEARS} years serving actively as a real estate broker, shall not employ another broker without first completing ${BROKERAGE_ADMINISTRATION_HOURS} clock hours in brokerage administration, and from 1 January 2019 shall not act as an employing broker without demonstrating sufficient experience and knowledge.`,
      'C.R.S. § 12-10-403(2): "A broker shall be considered a TRANSACTION-BROKER unless a single agency relationship is established through a WRITTEN AGREEMENT between the broker and the party or parties to be represented by the broker."',
      'C.R.S. § 12-10-406, in its entirety: "A broker shall not establish dual agency with any seller, landlord, buyer, or tenant."',
      "C.R.S. § 12-10-403(6)(b): the brokerage relationship with a designated broker SHALL NOT EXTEND to the employing broker, to other non-designated brokers, or to the firm — and § 12-10-408(2)(e)(II) provides that nothing in it limits the employing broker's or firm's responsibility to SUPERVISE licensees nor shields them from VICARIOUS LIABILITY.",
      "C.R.S. §§ 12-10-404(1)(c)(II) and 12-10-405(1)(c)(II): all offers presented in a timely manner REGARDLESS of whether the property is subject to a contract for sale — while (c)(I) provides the broker is not obligated to SEEK additional offers.",
      "C.R.S. §§ 12-10-404(5), 12-10-405(6) and 12-10-407(8): a broker may cooperate with other brokers but MAY NOT ENGAGE OR CREATE ANY SUBAGENTS.",
      "C.R.S. § 12-10-407(7): there shall be NO IMPUTATION of knowledge or information between any party and the transaction-broker or among persons within an entity engaged as a transaction-broker.",
      `C.R.S. § 12-10-409(1)(b): where the agreement is not performed or completed, the relationship ends at the EARLIER of an agreed expiration date, a termination or relinquishment by the parties, or ${RELATIONSHIP_BACKSTOP_YEARS} YEAR after the date of the engagement.`,
      'C.R.S. § 12-10-410(2): "Payment of compensation shall NOT be construed to establish an agency relationship between the broker and the party who paid the compensation."',
      "C.R.S. § 12-10-410(5) and (6): a buyer's agent must obtain the buyer's WRITTEN APPROVAL before proposing to be compensated from the listing side; and the identity of anyone paying compensation must be disclosed to the parties BEFORE the brokerage or listing agreement or the contract is entered into.",
      "C.R.S. § 12-10-403(4)(c) and 4 CCR 725-1 Rule 7.1: a broker SHALL USE A COMMISSION-APPROVED FORM when such a form exists and is appropriate; use of a client form or a government or lender form is limited to inserting transaction-specific information; and the broker shall advise the parties that the forms have important legal consequences and that they should consult legal counsel before signing.",
      `4 CCR 725-1, Rule 5.2, 5.5 and 5.7: all Money Belonging to Others kept separate and deposited into a trust or escrow account identified by the word "trust" or "escrow" plus a purpose label; property management requiring separate accounts, a minimum of one for rental receipts and one for security deposits; and deposit within ${PROPERTY_MANAGEMENT_DEPOSIT_BUSINESS_DAYS} business days for property management money and ${OTHER_MONEY_DEPOSIT_BUSINESS_DAYS} for all other money, in each case from receipt or mutual execution, whichever is later.`,
      '4 CCR 725-1, Rule 5.14: a journal and per-beneficiary ledgers with prescribed fields; "NO LEDGER MAY EVER BE ALLOWED TO HAVE A NEGATIVE CASH BALANCE"; the sum of ledger balances agreeing with the journal AT ALL TIMES after each posting; and THREE-WAY RECONCILIATION performed monthly with a report completed and maintained.',
      `4 CCR 725-1, Rule 5.8.B: on a change of management company, written disclosure to owner and current tenant within ${DEPOSIT_STATUS_DISCLOSURE_DAYS} days, transfer by the previous firm within ${DEPOSIT_TRANSFER_DAYS} days, and verification by the new firm that each deposit matches the amount in the current lease with disclosure of any discrepancy.`,
      `4 CCR 725-1, Rule 5.15.A: reports to beneficiaries as the management agreement provides and, absent a contrary provision, within ${BENEFICIARY_REPORT_DAYS} days after the end of the month in which funds were received or disbursed.`,
      "4 CCR 725-1, Rule 6.2: a broker must possess the necessary experience, training and knowledge and MAINTAIN COMPLIANCE with applicable law — and if not, must DECLINE, obtain them, obtain the assistance of the employing broker, a supervisory broker, a competent broker or LEGAL COUNSEL COMPETENT IN THE MATTER, or CO-LIST.",
      "4 CCR 725-1, Rule 6.3: employing brokers must exercise authority, direction and supervision over associate brokers AND all unlicensed employees — and whenever a complaint is filed against an associate broker, the Commission may investigate whether the EMPLOYING BROKER violated § 12-10-217(1)(r).",
      "4 CCR 725-1, Rule 6.5: the § 12-10-408 written disclosures must be made PRIOR TO ELICITING OR DISCUSSING CONFIDENTIAL INFORMATION, excluding preliminary conversations or small talk about price range, location and property styles.",
      "4 CCR 725-1, Rule 6.7: neither brokers nor teams may act as single agent for one consumer and single agent or transaction-broker for the other in the same transaction; the three lawful configurations are transaction-broker for both, transaction-broker for one with the other as a customer, or single agent for one with the other as a customer.",
      `4 CCR 725-1, Rule 6.10: advertising in the firm's name clearly and conspicuously; prohibited team-name terms; trade names filed with the Commission; the two "independently owned and operated" statements for third-party trade names or trademarks; each viewable page carrying the firm's name; expired listings removed within ${EXPIRED_LISTING_REMOVAL_DAYS} days including a written request to syndicators; the firm's name within the FIRST CLICK OF THE MOUSE where space is limited; past sales data citing its source with a disclaimer; no advertising availability or price without the owner's or owner's broker's authority; and the price quoted being the price agreed with the owner.`,
      "4 CCR 725-1, Rule 6.11: advertising residential square footage requires disclosure of the SOURCE on the Commission-approved form, with the date of issuance where the source has one; a broker may not use a source known to be unreliable and is responsible for indicating obvious mismeasurement by others.",
      '4 CCR 725-1, Rule 6.12: a CMA or BPO prepared for any reason other than an anticipated sale or purchase must carry the notice "This evaluation was prepared by a licensed real estate broker and is not an appraisal. This evaluation cannot be used for the purposes of obtaining financing." — and brokers are PROHIBITED from completing CMAs or BPOs used for the purpose of obtaining financing.',
      "4 CCR 725-1, Rule 6.13: offers presented to the other consumer's broker; on reasonable but unsuccessful attempts, to that broker's employing broker; and if none exists or those fail, directly to the other consumer. The rule states no time period.",
      "4 CCR 725-1, Rule 6.19: the broker with the brokerage relationship is responsible for the proper closing WHOEVER CONDUCTS IT; the closing statement must be ACCURATE, COMPLETE AND DETAILED and SIGNED BY THE BROKER; documents delivered to the firm IMMEDIATELY FOLLOWING CLOSING; attendance or reasonable availability with a substitute assuming JOINT RESPONSIBILITY; and GOOD FUNDS — no disbursement or authorization of disbursement until funds are received and available for immediate withdrawal.",
      `4 CCR 725-1, Rule 6.20: transaction files retained by BOTH broker and firm for ${TRANSACTION_FILE_RETENTION_YEARS} YEARS from the consummation date or from the expiration date of a listing contract that does not consummate — excluding existing public records, title commitments, loan applications, lender required disclosures and related affirmations from independent third party closing entities after the closing date.`
    ]),
    /* What this school decided. */
    stateCourseDecisions: Object.freeze([
      "Delivering each Commission outline topic as one module, at the Commission's own hours. The Commission publishes hours for its topics in five of the six outlines, and this build uses them.",
      "The 3.0 / 3.0 / 2.0 division of the Current Legal Issues course across its three topic areas. That outline states hours for the course and NONE for its topic areas, so this division is a StateCourse decision and every module of that course records it as one.",
      "Delivering 8.0 hours for Current Legal Issues against the outline's heading of 8.1, and recording the discrepancy as an open question for the Division rather than resolving it. 8.0 satisfies Rule 2.1.A.2.e's floor and produces the statutory 168 exactly.",
      "Delivering all FOUR practical exercises the Record Keeping outline describes, where it requires a minimum of two.",
      `The ${ENGAGEMENT_PASSING_PERCENT} percent in-module engagement threshold and the ${APPLIED_PASSING_PERCENT} percent applied threshold. No Colorado statute or rule read for this build prescribes an in-module assessment or an in-module score.`,
      "Recording each required form completion, closing problem and practical exercise separately, so that the Commission's own completion requirements gate credit rather than reading alone."
    ]),
    passingPercentages: Object.freeze({
      stateExamination: Object.freeze({ percent: STATE_EXAMINATION_PASSING_PERCENT, examination: "the Real Estate Licensing Examination", rule: "C.R.S. § 12-10-203(5)(a)", isRegulatorFigure: false, note: "The Commission has authority to set it; the rules read for this build state no figure, so this build states none." }),
      inModuleEngagement: Object.freeze({ percent: ENGAGEMENT_PASSING_PERCENT, examination: "in-module engagement and remediation checks", rule: null, isRegulatorFigure: false }),
      inModuleApplied: Object.freeze({ percent: APPLIED_PASSING_PERCENT, examination: "in-module applied scenario", rule: null, isRegulatorFigure: false })
    }),
    minimumAge: MINIMUM_AGE,
    approvalStatus: "Not approved. No Colorado qualifying education hours are available for this course. C.R.S. § 12-10-203(4)(a) requires courses of study approved by the commission, and 4 CCR 725-1 Rule 2.1.C requires them to be based upon educational principles acceptable to the Commission. Neither is held."
  });
}

export function getColoradoProgram() {
  return Object.freeze({
    state: "CO",
    regulator: "Colorado Real Estate Commission, Division of Real Estate",
    licenseTitle: "broker",
    version: "1.0-submission-draft",
    courses: Object.freeze(COURSE_IDS.map((id) => getColoradoCourse(id))),
    deliveredHours,
    requiredHours: REQUIRED_TOTAL_HOURS,
    fourSubjectGroupHours,
    statutoryFourSubjectGroupHours: STATUTORY_FOUR_SUBJECT_GROUP_HOURS,
    moduleCount,
    statutorySubjects: STATUTORY_SUBJECTS,
    /* Colorado publishes its own outlines. Arizona and Washington do not, and this project recorded that
       absence as their first submission gate. */
    writtenToCommissionOutlines: true,
    contractsCourseRequiredOfEveryApplicant: true,
    dualAgencyProhibited: DUAL_AGENCY_PROHIBITED,
    defaultRelationship: DEFAULT_RELATIONSHIP,
    stateExaminationPassingPercent: STATE_EXAMINATION_PASSING_PERCENT,
    note: `C.R.S. § 12-10-203(4)(a) requires 48 + 48 + a total of 72 hours from four named subjects, allocating none among the four; 4 CCR 725-1 Rule 2.1.A.2 makes that allocation, stating the first two courses as EXACT figures and the other four as FLOORS — "not less than" 24, 8, 8 and 32 — which add to exactly the 72 the statute requires. § 12-10-203(4)(b) and (4)(c) waive courses for an applicant licensed elsewhere, but EVERY APPLICANT COMPLETES THE COLORADO CONTRACTS COURSE.`,
    submissionGates: SUBMISSION_GATES,
    unreadSources: UNREAD_SOURCES,
    approvalStatus: "Not approved. No Colorado qualifying education hours are available."
  });
}

export function getColoradoModule(courseId, moduleId) {
  const course = COURSES[courseId];
  if (!course) return null;
  return course.modules.find((item) => item.id === moduleId) ?? null;
}

export function getColoradoAssessment(courseId, moduleId, kind = "engagement") {
  const course = COURSES[courseId];
  if (!course) return null;
  const module = getColoradoModule(courseId, moduleId);
  const bank = course.bank[moduleId];
  if (!module || !bank) return null;
  const authored = kind === "applied" ? [bank.applied] : bank[kind];
  if (!Array.isArray(authored) || !authored.length || authored.some((item) => !item)) return null;
  return {
    id: `${courseId}:${moduleId}-${kind}`,
    kind,
    courseId,
    moduleId,
    commissionTopic: module.commissionTopic,
    passingPercent: PASSING_PERCENT[kind],
    /* Stated on every assessment so nobody mistakes an in-module check for the Commission's requirement. */
    isTheStateExamination: false,
    satisfiesOutlineExaminationRequirement: false,
    satisfiesCompletionRequirement: false,
    items: authored.map((item, index) => {
      const id = `${moduleId}-${kind}-${String(index + 1).padStart(2, "0")}`;
      const presented = permuteChoices(item.choices, item.correctChoice, `${courseId}:${id}`);
      return { id, prompt: item.prompt, choices: presented.choices, correctChoice: presented.correctChoice, rationale: item.rationale };
    })
  };
}

export function publicColoradoAssessment(assessment) {
  if (!assessment) return null;
  return {
    id: assessment.id,
    kind: assessment.kind,
    courseId: assessment.courseId,
    moduleId: assessment.moduleId,
    commissionTopic: assessment.commissionTopic,
    passingPercent: assessment.passingPercent,
    isTheStateExamination: assessment.isTheStateExamination,
    satisfiesOutlineExaminationRequirement: assessment.satisfiesOutlineExaminationRequirement,
    satisfiesCompletionRequirement: assessment.satisfiesCompletionRequirement,
    items: assessment.items.map((item) => ({ id: item.id, prompt: item.prompt, choices: [...item.choices] }))
  };
}

export function scoreColoradoAssessment(assessment, answers) {
  if (!assessment) return null;
  if (!Array.isArray(answers) || answers.length !== assessment.items.length) return null;
  const results = [];
  for (const [index, item] of assessment.items.entries()) {
    /* Number(null), Number(""), Number(false) and Number([]) are all 0, so a coerced read would silently
       record choice 0 — a selection the student never made — into a permanent record. */
    const raw = answers[index];
    const selectedChoice = typeof raw === "number"
      ? raw
      : (typeof raw === "string" && /^\d+$/.test(raw.trim()) ? Number(raw.trim()) : Number.NaN);
    if (!Number.isInteger(selectedChoice) || selectedChoice < 0 || selectedChoice >= item.choices.length) return null;
    results.push({ itemId: item.id, selectedChoice, correct: selectedChoice === item.correctChoice, rationale: item.rationale });
  }
  const correctCount = results.filter((result) => result.correct).length;
  const percent = Math.round((correctCount / results.length) * 100);
  return { results, correctCount, total: results.length, percent, passed: percent >= assessment.passingPercent };
}

/**
 * Credit for ONE course.
 *
 * Every course requires every module complete and attendance recorded by the provider. Three courses carry
 * an additional Commission completion requirement that reading does not satisfy:
 *
 *   Contracts — one of each of six brokerage relationship families and one of each of four sales contract
 *               families, plus the three financing structures the outline's Topic IV note names.
 *   Closings  — eight closing problems, of which THREE from samples of prepared contracts.
 *   Record Keeping — the practical exercises the outline's Topic II.B.4 describes.
 *
 * And where the course's outline requires an examination, one must be recorded. The CURRENT LEGAL ISSUES
 * OUTLINE REQUIRES NONE, and this engine does not invent one: for that course, examinationRecorded is not a
 * gate.
 *
 * No Colorado statute or rule read for this build states an attendance percentage, so attendanceMet is a
 * provider input rather than a figure this engine asserts.
 */
export function coloradoCourseCredit(courseId, moduleStates = [], options = {}) {
  const course = COURSES[courseId];
  if (!course) return null;
  const {
    attendanceMet = false,
    examinationRecorded = false,
    completedFormIds = [],
    completedFinancingStructures = [],
    completedClosingProblems = 0,
    completedPreparedContractProblems = 0,
    completedExerciseIds = [],
    schoolApprovalNumber = null,
    courseApprovalNumber = null
  } = options;

  const completed = new Set(
    moduleStates.filter((state) => state?.status === "completed").map((state) => state.module_id ?? state.moduleId)
  );
  const credited = course.modules.filter((module) => completed.has(module.id));
  const creditedHours = credited.reduce((sum, module) => sum + module.hours, 0);
  const allModulesComplete = credited.length === course.modules.length;

  const recordedForms = new Set(Array.isArray(completedFormIds) ? completedFormIds : []);
  const outstandingForms = course.requiresFormCompletions
    ? REQUIRED_FORM_COMPLETIONS.filter((form) => !recordedForms.has(form.id))
    : [];
  const recordedStructures = new Set(Array.isArray(completedFinancingStructures) ? completedFinancingStructures : []);
  const outstandingStructures = course.requiresFormCompletions
    ? REQUIRED_FINANCING_STRUCTURES.filter((structure) => !recordedStructures.has(structure))
    : [];
  const formRequirementMet = !course.requiresFormCompletions
    || (outstandingForms.length === 0 && outstandingStructures.length === 0);

  const problemsSufficient = typeof completedClosingProblems === "number" && completedClosingProblems >= REQUIRED_CLOSING_PROBLEMS;
  const preparedSufficient = typeof completedPreparedContractProblems === "number"
    && completedPreparedContractProblems >= REQUIRED_PREPARED_CONTRACT_PROBLEMS
    && completedPreparedContractProblems <= (typeof completedClosingProblems === "number" ? completedClosingProblems : 0);
  const closingProblemRequirementMet = !course.requiresClosingProblems || (problemsSufficient && preparedSufficient);

  const recordedExercises = new Set(Array.isArray(completedExerciseIds) ? completedExerciseIds : []);
  const outstandingExercises = course.requiresPracticalExercises
    ? REQUIRED_PRACTICAL_EXERCISES.filter((exercise) => !recordedExercises.has(exercise.id))
    : [];
  const practicalExerciseRequirementMet = !course.requiresPracticalExercises || outstandingExercises.length === 0;

  const examinationRequired = course.outlineRequiresExamination !== "none-stated";
  const examinationRequirementMet = !examinationRequired || Boolean(examinationRecorded);

  const unsatisfiedGates = SUBMISSION_GATES.filter((gate) => !gate.satisfied);
  const courseComplete = allModulesComplete
    && Boolean(attendanceMet)
    && examinationRequirementMet
    && formRequirementMet
    && closingProblemRequirementMet
    && practicalExerciseRequirementMet;
  const hasBothNumbers = Boolean(schoolApprovalNumber) && Boolean(courseApprovalNumber);

  return {
    courseId,
    completedModules: credited.length,
    totalModules: course.modules.length,
    creditedHours,
    courseHours: course.hours,
    hoursAreFloor: !course.hoursAreExact,
    inFourSubjectGroup: course.inFourSubjectGroup,
    allModulesComplete,
    attendanceMet: Boolean(attendanceMet),
    outlineExaminationRequirement: course.outlineRequiresExamination,
    examinationRequired,
    examinationRecorded: Boolean(examinationRecorded),
    examinationRequirementMet,
    requiresFormCompletions: Boolean(course.requiresFormCompletions),
    outstandingFormIds: Object.freeze(outstandingForms.map((form) => form.id)),
    outstandingFinancingStructures: Object.freeze([...outstandingStructures]),
    formRequirementMet,
    requiresClosingProblems: Boolean(course.requiresClosingProblems),
    requiredClosingProblems: course.requiresClosingProblems ? REQUIRED_CLOSING_PROBLEMS : 0,
    requiredPreparedContractProblems: course.requiresClosingProblems ? REQUIRED_PREPARED_CONTRACT_PROBLEMS : 0,
    completedClosingProblems: typeof completedClosingProblems === "number" ? completedClosingProblems : 0,
    completedPreparedContractProblems: typeof completedPreparedContractProblems === "number" ? completedPreparedContractProblems : 0,
    closingProblemRequirementMet,
    requiresPracticalExercises: Boolean(course.requiresPracticalExercises),
    outstandingExerciseIds: Object.freeze(outstandingExercises.map((exercise) => exercise.id)),
    practicalExerciseRequirementMet,
    courseComplete,
    certificateEligible: courseComplete && hasBothNumbers && unsatisfiedGates.length === 0,
    certificateBlockedBy: (() => {
      if (!allModulesComplete) {
        return `${credited.length} of ${course.modules.length} modules complete (${creditedHours} of ${course.hours} hours).`;
      }
      if (!attendanceMet) {
        return "The provider has not recorded the attendance requirement as met. No Colorado statute or rule read for this build states an attendance percentage, so no standard is asserted here.";
      }
      if (!examinationRequirementMet) {
        return course.outlineRequiresExamination === "written-examination-required"
          ? `The Commission's ${course.title} outline requires that ALL STUDENTS SUCCESSFULLY COMPLETE A WRITTEN EXAMINATION COVERING ALL MAJOR TOPIC AREAS OF THE OUTLINE, and none has been recorded.`
          : `The Commission's ${course.title} outline requires testing to establish satisfactory completion of the statutory requirements, and none has been recorded.`;
      }
      if (!formRequirementMet) {
        const parts = [];
        if (outstandingForms.length) {
          parts.push(`${outstandingForms.length} of ${REQUIRED_FORM_COMPLETIONS.length} required form completions are not recorded: ${outstandingForms.map((form) => form.family).join("; ")}`);
        }
        if (outstandingStructures.length) {
          parts.push(`the outline's Topic IV note requires examples of new financing, loan assumption and owner carry financing, and ${outstandingStructures.join(", ")} ${outstandingStructures.length === 1 ? "is" : "are"} not recorded`);
        }
        return `The Commission's Contracts and Regulations outline requires students to COMPLETE these forms. ${parts.join(". ")}.`;
      }
      if (!closingProblemRequirementMet) {
        return `The Commission's Closings outline Topic V requires preparation of a minimum of ${REQUIRED_CLOSING_PROBLEMS} closing problems, of which ${REQUIRED_PREPARED_CONTRACT_PROBLEMS} shall use samples of prepared contracts. ${completedClosingProblems} problems and ${completedPreparedContractProblems} prepared-contract problems are recorded.`;
      }
      if (!practicalExerciseRequirementMet) {
        return `The Commission's Record Keeping and Trust Accounts outline Topic II.B.4 requires prepared practical exercises. ${outstandingExercises.length} of ${REQUIRED_PRACTICAL_EXERCISES.length} are not recorded: ${outstandingExercises.map((exercise) => exercise.id).join(", ")}.`;
      }
      if (!hasBothNumbers) {
        return "C.R.S. § 12-10-203(4)(a) requires courses of study APPROVED BY THE COMMISSION at an approved school. No school approval number and no course approval number has been issued.";
      }
      if (unsatisfiedGates.length) {
        return `${unsatisfiedGates.length} submission gates are unsatisfied. The first is — ${unsatisfiedGates[0].rule}: ${unsatisfiedGates[0].blockedBy}`;
      }
      return null;
    })()
  };
}

/**
 * Education readiness across the courses the applicant's status requires.
 *
 * § 12-10-203(4)(b) and (4)(c) waive courses by SUBJECT AREA for an applicant licensed elsewhere — and the
 * Colorado contracts course survives every waiver. Rule 2.2.C then requires the education to be COMPLETED
 * AND PROOF FILED BEFORE the applicant takes the Real Estate Licensing Examination.
 *
 * Nothing here decides eligibility for anything. That is the Commission's.
 */
export function coloradoEducationReadiness(courseCredits = [], options = {}) {
  const { age = null, outOfStateLicence = "none", degreeInRealEstate = false } = options;
  const required = computeRequiredCourses(outOfStateLicence);

  const completedSet = new Set(
    courseCredits.filter((record) => record?.courseComplete && COURSES[record.courseId]).map((record) => record.courseId)
  );
  const outstanding = required.filter((id) => !completedSet.has(id));
  const completedHours = [...completedSet].reduce((sum, id) => sum + COURSES[id].hours, 0);
  const requiredHours = required.reduce((sum, id) => sum + COURSES[id].hours, 0);

  /* § 12-10-203(4)(a): a degree from an accredited degree-granting college or university with a major
     course of study in real estate is an ALTERNATIVE to the courses. */
  const meetsCourseRequirement = Boolean(degreeInRealEstate) || outstanding.length === 0;
  const ageMet = typeof age === "number" ? age >= MINIMUM_AGE : null;

  return {
    outOfStateLicence,
    requiredCourseIds: Object.freeze([...required]),
    completedCourseIds: Object.freeze([...completedSet].filter((id) => required.includes(id))),
    outstandingCourseIds: Object.freeze([...outstanding]),
    completedHours,
    requiredHours,
    totalProgramHours: REQUIRED_TOTAL_HOURS,
    contractsCourseRequired: required.includes(CONTRACTS_COURSE_ID),
    contractsCourseComplete: completedSet.has(CONTRACTS_COURSE_ID),
    degreeInRealEstate: Boolean(degreeInRealEstate),
    meetsCourseRequirement,
    minimumAge: MINIMUM_AGE,
    ageMet,
    educationBeforeExamination: true,
    examinationRuleCitation: "4 CCR 725-1, Rule 2.2.C",
    determinationIsTheCommissions: true,
    blockedBy: (() => {
      if (!meetsCourseRequirement) {
        const waiver = outOfStateLicence === "broker"
          ? " C.R.S. § 12-10-203(4)(b) relieves an applicant licensed as a broker in another jurisdiction of everything except the Colorado contracts course and the closings course."
          : outOfStateLicence === "salesperson"
            ? " C.R.S. § 12-10-203(4)(c) relieves an applicant licensed as a salesperson in another jurisdiction of everything except the Colorado contracts course and the four-subject group."
            : "";
        return `${outstanding.length} of ${required.length} required courses are not complete: ${outstanding.map((id) => COURSES[id].title).join(", ")}.${waiver}`;
      }
      if (ageMet === false) return `C.R.S. § 12-10-203(4)(a) requires an applicant for a broker's license to be at least ${MINIMUM_AGE} years of age.`;
      return null;
    })()
  };
}

/**
 * 4 CCR 725-1, Rule 2.2.F: "A passing score for either part of the Real Estate Licensing Examination is
 * valid for ONE (1) YEAR. Failure to submit a complete application within one (1) year will result in the
 * examination grade being invalid."
 *
 * passedOn and applicationDate are ISO date strings.
 */
export function coloradoExaminationScoreValidity(passedOn, applicationDate = null) {
  if (typeof passedOn !== "string") return null;
  const passed = new Date(passedOn);
  if (Number.isNaN(passed.valueOf())) return null;

  const expiresOn = new Date(passed);
  expiresOn.setFullYear(expiresOn.getFullYear() + EXAMINATION_SCORE_VALIDITY_YEARS);

  let withinWindow = null;
  let application = null;
  if (typeof applicationDate === "string") {
    const parsed = new Date(applicationDate);
    if (!Number.isNaN(parsed.valueOf())) {
      application = parsed;
      withinWindow = parsed <= expiresOn;
    }
  }

  return {
    passedOn: passed.toISOString().slice(0, 10),
    validityYears: EXAMINATION_SCORE_VALIDITY_YEARS,
    expiresOn: expiresOn.toISOString().slice(0, 10),
    applicationDate: application ? application.toISOString().slice(0, 10) : null,
    withinWindow,
    measuredTo: "submission of a complete application — 4 CCR 725-1, Rule 2.2.F",
    blockedBy: withinWindow === false
      ? `The examination part was passed on ${passed.toISOString().slice(0, 10)}. Under Rule 2.2.F the grade is invalid unless a complete application was submitted by ${expiresOn.toISOString().slice(0, 10)}.`
      : null
  };
}

export const COLORADO_COURSE_IDS = COURSE_IDS;
export const COLORADO_COURSES = COURSES;
export const COLORADO_STATUTORY_SUBJECTS = STATUTORY_SUBJECTS;
export const COLORADO_STATUTORY_RELATIONSHIPS = STATUTORY_RELATIONSHIPS;
export const COLORADO_REQUIRED_FORM_COMPLETIONS = REQUIRED_FORM_COMPLETIONS;
export const COLORADO_REQUIRED_FINANCING_STRUCTURES = REQUIRED_FINANCING_STRUCTURES;
export const COLORADO_REQUIRED_CLOSING_PROBLEMS = REQUIRED_CLOSING_PROBLEMS;
export const COLORADO_REQUIRED_PREPARED_CONTRACT_PROBLEMS = REQUIRED_PREPARED_CONTRACT_PROBLEMS;
export const COLORADO_REQUIRED_PRACTICAL_EXERCISES = REQUIRED_PRACTICAL_EXERCISES;
export const COLORADO_SUBMISSION_GATES = SUBMISSION_GATES;
export const COLORADO_UNREAD_SOURCES = UNREAD_SOURCES;
export const COLORADO_REQUIRED_TOTAL_HOURS = REQUIRED_TOTAL_HOURS;
export const COLORADO_FOUR_SUBJECT_GROUP_HOURS = STATUTORY_FOUR_SUBJECT_GROUP_HOURS;
export const COLORADO_CONTRACTS_COURSE_ID = CONTRACTS_COURSE_ID;
export const COLORADO_CLOSINGS_COURSE_ID = CLOSINGS_COURSE_ID;
export const COLORADO_STATE_EXAMINATION_PASSING_PERCENT = STATE_EXAMINATION_PASSING_PERCENT;
export const COLORADO_EXAMINATION_SCORE_VALIDITY_YEARS = EXAMINATION_SCORE_VALIDITY_YEARS;
export const COLORADO_TRANSACTION_FILE_RETENTION_YEARS = TRANSACTION_FILE_RETENTION_YEARS;
export const COLORADO_RELATIONSHIP_BACKSTOP_YEARS = RELATIONSHIP_BACKSTOP_YEARS;
export const COLORADO_INDEPENDENT_PRACTICE_YEARS = INDEPENDENT_PRACTICE_YEARS;
export const COLORADO_BROKERAGE_ADMINISTRATION_HOURS = BROKERAGE_ADMINISTRATION_HOURS;
export const COLORADO_OTHER_MONEY_DEPOSIT_BUSINESS_DAYS = OTHER_MONEY_DEPOSIT_BUSINESS_DAYS;
export const COLORADO_PROPERTY_MANAGEMENT_DEPOSIT_BUSINESS_DAYS = PROPERTY_MANAGEMENT_DEPOSIT_BUSINESS_DAYS;
export const COLORADO_DEPOSIT_STATUS_DISCLOSURE_DAYS = DEPOSIT_STATUS_DISCLOSURE_DAYS;
export const COLORADO_DEPOSIT_TRANSFER_DAYS = DEPOSIT_TRANSFER_DAYS;
export const COLORADO_BENEFICIARY_REPORT_DAYS = BENEFICIARY_REPORT_DAYS;
export const COLORADO_EXPIRED_LISTING_REMOVAL_DAYS = EXPIRED_LISTING_REMOVAL_DAYS;
export const COLORADO_DUAL_AGENCY_PROHIBITED = DUAL_AGENCY_PROHIBITED;
export const COLORADO_DEFAULT_RELATIONSHIP = DEFAULT_RELATIONSHIP;
