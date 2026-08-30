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
 *      mistake and has no paragraph (a) of that kind. The cross-reference does not resolve.
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

const source = (record) =>
  Object.freeze({
    ...record,
    materialClaims: Object.freeze((record.materialClaims ?? []).map((c) => Object.freeze({ ...c }))),
    conflicts: Object.freeze(record.conflicts ?? []),
  });

export const SOURCES = Object.freeze([
  source({
    id: "FS-475",
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
  }),]);

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
  /* The single hardest gate, found in Phase 0 and stated here rather than in a report nobody
     re-reads. Rule 61J2-17.011(2), F.A.C. requires the school permit holder to hold a FLORIDA
     broker's licence. StateCourse's principal holds California broker licence 01385024 and no
     Florida licence. Section 475.451(2)(a), Fla. Stat. offers an alternative — passing a
     Commission-approved instructor's examination — but the rule's own operative sentence appears to
     close it for the permitholder. Until a Florida-licensed broker is the permitholder, or that
     reading is corrected by FREC, a Florida school permit application cannot be completed. */
  blockingGate: "school-permitholder-florida-broker-licence",
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
