/**
 * Florida — the DBPR application package, as it actually exists.
 *
 * WHY THIS FILE REPLACES A GAP. Phase 0 v1 reported that no DBPR application or form number could
 * be obtained, and recorded that as an honest limitation. It was an honest limitation and it was
 * also an incomplete gate, and the reason it happened is worth writing down so it does not happen
 * again: the first attempt fetched https://www2.myfloridalicense.com/real-estate/forms/, got HTTP
 * 200, and concluded the Department served no forms. That URL is a soft-404. It returns 200 and
 * serves the ELEVATOR SAFETY forms page. Several sibling URLs return 200 with byte-identical
 * navigation shells. A 200 is not evidence that the page you asked for exists.
 *
 * The real forms live at https://www2.myfloridalicense.com/real-estate-commission/forms-and-publications/
 * and https://www2.myfloridalicense.com/real-estate-commission/education/, and every form below was
 * downloaded from there, hashed, and read.
 *
 * THE AUTHORITY QUESTION, ANSWERED BEFORE THE FORMS ARE LISTED. A DBPR application is not law. It
 * is the Department's own instrument for administering the law, and this project classifies it that
 * way deliberately:
 *
 *   STATUTE (Ch. 475, Fla. Stat.)  — controlling. Says what may and must be required.
 *   RULE (Ch. 61J2, F.A.C.)        — controlling so far as it is consistent with, and authorised
 *                                    by, the statute it implements.
 *   FORM / CHECKLIST (DBPR)        — administrative guidance and application evidence. It shows how
 *                                    the Department administers the law and is strong evidence of
 *                                    the Department's own reading. It cannot create a requirement
 *                                    the statute and rule do not support, and it cannot remove an
 *                                    alternative the statute expressly grants.
 *
 * That ordering matters twice in this file. It is why DBPR RE 5's two qualification checkboxes are
 * treated as CORROBORATION of s. 475.451(2)(a) rather than as its source. And it is why the
 * five-examination requirement on DBPR RE 18 is recorded as an administrative requirement sitting
 * above a rule minimum of two, rather than as a discovery that the rule "really means" five.
 *
 * WHERE THE DEPARTMENT'S OWN DOCUMENTS DISAGREE WITH EACH OTHER. They do, in one place that matters
 * for the build, and it is recorded rather than averaged away. See EXAMINATION_FORM_COUNT_CONFLICT.
 */

const form = (record) => Object.freeze({ obtained: true, ...record });

/* Every DBPR RE form is adopted by Rule 61-35.027, F.A.C., "Real Estate Forms", which incorporates
   each by reference. So the form numbers and titles below are not folklore — they are traceable to
   a rule, and each form's own header states the incorporating rule and its effective date. */
export const FORMS_ADOPTED_BY = Object.freeze({
  rule: "Rule 61-35.027, F.A.C.",
  title: "Real Estate Forms",
  effectiveDate: "2017-10-30",
  localCopy: "florida/frec-sources/fac/fac-61-35.027.doc",
  note: "Each form below carries, in its own header, the line 'Incorporated by Rule: 61-35.027'.",
});

