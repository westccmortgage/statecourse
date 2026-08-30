/**
 * Florida — regulatory manifest.
 *
 * WHAT THIS FILE IS FOR. Every regulated fact this Florida build rests on is written down here
 * once, with the authority it came from, the copy of that authority held on disk, and the hash of
 * that copy. Nothing downstream is allowed to assert a regulated fact that does not appear here.
 * That is the whole mechanism: a document that reads well reads well whether or not it is true, so
 * the check cannot be "does this sound right" — it has to be "is this claim in the manifest, and
 * does the manifest's source still say it".
 *
 * HOW FLORIDA DIFFERS FROM TEXAS, AND WHY THAT MATTERS TO THIS FILE. Texas's two highest
 * authorities could not be opened from this environment at all — the Secretary of State moved the
 * Administrative Code behind a JavaScript portal and the statutes site serves an application shell
 * to every non-browser client — so the Texas manifest exists largely to record what could NOT be
 * read. Florida is the opposite case and the manifest has to be honest about that too. The
 * Legislature serves Chapter 475 as static HTML, and the Department of State serves every 61J2 rule
 * and every document a rule incorporates by reference. EVERY authority below was read. There is no
 * UNREACHABLE entry, and none has been invented to make the file look cautious.
 *
 * WHICH MEANS THE INTERESTING FAILURES HERE ARE OF A DIFFERENT KIND. When you can read everything,
 * what you find is not silence but disagreement, and there are three disagreements recorded below
 * that a reader who only skimmed the rules would never see:
 *
 *   1. Rule 61J2-3.008(4)(d) fixes the sales associate examination at "at least 100 items, or 2
 *      items per instruction hour", which for this course is 100, or 120, or 126, depending on
 *      which hours you count and which half of the sentence governs. The 1.8 minute per item limit
 *      in the same paragraph looks as though it should settle the question and does not: it is a
 *      ceiling on time allowed, not an equality, and the examination's own 150 minutes sits under
 *      the ceiling for every one of the three counts.
 *   2. Rule 61J2-17.011(2) sends the reader to "Section 475.25(2)(a), F.S." for the school
 *      permitholder's qualification. Section 475.25(2) is about revoking a licence issued by
 *      mistake and has no paragraph (a) of that kind. The cross-reference does not resolve — and
 *      Phase 0 v1 compounded that by reading the rule's next sentence as closing the statutory
 *      examination route. It does not: it conditions the BROKER branch on the licence being a
 *      Florida one, and says nothing about the alternative. A defective citation cannot repeal a
 *      statute by accident. See config/florida/school-permit-ledger.mjs.
 *   3. Rule 61J2-3.008(4)(b)3.3 allows a pre-licence course by correspondence "by reason of a
 *      hardship as defined by rule", and s. 475.17(2)(a)3 requires that route to exist — but Rule
 *      61J2-3.013, the hardship rule, defines hardship for post-licence and reactivation education
 *      and not for pre-licence education.
 *
 * None of the three is resolved here. Each is recorded on the source it belongs to, and each is a
 * written question for FREC before anything is submitted. A manifest that silently picked an answer
 * to any of them would be doing the exact thing this project built a source lock to prevent.
 *
 * LOCK AND DRIFT ARE DIFFERENT QUESTIONS AND ARE KEPT APART.
 *   FL_REGULATORY_SOURCE_LOCK  — can every authority this build depends on still be reached, is
 *                                every held copy present, and does every regulated fact asserted
 *                                downstream appear here? A missing authority FAILS the lock.
 *   FL_REGULATORY_SOURCE_DRIFT — has a held copy changed since it was read? A changed hash is not
 *                                by itself a change in the law; the Department reissues documents
 *                                for reasons that have nothing to do with what they require. Drift
 *                                blocks a filing, triggers a re-read, and is reported as drift
 *                                rather than as the lock failing, because a warning that cries wolf
 *                                is a warning nobody reads.
 *
 * WHAT IS DELIBERATELY ABSENT. There is no approval number, no permit number, no school licence
 * number and no course number in this file, because StateCourse holds none of those things in
 * Florida. Section 475.451(3), Fla. Stat. makes it unlawful to represent that a permit is any
 * recommendation or endorsement, and s. 475.4511(2) requires a school's publicity to be "based upon
 * relevant facts and supported by evidence establishing their truth". A placeholder approval number
 * in a config file is how a false claim reaches a page, so there are none to promote.
 */

export const MANIFEST_VERSION = "FL-MANIFEST-2026-08-30-v1";

/* How long a reading stays good before the lock demands it be taken again. Florida's education
   rules are amended often — 61J2-3.008 has been amended twenty-three times and three of the rules
   below changed within the last four years — and one of them, 61J2-17.015, carries its own sunset
   of 31 December 2026. Ninety days is the same window California and Texas use; nothing about
   Florida justifies a longer one. */
export const VERIFICATION_MAX_AGE_DAYS = 90;

export const REACHABILITY = Object.freeze({
  /* Opened, read, and held on disk. */
  READ: "READ",
  /* The publisher serves only a JavaScript shell to a non-browser client. */
  UNREACHABLE_JS_ONLY: "UNREACHABLE_JS_ONLY",
  /* The document exists but sits behind an authenticated portal. */
  UNREACHABLE_LOGIN_REQUIRED: "UNREACHABLE_LOGIN_REQUIRED",
  /* Searched for in the publisher's own index and not found there. */
  SEARCHED_NOT_FOUND: "SEARCHED_NOT_FOUND",
  /* Read, and deliberately not relied on. */
  READ_NOT_AUTHORITY: "READ_NOT_AUTHORITY",
});

/* WHAT KIND OF THING EACH SOURCE IS. Added in Phase 0 v2, because the first version treated every
   source as interchangeable and that is how an administrative rule came to be weighed above the
   statute it implements. The ordering here is the ordering used to resolve any disagreement:

     STATUTE       — controlling. Chapter 475 and Chapter 455, Fla. Stat.
     RULE          — controlling so far as consistent with, and authorised by, the statute it
                     implements. s. 120.52(8)(c), Fla. Stat. makes a rule that enlarges, modifies or
                     contravenes its enabling law an invalid exercise of delegated authority.
     INCORPORATED  — a document a rule adopts by reference, and therefore part of the rule.
     FORM          — a DBPR application. Administrative guidance, and strong evidence of the
                     Department's own reading of the law it administers. It cannot create a
                     requirement the law does not support, and it cannot remove an alternative the
                     statute expressly grants.
     GUIDANCE      — a DBPR checklist or information sheet. Same weight as a form, and useful
                     precisely because it says what a reviewer will look for.
     NAVIGATION    — a Department web page held to show where a document came from. Nothing rests
                     on it. */
export const AUTHORITY_CLASS = Object.freeze({
  STATUTE: "STATUTE",
  RULE: "RULE",
  INCORPORATED: "INCORPORATED",
  FORM: "FORM",
  GUIDANCE: "GUIDANCE",
  NAVIGATION: "NAVIGATION",
});

const source = (record) =>
  Object.freeze({
    ...record,
    materialClaims: Object.freeze((record.materialClaims ?? []).map((c) => Object.freeze({ ...c }))),
    conflicts: Object.freeze(record.conflicts ?? []),
  });

export const SOURCES = Object.freeze([
  source({
    id: "FS-475",
    authorityClass: AUTHORITY_CLASS.STATUTE,
    citation: "Ch. 475, Part I, Fla. Stat.",
    title: "Real Estate Brokers, Sales Associates, Schools, and Appraisers",
    publisher: "Florida Legislature, Online Sunshine (leg.state.fl.us) — the Legislature's own publication of the Florida Statutes",
    url: "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0475/0475.html",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/statutes/fs-chapter-475.html",
    sha256: "2f51cfa1180c00209103fdeb74450c5796febe9725ea7968f696441aed2c1938",
    bytes: 454172,
    materialClaims: Object.freeze([
      { claim: "475.17(2)(a)1 — the pre-license course for a sales associate may not exceed 63 classroom hours of 50 minutes each, INCLUSIVE of examination",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "475.17(2)(a)1 — a notice of satisfactory completion shall not be issued if the student has absences in excess of 8 classroom hours",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "475.17(2)(a)2 — a distance learning course is an approved option to classroom hours; satisfactory completion requires a TIMED distance learning course examination, and that examination shall NOT be required to be monitored or given at a centralized location",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "475.17(2)(a)3 — the course must be made available by correspondence or other suitable means to a person who by reason of hardship cannot attend or has no access to the distance learning course",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "475.451(1) — a person, school or institution offering a Commission-prescribed course must obtain a PERMIT from the department before commencing or continuing to offer it",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "475.451(2)(a) — the school permitholder must hold a broker licence, active or voluntarily inactive, or have passed a Commission-approved instructor's examination",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
      { claim: "475.451(2)(b)1 — an instructor permit requires a business-related bachelor's degree plus a valid Florida broker licence, or a bachelor's degree plus extensive real estate experience plus a valid Florida broker licence, or passing a Commission-approved instructor's examination",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
      { claim: "475.451(2)(b)3 — an instructor permit renewal requires at least 7 classroom or distance learning hours since the last issuance or renewal, and permits renew at least every 2 years",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
      { claim: "475.451(3) — it is unlawful to offer the courses without a permit, to guarantee that pupils will pass any licensure examination, or to represent that issuance of a permit is any recommendation or endorsement",
        reliedOnBy: Object.freeze(["config/florida/regulatory-manifest.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "475.451(6) — a Commission-prescribed pre-license course may be taught by distance learning by a CURRENTLY PERMITTED INSTRUCTOR of the school",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
      { claim: "475.451(8) — registration records, course rosters, attendance records, a file copy of each examination and progress test, and all student answer sheets must be kept at least 3 years after the beginning of each course and produced to the department on request",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "475.4511(2) — publicity and advertising of a real estate school shall be based upon relevant facts and supported by evidence establishing their truth",
        reliedOnBy: Object.freeze(["config/florida/regulatory-manifest.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "475.4511(3) — no representative of a school shall promise or guarantee employment or placement of a student as an inducement to enrol",
        reliedOnBy: Object.freeze(["config/florida/regulatory-manifest.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "FS-455",
    authorityClass: AUTHORITY_CLASS.STATUTE,
    citation: "Ch. 455, Fla. Stat.",
    title: "Business and Professional Regulation: General Provisions",
    publisher: "Florida Legislature, Online Sunshine (leg.state.fl.us)",
    url: "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0455/0455.html",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/statutes/fs-chapter-455.html",
    sha256: "f350124863bbdedbce5a4d42b3d4a3a504d37410f461b61c0669854e68c4afff",
    bytes: 266928,
    materialClaims: Object.freeze([
      { claim: "455.2123 — distance learning must be allowed for CONTINUING education and centralized examinations may not be required for it. Recorded here to mark what it is NOT: it is not the authority for pre-license examination siting, which is s. 475.17(2)(a)2, and nothing in this build may cite it for that.",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "FAC-61J2-3.008",
    authorityClass: AUTHORITY_CLASS.RULE,
    citation: "Rule 61J2-3.008, F.A.C.",
    title: "Pre-licensing Education for Broker and Sales Associate Applicants",
    publisher: "Florida Department of State, Division of Library and Information Services (flrules.org) — official publisher of the Florida Administrative Code",
    url: "https://www.flrules.org/gateway/ruleNo.asp?id=61J2-3.008",
    effectiveDate: "2022-08-21",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/fac-61J2-3.008.doc",
    sha256: "bbe1c9332a3a263388aa75b9773bf5db112e0bc9cfa097a91a4ccbe6319726da",
    bytes: 34304,
    materialClaims: Object.freeze([
      { claim: "(1) Course I consists of 63 hours of 50 minutes each, inclusive of examination, in the basic fundamentals of real estate principles and practices, basic real estate, and license law",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "(4)(a) a grade of 70% or higher on the Commission-prescribed end-of-course examination constitutes satisfactory course completion",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "(4)(b)3.1 distance learning study must be offered on a classroom hour per classroom hour basis",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(4)(b)3.2 distance learning must be interactive, providing for the interchange of information between the student and instructor, and must provide for registration, evaluation, monitoring and verification; a 50-minute distance hour is the equivalent of a 50-minute classroom hour",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(4)(b)3.3 pre-licensure courses shall NOT be offered by correspondence methods, except by reason of a hardship as defined by rule",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(4)(b)3.b the school must have alternative plans for uninterrupted learner services and technical support in the event of primary system failure",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(4)(b)3.c the school must have policies and technical processes to verify and document student identity for enrolment, course participation and course completion",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(4)(b)3.d course submissions must include a detailed course time-line, and the school must make the timeline available to students prior to enrolment",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(4)(b)3.e the school must present evidence by means of an OBJECTIVE STUDY that the stated course hours are consistent with the actual hours required to complete the course",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "(4)(b)3.f the school must describe in detail the objective method used to ensure students receive only the allotted time to complete the end-of-course examination",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(4)(b)3.g permitted instructors and technical staff must be available during normal business hours for student assistance, and that availability must be posted in a prominent location",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "config/florida/school-permit-ledger.mjs"]) },
      { claim: "(4)(b)3.h pre-licensing courses must conform to AND FOLLOW THE ORDER OF the Course I syllabus, must include learning objectives for each session of the syllabus, and the school must describe its method of assessing student performance periodically throughout the course",
        reliedOnBy: Object.freeze(["config/florida/frec-course-i-syllabus.mjs", "config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "(4)(b)3.i end-of-course examinations shall not include aids such as hint, back or retry functionality; there must be a reasonable method to prevent duplication of the examination; and students shall not take the end-of-course examination without satisfactorily completing all sessions of the syllabus",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "(4)(b)3.j the school must require the student to submit the certification statement quoted in CERTIFICATION_STATEMENT",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(4)(b) approval is based on the extent to which course content covers the Commission-developed syllabus; Course I submissions for classes offered on or after 1 January 2023 are evaluated against the January 1, 2023 revision, Ref-14599",
        reliedOnBy: Object.freeze(["config/florida/frec-course-i-syllabus.mjs"]) },
      { claim: "(4)(b) a school must obtain Commission approval at least 60 days before implementing any significant change to an approved course",
        reliedOnBy: Object.freeze(["florida/submission/frec-course-i-submission-plan.md"]) },
      { claim: "(4)(c) the Commission approves pre-licensure courses for 24 months; renewal is applied for no more than 120 days before expiry and must include the course materials, the end-of-course examinations and a summary of updates; schools must notify students of the course number and expiration date upon enrolment",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "florida/submission/frec-course-i-submission-plan.md"]) },
      { claim: "(4)(d) at least 2 forms of the end-of-course examination; no more than 15% duplication of questions between forms; a unique answer key per form; each answer key referencing the page numbers the question and correct answer rest on; at least 70% of items application level; no more than 10% knowledge level; a sufficient bank of questions to assure validity; at least 100 items or 2 items per instruction hour; all items multiple choice with 4 answer choices; the examination order may not follow the sequence of the course content; items must not refer the student to the course material; and overall examination time must not exceed the equivalent of 1.8 minutes per item",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "(5)(a) the school must inform each student of the standards and requirements at the commencement of each course",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(5)(b) for distance education the school and permitholder must give students an address, e-mail address and telephone number of a PERMITTED INSTRUCTOR registered with the school, and must communicate the times that instructor is available to assist",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "config/florida/school-permit-ledger.mjs"]) },
      { claim: "(6) a student failing the end-of-course examination must wait at least 30 days to retest and may retest a maximum of one time within one year of the original examination; otherwise the course must be repeated; a different form must be administered on a retake or a repeat",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "(8) an active member in good standing of The Florida Bar who is otherwise qualified is exempt from the prescribed prerequisite course for sales associate licensure",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(9) an applicant holding a 4-year or higher degree in real estate from an accredited institution of higher education is exempt from the prescribed prerequisite education courses",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
    ]),
    conflicts: Object.freeze([
      "(4)(d) fixes the sales associate end-of-course examination at \"at least 100 items, or 2 items per instruction hour\". Those are not the same number and the rule does not say which governs: 100 items, or 120 at two per each of the 60 instruction hours, or 126 at two per each of the 63 hours the course is defined in. The 1.8 minute per item limit in the same paragraph does NOT settle it, and it is worth being precise about why, because it looks as though it should. That limit is a CEILING on the time allowed (\"must not exceed the equivalent of 1.8 minutes per item\"), not an equality. The examination's own three 50-minute hours give 150 minutes, and 150 minutes is under the ceiling for every candidate count — 100 items allows 180, 120 allows 216, 126 allows 226.8. Every reading passes, so the ceiling disambiguates nothing. StateCourse therefore plans to the HIGHEST floor any reading produces, 126 items, because an examination that satisfies the largest floor satisfies all of them and 'at least' permits exceeding any of them. That puts 126 items in 150 minutes, or 1.19 minutes per item, within the ceiling. The reading is recorded here rather than buried in a config value, and it is carried to FREC as a written question, because planning to the safe end of an ambiguity is not the same as knowing the answer.",
    ]),
  }),
  source({
    id: "FREC-COURSE-I-SYLLABUS",
    authorityClass: AUTHORITY_CLASS.INCORPORATED,
    citation: "Ref-14599, incorporated by reference by Rule 61J2-3.008(4)(b), F.A.C.",
    title: "FREC Sales Associate Course Syllabus (FREC Course I), January 1, 2023 revision",
    publisher: "Florida Department of State, Division of Library and Information Services (flrules.org)",
    url: "https://www.flrules.org/gateway/reference.asp?No=Ref-14599",
    effectiveDate: "2023-01-01",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/ref-14599-frec-course-1-eff-010123.pdf",
    sha256: "0f15c68748c8839602b0782fe788f9fdb5dbdf3c256a7baade95e1ede067ab47",
    bytes: 10277379,
    materialClaims: Object.freeze([
      { claim: "nineteen sections, in the order the syllabus prints them; that order is itself a compliance requirement under Rule 61J2-3.008(4)(b)3.h",
        reliedOnBy: Object.freeze(["config/florida/frec-course-i-syllabus.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "page 2 — 'Section times are not required to be three hours in duration provided the overall course is 60-hours of instruction with 3-hour end-of-course examination. Allocate your time based upon the complexity of the material.' The syllabus allocates NO hours to any individual section.",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "page 2 — the syllabus's instructional guidance is expressed as SUGGESTED formatting and instructional techniques, not as mandatory pedagogy; what is mandatory is the content and its order",
        reliedOnBy: Object.freeze(["config/florida/frec-course-i-syllabus.mjs"]) },
    ]),
    conflicts: Object.freeze([
      "The document the Commission publishes is a 59-page scan with no text layer. Section titles recorded in this build were read by eye from its table of contents; the learning objectives were recovered by OCR and are recorded as unverified until a person reads them against the PDF. See config/florida/frec-course-i-syllabus.mjs.",
      "Section 19 is titled 'Planning, And Zoning' in the syllabus's table of contents and 'PLANNING, ZONING AND ENVIRONMENTAL HAZARDS' on the section itself. Both are recorded; neither is preferred here.",
    ]),
  }),
  source({
    id: "FAC-61J2-3.012",
    authorityClass: AUTHORITY_CLASS.RULE,
    citation: "Rule 61J2-3.012, F.A.C.",
    title: "Equivalency for Prelicensing Education",
    publisher: "Florida Department of State (flrules.org)",
    url: "https://www.flrules.org/gateway/ruleNo.asp?id=61J2-3.012",
    effectiveDate: "2017-12-24",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/fac-61J2-3.012.doc",
    sha256: "f4eab00e5229b87faf69eb518c0059547d945ebe1e72b5a001c29e7ea28ee8e8",
    bytes: 20992,
    materialClaims: Object.freeze([
      { claim: "prior coursework covering substantially the same subject matter, classroom hours of attendance and completion standards as Rule 61J2-3.008 prescribes is deemed satisfactory completion of the course",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "FAC-61J2-3.013",
    authorityClass: AUTHORITY_CLASS.RULE,
    citation: "Rule 61J2-3.013, F.A.C.",
    title: "Hardship Cases",
    publisher: "Florida Department of State (flrules.org)",
    url: "https://www.flrules.org/gateway/ruleNo.asp?id=61J2-3.013",
    effectiveDate: "2016-01-17",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/fac-61J2-3.013.doc",
    sha256: "760ab66a9f0581af576e71ea6977b643f8e013edaf17de819fa760b03a8720d8",
    bytes: 21504,
    materialClaims: Object.freeze([
      { claim: "hardship is defined for POST-licensing education and for reactivation education, and a person claiming it must apply to the Commission in writing",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
    ]),
    conflicts: Object.freeze([
      "Rule 61J2-3.008(4)(b)3.3 permits a pre-licensure course by correspondence 'by reason of a hardship as defined by rule', and s. 475.17(2)(a)3 requires such a route to exist. Rule 61J2-3.013 defines hardship for post-licensing education and for reactivation education, and does not on its face define it for PRE-licensing education. StateCourse does not build against a pre-license hardship definition it cannot find in the rules. Carried to FREC as a written question.",
    ]),
  }),
  source({
    id: "FAC-61J2-3.015",
    authorityClass: AUTHORITY_CLASS.RULE,
    citation: "Rule 61J2-3.015, F.A.C.",
    title: "Notices of Satisfactory Course Completion",
    publisher: "Florida Department of State (flrules.org)",
    url: "https://www.flrules.org/gateway/ruleNo.asp?id=61J2-3.015",
    effectiveDate: "2023-02-09",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/fac-61J2-3.015.doc",
    sha256: "5e01d7f599b3e70f902604891f6a2f48a2f6a9e34b18ab893e16d03c88fb327e",
    bytes: 26624,
    materialClaims: Object.freeze([
      { claim: "(1) an applicant for initial licensure must provide the course completion certificate at the scheduled state examination as proof of satisfactory completion",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(6)(a) the Course I completion certificate must carry: name of school, school licence number, address of school, the course title 'Course I', course number, start date, finish date, exam date, student name, student address, and an authorised signature for the school",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "(6)(f) every completion certificate must carry the Commission's prescribed sentence; the original goes to the student and the school keeps a copy for at least five years after completion",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(5) the certificate may be delivered electronically to the student; (7) the school's copy may be kept in any readily retrievable electronic or digital format",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "FAC-61J2-17.011",
    authorityClass: AUTHORITY_CLASS.RULE,
    citation: "Rule 61J2-17.011, F.A.C.",
    title: "School Instructor and Permit Holder Requirements and Qualifications",
    publisher: "Florida Department of State (flrules.org)",
    url: "https://www.flrules.org/gateway/ruleNo.asp?id=61J2-17.011",
    effectiveDate: "2023-01-01",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/fac-61J2-17.011.doc",
    sha256: "7b964b308ded0cae50b220e948e346859429c05da67477e8a4ab51c89412634b",
    bytes: 20992,
    materialClaims: Object.freeze([
      { claim: "(1) 'extensive real estate experience' means a minimum of three years full-time experience as a broker, including having participated in closing at least five real estate transactions as a licensee or as the employing broker of licensees, within the 12 months immediately preceding the instructor application",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
      { claim: "(2) the school permit holder must be the holder of a FLORIDA broker's licence",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs", "tests/florida-foundation.test.mjs"]) },
    ]),
    conflicts: Object.freeze([
      "(2) requires the school permit holder to meet 'the qualifications for practice set forth in Section 475.25(2)(a), F.S.' Section 475.25(2) is the revocation-for-mistake-or-inadvertence provision and has no paragraph (a) stating any qualification for practice; the provision the rule is plainly reaching for is s. 475.451(2)(a). The citation as adopted does not resolve. The rule's own operative sentence is unambiguous and is what StateCourse plans against — a Florida broker's licence — but the defect is recorded rather than tidied away, and so is its effect: it narrows the statutory alternative in s. 475.451(2)(a) of passing a Commission-approved instructor's examination. Carried to FREC as a written question.",
    ]),
  }),
  source({
    id: "FAC-61J2-17.013",
    authorityClass: AUTHORITY_CLASS.RULE,
    citation: "Rule 61J2-17.013, F.A.C.",
    title: "Interpretation of Particular Phrases",
    publisher: "Florida Department of State (flrules.org)",
    url: "https://www.flrules.org/gateway/ruleNo.asp?id=61J2-17.013",
    effectiveDate: "2022-06-30",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/fac-61J2-17.013.doc",
    sha256: "d76383f9498d49e0f8b74c55f231c8c4451fee707d8bc14091366f9f5580966b",
    bytes: 20480,
    materialClaims: Object.freeze([
      { claim: "'to guarantee that its pupils will pass any examinations required for licensure', prohibited by s. 475.451(3), is construed to include any representation, agreement, promise or understanding that a person will receive a refund of money or anything of value if they fail the Department's examination",
        reliedOnBy: Object.freeze(["config/florida/regulatory-manifest.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "'each person, school, or institution' in s. 475.451(1) is construed to include only one address or location, and a permit must be obtained for each address or location at which a course is offered or conducted",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "FAC-61J2-17.014",
    authorityClass: AUTHORITY_CLASS.RULE,
    citation: "Rule 61J2-17.014, F.A.C.",
    title: "Guest Lecturers",
    publisher: "Florida Department of State (flrules.org)",
    url: "https://www.flrules.org/gateway/ruleNo.asp?id=61J2-17.014",
    effectiveDate: "2022-06-30",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/fac-61J2-17.014.doc",
    sha256: "c52367de48a80942d2c328717b5c7792bdf3ab0886780d43cc50c015b2e1c9c5",
    bytes: 19968,
    materialClaims: Object.freeze([
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "FAC-61J2-17.015",
    authorityClass: AUTHORITY_CLASS.RULE,
    citation: "Rule 61J2-17.015, F.A.C.",
    title: "Required Communication by School Permit Holders",
    publisher: "Florida Department of State (flrules.org)",
    url: "https://www.flrules.org/gateway/ruleNo.asp?id=61J2-17.015",
    effectiveDate: "2021-11-03",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/fac-61J2-17.015.doc",
    sha256: "3876c357cde3548475aa11deffda44b90768418e48402c1069044bb8024dc5f7",
    bytes: 20992,
    materialClaims: Object.freeze([
      { claim: "(1) no school, permit holder or instructor may recruit for employment opportunities for any real estate brokerage firm during instructional time",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
      { claim: "(2) the permit holder must post in every classroom and administrative area, and read at the beginning of each course, the Commission's prescribed anti-recruiting statement",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "tests/florida-foundation.test.mjs"]) },
    ]),
    conflicts: Object.freeze([
      "(3) the rule expires on 31 December 2026 unless the Commission reviews it and acts before that date. A Florida build that ships after 31 December 2026 must re-read this rule rather than assume it survived.",
    ]),
  }),
  source({
    id: "FAC-61J2-17.016",
    authorityClass: AUTHORITY_CLASS.RULE,
    citation: "Rule 61J2-17.016, F.A.C.",
    title: "Renewal of Instructor Permits",
    publisher: "Florida Department of State (flrules.org)",
    url: "https://www.flrules.org/gateway/ruleNo.asp?id=61J2-17.016",
    effectiveDate: "2022-06-30",
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/fac-61J2-17.016.doc",
    sha256: "2b148c8aaf410450f88950028afbd7a99a49e94e10a0c43d8849b0b81ed389ce",
    bytes: 20992,
    materialClaims: Object.freeze([
      { claim: "instructor permits renew biennially on the schedule in Rule 61-6.001, F.A.C.; a permit not renewed reverts to involuntarily inactive status and expires after 2 years of inactivity",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "DBPR-SCHOOLS-PAGE",
    authorityClass: AUTHORITY_CLASS.NAVIGATION,
    citation: "DBPR, Division of Real Estate — real estate schools landing page",
    title: "myfloridalicense.com real estate schools page (navigation only; NOT an authority)",
    publisher: "Florida Department of Business and Professional Regulation",
    url: "https://www2.myfloridalicense.com/real-estate/schools/",
    reachability: REACHABILITY.READ_NOT_AUTHORITY,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/dbpr-real-estate-schools.html",
    sha256: "81ae412bbb6f321a78890d67bc4615b9a1ebe84be3f0884f68961af76ba06459",
    bytes: 197524,
    materialClaims: Object.freeze([
    ]),
    conflicts: Object.freeze([
      "Fetched and held so that the attempt is on the record, and recorded as NOT an authority because of what it turned out to be: a WordPress navigation shell whose real content is assembled client-side. It carries no school permit application, no instructor permit application, no fee schedule and no form number. So the DBPR school-permit application form could NOT be identified from the Department's own site in this environment, and no form number appears anywhere in this Florida build. Section 475.451(1), Fla. Stat. requires a permit; which paper obtains it is an open Phase 0 item, not a guess.",
      "The Department's public licensee search at myfloridalicense.com/wl11.asp timed out on every attempt from this environment, so no verification path through DBPR's own screens has been written. An unverified lookup procedure would defeat the purpose of publishing one.",
    ]),
  }),
  source({
    id: "FAC-61-35.027",
    citation: "Rule 61-35.027, F.A.C.",
    title: "Real Estate Forms — the rule that incorporates every DBPR RE form by reference",
    publisher: "Florida Department of State, Division of Library and Information Services (flrules.org)",
    url: "https://www.flrules.org/gateway/ruleNo.asp?id=61-35.027",
    effectiveDate: "2017-10-30",
    authorityClass: AUTHORITY_CLASS.RULE,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/fac/fac-61-35.027.doc",
    sha256: "1f98fc782917df37df12fef32d224518afd8553e3509ee6abc2eafb6a0515972",
    bytes: 32768,
    materialClaims: Object.freeze([
      { claim: "each DBPR RE application form is adopted by reference by this rule, so the form numbers and titles used in this build are traceable to a rule rather than to recollection",
        reliedOnBy: Object.freeze(["config/florida/dbpr-application-package.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "DBPR-RE-3",
    citation: "DBPR RE 3, incorporated by Rule 61-35.027, F.A.C.",
    title: "Application for Real Estate Instructor Permit (effective November 2015)",
    publisher: "Florida Department of Business and Professional Regulation, Florida Real Estate Commission",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_3_Instructor_Permit.pdf",
    authorityClass: AUTHORITY_CLASS.FORM,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_3_Instructor_Permit.pdf",
    sha256: "f000ade7979d6a6e7626bc90cc74461b15eb915efbbda4b77e0359966a12b42d",
    bytes: 139339,
    materialClaims: Object.freeze([
      { claim: "Section I offers three bases for instructor qualification, the FIRST being 'Real Estate Instructor Exam [1010]', which requires no broker licence — the Department administering s. 475.451(2)(b)1.c. on its own form",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "the instructor permit fee is $62.75 and electronic fingerprints are required of all applicants",
        reliedOnBy: Object.freeze(["config/florida/dbpr-application-package.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "DBPR-RE-5",
    citation: "DBPR RE 5, incorporated by Rule 61-35.027, F.A.C.",
    title: "Application for School Permit (effective May 2019)",
    publisher: "Florida Department of Business and Professional Regulation, Florida Real Estate Commission",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_5_School_Permit.pdf",
    authorityClass: AUTHORITY_CLASS.FORM,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_5_School_Permit.pdf",
    sha256: "524220645b89c1d40892d5c46c795bb3338bda52c321b9054c783b86d3cdd28e",
    bytes: 30826,
    materialClaims: Object.freeze([
      { claim: "Section I 'METHOD OF QUALIFICATION' offers TWO routes joined by 'or': 'Holding a license as a Florida Broker, either active or voluntarily inactive' with a Florida Broker License Number field, or 'Holder of a Florida Instructor's License' with an Instructor Permit Number field — the Department administering s. 475.451(2)(a) exactly as written",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "the form's own note: 'If permit holder is also teaching, the applicant must meet requirements of school instructor.'",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
      { claim: "the school permit fee is $109.00",
        reliedOnBy: Object.freeze(["config/florida/dbpr-application-package.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "DBPR-RE-6",
    citation: "DBPR RE 6, incorporated by Rule 61-35.027, F.A.C.",
    title: "School Change of Status Transactions",
    publisher: "Florida Department of Business and Professional Regulation, Florida Real Estate Commission",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_6_School_Change_of_Status_Transactions.pdf",
    authorityClass: AUTHORITY_CLASS.FORM,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_6_School_Change_of_Status_Transactions.pdf",
    sha256: "fbd5b4c918b00d496c31618bb05ee4a7c7b663173ccefc43bf458dd2fa2e1f82",
    bytes: 54555,
    materialClaims: Object.freeze([
      { claim: "the Change of School Permit Holder section states the qualification alternatives as 'Holding a license as a broker, either active or voluntarily inactive, or; Passing the Instructors Exam', with separate Broker License Number and Instructor License Number fields — a third independent corroboration of the statutory alternative",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "the Add/Terminate – Instructor transaction is how a permitted instructor is registered to a school, which is what Rule 61J2-3.008(5)(b) presupposes",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "DBPR-RE-9",
    citation: "DBPR RE 9, incorporated by Rule 61-35.027, F.A.C.",
    title: "Application for Additional School Location (effective June 2015)",
    publisher: "Florida Department of Business and Professional Regulation, Florida Real Estate Commission",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_9_Additional_School_Location.pdf",
    authorityClass: AUTHORITY_CLASS.FORM,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_9_Additional_School_Location.pdf",
    sha256: "06d11c7090a65e16927cd200c1fd98aeafe0743051a1fad3bc45a7d9af5e7e5f",
    bytes: 43740,
    materialClaims: Object.freeze([
      { claim: "opening an additional school location costs $50.00; closing one carries no fee",
        reliedOnBy: Object.freeze(["config/florida/dbpr-application-package.mjs"]) },
    ]),
    conflicts: Object.freeze([
      "Held so that the question can be asked against the actual instrument: whether a distance-only school with no Florida classroom has any 'additional location' to declare under Rule 61J2-17.013's one-permit-per-location construction is unresolved.",
    ]),
  }),
  source({
    id: "DBPR-RE-18",
    citation: "DBPR RE 18, incorporated by Rule 61-35.027, F.A.C.",
    title: "Education Course Approval Application",
    publisher: "Florida Department of Business and Professional Regulation, Florida Real Estate Commission",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_18_FRECEduCourseAppr.pdf",
    authorityClass: AUTHORITY_CLASS.FORM,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_18_FRECEduCourseAppr.pdf",
    sha256: "efa5cf453ce7b445b20ff84c6384d794386d432b8db8f64a6dd9a6e542b65846",
    bytes: 71667,
    materialClaims: Object.freeze([
      { claim: "Section III 'Type of Education' carries 'Sales Associate Pre-Licensure' as an explicit option, so this form governs FREC Course I approval notwithstanding the 'Continuing Education' wording in its running header",
        reliedOnBy: Object.freeze(["config/florida/dbpr-application-package.mjs", "florida/submission/frec-course-i-submission-plan.md"]) },
      { claim: "Section III delivery mechanisms are Classroom, Distance, Live stream, Correspondence (continuing education only), and Other; Section IV application types are NEW, RENEWAL and UPDATE",
        reliedOnBy: Object.freeze(["config/florida/dbpr-application-package.mjs"]) },
      { claim: "Section V requires of all initial course approvals: a course timed outline; learning objectives at THREE PER HOUR; course materials with an explanation of delivery method; form DBPR RE 19; instructor information on DBPR RE 20 with a resume (for Providers Only); FIVE end of course examinations for distance education courses only; and an answer key per form referencing the page numbers each question and correct answer rest on",
        reliedOnBy: Object.freeze(["config/florida/assessment-architecture.mjs", "config/florida/dbpr-application-package.mjs", "config/florida/school-permit-ledger.mjs"]) },
      { claim: "the course application fee is $80 per initial application and $80 per renewal for PROVIDERS, and $0 for schools",
        reliedOnBy: Object.freeze(["config/florida/dbpr-application-package.mjs"]) },
    ]),
    conflicts: Object.freeze([
      "Section V requires FIVE end-of-course examinations for distance education courses. Rule 61J2-3.008(4)(d) requires 'at least 2 forms', and the FREC Distance Education Checklist (rev. 06/2018) likewise lists 'Two end of course examinations'. The Department's own documents disagree with each other by three complete examination forms. StateCourse plans to five, which satisfies all three, and records that as provider policy rather than as a regulatory minimum. Carried to DBPR as a written question.",
      "Section V item 4 lists form DBPR RE 19 among the attachments for ALL initial course approvals, while item 5 immediately below is marked 'for Providers Only' and the Distance Education Checklist states elsewhere that licensed real estate schools need not fulfil the provider-only requirements. Whether a permitted school must file RE 19 is unresolved.",
    ]),
  }),
  source({
    id: "DBPR-RE-19",
    citation: "DBPR RE 19, incorporated by Rule 61-35.027, F.A.C.",
    title: "FREC Continuing Education Provider Approval Application",
    publisher: "Florida Department of Business and Professional Regulation, Florida Real Estate Commission",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_19_FREC_Continuing_Education_Provider_Approval_Application.pdf",
    authorityClass: AUTHORITY_CLASS.FORM,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/education/DBPR_RE_19_Provider_Approval.pdf",
    sha256: "5bcc3ca7c552f2f74ade5f2e004ec1585486f0596a41b1f47f8d4fdbe23f5d55",
    bytes: 26675,
    materialClaims: Object.freeze([
    ]),
    conflicts: Object.freeze([
      "Held because DBPR RE 18 names it. Approved CE provider is a different status from permitted real estate school, and whether a school filing Course I must also file this is an open question. Nothing in this build relies on it.",
    ]),
  }),
  source({
    id: "DBPR-RE-20",
    citation: "DBPR RE 20, incorporated by Rule 61-35.027, F.A.C.",
    title: "FREC Request for Instructor Evaluation",
    publisher: "Florida Department of Business and Professional Regulation, Florida Real Estate Commission",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_20_FRECRequestInstructorEval.pdf",
    authorityClass: AUTHORITY_CLASS.FORM,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_20_FRECRequestInstructorEval.pdf",
    sha256: "f04adeaa4d5db873a1d61693d2ae2a3ae6f5e391f66974d90f1dd90df23b193d",
    bytes: 251759,
    materialClaims: Object.freeze([
      { claim: "the FREC Distance Education Checklist states of RE 20 and the course fee that 'this is a requirement for approved providers only, licensed real estate schools do not need to fulfill this requirement'",
        reliedOnBy: Object.freeze(["config/florida/dbpr-application-package.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "DBPR-RE-14",
    citation: "DBPR RE 14, incorporated by Rule 61-35.027, F.A.C.",
    title: "Multiple Permit Request — Instructor",
    publisher: "Florida Department of Business and Professional Regulation, Florida Real Estate Commission",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_14_Multiple_Permit_Request_Instructor.pdf",
    authorityClass: AUTHORITY_CLASS.FORM,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_14_Multiple_Permit_Request_Instructor.pdf",
    sha256: "a04d1a7056407e900805c8d710a43db0b8ea562af0a38420186940e8dc076dc8",
    bytes: 41994,
    materialClaims: Object.freeze([
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "FREC-SYLLABUS-TEXT-LAYER",
    citation: "FREC Sales Associate Course Syllabus (FREC Course I), January 1, 2023 — Department's text-layer copy",
    title: "FREC1SyllabusCleanFinal01012023.pdf — the same syllabus Ref-14599 incorporates, published by DBPR with a real text layer",
    publisher: "Florida Department of Business and Professional Regulation, Division of Real Estate",
    url: "https://www2.myfloridalicense.com/re/documents/FREC1SyllabusCleanFinal01012023.pdf",
    authorityClass: AUTHORITY_CLASS.INCORPORATED,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/education/FREC1SyllabusCleanFinal01012023.pdf",
    sha256: "0a516a599d9eb2899dacfa4f35dff88b92c5f5dd4acc5dd8dc89a285d158e8bc",
    bytes: 283223,
    materialClaims: Object.freeze([
      { claim: "nineteen sections carrying 180 learning objectives in total, transcribed from the Department's own text layer rather than OCR, each with the printed page it appears on",
        reliedOnBy: Object.freeze(["config/florida/frec-course-i-syllabus.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "the per-section objective counts are 7, 11, 7, 10, 9, 9, 10, 8, 9, 10, 11, 9, 10, 10, 6, 16, 8, 9, 11, summing to 180",
        reliedOnBy: Object.freeze(["config/florida/frec-course-i-syllabus.mjs", "tests/florida-foundation.test.mjs"]) },
      { claim: "180 objectives is exactly three per instruction hour over 60 instruction hours, which is what DBPR RE 18 Section V independently requires",
        reliedOnBy: Object.freeze(["config/florida/frec-course-i-syllabus.mjs"]) },
    ]),
    conflicts: Object.freeze([
      "Section 19 is 'Planning, And Zoning' in the table of contents and 'PLANNING, ZONING AND ENVIRONMENTAL HAZARDS' on the section itself. Confirmed in the text layer, so the variance is in the Commission's document and not an artefact of transcription. Both are recorded.",
    ]),
  }),
  source({
    id: "FREC-DISTANCE-ED-CHECKLIST",
    citation: "FREC Distance Education Checklist (rev. 06/2018)",
    title: "What DBPR requires when applying to offer a FREC course by distance education",
    publisher: "Florida Department of Business and Professional Regulation, Division of Real Estate",
    url: "https://www2.myfloridalicense.com/re/documents/frec_distance_ed_chk_list.pdf",
    authorityClass: AUTHORITY_CLASS.GUIDANCE,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/education/frec_distance_ed_chk_list.pdf",
    sha256: "e1c01ff4ceefd9b83fee7bc67d2e1a93e5ae9192e0f9027b761169ee99c42e49",
    bytes: 143857,
    materialClaims: Object.freeze([
      { claim: "Sales Associate Pre Licensure courses 'can only be offered by Real Estate Schools licensed pursuant to Chapter 475.451, Florida Statutes'",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
      { claim: "'Courses are approved for a maximum of 63 hours' and the timeline must justify the hours 'in 50 minute hours'",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs", "config/florida/distance-delivery-matrix.mjs"]) },
      { claim: "'Learning objectives (3-per hour)'",
        reliedOnBy: Object.freeze(["config/florida/frec-course-i-syllabus.mjs", "config/florida/school-permit-ledger.mjs"]) },
      { claim: "'Two end of course examinations (multiple choice) and answer keys reflecting the page number where the answers can be found'",
        reliedOnBy: Object.freeze(["config/florida/assessment-architecture.mjs"]) },
    ]),
    conflicts: Object.freeze([
      "Says TWO end-of-course examinations where the current DBPR RE 18 says FIVE. See the conflict recorded against DBPR-RE-18.",
    ]),
  }),
  source({
    id: "FREC-ED-REQUIREMENTS",
    citation: "Real Estate (FREC) Educational Requirements (rev. 06/2018)",
    title: "DBPR's summary of the pre-licence, post-licence and continuing education requirements",
    publisher: "Florida Department of Business and Professional Regulation, Division of Real Estate",
    url: "https://www2.myfloridalicense.com/re/documents/real_estate_ed_requirements.pdf",
    authorityClass: AUTHORITY_CLASS.GUIDANCE,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/education/real_estate_ed_requirements.pdf",
    sha256: "7e5a5c504023cae978c9636be970262f73da398ade5dea7ecdfe3c5f6a7eb031",
    bytes: 18917,
    materialClaims: Object.freeze([
      { claim: "'63-hour course based on the FREC I syllabus Inclusive of Exam. These courses may be conducted in classroom and distance education environments.'",
        reliedOnBy: Object.freeze(["config/florida/course-i-requirements.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "FREC-CLASSROOM-CHECKLIST",
    citation: "FREC Classroom Checklist",
    title: "Held for contrast — the checklist StateCourse's distance course is not filed under",
    publisher: "Florida Department of Business and Professional Regulation, Division of Real Estate",
    url: "https://www2.myfloridalicense.com/re/documents/frec_classroom_chk_list.pdf",
    authorityClass: AUTHORITY_CLASS.GUIDANCE,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/education/frec_classroom_chk_list.pdf",
    sha256: "3f0bc48275c426f5b525d3529f96404f3dec5d66d8e498d547545460b9e72696",
    bytes: 169506,
    materialClaims: Object.freeze([
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "FREC-LIVESTREAM-CHECKLIST",
    citation: "Real Estate Livestream Checklist",
    title: "Held because Rule 61J2-3.008(2)(c) requires platform and delivery-method detail for live-streaming approval",
    publisher: "Florida Department of Business and Professional Regulation, Division of Real Estate",
    url: "https://www2.myfloridalicense.com/re/documents/RealEstateLivestreamChecklist.pdf",
    authorityClass: AUTHORITY_CLASS.GUIDANCE,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/education/RealEstateLivestreamChecklist.pdf",
    sha256: "ca1e8cb039db73682eca1e19e322bf20540684efcb38b092955d8f484b732fca",
    bytes: 102861,
    materialClaims: Object.freeze([
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "DBPR-INSTRUCTOR-REQUIREMENTS",
    citation: "Real Estate School Instructor Requirements for licensure in the State of Florida",
    title: "DBPR's own statement of the instructor qualification routes",
    publisher: "Florida Department of Business and Professional Regulation, Division of Real Estate",
    url: "https://www2.myfloridalicense.com/re/documents/REZHRequirements.pdf",
    authorityClass: AUTHORITY_CLASS.GUIDANCE,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/forms/REZHRequirements.pdf",
    sha256: "9e4709c907b9c8275703195cc65ece6075d248645da3f5fd1b47a79d74a41ebf",
    bytes: 15113,
    materialClaims: Object.freeze([
      { claim: "lists the three instructor routes, the third being 'Pass an Instructor Examination approved by the FREC' — a fourth corroboration that the examination route is real and administered",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
      { claim: "registration of an instructor to a school is done on DBPR RE 6",
        reliedOnBy: Object.freeze(["config/florida/school-permit-ledger.mjs"]) },
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "DBPR-PROVIDERS-COURSES-SHEET",
    citation: "Providers and Courses Information Sheet",
    title: "DBPR information sheet on providers and courses",
    publisher: "Florida Department of Business and Professional Regulation, Division of Real Estate",
    url: "https://www2.myfloridalicense.com/re/documents/providers_and_courses_information_sheet.pdf",
    authorityClass: AUTHORITY_CLASS.GUIDANCE,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/education/providers_and_courses_information_sheet.pdf",
    sha256: "778d5cf309fbd4b473b4f6642905cb473a83b801f814e4e4a2fb16261d2f3d26",
    bytes: 192806,
    materialClaims: Object.freeze([
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "DBPR-FORMS-PAGE",
    citation: "DBPR / FREC forms and publications page",
    title: "The page from which every DBPR RE form in this build was obtained",
    publisher: "Florida Department of Business and Professional Regulation",
    url: "https://www2.myfloridalicense.com/real-estate-commission/forms-and-publications/",
    authorityClass: AUTHORITY_CLASS.NAVIGATION,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/dbpr-frec-forms-and-publications.html",
    sha256: "f1821291526fdde83aaff785e99544ffea077de49991041ea970f6fb9f5681ce",
    bytes: 164583,
    materialClaims: Object.freeze([
    ]),
    conflicts: Object.freeze([
    ]),
  }),
  source({
    id: "DBPR-EDUCATION-PAGE",
    citation: "DBPR / FREC education page",
    title: "The page from which the syllabus text-layer copy and every checklist was obtained",
    publisher: "Florida Department of Business and Professional Regulation",
    url: "https://www2.myfloridalicense.com/real-estate-commission/education/",
    authorityClass: AUTHORITY_CLASS.NAVIGATION,
    reachability: REACHABILITY.READ,
    readOn: "2026-08-30",
    localCopy: "florida/frec-sources/dbpr/dbpr-frec-education.html",
    sha256: "d246dc05be77ccccf152f5e898c1a834191f7b15c363013802ba0a537409040c",
    bytes: 195252,
    materialClaims: Object.freeze([
    ]),
    conflicts: Object.freeze([
    ]),
  }),
]);

/* ── the programme ────────────────────────────────────────────────────────────────────────────
   Florida is ONE course to first licensure as a sales associate, not a stack of them. That is a
   real difference from the other states in this repository and it is stated here so that nothing
   downstream models Florida on a neighbour: California is three 45-hour statutory courses, Texas is
   six 30-hour courses totalling 180, and Florida is a single 63-hour Course I. Reading a course
   architecture across from either of them would be wrong in a way that is expensive to unwind. */
export const PROGRAMS = Object.freeze([
  Object.freeze({
    courseId: "fl-sales-associate-course-i-63-v1",
    commissionName: "Course I",
    publicName: "Florida Sales Associate Pre-License Course — FREC Course I",
    licenseSought: "Florida real estate sales associate",
    totalHours: 63,
    hourIsMinutes: 50,
    hoursIncludeExamination: true,
    instructionHours: 60,
    examinationHours: 3,
    syllabus: "Ref-14599",
    authority: "s. 475.17(2)(a)1, Fla. Stat.; Rule 61J2-3.008(1), F.A.C.",
  }),
]);

/* The pathway, stated so that no page can imply the course is the licence. */
export const PATHWAY = Object.freeze({
  totalPreLicenseHours: 63,
  courseIds: Object.freeze(["fl-sales-associate-course-i-63-v1"]),
  modelledAsSingleCourse: true,
  /* Rule 61J2-3.008(3)(a): satisfactory completion "will not entitle any person to receive a
     license ... until such person has met all other requirements of law and has passed the
     applicable Commission-approved state examination which DBPR administers." */
  courseAloneConfersLicence: false,
});

/* ── what StateCourse actually holds in Florida ───────────────────────────────────────────────
   Everything here is null or false, and that is the point. Approval status, build status and
   enrolment status are three separate facts in this project, and Florida currently has none of the
   first, some of the second, and none of the third. */
export const SCHOOL = Object.freeze({
  jurisdiction: "FL",
  regulator: "Florida Real Estate Commission, Division of Real Estate, Department of Business and Professional Regulation",
  schoolPermitHeld: false,
  schoolPermitNumber: null,
  schoolLicenceNumber: null,
  instructorPermitHeld: false,
  instructorPermitNumber: null,
  courseApprovalHeld: false,
  courseNumber: null,
  applicationFiled: false,
  enrolmentEnabled: false,
  statement:
    "StateCourse holds no Florida school permit, no Florida instructor permit and no FREC course approval, and has filed no application with the Department. No Florida course may be offered, advertised as approved, or enrolled in.",
  /* CORRECTED IN PHASE 0 v2. The first version of this record carried a `blockingGate` asserting
     that Rule 61J2-17.011(2) requires a FLORIDA broker's licence of the school permitholder and
     that no StateCourse individual could therefore sign an application. That was wrong on the law.
     Section 475.451(2)(a), Fla. Stat. states two alternatives — a broker licence "or ... an
     instructor's examination approved by the commission" — and the rule's scoped second sentence
     conditions only the broker branch. DBPR RE 5, RE 6 and RE 3 all carry the examination route on
     their face. There is no blocking gate. There is a route nobody has walked yet.

     What is true is the plain fact below: nothing is held, nothing is filed, and no person is
     asserted to be eligible. Eligibility is a determination the Department makes on an application.
     The full analysis and the seven-row status matrix live in
     config/florida/school-permit-ledger.mjs. */
  blockingGate: null,
  lawfulRouteToSchoolPermitExists: true,
  lawfulRouteToInstructorPermitExists: true,
  routeTaken: false,
  anyPersonAssertedEligible: false,
  routeSummary:
    "Pass the Commission-approved instructor examination, file DBPR RE 3 under basis [1010], obtain the instructor permit, then file DBPR RE 5 naming that permit as the method of qualification. The Florida broker-licence route remains open to anyone who holds one.",
});

/* ── claims this build may never make ─────────────────────────────────────────────────────────
   Two of these are not house style. They are Florida law.

     s. 475.451(3), Fla. Stat. makes it unlawful to guarantee that pupils will pass any examination
     required for licensure, or to represent that the issuance of a permit is any recommendation or
     endorsement. Rule 61J2-17.013, F.A.C. construes the guarantee prohibition to reach a pass-or-
     refund promise, which is exactly the shape a marketing page reaches for first.

     s. 475.4511(2), Fla. Stat. requires a school's publicity to be "based upon relevant facts and
     supported by evidence establishing their truth" — which is, almost word for word, the rule this
     project already enforces with a source lock, except that in Florida it is a statute and a
     second-degree misdemeanour under s. 475.451(4) to breach the permit provisions.

   So the source lock is not merely good practice in Florida. It is the mechanism by which the
   school stays lawful. */
export const FORBIDDEN_CLAIMS = Object.freeze([
  Object.freeze({ id: "pass-guarantee", pattern: /\b(guarantee|guaranteed|guarantees)\b[^.]{0,60}\b(pass|passing)\b/i,
    why: "s. 475.451(3), Fla. Stat.; Rule 61J2-17.013, F.A.C." }),
  Object.freeze({ id: "pass-or-refund", pattern: /\b(pass\s+or\s+(your\s+)?money\s+back|money[- ]back\s+(if|unless)[^.]{0,40}\b(pass|fail))/i,
    why: "Rule 61J2-17.013, F.A.C. construes a pass-or-refund promise as a prohibited guarantee" }),
  Object.freeze({ id: "permit-as-endorsement", pattern: /\b(permit|approval|licen[cs]e)\b[^.]{0,50}\b(endorse|endorsement|recommend|recommendation)\b/i,
    why: "s. 475.451(3), Fla. Stat." }),
  Object.freeze({ id: "employment-promise", pattern: /\b(guarantee|promise)[^.]{0,40}\b(job|employment|placement)\b/i,
    why: "s. 475.4511(3), Fla. Stat." }),
  Object.freeze({ id: "unheld-frec-approval", pattern: /\bFREC[- ]approved\b|\bapproved by the Florida Real Estate Commission\b/i,
    why: "no such approval is held; s. 475.4511(2), Fla. Stat. requires publicity to rest on evidence" }),
  Object.freeze({ id: "unheld-school-permit", pattern: /\b(permitted|licensed|registered)\s+Florida\s+real\s+estate\s+school\b/i,
    why: "no Florida school permit is held; s. 475.451(1), Fla. Stat. requires one before a course may be offered and s. 475.4511(2) requires publicity to rest on evidence" }),
]);

/* ── helpers ─────────────────────────────────────────────────────────────────────────────────── */

export function sourceById(id) {
  return SOURCES.find((s) => s.id === id) ?? null;
}

/** Authorities whose reading has aged past the verification window. Returned rather than thrown so
    that a caller can report every stale source at once instead of the first one. */
export function staleAuthorities(asOf = new Date()) {
  const cutoff = new Date(asOf.getTime() - VERIFICATION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  return SOURCES.filter((s) => new Date(s.readOn) < cutoff).map((s) => ({ id: s.id, readOn: s.readOn, citation: s.citation }));
}

/** Every regulated fact this build is allowed to assert, flattened with its source. The lock uses
    this to refuse a claim that appears downstream without appearing here. */
export function allMaterialClaims() {
  return SOURCES.flatMap((s) => s.materialClaims.map((c) => ({ sourceId: s.id, citation: s.citation, ...c })));
}

/** Every disagreement found between or within the authorities, with the source it sits on. These
    are open questions for FREC, not settled readings, and nothing downstream may treat one as
    settled by consuming it. */
export function openConflicts() {
  return SOURCES.flatMap((s) => s.conflicts.map((text) => ({ sourceId: s.id, citation: s.citation, conflict: text })));
}

export default Object.freeze({
  MANIFEST_VERSION,
  VERIFICATION_MAX_AGE_DAYS,
  REACHABILITY,
  SOURCES,
  PROGRAMS,
  PATHWAY,
  SCHOOL,
  FORBIDDEN_CLAIMS,
  sourceById,
  staleAuthorities,
  allMaterialClaims,
  openConflicts,
});