export const FORMS = Object.freeze([
  form({
    id: "RE-3",
    number: "DBPR RE 3",
    titleOnForm: "Application for Real Estate Instructor Permit",
    headerTitle: "DBPR RE 3 Instructor License Application",
    effective: "November 2015",
    pages: 10,
    fee: "$62.75",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_3_Instructor_Permit.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_3_Instructor_Permit.pdf",
    governs: "the instructor permit required by s. 475.451(2)(b), Fla. Stat.",
    /* Section I of the form. This is the corroboration that matters most in the whole package: the
       Department's own application offers the examination as a first-class basis of qualification,
       on equal footing with the two degree-plus-broker-licence routes. */
    qualificationRoutesOnForm: Object.freeze([
      Object.freeze({ code: "1010", label: "Real Estate Instructor Exam", requiresFloridaBrokerLicence: false }),
      Object.freeze({ code: "1030", label: "Specific Degree & Broker's License", requiresFloridaBrokerLicence: true }),
      Object.freeze({ code: "1040", label: "Degree, Extensive Experience, & Broker's License", requiresFloridaBrokerLicence: true }),
    ]),
    alsoRequires: Object.freeze([
      "electronic fingerprints",
      "official certified transcripts evidencing the degree, for the two degree-based routes",
      "proof of extensive real estate experience, for the degree-plus-experience route",
    ]),
  }),

  form({
    id: "RE-5",
    number: "DBPR RE 5",
    titleOnForm: "Application for School Permit",
    headerTitle: "DBPR RE 5 School Permit Application",
    effective: "May 2019",
    pages: 4,
    fee: "$109.00",
    licenseCode: "[2506/1020]",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_5_School_Permit.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_5_School_Permit.pdf",
    governs: "the school permit required by s. 475.451(1), Fla. Stat.",
    /* Section I, "METHOD OF QUALIFICATION", reproduced in substance. Two checkboxes joined by "or".
       This is the Department administering s. 475.451(2)(a) exactly as the statute is written. */
    qualificationRoutesOnForm: Object.freeze([
      Object.freeze({ label: "Holding a license as a Florida Broker, either active or voluntarily inactive", capturedField: "Florida Broker License Number", requiresFloridaBrokerLicence: true }),
      Object.freeze({ label: "Holder of a Florida Instructor's License", capturedField: "Instructor Permit Number", requiresFloridaBrokerLicence: false }),
    ]),
    /* The form's own note, which answers the "what if the permitholder teaches" question directly. */
    noteOnForm: "If permit holder is also teaching, the applicant must meet requirements of school instructor.",
  }),

  form({
    id: "RE-6",
    number: "DBPR RE 6",
    titleOnForm: "School Change of Status Transactions",
    effective: null,
    pages: 6,
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_6_School_Change_of_Status_Transactions.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_6_School_Change_of_Status_Transactions.pdf",
    governs: "post-permit changes to a permitted school",
    transactionTypes: Object.freeze([
      "Change of School Permit Holder [2506/9007]",
      "Add/Terminate – Instructor [2505/9007]",
      "Change Name of School [2506/9006]",
      "Change Address of School [2506/9006]",
    ]),
    /* A third independent corroboration of the statutory alternative, in the Department's own words
       on the Change of School Permit Holder section: "Qualified to hold school permit through:
       Holding a license as a broker, either active or voluntarily inactive, or; Passing the
       Instructors Exam", with separate fields for Broker License Number and Instructor License
       Number. */
    qualificationRoutesOnForm: Object.freeze([
      Object.freeze({ label: "Holding a license as a broker, either active or voluntarily inactive", requiresFloridaBrokerLicence: true }),
      Object.freeze({ label: "Passing the Instructors Exam", requiresFloridaBrokerLicence: false }),
    ]),
    relevanceToStateCourse:
      "Not needed to open. Needed afterwards: this is the form that registers each instructor to the school (Add/Terminate – Instructor), which is how the permitted instructor whose contact details Rule 61J2-3.008(5)(b) requires becomes registered with the school.",
  }),

  form({
    id: "RE-9",
    number: "DBPR RE 9",
    titleOnForm: "Application for Additional School Location",
    headerTitle: "DBPR RE 9 School Additional Location",
    effective: "June 2015",
    pages: 4,
    fee: "$50.00 to open an additional location; no fee to close one",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_9_Additional_School_Location.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_9_Additional_School_Location.pdf",
    governs: "the one-permit-per-location construction in Rule 61J2-17.013, F.A.C.",
    relevanceToStateCourse:
      "Probably none, and deliberately not assumed either way. StateCourse would operate no Florida classroom. Whether a distance-only school has any 'additional location' to declare is an open question for DBPR; the form is held so the question can be asked against the actual instrument.",
  }),

  form({
    id: "RE-18",
    number: "DBPR RE 18",
    titleOnForm: "Education Course Approval Application",
    headerTitle: "DBPR RE 18 FREC Continuing Education Course Approval Application",
    pages: 6,
    fee: "$80 per initial application and $80 per renewal for PROVIDERS; $0 for schools",
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_18_FRECEduCourseAppr.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_18_FRECEduCourseAppr.pdf",
    governs: "course approval, including FREC Course I",
    /* The header says "Continuing Education Course Approval Application" and the body title says
       "Education Course Approval Application". The header is the misleading one: Section III's
       "Type of Education" list carries "Sales Associate Pre-Licensure" as an explicit option, and
       Rule 61J2-3.008(4)(c) names this form for pre-licensure course RENEWAL. So RE 18 is the
       course approval form for FREC Course I despite what its running header says. */
    headerTitleIsMisleading: true,
    courseTypesOnForm: Object.freeze([
      "Sales Associate Pre-Licensure",
      "Sales Associate Post-Licensure",
      "Broker Pre-Licensure",
      "Broker Post-Licensure",
      "Core Law",
      "Specialty",
      "Ethics and Business Practices",
      "Combination Law, Specialty and Ethics and Business Practices",
      "Reactivation Course",
    ]),
    deliveryMechanismsOnForm: Object.freeze(["Classroom", "Distance", "Live stream", "Correspondence (continuing education only)", "Other"]),
    applicationTypesOnForm: Object.freeze(["NEW", "RENEWAL", "UPDATE"]),
    initialApprovalAttachments: Object.freeze([
      "Course timed outline specifying subjects, major topics, and subtopics",
      "Learning Objectives — three per hour",
      "Course materials including explanation of delivery method",
      "Education Provider Approval Application form DBPR RE 19",
      "Instructor Information (for Providers Only): DBPR RE 20 per instructor, plus a resume",
      "Five end of course examinations (for distance education courses only), multiple choice with 4 answer choices per question",
      "Answer keys (for distance education courses only), referencing the page numbers on which each question and correct answer is based",
    ]),
    renewalAttachments: Object.freeze([
      "The original course approval letter received from DBPR",
      "Instructor information, if changed since initial approval (Providers Only)",
    ]),
  }),

  form({
    id: "RE-19",
    number: "DBPR RE 19",
    titleOnForm: "FREC Continuing Education Provider Approval Application",
    pages: 4,
    localCopy: "florida/frec-sources/dbpr/education/DBPR_RE_19_Provider_Approval.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_19_FREC_Continuing_Education_Provider_Approval_Application.pdf",
    governs: "approval as a continuing education PROVIDER, which is a different status from a permitted school",
    /* RE 18's attachment list names RE 19 without a "Providers Only" qualifier, while the very next
       line carries one. A permitted real estate school is not the same thing as an approved CE
       provider, and the distance-education checklist says elsewhere that RE 20 and the fee are for
       "approved providers only, licensed real estate schools do not need to fulfill this
       requirement". Whether a permitted school filing Course I must also file RE 19 is therefore
       genuinely unclear on the face of the documents, and is an open question rather than a guess. */
    appliesToStateCourse: null,
  }),

  form({
    id: "RE-20",
    number: "DBPR RE 20",
    titleOnForm: "FREC Request for Instructor Evaluation",
    pages: 2,
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_20_FRECRequestInstructorEval.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_20_FRECRequestInstructorEval.pdf",
    governs: "instructor evaluation submitted with a course application",
    relevanceToStateCourse:
      "Stated by the Department to be a requirement for approved providers only: the distance education checklist says of RE 20 and the course fee that 'this is a requirement for approved providers only, licensed real estate schools do not need to fulfill this requirement'. A permitted school should not need it, and that reading is the Department's own.",
  }),

  form({
    id: "RE-14",
    number: "DBPR RE 14",
    titleOnForm: "Multiple Permit Request — Instructor",
    pages: 4,
    localCopy: "florida/frec-sources/dbpr/forms/DBPR_RE_14_Multiple_Permit_Request_Instructor.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/DBPR_RE_14_Multiple_Permit_Request_Instructor.pdf",
    governs: "s. 475.451(7), Fla. Stat. — additional permits to one permitholder",
    relevanceToStateCourse: "None at opening. Held for completeness of the package.",
  }),
]);

/* ── the Department's own guidance documents ──────────────────────────────────────────────────
   Not forms, not law: checklists and information sheets the Division publishes to say how it
   administers the rules. They are the best available evidence of what a reviewer will actually look
   for, and they are also where two of this build's open questions come from. */
export const GUIDANCE = Object.freeze([
  Object.freeze({
    id: "DISTANCE-ED-CHECKLIST",
    title: "FREC Distance Education Checklist",
    revised: "06/2018",
    pages: 7,
    localCopy: "florida/frec-sources/dbpr/education/frec_distance_ed_chk_list.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/frec_distance_ed_chk_list.pdf",
    keyStatements: Object.freeze([
      "Sales Associate Pre Licensure courses 'can only be offered by Real Estate Schools licensed pursuant to Chapter 475.451, Florida Statutes.'",
      "'Courses are approved for a maximum of 63 hours.'",
      "'All courses must be based on the FREC I syllabus.'",
      "'Timeline justifying the hours requested on your application. (50 minute hours)'",
      "'Learning objectives (3-per hour)'",
      "'Two end of course examinations (multiple choice) and answer keys reflecting the page number where the answers can be found.'",
      "Repeats the Rule 61J2-3.008(4)(b)3 distance criteria, including identity verification, the objective time study, the examination time control, the prohibition on hint/back/retry, and the student certification statement.",
    ]),
  }),
  Object.freeze({
    id: "ED-REQUIREMENTS",
    title: "Real Estate (FREC) Educational Requirements",
    revised: "06/2018",
    pages: 2,
    localCopy: "florida/frec-sources/dbpr/education/real_estate_ed_requirements.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/real_estate_ed_requirements.pdf",
    keyStatements: Object.freeze([
      "'63-hour course based on the FREC I syllabus Inclusive of Exam.'",
      "'These courses may be conducted in classroom and distance education environments.'",
    ]),
  }),
  Object.freeze({
    id: "CLASSROOM-CHECKLIST",
    title: "FREC Classroom Checklist",
    pages: 3,
    localCopy: "florida/frec-sources/dbpr/education/frec_classroom_chk_list.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/frec_classroom_chk_list.pdf",
    keyStatements: Object.freeze(["Held for contrast: it is the checklist StateCourse's course is NOT filed under."]),
  }),
  Object.freeze({
    id: "LIVESTREAM-CHECKLIST",
    title: "Real Estate Livestream Checklist",
    pages: 3,
    localCopy: "florida/frec-sources/dbpr/education/RealEstateLivestreamChecklist.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/RealEstateLivestreamChecklist.pdf",
    keyStatements: Object.freeze(["Held because Rule 61J2-3.008(2)(c) requires a school seeking live-streaming approval to submit delivery-method and platform information at course submission."]),
  }),
  Object.freeze({
    id: "INSTRUCTOR-REQUIREMENTS",
    title: "Real Estate School Instructor Requirements for licensure in the State of Florida",
    pages: 1,
    localCopy: "florida/frec-sources/dbpr/forms/REZHRequirements.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/REZHRequirements.pdf",
    keyStatements: Object.freeze([
      "Lists the three statutory instructor routes, the third being 'Pass an Instructor Examination approved by the FREC.'",
      "'Submit a completed DBPR RE 6-Become Active-Real Estate Instructor form to register as a Real Estate Instructor for a real estate school.'",
      "'The continuing education requirement for a real estate instructor is a minimum of 7 classroom hours.'",
    ]),
  }),
  Object.freeze({
    id: "PROVIDERS-AND-COURSES",
    title: "Providers and Courses Information Sheet",
    pages: 3,
    localCopy: "florida/frec-sources/dbpr/education/providers_and_courses_information_sheet.pdf",
    url: "https://www2.myfloridalicense.com/re/documents/providers_and_courses_information_sheet.pdf",
    keyStatements: Object.freeze(["Held as part of the package."]),
  }),
]);

/* ── the disagreement inside the Department's own package ─────────────────────────────────────
   Recorded here rather than resolved, because resolving it by picking a number is exactly the move
   this project does not make. */
export const EXAMINATION_FORM_COUNT_CONFLICT = Object.freeze({
  id: "examination-form-count",
  ruleMinimum: 2,
  ruleCite: "Rule 61J2-3.008(4)(d), F.A.C. — 'The school shall develop at least 2 forms of the end-of-course examination'",
  checklistSays: 2,
  checklistCite: "FREC Distance Education Checklist (rev. 06/2018) — 'Two end of course examinations (multiple choice) and answer keys'",
  applicationSays: 5,
  applicationCite: "DBPR RE 18, Section V — 'Five end of course examinations (for distance education courses only)'",
  analysis:
    "The rule sets a floor of two and the checklist restates it. The current application form asks for five, for distance education specifically, which is what StateCourse would be filing. Two readings are defensible: that RE 18 states an administrative submission requirement the Department is entitled to set above the rule floor, or that RE 18 carries an error. Nothing in the package resolves it, and the difference is three complete examination forms of build work.",
  stateCourseposture:
    "Build to five. Five satisfies the rule floor, the checklist, and the application at once, and 'at least 2' permits more. Recorded as provider policy driven by an administrative requirement, NOT as a regulatory minimum.",
  openQuestion: true,
});

export function formById(id) {
  return FORMS.find((f) => f.id === id) ?? null;
}

export default Object.freeze({
  FORMS_ADOPTED_BY,
  FORMS,
  GUIDANCE,
  EXAMINATION_FORM_COUNT_CONFLICT,
  formById,
});
